/**
 * PrintTablePayment - Impressão de Recibo de Pagamento de Mesa
 * Permite reimprimir recibos de pagamentos anteriores
 */

import { useEffect, useState } from 'react';
import { invoiceDate, invoiceMoney, invoiceNumberLabel, invoiceSessionLabel, formatPaymentMethodLabel } from '@shared/invoice-formatters';
import { printerService } from '@/lib/printer-service';
import { usePrinter } from '@/hooks/usePrinter';
import { useToast } from '@/hooks/use-toast';

type TablePaymentRestaurantInfo = {
  name: string;
  address?: string | null;
  phone?: string | null;
  nif?: string | null;
  vatRegime?: string | null;
  vatRate?: string | null;
  documentSeries?: string | null;
  invoicePrefix?: string | null;
  fiscalAddress?: string | null;
  email?: string | null;
  website?: string | null;
  whatsappNumber?: string | null;
  legalFooter?: string | null;
};

interface PrintTablePaymentProps {
  payment: {
    id: string;
    amount: string;
    paymentMethod: string;
    createdAt: string;
    notes?: string;
    sessionId?: string;
    invoiceReference?: string;
    receivedAmount?: string | number;
    changeAmount?: string | number;
    operatorName?: string;
    transactionReference?: string;
    guestName?: string;
    items?: Array<{ name: string; quantity: number; price: string }>;
  };
  tableName: string;
  restaurantName?: string;
  restaurant?: TablePaymentRestaurantInfo;
  onPrintComplete?: () => void;
  autoPrint?: boolean;
}

