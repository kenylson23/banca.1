import { useState, useMemo, lazy, Suspense } from "react";
import { useQuery } from "@tanstack/react-query";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { 
  Tag,
  Gift,
  UserPlus,
  Clock,
} from "lucide-react";
import {
  SalesIcon,
  OrdersIcon,
  TicketIcon,
  TablesIcon,
  CancellationsIcon,
  MenuIcon,
  KitchenIcon,
  ReportsIcon,
} from "@/components/custom-icons";
import { formatKwanza } from "@/lib/formatters";
import type { Order, MenuItem, Customer, Coupon } from "@shared/schema";
import { DateRange } from "react-day-picker";
import { motion } from "framer-motion";
import { InteractiveKPICard } from "@/components/interactive-kpi-card";
import { AdvancedFilters } from "@/components/advanced-filters";
import { useLocation } from "wouter";

// Lazy load componentes pesados que não são críticos para o first paint
const ModernChart = lazy(() => import("@/components/modern-chart").then(m => ({ default: m.ModernChart })));
const DataHeatmap = lazy(() => import("@/components/data-heatmap").then(m => ({ default: m.DataHeatmap })));
const ActivityFeed = lazy(() => import("@/components/activity-feed").then(m => ({ default: m.ActivityFeed })));
const GoalsWidget = lazy(() => import("@/components/goals-widget").then(m => ({ default: m.GoalsWidget })));
const QuickActionsWidget = lazy(() => import("@/components/quick-actions-widget").then(m => ({ default: m.QuickActionsWidget })));
const TopDishesCard = lazy(() => import("@/components/top-dishes-card").then(m => ({ default: m.TopDishesCard })));
const RecentOrdersTable = lazy(() => import("@/components/recent-orders-table").then(m => ({ default: m.RecentOrdersTable })));

interface DashboardStats {
  todaySales: string;
  todayOrders: number;
  activeTables: number;
  yesterdaySales: string;
  yesterdayOrders: number;
  salesChange: number;
  ordersChange: number;
  cancelledOrders: number;
  cancelledRevenue: string;
  cancellationRate: number;
  topDishes: Array<{
    menuItem: MenuItem;
    count: number;
    totalRevenue: string;
  }>;
}

interface CustomRangeStats {
  totalSales: string;
  totalOrders: number;
  averageOrderValue: string;
  cancelledOrders: number;
  cancelledRevenue: string;
  cancellationRate: number;
  topDishes: Array<{
    menuItem: MenuItem;
    count: number;
    totalRevenue: string;
  }>;
  periodStart: Date;
  periodEnd: Date;
}

type FilterOption = "today" | "week" | "month" | "3months" | "year";

