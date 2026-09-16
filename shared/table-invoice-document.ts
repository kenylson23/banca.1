import { formatPaymentMethodLabel, getPaymentMethodLabel, normalizePaymentMethod } from './payment-methods';

export type TableInvoiceMoney = string;

export type TableInvoiceRestaurant = {
  id: string;
  name: string;
  address: string | null;
  phone: string | null;
  nif: string | null;
  vatRegime: string | null;
  vatRate: TableInvoiceMoney | null;
  documentSeries: string | null;
  invoicePrefix: string | null;
  fiscalAddress: string | null;
  email: string | null;
  website: string | null;
  whatsappNumber: string | null;
  legalFooter: string | null;
  logoUrl: string | null;
};

export type TableInvoiceBranch = {
  id: string;
  name: string;
  address: string | null;
  phone: string | null;
} | null;

export type TableInvoiceCashRegisterShift = {
  id: string;
  label: string;
  cashRegisterName: string | null;
  status: string;
  openedAt: string | null;
  closedAt: string | null;
  openedByName: string | null;
  closedByName: string | null;
} | null;

export type TableInvoiceCustomer = {
  id: string | null;
  name: string;
  phone: string | null;
  email: string | null;
  nif: string | null;
  address: string | null;
} | null;

export type TableInvoiceRecipientType = 'table_customer' | 'consumer_final' | 'other_customer';

export type TableInvoiceGuest = {
  id: string;
  name: string;
  guestNumber: number | null;
  seatNumber: number | null;
  status: string;
  customer: TableInvoiceCustomer;
  subtotal: TableInvoiceMoney;
  discount: TableInvoiceMoney;
  serviceCharge: TableInvoiceMoney;
};

export type TableInvoiceItem = {
  id: string;
  orderId: string;
  orderNumber: string | number | null;
  orderCreatedAt: string | null;
  orderStatus: string;
  orderNotes: string | null;
  guestId: string | null;
  guestName: string | null;
  sharedWithGuestNames: string[];
  name: string;
  quantity: number;
  unitPrice: TableInvoiceMoney;
  total: TableInvoiceMoney;
  notes: string | null;
  options: Array<{
    name: string;
    groupName: string;
    priceAdjustment: TableInvoiceMoney;
    quantity: number;
  }>;
};

export type TableInvoiceCancelledOrder = {
  id: string;
  orderNumber: string | number | null;
  createdAt: string | null;
  status: string;
  notes: string | null;
  cancellationReason: string | null;
};

export type TableInvoiceAdjustment = {
  label: string;
  amount: TableInvoiceMoney;
  /** Valor informado pelo operador antes do cálculo (ex.: 10 ou 3.000). */
  inputValue: TableInvoiceMoney;
  type: 'valor' | 'percentual';
  scope: 'sessao' | 'convidado';
  source: 'promocional' | 'cliente' | 'manual' | 'fidelidade' | 'automatico' | 'servico' | 'outro';
  sourceLabel: string;
  appliedByName: string | null;
  reason: string | null;
  serviceName?: string | null;
  guestId?: string | null;
};

export type TableInvoicePayment = {
  id: string;
  amount: TableInvoiceMoney;
  paymentMethod: string;
  paymentMethodLabel: string;
  createdAt: string;
  notes: string | null;
  operatorName?: string | null;
};

export type TableInvoicePaymentSummary = {
  paymentMethod: string;
  paymentMethodLabel: string;
  count: number;
  amount: TableInvoiceMoney;
};

export type TableInvoicePaymentInput = {
  amount: string | number | null | undefined;
  paymentMethod: unknown;
};

/**
 * Aggregates the real table payment records for the invoice payment breakdown.
 * Payment aliases are normalized before grouping so repeated records for the
 * same method produce one line.
 */
export function summarizeTableInvoicePayments(
  payments: TableInvoicePaymentInput[],
): TableInvoicePaymentSummary[] {
  const byMethod = new Map<string, {
    paymentMethod: string;
    paymentMethodLabel: string;
    count: number;
    amount: number;
  }>();

  for (const payment of payments) {
    let paymentMethod: string;
    let paymentMethodLabel: string;
    try {
      paymentMethod = normalizePaymentMethod(payment.paymentMethod);
      paymentMethodLabel = getPaymentMethodLabel(paymentMethod);
    } catch {
      // Historical records can contain a provider-specific code. Keep the
      // payment in the document without leaking that code into print output.
      paymentMethod = 'nao_especificado';
      paymentMethodLabel = formatPaymentMethodLabel(payment.paymentMethod);
    }
    const current = byMethod.get(paymentMethod) || {
      paymentMethod,
      paymentMethodLabel,
      count: 0,
      amount: 0,
    };
    const amount = Number(payment.amount ?? 0);
    current.count += 1;
    current.amount += Number.isFinite(amount) ? amount : 0;
    byMethod.set(paymentMethod, current);
  }

  return Array.from(byMethod.values()).map((payment) => ({
    ...payment,
    amount: payment.amount.toFixed(2),
  }));
}

export type TableInvoiceAuditEntry = {
  id: string | number;
  action: string;
  label: string;
  actorName: string | null;
  reason: string | null;
  createdAt: string;
  details?: Record<string, unknown> | null;
};

export type TableInvoiceDocument = {
  documentType: 'table-invoice';
  currency: 'AOA';
  issuedAt: string;
  invoiceNumber: number;
  invoiceReference: string;
  restaurant: TableInvoiceRestaurant;
  branch: TableInvoiceBranch;
  table: {
    id: string;
    number: number;
    area: string | null;
  };
  session: {
    id: string;
    startedAt: string;
    endedAt: string | null;
    durationMinutes: number;
    durationLabel: string;
    status: string;
    customerName: string | null;
    customerCount: number | null;
    openedByName: string | null;
    closedByName: string | null;
  };
  cashRegisterShift: TableInvoiceCashRegisterShift;
  paymentOperatorNames: string[];
  invoiceRecipient: {
    type: TableInvoiceRecipientType;
    label: string;
    customerId: string | null;
  };
  tableCustomer: TableInvoiceCustomer;
  isSplit: boolean;
  customer: TableInvoiceCustomer;
  guests: TableInvoiceGuest[];
  items: TableInvoiceItem[];
  cancelledItems: TableInvoiceItem[];
  cancelledOrders: TableInvoiceCancelledOrder[];
  discounts: TableInvoiceAdjustment[];
  fees: TableInvoiceAdjustment[];
  payments: TableInvoicePayment[];
  paymentsByMethod: TableInvoicePaymentSummary[];
  audit: TableInvoiceAuditEntry[];
  reprints: {
    count: number;
    lastPrintedAt: string | null;
    lastPrintedBy: string | null;
  };
  totals: {
    subtotal: TableInvoiceMoney;
    discount: TableInvoiceMoney;
    fees: TableInvoiceMoney;
    total: TableInvoiceMoney;
    paid: TableInvoiceMoney;
    pending: TableInvoiceMoney;
    paymentStatus: 'pendente' | 'parcial' | 'pago';
  };
  validation: {
    code: string;
    algorithm: 'fnv1a-base36';
    verificationUrl: string;
  };
};
