import { useState, useRef } from 'react';
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';
import { Plus, Heart } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ProductCard3DProps {
  name: string;
  description?: string;
  price: string;
  imageUrl?: string;
  badges?: React.ReactNode;
  isFavorite?: boolean;
  isAvailable?: boolean;
  onAddToCart?: (e: React.MouseEvent) => void;
  onToggleFavorite?: (e: React.MouseEvent) => void;
  onClick?: () => void;
  className?: string;
}

export function ProductCard3D({
  name,
  description,
  price,
  imageUrl,
  badges,
  isFavorite = false,
  isAvailable = true,
  onAddToCart,
  onToggleFavorite,
  onClick,
  className,
}: ProductCard3DProps) {
  const [isHovered, setIsHovered] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  // Mouse position for tilt effect
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  // Spring animations for smooth tilt
  const rotateX = useSpring(useTransform(y, [-0.5, 0.5], [5, -5]), {
    stiffness: 300,
    damping: 30,
  });
  const rotateY = useSpring(useTransform(x, [-0.5, 0.5], [-5, 5]), {
    stiffness: 300,
    damping: 30,
  });

  // Shine effect position
  const shineX = useTransform(x, [-0.5, 0.5], [0, 100]);
  const shineY = useTransform(y, [-0.5, 0.5], [0, 100]);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;

    const rect = cardRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    const mouseX = (e.clientX - centerX) / (rect.width / 2);
    const mouseY = (e.clientY - centerY) / (rect.height / 2);

    x.set(mouseX);
    y.set(mouseY);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    x.set(0);
    y.set(0);
  };

  return (
    <motion.div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={handleMouseLeave}
      onClick={onClick}
      style={{
        rotateX,
        rotateY,
        transformStyle: 'preserve-3d',
      }}
      whileHover={{ scale: 1.02 }}
      className={cn(
        'relative rounded-2xl overflow-hidden cursor-pointer',
        'bg-gradient-to-br from-neutral-900 to-neutral-950',
        'border border-neutral-800',
        'transition-shadow duration-300',
        isHovered && 'shadow-2xl shadow-amber-500/10',
        !isAvailable && 'opacity-60 cursor-not-allowed',
        className
      )}
    >
      {/* Glassmorphism overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-white/5 to-transparent pointer-events-none" />

      {/* Shine effect on hover */}
      {isHovered && (
        <motion.div
          className="absolute inset-0 opacity-30 pointer-events-none"
          style={{
            background: `radial-gradient(circle at ${shineX.get()}% ${shineY.get()}%, rgba(251, 191, 36, 0.15), transparent 50%)`,
          }}
        />
      )}

      {/* Image Container */}
      <div className="relative aspect-square overflow-hidden bg-neutral-900">
        {imageUrl ? (
          <motion.img
            src={imageUrl}
            alt={name}
            className="w-full h-full object-cover"
            animate={{
              scale: isHovered ? 1.1 : 1,
            }}
            transition={{ duration: 0.4, ease: [0.34, 1.56, 0.64, 1] }}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-neutral-800">
            <span className="text-neutral-600 text-4xl">🍽️</span>
          </div>
        )}

        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-neutral-900 via-neutral-900/20 to-transparent" />

        {/* Badges */}
        {badges && (
          <div className="absolute top-2 left-2 flex flex-wrap gap-1">
            {badges}
          </div>
        )}

        {/* Favorite button */}
        {onToggleFavorite && (
          <motion.button
            onClick={(e) => {
              e.stopPropagation();
              onToggleFavorite(e);
            }}
            className={cn(
              'absolute top-2 right-2 w-8 h-8 rounded-full',
              'flex items-center justify-center',
              'backdrop-blur-md transition-all duration-300',
              isFavorite
                ? 'bg-amber-500 text-white'
                : 'bg-black/30 text-white/70 hover:bg-black/50'
            )}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            <Heart className={cn('h-4 w-4', isFavorite && 'fill-current')} />
          </motion.button>
        )}

        {/* Add to cart button - appears on hover */}
        {onAddToCart && isAvailable && (
          <motion.button
            onClick={(e) => {
              e.stopPropagation();
              onAddToCart(e);
            }}
            initial={{ y: 20, opacity: 0 }}
            animate={{
              y: isHovered ? 0 : 20,
              opacity: isHovered ? 1 : 0,
            }}
            transition={{ duration: 0.3, ease: [0.34, 1.56, 0.64, 1] }}
            className={cn(
              'absolute bottom-2 right-2',
              'w-10 h-10 rounded-full',
              'bg-gradient-to-r from-amber-500 to-orange-500',
              'flex items-center justify-center',
              'shadow-lg shadow-amber-500/30',
              'hover:shadow-xl hover:shadow-amber-500/50',
              'transition-shadow duration-300'
            )}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            <Plus className="h-5 w-5 text-white" />
          </motion.button>
        )}

        {/* Unavailable overlay */}
        {!isAvailable && (
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center">
            <span className="text-white text-sm font-semibold bg-red-500/90 px-3 py-1 rounded-full">
              Indisponível
            </span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-3 space-y-2">
        <div>
          <h3 className="font-semibold text-sm text-white line-clamp-1">
            {name}
          </h3>
          {description && (
            <p className="text-xs text-neutral-400 line-clamp-2 mt-1">
              {description}
            </p>
          )}
        </div>

        {/* Price with glass effect */}
        <motion.div
          className={cn(
            'inline-flex items-center px-3 py-1.5 rounded-lg',
            'bg-gradient-to-r from-amber-500/10 to-orange-500/10',
            'border border-amber-500/20',
            'backdrop-blur-sm'
          )}
          animate={{
            scale: isHovered ? 1.05 : 1,
          }}
          transition={{ duration: 0.3 }}
        >
          <span className="text-sm font-bold bg-gradient-to-r from-amber-400 to-orange-400 bg-clip-text text-transparent">
            {price}
          </span>
        </motion.div>
      </div>
    </motion.div>
  );
}
