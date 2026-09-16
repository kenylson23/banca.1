export const PAYMENT_METHODS = ['dinheiro', 'multicaixa', 'transferencia', 'cartao'] as const;

export type NormalizedPaymentMethod = typeof PAYMENT_METHODS[number];

const aliases: Record<string, NormalizedPaymentMethod> = {
  dinheiro: 'dinheiro',
  cash: 'dinheiro',
  numerario: 'dinheiro',
  numerário: 'dinheiro',
  multicaixa: 'multicaixa',
  'multicaixa express': 'multicaixa',
  'multicaixa expresss': 'multicaixa',
  transferencia: 'transferencia',
  transferência: 'transferencia',
  bank_transfer: 'transferencia',
  'bank transfer': 'transferencia',
  mbway: 'transferencia',
  cartao: 'cartao',
  cartão: 'cartao',
  card: 'cartao',
  tpa: 'cartao',
};

export function normalizePaymentMethod(value: unknown): NormalizedPaymentMethod {
  const normalized = String(value ?? '')
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');

  const method = aliases[normalized] ?? aliases[String(value ?? '').trim().toLowerCase()];
  if (!method) {
    throw new Error(`Forma de pagamento inválida: ${String(value ?? '')}`);
  }

  return method;
}

export function getPaymentMethodLabel(value: unknown): string {
  const labels: Record<NormalizedPaymentMethod, string> = {
    dinheiro: 'Dinheiro',
    multicaixa: 'Multicaixa',
    transferencia: 'Transferência',
    cartao: 'Cartão',
  };

  return labels[normalizePaymentMethod(value)];
}

/**
 * Presentation-safe payment label. Unlike getPaymentMethodLabel, this helper
 * never leaks an internal code to a printed document when old data contains a
 * value that is not in the current canonical list.
 */
export function formatPaymentMethodLabel(value: unknown): string {
  try {
    return getPaymentMethodLabel(value);
  } catch {
    return 'Método não especificado';
  }
}