import { useState, useEffect, useCallback, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { SalesTable } from '@/components/SalesTable';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { Download, AlertCircle, DollarSign, ShoppingBag, TrendingUp, CreditCard, Package, CheckCircle } from 'lucide-react';
import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { format, startOfDay, endOfDay, subDays, startOfWeek, endOfWeek, startOfMonth, endOfMonth } from 'date-fns';
import { useWebSocket } from '@/hooks/useWebSocket';
import { queryClient } from '@/lib/queryClient';
import { motion } from 'framer-motion';
import { AdvancedKpiCard } from '@/components/advanced-kpi-card';
import { AdvancedSalesChart } from '@/components/advanced-sales-chart';
import { AdvancedFilters } from '@/components/advanced-filters';
import { ActivityFeed } from '@/components/activity-feed';
import { GoalsWidget } from '@/components/goals-widget';
import { DateRange } from 'react-day-picker';
import type { Order } from '@shared/schema';

type SalesReport = {
  totalSales: string;
  totalOrders: number;
  averageTicket: string;
  ordersByType: Array<{ type: string; count: number; revenue: string }>;
  ordersByStatus: Array<{ status: string; count: number }>;
  salesByDay: Array<{ date: string; sales: string; orders: number }>;
};

const typeLabels = {
  mesa: "Mesa",
  delivery: "Delivery",
  takeout: "Retirada",
};

const statusLabels = {
  pendente: "Pendente",
  em_preparo: "Em Preparo",
  pronto: "Pronto",
  servido: "Servido",
};

const CHART_COLORS = ['#0ea5e9', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

type FilterOption = "today" | "week" | "month" | "year";

export default function Sales() {
  const [quickFilter, setQuickFilter] = useState<FilterOption>("today");
  const [dateRange, setDateRange] = useState<DateRange | undefined>();
  const [showComparison, setShowComparison] = useState(false);
  const [orderStatusFilter, setOrderStatusFilter] = useState('all');
  const [paymentStatusFilter, setPaymentStatusFilter] = useState('all');
  const [orderTypeFilter, setOrderTypeFilter] = useState('all');

  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const handleQuickFilter = (filter: FilterOption) => {
    setQuickFilter(filter);
    setDateRange(undefined);
  };

  useEffect(() => {
    const now = new Date();
    let start: Date;
    let end: Date = endOfDay(now);

    if (dateRange?.from && dateRange?.to) {
      start = startOfDay(dateRange.from);
      end = endOfDay(dateRange.to);
    } else {
      switch (quickFilter) {
        case 'today':
          start = startOfDay(now);
          break;
        case 'week':
          start = startOfWeek(now);
          break;
        case 'month':
          start = startOfMonth(now);
          break;
        case 'year':
          start = startOfDay(subDays(now, 365));
          break;
        default:
          start = startOfDay(now);
      }
    }

    setStartDate(format(start, 'yyyy-MM-dd'));
    setEndDate(format(end, 'yyyy-MM-dd'));
  }, [quickFilter, dateRange]);

  const salesQueryParams = {
    startDate,
    endDate,
    status: orderStatusFilter !== 'all' ? orderStatusFilter : undefined,
    orderType: orderTypeFilter !== 'all' ? orderTypeFilter : undefined,
    paymentStatus: paymentStatusFilter !== 'all' ? paymentStatusFilter : undefined,
  };

  const { data: salesReport, isLoading: loadingSales, error: salesError } = useQuery<SalesReport>({
    queryKey: ['/api/reports/sales', salesQueryParams],
    enabled: !!startDate && !!endDate,
  });

  const historicalDays = useMemo(() => {
    if (dateRange?.from && dateRange?.to) {
      const diffTime = Math.abs(dateRange.to.getTime() - dateRange.from.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      return diffDays;
    }
    
    switch (quickFilter) {
      case "today":
        return 7;
      case "week":
        return 7;
      case "month":
        return 30;
      case "year":
        return 365;
      default:
        return 7;
    }
  }, [quickFilter, dateRange]);

  const { data: historicalData, isLoading: historicalLoading } = useQuery<Array<{ date: string; sales: number; orders: number }>>({
    queryKey: ["/api/stats/historical", historicalDays],
    queryFn: async () => {
      const response = await fetch(`/api/stats/historical?days=${historicalDays}`);
      if (!response.ok) throw new Error('Failed to fetch historical stats');
      return response.json();
    },
  });

  const { data: recentOrders, isLoading: ordersLoading } = useQuery<Array<Order & { table: { number: number } }>>({
    queryKey: ["/api/orders/recent"],
  });

  const handleWebSocketMessage = useCallback((message: any) => {
    if (message.type === 'new_order' || message.type === 'order_status_updated') {
      queryClient.invalidateQueries({ 
        predicate: (query) => {
          const key = Array.isArray(query.queryKey) ? query.queryKey[0] : query.queryKey;
          return key === '/api/reports/sales' || 
                 key === '/api/stats/historical' || 
                 key === '/api/orders/recent' ||
                 key === '/api/sales';
        }
      });
    }
  }, []);

  useWebSocket(handleWebSocketMessage);

  const sparklineData = useMemo(() => {
    if (!historicalData || historicalData.length === 0) return undefined;
    return historicalData.slice(-7).map(d => d.sales);
  }, [historicalData]);

  const salesChartData = useMemo(() => {
    return (salesReport?.salesByDay || []).map(d => ({
      date: d.date,
      sales: parseFloat(d.sales),
      orders: d.orders,
    }));
  }, [salesReport]);

  const mockActivities = useMemo(() => {
    if (!recentOrders || recentOrders.length === 0) return [];
    
    return recentOrders.slice(0, 8).map((order) => {
      const amount = typeof order.totalAmount === 'number' 
        ? order.totalAmount 
        : parseFloat(order.totalAmount?.toString() || '0');
      
      return {
        id: order.id.toString(),
        type: "order" as const,
        title: `Pedido #${order.id}`,
        description: `Mesa ${order.table?.number || 'N/A'} - ${statusLabels[order.status as keyof typeof statusLabels]}`,
        timestamp: order.createdAt ? new Date(order.createdAt) : new Date(),
        status: order.status === "servido" ? "success" as const : "info" as const,
        value: `Kz ${amount.toFixed(2)}`,
      };
    });
  }, [recentOrders]);

  const mockGoals = useMemo(() => {
    if (!salesReport) return [];
    
    const salesTarget = 50000;
    const ordersTarget = 100;
    
    return [
      {
        id: "sales-goal",
        title: "Meta de Vendas",
        current: parseFloat(salesReport.totalSales || "0"),
        target: salesTarget,
        unit: "currency" as const,
        period: dateRange?.from && dateRange?.to ? "Período personalizado" : "Hoje",
      },
      {
        id: "orders-goal",
        title: "Meta de Pedidos",
        current: salesReport.totalOrders || 0,
        target: ordersTarget,
        unit: "number" as const,
        period: dateRange?.from && dateRange?.to ? "Período personalizado" : "Hoje",
      },
    ];
  }, [salesReport, dateRange]);

  const exportSalesCSV = () => {
    if (!salesReport?.salesByDay || !startDate || !endDate) {
      console.error('Dados de vendas não disponíveis para exportação');
      return;
    }
    
    const headers = 'Data,Vendas,Pedidos';
    const rows = salesReport.salesByDay.map(row => {
      const sales = typeof row.sales === 'number' ? row.sales : (parseFloat(row.sales) || 0);
      const orders = row.orders || 0;
      return `${row.date},${sales.toFixed(2)},${orders}`;
    }).join('\n');

    const csv = `${headers}\n${rows}`;
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `vendas_${startDate}_${endDate}.csv`;
    link.click();
  };

  return (
    <div className="min-h-screen">
      <div className="space-y-6 p-4 sm:p-6 lg:p-8">
        <motion.div
          className="space-y-4"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="flex flex-col gap-2">
            <h1 className="text-4xl sm:text-5xl font-bold tracking-tight bg-gradient-to-r from-primary via-primary/80 to-primary/60 bg-clip-text text-transparent">
              Relatório de Vendas
            </h1>
            <p className="text-base text-muted-foreground">
              {dateRange?.from && dateRange?.to 
                ? `Análise detalhada do período personalizado`
                : `Monitore suas vendas em tempo real • ${new Date().toLocaleDateString('pt-AO', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}`
              }
            </p>
          </div>

          <AdvancedFilters
            quickFilter={quickFilter}
            onQuickFilterChange={handleQuickFilter}
            dateRange={dateRange}
            onDateRangeChange={setDateRange}
            showComparison={showComparison}
            onToggleComparison={() => setShowComparison(!showComparison)}
            onRefresh={() => {
              queryClient.invalidateQueries({ 
                predicate: (query) => {
                  const key = Array.isArray(query.queryKey) ? query.queryKey[0] : query.queryKey;
                  return key === '/api/reports/sales' || 
                         key === '/api/stats/historical' || 
                         key === '/api/orders/recent' ||
                         key === '/api/sales';
                }
              });
            }}
            isLoading={loadingSales}
          />
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
          {loadingSales ? (
            <>
              {[...Array(4)].map((_, i) => (
                <Skeleton key={i} className="h-[180px] w-full rounded-lg" />
              ))}
            </>
          ) : (
            <>
              <AdvancedKpiCard
                title="Vendas Totais"
                value={parseFloat(salesReport?.totalSales || "0")}
                prefix="Kz "
                decimals={2}
                icon={DollarSign}
                sparklineData={sparklineData}
                gradient="from-success/10 via-success/5 to-transparent"
                delay={0}
                data-testid="card-kpi-sales"
              />

              <AdvancedKpiCard
                title="Total de Pedidos"
                value={salesReport?.totalOrders || 0}
                icon={ShoppingBag}
                sparklineData={sparklineData?.map((_, i) => historicalData?.[i]?.orders || 0)}
                gradient="from-primary/10 via-primary/5 to-transparent"
                delay={0.1}
                data-testid="card-kpi-orders"
              />

              <AdvancedKpiCard
                title="Ticket Médio"
                value={parseFloat(salesReport?.averageTicket || "0")}
                prefix="Kz "
                decimals={2}
                icon={TrendingUp}
                gradient="from-warning/10 via-warning/5 to-transparent"
                delay={0.2}
                data-testid="card-kpi-avg-ticket"
              />

              <AdvancedKpiCard
                title="Pedidos Completos"
                value={salesReport?.ordersByStatus?.find(s => s.status === 'servido')?.count || 0}
                icon={CheckCircle}
                gradient="from-info/10 via-info/5 to-transparent"
                delay={0.3}
                data-testid="card-kpi-completed"
              />
            </>
          )}
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          <div className="xl:col-span-2 space-y-6">
            {historicalLoading || loadingSales ? (
              <Skeleton className="h-[400px] w-full rounded-lg" />
            ) : salesError ? (
              <Card>
                <CardContent className="pt-6">
                  <div className="flex flex-col items-center justify-center py-12 text-center">
                    <AlertCircle className="h-12 w-12 text-destructive mb-4" data-testid="icon-error" />
                    <h3 className="text-lg font-semibold mb-2">Erro ao carregar dados</h3>
                    <p className="text-muted-foreground">
                      Não foi possível carregar os dados de vendas. Tente novamente mais tarde.
                    </p>
                  </div>
                </CardContent>
              </Card>
            ) : !salesReport || !salesReport.salesByDay?.length ? (
              <Card>
                <CardContent className="pt-6">
                  <div className="flex flex-col items-center justify-center py-12 text-center">
                    <AlertCircle className="h-12 w-12 text-muted-foreground mb-4" data-testid="icon-no-data" />
                    <h3 className="text-lg font-semibold mb-2">Nenhum dado disponível</h3>
                    <p className="text-muted-foreground">
                      Não há vendas registradas no período selecionado.
                    </p>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <>
                <div className="relative">
                  <Button 
                    size="sm" 
                    variant="outline" 
                    onClick={exportSalesCSV} 
                    data-testid="button-export-sales"
                    className="absolute top-2 right-2 z-10"
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Exportar CSV
                  </Button>
                  <AdvancedSalesChart
                    data={salesChartData}
                    showComparison={showComparison}
                    title="Evolução de Vendas e Pedidos"
                  />
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base sm:text-lg">Vendas por Tipo de Pedido</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ResponsiveContainer width="100%" height={300}>
                        <PieChart>
                          <Pie
                            data={salesReport?.ordersByType || []}
                            dataKey="revenue"
                            nameKey="type"
                            cx="50%"
                            cy="50%"
                            outerRadius={100}
                            label={(entry) => `${typeLabels[entry.type as keyof typeof typeLabels]}: Kz ${Number(entry.revenue).toFixed(2)}`}
                          >
                            {(salesReport?.ordersByType || []).map((_: any, index: number) => (
                              <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                            ))}
                          </Pie>
                          <Tooltip formatter={(value: any) => `Kz ${Number(value).toFixed(2)}`} />
                        </PieChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base sm:text-lg">Pedidos por Status</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={salesReport?.ordersByStatus || []}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis 
                            dataKey="status" 
                            tickFormatter={(status) => statusLabels[status as keyof typeof statusLabels]} 
                            tick={{fontSize: 12}} 
                          />
                          <YAxis tick={{fontSize: 12}} />
                          <Tooltip labelFormatter={(status) => statusLabels[status as keyof typeof statusLabels]} />
                          <Legend wrapperStyle={{fontSize: '12px'}} />
                          <Bar dataKey="count" fill="#10b981" name="Quantidade" />
                        </BarChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>
                </div>
              </>
            )}
          </div>

          <div className="space-y-6">
            <GoalsWidget goals={mockGoals} />
            <ActivityFeed activities={mockActivities} maxHeight={400} />
          </div>
        </div>

        {salesReport && salesReport.salesByDay?.length > 0 && startDate && endDate && (
          <SalesTable
            dateFilter={
              (dateRange?.from && dateRange?.to) || quickFilter !== "today"
                ? "custom" 
                : "today"
            }
            customDateRange={{ 
              from: dateRange?.from || (quickFilter !== "today" && startDate ? new Date(startDate) : undefined), 
              to: dateRange?.to || (quickFilter !== "today" && endDate ? new Date(endDate) : undefined)
            }}
            periodFilter="all"
            orderByFilter="created"
            orderStatusFilter={orderStatusFilter}
            paymentStatusFilter={paymentStatusFilter}
            orderTypeFilter={orderTypeFilter}
          />
        )}
      </div>
    </div>
  );
}
