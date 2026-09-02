import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, Circle, AlertCircle, CheckCircle2, Pause, X } from 'lucide-react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import { apiFetch } from '@/lib/api-url';

interface RestaurantStatusControlProps {
  currentStatus: number; // 0 = fechado, 1 = aberto
  compact?: boolean;
  restaurantId?: string;
}

type OperationalStatus = {
  value: number;
  label: string;
  description: string;
  color: string;
  glowColor: string;
  icon: React.ReactNode;
};

const STATUS_OPTIONS: OperationalStatus[] = [
  {
    value: 1,
    label: 'Aberto',
    description: 'Restaurante operando normalmente',
    color: 'from-emerald-500 to-green-600',
    glowColor: 'shadow-emerald-500/50',
    icon: <CheckCircle2 className="w-5 h-5" />,
  },
  {
    value: 0,
    label: 'Fechado',
    description: 'Restaurante não está aceitando pedidos',
    color: 'from-red-500 to-rose-600',
    glowColor: 'shadow-red-500/50',
    icon: <X className="w-5 h-5" />,
  },
  {
    value: 2,
    label: 'Pausado',
    description: 'Temporariamente não aceitando novos pedidos',
    color: 'from-amber-500 to-orange-600',
    glowColor: 'shadow-amber-500/50',
    icon: <Pause className="w-5 h-5" />,
  },
];

