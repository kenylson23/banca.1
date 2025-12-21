import { useState, useEffect, useCallback } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useRoute, Link } from 'wouter';
import { useCart } from '@/contexts/CartContext';
import { useCustomerAuth } from '@/contexts/CustomerAuthContext';
import { CustomerLoginDialog } from '@/components/CustomerLoginDialog';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { usePageTracking, useConversionTracking } from '@/hooks/usePageTracking';
import { 
  ShoppingCart, Plus, Minus, Trash2, Bike, ShoppingBag, Search, 
  MapPin, Phone, Utensils, ArrowRight, UserPlus, Gift, Award, Star,
  Bell, Heart, Clock, User, Home, ChevronRight, ChevronLeft, ChevronDown, Package, X,
  CheckCircle, Tag, Receipt, ClipboardList, Banknote, CreditCard, Smartphone, Building2
} from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import { motion, AnimatePresence } from 'framer-motion';
import { apiRequest } from '@/lib/queryClient';
import { formatKwanza } from '@/lib/formatters';
import type { MenuItem, Category, Restaurant, Order } from '@shared/schema';
import { CustomerMenuItemOptionsDialog } from '@/components/CustomerMenuItemOptionsDialog';
import type { SelectedOption } from '@/contexts/CartContext';
import { ShareOrderDialog } from '@/components/ShareOrderDialog';
import { SiWhatsapp } from 'react-icons/si';

// Import modular components and hooks
import { HeroBanner, CategoryFilter } from './public-menu/components';
import { ProductGrid } from './public-menu/ProductGrid';
import { useFavorites as useFavoritesModule, useOrderHistory as useOrderHistoryModule } from './public-menu/hooks';

// Import premium components
import { PremiumButton } from '@/components/ui/premium-button';
import { 
  GlassDialog,
  GlassDialogContent,
  GlassDialogHeader,
  GlassDialogTitle,
  GlassDialogDescription,
} from '@/components/ui/glass-dialog';

// Import visual improvements
import { toastAddedToFavorites, toastRemovedFromFavorites } from '@/components/ui/toast-custom';
import { EmptyCart, EmptyFavorites, EmptyOrders } from '@/components/ui/empty-state';
import { ProductBadge, getProductBadges } from '@/components/ui/product-badges';
import { ProfileDialog } from '@/components/ProfileDialog';
import { playSound } from '@/utils/sound-feedback';
import { ProfessionalLoader } from '@/components/ui/professional-loader';
import { RestaurantStatusBadge, RestaurantStatus } from '@/components/RestaurantStatus';

interface StoredOrder {
  id: string;
  orderNumber?: string;
  customerName: string;
  orderType: string;
  status: string;
  totalAmount: string;
  createdAt: string;
  items: Array<{
    name: string;
    quantity: number;
    price: string;
  }>;
}

// Hooks inline removidos - usando módulos importados

interface CustomerLookupData {
  found: boolean;
  customer?: {
    id: string;
    name: string;
    phone: string;
    email?: string;
    loyaltyPoints: number;
    tier: string;
    totalSpent: string;
    visitCount: number;
  };
  loyalty?: {
    isActive: boolean;
    pointsPerCurrency: string;
    currencyPerPoint: string;
    minPointsToRedeem: number;
    maxRedeemablePoints: number;
    maxDiscountAmount: number;
  };
}

interface CouponValidation {
  valid: boolean;
  message?: string;
  discountAmount?: number;
  coupon?: {
    id: string;
    code: string;
    discountType: string;
    discountValue: string;
  };
}

