import { motion, AnimatePresence } from 'framer-motion';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { AlertCircle } from 'lucide-react';
import { formatKwanza } from '@/lib/formatters';

interface CancelOrderDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  order: any;
  onConfirm: () => void;
  isPending?: boolean;
}

export function CancelOrderDialog({
  open,
  onOpenChange,
  order,
  onConfirm,
  isPending = false,
}: CancelOrderDialogProps) {
  if (!order) return null;

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="bg-gradient-to-br from-red-900 to-red-800 text-white border-red-500/20 max-w-md">
        <AlertDialogHeader>
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: 'spring', stiffness: 200, damping: 20 }}
          >
            <AlertDialogTitle className="text-2xl font-bold flex items-center gap-3">
              <motion.div
                animate={{ 
                  rotate: [0, -10, 10, -10, 0],
                  scale: [1, 1.1, 1.1, 1.1, 1],
                }}
                transition={{ 
                  duration: 0.5,
                  repeat: Infinity,
                  repeatDelay: 2,
                }}
              >
                <AlertCircle className="h-8 w-8 text-red-300" />
              </motion.div>
              Cancelar Pedido?
            </AlertDialogTitle>
          </motion.div>
          
          <AlertDialogDescription className="text-white/90 text-base mt-2">
            Tem certeza que deseja cancelar o pedido{' '}
            <strong className="text-white">
              #{order.orderNumber || order.id?.slice(0, 8).toUpperCase()}
            </strong>
            ? Esta ação não pode ser desfeita.
          </AlertDialogDescription>
        </AlertDialogHeader>

        <AnimatePresence mode="wait">
          {order.items && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ delay: 0.1 }}
              className="p-4 bg-red-950/50 rounded-lg border border-red-500/30"
            >
              <p className="text-sm font-semibold text-white mb-3">Itens do pedido:</p>
              <ul className="space-y-2">
                {order.items.map((item: any, index: number) => (
                  <motion.li
                    key={item.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 + index * 0.05 }}
                    className="text-sm text-white/80 flex items-center justify-between"
                  >
                    <span>
                      • {item.quantity}x {item.name}
                    </span>
                    <span className="font-semibold">
                      {formatKwanza(item.price * item.quantity)}
                    </span>
                  </motion.li>
                ))}
              </ul>
              
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="mt-3 pt-3 border-t border-red-500/30"
              >
                <div className="flex items-center justify-between">
                  <span className="text-sm font-bold text-white">Total:</span>
                  <span className="text-lg font-black text-white">
                    {formatKwanza(parseFloat(order.totalPrice || 0))}
                  </span>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        <AlertDialogFooter>
          <AlertDialogCancel 
            className="bg-white/10 border-white/20 text-white hover:bg-white/20"
            disabled={isPending}
          >
            Não, manter pedido
          </AlertDialogCancel>
          
          <AlertDialogAction
            onClick={onConfirm}
            disabled={isPending}
            className="bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 relative overflow-hidden"
          >
            {isPending && (
              <motion.div
                className="absolute inset-0 bg-white/20"
                initial={{ x: '-100%' }}
                animate={{ x: '100%' }}
                transition={{ 
                  repeat: Infinity, 
                  duration: 1,
                  ease: 'linear' 
                }}
              />
            )}
            <span className="relative z-10">
              {isPending ? 'Cancelando...' : 'Sim, Cancelar Pedido'}
            </span>
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
