import { motion, AnimatePresence, PanInfo } from 'framer-motion';
import { useState } from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { formatKwanza } from '@/lib/formatters';
import { ChevronLeft, ChevronDown, MoreHorizontal } from 'lucide-react';
import { useSwipeGesture } from './hooks/useSwipeGesture';
import { GuestDetailPanel } from './panels/GuestDetailPanel';
import { PaymentPanel } from './panels/PaymentPanel';
import type { Table } from '@shared/schema';

interface TableDialogMobileProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  table: Table | null;
  ordersByGuestData: any;
  guests: any[];
  totalAmount: number;
  onEditOrder: (order: any) => void;
  onCancelOrder: (order: any) => void;
}

type View = 'list' | 'guest' | 'payment';

export function TableDialogMobile({
  open,
  onOpenChange,
  table,
  ordersByGuestData,
  guests,
  totalAmount,
  onEditOrder,
  onCancelOrder,
}: TableDialogMobileProps) {
  const [view, setView] = useState<View>('list');
  const [selectedGuestId, setSelectedGuestId] = useState<string | null>(null);
  const [dragY, setDragY] = useState(0);

  // Swipe down to close
  const handleDragEnd = (event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    if (info.offset.y > 150) {
      // Swipe down threshold
      if (view === 'list') {
        onOpenChange(false);
      } else {
        setView('list');
      }
      
      // Haptic feedback
      if ('vibrate' in navigator) {
        navigator.vibrate(20);
      }
    }
    setDragY(0);
  };

  const openGuestDetail = (guestId: string) => {
    setSelectedGuestId(guestId);
    setView('guest');
    
    // Haptic feedback
    if ('vibrate' in navigator) {
      navigator.vibrate(10);
    }
  };

  const selectedGuestData = ordersByGuestData?.ordersByGuest?.find(
    (og: any) => og.guest.id === selectedGuestId
  );

  if (!table) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-full h-[100dvh] p-0 gap-0 overflow-hidden border-0 rounded-none lg:hidden">
        <motion.div
          drag="y"
          dragConstraints={{ top: 0, bottom: 0 }}
          dragElastic={0.2}
          onDrag={(e, info) => setDragY(info.offset.y)}
          onDragEnd={handleDragEnd}
          className="h-full bg-white dark:bg-slate-900 flex flex-col"
          style={{ y: dragY > 0 ? dragY : 0 }}
        >
          {/* Drag Handle */}
          <div className="flex justify-center py-2 bg-slate-100 dark:bg-slate-800">
            <motion.div
              animate={{ scaleX: dragY > 0 ? 1.5 : 1 }}
              className="w-12 h-1 bg-slate-400 rounded-full"
            />
          </div>

          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b bg-slate-50 dark:bg-slate-800">
            {view !== 'list' && (
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setView('list')}
                className="h-10 w-10"
              >
                <ChevronLeft className="h-6 w-6" />
              </Button>
            )}
            
            <div className={view === 'list' ? '' : 'flex-1 text-center'}>
              <h2 className="text-xl font-bold">Mesa {table.number}</h2>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                {view === 'payment' ? 'Checkout' : `${guests.length} pessoas`}
              </p>
            </div>

            <div className="text-right">
              <p className="text-lg font-bold text-indigo-600">
                {formatKwanza(totalAmount)}
              </p>
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto">
            <AnimatePresence mode="wait">
              {view === 'list' && (
                <motion.div
                  key="list"
                  initial={{ opacity: 0, x: -50 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -50 }}
                  className="p-4 space-y-4"
                >
                  {/* Pull to refresh indicator */}
                  {dragY > 50 && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="text-center text-sm text-slate-500 mb-2"
                    >
                      <ChevronDown className="inline-block h-4 w-4 animate-bounce" />
                      {dragY > 150 ? 'Solte para fechar' : 'Arraste para fechar'}
                    </motion.div>
                  )}

                  {/* Guests List */}
                  <div className="space-y-3">
                    {ordersByGuestData?.ordersByGuest?.map(({ guest, orders, subtotal }: any, index: number) => (
                      <motion.button
                        key={guest.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => openGuestDetail(guest.id)}
                        className="w-full p-4 bg-slate-50 dark:bg-slate-800 rounded-xl border-2 border-slate-200 dark:border-slate-700 active:border-indigo-500 transition-all text-left"
                      >
                        <div className="flex items-center gap-4">
                          <Avatar className="h-14 w-14 border-2 border-indigo-400">
                            <AvatarFallback className="bg-gradient-to-br from-indigo-500 to-violet-500 text-white font-bold text-lg">
                              {guest.name ? guest.name.charAt(0).toUpperCase() : '#'}
                            </AvatarFallback>
                          </Avatar>

                          <div className="flex-1 min-w-0">
                            <p className="font-semibold text-lg truncate">
                              {guest.name || `Convidado ${guest.guestNumber}`}
                            </p>
                            <p className="text-sm text-slate-600 dark:text-slate-400">
                              {orders.length} {orders.length === 1 ? 'pedido' : 'pedidos'}
                            </p>
                          </div>

                          <div className="text-right">
                            <p className="text-xl font-bold text-indigo-600">
                              {formatKwanza(parseFloat(subtotal))}
                            </p>
                          </div>
                        </div>
                      </motion.button>
                    ))}
                  </div>

                  {/* Actions */}
                  <div className="sticky bottom-0 pt-4 pb-safe space-y-2 bg-gradient-to-t from-white dark:from-slate-900 via-white dark:via-slate-900">
                    <Button
                      className="w-full h-14 text-lg font-bold bg-gradient-to-r from-indigo-600 to-indigo-700"
                      onClick={() => {/* TODO: New order */}}
                    >
                      + Novo Pedido
                    </Button>
                    
                    <Button
                      className="w-full h-14 text-lg font-bold bg-gradient-to-r from-emerald-600 to-emerald-700"
                      onClick={() => setView('payment')}
                    >
                      💰 Ir para Checkout
                    </Button>
                  </div>
                </motion.div>
              )}

              {view === 'guest' && selectedGuestData && (
                <motion.div
                  key={`guest-${selectedGuestId}`}
                  initial={{ opacity: 0, x: 50 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -50 }}
                  drag="x"
                  dragConstraints={{ left: 0, right: 0 }}
                  dragElastic={0.2}
                  onDragEnd={(e, info) => {
                    const currentIndex = ordersByGuestData?.ordersByGuest?.findIndex(
                      (og: any) => og.guest.id === selectedGuestId
                    );
                    
                    // Swipe left (next guest)
                    if (info.offset.x < -100 && currentIndex < ordersByGuestData.ordersByGuest.length - 1) {
                      const nextGuest = ordersByGuestData.ordersByGuest[currentIndex + 1];
                      setSelectedGuestId(nextGuest.guest.id);
                      if ('vibrate' in navigator) navigator.vibrate(10);
                    }
                    // Swipe right (previous guest)
                    else if (info.offset.x > 100 && currentIndex > 0) {
                      const prevGuest = ordersByGuestData.ordersByGuest[currentIndex - 1];
                      setSelectedGuestId(prevGuest.guest.id);
                      if ('vibrate' in navigator) navigator.vibrate(10);
                    }
                  }}
                  className="p-4"
                >
                  {/* Guest indicators */}
                  <div className="flex justify-center gap-2 mb-4">
                    {ordersByGuestData?.ordersByGuest?.map((og: any, idx: number) => (
                      <motion.div
                        key={og.guest.id}
                        animate={{
                          width: og.guest.id === selectedGuestId ? 24 : 8,
                          backgroundColor: og.guest.id === selectedGuestId ? '#6366f1' : '#cbd5e1',
                        }}
                        className="h-2 rounded-full"
                      />
                    ))}
                  </div>

                  <GuestDetailPanel
                    guest={selectedGuestData.guest}
                    orders={selectedGuestData.orders}
                    subtotal={selectedGuestData.subtotal}
                    onEditOrder={onEditOrder}
                    onCancelOrder={onCancelOrder}
                  />
                  
                  {/* Swipe hint */}
                  <p className="text-center text-xs text-slate-400 mt-4">
                    ← Arraste para navegar entre pessoas →
                  </p>
                </motion.div>
              )}

              {view === 'payment' && (
                <motion.div
                  key="payment"
                  initial={{ opacity: 0, x: 50 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 50 }}
                  className="p-4"
                >
                  <PaymentPanel
                    ordersByGuest={ordersByGuestData?.ordersByGuest || []}
                    totalAmount={totalAmount}
                    onCheckout={() => {/* TODO */}}
                  />
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      </DialogContent>
    </Dialog>
  );
}
