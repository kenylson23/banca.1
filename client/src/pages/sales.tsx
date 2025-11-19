import { useState, useEffect, useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import { SalesKPIs } from '@/components/SalesKPIs';
import { SalesFilters } from '@/components/SalesFilters';
import { SalesTable } from '@/components/SalesTable';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { Download, AlertCircle } from 'lucide-react';
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { format, startOfDay, endOfDay, subDays, startOfWeek, endOfWeek, startOfMonth, endOfMonth } from 'date-fns';
import { useWebSocket } from '@/hooks/useWebSocket';
import { queryClient } from '@/lib/queryClient';
import { motion } from 'framer-motion';

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

export default function Sales() {
  const [dateFilter, setDateFilter] = useState('today');
  const [customDateRange, setCustomDateRange] = useState<{ from: Date | undefined; to: Date | undefined }>({
    from: undefined,
    to: undefined,
  });
  const [periodFilter, setPeriodFilter] = useState('all');
  const [orderByFilter, setOrderByFilter] = useState('created');
  const [orderStatusFilter, setOrderStatusFilter] = useState('all');
  const [paymentStatusFilter, setPaymentStatusFilter] = useState('all');
  const [orderTypeFilter, setOrderTypeFilter] = useState('all');

  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  useEffect(() => {
    const now = new Date();
    let start: Date;
    let end: Date = endOfDay(now);

    switch (dateFilter) {
      case 'today':
        start = startOfDay(now);
        break;
      case 'yesterday':
        start = startOfDay(subDays(now, 1));
        end = endOfDay(subDays(now, 1));
        break;
      case 'last7days':
        start = startOfDay(subDays(now, 7));
        break;
      case 'last30days':
        start = startOfDay(subDays(now, 30));
        break;
      case 'thisWeek':
        start = startOfWeek(now);
        break;
      case 'thisMonth':
        start = startOfMonth(now);
        break;
      case 'custom':
        if (customDateRange.from) {
          start = startOfDay(customDateRange.from);
          end = customDateRange.to ? endOfDay(customDateRange.to) : endOfDay(now);
        } else {
          start = startOfDay(subDays(now, 7));
        }
        break;
      default:
        start = startOfDay(now);
    }

    setStartDate(format(start, 'yyyy-MM-dd'));
    setEndDate(format(end, 'yyyy-MM-dd'));
  }, [dateFilter, customDateRange]);

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

  const handleWebSocketMessage = useCallback((message: any) => {
    if (message.type === 'new_order' || message.type === 'order_status_updated') {
      queryClient.invalidateQueries({ 
        predicate: (query) => query.queryKey[0] === '/api/reports/sales'
      });
    }
  }, []);

  useWebSocket(handleWebSocketMessage);

  const exportSalesCSV = () => {
    if (!salesReport?.salesByDay) return;
    
    const headers = 'Data,Vendas,Pedidos';
    const rows = salesReport.salesByDay.map(row => 
      `${row.date},${row.sales},${row.orders}`
    ).join('\n');

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
          className="space-y-2"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="text-4xl sm:text-5xl font-bold tracking-tight bg-gradient-to-r from-primary via-primary/80 to-primary/60 bg-clip-text text-transparent">
            Vendas
          </h1>
          <p className="text-base text-muted-foreground mt-1">
            Monitore suas vendas em tempo real com indicadores e análises detalhadas
          </p>
        </motion.div>

      <SalesFilters
        dateFilter={dateFilter}
        onDateFilterChange={setDateFilter}
        customDateRange={customDateRange}
        onCustomDateRangeChange={setCustomDateRange}
        periodFilter={periodFilter}
        onPeriodFilterChange={setPeriodFilter}
        orderByFilter={orderByFilter}
        onOrderByFilterChange={setOrderByFilter}
        orderStatusFilter={orderStatusFilter}
        onOrderStatusFilterChange={setOrderStatusFilter}
        paymentStatusFilter={paymentStatusFilter}
        onPaymentStatusFilterChange={setPaymentStatusFilter}
        orderTypeFilter={orderTypeFilter}
        onOrderTypeFilterChange={setOrderTypeFilter}
      />

      <SalesKPIs
        dateFilter={dateFilter}
        customDateRange={customDateRange}
        periodFilter={periodFilter}
        orderByFilter={orderByFilter}
        orderStatusFilter={orderStatusFilter}
        paymentStatusFilter={paymentStatusFilter}
        orderTypeFilter={orderTypeFilter}
      />

      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-semibold">Análise Gráfica</h2>
        </div>

        {loadingSales ? (
          <div className="space-y-4">
            <Skeleton className="h-[400px] w-full" />
            <div className="grid gap-4 md:grid-cols-2">
              <Skeleton className="h-[350px] w-full" />
              <Skeleton className="h-[350px] w-full" />
            </div>
          </div>
        ) : salesError ? (
          <Card>
            <CardContent className="pt-6">
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <AlertCircle className="h-12 w-12 text-destructive mb-4" />
                <h3 className="text-lg font-semibold mb-2">Erro ao carregar dados</h3>
                <p className="text-muted-foreground">
                  Não foi possível carregar os dados de vendas. Tente novamente mais tarde.
                </p>
              </div>
            </CardContent>
          </Card>
        ) : !salesReport || (!salesReport.salesByDay?.length && !salesReport.ordersByType?.length) ? (
          <Card>
            <CardContent className="pt-6">
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <AlertCircle className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">Nenhum dado disponível</h3>
                <p className="text-muted-foreground">
                  Não há vendas registradas no período selecionado.
                </p>
              </div>
            </CardContent>
          </Card>
        ) : (
          <>
            <Card>
              <CardHeader className="flex flex-col sm:flex-row gap-2 sm:items-center sm:justify-between space-y-0 pb-2">
                <CardTitle className="text-base sm:text-lg">Vendas por Dia</CardTitle>
                <Button 
                  size="sm" 
                  variant="outline" 
                  onClick={exportSalesCSV} 
                  data-testid="button-export-sales"
                  className="w-full sm:w-auto"
                >
                  <Download className="h-4 w-4 mr-2" />
                  Exportar
                </Button>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={350}>
                  <LineChart data={salesReport?.salesByDay || []}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis 
                      dataKey="date" 
                      tickFormatter={(date) => format(new Date(date), 'dd/MM')} 
                      tick={{fontSize: 12}} 
                    />
                    <YAxis tick={{fontSize: 12}} />
                    <Tooltip 
                      labelFormatter={(date) => format(new Date(date), 'dd/MM/yyyy')}
                      formatter={(value: any) => [`Kz ${Number(value).toFixed(2)}`, 'Vendas']}
                    />
                    <Legend wrapperStyle={{fontSize: '12px'}} />
                    <Line type="monotone" dataKey="sales" stroke="#0ea5e9" name="Vendas" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

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

      <SalesTable
        dateFilter={dateFilter}
        customDateRange={customDateRange}
        periodFilter={periodFilter}
        orderByFilter={orderByFilter}
        orderStatusFilter={orderStatusFilter}
        paymentStatusFilter={paymentStatusFilter}
        orderTypeFilter={orderTypeFilter}
      />
      </div>
    </div>
  );
}
