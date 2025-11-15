import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { ShoppingCart, DollarSign, TrendingUp, ArrowUp, ArrowDown } from "lucide-react";

interface DashboardKPIsProps {
  totalOrders: number;
  totalRevenue: number;
  averageTicket: number;
  isLoading?: boolean;
}

export function DashboardKPIs({ totalOrders, totalRevenue, averageTicket, isLoading }: DashboardKPIsProps) {
  if (isLoading) {
    return (
      <div className="grid gap-4 md:grid-cols-3">
        {[...Array(3)].map((_, i) => (
          <Card key={i}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-4 w-4" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-8 w-32 mb-2" />
              <Skeleton className="h-3 w-24" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-3">
      <Card data-testid="card-dashboard-orders">
        <CardHeader className="flex flex-row items-center justify-between gap-1 space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Quantidade
          </CardTitle>
          <ShoppingCart className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold" data-testid="text-dashboard-total-orders">
            {totalOrders}
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Pedidos no período
          </p>
        </CardContent>
      </Card>

      <Card data-testid="card-dashboard-revenue">
        <CardHeader className="flex flex-row items-center justify-between gap-1 space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Vendas
          </CardTitle>
          <DollarSign className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold" data-testid="text-dashboard-total-revenue">
            Kz {totalRevenue.toFixed(2)}
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Total de vendas pagas
          </p>
        </CardContent>
      </Card>

      <Card data-testid="card-dashboard-avg-ticket">
        <CardHeader className="flex flex-row items-center justify-between gap-1 space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Ticket Médio
          </CardTitle>
          <TrendingUp className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold" data-testid="text-dashboard-avg-ticket">
            Kz {averageTicket.toFixed(2)}
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Por pedido
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
