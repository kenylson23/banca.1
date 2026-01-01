import { useState, useMemo, useEffect } from "react";
import type { OrdersByGuestData } from "@shared/types";
import { useParams, useLocation } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { 
  ArrowLeft, 
  ArrowRight, 
  Check, 
  ShoppingBag, 
  Users, 
  Gift, 
  Settings, 
  CreditCard,
  Sparkles,
  TrendingUp,
  CheckCircle2,
  AlertCircle,
  X,
  Percent,
  Calculator,
  Banknote,
  Smartphone,
  Building,
  Receipt
} from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useToast } from "@/hooks/use-toast";
import { formatKwanza } from "@/lib/formatters";
import { apiRequest } from "@/lib/queryClient";
import { cn } from "@/lib/utils";
import { PaymentSuccessDialog } from "@/components/PaymentSuccessDialog";
import { CheckoutSummaryPanel } from "@/components/CheckoutSummaryPanel";

// Step definitions
const STEPS = [
  { id: 1, name: "Revisar", icon: ShoppingBag, description: "Itens e clientes" },
  { id: 2, name: "Benefícios", icon: Gift, description: "Cupons e pontos" },
  { id: 3, name: "Ajustes", icon: Settings, description: "Descontos e taxas" },
  { id: 4, name: "Pagamento", icon: CreditCard, description: "Finalizar" },
] as const;

