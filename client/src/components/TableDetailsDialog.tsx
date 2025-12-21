import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { 
  UsersThree, 
  Clock as ClockIcon, 
  Trash as TrashIcon, 
  SplitVertical, 
  Plus as PlusIcon, 
  Receipt as ReceiptIcon, 
  ArrowsClockwise, 
  ShoppingBag as ShoppingBagIcon, 
  CaretLeft, 
  CaretRight 
} from '@phosphor-icons/react';
import { formatKwanza } from '@/lib/formatters';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useMutation, useQuery } from '@tanstack/react-query';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { useKeyboardShortcuts } from '@/hooks/useKeyboardShortcuts';
import { FinancialDashboard } from '@/components/FinancialDashboard';
import { BillSplitPanel } from '@/components/BillSplitPanel';
import { TableOrderDialog } from '@/components/tables/TableOrderDialog';
import { TableGuestsManager } from '@/components/tables/TableGuestsManager';
import { TableCheckoutDialog } from '@/components/tables/TableCheckoutDialog';
import { OrderDetailsDialog } from '@/components/order-details-dialog';
import { OrderCard } from '@/components/OrderCard';
import type { Table } from '@shared/schema';

interface TableDetailsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  table: (Table & { orders?: any[] }) | null;
  onDelete?: (tableId: string) => void;
  allTables?: (Table & { orders?: any[] })[];
  onNavigate?: (table: Table & { orders?: any[] }) => void;
}

const getStatusLabel = (status: string) => {
  const labels: Record<string, string> = {
    livre: 'Disponível',
    ocupada: 'Ocupada',
    em_andamento: 'Em Andamento',
    aguardando_pagamento: 'Aguardando Pagamento',
    encerrada: 'Encerrada',
  };
  return labels[status] || status;
};

