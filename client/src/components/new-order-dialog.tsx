import { useState, useMemo, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Plus, Minus, X, ShoppingCart, Search, User, Phone, MapPin, UtensilsCrossed, Coffee } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { insertOrderSchema, type InsertOrder, type Customer } from "@shared/schema";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { indexedDB } from "@/lib/indexeddb";
import { formatKwanza } from "@/lib/formatters";

const newOrderFormSchema = insertOrderSchema.extend({
  orderType: z.enum(["mesa", "delivery", "takeout", "balcao", "pdv"]),
  paymentMethod: z.enum(["dinheiro", "multicaixa", "transferencia", "cartao"]).optional().nullable(),
  tableId: z.string().optional(),
});

type NewOrderForm = z.infer<typeof newOrderFormSchema>;

interface MenuItem {
  id: string;
  name: string;
  price: string;
  categoryId: string;
  description?: string;
  isAvailable: number | boolean | string;
  category: {
    id: string;
    name: string;
  } | null;
}

interface OrderItem {
  menuItemId: string;
  name: string;
  price: number;
  quantity: number;
}

interface NormalizedMenuItem extends Omit<MenuItem, 'isAvailable'> {
  isAvailable: boolean;
}

function normalizeMenuItem(item: MenuItem): NormalizedMenuItem {
  return {
    ...item,
    isAvailable: item.isAvailable === 1 || item.isAvailable === true || item.isAvailable === "1"
  };
}

interface NewOrderDialogProps {
  trigger?: React.ReactNode;
  restaurantId: string;
  onOrderCreated?: (orderId: string, isOnline: boolean) => void;
}

