import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Plus, Pencil, Trash2, Settings2, Filter, Upload, X, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { isUnauthorizedError } from "@/lib/authUtils";
import { formatKwanza } from "@/lib/formatters";
import type { Category, MenuItem } from "@shared/schema";
import { MenuItemOptionsDialog } from "@/components/MenuItemOptionsDialog";
import { exportToCSV } from "@/lib/csv-export";

interface MenuItemFormData {
  id?: string;
  name: string;
  description: string;
  price: string;
  categoryId: string;
  imageUrl: string;
  isAvailable: number;
  imageFile?: File | null;
}

export function MenuItemsTab() {
  const { toast } = useToast();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [deleteMenuItemId, setDeleteMenuItemId] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>("");

  const [menuItemForm, setMenuItemForm] = useState<MenuItemFormData>({
    name: "",
    description: "",
    price: "",
    categoryId: "",
    imageUrl: "",
    isAvailable: 1,
  });

  const { data: categories } = useQuery<Category[]>({
    queryKey: ["/api/categories"],
  });

  const { data: menuItems, isLoading: menuItemsLoading } = useQuery<(MenuItem & { category: Category })[]>({
    queryKey: ["/api/menu-items"],
  });

  const saveMenuItemMutation = useMutation({
    mutationFn: async (data: MenuItemFormData) => {
      const response = data.id
        ? await apiRequest("PATCH", `/api/menu-items/${data.id}`, {
            name: data.name,
            description: data.description,
            price: data.price,
            categoryId: data.categoryId,
            imageUrl: data.imageUrl || null,
            isAvailable: data.isAvailable,
          })
        : await apiRequest("POST", "/api/menu-items", {
            name: data.name,
            description: data.description,
            price: data.price,
            categoryId: data.categoryId,
            imageUrl: data.imageUrl || null,
            isAvailable: data.isAvailable,
          });

      if (data.imageFile) {
        const menuItemId = data.id || (response as any)?.id;
        if (menuItemId) {
          try {
            const formData = new FormData();
            formData.append('image', data.imageFile);

            const uploadResponse = await fetch(`/api/menu-items/${menuItemId}/image`, {
              method: 'POST',
              body: formData,
              credentials: 'include',
            });

            if (!uploadResponse.ok) {
              const error = await uploadResponse.json();
              throw new Error(error.message || 'Erro ao fazer upload da imagem');
            }

            await uploadResponse.json();
          } catch (error: any) {
            throw new Error(`Erro ao fazer upload da imagem: ${error.message}`);
          }
        }
      }

      return response;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["/api/menu-items"] });
      toast({
        title: variables.id ? "Prato atualizado" : "Prato criado",
        description: variables.id ? "O prato foi atualizado com sucesso." : "O prato foi criado com sucesso.",
      });
      handleCloseDialog();
    },
    onError: (error: any) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Não autorizado",
          description: "Você foi desconectado. Fazendo login novamente...",
          variant: "destructive",
        });
        setTimeout(() => window.location.href = "/login", 500);
        return;
      }
      toast({
        title: "Erro",
        description: error.message || "Não foi possível salvar o prato.",
        variant: "destructive",
      });
    },
  });

  const deleteMenuItemMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiRequest("DELETE", `/api/menu-items/${id}`, undefined);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/menu-items"] });
      toast({
        title: "Prato excluído",
        description: "O prato foi excluído com sucesso.",
      });
      setDeleteMenuItemId(null);
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Não autorizado",
          description: "Você foi desconectado. Fazendo login novamente...",
          variant: "destructive",
        });
        setTimeout(() => window.location.href = "/login", 500);
        return;
      }
      toast({
        title: "Erro",
        description: error.message || "Não foi possível excluir o prato.",
        variant: "destructive",
      });
    },
  });

  const handleImageFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "Arquivo muito grande",
        description: "A imagem deve ter no máximo 5MB.",
        variant: "destructive",
      });
      return;
    }

    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      toast({
        title: "Tipo de arquivo inválido",
        description: "Apenas imagens JPEG, PNG, GIF ou WEBP são permitidas.",
        variant: "destructive",
      });
      return;
    }

    setImageFile(file);
    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveImage = () => {
    setImageFile(null);
    setImagePreview("");
    setMenuItemForm({ ...menuItemForm, imageUrl: "" });
  };

  const handleExportCSV = () => {
    if (!filteredMenuItems || filteredMenuItems.length === 0) {
      toast({
        title: "Nenhum dado para exportar",
        description: "Não há produtos para exportar.",
        variant: "destructive",
      });
      return;
    }

    const csvData = filteredMenuItems.map(item => ({
      'Nome': item.name,
      'Categoria': item.category.name,
      'Preço': `Kz ${parseFloat(item.price).toFixed(2).replace('.', ',')}`,
      'Preço Original': item.originalPrice ? `Kz ${parseFloat(item.originalPrice).toFixed(2).replace('.', ',')}` : '-',
      'Descrição': item.description || '-',
      'Disponível': item.isAvailable === 1 ? 'Sim' : 'Não',
      'Tempo de Preparo': item.preparationTime ? `${item.preparationTime} min` : '-',
      'Tags': item.tags?.join(', ') || '-',
    }));

    const today = new Date();
    const dateStr = `${String(today.getDate()).padStart(2, '0')}-${String(today.getMonth() + 1).padStart(2, '0')}-${today.getFullYear()}`;

    exportToCSV({
      filename: 'produtos',
      data: csvData,
      filenameSuffix: dateStr,
    });

    toast({
      title: "Exportação concluída",
      description: `${csvData.length} produto(s) exportado(s) com sucesso.`,
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!menuItemForm.name.trim() || !menuItemForm.price || !menuItemForm.categoryId) {
      toast({
        title: "Dados incompletos",
        description: "Por favor, preencha todos os campos obrigatórios.",
        variant: "destructive",
      });
      return;
    }
    saveMenuItemMutation.mutate({
      ...menuItemForm,
      imageFile: imageFile,
    });
  };

  const handleEditMenuItem = (item: MenuItem & { category: Category }) => {
    setMenuItemForm({
      id: item.id,
      name: item.name,
      description: item.description || "",
      price: item.price,
      categoryId: item.categoryId,
      imageUrl: item.imageUrl || "",
      isAvailable: item.isAvailable,
    });
    setImageFile(null);
    setImagePreview(item.imageUrl || "");
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    if (saveMenuItemMutation.isPending) {
      toast({
        title: "Operação em andamento",
        description: "Aguarde a conclusão do salvamento antes de fechar.",
        variant: "destructive",
      });
      return;
    }
    
    setIsDialogOpen(false);
    setMenuItemForm({
      name: "",
      description: "",
      price: "",
      categoryId: "",
      imageUrl: "",
      isAvailable: 1,
    });
    setImageFile(null);
    setImagePreview("");
  };

  const handleDialogOpenChange = (open: boolean) => {
    if (!open) {
      if (saveMenuItemMutation.isPending) {
        return;
      }
      handleCloseDialog();
    } else {
      setIsDialogOpen(true);
    }
  };

  const handleOpenNewDialog = () => {
    setMenuItemForm({
      name: "",
      description: "",
      price: "",
      categoryId: "",
      imageUrl: "",
      isAvailable: 1,
    });
    setImageFile(null);
    setImagePreview("");
    setIsDialogOpen(true);
  };

  const filteredMenuItems = menuItems?.filter((item) => {
    const matchesCategory = selectedCategory === "all" || item.categoryId === selectedCategory;
    const matchesSearch = searchQuery === "" || 
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.description?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  }) || [];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-semibold text-foreground">Itens do Menu</h2>
          <p className="text-sm text-muted-foreground mt-1">
            Gerencie todos os pratos do restaurante
          </p>
        </div>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            onClick={handleExportCSV} 
            data-testid="button-export-csv"
            disabled={!filteredMenuItems || filteredMenuItems.length === 0 || saveMenuItemMutation.isPending}
          >
            <Download className="h-4 w-4 mr-2" />
            Exportar CSV
          </Button>
          <Button onClick={handleOpenNewDialog} data-testid="button-create-menu-item">
            <Plus className="h-4 w-4 mr-2" />
            Novo Prato
          </Button>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <Input
            placeholder="Buscar pratos..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            data-testid="input-search-menu-items"
          />
        </div>
        <Select value={selectedCategory} onValueChange={setSelectedCategory}>
          <SelectTrigger className="w-full sm:w-[200px]" data-testid="select-filter-category">
            <Filter className="h-4 w-4 mr-2" />
            <SelectValue placeholder="Todas categorias" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas as categorias</SelectItem>
            {categories?.map((cat) => (
              <SelectItem key={cat.id} value={cat.id}>
                {cat.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {menuItemsLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <Skeleton key={i} className="h-64" />
          ))}
        </div>
      ) : filteredMenuItems.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredMenuItems.map((item) => (
            <Card key={item.id} data-testid={`card-menu-item-${item.id}`} className="overflow-hidden">
              {item.imageUrl && (
                <div className="aspect-video w-full overflow-hidden bg-muted">
                  <img
                    src={item.imageUrl}
                    alt={item.name}
                    className="h-full w-full object-cover"
                  />
                </div>
              )}
              <CardHeader className="flex flex-row items-start justify-between gap-2 pb-3">
                <div className="flex-1">
                  <CardTitle className="text-lg line-clamp-1">{item.name}</CardTitle>
                  <div className="flex gap-2 mt-2">
                    <Badge variant="secondary">
                      {item.category.name}
                    </Badge>
                    {item.isAvailable === 0 && (
                      <Badge variant="destructive">
                        Indisponível
                      </Badge>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {item.description && (
                  <p className="text-sm text-muted-foreground line-clamp-3">
                    {item.description}
                  </p>
                )}
                <div className="flex items-center justify-between">
                  <p className="text-2xl font-bold font-mono">
                    {formatKwanza(item.price)}
                  </p>
                </div>
                <div className="flex flex-col gap-2">
                  <Button
                    variant={item.isAvailable === 1 ? "default" : "outline"}
                    size="sm"
                    onClick={async () => {
                      try {
                        await apiRequest("PATCH", `/api/menu-items/${item.id}`, {
                          isAvailable: item.isAvailable === 1 ? 0 : 1,
                        });
                        queryClient.invalidateQueries({ queryKey: ['/api/menu-items'] });
                        toast({
                          title: item.isAvailable === 1 ? "Item marcado como indisponível" : "Item marcado como disponível",
                        });
                      } catch (error) {
                        toast({
                          title: "Erro ao atualizar disponibilidade",
                          variant: "destructive",
                        });
                      }
                    }}
                    data-testid={`button-toggle-availability-${item.id}`}
                  >
                    {item.isAvailable === 1 ? "✓ Disponível" : "✗ Indisponível"}
                  </Button>
                  <MenuItemOptionsDialog menuItemId={item.id} menuItemName={item.name} />
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1"
                      onClick={() => handleEditMenuItem(item)}
                      data-testid={`button-edit-menu-item-${item.id}`}
                    >
                      <Pencil className="h-4 w-4 mr-2" />
                      Editar
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setDeleteMenuItemId(item.id)}
                      data-testid={`button-delete-menu-item-${item.id}`}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            <p>Nenhum prato encontrado</p>
            <p className="text-sm mt-1">
              {searchQuery || selectedCategory !== "all" 
                ? "Tente ajustar os filtros de busca" 
                : "Crie seu primeiro prato para começar"}
            </p>
          </CardContent>
        </Card>
      )}

      <Dialog open={isDialogOpen} onOpenChange={handleDialogOpenChange}>
        <DialogContent className="sm:max-w-[500px]">
          <form onSubmit={handleSubmit}>
            <DialogHeader>
              <DialogTitle>
                {menuItemForm.id ? "Editar Prato" : "Criar Novo Prato"}
              </DialogTitle>
              <DialogDescription>
                {menuItemForm.id 
                  ? "Atualize as informações do prato"
                  : "Adicione um novo prato ao menu"}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div>
                <Label htmlFor="name">Nome do Prato *</Label>
                <Input
                  id="name"
                  placeholder="Ex: Feijoada"
                  value={menuItemForm.name}
                  onChange={(e) => setMenuItemForm({ ...menuItemForm, name: e.target.value })}
                  data-testid="input-menu-item-name"
                  className="mt-2"
                />
              </div>

              <div>
                <Label htmlFor="category">Categoria *</Label>
                <Select
                  value={menuItemForm.categoryId}
                  onValueChange={(value) => setMenuItemForm({ ...menuItemForm, categoryId: value })}
                >
                  <SelectTrigger className="mt-2" data-testid="select-category">
                    <SelectValue placeholder="Selecione uma categoria" />
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

              <div>
                <Label htmlFor="price">Preço *</Label>
                <Input
                  id="price"
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="0.00"
                  value={menuItemForm.price}
                  onChange={(e) => setMenuItemForm({ ...menuItemForm, price: e.target.value })}
                  data-testid="input-menu-item-price"
                  className="mt-2"
                />
              </div>

              <div>
                <Label>Imagem do Prato</Label>
                
                {(imagePreview || menuItemForm.imageUrl) && (
                  <div className="mt-2 relative">
                    <img 
                      src={imagePreview || menuItemForm.imageUrl} 
                      alt="Preview" 
                      className="w-full h-48 object-cover rounded-md border"
                    />
                    <Button
                      type="button"
                      variant="destructive"
                      size="icon"
                      className="absolute top-2 right-2"
                      onClick={handleRemoveImage}
                      data-testid="button-remove-image"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                )}

                <div className="mt-2 space-y-2">
                  <div className="flex items-center gap-2">
                    <Input
                      id="image-file"
                      type="file"
                      accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
                      onChange={handleImageFileChange}
                      className="hidden"
                      data-testid="input-image-file"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => document.getElementById('image-file')?.click()}
                      className="flex-1"
                      data-testid="button-upload-image"
                    >
                      <Upload className="h-4 w-4 mr-2" />
                      {imageFile ? imageFile.name : "Escolher arquivo"}
                    </Button>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <div className="flex-1 border-t border-muted"></div>
                    <span className="text-xs text-muted-foreground">ou</span>
                    <div className="flex-1 border-t border-muted"></div>
                  </div>

                  <Input
                    id="imageUrl"
                    type="url"
                    placeholder="https://exemplo.com/imagem.jpg"
                    value={menuItemForm.imageUrl}
                    onChange={(e) => {
                      setMenuItemForm({ ...menuItemForm, imageUrl: e.target.value });
                      if (e.target.value) {
                        setImagePreview(e.target.value);
                        setImageFile(null);
                      }
                    }}
                    data-testid="input-menu-item-image-url"
                  />
                </div>
                
                <p className="text-xs text-muted-foreground mt-2">
                  Faça upload de uma imagem (máx 5MB) ou cole uma URL
                </p>
              </div>

              <div>
                <Label htmlFor="description">Descrição</Label>
                <Textarea
                  id="description"
                  placeholder="Descreva o prato..."
                  value={menuItemForm.description}
                  onChange={(e) => setMenuItemForm({ ...menuItemForm, description: e.target.value })}
                  data-testid="input-menu-item-description"
                  className="mt-2 resize-none"
                  rows={3}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label htmlFor="isAvailable">Disponibilidade</Label>
                  <p className="text-xs text-muted-foreground">
                    O prato está disponível para pedidos?
                  </p>
                </div>
                <Button
                  type="button"
                  variant={menuItemForm.isAvailable === 1 ? "default" : "outline"}
                  onClick={() => setMenuItemForm({ ...menuItemForm, isAvailable: menuItemForm.isAvailable === 1 ? 0 : 1 })}
                  data-testid="button-toggle-availability"
                >
                  {menuItemForm.isAvailable === 1 ? "Disponível" : "Indisponível"}
                </Button>
              </div>
            </div>
            <DialogFooter>
              <Button
                type="submit"
                disabled={saveMenuItemMutation.isPending}
                data-testid="button-submit-menu-item"
              >
                {saveMenuItemMutation.isPending
                  ? "Salvando..."
                  : menuItemForm.id
                  ? "Atualizar"
                  : "Criar"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!deleteMenuItemId} onOpenChange={() => setDeleteMenuItemId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar Exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir este prato? Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel data-testid="button-cancel-delete">Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteMenuItemId && deleteMenuItemMutation.mutate(deleteMenuItemId)}
              data-testid="button-confirm-delete"
              className="bg-destructive hover:bg-destructive/90"
            >
              {deleteMenuItemMutation.isPending ? "Excluindo..." : "Excluir"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
