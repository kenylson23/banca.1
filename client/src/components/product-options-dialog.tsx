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
import { Check, Plus, AlertCircle } from "lucide-react";
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
  name: string;
  priceAdjustment: number;
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

  const toggleOption = (groupId: string, optionId: string, groupType: "single" | "multiple") => {
    const newSelected = new Map(selectedOptions);
    const currentGroup = newSelected.get(groupId) || new Set<string>();

    if (groupType === "single") {
      newSelected.set(groupId, new Set([optionId]));
    } else {
      if (currentGroup.has(optionId)) {
        currentGroup.delete(optionId);
      } else {
        currentGroup.add(optionId);
      }
      newSelected.set(groupId, currentGroup);
    }

    setSelectedOptions(newSelected);
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
          total += parseFloat(option.priceAdjustment);
        }
      });
    });

    return total;
  }, [basePrice, selectedOptions, optionGroups]);

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
            name: option.name,
            priceAdjustment: parseFloat(option.priceAdjustment),
          });
        }
      });
    });

    onConfirm(result);
    setSelectedOptions(new Map());
    onOpenChange(false);
  };

  const handleCancel = () => {
    setSelectedOptions(new Map());
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
                                className={`p-3 cursor-pointer hover-elevate transition-all ${
                                  selected.has(option.id) ? "border-primary" : ""
                                }`}
                                onClick={() => toggleOption(group.id, option.id, "single")}
                                data-testid={`option-${option.id}`}
                              >
                                <div className="flex items-center gap-3">
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
                                className={`p-3 cursor-pointer hover-elevate transition-all ${
                                  selected.has(option.id) ? "border-primary" : ""
                                }`}
                                onClick={() => toggleOption(group.id, option.id, "multiple")}
                                data-testid={`option-${option.id}`}
                              >
                                <div className="flex items-center gap-3">
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
