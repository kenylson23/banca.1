export type TableInvoiceMoney = string;

export type TableInvoiceRestaurant = {
  id: string;
  name: string;
  address: string | null;
  phone: string | null;
  nif: string | null;
  logoUrl: string | null;
};

export type TableInvoiceBranch = {
  id: string;
  name: string;
  address: string | null;
  phone: string | null;
} | null;

export type TableInvoiceCustomer = {
  id: string | null;
  name: string;
  phone: string | null;
  email: string | null;
  nif: string | null;
  address: string | null;
} | null;

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
  guestId: string | null;
  guestName: string | null;
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

export type TableInvoiceAdjustment = {
  label: string;
  amount: TableInvoiceMoney;
  type: 'valor' | 'percentual';
  scope: 'sessao' | 'convidado';
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
    status: string;
    customerName: string | null;
    customerCount: number | null;
  };
  customer: TableInvoiceCustomer;
  guests: TableInvoiceGuest[];
  items: TableInvoiceItem[];
  discounts: TableInvoiceAdjustment[];
  fees: TableInvoiceAdjustment[];
  payments: TableInvoicePayment[];
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
  };
};