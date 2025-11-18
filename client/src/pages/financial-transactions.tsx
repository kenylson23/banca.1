import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Plus, Trash2, DollarSign, TrendingUp, TrendingDown, Wallet, Calendar as CalendarIcon, Filter, Settings, Clock } from "lucide-react";
import { Link } from "wouter";
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
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { isUnauthorizedError } from "@/lib/authUtils";
import { formatKwanza } from "@/lib/formatters";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import type { FinancialTransaction, CashRegister, FinancialCategory, User } from "@shared/schema";

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

export default function FinancialTransactions() {
  const { toast } = useToast();
  const [dateFilter, setDateFilter] = useState('today');
  const [customDateRange, setCustomDateRange] = useState<{
    from: Date | undefined;
    to: Date | undefined;
  }>({ from: undefined, to: undefined });
  const [isPopoverOpen, setIsPopoverOpen] = useState(false);
  const [selectedCashRegister, setSelectedCashRegister] = useState<string>('all');
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<string>('all');
  const [deleteTransactionId, setDeleteTransactionId] = useState<string | null>(null);

  const transactionParams: any = {};

  if (dateFilter === 'today') {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    transactionParams.startDate = today.toISOString();
    const endOfDay = new Date();
    endOfDay.setHours(23, 59, 59, 999);
    transactionParams.endDate = endOfDay.toISOString();
  } else if (dateFilter === 'custom' && customDateRange.from) {
    transactionParams.startDate = customDateRange.from.toISOString();
    if (customDateRange.to) {
      transactionParams.endDate = customDateRange.to.toISOString();
    }
  }

  if (selectedCashRegister !== 'all') {
    transactionParams.cashRegisterId = selectedCashRegister;
  }

  if (selectedPaymentMethod !== 'all') {
    transactionParams.paymentMethod = selectedPaymentMethod;
  }

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

  return (
      <div className="p-4 sm:p-6 max-w-7xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex gap-3">
            <Link href="/financial/shifts">
              <Button variant="outline" data-testid="button-cash-shifts">
                <Clock className="h-4 w-4 mr-2" />
                Turnos de Caixa
              </Button>
            </Link>
            <Link href="/financial/cash-registers">
              <Button variant="outline" data-testid="button-cash-registers">
                <Settings className="h-4 w-4 mr-2" />
                Caixas
              </Button>
            </Link>
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

        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Wallet className="h-4 w-4" />
                Saldo Total
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold" data-testid="text-total-balance">
                {summary ? formatKwanza(summary.totalBalance) : "AOA 0,00"}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-green-600" />
                Receitas do Período
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600" data-testid="text-total-income">
                {summary ? formatKwanza(summary.totalIncome) : "AOA 0,00"}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <TrendingDown className="h-4 w-4 text-destructive" />
                Despesas do Período
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-destructive" data-testid="text-total-expense">
                {summary ? formatKwanza(summary.totalExpense) : "AOA 0,00"}
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="h-5 w-5" />
              Resultado Líquido do Período
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div
              className={cn(
                "text-3xl font-bold",
                summary && parseFloat(summary.netResult) >= 0 ? "text-green-600" : "text-destructive"
              )}
              data-testid="text-net-result"
            >
              {summary ? formatKwanza(summary.netResult) : "AOA 0,00"}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-3">
                <div className="space-y-2">
                  <Label>Período</Label>
                  <Tabs value={dateFilter} onValueChange={setDateFilter} className="w-full">
                    <TabsList className="grid w-full grid-cols-2">
                      <TabsTrigger value="today" data-testid="filter-date-today">Hoje</TabsTrigger>
                      <TabsTrigger value="custom" data-testid="filter-date-custom">Custom</TabsTrigger>
                    </TabsList>
                  </Tabs>
                  {dateFilter === 'custom' && (
                    <Popover open={isPopoverOpen} onOpenChange={setIsPopoverOpen}>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className={cn(
                            'w-full justify-start text-left font-normal',
                            !customDateRange.from && 'text-muted-foreground'
                          )}
                          data-testid="button-custom-date-range"
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {customDateRange.from ? (
                            customDateRange.to ? (
                              <>
                                {format(customDateRange.from, 'dd/MM/yy')} -{' '}
                                {format(customDateRange.to, 'dd/MM/yy')}
                              </>
                            ) : (
                              format(customDateRange.from, 'dd/MM/yyyy')
                            )
                          ) : (
                            'Selecionar período'
                          )}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="range"
                          selected={{ from: customDateRange.from, to: customDateRange.to }}
                          onSelect={(range) => {
                            setCustomDateRange({
                              from: range?.from,
                              to: range?.to,
                            });
                            if (range?.from && range?.to) {
                              setIsPopoverOpen(false);
                            }
                          }}
                          numberOfMonths={2}
                        />
                      </PopoverContent>
                    </Popover>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="cashRegister">Caixa</Label>
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
                  <Label htmlFor="paymentMethod">Método</Label>
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
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Lançamentos</CardTitle>
          </CardHeader>
          <CardContent>
            {transactionsLoading ? (
              <div className="space-y-3">
                <Skeleton className="h-20 w-full" />
                <Skeleton className="h-20 w-full" />
                <Skeleton className="h-20 w-full" />
              </div>
            ) : transactions && transactions.length > 0 ? (
              <div className="space-y-3">
                {transactions.map((transaction) => (
                  <div
                    key={transaction.id}
                    className="flex items-center justify-between p-4 border rounded-lg hover-elevate"
                    data-testid={`transaction-${transaction.id}`}
                  >
                    <div className="flex-1 space-y-1">
                      <div className="flex items-center gap-3">
                        <Badge
                          variant={transaction.type === 'receita' ? 'default' : 'destructive'}
                          data-testid={`badge-type-${transaction.id}`}
                        >
                          {transaction.type === 'receita' ? 'Receita' : 'Despesa'}
                        </Badge>
                        <p className="font-medium">{transaction.category?.name || 'Sem categoria'}</p>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span>{format(new Date(transaction.occurredAt), 'dd/MM/yyyy HH:mm')}</span>
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
                        <p className="text-sm text-muted-foreground">{transaction.note}</p>
                      )}
                    </div>
                    <div className="flex items-center gap-3">
                      <div
                        className={cn(
                          "text-xl font-bold",
                          transaction.type === 'receita' ? "text-green-600" : "text-destructive"
                        )}
                        data-testid={`text-amount-${transaction.id}`}
                      >
                        {transaction.type === 'receita' ? '+' : '-'} {formatKwanza(transaction.amount)}
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        data-testid={`button-delete-${transaction.id}`}
                        onClick={() => setDeleteTransactionId(transaction.id)}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center text-muted-foreground py-8">
                Nenhum lançamento encontrado para o período selecionado
              </p>
            )}
          </CardContent>
        </Card>

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
