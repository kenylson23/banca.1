import { useState, useMemo } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Check, Plus, Minus, AlertCircle } from "lucide-react";
import { formatKwanza } from "@/lib/formatters";

export interface OptionGroup {
  id: string;
  name: string;
  type: "single" | "multiple";
  isRequired: number;
  minSelections: number;
  maxSelections: number;
  displayOrder: number;
  options: Option[];
}

export interface Option {
  id: string;
  name: string;
  priceAdjustment: string;
  isAvailable: number;
  isRecommended: number;
  displayOrder: number;
}

export interface SelectedOption {
  optionId: string;
  optionGroupId: string;
  optionName: string;
  optionGroupName: string;
  priceAdjustment: string;
  quantity: number;
}

interface ProductOptionsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  productName: string;
  basePrice: number;
  optionGroups: OptionGroup[];
  onConfirm: (selectedOptions: SelectedOption[]) => void;
}

export function ProductOptionsDialog({
  open,
  onOpenChange,
  productName,
  basePrice,
  optionGroups,
  onConfirm,
}: ProductOptionsDialogProps) {
  const [selectedOptions, setSelectedOptions] = useState<Map<string, Set<string>>>(new Map());
  const [optionQuantities, setOptionQuantities] = useState<Map<string, number>>(new Map());

  const toggleOption = (groupId: string, optionId: string, groupType: "single" | "multiple") => {
    const newSelected = new Map(selectedOptions);
    const currentGroup = newSelected.get(groupId) || new Set<string>();

    if (groupType === "single") {
      // Para single, desmarcar a opção anterior e marcar a nova
      const oldSelection = newSelected.get(groupId);
      if (oldSelection) {
        oldSelection.forEach(oldId => {
          const newQty = new Map(optionQuantities);
          newQty.delete(oldId);
          setOptionQuantities(newQty);
        });
      }
      newSelected.set(groupId, new Set([optionId]));
      // Inicializar quantidade como 1
      const newQty = new Map(optionQuantities);
      newQty.set(optionId, 1);
      setOptionQuantities(newQty);
    } else {
      if (currentGroup.has(optionId)) {
        currentGroup.delete(optionId);
        // Remover quantidade ao desmarcar
        const newQty = new Map(optionQuantities);
        newQty.delete(optionId);
        setOptionQuantities(newQty);
      } else {
        currentGroup.add(optionId);
        // Inicializar quantidade como 1
        const newQty = new Map(optionQuantities);
        newQty.set(optionId, 1);
        setOptionQuantities(newQty);
      }
      newSelected.set(groupId, currentGroup);
    }

    setSelectedOptions(newSelected);
  };

  const updateOptionQuantity = (optionId: string, delta: number) => {
    const newQty = new Map(optionQuantities);
    const current = newQty.get(optionId) || 1;
    const updated = Math.max(1, current + delta);
    newQty.set(optionId, updated);
    setOptionQuantities(newQty);
  };

  const validation = useMemo(() => {
    const errors: string[] = [];
    const isValid = optionGroups.every((group) => {
      const selected = selectedOptions.get(group.id) || new Set();
      const count = selected.size;

      if (group.isRequired && count === 0) {
        errors.push(`${group.name} é obrigatório`);
        return false;
      }

      if (count < group.minSelections) {
        errors.push(`${group.name}: selecione pelo menos ${group.minSelections}`);
        return false;
      }

      if (count > group.maxSelections) {
        errors.push(`${group.name}: máximo de ${group.maxSelections} opções`);
        return false;
      }

      return true;
    });

    return { isValid, errors };
  }, [optionGroups, selectedOptions]);

  const totalPrice = useMemo(() => {
    let total = basePrice;
    
    selectedOptions.forEach((optionIds, groupId) => {
      const group = optionGroups.find((g) => g.id === groupId);
      if (!group) return;

      optionIds.forEach((optionId) => {
        const option = group.options.find((o) => o.id === optionId);
        if (option) {
          const quantity = optionQuantities.get(optionId) || 1;
          total += parseFloat(option.priceAdjustment) * quantity;
        }
      });
    });

    return total;
  }, [basePrice, selectedOptions, optionGroups, optionQuantities]);

  const handleConfirm = () => {
    if (!validation.isValid) return;

    const result: SelectedOption[] = [];
    
    selectedOptions.forEach((optionIds, groupId) => {
      const group = optionGroups.find((g) => g.id === groupId);
      if (!group) return;

      optionIds.forEach((optionId) => {
        const option = group.options.find((o) => o.id === optionId);
        if (option) {
          result.push({
            optionId: option.id,
            optionGroupId: group.id,
            optionName: option.name,
            optionGroupName: group.name,
            priceAdjustment: option.priceAdjustment,
            quantity: optionQuantities.get(optionId) || 1,
          });
        }
      });
    });

    onConfirm(result);
    setSelectedOptions(new Map());
    setOptionQuantities(new Map());
    onOpenChange(false);
  };

  const handleCancel = () => {
    setSelectedOptions(new Map());
    setOptionQuantities(new Map());
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle className="text-xl">{productName}</DialogTitle>
          <div className="flex items-baseline gap-2 mt-2">
            <span className="text-sm text-muted-foreground">Preço base:</span>
            <span className="text-lg font-semibold">{formatKwanza(basePrice)}</span>
          </div>
        </DialogHeader>

        {validation.errors.length > 0 && (
          <div className="bg-destructive/10 border border-destructive/20 rounded-md p-3" data-testid="validation-errors">
            <p className="text-sm font-medium text-destructive mb-1">Atenção:</p>
            <ul className="text-sm text-destructive space-y-1">
              {validation.errors.map((error, idx) => (
                <li key={idx}>• {error}</li>
              ))}
            </ul>
          </div>
        )}

        <ScrollArea className="flex-1 pr-4 max-h-[50vh]">
          <div className="space-y-6">
            {optionGroups
              .sort((a, b) => a.displayOrder - b.displayOrder)
              .map((group) => {
                const availableOptions = group.options.filter((opt) => opt.isAvailable === 1);
                if (availableOptions.length === 0) return null;

                const selected = selectedOptions.get(group.id) || new Set();

                return (
                  <div key={group.id} className="space-y-3">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h3 className="font-semibold text-base flex items-center gap-2">
                          {group.name}
                          {group.isRequired === 1 && (
                            <Badge variant="destructive" className="text-xs">
                              Obrigatório
                            </Badge>
                          )}
                        </h3>
                        <p className="text-sm text-muted-foreground mt-1">
                          {group.type === "single"
                            ? "Escolha uma opção"
                            : `Escolha ${group.minSelections === group.maxSelections 
                                ? group.maxSelections 
                                : `${group.minSelections} a ${group.maxSelections}`} opções`}
                        </p>
                      </div>
                    </div>

                    <div className="space-y-2">
                      {group.type === "single" ? (
                        <RadioGroup
                          value={Array.from(selected)[0] || ""}
                          onValueChange={(value) => toggleOption(group.id, value, "single")}
                        >
                          {availableOptions
                            .sort((a, b) => a.displayOrder - b.displayOrder)
                            .map((option) => (
                              <Card
                                key={option.id}
                                className={`p-3 ${
                                  selected.has(option.id) ? "border-primary" : ""
                                }`}
                                data-testid={`option-${option.id}`}
                              >
                                <div 
                                  className="flex items-center gap-3 cursor-pointer"
                                  onClick={() => toggleOption(group.id, option.id, "single")}
                                >
                                  <RadioGroupItem value={option.id} id={option.id} />
                                  <Label
                                    htmlFor={option.id}
                                    className="flex-1 flex items-center justify-between cursor-pointer"
                                  >
                                    <div className="flex items-center gap-2">
                                      <span className="font-medium">{option.name}</span>
                                      {option.isRecommended === 1 && (
                                        <Badge variant="secondary" className="text-xs">
                                          Recomendado
                                        </Badge>
                                      )}
                                    </div>
                                    {parseFloat(option.priceAdjustment) !== 0 && (
                                      <span className="text-sm font-semibold text-primary">
                                        {parseFloat(option.priceAdjustment) > 0 ? "+" : ""}
                                        {formatKwanza(parseFloat(option.priceAdjustment))}
                                      </span>
                                    )}
                                  </Label>
                                </div>
                                {selected.has(option.id) && (
                                  <div className="flex items-center gap-2 mt-2 pt-2 border-t">
                                    <span className="text-sm text-muted-foreground">Porções:</span>
                                    <div className="flex items-center gap-2">
                                      <Button
                                        type="button"
                                        size="icon"
                                        variant="outline"
                                        className="h-7 w-7"
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          updateOptionQuantity(option.id, -1);
                                        }}
                                        data-testid={`button-decrease-${option.id}`}
                                      >
                                        <Minus className="h-3 w-3" />
                                      </Button>
                                      <span className="text-sm font-medium w-8 text-center">
                                        {optionQuantities.get(option.id) || 1}
                                      </span>
                                      <Button
                                        type="button"
                                        size="icon"
                                        variant="outline"
                                        className="h-7 w-7"
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          updateOptionQuantity(option.id, 1);
                                        }}
                                        data-testid={`button-increase-${option.id}`}
                                      >
                                        <Plus className="h-3 w-3" />
                                      </Button>
                                    </div>
                                  </div>
                                )}
                              </Card>
                            ))}
                        </RadioGroup>
                      ) : (
                        <div className="space-y-2">
                          {availableOptions
                            .sort((a, b) => a.displayOrder - b.displayOrder)
                            .map((option) => (
                              <Card
                                key={option.id}
                                className={`p-3 ${
                                  selected.has(option.id) ? "border-primary" : ""
                                }`}
                                data-testid={`option-${option.id}`}
                              >
                                <div 
                                  className="flex items-center gap-3 cursor-pointer"
                                  onClick={() => toggleOption(group.id, option.id, "multiple")}
                                >
                                  <Checkbox
                                    id={option.id}
                                    checked={selected.has(option.id)}
                                    onCheckedChange={() =>
                                      toggleOption(group.id, option.id, "multiple")
                                    }
                                  />
                                  <Label
                                    htmlFor={option.id}
                                    className="flex-1 flex items-center justify-between cursor-pointer"
                                  >
                                    <div className="flex items-center gap-2">
                                      <span className="font-medium">{option.name}</span>
                                      {option.isRecommended === 1 && (
                                        <Badge variant="secondary" className="text-xs">
                                          Recomendado
                                        </Badge>
                                      )}
                                    </div>
                                    {parseFloat(option.priceAdjustment) !== 0 && (
                                      <span className="text-sm font-semibold text-primary">
                                        {parseFloat(option.priceAdjustment) > 0 ? "+" : ""}
                                        {formatKwanza(parseFloat(option.priceAdjustment))}
                                      </span>
                                    )}
                                  </Label>
                                </div>
                                {selected.has(option.id) && (
                                  <div className="flex items-center gap-2 mt-2 pt-2 border-t">
                                    <span className="text-sm text-muted-foreground">Porções:</span>
                                    <div className="flex items-center gap-2">
                                      <Button
                                        type="button"
                                        size="icon"
                                        variant="outline"
                                        className="h-7 w-7"
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          updateOptionQuantity(option.id, -1);
                                        }}
                                        data-testid={`button-decrease-${option.id}`}
                                      >
                                        <Minus className="h-3 w-3" />
                                      </Button>
                                      <span className="text-sm font-medium w-8 text-center">
                                        {optionQuantities.get(option.id) || 1}
                                      </span>
                                      <Button
                                        type="button"
                                        size="icon"
                                        variant="outline"
                                        className="h-7 w-7"
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          updateOptionQuantity(option.id, 1);
                                        }}
                                        data-testid={`button-increase-${option.id}`}
                                      >
                                        <Plus className="h-3 w-3" />
                                      </Button>
                                    </div>
                                  </div>
                                )}
                              </Card>
                            ))}
                        </div>
                      )}
                    </div>
                    <Separator />
                  </div>
                );
              })}
          </div>
        </ScrollArea>

        {validation.errors.length > 0 && (
          <Card className="p-3 bg-destructive/10 border-destructive/20">
            <div className="flex items-start gap-2">
              <AlertCircle className="h-4 w-4 text-destructive mt-0.5" />
              <div className="flex-1 space-y-1">
                {validation.errors.map((error, i) => (
                  <p key={i} className="text-sm text-destructive">
                    {error}
                  </p>
                ))}
              </div>
            </div>
          </Card>
        )}

        <DialogFooter className="gap-2">
          <div className="flex-1 flex items-center justify-between">
            <div className="text-left">
              <p className="text-sm text-muted-foreground">Total</p>
              <p className="text-2xl font-bold">{formatKwanza(totalPrice)}</p>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={handleCancel}
                data-testid="button-cancel-options"
              >
                Cancelar
              </Button>
              <Button
                onClick={handleConfirm}
                disabled={!validation.isValid}
                data-testid="button-confirm-options"
              >
                <Check className="h-4 w-4 mr-2" />
                Adicionar ao carrinho
              </Button>
            </div>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
