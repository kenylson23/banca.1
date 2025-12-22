import { motion } from 'framer-motion';
import { Badge } from '@/components/ui/badge';
import { ProductCard3D } from '@/components/ui/product-card-3d';
import { formatKwanza } from '@/lib/formatters';
import type { MenuItem } from '@/types/menu';

interface ProductGridProps {
  items: MenuItem[];
  onAddToCart: (item: MenuItem, e: React.MouseEvent<HTMLButtonElement>) => void;
  onItemClick: (item: MenuItem) => void;
  isFavorite: (id: string) => boolean;
  toggleFavorite: (id: string) => void;
  onFavoriteToggle: (item: MenuItem, wasFavorite: boolean) => void;
}

export function ProductGrid({
  items,
  onAddToCart,
  onItemClick,
  isFavorite,
  toggleFavorite,
  onFavoriteToggle,
}: ProductGridProps) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
      {items.map((item, index) => {
        const itemPrice = typeof item.price === 'string' ? item.price : Number(item.price).toFixed(2);
        const itemOriginalPrice = item.originalPrice 
          ? (typeof item.originalPrice === 'string' ? item.originalPrice : Number(item.originalPrice).toFixed(2)) 
          : null;
        const hasPromo = itemOriginalPrice && parseFloat(itemOriginalPrice) > parseFloat(itemPrice);

        // Determine badges
        let badge = undefined;
        if (hasPromo) {
          badge = (
            <Badge className="bg-red-500 text-white text-[8px] px-1.5 py-0.5 border-0">
              Promo
            </Badge>
          );
        } else if (item.isNew) {
          badge = (
            <Badge className="bg-blue-500 text-white text-[8px] px-1.5 py-0.5 border-0">
              Novo
            </Badge>
          );
        }

        return (
          <motion.div
            key={item.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: index * 0.05 }}
          >
            <ProductCard3D
              name={item.name}
              description={item.description || ''}
              price={formatKwanza(itemPrice)}
              imageUrl={item.imageUrl || undefined}
              badges={badge}
              isFavorite={isFavorite(item.id)}
              isAvailable={item.isAvailable === 1}
              onAddToCart={(e) => onAddToCart(item, e)}
              onToggleFavorite={(e) => {
                e.stopPropagation();
                const wasFavorite = isFavorite(item.id);
                toggleFavorite(item.id);
                onFavoriteToggle(item, wasFavorite);
              }}
              onClick={() => onItemClick(item)}
              className="h-full"
            />
          </motion.div>
        );
      })}
    </div>
  );
}
