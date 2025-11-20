import { useState, useEffect, useMemo } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { Settings, Award, TrendingUp, Gift, Medal, Sparkles, Target, Users, Crown } from "lucide-react";
import { motion } from "framer-motion";
import { formatKwanza } from "@/lib/formatters";
import { AdvancedKpiCard } from "@/components/advanced-kpi-card";
import { ActivityFeed } from "@/components/activity-feed";
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
  const activePoints = totalPointsEarned - totalPointsRedeemed;
  const redemptionRate = totalPointsEarned > 0 ? (totalPointsRedeemed / totalPointsEarned) * 100 : 0;

  // Convert transactions to activity feed format
  const loyaltyActivities = useMemo(() => {
    return transactions.slice(0, 10).map((transaction: LoyaltyTransactionWithCustomer) => ({
      id: transaction.id,
      type: transaction.type === 'ganho' ? 'goal' as const : 'payment' as const,
      title: transaction.customer.name,
      description: transaction.description || `${transaction.type === 'ganho' ? 'Ganhou' : 'Resgatou'} pontos`,
      timestamp: transaction.createdAt ? new Date(transaction.createdAt) : new Date(),
      status: transaction.type === 'ganho' ? 'success' as const : 'info' as const,
      value: `${transaction.points > 0 ? '+' : ''}${transaction.points} pts`,
    }));
  }, [transactions]);

  // Sparkline data for loyalty points (mock - in production would come from API)
  const pointsSparkline = useMemo(() => {
    return Array.from({ length: 7 }, () => Math.floor(Math.random() * 100) + 50);
  }, []);

  // Get top customers by current loyalty points from customer objects
  const topLoyaltyCustomers = useMemo(() => {
    // Extract unique customers from transactions with their current loyalty points
    const customerMap = new Map<string, Customer>();
    transactions.forEach((t: LoyaltyTransactionWithCustomer) => {
      if (!customerMap.has(t.customer.id)) {
        customerMap.set(t.customer.id, t.customer);
      }
    });
    
    // Convert to array and sort by loyaltyPoints (current balance)
    return Array.from(customerMap.values())
      .filter(c => c.loyaltyPoints > 0)
      .sort((a, b) => b.loyaltyPoints - a.loyaltyPoints)
      .slice(0, 5)
      .map(customer => ({
        customer,
        points: customer.loyaltyPoints,
      }));
  }, [transactions]);

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
              Configuração e análise do programa de pontos
            </p>
          </div>
        </motion.div>

        {/* Advanced KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4">
          {programLoading ? (
            <>
              {[...Array(4)].map((_, i) => (
                <Skeleton key={i} className="h-[140px] w-full rounded-lg" />
              ))}
            </>
          ) : (
            <>
              <AdvancedKpiCard
                title="Pontos Concedidos"
                value={totalPointsEarned}
                icon={Award}
                sparklineData={pointsSparkline}
                gradient="from-success/10 via-success/5 to-transparent"
                delay={0}
                data-testid="card-total-earned"
              />

              <AdvancedKpiCard
                title="Pontos Resgatados"
                value={totalPointsRedeemed}
                icon={Gift}
                change={redemptionRate - 50}
                changeLabel="taxa de resgate"
                gradient="from-warning/10 via-warning/5 to-transparent"
                delay={0.1}
                data-testid="card-total-redeemed"
              />

              <AdvancedKpiCard
                title="Pontos Ativos"
                value={activePoints}
                icon={TrendingUp}
                gradient="from-primary/10 via-primary/5 to-transparent"
                delay={0.2}
                data-testid="card-active-points"
              />

              <AdvancedKpiCard
                title="Taxa de Resgate"
                value={redemptionRate}
                decimals={1}
                suffix="%"
                icon={Target}
                gradient="from-info/10 via-info/5 to-transparent"
                delay={0.3}
                data-testid="card-redemption-rate"
              />
            </>
          )}
        </div>

        {/* Leaderboard & Tier Distribution */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card data-testid="card-loyalty-leaderboard">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Crown className="h-5 w-5 text-primary" />
                Top Clientes por Pontos
              </CardTitle>
              <CardDescription>Maiores acumuladores de pontos</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {topLoyaltyCustomers.map((item, index) => (
                  <div key={item.customer.id} className="flex items-center justify-between p-3 rounded-lg border hover-elevate active-elevate-2">
                    <div className="flex items-center gap-3">
                      <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary font-bold text-sm">
                        {index + 1}
                      </div>
                      <div>
                        <p className="font-medium text-sm">{item.customer.name}</p>
                        <Badge variant="outline" className="text-xs mt-1">
                          {item.customer.tier || 'bronze'}
                        </Badge>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-sm flex items-center gap-1">
                        <Award className="h-3.5 w-3.5 text-primary" />
                        {item.points.toLocaleString()} pts
                      </p>
                    </div>
                  </div>
                ))}
                {topLoyaltyCustomers.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground text-sm">
                    Nenhum cliente com pontos ainda
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          <Card data-testid="card-program-status">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-primary" />
                Status do Programa
              </CardTitle>
              <CardDescription>Visão geral das configurações</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                  <div className="flex items-center gap-2">
                    <div className={`w-3 h-3 rounded-full ${program?.isActive ? 'bg-success' : 'bg-destructive'}`} />
                    <span className="text-sm font-medium">
                      Programa {program?.isActive ? 'Ativo' : 'Inativo'}
                    </span>
                  </div>
                  <Badge variant={program?.isActive ? 'default' : 'secondary'}>
                    {program?.isActive ? 'Ativo' : 'Pausado'}
                  </Badge>
                </div>

                <Separator />

                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Pontos por AOA</span>
                    <span className="font-medium">{program?.pointsPerCurrency || '1'}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">AOA por Ponto</span>
                    <span className="font-medium">{program?.currencyPerPoint || '1'}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Mínimo para Resgate</span>
                    <span className="font-medium">{program?.minPointsToRedeem || '100'} pts</span>
                  </div>
                </div>

                <Separator />

                <div className="space-y-2">
                  <p className="text-xs font-medium text-muted-foreground mb-2">Valores dos Níveis</p>
                  <div className="space-y-1.5">
                    {[
                      { tier: 'Prata', value: program?.silverTierMinSpent },
                      { tier: 'Ouro', value: program?.goldTierMinSpent },
                      { tier: 'Platina', value: program?.platinumTierMinSpent },
                    ].map((t) => (
                      <div key={t.tier} className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">{t.tier}</span>
                        <span className="font-medium">{formatKwanza(t.value || '0')}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-4 lg:grid-cols-3">
          <div className="lg:col-span-2">
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
          </div>

          {/* Activity Feed */}
          <div>
            <ActivityFeed
              activities={loyaltyActivities}
              title="Transações Recentes"
              maxHeight={600}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