export function PrintTablePayment({
  payment,
  tableName,
  restaurantName = 'NaBancada',
  restaurant,
  onPrintComplete,
  autoPrint = true,
}: PrintTablePaymentProps) {
  const { getPrinterByType } = usePrinter();
  const { toast } = useToast();
  const [hasPrinted, setHasPrinted] = useState(false);

  const thermalPrinter = getPrinterByType('receipt');

  useEffect(() => {
    if (autoPrint && !hasPrinted && payment) {
      handlePrint();
    }
  }, [autoPrint, hasPrinted, payment]);

  const handlePrint = async () => {
    if (hasPrinted) return;

    try {
      setHasPrinted(true);

      if (thermalPrinter) {
        // Impressão térmica
        await printThermal();
      } else {
        // Impressão via janela do navegador
        await printBrowser();
      }

      toast({
        title: '✅ Recibo Impresso',
        description: 'Recibo de pagamento enviado para impressão.',
      });

      onPrintComplete?.();
    } catch (error) {
      console.error('Erro ao imprimir:', error);
      setHasPrinted(false);
      toast({
        title: '❌ Erro na Impressão',
        description: error instanceof Error ? error.message : 'Não foi possível imprimir o recibo.',
        variant: 'destructive',
      });
    }
  };

  const printThermal = async () => {
    if (!thermalPrinter) return;

    const receiptContent = generateReceiptContent();
    await printerService.printReceipt('receipt', receiptContent);
  };

  const printBrowser = async () => {
    return new Promise<void>((resolve) => {
      const printWindow = window.open('', '_blank');
      if (!printWindow) {
        throw new Error('Não foi possível abrir janela de impressão');
      }

      printWindow.document.write(generateHTMLContent());
      printWindow.document.close();
      
      printWindow.onload = () => {
        printWindow.focus();
        printWindow.print();
        setTimeout(() => {
          printWindow.close();
          resolve();
        }, 500);
      };
    });
  };

  const generateReceiptContent = () => {
    const fiscalName = restaurant?.name || restaurantName;
    const fiscalAddress = restaurant?.fiscalAddress || restaurant?.address;
    const fiscalLines = [
      fiscalAddress,
      restaurant?.phone ? `Telefone: ${restaurant.phone}` : '',
      restaurant?.nif ? `NIF: ${restaurant.nif}` : '',
      restaurant?.vatRegime ? `Regime de IVA: ${restaurant.vatRegime}` : '',
      restaurant?.vatRate ? `IVA: ${restaurant.vatRate}%` : '',
      restaurant?.documentSeries ? `Série: ${restaurant.documentSeries}` : '',
      restaurant?.invoicePrefix ? `Prefixo: ${restaurant.invoicePrefix}` : '',
      restaurant?.email ? `Email: ${restaurant.email}` : '',
      restaurant?.website ? `Web: ${restaurant.website}` : '',
      restaurant?.whatsappNumber ? `WhatsApp: ${restaurant.whatsappNumber}` : '',
    ].filter(Boolean) as string[];
    const lines = [
      { text: fiscalName, alignment: 'center', bold: true, fontSize: 1.5 },
      ...fiscalLines.map((text) => ({ text, alignment: 'center' as const })),
      { text: '================================', alignment: 'center' },
      { text: 'RECIBO DE PAGAMENTO', alignment: 'center', bold: true },
      { text: '================================', alignment: 'center' },
      { text: '' },
      { text: `Mesa: ${tableName}`, bold: true },
      { text: `Data: ${invoiceDate(payment.createdAt)}` },
      { text: `Fatura associada: ${invoiceNumberLabel(payment.invoiceReference)}` },
      { text: `Sessão: ${invoiceSessionLabel(payment.sessionId)}` },
      { text: `Nº do pagamento: ${payment.id}` },
      { text: '' },
      { text: '--------------------------------', alignment: 'center' },
      { text: 'DETALHES DO CONSUMO', alignment: 'center', bold: true },
      { text: '--------------------------------', alignment: 'center' },
      { text: '' },
      ...(payment.items && payment.items.length > 0 
        ? payment.items.map(item => ({
            text: `${item.quantity}x ${item.name.padEnd(20)} ${invoiceMoney(parseFloat(item.price) * item.quantity)}`,
            fontSize: 0.9
          }))
        : [{ text: 'Consumo registrado na mesa', alignment: 'center', italic: true }]
      ),
      { text: '' },
      { text: '--------------------------------', alignment: 'center' },
      { text: 'RESUMO DO PAGAMENTO', alignment: 'center', bold: true },
      { text: '--------------------------------', alignment: 'center' },
      { text: '' },
      { 
         text: `Valor Recebido: ${invoiceMoney(payment.amount)}`,
        bold: true, 
        fontSize: 1.3,
        alignment: 'center'
      },
      { text: '' },
       { text: `Método: ${formatPaymentMethodLabel(payment.paymentMethod)}` },
      ...(payment.receivedAmount != null
         ? [{ text: `Valor entregue: ${invoiceMoney(payment.receivedAmount)}` }]
        : []),
      ...(payment.changeAmount != null
         ? [{ text: `Troco: ${invoiceMoney(payment.changeAmount)}` }]
        : []),
      { text: `Cliente: ${payment.guestName || 'Mesa Completa'}` },
      { text: `Operador: ${payment.operatorName || 'Sistema'}` },
      ...(payment.transactionReference
        ? [{ text: `Referência: ${payment.transactionReference}` }]
        : []),
      { text: '' },
    ];

    if (payment.notes) {
      lines.push(
        { text: '--------------------------------', alignment: 'center' },
        { text: 'Observações:', bold: true },
        { text: payment.notes },
        { text: '' }
      );
    }

    lines.push(
      { text: '================================', alignment: 'center' },
      { text: 'PAGAMENTO CONFIRMADO', alignment: 'center', bold: true },
      { text: '================================', alignment: 'center' },
      { text: '' },
      { text: 'Obrigado pela sua preferência!', alignment: 'center' },
      { text: fiscalName, alignment: 'center' },
      ...(restaurant?.legalFooter ? [{ text: restaurant.legalFooter, alignment: 'center' as const }] : []),
      { text: '' },
      { text: '' },
      { text: '' },
    );

    return {
      title: `${fiscalName} · RECIBO DE PAGAMENTO · Nº ${payment.id}`,
      items: payment.items?.map((item) => ({
        name: item.name,
        quantity: item.quantity,
         price: invoiceMoney(parseFloat(item.price) * item.quantity),
       })) || [{ name: 'Pagamento de mesa', quantity: 1, price: invoiceMoney(payment.amount) }],
       total: invoiceMoney(payment.amount),
      footer: [
        `Mesa: ${tableName}`,
         `Fatura associada: ${invoiceNumberLabel(payment.invoiceReference)}`,
         `Sessão: ${invoiceSessionLabel(payment.sessionId)}`,
         `Método: ${formatPaymentMethodLabel(payment.paymentMethod)}`,
        `Operador: ${payment.operatorName || 'Sistema'}`,
        payment.transactionReference ? `Referência: ${payment.transactionReference}` : '',
        restaurant?.legalFooter || '',
        'PAGAMENTO CONFIRMADO',
      ].filter(Boolean).join(' | '),
    };
  };

  const generateHTMLContent = () => {
    const fiscalName = restaurant?.name || restaurantName;
    const fiscalAddress = restaurant?.fiscalAddress || restaurant?.address;
    const escapeHtml = (value: unknown) => String(value ?? '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
    const fiscalLines = [
      fiscalAddress,
      restaurant?.phone ? `Telefone: ${restaurant.phone}` : '',
      restaurant?.nif ? `NIF: ${restaurant.nif}` : '',
      restaurant?.vatRegime ? `Regime de IVA: ${restaurant.vatRegime}` : '',
      restaurant?.vatRate ? `IVA: ${restaurant.vatRate}%` : '',
      restaurant?.documentSeries ? `Série: ${restaurant.documentSeries}` : '',
      restaurant?.invoicePrefix ? `Prefixo: ${restaurant.invoicePrefix}` : '',
      restaurant?.email ? `Email: ${restaurant.email}` : '',
      restaurant?.website ? `Web: ${restaurant.website}` : '',
      restaurant?.whatsappNumber ? `WhatsApp: ${restaurant.whatsappNumber}` : '',
    ].filter(Boolean) as string[];
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Recibo de Pagamento - ${tableName}</title>
        <style>
          @media print {
            @page { margin: 0; size: 80mm auto; }
            body { margin: 0; padding: 10mm; }
          }
          body {
            font-family: 'Courier New', monospace;
            width: 80mm;
            margin: 0 auto;
            padding: 10mm;
            font-size: 12px;
            line-height: 1.4;
          }
          .center { text-align: center; }
          .bold { font-weight: bold; }
          .large { font-size: 16px; }
          .xlarge { font-size: 18px; }
          .separator { border-top: 1px dashed #000; margin: 10px 0; }
          .amount {
            font-size: 20px;
            font-weight: bold;
            text-align: center;
            margin: 15px 0;
          }
          h1 { font-size: 16px; margin: 5px 0; }
          h2 { font-size: 14px; margin: 10px 0; }
          .info-row { margin: 5px 0; }
        </style>
      </head>
      <body>
        <div class="center">
           <h1 class="bold">${escapeHtml(fiscalName)}</h1>
           ${fiscalLines.map((line) => `<div>${escapeHtml(line)}</div>`).join('')}
          <div class="separator"></div>
          <h2 class="bold">RECIBO DE PAGAMENTO</h2>
          <div class="separator"></div>
        </div>
        
        <div class="info-row"><span class="bold">Mesa:</span> ${escapeHtml(tableName)}</div>
        <div class="info-row"><span class="bold">Data:</span> ${invoiceDate(payment.createdAt)}</div>
        <div class="info-row"><span class="bold">Fatura associada:</span> ${invoiceNumberLabel(payment.invoiceReference)}</div>
        <div class="info-row"><span class="bold">Sessão:</span> ${invoiceSessionLabel(payment.sessionId)}</div>
        <div class="info-row"><span class="bold">Nº do pagamento:</span> ${payment.id}</div>
        <div class="info-row"><span class="bold">Cliente:</span> ${payment.guestName || 'Mesa Completa'}</div>
        
        <div class="separator"></div>
        <h2 class="center bold">DETALHES DO CONSUMO</h2>
        <div class="separator"></div>
        
        <div style="margin-bottom: 15px;">
          ${payment.items && payment.items.length > 0 
           ? payment.items.map(item => `
                <div style="display: flex; justify-content: space-between; font-size: 11px; margin-bottom: 3px;">
                   <span>${item.quantity}x ${escapeHtml(item.name)}</span>
                <span>${invoiceMoney(parseFloat(item.price) * item.quantity)}</span>
                </div>
              `).join('')
            : '<div class="center italic">Consumo registrado na mesa</div>'
          }
        </div>

        <div class="separator"></div>
        <h2 class="center bold">RESUMO DO PAGAMENTO</h2>
        <div class="separator"></div>
        
        <div class="amount">${invoiceMoney(payment.amount)}</div>
        
        <div class="info-row"><span class="bold">Método:</span> ${formatPaymentMethodLabel(payment.paymentMethod)}</div>
        ${payment.receivedAmount != null ? `<div class="info-row"><span class="bold">Valor entregue:</span> ${invoiceMoney(payment.receivedAmount)}</div>` : ''}
        ${payment.changeAmount != null ? `<div class="info-row"><span class="bold">Troco:</span> ${invoiceMoney(payment.changeAmount)}</div>` : ''}
        <div class="info-row"><span class="bold">Operador:</span> ${payment.operatorName || 'Sistema'}</div>
        ${payment.transactionReference ? `<div class="info-row"><span class="bold">Referência:</span> ${payment.transactionReference}</div>` : ''}
        
        ${payment.notes ? `
          <div class="separator"></div>
          <div class="info-row"><span class="bold">Observações:</span></div>
          <div class="info-row">${payment.notes}</div>
        ` : ''}
        
        <div class="separator"></div>
        <div class="center">
          <h2 class="bold">PAGAMENTO CONFIRMADO</h2>
        </div>
        <div class="separator"></div>
        
         <div class="center" style="margin-top: 20px;">
          <p>Obrigado pela sua preferência!</p>
           ${restaurant?.legalFooter ? `<p>${escapeHtml(restaurant.legalFooter)}</p>` : ''}
           <p class="bold">${escapeHtml(fiscalName)}</p>
        </div>
      </body>
      </html>
    `;
  };

  // Componente invisível - apenas processa a impressão
  return null;
}
