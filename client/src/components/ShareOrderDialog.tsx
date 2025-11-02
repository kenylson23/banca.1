import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Share2, Copy, Check } from 'lucide-react';
import { SiWhatsapp } from 'react-icons/si';
import { formatKwanza } from '@/lib/formatters';
import type { Order } from '@shared/schema';

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

  const orderNumber = order.id.substring(0, 8).toUpperCase();
  const trackingUrl = restaurantSlug 
    ? `${window.location.origin}/r/${restaurantSlug}/rastrear`
    : '';

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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Share2 className="h-5 w-5" />
            Pedido Confirmado!
          </DialogTitle>
          <DialogDescription>
            Seu pedido foi enviado com sucesso
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="bg-muted p-4 rounded-lg space-y-2">
            <div className="text-sm text-muted-foreground">Número do Pedido</div>
            <div className="flex items-center justify-between gap-2">
              <div className="text-2xl font-bold font-mono">{orderNumber}</div>
              <Button
                variant="outline"
                size="icon"
                onClick={copyOrderNumber}
                data-testid="button-copy-order-number"
              >
                {copied ? (
                  <Check className="h-4 w-4 text-green-500" />
                ) : (
                  <Copy className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>

          <div className="space-y-2">
            <div className="text-sm font-medium">Informações do Pedido</div>
            <div className="text-sm space-y-1">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Total:</span>
                <span className="font-semibold">{formatKwanza(order.totalAmount)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Tipo:</span>
                <span>{getOrderTypeText()}</span>
              </div>
              {order.customerName && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Nome:</span>
                  <span>{order.customerName}</span>
                </div>
              )}
            </div>
          </div>

          <div className="pt-2 space-y-2">
            <Button
              className="w-full"
              onClick={shareWhatsApp}
              data-testid="button-share-whatsapp"
            >
              <SiWhatsapp className="h-4 w-4 mr-2" />
              Compartilhar via WhatsApp
            </Button>
            
            {trackingUrl && (
              <Button
                variant="outline"
                className="w-full"
                onClick={() => window.open(trackingUrl, '_blank')}
                data-testid="button-track-order"
              >
                Rastrear Pedido
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
