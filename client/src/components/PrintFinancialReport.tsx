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

type FinancialSummary = {
  totalBalance: string;
  cashRegisterBalances: Array<{ id: string; name: string; balance: string }>;
  totalIncome: string;
  totalExpense: string;
  netResult: string;
};

interface PrintFinancialReportProps {
  transactions: TransactionWithDetails[];
  summary: FinancialSummary;
  dateRange: {
    from: Date;
    to: Date;
  };
  restaurantName?: string;
  variant?: 'default' | 'outline' | 'ghost';
  size?: 'default' | 'sm' | 'lg' | 'icon';
}

export function PrintFinancialReport({ 
  transactions, 
  summary,
  dateRange,
  restaurantName = 'NaBancada', 
  variant = 'outline', 
  size = 'sm' 
}: PrintFinancialReportProps) {
  const printRef = useRef<HTMLDivElement>(null);
  const isIconOnly = size === 'icon';
  const { getPrinterByType } = usePrinter();
  const { toast } = useToast();
  const [printing, setPrinting] = useState(false);

  const thermalPrinter = getPrinterByType('receipt');

  const handlePrintThermal = async () => {
    if (!dateRange?.from || !dateRange?.to) {
      toast({
        title: 'Erro ao imprimir',
        description: 'Período de datas não definido',
        variant: 'destructive',
      });
      return;
    }

    setPrinting(true);
    try {
      const paymentMethodLabels: Record<string, string> = {
        dinheiro: 'Dinheiro',
        multicaixa: 'Multicaixa',
        transferencia: 'Transferência',
        cartao: 'Cartão',
      };

      const summaryItems = [
        { label: 'Total de Receitas:', value: '+ ' + formatKwanza(summary?.totalIncome || '0'), highlight: false },
        { label: 'Total de Despesas:', value: '- ' + formatKwanza(summary?.totalExpense || '0'), highlight: false },
        { label: 'Resultado Líquido:', value: formatKwanza(summary?.netResult || '0'), highlight: true },
      ];

      const txList = transactions.map(tx => ({
        date: format(new Date(tx.occurredAt || new Date()), "dd/MM/yy HH:mm", { locale: ptBR }),
        type: tx.type === 'receita' ? 'Receita' : 'Despesa',
        description: tx.category?.name || 'Sem categoria',
        amount: `${tx.type === 'receita' ? '+' : '-'} ${formatKwanza(tx.amount)}`,
      }));

      await printerService.printFinancialReport('receipt', {
        title: `${restaurantName}\nRELATÓRIO FINANCEIRO`,
        period: `${format(dateRange.from, "dd/MM/yyyy", { locale: ptBR })} a ${format(dateRange.to, "dd/MM/yyyy", { locale: ptBR })}`,
        summary: summaryItems,
        transactions: txList,
        footer: 'Documento interno - Sem valor fiscal',
      });

      toast({
        title: 'Relatório impresso',
        description: 'Relatório enviado para impressora térmica',
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

    const paymentMethodLabels: Record<string, string> = {
      dinheiro: 'Dinheiro',
      multicaixa: 'Multicaixa',
      transferencia: 'Transferência',
      cartao: 'Cartão',
    };

    const printContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Relatório Financeiro</title>
        <style>
          @media print {
            @page {
              size: A4;
              margin: 15mm;
            }
            body {
              margin: 0;
              padding: 0;
            }
          }
          body {
            font-family: Arial, sans-serif;
            font-size: 11px;
            line-height: 1.4;
            margin: 0;
            padding: 20px;
          }
          .header {
            text-align: center;
            margin-bottom: 20px;
            border-bottom: 2px solid #000;
            padding-bottom: 15px;
          }
          .restaurant-name {
            font-size: 20px;
            font-weight: bold;
            margin-bottom: 5px;
          }
          .doc-type {
            font-size: 16px;
            font-weight: bold;
            margin: 10px 0;
          }
          .period {
            font-size: 12px;
            color: #666;
            margin: 5px 0;
          }
          .summary-section {
            margin: 20px 0;
            padding: 15px;
            background: #f5f5f5;
            border-radius: 5px;
          }
          .summary-row {
            display: flex;
            justify-content: space-between;
            margin: 8px 0;
            font-size: 13px;
          }
          .summary-row.total {
            font-weight: bold;
            font-size: 15px;
            border-top: 2px solid #000;
            padding-top: 10px;
            margin-top: 10px;
          }
          .transactions-section {
            margin: 20px 0;
          }
          .section-title {
            font-weight: bold;
            font-size: 14px;
            margin-bottom: 10px;
            padding-bottom: 5px;
            border-bottom: 1px solid #000;
          }
          table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 10px;
          }
          th, td {
            border: 1px solid #ddd;
            padding: 8px;
            text-align: left;
          }
          th {
            background-color: #f5f5f5;
            font-weight: bold;
            font-size: 11px;
          }
          td {
            font-size: 10px;
          }
          .income {
            color: #059669;
            font-weight: bold;
          }
          .expense {
            color: #DC2626;
            font-weight: bold;
          }
          .footer {
            text-align: center;
            margin-top: 30px;
            padding-top: 15px;
            border-top: 1px solid #000;
            font-size: 10px;
            color: #666;
          }
        </style>
      </head>
      <body>
        <div class="header">
          <div class="restaurant-name">${restaurantName}</div>
          <div class="doc-type">RELATÓRIO FINANCEIRO</div>
          <div class="period">
            Período: ${format(dateRange.from, "dd/MM/yyyy", { locale: ptBR })} a ${format(dateRange.to, "dd/MM/yyyy", { locale: ptBR })}
          </div>
        </div>

        <div class="summary-section">
          <div class="section-title">RESUMO DO PERÍODO</div>
          <div class="summary-row">
            <span>Total de Receitas:</span>
            <span class="income">+ ${formatKwanza(summary?.totalIncome || '0')}</span>
          </div>
          <div class="summary-row">
            <span>Total de Despesas:</span>
            <span class="expense">- ${formatKwanza(summary?.totalExpense || '0')}</span>
          </div>
          <div class="summary-row total">
            <span>Resultado Líquido:</span>
            <span class="${parseFloat(summary?.netResult || '0') >= 0 ? 'income' : 'expense'}">
              ${formatKwanza(summary?.netResult || '0')}
            </span>
          </div>
        </div>

        ${summary?.cashRegisterBalances && summary.cashRegisterBalances.length > 0 ? `
        <div class="summary-section">
          <div class="section-title">SALDOS POR CAIXA</div>
          ${summary.cashRegisterBalances.map((register) => `
            <div class="summary-row">
              <span>${register?.name || 'Caixa'}:</span>
              <span>${formatKwanza(register?.balance || '0')}</span>
            </div>
          `).join('')}
        </div>
        ` : ''}

        <div class="transactions-section">
          <div class="section-title">LANÇAMENTOS DETALHADOS (${transactions.length})</div>
          <table>
            <thead>
              <tr>
                <th>Data/Hora</th>
                <th>Tipo</th>
                <th>Categoria</th>
                <th>Método</th>
                <th>Caixa</th>
                <th style="text-align: right;">Valor</th>
              </tr>
            </thead>
            <tbody>
              ${transactions.map((transaction) => {
                const isIncome = transaction.type === 'receita';
                return `
                  <tr>
                    <td>${format(new Date(transaction.occurredAt || new Date()), "dd/MM/yy HH:mm", { locale: ptBR })}</td>
                    <td>${isIncome ? 'Receita' : 'Despesa'}</td>
                    <td>${transaction.category?.name || '-'}</td>
                    <td>${paymentMethodLabels[transaction.paymentMethod as keyof typeof paymentMethodLabels] || transaction.paymentMethod}</td>
                    <td>${transaction.cashRegister?.name || '-'}</td>
                    <td style="text-align: right;" class="${isIncome ? 'income' : 'expense'}">
                      ${isIncome ? '+' : '-'} ${formatKwanza(transaction.amount)}
                    </td>
                  </tr>
                  ${transaction.note ? `
                    <tr>
                      <td colspan="6" style="font-size: 9px; font-style: italic; background: #fafafa;">
                        Obs: ${transaction.note}
                      </td>
                    </tr>
                  ` : ''}
                `;
              }).join('')}
            </tbody>
          </table>
        </div>

        <div class="footer">
          <div>Relatório gerado em ${format(new Date(), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}</div>
          <div>Documento interno - Sem valor fiscal</div>
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

  if (thermalPrinter?.status === 'connected' && transactions && transactions.length > 0) {
    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant={variant}
            size={size}
            disabled={printing}
            data-testid="button-print-financial-report"
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
            data-testid="menu-item-print-thermal-report"
          >
            <Printer className="h-4 w-4 mr-2" />
            Impressora Térmica
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            onClick={handlePrintBrowser}
            data-testid="menu-item-print-browser-report"
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
      data-testid="button-print-financial-report"
      disabled={!transactions || transactions.length === 0 || printing}
    >
      <Printer className={isIconOnly ? "h-4 w-4" : "h-4 w-4 mr-2"} />
      {!isIconOnly && "Imprimir Relatório"}
    </Button>
  );
}
