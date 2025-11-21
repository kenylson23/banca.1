import { useState, useEffect } from "react";
import { X, Plus, Minus, Star, ShoppingCart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { formatKwanza } from "@/lib/formatters";
import type { MenuItem, OptionGroup, Option } from "@shared/schema";

interface ProductPreviewPanelProps {
  product: MenuItem & { 
    category?: { name: string };
    optionGroups?: Array<OptionGroup & { options: Option[] }>;
  } | null;
  isOpen: boolean;
  onClose: () => void;
  onAddToOrder: (item: {
    menuItemId: string;
    quantity: number;
    price: string;
    notes: string;
    selectedOptions: Array<{ 
      optionId: string; 
      optionGroupId: string; 
      optionName: string;
      optionGroupName: string;
      priceAdjustment: string;
      quantity: number;
    }>;
  }) => void;
  isFavorite?: boolean;
  onToggleFavorite?: (menuItemId: string) => void;
}

export function ProductPreviewPanel({
  product,
  isOpen,
  onClose,
  onAddToOrder,
  isFavorite = false,
  onToggleFavorite,
}: ProductPreviewPanelProps) {
  const [quantity, setQuantity] = useState(1);
  const [notes, setNotes] = useState("");
  const [selectedOptions, setSelectedOptions] = useState<Record<string, string | string[]>>({});
  const [optionQuantities, setOptionQuantities] = useState<Record<string, number>>({});

  useEffect(() => {
    if (isOpen && product) {
      setQuantity(1);
      setNotes("");
      setSelectedOptions({});
      setOptionQuantities({});
    }
  }, [isOpen, product]);

  if (!product) return null;

  const handleOptionChange = (groupId: string, optionId: string, type: "single" | "multiple") => {
    if (type === "single") {
      setSelectedOptions(prev => ({ ...prev, [groupId]: optionId }));
      setOptionQuantities(prev => ({ ...prev, [optionId]: 1 }));
    } else {
      setSelectedOptions(prev => {
        const current = (prev[groupId] as string[]) || [];
        const isRemoving = current.includes(optionId);
        const newValue = isRemoving
          ? current.filter(id => id !== optionId)
          : [...current, optionId];
        
        // Remove quantity if unchecking
        if (isRemoving) {
          setOptionQuantities(prevQty => {
            const newQty = { ...prevQty };
            delete newQty[optionId];
            return newQty;
          });
        } else {
          // Set initial quantity to 1 when checking
          setOptionQuantities(prevQty => ({ ...prevQty, [optionId]: 1 }));
        }
        
        return { ...prev, [groupId]: newValue };
      });
    }
  };

  const handleOptionQuantityChange = (optionId: string, delta: number) => {
    setOptionQuantities(prev => {
      const current = prev[optionId] || 1;
      const newQuantity = Math.max(1, current + delta);
      return { ...prev, [optionId]: newQuantity };
    });
  };

  const calculateTotalPrice = () => {
    let total = Number(product.price);
    
    product.optionGroups?.forEach(group => {
      const selected = selectedOptions[group.id];
      if (selected) {
        const optionIds = Array.isArray(selected) ? selected : [selected];
        optionIds.forEach(optionId => {
          const option = group.options.find(opt => opt.id === optionId);
          if (option) {
            const optionQty = optionQuantities[optionId] || 1;
            total += Number(option.priceAdjustment || 0) * optionQty;
          }
        });
      }
    });
    
    return total * quantity;
  };

  const handleAddToOrder = () => {
    const optionsArray: Array<{ 
      optionId: string; 
      optionGroupId: string; 
      optionName: string;
      optionGroupName: string;
      priceAdjustment: string;
      quantity: number;
    }> = [];
    
    // Calculate base price with option adjustments
    let basePrice = Number(product.price);
    
    Object.entries(selectedOptions).forEach(([groupId, value]) => {
      const optionIds = Array.isArray(value) ? value : [value];
      const group = product.optionGroups?.find(g => g.id === groupId);
      
      if (!group) return;
      
      optionIds.forEach(optionId => {
        const option = group.options.find(opt => opt.id === optionId);
        if (!option) return;
        
        const optionQty = optionQuantities[optionId] || 1;
        optionsArray.push({ 
          optionId, 
          optionGroupId: groupId,
          optionName: option.name,
          optionGroupName: group.name,
          priceAdjustment: option.priceAdjustment || "0",
          quantity: optionQty 
        });
        
        // Add option price adjustment to base price (multiplied by quantity)
        basePrice += Number(option.priceAdjustment || 0) * optionQty;
      });
    });

    onAddToOrder({
      menuItemId: product.id,
      quantity,
      price: basePrice.toFixed(2),
      notes,
      selectedOptions: optionsArray,
    });

    onClose();
  };

  const isValidSelection = () => {
    if (!product.optionGroups) return true;
    
    return product.optionGroups.every(group => {
      if (group.isRequired === 0) return true;
      
      const selected = selectedOptions[group.id];
      if (!selected) return false;
      
      const count = Array.isArray(selected) ? selected.length : 1;
      return count >= group.minSelections && count <= group.maxSelections;
    });
  };

  return (
    <>
      <div
        className={`fixed inset-0 bg-black/50 z-50 transition-opacity duration-300 ${
          isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
        onClick={onClose}
      />
      
      <div
        className={`fixed right-0 top-0 h-full w-full sm:w-[480px] bg-background z-50 shadow-2xl transition-transform duration-300 ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="flex flex-col h-full">
          <div className="flex items-center justify-between p-4 border-b">
            <h2 className="text-lg font-semibold">Detalhes do Produto</h2>
            <div className="flex items-center gap-2">
              {onToggleFavorite && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => onToggleFavorite(product.id)}
                  data-testid="button-toggle-favorite"
                >
                  <Star
                    className={`h-5 w-5 ${
                      isFavorite ? "fill-yellow-400 text-yellow-400" : "text-muted-foreground"
                    }`}
                  />
                </Button>
              )}
              <Button
                variant="ghost"
                size="icon"
                onClick={onClose}
                data-testid="button-close-preview"
              >
                <X className="h-5 w-5" />
              </Button>
            </div>
          </div>

          <ScrollArea className="flex-1">
            <div className="p-0">
              {product.imageUrl && (
                <div className="w-full aspect-video bg-muted overflow-hidden">
                  <img
                    src={product.imageUrl}
                    alt={product.name}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}

              <div className="p-6 space-y-6">
                <div>
                  <div className="flex items-start justify-between gap-4 mb-2">
                    <div className="flex-1">
                      <h3 className="text-2xl font-bold text-foreground">
                        {product.name}
                      </h3>
                      {product.category && (
                        <Badge variant="secondary" className="mt-2">
                          {product.category.name}
                        </Badge>
                      )}
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold text-primary">
                        {formatKwanza(product.price)}
                      </p>
                    </div>
                  </div>
                  
                  {product.description && (
                    <p className="text-sm text-muted-foreground mt-3">
                      {product.description}
                    </p>
                  )}
                </div>

                {product.optionGroups && product.optionGroups.length > 0 && (
                  <>
                    <Separator />
                    <div className="space-y-6">
                      {product.optionGroups
                        .sort((a, b) => a.displayOrder - b.displayOrder)
                        .map((group) => (
                          <div key={group.id} className="space-y-3">
                            <div className="flex items-center justify-between">
                              <Label className="text-base font-semibold">
                                {group.name}
                                {group.isRequired === 1 && (
                                  <span className="text-destructive ml-1">*</span>
                                )}
                              </Label>
                              {group.type === "multiple" && (
                                <span className="text-xs text-muted-foreground">
                                  {group.minSelections === group.maxSelections
                                    ? `Escolha ${group.maxSelections}`
                                    : `Escolha entre ${group.minSelections} e ${group.maxSelections}`}
                                </span>
                              )}
                            </div>

                            {group.type === "single" ? (
                              <RadioGroup
                                value={selectedOptions[group.id] as string}
                                onValueChange={(value) => handleOptionChange(group.id, value, "single")}
                              >
                                {group.options
                                  .filter(opt => opt.isAvailable === 1)
                                  .sort((a, b) => a.displayOrder - b.displayOrder)
                                  .map((option) => {
                                    const isSelected = selectedOptions[group.id] === option.id;
                                    const optionQty = optionQuantities[option.id] || 1;
                                    return (
                                      <div key={option.id} className="space-y-2">
                                        <div className="flex items-center justify-between p-3 rounded-md border hover-elevate">
                                          <div className="flex items-center gap-3 flex-1">
                                            <RadioGroupItem
                                              value={option.id}
                                              id={`option-${option.id}`}
                                              data-testid={`radio-option-${option.id}`}
                                            />
                                            <Label
                                              htmlFor={`option-${option.id}`}
                                              className="flex-1 cursor-pointer font-normal"
                                            >
                                              {option.name}
                                              {option.isRecommended === 1 && (
                                                <Badge variant="secondary" className="ml-2 text-xs">
                                                  Recomendado
                                                </Badge>
                                              )}
                                            </Label>
                                          </div>
                                          {Number(option.priceAdjustment) !== 0 && (
                                            <span className="text-sm font-medium">
                                              {Number(option.priceAdjustment) > 0 ? "+" : ""}
                                              {formatKwanza(option.priceAdjustment)}
                                            </span>
                                          )}
                                        </div>
                                        {isSelected && (
                                          <div className="flex items-center gap-2 pl-10">
                                            <span className="text-xs text-muted-foreground">Quantidade:</span>
                                            <div className="flex items-center gap-1">
                                              <Button
                                                variant="outline"
                                                size="icon"
                                                className="h-6 w-6"
                                                onClick={() => handleOptionQuantityChange(option.id, -1)}
                                                disabled={optionQty <= 1}
                                                data-testid={`button-decrease-option-${option.id}`}
                                              >
                                                <Minus className="h-3 w-3" />
                                              </Button>
                                              <span className="text-sm font-semibold w-8 text-center" data-testid={`text-option-qty-${option.id}`}>
                                                {optionQty}
                                              </span>
                                              <Button
                                                variant="outline"
                                                size="icon"
                                                className="h-6 w-6"
                                                onClick={() => handleOptionQuantityChange(option.id, 1)}
                                                data-testid={`button-increase-option-${option.id}`}
                                              >
                                                <Plus className="h-3 w-3" />
                                              </Button>
                                            </div>
                                            {Number(option.priceAdjustment) !== 0 && optionQty > 1 && (
                                              <span className="text-xs text-muted-foreground ml-2">
                                                = {formatKwanza(Number(option.priceAdjustment) * optionQty)}
                                              </span>
                                            )}
                                          </div>
                                        )}
                                      </div>
                                    );
                                  })}
                              </RadioGroup>
                            ) : (
                              <div className="space-y-2">
                                {group.options
                                  .filter(opt => opt.isAvailable === 1)
                                  .sort((a, b) => a.displayOrder - b.displayOrder)
                                  .map((option) => {
                                    const isChecked = (selectedOptions[group.id] as string[] || []).includes(option.id);
                                    const optionQty = optionQuantities[option.id] || 1;
                                    return (
                                      <div key={option.id} className="space-y-2">
                                        <div className="flex items-center justify-between p-3 rounded-md border hover-elevate">
                                          <div className="flex items-center gap-3 flex-1">
                                            <Checkbox
                                              id={`option-${option.id}`}
                                              checked={isChecked}
                                              onCheckedChange={() => handleOptionChange(group.id, option.id, "multiple")}
                                              data-testid={`checkbox-option-${option.id}`}
                                            />
                                            <Label
                                              htmlFor={`option-${option.id}`}
                                              className="flex-1 cursor-pointer font-normal"
                                            >
                                              {option.name}
                                              {option.isRecommended === 1 && (
                                                <Badge variant="secondary" className="ml-2 text-xs">
                                                  Recomendado
                                                </Badge>
                                              )}
                                            </Label>
                                          </div>
                                          {Number(option.priceAdjustment) !== 0 && (
                                            <span className="text-sm font-medium">
                                              {Number(option.priceAdjustment) > 0 ? "+" : ""}
                                              {formatKwanza(option.priceAdjustment)}
                                            </span>
                                          )}
                                        </div>
                                        {isChecked && (
                                          <div className="flex items-center gap-2 pl-10">
                                            <span className="text-xs text-muted-foreground">Quantidade:</span>
                                            <div className="flex items-center gap-1">
                                              <Button
                                                variant="outline"
                                                size="icon"
                                                className="h-6 w-6"
                                                onClick={() => handleOptionQuantityChange(option.id, -1)}
                                                disabled={optionQty <= 1}
                                                data-testid={`button-decrease-option-${option.id}`}
                                              >
                                                <Minus className="h-3 w-3" />
                                              </Button>
                                              <span className="text-sm font-semibold w-8 text-center" data-testid={`text-option-qty-${option.id}`}>
                                                {optionQty}
                                              </span>
                                              <Button
                                                variant="outline"
                                                size="icon"
                                                className="h-6 w-6"
                                                onClick={() => handleOptionQuantityChange(option.id, 1)}
                                                data-testid={`button-increase-option-${option.id}`}
                                              >
                                                <Plus className="h-3 w-3" />
                                              </Button>
                                            </div>
                                            {Number(option.priceAdjustment) !== 0 && optionQty > 1 && (
                                              <span className="text-xs text-muted-foreground ml-2">
                                                = {formatKwanza(Number(option.priceAdjustment) * optionQty)}
                                              </span>
                                            )}
                                          </div>
                                        )}
                                      </div>
                                    );
                                  })}
                              </div>
                            )}
                          </div>
                        ))}
                    </div>
                  </>
                )}

                <Separator />

                <div className="space-y-3">
                  <Label htmlFor="notes">Observações</Label>
                  <Textarea
                    id="notes"
                    placeholder="Alguma observação especial? (Ex: sem cebola, bem passado...)"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    rows={3}
                    data-testid="textarea-notes"
                  />
                </div>

                <Separator />

                <div className="space-y-4">
                  <Label>Quantidade</Label>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => setQuantity(Math.max(1, quantity - 1))}
                        disabled={quantity <= 1}
                        data-testid="button-decrease-quantity"
                      >
                        <Minus className="h-4 w-4" />
                      </Button>
                      <span className="text-2xl font-semibold w-12 text-center" data-testid="text-quantity">
                        {quantity}
                      </span>
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => setQuantity(quantity + 1)}
                        data-testid="button-increase-quantity"
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-muted-foreground">Total</p>
                      <p className="text-2xl font-bold text-primary" data-testid="text-total-price">
                        {formatKwanza(calculateTotalPrice())}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </ScrollArea>

          <div className="p-4 border-t bg-background">
            <Button
              className="w-full"
              size="lg"
              onClick={handleAddToOrder}
              disabled={!isValidSelection()}
              data-testid="button-add-to-order"
            >
              <ShoppingCart className="h-5 w-5 mr-2" />
              Adicionar ao Pedido - {formatKwanza(calculateTotalPrice())}
            </Button>
          </div>
        </div>
      </div>
    </>
  );
}
