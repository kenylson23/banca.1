import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQuery } from '@tanstack/react-query';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';
import { superAdminCreateSubscriptionSchema, superAdminUpdateSubscriptionSchema, type SuperAdminCreateSubscription, type SuperAdminUpdateSubscription } from '@shared/schema';

type Restaurant = {
  id: string;
  name: string;
  email: string;
};

type SubscriptionPlan = {
  id: string;
  name: string;
  priceMonthlyKz: string;
  priceAnnualKz: string;
  priceMonthlyUsd: string;
  priceAnnualUsd: string;
};

type SubscriptionWithDetails = {
  id: string;
  planId: string;
  restaurantId: string;
  status: 'trial' | 'ativa' | 'cancelada' | 'suspensa' | 'expirada';
  billingInterval: 'mensal' | 'anual';
  currency: 'AOA' | 'USD';
  currentPeriodStart: string;
  currentPeriodEnd: string;
  plan: SubscriptionPlan;
  restaurant: Restaurant;
};

type DialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  restaurant: Restaurant | null;
  mode: 'create' | 'edit';
  subscriptionId?: string;
};

export function SuperAdminSubscriptionDialog({
  open,
  onOpenChange,
  restaurant,
  mode,
  subscriptionId,
}: DialogProps) {
  const { toast } = useToast();

  const { data: plans, isLoading: plansLoading } = useQuery<SubscriptionPlan[]>({
    queryKey: ['/api/subscription-plans'],
    enabled: open,
  });

  const { data: subscription, isLoading: subscriptionLoading } = useQuery<SubscriptionWithDetails>({
    queryKey: ['/api/superadmin/subscriptions', subscriptionId],
    enabled: open && mode === 'edit' && !!subscriptionId,
  });

  const createForm = useForm<SuperAdminCreateSubscription>({
    resolver: zodResolver(superAdminCreateSubscriptionSchema),
    defaultValues: {
      planId: '',
      billingInterval: 'mensal',
      currency: 'AOA',
      status: 'trial',
    },
  });

  const updateForm = useForm<SuperAdminUpdateSubscription>({
    resolver: zodResolver(superAdminUpdateSubscriptionSchema),
    defaultValues: {},
  });

  const form = mode === 'create' ? createForm : updateForm;

  useEffect(() => {
    if (!open) return;

    if (mode === 'edit' && subscription) {
      updateForm.reset({
        planId: subscription.planId,
        billingInterval: subscription.billingInterval,
        currency: subscription.currency,
        status: subscription.status,
      });
    } else if (mode === 'create') {
      createForm.reset({
        planId: '',
        billingInterval: 'mensal',
        currency: 'AOA',
        status: 'trial',
      });
    }
  }, [open, mode, subscription, createForm, updateForm]);

  const createMutation = useMutation({
    mutationFn: async (data: SuperAdminCreateSubscription) => {
      if (!restaurant?.id) throw new Error("Restaurante não fornecido");
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
    mutationFn: async (data: SuperAdminUpdateSubscription) => {
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

  const onSubmit = (data: SuperAdminCreateSubscription | SuperAdminUpdateSubscription) => {
    if (mode === 'create') {
      createMutation.mutate(data as SuperAdminCreateSubscription);
    } else {
      const cleanData = Object.fromEntries(
        Object.entries(data).filter(([_, value]) => value !== undefined && value !== '')
      ) as SuperAdminUpdateSubscription;
      
      if (Object.keys(cleanData).length === 0) {
        onOpenChange(false);
        return;
      }
      
      updateMutation.mutate(cleanData);
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
          <Form {...(form as any)}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control as any}
                name="planId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Plano *</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      value={field.value as string | undefined}
                      disabled={isPending}
                    >
                      <FormControl>
                        <SelectTrigger data-testid="select-plan">
                          <SelectValue placeholder="Selecione um plano" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {plans?.map((plan) => (
                          <SelectItem key={plan.id} value={plan.id}>
                            {plan.name} - {plan.priceMonthlyKz ? parseFloat(plan.priceMonthlyKz).toLocaleString('pt-AO') : '0'} Kz/mês
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control as any}
                name="billingInterval"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Intervalo de Faturamento *</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      value={field.value}
                      disabled={isPending}
                    >
                      <FormControl>
                        <SelectTrigger data-testid="select-billing-interval">
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="mensal">Mensal</SelectItem>
                        <SelectItem value="anual">Anual</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control as any}
                name="currency"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Moeda *</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      value={field.value}
                      disabled={isPending}
                    >
                      <FormControl>
                        <SelectTrigger data-testid="select-currency">
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="AOA">Kwanza (AOA)</SelectItem>
                        <SelectItem value="USD">Dólar (USD)</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {mode === 'edit' && (
                <FormField
                  control={form.control as any}
                  name="status"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Status</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        value={field.value}
                        disabled={isPending}
                      >
                        <FormControl>
                          <SelectTrigger data-testid="select-status">
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="trial">Trial</SelectItem>
                          <SelectItem value="ativa">Ativa</SelectItem>
                          <SelectItem value="suspensa">Suspensa</SelectItem>
                          <SelectItem value="expirada">Expirada</SelectItem>
                          <SelectItem value="cancelada">Cancelada</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}

              <div className="flex justify-end gap-2 pt-4">
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
                  {isPending ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      {mode === 'create' ? 'Criando...' : 'Salvando...'}
                    </>
                  ) : (
                    mode === 'create' ? 'Criar Subscrição' : 'Salvar Alterações'
                  )}
                </Button>
              </div>
            </form>
          </Form>
        )}
      </DialogContent>
    </Dialog>
  );
}
