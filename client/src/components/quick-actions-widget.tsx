import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import {
  Plus,
  ShoppingBag,
  Utensils,
  Users,
  FileText,
  Settings,
  Zap,
} from "lucide-react";

interface QuickAction {
  id: string;
  title: string;
  description: string;
  icon: any;
  color: string;
  onClick: () => void;
}

interface QuickActionsWidgetProps {
  actions: QuickAction[];
  title?: string;
  className?: string;
}

const defaultActions: QuickAction[] = [
  {
    id: "new-order",
    title: "Novo Pedido",
    description: "Criar pedido rápido",
    icon: Plus,
    color: "primary",
    onClick: () => console.log("New order"),
  },
  {
    id: "view-orders",
    title: "Pedidos",
    description: "Ver todos os pedidos",
    icon: ShoppingBag,
    color: "success",
    onClick: () => console.log("View orders"),
  },
  {
    id: "manage-menu",
    title: "Menu",
    description: "Gerenciar cardápio",
    icon: Utensils,
    color: "warning",
    onClick: () => console.log("Manage menu"),
  },
  {
    id: "reports",
    title: "Relatórios",
    description: "Ver análises",
    icon: FileText,
    color: "info",
    onClick: () => console.log("Reports"),
  },
];

const colorMap = {
  primary: {
    bg: "bg-primary/10",
    text: "text-primary",
  },
  success: {
    bg: "bg-success/10",
    text: "text-success",
  },
  warning: {
    bg: "bg-warning/10",
    text: "text-warning",
  },
  info: {
    bg: "bg-info/10",
    text: "text-info",
  },
} as const;

export function QuickActionsWidget({
  actions = defaultActions,
  title = "Ações Rápidas",
  className = "",
}: QuickActionsWidgetProps) {
  return (
    <Card className={className}>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg font-semibold flex items-center gap-2">
          <Zap className="w-5 h-5 text-primary" />
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-3">
          {actions.map((action, index) => {
            const Icon = action.icon;
            const colors = colorMap[action.color as keyof typeof colorMap] || colorMap.primary;

            return (
              <motion.div
                key={action.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
              >
                <Button
                  variant="outline"
                  className="w-full h-auto p-4 flex flex-col items-start gap-2 hover-elevate active-elevate-2"
                  onClick={action.onClick}
                  data-testid={`button-quick-action-${action.id}`}
                >
                  <div className={`p-2 rounded-lg ${colors.bg}`}>
                    <Icon className={`w-5 h-5 ${colors.text}`} />
                  </div>
                  <div className="text-left">
                    <div className="font-semibold text-sm">{action.title}</div>
                    <div className="text-xs text-muted-foreground mt-0.5">
                      {action.description}
                    </div>
                  </div>
                </Button>
              </motion.div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
