export type SessionInvoicePayment = {
  amount: string | number | null | undefined;
};

export type SessionInvoicePaymentSummary = {
  totalAmount: string;
  paidAmount: string;
  pendingAmount: string;
  paymentStatus: 'pendente' | 'parcial' | 'pago';
};

/**
 * Calculates the session invoice summary from the final total and the
 * payments recorded for that session. The payment list may include refunds,
 * so its net amount is used and the displayed amount is capped at the total.
 */
export function summarizeSessionInvoice(
  totalAmountInput: string | number | null | undefined,
  payments: SessionInvoicePayment[],
): SessionInvoicePaymentSummary {
  const totalAmount = Math.max(0, Number(totalAmountInput ?? 0) || 0);
  const netPaidAmount = payments.reduce(
    (sum, payment) => sum + (Number(payment.amount ?? 0) || 0),
    0,
  );
  const paidAmount = Math.min(Math.max(netPaidAmount, 0), totalAmount);
  const pendingAmount = Math.max(0, totalAmount - paidAmount);
  const paymentStatus =
    paidAmount >= totalAmount - 0.01 && totalAmount > 0
      ? 'pago'
      : paidAmount > 0
        ? 'parcial'
        : 'pendente';

  return {
    totalAmount: totalAmount.toFixed(2),
    paidAmount: paidAmount.toFixed(2),
    pendingAmount: pendingAmount.toFixed(2),
    paymentStatus,
  };
}