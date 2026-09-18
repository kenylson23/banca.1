import type { TableInvoiceDocument } from '@shared/table-invoice-document';
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
  const cancelledItemRows = document.cancelledItems.length
    ? document.cancelledItems.map((item) => renderItemRow(item, true)).join('')
    : '';
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
  const guests = document.guests.length && !isThermal
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
  const invoiceIdentity = `<section><h2>Identificação da fatura</h2><div class="customer"><div class="wide"><label>Fatura em nome de</label><strong>${escapeHtml(document.invoiceRecipient.label)}</strong></div>${customerDetails}${primaryCustomer}${document.isSplit ? `<div class="wide split-note"><strong>Conta dividida</strong><small>Esta mesa tem ${document.guests.length} convidados registados.</small></div>` : ''}</div></section>`;
  const branchName = document.branch?.name || 'Unidade principal';
  const branchAddress = document.branch?.address || document.restaurant.address;
  const branchPhone = document.branch?.phone || document.restaurant.phone;
  const fiscalAddress = document.restaurant.fiscalAddress || document.restaurant.address;
  const fiscalDetails = [
    fiscalAddress ? `Morada fiscal: ${fiscalAddress}` : '',
    document.restaurant.nif ? `NIF: ${document.restaurant.nif}` : '',
    document.restaurant.vatRegime ? `Regime: ${document.restaurant.vatRegime}` : '',
    document.restaurant.vatRate ? `IVA: ${moneyLabel(document.restaurant.vatRate)}%` : '',
    document.restaurant.documentSeries ? `Série: ${document.restaurant.documentSeries}` : '',
    document.restaurant.invoicePrefix ? `Prefixo: ${document.restaurant.invoicePrefix}` : '',
    document.restaurant.email ? `Email: ${document.restaurant.email}` : '',
    document.restaurant.website ? `Web: ${document.restaurant.website}` : '',
    document.restaurant.whatsappNumber ? `WhatsApp: ${document.restaurant.whatsappNumber}` : '',
  ].filter(Boolean).join(' · ');
  const operationDetails = `<section><h2>Dados da operação</h2><div class="operation-grid">
    <div><label>Filial</label><strong>${escapeHtml(branchName)}</strong></div>
    <div><label>Endereço da filial</label><strong>${escapeHtml(branchAddress || '-')}</strong></div>
    <div><label>Telefone da filial</label><strong>${escapeHtml(branchPhone || '-')}</strong></div>
    <div><label>Caixa / turno</label><strong>${escapeHtml(document.cashRegisterShift?.label || 'Não identificado')}</strong></div>
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
       .customer { background:#f5f8f9; display:grid; grid-template-columns:1fr 1fr; gap:8px 18px; } .customer .wide { grid-column:1 / -1; } .operation-grid { display:grid; grid-template-columns:repeat(3, 1fr); gap:8px; } .operation-grid > div { border:1px solid #dfe5e8; border-radius:7px; padding:8px 10px; } .operation-grid label { display:block; color:#64727d; font-size:10px; text-transform:uppercase; letter-spacing:.07em; margin-bottom:3px; } .operation-grid strong { display:block; overflow-wrap:anywhere; } section { break-inside:avoid; }
      table { width:100%; border-collapse:collapse; } th { background:#17202a; color:#fff; font-size:10px; text-transform:uppercase; letter-spacing:.06em; } th,td { text-align:left; padding:8px 7px; border-bottom:1px solid #e5eaed; vertical-align:top; } th:first-child,td:first-child { text-align:center; width:9%; } th:nth-child(n+3),td:nth-child(n+3) { text-align:right; white-space:nowrap; }
       .guests { display:flex; flex-wrap:wrap; gap:6px; } .guests span { background:#edf2f4; padding:5px 8px; border-radius:4px; }
       .shared { color:#155e75; } .cancelled { color:#b91c1c; font-weight:700; } .cancelled-section { opacity:.82; } .notes { border:1px solid #dfe5e8; border-radius:7px; padding:9px 10px; background:#fffdf5; } .notes p { margin:4px 0; }
        .summary { margin:16px 0 0 auto; max-width:420px; border:1px solid #dfe5e8; border-radius:8px; padding:11px 13px; } .line { display:flex; justify-content:space-between; gap:20px; margin:5px 0; } .line.adjustment { align-items:flex-start; } .line.adjustment small { max-width:280px; } .grand { font-size:18px; font-weight:700; margin:9px -13px 7px; padding:10px 13px; border-top:1px solid #dfe5e8; border-bottom:1px solid #dfe5e8; background:#f5f8f9; } .pending { color:#b45309; font-weight:700; }
       .payments { border:1px solid #dfe5e8; border-radius:8px; overflow:hidden; } .payment { display:flex; justify-content:space-between; gap:12px; padding:9px 11px; border-bottom:1px solid #e5eaed; } .payment:last-child { border-bottom:0; } .payment strong:last-child { white-space:nowrap; } .payment.detail { background:#fafcfc; font-size:.92em; } .empty { padding:10px; color:#64727d; }
       .footer { display:flex; justify-content:space-between; align-items:center; gap:18px; margin-top:24px; padding-top:13px; border-top:1px dashed #aab5bb; } .qr-wrap { display:flex; align-items:center; gap:10px; } .qr { width:74px; height:74px; image-rendering:auto; } .validation { text-align:right; font-size:10px; } .validation strong, .validation span { display:block; } .validation span { font-size:13px; font-weight:700; letter-spacing:.1em; margin-top:3px; } .verification-url { overflow-wrap:anywhere; max-width:300px; }
      .thermal-only { display:${isThermal ? 'block' : 'none'}; } .a4-only { display:${isThermal ? 'none' : 'block'}; }
       ${isThermal ? 'header { display:block; text-align:center; } .brand { justify-content:center; } .meta { text-align:center; margin-top:9px; } .logo, .logo-fallback { width:42px; height:42px; } .grid { grid-template-columns:1fr 1fr; } .grid .info:last-child { grid-column:1 / -1; } .customer { grid-template-columns:1fr; } .customer .wide { grid-column:auto; } .operation-grid { grid-template-columns:1fr 1fr; } .operation-grid > div { padding:6px; } h2 { margin-top:15px; } th,td { padding:6px 3px; font-size:9px; } th:nth-child(3),td:nth-child(3) { display:none; } .summary { max-width:none; } .grand { font-size:15px; } .footer { display:block; text-align:center; } .qr-wrap { justify-content:center; margin-bottom:8px; } .validation { text-align:center; }' : ''}
    </style></head><body>
       <header><div class="brand">${logo}<div><h1>${escapeHtml(document.restaurant.name)}</h1>
         <div>${escapeHtml(branchName)}</div>
          <div class="muted">${escapeHtml(fiscalAddress || branchAddress || '')}${branchPhone ? ` · ${escapeHtml(branchPhone)}` : ''}</div>
          ${document.restaurant.nif ? `<div class="muted">NIF: ${escapeHtml(document.restaurant.nif)}</div>` : ''}
          ${document.restaurant.documentSeries ? `<div class="muted">Série: ${escapeHtml(document.restaurant.documentSeries)}</div>` : ''}
       </div></div><div class="meta"><strong>FATURA/RECIBO</strong><span class="number">Nº ${escapeHtml(invoiceNumberLabel(document.invoiceReference))}</span><span>${escapeHtml(dateLabel(document.issuedAt))}</span><span class="status">${invoicePaymentStatusLabel(document.totals.paymentStatus)}</span></div></header>
       <div class="grid"><div class="info"><label>Mesa</label><strong>${escapeHtml(document.table.number)}${document.table.area ? ` · ${escapeHtml(document.table.area)}` : ''}</strong></div>
         <div class="info"><label>Sessão</label><strong>${escapeHtml(invoiceSessionLabel(document.session.id))}</strong><small>${escapeHtml(dateLabel(document.session.startedAt))}</small></div><div class="info"><label>Moeda</label><strong>AOA · Kwanza</strong></div></div>
       ${operationDetails}
      ${invoiceIdentity}
      ${guests}
       <section><h2>Itens válidos</h2><table><thead><tr><th>Qtd.</th><th>Descrição</th><th>Preço unit.</th><th>Total</th></tr></thead><tbody>${itemRows}</tbody></table></section>
       ${orderNotes.length ? `<section><h2>Observações dos pedidos</h2><div class="notes">${orderNotes.map((note) => `<p>${escapeHtml(note)}</p>`).join('')}</div></section>` : ''}
       ${cancelledItemRows ? `<section class="cancelled-section"><h2>Itens cancelados</h2><table><thead><tr><th>Qtd.</th><th>Descrição</th><th>Preço unit.</th><th>Total</th></tr></thead><tbody>${cancelledItemRows}</tbody></table></section>` : ''}
      <section class="summary"><div class="line"><span>Subtotal</span><span>${moneyLabel(document.totals.subtotal)}</span></div>${adjustmentRows}
         <div class="line grand"><span>Total da sessão</span><span>${moneyLabel(document.totals.total)}</span></div>
         <div class="line"><span>Total pago</span><span>${moneyLabel(document.totals.paid)}</span></div>
         <div class="line"><span>${Number(document.totals.pending) > 0 ? 'Saldo pendente' : 'Saldo'}</span><span class="pending">${moneyLabel(document.totals.pending)}</span></div>
      </section>
       <section><h2>Pagamentos realizados</h2><div class="payments">${paymentRows || '<div class="muted">Nenhum pagamento registado</div>'}</div>${paymentDetailRows ? `<small class="muted" style="margin-top:8px">Registos individuais</small><div class="payments">${paymentDetailRows}</div>` : ''}</section>
        <footer class="footer">${qrCode}<div class="muted">${document.restaurant.legalFooter ? `<strong>${escapeHtml(document.restaurant.legalFooter)}</strong><br>` : ''}${escapeHtml(fiscalDetails)}${fiscalDetails ? '<br>' : ''}Documento final emitido em ${escapeHtml(dateLabel(document.issuedAt))}<br>Fatura/Recibo Nº ${escapeHtml(invoiceNumberLabel(document.invoiceReference))}<br>Total final: ${moneyLabel(document.totals.total)}<br>Código de validação: ${escapeHtml(document.validation.code)}<br>Confirmar: ${escapeHtml(document.validation.verificationUrl)}</div></footer>
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
    restaurantNif: document.restaurant.nif ?? undefined,
    vatRegime: document.restaurant.vatRegime ?? undefined,
     vatRate: document.restaurant.vatRate ? `${invoiceNumber(document.restaurant.vatRate)}%` : undefined,
     fiscalAddress: (document.restaurant.fiscalAddress || document.restaurant.address) ?? undefined,
     documentSeries: document.restaurant.documentSeries ?? undefined,
     invoicePrefix: document.restaurant.invoicePrefix ?? undefined,
    restaurantEmail: document.restaurant.email ?? undefined,
    website: document.restaurant.website ?? undefined,
    whatsappNumber: document.restaurant.whatsappNumber ?? undefined,
    legalFooter: document.restaurant.legalFooter ?? undefined,
    cashRegisterShift: document.cashRegisterShift?.label ?? undefined,
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
  };
}