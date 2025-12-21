import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, TrendingDown, AlertCircle, CheckCircle, Lightbulb } from "lucide-react";

interface SubscriptionInsightsProps {
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
  subscription: {
    billingInterval: string;
  };
  plan: {
    name: string;
  };
}

type Insight = {
  id: string;
  type: 'success' | 'warning' | 'info' | 'tip';
  icon: any;
  title: string;
  description: string;
  badge?: string;
};

export function SubscriptionInsights({ usage, subscription, plan }: SubscriptionInsightsProps) {
  const insights: Insight[] = [];

  // Calcular percentagens de uso
  const branchesPercent = (usage.branches / usage.maxBranches) * 100;
  const tablesPercent = (usage.tables / usage.maxTables) * 100;
  const menuItemsPercent = usage.maxMenuItems === 999999 ? 0 : (usage.menuItems / usage.maxMenuItems) * 100;
  const usersPercent = usage.maxUsers === 999999 ? 0 : (usage.users / usage.maxUsers) * 100;
  const ordersPercent = usage.maxOrders === 999999 ? 0 : (usage.orders / usage.maxOrders) * 100;

  // Insight: Recurso mais usado
  const resources = [
    { name: 'filiais', percent: branchesPercent },
    { name: 'mesas', percent: tablesPercent },
    { name: 'produtos', percent: menuItemsPercent },
    { name: 'usuários', percent: usersPercent },
    { name: 'pedidos', percent: ordersPercent },
  ].filter(r => r.percent > 0);

  const mostUsed = resources.sort((a, b) => b.percent - a.percent)[0];
  
  if (mostUsed && mostUsed.percent >= 70) {
    insights.push({
      id: 'most-used',
      type: mostUsed.percent >= 90 ? 'warning' : 'info',
      icon: TrendingUp,
      title: `${mostUsed.name.charAt(0).toUpperCase() + mostUsed.name.slice(1)} em destaque`,
      description: `Você está usando ${Math.round(mostUsed.percent)}% dos seus ${mostUsed.name}. ${
        mostUsed.percent >= 90 
          ? 'Considere fazer upgrade em breve.' 
          : 'Está aproveitando bem este recurso!'
      }`,
      badge: mostUsed.percent >= 90 ? 'Atenção' : undefined,
    });
  }

  // Insight: Recurso subutilizado
  const leastUsed = resources.sort((a, b) => a.percent - b.percent)[0];
  
  if (leastUsed && leastUsed.percent < 30 && leastUsed.percent > 0) {
    insights.push({
      id: 'least-used',
      type: 'tip',
      icon: Lightbulb,
      title: `Oportunidade de otimização`,
      description: `Você está usando apenas ${Math.round(leastUsed.percent)}% dos seus ${leastUsed.name}. Explore mais este recurso para maximizar seu investimento!`,
    });
  }

  // Insight: Uso equilibrado
  const avgUsage = resources.reduce((acc, r) => acc + r.percent, 0) / resources.length;
  
  if (avgUsage >= 40 && avgUsage <= 70) {
    insights.push({
      id: 'balanced',
      type: 'success',
      icon: CheckCircle,
      title: 'Uso equilibrado',
      description: `Seu uso médio está em ${Math.round(avgUsage)}%. Você está aproveitando bem os recursos do plano ${plan.name}!`,
    });
  }

  // Insight: Plano anual
  if (subscription.billingInterval === 'anual') {
    insights.push({
      id: 'annual-savings',
      type: 'success',
      icon: CheckCircle,
      title: 'Economia garantida',
      description: 'Com o plano anual, você economiza até 2 meses de pagamento comparado ao plano mensal. Ótima escolha!',
      badge: 'Economizando',
    });
  }

  // Insight: Crescimento previsto
  if (ordersPercent > 60 && ordersPercent < 90) {
    const remainingOrders = usage.maxOrders - usage.orders;
    const daysRemaining = 30 - new Date().getDate();
    const avgOrdersPerDay = usage.orders / new Date().getDate();
    const projectedOrders = Math.round(avgOrdersPerDay * daysRemaining);
    
    if (projectedOrders > remainingOrders) {
      insights.push({
        id: 'growth-projection',
        type: 'warning',
        icon: TrendingUp,
        title: 'Crescimento acelerado',
        description: `Com base no seu ritmo atual de ${Math.round(avgOrdersPerDay)} pedidos/dia, você pode atingir o limite de pedidos antes do fim do mês. Considere planejar um upgrade.`,
        badge: 'Previsão',
      });
    }
  }

  // Insight: Eficiência operacional
  if (tablesPercent >= 80 && ordersPercent >= 70) {
    insights.push({
      id: 'operational-efficiency',
      type: 'success',
      icon: CheckCircle,
      title: 'Alta eficiência operacional',
      description: 'Suas mesas e pedidos estão com uso otimizado. Você está operando com excelente eficiência!',
      badge: 'Destaque',
    });
  }

  // Insight: Expansão recomendada
  if (branchesPercent >= 80 && avgUsage >= 60) {
    insights.push({
      id: 'expansion-ready',
      type: 'info',
      icon: TrendingUp,
      title: 'Pronto para expandir',
      description: 'Seu alto uso de recursos indica que seu negócio está crescendo. Talvez seja hora de considerar adicionar mais filiais ou fazer upgrade de plano.',
    });
  }

  const getIconColor = (type: Insight['type']) => {
    switch (type) {
      case 'success':
        return 'text-green-600';
      case 'warning':
        return 'text-yellow-600';
      case 'info':
        return 'text-blue-600';
      case 'tip':
        return 'text-purple-600';
      default:
        return 'text-muted-foreground';
    }
  };

  const getBadgeVariant = (type: Insight['type']) => {
    switch (type) {
      case 'success':
        return 'default';
      case 'warning':
        return 'secondary';
      default:
        return 'outline';
    }
  };

  if (insights.length === 0) {
    return null;
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <Lightbulb className="h-4 w-4" />
          Insights Personalizados
        </CardTitle>
        <CardDescription className="text-xs">
          Análise inteligente do seu uso
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {insights.slice(0, 4).map((insight) => {
            const Icon = insight.icon;
            return (
              <div
                key={insight.id}
                className="flex gap-3 p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
              >
                <div className={`flex-shrink-0 ${getIconColor(insight.type)}`}>
                  <Icon className="h-4 w-4" />
                </div>
                <div className="flex-1 space-y-1">
                  <div className="flex items-center gap-2">
                    <h4 className="text-sm font-medium">{insight.title}</h4>
                    {insight.badge && (
                      <Badge 
                        variant={getBadgeVariant(insight.type)} 
                        className="text-xs"
                      >
                        {insight.badge}
                      </Badge>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    {insight.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
