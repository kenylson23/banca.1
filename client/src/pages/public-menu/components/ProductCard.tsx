import { memo } from 'react';
import { motion } from 'framer-motion';
import { Plus, Heart, Utensils } from 'lucide-react';
import { formatKwanza } from '@/lib/formatters';
import { calculateItemPrice } from '../utils/pricing';
import type { MenuItem } from '@shared/schema';

interface ProductCardProps {
  item: MenuItem;
  isFavorite: boolean;
  onToggleFavorite: (itemId: string) => void;
  onAddToCart: (item: MenuItem) => void;
  animationDelay?: number;
}

export const ProductCard = memo(({ 
  item, 
  isFavorite, 
  onToggleFavorite, 
  onAddToCart,
  animationDelay = 0 
}: ProductCardProps) => {
  const { price, originalPrice, hasPromo } = calculateItemPrice(item);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ 
        duration: 0.4, 
        delay: animationDelay,
        type: "spring",
        stiffness: 200,
        damping: 20
      }}
      whileHover={{ y: -6, scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={() => onAddToCart(item)}
      className="group relative bg-gradient-to-br from-white/10 via-white/5 to-white/5 backdrop-blur-md border border-white/10 rounded-3xl overflow-hidden cursor-pointer transition-all hover:border-amber-400/40 hover:shadow-2xl hover:shadow-amber-500/20"
      data-testid={`menu-item-${item.id}`}
    >
      {/* Shine effect on hover */}
      <div className="absolute inset-0 bg-gradient-to-tr from-white/0 via-white/5 to-white/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      
      {/* Image */}
      <div className="relative h-20 overflow-hidden">
        {item.imageUrl ? (
          <>
            <img
              src={item.imageUrl}
              alt={item.name}
              className="w-full h-full object-cover transition-all duration-500 group-hover:scale-110 group-hover:rotate-1"
            />
            {/* Gradient overlay - always visible */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
          </>
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-neutral-800 via-neutral-900 to-black">
            <Utensils className="h-6 w-6 text-white/20" />
          </div>
        )}
        
        {/* Enhanced overlay on hover */}
        <div className="absolute inset-0 bg-gradient-to-t from-amber-500/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        
        {/* Promo Badge - Premium */}
        {hasPromo && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 500, damping: 15 }}
            className="absolute top-2 left-2 bg-gradient-to-br from-red-500 to-red-600 px-2 py-0.5 rounded-full shadow-lg shadow-red-500/30"
          >
            <span className="text-[9px] font-bold text-white">PROMO</span>
          </motion.div>
        )}
        
        {/* Favorite Button - Enhanced */}
        <motion.button 
          whileHover={{ scale: 1.15 }}
          whileTap={{ scale: 0.9 }}
          className={`absolute top-2 right-2 w-7 h-7 rounded-full flex items-center justify-center backdrop-blur-md border transition-all shadow-lg ${
            isFavorite 
              ? 'bg-red-500 border-red-400 shadow-red-500/30' 
              : 'bg-black/40 border-white/10 hover:bg-black/60 hover:border-white/20'
          }`}
          onClick={(e) => {
            e.stopPropagation();
            onToggleFavorite(item.id);
          }}
        >
          <Heart className={`h-3.5 w-3.5 transition-all ${
            isFavorite ? 'text-white fill-white scale-110' : 'text-white/80'
          }`} />
        </motion.button>
      </div>

      {/* Content - Enhanced spacing */}
      <div className="p-3 space-y-2">
        <div>
          <h3 className="font-semibold text-xs text-white line-clamp-2 group-hover:text-amber-400 transition-colors leading-tight mb-1" data-testid={`text-item-name-${item.id}`}>
            {item.name}
          </h3>
          {item.description && (
            <p className="text-[10px] text-white/50 line-clamp-1 leading-tight">
              {item.description}
            </p>
          )}
        </div>
        
        <div className="flex items-center justify-between pt-1">
          <div className="flex flex-col">
            {hasPromo && originalPrice && (
              <span className="text-[9px] text-white/40 line-through">
                {formatKwanza(originalPrice)}
              </span>
            )}
            <span className={`font-bold text-sm ${hasPromo ? 'text-amber-400' : 'text-white'}`} data-testid={`text-item-price-${item.id}`}>
              {formatKwanza(price)}
            </span>
          </div>
          
          {/* Add to cart button - Premium */}
          <motion.div
            whileHover={{ scale: 1.1, rotate: 90 }}
            whileTap={{ scale: 0.9 }}
            className="w-8 h-8 rounded-full bg-gradient-to-br from-amber-400 via-amber-500 to-amber-600 flex items-center justify-center group-hover:shadow-lg group-hover:shadow-amber-500/50 transition-all"
          >
            <Plus className="h-4 w-4 text-white font-bold" />
          </motion.div>
        </div>
      </div>

      {/* Bottom accent line */}
      <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-amber-500/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
    </motion.div>
  );
}, (prevProps, nextProps) => {
  // Custom comparison para evitar re-renders desnecessários
  return (
    prevProps.item.id === nextProps.item.id &&
    prevProps.isFavorite === nextProps.isFavorite &&
    prevProps.animationDelay === nextProps.animationDelay
  );
});
