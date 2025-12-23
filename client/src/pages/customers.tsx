import { useState, useMemo } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Trash2, UserPlus, Search, Users, TrendingUp, Star, Phone, Mail, Award, DollarSign, Calendar, Sparkles, UserCheck } from "lucide-react";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { motion } from "framer-motion";
import { formatKwanza } from "@/lib/formatters";
import { AdvancedKpiCard } from "@/components/advanced-kpi-card";
import { ActivityFeed } from "@/components/activity-feed";
import type { Customer } from "@shared/schema";

type CustomerStats = {
  totalCustomers: number;
  activeCustomers: number;
  newThisMonth: number;
  topCustomers: Array<Customer & { orderCount: number }>;
};

export default function Customers() {
  const { toast } = useToast();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    email: "",
    address: "",
  });

  const { data: customers = [], isLoading } = useQuery<Customer[]>({
    queryKey: ['/api/customers'],
  });

  const { data: stats } = useQuery<CustomerStats>({
    queryKey: ['/api/customers', 'stats'],
  });

  const createCustomerMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      return await apiRequest('POST', '/api/customers', data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/customers'] });
      setIsDialogOpen(false);
      resetForm();
      toast({
        title: "Sucesso",
        description: "Cliente criado com sucesso",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Erro",
        description: error.message || "Erro ao criar cliente",
        variant: "destructive",
      });
    },
  });

  const updateCustomerMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: typeof formData }) => {
      return await apiRequest('PUT', `/api/customers/${id}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/customers'] });
      setIsDialogOpen(false);
      resetForm();
      toast({
        title: "Sucesso",
        description: "Cliente atualizado com sucesso",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Erro",
        description: error.message || "Erro ao atualizar cliente",
        variant: "destructive",
      });
    },
  });

  const deleteCustomerMutation = useMutation({
    mutationFn: async (customerId: string) => {
      return await apiRequest('DELETE', `/api/customers/${customerId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/customers'] });
      toast({
        title: "Sucesso",
        description: "Cliente deletado com sucesso",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Erro",
        description: error.message || "Erro ao deletar cliente",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingCustomer) {
      updateCustomerMutation.mutate({ id: editingCustomer.id, data: formData });
    } else {
      createCustomerMutation.mutate(formData);
    }
  };

  const resetForm = () => {
    setFormData({
      name: "",
      phone: "",
      email: "",
      address: "",
    });
    setEditingCustomer(null);
  };

  const openEditDialog = (customer: Customer) => {
    setEditingCustomer(customer);
    setFormData({
      name: customer.name,
      phone: customer.phone || "",
      email: customer.email || "",
      address: customer.address || "",
    });
    setIsDialogOpen(true);
  };

  const getTierColor = (tier: string) => {
    switch (tier) {
      case 'platina': return 'bg-slate-600 text-white';
      case 'ouro': return 'bg-yellow-600 text-white';
      case 'prata': return 'bg-slate-400 text-white';
      default: return 'bg-orange-600 text-white';
    }
  };

  const filteredCustomers = customers.filter(customer =>
    customer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    customer.phone?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    customer.email?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Calculate average lifetime value and order frequency
  const avgLifetimeValue = useMemo(() => {
    if (customers.length === 0) return 0;
    const total = customers.reduce((sum, c) => sum + parseFloat(c.totalSpent || '0'), 0);
    return total / customers.length;
  }, [customers]);

  const avgOrderFrequency = useMemo(() => {
    if (customers.length === 0) return 0;
    const total = customers.reduce((sum, c) => sum + (c.visitCount || 0), 0);
    return total / customers.length;
  }, [customers]);

  // Recent customer activities for ActivityFeed
  const recentActivities = useMemo(() => {
    return customers
      .filter(c => c.visitCount && c.visitCount > 0)
      .slice(0, 10)
      .map((customer) => ({
        id: customer.id,
        type: "user" as const,
        title: customer.name,
        description: `${customer.visitCount} visita${customer.visitCount !== 1 ? 's' : ''} • ${customer.tier || 'bronze'} tier`,
        timestamp: customer.lastVisit ? new Date(customer.lastVisit) : new Date(),
        status: "info" as const,
        value: formatKwanza(parseFloat(customer.totalSpent || '0')),
      }));
  }, [customers]);

  // Sparkline data for customers (mock - in production would come from API)
  const customerSparkline = useMemo(() => {
    return Array.from({ length: 7 }, () => Math.floor(Math.random() * 50) + 10);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 pb-safe">
      <div className="space-y-4 sm:space-y-6 p-3 sm:p-6 lg:p-8 pb-20 sm:pb-8">
        <motion.div
          className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4 sticky top-0 z-10 bg-gradient-to-br from-background via-background to-muted/20 py-2 sm:py-0 -mx-3 px-3 sm:mx-0 sm:px-0 backdrop-blur-sm sm:backdrop-blur-none"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="flex-1 min-w-0">
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight bg-gradient-to-r from-primary via-green-600 to-emerald-600 bg-clip-text text-transparent truncate" data-testid="text-page-title">
              Gestão de Clientes
            </h1>
            <p className="text-xs sm:text-sm text-muted-foreground mt-1 sm:mt-2 line-clamp-1">
              Análise de clientes e programa de fidelidade
            </p>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={(open) => {
            setIsDialogOpen(open);
            if (!open) resetForm();
          }}>
            <DialogTrigger asChild>
              <Button 
                size="default" 
                className="gap-2 shadow-lg hover:shadow-xl transition-all w-full sm:w-auto shrink-0 touch-manipulation" 
                data-testid="button-add-customer"
              >
                <UserPlus className="h-4 w-4 sm:h-5 sm:w-5" />
                <span className="sm:inline">Novo</span>
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]" data-testid="dialog-create-customer">
              <DialogHeader className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                    <UserPlus className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <DialogTitle className="text-xl">
                      {editingCustomer ? 'Editar Cliente' : 'Novo Cliente'}
                    </DialogTitle>
                    <DialogDescription className="text-sm">
                      {editingCustomer ? 'Atualize os dados do cliente' : 'Adicione um novo cliente ao sistema'}
                    </DialogDescription>
                  </div>
                </div>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-6 pt-4">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="name" className="flex items-center gap-2 text-sm font-medium">
                      <Users className="h-4 w-4 text-muted-foreground" />
                      Nome Completo *
                    </Label>
                    <Input
                      id="name"
                      placeholder="Digite o nome completo"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      required
                      className="h-11"
                      data-testid="input-customer-name"
                    />
                  </div>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="phone" className="flex items-center gap-2 text-sm font-medium">
                        <Phone className="h-4 w-4 text-muted-foreground" />
                        Telefone
                      </Label>
                      <Input
                        id="phone"
                        type="tel"
                        placeholder="+244 900 000 000"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        className="h-11"
                        data-testid="input-customer-phone"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="email" className="flex items-center gap-2 text-sm font-medium">
                        <Mail className="h-4 w-4 text-muted-foreground" />
                        Email
                      </Label>
                      <Input
                        id="email"
                        type="email"
                        placeholder="email@exemplo.com"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        className="h-11"
                        data-testid="input-customer-email"
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="address" className="flex items-center gap-2 text-sm font-medium">
                      <span className="text-muted-foreground">📍</span>
                      Endereço
                    </Label>
                    <Input
                      id="address"
                      placeholder="Rua, número, bairro..."
                      value={formData.address}
                      onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                      className="h-11"
                      data-testid="input-customer-address"
                    />
                  </div>
                </div>
                
                <DialogFooter className="gap-2 sm:gap-0">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setIsDialogOpen(false);
                      resetForm();
                    }}
                    className="h-11"
                    data-testid="button-cancel"
                  >
                    Cancelar
                  </Button>
                  <Button
                    type="submit"
                    disabled={createCustomerMutation.isPending || updateCustomerMutation.isPending}
                    className="h-11 min-w-[100px]"
                    data-testid="button-submit-customer"
                  >
                    {createCustomerMutation.isPending || updateCustomerMutation.isPending ? (
                      <>
                        <span className="mr-2">⏳</span>
                        Salvando...
                      </>
                    ) : (
                      <>
                        {editingCustomer ? '💾 Atualizar' : '✨ Criar'}
                      </>
                    )}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </motion.div>

        {/* Advanced KPI Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-4">
          {isLoading ? (
            <>
              {[...Array(4)].map((_, i) => (
                <Skeleton key={i} className="h-[140px] w-full rounded-lg" />
              ))}
            </>
          ) : (
            <>
              <AdvancedKpiCard
                title="Total de Clientes"
                value={stats?.totalCustomers || 0}
                icon={Users}
                sparklineData={customerSparkline}
                gradient="from-primary/10 via-primary/5 to-transparent"
                delay={0}
                data-testid="card-total-customers"
              />

              <AdvancedKpiCard
                title="Clientes Ativos"
                value={stats?.activeCustomers || 0}
                icon={UserCheck}
                change={stats?.activeCustomers && stats?.totalCustomers ? ((stats.activeCustomers / stats.totalCustomers) * 100 - 100) : undefined}
                changeLabel="taxa de atividade"
                gradient="from-success/10 via-success/5 to-transparent"
                delay={0.1}
                data-testid="card-active-customers"
              />

              <AdvancedKpiCard
                title="Valor Médio Vitalício"
                value={avgLifetimeValue}
                prefix="Kz "
                decimals={2}
                icon={DollarSign}
                gradient="from-warning/10 via-warning/5 to-transparent"
                delay={0.2}
                data-testid="card-avg-lifetime-value"
              />

              <AdvancedKpiCard
                title="Frequência Média"
                value={avgOrderFrequency}
                decimals={1}
                suffix=" visitas"
                icon={Calendar}
                gradient="from-info/10 via-info/5 to-transparent"
                delay={0.3}
                data-testid="card-avg-frequency"
              />
            </>
          )}
        </div>

        {/* Top Customers & Tier Distribution */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card data-testid="card-top-customers">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Star className="h-5 w-5 text-primary" />
                  Top Clientes
                </CardTitle>
                <CardDescription>Clientes com maior gasto total</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {stats.topCustomers.slice(0, 5).map((customer, index) => (
                    <div key={customer.name} className="flex items-center justify-between p-3 rounded-lg border hover-elevate active-elevate-2">
                      <div className="flex items-center gap-3">
                        <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary font-bold text-sm">
                          {index + 1}
                        </div>
                        <div>
                          <p className="font-medium text-sm">{customer.name}</p>
                          <p className="text-xs text-muted-foreground">{customer.orderCount} pedidos</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-sm">{formatKwanza(parseFloat(customer.totalSpent))}</p>
                        <Badge variant="outline" className="text-xs">{customer.tier || 'bronze'}</Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card data-testid="card-tier-distribution">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-primary" />
                  Distribuição por Nível
                </CardTitle>
                <CardDescription>Clientes por tier de fidelidade</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {[
                    { tier: 'platina', label: 'Platina', color: 'bg-slate-600', icon: '💎' },
                    { tier: 'ouro', label: 'Ouro', color: 'bg-yellow-600', icon: '🥇' },
                    { tier: 'prata', label: 'Prata', color: 'bg-slate-400', icon: '🥈' },
                    { tier: 'bronze', label: 'Bronze', color: 'bg-orange-600', icon: '🥉' },
                  ].map((t) => {
                    const count = customers.filter(c => (c.tier || 'bronze') === t.tier).length;
                    const percentage = customers.length > 0 ? (count / customers.length) * 100 : 0;
                    return (
                      <div key={t.tier} className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                          <div className="flex items-center gap-2">
                            <span>{t.icon}</span>
                            <span className="font-medium">{t.label}</span>
                          </div>
                          <span className="font-bold">{count}</span>
                        </div>
                        <div className="h-2 bg-muted rounded-full overflow-hidden">
                          <div
                            className={`h-full ${t.color} transition-all duration-500`}
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Activity Feed & Customer List */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
                  <div>
                    <CardTitle>Lista de Clientes</CardTitle>
                    <CardDescription>
                      {filteredCustomers.length} cliente{filteredCustomers.length !== 1 ? 's' : ''} cadastrado{filteredCustomers.length !== 1 ? 's' : ''}
                    </CardDescription>
                  </div>
                  <div className="relative w-full sm:w-64">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Buscar clientes..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-9"
                      data-testid="input-search-customers"
                    />
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="all" className="w-full">
                  <TabsList className="grid w-full grid-cols-4 mb-4">
                    <TabsTrigger value="all" className="text-xs">Todos</TabsTrigger>
                    <TabsTrigger value="bronze" className="text-xs">Bronze</TabsTrigger>
                    <TabsTrigger value="prata" className="text-xs">Prata</TabsTrigger>
                    <TabsTrigger value="ouro" className="text-xs">Ouro+</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="all" className="space-y-3">
                    {isLoading ? (
                      <div className="space-y-3">
                        {[...Array(3)].map((_, i) => (
                          <Skeleton key={i} className="h-[120px] w-full rounded-lg" />
                        ))}
                      </div>
                    ) : filteredCustomers.length === 0 ? (
                      <div className="text-center py-8 text-muted-foreground">
                        {searchQuery ? 'Nenhum cliente encontrado' : 'Nenhum cliente cadastrado'}
                      </div>
                    ) : (
                      filteredCustomers.map((customer) => (
                        <motion.div
                          key={customer.id}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          className="flex items-center justify-between p-4 rounded-lg border hover-elevate active-elevate-2"
                          data-testid={`card-customer-${customer.id}`}
                        >
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <h3 className="font-semibold text-base">{customer.name}</h3>
                              <Badge className={getTierColor(customer.tier || 'bronze')} data-testid={`badge-tier-${customer.id}`}>
                                {(customer.tier || 'bronze').toUpperCase()}
                              </Badge>
                            </div>
                            <div className="space-y-1">
                              {customer.phone && (
                                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                  <Phone className="h-3.5 w-3.5" />
                                  <span>{customer.phone}</span>
                                </div>
                              )}
                              {customer.email && (
                                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                  <Mail className="h-3.5 w-3.5" />
                                  <span>{customer.email}</span>
                                </div>
                              )}
                              <div className="flex flex-wrap gap-4 mt-2 pt-2 border-t">
                                <span className="flex items-center gap-1 text-sm">
                                  <Award className="h-3.5 w-3.5 text-primary" />
                                  <span className="font-medium">{customer.loyaltyPoints}</span>
                                  <span className="text-muted-foreground">pts</span>
                                </span>
                                <span className="text-sm">
                                  <span className="font-medium">{customer.visitCount}</span>
                                  <span className="text-muted-foreground"> visitas</span>
                                </span>
                                <span className="text-sm">
                                  <span className="font-medium">{formatKwanza(parseFloat(customer.totalSpent || '0'))}</span>
                                  <span className="text-muted-foreground"> total</span>
                                </span>
                              </div>
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => openEditDialog(customer)}
                              data-testid={`button-edit-${customer.id}`}
                            >
                              Editar
                            </Button>
                            <Button
                              variant="outline"
                              size="icon"
                              onClick={() => {
                                if (confirm(`Tem certeza que deseja deletar ${customer.name}?`)) {
                                  deleteCustomerMutation.mutate(customer.id);
                                }
                              }}
                              data-testid={`button-delete-${customer.id}`}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </motion.div>
                      ))
                    )}
                  </TabsContent>

                  {['bronze', 'prata', 'ouro'].map((tier) => (
                    <TabsContent key={tier} value={tier} className="space-y-3">
                      {filteredCustomers
                        .filter(c => tier === 'ouro' ? ['ouro', 'platina'].includes(c.tier || 'bronze') : (c.tier || 'bronze') === tier)
                        .map((customer) => (
                          <motion.div
                            key={customer.id}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="flex items-center justify-between p-4 rounded-lg border hover-elevate active-elevate-2"
                            data-testid={`card-customer-${customer.id}`}
                          >
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                <h3 className="font-semibold text-base">{customer.name}</h3>
                                <Badge className={getTierColor(customer.tier || 'bronze')} data-testid={`badge-tier-${customer.id}`}>
                                  {(customer.tier || 'bronze').toUpperCase()}
                                </Badge>
                              </div>
                              <div className="flex flex-wrap gap-4 mt-2">
                                <span className="flex items-center gap-1 text-sm">
                                  <Award className="h-3.5 w-3.5 text-primary" />
                                  <span className="font-medium">{customer.loyaltyPoints} pts</span>
                                </span>
                                <span className="text-sm">
                                  <span className="font-medium">{customer.visitCount} visitas</span>
                                </span>
                                <span className="text-sm">
                                  <span className="font-medium">{formatKwanza(parseFloat(customer.totalSpent || '0'))}</span>
                                </span>
                              </div>
                            </div>
                            <div className="flex gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => openEditDialog(customer)}
                                data-testid={`button-edit-${customer.id}`}
                              >
                                Editar
                              </Button>
                              <Button
                                variant="outline"
                                size="icon"
                                onClick={() => {
                                  if (confirm(`Tem certeza que deseja deletar ${customer.name}?`)) {
                                    deleteCustomerMutation.mutate(customer.id);
                                  }
                                }}
                                data-testid={`button-delete-${customer.id}`}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </motion.div>
                        ))}
                    </TabsContent>
                  ))}
                </Tabs>
              </CardContent>
            </Card>
          </div>

          {/* Activity Feed */}
          <div>
            <ActivityFeed
              activities={recentActivities}
              title="Atividade de Clientes"
              maxHeight={600}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
