import { useState, lazy, Suspense } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
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
import { 
  CreditCard, 
  TrendingUp, 
  Users, 
  Building2, 
  UtensilsCrossed, 
  Table2,
  ShoppingCart,
  AlertCircle,
  CheckCircle,
  Clock,
  Calendar,
  ArrowUpCircle,
  XCircle
} from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { SubscriptionPlanSelector } from "@/components/subscription-plan-selector";
import { SubscriptionUsageChart } from "@/components/subscription-usage-chart";
import { SubscriptionAlerts } from "@/components/subscription-alerts";
import { SubscriptionNextPayment } from "@/components/subscription-next-payment";
import { SubscriptionInsights } from "@/components/subscription-insights";
import { SubscriptionFeatures } from "@/components/subscription-features";
import { SubscriptionBadges } from "@/components/subscription-badges";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";

interface SubscriptionPlan {
  id: string;
  name: string;
  slug: string;
  description: string;
  priceMonthlyKz: string;
  priceAnnualKz: string;
  priceMonthlyUsd: string;
  priceAnnualUsd: string;
  maxBranches: number;
  maxTables: number;
  maxMenuItems: number;
  maxOrdersPerMonth: number;
  maxUsers: number;
  historyRetentionDays: number;
  features: string[];
  isActive: number;
  displayOrder: number;
}

interface Subscription {
  id: string;
  restaurantId: string;
  planId: string;
  status: 'ativa' | 'trial' | 'cancelada' | 'expirada';
  billingInterval: 'mensal' | 'anual';
  currency: 'AOA' | 'USD';
  currentPeriodStart: Date;
  currentPeriodEnd: Date;
  canceledAt: Date | null;
  createdAt: Date;
  plan: SubscriptionPlan;
}

interface SubscriptionLimits {
  plan: SubscriptionPlan;
  subscription: Subscription;
  usage: {
    branches: number;
    tables: number;
    menuItems: number;
    users: number;
    ordersThisMonth: number;
  };
  withinLimits: {
    branches: boolean;
    tables: boolean;
    menuItems: boolean;
    users: boolean;
    orders: boolean;
  };
  canAddBranch: boolean;
  canAddTable: boolean;
  canAddMenuItem: boolean;
  canAddUser: boolean;
  canCreateOrder: boolean;
}

interface SubscriptionPayment {
  id: string;
  restaurantId: string;
  subscriptionId: string;
  amount: string;
  currency: 'AOA' | 'USD';
  status: 'pendente' | 'pago' | 'falhado';
  paymentMethod: 'stripe' | 'transferencia' | 'multicaixa' | 'outro';
  stripePaymentIntentId: string | null;
  paidAt: Date | null;
  createdAt: Date;
}

