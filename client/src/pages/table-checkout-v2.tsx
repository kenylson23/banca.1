import { useState, useMemo, useEffect, useCallback } from "react";
import type { OrdersByGuestData } from "@shared/types";
import { useParams, useLocation } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api-url";
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
  Receipt,
  BadgePercent
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
import { PaymentReceiptDialog } from "@/components/PaymentReceiptDialog";
import { CheckoutSummaryPanel } from "@/components/CheckoutSummaryPanel";
import { QUERY_KEYS } from "@/lib/queryKeys";
import { invalidateAfterPayment } from "@/lib/tableInvalidations";

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
  
  // ✅ CORREÇÃO ERRO 1: Memoizar updateURL para evitar loop infinito
  const updateURL = useCallback((step: number, discount: string, discType: string, serviceFee: string, serviceFeeType: string) => {
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
  }, []); // ✅ Sem dependências - função estável
  
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
  
  // Update URL when step or adjustments change (com debounce de 300ms)
  useEffect(() => {
    const timer = setTimeout(() => {
      updateURL(currentStep, discountValue, discountType, manualServiceValue, manualServiceType);
    }, 300);

    return () => clearTimeout(timer);
  }, [currentStep, discountValue, discountType, manualServiceValue, manualServiceType, updateURL]);
  
  // Step 4: Payment
  const [paymentMethod, setPaymentMethod] = useState<string>('');
  const [receivedAmount, setReceivedAmount] = useState('');
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [showSuccessDialog, setShowSuccessDialog] = useState(false);
  const [paymentData, setPaymentData] = useState<any>(null);
  
  // ✅ SOLUÇÃO #2: Estado para feedback visual de salvamento
  const [isSavingAdjustments, setIsSavingAdjustments] = useState(false);
  
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
  
  // Fetch data - Otimizado para carregar em paralelo
  const { data: tablesData, isLoading: loadingTables } = useQuery<any[]>({
    queryKey: QUERY_KEYS.tables.withOrders(),
    staleTime: 30000, // Cache por 30s para evitar recarregamentos desnecessários
  });
  
  const table = tablesData?.find((t: any) => t.id === id);

  // ✅ OTIMIZAÇÃO: Carregar dados da sessão em paralelo imediatamente
  const { data: sessionData } = useQuery({
    queryKey: [...QUERY_KEYS.tables.sessions(id ?? ''), table?.currentSessionId],
    queryFn: async () => {
      const res = await apiFetch(`/api/tables/${id}/sessions`);
      const sessions = await res.json();
      if (!Array.isArray(sessions)) return null;
      return (
        (table?.currentSessionId ? sessions.find((s: any) => s.id === table.currentSessionId) : null) ||
        sessions.find((s: any) => s.status !== 'encerrada') ||
        sessions[0] ||
        null
      );
    },
    enabled: !!id,
    staleTime: 10000,
  });

  // ✅ Ajustes globais existentes na sessão
  const hasSessionLevelAdjustments = useMemo(() => {
    const d = parseFloat(sessionData?.discount || '0');
    const s = parseFloat(sessionData?.serviceCharge || '0');
    return (Number.isFinite(d) && d > 0) || (Number.isFinite(s) && s > 0);
  }, [sessionData]);

  // Fetch restaurant data
  const { data: restaurant } = useQuery({
    queryKey: ['/api/restaurants', table?.restaurantId],
    queryFn: async () => {
      if (!table?.restaurantId) return null;
      const res = await apiFetch(`/api/restaurants/${table.restaurantId}`);
      return res.json();
    },
    enabled: !!table?.restaurantId,
    staleTime: 300000, // Cache por 5min
  });

  // Calculate session duration
  const sessionDuration = useMemo(() => {
    if (!sessionData?.startedAt) return undefined;
    
    const start = new Date(sessionData.startedAt);
    const now = new Date();
    const diffMs = now.getTime() - start.getTime();
    
    const hours = Math.floor(diffMs / (1000 * 60 * 60));
    const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
    
    if (hours > 0) {
      return `${hours}h ${minutes}min`;
    }
    return `${minutes}min`;
  }, [sessionData]);

  // ✅ OTIMIZAÇÃO: Carregar orders em paralelo, não esperar pela table
  const { data: ordersByGuestData, isLoading: loadingOrders } = useQuery<OrdersByGuestData>({
    queryKey: QUERY_KEYS.tables.ordersByGuest(id ?? ''),
    enabled: !!id,
    staleTime: 10000,
  });
  // Determine if checkout is individual (no anonymous orders)
  const isIndividualCheckout = useMemo(() => {
    const hasAnonymous = !!(ordersByGuestData?.anonymousOrders?.length);
    return selectedGuestIds.length === 1 && selectedGuestIds[0] !== 'anonymous' && !hasAnonymous;
  }, [selectedGuestIds, ordersByGuestData]);

  // Restaurar ajustes da sessão quando dados estiverem disponíveis
  useEffect(() => {
    if (!sessionData) return;

    // ✅ Em checkout individual, NÃO puxar ajustes globais da sessão para estes campos
    if (isIndividualCheckout) return;

    // Restaurar desconto (somente se não houver valor no estado local)
    if (sessionData.discount && parseFloat(sessionData.discount) > 0 && !discountValue) {
      setDiscountValue(sessionData.discount);
      setDiscountType(sessionData.discountType || 'valor');
    }

    // Restaurar taxa de serviço (somente se não houver valor no estado local)
    if (sessionData.serviceCharge && parseFloat(sessionData.serviceCharge) > 0 && !manualServiceValue) {
      setManualServiceValue(sessionData.serviceCharge);
      setManualServiceType(sessionData.serviceChargeType || 'percentual');
      if (!manualServiceName) {
        setManualServiceName('Taxa de Serviço');
      }
    }
  }, [sessionData, isIndividualCheckout, discountValue, manualServiceValue, manualServiceName]);
  
  // 🔧 CORREÇÃO UX: Salvar ajustes com debounce (auto-save)
  const saveAdjustmentsToSession = useCallback(async () => {
    if (table?.currentSessionId) {
      setIsSavingAdjustments(true);
      try {
        const res = await apiFetch(`/api/tables/${id}/session-adjustments`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            discount: discountValue || '0',
            discountType,
            serviceCharge: manualServiceValue || '0',
            serviceChargeType: manualServiceType,
          }),
        });
        if (!res.ok) {
          throw new Error('Falha ao gravar ajustes da sessão');
        }
      } catch (err) {
        console.error('Erro ao salvar ajustes:', err);
        throw err;
      } finally {
        setIsSavingAdjustments(false);
      }
    }
  }, [table?.currentSessionId, id, discountValue, discountType, manualServiceValue, manualServiceType]);

  // ✅ UX: permitir limpar ajustes globais da sessão sem precisar "selecionar todos"
  const clearSessionAdjustments = useCallback(async () => {
    if (!table?.currentSessionId) return;

    setIsSavingAdjustments(true);
    try {
      await apiFetch(`/api/tables/${id}/session-adjustments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          discount: '0',
          discountType: 'valor',
          serviceCharge: '0',
          serviceChargeType: 'valor',
        }),
      });

      await queryClient.invalidateQueries({ queryKey: QUERY_KEYS.tables.sessions(id ?? '') });
      await queryClient.refetchQueries({ queryKey: QUERY_KEYS.tables.sessions(id ?? '') });
      await queryClient.invalidateQueries({ queryKey: QUERY_KEYS.tables.ordersByGuest(id) });

      toast({
        title: 'Ajustes globais removidos',
        description: 'Desconto e taxa globais da mesa foram zerados. Agora você pode aplicar ajustes individuais.',
      });
    } catch (err: any) {
      toast({
        title: 'Erro ao limpar ajustes globais',
        description: err?.message || 'Não foi possível zerar os ajustes da sessão.',
        variant: 'destructive',
      });
    } finally {
      setIsSavingAdjustments(false);
    }
  }, [table?.currentSessionId, id, queryClient, toast]);

  const recalculateOpenSessionsMutation = useMutation({
    mutationFn: async () => {
      const res = await apiFetch('/api/sessions/recalculate-open', { method: 'POST' });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data?.message || 'Falha ao recalcular sessões');
      }

      return data;
    },
    onSuccess: async (data) => {
      await queryClient.invalidateQueries({ queryKey: QUERY_KEYS.tables.withOrders() });
      if (id) {
        await queryClient.invalidateQueries({ queryKey: QUERY_KEYS.tables.ordersByGuest(id) });
        await queryClient.invalidateQueries({ queryKey: QUERY_KEYS.tables.sessions(id) });
        await queryClient.invalidateQueries({ queryKey: QUERY_KEYS.tables.detail(id) });
      }

      toast({
        title: 'Sessões recalculadas',
        description: `Atualizadas ${data?.updated ?? 0} sessões abertas.`,
      });
    },
    onError: (err: any) => {
      toast({
        title: 'Erro ao recalcular sessões',
        description: err?.message || 'Não foi possível recalcular as sessões abertas.',
        variant: 'destructive',
      });
    },
  });

  
  // ✅ Modo de ajustes (interpretação automática)
  // - Se existir Mesa Completa (itens não atribuídos) => modo GLOBAL (sessão)
  // - Se tudo estiver atribuído a clientes => modo INDIVIDUAL (por cliente)
  const adjustmentsMode: 'session' | 'guest' =
    (ordersByGuestData?.anonymousOrders?.length || 0) > 0 ? 'session' : 'guest';


  // ✅ Ajustes individuais existentes em convidados
  const hasGuestLevelAdjustments = useMemo(() => {
    return (ordersByGuestData?.ordersByGuest || []).some((og: any) => {
      const d = parseFloat(og?.guest?.discount || '0');
      const s = parseFloat(og?.guest?.serviceCharge || '0');
      return (Number.isFinite(d) && d > 0) || (Number.isFinite(s) && s > 0);
    });
  }, [ordersByGuestData]);

  // ✅ Desabilitar ajustes globais no Step 3 quando estiver em checkout individual ou existirem ajustes individuais
  // ✅ Bloqueio (opção 3):
  // - Ajustes GLOBAIS bloqueados se já existirem ajustes individuais
  // - Ajustes INDIVIDUAIS bloqueados se já existirem ajustes globais na sessão
  const globalAdjustmentsDisabled = hasGuestLevelAdjustments;
  const individualAdjustmentsDisabled = hasSessionLevelAdjustments;

  // Auto-save com debounce (mudanças nos campos)
  useEffect(() => {
    // ✅ Bloqueio: não salvar ajustes globais na sessão quando:
    // - checkout é individual (1 convidado)
    // - já existem ajustes individuais em convidados
    if (
      table?.currentSessionId &&
      !isIndividualCheckout &&
      !hasGuestLevelAdjustments
    ) {
      const timeoutId = setTimeout(() => {
        saveAdjustmentsToSession();
      }, 800);

      return () => clearTimeout(timeoutId);
    }
  }, [
    discountValue,
    discountType,
    manualServiceValue,
    manualServiceType,
    table?.currentSessionId,
    saveAdjustmentsToSession,
    isIndividualCheckout,
    hasGuestLevelAdjustments,
  ]);
  
  
  // ✅ OTIMIZAÇÃO: Lazy load apenas quando necessário (Step 2)
  const { data: customers = [] } = useQuery<any[]>({
    queryKey: QUERY_KEYS.customers.all(),
    enabled: currentStep >= 2, // Só carregar no Step 2+
    staleTime: 60000, // Cache por 1min
  });
  
  const { data: loyaltyProgram } = useQuery<any>({
    queryKey: ['/api/loyalty-program'],
    enabled: currentStep >= 2, // Só carregar no Step 2+
    staleTime: 60000,
  });
  
  const { data: availableCoupons = [] } = useQuery<any[]>({
    queryKey: ['/api/coupons/available', table?.restaurantId],
    enabled: currentStep >= 2 && !!table?.restaurantId, // Só carregar no Step 2+
    staleTime: 60000,
  });
  
  const selectedCustomer = customers.find((c: any) => c.id === selectedCustomerId);
  
  // ✅ OTIMIZAÇÃO: Prefetch do Step 2 enquanto usuário está no Step 1
  useEffect(() => {
    if (currentStep === 1 && table?.restaurantId) {
      // Prefetch em background após 2s (usuário provavelmente vai revisar primeiro)
      const timer = setTimeout(() => {
        queryClient.prefetchQuery({
          queryKey: QUERY_KEYS.customers.all(),
          staleTime: 60000,
        });
        queryClient.prefetchQuery({
          queryKey: ['/api/loyalty-program'],
          staleTime: 60000,
        });
        queryClient.prefetchQuery({
          queryKey: ['/api/coupons/available', table.restaurantId],
          staleTime: 60000,
        });
      }, 2000); // Espera 2s para não impactar carregamento inicial
      
      return () => clearTimeout(timer);
    }
  }, [currentStep, table?.restaurantId, queryClient]);
  
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
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.customers.all() });
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
      
      // ✅ SOLUÇÃO #2: Garantir que ajustes foram salvos antes de processar pagamento
      if (table?.currentSessionId && (discountValue || manualServiceValue)) {
        console.log('🔄 [CHECKOUT] Salvando ajustes antes de processar pagamento...');
        try {
          await saveAdjustmentsToSession();
          console.log('✅ [CHECKOUT] Ajustes salvos com sucesso antes do pagamento');
          // Pequeno delay para garantir propagação
          await new Promise(resolve => setTimeout(resolve, 300));
        } catch (error) {
          console.error('❌ [CHECKOUT] Erro ao salvar ajustes:', error);
          // Continuar mesmo se falhar, pois agora também enviamos no payload
        }
      }
      
      // Build services array
      const services: any[] = [];
      const safeAvailableServices = Array.isArray(availableServices) ? availableServices : [];
      const afterDiscounts = Math.max(0, calculateTotals.subtotal - calculateTotals.totalDiscounts);
      
      // Add automatic services
      safeAvailableServices.forEach((service: any) => {
        if (service.applyAutomatically === 1) {
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
        const service = safeAvailableServices.find((s: any) => s.id === serviceId);
        if (service && service.applyAutomatically === 0) {
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
      if (manualServiceValue && parseFloat(manualServiceValue) > 0) {
        const calculatedAmount = manualServiceType === 'percentual'
          ? afterDiscounts * (parseFloat(manualServiceValue) / 100)
          : parseFloat(manualServiceValue);
        
        services.push({
          serviceId: null,
          serviceName: manualServiceName || 'Taxa de Serviço',
          chargeType: manualServiceType,
          value: manualServiceValue,
          calculatedAmount: calculatedAmount.toFixed(2),
        });
      }

      // Determinar se é pagamento geral da mesa ou individual de convidados específicos
      const isTableWidePayment =
        adjustmentsMode === 'session' ||
        selectedGuestIds.length === 0 ||
        selectedGuestIds.length === ordersByGuest.length ||
        selectedGuestIds.includes('anonymous') ||
        ordersByGuest.some((og: any) => og.guest?.id === 'anonymous');

      // ✅ MODO INDIVIDUAL (apenas quando um subconjunto de convidados REAIS está selecionado)
      if (!isTableWidePayment && adjustmentsMode === 'guest' && selectedGuestIds.length > 0) {
        // ✅ Bloqueio: não permitir ajustes individuais se já existir ajuste global na sessão
        if (
          hasSessionLevelAdjustments &&
          ((discountValue && parseFloat(discountValue) > 0) || (manualServiceValue && parseFloat(manualServiceValue) > 0))
        ) {
          throw new Error('Existem ajustes globais na mesa. Remova-os antes de aplicar descontos/taxas individuais por convidado.');
        }

        const selectedGuests = ordersByGuest
          .filter((og: any) => selectedGuestIds.includes(og.guest.id) && og.guest.id !== 'anonymous')
          .filter((og: any) => og.guest?.status !== 'pago');

        if (selectedGuests.length === 0) {
          throw new Error('Nenhum convidado válido selecionado para pagamento.');
        }

        const getGuestSubtotalBase = (og: any) => parseFloat(og.subtotal || '0');
        const getGuestTotalSaved = (og: any) => parseFloat(og.guest?.guestTotal ?? og.subtotal ?? '0');

        const hasInlineAdjustments =
          (discountValue && parseFloat(discountValue) > 0) ||
          (manualServiceValue && parseFloat(manualServiceValue) > 0);

        const applyGuestAdjustments = (base: number) => {
          let discount = 0;
          let additions = 0;

          if (discountValue && parseFloat(discountValue) > 0) {
            discount = discountType === 'percentual'
              ? base * (parseFloat(discountValue) / 100)
              : parseFloat(discountValue);
            discount = Math.min(discount, base);
          }

          const afterDiscount = Math.max(0, base - discount);

          if (manualServiceValue && parseFloat(manualServiceValue) > 0) {
            const charge = manualServiceType === 'percentual'
              ? afterDiscount * (parseFloat(manualServiceValue) / 100)
              : parseFloat(manualServiceValue);
            additions += charge;
          }

          const final = Math.max(0, afterDiscount + additions);
          return { discount, additions, final };
        };

        // Pagamento individual em massa: taxa/desconto EXATO por convidado (não dividir)
        const results: any[] = [];
        for (const og of selectedGuests) {
          const guestId = og.guest.id;
          const guestSubtotalBase = getGuestSubtotalBase(og);
          const guestTotalSaved = getGuestTotalSaved(og);
          const { final } = applyGuestAdjustments(guestSubtotalBase);

          const amountToCharge = hasInlineAdjustments ? final : guestTotalSaved;

          const guestPayload: any = {
            amount: amountToCharge.toFixed(2),
            paymentMethod,
            notes: receivedAmount
              ? `Valor recebido: ${parseFloat(receivedAmount).toFixed(2)}`
              : selectedGuests.length > 1
                ? 'Pagamento individual (em massa)'
                : 'Pagamento individual',
            receivedAmount: receivedAmount ? parseFloat(receivedAmount) : undefined,
          };

          if (discountValue && parseFloat(discountValue) > 0) {
            guestPayload.discount = discountValue;
            guestPayload.discountType = discountType;
          }
          if (manualServiceValue && parseFloat(manualServiceValue) > 0) {
            guestPayload.serviceCharge = manualServiceValue;
            guestPayload.serviceChargeType = manualServiceType;
          }

          const res = await apiRequest('POST', `/api/table-guests/${guestId}/payment`, guestPayload);
          results.push(await res.json());
        }

        return {
          success: true,
          mode: 'guest',
          guestCount: selectedGuests.length,
          results,
        };
      }

      // ✅ MODO GLOBAL (mesa completa / sessão geral)
      console.log('🎯 [CHECKOUT] Usando rota de pagamento GERAL da mesa:', {
        selectedGuestCount: selectedGuestIds.length,
        route: `/api/tables/${id}/payment`
      });

      // ✅ Bloqueio: não permitir aplicar ajustes globais se já existirem ajustes individuais
      if (hasGuestLevelAdjustments && ((discountValue && parseFloat(discountValue) > 0) || (manualServiceValue && parseFloat(manualServiceValue) > 0))) {
        throw new Error('Existem ajustes individuais em convidados. Remova-os antes de aplicar ajustes globais na mesa.');
      }

      // Pagamento geral da mesa (todos os convidados ou múltiplos)
      const payload = {
        tableId: id,
        sessionId: table.currentSessionId,
        amount: calculateTotals.finalTotal.toFixed(2),
        paymentMethod,
        services: services.length > 0 ? services : undefined,
        discount: discountValue ? discountValue : undefined,
        discountType: discountValue ? discountType : undefined,
        serviceCharge: manualServiceValue ? manualServiceValue : undefined,
        serviceChargeType: manualServiceType ? manualServiceType : undefined,
        notes: receivedAmount ? `Valor recebido: ${parseFloat(receivedAmount).toFixed(2)}` : undefined,
        receivedAmount: receivedAmount ? parseFloat(receivedAmount) : undefined,
      };

      console.log('🎯 [CHECKOUT] Payload com desconto e taxa:', payload);

      const res = await apiRequest('POST', `/api/tables/${id}/payment`, payload);
      return res.json();
    },
    onSuccess: async (data) => {
      console.log('🔍 [CHECKOUT] Pagamento processado com sucesso:', data);
        // A rota global responde { success, payment }, enquanto algumas
        // rotas legadas devolvem o pagamento diretamente ou dentro de
        // tablePayment. Normalizar aqui mantém o diálogo independente da rota.
        const payment = data?.payment
          ?? data?.tablePayment
          ?? data?.guestPayment
          ?? data?.results?.[0]?.tablePayment
          ?? data?.results?.[0]?.guestPayment
          ?? data;
        setPaymentData(payment);
      setShowSuccessDialog(true);
      
      if (!id) return;

      // Invalidar múltiplas queries para sincronizar tudo
      console.log('🔍 [CHECKOUT] Invalidando queries para mesa:', id);
      invalidateAfterPayment(queryClient, id);
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.tables.ordersByGuest(id) }); // Para TableDetailsDialog e QuickOrder
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.tables.sessions(id) });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.tables.detail(id) });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.tables.withOrders() });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.tables.open() });
      
      await queryClient.refetchQueries({ queryKey: QUERY_KEYS.tables.ordersByGuest(id) });

      console.log('🔍 [CHECKOUT] Queries invalidadas. TableDetailsDialog deve refetch agora.');
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

  
  // ✅ Sincronizar seleção automática e filtrar convidados pagos
  useEffect(() => {
    if (!ordersByGuest.length) return;

    setSelectedGuestIds((prev) => {
      // Se nenhuma seleção existia, auto-selecionar convidados não pagos
      if (prev.length === 0) {
        return ordersByGuest
          .filter((og: any) => og.guest?.status !== 'pago')
          .map((og: any) => og.guest.id);
      }
      // Caso contrário, remover apenas convidados que mudaram para status 'pago'
      return prev.filter((id) => {
        const og = ordersByGuest.find((g: any) => g.guest?.id === id);
        return og && og.guest?.status !== 'pago';
      });
    });
  }, [ordersByGuest]);
  
  // Filter guests based on selection (if any selected, show only those)
  const filteredOrdersByGuest = useMemo(() => 
    selectedGuestIds.length > 0
      ? ordersByGuest.filter((og: any) => selectedGuestIds.includes(og.guest.id))
      : ordersByGuest,
    [ordersByGuest, selectedGuestIds]
  );

  // ✅ CORREÇÃO ERRO 3: Calcular allItems sempre (usado no Step 4 para mostrar total de itens)
  const allItems = useMemo(() => {
    return filteredOrdersByGuest.flatMap((og: any) => 
      (og.orders || []).flatMap((order: any) => 
        (order.items || []).map((item: any) => ({
          ...item,
          menuItemName: item.menuItem?.name || item.name || 'Item',
          totalPrice: (parseFloat(item.price || 0) * (item.quantity || 0)).toString(),
          guestName: og.guest.name || `Cliente ${og.guest.guestNumber}`,
          guestId: og.guest.id
        }))
      )
    );
  }, [filteredOrdersByGuest]); // ✅ Sempre calculado, não apenas no Step 1

  // Subtotal real dos itens da sessão, sem descontos/taxas já persistidos.
  // `ordersByGuestData.totalAmount` representa o total final da sessão e
  // pode já incluir a taxa de serviço global.
  const tableItemsSubtotal = useMemo(() => {
    const assignedSubtotal = ordersByGuest
      .filter((og: any) => og.guest?.id !== 'anonymous')
      .reduce((sum: number, og: any) => sum + (parseFloat(og.subtotal || '0') || 0), 0);
    const anonymousSubtotal = anonymousOrders.reduce(
      (sum: number, order: any) => sum + (parseFloat(order.totalPrice || '0') || 0),
      0
    );

    return assignedSubtotal + anonymousSubtotal;
  }, [ordersByGuest, anonymousOrders]);
  
  // ✅ CORREÇÃO ERRO 4: Cálculo de totalAmount mais robusto
  const totalAmount = useMemo(() => {
    // ✅ Modo GLOBAL (Mesa Completa): ignorar seleção e usar sempre o total da mesa
    if (adjustmentsMode === 'session') {
      return tableItemsSubtotal;
    }

    // Prioridade 1: Se há guests selecionados, usar subtotal deles
    if (selectedGuestIds.length > 0) {
      // ✅ Nunca incluir convidados já pagos no total do checkout
      return filteredOrdersByGuest
        .filter((og: any) => og.guest?.status !== 'pago')
        .reduce((sum: number, og: any) => sum + parseFloat(og.subtotal || 0), 0);
    }
    
    // Prioridade 2: Se há totalAmount do backend, usar
    if (ordersByGuestData?.totalAmount && Number(ordersByGuestData.totalAmount) > 0) {
      return Number(ordersByGuestData.totalAmount);
    }
    
    // Prioridade 3: Calcular de todos os guests (sem filtro)
    if (ordersByGuest.length > 0) {
      return ordersByGuest
        .filter((og: any) => og.guest?.status !== 'pago')
        .reduce((sum: number, og: any) => sum + parseFloat(og.subtotal || 0), 0);
    }
    
    // Fallback: Calcular de allItems (última opção)
    return allItems.reduce((sum: number, item: any) => sum + parseFloat(item.totalPrice || 0), 0);
  }, [adjustmentsMode, selectedGuestIds, filteredOrdersByGuest, ordersByGuestData, ordersByGuest, allItems, tableItemsSubtotal]);
  
  // ✅ OTIMIZAÇÃO CRÍTICA: Só carregar services no Step 3+ (não no Step 1)
  // (precisa estar ANTES de calculateTotals, pois calculateTotals depende de availableServices)
  const { data: availableServices = [] } = useQuery<any[]>({
    queryKey: ['/api/services/applicable', totalAmount],
    queryFn: async () => {
      const response = await apiRequest('POST', '/api/services/applicable', {
        orderType: 'mesa',
        orderValue: totalAmount,
      });
      return response.json();
    },
    enabled: currentStep >= 3 && totalAmount > 0, // ✅ Só no Step 3+
    staleTime: 60000, // Cache por 1min
  });
  
  // ✅ OTIMIZAÇÃO: Cálculo detalhado só quando há ajustes ou Step 3+
  const calculateTotals = useMemo(() => {
    // 🔧 FIX: Usar totalAmount do backend como fonte de verdade quando disponível
    const backendTotal = ordersByGuestData?.totalAmount && Number(ordersByGuestData.totalAmount) > 0
      ? Number(ordersByGuestData.totalAmount)
      : null;

    // ✅ Modo INDIVIDUAL: aplicar descontos/taxas por convidado (valor exato por convidado)
    if (adjustmentsMode === 'guest') {
      const selected = selectedGuestIds.length > 0
        ? ordersByGuest.filter((og: any) => selectedGuestIds.includes(og.guest.id))
        : ordersByGuest;

      const unpaid = selected.filter((og: any) => og.guest?.status !== 'pago');

      const getGuestSubtotalBase = (og: any) => parseFloat(og.subtotal || '0');
      const getGuestTotalSaved = (og: any) => parseFloat(og.guest?.guestTotal ?? og.subtotal ?? '0');
      const hasInlineAdjustments =
        (discountValue && parseFloat(discountValue) > 0) ||
        (manualServiceValue && parseFloat(manualServiceValue) > 0);

      const applyOne = (base: number) => {
        let discount = 0;
        let additions = 0;

        if (discountValue && parseFloat(discountValue) > 0) {
          discount = discountType === 'percentual'
            ? base * (parseFloat(discountValue) / 100)
            : parseFloat(discountValue);
          discount = Math.min(discount, base);
        }

        const afterDiscount = Math.max(0, base - discount);

        if (manualServiceValue && parseFloat(manualServiceValue) > 0) {
          const charge = manualServiceType === 'percentual'
            ? afterDiscount * (parseFloat(manualServiceValue) / 100)
            : parseFloat(manualServiceValue);
          additions += charge;
        }

        return { final: Math.max(0, afterDiscount + additions), discount, additions };
      };

      let subtotal = 0;
      let discounts = 0;
      let additions = 0;

      unpaid.forEach((og: any) => {
        const base = getGuestSubtotalBase(og);
        const savedTotal = getGuestTotalSaved(og);

        subtotal += base;

        if (hasInlineAdjustments) {
          const applied = applyOne(base);
          discounts += applied.discount;
          additions += applied.additions;
        } else {
          const gDiscountRaw = parseFloat(og.guest?.discount || '0');
          const gDiscountType = og.guest?.discountType || 'valor';
          const gServiceRaw = parseFloat(og.guest?.serviceCharge || '0');
          const gServiceType = og.guest?.serviceChargeType || 'valor';

          let dVal = 0;
          if (Number.isFinite(gDiscountRaw) && gDiscountRaw > 0) {
            dVal = gDiscountType === 'percentual' ? base * (Math.min(gDiscountRaw, 100) / 100) : gDiscountRaw;
            dVal = Math.min(dVal, base);
          }

          const afterD = Math.max(0, base - dVal);

          let sVal = 0;
          if (Number.isFinite(gServiceRaw) && gServiceRaw > 0) {
            sVal = gServiceType === 'percentual' ? afterD * (gServiceRaw / 100) : gServiceRaw;
          }

          discounts += dVal;
          additions += sVal;
        }
      });

      const breakdown: any[] = [];
      if (discounts > 0) {
        breakdown.push({
          type: 'discount',
          label: discountValue && parseFloat(discountValue) > 0
            ? `Desconto individual (${unpaid.length} cliente${unpaid.length === 1 ? '' : 's'})`
            : `Desconto de convidado (${unpaid.length} cliente${unpaid.length === 1 ? '' : 's'})`,
          value: -discounts,
        });
      }
      if (additions > 0) {
        breakdown.push({
          type: 'addition',
          label: manualServiceValue && parseFloat(manualServiceValue) > 0
            ? `Taxa individual (${unpaid.length} cliente${unpaid.length === 1 ? '' : 's'})`
            : `Taxa de convidado (${unpaid.length} cliente${unpaid.length === 1 ? '' : 's'})`,
          value: additions,
        });
      }

      // ✅ CORREÇÃO: usar cálculo local em tempo real como fonte de verdade
      // O backendTotal só é atualizado após pagamento, então estava defasado durante o checkout
      const localFinalTotal = Math.max(0, subtotal - discounts + additions);
      const finalTotal = Number.isFinite(localFinalTotal) ? localFinalTotal : (backendTotal ?? 0);

      return {
        subtotal,
        totalDiscounts: discounts,
        totalAdditions: additions,
        finalTotal,
        breakdown,
      };
    }

    // Cálculo simplificado para Steps iniciais
    if (currentStep < 3 && !discountValue && !appliedCoupon && !loyaltyPointsToRedeem) {
      const initialSubtotal = adjustmentsMode === 'session' ? tableItemsSubtotal : totalAmount;
      return {
        subtotal: initialSubtotal,
        totalDiscounts: 0,
        totalAdditions: 0,
        finalTotal: initialSubtotal,
        breakdown: []
      };
    }
    
    let subtotal = adjustmentsMode === 'session' ? tableItemsSubtotal : totalAmount;
    let discounts = 0;
    let additions = 0;
    const breakdown: any[] = [];
    const safeAvailableServices = Array.isArray(availableServices) ? availableServices : [];
    
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
    safeAvailableServices.forEach((service: any) => {
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
      const service = safeAvailableServices.find((s: any) => s.id === serviceId);
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
    if (manualServiceValue && parseFloat(manualServiceValue) > 0) {
      const charge = manualServiceType === 'percentual'
        ? afterDiscounts * (parseFloat(manualServiceValue) / 100)
        : parseFloat(manualServiceValue);
      additions += charge;
      breakdown.push({
        type: 'addition',
        label: `${manualServiceName || 'Taxa de Serviço'} (${manualServiceType === 'percentual' ? manualServiceValue + '%' : 'fixa'})`,
        value: charge
      });
    }
    
    // ✅ CORREÇÃO: calcular em tempo real a partir do subtotal local
    const finalTotal = Math.max(0, afterDiscounts + additions);
    
    return {
      subtotal,
      totalDiscounts: discounts,
      totalAdditions: additions,
      finalTotal,
      breakdown
    };
  }, [totalAmount, tableItemsSubtotal, discountValue, discountType, appliedCoupon, loyaltyPointsToRedeem, selectedServices, manualServiceName, manualServiceValue, manualServiceType, availableServices, loyaltyProgram, selectedGuestIds, ordersByGuest, adjustmentsMode, currentStep, ordersByGuestData]);

  // ✅ Totais de pagamento (precisa vir APÓS calculateTotals)
  const paidAmount = ordersByGuestData?.paidAmount 
    ? Number(ordersByGuestData.paidAmount)
    : 0;
  const totalForPending = ordersByGuestData?.totalAmount && Number(ordersByGuestData.totalAmount) > 0
    ? Number(ordersByGuestData.totalAmount)
    : calculateTotals.finalTotal;
  const remainingAmount = Math.max(0, totalForPending - paidAmount);
  const hasGuests = ordersByGuest.length > 0;

  // ✅ OTIMIZAÇÃO: Mostrar layout imediatamente com skeleton
  const isInitialLoading = loadingTables && !table;
  
  if (isInitialLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 border-4 border-slate-900 dark:border-slate-100 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-lg font-medium text-slate-700 dark:text-slate-300">Carregando checkout...</p>
        </div>
      </div>
    );
  }

  // Table not found
  if (!table) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950">
        <div className="text-center space-y-4 p-8">
          <AlertCircle className="h-16 w-16 mx-auto text-red-500" />
          <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100">Mesa não encontrada</h2>
          <p className="text-slate-600 dark:text-slate-400">A mesa com ID "{id}" não existe ou foi removida.</p>
          <Button
            onClick={() => setLocation(`/${fromParam}`)}
            className="bg-slate-900 hover:bg-slate-800 dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-slate-200"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar para {fromParam === 'open-tables' ? 'Mesas Abertas' : 'Mesas'}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      {/* Header */}
      <div className="sticky top-0 z-50 bg-white dark:bg-slate-950 border-b">
        <div className="container mx-auto px-4 py-3 max-w-7xl">
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
              <Badge className="bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900 border-0 px-4 py-2 text-lg font-bold">
                Mesa {table.number}
              </Badge>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-6 max-w-5xl">
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
                        "relative flex items-center justify-center w-10 h-10 rounded-full border-2 transition-all duration-300",
                        isActive && "border-slate-900 bg-slate-900 text-white dark:border-slate-100 dark:bg-slate-100 dark:text-slate-900",
                        isCompleted && "border-green-500 bg-green-500",
                        !isActive && !isCompleted && "border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900"
                      )}
                    >
                      {isCompleted ? (
                        <Check className="h-5 w-5 text-white" />
                      ) : (
                        <Icon className={cn(
                          "h-5 w-5",
                          isActive && "text-white",
                          !isActive && "text-slate-400 dark:text-slate-600"
                        )} />
                      )}
                    </div>
                    
                    <div className="mt-3 text-center">
                        <div className={cn(
                          "text-sm font-bold transition-colors",
                          isActive && "text-slate-900 dark:text-slate-100",
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
                    <div className="flex-1 h-0.5 mx-2 mb-6">
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
         <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content - 2 columns */}
          <div className="lg:col-span-2">
            <Card className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-lg">
              <CardHeader className="border-b border-slate-200 dark:border-slate-800">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg flex items-center gap-3">
                    {(() => {
                      const StepIcon = STEPS[currentStep - 1].icon;
                      return (
                        <div className="p-2 rounded-lg bg-slate-900 dark:bg-slate-100">
                          <StepIcon className="h-4 w-4 text-white dark:text-slate-900" />
                        </div>
                      );
                    })()}
                    {STEPS[currentStep - 1].name}

                    {[1, 3, 4].includes(currentStep) && (
                      <Badge
                        variant={adjustmentsMode === 'session' ? 'default' : 'secondary'}
                        className="ml-2"
                        title={
                          adjustmentsMode === 'session'
                            ? 'Modo Global: há itens na Mesa Completa (não atribuídos)'
                            : 'Modo Individual: todos os itens estão atribuídos a clientes'
                        }
                      >
                        {adjustmentsMode === 'session' ? 'Mesa Completa (Global)' : 'Por Cliente (Individual)'}
                      </Badge>
                    )}
                  </CardTitle>
                  
                  {/* 🔧 INDICADOR VISUAL: Mostrar ajustes aplicados com opção de remover */}
                  <div className="flex gap-2">
                    {/* ✅ SOLUÇÃO #2: Indicador de salvamento */}
                    {isSavingAdjustments && (
                      <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-amber-100 dark:bg-amber-900/30 border border-amber-300 dark:border-amber-700 animate-pulse">
                        <div className="h-3 w-3 border-2 border-amber-600 border-t-transparent rounded-full animate-spin"></div>
                        <span className="text-xs font-semibold text-amber-700 dark:text-amber-300">
                          Salvando...
                        </span>
                      </div>
                    )}
                    
                    {discountValue && parseFloat(discountValue) > 0 && (
                      <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-green-100 dark:bg-green-900/30 border border-green-300 dark:border-green-700 group hover:bg-green-200 dark:hover:bg-green-900/50 transition-colors">
                        <BadgePercent className="h-4 w-4 text-green-600 dark:text-green-400" />
                        <span className="text-xs font-semibold text-green-700 dark:text-green-300">
                          Desconto: {discountType === 'percentual' ? `${discountValue}%` : `${discountValue} Kz`}
                        </span>
                        <button
                          onClick={async (e) => {
                            e.stopPropagation();
                            setDiscountValue('');
                            setDiscountType('valor');
                            if (!isIndividualCheckout) {
                              await saveAdjustmentsToSession();
                            }
                            toast({
                              title: "Desconto removido",
                              description: isIndividualCheckout
                                ? "O desconto individual foi limpo"
                                : "O desconto foi removido com sucesso",
                            });
                          }}
                          className="ml-1 p-0.5 rounded-full hover:bg-green-300 dark:hover:bg-green-800 transition-colors opacity-0 group-hover:opacity-100"
                          title="Remover desconto"
                        >
                          <X className="h-3 w-3 text-green-700 dark:text-green-300" />
                        </button>
                      </div>
                    )}
                    {manualServiceValue && parseFloat(manualServiceValue) > 0 && (
                      <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-600 group hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors">
                        <BadgePercent className="h-4 w-4 text-slate-500 dark:text-slate-400" />
                        <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                          Desconto: {discountType === 'percentual' ? `${discountValue}%` : `${discountValue} Kz`}
                        </span>
                        <button
                          onClick={async (e) => {
                            e.stopPropagation();
                            setDiscountValue('');
                            setDiscountType('valor');
                            if (!isIndividualCheckout) {
                              await saveAdjustmentsToSession();
                            }
                            toast({
                              title: "Desconto removido",
                              description: isIndividualCheckout
                                ? "O desconto individual foi limpo"
                                : "O desconto foi removido com sucesso",
                            });
                          }}
                          className="ml-1 p-0.5 rounded-full hover:bg-slate-300 dark:hover:bg-slate-600 transition-colors opacity-0 group-hover:opacity-100"
                          title="Remover desconto"
                        >
                          <X className="h-3 w-3 text-slate-600 dark:text-slate-300" />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-5">
                {/* Step 1: Review Items & Guests */}
                {currentStep === 1 && (
                  <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
                    {(globalAdjustmentsDisabled || (isIndividualCheckout && individualAdjustmentsDisabled)) && (
                      <div className="rounded-xl border border-amber-300 bg-amber-50 p-4 text-amber-900 dark:border-amber-800 dark:bg-amber-950/30 dark:text-amber-200">
                        <div className="font-semibold">
                          {isIndividualCheckout ? 'Ajustes individuais bloqueados' : 'Ajustes globais bloqueados'}
                        </div>
                        <div className="text-sm mt-1">
                          {isIndividualCheckout
                            ? 'Esta mesa já tem ajustes globais (sessão). Remova-os antes de aplicar descontos/taxas individuais por convidado.'
                            : 'Existem ajustes individuais em convidados. Remova-os antes de aplicar descontos/taxas globais na mesa.'}
                        </div>

                        {isIndividualCheckout && individualAdjustmentsDisabled && (
                          <div className="mt-3">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={clearSessionAdjustments}
                              disabled={isSavingAdjustments}
                              className="border-amber-400 text-amber-900 hover:bg-amber-100 dark:border-amber-700 dark:text-amber-200 dark:hover:bg-amber-900/30"
                            >
                              Limpar ajustes globais da mesa
                            </Button>
                          </div>
                        )}
                      </div>
                    )}
                    {/* Info Banner */}
                    <div className="relative overflow-hidden rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-4">
                      <div className="flex items-start gap-3">
                        <AlertCircle className="h-5 w-5 text-slate-500 dark:text-slate-400 mt-0.5" />
                        <div>
                          <div className="font-semibold text-slate-900 dark:text-slate-100">
                            Revise os itens antes de prosseguir
                          </div>
                          <div className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                            Verifique se todos os itens e clientes estão corretos. Você pode selecionar clientes específicos para checkout individual.
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Resumo Estatístico */}
                     <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <Card className="p-3 bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700">
                          <div className="text-xs text-slate-600 dark:text-slate-400 mb-1">Total Clientes</div>
                          <div className="text-xl font-bold text-slate-900 dark:text-slate-100">{ordersByGuest.length}</div>
                        </Card>
                        <Card className="p-3 bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700">
                          <div className="text-xs text-slate-600 dark:text-slate-400 mb-1">Total Itens</div>
                          <div className="text-xl font-bold text-slate-900 dark:text-slate-100">{allItems.length}</div>
                        </Card>
                        <Card className="p-3 bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700">
                          <div className="text-xs text-slate-600 dark:text-slate-400 mb-1">Média/Cliente</div>
                          <div className="text-xl font-bold text-slate-900 dark:text-slate-100">
                            {ordersByGuest.length > 0 ? formatKwanza(calculateTotals.subtotal / ordersByGuest.length) : '0 Kz'}
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
                                setSelectedGuestIds(
                                  ordersByGuest
                                    .filter((og: any) => og.guest?.status !== 'pago')
                                    .map((og: any) => og.guest.id)
                                );
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
                       <div className="flex flex-col sm:flex-row gap-3">
                         <Input
                           placeholder="🔍 Buscar cliente..."
                           value={searchQuery}
                           onChange={(e) => setSearchQuery(e.target.value)}
                           className="flex-1"
                         />
                         <Select value={sortBy} onValueChange={(v: any) => setSortBy(v)}>
                           <SelectTrigger className="w-full sm:w-[200px]">
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

                        <ScrollArea
                          className="h-[58vh] min-h-[280px] max-h-[560px] rounded-lg border border-slate-200 dark:border-slate-800 pr-3"
                          aria-label="Lista de itens por cliente"
                        >
                         <div className="space-y-4 p-2">
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
                            
                            // Subtotal bruto do convidado (sem ajustes)
                            const guestSubtotal = guestOrder.subtotal
                              ? parseFloat(guestOrder.subtotal)
                              : guestItems.reduce((sum: number, item: any) =>
                                  sum + parseFloat(item.totalPrice || 0),
                                  0
                                );

                            // Total final do convidado (com ajustes individuais), vindo do backend
                            const guestTotalWithAdjustments = guestOrder.guest?.guestTotal
                              ? parseFloat(guestOrder.guest.guestTotal)
                              : null;

                            const guestTotal = guestTotalWithAdjustments ?? guestSubtotal;
                            const hasGuestAdjustments =
                              guestTotalWithAdjustments !== null &&
                              Math.abs(guestTotalWithAdjustments - guestSubtotal) > 0.009;

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
                                    ? "border-slate-900 bg-slate-50 dark:border-slate-100 dark:bg-slate-800/50" 
                                    : "border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700"
                                )}
                              >
                                {isPaid && (
                                  <div className="absolute inset-0 bg-green-500/5 rounded-xl pointer-events-none" />
                                )}
                                {/* Guest Header */}
                                <div className="flex items-center gap-3 p-3 border-b border-slate-200 dark:border-slate-800">
                                  <Checkbox
                                    checked={!isPaid && isSelected}
                                    disabled={isPaid}
                                    onCheckedChange={(checked) => {
                                      if (isPaid) return;
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
                                      <Users className="h-4 w-4 text-slate-500 dark:text-slate-400" />
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
                                    {hasGuestAdjustments && (
                                      <div className="text-xs text-slate-500 dark:text-slate-400">
                                        Subtotal: {formatKwanza(guestSubtotal)}
                                      </div>
                                    )}
                                     <div className="text-lg font-bold text-slate-900 dark:text-slate-100">
                                      {formatKwanza(guestTotal)}
                                    </div>
                                    {hasGuestAdjustments && (
                                      <div className="text-xs font-semibold text-slate-600 dark:text-slate-400">
                                        Total (com ajustes)
                                      </div>
                                    )}
                                  </div>
                                </div>

                                {/* Guest Items */}
                                <div className="p-3 space-y-1.5">
                                  {itemCount === 0 ? (
                                    <div className="py-4 text-center text-slate-500">
                                      <AlertCircle className="h-6 w-6 mx-auto mb-1.5 text-slate-300" />
                                      <p className="text-xs">Nenhum item para este cliente</p>
                                    </div>
                                  ) : (
                                    guestItems.map((item: any, index: number) => (
                                      <div 
                                        key={`${item.id}-${index}`}
                                        className="py-1.5 px-2 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
                                      >
                                        <div className="flex items-center justify-between">
                                          <div className="flex items-center gap-2 flex-1">
                                            <div className="flex items-center justify-center w-6 h-6 rounded-md bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold text-xs">
                                              {item.quantity}×
                                            </div>
                                            <div className="flex-1 min-w-0">
                                              <div className="font-medium text-sm truncate">{item.menuItemName}</div>
                                              <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                                                {formatKwanza(item.unitPrice)} cada
                                              </div>
                                              {item.options && item.options.length > 0 && (
                                                <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 flex items-center gap-1">
                                                  <Settings className="h-3 w-3" />
                                                  {item.options.map((opt: any) => opt.name).join(', ')}
                                                </div>
                                              )}
                                              {item.notes && (
                                                <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 flex items-center gap-1">
                                                  <AlertCircle className="h-3 w-3" />
                                                  {item.notes}
                                                </div>
                                              )}
                                            </div>
                                          </div>
                                          <span className="font-semibold text-slate-700 dark:text-slate-300 text-sm ml-2">
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
                        <div className="relative overflow-hidden rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-4">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <CheckCircle2 className="h-5 w-5 text-slate-500 dark:text-slate-400" />
                              <div>
                                <div className="font-semibold text-slate-900 dark:text-slate-100">
                                  {selectedGuestIds.length} {selectedGuestIds.length === 1 ? 'cliente selecionado' : 'clientes selecionados'}
                                </div>
                                <div className="text-sm text-slate-600 dark:text-slate-400 mt-0.5">
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
                                  setCurrentStep(2);
                                }}
                                className="bg-slate-900 hover:bg-slate-800 dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-slate-200"
                              >
                                Continuar com Selecionados
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setSelectedGuestIds([])}
                                className="text-slate-600 border-slate-300 hover:bg-slate-100 dark:text-slate-400 dark:border-slate-600 dark:hover:bg-slate-800"
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
                      <div className="relative overflow-hidden rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-4">
                        <div className="flex items-start gap-3">
                          <CheckCircle2 className="h-5 w-5 text-slate-500 dark:text-slate-400 mt-0.5" />
                          <div>
                            <div className="font-semibold text-slate-900 dark:text-slate-100">
                              Checkout Individual Ativo
                            </div>
                            <div className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                              Processando apenas {selectedGuestIds.length} {selectedGuestIds.length === 1 ? 'cliente selecionado' : 'clientes selecionados'} • Total: {formatKwanza(calculateTotals.finalTotal)}
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Info Banner */}
                    <div className="relative overflow-hidden rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-4">
                      <div className="flex items-start gap-3">
                        <Gift className="h-5 w-5 text-slate-500 dark:text-slate-400 mt-0.5" />
                        <div>
                          <div className="font-semibold text-slate-900 dark:text-slate-100">
                            Aproveite cupons e pontos de fidelidade
                          </div>
                          <div className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                            Selecione um cliente para habilitar cupons e resgatar pontos de fidelidade.
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Customer Selection */}
                     <Card className="border-2 border-slate-200 dark:border-slate-800">
                      <CardHeader className="bg-slate-50 dark:bg-slate-900/50 border-b">
                        <CardTitle className="text-lg flex items-center gap-2">
                          <Users className="h-5 w-5 text-slate-500 dark:text-slate-400" />
                          Selecionar Cliente
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="p-5">
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
                              className="bg-slate-900 hover:bg-slate-800 dark:bg-slate-100 dark:text-slate-900"
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
                                        <Badge variant="outline" className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-600">
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
                      <CardHeader className="bg-slate-100 dark:bg-slate-800 border-b">
                        <CardTitle className="text-lg flex items-center gap-2">
                          <Gift className="h-5 w-5 text-slate-500 dark:text-slate-400" />
                          Cupom de Desconto
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="p-5">
                        <div className="space-y-4">
                          <div className="flex gap-3">
                            <Input
                              value={couponCode}
                              onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                              placeholder="DIGITE-O-CODIGO"
                              disabled={!!appliedCoupon}
                              className="flex-1"
                            />
                            {appliedCoupon ? (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                  setAppliedCoupon(null);
                                  setCouponCode('');
                                }}
                                className="px-4"
                              >
                                Remover
                              </Button>
                            ) : (
                              <Button
                                size="sm"
                                onClick={() => applyCouponMutation.mutate(couponCode)}
                                disabled={!couponCode || applyCouponMutation.isPending}
                                className="px-4 bg-slate-900 hover:bg-slate-800 dark:bg-slate-100 dark:text-slate-900"
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
                            <div className="relative overflow-hidden rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-4">
                              <div className="space-y-2">
                                <div className="flex items-center gap-2">
                                  <CheckCircle2 className="h-4 w-4 text-green-600 dark:text-green-400" />
                                  <span className="font-bold text-slate-900 dark:text-slate-100 tracking-wider">
                                    {appliedCoupon.code}
                                  </span>
                                  <Badge className="bg-green-500/20 text-green-700 dark:text-green-300 border-green-500/30">
                                    Ativo
                                  </Badge>
                                </div>
                                <p className="text-sm text-slate-600 dark:text-slate-400 font-medium">
                                  {appliedCoupon.description}
                                </p>
                                <div className="flex items-center gap-2 pt-1">
                                  <Sparkles className="h-4 w-4 text-green-600 dark:text-green-400" />
                                  <span className="text-sm font-bold text-slate-900 dark:text-slate-100">
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
                        <CardHeader className="bg-slate-100 dark:bg-slate-800 border-b">
                          <div className="flex items-center justify-between">
                            <CardTitle className="text-lg flex items-center gap-2">
                              <Sparkles className="h-5 w-5 text-slate-500 dark:text-slate-400" />
                              Programa de Fidelidade
                            </CardTitle>
                            <Badge className="bg-yellow-500/20 text-yellow-700 dark:text-yellow-300 border-yellow-500/30">
                              Ativo
                            </Badge>
                          </div>
                        </CardHeader>
                        <CardContent className="p-5 space-y-4">
                          {/* Available Points */}
                          <div className="relative overflow-hidden rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-4">
                            <div className="flex items-center justify-between">
                              <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                                Pontos Disponíveis
                              </span>
                              <span className="text-xl font-bold text-slate-900 dark:text-slate-100">
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
                                  className="h-10"
                                />
                                <Button
                                  size="sm"
                                  onClick={() => redeemPointsMutation.mutate(parseInt(loyaltyPointsToRedeem))}
                                  disabled={
                                    !loyaltyPointsToRedeem ||
                                    parseInt(loyaltyPointsToRedeem) < (loyaltyProgram.minPointsToRedeem || 100) ||
                                    redeemPointsMutation.isPending
                                  }
                                  className="px-4 bg-slate-900 hover:bg-slate-800 dark:bg-slate-100 dark:text-slate-900"
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
                          <div className="relative overflow-hidden rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-4">
                            <div className="flex items-center justify-between">
                              <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                                Pontos a Ganhar nesta Compra
                              </span>
                              <span className="text-xl font-bold text-slate-900 dark:text-slate-100 flex items-center gap-1">
                                +{Math.floor(calculateTotals.finalTotal * parseFloat(loyaltyProgram.pointsPerCurrency || "1"))} pts
                                <TrendingUp className="h-4 w-4" />
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
                       <div className="relative overflow-hidden rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-4 shadow-sm">
                         <div className="flex items-start gap-3">
                           <div className="p-2 rounded-lg bg-slate-200 dark:bg-slate-700">
                             <AlertCircle className="h-5 w-5 text-slate-600 dark:text-slate-300" />
                           </div>
                           <div className="flex-1">
                             <div className="font-bold text-slate-900 dark:text-slate-100 mb-1">
                               Ajustes Ativos na Conta
                             </div>
                             <div className="text-sm text-slate-700 dark:text-slate-300 space-y-1">
                               {discountValue && parseFloat(discountValue) > 0 && (
                                 <div className="flex items-center gap-2">
                                   <Badge variant="outline" className="bg-green-500/10 border-green-500 text-green-700 dark:text-green-300">
                                     Desconto: {discountType === 'percentual' ? `${discountValue}%` : `${formatKwanza(parseFloat(discountValue))}`}
                                   </Badge>
                                   <span>= -{formatKwanza(
                                     discountType === 'percentual'
                                       ? calculateTotals.subtotal * (parseFloat(discountValue) / 100)
                                       : parseFloat(discountValue)
                                   )}</span>
                                 </div>
                               )}
                               {manualServiceValue && parseFloat(manualServiceValue) > 0 && (
                                 <div className="flex items-center gap-2">
                                   <Badge variant="outline" className="bg-slate-200 dark:bg-slate-700 border-slate-400 text-slate-700 dark:text-slate-300">
                                     Taxa: {manualServiceType === 'percentual' ? `${manualServiceValue}%` : `${formatKwanza(parseFloat(manualServiceValue))}`}
                                   </Badge>
                                   <span>= +{formatKwanza(
                                     manualServiceType === 'percentual'
                                       ? calculateTotals.subtotal * (parseFloat(manualServiceValue) / 100)
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

                     {isIndividualCheckout && individualAdjustmentsDisabled && (
                       <div className="rounded-xl border border-amber-300 bg-amber-50 p-4 text-amber-900 dark:border-amber-800 dark:bg-amber-950/30 dark:text-amber-200">
                         <div className="font-semibold">Ajustes individuais bloqueados</div>
                         <div className="text-sm mt-1">
                           Esta mesa já tem ajustes globais (sessão). Remova-os antes de aplicar descontos/taxas individuais por convidado.
                         </div>
                         <div className="mt-3">
                           <Button
                             size="sm"
                             variant="outline"
                             onClick={clearSessionAdjustments}
                             disabled={isSavingAdjustments}
                             className="border-amber-400 text-amber-900 hover:bg-amber-100 dark:border-amber-700 dark:text-amber-200 dark:hover:bg-amber-900/30"
                           >
                             {isSavingAdjustments ? 'Limpando...' : 'Limpar ajustes globais da mesa'}
                           </Button>
                         </div>
                       </div>
                     )}
                    
                     {/* Selection Banner */}
                     {selectedGuestIds.length > 0 && (
                       <div className="relative overflow-hidden rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-4">
                         <div className="flex items-start gap-3">
                           <CheckCircle2 className="h-5 w-5 text-slate-500 dark:text-slate-400 mt-0.5" />
                           <div>
                             <div className="font-semibold text-slate-900 dark:text-slate-100">
                               Checkout Individual Ativo
                             </div>
                             <div className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                               Ajustando apenas para {selectedGuestIds.length} {selectedGuestIds.length === 1 ? 'cliente' : 'clientes'} • Subtotal: {formatKwanza(calculateTotals.subtotal)}
                             </div>
                           </div>
                         </div>
                       </div>
                     )}

                     {/* Info Banner */}
                     <div className="relative overflow-hidden rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-4">
                       <div className="flex items-start gap-3">
                         <Calculator className="h-5 w-5 text-slate-500 dark:text-slate-400 mt-0.5" />
                         <div>
                           <div className="font-semibold text-slate-900 dark:text-slate-100">
                             Ajustes adicionais (opcional)
                           </div>
                           <div className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                             Adicione descontos manuais ou taxas de serviço se necessário.
                           </div>
                         </div>
                       </div>
                     </div>

                    {/* Manual Discount */}
                     <Card className="border-2 border-slate-200 dark:border-slate-800">
                       <CardHeader className="bg-slate-100 dark:bg-slate-800 border-b">
                         <CardTitle className="text-lg flex items-center gap-2">
                           <Percent className="h-5 w-5 text-slate-500 dark:text-slate-400" />
                           Desconto Manual
                         </CardTitle>
                       </CardHeader>
                       <CardContent className="p-5 space-y-4">
                        {/* Atalhos Rápidos */}
                        <div className="space-y-2">
                          <Label className="text-sm">Atalhos Rápidos</Label>
                          <div className="flex gap-2">
                            {[5, 10, 15, 20].map(pct => (
                              <Button
                                key={pct}
                                size="sm"
                                variant="outline"
                                disabled={isIndividualCheckout ? individualAdjustmentsDisabled : globalAdjustmentsDisabled}
                                onClick={() => {
                                  const disabled = isIndividualCheckout ? individualAdjustmentsDisabled : globalAdjustmentsDisabled;
                                  if (disabled) return;
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

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label>Valor do Desconto</Label>
                            <div className="relative">
                              <Input
                                type="number"
                                step="0.01"
                                value={discountValue}
                                disabled={isIndividualCheckout ? individualAdjustmentsDisabled : globalAdjustmentsDisabled}
                                onChange={(e) => {
                                  const disabled = isIndividualCheckout ? individualAdjustmentsDisabled : globalAdjustmentsDisabled;
                                  if (disabled) return;
                                  const val = parseFloat(e.target.value) || 0;
                                  const max = discountType === 'percentual' ? 100 : calculateTotals.subtotal;
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
                            <Select
                              value={discountType}
                              onValueChange={(v: 'valor' | 'percentual') => {
                                const disabled = isIndividualCheckout ? individualAdjustmentsDisabled : globalAdjustmentsDisabled;
                                if (disabled) return;
                                setDiscountType(v);
                              }}
                              disabled={isIndividualCheckout ? individualAdjustmentsDisabled : globalAdjustmentsDisabled}
                            >
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
                          <div className="relative overflow-hidden rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-4 shadow-sm">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <div className="p-2 rounded-lg bg-slate-200 dark:bg-slate-700">
                                  <TrendingUp className="h-4 w-4 text-slate-600 dark:text-slate-300 rotate-180" />
                                </div>
                                <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                                  Desconto Ativo:
                                </span>
                              </div>
                              <span className="text-xl font-bold text-slate-900 dark:text-slate-100">
                                -{formatKwanza(
                                  discountType === 'percentual'
                                    ? calculateTotals.subtotal * (parseFloat(discountValue) / 100)
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
                       <CardHeader className="bg-slate-100 dark:bg-slate-800 border-b">
                         <CardTitle className="text-lg flex items-center gap-2">
                           <TrendingUp className="h-5 w-5 text-slate-500 dark:text-slate-400" />
                           Serviços e Taxas
                         </CardTitle>
                       </CardHeader>
                       <CardContent className="p-5 space-y-4">
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
                                        ? "border-slate-900 bg-slate-50 dark:border-slate-100 dark:bg-slate-800"
                                        : "border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 hover:border-slate-300 dark:hover:border-slate-600"
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
                          <div className="bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-3">
                            <div className="flex items-start gap-2">
                              <CheckCircle2 className="h-4 w-4 text-slate-500 dark:text-slate-400 mt-0.5" />
                              <div className="text-sm">
                                <div className="font-medium text-slate-900 dark:text-slate-100">
                                  Serviços Automáticos
                                </div>
                                <div className="text-slate-600 dark:text-slate-400 mt-1">
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
                              disabled={isIndividualCheckout ? individualAdjustmentsDisabled : globalAdjustmentsDisabled}
                              onChange={(e) => {
                                const disabled = isIndividualCheckout ? individualAdjustmentsDisabled : globalAdjustmentsDisabled;
                                if (disabled) return;
                                setManualServiceName(e.target.value);
                              }}
                              placeholder="Ex: Taxa de entrega, Couvert..."
                              className="h-10"
                            />
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <Label>Valor</Label>
                              <Input
                                type="number"
                                step="0.01"
                                value={manualServiceValue}
                                disabled={isIndividualCheckout ? individualAdjustmentsDisabled : globalAdjustmentsDisabled}
                                onChange={(e) => {
                                  const disabled = isIndividualCheckout ? individualAdjustmentsDisabled : globalAdjustmentsDisabled;
                                  if (disabled) return;
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
                              <Select
                                value={manualServiceType}
                                onValueChange={(v: 'valor' | 'percentual') => {
                                  const disabled = isIndividualCheckout ? individualAdjustmentsDisabled : globalAdjustmentsDisabled;
                                  if (disabled) return;
                                  setManualServiceType(v);
                                }}
                                disabled={isIndividualCheckout ? individualAdjustmentsDisabled : globalAdjustmentsDisabled}
                              >
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
                          <div className="relative overflow-hidden rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-4">
                            <div className="space-y-2">
                              <div className="text-sm font-medium text-slate-700 dark:text-slate-300">
                                Serviços Adicionados:
                              </div>
                              {selectedServices.map(serviceId => {
                                const service = availableServices.find((s: any) => s.id === serviceId);
                                if (!service) return null;
                                const charge = service.chargeType === 'percentual'
                                  ? (calculateTotals.subtotal - calculateTotals.totalDiscounts) * (parseFloat(service.value) / 100)
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
                                        ? (calculateTotals.subtotal - calculateTotals.totalDiscounts) * (parseFloat(manualServiceValue) / 100)
                                        : parseFloat(manualServiceValue)
                                    )}
                                  </span>
                                </div>
                              )}
                              <Separator className="my-2" />
                               <div className="flex justify-between">
                                <span className="font-medium text-slate-700 dark:text-slate-300">Total em Serviços:</span>
                                <span className="text-xl font-bold text-slate-900 dark:text-slate-100">
                                  +{formatKwanza(calculateTotals.totalAdditions)}
                                </span>
                              </div>
                            </div>
                          </div>
                        )}
                      </CardContent>
                    </Card>

                    {/* Summary Preview - Sempre Visível */}
                    <Card className="border-2 border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-900">
                      <CardHeader className="border-b border-slate-200 dark:border-slate-700">
                        <CardTitle className="text-lg flex items-center gap-2">
                          <Calculator className="h-5 w-5 text-slate-500 dark:text-slate-400" />
                          Resumo Detalhado
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="p-5 space-y-3">
                        <div className="flex justify-between py-2">
                          <span className="text-slate-600 dark:text-slate-400">Subtotal:</span>
                          <span className="font-bold">{formatKwanza(calculateTotals.subtotal)}</span>
                        </div>

                        {discountValue && parseFloat(discountValue) > 0 && (
                          <div className="flex justify-between py-2 text-green-600 dark:text-green-400">
                            <span>Desconto Manual ({discountType === 'percentual' ? `${discountValue}%` : 'fixo'}):</span>
                            <span className="font-bold">
                              -{formatKwanza(
                                discountType === 'percentual'
                                  ? calculateTotals.subtotal * (parseFloat(discountValue) / 100)
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
                            <span className="text-xl font-bold text-slate-900 dark:text-slate-100">
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
                    <Card className="border-2 border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900">
                      <CardHeader className="pb-3 border-b border-slate-200 dark:border-slate-700">
                        <CardTitle className="flex items-center gap-2 text-lg">
                          <Receipt className="h-5 w-5 text-slate-500 dark:text-slate-400" />
                          Revisão Final do Pedido
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="pt-4 space-y-3">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
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
                            <div className="space-y-1.5 pl-2 border-l-2 border-slate-300 dark:border-slate-600">
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
                              <span className="font-bold text-xl text-slate-900 dark:text-slate-100">
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
                      <div className="relative overflow-hidden rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-4">
                        <div className="flex items-start gap-3">
                          <CheckCircle2 className="h-5 w-5 text-slate-500 dark:text-slate-400 mt-0.5" />
                          <div>
                            <div className="font-semibold text-slate-900 dark:text-slate-100">
                              Checkout Individual Ativo
                            </div>
                            <div className="text-sm text-slate-600 dark:text-slate-400 mt-1 flex items-center gap-2">
                              <span>Pagando para {selectedGuestIds.length} {selectedGuestIds.length === 1 ? 'cliente' : 'clientes'}</span>
                              <span>•</span>
                              <span className="font-bold">{formatKwanza(calculateTotals.finalTotal)}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Info Banner */}
                    <div className="relative overflow-hidden rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-4">
                      <div className="flex items-start gap-3">
                        <CreditCard className="h-5 w-5 text-slate-500 dark:text-slate-400 mt-0.5" />
                        <div>
                          <div className="font-semibold text-slate-900 dark:text-slate-100">
                            Selecione o método de pagamento
                          </div>
                          <div className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                            Escolha como o cliente irá pagar a conta.
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Payment Methods - REDESIGNED */}
                    <div className="space-y-4">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="h-1 w-12 bg-primary rounded-full" />
                        <h3 className="text-xl font-bold">Escolha o Método de Pagamento</h3>
                      </div>
                      
                       <RadioGroup value={paymentMethod} onValueChange={setPaymentMethod}>
                         <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                             {/* Dinheiro - REDESIGNED */}
                             <label className={cn(
                               "relative flex flex-col gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all group",
                               paymentMethod === 'dinheiro' 
                                 ? "border-slate-900 bg-slate-50 dark:border-slate-100 dark:bg-slate-800 shadow-md" 
                                 : "border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 hover:border-slate-300 dark:hover:border-slate-600"
                             )}>
                               <div className="flex items-start justify-between relative z-10">
                                 <div className="flex items-center gap-3">
                                   <div className={cn(
                                     "p-2.5 rounded-lg transition-all",
                                     paymentMethod === 'dinheiro'
                                       ? "bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900"
                                       : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300"
                                   )}>
                                     <Banknote className="h-6 w-6" />
                                   </div>
                                   <div>
                                     <div className="font-bold text-base">Dinheiro</div>
                                     <div className="text-sm text-muted-foreground">Pagamento em espécie</div>
                                   </div>
                                 </div>
                                 <RadioGroupItem value="dinheiro" id="dinheiro" />
                               </div>
                               
                               {paymentMethod === 'dinheiro' && (
                                 <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300 font-medium relative z-10">
                                   <CheckCircle2 className="h-4 w-4" />
                                   <span>Selecionado</span>
                                 </div>
                               )}
                             </label>

                             {/* Multicaixa - REDESIGNED */}
                             <label className={cn(
                               "relative flex flex-col gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all group",
                               paymentMethod === 'multicaixa' 
                                 ? "border-slate-900 bg-slate-50 dark:border-slate-100 dark:bg-slate-800 shadow-md" 
                                 : "border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 hover:border-slate-300 dark:hover:border-slate-600"
                             )}>
                               <div className="flex items-start justify-between relative z-10">
                                 <div className="flex items-center gap-3">
                                   <div className={cn(
                                     "p-2.5 rounded-lg transition-all",
                                     paymentMethod === 'multicaixa'
                                       ? "bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900"
                                       : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300"
                                   )}>
                                     <CreditCard className="h-6 w-6" />
                                   </div>
                                   <div>
                                     <div className="font-bold text-base">Multicaixa</div>
                                     <div className="text-sm text-muted-foreground">Pagamento por ATM</div>
                                   </div>
                                 </div>
                                 <RadioGroupItem value="multicaixa" id="multicaixa" />
                               </div>
                               
                               {paymentMethod === 'multicaixa' && (
                                 <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300 font-medium relative z-10">
                                   <CheckCircle2 className="h-4 w-4" />
                                   <span>Selecionado</span>
                                 </div>
                               )}
                             </label>

                             {/* Transferência - REDESIGNED */}
                             <label className={cn(
                               "relative flex flex-col gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all group",
                               paymentMethod === 'transferencia' 
                                 ? "border-slate-900 bg-slate-50 dark:border-slate-100 dark:bg-slate-800 shadow-md" 
                                 : "border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 hover:border-slate-300 dark:hover:border-slate-600"
                             )}>
                               <div className="flex items-start justify-between relative z-10">
                                 <div className="flex items-center gap-3">
                                   <div className={cn(
                                     "p-2.5 rounded-lg transition-all",
                                     paymentMethod === 'transferencia'
                                       ? "bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900"
                                       : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300"
                                   )}>
                                     <Building className="h-6 w-6" />
                                   </div>
                                   <div>
                                     <div className="font-bold text-base">Transferência Bancária</div>
                                     <div className="text-sm text-muted-foreground">Pagamento por transferência</div>
                                   </div>
                                 </div>
                                 <RadioGroupItem value="transferencia" id="transferencia" />
                               </div>
                               
                               {paymentMethod === 'transferencia' && (
                                 <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300 font-medium relative z-10">
                                   <CheckCircle2 className="h-4 w-4" />
                                   <span>Selecionado</span>
                                 </div>
                               )}
                             </label>

                             {/* Cartão - REDESIGNED */}
                             <label className={cn(
                               "relative flex flex-col gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all group",
                               paymentMethod === 'cartao' 
                                 ? "border-slate-900 bg-slate-50 dark:border-slate-100 dark:bg-slate-800 shadow-md" 
                                 : "border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 hover:border-slate-300 dark:hover:border-slate-600"
                             )}>
                               <div className="flex items-start justify-between relative z-10">
                                 <div className="flex items-center gap-3">
                                   <div className={cn(
                                     "p-2.5 rounded-lg transition-all",
                                     paymentMethod === 'cartao'
                                       ? "bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900"
                                       : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300"
                                   )}>
                                     <Smartphone className="h-6 w-6" />
                                   </div>
                                   <div>
                                     <div className="font-bold text-base">Cartão</div>
                                     <div className="text-sm text-muted-foreground">Pagamento por cartão</div>
                                   </div>
                                 </div>
                                 <RadioGroupItem value="cartao" id="cartao" />
                               </div>
                               
                               {paymentMethod === 'cartao' && (
                                 <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300 font-medium relative z-10">
                                   <CheckCircle2 className="h-4 w-4" />
                                   <span>Selecionado</span>
                                 </div>
                               )}
                             </label>
                           </div>
                         </RadioGroup>
                      </div>

                    {/* Input de Troco (se Dinheiro) */}
                     {paymentMethod === 'dinheiro' && (
                       <Card className="border-2 border-slate-200 dark:border-slate-800">
                         <CardHeader className="bg-slate-100 dark:bg-slate-800 border-b">
                           <CardTitle className="text-lg flex items-center gap-2">
                             <Banknote className="h-5 w-5 text-slate-500 dark:text-slate-400" />
                             Valor Recebido
                           </CardTitle>
                         </CardHeader>
                         <CardContent className="p-5 space-y-4">
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
                             <div className="relative overflow-hidden rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-4">
                               <div className="space-y-2">
                                 <div className="flex items-center justify-between">
                                   <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                                     Troco a Devolver:
                                   </span>
                                   <span className="text-xl font-bold text-slate-900 dark:text-slate-100">
                                     {formatKwanza(parseFloat(receivedAmount) - calculateTotals.finalTotal)}
                                   </span>
                                 </div>
                               </div>
                             </div>
                           )}

                           {receivedAmount && parseFloat(receivedAmount) < calculateTotals.finalTotal && (
                             <div className="relative overflow-hidden rounded-xl bg-slate-100 dark:bg-slate-800 border border-red-200 dark:border-red-800 p-4">
                               <div className="flex items-center gap-2 text-red-600 dark:text-red-400">
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
                      <Card className="border-2 border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-900">
                        <CardContent className="p-5">
                          <div className="space-y-4">
                            <div className="flex items-center justify-between">
                              <span className="text-base font-semibold">Método Selecionado:</span>
                              <Badge className="bg-slate-200 dark:bg-slate-700 text-slate-900 dark:text-slate-100 border-slate-300 dark:border-slate-600 text-sm px-3 py-1">
                                {paymentMethod.charAt(0).toUpperCase() + paymentMethod.slice(1)}
                              </Badge>
                            </div>
                            <Separator />
                            <div className="flex items-center justify-between">
                              <span className="text-lg font-bold">Valor a Receber:</span>
                              <span className="text-2xl font-bold text-slate-900 dark:text-slate-100">
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
                size="default"
                onClick={async () => {
                  await saveAdjustmentsToSession();
                  setCurrentStep(Math.max(1, currentStep - 1));
                }}
                disabled={currentStep === 1}
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Voltar
              </Button>
              
              {currentStep < STEPS.length ? (
                <Button
                  size="default"
                  onClick={async () => {
                    await saveAdjustmentsToSession();
                    setCurrentStep(Math.min(STEPS.length, currentStep + 1));
                  }}
                  className="bg-slate-900 hover:bg-slate-800 dark:bg-slate-100 dark:text-slate-900"
                >
                  Continuar
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              ) : (
                <Button
                  size="default"
                  disabled={
                    !paymentMethod || 
                    (paymentMethod === 'dinheiro' && receivedAmount && parseFloat(receivedAmount) < calculateTotals.finalTotal) ||
                    processPaymentMutation.isPending
                  }
                  onClick={() => setShowConfirmation(true)}
                  className="bg-green-600 hover:bg-green-700"
                >
                  {processPaymentMutation.isPending ? (
                    <>
                      <div className="animate-spin h-4 w-4 mr-2 border-2 border-white border-t-transparent rounded-full" />
                      Processando...
                    </>
                  ) : (
                    <>
                      <Check className="h-4 w-4 mr-2" />
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
               <Card className="bg-slate-900 dark:bg-slate-950 border-slate-700/50 text-white">
                 <CardHeader className="border-b border-slate-700/50">
                   <CardTitle className="flex items-center justify-between gap-2">
                     <span className="flex items-center gap-2">
                       <Sparkles className="h-5 w-5 text-yellow-400" />
                       Resumo do Pedido
                     </span>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="border-slate-600 text-white/90 hover:text-white"
                      onClick={() => recalculateOpenSessionsMutation.mutate()}
                      disabled={recalculateOpenSessionsMutation.isPending}
                    >
                      {recalculateOpenSessionsMutation.isPending ? 'Recalculando...' : 'Recalcular Sessões'}
                    </Button>
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
                       <div className="pt-2 space-y-3">
                         <div className="flex items-center justify-between mb-2">
                           <span className="text-lg font-bold text-white">TOTAL</span>
                           <div className="text-right">
                             {calculateTotals.totalDiscounts > 0 && (
                               <div className="text-xs text-green-400 line-through">
                                 {formatKwanza(calculateTotals.subtotal)}
                               </div>
                             )}
                              <div className="text-xl font-bold text-white">
                                {formatKwanza(calculateTotals.finalTotal)}
                              </div>
                           </div>
                         </div>
                        
                        {calculateTotals.totalDiscounts > 0 && (
                          <div className="text-xs text-green-400 text-right">
                            Você economizou {formatKwanza(calculateTotals.totalDiscounts)}
                          </div>
                        )}

                        {paidAmount > 0 && (
                          <div className="rounded-xl border border-white/10 bg-white/5 p-3 space-y-2 text-sm">
                            <div className="flex items-center justify-between text-white/70">
                              <span>Pago</span>
                              <span className="font-semibold text-white">{formatKwanza(paidAmount)}</span>
                            </div>
                            <div className="flex items-center justify-between font-semibold">
                              <span>Restante</span>
                              <span className={remainingAmount > 0 ? 'text-orange-400' : 'text-green-400'}>
                                {formatKwanza(remainingAmount)}
                              </span>
                            </div>
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
                            className="absolute inset-y-0 left-0 bg-slate-100 dark:bg-slate-400 transition-all duration-500 ease-out"
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
                    {parseFloat(receivedAmount) < calculateTotals.finalTotal ? (
                      <div className="p-3 bg-red-500/10 border border-red-500/30 rounded text-red-600 dark:text-red-400 text-xs font-semibold">
                        ⚠️ O valor recebido é inferior ao total a pagar ({formatKwanza(calculateTotals.finalTotal)}).
                      </div>
                    ) : (
                      <div className="flex justify-between py-2 border-b bg-green-50 dark:bg-green-950/20 px-3 rounded">
                        <span className="font-medium text-green-700 dark:text-green-300">Troco:</span>
                        <span className="font-bold text-green-700 dark:text-green-300">
                          {formatKwanza(parseFloat(receivedAmount) - calculateTotals.finalTotal)}
                        </span>
                      </div>
                    )}
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
              disabled={
                processPaymentMutation.isPending || 
                (paymentMethod === 'dinheiro' && !!receivedAmount && parseFloat(receivedAmount) < calculateTotals.finalTotal)
              }
              className="bg-green-600 hover:bg-green-700"
            >
              {processPaymentMutation.isPending ? 'Processando...' : 'Confirmar Pagamento'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Payment Receipt Dialog */}
      {paymentData && table && (
        <PaymentReceiptDialog
          open={showSuccessDialog}
          onClose={() => {
            setShowSuccessDialog(false);
            setLocation(`/${fromParam}`);
          }}
          table={table}
          payment={paymentData}
          ordersByGuest={ordersByGuest}
          calculateTotals={calculateTotals}
          restaurant={restaurant}
          sessionDuration={sessionDuration}
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
