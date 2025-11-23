import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Trophy, TrendingUp, ShoppingBag } from "lucide-react";
import { formatKwanza } from "@/lib/formatters";
import type { Restaurant } from "@shared/schema";

interface RankingData {
  topByRevenue: Array<{
    restaurant: Restaurant;
    revenue: number;
    ordersCount: number;
    averageTicket: number;
  }>;
  topByOrders: Array<{
    restaurant: Restaurant;
    ordersCount: number;
    revenue: number;
  }>;
  topByGrowth: Array<{
    restaurant: Restaurant;
    growthRate: number;
    currentRevenue: number;
    previousRevenue: number;
  }>;
}

interface RestaurantRankingCardProps {
  data?: RankingData;
  isLoading: boolean;
}

export function RestaurantRankingCard({ data, isLoading }: RestaurantRankingCardProps) {
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-4 w-64 mt-2" />
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex items-center gap-3 p-3 border rounded-md">
                <Skeleton className="h-8 w-8 rounded-full" />
                <div className="flex-1">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-3 w-24 mt-1" />
                </div>
                <Skeleton className="h-5 w-20" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!data) return null;

  const getMedalColor = (index: number) => {
    if (index === 0) return "text-yellow-500";
    if (index === 1) return "text-gray-400";
    if (index === 2) return "text-orange-600";
    return "text-muted-foreground";
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Trophy className="h-5 w-5" />
          Rankings de Restaurantes
        </CardTitle>
        <CardDescription>Top 10 restaurantes por diferentes métricas</CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="revenue" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="revenue" data-testid="tab-ranking-revenue">
              Por Receita
            </TabsTrigger>
            <TabsTrigger value="orders" data-testid="tab-ranking-orders">
              Por Pedidos
            </TabsTrigger>
            <TabsTrigger value="growth" data-testid="tab-ranking-growth">
              Por Crescimento
            </TabsTrigger>
          </TabsList>

          <TabsContent value="revenue" className="space-y-2 mt-4">
            {data.topByRevenue.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">
                Nenhum dado disponível
              </p>
            ) : (
              data.topByRevenue.map((item, index) => (
                <div
                  key={item.restaurant.id}
                  className="flex items-center gap-3 p-3 border rounded-md hover-elevate"
                  data-testid={`ranking-revenue-${index}`}
                >
                  <div className={`flex items-center justify-center w-8 h-8 rounded-full bg-muted ${getMedalColor(index)}`}>
                    {index < 3 ? <Trophy className="h-4 w-4" /> : <span className="text-sm font-bold">{index + 1}</span>}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate" data-testid={`text-restaurant-name-${index}`}>
                      {item.restaurant.name}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {item.ordersCount} pedidos • Ticket médio: {formatKwanza(item.averageTicket.toFixed(2))}
                    </p>
                  </div>
                  <Badge variant="secondary" data-testid={`badge-revenue-${index}`}>
                    {formatKwanza(item.revenue.toFixed(2))}
                  </Badge>
                </div>
              ))
            )}
          </TabsContent>

          <TabsContent value="orders" className="space-y-2 mt-4">
            {data.topByOrders.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">
                Nenhum dado disponível
              </p>
            ) : (
              data.topByOrders.map((item, index) => (
                <div
                  key={item.restaurant.id}
                  className="flex items-center gap-3 p-3 border rounded-md hover-elevate"
                  data-testid={`ranking-orders-${index}`}
                >
                  <div className={`flex items-center justify-center w-8 h-8 rounded-full bg-muted ${getMedalColor(index)}`}>
                    {index < 3 ? <ShoppingBag className="h-4 w-4" /> : <span className="text-sm font-bold">{index + 1}</span>}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">
                      {item.restaurant.name}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Receita: {formatKwanza(item.revenue.toFixed(2))}
                    </p>
                  </div>
                  <Badge variant="secondary">
                    {item.ordersCount} pedidos
                  </Badge>
                </div>
              ))
            )}
          </TabsContent>

          <TabsContent value="growth" className="space-y-2 mt-4">
            {data.topByGrowth.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">
                Nenhum dado disponível
              </p>
            ) : (
              data.topByGrowth.map((item, index) => (
                <div
                  key={item.restaurant.id}
                  className="flex items-center gap-3 p-3 border rounded-md hover-elevate"
                  data-testid={`ranking-growth-${index}`}
                >
                  <div className={`flex items-center justify-center w-8 h-8 rounded-full bg-muted ${getMedalColor(index)}`}>
                    {index < 3 ? <TrendingUp className="h-4 w-4" /> : <span className="text-sm font-bold">{index + 1}</span>}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">
                      {item.restaurant.name}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {formatKwanza(item.previousRevenue.toFixed(2))} → {formatKwanza(item.currentRevenue.toFixed(2))}
                    </p>
                  </div>
                  <Badge 
                    variant={item.growthRate >= 0 ? "default" : "destructive"}
                    className={item.growthRate >= 0 ? "bg-green-500 hover:bg-green-600" : ""}
                  >
                    {item.growthRate >= 0 ? '+' : ''}{item.growthRate.toFixed(1)}%
                  </Badge>
                </div>
              ))
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
