import { createContext, useContext, useState, ReactNode } from 'react';
import type { MenuItem } from '@shared/schema';

export interface SelectedOption {
  optionId: string;
  optionName: string;
  optionGroupName: string;
  priceAdjustment: string;
  quantity: number;
}

export interface CartItem {
  id: string;
  menuItem: MenuItem;
  quantity: number;
  selectedOptions: SelectedOption[];
}

interface CartContextType {
  items: CartItem[];
  orderNotes: string;
  addItem: (menuItem: MenuItem, selectedOptions?: SelectedOption[]) => void;
  removeItem: (itemId: string) => void;
  updateQuantity: (itemId: string, quantity: number) => void;
  setOrderNotes: (notes: string) => void;
  clearCart: () => void;
  getTotal: () => number;
  getItemCount: () => number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [orderNotes, setOrderNotes] = useState<string>('');

  const generateItemId = (menuItemId: string, selectedOptions: SelectedOption[]) => {
    const optionsKey = selectedOptions
      .sort((a, b) => a.optionId.localeCompare(b.optionId))
      .map(opt => `${opt.optionId}:${opt.quantity}`)
      .join(',');
    return `${menuItemId}_${optionsKey}`;
  };

  const addItem = (menuItem: MenuItem, selectedOptions: SelectedOption[] = []) => {
    setItems(currentItems => {
      const itemId = generateItemId(menuItem.id, selectedOptions);
      const existingItem = currentItems.find(item => item.id === itemId);
      
      if (existingItem) {
        return currentItems.map(item =>
          item.id === itemId
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      
      return [...currentItems, { id: itemId, menuItem, quantity: 1, selectedOptions }];
    });
  };

  const removeItem = (itemId: string) => {
    setItems(currentItems => currentItems.filter(item => item.id !== itemId));
  };

  const updateQuantity = (itemId: string, quantity: number) => {
    if (quantity <= 0) {
      removeItem(itemId);
      return;
    }
    
    setItems(currentItems =>
      currentItems.map(item =>
        item.id === itemId
          ? { ...item, quantity }
          : item
      )
    );
  };

  const clearCart = () => {
    setItems([]);
    setOrderNotes('');
  };

  const getTotal = () => {
    return items.reduce((total, item) => {
      const itemPrice = parseFloat(item.menuItem.price);
      const optionsPrice = item.selectedOptions.reduce((sum, opt) => {
        return sum + parseFloat(opt.priceAdjustment) * opt.quantity;
      }, 0);
      return total + (itemPrice + optionsPrice) * item.quantity;
    }, 0);
  };

  const getItemCount = () => {
    return items.reduce((count, item) => count + item.quantity, 0);
  };

  return (
    <CartContext.Provider
      value={{
        items,
        orderNotes,
        addItem,
        removeItem,
        updateQuantity,
        setOrderNotes,
        clearCart,
        getTotal,
        getItemCount,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}
