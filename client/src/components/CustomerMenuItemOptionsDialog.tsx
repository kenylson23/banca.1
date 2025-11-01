import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Checkbox } from '@/components/ui/checkbox';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Plus, Minus, ShoppingCart } from 'lucide-react';
import { formatKwanza } from '@/lib/formatters';
import type { MenuItem, OptionGroup, Option } from '@shared/schema';
import type { SelectedOption } from '@/contexts/CartContext';

interface CustomerMenuItemOptionsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  menuItem: MenuItem;
  onAddToCart: (menuItem: MenuItem, selectedOptions: SelectedOption[]) => void;
}

interface OptionSelection {
  optionId: string;
  quantity: number;
}

export function CustomerMenuItemOptionsDialog({
  open,
  onOpenChange,
  menuItem,
  onAddToCart,
}: CustomerMenuItemOptionsDialogProps) {
  const [selections, setSelections] = useState<Record<string, OptionSelection[]>>({});
  const [quantity, setQuantity] = useState(1);

  const { data: optionGroups, isLoading } = useQuery<Array<OptionGroup & { options: Option[] }>>({
    queryKey: ['/api/public/menu-items', menuItem.id, 'option-groups'],
    enabled: open,
  });

  useEffect(() => {
    if (!open) {
      setSelections({});
      setQuantity(1);
    }
  }, [open]);

  const handleSingleSelect = (groupId: string, optionId: string) => {
    setSelections(prev => ({
      ...prev,
      [groupId]: [{ optionId, quantity: 1 }],
    }));
  };

  const handleMultiSelect = (groupId: string, optionId: string, checked: boolean) => {
    setSelections(prev => {
      const current = prev[groupId] || [];
      if (checked) {
        return {
          ...prev,
          [groupId]: [...current, { optionId, quantity: 1 }],
        };
      } else {
        return {
          ...prev,
          [groupId]: current.filter(s => s.optionId !== optionId),
        };
      }
    });
  };

  const calculateTotal = (): number => {
    const basePrice = parseFloat(menuItem.price);
    let optionsPrice = 0;

    if (optionGroups) {
      for (const group of optionGroups) {
        const groupSelections = selections[group.id] || [];
        for (const selection of groupSelections) {
          const option = group.options.find(o => o.id === selection.optionId);
          if (option) {
            optionsPrice += parseFloat(option.priceAdjustment) * selection.quantity;
          }
        }
      }
    }

    return (basePrice + optionsPrice) * quantity;
  };

  const validateSelections = (): { valid: boolean; errors: string[] } => {
    const errors: string[] = [];

    if (!optionGroups) {
      return { valid: true, errors };
    }

    for (const group of optionGroups) {
      const groupSelections = selections[group.id] || [];
      const selectionCount = groupSelections.length;

      if (group.minSelections && selectionCount < group.minSelections) {
        errors.push(`${group.name}: selecione pelo menos ${group.minSelections} ${group.minSelections === 1 ? 'opção' : 'opções'}`);
      }

      if (group.maxSelections && selectionCount > group.maxSelections) {
        errors.push(`${group.name}: selecione no máximo ${group.maxSelections} ${group.maxSelections === 1 ? 'opção' : 'opções'}`);
      }
    }

    return { valid: errors.length === 0, errors };
  };

  const handleAddToCart = () => {
    const validation = validateSelections();
    
    if (!validation.valid) {
      return;
    }

    const selectedOptions: SelectedOption[] = [];

    if (optionGroups) {
      for (const group of optionGroups) {
        const groupSelections = selections[group.id] || [];
        for (const selection of groupSelections) {
          const option = group.options.find(o => o.id === selection.optionId);
          if (option) {
            selectedOptions.push({
              optionId: option.id,
              optionName: option.name,
              optionGroupName: group.name,
              priceAdjustment: option.priceAdjustment,
              quantity: selection.quantity,
            });
          }
        }
      }
    }

    onAddToCart(menuItem, selectedOptions);
    onOpenChange(false);
  };

  const validation = validateSelections();
  const hasOptions = optionGroups && optionGroups.length > 0;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] flex flex-col p-0">
        <DialogHeader className="p-6 pb-4">
          <DialogTitle className="text-xl" data-testid="text-options-dialog-title">
            {menuItem.name}
          </DialogTitle>
          <DialogDescription data-testid="text-options-dialog-description">
            Personalize seu pedido
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="flex-1 px-6">
          {isLoading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : !hasOptions ? (
            <div className="py-4">
              <p className="text-sm text-muted-foreground">
                Este prato não possui opções de personalização.
              </p>
            </div>
          ) : (
            <div className="space-y-6 pb-4">
              {optionGroups.map((group) => {
                const groupSelections = selections[group.id] || [];
                const selectionCount = groupSelections.length;
                const isRequired = (group.minSelections ?? 0) > 0;
                const isSingleSelect = group.type === 'single';

                return (
                  <div key={group.id} className="space-y-3">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h3 className="font-semibold text-base" data-testid={`text-group-name-${group.id}`}>
                          {group.name}
                        </h3>
                        <div className="flex gap-2 mt-1">
                          {isRequired && (
                            <Badge variant="secondary" className="text-xs">
                              Obrigatório
                            </Badge>
                          )}
                          <Badge variant="outline" className="text-xs">
                            {isSingleSelect
                              ? 'Escolha 1'
                              : group.maxSelections
                              ? `Escolha até ${group.maxSelections}`
                              : 'Múltipla escolha'}
                          </Badge>
                        </div>
                      </div>
                    </div>

                    <Separator />

                    {isSingleSelect ? (
                      <RadioGroup
                        value={groupSelections[0]?.optionId || ''}
                        onValueChange={(value) => handleSingleSelect(group.id, value)}
                      >
                        <div className="space-y-2">
                          {group.options.map((option) => (
                            <div key={option.id} className="flex items-center space-x-3 p-3 rounded-md hover-elevate">
                              <RadioGroupItem
                                value={option.id}
                                id={option.id}
                                data-testid={`radio-option-${option.id}`}
                              />
                              <Label htmlFor={option.id} className="flex-1 cursor-pointer">
                                <div className="flex items-center justify-between">
                                  <span className="font-medium">{option.name}</span>
                                  {parseFloat(option.priceAdjustment) !== 0 && (
                                    <span className="text-sm text-muted-foreground">
                                      {parseFloat(option.priceAdjustment) > 0 ? '+' : ''}
                                      {formatKwanza(option.priceAdjustment)}
                                    </span>
                                  )}
                                </div>
                              </Label>
                            </div>
                          ))}
                        </div>
                      </RadioGroup>
                    ) : (
                      <div className="space-y-2">
                        {group.options.map((option) => {
                          const isSelected = groupSelections.some(s => s.optionId === option.id);
                          const canSelect = !group.maxSelections || selectionCount < group.maxSelections || isSelected;

                          return (
                            <div key={option.id} className="flex items-center space-x-3 p-3 rounded-md hover-elevate">
                              <Checkbox
                                id={option.id}
                                checked={isSelected}
                                onCheckedChange={(checked) => handleMultiSelect(group.id, option.id, checked as boolean)}
                                disabled={!canSelect}
                                data-testid={`checkbox-option-${option.id}`}
                              />
                              <Label htmlFor={option.id} className="flex-1 cursor-pointer">
                                <div className="flex items-center justify-between">
                                  <span className="font-medium">{option.name}</span>
                                  {parseFloat(option.priceAdjustment) !== 0 && (
                                    <span className="text-sm text-muted-foreground">
                                      {parseFloat(option.priceAdjustment) > 0 ? '+' : ''}
                                      {formatKwanza(option.priceAdjustment)}
                                    </span>
                                  )}
                                </div>
                              </Label>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </ScrollArea>

        <div className="border-t p-6 space-y-4">
          {!validation.valid && (
            <div className="bg-destructive/10 text-destructive text-sm p-3 rounded-md">
              {validation.errors.map((error, idx) => (
                <div key={idx}>• {error}</div>
              ))}
            </div>
          )}

          <div className="flex items-center justify-between">
            <Label className="text-sm font-medium">Quantidade</Label>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="icon"
                className="h-9 w-9"
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                data-testid="button-decrease-quantity"
              >
                <Minus className="h-4 w-4" />
              </Button>
              <span className="w-12 text-center font-medium" data-testid="text-quantity">
                {quantity}
              </span>
              <Button
                variant="outline"
                size="icon"
                className="h-9 w-9"
                onClick={() => setQuantity(quantity + 1)}
                data-testid="button-increase-quantity"
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <span className="text-lg font-semibold">Total</span>
            <span className="text-2xl font-bold text-primary" data-testid="text-total-price">
              {formatKwanza(calculateTotal())}
            </span>
          </div>

          <DialogFooter>
            <Button
              className="w-full min-h-11"
              onClick={handleAddToCart}
              disabled={!validation.valid}
              data-testid="button-add-to-cart"
            >
              <ShoppingCart className="h-5 w-5 mr-2" />
              Adicionar ao Carrinho ({quantity})
            </Button>
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  );
}
