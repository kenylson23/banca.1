import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Progress } from "@/components/ui/progress";
import { useQuery } from "@tanstack/react-query";
import { formatKwanza } from "@/lib/formatters";
import { 
  Store, Users, ShoppingCart, CreditCard, Package, Table as TableIcon, 
  Building2, TrendingUp, Clock, DollarSign, AlertCircle, BarChart3
} from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from "recharts";
import type { Restaurant } from "@shared/schema";

interface RestaurantDetailsDialogProps {
  restaurantId: string | null;
  isOpen: boolean;
  onClose: () => void;
}

interface RestaurantDetails {
  restaurant: Restaurant;
  metrics: {
    totalOrders: number;
    totalRevenue: string;
    averageTicket: string;
    cancelledOrders: number;
    totalCustomers: number;
    totalMenuItems: number;
    totalTables: number;
    totalBranches: number;
    totalUsers: number;
  };
  revenueHistory: Array<{ date: string; revenue: number; orders: number }>;
  paymentMethods: Array<{ method: string; count: number; total: string }>;
  topProducts: Array<{ name: string; quantity: number; revenue: string }>;
  recentActivity: Array<{ action: string; timestamp: Date; user?: string }>;
}

interface UsageData {
  plan: {
    name: string;
    description?: string;
    maxUsers: number | null;
    maxBranches: number | null;
    maxTables: number | null;
    maxMenuItems: number | null;
    maxOrdersPerMonth: number | null;
  };
  subscription: {
    status: string;
  };
  usage: {
    users: number;
    branches: number;
    tables: number;
    menuItems: number;
    ordersThisMonth: number;
  };
  withinLimits: {
    users: boolean;
    branches: boolean;
    tables: boolean;
    menuItems: boolean;
    orders: boolean;
  };
}

