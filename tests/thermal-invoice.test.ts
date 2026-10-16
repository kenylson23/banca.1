import assert from 'node:assert/strict';
import test from 'node:test';
import type { TableInvoiceDocument } from '../shared/table-invoice-document';
import { renderOrderInvoiceThermalHtml } from '../client/src/lib/order-invoice-renderer';
import { renderTableInvoiceHtml } from '../client/src/lib/table-invoice-renderer';

const longNote = 'Sem picante, por favor. ' + 'Informação complementar sem limite de largura. '.repeat(8);

const invoice: TableInvoiceDocument = {
  documentType: 'table-invoice',
  currency: 'AOA',
  issuedAt: '2026-10-16T10:30:00.000Z',
  invoiceNumber: 17,
  invoiceReference: 'FT 000017/2026',
  restaurant: {
    id: 'restaurant-1',
    name: 'Restaurante de Referência',
    address: 'Rua Principal, Luanda',
    phone: '+244 900 000 000',
    nif: '5000000000',
    vatRegime: 'Regime geral',
    vatRate: '14',
    documentSeries: '2026',
    invoicePrefix: 'FT',
    fiscalAddress: 'Rua Fiscal, Luanda',
    email: 'fiscal@example.ao',
    website: 'example.ao',
    whatsappNumber: '+244 900 000 001',
    legalFooter: 'IVA processado nos termos aplicáveis.',
    logoUrl: null,
  },
  branch: {
    id: 'branch-1',
    name: 'Unidade Luanda',
    address: 'Rua da Unidade',
    phone: '+244 900 000 002',
  },
  table: { id: 'table-1', number: 25, area: 'Esplanada' },
  session: {
    id: 'session-12345678',
    startedAt: '2026-10-16T08:00:00.000Z',
    endedAt: '2026-10-16T10:25:00.000Z',
    durationMinutes: 145,
    durationLabel: '2h 25m',
    status: 'closed',
    customerName: 'Cliente da mesa',
    customerCount: 2,
    openedByName: 'Operadora A',
    closedByName: 'Operador B',
  },
  cashRegisterShift: {
    id: 'shift-1',
    label: 'Turno da manhã',
    cashRegisterName: 'Caixa 1',
    status: 'closed',
    openedAt: '2026-10-16T07:00:00.000Z',
    closedAt: '2026-10-16T12:00:00.000Z',
    openedByName: 'Operadora A',
    closedByName: 'Operador B',
  },
  paymentOperatorNames: ['Operadora A'],
  invoiceRecipient: { type: 'table_customer', label: 'Cliente de Teste', customerId: 'customer-1' },
  tableCustomer: {
    id: 'customer-1',
    name: 'Cliente de Teste',
    phone: '+244 923 000 000',
    email: 'cliente@example.ao',
    nif: '6000000000',
    address: 'Morada do cliente',
  },
  isSplit: false,
  customer: {
    id: 'customer-1',
    name: 'Cliente de Teste',
    phone: '+244 923 000 000',
    email: 'cliente@example.ao',
    nif: '6000000000',
    address: 'Morada do cliente',
  },
  guests: [{
    id: 'guest-1',
    name: 'Convidado de Teste',
    guestNumber: 1,
    seatNumber: 3,
    status: 'active',
    customer: {
      id: 'guest-customer-1',
      name: 'Convidado de Teste',
      phone: '+244 923 000 001',
      email: null,
      nif: '7000000000',
      address: null,
    },
    subtotal: '2500.00',
    discount: '0.00',
    serviceCharge: '0.00',
  }],
  items: [{
    id: 'item-1',
    orderId: 'order-1',
    orderNumber: '42',
    orderCreatedAt: '2026-10-16T09:00:00.000Z',
    orderStatus: 'served',
    orderNotes: longNote,
    guestId: 'guest-1',
    guestName: 'Convidado de Teste',
    sharedWithGuestNames: ['Outro Convidado'],
    name: '<Produto & especial>',
    quantity: 2,
    unitPrice: '1250.00',
    total: '2500.00',
    notes: 'Nota individual do artigo.',
    options: [{ name: 'Extra', groupName: 'Adicionais', priceAdjustment: '100.00', quantity: 2 }],
  }],
  cancelledItems: [{
    id: 'item-cancelled',
    orderId: 'order-cancelled',
    orderNumber: '43',
    orderCreatedAt: '2026-10-16T09:10:00.000Z',
    orderStatus: 'cancelled',
    orderNotes: null,
    guestId: null,
    guestName: null,
    sharedWithGuestNames: [],
    name: 'Produto cancelado',
    quantity: 1,
    unitPrice: '500.00',
    total: '500.00',
    notes: null,
    options: [],
  }],
  cancelledOrders: [],
  discounts: [{
    label: 'Desconto de teste',
    amount: '100.00',
    inputValue: '100.00',
    type: 'valor',
    scope: 'sessao',
    source: 'manual',
    sourceLabel: 'Manual',
    appliedByName: 'Operadora A',
    reason: 'Teste',
  }],
  fees: [{
    label: 'Taxa de serviço',
    amount: '200.00',
    inputValue: '10',
    type: 'percentual',
    scope: 'sessao',
    source: 'servico',
    sourceLabel: 'Serviço',
    appliedByName: 'Operadora A',
    reason: null,
  }],
  payments: [{
    id: 'payment-1',
    amount: '2600.00',
    paymentMethod: 'cash',
    paymentMethodLabel: 'Numerário',
    createdAt: '2026-10-16T10:20:00.000Z',
    notes: 'Pago na caixa',
    operatorName: 'Operadora A',
  }],
  paymentsByMethod: [{
    paymentMethod: 'cash',
    paymentMethodLabel: 'Numerário',
    count: 1,
    amount: '2600.00',
  }],
  audit: [],
  reprints: { count: 0, lastPrintedAt: null, lastPrintedBy: null },
  totals: {
    subtotal: '2500.00',
    discount: '100.00',
    fees: '200.00',
    total: '2600.00',
    paid: '2600.00',
    pending: '0.00',
    paymentStatus: 'pago',
  },
  validation: {
    code: 'VAL-ABC123',
    algorithm: 'fnv1a-base36',
    verificationUrl: 'https://example.ao/verify/invoice',
  },
};

