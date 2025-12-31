import { motion, AnimatePresence } from 'framer-motion';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { formatKwanza } from '@/lib/formatters';
import { Users, ArrowRight } from 'lucide-react';

interface MoveItemDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  item: any;
  guests: any[];
  onMove: (targetGuestId: string | null) => void;
  isPending?: boolean;
}

export function MoveItemDialog({
  open,
  onOpenChange,
  item,
  guests,
  onMove,
  isPending = false,
}: MoveItemDialogProps) {
  if (!item) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md bg-gradient-to-br from-indigo-900 to-indigo-800 text-white border-indigo-500/20">
        <DialogHeader>
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ type: 'spring', stiffness: 200, damping: 20 }}
          >
            <DialogTitle className="text-2xl font-bold flex items-center gap-3">
              <motion.div
                animate={{ 
                  x: [0, 5, 0, -5, 0],
                  rotate: [0, 5, 0, -5, 0],
                }}
                transition={{ 
                  duration: 2,
                  repeat: Infinity,
                  repeatDelay: 1,
                }}
              >
                <Users className="h-6 w-6 text-indigo-400" />
              </motion.div>
              Mover Item
            </DialogTitle>
          </motion.div>
        </DialogHeader>

        {/* Item Info */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="p-4 bg-white/10 rounded-lg border border-white/20"
        >
          <p className="font-semibold text-white mb-1">{item.name}</p>
          <p className="text-sm text-white/60">
            {item.quantity}x {formatKwanza(item.price)} = {formatKwanza(item.price * item.quantity)}
          </p>
        </motion.div>

        {/* Guests List */}
        <div className="space-y-2">
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-sm text-white/70 font-medium"
          >
            Selecione o convidado de destino:
          </motion.p>

          <AnimatePresence mode="popLayout">
            {guests.map((guest: any, index: number) => (
              <motion.button
                key={guest.id}
                layout
                initial={{ opacity: 0, x: -50 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 50 }}
                whileHover={{ scale: 1.02, x: 5 }}
                whileTap={{ scale: 0.98 }}
                transition={{ 
                  type: 'spring',
                  stiffness: 300,
                  damping: 20,
                  delay: 0.3 + index * 0.05,
                }}
                onClick={() => onMove(guest.id)}
                disabled={isPending}
                className="w-full p-3 bg-white/10 hover:bg-white/20 rounded-lg border border-white/20 hover:border-indigo-400 transition-all text-left disabled:opacity-50 group relative overflow-hidden"
              >
                {/* Hover effect */}
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-indigo-500/0 via-indigo-500/20 to-indigo-500/0"
                  initial={{ x: '-100%' }}
                  whileHover={{ x: '100%' }}
                  transition={{ duration: 0.5 }}
                />

                <div className="flex items-center gap-3 relative z-10">
                  <Avatar className="h-10 w-10 border-2 border-indigo-400/30">
                    <AvatarFallback className="bg-gradient-to-br from-indigo-500 to-indigo-600 text-white text-sm font-bold">
                      {guest.name ? guest.name.charAt(0).toUpperCase() : '#'}
                    </AvatarFallback>
                  </Avatar>
                  
                  <div className="flex-1">
                    <p className="font-semibold text-white">
                      {guest.name || `Convidado ${guest.guestNumber || guest.seatNumber}`}
                    </p>
                    {guest.customerId && (
                      <p className="text-xs text-indigo-300">Cliente cadastrado</p>
                    )}
                  </div>

                  <motion.div
                    initial={{ opacity: 0, x: -10 }}
                    whileHover={{ opacity: 1, x: 0 }}
                    className="text-indigo-300"
                  >
                    <ArrowRight className="h-5 w-5" />
                  </motion.div>
                </div>
              </motion.button>
            ))}

            {/* Anonymous option */}
            <motion.button
              key="anonymous"
              layout
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 50 }}
              whileHover={{ scale: 1.02, x: 5 }}
              whileTap={{ scale: 0.98 }}
              transition={{ 
                type: 'spring',
                stiffness: 300,
                damping: 20,
                delay: 0.3 + guests.length * 0.05,
              }}
              onClick={() => onMove(null)}
              disabled={isPending}
              className="w-full p-3 bg-white/10 hover:bg-white/20 rounded-lg border border-white/20 hover:border-gray-400 transition-all text-left disabled:opacity-50 group relative overflow-hidden"
            >
              {/* Hover effect */}
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-gray-500/0 via-gray-500/20 to-gray-500/0"
                initial={{ x: '-100%' }}
                whileHover={{ x: '100%' }}
                transition={{ duration: 0.5 }}
              />

              <div className="flex items-center gap-3 relative z-10">
                <Avatar className="h-10 w-10 border-2 border-gray-400/30">
                  <AvatarFallback className="bg-gradient-to-br from-gray-500 to-gray-600 text-white text-sm font-bold">
                    ?
                  </AvatarFallback>
                </Avatar>
                
                <div className="flex-1">
                  <p className="font-semibold text-white">Sem Convidado</p>
                  <p className="text-xs text-white/60">Item anônimo</p>
                </div>

                <motion.div
                  initial={{ opacity: 0, x: -10 }}
                  whileHover={{ opacity: 1, x: 0 }}
                  className="text-gray-300"
                >
                  <ArrowRight className="h-5 w-5" />
                </motion.div>
              </div>
            </motion.button>
          </AnimatePresence>
        </div>

        <Button
          variant="outline"
          className="w-full bg-white/10 border-white/20 text-white hover:bg-white/20 mt-4"
          onClick={() => onOpenChange(false)}
          disabled={isPending}
        >
          Cancelar
        </Button>
      </DialogContent>
    </Dialog>
  );
}
