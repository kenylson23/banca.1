import assert from 'node:assert/strict';
import test from 'node:test';
import {
  calculateCashRegisterCurrentBalance,
  calculateCashRegisterDifference,
  calculateCashRegisterShiftTotals,
} from '../shared/cash-register-shift';

test('shift opening is a starting balance, not a second adjustment', () => {
  const totals = calculateCashRegisterShiftTotals('1000.00', [
    { shiftId: 'shift-1', type: 'ajuste', amount: '1000.00', description: 'Abertura do caixa' },
    { shiftId: 'shift-1', type: 'receita', amount: '250.25' },
    { shiftId: 'shift-1', type: 'despesa', amount: '40.10' },
    { shiftId: 'shift-1', type: 'ajuste', amount: '5.00', description: 'Acerto' },
  ]);

  assert.deepEqual(totals, {
    totalRevenues: '250.25',
    totalExpenses: '40.10',
    totalAdjustments: '5.00',
    closingAmountExpected: '1215.15',
  });
});

test('active register balance uses only the active shift movements', () => {
  const balance = calculateCashRegisterCurrentBalance('50.00', [
    {
      id: 'old-shift',
      status: 'fechado',
      openedAt: '2026-10-15T08:00:00.000Z',
      openingAmount: '500.00',
      closingAmountCounted: '780.00',
      closingAmountExpected: '780.00',
    },
    {
      id: 'current-shift',
      status: 'aberto',
      openedAt: '2026-10-16T08:00:00.000Z',
      openingAmount: '100.00',
    },
  ], [
    { shiftId: 'old-shift', type: 'receita', amount: '280.00' },
    { shiftId: 'current-shift', type: 'ajuste', amount: '100.00', description: 'Abertura do caixa' },
    { shiftId: 'current-shift', type: 'receita', amount: '35.50' },
    { shiftId: null, type: 'receita', amount: '900.00' },
  ]);

  assert.equal(balance, '135.50');
});

test('closed register balance uses the latest counted close, not prior movements', () => {
  const balance = calculateCashRegisterCurrentBalance('50.00', [
    {
      id: 'older-shift',
      status: 'fechado',
      openedAt: '2026-10-15T08:00:00.000Z',
      openingAmount: '500.00',
      closingAmountCounted: '780.00',
      closingAmountExpected: '790.00',
    },
    {
      id: 'latest-shift',
      status: 'fechado',
      openedAt: '2026-10-16T08:00:00.000Z',
      openingAmount: '100.00',
      closingAmountCounted: '120.00',
      closingAmountExpected: '125.00',
    },
  ], [
    { shiftId: 'older-shift', type: 'receita', amount: '280.00' },
    { shiftId: 'latest-shift', type: 'receita', amount: '25.00' },
  ]);

  assert.equal(balance, '120.00');
});

test('difference is counted amount minus expected amount with cent precision', () => {
  assert.equal(calculateCashRegisterDifference('100.10', '99.99'), '0.11');
  assert.equal(calculateCashRegisterDifference('99.89', '99.99'), '-0.10');
});
