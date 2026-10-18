export type PDVOrder = {
  id: string;
  orderNumber?: string | null;
  status: string;
  paymentStatus: string;
  orderType: string;
  createdAt?: string | Date | null;
  customer?: {
    name?: string | null;
    phone?: string | null;
    email?: string | null;
    tier?: string | null;
    loyaltyPoints?: number;
  } | null;
  customerName?: string | null;
  customerPhone?: string | null;
  table?: { number?: string | number | null } | null;
  orderItems: Array<{
    id: string;
    quantity: number;
    price: string | number;
    notes?: string | null;
    menuItem?: { name?: string | null } | null;
  }>;
  deliveryAddress?: string | null;
  orderNotes?: string | null;
  subtotal: string | number;
  discount?: string | number | null;
  discountType?: string | null;
  serviceCharge?: string | number | null;
  serviceName?: string | null;
  deliveryFee?: string | number | null;
  packagingFee?: string | number | null;
  totalAmount: string | number;
  paymentMethod?: string | null;
  paidAmount?: string | number | null;
  changeAmount?: string | number | null;
};
