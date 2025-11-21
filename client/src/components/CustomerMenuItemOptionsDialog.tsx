import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Checkbox } from '@/components/ui/checkbox';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Plus, Minus, ShoppingCart, X, Sparkles, Star } from 'lucide-react';
import { formatKwanza } from '@/lib/formatters';
import type { MenuItem, OptionGroup, Option } from '@shared/schema';
import type { SelectedOption } from '@/contexts/CartContext';
import { motion, AnimatePresence } from 'framer-motion';

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

  const handleQuantityChange = (groupId: string, optionId: string, delta: number) => {
    setSelections(prev => {
      const current = prev[groupId] || [];
      return {
        ...prev,
        [groupId]: current.map(s =>
          s.optionId === optionId
            ? { ...s, quantity: Math.max(1, s.quantity + delta) }
            : s
        ),
      };
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
      <DialogContent className="max-w-3xl max-h-[95vh] p-0 gap-0 overflow-hidden bg-gradient-to-br from-gray-50 via-white to-gray-50 border-gray-200">
        {/* Header with Image */}
        <div className="relative">
          {/* Image Section */}
          <div className="relative h-56 sm:h-72 bg-gradient-to-br from-gray-100 via-gray-50 to-white overflow-hidden">
            {menuItem.imageUrl ? (
              <>
                <img 
                  src={menuItem.imageUrl} 
                  alt={menuItem.name}
                  className="w-full h-full object-cover"
                />
                {/* Gradient Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
              </>
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-50">
                <Sparkles className="h-20 w-20 text-gray-300" />
              </div>
            )}
            
            {/* Close Button */}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onOpenChange(false)}
              className="absolute top-4 right-4 h-10 w-10 rounded-full bg-white/90 backdrop-blur-sm hover:bg-white text-gray-900 shadow-lg"
              data-testid="button-close-dialog"
            >
              <X className="h-5 w-5" />
            </Button>

            {/* Title Overlay */}
            <div className="absolute bottom-0 left-0 right-0 p-6 sm:p-8">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
              >
                <h2 className="text-2xl sm:text-3xl font-bold text-white mb-2 drop-shadow-lg" data-testid="text-options-dialog-title">
                  {menuItem.name}
                </h2>
                {menuItem.description && (
                  <p className="text-sm sm:text-base text-white/90 drop-shadow-md max-w-2xl" data-testid="text-options-dialog-description">
                    {menuItem.description}
                  </p>
                )}
              </motion.div>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="flex flex-col max-h-[calc(95vh-14rem)] sm:max-h-[calc(95vh-18rem)]">
          <ScrollArea className="flex-1 px-6 sm:px-8 py-6">
            {isLoading ? (
              <div className="flex justify-center py-12">
                <div className="animate-spin rounded-full h-10 w-10 border-3 border-gray-200 border-t-gray-900"></div>
              </div>
            ) : !hasOptions ? (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="py-8"
              >
                <div className="bg-gradient-to-br from-gray-50 to-white border border-gray-100 rounded-2xl p-6 text-center">
                  <Sparkles className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-600 font-medium">
                    Este item não possui opções de personalização.
                  </p>
                  <p className="text-sm text-gray-400 mt-1">
                    Ajuste apenas a quantidade desejada
                  </p>
                </div>
              </motion.div>
            ) : (
              <div className="space-y-6 pb-2">
                <AnimatePresence>
                  {optionGroups.map((group, groupIndex) => {
                    const groupSelections = selections[group.id] || [];
                    const selectionCount = groupSelections.length;
                    const isRequired = (group.minSelections ?? 0) > 0;
                    const isSingleSelect = group.type === 'single';

                    return (
                      <motion.div
                        key={group.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: groupIndex * 0.05 }}
                        className="relative rounded-2xl border border-gray-200 bg-white/50 backdrop-blur-sm p-5 sm:p-6 shadow-sm"
                      >
                        {/* Subtle gradient border effect */}
                        <div className="absolute inset-0 rounded-2xl border border-gray-100/50 pointer-events-none" 
                          style={{ 
                            maskImage: 'linear-gradient(135deg, white, transparent 60%)',
                            WebkitMaskImage: 'linear-gradient(135deg, white, transparent 60%)'
                          }} 
                        />
                        
                        <div className="space-y-4">
                          {/* Group Header */}
                          <div className="flex items-start justify-between gap-3">
                            <div className="flex-1">
                              <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2" data-testid={`text-group-name-${group.id}`}>
                                {group.name}
                                {isRequired && (
                                  <span className="text-red-500 text-sm">*</span>
                                )}
                              </h3>
                              <div className="flex flex-wrap gap-2 mt-2">
                                {isRequired && (
                                  <Badge className="bg-red-50 text-red-700 border border-red-200 text-xs font-medium">
                                    Obrigatório
                                  </Badge>
                                )}
                                <Badge variant="outline" className="border-gray-200 text-gray-600 text-xs font-medium">
                                  {isSingleSelect
                                    ? 'Escolha 1 opção'
                                    : group.maxSelections
                                    ? `Escolha até ${group.maxSelections}`
                                    : 'Múltipla escolha'}
                                </Badge>
                              </div>
                            </div>
                          </div>

                          <Separator className="bg-gray-100" />

                          {/* Options */}
                          {isSingleSelect ? (
                            <RadioGroup
                              value={groupSelections[0]?.optionId || ''}
                              onValueChange={(value) => handleSingleSelect(group.id, value)}
                            >
                              <div className="space-y-2">
                                {[...group.options]
                                  .sort((a, b) => (b.isRecommended || 0) - (a.isRecommended || 0))
                                  .map((option) => {
                                    const isRecommended = option.isRecommended === 1;
                                    const isSelected = groupSelections[0]?.optionId === option.id;
                                    const currentQuantity = groupSelections[0]?.quantity || 1;
                                    
                                    return (
                                      <div key={option.id} className="space-y-2">
                                        <motion.div
                                          whileHover={{ scale: 1.01 }}
                                          whileTap={{ scale: 0.99 }}
                                          className={`
                                            relative flex items-center gap-3 p-4 rounded-xl cursor-pointer transition-all duration-200
                                            ${isSelected 
                                              ? 'bg-gray-900 text-white shadow-md' 
                                              : isRecommended 
                                                ? 'bg-gradient-to-br from-amber-50 to-orange-50 border-2 border-amber-300 hover:border-amber-400' 
                                                : 'bg-white border border-gray-200 hover:border-gray-300 hover:shadow-sm'
                                            }
                                          `}
                                        >
                                          {isRecommended && !isSelected && (
                                            <div className="absolute -top-2 -right-2">
                                              <div className="bg-gradient-to-br from-amber-400 to-orange-500 text-white text-xs font-bold px-2 py-1 rounded-full shadow-md flex items-center gap-1">
                                                <Star className="h-3 w-3 fill-current" />
                                                Sugestão
                                              </div>
                                            </div>
                                          )}
                                          
                                          <RadioGroupItem
                                            value={option.id}
                                            id={option.id}
                                            className={isSelected ? 'border-white text-white' : ''}
                                            data-testid={`radio-option-${option.id}`}
                                          />
                                          <Label htmlFor={option.id} className="flex-1 cursor-pointer">
                                            <div className="flex items-center justify-between gap-3">
                                              <span className={`font-semibold ${isSelected ? 'text-white' : 'text-gray-900'}`}>
                                                {option.name}
                                              </span>
                                              {parseFloat(option.priceAdjustment) !== 0 && (
                                                <span className={`text-sm font-medium ${isSelected ? 'text-white/90' : 'text-gray-600'}`}>
                                                  {parseFloat(option.priceAdjustment) > 0 ? '+' : ''}
                                                  {formatKwanza(option.priceAdjustment)}
                                                </span>
                                              )}
                                            </div>
                                          </Label>
                                        </motion.div>
                                        {isSelected && (
                                          <motion.div
                                            initial={{ opacity: 0, height: 0 }}
                                            animate={{ opacity: 1, height: 'auto' }}
                                            exit={{ opacity: 0, height: 0 }}
                                            className="flex items-center gap-3 pl-10 pr-4"
                                          >
                                            <span className="text-sm text-gray-600">Quantidade:</span>
                                            <div className="flex items-center gap-2">
                                              <Button
                                                variant="outline"
                                                size="icon"
                                                className="h-7 w-7"
                                                onClick={(e) => {
                                                  e.preventDefault();
                                                  handleQuantityChange(group.id, option.id, -1);
                                                }}
                                                disabled={currentQuantity <= 1}
                                                data-testid={`button-decrease-option-${option.id}`}
                                              >
                                                <Minus className="h-3 w-3" />
                                              </Button>
                                              <span className="text-sm font-bold min-w-8 text-center" data-testid={`text-option-qty-${option.id}`}>
                                                {currentQuantity}
                                              </span>
                                              <Button
                                                variant="outline"
                                                size="icon"
                                                className="h-7 w-7"
                                                onClick={(e) => {
                                                  e.preventDefault();
                                                  handleQuantityChange(group.id, option.id, 1);
                                                }}
                                                data-testid={`button-increase-option-${option.id}`}
                                              >
                                                <Plus className="h-3 w-3" />
                                              </Button>
                                            </div>
                                            {parseFloat(option.priceAdjustment) !== 0 && currentQuantity > 1 && (
                                              <span className="text-xs text-gray-500 ml-auto">
                                                = {formatKwanza(parseFloat(option.priceAdjustment) * currentQuantity)}
                                              </span>
                                            )}
                                          </motion.div>
                                        )}
                                      </div>
                                    );
                                  })}
                              </div>
                            </RadioGroup>
                          ) : (
                            <div className="space-y-2">
                              {[...group.options]
                                .sort((a, b) => (b.isRecommended || 0) - (a.isRecommended || 0))
                                .map((option) => {
                                  const isSelected = groupSelections.some(s => s.optionId === option.id);
                                  const canSelect = !group.maxSelections || selectionCount < group.maxSelections || isSelected;
                                  const isRecommended = option.isRecommended === 1;
                                  const currentQuantity = groupSelections.find(s => s.optionId === option.id)?.quantity || 1;

                                  return (
                                    <div key={option.id} className="space-y-2">
                                      <motion.div
                                        whileHover={{ scale: canSelect ? 1.01 : 1 }}
                                        whileTap={{ scale: canSelect ? 0.99 : 1 }}
                                        className={`
                                          relative flex items-center gap-3 p-4 rounded-xl transition-all duration-200
                                          ${isSelected 
                                            ? 'bg-gray-900 text-white shadow-md' 
                                            : isRecommended 
                                              ? 'bg-gradient-to-br from-amber-50 to-orange-50 border-2 border-amber-300 hover:border-amber-400' 
                                              : 'bg-white border border-gray-200 hover:border-gray-300 hover:shadow-sm'
                                          }
                                          ${!canSelect ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
                                        `}
                                      >
                                        {isRecommended && !isSelected && (
                                          <div className="absolute -top-2 -right-2">
                                            <div className="bg-gradient-to-br from-amber-400 to-orange-500 text-white text-xs font-bold px-2 py-1 rounded-full shadow-md flex items-center gap-1">
                                              <Star className="h-3 w-3 fill-current" />
                                              Sugestão
                                            </div>
                                          </div>
                                        )}
                                        
                                        <Checkbox
                                          id={option.id}
                                          checked={isSelected}
                                          onCheckedChange={(checked) => handleMultiSelect(group.id, option.id, checked as boolean)}
                                          disabled={!canSelect}
                                          className={isSelected ? 'border-white data-[state=checked]:bg-white data-[state=checked]:text-gray-900' : ''}
                                          data-testid={`checkbox-option-${option.id}`}
                                        />
                                        <Label htmlFor={option.id} className={`flex-1 ${canSelect ? 'cursor-pointer' : 'cursor-not-allowed'}`}>
                                          <div className="flex items-center justify-between gap-3">
                                            <span className={`font-semibold ${isSelected ? 'text-white' : 'text-gray-900'}`}>
                                              {option.name}
                                            </span>
                                            {parseFloat(option.priceAdjustment) !== 0 && (
                                              <span className={`text-sm font-medium ${isSelected ? 'text-white/90' : 'text-gray-600'}`}>
                                                {parseFloat(option.priceAdjustment) > 0 ? '+' : ''}
                                                {formatKwanza(option.priceAdjustment)}
                                              </span>
                                            )}
                                          </div>
                                        </Label>
                                      </motion.div>
                                      {isSelected && (
                                        <motion.div
                                          initial={{ opacity: 0, height: 0 }}
                                          animate={{ opacity: 1, height: 'auto' }}
                                          exit={{ opacity: 0, height: 0 }}
                                          className="flex items-center gap-3 pl-10 pr-4"
                                        >
                                          <span className="text-sm text-gray-600">Quantidade:</span>
                                          <div className="flex items-center gap-2">
                                            <Button
                                              variant="outline"
                                              size="icon"
                                              className="h-7 w-7"
                                              onClick={(e) => {
                                                e.preventDefault();
                                                handleQuantityChange(group.id, option.id, -1);
                                              }}
                                              disabled={currentQuantity <= 1}
                                              data-testid={`button-decrease-option-${option.id}`}
                                            >
                                              <Minus className="h-3 w-3" />
                                            </Button>
                                            <span className="text-sm font-bold min-w-8 text-center" data-testid={`text-option-qty-${option.id}`}>
                                              {currentQuantity}
                                            </span>
                                            <Button
                                              variant="outline"
                                              size="icon"
                                              className="h-7 w-7"
                                              onClick={(e) => {
                                                e.preventDefault();
                                                handleQuantityChange(group.id, option.id, 1);
                                              }}
                                              data-testid={`button-increase-option-${option.id}`}
                                            >
                                              <Plus className="h-3 w-3" />
                                            </Button>
                                          </div>
                                          {parseFloat(option.priceAdjustment) !== 0 && currentQuantity > 1 && (
                                            <span className="text-xs text-gray-500 ml-auto">
                                              = {formatKwanza(parseFloat(option.priceAdjustment) * currentQuantity)}
                                            </span>
                                          )}
                                        </motion.div>
                                      )}
                                    </div>
                                  );
                                })}
                            </div>
                          )}
                        </div>
                      </motion.div>
                    );
                  })}
                </AnimatePresence>
              </div>
            )}
          </ScrollArea>

          {/* Footer */}
          <div className="border-t border-gray-200 bg-white/80 backdrop-blur-sm px-6 sm:px-8 py-5 space-y-4">
            {!validation.valid && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="bg-red-50 border border-red-200 text-red-700 text-sm p-4 rounded-xl"
              >
                {validation.errors.map((error, idx) => (
                  <div key={idx} className="flex items-start gap-2">
                    <span className="text-red-500 font-bold">•</span>
                    <span>{error}</span>
                  </div>
                ))}
              </motion.div>
            )}

            {/* Quantity Selector */}
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-100">
              <Label className="text-base font-semibold text-gray-900">Quantidade</Label>
              <div className="flex items-center gap-3">
                <Button
                  variant="outline"
                  size="icon"
                  className="h-10 w-10 rounded-full border-gray-300 hover:bg-gray-100"
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  data-testid="button-decrease-quantity"
                >
                  <Minus className="h-4 w-4" />
                </Button>
                <span className="w-12 text-center text-lg font-bold text-gray-900" data-testid="text-quantity">
                  {quantity}
                </span>
                <Button
                  variant="outline"
                  size="icon"
                  className="h-10 w-10 rounded-full border-gray-300 hover:bg-gray-100"
                  onClick={() => setQuantity(quantity + 1)}
                  data-testid="button-increase-quantity"
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Total and Add Button */}
            <div className="flex items-center gap-3">
              <div className="flex-1 bg-gradient-to-br from-gray-900 to-gray-800 text-white p-4 rounded-xl shadow-md">
                <div className="text-xs font-medium text-white/70 mb-1">Total</div>
                <div className="text-2xl font-bold" data-testid="text-total-price">
                  {formatKwanza(calculateTotal())}
                </div>
              </div>
              <Button
                size="lg"
                className="flex-1 h-auto py-4 bg-gray-900 hover:bg-gray-800 text-white rounded-xl shadow-lg hover:shadow-xl transition-all text-base font-bold"
                onClick={handleAddToCart}
                disabled={!validation.valid}
                data-testid="button-add-to-cart"
              >
                <ShoppingCart className="h-5 w-5 mr-2" />
                Adicionar ({quantity})
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
