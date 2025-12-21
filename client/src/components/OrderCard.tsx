import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { formatKwanza } from '@/lib/formatters';
import { format } from 'date-fns';
import { Clock, Eye, MoreVertical, X } from 'lucide-react';

interface OrderCardProps {
  order: any;
  onViewDetails: () => void;
  onStatusChange: (orderId: string, newStatus: string) => void;
  onCancel: (orderId: string) => void;
  compact?: boolean;
}

export function OrderCard({ 
  order, 
  onViewDetails, 
  onStatusChange, 
  onCancel,
  compact = false 
}: OrderCardProps) {
  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      pendente: 'bg-yellow-100 text-yellow-800 border-yellow-300 dark:bg-yellow-900/20 dark:text-yellow-400 dark:border-yellow-800',
      em_preparo: 'bg-blue-100 text-blue-800 border-blue-300 dark:bg-blue-900/20 dark:text-blue-400 dark:border-blue-800',
      pronto: 'bg-green-100 text-green-800 border-green-300 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800',
      entregue: 'bg-gray-100 text-gray-800 border-gray-300 dark:bg-gray-900/20 dark:text-gray-400 dark:border-gray-800',
      cancelado: 'bg-red-100 text-red-800 border-red-300 dark:bg-red-900/20 dark:text-red-400 dark:border-red-800',
    };
    return colors[status] || 'bg-gray-100 text-gray-800 border-gray-300';
  };

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      pendente: 'Pendente',
      em_preparo: 'Em Preparo',
      pronto: 'Pronto',
      entregue: 'Entregue',
      cancelado: 'Cancelado',
    };
    return labels[status] || status;
  };

  const canChangeStatus = ['pendente', 'em_preparo', 'pronto'].includes(order.status);
  const canCancel = order.status === 'pendente';

  return (
    <div className={`border rounded-lg bg-card hover:shadow-md transition-shadow duration-200 ${compact ? 'p-2 space-y-1.5' : 'p-3 space-y-2'}`}>
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-2">
          <span className={`font-mono font-medium text-foreground ${compact ? 'text-xs' : 'text-sm'}`}>
            #{order.id.slice(-6).toUpperCase()}
          </span>
          <Badge 
            variant="outline" 
            className={`${getStatusColor(order.status)} font-medium ${compact ? 'text-[10px] px-1.5 py-0' : ''}`}
          >
            {getStatusLabel(order.status)}
          </Badge>
        </div>
        <div className="flex items-center gap-1 text-xs text-muted-foreground">
          <Clock className="h-3 w-3" />
          <span>
            {format(new Date(order.createdAt), 'HH:mm')}
          </span>
        </div>
      </div>

      {/* Order Items */}
      {!compact && (
        <div className="space-y-0.5">
          {order.orderItems?.slice(0, 3).map((item: any) => (
            <div key={item.id} className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground truncate mr-2">
                • {item.quantity}x {item.menuItem?.name || 'Item'}
              </span>
              <span className="font-medium text-foreground whitespace-nowrap">
                {formatKwanza(Number(item.price) * item.quantity)}
              </span>
            </div>
          ))}
          {order.orderItems?.length > 3 && (
            <div className="text-xs text-muted-foreground italic">
              +{order.orderItems.length - 3} itens...
            </div>
          )}
        </div>
      )}

      {!compact && <Separator className="my-1.5" />}

      {/* Total */}
      <div className="flex items-center justify-between">
        <span className={`font-semibold text-foreground ${compact ? 'text-xs' : 'text-sm'}`}>
          {compact ? 'Total:' : 'Total:'}
        </span>
        <span className={`font-bold text-primary ${compact ? 'text-sm' : 'text-base'}`}>
          {formatKwanza(Number(order.totalAmount))}
        </span>
      </div>

      {/* Actions */}
      <div className={`flex gap-1.5 ${compact ? 'pt-1' : 'pt-2'}`}>
        <Button
          size={compact ? "sm" : "sm"}
          variant="outline"
          onClick={onViewDetails}
          className={`flex-1 ${compact ? 'h-7 text-xs' : ''}`}
        >
          <Eye className={`${compact ? 'h-3 w-3 mr-1' : 'h-4 w-4 mr-2'}`} />
          {compact ? 'Ver' : 'Ver Detalhes'}
        </Button>
        
        {canCancel && (
          <Button
            size={compact ? "sm" : "sm"}
            variant="destructive"
            onClick={() => onCancel(order.id)}
            title="Cancelar pedido"
            className={compact ? 'h-7 px-2' : ''}
          >
            <X className={compact ? 'h-3 w-3' : 'h-4 w-4'} />
          </Button>
        )}
        
        {canChangeStatus && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button 
                size={compact ? "sm" : "sm"} 
                variant="outline" 
                title="Alterar status"
                className={compact ? 'h-7 px-2' : ''}
              >
                <MoreVertical className={compact ? 'h-3 w-3' : 'h-4 w-4'} />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem 
                onClick={() => onStatusChange(order.id, 'pendente')}
                disabled={order.status === 'pendente'}
              >
                ⏳ Pendente
              </DropdownMenuItem>
              <DropdownMenuItem 
                onClick={() => onStatusChange(order.id, 'em_preparo')}
                disabled={order.status === 'em_preparo'}
              >
                👨‍🍳 Em Preparo
              </DropdownMenuItem>
              <DropdownMenuItem 
                onClick={() => onStatusChange(order.id, 'pronto')}
                disabled={order.status === 'pronto'}
              >
                ✅ Pronto
              </DropdownMenuItem>
              <DropdownMenuItem 
                onClick={() => onStatusChange(order.id, 'entregue')}
                disabled={order.status === 'entregue'}
              >
                🎉 Entregue
              </DropdownMenuItem>
              <Separator className="my-1" />
              <DropdownMenuItem 
                onClick={() => onCancel(order.id)}
                className="text-destructive focus:text-destructive"
              >
                ❌ Cancelar
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>
    </div>
  );
}
