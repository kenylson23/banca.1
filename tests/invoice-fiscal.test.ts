import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { getRestaurantFiscalDetails } from '../shared/invoice-fiscal';

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
