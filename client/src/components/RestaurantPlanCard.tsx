import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Users, Building2, Table, Package, TrendingUp } from "lucide-react";
import type { SubscriptionPlan } from "@shared/schema";

interface RestaurantUsage {
  usersCount: number;
  branchesCount: number;
  tablesCount: number;
  menuItemsCount: number;
}

interface RestaurantPlanCardProps {
  plan: SubscriptionPlan;
  usage: RestaurantUsage;
  subscriptionStatus?: 'trial' | 'ativa' | 'cancelada' | 'suspensa' | 'expirada';
}

export function RestaurantPlanCard({ plan, usage, subscriptionStatus }: RestaurantPlanCardProps) {
  const calculateUsagePercentage = (current: number, max: number | null) => {
    if (max === null || max === 0) return 0;
    return Math.min((current / max) * 100, 100);
  };

  const getUsageColor = (percentage: number) => {
    if (percentage >= 90) return "text-red-500";
    if (percentage >= 75) return "text-yellow-500";
    return "text-green-500";
  };

  const getProgressColor = (percentage: number) => {
    if (percentage >= 90) return "bg-red-500";
    if (percentage >= 75) return "bg-yellow-500";
    return "bg-green-500";
  };

  const limits = [
    {
      icon: Users,
      label: "Usuários",
      current: usage.usersCount,
      max: plan.maxUsers,
      color: "text-blue-500"
    },
    {
      icon: Building2,
      label: "Filiais",
      current: usage.branchesCount,
      max: plan.maxBranches,
      color: "text-purple-500"
    },
    {
      icon: Table,
      label: "Mesas",
      current: usage.tablesCount,
      max: plan.maxTables,
      color: "text-orange-500"
    },
    {
      icon: Package,
      label: "Produtos",
      current: usage.menuItemsCount,
      max: plan.maxMenuItems,
      color: "text-green-500"
    }
  ];

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between gap-2 pb-3">
        <div className="flex items-center gap-2">
          <CardTitle className="text-lg" data-testid="text-plan-name">
            Plano: {plan.name}
          </CardTitle>
          {subscriptionStatus && (
            <Badge 
              variant={
                subscriptionStatus === 'ativa' ? 'default' :
                subscriptionStatus === 'trial' ? 'secondary' :
                'destructive'
              }
              data-testid="badge-subscription-status"
            >
              {subscriptionStatus === 'trial' ? 'Teste' :
               subscriptionStatus === 'ativa' ? 'Ativa' :
               subscriptionStatus === 'cancelada' ? 'Cancelada' :
               subscriptionStatus === 'suspensa' ? 'Suspensa' :
               'Expirada'}
            </Badge>
          )}
        </div>
        <TrendingUp className="h-5 w-5 text-muted-foreground" />
      </CardHeader>
      <CardContent className="space-y-4">
        {limits.map((limit, index) => {
          const percentage = calculateUsagePercentage(limit.current, limit.max);
          const Icon = limit.icon;
          const isUnlimited = limit.max === null || limit.max === 0;
          
          return (
            <div key={index} className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Icon className={`h-4 w-4 ${limit.color}`} />
                  <span className="text-sm font-medium">{limit.label}</span>
                </div>
                <div className="flex items-center gap-1">
                  <span className={`text-sm font-bold ${isUnlimited ? 'text-green-500' : getUsageColor(percentage)}`} data-testid={`text-${limit.label.toLowerCase()}-usage`}>
                    {limit.current}
                  </span>
                  <span className="text-sm text-muted-foreground">
                    / {isUnlimited ? '∞' : limit.max}
                  </span>
                </div>
              </div>
              {!isUnlimited && (
                <Progress 
                  value={percentage} 
                  className="h-2"
                  data-testid={`progress-${limit.label.toLowerCase()}`}
                />
              )}
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}
