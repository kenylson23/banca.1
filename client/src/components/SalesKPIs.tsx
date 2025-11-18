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
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <Card key={i} className="shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
              <Skeleton className="h-5 w-28" />
              <Skeleton className="h-10 w-10 rounded-lg" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-9 w-36 mb-2" />
              <Skeleton className="h-4 w-44" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
      <Card data-testid="card-total-orders" className="shadow-sm hover:shadow-md transition-shadow">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
          <CardTitle className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
            Total de Pedidos
          </CardTitle>
          <div className="p-2.5 rounded-lg bg-primary/10">
            <ShoppingCart className="h-5 w-5 text-primary" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold tracking-tight" data-testid="text-total-orders">
            {stats?.totalOrders || 0}
          </div>
          <p className="text-sm text-muted-foreground mt-2 flex items-center gap-2">
            <span className="inline-flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-success"></span>
              {stats?.paidOrders || 0} pagos
            </span>
            <span>•</span>
            <span className="inline-flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-warning"></span>
              {stats?.pendingOrders || 0} pendentes
            </span>
          </p>
        </CardContent>
      </Card>

      <Card data-testid="card-total-revenue" className="shadow-sm hover:shadow-md transition-shadow border-primary/20">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
          <CardTitle className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
            Total Geral
          </CardTitle>
          <div className="p-2.5 rounded-lg bg-success/10">
            <DollarSign className="h-5 w-5 text-success" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold text-primary tracking-tight" data-testid="text-total-revenue">
            {formatKwanza(stats?.totalRevenue || 0)}
          </div>
          <p className="text-sm text-muted-foreground mt-2">
            Soma de todos os pedidos
          </p>
        </CardContent>
      </Card>

      <Card data-testid="card-average-ticket" className="shadow-sm hover:shadow-md transition-shadow">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
          <CardTitle className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
            Ticket Médio
          </CardTitle>
          <div className="p-2.5 rounded-lg bg-info/10">
            <TrendingUp className="h-5 w-5 text-info" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold tracking-tight" data-testid="text-average-ticket">
            {formatKwanza(stats?.averageTicket || 0)}
          </div>
          <p className="text-sm text-muted-foreground mt-2">
            Por pedido
          </p>
        </CardContent>
      </Card>

      <Card data-testid="card-cancelled-orders" className="shadow-sm hover:shadow-md transition-shadow">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
          <CardTitle className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
            Anulações
          </CardTitle>
          <div className="p-2.5 rounded-lg bg-destructive/10">
            <BarChart3 className="h-5 w-5 text-destructive" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold tracking-tight" data-testid="text-cancelled-orders">
            {stats?.cancelledOrders || 0}
          </div>
          <p className="text-sm text-muted-foreground mt-2">
            Pedidos cancelados
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
