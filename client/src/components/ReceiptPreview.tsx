import {
  invoiceDate,
  invoiceMoney,
  invoicePaymentStatusLabel,
  formatPaymentMethodLabel,
} from "@shared/invoice-formatters";

export type ReceiptItem = {
  name: string;
  quantity: number;
  unitPrice?: number | string;
  total?: number | string;
  options?: Array<{ optionName: string; quantity?: number; priceAdjustment?: number | string }>;
  notes?: string;
};

export type ReceiptDocument =
  | {
      kind: "order";
      orderNumber?: string;
      createdAt: string | Date;
      orderType?: string;
      status?: string;
      customerName?: string;
      customerPhone?: string;
      tableNumber?: string | number;
      deliveryAddress?: string;
      items: ReceiptItem[];
      notes?: string;
      totalAmount: number | string;
      restaurantName?: string;
    }
  | {
      kind: "bill";
      guestName: string;
      guestNumber: number;
      tableName?: string;
      entryTime?: string;
      createdAt?: string | Date;
      items: ReceiptItem[];
      subtotal?: number | string;
      discount?: number | string;
      serviceCharge?: number | string;
      total: number | string;
      paymentMethod?: string;
      isPaid?: boolean;
      documentId?: string;
      restaurantName?: string;
      restaurantAddress?: string;
      restaurantPhone?: string;
      restaurantNIF?: string;
       restaurantFiscalAddress?: string;
       restaurantVatRegime?: string;
       restaurantVatRate?: string | number;
       restaurantDocumentSeries?: string;
       restaurantInvoicePrefix?: string;
       restaurantEmail?: string;
       restaurantWebsite?: string;
       restaurantWhatsappNumber?: string;
       legalFooter?: string;
    }
  | {
      kind: "invoice";
      invoiceNumber: string;
      date: string | Date;
      customerName?: string;
      customerPhone?: string;
      items: Array<{ name: string; quantity: number; price: string; total: string }>;
      subtotal: string;
      discount?: string;
      serviceCharge?: string;
      total: string;
      paymentInfo?: string;
      notes?: string;
      restaurantName?: string;
    };

