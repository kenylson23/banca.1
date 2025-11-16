import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors, DragEndEvent } from "@dnd-kit/core";
import { arrayMove, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical, Eye, EyeOff, Star, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { formatKwanza } from "@/lib/formatters";
import type { Category, MenuItem } from "@shared/schema";
import { MenuItemOptionsDialog } from "@/components/MenuItemOptionsDialog";

function SortableItem({ item, onToggleVisibility, onToggleFavorite }: { 
  item: MenuItem; 
  onToggleVisibility: (id: string) => void;
  onToggleFavorite: (id: string) => void;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({ id: item.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="flex items-center gap-3 p-3 bg-card border rounded-lg"
      data-testid={`sortable-menu-item-${item.id}`}
    >
      <div {...attributes} {...listeners} className="cursor-grab active:cursor-grabbing">
        <GripVertical className="h-5 w-5 text-muted-foreground" />
      </div>
      
      {item.imageUrl && (
        <img src={item.imageUrl} alt={item.name} className="w-12 h-12 rounded object-cover" />
      )}
      
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <h4 className="font-medium truncate">{item.name}</h4>
          {item.isFavorite === 1 && (
            <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
          )}
        </div>
        <p className="text-sm text-muted-foreground truncate">{formatKwanza(item.price)}</p>
      </div>

      <div className="flex items-center gap-2">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => onToggleFavorite(item.id)}
          data-testid={`button-toggle-favorite-${item.id}`}
        >
          <Star className={`h-4 w-4 ${item.isFavorite === 1 ? 'fill-yellow-400 text-yellow-400' : ''}`} />
        </Button>
        
        <Button
          variant="ghost"
          size="icon"
          onClick={() => onToggleVisibility(item.id)}
          data-testid={`button-toggle-visibility-${item.id}`}
        >
          {item.isVisible === 1 ? (
            <Eye className="h-4 w-4" />
          ) : (
            <EyeOff className="h-4 w-4 text-destructive" />
          )}
        </Button>

        <MenuItemOptionsDialog menuItemId={item.id} menuItemName={item.name} />

        {item.isAvailable === 0 && (
          <Badge variant="destructive">Indisponível</Badge>
        )}
      </div>
    </div>
  );
}

export function CustomizeMenuTab() {
  const { toast } = useToast();
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const { data: categories } = useQuery<Category[]>({
    queryKey: ["/api/categories"],
  });

  const { data: menuItems } = useQuery<(MenuItem & { category: Category })[]>({
    queryKey: ["/api/menu-items"],
  });

  const reorderMutation = useMutation({
    mutationFn: async ({ categoryId, orderedIds }: { categoryId: string; orderedIds: string[] }) => {
      await apiRequest("POST", "/api/menu-items/reorder", { categoryId, orderedIds });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/menu-items"] });
      toast({
        title: "Ordem atualizada",
        description: "A ordem dos produtos foi atualizada com sucesso.",
      });
    },
  });

  const toggleVisibilityMutation = useMutation({
    mutationFn: async ({ id, isVisible }: { id: string; isVisible: number }) => {
      await apiRequest("PATCH", `/api/menu-items/${id}`, { isVisible });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/menu-items"] });
    },
  });

  const toggleFavoriteMutation = useMutation({
    mutationFn: async ({ id, isFavorite }: { id: string; isFavorite: number }) => {
      await apiRequest("PATCH", `/api/menu-items/${id}`, { isFavorite });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/menu-items"] });
    },
  });

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id && selectedCategory) {
      const categoryItems = menuItems?.filter(item => item.categoryId === selectedCategory) || [];
      const oldIndex = categoryItems.findIndex(item => item.id === active.id);
      const newIndex = categoryItems.findIndex(item => item.id === over.id);

      const reorderedItems = arrayMove(categoryItems, oldIndex, newIndex);
      const orderedIds = reorderedItems.map(item => item.id);

      reorderMutation.mutate({ categoryId: selectedCategory, orderedIds });
    }
  };

  const handleToggleVisibility = (id: string) => {
    const item = menuItems?.find(i => i.id === id);
    if (item) {
      toggleVisibilityMutation.mutate({ 
        id, 
        isVisible: item.isVisible === 1 ? 0 : 1 
      });
    }
  };

  const handleToggleFavorite = (id: string) => {
    const item = menuItems?.find(i => i.id === id);
    if (item) {
      toggleFavoriteMutation.mutate({ 
        id, 
        isFavorite: item.isFavorite === 1 ? 0 : 1 
      });
    }
  };

  if (!categories || categories.length === 0) {
    return (
      <Card>
        <CardContent className="py-12 text-center text-muted-foreground">
          <p>Nenhuma categoria cadastrada</p>
          <p className="text-sm mt-1">Crie categorias na aba "Categorias" para começar</p>
        </CardContent>
      </Card>
    );
  }

  if (!selectedCategory && categories.length > 0) {
    setSelectedCategory(categories[0].id);
  }

  const categoryItems = menuItems?.filter(item => item.categoryId === selectedCategory) || [];
  const visibleCount = categoryItems.filter(item => item.isVisible === 1).length;
  const favoriteCount = categoryItems.filter(item => item.isFavorite === 1).length;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-foreground">Personalizar Menu</h2>
        <p className="text-sm text-muted-foreground mt-1">
          Arraste para reordenar produtos e controle sua visibilidade
        </p>
      </div>

      <Tabs value={selectedCategory || ""} onValueChange={setSelectedCategory}>
        <TabsList className="w-full justify-start overflow-x-auto h-auto flex-wrap">
          {categories.map((category) => {
            const count = menuItems?.filter(item => item.categoryId === category.id).length || 0;
            const visible = menuItems?.filter(item => item.categoryId === category.id && item.isVisible === 1).length || 0;
            
            return (
              <TabsTrigger 
                key={category.id} 
                value={category.id}
                data-testid={`tab-category-${category.id}`}
                className="gap-2"
              >
                {category.name}
                <Badge variant="secondary" className="ml-1">
                  {visible}/{count}
                </Badge>
              </TabsTrigger>
            );
          })}
        </TabsList>

        {categories.map((category) => (
          <TabsContent key={category.id} value={category.id} className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex gap-4 text-sm text-muted-foreground">
                <span>{categoryItems.length} produtos</span>
                <span>{visibleCount} visíveis</span>
                <span>{favoriteCount} favoritos</span>
              </div>
            </div>

            {categoryItems.length === 0 ? (
              <Card>
                <CardContent className="py-8 text-center text-muted-foreground">
                  <p>Nenhum produto nesta categoria</p>
                  <p className="text-sm mt-1">Adicione produtos na aba "Itens do Menu"</p>
                </CardContent>
              </Card>
            ) : (
              <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragEnd={handleDragEnd}
              >
                <SortableContext
                  items={categoryItems.map(item => item.id)}
                  strategy={verticalListSortingStrategy}
                >
                  <div className="space-y-2">
                    {categoryItems.map((item) => (
                      <SortableItem
                        key={item.id}
                        item={item}
                        onToggleVisibility={handleToggleVisibility}
                        onToggleFavorite={handleToggleFavorite}
                      />
                    ))}
                  </div>
                </SortableContext>
              </DndContext>
            )}
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}
