import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { TrendingUp, ShoppingCart, DollarSign, BarChart3 } from 'lucide-react';
import { formatKwanza } from '@/lib/formatters';

interface SalesKPIsProps {
  dateFilter: string;
  customDateRange: { from: Date | undefined; to: Date | undefined };
  periodFilter: string;
  orderByFilter: string;
  orderStatusFilter: string;
  paymentStatusFilter: string;
  orderTypeFilter: string;
}

interface SalesStats {
  totalOrders: number;
  totalRevenue: number;
  averageTicket: number;
  paidOrders: number;
  pendingOrders: number;
  cancelledOrders: number;
}

export function SalesKPIs({
  dateFilter,
  customDateRange,
  periodFilter,
  orderByFilter,
  orderStatusFilter,
  paymentStatusFilter,
  orderTypeFilter,
}: SalesKPIsProps) {
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

  const { data: stats, isLoading } = useQuery<SalesStats>({
    queryKey: ['/api/sales/stats', queryParams.toString()],
    queryFn: async () => {
      const res = await fetch(`/api/sales/stats?${queryParams.toString()}`);
      if (!res.ok) throw new Error('Failed to fetch sales stats');
      return res.json();
    },
  });

  if (isLoading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <Card key={i}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-4 w-4" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-8 w-32 mb-2" />
              <Skeleton className="h-3 w-40" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card data-testid="card-total-orders">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Total de Pedidos
          </CardTitle>
          <ShoppingCart className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold" data-testid="text-total-orders">
            {stats?.totalOrders || 0}
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            {stats?.paidOrders || 0} pagos • {stats?.pendingOrders || 0} pendentes
          </p>
        </CardContent>
      </Card>

      <Card data-testid="card-total-revenue">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Total Geral
          </CardTitle>
          <DollarSign className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-primary" data-testid="text-total-revenue">
            {formatKwanza(stats?.totalRevenue || 0)}
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Soma de todos os pedidos
          </p>
        </CardContent>
      </Card>

      <Card data-testid="card-average-ticket">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Ticket Médio
          </CardTitle>
          <TrendingUp className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold" data-testid="text-average-ticket">
            {formatKwanza(stats?.averageTicket || 0)}
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Por pedido
          </p>
        </CardContent>
      </Card>

      <Card data-testid="card-cancelled-orders">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Anulações
          </CardTitle>
          <BarChart3 className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold" data-testid="text-cancelled-orders">
            {stats?.cancelledOrders || 0}
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Pedidos cancelados
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
