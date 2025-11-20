import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { Plus, Search, Tag, TrendingUp, Percent, Trash2 } from "lucide-react";
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
import { motion } from "framer-motion";
import { formatKwanza } from "@/lib/formatters";
import type { Coupon } from "@shared/schema";

type CouponStats = {
  totalCoupons: number;
  activeCoupons: number;
  totalUsages: number;
  totalDiscount: string;
  topCoupons: Array<{ coupon: Coupon; usageCount: number; totalDiscount: string }>;
};

export default function Coupons() {
  const { toast } = useToast();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState<Coupon | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [formData, setFormData] = useState({
    code: "",
    description: "",
    discountType: "percentual" as "percentual" | "valor",
    discountValue: "",
    minOrderValue: "0",
    maxDiscount: "",
    maxUses: "",
    maxUsesPerCustomer: "",
    validFrom: new Date().toISOString().split('T')[0],
    validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    isActive: 1,
  });

  const { data: coupons = [], isLoading } = useQuery<Coupon[]>({
    queryKey: ['/api/coupons'],
  });

  const { data: stats } = useQuery<CouponStats>({
    queryKey: ['/api/coupons', 'stats'],
  });

  const createCouponMutation = useMutation({
    mutationFn: async (data: any) => {
      return await apiRequest('POST', '/api/coupons', data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/coupons'] });
      setIsDialogOpen(false);
      resetForm();
      toast({
        title: "Sucesso",
        description: "Cupom criado com sucesso",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Erro",
        description: error.message || "Erro ao criar cupom",
        variant: "destructive",
      });
    },
  });

  const updateCouponMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: any }) => {
      return await apiRequest('PUT', `/api/coupons/${id}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/coupons'] });
      setIsDialogOpen(false);
      resetForm();
      toast({
        title: "Sucesso",
        description: "Cupom atualizado com sucesso",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Erro",
        description: error.message || "Erro ao atualizar cupom",
        variant: "destructive",
      });
    },
  });

  const deleteCouponMutation = useMutation({
    mutationFn: async (couponId: string) => {
      return await apiRequest('DELETE', `/api/coupons/${couponId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/coupons'] });
      toast({
        title: "Sucesso",
        description: "Cupom deletado com sucesso",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Erro",
        description: error.message || "Erro ao deletar cupom",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const submitData = {
      ...formData,
      code: formData.code.toUpperCase(),
      validFrom: new Date(formData.validFrom),
      validUntil: new Date(formData.validUntil),
      maxUses: formData.maxUses ? parseInt(formData.maxUses) : null,
      maxUsesPerCustomer: formData.maxUsesPerCustomer ? parseInt(formData.maxUsesPerCustomer) : null,
      maxDiscount: formData.maxDiscount || null,
    };

    if (editingCoupon) {
      updateCouponMutation.mutate({ id: editingCoupon.id, data: submitData });
    } else {
      createCouponMutation.mutate(submitData);
    }
  };

  const resetForm = () => {
    setFormData({
      code: "",
      description: "",
      discountType: "percentual",
      discountValue: "",
      minOrderValue: "0",
      maxDiscount: "",
      maxUses: "",
      maxUsesPerCustomer: "",
      validFrom: new Date().toISOString().split('T')[0],
      validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      isActive: 1,
    });
    setEditingCoupon(null);
  };

  const openEditDialog = (coupon: Coupon) => {
    setEditingCoupon(coupon);
    setFormData({
      code: coupon.code,
      description: coupon.description || "",
      discountType: coupon.discountType,
      discountValue: coupon.discountValue,
      minOrderValue: coupon.minOrderValue || "0",
      maxDiscount: coupon.maxDiscount || "",
      maxUses: coupon.maxUses?.toString() || "",
      maxUsesPerCustomer: coupon.maxUsesPerCustomer?.toString() || "",
      validFrom: new Date(coupon.validFrom).toISOString().split('T')[0],
      validUntil: new Date(coupon.validUntil).toISOString().split('T')[0],
      isActive: coupon.isActive,
    });
    setIsDialogOpen(true);
  };

  const isExpired = (coupon: Coupon) => new Date(coupon.validUntil) < new Date();
  const isUpcoming = (coupon: Coupon) => new Date(coupon.validFrom) > new Date();

  const filteredCoupons = coupons.filter(coupon =>
    coupon.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
    coupon.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen">
      <div className="space-y-4 p-4 sm:p-6">
        <motion.div
          className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight bg-gradient-to-r from-primary via-primary/80 to-primary/60 bg-clip-text text-transparent" data-testid="text-page-title">
              Cupons de Desconto
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              Gerir cupons promocionais e descontos
            </p>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={(open) => {
            setIsDialogOpen(open);
            if (!open) resetForm();
          }}>
            <DialogTrigger asChild>
              <Button data-testid="button-add-coupon">
                <Plus className="h-4 w-4 mr-2" />
                Novo Cupom
              </Button>
            </DialogTrigger>
            <DialogContent className="max-h-[90vh] overflow-y-auto" data-testid="dialog-create-coupon">
              <DialogHeader>
                <DialogTitle>{editingCoupon ? 'Editar Cupom' : 'Criar Novo Cupom'}</DialogTitle>
                <DialogDescription>
                  Configure o código e condições do cupom
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSubmit}>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="code">Código do Cupom *</Label>
                    <Input
                      id="code"
                      placeholder="PROMO2024"
                      value={formData.code}
                      onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                      required
                      data-testid="input-coupon-code"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="description">Descrição</Label>
                    <Input
                      id="description"
                      placeholder="Descrição do cupom"
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      data-testid="input-coupon-description"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="discountType">Tipo de Desconto</Label>
                      <Select
                        value={formData.discountType}
                        onValueChange={(value: "percentual" | "valor") => setFormData({ ...formData, discountType: value })}
                      >
                        <SelectTrigger data-testid="select-discount-type">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="percentual">Percentual (%)</SelectItem>
                          <SelectItem value="valor">Valor Fixo (AOA)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="discountValue">Valor do Desconto *</Label>
                      <Input
                        id="discountValue"
                        type="number"
                        step="0.01"
                        placeholder={formData.discountType === "percentual" ? "10" : "5000"}
                        value={formData.discountValue}
                        onChange={(e) => setFormData({ ...formData, discountValue: e.target.value })}
                        required
                        data-testid="input-discount-value"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="minOrderValue">Pedido Mínimo</Label>
                      <Input
                        id="minOrderValue"
                        type="number"
                        step="0.01"
                        placeholder="0"
                        value={formData.minOrderValue}
                        onChange={(e) => setFormData({ ...formData, minOrderValue: e.target.value })}
                        data-testid="input-min-order-value"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="maxDiscount">Desconto Máximo</Label>
                      <Input
                        id="maxDiscount"
                        type="number"
                        step="0.01"
                        placeholder="Opcional"
                        value={formData.maxDiscount}
                        onChange={(e) => setFormData({ ...formData, maxDiscount: e.target.value })}
                        data-testid="input-max-discount"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="maxUses">Usos Totais</Label>
                      <Input
                        id="maxUses"
                        type="number"
                        placeholder="Ilimitado"
                        value={formData.maxUses}
                        onChange={(e) => setFormData({ ...formData, maxUses: e.target.value })}
                        data-testid="input-max-uses"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="maxUsesPerCustomer">Usos por Cliente</Label>
                      <Input
                        id="maxUsesPerCustomer"
                        type="number"
                        placeholder="Ilimitado"
                        value={formData.maxUsesPerCustomer}
                        onChange={(e) => setFormData({ ...formData, maxUsesPerCustomer: e.target.value })}
                        data-testid="input-max-uses-customer"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="validFrom">Válido De</Label>
                      <Input
                        id="validFrom"
                        type="date"
                        value={formData.validFrom}
                        onChange={(e) => setFormData({ ...formData, validFrom: e.target.value })}
                        required
                        data-testid="input-valid-from"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="validUntil">Válido Até</Label>
                      <Input
                        id="validUntil"
                        type="date"
                        value={formData.validUntil}
                        onChange={(e) => setFormData({ ...formData, validUntil: e.target.value })}
                        required
                        data-testid="input-valid-until"
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-between space-x-2">
                    <Label htmlFor="isActive" className="flex flex-col space-y-1">
                      <span>Cupom Ativo</span>
                      <span className="font-normal text-xs text-muted-foreground">
                        Ative ou desative o cupom
                      </span>
                    </Label>
                    <Switch
                      id="isActive"
                      checked={formData.isActive === 1}
                      onCheckedChange={(checked) => setFormData({ ...formData, isActive: checked ? 1 : 0 })}
                      data-testid="switch-coupon-active"
                    />
                  </div>
                </div>
                <DialogFooter className="mt-6">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setIsDialogOpen(false);
                      resetForm();
                    }}
                    data-testid="button-cancel"
                  >
                    Cancelar
                  </Button>
                  <Button
                    type="submit"
                    disabled={createCouponMutation.isPending || updateCouponMutation.isPending}
                    data-testid="button-submit-coupon"
                  >
                    {editingCoupon ? 'Atualizar' : 'Criar'}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </motion.div>

        {stats && (
          <motion.div
            className="grid gap-4 md:grid-cols-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <Card data-testid="card-total-coupons">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total de Cupons</CardTitle>
                <Tag className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.totalCoupons}</div>
                <p className="text-xs text-muted-foreground">
                  {stats.activeCoupons} ativos
                </p>
              </CardContent>
            </Card>
            <Card data-testid="card-total-usages">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total de Usos</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.totalUsages}</div>
                <p className="text-xs text-muted-foreground">
                  Cupons utilizados
                </p>
              </CardContent>
            </Card>
            <Card data-testid="card-total-discount">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Desconto Total</CardTitle>
                <Percent className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{formatKwanza(parseFloat(stats.totalDiscount))}</div>
                <p className="text-xs text-muted-foreground">
                  Concedido aos clientes
                </p>
              </CardContent>
            </Card>
            <Card data-testid="card-top-coupon">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Cupom Mais Usado</CardTitle>
                <Tag className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {stats.topCoupons[0]?.coupon.code || '-'}
                </div>
                <p className="text-xs text-muted-foreground">
                  {stats.topCoupons[0] ? `${stats.topCoupons[0].usageCount} usos` : '-'}
                </p>
              </CardContent>
            </Card>
          </motion.div>
        )}

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <Card>
            <CardHeader>
              <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
                <div>
                  <CardTitle>Lista de Cupons</CardTitle>
                  <CardDescription>
                    {filteredCoupons.length} cupom{filteredCoupons.length !== 1 ? 'ns' : ''} cadastrado{filteredCoupons.length !== 1 ? 's' : ''}
                  </CardDescription>
                </div>
                <div className="relative w-full sm:w-64">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Buscar cupons..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-9"
                    data-testid="input-search-coupons"
                  />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="text-center py-8 text-muted-foreground">Carregando...</div>
              ) : filteredCoupons.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  {searchQuery ? 'Nenhum cupom encontrado' : 'Nenhum cupom cadastrado'}
                </div>
              ) : (
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {filteredCoupons.map((coupon) => (
                    <motion.div
                      key={coupon.id}
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="p-4 rounded-lg border hover-elevate active-elevate-2"
                      data-testid={`card-coupon-${coupon.id}`}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <h3 className="font-bold text-lg">{coupon.code}</h3>
                          {coupon.description && (
                            <p className="text-sm text-muted-foreground">{coupon.description}</p>
                          )}
                        </div>
                        {coupon.isActive ? (
                          isExpired(coupon) ? (
                            <Badge variant="destructive">Expirado</Badge>
                          ) : isUpcoming(coupon) ? (
                            <Badge variant="secondary">Em breve</Badge>
                          ) : (
                            <Badge>Ativo</Badge>
                          )
                        ) : (
                          <Badge variant="outline">Inativo</Badge>
                        )}
                      </div>
                      <div className="space-y-1 mb-3 text-sm">
                        <div className="font-semibold text-primary">
                          {coupon.discountType === 'percentual'
                            ? `${coupon.discountValue}% de desconto`
                            : `${formatKwanza(parseFloat(coupon.discountValue))} de desconto`}
                        </div>
                        {coupon.minOrderValue && parseFloat(coupon.minOrderValue) > 0 && (
                          <div className="text-muted-foreground">
                            Pedido mínimo: {formatKwanza(parseFloat(coupon.minOrderValue))}
                          </div>
                        )}
                        <div className="text-muted-foreground">
                          Usos: {coupon.currentUses}/{coupon.maxUses || '∞'}
                        </div>
                        <div className="text-muted-foreground text-xs">
                          Válido: {new Date(coupon.validFrom).toLocaleDateString()} - {new Date(coupon.validUntil).toLocaleDateString()}
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          className="flex-1"
                          onClick={() => openEditDialog(coupon)}
                          data-testid={`button-edit-${coupon.id}`}
                        >
                          Editar
                        </Button>
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => {
                            if (confirm(`Tem certeza que deseja deletar ${coupon.code}?`)) {
                              deleteCouponMutation.mutate(coupon.id);
                            }
                          }}
                          data-testid={`button-delete-${coupon.id}`}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
