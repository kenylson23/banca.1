import { useState, useEffect, useRef, useCallback } from "react";
import { useQuery } from "@tanstack/react-query";
import { Clock, Filter, Volume2, VolumeX, BarChart3, TrendingUp, Package, DollarSign, Printer } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { useWebSocket } from "@/hooks/useWebSocket";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { formatKwanza } from "@/lib/formatters";
import { PrintOrder } from "@/components/PrintOrder";
import type { Order, OrderItem, MenuItem, Table, OrderItemOption } from "@shared/schema";

type OrderStatus = "pendente" | "em_preparo" | "pronto" | "servido";
type StatsPeriod = "daily" | "weekly" | "monthly" | "quarterly" | "yearly";

interface KitchenOrder extends Order {
  table: Table;
  orderItems: Array<OrderItem & { menuItem: MenuItem; options?: OrderItemOption[] }>;
}

interface KitchenStats {
  totalOrders: number;
  totalRevenue: string;
  averageOrderValue: string;
  averageOrdersPerDay: string;
  topDishes: Array<{
    menuItem: MenuItem;
    count: number;
    totalRevenue: string;
  }>;
  periodStart: Date;
  periodEnd: Date;
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

// Shared audio context for sound generation (prevents memory leaks)
let audioContext: AudioContext | null = null;

const getAudioContext = () => {
  if (!audioContext) {
    audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
  }
  // Resume context if it's suspended (browser autoplay policy)
  if (audioContext.state === 'suspended') {
    audioContext.resume();
  }
  return audioContext;
};

const playNotificationSound = () => {
  const ctx = getAudioContext();
  
  // Create a more pleasant notification sound (two-tone chime)
  const playTone = (frequency: number, startTime: number, duration: number) => {
    const oscillator = ctx.createOscillator();
    const gainNode = ctx.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(ctx.destination);
    
    oscillator.frequency.value = frequency;
    oscillator.type = 'sine';
    
    // Envelope for smooth sound
    gainNode.gain.setValueAtTime(0, startTime);
    gainNode.gain.linearRampToValueAtTime(0.3, startTime + 0.01);
    gainNode.gain.exponentialRampToValueAtTime(0.01, startTime + duration);
    
    oscillator.start(startTime);
    oscillator.stop(startTime + duration);
  };
  
  const now = ctx.currentTime;
  playTone(800, now, 0.15); // First tone (higher)
  playTone(600, now + 0.15, 0.2); // Second tone (lower)
};

const playCompletionSound = () => {
  const ctx = getAudioContext();
  
  // Create a pleasant completion sound (ascending chime)
  const playTone = (frequency: number, startTime: number, duration: number) => {
    const oscillator = ctx.createOscillator();
    const gainNode = ctx.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(ctx.destination);
    
    oscillator.frequency.value = frequency;
    oscillator.type = 'sine';
    
    gainNode.gain.setValueAtTime(0, startTime);
    gainNode.gain.linearRampToValueAtTime(0.25, startTime + 0.01);
    gainNode.gain.exponentialRampToValueAtTime(0.01, startTime + duration);
    
    oscillator.start(startTime);
    oscillator.stop(startTime + duration);
  };
  
  const now = ctx.currentTime;
  playTone(523.25, now, 0.15); // C5
  playTone(659.25, now + 0.1, 0.15); // E5
  playTone(783.99, now + 0.2, 0.25); // G5
};

export default function Kitchen() {
  const { toast } = useToast();
  const [selectedStatus, setSelectedStatus] = useState<string>("all");
  const [isMuted, setIsMuted] = useState(false);
  const [newOrderIds, setNewOrderIds] = useState<Set<string>>(new Set());
  const [statsPeriod, setStatsPeriod] = useState<StatsPeriod>("daily");
  const [showStats, setShowStats] = useState(false);
  const prevOrderCountRef = useRef<number>(0);

  const { data: orders, isLoading } = useQuery<KitchenOrder[]>({
    queryKey: ["/api/orders/kitchen"],
    refetchInterval: 3000, // Poll every 3 seconds as fallback
  });

  const { data: stats, isLoading: statsLoading } = useQuery<KitchenStats>({
    queryKey: ["/api/stats/kitchen", statsPeriod],
    queryFn: async () => {
      const response = await fetch(`/api/stats/kitchen?period=${statsPeriod}`);
      if (!response.ok) throw new Error('Failed to fetch stats');
      return response.json();
    },
    enabled: showStats,
  });

  // WebSocket handler for real-time updates
  const handleWebSocketMessage = useCallback((message: any) => {
    if (message.type === 'new_order' || message.type === 'order_status_updated') {
      // Invalidate kitchen orders to refetch
      queryClient.invalidateQueries({ queryKey: ["/api/orders/kitchen"] });
      queryClient.invalidateQueries({ queryKey: ["/api/stats/kitchen"] });
      queryClient.invalidateQueries({ queryKey: ["/api/stats/dashboard"] });
      // Invalidate all reports to ensure they show updated data
      queryClient.invalidateQueries({ queryKey: ["/api/reports/sales"] });
      queryClient.invalidateQueries({ queryKey: ["/api/reports/orders"] });
      queryClient.invalidateQueries({ queryKey: ["/api/reports/products"] });
      queryClient.invalidateQueries({ queryKey: ["/api/reports/performance"] });
    }
  }, []);

  // Setup WebSocket connection
  useWebSocket(handleWebSocketMessage);

  // Handler for mute toggle - ensures AudioContext is resumed from user gesture
  const handleMuteToggle = async () => {
    setIsMuted(!isMuted);
    // Initialize and resume audio context on user interaction (autoplay policy requirement)
    try {
      const ctx = getAudioContext();
      if (ctx.state === 'suspended') {
        await ctx.resume();
      }
    } catch (error) {
      // Audio context resume failed silently
    }
  };

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
        // Play notification sound for new order
        try {
          playNotificationSound();
        } catch (error) {
          // Sound failed silently
        }
      }