export function buildReceiptHtml(doc: ReceiptDocument, paperWidth: 58 | 80 = 80) {
  const columns = paperWidth === 80 ? 48 : 32;
  const sep = "=".repeat(columns);
  const thinSep = "-".repeat(columns);

  const header = `
    <div class="receipt">
      <div class="center">
        <div class="bold title">${doc.restaurantName || "NaBancada"}</div>
        <div class="bold document-title">${
          doc.kind === "bill"
            ? "CONTA DA MESA"
            : doc.kind === "invoice"
              ? "FATURA/RECIBO"
              : "PEDIDO"
        }</div>
        <div class="separator">${thinSep}</div>
      </div>
  `;

  const fiscalHeader = doc.kind === "bill"
    ? [
        doc.restaurantFiscalAddress || doc.restaurantAddress ? `Morada fiscal: ${doc.restaurantFiscalAddress || doc.restaurantAddress}` : "",
        doc.restaurantNIF ? `NIF: ${doc.restaurantNIF}` : "",
        doc.restaurantVatRegime ? `Regime de IVA: ${doc.restaurantVatRegime}` : "",
        doc.restaurantVatRate != null ? `Taxa de IVA: ${doc.restaurantVatRate}%` : "",
        doc.restaurantDocumentSeries ? `Série: ${doc.restaurantDocumentSeries}` : "",
        doc.restaurantInvoicePrefix ? `Prefixo: ${doc.restaurantInvoicePrefix}` : "",
        doc.restaurantEmail ? `Email: ${doc.restaurantEmail}` : "",
        doc.restaurantWebsite ? `Web: ${doc.restaurantWebsite}` : "",
        doc.restaurantWhatsappNumber ? `WhatsApp: ${doc.restaurantWhatsappNumber}` : "",
        doc.restaurantPhone ? `Tel: ${doc.restaurantPhone}` : "",
      ].filter(Boolean).map((line) => `<div class="center">${line}</div>`).join("")
    : "";

  const meta = (() => {
    if (doc.kind === "order") {
      const lines: string[] = [];
      lines.push(`<div class="row"><span>Pedido:</span><span>#${doc.orderNumber || "---"}</span></div>`);
       lines.push(`<div class="row"><span>Data:</span><span>${invoiceDate(doc.createdAt)}</span></div>`);
      if (doc.orderType) lines.push(`<div class="row"><span>Tipo:</span><span>${doc.orderType.toUpperCase()}</span></div>`);
      if (doc.tableNumber != null) lines.push(`<div class="row"><span>Mesa:</span><span>#${doc.tableNumber}</span></div>`);
      if (doc.customerName) lines.push(`<div class="row"><span>Cliente:</span><span>${doc.customerName}</span></div>`);
      if (doc.customerPhone) lines.push(`<div class="row"><span>Tel:</span><span>${doc.customerPhone}</span></div>`);
      if (doc.deliveryAddress) lines.push(`<div class="row"><span>Endereço:</span><span>${doc.deliveryAddress}</span></div>`);
      if (doc.status) lines.push(`<div class="row"><span>Status:</span><span>${doc.status}</span></div>`);
      return lines.join("");
    }

    if (doc.kind === "bill") {
      const lines: string[] = [];
      lines.push(`<div class="row"><span>Mesa:</span><span>${doc.tableName || "---"}</span></div>`);
      lines.push(`<div class="row"><span>Cliente:</span><span>${doc.guestName}</span></div>`);
      lines.push(`<div class="row"><span>#:</span><span>#${doc.guestNumber}</span></div>`);
      if (doc.entryTime) lines.push(`<div class="row"><span>Entrada:</span><span>${doc.entryTime}</span></div>`);
       if (doc.createdAt) lines.push(`<div class="row"><span>Data:</span><span>${invoiceDate(doc.createdAt)}</span></div>`);
       lines.push(`<div class="row bold"><span>Estado:</span><span>${invoicePaymentStatusLabel("pendente")}</span></div>`);
      return lines.join("");
    }

    const lines: string[] = [];
    lines.push(`<div class="row"><span>Nº:</span><span>${doc.invoiceNumber}</span></div>`);
     lines.push(`<div class="row"><span>Data:</span><span>${invoiceDate(doc.date)}</span></div>`);
    if (doc.customerName) lines.push(`<div class="row"><span>Cliente:</span><span>${doc.customerName}</span></div>`);
    if (doc.customerPhone) lines.push(`<div class="row"><span>Tel:</span><span>${doc.customerPhone}</span></div>`);
    return lines.join("");
  })();

  const itemsSection = (() => {
    const rows: string[] = [];
    rows.push(`<div class="separator">${thinSep}</div>`);
    rows.push(`<div class="row bold">ITENS</div>`);

    const items = doc.items;
    for (const item of items) {
      const qty = item.quantity;
       const unit = "unitPrice" in item && item.unitPrice != null ? invoiceMoney(item.unitPrice) : undefined;
       const total = "total" in item && item.total != null ? invoiceMoney(item.total) : undefined;

      if (unit && total) {
        rows.push(`<div class="row"><span>${qty}x ${item.name}</span><span>${total}</span></div>`);
        rows.push(`<div class="row muted"><span>${unit} x ${qty}</span><span></span></div>`);
      } else {
        rows.push(`<div class="row"><span>${qty}x ${item.name}</span><span></span></div>`);
      }

      if ("options" in item && item.options?.length) {
        for (const opt of item.options) {
          const optQty = opt.quantity && opt.quantity > 1 ? `(${opt.quantity}x)` : "";
          rows.push(`<div class="row muted indent">+ ${opt.optionName} ${optQty}</div>`);
        }
      }

      if ("notes" in item && item.notes) {
        rows.push(`<div class="row muted italic">Obs: ${item.notes}</div>`);
      }
    }

    return rows.join("");
  })();

  const totalsSection = (() => {
    if (doc.kind === "order") {
      const rows: string[] = [];
      rows.push(`<div class="separator">${sep}</div>`);
       rows.push(`<div class="row"><span>TOTAL:</span><span class="bold">${invoiceMoney(doc.totalAmount)}</span></div>`);
      return rows.join("");
    }

    if (doc.kind === "bill") {
      const rows: string[] = [];
      rows.push(`<div class="separator">${thinSep}</div>`);
      rows.push(`<div class="row bold">RESUMO</div>`);
       if (doc.subtotal != null) rows.push(`<div class="row"><span>Subtotal:</span><span>${invoiceMoney(doc.subtotal)}</span></div>`);
       if (doc.discount != null && Number(doc.discount) > 0) rows.push(`<div class="row"><span>Desconto:</span><span>${invoiceMoney(doc.discount)}</span></div>`);
       if (doc.serviceCharge != null && Number(doc.serviceCharge) > 0) rows.push(`<div class="row"><span>Taxa Serviço:</span><span>${invoiceMoney(doc.serviceCharge)}</span></div>`);
      rows.push(`<div class="separator">${thinSep}</div>`);
       rows.push(`<div class="row bold"><span>TOTAL PROVISÓRIO:</span><span>${invoiceMoney(doc.total)}</span></div>`);
      return rows.join("");
    }

    const rows: string[] = [];
    rows.push(`<div class="separator">${thinSep}</div>`);
    if (doc.subtotal) rows.push(`<div class="row"><span>Subtotal:</span><span>${doc.subtotal}</span></div>`);
    if (doc.discount) rows.push(`<div class="row"><span>Desconto:</span><span>${doc.discount}</span></div>`);
    if (doc.serviceCharge) rows.push(`<div class="row"><span>Taxa Serviço:</span><span>${doc.serviceCharge}</span></div>`);
    rows.push(`<div class="separator">${thinSep}</div>`);
    rows.push(`<div class="row bold"><span>TOTAL:</span><span>${doc.total}</span></div>`);
    if (doc.paymentInfo) rows.push(`<div class="row"><span>Pagamento:</span><span>${doc.paymentInfo}</span></div>`);
    return rows.join("");
  })();

  const footer = (() => {
    const lines: string[] = [];
    lines.push(`<div class="separator">${thinSep}</div>`);
    if (doc.kind === "bill" && doc.legalFooter) {
      lines.push(`<div class="center">${doc.legalFooter}</div>`);
    }
    lines.push(`<div class="center">Obrigado pela preferência!</div>`);
    if (doc.kind === "bill") {
      lines.push(`<div class="center">*** CONTA PROVISÓRIA · PENDENTE ***</div>`);
    }
    lines.push(`<div class="center muted">${invoiceDate(new Date())}</div>`);
    lines.push(`</div>`);
    return lines.join("");
  })();

  const styles = `
    <style>
      * { box-sizing: border-box; }
      body {
        margin: 0;
        padding: 0;
        font-family: 'Courier New', monospace;
        font-size: 12px;
        line-height: 1.4;
        color: #000;
      }
      .receipt {
        width: ${paperWidth}mm;
        max-width: ${paperWidth}mm;
        margin: 0 auto;
        padding: 2mm;
      }
      .row {
        display: flex;
        justify-content: space-between;
        gap: 4px;
        margin: 1px 0;
      }
      .row .muted {
        color: #555;
      }
      .row .indent {
        padding-left: 8px;
      }
      .row .italic {
        font-style: italic;
      }
      .center {
        text-align: center;
      }
      .bold {
        font-weight: bold;
      }
      .title {
        font-size: 14px;
      }
      .document-title {
        font-size: 16px;
        margin-top: 4px;
      }
      .separator {
        margin: 4px 0;
      }
      @media print {
        @page {
          size: ${paperWidth}mm auto;
          margin: 3mm;
        }
        body {
          margin: 0;
          padding: 0;
        }
      }
    </style>
  `;

  return `<!DOCTYPE html><html><head><meta charset="utf-8">${styles}</head><body>${header}${fiscalHeader}${meta}${itemsSection}${totalsSection}${footer}</body></html>`;
}
