import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { formatKwanza } from '@/lib/formatters';
import { CreditCard, Banknote, DollarSign, Check, ChevronRight } from 'lucide-react';
import { useState } from 'react';

interface PaymentPanelProps {
  ordersByGuest: Array<{ guest: any; orders: any[]; subtotal: string }>;
  totalAmount: number;
  onCheckout: () => void;
}

export function PaymentPanel({ ordersByGuest, totalAmount, onCheckout }: PaymentPanelProps) {
  const [selectedGuests, setSelectedGuests] = useState<Set<string>>(new Set());
  const [paymentMethod, setPaymentMethod] = useState<string>('');

  const toggleGuest = (guestId: string) => {
    const newSelected = new Set(selectedGuests);
    if (newSelected.has(guestId)) {
      newSelected.delete(guestId);
    } else {
      newSelected.add(guestId);
    }
    setSelectedGuests(newSelected);
  };

  const selectedTotal = ordersByGuest
    .filter(og => selectedGuests.has(og.guest.id))
    .reduce((sum, og) => sum + parseFloat(og.subtotal), 0);

  const paymentMethods = [
    { id: 'cash', name: 'Dinheiro', icon: Banknote, color: 'from-green-500 to-emerald-600' },
    { id: 'card', name: 'Cartão', icon: CreditCard, color: 'from-blue-500 to-indigo-600' },
    { id: 'multicaixa', name: 'Multicaixa', icon: DollarSign, color: 'from-purple-500 to-violet-600' },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="pb-4 border-b"
      >
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
          💰 Checkout
        </h2>
        <p className="text-slate-600 dark:text-slate-400">
          Selecione as pessoas que vão pagar agora
        </p>
      </motion.div>

      {/* Guests Selection */}
      <div className="space-y-3">
        <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
          Dividir por Pessoa
        </h3>

        <AnimatePresence mode="popLayout">
          {ordersByGuest.map(({ guest, orders, subtotal }, index) => {
            const isSelected = selectedGuests.has(guest.id);
            
            return (
              <motion.button
                key={guest.id}
                layout
                initial={{ opacity: 0, x: -50 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 50 }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                transition={{ 
                  type: 'spring',
                  stiffness: 300,
                  damping: 20,
                  delay: index * 0.05,
                }}
                onClick={() => toggleGuest(guest.id)}
                className={`
                  w-full p-4 rounded-lg border-2 transition-all text-left relative overflow-hidden
                  ${isSelected
                    ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-900/20'
                    : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:border-emerald-300'
                  }
                `}
              >
                {/* Selection indicator */}
                <AnimatePresence>
                  {isSelected && (
                    <motion.div
                      initial={{ scale: 0, rotate: -180 }}
                      animate={{ scale: 1, rotate: 0 }}
                      exit={{ scale: 0, rotate: 180 }}
                      className="absolute top-2 right-2 bg-emerald-500 rounded-full p-1"
                    >
                      <Check className="h-4 w-4 text-white" />
                    </motion.div>
                  )}
                </AnimatePresence>

                <div className="flex items-center gap-4">
                  <Avatar className="h-12 w-12 border-2 border-emerald-400">
                    <AvatarFallback className="bg-gradient-to-br from-emerald-500 to-emerald-600 text-white font-bold">
                      {guest.name ? guest.name.charAt(0).toUpperCase() : '#'}
                    </AvatarFallback>
                  </Avatar>

                  <div className="flex-1">
                    <p className="font-semibold text-slate-900 dark:text-white">
                      {guest.name || `Convidado ${guest.guestNumber || guest.seatNumber}`}
                    </p>
                    <p className="text-sm text-slate-600 dark:text-slate-400">
                      {orders.length} {orders.length === 1 ? 'pedido' : 'pedidos'}
                    </p>
                  </div>

                  <motion.div
                    key={subtotal}
                    initial={{ scale: 1.2, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="text-right"
                  >
                    <p className="text-xl font-bold text-emerald-600 dark:text-emerald-400">
                      {formatKwanza(parseFloat(subtotal))}
                    </p>
                  </motion.div>
                </div>
              </motion.button>
            );
          })}
        </AnimatePresence>
      </div>

      {/* Payment Method */}
      <AnimatePresence>
        {selectedGuests.size > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="space-y-3"
          >
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
              Forma de Pagamento
            </h3>

            <div className="grid grid-cols-3 gap-3">
              {paymentMethods.map((method, index) => {
                const isSelected = paymentMethod === method.id;
                const Icon = method.icon;

                return (
                  <motion.button
                    key={method.id}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: index * 0.1 }}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setPaymentMethod(method.id)}
                    className={`
                      p-4 rounded-lg border-2 transition-all relative overflow-hidden
                      ${isSelected
                        ? `border-transparent bg-gradient-to-br ${method.color}`
                        : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:border-slate-300'
                      }
                    `}
                  >
                    <div className={`flex flex-col items-center gap-2 ${isSelected ? 'text-white' : 'text-slate-600 dark:text-slate-400'}`}>
                      <Icon className="h-6 w-6" />
                      <span className="text-sm font-semibold">{method.name}</span>
                    </div>

                    {/* Selection check */}
                    <AnimatePresence>
                      {isSelected && (
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          exit={{ scale: 0 }}
                          className="absolute top-1 right-1 bg-white rounded-full p-0.5"
                        >
                          <Check className="h-3 w-3 text-emerald-600" />
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.button>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Summary */}
      <motion.div
        layout
        className="p-4 bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-800 dark:to-slate-900 rounded-lg border border-slate-200 dark:border-slate-700"
      >
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-slate-600 dark:text-slate-400">Total da mesa</span>
            <span className="font-semibold text-slate-900 dark:text-white">
              {formatKwanza(totalAmount)}
            </span>
          </div>
          
          <AnimatePresence>
            {selectedGuests.size > 0 && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
              >
                <div className="flex justify-between text-sm">
                  <span className="text-slate-600 dark:text-slate-400">
                    Selecionado ({selectedGuests.size} {selectedGuests.size === 1 ? 'pessoa' : 'pessoas'})
                  </span>
                  <motion.span
                    key={selectedTotal}
                    initial={{ scale: 1.2, color: '#10B981' }}
                    animate={{ scale: 1, color: 'inherit' }}
                    className="font-semibold text-emerald-600 dark:text-emerald-400"
                  >
                    {formatKwanza(selectedTotal)}
                  </motion.span>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="pt-2 border-t border-slate-300 dark:border-slate-600 flex justify-between items-center">
            <span className="font-bold text-slate-900 dark:text-white">A pagar agora</span>
            <motion.span
              key={selectedTotal}
              initial={{ scale: 1.3 }}
              animate={{ scale: 1 }}
              className="text-2xl font-black bg-gradient-to-r from-emerald-600 to-green-600 bg-clip-text text-transparent"
            >
              {formatKwanza(selectedTotal)}
            </motion.span>
          </div>
        </div>
      </motion.div>

      {/* Action Buttons */}
      <div className="space-y-2">
        <Button
          onClick={onCheckout}
          disabled={selectedGuests.size === 0 || !paymentMethod}
          className="w-full h-14 bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700 text-white font-bold text-lg relative overflow-hidden group"
        >
          <motion.div
            className="absolute inset-0 bg-white/20"
            initial={{ x: '-100%' }}
            whileHover={{ x: '100%' }}
            transition={{ duration: 0.5 }}
          />
          <span className="relative z-10 flex items-center gap-2">
            Confirmar Pagamento
            <ChevronRight className="h-5 w-5" />
          </span>
        </Button>

        <Button
          variant="outline"
          onClick={() => setSelectedGuests(new Set(ordersByGuest.map(og => og.guest.id)))}
          className="w-full"
        >
          Selecionar Todos
        </Button>
      </div>
    </div>
  );
}
