import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { formatKwanza } from "@/lib/formatters";

interface PaymentFormProps {
  onSubmit: (data: { amount: string; paymentMethod: string; receivedAmount?: string }) => void;
  totalAmount: number;
  paidAmount: number;
  isPending?: boolean;
  allowSplit?: boolean; // when false, hide split UI
}

export function PaymentForm({ onSubmit, totalAmount, paidAmount, isPending, allowSplit = true }: PaymentFormProps) {
  const remaining = totalAmount - paidAmount;
  const [amount, setAmount] = useState(remaining.toString());
  const [paymentMethod, setPaymentMethod] = useState("dinheiro");
  const [receivedAmount, setReceivedAmount] = useState("");
  const [enableSplit, setEnableSplit] = useState(false);
  const [numberOfPeople, setNumberOfPeople] = useState("2");

  const splitAmount = enableSplit && Number(numberOfPeople) > 1
    ? remaining / Number(numberOfPeople)
    : 0;

  const PAYMENT_METHODS = [
    { value: "dinheiro", label: "Dinheiro" },
    { value: "multicaixa", label: "Multicaixa" },
    { value: "transferencia", label: "Transferência" },
    { value: "cartao", label: "Cartão" },
  ];

  return (
    <div className="space-y-4">
      <div className="p-4 rounded-md bg-muted">
        <div className="flex justify-between text-sm mb-2">
          <span>Total:</span>
          <span className="font-semibold">{formatKwanza(totalAmount)}</span>
        </div>
        <div className="flex justify-between text-sm mb-2">
          <span>Pago:</span>
          <span className="font-semibold">{formatKwanza(paidAmount)}</span>
        </div>
        <div className="flex justify-between">
          <span>Restante:</span>
          <span className="font-bold text-lg">{formatKwanza(remaining)}</span>
        </div>
      </div>

      {allowSplit && (
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="enable-split"
              checked={enableSplit}
              onChange={(e) => {
                setEnableSplit(e.target.checked);
                if (e.target.checked) {
                  setAmount(splitAmount.toFixed(2));
                } else {
                  setAmount(remaining.toString());
                }
              }}
              data-testid="checkbox-enable-split"
            />
            <Label htmlFor="enable-split" className="cursor-pointer">
              Dividir conta igualmente entre pessoas
            </Label>
          </div>

          {enableSplit && (
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Número de Pessoas</Label>
                <Input
                  type="number"
                  min={2}
                  value={numberOfPeople}
                  onChange={(e) => {
                    const v = e.target.value;
                    setNumberOfPeople(v);
                    const n = Number(v) || 2;
                    setAmount((remaining / n).toFixed(2));
                  }}
                  data-testid="input-split-people"
                />
              </div>
              <div className="flex items-end">
                <div className="w-full p-2 rounded-md border bg-muted flex justify-between">
                  <span>Valor por pessoa</span>
                  <span className="font-semibold">{formatKwanza(splitAmount)}</span>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      <div className="space-y-2">
        <Label>Método de Pagamento</Label>
        <Select value={paymentMethod} onValueChange={setPaymentMethod}>
          <SelectTrigger data-testid="select-payment-method">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {PAYMENT_METHODS.map((m) => (
              <SelectItem key={m.value} value={m.value}>
                {m.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label>Valor a Pagar {allowSplit && enableSplit && "(Desta Pessoa)"}</Label>
        <Input
          type="number"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          placeholder="0.00"
          data-testid="input-payment-amount"
        />
      </div>

      {paymentMethod === "dinheiro" && (
        <div className="space-y-2">
          <Label>Valor Recebido (opcional)</Label>
          <Input
            type="number"
            value={receivedAmount}
            onChange={(e) => setReceivedAmount(e.target.value)}
            placeholder="0.00"
            data-testid="input-received-amount"
          />
          {receivedAmount && Number(receivedAmount) > Number(amount) && (
            <p className="text-sm text-muted-foreground">
              Troco: {formatKwanza(Number(receivedAmount) - Number(amount))}
            </p>
          )}
        </div>
      )}

      <Button
        onClick={() => onSubmit({ amount, paymentMethod, receivedAmount: receivedAmount || undefined })}
        className="w-full"
        disabled={isPending || Number(amount) <= 0}
        data-testid="button-confirm-payment"
      >
        {isPending ? "Processando..." : "Confirmar Pagamento"}
      </Button>
    </div>
  );
}
