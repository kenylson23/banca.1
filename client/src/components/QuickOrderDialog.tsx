import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { 
  Search, ShoppingCart, Plus, Minus, X, 
  Trash2, Send, Calculator, Tag, Users
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';

interface QuickOrderDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  tableId: string;
  tableNumber: string | number;
}

interface CartItem {
  productId: string;
  name: string;
  price: number;
  quantity: number;
  notes?: string;
  image?: string;
  guestId?: string;
  guestName?: string;
}

interface Guest {
  id: string;
  name?: string;
  guestNumber: number;
  customer?: {
    name: string;
  };
}

interface NumpadOverlayProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  quantity: number;
  onQuantityChange: (qty: number) => void;
  onConfirm: () => void;
  guests: Guest[];
  selectedGuest: string | null;
  onGuestChange: (guestId: string | null) => void;
}

// Numpad Overlay Component
function NumpadOverlay({ open, onOpenChange, quantity, onQuantityChange, onConfirm, guests, selectedGuest, onGuestChange }: NumpadOverlayProps) {
  const handleNumpad = (value: string) => {
    if (value === 'C') {
      onQuantityChange(1);
    } else if (value === '←') {
      onQuantityChange(Math.floor(quantity / 10) || 1);
    } else if (value === '✓') {
      onConfirm();
    } else {
      const num = parseInt(value);
      if (!isNaN(num)) {
        const newValue = parseInt(`${quantity}${num}`);
        onQuantityChange(newValue > 99 ? quantity : newValue);
      }
    }
  };

  const getGuestLabel = (guest: Guest) => {
    if (guest.customer?.name) return guest.customer.name;
    if (guest.name) return guest.name;
    return `Convidado ${guest.guestNumber}`;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md bg-slate-900 border-2 border-emerald-500/30">
        <DialogHeader>
          <DialogTitle className="text-emerald-400">Definir Quantidade e Convidado</DialogTitle>
        </DialogHeader>
        
        {/* Guest Selection */}
        {guests.length > 0 && (
          <div className="mb-4">
            <label className="text-sm text-slate-400 mb-2 block">Para qual convidado?</label>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => onGuestChange(null)}
                className={cn(
                  "p-3 rounded-lg border-2 transition-all text-left",
                  !selectedGuest
                    ? "border-emerald-500 bg-emerald-500/20 text-emerald-400"
                    : "border-slate-700 bg-slate-800/50 text-slate-400 hover:border-slate-600"
                )}
              >
                <div className="font-semibold text-sm">Mesa completa</div>
                <div className="text-xs opacity-70">Todos os convidados</div>
              </button>
              
              {guests.map((guest) => (
                <button
                  key={guest.id}
                  onClick={() => onGuestChange(guest.id)}
                  className={cn(
                    "p-3 rounded-lg border-2 transition-all text-left",
                    selectedGuest === guest.id
                      ? "border-cyan-500 bg-cyan-500/20 text-cyan-400"
                      : "border-slate-700 bg-slate-800/50 text-slate-400 hover:border-slate-600"
                  )}
                >
                  <div className="font-semibold text-sm truncate">{getGuestLabel(guest)}</div>
                  <div className="text-xs opacity-70">#{guest.guestNumber}</div>
                </button>
              ))}
            </div>
          </div>
        )}
        
        <div className="text-center mb-4">
          <div className="text-sm text-emerald-400 mb-2 uppercase tracking-wider">Quantidade</div>
          <div className="text-6xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-400 drop-shadow-[0_0_10px_rgba(16,185,129,0.5)]">
            {quantity}
          </div>
        </div>
        
        <div className="grid grid-cols-4 gap-2">
          {['1', '2', '3', '←', '4', '5', '6', 'C', '7', '8', '9', '✓', '-', '0', '+'].map((key) => (
            <Button
              key={key}
              variant="outline"
              className={cn(
                "h-12 font-bold text-lg transition-all",
                key === '✓' && "col-span-2 bg-gradient-to-br from-emerald-500 to-cyan-500 border-transparent text-white",
                key === 'C' && "border-red-500/50 text-red-400 hover:bg-red-500/20",
                (key === '-' || key === '+') && "border-cyan-500/50 text-cyan-400 hover:bg-cyan-500/20",
                !['✓', 'C', '-', '+'].includes(key) && "border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/20"
              )}
              onClick={() => {
                if (key === '+') onQuantityChange(Math.min(quantity + 1, 99));
                else if (key === '-') onQuantityChange(Math.max(quantity - 1, 1));
                else handleNumpad(key);
              }}
            >
              {key}
            </Button>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}

export function QuickOrderDialog({ 
  open, 
  onOpenChange, 
  tableId,
  tableNumber 
}: QuickOrderDialogProps) {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [orderNotes, setOrderNotes] = useState('');
  const [showNumpad, setShowNumpad] = useState(false);
  const [selectedProductForQuantity, setSelectedProductForQuantity] = useState<any>(null);
  const [selectedGuest, setSelectedGuest] = useState<string | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { user } = useAuth();

  // Fetch menu items
  const { data: menuItems = [], isLoading } = useQuery({
    queryKey: ['menu-items'],
    queryFn: async () => {
      const response = await fetch('/api/menu-items?available=true');
      if (!response.ok) throw new Error('Erro ao carregar produtos');
      return response.json();
    },
    enabled: open,
  });

  // Fetch table data to get sessionId
  const { data: tableData } = useQuery({
    queryKey: ['table', tableId],
    queryFn: async () => {
      const response = await fetch(`/api/tables/${tableId}`);
      if (!response.ok) throw new Error('Erro ao carregar mesa');
      return response.json();
    },
    enabled: open && !!tableId,
  });

  // Fetch table guests
  const { data: guests = [] } = useQuery<Guest[]>({
    queryKey: ['table-guests', tableId],
    queryFn: async () => {
      const response = await fetch(`/api/tables/${tableId}/guests`);
      if (!response.ok) throw new Error('Erro ao carregar convidados');
      return response.json();
    },
    enabled: open && !!tableId,
  });

  // Fetch categories
  const categories = Array.from(
    new Set(menuItems.map((item: any) => {
      // Se category é um objeto, pegar o nome
      if (typeof item.category === 'object' && item.category !== null) {
        return item.category.name || 'Outros';
      }
      return item.category || 'Outros';
    }))
  );

  // Filter products
  const filteredProducts = menuItems.filter((item: any) => {
    const itemCategory = typeof item.category === 'object' && item.category !== null
      ? item.category.name
      : item.category;
    const matchesCategory = selectedCategory === 'all' || itemCategory === selectedCategory;
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  // Create order mutation
  const createOrderMutation = useMutation({
    mutationFn: async () => {
      if (!user?.restaurantId) {
        throw new Error('RestaurantId não encontrado');
      }

      // 🔧 FIX: Validate sessionId before creating order
      if (!tableData?.currentSessionId) {
        toast({
          title: 'Erro ao criar pedido',
          description: 'Mesa não tem sessão ativa. Por favor, inicie uma sessão primeiro.',
          variant: 'destructive',
        });
        return;
      }
      
      const orderData = {
        restaurantId: user.restaurantId,
        tableId,
        type: 'dine-in',
        sessionId: tableData.currentSessionId, // 🔧 FIX: Include sessionId from table
        items: cart.map(item => {
          const itemData: any = {
            menuItemId: item.productId,
            quantity: item.quantity,
            price: item.price.toString(),
            notes: item.notes || '',
          };
          
          // Auto-atribuir ao único guest se houver apenas 1
          if (item.guestId) {
            itemData.guestId = item.guestId;
          } else if (guests.length === 1) {
            itemData.guestId = guests[0].id;
          }
          
          return itemData;
        }),
        notes: orderNotes,
      };
      
      
      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderData),
      });
      
      if (!response.ok) {
        const error = await response.json().catch(() => ({ message: 'Erro desconhecido' }));
        throw new Error(error.message || 'Erro ao criar pedido');
      }
      
      const result = await response.json();
      return result;
    },
    onSuccess: () => {
      toast({
        title: '✅ Pedido enviado!',
        description: `Pedido criado para Mesa ${tableNumber}`,
      });
      // Invalidate correct queries used by TableDetailsDialog
      queryClient.invalidateQueries({ queryKey: [`/api/tables/${tableId}/orders-by-guest`] });
      queryClient.invalidateQueries({ queryKey: [`/api/tables/${tableId}/guests`] });
      queryClient.invalidateQueries({ queryKey: [`/api/table-sessions`] });
      queryClient.invalidateQueries({ queryKey: ['/api/tables'] });
      queryClient.invalidateQueries({ queryKey: ['/api/orders'] });
      
      // Force refetch after a small delay to ensure DB is updated
      setTimeout(() => {
        queryClient.refetchQueries({ queryKey: [`/api/tables/${tableId}/orders-by-guest`] });
      }, 300);
      
      setCart([]);
      setOrderNotes('');
      onOpenChange(false);
    },
    onError: (error: any) => {
      toast({
        title: '❌ Erro ao criar pedido',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  // Add to cart
  const addToCart = (product: any, guestId?: string | null) => {
    const guest = guests.find(g => g.id === guestId);
    const guestName = guest 
      ? (guest.customer?.name || guest.name || `Convidado ${guest.guestNumber}`)
      : undefined;

    const existingItem = cart.find(item => 
      item.productId === product.id && item.guestId === guestId
    );
    
    if (existingItem) {
      setCart(cart.map(item =>
        item.productId === product.id && item.guestId === guestId
          ? { ...item, quantity: item.quantity + quantity }
          : item
      ));
    } else {
      setCart([...cart, {
        productId: product.id,
        name: product.name,
        price: parseFloat(product.price),
        quantity,
        image: product.image,
        guestId: guestId || undefined,
        guestName,
      }]);
    }

    const guestLabel = guestName ? ` para ${guestName}` : '';
    toast({
      title: '✅ Adicionado ao carrinho',
      description: `${quantity}x ${product.name}${guestLabel}`,
    });
    
    setQuantity(1); // Reset quantity
    setSelectedGuest(null); // Reset guest selection
  };

  // Update cart item quantity
  const updateQuantity = (productId: string, newQuantity: number) => {
    if (newQuantity <= 0) {
      removeFromCart(productId);
      return;
    }
    setCart(cart.map(item =>
      item.productId === productId
        ? { ...item, quantity: newQuantity }
        : item
    ));
  };

  // Remove from cart
  const removeFromCart = (productId: string) => {
    setCart(cart.filter(item => item.productId !== productId));
  };

  // Calculate totals
  const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const total = subtotal; // Can add discounts, taxes here

  // Numpad handler
  const handleNumpad = (value: string) => {
    if (value === 'C') {
      setQuantity(1);
    } else if (value === '←') {
      setQuantity(prev => Math.floor(prev / 10) || 1);
    } else if (value === '✓') {
      // Confirm quantity (optional action)
    } else {
      const num = parseInt(value);
      if (!isNaN(num)) {
        setQuantity(prev => {
          const newValue = parseInt(`${prev}${num}`);
          return newValue > 99 ? prev : newValue;
        });
      }
    }
  };

  const formatKwanza = (value: number) => {
    return new Intl.NumberFormat('pt-AO', {
      style: 'currency',
      currency: 'AOA',
      minimumFractionDigits: 0,
    }).format(value);
  };

  return (
    <>
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl h-[90vh] w-[95vw] sm:w-[90vw] p-0 gap-0 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 border-2 border-emerald-500/30 shadow-2xl shadow-emerald-500/20">
        <DialogHeader className="px-6 py-4 border-b border-emerald-500/30 bg-gradient-to-r from-slate-900/80 to-slate-900/80 backdrop-blur-xl relative overflow-hidden">
          {/* Animated background glow */}
          <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/10 via-cyan-500/10 to-emerald-500/10 animate-pulse" />
          
          <DialogTitle className="text-2xl font-bold flex items-center gap-3 relative z-10">
            <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-emerald-500 to-cyan-500 flex items-center justify-center shadow-lg shadow-emerald-500/50 animate-pulse">
              <ShoppingCart className="h-6 w-6 text-white" />
            </div>
            <div>
              <div className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-400">
                ⚡ Quick POS
              </div>
              <div className="text-sm font-normal text-slate-400">Mesa {tableNumber}</div>
            </div>
          </DialogTitle>
        </DialogHeader>

        <div className="flex flex-1 overflow-hidden flex-col md:flex-row">
          {/* LEFT SIDE: Cart */}
          <div className="w-full md:w-72 border-r md:border-r border-b md:border-b-0 border-emerald-500/20 bg-slate-900/50 backdrop-blur-xl flex flex-col relative max-h-[30vh] md:max-h-none">
            {/* Glow effect */}
            <div className="absolute inset-y-0 left-0 w-px bg-gradient-to-b from-transparent via-emerald-500 to-transparent" />
            
            <div className="p-4 border-b border-emerald-500/20 bg-slate-800/50">
              <h3 className="font-bold text-lg flex items-center gap-2 text-emerald-400">
                <ShoppingCart className="h-5 w-5" />
                CARRINHO
              </h3>
            </div>

            <ScrollArea className="flex-1 p-4">
              {cart.length === 0 ? (
                <div className="text-center py-12 text-slate-500">
                  <div className="relative">
                    <ShoppingCart className="h-12 w-12 mx-auto mb-3 text-slate-700" />
                    <div className="absolute inset-0 h-12 w-12 mx-auto bg-emerald-500/20 blur-xl" />
                  </div>
                  <p className="text-sm text-slate-400">Carrinho vazio</p>
                  <p className="text-xs mt-1 text-slate-600">Adicione produtos</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {cart.map((item) => (
                    <div
                      key={item.productId}
                      className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-3 border border-emerald-500/20 shadow-lg hover:shadow-emerald-500/20 hover:border-emerald-500/40 transition-all relative overflow-hidden group"
                    >
                      {/* Glassmorphism glow */}
                      <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                      <div className="flex items-start justify-between mb-2 relative z-10">
                        <div className="flex-1">
                          <div className="font-semibold text-sm text-slate-200">{item.name}</div>
                          {item.guestName && (
                            <div className="text-xs text-cyan-400 flex items-center gap-1 mt-0.5">
                              <Users className="h-3 w-3" />
                              {item.guestName}
                            </div>
                          )}
                          <div className="text-emerald-400 font-bold text-lg">
                            {formatKwanza(item.price)}
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-6 w-6 p-0 text-red-400 hover:text-red-300 hover:bg-red-500/20"
                          onClick={() => removeFromCart(item.productId)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>

                      <div className="flex items-center gap-2 relative z-10">
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-8 w-8 p-0 border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/20 hover:border-emerald-500"
                          onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                        >
                          <Minus className="h-4 w-4" />
                        </Button>
                        <div className="flex-1 text-center font-bold text-xl text-cyan-400">
                          {item.quantity}
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-8 w-8 p-0 border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/20 hover:border-emerald-500"
                          onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                        >
                          <Plus className="h-4 w-4" />
                        </Button>
                      </div>

                      <div className="text-right text-sm font-bold text-cyan-300 mt-2 relative z-10">
                        = {formatKwanza(item.price * item.quantity)}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </ScrollArea>

            <div className="p-3 md:p-4 border-t border-emerald-500/30 bg-slate-900/80 backdrop-blur-xl space-y-2 md:space-y-3 relative">
              {/* Glow background */}
              <div className="absolute inset-0 bg-gradient-to-t from-emerald-500/10 to-transparent pointer-events-none" />
              
              <div className="space-y-1 md:space-y-2 relative z-10">
                <div className="flex justify-between text-xs md:text-sm">
                  <span className="text-slate-400">Subtotal</span>
                  <span className="font-semibold text-slate-300">{formatKwanza(subtotal)}</span>
                </div>
                <div className="flex justify-between text-lg md:text-2xl font-bold">
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-400">TOTAL</span>
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-400">{formatKwanza(total)}</span>
                </div>
              </div>

              <Button
                className="w-full h-12 md:h-14 bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-600 hover:to-cyan-600 text-white font-bold text-base md:text-lg shadow-lg shadow-emerald-500/50 hover:shadow-emerald-500/70 transition-all relative overflow-hidden group"
                disabled={cart.length === 0 || createOrderMutation.isPending}
                onClick={() => createOrderMutation.mutate()}
              >
                <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
                <Send className="h-4 w-4 md:h-5 md:w-5 mr-2 relative z-10" />
                <span className="relative z-10">{createOrderMutation.isPending ? 'Enviando...' : 'Enviar à Cozinha'}</span>
              </Button>

              <Button
                variant="outline"
                className="w-full border-red-500/30 text-red-400 hover:bg-red-500/20 hover:border-red-500 h-10 md:h-auto"
                disabled={cart.length === 0}
                onClick={() => setCart([])}
              >
                <Trash2 className="h-3 w-3 md:h-4 md:w-4 mr-2" />
                Limpar
              </Button>
            </div>
          </div>

          {/* RIGHT SIDE: Products */}
          <div className="flex-1 flex flex-col bg-slate-950">
            {/* Search and Categories */}
            <div className="p-4 bg-slate-900/50 backdrop-blur-xl border-b border-emerald-500/20 space-y-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-emerald-400" />
                <Input
                  placeholder="Buscar produtos..."
                  className="pl-10 h-11 bg-slate-800/50 border-emerald-500/30 text-slate-200 placeholder:text-slate-500 focus:border-emerald-500 focus:ring-emerald-500/50"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>

              <Tabs value={selectedCategory} onValueChange={setSelectedCategory}>
                <TabsList className="w-full justify-start overflow-x-auto bg-slate-800/50 border border-emerald-500/20">
                  <TabsTrigger 
                    value="all"
                    className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-emerald-500 data-[state=active]:to-cyan-500 data-[state=active]:text-white text-slate-400"
                  >
                    Todos
                  </TabsTrigger>
                  {categories.map((category: string) => (
                    <TabsTrigger 
                      key={category} 
                      value={category}
                      className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-emerald-500 data-[state=active]:to-cyan-500 data-[state=active]:text-white text-slate-400"
                    >
                      {category}
                    </TabsTrigger>
                  ))}
                </TabsList>
              </Tabs>
            </div>

            {/* Products Grid */}
            <ScrollArea className="flex-1 p-4">
              {isLoading ? (
                <div className="text-center py-12 text-emerald-400">
                  <div className="h-12 w-12 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
                  Carregando produtos...
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
                  {filteredProducts.map((product: any) => (
                    <button
                      key={product.id}
                      onClick={() => {
                        setSelectedProductForQuantity(product);
                        setQuantity(1);
                        // Auto-select guest if there's only one
                        if (guests.length === 1) {
                          setSelectedGuest(guests[0].id);
                        } else {
                          setSelectedGuest(null);
                        }
                        setShowNumpad(true);
                      }}
                      className="bg-slate-800/50 backdrop-blur-sm rounded-lg p-3 border-2 border-emerald-500/20 hover:border-emerald-500 hover:shadow-xl hover:shadow-emerald-500/30 transition-all text-left group relative overflow-hidden"
                    >
                      {/* Glow effect on hover */}
                      <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/10 to-cyan-500/10 opacity-0 group-hover:opacity-100 transition-opacity" />
                      
                      <div className="aspect-square bg-slate-900/50 border border-emerald-500/20 rounded-lg mb-2 flex items-center justify-center overflow-hidden relative">
                        {product.image ? (
                          <img 
                            src={product.image} 
                            alt={product.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <Tag className="h-8 w-8 text-emerald-500/30" />
                        )}
                        {/* Plus icon overlay */}
                        <div className="absolute inset-0 bg-emerald-500/80 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                          <Calculator className="h-6 w-6 text-white" />
                        </div>
                      </div>
                      
                      <div className="font-semibold text-xs mb-1 line-clamp-2 text-slate-200 relative z-10">
                        {product.name}
                      </div>
                      
                      <div className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-400 font-bold text-sm relative z-10">
                        {formatKwanza(parseFloat(product.price))}
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </ScrollArea>

          </div>
        </div>
      </DialogContent>
    </Dialog>

    {/* Numpad Overlay */}
    <NumpadOverlay
      open={showNumpad}
      onOpenChange={setShowNumpad}
      quantity={quantity}
      onQuantityChange={setQuantity}
      guests={guests}
      selectedGuest={selectedGuest}
      onGuestChange={setSelectedGuest}
      onConfirm={() => {
        if (selectedProductForQuantity) {
          addToCart(selectedProductForQuantity, selectedGuest);
          setShowNumpad(false);
          setSelectedProductForQuantity(null);
        }
      }}
    />
  </>
  );
}
