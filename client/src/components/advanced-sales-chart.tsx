import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { motion } from "framer-motion";
import { formatKwanza } from "@/lib/formatters";

interface AdvancedSalesChartProps {
  data: Array<{ date: string; sales: number; orders: number }>;
  showComparison?: boolean;
  comparisonData?: Array<{ date: string; sales: number; orders: number }>;
  title?: string;
  className?: string;
  primaryLabel?: string;
  secondaryLabel?: string;
  primaryColor?: string;
  secondaryColor?: string;
}

export function AdvancedSalesChart({
  data,
  showComparison = false,
  comparisonData,
  title = "Evolução de Vendas",
  className = "",
  primaryLabel = "Vendas",
  secondaryLabel = "Pedidos",
  primaryColor = "hsl(var(--primary))",
  secondaryColor = "hsl(var(--success))",
}: AdvancedSalesChartProps) {
  const chartData = data.map((item, index) => {
    const base = {
      date: new Date(item.date).toLocaleDateString("pt-AO", {
        day: "2-digit",
        month: "short",
      }),
      vendas: item.sales,
      pedidos: item.orders,
    };

    if (showComparison && comparisonData && comparisonData[index]) {
      return {
        ...base,
        vendasAnteriores: comparisonData[index].sales,
        pedidosAnteriores: comparisonData[index].orders,
      };
    }

    return base;
  });

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-popover border border-popover-border rounded-lg shadow-lg p-3"
        >
          <p className="text-sm font-semibold mb-2">{label}</p>
          {payload.map((entry: any, index: number) => (
            <div key={index} className="flex items-center gap-2 text-xs mb-1">
              <div
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: entry.color }}
              />
              <span className="text-muted-foreground">{entry.name}:</span>
              <span className="font-medium">
                {formatKwanza(entry.value)}
              </span>
            </div>
          ))}
        </motion.div>
      );
    }
    return null;
  };

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="text-lg font-semibold">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="colorVendas" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={primaryColor} stopOpacity={0.3} />
                <stop offset="95%" stopColor={primaryColor} stopOpacity={0} />
              </linearGradient>
              <linearGradient id="colorPedidos" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={secondaryColor} stopOpacity={0.3} />
                <stop offset="95%" stopColor={secondaryColor} stopOpacity={0} />
              </linearGradient>
              {showComparison && (
                <>
                  <linearGradient id="colorVendasAnteriores" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(var(--muted-foreground))" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="hsl(var(--muted-foreground))" stopOpacity={0} />
                  </linearGradient>
                </>
              )}
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
            <XAxis
              dataKey="date"
              stroke="hsl(var(--muted-foreground))"
              fontSize={12}
              tickLine={false}
              axisLine={false}
            />
            <YAxis
              stroke="hsl(var(--muted-foreground))"
              fontSize={12}
              tickLine={false}
              axisLine={false}
              tickFormatter={(value) => `${(value / 1000).toFixed(0)}k`}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend
              wrapperStyle={{ fontSize: "12px" }}
              iconType="circle"
            />
            
            {showComparison && (
              <Area
                type="monotone"
                dataKey="vendasAnteriores"
                name="Vendas Anteriores"
                stroke="hsl(var(--muted-foreground))"
                strokeWidth={1.5}
                strokeDasharray="5 5"
                fill="url(#colorVendasAnteriores)"
                animationDuration={1500}
              />
            )}
            
            <Area
              type="monotone"
              dataKey="vendas"
              name={primaryLabel}
              stroke={primaryColor}
              strokeWidth={2.5}
              fill="url(#colorVendas)"
              animationDuration={1500}
            />
            
            <Area
              type="monotone"
              dataKey="pedidos"
              name={secondaryLabel}
              stroke={secondaryColor}
              strokeWidth={2}
              fill="url(#colorPedidos)"
              animationDuration={1500}
            />
          </AreaChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
