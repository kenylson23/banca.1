import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { formatKwanza } from '@/lib/formatters';
import type { TableInvoiceDocument } from '@shared/table-invoice-document';

const escapeHtml = (value: unknown) => String(value ?? '')
  .replace(/&/g, '&amp;')
  .replace(/</g, '&lt;')
  .replace(/>/g, '&gt;')
  .replace(/"/g, '&quot;')
  .replace(/'/g, '&#039;');

const dateLabel = (value: string | null | undefined) =>
  value ? format(new Date(value), 'dd/MM/yyyy HH:mm', { locale: ptBR }) : '-';

const moneyLabel = (value: string | number) => formatKwanza(Number(value || 0));
const paymentStatusLabels = {
  pendente: 'PENDENTE',
  parcial: 'PAGO PARCIALMENTE',
  pago: 'PAGO',
} as const;

export type TableInvoicePaper = 'a4' | '80mm';

export type TableInvoiceRenderOptions = {
  paper?: TableInvoicePaper;
  qrCodeDataUrl?: string;
};

export function renderTableInvoiceHtml(
  document: TableInvoiceDocument,
  options: TableInvoiceRenderOptions = {},
): string {
  const paper = options.paper ?? 'a4';
  const isThermal = paper === '80mm';
  const itemRows = document.items.length
    ? document.items.map((item) => `
      <tr>
        <td>${escapeHtml(item.quantity)}</td>
        <td><strong>${escapeHtml(item.name)}</strong>${item.options.length ? `<small>${escapeHtml(item.options.map((option) => option.name).join(', '))}</small>` : ''}${item.notes ? `<small>Nota: ${escapeHtml(item.notes)}</small>` : ''}</td>
        <td>${moneyLabel(item.unitPrice)}</td>
        <td>${moneyLabel(item.total)}</td>
      </tr>`).join('')
    : '<tr><td colspan="4">Sem itens registados</td></tr>';
  const adjustmentRows = [
    ...document.discounts.map((adjustment) => `<div class="line"><span>${escapeHtml(adjustment.label)}</span><span>- ${moneyLabel(adjustment.amount)}</span></div>`),
    ...document.fees.map((adjustment) => `<div class="line"><span>${escapeHtml(adjustment.label)}</span><span>+ ${moneyLabel(adjustment.amount)}</span></div>`),
  ].join('');
  const paymentRows = document.payments.length
    ? document.payments.map((payment) => `
      <div class="payment">
        <div><strong>${escapeHtml(payment.paymentMethodLabel)}</strong><small>${escapeHtml(dateLabel(payment.createdAt))}${payment.notes ? ` · ${escapeHtml(payment.notes)}` : ''}</small></div>
        <strong>${moneyLabel(payment.amount)}</strong>
      </div>`).join('')
    : '<div class="empty">Nenhum pagamento registado</div>';
  const guests = document.guests.length && !isThermal
    ? `<section><h2>Convidados</h2><div class="guests">${document.guests.map((guest) => `<span>${escapeHtml(guest.name)}${guest.seatNumber ? ` · Lugar ${guest.seatNumber}` : ''}</span>`).join('')}</div></section>`
    : '';
  const logo = document.restaurant.logoUrl
    ? `<img class="logo" src="${escapeHtml(document.restaurant.logoUrl)}" alt="${escapeHtml(document.restaurant.name)}" />`
    : `<div class="logo-fallback">${escapeHtml(document.restaurant.name.slice(0, 1).toUpperCase())}</div>`;
  const qrCode = options.qrCodeDataUrl
    ? `<div class="qr-wrap"><img class="qr" src="${escapeHtml(options.qrCodeDataUrl)}" alt="QR Code da fatura" /><div><strong>Validação digital</strong><small>Leia para confirmar este documento</small><small>Código: ${escapeHtml(document.validation.code)}</small></div></div>`
    : `<div class="validation"><strong>Código de validação</strong><span>${escapeHtml(document.validation.code)}</span></div>`;

  return `<!doctype html>
    <html lang="pt"><head><meta charset="utf-8">
    <title>${escapeHtml(document.invoiceReference)}</title>
    <style>
      @page { size: ${isThermal ? '80mm auto' : 'A4'}; margin: ${isThermal ? '4mm' : '12mm'}; }
      @media print { body { margin: 0; box-shadow: none; } .no-print { display:none !important; } }
      * { box-sizing: border-box; } body { font-family: Arial, sans-serif; width: ${isThermal ? '72mm' : '100%'}; max-width: ${isThermal ? '72mm' : '780px'}; margin: ${isThermal ? '0 auto' : '28px auto'}; color: #17202a; background: #fff; font-size: ${isThermal ? '10px' : '12px'}; line-height: 1.35; }
      header { display:flex; align-items:flex-start; justify-content:space-between; gap:18px; border-bottom:2px solid #17202a; padding-bottom:14px; }
      .brand { display:flex; align-items:center; gap:10px; min-width:0; } .logo, .logo-fallback { width:50px; height:50px; object-fit:contain; border-radius:10px; } .logo-fallback { display:flex; align-items:center; justify-content:center; background:#17202a; color:white; font-size:22px; font-weight:700; }
      h1 { margin:0 0 3px; font-size:20px; letter-spacing:-.02em; } h2 { font-size:12px; letter-spacing:.08em; text-transform:uppercase; border-bottom:1px solid #dfe5e8; padding-bottom:6px; margin:20px 0 9px; }
      .muted, small { color:#64727d; } small { display:block; margin-top:3px; font-size:.88em; } .meta { text-align:right; white-space:nowrap; } .meta strong { display:block; font-size:10px; letter-spacing:.12em; } .meta .number { display:block; font-size:18px; font-weight:700; margin:2px 0; }
      .status { display:inline-block; margin-top:7px; padding:4px 9px; border-radius:999px; background:${document.totals.paymentStatus === 'pago' ? '#dcfce7' : document.totals.paymentStatus === 'parcial' ? '#dbeafe' : '#fef3c7'}; color:${document.totals.paymentStatus === 'pago' ? '#166534' : document.totals.paymentStatus === 'parcial' ? '#1d4ed8' : '#92400e'}; font-weight:700; font-size:10px; }
      .grid { display:grid; grid-template-columns:repeat(3, 1fr); gap:8px; margin:14px 0; } .info, .customer { border:1px solid #dfe5e8; border-radius:7px; padding:9px 10px; } .info label, .customer label { display:block; color:#64727d; font-size:10px; text-transform:uppercase; letter-spacing:.07em; margin-bottom:3px; }
      .customer { background:#f5f8f9; display:grid; grid-template-columns:1fr 1fr; gap:8px 18px; } .customer .wide { grid-column:1 / -1; } section { break-inside:avoid; }
      table { width:100%; border-collapse:collapse; } th { background:#17202a; color:#fff; font-size:10px; text-transform:uppercase; letter-spacing:.06em; } th,td { text-align:left; padding:8px 7px; border-bottom:1px solid #e5eaed; vertical-align:top; } th:first-child,td:first-child { text-align:center; width:9%; } th:nth-child(n+3),td:nth-child(n+3) { text-align:right; white-space:nowrap; }
      .guests { display:flex; flex-wrap:wrap; gap:6px; } .guests span { background:#edf2f4; padding:5px 8px; border-radius:4px; }
      .summary { margin:16px 0 0 auto; max-width:360px; border:1px solid #dfe5e8; border-radius:8px; padding:11px 13px; } .line { display:flex; justify-content:space-between; gap:20px; margin:5px 0; } .grand { font-size:18px; font-weight:700; margin:9px -13px 7px; padding:10px 13px; border-top:1px solid #dfe5e8; border-bottom:1px solid #dfe5e8; background:#f5f8f9; } .pending { color:#b45309; font-weight:700; }
      .payments { border:1px solid #dfe5e8; border-radius:8px; overflow:hidden; } .payment { display:flex; justify-content:space-between; gap:12px; padding:9px 11px; border-bottom:1px solid #e5eaed; } .payment:last-child { border-bottom:0; } .payment strong:last-child { white-space:nowrap; } .empty { padding:10px; color:#64727d; }
      .footer { display:flex; justify-content:space-between; align-items:center; gap:18px; margin-top:24px; padding-top:13px; border-top:1px dashed #aab5bb; } .qr-wrap { display:flex; align-items:center; gap:10px; } .qr { width:74px; height:74px; image-rendering:auto; } .validation { text-align:right; font-size:10px; } .validation strong, .validation span { display:block; } .validation span { font-size:13px; font-weight:700; letter-spacing:.1em; margin-top:3px; }
      .thermal-only { display:${isThermal ? 'block' : 'none'}; } .a4-only { display:${isThermal ? 'none' : 'block'}; }
      ${isThermal ? 'header { display:block; text-align:center; } .brand { justify-content:center; } .meta { text-align:center; margin-top:9px; } .logo, .logo-fallback { width:42px; height:42px; } .grid { grid-template-columns:1fr 1fr; } .grid .info:last-child { grid-column:1 / -1; } .customer { grid-template-columns:1fr; } .customer .wide { grid-column:auto; } h2 { margin-top:15px; } th,td { padding:6px 3px; font-size:9px; } th:nth-child(3),td:nth-child(3) { display:none; } .summary { max-width:none; } .grand { font-size:15px; } .footer { display:block; text-align:center; } .qr-wrap { justify-content:center; margin-bottom:8px; } .validation { text-align:center; }' : ''}
    </style></head><body>
      <header><div class="brand">${logo}<div><h1>${escapeHtml(document.restaurant.name)}</h1>
        ${document.branch ? `<div>${escapeHtml(document.branch.name)}</div>` : ''}
        <div class="muted">${escapeHtml(document.restaurant.address || '')}${document.restaurant.phone ? ` · ${escapeHtml(document.restaurant.phone)}` : ''}</div>
      </div></div><div class="meta"><strong>FATURA/RECIBO</strong><span class="number">Nº ${escapeHtml(document.invoiceReference)}</span><span>${escapeHtml(dateLabel(document.issuedAt))}</span><span class="status">${paymentStatusLabels[document.totals.paymentStatus]}</span></div></header>
      <div class="grid"><div class="info"><label>Mesa</label><strong>${escapeHtml(document.table.number)}${document.table.area ? ` · ${escapeHtml(document.table.area)}` : ''}</strong></div>
        <div class="info"><label>Sessão iniciada</label><strong>${escapeHtml(dateLabel(document.session.startedAt))}</strong></div><div class="info"><label>Moeda</label><strong>AOA · Kwanza</strong></div></div>
      ${document.customer ? `<section><h2>Identificação</h2><div class="customer"><div><label>Cliente</label><strong>${escapeHtml(document.customer.name)}</strong></div>${document.customer.phone ? `<div><label>Telefone</label><strong>${escapeHtml(document.customer.phone)}</strong></div>` : ''}${document.customer.nif ? `<div><label>NIF</label><strong>${escapeHtml(document.customer.nif)}</strong></div>` : ''}${document.customer.address ? `<div class="wide"><label>Endereço</label><strong>${escapeHtml(document.customer.address)}</strong></div>` : ''}</div></section>` : ''}
      ${guests}
      <section><h2>Itens</h2><table><thead><tr><th>Qtd.</th><th>Descrição</th><th>Preço unit.</th><th>Total</th></tr></thead><tbody>${itemRows}</tbody></table></section>
      <section class="summary"><div class="line"><span>Subtotal</span><span>${moneyLabel(document.totals.subtotal)}</span></div>${adjustmentRows}
        <div class="line grand"><span>Total</span><span>${moneyLabel(document.totals.total)}</span></div>
        <div class="line"><span>Pago</span><span>${moneyLabel(document.totals.paid)}</span></div>
        <div class="line"><span>Saldo pendente</span><span class="pending">${moneyLabel(document.totals.pending)}</span></div>
      </section>
      <section><h2>Pagamentos realizados</h2><div class="payments">${paymentRows || '<div class="muted">Nenhum pagamento registado</div>'}</div></section>
      <footer class="footer">${qrCode}<div class="muted">Documento final emitido em ${escapeHtml(dateLabel(document.issuedAt))}<br>Fatura/Recibo Nº ${escapeHtml(document.invoiceReference)}<br>Código de validação: ${escapeHtml(document.validation.code)}</div></footer>
    </body></html>`;
}

export function tableInvoiceToThermalPayload(document: TableInvoiceDocument) {
  return {
    invoiceNumber: document.invoiceReference,
    validationCode: document.validation.code,
    date: dateLabel(document.issuedAt),
    customerName: document.customer?.name,
    customerPhone: document.customer?.phone ?? undefined,
    items: document.items.map((item) => ({
      name: item.name,
      quantity: item.quantity,
      price: moneyLabel(item.unitPrice),
      total: moneyLabel(item.total),
    })),
    subtotal: moneyLabel(document.totals.subtotal),
    discount: Number(document.totals.discount) > 0 ? `- ${moneyLabel(document.totals.discount)}` : undefined,
    serviceCharge: Number(document.totals.fees) > 0 ? moneyLabel(document.totals.fees) : undefined,
    total: moneyLabel(document.totals.total),
    status: paymentStatusLabels[document.totals.paymentStatus],
    paymentInfo: document.payments.map((payment) => `${payment.paymentMethodLabel}: ${moneyLabel(payment.amount)}`).join(' | ') || undefined,
  };
}