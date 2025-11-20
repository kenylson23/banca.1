import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Plus, Minus, X, ShoppingCart, Search, User, Phone, MapPin } from "lucide-react";
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
  const { toast } = useToast();

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
    },
  });

  const orderType = form.watch("orderType");

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
      
      console.log('Order created successfully:', { orderId: data?.id, isOnline, hasCallback: !!onOrderCreated });
      
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
        console.log('Calling onOrderCreated callback with orderId:', data.id);
        onOrderCreated(data.id, isOnline);
      } else {
        console.warn('onOrderCreated not called:', { hasCallback: !!onOrderCreated, hasOrderId: !!data?.id });
      }
      
      setOpen(false);
      setCart([]);
      form.reset();
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

  const totalAmount = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  const filteredCustomers = customers.filter(customer => {
    const searchLower = customerSearchQuery.toLowerCase();
    return (
      customer.name.toLowerCase().includes(searchLower) ||
      customer.phone?.toLowerCase().includes(searchLower) ||
      customer.email?.toLowerCase().includes(searchLower)
    );
  });

  const selectCustomer = (customer: Customer) => {
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
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle>Novo Pedido</DialogTitle>
        </DialogHeader>
        
        <div className="flex gap-4 flex-1 overflow-hidden">
          <div className="flex-1 flex flex-col gap-4 overflow-hidden">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-4 flex-1 overflow-hidden">
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                    control={form.control}
                    name="orderType"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Tipo de Pedido</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger data-testid="select-order-type">
                              <SelectValue placeholder="Selecione o tipo" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="balcao">Balcão</SelectItem>
                            <SelectItem value="pdv">PDV</SelectItem>
                            <SelectItem value="mesa">Mesa</SelectItem>
                            <SelectItem value="delivery">Delivery</SelectItem>
                            <SelectItem value="takeout">Takeout</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {orderType === "mesa" && (
                    <FormField
                      control={form.control}
                      name="tableId"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Mesa</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                              <SelectTrigger data-testid="select-table">
                                <SelectValue placeholder="Selecione a mesa" />
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
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  )}

                  <FormField
                    control={form.control}
                    name="paymentMethod"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Método de Pagamento</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value || undefined}>
                          <FormControl>
                            <SelectTrigger data-testid="select-payment-method">
                              <SelectValue placeholder="Selecione o método" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="dinheiro">Dinheiro</SelectItem>
                            <SelectItem value="multicaixa">Multicaixa</SelectItem>
                            <SelectItem value="transferencia">Transferência</SelectItem>
                            <SelectItem value="cartao">Cartão</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {(orderType === "delivery" || orderType === "takeout") && (
                  <div className="space-y-4">
                    <div className="flex items-end gap-2">
                      <FormField
                        control={form.control}
                        name="customerName"
                        render={({ field }) => (
                          <FormItem className="flex-1">
                            <FormLabel>Nome do Cliente</FormLabel>
                            <FormControl>
                              <Input data-testid="input-customer-name" {...field} value={field.value || ""} placeholder="Digite o nome" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <Popover open={customerSearchOpen} onOpenChange={setCustomerSearchOpen}>
                        <PopoverTrigger asChild>
                          <Button 
                            type="button" 
                            variant="outline" 
                            size="icon"
                            data-testid="button-search-customer"
                          >
                            <Search className="h-4 w-4" />
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-96 p-0" align="start">
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
                                      {customer.address && (
                                        <div className="flex items-center gap-2 w-full text-sm text-muted-foreground ml-6">
                                          <MapPin className="h-3 w-3" />
                                          <span className="truncate">{customer.address}</span>
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

                    <FormField
                      control={form.control}
                      name="customerPhone"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Telefone</FormLabel>
                          <FormControl>
                            <Input data-testid="input-customer-phone" {...field} value={field.value || ""} placeholder="+244 900 000 000" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                )}

                {orderType === "delivery" && (
                  <FormField
                    control={form.control}
                    name="deliveryAddress"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Endereço de Entrega</FormLabel>
                        <FormControl>
                          <Textarea data-testid="input-delivery-address" {...field} value={field.value || ""} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}

                <FormField
                  control={form.control}
                  name="orderNotes"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Observações</FormLabel>
                      <FormControl>
                        <Textarea data-testid="input-order-notes" {...field} value={field.value || ""} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <ScrollArea className="flex-1">
                  <div className="space-y-2">
                    <h3 className="text-sm font-medium">Produtos Disponíveis</h3>
                    <div className="grid grid-cols-2 gap-2">
                      {menuItems.filter(item => item.isAvailable).map((item) => (
                        <Card 
                          key={item.id} 
                          className="hover-elevate cursor-pointer" 
                          onClick={() => addToCart(item)}
                          data-testid={`card-menu-item-${item.id}`}
                        >
                          <CardContent className="p-3">
                            <div className="flex justify-between items-start gap-2">
                              <div className="flex-1 min-w-0">
                                <p className="font-medium text-sm truncate">{item.name}</p>
                                <p className="text-xs text-muted-foreground">{item.category?.name ?? "Sem categoria"}</p>
                              </div>
                              <Badge variant="secondary">
                                {formatKwanza(item.price)}
                              </Badge>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </div>
                </ScrollArea>

                <div className="flex gap-2">
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => setOpen(false)}
                    data-testid="button-cancel"
                  >
                    Cancelar
                  </Button>
                  <Button 
                    type="submit" 
                    disabled={createOrderMutation.isPending || cart.length === 0}
                    data-testid="button-submit-order"
                    className="flex-1"
                  >
                    {createOrderMutation.isPending ? "Criando..." : "Finalizar Pedido"}
                  </Button>
                </div>
              </form>
            </Form>
          </div>

          <div className="w-80 flex flex-col gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-4">
                  <ShoppingCart className="h-5 w-5" />
                  <h3 className="font-semibold">Carrinho</h3>
                  <Badge variant="secondary" className="ml-auto">
                    {cart.length} {cart.length === 1 ? 'item' : 'itens'}
                  </Badge>
                </div>

                <ScrollArea className="h-64">
                  <div className="space-y-2">
                    {cart.length === 0 ? (
                      <p className="text-sm text-muted-foreground text-center py-8">
                        Carrinho vazio
                      </p>
                    ) : (
                      cart.map((item) => (
                        <div key={item.menuItemId} className="flex flex-col gap-2 p-2 rounded-md bg-muted/50">
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium truncate">{item.name}</p>
                              <p className="text-xs text-muted-foreground">
                                {formatKwanza(item.price)}
                              </p>
                            </div>
                            <Button
                              size="icon"
                              variant="ghost"
                              onClick={() => removeFromCart(item.menuItemId)}
                              data-testid={`button-remove-${item.menuItemId}`}
                              className="h-6 w-6"
                            >
                              <X className="h-3 w-3" />
                            </Button>
                          </div>
                          <div className="flex items-center gap-2">
                            <Button
                              size="icon"
                              variant="outline"
                              onClick={() => updateQuantity(item.menuItemId, -1)}
                              data-testid={`button-decrease-${item.menuItemId}`}
                              className="h-7 w-7"
                            >
                              <Minus className="h-3 w-3" />
                            </Button>
                            <span className="text-sm font-medium w-8 text-center" data-testid={`quantity-${item.menuItemId}`}>
                              {item.quantity}
                            </span>
                            <Button
                              size="icon"
                              variant="outline"
                              onClick={() => updateQuantity(item.menuItemId, 1)}
                              data-testid={`button-increase-${item.menuItemId}`}
                              className="h-7 w-7"
                            >
                              <Plus className="h-3 w-3" />
                            </Button>
                            <span className="text-sm ml-auto font-medium" data-testid={`subtotal-${item.menuItemId}`}>
                              {formatKwanza(item.price * item.quantity)}
                            </span>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </ScrollArea>

                <Separator className="my-4" />

                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Subtotal</span>
                    <span data-testid="text-subtotal">{formatKwanza(totalAmount)}</span>
                  </div>
                  <div className="flex justify-between font-semibold text-lg">
                    <span>Total</span>
                    <span data-testid="text-total">{formatKwanza(totalAmount)}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
