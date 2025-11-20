import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { Settings, Award, TrendingUp, Gift, Medal } from "lucide-react";
import { motion } from "framer-motion";
import { formatKwanza } from "@/lib/formatters";
import type { LoyaltyProgram, LoyaltyTransaction, Customer } from "@shared/schema";

type LoyaltyTransactionWithCustomer = LoyaltyTransaction & { customer: Customer };

export default function Loyalty() {
  const { toast } = useToast();
  const [formData, setFormData] = useState<{
    isActive: number;
    pointsPerCurrency: string;
    currencyPerPoint: string;
    minPointsToRedeem: number;
    silverTierMinSpent: string;
    goldTierMinSpent: string;
    platinumTierMinSpent: string;
  }>({
    isActive: 1,
    pointsPerCurrency: "1",
    currencyPerPoint: "1",
    minPointsToRedeem: 100,
    silverTierMinSpent: "50000",
    goldTierMinSpent: "100000",
    platinumTierMinSpent: "200000",
  });

  const { data: program, isLoading: programLoading } = useQuery<LoyaltyProgram>({
    queryKey: ['/api/loyalty', 'program'],
    queryFn: async () => {
      const response = await fetch('/api/loyalty/program');
      if (!response.ok) return null;
      return response.json();
    },
  });

  const { data: transactions = [] } = useQuery<LoyaltyTransactionWithCustomer[]>({
    queryKey: ['/api/loyalty', 'transactions'],
  });

  const saveProgramMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      return await apiRequest('POST', '/api/loyalty/program', data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/loyalty'] });
      toast({
        title: "Sucesso",
        description: "Programa de fidelidade atualizado com sucesso",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Erro",
        description: error.message || "Erro ao salvar programa de fidelidade",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    saveProgramMutation.mutate(formData);
  };

  useEffect(() => {
    if (program) {
      setFormData({
        isActive: program.isActive,
        pointsPerCurrency: program.pointsPerCurrency,
        currencyPerPoint: program.currencyPerPoint,
        minPointsToRedeem: program.minPointsToRedeem,
        silverTierMinSpent: program.silverTierMinSpent || "50000",
        goldTierMinSpent: program.goldTierMinSpent || "100000",
        platinumTierMinSpent: program.platinumTierMinSpent || "200000",
      });
    }
  }, [program]);

  const recentTransactions = transactions.slice(0, 10);
  const totalPointsEarned = transactions
    .filter((t: LoyaltyTransaction) => t.type === 'ganho')
    .reduce((sum: number, t: LoyaltyTransaction) => sum + t.points, 0);
  const totalPointsRedeemed = Math.abs(
    transactions
      .filter((t: LoyaltyTransaction) => t.type === 'resgate')
      .reduce((sum: number, t: LoyaltyTransaction) => sum + t.points, 0)
  );

  return (
    <div className="min-h-screen">
      <div className="space-y-4 p-4 sm:p-6">
        <motion.div
          className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight bg-gradient-to-r from-primary via-primary/80 to-primary/60 bg-clip-text text-transparent" data-testid="text-page-title">
              Programa de Fidelidade
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              Configure as regras e benefícios do programa de pontos
            </p>
          </div>
        </motion.div>

        <motion.div
          className="grid gap-4 md:grid-cols-3"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <Card data-testid="card-total-earned">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pontos Concedidos</CardTitle>
              <Award className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalPointsEarned.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">
                Total acumulado pelos clientes
              </p>
            </CardContent>
          </Card>
          <Card data-testid="card-total-redeemed">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pontos Resgatados</CardTitle>
              <Gift className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalPointsRedeemed.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">
                Descontos aplicados
              </p>
            </CardContent>
          </Card>
          <Card data-testid="card-active-points">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pontos Ativos</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {(totalPointsEarned - totalPointsRedeemed).toLocaleString()}
              </div>
              <p className="text-xs text-muted-foreground">
                Disponíveis para resgate
              </p>
            </CardContent>
          </Card>
        </motion.div>

        <div className="grid gap-4 md:grid-cols-2">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="h-5 w-5" />
                  Configurações do Programa
                </CardTitle>
                <CardDescription>
                  Defina as regras de acumulação e resgate de pontos
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="flex items-center justify-between space-x-2">
                    <Label htmlFor="isActive" className="flex flex-col space-y-1">
                      <span>Programa Ativo</span>
                      <span className="font-normal text-xs text-muted-foreground">
                        Ative ou desative o programa
                      </span>
                    </Label>
                    <Switch
                      id="isActive"
                      checked={formData.isActive === 1}
                      onCheckedChange={(checked) => setFormData({ ...formData, isActive: checked ? 1 : 0 })}
                      data-testid="switch-program-active"
                    />
                  </div>


                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="pointsPerCurrency">Pontos por AOA</Label>
                      <Input
                        id="pointsPerCurrency"
                        type="number"
                        step="0.01"
                        placeholder="1"
                        value={formData.pointsPerCurrency}
                        onChange={(e) => setFormData({ ...formData, pointsPerCurrency: e.target.value })}
                        data-testid="input-points-per-currency"
                      />
                      <p className="text-xs text-muted-foreground">
                        Pontos ganhos por cada AOA gasto
                      </p>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="currencyPerPoint">AOA por Ponto</Label>
                      <Input
                        id="currencyPerPoint"
                        type="number"
                        step="0.01"
                        placeholder="1"
                        value={formData.currencyPerPoint}
                        onChange={(e) => setFormData({ ...formData, currencyPerPoint: e.target.value })}
                        data-testid="input-currency-per-point"
                      />
                      <p className="text-xs text-muted-foreground">
                        Desconto por ponto resgatado
                      </p>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="minPointsToRedeem">Mínimo para Resgate</Label>
                    <Input
                      id="minPointsToRedeem"
                      type="number"
                      placeholder="100"
                      value={formData.minPointsToRedeem}
                      onChange={(e) => setFormData({ ...formData, minPointsToRedeem: parseInt(e.target.value) || 0 })}
                      data-testid="input-min-points-redeem"
                    />
                    <p className="text-xs text-muted-foreground">
                      Pontos mínimos para resgate
                    </p>
                  </div>

                  <div className="space-y-2 pt-4 border-t">
                    <div className="flex items-center gap-2 mb-3">
                      <Medal className="h-4 w-4 text-primary" />
                      <h3 className="font-semibold text-sm">Níveis de Fidelidade</h3>
                    </div>
                    <p className="text-xs text-muted-foreground mb-4">
                      Defina os valores mínimos gastos para cada nível
                    </p>

                    <div className="space-y-3">
                      <div className="grid grid-cols-[1fr_2fr] gap-3 items-center">
                        <Label className="text-sm font-medium">
                          <span className="inline-flex items-center gap-2">
                            <div className="h-3 w-3 rounded-full bg-slate-400" />
                            Prata
                          </span>
                        </Label>
                        <Input
                          type="number"
                          placeholder="50000"
                          value={formData.silverTierMinSpent}
                          onChange={(e) => setFormData({ ...formData, silverTierMinSpent: e.target.value })}
                          data-testid="input-silver-tier"
                        />
                      </div>
                      <div className="grid grid-cols-[1fr_2fr] gap-3 items-center">
                        <Label className="text-sm font-medium">
                          <span className="inline-flex items-center gap-2">
                            <div className="h-3 w-3 rounded-full bg-yellow-600" />
                            Ouro
                          </span>
                        </Label>
                        <Input
                          type="number"
                          placeholder="100000"
                          value={formData.goldTierMinSpent}
                          onChange={(e) => setFormData({ ...formData, goldTierMinSpent: e.target.value })}
                          data-testid="input-gold-tier"
                        />
                      </div>
                      <div className="grid grid-cols-[1fr_2fr] gap-3 items-center">
                        <Label className="text-sm font-medium">
                          <span className="inline-flex items-center gap-2">
                            <div className="h-3 w-3 rounded-full bg-slate-600" />
                            Platina
                          </span>
                        </Label>
                        <Input
                          type="number"
                          placeholder="200000"
                          value={formData.platinumTierMinSpent}
                          onChange={(e) => setFormData({ ...formData, platinumTierMinSpent: e.target.value })}
                          data-testid="input-platinum-tier"
                        />
                      </div>
                    </div>
                  </div>

                  <Button
                    type="submit"
                    className="w-full"
                    disabled={saveProgramMutation.isPending}
                    data-testid="button-save-program"
                  >
                    Salvar Configurações
                  </Button>
                </form>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <Card>
              <CardHeader>
                <CardTitle>Transações Recentes</CardTitle>
                <CardDescription>
                  Últimas movimentações de pontos
                </CardDescription>
              </CardHeader>
              <CardContent>
                {recentTransactions.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    Nenhuma transação ainda
                  </div>
                ) : (
                  <div className="space-y-2">
                    {recentTransactions.map((transaction: LoyaltyTransactionWithCustomer) => (
                      <div
                        key={transaction.id}
                        className="flex items-center justify-between p-3 rounded-lg border"
                        data-testid={`transaction-${transaction.id}`}
                      >
                        <div>
                          <p className="font-medium text-sm">{transaction.customer.name}</p>
                          <p className="text-xs text-muted-foreground">{transaction.description}</p>
                        </div>
                        <div className="text-right">
                          <p className={`font-semibold ${transaction.points > 0 ? 'text-green-600' : 'text-red-600'}`}>
                            {transaction.points > 0 ? '+' : ''}{transaction.points} pts
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {transaction.createdAt ? new Date(transaction.createdAt).toLocaleDateString('pt-AO') : '-'}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
