import { useEffect, useMemo, useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { CreditCard, Loader2, Printer, Receipt, RotateCcw, User, History, BadgeCheck } from 'lucide-react';
import { apiFetch } from '@/lib/api-url';
import { printerService } from '@/lib/printer-service';
import { usePrinter } from '@/hooks/usePrinter';
import { useToast } from '@/hooks/use-toast';
import QRCode from 'qrcode';
import { renderTableInvoiceHtml, tableInvoiceToThermalPayload } from '@/lib/table-invoice-renderer';
import type { TableInvoiceDocument } from '@shared/table-invoice-document';
import { getRestaurantFiscalCompleteness, getRestaurantFiscalDetails } from '@shared/invoice-fiscal';
import {
  invoiceDate,
  invoiceMoney,
  invoiceOrderStatusLabel,
  invoicePaymentStatusLabel,
  invoiceSessionLabel,
} from '@shared/invoice-formatters';

const statusColors = {
  pendente: 'bg-amber-100 text-amber-800',
  parcial: 'bg-blue-100 text-blue-800',
  pago: 'bg-emerald-100 text-emerald-800',
} as const;

export function SessionInvoice({
  sessionId,
  expectedTableId,
  expectedRestaurantId,
}: {
  sessionId: string;
  expectedTableId: string;
  expectedRestaurantId: string;
  tableNumber?: string | number;
}) {
  const { data, isLoading, isError, error, refetch } = useQuery<TableInvoiceDocument>({
    queryKey: [`/api/table-sessions/${sessionId}/invoice`],
  });
  const queryClient = useQueryClient();
  const [draftRecipientType, setDraftRecipientType] = useState<TableInvoiceDocument['invoiceRecipient']['type']>('table_customer');
  const [isUpdatingRecipient, setIsUpdatingRecipient] = useState(false);
  const customerOptionsQuery = useQuery<Array<{
    id: string;
    name: string;
    phone: string | null;
    email: string | null;
    nif: string | null;
    address: string | null;
  }>>({
    queryKey: [`/api/table-sessions/${sessionId}/invoice/customers`],
    enabled: draftRecipientType === 'other_customer',
  });
  const { getPrinterByType } = usePrinter();
  const { toast } = useToast();
  const thermalPrinter = getPrinterByType('invoice');
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState('');
  const [isRecordingReprint, setIsRecordingReprint] = useState(false);

  const qrPayload = useMemo(
    () => data ? new URL(data.validation.verificationUrl, window.location.origin).toString() : '',
    [data],
  );

  useEffect(() => {
    if (!data) return;
    setDraftRecipientType(data.invoiceRecipient.type);
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
    const status = (error as (Error & { status?: number }) | null)?.status;
    const message = status === 401
      ? 'A sessão de acesso expirou. Entre novamente e tente carregar a fatura.'
      : status === 403
        ? 'O seu utilizador não tem permissão para consultar esta fatura.'
        : status === 404
          ? 'A sessão não foi encontrada ou não pertence a esta mesa/restaurante.'
          : 'O servidor não conseguiu montar a fatura/recibo desta sessão.';

    return (
      <div role="alert" className="flex flex-wrap items-center gap-3 rounded-md border border-destructive/40 bg-destructive/5 p-3 text-sm">
        <div className="min-w-0 flex-1">
          <p>{message}</p>
          {typeof status === 'number' && (
            <p className="mt-1 text-xs text-muted-foreground">Código de resposta: {status}</p>
          )}
        </div>
        <Button size="sm" variant="outline" onClick={() => refetch()}>
          Tentar novamente
        </Button>
      </div>
    );
  }
  if (
    data.session.id !== sessionId ||
    data.table.id !== expectedTableId ||
    data.restaurant.id !== expectedRestaurantId
  ) {
    return (
      <div role="alert" className="rounded-md border border-destructive/40 bg-destructive/5 p-4 text-sm">
        A fatura não corresponde à mesa e ao restaurante selecionados. A abertura e a impressão foram bloqueadas.
      </div>
    );
  }

  const fiscalDetails = getRestaurantFiscalDetails(data.restaurant);
  const fiscalCompleteness = getRestaurantFiscalCompleteness(data.restaurant);

  const updateInvoiceRecipient = async (
    type: TableInvoiceDocument['invoiceRecipient']['type'],
    customerId?: string,
  ) => {
    if (type === 'other_customer' && !customerId) return;
    setIsUpdatingRecipient(true);
    try {
      const response = await apiFetch(`/api/table-sessions/${sessionId}/invoice/recipient`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ type, customerId: customerId || null }),
      });
      if (!response.ok) {
        const payload = await response.json().catch(() => null);
        throw new Error(payload?.message || 'Não foi possível atualizar o titular da fatura.');
      }
      const updatedDocument = await response.json() as TableInvoiceDocument;
      queryClient.setQueryData([`/api/table-sessions/${sessionId}/invoice`], updatedDocument);
      toast({ title: 'Titular da fatura atualizado', description: `Fatura em nome de ${updatedDocument.invoiceRecipient.label}.` });
    } catch (error) {
      setDraftRecipientType(data.invoiceRecipient.type);
      toast({ title: 'Erro ao atualizar a fatura', description: error instanceof Error ? error.message : 'Tente novamente.', variant: 'destructive' });
    } finally {
      setIsUpdatingRecipient(false);
    }
  };

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

  const openInvoiceInBrowser = () => {
    const invoiceWindow = window.open('', '_blank');
    if (!invoiceWindow) {
      toast({
        title: 'Abertura bloqueada',
        description: 'Permita janelas pop-up para abrir a fatura no navegador.',
        variant: 'destructive',
      });
      return;
    }

    invoiceWindow.document.open();
    invoiceWindow.document.write(renderTableInvoiceHtml(data, {
      paper: 'a4',
      qrCodeDataUrl,
      returnUrl: window.location.pathname,
    }));
    invoiceWindow.document.close();
    invoiceWindow.focus();
  };

  const openPaymentReceiptInBrowser = (paymentId: string) => {
    const payment = data.payments.find((item) => item.id === paymentId);
    if (!payment) return;

    const receiptWindow = window.open('', '_blank');
    if (!receiptWindow) {
      toast({
        title: 'Abertura bloqueada',
        description: 'Permita janelas pop-up para abrir o recibo no navegador.',
        variant: 'destructive',
      });
      return;
    }

    const escapeHtml = (value: unknown) => String(value ?? '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
    const receiptRows: [string, string][] = [
      ['Mesa', `Mesa ${data.table.number}`],
      ['Data', invoiceDate(payment.createdAt)],
      ['Fatura associada', data.invoiceReference],
      ['Sessão', invoiceSessionLabel(data.session.id)],
      ['Nº do pagamento', payment.id],
      ['Método', payment.paymentMethodLabel],
    ];
    if (payment.operatorName) receiptRows.push(['Operador', payment.operatorName]);
    if (payment.notes) receiptRows.push(['Observações', payment.notes]);
    const receiptHtml = `<!doctype html>
      <html lang="pt"><head><meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1">
      <title>Recibo de pagamento · ${escapeHtml(data.table.number)}</title>
      <style>
        *{box-sizing:border-box}body{font-family:Arial,sans-serif;color:#17202a;max-width:620px;margin:24px auto;padding:16px;line-height:1.5}
        header{text-align:center;border-bottom:2px solid #17202a;padding-bottom:16px;margin-bottom:16px}
        h1{font-size:20px;margin:0 0 6px}h2{font-size:16px;letter-spacing:.08em;margin:12px 0}
        .muted{color:#64727d;font-size:13px}.details{border:1px solid #dfe5e8;border-radius:8px;padding:12px}
        .row{display:flex;justify-content:space-between;gap:16px;padding:7px 0;border-bottom:1px solid #e5eaed}
        .row:last-child{border-bottom:0}.row span:first-child{color:#64727d}.row span:last-child{text-align:right;overflow-wrap:anywhere}
        .amount{margin-top:16px;padding:14px;border-radius:8px;background:#f1f5f9;text-align:center;font-size:24px;font-weight:700}
        .toolbar{display:flex;justify-content:center;gap:10px;margin-bottom:20px}.toolbar a,.toolbar button{border:0;border-radius:7px;padding:11px 16px;background:#1d4ed8;color:#fff;font-size:14px;font-weight:700;text-decoration:none;cursor:pointer}
        .toolbar a{background:#475569}@media print{body{max-width:72mm;margin:0;padding:8mm}.toolbar{display:none}.amount{background:#fff}}
      </style></head><body>
      <nav class="toolbar"><a href="${escapeHtml(window.location.pathname)}">Voltar à gestão da mesa</a><button onclick="window.print()">Imprimir</button></nav>
      <header><h1>${escapeHtml(data.restaurant.name)}</h1>
      ${fiscalDetails.lines.map(({ label, value }) => `<div class="muted">${escapeHtml(label)}: ${escapeHtml(value)}</div>`).join('')}
      <h2>RECIBO DE PAGAMENTO</h2></header>
      <section class="details">${receiptRows.map(([label, value]) => `<div class="row"><span>${escapeHtml(label)}</span><span>${escapeHtml(value)}</span></div>`).join('')}</section>
      <div class="amount">${escapeHtml(invoiceMoney(payment.amount))}</div>
      ${fiscalDetails.legalFooter ? `<p class="muted" style="text-align:center">${escapeHtml(fiscalDetails.legalFooter)}</p>` : ''}
      </body></html>`;
    receiptWindow.document.open();
    receiptWindow.document.write(receiptHtml);
    receiptWindow.document.close();
    receiptWindow.focus();
  };

  const printBrowser = async (reprint = false) => {
    if (reprint) await recordReprint();
    const printWindow = window.open('', '_blank', 'width=800,height=900');
    if (!printWindow) {
      toast({
        title: 'Pré-visualização bloqueada',
        description: 'Permita a abertura de janelas para imprimir a fatura.',
        variant: 'destructive',
      });
      return;
    }
    let printStarted = false;
    const startPrint = () => {
      if (printStarted || printWindow.closed) return;
      printStarted = true;
      printWindow.focus();
      printWindow.print();
    };
    printWindow.onload = () => window.setTimeout(startPrint, 100);
    printWindow.document.open();
    printWindow.document.write(renderTableInvoiceHtml(data, {
      paper: 'a4',
      qrCodeDataUrl,
      returnUrl: window.location.pathname,
    }));
    printWindow.document.close();
    window.setTimeout(startPrint, 800);
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

  const itemDescription = (item: TableInvoiceDocument['items'][number]) => (
    <div className="min-w-[220px]">
      <p className="font-medium">{item.name}</p>
      <p className="text-xs text-muted-foreground">
        Pedido {item.orderNumber ? `#${item.orderNumber}` : 'sem número'}
         {item.orderCreatedAt ? ` · ${invoiceDate(item.orderCreatedAt)}` : ''}
         {` · ${invoiceOrderStatusLabel(item.orderStatus)}`}
      </p>
      {item.guestName && <p className="text-xs text-muted-foreground">Convidado: {item.guestName}</p>}
      {item.options.length > 0 && <p className="text-xs text-muted-foreground">Opções: {item.options.map((option) => `${option.name}${option.quantity > 1 ? ` (${option.quantity}x)` : ''}`).join(', ')}</p>}
      {item.notes && <p className="text-xs text-muted-foreground">Obs. do item: {item.notes}</p>}
      {item.orderNotes && <p className="text-xs text-muted-foreground">Obs. do pedido: {item.orderNotes}</p>}
      {item.sharedWithGuestNames.length > 0 && <p className="text-xs font-medium text-cyan-700">Partilhado com: {item.sharedWithGuestNames.join(', ')}</p>}
    </div>
  );

  return (
    <Card className="border-primary/20 bg-primary/[0.02]">
      <CardContent className="space-y-3 p-4">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="flex items-center gap-2">
            {data.restaurant.logoUrl ? <img src={data.restaurant.logoUrl} alt="" className="h-10 w-10 rounded-lg object-contain ring-1 ring-border" /> : <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary text-lg font-bold text-primary-foreground">{data.restaurant.name.slice(0, 1).toUpperCase()}</div>}
            <div>
              <p className="font-semibold">Fatura/Recibo da mesa Nº {data.invoiceReference}</p>
              <p className="text-xs text-muted-foreground">{data.restaurant.name}{data.branch ? ` · ${data.branch.name}` : ''} · Código: {data.validation.code}</p>
              <a className="text-xs text-primary underline-offset-2 hover:underline" href={data.validation.verificationUrl} target="_blank" rel="noreferrer">Confirmar este documento</a>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Badge className={statusColors[data.totals.paymentStatus]}>{invoicePaymentStatusLabel(data.totals.paymentStatus)}</Badge>
            <Button size="sm" variant="outline" onClick={openInvoiceInBrowser}><Receipt className="mr-2 h-4 w-4" /> Abrir fatura no navegador</Button>
            <Button size="sm" variant="outline" onClick={() => printBrowser()}><Printer className="mr-2 h-4 w-4" /> Imprimir A4</Button>
            <Button size="sm" variant="outline" disabled={isRecordingReprint} onClick={() => printBrowser(true)}><RotateCcw className="mr-2 h-4 w-4" /> Reimprimir</Button>
             {thermalPrinter?.status === 'connected' && <Button size="sm" variant="outline" onClick={() => printThermal(true)}><Receipt className="mr-2 h-4 w-4" /> Térmica</Button>}
          </div>
        </div>
        <div
          role={fiscalCompleteness.isComplete ? 'status' : 'alert'}
          className={`rounded-md border p-3 text-sm ${
            fiscalCompleteness.isComplete
              ? 'border-emerald-300 bg-emerald-50 text-emerald-900 dark:border-emerald-800 dark:bg-emerald-950/30 dark:text-emerald-200'
              : 'border-amber-300 bg-amber-50 text-amber-950 dark:border-amber-800 dark:bg-amber-950/30 dark:text-amber-100'
          }`}
        >
          <p className="font-semibold">
            {fiscalCompleteness.isComplete ? 'Dados fiscais essenciais informados' : 'Dados fiscais incompletos'}
          </p>
          <p className="mt-1">
            {fiscalCompleteness.isComplete
              ? 'NIF, morada, IVA e identificação documental estão preenchidos.'
              : `Em falta: ${fiscalCompleteness.missingFields.join(', ')}.`}
          </p>
          <p className="mt-1 text-xs opacity-80">Esta verificação confirma o preenchimento dos campos, não a conformidade legal dos dados.</p>
        </div>
        {data.auditWarnings?.length ? (
          <div role="status" className="rounded-md border border-amber-300 bg-amber-50 p-3 text-sm text-amber-900 dark:border-amber-800 dark:bg-amber-950/30 dark:text-amber-200">
            A fatura foi carregada, mas parte do histórico de auditoria não está disponível.
          </div>
        ) : null}
        <Separator />
         <div className="grid gap-3 rounded-lg border bg-background p-3 text-sm sm:grid-cols-[minmax(0,1fr)_minmax(0,1.2fr)]">
           <div className="space-y-2">
             <Label htmlFor={`invoice-recipient-${sessionId}`}>Fatura em nome de</Label>
             <Select
               value={draftRecipientType}
               disabled={isUpdatingRecipient}
               onValueChange={(value: TableInvoiceDocument['invoiceRecipient']['type']) => {
                 setDraftRecipientType(value);
                 if (value !== 'other_customer') updateInvoiceRecipient(value);
               }}
             >
               <SelectTrigger id={`invoice-recipient-${sessionId}`}>
                 <SelectValue />
               </SelectTrigger>
               <SelectContent>
                 <SelectItem value="table_customer">Cliente da mesa</SelectItem>
                 <SelectItem value="consumer_final">Consumidor final</SelectItem>
                 <SelectItem value="other_customer">Outro cliente</SelectItem>
               </SelectContent>
             </Select>
             {draftRecipientType === 'other_customer' && (
               <Select
                 value={data.invoiceRecipient.type === 'other_customer' ? data.invoiceRecipient.customerId || '' : ''}
                 disabled={isUpdatingRecipient || customerOptionsQuery.isLoading}
                 onValueChange={(customerId) => updateInvoiceRecipient('other_customer', customerId)}
               >
                 <SelectTrigger>
                   <SelectValue placeholder={customerOptionsQuery.isLoading ? 'A carregar clientes...' : 'Selecionar cliente'} />
                 </SelectTrigger>
                 <SelectContent>
                   {data.invoiceRecipient.type === 'other_customer' && data.invoiceRecipient.customerId && !customerOptionsQuery.data?.some((customer) => customer.id === data.invoiceRecipient.customerId) && (
                     <SelectItem value={data.invoiceRecipient.customerId}>{data.invoiceRecipient.label}</SelectItem>
                   )}
                   {(customerOptionsQuery.data || []).map((customer) => (
                     <SelectItem key={customer.id} value={customer.id}>
                       {customer.name}{customer.nif ? ` · NIF ${customer.nif}` : ''}
                     </SelectItem>
                   ))}
                 </SelectContent>
               </Select>
             )}
           </div>
           <div className="rounded-md bg-muted/40 p-2.5">
             <p className="font-medium">Dados que serão impressos</p>
             <p className="text-muted-foreground">Titular: <span className="font-medium text-foreground">{data.invoiceRecipient.label}</span></p>
             {data.customer?.phone && <p className="text-muted-foreground">Telefone: <span className="font-medium text-foreground">{data.customer.phone}</span></p>}
             {data.customer?.nif && <p className="text-muted-foreground">NIF: <span className="font-medium text-foreground">{data.customer.nif}</span></p>}
             {data.customer?.address && <p className="text-muted-foreground">Morada: <span className="font-medium text-foreground">{data.customer.address}</span></p>}
             {data.tableCustomer && data.tableCustomer.id !== data.customer?.id && <p className="text-muted-foreground">Cliente principal da mesa: <span className="font-medium text-foreground">{data.tableCustomer.name}</span></p>}
             {data.isSplit && <p className="mt-1 font-medium text-primary">Conta dividida entre {data.guests.length} convidados.</p>}
           </div>
         </div>
        <div className="grid grid-cols-1 gap-2 text-sm sm:grid-cols-3">
           <div><span className="text-muted-foreground">Total da sessão</span><p className="font-semibold">{invoiceMoney(data.totals.total)}</p></div>
           <div><span className="text-muted-foreground">Total pago</span><p className="font-semibold text-emerald-600">{invoiceMoney(data.totals.paid)}</p></div>
           <div><span className="text-muted-foreground">{Number(data.totals.pending) > 0 ? 'Saldo pendente' : 'Saldo'}</span><p className="font-semibold text-amber-600">{invoiceMoney(data.totals.pending)}</p></div>
        </div>
         <div className="grid gap-3 rounded-lg border bg-muted/20 p-3 text-sm sm:grid-cols-2 lg:grid-cols-3">
           <div><span className="text-muted-foreground">Filial</span><p className="font-medium">{data.branch?.name || 'Unidade principal'}</p></div>
           <div><span className="text-muted-foreground">Endereço da filial</span><p className="font-medium">{data.branch?.address || data.restaurant.address || 'Não definido'}</p></div>
           <div><span className="text-muted-foreground">Telefone da filial</span><p className="font-medium">{data.branch?.phone || data.restaurant.phone || 'Não definido'}</p></div>
           <div><span className="text-muted-foreground">Caixa / turno</span><p className="font-medium">{data.cashRegisterShift?.label || 'Não identificado'}</p></div>
           <div><span className="text-muted-foreground">Atendido por</span><p className="font-medium">{data.paymentOperatorNames.join(', ') || data.session.openedByName || 'Não identificado'}</p></div>
           <div><span className="text-muted-foreground">Fechado por</span><p className="font-medium">{data.session.closedByName || data.cashRegisterShift?.closedByName || 'Não identificado'}</p></div>
           <div><span className="text-muted-foreground">Abertura</span><p className="font-medium">{invoiceDate(data.session.startedAt)}</p></div>
           <div><span className="text-muted-foreground">Encerramento</span><p className="font-medium">{invoiceDate(data.session.endedAt, 'Sessão aberta')}</p></div>
           <div><span className="text-muted-foreground">Duração total</span><p className="font-medium">{data.session.durationLabel}</p></div>
         </div>
          <div className="rounded-lg border bg-background p-3 text-sm">
            <p className="mb-2 font-semibold">Dados fiscais do emitente</p>
            <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
              <div><span className="text-muted-foreground">Nome</span><p className="font-medium">{data.restaurant.name}</p></div>
              {fiscalDetails.lines.map(({ label, value }) => (
                <div key={label}><span className="text-muted-foreground">{label}</span><p className="font-medium">{value}</p></div>
              ))}
              {!fiscalDetails.lines.some(({ label }) => label === 'NIF') && (
                <div><span className="text-muted-foreground">NIF</span><p className="font-medium">Não informado</p></div>
              )}
              {fiscalDetails.legalFooter && <div className="sm:col-span-2 lg:col-span-3"><span className="text-muted-foreground">Rodapé legal</span><p className="font-medium">{fiscalDetails.legalFooter}</p></div>}
            </div>
          </div>
          {(data.discounts.length > 0 || data.fees.length > 0) && (
            <div className="rounded-lg border bg-background p-3 text-sm">
              <p className="mb-2 font-semibold">Descontos e taxas — origem para auditoria</p>
              <div className="space-y-2">
                {[
                  ...data.discounts.map((adjustment) => ({ ...adjustment, sign: '-' })),
                  ...data.fees.map((adjustment) => ({ ...adjustment, sign: '+' })),
                ].map((adjustment, index) => (
                  <div key={`${adjustment.scope}-${adjustment.guestId || 'session'}-${adjustment.label}-${index}`} className="flex flex-wrap items-start justify-between gap-3 border-t pt-2 first:border-t-0 first:pt-0">
                    <div>
                      <p className="font-medium">{adjustment.label}</p>
                      <p className="text-xs text-muted-foreground">
                        Origem: {adjustment.sourceLabel} · {adjustment.type === 'percentual' ? `${adjustment.inputValue}%` : 'valor fixo'}
                        {' · '}Aplicado por: {adjustment.appliedByName || 'não identificado'}
                        {adjustment.reason ? ` · Motivo: ${adjustment.reason}` : ''}
                      </p>
                    </div>
                    <span className={adjustment.sign === '-' ? 'font-medium text-emerald-700' : 'font-medium text-amber-700'}>
                      {adjustment.sign}{invoiceMoney(adjustment.amount)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
          <div className="space-y-3">
            <div className="flex items-center justify-between gap-2">
              <p className="font-semibold">Itens do consumo válido</p>
              <Badge variant="outline">{data.items.length} {data.items.length === 1 ? 'item' : 'itens'}</Badge>
            </div>
            <div className="overflow-x-auto rounded-lg border bg-background">
              <table className="w-full min-w-[680px] text-sm">
                <thead className="bg-muted/60 text-left text-xs uppercase tracking-wide text-muted-foreground">
                  <tr><th className="px-3 py-2 text-center">Qtd.</th><th className="px-3 py-2">Descrição</th><th className="px-3 py-2 text-right">Preço unitário</th><th className="px-3 py-2 text-right">Total</th></tr>
                </thead>
                <tbody>
                  {data.items.length > 0 ? data.items.map((item) => (
                    <tr key={item.id} className="border-t align-top">
                      <td className="px-3 py-2 text-center font-medium">{item.quantity}</td>
                      <td className="px-3 py-2">{itemDescription(item)}</td>
                      <td className="px-3 py-2 text-right whitespace-nowrap">{invoiceMoney(item.unitPrice)}</td>
                      <td className="px-3 py-2 text-right font-medium whitespace-nowrap">{invoiceMoney(item.total)}</td>
                    </tr>
                  )) : <tr><td colSpan={4} className="px-3 py-4 text-center text-muted-foreground">Sem itens registados.</td></tr>}
                </tbody>
              </table>
            </div>
            {data.items.some((item) => item.orderNotes) && (
              <div className="rounded-lg border bg-amber-50/60 p-3 text-sm">
                <p className="font-medium">Observações dos pedidos</p>
                {Array.from(new Set(data.items.map((item) => item.orderNotes).filter(Boolean))).map((note) => <p key={note} className="text-muted-foreground">{note}</p>)}
              </div>
            )}
            {data.cancelledItems.length > 0 && (
              <details className="rounded-lg border border-red-200 bg-red-50/40 p-3 text-sm">
                <summary className="cursor-pointer font-semibold text-red-800">Itens cancelados ({data.cancelledItems.length}) — fora do consumo válido</summary>
                <div className="mt-3 overflow-x-auto rounded border bg-background">
                  <table className="w-full min-w-[680px] text-sm">
                    <thead className="bg-red-100/70 text-left text-xs uppercase tracking-wide text-red-800">
                      <tr><th className="px-3 py-2 text-center">Qtd.</th><th className="px-3 py-2">Descrição</th><th className="px-3 py-2 text-right">Preço unitário</th><th className="px-3 py-2 text-right">Total</th></tr>
                    </thead>
                    <tbody>{data.cancelledItems.map((item) => (
                      <tr key={item.id} className="border-t align-top text-muted-foreground">
                        <td className="px-3 py-2 text-center">{item.quantity}</td>
                        <td className="px-3 py-2">{itemDescription(item)}{item.orderNotes && <p className="text-xs text-red-700">Pedido cancelado: {item.orderNotes}</p>}</td>
                         <td className="px-3 py-2 text-right whitespace-nowrap">{invoiceMoney(item.unitPrice)}</td>
                         <td className="px-3 py-2 text-right whitespace-nowrap">{invoiceMoney(item.total)}</td>
                      </tr>
                    ))}</tbody>
                  </table>
                </div>
                {data.cancelledOrders.some((order) => order.cancellationReason) && <p className="mt-2 text-xs text-red-800">Motivos: {data.cancelledOrders.map((order) => order.cancellationReason).filter(Boolean).join(' · ')}</p>}
              </details>
            )}
          </div>
        <div className="text-sm">
          <div className="mb-2 flex items-center gap-2 font-semibold"><CreditCard className="h-4 w-4 text-primary" /> Pagamentos realizados ({data.payments.length})</div>
            {data.paymentsByMethod.length > 0 ? data.paymentsByMethod.map((payment) => (
              <div key={payment.paymentMethod} className="flex flex-wrap items-center justify-between gap-2 rounded bg-muted/40 px-2 py-1.5">
                 <span>{payment.paymentMethodLabel} <span className="text-muted-foreground">· {payment.count} {payment.count === 1 ? 'lançamento' : 'lançamentos'}</span></span>
                 <span className="font-medium">{invoiceMoney(payment.amount)}</span>
              </div>
            )) : <p className="text-muted-foreground">Nenhum pagamento registado.</p>}
            {data.payments.length > 0 && (
              <details className="mt-2 rounded border bg-background/60 px-2 py-1.5">
                <summary className="cursor-pointer text-xs text-muted-foreground">Ver registos individuais</summary>
                <div className="mt-2 space-y-1">
                {data.payments.map((payment) => (
             <div key={payment.id} className="flex flex-wrap items-center justify-between gap-2 rounded bg-muted/40 px-2 py-1.5">
               <span>
                  {payment.paymentMethodLabel} · {invoiceDate(payment.createdAt)}
                 {payment.operatorName ? ` · ${payment.operatorName}` : ''}
               </span>
               <div className="flex items-center gap-2">
                  <span className="font-medium">{invoiceMoney(payment.amount)}</span>
                  <Button size="sm" variant="ghost" onClick={() => openPaymentReceiptInBrowser(payment.id)} title="Abrir recibo no navegador" aria-label={`Abrir recibo do pagamento ${payment.id} no navegador`}>
                   <Receipt className="h-4 w-4" />
                 </Button>
               </div>
            </div>
           ))}
                </div>
              </details>
            )}
        </div>
         <div className="grid gap-3 rounded-lg border bg-muted/20 p-3 text-sm sm:grid-cols-2">
           <div className="flex items-start gap-2">
             <User className="mt-0.5 h-4 w-4 text-muted-foreground" />
             <div>
               <p className="text-muted-foreground">Descontos e ajustes</p>
               {data.audit.filter((entry) => entry.action.includes('discount') || entry.action.includes('adjustment')).length > 0
                 ? data.audit.filter((entry) => entry.action.includes('discount') || entry.action.includes('adjustment')).map((entry) => (
                   <p key={entry.id}><strong>{entry.actorName || 'Não identificado'}</strong> · {invoiceDate(entry.createdAt)}{entry.reason ? ` · ${entry.reason}` : ''}</p>
                 ))
                 : <p className="text-muted-foreground">Sem registo de operador.</p>}
             </div>
           </div>
           <div className="flex items-start gap-2">
             <History className="mt-0.5 h-4 w-4 text-muted-foreground" />
             <div>
               <p className="text-muted-foreground">Fecho da mesa</p>
               {data.audit.filter((entry) => entry.action === 'session_closed' || entry.action === 'session_force_closed').map((entry) => (
                 <p key={entry.id}><strong>{entry.actorName || 'Não identificado'}</strong> · {invoiceDate(entry.createdAt)}{entry.reason ? ` · ${entry.reason}` : ''}</p>
               ))}
               {!data.audit.some((entry) => entry.action === 'session_closed' || entry.action === 'session_force_closed') && <p className="text-muted-foreground">Mesa ainda não fechada.</p>}
             </div>
           </div>
           <div className="flex items-start gap-2 sm:col-span-2">
             <BadgeCheck className="mt-0.5 h-4 w-4 text-muted-foreground" />
             <div>
               <p className="text-muted-foreground">Reimpressões</p>
               <p>{data.reprints.count > 0 ? `${data.reprints.count} vez(es) · última por ${data.reprints.lastPrintedBy || 'não identificado'} em ${invoiceDate(data.reprints.lastPrintedAt)}` : 'Documento original; ainda não reimpresso.'}</p>
             </div>
           </div>
         </div>
      </CardContent>
    </Card>
  );
}