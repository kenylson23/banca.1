// Shared TypeScript types for the application

/**
 * Data structure returned by /api/tables/:id/orders-by-guest endpoint
 * Used by both TableDetailsDialog and Checkout components
 */
export interface OrdersByGuestData {
  ordersByGuest: Array<{
    guest: {
      id: string;
      sessionId: string;
      tableId: string;
      name: string | null;
      customerId: string | null;
      guestNumber: number;
      seatNumber: number;
      status: string;
      subtotal: string;
      paidAmount: string;
      // Ajustes individuais (por convidado)
      discount?: string;
      discountType?: 'valor' | 'percentual';
      serviceCharge?: string;
      serviceChargeType?: 'valor' | 'percentual';
      /** Total final do convidado (subtotal + taxa - desconto), calculado no backend */
      guestTotal?: string;
      joinedAt: Date;
      createdAt: Date;
      updatedAt: Date;
    };
    orders: Array<{
      id: string;
      orderNumber: string;
      restaurantId: string;
      tableId: string;
      guestId: string | null;
      status: string;
      totalPrice: string;
      createdAt: Date;
      items?: Array<{
        id: string;
        orderId: string;
        menuItemId: string;
        name: string;
        price: string;
        quantity: number;
        menuItem?: {
          id: string;
          name: string;
          description?: string;
          price: string;
          imageUrl?: string;
          category?: string;
        };
        options?: Array<{
          id: string;
          name: string;
          value: string;
        }>;
      }>;
    }>;
    subtotal: string;
  }>;
  anonymousOrders: Array<{
    id: string;
    orderNumber: string;
    restaurantId: string;
    tableId: string;
    guestId: string | null;
    status: string;
    totalPrice: string;
    createdAt: Date;
    items?: Array<{
      id: string;
      orderId: string;
      menuItemId: string;
      name: string;
      price: string;
      quantity: number;
    }>;
  }>;
  totalAmount: string;
  paidAmount: string;
}
