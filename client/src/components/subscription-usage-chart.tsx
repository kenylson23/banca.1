import { useMemo } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";

interface UsageData {
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
}

interface SubscriptionUsageChartProps {
  usage: UsageData;
}

export function SubscriptionUsageChart({ usage }: SubscriptionUsageChartProps) {
  const overallUsage = useMemo(() => {
    const resources = [
      { current: usage.branches, max: usage.maxBranches },
      { current: usage.tables, max: usage.maxTables },
      { current: usage.menuItems, max: usage.maxMenuItems === 999999 ? 1000 : usage.maxMenuItems },
      { current: usage.users, max: usage.maxUsers === 999999 ? 100 : usage.maxUsers },
      { current: usage.orders, max: usage.maxOrders === 999999 ? 1000 : usage.maxOrders },
    ];

    const totalPercentage = resources.reduce((acc, resource) => {
      return acc + (resource.current / resource.max) * 100;
    }, 0);

    return Math.min(totalPercentage / resources.length, 100);
  }, [usage]);

  const getUsageColor = (percentage: number) => {
    if (percentage >= 90) return "text-red-600";
    if (percentage >= 75) return "text-yellow-600";
    return "text-green-600";
  };

  const getUsageStatus = (percentage: number) => {
    if (percentage >= 90) return { icon: TrendingUp, text: "Atenção", color: "text-red-600" };
    if (percentage >= 75) return { icon: TrendingUp, text: "Moderado", color: "text-yellow-600" };
    return { icon: Minus, text: "Saudável", color: "text-green-600" };
  };

  const status = getUsageStatus(overallUsage);
  const StatusIcon = status.icon;

  // Valores para o círculo SVG
  const size = 160;
  const strokeWidth = 12;
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (overallUsage / 100) * circumference;

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <StatusIcon className={`h-4 w-4 ${status.color}`} />
          Uso Geral do Plano
        </CardTitle>
        <CardDescription className="text-xs">
          Visão consolidada do seu consumo
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col items-center gap-4">
          {/* Gráfico Circular */}
          <div className="relative">
            <svg width={size} height={size} className="transform -rotate-90">
              {/* Background circle */}
              <circle
                cx={size / 2}
                cy={size / 2}
                r={radius}
                fill="none"
                stroke="currentColor"
                strokeWidth={strokeWidth}
                className="text-muted/20"
              />
              {/* Progress circle */}
              <circle
                cx={size / 2}
                cy={size / 2}
                r={radius}
                fill="none"
                stroke="currentColor"
                strokeWidth={strokeWidth}
                strokeDasharray={circumference}
                strokeDashoffset={offset}
                strokeLinecap="round"
                className={`transition-all duration-1000 ease-out ${
                  overallUsage >= 90
                    ? "text-red-500"
                    : overallUsage >= 75
                    ? "text-yellow-500"
                    : "text-green-500"
                }`}
              />
            </svg>
            {/* Center text */}
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className={`text-3xl font-bold ${getUsageColor(overallUsage)}`}>
                {Math.round(overallUsage)}%
              </span>
              <span className="text-xs text-muted-foreground">em uso</span>
            </div>
          </div>

          {/* Status badge */}
          <div className={`text-sm font-medium ${status.color}`}>
            Status: {status.text}
          </div>

          {/* Quick stats */}
          <div className="w-full space-y-2">
            <div className="flex justify-between text-xs">
              <span className="text-muted-foreground">Recursos em alta demanda:</span>
            </div>
            <div className="space-y-1.5">
              {[
                { name: "Pedidos", current: usage.orders, max: usage.maxOrders },
                { name: "Mesas", current: usage.tables, max: usage.maxTables },
                { name: "Produtos", current: usage.menuItems, max: usage.maxMenuItems },
              ]
                .sort((a, b) => (b.current / b.max) - (a.current / a.max))
                .slice(0, 3)
                .map((resource, i) => {
                  const percentage = (resource.current / resource.max) * 100;
                  return (
                    <div key={i} className="space-y-1">
                      <div className="flex justify-between text-xs">
                        <span>{resource.name}</span>
                        <span className={getUsageColor(percentage)}>
                          {Math.round(percentage)}%
                        </span>
                      </div>
                      <Progress value={percentage} className="h-1" />
                    </div>
                  );
                })}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