export function RestaurantStatusControl({ 
  currentStatus, 
  compact = false,
  restaurantId 
}: RestaurantStatusControlProps) {
  const [isOpen, setIsOpen] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const currentOption = STATUS_OPTIONS.find(opt => opt.value === currentStatus) || STATUS_OPTIONS[1];

  const updateStatusMutation = useMutation({
    mutationFn: async (newStatus: number) => {
      const response = await apiFetch('/api/restaurant/status', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isOpen: newStatus }),
        credentials: 'include',
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Erro ao atualizar status');
      }
      
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['restaurant'] });
      toast({
        title: 'Status atualizado',
        description: 'O status do restaurante foi alterado com sucesso.',
      });
    },
    onError: () => {
      toast({
        title: 'Erro ao atualizar',
        description: 'Não foi possível alterar o status do restaurante.',
        variant: 'destructive',
      });
    },
  });

  const handleStatusChange = (newStatus: number) => {
    updateStatusMutation.mutate(newStatus);
    setIsOpen(false);
  };

  if (compact) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="relative inline-flex"
      >
        <div
          className={`
            relative px-4 py-2 rounded-full
            bg-gradient-to-r ${currentOption.color}
            backdrop-blur-xl
            shadow-lg ${currentOption.glowColor}
            border border-white/20
            flex items-center gap-2
            text-white font-semibold text-sm
          `}
        >
          <Circle className="w-2 h-2 fill-current animate-pulse" />
          {currentOption.label}
        </div>
      </motion.div>
    );
  }

  return (
    <div className="relative">
      {/* Main Button with Glassmorphism */}
      <motion.button
        onClick={() => setIsOpen(!isOpen)}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        className={`
          relative w-full
          px-6 py-4
          rounded-2xl
          bg-white/40
          backdrop-blur-2xl
          border border-white/60
          shadow-xl ${currentOption.glowColor}
          hover:shadow-2xl
          transition-all duration-300
          group
        `}
      >
        {/* Gradient Overlay */}
        <div 
          className={`
            absolute inset-0 
            bg-gradient-to-r ${currentOption.color}
            opacity-10 group-hover:opacity-20
            rounded-2xl
            transition-opacity duration-300
          `}
        />

        {/* Content */}
        <div className="relative flex items-center justify-between">
          <div className="flex items-center gap-4">
            {/* Animated Icon */}
            <motion.div
              animate={{
                scale: [1, 1.1, 1],
                rotate: currentStatus === 1 ? [0, 5, -5, 0] : 0,
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                repeatType: 'reverse',
              }}
              className={`
                p-3 rounded-xl
                bg-gradient-to-br ${currentOption.color}
                shadow-lg ${currentOption.glowColor}
                text-white
              `}
            >
              {currentOption.icon}
            </motion.div>

            {/* Status Info */}
            <div className="text-left">
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-lg text-neutral-900">
                  Status: {currentOption.label}
                </h3>
                <Circle 
                  className={`w-2 h-2 fill-current ${
                    currentStatus === 1 ? 'text-green-500 animate-pulse' : 'text-red-500'
                  }`} 
                />
              </div>
              <p className="text-sm text-neutral-600 mt-0.5">
                {currentOption.description}
              </p>
            </div>
          </div>

          {/* Chevron */}
          <motion.div
            animate={{ rotate: isOpen ? 180 : 0 }}
            transition={{ duration: 0.3 }}
          >
            <ChevronDown className="w-5 h-5 text-neutral-700" />
          </motion.div>
        </div>
      </motion.button>

      {/* Dropdown with Glassmorphism */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 z-40"
            />

            {/* Dropdown Menu */}
            <motion.div
              initial={{ opacity: 0, y: -10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.95 }}
              transition={{ duration: 0.2, ease: 'easeOut' }}
              className="absolute top-full left-0 right-0 mt-3 z-50"
            >
              <div
                className="
                  bg-white
                  dark:bg-neutral-900
                  border border-neutral-200
                  dark:border-neutral-700
                  rounded-2xl
                  shadow-2xl
                  overflow-hidden
                  p-3
                "
              >
                {STATUS_OPTIONS.map((option, index) => (
                  <motion.button
                    key={option.value}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    onClick={() => handleStatusChange(option.value)}
                    disabled={updateStatusMutation.isPending}
                    className={`
                      w-full
                      px-4 py-3.5
                      rounded-xl
                      mb-2 last:mb-0
                      flex items-center gap-3
                      transition-all duration-200
                      ${
                        currentStatus === option.value
                          ? `bg-gradient-to-r ${option.color} text-white shadow-lg ${option.glowColor} border-2 border-white/20`
                          : 'bg-neutral-50 dark:bg-neutral-800 hover:bg-neutral-100 dark:hover:bg-neutral-700 text-neutral-900 dark:text-neutral-100 border-2 border-transparent'
                      }
                      disabled:opacity-50 disabled:cursor-not-allowed
                      group
                    `}
                  >
                    {/* Icon */}
                    <div
                      className={`
                        p-2 rounded-lg flex-shrink-0
                        ${
                          currentStatus === option.value
                            ? 'bg-white/20'
                            : `bg-gradient-to-br ${option.color} text-white shadow-md`
                        }
                        transition-all duration-200
                        group-hover:scale-110
                      `}
                    >
                      {option.icon}
                    </div>

                    {/* Text */}
                    <div className="flex-1 text-left">
                      <div className="font-bold text-base leading-tight">
                        {option.label}
                      </div>
                      <div
                        className={`
                          text-xs mt-1 leading-tight
                          ${
                            currentStatus === option.value
                              ? 'text-white/90'
                              : 'text-neutral-600 dark:text-neutral-400'
                          }
                        `}
                      >
                        {option.description}
                      </div>
                    </div>

                    {/* Check Mark */}
                    {currentStatus === option.value && (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="w-6 h-6 rounded-full bg-white/30 flex items-center justify-center flex-shrink-0"
                      >
                        <CheckCircle2 className="w-4 h-4" />
                      </motion.div>
                    )}
                  </motion.button>
                ))}
              </div>

              {/* Info Footer */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="
                  mt-3
                  bg-blue-50
                  dark:bg-blue-950/30
                  border border-blue-200
                  dark:border-blue-800
                  rounded-xl
                  px-4 py-3
                  flex items-start gap-3
                "
              >
                <AlertCircle className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
                <div className="text-sm text-blue-900 dark:text-blue-100">
                  <span className="font-semibold">Dica:</span> O status "Pausado" 
                  permite que você termine pedidos em andamento sem aceitar novos.
                </div>
              </motion.div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
