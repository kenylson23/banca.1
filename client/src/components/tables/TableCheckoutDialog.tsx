import { useState, useEffect } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useLocation } from 'wouter';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { AlertCircle, Receipt, Users, CreditCard, Percent, Tag } from 'lucide-react';
import { formatKwanza } from '@/lib/formatters';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import type { Table } from '@shared/schema';
import { PaymentForm } from '@/components/PaymentForm';
import { GuestPaymentCard } from './GuestPaymentCard';

interface TableCheckoutDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  table: Table | null;
  onCheckoutComplete?: () => void;
}

interface TableGuest {
  id: string;
  sessionId: string;
  name: string | null;
  guestNumber: number;
  status: string;
  subtotal: string;
  paidAmount: string;
  joinedAt: Date;
}

interface OrdersByGuest {
  guest: TableGuest;
  orders: any[];
  subtotal: string;
}

export function TableCheckoutDialog({ open, onOpenChange, table, onCheckoutComplete }: TableCheckoutDialogProps) {
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const [checkoutMode, setCheckoutMode] = useState<'simple' | 'by_guest' | 'advanced'>('simple');
  const [splitEqually, setSplitEqually] = useState(false);
  const [numberOfPeople, setNumberOfPeople] = useState(2);
  const [payingGuests, setPayingGuests] = useState<Record<string, boolean>>({});
  
  // Advanced checkout fields
  const [discountValue, setDiscountValue] = useState('0');
  const [discountType, setDiscountType] = useState<'valor' | 'percentual'>('valor');
  const [serviceCharge, setServiceCharge] = useState('0');
  const [deliveryFee, setDeliveryFee] = useState('0');
  const [packagingFee, setPackagingFee] = useState('0');
  const [redeemPoints, setRedeemPoints] = useState(false);
  const [pointsToRedeem, setPointsToRedeem] = useState('0');

  const totalAmount = parseFloat(table?.totalAmount || '0');

  // Fetch orders grouped by guest
  const { data: ordersData, isLoading: loadingOrders } = useQuery<{ 
    ordersByGuest: OrdersByGuest[]; 
    anonymousOrders: any[]; 
    totalAmount: string;
    paidAmount: string; // Adicionado para rastrear pagamentos parciais
  }>({
    queryKey: [`/api/tables/${table?.id}/orders-by-guest`],
    enabled: !!table?.id && open,
  });

  const ordersByGuest = ordersData?.ordersByGuest || [];
  const hasGuests = ordersByGuest.length > 0;
  const tablePaidAmount = parseFloat(ordersData?.paidAmount || '0');
  const remainingTotal = totalAmount - tablePaidAmount;

  // Calculate adjusted total for advanced checkout
  const calculateAdjustedTotal = () => {
    let adjusted = totalAmount;
    const discount = parseFloat(discountValue) || 0;
    const serviceChargeVal = parseFloat(serviceCharge) || 0;
    const deliveryVal = parseFloat(deliveryFee) || 0;
    const packagingVal = parseFloat(packagingFee) || 0;
    
    if (discountType === 'percentual') {
      adjusted -= (adjusted * discount) / 100;
    } else {
      adjusted -= discount;
    }
    
    adjusted += serviceChargeVal + deliveryVal + packagingVal;
    
    if (redeemPoints) {
      const points = parseInt(pointsToRedeem) || 0;
      // Assume 1 point = 1 unit of currency for now, or use restaurant config
      adjusted -= points;
    }
    
    return Math.max(0, adjusted);
  };

  // Reset state when dialog opens
  useEffect(() => {
    if (open) {
      setCheckoutMode('simple');
      setSplitEqually(false);
      setNumberOfPeople(2);
      setPayingGuests({});
      setDiscountValue('0');
      setDiscountType('valor');
      setServiceCharge('0');
      setDeliveryFee('0');
      setPackagingFee('0');
      setRedeemPoints(false);
      setPointsToRedeem('0');
    }
  }, [open]);

  // Mutations
  const recordPaymentMutation = useMutation({
    mutationFn: async ({ 
      tableId, 
      amount, 
      paymentMethod, 
      receivedAmount 
    }: { 
      tableId: string; 
      amount: string; 
      paymentMethod: string; 
      receivedAmount?: string;
    }) => {
      return apiRequest('POST', `/api/tables/${tableId}/payment`, {
        amount,
        paymentMethod,
        receivedAmount,
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
        title: 'Mesa fechada', 
        description: 'Checkout concluído com sucesso.' 
      });
      onOpenChange(false);
      onCheckoutComplete?.();
    },
    onError: (error: any) => {
      toast({
        title: 'Erro',
        description: error.message || 'Não foi possível fechar a mesa.',
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
      toast({ title: 'Pagamento registrado', description: 'Status do cliente atualizado.' });
    },
  });

  // Handle simple payment (entire table)
  const handleSimplePayment = async (paymentData: {
    paymentMethod: string;
    receivedAmount?: string;
  }) => {
    if (!table) return;

    try {
      const amountToPay = splitEqually 
        ? (remainingTotal / numberOfPeople).toFixed(2)
        : remainingTotal.toFixed(2);

      await recordPaymentMutation.mutateAsync({
        tableId: table.id,
        amount: amountToPay,
        paymentMethod: paymentData.paymentMethod,
        receivedAmount: paymentData.receivedAmount,
      });

      // If not split and remaining is fully covered, close the session
      if (!splitEqually) {
        await closeSessionMutation.mutateAsync(table.id);
      } else {
        toast({
          title: 'Pagamento registrado',
          description: `Pagamento de ${formatKwanza(amountToPay)} registrado.`,
        });
      }
    } catch (error) {
      console.error('Payment error:', error);
    }
  };

  // Handle guest payment
  const handleGuestPayment = async (guestId: string, paymentMethod: string) => {
    if (!table) return;

    try {
      const guestData = ordersByGuest.find(og => og.guest.id === guestId);
      if (!guestData) return;

      const amountToPay = (guestData.subtotal || "0");

      await recordPaymentMutation.mutateAsync({
        tableId: table.id,
        amount: amountToPay,
        paymentMethod,
      });

      // Se o status ainda não for pago, atualiza (a recordPayment no backend já faz isso, mas por redundância/UI)
      if (guestData.guest.status !== 'pago') {
        await updateGuestStatusMutation.mutateAsync({
          guestId,
          status: 'pago',
        });
      }

      setPayingGuests(prev => ({ ...prev, [guestId]: true }));

      toast({
        title: 'Pagamento registrado',
        description: `${guestData.guest.name || `Cliente ${guestData.guest.guestNumber}`} marcado como pago.`,
      });
    } catch (error) {
      console.error('Guest payment error:', error);
    }
  };

  // Advanced checkout mutation
  const fullCheckoutMutation = useMutation({
    mutationFn: async (data: {
      orderId: string;
      discount?: string;
      discountType?: 'valor' | 'percentual';
      serviceCharge?: string;
      deliveryFee?: string;
      packagingFee?: string;
      paymentAmount?: string;
      paymentMethod?: string;
      receivedAmount?: string;
      closeSession?: boolean;
    }) => {
      return apiRequest('POST', `/api/orders/${data.orderId}/full-checkout`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/tables'] });
      queryClient.invalidateQueries({ queryKey: ['/api/tables/with-orders'] });
      queryClient.invalidateQueries({ queryKey: ['/api/tables/open'] });
      toast({ title: 'Checkout concluído', description: 'Ajustes e pagamento processados com sucesso.' });
      onOpenChange(false);
      onCheckoutComplete?.();
    },
    onError: (error: any) => {
      toast({
        title: 'Erro no checkout',
        description: error.message || 'Não foi possível processar o checkout completo.',
        variant: 'destructive',
      });
    },
  });

  // Handle advanced checkout
  const handleAdvancedCheckout = async () => {
    const mainOrder = ordersByGuest.flatMap(g => g.orders)[0] || ordersData?.anonymousOrders?.[0];
    if (!mainOrder) {
      toast({ title: 'Erro', description: 'Nenhum pedido encontrado para ajustar.', variant: 'destructive' });
      return;
    }

    await fullCheckoutMutation.mutateAsync({
      orderId: mainOrder.id,
      discount: discountValue,
      discountType,
      serviceCharge,
      deliveryFee,
      packagingFee,
      paymentAmount: calculateAdjustedTotal().toFixed(2),
      paymentMethod: 'dinheiro',
      closeSession: true,
      redeemLoyaltyPoints: redeemPoints ? parseInt(pointsToRedeem) : undefined
    });
  };

  const isProcessing = recordPaymentMutation.isPending || closeSessionMutation.isPending || fullCheckoutMutation.isPending;

  if (!table) return null;

  const amountPerPerson = splitEqually ? totalAmount / numberOfPeople : totalAmount;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Receipt className="w-5 h-5" />
            Checkout - Mesa {table.number}
          </DialogTitle>
        </DialogHeader>

        <ScrollArea className="max-h-[calc(90vh-120px)]">
          <div className="space-y-4 p-1">
            {/* Total Summary */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">Resumo</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between text-lg font-semibold">
                    <span>Total Consumido:</span>
                    <span>{formatKwanza(totalAmount)}</span>
                  </div>
                  {tablePaidAmount > 0 && (
                    <div className="flex justify-between text-green-600 font-medium">
                      <span>Total Pago:</span>
                      <span>{formatKwanza(tablePaidAmount)}</span>
                    </div>
                  )}
                  <Separator />
                  <div className="flex justify-between text-xl font-bold text-orange-600">
                    <span>A Pagar:</span>
                    <span>{formatKwanza(remainingTotal)}</span>
                  </div>
                  {hasGuests && (
                    <div className="text-sm text-muted-foreground">
                      {ordersByGuest.length} {ordersByGuest.length === 1 ? 'cliente' : 'clientes'} na mesa
                    </div>
                  )}
                  
                  {/* Note: Advanced checkout available through order management */}
                </div>
              </CardContent>
            </Card>

            {/* Checkout Modes */}
            <Tabs value={checkoutMode} onValueChange={(v) => setCheckoutMode(v as 'simple' | 'by_guest' | 'advanced')}>
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="simple" data-testid="tab-simple-payment">
                  <Receipt className="w-4 h-4 mr-2" />
                  Pagamento Único
                </TabsTrigger>
                <TabsTrigger value="by_guest" data-testid="tab-guest-payment">
                  <Users className="w-4 h-4 mr-2" />
                  Por Cliente
                </TabsTrigger>
                <TabsTrigger value="advanced" data-testid="tab-advanced-payment">
                  <Tag className="w-4 h-4 mr-2" />
                  Ajustes
                </TabsTrigger>
              </TabsList>

              {/* Simple Payment Mode */}
              <TabsContent value="simple" className="space-y-4">
                {/* Split Equally Option */}
                <Card>
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label>Dividir conta igualmente</Label>
                        <p className="text-sm text-muted-foreground">
                          Dividir o total entre várias pessoas
                        </p>
                      </div>
                      <Switch
                        checked={splitEqually}
                        onCheckedChange={setSplitEqually}
                      />
                    </div>

                    {splitEqually && (
                      <>
                        <Separator className="my-4" />
                        <div className="space-y-2">
                          <Label>Número de pessoas</Label>
                          <Input
                            type="number"
                            min="2"
                            value={numberOfPeople}
                            onChange={(e) => setNumberOfPeople(Math.max(2, parseInt(e.target.value) || 2))}
                          />
                          <div className="text-sm text-muted-foreground">
                            Valor por pessoa: <span className="font-medium">{formatKwanza(amountPerPerson)}</span>
                          </div>
                        </div>
                      </>
                    )}
                  </CardContent>
                </Card>

                {/* Payment Form */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Pagamento</CardTitle>
                    <CardDescription>
                      {splitEqually 
                        ? `Registrar pagamento de ${formatKwanza(amountPerPerson)} (pessoa 1 de ${numberOfPeople})`
                        : 'Registrar pagamento total da mesa'}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <PaymentForm
                      totalAmount={splitEqually ? (remainingTotal / numberOfPeople) : remainingTotal}
                      paidAmount={0}
                      onSubmit={handleSimplePayment}
                      isPending={isProcessing}
                      allowSplit={splitEqually}
                    />
                  </CardContent>
                </Card>
              </TabsContent>

              {/* By Guest Payment Mode */}
              <TabsContent value="by_guest" className="space-y-4">
                {loadingOrders ? (
                  <Card>
                    <CardContent className="py-8 text-center text-muted-foreground">
                      Carregando clientes...
                    </CardContent>
                  </Card>
                ) : ordersByGuest.length === 0 ? (
                  <Card>
                    <CardContent className="py-8">
                      <div className="flex flex-col items-center gap-2 text-muted-foreground">
                        <AlertCircle className="w-8 h-8" />
                        <p>Nenhum cliente registrado nesta mesa</p>
                        <p className="text-sm">Use o pagamento único para fechar a conta</p>
                      </div>
                    </CardContent>
                  </Card>
                ) : (
                  <>
                    <div className="space-y-2">
                      {ordersByGuest.map((guestData) => (
                        <GuestPaymentCard
                          key={guestData.guest.id}
                          guest={{
                            ...guestData.guest,
                            subtotal: guestData.subtotal,
                            paidAmount: guestData.guest.paidAmount || '0.00',
                          }}
                          orders={guestData.orders?.map((order: any) => ({
                            id: order.id,
                            itemName: order.itemName,
                            quantity: order.quantity,
                            price: order.price,
                            subtotal: (parseFloat(order.price || '0') * order.quantity).toFixed(2),
                          })) || []}
                          onPay={handleGuestPayment}
                          isPaying={isProcessing}
                        />
                      ))}
                    </div>

                    {/* Summary */}
                    <Card className="border-primary">
                      <CardContent className="pt-6">
                        <div className="flex justify-between items-center">
                          <span className="font-medium">Total Geral:</span>
                          <span className="text-lg font-bold">{formatKwanza(totalAmount)}</span>
                        </div>
                        <div className="mt-2 text-sm text-muted-foreground">
                          {ordersByGuest.filter(og => payingGuests[og.guest.id] || og.guest.status === 'pago').length} de {ordersByGuest.length} clientes pagos
                        </div>
                      </CardContent>
                    </Card>
                  </>
                )}
              </TabsContent>

              {/* Advanced Adjustments Mode */}
              <TabsContent value="advanced" className="space-y-4">
                <Card className="border-blue-200 bg-blue-50/30 dark:bg-blue-950/20">
                  <CardContent className="pt-6 space-y-4">
                    {/* Breakdown */}
                    <div className="bg-white dark:bg-slate-950 p-4 rounded-lg space-y-2 text-sm">
                      <div className="flex justify-between font-medium">
                        <span>Subtotal:</span>
                        <span>{formatKwanza(totalAmount)}</span>
                      </div>
                      
                      {(parseFloat(discountValue) || 0) > 0 && (
                        <div className="flex justify-between text-green-600">
                          <span>Desconto ({discountType === 'percentual' ? discountValue + '%' : ''})</span>
                          <span>-{formatKwanza(
                            discountType === 'percentual' 
                              ? (totalAmount * parseFloat(discountValue)) / 100 
                              : parseFloat(discountValue)
                          )}</span>
                        </div>
                      )}
                      
                      {(parseFloat(serviceCharge) || 0) > 0 && (
                        <div className="flex justify-between text-orange-600">
                          <span>Taxa de Serviço</span>
                          <span>+{formatKwanza(parseFloat(serviceCharge))}</span>
                        </div>
                      )}
                      
                      {(parseFloat(deliveryFee) || 0) > 0 && (
                        <div className="flex justify-between text-orange-600">
                          <span>Taxa de Entrega</span>
                          <span>+{formatKwanza(parseFloat(deliveryFee))}</span>
                        </div>
                      )}
                      
                      {(parseFloat(packagingFee) || 0) > 0 && (
                        <div className="flex justify-between text-orange-600">
                          <span>Taxa de Embalagem</span>
                          <span>+{formatKwanza(parseFloat(packagingFee))}</span>
                        </div>
                      )}
                      
                      <Separator className="my-2" />
                      
                      <div className="flex justify-between font-bold text-lg">
                        <span>Total Final:</span>
                        <span className="text-green-600">{formatKwanza(calculateAdjustedTotal())}</span>
                      </div>
                    </div>

                    {/* Loyalty Points Redemption */}
                    <Card className="border-purple-200 bg-purple-50/30 dark:bg-purple-950/20">
                      <CardContent className="pt-4 space-y-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Tag className="w-4 h-4 text-purple-600" />
                            <Label className="font-medium">Resgatar Pontos</Label>
                          </div>
                          <Switch
                            checked={redeemPoints}
                            onCheckedChange={setRedeemPoints}
                          />
                        </div>
                        {redeemPoints && (
                          <div className="space-y-2 animate-in fade-in slide-in-from-top-1">
                            <Label className="text-sm">Pontos a resgatar</Label>
                            <Input
                              type="number"
                              value={pointsToRedeem}
                              onChange={(e) => setPointsToRedeem(e.target.value)}
                              placeholder="0"
                              className="h-9"
                            />
                            <p className="text-xs text-muted-foreground">
                              1 ponto = {formatKwanza(1)} de desconto
                            </p>
                          </div>
                        )}
                      </CardContent>
                    </Card>

                    {/* Adjustment Fields */}
                    <div className="space-y-3">
                      <div className="space-y-2">
                        <Label className="flex items-center gap-2">
                          <Percent className="w-4 h-4" />
                          Desconto
                        </Label>
                        <div className="flex gap-2">
                          <Input
                            type="number"
                            step="0.01"
                            value={discountValue}
                            onChange={(e) => setDiscountValue(e.target.value)}
                            placeholder="0.00"
                            className="flex-1"
                            data-testid="input-discount"
                          />
                          <select 
                            value={discountType} 
                            onChange={(e) => setDiscountType(e.target.value as 'valor' | 'percentual')}
                            className="px-3 py-2 border border-gray-200 rounded-md"
                            data-testid="select-discount-type"
                          >
                            <option value="valor">Valor</option>
                            <option value="percentual">%</option>
                          </select>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label>Taxa de Serviço</Label>
                        <Input
                          type="number"
                          step="0.01"
                          value={serviceCharge}
                          onChange={(e) => setServiceCharge(e.target.value)}
                          placeholder="0.00"
                          data-testid="input-service-charge"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label>Taxa de Entrega</Label>
                        <Input
                          type="number"
                          step="0.01"
                          value={deliveryFee}
                          onChange={(e) => setDeliveryFee(e.target.value)}
                          placeholder="0.00"
                          data-testid="input-delivery-fee"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label>Taxa de Embalagem</Label>
                        <Input
                          type="number"
                          step="0.01"
                          value={packagingFee}
                          onChange={(e) => setPackagingFee(e.target.value)}
                          placeholder="0.00"
                          data-testid="input-packaging-fee"
                        />
                      </div>
                    </div>

                    <Button 
                      className="w-full h-12 text-base"
                      onClick={handleAdvancedCheckout}
                      disabled={isProcessing}
                      data-testid="button-apply-adjustments"
                    >
                      {isProcessing ? 'Processando...' : 'Aplicar Ajustes e Pagar'}
                    </Button>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
