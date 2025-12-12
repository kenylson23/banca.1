import { useState, useEffect } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
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
  Receipt, 
  CreditCard, 
  Banknote, 
  Smartphone, 
  Building2, 
  Check, 
  Printer, 
  Users,
  ShoppingBag,
  Plus,
  Minus,
  Split,
  Loader2,
  AlertCircle,
  X
} from 'lucide-react';
import { formatKwanza } from '@/lib/formatters';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import type { Table, Order } from '@shared/schema';

interface OrderItem {
  id: string;
  menuItemName: string;
  quantity: number;
  unitPrice: string;
  totalPrice: string;
}

interface TableOrder {
  orderId: string;
  orderStatus: string;
  totalAmount: string;
  createdAt: Date;
  items: OrderItem[];
}

interface TableGuest {
  id: string;
  sessionId: string;
  guestName: string | null;
  guestNumber: number;
  status: string;
  totalSpent: string;
  joinedAt: Date;
}

interface OrdersByGuest {
  guest: TableGuest;
  orders: TableOrder[];
  totalAmount: number;
}

interface PaymentEntry {
  method: string;
  amount: string;
}

interface CheckoutDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  table: (Table & { orders?: Order[] }) | null;
  onCheckoutComplete?: () => void;
}

const PAYMENT_METHODS = [
  { value: 'dinheiro', label: 'Dinheiro', icon: Banknote },
  { value: 'multicaixa', label: 'Multicaixa', icon: Smartphone },
  { value: 'transferencia', label: 'Transferência', icon: Building2 },
  { value: 'cartao', label: 'Cartão', icon: CreditCard },
];