export function TableDetailsDialog({ open, onOpenChange, table, onDelete, allTables = [], onNavigate }: TableDetailsDialogProps) {
  const { toast } = useToast();
  const { user } = useAuth();
  const [customerName, setCustomerName] = useState('');
  const [customerCount, setCustomerCount] = useState('');
  const [showEndSessionDialog, setShowEndSessionDialog] = useState(false);
  const [showNewOrderDialog, setShowNewOrderDialog] = useState(false);
  const [showCheckoutDialog, setShowCheckoutDialog] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const [orderDetailsOpen, setOrderDetailsOpen] = useState(false);
  
  const isSuperadmin = user?.role === 'superadmin';

  // Navegação entre mesas
  const currentIndex = allTables.findIndex(t => t.id === table?.id);
  const hasPrevious = currentIndex > 0;
  const hasNext = currentIndex >= 0 && currentIndex < allTables.length - 1;
  
  const handlePrevious = () => {
    if (hasPrevious && onNavigate) {
      onNavigate(allTables[currentIndex - 1]);
    }
  };
  
  const handleNext = () => {
    if (hasNext && onNavigate) {
      onNavigate(allTables[currentIndex + 1]);
    }
  };

  const { data: authUser } = useQuery<{ restaurantId: string }>({
    queryKey: ['/api/auth/user'],
  });

  // Atalhos de teclado
  useKeyboardShortcuts([
    {
      key: 'ArrowLeft',
      callback: handlePrevious,
      description: 'Mesa anterior',
    },
    {
      key: 'ArrowRight',
      callback: handleNext,
      description: 'Próxima mesa',
    },
    {
      key: 'n',
      callback: () => {
        if (authUser?.restaurantId && table.status !== 'livre') {
          setShowNewOrderDialog(true);
        }
      },
      description: 'Novo pedido',
    },
    {
      key: 'f',
      callback: () => {
        if (table.status !== 'livre') {
          setShowCheckoutDialog(true);
        }
      },
      description: 'Fechar conta',
    },
    {
      key: 'Escape',
      callback: () => onOpenChange(false),
      description: 'Fechar diálogo',
    },
  ], open);

  // Guests of current table
  const { data: guests = [] } = useQuery<Array<{ id: string; name: string | null; guestNumber: number; status: string }>>({
    queryKey: table?.id ? [`/api/tables/${table.id}/guests`] : ['/api/tables/guests/disabled'],
    enabled: !!table?.id && open && table.status !== 'livre',
  });

  const [addingGuest, setAddingGuest] = useState(false);
  const [newGuestName, setNewGuestName] = useState('');
  const [createOrderAfterOccupy, setCreateOrderAfterOccupy] = useState(true);

  const createGuestMutation = useMutation({
    mutationFn: async (payload: { tableId: string; guestName?: string }) => {
      const res = await apiRequest('POST', `/api/tables/${payload.tableId}/guests`, {
        name: payload.guestName?.trim() || undefined,
      });
      return await res.json();
    },
    onSuccess: () => {
      if (table?.id) {
        queryClient.invalidateQueries({ queryKey: [`/api/tables/${table.id}/guests`] });
      }
      setNewGuestName('');
      setAddingGuest(false);
      toast({ title: 'Pessoa adicionada', description: 'Cliente adicionado à mesa.' });
    },
    onError: (error: any) => {
      toast({ title: 'Erro', description: error.message || 'Não foi possível adicionar a pessoa.', variant: 'destructive' });
    }
  });

  const startSessionMutation = useMutation({
    mutationFn: async () => {
      if (!table) return;
      const res = await apiRequest('POST', `/api/tables/${table.id}/start-session`, {
        customerName: customerName.trim() || undefined,
        customerCount: customerCount ? parseInt(customerCount) : undefined,
      });
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/tables/with-orders'] });
      toast({ title: 'Sessão iniciada', description: 'Mesa ocupada com sucesso.' });
      setCustomerName('');
      setCustomerCount('');
      
      // Se a opção estiver marcada, abre o dialog de criar pedido
      if (createOrderAfterOccupy) {
        setTimeout(() => {
          setShowNewOrderDialog(true);
        }, 300);
      }
    },
    onError: (error: any) => {
      toast({
        title: 'Erro',
        description: error.message || 'Não foi possível iniciar a sessão.',
        variant: 'destructive',
      });
    },
  });

  const updateStatusMutation = useMutation({
    mutationFn: async (newStatus: string) => {
      if (!table) return;
      const res = await apiRequest('PATCH', `/api/tables/${table.id}/status`, {
        status: newStatus,
      });
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/tables/with-orders'] });
      toast({ title: 'Status atualizado', description: 'Status da mesa atualizado com sucesso.' });
    },
    onError: (error: any) => {
      toast({
        title: 'Erro',
        description: error.message || 'Não foi possível atualizar o status.',
        variant: 'destructive',
      });
    },
  });

  const endSessionMutation = useMutation({
    mutationFn: async () => {
      if (!table) return;
      const res = await apiRequest('POST', `/api/tables/${table.id}/end-session`, {});
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/tables/with-orders'] });
      toast({ title: 'Mesa liberada', description: 'Mesa encerrada e liberada com sucesso.' });
      onOpenChange(false);
      setShowEndSessionDialog(false);
    },
    onError: (error: any) => {
      toast({
        title: 'Erro',
        description: error.message || 'Não foi possível encerrar a sessão.',
        variant: 'destructive',
      });
    },
  });

  const updateOrderStatusMutation = useMutation({
    mutationFn: async ({ orderId, status }: { orderId: string; status: string }) => {
      const res = await apiRequest('PATCH', `/api/orders/${orderId}/status`, { status });
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/tables/with-orders'] });
      queryClient.invalidateQueries({ queryKey: ['/api/orders'] });
      toast({ 
        title: 'Status atualizado', 
        description: 'Status do pedido atualizado com sucesso.' 
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Erro',
        description: error.message || 'Não foi possível atualizar o status.',
        variant: 'destructive',
      });
    },
  });

  const cancelOrderMutation = useMutation({
    mutationFn: async (orderId: string) => {
      const res = await apiRequest('PATCH', `/api/orders/${orderId}/status`, { 
        status: 'cancelado' 
      });
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/tables/with-orders'] });
      queryClient.invalidateQueries({ queryKey: ['/api/orders'] });
      toast({ 
        title: 'Pedido cancelado', 
        description: 'O pedido foi cancelado com sucesso.' 
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Erro',
        description: error.message || 'Não foi possível cancelar o pedido.',
        variant: 'destructive',
      });
    },
  });

  const handleOrderStatusChange = (orderId: string, newStatus: string) => {
    updateOrderStatusMutation.mutate({ orderId, status: newStatus });
  };

  const handleCancelOrder = (orderId: string) => {
    cancelOrderMutation.mutate(orderId);
  };

  const handleViewOrderDetails = (order: any) => {
    setSelectedOrder(order);
    setOrderDetailsOpen(true);
  };

  if (!table) return null;
  
  const totalAmount = parseFloat(table.totalAmount || '0');

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-3xl max-h-[95vh] flex flex-col p-0">
          <DialogHeader className="px-6 pt-6 pb-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {allTables.length > 1 && onNavigate && (
                  <div className="flex items-center gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={handlePrevious}
                      disabled={!hasPrevious}
                      title="Mesa anterior"
                      data-testid="button-previous-table"
                    >
                      <CaretLeft className="h-4 w-4" weight="bold" />
                    </Button>
                    <span className="text-xs text-muted-foreground px-2">
                      {currentIndex + 1}/{allTables.length}
                    </span>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={handleNext}
                      disabled={!hasNext}
                      title="Próxima mesa"
                      data-testid="button-next-table"
                    >
                      <CaretRight className="h-4 w-4" weight="bold" />
                    </Button>
                  </div>
                )}
                <DialogTitle>Mesa {table.number}</DialogTitle>
                <Badge>{getStatusLabel(table.status || 'livre')}</Badge>
              </div>
              {onDelete && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => {
                    onDelete(table.id);
                    onOpenChange(false);
                  }}
                  data-testid="button-delete-table"
                >
                  <TrashIcon className="h-4 w-4 text-destructive" weight="duotone" />
                </Button>
              )}
            </div>
            <DialogDescription className="flex items-center justify-between">
              <span>Gerencie a mesa, pedidos e pagamentos</span>
              {allTables.length > 1 && (
                <span className="text-xs text-muted-foreground">
                  Atalhos: ← → Navegar | N Novo | F Fechar | ESC Sair
                </span>
              )}
            </DialogDescription>
          </DialogHeader>

          <Tabs defaultValue="overview" className="flex-1 flex flex-col overflow-hidden">
            <TabsList className={`grid w-full mx-6 ${isSuperadmin ? 'grid-cols-1' : 'grid-cols-4'} shrink-0`}>
              <TabsTrigger value="overview">Visão Geral</TabsTrigger>
              {!isSuperadmin && <TabsTrigger value="guests" data-testid="tab-guests">Clientes ({guests.length})</TabsTrigger>}
              {!isSuperadmin && <TabsTrigger value="split" data-testid="tab-bill-split">Divisão</TabsTrigger>}
              {!isSuperadmin && <TabsTrigger value="financial">Financeiro</TabsTrigger>}
            </TabsList>

            <div className="flex-1 overflow-y-auto px-6 pb-6 mt-2">
              <TabsContent value="overview" className="space-y-3 mt-0">
                {table.status === 'livre' ? (
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-base">Ocupar Mesa</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div>
                        <Label htmlFor="customerName">Nome do Cliente</Label>
                        <Input
                          id="customerName"
                          value={customerName}
                          onChange={(e) => setCustomerName(e.target.value)}
                          placeholder="Digite o nome (opcional)"
                          data-testid="input-customer-name"
                        />
                      </div>
                      <div>
                        <Label htmlFor="customerCount">Número de Pessoas</Label>
                        <Input
                          id="customerCount"
                          type="number"
                          min="1"
                          value={customerCount}
                          onChange={(e) => setCustomerCount(e.target.value)}
                          placeholder="Quantas pessoas?"
                          data-testid="input-customer-count"
                        />
                      </div>
                      <div className="flex items-center space-x-2 p-3 bg-muted rounded-md">
                        <input
                          type="checkbox"
                          id="createOrderAfterOccupy"
                          checked={createOrderAfterOccupy}
                          onChange={(e) => setCreateOrderAfterOccupy(e.target.checked)}
                          className="h-4 w-4 rounded border-gray-300"
                          data-testid="checkbox-create-order"
                        />
                        <Label htmlFor="createOrderAfterOccupy" className="cursor-pointer text-sm font-normal">
                          Criar pedido após ocupar a mesa
                        </Label>
                      </div>
                      <Button
                        className="w-full"
                        onClick={() => startSessionMutation.mutate()}
                        disabled={startSessionMutation.isPending}
                        data-testid="button-start-session"
                      >
                        {startSessionMutation.isPending ? (
                          <>
                            <ArrowsClockwise className="h-4 w-4 mr-2 animate-spin" weight="bold" />
                            Ocupando...
                          </>
                        ) : (
                          createOrderAfterOccupy ? 'Ocupar e Criar Pedido' : 'Ocupar Mesa'
                        )}
                      </Button>
                    </CardContent>
                  </Card>
                ) : (
                  <>
                    <Card>
                      <CardHeader className="pb-3">
                        <CardTitle className="text-base">Informações</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-2">
                        {/* Guests Section */}
                        {table.status !== 'livre' && (
                          <div className="space-y-2">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <UsersThree className="h-4 w-4 text-muted-foreground" weight="duotone" />
                                <span className="text-sm font-medium">Pessoas na mesa</span>
                                {guests.length > 0 && (
                                  <Badge variant="secondary" className="text-xs">{guests.length}</Badge>
                                )}
                              </div>
                              <div>
                                {addingGuest ? (
                                  <div className="flex items-center gap-2">
                                    <Input 
                                      placeholder="Nome (opcional)"
                                      value={newGuestName}
                                      onChange={(e) => setNewGuestName(e.target.value)}
                                      className="h-8"
                                    />
                                    <Button size="sm" onClick={() => createGuestMutation.mutate({ tableId: table.id, guestName: newGuestName || undefined })} disabled={createGuestMutation.isPending}>
                                      {createGuestMutation.isPending ? (
                                        <>
                                          <ArrowsClockwise className="h-3 w-3 mr-1 animate-spin" weight="bold" />
                                          Adicionando...
                                        </>
                                      ) : (
                                        'Adicionar'
                                      )}
                                    </Button>
                                    <Button size="icon" variant="ghost" onClick={() => setAddingGuest(false)}>
                                      <TrashIcon className="h-4 w-4" weight="duotone" />
                                    </Button>
                                  </div>
                                ) : (
                                  <Button variant="outline" size="sm" onClick={() => setAddingGuest(true)}>
                                    <PlusIcon className="h-4 w-4 mr-1" weight="bold" />
                                    Adicionar Pessoa
                                  </Button>
                                )}
                              </div>
                            </div>
                            {guests.length > 0 && (
                              <div className="flex flex-wrap gap-2">
                                {guests.map((g) => (
                                  <Badge key={g.id} variant="outline">
                                    {(g.name || `Cliente ${g.guestNumber}`)}
                                  </Badge>
                                ))}
                              </div>
                            )}
                            <Separator />
                          </div>
                        )}
                        {table.capacity && (
                          <div className="flex items-center gap-2">
                            <UsersThree className="h-4 w-4 text-muted-foreground" weight="duotone" />
                            <span className="text-sm text-muted-foreground">
                              Capacidade: {table.capacity} pessoas
                            </span>
                          </div>
                        )}
                        {table.customerName && (
                          <div className="flex items-center gap-2">
                            <UsersThree className="h-4 w-4 text-muted-foreground" weight="duotone" />
                            <span className="font-medium">{table.customerName}</span>
                            {table.customerCount && table.customerCount > 0 && (
                              <span className="text-muted-foreground">
                                ({table.customerCount}{table.capacity ? `/${table.capacity}` : ''} pessoas)
                              </span>
                            )}
                          </div>
                        )}
                        {table.lastActivity && (
                          <div className="flex items-center gap-2">
                            <ClockIcon className="h-4 w-4 text-muted-foreground" weight="duotone" />
                            <span className="text-sm">
                              Última atividade: {format(new Date(table.lastActivity), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
                            </span>
                          </div>
                        )}
                        <Separator />
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium">Total da Conta:</span>
                          <span className="text-xl font-bold text-primary">{formatKwanza(totalAmount)}</span>
                        </div>
                      </CardContent>
                    </Card>

                    {authUser?.restaurantId && (
                      <div className="grid grid-cols-2 gap-2">
                        <Button
                          variant="outline"
                          onClick={() => setShowNewOrderDialog(true)}
                          data-testid="button-create-order-from-table"
                        >
                          <PlusIcon className="h-4 w-4 mr-2" weight="bold" />
                          Criar Pedido
                        </Button>
                        {table.status !== 'livre' && (
                          <Button
                            onClick={() => setShowCheckoutDialog(true)}
                            data-testid="button-checkout-table"
                          >
                            <ReceiptIcon className="h-4 w-4 mr-2" weight="duotone" />
                            Fechar Conta
                          </Button>
                        )}
                      </div>
                    )}

                    {/* Seção de Pedidos Ativos */}
                    {table.orders && table.orders.length > 0 && (
                      <Card>
                        <CardHeader className="pb-2">
                          <CardTitle className="text-base flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <ShoppingBagIcon className="h-4 w-4" weight="duotone" />
                              <span>Pedidos Ativos</span>
                              <Badge variant="secondary" className="text-xs">{table.orders.length}</Badge>
                            </div>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => {
                                queryClient.invalidateQueries({ queryKey: ['/api/tables/with-orders'] });
                                toast({ title: 'Atualizando...', description: 'Buscando pedidos atualizados.' });
                              }}
                              title="Atualizar pedidos"
                            >
                              <ArrowsClockwise className="h-3.5 w-3.5" weight="bold" />
                            </Button>
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-2 max-h-[400px] overflow-y-auto">
                          {table.orders.map((order: any) => (
                            <OrderCard
                              key={order.id}
                              order={order}
                              onViewDetails={() => handleViewOrderDetails(order)}
                              onStatusChange={handleOrderStatusChange}
                              onCancel={handleCancelOrder}
                              compact={table.orders.length > 3}
                            />
                          ))}
                        </CardContent>
                      </Card>
                    )}

                    {/* Mensagem quando não há pedidos */}
                    {table.status !== 'livre' && (!table.orders || table.orders.length === 0) && (
                      <Card>
                        <CardContent className="py-6 text-center">
                          <ShoppingBagIcon className="h-10 w-10 mx-auto text-muted-foreground mb-2" weight="duotone" />
                          <p className="text-sm text-muted-foreground mb-3">
                            Nenhum pedido ativo nesta mesa
                          </p>
                          {authUser?.restaurantId && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setShowNewOrderDialog(true)}
                            >
                              <PlusIcon className="h-4 w-4 mr-2" weight="bold" />
                              Criar Primeiro Pedido
                            </Button>
                          )}
                        </CardContent>
                      </Card>
                    )}

                    <Card>
                      <CardHeader className="pb-3">
                        <CardTitle className="text-sm">Alterar Status</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="grid grid-cols-2 gap-2">
                          <Button
                            variant={table.status === 'ocupada' ? 'default' : 'outline'}
                            size="sm"
                            onClick={() => updateStatusMutation.mutate('ocupada')}
                            disabled={updateStatusMutation.isPending}
                          >
                            {updateStatusMutation.isPending ? (
                              <>
                                <ArrowsClockwise className="h-3 w-3 mr-1 animate-spin" weight="bold" />
                                Atualizando...
                              </>
                            ) : (
                              'Ocupada'
                            )}
                          </Button>
                          <Button
                            variant={table.status === 'em_andamento' ? 'default' : 'outline'}
                            size="sm"
                            onClick={() => updateStatusMutation.mutate('em_andamento')}
                            disabled={updateStatusMutation.isPending}
                          >
                            {updateStatusMutation.isPending ? (
                              <>
                                <ArrowsClockwise className="h-3 w-3 mr-1 animate-spin" weight="bold" />
                                Atualizando...
                              </>
                            ) : (
                              'Em Andamento'
                            )}
                          </Button>
                          <Button
                            variant={table.status === 'aguardando_pagamento' ? 'default' : 'outline'}
                            size="sm"
                            onClick={() => updateStatusMutation.mutate('aguardando_pagamento')}
                            disabled={updateStatusMutation.isPending}
                          >
                            {updateStatusMutation.isPending ? (
                              <>
                                <ArrowsClockwise className="h-3 w-3 mr-1 animate-spin" weight="bold" />
                                Atualizando...
                              </>
                            ) : (
                              'Aguardando'
                            )}
                          </Button>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => setShowEndSessionDialog(true)}
                          >
                            Encerrar Mesa
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  </>
                )}
              </TabsContent>

              <TabsContent value="guests" className="space-y-4 mt-0">
                {table.status !== 'livre' ? (
                  <TableGuestsManager table={table} />
                ) : (
                  <Card>
                    <CardContent className="py-12 text-center text-muted-foreground">
                      Ocupe a mesa primeiro para gerenciar clientes
                    </CardContent>
                  </Card>
                )}
              </TabsContent>

              <TabsContent value="split" className="space-y-4 mt-0">
                {table.status !== 'livre' && (
                  <BillSplitPanel 
                    tableId={table.id} 
                    sessionId={table.currentSessionId || undefined}
                    totalAmount={totalAmount}
                  />
                )}
              </TabsContent>

              <TabsContent value="financial" className="space-y-4 mt-0">
                <FinancialDashboard tableId={table.id} sessionId={table.currentSessionId || undefined} />
              </TabsContent>
            </div>
          </Tabs>
        </DialogContent>
      </Dialog>

      <AlertDialog open={showEndSessionDialog} onOpenChange={setShowEndSessionDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Encerrar Mesa {table.number}?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta ação irá encerrar a sessão atual e liberar a mesa. A conta total é de{' '}
              <span className="font-bold">{formatKwanza(totalAmount)}</span>.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={endSessionMutation.isPending}>
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={() => endSessionMutation.mutate()}
              disabled={endSessionMutation.isPending}
              data-testid="button-confirm-end-session"
            >
              {endSessionMutation.isPending ? 'Encerrando...' : 'Encerrar Mesa'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <TableOrderDialog
        table={table}
        open={showNewOrderDialog}
        onOpenChange={setShowNewOrderDialog}
        onOrderCreated={() => {
          setShowNewOrderDialog(false);
          queryClient.invalidateQueries({ queryKey: ['/api/tables/with-orders'] });
          toast({ title: 'Pedido criado', description: `Pedido criado para Mesa ${table.number}.` });
        }}
      />

      <TableCheckoutDialog
        open={showCheckoutDialog}
        onOpenChange={setShowCheckoutDialog}
        table={table}
        onCheckoutComplete={() => {
          setShowCheckoutDialog(false);
          onOpenChange(false);
        }}
      />

      <OrderDetailsDialog
        order={selectedOrder}
        open={orderDetailsOpen}
        onOpenChange={setOrderDetailsOpen}
      />
    </>
  );
}
