import { useState, useMemo } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Plus, Trash2, DollarSign, TrendingUp, TrendingDown, Lock, ArrowUpCircle, Receipt, Tag, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { buildApiUrl } from "@/lib/api-url";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { isUnauthorizedError } from "@/lib/authUtils";
import type { FinancialCategory } from "@shared/schema";
import { motion } from "framer-motion";

interface CategoryFormData {
  type: 'receita' | 'despesa';
  name: string;
  description?: string;
}

export default function FinancialCategories() {
  const { toast } = useToast();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [deleteCategoryId, setDeleteCategoryId] = useState<string | null>(null);
  const [categoryForm, setCategoryForm] = useState<CategoryFormData>({
    type: 'despesa',
    name: "",
    description: "",
  });

  // Check subscription to see if expense tracking is available
  const { data: subscription } = useQuery<any>({
    queryKey: ['/api/subscription'],
    retry: false,
  });

  const { data: categories, isLoading } = useQuery<FinancialCategory[]>({
    queryKey: ["/api/financial/categories"],
  });

  // Check if expense tracking feature is available in the plan
  const hasExpenseTracking = useMemo(() => {
    if (!subscription?.plan) return false;
    return subscription.plan.hasExpenseTracking === 1;
  }, [subscription]);

  const createCategoryMutation = useMutation({
    mutationFn: async (data: CategoryFormData) => {
      await apiRequest("POST", "/api/financial/categories", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/financial/categories"] });
      toast({
        title: "Categoria criada",
        description: "A categoria foi criada com sucesso.",
      });
      setIsDialogOpen(false);
      setCategoryForm({ type: 'despesa', name: "", description: "" });
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Não autorizado",
          description: "Você foi desconectado. Fazendo login novamente...",
          variant: "destructive",
        });
        setTimeout(() => window.location.href = buildApiUrl("/api/login"), 500);
        return;
      }
      toast({
        title: "Erro",
        description: error.message || "Não foi possível criar a categoria.",
        variant: "destructive",
      });
    },
  });

  const deleteCategoryMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiRequest("DELETE", `/api/financial/categories/${id}`, undefined);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/financial/categories"] });
      toast({
        title: "Categoria excluída",
        description: "A categoria foi excluída com sucesso.",
      });
      setDeleteCategoryId(null);
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Não autorizado",
          description: "Você foi desconectado. Fazendo login novamente...",
          variant: "destructive",
        });
        setTimeout(() => window.location.href = buildApiUrl("/api/login"), 500);
        return;
      }
      toast({
        title: "Erro",
        description: error.message || "Não foi possível excluir a categoria. Ela pode estar sendo usada em lançamentos.",
        variant: "destructive",
      });
    },
  });

  const handleCreateCategory = () => {
    if (!categoryForm.name.trim()) {
      toast({
        title: "Erro de validação",
        description: "O nome da categoria é obrigatório.",
        variant: "destructive",
      });
      return;
    }

    createCategoryMutation.mutate(categoryForm);
  };

  const expenseCategories = categories?.filter(c => c.type === 'despesa') || [];
  const incomeCategories = categories?.filter(c => c.type === 'receita') || [];

  // If expense tracking is not available in the plan, show blocked screen
  if (subscription && !hasExpenseTracking) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
        <div className="p-4 sm:p-6">
          <motion.div
            className="flex flex-col items-center justify-center min-h-[60vh] gap-6"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
          >
            <div className="flex items-center justify-center w-20 h-20 rounded-full bg-orange-500/10">
              <Lock className="h-10 w-10 text-orange-500" />
            </div>
            <div className="text-center space-y-2 max-w-md">
              <h2 className="text-2xl font-bold">Funcionalidade Bloqueada</h2>
              <p className="text-muted-foreground">
                A gestão de despesas não está disponível no plano <span className="font-semibold">{subscription.plan?.name}</span>.
              </p>
              <p className="text-sm text-muted-foreground">
                Faça upgrade para o plano <span className="font-semibold text-primary">Profissional</span> ou superior para organizar suas despesas e ter controle completo das finanças.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-3 mt-4">
              <Button
                size="lg"
                onClick={() => window.location.href = '/subscription'}
                className="gap-2"
              >
                <ArrowUpCircle className="h-5 w-5" />
                Fazer Upgrade
              </Button>
              <Button
                size="lg"
                variant="outline"
                onClick={() => window.history.back()}
              >
                Voltar
              </Button>
            </div>
            <Card className="mt-8 max-w-2xl">
              <CardHeader>
                <CardTitle className="text-lg">O que você ganha com o upgrade:</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-start gap-3">
                  <Receipt className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium">Gestão Completa de Despesas</p>
                    <p className="text-sm text-muted-foreground">Registre e organize todas as despesas do seu negócio</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Tag className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium">Categorias Personalizadas</p>
                    <p className="text-sm text-muted-foreground">Crie até 50 categorias para organizar receitas e despesas</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <TrendingUp className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium">Relatórios Financeiros Detalhados</p>
                    <p className="text-sm text-muted-foreground">Acompanhe lucros, despesas e margem de ganho em tempo real</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Sparkles className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium">Controle de Fluxo de Caixa</p>
                    <p className="text-sm text-muted-foreground">Tenha visão completa da saúde financeira do seu restaurante</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-4 sm:p-6">
      <div className="max-w-6xl mx-auto space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Categorias Financeiras</h1>
            <p className="text-muted-foreground mt-1">
              Configure as categorias de receitas e despesas do seu restaurante
            </p>
          </div>
          <Button data-testid="button-new-category" onClick={() => setIsDialogOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Nova Categoria
          </Button>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingDown className="h-5 w-5 text-destructive" />
                Despesas
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {isLoading ? (
                <>
                  <Skeleton className="h-16 w-full" />
                  <Skeleton className="h-16 w-full" />
                  <Skeleton className="h-16 w-full" />
                </>
              ) : expenseCategories.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">
                  Nenhuma categoria de despesa cadastrada
                </p>
              ) : (
                expenseCategories.map((category) => (
                  <div
                    key={category.id}
                    className="flex items-center justify-between p-4 border rounded-lg"
                    data-testid={`category-expense-${category.id}`}
                  >
                    <div className="flex-1">
                      <p className="font-medium">{category.name}</p>
                      {category.description && (
                        <p className="text-sm text-muted-foreground">{category.description}</p>
                      )}
                    </div>
                    {!category.isDefault && (
                      <Button
                        variant="ghost"
                        size="icon"
                        data-testid={`button-delete-category-${category.id}`}
                        onClick={() => setDeleteCategoryId(category.id)}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    )}
                  </div>
                ))
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-green-600" />
                Receitas
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {isLoading ? (
                <>
                  <Skeleton className="h-16 w-full" />
                  <Skeleton className="h-16 w-full" />
                  <Skeleton className="h-16 w-full" />
                </>
              ) : incomeCategories.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">
                  Nenhuma categoria de receita cadastrada
                </p>
              ) : (
                incomeCategories.map((category) => (
                  <div
                    key={category.id}
                    className="flex items-center justify-between p-4 border rounded-lg"
                    data-testid={`category-income-${category.id}`}
                  >
                    <div className="flex-1">
                      <p className="font-medium">{category.name}</p>
                      {category.description && (
                        <p className="text-sm text-muted-foreground">{category.description}</p>
                      )}
                    </div>
                    {!category.isDefault && (
                      <Button
                        variant="ghost"
                        size="icon"
                        data-testid={`button-delete-category-${category.id}`}
                        onClick={() => setDeleteCategoryId(category.id)}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    )}
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent data-testid="dialog-new-category">
          <DialogHeader>
            <DialogTitle>Nova Categoria</DialogTitle>
            <DialogDescription>
              Crie uma nova categoria para organizar suas movimentações financeiras
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="type">Tipo</Label>
              <Select
                value={categoryForm.type}
                onValueChange={(value: 'receita' | 'despesa') =>
                  setCategoryForm({ ...categoryForm, type: value })
                }
              >
                <SelectTrigger data-testid="select-category-type">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="despesa" data-testid="option-despesa">Despesa</SelectItem>
                  <SelectItem value="receita" data-testid="option-receita">Receita</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="name">Nome</Label>
              <Input
                id="name"
                data-testid="input-category-name"
                value={categoryForm.name}
                onChange={(e) => setCategoryForm({ ...categoryForm, name: e.target.value })}
                placeholder="Ex: Insumos, Salários, Vendas"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Descrição (opcional)</Label>
              <Textarea
                id="description"
                data-testid="input-category-description"
                value={categoryForm.description}
                onChange={(e) => setCategoryForm({ ...categoryForm, description: e.target.value })}
                placeholder="Breve descrição da categoria"
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsDialogOpen(false)}
              data-testid="button-cancel-category"
            >
              Cancelar
            </Button>
            <Button
              onClick={handleCreateCategory}
              disabled={createCategoryMutation.isPending}
              data-testid="button-save-category"
            >
              {createCategoryMutation.isPending ? "Salvando..." : "Salvar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog
        open={deleteCategoryId !== null}
        onOpenChange={(open) => !open && setDeleteCategoryId(null)}
      >
        <AlertDialogContent data-testid="dialog-delete-category">
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir categoria?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta ação não pode ser desfeita. A categoria só pode ser excluída se não tiver sido usada em nenhum lançamento.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel data-testid="button-cancel-delete">Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteCategoryId && deleteCategoryMutation.mutate(deleteCategoryId)}
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
