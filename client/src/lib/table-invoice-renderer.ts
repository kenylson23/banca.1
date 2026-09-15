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

export function renderTableInvoiceHtml(document: TableInvoiceDocument): string {
  const itemRows = document.items.length
    ? document.items.map((item) => `
      <tr>
        <td>${escapeHtml(item.quantity)}</td>
        <td>${escapeHtml(item.name)}${item.options.length ? `<small>${escapeHtml(item.options.map((option) => option.name).join(', '))}</small>` : ''}</td>
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
      <tr><td>${escapeHtml(payment.paymentMethodLabel)}</td><td>${escapeHtml(dateLabel(payment.createdAt))}</td><td>${moneyLabel(payment.amount)}</td></tr>`).join('')
    : '<tr><td colspan="3">Nenhum pagamento registado</td></tr>';
  const guests = document.guests.length
    ? `<h2>Convidados</h2><div class="guests">${document.guests.map((guest) => `<span>${escapeHtml(guest.name)}${guest.seatNumber ? ` · Lugar ${guest.seatNumber}` : ''}</span>`).join('')}</div>`
    : '';

  return `<!doctype html>
    <html lang="pt"><head><meta charset="utf-8">
    <title>Fatura ${escapeHtml(document.invoiceNumber)}</title>
    <style>
      @media print { @page { size: A4; margin: 15mm; } body { margin: 0; } }
      body { font-family: Arial, sans-serif; max-width: 760px; margin: 32px auto; color: #111; font-size: 13px; }
      header { display:flex; justify-content:space-between; gap:24px; border-bottom:3px solid #111; padding-bottom:14px; }
      h1 { margin:0 0 5px; font-size:24px; } h2 { font-size:14px; border-bottom:1px solid #ddd; padding-bottom:6px; margin-top:24px; }
      .muted { color:#666; } .meta { text-align:right; } .grid { display:grid; grid-template-columns:1fr 1fr; gap:8px; margin:16px 0; }
      .customer { background:#f6f6f6; padding:12px; border-radius:5px; } table { width:100%; border-collapse:collapse; }
      th,td { text-align:left; padding:7px 4px; border-bottom:1px solid #eee; } th:first-child,td:first-child { text-align:center; width:8%; }
      th:nth-child(n+3),td:nth-child(n+3) { text-align:right; } small { display:block; color:#666; margin-top:3px; }
      .guests { display:flex; flex-wrap:wrap; gap:6px; } .guests span { background:#f1f1f1; padding:5px 8px; border-radius:4px; }
      .totals { margin:16px 0 0 auto; max-width:330px; border-top:2px solid #111; padding-top:8px; }
      .line { display:flex; justify-content:space-between; gap:20px; margin:5px 0; } .grand { font-size:18px; font-weight:700; margin-top:9px; padding-top:8px; border-top:1px solid #111; }
      .code { text-align:center; margin-top:28px; padding-top:12px; border-top:1px dashed #999; font-size:11px; }
    </style></head><body>
      <header><div><h1>${escapeHtml(document.restaurant.name)}</h1>
        ${document.branch ? `<div>${escapeHtml(document.branch.name)}</div>` : ''}
        <div class="muted">${escapeHtml(document.restaurant.address || '')}${document.restaurant.phone ? ` · ${escapeHtml(document.restaurant.phone)}` : ''}</div>
      </div><div class="meta"><strong>FATURA DA MESA</strong><br>Nº ${escapeHtml(String(document.invoiceNumber).padStart(6, '0'))}<br>${escapeHtml(dateLabel(document.issuedAt))}</div></header>
      <div class="grid"><div><strong>Mesa:</strong> ${escapeHtml(document.table.number)}${document.table.area ? ` · ${escapeHtml(document.table.area)}` : ''}</div>
        <div><strong>Sessão:</strong> ${escapeHtml(dateLabel(document.session.startedAt))}</div></div>
      ${document.customer ? `<div class="customer"><strong>Cliente</strong><br>${escapeHtml(document.customer.name)}${document.customer.phone ? `<br>${escapeHtml(document.customer.phone)}` : ''}${document.customer.nif ? `<br>NIF: ${escapeHtml(document.customer.nif)}` : ''}</div>` : ''}
      ${guests}
      <h2>Itens</h2><table><thead><tr><th>Qtd.</th><th>Descrição</th><th>Preço unit.</th><th>Total</th></tr></thead><tbody>${itemRows}</tbody></table>
      <div class="totals"><div class="line"><span>Subtotal</span><span>${moneyLabel(document.totals.subtotal)}</span></div>${adjustmentRows}
        <div class="line grand"><span>Total</span><span>${moneyLabel(document.totals.total)}</span></div>
        <div class="line"><span>Pago</span><span>${moneyLabel(document.totals.paid)}</span></div>
        <div class="line"><span>Saldo pendente</span><span>${moneyLabel(document.totals.pending)}</span></div>
      </div>
      <h2>Pagamentos</h2><table><thead><tr><th>Forma</th><th>Data</th><th>Valor</th></tr></thead><tbody>${paymentRows}</tbody></table>
      <div class="code">Código de validação: <strong>${escapeHtml(document.validation.code)}</strong><br>Documento emitido a partir de TableInvoiceDocument</div>
    </body></html>`;
}

export function tableInvoiceToThermalPayload(document: TableInvoiceDocument) {
  return {
    invoiceNumber: String(document.invoiceNumber).padStart(6, '0'),
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
    paymentInfo: document.payments.map((payment) => `${payment.paymentMethodLabel}: ${moneyLabel(payment.amount)}`).join(' | ') || undefined,
  };
}