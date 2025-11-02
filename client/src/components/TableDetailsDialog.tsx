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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
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
import { Users, DollarSign, Clock, CheckCircle2, XCircle, Receipt } from 'lucide-react';
import { formatKwanza } from '@/lib/formatters';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useMutation } from '@tanstack/react-query';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { PrintOrder } from '@/components/PrintOrder';
import type { Table } from '@shared/schema';

interface TableDetailsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  table: (Table & { orders?: any[] }) | null;
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

const getOrderStatusLabel = (status: string) => {
  const labels: Record<string, string> = {
    pendente: 'Pendente',
    em_preparo: 'Em Preparo',
    pronto: 'Pronto',
    servido: 'Servido',
  };
  return labels[status] || status;
};

export function TableDetailsDialog({ open, onOpenChange, table }: TableDetailsDialogProps) {
  const { toast } = useToast();
  const [customerName, setCustomerName] = useState('');
  const [customerCount, setCustomerCount] = useState('');
  const [paymentAmount, setPaymentAmount] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('dinheiro');
  const [showEndSessionDialog, setShowEndSessionDialog] = useState(false);

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

  const addPaymentMutation = useMutation({
    mutationFn: async () => {
      if (!table) return;
      const amount = parseFloat(paymentAmount);
      if (isNaN(amount) || amount <= 0) {
        throw new Error('Valor inválido');
      }
      const res = await apiRequest('POST', `/api/tables/${table.id}/payments`, {
        amount: amount.toFixed(2),
        paymentMethod,
      });
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/tables/with-orders'] });
      toast({ title: 'Pagamento registrado', description: 'Pagamento adicionado com sucesso.' });
      setPaymentAmount('');
      setPaymentMethod('dinheiro');
    },
    onError: (error: any) => {
      toast({
        title: 'Erro',
        description: error.message || 'Não foi possível registrar o pagamento.',
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

  const activeOrders = table.orders?.filter(
    (o) => ['pendente', 'em_preparo', 'pronto'].includes(o.status)
  ) || [];
  
  const totalAmount = parseFloat(table.totalAmount || '0');

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-2xl max-h-[90vh] flex flex-col">
          <DialogHeader>
            <DialogTitle className="flex items-center justify-between">
              <span>Mesa {table.number}</span>
              <Badge className="ml-2">{getStatusLabel(table.status || 'livre')}</Badge>
            </DialogTitle>
            <DialogDescription>
              Gerencie a mesa, pedidos e pagamentos
            </DialogDescription>
          </DialogHeader>

          <Tabs defaultValue="overview" className="flex-1 overflow-hidden flex flex-col">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="overview">Visão Geral</TabsTrigger>
              <TabsTrigger value="orders">Pedidos ({activeOrders.length})</TabsTrigger>
              <TabsTrigger value="payment">Pagamento</TabsTrigger>
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
                        {table.customerName && (
                          <div className="flex items-center gap-2">
                            <Users className="h-4 w-4 text-muted-foreground" />
                            <span className="font-medium">{table.customerName}</span>
                            {table.customerCount && table.customerCount > 0 && (
                              <span className="text-muted-foreground">({table.customerCount} pessoas)</span>
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

              <TabsContent value="orders" className="space-y-3 m-0">
                {activeOrders.length === 0 ? (
                  <Card>
                    <CardContent className="py-8 text-center text-muted-foreground">
                      Nenhum pedido ativo nesta mesa
                    </CardContent>
                  </Card>
                ) : (
                  activeOrders.map((order) => (
                    <Card key={order.id}>
                      <CardHeader className="pb-3">
                        <div className="flex items-center justify-between">
                          <CardTitle className="text-sm">Pedido #{order.id.substring(0, 8).toUpperCase()}</CardTitle>
                          <Badge variant="outline">{getOrderStatusLabel(order.status)}</Badge>
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {format(new Date(order.createdAt), "HH:mm", { locale: ptBR })}
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2">
                          {order.orderItems?.map((item: any) => (
                            <div key={item.id} className="flex justify-between text-sm">
                              <span>
                                {item.quantity}x {item.menuItem?.name || 'Item'}
                              </span>
                              <span className="font-medium">{formatKwanza(parseFloat(item.price) * item.quantity)}</span>
                            </div>
                          ))}
                          <Separator />
                          <div className="flex justify-between font-semibold">
                            <span>Total:</span>
                            <span>{formatKwanza(order.totalAmount)}</span>
                          </div>
                          <div className="mt-3 pt-3 border-t">
                            <PrintOrder order={order} variant="outline" size="sm" />
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                )}
              </TabsContent>

              <TabsContent value="payment" className="space-y-4 m-0">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Registrar Pagamento</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label htmlFor="amount">Valor</Label>
                      <Input
                        id="amount"
                        type="number"
                        step="0.01"
                        min="0"
                        value={paymentAmount}
                        onChange={(e) => setPaymentAmount(e.target.value)}
                        placeholder="0,00"
                        data-testid="input-payment-amount"
                      />
                    </div>
                    <div>
                      <Label htmlFor="paymentMethod">Método de Pagamento</Label>
                      <Select value={paymentMethod} onValueChange={setPaymentMethod}>
                        <SelectTrigger id="paymentMethod" data-testid="select-payment-method">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="dinheiro">Dinheiro</SelectItem>
                          <SelectItem value="multicaixa">Multicaixa</SelectItem>
                          <SelectItem value="transferencia">Transferência</SelectItem>
                          <SelectItem value="cartao">Cartão</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <Button
                      className="w-full"
                      onClick={() => addPaymentMutation.mutate()}
                      disabled={addPaymentMutation.isPending || !paymentAmount}
                      data-testid="button-add-payment"
                    >
                      <Receipt className="h-4 w-4 mr-2" />
                      {addPaymentMutation.isPending ? 'Registrando...' : 'Registrar Pagamento'}
                    </Button>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Resumo</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <div className="flex justify-between text-lg font-semibold">
                      <span>Total da Conta:</span>
                      <span className="text-primary">{formatKwanza(totalAmount)}</span>
                    </div>
                  </CardContent>
                </Card>
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
              {activeOrders.length > 0 && (
                <span className="block mt-2 text-destructive">
                  Atenção: Ainda há {activeOrders.length} pedido(s) ativo(s).
                </span>
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
              data-testid="button-confirm-end-session"
            >
              {endSessionMutation.isPending ? 'Encerrando...' : 'Encerrar Mesa'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
