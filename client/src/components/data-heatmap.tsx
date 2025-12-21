import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface HeatmapData {
  day: string;
  hour: string;
  value: number;
}

interface DataHeatmapProps {
  title: string;
  data: HeatmapData[];
  colorScale?: { min: string; mid: string; max: string };
  maxValue?: number;
  isLoading?: boolean;
  className?: string;
}

const HOURS = ["6h", "8h", "10h", "12h", "14h", "16h", "18h", "20h", "22h"];
const DAYS = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];

export function DataHeatmap({
  title,
  data,
  colorScale = {
    min: "rgb(254, 243, 199)", // amber-100
    mid: "rgb(251, 191, 36)", // amber-400
    max: "rgb(217, 119, 6)", // amber-600
  },
  maxValue,
  isLoading = false,
  className,
}: DataHeatmapProps) {
  
  const max = maxValue || Math.max(...data.map(d => d.value));

  const getColor = (value: number) => {
    if (value === 0) return "rgb(250, 250, 250)"; // gray-50
    
    const intensity = value / max;
    
    if (intensity < 0.33) {
      return colorScale.min;
    } else if (intensity < 0.66) {
      return colorScale.mid;
    } else {
      return colorScale.max;
    }
  };

  const getValue = (day: string, hour: string) => {
    const item = data.find(d => d.day === day && d.hour === hour);
    return item?.value || 0;
  };

  if (isLoading) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="text-lg font-semibold">{title}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse">
            <div className="grid grid-cols-10 gap-2">
              {Array.from({ length: 70 }).map((_, i) => (
                <div key={i} className="h-10 bg-muted rounded" />
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Card className={cn("overflow-hidden", className)}>
        <CardHeader className="pb-4">
          <CardTitle className="text-lg font-semibold">{title}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <div className="min-w-[600px]">
              {/* Grid */}
              <div className="grid grid-cols-[80px_repeat(9,1fr)] gap-2">
                {/* Empty top-left corner */}
                <div />
                
                {/* Hour headers */}
                {HOURS.map((hour) => (
                  <div
                    key={hour}
                    className="text-xs font-medium text-muted-foreground text-center pb-2"
                  >
                    {hour}
                  </div>
                ))}

                {/* Days and cells */}
                {DAYS.map((day, dayIdx) => (
                  <>
                    {/* Day label */}
                    <div
                      key={`label-${day}`}
                      className="text-xs font-medium text-muted-foreground flex items-center pr-2"
                    >
                      {day}
                    </div>

                    {/* Hour cells */}
                    {HOURS.map((hour, hourIdx) => {
                      const value = getValue(day, hour);
                      const delay = (dayIdx * HOURS.length + hourIdx) * 0.01;

                      return (
                        <motion.div
                          key={`${day}-${hour}`}
                          initial={{ scale: 0, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          transition={{ delay, duration: 0.2 }}
                          whileHover={{ scale: 1.1, zIndex: 10 }}
                          className="group relative"
                        >
                          <div
                            className="h-10 rounded-md transition-all duration-200 cursor-pointer border border-border/20"
                            style={{
                              backgroundColor: getColor(value),
                            }}
                          />
                          
                          {/* Tooltip */}
                          {value > 0 && (
                            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-background/95 backdrop-blur-sm border border-border rounded shadow-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-20">
                              <p className="text-xs font-medium">
                                {day}, {hour}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                {value} pedidos
                              </p>
                            </div>
                          )}
                        </motion.div>
                      );
                    })}
                  </>
                ))}
              </div>

              {/* Legend */}
              <div className="flex items-center justify-center gap-4 mt-6">
                <span className="text-xs text-muted-foreground">Baixo</span>
                <div className="flex gap-1">
                  {[0.2, 0.4, 0.6, 0.8, 1.0].map((intensity, idx) => (
                    <div
                      key={idx}
                      className="h-4 w-8 rounded"
                      style={{
                        backgroundColor: getColor(max * intensity),
                      }}
                    />
                  ))}
                </div>
                <span className="text-xs text-muted-foreground">Alto</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
