import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Settings2, ChevronDown, ChevronUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { formatKwanza } from "@/lib/formatters";
import type { Category, MenuItem, OptionGroup, Option } from "@shared/schema";
import { MenuItemOptionsDialog } from "@/components/MenuItemOptionsDialog";

export function CustomizationsTab() {
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());

  const { data: menuItems, isLoading } = useQuery<(MenuItem & { category: Category })[]>({
    queryKey: ["/api/menu-items"],
  });

  const toggleItemExpansion = (itemId: string) => {
    setExpandedItems((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(itemId)) {
        newSet.delete(itemId);
      } else {
        newSet.add(itemId);
      }
      return newSet;
    });
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-xl font-semibold text-foreground">Personalizações</h2>
          <p className="text-sm text-muted-foreground mt-1">
            Configure opções e personalizações para seus pratos
          </p>
        </div>
        <div className="space-y-4">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-24" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-foreground">Personalizações</h2>
        <p className="text-sm text-muted-foreground mt-1">
          Configure opções e personalizações para seus pratos
        </p>
      </div>

      {menuItems && menuItems.length > 0 ? (
        <div className="space-y-4">
          {menuItems.map((item) => (
            <Card key={item.id} data-testid={`card-customization-${item.id}`}>
              <CardHeader className="flex flex-row items-center justify-between gap-2 pb-4">
                <div className="flex-1">
                  <CardTitle className="text-base">{item.name}</CardTitle>
                  <div className="flex gap-2 mt-2">
                    <Badge variant="secondary" className="text-xs">
                      {item.category.name}
                    </Badge>
                    <Badge variant="outline" className="text-xs">
                      {formatKwanza(item.price)}
                    </Badge>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <MenuItemOptionsDialog menuItemId={item.id} menuItemName={item.name} />
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => toggleItemExpansion(item.id)}
                    data-testid={`button-expand-${item.id}`}
                  >
                    {expandedItems.has(item.id) ? (
                      <ChevronUp className="h-4 w-4" />
                    ) : (
                      <ChevronDown className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </CardHeader>
              {expandedItems.has(item.id) && (
                <CardContent>
                  <MenuItemOptionsPreview menuItemId={item.id} />
                </CardContent>
              )}
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            <Settings2 className="h-12 w-12 mx-auto mb-3 opacity-50" />
            <p>Nenhum item no menu</p>
            <p className="text-sm mt-1">Crie pratos na aba "Itens do Menu" primeiro</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

interface MenuItemOptionsPreviewProps {
  menuItemId: string;
}

function MenuItemOptionsPreview({ menuItemId }: MenuItemOptionsPreviewProps) {
  const { data: optionGroups = [], isLoading } = useQuery<Array<OptionGroup & { options: Option[] }>>({
    queryKey: ["/api/menu-items", menuItemId, "option-groups"],
  });

  if (isLoading) {
    return (
      <div className="space-y-2">
        <Skeleton className="h-16" />
        <Skeleton className="h-16" />
      </div>
    );
  }

  if (optionGroups.length === 0) {
    return (
      <div className="text-sm text-muted-foreground py-4 text-center border-t">
        <p>Nenhuma personalização configurada</p>
        <p className="text-xs mt-1">
          Clique em "Gerenciar Opções" para adicionar personalizações
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4 border-t pt-4">
      {optionGroups.map((group) => (
        <div key={group.id} className="space-y-2" data-testid={`group-preview-${group.id}`}>
          <div className="flex items-center gap-2">
            <h4 className="font-semibold text-sm">{group.name}</h4>
            <Badge variant="outline" className="text-xs">
              {group.type === "single" ? "Escolha única" : "Múltipla escolha"}
            </Badge>
            {group.isRequired === 1 && (
              <Badge variant="destructive" className="text-xs">
                Obrigatório
              </Badge>
            )}
          </div>
          <div className="flex flex-wrap gap-2 ml-4">
            {group.options && group.options.length > 0 ? (
              group.options.map((option) => (
                <Badge
                  key={option.id}
                  variant={option.isAvailable === 1 ? "secondary" : "outline"}
                  className="text-xs"
                  data-testid={`option-preview-${option.id}`}
                >
                  {option.name}
                  {parseFloat(option.priceAdjustment) !== 0 && (
                    <span className="ml-1">
                      ({parseFloat(option.priceAdjustment) > 0 ? "+" : ""}
                      {formatKwanza(option.priceAdjustment)})
                    </span>
                  )}
                  {option.isRecommended === 1 && (
                    <span className="ml-1">⭐</span>
                  )}
                </Badge>
              ))
            ) : (
              <span className="text-xs text-muted-foreground">Nenhuma opção cadastrada</span>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
