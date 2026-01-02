/**
 * Hook para validar encerramento de sessão
 * Previne perda de receita e erros operacionais
 */

import { useQuery } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';

export interface SessionValidationResult {
  canClose: boolean;
  reason?: 'pending_payment' | 'active_orders' | 'unsaved_changes';
  message: string;
  details?: {
    totalAmount?: number;
    paidAmount?: number;
    pendingAmount?: number;
    activeOrdersCount?: number;
    activeOrders?: Array<{
      id: string;
      orderNumber: string;
      status: string;
    }>;
  };
  actions: Array<'pay_now' | 'wait' | 'cancel_orders' | 'force_close'>;
}

interface UseSessionValidationProps {
  tableId: string | undefined;
  enabled?: boolean;
}

export function useSessionValidation({ tableId, enabled = true }: UseSessionValidationProps) {
  return useQuery<SessionValidationResult>({
    queryKey: [`/api/tables/${tableId}/validate-close`],
    queryFn: async () => {
      if (!tableId) {
        return {
          canClose: false,
          message: 'Mesa não encontrada',
          actions: [],
        };
      }

      // 1. Buscar dados da mesa
      const tableResponse = await apiRequest('GET', `/api/tables/${tableId}`);
      const table = await tableResponse.json();

      if (table.status === 'livre') {
        return {
          canClose: true,
          message: 'Mesa livre, pode ser fechada',
          actions: [],
        };
      }

      // 2. Buscar pedidos e totais
      const ordersResponse = await apiRequest('GET', `/api/tables/${tableId}/orders-by-guest`);
      const ordersData = await ordersResponse.json();

      const totalAmount = parseFloat(ordersData.totalAmount || '0');
      const paidAmount = parseFloat(ordersData.paidAmount || '0');
      const pendingAmount = totalAmount - paidAmount;

      // 3. Verificar pagamentos pendentes
      if (pendingAmount > 0.01) { // Tolerar diferenças de centavos
        return {
          canClose: false,
          reason: 'pending_payment',
          message: `Ainda há ${pendingAmount.toLocaleString('pt-AO', { style: 'currency', currency: 'AOA' })} por pagar`,
          details: {
            totalAmount,
            paidAmount,
            pendingAmount,
          },
          actions: ['pay_now', 'force_close'],
        };
      }

      // 4. Verificar pedidos ativos (não entregues)
      const allOrders = [
        ...(ordersData.ordersByGuest || []).flatMap((og: any) => og.orders || []),
        ...(ordersData.anonymousOrders || []),
      ];

      const activeOrders = allOrders.filter(
        (order: any) => order.status !== 'delivered' && order.status !== 'cancelled'
      );

      if (activeOrders.length > 0) {
        return {
          canClose: false,
          reason: 'active_orders',
          message: `Há ${activeOrders.length} pedido(s) ainda em preparação ou pendente`,
          details: {
            activeOrdersCount: activeOrders.length,
            activeOrders: activeOrders.map((o: any) => ({
              id: o.id,
              orderNumber: o.orderNumber || o.id.slice(0, 8),
              status: o.status,
            })),
          },
          actions: ['wait', 'cancel_orders', 'force_close'],
        };
      }

      // 5. Tudo OK, pode fechar
      return {
        canClose: true,
        message: 'Sessão pode ser encerrada com segurança',
        details: {
          totalAmount,
          paidAmount,
          pendingAmount: 0,
          activeOrdersCount: 0,
        },
        actions: [],
      };
    },
    enabled: enabled && !!tableId,
    // Não cachear para sempre ter dados frescos
    staleTime: 0,
    gcTime: 0,
  });
}
