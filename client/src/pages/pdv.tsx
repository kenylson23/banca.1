import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Plus, RefreshCw, Search, ShoppingBag, Truck, UtensilsCrossed, Map, Wifi, WifiOff, ArrowUpDown, ArrowUp, ArrowDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { NewOrderDialog } from "@/components/new-order-dialog";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { formatKwanza } from "@/lib/formatters";
import { format } from "date-fns";
import type { Order, OrderItem, MenuItem, Table } from "@shared/schema";
import { TablesPanel } from "@/components/TablesPanel";

type OrderType = "balcao" | "delivery" | "mesas";
type OrderFilter = "all" | "pendente" | "em_curso";
type SortField = "date" | "status" | "total" | "customer";
type SortDirection = "asc" | "desc";

interface PDVOrder extends Order {
  table: Table | null;
  orderItems: Array<OrderItem & { menuItem: MenuItem }>;
}

const orderTypeIcons = {
  mesa: UtensilsCrossed,
  delivery: Truck,
  balcao: ShoppingBag,
};

const statusColors = {
  pendente: "bg-chart-4 text-chart-4-foreground",
  em_preparo: "bg-chart-2 text-chart-2-foreground",
  pronto: "bg-chart-3 text-chart-3-foreground",
  servido: "bg-muted text-muted-foreground",
};

const statusLabels = {
  pendente: "Pendente",
  em_preparo: "Em Preparo",
  pronto: "Pronto",
  servido: "Servido",
};

