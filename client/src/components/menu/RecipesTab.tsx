import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Plus, Trash2, ChefHat, Package } from "lucide-react";
import type { MenuItem, InventoryItem, RecipeIngredient, MeasurementUnit } from "@shared/schema";

interface RecipeIngredientWithDetails extends RecipeIngredient {
  inventoryItem: InventoryItem & { unit: MeasurementUnit };
}

function formatCurrency(value: string | number): string {
  const numValue = typeof value === 'string' ? parseFloat(value) : value;
  return new Intl.NumberFormat('pt-AO', {
    style: 'currency',
    currency: 'AOA',
    minimumFractionDigits: 2,
  }).format(numValue).replace('AOA', 'Kz');
}

export function RecipesTab() {
  const { toast } = useToast();
  const [selectedMenuItem, setSelectedMenuItem] = useState<string>("");
  const [addIngredientDialog, setAddIngredientDialog] = useState(false);
  const [newIngredient, setNewIngredient] = useState({
    inventoryItemId: "",
    quantity: "0",
  });

  const { data: menuItems } = useQuery<Array<MenuItem & { category: any }>>({
    queryKey: ["/api/menu-items"],
  });

  const { data: inventoryItems } = useQuery<Array<InventoryItem & { unit: MeasurementUnit }>>({
    queryKey: ["/api/inventory/items"],
  });

  const { data: recipeData } = useQuery<{ ingredients: RecipeIngredientWithDetails[]; cost: string }>({
    queryKey: ["/api/menu-items", selectedMenuItem, "recipe"],
    enabled: !!selectedMenuItem,
  });

  const addIngredientMutation = useMutation({
    mutationFn: async (data: { inventoryItemId: string; quantity: string }) => {
      return await apiRequest(`/api/menu-items/${selectedMenuItem}/recipe`, "POST", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/menu-items", selectedMenuItem, "recipe"] });
      setAddIngredientDialog(false);
      setNewIngredient({ inventoryItemId: "", quantity: "0" });
      toast({
        title: "Ingrediente adicionado",
        description: "O ingrediente foi adicionado à receita com sucesso",
      });
    },
    onError: () => {
      toast({
        title: "Erro",
        description: "Não foi possível adicionar o ingrediente",
        variant: "destructive",
      });
    },
  });

  const deleteIngredientMutation = useMutation({
    mutationFn: async (id: string) => {
      return await apiRequest(`/api/recipe-ingredients/${id}`, "DELETE");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/menu-items", selectedMenuItem, "recipe"] });
      toast({
        title: "Ingrediente removido",
        description: "O ingrediente foi removido da receita",
      });
    },
    onError: () => {
      toast({
        title: "Erro",
        description: "Não foi possível remover o ingrediente",
        variant: "destructive",
      });
    },
  });

  const selectedMenuItemData = menuItems?.find(item => item.id === selectedMenuItem);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ChefHat className="h-5 w-5" />
            Receitas dos Pratos
          </CardTitle>
          <CardDescription>
            Cadastre os ingredientes necessários para cada prato do menu. O estoque será reduzido automaticamente quando um pedido for servido.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Selecionar Prato</Label>
            <Select value={selectedMenuItem} onValueChange={setSelectedMenuItem}>
              <SelectTrigger data-testid="select-menu-item">
                <SelectValue placeholder="Selecione um prato..." />
              </SelectTrigger>
              <SelectContent>
                {menuItems?.map((item) => (
                  <SelectItem key={item.id} value={item.id}>
                    {item.name} - {formatCurrency(item.price)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {selectedMenuItem && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold">{selectedMenuItemData?.name}</h3>
                  <p className="text-sm text-muted-foreground">
                    Custo dos ingredientes: {recipeData?.cost ? formatCurrency(recipeData.cost) : formatCurrency(0)}
                  </p>
                </div>
                <Button
                  onClick={() => setAddIngredientDialog(true)}
                  size="sm"
                  data-testid="button-add-ingredient"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Adicionar Ingrediente
                </Button>
              </div>

              {recipeData?.ingredients && recipeData.ingredients.length > 0 ? (
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Ingrediente</TableHead>
                        <TableHead>Quantidade</TableHead>
                        <TableHead>Unidade</TableHead>
                        <TableHead>Custo Unit.</TableHead>
                        <TableHead>Custo Total</TableHead>
                        <TableHead className="w-[100px]">Ações</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {recipeData.ingredients.map((ingredient) => {
                        const qty = parseFloat(ingredient.quantity);
                        const cost = parseFloat(ingredient.inventoryItem.costPrice);
                        const total = qty * cost;
                        return (
                          <TableRow key={ingredient.id}>
                            <TableCell className="font-medium">
                              {ingredient.inventoryItem.name}
                            </TableCell>
                            <TableCell>{ingredient.quantity}</TableCell>
                            <TableCell>{ingredient.inventoryItem.unit.abbreviation}</TableCell>
                            <TableCell>{formatCurrency(cost)}</TableCell>
                            <TableCell>{formatCurrency(total)}</TableCell>
                            <TableCell>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => deleteIngredientMutation.mutate(ingredient.id)}
                                data-testid={`button-delete-ingredient-${ingredient.id}`}
                              >
                                <Trash2 className="h-4 w-4 text-destructive" />
                              </Button>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </div>
              ) : (
                <Card>
                  <CardContent className="flex flex-col items-center justify-center py-8 text-center">
                    <Package className="h-12 w-12 text-muted-foreground mb-4" />
                    <p className="text-muted-foreground">
                      Nenhum ingrediente cadastrado para este prato
                    </p>
                    <p className="text-sm text-muted-foreground mt-2">
                      Clique em "Adicionar Ingrediente" para começar
                    </p>
                  </CardContent>
                </Card>
              )}
            </div>
          )}

          {!selectedMenuItem && (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12 text-center">
                <ChefHat className="h-16 w-16 text-muted-foreground mb-4" />
                <p className="text-lg font-medium">Selecione um prato</p>
                <p className="text-sm text-muted-foreground mt-2">
                  Escolha um prato do menu para gerenciar sua receita
                </p>
              </CardContent>
            </Card>
          )}
        </CardContent>
      </Card>

      <Dialog open={addIngredientDialog} onOpenChange={setAddIngredientDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Adicionar Ingrediente</DialogTitle>
            <DialogDescription>
              Adicione um ingrediente do inventário à receita deste prato
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Ingrediente</Label>
              <Select
                value={newIngredient.inventoryItemId}
                onValueChange={(value) =>
                  setNewIngredient({ ...newIngredient, inventoryItemId: value })
                }
              >
                <SelectTrigger data-testid="select-ingredient">
                  <SelectValue placeholder="Selecione um ingrediente..." />
                </SelectTrigger>
                <SelectContent>
                  {inventoryItems?.map((item) => (
                    <SelectItem key={item.id} value={item.id}>
                      {item.name} ({item.unit.abbreviation})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Quantidade</Label>
              <Input
                type="number"
                step="0.001"
                placeholder="0"
                value={newIngredient.quantity}
                onChange={(e) =>
                  setNewIngredient({ ...newIngredient, quantity: e.target.value })
                }
                data-testid="input-quantity"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setAddIngredientDialog(false)}
              data-testid="button-cancel"
            >
              Cancelar
            </Button>
            <Button
              onClick={() => addIngredientMutation.mutate(newIngredient)}
              disabled={!newIngredient.inventoryItemId || parseFloat(newIngredient.quantity) <= 0}
              data-testid="button-save-ingredient"
            >
              Adicionar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