      toast({
        title: "Novo Pedido!",
        description: `Mesa ${newOrders[0]?.table.number || 'N/A'} fez um novo pedido`,
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
      queryClient.invalidateQueries({ queryKey: ["/api/stats/kitchen"] });
      // Invalidate all reports to ensure they show updated data
      queryClient.invalidateQueries({ queryKey: ["/api/reports/sales"] });
      queryClient.invalidateQueries({ queryKey: ["/api/reports/orders"] });
      queryClient.invalidateQueries({ queryKey: ["/api/reports/products"] });
      queryClient.invalidateQueries({ queryKey: ["/api/reports/performance"] });
      
      // Play completion sound when order is ready or served
      if ((newStatus === "pronto" || newStatus === "servido") && !isMuted) {
        try {
          playCompletionSound();
        } catch (error) {
          // Sound failed silently
        }
      }
      
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

  const formatOrderTime = (createdAt: Date | null) => {
    if (!createdAt) return "";
    const date = new Date(createdAt);
    return date.toLocaleTimeString('pt-PT', { hour: '2-digit', minute: '2-digit' });
  };

  const periodLabels = {
    daily: "Diário",
    weekly: "Semanal",
    monthly: "Mensal",
    quarterly: "Trimestral",
    yearly: "Anual",
  };

  return (
    <div className="space-y-6 sm:space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-foreground">Cozinha</h1>
          <p className="text-sm sm:text-base text-muted-foreground mt-1 sm:mt-2">
            Gerencie pedidos em tempo real
          </p>
        </div>
        <div className="flex items-center flex-wrap gap-2">
          <Button
            variant={showStats ? "default" : "outline"}
            onClick={() => setShowStats(!showStats)}
            data-testid="button-toggle-stats"
          >
            <BarChart3 className="h-5 w-5 mr-2" />
            Estatísticas
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={handleMuteToggle}
            data-testid="button-toggle-sound"
          >
            {isMuted ? (
              <VolumeX className="h-5 w-5" />
            ) : (
              <Volume2 className="h-5 w-5" />
            )}
          </Button>
        </div>
      </div>

      <Tabs value={selectedStatus} onValueChange={setSelectedStatus}>
        <div className="overflow-x-auto -mx-4 px-4 sm:mx-0 sm:px-0">
          <TabsList className="inline-flex w-auto min-w-full sm:w-full">
            <TabsTrigger value="all" data-testid="tab-all-orders" className="whitespace-nowrap">
              <Filter className="h-4 w-4 mr-2" />
              Todos
            </TabsTrigger>
            <TabsTrigger value="pendente" data-testid="tab-pending" className="whitespace-nowrap">
              Pendente
            </TabsTrigger>
            <TabsTrigger value="em_preparo" data-testid="tab-in-progress" className="whitespace-nowrap">
              Em Preparo
            </TabsTrigger>
            <TabsTrigger value="pronto" data-testid="tab-ready" className="whitespace-nowrap">
              Pronto
            </TabsTrigger>
            <TabsTrigger value="servido" data-testid="tab-served" className="whitespace-nowrap">
              Servido
            </TabsTrigger>
          </TabsList>
        </div>
      </Tabs>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6">
          {[...Array(6)].map((_, i) => (
            <Skeleton key={i} className="h-64" />
          ))}
        </div>
      ) : filteredOrders.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6">
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
                <CardHeader className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 pb-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <CardTitle className="text-xl sm:text-2xl font-mono">
                        {order.orderType === 'mesa' ? `Mesa ${order.table?.number || '?'}` : 
                         order.orderType === 'delivery' ? 'Delivery' : 'Retirada'}
                      </CardTitle>
                      <Badge variant="outline" className="text-xs">
                        {order.orderType === 'mesa' ? '🪑 Mesa' : 
                         order.orderType === 'delivery' ? '🚚 Delivery' : '🚶 Retirada'}
                      </Badge>
                    </div>
                    <div className="flex flex-col gap-1 mt-2">
                      <div className="flex items-center gap-2">
                        <Clock className="h-3 w-3 text-muted-foreground flex-shrink-0" />
                        <p className="text-xs sm:text-sm text-muted-foreground">
                          {formatOrderTime(order.createdAt)} ({getTimeElapsed(order.createdAt)})
                        </p>
                      </div>
                      {order.customerName && (
                        <p className="text-xs sm:text-sm text-muted-foreground truncate">
                          Cliente: {order.customerName}
                        </p>
                      )}
                      {order.customerPhone && (
                        <p className="text-xs sm:text-sm text-muted-foreground truncate">
                          Telefone: {order.customerPhone}
                        </p>
                      )}
                      {order.orderType === 'delivery' && order.deliveryAddress && (
                        <p className="text-xs sm:text-sm text-muted-foreground line-clamp-2">
                          Endereço: {order.deliveryAddress}
                        </p>
                      )}
                    </div>
                  </div>
                  <Badge className={`${statusColors[order.status]} flex-shrink-0 self-start`}>
                    {statusLabels[order.status]}
                  </Badge>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <h3 className="font-semibold text-xs sm:text-sm text-muted-foreground uppercase">
                      Itens do Pedido
                    </h3>
                    {order.orderItems.map((item) => (
                      <div
                        key={item.id}
                        className="bg-muted/50 rounded-md p-2 sm:p-3 space-y-2"
                      >
                        <div className="flex justify-between items-start gap-2">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-primary text-primary-foreground text-xs font-bold flex-shrink-0">
                                {item.quantity}x
                              </span>
                              <div className="flex-1">
                                <p className="font-semibold text-sm sm:text-base truncate">{item.menuItem.name}</p>
                                {item.options && item.options.length > 0 && (
                                  <div className="mt-1 space-y-0.5">
                                    {item.options.map((option, idx) => (
                                      <div key={idx} className="text-xs text-muted-foreground flex items-baseline gap-1.5">
                                        <span className="font-medium">{option.optionGroupName}:</span>
                                        <span>{option.quantity > 1 && `${option.quantity}x `}{option.optionName}</span>
                                      </div>
                                    ))}
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                          <p className="font-mono font-semibold text-sm sm:text-base flex-shrink-0">
                            {formatKwanza(item.price)}
                          </p>
                        </div>
                        {item.notes && (
                          <div className="pl-8">
                            <p className="text-xs sm:text-sm text-muted-foreground italic break-words">
                              Obs: {item.notes}
                            </p>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>

                  {order.orderNotes && (
                    <div className="bg-amber-500/10 border border-amber-500/20 rounded-md p-3">
                      <h3 className="font-semibold text-xs sm:text-sm text-amber-700 dark:text-amber-400 uppercase mb-2">
                        Observações do Pedido
                      </h3>
                      <p className="text-xs sm:text-sm text-foreground break-words">
                        {order.orderNotes}
                      </p>
                    </div>
                  )}

                  <div className="pt-2 border-t border-border">
                    <div className="flex justify-between items-center mb-3 sm:mb-4">
                      <span className="font-semibold text-sm sm:text-base">Total</span>
                      <span className="text-lg sm:text-xl font-bold font-mono">
                        {formatKwanza(order.totalAmount)}
                      </span>
                    </div>

                    <div className="flex flex-col gap-2">
                      {nextStatus && (
                        <Button
                          className="w-full text-sm sm:text-base"
                          onClick={() => handleStatusChange(order.id, nextStatus)}
                          data-testid={`button-update-status-${order.id}`}
                        >
                          Marcar como {statusLabels[nextStatus]}
                        </Button>
                      )}
                      <PrintOrder order={order} variant="outline" size="default" />
                    </div>
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

      {showStats && (
        <div className="space-y-6 mt-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <h2 className="text-xl sm:text-2xl font-bold">Estatísticas de Produção</h2>
            <Tabs value={statsPeriod} onValueChange={(value) => setStatsPeriod(value as StatsPeriod)}>
              <div className="overflow-x-auto -mx-4 px-4 sm:mx-0 sm:px-0">
                <TabsList className="inline-flex w-auto">
                  <TabsTrigger value="daily" data-testid="tab-stats-daily" className="whitespace-nowrap text-xs sm:text-sm">
                    Diário
                  </TabsTrigger>
                  <TabsTrigger value="weekly" data-testid="tab-stats-weekly" className="whitespace-nowrap text-xs sm:text-sm">
                    Semanal
                  </TabsTrigger>
                  <TabsTrigger value="monthly" data-testid="tab-stats-monthly" className="whitespace-nowrap text-xs sm:text-sm">
                    Mensal
                  </TabsTrigger>
                  <TabsTrigger value="quarterly" data-testid="tab-stats-quarterly" className="whitespace-nowrap text-xs sm:text-sm">
                    Trimestral
                  </TabsTrigger>
                  <TabsTrigger value="yearly" data-testid="tab-stats-yearly" className="whitespace-nowrap text-xs sm:text-sm">
                    Anual
                  </TabsTrigger>
                </TabsList>
              </div>
            </Tabs>
          </div>

          {statsLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[...Array(4)].map((_, i) => (
                <Skeleton key={i} className="h-32" />
              ))}
            </div>
          ) : stats ? (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between gap-2 pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">
                      Total de Pedidos
                    </CardTitle>
                    <Package className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl sm:text-3xl font-bold" data-testid="text-total-orders">
                      {stats.totalOrders}
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      Período {periodLabels[statsPeriod].toLowerCase()}
                    </p>
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
                    <div className="text-2xl sm:text-3xl font-bold" data-testid="text-total-revenue">
                      {formatKwanza(stats.totalRevenue)}
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      Período {periodLabels[statsPeriod].toLowerCase()}
                    </p>
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
                    <div className="text-2xl sm:text-3xl font-bold" data-testid="text-avg-order-value">
                      {formatKwanza(stats.averageOrderValue)}
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      Por pedido
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between gap-2 pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">
                      Média Diária
                    </CardTitle>
                    <BarChart3 className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl sm:text-3xl font-bold" data-testid="text-avg-daily-orders">
                      {stats.averageOrdersPerDay}
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      Pedidos por dia
                    </p>
                  </CardContent>
                </Card>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg sm:text-xl">Pratos Mais Pedidos</CardTitle>
                  <p className="text-xs sm:text-sm text-muted-foreground">
                    Ranking de popularidade no período {periodLabels[statsPeriod].toLowerCase()}
                  </p>
                </CardHeader>
                <CardContent>
                  {stats.topDishes.length > 0 ? (
                    <div className="space-y-3 sm:space-y-4">
                      {stats.topDishes.map((dish, index) => (
                        <div
                          key={dish.menuItem.id}
                          className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4 p-3 sm:p-4 bg-muted/50 rounded-lg"
                          data-testid={`dish-rank-${index + 1}`}
                        >
                          <div className="flex items-center gap-3 sm:gap-4 flex-1 min-w-0">
                            <div className="flex items-center justify-center w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-primary text-primary-foreground font-bold text-base sm:text-lg flex-shrink-0">
                              {index + 1}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="font-semibold text-sm sm:text-base truncate">
                                {dish.menuItem.name}
                              </p>
                              <p className="text-xs sm:text-sm text-muted-foreground">
                                {dish.count} {dish.count === 1 ? 'pedido' : 'pedidos'}
                              </p>
                            </div>
                          </div>
                          <div className="text-left sm:text-right pl-11 sm:pl-0 flex-shrink-0">
                            <p className="font-bold text-base sm:text-lg font-mono">
                              {formatKwanza(dish.totalRevenue)}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              Receita total
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-center text-muted-foreground py-8 text-sm sm:text-base">
                      Nenhum dado disponível para este período
                    </p>
                  )}
                </CardContent>
              </Card>
            </>
          ) : null}
        </div>
      )}
    </div>
  );
}
