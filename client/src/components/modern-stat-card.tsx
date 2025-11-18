import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";
import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { Area, AreaChart, ResponsiveContainer } from "recharts";

interface ModernStatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  gradient?: string;
  trend?: {
    value: number;
    label: string;
  };
  sparklineData?: Array<{ value: number }>;
  testId?: string;
  delay?: number;
}

export function ModernStatCard({
  title,
  value,
  subtitle,
  icon: Icon,
  gradient = "from-blue-500/10 to-purple-500/10",
  trend,
  sparklineData,
  testId,
  delay = 0,
}: ModernStatCardProps) {
  const trendValue = trend && !isNaN(trend.value) ? trend.value : null;
  const isPositive = trendValue !== null && trendValue > 0;
  const isNegative = trendValue !== null && trendValue < 0;
  const isNeutral = trendValue !== null && trendValue === 0;

  const trendColor = isPositive 
    ? "from-green-500/20 to-emerald-500/20" 
    : isNegative 
    ? "from-red-500/20 to-rose-500/20" 
    : "from-gray-500/20 to-slate-500/20";

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay }}
    >
      <Card className={cn(
        "hover-elevate overflow-hidden relative group",
        "border-border/50 shadow-sm"
      )}>
        <div className={cn(
          "absolute inset-0 bg-gradient-to-br opacity-50 group-hover:opacity-70 transition-opacity",
          gradient
        )} />
        
        <CardContent className="p-6 relative">
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              <p className="text-sm font-medium text-muted-foreground mb-1">
                {title}
              </p>
              <div className="flex items-baseline gap-3 flex-wrap">
                <motion.h3 
                  className="text-3xl sm:text-4xl font-bold text-foreground" 
                  data-testid={testId}
                  initial={{ scale: 0.5 }}
                  animate={{ scale: 1 }}
                  transition={{ duration: 0.5, delay: delay + 0.2, type: "spring" }}
                >
                  {value}
                </motion.h3>
                
                {trendValue !== null && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.3, delay: delay + 0.4 }}
                  >
                    <Badge
                      variant="secondary"
                      className={cn(
                        "gap-1 text-xs font-semibold px-2 py-1",
                        isPositive && "bg-green-500/15 text-green-700 dark:text-green-400 border-green-500/30",
                        isNegative && "bg-red-500/15 text-red-700 dark:text-red-400 border-red-500/30",
                        isNeutral && "bg-muted text-muted-foreground"
                      )}
                      data-testid={`${testId}-trend`}
                    >
                      {isPositive && <TrendingUp className="h-3 w-3" />}
                      {isNegative && <TrendingDown className="h-3 w-3" />}
                      {isNeutral && <Minus className="h-3 w-3" />}
                      {isNeutral ? "0%" : `${isPositive ? "+" : ""}${trendValue.toFixed(1)}%`}
                    </Badge>
                  </motion.div>
                )}
              </div>
            </div>

            <motion.div
              className={cn(
                "rounded-xl p-3 bg-gradient-to-br shadow-lg",
                gradient,
                "backdrop-blur-sm"
              )}
              whileHover={{ scale: 1.1, rotate: 5 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <Icon className="h-6 w-6 text-foreground" />
            </motion.div>
          </div>


          {(subtitle || trend?.label) && (
            <p className="text-xs text-muted-foreground">
              {trend?.label || subtitle}
            </p>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}
