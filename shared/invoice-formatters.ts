import { formatPaymentMethodLabel } from './payment-methods';

const moneyFormatter = new Intl.NumberFormat('pt-AO', {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

const dateFormatter = new Intl.DateTimeFormat('pt-AO', {
  day: '2-digit',
  month: '2-digit',
  year: 'numeric',
  hour: '2-digit',
  minute: '2-digit',
  hourCycle: 'h23',
});

export function invoiceNumberLabel(value: unknown, fallback = 'Sessão sem referência'): string {
  const text = String(value ?? '').trim();
  return text || fallback;
}

export function invoiceSessionLabel(value: unknown): string {
  const text = String(value ?? '').trim();
  return text ? `Sessão ${text.slice(0, 8).toUpperCase()}` : 'Sessão sem referência';
}

export function invoiceMoney(value: unknown): string {
  const amount = Number(value ?? 0);
  return `${moneyFormatter.format(Number.isFinite(amount) ? amount : 0)} Kz`;
}

export function invoiceNumber(value: unknown): string {
  const amount = Number(value ?? 0);
  return moneyFormatter.format(Number.isFinite(amount) ? amount : 0);
}

export function invoiceDate(value: string | Date | null | undefined, fallback = '-'): string {
  if (!value) return fallback;
  const date = value instanceof Date ? value : new Date(value);
  return Number.isNaN(date.getTime()) ? fallback : dateFormatter.format(date);
}

export const invoicePaymentStatusLabels = {
  pendente: 'PENDENTE',
  parcial: 'PAGO PARCIALMENTE',
  pago: 'PAGO',
} as const;

export function invoicePaymentStatusLabel(value: unknown): string {
  if (value === 'pago') return invoicePaymentStatusLabels.pago;
  if (value === 'parcial') return invoicePaymentStatusLabels.parcial;
  return invoicePaymentStatusLabels.pendente;
}

const orderStatusLabels: Record<string, string> = {
  aguardando_confirmacao: 'A aguardar confirmação',
  pendente: 'Pendente',
  em_preparo: 'Em preparação',
  pronto: 'Pronto',
  servido: 'Servido',
  cancelado: 'Cancelado',
};

export function invoiceOrderStatusLabel(value: unknown): string {
  const key = String(value ?? '').trim();
  return orderStatusLabels[key] || (key ? 'Estado não especificado' : 'Estado não informado');
}

export function invoiceAdjustmentLabel(input: {
  label: string;
  amount: unknown;
  inputValue: unknown;
  type: 'valor' | 'percentual' | string;
  sourceLabel?: string | null;
  appliedByName?: string | null;
  reason?: string | null;
  sign?: '-' | '+';
}): string {
  const details = [
    input.sourceLabel || null,
    input.type === 'percentual' ? `${invoiceNumber(input.inputValue)}%` : 'valor fixo',
    input.appliedByName ? `por ${input.appliedByName}` : 'por não identificado',
    input.reason ? `Motivo: ${input.reason}` : null,
  ].filter(Boolean);
  return `${input.sign || ''}${input.label}: ${invoiceMoney(input.amount)}${details.length ? ` · ${details.join(' · ')}` : ''}`;
}

export { formatPaymentMethodLabel };