import { useState, useCallback } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { ShoppingCart, Package, Clock, Download, Filter, Eye, Wallet, LayoutDashboard } from "lucide-react";
import { format } from "date-fns";
import { useWebSocket } from "@/hooks/useWebSocket";
import { queryClient } from "@/lib/queryClient";
import { useAuth } from "@/hooks/useAuth";
import { PrintOrder } from "@/components/PrintOrder";
import { FinancialShiftManager } from "@/components/FinancialShiftManager";
import ReportsDashboard from "./reports-dashboard";

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

export default function Reports() {
  const { user } = useAuth();
  const today = new Date();
  const sevenDaysAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);

  const [startDate, setStartDate] = useState(format(sevenDaysAgo, 'yyyy-MM-dd'));
  const [endDate, setEndDate] = useState(format(today, 'yyyy-MM-dd'));
  const [orderStatus, setOrderStatus] = useState<string>("todos");
  const [orderType, setOrderType] = useState<string>("todos");
  
  const isSuperadmin = user?.role === 'superadmin';

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

  // WebSocket handler for real-time updates
  const handleWebSocketMessage = useCallback((message: any) => {
    if (message.type === 'new_order' || message.type === 'order_status_updated') {
      // Invalidate all reports to ensure they show updated data
      queryClient.invalidateQueries({ queryKey: ["/api/reports/orders"] });
      queryClient.invalidateQueries({ queryKey: ["/api/reports/products"] });
      queryClient.invalidateQueries({ queryKey: ["/api/reports/performance"] });
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

  return (
    <div className="space-y-4 sm:space-y-6 p-4 sm:p-6">
      <div className="flex flex-col gap-2 sm:gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold">Relatórios</h1>
          <p className="text-sm sm:text-base text-muted-foreground">
            Análise detalhada de vendas, pedidos e desempenho
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filtros
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <div className="space-y-2">
              <Label htmlFor="startDate">Data Inicial</Label>
              <Input
                id="startDate"
                data-testid="input-start-date"
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="endDate">Data Final</Label>
              <Input
                id="endDate"
                data-testid="input-end-date"
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Status do Pedido</Label>
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
              <Label>Tipo de Pedido</Label>
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
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="dashboard" className="space-y-4">
        <TabsList className={`grid w-full gap-1 ${isSuperadmin ? 'grid-cols-2 sm:grid-cols-4' : 'grid-cols-3 sm:grid-cols-5'}`}>
          <TabsTrigger value="dashboard" data-testid="tab-dashboard" className="text-xs sm:text-sm">
            <LayoutDashboard className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
            <span className="hidden sm:inline">Dashboard</span>
            <span className="inline sm:hidden">Dash</span>
          </TabsTrigger>
          <TabsTrigger value="orders" data-testid="tab-orders" className="text-xs sm:text-sm">
            <ShoppingCart className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
            <span className="hidden sm:inline">Pedidos</span>
            <span className="inline sm:hidden">Pedido</span>
          </TabsTrigger>
          <TabsTrigger value="products" data-testid="tab-products" className="text-xs sm:text-sm">
            <Package className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
            <span className="hidden sm:inline">Produtos</span>
            <span className="inline sm:hidden">Prod.</span>
          </TabsTrigger>
          <TabsTrigger value="performance" data-testid="tab-performance" className="text-xs sm:text-sm">
            <Clock className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
            <span className="hidden sm:inline">Performance</span>
            <span className="inline sm:hidden">Perf.</span>
          </TabsTrigger>
          {!isSuperadmin && (
            <TabsTrigger value="financial" data-testid="tab-financial" className="text-xs sm:text-sm">
              <Wallet className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
              <span className="hidden sm:inline">Gestão Financeira</span>
              <span className="inline sm:hidden">Finan.</span>
            </TabsTrigger>
          )}
        </TabsList>

        <TabsContent value="dashboard" className="space-y-4">
          <ReportsDashboard />
        </TabsContent>

        <TabsContent value="orders" className="space-y-4">
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
        </TabsContent>

        <TabsContent value="products" className="space-y-4">
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
        </TabsContent>

        <TabsContent value="performance" className="space-y-4">
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
        </TabsContent>

        {!isSuperadmin && (
          <TabsContent value="financial" className="space-y-4">
            <FinancialShiftManager />
          </TabsContent>
        )}
      </Tabs>
    </div>
  );
}
