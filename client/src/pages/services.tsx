import { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { apiFetch } from "@/lib/api-url";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
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
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import {
  Plus,
  Edit,
  Trash2,
  Search,
  DollarSign,
  Percent,
  Tag,
  CheckCircle2,
  XCircle,
  TrendingUp,
  Filter,
  ArrowUpDown,
} from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { FeatureGuard } from "@/components/FeatureGuard";

type Service = {
  id: string;
  restaurantId: string;
  branchId: string | null;
  name: string;
  description: string | null;
  chargeType: 'valor' | 'percentual';
  value: string;
  applyAutomatically: number;
  context: 'todos' | 'mesa' | 'delivery' | 'takeout' | 'balcao' | 'pdv';
  minOrderValue: string | null;
  active: number;
  displayOrder: number;
  createdBy: string | null;
  createdAt: string;
  updatedAt: string;
};

type InsertService = {
  name: string;
  description?: string | null;
  chargeType: 'valor' | 'percentual';
  value: string;
  applyAutomatically: number;
  context: 'todos' | 'mesa' | 'delivery' | 'takeout' | 'balcao' | 'pdv';
  minOrderValue?: string | null;
  active: number;
  displayOrder: number;
};

const contextLabels: Record<string, string> = {
  todos: 'Todos',
  mesa: 'Mesa',
  delivery: 'Delivery',
  takeout: 'Takeout',
  balcao: 'Balcão',
  pdv: 'PDV',
};

export default function Services() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingService, setEditingService] = useState<Service | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterContext, setFilterContext] = useState<string>("all");
  const [filterActive, setFilterActive] = useState<string>("all");

  // Form state
  const [formData, setFormData] = useState<InsertService>({
    name: "",
    description: "",
    chargeType: "percentual",
    value: "",
    applyAutomatically: 0,
    context: "todos",
    minOrderValue: "",
    active: 1,
    displayOrder: 0,
  });

  // Fetch services
  const { data: services = [], isLoading } = useQuery<Service[]>({
    queryKey: ["/api/services"],
  });

  // Create service mutation
  const createServiceMutation = useMutation({
    mutationFn: async (data: InsertService) => {
      const response = await apiFetch("/api/services", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
        credentials: "include",
      });
      if (!response.ok) {
        const error = await response.text();
        throw new Error(error || "Erro ao criar serviço");
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/services"] });
      toast({
        title: "Serviço criado",
        description: "O serviço foi criado com sucesso.",
      });
      resetForm();
      setIsDialogOpen(false);
    },
    onError: (error: Error) => {
      toast({
        title: "Erro ao criar serviço",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Update service mutation
  const updateServiceMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<InsertService> }) => {
      const response = await apiFetch(`/api/services/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
        credentials: "include",
      });
      if (!response.ok) {
        const error = await response.text();
        throw new Error(error || "Erro ao atualizar serviço");
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/services"] });
      toast({
        title: "Serviço atualizado",
        description: "O serviço foi atualizado com sucesso.",
      });
      resetForm();
      setIsDialogOpen(false);
    },
    onError: (error: Error) => {
      toast({
        title: "Erro ao atualizar serviço",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Delete service mutation
  const deleteServiceMutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await apiFetch(`/api/services/${id}`, {
        method: "DELETE",
        credentials: "include",
      });
      if (!response.ok) {
        const error = await response.text();
        throw new Error(error || "Erro ao excluir serviço");
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/services"] });
      toast({
        title: "Serviço excluído",
        description: "O serviço foi excluído com sucesso.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Erro ao excluir serviço",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const resetForm = () => {
    setFormData({
      name: "",
      description: "",
      chargeType: "percentual",
      value: "",
      applyAutomatically: 0,
      context: "todos",
      minOrderValue: "",
      active: 1,
      displayOrder: 0,
    });
    setEditingService(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    if (!formData.name.trim()) {
      toast({
        title: "Erro de validação",
        description: "O nome do serviço é obrigatório.",
        variant: "destructive",
      });
      return;
    }

    if (!formData.value || parseFloat(formData.value) <= 0) {
      toast({
        title: "Erro de validação",
        description: "O valor deve ser maior que zero.",
        variant: "destructive",
      });
      return;
    }

    if (formData.chargeType === 'percentual' && parseFloat(formData.value) > 100) {
      toast({
        title: "Erro de validação",
        description: "O percentual não pode ser maior que 100%.",
        variant: "destructive",
      });
      return;
    }

    if (editingService) {
      updateServiceMutation.mutate({
        id: editingService.id,
        data: formData,
      });
    } else {
      createServiceMutation.mutate(formData);
    }
  };

  const handleEdit = (service: Service) => {
    setEditingService(service);
    setFormData({
      name: service.name,
      description: service.description,
      chargeType: service.chargeType,
      value: service.value,
      applyAutomatically: service.applyAutomatically,
      context: service.context,
      minOrderValue: service.minOrderValue,
      active: service.active,
      displayOrder: service.displayOrder,
    });
    setIsDialogOpen(true);
  };

  const handleDelete = (id: string) => {
    if (confirm("Tem certeza que deseja excluir este serviço?")) {
      deleteServiceMutation.mutate(id);
    }
  };

  const handleToggleActive = (service: Service) => {
    updateServiceMutation.mutate({
      id: service.id,
      data: { active: service.active === 1 ? 0 : 1 },
    });
  };

  // Filtered and sorted services
  const filteredServices = useMemo(() => {
    return services.filter((service) => {
      const matchesSearch = service.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (service.description?.toLowerCase() || "").includes(searchTerm.toLowerCase());
      const matchesContext = filterContext === "all" || service.context === filterContext;
      const matchesActive = filterActive === "all" || 
        (filterActive === "active" && service.active === 1) ||
        (filterActive === "inactive" && service.active === 0);

      return matchesSearch && matchesContext && matchesActive;
    }).sort((a, b) => a.displayOrder - b.displayOrder);
  }, [services, searchTerm, filterContext, filterActive]);

  const formatValue = (service: Service) => {
    if (service.chargeType === 'percentual') {
      return `${service.value}%`;
    }
    return `${parseFloat(service.value).toLocaleString('pt-AO', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} Kz`;
  };

  return (
    <FeatureGuard feature="services">
      <div className="container mx-auto p-4 md:p-6 max-w-7xl space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
              <Tag className="h-8 w-8 text-primary" />
              Serviços e Taxas
            </h1>
            <p className="text-muted-foreground mt-1">
              Configure serviços e taxas que podem ser aplicados aos pedidos
            </p>
          </div>

          <Dialog open={isDialogOpen} onOpenChange={(open) => {
            setIsDialogOpen(open);
            if (!open) resetForm();
          }}>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <Plus className="h-4 w-4" />
                Novo Serviço
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>
                  {editingService ? "Editar Serviço" : "Novo Serviço"}
                </DialogTitle>
                <DialogDescription>
                  {editingService
                    ? "Atualize as informações do serviço"
                    : "Configure um novo serviço ou taxa"}
                </DialogDescription>
              </DialogHeader>

              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Name */}
                <div className="space-y-2">
                  <Label htmlFor="name">Nome do Serviço *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Ex: Taxa de Garçom, Couvert Artístico"
                    required
                  />
                </div>

                {/* Description */}
                <div className="space-y-2">
                  <Label htmlFor="description">Descrição</Label>
                  <Textarea
                    id="description"
                    value={formData.description || ""}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Descrição opcional do serviço"
                    rows={3}
                  />
                </div>

                {/* Charge Type and Value */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="chargeType">Tipo de Cobrança *</Label>
                    <Select
                      value={formData.chargeType}
                      onValueChange={(value: 'valor' | 'percentual') =>
                        setFormData({ ...formData, chargeType: value })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="valor">
                          <div className="flex items-center gap-2">
                            <DollarSign className="h-4 w-4" />
                            Valor Fixo (Kz)
                          </div>
                        </SelectItem>
                        <SelectItem value="percentual">
                          <div className="flex items-center gap-2">
                            <Percent className="h-4 w-4" />
                            Percentual (%)
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="value">
                      Valor * {formData.chargeType === 'percentual' ? '(%)' : '(Kz)'}
                    </Label>
                    <Input
                      id="value"
                      type="number"
                      step="0.01"
                      min="0"
                      max={formData.chargeType === 'percentual' ? 100 : undefined}
                      value={formData.value}
                      onChange={(e) => setFormData({ ...formData, value: e.target.value })}
                      placeholder={formData.chargeType === 'percentual' ? "10" : "500"}
                      required
                    />
                  </div>
                </div>

                {/* Context */}
                <div className="space-y-2">
                  <Label htmlFor="context">Aplicar em *</Label>
                  <Select
                    value={formData.context}
                    onValueChange={(value: any) => setFormData({ ...formData, context: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(contextLabels).map(([value, label]) => (
                        <SelectItem key={value} value={value}>
                          {label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Min Order Value */}
                <div className="space-y-2">
                  <Label htmlFor="minOrderValue">Valor Mínimo do Pedido (Kz)</Label>
                  <Input
                    id="minOrderValue"
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.minOrderValue || ""}
                    onChange={(e) => setFormData({ ...formData, minOrderValue: e.target.value })}
                    placeholder="Deixe vazio para aplicar sempre"
                  />
                  <p className="text-xs text-muted-foreground">
                    Aplicar apenas em pedidos acima deste valor
                  </p>
                </div>

                {/* Apply Automatically */}
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="applyAutomatically"
                    checked={formData.applyAutomatically === 1}
                    onCheckedChange={(checked) =>
                      setFormData({ ...formData, applyAutomatically: checked ? 1 : 0 })
                    }
                  />
                  <Label htmlFor="applyAutomatically" className="cursor-pointer">
                    Aplicar automaticamente nos pedidos
                  </Label>
                </div>

                {/* Display Order */}
                <div className="space-y-2">
                  <Label htmlFor="displayOrder">Ordem de Exibição</Label>
                  <Input
                    id="displayOrder"
                    type="number"
                    min="0"
                    value={formData.displayOrder}
                    onChange={(e) => setFormData({ ...formData, displayOrder: parseInt(e.target.value) || 0 })}
                  />
                  <p className="text-xs text-muted-foreground">
                    Define a ordem em que o serviço aparece na lista
                  </p>
                </div>

                <Separator />

                <div className="flex justify-end gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setIsDialogOpen(false);
                      resetForm();
                    }}
                  >
                    Cancelar
                  </Button>
                  <Button
                    type="submit"
                    disabled={createServiceMutation.isPending || updateServiceMutation.isPending}
                  >
                    {editingService ? "Atualizar" : "Criar"} Serviço
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Filters */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Filter className="h-5 w-5" />
              Filtros
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Search */}
              <div className="space-y-2">
                <Label htmlFor="search">Buscar</Label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="search"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Nome ou descrição..."
                    className="pl-9"
                  />
                </div>
              </div>

              {/* Context Filter */}
              <div className="space-y-2">
                <Label htmlFor="filterContext">Contexto</Label>
                <Select value={filterContext} onValueChange={setFilterContext}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos os Contextos</SelectItem>
                    {Object.entries(contextLabels).map(([value, label]) => (
                      <SelectItem key={value} value={value}>
                        {label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Active Filter */}
              <div className="space-y-2">
                <Label htmlFor="filterActive">Status</Label>
                <Select value={filterActive} onValueChange={setFilterActive}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos</SelectItem>
                    <SelectItem value="active">Ativos</SelectItem>
                    <SelectItem value="inactive">Inativos</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Services Table */}
        <Card>
          <CardHeader>
            <CardTitle>Serviços Cadastrados</CardTitle>
            <CardDescription>
              {filteredServices.length} {filteredServices.length === 1 ? 'serviço encontrado' : 'serviços encontrados'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
            ) : filteredServices.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Tag className="h-12 w-12 mx-auto mb-2 opacity-50" />
                <p>Nenhum serviço encontrado</p>
                <p className="text-sm">Crie seu primeiro serviço para começar</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Ordem</TableHead>
                      <TableHead>Nome</TableHead>
                      <TableHead>Tipo</TableHead>
                      <TableHead>Valor</TableHead>
                      <TableHead>Contexto</TableHead>
                      <TableHead>Auto</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredServices.map((service) => (
                      <TableRow key={service.id}>
                        <TableCell className="font-mono text-sm">
                          {service.displayOrder}
                        </TableCell>
                        <TableCell>
                          <div>
                            <div className="font-medium">{service.name}</div>
                            {service.description && (
                              <div className="text-sm text-muted-foreground line-clamp-1">
                                {service.description}
                              </div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className="gap-1">
                            {service.chargeType === 'percentual' ? (
                              <>
                                <Percent className="h-3 w-3" />
                                Percentual
                              </>
                            ) : (
                              <>
                                <DollarSign className="h-3 w-3" />
                                Fixo
                              </>
                            )}
                          </Badge>
                        </TableCell>
                        <TableCell className="font-mono font-medium">
                          {formatValue(service)}
                        </TableCell>
                        <TableCell>
                          <Badge variant="secondary">
                            {contextLabels[service.context]}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {service.applyAutomatically === 1 ? (
                            <CheckCircle2 className="h-4 w-4 text-green-500" />
                          ) : (
                            <XCircle className="h-4 w-4 text-muted-foreground" />
                          )}
                        </TableCell>
                        <TableCell>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleToggleActive(service)}
                            className="gap-1"
                          >
                            {service.active === 1 ? (
                              <>
                                <CheckCircle2 className="h-4 w-4 text-green-500" />
                                <span className="text-green-600">Ativo</span>
                              </>
                            ) : (
                              <>
                                <XCircle className="h-4 w-4 text-red-500" />
                                <span className="text-red-600">Inativo</span>
                              </>
                            )}
                          </Button>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleEdit(service)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDelete(service.id)}
                              className="text-red-600 hover:text-red-700 hover:bg-red-50"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total de Serviços
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{services.length}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Serviços Ativos
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-600">
                {services.filter(s => s.active === 1).length}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Aplicação Automática
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-blue-600">
                {services.filter(s => s.applyAutomatically === 1).length}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </FeatureGuard>
  );
}
