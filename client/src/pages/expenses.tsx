import { useState, useMemo } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ArrowLeft, Plus, Edit2, Trash2, Receipt, TrendingDown, Hash, Tag } from "lucide-react";
import { Link } from "wouter";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { AdvancedKpiCard } from "@/components/advanced-kpi-card";
import { AdvancedFilters, type FilterOption } from "@/components/advanced-filters";
import { ShimmerSkeleton } from "@/components/shimmer-skeleton";
import { format, startOfWeek, endOfWeek, startOfMonth, endOfMonth, startOfYear, endOfYear } from "date-fns";
import { DateRange } from "react-day-picker";
import { cn } from "@/lib/utils";
import type { FinancialTransaction, FinancialCategory, User, CashRegister } from "@shared/schema";

interface ExpenseWithDetails extends FinancialTransaction {
  category: FinancialCategory | null;
  recordedBy: User | null;
  cashRegister: CashRegister | null;
}

function formatKwanza(value: string | number): string {
  const numValue = typeof value === 'string' ? parseFloat(value) : value;
  return new Intl.NumberFormat('pt-AO', {
    style: 'currency',
    currency: 'AOA',
    minimumFractionDigits: 2,
  }).format(numValue).replace('AOA', 'Kz');
}

export default function ExpensesPage() {
  const { toast } = useToast();
  const [newExpenseDialog, setNewExpenseDialog] = useState(false);
  const [editExpenseDialog, setEditExpenseDialog] = useState(false);
  const [deleteExpenseDialog, setDeleteExpenseDialog] = useState(false);
  const [selectedExpense, setSelectedExpense] = useState<ExpenseWithDetails | null>(null);
  const [quickFilter, setQuickFilter] = useState<FilterOption>("today");
  const [dateRange, setDateRange] = useState<DateRange | undefined>(undefined);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  
  const [expenseForm, setExpenseForm] = useState({
    categoryId: "",
    description: "",
    amount: "0.00",
    paymentMethod: "dinheiro" as "dinheiro" | "multicaixa" | "transferencia" | "cartao",
    occurredAt: new Date().toISOString().slice(0, 16),
    note: "",
  });

  const expenseParams = useMemo(() => {
    const params: any = { type: 'despesa' };

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

    if (selectedCategory !== 'all') {
      params.categoryId = selectedCategory;
    }

    return params;
  }, [dateRange, quickFilter, selectedCategory]);

  const handleQuickFilterChange = (filter: FilterOption) => {
    setQuickFilter(filter);
    setDateRange(undefined);
  };

  const handleRefresh = () => {
    queryClient.invalidateQueries({ queryKey: ["/api/financial/transactions", expenseParams] });
  };

  const handleExport = () => {
    toast({
      title: "Exportar dados",
      description: "Funcionalidade de exportação em desenvolvimento",
    });
  };

  const { data: expenses, isLoading: expensesLoading } = useQuery<ExpenseWithDetails[]>({
    queryKey: ["/api/financial/transactions", expenseParams],
  });

  const { data: categories } = useQuery<FinancialCategory[]>({
    queryKey: ["/api/financial/categories?type=despesa"],
  });

  const expenseCategories = categories?.filter(c => c.type === 'despesa') || [];

  const createExpenseMutation = useMutation({
    mutationFn: async (data: typeof expenseForm) => {
      await apiRequest("POST", "/api/financial/transactions", {
        ...data,
        type: 'despesa'
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/financial/transactions"] });
      queryClient.invalidateQueries({ queryKey: ["/api/financial/summary"] });
      toast({ title: "Despesa criada com sucesso" });
      setNewExpenseDialog(false);
      setExpenseForm({
        categoryId: "",
        description: "",
        amount: "0.00",
        paymentMethod: "dinheiro",
        occurredAt: new Date().toISOString().slice(0, 16),
        note: "",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Erro ao criar despesa",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const updateExpenseMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<typeof expenseForm> }) => {
      await apiRequest("PUT", `/api/financial/transactions/${id}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/financial/transactions"] });
      queryClient.invalidateQueries({ queryKey: ["/api/financial/summary"] });
      toast({ title: "Despesa atualizada com sucesso" });
      setEditExpenseDialog(false);
      setSelectedExpense(null);
    },
    onError: (error: any) => {
      toast({
        title: "Erro ao atualizar despesa",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const deleteExpenseMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiRequest("DELETE", `/api/financial/transactions/${id}`, undefined);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/financial/transactions"] });
      queryClient.invalidateQueries({ queryKey: ["/api/financial/summary"] });
      toast({ title: "Despesa excluída com sucesso" });
      setDeleteExpenseDialog(false);
      setSelectedExpense(null);
    },
    onError: (error: any) => {
      toast({
        title: "Erro ao excluir despesa",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const totalExpenses = expenses?.reduce((sum, exp) => sum + parseFloat(exp.amount), 0) || 0;
  const expenseCount = expenses?.length || 0;
  const averageExpense = expenseCount > 0 ? totalExpenses / expenseCount : 0;

  const topCategory = useMemo(() => {
    if (!expenses || expenses.length === 0) return null;
    
    const categoryTotals = expenses.reduce((acc, exp) => {
      const categoryName = exp.category?.name || 'Sem categoria';
      acc[categoryName] = (acc[categoryName] || 0) + parseFloat(exp.amount);
      return acc;
    }, {} as Record<string, number>);

    const topCat = Object.entries(categoryTotals).sort((a, b) => b[1] - a[1])[0];
    return topCat ? { name: topCat[0], amount: topCat[1] } : null;
  }, [expenses]);

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
                <h1 className="text-4xl sm:text-5xl font-bold tracking-tight bg-gradient-to-r from-primary via-primary/80 to-primary/60 bg-clip-text text-transparent" data-testid="text-page-title">
                  Despesas
                </h1>
                <p className="text-base text-muted-foreground">Gerencie as despesas do restaurante</p>
              </div>
            </div>
            <div className="flex gap-3">
              <Link href="/main-dashboard">
                <Button variant="outline" data-testid="button-return">
                  Voltar
                </Button>
              </Link>
              <Button 
                onClick={() => setNewExpenseDialog(true)}
                data-testid="button-new-expense"
              >
                <Plus className="h-4 w-4 mr-2" />
                Nova Despesa
              </Button>
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
            title="Total de Despesas"
            value={totalExpenses}
            prefix="Kz "
            decimals={2}
            icon={TrendingDown}
            sparklineData={sparklineData.map(v => -v)}
            change={-5.3}
            changeLabel="vs. período anterior"
            data-testid="kpi-total-expenses"
          />
          <AdvancedKpiCard
            title="Quantidade de Despesas"
            value={expenseCount}
            decimals={0}
            icon={Hash}
            sparklineData={sparklineData}
            change={8.2}
            changeLabel="vs. período anterior"
            data-testid="kpi-expense-count"
          />
          <AdvancedKpiCard
            title="Média por Despesa"
            value={averageExpense}
            prefix="Kz "
            decimals={2}
            icon={Receipt}
            sparklineData={sparklineData}
            change={-2.1}
            changeLabel="vs. período anterior"
            data-testid="kpi-average-expense"
          />
          <AdvancedKpiCard
            title={topCategory ? topCategory.name : "Categoria Top"}
            value={topCategory ? topCategory.amount : 0}
            prefix="Kz "
            decimals={2}
            icon={Tag}
            sparklineData={sparklineData}
            change={topCategory ? 12.5 : 0}
            changeLabel="categoria com mais gasto"
            data-testid="kpi-top-category"
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
            isLoading={expensesLoading}
          />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.25 }}
        >
          <Card>
            <CardContent className="p-4">
              <div className="space-y-2">
                <Label htmlFor="categoryFilter">Filtrar por Categoria</Label>
                <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                  <SelectTrigger data-testid="select-category-filter">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all" data-testid="option-all-categories">Todas as categorias</SelectItem>
                    {expenseCategories.map((category) => (
                      <SelectItem key={category.id} value={category.id} data-testid={`option-category-${category.id}`}>
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
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
                <Receipt className="w-5 h-5 text-primary" />
                Despesas Recentes
              </CardTitle>
            </CardHeader>
            <CardContent>
              {expensesLoading ? (
                <div className="space-y-3">
                  <ShimmerSkeleton className="h-24 w-full rounded-lg" />
                  <ShimmerSkeleton className="h-24 w-full rounded-lg" />
                  <ShimmerSkeleton className="h-24 w-full rounded-lg" />
                </div>
              ) : !expenses || expenses.length === 0 ? (
                <div className="text-center py-12">
                  <Receipt className="w-12 h-12 mx-auto text-muted-foreground/50 mb-4" />
                  <p className="text-muted-foreground">Nenhuma despesa registrada</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    As despesas aparecerão aqui conforme forem registradas
                  </p>
                </div>
              ) : (
                <ScrollArea className="h-[600px] pr-4">
                  <div className="space-y-3">
                    {expenses.map((expense, index) => (
                      <motion.div
                        key={expense.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.3, delay: index * 0.05 }}
                        className="group"
                        data-testid={`expense-item-${expense.id}`}
                      >
                        <Card className="hover-elevate active-elevate-2 transition-all duration-200">
                          <CardContent className="p-4">
                            <div className="flex items-start gap-4">
                              <div className="relative flex-shrink-0">
                                <div className="w-12 h-12 rounded-full bg-destructive/10 flex items-center justify-center">
                                  <Receipt className="w-6 h-6 text-destructive" />
                                </div>
                              </div>

                              <div className="flex-1 min-w-0 space-y-2">
                                <div className="flex items-start justify-between gap-2">
                                  <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 flex-wrap mb-1">
                                      <Badge variant="outline" className="text-xs">
                                        {expense.category?.name || 'Sem categoria'}
                                      </Badge>
                                      <Badge variant="secondary" className="text-xs">
                                        {expense.paymentMethod === 'dinheiro' && 'Dinheiro'}
                                        {expense.paymentMethod === 'multicaixa' && 'Multicaixa'}
                                        {expense.paymentMethod === 'transferencia' && 'Transferência'}
                                        {expense.paymentMethod === 'cartao' && 'Cartão'}
                                      </Badge>
                                    </div>
                                    <p className="font-medium text-sm line-clamp-1">
                                      {expense.description || 'Sem descrição'}
                                    </p>
                                  </div>

                                  <div className="flex items-center gap-2 flex-shrink-0">
                                    <span className="text-lg font-bold text-destructive whitespace-nowrap">
                                      {formatKwanza(expense.amount)}
                                    </span>
                                  </div>
                                </div>

                                <div className="flex items-center justify-between gap-2 text-xs text-muted-foreground">
                                  <div className="flex items-center gap-3 flex-wrap">
                                    <span className="flex items-center gap-1">
                                      {format(new Date(expense.occurredAt), "dd/MM/yyyy 'às' HH:mm")}
                                    </span>
                                    {expense.recordedBy && (
                                      <span className="flex items-center gap-1">
                                        Registrado por {expense.recordedBy.firstName || expense.recordedBy.email}
                                      </span>
                                    )}
                                  </div>

                                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      className="h-8 w-8"
                                      onClick={() => {
                                        setSelectedExpense(expense);
                                        setExpenseForm({
                                          categoryId: expense.categoryId,
                                          description: expense.description || "",
                                          amount: expense.amount,
                                          paymentMethod: expense.paymentMethod,
                                          occurredAt: new Date(expense.occurredAt).toISOString().slice(0, 16),
                                          note: expense.note || "",
                                        });
                                        setEditExpenseDialog(true);
                                      }}
                                      data-testid={`button-edit-${expense.id}`}
                                    >
                                      <Edit2 className="h-4 w-4" />
                                    </Button>
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      className="h-8 w-8 text-destructive hover:text-destructive"
                                      onClick={() => {
                                        setSelectedExpense(expense);
                                        setDeleteExpenseDialog(true);
                                      }}
                                      data-testid={`button-delete-${expense.id}`}
                                    >
                                      <Trash2 className="h-4 w-4" />
                                    </Button>
                                  </div>
                                </div>

                                {expense.note && (
                                  <p className="text-xs text-muted-foreground italic line-clamp-2">
                                    {expense.note}
                                  </p>
                                )}
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      </motion.div>
                    ))}
                  </div>
                </ScrollArea>
              )}
            </CardContent>
          </Card>
        </motion.div>

      <Dialog open={newExpenseDialog} onOpenChange={setNewExpenseDialog}>
        <DialogContent data-testid="dialog-new-expense">
          <DialogHeader>
            <DialogTitle>Nova Despesa</DialogTitle>
            <DialogDescription>Registre uma nova despesa</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="category">Categoria</Label>
              <Select
                value={expenseForm.categoryId}
                onValueChange={(value) => setExpenseForm({ ...expenseForm, categoryId: value })}
              >
                <SelectTrigger data-testid="select-category">
                  <SelectValue placeholder="Selecione a categoria" />
                </SelectTrigger>
                <SelectContent>
                  {expenseCategories.map((cat) => (
                    <SelectItem key={cat.id} value={cat.id}>
                      {cat.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="description">Descrição</Label>
              <Input
                id="description"
                value={expenseForm.description}
                onChange={(e) => setExpenseForm({ ...expenseForm, description: e.target.value })}
                placeholder="Ex: Compra de ingredientes"
                data-testid="input-description"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="amount">Valor</Label>
              <Input
                id="amount"
                type="number"
                step="0.01"
                value={expenseForm.amount}
                onChange={(e) => setExpenseForm({ ...expenseForm, amount: e.target.value })}
                data-testid="input-amount"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="paymentMethod">Método de Pagamento</Label>
              <Select
                value={expenseForm.paymentMethod}
                onValueChange={(value: any) => setExpenseForm({ ...expenseForm, paymentMethod: value })}
              >
                <SelectTrigger data-testid="select-payment-method">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="dinheiro">Dinheiro</SelectItem>
                  <SelectItem value="multicaixa">Multicaixa</SelectItem>
                  <SelectItem value="transferencia">Transferência</SelectItem>
                  <SelectItem value="cartao">Cartão</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="occurredAt">Data e Hora</Label>
              <Input
                id="occurredAt"
                type="datetime-local"
                value={expenseForm.occurredAt}
                onChange={(e) => setExpenseForm({ ...expenseForm, occurredAt: e.target.value })}
                data-testid="input-occurred-at"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="note">Observações (opcional)</Label>
              <Textarea
                id="note"
                value={expenseForm.note}
                onChange={(e) => setExpenseForm({ ...expenseForm, note: e.target.value })}
                placeholder="Adicione observações sobre a despesa"
                data-testid="input-note"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setNewExpenseDialog(false)}
              data-testid="button-cancel"
            >
              Cancelar
            </Button>
            <Button
              onClick={() => createExpenseMutation.mutate(expenseForm)}
              disabled={createExpenseMutation.isPending}
              data-testid="button-save"
            >
              {createExpenseMutation.isPending ? "Salvando..." : "Salvar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={editExpenseDialog} onOpenChange={setEditExpenseDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar Despesa</DialogTitle>
            <DialogDescription>Atualize as informações da despesa</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="edit-category">Categoria</Label>
              <Select
                value={expenseForm.categoryId}
                onValueChange={(value) => setExpenseForm({ ...expenseForm, categoryId: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {expenseCategories.map((cat) => (
                    <SelectItem key={cat.id} value={cat.id}>
                      {cat.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-description">Descrição</Label>
              <Input
                id="edit-description"
                value={expenseForm.description}
                onChange={(e) => setExpenseForm({ ...expenseForm, description: e.target.value })}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-amount">Valor</Label>
              <Input
                id="edit-amount"
                type="number"
                step="0.01"
                value={expenseForm.amount}
                onChange={(e) => setExpenseForm({ ...expenseForm, amount: e.target.value })}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-paymentMethod">Método de Pagamento</Label>
              <Select
                value={expenseForm.paymentMethod}
                onValueChange={(value: any) => setExpenseForm({ ...expenseForm, paymentMethod: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="dinheiro">Dinheiro</SelectItem>
                  <SelectItem value="multicaixa">Multicaixa</SelectItem>
                  <SelectItem value="transferencia">Transferência</SelectItem>
                  <SelectItem value="cartao">Cartão</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-occurredAt">Data e Hora</Label>
              <Input
                id="edit-occurredAt"
                type="datetime-local"
                value={expenseForm.occurredAt}
                onChange={(e) => setExpenseForm({ ...expenseForm, occurredAt: e.target.value })}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-note">Observações</Label>
              <Textarea
                id="edit-note"
                value={expenseForm.note}
                onChange={(e) => setExpenseForm({ ...expenseForm, note: e.target.value })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setEditExpenseDialog(false)}
            >
              Cancelar
            </Button>
            <Button
              onClick={() => {
                if (selectedExpense) {
                  updateExpenseMutation.mutate({
                    id: selectedExpense.id,
                    data: expenseForm,
                  });
                }
              }}
              disabled={updateExpenseMutation.isPending}
            >
              {updateExpenseMutation.isPending ? "Atualizando..." : "Atualizar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={deleteExpenseDialog} onOpenChange={setDeleteExpenseDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Excluir Despesa</DialogTitle>
            <DialogDescription>
              Tem certeza que deseja excluir esta despesa? Esta ação não pode ser desfeita.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDeleteExpenseDialog(false)}
            >
              Cancelar
            </Button>
            <Button
              variant="destructive"
              onClick={() => {
                if (selectedExpense) {
                  deleteExpenseMutation.mutate(selectedExpense.id);
                }
              }}
              disabled={deleteExpenseMutation.isPending}
            >
              {deleteExpenseMutation.isPending ? "Excluindo..." : "Excluir"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      </div>
    </div>
  );
}
