import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Receipt, TrendingDown, Plus, AlertCircle } from 'lucide-react';
import { formatKwanza } from '@/lib/formatters';

interface CheckoutSummaryPanelProps {
  subtotal: number;
  discount?: number;
  discountType?: 'percentual' | 'valor';
  serviceFee?: number;
  serviceFeeType?: 'percentual' | 'valor';
  paidAmount?: number;
  itemsCount?: number;
  guestsCount?: number;
}

export function CheckoutSummaryPanel({
  subtotal,
  discount = 0,
  discountType = 'valor',
  serviceFee = 0,
  serviceFeeType = 'valor',
  paidAmount = 0,
  itemsCount = 0,
  guestsCount = 0,
}: CheckoutSummaryPanelProps) {
  
  // Calculate discount amount
  const discountAmount = discountType === 'percentual' 
    ? (subtotal * discount) / 100 
    : discount;
  
  // Calculate service fee amount
  const serviceFeeAmount = serviceFeeType === 'percentual'
    ? (subtotal * serviceFee) / 100
    : serviceFee;
  
  // Calculate total
  const total = subtotal - discountAmount + serviceFeeAmount;
  const remaining = total - paidAmount;
  
  const hasAdjustments = discount > 0 || serviceFee > 0;
  
  return (
    <Card className="sticky top-4 shadow-lg border-2">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center gap-2">
          <Receipt className="h-5 w-5" />
          Resumo do Pedido
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        
        {/* Info básica */}
        <div className="flex justify-between text-sm text-muted-foreground">
          <span>{itemsCount} {itemsCount === 1 ? 'item' : 'itens'}</span>
          {guestsCount > 0 && (
            <span>{guestsCount} {guestsCount === 1 ? 'pessoa' : 'pessoas'}</span>
          )}
        </div>
        
        <Separator />
        
        {/* Subtotal */}
        <div className="flex justify-between items-center">
          <span className="text-sm font-medium">Subtotal</span>
          <span className="text-sm">{formatKwanza(subtotal)}</span>
        </div>
        
        {/* Adjustments */}
        {hasAdjustments && (
          <>
            <Separator className="my-2" />
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <AlertCircle className="h-3 w-3" />
                <span>Ajustes Aplicados</span>
              </div>
              
              {discount > 0 && (
                <div className="flex justify-between items-center text-sm">
                  <div className="flex items-center gap-2">
                    <TrendingDown className="h-4 w-4 text-green-600" />
                    <span className="text-green-600">
                      Desconto {discountType === 'percentual' ? `${discount}%` : ''}
                    </span>
                  </div>
                  <span className="text-green-600 font-medium">
                    -{formatKwanza(discountAmount)}
                  </span>
                </div>
              )}
              
              {serviceFee > 0 && (
                <div className="flex justify-between items-center text-sm">
                  <div className="flex items-center gap-2">
                    <Plus className="h-4 w-4 text-orange-600" />
                    <span className="text-orange-600">
                      Taxa {serviceFeeType === 'percentual' ? `${serviceFee}%` : ''}
                    </span>
                  </div>
                  <span className="text-orange-600 font-medium">
                    +{formatKwanza(serviceFeeAmount)}
                  </span>
                </div>
              )}
            </div>
          </>
        )}
        
        <Separator className="my-3" />
        
        {/* Total */}
        <div className="flex justify-between items-center">
          <span className="text-lg font-bold">TOTAL</span>
          <span className="text-lg font-bold">{formatKwanza(total)}</span>
        </div>
        
        {/* Paid amount */}
        {paidAmount > 0 && (
          <>
            <Separator />
            <div className="space-y-2 text-sm">
              <div className="flex justify-between text-muted-foreground">
                <span>Pago</span>
                <span>{formatKwanza(paidAmount)}</span>
              </div>
              <div className="flex justify-between font-semibold">
                <span>Restante</span>
                <span className={remaining > 0 ? 'text-orange-600' : 'text-green-600'}>
                  {formatKwanza(remaining)}
                </span>
              </div>
            </div>
          </>
        )}
        
        {/* Badge if adjustments */}
        {hasAdjustments && (
          <div className="pt-2">
            <Badge variant="secondary" className="w-full justify-center">
              {[discount > 0 && 'Desconto', serviceFee > 0 && 'Taxa'].filter(Boolean).join(' + ')} aplicado
            </Badge>
          </div>
        )}
        
      </CardContent>
    </Card>
  );
}
