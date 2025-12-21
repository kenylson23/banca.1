import { motion } from 'framer-motion';
import { LucideIcon, ShoppingCart, Heart, Package } from 'lucide-react';
import { Button } from './button';

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
  variant?: 'default' | 'cart' | 'favorites' | 'orders';
}

export const EmptyState = ({
  icon: Icon,
  title,
  description,
  actionLabel,
  onAction,
  variant = 'default'
}: EmptyStateProps) => {
  const variants = {
    default: {
      iconBg: 'from-neutral-800 to-neutral-900',
      accentBg: 'bg-amber-500',
      buttonClass: 'bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 shadow-lg shadow-amber-500/30'
    },
    cart: {
      iconBg: 'from-neutral-800 via-neutral-900 to-black',
      accentBg: 'bg-gradient-to-r from-amber-400 to-orange-500',
      buttonClass: 'bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 shadow-lg shadow-amber-500/30'
    },
    favorites: {
      iconBg: 'from-neutral-800 to-neutral-900',
      accentBg: 'bg-gradient-to-r from-red-400 to-pink-500',
      buttonClass: 'bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 shadow-lg shadow-amber-500/30'
    },
    orders: {
      iconBg: 'from-neutral-800 to-neutral-900',
      accentBg: 'bg-gradient-to-r from-amber-400 to-orange-500',
      buttonClass: 'bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 shadow-lg shadow-amber-500/30'
    }
  };

  const style = variants[variant];

  return (
    <div className="flex flex-col items-center justify-center py-16 px-4">
      {/* Ilustração Animada */}
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        className="relative mb-8"
      >
        {/* Círculo principal com ícone */}
        <motion.div
          animate={{ 
            boxShadow: [
              '0 0 0 0 rgba(245, 158, 11, 0.4)',
              '0 0 0 20px rgba(245, 158, 11, 0)',
            ]
          }}
          transition={{ duration: 2, repeat: Infinity }}
          className={`w-32 h-32 rounded-full bg-gradient-to-br ${style.iconBg} flex items-center justify-center relative shadow-2xl shadow-amber-500/20`}
        >
          <Icon className="h-16 w-16 text-amber-500/40" strokeWidth={1.5} />
        </motion.div>

        {/* Ícone de ação flutuante */}
        <motion.div
          animate={{ 
            rotate: [0, 10, -10, 0],
            y: [0, -5, 0]
          }}
          transition={{ 
            duration: 3, 
            repeat: Infinity,
            ease: 'easeInOut'
          }}
          className={`absolute -top-2 -right-2 w-14 h-14 ${style.accentBg} rounded-full flex items-center justify-center shadow-lg shadow-amber-500/50`}
        >
          <motion.div
            animate={{ scale: [1, 1.1, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <span className="text-2xl">🛒</span>
          </motion.div>
        </motion.div>

        {/* Partículas decorativas */}
        <motion.div
          animate={{ 
            scale: [1, 1.2, 1],
            opacity: [0.5, 0.8, 0.5]
          }}
          transition={{ duration: 3, repeat: Infinity }}
          className="absolute inset-0 -z-10"
        >
          <div className={`absolute top-0 left-0 w-3 h-3 ${style.accentBg} rounded-full opacity-50`} />
          <div className={`absolute bottom-0 right-0 w-2 h-2 ${style.accentBg} rounded-full opacity-30`} />
          <div className={`absolute top-1/2 right-0 w-2 h-2 ${style.accentBg} rounded-full opacity-40`} />
        </motion.div>
      </motion.div>

      {/* Texto */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="text-center max-w-sm"
      >
        <h3 className="text-xl font-bold text-white mb-2">{title}</h3>
        <p className="text-neutral-400 text-sm leading-relaxed mb-6">
          {description}
        </p>
      </motion.div>

      {/* Action Button */}
      {actionLabel && onAction && (
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <Button 
            onClick={onAction}
            className={`${style.buttonClass} text-white shadow-lg px-6 py-6 text-base font-semibold`}
            size="lg"
          >
            {actionLabel}
          </Button>
        </motion.div>
      )}
    </div>
  );
};

// Componentes específicos prontos para usar
export const EmptyCart = ({ onBrowseMenu }: { onBrowseMenu: () => void }) => (
  <div className="flex flex-col items-center justify-center py-12 px-4">
    <motion.div
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
      className="relative mb-6"
    >
      <motion.div
        animate={{ 
          boxShadow: [
            '0 0 0 0 rgba(245, 158, 11, 0.4)',
            '0 0 0 20px rgba(245, 158, 11, 0)',
          ]
        }}
        transition={{ duration: 2, repeat: Infinity }}
        className="w-28 h-28 rounded-full bg-gradient-to-br from-neutral-800 via-neutral-900 to-black flex items-center justify-center relative shadow-2xl shadow-amber-500/20"
      >
        <ShoppingCart className="h-12 w-12 text-amber-500/40" strokeWidth={1.5} />
      </motion.div>
      
      <motion.div
        animate={{ 
          rotate: [0, 10, -10, 0],
          y: [0, -5, 0]
        }}
        transition={{ 
          duration: 3, 
          repeat: Infinity,
          ease: 'easeInOut'
        }}
        className="absolute -top-2 -right-2 w-12 h-12 bg-gradient-to-r from-amber-400 to-orange-500 rounded-full flex items-center justify-center shadow-lg shadow-amber-500/50"
      >
        <motion.div
          animate={{ scale: [1, 1.1, 1] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          <span className="text-xl">🛒</span>
        </motion.div>
      </motion.div>
    </motion.div>
    
    <motion.div
      initial={{ y: 20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5, delay: 0.2 }}
      className="text-center max-w-sm"
    >
      <h3 className="text-lg font-bold text-white mb-2">Carrinho Vazio</h3>
      <p className="text-neutral-400 text-sm leading-relaxed mb-5">
        Explore nosso delicioso cardápio e adicione itens incríveis ao seu pedido!
      </p>
    </motion.div>
    
    <motion.div
      initial={{ y: 20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5, delay: 0.3 }}
    >
      <Button 
        onClick={onBrowseMenu}
        className="bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 shadow-lg shadow-amber-500/30 text-white px-6 py-5 text-sm font-semibold"
        size="lg"
      >
        Ver Cardápio
      </Button>
    </motion.div>
  </div>
);

export const EmptyFavorites = ({ onBrowseMenu }: { onBrowseMenu: () => void }) => (
  <div className="flex flex-col items-center justify-center py-12 px-4">
    <motion.div
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
      className="relative mb-6"
    >
      <motion.div
        animate={{ 
          boxShadow: [
            '0 0 0 0 rgba(245, 158, 11, 0.4)',
            '0 0 0 20px rgba(245, 158, 11, 0)',
          ]
        }}
        transition={{ duration: 2, repeat: Infinity }}
        className="w-28 h-28 rounded-full bg-gradient-to-br from-neutral-800 to-neutral-900 flex items-center justify-center relative shadow-2xl shadow-amber-500/20"
      >
        <Heart className="h-12 w-12 text-amber-500/40" strokeWidth={1.5} />
      </motion.div>
      
      <motion.div
        animate={{ 
          rotate: [0, 10, -10, 0],
          y: [0, -5, 0]
        }}
        transition={{ 
          duration: 3, 
          repeat: Infinity,
          ease: 'easeInOut'
        }}
        className="absolute -top-2 -right-2 w-12 h-12 bg-gradient-to-r from-red-400 to-pink-500 rounded-full flex items-center justify-center shadow-lg shadow-pink-500/50"
      >
        <motion.div
          animate={{ scale: [1, 1.1, 1] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          <span className="text-xl">❤️</span>
        </motion.div>
      </motion.div>
    </motion.div>
    
    <motion.div
      initial={{ y: 20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5, delay: 0.2 }}
      className="text-center max-w-sm"
    >
      <h3 className="text-lg font-bold text-white mb-2">Sem Favoritos</h3>
      <p className="text-neutral-400 text-sm leading-relaxed mb-5">
        Marque seus pratos favoritos e encontre-os facilmente aqui sempre que quiser!
      </p>
    </motion.div>
    
    <motion.div
      initial={{ y: 20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5, delay: 0.3 }}
    >
      <Button 
        onClick={onBrowseMenu}
        className="bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 shadow-lg shadow-amber-500/30 text-white px-6 py-5 text-sm font-semibold"
        size="lg"
      >
        Explorar Pratos
      </Button>
    </motion.div>
  </div>
);

export const EmptyOrders = ({ onStartOrder }: { onStartOrder: () => void }) => (
  <div className="flex flex-col items-center justify-center py-12 px-4">
    <motion.div
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
      className="relative mb-6"
    >
      <motion.div
        animate={{ 
          boxShadow: [
            '0 0 0 0 rgba(245, 158, 11, 0.4)',
            '0 0 0 20px rgba(245, 158, 11, 0)',
          ]
        }}
        transition={{ duration: 2, repeat: Infinity }}
        className="w-28 h-28 rounded-full bg-gradient-to-br from-neutral-800 to-neutral-900 flex items-center justify-center relative shadow-2xl shadow-amber-500/20"
      >
        <Package className="h-12 w-12 text-amber-500/40" strokeWidth={1.5} />
      </motion.div>
      
      <motion.div
        animate={{ 
          rotate: [0, 10, -10, 0],
          y: [0, -5, 0]
        }}
        transition={{ 
          duration: 3, 
          repeat: Infinity,
          ease: 'easeInOut'
        }}
        className="absolute -top-2 -right-2 w-12 h-12 bg-gradient-to-r from-blue-400 to-indigo-500 rounded-full flex items-center justify-center shadow-lg shadow-blue-500/50"
      >
        <motion.div
          animate={{ scale: [1, 1.1, 1] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          <span className="text-xl">📦</span>
        </motion.div>
      </motion.div>
    </motion.div>
    
    <motion.div
      initial={{ y: 20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5, delay: 0.2 }}
      className="text-center max-w-sm"
    >
      <h3 className="text-lg font-bold text-white mb-2">Nenhum Pedido Ainda</h3>
      <p className="text-neutral-400 text-sm leading-relaxed mb-5">
        Seu histórico de pedidos aparecerá aqui. Faça seu primeiro pedido agora!
      </p>
    </motion.div>
    
    <motion.div
      initial={{ y: 20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5, delay: 0.3 }}
    >
      <Button 
        onClick={onStartOrder}
        className="bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 shadow-lg shadow-amber-500/30 text-white px-6 py-5 text-sm font-semibold"
        size="lg"
      >
        Fazer Primeiro Pedido
      </Button>
    </motion.div>
  </div>
);
