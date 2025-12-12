import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
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
import { Users, Clock, Trash2, Split, Plus } from 'lucide-react';
import { formatKwanza } from '@/lib/formatters';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useMutation, useQuery } from '@tanstack/react-query';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { FinancialDashboard } from '@/components/FinancialDashboard';
import { BillSplitPanel } from '@/components/BillSplitPanel';
import { NewOrderDialog } from '@/components/new-order-dialog';
import type { Table } from '@shared/schema';

interface TableDetailsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  table: (Table & { orders?: any[] }) | null;
  onDelete?: (tableId: string) => void;
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

export function TableDetailsDialog({ open, onOpenChange, table, onDelete }: TableDetailsDialogProps) {
  const { toast } = useToast();
  const { user } = useAuth();
  const [customerName, setCustomerName] = useState('');
  const [customerCount, setCustomerCount] = useState('');
  const [showEndSessionDialog, setShowEndSessionDialog] = useState(false);
  const [showNewOrderDialog, setShowNewOrderDialog] = useState(false);
  
  const isSuperadmin = user?.role === 'superadmin';

  const { data: authUser } = useQuery<{ restaurantId: string }>({
    queryKey: ['/api/auth/user'],
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

  if (!table) return null;
  
  const totalAmount = parseFloat(table.totalAmount || '0');

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-2xl max-h-[90vh] flex flex-col">
          <DialogHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
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
                  <Trash2 className="h-4 w-4 text-destructive" />
                </Button>
              )}
            </div>
            <DialogDescription>
              Gerencie a mesa, pedidos e pagamentos
            </DialogDescription>
          </DialogHeader>

          <Tabs defaultValue="overview" className="flex-1 overflow-hidden flex flex-col">
            <TabsList className={`grid w-full ${isSuperadmin ? 'grid-cols-1' : 'grid-cols-3'}`}>
              <TabsTrigger value="overview">Visão Geral</TabsTrigger>
              {!isSuperadmin && <TabsTrigger value="split" data-testid="tab-bill-split">Divisão</TabsTrigger>}
              {!isSuperadmin && <TabsTrigger value="financial">Financeiro</TabsTrigger>}
            </TabsList>

            <ScrollArea className="flex-1 mt-4">
              <TabsContent value="overview" className="space-y-4 m-0">
                {table.status === 'livre' ? (
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base">Ocupar Mesa</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
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
                      <Button
                        className="w-full"
                        onClick={() => startSessionMutation.mutate()}
                        disabled={startSessionMutation.isPending}
                        data-testid="button-start-session"
                      >
                        {startSessionMutation.isPending ? 'Ocupando...' : 'Ocupar Mesa'}
                      </Button>
                    </CardContent>
                  </Card>
                ) : (
                  <>
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-base">Informações</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        {table.capacity && (
                          <div className="flex items-center gap-2">
                            <Users className="h-4 w-4 text-muted-foreground" />
                            <span className="text-sm text-muted-foreground">
                              Capacidade: {table.capacity} pessoas
                            </span>
                          </div>
                        )}
                        {table.customerName && (
                          <div className="flex items-center gap-2">
                            <Users className="h-4 w-4 text-muted-foreground" />
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
                            <Clock className="h-4 w-4 text-muted-foreground" />
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
                      <Button
                        className="w-full"
                        onClick={() => setShowNewOrderDialog(true)}
                        data-testid="button-create-order-from-table"
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Criar Pedido
                      </Button>
                    )}

                    <Card>
                      <CardHeader>
                        <CardTitle className="text-base">Alterar Status</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <div className="grid grid-cols-2 gap-2">
                          <Button
                            variant={table.status === 'ocupada' ? 'default' : 'outline'}
                            size="sm"
                            onClick={() => updateStatusMutation.mutate('ocupada')}
                            disabled={updateStatusMutation.isPending}
                          >
                            Ocupada
                          </Button>
                          <Button
                            variant={table.status === 'em_andamento' ? 'default' : 'outline'}
                            size="sm"
                            onClick={() => updateStatusMutation.mutate('em_andamento')}
                            disabled={updateStatusMutation.isPending}
                          >
                            Em Andamento
                          </Button>
                          <Button
                            variant={table.status === 'aguardando_pagamento' ? 'default' : 'outline'}
                            size="sm"
                            onClick={() => updateStatusMutation.mutate('aguardando_pagamento')}
                            disabled={updateStatusMutation.isPending}
                          >
                            Aguardando
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

              <TabsContent value="split" className="space-y-4 m-0">
                {table.status !== 'livre' && (
                  <BillSplitPanel 
                    tableId={table.id} 
                    sessionId={table.currentSessionId || undefined}
                    totalAmount={totalAmount}
                  />
                )}
              </TabsContent>

              <TabsContent value="financial" className="space-y-4 m-0">
                <FinancialDashboard tableId={table.id} sessionId={table.currentSessionId || undefined} />
              </TabsContent>
            </ScrollArea>
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

      {authUser?.restaurantId && (
        <NewOrderDialog
          restaurantId={authUser.restaurantId}
          initialTableId={table.id}
          initialTableNumber={table.number}
          open={showNewOrderDialog}
          onOpenChange={setShowNewOrderDialog}
          onOrderCreated={() => {
            setShowNewOrderDialog(false);
            queryClient.invalidateQueries({ queryKey: ['/api/tables/with-orders'] });
            toast({ title: 'Pedido criado', description: `Pedido criado para Mesa ${table.number}.` });
          }}
        />
      )}
    </>
  );
}
