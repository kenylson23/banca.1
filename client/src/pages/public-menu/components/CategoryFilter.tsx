import { motion } from 'framer-motion';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Utensils } from 'lucide-react';
import type { Category, MenuItem } from '@shared/schema';

interface CategoryFilterProps {
  categories: Category[];
  selectedCategory: string;
  onSelectCategory: (categoryId: string) => void;
  menuItems: MenuItem[];
  categoryImages?: Record<string, string>;
}

export const CategoryFilter = ({ 
  categories, 
  selectedCategory, 
  onSelectCategory,
  menuItems,
  categoryImages = {}
}: CategoryFilterProps) => {
  const getItemCount = (categoryId: string) => {
    return menuItems?.filter(item => item.isVisible === 1 && String(item.categoryId) === categoryId).length || 0;
  };

  return (
    <div className="relative">
      {/* Subtle gradient background */}
      <div className="absolute inset-0 bg-gradient-to-r from-black/20 via-transparent to-black/20 pointer-events-none" />
      
      <ScrollArea className="w-full">
        <div className="flex gap-3 pb-4 pt-2 px-1">
          {/* All Categories Button - Premium */}
          <motion.button
            onClick={() => onSelectCategory('all')}
            whileHover={{ scale: 1.08, y: -2 }}
            whileTap={{ scale: 0.95 }}
            className="group flex flex-col items-center gap-2 min-w-[72px] transition-all relative"
            data-testid="category-all"
          >
            <div className={`relative w-14 h-14 rounded-2xl flex items-center justify-center transition-all duration-300 ${
              selectedCategory === 'all' 
                ? 'bg-gradient-to-br from-amber-500 via-amber-600 to-orange-600 shadow-xl shadow-amber-500/30' 
                : 'bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/20 backdrop-blur-md'
            }`}>
              {/* Shine effect on hover */}
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-tr from-white/0 via-white/20 to-white/0 opacity-0 group-hover:opacity-100 transition-opacity" />
              
              <Utensils className={`h-5 w-5 relative z-10 transition-all ${
                selectedCategory === 'all' ? 'text-white' : 'text-white/70 group-hover:text-white/90'
              }`} />
              
              {/* Active indicator */}
              {selectedCategory === 'all' && (
                <motion.div
                  layoutId="activeCategory"
                  className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-white shadow-lg"
                  transition={{ type: "spring", stiffness: 380, damping: 30 }}
                />
              )}
            </div>
            <span className={`text-[11px] font-semibold leading-tight transition-colors ${
              selectedCategory === 'all' ? 'text-white' : 'text-white/60 group-hover:text-white/90'
            }`}>
              Todos
            </span>
          </motion.button>

          {/* Category Buttons - Premium */}
          {categories.map((category, idx) => {
            const categoryImage = categoryImages[category.id] || category.imageUrl;
            const itemCount = getItemCount(category.id);
            const isSelected = selectedCategory === category.id;
            
            return (
              <motion.button
                key={category.id}
                onClick={() => onSelectCategory(category.id)}
                initial={{ opacity: 0, y: 20, scale: 0.9 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ 
                  duration: 0.4, 
                  delay: idx * 0.05,
                  type: "spring",
                  stiffness: 200,
                  damping: 20
                }}
                whileHover={{ scale: 1.08, y: -2 }}
                whileTap={{ scale: 0.95 }}
                className="group flex flex-col items-center gap-2 min-w-[72px] transition-all relative"
                data-testid={`category-${category.id}`}
              >
                <div className={`relative w-14 h-14 rounded-2xl flex items-center justify-center transition-all duration-300 overflow-hidden ${
                  isSelected 
                    ? 'ring-2 ring-amber-400 ring-offset-2 ring-offset-black/50 shadow-xl shadow-amber-500/30' 
                    : 'bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/20 backdrop-blur-md hover:shadow-lg'
                }`}>
                  {categoryImage ? (
                    <>
                      <img 
                        src={categoryImage} 
                        alt={category.name} 
                        className={`w-full h-full object-cover transition-transform duration-300 ${
                          isSelected ? 'scale-110' : 'group-hover:scale-105'
                        }`} 
                      />
                      {/* Gradient overlay on active */}
                      {isSelected && (
                        <div className="absolute inset-0 bg-gradient-to-tr from-amber-500/30 via-amber-400/20 to-transparent" />
                      )}
                      {/* Shine effect on hover */}
                      <div className="absolute inset-0 bg-gradient-to-tr from-white/0 via-white/20 to-white/0 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </>
                  ) : (
                    <>
                      <Utensils className={`h-5 w-5 relative z-10 transition-all ${
                        isSelected ? 'text-amber-400' : 'text-white/70 group-hover:text-white/90'
                      }`} />
                      {/* Shine effect on hover */}
                      <div className="absolute inset-0 rounded-2xl bg-gradient-to-tr from-white/0 via-white/20 to-white/0 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </>
                  )}
                  
                  {/* Active indicator */}
                  {isSelected && (
                    <motion.div
                      layoutId="activeCategory"
                      className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-amber-400 shadow-lg shadow-amber-500/50"
                      transition={{ type: "spring", stiffness: 380, damping: 30 }}
                    />
                  )}
                </div>
                
                <div className="text-center space-y-0.5">
                  <span className={`text-[11px] font-semibold text-center line-clamp-1 max-w-[72px] block leading-tight transition-colors ${
                    isSelected ? 'text-white' : 'text-white/60 group-hover:text-white/90'
                  }`}>
                    {category.name}
                  </span>
                  {itemCount > 0 && (
                    <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded-full transition-colors ${
                      isSelected 
                        ? 'text-amber-400 bg-amber-500/10' 
                        : 'text-white/40 group-hover:text-white/60'
                    }`}>
                      {itemCount}
                    </span>
                  )}
                </div>
              </motion.button>
            );
          })}
        </div>
      </ScrollArea>
    </div>
  );
};
