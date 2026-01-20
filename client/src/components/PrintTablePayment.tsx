/**
 * PrintTablePayment - Impressão de Recibo de Pagamento de Mesa
 * Permite reimprimir recibos de pagamentos anteriores
 */

import { useEffect, useState } from 'react';
import { formatKwanza } from '@/lib/formatters';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { printerService } from '@/lib/printer-service';
import { usePrinter } from '@/hooks/usePrinter';
import { useToast } from '@/hooks/use-toast';

interface PrintTablePaymentProps {
  payment: {
    id: string;
    amount: string;
    paymentMethod: string;
    createdAt: string;
    notes?: string;
    sessionId?: string;
    guestName?: string;
    items?: Array<{ name: string; quantity: number; price: string }>;
  };
  tableName: string;
  restaurantName?: string;
  onPrintComplete?: () => void;
  autoPrint?: boolean;
}

const paymentMethodLabels: Record<string, string> = {
  cash: 'Dinheiro',
  card: 'Cartão',
  mbway: 'MBWay',
  tpa: 'TPA',
  bank_transfer: 'Transferência Bancária',
};

export function PrintTablePayment({
  payment,
  tableName,
  restaurantName = 'NaBancada',
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
    await printerService.printReceipt(thermalPrinter.id, receiptContent);
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
    const lines = [
      { text: restaurantName, alignment: 'center', bold: true, fontSize: 1.5 },
      { text: '================================', alignment: 'center' },
      { text: 'RECIBO DE PAGAMENTO', alignment: 'center', bold: true },
      { text: '================================', alignment: 'center' },
      { text: '' },
      { text: `Mesa: ${tableName}`, bold: true },
      { text: `Data: ${format(new Date(payment.createdAt), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}` },
      { text: `Recibo: #${payment.id.slice(0, 8).toUpperCase()}` },
      { text: '' },
      { text: '--------------------------------', alignment: 'center' },
      { text: 'DETALHES DO CONSUMO', alignment: 'center', bold: true },
      { text: '--------------------------------', alignment: 'center' },
      { text: '' },
      ...(payment.items && payment.items.length > 0 
        ? payment.items.map(item => ({
            text: `${item.quantity}x ${item.name.padEnd(20)} ${formatKwanza(parseFloat(item.price) * item.quantity)}`,
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
        text: `Valor Pago: ${formatKwanza(payment.amount)}`, 
        bold: true, 
        fontSize: 1.3,
        alignment: 'center'
      },
      { text: '' },
      { text: `Método: ${paymentMethodLabels[payment.paymentMethod] || payment.paymentMethod}` },
      { text: `Cliente: ${payment.guestName || 'Mesa Completa'}` },
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
      { text: restaurantName, alignment: 'center' },
      { text: '' },
      { text: '' },
      { text: '' },
    );

    return lines;
  };

  const generateHTMLContent = () => {
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
          <h1 class="bold">${restaurantName}</h1>
          <div class="separator"></div>
          <h2 class="bold">RECIBO DE PAGAMENTO</h2>
          <div class="separator"></div>
        </div>
        
        <div class="info-row"><span class="bold">Mesa:</span> ${tableName}</div>
        <div class="info-row"><span class="bold">Data:</span> ${format(new Date(payment.createdAt), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}</div>
        <div class="info-row"><span class="bold">Recibo:</span> #${payment.id.slice(0, 8).toUpperCase()}</div>
        <div class="info-row"><span class="bold">Cliente:</span> ${payment.guestName || 'Mesa Completa'}</div>
        
        <div class="separator"></div>
        <h2 class="center bold">DETALHES DO CONSUMO</h2>
        <div class="separator"></div>
        
        <div style="margin-bottom: 15px;">
          ${payment.items && payment.items.length > 0 
            ? payment.items.map(item => `
                <div style="display: flex; justify-content: space-between; font-size: 11px; margin-bottom: 3px;">
                  <span>${item.quantity}x ${item.name}</span>
                  <span>${formatKwanza(parseFloat(item.price) * item.quantity)}</span>
                </div>
              `).join('')
            : '<div class="center italic">Consumo registrado na mesa</div>'
          }
        </div>

        <div class="separator"></div>
        <h2 class="center bold">RESUMO DO PAGAMENTO</h2>
        <div class="separator"></div>
        
        <div class="amount">${formatKwanza(payment.amount)}</div>
        
        <div class="info-row"><span class="bold">Método:</span> ${paymentMethodLabels[payment.paymentMethod] || payment.paymentMethod}</div>
        
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
          <p class="bold">${restaurantName}</p>
        </div>
      </body>
      </html>
    `;
  };

  // Componente invisível - apenas processa a impressão
  return null;
}
