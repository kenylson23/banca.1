import { useState, useMemo } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { Plus, Search, Tag, TrendingUp, Percent, Trash2, Calendar, ShoppingBag, TicketPercent, Clock, DollarSign, AlertCircle, CheckCircle2 } from "lucide-react";
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
import { AdvancedKpiCard } from "@/components/advanced-kpi-card";
import { ActivityFeed } from "@/components/activity-feed";
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

  // Calculate additional metrics
  const avgDiscount = useMemo(() => {
    if (!stats || stats.totalUsages === 0) return 0;
    const totalDiscount = typeof stats.totalDiscount === 'string' 
      ? parseFloat(stats.totalDiscount.replace(/[^\d.-]/g, ''))
      : parseFloat(String(stats.totalDiscount));
    return isNaN(totalDiscount) ? 0 : totalDiscount / stats.totalUsages;
  }, [stats]);

  const expiringCoupons = useMemo(() => {
    const thirtyDaysFromNow = new Date();
    thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);
    return coupons.filter(c => 
      c.isActive && 
      new Date(c.validUntil) > new Date() && 
      new Date(c.validUntil) <= thirtyDaysFromNow
    ).length;
  }, [coupons]);

  // Convert recent coupon usages to activity feed format (mock - would come from API)
  const couponActivities = useMemo(() => {
    return coupons
      .filter(c => c.currentUses > 0)
      .slice(0, 10)
      .map((coupon) => ({
        id: coupon.id,
        type: "payment" as const,
        title: coupon.code,
        description: coupon.description || `${coupon.currentUses} uso${coupon.currentUses !== 1 ? 's' : ''}`,
        timestamp: new Date(coupon.validFrom),
        status: coupon.isActive ? "success" as const : "info" as const,
        value: coupon.discountType === 'percentual' 
          ? `${coupon.discountValue}%` 
          : formatKwanza(parseFloat(coupon.discountValue)),
      }));
  }, [coupons]);

  // Sparkline data for coupons (mock - in production would come from API)
  const couponSparkline = useMemo(() => {
    return Array.from({ length: 7 }, () => Math.floor(Math.random() * 20) + 5);
  }, []);

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
              Gestão e análise de cupons promocionais
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

        {/* Advanced KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4">
          {isLoading ? (
            <>
              {[...Array(4)].map((_, i) => (
                <Skeleton key={i} className="h-[140px] w-full rounded-lg" />
              ))}
            </>
          ) : (
            <>
              <AdvancedKpiCard
                title="Cupons Ativos"
                value={stats?.activeCoupons || 0}
                icon={Tag}
                sparklineData={couponSparkline}
                gradient="from-primary/10 via-primary/5 to-transparent"
                delay={0}
                data-testid="card-active-coupons"
              />

              <AdvancedKpiCard
                title="Total de Usos"
                value={stats?.totalUsages || 0}
                icon={TrendingUp}
                change={stats?.totalUsages && stats?.activeCoupons ? ((stats.totalUsages / stats.activeCoupons) - 10) : undefined}
                changeLabel="taxa de conversão"
                gradient="from-success/10 via-success/5 to-transparent"
                delay={0.1}
                data-testid="card-total-usages"
              />

              <AdvancedKpiCard
                title="Desconto Total"
                value={parseFloat(stats?.totalDiscount || '0')}
                prefix="Kz "
                decimals={2}
                icon={DollarSign}
                gradient="from-warning/10 via-warning/5 to-transparent"
                delay={0.2}
                data-testid="card-total-discount"
              />

              <AdvancedKpiCard
                title="Desconto Médio"
                value={avgDiscount}
                prefix="Kz "
                decimals={2}
                icon={Percent}
                gradient="from-info/10 via-info/5 to-transparent"
                delay={0.3}
                data-testid="card-avg-discount"
              />
            </>
          )}
        </div>

        {/* Coupon Performance & Alerts */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card data-testid="card-top-coupons">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5 text-primary" />
                  Cupons Mais Usados
                </CardTitle>
                <CardDescription>Top 5 cupons por utilização</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {stats.topCoupons.slice(0, 5).map((item, index) => (
                    <div key={item.coupon.code} className="flex items-center justify-between p-3 rounded-lg border hover-elevate active-elevate-2">
                      <div className="flex items-center gap-3">
                        <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary font-bold text-sm">
                          {index + 1}
                        </div>
                        <div>
                          <p className="font-medium text-sm">{item.coupon.code}</p>
                          <p className="text-xs text-muted-foreground">{item.usageCount} usos</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-sm">{formatKwanza(item.totalDiscount)}</p>
                        <Badge variant="outline" className="text-xs">
                          {item.coupon.discountType === 'percentual' 
                            ? `${item.coupon.discountValue}%` 
                            : formatKwanza(parseFloat(item.coupon.discountValue))}
                        </Badge>
                      </div>
                    </div>
                  ))}
                  {stats.topCoupons.length === 0 && (
                    <div className="text-center py-8 text-muted-foreground text-sm">
                      Nenhum cupom utilizado ainda
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card data-testid="card-coupon-alerts">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertCircle className="h-5 w-5 text-primary" />
                  Alertas e Status
                </CardTitle>
                <CardDescription>Cupons que requerem atenção</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="p-3 rounded-lg bg-warning/10 border border-warning/20">
                    <div className="flex items-center gap-2 mb-2">
                      <Clock className="h-4 w-4 text-warning" />
                      <span className="font-medium text-sm">Expirando em Breve</span>
                    </div>
                    <p className="text-2xl font-bold text-warning">{expiringCoupons}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Cupons expirando nos próximos 30 dias
                    </p>
                  </div>

                  <Separator />

                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Total de Cupons</span>
                      <span className="font-medium">{stats.totalCoupons}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Cupons Ativos</span>
                      <span className="font-medium">{stats.activeCoupons}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Cupons Inativos</span>
                      <span className="font-medium">{stats.totalCoupons - stats.activeCoupons}</span>
                    </div>
                  </div>

                  <Separator />

                  <div className="p-3 rounded-lg bg-muted/50">
                    <div className="flex items-center gap-2">
                      <TicketPercent className="h-4 w-4 text-primary" />
                      <span className="text-sm font-medium">Taxa de Utilização</span>
                    </div>
                    <p className="text-lg font-bold mt-1">
                      {stats.activeCoupons > 0 ? ((stats.totalUsages / stats.activeCoupons) * 100).toFixed(1) : '0'}%
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Coupon List & Activity Feed */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="lg:col-span-2">
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
                <Tabs defaultValue="all" className="w-full">
                  <TabsList className="grid w-full grid-cols-4 mb-4">
                    <TabsTrigger value="all" className="text-xs">Todos</TabsTrigger>
                    <TabsTrigger value="active" className="text-xs">Ativos</TabsTrigger>
                    <TabsTrigger value="expiring" className="text-xs">Expirando</TabsTrigger>
                    <TabsTrigger value="inactive" className="text-xs">Inativos</TabsTrigger>
                  </TabsList>

                  <TabsContent value="all">
                    {isLoading ? (
                      <div className="grid gap-3 sm:grid-cols-2">
                        {[...Array(4)].map((_, i) => (
                          <Skeleton key={i} className="h-[200px] w-full rounded-lg" />
                        ))}
                      </div>
                    ) : filteredCoupons.length === 0 ? (
                      <div className="text-center py-8 text-muted-foreground">
                        {searchQuery ? 'Nenhum cupom encontrado' : 'Nenhum cupom cadastrado'}
                      </div>
                    ) : (
                      <div className="grid gap-3 sm:grid-cols-2">
                  {filteredCoupons.map((coupon) => (
                    <motion.div
                      key={coupon.id}
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="p-4 rounded-lg border hover-elevate active-elevate-2"
                      data-testid={`card-coupon-${coupon.id}`}
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <TicketPercent className="h-4 w-4 text-primary" />
                            <h3 className="font-bold text-base">{coupon.code}</h3>
                          </div>
                          {coupon.description && (
                            <p className="text-sm text-muted-foreground line-clamp-2">{coupon.description}</p>
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
                      
                      <div className="space-y-2 mb-4">
                        <div className="flex items-baseline gap-2 p-3 rounded-md bg-primary/5">
                          <Percent className="h-4 w-4 text-primary" />
                          <span className="font-bold text-lg text-primary">
                            {coupon.discountType === 'percentual'
                              ? `${coupon.discountValue}%`
                              : formatKwanza(parseFloat(coupon.discountValue))}
                          </span>
                          <span className="text-sm text-muted-foreground">de desconto</span>
                        </div>
                        
                        <div className="space-y-1.5 text-sm">
                          {coupon.minOrderValue && parseFloat(coupon.minOrderValue) > 0 && (
                            <div className="flex items-center gap-2 text-muted-foreground">
                              <ShoppingBag className="h-3.5 w-3.5" />
                              <span>Pedido mín: {formatKwanza(parseFloat(coupon.minOrderValue))}</span>
                            </div>
                          )}
                          <div className="flex items-center gap-2 text-muted-foreground">
                            <Tag className="h-3.5 w-3.5" />
                            <span>Usos: {coupon.currentUses}/{coupon.maxUses || '∞'}</span>
                          </div>
                          <div className="flex items-center gap-2 text-muted-foreground">
                            <Calendar className="h-3.5 w-3.5" />
                            <span className="text-xs">
                              {new Date(coupon.validFrom).toLocaleDateString()} - {new Date(coupon.validUntil).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex gap-2 pt-3 border-t">
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
                  </TabsContent>

                  <TabsContent value="active">
                    <div className="grid gap-3 sm:grid-cols-2">
                      {filteredCoupons
                        .filter(c => c.isActive && !isExpired(c) && !isUpcoming(c))
                        .map((coupon) => (
                          <div key={coupon.id} className="p-4 rounded-lg border hover-elevate active-elevate-2">
                            <div className="flex items-center justify-between mb-2">
                              <h3 className="font-bold text-sm">{coupon.code}</h3>
                              <Badge>Ativo</Badge>
                            </div>
                            <p className="text-lg font-bold text-primary">
                              {coupon.discountType === 'percentual' 
                                ? `${coupon.discountValue}%` 
                                : formatKwanza(parseFloat(coupon.discountValue))}
                            </p>
                            <p className="text-xs text-muted-foreground mt-2">
                              Usos: {coupon.currentUses}/{coupon.maxUses || '∞'}
                            </p>
                          </div>
                        ))}
                    </div>
                  </TabsContent>

                  <TabsContent value="expiring">
                    <div className="grid gap-3 sm:grid-cols-2">
                      {filteredCoupons
                        .filter(c => {
                          const thirtyDaysFromNow = new Date();
                          thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);
                          return c.isActive && new Date(c.validUntil) > new Date() && new Date(c.validUntil) <= thirtyDaysFromNow;
                        })
                        .map((coupon) => (
                          <div key={coupon.id} className="p-4 rounded-lg border border-warning/50 hover-elevate active-elevate-2">
                            <div className="flex items-center justify-between mb-2">
                              <h3 className="font-bold text-sm">{coupon.code}</h3>
                              <Badge variant="secondary">Expirando</Badge>
                            </div>
                            <p className="text-lg font-bold text-warning">
                              {coupon.discountType === 'percentual' 
                                ? `${coupon.discountValue}%` 
                                : formatKwanza(parseFloat(coupon.discountValue))}
                            </p>
                            <p className="text-xs text-muted-foreground mt-2">
                              Expira: {new Date(coupon.validUntil).toLocaleDateString()}
                            </p>
                          </div>
                        ))}
                    </div>
                  </TabsContent>

                  <TabsContent value="inactive">
                    <div className="grid gap-3 sm:grid-cols-2">
                      {filteredCoupons
                        .filter(c => !c.isActive || isExpired(c))
                        .map((coupon) => (
                          <div key={coupon.id} className="p-4 rounded-lg border hover-elevate active-elevate-2 opacity-60">
                            <div className="flex items-center justify-between mb-2">
                              <h3 className="font-bold text-sm">{coupon.code}</h3>
                              <Badge variant="outline">{isExpired(coupon) ? 'Expirado' : 'Inativo'}</Badge>
                            </div>
                            <p className="text-lg font-bold text-muted-foreground">
                              {coupon.discountType === 'percentual' 
                                ? `${coupon.discountValue}%` 
                                : formatKwanza(parseFloat(coupon.discountValue))}
                            </p>
                          </div>
                        ))}
                    </div>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </div>

          {/* Activity Feed */}
          <div>
            <ActivityFeed
              activities={couponActivities}
              title="Atividade de Cupons"
              maxHeight={600}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
