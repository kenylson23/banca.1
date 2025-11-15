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

const getOrderStatusVariant = (status: string): 'default' | 'secondary' | 'destructive' | 'outline' => {
  const variants: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
    pendente: 'outline',
    em_preparo: 'default',
    pronto: 'secondary',
    servido: 'secondary',
  };
  return variants[status] || 'default';
};

const getPaymentStatusVariant = (status: string): 'default' | 'secondary' | 'destructive' | 'outline' => {
  const variants: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
    nao_pago: 'destructive',
    parcial: 'outline',
    pago: 'secondary',
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
    <Card>
      <CardHeader>
        <CardTitle>Detalhes de Vendas</CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-2">
            {[...Array(5)].map((_, i) => (
              <Skeleton key={i} className="h-16 w-full" />
            ))}
          </div>
        ) : orders && orders.length > 0 ? (
          <div className="rounded-md border overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[100px]">#ID</TableHead>
                  <TableHead>Origem</TableHead>
                  <TableHead>Data</TableHead>
                  <TableHead>Mesa</TableHead>
                  <TableHead>Cliente</TableHead>
                  <TableHead>Status Pedido</TableHead>
                  <TableHead>Status Pag.</TableHead>
                  <TableHead className="text-right">Total</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {orders.map((order) => (
                  <TableRow key={order.id} data-testid={`row-order-${order.id}`}>
                    <TableCell className="font-mono text-xs" data-testid={`text-order-id-${order.id}`}>
                      #{order.id.substring(0, 8).toUpperCase()}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" data-testid={`badge-order-type-${order.id}`}>
                        {getOrderTypeLabel(order.orderType)}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm" data-testid={`text-order-date-${order.id}`}>
                      {order.createdAt ? format(new Date(order.createdAt), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR }) : '-'}
                    </TableCell>
                    <TableCell data-testid={`text-order-table-${order.id}`}>
                      {order.tableNumber ? `Mesa ${order.tableNumber}` : '-'}
                    </TableCell>
                    <TableCell data-testid={`text-order-customer-${order.id}`}>
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
                    <TableCell className="text-right font-semibold" data-testid={`text-order-total-${order.id}`}>
                      {formatKwanza(parseFloat(order.totalAmount))}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-muted-foreground">Nenhuma venda encontrada para os filtros selecionados</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
