import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft, TrendingUp, TrendingDown, DollarSign, Calendar, Download } from "lucide-react";
import { Link } from "wouter";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

function formatKwanza(value: string | number): string {
  const numValue = typeof value === 'string' ? parseFloat(value) : value;
  return new Intl.NumberFormat('pt-AO', {
    style: 'currency',
    currency: 'AOA',
    minimumFractionDigits: 2,
  }).format(numValue).replace('AOA', 'Kz');
}

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
  const today = new Date();
  const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
  
  const [startDate, setStartDate] = useState(firstDayOfMonth.toISOString().split('T')[0]);
  const [endDate, setEndDate] = useState(today.toISOString().split('T')[0]);

  const { data: report, isLoading } = useQuery<FinancialReport>({
    queryKey: ["/api/financial/reports", { startDate, endDate }],
    enabled: !!startDate && !!endDate,
  });

  const netBalance = report ? parseFloat(report.netBalance) : 0;
  const isPositive = netBalance >= 0;

  return (
    <div className="min-h-screen">
      <div className="space-y-6 p-4 sm:p-6 lg:p-8">
        <motion.div
          className="flex flex-wrap items-center justify-between gap-4"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="flex items-center gap-4">
            <Link href="/main-dashboard">
              <Button variant="ghost" size="icon" data-testid="button-back">
                <ArrowLeft className="h-5 w-5" />
              </Button>
            </Link>
            <div>
              <h1 className="text-4xl sm:text-5xl font-bold tracking-tight bg-gradient-to-r from-primary via-primary/80 to-primary/60 bg-clip-text text-transparent" data-testid="text-page-title">
                Relatórios Financeiros
              </h1>
              <p className="text-base text-muted-foreground mt-1">Análise completa da saúde financeira</p>
            </div>
          </div>
        </motion.div>

      <Card>
        <CardHeader>
          <CardTitle>Período do Relatório</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="grid gap-2">
              <Label htmlFor="startDate">Data Inicial</Label>
              <Input
                id="startDate"
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                data-testid="input-start-date"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="endDate">Data Final</Label>
              <Input
                id="endDate"
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                data-testid="input-end-date"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {isLoading ? (
        <Card>
          <CardContent className="py-8 text-center text-muted-foreground">
            Carregando relatório...
          </CardContent>
        </Card>
      ) : report ? (
        <>
          <div className="grid gap-4 md:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Receitas</CardTitle>
                <TrendingUp className="h-4 w-4 text-green-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600" data-testid="text-total-revenue">
                  {formatKwanza(report.totalRevenue)}
                </div>
                <p className="text-xs text-muted-foreground">Total de receitas</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Despesas</CardTitle>
                <TrendingDown className="h-4 w-4 text-red-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-600" data-testid="text-total-expenses">
                  {formatKwanza(report.totalExpenses)}
                </div>
                <p className="text-xs text-muted-foreground">Total de despesas</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Ajustes</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold" data-testid="text-total-adjustments">
                  {formatKwanza(report.totalAdjustments)}
                </div>
                <p className="text-xs text-muted-foreground">Ajustes de caixa</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Saldo Líquido</CardTitle>
                <Calendar className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className={`text-2xl font-bold ${isPositive ? 'text-green-600' : 'text-red-600'}`} data-testid="text-net-balance">
                  {formatKwanza(report.netBalance)}
                </div>
                <p className="text-xs text-muted-foreground">
                  {isPositive ? 'Lucro' : 'Prejuízo'} no período
                </p>
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Receitas por Método de Pagamento</CardTitle>
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
                    {report.revenueByMethod.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={2} className="text-center text-muted-foreground">
                          Nenhuma receita registrada
                        </TableCell>
                      </TableRow>
                    ) : (
                      report.revenueByMethod.map((item) => (
                        <TableRow key={item.method}>
                          <TableCell className="font-medium">
                            {item.method === 'dinheiro' && 'Dinheiro'}
                            {item.method === 'multicaixa' && 'Multicaixa'}
                            {item.method === 'transferencia' && 'Transferência'}
                            {item.method === 'cartao' && 'Cartão'}
                          </TableCell>
                          <TableCell className="text-right">{formatKwanza(item.total)}</TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Despesas por Categoria</CardTitle>
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
                    {report.expensesByCategory.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={2} className="text-center text-muted-foreground">
                          Nenhuma despesa registrada
                        </TableCell>
                      </TableRow>
                    ) : (
                      report.expensesByCategory.map((item) => (
                        <TableRow key={item.category}>
                          <TableCell className="font-medium">{item.category}</TableCell>
                          <TableCell className="text-right">{formatKwanza(item.total)}</TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Movimentação Diária</CardTitle>
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
                      <TableCell colSpan={4} className="text-center text-muted-foreground">
                        Nenhuma movimentação no período
                      </TableCell>
                    </TableRow>
                  ) : (
                    report.transactionsByDay.map((item) => {
                      const dailyBalance = parseFloat(item.revenue) - parseFloat(item.expenses);
                      return (
                        <TableRow key={item.date}>
                          <TableCell className="font-medium">
                            {new Date(item.date).toLocaleDateString('pt-AO')}
                          </TableCell>
                          <TableCell className="text-right text-green-600">
                            {formatKwanza(item.revenue)}
                          </TableCell>
                          <TableCell className="text-right text-red-600">
                            {formatKwanza(item.expenses)}
                          </TableCell>
                          <TableCell className={`text-right font-medium ${dailyBalance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
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
        </>
      ) : (
        <Card>
          <CardContent className="py-8 text-center text-muted-foreground">
            Selecione um período para visualizar o relatório
          </CardContent>
        </Card>
      )}
      </div>
    </div>
  );
}
