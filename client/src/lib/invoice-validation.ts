import { generateInvoiceValidationCode as generateSessionInvoiceValidationCode } from '@shared/invoice-validation';

export function getInvoiceNumber(order: {
  invoiceNumber?: number | null;
  id: string;
}): string {
  return order.invoiceNumber != null
    ? String(order.invoiceNumber).padStart(6, "0")
    : order.id.substring(0, 8).toUpperCase();
}

export function generateInvoiceValidationCode(input: {
  invoiceNumber: number | string;
  orderId: string;
  date: Date | string | null | undefined;
  total: string | number | null | undefined;
}): string {
  return generateSessionInvoiceValidationCode({
    invoiceNumber: input.invoiceNumber,
    sessionId: input.orderId,
    date: input.date,
    total: input.total,
  });
}