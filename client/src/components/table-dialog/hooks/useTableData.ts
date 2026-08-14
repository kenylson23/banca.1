import { useQuery } from '@tanstack/react-query';
import { useMemo } from 'react';

interface UseTableDataProps {
  tableId: string | undefined;
  isOpen: boolean;
}

export function useTableData({ tableId, isOpen }: UseTableDataProps) {
  // Query table data first to get currentSessionId
  const { data: tableData } = useQuery<any>({
    queryKey: [`/api/tables/${tableId}`],
    enabled: isOpen && !!tableId,
    refetchOnMount: true,
    refetchOnWindowFocus: false,
    staleTime: 30000,
    gcTime: 5 * 60 * 1000,
    refetchInterval: isOpen ? 30000 : false, // Fallback a cada 30s (WebSocket cobre updates em tempo real)
  });

  // Query: Orders by Guest (unified data)
  const { data: ordersByGuestData, isLoading: ordersLoading } = useQuery<{
    ordersByGuest: Array<{ guest: any; orders: any[]; subtotal: string }>;
    anonymousOrders: any[];
    totalAmount: string;
    paidAmount: string;
    currentSessionId?: string;
  }>({
    queryKey: [`/api/tables/${tableId}/orders-by-guest`],
    enabled: isOpen && !!tableId,
    refetchOnMount: true,
    refetchOnWindowFocus: false,
    staleTime: 30000,
    gcTime: 5 * 60 * 1000,
    refetchInterval: isOpen ? 30000 : false, // Fallback a cada 30s (WebSocket cobre updates em tempo real)
  });

  // Extract paidAmount from ordersByGuestData
  const sessionPaidAmount = useMemo(() => {
    if (ordersByGuestData?.paidAmount) {
      return parseFloat(ordersByGuestData.paidAmount);
    }
    return 0;
  }, [ordersByGuestData]);

  // Use currentSessionId from table data (most reliable)
  const currentSessionId = tableData?.currentSessionId || ordersByGuestData?.currentSessionId;

  // Query: All guests from session (including those without orders)
  const { data: allSessionGuests = [] } = useQuery<any[]>({
    queryKey: [`/api/table-sessions/${currentSessionId}/guests`],
    enabled: isOpen && !!currentSessionId,
    refetchOnMount: true,
    refetchOnWindowFocus: false,
    staleTime: 30000,
    gcTime: 5 * 60 * 1000,
    refetchInterval: isOpen && currentSessionId ? 30000 : false, // Fallback a cada 30s (WebSocket cobre updates em tempo real)
  });

  // Extract guests - prioritize allSessionGuests to show guests without orders
  const guests = useMemo(() => {
    // Use all session guests if available (includes guests without orders)
    if (allSessionGuests && allSessionGuests.length > 0) {
      return allSessionGuests;
    }
    // Fallback to guests from orders (only guests with orders)
    if (!ordersByGuestData?.ordersByGuest) {
      return [];
    }
    return ordersByGuestData.ordersByGuest.map((og: any) => og.guest);
  }, [allSessionGuests, ordersByGuestData]);

  // Flatten all orders
  const tableOrders = useMemo(() => {
    if (!ordersByGuestData) return [];
    
    const ordersFromGuests = (ordersByGuestData.ordersByGuest || [])
      .flatMap((og: any) => og.orders || []);
    
    const anonymousOrders = ordersByGuestData.anonymousOrders || [];
    
    return [...ordersFromGuests, ...anonymousOrders];
  }, [ordersByGuestData]);

  // Calculate totals
  const totalAmount = useMemo(() => {
    let backendTotal = 0;
    if (ordersByGuestData?.totalAmount) {
      backendTotal = parseFloat(ordersByGuestData.totalAmount);
    } else {
      backendTotal = tableOrders.reduce((sum: number, order: any) => {
        const orderTotal = order.totalPrice ? parseFloat(order.totalPrice) : 0;
        return sum + orderTotal;
      }, 0);
    }

    // 🔧 FIX: Garantir coerência matemática mesmo para sessões existentes
    // O total nunca pode ser menor que a soma dos subtotais individuais
    const sumOfSubtotals = (ordersByGuestData?.ordersByGuest || []).reduce(
      (sum: number, og: any) => sum + parseFloat(og.subtotal || '0'),
      0
    );

    return Math.max(backendTotal, sumOfSubtotals);
  }, [ordersByGuestData, tableOrders]);

  const totalOrders = tableOrders.length;
  // Contar todos os guests da sessão, não apenas os com status 'active'
  const activeGuests = guests.length;

  return {
    tableData,
    ordersByGuestData,
    guests,
    tableOrders,
    totalAmount,
    sessionPaidAmount, // ✅ NEW: Return paidAmount from session
    totalOrders,
    activeGuests,
    isLoading: ordersLoading,
  };
}
