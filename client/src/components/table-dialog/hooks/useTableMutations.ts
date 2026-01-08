import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';

interface UseTableMutationsProps {
  tableId: string | undefined;
}

export function useTableMutations({ tableId }: UseTableMutationsProps) {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  // Helper to invalidate queries
  const invalidateTableQueries = () => {
    // Dados principais da mesa e pedidos
    queryClient.invalidateQueries({ queryKey: [`/api/tables/${tableId}/orders-by-guest`] });
    queryClient.invalidateQueries({ queryKey: ['/api/tables'] });
    queryClient.invalidateQueries({ queryKey: ['/api/tables/with-orders'] });
    queryClient.invalidateQueries({ queryKey: ['/api/orders'] });

    // Garantir atualização da lista de pessoas da sessão atual
    // Observação: useTableData usa /api/table-sessions/{sessionId}/guests
    queryClient.invalidateQueries({
      predicate: (q) => {
        const key = q.queryKey?.[0];
        return typeof key === 'string' && key.startsWith('/api/table-sessions/');
      },
    });
  };

  // Cancel Order
  const cancelOrderMutation = useMutation({
    mutationFn: async (orderId: string) => {
      const response = await apiRequest('PATCH', `/api/orders/${orderId}`, {
        status: 'cancelled',
      });
      return response.json();
    },
    onSuccess: () => {
      invalidateTableQueries();
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

  // Update Order Item
  const updateOrderItemMutation = useMutation({
    mutationFn: async ({ itemId, quantity }: { itemId: string; quantity: number }) => {
      const response = await apiRequest('PATCH', `/api/order-items/${itemId}`, { quantity });
      return response.json();
    },
    onSuccess: () => {
      invalidateTableQueries();
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

  // Remove Order Item
  const removeOrderItemMutation = useMutation({
    mutationFn: async (itemId: string) => {
      const response = await apiRequest('DELETE', `/api/order-items/${itemId}`);
      return response.json();
    },
    onSuccess: () => {
      invalidateTableQueries();
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

  // Move Item
  const moveItemMutation = useMutation({
    mutationFn: async ({ itemId, targetGuestId }: { itemId: string; targetGuestId: string | null }) => {
      const response = await apiRequest('PATCH', `/api/order-items/${itemId}/move`, {
        guestId: targetGuestId,
      });
      return response.json();
    },
    onSuccess: () => {
      invalidateTableQueries();
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

  // Add Guest
  const addGuestMutation = useMutation({
    mutationFn: async ({ type, name, customerId }: { type: 'anonymous' | 'customer'; name?: string; customerId?: string }) => {
      const response = await apiRequest('POST', `/api/tables/${tableId}/guests`, {
        name,
        customerId,
      });
      return response.json();
    },
    onSuccess: async () => {
      console.log('🎉 [AddGuest] Pessoa adicionada, atualizando dados...');
      
      // 1. Invalidar todas as queries relacionadas
      invalidateTableQueries();
      
      // 2. Forçar refetch imediato
      await Promise.all([
        queryClient.refetchQueries({ 
          queryKey: [`/api/tables/${tableId}/orders-by-guest`] 
        }),
        queryClient.refetchQueries({ 
          queryKey: ['/api/tables'] 
        }),
        queryClient.refetchQueries({
          predicate: (q) => {
            const key = q.queryKey?.[0];
            return typeof key === 'string' && key.startsWith('/api/table-sessions/');
          },
        }),
      ]);
      
      console.log('✅ [AddGuest] Dados atualizados!');
      
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

  // Remove Guest
  const removeGuestMutation = useMutation({
    mutationFn: async (guestId: string) => {
      const response = await apiRequest('DELETE', `/api/table-guests/${guestId}`);
      return response.json();
    },
    onSuccess: async () => {
      console.log('🎉 [RemoveGuest] Pessoa removida, atualizando dados...');
      
      // 1. Invalidar todas as queries relacionadas
      invalidateTableQueries();
      
      // 2. Forçar refetch imediato
      await Promise.all([
        queryClient.refetchQueries({ 
          queryKey: [`/api/tables/${tableId}/orders-by-guest`] 
        }),
        queryClient.refetchQueries({ 
          queryKey: ['/api/tables'] 
        }),
        queryClient.refetchQueries({
          predicate: (q) => {
            const key = q.queryKey?.[0];
            return typeof key === 'string' && key.startsWith('/api/table-sessions/');
          },
        }),
      ]);
      
      console.log('✅ [RemoveGuest] Dados atualizados!');
      
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

  // Start Session
  const startSessionMutation = useMutation({
    mutationFn: async (numberOfGuests: number) => {
      const response = await apiRequest('POST', `/api/tables/${tableId}/start-session`, {
        numberOfGuests,
      });
      return response.json();
    },
    onSuccess: async () => {
      console.log('🎉 [StartSession] Sessão iniciada, atualizando dados...');
      
      // 1. Invalidar todas as queries relacionadas
      invalidateTableQueries();
      
      // 2. Forçar refetch imediato das queries críticas
      await Promise.all([
        queryClient.refetchQueries({ 
          queryKey: [`/api/tables/${tableId}/orders-by-guest`] 
        }),
        queryClient.refetchQueries({ 
          queryKey: ['/api/tables'] 
        }),
        queryClient.refetchQueries({ 
          queryKey: ['/api/tables/with-orders'] 
        }),
        // Refetch de todas as queries de sessões
        queryClient.refetchQueries({
          predicate: (q) => {
            const key = q.queryKey?.[0];
            return typeof key === 'string' && key.startsWith('/api/table-sessions/');
          },
        }),
      ]);
      
      console.log('✅ [StartSession] Dados atualizados!');
      
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

  // End Session
  const endSessionMutation = useMutation({
    mutationFn: async (forceClose: boolean = false) => {
      const response = await apiRequest('POST', `/api/tables/${tableId}/close-session`, { forceClose });
      return response.json();
    },
    onSuccess: async () => {
      console.log('🎉 [EndSession] Sessão encerrada, atualizando dados...');
      
      // 1. Invalidar todas as queries relacionadas
      invalidateTableQueries();
      
      // 2. Forçar refetch imediato
      await Promise.all([
        queryClient.refetchQueries({ 
          queryKey: [`/api/tables/${tableId}/orders-by-guest`] 
        }),
        queryClient.refetchQueries({ 
          queryKey: ['/api/tables'] 
        }),
        queryClient.refetchQueries({ 
          queryKey: ['/api/tables/with-orders'] 
        }),
        queryClient.refetchQueries({
          predicate: (q) => {
            const key = q.queryKey?.[0];
            return typeof key === 'string' && key.startsWith('/api/table-sessions/');
          },
        }),
      ]);
      
      console.log('✅ [EndSession] Dados atualizados!');
      
      toast({ 
        title: 'Sessão encerrada',
        description: 'Mesa fechada com sucesso.',
      });
    },
    onError: (error: any) => {
      // Handle validation errors for pending payments
      if (error.status === 400 && error.pendingAmount) {
        const guestsList = error.unpaidGuests?.length > 0
          ? error.unpaidGuests.map((g: any) => `${g.name}: ${g.pending} Kz`).join(', ')
          : '';
        
        toast({
          title: 'Atenção: Valores Pendentes',
          description: `Mesa possui ${error.pendingAmount} Kz pendente de pagamento. ${guestsList}`,
          variant: 'destructive',
        });
        
        // If user can force close, show a follow-up message
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