export default function TableCheckoutV2() {
  const { id } = useParams<{ id: string }>();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  // Get query params
  const searchParams = new URLSearchParams(window.location.search);
  const fromParam = searchParams.get('from') || 'tables';
  const stepParam = parseInt(searchParams.get('step') || '1', 10);
  
  // 🎯 MELHORIA 8: Persistir desconto/taxa na URL
  const discountParam = searchParams.get('discount') || '';
  const discountTypeParam = searchParams.get('discountType') || 'valor';
  const serviceFeeParam = searchParams.get('serviceFee') || '';
  const serviceFeeTypeParam = searchParams.get('serviceFeeType') || 'percentual';
  
  // Wizard state - inicializa com o step da URL se válido
  const [currentStep, setCurrentStep] = useState(
    stepParam >= 1 && stepParam <= 4 ? stepParam : 1
  );
  
  // Helper para atualizar URL com todos os parâmetros
  const updateURL = (step: number, discount: string, discType: string, serviceFee: string, serviceFeeType: string) => {
    const currentUrl = new URL(window.location.href);
    currentUrl.searchParams.set('step', step.toString());
    
    // Persistir desconto se houver
    if (discount && parseFloat(discount) > 0) {
      currentUrl.searchParams.set('discount', discount);
      currentUrl.searchParams.set('discountType', discType);
    } else {
      currentUrl.searchParams.delete('discount');
      currentUrl.searchParams.delete('discountType');
    }
    
    // Persistir taxa de serviço se houver
    if (serviceFee && parseFloat(serviceFee) > 0) {
      currentUrl.searchParams.set('serviceFee', serviceFee);
      currentUrl.searchParams.set('serviceFeeType', serviceFeeType);
    } else {
      currentUrl.searchParams.delete('serviceFee');
      currentUrl.searchParams.delete('serviceFeeType');
    }
    
    window.history.replaceState({}, '', currentUrl.toString());
  };
  
  // Step 1: Items & Guests
  const [selectedGuestIds, setSelectedGuestIds] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'name' | 'total-desc' | 'total-asc' | 'status'>('name');
  
  // Step 2: Benefits
  const [selectedCustomerId, setSelectedCustomerId] = useState<string>('');
  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState<any>(null);
  const [loyaltyPointsToRedeem, setLoyaltyPointsToRedeem] = useState('');
  
  // Step 3: Adjustments - Initialize from URL params for persistence
  const [discountValue, setDiscountValue] = useState(discountParam || '');
  const [discountType, setDiscountType] = useState<'valor' | 'percentual'>((discountTypeParam as any) || 'valor');
  const [selectedServices, setSelectedServices] = useState<string[]>([]);
  const [manualServiceName, setManualServiceName] = useState('');
  const [manualServiceValue, setManualServiceValue] = useState(serviceFeeParam || '');
  const [manualServiceType, setManualServiceType] = useState<'valor' | 'percentual'>((serviceFeeTypeParam as any) || 'percentual');
  
  // Update URL when step or adjustments change
  useEffect(() => {
    updateURL(currentStep, discountValue, discountType, manualServiceValue, manualServiceType);
  }, [currentStep, discountValue, discountType, manualServiceValue, manualServiceType, updateURL]);
  
  // Step 4: Payment
  const [paymentMethod, setPaymentMethod] = useState<string>('');
  const [receivedAmount, setReceivedAmount] = useState('');
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [showSuccessDialog, setShowSuccessDialog] = useState(false);
  const [paymentData, setPaymentData] = useState<any>(null);
  
  // 🎯 MELHORIA 13: Confirmação ao recarregar página (somente se houver mudanças)
  useEffect(() => {
    const hasChanges = 
      selectedGuestIds.length > 0 ||
      (discountValue && parseFloat(discountValue) > 0) ||
      (manualServiceValue && parseFloat(manualServiceValue) > 0) ||
      paymentMethod !== '';
    
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (hasChanges && !showSuccessDialog) {
        e.preventDefault();
        e.returnValue = 'Você tem alterações não salvas. Deseja realmente sair?';
      }
    };
    
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [selectedGuestIds, discountValue, manualServiceValue, paymentMethod, showSuccessDialog]);
  
  // Fetch data
  const { data: tablesData, isLoading: loadingTables } = useQuery({
    queryKey: ['/api/tables/with-orders'],
  });
  
  const table = tablesData?.find((t: any) => t.id === id);
  
  // 🎯 SOLUÇÃO: Restaurar ajustes da sessão ao carregar
  useEffect(() => {
    if (table?.currentSessionId && tablesData) {
      // Buscar sessão para obter os ajustes salvos
      fetch(`/api/tables/${id}/sessions`)
        .then(res => res.json())
        .then((sessions: any[]) => {
          const currentSession = sessions.find((s: any) => s.id === table.currentSessionId);
          if (currentSession) {
            // Restaurar desconto
            if (currentSession.discount && parseFloat(currentSession.discount) > 0) {
              setDiscountValue(currentSession.discount);
              setDiscountType(currentSession.discountType || 'valor');
            }
            // Restaurar taxa de serviço
            if (currentSession.serviceCharge && parseFloat(currentSession.serviceCharge) > 0) {
              setManualServiceValue(currentSession.serviceCharge);
              setManualServiceType(currentSession.serviceChargeType || 'percentual');
            }
          }
        })
        .catch(err => console.error('Erro ao restaurar ajustes da sessão:', err));
    }
  }, [table?.currentSessionId, id, tablesData]);
  
  // 🎯 SOLUÇÃO: Salvar ajustes automaticamente quando mudarem
  useEffect(() => {
    if (table?.currentSessionId && (discountValue || manualServiceValue)) {
      const timeoutId = setTimeout(() => {
        // Debounce para não salvar a cada tecla
        fetch(`/api/tables/${id}/session-adjustments`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            discount: discountValue || '0',
            discountType,
            serviceCharge: manualServiceValue || '0',
            serviceChargeType: manualServiceType,
          }),
        }).catch(err => console.error('Erro ao salvar ajustes:', err));
      }, 1000); // Espera 1 segundo após a última mudança
      
      return () => clearTimeout(timeoutId);
    }
  }, [discountValue, discountType, manualServiceValue, manualServiceType, table?.currentSessionId, id]);
  
  const { data: ordersByGuestData, isLoading: loadingOrders } = useQuery<OrdersByGuestData>({
    queryKey: [`/api/tables/${id}/orders-by-guest`],
    enabled: !!id && !!table?.currentSessionId,
  });
  
  
  const { data: customers = [] } = useQuery<any[]>({
    queryKey: ['/api/customers'],
  });
  
  const { data: loyaltyProgram } = useQuery<any>({
    queryKey: ['/api/loyalty-program'],
  });
  
  const { data: availableCoupons = [] } = useQuery<any[]>({
    queryKey: ['/api/coupons/available', table?.restaurantId],
    enabled: !!table?.restaurantId,
  });
  
  const selectedCustomer = customers.find((c: any) => c.id === selectedCustomerId);
  
  // Mutations
  const applyCouponMutation = useMutation({
    mutationFn: async (code: string) => {
      const res = await apiRequest('POST', `/api/coupons/validate`, { 
        code,
        restaurantId: table?.restaurantId,
      });
      return res.json();
    },
    onSuccess: (data) => {
      setAppliedCoupon(data);
      toast({ 
        title: "Cupom aplicado!",
        description: `Você ganhou ${data.discountValue}${data.discountType === 'percentual' ? '%' : ' Kz'} de desconto`,
      });
    },
    onError: (error: any) => {
      toast({
        title: "Cupom inválido",
        description: error.message || "Cupom não encontrado ou expirado",
        variant: "destructive",
      });
    },
  });
  
  const redeemPointsMutation = useMutation({
    mutationFn: async (points: number) => {
      if (!selectedCustomerId) throw new Error('Cliente não selecionado');
      
      const res = await apiRequest('POST', `/api/loyalty/redeem`, { 
        customerId: selectedCustomerId,
        points,
      });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/customers'] });
      toast({ 
        title: "Pontos resgatados!",
        description: `${loyaltyPointsToRedeem} pontos resgatados com sucesso`,
      });
      setLoyaltyPointsToRedeem('');
    },
    onError: (error: any) => {
      toast({
        title: "Erro ao resgatar pontos",
        description: error.message || "Não foi possível resgatar os pontos",
        variant: "destructive",
      });
    },
  });
  
  const processPaymentMutation = useMutation({
    mutationFn: async () => {
      
      if (!table) {
        throw new Error('Mesa não encontrada');
      }
      
      if (!table.currentSessionId) {
        throw new Error('Nenhuma sessão ativa na mesa');
      }
      
      if (!paymentMethod) {
        throw new Error('Selecione um método de pagamento');
      }
      
      // Build services array
      const services: any[] = [];
      
      // Add automatic services
      availableServices.forEach((service: any) => {
        if (service.applyAutomatically === 1) {
          const afterDiscounts = Math.max(0, totalAmount - calculateTotals.totalDiscounts);
          const calculatedAmount = service.chargeType === 'percentual'
            ? afterDiscounts * (parseFloat(service.value) / 100)
            : parseFloat(service.value);
          
          services.push({
            serviceId: service.id,
            serviceName: service.name,
            chargeType: service.chargeType,
            value: service.value,
            calculatedAmount: calculatedAmount.toFixed(2),
          });
        }
      });
      
      // Add selected manual services
      selectedServices.forEach(serviceId => {
        const service = availableServices.find((s: any) => s.id === serviceId);
        if (service && service.applyAutomatically === 0) {
          const afterDiscounts = Math.max(0, totalAmount - calculateTotals.totalDiscounts);
          const calculatedAmount = service.chargeType === 'percentual'
            ? afterDiscounts * (parseFloat(service.value) / 100)
            : parseFloat(service.value);
          
          services.push({
            serviceId: service.id,
            serviceName: service.name,
            chargeType: service.chargeType,
            value: service.value,
            calculatedAmount: calculatedAmount.toFixed(2),
          });
        }
      });
      
      // Add manual service if defined
      if (manualServiceName && manualServiceValue && parseFloat(manualServiceValue) > 0) {
        const afterDiscounts = Math.max(0, totalAmount - calculateTotals.totalDiscounts);
        const calculatedAmount = manualServiceType === 'percentual'
          ? afterDiscounts * (parseFloat(manualServiceValue) / 100)
          : parseFloat(manualServiceValue);
        
        services.push({
          serviceId: null,
          serviceName: manualServiceName,
          chargeType: manualServiceType,
          value: manualServiceValue,
          calculatedAmount: calculatedAmount.toFixed(2),
        });
      }
      
      const payload = {
        tableId: id,
        sessionId: table.currentSessionId,
        amount: calculateTotals.finalTotal.toFixed(2),
        paymentMethod,
        services: services.length > 0 ? services : undefined,
        discount: discountValue ? discountValue : undefined,
        discountType: discountValue ? discountType : undefined,
        notes: receivedAmount ? `Valor recebido: ${parseFloat(receivedAmount).toFixed(2)}` : undefined,
        receivedAmount: receivedAmount ? parseFloat(receivedAmount) : undefined,
      };
      
      
      const res = await apiRequest('POST', `/api/tables/${id}/payment`, payload);
      
      return res.json();
    },
    onSuccess: (data) => {
      setPaymentData(data);
      setShowSuccessDialog(true);
      // Invalidar múltiplas queries para sincronizar tudo
      queryClient.invalidateQueries({ queryKey: ['/api/tables/with-orders'] });
      queryClient.invalidateQueries({ queryKey: ['/api/tables', id, 'payments'] });
      queryClient.invalidateQueries({ queryKey: ['/api/table-sessions'] });
      queryClient.invalidateQueries({ queryKey: [`/api/tables/${id}/orders-by-guest`] }); // Para TableDetailsDialog e QuickOrder
      queryClient.invalidateQueries({ queryKey: ['tables'] }); // Lista de mesas
      queryClient.invalidateQueries({ queryKey: [`/api/tables/${id}/guests`] }); // Guests
    },
    onError: (error: any) => {
      toast({
        title: "Erro ao processar pagamento",
        description: error.message || "Não foi possível processar o pagamento",
        variant: "destructive",
      });
    },
  });
  
  // Calculate totals (EXACT same structure as old checkout)
  const ordersByGuest = ordersByGuestData?.ordersByGuest || [];
  const anonymousOrders = ordersByGuestData?.anonymousOrders || [];
  
  
  // Filter guests based on selection (if any selected, show only those)
  const filteredOrdersByGuest = useMemo(() => 
    selectedGuestIds.length > 0
      ? ordersByGuest.filter((og: any) => selectedGuestIds.includes(og.guest.id))
      : ordersByGuest,
    [ordersByGuest, selectedGuestIds]
  );

  // Get all items from filtered orders
  const allItems = useMemo(() =>
    filteredOrdersByGuest.flatMap((og: any) => 
      (og.orders || []).flatMap((order: any) => 
        (order.items || []).map((item: any) => ({
          ...item,
          menuItemName: item.menuItem?.name || item.name || 'Item',
          totalPrice: (parseFloat(item.price || 0) * (item.quantity || 0)).toString(),
          guestName: og.guest.name || `Cliente ${og.guest.guestNumber}`,
          guestId: og.guest.id
        }))
      )
    ),
    [filteredOrdersByGuest]
  );
  
  // Calculate totals based on filtered selection
  const totalAmount = selectedGuestIds.length > 0
    ? filteredOrdersByGuest.reduce((sum: number, og: any) => sum + parseFloat(og.subtotal || 0), 0)
    : (ordersByGuestData?.totalAmount 
        ? Number(ordersByGuestData.totalAmount)
        : allItems.reduce((sum: number, item: any) => sum + parseFloat(item.totalPrice || 0), 0));
  
  const paidAmount = ordersByGuestData?.paidAmount 
    ? Number(ordersByGuestData.paidAmount)
    : 0;
  const hasGuests = ordersByGuest.length > 0;

  // Fetch applicable services based on order type and value (after totalAmount is calculated)
  const { data: availableServices = [] } = useQuery<any[]>({
    queryKey: ['/api/services/applicable', totalAmount],
    queryFn: async () => {
      const response = await apiRequest('POST', '/api/services/applicable', {
        orderType: 'mesa',
        orderValue: totalAmount,
      });
      return response.json();
    },
    enabled: totalAmount > 0,
  });
  
  const calculateTotals = useMemo(() => {
    let subtotal = totalAmount;
    let discounts = 0;
    let additions = 0;
    const breakdown: any[] = [];
    
    // 1. Manual discount
    if (discountValue && parseFloat(discountValue) > 0) {
      const discount = discountType === 'percentual'
        ? subtotal * (parseFloat(discountValue) / 100)
        : parseFloat(discountValue);
      const appliedDiscount = Math.min(discount, subtotal);
      discounts += appliedDiscount;
      breakdown.push({
        type: 'discount',
        label: `Desconto Manual (${discountType === 'percentual' ? discountValue + '%' : 'fixo'})`,
        value: -appliedDiscount
      });
    }
    
    // 2. Coupon
    if (appliedCoupon) {
      const discount = appliedCoupon.discountType === 'percentual'
        ? subtotal * (parseFloat(appliedCoupon.discountValue) / 100)
        : parseFloat(appliedCoupon.discountValue);
      discounts += discount;
      breakdown.push({
        type: 'discount',
        label: `Cupom ${appliedCoupon.code}`,
        value: -discount
      });
    }
    
    // 3. Loyalty points
    if (loyaltyPointsToRedeem && parseFloat(loyaltyPointsToRedeem) > 0) {
      const pointsValue = parseFloat(loyaltyPointsToRedeem) * 
        parseFloat(loyaltyProgram?.currencyPerPoint || "1");
      discounts += pointsValue;
      breakdown.push({
        type: 'discount',
        label: `Pontos de Fidelidade (${loyaltyPointsToRedeem})`,
        value: -pointsValue
      });
    }
    
    // 4. Services (on discounted amount)
    const afterDiscounts = Math.max(0, subtotal - discounts);
    
    // Add automatic services first
    availableServices.forEach((service: any) => {
      if (service.applyAutomatically === 1) {
        const charge = service.chargeType === 'percentual'
          ? afterDiscounts * (parseFloat(service.value) / 100)
          : parseFloat(service.value);
        additions += charge;
        breakdown.push({
          type: 'addition',
          label: `${service.name} (${service.chargeType === 'percentual' ? service.value + '%' : 'fixa'}) [Auto]`,
          value: charge
        });
      }
    });
    
    // Add selected manual services
    selectedServices.forEach(serviceId => {
      const service = availableServices.find((s: any) => s.id === serviceId);
      if (service && service.applyAutomatically === 0) {
        const charge = service.chargeType === 'percentual'
          ? afterDiscounts * (parseFloat(service.value) / 100)
          : parseFloat(service.value);
        additions += charge;
        breakdown.push({
          type: 'addition',
          label: `${service.name} (${service.chargeType === 'percentual' ? service.value + '%' : 'fixa'})`,
          value: charge
        });
      }
    });
    
    // Add manual service if defined
    if (manualServiceName && manualServiceValue && parseFloat(manualServiceValue) > 0) {
      const charge = manualServiceType === 'percentual'
        ? afterDiscounts * (parseFloat(manualServiceValue) / 100)
        : parseFloat(manualServiceValue);
      additions += charge;
      breakdown.push({
        type: 'addition',
        label: `${manualServiceName} (${manualServiceType === 'percentual' ? manualServiceValue + '%' : 'fixa'})`,
        value: charge
      });
    }
    
    const finalTotal = Math.max(0, afterDiscounts + additions);
    
    return {
      subtotal,
      totalDiscounts: discounts,
      totalAdditions: additions,
      finalTotal,
      breakdown
    };
  }, [totalAmount, discountValue, discountType, appliedCoupon, loyaltyPointsToRedeem, selectedServices, manualServiceName, manualServiceValue, manualServiceType, availableServices, loyaltyProgram]);

  // Loading state
  if (loadingTables) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-purple-50 to-indigo-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-lg font-medium text-slate-700 dark:text-slate-300">Carregando mesa...</p>
        </div>
      </div>
    );
  }

  // Table not found
  if (!table) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-purple-50 to-indigo-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
        <div className="text-center space-y-4 p-8">
          <AlertCircle className="h-16 w-16 mx-auto text-red-500" />
          <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100">Mesa não encontrada</h2>
          <p className="text-slate-600 dark:text-slate-400">A mesa com ID "{id}" não existe ou foi removida.</p>
          <Button
            onClick={() => setLocation(`/${fromParam}`)}
            className="bg-gradient-to-r from-purple-500 to-indigo-500 hover:from-purple-600 hover:to-indigo-600"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar para {fromParam === 'open-tables' ? 'Mesas Abertas' : 'Mesas'}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50 to-indigo-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
      {/* Header */}
      <div className="sticky top-0 z-50 backdrop-blur-xl bg-white/70 dark:bg-slate-950/70 border-b border-white/20 dark:border-slate-800/50 shadow-lg">
        <div className="container mx-auto px-4 py-4 max-w-7xl">
          <div className="flex items-center justify-between">
            <Button 
              variant="ghost" 
              size="icon"
              onClick={() => setLocation(`/${fromParam}`)}
              className="rounded-full"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            
            <div className="flex items-center gap-3">
              <Badge className="bg-gradient-to-r from-purple-500 to-indigo-500 text-white border-0 px-4 py-2 text-lg font-bold">
                Mesa {id}
              </Badge>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex items-center justify-between max-w-3xl mx-auto">
            {STEPS.map((step, index) => {
              const Icon = step.icon;
              const isActive = currentStep === step.id;
              const isCompleted = currentStep > step.id;
              
              return (
                <div key={step.id} className="flex items-center flex-1">
                  {/* Step Circle */}
                  <div className="flex flex-col items-center">
                    <div
                      className={cn(
                        "relative flex items-center justify-center w-16 h-16 rounded-full border-4 transition-all duration-300",
                        isActive && "border-purple-500 bg-gradient-to-br from-purple-500 to-indigo-500 shadow-lg shadow-purple-500/50 scale-110",
                        isCompleted && "border-green-500 bg-green-500",
                        !isActive && !isCompleted && "border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900"
                      )}
                    >
                      {isCompleted ? (
                        <Check className="h-8 w-8 text-white" />
                      ) : (
                        <Icon className={cn(
                          "h-8 w-8",
                          isActive && "text-white",
                          !isActive && "text-slate-400 dark:text-slate-600"
                        )} />
                      )}
                      
                      {isActive && (
                        <div className="absolute inset-0 rounded-full bg-purple-500 animate-ping opacity-20"></div>
                      )}
                    </div>
                    
                    <div className="mt-3 text-center">
                      <div className={cn(
                        "text-sm font-bold transition-colors",
                        isActive && "text-purple-600 dark:text-purple-400",
                        isCompleted && "text-green-600 dark:text-green-400",
                        !isActive && !isCompleted && "text-slate-400"
                      )}>
                        {step.name}
                      </div>
                      <div className="text-xs text-slate-500 dark:text-slate-400">
                        {step.description}
                      </div>
                    </div>
                  </div>
                  
                  {/* Connector Line */}
                  {index < STEPS.length - 1 && (
                    <div className="flex-1 h-1 mx-4 mb-10">
                      <div className={cn(
                        "h-full rounded-full transition-all duration-500",
                        currentStep > step.id ? "bg-green-500" : "bg-slate-200 dark:bg-slate-700"
                      )}></div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Content Area */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content - 2 columns */}
          <div className="lg:col-span-2">
            <Card className="bg-white/90 dark:bg-slate-900/90 backdrop-blur border-slate-200/50 dark:border-slate-800/50 shadow-2xl">
              <CardHeader className="border-b border-slate-200 dark:border-slate-800">
                <CardTitle className="text-2xl flex items-center gap-3">
                  {(() => {
                    const StepIcon = STEPS[currentStep - 1].icon;
                    return (
                      <div className="p-2 rounded-lg bg-gradient-to-br from-purple-500 to-indigo-500">
                        <StepIcon className="h-6 w-6 text-white" />
                      </div>
                    );
                  })()}
                  {STEPS[currentStep - 1].name}
                </CardTitle>
              </CardHeader>
              <CardContent className="p-8">
                {/* Step 1: Review Items & Guests */}
                {currentStep === 1 && (
                  <div className="space-y-6">
                    {/* Info Banner */}
                    <div className="relative overflow-hidden rounded-xl bg-gradient-to-r from-blue-500/10 to-indigo-500/10 border border-blue-500/20 p-4">
                      <div className="flex items-start gap-3">
                        <AlertCircle className="h-5 w-5 text-blue-500 mt-0.5" />
                        <div>
                          <div className="font-semibold text-blue-900 dark:text-blue-100">
                            Revise os itens antes de prosseguir
                          </div>
                          <div className="text-sm text-blue-700 dark:text-blue-300 mt-1">
                            Verifique se todos os itens e clientes estão corretos. Você pode selecionar clientes específicos para checkout individual.
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Resumo Estatístico */}
                    <div className="grid grid-cols-3 gap-3">
                      <Card className="p-4 bg-gradient-to-br from-blue-500/10 to-indigo-500/10 border-blue-500/20">
                        <div className="text-xs text-blue-700 dark:text-blue-300 mb-1">Total Clientes</div>
                        <div className="text-3xl font-black text-blue-600 dark:text-blue-400">{ordersByGuest.length}</div>
                      </Card>
                      <Card className="p-4 bg-gradient-to-br from-green-500/10 to-emerald-500/10 border-green-500/20">
                        <div className="text-xs text-green-700 dark:text-green-300 mb-1">Total Itens</div>
                        <div className="text-3xl font-black text-green-600 dark:text-green-400">{allItems.length}</div>
                      </Card>
                      <Card className="p-4 bg-gradient-to-br from-purple-500/10 to-pink-500/10 border-purple-500/20">
                        <div className="text-xs text-purple-700 dark:text-purple-300 mb-1">Média/Cliente</div>
                        <div className="text-3xl font-black text-purple-600 dark:text-purple-400">
                          {ordersByGuest.length > 0 ? formatKwanza(totalAmount / ordersByGuest.length) : '0 Kz'}
                        </div>
                      </Card>
                    </div>

                    {/* Items by Guest */}
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <h3 className="text-lg font-bold">Itens por Cliente</h3>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              if (selectedGuestIds.length === ordersByGuest.length) {
                                setSelectedGuestIds([]);
                              } else {
                                setSelectedGuestIds(ordersByGuest.map((og: any) => og.guest.id));
                              }
                            }}
                          >
                            {selectedGuestIds.length === ordersByGuest.length ? 'Desselecionar Todos' : 'Selecionar Todos'}
                          </Button>
                          <Badge variant="outline" className="bg-slate-100 dark:bg-slate-800">
                            {ordersByGuest.length} {ordersByGuest.length === 1 ? 'cliente' : 'clientes'}
                          </Badge>
                        </div>
                      </div>

                      {/* Busca e Ordenação */}
                      <div className="flex gap-3">
                        <Input
                          placeholder="🔍 Buscar cliente..."
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          className="flex-1"
                        />
                        <Select value={sortBy} onValueChange={(v: any) => setSortBy(v)}>
                          <SelectTrigger className="w-[200px]">
                            <SelectValue placeholder="Ordenar por..." />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="name">📝 Nome</SelectItem>
                            <SelectItem value="total-desc">💰 Maior Total</SelectItem>
                            <SelectItem value="total-asc">💵 Menor Total</SelectItem>
                            <SelectItem value="status">⏰ Pendente Primeiro</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <ScrollArea className="max-h-[500px] pr-4">
                        <div className="space-y-4">
                          {loadingOrders && (
                            <div className="text-center py-8 text-slate-500">
                              <div className="animate-pulse">Carregando pedidos...</div>
                            </div>
                          )}
                          
                          {!loadingOrders && ordersByGuest.length === 0 && (
                            <div className="text-center py-8">
                              <AlertCircle className="h-12 w-12 mx-auto mb-3 text-slate-300" />
                              <p className="font-medium text-slate-700 dark:text-slate-300">Nenhum pedido encontrado</p>
                              <p className="text-sm text-slate-500 mt-1">
                                Adicione itens à mesa antes de fazer checkout
                              </p>
                            </div>
                          )}
                          
                          {ordersByGuest
                            .filter((og: any) => {
                              if (!searchQuery) return true;
                              const guestName = og.guest.name || `Cliente ${og.guest.guestNumber}`;
                              return guestName.toLowerCase().includes(searchQuery.toLowerCase());
                            })
                            .sort((a: any, b: any) => {
                              const aTotal = parseFloat(a.subtotal || 0);
                              const bTotal = parseFloat(b.subtotal || 0);
                              const aName = a.guest.name || `Cliente ${a.guest.guestNumber}`;
                              const bName = b.guest.name || `Cliente ${b.guest.guestNumber}`;
                              
                              switch (sortBy) {
                                case 'name':
                                  return aName.localeCompare(bName);
                                case 'total-desc':
                                  return bTotal - aTotal;
                                case 'total-asc':
                                  return aTotal - bTotal;
                                case 'status':
                                  const aStatus = a.guest.status === 'pago' ? 1 : 0;
                                  const bStatus = b.guest.status === 'pago' ? 1 : 0;
                                  return aStatus - bStatus;
                                default:
                                  return 0;
                              }
                            })
                            .map((guestOrder: any) => {
                            const guestItems = (guestOrder.orders || []).flatMap((order: any) => 
                              (order.items || []).map((item: any) => ({
                                ...item,
                                menuItemName: item.menuItem?.name || item.name || 'Item',
                                unitPrice: item.price,
                                totalPrice: (parseFloat(item.price || 0) * (item.quantity || 0)).toString(),
                                notes: item.notes,
                                options: item.options || []
                              }))
                            );
                            
                            // Use subtotal from API if available, otherwise calculate
                            const guestTotal = guestOrder.subtotal 
                              ? parseFloat(guestOrder.subtotal)
                              : guestItems.reduce((sum: number, item: any) => 
                                  sum + parseFloat(item.totalPrice || 0), 0
                                );
                            const isSelected = selectedGuestIds.includes(guestOrder.guest.id);

                            const itemCount = guestItems.length;
                            const isPaid = guestOrder.guest.status === 'pago';

                            return (
                              <div 
                                key={guestOrder.guest.id}
                                className={cn(
                                  "relative rounded-xl border-2 transition-all duration-200",
                                  isPaid && "opacity-60",
                                  isSelected 
                                    ? "border-purple-500 bg-purple-500/5" 
                                    : "border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700"
                                )}
                              >
                                {isPaid && (
                                  <div className="absolute inset-0 bg-green-500/5 rounded-xl pointer-events-none" />
                                )}
                                {/* Guest Header */}
                                <div className="flex items-center gap-3 p-4 border-b border-slate-200 dark:border-slate-800">
                                  <Checkbox
                                    checked={isSelected}
                                    onCheckedChange={(checked) => {
                                      if (checked) {
                                        setSelectedGuestIds([...selectedGuestIds, guestOrder.guest.id]);
                                      } else {
                                        setSelectedGuestIds(selectedGuestIds.filter(id => id !== guestOrder.guest.id));
                                      }
                                    }}
                                    className="h-5 w-5"
                                  />
                                  
                                  <div className="flex-1">
                                    <div className="flex items-center gap-2">
                                      <Users className="h-4 w-4 text-purple-500" />
                                      <span className="font-bold">
                                        {guestOrder.guest.name || `Cliente ${guestOrder.guest.guestNumber}`}
                                      </span>
                                      {guestOrder.guest.status === 'pago' && (
                                        <Badge className="bg-green-500/20 text-green-700 dark:text-green-300 border-green-500/30">
                                          <CheckCircle2 className="h-3 w-3 mr-1" />
                                          Pago
                                        </Badge>
                                      )}
                                    </div>
                                    <div className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                                      {itemCount} {itemCount === 1 ? 'item' : 'itens'}
                                    </div>
                                  </div>
                                  
                                  <div className="text-right">
                                    <div className="text-lg font-bold text-purple-600 dark:text-purple-400">
                                      {formatKwanza(guestTotal)}
                                    </div>
                                  </div>
                                </div>

                                {/* Guest Items */}
                                <div className="p-4 space-y-2">
                                  {itemCount === 0 ? (
                                    <div className="py-6 text-center text-slate-500">
                                      <AlertCircle className="h-8 w-8 mx-auto mb-2 text-slate-300" />
                                      <p className="text-sm">Nenhum item para este cliente</p>
                                    </div>
                                  ) : (
                                    guestItems.map((item: any, index: number) => (
                                      <div 
                                        key={`${item.id}-${index}`}
                                        className="py-2 px-3 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
                                      >
                                        <div className="flex items-center justify-between">
                                          <div className="flex items-center gap-3 flex-1">
                                            <div className="flex items-center justify-center w-7 h-7 rounded-lg bg-purple-500/20 text-purple-700 dark:text-purple-300 font-bold text-sm">
                                              {item.quantity}×
                                            </div>
                                            <div className="flex-1">
                                              <div className="font-medium">{item.menuItemName}</div>
                                              <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                                                {formatKwanza(item.unitPrice)} cada
                                              </div>
                                              {item.options && item.options.length > 0 && (
                                                <div className="text-xs text-blue-600 dark:text-blue-400 mt-1 flex items-center gap-1">
                                                  <Settings className="h-3 w-3" />
                                                  {item.options.map((opt: any) => opt.name).join(', ')}
                                                </div>
                                              )}
                                              {item.notes && (
                                                <div className="text-xs text-orange-600 dark:text-orange-400 mt-1 flex items-center gap-1">
                                                  <AlertCircle className="h-3 w-3" />
                                                  {item.notes}
                                                </div>
                                              )}
                                            </div>
                                          </div>
                                          <span className="font-semibold text-slate-700 dark:text-slate-300">
                                            {formatKwanza(item.totalPrice)}
                                          </span>
                                        </div>
                                      </div>
                                    ))
                                  )}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </ScrollArea>

                      {/* Selection Summary */}
                      {selectedGuestIds.length > 0 && (
                        <div className="relative overflow-hidden rounded-xl bg-gradient-to-r from-purple-500/10 to-indigo-500/10 border border-purple-500/20 p-4">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <CheckCircle2 className="h-5 w-5 text-purple-500" />
                              <div>
                                <div className="font-semibold text-purple-900 dark:text-purple-100">
                                  {selectedGuestIds.length} {selectedGuestIds.length === 1 ? 'cliente selecionado' : 'clientes selecionados'}
                                </div>
                                <div className="text-sm text-purple-700 dark:text-purple-300 mt-0.5">
                                  Total: {formatKwanza(
                                    ordersByGuest
                                      .filter((og: any) => selectedGuestIds.includes(og.guest.id))
                                      .reduce((sum: number, og: any) => sum + parseFloat(og.subtotal || 0), 0)
                                  )}
                                </div>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <Button
                                size="sm"
                                onClick={() => {
                                  // Checkout individual: continuar com os clientes selecionados
                                  setCurrentStep(2);
                                }}
                                className="bg-gradient-to-r from-purple-500 to-indigo-500 hover:from-purple-600 hover:to-indigo-600"
                              >
                                Continuar com Selecionados
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setSelectedGuestIds([])}
                                className="text-purple-600 border-purple-500/30 hover:bg-purple-500/10"
                              >
                                Limpar Seleção
                              </Button>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Step 2: Benefits - Coupons & Loyalty */}
                {currentStep === 2 && (
                  <div className="space-y-6">
                    {/* Selection Banner */}
                    {selectedGuestIds.length > 0 && (
                      <div className="relative overflow-hidden rounded-xl bg-gradient-to-r from-purple-500/10 to-indigo-500/10 border border-purple-500/20 p-4">
                        <div className="flex items-start gap-3">
                          <CheckCircle2 className="h-5 w-5 text-purple-500 mt-0.5" />
                          <div>
                            <div className="font-semibold text-purple-900 dark:text-purple-100">
                              Checkout Individual Ativo
                            </div>
                            <div className="text-sm text-purple-700 dark:text-purple-300 mt-1">
                              Processando apenas {selectedGuestIds.length} {selectedGuestIds.length === 1 ? 'cliente selecionado' : 'clientes selecionados'} • Total: {formatKwanza(totalAmount)}
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Info Banner */}
                    <div className="relative overflow-hidden rounded-xl bg-gradient-to-r from-amber-500/10 to-orange-500/10 border border-amber-500/20 p-4">
                      <div className="flex items-start gap-3">
                        <Gift className="h-5 w-5 text-amber-500 mt-0.5" />
                        <div>
                          <div className="font-semibold text-amber-900 dark:text-amber-100">
                            Aproveite cupons e pontos de fidelidade
                          </div>
                          <div className="text-sm text-amber-700 dark:text-amber-300 mt-1">
                            Selecione um cliente para habilitar cupons e resgatar pontos de fidelidade.
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Customer Selection */}
                    <Card className="border-2 border-slate-200 dark:border-slate-800">
                      <CardHeader className="bg-slate-50 dark:bg-slate-900/50 border-b">
                        <CardTitle className="text-lg flex items-center gap-2">
                          <Users className="h-5 w-5 text-blue-500" />
                          Selecionar Cliente
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="p-6">
                        {customers.length === 0 ? (
                          <div className="text-center py-8">
                            <Users className="h-12 w-12 mx-auto mb-3 text-slate-300" />
                            <p className="font-medium text-slate-700 dark:text-slate-300 mb-2">
                              Nenhum cliente cadastrado
                            </p>
                            <p className="text-sm text-slate-500 mb-4">
                              Cadastre clientes para usar cupons e fidelidade
                            </p>
                            <Button
                              size="sm"
                              onClick={() => setLocation('/customers')}
                              className="bg-gradient-to-r from-blue-500 to-indigo-500"
                            >
                              Cadastrar Primeiro Cliente
                            </Button>
                          </div>
                        ) : (
                          <div className="space-y-4">
                            <Select value={selectedCustomerId} onValueChange={setSelectedCustomerId}>
                              <SelectTrigger className="h-12 text-base">
                                <SelectValue placeholder="Escolha um cliente..." />
                              </SelectTrigger>
                              <SelectContent>
                                {customers.map((customer: any) => (
                                  <SelectItem key={customer.id} value={customer.id}>
                                    <div className="flex items-center gap-3 py-1">
                                      <Users className="h-4 w-4" />
                                      <span className="font-medium">{customer.name}</span>
                                      {customer.loyaltyPoints > 0 && (
                                        <Badge variant="outline" className="bg-blue-500/10 text-blue-700 dark:text-blue-300 border-blue-500/20">
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
                                onClick={() => setSelectedCustomerId('')}
                                className="w-full"
                              >
                                Remover Cliente
                              </Button>
                            )}
                          </div>
                        )}
                      </CardContent>
                    </Card>

                    {/* Coupon Section */}
                    <Card className="border-2 border-slate-200 dark:border-slate-800">
                      <CardHeader className="bg-gradient-to-r from-pink-50 to-rose-50 dark:from-pink-950/20 dark:to-rose-950/20 border-b">
                        <CardTitle className="text-lg flex items-center gap-2">
                          <Gift className="h-5 w-5 text-pink-500" />
                          Cupom de Desconto
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="p-6">
                        <div className="space-y-4">
                          <div className="flex gap-3">
                            <Input
                              value={couponCode}
                              onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                              placeholder="DIGITE-O-CODIGO"
                              disabled={!!appliedCoupon}
                              className="h-12 text-lg font-bold tracking-wider uppercase"
                            />
                            {appliedCoupon ? (
                              <Button
                                variant="outline"
                                size="lg"
                                onClick={() => {
                                  setAppliedCoupon(null);
                                  setCouponCode('');
                                }}
                                className="px-6"
                              >
                                Remover
                              </Button>
                            ) : (
                              <Button
                                size="lg"
                                onClick={() => applyCouponMutation.mutate(couponCode)}
                                disabled={!couponCode || applyCouponMutation.isPending}
                                className="px-6 bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600"
                              >
                                {applyCouponMutation.isPending ? (
                                  <>
                                    <div className="animate-spin h-4 w-4 mr-2 border-2 border-white border-t-transparent rounded-full" />
                                    Validando...
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
                              <div className="space-y-2">
                                <div className="flex items-center gap-2">
                                  <CheckCircle2 className="h-4 w-4 text-green-600 dark:text-green-400" />
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
                        </div>
                      </CardContent>
                    </Card>

                    {/* Loyalty Program */}
                    {loyaltyProgram?.isActive === 1 && selectedCustomer && (
                      <Card className="border-2 border-slate-200 dark:border-slate-800">
                        <CardHeader className="bg-gradient-to-r from-purple-50 to-indigo-50 dark:from-purple-950/20 dark:to-indigo-950/20 border-b">
                          <div className="flex items-center justify-between">
                            <CardTitle className="text-lg flex items-center gap-2">
                              <Sparkles className="h-5 w-5 text-purple-500" />
                              Programa de Fidelidade
                            </CardTitle>
                            <Badge className="bg-yellow-500/20 text-yellow-700 dark:text-yellow-300 border-yellow-500/30">
                              Ativo
                            </Badge>
                          </div>
                        </CardHeader>
                        <CardContent className="p-6 space-y-4">
                          {/* Available Points */}
                          <div className="relative overflow-hidden rounded-xl bg-gradient-to-r from-blue-500/10 to-indigo-500/10 border border-blue-500/20 p-4">
                            <div className="flex items-center justify-between">
                              <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                                Pontos Disponíveis
                              </span>
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
                              <Label className="text-sm font-semibold">
                                Resgatar Pontos (mínimo: {loyaltyProgram.minPointsToRedeem})
                              </Label>
                              <div className="flex gap-3">
                                <Input
                                  type="number"
                                  placeholder="Quantidade de pontos"
                                  value={loyaltyPointsToRedeem}
                                  onChange={(e) => {
                                    const val = Math.min(
                                      parseInt(e.target.value) || 0,
                                      selectedCustomer.loyaltyPoints
                                    );
                                    setLoyaltyPointsToRedeem(val.toString());
                                  }}
                                  min={loyaltyProgram.minPointsToRedeem || 100}
                                  max={selectedCustomer.loyaltyPoints}
                                  className="h-12 text-lg font-semibold"
                                />
                                <Button
                                  size="lg"
                                  onClick={() => redeemPointsMutation.mutate(parseInt(loyaltyPointsToRedeem))}
                                  disabled={
                                    !loyaltyPointsToRedeem ||
                                    parseInt(loyaltyPointsToRedeem) < (loyaltyProgram.minPointsToRedeem || 100) ||
                                    redeemPointsMutation.isPending
                                  }
                                  className="px-6 bg-gradient-to-r from-purple-500 to-indigo-500 hover:from-purple-600 hover:to-indigo-600"
                                >
                                  {redeemPointsMutation.isPending ? (
                                    <>
                                      <div className="animate-spin h-4 w-4 mr-2 border-2 border-white border-t-transparent rounded-full" />
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
                                Desconto: {formatKwanza(
                                  (parseInt(loyaltyPointsToRedeem) || 0) *
                                  parseFloat(loyaltyProgram.currencyPerPoint || "1")
                                )}
                              </p>
                            </div>
                          )}

                          {/* Points to Earn */}
                          <div className="relative overflow-hidden rounded-xl bg-gradient-to-r from-green-500/10 to-emerald-500/10 border border-green-500/20 p-4">
                            <div className="flex items-center justify-between">
                              <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                                Pontos a Ganhar nesta Compra
                              </span>
                              <span className="text-2xl font-black text-green-600 dark:text-green-400 flex items-center gap-1">
                                +{Math.floor(calculateTotals.finalTotal * parseFloat(loyaltyProgram.pointsPerCurrency || "1"))} pts
                                <TrendingUp className="h-5 w-5" />
                              </span>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    )}

                    {/* No Customer Selected Message */}
                    {!selectedCustomerId && (
                      <div className="text-center py-8 text-slate-500">
                        <Users className="h-12 w-12 mx-auto mb-3 text-slate-300" />
                        <p className="font-medium">Selecione um cliente acima</p>
                        <p className="text-sm mt-1">para ativar cupons e programa de fidelidade</p>
                      </div>
                    )}
                  </div>
                )}

                {/* Step 3: Adjustments */}
                {currentStep === 3 && (
                  <div className="space-y-6">
                    {/* 🎯 MELHORIA: Alerta Visual de Ajustes Salvos */}
                    {((discountValue && parseFloat(discountValue) > 0) || (manualServiceValue && parseFloat(manualServiceValue) > 0)) && (
                      <div className="relative overflow-hidden rounded-xl bg-gradient-to-r from-yellow-500/10 to-amber-500/10 border-2 border-yellow-500/30 p-4 shadow-lg">
                        <div className="flex items-start gap-3">
                          <div className="p-2 rounded-lg bg-yellow-500/20">
                            <AlertCircle className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
                          </div>
                          <div className="flex-1">
                            <div className="font-bold text-yellow-900 dark:text-yellow-100 mb-1">
                              ⚡ Ajustes Ativos na Conta
                            </div>
                            <div className="text-sm text-yellow-800 dark:text-yellow-300 space-y-1">
                              {discountValue && parseFloat(discountValue) > 0 && (
                                <div className="flex items-center gap-2">
                                  <Badge variant="outline" className="bg-green-500/10 border-green-500 text-green-700 dark:text-green-300">
                                    Desconto: {discountType === 'percentual' ? `${discountValue}%` : `${formatKwanza(parseFloat(discountValue))}`}
                                  </Badge>
                                  <span>= -{formatKwanza(
                                    discountType === 'percentual'
                                      ? totalAmount * (parseFloat(discountValue) / 100)
                                      : parseFloat(discountValue)
                                  )}</span>
                                </div>
                              )}
                              {manualServiceValue && parseFloat(manualServiceValue) > 0 && (
                                <div className="flex items-center gap-2">
                                  <Badge variant="outline" className="bg-orange-500/10 border-orange-500 text-orange-700 dark:text-orange-300">
                                    Taxa: {manualServiceType === 'percentual' ? `${manualServiceValue}%` : `${formatKwanza(parseFloat(manualServiceValue))}`}
                                  </Badge>
                                  <span>= +{formatKwanza(
                                    manualServiceType === 'percentual'
                                      ? totalAmount * (parseFloat(manualServiceValue) / 100)
                                      : parseFloat(manualServiceValue)
                                  )}</span>
                                </div>
                              )}
                            </div>
                          </div>
                          {/* 🎯 MELHORIA: Botão Limpar Ajustes */}
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              setDiscountValue('');
                              setManualServiceValue('');
                              toast({
                                title: "Ajustes removidos",
                                description: "Todos os descontos e taxas foram limpos",
                              });
                            }}
                            className="border-red-500/50 text-red-600 hover:bg-red-500/10"
                          >
                            <X className="h-4 w-4 mr-1" />
                            Limpar Tudo
                          </Button>
                        </div>
                      </div>
                    )}
                    
                    {/* Selection Banner */}
                    {selectedGuestIds.length > 0 && (
                      <div className="relative overflow-hidden rounded-xl bg-gradient-to-r from-purple-500/10 to-indigo-500/10 border border-purple-500/20 p-4">
                        <div className="flex items-start gap-3">
                          <CheckCircle2 className="h-5 w-5 text-purple-500 mt-0.5" />
                          <div>
                            <div className="font-semibold text-purple-900 dark:text-purple-100">
                              Checkout Individual Ativo
                            </div>
                            <div className="text-sm text-purple-700 dark:text-purple-300 mt-1">
                              Ajustando apenas para {selectedGuestIds.length} {selectedGuestIds.length === 1 ? 'cliente' : 'clientes'} • Subtotal: {formatKwanza(totalAmount)}
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Info Banner */}
                    <div className="relative overflow-hidden rounded-xl bg-gradient-to-r from-orange-500/10 to-red-500/10 border border-orange-500/20 p-4">
                      <div className="flex items-start gap-3">
                        <Calculator className="h-5 w-5 text-orange-500 mt-0.5" />
                        <div>
                          <div className="font-semibold text-orange-900 dark:text-orange-100">
                            Ajustes adicionais (opcional)
                          </div>
                          <div className="text-sm text-orange-700 dark:text-orange-300 mt-1">
                            Adicione descontos manuais ou taxas de serviço se necessário.
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Manual Discount */}
                    <Card className="border-2 border-slate-200 dark:border-slate-800">
                      <CardHeader className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20 border-b">
                        <CardTitle className="text-lg flex items-center gap-2">
                          <Percent className="h-5 w-5 text-green-500" />
                          Desconto Manual
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="p-6 space-y-4">
                        {/* Atalhos Rápidos */}
                        <div className="space-y-2">
                          <Label className="text-sm">Atalhos Rápidos</Label>
                          <div className="flex gap-2">
                            {[5, 10, 15, 20].map(pct => (
                              <Button
                                key={pct}
                                size="sm"
                                variant="outline"
                                onClick={() => {
                                  setDiscountType('percentual');
                                  setDiscountValue(pct.toString());
                                }}
                                className="flex-1"
                              >
                                {pct}%
                              </Button>
                            ))}
                          </div>
                        </div>

                        <Separator />

                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label>Valor do Desconto</Label>
                            <div className="relative">
                              <Input
                                type="number"
                                step="0.01"
                                value={discountValue}
                                onChange={(e) => {
                                  const val = parseFloat(e.target.value) || 0;
                                  const max = discountType === 'percentual' ? 100 : totalAmount;
                                  if (val <= max) {
                                    setDiscountValue(e.target.value);
                                  }
                                }}
                                placeholder="0.00"
                                className="h-12 text-lg font-semibold pr-10"
                              />
                              {/* 🎯 MELHORIA: Botão de Remoção Rápida */}
                              {discountValue && parseFloat(discountValue) > 0 && (
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => {
                                    setDiscountValue('');
                                    toast({
                                      title: "Desconto removido",
                                      description: "O desconto foi limpo",
                                    });
                                  }}
                                  className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8 p-0 hover:bg-red-100 hover:text-red-600"
                                >
                                  <X className="h-4 w-4" />
                                </Button>
                              )}
                            </div>
                          </div>
                          <div className="space-y-2">
                            <Label>Tipo</Label>
                            <Select value={discountType} onValueChange={(v: 'valor' | 'percentual') => setDiscountType(v)}>
                              <SelectTrigger className="h-12">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="valor">Valor Fixo (Kz)</SelectItem>
                                <SelectItem value="percentual">Percentual (%)</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>

                        {/* 🎯 MELHORIA: Card de Confirmação Visual Melhorado */}
                        {discountValue && parseFloat(discountValue) > 0 && (
                          <div className="relative overflow-hidden rounded-xl bg-gradient-to-r from-green-500/10 to-emerald-500/10 border-2 border-green-500/30 p-4 shadow-md">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <div className="p-2 rounded-lg bg-green-500/20">
                                  <TrendingUp className="h-4 w-4 text-green-600 rotate-180" />
                                </div>
                                <span className="text-sm font-semibold text-green-700 dark:text-green-300">
                                  Desconto Ativo:
                                </span>
                              </div>
                              <span className="text-2xl font-black text-green-600 dark:text-green-400">
                                -{formatKwanza(
                                  discountType === 'percentual'
                                    ? totalAmount * (parseFloat(discountValue) / 100)
                                    : parseFloat(discountValue)
                                )}
                              </span>
                            </div>
                          </div>
                        )}
                      </CardContent>
                    </Card>

                    {/* Services */}
                    <Card className="border-2 border-slate-200 dark:border-slate-800">
                      <CardHeader className="bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-950/20 dark:to-cyan-950/20 border-b">
                        <CardTitle className="text-lg flex items-center gap-2">
                          <TrendingUp className="h-5 w-5 text-blue-500" />
                          Serviços e Taxas
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="p-6 space-y-4">
                        {/* Available Services */}
                        {availableServices.length > 0 && (
                          <div className="space-y-3">
                            <Label className="text-sm font-medium">Serviços Disponíveis</Label>
                            <div className="space-y-2">
                              {availableServices
                                .filter((s: any) => s.applyAutomatically === 0)
                                .map((service: any) => (
                                  <div
                                    key={service.id}
                                    className={cn(
                                      "flex items-center justify-between p-3 rounded-lg border-2 transition-all cursor-pointer hover:border-blue-300",
                                      selectedServices.includes(service.id)
                                        ? "border-blue-500 bg-blue-50 dark:bg-blue-950/20"
                                        : "border-slate-200 dark:border-slate-700"
                                    )}
                                    onClick={() => {
                                      setSelectedServices(prev =>
                                        prev.includes(service.id)
                                          ? prev.filter(id => id !== service.id)
                                          : [...prev, service.id]
                                      );
                                    }}
                                  >
                                    <div className="flex items-center gap-3">
                                      <Checkbox
                                        checked={selectedServices.includes(service.id)}
                                        onCheckedChange={() => {}}
                                      />
                                      <div>
                                        <div className="font-medium">{service.name}</div>
                                        {service.description && (
                                          <div className="text-xs text-muted-foreground">
                                            {service.description}
                                          </div>
                                        )}
                                      </div>
                                    </div>
                                    <Badge variant="outline" className="ml-auto">
                                      {service.chargeType === 'percentual'
                                        ? `${service.value}%`
                                        : `${parseFloat(service.value).toFixed(2)} Kz`}
                                    </Badge>
                                  </div>
                                ))}
                            </div>
                          </div>
                        )}

                        {/* Auto-applied Services Info */}
                        {availableServices.filter((s: any) => s.applyAutomatically === 1).length > 0 && (
                          <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3">
                            <div className="flex items-start gap-2">
                              <CheckCircle2 className="h-4 w-4 text-blue-500 mt-0.5" />
                              <div className="text-sm">
                                <div className="font-medium text-blue-900 dark:text-blue-100">
                                  Serviços Automáticos
                                </div>
                                <div className="text-blue-700 dark:text-blue-300 mt-1">
                                  {availableServices
                                    .filter((s: any) => s.applyAutomatically === 1)
                                    .map((s: any) => s.name)
                                    .join(', ')} serão aplicados automaticamente
                                </div>
                              </div>
                            </div>
                          </div>
                        )}

                        {availableServices.length > 0 && <Separator />}

                        {/* Manual Service */}
                        <div className="space-y-3">
                          <Label className="text-sm font-medium">Serviço/Taxa Manual (Opcional)</Label>
                          
                          <div className="space-y-2">
                            <Label htmlFor="serviceName">Nome do Serviço</Label>
                            <Input
                              id="serviceName"
                              value={manualServiceName}
                              onChange={(e) => setManualServiceName(e.target.value)}
                              placeholder="Ex: Taxa de entrega, Couvert..."
                              className="h-10"
                            />
                          </div>

                          <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <Label>Valor</Label>
                              <Input
                                type="number"
                                step="0.01"
                                value={manualServiceValue}
                                onChange={(e) => {
                                  const val = parseFloat(e.target.value) || 0;
                                  const max = manualServiceType === 'percentual' ? 100 : 999999;
                                  if (val <= max) {
                                    setManualServiceValue(e.target.value);
                                  }
                                }}
                                placeholder="0.00"
                                className="h-10"
                              />
                            </div>
                            <div className="space-y-2">
                              <Label>Tipo</Label>
                              <Select value={manualServiceType} onValueChange={(v: 'valor' | 'percentual') => setManualServiceType(v)}>
                                <SelectTrigger className="h-10">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="valor">Valor Fixo (Kz)</SelectItem>
                                  <SelectItem value="percentual">Percentual (%)</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                          </div>
                        </div>

                        {/* Services Summary */}
                        {(selectedServices.length > 0 || (manualServiceName && manualServiceValue && parseFloat(manualServiceValue) > 0)) && (
                          <div className="relative overflow-hidden rounded-xl bg-gradient-to-r from-blue-500/10 to-cyan-500/10 border border-blue-500/20 p-4">
                            <div className="space-y-2">
                              <div className="text-sm font-medium text-blue-700 dark:text-blue-300">
                                Serviços Adicionados:
                              </div>
                              {selectedServices.map(serviceId => {
                                const service = availableServices.find((s: any) => s.id === serviceId);
                                if (!service) return null;
                                const charge = service.chargeType === 'percentual'
                                  ? (totalAmount - calculateTotals.totalDiscounts) * (parseFloat(service.value) / 100)
                                  : parseFloat(service.value);
                                return (
                                  <div key={service.id} className="flex justify-between text-sm">
                                    <span>{service.name}</span>
                                    <span className="font-bold">+{formatKwanza(charge)}</span>
                                  </div>
                                );
                              })}
                              {manualServiceName && manualServiceValue && parseFloat(manualServiceValue) > 0 && (
                                <div className="flex justify-between text-sm">
                                  <span>{manualServiceName}</span>
                                  <span className="font-bold">
                                    +{formatKwanza(
                                      manualServiceType === 'percentual'
                                        ? (totalAmount - calculateTotals.totalDiscounts) * (parseFloat(manualServiceValue) / 100)
                                        : parseFloat(manualServiceValue)
                                    )}
                                  </span>
                                </div>
                              )}
                              <Separator className="my-2" />
                              <div className="flex justify-between">
                                <span className="font-medium text-blue-700 dark:text-blue-300">Total em Serviços:</span>
                                <span className="text-xl font-bold text-blue-600 dark:text-blue-400">
                                  +{formatKwanza(calculateTotals.totalAdditions)}
                                </span>
                              </div>
                            </div>
                          </div>
                        )}
                      </CardContent>
                    </Card>

                    {/* Summary Preview - Sempre Visível */}
                    <Card className="border-2 border-purple-500/50 bg-gradient-to-br from-purple-500/5 to-indigo-500/5">
                      <CardHeader className="border-b border-purple-500/20">
                        <CardTitle className="text-lg flex items-center gap-2">
                          <Calculator className="h-5 w-5 text-purple-500" />
                          Resumo Detalhado
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="p-6 space-y-3">
                        <div className="flex justify-between py-2">
                          <span className="text-slate-600 dark:text-slate-400">Subtotal:</span>
                          <span className="font-bold">{formatKwanza(totalAmount)}</span>
                        </div>

                        {discountValue && parseFloat(discountValue) > 0 && (
                          <div className="flex justify-between py-2 text-green-600 dark:text-green-400">
                            <span>Desconto Manual ({discountType === 'percentual' ? `${discountValue}%` : 'fixo'}):</span>
                            <span className="font-bold">
                              -{formatKwanza(
                                discountType === 'percentual'
                                  ? totalAmount * (parseFloat(discountValue) / 100)
                                  : parseFloat(discountValue)
                              )}
                            </span>
                          </div>
                        )}

                        {/* Show all services */}
                        {calculateTotals.breakdown
                          .filter((item: any) => item.type === 'addition')
                          .map((item: any, index: number) => (
                            <div key={index} className="flex justify-between py-2 text-blue-600 dark:text-blue-400">
                              <span>{item.label}:</span>
                              <span className="font-bold">
                                +{formatKwanza(item.value)}
                              </span>
                            </div>
                          ))}

                        <Separator />

                        <div className="flex items-center justify-between pt-2">
                          <span className="text-lg font-bold">Total Final:</span>
                          <span className="text-3xl font-black bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">
                            {formatKwanza(calculateTotals.finalTotal)}
                          </span>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                )}

                {/* Step 4: Payment Method */}
                {currentStep === 4 && (
                  <div className="space-y-6">
                    {/* 🎯 MELHORIA 10: Resumo Detalhado no Step 4 */}
                    <Card className="border-2 border-indigo-200 dark:border-indigo-800 bg-gradient-to-br from-indigo-50/50 to-purple-50/50 dark:from-indigo-950/20 dark:to-purple-950/20">
                      <CardHeader className="pb-3 border-b border-indigo-200 dark:border-indigo-800">
                        <CardTitle className="flex items-center gap-2 text-lg">
                          <Receipt className="h-5 w-5 text-indigo-600" />
                          Revisão Final do Pedido
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="pt-4 space-y-3">
                        <div className="grid grid-cols-2 gap-3 text-sm">
                          <div className="flex items-center gap-2">
                            <ShoppingBag className="h-4 w-4 text-muted-foreground" />
                            <span className="text-muted-foreground">Total de Itens:</span>
                            <span className="font-bold">{allItems.length}</span>
                          </div>
                          {selectedGuestIds.length > 0 && (
                            <div className="flex items-center gap-2">
                              <Users className="h-4 w-4 text-muted-foreground" />
                              <span className="text-muted-foreground">Clientes:</span>
                              <span className="font-bold">{selectedGuestIds.length}</span>
                            </div>
                          )}
                        </div>
                        
                        <Separator />
                        
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Subtotal</span>
                            <span className="font-medium">{formatKwanza(calculateTotals.subtotal)}</span>
                          </div>
                          
                          {/* 🎯 MELHORIA 12: Badge de Ajustes Aplicados */}
                          {calculateTotals.breakdown.length > 0 && (
                            <div className="space-y-1.5 pl-2 border-l-2 border-indigo-300 dark:border-indigo-700">
                              {calculateTotals.breakdown.map((item, idx) => (
                                <div key={idx} className={cn(
                                  "flex justify-between text-xs",
                                  item.type === 'discount' && "text-green-600 dark:text-green-400",
                                  item.type === 'addition' && "text-orange-600 dark:text-orange-400"
                                )}>
                                  <span className="flex items-center gap-1">
                                    {item.type === 'discount' ? '↓' : '↑'} {item.label}
                                  </span>
                                  <span className="font-medium">
                                    {item.value < 0 ? '-' : '+'}{formatKwanza(Math.abs(item.value))}
                                  </span>
                                </div>
                              ))}
                            </div>
                          )}
                          
                          <Separator />
                          
                          <div className="flex justify-between items-center pt-1">
                            <span className="font-bold text-base">TOTAL A PAGAR</span>
                            <span className="font-black text-2xl text-indigo-600 dark:text-indigo-400">
                              {formatKwanza(calculateTotals.finalTotal)}
                            </span>
                          </div>
                          
                          {calculateTotals.totalDiscounts > 0 && (
                            <div className="flex items-center gap-2 text-xs text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-950/20 p-2 rounded">
                              <Sparkles className="h-3 w-3" />
                              <span>Você economizou {formatKwanza(calculateTotals.totalDiscounts)} neste pedido!</span>
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                    
                    {/* Selection Banner */}
                    {selectedGuestIds.length > 0 && (
                      <div className="relative overflow-hidden rounded-xl bg-gradient-to-r from-purple-500/10 to-indigo-500/10 border border-purple-500/20 p-4">
                        <div className="flex items-start gap-3">
                          <CheckCircle2 className="h-5 w-5 text-purple-500 mt-0.5" />
                          <div>
                            <div className="font-semibold text-purple-900 dark:text-purple-100">
                              Checkout Individual Ativo
                            </div>
                            <div className="text-sm text-purple-700 dark:text-purple-300 mt-1 flex items-center gap-2">
                              <span>Pagando para {selectedGuestIds.length} {selectedGuestIds.length === 1 ? 'cliente' : 'clientes'}</span>
                              <span>•</span>
                              <span className="font-bold">{formatKwanza(calculateTotals.finalTotal)}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Info Banner */}
                    <div className="relative overflow-hidden rounded-xl bg-gradient-to-r from-green-500/10 to-emerald-500/10 border border-green-500/20 p-4">
                      <div className="flex items-start gap-3">
                        <CreditCard className="h-5 w-5 text-green-500 mt-0.5" />
                        <div>
                          <div className="font-semibold text-green-900 dark:text-green-100">
                            Selecione o método de pagamento
                          </div>
                          <div className="text-sm text-green-700 dark:text-green-300 mt-1">
                            Escolha como o cliente irá pagar a conta.
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Payment Methods */}
                    <Card className="border-2 border-slate-200 dark:border-slate-800">
                      <CardHeader className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20 border-b">
                        <CardTitle className="text-lg">Método de Pagamento</CardTitle>
                      </CardHeader>
                      <CardContent className="p-6">
                        <RadioGroup value={paymentMethod} onValueChange={setPaymentMethod}>
                          <div className="space-y-3">
                            {/* Dinheiro */}
                            <label className={cn(
                              "flex items-center gap-4 p-4 rounded-xl border-2 cursor-pointer transition-all",
                              paymentMethod === 'dinheiro' 
                                ? "border-green-500 bg-green-500/10" 
                                : "border-slate-200 dark:border-slate-800 hover:border-slate-300"
                            )}>
                              <RadioGroupItem value="dinheiro" id="dinheiro" />
                              <div className="flex items-center gap-3 flex-1">
                                <div className="p-2 rounded-lg bg-green-500/20">
                                  <Banknote className="h-6 w-6 text-green-600" />
                                </div>
                                <div>
                                  <div className="font-bold">Dinheiro</div>
                                  <div className="text-sm text-slate-500">Pagamento em espécie</div>
                                </div>
                              </div>
                              {paymentMethod === 'dinheiro' && (
                                <CheckCircle2 className="h-5 w-5 text-green-600" />
                              )}
                            </label>

                            {/* Multicaixa */}
                            <label className={cn(
                              "flex items-center gap-4 p-4 rounded-xl border-2 cursor-pointer transition-all",
                              paymentMethod === 'multicaixa' 
                                ? "border-green-500 bg-green-500/10" 
                                : "border-slate-200 dark:border-slate-800 hover:border-slate-300"
                            )}>
                              <RadioGroupItem value="multicaixa" id="multicaixa" />
                              <div className="flex items-center gap-3 flex-1">
                                <div className="p-2 rounded-lg bg-blue-500/20">
                                  <CreditCard className="h-6 w-6 text-blue-600" />
                                </div>
                                <div>
                                  <div className="font-bold">Multicaixa</div>
                                  <div className="text-sm text-slate-500">Pagamento por ATM</div>
                                </div>
                              </div>
                              {paymentMethod === 'multicaixa' && (
                                <CheckCircle2 className="h-5 w-5 text-green-600" />
                              )}
                            </label>

                            {/* Transferência */}
                            <label className={cn(
                              "flex items-center gap-4 p-4 rounded-xl border-2 cursor-pointer transition-all",
                              paymentMethod === 'transferencia' 
                                ? "border-green-500 bg-green-500/10" 
                                : "border-slate-200 dark:border-slate-800 hover:border-slate-300"
                            )}>
                              <RadioGroupItem value="transferencia" id="transferencia" />
                              <div className="flex items-center gap-3 flex-1">
                                <div className="p-2 rounded-lg bg-purple-500/20">
                                  <Building className="h-6 w-6 text-purple-600" />
                                </div>
                                <div>
                                  <div className="font-bold">Transferência Bancária</div>
                                  <div className="text-sm text-slate-500">Pagamento por transferência</div>
                                </div>
                              </div>
                              {paymentMethod === 'transferencia' && (
                                <CheckCircle2 className="h-5 w-5 text-green-600" />
                              )}
                            </label>

                            {/* Cartão */}
                            <label className={cn(
                              "flex items-center gap-4 p-4 rounded-xl border-2 cursor-pointer transition-all",
                              paymentMethod === 'cartao' 
                                ? "border-green-500 bg-green-500/10" 
                                : "border-slate-200 dark:border-slate-800 hover:border-slate-300"
                            )}>
                              <RadioGroupItem value="cartao" id="cartao" />
                              <div className="flex items-center gap-3 flex-1">
                                <div className="p-2 rounded-lg bg-orange-500/20">
                                  <Smartphone className="h-6 w-6 text-orange-600" />
                                </div>
                                <div>
                                  <div className="font-bold">Cartão</div>
                                  <div className="text-sm text-slate-500">Pagamento por cartão</div>
                                </div>
                              </div>
                              {paymentMethod === 'cartao' && (
                                <CheckCircle2 className="h-5 w-5 text-green-600" />
                              )}
                            </label>
                          </div>
                        </RadioGroup>
                      </CardContent>
                    </Card>

                    {/* Input de Troco (se Dinheiro) */}
                    {paymentMethod === 'dinheiro' && (
                      <Card className="border-2 border-slate-200 dark:border-slate-800">
                        <CardHeader className="bg-gradient-to-r from-amber-50 to-yellow-50 dark:from-amber-950/20 dark:to-yellow-950/20 border-b">
                          <CardTitle className="text-lg flex items-center gap-2">
                            <Banknote className="h-5 w-5 text-amber-500" />
                            Valor Recebido
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="p-6 space-y-4">
                          <div className="space-y-2">
                            <Label>Quanto o cliente deu?</Label>
                            <Input
                              type="number"
                              step="0.01"
                              value={receivedAmount}
                              onChange={(e) => setReceivedAmount(e.target.value)}
                              placeholder="0.00"
                              className="h-12 text-lg font-semibold"
                            />
                          </div>

                          {receivedAmount && parseFloat(receivedAmount) >= calculateTotals.finalTotal && (
                            <div className="relative overflow-hidden rounded-xl bg-gradient-to-r from-green-500/10 to-emerald-500/10 border border-green-500/20 p-4">
                              <div className="space-y-2">
                                <div className="flex items-center justify-between">
                                  <span className="text-sm font-medium text-green-700 dark:text-green-300">
                                    Troco a Devolver:
                                  </span>
                                  <span className="text-2xl font-bold text-green-600 dark:text-green-400">
                                    {formatKwanza(parseFloat(receivedAmount) - calculateTotals.finalTotal)}
                                  </span>
                                </div>
                              </div>
                            </div>
                          )}

                          {receivedAmount && parseFloat(receivedAmount) < calculateTotals.finalTotal && (
                            <div className="relative overflow-hidden rounded-xl bg-gradient-to-r from-red-500/10 to-rose-500/10 border border-red-500/20 p-4">
                              <div className="flex items-center gap-2 text-red-700 dark:text-red-300">
                                <AlertCircle className="h-4 w-4" />
                                <span className="text-sm font-medium">
                                  Valor insuficiente. Falta: {formatKwanza(calculateTotals.finalTotal - parseFloat(receivedAmount))}
                                </span>
                              </div>
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    )}

                    {/* Final Summary */}
                    {paymentMethod && (
                      <Card className="border-2 border-green-500/50 bg-gradient-to-br from-green-500/5 to-emerald-500/5">
                        <CardContent className="p-6">
                          <div className="space-y-4">
                            <div className="flex items-center justify-between">
                              <span className="text-lg font-semibold">Método Selecionado:</span>
                              <Badge className="bg-green-500/20 text-green-700 dark:text-green-300 border-green-500/30 text-base px-4 py-1">
                                {paymentMethod.charAt(0).toUpperCase() + paymentMethod.slice(1)}
                              </Badge>
                            </div>
                            <Separator />
                            <div className="flex items-center justify-between">
                              <span className="text-xl font-bold">Valor a Receber:</span>
                              <span className="text-4xl font-black bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                                {formatKwanza(calculateTotals.finalTotal)}
                              </span>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Navigation Buttons */}
            <div className="flex justify-between mt-6">
              <Button
                variant="outline"
                size="lg"
                onClick={() => setCurrentStep(Math.max(1, currentStep - 1))}
                disabled={currentStep === 1}
                className="rounded-xl transition-all"
              >
                <ArrowLeft className="h-5 w-5 mr-2" />
                Voltar
              </Button>
              
              {currentStep < STEPS.length ? (
                <Button
                  size="lg"
                  onClick={() => setCurrentStep(Math.min(STEPS.length, currentStep + 1))}
                  className="rounded-xl bg-gradient-to-r from-purple-500 to-indigo-500 hover:from-purple-600 hover:to-indigo-600 shadow-lg shadow-purple-500/30 transition-all hover:scale-105"
                >
                  Continuar
                  <ArrowRight className="h-5 w-5 ml-2" />
                </Button>
              ) : (
                <Button
                  size="lg"
                  disabled={
                    !paymentMethod || 
                    (paymentMethod === 'dinheiro' && receivedAmount && parseFloat(receivedAmount) < calculateTotals.finalTotal) ||
                    processPaymentMutation.isPending
                  }
                  onClick={() => setShowConfirmation(true)}
                  className="rounded-xl bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 shadow-2xl shadow-green-500/40 transition-all hover:scale-105 disabled:opacity-50 disabled:hover:scale-100"
                >
                  {processPaymentMutation.isPending ? (
                    <>
                      <div className="animate-spin h-5 w-5 mr-2 border-2 border-white border-t-transparent rounded-full" />
                      Processando...
                    </>
                  ) : (
                    <>
                      <Check className="h-5 w-5 mr-2" />
                      Finalizar Pagamento
                    </>
                  )}
                </Button>
              )}
            </div>
          </div>

          {/* Sidebar - 1 column */}
          <div className="lg:col-span-1">
            <div className="sticky top-24">
              <Card className="bg-gradient-to-br from-slate-900 to-slate-800 dark:from-slate-950 dark:to-slate-900 border-slate-700/50 shadow-2xl text-white">
                <CardHeader className="border-b border-slate-700/50">
                  <CardTitle className="flex items-center gap-2">
                    <Sparkles className="h-5 w-5 text-yellow-400" />
                    Resumo do Pedido
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6 space-y-4">
                  {loadingTables ? (
                    <div className="text-white/70 text-sm animate-pulse">
                      Carregando informações...
                    </div>
                  ) : (
                    <>
                      {/* Items Count */}
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-white/70 flex items-center gap-2">
                          <ShoppingBag className="h-4 w-4" />
                          Total de Itens
                        </span>
                        <span className="font-bold text-white">{allItems.length}</span>
                      </div>
                      
                      <Separator className="bg-white/10" />
                      
                      {/* Subtotal */}
                      <div className="flex items-center justify-between">
                        <span className="text-white/90">Subtotal</span>
                        <span className="font-bold text-xl text-white">
                          {formatKwanza(calculateTotals.subtotal)}
                        </span>
                      </div>
                      
                      {/* Breakdown */}
                      {calculateTotals.breakdown.length > 0 && (
                        <>
                          <Separator className="bg-white/10" />
                          <div className="space-y-3">
                            {calculateTotals.breakdown.map((item, index) => (
                              <div 
                                key={index}
                                className={cn(
                                  "flex items-center justify-between text-sm",
                                  item.type === 'discount' && "text-green-400",
                                  item.type === 'addition' && "text-orange-400"
                                )}
                              >
                                <span className="flex items-center gap-1">
                                  {item.type === 'discount' ? (
                                    <TrendingUp className="h-3 w-3 rotate-180" />
                                  ) : (
                                    <TrendingUp className="h-3 w-3" />
                                  )}
                                  {item.label}
                                </span>
                                <span className="font-bold">
                                  {item.value < 0 ? '-' : '+'}{formatKwanza(Math.abs(item.value))}
                                </span>
                              </div>
                            ))}
                          </div>
                        </>
                      )}
                      
                      <Separator className="bg-white/10" />
                      
                      {/* Total */}
                      <div className="pt-2">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-lg font-bold text-white">TOTAL</span>
                          <div className="text-right">
                            {calculateTotals.totalDiscounts > 0 && (
                              <div className="text-xs text-green-400 line-through">
                                {formatKwanza(calculateTotals.subtotal)}
                              </div>
                            )}
                            <div className="text-3xl font-black bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent">
                              {formatKwanza(calculateTotals.finalTotal)}
                            </div>
                          </div>
                        </div>
                        
                        {calculateTotals.totalDiscounts > 0 && (
                          <div className="text-xs text-green-400 text-right">
                            Você economizou {formatKwanza(calculateTotals.totalDiscounts)}
                          </div>
                        )}
                      </div>
                      
                      {/* 🎯 MELHORIA 11: Barra de Progresso Visual */}
                      <Separator className="bg-white/10" />
                      
                      <div className="space-y-3">
                        <div className="flex items-center justify-between text-xs text-white/60">
                          <span>Progresso do Checkout</span>
                          <span className="font-bold">{currentStep}/{STEPS.length}</span>
                        </div>
                        
                        {/* Progress Bar */}
                        <div className="relative h-2 bg-white/10 rounded-full overflow-hidden">
                          <div 
                            className="absolute inset-y-0 left-0 bg-gradient-to-r from-green-400 to-emerald-400 transition-all duration-500 ease-out"
                            style={{ width: `${(currentStep / STEPS.length) * 100}%` }}
                          />
                        </div>
                        
                        {/* Step Indicators */}
                        <div className="space-y-2">
                          {STEPS.map((step) => {
                            const Icon = step.icon;
                            const isCompleted = currentStep > step.id;
                            const isActive = currentStep === step.id;
                            
                            return (
                              <div 
                                key={step.id}
                                className={cn(
                                  "flex items-center gap-3 text-sm transition-all",
                                  isActive && "text-white font-semibold",
                                  isCompleted && "text-green-400",
                                  !isActive && !isCompleted && "text-white/40"
                                )}
                              >
                                {isCompleted ? (
                                  <Check className="h-4 w-4" />
                                ) : (
                                  <Icon className="h-4 w-4" />
                                )}
                                <span>{step.name}</span>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>

      {/* Confirmation Dialog */}
      <AlertDialog open={showConfirmation} onOpenChange={setShowConfirmation}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <CreditCard className="h-5 w-5" />
              Confirmar Pagamento
            </AlertDialogTitle>
            <AlertDialogDescription className="space-y-3 pt-4">
              <div className="space-y-2">
                <div className="flex justify-between py-2 border-b">
                  <span className="font-medium">Mesa:</span>
                  <span>{table?.number}</span>
                </div>
                <div className="flex justify-between py-2 border-b">
                  <span className="font-medium">Método:</span>
                  <span className="capitalize">{paymentMethod}</span>
                </div>
                <div className="flex justify-between py-2 border-b">
                  <span className="font-medium">Total:</span>
                  <span className="font-bold text-lg">{formatKwanza(calculateTotals.finalTotal)}</span>
                </div>
                {paymentMethod === 'dinheiro' && receivedAmount && (
                  <>
                    <div className="flex justify-between py-2 border-b">
                      <span className="font-medium">Recebido:</span>
                      <span>{formatKwanza(parseFloat(receivedAmount))}</span>
                    </div>
                    <div className="flex justify-between py-2 border-b bg-green-50 dark:bg-green-950/20 px-3 rounded">
                      <span className="font-medium text-green-700 dark:text-green-300">Troco:</span>
                      <span className="font-bold text-green-700 dark:text-green-300">
                        {formatKwanza(parseFloat(receivedAmount) - calculateTotals.finalTotal)}
                      </span>
                    </div>
                  </>
                )}
              </div>
              <div className="pt-2 text-sm text-muted-foreground">
                Esta ação não pode ser desfeita. O pagamento será registrado no sistema.
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={processPaymentMutation.isPending}>
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                processPaymentMutation.mutate();
                setShowConfirmation(false);
              }}
              disabled={processPaymentMutation.isPending}
              className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600"
            >
              {processPaymentMutation.isPending ? 'Processando...' : 'Confirmar Pagamento'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Payment Success Dialog */}
      {paymentData && table && (
        <PaymentSuccessDialog
          open={showSuccessDialog}
          onClose={() => {
            setShowSuccessDialog(false);
            setLocation(`/${fromParam}`);
          }}
          table={table}
          payment={paymentData}
          guests={ordersByGuest}
          totalAmount={calculateTotals.finalTotal}
          onPrintComplete={() => {
            toast({
              title: "Fatura impressa",
              description: "A fatura foi enviada para impressão",
            });
          }}
        />
      )}
    </div>
  );
}
