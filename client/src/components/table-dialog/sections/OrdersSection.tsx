/**
 * OrdersSection - Gestão de Pedidos da Mesa
 * Lista pedidos por convidado, permite quick order, editar e cancelar
 */

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  ShoppingBag, 
  Plus, 
  MoreVertical,
  Clock,
  ChefHat,
  CheckCircle2,
  AlertCircle,
  Edit3,
  Trash2,
  ArrowRightLeft,
  Users,
  Play
} from 'lucide-react';
import { formatKwanza } from '@/lib/formatters';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { motion, AnimatePresence } from 'framer-motion';
import type { Table } from '@shared/schema';

interface OrdersSectionProps {
  table: Table;
  ordersByGuest: any[];
  isLoading: boolean;
  onQuickOrder: () => void;
  onEditOrder: (order: any) => void;
  onCancelOrder: (order: any) => void;
  onMoveItem: (item: any) => void;
  onStartSession?: () => void;
}

const orderStatusConfig = {
  // Status em inglês (fallback)
  pending: {
    label: 'Pendente',
    color: 'bg-yellow-500',
    textColor: 'text-yellow-600',
    icon: AlertCircle,
    gradient: 'from-yellow-400 to-orange-500'
  },
  preparing: {
    label: 'Em Preparo',
    color: 'bg-blue-500',
    textColor: 'text-blue-600',
    icon: ChefHat,
    gradient: 'from-blue-400 to-indigo-500'
  },
  ready: {
    label: 'Pronto',
    color: 'bg-green-500',
    textColor: 'text-green-600',
    icon: CheckCircle2,
    gradient: 'from-green-400 to-emerald-500'
  },
  served: {
    label: 'Servido',
    color: 'bg-gray-500',
    textColor: 'text-gray-600',
    icon: CheckCircle2,
    gradient: 'from-gray-400 to-gray-500'
  },
  cancelled: {
    label: 'Cancelado',
    color: 'bg-red-500',
    textColor: 'text-red-600',
    icon: AlertCircle,
    gradient: 'from-red-400 to-red-500'
  },
  // Status em português (backend)
  pendente: {
    label: 'Pendente',
    color: 'bg-yellow-500',
    textColor: 'text-yellow-600',
    icon: AlertCircle,
    gradient: 'from-yellow-400 to-orange-500'
  },
  em_preparo: {
    label: 'Em Preparo',
    color: 'bg-blue-500',
    textColor: 'text-blue-600',
    icon: ChefHat,
    gradient: 'from-blue-400 to-indigo-500'
  },
  pronto: {
    label: 'Pronto',
    color: 'bg-green-500',
    textColor: 'text-green-600',
    icon: CheckCircle2,
    gradient: 'from-green-400 to-emerald-500'
  },
  servido: {
    label: 'Servido',
    color: 'bg-gray-500',
    textColor: 'text-gray-600',
    icon: CheckCircle2,
    gradient: 'from-gray-400 to-gray-500'
  },
  cancelado: {
    label: 'Cancelado',
    color: 'bg-red-500',
    textColor: 'text-red-600',
    icon: AlertCircle,
    gradient: 'from-red-400 to-red-500'
  },
};

