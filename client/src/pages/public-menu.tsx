import { useState, useEffect, useCallback } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useRoute } from 'wouter';
import { useCart } from '@/contexts/CartContext';
import { Card, CardContent } from '@/components/ui/card';
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
import { 
  ShoppingCart, Plus, Minus, Trash2, Bike, ShoppingBag, Search, 
  MapPin, Phone, Utensils, ArrowRight, UserPlus, Gift, Award, Star,
  Bell, Heart, Map, Clock, User, Home, ChevronRight, ChevronLeft, ChevronDown, Package, X,
  CheckCircle, Tag, Receipt
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

const useFavorites = (restaurantSlug: string) => {
  const storageKey = `favorites_${restaurantSlug}`;
  
  const loadFavorites = useCallback(() => {
    if (typeof window === 'undefined') return [];
    try {
      const stored = localStorage.getItem(storageKey);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  }, [storageKey]);
  
  const [favorites, setFavorites] = useState<string[]>(loadFavorites);

  useEffect(() => {
    setFavorites(loadFavorites());
  }, [storageKey, loadFavorites]);

  const toggleFavorite = useCallback((itemId: string) => {
    setFavorites(prev => {
      const newFavorites = prev.includes(itemId)
        ? prev.filter(id => id !== itemId)
        : [...prev, itemId];
      localStorage.setItem(storageKey, JSON.stringify(newFavorites));
      return newFavorites;
    });
  }, [storageKey]);

  const isFavorite = useCallback((itemId: string) => {
    return favorites.includes(itemId);
  }, [favorites]);

  return { favorites, toggleFavorite, isFavorite };
};

const useOrderHistory = (restaurantSlug: string) => {
  const storageKey = `orderHistory_${restaurantSlug}`;
  
  const loadOrders = useCallback(() => {
    if (typeof window === 'undefined') return [];
    try {
      const stored = localStorage.getItem(storageKey);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  }, [storageKey]);
  
  const [orders, setOrders] = useState<StoredOrder[]>(loadOrders);

  useEffect(() => {
    setOrders(loadOrders());
  }, [storageKey, loadOrders]);

  const addOrder = useCallback((order: StoredOrder) => {
    setOrders(prev => {
      const newOrders = [order, ...prev].slice(0, 20);
      localStorage.setItem(storageKey, JSON.stringify(newOrders));
      return newOrders;
    });
  }, [storageKey]);

  const clearHistory = useCallback(() => {
    setOrders([]);
    localStorage.removeItem(storageKey);
  }, [storageKey]);

  return { orders, addOrder, clearHistory };
};

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
  const [orderType, setOrderType] = useState<'delivery' | 'takeout'>('delivery');
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [selectedMenuItem, setSelectedMenuItem] = useState<MenuItem | null>(null);
  const [isOptionsDialogOpen, setIsOptionsDialogOpen] = useState(false);
  const [createdOrder, setCreatedOrder] = useState<Order | null>(null);
  const [isShareDialogOpen, setIsShareDialogOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isRegisterDialogOpen, setIsRegisterDialogOpen] = useState(false);
  const [isFavoritesDialogOpen, setIsFavoritesDialogOpen] = useState(false);
  const [isHistoryDialogOpen, setIsHistoryDialogOpen] = useState(false);
  const [activeNav, setActiveNav] = useState('home');
  const [registerFormData, setRegisterFormData] = useState({
    name: '',
    phone: '',
    email: '',
    cpf: '',
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
  
  // Checkout wizard states
  const [checkoutStep, setCheckoutStep] = useState(1);
  const [isCouponExpanded, setIsCouponExpanded] = useState(false);
  const [isPointsExpanded, setIsPointsExpanded] = useState(false);
  
  const { toast } = useToast();
  
  const { favorites, toggleFavorite, isFavorite } = useFavorites(slug || '');
  const { orders: orderHistory, addOrder } = useOrderHistory(slug || '');

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
        cpf: '',
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
      orderType: 'delivery' | 'takeout';
      customerName: string;
      customerPhone: string;
      deliveryAddress?: string;
      couponCode?: string;
      redeemPoints?: number;
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
        customerName: orderData.customerName,
        customerPhone: orderData.customerPhone,
        deliveryAddress: orderData.deliveryAddress,
        couponCode: orderData.couponCode,
        redeemPoints: orderData.redeemPoints,
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
    setSelectedMenuItem(item);
    setIsOptionsDialogOpen(true);
  };

  const handleQuickAddToCart = (menuItem: MenuItem, e: React.MouseEvent) => {
    e.stopPropagation();
    addItem(menuItem, []);
    toast({
      title: 'Adicionado',
      description: `${menuItem.name} adicionado ao carrinho.`,
    });
  };

  const handleAddToCart = (menuItem: MenuItem, selectedOptions: SelectedOption[]) => {
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

    createOrderMutation.mutate({
      restaurantId: restaurant.id,
      orderType,
      customerName: customerName.trim(),
      customerPhone: customerPhone.trim(),
      deliveryAddress: orderType === 'delivery' ? deliveryAddress.trim() : undefined,
      couponCode: couponValidation?.valid ? couponCode.trim() : undefined,
      redeemPoints: usePoints && pointsToRedeem > 0 ? pointsToRedeem : undefined,
      items: orderItems,
    });
  };

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
      <div className="min-h-screen bg-white">
        <div className="p-4 space-y-4">
          <Skeleton className="h-12 w-full rounded-2xl" />
          <Skeleton className="h-12 w-full rounded-2xl" />
          <div className="flex gap-3 overflow-x-auto pb-2">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <Skeleton key={i} className="h-20 w-16 rounded-2xl flex-shrink-0" />
            ))}
          </div>
          <div className="flex gap-4 overflow-x-auto pb-2">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-40 w-72 rounded-3xl flex-shrink-0" />
            ))}
          </div>
          <div className="grid grid-cols-2 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <Skeleton key={i} className="h-56 w-full rounded-2xl" />
            ))}
          </div>
        </div>
      </div>
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
    <div className="min-h-screen bg-[#F5F5F5] pb-24">
      {/* Decorative Pattern Header */}
      <div 
        className="fixed top-0 left-0 right-0 h-8 z-50"
        style={{
          background: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23D9D9D9' fill-opacity='0.3'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          backgroundColor: '#FAFAFA'
        }}
      />

      {/* Main Header */}
      <header className="fixed top-8 left-0 right-0 bg-white z-40 shadow-sm">
        <div className="px-4 py-3">
          {/* Location Row */}
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center">
                <MapPin className="h-4 w-4 text-gray-600" />
              </div>
              <div>
                <p className="text-[10px] text-gray-400 uppercase tracking-wide">Delivery para</p>
                <p className="text-sm font-semibold text-gray-900 flex items-center gap-1">
                  {restaurant.address || 'Seu endereço'}
                  <ChevronRight className="h-3 w-3 text-gray-400" />
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button 
                className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center hover:bg-gray-100 transition-colors"
                data-testid="button-notifications"
              >
                <Bell className="h-5 w-5 text-gray-600" />
              </button>
              <Sheet open={isCartOpen} onOpenChange={setIsCartOpen}>
                <SheetTrigger asChild>
                  <button 
                    className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center hover:bg-gray-100 transition-colors relative"
                    data-testid="button-open-cart"
                  >
                    <ShoppingCart className="h-5 w-5 text-gray-600" />
                    <AnimatePresence>
                      {getItemCount() > 0 && (
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          exit={{ scale: 0 }}
                          className="absolute -top-1 -right-1 bg-gray-900 text-white text-[10px] font-bold rounded-full h-5 w-5 flex items-center justify-center"
                        >
                          {getItemCount()}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </button>
                </SheetTrigger>
                <SheetContent side="rightCompact" className="flex flex-col p-0 bg-white max-h-[85vh]">
                  {/* Header com indicador de etapas */}
                  <div className="p-3 bg-white border-b border-gray-100 flex-shrink-0">
                    <SheetHeader>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-full bg-gray-900 flex items-center justify-center">
                            <ShoppingBag className="h-3.5 w-3.5 text-white" />
                          </div>
                          <div>
                            <SheetTitle className="text-base font-bold text-gray-900" data-testid="text-cart-title">
                              {checkoutStep === 1 ? 'Seu Pedido' : 'Finalizar'}
                            </SheetTitle>
                            <p className="text-[11px] text-gray-500">
                              {checkoutStep === 1 ? 'Etapa 1 de 2' : 'Etapa 2 de 2'}
                            </p>
                          </div>
                        </div>
                        {/* Indicador de etapas */}
                        <div className="flex gap-1">
                          <div className={`w-2 h-2 rounded-full ${checkoutStep === 1 ? 'bg-gray-900' : 'bg-gray-300'}`} />
                          <div className={`w-2 h-2 rounded-full ${checkoutStep === 2 ? 'bg-gray-900' : 'bg-gray-300'}`} />
                        </div>
                      </div>
                    </SheetHeader>
                  </div>

                  {/* ETAPA 1: Carrinho + Dados básicos */}
                  {checkoutStep === 1 && (
                    <>
                      <div className="flex-1 overflow-y-auto px-3 py-2">
                        {items.length === 0 ? (
                          <div className="flex flex-col items-center justify-center py-8 text-gray-400">
                            <ShoppingCart className="h-12 w-12 mb-3 opacity-20" />
                            <p className="font-medium text-base text-gray-600" data-testid="text-empty-cart">Carrinho vazio</p>
                            <p className="text-xs mt-1">Adicione itens do cardápio</p>
                          </div>
                        ) : (
                          <div className="space-y-2">
                            {/* Total */}
                            <div className="rounded-lg p-2.5 bg-gradient-to-r from-gray-900 to-gray-800 text-white">
                              <div className="flex items-center justify-between">
                                <div>
                                  <span className="text-[10px] text-gray-300">Total</span>
                                  <p className="text-lg font-bold">{formatKwanza(getTotal())}</p>
                                </div>
                                <Receipt className="h-4 w-4 text-white/60" />
                              </div>
                            </div>

                            {/* Itens do carrinho */}
                            <div className="space-y-2">
                              {items.map((item) => (
                                <div
                                  key={item.id}
                                  className="flex gap-2 items-start p-2 rounded-lg bg-gray-50 border border-gray-100"
                                  data-testid={`cart-item-${item.id}`}
                                >
                                  {item.menuItem.imageUrl && (
                                    <img
                                      src={item.menuItem.imageUrl}
                                      alt={item.menuItem.name}
                                      className="w-12 h-12 rounded-lg object-cover flex-shrink-0"
                                    />
                                  )}
                                  <div className="flex-1 min-w-0">
                                    <h4 className="font-semibold text-sm text-gray-900 leading-tight truncate">{item.menuItem.name}</h4>
                                    {item.selectedOptions.length > 0 && (
                                      <p className="text-[10px] text-gray-500 truncate">
                                        {item.selectedOptions.map(opt => opt.optionName).join(', ')}
                                      </p>
                                    )}
                                    <div className="flex items-center justify-between gap-1 mt-1">
                                      <span className="font-bold text-sm text-gray-900">
                                        {formatKwanza(
                                          (parseFloat(item.menuItem.price) + 
                                            item.selectedOptions.reduce((sum, opt) => sum + parseFloat(opt.priceAdjustment) * opt.quantity, 0)
                                          ) * item.quantity
                                        )}
                                      </span>
                                      <div className="flex items-center gap-0.5">
                                        <Button
                                          variant="ghost"
                                          size="icon"
                                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                          data-testid={`button-decrease-${item.id}`}
                                          className="h-6 w-6 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-600"
                                        >
                                          <Minus className="h-3 w-3" />
                                        </Button>
                                        <span className="w-5 text-center font-semibold text-xs text-gray-900" data-testid={`text-quantity-${item.id}`}>
                                          {item.quantity}
                                        </span>
                                        <Button
                                          variant="ghost"
                                          size="icon"
                                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                          data-testid={`button-increase-${item.id}`}
                                          className="h-6 w-6 rounded-full bg-gray-900 hover:bg-gray-800 text-white"
                                        >
                                          <Plus className="h-3 w-3" />
                                        </Button>
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
                            <div className="flex items-center gap-2">
                              Continuar
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
                            <div>
                              <Label htmlFor="delivery-address" className="text-xs font-medium mb-1 block text-gray-700">Endereço de Entrega</Label>
                              <textarea
                                id="delivery-address"
                                placeholder="Rua, número, bairro..."
                                value={deliveryAddress}
                                onChange={(e) => setDeliveryAddress(e.target.value)}
                                rows={2}
                                data-testid="input-delivery-address"
                                className="w-full px-3 py-2 text-sm resize-none rounded-lg border border-gray-200 bg-gray-50 focus:bg-white focus:border-gray-400 focus:outline-none"
                                style={{ color: '#1a1a1a', caretColor: '#1a1a1a' }}
                              />
                            </div>
                          )}

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

          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Pesquisar no cardápio..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-12 pl-12 pr-4 rounded-2xl bg-gray-50 border border-gray-100 placeholder:text-gray-400 focus:bg-white focus:border-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-400/20"
              style={{ color: '#1a1a1a', caretColor: '#1a1a1a' }}
              data-testid="input-search"
            />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="pt-44 px-4">
        {/* Restaurant Info */}
        <div className="mb-6">
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-xl font-bold text-gray-900">{restaurant.name}</h1>
            {restaurant.isOpen === 1 ? (
              <Badge className="bg-green-100 text-green-700 border-0 text-xs">Aberto</Badge>
            ) : (
              <Badge className="bg-gray-100 text-gray-600 border-0 text-xs">Fechado</Badge>
            )}
          </div>
          {(restaurant.businessHours || restaurant.phone) && (
            <div className="flex items-center gap-4 text-sm text-gray-500">
              {restaurant.businessHours && (
                <span className="flex items-center gap-1">
                  <Clock className="h-4 w-4" />
                  {restaurant.businessHours}
                </span>
              )}
              {restaurant.phone && (
                <span className="flex items-center gap-1">
                  <Phone className="h-4 w-4" />
                  {restaurant.phone}
                </span>
              )}
            </div>
          )}
        </div>

        {/* Categories Section */}
        {categories.length > 0 && (
          <section className="mb-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-gray-900">Cardápio</h2>
              <button className="text-sm text-gray-500 font-medium" data-testid="button-see-all-categories">
                Ver tudo
              </button>
            </div>
            <ScrollArea className="w-full">
              <div className="flex gap-4 pb-2">
                <button
                  onClick={() => setSelectedCategory('all')}
                  className={`flex flex-col items-center gap-2 min-w-[72px] transition-all ${
                    selectedCategory === 'all' ? 'opacity-100' : 'opacity-60'
                  }`}
                  data-testid="category-all"
                >
                  <div className={`w-16 h-16 rounded-2xl flex items-center justify-center transition-all ${
                    selectedCategory === 'all' 
                      ? 'bg-gray-900 shadow-lg' 
                      : 'bg-white border border-gray-100 shadow-sm'
                  }`}>
                    <Utensils className={`h-6 w-6 ${selectedCategory === 'all' ? 'text-white' : 'text-gray-600'}`} />
                  </div>
                  <span className={`text-xs font-medium ${selectedCategory === 'all' ? 'text-gray-900' : 'text-gray-600'}`}>
                    Todos
                  </span>
                </button>
                {categories.map((category) => {
                    const categoryImage = categoryImages[category.id] || category.imageUrl;
                    return (
                      <button
                        key={category.id}
                        onClick={() => setSelectedCategory(category.id)}
                        className={`flex flex-col items-center gap-2 min-w-[72px] transition-all ${
                          selectedCategory === category.id ? 'opacity-100' : 'opacity-60'
                        }`}
                        data-testid={`category-${category.id}`}
                      >
                        <div className={`w-16 h-16 rounded-2xl flex items-center justify-center transition-all overflow-hidden ${
                          selectedCategory === category.id 
                            ? 'ring-2 ring-gray-900 ring-offset-2 shadow-lg' 
                            : 'bg-white border border-gray-100 shadow-sm'
                        }`}>
                          {categoryImage ? (
                            <img src={categoryImage} alt={category.name} className="w-full h-full object-cover" />
                          ) : (
                            <Utensils className={`h-6 w-6 ${selectedCategory === category.id ? 'text-gray-900' : 'text-gray-600'}`} />
                          )}
                        </div>
                        <span className={`text-xs font-medium text-center line-clamp-2 max-w-[72px] ${
                          selectedCategory === category.id ? 'text-gray-900' : 'text-gray-600'
                        }`}>
                          {category.name}
                        </span>
                      </button>
                    );
                })}
              </div>
            </ScrollArea>
          </section>
        )}

        {/* Promo Section - Shows real discounted items */}
        {specialOfferItems.length > 0 && (
          <section className="mb-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-gray-900">Promoções</h2>
              <button className="text-sm text-gray-500 font-medium" data-testid="button-see-all-promos">
                Ver tudo
              </button>
            </div>
            <ScrollArea className="w-full">
              <div className="flex gap-4 pb-2">
                {specialOfferItems.slice(0, 3).map((item) => {
                  const itemPrice = typeof item.price === 'string' ? parseFloat(item.price) : item.price;
                  const itemOriginalPrice = item.originalPrice 
                    ? (typeof item.originalPrice === 'string' ? parseFloat(item.originalPrice) : item.originalPrice) 
                    : itemPrice;
                  const discountPercent = Math.round(((itemOriginalPrice - itemPrice) / itemOriginalPrice) * 100);
                  
                  return (
                    <div
                      key={item.id}
                      className="min-w-[280px] h-36 rounded-3xl p-5 flex justify-between relative overflow-hidden cursor-pointer hover:shadow-lg transition-shadow"
                      style={{
                        background: 'linear-gradient(135deg, #555555 0%, #333333 100%)'
                      }}
                      onClick={() => handleAddMenuItem(item)}
                      data-testid={`promo-card-${item.id}`}
                    >
                      <div className="absolute top-0 right-0 w-32 h-32 rounded-full bg-white/5 -mr-10 -mt-10" />
                      <div className="absolute bottom-0 left-0 w-24 h-24 rounded-full bg-white/5 -ml-8 -mb-8" />
                      
                      <div className="flex flex-col justify-between z-10">
                        <div>
                          <p className="text-white/80 text-xs mb-1">Desconto de</p>
                          <p className="text-white text-4xl font-bold">{discountPercent}%</p>
                          <p className="text-white/80 text-sm line-clamp-1">{item.name}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-white/50 text-xs line-through">{formatKwanza(itemOriginalPrice)}</span>
                          <span className="text-white font-semibold text-sm">{formatKwanza(itemPrice)}</span>
                        </div>
                      </div>
                      
                      {item.imageUrl && (
                        <div className="w-24 h-24 rounded-2xl overflow-hidden flex-shrink-0 self-center">
                          <img 
                            src={item.imageUrl} 
                            alt={item.name}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </ScrollArea>
          </section>
        )}

        {/* Special Offers Section */}
        {specialOfferItems.length > 0 && (
          <section className="mb-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-gray-900">Ofertas Especiais</h2>
              <button className="text-sm text-gray-500 font-medium" data-testid="button-see-all-offers">
                Ver tudo
              </button>
            </div>
            <ScrollArea className="w-full">
              <div className="flex gap-4 pb-2">
                {specialOfferItems.map((item) => {
                  const itemPrice = typeof item.price === 'string' ? item.price : Number(item.price).toFixed(2);
                  const itemOriginalPrice = item.originalPrice 
                    ? (typeof item.originalPrice === 'string' ? item.originalPrice : Number(item.originalPrice).toFixed(2)) 
                    : null;
                  const categoryName = (item as any).category?.name || 'Oferta';

                  return (
                    <div
                      key={item.id}
                      className="min-w-[180px] bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden cursor-pointer hover:shadow-md transition-shadow"
                      onClick={() => handleAddMenuItem(item)}
                      data-testid={`special-offer-${item.id}`}
                    >
                      <div className="relative aspect-square bg-gray-50">
                        {item.imageUrl ? (
                          <img
                            src={item.imageUrl}
                            alt={item.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <Utensils className="h-10 w-10 text-gray-300" />
                          </div>
                        )}
                        <Badge className="absolute top-2 left-2 bg-gray-900 text-white text-[10px] px-2 py-1 rounded-lg border-0">
                          {categoryName}
                        </Badge>
                        <button 
                          className={`absolute top-2 right-2 w-8 h-8 rounded-full flex items-center justify-center shadow-sm transition-colors ${
                            isFavorite(item.id) ? 'bg-red-500' : 'bg-white/90'
                          }`}
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleFavorite(item.id);
                            toast({
                              title: isFavorite(item.id) ? 'Removido dos favoritos' : 'Adicionado aos favoritos',
                              description: item.name,
                            });
                          }}
                          data-testid={`button-favorite-offer-${item.id}`}
                        >
                          <Heart className={`h-4 w-4 ${isFavorite(item.id) ? 'text-white fill-white' : 'text-gray-400'}`} />
                        </button>
                      </div>
                      <div className="p-3">
                        <h3 className="font-semibold text-sm text-gray-900 line-clamp-2 mb-1">{item.name}</h3>
                        <div className="flex items-baseline gap-2">
                          <span className="font-bold text-sm text-gray-900">{formatKwanza(itemPrice)}</span>
                          {itemOriginalPrice && (
                            <span className="text-xs text-gray-400 line-through">{formatKwanza(itemOriginalPrice)}</span>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </ScrollArea>
          </section>
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
                className="mb-8"
                id={`category-${group.category.id}`}
              >
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-bold text-gray-900">{group.category.name}</h2>
                  <button className="text-sm text-gray-500 font-medium">
                    Ver tudo
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  {group.items.map((item, itemIndex) => {
                    const itemPrice = typeof item.price === 'string' ? item.price : Number(item.price).toFixed(2);
                    const itemOriginalPrice = item.originalPrice 
                      ? (typeof item.originalPrice === 'string' ? item.originalPrice : Number(item.originalPrice).toFixed(2)) 
                      : null;
                    const hasPromo = itemOriginalPrice && parseFloat(itemOriginalPrice) > parseFloat(itemPrice);

                    return (
                      <motion.div
                        key={item.id}
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.3, delay: itemIndex * 0.05 }}
                      >
                        <Card
                          className="overflow-hidden cursor-pointer h-full flex flex-col bg-white border border-gray-100 shadow-sm hover:shadow-md transition-all duration-300 rounded-xl"
                          onClick={() => handleAddMenuItem(item)}
                          data-testid={`menu-item-${item.id}`}
                        >
                          <CardContent className="p-0 flex flex-col h-full">
                            <div className="relative aspect-[4/3] w-full bg-gray-50 overflow-hidden">
                              {item.imageUrl ? (
                                <img
                                  src={item.imageUrl}
                                  alt={item.name}
                                  className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
                                />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center">
                                  <Utensils className="h-8 w-8 text-gray-300" />
                                </div>
                              )}
                              {hasPromo && (
                                <Badge className="absolute top-1.5 left-1.5 bg-gray-900 text-white text-[9px] px-1.5 py-0.5 rounded-md border-0">
                                  Promo
                                </Badge>
                              )}
                              <button 
                                className={`absolute top-1.5 right-1.5 w-6 h-6 rounded-full flex items-center justify-center shadow-sm transition-colors ${
                                  isFavorite(item.id) ? 'bg-red-500' : 'bg-white/90'
                                }`}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  toggleFavorite(item.id);
                                  toast({
                                    title: isFavorite(item.id) ? 'Removido dos favoritos' : 'Adicionado aos favoritos',
                                    description: item.name,
                                  });
                                }}
                                data-testid={`button-favorite-${item.id}`}
                              >
                                <Heart className={`h-3 w-3 ${isFavorite(item.id) ? 'text-white fill-white' : 'text-gray-400'}`} />
                              </button>
                            </div>
                            <div className="p-2 flex flex-col flex-1">
                              <h3 className="font-medium text-xs leading-tight line-clamp-2 text-gray-900 mb-1" data-testid={`text-item-name-${item.id}`}>
                                {item.name}
                              </h3>
                              <div className="mt-auto space-y-1.5">
                                <div className="flex items-baseline gap-1.5">
                                  <span className="font-bold text-sm text-gray-900" data-testid={`text-item-price-${item.id}`}>
                                    {formatKwanza(itemPrice)}
                                  </span>
                                  {hasPromo && (
                                    <span className="text-[10px] text-gray-400 line-through">
                                      {formatKwanza(itemOriginalPrice!)}
                                    </span>
                                  )}
                                </div>
                                <Button
                                  size="sm"
                                  className="w-full h-7 text-xs bg-gray-900 hover:bg-gray-800 text-white font-medium shadow-sm rounded-lg"
                                  onClick={(e) => handleQuickAddToCart(item, e)}
                                  data-testid={`button-add-${item.id}`}
                                >
                                  <Plus className="h-3 w-3 mr-1" />
                                  Adicionar
                                </Button>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      </motion.div>
                    );
                  })}
                </div>
              </motion.div>
            ))
          ) : (
            <div className="grid grid-cols-2 gap-4">
              {filteredItems.map((item, itemIndex) => {
                const itemPrice = typeof item.price === 'string' ? item.price : Number(item.price).toFixed(2);
                const itemOriginalPrice = item.originalPrice 
                  ? (typeof item.originalPrice === 'string' ? item.originalPrice : Number(item.originalPrice).toFixed(2)) 
                  : null;
                const hasPromo = itemOriginalPrice && parseFloat(itemOriginalPrice) > parseFloat(itemPrice);

                return (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.3, delay: itemIndex * 0.05 }}
                  >
                    <Card
                      className="overflow-hidden cursor-pointer h-full flex flex-col bg-white border border-gray-100 shadow-sm hover:shadow-md transition-all duration-300 rounded-xl"
                      onClick={() => handleAddMenuItem(item)}
                      data-testid={`menu-item-${item.id}`}
                    >
                      <CardContent className="p-0 flex flex-col h-full">
                        <div className="relative aspect-[4/3] w-full bg-gray-50 overflow-hidden">
                          {item.imageUrl ? (
                            <img
                              src={item.imageUrl}
                              alt={item.name}
                              className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <Utensils className="h-8 w-8 text-gray-300" />
                            </div>
                          )}
                          {hasPromo && (
                            <Badge className="absolute top-1.5 left-1.5 bg-gray-900 text-white text-[9px] px-1.5 py-0.5 rounded-md border-0">
                              Promo
                            </Badge>
                          )}
                          <button 
                            className={`absolute top-1.5 right-1.5 w-6 h-6 rounded-full flex items-center justify-center shadow-sm transition-colors ${
                              isFavorite(item.id) ? 'bg-red-500' : 'bg-white/90'
                            }`}
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleFavorite(item.id);
                              toast({
                                title: isFavorite(item.id) ? 'Removido dos favoritos' : 'Adicionado aos favoritos',
                                description: item.name,
                              });
                            }}
                            data-testid={`button-favorite-filtered-${item.id}`}
                          >
                            <Heart className={`h-3 w-3 ${isFavorite(item.id) ? 'text-white fill-white' : 'text-gray-400'}`} />
                          </button>
                        </div>
                        <div className="p-2 flex flex-col flex-1">
                          <h3 className="font-medium text-xs leading-tight line-clamp-2 text-gray-900 mb-1" data-testid={`text-item-name-${item.id}`}>
                            {item.name}
                          </h3>
                          <div className="mt-auto space-y-1.5">
                            <div className="flex items-baseline gap-1.5">
                              <span className="font-bold text-sm text-gray-900" data-testid={`text-item-price-${item.id}`}>
                                {formatKwanza(itemPrice)}
                              </span>
                              {hasPromo && (
                                <span className="text-[10px] text-gray-400 line-through">
                                  {formatKwanza(itemOriginalPrice!)}
                                </span>
                              )}
                            </div>
                            <Button
                              size="sm"
                              className="w-full h-7 text-xs bg-gray-900 hover:bg-gray-800 text-white font-medium shadow-sm rounded-lg"
                              onClick={(e) => handleQuickAddToCart(item, e)}
                              data-testid={`button-add-${item.id}`}
                            >
                              <Plus className="h-3 w-3 mr-1" />
                              Adicionar
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                );
              })}
            </div>
          )}

          {filteredItems.length === 0 && (
            <div className="flex flex-col items-center justify-center py-16 text-gray-400">
              <Search className="h-16 w-16 mb-4 opacity-20" />
              <p className="text-lg font-medium text-gray-600">Nenhum produto encontrado</p>
              <p className="text-sm mt-1">Tente ajustar sua busca ou filtro</p>
            </div>
          )}
        </section>

        {/* WhatsApp Floating Button */}
        {restaurant.whatsappNumber && (
          <a
            href={`https://wa.me/${restaurant.whatsappNumber.replace(/\D/g, '')}`}
            target="_blank"
            rel="noopener noreferrer"
            className="fixed bottom-28 right-4 w-14 h-14 bg-[#25D366] rounded-full flex items-center justify-center shadow-lg hover:shadow-xl transition-shadow z-40"
            data-testid="button-whatsapp-float"
          >
            <SiWhatsapp className="h-7 w-7 text-white" />
          </a>
        )}
      </main>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 z-50 safe-area-inset-bottom">
        <div className="flex items-center justify-around py-3 px-4">
          <button 
            className={`flex flex-col items-center gap-1 min-w-[56px] ${activeNav === 'home' ? 'text-gray-900' : 'text-gray-400'}`}
            onClick={() => {
              setActiveNav('home');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            data-testid="nav-home"
          >
            <Home className="h-6 w-6" />
            <span className="text-[10px] font-medium">Home</span>
          </button>
          <button 
            className={`flex flex-col items-center gap-1 min-w-[56px] relative ${activeNav === 'favorites' ? 'text-gray-900' : 'text-gray-400'}`}
            onClick={() => {
              setActiveNav('favorites');
              setIsFavoritesDialogOpen(true);
            }}
            data-testid="nav-favorites"
          >
            <Heart className="h-6 w-6" />
            {favorites.length > 0 && (
              <span className="absolute -top-1 right-1/2 translate-x-4 bg-red-500 text-white text-[10px] font-bold rounded-full h-4 w-4 flex items-center justify-center">
                {favorites.length}
              </span>
            )}
            <span className="text-[10px] font-medium">Favoritos</span>
          </button>
          <button 
            className={`flex flex-col items-center gap-1 min-w-[56px] relative ${activeNav === 'history' ? 'text-gray-900' : 'text-gray-400'}`}
            onClick={() => {
              setActiveNav('history');
              setIsHistoryDialogOpen(true);
            }}
            data-testid="nav-history"
          >
            <Clock className="h-6 w-6" />
            {orderHistory.length > 0 && (
              <span className="absolute -top-1 right-1/2 translate-x-4 bg-gray-900 text-white text-[10px] font-bold rounded-full h-4 w-4 flex items-center justify-center">
                {orderHistory.length}
              </span>
            )}
            <span className="text-[10px] font-medium">Histórico</span>
          </button>
          <button 
            className={`flex flex-col items-center gap-1 min-w-[56px] ${activeNav === 'profile' ? 'text-gray-900' : 'text-gray-400'}`}
            onClick={() => {
              setActiveNav('profile');
              setIsRegisterDialogOpen(true);
            }}
            data-testid="nav-profile"
          >
            <User className="h-6 w-6" />
            <span className="text-[10px] font-medium">Perfil</span>
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
        <DialogContent className="sm:max-w-md bg-white rounded-3xl overflow-hidden [&>button]:hidden" data-testid="dialog-register-customer">
          {/* Hero Section with Close Button */}
          <div className="relative bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 pt-6 pb-10 px-6 -mx-6 -mt-6">
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
            <div className="bg-gray-50 rounded-xl border border-gray-100 p-3">
              <div className="flex items-center justify-around gap-1">
                <div className="flex flex-col items-center text-center p-1.5">
                  <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center mb-1.5">
                    <Gift className="h-5 w-5 text-amber-600" />
                  </div>
                  <span className="text-[10px] font-medium text-gray-600 leading-tight">Pontos em<br/>cada pedido</span>
                </div>
                <div className="w-px h-10 bg-gray-200" />
                <div className="flex flex-col items-center text-center p-1.5">
                  <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center mb-1.5">
                    <Tag className="h-5 w-5 text-green-600" />
                  </div>
                  <span className="text-[10px] font-medium text-gray-600 leading-tight">Descontos<br/>exclusivos</span>
                </div>
                <div className="w-px h-10 bg-gray-200" />
                <div className="flex flex-col items-center text-center p-1.5">
                  <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center mb-1.5">
                    <Award className="h-5 w-5 text-purple-600" />
                  </div>
                  <span className="text-[10px] font-medium text-gray-600 leading-tight">Bônus de<br/>aniversário</span>
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
              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1.5">
                  <Label htmlFor="register-phone" className="text-sm font-medium text-gray-700">
                    Telefone
                  </Label>
                  <Input
                    id="register-phone"
                    type="tel"
                    placeholder="+244 900 000"
                    value={registerFormData.phone}
                    onChange={(e) => setRegisterFormData({ ...registerFormData, phone: e.target.value })}
                    className="h-11 rounded-xl border-gray-200 bg-gray-50 focus:bg-white"
                    data-testid="input-register-phone"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="register-cpf" className="text-sm font-medium text-gray-700">
                    CPF/BI
                  </Label>
                  <Input
                    id="register-cpf"
                    placeholder="Documento"
                    value={registerFormData.cpf}
                    onChange={(e) => setRegisterFormData({ ...registerFormData, cpf: e.target.value })}
                    className="h-11 rounded-xl border-gray-200 bg-gray-50 focus:bg-white"
                    data-testid="input-register-cpf"
                  />
                </div>
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
                className="flex-1 h-11 rounded-xl border-gray-200 text-gray-600 font-medium"
                onClick={() => setIsRegisterDialogOpen(false)}
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                className="flex-1 h-11 rounded-xl bg-gray-900 hover:bg-gray-800 text-white font-semibold"
                disabled={registerCustomerMutation.isPending || !registerFormData.name}
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

      {/* Favorites Dialog */}
      <Dialog open={isFavoritesDialogOpen} onOpenChange={setIsFavoritesDialogOpen}>
        <DialogContent className="sm:max-w-lg max-h-[85vh] bg-white rounded-3xl" data-testid="dialog-favorites">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-gray-900 flex items-center gap-2">
              <Heart className="h-5 w-5 text-red-500" />
              Meus Favoritos
            </DialogTitle>
            <DialogDescription className="text-sm text-gray-500">
              {favoriteItems.length > 0 
                ? `Você tem ${favoriteItems.length} item(s) favorito(s)`
                : 'Salve seus pratos favoritos para acessar rapidamente'}
            </DialogDescription>
          </DialogHeader>
          
          <ScrollArea className="max-h-[55vh] pr-2">
            {favoriteItems.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-gray-400">
                <Heart className="h-16 w-16 mb-4 opacity-20" />
                <p className="font-medium text-gray-600">Nenhum favorito ainda</p>
                <p className="text-sm mt-1 text-center">Toque no coração nos produtos para salvar</p>
              </div>
            ) : (
              <div className="space-y-3">
                {favoriteItems.map((item) => {
                  const itemPrice = typeof item.price === 'string' ? item.price : Number(item.price).toFixed(2);
                  return (
                    <div 
                      key={item.id}
                      className="flex items-center gap-3 p-3 rounded-2xl bg-gray-50 border border-gray-100 cursor-pointer hover:bg-gray-100 transition-colors"
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
                        <div className="w-16 h-16 rounded-xl bg-gray-200 flex items-center justify-center flex-shrink-0">
                          <Utensils className="h-6 w-6 text-gray-400" />
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <h4 className="font-semibold text-sm text-gray-900 line-clamp-1">{item.name}</h4>
                        {item.description && (
                          <p className="text-xs text-gray-500 line-clamp-1 mt-0.5">{item.description}</p>
                        )}
                        <p className="font-bold text-sm text-gray-900 mt-1">{formatKwanza(itemPrice)}</p>
                      </div>
                      <button
                        className="w-8 h-8 rounded-full bg-red-500 flex items-center justify-center flex-shrink-0"
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
        </DialogContent>
      </Dialog>

      {/* Order History Dialog */}
      <Dialog open={isHistoryDialogOpen} onOpenChange={setIsHistoryDialogOpen}>
        <DialogContent className="sm:max-w-lg max-h-[85vh] bg-white rounded-3xl" data-testid="dialog-history">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-gray-900 flex items-center gap-2">
              <Package className="h-5 w-5 text-gray-600" />
              Histórico de Pedidos
            </DialogTitle>
            <DialogDescription className="text-sm text-gray-500">
              {orderHistory.length > 0 
                ? `Seus últimos ${orderHistory.length} pedido(s)`
                : 'Seu histórico de pedidos aparecerá aqui'}
            </DialogDescription>
          </DialogHeader>
          
          <ScrollArea className="max-h-[55vh] pr-2">
            {orderHistory.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-gray-400">
                <Package className="h-16 w-16 mb-4 opacity-20" />
                <p className="font-medium text-gray-600">Nenhum pedido ainda</p>
                <p className="text-sm mt-1 text-center">Faça seu primeiro pedido!</p>
              </div>
            ) : (
              <div className="space-y-3">
                {orderHistory.map((order) => {
                  const orderDate = new Date(order.createdAt);
                  const isRecent = Date.now() - orderDate.getTime() < 24 * 60 * 60 * 1000;
                  
                  return (
                    <div 
                      key={order.id}
                      className="p-4 rounded-2xl bg-gray-50 border border-gray-100"
                      data-testid={`history-order-${order.id}`}
                    >
                      <div className="flex items-start justify-between gap-2 mb-3">
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="font-semibold text-sm text-gray-900">
                              Pedido #{order.orderNumber || order.id.slice(-6).toUpperCase()}
                            </h4>
                            {isRecent && (
                              <Badge className="bg-green-100 text-green-700 border-0 text-[10px]">
                                Recente
                              </Badge>
                            )}
                          </div>
                          <p className="text-xs text-gray-500 mt-0.5">
                            {orderDate.toLocaleDateString('pt-BR', { 
                              day: '2-digit', 
                              month: 'short',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </p>
                        </div>
                        <Badge variant="outline" className="text-xs border-gray-200 text-gray-600">
                          {order.orderType === 'delivery' ? 'Delivery' : 'Retirada'}
                        </Badge>
                      </div>
                      
                      <div className="space-y-1.5 mb-3">
                        {order.items.slice(0, 3).map((item, idx) => (
                          <div key={idx} className="flex justify-between text-xs text-gray-600">
                            <span>{item.quantity}x {item.name}</span>
                            <span className="font-medium">{formatKwanza(parseFloat(item.price) * item.quantity)}</span>
                          </div>
                        ))}
                        {order.items.length > 3 && (
                          <p className="text-xs text-gray-400">+{order.items.length - 3} item(s)</p>
                        )}
                      </div>
                      
                      <Separator className="my-2 bg-gray-200" />
                      
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-semibold text-gray-900">Total</span>
                        <span className="text-sm font-bold text-gray-900">{formatKwanza(order.totalAmount)}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </ScrollArea>
        </DialogContent>
      </Dialog>
    </div>
  );
}
