import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { summarizeSessionInvoice } from '../shared/session-invoice';
import { summarizeTableInvoicePayments } from '../shared/table-invoice-document';
import { buildInvoiceVerificationPath, generateInvoiceValidationCode } from '../shared/invoice-validation';
import {
  invoiceDate,
  invoiceMoney,
  invoiceOrderStatusLabel,
  invoicePaymentStatusLabel,
  formatPaymentMethodLabel,
} from '../shared/invoice-formatters';

describe('table session invoice payments', () => {
  it('aggregates repeated payment methods into one line and keeps the paid total', () => {
    const payments = [
      { amount: '120.00', paymentMethod: 'dinheiro' },
      { amount: '30.00', paymentMethod: 'cash' },
      { amount: '50.00', paymentMethod: 'multicaixa' },
      { amount: '25.00', paymentMethod: 'Multicaixa Express' },
    ];

    assert.deepEqual(summarizeTableInvoicePayments(payments), [
      {
        paymentMethod: 'dinheiro',
        paymentMethodLabel: 'Dinheiro',
        count: 2,
        amount: '150.00',
      },
      {
        paymentMethod: 'multicaixa',
        paymentMethodLabel: 'Multicaixa',
        count: 2,
        amount: '75.00',
      },
    ]);

    const totals = summarizeSessionInvoice('300.00', payments);
    assert.equal(totals.paidAmount, '225.00');
    assert.equal(totals.pendingAmount, '75.00');
  });

  it('shows the exact pending difference for a partial payment', () => {
    const totals = summarizeSessionInvoice('1000.00', [
      { amount: '300.00' },
      { amount: '150.00' },
    ]);

    assert.deepEqual(totals, {
      totalAmount: '1000.00',
      paidAmount: '450.00',
      pendingAmount: '550.00',
      paymentStatus: 'parcial',
    });
  });

  it('uses real table payment amounts even when records carry stale guest values', () => {
    const tablePayments = [
      { amount: '275.00', paymentMethod: 'dinheiro', guestSubtotal: '900.00', guestPaidAmount: '900.00' },
      { amount: '125.00', paymentMethod: 'cartao', guestSubtotal: '100.00', guestPaidAmount: '100.00' },
    ];

    const totals = summarizeSessionInvoice('1000.00', tablePayments);

    assert.equal(totals.paidAmount, '400.00');
    assert.equal(totals.pendingAmount, '600.00');
    assert.equal(totals.paymentStatus, 'parcial');
  });
});

describe('shared invoice formatters', () => {
  it('uses the same friendly labels for canonical and legacy payment codes', () => {
    assert.equal(formatPaymentMethodLabel('dinheiro'), 'Dinheiro');
    assert.equal(formatPaymentMethodLabel('cash'), 'Dinheiro');
    assert.equal(formatPaymentMethodLabel('tpa'), 'Cartão');
    assert.equal(formatPaymentMethodLabel('bank_transfer'), 'Transferência');
    assert.equal(formatPaymentMethodLabel('provider_code'), 'Método não especificado');
  });

  it('normalizes payment and order states before rendering', () => {
    assert.equal(invoicePaymentStatusLabel('nao_pago'), 'PENDENTE');
    assert.equal(invoicePaymentStatusLabel('paid'), 'PAGO');
    assert.equal(invoicePaymentStatusLabel('partial'), 'PAGO PARCIALMENTE');
    assert.equal(invoiceOrderStatusLabel('preparing'), 'Em preparação');
    assert.equal(invoiceOrderStatusLabel('unknown_state'), 'Estado não especificado');
  });

  it('formats amounts and dates through the invoice locale', () => {
    assert.equal(invoiceMoney('1250'), '1 250,00 Kz');
    assert.equal(invoiceDate('2026-09-16T18:30:00.000Z'), '16/09/2026, 18:30');
  });
});

describe('table invoice validation identity', () => {
  const baseInput = {
    invoiceNumber: 42,
    sessionId: 'session-42',
    date: '2026-09-16T18:30:00.000Z',
    total: '1250.00',
    restaurantId: 'restaurant-1',
    branchId: 'branch-1',
  };

  it('binds the code to the closing date, final total, restaurant, and branch', () => {
    const code = generateInvoiceValidationCode(baseInput);

    assert.notEqual(
      code,
      generateInvoiceValidationCode({ ...baseInput, date: '2026-09-16T18:31:00.000Z' }),
    );
    assert.notEqual(
      code,
      generateInvoiceValidationCode({ ...baseInput, total: '1250.01' }),
    );
    assert.notEqual(
      code,
      generateInvoiceValidationCode({ ...baseInput, branchId: 'branch-2' }),
    );
    assert.notEqual(
      code,
      generateInvoiceValidationCode({ ...baseInput, restaurantId: 'restaurant-2' }),
    );
  });

  it('creates a confirmation URL tied to the same session and code', () => {
    const code = generateInvoiceValidationCode(baseInput);
    const path = buildInvoiceVerificationPath({ sessionId: baseInput.sessionId, validationCode: code });

    assert.equal(
      path,
      `/api/public/table-invoices/${baseInput.sessionId}/verify?code=${code}`,
    );
  });
});