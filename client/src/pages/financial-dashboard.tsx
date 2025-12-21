import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link, useLocation } from "wouter";
import { motion } from "framer-motion";
import {
  DollarSign,
  TrendingUp,
  TrendingDown,
  Wallet,
  Receipt,
  Clock,
  AlertCircle,
  CheckCircle2,
  Plus,
  ArrowRight,
  Eye,
  FileText,
  Settings,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import { InteractiveKPICard } from "@/components/interactive-kpi-card";
import { AdvancedKpiCard } from "@/components/advanced-kpi-card";
import { ShimmerSkeleton } from "@/components/shimmer-skeleton";
import { formatKwanza } from "@/lib/formatters";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { cn } from "@/lib/utils";
import type { 
  CashRegister, 
  CashRegisterShift, 
  FinancialTransaction,
  FinancialCategory,
  User 
} from "@shared/schema";

interface ShiftWithDetails extends CashRegisterShift {
  cashRegister: CashRegister;
  openedBy: { id: string; firstName?: string; email: string };
  closedBy?: { id: string; firstName?: string; email: string };
}

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

export default function FinancialDashboard() {
  const [, navigate] = useLocation();
  
  // Get today's date range
  const today = useMemo(() => {
    const start = new Date();
    start.setHours(0, 0, 0, 0);
    const end = new Date();
    end.setHours(23, 59, 59, 999);
    return {
      startDate: start.toISOString(),
      endDate: end.toISOString(),
    };
  }, []);

  // Queries
  const { data: cashRegisters, isLoading: registersLoading } = useQuery<CashRegister[]>({
    queryKey: ["/api/financial/cash-registers"],
  });

  const { data: shifts, isLoading: shiftsLoading } = useQuery<ShiftWithDetails[]>({
    queryKey: ["/api/cash-register-shifts"],
  });

  const { data: todayTransactions, isLoading: transactionsLoading } = useQuery<TransactionWithDetails[]>({
    queryKey: ["/api/financial/transactions", today],
  });

  const { data: todaySummary, isLoading: summaryLoading } = useQuery<FinancialSummary>({
    queryKey: ["/api/financial/summary", today],
  });

  // Calculate active shifts and status
  const { activeShifts, hasActiveShift, oldestActiveShift } = useMemo(() => {
    if (!shifts) return { activeShifts: [], hasActiveShift: false, oldestActiveShift: null };
    
    const active = shifts.filter(s => s.status === 'aberto');
    const oldest = active.length > 0 
      ? active.reduce((prev, curr) => 
          new Date(curr.openedAt) < new Date(prev.openedAt) ? curr : prev
        )
      : null;
    
    return {
      activeShifts: active,
      hasActiveShift: active.length > 0,
      oldestActiveShift: oldest,
    };
  }, [shifts]);

  // Calculate shift duration
  const shiftDuration = useMemo(() => {
    if (!oldestActiveShift) return null;
    const now = new Date();
    const opened = new Date(oldestActiveShift.openedAt);
    const hours = Math.floor((now.getTime() - opened.getTime()) / (1000 * 60 * 60));
    const minutes = Math.floor(((now.getTime() - opened.getTime()) % (1000 * 60 * 60)) / (1000 * 60));
    return { hours, minutes };
  }, [oldestActiveShift]);

  // Recent transactions (last 5)
  const recentTransactions = useMemo(() => {
    if (!todayTransactions) return [];
    return todayTransactions
      .sort((a, b) => new Date(b.occurredAt).getTime() - new Date(a.occurredAt).getTime())
      .slice(0, 5);
  }, [todayTransactions]);

  // Mock sparkline data
  const sparklineData = [65, 70, 68, 75, 73, 78, 80];

  const isLoading = registersLoading || shiftsLoading || transactionsLoading || summaryLoading;

  return (
    <div className="min-h-screen">
      <div className="space-y-6 p-4 sm:p-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-primary via-primary/80 to-primary/60 bg-clip-text text-transparent">
                Dashboard Financeiro
              </h1>
              <p className="text-muted-foreground mt-1">
                Visão geral das movimentações de hoje
              </p>
            </div>
            <div className="flex gap-2">
              <Link href="/financial/cash-registers">
                <Button variant="outline" size="sm">
                  <Settings className="h-4 w-4 mr-2" />
                  Configurar
                </Button>
              </Link>
            </div>
          </div>
        </motion.div>

        {/* Status do Turno - Alert Principal */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
        >
          {isLoading ? (
            <ShimmerSkeleton className="h-24 w-full" />
          ) : !hasActiveShift ? (
            <Alert className="border-destructive/50 bg-destructive/10">
              <AlertCircle className="h-5 w-5 text-destructive" />
              <AlertTitle className="text-lg font-semibold">Nenhum turno aberto</AlertTitle>
              <AlertDescription className="mt-2 flex items-center justify-between">
                <span className="text-sm">
                  Você precisa abrir um turno antes de registrar transações financeiras.
                </span>
                <Link href="/financial/cash-registers">
                  <Button size="sm" variant="destructive">
                    Abrir Turno Agora
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
              </AlertDescription>
            </Alert>
          ) : (
            <Alert className="border-success/50 bg-success/10">
              <CheckCircle2 className="h-5 w-5 text-success" />
              <AlertTitle className="text-lg font-semibold flex items-center gap-2">
                Turno Aberto
                <Badge variant="outline" className="ml-2">
                  {activeShifts.length} {activeShifts.length === 1 ? 'caixa' : 'caixas'}
                </Badge>
              </AlertTitle>
              <AlertDescription className="mt-2 flex items-center justify-between">
                <div className="space-y-1">
                  <p className="text-sm font-medium">
                    {oldestActiveShift?.cashRegister.name}
                  </p>
                  <p className="text-xs text-muted-foreground flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    Aberto há {shiftDuration?.hours}h {shiftDuration?.minutes}m
                    {shiftDuration && shiftDuration.hours >= 12 && (
                      <span className="ml-2 text-warning">⚠️ Considere fechar o turno</span>
                    )}
                  </p>
                </div>
                <div className="flex gap-2">
                  <Link href="/financial/cash-registers">
                    <Button size="sm" variant="outline">
                      Ver Detalhes
                    </Button>
                  </Link>
                </div>
              </AlertDescription>
            </Alert>
          )}
        </motion.div>

        {/* KPIs Principais */}
        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <InteractiveKPICard
            title="Saldo Total"
            value={formatKwanza(todaySummary?.totalBalance || "0")}
            icon={Wallet}
            trend={5.2}
            sparklineData={sparklineData}
            onClick={() => navigate('/financial/cash-registers')}
            data-testid="kpi-total-balance"
          />
          <InteractiveKPICard
            title="Receitas Hoje"
            value={formatKwanza(todaySummary?.totalIncome || "0")}
            icon={TrendingUp}
            trend={12.5}
            sparklineData={sparklineData}
            variant="success"
            onClick={() => navigate('/financial?tab=receita')}
            data-testid="kpi-today-income"
          />
          <InteractiveKPICard
            title="Despesas Hoje"
            value={formatKwanza(todaySummary?.totalExpense || "0")}
            icon={TrendingDown}
            trend={-3.2}
            sparklineData={sparklineData}
            variant="destructive"
            onClick={() => navigate('/financial?tab=despesa')}
            data-testid="kpi-today-expense"
          />
          <InteractiveKPICard
            title="Saldo Líquido"
            value={formatKwanza(todaySummary?.netResult || "0")}
            icon={DollarSign}
            subtitle={`${todayTransactions?.length || 0} transações`}
            onClick={() => navigate('/financial')}
            data-testid="kpi-net-result"
          />
        </motion.div>

        {/* Ações Rápidas */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Plus className="h-5 w-5" />
                Ações Rápidas
              </CardTitle>
              <CardDescription>
                Registre movimentações rapidamente
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                <Link href="/financial/new?type=receita">
                  <Button
                    variant="outline"
                    className="w-full h-24 flex-col gap-2 hover:bg-success/10 hover:border-success"
                    disabled={!hasActiveShift}
                  >
                    <TrendingUp className="h-6 w-6 text-success" />
                    <span className="font-semibold">Nova Receita</span>
                  </Button>
                </Link>
                <Link href="/financial/new?type=despesa">
                  <Button
                    variant="outline"
                    className="w-full h-24 flex-col gap-2 hover:bg-destructive/10 hover:border-destructive"
                    disabled={!hasActiveShift}
                  >
                    <TrendingDown className="h-6 w-6 text-destructive" />
                    <span className="font-semibold">Nova Despesa</span>
                  </Button>
                </Link>
                <Link href="/financial/cash-registers">
                  <Button
                    variant="outline"
                    className="w-full h-24 flex-col gap-2 hover:bg-primary/10 hover:border-primary"
                  >
                    <Wallet className="h-6 w-6 text-primary" />
                    <span className="font-semibold">
                      {hasActiveShift ? 'Gerenciar Caixa' : 'Abrir Turno'}
                    </span>
                  </Button>
                </Link>
                <Link href="/financial/reports">
                  <Button
                    variant="outline"
                    className="w-full h-24 flex-col gap-2 hover:bg-primary/10 hover:border-primary"
                  >
                    <FileText className="h-6 w-6 text-primary" />
                    <span className="font-semibold">Ver Relatórios</span>
                  </Button>
                </Link>
              </div>
              {!hasActiveShift && (
                <p className="text-xs text-muted-foreground mt-3 text-center">
                  ⚠️ Abra um turno para registrar receitas e despesas
                </p>
              )}
            </CardContent>
          </Card>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Atividades Recentes */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
          >
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <Receipt className="h-5 w-5" />
                    Atividades Recentes
                  </CardTitle>
                  <Link href="/financial">
                    <Button variant="ghost" size="sm">
                      Ver Todas
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </Link>
                </div>
                <CardDescription>
                  Últimas transações de hoje
                </CardDescription>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="space-y-3">
                    {[...Array(3)].map((_, i) => (
                      <ShimmerSkeleton key={i} className="h-16 w-full" />
                    ))}
                  </div>
                ) : recentTransactions.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <Receipt className="h-12 w-12 mx-auto mb-3 opacity-50" />
                    <p className="text-sm">Nenhuma transação hoje</p>
                    {hasActiveShift && (
                      <Link href="/financial/new">
                        <Button size="sm" className="mt-3">
                          Registrar Primeira Transação
                        </Button>
                      </Link>
                    )}
                  </div>
                ) : (
                  <div className="space-y-3">
                    {recentTransactions.map((transaction) => (
                      <div
                        key={transaction.id}
                        className="flex items-center gap-3 p-3 border rounded-lg hover:bg-accent/50 transition-colors"
                      >
                        <div className={cn(
                          "p-2 rounded-lg",
                          transaction.type === 'receita' ? "bg-success/10" : "bg-destructive/10"
                        )}>
                          {transaction.type === 'receita' ? (
                            <TrendingUp className="h-4 w-4 text-success" />
                          ) : (
                            <TrendingDown className="h-4 w-4 text-destructive" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium truncate">
                            {transaction.category?.name || 'Sem categoria'}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {format(new Date(transaction.occurredAt), "HH:mm", { locale: ptBR })} • {transaction.cashRegister?.name}
                          </p>
                        </div>
                        <p className={cn(
                          "font-semibold",
                          transaction.type === 'receita' ? "text-success" : "text-destructive"
                        )}>
                          {transaction.type === 'receita' ? '+' : '-'}{formatKwanza(transaction.amount)}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>

          {/* Status das Caixas */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
          >
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <Wallet className="h-5 w-5" />
                    Status das Caixas
                  </CardTitle>
                  <Link href="/financial/cash-registers">
                    <Button variant="ghost" size="sm">
                      Gerenciar
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </Link>
                </div>
                <CardDescription>
                  Saldo atual de cada caixa
                </CardDescription>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="space-y-3">
                    {[...Array(3)].map((_, i) => (
                      <ShimmerSkeleton key={i} className="h-16 w-full" />
                    ))}
                  </div>
                ) : !cashRegisters || cashRegisters.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <Wallet className="h-12 w-12 mx-auto mb-3 opacity-50" />
                    <p className="text-sm mb-3">Nenhuma caixa cadastrada</p>
                    <Link href="/financial/cash-registers">
                      <Button size="sm">
                        Criar Primeira Caixa
                      </Button>
                    </Link>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {cashRegisters.map((register) => {
                      const hasShift = activeShifts.some(s => s.cashRegisterId === register.id);
                      return (
                        <div
                          key={register.id}
                          className="flex items-center justify-between p-3 border rounded-lg hover:bg-accent/50 transition-colors"
                        >
                          <div className="flex items-center gap-3">
                            <div className={cn(
                              "h-2 w-2 rounded-full",
                              hasShift ? "bg-success animate-pulse" : "bg-muted"
                            )} />
                            <div>
                              <p className="font-medium">{register.name}</p>
                              <p className="text-xs text-muted-foreground">
                                {hasShift ? 'Turno aberto' : 'Turno fechado'}
                              </p>
                            </div>
                          </div>
                          <p className="text-lg font-bold">
                            {formatKwanza(register.currentBalance)}
                          </p>
                        </div>
                      );
                    })}
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
