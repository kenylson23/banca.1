import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Building2, Trash2, Edit, MapPin, Phone } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";

type Branch = {
  id: string;
  restaurantId: string;
  name: string;
  address: string | null;
  phone: string | null;
  isActive: boolean;
  isMain: boolean;
  createdAt: string;
  updatedAt: string;
};

export default function Branches() {
  const { toast } = useToast();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingBranch, setEditingBranch] = useState<Branch | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    address: "",
    phone: "",
    isActive: true,
  });

  const { data: branches = [], isLoading } = useQuery<Branch[]>({
    queryKey: ['/api/branches'],
  });

  const createBranchMutation = useMutation({
    mutationFn: async (data: { name: string; address: string; phone: string; isActive: number }) => {
      return await apiRequest('POST', '/api/branches', data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/branches'] });
      setIsDialogOpen(false);
      resetForm();
      toast({
        title: "Sucesso",
        description: "Unidade criada com sucesso",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Erro",
        description: error.message || "Erro ao criar unidade",
        variant: "destructive",
      });
    },
  });

  const updateBranchMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: { name: string; address: string; phone: string; isActive: number } }) => {
      return await apiRequest('PATCH', `/api/branches/${id}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/branches'] });
      setIsDialogOpen(false);
      resetForm();
      toast({
        title: "Sucesso",
        description: "Unidade atualizada com sucesso",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Erro",
        description: error.message || "Erro ao atualizar unidade",
        variant: "destructive",
      });
    },
  });

  const deleteBranchMutation = useMutation({
    mutationFn: async (branchId: string) => {
      return await apiRequest('DELETE', `/api/branches/${branchId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/branches'] });
      toast({
        title: "Sucesso",
        description: "Unidade deletada com sucesso",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Erro",
        description: error.message || "Erro ao deletar unidade",
        variant: "destructive",
      });
    },
  });

  const resetForm = () => {
    setFormData({
      name: "",
      address: "",
      phone: "",
      isActive: true,
    });
    setEditingBranch(null);
  };

  const handleEdit = (branch: Branch) => {
    setEditingBranch(branch);
    setFormData({
      name: branch.name,
      address: branch.address || "",
      phone: branch.phone || "",
      isActive: Boolean(branch.isActive),
    });
    setIsDialogOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const dataToSubmit = {
      name: formData.name,
      address: formData.address,
      phone: formData.phone,
      isActive: formData.isActive ? 1 : 0,
    };
    
    if (editingBranch) {
      updateBranchMutation.mutate({ id: editingBranch.id, data: dataToSubmit });
    } else {
      createBranchMutation.mutate(dataToSubmit);
    }
  };

  const handleDialogChange = (open: boolean) => {
    setIsDialogOpen(open);
    if (!open) {
      resetForm();
    }
  };

  return (
    <div className="p-4 sm:p-6 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <Dialog open={isDialogOpen} onOpenChange={handleDialogChange}>
          <DialogTrigger asChild>
            <Button data-testid="button-add-branch">
              <Building2 className="h-4 w-4 mr-2" />
              Nova Unidade
            </Button>
          </DialogTrigger>
          <DialogContent data-testid="dialog-create-branch">
            <DialogHeader>
              <DialogTitle>
                {editingBranch ? "Editar Unidade" : "Criar Nova Unidade"}
              </DialogTitle>
              <DialogDescription>
                {editingBranch
                  ? "Altere os dados da unidade"
                  : "Preencha os dados para criar uma nova unidade"}
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit}>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Nome da Unidade</Label>
                  <Input
                    id="name"
                    placeholder="Ex: Filial Centro, Matriz, etc."
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                    data-testid="input-branch-name"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="address">Endereço</Label>
                  <Input
                    id="address"
                    placeholder="Rua, número, bairro, cidade"
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    data-testid="input-branch-address"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Telefone</Label>
                  <Input
                    id="phone"
                    placeholder="(XX) XXXXX-XXXX"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    data-testid="input-branch-phone"
                  />
                </div>
                <div className="flex items-center space-x-2">
                  <Switch
                    id="isActive"
                    checked={formData.isActive}
                    onCheckedChange={(checked) =>
                      setFormData({ ...formData, isActive: checked })
                    }
                    data-testid="switch-branch-active"
                  />
                  <Label htmlFor="isActive">Unidade ativa</Label>
                </div>
              </div>
              <DialogFooter className="mt-6">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => handleDialogChange(false)}
                  data-testid="button-cancel"
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  disabled={createBranchMutation.isPending || updateBranchMutation.isPending}
                  data-testid="button-submit"
                >
                  {editingBranch ? "Atualizar" : "Criar"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {isLoading ? (
        <div className="text-center py-8 text-muted-foreground">Carregando...</div>
      ) : branches.length === 0 ? (
        <Card>
          <CardContent className="py-8">
            <div className="text-center">
              <Building2 className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <p className="text-muted-foreground">Nenhuma unidade cadastrada</p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {branches.map((branch) => (
            <Card key={branch.id} data-testid={`card-branch-${branch.id}`}>
              <CardHeader>
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1">
                    <CardTitle className="flex items-center gap-2">
                      <Building2 className="h-5 w-5" />
                      {branch.name}
                    </CardTitle>
                    <CardDescription className="mt-2">
                      {branch.isMain && (
                        <Badge variant="secondary" className="mr-2">
                          Matriz
                        </Badge>
                      )}
                      {branch.isActive ? (
                        <Badge variant="default">Ativa</Badge>
                      ) : (
                        <Badge variant="outline">Inativa</Badge>
                      )}
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                {branch.address && (
                  <div className="flex items-start gap-2 text-sm">
                    <MapPin className="h-4 w-4 mt-0.5 text-muted-foreground flex-shrink-0" />
                    <span className="text-muted-foreground">{branch.address}</span>
                  </div>
                )}
                {branch.phone && (
                  <div className="flex items-center gap-2 text-sm">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <span className="text-muted-foreground">{branch.phone}</span>
                  </div>
                )}
                <div className="flex gap-2 pt-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1"
                    onClick={() => handleEdit(branch)}
                    data-testid={`button-edit-${branch.id}`}
                  >
                    <Edit className="h-4 w-4 mr-2" />
                    Editar
                  </Button>
                  {!branch.isMain && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        if (confirm("Tem certeza que deseja deletar esta unidade?")) {
                          deleteBranchMutation.mutate(branch.id);
                        }
                      }}
                      disabled={deleteBranchMutation.isPending}
                      data-testid={`button-delete-${branch.id}`}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
