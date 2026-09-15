import { useQuery } from '@tanstack/react-query';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { CreditCard, Loader2, Printer, Receipt } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { formatKwanza } from '@/lib/formatters';

type SessionInvoiceData = {
  session: {
    invoiceNumber: number;
    startedAt: string;
    totalAmount: string;
    paidAmount: string;
    pendingAmount: string;
    paymentStatus: 'pendente' | 'parcial' | 'pago';
  };
  validationCode: string;
  orders: Array<{
    id: string;
    orderNumber?: number | null;
    totalAmount?: string | null;
    orderItems?: Array<{
      quantity: number;
      price: string;
      name?: string | null;
      menuItem?: { name?: string | null } | null;
    }>;
  }>;
  payments: Array<{
    id: string;
    amount: string;
    paymentMethodLabel: string;
    createdAt: string;
  }>;
};

const statusLabels = {
  pendente: 'Pendente',
  parcial: 'Parcial',
  pago: 'Pago',
} as const;

const statusColors = {
  pendente: 'bg-amber-100 text-amber-800',
  parcial: 'bg-blue-100 text-blue-800',
  pago: 'bg-emerald-100 text-emerald-800',
} as const;

const htmlEscape = (value: unknown) =>
  String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');

export function SessionInvoice({ sessionId, tableNumber }: { sessionId: string; tableNumber: string | number }) {
  const { data, isLoading, isError } = useQuery<SessionInvoiceData>({
    queryKey: [`/api/table-sessions/${sessionId}/invoice`],
  });

  if (isLoading) {
    return <div className="flex items-center gap-2 py-3 text-sm text-muted-foreground"><Loader2 className="h-4 w-4 animate-spin" /> A carregar fatura...</div>;
  }

  if (isError || !data) {
    return <p className="py-3 text-sm text-muted-foreground">Não foi possível carregar a fatura desta sessão.</p>;
  }

  const { session, payments, orders } = data;
  const printInvoice = () => {
    const printWindow = window.open('', '_blank', 'width=800,height=900');
    if (!printWindow) return;

    const orderRows = orders.flatMap((order) => {
      const items = order.orderItems || [];
      if (items.length === 0) {
        return [`<tr><td>Comanda #${htmlEscape(order.orderNumber || order.id.slice(-8))}</td><td>-</td><td>${formatKwanza(Number(order.totalAmount || 0))}</td></tr>`];
      }
      return items.map((item) => `
        <tr>
          <td>${htmlEscape(item.menuItem?.name || item.name || 'Item')}</td>
          <td>${htmlEscape(item.quantity)}</td>
          <td>${formatKwanza(Number(item.price || 0) * item.quantity)}</td>
        </tr>
      `);
    }).join('');
    const paymentRows = payments.map((payment) => `
      <tr>
        <td>${htmlEscape(payment.paymentMethodLabel)}</td>
        <td>${htmlEscape(format(new Date(payment.createdAt), 'dd/MM/yyyy HH:mm', { locale: ptBR }))}</td>
        <td>${formatKwanza(Number(payment.amount))}</td>
      </tr>
    `).join('');

    printWindow.document.write(`<!doctype html><html lang="pt"><head><meta charset="utf-8"><title>Fatura ${htmlEscape(session.invoiceNumber)}</title>
      <style>
        body{font-family:Arial,sans-serif;max-width:760px;margin:32px auto;color:#111;font-size:13px}
        h1{margin:0 0 4px;font-size:22px} h2{font-size:14px;border-bottom:1px solid #ddd;padding-bottom:6px;margin-top:24px}
        .muted{color:#666}.grid{display:grid;grid-template-columns:1fr 1fr;gap:8px;margin:18px 0}
        .total{font-size:18px;font-weight:700;border-top:2px solid #111;padding-top:10px;margin-top:14px}
        .line{display:flex;justify-content:space-between;margin:5px 0}
        table{width:100%;border-collapse:collapse}th,td{text-align:left;padding:7px 4px;border-bottom:1px solid #eee}th:last-child,td:last-child{text-align:right}
        .code{text-align:center;margin-top:28px;padding-top:12px;border-top:1px dashed #999;font-size:11px}
      </style></head><body>
      <h1>Fatura da sessão</h1><div class="muted">Mesa ${htmlEscape(tableNumber)} · Fatura Nº ${htmlEscape(String(session.invoiceNumber).padStart(6, '0'))}</div>
      <div class="grid"><div><b>Início:</b> ${htmlEscape(format(new Date(session.startedAt), 'dd/MM/yyyy HH:mm', { locale: ptBR }))}</div><div><b>Estado:</b> ${htmlEscape(statusLabels[session.paymentStatus])}</div></div>
      <h2>Pedidos</h2><table><thead><tr><th>Item</th><th>Qtd.</th><th>Total</th></tr></thead><tbody>${orderRows || '<tr><td colspan="3">Sem pedidos</td></tr>'}</tbody></table>
      <h2>Pagamentos</h2><table><thead><tr><th>Forma</th><th>Data</th><th>Valor</th></tr></thead><tbody>${paymentRows || '<tr><td colspan="3">Nenhum pagamento</td></tr>'}</tbody></table>
      <div class="total"><div class="line"><span>Total final</span><span>${formatKwanza(Number(session.totalAmount))}</span></div>
      <div class="line"><span>Pago</span><span>${formatKwanza(Number(session.paidAmount))}</span></div>
      <div class="line"><span>Saldo pendente</span><span>${formatKwanza(Number(session.pendingAmount))}</span></div></div>
      <div class="code">Código de validação: <b>${htmlEscape(data.validationCode)}</b></div>
      </body></html>`);
    printWindow.document.close();
    printWindow.focus();
    printWindow.print();
  };

  return (
    <Card className="border-primary/20 bg-primary/[0.02]">
      <CardContent className="space-y-3 p-4">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="flex items-center gap-2">
            <Receipt className="h-4 w-4 text-primary" />
            <div>
              <p className="font-semibold">Fatura da sessão Nº {String(session.invoiceNumber).padStart(6, '0')}</p>
              <p className="text-xs text-muted-foreground">Código: {data.validationCode}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge className={statusColors[session.paymentStatus]}>{statusLabels[session.paymentStatus]}</Badge>
            <Button size="sm" variant="outline" onClick={printInvoice}>
              <Printer className="mr-2 h-4 w-4" /> Imprimir
            </Button>
          </div>
        </div>
        <Separator />
        <div className="grid grid-cols-1 gap-2 text-sm sm:grid-cols-3">
          <div><span className="text-muted-foreground">Total final</span><p className="font-semibold">{formatKwanza(Number(session.totalAmount))}</p></div>
          <div><span className="text-muted-foreground">Pago</span><p className="font-semibold text-emerald-600">{formatKwanza(Number(session.paidAmount))}</p></div>
          <div><span className="text-muted-foreground">Saldo pendente</span><p className="font-semibold text-amber-600">{formatKwanza(Number(session.pendingAmount))}</p></div>
        </div>
        <div>
          <div className="mb-2 flex items-center gap-2 text-sm font-semibold"><CreditCard className="h-4 w-4 text-primary" /> Pagamentos ({payments.length})</div>
          {payments.length > 0 ? (
            <div className="space-y-1 text-sm">
              {payments.map((payment) => (
                <div key={payment.id} className="flex justify-between rounded bg-muted/40 px-2 py-1.5">
                  <span>{payment.paymentMethodLabel} · {format(new Date(payment.createdAt), 'dd/MM/yyyy HH:mm', { locale: ptBR })}</span>
                  <span className="font-medium">{formatKwanza(Number(payment.amount))}</span>
                </div>
              ))}
            </div>
          ) : <p className="text-sm text-muted-foreground">Nenhum pagamento registado.</p>}
        </div>
      </CardContent>
    </Card>
  );
}