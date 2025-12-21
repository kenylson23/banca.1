import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { 
  Plus,
  RefreshCw,
  Search,
  ShoppingCart,
  Truck,
  UtensilsCrossed,
  Map,
  MapPin,
  Phone,
  Clock,
  User
} from "lucide-react";
import { PDVIcon } from "@/components/custom-icons";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { NewOrderDialog } from "@/components/new-order-dialog";
import { OrderDetailsDialog } from "@/components/order-details-dialog";
import type { Order, OrderItem, MenuItem, Table, Customer } from "@shared/schema";
import { RestaurantFloorPlan } from "@/components/RestaurantFloorPlan";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { PDVKpiCard } from "@/components/pdv-kpi-card";
import { PDVOrderCard } from "@/components/pdv-order-card";
import { ShimmerSkeleton } from "@/components/shimmer-skeleton";
import { formatKwanza } from "@/lib/formatters";
import { motion, AnimatePresence } from "framer-motion";

type OrderType = "balcao" | "delivery" | "mesas";
type OrderFilter = "all" | "pendente" | "em_curso";

interface PDVOrder extends Order {
  customer: Customer | null;
  table: Table | null;
  orderItems: Array<OrderItem & { menuItem: MenuItem }>;
}

export default function PDV() {
  const [, setLocation] = useLocation();
  const [activeTab, setActiveTab] = useState<OrderType>("balcao");
  const [orderFilter, setOrderFilter] = useState<OrderFilter>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [showSearch, setShowSearch] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<PDVOrder | null>(null);
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false);
  const [deliveryMapOpen, setDeliveryMapOpen] = useState(false);

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

    return filtered.sort((a, b) => {
      return new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime();
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
  const { toast } = useToast();

  const cancelOrderMutation = useMutation({
    mutationFn: async (orderId: string) => {
      const response = await apiRequest("POST", `/api/orders/${orderId}/cancel`, { 
        cancellationReason: "Cancelado pelo operador" 
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/orders"] });
      queryClient.invalidateQueries({ queryKey: ["/api/customers"] });
      toast({ 
        title: "Pedido cancelado", 
        description: "Todos os estornos foram processados" 
      });
    },
    onError: (error: any) => {
      toast({ 
        title: "Erro ao cancelar pedido",
        description: error.message || "Não foi possível cancelar o pedido",
        variant: "destructive" 
      });
    },
  });

  const updateOrderStatusMutation = useMutation({
    mutationFn: async ({ orderId, status }: { orderId: string; status: string }) => {
      const response = await apiRequest("PATCH", `/api/orders/${orderId}/status`, { status });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/orders"] });
      toast({ title: "Status atualizado" });
    },
    onError: () => {
      toast({ title: "Erro ao atualizar status", variant: "destructive" });
    },
  });

  const renderOrdersList = () => {
    if (isLoading) {
      return (
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <ShimmerSkeleton key={i} variant="card" className="h-32" />
          ))}
        </div>
      );
    }

    if (filteredOrders.length === 0) {
      return (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex flex-col items-center justify-center py-16 px-4"
        >
          <UtensilsCrossed className="h-16 w-16 text-primary mb-4" />
          <p className="text-lg text-muted-foreground mb-6">
            Criar pedidos para cada tipo de serviço.
          </p>
          {user?.restaurantId && (
            <NewOrderDialog 
              restaurantId={user.restaurantId}
              onOrderCreated={handleOrderCreated}
              trigger={
                <Button size="lg" data-testid="button-new-order-empty">
                  <Plus className="h-4 w-4 mr-2" />
                  Novo pedido
                </Button>
              }
            />
          )}
        </motion.div>
      );
    }

    return (
      <div className="space-y-3">
        <AnimatePresence mode="popLayout">
          {filteredOrders.map((order, index) => (
            <PDVOrderCard
              key={order.id}
              order={order}
              index={index}
              onViewDetails={() => {
                setSelectedOrder(order);
                setDetailsDialogOpen(true);
              }}
              onCancel={() => cancelOrderMutation.mutate(order.id)}
              onPay={() => setLocation(`/orders/${order.id}?mode=checkout`)}
              onAccept={() => updateOrderStatusMutation.mutate({ orderId: order.id, status: "em_preparo" })}
            />
          ))}
        </AnimatePresence>
      </div>
    );
  };

  const handleTabChange = (newTab: string) => {
    setActiveTab(newTab as OrderType);
    setOrderFilter("all");
  };

  const handleOrderCreated = (orderId: string) => {
    setLocation(`/orders/${orderId}`);
  };

  const handleDeliveryMap = () => {
    setDeliveryMapOpen(true);
  };

  const deliveryOrders = orders?.filter(o => 
    o.orderType === "delivery" && 
    (o.status === "pendente" || o.status === "em_preparo" || o.status === "pronto")
  ) || [];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pendente": return "bg-yellow-500 text-yellow-950";
      case "em_preparo": return "bg-blue-500 text-white";
      case "pronto": return "bg-green-500 text-white";
      default: return "bg-muted text-muted-foreground";
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "pendente": return "Pendente";
      case "em_preparo": return "Em Preparo";
      case "pronto": return "Pronto p/ Entrega";
      default: return status;
    }
  };

  const getTimeElapsed = (createdAt: Date | null) => {
    if (!createdAt) return "0min";
    const minutes = Math.floor((Date.now() - new Date(createdAt).getTime()) / 60000);
    if (minutes < 60) return `${minutes}min`;
    const hours = Math.floor(minutes / 60);
    return `${hours}h ${minutes % 60}min`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 pb-safe">
      <div className="space-y-4 sm:space-y-6 p-3 sm:p-6 lg:p-8 pb-20 sm:pb-8">
        {/* Header */}
        <motion.div
          className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sticky top-0 z-10 bg-gradient-to-br from-background via-background to-muted/20 py-2 sm:py-0 -mx-3 px-3 sm:mx-0 sm:px-0 backdrop-blur-sm sm:backdrop-blur-none"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="flex-1 min-w-0">
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight bg-gradient-to-r from-primary via-blue-600 to-cyan-600 bg-clip-text text-transparent truncate">
              Ponto de Venda
            </h1>
            <p className="text-xs sm:text-sm text-muted-foreground mt-1 line-clamp-1">
              Gerenciamento de pedidos em tempo real
            </p>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <Button
              variant="outline"
              size="icon"
              onClick={() => refetch()}
              className="touch-manipulation"
              data-testid="button-refresh"
            >
              <RefreshCw className="h-4 w-4 sm:h-5 sm:w-5" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={() => setShowSearch(!showSearch)}
              className="touch-manipulation"
              data-testid="button-search"
            >
              <Search className="h-4 w-4 sm:h-5 sm:w-5" />
            </Button>
            {user?.restaurantId && (
              <NewOrderDialog 
                restaurantId={user.restaurantId}
                onOrderCreated={handleOrderCreated}
                trigger={
                  <Button size="default" className="flex-1 sm:flex-initial gap-2 touch-manipulation" data-testid="button-new-order">
                    <Plus className="h-4 w-4" />
                    <span className="sm:inline">Novo</span>
                  </Button>
                }
              />
            )}
          </div>
        </motion.div>

        {/* Search Bar */}
        {showSearch && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="relative"
          >
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Pesquisar por cliente ou número do pedido..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
              data-testid="input-search"
            />
          </motion.div>
        )}

        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <PDVKpiCard
            title="Balcão"
            totalOrders={balcaoCounts.total}
            pendingOrders={balcaoCounts.pendente}
            inProgressOrders={balcaoCounts.emCurso}
            revenue={balcaoCounts.revenue}
            icon={ShoppingCart}
            color="balcao"
            isActive={activeTab === "balcao"}
            delay={0}
            onClick={() => handleTabChange("balcao")}
          />
          <PDVKpiCard
            title="Delivery"
            totalOrders={deliveryCounts.total}
            pendingOrders={deliveryCounts.pendente}
            inProgressOrders={deliveryCounts.emCurso}
            revenue={deliveryCounts.revenue}
            icon={Truck}
            color="delivery"
            isActive={activeTab === "delivery"}
            delay={0.1}
            onClick={() => handleTabChange("delivery")}
          />
          <PDVKpiCard
            title="Mesas"
            totalOrders={mesasCounts.total}
            pendingOrders={mesasCounts.pendente}
            inProgressOrders={mesasCounts.emCurso}
            revenue={mesasCounts.revenue}
            icon={UtensilsCrossed}
            color="mesa"
            isActive={activeTab === "mesas"}
            delay={0.2}
            onClick={() => handleTabChange("mesas")}
          />
        </div>

        {/* Content Section */}
        {activeTab !== "mesas" && (
          <motion.div
            className="space-y-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
          >
            {/* Filters */}
            <div className="flex items-center gap-2 flex-wrap">
              <Button
                variant={orderFilter === "all" ? "default" : "outline"}
                size="sm"
                onClick={() => setOrderFilter("all")}
                data-testid="filter-all"
              >
                Todos
              </Button>
              <Button
                variant={orderFilter === "pendente" ? "default" : "outline"}
                size="sm"
                onClick={() => setOrderFilter("pendente")}
                data-testid="filter-pendente"
              >
                Pendentes
              </Button>
              <Button
                variant={orderFilter === "em_curso" ? "default" : "outline"}
                size="sm"
                onClick={() => setOrderFilter("em_curso")}
                data-testid="filter-em-curso"
              >
                Em Curso
              </Button>
              {activeTab === "delivery" && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleDeliveryMap}
                  data-testid="button-delivery-map"
                  className="gap-2"
                >
                  <Map className="h-4 w-4" />
                  Mapa
                </Button>
              )}
            </div>

            {/* Orders List */}
            {renderOrdersList()}
          </motion.div>
        )}

        {activeTab === "mesas" && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
          >
            <RestaurantFloorPlan />
          </motion.div>
        )}

        <OrderDetailsDialog
          order={selectedOrder}
          open={detailsDialogOpen}
          onOpenChange={setDetailsDialogOpen}
        />

        <Dialog open={deliveryMapOpen} onOpenChange={setDeliveryMapOpen}>
          <DialogContent className="sm:max-w-[600px] max-h-[80vh]">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Map className="h-5 w-5" />
                Mapa de Entregas
              </DialogTitle>
              <DialogDescription>
                {deliveryOrders.length} entrega(s) pendente(s)
              </DialogDescription>
            </DialogHeader>
            <ScrollArea className="max-h-[60vh] pr-4">
              {deliveryOrders.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <Truck className="h-12 w-12 text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">Nenhuma entrega pendente</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {deliveryOrders.map((order) => (
                    <motion.div
                      key={order.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="border rounded-lg p-4 space-y-3"
                      data-testid={`delivery-order-${order.id}`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-mono text-sm font-medium">#{order.id.slice(-6)}</span>
                            <Badge className={getStatusColor(order.status)}>
                              {getStatusLabel(order.status)}
                            </Badge>
                            {(() => {
                              const elapsed = order.createdAt ? Math.floor((Date.now() - new Date(order.createdAt).getTime()) / 60000) : 0;
                              if (elapsed > 45) {
                                return (
                                  <Badge variant="destructive" className="animate-pulse">
                                    🚨 URGENTE
                                  </Badge>
                                );
                              } else if (elapsed > 30) {
                                return (
                                  <Badge variant="secondary" className="bg-orange-500 text-white">
                                    ⚠️ Atrasado
                                  </Badge>
                                );
                              }
                              return null;
                            })()}
                          </div>
                          <div className="flex items-center gap-1 mt-1 text-sm text-muted-foreground">
                            <Clock className="h-3 w-3" />
                            <span>{getTimeElapsed(order.createdAt)}</span>
                          </div>
                        </div>
                        <span className="font-bold font-mono text-lg">
                          {formatKwanza(order.totalAmount)}
                        </span>
                      </div>

                      {order.customerName && (
                        <div className="flex items-center gap-2 text-sm">
                          <User className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                          <span>{order.customerName}</span>
                        </div>
                      )}

                      {order.customerPhone && (
                        <div className="flex items-center gap-2 text-sm">
                          <Phone className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                          <a 
                            href={`tel:${order.customerPhone}`} 
                            className="text-primary hover:underline"
                          >
                            {order.customerPhone}
                          </a>
                        </div>
                      )}

                      {order.deliveryAddress && (
                        <div className="space-y-2">
                          <div className="flex items-start gap-2 text-sm bg-muted/50 p-2 rounded-md">
                            <MapPin className="h-4 w-4 text-muted-foreground flex-shrink-0 mt-0.5" />
                            <span className="break-words flex-1">{order.deliveryAddress}</span>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-6 w-6 p-0"
                              onClick={() => {
                                navigator.clipboard.writeText(order.deliveryAddress || '');
                                toast({
                                  title: "Endereço copiado!",
                                  description: "Cole no Google Maps ou Waze",
                                });
                              }}
                              title="Copiar endereço"
                            >
                              📋
                            </Button>
                          </div>
                          {(order as any).deliveryNotes && (
                            <div className="flex items-start gap-2 text-xs text-muted-foreground bg-blue-50 dark:bg-blue-950 p-2 rounded-md border border-blue-200 dark:border-blue-800">
                              <span className="font-semibold">💬 Obs:</span>
                              <span className="break-words">{(order as any).deliveryNotes}</span>
                            </div>
                          )}
                        </div>
                      )}

                      <div className="flex gap-2 pt-2">
                        <Button
                          variant="outline"
                          size="sm"
                          className="flex-1"
                          onClick={() => {
                            setDeliveryMapOpen(false);
                            setSelectedOrder(order);
                            setDetailsDialogOpen(true);
                          }}
                          data-testid={`button-view-delivery-${order.id}`}
                        >
                          Ver Detalhes
                        </Button>
                        <Button
                          size="sm"
                          className="flex-1"
                          onClick={() => {
                            setDeliveryMapOpen(false);
                            setLocation(`/orders/${order.id}`);
                          }}
                          data-testid={`button-process-delivery-${order.id}`}
                        >
                          Processar
                        </Button>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </ScrollArea>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
