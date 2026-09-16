import { useEffect, useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { CreditCard, Download, Eye, Loader2, Printer, Receipt, RotateCcw, User, History, BadgeCheck } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { formatKwanza } from '@/lib/formatters';
import { apiFetch } from '@/lib/api-url';
import { printerService } from '@/lib/printer-service';
import { usePrinter } from '@/hooks/usePrinter';
import { useToast } from '@/hooks/use-toast';
import QRCode from 'qrcode';
import { renderTableInvoiceHtml, tableInvoiceToThermalPayload, type TableInvoicePaper } from '@/lib/table-invoice-renderer';
import type { TableInvoiceDocument } from '@shared/table-invoice-document';
import { PrintTablePayment } from '@/components/PrintTablePayment';

const statusLabels = { pendente: 'PENDENTE', parcial: 'PAGO PARCIALMENTE', pago: 'PAGO' } as const;
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
  const [previewOpen, setPreviewOpen] = useState(false);
  const [paper, setPaper] = useState<TableInvoicePaper>('a4');
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState('');
  const [printingPaymentId, setPrintingPaymentId] = useState<string | null>(null);
  const [isRecordingReprint, setIsRecordingReprint] = useState(false);

  const qrPayload = useMemo(() => JSON.stringify({
    tipo: 'fatura-mesa',
    numero: data?.invoiceReference,
    codigo: data?.validation.code,
    total: data?.totals.total,
  }), [data]);

  useEffect(() => {
    if (!data) return;
    QRCode.toDataURL(qrPayload, {
      width: 240,
      margin: 1,
      errorCorrectionLevel: 'M',
      color: { dark: '#17202a', light: '#ffffff' },
    }).then(setQrCodeDataUrl).catch(() => setQrCodeDataUrl(''));
  }, [data, qrPayload]);

  if (isLoading) {
    return <div className="flex items-center gap-2 py-3 text-sm text-muted-foreground"><Loader2 className="h-4 w-4 animate-spin" /> A carregar fatura/recibo...</div>;
  }
  if (isError || !data) {
    return <p className="py-3 text-sm text-muted-foreground">Não foi possível carregar a fatura/recibo desta sessão.</p>;
  }

  const recordReprint = async () => {
    if (isRecordingReprint) return;
    setIsRecordingReprint(true);
    try {
      const response = await apiFetch(`/api/table-sessions/${sessionId}/invoice/reprint`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ reason: 'Reimpressão solicitada na gestão da mesa' }),
      });
      if (!response.ok) throw new Error('Não foi possível registar a reimpressão.');
      toast({ title: 'Documento marcado como reimpresso', description: 'A ação foi registada com o operador e a hora.' });
    } catch (error) {
      toast({ title: 'Erro ao registar reimpressão', description: error instanceof Error ? error.message : 'Tente novamente.', variant: 'destructive' });
      throw error;
    } finally {
      setIsRecordingReprint(false);
    }
  };

  const printBrowser = async (selectedPaper: TableInvoicePaper = 'a4', reprint = false) => {
    if (reprint) await recordReprint();
    const printWindow = window.open('', '_blank', 'width=800,height=900');
    if (!printWindow) return;
    printWindow.document.write(renderTableInvoiceHtml(data, { paper: selectedPaper, qrCodeDataUrl }));
    printWindow.document.close();
    printWindow.onload = () => {
      printWindow.focus();
      printWindow.print();
    };
    window.setTimeout(() => {
      if (!printWindow.closed) {
        printWindow.focus();
        printWindow.print();
      }
    }, 500);
  };

  const printThermal = async (reprint = false) => {
    if (!thermalPrinter) return;
    try {
      if (reprint) await recordReprint();
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
      anchor.download = `fatura-mesa-${data.table.number}-${data.invoiceReference.replace(/[^a-z0-9]+/gi, '-')}.pdf`;
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
            {data.restaurant.logoUrl ? <img src={data.restaurant.logoUrl} alt="" className="h-10 w-10 rounded-lg object-contain ring-1 ring-border" /> : <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary text-lg font-bold text-primary-foreground">{data.restaurant.name.slice(0, 1).toUpperCase()}</div>}
            <div>
              <p className="font-semibold">Fatura/Recibo da mesa Nº {data.invoiceReference}</p>
              <p className="text-xs text-muted-foreground">{data.restaurant.name}{data.branch ? ` · ${data.branch.name}` : ''} · Código: {data.validation.code}</p>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Badge className={statusColors[data.totals.paymentStatus]}>{statusLabels[data.totals.paymentStatus]}</Badge>
            <Button size="sm" variant="outline" onClick={() => setPreviewOpen(true)}><Eye className="mr-2 h-4 w-4" /> Pré-visualizar</Button>
            <Button size="sm" variant="outline" onClick={() => printBrowser('a4')}><Printer className="mr-2 h-4 w-4" /> Imprimir A4</Button>
             <Button size="sm" variant="outline" disabled={isRecordingReprint} onClick={() => printBrowser('a4', true)}><RotateCcw className="mr-2 h-4 w-4" /> Reimprimir</Button>
             {thermalPrinter?.status === 'connected' && <Button size="sm" variant="outline" onClick={() => printThermal(true)}><Receipt className="mr-2 h-4 w-4" /> Térmica</Button>}
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
          <div className="mb-2 flex items-center gap-2 font-semibold"><CreditCard className="h-4 w-4 text-primary" /> Pagamentos realizados ({data.payments.length})</div>
           {data.payments.length > 0 ? data.payments.map((payment) => (
             <div key={payment.id} className="flex flex-wrap items-center justify-between gap-2 rounded bg-muted/40 px-2 py-1.5">
               <span>
                 {payment.paymentMethodLabel} · {format(new Date(payment.createdAt), 'dd/MM/yyyy HH:mm', { locale: ptBR })}
                 {payment.operatorName ? ` · ${payment.operatorName}` : ''}
               </span>
               <div className="flex items-center gap-2">
                 <span className="font-medium">{formatKwanza(Number(payment.amount))}</span>
                 <Button size="sm" variant="ghost" onClick={() => setPrintingPaymentId(payment.id)} title="Ver recibo individual">
                   <Receipt className="h-4 w-4" />
                 </Button>
               </div>
            </div>
          )) : <p className="text-muted-foreground">Nenhum pagamento registado.</p>}
        </div>
         <div className="grid gap-3 rounded-lg border bg-muted/20 p-3 text-sm sm:grid-cols-2">
           <div className="flex items-start gap-2">
             <User className="mt-0.5 h-4 w-4 text-muted-foreground" />
             <div>
               <p className="text-muted-foreground">Descontos e ajustes</p>
               {data.audit.filter((entry) => entry.action.includes('discount') || entry.action.includes('adjustment')).length > 0
                 ? data.audit.filter((entry) => entry.action.includes('discount') || entry.action.includes('adjustment')).map((entry) => (
                   <p key={entry.id}><strong>{entry.actorName || 'Não identificado'}</strong> · {format(new Date(entry.createdAt), 'dd/MM/yyyy HH:mm', { locale: ptBR })}{entry.reason ? ` · ${entry.reason}` : ''}</p>
                 ))
                 : <p className="text-muted-foreground">Sem registo de operador.</p>}
             </div>
           </div>
           <div className="flex items-start gap-2">
             <History className="mt-0.5 h-4 w-4 text-muted-foreground" />
             <div>
               <p className="text-muted-foreground">Fecho da mesa</p>
               {data.audit.filter((entry) => entry.action === 'session_closed' || entry.action === 'session_force_closed').map((entry) => (
                 <p key={entry.id}><strong>{entry.actorName || 'Não identificado'}</strong> · {format(new Date(entry.createdAt), 'dd/MM/yyyy HH:mm', { locale: ptBR })}{entry.reason ? ` · ${entry.reason}` : ''}</p>
               ))}
               {!data.audit.some((entry) => entry.action === 'session_closed' || entry.action === 'session_force_closed') && <p className="text-muted-foreground">Mesa ainda não fechada.</p>}
             </div>
           </div>
           <div className="flex items-start gap-2 sm:col-span-2">
             <BadgeCheck className="mt-0.5 h-4 w-4 text-muted-foreground" />
             <div>
               <p className="text-muted-foreground">Reimpressões</p>
               <p>{data.reprints.count > 0 ? `${data.reprints.count} vez(es) · última por ${data.reprints.lastPrintedBy || 'não identificado'} em ${data.reprints.lastPrintedAt ? format(new Date(data.reprints.lastPrintedAt), 'dd/MM/yyyy HH:mm', { locale: ptBR }) : '-'}` : 'Documento original; ainda não reimpresso.'}</p>
             </div>
           </div>
         </div>
         {printingPaymentId && (() => {
           const payment = data.payments.find((item) => item.id === printingPaymentId);
           if (!payment) return null;
           return (
             <PrintTablePayment
               payment={{ id: payment.id, amount: payment.amount, paymentMethod: payment.paymentMethod, createdAt: payment.createdAt, notes: payment.notes || undefined, operatorName: payment.operatorName || undefined, invoiceReference: data.invoiceReference }}
               tableName={`Mesa ${data.table.number}`}
               onPrintComplete={() => setPrintingPaymentId(null)}
               autoPrint
             />
           );
         })()}
      </CardContent>
      <Dialog open={previewOpen} onOpenChange={setPreviewOpen}>
        <DialogContent className="flex max-h-[94vh] w-[calc(100%-1rem)] max-w-5xl flex-col gap-3 overflow-hidden p-4 sm:p-6">
          <DialogHeader className="pr-8">
            <DialogTitle>Pré-visualização da Fatura/Recibo</DialogTitle>
            <DialogDescription>Confirme o documento final antes de imprimir ou reimprimir.</DialogDescription>
          </DialogHeader>
          <div className="flex flex-wrap items-center justify-between gap-2 rounded-lg border bg-muted/30 p-2">
            <div className="flex items-center gap-1">
              <Button type="button" size="sm" variant={paper === 'a4' ? 'default' : 'ghost'} onClick={() => setPaper('a4')}>A4</Button>
              <Button type="button" size="sm" variant={paper === '80mm' ? 'default' : 'ghost'} onClick={() => setPaper('80mm')}>80 mm</Button>
            </div>
            <div className="flex gap-2">
              <Button type="button" size="sm" variant="outline" onClick={() => printBrowser(paper)}><Printer className="mr-2 h-4 w-4" /> Imprimir {paper === 'a4' ? 'A4' : '80 mm'}</Button>
               <Button type="button" size="sm" disabled={isRecordingReprint} onClick={() => printBrowser(paper, true)}><RotateCcw className="mr-2 h-4 w-4" /> Reimprimir</Button>
            </div>
          </div>
          <div className="min-h-0 flex-1 overflow-auto rounded-lg bg-slate-100 p-3 sm:p-6">
            <iframe
              title="Pré-visualização da fatura"
              srcDoc={renderTableInvoiceHtml(data, { paper, qrCodeDataUrl })}
              className={`mx-auto block min-h-[680px] border-0 bg-white shadow-md ${paper === 'a4' ? 'w-full max-w-[794px]' : 'w-[302px]'}`}
            />
          </div>
        </DialogContent>
      </Dialog>
    </Card>
  );
}