export type RestaurantFiscalSource = {
  address?: string | null;
  fiscalAddress?: string | null;
  phone?: string | null;
  nif?: string | null;
  vatRegime?: string | null;
  vatRate?: string | number | null;
  documentSeries?: string | null;
  invoicePrefix?: string | null;
  email?: string | null;
  website?: string | null;
  whatsappNumber?: string | null;
  legalFooter?: string | null;
};

export type RestaurantFiscalLine = {
  label: string;
  value: string;
};

export type RestaurantFiscalDetails = {
  lines: RestaurantFiscalLine[];
  legalFooter?: string;
};

function cleanFiscalValue(value: string | number | null | undefined): string | undefined {
  if (value == null) return undefined;
  const normalized = String(value).trim();
  return normalized || undefined;
}

export function getRestaurantFiscalDetails(
  restaurant: RestaurantFiscalSource,
): RestaurantFiscalDetails {
  const address = cleanFiscalValue(restaurant.address);
  const fiscalAddress = cleanFiscalValue(restaurant.fiscalAddress) || address;
  const vatRate = cleanFiscalValue(restaurant.vatRate);
  const lines: RestaurantFiscalLine[] = [];
  const addLine = (label: string, value: string | number | null | undefined) => {
    const normalized = cleanFiscalValue(value);
    if (normalized) lines.push({ label, value: normalized });
  };

  if (address && fiscalAddress && address !== fiscalAddress) {
    addLine('Morada do estabelecimento', address);
  }
  addLine('Morada fiscal', fiscalAddress);
  addLine('Telefone', restaurant.phone);
  addLine('NIF', restaurant.nif);
  addLine('Regime de IVA', restaurant.vatRegime);
  if (vatRate) addLine('Taxa de IVA', `${vatRate}%`);
  addLine('Série documental', restaurant.documentSeries);
  addLine('Prefixo da fatura', restaurant.invoicePrefix);
  addLine('Email fiscal', restaurant.email);
  addLine('Website', restaurant.website);
  addLine('WhatsApp', restaurant.whatsappNumber);

  return {
    lines,
    legalFooter: cleanFiscalValue(restaurant.legalFooter),
  };
}
