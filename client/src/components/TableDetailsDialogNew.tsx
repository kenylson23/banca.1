import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
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
  Users,
  Clock,
  Receipt,
  Plus,
  MoreVertical,
  X,
  ArrowLeft,
  ArrowRight,
  ShoppingBag,
  CreditCard,
  UserPlus,
  Split,
  TrendingUp,
  RefreshCw,
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { formatKwanza } from '@/lib/formatters';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import type { Table, Order, OrderItem, MenuItem } from '@shared/schema';
import { TableOrderDialog } from '@/components/tables/TableOrderDialog';
import { TableCheckoutDialog } from '@/components/tables/TableCheckoutDialog';
import { OrderDetailsDialog } from '@/components/order-details-dialog';

interface TableDetailsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  table: (Table & { orders?: any[] }) | null;
  onDelete?: (tableId: string) => void;
  allTables?: Table[];
  onNavigate?: (table: Table) => void;
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

const getStatusColor = (status: string) => {
  const colors: Record<string, string> = {
    livre: 'bg-green-100 text-green-700 border-green-300',
    ocupada: 'bg-blue-100 text-blue-700 border-blue-300',
    em_andamento: 'bg-amber-100 text-amber-700 border-amber-300',
    aguardando_pagamento: 'bg-orange-100 text-orange-700 border-orange-300',
    encerrada: 'bg-gray-100 text-gray-700 border-gray-300',
  };
  return colors[status] || 'bg-gray-100 text-gray-700';
};

