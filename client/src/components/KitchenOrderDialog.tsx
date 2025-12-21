import { motion } from "framer-motion";
import { 
  Clock, 
  User, 
  MapPin, 
  Phone, 
  UtensilsCrossed,
  X,
  Printer,
  CheckCircle,
  Copy,
  Hash,
  Calendar
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { formatKwanza } from "@/lib/formatters";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { useToast } from "@/hooks/use-toast";
import type { Order, OrderItem, MenuItem } from "@shared/schema";

interface KitchenOrderDialogProps {
  order: Order & { 
    orderItems: Array<OrderItem & { menuItem: MenuItem }>;
    table?: { number: number };
    customer?: { name: string; phone?: string; address?: string };
  };
  open: boolean;
  onClose: () => void;
}

const statusColors = {
  pendente: "bg-yellow-500/10 text-yellow-700 dark:text-yellow-400 border-yellow-500/20",
  em_preparo: "bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-500/20",
  pronto: "bg-green-500/10 text-green-700 dark:text-green-400 border-green-500/20",
  servido: "bg-gray-500/10 text-gray-700 dark:text-gray-400 border-gray-500/20",
};

const statusLabels = {
  pendente: "Pendente",
  em_preparo: "Em Preparo",
  pronto: "Pronto",
  servido: "Servido",
};

const orderTypeLabels = {
  mesa: "Mesa",
  delivery: "Entrega",
  balcao: "Balcão",
};

export function KitchenOrderDialog({ order, open, onClose }: KitchenOrderDialogProps) {
  const { toast } = useToast();

  const handlePrint = () => {
    window.print();
    toast({
      title: "Impressão iniciada",
      description: "O pedido será impresso em instantes.",
    });
  };

  const handleCopy = () => {
    const text = `Pedido #${order.id}\n${order.orderItems.map(item => 
      `${item.quantity}x ${item.menuItem.name}${item.notes ? ` (${item.notes})` : ''}`
    ).join('\n')}`;
    navigator.clipboard.writeText(text);
    toast({
      title: "Copiado!",
      description: "Detalhes do pedido copiados para área de transferência.",
    });
  };

  const timeAgo = order.createdAt 
    ? Math.floor((Date.now() - new Date(order.createdAt).getTime()) / 60000) 
    : 0;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md max-h-[90vh] overflow-hidden flex flex-col p-0">
        {/* Header estilo ticket */}
        <div className="bg-gradient-to-br from-orange-500 to-amber-500 text-white p-6 relative overflow-hidden">
          {/* Pattern decorativo */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-0 left-0 w-full h-full" style={{
              backgroundImage: 'repeating-linear-gradient(45deg, transparent, transparent 10px, rgba(255,255,255,.1) 10px, rgba(255,255,255,.1) 20px)'
            }} />
          </div>
          
          <div className="relative">
            <div className="flex items-start justify-between mb-4 pr-8">
              <div>
                <p className="text-xs font-medium opacity-90 mb-1">PEDIDO</p>
                <h2 className="text-3xl font-bold font-mono tracking-tight">
                  #{order.orderNumber || order.id}
                </h2>
              </div>
              <Badge className={`${statusColors[order.status]} text-xs shrink-0`}>
                {statusLabels[order.status]}
              </Badge>
            </div>

            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-xs opacity-75 mb-1">Tipo</p>
                <p className="font-semibold flex items-center gap-1">
                  <UtensilsCrossed className="h-3 w-3" />
                  {orderTypeLabels[order.orderType]}
                  {order.table && ` ${order.table.number}`}
                </p>
              </div>
              <div>
                <p className="text-xs opacity-75 mb-1">Há</p>
                <p className="font-semibold flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  {timeAgo}min
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Body - scrollable */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Customer Info (if exists) */}
          {order.customer && (
            <div className="bg-muted/30 rounded-lg p-4 space-y-3">
              <div className="flex items-center gap-2 text-sm">
                <User className="h-4 w-4 text-primary" />
                <span className="font-semibold">{order.customer.name}</span>
              </div>
              {order.customer.phone && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Phone className="h-4 w-4" />
                  <span>{order.customer.phone}</span>
                </div>
              )}
              {order.orderType === "delivery" && order.customer.address && (
                <div className="flex items-start gap-2 text-sm text-muted-foreground">
                  <MapPin className="h-4 w-4 mt-0.5 shrink-0" />
                  <span className="flex-1">{order.customer.address}</span>
                </div>
              )}
            </div>
          )}

          {/* Order Items - Estilo ticket */}
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b pb-2">
              <h3 className="font-bold text-sm uppercase tracking-wide">
                Itens do Pedido
              </h3>
              <span className="text-xs text-muted-foreground">
                {order.orderItems.length} {order.orderItems.length === 1 ? 'item' : 'itens'}
              </span>
            </div>
            
            <div className="space-y-2">
              {order.orderItems.map((item, index) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="border-l-4 border-orange-500 pl-3 py-2"
                >
                  <div className="flex justify-between items-start gap-2">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-baseline gap-2">
                        <span className="font-bold text-lg font-mono text-orange-600">
                          {item.quantity}x
                        </span>
                        <p className="font-bold text-base flex-1">
                          {item.menuItem.name}
                        </p>
                      </div>
                      
                      {/* Options */}
                      {item.options && item.options.length > 0 && (
                        <div className="mt-1 ml-7 space-y-0.5">
                          {item.options.map((option, idx) => (
                            <div key={idx} className="text-xs text-muted-foreground">
                              + {option.quantity > 1 && `${option.quantity}x `}
                              {option.optionName}
                            </div>
                          ))}
                        </div>
                      )}
                      
                      {/* Notes */}
                      {item.notes && (
                        <div className="mt-2 ml-7 p-2 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded text-xs">
                          <span className="font-semibold text-amber-800 dark:text-amber-400">⚠ OBS:</span>
                          <span className="text-amber-700 dark:text-amber-300 ml-1">{item.notes}</span>
                        </div>
                      )}
                    </div>
                    
                    <p className="font-mono font-semibold text-sm shrink-0 text-muted-foreground">
                      {formatKwanza(item.price)}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Order Notes */}
          {order.orderNotes && (
            <div className="bg-amber-50 dark:bg-amber-950/30 border-2 border-amber-300 dark:border-amber-700 rounded-lg p-4">
              <div className="flex items-start gap-2">
                <span className="text-lg">📝</span>
                <div>
                  <h3 className="font-bold text-sm text-amber-800 dark:text-amber-400 uppercase mb-1">
                    Observações do Pedido
                  </h3>
                  <p className="text-sm text-amber-900 dark:text-amber-200">
                    {order.orderNotes}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer - Total e Ações */}
        <div className="border-t bg-muted/30 p-6 space-y-4">
          {/* Total */}
          <div className="flex justify-between items-center pb-4 border-b-2 border-dashed">
            <span className="text-base font-semibold uppercase tracking-wide">Total</span>
            <span className="text-3xl font-bold font-mono text-orange-600">
              {formatKwanza(order.totalAmount)}
            </span>
          </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-3 gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handlePrint}
              className="flex flex-col h-auto py-3 gap-1"
            >
              <Printer className="h-4 w-4" />
              <span className="text-xs">Imprimir</span>
            </Button>
            
            <Button
              variant="outline"
              size="sm"
              onClick={handleCopy}
              className="flex flex-col h-auto py-3 gap-1"
            >
              <Copy className="h-4 w-4" />
              <span className="text-xs">Copiar</span>
            </Button>
            
            <Button
              variant="default"
              size="sm"
              onClick={onClose}
              className="flex flex-col h-auto py-3 gap-1 bg-gradient-to-br from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600"
            >
              <CheckCircle className="h-4 w-4" />
              <span className="text-xs">Fechar</span>
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
