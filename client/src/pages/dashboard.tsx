import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { Skeleton } from "@/components/ui/skeleton";
import { DollarSign, ShoppingBag, TrendingUp, Users, UtensilsCrossed } from "lucide-react";
import { formatKwanza } from "@/lib/formatters";
import type { Order, MenuItem } from "@shared/schema";
import { DateRange } from "react-day-picker";
import { motion } from "framer-motion";
import { AdvancedKpiCard } from "@/components/advanced-kpi-card";
import { AdvancedSalesChart } from "@/components/advanced-sales-chart";
import { SalesHeatmap } from "@/components/sales-heatmap";
import { ActivityFeed } from "@/components/activity-feed";
import { GoalsWidget } from "@/components/goals-widget";
import { QuickActionsWidget } from "@/components/quick-actions-widget";
import { AdvancedFilters } from "@/components/advanced-filters";
import { TopDishesCard } from "@/components/top-dishes-card";
import { RecentOrdersTable } from "@/components/recent-orders-table";
import { useLocation } from "wouter";

interface DashboardStats {
  todaySales: string;
  todayOrders: number;
  activeTables: number;
  yesterdaySales: string;
  yesterdayOrders: number;
  salesChange: number;
  ordersChange: number;
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
  topDishes: Array<{
    menuItem: MenuItem;
    count: number;
    totalRevenue: string;
  }>;
  periodStart: Date;
  periodEnd: Date;
}

type FilterOption = "today" | "week" | "month" | "year";

export default function Dashboard() {
  const [, setLocation] = useLocation();
  const [dateRange, setDateRange] = useState<DateRange | undefined>();
  const [quickFilter, setQuickFilter] = useState<FilterOption>("today");
  const [showComparison, setShowComparison] = useState(false);

  const handleQuickFilter = (filter: FilterOption) => {
    setQuickFilter(filter);
    setDateRange(undefined);
  };

  const { data: todayStats, isLoading: todayLoading } = useQuery<DashboardStats>({
    queryKey: ["/api/stats/dashboard"],
    enabled: !dateRange?.from || !dateRange?.to,
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

  const salesChartData = historicalData || [];

  // Generate sparkline data from historical data (last 7 days)
  const sparklineData = useMemo(() => {
    if (!historicalData || historicalData.length === 0) return undefined;
    return historicalData.slice(-7).map(d => d.sales);
  }, [historicalData]);

  // Mock activity feed data (in production, this would come from WebSocket or API)
  const mockActivities = useMemo(() => {
    if (!recentOrders || recentOrders.length === 0) return [];
    
    return recentOrders.slice(0, 8).map((order, index) => ({
      id: order.id.toString(),
      type: "order" as const,
      title: `Pedido #${order.id}`,
      description: `Mesa ${order.table.number} - ${order.status}`,
      timestamp: order.createdAt ? new Date(order.createdAt) : new Date(),
      status: order.status === "servido" ? "success" as const : "info" as const,
      value: formatKwanza(order.totalAmount?.toString() || "0"),
    }));
  }, [recentOrders]);

  // Mock heatmap data (in production, this would come from API)
  const mockHeatmapData = useMemo(() => {
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
  }, []);

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
      icon: ShoppingBag,
      color: "primary",
      onClick: () => setLocation("/pdv"),
    },
    {
      id: "manage-menu",
      title: "Menu",
      description: "Gerenciar cardápio",
      icon: UtensilsCrossed,
      color: "success",
      onClick: () => setLocation("/menu"),
    },
    {
      id: "view-orders",
      title: "Cozinha",
      description: "Ver pedidos",
      icon: TrendingUp,
      color: "warning",
      onClick: () => setLocation("/kitchen"),
    },
    {
      id: "reports",
      title: "Relatórios",
      description: "Ver análises",
      icon: DollarSign,
      color: "info",
      onClick: () => setLocation("/reports"),
    },
  ];

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
              Dashboard Analítico
            </h1>
            <p className="text-base text-muted-foreground">
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
            showComparison={showComparison}
            onToggleComparison={() => setShowComparison(!showComparison)}
            onRefresh={() => window.location.reload()}
            isLoading={isLoading}
          />
        </motion.div>

        {/* KPI Cards with Sparklines */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
          {isLoading ? (
            <>
              {[...Array(4)].map((_, i) => (
                <Skeleton key={i} className="h-[180px] w-full rounded-lg" />
              ))}
            </>
          ) : (
            <>
              <AdvancedKpiCard
                title="Vendas Totais"
                value={parseFloat(displayStats?.totalSales || "0")}
                prefix="Kz "
                decimals={2}
                icon={DollarSign}
                change={todayStats?.salesChange}
                changeLabel="vs período anterior"
                sparklineData={sparklineData}
                gradient="from-success/10 via-success/5 to-transparent"
                delay={0}
                data-testid="card-kpi-sales"
              />

              <AdvancedKpiCard
                title="Pedidos"
                value={displayStats?.totalOrders || 0}
                icon={ShoppingBag}
                change={todayStats?.ordersChange}
                changeLabel="vs período anterior"
                sparklineData={sparklineData?.map((_, i) => historicalData?.[i]?.orders || 0)}
                gradient="from-primary/10 via-primary/5 to-transparent"
                delay={0.1}
                data-testid="card-kpi-orders"
              />

              <AdvancedKpiCard
                title="Ticket Médio"
                value={parseFloat(displayStats?.averageOrderValue || "0")}
                prefix="Kz "
                decimals={2}
                icon={TrendingUp}
                gradient="from-warning/10 via-warning/5 to-transparent"
                delay={0.2}
                data-testid="card-kpi-avg-ticket"
              />

              <AdvancedKpiCard
                title="Mesas Ativas"
                value={displayStats?.activeTables || 0}
                icon={Users}
                gradient="from-info/10 via-info/5 to-transparent"
                delay={0.3}
                data-testid="card-kpi-active-tables"
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
            <SalesHeatmap data={mockHeatmapData} />
          </div>

          {/* Sidebar Widgets */}
          <div className="space-y-6">
            {/* Goals Widget */}
            <GoalsWidget goals={mockGoals} />

            {/* Quick Actions */}
            <QuickActionsWidget actions={quickActions} />
          </div>
        </div>

        {/* Activity Feed & Top Dishes */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <ActivityFeed activities={mockActivities} maxHeight={500} />
          
          {isLoading ? (
            <Skeleton className="h-[500px] w-full rounded-lg" />
          ) : (
            <TopDishesCard dishes={displayStats?.topDishes || []} />
          )}
        </div>

        {/* Recent Orders Table */}
        {ordersLoading ? (
          <Skeleton className="h-[400px] w-full rounded-lg" />
        ) : (
          <RecentOrdersTable orders={recentOrders || []} />
        )}
      </div>
    </div>
  );
}
