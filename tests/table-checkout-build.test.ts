import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, it } from 'node:test';
import {
  formatPaymentMethodLabel,
  getPaymentMethodLabel,
} from '../shared/payment-methods';

const projectRoot = process.cwd();
const checkoutSource = readFileSync(
  resolve(projectRoot, 'client/src/pages/table-checkout-v2.tsx'),
  'utf8',
);
const tableDetailsSource = readFileSync(
  resolve(projectRoot, 'client/src/components/TableDetailsDialog.tsx'),
  'utf8',
);
const paymentMethodsSource = readFileSync(
  resolve(projectRoot, 'shared/payment-methods.ts'),
  'utf8',
);

const checkoutSources = [
  ['table checkout', checkoutSource],
  ['table details dialog', tableDetailsSource],
] as const;

function exportedFunctions(source: string): Set<string> {
  return new Set(
    [...source.matchAll(/export\s+function\s+([A-Za-z_$][\w$]*)/g)].map(
      ([, name]) => name,
    ),
  );
}

function importedPaymentHelpers(source: string): Set<string> {
  const imported = new Set<string>();
  const importPattern =
    /import\s*\{([\s\S]*?)\}\s*from\s*['"]@shared\/(?:payment-methods|invoice-formatters)['"]/g;

  for (const [, importBlock] of source.matchAll(importPattern)) {
    for (const importedName of importBlock.matchAll(
      /\b([A-Za-z_$][\w$]*)\b(?:\s+as\s+[A-Za-z_$][\w$]*)?/g,
    )) {
      imported.add(importedName[1]);
    }
  }

  return imported;
}

function referencedPaymentHelpers(source: string): Set<string> {
  return new Set(
    [...source.matchAll(/\b(?:get|format)\w*PaymentMethod\w*\b/g)].map(
      ([name]) => name,
    ),
  );
}

describe('table checkout payment helper contract', () => {
  it('keeps both payment label helpers exported and behaviorally distinct', () => {
    const exports = exportedFunctions(paymentMethodsSource);

    assert.equal(exports.has('getPaymentMethodLabel'), true);
    assert.equal(exports.has('formatPaymentMethodLabel'), true);
    assert.equal(getPaymentMethodLabel('cash'), 'Dinheiro');
    assert.throws(
      () => getPaymentMethodLabel('provider_code'),
      /Forma de pagamento inválida/,
    );
    assert.equal(
      formatPaymentMethodLabel('provider_code'),
      'Método não especificado',
    );
  });

  it('uses only exported and imported payment helpers in table components', () => {
    const exported = exportedFunctions(paymentMethodsSource);

    for (const [name, source] of checkoutSources) {
      const imported = importedPaymentHelpers(source);
      for (const helper of referencedPaymentHelpers(source)) {
        assert.equal(
          exported.has(helper),
          true,
          `${name} references a payment helper that is not exported: ${helper}`,
        );
        assert.equal(
          imported.has(helper),
          true,
          `${name} references a payment helper without importing it: ${helper}`,
        );
      }
    }

    assert.match(
      checkoutSource,
      /formatPaymentMethodLabel\(paymentMethod\)/,
      'table checkout must use the shared formatter for payment labels',
    );
    assert.doesNotMatch(
      checkoutSource,
      /paymentMethod\.charAt|paymentMethod\.slice/,
      'table checkout must not format payment labels with local string logic',
    );
  });
});