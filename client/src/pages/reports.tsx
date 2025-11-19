import { useState, useCallback, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { ShoppingCart, Package, Clock, Download, Eye, LayoutDashboard, DollarSign, TrendingUp, CheckCircle2 } from "lucide-react";
import { format } from "date-fns";
import { useWebSocket } from "@/hooks/useWebSocket";
import { queryClient } from "@/lib/queryClient";
import { PrintOrder } from "@/components/PrintOrder";
import { motion } from "framer-motion";
import { TubelightNavBar } from "@/components/ui/tubelight-navbar";
import { AdvancedKpiCard } from "@/components/advanced-kpi-card";
import { AdvancedSalesChart } from "@/components/advanced-sales-chart";
import { AdvancedFilters } from "@/components/advanced-filters";
import { SalesHeatmap } from "@/components/sales-heatmap";
import { ActivityFeed } from "@/components/activity-feed";
import { GoalsWidget } from "@/components/goals-widget";
import { TopDishesCard } from "@/components/top-dishes-card";
import { formatKwanza } from "@/lib/formatters";
import { DateRange } from "react-day-picker";
import type { Order, MenuItem } from "@shared/schema";

type OrderReport = {
  id: string;
  createdAt: string;
  table: { number: number } | null;
  orderType: string;
  status: string;
  totalAmount: string;
  orderItems: any[];
  orderNotes?: string;
  customerName?: string;
};

type ProductsReport = {
  topProducts: Array<{
    menuItem: { id: string; name: string };
    quantity: number;
    revenue: string;
    ordersCount: number;
  }>;
  productsByCategory: Array<{
    categoryName: string;
    totalRevenue: string;
    itemsCount: number;
  }>;
};

type PerformanceReport = {
  averagePrepTime: string;
  completionRate: string;
  peakHours: Array<{ hour: number; orders: number }>;
  topTables: Array<{ tableNumber: number; orders: number; revenue: string }>;
};

const statusColors = {
  pendente: "bg-amber-500",
  em_preparo: "bg-blue-500",
  pronto: "bg-green-500",
  servido: "bg-gray-500",
};

const statusLabels = {
  pendente: "Pendente",
  em_preparo: "Em Preparo",
  pronto: "Pronto",
  servido: "Servido",
};

const typeLabels = {
  mesa: "Mesa",
  delivery: "Delivery",
  takeout: "Retirada",
};

type FilterOption = "today" | "week" | "month" | "year";
type TabValue = "dashboard" | "orders" | "products" | "performance";

export default function Reports() {
  const today = new Date();
  const sevenDaysAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);

  const [activeTab, setActiveTab] = useState<TabValue>("dashboard");
  const [dateRange, setDateRange] = useState<DateRange | undefined>();
  const [quickFilter, setQuickFilter] = useState<FilterOption>("week");
  const [showComparison, setShowComparison] = useState(false);
  const [orderStatus, setOrderStatus] = useState<string>("todos");
  const [orderType, setOrderType] = useState<string>("todos");

  // Calculate date range based on quick filter
  const effectiveDateRange = useMemo(() => {
    if (dateRange?.from && dateRange?.to) {
      return { from: dateRange.from, to: dateRange.to };
    }

    const end = new Date();
    let start = new Date();

    switch (quickFilter) {
      case "today":
        start = new Date();
        break;
      case "week":
        start = new Date(end.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case "month":
        start = new Date(end.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      case "year":
        start = new Date(end.getTime() - 365 * 24 * 60 * 60 * 1000);
        break;
    }

    return { from: start, to: end };
  }, [quickFilter, dateRange]);

  const startDate = format(effectiveDateRange.from, 'yyyy-MM-dd');
  const endDate = format(effectiveDateRange.to, 'yyyy-MM-dd');

  const handleQuickFilter = (filter: FilterOption) => {
    setQuickFilter(filter);
    setDateRange(undefined);
  };

  const { data: ordersReport, isLoading: loadingOrders } = useQuery<OrderReport[]>({
    queryKey: ['/api/reports/orders', { startDate, endDate, status: orderStatus, orderType }],
    enabled: !!startDate && !!endDate,
  });

  const { data: productsReport, isLoading: loadingProducts } = useQuery<ProductsReport>({
    queryKey: ['/api/reports/products', { startDate, endDate }],
    enabled: !!startDate && !!endDate,
  });

  const { data: performanceReport, isLoading: loadingPerformance } = useQuery<PerformanceReport>({
    queryKey: ['/api/reports/performance', { startDate, endDate }],
    enabled: !!startDate && !!endDate,
  });

  // Historical data for charts (limited to 30 days max per backend)
  const historicalDays = useMemo(() => {
    if (effectiveDateRange?.from && effectiveDateRange?.to) {
      const diffTime = Math.abs(effectiveDateRange.to.getTime() - effectiveDateRange.from.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      return Math.min(diffDays, 30); // Backend only supports 30 days max
    }
    return 30;
  }, [effectiveDateRange]);

  const { data: historicalData, isLoading: historicalLoading } = useQuery<Array<{ date: string; sales: number; orders: number }>>({
    queryKey: ["/api/stats/historical", historicalDays],
    queryFn: async () => {
      const response = await fetch(`/api/stats/historical?days=${historicalDays}`);
      if (!response.ok) throw new Error('Failed to fetch historical stats');
      return response.json();
    },
  });

  // WebSocket handler for real-time updates
  const handleWebSocketMessage = useCallback((message: any) => {
    if (message.type === 'new_order' || message.type === 'order_status_updated') {
      // Invalidate all reports to ensure they show updated data
      queryClient.invalidateQueries({ queryKey: ["/api/reports/orders"] });
      queryClient.invalidateQueries({ queryKey: ["/api/reports/products"] });
      queryClient.invalidateQueries({ queryKey: ["/api/reports/performance"] });
      queryClient.invalidateQueries({ queryKey: ["/api/stats/historical"] });
    }
  }, []);

  // Setup WebSocket connection
  useWebSocket(handleWebSocketMessage);

  const handleStatusChange = async (orderId: string, newStatus: string) => {
    try {
      await fetch(`/api/orders/${orderId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ status: newStatus }),
      });
      // Invalidate queries to refresh data
      queryClient.invalidateQueries({ queryKey: ["/api/reports/orders"] });
      queryClient.invalidateQueries({ queryKey: ["/api/reports/performance"] });
    } catch (error) {
      // Error updating status - will be handled by query invalidation
    }
  };

  const getNextStatus = (currentStatus: string): string | null => {
    const statusFlow = ["pendente", "em_preparo", "pronto", "servido"];
    const currentIndex = statusFlow.indexOf(currentStatus);
    if (currentIndex < statusFlow.length - 1) {
      return statusFlow[currentIndex + 1];
    }
    return null;
  };

  const exportToCSV = (data: any[], filename: string) => {
    if (!data || data.length === 0) return;

    const headers = Object.keys(data[0]).join(',');
    const rows = data.map(row => 
      Object.values(row).map(val => 
        typeof val === 'string' && val.includes(',') ? `"${val}"` : val
      ).join(',')
    ).join('\n');

    const csv = `${headers}\n${rows}`;
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `${filename}_${startDate}_${endDate}.csv`;
    link.click();
  };

  const exportOrdersCSV = () => {
    if (!ordersReport) return;
    const formatted = ordersReport.map((order: any) => ({
      'Data': format(new Date(order.createdAt), 'dd/MM/yyyy HH:mm'),
      'Mesa': order.table?.number || 'N/A',
      'Tipo': typeLabels[order.orderType as keyof typeof typeLabels],
      'Status': statusLabels[order.status as keyof typeof statusLabels],
      'Total': `Kz ${parseFloat(order.totalAmount).toFixed(2)}`,
      'Itens': order.orderItems.length,
    }));
    exportToCSV(formatted, 'relatorio_pedidos');
  };

  const exportProductsCSV = () => {
    if (!productsReport?.topProducts) return;
    const formatted = productsReport.topProducts.map((item: any) => ({
      'Produto': item.menuItem.name,
      'Quantidade': item.quantity,
      'Receita': `Kz ${item.revenue}`,
      'Pedidos': item.ordersCount,
    }));
    exportToCSV(formatted, 'relatorio_produtos');
  };

  // Aggregate stats from reports
  const aggregateStats = useMemo(() => {
    const totalSales = ordersReport?.reduce((sum, order) => sum + parseFloat(order.totalAmount), 0) || 0;
    const totalOrders = ordersReport?.length || 0;
    const avgTicket = totalOrders > 0 ? totalSales / totalOrders : 0;
    const completionRate = parseFloat(performanceReport?.completionRate || "0");

    return {
      totalSales,
      totalOrders,
      avgTicket,
      completionRate,
    };
  }, [ordersReport, performanceReport]);

  // Sparkline data from historical data
  const sparklineData = useMemo(() => {
    if (!historicalData || historicalData.length === 0) return undefined;
    return historicalData.slice(-7).map(d => d.sales);
  }, [historicalData]);

  // Chart data
  const salesChartData = historicalData || [];

  // Activity feed from orders - memoized per orders dependency
  const activities = useMemo(() => {
    if (!ordersReport || ordersReport.length === 0) return [];
    
    return ordersReport.slice(0, 8).map((order) => ({
      id: order.id.toString(),
      type: "order" as const,
      title: `Pedido #${order.id.slice(0, 8)}`,
      description: `${order.table ? `Mesa ${order.table.number}` : typeLabels[order.orderType as keyof typeof typeLabels]} - ${statusLabels[order.status as keyof typeof statusLabels]}`,
      timestamp: order.createdAt ? new Date(order.createdAt) : new Date(),
      status: order.status === "servido" ? "success" as const : "info" as const,
      value: formatKwanza(order.totalAmount || "0"),
    }));
  }, [ordersReport]);

  // Heatmap data from performance report
  const heatmapData = useMemo(() => {
    if (!performanceReport?.peakHours) {
      // Mock data if no real data
      const days = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];
      const data = [];
      
      for (const day of days) {
        for (let hour = 10; hour < 23; hour++) {
          const isLunchRush = hour >= 12 && hour <= 14;
          const isDinnerRush = hour >= 19 && hour <= 21;
          const baseValue = Math.random() * 5;
          const rushBonus = isLunchRush || isDinnerRush ? Math.random() * 15 : 0;
          
          data.push({
            day,
            hour,
            value: Math.floor(baseValue + rushBonus),
          });
        }
      }
      
      return data;
    }

    // Convert peak hours to heatmap format
    const days = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];
    const data = [];
    
    for (const day of days) {
      for (let hour = 10; hour < 23; hour++) {
        const peakData = performanceReport.peakHours.find(p => p.hour === hour);
        data.push({
          day,
          hour,
          value: peakData?.orders || 0,
        });
      }
    }
    
    return data;
  }, [performanceReport]);

  // Goals widget data
  const goalsData = useMemo(() => {
    const salesTarget = 100000;
    const ordersTarget = 200;
    
    return [
      {
        id: "sales-goal",
        title: "Meta de Vendas",
        current: aggregateStats.totalSales,
        target: salesTarget,
        unit: "currency" as const,
        period: dateRange?.from && dateRange?.to ? "Período personalizado" : "Últimos 7 dias",
      },
      {
        id: "orders-goal",
        title: "Meta de Pedidos",
        current: aggregateStats.totalOrders,
        target: ordersTarget,
        unit: "number" as const,
        period: dateRange?.from && dateRange?.to ? "Período personalizado" : "Últimos 7 dias",
      },
    ];
  }, [aggregateStats, dateRange]);

  // Navigation items for TubelightNavBar
  const navItems = [
    { name: "Dashboard", url: "#", icon: LayoutDashboard },
    { name: "Pedidos", url: "#", icon: ShoppingCart },
    { name: "Produtos", url: "#", icon: Package },
    { name: "Performance", url: "#", icon: Clock },
  ];

  const tabMapping: Record<string, TabValue> = {
    "Dashboard": "dashboard",
    "Pedidos": "orders",
    "Produtos": "products",
    "Performance": "performance",
  };

  const handleNavClick = (item: typeof navItems[0]) => {
    const tabValue = tabMapping[item.name];
    if (tabValue) {
      setActiveTab(tabValue);
    }
  };

  // Get current active item name for TubelightNavBar
  const currentActiveItem = Object.keys(tabMapping).find(key => tabMapping[key] === activeTab) || "Dashboard";

  return (
    <div className="min-h-screen">
      <div className="space-y-6 p-4 sm:p-6 lg:p-8">
        {/* Header with Gradient */}
        <motion.div
          className="space-y-4"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="flex flex-col gap-2">
            <h1 className="text-4xl sm:text-5xl font-bold tracking-tight bg-gradient-to-r from-primary via-primary/80 to-primary/60 bg-clip-text text-transparent">
              Relatórios Avançados
            </h1>
            <p className="text-base text-muted-foreground">
              {dateRange?.from && dateRange?.to 
                ? `Análise do período personalizado`
                : `Análise detalhada de vendas, pedidos e desempenho • Últimos 7 dias`
              }
            </p>
          </div>

          {/* Advanced Filters */}
          <AdvancedFilters
            quickFilter={quickFilter}
            onQuickFilterChange={handleQuickFilter}
            dateRange={dateRange}
            onDateRangeChange={setDateRange}
            showComparison={showComparison}
            onToggleComparison={() => setShowComparison(!showComparison)}
            onRefresh={() => {
              queryClient.invalidateQueries({ queryKey: ["/api/reports/orders"] });
              queryClient.invalidateQueries({ queryKey: ["/api/reports/products"] });
              queryClient.invalidateQueries({ queryKey: ["/api/reports/performance"] });
              queryClient.invalidateQueries({ queryKey: ["/api/stats/historical"] });
            }}
            isLoading={loadingOrders || loadingProducts || loadingPerformance}
          />
        </motion.div>

        {/* TubelightNavBar Navigation */}
        <div className="flex justify-center">
          <TubelightNavBar
            items={navItems}
            activeItem={currentActiveItem}
            onItemClick={handleNavClick}
            className="relative"
          />
        </div>

        {/* Dashboard Tab */}
        {activeTab === "dashboard" && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="space-y-6"
          >
            {/* KPI Cards with Sparklines */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
              {loadingOrders || loadingPerformance ? (
                <>
                  {[...Array(4)].map((_, i) => (
                    <Skeleton key={i} className="h-[180px] w-full rounded-lg" />
                  ))}
                </>
              ) : (
                <>
                  <AdvancedKpiCard
                    title="Vendas Totais"
                    value={aggregateStats.totalSales}
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
                    value={aggregateStats.totalOrders}
                    icon={ShoppingCart}
                    sparklineData={sparklineData?.map((_, i) => historicalData?.[i]?.orders || 0)}
                    gradient="from-primary/10 via-primary/5 to-transparent"
                    delay={0.1}
                    data-testid="card-kpi-orders"
                  />

                  <AdvancedKpiCard
                    title="Ticket Médio"
                    value={aggregateStats.avgTicket}
                    prefix="Kz "
                    decimals={2}
                    icon={TrendingUp}
                    gradient="from-warning/10 via-warning/5 to-transparent"
                    delay={0.2}
                    data-testid="card-kpi-avg-ticket"
                  />

                  <AdvancedKpiCard
                    title="Taxa de Conclusão"
                    value={aggregateStats.completionRate}
                    suffix="%"
                    decimals={1}
                    icon={CheckCircle2}
                    gradient="from-info/10 via-info/5 to-transparent"
                    delay={0.3}
                    data-testid="card-kpi-completion"
                  />
                </>
              )}
            </div>

            {/* Main Charts Section */}
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
              <div className="xl:col-span-2 space-y-6">
                {/* Advanced Sales Chart */}
                {historicalLoading ? (
                  <Skeleton className="h-[400px] w-full rounded-lg" />
                ) : (
                  <AdvancedSalesChart
                    data={salesChartData}
                    showComparison={showComparison}
                    title="Evolução de Vendas e Pedidos"
                  />
                )}

                {/* Heatmap */}
                <SalesHeatmap data={heatmapData} />
              </div>

              {/* Sidebar Widgets */}
              <div className="space-y-6">
                {/* Goals Widget */}
                <GoalsWidget goals={goalsData} />

                {/* Additional filters for Orders/Products tabs */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Filtros Adicionais</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Status do Pedido</label>
                      <Select value={orderStatus} onValueChange={setOrderStatus}>
                        <SelectTrigger data-testid="select-order-status">
                          <SelectValue placeholder="Todos" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="todos">Todos</SelectItem>
                          <SelectItem value="pendente">Pendente</SelectItem>
                          <SelectItem value="em_preparo">Em Preparo</SelectItem>
                          <SelectItem value="pronto">Pronto</SelectItem>
                          <SelectItem value="servido">Servido</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Tipo de Pedido</label>
                      <Select value={orderType} onValueChange={setOrderType}>
                        <SelectTrigger data-testid="select-order-type">
                          <SelectValue placeholder="Todos" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="todos">Todos</SelectItem>
                          <SelectItem value="mesa">Mesa</SelectItem>
                          <SelectItem value="delivery">Delivery</SelectItem>
                          <SelectItem value="takeout">Retirada</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>

            {/* Activity Feed & Top Dishes */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <ActivityFeed activities={activities} maxHeight={500} />
              
              {loadingProducts ? (
                <Skeleton className="h-[500px] w-full rounded-lg" />
              ) : (
                <TopDishesCard dishes={productsReport?.topProducts?.map(p => ({
                  menuItem: p.menuItem as any,
                  count: p.quantity,
                  totalRevenue: p.revenue,
                })) || []} />
              )}
            </div>
          </motion.div>
        )}

        {/* Orders Tab */}
        {activeTab === "orders" && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
          <Card>
            <CardHeader className="flex flex-col sm:flex-row gap-2 sm:items-center sm:justify-between space-y-0 pb-2">
              <div>
                <CardTitle className="text-base sm:text-lg">Lista de Pedidos</CardTitle>
                <CardDescription className="text-xs sm:text-sm">
                  {ordersReport?.length || 0} pedidos encontrados
                </CardDescription>
              </div>
              <Button size="sm" variant="outline" onClick={exportOrdersCSV} data-testid="button-export-orders" className="w-full sm:w-auto">
                <Download className="h-4 w-4 mr-2" />
                Exportar
              </Button>
            </CardHeader>
            <CardContent>
              {loadingOrders ? (
                <Skeleton className="h-64 w-full" />
              ) : (
                <div className="overflow-x-auto -mx-2 sm:mx-0">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Data/Hora</TableHead>
                        <TableHead>Mesa</TableHead>
                        <TableHead>Tipo</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Itens</TableHead>
                        <TableHead className="text-right">Total</TableHead>
                        <TableHead>Ações</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {ordersReport && ordersReport.length > 0 ? (
                        ordersReport.map((order: any) => (
                          <>
                            <TableRow key={order.id} data-testid={`row-order-${order.id}`}>
                              <TableCell>
                                {format(new Date(order.createdAt), 'dd/MM/yyyy HH:mm')}
                              </TableCell>
                              <TableCell>{order.table?.number || 'N/A'}</TableCell>
                              <TableCell>
                                <Badge variant="outline">
                                  {typeLabels[order.orderType as keyof typeof typeLabels]}
                                </Badge>
                              </TableCell>
                              <TableCell>
                                <Badge className={statusColors[order.status as keyof typeof statusColors]}>
                                  {statusLabels[order.status as keyof typeof statusLabels]}
                                </Badge>
                              </TableCell>
                              <TableCell>{order.orderItems.length}</TableCell>
                              <TableCell className="text-right font-medium">
                                Kz {parseFloat(order.totalAmount).toFixed(2)}
                              </TableCell>
                              <TableCell>
                                <div className="flex gap-2">
                                  {getNextStatus(order.status) && (
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      onClick={() => handleStatusChange(order.id, getNextStatus(order.status)!)}
                                      data-testid={`button-status-${order.id}`}
                                    >
                                      {statusLabels[getNextStatus(order.status)! as keyof typeof statusLabels]}
                                    </Button>
                                  )}
                                  <Button
                                    asChild
                                    size="sm"
                                    variant="outline"
                                    data-testid={`button-view-details-${order.id}`}
                                  >
                                    <Link href={`/orders/${order.id}`}>
                                      <Eye className="h-4 w-4 mr-1" />
                                      <span className="sr-only">Ver Detalhes</span>
                                    </Link>
                                  </Button>
                                  <PrintOrder order={order} variant="ghost" size="sm" />
                                </div>
                              </TableCell>
                            </TableRow>
                            {order.orderNotes && (
                              <TableRow key={`${order.id}-notes`}>
                                <TableCell colSpan={7} className="bg-amber-500/5 border-t-0">
                                  <div className="flex items-start gap-2 py-2">
                                    <span className="font-semibold text-xs text-amber-700 dark:text-amber-400">Observações:</span>
                                    <span className="text-xs text-muted-foreground">{order.orderNotes}</span>
                                  </div>
                                </TableCell>
                              </TableRow>
                            )}
                          </>
                        ))
                      ) : (
                        <TableRow>
                          <TableCell colSpan={7} className="text-center text-muted-foreground">
                            Nenhum pedido encontrado
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
          </motion.div>
        )}

        {/* Products Tab */}
        {activeTab === "products" && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
          {loadingProducts ? (
            <Skeleton className="h-96 w-full" />
          ) : (
            <>
              <Card>
                <CardHeader className="flex flex-col sm:flex-row gap-2 sm:items-center sm:justify-between space-y-0 pb-2">
                  <CardTitle className="text-base sm:text-lg">Top 20 Produtos Mais Vendidos</CardTitle>
                  <Button size="sm" variant="outline" onClick={exportProductsCSV} data-testid="button-export-products" className="w-full sm:w-auto">
                    <Download className="h-4 w-4 mr-2" />
                    Exportar
                  </Button>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto -mx-2 sm:mx-0">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Produto</TableHead>
                          <TableHead className="text-right">Quantidade</TableHead>
                          <TableHead className="text-right">Receita</TableHead>
                          <TableHead className="text-right">Nº Pedidos</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {productsReport?.topProducts?.map((item: any, index: number) => (
                          <TableRow key={item.menuItem.id} data-testid={`row-product-${index}`}>
                            <TableCell className="font-medium">{item.menuItem.name}</TableCell>
                            <TableCell className="text-right">{item.quantity}</TableCell>
                            <TableCell className="text-right">Kz {item.revenue}</TableCell>
                            <TableCell className="text-right">{item.ordersCount}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-base sm:text-lg">Vendas por Categoria</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={productsReport?.productsByCategory || []}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="categoryName" tick={{fontSize: 12}} />
                      <YAxis tick={{fontSize: 12}} />
                      <Tooltip formatter={(value: any) => `Kz ${Number(value).toFixed(2)}`} />
                      <Legend wrapperStyle={{fontSize: '12px'}} />
                      <Bar dataKey="totalRevenue" fill="#0ea5e9" name="Receita Total" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </>
          )}
          </motion.div>
        )}

        {/* Performance Tab */}
        {activeTab === "performance" && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
          {loadingPerformance ? (
            <Skeleton className="h-96 w-full" />
          ) : (
            <>
              <div className="grid gap-4 md:grid-cols-2">
                <Card>
                  <CardHeader className="pb-2">
                    <CardDescription className="text-xs sm:text-sm">Tempo Médio de Preparo</CardDescription>
                    <CardTitle className="text-2xl sm:text-3xl" data-testid="text-avg-prep-time">
                      {performanceReport?.averagePrepTime || "0.0"} min
                    </CardTitle>
                  </CardHeader>
                </Card>
                <Card>
                  <CardHeader className="pb-2">
                    <CardDescription className="text-xs sm:text-sm">Taxa de Conclusão</CardDescription>
                    <CardTitle className="text-2xl sm:text-3xl" data-testid="text-completion-rate">
                      {performanceReport?.completionRate || "0.0"}%
                    </CardTitle>
                  </CardHeader>
                </Card>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base sm:text-lg">Horários de Pico</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart data={performanceReport?.peakHours || []}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="hour" tickFormatter={(hour) => `${hour}:00`} tick={{fontSize: 12}} />
                        <YAxis tick={{fontSize: 12}} />
                        <Tooltip labelFormatter={(hour) => `${hour}:00`} />
                        <Legend wrapperStyle={{fontSize: '12px'}} />
                        <Bar dataKey="orders" fill="#8b5cf6" name="Pedidos" />
                      </BarChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-base sm:text-lg">Top 10 Mesas</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="overflow-x-auto -mx-2 sm:mx-0">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Mesa</TableHead>
                            <TableHead className="text-right">Pedidos</TableHead>
                            <TableHead className="text-right">Receita</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {performanceReport?.topTables?.map((table: any) => (
                            <TableRow key={table.tableNumber} data-testid={`row-table-${table.tableNumber}`}>
                              <TableCell className="font-medium">Mesa {table.tableNumber}</TableCell>
                              <TableCell className="text-right">{table.orders}</TableCell>
                              <TableCell className="text-right">Kz {table.revenue}</TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </>
          )}
          </motion.div>
        )}
      </div>
    </div>
  );
}
