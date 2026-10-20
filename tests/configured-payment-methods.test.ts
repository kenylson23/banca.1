import assert from 'node:assert/strict';
import test from 'node:test';
import {
  formatPaymentMethodLabel,
  formatStoredPaymentMethodLabel,
  getOperationalPaymentMethodOptions,
  resolveOperationalPaymentMethod,
} from '../shared/payment-methods';

const configuredMethods = [
  { id: 'payment-transfer', name: 'Transferência Bancária', reference: 'IBAN' },
  { id: 'payment-express', name: 'Multicaixa Express', reference: 'Conta' },
];

test('always offers cash and only the configured non-cash methods', () => {
  assert.deepEqual(getOperationalPaymentMethodOptions(configuredMethods), [
    { value: 'dinheiro', label: 'Dinheiro' },
    { value: 'payment-transfer', label: 'Transferência Bancária' },
    { value: 'payment-express', label: 'Multicaixa Express' },
  ]);
  assert.deepEqual(getOperationalPaymentMethodOptions([]), [
    { value: 'dinheiro', label: 'Dinheiro' },
  ]);
});

test('does not add a configured cash duplicate', () => {
  assert.deepEqual(getOperationalPaymentMethodOptions([
    { id: 'cash-alias', name: 'DINHÉIRO', reference: '' },
    { id: 'dinheiro', name: 'Dinheiro', reference: '' },
  ]), [
    { value: 'dinheiro', label: 'Dinheiro' },
  ]);
});

test('resolves cash and configured IDs to display-name snapshots only', () => {
  assert.equal(resolveOperationalPaymentMethod('dinheiro', configuredMethods), 'dinheiro');
  assert.equal(resolveOperationalPaymentMethod('payment-transfer', configuredMethods), 'Transferência Bancária');
  assert.equal(resolveOperationalPaymentMethod('multicaixa', configuredMethods), undefined);
  assert.equal(resolveOperationalPaymentMethod('payment-transfer', []), undefined);
});

test('keeps custom configured names readable without changing unknown-code fallback', () => {
  assert.equal(formatStoredPaymentMethodLabel('Transferência Bancária'), 'Transferência Bancária');
  assert.equal(formatPaymentMethodLabel('provider_code'), 'Método não especificado');
});
