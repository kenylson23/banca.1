import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Plus, Zap, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';

interface SpeedDialMenuProps {
  tableId: string;
  tableNumber: string | number;
  onOrderCreated?: () => void;
}

interface FavoriteProduct {
  id: string;
  name: string;
  price: number;
  emoji: string;
  category: string;
}

export function SpeedDialMenu({ tableId, tableNumber, onOrderCreated }: SpeedDialMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch favorite/popular products
  const { data: favoriteProducts = [] } = useQuery<FavoriteProduct[]>({
    queryKey: ['favorite-products'],
    queryFn: async () => {
      const response = await fetch('/api/menu-items?popular=true&limit=5');
      if (!response.ok) throw new Error('Erro ao carregar favoritos');
      const data = await response.json();
      
      // Map products with emojis based on category
      return data.map((item: any) => {
        const categoryName = typeof item.category === 'object' && item.category !== null
          ? item.category.name
          : item.category;
        
        return {
          id: item.id,
          name: item.name,
          price: parseFloat(item.price),
          emoji: getCategoryEmoji(categoryName),
          category: categoryName || 'Outros',
        };
      });
    },
  });

  // Quick add mutation
  const quickAddMutation = useMutation({
    mutationFn: async (product: FavoriteProduct) => {
      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tableId,
          type: 'dine-in',
          items: [{
            menuItemId: product.id,
            quantity: 1,
          }],
          notes: 'Pedido rápido - Speed Dial',
        }),
      });
      if (!response.ok) throw new Error('Erro ao criar pedido');
      return { product, order: await response.json() };
    },
    onSuccess: ({ product }) => {
      toast({
        title: '⚡ Pedido expresso!',
        description: `${product.emoji} ${product.name} adicionado à Mesa ${tableNumber}`,
      });
      
      queryClient.invalidateQueries({ queryKey: [`/api/tables/${tableId}/orders-by-guest`] });
      queryClient.invalidateQueries({ queryKey: ['tables'] });
      
      onOrderCreated?.();
      
      // Play success sound (optional)
      playSuccessSound();
    },
    onError: (error: any) => {
      toast({
        title: '❌ Erro',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  const handleQuickAdd = (product: FavoriteProduct) => {
    quickAddMutation.mutate(product);
    setIsOpen(false);
  };

  const formatKwanza = (value: number) => {
    return new Intl.NumberFormat('pt-AO', {
      style: 'currency',
      currency: 'AOA',
      minimumFractionDigits: 0,
    }).format(value);
  };

  return (
    <div className="fixed bottom-6 right-6 z-50">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 20 }}
            className="absolute bottom-20 right-0 space-y-3"
          >
            {favoriteProducts.map((product, index) => (
              <motion.div
                key={product.id}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ delay: index * 0.05 }}
              >
                <Button
                  onClick={() => handleQuickAdd(product)}
                  disabled={quickAddMutation.isPending}
                  className={cn(
                    "h-16 w-64 bg-slate-900/90 backdrop-blur-xl hover:bg-slate-800/90 text-slate-100 border-2 border-emerald-500/30 hover:border-emerald-500 shadow-xl shadow-emerald-500/20 hover:shadow-2xl hover:shadow-emerald-500/40 transition-all justify-start gap-3 px-4 relative overflow-hidden group",
                    quickAddMutation.isPending && "opacity-50"
                  )}
                >
                  {/* Glow effect */}
                  <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/10 via-cyan-500/10 to-emerald-500/10 opacity-0 group-hover:opacity-100 transition-opacity" />
                  
                  <div className="h-12 w-12 rounded-lg bg-gradient-to-br from-emerald-500/20 to-cyan-500/20 border border-emerald-500/30 flex items-center justify-center text-2xl flex-shrink-0 relative z-10">
                    {product.emoji}
                  </div>
                  <div className="flex-1 text-left relative z-10">
                    <div className="font-bold text-sm line-clamp-1 text-slate-100">{product.name}</div>
                    <div className="text-emerald-400 font-semibold text-xs">
                      {formatKwanza(product.price)}
                    </div>
                  </div>
                  <div className="h-8 w-8 rounded-full bg-gradient-to-br from-emerald-500 to-cyan-500 text-white flex items-center justify-center flex-shrink-0 shadow-lg shadow-emerald-500/50 relative z-10">
                    <Plus className="h-5 w-5" />
                  </div>
                </Button>
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main FAB Button */}
      <motion.div
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        <Button
          onClick={() => setIsOpen(!isOpen)}
          className={cn(
            "h-16 w-16 rounded-full shadow-2xl transition-all border-2",
            isOpen
              ? "bg-red-500 hover:bg-red-600 border-red-400 shadow-red-500/50"
              : "bg-gradient-to-br from-emerald-500 to-cyan-500 hover:from-emerald-600 hover:to-cyan-600 border-emerald-400 shadow-emerald-500/50"
          )}
        >
          <AnimatePresence mode="wait">
            {isOpen ? (
              <motion.div
                key="close"
                initial={{ rotate: -90, opacity: 0 }}
                animate={{ rotate: 0, opacity: 1 }}
                exit={{ rotate: 90, opacity: 0 }}
              >
                <X className="h-7 w-7" />
              </motion.div>
            ) : (
              <motion.div
                key="open"
                initial={{ rotate: 90, opacity: 0 }}
                animate={{ rotate: 0, opacity: 1 }}
                exit={{ rotate: -90, opacity: 0 }}
              >
                <Zap className="h-7 w-7" />
              </motion.div>
            )}
          </AnimatePresence>
        </Button>
      </motion.div>

      {/* Tooltip */}
      {!isOpen && (
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="absolute bottom-5 right-20 bg-slate-900 text-white px-3 py-1.5 rounded-lg text-sm font-medium whitespace-nowrap shadow-lg pointer-events-none"
        >
          Pedidos Rápidos
          <div className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1 w-2 h-2 bg-slate-900 rotate-45" />
        </motion.div>
      )}

      {/* Pulse animation when closed */}
      {!isOpen && (
        <motion.div
          className="absolute inset-0 rounded-full bg-emerald-500"
          initial={{ scale: 1, opacity: 0.5 }}
          animate={{ scale: 1.3, opacity: 0 }}
          transition={{
            repeat: Infinity,
            duration: 2,
            ease: "easeOut",
          }}
        />
      )}
    </div>
  );
}

