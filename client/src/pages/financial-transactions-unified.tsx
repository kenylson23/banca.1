import { useState, useMemo } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Plus, Trash2, ArrowLeft, DollarSign, TrendingUp, TrendingDown, Filter, Receipt } from "lucide-react";
import { Link, useLocation } from "wouter";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { isUnauthorizedError } from "@/lib/authUtils";
import { formatKwanza } from "@/lib/formatters";
import { format, startOfWeek, endOfWeek, startOfMonth, endOfMonth, startOfYear, endOfYear } from "date-fns";
import { cn } from "@/lib/utils";
import type { FinancialTransaction, CashRegister, FinancialCategory, User } from "@shared/schema";
import { AdvancedKpiCard } from "@/components/advanced-kpi-card";
import { InteractiveKPICard } from "@/components/interactive-kpi-card";
import { AdvancedFilters, type FilterOption } from "@/components/advanced-filters";
import { ShimmerSkeleton } from "@/components/shimmer-skeleton";
import { DateRange } from "react-day-picker";
import { ScrollArea } from "@/components/ui/scroll-area";
import { PrintFinancialReport } from "@/components/PrintFinancialReport";
import { ExpensesIcon, CashRegisterIcon } from "@/components/custom-icons";

type TransactionWithDetails = FinancialTransaction & {
  cashRegister: CashRegister | null;
  category: FinancialCategory | null;
  recordedBy: User | null;
};

type FinancialSummary = {
  totalBalance: string;
  cashRegisterBalances: Array<{ id: string; name: string; balance: string }>;
  totalIncome: string;
  totalExpense: string;
  netResult: string;
};

type TransactionType = 'all' | 'receita' | 'despesa';

