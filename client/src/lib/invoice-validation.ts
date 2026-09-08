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
  const date = input.date ? new Date(input.date).toISOString() : "";
  const total = Number(input.total ?? 0).toFixed(2);
  const source = `${input.invoiceNumber}|${input.orderId}|${date}|${total}`;

  let hash = 2166136261;
  for (let index = 0; index < source.length; index += 1) {
    hash ^= source.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }

  return (hash >>> 0).toString(36).toUpperCase().padStart(7, "0");
}