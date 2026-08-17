import { useQueryClient } from '@tanstack/react-query';

export function useTableInvalidations(tableId?: string) {
  const queryClient = useQueryClient();

  const invalidateTableData = () => {
    if (!tableId) return;

    const tableKeys = [
      `/api/tables/${tableId}`,
      `/api/tables/${tableId}/orders-by-guest`,
      `/api/tables/${tableId}/guests`,
    ];

    tableKeys.forEach(key => {
      queryClient.invalidateQueries({ queryKey: [key] });
    });

    queryClient.invalidateQueries({ queryKey: ['/api/tables'] });
    queryClient.invalidateQueries({ queryKey: ['/api/tables/with-orders'] });
    queryClient.invalidateQueries({ queryKey: ['/api/orders'] });
  };

  const invalidateSessionData = (sessionId?: string) => {
    if (!sessionId) return;
    queryClient.invalidateQueries({ queryKey: [`/api/table-sessions/${sessionId}`] });
  };

  const invalidateAll = (sessionId?: string) => {
    invalidateTableData();
    invalidateSessionData(sessionId);
  };

  return {
    invalidateTableData,
    invalidateSessionData,
    invalidateAll,
  };
}

// Backward-compatible helpers for existing callers
export async function invalidateAfterGuestAdded(queryClient: any, tableId?: string) {
  if (!tableId) return;
  
  queryClient.invalidateQueries({ queryKey: [`/api/tables/${tableId}`] });
  queryClient.invalidateQueries({ queryKey: [`/api/tables/${tableId}/orders-by-guest`] });
  queryClient.invalidateQueries({ queryKey: [`/api/tables/${tableId}/guests`] });
  queryClient.invalidateQueries({ queryKey: ['/api/tables'] });
  queryClient.invalidateQueries({ queryKey: ['/api/tables/with-orders'] });
  queryClient.invalidateQueries({ queryKey: ['/api/orders'] });
}

export async function invalidateAfterPayment(queryClient: any, tableId?: string) {
  if (!tableId) return;
  
  queryClient.invalidateQueries({ queryKey: [`/api/tables/${tableId}`] });
  queryClient.invalidateQueries({ queryKey: [`/api/tables/${tableId}/orders-by-guest`] });
  queryClient.invalidateQueries({ queryKey: [`/api/tables/${tableId}/guests`] });
  queryClient.invalidateQueries({ queryKey: ['/api/tables'] });
  queryClient.invalidateQueries({ queryKey: ['/api/tables/with-orders'] });
}
