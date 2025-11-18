import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";
import { LucideIcon, TrendingUp, TrendingDown, Minus } from "lucide-react";
import { AnimatedCounter } from "./animated-counter";
import { MiniSparkline } from "./mini-sparkline";
import { cn } from "@/lib/utils";

interface AdvancedKpiCardProps {
  title: string;
  value: number;
  prefix?: string;
  suffix?: string;
  decimals?: number;
  icon: LucideIcon;
  change?: number;
  changeLabel?: string;
  sparklineData?: number[];
  gradient?: string;
  delay?: number;
  "data-testid"?: string;
}

export function AdvancedKpiCard({
  title,
  value,
  prefix = "",
  suffix = "",
  decimals = 0,
  icon: Icon,
  change,
  changeLabel = "vs período anterior",
  sparklineData,
  gradient = "from-primary/10 to-transparent",
  delay = 0,
  "data-testid": testId,
}: AdvancedKpiCardProps) {
  const getTrendIcon = () => {
    if (change === undefined || change === null) return null;
    if (change > 0) return TrendingUp;
    if (change < 0) return TrendingDown;
    return Minus;
  };

  const getTrendColor = () => {
    if (change === undefined || change === null) return "text-muted-foreground";
    if (change > 0) return "text-success";
    if (change < 0) return "text-destructive";
    return "text-muted-foreground";
  };

  const TrendIcon = getTrendIcon();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay }}
      data-testid={testId}
    >
      <Card className="relative overflow-hidden group hover-elevate active-elevate-2 transition-all duration-300">
        <div className={cn("absolute inset-0 bg-gradient-to-br opacity-50", gradient)} />
        
        <CardContent className="p-6 relative">
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              <p className="text-sm font-medium text-muted-foreground mb-1">
                {title}
              </p>
              <div className="text-3xl font-bold tracking-tight">
                <AnimatedCounter
                  value={value}
                  decimals={decimals}
                  prefix={prefix}
                  suffix={suffix}
                  className="bg-gradient-to-br from-foreground to-foreground/70 bg-clip-text text-transparent"
                />
              </div>
            </div>
            
            <motion.div
              className="p-3 rounded-lg bg-primary/10"
              whileHover={{ scale: 1.1, rotate: 5 }}
              transition={{ type: "spring", stiffness: 400, damping: 10 }}
            >
              <Icon className="w-5 h-5 text-primary" />
            </motion.div>
          </div>

          {sparklineData && sparklineData.length > 0 && (
            <div className="mb-3 -mx-2">
              <MiniSparkline data={sparklineData} height={32} />
            </div>
          )}

          {change !== undefined && change !== null && (
            <div className="flex items-center gap-2">
              {TrendIcon && (
                <Badge
                  variant="outline"
                  className={cn(
                    "flex items-center gap-1 font-medium border-0 px-2 py-0.5",
                    getTrendColor()
                  )}
                >
                  <TrendIcon className="w-3 h-3" />
                  <span className="text-xs">
                    {Math.abs(change).toFixed(1)}%
                  </span>
                </Badge>
              )}
              <span className="text-xs text-muted-foreground">
                {changeLabel}
              </span>
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}