export default function PublicMenu() {
  const [, params] = useRoute('/r/:slug');
  const slug = params?.slug;
  const { items, addItem, removeItem, updateQuantity, clearCart, getTotal, getItemCount } = useCart();
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [orderType, setOrderType] = useState<'delivery' | 'takeout' | 'mesa'>('delivery'); // ✅ ADICIONADO 'mesa'
  const [tableIdFromUrl, setTableIdFromUrl] = useState<string | null>(null); // ✅ NOVO: Armazenar tableId da URL
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [deliveryNotes, setDeliveryNotes] = useState('');
  const [selectedMenuItem, setSelectedMenuItem] = useState<MenuItem | null>(null);
  const [isOptionsDialogOpen, setIsOptionsDialogOpen] = useState(false);
  const [createdOrder, setCreatedOrder] = useState<Order | null>(null);
  const [isShareDialogOpen, setIsShareDialogOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isRegisterDialogOpen, setIsRegisterDialogOpen] = useState(false);
  const [isFavoritesDialogOpen, setIsFavoritesDialogOpen] = useState(false);
  const [isHistoryDialogOpen, setIsHistoryDialogOpen] = useState(false);
  const [isTrackOrderDialogOpen, setIsTrackOrderDialogOpen] = useState(false);
  const [isLoginDialogOpen, setIsLoginDialogOpen] = useState(false);
  const [isProfileDialogOpen, setIsProfileDialogOpen] = useState(false);
  const [activeNav, setActiveNav] = useState('home');
  const [isSearchModalOpen, setIsSearchModalOpen] = useState(false);
  const [registerFormData, setRegisterFormData] = useState({
    name: '',
    phone: '',
    email: '',
    address: '',
  });
  
  // Loyalty and coupon states
  const [identifiedCustomer, setIdentifiedCustomer] = useState<CustomerLookupData | null>(null);
  const [isLookingUpCustomer, setIsLookingUpCustomer] = useState(false);
  const [couponCode, setCouponCode] = useState('');
  const [couponValidation, setCouponValidation] = useState<CouponValidation | null>(null);
  const [isValidatingCoupon, setIsValidatingCoupon] = useState(false);
  const [usePoints, setUsePoints] = useState(false);
  const [pointsToRedeem, setPointsToRedeem] = useState(0);
  
  // Checkout wizard states - 3 etapas
  const [checkoutStep, setCheckoutStep] = useState(1); // 1=Carrinho, 2=Entrega, 3=Pagamento
  const [isCouponExpanded, setIsCouponExpanded] = useState(false);
  const [isPointsExpanded, setIsPointsExpanded] = useState(false);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<'dinheiro' | 'multicaixa' | 'transferencia' | 'cartao'>('dinheiro');
  
  const { toast } = useToast();
  const { isAuthenticated, customer: authCustomer, logout } = useCustomerAuth();
  const { trackConversion } = useConversionTracking();
  
  // Detect preview mode and device type from URL params
  const searchParams = new URLSearchParams(window.location.search);
  const previewDevice = searchParams.get('preview'); // 'iphone', 'android', 'tablet', 'desktop'
  const isPreviewMode = !!previewDevice;

  // ✅ DETECTAR AUTOMATICAMENTE PEDIDO VIA QR CODE (MESA)
  useEffect(() => {
    const tableId = searchParams.get('tableId');
    
    if (tableId) {
      // Cliente escaneou QR Code da mesa
      setTableIdFromUrl(tableId);
      setOrderType('mesa');
      
      console.log('[QR CODE] Mesa detectada:', tableId);
      
      toast({
        title: "🎉 Bem-vindo!",
        description: "Faça seu pedido diretamente do celular. Informe seu telefone para ganhar pontos!",
      });
    }
  }, [searchParams, toast]);

  // Force viewport for preview mode
  useEffect(() => {
    if (isPreviewMode && previewDevice) {
      const viewportMeta = document.querySelector('meta[name="viewport"]');
      
      const viewportSettings: Record<string, string> = {
        iphone: 'width=390, initial-scale=1, maximum-scale=1, user-scalable=no',
        android: 'width=412, initial-scale=1, maximum-scale=1, user-scalable=no',
        tablet: 'width=820, initial-scale=1, maximum-scale=1, user-scalable=no',
        desktop: 'width=1440, initial-scale=1, maximum-scale=1, user-scalable=no',
      };

      if (viewportMeta && viewportSettings[previewDevice]) {
        const originalContent = viewportMeta.getAttribute('content');
        viewportMeta.setAttribute('content', viewportSettings[previewDevice]);

        // Cleanup on unmount
        return () => {
          if (viewportMeta && originalContent) {
            viewportMeta.setAttribute('content', originalContent);
          }
        };
      }
    }
  }, [isPreviewMode, previewDevice]);
  
  const { favorites, toggleFavorite, isFavorite } = useFavoritesModule(slug || '');
  const { orders: orderHistory, addOrder } = useOrderHistoryModule(slug || '');

  const { data: restaurant, isLoading: restaurantLoading } = useQuery<Restaurant>({
    queryKey: ['/api/public/restaurants/slug', slug],
    queryFn: async () => {
      const response = await fetch(`/api/public/restaurants/slug/${slug}`);
      if (!response.ok) throw new Error('Restaurante não encontrado');
      return response.json();
    },
    enabled: !!slug,
  });

  const restaurantId = restaurant?.id;

  const { data: menuItems, isLoading: menuLoading } = useQuery<Array<MenuItem & { category: Category }>>({
    queryKey: ['/api/public/menu-items', restaurantId],
    enabled: !!restaurantId,
  });

  useEffect(() => {
    if (!restaurantId) return;

    apiRequest('POST', '/api/menu-visits', {
      restaurantId,
      branchId: null,
      visitSource: 'web',
      ipAddress: '',
      userAgent: navigator.userAgent,
      referrer: document.referrer || '',
    }).catch(() => {});
  }, [restaurantId]);

  // Auto-fill customer data when authenticated
  useEffect(() => {
    if (isAuthenticated && authCustomer) {
      if (!customerName && authCustomer.name) {
        setCustomerName(authCustomer.name);
      }
      if (!customerPhone && authCustomer.phone) {
        setCustomerPhone(authCustomer.phone);
      }
    }
  }, [isAuthenticated, authCustomer, customerName, customerPhone]);

  // Lookup customer by phone when phone changes
  useEffect(() => {
    const lookupCustomer = async () => {
      if (!restaurantId || !customerPhone || customerPhone.length < 9) {
        setIdentifiedCustomer(null);
        setUsePoints(false);
        setPointsToRedeem(0);
        return;
      }

      setIsLookingUpCustomer(true);
      try {
        const response = await fetch(
          `/api/public/customers/lookup?restaurantId=${restaurantId}&phone=${encodeURIComponent(customerPhone)}`
        );
        if (response.ok) {
          const data: CustomerLookupData = await response.json();
          setIdentifiedCustomer(data);
          if (data.found && data.customer) {
            // Auto-fill name if empty
            if (!customerName && data.customer.name) {
              setCustomerName(data.customer.name);
            }
            // Toca som de cliente identificado
            playSound('identified');
          } else {
            // Toca som de novo usuário (não encontrado)
            playSound('newUser');
          }
        }
      } catch (error) {
        console.error('Error looking up customer:', error);
      } finally {
        setIsLookingUpCustomer(false);
      }
    };

    const debounceTimer = setTimeout(lookupCustomer, 500);
    return () => clearTimeout(debounceTimer);
  }, [customerPhone, restaurantId, customerName]);

  // Validate coupon when code changes
  const handleValidateCoupon = async () => {
    if (!restaurantId || !couponCode.trim()) {
      setCouponValidation(null);
      return;
    }

    setIsValidatingCoupon(true);
    try {
      const orderValue = getTotal();
      const response = await apiRequest('POST', '/api/public/coupons/validate', {
        restaurantId,
        code: couponCode.trim(),
        orderValue: orderValue.toFixed(2),
        orderType,
        customerId: identifiedCustomer?.customer?.id,
      });
      const data: CouponValidation = await response.json();
      setCouponValidation(data);
      
      if (data.valid) {
        toast({
          title: 'Cupom aplicado!',
          description: `Desconto de ${formatKwanza(data.discountAmount || 0)}`,
        });
      } else {
        toast({
          title: 'Cupom inválido',
          description: data.message || 'Este cupom não pode ser aplicado.',
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Error validating coupon:', error);
      setCouponValidation({ valid: false, message: 'Erro ao validar cupom' });
    } finally {
      setIsValidatingCoupon(false);
    }
  };

  // Calculate final total with discounts
  const calculateFinalTotal = () => {
    let total = getTotal();
    
    // Apply coupon discount
    if (couponValidation?.valid && couponValidation.discountAmount) {
      total -= couponValidation.discountAmount;
    }
    
    // Apply loyalty points discount
    if (usePoints && pointsToRedeem > 0 && identifiedCustomer?.loyalty) {
      const pointsDiscount = pointsToRedeem * parseFloat(identifiedCustomer.loyalty.currencyPerPoint);
      total -= pointsDiscount;
    }
    
    return Math.max(0, total);
  };

  // Calculate points discount
  const getPointsDiscount = () => {
    if (!usePoints || pointsToRedeem <= 0 || !identifiedCustomer?.loyalty) return 0;
    return pointsToRedeem * parseFloat(identifiedCustomer.loyalty.currencyPerPoint);
  };

  // Calculate points to earn
  const getPointsToEarn = () => {
    if (!identifiedCustomer?.loyalty?.isActive) return 0;
    const finalTotal = calculateFinalTotal();
    return Math.floor(finalTotal * parseFloat(identifiedCustomer.loyalty.pointsPerCurrency));
  };

  const categories = menuItems
    ?.filter(item => item.isVisible === 1)
    ?.reduce((acc, item) => {
      if (!acc.find(cat => cat.id === item.category.id)) {
        acc.push(item.category);
      }
      return acc;
    }, [] as Category[])
    .sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0)) || [];

  const filteredItems = menuItems
    ?.filter(item => item.isVisible === 1)
    ?.filter(item => {
      const matchesCategory = selectedCategory === 'all' || String(item.categoryId) === selectedCategory;
      const matchesSearch = !searchQuery || 
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (item.description && item.description.toLowerCase().includes(searchQuery.toLowerCase()));
      return matchesCategory && matchesSearch;
    }) || [];

  const itemsByCategory = categories.map(category => {
    const categoryItems = menuItems
      ?.filter(item => item.isVisible === 1)
      ?.filter(item => String(item.categoryId) === category.id)
      ?.filter(item => {
        const matchesSearch = !searchQuery || 
          item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          (item.description && item.description.toLowerCase().includes(searchQuery.toLowerCase()));
        return matchesSearch;
      }) || [];
    
    return {
      category,
      items: categoryItems
    };
  }).filter(group => group.items.length > 0);

  const categoryImages = categories.reduce((acc, category) => {
    const firstItemWithImage = menuItems
      ?.filter(item => item.isVisible === 1 && String(item.categoryId) === category.id && item.imageUrl)
      ?.[0];
    acc[category.id] = firstItemWithImage?.imageUrl || null;
    return acc;
  }, {} as Record<string, string | null>);

  const favoriteItems = menuItems
    ?.filter(item => item.isVisible === 1 && favorites.includes(item.id)) || [];

  const specialOfferItems = menuItems
    ?.filter(item => item.isVisible === 1)
    ?.filter(item => {
      const itemPrice = typeof item.price === 'string' ? parseFloat(item.price) : item.price;
      const itemOriginalPrice = item.originalPrice 
        ? (typeof item.originalPrice === 'string' ? parseFloat(item.originalPrice) : item.originalPrice) 
        : null;
      return itemOriginalPrice && itemOriginalPrice > itemPrice;
    })
    .slice(0, 6) || [];

  const registerCustomerMutation = useMutation({
    mutationFn: async (customerData: typeof registerFormData) => {
      if (!restaurantId) throw new Error('Restaurante não encontrado');
      return await apiRequest('POST', '/api/public/customers', {
        ...customerData,
        restaurantId,
      });
    },
    onSuccess: () => {
      toast({
        title: 'Cadastro realizado!',
        description: 'Você foi cadastrado com sucesso e já pode aproveitar os benefícios.',
      });
      setRegisterFormData({
        name: '',
        phone: '',
        email: '',
        address: '',
      });
      setIsRegisterDialogOpen(false);
    },
    onError: (error: any) => {
      toast({
        title: 'Erro ao cadastrar',
        description: error?.message || 'Tente novamente mais tarde.',
        variant: 'destructive',
      });
    },
  });

  const createOrderMutation = useMutation({
    mutationFn: async (orderData: {
      restaurantId: string;
      orderType: 'delivery' | 'takeout' | 'mesa';
      tableId?: string; // ✅ ADICIONADO: ID da mesa via QR Code
      customerName: string;
      customerPhone: string;
      deliveryAddress?: string;
      couponCode?: string;
      redeemPoints?: number;
      paymentMethod: 'dinheiro' | 'multicaixa' | 'transferencia' | 'cartao';
      items: Array<{ 
        menuItemId: string; 
        quantity: number; 
        price: string;
        selectedOptions: SelectedOption[];
      }>;
    }) => {
      const totalAmount = orderData.items.reduce((sum, item) => sum + parseFloat(item.price) * item.quantity, 0).toFixed(2);
      const response = await apiRequest('POST', '/api/public/orders', {
        restaurantId: orderData.restaurantId,
        orderType: orderData.orderType,
        tableId: orderData.tableId, // ✅ ENVIAR tableId
        customerName: orderData.customerName,
        customerPhone: orderData.customerPhone,
        deliveryAddress: orderData.deliveryAddress,
        couponCode: orderData.couponCode,
        redeemPoints: orderData.redeemPoints,
        paymentMethod: orderData.paymentMethod,
        status: 'pendente',
        totalAmount,
        items: orderData.items,
      });
      return await response.json();
    },
    onSuccess: (data) => {
      if (data && data.id) {
        setCreatedOrder(data);
        setIsShareDialogOpen(true);
        
        // Track conversion for analytics
        if (restaurant?.id) {
          trackConversion(restaurant.id).catch(err => 
            console.error('Error tracking conversion:', err)
          );
        }
        
        // Show loyalty info in success message
        let successMessage = orderType === 'delivery' 
          ? 'Seu pedido será entregue em breve.'
          : 'Seu pedido estará pronto para retirada em breve.';
        
        if (data.pointsRedeemed > 0) {
          successMessage += ` ${data.pointsRedeemed} pontos foram resgatados.`;
        }
        
        const storedOrder: StoredOrder = {
          id: data.id,
          orderNumber: data.orderNumber,
          customerName: customerName,
          orderType: orderType,
          status: data.status || 'pendente',
          totalAmount: calculateFinalTotal().toFixed(2),
          createdAt: new Date().toISOString(),
          items: items.map(item => ({
            name: item.menuItem.name,
            quantity: item.quantity,
            price: item.menuItem.price,
          })),
        };
        addOrder(storedOrder);
        
        toast({
          title: 'Pedido enviado!',
          description: successMessage,
        });
        
        // Show animated points earned toast if customer has loyalty program
        if (data.pointsEarned && data.pointsEarned > 0) {
          setTimeout(() => {
            toast({
              title: (
                <div className="flex items-center gap-2">
                  <motion.div
                    animate={{
                      scale: [1, 1.2, 1],
                      rotate: [0, 10, -10, 0]
                    }}
                    transition={{ duration: 0.5 }}
                  >
                    🎉
                  </motion.div>
                  <span>Parabéns! Você ganhou pontos!</span>
                </div>
              ) as any,
              description: (
                <div className="mt-2 space-y-2">
                  <div className="flex items-center justify-between p-3 bg-gradient-to-r from-amber-50 to-orange-50 rounded-lg border border-amber-200">
                    <div className="flex items-center gap-2">
                      <Gift className="h-5 w-5 text-amber-600" />
                      <div>
                        <p className="text-sm font-bold text-amber-900">+{data.pointsEarned} pontos</p>
                        <p className="text-xs text-amber-700">Novo saldo: {data.newPointsBalance || authCustomer?.loyaltyPoints || 0} pontos</p>
                      </div>
                    </div>
                    <Award className="h-6 w-6 text-amber-500" />
                  </div>
                  {data.newTier && data.newTier !== data.previousTier && (
                    <div className="p-3 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg border border-purple-200">
                      <p className="text-sm font-bold text-purple-900">🎊 Novo nível desbloqueado!</p>
                      <p className="text-xs text-purple-700 mt-1">Você agora é {data.newTier}!</p>
                    </div>
                  )}
                  <p className="text-xs text-gray-600 text-center">Continue pedindo para ganhar mais benefícios</p>
                </div>
              ) as any,
              duration: 6000,
            });
          }, 1500);
        }
        
        // Reset all states
        clearCart();
        setCustomerName('');
        setCustomerPhone('');
        setDeliveryAddress('');
        setCouponCode('');
        setCouponValidation(null);
        setUsePoints(false);
        setPointsToRedeem(0);
        setIdentifiedCustomer(null);
        setIsCartOpen(false);
      } else {
        toast({
          title: 'Erro ao enviar pedido',
          description: 'Resposta inválida do servidor. Tente novamente.',
          variant: 'destructive',
        });
      }
    },
    onError: (error: any) => {
      toast({
        title: 'Erro ao enviar pedido',
        description: error?.message || 'Tente novamente mais tarde.',
        variant: 'destructive',
      });
    },
  });

  const handleAddMenuItem = (item: MenuItem) => {
    // Validar disponibilidade
    if (item.isAvailable === 0) {
      toast({
        title: 'Produto indisponível',
        description: `${item.name} está temporariamente indisponível.`,
        variant: 'destructive',
      });
      return;
    }
    
    setSelectedMenuItem(item);
    setIsOptionsDialogOpen(true);
  };

  const handleQuickAddToCart = (menuItem: MenuItem, e: React.MouseEvent) => {
    e.stopPropagation();
    
    // Validar disponibilidade
    if (menuItem.isAvailable === 0) {
      toast({
        title: 'Produto indisponível',
        description: `${menuItem.name} está temporariamente indisponível.`,
        variant: 'destructive',
      });
      return;
    }
    
    addItem(menuItem, []);
    toast({
      title: 'Adicionado',
      description: `${menuItem.name} adicionado ao carrinho.`,
    });
  };

  const handleAddToCart = (menuItem: MenuItem, selectedOptions: SelectedOption[]) => {
    // Validar disponibilidade
    if (menuItem.isAvailable === 0) {
      toast({
        title: 'Produto indisponível',
        description: `${menuItem.name} está temporariamente indisponível.`,
        variant: 'destructive',
      });
      return;
    }
    
    addItem(menuItem, selectedOptions);
    toast({
      title: 'Adicionado ao carrinho',
      description: `${menuItem.name} foi adicionado ao seu carrinho.`,
    });
  };

  const handleConfirmOrder = () => {
    if (!restaurant) {
      toast({
        title: 'Erro',
        description: 'Restaurante não encontrado.',
        variant: 'destructive',
      });
      return;
    }

    if (items.length === 0) {
      toast({
        title: 'Carrinho vazio',
        description: 'Adicione itens ao carrinho antes de confirmar o pedido.',
        variant: 'destructive',
      });
      return;
    }

    if (!customerName.trim()) {
      toast({
        title: 'Nome obrigatório',
        description: 'Por favor, informe seu nome.',
        variant: 'destructive',
      });
      return;
    }

    if (!customerPhone.trim()) {
      toast({
        title: 'Telefone obrigatório',
        description: 'Por favor, informe seu telefone/WhatsApp.',
        variant: 'destructive',
      });
      return;
    }

    if (orderType === 'delivery' && !deliveryAddress.trim()) {
      toast({
        title: 'Endereço obrigatório',
        description: 'Por favor, informe o endereço de entrega.',
        variant: 'destructive',
      });
      return;
    }

    const orderItems = items.map(item => {
      const basePrice = parseFloat(item.menuItem.price);
      const optionsPrice = item.selectedOptions.reduce((sum, opt) => {
        return sum + parseFloat(opt.priceAdjustment) * opt.quantity;
      }, 0);
      const totalPrice = (basePrice + optionsPrice).toFixed(2);

      return {
        menuItemId: item.menuItem.id,
        quantity: item.quantity,
        price: totalPrice,
        selectedOptions: item.selectedOptions,
      };
    });

    // ✅ Obter tableId da URL (QR Code)
    const tableId = searchParams.get('tableId');
    
    createOrderMutation.mutate({
      restaurantId: restaurant.id,
      orderType,
      tableId: tableId || undefined, // ✅ ENVIAR tableId da URL
      customerName: customerName.trim(),
      customerPhone: customerPhone.trim(),
      deliveryAddress: orderType === 'delivery' ? deliveryAddress.trim() : undefined,
      deliveryNotes: orderType === 'delivery' && deliveryNotes.trim() ? deliveryNotes.trim() : undefined,
      couponCode: couponValidation?.valid ? couponCode.trim() : undefined,
      redeemPoints: usePoints && pointsToRedeem > 0 ? pointsToRedeem : undefined,
      paymentMethod: selectedPaymentMethod,
      items: orderItems,
    });
  };

  // Track Order Card Component with Real-time Polling
  function TrackOrderCard({ order, isRecent }: { order: StoredOrder; isRecent: boolean }) {
    const [liveStatus, setLiveStatus] = useState(order.status);
    const [isPolling, setIsPolling] = useState(false);
    
    useEffect(() => {
      // Apenas faz polling para pedidos recentes (últimas 2 horas)
      if (!isRecent) return;
      
      let intervalId: NodeJS.Timeout;
      
      const pollStatus = async () => {
        try {
          setIsPolling(true);
          const response = await fetch(`/api/public/orders/${order.id}/status`);
          if (response.ok) {
            const data = await response.json();
            setLiveStatus(data.status);
          }
        } catch (error) {
          console.error('Error polling order status:', error);
        } finally {
          setIsPolling(false);
        }
      };
      
      // Primeira chamada imediata
      pollStatus();
      
      // Polling a cada 30 segundos
      intervalId = setInterval(pollStatus, 30000);
      
      return () => {
        if (intervalId) clearInterval(intervalId);
      };
    }, [order.id, isRecent]);
    
    const orderDate = new Date(order.createdAt);
    
    return (
      <div className="p-4 rounded-2xl bg-neutral-800/50 border border-neutral-700 hover:bg-neutral-800 transition-colors">
        <div className="flex items-start justify-between gap-2 mb-3">
          <div>
            <div className="flex items-center gap-2">
              <h4 className="font-semibold text-sm text-white">
                Pedido #{order.orderNumber || order.id.slice(-6).toUpperCase()}
              </h4>
              {isRecent && (
                <Badge className="bg-green-500/20 text-green-400 border-green-500/30 text-[10px]">
                  Em andamento
                </Badge>
              )}
              {isPolling && (
                <div className="w-3 h-3 border-2 border-amber-500 border-t-transparent rounded-full animate-spin" />
              )}
            </div>
            <p className="text-xs text-neutral-400 mt-0.5">
              {orderDate.toLocaleDateString('pt-BR', { 
                day: '2-digit', 
                month: 'short',
                hour: '2-digit',
                minute: '2-digit'
              })}
            </p>
          </div>
          <Badge 
            variant="outline" 
            className={`text-xs ${
              liveStatus === 'concluído' ? 'bg-green-500/20 text-green-400 border-green-500/30' :
              liveStatus === 'em preparo' ? 'bg-amber-500/20 text-amber-400 border-amber-500/30' :
              'bg-neutral-700 text-neutral-300 border-neutral-600'
            }`}
          >
            {liveStatus}
          </Badge>
        </div>
        
        <div className="space-y-1.5 mb-3">
          {order.items.slice(0, 2).map((item, idx) => (
            <div key={idx} className="flex justify-between text-xs text-neutral-300">
              <span>{item.quantity}x {item.name}</span>
            </div>
          ))}
          {order.items.length > 2 && (
            <p className="text-xs text-neutral-500">+{order.items.length - 2} item(s)</p>
          )}
        </div>
        
        <Separator className="my-2 bg-neutral-700" />
        
        <div className="flex items-center justify-between">
          <span className="text-sm font-semibold text-white">Total</span>
          <span className="text-sm font-bold text-amber-500">{formatKwanza(order.totalAmount)}</span>
        </div>
        
        {isRecent && (
          <p className="text-[10px] text-neutral-500 text-center mt-2">
            Atualizado automaticamente a cada 30s
          </p>
        )}
      </div>
    );
  }

  if (!slug) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-4 bg-white">
        <p className="text-gray-900 text-lg font-medium">Link inválido</p>
        <p className="text-sm text-gray-500">Verifique o link e tente novamente</p>
      </div>
    );
  }

  if (menuLoading || restaurantLoading) {
    return (
      <ProfessionalLoader 
        message="Carregando cardápio..."
        restaurantName={restaurant?.name}
        restaurantLogo={restaurant?.logoUrl}
      />
    );
  }

  if (!restaurant) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-4 bg-white">
        <p className="text-gray-900 text-lg font-medium">Restaurante não encontrado</p>
        <p className="text-sm text-gray-500">Verifique o link e tente novamente</p>
      </div>
    );
  }


  return (
    <div className="min-h-screen bg-gradient-to-b from-neutral-950 via-neutral-900 to-neutral-950 pb-20">
      {/* Ultra Minimal Header */}
      <header className="fixed top-0 left-0 right-0 z-50 backdrop-blur-md bg-black/20">
        <div className="max-w-7xl mx-auto px-4 py-2.5">
          <div className="flex items-center justify-between gap-2">
            {/* Logo / Restaurant Name - Ultra Compact */}
            <div className="flex items-center gap-1.5 min-w-0">
              {restaurant.logoUrl ? (
                <img 
                  src={restaurant.logoUrl} 
                  alt={restaurant.name}
                  className="w-7 h-7 rounded object-cover flex-shrink-0"
                />
              ) : (
                <div className="w-7 h-7 rounded bg-amber-500 flex items-center justify-center flex-shrink-0">
                  <Utensils className="h-3.5 w-3.5 text-white" />
                </div>
              )}
              <h1 className="text-white font-medium text-xs truncate">{restaurant.name}</h1>
            </div>

            {/* Action Buttons - Minimal */}
            <div className="flex items-center gap-1 flex-shrink-0">
              <button 
                className="w-9 h-9 rounded-lg bg-white/5 hover:bg-white/10 flex items-center justify-center transition-colors relative active:scale-95"
                onClick={() => setIsHistoryDialogOpen(true)}
                data-testid="button-notifications"
              >
                <Bell className="h-4 w-4 text-white/80" />
                {orderHistory.length > 0 && orderHistory.some(o => {
                  const orderDate = new Date(o.createdAt);
                  return Date.now() - orderDate.getTime() < 24 * 60 * 60 * 1000;
                }) && (
                  <span className="absolute top-0.5 right-0.5 w-1.5 h-1.5 bg-amber-500 rounded-full" />
                )}
              </button>
              
              {/* Login/Profile Button */}
              {isAuthenticated && authCustomer ? (
                <button 
                  className="h-9 px-2.5 rounded-lg bg-gradient-to-r from-amber-500/20 to-orange-500/20 border border-amber-500/30 hover:from-amber-500/30 hover:to-orange-500/30 flex items-center gap-1.5 transition-all active:scale-95"
                  onClick={() => setIsLoginDialogOpen(true)}
                  data-testid="button-profile"
                  title={`${authCustomer.loyaltyPoints} pontos de fidelidade`}
                >
                  <div className="w-6 h-6 rounded-full bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center flex-shrink-0">
                    <User className="h-3.5 w-3.5 text-white" />
                  </div>
                  <div className="flex flex-col items-start min-w-0 hidden sm:flex">
                    <span className="text-[9px] text-amber-300 leading-none">Meus Pontos</span>
                    <span className="text-xs font-bold text-white leading-none mt-0.5">{authCustomer.loyaltyPoints}</span>
                  </div>
                </button>
              ) : (
                <button 
                  className="w-9 h-9 rounded-lg bg-white/5 hover:bg-white/10 flex items-center justify-center transition-colors relative active:scale-95 group"
                  onClick={() => setIsLoginDialogOpen(true)}
                  data-testid="button-login"
                  title="Fazer login e ganhar pontos"
                >
                  <User className="h-4 w-4 text-white/80 group-hover:text-amber-500 transition-colors" />
                  <span className="absolute -top-1 -right-1 w-2 h-2 bg-amber-500 rounded-full animate-pulse" />
                </button>
              )}
              
              <Sheet open={isCartOpen} onOpenChange={setIsCartOpen}>
                <SheetTrigger asChild>
                  <button 
                    className="h-9 px-3 rounded-lg bg-amber-500 hover:bg-amber-600 flex items-center gap-1.5 transition-all active:scale-95 shadow-sm relative"
                    data-testid="button-open-cart"
                  >
                    <ShoppingCart className="h-4 w-4 text-white" />
                    <span className="text-white text-xs font-semibold hidden sm:inline">Carrinho</span>
                    <AnimatePresence>
                      {getItemCount() > 0 && (
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          exit={{ scale: 0 }}
                          className="absolute -top-1 -right-1 bg-white text-amber-600 text-[9px] font-bold rounded-full h-3.5 w-3.5 flex items-center justify-center"
                        >
                          {getItemCount()}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </button>
                </SheetTrigger>
                <SheetContent side="rightCompact" className="flex flex-col p-0 bg-white max-h-[85vh] [&>button]:hidden">
                  {/* Header com indicador de etapas */}
                  <div className="p-3 bg-white border-b border-gray-100 flex-shrink-0">
                    <SheetHeader>
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2 flex-1">
                          <div className="w-7 h-7 rounded-full bg-gray-900 flex items-center justify-center">
                            <ShoppingBag className="h-3.5 w-3.5 text-white" />
                          </div>
                          <div>
                            <SheetTitle className="text-base font-bold text-gray-900" data-testid="text-cart-title">
                              {checkoutStep === 1 ? 'Seu Pedido' : checkoutStep === 2 ? 'Entrega' : 'Pagamento'}
                            </SheetTitle>
                            <p className="text-[11px] text-gray-500">
                              Etapa {checkoutStep} de 3
                            </p>
                          </div>
                        </div>
                        {/* Close Button */}
                        <button
                          onClick={() => setIsCartOpen(false)}
                          className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors"
                          data-testid="button-close-cart"
                        >
                          <X className="h-4 w-4 text-gray-600" />
                        </button>
                      </div>
                    </SheetHeader>
                  </div>

                  {/* ETAPA 1: Carrinho + Dados básicos */}
                  {checkoutStep === 1 && (
                    <>
                      <div className="flex-1 overflow-y-auto px-3 py-2">
                        {items.length === 0 ? (
                          <EmptyCart 
                            onBrowseMenu={() => {
                              setIsCartOpen(false);
                              setTimeout(() => {
                                document.querySelector('#menu-section')?.scrollIntoView({ behavior: 'smooth' });
                              }, 300);
                            }}
                          />
                        ) : (
                          <div className="space-y-2">
                            {/* Total Expansível */}
                            <div className="rounded-lg overflow-hidden bg-gradient-to-r from-gray-900 to-gray-800 text-white">
                              <button 
                                onClick={() => setIsCouponExpanded(!isCouponExpanded)}
                                className="w-full p-2.5 flex items-center justify-between hover:bg-black/20 transition-colors"
                              >
                                <div className="flex items-center gap-2">
                                  <Receipt className="h-4 w-4 text-white/60" />
                                  <div className="text-left">
                                    <span className="text-[10px] text-gray-300 block">Total do Pedido</span>
                                    <p className="text-lg font-bold">{formatKwanza(getTotal())}</p>
                                  </div>
                                </div>
                                <ChevronDown className={`h-4 w-4 text-white/60 transition-transform ${isCouponExpanded ? 'rotate-180' : ''}`} />
                              </button>
                              
                              {isCouponExpanded && (
                                <div className="px-2.5 pb-2.5 pt-1 space-y-1 border-t border-white/10">
                                  <div className="flex items-center justify-between text-xs">
                                    <span className="text-white/70">Subtotal ({getItemCount()} {getItemCount() === 1 ? 'item' : 'itens'})</span>
                                    <span className="text-white/90">{formatKwanza(getTotal())}</span>
                                  </div>
                                  {couponValidation?.valid && couponValidation.discountAmount && (
                                    <div className="flex items-center justify-between text-xs">
                                      <span className="text-green-400 flex items-center gap-1">
                                        <Tag className="h-3 w-3" />
                                        Cupom ({couponCode})
                                      </span>
                                      <span className="text-green-400 font-medium">-{formatKwanza(couponValidation.discountAmount)}</span>
                                    </div>
                                  )}
                                  {usePoints && pointsToRedeem > 0 && (
                                    <div className="flex items-center justify-between text-xs">
                                      <span className="text-amber-400 flex items-center gap-1">
                                        <Award className="h-3 w-3" />
                                        Pontos ({pointsToRedeem})
                                      </span>
                                      <span className="text-amber-400 font-medium">-{formatKwanza(getPointsDiscount())}</span>
                                    </div>
                                  )}
                                  {(couponValidation?.valid || (usePoints && pointsToRedeem > 0)) && (
                                    <div className="pt-1 mt-1 border-t border-white/10 flex items-center justify-between">
                                      <span className="text-xs text-white/70">Você economizou</span>
                                      <span className="text-xs font-bold text-green-400">
                                        {formatKwanza((couponValidation?.discountAmount || 0) + getPointsDiscount())}
                                      </span>
                                    </div>
                                  )}
                                  <div className="pt-1 mt-1 border-t border-white/10 flex items-center justify-between">
                                    <span className="text-sm font-semibold text-white">Total Final</span>
                                    <span className="text-base font-bold text-white">{formatKwanza(calculateFinalTotal())}</span>
                                  </div>
                                  {identifiedCustomer?.found && identifiedCustomer.loyalty?.isActive && (
                                    <div className="text-xs text-white/60 flex items-center gap-1">
                                      <Gift className="h-3 w-3" />
                                      Você vai ganhar +{getPointsToEarn()} pontos
                                    </div>
                                  )}
                                </div>
                              )}
                            </div>

                            {/* ✅ IDENTIFICAÇÃO DO CLIENTE (para mesa via QR Code) */}
                            {orderType === 'mesa' && (
                              <div className="rounded-lg bg-blue-50 border border-blue-200 p-3 space-y-3">
                                <div className="flex items-center gap-2">
                                  <User className="h-4 w-4 text-blue-600" />
                                  <h3 className="text-sm font-semibold text-blue-900">Identificação (Opcional)</h3>
                                </div>
                                <p className="text-xs text-blue-700">
                                  Informe seu telefone para acumular pontos e usar cupons!
                                </p>
                                
                                <div className="space-y-2">
                                  <div>
                                    <Label htmlFor="mesa-phone" className="text-xs font-medium text-gray-700">Telefone</Label>
                                    <div className="relative">
                                      <Input
                                        id="mesa-phone"
                                        type="tel"
                                        placeholder="+244 900 000 000"
                                        value={customerPhone}
                                        onChange={(e) => setCustomerPhone(e.target.value)}
                                        className="h-9 text-sm pr-10"
                                      />
                                      {isLookingUpCustomer && (
                                        <div className="absolute right-3 top-1/2 -translate-y-1/2">
                                          <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
                                        </div>
                                      )}
                                      {identifiedCustomer?.found && !isLookingUpCustomer && (
                                        <div className="absolute right-3 top-1/2 -translate-y-1/2">
                                          <CheckCircle className="h-4 w-4 text-green-500" />
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                  
                                  {customerPhone && customerPhone.length >= 9 && (
                                    <div>
                                      <Label htmlFor="mesa-name" className="text-xs font-medium text-gray-700">Nome</Label>
                                      <Input
                                        id="mesa-name"
                                        placeholder="Seu nome"
                                        value={customerName}
                                        onChange={(e) => setCustomerName(e.target.value)}
                                        className="h-9 text-sm"
                                      />
                                    </div>
                                  )}
                                </div>
                                
                                {/* ✅ FEEDBACK: Cliente Identificado */}
                                {identifiedCustomer?.found && identifiedCustomer.customer && (
                                  <div className="rounded-lg bg-green-50 border border-green-200 p-2.5">
                                    <div className="flex items-start gap-2">
                                      <div className="w-7 h-7 rounded-full bg-green-500 flex items-center justify-center flex-shrink-0">
                                        <CheckCircle className="h-4 w-4 text-white" />
                                      </div>
                                      <div className="flex-1">
                                        <p className="text-xs font-semibold text-green-900">
                                          Bem-vindo, {identifiedCustomer.customer.name}! 👋
                                        </p>
                                        <div className="mt-1 flex items-center gap-2 text-xs">
                                          <div className="flex items-center gap-1">
                                            <Award className="h-3.5 w-3.5 text-green-600" />
                                            <span className="text-green-700 font-medium">
                                              {identifiedCustomer.customer.loyaltyPoints} pontos
                                            </span>
                                          </div>
                                          <Badge className="bg-green-100 text-green-700 text-[10px] border-0">
                                            {identifiedCustomer.customer.tier}
                                          </Badge>
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                )}
                                
                                {/* ✅ FEEDBACK: Novo Cliente */}
                                {customerPhone && customerPhone.length >= 9 && !identifiedCustomer?.found && !isLookingUpCustomer && (
                                  <div className="rounded-lg bg-amber-50 border border-amber-200 p-2.5">
                                    <div className="flex items-start gap-2">
                                      <div className="w-7 h-7 rounded-full bg-amber-500 flex items-center justify-center flex-shrink-0">
                                        <UserPlus className="h-4 w-4 text-white" />
                                      </div>
                                      <div className="flex-1">
                                        <p className="text-xs font-semibold text-amber-900">
                                          Novo cliente! 🎉
                                        </p>
                                        <p className="text-xs text-amber-700 mt-0.5">
                                          Você vai começar a acumular pontos com este pedido!
                                        </p>
                                      </div>
                                    </div>
                                  </div>
                                )}
                              </div>
                            )}

                            {/* ✅ FASE 2: CUPONS (para mesa via QR Code) */}
                            {orderType === 'mesa' && identifiedCustomer?.found && (
                              <div className="rounded-lg border border-gray-200 overflow-hidden">
                                <button
                                  onClick={() => setIsCouponExpanded(!isCouponExpanded)}
                                  className="w-full p-3 flex items-center justify-between bg-gray-50 hover:bg-gray-100 transition-colors"
                                >
                                  <div className="flex items-center gap-2">
                                    <Tag className="h-4 w-4 text-gray-600" />
                                    <span className="text-sm font-medium text-gray-700">Cupom de Desconto</span>
                                    {couponValidation?.valid && (
                                      <Badge className="bg-green-100 text-green-700 border-0 text-[10px]">Aplicado</Badge>
                                    )}
                                  </div>
                                  <ChevronDown className={`h-4 w-4 text-gray-400 transition-transform ${isCouponExpanded ? 'rotate-180' : ''}`} />
                                </button>
                                {isCouponExpanded && (
                                  <div className="p-3 border-t border-gray-200 bg-white space-y-2">
                                    <div className="flex gap-2">
                                      <Input
                                        placeholder="DIGITE O CÓDIGO"
                                        value={couponCode}
                                        onChange={(e) => {
                                          setCouponCode(e.target.value.toUpperCase());
                                          if (couponValidation) setCouponValidation(null);
                                        }}
                                        className="h-9 flex-1 uppercase text-sm"
                                      />
                                      <Button
                                        size="sm"
                                        onClick={() => validateCouponMutation.mutate(couponCode)}
                                        disabled={!couponCode || isValidatingCoupon}
                                        className="h-9"
                                      >
                                        {isValidatingCoupon ? (
                                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                        ) : (
                                          'Aplicar'
                                        )}
                                      </Button>
                                    </div>
                                    
                                    {couponValidation?.valid && (
                                      <div className="rounded-lg bg-green-50 border border-green-200 p-2 text-xs text-green-800">
                                        <div className="flex items-center gap-1.5">
                                          <CheckCircle className="h-3.5 w-3.5" />
                                          <span className="font-medium">
                                            Desconto de {formatKwanza(couponValidation.discountAmount || 0)} aplicado!
                                          </span>
                                        </div>
                                      </div>
                                    )}
                                    
                                    {couponValidation && !couponValidation.valid && (
                                      <div className="rounded-lg bg-red-50 border border-red-200 p-2 text-xs text-red-800">
                                        <div className="flex items-center gap-1.5">
                                          <XCircle className="h-3.5 w-3.5" />
                                          <span>{couponValidation.message || 'Cupom inválido'}</span>
                                        </div>
                                      </div>
                                    )}
                                  </div>
                                )}
                              </div>
                            )}

                            {/* ✅ FASE 3: FIDELIDADE (para mesa via QR Code) */}
                            {orderType === 'mesa' && identifiedCustomer?.found && identifiedCustomer.loyalty?.isActive && (
                              <div className="rounded-lg border border-amber-200 overflow-hidden">
                                <button
                                  onClick={() => setIsPointsExpanded(!isPointsExpanded)}
                                  className="w-full p-3 flex items-center justify-between bg-amber-50 hover:bg-amber-100 transition-colors"
                                >
                                  <div className="flex items-center gap-2">
                                    <Award className="h-4 w-4 text-amber-600" />
                                    <span className="text-sm font-medium text-amber-900">Usar Pontos</span>
                                    {usePoints && pointsToRedeem > 0 && (
                                      <Badge className="bg-amber-100 text-amber-700 border-0 text-[10px]">
                                        {pointsToRedeem} pts
                                      </Badge>
                                    )}
                                  </div>
                                  <ChevronDown className={`h-4 w-4 text-amber-600 transition-transform ${isPointsExpanded ? 'rotate-180' : ''}`} />
                                </button>
                                {isPointsExpanded && (
                                  <div className="p-3 border-t border-amber-200 bg-white space-y-3">
                                    <div className="flex items-center justify-between">
                                      <div>
                                        <div className="text-xs text-gray-600">Saldo disponível</div>
                                        <div className="text-lg font-bold text-amber-600">
                                          {identifiedCustomer.customer?.loyaltyPoints || 0} pontos
                                        </div>
                                        <div className="text-xs text-gray-500">
                                          = {formatKwanza((identifiedCustomer.customer?.loyaltyPoints || 0) * parseFloat(identifiedCustomer.loyalty.currencyPerPoint))}
                                        </div>
                                      </div>
                                      <Switch
                                        checked={usePoints}
                                        onCheckedChange={setUsePoints}
                                      />
                                    </div>
                                    
                                    {usePoints && (
                                      <div className="space-y-2">
                                        <Label className="text-xs">Quantos pontos usar?</Label>
                                        <Input
                                          type="number"
                                          min={identifiedCustomer.loyalty.minPointsToRedeem || 100}
                                          max={identifiedCustomer.customer?.loyaltyPoints || 0}
                                          value={pointsToRedeem}
                                          onChange={(e) => setPointsToRedeem(parseInt(e.target.value) || 0)}
                                          className="h-9 text-sm"
                                        />
                                        <div className="text-xs text-gray-600">
                                          Mínimo: {identifiedCustomer.loyalty.minPointsToRedeem || 100} pontos
                                        </div>
                                        <div className="rounded-lg bg-amber-50 border border-amber-200 p-2">
                                          <div className="text-xs text-amber-900 font-medium">
                                            Desconto: {formatKwanza(getPointsDiscount())}
                                          </div>
                                        </div>
                                      </div>
                                    )}
                                  </div>
                                )}
                              </div>
                            )}

                            {/* Itens do carrinho */}
                            <div className="space-y-2">
                              {items.map((item) => (
                                <div
                                  key={item.id}
                                  className="p-2 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors border border-gray-200"
                                  data-testid={`cart-item-${item.id}`}
                                >
                                  <div className="flex items-center justify-between gap-2">
                                    {/* Quantidade em destaque */}
                                    <div className="flex items-center gap-1 bg-gray-900 rounded-full p-0.5 flex-shrink-0">
                                      <Button
                                        variant="ghost"
                                        size="icon"
                                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                        data-testid={`button-decrease-${item.id}`}
                                        className="h-6 w-6 rounded-full bg-white hover:bg-gray-100 text-gray-600"
                                      >
                                        <Minus className="h-3 w-3" />
                                      </Button>
                                      <span className="w-6 text-center font-bold text-xs text-white" data-testid={`text-quantity-${item.id}`}>
                                        {item.quantity}
                                      </span>
                                      <Button
                                        variant="ghost"
                                        size="icon"
                                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                        data-testid={`button-increase-${item.id}`}
                                        className="h-6 w-6 rounded-full bg-white hover:bg-gray-100 text-gray-900"
                                      >
                                        <Plus className="h-3 w-3" />
                                      </Button>
                                    </div>
                                    
                                    {/* Nome e opções */}
                                    <div className="flex-1 min-w-0">
                                      <h4 className="font-semibold text-xs text-gray-900 leading-tight line-clamp-1">{item.menuItem.name}</h4>
                                      {item.selectedOptions.length > 0 && (
                                        <p className="text-[10px] text-gray-500 truncate mt-0.5">
                                          {item.selectedOptions.map(opt => opt.optionName).join(', ')}
                                        </p>
                                      )}
                                    </div>
                                    
                                    {/* Preço e remover */}
                                    <div className="flex items-center gap-2 flex-shrink-0">
                                      <span className="font-bold text-xs text-gray-900 whitespace-nowrap">
                                        {formatKwanza(
                                          (parseFloat(item.menuItem.price) + 
                                            item.selectedOptions.reduce((sum, opt) => sum + parseFloat(opt.priceAdjustment) * opt.quantity, 0)
                                          ) * item.quantity
                                        )}
                                      </span>
                                      <Button
                                        variant="ghost"
                                        size="icon"
                                        onClick={() => removeItem(item.id)}
                                        data-testid={`button-remove-${item.id}`}
                                        className="h-6 w-6 rounded-full text-gray-400 hover:text-red-500 hover:bg-red-50"
                                      >
                                        <Trash2 className="h-3 w-3" />
                                      </Button>
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>

                            {/* Campos básicos */}
                            <div className="space-y-2 pt-2">
                              <div>
                                <Label htmlFor="customer-phone" className="text-[10px] font-medium mb-0.5 block text-gray-600">WhatsApp</Label>
                                <div className="relative">
                                  <input
                                    id="customer-phone"
                                    type="tel"
                                    placeholder="+244 900 000 000"
                                    value={customerPhone}
                                    onChange={(e) => setCustomerPhone(e.target.value)}
                                    className="w-full h-9 px-3 rounded-lg border border-gray-200 bg-gray-50 focus:bg-white focus:border-gray-400 focus:outline-none text-sm pr-10"
                                    style={{ color: '#1a1a1a', caretColor: '#1a1a1a' }}
                                    data-testid="input-customer-phone"
                                  />
                                  {isLookingUpCustomer && (
                                    <div className="absolute right-3 top-1/2 -translate-y-1/2">
                                      <div className="w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin" />
                                    </div>
                                  )}
                                  {identifiedCustomer?.found && !isLookingUpCustomer && (
                                    <div className="absolute right-3 top-1/2 -translate-y-1/2">
                                      <CheckCircle className="h-4 w-4 text-green-500" />
                                    </div>
                                  )}
                                </div>
                              </div>

                              {/* Card "Bem-vindo de volta" quando cliente identificado */}
                              {identifiedCustomer?.found && identifiedCustomer.customer && !isLookingUpCustomer && (
                                <motion.div
                                  initial={{ opacity: 0, y: -10, scale: 0.95 }}
                                  animate={{ opacity: 1, y: 0, scale: 1 }}
                                  transition={{ 
                                    duration: 0.3, 
                                    ease: [0.34, 1.56, 0.64, 1] // Easing suave com bounce
                                  }}
                                  className="rounded-lg bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 p-3 md:p-4 shadow-sm hover:shadow-md transition-shadow"
                                  title="Cliente identificado com sucesso"
                                >
                                  <div className="flex items-start gap-2 md:gap-3">
                                    <motion.div 
                                      className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-green-500 flex items-center justify-center flex-shrink-0"
                                      initial={{ scale: 0 }}
                                      animate={{ scale: 1 }}
                                      transition={{ delay: 0.1, type: "spring", stiffness: 500 }}
                                    >
                                      <CheckCircle className="h-4 w-4 md:h-5 md:w-5 text-white" />
                                    </motion.div>
                                    <div className="flex-1">
                                      <p className="text-sm md:text-base font-semibold text-green-900">
                                        Bem-vindo de volta, {identifiedCustomer.customer.name}! 👋
                                      </p>
                                      <div className="mt-1.5 flex flex-wrap items-center gap-2 md:gap-3 text-xs md:text-sm">
                                        <div 
                                          className="flex items-center gap-1 group relative"
                                          title="Saldo atual de pontos de fidelidade"
                                        >
                                          <Award className="h-3.5 w-3.5 md:h-4 md:w-4 text-green-600" />
                                          <span className="text-green-700 font-medium">
                                            {identifiedCustomer.customer.loyaltyPoints} pontos
                                          </span>
                                        </div>
                                        <Badge 
                                          className="bg-green-100 text-green-700 text-[10px] md:text-xs border-0"
                                          title={`Nível de fidelidade: ${identifiedCustomer.customer.tier}`}
                                        >
                                          {identifiedCustomer.customer.tier}
                                        </Badge>
                                      </div>
                                      {identifiedCustomer.loyalty?.isActive && getPointsToEarn() > 0 && (
                                        <motion.p 
                                          className="text-xs md:text-sm text-green-600 mt-1.5 flex items-center gap-1"
                                          initial={{ opacity: 0, x: -5 }}
                                          animate={{ opacity: 1, x: 0 }}
                                          transition={{ delay: 0.3 }}
                                          title={`Você ganhará ${getPointsToEarn()} pontos ao finalizar este pedido`}
                                        >
                                          <Gift className="h-3 w-3 md:h-3.5 md:w-3.5" />
                                          Você vai ganhar <strong>+{getPointsToEarn()} pontos</strong> neste pedido!
                                        </motion.p>
                                      )}
                                      
                                      {/* Oferecer login se não estiver autenticado */}
                                      {!isAuthenticated && (
                                        <motion.div
                                          initial={{ opacity: 0, y: 5 }}
                                          animate={{ opacity: 1, y: 0 }}
                                          transition={{ delay: 0.5 }}
                                          className="mt-3 pt-3 border-t border-green-200"
                                        >
                                          <Button
                                            size="sm"
                                            onClick={() => {
                                              setIsLoginDialogOpen(true);
                                            }}
                                            className="w-full bg-green-600 hover:bg-green-700 text-white text-xs h-8"
                                          >
                                            <User className="w-3 h-3 mr-1.5" />
                                            Fazer login para acessar benefícios
                                          </Button>
                                          <p className="text-[10px] text-green-600 text-center mt-1.5">
                                            Acesse seu perfil completo e histórico de pedidos
                                          </p>
                                        </motion.div>
                                      )}
                                    </div>
                                  </div>
                                </motion.div>
                              )}

                              {/* Oferecer cadastro quando não encontrado */}
                              {customerPhone && customerPhone.length >= 9 && !identifiedCustomer?.found && !isLookingUpCustomer && (
                                <motion.div
                                  initial={{ opacity: 0, y: -10, scale: 0.95 }}
                                  animate={{ opacity: 1, y: 0, scale: 1 }}
                                  transition={{ 
                                    duration: 0.3, 
                                    ease: [0.34, 1.56, 0.64, 1] // Easing suave com bounce
                                  }}
                                  className="rounded-lg bg-gradient-to-r from-blue-50 to-cyan-50 border border-blue-200 p-3 md:p-4 shadow-sm hover:shadow-md transition-shadow"
                                  title="Novo cliente - cadastre-se para ganhar benefícios"
                                >
                                  <div className="flex items-start gap-2 md:gap-3">
                                    <motion.div 
                                      className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-blue-500 flex items-center justify-center flex-shrink-0"
                                      initial={{ scale: 0, rotate: -180 }}
                                      animate={{ scale: 1, rotate: 0 }}
                                      transition={{ delay: 0.1, type: "spring", stiffness: 400 }}
                                    >
                                      <UserPlus className="h-4 w-4 md:h-5 md:w-5 text-white" />
                                    </motion.div>
                                    <motion.div
                                      initial={{ opacity: 0, scale: 0.95 }}
                                      animate={{ opacity: 1, scale: 1 }}
                                      transition={{ delay: 0.2, duration: 0.4 }}
                                      className="relative overflow-hidden flex-1"
                                    >
                                      {/* Background Pattern */}
                                      <div className="absolute inset-0 bg-gradient-to-br from-amber-500/10 via-orange-500/5 to-transparent rounded-xl" />
                                      <div className="absolute top-0 right-0 w-24 h-24 bg-amber-400/10 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2" />
                                      
                                      <div className="relative p-3 md:p-4 bg-gradient-to-br from-amber-50 to-orange-50 rounded-xl border-2 border-amber-200/50">
                                        {/* Icon Badge */}
                                        <motion.div 
                                          className="inline-flex items-center gap-1.5 px-2 py-0.5 bg-gradient-to-r from-amber-500 to-orange-500 rounded-full mb-2 shadow-md"
                                          animate={{ 
                                            scale: [1, 1.05, 1],
                                          }}
                                          transition={{ 
                                            duration: 2,
                                            repeat: Infinity,
                                            ease: "easeInOut"
                                          }}
                                        >
                                          <Gift className="h-3 w-3 text-white" />
                                          <span className="text-[10px] font-bold text-white">Novo Cliente</span>
                                        </motion.div>
                                        
                                        {/* Title with Emoji */}
                                        <motion.div 
                                          className="flex items-center gap-2 mb-2"
                                          initial={{ opacity: 0, x: -10 }}
                                          animate={{ opacity: 1, x: 0 }}
                                          transition={{ delay: 0.3 }}
                                        >
                                          <motion.span 
                                            className="text-xl"
                                            animate={{ 
                                              rotate: [0, -10, 10, -10, 0],
                                            }}
                                            transition={{ 
                                              duration: 0.5,
                                              delay: 0.5
                                            }}
                                          >
                                            🎉
                                          </motion.span>
                                          <h4 className="text-sm md:text-base font-bold text-amber-900">
                                            Primeira vez aqui?
                                          </h4>
                                        </motion.div>
                                        
                                        {/* Description */}
                                        <motion.p 
                                          className="text-xs text-amber-800 mb-3 leading-relaxed"
                                          initial={{ opacity: 0 }}
                                          animate={{ opacity: 1 }}
                                          transition={{ delay: 0.4 }}
                                        >
                                          <strong className="font-semibold">Ganhe pontos</strong> em cada pedido e troque por <strong className="font-semibold">descontos!</strong>
                                        </motion.p>
                                        
                                        {/* Benefits List - Compact */}
                                        <motion.div 
                                          className="space-y-1.5 mb-3"
                                          initial={{ opacity: 0, y: 10 }}
                                          animate={{ opacity: 1, y: 0 }}
                                          transition={{ delay: 0.5 }}
                                        >
                                          <div className="flex items-center gap-1.5 text-xs text-amber-900">
                                            <div className="w-4 h-4 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center flex-shrink-0">
                                              <Star className="h-2.5 w-2.5 text-white fill-white" />
                                            </div>
                                            <span className="font-medium">Pontos a cada compra</span>
                                          </div>
                                          <div className="flex items-center gap-1.5 text-xs text-amber-900">
                                            <div className="w-4 h-4 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center flex-shrink-0">
                                              <Award className="h-2.5 w-2.5 text-white" />
                                            </div>
                                            <span className="font-medium">Descontos exclusivos</span>
                                          </div>
                                        </motion.div>
                                        
                                        {/* CTA Button */}
                                        <motion.div
                                          initial={{ opacity: 0, y: 10 }}
                                          animate={{ opacity: 1, y: 0 }}
                                          transition={{ delay: 0.6 }}
                                        >
                                          <Button 
                                            size="sm"
                                            className="w-full h-9 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-bold text-xs rounded-xl shadow-md hover:shadow-lg transition-all hover:scale-[1.02] active:scale-95"
                                            onClick={() => {
                                              playSound('click');
                                              setRegisterFormData({
                                                ...registerFormData,
                                                phone: customerPhone,
                                                name: customerName
                                              });
                                              setIsCartOpen(false);
                                              setTimeout(() => setIsRegisterDialogOpen(true), 300);
                                            }}
                                            title="Clique para criar sua conta em menos de 30 segundos"
                                          >
                                            <Gift className="h-3.5 w-3.5 mr-1.5" />
                                            Criar Conta e Ganhar Pontos
                                          </Button>
                                        </motion.div>
                                      </div>
                                    </motion.div>
                                  </div>
                                </motion.div>
                              )}

                              <div>
                                <Label htmlFor="customer-name" className="text-[10px] font-medium mb-0.5 block text-gray-600">Seu Nome</Label>
                                <input
                                  id="customer-name"
                                  type="text"
                                  placeholder="Digite seu nome"
                                  value={customerName}
                                  onChange={(e) => setCustomerName(e.target.value)}
                                  className="w-full h-9 px-3 rounded-lg border border-gray-200 bg-gray-50 focus:bg-white focus:border-gray-400 focus:outline-none text-sm"
                                  style={{ color: '#1a1a1a', caretColor: '#1a1a1a' }}
                                  data-testid="input-customer-name"
                                />
                              </div>
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Botão Continuar - Etapa 1 */}
                      {items.length > 0 && (
                        <div className="p-3 border-t border-gray-100 flex-shrink-0">
                          <Button
                            className="w-full h-10 bg-gray-900 hover:bg-gray-800 text-white font-bold text-sm rounded-lg transition-all duration-200"
                            onClick={() => setCheckoutStep(2)}
                            disabled={!customerPhone.trim() || !customerName.trim()}
                            data-testid="button-continue-checkout"
                          >
                            <div className="flex items-center justify-between w-full">
                              <span>Continuar para Entrega</span>
                              <ChevronRight className="h-4 w-4" />
                            </div>
                          </Button>
                        </div>
                      )}
                    </>
                  )}

                  {/* ETAPA 2: Entrega + Opcionais */}
                  {checkoutStep === 2 && items.length > 0 && (
                    <>
                      <div className="flex-1 overflow-y-auto px-3 py-2">
                        <div className="space-y-3">
                          {/* Resumo do Pedido */}
                          <div className="rounded-xl bg-gradient-to-br from-gray-900 to-gray-800 p-3 text-white">
                            <div className="flex items-center gap-2 mb-2">
                              <Receipt className="h-4 w-4 text-white/70" />
                              <span className="text-xs font-medium text-white/70 uppercase tracking-wide">Resumo do Pedido</span>
                            </div>
                            <div className="space-y-1.5 mb-3">
                              {items.map((item) => (
                                <div key={item.id} className="flex items-center justify-between gap-2 text-sm">
                                  <div className="flex items-center gap-2 flex-1 min-w-0">
                                    <span className="bg-white/20 text-white text-[10px] font-medium rounded px-1.5 py-0.5">
                                      {item.quantity}x
                                    </span>
                                    <span className="text-white/90 truncate">{item.menuItem.name}</span>
                                  </div>
                                  <span className="text-white font-medium whitespace-nowrap">
                                    {formatKwanza(
                                      (parseFloat(item.menuItem.price) + 
                                        item.selectedOptions.reduce((sum, opt) => sum + parseFloat(opt.priceAdjustment) * opt.quantity, 0)
                                      ) * item.quantity
                                    )}
                                  </span>
                                </div>
                              ))}
                            </div>
                            <div className="pt-2 border-t border-white/20 flex items-center justify-between">
                              <span className="text-sm text-white/70">Total</span>
                              <span className="text-lg font-bold text-white">{formatKwanza(getTotal())}</span>
                            </div>
                          </div>

                          {/* Dados do Cliente */}
                          <div className="rounded-lg bg-gray-50 p-3 space-y-2">
                            <div className="flex items-center gap-2 text-xs text-gray-500">
                              <User className="h-3.5 w-3.5" />
                              <span className="font-medium text-gray-700">{customerName}</span>
                            </div>
                            <div className="flex items-center gap-2 text-xs text-gray-500">
                              <Phone className="h-3.5 w-3.5" />
                              <span className="font-medium text-gray-700">{customerPhone}</span>
                            </div>
                            {identifiedCustomer?.found && (
                              <div className="flex items-center gap-1.5 text-xs">
                                <Award className="h-3.5 w-3.5 text-amber-500" />
                                <span className="text-amber-600 font-medium">{identifiedCustomer.customer?.loyaltyPoints} pontos</span>
                                <Badge className="bg-amber-100 text-amber-700 text-[9px] border-0 ml-1">{identifiedCustomer.customer?.tier}</Badge>
                              </div>
                            )}
                          </div>

                          {/* Tipo de entrega */}
                          <Tabs value={orderType} onValueChange={(v) => setOrderType(v as 'delivery' | 'takeout')}>
                            <TabsList className="grid w-full grid-cols-2 h-10 bg-gray-100 rounded-lg p-1">
                              <TabsTrigger 
                                value="delivery" 
                                data-testid="tab-delivery" 
                                className="gap-1.5 text-sm rounded-md data-[state=active]:bg-white data-[state=active]:text-gray-900"
                              >
                                <Bike className="h-4 w-4" />
                                Delivery
                              </TabsTrigger>
                              <TabsTrigger 
                                value="takeout" 
                                data-testid="tab-takeout" 
                                className="gap-1.5 text-sm rounded-md data-[state=active]:bg-white data-[state=active]:text-gray-900"
                              >
                                <ShoppingBag className="h-4 w-4" />
                                Retirada
                              </TabsTrigger>
                            </TabsList>
                          </Tabs>

                          {/* Endereço (se delivery) */}
                          {orderType === 'delivery' && (
                            <div className="space-y-3">
                              <div>
                                <Label htmlFor="delivery-address" className="text-xs font-medium mb-1 block text-gray-700">Endereço de Entrega</Label>
                                <textarea
                                  id="delivery-address"
                                  placeholder="Rua, número, bairro, cidade..."
                                  value={deliveryAddress}
                                  onChange={(e) => setDeliveryAddress(e.target.value)}
                                  rows={2}
                                  data-testid="input-delivery-address"
                                  className="w-full px-3 py-2 text-sm resize-none rounded-lg border border-gray-200 bg-gray-50 focus:bg-white focus:border-gray-400 focus:outline-none"
                                  style={{ color: '#1a1a1a', caretColor: '#1a1a1a' }}
                                />
                              </div>
                              <div>
                                <Label htmlFor="delivery-notes" className="text-xs font-medium mb-1 block text-gray-700">Observações (opcional)</Label>
                                <textarea
                                  id="delivery-notes"
                                  placeholder="Ex: Portão azul, interfone 12, deixar com porteiro..."
                                  value={deliveryNotes}
                                  onChange={(e) => setDeliveryNotes(e.target.value)}
                                  rows={2}
                                  data-testid="input-delivery-notes"
                                  className="w-full px-3 py-2 text-sm resize-none rounded-lg border border-gray-200 bg-gray-50 focus:bg-white focus:border-gray-400 focus:outline-none"
                                  style={{ color: '#1a1a1a', caretColor: '#1a1a1a' }}
                                />
                              </div>
                            </div>
                          )}

                          {/* Método de Pagamento */}
                          <div className="space-y-2">
                            <Label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                              <CreditCard className="h-4 w-4" />
                              Forma de Pagamento
                            </Label>
                            <div className="grid grid-cols-2 gap-2">
                              <button
                                type="button"
                                onClick={() => setSelectedPaymentMethod('dinheiro')}
                                className={`p-3 rounded-lg border-2 transition-all flex flex-col items-center gap-1 ${
                                  selectedPaymentMethod === 'dinheiro' 
                                    ? 'border-green-500 bg-green-50' 
                                    : 'border-gray-200 hover:border-gray-300'
                                }`}
                                data-testid="payment-dinheiro"
                              >
                                <Banknote className={`h-5 w-5 ${selectedPaymentMethod === 'dinheiro' ? 'text-green-600' : 'text-gray-500'}`} />
                                <span className={`text-xs font-medium ${selectedPaymentMethod === 'dinheiro' ? 'text-green-700' : 'text-gray-600'}`}>Dinheiro</span>
                              </button>
                              <button
                                type="button"
                                onClick={() => setSelectedPaymentMethod('multicaixa')}
                                className={`p-3 rounded-lg border-2 transition-all flex flex-col items-center gap-1 ${
                                  selectedPaymentMethod === 'multicaixa' 
                                    ? 'border-green-500 bg-green-50' 
                                    : 'border-gray-200 hover:border-gray-300'
                                }`}
                                data-testid="payment-multicaixa"
                              >
                                <Smartphone className={`h-5 w-5 ${selectedPaymentMethod === 'multicaixa' ? 'text-green-600' : 'text-gray-500'}`} />
                                <span className={`text-xs font-medium ${selectedPaymentMethod === 'multicaixa' ? 'text-green-700' : 'text-gray-600'}`}>Multicaixa</span>
                              </button>
                              <button
                                type="button"
                                onClick={() => setSelectedPaymentMethod('transferencia')}
                                className={`p-3 rounded-lg border-2 transition-all flex flex-col items-center gap-1 ${
                                  selectedPaymentMethod === 'transferencia' 
                                    ? 'border-green-500 bg-green-50' 
                                    : 'border-gray-200 hover:border-gray-300'
                                }`}
                                data-testid="payment-transferencia"
                              >
                                <Building2 className={`h-5 w-5 ${selectedPaymentMethod === 'transferencia' ? 'text-green-600' : 'text-gray-500'}`} />
                                <span className={`text-xs font-medium ${selectedPaymentMethod === 'transferencia' ? 'text-green-700' : 'text-gray-600'}`}>Transferência</span>
                              </button>
                              <button
                                type="button"
                                onClick={() => setSelectedPaymentMethod('cartao')}
                                className={`p-3 rounded-lg border-2 transition-all flex flex-col items-center gap-1 ${
                                  selectedPaymentMethod === 'cartao' 
                                    ? 'border-green-500 bg-green-50' 
                                    : 'border-gray-200 hover:border-gray-300'
                                }`}
                                data-testid="payment-cartao"
                              >
                                <CreditCard className={`h-5 w-5 ${selectedPaymentMethod === 'cartao' ? 'text-green-600' : 'text-gray-500'}`} />
                                <span className={`text-xs font-medium ${selectedPaymentMethod === 'cartao' ? 'text-green-700' : 'text-gray-600'}`}>Cartão</span>
                              </button>
                            </div>
                            <p className="text-xs text-gray-500 text-center">
                              {orderType === 'delivery' ? 'Pagamento na entrega' : 'Pagamento na retirada'}
                            </p>
                          </div>

                          {/* Seção recolhível: Cupom */}
                          <div className="rounded-lg border border-gray-200 overflow-hidden">
                            <button
                              onClick={() => setIsCouponExpanded(!isCouponExpanded)}
                              className="w-full p-3 flex items-center justify-between bg-gray-50 hover:bg-gray-100 transition-colors"
                            >
                              <div className="flex items-center gap-2">
                                <Tag className="h-4 w-4 text-gray-600" />
                                <span className="text-sm font-medium text-gray-700">Cupom de Desconto</span>
                                {couponValidation?.valid && (
                                  <Badge className="bg-green-100 text-green-700 border-0 text-[10px]">Aplicado</Badge>
                                )}
                              </div>
                              <ChevronDown className={`h-4 w-4 text-gray-400 transition-transform ${isCouponExpanded ? 'rotate-180' : ''}`} />
                            </button>
                            {isCouponExpanded && (
                              <div className="p-3 border-t border-gray-200 bg-white">
                                <div className="flex gap-2">
                                  <input
                                    placeholder="DIGITE O CÓDIGO"
                                    value={couponCode}
                                    onChange={(e) => {
                                      setCouponCode(e.target.value.toUpperCase());
                                      if (couponValidation) setCouponValidation(null);
                                    }}
                                    className="h-9 px-3 rounded-lg flex-1 uppercase text-sm border border-gray-200 bg-gray-50 focus:bg-white focus:border-gray-400 focus:outline-none"
                                    style={{ color: '#1a1a1a', caretColor: '#1a1a1a' }}
                                    data-testid="input-coupon-code"
                                  />
                                  <Button
                                    variant="outline"
                                    onClick={handleValidateCoupon}
                                    disabled={isValidatingCoupon || !couponCode.trim()}
                                    className="h-9 px-4 rounded-lg text-sm"
                                    data-testid="button-apply-coupon"
                                  >
                                    {isValidatingCoupon ? (
                                      <div className="w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin" />
                                    ) : (
                                      'Aplicar'
                                    )}
                                  </Button>
                                </div>
                                {couponValidation?.valid && (
                                  <p className="mt-2 text-sm text-green-600 flex items-center gap-1">
                                    <CheckCircle className="h-4 w-4" />
                                    Desconto de {formatKwanza(couponValidation.discountAmount || 0)} aplicado!
                                  </p>
                                )}
                                {couponValidation && !couponValidation.valid && (
                                  <p className="mt-2 text-red-500 text-xs">{couponValidation.message}</p>
                                )}
                              </div>
                            )}
                          </div>

                          {/* Seção recolhível: Pontos de Fidelidade */}
                          {identifiedCustomer?.found && identifiedCustomer.loyalty?.isActive && identifiedCustomer.loyalty.maxRedeemablePoints > 0 && (
                            <div className="rounded-lg border border-amber-200 overflow-hidden">
                              <button
                                onClick={() => setIsPointsExpanded(!isPointsExpanded)}
                                className="w-full p-3 flex items-center justify-between bg-amber-50 hover:bg-amber-100 transition-colors"
                              >
                                <div className="flex items-center gap-2">
                                  <Award className="h-4 w-4 text-amber-600" />
                                  <span className="text-sm font-medium text-amber-800">
                                    Usar Pontos ({identifiedCustomer.customer?.loyaltyPoints} pts)
                                  </span>
                                  {usePoints && (
                                    <Badge className="bg-amber-100 text-amber-700 border-0 text-[10px]">Ativo</Badge>
                                  )}
                                </div>
                                <ChevronDown className={`h-4 w-4 text-amber-400 transition-transform ${isPointsExpanded ? 'rotate-180' : ''}`} />
                              </button>
                              {isPointsExpanded && (
                                <div className="p-3 border-t border-amber-200 bg-white">
                                  <div className="flex items-center justify-between mb-2">
                                    <Label className="text-sm text-amber-700 flex items-center gap-1">
                                      <Gift className="h-4 w-4" />
                                      Usar pontos neste pedido
                                    </Label>
                                    <Switch
                                      checked={usePoints}
                                      onCheckedChange={(checked) => {
                                        setUsePoints(checked);
                                        if (checked) {
                                          setPointsToRedeem(identifiedCustomer.loyalty?.maxRedeemablePoints || 0);
                                        } else {
                                          setPointsToRedeem(0);
                                        }
                                      }}
                                      data-testid="switch-use-points"
                                    />
                                  </div>
                                  {usePoints && (
                                    <div className="space-y-2">
                                      <div className="flex items-center gap-2">
                                        <input
                                          type="number"
                                          min={identifiedCustomer.loyalty?.minPointsToRedeem || 0}
                                          max={identifiedCustomer.loyalty?.maxRedeemablePoints || 0}
                                          value={pointsToRedeem}
                                          onChange={(e) => setPointsToRedeem(Math.min(
                                            parseInt(e.target.value) || 0,
                                            identifiedCustomer.loyalty?.maxRedeemablePoints || 0
                                          ))}
                                          className="flex-1 h-9 px-3 rounded-lg border border-amber-300 bg-white text-sm focus:border-amber-400 focus:outline-none"
                                          style={{ color: '#1a1a1a', caretColor: '#1a1a1a' }}
                                          data-testid="input-points-to-redeem"
                                        />
                                        <span className="text-sm font-medium text-amber-600">
                                          = {formatKwanza(getPointsDiscount())}
                                        </span>
                                      </div>
                                      <p className="text-xs text-amber-600">
                                        Mín: {identifiedCustomer.loyalty?.minPointsToRedeem} | Máx: {identifiedCustomer.loyalty?.maxRedeemablePoints} pts
                                      </p>
                                    </div>
                                  )}
                                </div>
                              )}
                            </div>
                          )}

                          {/* Resumo de descontos */}
                          {(couponValidation?.valid || (usePoints && pointsToRedeem > 0)) && (
                            <div className="rounded-lg p-3 bg-gray-50 border border-gray-200 space-y-2">
                              <div className="flex items-center justify-between text-sm">
                                <span className="text-gray-600">Subtotal</span>
                                <span className="text-gray-900">{formatKwanza(getTotal())}</span>
                              </div>
                              {couponValidation?.valid && (
                                <div className="flex items-center justify-between text-sm text-green-600">
                                  <span>Desconto cupom</span>
                                  <span>-{formatKwanza(couponValidation.discountAmount || 0)}</span>
                                </div>
                              )}
                              {usePoints && pointsToRedeem > 0 && (
                                <div className="flex items-center justify-between text-sm text-amber-600">
                                  <span>Desconto pontos</span>
                                  <span>-{formatKwanza(getPointsDiscount())}</span>
                                </div>
                              )}
                              <div className="pt-2 border-t border-gray-200 flex items-center justify-between">
                                <span className="font-semibold text-gray-900">Total Final</span>
                                <span className="font-bold text-lg text-gray-900">{formatKwanza(calculateFinalTotal())}</span>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Botões - Etapa 2 */}
                      <div className="p-3 border-t border-gray-100 flex-shrink-0 space-y-2">
                        <Button
                          className="w-full h-11 bg-gradient-to-r from-green-600 to-green-500 hover:from-green-700 hover:to-green-600 text-white font-bold text-sm rounded-lg shadow-md transition-all duration-200"
                          onClick={handleConfirmOrder}
                          disabled={createOrderMutation.isPending || (orderType === 'delivery' && !deliveryAddress.trim())}
                          data-testid="button-confirm-order"
                        >
                          {createOrderMutation.isPending ? (
                            <div className="flex items-center gap-2">
                              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                              Enviando...
                            </div>
                          ) : (
                            <div className="flex items-center gap-2">
                              <SiWhatsapp className="h-4 w-4" />
                              Finalizar Pedido
                            </div>
                          )}
                        </Button>
                        <Button
                          variant="ghost"
                          className="w-full h-9 text-gray-600 text-sm"
                          onClick={() => setCheckoutStep(1)}
                          data-testid="button-back-checkout"
                        >
                          <ChevronLeft className="h-4 w-4 mr-1" />
                          Voltar
                        </Button>
                      </div>
                    </>
                  )}
                </SheetContent>
              </Sheet>
            </div>
          </div>

        </div>
      </header>

      {/* Search Modal - Full Screen Overlay */}
      <AnimatePresence>
        {isSearchModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-50 bg-black/95 backdrop-blur-md"
            onClick={() => setIsSearchModalOpen(false)}
          >
            <div className="h-full flex flex-col" onClick={(e) => e.stopPropagation()}>
              {/* Header */}
              <div className="flex items-center justify-between p-4 border-b border-white/10">
                <h2 className="text-lg font-semibold text-white">Pesquisar Cardápio</h2>
                <button
                  onClick={() => setIsSearchModalOpen(false)}
                  className="w-9 h-9 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center transition-all"
                >
                  <X className="h-5 w-5 text-white/70" />
                </button>
              </div>

              {/* Search Input */}
              <div className="p-4">
                <div className="relative">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-white/50" />
                  <input
                    type="text"
                    placeholder="Digite o nome do produto..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    autoFocus
                    className="w-full h-14 pl-12 pr-4 rounded-xl bg-white/5 backdrop-blur-sm border border-white/10 placeholder:text-white/50 text-white focus:bg-white/10 focus:border-amber-500/50 focus:outline-none transition-all text-base"
                    data-testid="input-search"
                  />
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery('')}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-white/50 hover:text-white/70"
                    >
                      <X className="h-5 w-5" />
                    </button>
                  )}
                </div>
              </div>

              {/* Results */}
              <div className="flex-1 overflow-y-auto px-4 pb-4">
                {searchQuery ? (
                  filteredItems.length > 0 ? (
                    <div className="space-y-3">
                      <p className="text-sm text-white/50 mb-3">
                        {filteredItems.length} {filteredItems.length === 1 ? 'resultado encontrado' : 'resultados encontrados'}
                      </p>
                      {filteredItems.map((item) => (
                        <motion.button
                          key={item.id}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          onClick={() => {
                            handleAddMenuItem(item);
                            setIsSearchModalOpen(false);
                          }}
                          className="w-full flex gap-3 p-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 hover:border-amber-500/30 transition-all text-left"
                        >
                          {item.imageUrl && (
                            <img
                              src={item.imageUrl}
                              alt={item.name}
                              className="w-16 h-16 rounded-lg object-cover"
                            />
                          )}
                          <div className="flex-1 min-w-0">
                            <h3 className="font-semibold text-white text-sm line-clamp-1">{item.name}</h3>
                            {item.description && (
                              <p className="text-xs text-white/60 line-clamp-1 mt-0.5">{item.description}</p>
                            )}
                            <p className="font-bold text-amber-500 text-sm mt-1">
                              {formatKwanza(item.promotionPrice || item.price)}
                            </p>
                          </div>
                        </motion.button>
                      ))}
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center py-12">
                      <Search className="h-12 w-12 text-white/20 mb-3" />
                      <p className="text-white/50 text-sm">Nenhum resultado encontrado</p>
                      <p className="text-white/30 text-xs mt-1">Tente outro termo de pesquisa</p>
                    </div>
                  )
                ) : (
                  <div className="flex flex-col items-center justify-center py-12">
                    <Search className="h-12 w-12 text-white/20 mb-3" />
                    <p className="text-white/50 text-sm">Digite para pesquisar</p>
                    <p className="text-white/30 text-xs mt-1">Busque por nome ou descrição</p>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Hero Banner - Modular Component */}
      <HeroBanner restaurant={restaurant} />

      {/* Loyalty Promotional Banner - Premium Design */}
      {!isAuthenticated && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="max-w-7xl mx-auto px-4 mt-4"
        >
          <div 
            className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-neutral-900 via-neutral-800 to-neutral-900 p-5 sm:p-6 shadow-2xl cursor-pointer group hover:shadow-3xl transition-all border border-neutral-700/50"
            onClick={() => setIsLoginDialogOpen(true)}
          >
            {/* Animated Gradient Background */}
            <motion.div 
              className="absolute inset-0 bg-gradient-to-br from-amber-500/20 via-orange-500/10 to-transparent"
              animate={{
                scale: [1, 1.1, 1],
                opacity: [0.3, 0.5, 0.3]
              }}
              transition={{
                duration: 8,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            />
            
            {/* Glowing Orbs */}
            <div className="absolute top-0 right-0 w-40 h-40 bg-amber-500/20 rounded-full blur-3xl" />
            <div className="absolute bottom-0 left-0 w-32 h-32 bg-orange-500/20 rounded-full blur-3xl" />
            
            <div className="relative">
              {/* Badge "Novo" */}
              <motion.div
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ delay: 0.5, type: "spring", stiffness: 200 }}
                className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-gradient-to-r from-amber-500 to-orange-500 rounded-full mb-4 shadow-lg"
              >
                <Star className="w-3 h-3 text-white fill-white" />
                <span className="text-xs font-bold text-white">Programa de Fidelidade</span>
              </motion.div>
              
              <div className="flex items-center gap-4">
                {/* Icon Section */}
                <motion.div
                  animate={{
                    y: [0, -8, 0],
                    rotate: [0, 5, -5, 0]
                  }}
                  transition={{
                    duration: 4,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                  className="hidden sm:block"
                >
                  <div className="relative">
                    {/* Glow effect */}
                    <div className="absolute inset-0 bg-gradient-to-br from-amber-400 to-orange-500 rounded-2xl blur-xl opacity-50" />
                    
                    {/* Icon container */}
                    <div className="relative w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center shadow-xl">
                      <Gift className="w-8 h-8 text-white" />
                    </div>
                    
                    {/* Sparkles */}
                    <motion.div
                      animate={{
                        scale: [0, 1, 0],
                        rotate: [0, 180, 360]
                      }}
                      transition={{
                        duration: 2,
                        repeat: Infinity,
                        repeatDelay: 2
                      }}
                      className="absolute -top-1 -right-1 w-4 h-4"
                    >
                      <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
                    </motion.div>
                  </div>
                </motion.div>

                {/* Content Section */}
                <div className="flex-1 min-w-0">
                  <motion.h3 
                    className="text-white font-bold text-lg sm:text-xl leading-tight mb-2"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.4 }}
                  >
                    <span className="inline-flex items-center gap-2">
                      <motion.span
                        animate={{ rotate: [0, -10, 10, -10, 0] }}
                        transition={{ duration: 0.5, delay: 0.6 }}
                      >
                        🎉
                      </motion.span>
                      Ganhe Pontos em Cada Pedido!
                    </span>
                  </motion.h3>
                  
                  <motion.p 
                    className="text-neutral-300 text-sm sm:text-base mb-3"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.5 }}
                  >
                    Acumule pontos e troque por <strong className="text-amber-400">descontos exclusivos</strong>
                  </motion.p>
                  
                  {/* Benefits List */}
                  <motion.div 
                    className="flex flex-wrap gap-2 sm:gap-3 mb-4"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6 }}
                  >
                    <div className="flex items-center gap-1.5 text-xs text-amber-400">
                      <div className="w-5 h-5 rounded-full bg-amber-500/20 flex items-center justify-center">
                        <Award className="w-3 h-3" />
                      </div>
                      <span className="font-medium">Descontos</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-xs text-orange-400">
                      <div className="w-5 h-5 rounded-full bg-orange-500/20 flex items-center justify-center">
                        <Gift className="w-3 h-3" />
                      </div>
                      <span className="font-medium">Brindes</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-xs text-amber-400">
                      <div className="w-5 h-5 rounded-full bg-amber-500/20 flex items-center justify-center">
                        <Star className="w-3 h-3 fill-current" />
                      </div>
                      <span className="font-medium">Vantagens VIP</span>
                    </div>
                  </motion.div>

                  {/* CTA Button */}
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.7 }}
                  >
                    <Button
                      size="sm"
                      className="h-10 px-6 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-bold rounded-xl shadow-lg shadow-amber-500/30 hover:shadow-xl hover:shadow-amber-500/40 transition-all hover:scale-[1.02] active:scale-95"
                      onClick={(e) => {
                        e.stopPropagation();
                        setIsLoginDialogOpen(true);
                      }}
                    >
                      <User className="w-4 h-4 mr-2" />
                      <span className="hidden sm:inline">Entrar e Ganhar Pontos</span>
                      <span className="sm:hidden">Entrar Agora</span>
                    </Button>
                  </motion.div>
                </div>
              </div>
            </div>

            {/* Animated Sparkles */}
            {[...Array(6)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute w-1 h-1 bg-amber-400 rounded-full"
                style={{
                  left: `${20 + i * 15}%`,
                  top: `${10 + (i % 3) * 30}%`,
                }}
                animate={{
                  scale: [0, 1, 0],
                  opacity: [0, 1, 0],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  delay: i * 0.3,
                  ease: "easeInOut"
                }}
              />
            ))}
          </div>
        </motion.div>
      )}

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-5">
        {/* ✅ FASE 5: BANNER INCENTIVANDO IDENTIFICAÇÃO */}
        {orderType === 'mesa' && !identifiedCustomer?.found && !customerPhone && items.length === 0 && (
          <motion.div
            initial={{ y: -10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.4 }}
            className="mb-4"
          >
            <div className="rounded-xl bg-gradient-to-r from-blue-500/20 to-purple-500/20 border border-blue-400/30 p-4 backdrop-blur-sm">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center flex-shrink-0">
                  <Gift className="h-5 w-5 text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="text-white font-semibold text-sm mb-1">
                    Ganhe pontos em cada pedido! 🎉
                  </h3>
                  <p className="text-white/80 text-xs mb-3">
                    Identifique-se com seu telefone para acumular pontos, usar cupons e ter ofertas exclusivas.
                  </p>
                  <button
                    onClick={() => {
                      // Adicionar produto dummy para abrir carrinho
                      if (menuItems && menuItems.length > 0) {
                        setIsCartOpen(true);
                      }
                    }}
                    className="h-8 px-4 rounded-lg bg-blue-500 hover:bg-blue-600 text-white text-xs font-medium transition-colors flex items-center gap-2"
                  >
                    <User className="h-3.5 w-3.5" />
                    Ver benefícios
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Search Button + Categories Section */}
        <motion.div
          initial={{ y: 10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.4 }}
          className="mb-6 space-y-4"
        >
          {/* Search Button - Opens Modal */}
          <button
            onClick={() => setIsSearchModalOpen(true)}
            className="w-full h-11 px-4 rounded-xl bg-white/5 backdrop-blur-sm border border-white/10 hover:bg-white/10 hover:border-white/20 transition-all flex items-center gap-3 group"
            data-testid="button-open-search"
          >
            <Search className="h-4 w-4 text-white/50 group-hover:text-white/70 transition-colors" />
            <span className="text-[15px] text-white/50 group-hover:text-white/70 transition-colors">Pesquisar no cardápio...</span>
          </button>

          {/* Categories inline with search */}
          {categories.length > 0 && (
            <div>
              <div className="flex items-center justify-between mb-2.5">
                <h2 className="text-sm font-semibold text-white/90">Categorias</h2>
                <span className="text-[11px] text-white/50">{categories.length}</span>
              </div>
              <CategoryFilter
                categories={categories}
                selectedCategory={selectedCategory}
                onSelectCategory={setSelectedCategory}
                menuItems={menuItems || []}
                categoryImages={categoryImages}
              />
            </div>
          )}
        </motion.div>
        {/* WhatsApp Floating Button - Minimalista */}
        {(restaurant.whatsappNumber || restaurant.phone) && (
          <motion.a
            href={`https://wa.me/${(restaurant.whatsappNumber || restaurant.phone || '').replace(/\D/g, '')}`}
            target="_blank"
            rel="noopener noreferrer"
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.3, delay: 0.5 }}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            className="fixed bottom-24 right-4 z-40 w-14 h-14 bg-emerald-500 hover:bg-emerald-600 rounded-full flex items-center justify-center shadow-lg hover:shadow-xl transition-all group"
            data-testid="button-whatsapp-contact"
          >
            <SiWhatsapp className="h-6 w-6 text-white" />
            <span className="sr-only">Falar com Atendimento</span>
            
            {/* Tooltip on hover */}
            <span className="absolute right-full mr-3 px-3 py-1.5 bg-neutral-900 text-white text-xs font-medium rounded-lg whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
              Falar com Atendimento
            </span>
          </motion.a>
        )}


        {/* Premium Offers Section */}
        {specialOfferItems.length > 0 && (
          <motion.section
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="mb-12"
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl sm:text-3xl font-bold text-white">Ofertas Especiais</h2>
              <button className="text-sm text-amber-500 hover:text-amber-400 font-medium transition-colors" data-testid="button-see-all-promos">
                Ver tudo →
              </button>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
              {specialOfferItems.map((item, idx) => {
                const itemPrice = typeof item.price === 'string' ? parseFloat(item.price) : item.price;
                const itemOriginalPrice = item.originalPrice 
                  ? (typeof item.originalPrice === 'string' ? parseFloat(item.originalPrice) : item.originalPrice) 
                  : itemPrice;
                const discountPercent = Math.round(((itemOriginalPrice - itemPrice) / itemOriginalPrice) * 100);
                const categoryName = (item as any).category?.name || 'Oferta';

                return (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: idx * 0.1 }}
                    whileHover={{ y: -8 }}
                    onClick={() => handleAddMenuItem(item)}
                    className="group relative bg-white/5 backdrop-blur-sm border border-white/10 rounded-lg overflow-hidden cursor-pointer transition-all hover:border-amber-500/50"
                    data-testid={`promo-card-${item.id}`}
                  >
                    {/* Image */}
                    <div className="relative h-20 overflow-hidden">
                      {item.imageUrl ? (
                        <img
                          src={item.imageUrl}
                          alt={item.name}
                          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-neutral-800 to-neutral-900">
                          <Utensils className="h-5 w-5 text-white/20" />
                        </div>
                      )}
                      
                      {/* Discount Badge */}
                      {discountPercent > 0 && (
                        <div className="absolute top-1 left-1 bg-gradient-to-r from-red-500 to-red-600 text-white px-1.5 py-0.5 rounded-full text-[9px] font-bold">
                          -{discountPercent}%
                        </div>
                      )}
                      
                      {/* Category Badge */}
                      <div className="absolute top-1 right-1 bg-black/50 backdrop-blur-sm text-white text-[8px] px-1.5 py-0.5 rounded-full border border-white/20">
                        {categoryName}
                      </div>
                    </div>

                    {/* Content */}
                    <div className="p-2">
                      <h3 className="text-white font-medium text-xs mb-1.5 line-clamp-1 group-hover:text-amber-500 transition-colors leading-tight">
                        {item.name}
                      </h3>
                      <div className="flex items-center justify-between gap-1">
                        <div className="flex items-baseline gap-1">
                          <span className="text-xs font-bold text-white">{formatKwanza(itemPrice)}</span>
                          {itemOriginalPrice > itemPrice && (
                            <span className="text-[9px] text-white/40 line-through">{formatKwanza(itemOriginalPrice)}</span>
                          )}
                        </div>
                        <div className="flex items-center gap-1">
                          {/* Favorite Button */}
                          <button 
                            className={`w-6 h-6 rounded-full flex items-center justify-center transition-all active:animate-bounce ${
                              isFavorite(item.id) ? 'bg-red-500 text-white' : 'bg-white/10 text-white/60 hover:bg-white/20 hover:text-white'
                            }`}
                            onClick={(e) => {
                              e.stopPropagation();
                              const wasFavorite = isFavorite(item.id);
                              toggleFavorite(item.id);
                              
                              if (wasFavorite) {
                                toast(toastRemovedFromFavorites(item.name));
                              } else {
                                toast(toastAddedToFavorites({ name: item.name, imageUrl: item.imageUrl }));
                              }
                            }}
                            data-testid={`button-favorite-offer-${item.id}`}
                          >
                            <Heart className={`h-3 w-3 ${isFavorite(item.id) ? 'fill-white' : ''}`} />
                          </button>
                          {/* Add Button */}
                          <div className="w-6 h-6 rounded-full bg-amber-500 flex items-center justify-center group-hover:bg-amber-600 transition-all active:scale-90">
                            <Plus className="h-3 w-3 text-white" />
                          </div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </motion.section>
        )}

        {/* Menu Products Grid */}
        <section id="menu-section">
          {selectedCategory === 'all' ? (
            itemsByCategory.map((group, groupIndex) => (
              <motion.div
                key={group.category.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: groupIndex * 0.1 }}
                className="mb-12"
                id={`category-${group.category.id}`}
              >
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl sm:text-3xl font-bold text-white">{group.category.name}</h2>
                  <button className="text-sm text-amber-500 hover:text-amber-400 font-medium transition-colors">
                    Ver tudo →
                  </button>
                </div>

                <ProductGrid
                  items={group.items}
                  onAddToCart={handleQuickAddToCart}
                  onItemClick={handleAddMenuItem}
                  isFavorite={isFavorite}
                  toggleFavorite={toggleFavorite}
                  onFavoriteToggle={(item, wasFavorite) => {
                    if (wasFavorite) {
                      toast(toastRemovedFromFavorites(item.name));
                    } else {
                      toast(toastAddedToFavorites(item.name));
                    }
                  }}
                />
              </motion.div>
            ))
          ) : (
            <ProductGrid
              items={filteredItems}
              onAddToCart={handleQuickAddToCart}
              onItemClick={handleAddMenuItem}
              isFavorite={isFavorite}
              toggleFavorite={toggleFavorite}
              onFavoriteToggle={(item, wasFavorite) => {
                if (wasFavorite) {
                  toast(toastRemovedFromFavorites(item.name));
                } else {
                  toast(toastAddedToFavorites(item.name));
                }
              }}
            />
          )}

          {filteredItems.length === 0 && (
            <div className="flex flex-col items-center justify-center py-16 text-gray-400">
              <Search className="h-16 w-16 mb-4 opacity-20" />
              <p className="text-lg font-medium text-gray-600">Nenhum produto encontrado</p>
              <p className="text-sm mt-1">Tente ajustar sua busca ou filtro</p>
            </div>
          )}
        </section>

      </main>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-neutral-900/95 backdrop-blur-xl border-t border-neutral-800 z-50 safe-area-inset-bottom">
        <div className="flex items-center justify-around py-2.5 px-2 max-w-md mx-auto">
          <button 
            className={`flex flex-col items-center gap-1 min-w-[48px] transition-colors ${activeNav === 'home' ? 'text-amber-500' : 'text-neutral-400 hover:text-neutral-200'}`}
            onClick={() => {
              setActiveNav('home');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            data-testid="nav-home"
          >
            <Home className="h-5 w-5" />
            <span className="text-[9px] font-medium">Início</span>
          </button>
          <button 
            className={`flex flex-col items-center gap-1 min-w-[48px] relative transition-colors ${activeNav === 'favorites' ? 'text-amber-500' : 'text-neutral-400 hover:text-neutral-200'}`}
            onClick={() => {
              setActiveNav('favorites');
              setIsFavoritesDialogOpen(true);
            }}
            data-testid="nav-favorites"
          >
            <Heart className="h-5 w-5" />
            {favorites.length > 0 && (
              <span className="absolute -top-0.5 -right-0.5 bg-amber-500 text-white text-[9px] font-bold rounded-full h-3.5 w-3.5 flex items-center justify-center">
                {favorites.length}
              </span>
            )}
            <span className="text-[9px] font-medium">Favoritos</span>
          </button>
          <button 
            className={`flex flex-col items-center gap-1 min-w-[48px] transition-colors ${activeNav === 'track' ? 'text-amber-500' : 'text-neutral-400 hover:text-neutral-200'}`}
            onClick={() => {
              setActiveNav('track');
              setIsTrackOrderDialogOpen(true);
            }}
            data-testid="nav-track-order"
          >
            <div className="relative">
              <ClipboardList className="h-5 w-5" />
              {orderHistory.length > 0 && orderHistory.some(o => {
                const orderDate = new Date(o.createdAt);
                return Date.now() - orderDate.getTime() < 2 * 60 * 60 * 1000;
              }) && (
                <span className="absolute -top-1 -right-1 w-2 h-2 bg-green-500 rounded-full animate-pulse" />
              )}
            </div>
            <span className="text-[9px] font-medium">Rastrear</span>
          </button>
          <button 
            className={`flex flex-col items-center gap-1 min-w-[48px] relative transition-colors ${activeNav === 'history' ? 'text-amber-500' : 'text-neutral-400 hover:text-neutral-200'}`}
            onClick={() => {
              setActiveNav('history');
              setIsHistoryDialogOpen(true);
            }}
            data-testid="nav-history"
          >
            <Clock className="h-5 w-5" />
            {orderHistory.length > 0 && (
              <span className="absolute -top-0.5 -right-0.5 bg-amber-500 text-white text-[9px] font-bold rounded-full h-3.5 w-3.5 flex items-center justify-center">
                {orderHistory.length}
              </span>
            )}
            <span className="text-[9px] font-medium">Histórico</span>
          </button>
          <button 
            className={`flex flex-col items-center gap-1 min-w-[48px] relative transition-colors ${activeNav === 'profile' ? 'text-amber-500' : 'text-neutral-400 hover:text-neutral-200'}`}
            onClick={() => {
              setActiveNav('profile');
              setIsProfileDialogOpen(true);
            }}
            data-testid="nav-profile"
          >
            {isAuthenticated ? (
              <>
                <Gift className="h-5 w-5" />
                {authCustomer && authCustomer.loyaltyPoints > 0 && (
                  <span 
                    className="absolute -top-0.5 -right-0.5 bg-amber-500 text-white text-[9px] font-bold rounded-full h-3.5 min-w-3.5 px-1 flex items-center justify-center"
                  >
                    {authCustomer.loyaltyPoints > 999 ? '999+' : authCustomer.loyaltyPoints}
                  </span>
                )}
              </>
            ) : (
              <User className="h-5 w-5" />
            )}
            <span className="text-[9px] font-medium">Perfil</span>
          </button>
        </div>
      </nav>

      {/* Options Dialog */}
      {selectedMenuItem && (
        <CustomerMenuItemOptionsDialog
          menuItem={selectedMenuItem}
          open={isOptionsDialogOpen}
          onOpenChange={setIsOptionsDialogOpen}
          onAddToCart={handleAddToCart}
        />
      )}

      {/* Share Order Dialog */}
      {createdOrder && (
        <ShareOrderDialog
          order={createdOrder}
          restaurantName={restaurant.name}
          restaurantSlug={restaurant.slug || ''}
          open={isShareDialogOpen}
          onOpenChange={setIsShareDialogOpen}
        />
      )}

      {/* Customer Registration Dialog */}
      <Dialog open={isRegisterDialogOpen} onOpenChange={setIsRegisterDialogOpen}>
        <DialogContent className="sm:max-w-md bg-white rounded-2xl overflow-hidden [&>button]:hidden" data-testid="dialog-register-customer">
          {/* Hero Section with Close Button */}
          <div className="relative bg-gradient-to-br from-neutral-950 via-neutral-900 to-neutral-950 pt-6 pb-10 px-6 -mx-6 -mt-6">
            <button
              type="button"
              onClick={() => setIsRegisterDialogOpen(false)}
              className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/20 flex items-center justify-center text-white hover:bg-white/30 transition-colors z-10"
              data-testid="button-close-profile-dialog"
            >
              <X className="h-4 w-4" />
            </button>
            <div className="absolute inset-0 opacity-10">
              <div className="absolute inset-0" style={{
                backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
              }} />
            </div>
            <div className="relative flex flex-col items-center text-center">
              <div className="w-16 h-16 rounded-full bg-white/10 backdrop-blur-sm border-2 border-white/20 flex items-center justify-center mb-3">
                <User className="h-8 w-8 text-white" />
              </div>
              <h2 className="text-lg font-bold text-white mb-0.5">
                Crie sua Conta
              </h2>
              <p className="text-xs text-gray-300">
                Junte-se ao nosso programa de recompensas
              </p>
            </div>
          </div>

          {/* Benefits Section */}
          <div className="-mt-4 mb-4">
            <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-xl border border-amber-100 p-3">
              <div className="flex items-center justify-around gap-1">
                <div className="flex flex-col items-center text-center p-1.5">
                  <div className="w-10 h-10 rounded-full bg-amber-500 flex items-center justify-center mb-1.5 shadow-sm">
                    <Gift className="h-5 w-5 text-white" />
                  </div>
                  <span className="text-[10px] font-medium text-gray-700 leading-tight">Pontos em<br/>cada pedido</span>
                </div>
                <div className="w-px h-10 bg-amber-200" />
                <div className="flex flex-col items-center text-center p-1.5">
                  <div className="w-10 h-10 rounded-full bg-amber-500 flex items-center justify-center mb-1.5 shadow-sm">
                    <Tag className="h-5 w-5 text-white" />
                  </div>
                  <span className="text-[10px] font-medium text-gray-700 leading-tight">Descontos<br/>exclusivos</span>
                </div>
                <div className="w-px h-10 bg-amber-200" />
                <div className="flex flex-col items-center text-center p-1.5">
                  <div className="w-10 h-10 rounded-full bg-amber-500 flex items-center justify-center mb-1.5 shadow-sm">
                    <Award className="h-5 w-5 text-white" />
                  </div>
                  <span className="text-[10px] font-medium text-gray-700 leading-tight">Bônus de<br/>aniversário</span>
                </div>
              </div>
            </div>
          </div>

          {/* Form Section */}
          <form onSubmit={(e) => {
            e.preventDefault();
            registerCustomerMutation.mutate(registerFormData);
          }}>
            <div className="space-y-3 max-h-[40vh] overflow-y-auto pr-1">
              <div className="space-y-1.5">
                <Label htmlFor="register-name" className="text-sm font-medium text-gray-700 flex items-center gap-1">
                  Nome Completo <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="register-name"
                  placeholder="Digite seu nome completo"
                  value={registerFormData.name}
                  onChange={(e) => setRegisterFormData({ ...registerFormData, name: e.target.value })}
                  required
                  className="h-11 rounded-xl border-gray-200 bg-gray-50 focus:bg-white"
                  data-testid="input-register-name"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="register-phone" className="text-sm font-medium text-gray-700">
                  Telefone <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="register-phone"
                  type="tel"
                  placeholder="+244 900 000 000"
                  value={registerFormData.phone}
                  onChange={(e) => setRegisterFormData({ ...registerFormData, phone: e.target.value })}
                  required
                  className="h-11 rounded-xl border-gray-200 bg-gray-50 focus:bg-white focus:border-amber-500"
                  data-testid="input-register-phone"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="register-email" className="text-sm font-medium text-gray-700">
                  Email
                </Label>
                <Input
                  id="register-email"
                  type="email"
                  placeholder="seuemail@exemplo.com"
                  value={registerFormData.email}
                  onChange={(e) => setRegisterFormData({ ...registerFormData, email: e.target.value })}
                  className="h-11 rounded-xl border-gray-200 bg-gray-50 focus:bg-white"
                  data-testid="input-register-email"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="register-address" className="text-sm font-medium text-gray-700">
                  Endereço
                </Label>
                <Textarea
                  id="register-address"
                  placeholder="Seu endereço completo"
                  value={registerFormData.address}
                  onChange={(e) => setRegisterFormData({ ...registerFormData, address: e.target.value })}
                  rows={2}
                  className="resize-none rounded-xl border-gray-200 bg-gray-50 focus:bg-white"
                  data-testid="input-register-address"
                />
              </div>
            </div>
            
            <div className="flex gap-3 mt-5 pt-4 border-t border-gray-100">
              <Button
                type="button"
                variant="outline"
                className="flex-1 h-11 rounded-xl border-gray-200 text-gray-600 font-medium hover:bg-gray-50"
                onClick={() => setIsRegisterDialogOpen(false)}
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                className="flex-1 h-11 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-semibold shadow-md shadow-amber-500/30"
                disabled={registerCustomerMutation.isPending || !registerFormData.name || !registerFormData.phone}
                data-testid="button-submit-register"
              >
                {registerCustomerMutation.isPending ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Cadastrando...
                  </div>
                ) : (
                  <>
                    <UserPlus className="mr-2 h-4 w-4" />
                    Criar Conta
                  </>
                )}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Favorites Dialog - Premium Glass Version */}
      <GlassDialog open={isFavoritesDialogOpen} onOpenChange={setIsFavoritesDialogOpen}>
        <GlassDialogContent className="sm:max-w-lg max-h-[85vh]" data-testid="dialog-favorites">
          <GlassDialogHeader>
            <GlassDialogTitle className="flex items-center gap-2">
              <Heart className="h-5 w-5 text-amber-500" />
              Meus Favoritos
            </GlassDialogTitle>
            <GlassDialogDescription>
              {favoriteItems.length > 0 
                ? `Você tem ${favoriteItems.length} item(s) favorito(s)`
                : 'Salve seus pratos favoritos para acessar rapidamente'}
            </GlassDialogDescription>
          </GlassDialogHeader>
          
          <ScrollArea className="max-h-[55vh] pr-2">
            {favoriteItems.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-neutral-500">
                <Heart className="h-16 w-16 mb-4 opacity-20" />
                <p className="font-medium text-neutral-400">Nenhum favorito ainda</p>
                <p className="text-sm mt-1 text-center text-neutral-500">Toque no coração nos produtos para salvar</p>
              </div>
            ) : (
              <div className="space-y-3">
                {favoriteItems.map((item) => {
                  const itemPrice = typeof item.price === 'string' ? item.price : Number(item.price).toFixed(2);
                  return (
                    <div 
                      key={item.id}
                      className="flex items-center gap-3 p-3 rounded-2xl bg-neutral-800/50 border border-neutral-700 cursor-pointer hover:bg-neutral-800 transition-colors"
                      onClick={() => {
                        setIsFavoritesDialogOpen(false);
                        handleAddMenuItem(item);
                      }}
                      data-testid={`favorite-item-${item.id}`}
                    >
                      {item.imageUrl ? (
                        <img
                          src={item.imageUrl}
                          alt={item.name}
                          className="w-16 h-16 rounded-xl object-cover flex-shrink-0"
                        />
                      ) : (
                        <div className="w-16 h-16 rounded-xl bg-neutral-700 flex items-center justify-center flex-shrink-0">
                          <Utensils className="h-6 w-6 text-neutral-500" />
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <h4 className="font-semibold text-sm text-white line-clamp-1">{item.name}</h4>
                        {item.description && (
                          <p className="text-xs text-neutral-400 line-clamp-1 mt-0.5">{item.description}</p>
                        )}
                        <p className="font-bold text-sm text-amber-500 mt-1">{formatKwanza(itemPrice)}</p>
                      </div>
                      <button
                        className="w-8 h-8 rounded-full bg-amber-500 hover:bg-amber-600 flex items-center justify-center flex-shrink-0 transition-colors"
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleFavorite(item.id);
                        }}
                        data-testid={`button-remove-favorite-${item.id}`}
                      >
                        <Heart className="h-4 w-4 text-white fill-white" />
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </ScrollArea>
        </GlassDialogContent>
      </GlassDialog>

      {/* Order History Dialog */}
      <Dialog open={isHistoryDialogOpen} onOpenChange={setIsHistoryDialogOpen}>
        <DialogContent className="sm:max-w-lg max-h-[85vh] bg-neutral-900 border-neutral-800 rounded-3xl" data-testid="dialog-history">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-white flex items-center gap-2">
              <Package className="h-5 w-5 text-amber-500" />
              Histórico de Pedidos
            </DialogTitle>
            <DialogDescription className="text-sm text-neutral-400">
              {orderHistory.length > 0 
                ? `Seus últimos ${orderHistory.length} pedido(s)`
                : 'Seu histórico de pedidos aparecerá aqui'}
            </DialogDescription>
          </DialogHeader>
          
          <ScrollArea className="max-h-[55vh] pr-2">
            {orderHistory.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-neutral-500">
                <Package className="h-16 w-16 mb-4 opacity-20" />
                <p className="font-medium text-neutral-400">Nenhum pedido ainda</p>
                <p className="text-sm mt-1 text-center text-neutral-500">Faça seu primeiro pedido!</p>
              </div>
            ) : (
              <div className="space-y-3">
                {orderHistory.map((order) => {
                  const orderDate = new Date(order.createdAt);
                  const isRecent = Date.now() - orderDate.getTime() < 24 * 60 * 60 * 1000;
                  
                  return (
                    <div 
                      key={order.id}
                      className="p-4 rounded-2xl bg-neutral-800/50 border border-neutral-700 hover:bg-neutral-800 transition-colors"
                      data-testid={`history-order-${order.id}`}
                    >
                      <div className="flex items-start justify-between gap-2 mb-3">
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="font-semibold text-sm text-white">
                              Pedido #{order.orderNumber || order.id.slice(-6).toUpperCase()}
                            </h4>
                            {isRecent && (
                              <Badge className="bg-amber-500/20 text-amber-400 border-amber-500/30 text-[10px]">
                                Recente
                              </Badge>
                            )}
                          </div>
                          <p className="text-xs text-neutral-400 mt-0.5">
                            {orderDate.toLocaleDateString('pt-BR', { 
                              day: '2-digit', 
                              month: 'short',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </p>
                        </div>
                        <Badge variant="outline" className="text-xs border-neutral-600 text-neutral-300 bg-neutral-800/50">
                          {order.orderType === 'delivery' ? 'Delivery' : 'Retirada'}
                        </Badge>
                      </div>
                      
                      <div className="space-y-1.5 mb-3">
                        {order.items.slice(0, 3).map((item, idx) => (
                          <div key={idx} className="flex justify-between text-xs text-neutral-300">
                            <span>{item.quantity}x {item.name}</span>
                            <span className="font-medium text-white">{formatKwanza(parseFloat(item.price) * item.quantity)}</span>
                          </div>
                        ))}
                        {order.items.length > 3 && (
                          <p className="text-xs text-neutral-500">+{order.items.length - 3} item(s)</p>
                        )}
                      </div>
                      
                      <Separator className="my-2 bg-neutral-700" />
                      
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-semibold text-white">Total</span>
                        <span className="text-sm font-bold text-amber-500">{formatKwanza(order.totalAmount)}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </ScrollArea>
        </DialogContent>
      </Dialog>

      {/* Profile Dialog */}
      {restaurant && (
        <ProfileDialog
          open={isProfileDialogOpen}
          onOpenChange={setIsProfileDialogOpen}
          isAuthenticated={isAuthenticated}
          customer={authCustomer}
          onLogout={async () => {
            await logout();
            toast({
              title: 'Logout realizado',
              description: 'Você saiu da sua conta com sucesso.',
            });
          }}
          onOpenLogin={() => setIsLoginDialogOpen(true)}
          onOpenRegister={() => setIsRegisterDialogOpen(true)}
          onOpenHistory={() => setIsHistoryDialogOpen(true)}
          orderCount={orderHistory.length}
        />
      )}

      {/* Track Order Dialog with Real-time Status */}
      <Dialog open={isTrackOrderDialogOpen} onOpenChange={setIsTrackOrderDialogOpen}>
        <DialogContent className="sm:max-w-lg bg-neutral-900 border-neutral-800 rounded-3xl">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-white flex items-center gap-2">
              <ClipboardList className="h-5 w-5 text-amber-500" />
              Rastrear Pedido
            </DialogTitle>
            <DialogDescription className="text-sm text-neutral-400">
              Status atualizado em tempo real
            </DialogDescription>
          </DialogHeader>
          
          <ScrollArea className="max-h-[500px] pr-2">
            {orderHistory.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12">
                <Package className="h-16 w-16 mb-4 text-neutral-600 opacity-20" />
                <p className="font-medium text-neutral-400">Nenhum pedido ainda</p>
                <p className="text-sm mt-1 text-neutral-500">Seus pedidos aparecerão aqui</p>
              </div>
            ) : (
              <div className="space-y-3">
                {orderHistory.map((order) => {
                  const orderDate = new Date(order.createdAt);
                  const isRecent = Date.now() - orderDate.getTime() < 2 * 60 * 60 * 1000;
                  
                  return (
                    <TrackOrderCard 
                      key={order.id} 
                      order={order} 
                      isRecent={isRecent} 
                    />
                  );
                })}
              </div>
            )}
          </ScrollArea>
        </DialogContent>
      </Dialog>

      {/* Customer Login Dialog */}
      {restaurant && (
        <CustomerLoginDialog
          open={isLoginDialogOpen}
          onOpenChange={setIsLoginDialogOpen}
          restaurantId={restaurant.id}
          primaryColor="#16a34a"
        />
      )}

      {/* Premium Footer */}
      <footer className="relative mt-16 mb-20 border-t border-white/10" data-testid="footer-na-bancada">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center">
            <p className="text-white/60 text-sm mb-4" data-testid="text-footer-cta">
              Transforme seu negócio com cardápios digitais profissionais
            </p>
            <Link href="/" data-testid="link-na-bancada">
              <span className="inline-flex items-center gap-2 text-white text-2xl font-bold hover:text-amber-500 transition-colors cursor-pointer group" data-testid="text-na-bancada">
                <span className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-amber-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Utensils className="h-5 w-5 text-white" />
                </span>
                Na Bancada
              </span>
            </Link>
            <p className="text-white/40 text-xs mt-4">
              © {new Date().getFullYear()} Na Bancada. Todos os direitos reservados.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
