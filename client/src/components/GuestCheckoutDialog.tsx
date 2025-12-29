import { useState } from 'react';
import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { CreditCard, Banknote, Building2, Smartphone, Award, Gift } from 'lucide-react';
import { formatKwanza } from '@/lib/formatters';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import type { TableGuest, Customer, LoyaltyProgram } from '@shared/schema';

interface GuestCheckoutDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  guest: TableGuest & { customer?: Customer };
  tableId: string;
  sessionId: string;
}

type PaymentMethod = 'dinheiro' | 'multicaixa' | 'transferencia' | 'cartao';

export function GuestCheckoutDialog({ 
  open, 
  onOpenChange, 
  guest, 
  tableId,
  sessionId 
}: GuestCheckoutDialogProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('dinheiro');
  const [redeemPoints, setRedeemPoints] = useState(0);

  const subtotal = parseFloat(guest.subtotal || '0');
  const paidAmount = parseFloat(guest.paidAmount || '0');
  const pendingAmount = subtotal - paidAmount;

  // Fetch loyalty program if customer exists
  const { data: loyaltyProgram } = useQuery<LoyaltyProgram>({
    queryKey: ['/api/loyalty-program'],
    enabled: !!guest.customerId && open,
  });

  // Calculate max redeemable points
  const getMaxRedeemablePoints = () => {
    if (!guest.customer || !loyaltyProgram?.isActive) return 0;
    
    const customerPoints = guest.customer.loyaltyPoints;
    const currencyPerPoint = parseFloat(loyaltyProgram.currencyPerPoint || '0');
    const maxPointsByOrder = loyaltyProgram.maxPointsPerOrder || Infinity;
    const maxPointsByAmount = Math.floor(pendingAmount / currencyPerPoint);
    
    return Math.min(customerPoints, maxPointsByOrder, maxPointsByAmount);
  };

  const maxRedeemable = getMaxRedeemablePoints();
  const pointsDiscount = redeemPoints * parseFloat(loyaltyProgram?.currencyPerPoint || '0');
  const finalAmount = Math.max(0, pendingAmount - pointsDiscount);

  // Calculate points to earn
  const pointsToEarn = guest.customerId && loyaltyProgram?.isActive
    ? Math.floor(finalAmount * parseFloat(loyaltyProgram.pointsPerCurrency || '0'))
    : 0;

  const checkoutMutation = useMutation({
    mutationFn: async () => {
      // Process payment for this specific guest
      const response = await apiRequest('POST', `/api/tables/${tableId}/guests/${guest.id}/checkout`, {
        paymentMethod,
        amount: finalAmount.toFixed(2),
        redeemPoints: redeemPoints > 0 ? redeemPoints : undefined,
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/tables/${tableId}/guests`] });
      queryClient.invalidateQueries({ queryKey: [`/api/tables/${tableId}`] });
      if (guest.customerId) {
        queryClient.invalidateQueries({ queryKey: ['/api/customers', guest.customerId] });
      }
      
      toast({
        title: 'Pagamento realizado!',
        description: guest.customerId 
          ? `${pointsToEarn} pontos foram creditados na sua conta.`
          : 'Obrigado pela preferência!',
      });
      
      onOpenChange(false);
    },
    onError: (error: any) => {
      toast({
        title: 'Erro no pagamento',
        description: error.message || 'Não foi possível processar o pagamento.',
        variant: 'destructive',
      });
    },
  });

  const handleCheckout = () => {
    if (finalAmount <= 0) {
      toast({
        title: 'Atenção',
        description: 'Não há valor pendente para pagamento.',
        variant: 'destructive',
      });
      return;
    }
    checkoutMutation.mutate();
  };

  const paymentMethods = [
    { value: 'dinheiro', label: 'Dinheiro', icon: Banknote },
    { value: 'multicaixa', label: 'Multicaixa', icon: CreditCard },
    { value: 'transferencia', label: 'Transferência', icon: Building2 },
    { value: 'cartao', label: 'Cartão', icon: Smartphone },
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            Checkout Individual
          </DialogTitle>
          <DialogDescription>
            {guest.customer 
              ? `Pagamento para ${guest.customer.name}`
              : `Pagamento para ${guest.name || 'Convidado'}`
            }
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Customer Badge */}
          {guest.customer && (
            <Card className="border-2 border-primary/20 bg-gradient-to-br from-orange-50 to-pink-50">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Cliente VIP</p>
                    <p className="font-semibold">{guest.customer.name}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-muted-foreground">Pontos Disponíveis</p>
                    <p className="font-bold text-lg text-orange-600 flex items-center gap-1">
                      <Award className="h-4 w-4" />
                      {guest.customer.loyaltyPoints}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Amount Summary */}
          <Card>
            <CardContent className="p-4 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Subtotal</span>
                <span className="font-medium">{formatKwanza(subtotal)}</span>
              </div>
              {paidAmount > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Já Pago</span>
                  <span className="font-medium text-green-600">-{formatKwanza(paidAmount)}</span>
                </div>
              )}
              {redeemPoints > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground flex items-center gap-1">
                    <Gift className="h-3 w-3" />
                    Resgate de Pontos ({redeemPoints} pts)
                  </span>
                  <span className="font-medium text-purple-600">-{formatKwanza(pointsDiscount)}</span>
                </div>
              )}
              <Separator />
              <div className="flex justify-between font-bold text-lg">
                <span>Total a Pagar</span>
                <span className="text-primary">{formatKwanza(finalAmount)}</span>
              </div>
            </CardContent>
          </Card>

          {/* Redeem Points */}
          {guest.customerId && maxRedeemable > 0 && (
            <Card className="border-purple-200 bg-purple-50/50">
              <CardContent className="p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <Label className="flex items-center gap-2 font-semibold">
                    <Gift className="h-4 w-4 text-purple-600" />
                    Resgatar Pontos
                  </Label>
                  <Badge variant="secondary" className="bg-purple-100 text-purple-700">
                    Máx: {maxRedeemable} pts
                  </Badge>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    onClick={() => setRedeemPoints(Math.max(0, redeemPoints - 10))}
                    disabled={redeemPoints <= 0}
                  >
                    -
                  </Button>
                  <div className="flex-1 text-center">
                    <input
                      type="number"
                      min="0"
                      max={maxRedeemable}
                      value={redeemPoints}
                      onChange={(e) => setRedeemPoints(Math.min(maxRedeemable, Math.max(0, parseInt(e.target.value) || 0)))}
                      className="w-full text-center border rounded px-2 py-1"
                    />
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    onClick={() => setRedeemPoints(Math.min(maxRedeemable, redeemPoints + 10))}
                    disabled={redeemPoints >= maxRedeemable}
                  >
                    +
                  </Button>
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setRedeemPoints(maxRedeemable)}
                  className="w-full text-xs"
                >
                  Usar Máximo ({maxRedeemable} pts)
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Points to Earn */}
          {pointsToEarn > 0 && (
            <Card className="border-green-200 bg-green-50/50">
              <CardContent className="p-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="flex items-center gap-2 text-green-700">
                    <Award className="h-4 w-4" />
                    Pontos a Ganhar
                  </span>
                  <span className="font-bold text-green-700">+{pointsToEarn} pts</span>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Payment Method */}
          <div className="space-y-3">
            <Label className="font-semibold">Método de Pagamento</Label>
            <RadioGroup value={paymentMethod} onValueChange={(v) => setPaymentMethod(v as PaymentMethod)}>
              {paymentMethods.map((method) => (
                <div key={method.value} className="flex items-center space-x-2">
                  <RadioGroupItem value={method.value} id={method.value} />
                  <Label htmlFor={method.value} className="flex items-center gap-2 cursor-pointer flex-1">
                    <method.icon className="h-4 w-4" />
                    {method.label}
                  </Label>
                </div>
              ))}
            </RadioGroup>
          </div>

          {/* Actions */}
          <div className="flex gap-2 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="flex-1"
            >
              Cancelar
            </Button>
            <Button
              type="button"
              onClick={handleCheckout}
              disabled={checkoutMutation.isPending || finalAmount <= 0}
              className="flex-1 bg-green-600 hover:bg-green-700"
            >
              {checkoutMutation.isPending ? 'Processando...' : `Pagar ${formatKwanza(finalAmount)}`}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
