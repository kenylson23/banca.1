import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { motion, AnimatePresence } from "framer-motion";
import {
  ShoppingBag,
  DollarSign,
  Users,
  TrendingUp,
  CheckCircle2,
  XCircle,
  Clock,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";

interface Activity {
  id: string;
  type: "order" | "payment" | "user" | "goal" | "status";
  title: string;
  description: string;
  timestamp: Date;
  status?: "success" | "error" | "warning" | "info";
  value?: string;
}

interface ActivityFeedProps {
  activities: Activity[];
  title?: string;
  className?: string;
  maxHeight?: number;
}

const activityIcons = {
  order: ShoppingBag,
  payment: DollarSign,
  user: Users,
  goal: TrendingUp,
  status: CheckCircle2,
};

const statusColors = {
  success: "text-success",
  error: "text-destructive",
  warning: "text-warning",
  info: "text-info",
};

const statusBadgeVariants = {
  success: "bg-success/10 text-success border-success/20",
  error: "bg-destructive/10 text-destructive border-destructive/20",
  warning: "bg-warning/10 text-warning border-warning/20",
  info: "bg-info/10 text-info border-info/20",
};

export function ActivityFeed({
  activities,
  title = "Atividade Recente",
  className = "",
  maxHeight = 400,
}: ActivityFeedProps) {
  return (
    <Card className={className}>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg font-semibold flex items-center gap-2">
          <Clock className="w-5 h-5 text-primary" />
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ScrollArea className="pr-4" style={{ maxHeight: `${maxHeight}px` }}>
          <AnimatePresence mode="popLayout">
            {activities.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground text-sm">
                Nenhuma atividade recente
              </div>
            ) : (
              <div className="space-y-3">
                {activities.map((activity, index) => {
                  const Icon = activityIcons[activity.type];
                  const statusColor = activity.status
                    ? statusColors[activity.status]
                    : "text-muted-foreground";

                  return (
                    <motion.div
                      key={activity.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20 }}
                      transition={{ duration: 0.3, delay: index * 0.05 }}
                      className="flex gap-3 p-3 rounded-lg hover-elevate active-elevate-2 border border-border/50"
                    >
                      <div
                        className={`flex-shrink-0 w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center ${statusColor}`}
                      >
                        <Icon className="w-5 h-5" />
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2 mb-1">
                          <p className="text-sm font-medium truncate">
                            {activity.title}
                          </p>
                          {activity.status && (
                            <Badge
                              variant="outline"
                              className={`text-xs flex-shrink-0 ${
                                statusBadgeVariants[activity.status]
                              }`}
                            >
                              {activity.status === "success" && "Sucesso"}
                              {activity.status === "error" && "Erro"}
                              {activity.status === "warning" && "Atenção"}
                              {activity.status === "info" && "Info"}
                            </Badge>
                          )}
                        </div>

                        <p className="text-xs text-muted-foreground line-clamp-2">
                          {activity.description}
                        </p>

                        <div className="flex items-center gap-3 mt-2">
                          <span className="text-xs text-muted-foreground">
                            {formatDistanceToNow(activity.timestamp, {
                              addSuffix: true,
                              locale: ptBR,
                            })}
                          </span>
                          {activity.value && (
                            <>
                              <span className="text-xs text-muted-foreground">•</span>
                              <span className="text-xs font-semibold text-primary">
                                {activity.value}
                              </span>
                            </>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </AnimatePresence>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
