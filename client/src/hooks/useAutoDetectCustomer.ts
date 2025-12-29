import { useEffect } from 'react';
import { useCustomerAuth } from '@/contexts/CustomerAuthContext';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';

/**
 * Hook para auto-detecção de clientes quando escaneiam QR Code
 * Se o cliente está autenticado, automaticamente vincula ele à mesa
 */
export function useAutoDetectCustomer(tableId: string | undefined, sessionId: string | undefined) {
  const { isAuthenticated, customer } = useCustomerAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const autoLinkMutation = useMutation({
    mutationFn: async () => {
      if (!tableId || !sessionId || !customer) return;
      
      // Check if customer is already linked to this session
      const guestsResponse = await apiRequest('GET', `/api/tables/${tableId}/guests`, {});
      const guests = await guestsResponse.json();
      
      const alreadyLinked = guests.some((g: any) => g.customerId === customer.id);
      if (alreadyLinked) {
        return { alreadyLinked: true };
      }
      
      // Link customer to table as guest
      const response = await apiRequest('POST', `/api/tables/${tableId}/guests`, {
        sessionId,
        customerId: customer.id,
        name: customer.name,
      });
      
      return response.json();
    },
    onSuccess: (data) => {
      if (data && !data.alreadyLinked) {
        queryClient.invalidateQueries({ queryKey: [`/api/tables/${tableId}/guests`] });
        toast({
          title: `Bem-vindo, ${customer?.name}! 🎉`,
          description: 'Você foi adicionado à mesa automaticamente. Pode fazer pedidos e ganhar pontos!',
        });
      }
    },
    onError: () => {
      // Silently fail - não queremos interromper a experiência do usuário
      console.log('Auto-link failed, user can still use the menu');
    },
  });

  useEffect(() => {
    if (isAuthenticated && customer && tableId && sessionId) {
      // Auto-link customer to table after a short delay
      const timer = setTimeout(() => {
        autoLinkMutation.mutate();
      }, 1000);
      
      return () => clearTimeout(timer);
    }
  }, [isAuthenticated, customer?.id, tableId, sessionId]);

  return {
    isLinking: autoLinkMutation.isPending,
  };
}
