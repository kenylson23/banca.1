import { useState, useMemo } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Plus, Trash2, ArrowLeft, DollarSign, TrendingUp, TrendingDown, Wallet, Filter, Clock } from "lucide-react";
import { Link } from "wouter";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import { Label } from "@/components/ui/label";
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
import { AdvancedFilters } from "@/components/advanced-filters";
import { ShimmerSkeleton } from "@/components/shimmer-skeleton";
import { DateRange } from "react-day-picker";
import { ScrollArea } from "@/components/ui/scroll-area";

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

type FilterOption = "today" | "week" | "month" | "year";

export default function FinancialTransactions() {
  const { toast } = useToast();
  const [quickFilter, setQuickFilter] = useState<FilterOption>("today");
  const [dateRange, setDateRange] = useState<DateRange | undefined>(undefined);
  const [selectedCashRegister, setSelectedCashRegister] = useState<string>('all');
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<string>('all');
  const [deleteTransactionId, setDeleteTransactionId] = useState<string | null>(null);

  const transactionParams = useMemo(() => {
    const params: any = {};

    if (dateRange?.from) {
      const startDate = new Date(dateRange.from);
      startDate.setHours(0, 0, 0, 0);
      params.startDate = startDate.toISOString();
      
      if (dateRange.to) {
        const endDate = new Date(dateRange.to);
        endDate.setHours(23, 59, 59, 999);
        params.endDate = endDate.toISOString();
      } else {
        const endDate = new Date(dateRange.from);
        endDate.setHours(23, 59, 59, 999);
        params.endDate = endDate.toISOString();
      }
    } else {
      let startDate: Date;
      let endDate: Date;

      switch (quickFilter) {
        case 'today':
          startDate = new Date();
          startDate.setHours(0, 0, 0, 0);
          endDate = new Date();
          endDate.setHours(23, 59, 59, 999);
          break;
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
        case 'year':
          startDate = startOfYear(new Date());
          endDate = endOfYear(new Date());
          endDate.setHours(23, 59, 59, 999);
          break;
      }
      
      params.startDate = startDate.toISOString();
      params.endDate = endDate.toISOString();
    }

    if (selectedCashRegister !== 'all') {
      params.cashRegisterId = selectedCashRegister;
    }

    if (selectedPaymentMethod !== 'all') {
      params.paymentMethod = selectedPaymentMethod;
    }

    return params;
  }, [dateRange, quickFilter, selectedCashRegister, selectedPaymentMethod]);

  const handleQuickFilterChange = (filter: FilterOption) => {
    setQuickFilter(filter);
    setDateRange(undefined);
  };

  const handleRefresh = () => {
    queryClient.invalidateQueries({ queryKey: ["/api/financial/transactions", transactionParams] });
    queryClient.invalidateQueries({ queryKey: ["/api/financial/summary", transactionParams] });
  };

  const handleExport = () => {
    toast({
      title: "Exportar dados",
      description: "Funcionalidade de exportação em desenvolvimento",
    });
  };

  const { data: cashRegisters } = useQuery<CashRegister[]>({
    queryKey: ["/api/financial/cash-registers"],
  });

  const { data: transactions, isLoading: transactionsLoading } = useQuery<TransactionWithDetails[]>({
    queryKey: ["/api/financial/transactions", transactionParams],
  });

  const { data: summary } = useQuery<FinancialSummary>({
    queryKey: ["/api/financial/summary", transactionParams],
  });

  const deleteTransactionMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiRequest("DELETE", `/api/financial/transactions/${id}`, undefined);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/financial/transactions"] });
      queryClient.invalidateQueries({ queryKey: ["/api/financial/cash-registers"] });
      queryClient.invalidateQueries({ queryKey: ["/api/financial/summary"] });
      toast({
        title: "Lançamento excluído",
        description: "O lançamento foi excluído e o saldo foi revertido.",
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
        description: error.message || "Não foi possível excluir o lançamento.",
        variant: "destructive",
      });
    },
  });

  const sparklineData = [65, 70, 68, 75, 73, 78, 80];

  return (
    <div className="min-h-screen">
      <div className="space-y-6 p-4 sm:p-6 lg:p-8">
        <motion.div 
          className="space-y-4"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <Link href="/main-dashboard">
                <Button variant="ghost" size="icon" data-testid="button-back">
                  <ArrowLeft className="h-5 w-5" />
                </Button>
              </Link>
              <div className="flex flex-col gap-2">
                <h1 className="text-4xl sm:text-5xl font-bold tracking-tight bg-gradient-to-r from-primary via-primary/80 to-primary/60 bg-clip-text text-transparent">
                  Lançamentos Financeiros
                </h1>
                <p className="text-base text-muted-foreground">
                  Acompanhe e gerencie as movimentações financeiras
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
              <Link href="/financial/new">
                <Button data-testid="button-new-transaction">
                  <Plus className="h-4 w-4 mr-2" />
                  Novo Lançamento
                </Button>
              </Link>
            </div>
          </div>
        </motion.div>

        <motion.div 
          className="grid gap-4 md:grid-cols-2 lg:grid-cols-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <AdvancedKpiCard
            title="Saldo Total"
            value={summary ? parseFloat(summary.totalBalance) : 0}
            prefix="Kz "
            decimals={2}
            icon={Wallet}
            sparklineData={sparklineData}
            change={8.2}
            changeLabel="vs. último período"
          />
          <AdvancedKpiCard
            title="Receitas"
            value={summary ? parseFloat(summary.totalIncome) : 0}
            prefix="Kz "
            decimals={2}
            icon={TrendingUp}
            sparklineData={sparklineData}
            change={12.5}
            changeLabel="vs. último período"
          />
          <AdvancedKpiCard
            title="Despesas"
            value={summary ? parseFloat(summary.totalExpense) : 0}
            prefix="Kz "
            decimals={2}
            icon={TrendingDown}
            sparklineData={sparklineData.map(v => -v)}
            change={-5.3}
            changeLabel="vs. último período"
          />
          <AdvancedKpiCard
            title="Resultado Líquido"
            value={summary ? parseFloat(summary.netResult) : 0}
            prefix="Kz "
            decimals={2}
            icon={DollarSign}
            sparklineData={sparklineData}
            change={summary && parseFloat(summary.netResult) >= 0 ? 15.8 : -8.4}
            changeLabel="vs. último período"
          />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <AdvancedFilters
            quickFilter={quickFilter}
            onQuickFilterChange={handleQuickFilterChange}
            dateRange={dateRange}
            onDateRangeChange={setDateRange}
            onRefresh={handleRefresh}
            onExport={handleExport}
            isLoading={transactionsLoading}
          />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.25 }}
        >
          <Card>
            <CardContent className="p-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="cashRegister">Caixa Registradora</Label>
                  <Select value={selectedCashRegister} onValueChange={setSelectedCashRegister}>
                    <SelectTrigger data-testid="select-cash-register">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all" data-testid="option-all-registers">Todas as caixas</SelectItem>
                      {cashRegisters?.map((register) => (
                        <SelectItem key={register.id} value={register.id} data-testid={`option-register-${register.id}`}>
                          {register.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="paymentMethod">Método de Pagamento</Label>
                  <Select value={selectedPaymentMethod} onValueChange={setSelectedPaymentMethod}>
                    <SelectTrigger data-testid="select-payment-method">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all" data-testid="option-all-methods">Todos os métodos</SelectItem>
                      <SelectItem value="dinheiro" data-testid="option-dinheiro">Dinheiro</SelectItem>
                      <SelectItem value="multicaixa" data-testid="option-multicaixa">Multicaixa</SelectItem>
                      <SelectItem value="transferencia" data-testid="option-transferencia">Transferência</SelectItem>
                      <SelectItem value="cartao" data-testid="option-cartao">Cartão</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg font-semibold flex items-center gap-2">
                <Clock className="w-5 h-5 text-primary" />
                Lançamentos Recentes
              </CardTitle>
            </CardHeader>
            <CardContent>
              {transactionsLoading ? (
                <div className="space-y-3">
                  <ShimmerSkeleton className="h-24 w-full rounded-lg" />
                  <ShimmerSkeleton className="h-24 w-full rounded-lg" />
                  <ShimmerSkeleton className="h-24 w-full rounded-lg" />
                  <ShimmerSkeleton className="h-24 w-full rounded-lg" />
                </div>
              ) : transactions && transactions.length > 0 ? (
                <ScrollArea className="pr-4" style={{ maxHeight: "600px" }}>
                  <div className="space-y-3">
                    {transactions.map((transaction, index) => {
                      const isIncome = transaction.type === 'receita';
                      const statusColor = isIncome ? "text-success" : "text-destructive";

                      return (
                        <motion.div
                          key={transaction.id}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: 20 }}
                          transition={{ duration: 0.3, delay: index * 0.05 }}
                          className="flex gap-3 p-4 rounded-lg hover-elevate active-elevate-2 border border-border/50"
                          data-testid={`transaction-${transaction.id}`}
                        >
                          <div
                            className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${
                              isIncome ? "bg-success/10" : "bg-destructive/10"
                            }`}
                          >
                            {isIncome ? (
                              <TrendingUp className={`w-5 h-5 ${statusColor}`} />
                            ) : (
                              <TrendingDown className={`w-5 h-5 ${statusColor}`} />
                            )}
                          </div>

                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-2 mb-1">
                              <div className="flex items-center gap-2 flex-wrap">
                                <Badge
                                  variant={isIncome ? "default" : "destructive"}
                                  className={`text-xs ${
                                    isIncome
                                      ? "bg-success/10 text-success border-success/20"
                                      : "bg-destructive/10 text-destructive border-destructive/20"
                                  }`}
                                  data-testid={`badge-type-${transaction.id}`}
                                >
                                  {isIncome ? "Receita" : "Despesa"}
                                </Badge>
                                <p className="text-sm font-medium truncate">
                                  {transaction.category?.name || "Sem categoria"}
                                </p>
                              </div>
                              <div
                                className={cn(
                                  "text-lg font-bold whitespace-nowrap",
                                  isIncome ? "text-green-600 dark:text-green-500" : "text-destructive"
                                )}
                                data-testid={`text-amount-${transaction.id}`}
                              >
                                {isIncome ? "+" : "-"} {formatKwanza(transaction.amount)}
                              </div>
                            </div>

                            <div className="flex items-center gap-3 text-xs text-muted-foreground flex-wrap mb-1">
                              <span>{format(new Date(transaction.occurredAt), "dd/MM/yyyy HH:mm")}</span>
                              {transaction.cashRegister && (
                                <>
                                  <span>•</span>
                                  <span>{transaction.cashRegister.name}</span>
                                </>
                              )}
                              <span>•</span>
                              <span className="capitalize">{transaction.paymentMethod}</span>
                              {transaction.recordedBy && (
                                <>
                                  <span>•</span>
                                  <span>{transaction.recordedBy.firstName || transaction.recordedBy.email}</span>
                                </>
                              )}
                            </div>

                            {transaction.note && (
                              <p className="text-xs text-muted-foreground line-clamp-2 mt-1">
                                {transaction.note}
                              </p>
                            )}
                          </div>

                          <div className="flex-shrink-0">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="hover:bg-destructive/10"
                              data-testid={`button-delete-${transaction.id}`}
                              onClick={() => setDeleteTransactionId(transaction.id)}
                            >
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                          </div>
                        </motion.div>
                      );
                    })}
                  </div>
                </ScrollArea>
              ) : (
                <div className="text-center py-12 text-muted-foreground text-sm">
                  <DollarSign className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p>Nenhum lançamento encontrado para o período selecionado</p>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>

      <AlertDialog
        open={deleteTransactionId !== null}
        onOpenChange={(open) => !open && setDeleteTransactionId(null)}
      >
        <AlertDialogContent data-testid="dialog-delete-transaction">
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir lançamento?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta ação irá remover o lançamento e reverter o saldo da caixa registradora. Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel data-testid="button-cancel-delete">Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteTransactionId && deleteTransactionMutation.mutate(deleteTransactionId)}
              data-testid="button-confirm-delete"
            >
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
