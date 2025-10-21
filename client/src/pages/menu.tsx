import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Plus, Pencil, Trash2, FolderPlus, UtensilsCrossed, ExternalLink } from "lucide-react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { isUnauthorizedError } from "@/lib/authUtils";
import { formatKwanza } from "@/lib/formatters";
import type { Category, MenuItem } from "@shared/schema";

interface MenuItemFormData {
  id?: string;
  name: string;
  description: string;
  price: string;
  categoryId: string;
}

export default function Menu() {
  const { toast } = useToast();
  const [isCategoryDialogOpen, setIsCategoryDialogOpen] = useState(false);
  const [isMenuItemDialogOpen, setIsMenuItemDialogOpen] = useState(false);
  const [categoryName, setCategoryName] = useState("");
  const [deleteCategoryId, setDeleteCategoryId] = useState<string | null>(null);
  const [deleteMenuItemId, setDeleteMenuItemId] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [editingMenuItem, setEditingMenuItem] = useState<MenuItemFormData | null>(null);

  const [menuItemForm, setMenuItemForm] = useState<MenuItemFormData>({
    name: "",
    description: "",
    price: "",
    categoryId: "",
  });

  const { data: categories, isLoading: categoriesLoading } = useQuery<Category[]>({
    queryKey: ["/api/categories"],
  });

  const { data: menuItems, isLoading: menuItemsLoading } = useQuery<(MenuItem & { category: Category })[]>({
    queryKey: ["/api/menu-items"],
  });

  const createCategoryMutation = useMutation({
    mutationFn: async (name: string) => {
      await apiRequest("POST", "/api/categories", { name });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/categories"] });
      toast({
        title: "Categoria criada",
        description: "A categoria foi criada com sucesso.",
      });
      setIsCategoryDialogOpen(false);
      setCategoryName("");
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Não autorizado",
          description: "Você foi desconectado. Fazendo login novamente...",
          variant: "destructive",
        });
        setTimeout(() => window.location.href = "/api/login", 500);
        return;
      }
      toast({
        title: "Erro",
        description: error.message || "Não foi possível criar a categoria.",
        variant: "destructive",
      });
    },
  });

  const deleteCategoryMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiRequest("DELETE", `/api/categories/${id}`, undefined);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/categories"] });
      queryClient.invalidateQueries({ queryKey: ["/api/menu-items"] });
      toast({
        title: "Categoria excluída",
        description: "A categoria foi excluída com sucesso.",
      });
      setDeleteCategoryId(null);
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Não autorizado",
          description: "Você foi desconectado. Fazendo login novamente...",
          variant: "destructive",
        });
        setTimeout(() => window.location.href = "/api/login", 500);
        return;
      }
      toast({
        title: "Erro",
        description: error.message || "Não foi possível excluir a categoria.",
        variant: "destructive",
      });
    },
  });

  const saveMenuItemMutation = useMutation({
    mutationFn: async (data: MenuItemFormData) => {
      if (data.id) {
        await apiRequest("PATCH", `/api/menu-items/${data.id}`, {
          name: data.name,
          description: data.description,
          price: data.price,
          categoryId: data.categoryId,
        });
      } else {
        await apiRequest("POST", "/api/menu-items", {
          name: data.name,
          description: data.description,
          price: data.price,
          categoryId: data.categoryId,
        });
      }
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["/api/menu-items"] });
      toast({
        title: variables.id ? "Prato atualizado" : "Prato criado",
        description: variables.id ? "O prato foi atualizado com sucesso." : "O prato foi criado com sucesso.",
      });
      setIsMenuItemDialogOpen(false);
      setEditingMenuItem(null);
      setMenuItemForm({
        name: "",
        description: "",
        price: "",
        categoryId: "",
      });
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Não autorizado",
          description: "Você foi desconectado. Fazendo login novamente...",
          variant: "destructive",
        });
        setTimeout(() => window.location.href = "/api/login", 500);
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
        setTimeout(() => window.location.href = "/api/login", 500);
        return;
      }
      toast({
        title: "Erro",
        description: error.message || "Não foi possível excluir o prato.",
        variant: "destructive",
      });
    },
  });

  const handleCreateCategory = (e: React.FormEvent) => {
    e.preventDefault();
    if (!categoryName.trim()) {
      toast({
        title: "Nome inválido",
        description: "Por favor, insira um nome para a categoria.",
        variant: "destructive",
      });
      return;
    }
    createCategoryMutation.mutate(categoryName);
  };

  const handleSaveMenuItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!menuItemForm.name.trim() || !menuItemForm.price || !menuItemForm.categoryId) {
      toast({
        title: "Dados incompletos",
        description: "Por favor, preencha todos os campos obrigatórios.",
        variant: "destructive",
      });
      return;
    }
    saveMenuItemMutation.mutate(menuItemForm);
  };

  const handleEditMenuItem = (item: MenuItem & { category: Category }) => {
    setMenuItemForm({
      id: item.id,
      name: item.name,
      description: item.description || "",
      price: item.price,
      categoryId: item.categoryId,
    });
    setEditingMenuItem({
      id: item.id,
      name: item.name,
      description: item.description || "",
      price: item.price,
      categoryId: item.categoryId,
    });
    setIsMenuItemDialogOpen(true);
  };

  const handleCloseMenuItemDialog = () => {
    setIsMenuItemDialogOpen(false);
    setEditingMenuItem(null);
    setMenuItemForm({
      name: "",
      description: "",
      price: "",
      categoryId: "",
    });
  };

  const filteredMenuItems = menuItems?.filter(
    item => selectedCategory === "all" || item.categoryId === selectedCategory
  ) || [];

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold text-foreground">Menu</h1>
          <p className="text-muted-foreground mt-2">
            Gerencie categorias e pratos do restaurante
          </p>
        </div>
        <div className="flex gap-2">
          <Link href="/mesa/1">
            <Button variant="outline" data-testid="button-view-menu">
              <ExternalLink className="h-4 w-4 mr-2" />
              Visualizar Menu
            </Button>
          </Link>
          <Dialog open={isCategoryDialogOpen} onOpenChange={setIsCategoryDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" data-testid="button-create-category">
                <FolderPlus className="h-4 w-4 mr-2" />
                Nova Categoria
              </Button>
            </DialogTrigger>
            <DialogContent>
              <form onSubmit={handleCreateCategory}>
                <DialogHeader>
                  <DialogTitle>Criar Categoria</DialogTitle>
                  <DialogDescription>
                    Adicione uma nova categoria para organizar o menu
                  </DialogDescription>
                </DialogHeader>
                <div className="py-4">
                  <Label htmlFor="categoryName">Nome da Categoria</Label>
                  <Input
                    id="categoryName"
                    placeholder="Ex: Entradas"
                    value={categoryName}
                    onChange={(e) => setCategoryName(e.target.value)}
                    data-testid="input-category-name"
                    className="mt-2"
                  />
                </div>
                <DialogFooter>
                  <Button
                    type="submit"
                    disabled={createCategoryMutation.isPending}
                    data-testid="button-submit-category"
                  >
                    {createCategoryMutation.isPending ? "Criando..." : "Criar"}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>

          <Button 
            onClick={() => {
              setEditingMenuItem(null);
              setMenuItemForm({
                name: "",
                description: "",
                price: "",
                categoryId: "",
              });
              setIsMenuItemDialogOpen(true);
            }}
            data-testid="button-create-menu-item"
          >
            <Plus className="h-4 w-4 mr-2" />
            Novo Prato
          </Button>

          <Dialog open={isMenuItemDialogOpen} onOpenChange={handleCloseMenuItemDialog}>
            <DialogContent className="sm:max-w-[500px]">
              <form onSubmit={handleSaveMenuItem}>
                <DialogHeader>
                  <DialogTitle>
                    {editingMenuItem ? "Editar Prato" : "Criar Novo Prato"}
                  </DialogTitle>
                  <DialogDescription>
                    {editingMenuItem 
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
                </div>
                <DialogFooter>
                  <Button
                    type="submit"
                    disabled={saveMenuItemMutation.isPending}
                    data-testid="button-submit-menu-item"
                  >
                    {saveMenuItemMutation.isPending
                      ? "Salvando..."
                      : editingMenuItem
                      ? "Atualizar"
                      : "Criar"}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <Tabs value={selectedCategory} onValueChange={setSelectedCategory}>
        <TabsList>
          <TabsTrigger value="all" data-testid="tab-all-categories">
            Todos
          </TabsTrigger>
          {categories?.map((cat) => (
            <TabsTrigger key={cat.id} value={cat.id} data-testid={`tab-category-${cat.id}`}>
              {cat.name}
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value={selectedCategory} className="mt-6">
          {menuItemsLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <Skeleton key={i} className="h-64" />
              ))}
            </div>
          ) : filteredMenuItems.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredMenuItems.map((item) => (
                <Card key={item.id} data-testid={`card-menu-item-${item.id}`}>
                  <CardHeader className="flex flex-row items-start justify-between gap-2 pb-3">
                    <div className="flex-1">
                      <CardTitle className="text-lg line-clamp-1">{item.name}</CardTitle>
                      <Badge variant="secondary" className="mt-2">
                        {item.category.name}
                      </Badge>
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
                        variant="destructive"
                        size="sm"
                        className="flex-1"
                        onClick={() => setDeleteMenuItemId(item.id)}
                        data-testid={`button-delete-menu-item-${item.id}`}
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Excluir
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-16">
                <UtensilsCrossed className="h-16 w-16 text-muted-foreground mb-4" />
                <p className="text-xl font-semibold text-foreground mb-2">
                  Nenhum prato cadastrado
                </p>
                <p className="text-muted-foreground mb-6">
                  {selectedCategory === "all"
                    ? "Adicione pratos ao menu para começar"
                    : "Nenhum prato nesta categoria"}
                </p>
                <Button onClick={() => {
                  setEditingMenuItem(null);
                  setMenuItemForm({
                    name: "",
                    description: "",
                    price: "",
                    categoryId: "",
                  });
                  setIsMenuItemDialogOpen(true);
                }} data-testid="button-create-first-menu-item">
                  <Plus className="h-4 w-4 mr-2" />
                  Criar Primeiro Prato
                </Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>

      {/* Categories Management Section */}
      {categoriesLoading ? (
        <Skeleton className="h-32" />
      ) : categories && categories.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Categorias</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {categories.map((cat) => (
                <div
                  key={cat.id}
                  className="flex items-center gap-2 px-3 py-2 bg-muted rounded-md"
                  data-testid={`category-${cat.id}`}
                >
                  <span className="text-sm font-medium">{cat.name}</span>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-5 w-5"
                    onClick={() => setDeleteCategoryId(cat.id)}
                    data-testid={`button-delete-category-${cat.id}`}
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Delete Category Confirmation */}
      <AlertDialog open={!!deleteCategoryId} onOpenChange={() => setDeleteCategoryId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir esta categoria? Todos os pratos desta categoria também serão excluídos.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteCategoryId && deleteCategoryMutation.mutate(deleteCategoryId)}
              disabled={deleteCategoryMutation.isPending}
            >
              {deleteCategoryMutation.isPending ? "Excluindo..." : "Excluir"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Delete Menu Item Confirmation */}
      <AlertDialog open={!!deleteMenuItemId} onOpenChange={() => setDeleteMenuItemId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir este prato? Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteMenuItemId && deleteMenuItemMutation.mutate(deleteMenuItemId)}
              disabled={deleteMenuItemMutation.isPending}
            >
              {deleteMenuItemMutation.isPending ? "Excluindo..." : "Excluir"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
