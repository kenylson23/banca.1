import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Plus, Filter, Search, CreditCard, Truck, ShoppingBag, Users, Wifi, WifiOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { NewOrderDialog } from "@/components/new-order-dialog";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { formatKwanza } from "@/lib/formatters";
import { format } from "date-fns";
import type { Order, OrderItem, MenuItem, Table } from "@shared/schema";
import { Link } from "wouter";

type OrderType = "all" | "mesa" | "delivery" | "balcao" | "pdv";
type OrderStatus = "all" | "pendente" | "em_preparo" | "pronto" | "servido";

interface PDVOrder extends Order {
  table: Table | null;
  orderItems: Array<OrderItem & { menuItem: MenuItem }>;
}

const orderTypeLabels = {
  mesa: "Mesa",
  delivery: "Delivery",
  balcao: "Balcão",
  pdv: "PDV",
};

const orderTypeIcons = {
  mesa: Users,
  delivery: Truck,
  balcao: ShoppingBag,
  pdv: CreditCard,
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
  const [selectedType, setSelectedType] = useState<OrderType>("all");
  const [selectedStatus, setSelectedStatus] = useState<OrderStatus>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [isOnline, setIsOnline] = useState(typeof navigator !== 'undefined' ? navigator.onLine : true);

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

  const { data: orders = [], isLoading } = useQuery<PDVOrder[]>({
    queryKey: ["/api/orders"],
  });

  const { data: user } = useQuery<{ restaurantId: string }>({
    queryKey: ["/api/auth/user"],
  });

  const filteredOrders = orders?.filter((order) => {
    const matchesType = selectedType === "all" || order.orderType === selectedType;
    const matchesStatus = selectedStatus === "all" || order.status === selectedStatus;
    const matchesSearch =
      !searchQuery ||
      order.customerName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.id.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesType && matchesStatus && matchesSearch;
  });

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold" data-testid="text-pdv-title">
            Ponto de Venda
          </h2>
          <p className="text-muted-foreground">
            Gerir pedidos de balcão, delivery, mesas e PDV
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge
            variant={isOnline ? "default" : "destructive"}
            className="gap-2"
            data-testid="badge-connection-status"
          >
            {isOnline ? <Wifi className="h-3 w-3" /> : <WifiOff className="h-3 w-3" />}
            {isOnline ? "Online" : "Offline"}
          </Badge>
          <Link href="/tables">
            <Button variant="outline" size="lg" data-testid="button-manage-tables">
              <Users className="h-4 w-4 mr-2" />
              Mesas
            </Button>
          </Link>
          {user?.restaurantId && (
            <NewOrderDialog 
              restaurantId={user.restaurantId}
              trigger={
                <Button size="lg" data-testid="button-new-order">
                  <Plus className="h-4 w-4 mr-2" />
                  Novo Pedido
                </Button>
              }
            />
          )}
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filtros
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Tipo de Pedido</label>
              <Tabs value={selectedType} onValueChange={(v) => setSelectedType(v as OrderType)}>
                <TabsList className="grid w-full grid-cols-5">
                  <TabsTrigger value="all" data-testid="filter-type-all">
                    Todos
                  </TabsTrigger>
                  <TabsTrigger value="mesa" data-testid="filter-type-mesa">
                    Mesa
                  </TabsTrigger>
                  <TabsTrigger value="delivery" data-testid="filter-type-delivery">
                    Delivery
                  </TabsTrigger>
                  <TabsTrigger value="balcao" data-testid="filter-type-balcao">
                    Balcão
                  </TabsTrigger>
                  <TabsTrigger value="pdv" data-testid="filter-type-pdv">
                    PDV
                  </TabsTrigger>
                </TabsList>
              </Tabs>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Estado</label>
              <Select
                value={selectedStatus}
                onValueChange={(v) => setSelectedStatus(v as OrderStatus)}
              >
                <SelectTrigger data-testid="select-status">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="pendente">Pendente</SelectItem>
                  <SelectItem value="em_preparo">Em Preparo</SelectItem>
                  <SelectItem value="pronto">Pronto</SelectItem>
                  <SelectItem value="servido">Servido</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Pesquisar</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Cliente, número do pedido..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9"
                  data-testid="input-search"
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4">
        {isLoading ? (
          Array.from({ length: 3 }).map((_, i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <Skeleton className="h-24 w-full" />
              </CardContent>
            </Card>
          ))
        ) : filteredOrders && filteredOrders.length > 0 ? (
          filteredOrders.map((order) => {
            const TypeIcon = orderTypeIcons[order.orderType as keyof typeof orderTypeIcons];
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
                          <Badge variant="outline">
                            {orderTypeLabels[order.orderType as keyof typeof orderTypeLabels]}
                          </Badge>
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
          })
        ) : (
          <Card>
            <CardContent className="p-12 text-center">
              <div className="flex flex-col items-center gap-2">
                <CreditCard className="h-12 w-12 text-muted-foreground" />
                <p className="text-lg font-medium">Nenhum pedido encontrado</p>
                <p className="text-sm text-muted-foreground">
                  Ajuste os filtros ou crie um novo pedido
                </p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