export function RestaurantDetailsDialog({ restaurantId, isOpen, onClose }: RestaurantDetailsDialogProps) {
  const { data, isLoading } = useQuery<RestaurantDetails>({
    queryKey: ['/api/superadmin/restaurants', restaurantId, 'details'],
    enabled: !!restaurantId && isOpen,
  });

  const { data: usage, isLoading: usageLoading } = useQuery<UsageData>({
    queryKey: ['/api/superadmin/restaurants', restaurantId, 'usage'],
    enabled: !!restaurantId && isOpen,
  });

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Store className="h-5 w-5" />
            {data?.restaurant?.name || "Detalhes do Restaurante"}
          </DialogTitle>
          <DialogDescription>
            Informações completas e métricas de performance
          </DialogDescription>
        </DialogHeader>

        {isLoading ? (
          <div className="space-y-4">
            <Skeleton className="h-10 w-full" />
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[...Array(4)].map((_, i) => (
                <Skeleton key={i} className="h-24" />
              ))}
            </div>
            <Skeleton className="h-64 w-full" />
          </div>
        ) : data ? (
          <Tabs defaultValue="overview" className="w-full">
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger value="overview" data-testid="tab-overview">Visão Geral</TabsTrigger>
              <TabsTrigger value="plan" data-testid="tab-plan">Plano e Uso</TabsTrigger>
              <TabsTrigger value="metrics" data-testid="tab-metrics">Métricas</TabsTrigger>
              <TabsTrigger value="financial" data-testid="tab-financial">Financeiro</TabsTrigger>
              <TabsTrigger value="activity" data-testid="tab-activity">Atividade</TabsTrigger>
            </TabsList>

            {/* OVERVIEW TAB */}
            <TabsContent value="overview" className="space-y-4 mt-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Informações do Restaurante</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <div>
                      <p className="text-sm text-muted-foreground">Email</p>
                      <p className="font-medium" data-testid="text-restaurant-email">{data.restaurant.email}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Telefone</p>
                      <p className="font-medium">{data.restaurant.phone || 'Não informado'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Endereço</p>
                      <p className="font-medium">{data.restaurant.address || 'Não informado'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Status</p>
                      <Badge variant={
                        data.restaurant.status === 'ativo' ? 'default' : 
                        data.restaurant.status === 'pendente' ? 'secondary' : 
                        'destructive'
                      }>
                        {data.restaurant.status}
                      </Badge>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Cadastrado em</p>
                      <p className="font-medium">
                        {new Date(data.restaurant.createdAt!).toLocaleDateString('pt-BR', {
                          day: '2-digit',
                          month: 'long',
                          year: 'numeric'
                        })}
                      </p>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Recursos Configurados</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Users className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">Usuários</span>
                      </div>
                      <Badge variant="secondary">{data.metrics.totalUsers}</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Building2 className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">Filiais</span>
                      </div>
                      <Badge variant="secondary">{data.metrics.totalBranches}</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <TableIcon className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">Mesas</span>
                      </div>
                      <Badge variant="secondary">{data.metrics.totalTables}</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Package className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">Itens do Menu</span>
                      </div>
                      <Badge variant="secondary">{data.metrics.totalMenuItems}</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Users className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">Clientes</span>
                      </div>
                      <Badge variant="secondary">{data.metrics.totalCustomers}</Badge>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* PLAN AND USAGE TAB */}
            <TabsContent value="plan" className="space-y-4 mt-4">
              {usageLoading ? (
                <div className="space-y-4">
                  <Skeleton className="h-32" />
                  <Skeleton className="h-64" />
                </div>
              ) : usage ? (
                <>
                  <Card>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-lg">Plano Atual: {usage.plan.name}</CardTitle>
                        <Badge variant="outline">{usage.subscription.status}</Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground">{usage.plan.description || 'Sem descrição'}</p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Uso dos Recursos</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      {/* Users */}
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Users className="h-4 w-4 text-blue-500" />
                            <span className="text-sm font-medium">Usuários</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className={`text-sm font-bold ${usage.withinLimits.users ? 'text-green-500' : 'text-red-500'}`}>
                              {usage.usage.users}
                            </span>
                            <span className="text-sm text-muted-foreground">
                              / {usage.plan.maxUsers !== null ? usage.plan.maxUsers : 'Ilimitado'}
                            </span>
                            {!usage.withinLimits.users && (
                              <Badge variant="destructive" className="text-xs">Limite excedido</Badge>
                            )}
                          </div>
                        </div>
                        {usage.plan.maxUsers !== null && (
                          <Progress 
                            value={usage.plan.maxUsers === 0 ? 100 : Math.min((usage.usage.users / usage.plan.maxUsers) * 100, 100)} 
                            className="h-2"
                          />
                        )}
                      </div>

                      {/* Branches */}
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Building2 className="h-4 w-4 text-purple-500" />
                            <span className="text-sm font-medium">Filiais</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className={`text-sm font-bold ${usage.withinLimits.branches ? 'text-green-500' : 'text-red-500'}`}>
                              {usage.usage.branches}
                            </span>
                            <span className="text-sm text-muted-foreground">
                              / {usage.plan.maxBranches !== null ? usage.plan.maxBranches : 'Ilimitado'}
                            </span>
                            {!usage.withinLimits.branches && (
                              <Badge variant="destructive" className="text-xs">Limite excedido</Badge>
                            )}
                          </div>
                        </div>
                        {usage.plan.maxBranches !== null && (
                          <Progress 
                            value={usage.plan.maxBranches === 0 ? 100 : Math.min((usage.usage.branches / usage.plan.maxBranches) * 100, 100)} 
                            className="h-2"
                          />
                        )}
                      </div>

                      {/* Tables */}
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <TableIcon className="h-4 w-4 text-orange-500" />
                            <span className="text-sm font-medium">Mesas</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className={`text-sm font-bold ${usage.withinLimits.tables ? 'text-green-500' : 'text-red-500'}`}>
                              {usage.usage.tables}
                            </span>
                            <span className="text-sm text-muted-foreground">
                              / {usage.plan.maxTables !== null ? usage.plan.maxTables : 'Ilimitado'}
                            </span>
                            {!usage.withinLimits.tables && (
                              <Badge variant="destructive" className="text-xs">Limite excedido</Badge>
                            )}
                          </div>
                        </div>
                        {usage.plan.maxTables !== null && (
                          <Progress 
                            value={usage.plan.maxTables === 0 ? 100 : Math.min((usage.usage.tables / usage.plan.maxTables) * 100, 100)} 
                            className="h-2"
                          />
                        )}
                      </div>

                      {/* Menu Items */}
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Package className="h-4 w-4 text-green-500" />
                            <span className="text-sm font-medium">Produtos no Menu</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className={`text-sm font-bold ${usage.withinLimits.menuItems ? 'text-green-500' : 'text-red-500'}`}>
                              {usage.usage.menuItems}
                            </span>
                            <span className="text-sm text-muted-foreground">
                              / {usage.plan.maxMenuItems !== null ? usage.plan.maxMenuItems : 'Ilimitado'}
                            </span>
                            {!usage.withinLimits.menuItems && (
                              <Badge variant="destructive" className="text-xs">Limite excedido</Badge>
                            )}
                          </div>
                        </div>
                        {usage.plan.maxMenuItems !== null && (
                          <Progress 
                            value={usage.plan.maxMenuItems === 0 ? 100 : Math.min((usage.usage.menuItems / usage.plan.maxMenuItems) * 100, 100)} 
                            className="h-2"
                          />
                        )}
                      </div>

                      {/* Orders This Month */}
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <BarChart3 className="h-4 w-4 text-cyan-500" />
                            <span className="text-sm font-medium">Pedidos este mês</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className={`text-sm font-bold ${usage.withinLimits.orders ? 'text-green-500' : 'text-red-500'}`}>
                              {usage.usage.ordersThisMonth}
                            </span>
                            <span className="text-sm text-muted-foreground">
                              / {usage.plan.maxOrdersPerMonth !== null ? usage.plan.maxOrdersPerMonth : 'Ilimitado'}
                            </span>
                            {!usage.withinLimits.orders && (
                              <Badge variant="destructive" className="text-xs">Limite excedido</Badge>
                            )}
                          </div>
                        </div>
                        {usage.plan.maxOrdersPerMonth !== null && (
                          <Progress 
                            value={usage.plan.maxOrdersPerMonth === 0 ? 100 : Math.min((usage.usage.ordersThisMonth / usage.plan.maxOrdersPerMonth) * 100, 100)} 
                            className="h-2"
                          />
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  Informações de plano não disponíveis
                </div>
              )}
            </TabsContent>

            {/* METRICS TAB */}
            <TabsContent value="metrics" className="space-y-4 mt-4">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between gap-2 pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">
                      Total Pedidos
                    </CardTitle>
                    <ShoppingCart className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold" data-testid="text-total-orders">
                      {data.metrics.totalOrders}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between gap-2 pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">
                      Receita Total
                    </CardTitle>
                    <DollarSign className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {formatKwanza(data.metrics.totalRevenue)}
                    </div>
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
                    <div className="text-2xl font-bold">
                      {formatKwanza(data.metrics.averageTicket)}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between gap-2 pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">
                      Cancelados
                    </CardTitle>
                    <AlertCircle className="h-4 w-4 text-red-500" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-red-500">
                      {data.metrics.cancelledOrders}
                    </div>
                  </CardContent>
                </Card>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle>Evolução de Receita (Últimos 30 Dias)</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={data.revenueHistory}>
                      <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                      <XAxis 
                        dataKey="date" 
                        tick={{ fontSize: 11 }}
                        stroke="hsl(var(--muted-foreground))"
                      />
                      <YAxis 
                        tick={{ fontSize: 11 }}
                        stroke="hsl(var(--muted-foreground))"
                        tickFormatter={(value) => `${(value / 1000).toFixed(0)}k`}
                      />
                      <Tooltip 
                        formatter={(value: number) => formatKwanza(value.toString())}
                        contentStyle={{
                          backgroundColor: 'hsl(var(--card))',
                          border: '1px solid hsl(var(--border))',
                          borderRadius: '8px'
                        }}
                      />
                      <Line 
                        type="monotone" 
                        dataKey="revenue" 
                        stroke="#0891B2" 
                        strokeWidth={2}
                        dot={{ r: 3 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Top 10 Produtos Mais Vendidos</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={data.topProducts} layout="vertical">
                      <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                      <XAxis type="number" tick={{ fontSize: 11 }} />
                      <YAxis 
                        dataKey="name" 
                        type="category" 
                        tick={{ fontSize: 11 }}
                        width={150}
                      />
                      <Tooltip 
                        formatter={(value: number) => `${value} unidades`}
                        contentStyle={{
                          backgroundColor: 'hsl(var(--card))',
                          border: '1px solid hsl(var(--border))',
                          borderRadius: '8px'
                        }}
                      />
                      <Bar dataKey="quantity" fill="#0891B2" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </TabsContent>

            {/* FINANCIAL TAB */}
            <TabsContent value="financial" className="space-y-4 mt-4">
              <Card>
                <CardHeader>
                  <CardTitle>Métodos de Pagamento</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {data.paymentMethods.map((method: any, index: number) => (
                      <div key={index} className="flex items-center justify-between p-3 border rounded-md">
                        <div className="flex items-center gap-2">
                          <CreditCard className="h-4 w-4 text-muted-foreground" />
                          <span className="font-medium capitalize">{method.method}</span>
                        </div>
                        <div className="text-right">
                          <p className="font-bold">{formatKwanza(method.total)}</p>
                          <p className="text-sm text-muted-foreground">{method.count} transações</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* ACTIVITY TAB */}
            <TabsContent value="activity" className="space-y-4 mt-4">
              <Card>
                <CardHeader>
                  <CardTitle>Atividade Recente</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {data.recentActivity.map((activity: any, index: number) => (
                      <div key={index} className="flex items-start gap-3 p-3 border rounded-md">
                        <Clock className="h-4 w-4 text-muted-foreground mt-0.5" />
                        <div className="flex-1">
                          <p className="text-sm font-medium">{activity.action}</p>
                          <p className="text-xs text-muted-foreground">
                            {new Date(activity.timestamp).toLocaleString('pt-BR')}
                            {activity.user && ` • ${activity.user}`}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        ) : null}
      </DialogContent>
    </Dialog>
  );
}
