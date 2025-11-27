import { useState } from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Copy, Check, MapPin, Phone, User, Bike, ShoppingBag, Clock, Package, ExternalLink, CheckCircle2, X } from 'lucide-react';
import { SiWhatsapp } from 'react-icons/si';
import { formatKwanza } from '@/lib/formatters';
import type { Order } from '@shared/schema';
import { motion } from 'framer-motion';

interface ShareOrderDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  order: Order | null;
  restaurantName: string;
  restaurantSlug?: string;
}

export function ShareOrderDialog({ open, onOpenChange, order, restaurantName, restaurantSlug }: ShareOrderDialogProps) {
  const [copied, setCopied] = useState(false);

  if (!order) return null;

  const orderNumber = (order as any).orderNumber || order.id.substring(0, 8).toUpperCase();
  const trackingUrl = restaurantSlug 
    ? `${window.location.origin}/r/${restaurantSlug}/rastrear`
    : '';

  const getOrderTypeIcon = () => {
    switch (order.orderType) {
      case 'delivery':
        return <Bike className="h-4 w-4" />;
      case 'takeout':
        return <ShoppingBag className="h-4 w-4" />;
      default:
        return <Package className="h-4 w-4" />;
    }
  };

  const getOrderTypeText = () => {
    switch (order.orderType) {
      case 'delivery':
        return 'Delivery';
      case 'takeout':
        return 'Retirada';
      case 'mesa':
        return 'Mesa';
      default:
        return order.orderType;
    }
  };

  const getStatusColor = () => {
    const status = order.status as string;
    switch (status) {
      case 'pendente':
        return 'bg-amber-100 text-amber-700';
      case 'confirmado':
        return 'bg-blue-100 text-blue-700';
      case 'em_preparo':
      case 'preparo':
        return 'bg-purple-100 text-purple-700';
      case 'pronto':
        return 'bg-green-100 text-green-700';
      case 'servido':
      case 'entregue':
        return 'bg-gray-100 text-gray-700';
      default:
        return 'bg-gray-100 text-gray-600';
    }
  };

  const getStatusText = () => {
    const status = order.status as string;
    switch (status) {
      case 'pendente':
        return 'Aguardando Confirmação';
      case 'confirmado':
        return 'Confirmado';
      case 'em_preparo':
      case 'preparo':
        return 'Em Preparo';
      case 'pronto':
        return 'Pronto';
      case 'servido':
      case 'entregue':
        return 'Entregue';
      default:
        return status;
    }
  };

  const shareMessage = `
🍽️ *Pedido Confirmado - ${restaurantName}*

📋 *Número do Pedido:* ${orderNumber}
💰 *Total:* ${formatKwanza(order.totalAmount)}
🛵 *Tipo:* ${getOrderTypeText()}
${order.customerName ? `👤 *Nome:* ${order.customerName}` : ''}
${order.customerPhone ? `📞 *Telefone:* ${order.customerPhone}` : ''}
${order.deliveryAddress ? `📍 *Endereço:* ${order.deliveryAddress}` : ''}

${trackingUrl ? `🔍 *Rastrear pedido:*\n${trackingUrl}` : ''}
  `.trim();

  const copyOrderNumber = async () => {
    try {
      await navigator.clipboard.writeText(orderNumber);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Erro ao copiar:', err);
    }
  };

  const shareWhatsApp = () => {
    const encodedMessage = encodeURIComponent(shareMessage);
    window.open(`https://wa.me/?text=${encodedMessage}`, '_blank');
  };

  const orderItems = (order as any).items as Array<{ name?: string; menuItemName?: string; quantity: number; price: string; selectedOptions?: Array<{ optionName: string }> }> | undefined;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md p-0 overflow-hidden bg-white rounded-2xl [&>button]:hidden">
        <button
          type="button"
          onClick={() => onOpenChange(false)}
          className="absolute top-3 right-3 w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 hover:bg-gray-200 transition-colors z-10"
          data-testid="button-close-order-dialog"
        >
          <X className="h-4 w-4" />
        </button>

        <div className="relative bg-gradient-to-br from-green-600 via-green-500 to-emerald-600 pt-8 pb-12 px-6">
          <div className="absolute inset-0 opacity-10">
            <div className="absolute inset-0" style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
            }} />
          </div>
          
          <motion.div 
            className="relative flex flex-col items-center text-center"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
          >
            <motion.div 
              className="w-16 h-16 rounded-full bg-white/20 backdrop-blur-sm border-2 border-white/30 flex items-center justify-center mb-3"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
            >
              <CheckCircle2 className="h-8 w-8 text-white" />
            </motion.div>
            <h2 className="text-xl font-bold text-white mb-1">
              Pedido Confirmado!
            </h2>
            <p className="text-sm text-white/80">
              {restaurantName}
            </p>
          </motion.div>
        </div>

        <div className="-mt-6 mx-4 relative">
          <motion.div 
            className="bg-white rounded-xl shadow-lg border border-gray-100 p-4"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            <div className="flex items-center justify-between mb-3">
              <div>
                <p className="text-[10px] text-gray-500 uppercase tracking-wide">Número do Pedido</p>
                <p className="text-2xl font-bold font-mono text-gray-900">{orderNumber}</p>
              </div>
              <Button
                variant="outline"
                size="icon"
                onClick={copyOrderNumber}
                className="h-10 w-10 rounded-xl border-gray-200"
                data-testid="button-copy-order-number"
              >
                {copied ? (
                  <Check className="h-4 w-4 text-green-500" />
                ) : (
                  <Copy className="h-4 w-4 text-gray-500" />
                )}
              </Button>
            </div>
            
            <div className="flex items-center gap-2">
              <Badge className={`${getStatusColor()} border-0 text-xs px-2 py-1 rounded-lg`}>
                <Clock className="h-3 w-3 mr-1" />
                {getStatusText()}
              </Badge>
              <Badge className="bg-gray-100 text-gray-700 border-0 text-xs px-2 py-1 rounded-lg">
                {getOrderTypeIcon()}
                <span className="ml-1">{getOrderTypeText()}</span>
              </Badge>
            </div>
          </motion.div>
        </div>

        <div className="px-4 pt-4 pb-2 space-y-4">
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-gray-900">Detalhes do Pedido</h3>
            
            {orderItems && orderItems.length > 0 && (
              <div className="bg-gray-50 rounded-xl p-3 space-y-2">
                {orderItems.map((item, index) => (
                  <div key={index} className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-medium text-gray-900 bg-gray-200 rounded-md px-1.5 py-0.5">
                          {item.quantity}x
                        </span>
                        <span className="text-sm text-gray-700 truncate">
                          {item.name || item.menuItemName || 'Item'}
                        </span>
                      </div>
                      {item.selectedOptions && item.selectedOptions.length > 0 && (
                        <p className="text-[10px] text-gray-500 mt-0.5 pl-7">
                          {item.selectedOptions.map(opt => opt.optionName).join(', ')}
                        </p>
                      )}
                    </div>
                    <span className="text-sm font-medium text-gray-900 whitespace-nowrap">
                      {formatKwanza(parseFloat(item.price) * item.quantity)}
                    </span>
                  </div>
                ))}
                <Separator className="my-2" />
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold text-gray-900">Total</span>
                  <span className="text-lg font-bold text-gray-900">{formatKwanza(order.totalAmount)}</span>
                </div>
              </div>
            )}

            {!orderItems || orderItems.length === 0 && (
              <div className="bg-gray-50 rounded-xl p-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold text-gray-900">Total</span>
                  <span className="text-lg font-bold text-gray-900">{formatKwanza(order.totalAmount)}</span>
                </div>
              </div>
            )}

            <div className="space-y-2">
              {order.customerName && (
                <div className="flex items-center gap-2 text-sm">
                  <User className="h-4 w-4 text-gray-400" />
                  <span className="text-gray-600">Cliente:</span>
                  <span className="text-gray-900 font-medium">{order.customerName}</span>
                </div>
              )}
              {order.customerPhone && (
                <div className="flex items-center gap-2 text-sm">
                  <Phone className="h-4 w-4 text-gray-400" />
                  <span className="text-gray-600">Telefone:</span>
                  <span className="text-gray-900 font-medium">{order.customerPhone}</span>
                </div>
              )}
              {order.deliveryAddress && (
                <div className="flex items-start gap-2 text-sm">
                  <MapPin className="h-4 w-4 text-gray-400 mt-0.5" />
                  <span className="text-gray-600">Endereço:</span>
                  <span className="text-gray-900 font-medium flex-1">{order.deliveryAddress}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="px-4 pb-4 pt-2 space-y-2">
          <Button
            className="w-full h-11 bg-[#25D366] hover:bg-[#20BD5A] text-white font-semibold rounded-xl shadow-md"
            onClick={shareWhatsApp}
            data-testid="button-share-whatsapp"
          >
            <SiWhatsapp className="h-5 w-5 mr-2" />
            Compartilhar via WhatsApp
          </Button>
          
          {trackingUrl && (
            <Button
              variant="outline"
              className="w-full h-11 rounded-xl border-gray-200 text-gray-700 font-medium"
              onClick={() => window.open(trackingUrl, '_blank')}
              data-testid="button-track-order"
            >
              <ExternalLink className="h-4 w-4 mr-2" />
              Rastrear Pedido
            </Button>
          )}
          
          <Button
            variant="ghost"
            className="w-full h-10 text-gray-500 font-medium"
            onClick={() => onOpenChange(false)}
            data-testid="button-close-dialog"
          >
            Fechar
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
