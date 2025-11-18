import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { DollarSign, Calendar, Clock, ArrowLeft } from "lucide-react";
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
}

export default function FinancialNewTransaction() {
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const [transactionForm, setTransactionForm] = useState<TransactionFormData>({
    cashRegisterId: "",
    categoryId: "",
    type: "despesa",
    paymentMethod: "dinheiro",
    amount: "",
    occurredAt: new Date().toISOString().slice(0, 16),
    note: "",
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
      <div className="p-4 sm:p-6 max-w-3xl mx-auto space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="h-5 w-5" />
              Dados do Lançamento
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
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
  );
}
