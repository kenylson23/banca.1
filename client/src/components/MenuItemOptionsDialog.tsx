import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Plus, Pencil, Trash2, Settings2, GripVertical } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { formatKwanza } from "@/lib/formatters";
import { Switch } from "@/components/ui/switch";
import type { OptionGroup, Option } from "@shared/schema";

interface MenuItemOptionsDialogProps {
  menuItemId: string;
  menuItemName: string;
}

interface OptionGroupFormData {
  id?: string;
  name: string;
  type: "single" | "multiple";
  isRequired: number;
  minSelections: number;
  maxSelections: number;
  displayOrder: number;
}

interface OptionFormData {
  id?: string;
  name: string;
  priceAdjustment: string;
  isAvailable: number;
  isRecommended: number;
  displayOrder: number;
}

export function MenuItemOptionsDialog({ menuItemId, menuItemName }: MenuItemOptionsDialogProps) {
  const { toast } = useToast();
  const [isOpen, setIsOpen] = useState(false);
  const [isGroupDialogOpen, setIsGroupDialogOpen] = useState(false);
  const [isOptionDialogOpen, setIsOptionDialogOpen] = useState(false);
  const [editingGroup, setEditingGroup] = useState<OptionGroup | null>(null);
  const [editingOption, setEditingOption] = useState<Option | null>(null);
  const [selectedGroupId, setSelectedGroupId] = useState<string | null>(null);
  const [deleteGroupId, setDeleteGroupId] = useState<string | null>(null);
  const [deleteOptionId, setDeleteOptionId] = useState<string | null>(null);

  const [groupForm, setGroupForm] = useState<OptionGroupFormData>({
    name: "",
    type: "single",
    isRequired: 0,
    minSelections: 0,
    maxSelections: 1,
    displayOrder: 0,
  });

  const [optionForm, setOptionForm] = useState<OptionFormData>({
    name: "",
    priceAdjustment: "0",
    isAvailable: 1,
    isRecommended: 0,
    displayOrder: 0,
  });

  const { data: optionGroups = [], isLoading } = useQuery<Array<OptionGroup & { options: Option[] }>>({
    queryKey: ["/api/menu-items", menuItemId, "option-groups"],
    enabled: isOpen,
  });

  const createGroupMutation = useMutation({
    mutationFn: async (data: OptionGroupFormData) => {
      return await apiRequest("POST", `/api/menu-items/${menuItemId}/option-groups`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/menu-items", menuItemId, "option-groups"] });
      toast({ title: "Sucesso", description: "Grupo de opções criado com sucesso." });
      setIsGroupDialogOpen(false);
      resetGroupForm();
    },
    onError: (error: any) => {
      const errorMessage = error?.message || error?.error || "Erro ao criar grupo de opções.";
      console.error('Error creating option group:', error);
      toast({ title: "Erro", description: errorMessage, variant: "destructive" });
    },
  });

  const updateGroupMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<OptionGroupFormData> }) => {
      return await apiRequest("PATCH", `/api/option-groups/${id}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/menu-items", menuItemId, "option-groups"] });
      toast({ title: "Sucesso", description: "Grupo atualizado com sucesso." });
      setIsGroupDialogOpen(false);
      setEditingGroup(null);
      resetGroupForm();
    },
    onError: () => {
      toast({ title: "Erro", description: "Erro ao atualizar grupo.", variant: "destructive" });
    },
  });

  const deleteGroupMutation = useMutation({
    mutationFn: async (id: string) => {
      return await apiRequest("DELETE", `/api/option-groups/${id}`, undefined);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/menu-items", menuItemId, "option-groups"] });
      toast({ title: "Sucesso", description: "Grupo excluído com sucesso." });
      setDeleteGroupId(null);
    },
    onError: () => {
      toast({ title: "Erro", description: "Erro ao excluir grupo.", variant: "destructive" });
    },
  });

  const createOptionMutation = useMutation({
    mutationFn: async ({ groupId, data }: { groupId: string; data: OptionFormData }) => {
      return await apiRequest("POST", `/api/option-groups/${groupId}/options`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/menu-items", menuItemId, "option-groups"] });
      toast({ title: "Sucesso", description: "Opção criada com sucesso." });
      setIsOptionDialogOpen(false);
      resetOptionForm();
    },
    onError: () => {
      toast({ title: "Erro", description: "Erro ao criar opção.", variant: "destructive" });
    },
  });

  const updateOptionMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<OptionFormData> }) => {
      return await apiRequest("PATCH", `/api/options/${id}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/menu-items", menuItemId, "option-groups"] });
      toast({ title: "Sucesso", description: "Opção atualizada com sucesso." });
      setIsOptionDialogOpen(false);
      setEditingOption(null);
      resetOptionForm();
    },
    onError: () => {
      toast({ title: "Erro", description: "Erro ao atualizar opção.", variant: "destructive" });
    },
  });

  const deleteOptionMutation = useMutation({
    mutationFn: async (id: string) => {
      return await apiRequest("DELETE", `/api/options/${id}`, undefined);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/menu-items", menuItemId, "option-groups"] });
      toast({ title: "Sucesso", description: "Opção excluída com sucesso." });
      setDeleteOptionId(null);
    },
    onError: () => {
      toast({ title: "Erro", description: "Erro ao excluir opção.", variant: "destructive" });
    },
  });

  const resetGroupForm = () => {
    setGroupForm({
      name: "",
      type: "single",
      isRequired: 0,
      minSelections: 0,
      maxSelections: 1,
      displayOrder: 0,
    });
  };

  const resetOptionForm = () => {
    setOptionForm({
      name: "",
      priceAdjustment: "0",
      isAvailable: 1,
      isRecommended: 0,
      displayOrder: 0,
    });
  };

  const handleEditGroup = (group: OptionGroup) => {
    setEditingGroup(group);
    setGroupForm({
      id: group.id,
      name: group.name,
      type: group.type,
      isRequired: group.isRequired,
      minSelections: group.minSelections,
      maxSelections: group.maxSelections,
      displayOrder: group.displayOrder,
    });
    setIsGroupDialogOpen(true);
  };

  const handleEditOption = (option: Option, groupId: string) => {
    setEditingOption(option);
    setSelectedGroupId(groupId);
    setOptionForm({
      id: option.id,
      name: option.name,
      priceAdjustment: option.priceAdjustment,
      isAvailable: option.isAvailable,
      isRecommended: option.isRecommended,
      displayOrder: option.displayOrder,
    });
    setIsOptionDialogOpen(true);
  };

  const handleSaveGroup = () => {
    if (!groupForm.name.trim()) {
      toast({ title: "Erro", description: "Nome do grupo é obrigatório.", variant: "destructive" });
      return;
    }

    if (editingGroup) {
      updateGroupMutation.mutate({ id: editingGroup.id, data: groupForm });
    } else {
      const { id, ...dataWithoutId } = groupForm;
      createGroupMutation.mutate(dataWithoutId);
    }
  };

  const handleSaveOption = () => {
    if (!optionForm.name.trim()) {
      toast({ title: "Erro", description: "Nome da opção é obrigatório.", variant: "destructive" });
      return;
    }

    if (!selectedGroupId) {
      toast({ title: "Erro", description: "Grupo não selecionado.", variant: "destructive" });
      return;
    }

    if (editingOption) {
      updateOptionMutation.mutate({ id: editingOption.id, data: optionForm });
    } else {
      const { id, ...dataWithoutId } = optionForm;
      createOptionMutation.mutate({ groupId: selectedGroupId, data: dataWithoutId });
    }
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogTrigger asChild>
          <Button variant="ghost" size="sm" data-testid={`button-manage-options-${menuItemId}`}>
            <Settings2 className="h-4 w-4 mr-2" />
            Opções
          </Button>
        </DialogTrigger>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Opções de {menuItemName}</DialogTitle>
            <DialogDescription>
              Gerencie grupos de opções e opções para este prato
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <Button onClick={() => {
              resetGroupForm();
              setEditingGroup(null);
              setIsGroupDialogOpen(true);
            }} data-testid="button-add-option-group">
              <Plus className="h-4 w-4 mr-2" />
              Adicionar Grupo de Opções
            </Button>

            {isLoading ? (
              <div className="text-center py-8 text-muted-foreground">Carregando...</div>
            ) : optionGroups.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                Nenhum grupo de opções criado ainda.
              </div>
            ) : (
              <div className="space-y-4">
                {optionGroups.map((group) => (
                  <Card key={group.id}>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <div className="flex items-center gap-2">
                        <GripVertical className="h-4 w-4 text-muted-foreground" />
                        <CardTitle className="text-base">{group.name}</CardTitle>
                        <Badge variant={group.type === "single" ? "default" : "secondary"}>
                          {group.type === "single" ? "Escolha Única" : "Múltipla Escolha"}
                        </Badge>
                        {group.isRequired === 1 && (
                          <Badge variant="destructive">Obrigatório</Badge>
                        )}
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEditGroup(group)}
                          data-testid={`button-edit-group-${group.id}`}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setDeleteGroupId(group.id)}
                          data-testid={`button-delete-group-${group.id}`}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="mb-4 text-sm text-muted-foreground">
                        {group.type === "multiple" && (
                          <span>Mín: {group.minSelections}, Máx: {group.maxSelections}</span>
                        )}
                      </div>

                      <div className="space-y-2">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium">Opções</span>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              resetOptionForm();
                              setEditingOption(null);
                              setSelectedGroupId(group.id);
                              setIsOptionDialogOpen(true);
                            }}
                            data-testid={`button-add-option-${group.id}`}
                          >
                            <Plus className="h-4 w-4 mr-2" />
                            Adicionar Opção
                          </Button>
                        </div>

                        {group.options.length === 0 ? (
                          <div className="text-sm text-muted-foreground text-center py-4">
                            Nenhuma opção criada ainda
                          </div>
                        ) : (
                          <div className="grid gap-2">
                            {group.options.map((option) => (
                              <div
                                key={option.id}
                                className="flex items-center justify-between p-2 rounded-md bg-muted"
                              >
                                <div className="flex items-center gap-2">
                                  <GripVertical className="h-4 w-4 text-muted-foreground" />
                                  <span className="text-sm">{option.name}</span>
                                  {parseFloat(option.priceAdjustment) !== 0 && (
                                    <Badge variant="outline">
                                      {parseFloat(option.priceAdjustment) > 0 ? "+" : ""}
                                      {formatKwanza(option.priceAdjustment)}
                                    </Badge>
                                  )}
                                  {option.isRecommended === 1 && (
                                    <Badge variant="default" className="bg-amber-500 hover:bg-amber-600">
                                      ⭐ Recomendado
                                    </Badge>
                                  )}
                                  {option.isAvailable === 0 && (
                                    <Badge variant="secondary">Indisponível</Badge>
                                  )}
                                </div>
                                <div className="flex gap-2">
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleEditOption(option, group.id)}
                                    data-testid={`button-edit-option-${option.id}`}
                                  >
                                    <Pencil className="h-3 w-3" />
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => setDeleteOptionId(option.id)}
                                    data-testid={`button-delete-option-${option.id}`}
                                  >
                                    <Trash2 className="h-3 w-3" />
                                  </Button>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Group Dialog */}
      <Dialog open={isGroupDialogOpen} onOpenChange={setIsGroupDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingGroup ? "Editar" : "Criar"} Grupo de Opções</DialogTitle>
            <DialogDescription>
              Configure um grupo de opções para este prato
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <Label htmlFor="group-name">Nome do Grupo</Label>
              <Input
                id="group-name"
                placeholder="Ex: Tamanho, Acompanhamentos, Ponto da Carne"
                value={groupForm.name}
                onChange={(e) => setGroupForm({ ...groupForm, name: e.target.value })}
                data-testid="input-group-name"
              />
            </div>

            <div>
              <Label htmlFor="group-type">Tipo de Escolha</Label>
              <Select
                value={groupForm.type}
                onValueChange={(value: "single" | "multiple") =>
                  setGroupForm({ ...groupForm, type: value })
                }
              >
                <SelectTrigger id="group-type" data-testid="select-group-type">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="single">Escolha Única</SelectItem>
                  <SelectItem value="multiple">Múltipla Escolha</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center justify-between">
              <Label htmlFor="group-required">Obrigatório</Label>
              <Switch
                id="group-required"
                checked={groupForm.isRequired === 1}
                onCheckedChange={(checked) =>
                  setGroupForm({ ...groupForm, isRequired: checked ? 1 : 0 })
                }
                data-testid="switch-group-required"
              />
            </div>

            {groupForm.type === "multiple" && (
              <>
                <div>
                  <Label htmlFor="group-min">Mínimo de Seleções</Label>
                  <Input
                    id="group-min"
                    type="number"
                    min="0"
                    value={groupForm.minSelections}
                    onChange={(e) =>
                      setGroupForm({ ...groupForm, minSelections: parseInt(e.target.value) || 0 })
                    }
                    data-testid="input-group-min"
                  />
                </div>

                <div>
                  <Label htmlFor="group-max">Máximo de Seleções</Label>
                  <Input
                    id="group-max"
                    type="number"
                    min="1"
                    value={groupForm.maxSelections}
                    onChange={(e) =>
                      setGroupForm({ ...groupForm, maxSelections: parseInt(e.target.value) || 1 })
                    }
                    data-testid="input-group-max"
                  />
                </div>
              </>
            )}

            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setIsGroupDialogOpen(false)}>
                Cancelar
              </Button>
              <Button
                onClick={handleSaveGroup}
                disabled={createGroupMutation.isPending || updateGroupMutation.isPending}
                data-testid="button-save-group"
              >
                {createGroupMutation.isPending || updateGroupMutation.isPending
                  ? "Salvando..."
                  : "Salvar"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Option Dialog */}
      <Dialog open={isOptionDialogOpen} onOpenChange={setIsOptionDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingOption ? "Editar" : "Criar"} Opção</DialogTitle>
            <DialogDescription>Configure uma opção para o grupo selecionado</DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <Label htmlFor="option-name">Nome da Opção</Label>
              <Input
                id="option-name"
                placeholder="Ex: Grande, Arroz, Mal Passado"
                value={optionForm.name}
                onChange={(e) => setOptionForm({ ...optionForm, name: e.target.value })}
                data-testid="input-option-name"
              />
            </div>

            <div>
              <Label htmlFor="option-price">Preço Adicional (Kz)</Label>
              <Input
                id="option-price"
                type="number"
                step="0.01"
                placeholder="0.00"
                value={optionForm.priceAdjustment}
                onChange={(e) =>
                  setOptionForm({ ...optionForm, priceAdjustment: e.target.value })
                }
                data-testid="input-option-price"
              />
            </div>

            <div className="flex items-center justify-between">
              <Label htmlFor="option-available">Disponível</Label>
              <Switch
                id="option-available"
                checked={optionForm.isAvailable === 1}
                onCheckedChange={(checked) =>
                  setOptionForm({ ...optionForm, isAvailable: checked ? 1 : 0 })
                }
                data-testid="switch-option-available"
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="option-recommended">Recomendar (Upselling)</Label>
                <p className="text-xs text-muted-foreground">
                  Destacar como sugestão para aumentar vendas
                </p>
              </div>
              <Switch
                id="option-recommended"
                checked={optionForm.isRecommended === 1}
                onCheckedChange={(checked) =>
                  setOptionForm({ ...optionForm, isRecommended: checked ? 1 : 0 })
                }
                data-testid="switch-option-recommended"
              />
            </div>

            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setIsOptionDialogOpen(false)}>
                Cancelar
              </Button>
              <Button
                onClick={handleSaveOption}
                disabled={createOptionMutation.isPending || updateOptionMutation.isPending}
                data-testid="button-save-option"
              >
                {createOptionMutation.isPending || updateOptionMutation.isPending
                  ? "Salvando..."
                  : "Salvar"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Group Dialog */}
      <AlertDialog open={!!deleteGroupId} onOpenChange={() => setDeleteGroupId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir este grupo? Todas as opções serão excluídas também.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteGroupId && deleteGroupMutation.mutate(deleteGroupId)}
              disabled={deleteGroupMutation.isPending}
            >
              {deleteGroupMutation.isPending ? "Excluindo..." : "Excluir"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Delete Option Dialog */}
      <AlertDialog open={!!deleteOptionId} onOpenChange={() => setDeleteOptionId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir esta opção?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteOptionId && deleteOptionMutation.mutate(deleteOptionId)}
              disabled={deleteOptionMutation.isPending}
            >
              {deleteOptionMutation.isPending ? "Excluindo..." : "Excluir"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
