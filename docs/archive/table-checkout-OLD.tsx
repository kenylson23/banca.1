import { useState, useEffect } from "react";
import { useParams, useLocation } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, Users, Receipt, CreditCard, CheckCircle2, Clock, ShoppingBag, Percent, Printer, Tag, Gift, Sparkles, TrendingUp, DollarSign, QrCode, Zap } from "lucide-react";
import { BillSplitPanel } from "@/components/BillSplitPanel";
import { PaymentDialog } from "@/components/PaymentDialog";
import { PrintOrder } from "@/components/PrintOrder";
import { PrintInvoice } from "@/components/PrintInvoice";
import { useToast } from "@/hooks/use-toast";
import { formatKwanza } from "@/lib/formatters";
import { apiRequest } from "@/lib/queryClient";
import { cn } from "@/lib/utils";

export default function TableCheckout() {
  const { id } = useParams<{ id: string }>();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  // Get query params
  const searchParams = new URLSearchParams(window.location.search);
  const guestIdFromUrl = searchParams.get('guestId');
  const fromParam = searchParams.get('from') || 'tables';
  
  const [paymentDialogOpen, setPaymentDialogOpen] = useState(false);
  const [activeTab, setActiveTab] = useState(guestIdFromUrl ? 'split' : 'general');
  
  // Adjustment states
  const [discountValue, setDiscountValue] = useState('0');
  const [discountType, setDiscountType] = useState<'valor' | 'percentual'>('valor');
  const [serviceCharge, setServiceCharge] = useState('0');
  
  // Coupon states
  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState<any>(null);
  
  // Loyalty states
  const [selectedCustomerId, setSelectedCustomerId] = useState<string>('');
  const [loyaltyPointsToRedeem, setLoyaltyPointsToRedeem] = useState('0');

  // Fetch tables with orders
  const { data: tablesData, isLoading } = useQuery({
    queryKey: ['/api/tables/with-orders'],
    enabled: !!id,
  });

  // Find specific table
  const table = tablesData?.find((t: any) => t.id === id);

  // Fetch orders by guest
  const { data: ordersByGuestData } = useQuery({
    queryKey: [`/api/tables/${id}/orders-by-guest`],
    enabled: !!id && !!table?.currentSessionId,
  });
  
  // Fetch customers for loyalty
  const { data: customers = [] } = useQuery<any[]>({
    queryKey: ['/api/customers'],
  });
  
  // Fetch loyalty program
  const { data: loyaltyProgram } = useQuery<any>({
    queryKey: ['/api/loyalty-program'],
  });

  const ordersByGuest = ordersByGuestData?.ordersByGuest || [];
  const anonymousOrders = ordersByGuestData?.anonymousOrders || [];

  // Calculate totals
  const totalAmount = Number(table?.totalAmount || 0);
  const paidAmount = Number(table?.paidAmount || 0);
  const hasGuests = ordersByGuest.length > 0;
  const allGuestsPaid = hasGuests && ordersByGuest.every((og: any) => og.guest.status === 'pago');
  
  // Get all items from all orders
  const allItems = ordersByGuest.flatMap((og: any) => 
    (og.orders || []).flatMap((order: any) => 
      (order.items || []).map((item: any) => ({
        ...item,
        guestName: og.guest.name || `Cliente ${og.guest.guestNumber}`
      }))
    )
  );
  
  // Get selected customer
  const selectedCustomer = customers.find((c: any) => c.id === selectedCustomerId);
  
  // Calculate adjusted total
  const calculateAdjustedTotal = () => {
    let adjusted = totalAmount;
    const discount = parseFloat(discountValue) || 0;
    const serviceChargeVal = parseFloat(serviceCharge) || 0;
    
    // Apply manual discount
    if (discountType === 'percentual') {
      adjusted -= (adjusted * discount) / 100;
    } else {
      adjusted -= discount;
    }
    
    // Apply service charge
    adjusted += (adjusted * serviceChargeVal) / 100;
    
    // Apply coupon discount
    if (appliedCoupon) {
      if (appliedCoupon.discountType === 'percentual') {
        adjusted -= (adjusted * parseFloat(appliedCoupon.discountValue)) / 100;
      } else {
        adjusted -= parseFloat(appliedCoupon.discountValue);
      }
    }
    
    // Apply loyalty points (1 point = 1 currency unit)
    const pointsValue = parseFloat(loyaltyPointsToRedeem) || 0;
    adjusted -= pointsValue;
    
    return Math.max(0, adjusted);
  };
  
  const adjustedTotal = calculateAdjustedTotal();

  // Apply coupon mutation
  const applyCouponMutation = useMutation({
    mutationFn: async (code: string) => {
      const res = await apiRequest('POST', `/api/orders/${table?.orders?.[0]?.id}/apply-coupon`, { code });
      return await res.json();
    },
    onSuccess: (data) => {
      setAppliedCoupon(data.coupon);
      toast({ 
        title: 'Cupom aplicado', 
        description: `${data.coupon.code} - ${data.coupon.description}` 
      });
    },
    onError: (error: Error) => {
      toast({ 
        title: 'Erro ao aplicar cupom', 
        description: error.message, 
        variant: 'destructive' 
      });
    }
  });
  
  // Redeem loyalty points mutation
  const redeemPointsMutation = useMutation({
    mutationFn: async (points: number) => {
      const res = await apiRequest('POST', `/api/orders/${table?.orders?.[0]?.id}/redeem-points`, { 
        customerId: selectedCustomerId,
        points 
      });
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/customers'] });
      toast({ 
        title: 'Pontos resgatados', 
        description: `${loyaltyPointsToRedeem} pontos aplicados como desconto` 
      });
    },
    onError: (error: Error) => {
      toast({ 
        title: 'Erro ao resgatar pontos', 
        description: error.message, 
        variant: 'destructive' 
      });
    }
  });

  // Payment mutation for general checkout
  const recordPaymentMutation = useMutation({
    mutationFn: async (data: { amount: string; paymentMethod: string }) => {
      const res = await fetch(`/api/tables/${id}/record-payment`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error(await res.text());
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/tables/with-orders'] });
      queryClient.invalidateQueries({ queryKey: ['/api/tables/open'] });
      queryClient.invalidateQueries({ queryKey: [`/api/tables/${id}/orders-by-guest`] });
      toast({ 
        title: 'Pagamento registrado', 
        description: 'Mesa fechada com sucesso.' 
      });
      // Redirect back
      setLocation(`/${fromParam}`);
    },
    onError: (error: Error) => {
      toast({ 
        title: 'Erro', 
        description: error.message, 
        variant: 'destructive' 
      });
    }
  });

  const handleGeneralPayment = async (paymentMethod: string) => {
    await recordPaymentMutation.mutateAsync({
      amount: adjustedTotal.toFixed(2),
      paymentMethod,
      discount: parseFloat(discountValue) > 0 ? discountValue : undefined,
      discountType: parseFloat(discountValue) > 0 ? discountType : undefined,
      serviceCharge: parseFloat(serviceCharge) > 0 ? serviceCharge : undefined,
    });
    setPaymentDialogOpen(false);
  };

  if (isLoading) {
    return (
      <div className="container mx-auto p-4">
        <div className="text-center">Carregando...</div>
      </div>
    );
  }

  if (!table) {
    return (
      <div className="container mx-auto p-4">
        <Card>
          <CardContent className="py-8 text-center">
            <p className="text-muted-foreground">Mesa não encontrada</p>
            <Button onClick={() => setLocation('/tables')} className="mt-4">
              Voltar
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const guestData = guestIdFromUrl 
    ? ordersByGuest.find((og: any) => og.guest.id === guestIdFromUrl)
    : null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
      {/* Modern Glassmorphic Header */}
      <div className="sticky top-0 z-50 backdrop-blur-xl bg-white/70 dark:bg-slate-950/70 border-b border-white/20 dark:border-slate-800/50 shadow-lg shadow-black/5">
        <div className="container mx-auto px-4 py-4 max-w-7xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button 
                variant="ghost" 
                size="icon"
                onClick={() => setLocation(`/${fromParam}`)}
                className="rounded-full hover:bg-white/50 dark:hover:bg-slate-800/50"
              >
                <ArrowLeft className="h-5 w-5" />
              </Button>
              
              <div>
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-2xl blur-lg opacity-50 animate-pulse"></div>
                    <Badge className="relative bg-gradient-to-r from-blue-500 to-indigo-500 text-white border-0 px-4 py-2 text-lg font-bold shadow-lg">
                      Mesa {table.number}
                    </Badge>
                  </div>
                  <Separator orientation="vertical" className="h-8" />
                  <div className="text-sm text-muted-foreground flex items-center gap-2">
                    <Users className="h-4 w-4" />
                    {table.capacity} lugares
                  </div>
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              {/* Quick Action Buttons */}
              {table.orders && table.orders.length > 0 && (
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" className="rounded-full bg-white/50 dark:bg-slate-800/50 backdrop-blur hover:scale-105 transition-transform">
                    <QrCode className="h-4 w-4 mr-2" />
                    QR Code
                  </Button>
                  <PrintOrder order={table.orders[0]} variant="outline" size="sm" />
                  <PrintInvoice order={table.orders[0]} variant="outline" size="sm" />
                </div>
              )}
              
              {/* Total Display - Modern Card */}
              <Card className="bg-gradient-to-br from-green-500 to-emerald-600 border-0 shadow-2xl shadow-green-500/20">
                <CardContent className="p-4">
                  <div className="text-white/80 text-xs font-medium flex items-center gap-1 mb-1">
                    <DollarSign className="h-3 w-3" />
                    Total da Mesa
                  </div>
                  <div className="text-2xl font-black text-white tracking-tight">
                    {formatKwanza(totalAmount)}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
      
      <div className="container mx-auto px-4 py-8 max-w-7xl">

      {/* Modern Alert Banners */}
      {guestIdFromUrl && guestData && (
        <div className="mb-6 relative overflow-hidden rounded-2xl bg-gradient-to-r from-blue-500/10 via-blue-500/5 to-transparent border border-blue-500/20 backdrop-blur">
          <div className="absolute inset-0 bg-grid-white/5"></div>
          <div className="relative px-6 py-4">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-xl bg-blue-500/20 backdrop-blur">
                <Users className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
              <div className="flex-1">
                <div className="font-bold text-blue-900 dark:text-blue-100 flex items-center gap-2">
                  <Sparkles className="h-4 w-4" />
                  Checkout Individual
                </div>
                <div className="text-sm text-blue-700 dark:text-blue-300 mt-1">
                  {guestData.guest.name || `Cliente ${guestData.guest.guestNumber}`} • {formatKwanza(guestData.subtotal)}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {paidAmount > 0 && paidAmount < totalAmount && (
        <div className="mb-6 relative overflow-hidden rounded-2xl bg-gradient-to-r from-orange-500/10 via-orange-500/5 to-transparent border border-orange-500/20 backdrop-blur">
          <div className="absolute inset-0 bg-grid-white/5"></div>
          <div className="relative px-6 py-4">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-xl bg-orange-500/20 backdrop-blur">
                <TrendingUp className="h-6 w-6 text-orange-600 dark:text-orange-400" />
              </div>
              <div className="flex-1">
                <div className="font-bold text-orange-900 dark:text-orange-100">
                  Pagamento Parcial em Andamento
                </div>
                <div className="text-sm text-orange-700 dark:text-orange-300 mt-1 flex items-center gap-3">
                  <span className="flex items-center gap-1">
                    <CheckCircle2 className="h-4 w-4" />
                    Pago: {formatKwanza(paidAmount)}
                  </span>
                  <Separator orientation="vertical" className="h-4" />
                  <span className="flex items-center gap-1">
                    <Clock className="h-4 w-4" />
                    Falta: {formatKwanza(totalAmount - paidAmount)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modern Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {/* Card 1: Clientes */}
        <div className="group relative">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-2xl blur-xl opacity-20 group-hover:opacity-30 transition-opacity"></div>
          <Card className="relative bg-white/80 dark:bg-slate-900/80 backdrop-blur border-white/20 dark:border-slate-800/50 shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-1">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-500 shadow-lg shadow-blue-500/30">
                  <Users className="h-6 w-6 text-white" />
                </div>
                <Badge variant="outline" className="bg-blue-500/10 text-blue-700 dark:text-blue-300 border-blue-500/20">
                  Ativo
                </Badge>
              </div>
              <div>
                <div className="text-sm font-medium text-muted-foreground mb-1">Total de Clientes</div>
                <div className="text-4xl font-black bg-gradient-to-br from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                  {ordersByGuest.length}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
        
        {/* Card 2: Pagos */}
        <div className="group relative">
          <div className="absolute inset-0 bg-gradient-to-br from-green-500 to-emerald-500 rounded-2xl blur-xl opacity-20 group-hover:opacity-30 transition-opacity"></div>
          <Card className="relative bg-white/80 dark:bg-slate-900/80 backdrop-blur border-white/20 dark:border-slate-800/50 shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-1">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 rounded-xl bg-gradient-to-br from-green-500 to-emerald-500 shadow-lg shadow-green-500/30">
                  <CheckCircle2 className="h-6 w-6 text-white" />
                </div>
                <Badge variant="outline" className="bg-green-500/10 text-green-700 dark:text-green-300 border-green-500/20">
                  Confirmado
                </Badge>
              </div>
              <div>
                <div className="text-sm font-medium text-muted-foreground mb-1">Pagamentos Concluídos</div>
                <div className="text-4xl font-black bg-gradient-to-br from-green-600 to-emerald-600 bg-clip-text text-transparent">
                  {ordersByGuest.filter((og: any) => og.guest.status === 'pago').length}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
        
        {/* Card 3: Pendentes */}
        <div className="group relative">
          <div className="absolute inset-0 bg-gradient-to-br from-orange-500 to-red-500 rounded-2xl blur-xl opacity-20 group-hover:opacity-30 transition-opacity"></div>
          <Card className="relative bg-white/80 dark:bg-slate-900/80 backdrop-blur border-white/20 dark:border-slate-800/50 shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-1">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 rounded-xl bg-gradient-to-br from-orange-500 to-red-500 shadow-lg shadow-orange-500/30">
                  <Clock className="h-6 w-6 text-white" />
                </div>
                <Badge variant="outline" className="bg-orange-500/10 text-orange-700 dark:text-orange-300 border-orange-500/20">
                  Aguardando
                </Badge>
              </div>
              <div>
                <div className="text-sm font-medium text-muted-foreground mb-1">Pagamentos Pendentes</div>
                <div className="text-4xl font-black bg-gradient-to-br from-orange-600 to-red-600 bg-clip-text text-transparent">
                  {ordersByGuest.filter((og: any) => og.guest.status !== 'pago').length}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Modern Checkout Tabs */}
      <div className="relative">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 via-blue-500/5 to-indigo-500/5 rounded-3xl blur-3xl"></div>
        <Card className="relative bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl border-white/20 dark:border-slate-800/50 shadow-2xl">
          <CardHeader className="border-b border-slate-200/50 dark:border-slate-800/50 bg-gradient-to-r from-slate-50/50 to-transparent dark:from-slate-900/50">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-gradient-to-br from-purple-500 to-indigo-500">
                <Zap className="h-5 w-5 text-white" />
              </div>
              <div>
                <CardTitle className="text-2xl">Processar Pagamento</CardTitle>
                <CardDescription className="text-base">
                  Escolha o método de checkout ideal para esta mesa
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-6">
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-2 mb-8 p-1 bg-slate-100/50 dark:bg-slate-800/50 backdrop-blur rounded-xl h-14">
                <TabsTrigger 
                  value="general" 
                  disabled={allGuestsPaid}
                  className="rounded-lg data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-500 data-[state=active]:to-indigo-500 data-[state=active]:text-white data-[state=active]:shadow-lg data-[state=active]:shadow-purple-500/30 transition-all duration-200"
                >
                  <Receipt className="h-5 w-5 mr-2" />
                  <span className="font-semibold">Pagamento Geral</span>
                </TabsTrigger>
                <TabsTrigger 
                  value="split"
                  className="rounded-lg data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-cyan-500 data-[state=active]:text-white data-[state=active]:shadow-lg data-[state=active]:shadow-blue-500/30 transition-all duration-200"
                >
                  <Users className="h-5 w-5 mr-2" />
                  <span className="font-semibold">Divisão Avançada</span>
                </TabsTrigger>
              </TabsList>

            {/* Tab 1: General Payment */}
            <TabsContent value="general" className="space-y-6">
              {/* Items List - Modern Design */}
              <div className="relative group">
                <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/10 to-green-500/10 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
                <Card className="relative bg-white/50 dark:bg-slate-900/50 backdrop-blur border-slate-200/50 dark:border-slate-800/50">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-gradient-to-br from-emerald-500 to-green-500">
                          <ShoppingBag className="h-5 w-5 text-white" />
                        </div>
                        <div>
                          <CardTitle className="text-lg">Itens Consumidos</CardTitle>
                          <CardDescription className="text-sm">
                            {allItems.length} {allItems.length === 1 ? 'item' : 'itens'} no pedido
                          </CardDescription>
                        </div>
                      </div>
                      <Badge variant="outline" className="bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/20">
                        {allItems.length}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <ScrollArea className="max-h-[320px] pr-4">
                      <div className="space-y-3">
                        {allItems.map((item: any, index: number) => (
                          <div 
                            key={`${item.id}-${index}`} 
                            className="group/item flex items-center justify-between p-3 rounded-xl hover:bg-slate-100/50 dark:hover:bg-slate-800/50 transition-all border border-transparent hover:border-slate-200 dark:hover:border-slate-700"
                          >
                            <div className="flex items-center gap-3 flex-1">
                              <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-500 to-green-500 text-white font-bold text-sm shadow-lg shadow-emerald-500/20">
                                {item.quantity}×
                              </div>
                              <div className="flex-1">
                                <div className="font-semibold text-slate-900 dark:text-slate-100">
                                  {item.menuItemName}
                                </div>
                                <div className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                                  <Users className="h-3 w-3" />
                                  {item.guestName}
                                </div>
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="font-bold text-lg text-slate-900 dark:text-slate-100">
                                {formatKwanza(item.totalPrice)}
                              </div>
                              <div className="text-xs text-muted-foreground">
                                {formatKwanza(parseFloat(item.totalPrice) / item.quantity)} cada
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </ScrollArea>
                    
                    <Separator className="my-4" />
                    
                    <div className="flex items-center justify-between p-4 rounded-xl bg-gradient-to-r from-slate-100 to-slate-50 dark:from-slate-800 dark:to-slate-800/50">
                      <span className="text-lg font-semibold text-slate-700 dark:text-slate-300">Subtotal:</span>
                      <span className="text-2xl font-black text-slate-900 dark:text-slate-100">{formatKwanza(totalAmount)}</span>
                    </div>
                  </CardContent>
                </Card>
              </div>
              
              {/* Adjustments - Modern Design */}
              <div className="relative group">
                <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 to-pink-500/10 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
                <Card className="relative bg-white/50 dark:bg-slate-900/50 backdrop-blur border-slate-200/50 dark:border-slate-800/50">
                  <CardHeader className="pb-3">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500">
                        <Percent className="h-5 w-5 text-white" />
                      </div>
                      <div>
                        <CardTitle className="text-lg">Ajustes de Valor</CardTitle>
                        <CardDescription className="text-sm">
                          Personalize descontos e taxas adicionais
                        </CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-5">
                    {/* Discount */}
                    <div className="space-y-3">
                      <Label className="text-sm font-semibold flex items-center gap-2">
                        <Tag className="h-4 w-4 text-green-500" />
                        Desconto
                      </Label>
                      <div className="flex gap-3">
                        <div className="flex-1 relative">
                          <Input
                            type="number"
                            step="0.01"
                            value={discountValue}
                            onChange={(e) => setDiscountValue(e.target.value)}
                            placeholder="0.00"
                            className="h-12 text-lg font-semibold pl-4 pr-12 rounded-xl border-2 focus:border-green-500 transition-colors"
                          />
                          <div className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                            {discountType === 'percentual' ? '%' : 'Kz'}
                          </div>
                        </div>
                        <Select value={discountType} onValueChange={(v: 'valor' | 'percentual') => setDiscountType(v)}>
                          <SelectTrigger className="w-[140px] h-12 rounded-xl border-2">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="valor">
                              <span className="flex items-center gap-2">
                                <DollarSign className="h-4 w-4" />
                                Valor
                              </span>
                            </SelectItem>
                            <SelectItem value="percentual">
                              <span className="flex items-center gap-2">
                                <Percent className="h-4 w-4" />
                                Percentual
                              </span>
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    
                    <Separator />
                    
                    {/* Service Charge */}
                    <div className="space-y-3">
                      <Label className="text-sm font-semibold flex items-center gap-2">
                        <TrendingUp className="h-4 w-4 text-blue-500" />
                        Taxa de Serviço (%)
                      </Label>
                      <div className="relative">
                        <Input
                          type="number"
                          step="0.01"
                          value={serviceCharge}
                          onChange={(e) => setServiceCharge(e.target.value)}
                          placeholder="0.00"
                          className="h-12 text-lg font-semibold pl-4 pr-12 rounded-xl border-2 focus:border-blue-500 transition-colors"
                        />
                        <div className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                          %
                        </div>
                      </div>
                    </div>
                  
                    {/* Preview - Modern Summary */}
                    {(parseFloat(discountValue) > 0 || parseFloat(serviceCharge) > 0 || appliedCoupon || parseFloat(loyaltyPointsToRedeem) > 0) && (
                      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-900 to-slate-800 dark:from-slate-950 dark:to-slate-900 p-6 space-y-3 border border-slate-700/50 shadow-2xl">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-purple-500/20 to-pink-500/20 blur-3xl rounded-full"></div>
                        
                        <div className="relative space-y-3">
                          <div className="flex items-center gap-2 mb-4">
                            <Sparkles className="h-5 w-5 text-yellow-400" />
                            <span className="text-sm font-bold text-white/90">Resumo do Pagamento</span>
                          </div>
                          
                          <div className="flex justify-between text-sm text-white/70">
                            <span>Subtotal:</span>
                            <span className="font-semibold text-white">{formatKwanza(totalAmount)}</span>
                          </div>
                          
                          {parseFloat(discountValue) > 0 && (
                            <div className="flex justify-between text-sm">
                              <span className="text-green-400 flex items-center gap-1">
                                <Tag className="h-3 w-3" />
                                Desconto ({discountType === 'percentual' ? `${discountValue}%` : 'manual'}):
                              </span>
                              <span className="font-bold text-green-400">-{formatKwanza(
                                discountType === 'percentual'
                                  ? (totalAmount * parseFloat(discountValue)) / 100
                                  : parseFloat(discountValue)
                              )}</span>
                            </div>
                          )}
                          
                          {parseFloat(serviceCharge) > 0 && (
                            <div className="flex justify-between text-sm">
                              <span className="text-orange-400 flex items-center gap-1">
                                <TrendingUp className="h-3 w-3" />
                                Taxa de Serviço ({serviceCharge}%):
                              </span>
                              <span className="font-bold text-orange-400">+{formatKwanza((totalAmount * parseFloat(serviceCharge)) / 100)}</span>
                            </div>
                          )}
                          
                          {appliedCoupon && (
                            <div className="flex justify-between text-sm">
                              <span className="text-green-400 flex items-center gap-1">
                                <Gift className="h-3 w-3" />
                                Cupom {appliedCoupon.code}:
                              </span>
                              <span className="font-bold text-green-400">-{formatKwanza(
                                appliedCoupon.discountType === 'percentual'
                                  ? (totalAmount * parseFloat(appliedCoupon.discountValue)) / 100
                                  : parseFloat(appliedCoupon.discountValue)
                              )}</span>
                            </div>
                          )}
                          
                          {parseFloat(loyaltyPointsToRedeem) > 0 && (
                            <div className="flex justify-between text-sm">
                              <span className="text-blue-400 flex items-center gap-1">
                                <Sparkles className="h-3 w-3" />
                                Pontos ({loyaltyPointsToRedeem}):
                              </span>
                              <span className="font-bold text-blue-400">-{formatKwanza(parseFloat(loyaltyPointsToRedeem))}</span>
                            </div>
                          )}
                          
                          <Separator className="bg-white/10" />
                          
                          <div className="flex justify-between items-center pt-2">
                            <span className="text-lg font-bold text-white flex items-center gap-2">
                              <Zap className="h-5 w-5 text-yellow-400" />
                              Total Final:
                            </span>
                            <span className="text-3xl font-black bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent">
                              {formatKwanza(adjustedTotal)}
                            </span>
                          </div>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
              
              {/* Coupons - Modern Design */}
              <div className="relative group">
                <div className="absolute inset-0 bg-gradient-to-br from-pink-500/10 to-rose-500/10 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
                <Card className="relative bg-white/50 dark:bg-slate-900/50 backdrop-blur border-slate-200/50 dark:border-slate-800/50">
                  <CardHeader className="pb-3">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-gradient-to-br from-pink-500 to-rose-500">
                        <Gift className="h-5 w-5 text-white" />
                      </div>
                      <div>
                        <CardTitle className="text-lg">Cupom de Desconto</CardTitle>
                        <CardDescription className="text-sm">
                          Aplique cupons promocionais aqui
                        </CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex gap-3">
                      <div className="flex-1 relative">
                        <Input
                          value={couponCode}
                          onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                          placeholder="DIGITE-O-CODIGO"
                          disabled={!!appliedCoupon}
                          className="h-12 text-lg font-bold tracking-wider uppercase pl-4 rounded-xl border-2 focus:border-pink-500 transition-colors"
                        />
                        {!appliedCoupon && (
                          <Tag className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                        )}
                      </div>
                      {appliedCoupon ? (
                        <Button 
                          variant="outline"
                          size="lg"
                          onClick={() => {
                            setAppliedCoupon(null);
                            setCouponCode('');
                          }}
                          className="h-12 px-6 rounded-xl border-2 hover:bg-red-50 dark:hover:bg-red-950/20 hover:border-red-500 hover:text-red-600 transition-all"
                        >
                          Remover
                        </Button>
                      ) : (
                        <Button
                          size="lg"
                          onClick={() => applyCouponMutation.mutate(couponCode)}
                          disabled={!couponCode || applyCouponMutation.isPending}
                          className="h-12 px-6 rounded-xl bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 shadow-lg shadow-pink-500/30 transition-all hover:scale-105"
                        >
                          {applyCouponMutation.isPending ? (
                            <>
                              <Clock className="h-4 w-4 mr-2 animate-spin" />
                              Verificando...
                            </>
                          ) : (
                            <>
                              <Sparkles className="h-4 w-4 mr-2" />
                              Aplicar
                            </>
                          )}
                        </Button>
                      )}
                    </div>
                    
                    {appliedCoupon && (
                      <div className="relative overflow-hidden rounded-xl bg-gradient-to-r from-green-500/10 to-emerald-500/10 border border-green-500/20 p-4">
                        <div className="absolute top-0 right-0 w-24 h-24 bg-green-500/10 rounded-full blur-2xl"></div>
                        <div className="relative space-y-2">
                          <div className="flex items-center gap-2">
                            <div className="p-1.5 rounded-lg bg-green-500/20">
                              <Tag className="h-4 w-4 text-green-600 dark:text-green-400" />
                            </div>
                            <span className="font-black text-green-700 dark:text-green-400 tracking-wider">
                              {appliedCoupon.code}
                            </span>
                            <Badge className="bg-green-500/20 text-green-700 dark:text-green-300 border-green-500/30">
                              Ativo
                            </Badge>
                          </div>
                          <p className="text-sm text-green-700 dark:text-green-300 font-medium">
                            {appliedCoupon.description}
                          </p>
                          <div className="flex items-center gap-2 pt-1">
                            <Sparkles className="h-4 w-4 text-green-600 dark:text-green-400" />
                            <span className="text-sm font-bold text-green-700 dark:text-green-300">
                              Desconto: {appliedCoupon.discountType === 'percentual' 
                                ? `${appliedCoupon.discountValue}%` 
                                : formatKwanza(appliedCoupon.discountValue)}
                            </span>
                          </div>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
              
              {/* Customer Selection & Loyalty - Modern Design */}
              <div className="relative group">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-indigo-500/10 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
                <Card className="relative bg-white/50 dark:bg-slate-900/50 backdrop-blur border-slate-200/50 dark:border-slate-800/50">
                  <CardHeader className="pb-3">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-500">
                        <Users className="h-5 w-5 text-white" />
                      </div>
                      <div>
                        <CardTitle className="text-lg">Cliente & Fidelidade</CardTitle>
                        <CardDescription className="text-sm">
                          Associe um cliente e use pontos de fidelidade
                        </CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* Customer Selection */}
                    <div className="space-y-3">
                      <Label className="text-sm font-semibold flex items-center gap-2">
                        <Users className="h-4 w-4 text-blue-500" />
                        Selecionar Cliente
                      </Label>
                      <Select value={selectedCustomerId} onValueChange={setSelectedCustomerId}>
                        <SelectTrigger className="h-12 rounded-xl border-2 focus:border-blue-500 transition-colors">
                          <SelectValue placeholder="Selecione um cliente (opcional)..." />
                        </SelectTrigger>
                        <SelectContent>
                          {customers.map((customer: any) => (
                            <SelectItem key={customer.id} value={customer.id}>
                              <div className="flex items-center gap-2">
                                <Users className="h-4 w-4" />
                                <span>{customer.name}</span>
                                {customer.loyaltyPoints > 0 && (
                                  <Badge variant="outline" className="ml-2 bg-blue-500/10 text-blue-700 dark:text-blue-300 border-blue-500/20">
                                    {customer.loyaltyPoints} pts
                                  </Badge>
                                )}
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {selectedCustomerId && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setSelectedCustomerId("")}
                          className="mt-2"
                        >
                          Remover Cliente
                        </Button>
                      )}
                    </div>

                    {/* Loyalty Program Section */}
                    {loyaltyProgram?.isActive === 1 && selectedCustomer && (
                      <>
                        <Separator />
                        <div className="space-y-3">
                          <div className="flex items-center justify-between">
                            <Label className="text-sm font-semibold flex items-center gap-2">
                              <Gift className="h-4 w-4 text-yellow-500" />
                              Programa de Fidelidade
                            </Label>
                            <Badge className="bg-yellow-500/20 text-yellow-700 dark:text-yellow-300 border-yellow-500/30">
                              Ativo
                            </Badge>
                          </div>

                          {/* Available Points */}
                          <div className="relative overflow-hidden rounded-xl bg-gradient-to-r from-blue-500/10 to-indigo-500/10 border border-blue-500/20 p-4">
                            <div className="absolute top-0 right-0 w-24 h-24 bg-blue-500/10 rounded-full blur-2xl"></div>
                            <div className="relative flex items-center justify-between">
                              <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Pontos Disponíveis</span>
                              <span className="text-2xl font-black text-blue-600 dark:text-blue-400">
                                {selectedCustomer.loyaltyPoints || 0} pts
                              </span>
                            </div>
                            <p className="text-xs text-muted-foreground mt-2">
                              1 ponto = {formatKwanza(parseFloat(loyaltyProgram.currencyPerPoint || "1"))}
                            </p>
                          </div>

                          {/* Redeem Points */}
                          {selectedCustomer.loyaltyPoints >= (loyaltyProgram.minPointsToRedeem || 100) && (
                            <div className="space-y-3">
                              <Label className="text-sm font-semibold flex items-center gap-2">
                                <Sparkles className="h-4 w-4 text-purple-500" />
                                Resgatar Pontos (mín: {loyaltyProgram.minPointsToRedeem})
                              </Label>
                              <div className="flex gap-3">
                                <div className="flex-1 relative">
                                  <Input
                                    type="number"
                                    placeholder="Pontos"
                                    value={loyaltyPointsToRedeem === '0' ? '' : loyaltyPointsToRedeem}
                                    onChange={(e) => {
                                      const val = Math.min(
                                        parseInt(e.target.value) || 0,
                                        selectedCustomer.loyaltyPoints
                                      );
                                      setLoyaltyPointsToRedeem(val.toString());
                                    }}
                                    min={loyaltyProgram.minPointsToRedeem || 100}
                                    max={selectedCustomer.loyaltyPoints}
                                    className="h-12 text-lg font-semibold pl-4 pr-12 rounded-xl border-2 focus:border-purple-500 transition-colors"
                                  />
                                  <div className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">
                                    pts
                                  </div>
                                </div>
                                <Button
                                  size="lg"
                                  onClick={() => redeemPointsMutation.mutate(parseInt(loyaltyPointsToRedeem))}
                                  disabled={!loyaltyPointsToRedeem || parseInt(loyaltyPointsToRedeem) < (loyaltyProgram.minPointsToRedeem || 100) || redeemPointsMutation.isPending}
                                  className="h-12 px-6 rounded-xl bg-gradient-to-r from-purple-500 to-indigo-500 hover:from-purple-600 hover:to-indigo-600 shadow-lg shadow-purple-500/30 transition-all hover:scale-105"
                                >
                                  {redeemPointsMutation.isPending ? (
                                    <>
                                      <Clock className="h-4 w-4 mr-2 animate-spin" />
                                      Resgatando...
                                    </>
                                  ) : (
                                    <>
                                      <Sparkles className="h-4 w-4 mr-2" />
                                      Resgatar
                                    </>
                                  )}
                                </Button>
                              </div>
                              <p className="text-xs text-muted-foreground flex items-center gap-1">
                                <TrendingUp className="h-3 w-3" />
                                Desconto: {formatKwanza((parseInt(loyaltyPointsToRedeem) || 0) * parseFloat(loyaltyProgram.currencyPerPoint || "1"))}
                              </p>
                            </div>
                          )}

                          {/* Points to Earn */}
                          <div className="relative overflow-hidden rounded-xl bg-gradient-to-r from-green-500/10 to-emerald-500/10 border border-green-500/20 p-4">
                            <div className="absolute top-0 right-0 w-24 h-24 bg-green-500/10 rounded-full blur-2xl"></div>
                            <div className="relative flex items-center justify-between">
                              <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Pontos a Ganhar</span>
                              <span className="text-2xl font-black text-green-600 dark:text-green-400 flex items-center gap-1">
                                +{Math.floor(adjustedTotal * parseFloat(loyaltyProgram.pointsPerCurrency || "1"))} pts
                                <TrendingUp className="h-5 w-5" />
                              </span>
                            </div>
                          </div>
                        </div>
                      </>
                    )}
                  </CardContent>
                </Card>
              </div>
              
              {/* Modern Payment Button */}
              <div className="relative group mt-8">
                <div className="absolute inset-0 bg-gradient-to-r from-green-500 via-emerald-500 to-teal-500 rounded-2xl blur-xl opacity-50 group-hover:opacity-75 transition-opacity animate-pulse"></div>
                <Button 
                  size="lg" 
                  className="relative w-full h-16 text-lg font-bold rounded-2xl bg-gradient-to-r from-green-500 via-emerald-500 to-teal-500 hover:from-green-600 hover:via-emerald-600 hover:to-teal-600 shadow-2xl shadow-green-500/40 border-0 transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]"
                  onClick={() => setPaymentDialogOpen(true)}
                  disabled={recordPaymentMutation.isPending}
                >
                  <div className="flex items-center justify-center gap-3">
                    {recordPaymentMutation.isPending ? (
                      <>
                        <Clock className="h-6 w-6 animate-spin" />
                        <span>Processando...</span>
                      </>
                    ) : (
                      <>
                        <div className="p-2 rounded-lg bg-white/20 backdrop-blur">
                          <CreditCard className="h-5 w-5" />
                        </div>
                        <div className="flex flex-col items-start">
                          <span className="text-xs text-white/80 font-normal">Finalizar Pagamento</span>
                          <span className="text-xl font-black">
                            {parseFloat(discountValue) > 0 || parseFloat(serviceCharge) > 0
                              ? formatKwanza(adjustedTotal)
                              : formatKwanza(totalAmount)
                            }
                          </span>
                        </div>
                        <Zap className="h-6 w-6 ml-auto animate-pulse" />
                      </>
                    )}
                  </div>
                </Button>
              </div>
            </TabsContent>

            {/* Tab 2: Split Bill */}
            <TabsContent value="split" className="space-y-6">
              {table.currentSessionId ? (
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 via-cyan-500/5 to-teal-500/5 rounded-3xl blur-3xl"></div>
                  <div className="relative">
                    <BillSplitPanel
                      tableId={id!}
                      sessionId={table.currentSessionId}
                      totalAmount={totalAmount}
                      initialGuestId={guestIdFromUrl}
                    />
                  </div>
                </div>
              ) : (
                <Card className="bg-white/50 dark:bg-slate-900/50 backdrop-blur border-slate-200/50 dark:border-slate-800/50">
                  <CardContent className="py-12 text-center">
                    <div className="flex flex-col items-center gap-4">
                      <div className="p-4 rounded-2xl bg-slate-100 dark:bg-slate-800">
                        <Users className="h-12 w-12 text-muted-foreground" />
                      </div>
                      <div>
                        <p className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-1">
                          Nenhuma Sessão Ativa
                        </p>
                        <p className="text-sm text-muted-foreground">
                          Inicie uma sessão para usar a divisão de conta
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
      </div>
      
      {/* Modern Payment Dialog */}
      <PaymentDialog
        open={paymentDialogOpen}
        onOpenChange={setPaymentDialogOpen}
        totalAmount={adjustedTotal}
        paidAmount={paidAmount}
        isSubmitting={recordPaymentMutation.isPending}
        onSubmit={handleGeneralPayment}
        title="Pagamento Geral da Mesa"
      />
      </div>
    </div>
  );
}
