import { motion, AnimatePresence } from 'framer-motion';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { formatKwanza } from '@/lib/formatters';
import { Pencil, Plus, Minus, Trash2, Users } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface EditOrderDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  order: any;
  guests: any[];
  onUpdateQuantity: (itemId: string, quantity: number) => void;
  onRemoveItem: (itemId: string) => void;
  onMoveItem: (item: any) => void;
  isPending?: boolean;
}

export function EditOrderDialog({
  open,
  onOpenChange,
  order,
  guests,
  onUpdateQuantity,
  onRemoveItem,
  onMoveItem,
  isPending = false,
}: EditOrderDialogProps) {
  const { toast } = useToast();

  if (!order) return null;

  const handleRemoveItem = (item: any) => {
    if (order.items.length <= 1) {
      toast({
        title: 'Não é possível remover',
        description: 'O pedido precisa ter pelo menos 1 item. Use "Cancelar Pedido" para cancelar completamente.',
        variant: 'destructive',
      });
      return;
    }
    onRemoveItem(item.id);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl bg-gradient-to-br from-slate-900 to-slate-800 text-white border-white/10 max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ type: 'spring', stiffness: 200, damping: 20 }}
          >
            <DialogTitle className="text-2xl font-bold flex items-center gap-3">
              <motion.div
                animate={{ rotate: [0, 5, -5, 0] }}
                transition={{ 
                  duration: 2,
                  repeat: Infinity,
                  repeatDelay: 3,
                }}
              >
                <Pencil className="h-6 w-6 text-indigo-400" />
              </motion.div>
              Editar Pedido #{order.orderNumber || order.id?.slice(0, 8).toUpperCase()}
            </DialogTitle>
          </motion.div>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto pr-2 space-y-3">
          <AnimatePresence mode="popLayout">
            {order.items?.map((item: any, index: number) => (
              <motion.div
                key={item.id}
                layout
                initial={{ opacity: 0, scale: 0.8, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.8, x: -100 }}
                transition={{ 
                  type: 'spring',
                  stiffness: 200,
                  damping: 20,
                  delay: index * 0.05,
                }}
                className="flex items-center gap-4 p-4 bg-white/5 rounded-lg border border-white/10 hover:border-indigo-500/50 transition-colors"
              >
                {/* Item Info */}
                <div className="flex-1">
                  <p className="font-semibold text-white">{item.name}</p>
                  <p className="text-sm text-white/60">
                    {formatKwanza(item.price)} cada
                  </p>
                </div>

                {/* Quantity Controls */}
                <motion.div 
                  className="flex items-center gap-2"
                  whileHover={{ scale: 1.05 }}
                >
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-8 w-8 bg-white/10 border-white/20 text-white hover:bg-white/20"
                    onClick={() => onUpdateQuantity(item.id, item.quantity - 1)}
                    disabled={item.quantity <= 1 || isPending}
                  >
                    <Minus className="h-4 w-4" />
                  </Button>

                  <motion.span
                    key={item.quantity}
                    initial={{ scale: 1.5, color: '#818CF8' }}
                    animate={{ scale: 1, color: '#FFFFFF' }}
                    className="w-12 text-center font-bold text-white"
                  >
                    {item.quantity}
                  </motion.span>

                  <Button
                    variant="outline"
                    size="icon"
                    className="h-8 w-8 bg-white/10 border-white/20 text-white hover:bg-white/20"
                    onClick={() => onUpdateQuantity(item.id, item.quantity + 1)}
                    disabled={isPending}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </motion.div>

                {/* Total */}
                <motion.div 
                  className="text-right min-w-[100px]"
                  key={item.price * item.quantity}
                  initial={{ scale: 1.2, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                >
                  <p className="font-bold text-white">
                    {formatKwanza(item.price * item.quantity)}
                  </p>
                </motion.div>

                {/* Actions */}
                <div className="flex gap-1">
                  <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-red-400 hover:bg-red-500/10 hover:text-red-300"
                      onClick={() => handleRemoveItem(item)}
                      disabled={isPending}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </motion.div>

                  {guests.length > 1 && (
                    <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-8 bg-white/10 border-white/20 text-white hover:bg-white/20"
                        onClick={() => onMoveItem({ ...item, orderId: order.id })}
                        disabled={isPending}
                      >
                        <Users className="h-3 w-3 mr-1" />
                        Mover
                      </Button>
                    </motion.div>
                  )}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {/* Order Total */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="flex items-center justify-between pt-4 border-t border-white/10 mt-4"
        >
          <span className="text-lg font-bold text-white">Total do Pedido:</span>
          <motion.span
            key={order.totalPrice}
            initial={{ scale: 1.3, color: '#818CF8' }}
            animate={{ scale: 1, color: 'transparent' }}
            className="text-2xl font-black bg-gradient-to-r from-indigo-400 to-violet-400 bg-clip-text"
          >
            {formatKwanza(parseFloat(order.totalPrice || 0))}
          </motion.span>
        </motion.div>

        <div className="flex gap-2 pt-4">
          <Button
            variant="outline"
            className="flex-1 bg-white/10 border-white/20 text-white hover:bg-white/20"
            onClick={() => onOpenChange(false)}
            disabled={isPending}
          >
            Fechar
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
