import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import { useTableInvalidations } from '@/lib/tableInvalidations';

interface UseTableMutationsProps {
  tableId: string | undefined;
}

export function useTableMutations({ tableId }: UseTableMutationsProps) {
  const { toast } = useToast();
  const { invalidateAll } = useTableInvalidations(tableId);

  const cancelOrderMutation = useMutation({
    mutationFn: async (orderId: string) => {
      const response = await apiRequest('PATCH', `/api/orders/${orderId}`, {
        status: 'cancelled',
      });
      return response.json();
    },
    onSuccess: () => {
      invalidateAll();
      toast({ title: 'Pedido cancelado com sucesso' });
    },
    onError: (error: any) => {
      toast({
        title: 'Erro ao cancelar pedido',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  const updateOrderItemMutation = useMutation({
    mutationFn: async ({ itemId, quantity }: { itemId: string; quantity: number }) => {
      const response = await apiRequest('PATCH', `/api/order-items/${itemId}`, { quantity });
      return response.json();
    },
    onSuccess: () => {
      invalidateAll();
      toast({ title: 'Item atualizado' });
    },
    onError: (error: any) => {
      toast({
        title: 'Erro ao atualizar item',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  const removeOrderItemMutation = useMutation({
    mutationFn: async (itemId: string) => {
      const response = await apiRequest('DELETE', `/api/order-items/${itemId}`);
      return response.json();
    },
    onSuccess: () => {
      invalidateAll();
      toast({ title: 'Item removido' });
    },
    onError: (error: any) => {
      toast({
        title: 'Erro ao remover item',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  const moveItemMutation = useMutation({
    mutationFn: async ({ itemId, targetGuestId }: { itemId: string; targetGuestId: string | null }) => {
      const response = await apiRequest('PATCH', `/api/order-items/${itemId}/move`, {
        guestId: targetGuestId,
      });
      return response.json();
    },
    onSuccess: () => {
      invalidateAll();
      toast({ title: 'Item movido com sucesso' });
    },
    onError: (error: any) => {
      toast({
        title: 'Erro ao mover item',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  const addGuestMutation = useMutation({
    mutationFn: async ({ type, name, customerId }: { type: 'anonymous' | 'customer'; name?: string; customerId?: string }) => {
      const response = await apiRequest('POST', `/api/tables/${tableId}/guests`, {
        name,
        customerId,
      });
      return response.json();
    },
    onSuccess: () => {
      invalidateAll();
      toast({ title: 'Pessoa adicionada' });
    },
    onError: (error: any) => {
      toast({
        title: 'Erro ao adicionar pessoa',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  const removeGuestMutation = useMutation({
    mutationFn: async (guestId: string) => {
      const response = await apiRequest('DELETE', `/api/table-guests/${guestId}`);
      return response.json();
    },
    onSuccess: () => {
      invalidateAll();
      toast({ title: 'Pessoa removida' });
    },
    onError: (error: any) => {
      toast({
        title: 'Erro ao remover pessoa',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  const startSessionMutation = useMutation({
    mutationFn: async (numberOfGuests: number) => {
      const response = await apiRequest('POST', `/api/tables/${tableId}/start-session`, {
        numberOfGuests,
      });
      return response.json();
    },
    onSuccess: () => {
      invalidateAll();
      toast({
        title: 'Sessão iniciada',
        description: 'Mesa aberta com sucesso.',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Erro ao iniciar sessão',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  const endSessionMutation = useMutation({
    mutationFn: async (forceClose: boolean = false) => {
      const response = await apiRequest('POST', `/api/tables/${tableId}/close-session`, { forceClose });
      return response.json();
    },
    onSuccess: () => {
      invalidateAll();
      toast({
        title: 'Sessão encerrada',
        description: 'Mesa fechada com sucesso.',
      });
    },
    onError: (error: any) => {
      if (error.status === 400 && error.pendingAmount) {
        const guestsList = error.unpaidGuests?.length > 0
          ? error.unpaidGuests.map((g: any) => `${g.name}: ${g.pending} Kz`).join(', ')
          : '';

        toast({
          title: 'Atenção: Valores Pendentes',
          description: `Mesa possui ${error.pendingAmount} Kz pendente de pagamento. ${guestsList}`,
          variant: 'destructive',
        });

        if (error.canForceClose) {
          console.warn('User can force close. Implement force close dialog if needed.');
        }
      } else {
        toast({
          title: 'Erro ao encerrar sessão',
          description: error.message || 'Não foi possível encerrar a sessão.',
          variant: 'destructive',
        });
      }
    },
  });

  return {
    cancelOrderMutation,
    updateOrderItemMutation,
    removeOrderItemMutation,
    moveItemMutation,
    addGuestMutation,
    removeGuestMutation,
    startSessionMutation,
    endSessionMutation,
  };
}
