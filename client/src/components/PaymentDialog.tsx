import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { PaymentForm } from "@/components/PaymentForm";

interface PaymentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  totalAmount: number;
  paidAmount?: number; // default 0 if not provided
  isSubmitting?: boolean;
  onSubmit: (data: { amount: string; paymentMethod: string; receivedAmount?: string }) => void;
  title?: string;
}

export function PaymentDialog({ open, onOpenChange, totalAmount, paidAmount = 0, isSubmitting, onSubmit, title = "Registrar Pagamento" }: PaymentDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        <PaymentForm
          onSubmit={onSubmit}
          totalAmount={totalAmount}
          paidAmount={paidAmount}
          isPending={isSubmitting}
          allowSplit={false}
        />
      </DialogContent>
    </Dialog>
  );
}
