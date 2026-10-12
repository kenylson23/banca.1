import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { getRestaurantFiscalCompleteness, getRestaurantFiscalDetails } from '../shared/invoice-fiscal';
import { updateRestaurantFiscalSchema } from '../shared/schema';

describe('getRestaurantFiscalDetails', () => {
  it('preserves every configured fiscal and contact field for invoice renderers', () => {
    const details = getRestaurantFiscalDetails({
      address: 'Rua do Comércio, 10',
      fiscalAddress: 'Av. Fiscal, 22',
      phone: '+244 923 000 000',
      nif: '5000000000',
      vatRegime: 'Regime Geral',
      vatRate: '14.00',
      documentSeries: 'FT2026',
      invoicePrefix: 'FT',
      email: 'faturacao@empresa.ao',
      website: 'empresa.ao',
      whatsappNumber: '+244 923 000 001',
      legalFooter: 'Documento emitido nos termos legais.',
    });

    assert.deepEqual(details.lines, [
      { label: 'Morada do estabelecimento', value: 'Rua do Comércio, 10' },
      { label: 'Morada fiscal', value: 'Av. Fiscal, 22' },
      { label: 'Telefone', value: '+244 923 000 000' },
      { label: 'NIF', value: '5000000000' },
      { label: 'Regime de IVA', value: 'Regime Geral' },
      { label: 'Taxa de IVA', value: '14.00%' },
      { label: 'Série documental', value: 'FT2026' },
      { label: 'Prefixo da fatura', value: 'FT' },
      { label: 'Email fiscal', value: 'faturacao@empresa.ao' },
      { label: 'Website', value: 'empresa.ao' },
      { label: 'WhatsApp', value: '+244 923 000 001' },
    ]);
    assert.equal(details.legalFooter, 'Documento emitido nos termos legais.');
  });

  it('uses the business address as a fiscal-address fallback and retains a zero tax rate', () => {
    const details = getRestaurantFiscalDetails({
      address: 'Rua do Comércio, 10',
      fiscalAddress: '  ',
      vatRate: 0,
      email: '',
    });

    assert.deepEqual(details.lines, [
      { label: 'Morada fiscal', value: 'Rua do Comércio, 10' },
      { label: 'Taxa de IVA', value: '0%' },
    ]);
    assert.equal(details.legalFooter, undefined);
  });
});

describe('getRestaurantFiscalCompleteness', () => {
  it('reports missing core fiscal fields and accepts the business address as a fallback', () => {
    const result = getRestaurantFiscalCompleteness({
      address: 'Rua do Comércio, 10',
      vatRegime: 'Regime Geral',
      vatRate: 14,
      invoicePrefix: 'FT',
    });

    assert.deepEqual(result, {
      isComplete: false,
      missingFields: ['NIF'],
    });
  });

  it('accepts zero tax rate and either document series or invoice prefix', () => {
    const result = getRestaurantFiscalCompleteness({
      nif: '5000000000',
      fiscalAddress: 'Av. Fiscal, 22',
      vatRegime: 'Regime de isenção',
      vatRate: 0,
      documentSeries: 'FT2026',
    });

    assert.deepEqual(result, { isComplete: true, missingFields: [] });
  });

  it('reports every missing core fiscal field', () => {
    const result = getRestaurantFiscalCompleteness({});

    assert.deepEqual(result, {
      isComplete: false,
      missingFields: [
        'NIF',
        'Morada fiscal',
        'Regime de IVA',
        'Taxa de IVA',
        'Série documental ou prefixo da fatura',
      ],
    });
  });
});

describe('updateRestaurantFiscalSchema', () => {
  it('allows saving fiscal details when no billing email is configured', () => {
    const result = updateRestaurantFiscalSchema.safeParse({
      nif: '5000000000',
      email: '',
    });

    assert.equal(result.success, true);
    if (result.success) {
      assert.equal(result.data.nif, '5000000000');
    }
  });

  it('still rejects a malformed non-empty email', () => {
    const result = updateRestaurantFiscalSchema.safeParse({
      nif: '5000000000',
      email: 'email-invalido',
    });

    assert.equal(result.success, false);
  });
});