export default function FinancialTransactionsUnified() {
  const { toast } = useToast();
  const [location, navigate] = useLocation();
  
  // Determinar tab ativa baseada na URL ou query param
  const [activeTab, setActiveTab] = useState<TransactionType>('all');
  
  const [quickFilter, setQuickFilter] = useState<FilterOption>("today");
  const [dateRange, setDateRange] = useState<DateRange | undefined>(undefined);
  const [selectedCashRegister, setSelectedCashRegister] = useState<string>('all');
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<string>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [deleteTransactionId, setDeleteTransactionId] = useState<string | null>(null);

  // Construir parâmetros de query
  const { transactionParams, actualDateRange } = useMemo(() => {
    const params: any = {};
    const now = new Date();
    let actualStart: Date = new Date(now);
    actualStart.setHours(0, 0, 0, 0);
    let actualEnd: Date = new Date(now);
    actualEnd.setHours(23, 59, 59, 999);

    // Filtrar por tipo
    if (activeTab !== 'all') {
      params.type = activeTab;
    }

    // Filtros de data
    if (dateRange?.from) {
      actualStart = new Date(dateRange.from);
      actualStart.setHours(0, 0, 0, 0);
      params.startDate = actualStart.toISOString();
      
      if (dateRange.to) {
        actualEnd = new Date(dateRange.to);
        actualEnd.setHours(23, 59, 59, 999);
        params.endDate = actualEnd.toISOString();
      } else {
        actualEnd = new Date(dateRange.from);
        actualEnd.setHours(23, 59, 59, 999);
        params.endDate = actualEnd.toISOString();
      }
    } else {
      switch (quickFilter) {
        case 'week':
          actualStart = startOfWeek(new Date(), { weekStartsOn: 1 });
          actualEnd = endOfWeek(new Date(), { weekStartsOn: 1 });
          actualEnd.setHours(23, 59, 59, 999);
          break;
        case 'month':
          actualStart = startOfMonth(new Date());
          actualEnd = endOfMonth(new Date());
          actualEnd.setHours(23, 59, 59, 999);
          break;
        case '3months':
          actualStart = new Date();
          actualStart.setMonth(actualStart.getMonth() - 3);
          actualStart.setHours(0, 0, 0, 0);
          actualEnd.setHours(23, 59, 59, 999);
          break;
        case 'year':
          actualStart = startOfYear(new Date());
          actualEnd = endOfYear(new Date());
          actualEnd.setHours(23, 59, 59, 999);
          break;
        case 'today':
        default:
          break;
      }
      params.startDate = actualStart.toISOString();
      params.endDate = actualEnd.toISOString();
    }

    // Outros filtros
    if (selectedCashRegister !== 'all') {
      params.cashRegisterId = selectedCashRegister;
    }
    if (selectedPaymentMethod !== 'all') {
      params.paymentMethod = selectedPaymentMethod;
    }
    if (selectedCategory !== 'all') {
      params.categoryId = selectedCategory;
    }

    return { 
      transactionParams: params, 
      actualDateRange: { from: actualStart, to: actualEnd } 
    };
  }, [activeTab, quickFilter, dateRange, selectedCashRegister, selectedPaymentMethod, selectedCategory]);

  // Queries
  const { data: cashRegisters } = useQuery<CashRegister[]>({
    queryKey: ["/api/financial/cash-registers"],
  });

  const { data: categories } = useQuery<FinancialCategory[]>({
    queryKey: ["/api/financial/categories"],
  });

  const { data: transactions, isLoading: transactionsLoading } = useQuery<TransactionWithDetails[]>({
    queryKey: ["/api/financial/transactions", transactionParams],
  });

  const { data: summary } = useQuery<FinancialSummary>({
    queryKey: ["/api/financial/summary", transactionParams],
  });

  // Mutation para deletar
  const deleteTransactionMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiRequest("DELETE", `/api/financial/transactions/${id}`, undefined);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/financial/transactions"] });
      queryClient.invalidateQueries({ queryKey: ["/api/financial/cash-registers"] });
      queryClient.invalidateQueries({ queryKey: ["/api/financial/summary"] });
      toast({
        title: "Transação excluída",
        description: "A transação foi excluída e o saldo foi revertido.",
      });
      setDeleteTransactionId(null);
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Não autorizado",
          description: "Você foi desconectado. Fazendo login novamente...",
          variant: "destructive",
        });
        setTimeout(() => window.location.href = "/api/login", 500);
        return;
      }
      toast({
        title: "Erro",
        description: error.message || "Não foi possível excluir a transação.",
        variant: "destructive",
      });
    },
  });

  // Cálculos de KPIs baseados na tab ativa
  const kpiData = useMemo(() => {
    if (!transactions || !summary) {
      return {
        total: "0",
        count: 0,
        average: "0",
        trend: 0,
      };
    }

    const total = activeTab === 'all' 
      ? summary.netResult
      : activeTab === 'receita'
      ? summary.totalIncome
      : summary.totalExpense;

    const count = transactions.length;
    const average = count > 0 
      ? (parseFloat(total) / count).toFixed(2)
      : "0";

    return {
      total,
      count,
      average,
      trend: 5.2, // Mock - idealmente calcular baseado em período anterior
    };
  }, [transactions, summary, activeTab]);

  // Filtrar categorias por tipo de tab
  const filteredCategories = useMemo(() => {
    if (!categories) return [];
    if (activeTab === 'all') return categories;
    return categories.filter(c => c.type === activeTab);
  }, [categories, activeTab]);

  const sparklineData = [65, 70, 68, 75, 73, 78, 80];

  return (
    <div className="min-h-screen">
      <div className="space-y-4 p-4 sm:p-6">
        {/* Header */}
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
                <h1 className="text-2xl sm:text-3xl font-bold tracking-tight bg-gradient-to-r from-primary via-primary/80 to-primary/60 bg-clip-text text-transparent">
                  Transações Financeiras
                </h1>
                <p className="text-sm text-muted-foreground">
                  Gerencie receitas, despesas e movimentações financeiras
                </p>
              </div>
            </div>

            <div className="flex gap-3">
              <Link href="/financial/categories">
                <Button variant="outline" data-testid="button-categories">
                  <Filter className="h-4 w-4 mr-2" />
                  Categorias
                </Button>
              </Link>
              {transactions && transactions.length > 0 && summary && (
                <PrintFinancialReport
                  transactions={transactions}
                  summary={summary}
                  dateRange={actualDateRange}
                  variant="outline"
                  size="default"
                />
              )}
              <Link href="/financial/new">
                <Button data-testid="button-new-transaction">
                  <Plus className="h-4 w-4 mr-2" />
                  Nova Transação
                </Button>
              </Link>
            </div>
          </div>
        </motion.div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as TransactionType)} className="w-full">
          <TabsList className="grid w-full max-w-md grid-cols-3">
            <TabsTrigger value="all" className="gap-2">
              <DollarSign className="h-4 w-4" />
              Todas
            </TabsTrigger>
            <TabsTrigger value="receita" className="gap-2">
              <TrendingUp className="h-4 w-4" />
              Receitas
            </TabsTrigger>
            <TabsTrigger value="despesa" className="gap-2">
              <TrendingDown className="h-4 w-4" />
              Despesas
            </TabsTrigger>
          </TabsList>

          {/* KPIs */}
          <motion.div
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            {activeTab === 'all' ? (
              <>
                <InteractiveKPICard
                  title="Saldo Líquido"
                  value={formatKwanza(summary?.netResult || "0")}
                  icon={DollarSign}
                  trend={kpiData.trend}
                  sparklineData={sparklineData}
                  data-testid="kpi-net-result"
                />
                <InteractiveKPICard
                  title="Total Receitas"
                  value={formatKwanza(summary?.totalIncome || "0")}
                  icon={TrendingUp}
                  trend={7.3}
                  sparklineData={sparklineData}
                  variant="success"
                  data-testid="kpi-total-income"
                />
                <InteractiveKPICard
                  title="Total Despesas"
                  value={formatKwanza(summary?.totalExpense || "0")}
                  icon={TrendingDown}
                  trend={-3.2}
                  sparklineData={sparklineData}
                  variant="destructive"
                  data-testid="kpi-total-expense"
                />
                <InteractiveKPICard
                  title="Transações"
                  value={kpiData.count.toString()}
                  icon={Receipt}
                  subtitle={`Média: ${formatKwanza(kpiData.average)}`}
                  data-testid="kpi-count"
                />
              </>
            ) : activeTab === 'receita' ? (
              <>
                <InteractiveKPICard
                  title="Total Receitas"
                  value={formatKwanza(kpiData.total)}
                  icon={TrendingUp}
                  trend={kpiData.trend}
                  sparklineData={sparklineData}
                  variant="success"
                  data-testid="kpi-revenues"
                />
                <InteractiveKPICard
                  title="Número de Receitas"
                  value={kpiData.count.toString()}
                  icon={Receipt}
                  subtitle={`Média: ${formatKwanza(kpiData.average)}`}
                  data-testid="kpi-revenues-count"
                />
                <AdvancedKpiCard
                  title="Saldo em Caixas"
                  value={formatKwanza(summary?.totalBalance || "0")}
                  icon={CashRegisterIcon}
                  trend={2.5}
                  sparklineData={sparklineData}
                  data-testid="kpi-cash-balance"
                />
              </>
            ) : (
              <>
                <InteractiveKPICard
                  title="Total Despesas"
                  value={formatKwanza(kpiData.total)}
                  icon={TrendingDown}
                  trend={-kpiData.trend}
                  sparklineData={sparklineData}
                  variant="destructive"
                  data-testid="kpi-expenses"
                />
                <InteractiveKPICard
                  title="Número de Despesas"
                  value={kpiData.count.toString()}
                  icon={Receipt}
                  subtitle={`Média: ${formatKwanza(kpiData.average)}`}
                  data-testid="kpi-expenses-count"
                />
                <AdvancedKpiCard
                  title="Maior Categoria"
                  value={transactions && transactions.length > 0 ? transactions[0].category?.name || "N/A" : "N/A"}
                  icon={ExpensesIcon}
                  data-testid="kpi-top-category"
                />
              </>
            )}
          </motion.div>

          {/* Filtros */}
          <Card className="mt-6">
            <CardContent className="pt-6">
              <AdvancedFilters
                quickFilter={quickFilter}
                onQuickFilterChange={setQuickFilter}
                dateRange={dateRange}
                onDateRangeChange={setDateRange}
              />

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Caixa</label>
                  <Select value={selectedCashRegister} onValueChange={setSelectedCashRegister}>
                    <SelectTrigger>
                      <SelectValue placeholder="Todas as caixas" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todas as caixas</SelectItem>
                      {cashRegisters?.map((cr) => (
                        <SelectItem key={cr.id} value={cr.id}>
                          {cr.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Método de Pagamento</label>
                  <Select value={selectedPaymentMethod} onValueChange={setSelectedPaymentMethod}>
                    <SelectTrigger>
                      <SelectValue placeholder="Todos os métodos" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos os métodos</SelectItem>
                      <SelectItem value="dinheiro">Dinheiro</SelectItem>
                      <SelectItem value="multicaixa">Multicaixa</SelectItem>
                      <SelectItem value="transferencia">Transferência</SelectItem>
                      <SelectItem value="cartao">Cartão</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Categoria</label>
                  <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                    <SelectTrigger>
                      <SelectValue placeholder="Todas as categorias" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todas as categorias</SelectItem>
                      {filteredCategories.map((cat) => (
                        <SelectItem key={cat.id} value={cat.id}>
                          {cat.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Conteúdo das Tabs */}
          <TabsContent value="all" className="mt-6">
            <TransactionsList 
              transactions={transactions}
              isLoading={transactionsLoading}
              onDelete={(id) => setDeleteTransactionId(id)}
              showType={true}
            />
          </TabsContent>

          <TabsContent value="receita" className="mt-6">
            <TransactionsList 
              transactions={transactions}
              isLoading={transactionsLoading}
              onDelete={(id) => setDeleteTransactionId(id)}
              showType={false}
            />
          </TabsContent>

          <TabsContent value="despesa" className="mt-6">
            <TransactionsList 
              transactions={transactions}
              isLoading={transactionsLoading}
              onDelete={(id) => setDeleteTransactionId(id)}
              showType={false}
            />
          </TabsContent>
        </Tabs>

        {/* Delete Dialog */}
        <AlertDialog open={!!deleteTransactionId} onOpenChange={() => setDeleteTransactionId(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Excluir transação?</AlertDialogTitle>
              <AlertDialogDescription>
                Esta ação não pode ser desfeita. A transação será excluída e o saldo da caixa será revertido.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel data-testid="button-cancel-delete">Cancelar</AlertDialogCancel>
              <AlertDialogAction
                onClick={() => deleteTransactionId && deleteTransactionMutation.mutate(deleteTransactionId)}
                data-testid="button-confirm-delete"
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                {deleteTransactionMutation.isPending ? "Excluindo..." : "Excluir"}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  );
}

// Componente para lista de transações
function TransactionsList({ 
  transactions, 
  isLoading, 
  onDelete,
  showType = true
}: { 
  transactions?: TransactionWithDetails[];
  isLoading: boolean;
  onDelete: (id: string) => void;
  showType?: boolean;
}) {
  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <ShimmerSkeleton key={i} className="h-20 w-full" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!transactions || transactions.length === 0) {
    return (
      <Card>
        <CardContent className="p-12 text-center">
          <Receipt className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">Nenhuma transação encontrada</h3>
          <p className="text-sm text-muted-foreground mb-4">
            Não há transações para o período e filtros selecionados.
          </p>
          <Link href="/financial/new">
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Nova Transação
            </Button>
          </Link>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          Transações ({transactions.length})
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[600px]">
          <div className="space-y-2">
            {transactions.map((transaction) => (
              <motion.div
                key={transaction.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent/50 transition-colors"
              >
                <div className="flex items-start gap-4 flex-1">
                  <div className={cn(
                    "p-2 rounded-lg",
                    transaction.type === 'receita' ? "bg-success/10" : "bg-destructive/10"
                  )}>
                    {transaction.type === 'receita' ? (
                      <TrendingUp className="h-5 w-5 text-success" />
                    ) : (
                      <TrendingDown className="h-5 w-5 text-destructive" />
                    )}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="font-medium truncate">
                        {transaction.category?.name || 'Sem categoria'}
                      </p>
                      {showType && (
                        <Badge variant={transaction.type === 'receita' ? 'default' : 'destructive'} className="text-xs">
                          {transaction.type === 'receita' ? 'Receita' : 'Despesa'}
                        </Badge>
                      )}
                    </div>
                    
                    <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                      <span>{format(new Date(transaction.occurredAt), "dd/MM/yyyy HH:mm")}</span>
                      <span>•</span>
                      <span>{transaction.cashRegister?.name || 'N/A'}</span>
                      <span>•</span>
                      <Badge variant="outline" className="text-xs">
                        {transaction.paymentMethod}
                      </Badge>
                    </div>
                    
                    {transaction.note && (
                      <p className="text-xs text-muted-foreground mt-1 truncate">
                        {transaction.note}
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <p className={cn(
                      "text-lg font-bold",
                      transaction.type === 'receita' ? "text-success" : "text-destructive"
                    )}>
                      {transaction.type === 'receita' ? '+' : '-'}{formatKwanza(transaction.amount)}
                    </p>
                    {transaction.recordedBy && (
                      <p className="text-xs text-muted-foreground">
                        por {transaction.recordedBy.firstName || transaction.recordedBy.email}
                      </p>
                    )}
                  </div>
                  
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => onDelete(transaction.id)}
                    data-testid={`button-delete-${transaction.id}`}
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              </motion.div>
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