export default function PDV() {
  const [activeTab, setActiveTab] = useState<OrderType>("balcao");
  const [orderFilter, setOrderFilter] = useState<OrderFilter>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [showSearch, setShowSearch] = useState(false);
  const [isOnline, setIsOnline] = useState(typeof navigator !== 'undefined' ? navigator.onLine : true);
  const [sortField, setSortField] = useState<SortField>("date");
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc");

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const { data: orders = [], isLoading, refetch } = useQuery<PDVOrder[]>({
    queryKey: ["/api/orders"],
  });

  const { data: user } = useQuery<{ restaurantId: string }>({
    queryKey: ["/api/auth/user"],
  });

  const typeMapping: Record<OrderType, string> = {
    balcao: "balcao",
    delivery: "delivery",
    mesas: "mesa"
  };

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  const getFilteredOrders = (type: OrderType, filter: OrderFilter) => {
    let filtered = orders?.filter((order) => {
      const matchesType = order.orderType === typeMapping[type];
      const matchesSearch = !searchQuery || 
        order.customerName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        order.id.toLowerCase().includes(searchQuery.toLowerCase());
      
      if (!matchesType || !matchesSearch) return false;
      
      if (filter === "all") return true;
      if (filter === "pendente") return order.status === "pendente";
      if (filter === "em_curso") return order.status === "em_preparo" || order.status === "pronto";
      
      return true;
    }) || [];

    // Apply sorting
    return filtered.sort((a, b) => {
      let comparison = 0;
      
      switch (sortField) {
        case "date":
          comparison = new Date(a.createdAt || 0).getTime() - new Date(b.createdAt || 0).getTime();
          break;
        case "status":
          const statusOrder = { pendente: 1, em_preparo: 2, pronto: 3, servido: 4 };
          comparison = (statusOrder[a.status as keyof typeof statusOrder] || 0) - (statusOrder[b.status as keyof typeof statusOrder] || 0);
          break;
        case "total":
          comparison = Number(a.totalAmount || 0) - Number(b.totalAmount || 0);
          break;
        case "customer":
          comparison = (a.customerName || "").localeCompare(b.customerName || "");
          break;
      }
      
      return sortDirection === "asc" ? comparison : -comparison;
    });
  };

  const getOrderCounts = (type: OrderType) => {
    const allTypeOrders = orders?.filter(o => o.orderType === typeMapping[type]) || [];
    const total = allTypeOrders.length;
    const pendente = allTypeOrders.filter(o => o.status === "pendente").length;
    const emCurso = allTypeOrders.filter(o => o.status === "em_preparo" || o.status === "pronto").length;
    const revenue = allTypeOrders.reduce((sum, order) => sum + Number(order.totalAmount || 0), 0);
    
    return { total, pendente, emCurso, revenue };
  };

  const balcaoCounts = getOrderCounts("balcao");
  const deliveryCounts = getOrderCounts("delivery");
  const mesasCounts = getOrderCounts("mesas");

  const filteredOrders = getFilteredOrders(activeTab, orderFilter);

  const renderOrdersList = () => {
    if (isLoading) {
      return (
        <div className="grid gap-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <Skeleton className="h-24 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      );
    }

    if (filteredOrders.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center py-16 px-4">
          <UtensilsCrossed className="h-16 w-16 text-primary mb-4" />
          <p className="text-lg text-muted-foreground mb-6">
            Criar pedidos para cada tipo de serviço.
          </p>
          {user?.restaurantId && (
            <NewOrderDialog 
              restaurantId={user.restaurantId}
              trigger={
                <Button size="lg" data-testid="button-new-order-empty">
                  <Plus className="h-4 w-4 mr-2" />
                  Novo pedido
                </Button>
              }
            />
          )}
        </div>
      );
    }

    return (
      <div className="grid gap-4">
        {filteredOrders.map((order) => {
          const TypeIcon = orderTypeIcons[order.orderType as keyof typeof orderTypeIcons] || ShoppingBag;
          return (
            <Card
              key={order.id}
              className="hover-elevate cursor-pointer"
              data-testid={`card-order-${order.id}`}
            >
              <CardContent className="p-6">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-4 flex-1">
                    <div className="p-3 rounded-lg bg-muted">
                      <TypeIcon className="h-6 w-6" />
                    </div>
                    <div className="flex-1 space-y-2">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="font-semibold text-lg" data-testid={`text-order-id-${order.id}`}>
                          #{order.id.slice(0, 8)}
                        </h3>
                        <Badge className={statusColors[order.status as keyof typeof statusColors]}>
                          {statusLabels[order.status as keyof typeof statusLabels]}
                        </Badge>
                        {!order.isSynced && (
                          <Badge variant="secondary" className="gap-1">
                            <WifiOff className="h-3 w-3" />
                            Pendente Sincronização
                          </Badge>
                        )}
                      </div>

                      <div className="grid grid-cols-2 gap-2 text-sm text-muted-foreground">
                        {order.customerName && (
                          <div>
                            <span className="font-medium">Cliente:</span> {order.customerName}
                          </div>
                        )}
                        {order.table && (
                          <div>
                            <span className="font-medium">Mesa:</span> {order.table.number}
                          </div>
                        )}
                        <div>
                          <span className="font-medium">Data:</span>{" "}
                          {order.createdAt ? format(new Date(order.createdAt), "dd/MM/yyyy HH:mm") : "-"}
                        </div>
                        <div>
                          <span className="font-medium">Itens:</span> {order.orderItems.length}
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-2">
                        {order.orderItems.slice(0, 3).map((item) => (
                          <Badge key={item.id} variant="secondary">
                            {item.quantity}x {item.menuItem.name}
                          </Badge>
                        ))}
                        {order.orderItems.length > 3 && (
                          <Badge variant="secondary">
                            +{order.orderItems.length - 3} mais
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="text-right space-y-2">
                    <div className="text-2xl font-bold" data-testid={`text-order-total-${order.id}`}>
                      {formatKwanza(order.totalAmount)}
                    </div>
                    {order.paymentMethod && (
                      <Badge variant="outline">{order.paymentMethod}</Badge>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    );
  };

  const renderRevenueDisplay = (revenue: number, tabType: OrderType) => {
    return (
      <div className="flex items-center gap-2">
        <span className="text-sm text-muted-foreground">Total:</span>
        <span className="text-xl font-bold" data-testid={`text-revenue-${tabType}`}>
          {formatKwanza(revenue)}
        </span>
      </div>
    );
  };

  const renderSortHeader = () => {
    const SortIcon = ({ field }: { field: SortField }) => {
      if (sortField !== field) {
        return <ArrowUpDown className="h-4 w-4 opacity-40" />;
      }
      return sortDirection === "asc" ? 
        <ArrowUp className="h-4 w-4" /> : 
        <ArrowDown className="h-4 w-4" />;
    };

    return (
      <div className="grid grid-cols-4 gap-4 mb-4 px-4 py-2 rounded-md bg-muted/50">
        <Button
          variant="ghost"
          size="sm"
          className="justify-start font-semibold hover-elevate"
          onClick={() => handleSort("date")}
          data-testid="sort-date"
        >
          DATA
          <SortIcon field="date" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          className="justify-start font-semibold hover-elevate"
          onClick={() => handleSort("status")}
          data-testid="sort-status"
        >
          ESTADO
          <SortIcon field="status" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          className="justify-start font-semibold hover-elevate"
          onClick={() => handleSort("total")}
          data-testid="sort-total"
        >
          TOTAL
          <SortIcon field="total" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          className="justify-start font-semibold hover-elevate"
          onClick={() => handleSort("customer")}
          data-testid="sort-customer"
        >
          CLIENTE
          <SortIcon field="customer" />
        </Button>
      </div>
    );
  };

  const renderOrderFilters = (tabType: OrderType) => {
    const counts = getOrderCounts(tabType);
    
    return (
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Button
            variant={orderFilter === "all" ? "default" : "ghost"}
            size="sm"
            onClick={() => setOrderFilter("all")}
            data-testid="filter-all"
          >
            Tudo
          </Button>
          <Button
            variant={orderFilter === "pendente" ? "default" : "ghost"}
            size="sm"
            onClick={() => setOrderFilter("pendente")}
            data-testid="filter-pendente"
            className="gap-1"
          >
            Pendente
            {counts.pendente > 0 && (
              <Badge variant="secondary" className="ml-1 h-5 min-w-5 px-1">
                {counts.pendente}
              </Badge>
            )}
          </Button>
          <Button
            variant={orderFilter === "em_curso" ? "default" : "ghost"}
            size="sm"
            onClick={() => setOrderFilter("em_curso")}
            data-testid="filter-em-curso"
            className="gap-1"
          >
            Em curso
            {counts.emCurso > 0 && (
              <Badge variant="secondary" className="ml-1 h-5 min-w-5 px-1">
                {counts.emCurso}
              </Badge>
            )}
          </Button>
          {tabType === "delivery" && (
            <Button
              variant="ghost"
              size="sm"
              data-testid="button-delivery-map"
              className="gap-2"
            >
              <Map className="h-4 w-4" />
              Mapa de entregas
            </Button>
          )}
        </div>
        {renderRevenueDisplay(counts.revenue, tabType)}
      </div>
    );
  };

  const handleTabChange = (newTab: string) => {
    setActiveTab(newTab as OrderType);
    setOrderFilter("all");
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => refetch()}
            data-testid="button-refresh"
          >
            <RefreshCw className="h-5 w-5" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setShowSearch(!showSearch)}
            data-testid="button-search"
          >
            <Search className="h-5 w-5" />
          </Button>
        </div>
        <div className="flex items-center gap-2">
          {user?.restaurantId && (
            <NewOrderDialog 
              restaurantId={user.restaurantId}
              trigger={
                <Button size="lg" data-testid="button-new-order">
                  <Plus className="h-4 w-4 mr-2" />
                  Novo pedido
                </Button>
              }
            />
          )}
        </div>
      </div>

      {showSearch && (
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Pesquisar por cliente ou número do pedido..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
            data-testid="input-search"
          />
        </div>
      )}

      <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
        <TabsList className="grid w-full grid-cols-3 bg-muted">
          <TabsTrigger value="balcao" data-testid="tab-balcao" className="gap-2">
            <ShoppingBag className="h-4 w-4" />
            Balcão
            {balcaoCounts.total > 0 && (
              <Badge variant="secondary" className="ml-1 h-5 min-w-5 px-1">
                {balcaoCounts.total}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="delivery" data-testid="tab-delivery" className="gap-2">
            <Truck className="h-4 w-4" />
            Delivery
            {deliveryCounts.total > 0 && (
              <Badge variant="secondary" className="ml-1 h-5 min-w-5 px-1">
                {deliveryCounts.total}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="mesas" data-testid="tab-mesas" className="gap-2">
            <UtensilsCrossed className="h-4 w-4" />
            Mesas
            {mesasCounts.total > 0 && (
              <Badge variant="secondary" className="ml-1 h-5 min-w-5 px-1">
                {mesasCounts.total}
              </Badge>
            )}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="balcao" className="mt-6" data-testid="content-balcao">
          {renderOrderFilters("balcao")}
          {renderSortHeader()}
          {renderOrdersList()}
        </TabsContent>

        <TabsContent value="delivery" className="mt-6" data-testid="content-delivery">
          {renderOrderFilters("delivery")}
          {renderSortHeader()}
          {renderOrdersList()}
        </TabsContent>

        <TabsContent value="mesas" className="mt-6" data-testid="content-mesas">
          <div className="flex items-center justify-end mb-6">
            {renderRevenueDisplay(mesasCounts.revenue, "mesas")}
          </div>
          <TablesPanel />
        </TabsContent>
      </Tabs>
    </div>
  );
}
