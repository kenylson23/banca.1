import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, Award, Medal } from "lucide-react";
import { formatKwanza } from "@/lib/formatters";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import type { MenuItem } from "@shared/schema";

interface TopDishesCardProps {
  dishes: Array<{
    menuItem: MenuItem;
    count: number;
    totalRevenue: string;
  }>;
  className?: string;
}

export function TopDishesCard({ dishes, className }: TopDishesCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.4 }}
      className={className}
    >
      <Card className="hover-elevate border-border/50">
        <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-4">
          <CardTitle className="text-xl font-bold flex items-center gap-2">
            <Award className="h-5 w-5 text-yellow-500" />
            Pratos Mais Pedidos
          </CardTitle>
          <Badge variant="secondary" className="gap-1">
            <TrendingUp className="h-3 w-3" />
            Top 5
          </Badge>
        </CardHeader>
        <CardContent>
          {dishes && dishes.length > 0 ? (
            <div className="space-y-3">
              {dishes.map((dish, index) => (
                <motion.div
                  key={dish.menuItem.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: 0.5 + (index * 0.1) }}
                  className={cn(
                    "flex items-center gap-4 p-3 rounded-lg hover-elevate group",
                    "bg-gradient-to-r from-transparent to-transparent hover:from-primary/5"
                  )}
                  data-testid={`dish-top-${index}`}
                >
                  <div className={cn(
                    "h-12 w-12 rounded-xl flex items-center justify-center flex-shrink-0",
                    "bg-gradient-to-br shadow-md transition-transform group-hover:scale-110",
                    index === 0 && "from-yellow-400 to-yellow-600",
                    index === 1 && "from-gray-300 to-gray-500",
                    index === 2 && "from-orange-400 to-orange-600",
                    index > 2 && "from-primary/20 to-primary/30"
                  )}>
                    {index < 3 ? (
                      <Medal className={cn("h-6 w-6", index < 3 && "text-white")} />
                    ) : (
                      <span className="text-lg font-bold text-primary">#{index + 1}</span>
                    )}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-foreground truncate group-hover:text-primary transition-colors">
                      {dish.menuItem.name}
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant="outline" className="text-xs gap-1 bg-green-500/10 border-green-500/30">
                        <span className="text-green-700 dark:text-green-400 font-semibold">
                          {formatKwanza(dish.totalRevenue)}
                        </span>
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        {dish.count} pedidos
                      </span>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <p>Nenhum dado disponível</p>
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}
