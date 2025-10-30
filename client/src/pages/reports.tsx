import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { TrendingUp, ShoppingCart, Package, Clock, Download, Filter } from "lucide-react";
import { format } from "date-fns";

type SalesReport = {
  totalSales: string;
  totalOrders: number;
  averageTicket: string;
  ordersByType: Array<{ type: string; count: number; revenue: string }>;
  ordersByStatus: Array<{ status: string; count: number }>;
  salesByDay: Array<{ date: string; sales: string; orders: number }>;
};

type OrderReport = {
  id: string;
  createdAt: string;
  table: { number: number } | null;
  orderType: string;
  status: string;
  totalAmount: string;
  orderItems: any[];
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

const CHART_COLORS = ['#0ea5e9', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

export default function Reports() {
  const today = new Date();
  const sevenDaysAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);

  const [startDate, setStartDate] = useState(format(sevenDaysAgo, 'yyyy-MM-dd'));
  const [endDate, setEndDate] = useState(format(today, 'yyyy-MM-dd'));
  const [orderStatus, setOrderStatus] = useState<string>("");
  const [orderType, setOrderType] = useState<string>("");

  const { data: salesReport, isLoading: loadingSales } = useQuery<SalesReport>({
    queryKey: ['/api/reports/sales', { startDate, endDate }],
    enabled: !!startDate && !!endDate,
  });

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

  const exportSalesCSV = () => {
    if (!salesReport?.salesByDay) return;
    exportToCSV(salesReport.salesByDay, 'relatorio_vendas');
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
    <div className="space-y-6 p-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold">Relatórios</h1>
          <p className="text-muted-foreground">
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
                  <SelectItem value="">Todos</SelectItem>
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
                  <SelectItem value="">Todos</SelectItem>
                  <SelectItem value="mesa">Mesa</SelectItem>
                  <SelectItem value="delivery">Delivery</SelectItem>
                  <SelectItem value="takeout">Retirada</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="sales" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="sales" data-testid="tab-sales">
            <TrendingUp className="h-4 w-4 mr-2" />
            Vendas
          </TabsTrigger>
          <TabsTrigger value="orders" data-testid="tab-orders">
            <ShoppingCart className="h-4 w-4 mr-2" />
            Pedidos
          </TabsTrigger>
          <TabsTrigger value="products" data-testid="tab-products">
            <Package className="h-4 w-4 mr-2" />
            Produtos
          </TabsTrigger>
          <TabsTrigger value="performance" data-testid="tab-performance">
            <Clock className="h-4 w-4 mr-2" />
            Performance
          </TabsTrigger>
        </TabsList>

        <TabsContent value="sales" className="space-y-4">
          {loadingSales ? (
            <div className="space-y-4">
              <Skeleton className="h-32 w-full" />
              <Skeleton className="h-64 w-full" />
            </div>
          ) : (
            <>
              <div className="grid gap-4 md:grid-cols-3">
                <Card>
                  <CardHeader className="pb-2">
                    <CardDescription>Vendas Totais</CardDescription>
                    <CardTitle className="text-3xl" data-testid="text-total-sales">
                      Kz {salesReport?.totalSales || "0.00"}
                    </CardTitle>
                  </CardHeader>
                </Card>
                <Card>
                  <CardHeader className="pb-2">
                    <CardDescription>Total de Pedidos</CardDescription>
                    <CardTitle className="text-3xl" data-testid="text-total-orders">
                      {salesReport?.totalOrders || 0}
                    </CardTitle>
                  </CardHeader>
                </Card>
                <Card>
                  <CardHeader className="pb-2">
                    <CardDescription>Ticket Médio</CardDescription>
                    <CardTitle className="text-3xl" data-testid="text-average-ticket">
                      Kz {salesReport?.averageTicket || "0.00"}
                    </CardTitle>
                  </CardHeader>
                </Card>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle>Vendas por Dia</CardTitle>
                    <Button size="sm" variant="outline" onClick={exportSalesCSV} data-testid="button-export-sales">
                      <Download className="h-4 w-4 mr-2" />
                      Exportar
                    </Button>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <LineChart data={salesReport?.salesByDay || []}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="date" tickFormatter={(date) => format(new Date(date), 'dd/MM')} />
                        <YAxis />
                        <Tooltip 
                          labelFormatter={(date) => format(new Date(date), 'dd/MM/yyyy')}
                          formatter={(value: number) => [`Kz ${value.toFixed(2)}`, 'Vendas']}
                        />
                        <Legend />
                        <Line type="monotone" dataKey="sales" stroke="#0ea5e9" name="Vendas" />
                      </LineChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Vendas por Tipo de Pedido</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <PieChart>
                        <Pie
                          data={salesReport?.ordersByType || []}
                          dataKey="revenue"
                          nameKey="type"
                          cx="50%"
                          cy="50%"
                          outerRadius={100}
                          label={(entry) => `${typeLabels[entry.type as keyof typeof typeLabels]}: Kz ${parseFloat(entry.revenue).toFixed(2)}`}
                        >
                          {(salesReport?.ordersByType || []).map((_: any, index: number) => (
                            <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip formatter={(value: number) => `Kz ${value.toFixed(2)}`} />
                      </PieChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle>Pedidos por Status</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={salesReport?.ordersByStatus || []}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="status" tickFormatter={(status) => statusLabels[status as keyof typeof statusLabels]} />
                      <YAxis />
                      <Tooltip labelFormatter={(status) => statusLabels[status as keyof typeof statusLabels]} />
                      <Legend />
                      <Bar dataKey="count" fill="#10b981" name="Quantidade" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </>
          )}
        </TabsContent>

        <TabsContent value="orders" className="space-y-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Lista de Pedidos</CardTitle>
                <CardDescription>
                  {ordersReport?.length || 0} pedidos encontrados
                </CardDescription>
              </div>
              <Button size="sm" variant="outline" onClick={exportOrdersCSV} data-testid="button-export-orders">
                <Download className="h-4 w-4 mr-2" />
                Exportar
              </Button>
            </CardHeader>
            <CardContent>
              {loadingOrders ? (
                <Skeleton className="h-64 w-full" />
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Data/Hora</TableHead>
                        <TableHead>Mesa</TableHead>
                        <TableHead>Tipo</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Itens</TableHead>
                        <TableHead className="text-right">Total</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {ordersReport && ordersReport.length > 0 ? (
                        ordersReport.map((order: any) => (
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
                          </TableRow>
                        ))
                      ) : (
                        <TableRow>
                          <TableCell colSpan={6} className="text-center text-muted-foreground">
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
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle>Top 20 Produtos Mais Vendidos</CardTitle>
                  <Button size="sm" variant="outline" onClick={exportProductsCSV} data-testid="button-export-products">
                    <Download className="h-4 w-4 mr-2" />
                    Exportar
                  </Button>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
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
                  <CardTitle>Vendas por Categoria</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={productsReport?.productsByCategory || []}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="categoryName" />
                      <YAxis />
                      <Tooltip formatter={(value: number) => `Kz ${value.toFixed(2)}`} />
                      <Legend />
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
                  <CardHeader>
                    <CardDescription>Tempo Médio de Preparo</CardDescription>
                    <CardTitle className="text-3xl" data-testid="text-avg-prep-time">
                      {performanceReport?.averagePrepTime || "0.0"} min
                    </CardTitle>
                  </CardHeader>
                </Card>
                <Card>
                  <CardHeader>
                    <CardDescription>Taxa de Conclusão</CardDescription>
                    <CardTitle className="text-3xl" data-testid="text-completion-rate">
                      {performanceReport?.completionRate || "0.0"}%
                    </CardTitle>
                  </CardHeader>
                </Card>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <Card>
                  <CardHeader>
                    <CardTitle>Horários de Pico</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart data={performanceReport?.peakHours || []}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="hour" tickFormatter={(hour) => `${hour}:00`} />
                        <YAxis />
                        <Tooltip labelFormatter={(hour) => `${hour}:00`} />
                        <Legend />
                        <Bar dataKey="orders" fill="#8b5cf6" name="Pedidos" />
                      </BarChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Top 10 Mesas</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="overflow-x-auto">
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
      </Tabs>
    </div>
  );
}
