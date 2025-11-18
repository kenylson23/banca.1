import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Eye,
  X,
  DollarSign,
  Check,
  Clock,
  User,
  ShoppingBag,
  Truck,
  UtensilsCrossed,
} from "lucide-react";
import { formatKwanza } from "@/lib/formatters";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

interface PDVOrderCardProps {
  order: any;
  index: number;
  onViewDetails: () => void;
  onCancel: () => void;
  onPay: () => void;
  onAccept: () => void;
}

const orderTypeIcons = {
  mesa: UtensilsCrossed,
  delivery: Truck,
  balcao: ShoppingBag,
};

const statusColors = {
  pendente: "bg-orange-500/10 text-orange-600 dark:text-orange-400 border-orange-500/20",
  em_preparo: "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20",
  pronto: "bg-green-500/10 text-green-600 dark:text-green-400 border-green-500/20",
  servido: "bg-muted/50 text-muted-foreground border-border",
};

const statusLabels = {
  pendente: "Pendente",
  em_preparo: "Em Preparo",
  pronto: "Pronto",
  servido: "Servido",
};

const paymentStatusColors = {
  pago: "bg-green-500 text-white",
  parcial: "bg-yellow-500 text-white",
  nao_pago: "bg-orange-500 text-white",
};

const paymentStatusLabels = {
  pago: "Pago",
  parcial: "Parcial",
  nao_pago: "Não pago",
};

export function PDVOrderCard({
  order,
  index,
  onViewDetails,
  onCancel,
  onPay,
  onAccept,
}: PDVOrderCardProps) {
  const OrderTypeIcon =
    orderTypeIcons[order.orderType as keyof typeof orderTypeIcons] || ShoppingBag;

  const getElapsedTime = (createdAt: Date | string) => {
    const now = new Date();
    const created = new Date(createdAt);
    const diff = Math.floor((now.getTime() - created.getTime()) / 1000 / 60);
    return `${diff} min`;
  };

  const getOrderTypeLabel = (orderType: string) => {
    const labels: Record<string, string> = {
      mesa: "Mesa",
      delivery: "Delivery",
      balcao: "Balcão",
    };
    return labels[orderType] || orderType;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.05 }}
    >
      <Card className="p-4 hover-elevate active-elevate-2 transition-all duration-200">
        <div className="grid grid-cols-1 lg:grid-cols-[2fr_auto_1fr] gap-4">
          {/* Left Section: Order Info */}
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <span
                  className="text-lg font-bold text-primary"
                  data-testid={`text-order-number-${order.id}`}
                >
                  #{order.id.slice(-4)}
                </span>
                <OrderTypeIcon className="h-4 w-4 text-primary" />
                <span className="text-sm text-muted-foreground">
                  {order.table
                    ? `Mesa ${order.table.number}`
                    : getOrderTypeLabel(order.orderType)}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-3 flex-wrap">
              <div className="flex items-center gap-1 text-sm">
                <Clock className="h-3 w-3 text-muted-foreground" />
                <span
                  className="font-medium text-orange-500"
                  data-testid={`text-elapsed-${order.id}`}
                >
                  {getElapsedTime(order.createdAt || new Date())}
                </span>
              </div>

              <span className="text-xs text-muted-foreground">
                {order.createdAt
                  ? format(new Date(order.createdAt), "dd/MM/yy HH:mm")
                  : "-"}
              </span>

              {order.customerName && (
                <div className="flex items-center gap-1 text-sm">
                  <User className="h-3 w-3 text-muted-foreground" />
                  <span data-testid={`text-customer-${order.id}`}>
                    {order.customerName}
                  </span>
                </div>
              )}
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              <Badge
                variant="outline"
                className={cn(
                  "font-medium",
                  statusColors[order.status as keyof typeof statusColors]
                )}
              >
                {statusLabels[order.status as keyof typeof statusLabels]}
              </Badge>

              <Badge
                className={
                  paymentStatusColors[
                    (order.paymentStatus || "nao_pago") as keyof typeof paymentStatusColors
                  ]
                }
              >
                {
                  paymentStatusLabels[
                    (order.paymentStatus || "nao_pago") as keyof typeof paymentStatusLabels
                  ]
                }
              </Badge>
            </div>
          </div>

          {/* Middle Section: Total */}
          <div className="flex items-center justify-center lg:border-x lg:px-6">
            <div className="text-center">
              <p className="text-xs text-muted-foreground mb-1">Total</p>
              <p
                className="text-2xl font-bold"
                data-testid={`text-order-total-${order.id}`}
              >
                {formatKwanza(order.totalAmount)}
              </p>
            </div>
          </div>

          {/* Right Section: Actions */}
          <div className="flex items-center justify-end gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={onViewDetails}
              data-testid={`button-view-details-${order.id}`}
            >
              <Eye className="h-4 w-4" />
            </Button>

            <Button
              variant="destructive"
              size="sm"
              onClick={onCancel}
              data-testid={`button-cancel-${order.id}`}
            >
              <X className="h-4 w-4" />
            </Button>

            <Button
              variant="default"
              size="sm"
              onClick={onPay}
              disabled={order.paymentStatus === "pago"}
              data-testid={`button-pay-${order.id}`}
            >
              <DollarSign className="h-4 w-4 mr-1" />
              Pagar
            </Button>

            <Button
              variant="default"
              size="sm"
              onClick={onAccept}
              disabled={order.status !== "pendente"}
              data-testid={`button-accept-${order.id}`}
            >
              <Check className="h-4 w-4 mr-1" />
              Aceitar
            </Button>
          </div>
        </div>
      </Card>
    </motion.div>
  );
}