export default function Dashboard() {
  const [, setLocation] = useLocation();
  const [dateRange, setDateRange] = useState<DateRange | undefined>();
  const [quickFilter, setQuickFilter] = useState<FilterOption>("today");

  const handleQuickFilter = (filter: FilterOption) => {
    setQuickFilter(filter);
    setDateRange(undefined);
  };

  const { data: todayStats, isLoading: todayLoading } = useQuery<DashboardStats>({
    queryKey: ["/api/stats/dashboard"],
    enabled: !dateRange?.from || !dateRange?.to,
    staleTime: 30000, // Cache por 30 segundos
    gcTime: 300000, // Garbage collection após 5 minutos
  });

  const { data: customStats, isLoading: customLoading } = useQuery<CustomRangeStats>({
    queryKey: ["/api/stats/custom-range", dateRange?.from, dateRange?.to],
    queryFn: async () => {
      if (!dateRange?.from || !dateRange?.to) return null;
      const formatDate = (date: Date) => {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
      };
      const params = new URLSearchParams({
        startDate: formatDate(dateRange.from),
        endDate: formatDate(dateRange.to),
      });
      const response = await fetch(`/api/stats/custom-range?${params}`);
      if (!response.ok) throw new Error('Failed to fetch custom range stats');
      return response.json();
    },
    enabled: !!dateRange?.from && !!dateRange?.to,
  });

  const stats = dateRange?.from && dateRange?.to ? customStats : todayStats;
  const isLoading = dateRange?.from && dateRange?.to ? customLoading : todayLoading;

  const displayStats = stats ? {
    totalSales: 'totalSales' in stats ? stats.totalSales : stats.todaySales,
    totalOrders: 'totalOrders' in stats ? stats.totalOrders : stats.todayOrders,
    averageOrderValue: 'averageOrderValue' in stats ? stats.averageOrderValue : (
      stats.todayOrders > 0 ? (parseFloat(stats.todaySales) / stats.todayOrders).toFixed(2) : '0.00'
    ),
    activeTables: 'activeTables' in stats ? stats.activeTables : 0,
    topDishes: stats.topDishes,
    salesChange: 'salesChange' in stats ? stats.salesChange : 0,
    ordersChange: 'ordersChange' in stats ? stats.ordersChange : 0,
  } : null;

  const { data: recentOrders, isLoading: ordersLoading } = useQuery<Array<Order & { table: { number: number } }>>({
    queryKey: ["/api/orders/recent"],
    staleTime: 10000, // Cache por 10 segundos
    gcTime: 60000,
  });

  const { data: customersStats } = useQuery<{
    totalCustomers: number;
    activeCustomers: number;
    newThisMonth: number;
  }>({
    queryKey: ["/api/customers/stats"],
    staleTime: 60000, // Cache por 1 minuto
    gcTime: 300000,
  });

  const { data: couponsStats } = useQuery<{
    totalCoupons: number;
    activeCoupons: number;
    totalUsages: number;
    totalDiscount: string;
  }>({
    queryKey: ["/api/coupons/stats"],
    staleTime: 60000, // Cache por 1 minuto
    gcTime: 300000,
  });

  const { data: loyaltyStats } = useQuery<{
    totalPointsEarned: number;
    totalPointsRedeemed: number;
    activeCustomers: number;
    tierDistribution: { bronze: number; prata: number; ouro: number; platina: number };
  }>({
    queryKey: ["/api/loyalty/stats"],
    staleTime: 60000, // Cache por 1 minuto
    gcTime: 300000,
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
      case "3months":
        return 90;
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
    staleTime: 60000, // Cache por 1 minuto
    gcTime: 300000,
  });

  const salesChartData = historicalData || [];

  // Generate sparkline data from historical data (last 7 days)
  const sparklineData = useMemo(() => {
    if (!historicalData || historicalData.length === 0) return undefined;
    return historicalData.slice(-7).map(d => d.sales);
  }, [historicalData]);

  const { data: heatmapData, isLoading: heatmapLoading } = useQuery<Array<{ day: string; hour: number; value: number }>>({
    queryKey: ["/api/stats/heatmap?days=30"],
    staleTime: 120000, // Cache por 2 minutos (dados menos críticos)
    gcTime: 300000,
  });

  // Mock activity feed data (in production, this would come from WebSocket or API)
  const mockActivities = useMemo(() => {
    if (!recentOrders || recentOrders.length === 0) return [];
    
    return recentOrders.slice(0, 8).map((order, index) => ({
      id: order.id.toString(),
      type: "order" as const,
      title: `Pedido #${order.id}`,
      description: `${order.table ? `Mesa ${order.table.number}` : order.orderType === 'delivery' ? 'Entrega' : 'Balcão'} - ${order.status}`,
      timestamp: order.createdAt ? new Date(order.createdAt) : new Date(),
      status: order.status === "servido" ? "success" as const : "info" as const,
      value: formatKwanza(order.totalAmount?.toString() || "0"),
    }));
  }, [recentOrders]);

  // Mock goals data
  const mockGoals = useMemo(() => {
    if (!displayStats) return [];
    
    const salesTarget = 50000;
    const ordersTarget = 100;
    
    return [
      {
        id: "sales-goal",
        title: "Meta de Vendas",
        current: parseFloat(displayStats.totalSales || "0"),
        target: salesTarget,
        unit: "currency" as const,
        period: dateRange?.from && dateRange?.to ? "Período personalizado" : "Hoje",
      },
      {
        id: "orders-goal",
        title: "Meta de Pedidos",
        current: displayStats.totalOrders || 0,
        target: ordersTarget,
        unit: "number" as const,
        period: dateRange?.from && dateRange?.to ? "Período personalizado" : "Hoje",
      },
    ];
  }, [displayStats, dateRange]);

  // Quick actions handlers
  const quickActions = [
    {
      id: "new-order",
      title: "PDV",
      description: "Abrir caixa",
      icon: OrdersIcon,
      color: "primary",
      onClick: () => setLocation("/pdv"),
    },
    {
      id: "manage-menu",
      title: "Menu",
      description: "Gerenciar cardápio",
      icon: MenuIcon,
      color: "success",
      onClick: () => setLocation("/menu"),
    },
    {
      id: "view-orders",
      title: "Cozinha",
      description: "Ver pedidos",
      icon: KitchenIcon,
      color: "warning",
      onClick: () => setLocation("/kitchen"),
    },
    {
      id: "reports",
      title: "Relatórios",
      description: "Ver análises",
      icon: ReportsIcon,
      color: "info",
      onClick: () => setLocation("/reports"),
    },
  ];

  return (
    <div className="min-h-screen">
      <div className="space-y-4 p-4 sm:p-6">
        {/* Header with Gradient */}
        <motion.div 
          className="space-y-3"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="flex flex-col gap-1">
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight bg-gradient-to-r from-primary via-primary/80 to-primary/60 bg-clip-text text-transparent">
              Dashboard Analítico
            </h1>
            <p className="text-sm text-muted-foreground">
              {dateRange?.from && dateRange?.to 
                ? `Estatísticas do período personalizado`
                : `Visão geral em tempo real • ${new Date().toLocaleDateString('pt-AO', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}`
              }
            </p>
          </div>

          {/* Advanced Filters */}
          <AdvancedFilters
            quickFilter={quickFilter}
            onQuickFilterChange={handleQuickFilter}
            dateRange={dateRange}
            onDateRangeChange={setDateRange}
            onRefresh={() => window.location.reload()}
            isLoading={isLoading}
          />
        </motion.div>

        {/* KPI Cards - Interactive */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
          <InteractiveKPICard
            title="Vendas Totais"
            value={formatKwanza(displayStats?.totalSales || "0")}
            change={todayStats?.salesChange}
            changeLabel="vs período anterior"
            icon={SalesIcon}
            iconColor="text-green-600"
            iconBgColor="bg-green-500/10"
            gradient="from-green-500/5 to-emerald-500/5"
            sparklineData={sparklineData}
            details={[
              { label: "Hoje", value: formatKwanza(todayStats?.todaySales || "0") },
              { label: "Ontem", value: formatKwanza(todayStats?.yesterdaySales || "0") },
            ]}
            isLoading={isLoading}
          />

          <InteractiveKPICard
            title="Pedidos"
            value={displayStats?.totalOrders || 0}
            change={todayStats?.ordersChange}
            changeLabel="vs período anterior"
            icon={OrdersIcon}
            iconColor="text-orange-600"
            iconBgColor="bg-orange-500/10"
            gradient="from-orange-500/5 to-amber-500/5"
            sparklineData={sparklineData?.map((_, i) => historicalData?.[i]?.orders || 0)}
            details={[
              { label: "Hoje", value: `${todayStats?.todayOrders || 0}` },
              { label: "Ontem", value: `${todayStats?.yesterdayOrders || 0}` },
            ]}
            isLoading={isLoading}
          />

          <InteractiveKPICard
            title="Ticket Médio"
            value={formatKwanza(displayStats?.averageOrderValue || "0")}
            icon={TicketIcon}
            iconColor="text-blue-600"
            iconBgColor="bg-blue-500/10"
            gradient="from-blue-500/5 to-cyan-500/5"
            isLoading={isLoading}
          />

          <InteractiveKPICard
            title="Mesas Ativas"
            value={displayStats?.activeTables || 0}
            icon={TablesIcon}
            iconColor="text-purple-600"
            iconBgColor="bg-purple-500/10"
            gradient="from-purple-500/5 to-pink-500/5"
            isLoading={isLoading}
          />

          <InteractiveKPICard
            title="Cancelamentos"
            value={'cancelledOrders' in (stats || {}) ? stats?.cancelledOrders || 0 : 0}
            change={-('cancellationRate' in (stats || {}) ? stats?.cancellationRate || 0 : 0)}
            changeLabel="taxa de cancelamento"
            icon={CancellationsIcon}
            iconColor="text-red-600"
            iconBgColor="bg-red-500/10"
            gradient="from-red-500/5 to-rose-500/5"
            details={[
              { label: "Perdidos", value: formatKwanza('cancelledRevenue' in (stats || {}) ? stats?.cancelledRevenue || "0" : "0") },
            ]}
            isLoading={isLoading}
          />
        </div>

        {/* Performance Cards - Clientes, Cupons e Fidelidade */}
        <motion.div
          className="grid grid-cols-1 md:grid-cols-3 gap-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          <Card data-testid="card-customers-performance">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Clientes</CardTitle>
              <UserPlus className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">Total</span>
                  <span className="text-xl font-bold">{customersStats?.totalCustomers || 0}</span>
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">Ativos</span>
                  <Badge variant="secondary">{customersStats?.activeCustomers || 0}</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">Novos este mês</span>
                  <Badge variant="default">{customersStats?.newThisMonth || 0}</Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card data-testid="card-coupons-performance">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Cupons</CardTitle>
              <Tag className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">Ativos</span>
                  <span className="text-xl font-bold">{couponsStats?.activeCoupons || 0}</span>
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">Total de usos</span>
                  <Badge variant="secondary">{couponsStats?.totalUsages || 0}</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">Desconto aplicado</span>
                  <Badge variant="default">{formatKwanza(couponsStats?.totalDiscount || "0")}</Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card data-testid="card-loyalty-performance">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Fidelidade</CardTitle>
              <Gift className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">Pts distribuídos</span>
                  <span className="text-xl font-bold">{loyaltyStats?.totalPointsEarned || 0}</span>
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">Pts resgatados</span>
                  <Badge variant="secondary">{loyaltyStats?.totalPointsRedeemed || 0}</Badge>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">Tiers:</span>
                  <div className="flex gap-1">
                    <Badge variant="outline" className="text-xs">🥉 {loyaltyStats?.tierDistribution?.bronze || 0}</Badge>
                    <Badge variant="outline" className="text-xs">🥈 {loyaltyStats?.tierDistribution?.prata || 0}</Badge>
                    <Badge variant="outline" className="text-xs">🥇 {loyaltyStats?.tierDistribution?.ouro || 0}</Badge>
                    <Badge variant="outline" className="text-xs">💎 {loyaltyStats?.tierDistribution?.platina || 0}</Badge>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Main Analytics Section - 70/30 Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content - 70% */}
          <div className="lg:col-span-2 space-y-6">
            {/* Section Title */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
            >
              <h2 className="text-lg font-semibold mb-4">Análise de Desempenho</h2>
            </motion.div>

            {/* Modern Sales Chart */}
            <Suspense fallback={<Skeleton className="h-[360px] w-full rounded-lg" />}>
              <ModernChart
                title="Evolução de Vendas e Pedidos"
                data={salesChartData.map(item => ({
                  ...item,
                  date: new Date(item.date).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })
                }))}
                type="area"
                dataKeys={[
                  { key: "sales", color: "#10b981", label: "Vendas (Kz)" },
                  { key: "orders", color: "#f97316", label: "Pedidos" }
                ]}
                xAxisKey="date"
                height={320}
                isLoading={historicalLoading}
              />
            </Suspense>

            {/* Data Heatmap */}
            <Suspense fallback={<Skeleton className="h-[360px] w-full rounded-lg" />}>
              <DataHeatmap
                title="Mapa de Calor - Horários de Maior Movimento"
                data={heatmapData?.map(item => ({
                  day: ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"][new Date(item.day).getDay()],
                  hour: `${item.hour}h`,
                  value: item.value
                })) || []}
                isLoading={heatmapLoading}
              />
            </Suspense>
          </div>

          {/* Sidebar - 30% */}
          <div className="space-y-6">
            {/* Section Title */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
            >
              <h2 className="text-lg font-semibold mb-4">Ações Rápidas</h2>
            </motion.div>

            {/* Goals Widget */}
            <Suspense fallback={<Skeleton className="h-[240px] w-full rounded-lg" />}>
              <GoalsWidget goals={mockGoals} />
            </Suspense>

            {/* Quick Actions */}
            <Suspense fallback={<Skeleton className="h-[240px] w-full rounded-lg" />}>
              <QuickActionsWidget actions={quickActions} />
            </Suspense>
          </div>
        </div>

        {/* Activity Feed & Top Dishes */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <Suspense fallback={<Skeleton className="h-[400px] w-full rounded-lg" />}>
            <ActivityFeed activities={mockActivities} maxHeight={400} />
          </Suspense>
          
          {isLoading ? (
            <Skeleton className="h-[400px] w-full rounded-lg" />
          ) : (
            <Suspense fallback={<Skeleton className="h-[400px] w-full rounded-lg" />}>
              <TopDishesCard dishes={displayStats?.topDishes || []} />
            </Suspense>
          )}
        </div>

        {/* Recent Orders Table */}
        {ordersLoading ? (
          <Skeleton className="h-[350px] w-full rounded-lg" />
        ) : (
          <Suspense fallback={<Skeleton className="h-[350px] w-full rounded-lg" />}>
            <RecentOrdersTable orders={recentOrders || []} />
          </Suspense>
        )}
      </div>
    </div>
  );
}
