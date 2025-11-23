import { useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Check, Crown } from "lucide-react";
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
  displayOrder: number;
}

interface PlanSelectorProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentPlanId?: string;
  mode: 'create' | 'upgrade';
}

export function SubscriptionPlanSelector({ open, onOpenChange, currentPlanId, mode }: PlanSelectorProps) {
  const { toast } = useToast();
  const [selectedPlanId, setSelectedPlanId] = useState<string>("");
  const [billingInterval, setBillingInterval] = useState<'mensal' | 'anual'>('mensal');
  const [currency, setCurrency] = useState<'AOA' | 'USD'>('AOA');

  const { data: plans, isLoading } = useQuery<SubscriptionPlan[]>({
    queryKey: ['/api/subscription-plans'],
  });

  const createSubscriptionMutation = useMutation({
    mutationFn: async (data: { planId: string; billingInterval: 'mensal' | 'anual'; currency: 'AOA' | 'USD' }) => {
      return await apiRequest('POST', '/api/subscription', data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/subscription'] });
      queryClient.invalidateQueries({ queryKey: ['/api/subscription/limits'] });
      toast({
        title: "Subscrição Criada",
        description: "Sua subscrição foi criada com sucesso!",
      });
      onOpenChange(false);
    },
    onError: (error: any) => {
      toast({
        title: "Erro",
        description: error.message || "Erro ao criar subscrição",
        variant: "destructive",
      });
    },
  });

  const updatePlanMutation = useMutation({
    mutationFn: async (data: { planId: string; billingInterval?: 'mensal' | 'anual' }) => {
      return await apiRequest('PATCH', '/api/subscription', data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/subscription'] });
      queryClient.invalidateQueries({ queryKey: ['/api/subscription/limits'] });
      toast({
        title: "Plano Atualizado",
        description: "Seu plano foi atualizado com sucesso!",
      });
      onOpenChange(false);
    },
    onError: (error: any) => {
      toast({
        title: "Erro",
        description: error.message || "Erro ao atualizar plano",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = () => {
    if (!selectedPlanId) {
      toast({
        title: "Erro",
        description: "Por favor, selecione um plano",
        variant: "destructive",
      });
      return;
    }

    if (mode === 'create') {
      createSubscriptionMutation.mutate({
        planId: selectedPlanId,
        billingInterval,
        currency,
      });
    } else {
      updatePlanMutation.mutate({
        planId: selectedPlanId,
        billingInterval,
      });
    }
  };

  const formatPrice = (priceKz: string, priceUsd: string) => {
    if (currency === 'AOA') {
      return `${parseFloat(priceKz).toLocaleString('pt-AO')} Kz`;
    }
    return `$${parseFloat(priceUsd).toLocaleString('en-US', { minimumFractionDigits: 2 })}`;
  };

  const featureLabels: Record<string, string> = {
    'pdv': 'PDV Completo',
    'gestao_mesas': 'Gestão de Mesas',
    'menu_digital': 'Menu Digital',
    'qr_code': 'QR Code para Mesas',
    'cozinha_tempo_real': 'Cozinha em Tempo Real',
    'relatorios_basicos': 'Relatórios Básicos',
    'impressao_recibos': 'Impressão de Recibos',
    'fidelidade': 'Sistema de Fidelidade',
    'cupons': 'Cupons de Desconto',
    'gestao_clientes': 'Gestão de Clientes',
    'delivery_takeout': 'Delivery e Takeout',
    'relatorios_avancados': 'Relatórios Avançados',
    'dashboard_analytics': 'Dashboard e Analytics',
    'gestao_despesas': 'Gestão de Despesas',
    'multi_filial': 'Multi-Filial',
    'inventario': 'Controle de Inventário',
    'relatorios_financeiros': 'Relatórios Financeiros',
    'api_integracoes': 'API e Integrações',
    'exportacao_dados': 'Exportação de Dados',
    'customizacao_visual': 'Customização Visual',
    'multiplos_turnos': 'Múltiplos Turnos',
    'suporte_email': 'Suporte por Email',
    'suporte_prioritario': 'Suporte Prioritário',
    'suporte_whatsapp': 'Suporte via WhatsApp',
    'tudo_ilimitado': 'Tudo Ilimitado',
    'servidor_dedicado': 'Servidor Dedicado',
    'white_label': 'White Label',
    'integracao_personalizada': 'Integração Personalizada',
    'treinamento_presencial': 'Treinamento Presencial',
    'sla_garantido': 'SLA Garantido',
    'suporte_24_7': 'Suporte 24/7',
    'gerente_conta_dedicado': 'Gerente de Conta Dedicado',
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto" data-testid="dialog-plan-selector">
        <DialogHeader>
          <DialogTitle>
            {mode === 'create' ? 'Selecione seu Plano' : 'Alterar Plano'}
          </DialogTitle>
          <DialogDescription>
            {mode === 'create' 
              ? 'Escolha o plano ideal para o seu negócio. Você pode mudar de plano a qualquer momento.'
              : 'Selecione um novo plano para sua subscrição.'}
          </DialogDescription>
        </DialogHeader>

        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <p className="text-muted-foreground">Carregando planos...</p>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="space-y-3">
              <Label>Moeda</Label>
              <RadioGroup value={currency} onValueChange={(value) => setCurrency(value as 'AOA' | 'USD')} className="flex gap-4" data-testid="radio-currency">
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="AOA" id="aoa" data-testid="radio-currency-aoa" />
                  <Label htmlFor="aoa" className="cursor-pointer">Kwanza (Kz)</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="USD" id="usd" data-testid="radio-currency-usd" />
                  <Label htmlFor="usd" className="cursor-pointer">Dólar (USD)</Label>
                </div>
              </RadioGroup>
            </div>

            <div className="space-y-3">
              <Label>Intervalo de Faturamento</Label>
              <RadioGroup value={billingInterval} onValueChange={(value) => setBillingInterval(value as 'mensal' | 'anual')} className="flex gap-4" data-testid="radio-billing">
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="mensal" id="mensal" data-testid="radio-billing-monthly" />
                  <Label htmlFor="mensal" className="cursor-pointer">Mensal</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="anual" id="anual" data-testid="radio-billing-annual" />
                  <Label htmlFor="anual" className="cursor-pointer">Anual (20% desconto)</Label>
                </div>
              </RadioGroup>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              {plans?.map((plan) => {
                const isSelected = selectedPlanId === plan.id;
                const isCurrent = currentPlanId === plan.id;
                const price = billingInterval === 'mensal' 
                  ? formatPrice(plan.priceMonthlyKz, plan.priceMonthlyUsd)
                  : formatPrice(plan.priceAnnualKz, plan.priceAnnualUsd);

                return (
                  <Card
                    key={plan.id}
                    className={`cursor-pointer transition-all ${isSelected ? 'border-primary ring-2 ring-primary' : ''}`}
                    onClick={() => setSelectedPlanId(plan.id)}
                    data-testid={`plan-card-${plan.slug}`}
                  >
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div>
                          <CardTitle className="flex items-center gap-2">
                            {plan.slug === 'enterprise' && <Crown className="h-5 w-5 text-yellow-500" />}
                            {plan.name}
                          </CardTitle>
                          <CardDescription className="mt-2">{plan.description}</CardDescription>
                        </div>
                        {isCurrent && (
                          <Badge variant="secondary" data-testid={`badge-current-${plan.slug}`}>Atual</Badge>
                        )}
                      </div>
                      <div className="mt-4">
                        <p className="text-3xl font-bold" data-testid={`plan-price-${plan.slug}`}>{price}</p>
                        <p className="text-sm text-muted-foreground">
                          por {billingInterval === 'mensal' ? 'mês' : 'ano'}
                        </p>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        <div className="space-y-1 text-sm">
                          <div className="flex items-center justify-between">
                            <span className="text-muted-foreground">Filiais</span>
                            <span className="font-medium">{plan.maxBranches === 999999 ? 'Ilimitado' : plan.maxBranches}</span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-muted-foreground">Mesas</span>
                            <span className="font-medium">{plan.maxTables === 999999 ? 'Ilimitado' : plan.maxTables}</span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-muted-foreground">Produtos</span>
                            <span className="font-medium">{plan.maxMenuItems === 999999 ? 'Ilimitado' : plan.maxMenuItems}</span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-muted-foreground">Pedidos/mês</span>
                            <span className="font-medium">{plan.maxOrdersPerMonth === 999999 ? 'Ilimitado' : plan.maxOrdersPerMonth}</span>
                          </div>
                        </div>

                        {plan.features && plan.features.length > 0 && (
                          <div className="pt-3 border-t mt-3">
                            <p className="text-sm font-medium mb-2">Recursos Incluídos:</p>
                            <ul className="space-y-1">
                              {plan.features.slice(0, 5).map((feature, index) => (
                                <li key={index} className="flex items-center gap-2 text-sm">
                                  <Check className="h-3 w-3 text-primary" />
                                  <span>{featureLabels[feature] || feature}</span>
                                </li>
                              ))}
                              {plan.features.length > 5 && (
                                <li className="text-sm text-muted-foreground">
                                  +{plan.features.length - 5} mais recursos...
                                </li>
                              )}
                            </ul>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} data-testid="button-cancel">
            Cancelar
          </Button>
          <Button 
            onClick={handleSubmit} 
            disabled={!selectedPlanId || createSubscriptionMutation.isPending || updatePlanMutation.isPending}
            data-testid="button-confirm"
          >
            {createSubscriptionMutation.isPending || updatePlanMutation.isPending ? 'Processando...' : mode === 'create' ? 'Criar Subscrição' : 'Alterar Plano'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
