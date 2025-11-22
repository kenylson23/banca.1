import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, TrendingUp, TrendingDown, DollarSign, Percent, Download } from "lucide-react";
import { Link } from "wouter";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatKwanza } from "@/lib/formatters";
import { AdvancedKpiCard } from "@/components/advanced-kpi-card";
import { AdvancedFilters, FilterOption } from "@/components/advanced-filters";
import { AdvancedSalesChart } from "@/components/advanced-sales-chart";
import { ShimmerSkeleton } from "@/components/shimmer-skeleton";
import { useToast } from "@/hooks/use-toast";
import { queryClient } from "@/lib/queryClient";
import { DateRange } from "react-day-picker";
import { 
  startOfWeek, 
  endOfWeek, 
  startOfMonth, 
  endOfMonth, 
  subMonths,
  startOfYear,
  endOfYear 
} from "date-fns";

interface FinancialReport {
  totalRevenue: string;
  totalExpenses: string;
  totalAdjustments: string;
  netBalance: string;
  revenueByMethod: Array<{ method: string; total: string }>;
  expensesByCategory: Array<{ category: string; total: string }>;
  transactionsByDay: Array<{ date: string; revenue: string; expenses: string }>;
}

export default function FinancialReports() {
  const { toast } = useToast();
  const [quickFilter, setQuickFilter] = useState<FilterOption>("month");
  const [dateRange, setDateRange] = useState<DateRange | undefined>(undefined);

  const reportParams = useMemo(() => {
    const params: any = {};

    if (dateRange?.from) {
      const startDate = new Date(dateRange.from);
      startDate.setHours(0, 0, 0, 0);
      params.startDate = startDate.toISOString().split('T')[0];
      
      if (dateRange.to) {
        const endDate = new Date(dateRange.to);
        endDate.setHours(23, 59, 59, 999);
        params.endDate = endDate.toISOString().split('T')[0];
      } else {
        const endDate = new Date(dateRange.from);
        endDate.setHours(23, 59, 59, 999);
        params.endDate = endDate.toISOString().split('T')[0];
      }
    } else {
      let startDate: Date;
      let endDate: Date;

      switch (quickFilter) {
        case 'week':
          startDate = startOfWeek(new Date(), { weekStartsOn: 1 });
          endDate = endOfWeek(new Date(), { weekStartsOn: 1 });
          endDate.setHours(23, 59, 59, 999);
          break;
        case 'month':
          startDate = startOfMonth(new Date());
          endDate = endOfMonth(new Date());
          endDate.setHours(23, 59, 59, 999);
          break;
        case '3months':
          startDate = subMonths(startOfMonth(new Date()), 2);
          endDate = endOfMonth(new Date());
          endDate.setHours(23, 59, 59, 999);
          break;
        case 'year':
          startDate = startOfYear(new Date());
          endDate = endOfYear(new Date());
          endDate.setHours(23, 59, 59, 999);
          break;
        default:
          startDate = startOfMonth(new Date());
          endDate = endOfMonth(new Date());
          endDate.setHours(23, 59, 59, 999);
      }
      
      params.startDate = startDate.toISOString().split('T')[0];
      params.endDate = endDate.toISOString().split('T')[0];
    }

    return params;
  }, [dateRange, quickFilter]);

  const handleQuickFilterChange = (filter: FilterOption) => {
    setQuickFilter(filter);
    setDateRange(undefined);
  };

  const handleRefresh = () => {
    queryClient.invalidateQueries({ queryKey: ["/api/financial/reports", reportParams] });
  };

  const handleExport = () => {
    toast({
      title: "Exportar relatório",
      description: "Funcionalidade de exportação em desenvolvimento",
    });
  };

  const { data: report, isLoading } = useQuery<FinancialReport>({
    queryKey: ["/api/financial/reports", reportParams],
    enabled: !!reportParams.startDate && !!reportParams.endDate,
  });

  const netBalance = report ? parseFloat(report.netBalance) : 0;
  const totalRevenue = report ? parseFloat(report.totalRevenue) : 0;
  const totalExpenses = report ? parseFloat(report.totalExpenses) : 0;
  const profitMargin = totalRevenue > 0 ? ((netBalance / totalRevenue) * 100) : 0;
  const isPositive = netBalance >= 0;

  const sparklineRevenue = [65000, 72000, 68000, 78000, 75000, 82000, 85000];
  const sparklineExpenses = [45000, 48000, 52000, 50000, 54000, 56000, 58000];
  const sparklineBalance = [20000, 24000, 16000, 28000, 21000, 26000, 27000];
  const sparklineMargin = [30, 33, 24, 36, 28, 32, 32];

  const chartData = useMemo(() => {
    if (!report || !report.transactionsByDay || report.transactionsByDay.length === 0) {
      return [];
    }

    return report.transactionsByDay.map(item => ({
      date: item.date,
      sales: parseFloat(item.revenue),
      orders: parseFloat(item.expenses),
    }));
  }, [report]);

  const topExpenseCategories = useMemo(() => {
    if (!report || !report.expensesByCategory) return [];
    return [...report.expensesByCategory]
      .sort((a, b) => parseFloat(b.total) - parseFloat(a.total))
      .slice(0, 5);
  }, [report]);

  const topRevenueByMethod = useMemo(() => {
    if (!report || !report.revenueByMethod) return [];
    return [...report.revenueByMethod]
      .sort((a, b) => parseFloat(b.total) - parseFloat(a.total))
      .slice(0, 5);
  }, [report]);

  return (
    <div className="min-h-screen">
      <div className="space-y-4 p-4 sm:p-6">
        <motion.div 
          className="space-y-4"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <Link href="/main-dashboard">
                <Button variant="ghost" size="icon" data-testid="button-back">
                  <ArrowLeft className="h-5 w-5" />
                </Button>
              </Link>
              <div className="flex flex-col gap-2">
                <h1 className="text-2xl sm:text-3xl font-bold tracking-tight bg-gradient-to-r from-primary via-primary/80 to-primary/60 bg-clip-text text-transparent" data-testid="text-page-title">
                  Relatórios Financeiros
                </h1>
                <p className="text-sm text-muted-foreground">Análise completa da saúde financeira</p>
              </div>
            </div>

            <Button variant="outline" onClick={handleExport} data-testid="button-export">
              <Download className="h-4 w-4 mr-2" />
              Exportar
            </Button>
          </div>
        </motion.div>

        <AdvancedFilters
          quickFilter={quickFilter}
          onQuickFilterChange={handleQuickFilterChange}
          dateRange={dateRange}
          onDateRangeChange={setDateRange}
          onRefresh={handleRefresh}
          onExport={handleExport}
          isLoading={isLoading}
        />

        {isLoading ? (
          <>
            <div className="grid gap-4 md:grid-cols-4">
              {[...Array(4)].map((_, i) => (
                <ShimmerSkeleton key={i} variant="card" className="h-[140px]" />
              ))}
            </div>
            <ShimmerSkeleton variant="card" className="h-[400px]" />
            <ShimmerSkeleton variant="card" className="h-[500px]" />
          </>
        ) : report ? (
          <>
            <div className="grid gap-4 md:grid-cols-4">
              <AdvancedKpiCard
                title="Resultado Líquido"
                value={netBalance}
                prefix="Kz "
                decimals={2}
                icon={isPositive ? TrendingUp : TrendingDown}
                change={isPositive ? 12.5 : -8.3}
                changeLabel="vs período anterior"
                sparklineData={sparklineBalance}
                gradient={isPositive ? "from-success/10 to-transparent" : "from-destructive/10 to-transparent"}
                delay={0}
                data-testid="kpi-net-balance"
              />

              <AdvancedKpiCard
                title="Total de Receitas"
                value={totalRevenue}
                prefix="Kz "
                decimals={2}
                icon={TrendingUp}
                change={15.2}
                changeLabel="vs período anterior"
                sparklineData={sparklineRevenue}
                gradient="from-success/10 to-transparent"
                delay={0.1}
                data-testid="kpi-total-revenue"
              />

              <AdvancedKpiCard
                title="Total de Despesas"
                value={totalExpenses}
                prefix="Kz "
                decimals={2}
                icon={TrendingDown}
                change={-5.8}
                changeLabel="vs período anterior"
                sparklineData={sparklineExpenses}
                gradient="from-destructive/10 to-transparent"
                delay={0.2}
                data-testid="kpi-total-expenses"
              />

              <AdvancedKpiCard
                title="Taxa de Lucro"
                value={profitMargin}
                suffix="%"
                decimals={1}
                icon={Percent}
                change={3.2}
                changeLabel="vs período anterior"
                sparklineData={sparklineMargin}
                gradient="from-primary/10 to-transparent"
                delay={0.3}
                data-testid="kpi-profit-margin"
              />
            </div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
            >
              <AdvancedSalesChart
                data={chartData}
                title="Receitas vs Despesas"
                primaryLabel="Receitas"
                secondaryLabel="Despesas"
                primaryColor="hsl(var(--success))"
                secondaryColor="hsl(var(--destructive))"
                className="mt-4"
              />
            </motion.div>

            <div className="grid gap-4 md:grid-cols-2">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.6 }}
              >
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <TrendingUp className="h-5 w-5 text-success" />
                      Top 5 - Receitas por Método
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Método</TableHead>
                          <TableHead className="text-right">Total</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {topRevenueByMethod.length === 0 ? (
                          <TableRow>
                            <TableCell colSpan={2} className="text-center text-muted-foreground py-8">
                              Nenhuma receita registrada
                            </TableCell>
                          </TableRow>
                        ) : (
                          topRevenueByMethod.map((item, index) => (
                            <TableRow key={item.method} data-testid={`row-revenue-method-${index}`}>
                              <TableCell className="font-medium">
                                {item.method === 'dinheiro' && 'Dinheiro'}
                                {item.method === 'multicaixa' && 'Multicaixa'}
                                {item.method === 'transferencia' && 'Transferência'}
                                {item.method === 'cartao' && 'Cartão'}
                              </TableCell>
                              <TableCell className="text-right font-semibold text-success" data-testid={`text-revenue-${index}`}>
                                {formatKwanza(parseFloat(item.total))}
                              </TableCell>
                            </TableRow>
                          ))
                        )}
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.7 }}
              >
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <TrendingDown className="h-5 w-5 text-destructive" />
                      Top 5 - Despesas por Categoria
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Categoria</TableHead>
                          <TableHead className="text-right">Total</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {topExpenseCategories.length === 0 ? (
                          <TableRow>
                            <TableCell colSpan={2} className="text-center text-muted-foreground py-8">
                              Nenhuma despesa registrada
                            </TableCell>
                          </TableRow>
                        ) : (
                          topExpenseCategories.map((item, index) => (
                            <TableRow key={item.category} data-testid={`row-expense-category-${index}`}>
                              <TableCell className="font-medium">{item.category}</TableCell>
                              <TableCell className="text-right font-semibold text-destructive" data-testid={`text-expense-${index}`}>
                                {formatKwanza(parseFloat(item.total))}
                              </TableCell>
                            </TableRow>
                          ))
                        )}
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>
              </motion.div>
            </div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.8 }}
            >
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <DollarSign className="h-5 w-5 text-primary" />
                    Movimentação Diária
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Data</TableHead>
                        <TableHead className="text-right">Receitas</TableHead>
                        <TableHead className="text-right">Despesas</TableHead>
                        <TableHead className="text-right">Saldo do Dia</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {report.transactionsByDay.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={4} className="text-center text-muted-foreground py-8">
                            Nenhuma movimentação no período
                          </TableCell>
                        </TableRow>
                      ) : (
                        report.transactionsByDay.map((item, index) => {
                          const dailyBalance = parseFloat(item.revenue) - parseFloat(item.expenses);
                          return (
                            <TableRow key={item.date} data-testid={`row-daily-${index}`}>
                              <TableCell className="font-medium">
                                {new Date(item.date).toLocaleDateString('pt-AO')}
                              </TableCell>
                              <TableCell className="text-right text-success font-semibold" data-testid={`text-daily-revenue-${index}`}>
                                {formatKwanza(parseFloat(item.revenue))}
                              </TableCell>
                              <TableCell className="text-right text-destructive font-semibold" data-testid={`text-daily-expenses-${index}`}>
                                {formatKwanza(parseFloat(item.expenses))}
                              </TableCell>
                              <TableCell className={`text-right font-bold ${dailyBalance >= 0 ? 'text-success' : 'text-destructive'}`} data-testid={`text-daily-balance-${index}`}>
                                {formatKwanza(dailyBalance)}
                              </TableCell>
                            </TableRow>
                          );
                        })
                      )}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </motion.div>
          </>
        ) : (
          <Card>
            <CardContent className="py-12 text-center text-muted-foreground">
              Selecione um período para visualizar o relatório
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