// Helper: Get emoji based on category
function getCategoryEmoji(category?: string): string {
  const emojiMap: Record<string, string> = {
    'Hamburgueres': '🍔',
    'Hambúrgueres': '🍔',
    'Pizza': '🍕',
    'Pizzas': '🍕',
    'Bebidas': '🥤',
    'Bebida': '🥤',
    'Drinks': '🥤',
    'Sobremesas': '🍰',
    'Sobremesa': '🍰',
    'Entradas': '🥗',
    'Entrada': '🥗',
    'Saladas': '🥗',
    'Carnes': '🥩',
    'Carne': '🥩',
    'Massas': '🍝',
    'Massa': '🍝',
    'Frutos do Mar': '🦐',
    'Peixes': '🐟',
    'Peixe': '🐟',
    'Lanches': '🌮',
    'Lanche': '🌮',
    'Hot Dog': '🌭',
    'Tacos': '🌮',
    'Cafés': '☕',
    'Café': '☕',
    'Cervejas': '🍺',
    'Cerveja': '🍺',
    'Vinhos': '🍷',
    'Vinho': '🍷',
    'Sucos': '🧃',
    'Suco': '🧃',
  };

  return emojiMap[category || ''] || '🍽️';
}

// Helper: Play success sound
function playSuccessSound() {
  try {
    const audio = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBTGH0fPTgjMGHm7A7+OZSA0PVqzn77BdGAg+ltryxnMpBSuAze/dljsKF2S56+mnUhEKRJ7f8r9uIQUxh9Hz04IzBh5uwO/jmUgND1as5++wXRgIPpba8sZzKQUrgM3v3ZY7ChdkuevppFIRCkSe3/K/biEFMYfR89OCMwYebsDv45lIDQ9WrOfvt10YCD6W2vLGcykFK4DN792WOwoXZLnr6aRSEQpEnt/yv24hBTGH0fPTgjMGHm7A7+OZSA0PVqzn77BdGAg+ltryxnMpBSuAze/dljsKF2S56+mkUhEKRJ7f8r9uIQUxh9Hz04IzBh5uwO/jmUgND1as5++wXRgIPpba8sZzKQUrgM3v3ZY7ChdkuevppFIRCkSe3/K/biEFMYfR89OCMwYebsDv45lIDQ9WrOfvt10YCD6W2vLGcykFK4DN792WOwoXZLnr6aRSEQpEnt/yv24hBTGH0fPTgjMGHm7A7+OZSA0PVqzn77BdGAg+ltryxnMpBSuAze/dljsKF2S56+mkUhEKRJ7f8r9uIQUxh9Hz04IzBh5uwO/jmUgND1as5++wXRgIPpba8sZzKQUrgM3v3ZY7ChdkuevppFIRCkSe3/K/biEFMYfR89OCMwYebsDv45lIDQ9WrOfvt10YCD6W2vLGcykFK4DN792WOwoXZLnr6aRSEQpEnt/yv24hBTGH0fPTgjMGHm7A7+OZSA0PVqzn77BdGAg+ltryxnMpBSuAze/dljsKF2S56+mkUhEKRJ7f8r9uIQU=');
    audio.volume = 0.3;
    audio.play().catch(() => {
      // Ignore audio errors
    });
  } catch {
    // Ignore audio errors
  }
}
