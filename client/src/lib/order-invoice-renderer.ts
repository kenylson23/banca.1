export type OrderInvoiceThermalData = {
  restaurantName: string;
  fiscalLines: Array<{ label: string; value: string }>;
  legalFooter?: string;
  invoiceNumber: string;
  validationCode: string;
  date: string;
  status: string;
  orderNumber: string;
  orderType: string;
  tableNumber?: string;
  customerName?: string;
  customerPhone?: string;
  customerEmail?: string;
  customerNif?: string;
  customerAddress?: string;
  deliveryAddress?: string;
  items: Array<{
    name: string;
    quantity: number;
    unitPrice: string;
    total: string;
    options: string[];
    notes?: string;
  }>;
  subtotal: string;
  adjustments: Array<{ label: string; amount: string; sign: '-' | '+' }>;
  total: string;
  payments: Array<{ method: string; amount: string }>;
  orderNotes?: string;
};

const escapeHtml = (value: unknown) => String(value ?? '')
  .replace(/&/g, '&amp;')
  .replace(/</g, '&lt;')
  .replace(/>/g, '&gt;')
  .replace(/"/g, '&quot;')
  .replace(/'/g, '&#039;');

export function renderOrderInvoiceThermalHtml(document: OrderInvoiceThermalData): string {
  const fiscalLines = document.fiscalLines
    .map(({ label, value }) => `<div><span>${escapeHtml(label)}:</span> ${escapeHtml(value)}</div>`)
    .join('');
  const customerLines = [
    ['Cliente', document.customerName || 'Consumidor final'],
    ['Telefone', document.customerPhone],
    ['Email', document.customerEmail],
    ['NIF', document.customerNif],
    ['Morada', document.customerAddress],
    ['Entrega', document.deliveryAddress],
  ].filter((entry): entry is [string, string] => Boolean(entry[1]))
    .map(([label, value]) => `<div><span>${escapeHtml(label)}:</span> ${escapeHtml(value)}</div>`)
    .join('');
  const itemRows = document.items.length
    ? document.items.map((item) => `
      <article class="item">
        <div class="item-heading"><strong>${escapeHtml(item.quantity)} × ${escapeHtml(item.name)}</strong><strong>${escapeHtml(item.total)}</strong></div>
        <div class="item-unit">Unitário: ${escapeHtml(item.unitPrice)}</div>
        ${item.options.map((option) => `<div class="item-detail">Opção: ${escapeHtml(option)}</div>`).join('')}
        ${item.notes ? `<div class="item-detail">Obs.: ${escapeHtml(item.notes)}</div>` : ''}
      </article>`).join('')
    : '<div class="muted">Sem produtos registados</div>';
  const adjustmentRows = document.adjustments
    .map(({ label, amount, sign }) => `<div class="amount-row"><span>${escapeHtml(label)}</span><strong>${sign} ${escapeHtml(amount)}</strong></div>`)
    .join('');
  const paymentRows = document.payments.length
    ? document.payments.map(({ method, amount }) => `<div class="amount-row"><span>${escapeHtml(method)}</span><strong>${escapeHtml(amount)}</strong></div>`).join('')
    : '<div class="muted">Nenhum pagamento registado</div>';

  return `<!doctype html>
    <html lang="pt"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Fatura/Recibo ${escapeHtml(document.invoiceNumber)}</title>
    <style>
      @page { size: 80mm auto; margin: 0; }
      * { box-sizing: border-box; }
      html, body { margin: 0; padding: 0; background: #fff; color: #111; font-family: Arial, sans-serif; }
      body { width: 72mm; max-width: 72mm; margin: 0 auto; padding: 2mm 0; font-size: 10px; line-height: 1.3; overflow-wrap: anywhere; }
      header { padding-bottom: 7px; border-bottom: 1px dashed #555; text-align: center; }
      h1 { margin: 0 0 3px; font-size: 14px; line-height: 1.2; }
      .fiscal { margin-top: 5px; font-size: 9px; }
      .fiscal div { margin: 1px 0; }
      .document { margin-top: 6px; font-weight: 700; }
      .document-number { font-size: 13px; }
      .muted { color: #222; }
      section { margin-top: 8px; }
      h2 { margin: 0 0 4px; padding-bottom: 3px; border-bottom: 1px dashed #888; font-size: 10px; text-transform: uppercase; }
      .details > div { margin: 2px 0; }
      .details span { color: #333; }
      .item { padding: 4px 0; border-bottom: 1px dashed #aaa; }
      .item-heading { display: flex; align-items: flex-start; justify-content: space-between; gap: 6px; }
      .item-heading strong:first-child { min-width: 0; }
      .item-heading strong:last-child { flex: 0 0 auto; white-space: nowrap; text-align: right; }
      .item-unit { margin: 1px 0; text-align: right; font-size: 9px; }
      .item-detail { margin-top: 2px; font-size: 9px; }
      .amounts { padding: 5px 0; border-top: 1px dashed #555; border-bottom: 1px dashed #555; }
      .amount-row { display: flex; align-items: flex-start; justify-content: space-between; gap: 6px; margin: 3px 0; }
      .amount-row span { min-width: 0; }
      .amount-row strong { flex: 0 0 auto; white-space: nowrap; }
      .grand-total { margin: 5px 0; padding: 5px 0; border-top: 1px dashed #555; border-bottom: 1px dashed #555; font-size: 14px; font-weight: 700; }
      footer { margin-top: 8px; padding-top: 6px; border-top: 1px dashed #555; text-align: center; }
      footer p { margin: 3px 0; }
      .validation { font-weight: 700; overflow-wrap: anywhere; }
      @media print {
        body { margin: 0 auto; }
        * { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
      }
    </style></head><body>
      <header>
        <h1>${escapeHtml(document.restaurantName)}</h1>
        <div class="fiscal">${fiscalLines}</div>
        <div class="document">FATURA/RECIBO</div>
        <div class="document-number">Nº ${escapeHtml(document.invoiceNumber)}</div>
        <div>Data e hora: ${escapeHtml(document.date)}</div>
        <div>Estado: ${escapeHtml(document.status)}</div>
      </header>
      <section><h2>Cliente e operação</h2><div class="details">
        ${customerLines}
        <div><span>Tipo:</span> ${escapeHtml(document.orderType)}</div>
        ${document.tableNumber ? `<div><span>Mesa:</span> ${escapeHtml(document.tableNumber)}</div>` : ''}
        <div><span>Nº do pedido:</span> ${escapeHtml(document.orderNumber)}</div>
      </div></section>
      <section><h2>Produtos</h2>${itemRows}</section>
      ${document.orderNotes ? `<section><h2>Observações</h2><div>${escapeHtml(document.orderNotes)}</div></section>` : ''}
      <section><h2>Resumo</h2><div class="amounts">
        <div class="amount-row"><span>Subtotal</span><strong>${escapeHtml(document.subtotal)}</strong></div>
        ${adjustmentRows}
        <div class="amount-row grand-total"><span>Total</span><strong>${escapeHtml(document.total)}</strong></div>
      </div></section>
      <section><h2>Pagamentos</h2><div class="details">${paymentRows}</div></section>
      <footer>
        ${document.legalFooter ? `<p>${escapeHtml(document.legalFooter)}</p>` : ''}
        <p class="validation">Código de validação: ${escapeHtml(document.validationCode)}</p>
        <p>Obrigado pela sua preferência!</p>
      </footer>
    </body></html>`;
}