export function OrdersSection({
  table,
  ordersByGuest,
  isLoading,
  onQuickOrder,
  onEditOrder,
  onCancelOrder,
  onMoveItem,
  onStartSession,
}: OrdersSectionProps) {
  const [expandedOrders, setExpandedOrders] = useState<Set<string>>(new Set());

  const toggleOrderExpanded = (orderId: string) => {
    const newExpanded = new Set(expandedOrders);
    if (newExpanded.has(orderId)) {
      newExpanded.delete(orderId);
    } else {
      newExpanded.add(orderId);
    }
    setExpandedOrders(newExpanded);
  };

  if (table.status === 'livre') {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <div className="flex flex-col items-center gap-4">
            <div className="h-24 w-24 rounded-full bg-muted flex items-center justify-center">
              <ShoppingBag className="h-12 w-12 text-muted-foreground" />
            </div>
            <div>
              <h3 className="text-xl font-bold mb-2">Nenhuma Sessão Ativa</h3>
              <p className="text-muted-foreground max-w-md mb-4">
                Inicie uma sessão na mesa para começar a criar pedidos.
              </p>
              <Button 
                size="lg" 
                onClick={onStartSession}
                className="gap-2"
              >
                <Play className="w-5 h-5" />
                Iniciar Sessão
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="h-12 w-12 rounded-full border-4 border-primary border-t-transparent animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Carregando pedidos...</p>
        </div>
      </div>
    );
  }

  const allOrders = ordersByGuest?.flatMap(og => og.orders || []) || [];
  const totalOrders = allOrders.length;

  return (
    <div className="space-y-6">
      {/* Header com Actions */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Pedidos da Mesa</h2>
          <p className="text-muted-foreground">
            {totalOrders} {totalOrders === 1 ? 'pedido' : 'pedidos'} no total
          </p>
        </div>
        <Button onClick={onQuickOrder}>
          <Plus className="w-4 h-4 mr-2" />
          Adicionar Pedido Rápido
        </Button>
      </div>

      {totalOrders === 0 ? (
        /* Empty State */
        <Card>
          <CardContent className="py-12 text-center">
            <div className="flex flex-col items-center gap-4">
              <div className="h-24 w-24 rounded-full bg-primary/10 flex items-center justify-center">
                <ShoppingBag className="h-12 w-12 text-primary" />
              </div>
              <div>
                <h3 className="text-xl font-bold mb-2">Nenhum Pedido Ainda</h3>
                <p className="text-muted-foreground max-w-md mb-4">
                  Comece a criar pedidos para esta mesa usando o botão acima.
                </p>
                <Button onClick={onQuickOrder}>
                  <Plus className="w-4 h-4 mr-2" />
                  Criar Primeiro Pedido
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      ) : (
        /* Lista de Pedidos por Convidado */
        <div className="space-y-6">
          {ordersByGuest?.map((og: any) => {
            const orders = og.orders || [];
            if (orders.length === 0) return null;

            return (
              <Card key={og.guest.id}>
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                      <Users className="w-5 h-5 text-primary" />
                    </div>
                    <div className="flex-1">
                      <CardTitle className="text-lg">
                        {og.guest.name || `Cliente ${og.guest.guestNumber}`}
                      </CardTitle>
                      <p className="text-sm text-muted-foreground">
                        {orders.length} {orders.length === 1 ? 'pedido' : 'pedidos'} • {formatKwanza(og.subtotal || 0)}
                      </p>
                    </div>
                    {og.guest.status === 'pago' && (
                      <Badge className="bg-green-500">
                        <CheckCircle2 className="w-3 h-3 mr-1" />
                        Pago
                      </Badge>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <AnimatePresence mode="popLayout">
                    {orders.map((order: any, index: number) => {
                      const status = order.status as keyof typeof orderStatusConfig;
                      // Debug: log status para verificar formato
                      if (!orderStatusConfig[status]) {
                        console.log('[OrdersSection] Status desconhecido:', status, 'para pedido:', order.id);
                      }
                      // Fallback para 'pendente' se o status não existir
                      const statusInfo = orderStatusConfig[status] || orderStatusConfig.pendente || orderStatusConfig.pending;
                      const StatusIcon = statusInfo.icon;
                      const isExpanded = expandedOrders.has(order.id);

                      return (
                        <motion.div
                          key={order.id}
                          initial={{ opacity: 0, scale: 0.95 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.95 }}
                          transition={{ delay: index * 0.05 }}
                          className={cn(
                            "rounded-lg border-2 overflow-hidden transition-all",
                            isExpanded ? "border-primary" : "border-border hover:border-primary/50"
                          )}
                        >
                          {/* Order Header */}
                          <div 
                            className="p-4 bg-muted/50 cursor-pointer"
                            onClick={() => toggleOrderExpanded(order.id)}
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-3 flex-1">
                                <div className={cn(
                                  "h-10 w-10 rounded-full flex items-center justify-center",
                                  `bg-gradient-to-r ${statusInfo.gradient}`
                                )}>
                                  <StatusIcon className="w-5 h-5 text-white" />
                                </div>
                                <div className="flex-1">
                                  <div className="flex items-center gap-2">
                                    <span className="font-bold">
                                      Pedido #{order.orderNumber || order.id.slice(0, 8).toUpperCase()}
                                    </span>
                                    <Badge className={cn("text-white", statusInfo.color)}>
                                      {statusInfo.label}
                                    </Badge>
                                  </div>
                                  <div className="flex items-center gap-3 text-sm text-muted-foreground mt-1">
                                    <span className="flex items-center gap-1">
                                      <Clock className="w-3 h-3" />
                                      {formatDistanceToNow(new Date(order.createdAt), { 
                                        addSuffix: true, 
                                        locale: ptBR 
                                      })}
                                    </span>
                                    <span>•</span>
                                    <span>{order.items?.length || 0} itens</span>
                                  </div>
                                </div>
                              </div>
                              <div className="flex items-center gap-2">
                                <div className="text-right mr-4">
                                  <div className="text-xl font-bold">
                                    {formatKwanza(order.totalPrice || 0)}
                                  </div>
                                </div>
                                <DropdownMenu>
                                  <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                                    <Button variant="ghost" size="icon">
                                      <MoreVertical className="w-4 h-4" />
                                    </Button>
                                  </DropdownMenuTrigger>
                                  <DropdownMenuContent align="end">
                                    <DropdownMenuItem onClick={() => onEditOrder(order)}>
                                      <Edit3 className="w-4 h-4 mr-2" />
                                      Editar Pedido
                                    </DropdownMenuItem>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem 
                                      onClick={() => onCancelOrder(order)}
                                      className="text-destructive"
                                    >
                                      <Trash2 className="w-4 h-4 mr-2" />
                                      Cancelar Pedido
                                    </DropdownMenuItem>
                                  </DropdownMenuContent>
                                </DropdownMenu>
                              </div>
                            </div>
                          </div>

                          {/* Order Items (Expanded) */}
                          <AnimatePresence>
                            {isExpanded && (
                              <motion.div
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: 'auto', opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                transition={{ duration: 0.2 }}
                              >
                                <div className="p-4 space-y-3 bg-background">
                                  {order.items?.map((item: any, itemIndex: number) => (
                                    <div key={itemIndex} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                                      <div className="flex items-center gap-3 flex-1">
                                        <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-primary/20 text-primary font-bold text-sm">
                                          {item.quantity}×
                                        </div>
                                        <div className="flex-1">
                                          <div className="font-medium">
                                            {item.menuItem?.name || item.name || 'Item'}
                                          </div>
                                          <div className="text-xs text-muted-foreground">
                                            {formatKwanza(item.price)} cada
                                          </div>
                                          {item.options && item.options.length > 0 && (
                                            <div className="text-xs text-blue-600 mt-1">
                                              {item.options.map((opt: any) => opt.name).join(', ')}
                                            </div>
                                          )}
                                          {item.notes && (
                                            <div className="text-xs text-orange-600 mt-1">
                                              ⚠️ {item.notes}
                                            </div>
                                          )}
                                        </div>
                                      </div>
                                      <div className="flex items-center gap-2">
                                        <span className="font-bold">
                                          {formatKwanza(parseFloat(item.price) * item.quantity)}
                                        </span>
                                        <Button
                                          variant="ghost"
                                          size="icon"
                                          onClick={() => onMoveItem(item)}
                                        >
                                          <ArrowRightLeft className="w-4 h-4" />
                                        </Button>
                                      </div>
                                    </div>
                                  ))}
                                  <Separator />
                                  <div className="flex items-center justify-between pt-2">
                                    <span className="font-semibold">Total do Pedido</span>
                                    <span className="text-xl font-bold text-primary">
                                      {formatKwanza(order.totalPrice || 0)}
                                    </span>
                                  </div>
                                </div>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </motion.div>
                      );
                    })}
                  </AnimatePresence>
                </CardContent>
              </Card>
            );
          })}

          {/* Pedidos Anônimos (sem convidado) */}
          {ordersByGuest?.some((og: any) => og.guest.id === 'anonymous') && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertCircle className="w-5 h-5 text-yellow-600" />
                  Pedidos Sem Convidado
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">
                  Estes pedidos não foram atribuídos a nenhuma pessoa específica.
                </p>
                {/* Renderizar pedidos anônimos aqui */}
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  );
}
