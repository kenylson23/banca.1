export function formatTableInvoiceNumber(
  invoiceNumber: number | string | null | undefined,
  date: Date | string | null | undefined,
): string {
  const number = Number(invoiceNumber);
  if (!Number.isInteger(number) || number < 1) {
    return 'FT AOA/----/------';
  }

  const parsedDate = date ? new Date(date) : null;
  const year = parsedDate && !Number.isNaN(parsedDate.getTime())
    ? parsedDate.getFullYear()
    : new Date().getFullYear();

  return `FT AOA/${year}/${String(number).padStart(6, '0')}`;
}