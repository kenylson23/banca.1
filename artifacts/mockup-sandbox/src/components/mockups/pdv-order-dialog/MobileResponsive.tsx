import './_group.css';
import { OrderDetailsDialog } from './_shared/OrderDetailsDialogResponsive';
import type { PDVOrder } from './_shared/types';

const order: PDVOrder = {
  id: 'A25FFCOA',
  status: 'em_preparo',
  paymentStatus: 'pago',
  orderType: 'takeout',
  createdAt: '2026-11-10T18:53:00',
  customer: { name: 'Kkkkkkk', phone: '99999999999' },
  customerName: 'Kkkkkkk',
  customerPhone: '99999999999',
  orderItems: [{ id: 'item-1', quantity: 1, price: 1200, menuItem: { name: 'Bolo Rei' } }],
  subtotal: 1200,
  totalAmount: 1200,
  paymentMethod: 'cash',
  paidAmount: 1200,
};

export function MobileResponsive() {
  return (
    <main className="dark min-h-screen bg-background p-2 text-foreground sm:p-4">
      <OrderDetailsDialog order={order} open onOpenChange={() => undefined} />
    </main>
  );
}