export function CheckoutDialog({ open, onOpenChange, table, onCheckoutComplete }: CheckoutDialogProps) {
  const { toast } = useToast();
  const [paymentMode, setPaymentMode] = useState<'single' | 'split' | 'by_guest'>('single');
  const [payments, setPayments] = useState<PaymentEntry[]>([{ method: 'dinheiro', amount: '' }]);
  const [receivedAmount, setReceivedAmount] = useState('');
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [selectedGuestPayments, setSelectedGuestPayments] = useState<Record<string, { method: string; paid: boolean }>>({});

  const totalAmount = parseFloat(table?.totalAmount || '0');

  const { data: ordersByGuest = [], isLoading: loadingOrders } = useQuery<OrdersByGuest[]>({
    queryKey: [`/api/tables/${table?.id}/orders-by-guest`],
    enabled: !!table?.id && open,
  });

  const { data: tableOrders = [] } = useQuery<Order[]>({
    queryKey: ['/api/orders'],
    enabled: !!table?.id && open,
    select: (orders) => orders.filter(o => o.tableId === table?.id && o.status !== 'cancelado'),
  });

  useEffect(() => {
    if (open && totalAmount > 0) {
      setPayments([{ method: 'dinheiro', amount: totalAmount.toFixed(2) }]);
      setReceivedAmount('');
      setPaymentMode('single');
      
      const guestPayments: Record<string, { method: string; paid: boolean }> = {};
      ordersByGuest.forEach(og => {
        guestPayments[og.guest.id] = { 
          method: 'dinheiro', 
          paid: og.guest.status === 'pago' 
        };
      });
      setSelectedGuestPayments(guestPayments);
    }
  }, [open, totalAmount, ordersByGuest]);

  const recordPaymentMutation = useMutation({
    mutationFn: async ({ tableId, amount, paymentMethod }: { tableId: string; amount: string; paymentMethod: string }) => {
      return apiRequest('POST', `/api/tables/${tableId}/payment`, {
        amount,
        paymentMethod,
        receivedAmount: receivedAmount || undefined,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/tables'] });
      queryClient.invalidateQueries({ queryKey: ['/api/tables/with-orders'] });
      queryClient.invalidateQueries({ queryKey: ['/api/tables/open'] });
    },
    onError: (error: any) => {
      toast({
        title: 'Erro',
        description: error.message || 'Não foi possível registrar o pagamento.',
        variant: 'destructive',
      });
    },
  });

  const closeSessionMutation = useMutation({
    mutationFn: async (tableId: string) => {
      return apiRequest('POST', `/api/tables/${tableId}/close-session`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/tables'] });
      queryClient.invalidateQueries({ queryKey: ['/api/tables/with-orders'] });
      queryClient.invalidateQueries({ queryKey: ['/api/tables/open'] });
      toast({ 
        title: 'Checkout concluído', 
        description: 'Mesa encerrada com sucesso.' 
      });
      onOpenChange(false);
      onCheckoutComplete?.();
    },
    onError: (error: any) => {
      toast({
        title: 'Erro',
        description: error.message || 'Não foi possível encerrar a sessão.',
        variant: 'destructive',
      });
    },
  });

  const updateGuestStatusMutation = useMutation({
    mutationFn: async ({ guestId, status }: { guestId: string; status: string }) => {
      return apiRequest('PATCH', `/api/tables/${table?.id}/guests/${guestId}`, { status });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/tables/${table?.id}/orders-by-guest`] });
    },
  });

  const handleAddPayment = () => {
    setPayments([...payments, { method: 'dinheiro', amount: '' }]);
  };

  const handleRemovePayment = (index: number) => {
    if (payments.length > 1) {
      setPayments(payments.filter((_, i) => i !== index));
    }
  };

  const handlePaymentChange = (index: number, field: 'method' | 'amount', value: string) => {
    const newPayments = [...payments];
    newPayments[index][field] = value;
    setPayments(newPayments);
  };

  const handleGuestPaymentChange = (guestId: string, method: string) => {
    setSelectedGuestPayments(prev => ({
      ...prev,
      [guestId]: { ...prev[guestId], method },
    }));
  };

  const handleMarkGuestPaid = async (guestId: string) => {
    await updateGuestStatusMutation.mutateAsync({ guestId, status: 'pago' });
    setSelectedGuestPayments(prev => ({
      ...prev,
      [guestId]: { ...prev[guestId], paid: true },
    }));
  };

  const totalPaymentAmount = payments.reduce((sum, p) => sum + parseFloat(p.amount || '0'), 0);
  const remainingAmount = totalAmount - totalPaymentAmount;
  const changeAmount = receivedAmount ? parseFloat(receivedAmount) - totalPaymentAmount : 0;
  const canProceed = paymentMode === 'single' 
    ? totalPaymentAmount >= totalAmount 
    : paymentMode === 'split' 
      ? Math.abs(remainingAmount) < 0.01
      : ordersByGuest.every(og => selectedGuestPayments[og.guest.id]?.paid);

  const handleFinalizeCheckout = async () => {
    if (!table) return;

    try {
      if (paymentMode === 'single' || paymentMode === 'split') {
        for (const payment of payments) {
          if (parseFloat(payment.amount) > 0) {
            await recordPaymentMutation.mutateAsync({
              tableId: table.id,
              amount: payment.amount,
              paymentMethod: payment.method,
            });
          }
        }
      } else if (paymentMode === 'by_guest') {
        for (const guestData of ordersByGuest) {
          const guestPayment = selectedGuestPayments[guestData.guest.id];
          if (guestPayment && guestData.totalAmount > 0) {
            await recordPaymentMutation.mutateAsync({
              tableId: table.id,
              amount: guestData.totalAmount.toFixed(2),
              paymentMethod: guestPayment.method,
            });
          }
        }
      }
      
      await closeSessionMutation.mutateAsync(table.id);
    } catch (error) {
      console.error('Checkout error:', error);
    }
  };

  const handlePrintBill = () => {
    if (!table) return;
    
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      toast({ title: 'Erro', description: 'Não foi possível abrir a janela de impressão.', variant: 'destructive' });
      return;
    }

    const now = new Date();
    const printContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Conta - Mesa ${table.number}</title>
        <style>
          @media print {
            @page { size: 80mm auto; margin: 5mm; }
            body { margin: 0; padding: 0; }
          }
          body {
            font-family: 'Courier New', monospace;
            font-size: 12px;
            line-height: 1.4;
            max-width: 80mm;
            margin: 0 auto;
            padding: 10px;
          }
          .header { text-align: center; margin-bottom: 15px; border-bottom: 2px dashed #000; padding-bottom: 10px; }
          .restaurant-name { font-size: 18px; font-weight: bold; margin-bottom: 5px; }
          .table-info { font-size: 16px; font-weight: bold; margin: 10px 0; }
          .info-row { display: flex; justify-content: space-between; margin: 3px 0; }
          .section { margin: 15px 0; }
          .section-title { font-weight: bold; font-size: 13px; margin-bottom: 8px; border-bottom: 1px solid #000; padding-bottom: 3px; }
          .item { display: flex; justify-content: space-between; margin: 5px 0; }
          .item-name { flex: 1; }
          .item-price { text-align: right; white-space: nowrap; margin-left: 10px; }
          .total { border-top: 2px solid #000; margin-top: 10px; padding-top: 8px; }
          .total-row { display: flex; justify-content: space-between; font-size: 14px; font-weight: bold; margin: 5px 0; }
          .footer { text-align: center; margin-top: 20px; padding-top: 10px; border-top: 2px dashed #000; font-size: 11px; }
          .print-time { margin-top: 8px; font-size: 10px; color: #666; }
        </style>
      </head>
      <body>
        <div class="header">
          <div class="restaurant-name">NaBancada</div>
          <div class="table-info">MESA ${table.number}</div>
        </div>
        <div class="section">
          <div class="info-row">
            <span>Data:</span>
            <span>${format(now, "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}</span>
          </div>
          ${table.customerName ? `<div class="info-row"><span>Cliente:</span><span>${table.customerName}</span></div>` : ''}
          ${table.customerCount ? `<div class="info-row"><span>Pessoas:</span><span>${table.customerCount}</span></div>` : ''}
        </div>
        <div class="section">
          <div class="section-title">RESUMO DO CONSUMO</div>
          ${tableOrders.map(order => `
            <div style="margin-bottom: 10px; padding-bottom: 5px; border-bottom: 1px dashed #ccc;">
              <div class="info-row" style="font-size: 11px; color: #666;">
                <span>Pedido ${String(order.id).substring(0, 6).toUpperCase()}</span>
                <span>${formatKwanza(order.totalAmount)}</span>
              </div>
            </div>
          `).join('')}
        </div>
        <div class="total">
          <div class="total-row">
            <span>TOTAL:</span>
            <span>${formatKwanza(totalAmount)}</span>
          </div>
        </div>
        <div class="footer">
          <div>Obrigado pela preferência!</div>
          <div class="print-time">Impresso em ${format(now, "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}</div>
        </div>
        <script>
          window.onload = function() {
            window.print();
            setTimeout(function() { window.close(); }, 100);
          };
        <\/script>
      </body>
      </html>
    `;

    printWindow.document.write(printContent);
    printWindow.document.close();
  };

  if (!table) return null;

  const guestsAwaitingBill = ordersByGuest.filter(og => og.guest.status === 'aguardando_conta');
  const isProcessing = recordPaymentMutation.isPending || closeSessionMutation.isPending;

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-2xl max-h-[90vh] flex flex-col">
          <DialogHeader>
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <Receipt className="h-5 w-5 text-primary" />
                <DialogTitle>Checkout - Mesa {table.number}</DialogTitle>
              </div>
              <Badge variant="outline" className="text-lg font-bold">
                {formatKwanza(totalAmount)}
              </Badge>
            </div>
            <DialogDescription>
              Finalize o pagamento e encerre a mesa
            </DialogDescription>
          </DialogHeader>

          <ScrollArea className="flex-1 pr-4">
            <div className="space-y-4">
              {guestsAwaitingBill.length > 0 && (
                <Card className="border-orange-500/50 bg-orange-500/10">
                  <CardContent className="py-3">
                    <div className="flex items-center gap-2">
                      <AlertCircle className="h-5 w-5 text-orange-500" />
                      <span className="font-medium text-orange-500">
                        {guestsAwaitingBill.length} cliente(s) pediram a conta
                      </span>
                    </div>
                  </CardContent>
                </Card>
              )}

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base flex items-center gap-2">
                    <ShoppingBag className="h-4 w-4" />
                    Resumo da Conta
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {loadingOrders ? (
                    <div className="flex items-center justify-center py-4">
                      <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                    </div>
                  ) : ordersByGuest.length > 0 ? (
                    <div className="space-y-3">
                      {ordersByGuest.map((guestData) => (
                        <div key={guestData.guest.id} className="flex items-center justify-between py-2 border-b last:border-0">
                          <div className="flex items-center gap-2">
                            <Users className="h-4 w-4 text-muted-foreground" />
                            <span className="font-medium">
                              {guestData.guest.guestName || `Cliente ${guestData.guest.guestNumber}`}
                            </span>
                            {guestData.guest.status === 'pago' && (
                              <Badge className="bg-green-500">Pago</Badge>
                            )}
                            {guestData.guest.status === 'aguardando_conta' && (
                              <Badge className="bg-orange-500">Pediu Conta</Badge>
                            )}
                          </div>
                          <span className="font-bold">{formatKwanza(guestData.totalAmount)}</span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {tableOrders.map((order) => (
                        <div key={order.id} className="flex items-center justify-between py-1">
                          <span className="text-sm text-muted-foreground">
                            Pedido #{String(order.id).substring(0, 6).toUpperCase()}
                          </span>
                          <span className="font-medium">{formatKwanza(order.totalAmount)}</span>
                        </div>
                      ))}
                    </div>
                  )}
                  <Separator className="my-3" />
                  <div className="flex items-center justify-between">
                    <span className="text-lg font-semibold">Total</span>
                    <span className="text-xl font-bold text-primary">{formatKwanza(totalAmount)}</span>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base flex items-center gap-2">
                    <CreditCard className="h-4 w-4" />
                    Forma de Pagamento
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Tabs value={paymentMode} onValueChange={(v) => setPaymentMode(v as typeof paymentMode)}>
                    <TabsList className="grid w-full grid-cols-3">
                      <TabsTrigger value="single" data-testid="tab-payment-single">Único</TabsTrigger>
                      <TabsTrigger value="split" data-testid="tab-payment-split">Dividido</TabsTrigger>
                      <TabsTrigger 
                        value="by_guest" 
                        disabled={ordersByGuest.length === 0}
                        data-testid="tab-payment-by-guest"
                      >
                        Por Cliente
                      </TabsTrigger>
                    </TabsList>

                    <TabsContent value="single" className="space-y-4 mt-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label>Método de Pagamento</Label>
                          <Select 
                            value={payments[0]?.method || 'dinheiro'} 
                            onValueChange={(v) => handlePaymentChange(0, 'method', v)}
                          >
                            <SelectTrigger data-testid="select-payment-method">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {PAYMENT_METHODS.map(m => (
                                <SelectItem key={m.value} value={m.value}>
                                  <div className="flex items-center gap-2">
                                    <m.icon className="w-4 h-4" />
                                    {m.label}
                                  </div>
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label>Valor</Label>
                          <Input
                            type="number"
                            step="0.01"
                            value={payments[0]?.amount || ''}
                            onChange={(e) => handlePaymentChange(0, 'amount', e.target.value)}
                            data-testid="input-payment-amount"
                          />
                        </div>
                      </div>

                      {payments[0]?.method === 'dinheiro' && (
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label>Valor Recebido</Label>
                            <Input
                              type="number"
                              step="0.01"
                              placeholder="0.00"
                              value={receivedAmount}
                              onChange={(e) => setReceivedAmount(e.target.value)}
                              data-testid="input-received-amount"
                            />
                          </div>
                          <div>
                            <Label>Troco</Label>
                            <div className={`h-9 flex items-center px-3 rounded-md border bg-muted ${changeAmount >= 0 ? 'text-green-600' : 'text-destructive'}`}>
                              {changeAmount >= 0 ? formatKwanza(changeAmount) : `Faltam ${formatKwanza(Math.abs(changeAmount))}`}
                            </div>
                          </div>
                        </div>
                      )}
                    </TabsContent>

                    <TabsContent value="split" className="space-y-4 mt-4">
                      <div className="space-y-3">
                        {payments.map((payment, index) => (
                          <div key={index} className="flex items-end gap-2">
                            <div className="flex-1">
                              <Label>Método</Label>
                              <Select 
                                value={payment.method} 
                                onValueChange={(v) => handlePaymentChange(index, 'method', v)}
                              >
                                <SelectTrigger data-testid={`select-split-method-${index}`}>
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  {PAYMENT_METHODS.map(m => (
                                    <SelectItem key={m.value} value={m.value}>
                                      <div className="flex items-center gap-2">
                                        <m.icon className="w-4 h-4" />
                                        {m.label}
                                      </div>
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>
                            <div className="flex-1">
                              <Label>Valor</Label>
                              <Input
                                type="number"
                                step="0.01"
                                placeholder="0.00"
                                value={payment.amount}
                                onChange={(e) => handlePaymentChange(index, 'amount', e.target.value)}
                                data-testid={`input-split-amount-${index}`}
                              />
                            </div>
                            {payments.length > 1 && (
                              <Button 
                                variant="ghost" 
                                size="icon"
                                onClick={() => handleRemovePayment(index)}
                                data-testid={`button-remove-split-${index}`}
                              >
                                <X className="h-4 w-4" />
                              </Button>
                            )}
                          </div>
                        ))}
                      </div>
                      
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={handleAddPayment}
                        className="w-full"
                        data-testid="button-add-payment"
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Adicionar Pagamento
                      </Button>

                      <div className="flex items-center justify-between p-3 bg-muted rounded-md">
                        <span>Total Pago:</span>
                        <span className="font-bold">{formatKwanza(totalPaymentAmount)}</span>
                      </div>
                      {remainingAmount > 0.01 && (
                        <div className="flex items-center justify-between p-3 bg-orange-500/10 rounded-md text-orange-600">
                          <span>Faltam:</span>
                          <span className="font-bold">{formatKwanza(remainingAmount)}</span>
                        </div>
                      )}
                    </TabsContent>

                    <TabsContent value="by_guest" className="space-y-4 mt-4">
                      {ordersByGuest.map((guestData) => (
                        <Card key={guestData.guest.id} data-testid={`card-guest-payment-${guestData.guest.id}`}>
                          <CardContent className="p-4">
                            <div className="flex items-center justify-between gap-3">
                              <div className="flex items-center gap-2 flex-1">
                                <Users className="h-4 w-4 text-muted-foreground" />
                                <span className="font-medium">
                                  {guestData.guest.guestName || `Cliente ${guestData.guest.guestNumber}`}
                                </span>
                                <span className="font-bold">{formatKwanza(guestData.totalAmount)}</span>
                              </div>
                              {selectedGuestPayments[guestData.guest.id]?.paid || guestData.guest.status === 'pago' ? (
                                <Badge className="bg-green-500">
                                  <Check className="h-3 w-3 mr-1" />
                                  Pago
                                </Badge>
                              ) : (
                                <div className="flex items-center gap-2">
                                  <Select 
                                    value={selectedGuestPayments[guestData.guest.id]?.method || 'dinheiro'}
                                    onValueChange={(v) => handleGuestPaymentChange(guestData.guest.id, v)}
                                  >
                                    <SelectTrigger className="w-[130px]" data-testid={`select-guest-method-${guestData.guest.id}`}>
                                      <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                      {PAYMENT_METHODS.map(m => (
                                        <SelectItem key={m.value} value={m.value}>
                                          <div className="flex items-center gap-2">
                                            <m.icon className="w-4 h-4" />
                                            {m.label}
                                          </div>
                                        </SelectItem>
                                      ))}
                                    </SelectContent>
                                  </Select>
                                  <Button 
                                    size="sm"
                                    onClick={() => handleMarkGuestPaid(guestData.guest.id)}
                                    disabled={updateGuestStatusMutation.isPending}
                                    data-testid={`button-mark-guest-paid-${guestData.guest.id}`}
                                  >
                                    <Check className="h-4 w-4 mr-1" />
                                    Pagar
                                  </Button>
                                </div>
                              )}
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </TabsContent>
                  </Tabs>
                </CardContent>
              </Card>
            </div>
          </ScrollArea>

          <DialogFooter className="flex-row gap-2 pt-4 border-t">
            <Button 
              variant="outline" 
              onClick={handlePrintBill}
              data-testid="button-print-bill"
            >
              <Printer className="h-4 w-4 mr-2" />
              Imprimir
            </Button>
            <div className="flex-1" />
            <Button 
              variant="outline" 
              onClick={() => onOpenChange(false)}
              data-testid="button-cancel-checkout"
            >
              Cancelar
            </Button>
            <Button 
              onClick={() => setShowConfirmDialog(true)}
              disabled={!canProceed || isProcessing}
              data-testid="button-finalize-checkout"
            >
              {isProcessing ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Processando...
                </>
              ) : (
                <>
                  <Check className="h-4 w-4 mr-2" />
                  Finalizar Checkout
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar Checkout</AlertDialogTitle>
            <AlertDialogDescription>
              Você está prestes a finalizar o checkout da Mesa {table.number} no valor de{' '}
              <span className="font-bold">{formatKwanza(totalAmount)}</span>.
              Esta ação irá registrar o pagamento e liberar a mesa.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isProcessing}>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleFinalizeCheckout}
              disabled={isProcessing}
              data-testid="button-confirm-finalize"
            >
              {isProcessing ? 'Finalizando...' : 'Confirmar'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
