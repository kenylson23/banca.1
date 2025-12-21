import { useState, useEffect, useCallback } from 'react';

export interface StoredOrder {
  id: string;
  orderNumber?: string;
  customerName: string;
  orderType: string;
  status: string;
  totalAmount: string;
  createdAt: string;
  items: Array<{
    name: string;
    quantity: number;
    price: string;
  }>;
}

/**
 * Hook para gerenciar histórico de pedidos
 * Persiste no localStorage (últimos 20 pedidos)
 */
export const useOrderHistory = (restaurantSlug: string) => {
  const storageKey = `orderHistory_${restaurantSlug}`;
  
  const loadOrders = useCallback(() => {
    if (typeof window === 'undefined') return [];
    try {
      const stored = localStorage.getItem(storageKey);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  }, [storageKey]);
  
  const [orders, setOrders] = useState<StoredOrder[]>(loadOrders);

  useEffect(() => {
    setOrders(loadOrders());
  }, [storageKey, loadOrders]);

  const addOrder = useCallback((order: StoredOrder) => {
    setOrders(prev => {
      const newOrders = [order, ...prev].slice(0, 20); // Keep only last 20
      localStorage.setItem(storageKey, JSON.stringify(newOrders));
      return newOrders;
    });
  }, [storageKey]);

  const clearHistory = useCallback(() => {
    setOrders([]);
    localStorage.removeItem(storageKey);
  }, [storageKey]);

  return { orders, addOrder, clearHistory };
};
