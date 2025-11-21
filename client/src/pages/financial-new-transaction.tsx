import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { DollarSign, Calendar, Clock, ArrowLeft, CreditCard } from "lucide-react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { isUnauthorizedError } from "@/lib/authUtils";
import type { CashRegister, FinancialCategory } from "@shared/schema";

interface TransactionFormData {
  cashRegisterId: string;
  categoryId: string;
  type: 'receita' | 'despesa';
  paymentMethod: 'dinheiro' | 'multicaixa' | 'transferencia' | 'cartao';
  amount: string;
  occurredAt: string;
  note: string;
  installments?: number;
}

export default function FinancialNewTransaction() {
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const [enableInstallments, setEnableInstallments] = useState(false);
  const [transactionForm, setTransactionForm] = useState<TransactionFormData>({
    cashRegisterId: "",
    categoryId: "",
    type: "despesa",
    paymentMethod: "dinheiro",
    amount: "",
    occurredAt: new Date().toISOString().slice(0, 16),
    note: "",
    installments: 1,
  });

  const { data: cashRegisters } = useQuery<CashRegister[]>({
    queryKey: ["/api/cash-register-shifts/active-registers"],
  });

  const { data: allCategories } = useQuery<FinancialCategory[]>({
    queryKey: ["/api/financial/categories"],
  });

  const filteredCategories = allCategories?.filter(
    (cat) => cat.type === transactionForm.type
  ) || [];

  const createTransactionMutation = useMutation({
    mutationFn: async (data: TransactionFormData) => {
      await apiRequest("POST", "/api/financial/transactions", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/financial/transactions"] });
      queryClient.invalidateQueries({ queryKey: ["/api/financial/cash-registers"] });
      queryClient.invalidateQueries({ queryKey: ["/api/financial/summary"] });
      toast({
        title: "Lançamento criado",
        description: "O lançamento foi registrado e o saldo da caixa foi atualizado.",
      });
      setLocation("/financial");
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
        description: error.message || "Não foi possível criar o lançamento.",
        variant: "destructive",
      });
    },
  });

  useEffect(() => {
    if (cashRegisters && cashRegisters.length > 0 && !transactionForm.cashRegisterId) {
      setTransactionForm({ ...transactionForm, cashRegisterId: cashRegisters[0].id });
    }
  }, [cashRegisters]);

  useEffect(() => {
    setTransactionForm({ ...transactionForm, categoryId: "" });
  }, [transactionForm.type]);

  const handleSubmit = () => {
    if (!transactionForm.cashRegisterId) {
      toast({
        title: "Erro de validação",
        description: "Selecione uma caixa registradora.",
        variant: "destructive",
      });
      return;
    }

    if (!transactionForm.categoryId) {
      toast({
        title: "Erro de validação",
        description: "Selecione uma categoria.",
        variant: "destructive",
      });
      return;
    }

    if (!transactionForm.amount || parseFloat(transactionForm.amount) <= 0) {
      toast({
        title: "Erro de validação",
        description: "Informe um valor válido.",
        variant: "destructive",
      });
      return;
    }

    createTransactionMutation.mutate(transactionForm);
  };

  return (
    <div className="min-h-screen bg-background p-4 sm:p-6">
      <div className="max-w-3xl mx-auto space-y-4">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setLocation("/financial")}
            data-testid="button-back"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Novo Lançamento</h1>
            <p className="text-muted-foreground mt-1">
              Registre uma nova movimentação financeira
            </p>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="h-5 w-5" />
              Dados do Lançamento
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-6 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="occurredAt">Data e Hora</Label>
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <Input
                    id="occurredAt"
                    type="datetime-local"
                    data-testid="input-occurred-at"
                    value={transactionForm.occurredAt}
                    onChange={(e) =>
                      setTransactionForm({ ...transactionForm, occurredAt: e.target.value })
                    }
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="cashRegisterId">Caixa Registradora</Label>
                <Select
                  value={transactionForm.cashRegisterId}
                  onValueChange={(value) =>
                    setTransactionForm({ ...transactionForm, cashRegisterId: value })
                  }
                >
                  <SelectTrigger data-testid="select-cash-register">
                    <SelectValue placeholder="Selecione uma caixa" />
                  </SelectTrigger>
                  <SelectContent>
                    {cashRegisters?.map((register) => (
                      <SelectItem key={register.id} value={register.id} data-testid={`option-register-${register.id}`}>
                        {register.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="type">Tipo</Label>
                <Select
                  value={transactionForm.type}
                  onValueChange={(value: 'receita' | 'despesa') =>
                    setTransactionForm({ ...transactionForm, type: value })
                  }
                >
                  <SelectTrigger data-testid="select-type">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="despesa" data-testid="option-despesa">Despesa</SelectItem>
                    <SelectItem value="receita" data-testid="option-receita">Receita</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="categoryId">Categoria</Label>
                <Select
                  value={transactionForm.categoryId}
                  onValueChange={(value) =>
                    setTransactionForm({ ...transactionForm, categoryId: value })
                  }
                >
                  <SelectTrigger data-testid="select-category">
                    <SelectValue placeholder="Selecione uma categoria" />
                  </SelectTrigger>
                  <SelectContent>
                    {filteredCategories.map((category) => (
                      <SelectItem key={category.id} value={category.id} data-testid={`option-category-${category.id}`}>
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="paymentMethod">Método de Pagamento</Label>
                <Select
                  value={transactionForm.paymentMethod}
                  onValueChange={(value: any) =>
                    setTransactionForm({ ...transactionForm, paymentMethod: value })
                  }
                >
                  <SelectTrigger data-testid="select-payment-method">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="dinheiro" data-testid="option-dinheiro">Dinheiro</SelectItem>
                    <SelectItem value="multicaixa" data-testid="option-multicaixa">Multicaixa</SelectItem>
                    <SelectItem value="transferencia" data-testid="option-transferencia">Transferência</SelectItem>
                    <SelectItem value="cartao" data-testid="option-cartao">Cartão</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="amount">Valor (AOA)</Label>
                <Input
                  id="amount"
                  type="number"
                  step="0.01"
                  data-testid="input-amount"
                  value={transactionForm.amount}
                  onChange={(e) =>
                    setTransactionForm({ ...transactionForm, amount: e.target.value })
                  }
                  placeholder="0.00"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="note">Observações (opcional)</Label>
              <Textarea
                id="note"
                data-testid="input-note"
                value={transactionForm.note}
                onChange={(e) => setTransactionForm({ ...transactionForm, note: e.target.value })}
                placeholder="Informações adicionais sobre o lançamento"
                rows={3}
              />
            </div>

            <div className="border-t pt-4 mt-4">
              <div className="flex items-center justify-between mb-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <CreditCard className="h-4 w-4 text-muted-foreground" />
                    <Label htmlFor="enable-installments" className="text-base font-semibold">
                      Parcelar Pagamento
                    </Label>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Dividir o pagamento em várias parcelas
                  </p>
                </div>
                <Switch
                  id="enable-installments"
                  checked={enableInstallments}
                  onCheckedChange={(checked) => {
                    setEnableInstallments(checked);
                    if (!checked) {
                      setTransactionForm({ ...transactionForm, installments: 1 });
                    }
                  }}
                  data-testid="switch-enable-installments"
                />
              </div>

              {enableInstallments && (
                <div className="space-y-4 bg-muted/50 p-4 rounded-md">
                  <div className="space-y-2">
                    <Label htmlFor="installments">Número de Parcelas</Label>
                    <Input
                      id="installments"
                      type="number"
                      min="2"
                      max="36"
                      data-testid="input-installments"
                      value={transactionForm.installments || 2}
                      onChange={(e) => {
                        const value = parseInt(e.target.value) || 2;
                        setTransactionForm({ ...transactionForm, installments: Math.min(Math.max(value, 2), 36) });
                      }}
                      placeholder="2"
                    />
                    <p className="text-xs text-muted-foreground">
                      Entre 2 e 36 parcelas
                    </p>
                  </div>

                  {transactionForm.amount && transactionForm.installments && transactionForm.installments > 1 && (
                    <div className="bg-background p-3 rounded-md border">
                      <div className="text-sm font-medium mb-2">Resumo do Parcelamento</div>
                      <div className="space-y-1 text-sm">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Valor Total:</span>
                          <span className="font-semibold">{parseFloat(transactionForm.amount).toFixed(2)} AOA</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Número de Parcelas:</span>
                          <span className="font-semibold">{transactionForm.installments}x</span>
                        </div>
                        <div className="flex justify-between pt-2 border-t">
                          <span className="text-muted-foreground">Valor de Cada Parcela:</span>
                          <span className="font-bold text-primary">
                            {(parseFloat(transactionForm.amount) / transactionForm.installments).toFixed(2)} AOA
                          </span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="flex justify-end gap-3 pt-4">
              <Button
                variant="outline"
                onClick={() => setLocation("/financial")}
                data-testid="button-cancel"
              >
                Cancelar
              </Button>
              <Button
                onClick={handleSubmit}
                disabled={createTransactionMutation.isPending}
                data-testid="button-submit"
              >
                {createTransactionMutation.isPending ? "Salvando..." : "Registrar Lançamento"}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
