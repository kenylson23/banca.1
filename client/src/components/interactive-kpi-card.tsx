import { motion, AnimatePresence } from "framer-motion";
import { LucideIcon, TrendingUp, TrendingDown, Minus } from "lucide-react";
import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface InteractiveKPICardProps {
  title: string;
  value: string | number;
  change?: number;
  changeLabel?: string;
  icon: LucideIcon;
  iconColor?: string;
  iconBgColor?: string;
  gradient?: string;
  sparklineData?: number[];
  details?: { label: string; value: string }[];
  isLoading?: boolean;
}

export function InteractiveKPICard({
  title,
  value,
  change,
  changeLabel = "vs período anterior",
  icon: Icon,
  iconColor = "text-orange-500",
  iconBgColor = "bg-orange-500/10",
  gradient = "from-orange-500/5 to-amber-500/5",
  sparklineData,
  details,
  isLoading = false,
}: InteractiveKPICardProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const getTrendIcon = () => {
    if (!change) return Minus;
    return change > 0 ? TrendingUp : TrendingDown;
  };

  const getTrendColor = () => {
    if (!change) return "text-muted-foreground";
    return change > 0 ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400";
  };

  const TrendIcon = getTrendIcon();

  if (isLoading) {
    return (
      <Card className="overflow-hidden">
        <CardContent className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-muted rounded w-1/2" />
            <div className="h-8 bg-muted rounded w-3/4" />
            <div className="h-3 bg-muted rounded w-1/3" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
    >
      <Card
        className={cn(
          "overflow-hidden cursor-pointer transition-all duration-300 hover:shadow-xl",
          "border-border/50 bg-gradient-to-br",
          gradient,
          isExpanded && "ring-2 ring-orange-500/20"
        )}
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <CardContent className="p-6">
          {/* Header */}
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              <p className="text-sm font-medium text-muted-foreground mb-1">
                {title}
              </p>
              <motion.h3
                className="text-3xl font-bold tracking-tight"
                initial={{ scale: 0.5 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 200, damping: 15 }}
              >
                {value}
              </motion.h3>
            </div>
            
            {/* Icon */}
            <motion.div
              className={cn(
                "h-12 w-12 rounded-xl flex items-center justify-center",
                iconBgColor
              )}
              whileHover={{ scale: 1.1, rotate: 5 }}
              whileTap={{ scale: 0.95 }}
            >
              <Icon className={cn("h-6 w-6", iconColor)} />
            </motion.div>
          </div>

          {/* Trend */}
          {change !== undefined && (
            <div className="flex items-center gap-2 mb-3">
              <div className={cn(
                "flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium",
                getTrendColor(),
                change > 0 ? "bg-green-500/10" : change < 0 ? "bg-red-500/10" : "bg-muted"
              )}>
                <TrendIcon className="h-3 w-3" />
                <span>{change > 0 ? "+" : ""}{change}%</span>
              </div>
              <span className="text-xs text-muted-foreground">{changeLabel}</span>
            </div>
          )}

          {/* Sparkline */}
          {sparklineData && sparklineData.length > 0 && (
            <div className="h-12 mb-3">
              <MiniSparkline data={sparklineData} color={iconColor} />
            </div>
          )}

          {/* Expanded Details */}
          <AnimatePresence>
            {isExpanded && details && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="border-t border-border/50 pt-4 mt-4"
              >
                <div className="space-y-2">
                  {details.map((detail, idx) => (
                    <motion.div
                      key={idx}
                      initial={{ x: -20, opacity: 0 }}
                      animate={{ x: 0, opacity: 1 }}
                      transition={{ delay: idx * 0.05 }}
                      className="flex items-center justify-between text-sm"
                    >
                      <span className="text-muted-foreground">{detail.label}</span>
                      <span className="font-medium">{detail.value}</span>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Expand Indicator */}
          {details && (
            <div className="flex justify-center mt-3">
              <motion.div
                animate={{ rotate: isExpanded ? 180 : 0 }}
                transition={{ duration: 0.2 }}
                className="text-muted-foreground"
              >
                <svg
                  width="12"
                  height="12"
                  viewBox="0 0 12 12"
                  fill="none"
                  className="opacity-50"
                >
                  <path
                    d="M2 4L6 8L10 4"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </motion.div>
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}

// Mini Sparkline Component
function MiniSparkline({ data, color }: { data: number[]; color: string }) {
  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min || 1;

  const points = data.map((value, index) => {
    const x = (index / (data.length - 1)) * 100;
    const y = 100 - ((value - min) / range) * 100;
    return `${x},${y}`;
  }).join(" ");

  return (
    <svg
      viewBox="0 0 100 100"
      preserveAspectRatio="none"
      className="w-full h-full"
    >
      <motion.polyline
        points={points}
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={color}
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 1, ease: "easeInOut" }}
      />
    </svg>
  );
}
