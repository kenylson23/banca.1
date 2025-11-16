import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ArrowLeft, Plus, Edit2, Trash2, Receipt, Calendar, DollarSign } from "lucide-react";
import { Link } from "wouter";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
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
  
  const [expenseForm, setExpenseForm] = useState({
    categoryId: "",
    description: "",
    amount: "0.00",
    paymentMethod: "dinheiro" as "dinheiro" | "multicaixa" | "transferencia" | "cartao",
    occurredAt: new Date().toISOString().slice(0, 16),
    note: "",
  });

  const { data: expenses } = useQuery<ExpenseWithDetails[]>({
    queryKey: ["/api/financial/transactions", { type: 'despesa' }],
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

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Link href="/main-dashboard">
            <Button variant="ghost" size="icon" data-testid="button-back">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold" data-testid="text-page-title">Despesas</h1>
            <p className="text-muted-foreground">Gerencie as despesas do restaurante</p>
          </div>
        </div>
        <Button 
          onClick={() => setNewExpenseDialog(true)}
          data-testid="button-new-expense"
        >
          <Plus className="h-4 w-4 mr-2" />
          Nova Despesa
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Despesas</CardTitle>
            <Receipt className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" data-testid="text-total-expenses">
              {formatKwanza(totalExpenses)}
            </div>
            <p className="text-xs text-muted-foreground">Todas as despesas registradas</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Despesas do Mês</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatKwanza(
                expenses?.filter(e => {
                  const expenseDate = new Date(e.occurredAt);
                  const now = new Date();
                  return expenseDate.getMonth() === now.getMonth() && 
                         expenseDate.getFullYear() === now.getFullYear();
                }).reduce((sum, e) => sum + parseFloat(e.amount), 0) || 0
              )}
            </div>
            <p className="text-xs text-muted-foreground">Despesas do mês atual</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Registros</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" data-testid="text-expense-count">
              {expenses?.length || 0}
            </div>
            <p className="text-xs text-muted-foreground">Despesas registradas</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Lista de Despesas</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Data</TableHead>
                <TableHead>Descrição</TableHead>
                <TableHead>Categoria</TableHead>
                <TableHead>Método de Pagamento</TableHead>
                <TableHead className="text-right">Valor</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {expenses?.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center text-muted-foreground">
                    Nenhuma despesa registrada
                  </TableCell>
                </TableRow>
              ) : (
                expenses?.map((expense) => (
                  <TableRow key={expense.id} data-testid={`row-expense-${expense.id}`}>
                    <TableCell>
                      {new Date(expense.occurredAt).toLocaleDateString('pt-AO')}
                    </TableCell>
                    <TableCell className="font-medium">{expense.description || 'Sem descrição'}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{expense.category?.name || 'Sem categoria'}</Badge>
                    </TableCell>
                    <TableCell>
                      <Badge>
                        {expense.paymentMethod === 'dinheiro' && 'Dinheiro'}
                        {expense.paymentMethod === 'multicaixa' && 'Multicaixa'}
                        {expense.paymentMethod === 'transferencia' && 'Transferência'}
                        {expense.paymentMethod === 'cartao' && 'Cartão'}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right font-medium">
                      {formatKwanza(expense.amount)}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
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
                          onClick={() => {
                            setSelectedExpense(expense);
                            setDeleteExpenseDialog(true);
                          }}
                          data-testid={`button-delete-${expense.id}`}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

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
  );
}
