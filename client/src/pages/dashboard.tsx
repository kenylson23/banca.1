import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { DollarSign, ShoppingBag, TrendingUp, X } from "lucide-react";
import { formatKwanza } from "@/lib/formatters";
import type { Order, MenuItem } from "@shared/schema";
import { DateRangePicker } from "@/components/ui/date-range-picker";
import { DateRange } from "react-day-picker";
import { Button } from "@/components/ui/button";
import { StatCard } from "@/components/stat-card";

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

export default function Dashboard() {
  const [dateRange, setDateRange] = useState<DateRange | undefined>();

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
  } : null;

  const { data: recentOrders, isLoading: ordersLoading } = useQuery<Array<Order & { table: { number: number } }>>({
    queryKey: ["/api/orders/recent"],
  });

  return (
    <div className="space-y-8 p-6 sm:p-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="space-y-2">
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-foreground">Dashboard</h1>
          <p className="text-base text-muted-foreground">
            {dateRange?.from && dateRange?.to 
              ? `Estatísticas do período selecionado`
              : `Visão geral das operações do restaurante`
            }
          </p>
        </div>
        <div className="flex items-center gap-2">
          <DateRangePicker date={dateRange} onDateChange={setDateRange} className="w-full sm:w-auto text-sm" />
          {dateRange?.from && dateRange?.to && (
            <Button
              variant="ghost"
              size="icon"
              className="min-h-10 min-w-10"
              onClick={() => setDateRange(undefined)}
              data-testid="button-clear-date-range"
            >
              <X className="h-5 w-5" />
            </Button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        {isLoading ? (
          <>
            <Card>
              <CardContent className="p-6">
                <Skeleton className="h-24 w-full" />
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <Skeleton className="h-24 w-full" />
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <Skeleton className="h-24 w-full" />
              </CardContent>
            </Card>
          </>
        ) : (
          <>
            <StatCard
              title={dateRange?.from && dateRange?.to ? "Vendas no Período" : "Vendas Hoje"}
              value={formatKwanza(displayStats?.totalSales || "0")}
              icon={DollarSign}
              iconColor="text-green-600 dark:text-green-400"
              iconBgColor="bg-green-500/10"
              trend={
                !dateRange?.from && !dateRange?.to && todayStats
                  ? {
                      value: todayStats.salesChange,
                      label: `vs. ontem (${formatKwanza(todayStats.yesterdaySales)})`,
                    }
                  : undefined
              }
              subtitle={dateRange?.from && dateRange?.to ? "Receita total" : undefined}
              testId="text-total-sales"
            />

            <StatCard
              title={dateRange?.from && dateRange?.to ? "Pedidos no Período" : "Pedidos Hoje"}
              value={displayStats?.totalOrders || 0}
              icon={ShoppingBag}
              iconColor="text-blue-600 dark:text-blue-400"
              iconBgColor="bg-blue-500/10"
              trend={
                !dateRange?.from && !dateRange?.to && todayStats
                  ? {
                      value: todayStats.ordersChange,
                      label: `vs. ontem (${todayStats.yesterdayOrders} pedidos)`,
                    }
                  : undefined
              }
              subtitle={dateRange?.from && dateRange?.to ? "Total de pedidos" : undefined}
              testId="text-total-orders"
            />

            <StatCard
              title="Ticket Médio"
              value={formatKwanza(displayStats?.averageOrderValue || "0")}
              icon={TrendingUp}
              iconColor="text-orange-600 dark:text-orange-400"
              iconBgColor="bg-orange-500/10"
              subtitle="Valor médio por pedido"
              testId="text-avg-ticket"
            />
          </>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Pratos Mais Pedidos</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-4">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="flex items-center gap-4">
                    <Skeleton className="h-12 w-12 rounded-md" />
                    <div className="flex-1 space-y-2">
                      <Skeleton className="h-4 w-3/4" />
                      <Skeleton className="h-3 w-1/2" />
                    </div>
                  </div>
                ))}
              </div>
            ) : displayStats?.topDishes && displayStats.topDishes.length > 0 ? (
              <div className="space-y-4">
                {displayStats.topDishes.map((dish, index) => (
                  <div
                    key={dish.menuItem.id}
                    className="flex items-center gap-4"
                    data-testid={`dish-top-${index}`}
                  >
                    <div className="h-12 w-12 rounded-md bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <span className="text-lg font-bold text-primary">
                        {index + 1}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{dish.menuItem.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {dish.count} pedidos • {formatKwanza(dish.totalRevenue)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground text-center py-8">
                {dateRange?.from && dateRange?.to 
                  ? "Nenhum pedido registrado no período selecionado"
                  : "Nenhum pedido registrado hoje"
                }
              </p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Pedidos Recentes</CardTitle>
          </CardHeader>
          <CardContent>
            {ordersLoading ? (
              <div className="space-y-4">
                {[...Array(5)].map((_, i) => (
                  <Skeleton key={i} className="h-16 w-full" />
                ))}
              </div>
            ) : recentOrders && recentOrders.length > 0 ? (
              <div className="space-y-3">
                {recentOrders.map((order) => (
                  <div
                    key={order.id}
                    className="flex items-center justify-between p-3 sm:p-4 rounded-md border border-card-border"
                    data-testid={`order-recent-${order.id}`}
                  >
                    <div>
                      <p className="font-medium font-mono">
                        {order.table ? `Mesa ${order.table.number}` : 
                         order.orderType === 'delivery' ? 'Delivery' : 'Retirada'}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {new Date(order.createdAt!).toLocaleTimeString('pt-BR', {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold">{formatKwanza(order.totalAmount)}</p>
                      <p className="text-xs text-muted-foreground capitalize">
                        {order.status.replace('_', ' ')}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground text-center py-8">
                Nenhum pedido recente
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
