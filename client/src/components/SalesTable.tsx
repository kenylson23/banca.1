import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { formatKwanza } from '@/lib/formatters';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import type { Order } from '@shared/schema';

interface SalesTableProps {
  dateFilter: string;
  customDateRange: { from: Date | undefined; to: Date | undefined };
  periodFilter: string;
  orderByFilter: string;
  orderStatusFilter: string;
  paymentStatusFilter: string;
  orderTypeFilter: string;
}

const getOrderTypeLabel = (type: string) => {
  const labels: Record<string, string> = {
    mesa: 'Mesa',
    delivery: 'Delivery',
    takeout: 'Retirada',
    balcao: 'Balcão',
    pdv: 'PDV',
  };
  return labels[type] || type;
};

const getOrderStatusLabel = (status: string) => {
  const labels: Record<string, string> = {
    pendente: 'Pendente',
    em_preparo: 'Em preparação',
    pronto: 'Pronto',
    servido: 'Servido',
  };
  return labels[status] || status;
};

const getPaymentStatusLabel = (status: string) => {
  const labels: Record<string, string> = {
    nao_pago: 'Não pago',
    parcial: 'Parcial',
    pago: 'Pago',
  };
  return labels[status] || status;
};

const getOrderStatusVariant = (status: string): 'pending' | 'in-progress' | 'ready' | 'served' | 'default' => {
  const variants: Record<string, 'pending' | 'in-progress' | 'ready' | 'served' | 'default'> = {
    pendente: 'pending',
    em_preparo: 'in-progress',
    pronto: 'ready',
    servido: 'served',
  };
  return variants[status] || 'default';
};

const getPaymentStatusVariant = (status: string): 'success' | 'warning' | 'destructive' | 'default' => {
  const variants: Record<string, 'success' | 'warning' | 'destructive' | 'default'> = {
    nao_pago: 'destructive',
    parcial: 'warning',
    pago: 'success',
  };
  return variants[status] || 'default';
};

export function SalesTable({
  dateFilter,
  customDateRange,
  periodFilter,
  orderByFilter,
  orderStatusFilter,
  paymentStatusFilter,
  orderTypeFilter,
}: SalesTableProps) {
  const queryParams = new URLSearchParams({
    dateFilter,
    periodFilter,
    orderBy: orderByFilter,
    orderStatus: orderStatusFilter,
    paymentStatus: paymentStatusFilter,
    orderType: orderTypeFilter,
  });

  if (dateFilter === 'custom' && customDateRange.from) {
    queryParams.append('customFrom', customDateRange.from.toISOString());
    if (customDateRange.to) {
      queryParams.append('customTo', customDateRange.to.toISOString());
    }
  }

  const { data: orders, isLoading } = useQuery<Array<Order & { tableNumber?: number }>>({
    queryKey: ['/api/sales', queryParams.toString()],
    queryFn: async () => {
      const res = await fetch(`/api/sales?${queryParams.toString()}`);
      if (!res.ok) throw new Error('Failed to fetch sales');
      return res.json();
    },
  });

  return (
    <Card className="shadow-sm">
      <CardHeader className="border-b bg-muted/30">
        <CardTitle className="text-lg font-semibold">Detalhes de Vendas</CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        {isLoading ? (
          <div className="space-y-2 p-6">
            {[...Array(5)].map((_, i) => (
              <Skeleton key={i} className="h-16 w-full rounded-lg" />
            ))}
          </div>
        ) : orders && orders.length > 0 ? (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent border-b">
                  <TableHead className="w-[120px] font-semibold text-xs uppercase tracking-wide">#ID</TableHead>
                  <TableHead className="font-semibold text-xs uppercase tracking-wide">Origem</TableHead>
                  <TableHead className="font-semibold text-xs uppercase tracking-wide">Data</TableHead>
                  <TableHead className="font-semibold text-xs uppercase tracking-wide">Mesa</TableHead>
                  <TableHead className="font-semibold text-xs uppercase tracking-wide">Cliente</TableHead>
                  <TableHead className="font-semibold text-xs uppercase tracking-wide">Status Pedido</TableHead>
                  <TableHead className="font-semibold text-xs uppercase tracking-wide">Status Pag.</TableHead>
                  <TableHead className="text-right font-semibold text-xs uppercase tracking-wide">Total</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {orders.map((order) => (
                  <TableRow 
                    key={order.id} 
                    data-testid={`row-order-${order.id}`}
                    className="hover:bg-muted/50 transition-colors border-b last:border-0"
                  >
                    <TableCell className="font-mono text-xs font-medium text-muted-foreground" data-testid={`text-order-id-${order.id}`}>
                      #{order.id.substring(0, 8).toUpperCase()}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" data-testid={`badge-order-type-${order.id}`}>
                        {getOrderTypeLabel(order.orderType)}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm text-foreground" data-testid={`text-order-date-${order.id}`}>
                      {order.createdAt ? format(new Date(order.createdAt), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR }) : '-'}
                    </TableCell>
                    <TableCell className="text-sm font-medium" data-testid={`text-order-table-${order.id}`}>
                      {order.tableNumber ? `Mesa ${order.tableNumber}` : '-'}
                    </TableCell>
                    <TableCell className="text-sm" data-testid={`text-order-customer-${order.id}`}>
                      {order.customerName || '-'}
                    </TableCell>
                    <TableCell>
                      <Badge variant={getOrderStatusVariant(order.status)} data-testid={`badge-order-status-${order.id}`}>
                        {getOrderStatusLabel(order.status)}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant={getPaymentStatusVariant(order.paymentStatus)} data-testid={`badge-payment-status-${order.id}`}>
                        {getPaymentStatusLabel(order.paymentStatus)}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right font-semibold text-base" data-testid={`text-order-total-${order.id}`}>
                      {formatKwanza(parseFloat(order.totalAmount))}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        ) : (
          <div className="text-center py-16">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-muted/50 mb-4">
              <svg className="w-8 h-8 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
              </svg>
            </div>
            <p className="text-muted-foreground font-medium">Nenhuma venda encontrada</p>
            <p className="text-sm text-muted-foreground mt-1">Ajuste os filtros para ver mais resultados</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
