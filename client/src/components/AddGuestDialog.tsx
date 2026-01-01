import { useState } from 'react';
import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Search, UserPlus, Users } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import type { Customer } from '@shared/schema';
import { QUERY_KEYS } from '@/lib/queryKeys';
import { invalidateAfterGuestAdded } from '@/lib/tableInvalidations';

interface AddGuestDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  tableId: string;
  sessionId: string;
}

export function AddGuestDialog({ open, onOpenChange, tableId, sessionId }: AddGuestDialogProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<'search' | 'anonymous' | 'new'>('search');
  
  // Search existing customer
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  
  // Anonymous guest
  const [guestName, setGuestName] = useState('');
  
  // New customer
  const [newCustomerName, setNewCustomerName] = useState('');
  const [newCustomerPhone, setNewCustomerPhone] = useState('');
  const [newCustomerEmail, setNewCustomerEmail] = useState('');

  // Search customers
  const { data: searchResults = [] } = useQuery<Customer[]>({
    queryKey: ['/api/customers', { search: searchQuery }],
    enabled: searchQuery.length >= 2,
  });

  // Add guest mutation
  const addGuestMutation = useMutation({
    mutationFn: async (data: { customerId?: string; name?: string }) => {
      const response = await apiRequest('POST', `/api/tables/${tableId}/guests`, {
        sessionId,
        customerId: data.customerId,
        name: data.name,
      });
      return response.json();
    },
    onSuccess: () => {
      invalidateAfterGuestAdded(queryClient, tableId);
      toast({
        title: 'Pessoa adicionada',
        description: 'A pessoa foi adicionada à mesa com sucesso.',
      });
      onOpenChange(false);
      resetForm();
    },
    onError: (error: any) => {
      toast({
        title: 'Erro',
        description: error.message || 'Não foi possível adicionar a pessoa.',
        variant: 'destructive',
      });
    },
  });

  // Create customer and add as guest
  const createCustomerMutation = useMutation({
    mutationFn: async (data: { name: string; phone?: string; email?: string }) => {
      const customerResponse = await apiRequest('POST', '/api/customers', data);
      const customer = await customerResponse.json();
      
      const guestResponse = await apiRequest('POST', `/api/tables/${tableId}/guests`, {
        sessionId,
        customerId: customer.id,
        name: customer.name,
      });
      return guestResponse.json();
    },
    onSuccess: () => {
      invalidateAfterGuestAdded(queryClient, tableId);
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.customers.all() });
      toast({
        title: 'Cliente cadastrado',
        description: 'O cliente foi cadastrado e adicionado à mesa.',
      });
      onOpenChange(false);
      resetForm();
    },
    onError: (error: any) => {
      toast({
        title: 'Erro',
        description: error.message || 'Não foi possível cadastrar o cliente.',
        variant: 'destructive',
      });
    },
  });

  const resetForm = () => {
    setSearchQuery('');
    setSelectedCustomer(null);
    setGuestName('');
    setNewCustomerName('');
    setNewCustomerPhone('');
    setNewCustomerEmail('');
    setActiveTab('search');
  };

  const handleAddExistingCustomer = () => {
    if (!selectedCustomer) return;
    addGuestMutation.mutate({
      customerId: selectedCustomer.id,
      name: selectedCustomer.name,
    });
  };

  const handleAddAnonymousGuest = () => {
    if (!guestName.trim()) {
      toast({
        title: 'Nome obrigatório',
        description: 'Por favor, informe o nome do convidado.',
        variant: 'destructive',
      });
      return;
    }
    addGuestMutation.mutate({ name: guestName });
  };

  const handleCreateCustomer = () => {
    if (!newCustomerName.trim()) {
      toast({
        title: 'Nome obrigatório',
        description: 'Por favor, informe o nome do cliente.',
        variant: 'destructive',
      });
      return;
    }
    createCustomerMutation.mutate({
      name: newCustomerName,
      phone: newCustomerPhone || undefined,
      email: newCustomerEmail || undefined,
    });
  };

  const getTierColor = (tier: string) => {
    switch (tier) {
      case 'platina': return 'bg-purple-100 text-purple-700 border-purple-200';
      case 'ouro': return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      case 'prata': return 'bg-gray-100 text-gray-700 border-gray-200';
      default: return 'bg-orange-100 text-orange-700 border-orange-200';
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Adicionar Pessoa à Mesa</DialogTitle>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)} className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="search" className="flex items-center gap-2">
              <Search className="h-4 w-4" />
              Buscar Cliente
            </TabsTrigger>
            <TabsTrigger value="anonymous" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              Convidado
            </TabsTrigger>
            <TabsTrigger value="new" className="flex items-center gap-2">
              <UserPlus className="h-4 w-4" />
              Novo Cliente
            </TabsTrigger>
          </TabsList>

          <TabsContent value="search" className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="search">Buscar por nome ou telefone</Label>
              <Input
                id="search"
                type="text"
                placeholder="Digite para buscar..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                autoFocus
              />
            </div>

            {searchQuery.length >= 2 && (
              <ScrollArea className="h-[300px] rounded-md border">
                <div className="p-4 space-y-2">
                  {searchResults.length === 0 ? (
                    <p className="text-sm text-muted-foreground text-center py-8">
                      Nenhum cliente encontrado
                    </p>
                  ) : (
                    searchResults.map((customer) => (
                      <button
                        key={customer.id}
                        onClick={() => setSelectedCustomer(customer)}
                        className={`w-full p-3 rounded-lg border-2 transition-all text-left ${
                          selectedCustomer?.id === customer.id
                            ? 'border-primary bg-primary/5'
                            : 'border-border hover:border-primary/50'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <Avatar className="h-10 w-10">
                            <AvatarFallback className="bg-gradient-to-br from-orange-500 to-pink-500 text-white">
                              {customer.name.substring(0, 2).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <p className="font-medium truncate">{customer.name}</p>
                              <Badge variant="outline" className={getTierColor(customer.tier || 'bronze')}>
                                {customer.tier?.toUpperCase() || 'BRONZE'}
                              </Badge>
                            </div>
                            <div className="flex items-center gap-3 text-sm text-muted-foreground">
                              {customer.phone && <span>{customer.phone}</span>}
                              <span className="flex items-center gap-1">
                                <span className="text-xs">🏆</span>
                                {customer.loyaltyPoints} pts
                              </span>
                            </div>
                          </div>
                        </div>
                      </button>
                    ))
                  )}
                </div>
              </ScrollArea>
            )}

            <Button
              onClick={handleAddExistingCustomer}
              disabled={!selectedCustomer || addGuestMutation.isPending}
              className="w-full"
            >
              {addGuestMutation.isPending ? 'Adicionando...' : 'Adicionar Cliente Selecionado'}
            </Button>
          </TabsContent>

          <TabsContent value="anonymous" className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="guestName">Nome do convidado (opcional)</Label>
              <Input
                id="guestName"
                type="text"
                placeholder="Ex: João, Maria, Convidado..."
                value={guestName}
                onChange={(e) => setGuestName(e.target.value)}
                autoFocus
              />
              <p className="text-sm text-muted-foreground">
                Se não informar um nome, será criado como "Convidado X"
              </p>
            </div>

            <Button
              onClick={handleAddAnonymousGuest}
              disabled={addGuestMutation.isPending}
              className="w-full"
            >
              {addGuestMutation.isPending ? 'Adicionando...' : 'Adicionar Convidado Anônimo'}
            </Button>
          </TabsContent>

          <TabsContent value="new" className="space-y-4">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="newName">Nome *</Label>
                <Input
                  id="newName"
                  type="text"
                  placeholder="Nome completo"
                  value={newCustomerName}
                  onChange={(e) => setNewCustomerName(e.target.value)}
                  autoFocus
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="newPhone">Telefone</Label>
                <Input
                  id="newPhone"
                  type="tel"
                  placeholder="+244 9XX XXX XXX"
                  value={newCustomerPhone}
                  onChange={(e) => setNewCustomerPhone(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="newEmail">Email</Label>
                <Input
                  id="newEmail"
                  type="email"
                  placeholder="exemplo@email.com"
                  value={newCustomerEmail}
                  onChange={(e) => setNewCustomerEmail(e.target.value)}
                />
              </div>

              <p className="text-sm text-muted-foreground">
                O cliente será cadastrado no sistema e poderá acumular pontos de fidelidade.
              </p>
            </div>

            <Button
              onClick={handleCreateCustomer}
              disabled={createCustomerMutation.isPending}
              className="w-full"
            >
              {createCustomerMutation.isPending ? 'Cadastrando...' : 'Cadastrar e Adicionar à Mesa'}
            </Button>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
