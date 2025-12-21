import { CheckCircle, AlertCircle, Info, XCircle } from 'lucide-react';
import { formatKwanza } from '@/lib/formatters';

interface ToastWithImageProps {
  title: string;
  description?: string;
  imageUrl?: string;
  itemName?: string;
  itemPrice?: string | number;
  variant?: 'success' | 'error' | 'info' | 'warning';
}

export const toastWithImage = ({ 
  title, 
  description, 
  imageUrl, 
  itemName, 
  itemPrice,
  variant = 'success' 
}: ToastWithImageProps) => {
  const icons = {
    success: CheckCircle,
    error: XCircle,
    info: Info,
    warning: AlertCircle,
  };

  const colors = {
    success: {
      bg: 'bg-emerald-500/20',
      icon: 'text-emerald-500',
      border: 'border-emerald-500/20',
      gradient: 'from-emerald-50 to-white dark:from-emerald-950/20 dark:to-neutral-950'
    },
    error: {
      bg: 'bg-red-500/20',
      icon: 'text-red-500',
      border: 'border-red-500/20',
      gradient: 'from-red-50 to-white dark:from-red-950/20 dark:to-neutral-950'
    },
    info: {
      bg: 'bg-blue-500/20',
      icon: 'text-blue-500',
      border: 'border-blue-500/20',
      gradient: 'from-blue-50 to-white dark:from-blue-950/20 dark:to-neutral-950'
    },
    warning: {
      bg: 'bg-amber-500/20',
      icon: 'text-amber-500',
      border: 'border-amber-500/20',
      gradient: 'from-amber-50 to-white dark:from-amber-950/20 dark:to-neutral-950'
    }
  };

  const Icon = icons[variant];
  const colorScheme = colors[variant];

  return {
    title: (
      <div className="flex items-center gap-2">
        <div className={`w-8 h-8 rounded-full ${colorScheme.bg} flex items-center justify-center flex-shrink-0`}>
          <Icon className={`h-4 w-4 ${colorScheme.icon}`} />
        </div>
        <span className="font-semibold">{title}</span>
      </div>
    ),
    description: imageUrl && itemName ? (
      <div className="flex items-center gap-3 mt-3 ml-10">
        <img 
          src={imageUrl} 
          alt={itemName}
          className="w-14 h-14 rounded-xl object-cover ring-2 ring-white/10 shadow-lg"
        />
        <div className="flex-1 min-w-0">
          <p className="font-medium text-sm truncate">{itemName}</p>
          {itemPrice && (
            <p className="text-sm text-muted-foreground">
              {typeof itemPrice === 'string' ? itemPrice : formatKwanza(itemPrice)}
            </p>
          )}
          {description && (
            <p className="text-xs text-muted-foreground mt-1">{description}</p>
          )}
        </div>
      </div>
    ) : description ? (
      <p className="ml-10 mt-1">{description}</p>
    ) : null,
    className: `${colorScheme.border} bg-gradient-to-r ${colorScheme.gradient} backdrop-blur-sm shadow-xl`
  };
};

// Helper functions para usos comuns
export const toastAddedToCart = (item: { name: string; imageUrl?: string; price: string | number }) => 
  toastWithImage({
    title: 'Adicionado ao carrinho!',
    imageUrl: item.imageUrl,
    itemName: item.name,
    itemPrice: item.price,
    variant: 'success'
  });

export const toastRemovedFromCart = (itemName: string) => 
  toastWithImage({
    title: 'Removido do carrinho',
    description: itemName,
    variant: 'info'
  });

export const toastAddedToFavorites = (item: { name: string; imageUrl?: string }) => 
  toastWithImage({
    title: 'Adicionado aos favoritos!',
    imageUrl: item.imageUrl,
    itemName: item.name,
    description: '❤️ Salvo na sua lista',
    variant: 'success'
  });

export const toastRemovedFromFavorites = (itemName: string) => 
  toastWithImage({
    title: 'Removido dos favoritos',
    description: itemName,
    variant: 'info'
  });
