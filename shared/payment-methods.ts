export const PAYMENT_METHODS = ['dinheiro', 'multicaixa', 'transferencia', 'cartao'] as const;

export type NormalizedPaymentMethod = typeof PAYMENT_METHODS[number];

export interface ConfiguredPaymentMethod {
  id: string;
  name: string;
  reference: string;
}

export interface PaymentMethodOption {
  value: string;
  label: string;
}

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
 * Presentation-safe payment label. It formats known methods and preserves
 * configured custom method names as stored in payment history.
 */
export function formatPaymentMethodLabel(value: unknown): string {
  try {
    return getPaymentMethodLabel(value);
  } catch {
    return 'Método não especificado';
  }
}

/**
 * Payment records validated against restaurant settings store the configured
 * display name. Render that trusted snapshot while keeping the strict
 * provider-code fallback behavior of formatPaymentMethodLabel.
 */
export function formatStoredPaymentMethodLabel(value: unknown): string {
  try {
    return getPaymentMethodLabel(value);
  } catch {
    return String(value ?? '').trim() || 'Método não especificado';
  }
}

function normalizePaymentMethodName(name: string): string {
  return name
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');
}

export function getOperationalPaymentMethodOptions(
  configuredMethods: readonly ConfiguredPaymentMethod[] = [],
): PaymentMethodOption[] {
  return [
    { value: 'dinheiro', label: 'Dinheiro' },
    ...configuredMethods
      .filter((method) =>
        method.id !== 'dinheiro' &&
        normalizePaymentMethodName(method.name) !== 'dinheiro' &&
        method.name.trim().length > 0
      )
      .map((method) => ({ value: method.id, label: method.name })),
  ];
}

/**
 * Cash is always allowed. Every other operational payment must refer to an
 * active method configured by the restaurant; persist its name as a snapshot.
 */
export function resolveOperationalPaymentMethod(
  selectedMethod: unknown,
  configuredMethods: readonly ConfiguredPaymentMethod[] = [],
): string | undefined {
  if (selectedMethod === 'dinheiro') return 'dinheiro';
  if (typeof selectedMethod !== 'string' || !selectedMethod.trim()) return undefined;

  const configuredMethod = configuredMethods.find((method) =>
    method.id === selectedMethod &&
    method.id !== 'dinheiro' &&
    normalizePaymentMethodName(method.name) !== 'dinheiro'
  );

  return configuredMethod?.name.trim() || undefined;
}