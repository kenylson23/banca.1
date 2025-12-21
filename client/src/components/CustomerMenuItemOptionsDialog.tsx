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
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Plus, Minus, ShoppingCart, X, Star, ZoomIn, ChevronDown, UtensilsCrossed } from 'lucide-react';
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
  const [imageZoomed, setImageZoomed] = useState(false);

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
      <DialogContent className="max-w-md max-h-[80vh] p-0 gap-0 overflow-hidden bg-gradient-to-br from-neutral-900 via-neutral-800 to-neutral-900 border-neutral-700">
        {/* Header with Image */}
        <div className="relative">
          {/* Image Section com Zoom */}
          <div className="relative h-48 sm:h-56 bg-gradient-to-br from-neutral-900 via-neutral-800 to-black overflow-hidden group cursor-pointer"
               onClick={() => menuItem.imageUrl && setImageZoomed(!imageZoomed)}>
            {menuItem.imageUrl ? (
              <>
                <motion.img 
                  src={menuItem.imageUrl} 
                  alt={menuItem.name}
                  className="w-full h-full object-cover"
                  animate={{ scale: imageZoomed ? 1.5 : 1 }}
                  transition={{ duration: 0.3 }}
                />
                {/* Gradient Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />
                
                {/* Zoom Button */}
                <div className="absolute top-3 left-3 h-8 w-8 rounded-full bg-black/50 backdrop-blur-sm flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity">
                  <ZoomIn className="h-4 w-4" />
                </div>
              </>
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-neutral-800 to-neutral-900">
                <UtensilsCrossed className="h-16 w-16 text-amber-500/30 stroke-[1.5]" />
              </div>
            )}
            
            {/* Close Button */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                onOpenChange(false);
              }}
              className="absolute top-3 right-3 h-8 w-8 rounded-full bg-white/90 backdrop-blur-sm hover:bg-white flex items-center justify-center text-gray-900 shadow-lg transition-colors z-10"
              data-testid="button-close-dialog"
            >
              <X className="h-4 w-4" />
            </button>

            {/* Title Overlay */}
            <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80 to-transparent">
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
              >
                <h2 className="text-xl sm:text-2xl font-bold text-white mb-1" data-testid="text-options-dialog-title">
                  {menuItem.name}
                </h2>
                {menuItem.description && (
                  <p className="text-sm text-white/90 line-clamp-2" data-testid="text-options-dialog-description">
                    {menuItem.description}
                  </p>
                )}
              </motion.div>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="flex flex-col max-h-[calc(80vh-8rem)] sm:max-h-[calc(80vh-10rem)]">
          <ScrollArea className="flex-1 px-4 sm:px-6 py-4">
            {isLoading ? (
              <div className="flex justify-center py-6">
                <div className="animate-spin rounded-full h-8 w-8 border-2 border-gray-200 border-t-gray-900"></div>
              </div>
            ) : !hasOptions ? (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="py-4"
              >
                <div className="bg-gradient-to-br from-neutral-800 to-neutral-900 border border-neutral-700 rounded-xl p-4 text-center">
                  <UtensilsCrossed className="h-8 w-8 text-amber-500/30 mx-auto mb-2" />
                  <p className="text-sm text-neutral-300 font-medium">
                    Este item não possui opções de personalização.
                  </p>
                  <p className="text-xs text-neutral-500 mt-1">
                    Ajuste apenas a quantidade desejada
                  </p>
                </div>
              </motion.div>
            ) : (
              <Accordion type="multiple" defaultValue={optionGroups.map(g => g.id)} className="space-y-2">
                <AnimatePresence>
                  {optionGroups.map((group, groupIndex) => {
                    const groupSelections = selections[group.id] || [];
                    const selectionCount = groupSelections.length;
                    const isRequired = (group.minSelections ?? 0) > 0;
                    const isSingleSelect = group.type === 'single';

                    return (
                      <AccordionItem
                        key={group.id}
                        value={group.id}
                        className="border border-neutral-700 rounded-lg overflow-hidden bg-neutral-800 shadow-sm"
                      >
                        <AccordionTrigger className="px-3 py-2 hover:bg-neutral-700/50 hover:no-underline">
                          <div className="flex items-center justify-between gap-2 w-full">
                            <div className="flex items-center gap-2">
                              <h3 className="text-sm font-bold text-white" data-testid={`text-group-name-${group.id}`}>
                                {group.name}
                              </h3>
                              {isRequired && (
                                <span className="text-red-500 text-xs">*</span>
                              )}
                            </div>
                            <div className="flex items-center gap-2">
                              {selectionCount > 0 && (
                                <Badge className="bg-gradient-to-r from-amber-500 to-orange-600 text-white text-[10px] px-1.5 py-0 shadow-sm">
                                  {selectionCount}
                                </Badge>
                              )}
                              <Badge variant="outline" className="border-neutral-600 text-neutral-400 text-[10px] font-medium px-2 py-0.5">
                                {isSingleSelect
                                  ? 'Escolha 1'
                                  : group.maxSelections
                                  ? `Até ${group.maxSelections}`
                                  : 'Múltipla'}
                              </Badge>
                            </div>
                          </div>
                        </AccordionTrigger>
                        <AccordionContent className="px-3 pb-3 pt-1">
                          <div className="space-y-2">

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
                                            relative flex items-center gap-2 p-2.5 rounded-lg cursor-pointer transition-all duration-200
                                            ${isSelected 
                                              ? 'bg-gradient-to-r from-amber-500 to-orange-600 text-white shadow-lg shadow-amber-500/30' 
                                              : isRecommended 
                                                ? 'bg-gradient-to-br from-amber-900/30 to-orange-900/30 border border-amber-600/50 hover:border-amber-500 hover:shadow-md' 
                                                : 'bg-neutral-800 border border-neutral-700 hover:border-amber-500/50 hover:shadow-md text-white'
                                            }
                                          `}
                                        >
                                          {isRecommended && !isSelected && (
                                            <Badge className="absolute -top-1.5 -right-1 bg-gradient-to-br from-amber-400 to-orange-500 text-white text-[9px] font-bold px-1.5 py-0 rounded-full border-0 flex items-center gap-0.5">
                                              <Star className="h-2 w-2 fill-current" />
                                              Sugestão
                                            </Badge>
                                          )}
                                          
                                          <RadioGroupItem
                                            value={option.id}
                                            id={option.id}
                                            className={`h-4 w-4 ${isSelected ? 'border-white text-white data-[state=checked]:bg-white data-[state=checked]:text-amber-600' : 'border-neutral-600 data-[state=checked]:bg-amber-500 data-[state=checked]:border-amber-500'}`}
                                            data-testid={`radio-option-${option.id}`}
                                          />
                                          <Label htmlFor={option.id} className="flex-1 cursor-pointer">
                                            <div className="flex items-center justify-between gap-2">
                                              <span className={`text-sm font-medium ${isSelected ? 'text-white' : 'text-white'}`}>
                                                {option.name}
                                              </span>
                                              {parseFloat(option.priceAdjustment) !== 0 && (
                                                <span className={`text-xs font-medium ${isSelected ? 'text-white/90' : 'text-neutral-400'}`}>
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
                                            className="flex items-center gap-2 pl-6 pr-2"
                                          >
                                            <span className="text-xs text-neutral-400">Qtd:</span>
                                            <div className="flex items-center gap-1">
                                              <button
                                                className="h-6 w-6 rounded-full bg-amber-500/20 border border-amber-500/50 hover:bg-amber-500/30 text-amber-500 flex items-center justify-center transition-colors disabled:opacity-50 disabled:bg-neutral-800"
                                                onClick={(e) => {
                                                  e.preventDefault();
                                                  handleQuantityChange(group.id, option.id, -1);
                                                }}
                                                disabled={currentQuantity <= 1}
                                                data-testid={`button-decrease-option-${option.id}`}
                                              >
                                                <Minus className="h-2.5 w-2.5" />
                                              </button>
                                              <span className="text-xs font-bold min-w-6 text-center text-amber-500" data-testid={`text-option-qty-${option.id}`}>
                                                {currentQuantity}
                                              </span>
                                              <button
                                                className="h-6 w-6 rounded-full bg-amber-500/20 border border-amber-500/50 hover:bg-amber-500/30 text-amber-500 flex items-center justify-center transition-colors"
                                                onClick={(e) => {
                                                  e.preventDefault();
                                                  handleQuantityChange(group.id, option.id, 1);
                                                }}
                                                data-testid={`button-increase-option-${option.id}`}
                                              >
                                                <Plus className="h-2.5 w-2.5" />
                                              </button>
                                            </div>
                                            {parseFloat(option.priceAdjustment) !== 0 && currentQuantity > 1 && (
                                              <span className="text-[10px] text-neutral-500 ml-auto">
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
                                          relative flex items-center gap-2 p-2.5 rounded-lg transition-all duration-200
                                          ${isSelected 
                                            ? 'bg-gradient-to-r from-amber-500 to-orange-600 text-white shadow-lg shadow-amber-500/30' 
                                            : isRecommended 
                                              ? 'bg-gradient-to-br from-amber-900/30 to-orange-900/30 border border-amber-600/50 hover:border-amber-500 hover:shadow-md' 
                                              : 'bg-neutral-800 border border-neutral-700 hover:border-amber-500/50 hover:shadow-md text-white'
                                          }
                                          ${!canSelect ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
                                        `}
                                      >
                                        {isRecommended && !isSelected && (
                                          <Badge className="absolute -top-1.5 -right-1 bg-gradient-to-br from-amber-400 to-orange-500 text-white text-[9px] font-bold px-1.5 py-0 rounded-full border-0 flex items-center gap-0.5">
                                            <Star className="h-2 w-2 fill-current" />
                                            Sugestão
                                          </Badge>
                                        )}
                                        
                                        <Checkbox
                                          id={option.id}
                                          checked={isSelected}
                                          onCheckedChange={(checked) => handleMultiSelect(group.id, option.id, checked as boolean)}
                                          disabled={!canSelect}
                                          className={`h-4 w-4 ${isSelected ? 'border-white data-[state=checked]:bg-white data-[state=checked]:text-amber-600' : 'border-neutral-600 data-[state=checked]:bg-amber-500 data-[state=checked]:border-amber-500'}`}
                                          data-testid={`checkbox-option-${option.id}`}
                                        />
                                        <Label htmlFor={option.id} className={`flex-1 ${canSelect ? 'cursor-pointer' : 'cursor-not-allowed'}`}>
                                          <div className="flex items-center justify-between gap-2">
                                            <span className={`text-sm font-medium ${isSelected ? 'text-white' : 'text-white'}`}>
                                              {option.name}
                                            </span>
                                            {parseFloat(option.priceAdjustment) !== 0 && (
                                              <span className={`text-xs font-medium ${isSelected ? 'text-white/90' : 'text-neutral-400'}`}>
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
                                          className="flex items-center gap-2 pl-6 pr-2"
                                        >
                                          <span className="text-xs text-neutral-400">Qtd:</span>
                                          <div className="flex items-center gap-1">
                                            <button
                                              className="h-6 w-6 rounded-full bg-amber-500/20 border border-amber-500/50 hover:bg-amber-500/30 text-amber-500 flex items-center justify-center transition-colors disabled:opacity-50 disabled:bg-neutral-800"
                                              onClick={(e) => {
                                                e.preventDefault();
                                                handleQuantityChange(group.id, option.id, -1);
                                              }}
                                              disabled={currentQuantity <= 1}
                                              data-testid={`button-decrease-option-${option.id}`}
                                            >
                                              <Minus className="h-2.5 w-2.5" />
                                            </button>
                                            <span className="text-xs font-bold min-w-6 text-center text-amber-500" data-testid={`text-option-qty-${option.id}`}>
                                              {currentQuantity}
                                            </span>
                                            <button
                                              className="h-6 w-6 rounded-full bg-amber-500/20 border border-amber-500/50 hover:bg-amber-500/30 text-amber-500 flex items-center justify-center transition-colors"
                                              onClick={(e) => {
                                                e.preventDefault();
                                                handleQuantityChange(group.id, option.id, 1);
                                              }}
                                              data-testid={`button-increase-option-${option.id}`}
                                            >
                                              <Plus className="h-2.5 w-2.5" />
                                            </button>
                                          </div>
                                          {parseFloat(option.priceAdjustment) !== 0 && currentQuantity > 1 && (
                                            <span className="text-[10px] text-neutral-500 ml-auto">
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
                        </AccordionContent>
                      </AccordionItem>
                    );
                  })}
                </AnimatePresence>
              </Accordion>
            )}
          </ScrollArea>

          {/* Footer */}
          <div className="border-t border-neutral-700 bg-neutral-900/95 backdrop-blur-sm px-4 sm:px-6 py-3 space-y-3">
            {!validation.valid && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="bg-red-50 border border-red-300 text-red-700 text-xs p-3 rounded-lg shadow-sm"
              >
                {validation.errors.map((error, idx) => (
                  <div key={idx} className="flex items-start gap-1">
                    <span className="text-red-500 font-bold">•</span>
                    <span>{error}</span>
                  </div>
                ))}
              </motion.div>
            )}

            {/* Footer com Controle Flutuante e Total */}
            <div className="flex items-stretch gap-3">
              {/* Controle de Quantidade Flutuante */}
              <motion.div 
                className="flex items-center bg-gradient-to-r from-amber-500 to-orange-600 rounded-2xl shadow-lg shadow-amber-500/30 overflow-hidden"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  data-testid="button-decrease-quantity"
                  className="h-14 w-12 flex items-center justify-center text-white hover:bg-black/10 transition-colors active:bg-black/20"
                >
                  <Minus className="h-5 w-5" />
                </button>
                <div className="h-14 px-3 flex items-center justify-center bg-black/20 backdrop-blur-sm min-w-[3rem]">
                  <span className="text-2xl font-bold text-white" data-testid="text-quantity">
                    {quantity}
                  </span>
                </div>
                <button
                  onClick={() => setQuantity(quantity + 1)}
                  data-testid="button-increase-quantity"
                  className="h-14 w-12 flex items-center justify-center text-white hover:bg-black/10 transition-colors active:bg-black/20"
                >
                  <Plus className="h-5 w-5" />
                </button>
              </motion.div>

              {/* Botão Adicionar com Total */}
              <Button
                size="default"
                className="flex-1 h-14 bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white rounded-2xl shadow-lg shadow-amber-500/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                onClick={handleAddToCart}
                disabled={!validation.valid}
                data-testid="button-add-to-cart"
              >
                <div className="flex items-center justify-between w-full px-2">
                  <div className="flex items-center gap-2">
                    <ShoppingCart className="h-5 w-5" />
                    <span className="font-bold text-base">Adicionar</span>
                  </div>
                  <div className="text-right">
                    <div className="text-[10px] text-white/60 leading-tight">Total</div>
                    <div className="text-base font-bold leading-tight" data-testid="text-total-price">
                      {formatKwanza(calculateTotal())}
                    </div>
                  </div>
                </div>
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
