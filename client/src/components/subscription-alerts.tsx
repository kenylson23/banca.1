import { useMemo } from "react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { 
  AlertTriangle, 
  TrendingUp, 
  Calendar, 
  Clock,
  ArrowUpCircle,
  Info
} from "lucide-react";
import { differenceInDays, format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface SubscriptionAlertsProps {
  subscription: {
    status: string;
    currentPeriodEnd: Date;
  };
  limits: {
    withinLimits: {
      branches: boolean;
      tables: boolean;
      menuItems: boolean;
      users: boolean;
      orders: boolean;
    };
  };
  usage: {
    branches: number;
    maxBranches: number;
    tables: number;
    maxTables: number;
    menuItems: number;
    maxMenuItems: number;
    users: number;
    maxUsers: number;
    orders: number;
    maxOrders: number;
  };
  onUpgrade?: () => void;
}

type AlertType = {
  id: string;
  type: "warning" | "info" | "error";
  icon: any;
  title: string;
  description: string;
  action?: {
    label: string;
    onClick: () => void;
  };
  priority: number;
};

export function SubscriptionAlerts({ 
  subscription, 
  limits, 
  usage,
  onUpgrade 
}: SubscriptionAlertsProps) {
  const alerts = useMemo(() => {
    const alertList: AlertType[] = [];
    const daysUntilRenewal = differenceInDays(new Date(subscription.currentPeriodEnd), new Date());

    // Alert: Trial expirando
    if (subscription.status === 'trial' && daysUntilRenewal <= 7) {
      alertList.push({
        id: 'trial-expiring',
        type: 'warning',
        icon: Clock,
        title: daysUntilRenewal <= 3 ? '🚨 Trial expira em breve!' : 'Trial terminando',
        description: `Seu período de teste termina em ${daysUntilRenewal} ${daysUntilRenewal === 1 ? 'dia' : 'dias'} (${format(new Date(subscription.currentPeriodEnd), "dd 'de' MMM", { locale: ptBR })}). Escolha um plano para continuar usando o sistema.`,
        action: onUpgrade ? {
          label: 'Escolher Plano',
          onClick: onUpgrade
        } : undefined,
        priority: 1
      });
    }

    // Alert: Pagamento próximo
    if (subscription.status === 'ativa' && daysUntilRenewal <= 7) {
      alertList.push({
        id: 'payment-due',
        type: 'info',
        icon: Calendar,
        title: 'Renovação próxima',
        description: `Sua assinatura será renovada em ${daysUntilRenewal} ${daysUntilRenewal === 1 ? 'dia' : 'dias'} (${format(new Date(subscription.currentPeriodEnd), "dd 'de' MMM", { locale: ptBR })}).`,
        priority: 3
      });
    }

    // Alert: Limite atingido
    const limitReached = !limits.withinLimits.branches || 
                        !limits.withinLimits.tables || 
                        !limits.withinLimits.menuItems || 
                        !limits.withinLimits.users || 
                        !limits.withinLimits.orders;

    if (limitReached) {
      const limitedResources = [];
      if (!limits.withinLimits.branches) limitedResources.push('filiais');
      if (!limits.withinLimits.tables) limitedResources.push('mesas');
      if (!limits.withinLimits.menuItems) limitedResources.push('produtos');
      if (!limits.withinLimits.users) limitedResources.push('usuários');
      if (!limits.withinLimits.orders) limitedResources.push('pedidos');

      alertList.push({
        id: 'limit-reached',
        type: 'error',
        icon: AlertTriangle,
        title: '⚠️ Limite atingido!',
        description: `Você atingiu o limite de ${limitedResources.join(', ')}. Faça upgrade para continuar crescendo.`,
        action: onUpgrade ? {
          label: 'Fazer Upgrade',
          onClick: onUpgrade
        } : undefined,
        priority: 1
      });
    }

    // Alert: Perto do limite (80%)
    const nearLimitResources = [];
    const checkLimit = (current: number, max: number, name: string) => {
      if (max === 999999) return false;
      const percentage = (current / max) * 100;
      if (percentage >= 80 && percentage < 100) {
        nearLimitResources.push({ name, percentage });
        return true;
      }
      return false;
    };

    checkLimit(usage.branches, usage.maxBranches, 'filiais');
    checkLimit(usage.tables, usage.maxTables, 'mesas');
    checkLimit(usage.menuItems, usage.maxMenuItems, 'produtos');
    checkLimit(usage.users, usage.maxUsers, 'usuários');
    checkLimit(usage.orders, usage.maxOrders, 'pedidos');

    if (nearLimitResources.length > 0 && !limitReached) {
      const mostUsed = nearLimitResources.sort((a, b) => b.percentage - a.percentage)[0];
      alertList.push({
        id: 'near-limit',
        type: 'warning',
        icon: TrendingUp,
        title: 'Você está próximo do limite',
        description: `Você está usando ${Math.round(mostUsed.percentage)}% dos seus ${mostUsed.name}. Considere fazer upgrade em breve.`,
        action: onUpgrade ? {
          label: 'Ver Planos',
          onClick: onUpgrade
        } : undefined,
        priority: 2
      });
    }

    // Alert: Uso eficiente (informativo)
    const overallUsage = [
      usage.branches / usage.maxBranches,
      usage.tables / usage.maxTables,
      usage.menuItems / (usage.maxMenuItems === 999999 ? 1000 : usage.maxMenuItems),
      usage.users / (usage.maxUsers === 999999 ? 100 : usage.maxUsers),
      usage.orders / (usage.maxOrders === 999999 ? 1000 : usage.maxOrders),
    ].reduce((acc, val) => acc + val, 0) / 5;

    if (overallUsage < 0.5 && subscription.status === 'ativa' && alertList.length === 0) {
      alertList.push({
        id: 'efficient-usage',
        type: 'info',
        icon: Info,
        title: '✅ Uso eficiente',
        description: `Você está usando apenas ${Math.round(overallUsage * 100)}% do seu plano. Está aproveitando bem os recursos disponíveis!`,
        priority: 4
      });
    }

    // Ordenar por prioridade
    return alertList.sort((a, b) => a.priority - b.priority);
  }, [subscription, limits, usage, onUpgrade]);

  if (alerts.length === 0) {
    return null;
  }

  const getAlertVariant = (type: AlertType['type']) => {
    switch (type) {
      case 'error':
        return 'destructive';
      case 'warning':
        return 'default';
      default:
        return 'default';
    }
  };

  return (
    <div className="space-y-3">
      {alerts.slice(0, 3).map((alert) => {
        const Icon = alert.icon;
        return (
          <Alert 
            key={alert.id} 
            variant={getAlertVariant(alert.type)}
            className="py-3"
          >
            <Icon className="h-4 w-4" />
            <AlertTitle className="text-sm font-semibold">{alert.title}</AlertTitle>
            <AlertDescription className="text-xs mt-1">
              {alert.description}
            </AlertDescription>
            {alert.action && (
              <Button
                size="sm"
                variant={alert.type === 'error' ? 'default' : 'outline'}
                className="mt-3 h-8 text-xs"
                onClick={alert.action.onClick}
              >
                <ArrowUpCircle className="h-3.5 w-3.5 mr-1.5" />
                {alert.action.label}
              </Button>
            )}
          </Alert>
        );
      })}
    </div>
  );
}
