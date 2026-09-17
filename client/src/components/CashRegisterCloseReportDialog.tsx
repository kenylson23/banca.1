import { useMemo } from 'react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Download, FileText, Printer } from 'lucide-react';
import type { CashRegisterShift } from '@shared/schema';
import { formatPaymentMethodLabel } from '@shared/payment-methods';
import { formatKwanza } from '@/lib/formatters';
import { useToast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

export type CashRegisterCloseReport = CashRegisterShift & {
  cashRegisterName: string;
  paymentBreakdown?: Record<string, string>;
};

interface CashRegisterCloseReportDialogProps {
  report: CashRegisterCloseReport | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

function escapeHtml(value: unknown): string {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function reportDate(value: Date | string | null | undefined): string {
  return value
    ? format(new Date(value), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })
    : '-';
}

export function CashRegisterCloseReportDialog({
  report,
  open,
  onOpenChange,
}: CashRegisterCloseReportDialogProps) {
  const { toast } = useToast();

  const paymentRows = useMemo(
    () =>
      Object.entries(report?.paymentBreakdown || {}).filter(
        ([, amount]) => Number(amount) !== 0,
      ),
    [report?.paymentBreakdown],
  );

  const handlePrint = () => {
    if (!report) return;

    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      toast({
        title: 'Não foi possível abrir a impressão',
        description: 'Permita pop-ups para imprimir o relatório.',
        variant: 'destructive',
      });
      return;
    }

    const rows = paymentRows.length
      ? paymentRows
          .map(
            ([method, amount]) => `
              <tr>
                <td>${escapeHtml(formatPaymentMethodLabel(method))}</td>
                <td class="amount">${escapeHtml(formatKwanza(amount))}</td>
              </tr>`,
          )
          .join('')
      : '<tr><td colspan="2">Nenhum recebimento registrado</td></tr>';

    const difference = Number(report.difference || 0);
    const differenceClass = difference === 0 ? 'positive' : 'negative';

    printWindow.document.write(`
      <!doctype html>
      <html lang="pt">
        <head>
          <meta charset="utf-8" />
          <title>Fecho de Caixa - ${escapeHtml(report.cashRegisterName)}</title>
          <style>
            @page { size: A4; margin: 16mm; }
            * { box-sizing: border-box; }
            body { font-family: Arial, sans-serif; color: #111827; margin: 0; font-size: 12px; }
            header { border-bottom: 2px solid #111827; padding-bottom: 12px; margin-bottom: 18px; }
            h1 { font-size: 22px; margin: 0 0 4px; }
            h2 { font-size: 14px; margin: 20px 0 8px; border-bottom: 1px solid #d1d5db; padding-bottom: 5px; }
            .muted { color: #6b7280; }
            .meta { display: grid; grid-template-columns: 1fr 1fr; gap: 8px 24px; }
            .meta strong { display: block; margin-top: 2px; }
            .summary { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; }
            .summary div { background: #f3f4f6; padding: 10px; border-radius: 4px; }
            .label { color: #6b7280; display: block; margin-bottom: 3px; }
            .value { font-size: 15px; font-weight: 700; }
            .positive { color: #047857; }
            .negative { color: #b91c1c; }
            table { width: 100%; border-collapse: collapse; }
            th, td { border-bottom: 1px solid #e5e7eb; padding: 8px 4px; text-align: left; }
            th { background: #f3f4f6; }
            .amount { text-align: right; font-weight: 600; }
            .notes { background: #f9fafb; padding: 10px; white-space: pre-wrap; }
            footer { margin-top: 30px; padding-top: 10px; border-top: 1px solid #d1d5db; color: #6b7280; font-size: 10px; text-align: center; }
          </style>
        </head>
        <body>
          <header>
            <h1>RELATÓRIO DE FECHO DE CAIXA</h1>
            <div class="muted">${escapeHtml(report.cashRegisterName)} · Turno ${escapeHtml(report.id.slice(0, 8))}</div>
          </header>
          <div class="meta">
            <div><span class="muted">Abertura</span><strong>${escapeHtml(reportDate(report.openedAt))}</strong></div>
            <div><span class="muted">Fechamento</span><strong>${escapeHtml(reportDate(report.closedAt))}</strong></div>
            <div><span class="muted">Estado</span><strong>Fechado</strong></div>
            <div><span class="muted">Documento</span><strong>Uso interno - sem valor fiscal</strong></div>
          </div>
          <h2>Conferência de valores</h2>
          <div class="summary">
            <div><span class="label">Saldo inicial</span><span class="value">${escapeHtml(formatKwanza(report.openingAmount))}</span></div>
            <div><span class="label">Receitas</span><span class="value positive">+${escapeHtml(formatKwanza(report.totalRevenues || '0'))}</span></div>
            <div><span class="label">Despesas</span><span class="value negative">-${escapeHtml(formatKwanza(report.totalExpenses || '0'))}</span></div>
            <div><span class="label">Valor esperado</span><span class="value">${escapeHtml(formatKwanza(report.closingAmountExpected || '0'))}</span></div>
            <div><span class="label">Valor contado</span><span class="value">${escapeHtml(formatKwanza(report.closingAmountCounted || '0'))}</span></div>
            <div><span class="label">Diferença</span><span class="value ${differenceClass}">${escapeHtml(formatKwanza(report.difference || '0'))}</span></div>
          </div>
          <h2>Recebimentos por método</h2>
          <table><thead><tr><th>Método</th><th class="amount">Valor</th></tr></thead><tbody>${rows}</tbody></table>
          ${report.notes ? `<h2>Observações</h2><div class="notes">${escapeHtml(report.notes)}</div>` : ''}
          <footer>Relatório gerado em ${escapeHtml(reportDate(new Date()))}</footer>
          <script>window.onload = function () { window.print(); setTimeout(function () { window.close(); }, 250); };</script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  if (!report) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Relatório de Fecho de Caixa
          </DialogTitle>
          <DialogDescription>
            O turno foi fechado. Confira os valores antes de imprimir ou salvar o documento.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-5">
          <div className="flex flex-wrap items-center justify-between gap-2 rounded-lg border bg-muted/40 p-3">
            <div>
              <p className="font-semibold">{report.cashRegisterName}</p>
              <p className="text-sm text-muted-foreground">
                Turno {report.id.slice(0, 8)} · Fechado em {reportDate(report.closedAt)}
              </p>
            </div>
            <Badge variant="secondary">Documento interno</Badge>
          </div>

          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            <SummaryItem label="Saldo inicial" value={formatKwanza(report.openingAmount)} />
            <SummaryItem label="Receitas" value={`+${formatKwanza(report.totalRevenues || '0')}`} tone="positive" />
            <SummaryItem label="Despesas" value={`-${formatKwanza(report.totalExpenses || '0')}`} tone="negative" />
            <SummaryItem label="Valor esperado" value={formatKwanza(report.closingAmountExpected || '0')} />
            <SummaryItem label="Valor contado" value={formatKwanza(report.closingAmountCounted || '0')} />
            <SummaryItem
              label="Diferença"
              value={formatKwanza(report.difference || '0')}
              tone={Number(report.difference || 0) === 0 ? 'positive' : 'negative'}
            />
          </div>

          <div>
            <h3 className="mb-2 text-sm font-semibold">Recebimentos por método</h3>
            <div className="divide-y rounded-lg border">
              {paymentRows.length > 0 ? (
                paymentRows.map(([method, amount]) => (
                  <div key={method} className="flex items-center justify-between px-3 py-2 text-sm">
                    <span>{formatPaymentMethodLabel(method)}</span>
                    <span className="font-semibold">{formatKwanza(amount)}</span>
                  </div>
                ))
              ) : (
                <p className="px-3 py-3 text-sm text-muted-foreground">
                  Nenhum recebimento registrado neste turno.
                </p>
              )}
            </div>
          </div>

          {report.notes && (
            <div>
              <h3 className="mb-1 text-sm font-semibold">Observações</h3>
              <p className="rounded-lg border bg-muted/40 p-3 text-sm whitespace-pre-wrap">{report.notes}</p>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Fechar
          </Button>
          <Button onClick={handlePrint} data-testid="button-print-close-report">
            <Printer className="mr-2 h-4 w-4" />
            Imprimir / Salvar PDF
            <Download className="ml-2 h-4 w-4" />
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function SummaryItem({
  label,
  value,
  tone,
}: {
  label: string;
  value: string;
  tone?: 'positive' | 'negative';
}) {
  return (
    <div className="rounded-lg border bg-muted/30 p-3">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className={`mt-1 font-semibold ${tone === 'positive' ? 'text-emerald-600' : tone === 'negative' ? 'text-red-600' : ''}`}>
        {value}
      </p>
    </div>
  );
}