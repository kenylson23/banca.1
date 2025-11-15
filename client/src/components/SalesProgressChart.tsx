import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { format } from "date-fns";

interface SalesProgressChartProps {
  salesByDay: Array<{ date: string; sales: number; orders: number; pdv: number; web: number }>;
}

export function SalesProgressChart({ salesByDay }: SalesProgressChartProps) {
  const [filterType, setFilterType] = useState<'all' | 'pdv' | 'web'>('all');

  const chartData = salesByDay.map(day => {
    let vendas = day.sales;
    if (filterType === 'pdv') {
      vendas = day.pdv;
    } else if (filterType === 'web') {
      vendas = day.web;
    }
    return {
      date: day.date,
      vendas: Math.round(vendas * 100) / 100,
    };
  });

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <CardTitle>Progresso de vendas</CardTitle>
          <Tabs value={filterType} onValueChange={(value) => setFilterType(value as 'all' | 'pdv' | 'web')}>
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="all" data-testid="filter-sales-all">Todos</TabsTrigger>
              <TabsTrigger value="pdv" data-testid="filter-sales-pdv">PDV</TabsTrigger>
              <TabsTrigger value="web" data-testid="filter-sales-web">WEB</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis 
              dataKey="date" 
              tickFormatter={(date) => {
                try {
                  return format(new Date(date), 'dd/MM');
                } catch {
                  return date;
                }
              }} 
              tick={{fontSize: 12}} 
            />
            <YAxis tick={{fontSize: 12}} />
            <Tooltip 
              labelFormatter={(date) => {
                try {
                  return format(new Date(date), 'dd/MM/yyyy');
                } catch {
                  return date;
                }
              }}
              formatter={(value: any) => [`Kz ${Number(value).toFixed(2)}`, 'Vendas']}
            />
            <Legend wrapperStyle={{fontSize: '12px'}} />
            <Line type="monotone" dataKey="vendas" stroke="#0ea5e9" name="Vendas" strokeWidth={2} />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