export function TableDetailsDialogNew({ open, onOpenChange, table, onDelete, allTables = [], onNavigate }: TableDetailsDialogProps) {
  const { toast } = useToast();
  const { user } = useAuth();
  const [customerName, setCustomerName] = useState('');
  const [selectedPeopleCount, setSelectedPeopleCount] = useState<number | null>(null);
  const [customPeopleCount, setCustomPeopleCount] = useState('');
  const [showCustomCount, setShowCustomCount] = useState(false);
  const [showEndSessionDialog, setShowEndSessionDialog] = useState(false);
  const [showNewOrderDialog, setShowNewOrderDialog] = useState(false);
  const [showCheckoutDialog, setShowCheckoutDialog] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const [orderDetailsOpen, setOrderDetailsOpen] = useState(false);

  const authUser = user?.data;
  const isSuperadmin = authUser?.role === 'superadmin';

  // Navigation
  const currentIndex = allTables.findIndex(t => t.id === table?.id);
  const hasPrevious = currentIndex > 0;
  const hasNext = currentIndex < allTables.length - 1;

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

  // Start session mutation
  const startSessionMutation = useMutation({
    mutationFn: async () => {
      const count = selectedPeopleCount || parseInt(customPeopleCount) || 1;
      const response = await apiRequest('POST', `/api/tables/${table?.id}/start-session`, {
        customerName: customerName.trim() || undefined,
        customerCount: count,
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/tables/with-orders'] });
      toast({ title: 'Mesa ocupada', description: 'Mesa pronta para receber pedidos.' });
      setCustomerName('');
      setSelectedPeopleCount(null);
      setCustomPeopleCount('');
      setShowCustomCount(false);
    },
    onError: (error: any) => {
      toast({
        title: 'Erro ao ocupar mesa',
        description: error.message || 'Não foi possível ocupar a mesa.',
        variant: 'destructive',
      });
    },
  });

  // End session mutation
  const endSessionMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest('POST', `/api/tables/${table?.id}/close-session`, {});
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/tables/with-orders'] });
      toast({ title: 'Mesa encerrada', description: 'Mesa liberada com sucesso.' });
      setShowEndSessionDialog(false);
      onOpenChange(false);
    },
    onError: (error: any) => {
      toast({
        title: 'Erro ao encerrar mesa',
        description: error.message || 'Não foi possível encerrar a mesa.',
        variant: 'destructive',
      });
    },
  });

  // Update status mutation
  const updateStatusMutation = useMutation({
    mutationFn: async (status: string) => {
      const response = await apiRequest('PATCH', `/api/tables/${table?.id}/status`, { status });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/tables/with-orders'] });
      toast({ title: 'Status atualizado' });
    },
    onError: (error: any) => {
      toast({
        title: 'Erro',
        description: error.message || 'Não foi possível atualizar o status.',
        variant: 'destructive',
      });
    },
  });

  if (!table) return null;

  const totalAmount = parseFloat(table.totalAmount || '0');
  const isTableFree = table.status === 'livre';

  // Quick buttons for people count
  const quickCounts = [1, 2, 3, 4, 5, 6];

  // Render mesa livre (simplified)
  const renderFreeTable = () => (
    <DialogContent className="sm:max-w-md">
      <DialogHeader>
        <DialogTitle className="flex items-center justify-between">
          <span>🪑 Ocupar Mesa {table.number}</span>
          {allTables.length > 1 && onNavigate && (
            <div className="flex items-center gap-1">
              <Button variant="ghost" size="icon" onClick={handlePrevious} disabled={!hasPrevious}>
                <ArrowLeft className="h-4 w-4" />
              </Button>
              <span className="text-xs text-muted-foreground px-2">{currentIndex + 1}/{allTables.length}</span>
              <Button variant="ghost" size="icon" onClick={handleNext} disabled={!hasNext}>
                <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
          )}
        </DialogTitle>
      </DialogHeader>

      <div className="space-y-4 pt-4">
        {/* Customer name - optional */}
        <div className="space-y-2">
          <Label htmlFor="customerName" className="text-sm font-medium">
            👤 Nome do Cliente (opcional)
          </Label>
          <Input
            id="customerName"
            value={customerName}
            onChange={(e) => setCustomerName(e.target.value)}
            placeholder="Ex: João Silva"
            className="h-11"
          />
        </div>

        {/* People count - quick buttons */}
        <div className="space-y-2">
          <Label className="text-sm font-medium">👥 Número de Pessoas</Label>
          <div className="grid grid-cols-6 gap-2">
            {quickCounts.map((count) => (
              <Button
                key={count}
                variant={selectedPeopleCount === count ? 'default' : 'outline'}
                className="h-12 text-lg font-semibold"
                onClick={() => {
                  setSelectedPeopleCount(count);
                  setShowCustomCount(false);
                  setCustomPeopleCount('');
                }}
              >
                {count}
              </Button>
            ))}
          </div>
          
          {!showCustomCount ? (
            <Button
              variant="outline"
              size="sm"
              className="w-full"
              onClick={() => setShowCustomCount(true)}
            >
              + Outro número
            </Button>
          ) : (
            <div className="flex items-center gap-2">
              <Input
                type="number"
                min="1"
                placeholder="Digite o número"
                value={customPeopleCount}
                onChange={(e) => {
                  setCustomPeopleCount(e.target.value);
                  setSelectedPeopleCount(null);
                }}
                className="h-10"
                autoFocus
              />
              <Button variant="ghost" size="icon" onClick={() => {
                setShowCustomCount(false);
                setCustomPeopleCount('');
              }}>
                <X className="h-4 w-4" />
              </Button>
            </div>
          )}
        </div>

        {/* Action buttons */}
        <div className="flex gap-2 pt-2">
          <Button
            variant="outline"
            className="flex-1"
            onClick={() => onOpenChange(false)}
          >
            Cancelar
          </Button>
          <Button
            className="flex-1"
            onClick={() => startSessionMutation.mutate()}
            disabled={startSessionMutation.isPending || (!selectedPeopleCount && !customPeopleCount)}
          >
            {startSessionMutation.isPending ? (
              <>
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                Ocupando...
              </>
            ) : (
              '✓ Ocupar Mesa'
            )}
          </Button>
        </div>

        {/* Helper text */}
        <p className="text-xs text-muted-foreground text-center">
          Após ocupar, você poderá criar pedidos para esta mesa
        </p>
      </div>
    </DialogContent>
  );

  // Render occupied table (dashboard style)
  const renderOccupiedTable = () => (
    <DialogContent className="max-w-2xl max-h-[90vh] flex flex-col p-0">
      {/* Header */}
      <DialogHeader className="px-6 pt-6 pb-4 border-b">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {allTables.length > 1 && onNavigate && (
              <div className="flex items-center gap-1">
                <Button variant="ghost" size="icon" onClick={handlePrevious} disabled={!hasPrevious}>
                  <ArrowLeft className="h-4 w-4" />
                </Button>
                <span className="text-xs text-muted-foreground">{currentIndex + 1}/{allTables.length}</span>
                <Button variant="ghost" size="icon" onClick={handleNext} disabled={!hasNext}>
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </div>
            )}
            <div>
              <DialogTitle className="text-2xl font-bold">Mesa {table.number}</DialogTitle>
              <div className="flex items-center gap-2 mt-1 text-sm text-muted-foreground">
                {table.customerName && (
                  <>
                    <span className="font-medium">{table.customerName}</span>
                    <span>•</span>
                  </>
                )}
                {table.customerCount && (
                  <>
                    <Users className="h-3.5 w-3.5" />
                    <span>{table.customerCount} {table.customerCount === 1 ? 'pessoa' : 'pessoas'}</span>
                  </>
                )}
                {table.lastActivity && (
                  <>
                    <span>•</span>
                    <Clock className="h-3.5 w-3.5" />
                    <span>{format(new Date(table.lastActivity), 'HH:mm', { locale: ptBR })}</span>
                  </>
                )}
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <Badge className={`${getStatusColor(table.status)} border`}>
              {getStatusLabel(table.status)}
            </Badge>
            
            {/* More options menu */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>Mais Opções</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => updateStatusMutation.mutate('ocupada')}>
                  <Users className="h-4 w-4 mr-2" />
                  Marcar como Ocupada
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => updateStatusMutation.mutate('em_andamento')}>
                  <Clock className="h-4 w-4 mr-2" />
                  Em Andamento
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => updateStatusMutation.mutate('aguardando_pagamento')}>
                  <CreditCard className="h-4 w-4 mr-2" />
                  Aguardando Pagamento
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => queryClient.invalidateQueries({ queryKey: ['/api/tables/with-orders'] })}>
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Atualizar Dados
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem 
                  onClick={() => setShowEndSessionDialog(true)}
                  className="text-destructive focus:text-destructive"
                >
                  <X className="h-4 w-4 mr-2" />
                  Encerrar Mesa
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </DialogHeader>

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
        {/* Total amount - prominent */}
        <Card className="bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Total da Conta</p>
                <p className="text-4xl font-bold text-primary">{formatKwanza(totalAmount)}</p>
              </div>
              <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
                <Receipt className="h-8 w-8 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Active orders - inline */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base flex items-center gap-2">
                <ShoppingBag className="h-5 w-5" />
                Pedidos
                {table.orders && table.orders.length > 0 && (
                  <Badge variant="secondary">{table.orders.length}</Badge>
                )}
              </CardTitle>
              {authUser?.restaurantId && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowNewOrderDialog(true)}
                  className="text-primary"
                >
                  <Plus className="h-4 w-4 mr-1" />
                  Novo
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent>
            {table.orders && table.orders.length > 0 ? (
              <div className="space-y-2">
                {table.orders.map((order: any) => (
                  <div
                    key={order.id}
                    className="p-4 border rounded-lg hover:bg-accent cursor-pointer transition-colors"
                    onClick={() => {
                      setSelectedOrder(order);
                      setOrderDetailsOpen(true);
                    }}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <Badge variant={
                          order.status === 'pendente' ? 'secondary' :
                          order.status === 'em_preparo' ? 'default' :
                          order.status === 'pronto' ? 'outline' :
                          'secondary'
                        }>
                          {order.status === 'pendente' ? '📝 Pendente' :
                           order.status === 'em_preparo' ? '👨‍🍳 Em Preparo' :
                           order.status === 'pronto' ? '✅ Pronto' :
                           order.status === 'servido' ? '🍽️ Servido' :
                           order.status}
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          {format(new Date(order.createdAt), 'HH:mm', { locale: ptBR })}
                        </span>
                      </div>
                      <span className="font-semibold text-primary">
                        {formatKwanza(parseFloat(order.totalAmount || '0'))}
                      </span>
                    </div>
                    {order.orderItems && order.orderItems.length > 0 && (
                      <div className="text-sm text-muted-foreground">
                        {order.orderItems.slice(0, 2).map((item: any, idx: number) => (
                          <div key={idx}>
                            {item.quantity}x {item.menuItem?.name || 'Item'}
                          </div>
                        ))}
                        {order.orderItems.length > 2 && (
                          <div className="text-xs mt-1">
                            +{order.orderItems.length - 2} item(ns)...
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <ShoppingBag className="h-12 w-12 mx-auto text-muted-foreground/50 mb-3" />
                <p className="text-sm text-muted-foreground mb-4">
                  Nenhum pedido ainda
                </p>
                {authUser?.restaurantId && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowNewOrderDialog(true)}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Criar Primeiro Pedido
                  </Button>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Footer - Main actions */}
      <div className="border-t px-6 py-4 bg-muted/30">
        <div className="grid grid-cols-2 gap-3">
          {authUser?.restaurantId && (
            <>
              <Button
                size="lg"
                variant="outline"
                onClick={() => setShowNewOrderDialog(true)}
                className="h-14"
              >
                <Plus className="h-5 w-5 mr-2" />
                <div className="text-left">
                  <div className="font-semibold">Novo Pedido</div>
                  <div className="text-xs text-muted-foreground">Adicionar itens</div>
                </div>
              </Button>
              <Button
                size="lg"
                onClick={() => setShowCheckoutDialog(true)}
                className="h-14"
              >
                <CreditCard className="h-5 w-5 mr-2" />
                <div className="text-left">
                  <div className="font-semibold">Fechar Conta</div>
                  <div className="text-xs opacity-90">{formatKwanza(totalAmount)}</div>
                </div>
              </Button>
            </>
          )}
        </div>
      </div>
    </DialogContent>
  );

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        {isTableFree ? renderFreeTable() : renderOccupiedTable()}
      </Dialog>

      {/* End session confirmation */}
      <AlertDialog open={showEndSessionDialog} onOpenChange={setShowEndSessionDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Encerrar Mesa {table.number}?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta ação irá encerrar a sessão e liberar a mesa. 
              {totalAmount > 0 && (
                <>
                  {' '}A conta total é de <span className="font-bold">{formatKwanza(totalAmount)}</span>.
                  Certifique-se de que o pagamento foi registrado.
                </>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={endSessionMutation.isPending}>
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={() => endSessionMutation.mutate()}
              disabled={endSessionMutation.isPending}
            >
              {endSessionMutation.isPending ? 'Encerrando...' : 'Encerrar Mesa'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Create order dialog */}
      {authUser?.restaurantId && (
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
      )}

      {/* Checkout dialog */}
      <TableCheckoutDialog
        open={showCheckoutDialog}
        onOpenChange={setShowCheckoutDialog}
        table={table}
        onCheckoutComplete={() => {
          setShowCheckoutDialog(false);
          onOpenChange(false);
        }}
      />

      {/* Order details dialog */}
      <OrderDetailsDialog
        order={selectedOrder}
        open={orderDetailsOpen}
        onOpenChange={setOrderDetailsOpen}
      />
    </>
  );
}
