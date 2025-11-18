import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";
import { Target, TrendingUp } from "lucide-react";
import { formatKwanza } from "@/lib/formatters";

interface Goal {
  id: string;
  title: string;
  current: number;
  target: number;
  unit: "currency" | "number" | "percentage";
  period?: string;
}

interface GoalsWidgetProps {
  goals: Goal[];
  title?: string;
  className?: string;
}

export function GoalsWidget({
  goals,
  title = "Metas do Período",
  className = "",
}: GoalsWidgetProps) {
  const formatValue = (value: number, unit: Goal["unit"]) => {
    switch (unit) {
      case "currency":
        return formatKwanza(value);
      case "percentage":
        return `${value.toFixed(1)}%`;
      default:
        return value.toString();
    }
  };

  const getProgressColor = (percentage: number) => {
    if (percentage >= 100) return "text-success";
    if (percentage >= 75) return "text-primary";
    if (percentage >= 50) return "text-warning";
    return "text-muted-foreground";
  };

  const getProgressBg = (percentage: number) => {
    if (percentage >= 100) return "bg-success";
    if (percentage >= 75) return "bg-primary";
    if (percentage >= 50) return "bg-warning";
    return "bg-muted-foreground";
  };

  return (
    <Card className={className}>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg font-semibold flex items-center gap-2">
          <Target className="w-5 h-5 text-primary" />
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {goals.map((goal, index) => {
            const percentage = Math.min((goal.current / goal.target) * 100, 100);
            const size = 120;
            const strokeWidth = 8;
            const radius = (size - strokeWidth) / 2;
            const circumference = radius * 2 * Math.PI;
            const offset = circumference - (percentage / 100) * circumference;

            return (
              <motion.div
                key={goal.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="flex items-center gap-4"
              >
                <div className="relative flex-shrink-0">
                  <svg width={size} height={size} className="-rotate-90">
                    <circle
                      cx={size / 2}
                      cy={size / 2}
                      r={radius}
                      stroke="hsl(var(--muted))"
                      strokeWidth={strokeWidth}
                      fill="none"
                    />
                    <motion.circle
                      cx={size / 2}
                      cy={size / 2}
                      r={radius}
                      stroke={`hsl(var(--${percentage >= 100 ? "success" : percentage >= 75 ? "primary" : percentage >= 50 ? "warning" : "muted-foreground"}))`}
                      strokeWidth={strokeWidth}
                      fill="none"
                      strokeLinecap="round"
                      initial={{ strokeDashoffset: circumference }}
                      animate={{ strokeDashoffset: offset }}
                      transition={{ duration: 1.5, ease: "easeOut" }}
                      style={{
                        strokeDasharray: circumference,
                      }}
                    />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className={`text-2xl font-bold ${getProgressColor(percentage)}`}>
                      {percentage.toFixed(0)}%
                    </span>
                  </div>
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <h4 className="font-semibold text-sm">{goal.title}</h4>
                    {percentage >= 100 && (
                      <Badge variant="outline" className="bg-success/10 text-success border-success/20 flex-shrink-0">
                        <TrendingUp className="w-3 h-3 mr-1" />
                        Completo
                      </Badge>
                    )}
                  </div>

                  {goal.period && (
                    <p className="text-xs text-muted-foreground mb-2">
                      {goal.period}
                    </p>
                  )}

                  <div className="flex items-baseline gap-2">
                    <span className="text-lg font-bold">
                      {formatValue(goal.current, goal.unit)}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      de {formatValue(goal.target, goal.unit)}
                    </span>
                  </div>

                  <div className="mt-2 h-1.5 bg-muted rounded-full overflow-hidden">
                    <motion.div
                      className={`h-full ${getProgressBg(percentage)} rounded-full`}
                      initial={{ width: 0 }}
                      animate={{ width: `${percentage}%` }}
                      transition={{ duration: 1.5, ease: "easeOut" }}
                    />
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
