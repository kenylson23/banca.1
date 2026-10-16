import type { TableInvoiceDocument } from '@shared/table-invoice-document';
import { getRestaurantFiscalDetails } from '@shared/invoice-fiscal';
import {
  invoiceAdjustmentLabel,
  invoiceAdjustmentDetail,
  invoiceDate,
  invoiceMoney,
  invoiceNumber,
  invoiceNumberLabel,
  invoiceOrderStatusLabel,
  invoicePaymentStatusLabel,
  invoiceSessionLabel,
} from '@shared/invoice-formatters';

const escapeHtml = (value: unknown) => String(value ?? '')
  .replace(/&/g, '&amp;')
  .replace(/</g, '&lt;')
  .replace(/>/g, '&gt;')
  .replace(/"/g, '&quot;')
  .replace(/'/g, '&#039;');

const dateLabel = (value: string | null | undefined) => invoiceDate(value);
const moneyLabel = (value: string | number) => invoiceMoney(value);

export type TableInvoicePaper = 'a4' | '80mm';

export type TableInvoiceRenderOptions = {
  paper?: TableInvoicePaper;
  qrCodeDataUrl?: string;
  returnUrl?: string;
};

export function renderTableInvoiceHtml(
  document: TableInvoiceDocument,
  options: TableInvoiceRenderOptions = {},
): string {
  const paper = options.paper ?? 'a4';
  const isThermal = paper === '80mm';
  const renderItemRow = (item: TableInvoiceDocument['items'][number], cancelled = false) => `
      <tr>
        <td>${escapeHtml(item.quantity)}</td>
        <td><strong>${escapeHtml(item.name)}</strong>
           <small>Pedido ${escapeHtml(item.orderNumber ? `#${item.orderNumber}` : 'sem número')}${item.orderCreatedAt ? ` · ${escapeHtml(dateLabel(item.orderCreatedAt))}` : ''} · ${escapeHtml(invoiceOrderStatusLabel(item.orderStatus))}</small>
          ${item.guestName ? `<small>Convidado: ${escapeHtml(item.guestName)}</small>` : ''}
          ${item.options.length ? `<small>Opções: ${escapeHtml(item.options.map((option) => `${option.name}${option.quantity > 1 ? ` (${option.quantity}x)` : ''}`).join(', '))}</small>` : ''}
          ${item.notes ? `<small>Obs. do item: ${escapeHtml(item.notes)}</small>` : ''}
          ${item.orderNotes ? `<small>Obs. do pedido: ${escapeHtml(item.orderNotes)}</small>` : ''}
          ${item.sharedWithGuestNames.length ? `<small class="shared">Partilhado com: ${escapeHtml(item.sharedWithGuestNames.join(', '))}</small>` : ''}
          ${cancelled ? '<small class="cancelled">Consumo cancelado — não incluído no total</small>' : ''}
        </td>
        <td>${moneyLabel(item.unitPrice)}</td>
        <td>${moneyLabel(item.total)}</td>
      </tr>`;
  const itemRows = document.items.length
    ? document.items.map((item) => renderItemRow(item)).join('')
    : '<tr><td colspan="4">Sem itens registados</td></tr>';
  const renderThermalItem = (item: TableInvoiceDocument['items'][number], cancelled = false) => `
    <article class="thermal-item${cancelled ? ' cancelled' : ''}">
      <div class="thermal-item-heading"><strong>${escapeHtml(item.quantity)} × ${escapeHtml(item.name)}</strong><strong>${moneyLabel(item.total)}</strong></div>
      <div class="thermal-item-unit">Unitário: ${moneyLabel(item.unitPrice)}</div>
      ${item.orderNumber || item.orderCreatedAt || item.orderStatus ? `<small>Pedido ${escapeHtml(item.orderNumber ? `#${item.orderNumber}` : 'sem número')}${item.orderCreatedAt ? ` · ${escapeHtml(dateLabel(item.orderCreatedAt))}` : ''} · ${escapeHtml(invoiceOrderStatusLabel(item.orderStatus))}</small>` : ''}
      ${item.guestName ? `<small>Convidado: ${escapeHtml(item.guestName)}</small>` : ''}
      ${item.options.length ? `<small>Opções: ${escapeHtml(item.options.map((option) => `${option.name}${option.quantity > 1 ? ` (${option.quantity}x)` : ''}`).join(', '))}</small>` : ''}
      ${item.notes ? `<small>Obs. do item: ${escapeHtml(item.notes)}</small>` : ''}
      ${item.orderNotes ? `<small>Obs. do pedido: ${escapeHtml(item.orderNotes)}</small>` : ''}
      ${item.sharedWithGuestNames.length ? `<small class="shared">Partilhado com: ${escapeHtml(item.sharedWithGuestNames.join(', '))}</small>` : ''}
      ${cancelled ? '<small class="cancelled-label">Consumo cancelado — não incluído no total</small>' : ''}
    </article>`;
  const thermalItemRows = document.items.length
    ? document.items.map((item) => renderThermalItem(item)).join('')
    : '<p class="empty">Sem itens registados</p>';
  const cancelledItemRows = document.cancelledItems.length
    ? document.cancelledItems.map((item) => renderItemRow(item, true)).join('')
    : '';
  const thermalCancelledItemRows = document.cancelledItems
    .map((item) => renderThermalItem(item, true))
    .join('');
  const orderNotes = Array.from(new Set(document.items.map((item) => item.orderNotes).filter(Boolean))) as string[];
  const adjustmentRows = [
      ...document.discounts.map((adjustment) => `<div class="line adjustment"><span><strong>${escapeHtml(adjustment.label)}</strong><small>${escapeHtml(invoiceAdjustmentDetail(adjustment))}</small></span><span>- ${moneyLabel(adjustment.amount)}</span></div>`),
      ...document.fees.map((adjustment) => `<div class="line adjustment"><span><strong>${escapeHtml(adjustment.label)}</strong><small>${escapeHtml(invoiceAdjustmentDetail(adjustment))}</small></span><span>+ ${moneyLabel(adjustment.amount)}</span></div>`),
  ].join('');
  const paymentRows = document.payments.length
    ? document.paymentsByMethod.map((payment) => `
      <div class="payment">
        <div><strong>${escapeHtml(payment.paymentMethodLabel)}</strong><small>${payment.count} ${payment.count === 1 ? 'lançamento' : 'lançamentos'}</small></div>
        <strong>${moneyLabel(payment.amount)}</strong>
      </div>`).join('')
    : '<div class="empty">Nenhum pagamento registado</div>';
  const paymentDetailRows = document.payments.length
    ? document.payments.map((payment) => `
      <div class="payment detail">
        <div><strong>${escapeHtml(payment.paymentMethodLabel)}</strong><small>${escapeHtml(dateLabel(payment.createdAt))}${payment.operatorName ? ` · ${escapeHtml(payment.operatorName)}` : ''}${payment.notes ? ` · ${escapeHtml(payment.notes)}` : ''}</small></div>
        <strong>${moneyLabel(payment.amount)}</strong>
      </div>`).join('')
    : '';
  const guests = document.guests.length
    ? `<section><h2>Convidados</h2><div class="guests">${document.guests.map((guest) => {
      const details = [guest.customer?.phone, guest.customer?.nif].filter(Boolean).join(' · ');
      return `<span><strong>${escapeHtml(guest.name)}</strong>${guest.seatNumber ? ` · Lugar ${escapeHtml(guest.seatNumber)}` : ''}${details ? `<small>${escapeHtml(details)}</small>` : ''}</span>`;
    }).join('')}</div></section>`
    : '';
  const customerDetails = document.customer
    ? `<div><label>Cliente</label><strong>${escapeHtml(document.customer.name)}</strong></div>${document.customer.phone ? `<div><label>Telefone</label><strong>${escapeHtml(document.customer.phone)}</strong></div>` : ''}${document.customer.email ? `<div><label>Email</label><strong>${escapeHtml(document.customer.email)}</strong></div>` : ''}${document.customer.nif ? `<div><label>NIF</label><strong>${escapeHtml(document.customer.nif)}</strong></div>` : ''}${document.customer.address ? `<div class="wide"><label>Morada</label><strong>${escapeHtml(document.customer.address)}</strong></div>` : ''}`
    : `<div><label>Cliente</label><strong>Consumidor final</strong></div>`;
  const primaryCustomer = document.tableCustomer && document.tableCustomer.id !== document.customer?.id
    ? `<div class="wide"><label>Cliente principal da mesa</label><strong>${escapeHtml(document.tableCustomer.name)}</strong>${document.tableCustomer.phone ? `<small>${escapeHtml(document.tableCustomer.phone)}</small>` : ''}</div>`
    : '';
  const invoiceIdentity = `<section class="recipient-section"><h2>Destinatário da fatura</h2><div class="customer"><div class="wide"><label>Fatura em nome de</label><strong>${escapeHtml(document.invoiceRecipient.label)}</strong></div>${customerDetails}${primaryCustomer}${document.isSplit ? `<div class="wide split-note"><strong>Conta dividida</strong><small>Esta mesa tem ${document.guests.length} convidados registados.</small></div>` : ''}</div></section>`;
  const branchName = document.branch?.name || 'Unidade principal';
  const branchAddress = document.branch?.address || document.restaurant.address;
  const branchPhone = document.branch?.phone || document.restaurant.phone;
  const fiscalDetails = getRestaurantFiscalDetails(document.restaurant);
  const issuerFiscalDetails = fiscalDetails.lines.length
    ? `<div class="issuer-fiscal" aria-label="Dados fiscais do emitente"><div class="issuer-fiscal-heading">Dados fiscais do emitente</div>${fiscalDetails.lines.map(({ label, value }) => `<div class="issuer-detail"><span>${escapeHtml(label)}</span><strong>${escapeHtml(value)}</strong></div>`).join('')}</div>`
    : '';
  const operationDetails = `<section class="operation-section"><h2>Dados da operação</h2><div class="operation-grid">
    <div><label>Filial</label><strong>${escapeHtml(branchName)}</strong></div>
    <div><label>Endereço da filial</label><strong>${escapeHtml(branchAddress || '-')}</strong></div>
    <div><label>Telefone da filial</label><strong>${escapeHtml(branchPhone || '-')}</strong></div>
     <div><label>Caixa</label><strong>${escapeHtml(document.cashRegisterShift?.cashRegisterName || 'Não identificado')}</strong></div>
     <div><label>Turno</label><strong>${escapeHtml(document.cashRegisterShift?.label || 'Não identificado')}</strong></div>
    <div><label>Atendido por</label><strong>${escapeHtml(document.paymentOperatorNames.length ? document.paymentOperatorNames.join(', ') : document.session.openedByName || '-')}</strong></div>
    <div><label>Fechado por</label><strong>${escapeHtml(document.session.closedByName || document.cashRegisterShift?.closedByName || '-')}</strong></div>
    <div><label>Abertura</label><strong>${escapeHtml(dateLabel(document.session.startedAt))}</strong></div>
    <div><label>Encerramento</label><strong>${escapeHtml(dateLabel(document.session.endedAt))}</strong></div>
    <div><label>Duração total</label><strong>${escapeHtml(document.session.durationLabel)}</strong></div>
  </div></section>`;
  const logo = document.restaurant.logoUrl
    ? `<img class="logo" src="${escapeHtml(document.restaurant.logoUrl)}" alt="${escapeHtml(document.restaurant.name)}" />`
    : `<div class="logo-fallback">${escapeHtml(document.restaurant.name.slice(0, 1).toUpperCase())}</div>`;
  const qrCode = options.qrCodeDataUrl
    ? `<div class="qr-wrap"><img class="qr" src="${escapeHtml(options.qrCodeDataUrl)}" alt="QR Code da fatura" /><div><strong>Validação digital</strong><small>Leia para confirmar este documento</small><small>Código: ${escapeHtml(document.validation.code)}</small><small class="verification-url">${escapeHtml(document.validation.verificationUrl)}</small></div></div>`
    : `<div class="validation"><strong>Código de validação</strong><span>${escapeHtml(document.validation.code)}</span><small>${escapeHtml(document.validation.verificationUrl)}</small></div>`;
  const returnToolbar = options.returnUrl
    ? `<nav class="no-print return-toolbar"><a href="${escapeHtml(options.returnUrl)}">← Voltar à gestão da mesa</a></nav>`
    : '';
  const compactThermalStyles = isThermal ? `
      @page { size: 80mm auto; margin: 0; }
      body { width: 72mm; max-width: 72mm; margin: 0 auto; padding: 2mm 0; font-size: 10px; line-height: 1.3; color: #111; }
      .invoice-document { width: 100%; }
      .invoice-header { display: block; padding: 0 0 8px; border-bottom: 1px dashed #555; }
      .brand { justify-content: center; gap: 0; text-align: center; }
      .logo, .logo-fallback { width: 28px; height: 28px; margin: 0 auto 4px; border-radius: 0; }
      h1.issuer-name { margin: 0; font-size: 14px; line-height: 1.25; }
      .eyebrow { display: none; }
      .branch-name { margin-top: 2px; font-size: 9px; }
      .issuer-fiscal { grid-template-columns: 1fr; gap: 2px; margin-top: 6px; padding-top: 5px; border-top: 1px dashed #888; text-align: center; }
      .issuer-fiscal-heading { font-size: 8px; }
      .issuer-detail span { display: inline; margin-right: 3px; font-size: 9px; }
      .issuer-detail strong { display: inline; font-size: 9px; }
      .document-card { align-items: center; gap: 2px; margin-top: 7px; padding: 0; border: 0; background: transparent; text-align: center; }
      .document-type { color: #111; font-size: 10px; }
      .document-number { font-size: 13px; }
      .document-date { color: #222; font-size: 9px; }
      .status { margin-top: 2px; padding: 0; border-radius: 0; background: transparent !important; color: #111 !important; font-size: 9px; }
      .meta-grid { grid-template-columns: 1fr; gap: 2px; margin: 6px 0; }
      .meta-card { padding: 0; border: 0; background: transparent; }
      .meta-card label, .customer label, .operation-grid label { display: inline; margin: 0 3px 0 0; color: #333; font-size: 9px; letter-spacing: 0; }
      .meta-card strong, .customer strong, .operation-grid strong { display: inline; font-size: 10px; }
      .meta-card small, .customer small { display: inline; margin: 0 0 0 4px; }
      .meta-card:last-child { grid-column: auto; }
      section { margin-top: 8px; break-inside: auto; }
      h2 { margin: 0 0 4px; padding: 0 0 3px; border-bottom: 1px dashed #888; color: #111; font-size: 10px; letter-spacing: .02em; }
      h2::before { display: none; }
      .customer { display: block; padding: 0; border: 0; border-radius: 0; background: transparent !important; }
      .customer > div { margin: 2px 0; }
      .customer .wide { display: block; }
      .split-note { padding: 0; border: 0; }
      .operation-grid { display: block; }
      .operation-grid > div { padding: 1px 0; border: 0; border-radius: 0; background: transparent; }
      .operation-grid > div > * { overflow-wrap: anywhere; }
      .invoice-items { display: none; }
      .thermal-items { display: block; }
      .thermal-item { padding: 4px 0; border-bottom: 1px dashed #aaa; break-inside: auto; }
      .thermal-item-heading { display: flex; align-items: flex-start; justify-content: space-between; gap: 6px; }
      .thermal-item-heading strong:first-child { min-width: 0; overflow-wrap: anywhere; }
      .thermal-item-heading strong:last-child { flex: 0 0 auto; white-space: nowrap; text-align: right; }
      .thermal-item-unit { margin: 1px 0; text-align: right; font-size: 9px; }
      .thermal-item small { display: block; margin-top: 2px; color: #222; font-size: 9px; overflow-wrap: anywhere; white-space: normal; }
      .thermal-item .cancelled-label { color: #111; font-weight: 700; }
      .guests { display: block; }
      .guests span { display: block; padding: 2px 0; border: 0; border-bottom: 1px dotted #bbb; border-radius: 0; background: transparent; overflow-wrap: anywhere; }
      .guests small { display: block; margin: 1px 0 0; }
      .summary { width: 100%; max-width: none; margin: 6px 0 0; padding: 5px 0; border: 0; border-top: 1px dashed #555; border-bottom: 1px dashed #555; border-radius: 0; }
      .line { align-items: flex-start; gap: 6px; margin: 3px 0; }
      .line > span:first-child { min-width: 0; overflow-wrap: anywhere; }
      .line > span:last-child { flex: 0 0 auto; }
      .line.adjustment small { display: block; max-width: none; }
      .grand { margin: 5px 0; padding: 5px 0; border-top: 1px dashed #555; border-bottom: 1px dashed #555; background: transparent; font-size: 14px; }
      .payments { overflow: visible; border: 0; border-radius: 0; }
      .payment { align-items: flex-start; gap: 5px; padding: 3px 0; border-bottom: 1px dotted #bbb; }
      .payment small { display: block; color: #222; overflow-wrap: anywhere; }
      .payment strong:last-child { flex: 0 0 auto; white-space: nowrap; }
      .payment.detail { background: transparent; font-size: 9px; }
      .empty { padding: 2px 0; }
      .notes { padding: 0; border: 0; border-radius: 0; background: transparent; }
      .notes p { margin: 3px 0; overflow-wrap: anywhere; }
      .footer { display: block; margin-top: 8px; padding-top: 6px; border-top: 1px dashed #555; text-align: center; }
      .footer-details { color: #222; font-size: 9px; line-height: 1.35; overflow-wrap: anywhere; }
      .qr-wrap { flex-direction: column; justify-content: center; gap: 3px; margin-bottom: 5px; }
      .qr { width: 35px; height: 35px; }
      .validation { text-align: center; font-size: 9px; }
      .validation span { font-size: 11px; }
      .verification-url { max-width: 100%; }
      .return-toolbar { display: none !important; }
      .cancelled-section { opacity: 1; }
      * { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
    ` : '';

  return `<!doctype html>
    <html lang="pt"><head><meta charset="utf-8">
    <title>${escapeHtml(document.invoiceReference)}</title>
    <style>
      @page { size: ${isThermal ? '80mm auto' : 'A4'}; margin: ${isThermal ? '2mm' : '12mm'}; }
      @media print {
        body { margin: 0 auto; box-shadow: none; }
        .no-print { display: none !important; }
        .invoice-document { box-shadow: none; }
      }
      * { box-sizing: border-box; }
      body {
        --ink: #183344;
        --muted: #637784;
        --border: #d8e3e8;
        --accent: #167c70;
        --surface: #f2f7f7;
        width: ${isThermal ? '72mm' : '100%'};
        max-width: ${isThermal ? '72mm' : '780px'};
        margin: ${isThermal ? '0 auto' : '28px auto'};
        color: var(--ink);
        background: #fff;
        font-family: Arial, sans-serif;
        font-size: ${isThermal ? '9px' : '12px'};
        line-height: 1.4;
      }
      .invoice-document { width: 100%; }
      .invoice-header {
        display: grid;
        grid-template-columns: minmax(0, 1fr) minmax(190px, .7fr);
        align-items: start;
        gap: 20px;
        padding-bottom: 16px;
        border-bottom: 2px solid var(--ink);
      }
      .issuer { min-width: 0; }
      .brand { display: flex; align-items: center; gap: 11px; min-width: 0; }
      .eyebrow { margin: 0 0 2px; color: var(--accent); font-size: 9px; font-weight: 700; letter-spacing: .1em; text-transform: uppercase; }
      .logo, .logo-fallback { width: 46px; height: 46px; object-fit: contain; border-radius: 8px; }
      .logo-fallback { display: flex; align-items: center; justify-content: center; background: var(--ink); color: white; font-size: 20px; font-weight: 700; }
      .issuer-name { margin: 0; font-size: 19px; line-height: 1.15; letter-spacing: -.02em; }
      .branch-name { margin-top: 3px; color: var(--muted); font-weight: 600; }
      .issuer-fiscal { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 6px 12px; margin-top: 12px; padding-top: 10px; border-top: 1px solid var(--border); }
      .issuer-fiscal-heading { grid-column: 1 / -1; color: var(--muted); font-size: 9px; font-weight: 800; letter-spacing: .08em; text-transform: uppercase; }
      .issuer-detail { min-width: 0; }
      .issuer-detail span { display: block; margin-bottom: 1px; color: var(--muted); font-size: 9px; }
      .issuer-detail strong { display: block; font-size: 10px; overflow-wrap: anywhere; }
      .document-card { display: flex; flex-direction: column; align-items: flex-end; gap: 4px; padding: 13px 14px; border: 1px solid var(--border); border-left: 4px solid var(--accent); border-radius: 8px; background: var(--surface); text-align: right; }
      .document-type { color: var(--muted); font-size: 10px; font-weight: 700; letter-spacing: .12em; }
      .document-number { font-size: 20px; font-weight: 800; line-height: 1.15; overflow-wrap: anywhere; }
      .document-date { color: var(--muted); font-size: 10px; }
      .status { display: inline-block; margin-top: 3px; padding: 4px 9px; border-radius: 999px; background: ${document.totals.paymentStatus === 'pago' ? '#dcfce7' : document.totals.paymentStatus === 'parcial' ? '#dbeafe' : '#fef3c7'}; color: ${document.totals.paymentStatus === 'pago' ? '#166534' : document.totals.paymentStatus === 'parcial' ? '#1d4ed8' : '#92400e'}; font-size: 10px; font-weight: 700; }
      .meta-grid { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 8px; margin: 14px 0; }
      .meta-card, .customer { min-width: 0; border: 1px solid var(--border); border-radius: 7px; padding: 9px 10px; }
      .meta-card { background: #fff; }
      .meta-card label, .customer label, .operation-grid label { display: block; margin-bottom: 3px; color: var(--muted); font-size: 9px; font-weight: 700; text-transform: uppercase; letter-spacing: .07em; }
      .meta-card strong, .customer strong, .operation-grid strong { display: block; overflow-wrap: anywhere; }
      .meta-card small, .customer small { display: block; margin-top: 3px; }
      .recipient-section .customer { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 8px 16px; background: var(--surface); }
      .customer .wide { grid-column: 1 / -1; }
      .split-note { padding: 7px 9px; border-left: 3px solid var(--accent); background: #e8f4f2; }
      .operation-grid { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 7px; }
      .operation-grid > div { min-width: 0; padding: 7px 9px; border: 1px solid var(--border); border-radius: 6px; background: #fff; }
      section { margin-top: 15px; break-inside: avoid; }
      h2 { display: flex; align-items: center; gap: 7px; margin: 0 0 7px; padding-bottom: 5px; border-bottom: 1px solid var(--border); color: var(--ink); font-size: 11px; font-weight: 800; letter-spacing: .04em; text-transform: uppercase; }
      h2::before { width: 3px; height: 13px; border-radius: 2px; background: var(--accent); content: ''; }
      .muted, small { color: var(--muted); }
      small { font-size: .88em; }
      table { width: 100%; border-collapse: collapse; }
      th { background: var(--ink); color: #fff; font-size: 9px; text-transform: uppercase; letter-spacing: .04em; }
      th, td { padding: 7px 6px; border-bottom: 1px solid #e5ecef; text-align: left; vertical-align: top; }
      tbody tr:nth-child(even) { background: #f8fafb; }
      th:first-child, td:first-child { width: 8%; text-align: center; }
      th:nth-child(n+3), td:nth-child(n+3) { text-align: right; white-space: nowrap; }
      td:nth-child(2) { min-width: 0; }
      td small { display: block; margin-top: 3px; overflow-wrap: anywhere; font-weight: 400; }
      .guests { display: flex; flex-wrap: wrap; gap: 6px; }
      .guests span { padding: 5px 8px; border: 1px solid var(--border); border-radius: 5px; background: var(--surface); }
      .shared { color: #155e75; }
      .cancelled { color: #b91c1c; font-weight: 700; }
      .cancelled-section { opacity: .82; }
      .notes { padding: 8px 10px; border: 1px solid #eadfb8; border-radius: 7px; background: #fffdf5; }
      .notes p { margin: 4px 0; }
      .summary { width: min(100%, 420px); margin: 14px 0 0 auto; padding: 10px 12px; border: 1px solid var(--border); border-radius: 8px; background: #fff; }
      .line { display: flex; justify-content: space-between; gap: 14px; margin: 4px 0; }
      .line > span:last-child { white-space: nowrap; text-align: right; }
      .line.adjustment { align-items: flex-start; }
      .line.adjustment small { max-width: 280px; }
      .grand { margin: 8px -12px 6px; padding: 9px 12px; border-top: 1px solid var(--border); border-bottom: 1px solid var(--border); background: var(--surface); font-size: 16px; font-weight: 800; }
      .pending { color: #a34a08; font-weight: 700; }
      .payments { overflow: hidden; border: 1px solid var(--border); border-radius: 8px; }
      .payment { display: flex; justify-content: space-between; gap: 12px; padding: 8px 10px; border-bottom: 1px solid #e5ecef; }
      .payment:last-child { border-bottom: 0; }
      .payment strong:last-child { white-space: nowrap; }
      .payment.detail { background: #f8fafb; font-size: .92em; }
      .payment-details > p { margin: 8px 0 4px; font-size: 9px; font-weight: 700; text-transform: uppercase; }
      .empty { padding: 9px 10px; color: var(--muted); }
      .footer { display: grid; grid-template-columns: auto minmax(0, 1fr); align-items: center; gap: 15px; margin-top: 18px; padding-top: 10px; border-top: 1px dashed #aab5bb; }
      .qr-wrap { display: flex; align-items: center; gap: 8px; }
      .qr { width: 64px; height: 64px; image-rendering: auto; }
      .validation { min-width: 0; text-align: right; font-size: 9px; overflow-wrap: anywhere; }
      .footer-details { color: var(--muted); font-size: 9px; line-height: 1.45; overflow-wrap: anywhere; }
      .validation strong, .validation span { display: block; }
      .validation span { margin-top: 2px; font-size: 12px; font-weight: 800; letter-spacing: .1em; }
      .verification-url { display: block; overflow-wrap: anywhere; }
      .thermal-items { display: none; }
      .return-toolbar { max-width: 780px; margin: 12px auto; padding: 0 12px; display: flex; justify-content: flex-end; }
      .return-toolbar a { display: inline-flex; align-items: center; min-height: 44px; padding: 0 16px; border-radius: 8px; background: #1d4ed8; color: #fff; font-weight: 700; text-decoration: none; }
      @media screen and (max-width: 640px) {
        body { width: auto; max-width: 100%; margin: 12px; }
        .invoice-header { grid-template-columns: 1fr; gap: 10px; }
        .document-card { align-items: flex-start; text-align: left; }
        .meta-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); }
        .operation-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); }
      }
      ${compactThermalStyles}
    </style></head><body>
    ${returnToolbar}
    <main class="invoice-document">
      <header class="invoice-header">
        <div class="issuer">
          <div class="brand">${logo}<div>
            <p class="eyebrow">Emitente</p>
            <h1 class="issuer-name">${escapeHtml(document.restaurant.name)}</h1>
            <div class="branch-name">${escapeHtml(branchName)}</div>
          </div></div>
          ${issuerFiscalDetails}
        </div>
        <div class="document-card">
          <span class="document-type">FATURA/RECIBO</span>
          <strong class="document-number">Nº ${escapeHtml(invoiceNumberLabel(document.invoiceReference))}</strong>
          <span class="document-date">Emitida em ${escapeHtml(dateLabel(document.issuedAt))}</span>
          <span class="status">${invoicePaymentStatusLabel(document.totals.paymentStatus)}</span>
        </div>
      </header>

      <div class="meta-grid" aria-label="Resumo da mesa e sessão">
        <div class="meta-card"><label>Mesa</label><strong>${escapeHtml(document.table.number)}${document.table.area ? ` · ${escapeHtml(document.table.area)}` : ''}</strong></div>
        <div class="meta-card"><label>Sessão</label><strong>${escapeHtml(invoiceSessionLabel(document.session.id))}</strong><small>${escapeHtml(dateLabel(document.session.startedAt))}</small></div>
        <div class="meta-card"><label>Moeda</label><strong>AOA · Kwanza</strong></div>
      </div>

      ${invoiceIdentity}
      ${operationDetails}
      ${guests}

      <section class="items-section">
        <h2>Produtos e serviços</h2>
        <table class="invoice-items" aria-label="Produtos e serviços faturados">
          <thead><tr><th scope="col">Qtd.</th><th scope="col">Descrição</th><th scope="col">Preço unit.</th><th scope="col">Total</th></tr></thead>
          <tbody>${itemRows}</tbody>
        </table>
        <div class="thermal-items" aria-label="Produtos e serviços faturados">${thermalItemRows}</div>
      </section>
      ${orderNotes.length ? `<section class="notes-section"><h2>Observações dos pedidos</h2><div class="notes">${orderNotes.map((note) => `<p>${escapeHtml(note)}</p>`).join('')}</div></section>` : ''}
      ${cancelledItemRows ? `<section class="cancelled-section"><h2>Itens cancelados</h2><table class="invoice-items" aria-label="Itens cancelados"><thead><tr><th scope="col">Qtd.</th><th scope="col">Descrição</th><th scope="col">Preço unit.</th><th scope="col">Total</th></tr></thead><tbody>${cancelledItemRows}</tbody></table><div class="thermal-items" aria-label="Itens cancelados">${thermalCancelledItemRows}</div></section>` : ''}

      <section class="summary-section">
        <h2>Resumo financeiro</h2>
        <div class="summary">
          <div class="line"><span>Subtotal</span><strong>${moneyLabel(document.totals.subtotal)}</strong></div>
          ${adjustmentRows}
          <div class="line grand"><span>Total da sessão</span><strong>${moneyLabel(document.totals.total)}</strong></div>
          <div class="line"><span>Total pago</span><strong>${moneyLabel(document.totals.paid)}</strong></div>
          <div class="line"><span>${Number(document.totals.pending) > 0 ? 'Saldo pendente' : 'Saldo'}</span><strong class="pending">${moneyLabel(document.totals.pending)}</strong></div>
        </div>
      </section>

      <section class="payments-section">
        <h2>Pagamentos realizados</h2>
        <div class="payments">${paymentRows}</div>
        ${paymentDetailRows ? `<div class="payment-details"><p class="muted">Registos individuais</p><div class="payments">${paymentDetailRows}</div></div>` : ''}
      </section>

      <footer class="footer">
        ${qrCode}
        <div class="footer-details">${fiscalDetails.legalFooter ? `<strong>${escapeHtml(fiscalDetails.legalFooter)}</strong><br>` : ''}Documento final emitido em ${escapeHtml(dateLabel(document.issuedAt))}<br>Fatura/Recibo Nº ${escapeHtml(invoiceNumberLabel(document.invoiceReference))}<br>Total final: ${moneyLabel(document.totals.total)}<br>Código de validação: ${escapeHtml(document.validation.code)}<br>Confirmar: ${escapeHtml(document.validation.verificationUrl)}</div>
      </footer>
    </main>
    </body></html>`;
}

export function tableInvoiceToThermalPayload(document: TableInvoiceDocument) {
  const branchName = document.branch?.name || 'Unidade principal';
  const branchAddress = document.branch?.address || document.restaurant.address;
  const branchPhone = document.branch?.phone || document.restaurant.phone;
  const orderNotes = Array.from(new Set(document.items.map((item) => item.orderNotes).filter(Boolean))) as string[];
  const verificationUrl = typeof window !== 'undefined'
    ? new URL(document.validation.verificationUrl, window.location.origin).toString()
    : document.validation.verificationUrl;
  return {
     invoiceNumber: invoiceNumberLabel(document.invoiceReference),
     sessionReference: invoiceSessionLabel(document.session.id),
    validationCode: document.validation.code,
    verificationUrl,
    date: dateLabel(document.issuedAt),
     tableNumber: document.table.number,
     tableArea: document.table.area ?? undefined,
     guestCount: document.guests.length,
    customerName: document.customer?.name,
    customerPhone: document.customer?.phone ?? undefined,
    customerEmail: document.customer?.email ?? undefined,
    customerNif: document.customer?.nif ?? undefined,
    customerAddress: document.customer?.address ?? undefined,
    invoiceRecipientLabel: document.invoiceRecipient.label,
    branchName,
    branchAddress: branchAddress ?? undefined,
    branchPhone: branchPhone ?? undefined,
    restaurantName: document.restaurant.name,
     restaurantPhone: document.restaurant.phone ?? undefined,
     restaurantAddress: document.restaurant.address ?? undefined,
     restaurantFiscalAddress: document.restaurant.fiscalAddress ?? undefined,
    restaurantNif: document.restaurant.nif ?? undefined,
    vatRegime: document.restaurant.vatRegime ?? undefined,
     vatRate: document.restaurant.vatRate != null && String(document.restaurant.vatRate).trim() !== ''
       ? `${invoiceNumber(document.restaurant.vatRate)}%`
       : undefined,
     fiscalAddress: (document.restaurant.fiscalAddress || document.restaurant.address) ?? undefined,
     documentSeries: document.restaurant.documentSeries ?? undefined,
     invoicePrefix: document.restaurant.invoicePrefix ?? undefined,
    restaurantEmail: document.restaurant.email ?? undefined,
    website: document.restaurant.website ?? undefined,
    whatsappNumber: document.restaurant.whatsappNumber ?? undefined,
    legalFooter: document.restaurant.legalFooter ?? undefined,
    cashRegisterShift: document.cashRegisterShift?.label ?? undefined,
     cashRegisterName: document.cashRegisterShift?.cashRegisterName ?? undefined,
    attendedBy: document.paymentOperatorNames.join(', ') || document.session.openedByName || undefined,
    closedBy: document.session.closedByName || document.cashRegisterShift?.closedByName || undefined,
    sessionOpenedAt: dateLabel(document.session.startedAt),
    sessionClosedAt: dateLabel(document.session.endedAt),
    sessionDuration: document.session.durationLabel,
    tableCustomerName: document.tableCustomer?.name ?? undefined,
    splitInfo: document.isSplit ? `Conta dividida entre ${document.guests.length} convidados` : undefined,
    items: document.items.map((item) => ({
      name: item.name,
      quantity: item.quantity,
      price: moneyLabel(item.unitPrice),
      total: moneyLabel(item.total),
       options: item.options.map((option) => `${option.name}${option.quantity > 1 ? ` (${option.quantity}x)` : ''}`).join(', '),
       notes: item.notes || item.orderNotes || undefined,
       orderNumber: item.orderNumber ? String(item.orderNumber) : undefined,
       orderTime: item.orderCreatedAt ? dateLabel(item.orderCreatedAt) : undefined,
        orderStatus: invoiceOrderStatusLabel(item.orderStatus),
       guestName: item.guestName || undefined,
       sharedWith: item.sharedWithGuestNames.join(', ') || undefined,
    })),
     cancelledItems: document.cancelledItems.map((item) => ({
       name: item.name,
       quantity: item.quantity,
       price: moneyLabel(item.unitPrice),
       total: moneyLabel(item.total),
       notes: item.notes || item.orderNotes || undefined,
     })),
     orderNotes,
    subtotal: moneyLabel(document.totals.subtotal),
      adjustments: [
        ...document.discounts.map((adjustment) => invoiceAdjustmentLabel({ ...adjustment, sign: '-' })),
        ...document.fees.map((adjustment) => invoiceAdjustmentLabel({ ...adjustment, sign: '+' })),
      ],
     discount: undefined,
     serviceCharge: undefined,
    total: moneyLabel(document.totals.total),
     status: invoicePaymentStatusLabel(document.totals.paymentStatus),
    paymentInfo: [
      ...document.paymentsByMethod.map((payment) => `${payment.paymentMethodLabel}: ${moneyLabel(payment.amount)}`),
       `${invoiceSessionLabel(document.session.id)}: ${moneyLabel(document.totals.total)}`,
      `Total pago: ${moneyLabel(document.totals.paid)}`,
      `${Number(document.totals.pending) > 0 ? 'Saldo pendente' : 'Saldo'}: ${moneyLabel(document.totals.pending)}`,
    ].join('\n'),
     paymentDetails: document.payments.map((payment) => [
       payment.paymentMethodLabel,
       moneyLabel(payment.amount),
       dateLabel(payment.createdAt),
       payment.operatorName || '',
       payment.notes || '',
     ].filter(Boolean).join(' · ')),
  };
}