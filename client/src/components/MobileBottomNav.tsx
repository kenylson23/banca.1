import { ShoppingCart, Home, ClipboardList } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface MobileBottomNavProps {
  onCartClick: () => void;
  onMenuClick?: () => void;
  onOrdersClick: () => void;
  cartItemCount: number;
  activeView?: 'menu' | 'cart' | 'orders';
}

export function MobileBottomNav({ 
  onCartClick, 
  onMenuClick, 
  onOrdersClick, 
  cartItemCount,
  activeView = 'menu'
}: MobileBottomNavProps) {
  return (
    <nav 
      className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-card border-t border-border safe-area-inset-bottom"
      role="navigation"
      aria-label="Navegação principal mobile"
    >
      <div className="grid grid-cols-3 gap-1 p-2">
        <Button
          variant={activeView === 'menu' ? 'default' : 'ghost'}
          size="default"
          onClick={onMenuClick}
          className="flex-col h-auto py-3 gap-1"
          aria-label="Menu do restaurante"
          aria-current={activeView === 'menu' ? 'page' : undefined}
          data-testid="button-mobile-menu"
        >
          <Home className="h-5 w-5" aria-hidden="true" />
          <span className="text-xs font-medium">Menu</span>
        </Button>

        <Button
          variant={activeView === 'cart' ? 'default' : 'ghost'}
          size="default"
          onClick={onCartClick}
          className="flex-col h-auto py-3 gap-1 relative"
          aria-label={`Carrinho de compras, ${cartItemCount} ${cartItemCount === 1 ? 'item' : 'itens'}`}
          aria-current={activeView === 'cart' ? 'page' : undefined}
          data-testid="button-mobile-cart"
        >
          <div className="relative">
            <ShoppingCart className="h-5 w-5" aria-hidden="true" />
            {cartItemCount > 0 && (
              <Badge 
                variant="destructive" 
                className="absolute -top-2 -right-2 h-5 w-5 flex items-center justify-center p-0 text-xs"
                aria-hidden="true"
              >
                {cartItemCount > 9 ? '9+' : cartItemCount}
              </Badge>
            )}
          </div>
          <span className="text-xs font-medium">Carrinho</span>
        </Button>

        <Button
          variant={activeView === 'orders' ? 'default' : 'ghost'}
          size="default"
          onClick={onOrdersClick}
          className="flex-col h-auto py-3 gap-1"
          aria-label="Meus pedidos"
          aria-current={activeView === 'orders' ? 'page' : undefined}
          data-testid="button-mobile-orders"
        >
          <ClipboardList className="h-5 w-5" aria-hidden="true" />
          <span className="text-xs font-medium">Pedidos</span>
        </Button>
      </div>
    </nav>
  );
}
