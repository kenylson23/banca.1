import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  RadioGroup,
  RadioGroupItem,
} from '@/components/ui/radio-group';
import { MessageSquare } from 'lucide-react';

interface MoveItemReasonDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  itemName: string;
  sourceGuestName: string;
  targetGuestName: string;
  maxQuantity?: number; // Quantidade máxima disponível
  onConfirm: (reason: string, quantity?: number) => void;
  onCancel: () => void;
}

export function MoveItemReasonDialog({
  open,
  onOpenChange,
  itemName,
  sourceGuestName,
  targetGuestName,
  maxQuantity = 1,
  onConfirm,
  onCancel,
}: MoveItemReasonDialogProps) {
  const [reasonType, setReasonType] = useState<string>('predefined');
  const [predefinedReason, setPredefinedReason] = useState<string>('');
  const [customReason, setCustomReason] = useState<string>('');
  const [quantity, setQuantity] = useState(maxQuantity);

  const predefinedReasons = [
    { value: 'erro_pedido', label: 'Erro ao anotar o pedido' },
    { value: 'cliente_trocou', label: 'Cliente trocou de lugar' },
    { value: 'dividir_conta', label: 'Divisão de conta' },
    { value: 'pagamento_separado', label: 'Cliente quer pagar separadamente' },
    { value: 'correcao', label: 'Correção solicitada pelo cliente' },
  ];

  const handleConfirm = () => {
    let reason = '';
    if (reasonType === 'predefined' && predefinedReason) {
      const selected = predefinedReasons.find(r => r.value === predefinedReason);
      reason = selected?.label || '';
    } else if (reasonType === 'custom' && customReason.trim()) {
      reason = customReason.trim();
    }
    
    // Passar quantidade apenas se for menor que o máximo (mover parcial)
    onConfirm(reason || 'Sem motivo especificado', quantity < maxQuantity ? quantity : undefined);
    handleClose();
  };

  const handleSkip = () => {
    onConfirm('Sem motivo especificado', quantity < maxQuantity ? quantity : undefined);
    handleClose();
  };

  const handleClose = () => {
    setPredefinedReason('');
    setCustomReason('');
    setReasonType('predefined');
    setQuantity(maxQuantity);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            Adicionar Motivo
          </DialogTitle>
          <DialogDescription>
            Confirme a movimentação do item e adicione um motivo (opcional)
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Item movement info */}
          <div className="rounded-lg border bg-muted/50 p-4">
            <p className="text-sm font-medium mb-2">{itemName}</p>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <span>{sourceGuestName}</span>
              <span>→</span>
              <span>{targetGuestName}</span>
            </div>
          </div>

          {/* Quantity selector (se houver mais de 1) */}
          {maxQuantity > 1 && (
            <div className="space-y-2">
              <Label htmlFor="quantity">Quantidade a mover</Label>
              <div className="flex items-center gap-2">
                <Input
                  id="quantity"
                  type="number"
                  min="1"
                  max={maxQuantity}
                  value={quantity}
                  onChange={(e) => {
                    const val = parseInt(e.target.value) || 1;
                    setQuantity(Math.min(Math.max(val, 1), maxQuantity));
                  }}
                  className="w-24"
                />
                <span className="text-sm text-muted-foreground">
                  de {maxQuantity} {maxQuantity === 1 ? 'unidade' : 'unidades'}
                </span>
              </div>
              {quantity < maxQuantity && (
                <p className="text-xs text-orange-500">
                  ⚠️ Movendo parcialmente. {maxQuantity - quantity} {maxQuantity - quantity === 1 ? 'unidade ficará' : 'unidades ficarão'} com {sourceGuestName}
                </p>
              )}
            </div>
          )}

          {/* Reason Section */}
          <div className="space-y-3">
            <Label>Motivo (opcional):</Label>
            
            <RadioGroup value={reasonType} onValueChange={setReasonType}>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="predefined" id="predefined-drag" />
                <Label htmlFor="predefined-drag" className="font-normal cursor-pointer">
                  Motivo pré-definido
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="custom" id="custom-drag" />
                <Label htmlFor="custom-drag" className="font-normal cursor-pointer">
                  Motivo personalizado
                </Label>
              </div>
            </RadioGroup>

            {reasonType === 'predefined' ? (
              <Select value={predefinedReason} onValueChange={setPredefinedReason}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione um motivo" />
                </SelectTrigger>
                <SelectContent>
                  {predefinedReasons.map((reason) => (
                    <SelectItem key={reason.value} value={reason.value}>
                      {reason.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            ) : (
              <Textarea
                placeholder="Digite o motivo da mudança..."
                value={customReason}
                onChange={(e) => setCustomReason(e.target.value)}
                rows={3}
                maxLength={500}
                className="resize-none"
              />
            )}
            
            {reasonType === 'custom' && customReason.length > 0 && (
              <p className="text-xs text-muted-foreground text-right">
                {customReason.length}/500 caracteres
              </p>
            )}
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={onCancel}
          >
            Cancelar
          </Button>
          <Button
            variant="secondary"
            onClick={handleSkip}
          >
            Pular
          </Button>
          <Button
            onClick={handleConfirm}
          >
            Confirmar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
