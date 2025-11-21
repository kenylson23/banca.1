import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface HeatmapCell {
  day: string;
  hour: number;
  value: number;
}

interface SalesHeatmapProps {
  data: HeatmapCell[];
  title?: string;
  className?: string;
}

export function SalesHeatmap({
  data,
  title = "Mapa de Calor - Vendas por Hora",
  className = "",
}: SalesHeatmapProps) {
  const days = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];
  const hours = Array.from({ length: 24 }, (_, i) => i);

  const maxValue = Math.max(...data.map((d) => d.value), 1);

  const getCellData = (day: string, hour: number) => {
    return data.find((d) => d.day === day && d.hour === hour);
  };

  const getIntensity = (value: number) => {
    return value / maxValue;
  };

  const getColor = (intensity: number) => {
    if (intensity === 0) return "bg-muted/30";
    if (intensity < 0.2) return "bg-primary/20";
    if (intensity < 0.4) return "bg-primary/40";
    if (intensity < 0.6) return "bg-primary/60";
    if (intensity < 0.8) return "bg-primary/80";
    return "bg-primary";
  };

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="text-lg font-semibold">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <div className="min-w-[600px]">
            <div className="grid grid-cols-[auto_repeat(24,1fr)] gap-1">
              <div className="h-6" />
              {hours.map((hour) => (
                <div
                  key={hour}
                  className="text-xs text-center text-muted-foreground font-medium h-6 flex items-center justify-center"
                >
                  {hour}h
                </div>
              ))}

              {days.flatMap((day, dayIndex) => [
                <div
                  key={`label-${day}`}
                  className="text-xs text-muted-foreground font-medium pr-2 flex items-center justify-end h-8"
                >
                  {day}
                </div>,
                ...hours.map((hour, hourIndex) => {
                  const cellData = getCellData(day, hour);
                  const value = cellData?.value || 0;
                  const intensity = getIntensity(value);

                  return (
                    <motion.div
                      key={`${day}-${hour}`}
                      initial={{ opacity: 0, scale: 0 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{
                        duration: 0.2,
                        delay: (dayIndex * 24 + hourIndex) * 0.003,
                      }}
                      className="group relative"
                    >
                      <div
                        className={cn(
                          "h-8 rounded-sm cursor-pointer transition-all duration-200",
                          "hover:ring-2 hover:ring-primary hover:scale-110 hover:z-10",
                          getColor(intensity)
                        )}
                        title={`${day} ${hour}:00 - ${value} vendas`}
                      />
                      
                      <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block z-20">
                        <div className="bg-popover border border-popover-border rounded-lg shadow-lg p-2 text-xs whitespace-nowrap">
                          <div className="font-semibold">{day} {hour}:00</div>
                          <div className="text-muted-foreground">{value} vendas</div>
                        </div>
                      </div>
                    </motion.div>
                  );
                })
              ])}
            </div>

            <div className="flex items-center justify-end gap-2 mt-4">
              <span className="text-xs text-muted-foreground">Menos</span>
              <div className="flex gap-1">
                {[0, 0.2, 0.4, 0.6, 0.8, 1].map((intensity, idx) => (
                  <div
                    key={idx}
                    className={cn("w-4 h-4 rounded-sm", getColor(intensity))}
                  />
                ))}
              </div>
              <span className="text-xs text-muted-foreground">Mais</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
