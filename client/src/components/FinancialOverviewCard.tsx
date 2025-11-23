import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { DollarSign, CreditCard, Banknote, Smartphone } from "lucide-react";
import { formatKwanza } from "@/lib/formatters";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from "recharts";

interface FinancialOverviewProps {
  data?: {
    totalRevenue: string;
    totalOrders: number;
    revenueByMethod: Array<{
      method: string;
      total: string;
      percentage: number;
    }>;
    revenueByRestaurant: Array<{
      restaurantName: string;
      revenue: string;
      orders: number;
    }>;
    dailyRevenue: Array<{
      date: string;
      revenue: number;
      orders: number;
    }>;
    shifts: Array<{
      restaurantName: string;
      totalShifts: number;
      totalDiscrepancies: string;
    }>;
  };
  isLoading: boolean;
}

const PAYMENT_METHOD_COLORS: Record<string, string> = {
  'dinheiro': '#10B981',
  'multicaixa': '#3B82F6',
  'transferencia': '#8B5CF6',
  'cartao': '#F59E0B',
  'não especificado': '#6B7280',
};

const PAYMENT_METHOD_ICONS: Record<string, any> = {
  'dinheiro': Banknote,
  'multicaixa': CreditCard,
  'transferencia': Smartphone,
  'cartao': CreditCard,
};

export function FinancialOverviewCard({ data, isLoading }: FinancialOverviewProps) {
  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[...Array(2)].map((_, i) => (
            <Card key={i}>
              <CardHeader className="pb-2">
                <Skeleton className="h-4 w-32" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-10 w-40" />
              </CardContent>
            </Card>
          ))}
        </div>
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-48" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-64 w-full" />
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!data) return null;

  const chartData = data.revenueByMethod.map(item => ({
    name: item.method.charAt(0).toUpperCase() + item.method.slice(1),
    value: parseFloat(item.total),
    percentage: item.percentage
  }));

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between gap-2 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Receita Total
            </CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold" data-testid="text-total-revenue">
              {formatKwanza(data.totalRevenue)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {data.totalOrders} pedidos processados
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Métodos de Pagamento
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {data.revenueByMethod.slice(0, 3).map((method, index) => {
                const Icon = PAYMENT_METHOD_ICONS[method.method] || CreditCard;
                return (
                  <div key={index} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Icon className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm capitalize">{method.method}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium">
                        {formatKwanza(method.total)}
                      </span>
                      <Badge variant="secondary" className="text-xs">
                        {method.percentage.toFixed(1)}%
                      </Badge>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Distribuição de Pagamentos</CardTitle>
          <CardDescription>
            Métodos de pagamento utilizados nos últimos 30 dias
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percentage }) => `${name}: ${percentage.toFixed(1)}%`}
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
              >
                {chartData.map((entry, index) => {
                  const color = PAYMENT_METHOD_COLORS[entry.name.toLowerCase()] || '#6B7280';
                  return <Cell key={`cell-${index}`} fill={color} />;
                })}
              </Pie>
              <Tooltip 
                formatter={(value: number) => formatKwanza(value.toString())}
                contentStyle={{
                  backgroundColor: 'hsl(var(--card))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px'
                }}
              />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Top Restaurantes por Receita</CardTitle>
          <CardDescription>
            Restaurantes com maior faturamento no período
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {data.revenueByRestaurant.slice(0, 10).map((restaurant, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-3 border rounded-md hover-elevate"
                data-testid={`top-restaurant-${index}`}
              >
                <div className="flex items-center gap-3">
                  <div className="flex items-center justify-center w-8 h-8 rounded-full bg-muted">
                    <span className="text-sm font-bold">{index + 1}</span>
                  </div>
                  <div>
                    <p className="font-medium">{restaurant.restaurantName}</p>
                    <p className="text-sm text-muted-foreground">
                      {restaurant.orders} pedidos
                    </p>
                  </div>
                </div>
                <Badge variant="secondary">
                  {formatKwanza(restaurant.revenue)}
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {data.shifts.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Discrepâncias em Turnos</CardTitle>
            <CardDescription>
              Diferenças encontradas nos fechamentos de caixa
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {data.shifts.map((shift, index) => {
                const discrepancy = parseFloat(shift.totalDiscrepancies);
                const hasDiscrepancy = discrepancy !== 0;
                
                return (
                  <div
                    key={index}
                    className="flex items-center justify-between p-3 border rounded-md"
                    data-testid={`shift-discrepancy-${index}`}
                  >
                    <div>
                      <p className="font-medium">{shift.restaurantName}</p>
                      <p className="text-sm text-muted-foreground">
                        {shift.totalShifts} turnos
                      </p>
                    </div>
                    <Badge 
                      variant={hasDiscrepancy ? "destructive" : "secondary"}
                    >
                      {hasDiscrepancy ? formatKwanza(shift.totalDiscrepancies) : 'Sem discrepâncias'}
                    </Badge>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
