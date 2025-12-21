import { useState, useEffect } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { 
  ShoppingCart, 
  Plus, 
  Minus, 
  Trash2, 
  Users, 
  ChevronDown,
  Loader2
} from 'lucide-react';
import { formatKwanza } from '@/lib/formatters';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import type { Table, MenuItem } from '@shared/schema';
import { ProductSelector } from '@/components/ProductSelector';
import { MenuItemOptionsDialog } from '@/components/MenuItemOptionsDialog';

interface TableOrderDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  table: Table | null;
  onOrderCreated?: () => void;
}

interface SelectedOption {
  optionId: string;
  optionName: string;
  optionGroupName: string;
  priceAdjustment: string;
  quantity: number;
}

interface CartItem {
  id: string;
  menuItem: MenuItem;
  quantity: number;
  selectedOptions: SelectedOption[];
}

interface TableGuest {
  id: string;
  name: string | null;
  guestNumber: number;
  status: string;
}

export function TableOrderDialog({ open, onOpenChange, table, onOrderCreated }: TableOrderDialogProps) {
  const { toast } = useToast();
  const { user: currentUser } = useAuth();
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [selectedGuest, setSelectedGuest] = useState<string | null>(null);
  const [showGuestSection, setShowGuestSection] = useState(false);
  const [showNewGuestDialog, setShowNewGuestDialog] = useState(false);
  const [newGuestName, setNewGuestName] = useState('');
  const [selectedMenuItem, setSelectedMenuItem] = useState<MenuItem | null>(null);
  const [showOptionsDialog, setShowOptionsDialog] = useState(false);

  // Fetch guests for the table
  const { data: guests = [] } = useQuery<TableGuest[]>({
    queryKey: table?.id ? [`/api/tables/${table.id}/guests`] : ['/api/guests/disabled'],
    enabled: !!table?.id && open,
  });

  // Reset state when dialog opens/closes
  useEffect(() => {
    if (open) {
      setCartItems([]);
      setSelectedGuest(null);
      setShowGuestSection(false);
      setNewGuestName('');
    }
  }, [open]);

  // Generate unique ID for cart items
  const generateItemId = (menuItemId: string, selectedOptions: SelectedOption[]) => {
    const optionsKey = selectedOptions
      .sort((a, b) => a.optionId.localeCompare(b.optionId))
      .map(opt => `${opt.optionId}:${opt.quantity}`)
      .join(',');
    return `${menuItemId}_${optionsKey || 'no-options'}`;
  };

  // Cart management functions
  const addToCart = (menuItem: MenuItem, selectedOptions: SelectedOption[] = []) => {
    setCartItems(currentItems => {
      const itemId = generateItemId(menuItem.id, selectedOptions);
      const existingItem = currentItems.find(item => item.id === itemId);
      
      if (existingItem) {
        return currentItems.map(item =>
          item.id === itemId
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      
      return [...currentItems, { id: itemId, menuItem, quantity: 1, selectedOptions }];
    });
  };

  const removeFromCart = (itemId: string) => {
    setCartItems(currentItems => currentItems.filter(item => item.id !== itemId));
  };

  const updateQuantity = (itemId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(itemId);
      return;
    }
    
    setCartItems(currentItems =>
      currentItems.map(item =>
        item.id === itemId ? { ...item, quantity } : item
      )
    );
  };

  const getCartTotal = () => {
    return cartItems.reduce((total, item) => {
      const itemPrice = parseFloat(item.menuItem.price);
      const optionsPrice = item.selectedOptions.reduce((sum, opt) => {
        return sum + parseFloat(opt.priceAdjustment) * opt.quantity;
      }, 0);
      return total + (itemPrice + optionsPrice) * item.quantity;
    }, 0);
  };

  const getItemCount = () => {
    return cartItems.reduce((count, item) => count + item.quantity, 0);
  };

  // Handle direct add to order from ProductSelector
  const handleAddToOrder = (item: {
    menuItemId: string;
    quantity: number;
    price: string;
    notes: string;
    selectedOptions: Array<{
      optionId: string;
      optionGroupId: string;
      optionName: string;
      optionGroupName: string;
      priceAdjustment: string;
      quantity: number;
    }>;
    menuItem?: MenuItem;
  }) => {
    // Use the full MenuItem if provided, otherwise create a minimal one
    const menuItem = item.menuItem || {
      id: item.menuItemId,
      name: 'Item',
      price: item.price,
      restaurantId: table?.restaurantId || '',
      categoryId: '',
      description: item.notes || null,
      imageUrl: null,
      isAvailable: 1,
      preparationTime: null,
      hasOptions: item.selectedOptions.length > 0 ? 1 : 0,
      tags: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    } as MenuItem;
    
    // Convert to our cart format
    const selectedOptions: SelectedOption[] = item.selectedOptions.map(opt => ({
      optionId: opt.optionId,
      optionName: opt.optionName,
      optionGroupName: opt.optionGroupName,
      priceAdjustment: opt.priceAdjustment,
      quantity: opt.quantity,
    }));

    // Add to cart the specified quantity times
    for (let i = 0; i < item.quantity; i++) {
      addToCart(menuItem, selectedOptions);
    }

    toast({
      title: 'Item adicionado',
      description: `${item.quantity}x ${menuItem.name} adicionado ao carrinho`,
    });
  };

  // Add new guest mutation
  const addGuestMutation = useMutation({
    mutationFn: async (name: string) => {
      return apiRequest('POST', `/api/tables/${table?.id}/guests`, {
        name: name.trim() || undefined,
      });
    },
    onSuccess: (newGuest) => {
      queryClient.invalidateQueries({ queryKey: [`/api/tables/${table?.id}/guests`] });
      setSelectedGuest(newGuest.id);
      setShowNewGuestDialog(false);
      setNewGuestName('');
      toast({
        title: 'Cliente adicionado',
        description: 'Cliente adicionado à mesa com sucesso',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Erro',
        description: error.message || 'Não foi possível adicionar o cliente',
        variant: 'destructive',
      });
    },
  });

  // Create order mutation
  const createOrderMutation = useMutation({
    mutationFn: async () => {
      if (!table || cartItems.length === 0) return;

      const orderItems = cartItems.map(item => {
        const itemPrice = parseFloat(item.menuItem.price);
        const optionsPrice = item.selectedOptions.reduce((sum, opt) => {
          return sum + parseFloat(opt.priceAdjustment) * opt.quantity;
        }, 0);
        const totalPrice = (itemPrice + optionsPrice).toFixed(2);

        return {
          menuItemId: item.menuItem.id,
          quantity: item.quantity,
          price: totalPrice,
          selectedOptions: item.selectedOptions.map(opt => ({
            optionId: opt.optionId,
            optionName: opt.optionName,
            optionGroupName: opt.optionGroupName,
            priceAdjustment: opt.priceAdjustment,
            quantity: opt.quantity,
          })),
        };
      });

      return apiRequest('POST', '/api/orders', {
        restaurantId: currentUser?.restaurantId || table.restaurantId,
        tableId: table.id,
        orderType: 'mesa',
        guestId: selectedGuest,
        items: orderItems,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/orders'] });
      queryClient.invalidateQueries({ queryKey: ['/api/tables'] });
      queryClient.invalidateQueries({ queryKey: ['/api/tables/open'] });
      
      toast({
        title: 'Pedido criado',
        description: `Pedido de ${formatKwanza(getCartTotal())} criado com sucesso`,
      });
      
      setCartItems([]);
      setSelectedGuest(null);
      onOpenChange(false);
      onOrderCreated?.();
    },
    onError: (error: any) => {
      toast({
        title: 'Erro ao criar pedido',
        description: error.message || 'Não foi possível criar o pedido',
        variant: 'destructive',
      });
    },
  });

  const handleCreateOrder = () => {
    createOrderMutation.mutate();
  };

  if (!table) return null;

  const cartTotal = getCartTotal();
  const itemCount = getItemCount();
  const isProcessing = createOrderMutation.isPending || addGuestMutation.isPending;

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-5xl max-h-[90vh] flex flex-col">
          <DialogHeader>
            <div className="flex items-center justify-between">
              <DialogTitle className="flex items-center gap-2">
                <ShoppingCart className="w-5 h-5" />
                Novo Pedido - Mesa {table.number}
              </DialogTitle>
              {itemCount > 0 && (
                <Badge variant="secondary" className="text-base">
                  {itemCount} {itemCount === 1 ? 'item' : 'itens'} | {formatKwanza(cartTotal)}
                </Badge>
              )}
            </div>
          </DialogHeader>

          <div className="flex-1 grid grid-cols-1 lg:grid-cols-3 gap-4 overflow-hidden">
            {/* Products Section - 2/3 width */}
            <div className="lg:col-span-2 flex flex-col min-h-0">
              <ProductSelector
                onAddToOrder={handleAddToOrder}
                selectedItems={cartItems.map(item => item.menuItem.id)}
              />
            </div>

            {/* Cart Section - 1/3 width */}
            <div className="flex flex-col gap-4 min-h-0">
              {/* Guest Selection (Optional) */}
              <Collapsible open={showGuestSection} onOpenChange={setShowGuestSection}>
                <CollapsibleTrigger asChild>
                  <Button variant="outline" className="w-full justify-between">
                    <span className="flex items-center gap-2">
                      <Users className="w-4 h-4" />
                      Associar a cliente (opcional)
                    </span>
                    <ChevronDown className={`w-4 h-4 transition-transform ${showGuestSection ? 'rotate-180' : ''}`} />
                  </Button>
                </CollapsibleTrigger>
                <CollapsibleContent className="mt-2 space-y-2">
                  <Select value={selectedGuest || undefined} onValueChange={setSelectedGuest}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecionar cliente" />
                    </SelectTrigger>
                    <SelectContent>
                      {guests.map(guest => (
                        <SelectItem key={guest.id} value={guest.id}>
                          {guest.name || `Cliente ${guest.guestNumber}`}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full"
                    onClick={() => setShowNewGuestDialog(true)}
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Novo Cliente
                  </Button>
                </CollapsibleContent>
              </Collapsible>

              <Separator />

              {/* Cart Items */}
              <div className="flex-1 flex flex-col min-h-0">
                <h3 className="font-semibold mb-2">Carrinho</h3>
                {cartItems.length === 0 ? (
                  <div className="flex-1 flex items-center justify-center text-muted-foreground text-sm">
                    Nenhum item no carrinho
                  </div>
                ) : (
                  <ScrollArea className="flex-1">
                    <div className="space-y-2 pr-4">
                      {cartItems.map(item => {
                        const itemPrice = parseFloat(item.menuItem.price);
                        const optionsPrice = item.selectedOptions.reduce((sum, opt) => 
                          sum + parseFloat(opt.priceAdjustment) * opt.quantity, 0
                        );
                        const totalItemPrice = (itemPrice + optionsPrice) * item.quantity;

                        return (
                          <div key={item.id} className="border rounded-lg p-3 space-y-2">
                            <div className="flex justify-between items-start">
                              <div className="flex-1">
                                <h4 className="font-medium text-sm">{item.menuItem.name}</h4>
                                {item.selectedOptions.length > 0 && (
                                  <div className="text-xs text-muted-foreground mt-1">
                                    {item.selectedOptions.map(opt => (
                                      <div key={opt.optionId}>
                                        {opt.optionName} {opt.quantity > 1 && `x${opt.quantity}`}
                                      </div>
                                    ))}
                                  </div>
                                )}
                              </div>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => removeFromCart(item.id)}
                              >
                                <Trash2 className="w-4 h-4 text-destructive" />
                              </Button>
                            </div>
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                  disabled={item.quantity <= 1}
                                >
                                  <Minus className="w-3 h-3" />
                                </Button>
                                <span className="w-8 text-center font-medium">{item.quantity}</span>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                >
                                  <Plus className="w-3 h-3" />
                                </Button>
                              </div>
                              <span className="font-semibold">{formatKwanza(totalItemPrice)}</span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </ScrollArea>
                )}
              </div>
            </div>
          </div>

          <DialogFooter className="border-t pt-4">
            <div className="flex items-center justify-between w-full">
              <div className="text-left">
                <p className="text-sm text-muted-foreground">Total</p>
                <p className="text-2xl font-bold">{formatKwanza(cartTotal)}</p>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => onOpenChange(false)}>
                  Cancelar
                </Button>
                <Button
                  onClick={handleCreateOrder}
                  disabled={cartItems.length === 0 || isProcessing}
                >
                  {isProcessing ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Criando...
                    </>
                  ) : (
                    'Criar Pedido'
                  )}
                </Button>
              </div>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* New Guest Dialog */}
      <Dialog open={showNewGuestDialog} onOpenChange={setShowNewGuestDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Adicionar Cliente</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="guest-name">Nome (opcional)</Label>
              <Input
                id="guest-name"
                placeholder="Ex: João Silva"
                value={newGuestName}
                onChange={(e) => setNewGuestName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    addGuestMutation.mutate(newGuestName);
                  }
                }}
              />
              <p className="text-xs text-muted-foreground">
                Se não informar um nome, será gerado um número automático (Cliente 1, Cliente 2, etc.)
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowNewGuestDialog(false)}>
              Cancelar
            </Button>
            <Button
              onClick={() => addGuestMutation.mutate(newGuestName)}
              disabled={addGuestMutation.isPending}
            >
              {addGuestMutation.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Adicionando...
                </>
              ) : (
                'Adicionar'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Menu Item Options Dialog */}
      {selectedMenuItem && (
        <MenuItemOptionsDialog
          open={showOptionsDialog}
          onOpenChange={setShowOptionsDialog}
          menuItem={selectedMenuItem}
          onConfirm={handleOptionsConfirm}
        />
      )}
    </>
  );
}
