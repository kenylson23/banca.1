import { Badge } from './badge';
import { Flame, Sparkles, Leaf, Star, Clock, TrendingUp } from 'lucide-react';
import { motion } from 'framer-motion';

interface ProductBadgeProps {
  variant: 'new' | 'popular' | 'vegetarian' | 'vegan' | 'trending' | 'limited' | 'bestseller';
  className?: string;
  animated?: boolean;
}

export const ProductBadge = ({ variant, className = '', animated = true }: ProductBadgeProps) => {
  const badges = {
    new: {
      label: 'Novo',
      emoji: '✨',
      icon: Sparkles,
      className: 'bg-gradient-to-r from-purple-500 to-pink-500 text-white border-0 shadow-lg',
      animate: true
    },
    popular: {
      label: 'Popular',
      emoji: '🔥',
      icon: Flame,
      className: 'bg-gradient-to-r from-orange-500 to-red-500 text-white border-0 shadow-lg',
      animate: false
    },
    trending: {
      label: 'Tendência',
      emoji: '📈',
      icon: TrendingUp,
      className: 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white border-0 shadow-lg',
      animate: false
    },
    bestseller: {
      label: 'Mais Vendido',
      emoji: '⭐',
      icon: Star,
      className: 'bg-gradient-to-r from-amber-500 to-yellow-500 text-white border-0 shadow-lg',
      animate: false
    },
    vegetarian: {
      label: 'Vegetariano',
      emoji: '🌱',
      icon: Leaf,
      className: 'bg-green-500/20 text-green-400 border-green-500/30 backdrop-blur-sm',
      animate: false
    },
    vegan: {
      label: 'Vegano',
      emoji: '🥬',
      icon: Leaf,
      className: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30 backdrop-blur-sm',
      animate: false
    },
    limited: {
      label: 'Edição Limitada',
      emoji: '⏰',
      icon: Clock,
      className: 'bg-gradient-to-r from-indigo-500 to-purple-500 text-white border-0 shadow-lg',
      animate: true
    }
  };

  const config = badges[variant];
  const Icon = config.icon;

  const badge = (
    <Badge className={`${config.className} text-[10px] sm:text-xs font-bold px-2 sm:px-3 py-1 ${className}`}>
      <span className="mr-1">{config.emoji}</span>
      <span className="hidden sm:inline">{config.label}</span>
    </Badge>
  );

  if (animated && config.animate) {
    return (
      <motion.div
        animate={{ 
          scale: [1, 1.05, 1],
        }}
        transition={{ 
          duration: 2, 
          repeat: Infinity,
          ease: 'easeInOut'
        }}
      >
        {badge}
      </motion.div>
    );
  }

  return badge;
};

// Componentes específicos para uso direto
export const NewBadge = () => <ProductBadge variant="new" />;
export const PopularBadge = () => <ProductBadge variant="popular" />;
export const TrendingBadge = () => <ProductBadge variant="trending" />;
export const BestsellerBadge = () => <ProductBadge variant="bestseller" />;
export const VegetarianBadge = () => <ProductBadge variant="vegetarian" />;
export const VeganBadge = () => <ProductBadge variant="vegan" />;
export const LimitedBadge = () => <ProductBadge variant="limited" />;

// Helper para determinar badges automaticamente baseado em dados
export const getProductBadges = (item: {
  isNew?: boolean;
  isPopular?: boolean;
  isTrending?: boolean;
  isBestseller?: boolean;
  isVegetarian?: boolean;
  isVegan?: boolean;
  isLimited?: boolean;
  orderCount?: number;
  createdAt?: string;
}) => {
  const badges: Array<'new' | 'popular' | 'vegetarian' | 'vegan' | 'trending' | 'limited' | 'bestseller'> = [];

  // Detectar "Novo" automaticamente (menos de 7 dias)
  if (item.isNew || (item.createdAt && 
      (Date.now() - new Date(item.createdAt).getTime()) < 7 * 24 * 60 * 60 * 1000)) {
    badges.push('new');
  }

  // Badges explícitos
  if (item.isBestseller) badges.push('bestseller');
  if (item.isPopular || (item.orderCount && item.orderCount > 50)) badges.push('popular');
  if (item.isTrending) badges.push('trending');
  if (item.isLimited) badges.push('limited');
  if (item.isVegan) badges.push('vegan');
  else if (item.isVegetarian) badges.push('vegetarian'); // Vegan overrides vegetarian

  return badges;
};