test('80 mm table invoice uses a compact roll layout and preserves document fields', () => {
  const html = renderTableInvoiceHtml(invoice, {
    paper: '80mm',
    qrCodeDataUrl: 'data:image/png;base64,QRTEST',
  });

  for (const value of [
    '80mm auto',
    '72mm',
    'Dados fiscais do emitente',
    '5000000000',
    '14%',
    'FT 000017/2026',
    'Cliente de Teste',
    'Convidado de Teste',
    '25',
    'Caixa 1',
    'Operadora A',
    '08:00',
    'Unitário:',
    'Nota individual do artigo.',
    longNote,
    'Produto cancelado',
    'Desconto de teste',
    'Taxa de serviço',
    'Numerário',
    'Pago na caixa',
    'VAL-ABC123',
    'example.ao/verify/invoice',
    'IVA processado nos termos aplicáveis.',
  ]) {
    assert.ok(html.includes(value), `Expected thermal invoice to include: ${value}`);
  }

  assert.match(html, /2\s500,00 Kz/);
  assert.ok(html.includes('&lt;Produto &amp; especial&gt;'));
  assert.ok(!html.includes('<Produto & especial>'));
  assert.match(html, /\.thermal-items \{ display: block; \}/);
  assert.match(html, /overflow-wrap: anywhere/);
  assert.doesNotMatch(html, /\.invoice-document\s*\{[^}]*height:/);
});

test('A4 remains the default table invoice paper', () => {
  const html = renderTableInvoiceHtml(invoice);

  assert.match(html, /@page \{ size: A4; margin: 12mm; \}/);
  assert.match(html, /\.thermal-items \{ display: none; \}/);
  assert.match(html, /class="invoice-items"/);
});

test('order thermal invoice escapes text and retains products, payments and validation', () => {
  const html = renderOrderInvoiceThermalHtml({
    restaurantName: 'Restaurante',
    fiscalLines: [{ label: 'NIF', value: '5000000000' }, { label: 'IVA', value: 'Regime geral · 14%' }],
    legalFooter: 'Obrigado e volte sempre.',
    invoiceNumber: '000042',
    validationCode: 'VAL-42',
    date: '16/10/2026 às 10:30',
    status: 'PAGO',
    orderNumber: '42',
    orderType: 'Balcão',
    customerName: 'Cliente',
    items: [{
      name: '<Produto longo & completo>',
      quantity: 2,
      unitPrice: '1 000,00 Kz',
      total: '2 000,00 Kz',
      options: ['Extra'],
      notes: longNote,
    }],
    subtotal: '2 000,00 Kz',
    adjustments: [{ label: 'Desconto', amount: '100,00 Kz', sign: '-' }],
    total: '1 900,00 Kz',
    payments: [{ method: 'Numerário', amount: '1 900,00 Kz' }],
  });

  assert.match(html, /@page \{ size: 80mm auto; margin: 0; \}/);
  assert.ok(html.includes('&lt;Produto longo &amp; completo&gt;'));
  assert.ok(html.includes(longNote));
  assert.ok(html.includes('Numerário'));
  assert.ok(html.includes('VAL-42'));
  assert.ok(!html.includes('<Produto longo & completo>'));
});
