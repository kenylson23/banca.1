import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Building2, Trash2, Edit, MapPin, Phone, Plus, CheckCircle, XCircle, Star, TrendingUp, Users, DollarSign, Activity, Calendar } from "lucide-react";
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
import { motion, AnimatePresence } from "framer-motion";
import { AdvancedKpiCard } from "@/components/advanced-kpi-card";
import { ShimmerSkeleton } from "@/components/shimmer-skeleton";
import { Separator } from "@/components/ui/separator";

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

  // Calculate KPIs
  const totalBranches = branches.length;
  const activeBranches = branches.filter(b => b.isActive).length;
  const mainBranch = branches.find(b => b.isMain);

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 pb-safe">
      <div className="space-y-4 sm:space-y-6 p-3 sm:p-6 lg:p-8 pb-20 sm:pb-8">
        {/* Header */}
        <motion.div
          className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4 sticky top-0 z-10 bg-gradient-to-br from-background via-background to-muted/20 py-2 sm:py-0 -mx-3 px-3 sm:mx-0 sm:px-0 backdrop-blur-sm sm:backdrop-blur-none"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="flex-1 min-w-0">
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight bg-gradient-to-r from-primary via-blue-600 to-cyan-600 bg-clip-text text-transparent truncate" data-testid="text-page-title">
              Gestão de Unidades
            </h1>
            <p className="text-xs sm:text-sm text-muted-foreground mt-1 sm:mt-2 line-clamp-1">
              Gerencie filiais e localizações do seu negócio
            </p>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={handleDialogChange}>
            <DialogTrigger asChild>
              <Button 
                size="default" 
                className="gap-2 shadow-lg hover:shadow-xl transition-all w-full sm:w-auto shrink-0" 
                data-testid="button-add-branch"
              >
                <Plus className="h-4 w-4 sm:h-5 sm:w-5" />
                <span className="sm:inline">Nova</span>
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
        </motion.div>

        {/* KPIs Dashboard */}
        <motion.div
          className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.2 }}
        >
          <AdvancedKpiCard
            title="Total"
            value={totalBranches}
            icon={Building2}
            iconColor="bg-blue-500/10 text-blue-600"
            className="touch-manipulation"
          />
          <AdvancedKpiCard
            title="Ativas"
            value={activeBranches}
            icon={CheckCircle}
            iconColor="bg-green-500/10 text-green-600"
            className="touch-manipulation"
          />
          <AdvancedKpiCard
            title="Inativas"
            value={totalBranches - activeBranches}
            icon={XCircle}
            iconColor="bg-red-500/10 text-red-600"
            className="touch-manipulation"
          />
          <AdvancedKpiCard
            title="Principal"
            value={mainBranch ? "1" : "0"}
            icon={Star}
            iconColor="bg-yellow-500/10 text-yellow-600"
            className="touch-manipulation"
          />
        </motion.div>

        {isLoading ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3].map((i) => (
              <ShimmerSkeleton key={i} className="h-64" />
            ))}
          </div>
        ) : branches.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
          >
            <Card className="border-dashed">
              <CardContent className="py-16">
                <div className="text-center space-y-3">
                  <div className="mx-auto w-16 h-16 rounded-full bg-muted flex items-center justify-center">
                    <Building2 className="h-8 w-8 text-muted-foreground" />
                  </div>
                  <h3 className="font-semibold text-lg">Nenhuma unidade cadastrada</h3>
                  <p className="text-sm text-muted-foreground">
                    Comece adicionando a primeira unidade do seu negócio
                  </p>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ) : (
          <AnimatePresence mode="wait">
            <motion.div 
              className="grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
            >
              {branches.map((branch, index) => (
                <motion.div
                  key={branch.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <Card 
                    className="group active:scale-[0.98] sm:hover:shadow-lg transition-all duration-300 sm:hover:scale-[1.02] overflow-hidden touch-manipulation"
                    data-testid={`card-branch-${branch.id}`}
                  >
                    <CardContent className="p-4 sm:p-6">
                      {/* Header */}
                      <div className="flex items-start justify-between mb-3 sm:mb-4">
                        <div className="flex items-center gap-2 sm:gap-3">
                          <div className={`p-2 sm:p-3 rounded-xl ${branch.isActive ? 'bg-green-500/10' : 'bg-gray-500/10'} shrink-0`}>
                            <Building2 className={`h-5 w-5 sm:h-6 sm:w-6 ${branch.isActive ? 'text-green-600' : 'text-gray-600'}`} />
                          </div>
                          <div className="min-w-0">
                            <h3 className="font-semibold text-base sm:text-lg truncate">{branch.name}</h3>
                            <div className="flex flex-wrap gap-1 sm:gap-2 mt-1">
                              {branch.isMain && (
                                <Badge className="bg-yellow-500/10 text-yellow-700 border-yellow-500/20 hover:bg-yellow-500/20 text-xs">
                                  <Star className="h-3 w-3 mr-1" />
                                  Matriz
                                </Badge>
                              )}
                              {branch.isActive ? (
                                <Badge className="bg-green-500/10 text-green-700 border-green-500/20 hover:bg-green-500/20 text-xs">
                                  <CheckCircle className="h-3 w-3 mr-1" />
                                  Ativa
                                </Badge>
                              ) : (
                                <Badge className="bg-red-500/10 text-red-700 border-red-500/20 hover:bg-red-500/20 text-xs">
                                  <XCircle className="h-3 w-3 mr-1" />
                                  Inativa
                                </Badge>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>

                      <Separator className="my-3 sm:my-4" />

                      {/* Details */}
                      <div className="space-y-2 sm:space-y-3">
                        {branch.address && (
                          <div className="flex items-start gap-2 text-xs sm:text-sm">
                            <MapPin className="h-3 w-3 sm:h-4 sm:w-4 mt-0.5 text-muted-foreground flex-shrink-0" />
                            <span className="text-muted-foreground line-clamp-2">{branch.address}</span>
                          </div>
                        )}
                        {branch.phone && (
                          <div className="flex items-center gap-2 text-xs sm:text-sm">
                            <Phone className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground" />
                            <span className="text-muted-foreground">{branch.phone}</span>
                          </div>
                        )}
                        <div className="hidden sm:flex items-center gap-2 text-xs text-muted-foreground">
                          <Calendar className="h-3 w-3" />
                          Criada em {new Date(branch.createdAt).toLocaleDateString('pt-AO')}
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <Separator className="my-3 sm:my-4" />
                      <div className="flex items-center justify-end gap-1 sm:gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEdit(branch)}
                          className="gap-1 sm:gap-2 h-8 sm:h-9 text-xs sm:text-sm touch-manipulation active:scale-95"
                          data-testid={`button-edit-${branch.id}`}
                        >
                          <Edit className="h-3 w-3 sm:h-4 sm:w-4" />
                          <span className="hidden xs:inline">Editar</span>
                        </Button>
                        {!branch.isMain && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              if (confirm("Tem certeza que deseja deletar esta unidade?")) {
                                deleteBranchMutation.mutate(branch.id);
                              }
                            }}
                            disabled={deleteBranchMutation.isPending}
                            className="gap-1 sm:gap-2 h-8 sm:h-9 text-xs sm:text-sm text-destructive hover:text-destructive touch-manipulation active:scale-95"
                            data-testid={`button-delete-${branch.id}`}
                          >
                            <Trash2 className="h-3 w-3 sm:h-4 sm:w-4" />
                            <span className="hidden xs:inline">Deletar</span>
                          </Button>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </motion.div>
          </AnimatePresence>
        )}
      </div>
    </div>
  );
}
