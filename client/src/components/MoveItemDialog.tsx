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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useMutation } from '@tanstack/react-query';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { Loader2, ArrowRightLeft } from 'lucide-react';
import { Textarea } from '@/components/ui/textarea';
import {
  RadioGroup,
  RadioGroupItem,
} from '@/components/ui/radio-group';

interface Guest {
  id: string;
  name: string | null;
  guestNumber: number;
  status: string;
}

interface OrderItem {
  id: string;
  menuItemName: string;
  quantity: number;
  price: string;
}

interface MoveItemDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  item: OrderItem;
  currentGuest: Guest;
  availableGuests: Guest[];
  sessionId: string;
}

export function MoveItemDialog({
  open,
  onOpenChange,
  item,
  currentGuest,
  availableGuests,
  sessionId,
}: MoveItemDialogProps) {
  const [selectedGuestId, setSelectedGuestId] = useState<string>('');
  const [reasonType, setReasonType] = useState<string>('predefined');
  const [predefinedReason, setPredefinedReason] = useState<string>('');
  const [customReason, setCustomReason] = useState<string>('');
  const { toast } = useToast();

  const predefinedReasons = [
    { value: 'erro_pedido', label: 'Erro ao anotar o pedido' },
    { value: 'cliente_trocou', label: 'Cliente trocou de lugar' },
    { value: 'dividir_conta', label: 'Divisão de conta' },
    { value: 'pagamento_separado', label: 'Cliente quer pagar separadamente' },
    { value: 'correcao', label: 'Correção solicitada pelo cliente' },
  ];

  const moveItemMutation = useMutation({
    mutationFn: async (data: { itemId: string; newGuestId: string; reason?: string }) => {
      const response = await apiRequest(
        'PATCH',
        `/api/order-items/${data.itemId}/reassign`,
        { 
          newGuestId: data.newGuestId,
          reason: data.reason,
        }
      );
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/tables/sessions', sessionId, 'guests'] });
      toast({
        title: 'Item movido',
        description: 'O item foi movido com sucesso para outro cliente',
      });
      onOpenChange(false);
      setSelectedGuestId('');
      setPredefinedReason('');
      setCustomReason('');
      setReasonType('predefined');
    },
    onError: (error: Error) => {
      toast({
        title: 'Erro ao mover item',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  const handleMove = () => {
    if (!selectedGuestId) {
      toast({
        title: 'Selecione um cliente',
        description: 'Por favor, selecione o cliente de destino',
        variant: 'destructive',
      });
      return;
    }

    // Get reason based on type
    let reason = '';
    if (reasonType === 'predefined' && predefinedReason) {
      const selected = predefinedReasons.find(r => r.value === predefinedReason);
      reason = selected?.label || '';
    } else if (reasonType === 'custom' && customReason.trim()) {
      reason = customReason.trim();
    }

    moveItemMutation.mutate({
      itemId: item.id,
      newGuestId: selectedGuestId,
      reason: reason || undefined,
    });
  };

  const currentGuestName = currentGuest.name || `Cliente ${currentGuest.guestNumber}`;

  // Filter out current guest and guests that are already paid/left
  const eligibleGuests = availableGuests.filter(
    (g) => g.id !== currentGuest.id && g.status !== 'pago' && g.status !== 'saiu'
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ArrowRightLeft className="h-5 w-5" />
            Mover Item Entre Clientes
          </DialogTitle>
          <DialogDescription>
            Mova este item para outro cliente na mesma mesa
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Item Info */}
          <div className="rounded-lg border bg-muted/50 p-4">
            <div className="flex justify-between items-start">
              <div>
                <p className="font-medium">{item.menuItemName}</p>
                <p className="text-sm text-muted-foreground">
                  Quantidade: {item.quantity}
                </p>
              </div>
              <p className="font-semibold">{item.price}</p>
            </div>
          </div>

          {/* Current Guest */}
          <div>
            <Label className="text-muted-foreground">De:</Label>
            <div className="mt-1 rounded-lg border bg-background p-3">
              <p className="font-medium">{currentGuestName}</p>
            </div>
          </div>

          {/* Select Destination Guest */}
          <div>
            <Label htmlFor="guest-select">Para:</Label>
            <Select value={selectedGuestId} onValueChange={setSelectedGuestId}>
              <SelectTrigger id="guest-select" className="mt-1">
                <SelectValue placeholder="Selecione o cliente de destino" />
              </SelectTrigger>
              <SelectContent>
                {eligibleGuests.length === 0 ? (
                  <div className="px-2 py-6 text-center text-sm text-muted-foreground">
                    Nenhum cliente disponível
                  </div>
                ) : (
                  eligibleGuests.map((guest) => (
                    <SelectItem key={guest.id} value={guest.id}>
                      {guest.name || `Cliente ${guest.guestNumber}`}
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
            {eligibleGuests.length === 0 && (
              <p className="mt-2 text-sm text-muted-foreground">
                Não há outros clientes ativos nesta mesa
              </p>
            )}
          </div>

          {/* Reason Section */}
          <div className="space-y-3">
            <Label>Motivo (opcional):</Label>
            
            <RadioGroup value={reasonType} onValueChange={setReasonType}>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="predefined" id="predefined" />
                <Label htmlFor="predefined" className="font-normal cursor-pointer">
                  Motivo pré-definido
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="custom" id="custom" />
                <Label htmlFor="custom" className="font-normal cursor-pointer">
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
            onClick={() => onOpenChange(false)}
            disabled={moveItemMutation.isPending}
          >
            Cancelar
          </Button>
          <Button
            onClick={handleMove}
            disabled={moveItemMutation.isPending || !selectedGuestId || eligibleGuests.length === 0}
          >
            {moveItemMutation.isPending && (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            )}
            Mover Item
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
