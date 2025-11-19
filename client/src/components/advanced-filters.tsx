import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { DateRangePicker } from "@/components/ui/date-range-picker";
import { motion } from "framer-motion";
import {
  Calendar,
  TrendingUp,
  Calendar as CalendarIcon,
  BarChart3,
  X,
  Download,
  RefreshCw,
} from "lucide-react";
import { DateRange } from "react-day-picker";

export type FilterOption = "today" | "week" | "month" | "3months" | "year";

interface AdvancedFiltersProps {
  quickFilter: FilterOption;
  onQuickFilterChange: (filter: FilterOption) => void;
  dateRange?: DateRange;
  onDateRangeChange: (range: DateRange | undefined) => void;
  showComparison?: boolean;
  onToggleComparison?: () => void;
  onRefresh?: () => void;
  onExport?: () => void;
  isLoading?: boolean;
}

const filterOptions: Array<{ value: FilterOption; label: string; icon: any }> = [
  { value: "today", label: "Hoje", icon: Calendar },
  { value: "week", label: "Semana", icon: TrendingUp },
  { value: "month", label: "Mês", icon: CalendarIcon },
  { value: "3months", label: "3 Meses", icon: BarChart3 },
  { value: "year", label: "Ano", icon: BarChart3 },
];

export function AdvancedFilters({
  quickFilter,
  onQuickFilterChange,
  dateRange,
  onDateRangeChange,
  showComparison = false,
  onToggleComparison,
  onRefresh,
  onExport,
  isLoading = false,
}: AdvancedFiltersProps) {
  const hasCustomRange = !!dateRange?.from && !!dateRange?.to;

  return (
    <Card className="p-4">
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-2 flex-wrap">
          {filterOptions.map((option, index) => {
            const Icon = option.icon;
            const isActive = quickFilter === option.value && !hasCustomRange;

            return (
              <motion.div
                key={option.value}
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
              >
                <Button
                  variant={isActive ? "default" : "outline"}
                  size="sm"
                  onClick={() => onQuickFilterChange(option.value)}
                  className="gap-2"
                  data-testid={`button-filter-${option.value}`}
                >
                  <Icon className="w-4 h-4" />
                  {option.label}
                </Button>
              </motion.div>
            );
          })}
        </div>

        <div className="h-6 w-px bg-border" />

        <DateRangePicker
          date={dateRange}
          onDateChange={onDateRangeChange}
        />

        {hasCustomRange && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onDateRangeChange(undefined)}
              className="gap-2"
              data-testid="button-clear-date-range"
            >
              <X className="w-4 h-4" />
              Limpar
            </Button>
          </motion.div>
        )}

        <div className="flex-1" />

        <div className="flex items-center gap-2">
          {onToggleComparison && (
            <Badge
              variant={showComparison ? "default" : "outline"}
              className="cursor-pointer hover-elevate active-elevate-2 px-3 py-1.5"
              onClick={onToggleComparison}
            >
              <TrendingUp className="w-3 h-3 mr-1" />
              Comparar
            </Badge>
          )}

          {onRefresh && (
            <Button
              variant="outline"
              size="icon"
              onClick={onRefresh}
              disabled={isLoading}
              data-testid="button-refresh"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? "animate-spin" : ""}`} />
            </Button>
          )}

          {onExport && (
            <Button
              variant="outline"
              size="sm"
              onClick={onExport}
              className="gap-2"
              data-testid="button-export"
            >
              <Download className="w-4 h-4" />
              Exportar
            </Button>
          )}
        </div>
      </div>
    </Card>
  );
}
