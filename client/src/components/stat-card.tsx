import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, TrendingDown } from "lucide-react";
import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  iconColor: string;
  iconBgColor: string;
  trend?: {
    value: number;
    label: string;
  };
  testId?: string;
}

export function StatCard({
  title,
  value,
  subtitle,
  icon: Icon,
  iconColor,
  iconBgColor,
  trend,
  testId,
}: StatCardProps) {
  // Validate trend value to prevent NaN display
  const trendValue = trend && !isNaN(trend.value) ? trend.value : null;
  const isPositive = trendValue !== null && trendValue > 0;
  const isNegative = trendValue !== null && trendValue < 0;
  const isNeutral = trendValue !== null && trendValue === 0;

  return (
    <Card className="hover-elevate overflow-visible animate-in fade-in slide-in-from-bottom-4 duration-500">
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <p className="text-sm font-medium text-muted-foreground mb-1 transition-colors">
              {title}
            </p>
            <div className="flex items-baseline gap-2 flex-wrap">
              <h3 
                className="text-3xl font-bold text-foreground transition-all" 
                data-testid={testId}
              >
                {value}
              </h3>
              {trendValue !== null && (
                <Badge
                  variant="secondary"
                  className={cn(
                    "gap-1 text-xs font-medium transition-all animate-in fade-in zoom-in-95 duration-300 delay-150",
                    isPositive && "bg-green-500/10 text-green-700 dark:text-green-400 border-green-500/20",
                    isNegative && "bg-red-500/10 text-red-700 dark:text-red-400 border-red-500/20",
                    isNeutral && "bg-muted text-muted-foreground"
                  )}
                  data-testid={`${testId}-trend`}
                >
                  {isPositive && <TrendingUp className="h-3 w-3" />}
                  {isNegative && <TrendingDown className="h-3 w-3" />}
                  {isNeutral ? "0%" : `${isPositive ? "+" : ""}${trendValue.toFixed(1)}%`}
                </Badge>
              )}
            </div>
            {(subtitle || trend?.label) && (
              <p className="text-xs text-muted-foreground mt-2 transition-colors">
                {trend?.label || subtitle}
              </p>
            )}
          </div>

          <div
            className={cn(
              "rounded-lg p-3 flex items-center justify-center flex-shrink-0 transition-transform hover:scale-110",
              iconBgColor
            )}
          >
            <Icon className={cn("h-6 w-6 transition-colors", iconColor)} />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
