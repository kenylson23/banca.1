import { motion } from "framer-motion";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  BarChart,
  Bar,
  LineChart,
  Line,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface ModernChartProps {
  title: string;
  data: any[];
  type?: "area" | "bar" | "line";
  dataKeys: { key: string; color: string; label: string }[];
  xAxisKey: string;
  height?: number;
  showLegend?: boolean;
  showGrid?: boolean;
  isLoading?: boolean;
  className?: string;
}

export function ModernChart({
  title,
  data,
  type = "area",
  dataKeys,
  xAxisKey,
  height = 300,
  showLegend = true,
  showGrid = true,
  isLoading = false,
  className,
}: ModernChartProps) {
  
  if (isLoading) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="text-lg font-semibold">{title}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-4" style={{ height }}>
            <div className="h-full bg-muted rounded" />
          </div>
        </CardContent>
      </Card>
    );
  }

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-background/95 backdrop-blur-sm border border-border rounded-lg shadow-xl p-3"
        >
          <p className="text-sm font-medium mb-2">{label}</p>
          {payload.map((entry: any, index: number) => (
            <div key={index} className="flex items-center gap-2 text-sm">
              <div
                className="h-2 w-2 rounded-full"
                style={{ backgroundColor: entry.color }}
              />
              <span className="text-muted-foreground">{entry.name}:</span>
              <span className="font-semibold">{entry.value}</span>
            </div>
          ))}
        </motion.div>
      );
    }
    return null;
  };

  const renderChart = () => {
    const commonProps = {
      data,
      margin: { top: 10, right: 10, left: 0, bottom: 0 },
    };

    const gridProps = showGrid
      ? {
          stroke: "currentColor",
          strokeDasharray: "3 3",
          className: "text-border/30",
        }
      : undefined;

    switch (type) {
      case "area":
        return (
          <AreaChart {...commonProps}>
            {showGrid && <CartesianGrid {...gridProps} />}
            <XAxis
              dataKey={xAxisKey}
              tick={{ fill: "currentColor", fontSize: 12 }}
              tickLine={false}
              axisLine={{ stroke: "currentColor", className: "text-border" }}
              className="text-muted-foreground"
            />
            <YAxis
              tick={{ fill: "currentColor", fontSize: 12 }}
              tickLine={false}
              axisLine={{ stroke: "currentColor", className: "text-border" }}
              className="text-muted-foreground"
            />
            <Tooltip content={<CustomTooltip />} />
            {showLegend && (
              <Legend
                wrapperStyle={{ paddingTop: "20px" }}
                iconType="circle"
                formatter={(value) => (
                  <span className="text-sm text-muted-foreground">{value}</span>
                )}
              />
            )}
            {dataKeys.map((item, idx) => (
              <defs key={`gradient-${idx}`}>
                <linearGradient
                  id={`gradient-${item.key}`}
                  x1="0"
                  y1="0"
                  x2="0"
                  y2="1"
                >
                  <stop offset="5%" stopColor={item.color} stopOpacity={0.3} />
                  <stop offset="95%" stopColor={item.color} stopOpacity={0.05} />
                </linearGradient>
              </defs>
            ))}
            {dataKeys.map((item, idx) => (
              <Area
                key={idx}
                type="monotone"
                dataKey={item.key}
                name={item.label}
                stroke={item.color}
                strokeWidth={2}
                fill={`url(#gradient-${item.key})`}
                animationDuration={1000}
                animationBegin={idx * 100}
              />
            ))}
          </AreaChart>
        );

      case "bar":
        return (
          <BarChart {...commonProps}>
            {showGrid && <CartesianGrid {...gridProps} />}
            <XAxis
              dataKey={xAxisKey}
              tick={{ fill: "currentColor", fontSize: 12 }}
              tickLine={false}
              axisLine={{ stroke: "currentColor", className: "text-border" }}
              className="text-muted-foreground"
            />
            <YAxis
              tick={{ fill: "currentColor", fontSize: 12 }}
              tickLine={false}
              axisLine={{ stroke: "currentColor", className: "text-border" }}
              className="text-muted-foreground"
            />
            <Tooltip content={<CustomTooltip />} />
            {showLegend && (
              <Legend
                wrapperStyle={{ paddingTop: "20px" }}
                iconType="circle"
                formatter={(value) => (
                  <span className="text-sm text-muted-foreground">{value}</span>
                )}
              />
            )}
            {dataKeys.map((item, idx) => (
              <Bar
                key={idx}
                dataKey={item.key}
                name={item.label}
                fill={item.color}
                radius={[8, 8, 0, 0]}
                animationDuration={1000}
                animationBegin={idx * 100}
              />
            ))}
          </BarChart>
        );

      case "line":
        return (
          <LineChart {...commonProps}>
            {showGrid && <CartesianGrid {...gridProps} />}
            <XAxis
              dataKey={xAxisKey}
              tick={{ fill: "currentColor", fontSize: 12 }}
              tickLine={false}
              axisLine={{ stroke: "currentColor", className: "text-border" }}
              className="text-muted-foreground"
            />
            <YAxis
              tick={{ fill: "currentColor", fontSize: 12 }}
              tickLine={false}
              axisLine={{ stroke: "currentColor", className: "text-border" }}
              className="text-muted-foreground"
            />
            <Tooltip content={<CustomTooltip />} />
            {showLegend && (
              <Legend
                wrapperStyle={{ paddingTop: "20px" }}
                iconType="circle"
                formatter={(value) => (
                  <span className="text-sm text-muted-foreground">{value}</span>
                )}
              />
            )}
            {dataKeys.map((item, idx) => (
              <Line
                key={idx}
                type="monotone"
                dataKey={item.key}
                name={item.label}
                stroke={item.color}
                strokeWidth={2}
                dot={{ fill: item.color, r: 4 }}
                activeDot={{ r: 6 }}
                animationDuration={1000}
                animationBegin={idx * 100}
              />
            ))}
          </LineChart>
        );
    }
  };

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
          <ResponsiveContainer width="100%" height={height}>
            {renderChart()}
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </motion.div>
  );
}
