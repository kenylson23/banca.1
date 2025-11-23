import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation } from '@tanstack/react-query';
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
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Loader2 } from 'lucide-react';
import { updateSubscriptionPlanSchema, type UpdateSubscriptionPlan, type SubscriptionPlan } from '@shared/schema';

type DialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  plan: SubscriptionPlan | null;
};

export function PlanManagementDialog({
  open,
  onOpenChange,
  plan,
}: DialogProps) {
  const { toast } = useToast();

  const form = useForm<UpdateSubscriptionPlan>({
    resolver: zodResolver(updateSubscriptionPlanSchema),
  });

  useEffect(() => {
    if (open && plan) {
      form.reset({
        name: plan.name,
        description: plan.description || '',
        priceMonthlyKz: plan.priceMonthlyKz,
        priceAnnualKz: plan.priceAnnualKz,
        priceMonthlyUsd: plan.priceMonthlyUsd,
        priceAnnualUsd: plan.priceAnnualUsd,
        trialDays: plan.trialDays,
        maxBranches: plan.maxBranches,
        maxTables: plan.maxTables,
        maxMenuItems: plan.maxMenuItems,
        maxOrdersPerMonth: plan.maxOrdersPerMonth,
        maxUsers: plan.maxUsers,
        historyRetentionDays: plan.historyRetentionDays,
        isActive: plan.isActive,
        displayOrder: plan.displayOrder,
      });
    }
  }, [open, plan, form]);

  const updateMutation = useMutation({
    mutationFn: async (data: UpdateSubscriptionPlan) => {
      if (!plan) {
        throw new Error('Plano não selecionado');
      }
      return await apiRequest('PATCH', `/api/superadmin/subscription-plans/${plan.id}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/subscription-plans'] });
      toast({
        title: "Plano atualizado",
        description: "O plano foi atualizado com sucesso.",
      });
      onOpenChange(false);
    },
    onError: (error: any) => {
      toast({
        title: "Erro ao atualizar plano",
        description: error.message || "Erro ao atualizar plano",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: UpdateSubscriptionPlan) => {
    updateMutation.mutate(data);
  };

  return (
    <Dialog open={open && !!plan} onOpenChange={onOpenChange}>
      {plan && (
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Editar Plano: {plan.name}</DialogTitle>
            <DialogDescription>
              Modifique os detalhes e limites do plano de subscrição
            </DialogDescription>
          </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nome do Plano</FormLabel>
                    <FormControl>
                      <Input {...field} data-testid="input-plan-name" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="displayOrder"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Ordem de Exibição</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        {...field}
                        value={field.value ?? ''}
                        onChange={(e) => field.onChange(e.target.value ? parseInt(e.target.value) : undefined)}
                        data-testid="input-display-order" 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Descrição</FormLabel>
                  <FormControl>
                    <Textarea {...field} data-testid="textarea-description" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="space-y-4">
              <h3 className="font-semibold">Preços</h3>
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="priceMonthlyKz"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Preço Mensal (Kz)</FormLabel>
                      <FormControl>
                        <Input {...field} data-testid="input-price-monthly-kz" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="priceAnnualKz"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Preço Anual (Kz)</FormLabel>
                      <FormControl>
                        <Input {...field} data-testid="input-price-annual-kz" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="priceMonthlyUsd"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Preço Mensal (USD)</FormLabel>
                      <FormControl>
                        <Input {...field} data-testid="input-price-monthly-usd" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="priceAnnualUsd"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Preço Anual (USD)</FormLabel>
                      <FormControl>
                        <Input {...field} data-testid="input-price-annual-usd" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="font-semibold">Limites do Plano</h3>
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="trialDays"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Dias de Trial</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          {...field}
                          value={field.value ?? ''}
                          onChange={(e) => field.onChange(e.target.value ? parseInt(e.target.value) : undefined)}
                          data-testid="input-trial-days" 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="maxBranches"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Máximo de Filiais</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          {...field}
                          value={field.value ?? ''}
                          onChange={(e) => field.onChange(e.target.value ? parseInt(e.target.value) : undefined)}
                          data-testid="input-max-branches" 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="maxTables"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Máximo de Mesas</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          {...field}
                          value={field.value ?? ''}
                          onChange={(e) => field.onChange(e.target.value ? parseInt(e.target.value) : undefined)}
                          data-testid="input-max-tables" 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="maxMenuItems"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Máximo de Produtos</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          {...field}
                          value={field.value ?? ''}
                          onChange={(e) => field.onChange(e.target.value ? parseInt(e.target.value) : undefined)}
                          data-testid="input-max-menu-items" 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="maxOrdersPerMonth"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Máximo de Pedidos/Mês</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          {...field}
                          value={field.value ?? ''}
                          onChange={(e) => field.onChange(e.target.value ? parseInt(e.target.value) : undefined)}
                          data-testid="input-max-orders" 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="maxUsers"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Máximo de Usuários</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          {...field}
                          value={field.value ?? ''}
                          onChange={(e) => field.onChange(e.target.value ? parseInt(e.target.value) : undefined)}
                          data-testid="input-max-users" 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="historyRetentionDays"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Retenção de Histórico (dias)</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          {...field}
                          value={field.value ?? ''}
                          onChange={(e) => field.onChange(e.target.value ? parseInt(e.target.value) : undefined)}
                          data-testid="input-history-retention" 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            <FormField
              control={form.control}
              name="isActive"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <FormLabel className="text-base">Plano Ativo</FormLabel>
                    <FormDescription>
                      Quando desativado, este plano não estará disponível para novos registros
                    </FormDescription>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value === 1}
                      onCheckedChange={(checked) => field.onChange(checked ? 1 : 0)}
                      data-testid="switch-is-active"
                    />
                  </FormControl>
                </FormItem>
              )}
            />

            <div className="flex justify-end gap-2 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={updateMutation.isPending}
                data-testid="button-cancel"
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                disabled={updateMutation.isPending}
                data-testid="button-submit"
              >
                {updateMutation.isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Salvando...
                  </>
                ) : (
                  'Salvar Alterações'
                )}
              </Button>
            </div>
          </form>
        </Form>
        </DialogContent>
      )}
    </Dialog>
  );
}
