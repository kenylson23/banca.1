import { useQuery } from '@tanstack/react-query';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { CreditCard, Download, Loader2, Printer, Receipt } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { formatKwanza } from '@/lib/formatters';
import { apiFetch } from '@/lib/api-url';
import { printerService } from '@/lib/printer-service';
import { usePrinter } from '@/hooks/usePrinter';
import { useToast } from '@/hooks/use-toast';
import { renderTableInvoiceHtml, tableInvoiceToThermalPayload } from '@/lib/table-invoice-renderer';
import type { TableInvoiceDocument } from '@shared/table-invoice-document';

const statusLabels = { pendente: 'Pendente', parcial: 'Parcial', pago: 'Pago' } as const;
const statusColors = {
  pendente: 'bg-amber-100 text-amber-800',
  parcial: 'bg-blue-100 text-blue-800',
  pago: 'bg-emerald-100 text-emerald-800',
} as const;

export function SessionInvoice({ sessionId }: { sessionId: string; tableNumber?: string | number }) {
  const { data, isLoading, isError } = useQuery<TableInvoiceDocument>({
    queryKey: [`/api/table-sessions/${sessionId}/invoice`],
  });
  const { getPrinterByType } = usePrinter();
  const { toast } = useToast();
  const thermalPrinter = getPrinterByType('invoice');

  if (isLoading) {
    return <div className="flex items-center gap-2 py-3 text-sm text-muted-foreground"><Loader2 className="h-4 w-4 animate-spin" /> A carregar fatura...</div>;
  }
  if (isError || !data) {
    return <p className="py-3 text-sm text-muted-foreground">Não foi possível carregar a fatura desta sessão.</p>;
  }

  const printBrowser = () => {
    const printWindow = window.open('', '_blank', 'width=800,height=900');
    if (!printWindow) return;
    printWindow.document.write(renderTableInvoiceHtml(data));
    printWindow.document.close();
    printWindow.focus();
    printWindow.print();
  };

  const printThermal = async () => {
    if (!thermalPrinter) return;
    try {
      await printerService.printInvoice('invoice', tableInvoiceToThermalPayload(data));
      toast({ title: 'Fatura impressa', description: 'Fatura enviada para a impressora térmica.' });
    } catch (error) {
      toast({ title: 'Erro ao imprimir', description: error instanceof Error ? error.message : 'Não foi possível imprimir.', variant: 'destructive' });
    }
  };

  const downloadPdf = async () => {
    try {
      const response = await apiFetch(`/api/table-sessions/${sessionId}/invoice/pdf`, { credentials: 'include' });
      if (!response.ok) throw new Error('Não foi possível gerar o PDF.');
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement('a');
      anchor.href = url;
      anchor.download = `fatura-mesa-${data.table.number}-${data.invoiceNumber}.pdf`;
      anchor.click();
      URL.revokeObjectURL(url);
    } catch (error) {
      toast({ title: 'Erro ao gerar PDF', description: error instanceof Error ? error.message : 'Não foi possível gerar o PDF.', variant: 'destructive' });
    }
  };

  return (
    <Card className="border-primary/20 bg-primary/[0.02]">
      <CardContent className="space-y-3 p-4">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="flex items-center gap-2">
            <Receipt className="h-4 w-4 text-primary" />
            <div>
              <p className="font-semibold">Fatura da mesa Nº {String(data.invoiceNumber).padStart(6, '0')}</p>
              <p className="text-xs text-muted-foreground">{data.restaurant.name}{data.branch ? ` · ${data.branch.name}` : ''} · Código: {data.validation.code}</p>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Badge className={statusColors[data.totals.paymentStatus]}>{statusLabels[data.totals.paymentStatus]}</Badge>
            <Button size="sm" variant="outline" onClick={printBrowser}><Printer className="mr-2 h-4 w-4" /> Imprimir</Button>
            {thermalPrinter?.status === 'connected' && <Button size="sm" variant="outline" onClick={printThermal}><Receipt className="mr-2 h-4 w-4" /> Térmica</Button>}
            <Button size="sm" variant="outline" onClick={downloadPdf}><Download className="mr-2 h-4 w-4" /> PDF</Button>
          </div>
        </div>
        <Separator />
        <div className="grid grid-cols-1 gap-2 text-sm sm:grid-cols-3">
          <div><span className="text-muted-foreground">Total final</span><p className="font-semibold">{formatKwanza(Number(data.totals.total))}</p></div>
          <div><span className="text-muted-foreground">Pago</span><p className="font-semibold text-emerald-600">{formatKwanza(Number(data.totals.paid))}</p></div>
          <div><span className="text-muted-foreground">Saldo pendente</span><p className="font-semibold text-amber-600">{formatKwanza(Number(data.totals.pending))}</p></div>
        </div>
        <div className="text-sm">
          <div className="mb-2 flex items-center gap-2 font-semibold"><CreditCard className="h-4 w-4 text-primary" /> Pagamentos ({data.payments.length})</div>
          {data.payments.length > 0 ? data.payments.map((payment) => (
            <div key={payment.id} className="flex justify-between rounded bg-muted/40 px-2 py-1.5">
              <span>{payment.paymentMethodLabel} · {format(new Date(payment.createdAt), 'dd/MM/yyyy HH:mm', { locale: ptBR })}</span>
              <span className="font-medium">{formatKwanza(Number(payment.amount))}</span>
            </div>
          )) : <p className="text-muted-foreground">Nenhum pagamento registado.</p>}
        </div>
      </CardContent>
    </Card>
  );
}