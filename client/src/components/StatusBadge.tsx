import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

type OrderStatus = 'pendente' | 'em_preparo' | 'pronto' | 'servido';

interface StatusBadgeProps {
  status: OrderStatus;
  className?: string;
  withAnimation?: boolean;
}

const statusConfig = {
  pendente: {
    variant: 'pending' as const,
    label: 'Pendente',
    ariaLabel: 'Status: Pedido pendente, aguardando preparação',
  },
  em_preparo: {
    variant: 'in-progress' as const,
    label: 'Em Preparo',
    ariaLabel: 'Status: Pedido em preparação na cozinha',
  },
  pronto: {
    variant: 'ready' as const,
    label: 'Pronto',
    ariaLabel: 'Status: Pedido pronto para ser servido',
  },
  servido: {
    variant: 'served' as const,
    label: 'Servido',
    ariaLabel: 'Status: Pedido já foi servido ao cliente',
  },
};

export function StatusBadge({ status, className, withAnimation = false }: StatusBadgeProps) {
  const config = statusConfig[status];

  return (
    <Badge
      variant={config.variant}
      className={cn(
        'font-medium',
        withAnimation && status === 'pendente' && 'animate-pulse-success',
        className
      )}
      aria-label={config.ariaLabel}
      role="status"
    >
      {config.label}
    </Badge>
  );
}
