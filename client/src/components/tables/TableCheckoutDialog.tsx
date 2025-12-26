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
import { AlertCircle, Receipt, Users, CreditCard } from 'lucide-react';
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
  const [checkoutMode, setCheckoutMode] = useState<'simple' | 'by_guest'>('simple');
  const [splitEqually, setSplitEqually] = useState(false);
  const [numberOfPeople, setNumberOfPeople] = useState(2);
  const [payingGuests, setPayingGuests] = useState<Record<string, boolean>>({});

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

  // Reset state when dialog opens
  useEffect(() => {
    if (open) {
      setCheckoutMode('simple');
      setSplitEqually(false);
      setNumberOfPeople(2);
      setPayingGuests({});
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

  const isProcessing = recordPaymentMutation.isPending || closeSessionMutation.isPending;

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
            <Tabs value={checkoutMode} onValueChange={(v) => setCheckoutMode(v as 'simple' | 'by_guest')}>
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="simple" data-testid="tab-simple-payment">
                  <Receipt className="w-4 h-4 mr-2" />
                  Pagamento Único
                </TabsTrigger>
                <TabsTrigger value="by_guest" data-testid="tab-guest-payment">
                  <Users className="w-4 h-4 mr-2" />
                  Por Cliente
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
            </Tabs>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
