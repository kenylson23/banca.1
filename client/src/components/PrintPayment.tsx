import { useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Printer, ChevronDown } from 'lucide-react';
import { formatKwanza } from '@/lib/formatters';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import type { FinancialTransaction, CashRegister, FinancialCategory, User } from '@shared/schema';
import { printerService } from '@/lib/printer-service';
import { usePrinter } from '@/hooks/usePrinter';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { useToast } from '@/hooks/use-toast';

type TransactionWithDetails = FinancialTransaction & {
  cashRegister: CashRegister | null;
  category: FinancialCategory | null;
  recordedBy: User | null;
};

interface PrintPaymentProps {
  transaction: TransactionWithDetails;
  restaurantName?: string;
  variant?: 'default' | 'outline' | 'ghost';
  size?: 'default' | 'sm' | 'lg' | 'icon';
}

export function PrintPayment({ 
  transaction, 
  restaurantName = 'NaBancada', 
  variant = 'outline', 
  size = 'sm' 
}: PrintPaymentProps) {
  const printRef = useRef<HTMLDivElement>(null);
  const isIconOnly = size === 'icon';
  const { getPrinterByType } = usePrinter();
  const { toast } = useToast();
  const [printing, setPrinting] = useState(false);

  const thermalPrinter = getPrinterByType('receipt');

  const handlePrintThermal = async () => {
    setPrinting(true);
    try {
      const isIncome = transaction.type === 'receita';
      const transactionTypeLabel = isIncome ? 'RECEITA' : 'DESPESA';

      const paymentMethodLabels: Record<string, string> = {
        dinheiro: 'Dinheiro',
        multicaixa: 'Multicaixa',
        transferencia: 'Transferência',
        cartao: 'Cartão',
      };

      const items = [
        { 
          name: `${transactionTypeLabel}${transaction.category?.name ? ' - ' + transaction.category.name : ''}`, 
          quantity: 1, 
          price: formatKwanza(transaction.amount)
        }
      ];

      const footer = [
        `Método: ${paymentMethodLabels[transaction.paymentMethod as keyof typeof paymentMethodLabels] || transaction.paymentMethod}`,
        transaction.cashRegister?.name ? `Caixa: ${transaction.cashRegister.name}` : '',
        transaction.recordedBy ? `Operador: ${transaction.recordedBy.firstName || transaction.recordedBy.email}` : '',
        transaction.note ? `Obs: ${transaction.note}` : '',
        '',
        'Documento sem valor fiscal',
        format(new Date(), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })
      ].filter(Boolean).join('\n');

      await printerService.printReceipt('receipt', {
        title: `${restaurantName}\n${transactionTypeLabel}\nID: ${transaction.id.substring(0, 8).toUpperCase()}`,
        items,
        total: formatKwanza(transaction.amount),
        footer,
      });

      toast({
        title: 'Recibo impresso',
        description: 'Recibo enviado para impressora térmica',
      });
    } catch (error) {
      toast({
        title: 'Erro ao imprimir',
        description: error instanceof Error ? error.message : 'Erro desconhecido',
        variant: 'destructive',
      });
    } finally {
      setPrinting(false);
    }
  };

  const handlePrintBrowser = () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const isIncome = transaction.type === 'receita';
    const transactionTypeLabel = isIncome ? 'RECEITA' : 'DESPESA';
    
    const paymentMethodLabels: Record<string, string> = {
      dinheiro: 'Dinheiro',
      multicaixa: 'Multicaixa',
      transferencia: 'Transferência Bancária',
      cartao: 'Cartão',
    };

    const printContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Recibo - ${transactionTypeLabel}</title>
        <style>
          @media print {
            @page {
              size: 80mm auto;
              margin: 5mm;
            }
            body {
              margin: 0;
              padding: 0;
            }
          }
          body {
            font-family: 'Courier New', monospace;
            font-size: 12px;
            line-height: 1.4;
            max-width: 80mm;
            margin: 0 auto;
            padding: 10px;
          }
          .header {
            text-align: center;
            margin-bottom: 15px;
            border-bottom: 2px dashed #000;
            padding-bottom: 10px;
          }
          .restaurant-name {
            font-size: 18px;
            font-weight: bold;
            margin-bottom: 5px;
          }
          .doc-type {
            font-size: 16px;
            font-weight: bold;
            margin: 10px 0;
          }
          .transaction-id {
            font-size: 11px;
            color: #666;
            margin: 5px 0;
          }
          .info-row {
            display: flex;
            justify-content: space-between;
            margin: 3px 0;
          }
          .section {
            margin: 15px 0;
          }
          .section-title {
            font-weight: bold;
            font-size: 13px;
            margin-bottom: 8px;
            border-bottom: 1px solid #000;
            padding-bottom: 3px;
          }
          .amount-box {
            border: 2px solid #000;
            padding: 10px;
            margin: 15px 0;
            text-align: center;
          }
          .amount-label {
            font-size: 12px;
            margin-bottom: 5px;
          }
          .amount-value {
            font-size: 20px;
            font-weight: bold;
          }
          .amount-income {
            color: #059669;
          }
          .amount-expense {
            color: #DC2626;
          }
          .footer {
            text-align: center;
            margin-top: 20px;
            padding-top: 10px;
            border-top: 2px dashed #000;
            font-size: 11px;
          }
          .print-time {
            margin-top: 8px;
            font-size: 10px;
            color: #666;
          }
          .signature-box {
            margin-top: 20px;
            border-top: 1px solid #000;
            padding-top: 5px;
            text-align: center;
          }
        </style>
      </head>
      <body>
        <div class="header">
          <div class="restaurant-name">${restaurantName}</div>
          <div class="doc-type">RECIBO DE ${transactionTypeLabel}</div>
          <div class="transaction-id">ID: ${transaction.id.substring(0, 8).toUpperCase()}</div>
        </div>

        <div class="section">
          <div class="info-row">
            <span>Data e Hora:</span>
            <span>${format(new Date(transaction.occurredAt || new Date()), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}</span>
          </div>
          ${transaction.cashRegister?.name ? `
          <div class="info-row">
            <span>Caixa:</span>
            <span>${transaction.cashRegister.name}</span>
          </div>
          ` : ''}
          <div class="info-row">
            <span>Método:</span>
            <span>${paymentMethodLabels[transaction.paymentMethod as keyof typeof paymentMethodLabels] || transaction.paymentMethod}</span>
          </div>
          ${transaction.category?.name ? `
          <div class="info-row">
            <span>Categoria:</span>
            <span>${transaction.category.name}</span>
          </div>
          ` : ''}
          ${transaction.recordedBy ? `
          <div class="info-row">
            <span>Operador:</span>
            <span>${transaction.recordedBy.firstName || transaction.recordedBy.email}</span>
          </div>
          ` : ''}
        </div>

        <div class="amount-box">
          <div class="amount-label">VALOR</div>
          <div class="amount-value ${isIncome ? 'amount-income' : 'amount-expense'}">
            ${formatKwanza(transaction.amount)}
          </div>
        </div>

        ${transaction.note ? `
        <div class="section">
          <div class="section-title">OBSERVAÇÕES</div>
          <div style="margin-top: 5px;">${transaction.note}</div>
        </div>
        ` : ''}

        <div class="signature-box">
          <div style="margin-top: 30px;">_______________________________</div>
          <div style="margin-top: 5px; font-size: 10px;">Assinatura</div>
        </div>

        <div class="footer">
          <div>Documento sem valor fiscal</div>
          <div class="print-time">
            Impresso em ${format(new Date(), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
          </div>
        </div>

        <script>
          window.onload = function() {
            window.print();
            setTimeout(function() {
              window.close();
            }, 100);
          };
        </script>
      </body>
      </html>
    `;

    printWindow.document.write(printContent);
    printWindow.document.close();
  };

  if (thermalPrinter?.status === 'connected') {
    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant={variant}
            size={size}
            disabled={printing}
            data-testid={`button-print-payment-${transaction.id}`}
            className="gap-1"
          >
            <Printer className="h-4 w-4" />
            {!isIconOnly && "Imprimir"}
            <ChevronDown className="h-3 w-3" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem
            onClick={handlePrintThermal}
            data-testid={`menu-item-print-thermal-${transaction.id}`}
          >
            <Printer className="h-4 w-4 mr-2" />
            Impressora Térmica
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            onClick={handlePrintBrowser}
            data-testid={`menu-item-print-browser-${transaction.id}`}
          >
            <Printer className="h-4 w-4 mr-2" />
            Impressão do Navegador
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    );
  }

  return (
    <Button
      variant={variant}
      size={size}
      onClick={handlePrintBrowser}
      disabled={printing}
      data-testid={`button-print-payment-${transaction.id}`}
    >
      <Printer className={isIconOnly ? "h-4 w-4" : "h-4 w-4 mr-2"} />
      {!isIconOnly && "Imprimir Recibo"}
    </Button>
  );
}
