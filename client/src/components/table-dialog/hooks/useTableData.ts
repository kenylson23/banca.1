import { useQuery } from '@tanstack/react-query';
import { useMemo } from 'react';

interface UseTableDataProps {
  tableId: string | undefined;
  isOpen: boolean;
}

export function useTableData({ tableId, isOpen }: UseTableDataProps) {
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
  });

  // Query: All guests from session (including those without orders)
  const { data: allSessionGuests = [] } = useQuery<any[]>({
    queryKey: [`/api/table-sessions/${ordersByGuestData?.currentSessionId}/guests`],
    enabled: isOpen && !!ordersByGuestData?.currentSessionId,
  });

  // Extract guests - prioritize allSessionGuests to show guests without orders
  const guests = useMemo(() => {
    // Use all session guests if available (includes guests without orders)
    if (allSessionGuests && allSessionGuests.length > 0) {
      return allSessionGuests;
    }
    // Fallback to guests from orders (only guests with orders)
    if (!ordersByGuestData?.ordersByGuest) return [];
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
    if (ordersByGuestData?.totalAmount) {
      return parseFloat(ordersByGuestData.totalAmount);
    }
    return tableOrders.reduce((sum: number, order: any) => {
      const orderTotal = order.totalPrice ? parseFloat(order.totalPrice) : 0;
      return sum + orderTotal;
    }, 0);
  }, [ordersByGuestData, tableOrders]);

  const totalOrders = tableOrders.length;
  // Contar todos os guests da sessão, não apenas os com status 'active'
  const activeGuests = guests.length;

  return {
    ordersByGuestData,
    guests,
    tableOrders,
    totalAmount,
    totalOrders,
    activeGuests,
    isLoading: ordersLoading,
  };
}
