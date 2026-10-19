import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { PaymentForm } from "@/components/PaymentForm";
import type { ConfiguredPaymentMethod } from "@shared/configured-payment-methods";

interface PaymentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  totalAmount: number;
  paidAmount?: number; // default 0 if not provided
  isSubmitting?: boolean;
  onSubmit: (data: { amount: string; paymentMethod: string; receivedAmount?: string }) => void;
  title?: string;
  paymentMethods?: ConfiguredPaymentMethod[];
}

export function PaymentDialog({
  open,
  onOpenChange,
  totalAmount,
  paidAmount = 0,
  isSubmitting,
  onSubmit,
  title = "Registrar Pagamento",
  paymentMethods = [],
}: PaymentDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-full max-w-[95vw] sm:max-w-md md:max-w-lg">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        <PaymentForm
          onSubmit={onSubmit}
          totalAmount={totalAmount}
          paidAmount={paidAmount}
          isPending={isSubmitting}
          allowSplit={false}
          paymentMethods={paymentMethods}
        />
      </DialogContent>
    </Dialog>
  );
}
