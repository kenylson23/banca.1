export function generateInvoiceValidationCode(input: {
  invoiceNumber: number | string;
  sessionId: string;
  date: Date | string | null | undefined;
  total: string | number | null | undefined;
  restaurantId?: string | null;
  branchId?: string | null;
}): string {
  const parsedDate = input.date ? new Date(input.date) : null;
  const date = parsedDate && !Number.isNaN(parsedDate.getTime()) ? parsedDate.toISOString() : '';
  const total = Number(input.total ?? 0).toFixed(2);
  const source = [
    input.restaurantId ?? '',
    input.branchId ?? '',
    input.invoiceNumber,
    input.sessionId,
    date,
    total,
  ].join('|');

  let hash = 2166136261;
  for (let index = 0; index < source.length; index += 1) {
    hash ^= source.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }

  return (hash >>> 0).toString(36).toUpperCase().padStart(7, '0');
}

export function buildInvoiceVerificationPath(input: {
  sessionId: string;
  validationCode: string;
}): string {
  return `/api/public/table-invoices/${encodeURIComponent(input.sessionId)}/verify?code=${encodeURIComponent(input.validationCode)}`;
}
