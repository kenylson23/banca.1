import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Check, ChevronDown, ChevronUp, Settings, Percent } from "lucide-react";
import { formatKwanza } from "@/lib/formatters";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface Order {
  id: string;
  itemName: string;
  quantity: number;
  price: string;
  subtotal: string;
}

interface GuestPaymentCardProps {
  guest: {
    id: string;
    name: string | null;
    guestNumber: number;
    subtotal: string;
    paidAmount: string;
    status: string;
  };
  orders?: Order[];
  onPay: (guestId: string, paymentMethod: string) => Promise<void>;
  isPaying?: boolean;
  adjustments?: {
    discountValue: string;
    discountType: 'valor' | 'percentual';
    serviceCharge: string;
    showAdjustments: boolean;
  };
  onAdjustmentsChange?: (guestId: string, adjustments: {
    discountValue: string;
    discountType: 'valor' | 'percentual';
    serviceCharge: string;
    showAdjustments: boolean;
  }) => void;
}

const PAYMENT_METHODS = [
  { value: "dinheiro", label: "Dinheiro" },
  { value: "multicaixa", label: "Multicaixa" },
  { value: "transferencia", label: "Transferência" },
  { value: "cartao", label: "Cartão" },
];

export function GuestPaymentCard({ 
  guest, 
  orders = [], 
  onPay, 
  isPaying,
  adjustments,
  onAdjustmentsChange 
}: GuestPaymentCardProps) {
  const [paymentMethod, setPaymentMethod] = useState("dinheiro");
  const [showOrders, setShowOrders] = useState(false);
  
  const guestName = guest.name || `Cliente ${guest.guestNumber}`;
  const baseSubtotal = Number(guest.subtotal);
  const paidAmount = Number(guest.paidAmount);
  
  // Calculate adjusted total if adjustments exist
  const getAdjustedTotal = () => {
    if (!adjustments || (!parseFloat(adjustments.discountValue) && !parseFloat(adjustments.serviceCharge))) {
      return baseSubtotal;
    }
    
    let adjusted = baseSubtotal;
    const discount = parseFloat(adjustments.discountValue) || 0;
    const serviceCharge = parseFloat(adjustments.serviceCharge) || 0;
    
    if (adjustments.discountType === 'percentual') {
      adjusted -= (adjusted * discount) / 100;
    } else {
      adjusted -= discount;
    }
    
    adjusted += serviceCharge;
    return Math.max(0, adjusted);
  };
  
  const adjustedTotal = getAdjustedTotal();
  const remaining = adjustedTotal - paidAmount;
  const isPaid = guest.status === 'pago' || remaining <= 0;
  
  const handleToggleAdjustments = () => {
    if (onAdjustmentsChange) {
      onAdjustmentsChange(guest.id, {
        discountValue: adjustments?.discountValue || '0',
        discountType: adjustments?.discountType || 'valor',
        serviceCharge: adjustments?.serviceCharge || '0',
        showAdjustments: !adjustments?.showAdjustments
      });
    }
  };
  
  const handleAdjustmentChange = (field: string, value: string | 'valor' | 'percentual') => {
    if (onAdjustmentsChange && adjustments) {
      onAdjustmentsChange(guest.id, {
        ...adjustments,
        [field]: value
      });
    }
  };

  const handlePay = async () => {
    if (!isPaid && remaining > 0) {
      await onPay(guest.id, paymentMethod);
    }
  };

  return (
    <Card className={isPaid ? "border-green-600/40 bg-green-50/50 dark:bg-green-950/20" : "border-muted hover:border-primary/50"}>
      {/* Header */}
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-sm font-semibold">
              {guest.guestNumber}
            </div>
            <div>
              <CardTitle className="text-base">{guestName}</CardTitle>
            </div>
            {isPaid && (
              <Badge variant="default" className="bg-green-600">
                <Check className="w-3 h-3 mr-1" />
                Pago
              </Badge>
            )}
          </div>
          {orders.length > 0 && !isPaid && (
            <Button
              size="sm"
              variant="ghost"
              onClick={() => setShowOrders(!showOrders)}
              data-testid="button-toggle-orders"
            >
              {showOrders ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </Button>
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-3">
        {/* Orders Summary */}
        {showOrders && orders.length > 0 && (
          <>
            <div className="bg-muted/30 rounded-md p-3 space-y-2 text-sm">
              <div className="font-medium text-muted-foreground mb-2">Itens da Conta:</div>
              {orders.map((order) => (
                <div key={order.id} className="flex justify-between text-xs">
                  <span>
                    {order.quantity}x {order.itemName}
                  </span>
                  <span className="font-medium">{formatKwanza(order.subtotal)}</span>
                </div>
              ))}
            </div>
            <Separator className="my-2" />
          </>
        )}

        {/* Amount Summary */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Subtotal:</span>
            <span className="font-semibold">{formatKwanza(guest.subtotal)}</span>
          </div>
          
          {/* Adjustments Toggle */}
          {!isPaid && onAdjustmentsChange && (
            <Button
              size="sm"
              variant="ghost"
              onClick={handleToggleAdjustments}
              className="w-full justify-start gap-2 h-8"
            >
              <Settings className="w-3 h-3" />
              {adjustments?.showAdjustments ? 'Ocultar Ajustes' : 'Adicionar Desconto/Taxa'}
            </Button>
          )}
          
          {/* Adjustments Panel */}
          {adjustments?.showAdjustments && !isPaid && (
            <div className="bg-muted/30 rounded-md p-3 space-y-3">
              {/* Discount */}
              <div className="space-y-2">
                <Label className="text-xs flex items-center gap-1">
                  <Percent className="w-3 h-3" />
                  Desconto
                </Label>
                <div className="flex gap-2">
                  <Input
                    type="number"
                    step="0.01"
                    value={adjustments.discountValue}
                    onChange={(e) => handleAdjustmentChange('discountValue', e.target.value)}
                    placeholder="0.00"
                    className="h-8 text-xs"
                  />
                  <select 
                    value={adjustments.discountType}
                    onChange={(e) => handleAdjustmentChange('discountType', e.target.value as 'valor' | 'percentual')}
                    className="h-8 px-2 border border-gray-200 rounded-md text-xs"
                  >
                    <option value="valor">Kz</option>
                    <option value="percentual">%</option>
                  </select>
                </div>
              </div>
              
              {/* Service Charge */}
              <div className="space-y-2">
                <Label className="text-xs">Taxa de Serviço</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={adjustments.serviceCharge}
                  onChange={(e) => handleAdjustmentChange('serviceCharge', e.target.value)}
                  placeholder="0.00"
                  className="h-8 text-xs"
                />
              </div>
              
              {/* Preview */}
              {(parseFloat(adjustments.discountValue) > 0 || parseFloat(adjustments.serviceCharge) > 0) && (
                <div className="pt-2 border-t space-y-1 text-xs">
                  {parseFloat(adjustments.discountValue) > 0 && (
                    <div className="flex justify-between text-green-600">
                      <span>Desconto:</span>
                      <span>-{formatKwanza(
                        adjustments.discountType === 'percentual'
                          ? (baseSubtotal * parseFloat(adjustments.discountValue)) / 100
                          : parseFloat(adjustments.discountValue)
                      )}</span>
                    </div>
                  )}
                  {parseFloat(adjustments.serviceCharge) > 0 && (
                    <div className="flex justify-between text-orange-600">
                      <span>Taxa:</span>
                      <span>+{formatKwanza(parseFloat(adjustments.serviceCharge))}</span>
                    </div>
                  )}
                  <div className="flex justify-between font-bold text-primary pt-1">
                    <span>Total Ajustado:</span>
                    <span>{formatKwanza(adjustedTotal)}</span>
                  </div>
                </div>
              )}
            </div>
          )}
          
          {Number(guest.paidAmount) > 0 && !isPaid && (
            <>
              <div className="flex justify-between text-sm text-green-600">
                <span>Pago:</span>
                <span>{formatKwanza(guest.paidAmount)}</span>
              </div>
              <Separator className="my-1" />
              <div className="flex justify-between text-sm font-bold text-orange-600">
                <span>Restante:</span>
                <span>{formatKwanza(remaining.toFixed(2))}</span>
              </div>
            </>
          )}
        </div>

        {/* Payment Controls */}
        {!isPaid ? (
          <div className="flex gap-2 pt-2">
            <Select value={paymentMethod} onValueChange={setPaymentMethod}>
              <SelectTrigger className="flex-1" data-testid="select-payment-method">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {PAYMENT_METHODS.map((method) => (
                  <SelectItem key={method.value} value={method.value}>
                    {method.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button 
              size="sm" 
              onClick={handlePay}
              disabled={isPaying || remaining <= 0}
              className="flex-shrink-0"
              data-testid="button-pay-guest"
            >
              {isPaying ? "Processando..." : "Processar"}
            </Button>
          </div>
        ) : (
          <div className="text-center py-2 text-green-600 font-semibold text-sm">
            ✓ Conta fechada
          </div>
        )}
      </CardContent>
    </Card>
  );
}
