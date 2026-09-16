import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { summarizeSessionInvoice } from '../shared/session-invoice';
import { summarizeTableInvoicePayments } from '../shared/table-invoice-document';

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