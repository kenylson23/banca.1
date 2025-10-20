import { useState, useEffect, useRef, useCallback } from "react";
import { useQuery } from "@tanstack/react-query";
import { Clock, Filter, Volume2, VolumeX } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { useWebSocket } from "@/hooks/useWebSocket";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { formatKwanza } from "@/lib/formatters";
import type { Order, OrderItem, MenuItem, Table } from "@shared/schema";

type OrderStatus = "pendente" | "em_preparo" | "pronto" | "servido";

interface KitchenOrder extends Order {
  table: Table;
  orderItems: Array<OrderItem & { menuItem: MenuItem }>;
}

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

export default function Kitchen() {
  const { toast } = useToast();
  const [selectedStatus, setSelectedStatus] = useState<string>("all");
  const [isMuted, setIsMuted] = useState(false);
  const [newOrderIds, setNewOrderIds] = useState<Set<string>>(new Set());
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const prevOrderCountRef = useRef<number>(0);

  const { data: orders, isLoading } = useQuery<KitchenOrder[]>({
    queryKey: ["/api/orders/kitchen"],
    refetchInterval: 3000, // Poll every 3 seconds as fallback
  });

  // WebSocket handler for real-time updates
  const handleWebSocketMessage = useCallback((message: any) => {
    if (message.type === 'new_order' || message.type === 'order_status_updated') {
      // Invalidate kitchen orders to refetch
      queryClient.invalidateQueries({ queryKey: ["/api/orders/kitchen"] });
    }
  }, []);

  // Setup WebSocket connection
  useWebSocket(handleWebSocketMessage);

  // Play alert sound for new orders
  useEffect(() => {
    if (!orders || orders.length === 0) {
      prevOrderCountRef.current = 0;
      return;
    }

    const pendingOrders = orders.filter(o => o.status === "pendente");
    const currentPendingCount = pendingOrders.length;
    
    if (prevOrderCountRef.current > 0 && currentPendingCount > prevOrderCountRef.current) {
      // New order detected
      const newOrders = pendingOrders.slice(prevOrderCountRef.current - currentPendingCount);
      const newIds = new Set(newOrders.map(o => o.id));
      setNewOrderIds(newIds);

      if (!isMuted) {
        // Play alert sound
        if (!audioRef.current) {
          audioRef.current = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBSuBzvLZiDYIGGi77OOfTRAMUKfj8LZjHAY4ktjyzXkrBSR3x/DdkEAKFF606+uoVRQKRp/g8r5sIQUrgc7y2Yg2CBhpvOzjn00QDFA=');
        }
        audioRef.current.play().catch(console.error);
      }

      toast({
        title: "Novo Pedido!",
        description: `Mesa ${newOrders[0]?.table.number} fez um novo pedido`,
      });

      // Clear highlight after 5 seconds
      setTimeout(() => {
        setNewOrderIds(new Set());
      }, 5000);
    }

    prevOrderCountRef.current = currentPendingCount;
  }, [orders, isMuted, toast]);

  const handleStatusChange = async (orderId: string, newStatus: OrderStatus) => {
    try {
      await apiRequest("PATCH", `/api/orders/${orderId}/status`, { status: newStatus });
      queryClient.invalidateQueries({ queryKey: ["/api/orders/kitchen"] });
      queryClient.invalidateQueries({ queryKey: ["/api/stats/dashboard"] });
      toast({
        title: "Status atualizado",
        description: `Pedido marcado como ${statusLabels[newStatus]}`,
      });
    } catch (error) {
      toast({
        title: "Erro",
        description: "Não foi possível atualizar o status do pedido",
        variant: "destructive",
      });
    }
  };

  const getNextStatus = (currentStatus: OrderStatus): OrderStatus | null => {
    const statusFlow: OrderStatus[] = ["pendente", "em_preparo", "pronto", "servido"];
    const currentIndex = statusFlow.indexOf(currentStatus);
    if (currentIndex < statusFlow.length - 1) {
      return statusFlow[currentIndex + 1];
    }
    return null;
  };

  const filteredOrders = orders?.filter(
    order => selectedStatus === "all" || order.status === selectedStatus
  ) || [];

  const getTimeElapsed = (createdAt: Date | null) => {
    if (!createdAt) return "0min";
    const minutes = Math.floor((Date.now() - new Date(createdAt).getTime()) / 60000);
    if (minutes < 60) return `${minutes}min`;
    const hours = Math.floor(minutes / 60);
    return `${hours}h ${minutes % 60}min`;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold text-foreground">Cozinha</h1>
          <p className="text-muted-foreground mt-2">
            Gerencie pedidos em tempo real
          </p>
        </div>
        <Button
          variant="outline"
          size="icon"
          onClick={() => setIsMuted(!isMuted)}
          data-testid="button-toggle-sound"
        >
          {isMuted ? (
            <VolumeX className="h-5 w-5" />
          ) : (
            <Volume2 className="h-5 w-5" />
          )}
        </Button>
      </div>

      <Tabs value={selectedStatus} onValueChange={setSelectedStatus}>
        <TabsList className="w-full justify-start">
          <TabsTrigger value="all" data-testid="tab-all-orders">
            <Filter className="h-4 w-4 mr-2" />
            Todos
          </TabsTrigger>
          <TabsTrigger value="pendente" data-testid="tab-pending">
            Pendente
          </TabsTrigger>
          <TabsTrigger value="em_preparo" data-testid="tab-in-progress">
            Em Preparo
          </TabsTrigger>
          <TabsTrigger value="pronto" data-testid="tab-ready">
            Pronto
          </TabsTrigger>
          <TabsTrigger value="servido" data-testid="tab-served">
            Servido
          </TabsTrigger>
        </TabsList>
      </Tabs>

      {isLoading ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <Skeleton key={i} className="h-64" />
          ))}
        </div>
      ) : filteredOrders.length > 0 ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredOrders.map((order) => {
            const isNew = newOrderIds.has(order.id);
            const nextStatus = getNextStatus(order.status);

            return (
              <Card
                key={order.id}
                className={`transition-all ${
                  isNew ? "ring-2 ring-primary animate-pulse" : ""
                }`}
                data-testid={`card-order-${order.id}`}
              >
                <CardHeader className="flex flex-row items-start justify-between gap-2 pb-3">
                  <div className="flex-1">
                    <CardTitle className="text-2xl font-mono">
                      Mesa {order.table.number}
                    </CardTitle>
                    <div className="flex items-center gap-2 mt-2">
                      <Clock className="h-3 w-3 text-muted-foreground" />
                      <p className="text-sm text-muted-foreground">
                        {getTimeElapsed(order.createdAt)}
                      </p>
                    </div>
                  </div>
                  <Badge className={statusColors[order.status]}>
                    {statusLabels[order.status]}
                  </Badge>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    {order.orderItems.map((item) => (
                      <div
                        key={item.id}
                        className="flex justify-between items-start py-2 border-b border-border last:border-0"
                      >
                        <div className="flex-1">
                          <p className="font-medium">{item.menuItem.name}</p>
                          <p className="text-sm text-muted-foreground">
                            Qtd: {item.quantity}
                          </p>
                        </div>
                        <p className="font-mono font-medium">
                          {formatKwanza(item.price)}
                        </p>
                      </div>
                    ))}
                  </div>

                  <div className="pt-2 border-t border-border">
                    <div className="flex justify-between items-center mb-4">
                      <span className="font-semibold">Total</span>
                      <span className="text-xl font-bold font-mono">
                        {formatKwanza(order.totalAmount)}
                      </span>
                    </div>

                    {nextStatus && (
                      <Button
                        className="w-full"
                        onClick={() => handleStatusChange(order.id, nextStatus)}
                        data-testid={`button-update-status-${order.id}`}
                      >
                        Marcar como {statusLabels[nextStatus]}
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      ) : (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
              <Filter className="h-8 w-8 text-primary" />
            </div>
            <p className="text-xl font-semibold text-foreground mb-2">
              Nenhum pedido encontrado
            </p>
            <p className="text-muted-foreground">
              {selectedStatus === "all"
                ? "Aguardando novos pedidos..."
                : `Nenhum pedido com status "${statusLabels[selectedStatus as OrderStatus]}"`}
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