export function NewOrderDialog({ trigger, restaurantId, onOrderCreated }: NewOrderDialogProps) {
  const [open, setOpen] = useState(false);
  const [cart, setCart] = useState<OrderItem[]>([]);
  const [customerSearchOpen, setCustomerSearchOpen] = useState(false);
  const [customerSearchQuery, setCustomerSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [productSearchQuery, setProductSearchQuery] = useState("");
  const [receiptNumber, setReceiptNumber] = useState(Math.floor(Math.random() * 90000) + 10000);
  const { toast } = useToast();

  // Generate new receipt number when dialog opens
  useEffect(() => {
    if (open) {
      setReceiptNumber(Math.floor(Math.random() * 90000) + 10000);
    }
  }, [open]);

  const { data: rawMenuItems = [] } = useQuery<MenuItem[]>({
    queryKey: ["/api/menu-items"],
    enabled: open,
  });

  const menuItems: NormalizedMenuItem[] = rawMenuItems.map(normalizeMenuItem);

  const { data: tables = [] } = useQuery<{ id: string; number: number; status: string }[]>({
    queryKey: ["/api/tables"],
    enabled: open,
  });

  const { data: customers = [] } = useQuery<Customer[]>({
    queryKey: ["/api/customers"],
    enabled: open,
  });

  const form = useForm<NewOrderForm>({
    resolver: zodResolver(newOrderFormSchema),
    defaultValues: {
      restaurantId,
      orderType: "balcao",
      status: "pendente",
      customerName: "",
      customerPhone: "",
      deliveryAddress: "",
      orderNotes: "",
      paymentMethod: "dinheiro" as const,
      discount: undefined,
      discountType: undefined,
      serviceCharge: undefined,
      deliveryFee: undefined,
      customerId: undefined,
      tableId: undefined,
      tableSessionId: undefined,
      couponId: undefined,
    },
  });

  const orderType = form.watch("orderType");

  // Get categories with item counts
  const categories = useMemo(() => {
    const categoryMap = new Map<string, { id: string; name: string; count: number; availableCount: number }>();
    
    menuItems.forEach(item => {
      if (item.category) {
        const existing = categoryMap.get(item.category.id);
        if (existing) {
          existing.count++;
          if (item.isAvailable) existing.availableCount++;
        } else {
          categoryMap.set(item.category.id, {
            id: item.category.id,
            name: item.category.name,
            count: 1,
            availableCount: item.isAvailable ? 1 : 0,
          });
        }
      }
    });
    
    return Array.from(categoryMap.values());
  }, [menuItems]);

  // Filter products by category and search
  const filteredProducts = useMemo(() => {
    let filtered = menuItems;
    
    if (selectedCategory) {
      filtered = filtered.filter(item => item.category?.id === selectedCategory);
    }
    
    if (productSearchQuery) {
      const query = productSearchQuery.toLowerCase();
      filtered = filtered.filter(item => 
        item.name.toLowerCase().includes(query) ||
        item.category?.name.toLowerCase().includes(query)
      );
    }
    
    return filtered;
  }, [menuItems, selectedCategory, productSearchQuery]);

  const createOrderMutation = useMutation({
    mutationFn: async (data: InsertOrder) => {
      const isOnline = typeof navigator !== 'undefined' && navigator.onLine;
      
      const orderItems = cart.map(item => ({
        menuItemId: item.menuItemId,
        quantity: item.quantity,
        price: item.price.toString(),
        notes: "",
        selectedOptions: [],
      }));
      
      if (isOnline) {
        const response = await apiRequest("POST", "/api/orders", {
          ...data,
          items: orderItems,
        });
        return await response.json();
      } else {
        const orderId = crypto.randomUUID();
        const now = new Date().toISOString();
        const itemsWithOrderId = orderItems.map(item => {
          const cartItem = cart.find(c => c.menuItemId === item.menuItemId);
          const menuItemData = rawMenuItems.find(m => m.id === item.menuItemId);
          return {
            ...item,
            orderId,
            id: crypto.randomUUID(),
            price: parseFloat(item.price),
            menuItem: menuItemData ? {
              id: menuItemData.id,
              name: menuItemData.name,
              price: parseFloat(menuItemData.price),
              description: menuItemData.description || '',
              categoryId: menuItemData.categoryId,
              isAvailable: menuItemData.isAvailable === 1 || menuItemData.isAvailable === true,
              category: menuItemData.category || null,
            } : {
              id: item.menuItemId,
              name: cartItem?.name || 'Item',
              price: parseFloat(item.price),
              description: '',
              categoryId: '',
              isAvailable: true,
              category: null,
            }
          };
        });
        
        const itemsTotal = itemsWithOrderId.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        
        const offlineOrder = { 
          ...data,
          id: orderId,
          orderNumber: Math.floor(Math.random() * 9000) + 1000,
          createdAt: now,
          updatedAt: now,
          totalAmount: itemsTotal,
          discount: data.discount ? parseFloat(data.discount) : null,
          serviceCharge: data.serviceCharge ? parseFloat(data.serviceCharge) : null,
          deliveryFee: data.deliveryFee ? parseFloat(data.deliveryFee) : null,
          paidAmount: "0",
          paymentStatus: "nao_pago",
          orderItems: itemsWithOrderId,
          isSynced: false,
          table: data.tableId ? tables.find(t => t.id === data.tableId) || null : null
        } as any;
        await indexedDB.saveOrder(offlineOrder);
        await indexedDB.saveOrderItems(itemsWithOrderId as any);
        return offlineOrder;
      }
    },
    onSuccess: (data) => {
      const isOnline = typeof navigator !== 'undefined' && navigator.onLine;
      
      if (!isOnline && data?.id) {
        queryClient.setQueryData(["/api/orders", data.id], data);
        
        const currentOrders = queryClient.getQueryData(["/api/orders"]) as any[] || [];
        queryClient.setQueryData(["/api/orders"], [data, ...currentOrders]);
      } else {
        queryClient.invalidateQueries({ queryKey: ["/api/orders"] });
      }
      
      if (!isOnline) {
        toast({
          title: "Pedido criado offline",
          description: "O pedido será sincronizado quando houver conexão.",
        });
      } else {
        toast({
          title: "Pedido criado",
          description: "O pedido foi criado com sucesso.",
        });
      }
      
      if (onOrderCreated && data?.id) {
        onOrderCreated(data.id, isOnline);
      }
      
      setOpen(false);
      setCart([]);
      form.reset();
      setSelectedCategory(null);
      setProductSearchQuery("");
    },
    onError: () => {
      toast({
        title: "Erro",
        description: "Não foi possível criar o pedido.",
        variant: "destructive",
      });
    },
  });

  const addToCart = (item: MenuItem) => {
    const existing = cart.find((i) => i.menuItemId === item.id);
    if (existing) {
      setCart(cart.map((i) => 
        i.menuItemId === item.id 
          ? { ...i, quantity: i.quantity + 1 } 
          : i
      ));
    } else {
      setCart([...cart, {
        menuItemId: item.id,
        name: item.name,
        price: parseFloat(item.price),
        quantity: 1,
      }]);
    }
  };

  const removeFromCart = (menuItemId: string) => {
    setCart(cart.filter((i) => i.menuItemId !== menuItemId));
  };

  const updateQuantity = (menuItemId: string, delta: number) => {
    setCart(cart.map((i) => {
      if (i.menuItemId === menuItemId) {
        const newQuantity = Math.max(0, i.quantity + delta);
        return newQuantity === 0 ? null : { ...i, quantity: newQuantity };
      }
      return i;
    }).filter(Boolean) as OrderItem[]);
  };

  const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const tax = subtotal * 0.1; // 10% tax
  const totalAmount = subtotal + tax;

  const filteredCustomers = customers.filter(customer => {
    const searchLower = customerSearchQuery.toLowerCase();
    return (
      customer.name.toLowerCase().includes(searchLower) ||
      customer.phone?.toLowerCase().includes(searchLower) ||
      customer.email?.toLowerCase().includes(searchLower)
    );
  });

  const selectCustomer = (customer: Customer) => {
    form.setValue("customerId", customer.id);
    form.setValue("customerName", customer.name);
    form.setValue("customerPhone", customer.phone || "");
    if (orderType === "delivery") {
      form.setValue("deliveryAddress", customer.address || "");
    }
    setCustomerSearchOpen(false);
    setCustomerSearchQuery("");
  };

  const onSubmit = (data: NewOrderForm) => {
    if (cart.length === 0) {
      toast({
        title: "Carrinho vazio",
        description: "Adicione itens ao pedido antes de finalizar.",
        variant: "destructive",
      });
      return;
    }

    const orderData: InsertOrder = {
      ...data,
      isSynced: typeof navigator !== 'undefined' && navigator.onLine ? 1 : 0,
    };

    createOrderMutation.mutate(orderData);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button data-testid="button-new-order" size="default">
            <Plus className="h-4 w-4" />
            Novo Pedido
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-7xl max-h-[95vh] overflow-hidden flex flex-col p-0">
        <DialogHeader className="px-6 pt-6 pb-4">
          <DialogTitle className="text-2xl">Novo Pedido</DialogTitle>
        </DialogHeader>
        
        <div className="flex gap-6 flex-1 overflow-hidden px-6 pb-6">
          {/* Left Side - Products */}
          <div className="flex-1 flex flex-col gap-4 overflow-hidden">
            {/* Search Bar */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Pesquisar produtos..."
                value={productSearchQuery}
                onChange={(e) => setProductSearchQuery(e.target.value)}
                className="pl-10"
                data-testid="input-product-search"
              />
            </div>

            {/* Categories */}
            <div className="flex gap-2 flex-wrap">
              <Button
                variant={selectedCategory === null ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedCategory(null)}
                data-testid="category-all"
                className="gap-2"
              >
                <UtensilsCrossed className="h-4 w-4" />
                Todos
                <Badge variant="secondary" className="ml-1">
                  {menuItems.length}
                </Badge>
              </Button>
              {categories.map((category) => (
                <Button
                  key={category.id}
                  variant={selectedCategory === category.id ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedCategory(category.id)}
                  data-testid={`category-${category.id}`}
                  className="gap-2"
                >
                  <Coffee className="h-4 w-4" />
                  {category.name}
                  <Badge variant="secondary" className="ml-1">
                    {category.count}
                  </Badge>
                </Button>
              ))}
            </div>

            {/* Products Grid */}
            <ScrollArea className="flex-1">
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 pr-4">
                {filteredProducts.map((item) => (
                  <Card 
                    key={item.id} 
                    className={`hover-elevate cursor-pointer ${!item.isAvailable ? 'opacity-50' : ''}`}
                    onClick={() => item.isAvailable && addToCart(item)}
                    data-testid={`card-menu-item-${item.id}`}
                  >
                    <CardContent className="p-4">
                      <div className="flex flex-col gap-3">
                        {/* Product Image Placeholder */}
                        <div className="aspect-square bg-muted rounded-md flex items-center justify-center">
                          <Coffee className="h-12 w-12 text-muted-foreground" />
                        </div>
                        
                        {/* Product Info */}
                        <div className="space-y-2">
                          <div>
                            <p className="font-semibold text-sm line-clamp-2">{item.name}</p>
                            <p className="text-xs text-muted-foreground">{item.category?.name}</p>
                          </div>
                          
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-lg">{formatKwanza(item.price)}</span>
                            <Button
                              size="icon"
                              variant="default"
                              className="h-8 w-8 rounded-full"
                              onClick={(e) => {
                                e.stopPropagation();
                                if (item.isAvailable) addToCart(item);
                              }}
                              disabled={!item.isAvailable}
                              data-testid={`button-add-${item.id}`}
                            >
                              <Plus className="h-4 w-4" />
                            </Button>
                          </div>
                          
                          {!item.isAvailable && (
                            <Badge variant="destructive" className="w-full justify-center">
                              Indisponível
                            </Badge>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </ScrollArea>
          </div>

          {/* Right Side - Checkout */}
          <div className="w-96 flex flex-col gap-4 overflow-hidden">
            <Card className="flex-1 flex flex-col overflow-hidden">
              <CardContent className="p-4 flex flex-col gap-4 flex-1 overflow-hidden">
                {/* Receipt Header */}
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-lg">Recibo</h3>
                  <Badge variant="outline">#{receiptNumber}</Badge>
                </div>

                <Separator />

                {/* Order Type Selection */}
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-4 flex-1 overflow-hidden">
                    <FormField
                      control={form.control}
                      name="orderType"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Tipo de Pedido</FormLabel>
                          <div className="grid grid-cols-3 gap-2">
                            <Button
                              type="button"
                              variant={field.value === "balcao" ? "default" : "outline"}
                              size="sm"
                              onClick={() => field.onChange("balcao")}
                              data-testid="order-type-balcao"
                              className="h-auto py-2 px-2 text-xs"
                            >
                              Balcão
                            </Button>
                            <Button
                              type="button"
                              variant={field.value === "delivery" ? "default" : "outline"}
                              size="sm"
                              onClick={() => field.onChange("delivery")}
                              data-testid="order-type-delivery"
                              className="h-auto py-2 px-2 text-xs"
                            >
                              Delivery
                            </Button>
                            <Button
                              type="button"
                              variant={field.value === "mesa" ? "default" : "outline"}
                              size="sm"
                              onClick={() => field.onChange("mesa")}
                              data-testid="order-type-mesa"
                              className="h-auto py-2 px-2 text-xs"
                            >
                              Mesa
                            </Button>
                          </div>
                        </FormItem>
                      )}
                    />

                    {/* Customer Name and Table */}
                    <div className="grid grid-cols-2 gap-2">
                      <FormField
                        control={form.control}
                        name="customerName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-xs">Nome</FormLabel>
                            <div className="flex gap-1">
                              <FormControl>
                                <Input 
                                  data-testid="input-customer-name" 
                                  {...field} 
                                  value={field.value || ""} 
                                  placeholder="Cliente"
                                  className="h-9 text-sm"
                                />
                              </FormControl>
                              <Popover open={customerSearchOpen} onOpenChange={setCustomerSearchOpen}>
                                <PopoverTrigger asChild>
                                  <Button 
                                    type="button" 
                                    variant="outline" 
                                    size="icon"
                                    className="h-9 w-9 flex-shrink-0"
                                    data-testid="button-search-customer"
                                  >
                                    <Search className="h-3 w-3" />
                                  </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-80 p-0" align="start">
                                  <Command>
                                    <CommandInput 
                                      placeholder="Buscar cliente..." 
                                      value={customerSearchQuery}
                                      onValueChange={setCustomerSearchQuery}
                                    />
                                    <CommandList>
                                      <CommandEmpty>Nenhum cliente encontrado.</CommandEmpty>
                                      <CommandGroup>
                                        <ScrollArea className="h-64">
                                          {filteredCustomers.map((customer) => (
                                            <CommandItem
                                              key={customer.id}
                                              onSelect={() => selectCustomer(customer)}
                                              className="flex flex-col items-start gap-1 p-3 cursor-pointer"
                                              data-testid={`customer-item-${customer.id}`}
                                            >
                                              <div className="flex items-center gap-2 w-full">
                                                <User className="h-4 w-4 text-primary flex-shrink-0" />
                                                <span className="font-medium">{customer.name}</span>
                                              </div>
                                              {customer.phone && (
                                                <div className="flex items-center gap-2 w-full text-sm text-muted-foreground ml-6">
                                                  <Phone className="h-3 w-3" />
                                                  <span>{customer.phone}</span>
                                                </div>
                                              )}
                                            </CommandItem>
                                          ))}
                                        </ScrollArea>
                                      </CommandGroup>
                                    </CommandList>
                                  </Command>
                                </PopoverContent>
                              </Popover>
                            </div>
                          </FormItem>
                        )}
                      />

                      {orderType === "mesa" ? (
                        <FormField
                          control={form.control}
                          name="tableId"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-xs">Mesa</FormLabel>
                              <Select onValueChange={field.onChange} value={field.value}>
                                <FormControl>
                                  <SelectTrigger data-testid="select-table" className="h-9 text-sm">
                                    <SelectValue placeholder="Mesa" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  {tables.filter(t => t.status === "livre").map((table) => (
                                    <SelectItem key={table.id} value={table.id}>
                                      Mesa {table.number}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </FormItem>
                          )}
                        />
                      ) : (
                        <FormField
                          control={form.control}
                          name="customerPhone"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-xs">Telefone</FormLabel>
                              <FormControl>
                                <Input 
                                  data-testid="input-customer-phone" 
                                  {...field} 
                                  value={field.value || ""} 
                                  placeholder="Telefone"
                                  className="h-9 text-sm"
                                />
                              </FormControl>
                            </FormItem>
                          )}
                        />
                      )}
                    </div>

                    {orderType === "delivery" && (
                      <FormField
                        control={form.control}
                        name="deliveryAddress"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-xs">Endereço</FormLabel>
                            <FormControl>
                              <Textarea 
                                data-testid="input-delivery-address" 
                                {...field} 
                                value={field.value || ""}
                                placeholder="Endereço de entrega"
                                className="text-sm resize-none"
                                rows={2}
                              />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                    )}

                    <Separator />

                    {/* Order List */}
                    <div className="space-y-2">
                      <h4 className="text-sm font-semibold">Lista de Itens</h4>
                      <ScrollArea className="flex-1 max-h-48">
                        <div className="space-y-2 pr-4">
                          {cart.length === 0 ? (
                            <p className="text-sm text-muted-foreground text-center py-8">
                              Nenhum item adicionado
                            </p>
                          ) : (
                            cart.map((item) => (
                              <Card key={item.menuItemId} data-testid={`cart-item-${item.menuItemId}`}>
                                <CardContent className="p-3">
                                  <div className="flex items-start justify-between gap-2 mb-2">
                                    <div className="flex-1 min-w-0">
                                      <p className="font-medium text-sm truncate">{item.name}</p>
                                      <p className="text-xs text-muted-foreground">
                                        {formatKwanza(item.price)} × {item.quantity}
                                      </p>
                                    </div>
                                    <span className="font-bold text-sm whitespace-nowrap">
                                      {formatKwanza(item.price * item.quantity)}
                                    </span>
                                  </div>
                                  
                                  <div className="flex items-center gap-2">
                                    <Button
                                      type="button"
                                      size="icon"
                                      variant="outline"
                                      className="h-7 w-7"
                                      onClick={() => updateQuantity(item.menuItemId, -1)}
                                      data-testid={`button-decrease-${item.menuItemId}`}
                                    >
                                      <Minus className="h-3 w-3" />
                                    </Button>
                                    <span className="text-sm font-medium w-8 text-center">{item.quantity}</span>
                                    <Button
                                      type="button"
                                      size="icon"
                                      variant="outline"
                                      className="h-7 w-7"
                                      onClick={() => updateQuantity(item.menuItemId, 1)}
                                      data-testid={`button-increase-${item.menuItemId}`}
                                    >
                                      <Plus className="h-3 w-3" />
                                    </Button>
                                    <Button
                                      type="button"
                                      size="icon"
                                      variant="ghost"
                                      className="h-7 w-7 ml-auto"
                                      onClick={() => removeFromCart(item.menuItemId)}
                                      data-testid={`button-remove-${item.menuItemId}`}
                                    >
                                      <X className="h-3 w-3" />
                                    </Button>
                                  </div>
                                </CardContent>
                              </Card>
                            ))
                          )}
                        </div>
                      </ScrollArea>
                    </div>

                    <Separator />

                    {/* Order Notes */}
                    <FormField
                      control={form.control}
                      name="orderNotes"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-xs">Observações</FormLabel>
                          <FormControl>
                            <Textarea 
                              data-testid="input-order-notes" 
                              {...field} 
                              value={field.value || ""}
                              placeholder="Observações do pedido..."
                              className="text-sm resize-none"
                              rows={2}
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />

                    <Separator />

                    {/* Payment Details */}
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Subtotal</span>
                        <span className="font-medium" data-testid="text-subtotal">{formatKwanza(subtotal)}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Taxa (10%)</span>
                        <span className="font-medium" data-testid="text-tax">{formatKwanza(tax)}</span>
                      </div>
                      <Separator />
                      <div className="flex justify-between text-lg font-bold">
                        <span>Total</span>
                        <span data-testid="text-total">{formatKwanza(totalAmount)}</span>
                      </div>
                    </div>

                    {/* Payment Method */}
                    <FormField
                      control={form.control}
                      name="paymentMethod"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-xs">Método de Pagamento</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value || undefined}>
                            <FormControl>
                              <SelectTrigger data-testid="select-payment-method" className="h-9">
                                <SelectValue placeholder="Selecionar" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="dinheiro">Dinheiro</SelectItem>
                              <SelectItem value="multicaixa">Multicaixa</SelectItem>
                              <SelectItem value="transferencia">Transferência</SelectItem>
                              <SelectItem value="cartao">Cartão</SelectItem>
                            </SelectContent>
                          </Select>
                        </FormItem>
                      )}
                    />

                    {/* Submit Button */}
                    <Button 
                      type="submit" 
                      disabled={createOrderMutation.isPending || cart.length === 0}
                      data-testid="button-submit-order"
                      className="w-full"
                      size="lg"
                    >
                      <ShoppingCart className="h-4 w-4 mr-2" />
                      {createOrderMutation.isPending ? "Processando..." : `Finalizar ${formatKwanza(totalAmount)}`}
                    </Button>
                  </form>
                </Form>
              </CardContent>
            </Card>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
