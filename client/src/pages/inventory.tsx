import { useState, useMemo } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { motion } from "framer-motion";
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
import { ArrowLeft, Plus, Edit2, Trash2, Package, TrendingDown, TrendingUp, AlertTriangle, Box, Archive, Warehouse } from "lucide-react";
import { TubelightNavBar } from "@/components/ui/tubelight-navbar";
import { Link } from "wouter";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { AdvancedKpiCard } from "@/components/advanced-kpi-card";
import { AdvancedFilters, FilterOption } from "@/components/advanced-filters";
import { AdvancedSalesChart } from "@/components/advanced-sales-chart";
import { ActivityFeed } from "@/components/activity-feed";
import { QuickActionsWidget } from "@/components/quick-actions-widget";
import { ShimmerSkeleton } from "@/components/shimmer-skeleton";
import { formatKwanza } from "@/lib/formatters";
import { startOfWeek, endOfWeek, startOfMonth, endOfMonth, startOfYear, endOfYear, subMonths, format } from "date-fns";
import { DateRange } from "react-day-picker";
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
  const [quickFilter, setQuickFilter] = useState<FilterOption>("month");
  const [dateRange, setDateRange] = useState<DateRange | undefined>(undefined);
  
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

  const movementParams = useMemo(() => {
    const params: any = {};

    if (dateRange?.from) {
      const startDate = new Date(dateRange.from);
      startDate.setHours(0, 0, 0, 0);
      params.startDate = startDate.toISOString();
      
      if (dateRange.to) {
        const endDate = new Date(dateRange.to);
        endDate.setHours(23, 59, 59, 999);
        params.endDate = endDate.toISOString();
      } else {
        const endDate = new Date(dateRange.from);
        endDate.setHours(23, 59, 59, 999);
        params.endDate = endDate.toISOString();
      }
    } else {
      let startDate: Date;
      let endDate: Date;

      switch (quickFilter) {
        case 'today':
          startDate = new Date();
          startDate.setHours(0, 0, 0, 0);
          endDate = new Date();
          endDate.setHours(23, 59, 59, 999);
          break;
        case 'week':
          startDate = startOfWeek(new Date(), { weekStartsOn: 1 });
          endDate = endOfWeek(new Date(), { weekStartsOn: 1 });
          endDate.setHours(23, 59, 59, 999);
          break;
        case 'month':
          startDate = startOfMonth(new Date());
          endDate = endOfMonth(new Date());
          endDate.setHours(23, 59, 59, 999);
          break;
        case '3months':
          startDate = startOfMonth(subMonths(new Date(), 2));
          endDate = endOfMonth(new Date());
          endDate.setHours(23, 59, 59, 999);
          break;
        case 'year':
          startDate = startOfYear(new Date());
          endDate = endOfYear(new Date());
          endDate.setHours(23, 59, 59, 999);
          break;
      }
      
      params.startDate = startDate.toISOString();
      params.endDate = endDate.toISOString();
    }

    return params;
  }, [dateRange, quickFilter]);

  const handleQuickFilterChange = (filter: FilterOption) => {
    setQuickFilter(filter);
    setDateRange(undefined);
  };

  const handleRefresh = () => {
    queryClient.invalidateQueries({ queryKey: ["/api/inventory/items"] });
    queryClient.invalidateQueries({ queryKey: ["/api/inventory/stock"] });
    queryClient.invalidateQueries({ queryKey: ["/api/inventory/movements"] });
    queryClient.invalidateQueries({ queryKey: ["/api/inventory/stats"] });
  };

  const handleExport = () => {
    toast({
      title: "Exportar dados",
      description: "Funcionalidade de exportação em desenvolvimento",
    });
  };

  const { data: items, isLoading: itemsLoading } = useQuery<InventoryItemWithDetails[]>({
    queryKey: ["/api/inventory/items"],
  });

  const { data: categories } = useQuery<InventoryCategory[]>({
    queryKey: ["/api/inventory/categories"],
  });

  const { data: units } = useQuery<MeasurementUnit[]>({
    queryKey: ["/api/inventory/units"],
  });

  const { data: stock, isLoading: stockLoading } = useQuery<BranchStockWithDetails[]>({
    queryKey: ["/api/inventory/stock"],
  });

  const { data: movements, isLoading: movementsLoading } = useQuery<StockMovementWithDetails[]>({
    queryKey: ["/api/inventory/movements"],
  });

  const { data: stats, isLoading: statsLoading } = useQuery<{
    totalValue: string;
    totalItems: number;
    lowStockItems: number;
    outOfStockItems: number;
  }>({
    queryKey: ["/api/inventory/stats"],
  });

  const mockSparklineData = [65, 72, 68, 75, 70, 78, 82, 85, 80, 88];

  const chartData = useMemo(() => {
    if (!movements || movements.length === 0) return [];

    const grouped = movements.reduce((acc, movement) => {
      const date = movement.createdAt ? format(new Date(movement.createdAt), 'yyyy-MM-dd') : '';
      if (!date) return acc;

      if (!acc[date]) {
        acc[date] = { date, entrada: 0, saida: 0 };
      }

      const totalCost = parseFloat(movement.totalCost || "0");
      if (movement.movementType === 'entrada') {
        acc[date].entrada += totalCost;
      } else if (movement.movementType === 'saida') {
        acc[date].saida += totalCost;
      }

      return acc;
    }, {} as Record<string, { date: string; entrada: number; saida: number }>);

    return Object.values(grouped)
      .sort((a, b) => a.date.localeCompare(b.date))
      .map(item => ({
        date: item.date,
        sales: item.entrada,
        orders: item.saida,
      }));
  }, [movements]);

  const activityData = useMemo(() => {
    if (!movements) return [];

    return movements
      .slice(0, 15)
      .map((movement) => ({
        id: movement.id,
        type: "order" as const,
        title: `${movement.movementType.charAt(0).toUpperCase() + movement.movementType.slice(1)} - ${movement.inventoryItem.name}`,
        description: `Quantidade: ${parseFloat(movement.quantity || "0").toFixed(2)} | Custo: ${formatCurrency(movement.totalCost || "0")} | Por: ${movement.recordedBy.firstName} ${movement.recordedBy.lastName}`,
        timestamp: movement.createdAt ? new Date(movement.createdAt) : new Date(),
        status: movement.movementType === 'entrada' ? 'success' as const : movement.movementType === 'saida' ? 'warning' as const : 'info' as const,
        value: formatCurrency(movement.totalCost || "0"),
      }));
  }, [movements]);

  const quickActions = [
    {
      id: "new-movement",
      title: "Nova Movimentação",
      description: "Registrar movimentação",
      icon: TrendingUp,
      color: "primary",
      onClick: () => setNewMovementDialog(true),
    },
    {
      id: "new-product",
      title: "Novo Produto",
      description: "Cadastrar produto",
      icon: Package,
      color: "success",
      onClick: () => setNewItemDialog(true),
    },
    {
      id: "new-category",
      title: "Nova Categoria",
      description: "Criar categoria",
      icon: Box,
      color: "warning",
      onClick: () => setNewCategoryDialog(true),
    },
    {
      id: "new-unit",
      title: "Nova Unidade",
      description: "Adicionar unidade",
      icon: Archive,
      color: "info",
      onClick: () => setNewUnitDialog(true),
    },
  ];

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
    <div className="min-h-screen">
      <ScrollArea className="h-screen">
        <div className="space-y-6 p-4 sm:p-6 lg:p-8">
          <motion.div 
            className="space-y-4"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="flex items-center gap-4">
              <Link href="/main-dashboard">
                <Button variant="ghost" size="icon" data-testid="button-back">
                  <ArrowLeft className="h-5 w-5" />
                </Button>
              </Link>
              <div className="flex flex-col gap-2">
                <h1 className="text-4xl sm:text-5xl font-bold tracking-tight bg-gradient-to-r from-primary via-primary/80 to-primary/60 bg-clip-text text-transparent" data-testid="text-page-title">
                  Inventário
                </h1>
                <p className="text-base text-muted-foreground">Gerencie produtos, estoque e movimentações</p>
              </div>
            </div>
          </motion.div>

          {statsLoading ? (
            <div className="grid gap-4 md:grid-cols-4">
              {[...Array(4)].map((_, i) => (
                <ShimmerSkeleton key={i} className="h-32" />
              ))}
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <AdvancedKpiCard
                title="Valor Total do Estoque"
                value={parseFloat(stats?.totalValue || "0")}
                prefix="Kz "
                decimals={2}
                icon={Package}
                sparklineData={mockSparklineData}
                gradient="from-primary/10 to-transparent"
                delay={0}
                data-testid="kpi-total-value"
              />

              <AdvancedKpiCard
                title="Total de Itens"
                value={stats?.totalItems || 0}
                icon={Box}
                sparklineData={mockSparklineData}
                gradient="from-success/10 to-transparent"
                delay={0.1}
                data-testid="kpi-total-items"
              />

              <AdvancedKpiCard
                title="Itens com Estoque Baixo"
                value={stats?.lowStockItems || 0}
                icon={AlertTriangle}
                change={-5.2}
                changeLabel="requer atenção"
                sparklineData={mockSparklineData}
                gradient="from-warning/10 to-transparent"
                delay={0.2}
                data-testid="kpi-low-stock"
              />

              <AdvancedKpiCard
                title="Itens Sem Estoque"
                value={stats?.outOfStockItems || 0}
                icon={AlertTriangle}
                change={stats?.outOfStockItems && stats.outOfStockItems > 0 ? -10 : 0}
                changeLabel="ação urgente"
                sparklineData={mockSparklineData}
                gradient="from-destructive/10 to-transparent"
                delay={0.3}
                data-testid="kpi-out-of-stock"
              />
            </div>
          )}

          <div className="grid gap-6 lg:grid-cols-3">
            <div className="lg:col-span-2 space-y-6">
              <AdvancedFilters
                quickFilter={quickFilter}
                onQuickFilterChange={handleQuickFilterChange}
                dateRange={dateRange}
                onDateRangeChange={setDateRange}
                onRefresh={handleRefresh}
                onExport={handleExport}
                isLoading={movementsLoading}
              />

              {movementsLoading ? (
                <ShimmerSkeleton className="h-96" />
              ) : (
                <AdvancedSalesChart
                  data={chartData}
                  title="Movimentações de Estoque (Entrada vs Saída)"
                />
              )}

              <div className="flex justify-center mb-6">
                <TubelightNavBar
                  className="relative"
                  items={[
                    { name: "Produtos", url: "#", icon: Package },
                    { name: "Estoque", url: "#", icon: Warehouse },
                    { name: "Movimentações", url: "#", icon: TrendingUp },
                  ]}
                  activeItem={
                    activeTab === "produtos" ? "Produtos" :
                    activeTab === "estoque" ? "Estoque" :
                    "Movimentações"
                  }
                  onItemClick={(item) => {
                    const tabValue = 
                      item.name === "Produtos" ? "produtos" :
                      item.name === "Estoque" ? "estoque" :
                      "movimentacoes";
                    setActiveTab(tabValue);
                  }}
                />
              </div>

              <div>
                {activeTab === "produtos" && (
                <div className="space-y-4">
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
                      {itemsLoading ? (
                        <ShimmerSkeleton className="h-64" />
                      ) : (
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
                      )}
                    </CardContent>
                  </Card>
                </div>
                )}

                {activeTab === "estoque" && (
                <div className="space-y-4">
                  <Button onClick={() => setNewMovementDialog(true)} data-testid="button-new-movement">
                    <Plus className="h-4 w-4 mr-2" />
                    Nova Movimentação
                  </Button>

                  <Card>
                    <CardHeader>
                      <CardTitle>Estoque Atual</CardTitle>
                    </CardHeader>
                    <CardContent>
                      {stockLoading ? (
                        <ShimmerSkeleton className="h-64" />
                      ) : (
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
                      )}
                    </CardContent>
                  </Card>
                </div>
                )}

                {activeTab === "movimentacoes" && (
                <div className="space-y-4">
                  <Button onClick={() => setNewMovementDialog(true)} data-testid="button-new-movement-2">
                    <Plus className="h-4 w-4 mr-2" />
                    Nova Movimentação
                  </Button>

                  <Card>
                    <CardHeader>
                      <CardTitle>Histórico de Movimentações</CardTitle>
                    </CardHeader>
                    <CardContent>
                      {movementsLoading ? (
                        <ShimmerSkeleton className="h-64" />
                      ) : (
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
                      )}
                    </CardContent>
                  </Card>
                </div>
                )}
              </div>
            </div>

            <div className="space-y-6">
              <QuickActionsWidget actions={quickActions} />
              
              {movementsLoading ? (
                <ShimmerSkeleton className="h-96" />
              ) : (
                <ActivityFeed 
                  activities={activityData}
                  title="Últimas Movimentações"
                  maxHeight={500}
                />
              )}
            </div>
          </div>

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
                      placeholder="Ex: Farinha de Trigo"
                      data-testid="input-product-name"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="sku">SKU</Label>
                    <Input
                      id="sku"
                      value={itemForm.sku}
                      onChange={(e) => setItemForm({ ...itemForm, sku: e.target.value })}
                      placeholder="Ex: FT-001"
                      data-testid="input-product-sku"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Descrição</Label>
                  <Textarea
                    id="description"
                    value={itemForm.description}
                    onChange={(e) => setItemForm({ ...itemForm, description: e.target.value })}
                    placeholder="Descrição do produto"
                    data-testid="input-product-description"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="category">Categoria</Label>
                    <Select
                      value={itemForm.categoryId}
                      onValueChange={(value) => setItemForm({ ...itemForm, categoryId: value })}
                    >
                      <SelectTrigger data-testid="select-product-category">
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
                    <Label htmlFor="unit">Unidade de Medida *</Label>
                    <Select
                      value={itemForm.unitId}
                      onValueChange={(value) => setItemForm({ ...itemForm, unitId: value })}
                    >
                      <SelectTrigger data-testid="select-product-unit">
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
                      data-testid="input-product-cost-price"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="reorderPoint">Ponto de Reabastecimento</Label>
                    <Input
                      id="reorderPoint"
                      type="number"
                      step="0.01"
                      value={itemForm.reorderPoint}
                      onChange={(e) => setItemForm({ ...itemForm, reorderPoint: e.target.value })}
                      data-testid="input-product-reorder-point"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="minStock">Estoque Mínimo</Label>
                    <Input
                      id="minStock"
                      type="number"
                      step="0.01"
                      value={itemForm.minStock}
                      onChange={(e) => setItemForm({ ...itemForm, minStock: e.target.value })}
                      data-testid="input-product-min-stock"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="maxStock">Estoque Máximo</Label>
                    <Input
                      id="maxStock"
                      type="number"
                      step="0.01"
                      value={itemForm.maxStock}
                      onChange={(e) => setItemForm({ ...itemForm, maxStock: e.target.value })}
                      data-testid="input-product-max-stock"
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
                  data-testid="button-submit-product"
                >
                  {createItemMutation.isPending ? "Criando..." : "Criar"}
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
                      data-testid="input-edit-product-name"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="edit-sku">SKU</Label>
                    <Input
                      id="edit-sku"
                      value={itemForm.sku}
                      onChange={(e) => setItemForm({ ...itemForm, sku: e.target.value })}
                      data-testid="input-edit-product-sku"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="edit-description">Descrição</Label>
                  <Textarea
                    id="edit-description"
                    value={itemForm.description}
                    onChange={(e) => setItemForm({ ...itemForm, description: e.target.value })}
                    data-testid="input-edit-product-description"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="edit-category">Categoria</Label>
                    <Select
                      value={itemForm.categoryId}
                      onValueChange={(value) => setItemForm({ ...itemForm, categoryId: value })}
                    >
                      <SelectTrigger data-testid="select-edit-product-category">
                        <SelectValue />
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
                    <Label htmlFor="edit-unit">Unidade de Medida *</Label>
                    <Select
                      value={itemForm.unitId}
                      onValueChange={(value) => setItemForm({ ...itemForm, unitId: value })}
                    >
                      <SelectTrigger data-testid="select-edit-product-unit">
                        <SelectValue />
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
                      data-testid="input-edit-product-cost-price"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="edit-reorderPoint">Ponto de Reabastecimento</Label>
                    <Input
                      id="edit-reorderPoint"
                      type="number"
                      step="0.01"
                      value={itemForm.reorderPoint}
                      onChange={(e) => setItemForm({ ...itemForm, reorderPoint: e.target.value })}
                      data-testid="input-edit-product-reorder-point"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="edit-minStock">Estoque Mínimo</Label>
                    <Input
                      id="edit-minStock"
                      type="number"
                      step="0.01"
                      value={itemForm.minStock}
                      onChange={(e) => setItemForm({ ...itemForm, minStock: e.target.value })}
                      data-testid="input-edit-product-min-stock"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="edit-maxStock">Estoque Máximo</Label>
                    <Input
                      id="edit-maxStock"
                      type="number"
                      step="0.01"
                      value={itemForm.maxStock}
                      onChange={(e) => setItemForm({ ...itemForm, maxStock: e.target.value })}
                      data-testid="input-edit-product-max-stock"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="edit-isActive">Status</Label>
                  <Select
                    value={String(itemForm.isActive)}
                    onValueChange={(value) => setItemForm({ ...itemForm, isActive: parseInt(value) })}
                  >
                    <SelectTrigger data-testid="select-edit-product-status">
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
                  data-testid="button-update-product"
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
                <DialogTitle>Confirmar Exclusão</DialogTitle>
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
                  data-testid="button-confirm-delete-product"
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
                <DialogDescription>Adicione uma nova categoria de produtos</DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="category-name">Nome *</Label>
                  <Input
                    id="category-name"
                    value={categoryForm.name}
                    onChange={(e) => setCategoryForm({ ...categoryForm, name: e.target.value })}
                    placeholder="Ex: Ingredientes"
                    data-testid="input-category-name"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="category-description">Descrição</Label>
                  <Textarea
                    id="category-description"
                    value={categoryForm.description}
                    onChange={(e) => setCategoryForm({ ...categoryForm, description: e.target.value })}
                    placeholder="Descrição da categoria"
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
      </ScrollArea>
    </div>
  );
}
