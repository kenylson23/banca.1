import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { formatKwanza } from '@/lib/formatters';
import { MoreHorizontal, Pencil, X } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface GuestDetailPanelProps {
  guest: any;
  orders: any[];
  subtotal: string;
  onEditOrder: (order: any) => void;
  onCancelOrder: (order: any) => void;
  onNewOrder?: () => void;
}

const orderStatusConfig = {
  pending: { label: 'Pendente', gradient: 'from-yellow-500 to-orange-500' },
  confirmed: { label: 'Confirmado', gradient: 'from-blue-500 to-cyan-500' },
  preparing: { label: 'Preparando', gradient: 'from-purple-500 to-pink-500' },
  ready: { label: 'Pronto', gradient: 'from-green-500 to-emerald-500' },
  delivered: { label: 'Entregue', gradient: 'from-emerald-500 to-teal-500' },
  cancelled: { label: 'Cancelado', gradient: 'from-red-500 to-red-600' },
};

export function GuestDetailPanel({
  guest,
  orders,
  subtotal,
  onEditOrder,
  onCancelOrder,
  onNewOrder,
}: GuestDetailPanelProps) {
  // 🔧 FIX: Safety check for undefined guest
  if (!guest) {
    return (
      <div className="p-8 text-center text-slate-500">
        <p>Selecione um convidado para ver os detalhes</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Guest Header */}
      <div className="flex items-center gap-4 pb-4 border-b">
        <div className="h-16 w-16 rounded-full bg-gradient-to-br from-indigo-500 to-violet-500 flex items-center justify-center text-white text-2xl font-bold">
          {guest.name ? guest.name.charAt(0).toUpperCase() : '#'}
        </div>
        <div className="flex-1">
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
            {guest.name || `Convidado ${guest.guestNumber || guest.seatNumber}`}
          </h2>
          <p className="text-sm text-slate-600 dark:text-slate-400">
            {orders.length} {orders.length === 1 ? 'pedido' : 'pedidos'}
          </p>
        </div>
        <div className="text-right">
          <p className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-violet-600 bg-clip-text text-transparent">
            {formatKwanza(parseFloat(subtotal))}
          </p>
          <p className="text-xs text-slate-500">Subtotal</p>
        </div>
      </div>

      {/* Orders List */}
      <div>
        <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
          Pedidos
        </h3>

        {orders.length > 0 ? (
          <div className="space-y-4">
            {orders.map((order: any) => {
              const orderStatus = order.status as keyof typeof orderStatusConfig;
              const statusCfg = orderStatusConfig[orderStatus] || orderStatusConfig.pending;

              return (
                <div
                  key={order.id}
                  className="p-4 bg-slate-50 dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-700 hover:border-indigo-300 transition-colors"
                >
                  {/* Order Header */}
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <h4 className="font-semibold text-slate-900 dark:text-white">
                        Pedido #{order.orderNumber || order.id.slice(0, 8).toUpperCase()}
                      </h4>
                      <Badge className={`bg-gradient-to-r ${statusCfg.gradient} text-white border-0`}>
                        {statusCfg.label}
                      </Badge>
                    </div>
                    
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Ações</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem 
                          onClick={() => onEditOrder(order)}
                          disabled={order.status === 'cancelled'}
                        >
                          <Pencil className="h-4 w-4 mr-2" />
                          Editar Pedido
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem 
                          className="text-red-600"
                          onClick={() => onCancelOrder(order)}
                          disabled={order.status === 'cancelled'}
                        >
                          <X className="h-4 w-4 mr-2" />
                          Cancelar
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>

                  {/* Order Items */}
                  <div className="space-y-2">
                    {order.items?.map((item: any) => (
                      <div key={item.id} className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-slate-700 dark:text-slate-300">
                            {item.quantity}x
                          </span>
                          <span className="text-slate-600 dark:text-slate-400">
                            {item.name}
                          </span>
                        </div>
                        <span className="font-semibold text-slate-900 dark:text-white">
                          {formatKwanza(item.price * item.quantity)}
                        </span>
                      </div>
                    ))}
                  </div>

                  {/* Order Total */}
                  <div className="mt-3 pt-3 border-t border-slate-200 dark:border-slate-700 flex justify-between items-center">
                    <span className="text-sm text-slate-600 dark:text-slate-400">Total do pedido</span>
                    <span className="text-lg font-bold text-indigo-600 dark:text-indigo-400">
                      {formatKwanza(parseFloat(order.totalPrice || 0))}
                    </span>
                  </div>

                  {/* Order Notes */}
                  {order.notes && (
                    <div className="mt-2 p-2 bg-amber-50 dark:bg-amber-900/20 rounded text-sm text-amber-800 dark:text-amber-200">
                      <strong>Obs:</strong> {order.notes}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-8 text-slate-500">
            <p>Nenhum pedido ainda</p>
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="pt-4 border-t space-y-2">
        <Button 
          className="w-full bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800"
          onClick={onNewOrder}
          disabled={!onNewOrder}
        >
          + Novo Pedido para {guest.name || 'esta pessoa'}
        </Button>
        <Button 
          variant="outline" 
          className="w-full"
          onClick={() => {
            // TODO: Implementar histórico completo
            alert('Funcionalidade de histórico em desenvolvimento');
          }}
        >
          Ver Histórico Completo
        </Button>
      </div>
    </div>
  );
}
