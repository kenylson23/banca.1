import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";
import { LucideIcon } from "lucide-react";
import { AnimatedCounter } from "./animated-counter";
import { cn } from "@/lib/utils";

interface PDVKpiCardProps {
  title: string;
  totalOrders: number;
  pendingOrders: number;
  inProgressOrders: number;
  revenue: number;
  icon: LucideIcon;
  color: "balcao" | "delivery" | "mesa";
  isActive: boolean;
  delay?: number;
  onClick: () => void;
}

const colorSchemes = {
  balcao: {
    gradient: "from-blue-500/10 via-blue-400/5 to-transparent",
    icon: "bg-blue-500/10 text-blue-600 dark:text-blue-400",
    badge: "bg-blue-500",
  },
  delivery: {
    gradient: "from-orange-500/10 via-orange-400/5 to-transparent",
    icon: "bg-orange-500/10 text-orange-600 dark:text-orange-400",
    badge: "bg-orange-500",
  },
  mesa: {
    gradient: "from-green-500/10 via-green-400/5 to-transparent",
    icon: "bg-green-500/10 text-green-600 dark:text-green-400",
    badge: "bg-green-500",
  },
};

export function PDVKpiCard({
  title,
  totalOrders,
  pendingOrders,
  inProgressOrders,
  revenue,
  icon: Icon,
  color,
  isActive,
  delay = 0,
  onClick,
}: PDVKpiCardProps) {
  const scheme = colorSchemes[color];
  const testId = `card-kpi-${color}`;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay }}
      onClick={onClick}
      data-testid={testId}
    >
      <Card
        className={cn(
          "relative overflow-hidden cursor-pointer transition-all duration-300",
          isActive
            ? "ring-2 ring-primary shadow-lg"
            : "hover-elevate active-elevate-2"
        )}
      >
        <div className={cn("absolute inset-0 bg-gradient-to-br opacity-50", scheme.gradient)} />

        <CardContent className="p-4 relative">
          <div className="flex items-start justify-between mb-3">
            <div className="flex-1">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1">
                {title}
              </p>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-bold">
                  {totalOrders}
                </span>
                <span className="text-xs text-muted-foreground">pedidos</span>
              </div>
            </div>

            <motion.div
              className={cn("p-2 rounded-lg", scheme.icon)}
              whileHover={{ scale: 1.1, rotate: 5 }}
              transition={{ type: "spring", stiffness: 400, damping: 10 }}
            >
              <Icon className="w-5 h-5" />
            </motion.div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground">Faturamento</span>
              <span className="font-semibold">
                <AnimatedCounter
                  value={revenue}
                  decimals={2}
                  prefix="Kz "
                  duration={1}
                />
              </span>
            </div>

            <div className="flex items-center gap-2">
              {pendingOrders > 0 && (
                <Badge
                  variant="outline"
                  className="bg-orange-500/10 text-orange-600 dark:text-orange-400 border-orange-500/20 text-xs"
                >
                  {pendingOrders} pendente{pendingOrders > 1 ? 's' : ''}
                </Badge>
              )}
              {inProgressOrders > 0 && (
                <Badge
                  variant="outline"
                  className="bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20 text-xs"
                >
                  {inProgressOrders} em curso
                </Badge>
              )}
              {totalOrders === 0 && (
                <span className="text-xs text-muted-foreground">Nenhum pedido</span>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