export default function Subscription() {
  const { toast } = useToast();
  const [showPlanSelector, setShowPlanSelector] = useState(false);
  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const [selectorMode, setSelectorMode] = useState<'create' | 'upgrade'>('create');

  const { data: subscription, isLoading: subscriptionLoading } = useQuery<Subscription>({
    queryKey: ['/api/subscription'],
    staleTime: 30000, // Cache por 30 segundos
    gcTime: 300000, // Garbage collection após 5 minutos
  });

  const { data: limits, isLoading: limitsLoading } = useQuery<SubscriptionLimits>({
    queryKey: ['/api/subscription/limits'],
    staleTime: 60000, // Cache por 1 minuto
    gcTime: 300000,
  });

  const { data: payments, isLoading: paymentsLoading } = useQuery<SubscriptionPayment[]>({
    queryKey: ['/api/subscription/payments'],
    staleTime: 120000, // Cache por 2 minutos (menos crítico)
    gcTime: 300000,
  });

  const { data: plans, isLoading: plansLoading } = useQuery<SubscriptionPlan[]>({
    queryKey: ['/api/subscription-plans'],
    staleTime: 300000, // Cache por 5 minutos (dados estáticos)
    gcTime: 600000,
  });

  const cancelSubscriptionMutation = useMutation({
    mutationFn: async () => {
      return await apiRequest('DELETE', '/api/subscription');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/subscription'] });
      queryClient.invalidateQueries({ queryKey: ['/api/subscription/limits'] });
      toast({
        title: "Subscrição Cancelada",
        description: "Sua subscrição foi cancelada. Você ainda terá acesso até o fim do período pago.",
      });
      setShowCancelDialog(false);
    },
    onError: (error: any) => {
      toast({
        title: "Erro",
        description: error.message || "Erro ao cancelar subscrição",
        variant: "destructive",
      });
    },
  });

  if (subscriptionLoading || limitsLoading) {
    return (
      <div className="min-h-screen p-4 sm:p-6">
        <div className="max-w-7xl mx-auto space-y-4">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold" data-testid="text-title">Assinatura</h1>
            <p className="text-sm text-muted-foreground" data-testid="text-subtitle">
              Gerencie sua assinatura e veja o uso dos recursos
            </p>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader className="pb-3">
                <div className="h-5 w-32 bg-muted animate-pulse rounded" />
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="h-4 w-full bg-muted animate-pulse rounded" />
                  <div className="h-4 w-3/4 bg-muted animate-pulse rounded" />
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  if (!subscription || !limits) {
    return (
      <div className="min-h-screen p-4 sm:p-6">
        <div className="max-w-7xl mx-auto space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h1 className="text-xl sm:text-2xl font-bold" data-testid="text-title">Assinatura</h1>
              <p className="text-sm text-muted-foreground" data-testid="text-subtitle">
                Gerencie sua assinatura e veja o uso dos recursos
              </p>
            </div>
            <Button 
              onClick={() => {
                setSelectorMode('create');
                setShowPlanSelector(true);
              }}
              size="sm"
              data-testid="button-create-subscription"
            >
              Criar Subscrição
            </Button>
          </div>
          <Alert data-testid="alert-no-subscription">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle className="text-sm">Sem Assinatura Ativa</AlertTitle>
            <AlertDescription className="text-xs">
              Você não possui uma assinatura ativa. Selecione um plano para começar.
            </AlertDescription>
          </Alert>

          {plans && plans.length > 0 && (
            <div className="grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
              {plans.map((plan) => (
                <Card key={plan.id} data-testid={`plan-preview-${plan.slug}`} className="hover:shadow-md transition-shadow">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base">{plan.name}</CardTitle>
                    <CardDescription className="text-xs">{plan.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-xl font-bold">{parseFloat(plan.priceMonthlyKz).toLocaleString('pt-AO')} Kz</p>
                    <p className="text-xs text-muted-foreground">por mês</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          <SubscriptionPlanSelector
            open={showPlanSelector}
            onOpenChange={setShowPlanSelector}
            mode={selectorMode}
          />
        </div>
      </div>
    );
  }

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'ativa':
        return 'default';
      case 'trial':
        return 'secondary';
      case 'cancelada':
      case 'expirada':
        return 'destructive';
      default:
        return 'secondary';
    }
  };

  const getPaymentStatusBadge = (status: string) => {
    switch (status) {
      case 'pago':
        return { variant: 'default' as const, label: 'Pago' };
      case 'pendente':
        return { variant: 'secondary' as const, label: 'Pendente' };
      case 'falhado':
        return { variant: 'destructive' as const, label: 'Falhado' };
      default:
        return { variant: 'secondary' as const, label: status };
    }
  };

  const formatCurrency = (amount: string, currency: 'AOA' | 'USD') => {
    const value = parseFloat(amount);
    if (currency === 'AOA') {
      return `${value.toLocaleString('pt-AO')} Kz`;
    }
    return `$${value.toLocaleString('en-US', { minimumFractionDigits: 2 })}`;
  };

  const getUsagePercentage = (current: number, max: number) => {
    return Math.min((current / max) * 100, 100);
  };

  const getUsageColor = (percentage: number) => {
    if (percentage >= 90) return 'text-destructive';
    if (percentage >= 75) return 'text-yellow-600';
    return 'text-primary';
  };

  return (
    <div className="min-h-screen p-4 sm:p-6">
      <div className="max-w-7xl mx-auto space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold" data-testid="text-title">Assinatura</h1>
            <p className="text-sm text-muted-foreground" data-testid="text-subtitle">
              Gerencie sua assinatura e veja o uso dos recursos
            </p>
          </div>
          <div className="flex gap-2 flex-wrap">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setSelectorMode('upgrade');
                setShowPlanSelector(true);
              }}
              data-testid="button-change-plan"
            >
              <ArrowUpCircle className="h-4 w-4 mr-2" />
              Mudar Plano
            </Button>
            {subscription.status === 'ativa' && (
              <Button
                variant="destructive"
                size="sm"
                onClick={() => setShowCancelDialog(true)}
                data-testid="button-cancel-subscription"
              >
                <XCircle className="h-4 w-4 mr-2" />
                Cancelar
              </Button>
            )}
          </div>
        </div>

        {/* Alertas Inteligentes */}
        <SubscriptionAlerts
          subscription={subscription}
          limits={limits}
          usage={limits.usage}
          onUpgrade={() => {
            setSelectorMode('upgrade');
            setShowPlanSelector(true);
          }}
        />

        <div className="grid gap-4 lg:grid-cols-3">
          {/* Coluna Principal - 2/3 */}
          <div className="lg:col-span-2 space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <Card data-testid="card-current-plan">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2 text-base">
                  <CreditCard className="h-4 w-4" />
                  Plano Atual
                </CardTitle>
                <Badge variant={getStatusBadgeVariant(subscription.status)} data-testid={`badge-status-${subscription.status}`} className="text-xs">
                  {subscription.status === 'ativa' ? 'Ativa' : subscription.status === 'trial' ? 'Trial' : subscription.status}
                </Badge>
              </div>
              <CardDescription className="text-xs">{limits.plan.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div>
                  <h3 className="text-lg font-bold" data-testid="text-plan-name">{limits.plan.name}</h3>
                  <p className="text-sm text-muted-foreground" data-testid="text-plan-price">
                    {subscription.billingInterval === 'mensal' 
                      ? formatCurrency(
                          subscription.currency === 'AOA' ? limits.plan.priceMonthlyKz : limits.plan.priceMonthlyUsd,
                          subscription.currency
                        )
                      : formatCurrency(
                          subscription.currency === 'AOA' ? limits.plan.priceAnnualKz : limits.plan.priceAnnualUsd,
                          subscription.currency
                        )
                    } / {subscription.billingInterval === 'mensal' ? 'mês' : 'ano'}
                  </p>
                </div>
                
                <Separator />
                
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="flex items-center gap-1.5">
                      <Calendar className="h-3.5 w-3.5" />
                      Período atual
                    </span>
                    <span className="text-muted-foreground" data-testid="text-period">
                      {format(new Date(subscription.currentPeriodStart), 'dd MMM', { locale: ptBR })} - {format(new Date(subscription.currentPeriodEnd), 'dd MMM yyyy', { locale: ptBR })}
                    </span>
                  </div>
                  
                  {subscription.status === 'trial' && (
                    <Alert data-testid="alert-trial" className="py-2">
                      <Clock className="h-3.5 w-3.5" />
                      <AlertTitle className="text-xs">Período de Teste</AlertTitle>
                      <AlertDescription className="text-xs">
                        Seu período de teste termina em {format(new Date(subscription.currentPeriodEnd), 'dd MMM yyyy', { locale: ptBR })}
                      </AlertDescription>
                    </Alert>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          <Card data-testid="card-usage-summary">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base">
                <TrendingUp className="h-4 w-4" />
                Resumo de Uso
              </CardTitle>
              <CardDescription className="text-xs">Uso dos recursos do seu plano</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-0.5">
                    <p className="text-xs text-muted-foreground">Filiais</p>
                    <p className={`text-lg font-bold ${getUsageColor(getUsagePercentage(limits.usage.branches, limits.plan.maxBranches))}`} data-testid="text-branches-usage">
                      {limits.usage.branches}/{limits.plan.maxBranches}
                    </p>
                  </div>
                  <div className="space-y-0.5">
                    <p className="text-xs text-muted-foreground">Mesas</p>
                    <p className={`text-lg font-bold ${getUsageColor(getUsagePercentage(limits.usage.tables, limits.plan.maxTables))}`} data-testid="text-tables-usage">
                      {limits.usage.tables}/{limits.plan.maxTables}
                    </p>
                  </div>
                  <div className="space-y-0.5">
                    <p className="text-xs text-muted-foreground">Produtos</p>
                    <p className={`text-lg font-bold ${getUsageColor(getUsagePercentage(limits.usage.menuItems, limits.plan.maxMenuItems))}`} data-testid="text-items-usage">
                      {limits.usage.menuItems}/{limits.plan.maxMenuItems === 999999 ? '∞' : limits.plan.maxMenuItems}
                    </p>
                  </div>
                  <div className="space-y-0.5">
                    <p className="text-xs text-muted-foreground">Usuários</p>
                    <p className={`text-lg font-bold ${getUsageColor(getUsagePercentage(limits.usage.users, limits.plan.maxUsers))}`} data-testid="text-users-usage">
                      {limits.usage.users}/{limits.plan.maxUsers === 999999 ? '∞' : limits.plan.maxUsers}
                    </p>
                  </div>
                </div>
                
                <Separator />
                
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span>Pedidos este mês</span>
                    <span className={`font-medium ${getUsageColor(getUsagePercentage(limits.usage.ordersThisMonth, limits.plan.maxOrdersPerMonth))}`} data-testid="text-orders-usage">
                      {limits.usage.ordersThisMonth}/{limits.plan.maxOrdersPerMonth === 999999 ? '∞' : limits.plan.maxOrdersPerMonth}
                    </span>
                  </div>
                  <Progress 
                    value={getUsagePercentage(limits.usage.ordersThisMonth, limits.plan.maxOrdersPerMonth)} 
                    className="h-1.5"
                    data-testid="progress-orders"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
            </div>

            {/* Limites de Recursos */}
            <Card data-testid="card-resource-limits">
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Limites de Recursos</CardTitle>
            <CardDescription className="text-xs">Detalhes sobre o uso e limites do seu plano</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="grid gap-3 md:grid-cols-2">
                <div className="flex items-center gap-2 p-2.5 rounded-lg border" data-testid="limit-item-branches">
                  <div className={`p-1.5 rounded-full ${limits.withinLimits.branches ? 'bg-primary/10' : 'bg-destructive/10'}`}>
                    <Building2 className={`h-4 w-4 ${limits.withinLimits.branches ? 'text-primary' : 'text-destructive'}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium">Filiais</p>
                      {limits.withinLimits.branches ? (
                        <CheckCircle className="h-3.5 w-3.5 text-primary" />
                      ) : (
                        <AlertCircle className="h-3.5 w-3.5 text-destructive" />
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {limits.usage.branches} de {limits.plan.maxBranches} usadas
                    </p>
                    <Progress 
                      value={getUsagePercentage(limits.usage.branches, limits.plan.maxBranches)} 
                      className="h-1 mt-1.5"
                    />
                  </div>
                </div>

                <div className="flex items-center gap-2 p-2.5 rounded-lg border" data-testid="limit-item-tables">
                  <div className={`p-1.5 rounded-full ${limits.withinLimits.tables ? 'bg-primary/10' : 'bg-destructive/10'}`}>
                    <Table2 className={`h-4 w-4 ${limits.withinLimits.tables ? 'text-primary' : 'text-destructive'}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium">Mesas</p>
                      {limits.withinLimits.tables ? (
                        <CheckCircle className="h-3.5 w-3.5 text-primary" />
                      ) : (
                        <AlertCircle className="h-3.5 w-3.5 text-destructive" />
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {limits.usage.tables} de {limits.plan.maxTables} usadas
                    </p>
                    <Progress 
                      value={getUsagePercentage(limits.usage.tables, limits.plan.maxTables)} 
                      className="h-1 mt-1.5"
                    />
                  </div>
                </div>

                <div className="flex items-center gap-2 p-2.5 rounded-lg border" data-testid="limit-item-menu-items">
                  <div className={`p-1.5 rounded-full ${limits.withinLimits.menuItems ? 'bg-primary/10' : 'bg-destructive/10'}`}>
                    <UtensilsCrossed className={`h-4 w-4 ${limits.withinLimits.menuItems ? 'text-primary' : 'text-destructive'}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium">Itens do Menu</p>
                      {limits.withinLimits.menuItems ? (
                        <CheckCircle className="h-3.5 w-3.5 text-primary" />
                      ) : (
                        <AlertCircle className="h-3.5 w-3.5 text-destructive" />
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {limits.usage.menuItems} de {limits.plan.maxMenuItems === 999999 ? '∞' : limits.plan.maxMenuItems}
                    </p>
                    {limits.plan.maxMenuItems !== 999999 && (
                      <Progress 
                        value={getUsagePercentage(limits.usage.menuItems, limits.plan.maxMenuItems)} 
                        className="h-1 mt-1.5"
                      />
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2 p-2.5 rounded-lg border" data-testid="limit-item-users">
                  <div className={`p-1.5 rounded-full ${limits.withinLimits.users ? 'bg-primary/10' : 'bg-destructive/10'}`}>
                    <Users className={`h-4 w-4 ${limits.withinLimits.users ? 'text-primary' : 'text-destructive'}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium">Usuários</p>
                      {limits.withinLimits.users ? (
                        <CheckCircle className="h-3.5 w-3.5 text-primary" />
                      ) : (
                        <AlertCircle className="h-3.5 w-3.5 text-destructive" />
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {limits.usage.users} de {limits.plan.maxUsers === 999999 ? '∞' : limits.plan.maxUsers}
                    </p>
                    {limits.plan.maxUsers !== 999999 && (
                      <Progress 
                        value={getUsagePercentage(limits.usage.users, limits.plan.maxUsers)} 
                        className="h-1 mt-1.5"
                      />
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2 p-2.5 rounded-lg border md:col-span-2" data-testid="limit-item-orders">
                  <div className={`p-1.5 rounded-full ${limits.withinLimits.orders ? 'bg-primary/10' : 'bg-destructive/10'}`}>
                    <ShoppingCart className={`h-4 w-4 ${limits.withinLimits.orders ? 'text-primary' : 'text-destructive'}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium">Pedidos este Mês</p>
                      {limits.withinLimits.orders ? (
                        <CheckCircle className="h-3.5 w-3.5 text-primary" />
                      ) : (
                        <AlertCircle className="h-3.5 w-3.5 text-destructive" />
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {limits.usage.ordersThisMonth} de {limits.plan.maxOrdersPerMonth === 999999 ? '∞' : limits.plan.maxOrdersPerMonth} processados
                    </p>
                    {limits.plan.maxOrdersPerMonth !== 999999 && (
                      <Progress 
                        value={getUsagePercentage(limits.usage.ordersThisMonth, limits.plan.maxOrdersPerMonth)} 
                        className="h-1 mt-1.5"
                      />
                    )}
                  </div>
                </div>
              </div>

              {(!limits.withinLimits.branches || !limits.withinLimits.tables || !limits.withinLimits.menuItems || !limits.withinLimits.users || !limits.withinLimits.orders) && (
                <Alert variant="destructive" data-testid="alert-limit-reached" className="py-2.5">
                  <AlertCircle className="h-3.5 w-3.5" />
                  <AlertTitle className="text-sm">Limite Atingido</AlertTitle>
                  <AlertDescription className="text-xs">
                    Você atingiu o limite de um ou mais recursos. Considere fazer upgrade do seu plano para continuar crescendo.
                  </AlertDescription>
                </Alert>
              )}
            </div>
          </CardContent>
            </Card>

            {/* Histórico de Pagamentos */}
            {payments && payments.length > 0 && (
          <Card data-testid="card-payment-history">
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Histórico de Pagamentos</CardTitle>
              <CardDescription className="text-xs">Últimos pagamentos da sua assinatura</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {payments.slice(0, 5).map((payment) => (
                  <div key={payment.id} className="flex items-center justify-between p-2.5 rounded-lg border" data-testid={`payment-item-${payment.id}`}>
                    <div className="flex items-center gap-2.5">
                      <div className={`p-1.5 rounded-full ${payment.status === 'pago' ? 'bg-primary/10' : payment.status === 'pendente' ? 'bg-yellow-100 dark:bg-yellow-900/20' : 'bg-destructive/10'}`}>
                        <CreditCard className={`h-3.5 w-3.5 ${payment.status === 'pago' ? 'text-primary' : payment.status === 'pendente' ? 'text-yellow-600' : 'text-destructive'}`} />
                      </div>
                      <div>
                        <p className="text-sm font-medium" data-testid={`payment-amount-${payment.id}`}>
                          {formatCurrency(payment.amount, payment.currency)}
                        </p>
                        <p className="text-xs text-muted-foreground" data-testid={`payment-date-${payment.id}`}>
                          {format(new Date(payment.createdAt), "dd 'de' MMM yyyy", { locale: ptBR })}
                        </p>
                      </div>
                    </div>
                    <Badge variant={getPaymentStatusBadge(payment.status).variant} data-testid={`payment-status-${payment.id}`} className="text-xs">
                      {getPaymentStatusBadge(payment.status).label}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
              </Card>
            )}
          </div>

          {/* Coluna Lateral - 1/3 */}
          <div className="space-y-4">
            {/* Gráfico de Uso */}
            <SubscriptionUsageChart
              usage={{
                branches: limits.usage.branches,
                maxBranches: limits.plan.maxBranches,
                tables: limits.usage.tables,
                maxTables: limits.plan.maxTables,
                menuItems: limits.usage.menuItems,
                maxMenuItems: limits.plan.maxMenuItems,
                users: limits.usage.users,
                maxUsers: limits.plan.maxUsers,
                orders: limits.usage.ordersThisMonth,
                maxOrders: limits.plan.maxOrdersPerMonth,
              }}
            />

            {/* Próximo Pagamento */}
            <SubscriptionNextPayment
              subscription={{
                status: subscription.status,
                currentPeriodEnd: subscription.currentPeriodEnd,
                billingInterval: subscription.billingInterval,
                currency: subscription.currency,
              }}
              plan={limits.plan}
            />

            {/* Features Incluídas */}
            <SubscriptionFeatures plan={limits.plan} />

            {/* Badges e Gamification */}
            <SubscriptionBadges
              subscription={{
                createdAt: subscription.createdAt,
                status: subscription.status,
              }}
              usage={{
                orders: limits.usage.ordersThisMonth,
              }}
              totalOrders={limits.usage.ordersThisMonth}
            />
          </div>
        </div>

        {/* Insights */}
        <SubscriptionInsights
          usage={{
            branches: limits.usage.branches,
            maxBranches: limits.plan.maxBranches,
            tables: limits.usage.tables,
            maxTables: limits.plan.maxTables,
            menuItems: limits.usage.menuItems,
            maxMenuItems: limits.plan.maxMenuItems,
            users: limits.usage.users,
            maxUsers: limits.plan.maxUsers,
            orders: limits.usage.ordersThisMonth,
            maxOrders: limits.plan.maxOrdersPerMonth,
          }}
          subscription={{
            billingInterval: subscription.billingInterval,
          }}
          plan={limits.plan}
        />
      </div>

      <SubscriptionPlanSelector
        open={showPlanSelector}
        onOpenChange={setShowPlanSelector}
        currentPlanId={subscription.planId}
        mode={selectorMode}
      />

      <AlertDialog open={showCancelDialog} onOpenChange={setShowCancelDialog}>
        <AlertDialogContent data-testid="dialog-cancel-confirmation" className="max-w-md">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-base">Cancelar Subscrição</AlertDialogTitle>
            <AlertDialogDescription className="text-sm">
              Tem certeza que deseja cancelar sua subscrição? Você ainda terá acesso até o fim do período pago ({format(new Date(subscription.currentPeriodEnd), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}).
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel data-testid="button-cancel-no" className="text-sm">Não, manter subscrição</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => cancelSubscriptionMutation.mutate()}
              disabled={cancelSubscriptionMutation.isPending}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90 text-sm"
              data-testid="button-cancel-yes"
            >
              {cancelSubscriptionMutation.isPending ? 'Cancelando...' : 'Sim, cancelar'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
