import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Check } from "lucide-react";
import { formatKwanza } from "@/lib/formatters";

interface GuestPaymentCardProps {
  guest: {
    id: string;
    name: string | null;
    guestNumber: number;
    subtotal: string;
    paidAmount: string;
    status: string;
  };
  onPay: (guestId: string, paymentMethod: string) => Promise<void>;
  isPaying?: boolean;
}

const PAYMENT_METHODS = [
  { value: "dinheiro", label: "Dinheiro" },
  { value: "multicaixa", label: "Multicaixa" },
  { value: "transferencia", label: "Transferência" },
  { value: "cartao", label: "Cartão" },
];

export function GuestPaymentCard({ guest, onPay, isPaying }: GuestPaymentCardProps) {
  const [paymentMethod, setPaymentMethod] = useState("dinheiro");
  
  const guestName = guest.name || `Cliente ${guest.guestNumber}`;
  const remaining = Number(guest.subtotal) - Number(guest.paidAmount);
  const isPaid = guest.status === 'pago' || remaining <= 0;

  const handlePay = async () => {
    if (!isPaid && remaining > 0) {
      await onPay(guest.id, paymentMethod);
    }
  };

  return (
    <Card className={isPaid ? "border-green-500 bg-green-50/50" : ""}>
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-4">
          {/* Guest Info */}
          <div className="flex-1 space-y-1">
            <div className="flex items-center gap-2">
              <h4 className="font-medium">{guestName}</h4>
              {isPaid && (
                <Badge variant="default" className="bg-green-600">
                  <Check className="w-3 h-3 mr-1" />
                  Pago
                </Badge>
              )}
            </div>
            <div className="text-sm text-muted-foreground">
              Total: {formatKwanza(guest.subtotal)}
            </div>
            {Number(guest.paidAmount) > 0 && !isPaid && (
              <div className="text-sm text-muted-foreground">
                Pago: {formatKwanza(guest.paidAmount)} | Restante: {formatKwanza(remaining)}
              </div>
            )}
          </div>

          {/* Payment Controls */}
          {!isPaid ? (
            <div className="flex items-center gap-2">
              <Select value={paymentMethod} onValueChange={setPaymentMethod}>
                <SelectTrigger className="w-[140px]">
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
                disabled={isPaying}
              >
                {isPaying ? "Processando..." : "Marcar Pago"}
              </Button>
            </div>
          ) : (
            <div className="text-green-600 font-medium text-sm">
              {formatKwanza(guest.subtotal)}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
