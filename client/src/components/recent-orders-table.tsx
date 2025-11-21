import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Clock, Hash } from "lucide-react";
import { formatKwanza } from "@/lib/formatters";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import type { Order } from "@shared/schema";

interface RecentOrdersTableProps {
  orders: Array<Order & { table: { number: number } | null }>;
  className?: string;
}

const statusColors = {
  pending: "bg-yellow-500/10 text-yellow-700 dark:text-yellow-400 border-yellow-500/30",
  preparing: "bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-500/30",
  ready: "bg-green-500/10 text-green-700 dark:text-green-400 border-green-500/30",
  delivered: "bg-gray-500/10 text-gray-700 dark:text-gray-400 border-gray-500/30",
  cancelled: "bg-red-500/10 text-red-700 dark:text-red-400 border-red-500/30",
};

const statusLabels = {
  pending: "Pendente",
  preparing: "Preparando",
  ready: "Pronto",
  delivered: "Entregue",
  cancelled: "Cancelado",
};

export function RecentOrdersTable({ orders, className }: RecentOrdersTableProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.5 }}
      className={className}
    >
      <Card className="hover-elevate border-border/50">
        <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-4">
          <CardTitle className="text-xl font-bold flex items-center gap-2">
            <Clock className="h-5 w-5 text-blue-500" />
            Pedidos Recentes
          </CardTitle>
          <Badge variant="secondary">
            {orders.length} pedidos
          </Badge>
        </CardHeader>
        <CardContent>
          {orders && orders.length > 0 ? (
            <div className="space-y-2">
              {orders.slice(0, 8).map((order, index) => (
                <motion.div
                  key={order.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: 0.6 + (index * 0.05) }}
                  className={cn(
                    "flex items-center justify-between p-3 rounded-lg hover-elevate group",
                    "bg-gradient-to-r from-transparent to-transparent hover:from-primary/5"
                  )}
                  data-testid={`order-recent-${index}`}
                >
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0 group-hover:bg-primary/20 transition-colors">
                      <Hash className="h-5 w-5 text-primary" />
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <p className="font-semibold text-foreground text-sm">
                          {order.table ? `Mesa ${order.table.number}` : 
                           order.orderType === 'delivery' ? 'Delivery' : 
                           order.orderType === 'balcao' ? 'Balcão' : 
                           'Pedido'}
                        </p>
                        <Badge 
                          variant="outline" 
                          className={cn("text-xs", statusColors[order.status as keyof typeof statusColors])}
                        >
                          {statusLabels[order.status as keyof typeof statusLabels]}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {order.createdAt && new Date(order.createdAt).toLocaleTimeString('pt-BR', { 
                          hour: '2-digit', 
                          minute: '2-digit' 
                        })}
                      </p>
                    </div>
                  </div>

                  <div className="text-right flex-shrink-0">
                    <p className="font-bold text-foreground">
                      {formatKwanza(order.totalAmount)}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <p>Nenhum pedido recente</p>
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}
