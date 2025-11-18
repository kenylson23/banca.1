import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { Skeleton } from "@/components/ui/skeleton";
import { DollarSign, ShoppingBag, TrendingUp, Users } from "lucide-react";
import { formatKwanza } from "@/lib/formatters";
import type { Order, MenuItem } from "@shared/schema";
import { DateRangePicker } from "@/components/ui/date-range-picker";
import { DateRange } from "react-day-picker";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import { ModernStatCard } from "@/components/modern-stat-card";
import { SalesChart } from "@/components/sales-chart";
import { TopDishesCard } from "@/components/top-dishes-card";
import { RecentOrdersTable } from "@/components/recent-orders-table";
import { QuickFilters } from "@/components/quick-filters";
import { motion } from "framer-motion";

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
  const [dateRange, setDateRange] = useState<DateRange | undefined>();
  const [quickFilter, setQuickFilter] = useState<FilterOption>("today");

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

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      <div className="space-y-6 p-4 sm:p-6 lg:p-8">
        {/* Header */}
        <motion.div 
          className="flex flex-col gap-4"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
            <div className="space-y-1">
              <h1 className="text-4xl sm:text-5xl font-bold tracking-tight bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
                Dashboard
              </h1>
              <p className="text-base text-muted-foreground">
                {dateRange?.from && dateRange?.to 
                  ? `Estatísticas do período selecionado`
                  : `Visão geral em tempo real`
                }
              </p>
            </div>
            
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              <QuickFilters 
                selected={quickFilter} 
                onSelect={handleQuickFilter}
              />
              
              <div className="flex items-center gap-2">
                <DateRangePicker 
                  date={dateRange} 
                  onDateChange={(range) => {
                    setDateRange(range);
                  }} 
                  className="w-full sm:w-auto" 
                />
                {dateRange?.from && dateRange?.to && (
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => {
                      setDateRange(undefined);
                      setQuickFilter("today");
                    }}
                    data-testid="button-clear-date-range"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </div>
          </div>
        </motion.div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
          {isLoading ? (
            <>
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-[160px]">
                  <Skeleton className="h-full w-full" />
                </div>
              ))}
            </>
          ) : (
            <>
              <ModernStatCard
                title={dateRange?.from && dateRange?.to ? "Vendas no Período" : "Vendas Hoje"}
                value={formatKwanza(displayStats?.totalSales || "0")}
                icon={DollarSign}
                gradient="from-green-500/20 to-emerald-500/20"
                trend={
                  !dateRange?.from && !dateRange?.to && todayStats
                    ? {
                        value: todayStats.salesChange,
                        label: `vs. ontem (${formatKwanza(todayStats.yesterdaySales)})`,
                      }
                    : undefined
                }
                testId="text-total-sales"
                delay={0}
              />

              <ModernStatCard
                title={dateRange?.from && dateRange?.to ? "Pedidos no Período" : "Pedidos Hoje"}
                value={displayStats?.totalOrders || 0}
                icon={ShoppingBag}
                gradient="from-blue-500/20 to-cyan-500/20"
                trend={
                  !dateRange?.from && !dateRange?.to && todayStats
                    ? {
                        value: todayStats.ordersChange,
                        label: `vs. ontem (${todayStats.yesterdayOrders} pedidos)`,
                      }
                    : undefined
                }
                testId="text-total-orders"
                delay={0.1}
              />

              <ModernStatCard
                title="Ticket Médio"
                value={formatKwanza(displayStats?.averageOrderValue || "0")}
                icon={TrendingUp}
                gradient="from-orange-500/20 to-amber-500/20"
                subtitle="Valor médio por pedido"
                testId="text-avg-ticket"
                delay={0.2}
              />

              <ModernStatCard
                title="Mesas Ativas"
                value={displayStats?.activeTables || 0}
                icon={Users}
                gradient="from-purple-500/20 to-pink-500/20"
                subtitle="Atendimento em andamento"
                testId="text-active-tables"
                delay={0.3}
              />
            </>
          )}
        </div>

        {/* Charts and Tables */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-6">
          <div className="lg:col-span-2">
            {historicalLoading ? (
              <Skeleton className="h-[400px] w-full" />
            ) : (
              <SalesChart data={salesChartData} />
            )}
          </div>

          <div className="lg:col-span-1">
            {isLoading ? (
              <Skeleton className="h-[400px] w-full" />
            ) : (
              <TopDishesCard dishes={displayStats?.topDishes || []} />
            )}
          </div>
        </div>

        {/* Recent Orders */}
        {ordersLoading ? (
          <Skeleton className="h-[400px] w-full" />
        ) : (
          <RecentOrdersTable orders={recentOrders || []} />
        )}
      </div>
    </div>
  );
}
