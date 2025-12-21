import { memo } from 'react';
import { Button } from '@/components/ui/button';
import { Plus, Minus, Trash2, Utensils } from 'lucide-react';
import { formatKwanza } from '@/lib/formatters';
import type { MenuItem } from '@shared/schema';
import type { SelectedOption } from '@/contexts/CartContext';

interface CartItemData {
  id: string;
  menuItem: MenuItem;
  quantity: number;
  selectedOptions: SelectedOption[];
}

interface CartItemProps {
  item: CartItemData;
  onUpdateQuantity: (id: string, quantity: number) => void;
  onRemove: (id: string) => void;
}

export const CartItem = memo(({ item, onUpdateQuantity, onRemove }: CartItemProps) => {
  const calculateItemTotal = () => {
    const basePrice = parseFloat(item.menuItem.price);
    const optionsTotal = item.selectedOptions.reduce(
      (sum, opt) => sum + parseFloat(opt.priceAdjustment) * opt.quantity, 
      0
    );
    return (basePrice + optionsTotal) * item.quantity;
  };

  return (
    <div
      className="p-2.5 rounded-xl bg-white border border-gray-200 shadow-sm"
      data-testid={`cart-item-${item.id}`}
    >
      <div className="flex gap-3">
        {/* Image */}
        <div className="w-16 h-16 flex-shrink-0 rounded-lg overflow-hidden bg-gray-100">
          {item.menuItem.imageUrl ? (
            <img
              src={item.menuItem.imageUrl}
              alt={item.menuItem.name}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <Utensils className="h-6 w-6 text-gray-300" />
            </div>
          )}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <h4 className="font-semibold text-sm text-gray-900 leading-tight line-clamp-2">
              {item.menuItem.name}
            </h4>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onRemove(item.id)}
              data-testid={`button-remove-${item.id}`}
              className="h-6 w-6 rounded-full text-gray-400 hover:text-red-500 hover:bg-red-50 flex-shrink-0"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </Button>
          </div>

          {item.menuItem.description && (
            <p className="text-[10px] text-gray-500 line-clamp-1 mt-0.5">
              {item.menuItem.description}
            </p>
          )}

          {/* Options */}
          {item.selectedOptions.length > 0 && (
            <div className="mt-1 flex flex-wrap gap-1">
              {item.selectedOptions.map((opt, idx) => (
                <span key={idx} className="inline-flex items-center text-[9px] bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded-md">
                  {opt.optionName}
                  {parseFloat(opt.priceAdjustment) > 0 && (
                    <span className="ml-0.5 text-gray-400">+{formatKwanza(opt.priceAdjustment)}</span>
                  )}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Price and Quantity */}
      <div className="flex items-center justify-between mt-2 pt-2 border-t border-gray-100">
        <span className="font-bold text-sm text-gray-900">
          {formatKwanza(calculateItemTotal())}
        </span>
        <div className="flex items-center gap-1 bg-gray-100 rounded-full p-0.5">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onUpdateQuantity(item.id, item.quantity - 1)}
            data-testid={`button-decrease-${item.id}`}
            className="h-7 w-7 rounded-full bg-white hover:bg-gray-50 text-gray-600 shadow-sm"
          >
            <Minus className="h-3.5 w-3.5" />
          </Button>
          <span className="w-6 text-center font-bold text-sm text-gray-900" data-testid={`text-quantity-${item.id}`}>
            {item.quantity}
          </span>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onUpdateQuantity(item.id, item.quantity + 1)}
            data-testid={`button-increase-${item.id}`}
            className="h-7 w-7 rounded-full bg-gray-900 hover:bg-gray-800 text-white shadow-sm"
          >
            <Plus className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>
    </div>
  );
}, (prevProps, nextProps) => {
  // Evita re-render se nada mudou
  return (
    prevProps.item.id === nextProps.item.id &&
    prevProps.item.quantity === nextProps.item.quantity &&
    prevProps.item.selectedOptions.length === nextProps.item.selectedOptions.length
  );
});
