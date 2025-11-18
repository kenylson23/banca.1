import { Button } from "@/components/ui/button";
import { Calendar, Clock, TrendingUp } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

type FilterOption = "today" | "week" | "month" | "year";

interface QuickFiltersProps {
  selected?: FilterOption;
  onSelect: (filter: FilterOption) => void;
  className?: string;
}

const filters = [
  { value: "today" as FilterOption, label: "Hoje", icon: Clock },
  { value: "week" as FilterOption, label: "Semana", icon: Calendar },
  { value: "month" as FilterOption, label: "Mês", icon: Calendar },
  { value: "year" as FilterOption, label: "Ano", icon: TrendingUp },
];

export function QuickFilters({ selected = "today", onSelect, className }: QuickFiltersProps) {
  return (
    <motion.div 
      className={cn("flex gap-2 flex-wrap", className)}
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      {filters.map((filter, index) => {
        const Icon = filter.icon;
        const isSelected = selected === filter.value;
        
        return (
          <motion.div
            key={filter.value}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.2, delay: index * 0.05 }}
          >
            <Button
              variant={isSelected ? "default" : "outline"}
              size="sm"
              onClick={() => onSelect(filter.value)}
              className={cn(
                "gap-2 transition-all",
                isSelected && "shadow-lg"
              )}
              data-testid={`filter-${filter.value}`}
            >
              <Icon className="h-4 w-4" />
              {filter.label}
            </Button>
          </motion.div>
        );
      })}
    </motion.div>
  );
}
