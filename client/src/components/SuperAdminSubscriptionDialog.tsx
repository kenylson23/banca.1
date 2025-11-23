import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Loader2 } from "lucide-react";
import type { Restaurant, SubscriptionPlan } from "@shared/schema";

interface SuperAdminSubscriptionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  restaurant: Restaurant | null;
  mode: 'create' | 'edit';
  subscriptionId?: string;
}

interface SubscriptionFormData {
  planId: string;
  billingInterval: 'mensal' | 'anual';
  currency: 'AOA' | 'USD';
  status?: 'trial' | 'ativa' | 'cancelada' | 'suspensa' | 'expirada';
}

export function SuperAdminSubscriptionDialog({ 
  open, 
  onOpenChange, 
  restaurant,
  mode,
  subscriptionId 
}: SuperAdminSubscriptionDialogProps) {
  const { toast } = useToast();
  const [formData, setFormData] = useState<SubscriptionFormData>({
    planId: '',
    billingInterval: 'mensal',
    currency: 'AOA',
  });

  const { data: plans, isLoading: plansLoading } = useQuery<SubscriptionPlan[]>({
    queryKey: ['/api/subscription-plans'],
    enabled: open,
  });

  const { data: subscription, isLoading: subscriptionLoading } = useQuery<any>({
    queryKey: ['/api/superadmin/subscriptions', subscriptionId],
    enabled: open && mode === 'edit' && !!subscriptionId,
  });

  useEffect(() => {
    if (mode === 'edit' && subscription) {
      setFormData({
        planId: subscription.planId || '',
        billingInterval: subscription.billingInterval || 'mensal',
        currency: subscription.currency || 'AOA',
        status: subscription.status,
      });
    } else {
      setFormData({
        planId: '',
        billingInterval: 'mensal',
        currency: 'AOA',
      });
    }
  }, [mode, subscription]);

  const createMutation = useMutation({
    mutationFn: async (data: SubscriptionFormData) => {
      if (!restaurant) throw new Error("Restaurante não selecionado");
      return await apiRequest('POST', `/api/superadmin/restaurants/${restaurant.id}/subscription`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/superadmin/subscriptions'] });
      toast({
        title: "Subscrição criada",
        description: "A subscrição foi criada com sucesso.",
      });
      onOpenChange(false);
    },
    onError: (error: any) => {
      toast({
        title: "Erro ao criar subscrição",
        description: error.message || "Erro ao criar subscrição",
        variant: "destructive",
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async (data: Partial<SubscriptionFormData>) => {
      if (!subscriptionId) throw new Error("ID da subscrição não fornecido");
      return await apiRequest('PATCH', `/api/superadmin/subscriptions/${subscriptionId}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/superadmin/subscriptions'] });
      queryClient.invalidateQueries({ queryKey: ['/api/superadmin/subscriptions', subscriptionId] });
      toast({
        title: "Subscrição atualizada",
        description: "A subscrição foi atualizada com sucesso.",
      });
      onOpenChange(false);
    },
    onError: (error: any) => {
      toast({
        title: "Erro ao atualizar subscrição",
        description: error.message || "Erro ao atualizar subscrição",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.planId) {
      toast({
        title: "Erro",
        description: "Selecione um plano",
        variant: "destructive",
      });
      return;
    }

    if (mode === 'create') {
      createMutation.mutate(formData);
    } else {
      updateMutation.mutate(formData);
    }
  };

  const isPending = createMutation.isPending || updateMutation.isPending;
  const isLoading = plansLoading || (mode === 'edit' && subscriptionLoading);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>
            {mode === 'create' ? 'Criar Subscrição' : 'Editar Subscrição'}
          </DialogTitle>
          <DialogDescription>
            {mode === 'create' 
              ? `Criar nova subscrição para ${restaurant?.name || 'restaurante'}`
              : 'Modificar dados da subscrição'
            }
          </DialogDescription>
        </DialogHeader>

        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="planId">Plano *</Label>
              <Select
                value={formData.planId}
                onValueChange={(value) => setFormData({ ...formData, planId: value })}
                disabled={isPending}
              >
                <SelectTrigger id="planId" data-testid="select-plan">
                  <SelectValue placeholder="Selecione um plano" />
                </SelectTrigger>
                <SelectContent>
                  {plans?.map((plan: any) => (
                    <SelectItem key={plan.id} value={plan.id}>
                      {plan.name} - {plan.priceMonthlyKz ? parseFloat(plan.priceMonthlyKz).toLocaleString('pt-AO') : '0'} Kz/mês
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="billingInterval">Intervalo de Faturamento *</Label>
              <Select
                value={formData.billingInterval}
                onValueChange={(value: 'mensal' | 'anual') => setFormData({ ...formData, billingInterval: value })}
                disabled={isPending}
              >
                <SelectTrigger id="billingInterval" data-testid="select-billing-interval">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="mensal">Mensal</SelectItem>
                  <SelectItem value="anual">Anual</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="currency">Moeda *</Label>
              <Select
                value={formData.currency}
                onValueChange={(value: 'AOA' | 'USD') => setFormData({ ...formData, currency: value })}
                disabled={isPending}
              >
                <SelectTrigger id="currency" data-testid="select-currency">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="AOA">Kwanza (AOA)</SelectItem>
                  <SelectItem value="USD">Dólar (USD)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {mode === 'edit' && (
              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <Select
                  value={formData.status}
                  onValueChange={(value: any) => setFormData({ ...formData, status: value })}
                  disabled={isPending}
                >
                  <SelectTrigger id="status" data-testid="select-status">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="trial">Trial</SelectItem>
                    <SelectItem value="ativa">Ativa</SelectItem>
                    <SelectItem value="suspensa">Suspensa</SelectItem>
                    <SelectItem value="expirada">Expirada</SelectItem>
                    <SelectItem value="cancelada">Cancelada</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}

            <div className="flex gap-2 justify-end pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={isPending}
                data-testid="button-cancel"
              >
                Cancelar
              </Button>
              <Button 
                type="submit" 
                disabled={isPending}
                data-testid="button-submit"
              >
                {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {mode === 'create' ? 'Criar' : 'Salvar'}
              </Button>
            </div>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
