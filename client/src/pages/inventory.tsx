import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, Plus, Edit2, Trash2, Package, TrendingDown, TrendingUp, AlertTriangle } from "lucide-react";
import { Link } from "wouter";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import type { InventoryItem, InventoryCategory, MeasurementUnit, BranchStock, StockMovement, User } from "@shared/schema";

interface InventoryItemWithDetails extends InventoryItem {
  category: InventoryCategory | null;
  unit: MeasurementUnit;
}

interface BranchStockWithDetails extends BranchStock {
  inventoryItem: InventoryItemWithDetails;
}

interface StockMovementWithDetails extends StockMovement {
  inventoryItem: InventoryItem;
  recordedBy: User;
}

function formatCurrency(value: string | number): string {
  const numValue = typeof value === 'string' ? parseFloat(value) : value;
  return new Intl.NumberFormat('pt-AO', {
    style: 'currency',
    currency: 'AOA',
    minimumFractionDigits: 2,
  }).format(numValue).replace('AOA', 'Kz');
}

export default function InventoryPage() {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("produtos");
  
  const [newItemDialog, setNewItemDialog] = useState(false);
  const [editItemDialog, setEditItemDialog] = useState(false);
  const [deleteItemDialog, setDeleteItemDialog] = useState(false);
  const [selectedItem, setSelectedItem] = useState<InventoryItemWithDetails | null>(null);

  const [newCategoryDialog, setNewCategoryDialog] = useState(false);
  const [newUnitDialog, setNewUnitDialog] = useState(false);

  const [newMovementDialog, setNewMovementDialog] = useState(false);

  const [itemForm, setItemForm] = useState({
    name: "",
    description: "",
    sku: "",
    categoryId: "",
    unitId: "",
    costPrice: "0.00",
    minStock: "0.00",
    maxStock: "0.00",
    reorderPoint: "0.00",
    isActive: 1,
  });

  const [categoryForm, setCategoryForm] = useState({
    name: "",
    description: "",
  });

  const [unitForm, setUnitForm] = useState({
    name: "",
    abbreviation: "",
  });

  const [movementForm, setMovementForm] = useState({
    inventoryItemId: "",
    movementType: "entrada" as "entrada" | "saida" | "ajuste" | "transferencia",
    quantity: "0.00",
    unitCost: "0.00",
    totalCost: "0.00",
    reason: "",
  });

  const { data: items } = useQuery<InventoryItemWithDetails[]>({
    queryKey: ["/api/inventory/items"],
  });

  const { data: categories } = useQuery<InventoryCategory[]>({
    queryKey: ["/api/inventory/categories"],
  });

  const { data: units } = useQuery<MeasurementUnit[]>({
    queryKey: ["/api/inventory/units"],
  });

  const { data: stock } = useQuery<BranchStockWithDetails[]>({
    queryKey: ["/api/inventory/stock"],
  });

  const { data: movements } = useQuery<StockMovementWithDetails[]>({
    queryKey: ["/api/inventory/movements"],
  });

  const { data: stats } = useQuery<{
    totalValue: string;
    totalItems: number;
    lowStockItems: number;
    outOfStockItems: number;
  }>({
    queryKey: ["/api/inventory/stats"],
  });

  const createItemMutation = useMutation({
    mutationFn: async (data: typeof itemForm) => {
      await apiRequest("POST", "/api/inventory/items", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/inventory/items"] });
      queryClient.invalidateQueries({ queryKey: ["/api/inventory/stats"] });
      toast({ title: "Produto criado com sucesso" });
      setNewItemDialog(false);
      setItemForm({
        name: "",
        description: "",
        sku: "",
        categoryId: "",
        unitId: "",
        costPrice: "0.00",
        minStock: "0.00",
        maxStock: "0.00",
        reorderPoint: "0.00",
        isActive: 1,
      });
    },
    onError: (error: any) => {
      toast({
        title: "Erro ao criar produto",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const updateItemMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<typeof itemForm> }) => {
      await apiRequest("PUT", `/api/inventory/items/${id}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/inventory/items"] });
      queryClient.invalidateQueries({ queryKey: ["/api/inventory/stats"] });
      toast({ title: "Produto atualizado com sucesso" });
      setEditItemDialog(false);
      setSelectedItem(null);
    },
    onError: (error: any) => {
      toast({
        title: "Erro ao atualizar produto",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const deleteItemMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiRequest("DELETE", `/api/inventory/items/${id}`, undefined);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/inventory/items"] });
      queryClient.invalidateQueries({ queryKey: ["/api/inventory/stats"] });
      toast({ title: "Produto excluído com sucesso" });
      setDeleteItemDialog(false);
      setSelectedItem(null);
    },
    onError: (error: any) => {
      toast({
        title: "Erro ao excluir produto",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const createCategoryMutation = useMutation({
    mutationFn: async (data: typeof categoryForm) => {
      await apiRequest("POST", "/api/inventory/categories", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/inventory/categories"] });
      toast({ title: "Categoria criada com sucesso" });
      setNewCategoryDialog(false);
      setCategoryForm({ name: "", description: "" });
    },
    onError: (error: any) => {
      toast({
        title: "Erro ao criar categoria",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const createUnitMutation = useMutation({
    mutationFn: async (data: typeof unitForm) => {
      await apiRequest("POST", "/api/inventory/units", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/inventory/units"] });
      toast({ title: "Unidade criada com sucesso" });
      setNewUnitDialog(false);
      setUnitForm({ name: "", abbreviation: "" });
    },
    onError: (error: any) => {
      toast({
        title: "Erro ao criar unidade",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const createMovementMutation = useMutation({
    mutationFn: async (data: typeof movementForm) => {
      await apiRequest("POST", "/api/inventory/movements", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/inventory/movements"] });
      queryClient.invalidateQueries({ queryKey: ["/api/inventory/stock"] });
      queryClient.invalidateQueries({ queryKey: ["/api/inventory/stats"] });
      toast({ title: "Movimentação registrada com sucesso" });
      setNewMovementDialog(false);
      setMovementForm({
        inventoryItemId: "",
        movementType: "entrada",
        quantity: "0.00",
        unitCost: "0.00",
        totalCost: "0.00",
        reason: "",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Erro ao registrar movimentação",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleEditItem = (item: InventoryItemWithDetails) => {
    setSelectedItem(item);
    setItemForm({
      name: item.name,
      description: item.description || "",
      sku: item.sku || "",
      categoryId: item.categoryId || "",
      unitId: item.unitId,
      costPrice: item.costPrice || "0.00",
      minStock: item.minStock || "0.00",
      maxStock: item.maxStock || "0.00",
      reorderPoint: item.reorderPoint || "0.00",
      isActive: item.isActive,
    });
    setEditItemDialog(true);
  };

  const getStockStatus = (stock: BranchStockWithDetails) => {
    const quantity = parseFloat(stock.quantity || "0");
    const minStock = parseFloat(stock.inventoryItem.minStock || "0");

    if (quantity === 0) {
      return <Badge variant="destructive">Sem Estoque</Badge>;
    } else if (quantity <= minStock) {
      return <Badge className="bg-yellow-500">Estoque Baixo</Badge>;
    } else {
      return <Badge className="bg-green-500">Normal</Badge>;
    }
  };

  const getMovementTypeIcon = (type: string) => {
    switch (type) {
      case 'entrada':
        return <TrendingUp className="h-4 w-4 text-green-500" />;
      case 'saida':
        return <TrendingDown className="h-4 w-4 text-red-500" />;
      case 'ajuste':
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      default:
        return <Package className="h-4 w-4" />;
    }
  };

  const getMovementTypeBadge = (type: string) => {
    switch (type) {
      case 'entrada':
        return <Badge className="bg-green-500">Entrada</Badge>;
      case 'saida':
        return <Badge className="bg-red-500">Saída</Badge>;
      case 'ajuste':
        return <Badge className="bg-yellow-500">Ajuste</Badge>;
      case 'transferencia':
        return <Badge className="bg-blue-500">Transferência</Badge>;
      default:
        return <Badge>{type}</Badge>;
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Link href="/main-dashboard">
            <Button variant="ghost" size="icon" data-testid="button-back">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold" data-testid="text-page-title">Inventário</h1>
            <p className="text-muted-foreground">Gerencie produtos, estoque e movimentações</p>
          </div>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 gap-1">
            <CardTitle className="text-sm font-medium">Valor Total</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(stats?.totalValue || "0")}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 gap-1">
            <CardTitle className="text-sm font-medium">Total de Itens</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.totalItems || 0}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 gap-1">
            <CardTitle className="text-sm font-medium">Estoque Baixo</CardTitle>
            <AlertTriangle className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-500">{stats?.lowStockItems || 0}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 gap-1">
            <CardTitle className="text-sm font-medium">Sem Estoque</CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-500">{stats?.outOfStockItems || 0}</div>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="produtos" data-testid="tab-products">Produtos</TabsTrigger>
          <TabsTrigger value="estoque" data-testid="tab-stock">Estoque</TabsTrigger>
          <TabsTrigger value="movimentacoes" data-testid="tab-movements">Movimentações</TabsTrigger>
        </TabsList>

        <TabsContent value="produtos" className="space-y-4">
          <div className="flex gap-2">
            <Button onClick={() => setNewItemDialog(true)} data-testid="button-new-product">
              <Plus className="h-4 w-4 mr-2" />
              Novo Produto
            </Button>
            <Button variant="outline" onClick={() => setNewCategoryDialog(true)} data-testid="button-new-category">
              <Plus className="h-4 w-4 mr-2" />
              Nova Categoria
            </Button>
            <Button variant="outline" onClick={() => setNewUnitDialog(true)} data-testid="button-new-unit">
              <Plus className="h-4 w-4 mr-2" />
              Nova Unidade
            </Button>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Produtos</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nome</TableHead>
                    <TableHead>SKU</TableHead>
                    <TableHead>Categoria</TableHead>
                    <TableHead>Unidade</TableHead>
                    <TableHead className="text-right">Preço de Custo</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {items?.map((item) => (
                    <TableRow key={item.id} data-testid={`row-product-${item.id}`}>
                      <TableCell className="font-medium">{item.name}</TableCell>
                      <TableCell>{item.sku || "-"}</TableCell>
                      <TableCell>{item.category?.name || "-"}</TableCell>
                      <TableCell>{item.unit.abbreviation}</TableCell>
                      <TableCell className="text-right">{formatCurrency(item.costPrice)}</TableCell>
                      <TableCell>
                        {item.isActive === 1 ? (
                          <Badge className="bg-green-500">Ativo</Badge>
                        ) : (
                          <Badge variant="secondary">Inativo</Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleEditItem(item)}
                            data-testid={`button-edit-${item.id}`}
                          >
                            <Edit2 className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => {
                              setSelectedItem(item);
                              setDeleteItemDialog(true);
                            }}
                            data-testid={`button-delete-${item.id}`}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                  {!items || items.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center text-muted-foreground">
                        Nenhum produto cadastrado
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="estoque" className="space-y-4">
          <Button onClick={() => setNewMovementDialog(true)} data-testid="button-new-movement">
            <Plus className="h-4 w-4 mr-2" />
            Nova Movimentação
          </Button>

          <Card>
            <CardHeader>
              <CardTitle>Estoque Atual</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Produto</TableHead>
                    <TableHead>Categoria</TableHead>
                    <TableHead className="text-right">Quantidade</TableHead>
                    <TableHead className="text-right">Estoque Mínimo</TableHead>
                    <TableHead className="text-right">Valor Total</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {stock?.map((s) => (
                    <TableRow key={s.id} data-testid={`row-stock-${s.id}`}>
                      <TableCell className="font-medium">{s.inventoryItem.name}</TableCell>
                      <TableCell>{s.inventoryItem.category?.name || "-"}</TableCell>
                      <TableCell className="text-right">
                        {parseFloat(s.quantity).toFixed(2)} {s.inventoryItem.unit.abbreviation}
                      </TableCell>
                      <TableCell className="text-right">
                        {parseFloat(s.inventoryItem.minStock || "0").toFixed(2)} {s.inventoryItem.unit.abbreviation}
                      </TableCell>
                      <TableCell className="text-right">
                        {formatCurrency(parseFloat(s.quantity || "0") * parseFloat(s.inventoryItem.costPrice || "0"))}
                      </TableCell>
                      <TableCell>{getStockStatus(s)}</TableCell>
                    </TableRow>
                  ))}
                  {!stock || stock.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center text-muted-foreground">
                        Nenhum estoque registrado
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="movimentacoes" className="space-y-4">
          <Button onClick={() => setNewMovementDialog(true)} data-testid="button-new-movement-2">
            <Plus className="h-4 w-4 mr-2" />
            Nova Movimentação
          </Button>

          <Card>
            <CardHeader>
              <CardTitle>Histórico de Movimentações</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Data</TableHead>
                    <TableHead>Produto</TableHead>
                    <TableHead>Tipo</TableHead>
                    <TableHead className="text-right">Quantidade</TableHead>
                    <TableHead className="text-right">Custo Unitário</TableHead>
                    <TableHead className="text-right">Custo Total</TableHead>
                    <TableHead>Operador</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {movements?.map((movement) => (
                    <TableRow key={movement.id} data-testid={`row-movement-${movement.id}`}>
                      <TableCell>
                        {movement.createdAt ? new Date(movement.createdAt).toLocaleString('pt-BR') : '-'}
                      </TableCell>
                      <TableCell className="font-medium">{movement.inventoryItem.name}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {getMovementTypeIcon(movement.movementType)}
                          {getMovementTypeBadge(movement.movementType)}
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        {parseFloat(movement.quantity || "0").toFixed(2)}
                      </TableCell>
                      <TableCell className="text-right">
                        {formatCurrency(movement.unitCost || "0")}
                      </TableCell>
                      <TableCell className="text-right">
                        {formatCurrency(movement.totalCost || "0")}
                      </TableCell>
                      <TableCell>
                        {movement.recordedBy.firstName} {movement.recordedBy.lastName}
                      </TableCell>
                    </TableRow>
                  ))}
                  {!movements || movements.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center text-muted-foreground">
                        Nenhuma movimentação registrada
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* New Item Dialog */}
      <Dialog open={newItemDialog} onOpenChange={setNewItemDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Novo Produto</DialogTitle>
            <DialogDescription>Adicione um novo produto ao inventário</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nome *</Label>
                <Input
                  id="name"
                  value={itemForm.name}
                  onChange={(e) => setItemForm({ ...itemForm, name: e.target.value })}
                  data-testid="input-name"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="sku">SKU</Label>
                <Input
                  id="sku"
                  value={itemForm.sku}
                  onChange={(e) => setItemForm({ ...itemForm, sku: e.target.value })}
                  data-testid="input-sku"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Descrição</Label>
              <Textarea
                id="description"
                value={itemForm.description}
                onChange={(e) => setItemForm({ ...itemForm, description: e.target.value })}
                data-testid="input-description"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="categoryId">Categoria</Label>
                <Select
                  value={itemForm.categoryId}
                  onValueChange={(value) => setItemForm({ ...itemForm, categoryId: value })}
                >
                  <SelectTrigger data-testid="select-category">
                    <SelectValue placeholder="Selecione a categoria" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories?.map((cat) => (
                      <SelectItem key={cat.id} value={cat.id}>
                        {cat.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="unitId">Unidade de Medida *</Label>
                <Select
                  value={itemForm.unitId}
                  onValueChange={(value) => setItemForm({ ...itemForm, unitId: value })}
                >
                  <SelectTrigger data-testid="select-unit">
                    <SelectValue placeholder="Selecione a unidade" />
                  </SelectTrigger>
                  <SelectContent>
                    {units?.map((unit) => (
                      <SelectItem key={unit.id} value={unit.id}>
                        {unit.name} ({unit.abbreviation})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="costPrice">Preço de Custo</Label>
                <Input
                  id="costPrice"
                  type="number"
                  step="0.01"
                  value={itemForm.costPrice}
                  onChange={(e) => setItemForm({ ...itemForm, costPrice: e.target.value })}
                  data-testid="input-cost-price"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="minStock">Estoque Mínimo</Label>
                <Input
                  id="minStock"
                  type="number"
                  step="0.01"
                  value={itemForm.minStock}
                  onChange={(e) => setItemForm({ ...itemForm, minStock: e.target.value })}
                  data-testid="input-min-stock"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="maxStock">Estoque Máximo</Label>
                <Input
                  id="maxStock"
                  type="number"
                  step="0.01"
                  value={itemForm.maxStock}
                  onChange={(e) => setItemForm({ ...itemForm, maxStock: e.target.value })}
                  data-testid="input-max-stock"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="reorderPoint">Ponto de Recompra</Label>
                <Input
                  id="reorderPoint"
                  type="number"
                  step="0.01"
                  value={itemForm.reorderPoint}
                  onChange={(e) => setItemForm({ ...itemForm, reorderPoint: e.target.value })}
                  data-testid="input-reorder-point"
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setNewItemDialog(false)}>
              Cancelar
            </Button>
            <Button
              onClick={() => createItemMutation.mutate(itemForm)}
              disabled={createItemMutation.isPending}
              data-testid="button-submit-new-product"
            >
              {createItemMutation.isPending ? "Criando..." : "Criar Produto"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Item Dialog */}
      <Dialog open={editItemDialog} onOpenChange={setEditItemDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Editar Produto</DialogTitle>
            <DialogDescription>Atualize as informações do produto</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-name">Nome *</Label>
                <Input
                  id="edit-name"
                  value={itemForm.name}
                  onChange={(e) => setItemForm({ ...itemForm, name: e.target.value })}
                  data-testid="input-edit-name"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-sku">SKU</Label>
                <Input
                  id="edit-sku"
                  value={itemForm.sku}
                  onChange={(e) => setItemForm({ ...itemForm, sku: e.target.value })}
                  data-testid="input-edit-sku"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-description">Descrição</Label>
              <Textarea
                id="edit-description"
                value={itemForm.description}
                onChange={(e) => setItemForm({ ...itemForm, description: e.target.value })}
                data-testid="input-edit-description"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-categoryId">Categoria</Label>
                <Select
                  value={itemForm.categoryId}
                  onValueChange={(value) => setItemForm({ ...itemForm, categoryId: value })}
                >
                  <SelectTrigger data-testid="select-edit-category">
                    <SelectValue placeholder="Selecione a categoria" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories?.map((cat) => (
                      <SelectItem key={cat.id} value={cat.id}>
                        {cat.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-unitId">Unidade de Medida *</Label>
                <Select
                  value={itemForm.unitId}
                  onValueChange={(value) => setItemForm({ ...itemForm, unitId: value })}
                >
                  <SelectTrigger data-testid="select-edit-unit">
                    <SelectValue placeholder="Selecione a unidade" />
                  </SelectTrigger>
                  <SelectContent>
                    {units?.map((unit) => (
                      <SelectItem key={unit.id} value={unit.id}>
                        {unit.name} ({unit.abbreviation})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-costPrice">Preço de Custo</Label>
                <Input
                  id="edit-costPrice"
                  type="number"
                  step="0.01"
                  value={itemForm.costPrice}
                  onChange={(e) => setItemForm({ ...itemForm, costPrice: e.target.value })}
                  data-testid="input-edit-cost-price"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-minStock">Estoque Mínimo</Label>
                <Input
                  id="edit-minStock"
                  type="number"
                  step="0.01"
                  value={itemForm.minStock}
                  onChange={(e) => setItemForm({ ...itemForm, minStock: e.target.value })}
                  data-testid="input-edit-min-stock"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-maxStock">Estoque Máximo</Label>
                <Input
                  id="edit-maxStock"
                  type="number"
                  step="0.01"
                  value={itemForm.maxStock}
                  onChange={(e) => setItemForm({ ...itemForm, maxStock: e.target.value })}
                  data-testid="input-edit-max-stock"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-reorderPoint">Ponto de Recompra</Label>
                <Input
                  id="edit-reorderPoint"
                  type="number"
                  step="0.01"
                  value={itemForm.reorderPoint}
                  onChange={(e) => setItemForm({ ...itemForm, reorderPoint: e.target.value })}
                  data-testid="input-edit-reorder-point"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-isActive">Status</Label>
              <Select
                value={itemForm.isActive.toString()}
                onValueChange={(value) => setItemForm({ ...itemForm, isActive: parseInt(value) })}
              >
                <SelectTrigger data-testid="select-edit-status">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">Ativo</SelectItem>
                  <SelectItem value="0">Inativo</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditItemDialog(false)}>
              Cancelar
            </Button>
            <Button
              onClick={() => selectedItem && updateItemMutation.mutate({ id: selectedItem.id, data: itemForm })}
              disabled={updateItemMutation.isPending}
              data-testid="button-submit-edit-product"
            >
              {updateItemMutation.isPending ? "Atualizando..." : "Atualizar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Item Dialog */}
      <Dialog open={deleteItemDialog} onOpenChange={setDeleteItemDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Excluir Produto</DialogTitle>
            <DialogDescription>
              Tem certeza que deseja excluir o produto "{selectedItem?.name}"? Esta ação não pode ser desfeita.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteItemDialog(false)}>
              Cancelar
            </Button>
            <Button
              variant="destructive"
              onClick={() => selectedItem && deleteItemMutation.mutate(selectedItem.id)}
              disabled={deleteItemMutation.isPending}
              data-testid="button-confirm-delete"
            >
              {deleteItemMutation.isPending ? "Excluindo..." : "Excluir"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* New Category Dialog */}
      <Dialog open={newCategoryDialog} onOpenChange={setNewCategoryDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Nova Categoria</DialogTitle>
            <DialogDescription>Adicione uma nova categoria de inventário</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="category-name">Nome *</Label>
              <Input
                id="category-name"
                value={categoryForm.name}
                onChange={(e) => setCategoryForm({ ...categoryForm, name: e.target.value })}
                data-testid="input-category-name"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="category-description">Descrição</Label>
              <Textarea
                id="category-description"
                value={categoryForm.description}
                onChange={(e) => setCategoryForm({ ...categoryForm, description: e.target.value })}
                data-testid="input-category-description"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setNewCategoryDialog(false)}>
              Cancelar
            </Button>
            <Button
              onClick={() => createCategoryMutation.mutate(categoryForm)}
              disabled={createCategoryMutation.isPending}
              data-testid="button-submit-category"
            >
              {createCategoryMutation.isPending ? "Criando..." : "Criar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* New Unit Dialog */}
      <Dialog open={newUnitDialog} onOpenChange={setNewUnitDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Nova Unidade de Medida</DialogTitle>
            <DialogDescription>Adicione uma nova unidade de medida</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="unit-name">Nome *</Label>
              <Input
                id="unit-name"
                value={unitForm.name}
                onChange={(e) => setUnitForm({ ...unitForm, name: e.target.value })}
                placeholder="Ex: Quilograma"
                data-testid="input-unit-name"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="unit-abbreviation">Abreviação *</Label>
              <Input
                id="unit-abbreviation"
                value={unitForm.abbreviation}
                onChange={(e) => setUnitForm({ ...unitForm, abbreviation: e.target.value })}
                placeholder="Ex: kg"
                data-testid="input-unit-abbreviation"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setNewUnitDialog(false)}>
              Cancelar
            </Button>
            <Button
              onClick={() => createUnitMutation.mutate(unitForm)}
              disabled={createUnitMutation.isPending}
              data-testid="button-submit-unit"
            >
              {createUnitMutation.isPending ? "Criando..." : "Criar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* New Movement Dialog */}
      <Dialog open={newMovementDialog} onOpenChange={setNewMovementDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Nova Movimentação</DialogTitle>
            <DialogDescription>Registre uma movimentação de estoque</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="movement-item">Produto *</Label>
              <Select
                value={movementForm.inventoryItemId}
                onValueChange={(value) => setMovementForm({ ...movementForm, inventoryItemId: value })}
              >
                <SelectTrigger data-testid="select-movement-item">
                  <SelectValue placeholder="Selecione o produto" />
                </SelectTrigger>
                <SelectContent>
                  {items?.map((item) => (
                    <SelectItem key={item.id} value={item.id}>
                      {item.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="movement-type">Tipo de Movimentação *</Label>
              <Select
                value={movementForm.movementType}
                onValueChange={(value) => setMovementForm({ ...movementForm, movementType: value as any })}
              >
                <SelectTrigger data-testid="select-movement-type">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="entrada">Entrada</SelectItem>
                  <SelectItem value="saida">Saída</SelectItem>
                  <SelectItem value="ajuste">Ajuste</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="movement-quantity">Quantidade *</Label>
              <Input
                id="movement-quantity"
                type="number"
                step="0.01"
                value={movementForm.quantity}
                onChange={(e) => setMovementForm({ ...movementForm, quantity: e.target.value })}
                data-testid="input-movement-quantity"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="movement-unit-cost">Custo Unitário</Label>
                <Input
                  id="movement-unit-cost"
                  type="number"
                  step="0.01"
                  value={movementForm.unitCost}
                  onChange={(e) => {
                    const unitCost = e.target.value;
                    const totalCost = (parseFloat(unitCost) * parseFloat(movementForm.quantity)).toFixed(2);
                    setMovementForm({ ...movementForm, unitCost, totalCost });
                  }}
                  data-testid="input-movement-unit-cost"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="movement-total-cost">Custo Total</Label>
                <Input
                  id="movement-total-cost"
                  type="number"
                  step="0.01"
                  value={movementForm.totalCost}
                  onChange={(e) => setMovementForm({ ...movementForm, totalCost: e.target.value })}
                  data-testid="input-movement-total-cost"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="movement-reason">Motivo</Label>
              <Textarea
                id="movement-reason"
                value={movementForm.reason}
                onChange={(e) => setMovementForm({ ...movementForm, reason: e.target.value })}
                placeholder="Descreva o motivo da movimentação"
                data-testid="input-movement-reason"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setNewMovementDialog(false)}>
              Cancelar
            </Button>
            <Button
              onClick={() => createMovementMutation.mutate(movementForm)}
              disabled={createMovementMutation.isPending}
              data-testid="button-submit-movement"
            >
              {createMovementMutation.isPending ? "Registrando..." : "Registrar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
