import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Check, ChevronDown, ChevronUp } from "lucide-react";
import { formatKwanza } from "@/lib/formatters";
import { Separator } from "@/components/ui/separator";

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
}

const PAYMENT_METHODS = [
  { value: "dinheiro", label: "Dinheiro" },
  { value: "multicaixa", label: "Multicaixa" },
  { value: "transferencia", label: "Transferência" },
  { value: "cartao", label: "Cartão" },
];

export function GuestPaymentCard({ guest, orders = [], onPay, isPaying }: GuestPaymentCardProps) {
  const [paymentMethod, setPaymentMethod] = useState("dinheiro");
  const [showOrders, setShowOrders] = useState(false);
  
  const guestName = guest.name || `Cliente ${guest.guestNumber}`;
  const remaining = Number(guest.subtotal) - Number(guest.paidAmount);
  const isPaid = guest.status === 'pago' || remaining <= 0;

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
