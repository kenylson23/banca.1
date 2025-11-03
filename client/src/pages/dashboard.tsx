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

interface DashboardStats {
  todaySales: string;
  todayOrders: number;
  activeTables: number;
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
    <div className="space-y-6 sm:space-y-8 p-4 sm:p-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-foreground">Dashboard</h1>
          <p className="text-sm sm:text-base text-muted-foreground mt-1 sm:mt-2">
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
        <Card>
          <CardHeader className="flex flex-row items-center justify-between gap-2 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {dateRange?.from && dateRange?.to ? "Vendas no Período" : "Vendas Hoje"}
            </CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-8 w-24" />
            ) : (
              <>
                <div className="text-3xl font-bold" data-testid="text-total-sales">
                  {formatKwanza(displayStats?.totalSales || "0")}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  {dateRange?.from && dateRange?.to ? "Receita total" : "Receita do dia atual"}
                </p>
              </>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between gap-2 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {dateRange?.from && dateRange?.to ? "Pedidos no Período" : "Pedidos Hoje"}
            </CardTitle>
            <ShoppingBag className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-8 w-16" />
            ) : (
              <>
                <div className="text-3xl font-bold" data-testid="text-total-orders">
                  {displayStats?.totalOrders || 0}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Total de pedidos
                </p>
              </>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between gap-2 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Ticket Médio
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-8 w-24" />
            ) : (
              <>
                <div className="text-3xl font-bold" data-testid="text-avg-ticket">
                  {formatKwanza(displayStats?.averageOrderValue || "0")}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Valor médio por pedido
                </p>
              </>
            )}
          </CardContent>
        </Card>
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
