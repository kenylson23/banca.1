import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { isOrderPaid } from '../shared/calculations';

describe('realized order sales', () => {
  it('counts fully paid orders only', () => {
    assert.equal(isOrderPaid({ paymentStatus: 'pago' }), true);
  });

  it('excludes unpaid and partially paid orders', () => {
    assert.equal(isOrderPaid({ paymentStatus: 'nao_pago' }), false);
    assert.equal(isOrderPaid({ paymentStatus: 'parcial' }), false);
  });
});
