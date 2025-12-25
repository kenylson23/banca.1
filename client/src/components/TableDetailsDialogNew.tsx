import { useState, useEffect } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { 
  Users,
  Clock,
  Receipt,
  Plus,
  MoreVertical,
  X,
  ArrowLeft,
  ArrowRight,
  ShoppingBag,
  CreditCard,
  UserPlus,
  Split,
  TrendingUp,
  RefreshCw,
  ChevronDown,
  Trash2,
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { useLocation } from 'wouter';
import { formatKwanza } from '@/lib/formatters';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import type { Table, Order, OrderItem, MenuItem } from '@shared/schema';
import { TableOrderDialog } from '@/components/tables/TableOrderDialog';
import { TableCheckoutDialog } from '@/components/tables/TableCheckoutDialog';
import { OrderDetailsDialog } from '@/components/order-details-dialog';
import { BillSplitPanel } from '@/components/BillSplitPanel';
import QRCode from 'qrcode';

interface TableDetailsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  table: (Table & { orders?: any[] }) | null;
  onDelete?: (tableId: string) => void;
  allTables?: Table[];
  onNavigate?: (table: Table) => void;
}

const getStatusLabel = (status: string) => {
  const labels: Record<string, string> = {
    livre: 'Disponível',
    ocupada: 'Ocupada',
    em_andamento: 'Em Andamento',
    aguardando_pagamento: 'Aguardando Pagamento',
    encerrada: 'Encerrada',
  };
  return labels[status] || status;
};

const getStatusColor = (status: string) => {
  const colors: Record<string, string> = {
    livre: 'bg-green-100 text-green-700 border-green-300',
    ocupada: 'bg-blue-100 text-blue-700 border-blue-300',
    em_andamento: 'bg-amber-100 text-amber-700 border-amber-300',
    aguardando_pagamento: 'bg-orange-100 text-orange-700 border-orange-300',
    encerrada: 'bg-gray-100 text-gray-700 border-gray-300',
  };
  return colors[status] || 'bg-gray-100 text-gray-700';
};

export function TableDetailsDialogNew({ open, onOpenChange, table, onDelete, allTables = [], onNavigate }: TableDetailsDialogProps) {
  const { toast } = useToast();
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  const [customerName, setCustomerName] = useState('');
  const [selectedPeopleCount, setSelectedPeopleCount] = useState<number | null>(null);
  const [customPeopleCount, setCustomPeopleCount] = useState('');
  const [showCustomCount, setShowCustomCount] = useState(false);
  const [showEndSessionDialog, setShowEndSessionDialog] = useState(false);
  const [showNewOrderDialog, setShowNewOrderDialog] = useState(false);
  const [showCheckoutDialog, setShowCheckoutDialog] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const [orderDetailsOpen, setOrderDetailsOpen] = useState(false);
  const [addingGuest, setAddingGuest] = useState(false);
  const [newGuestName, setNewGuestName] = useState('');
  const [guestsExpanded, setGuestsExpanded] = useState(false);
  const [splitExpanded, setSplitExpanded] = useState(false);
  const [customerPhone, setCustomerPhone] = useState('');
  const [specialOccasion, setSpecialOccasion] = useState<string | null>(null);
  const [showQRSelfRegister, setShowQRSelfRegister] = useState(false);
  const [showAdvancedOptions, setShowAdvancedOptions] = useState(false);
  const [qrCodeUrl, setQrCodeUrl] = useState<string>('');

  const authUser = user;
  const isSuperadmin = authUser?.role === 'superadmin';

  // Generate QR Code when dialog opens
  useEffect(() => {
    if (showQRSelfRegister && table) {
      const url = `${window.location.origin}/guest-register/${table.id}`;
      QRCode.toDataURL(url, {
        width: 300,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#FFFFFF',
        },
      })
        .then(setQrCodeUrl)
        .catch((err) => {
          console.error('Error generating QR Code:', err);
          toast({
            title: 'Erro ao gerar QR Code',
            description: 'Não foi possível gerar o QR Code.',
            variant: 'destructive',
          });
        });
    }
  }, [showQRSelfRegister, table, toast]);

  // Query guests
  const { data: guests = [] } = useQuery<Array<{ id: string; name: string | null; seatNumber: number; status: string }>>({
    queryKey: [`/api/tables/${table?.id}/guests`],
    enabled: !!table?.id && table?.status !== 'livre',
  });

  // Navigation
  const currentIndex = allTables.findIndex(t => t.id === table?.id);
  const hasPrevious = currentIndex > 0;
  const hasNext = currentIndex < allTables.length - 1;

  const handlePrevious = () => {
    if (hasPrevious && onNavigate) {
      onNavigate(allTables[currentIndex - 1]);
    }
  };

  const handleNext = () => {
    if (hasNext && onNavigate) {
      onNavigate(allTables[currentIndex + 1]);
    }
  };

  // Create guest mutation
  const createGuestMutation = useMutation({
    mutationFn: async ({ tableId, guestName }: { tableId: string; guestName?: string }) => {
      if (!table?.currentSessionId) {
        throw new Error('Mesa não tem sessão ativa');
      }
      const response = await apiRequest('POST', `/api/tables/${tableId}/guests`, {
        name: guestName,
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/tables/${table?.id}/guests`] });
      queryClient.invalidateQueries({ queryKey: ['/api/tables/with-orders'] });
      toast({ title: 'Pessoa adicionada', description: 'Cliente adicionado à mesa com sucesso.' });
      setAddingGuest(false);
      setNewGuestName('');
    },
    onError: (error: any) => {
      toast({
        title: 'Erro ao adicionar pessoa',
        description: error.message || 'Não foi possível adicionar a pessoa.',
        variant: 'destructive',
      });
    },
  });

  // Start session mutation
  const startSessionMutation = useMutation({
    mutationFn: async () => {
      const count = selectedPeopleCount || parseInt(customPeopleCount) || 1;
      const response = await apiRequest('POST', `/api/tables/${table?.id}/start-session`, {
        customerName: customerName.trim() || undefined,
        customerCount: count,
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/tables/with-orders'] });
      queryClient.invalidateQueries({ queryKey: [`/api/tables/${table?.id}/guests`] });
      
      const count = selectedPeopleCount || parseInt(customPeopleCount) || 1;
      const hasName = customerName.trim().length > 0;
      
      if (hasName && count > 1) {
        // If customer name was provided and there are more people
        toast({ 
          title: '✅ Mesa ocupada', 
          description: `${customerName} foi cadastrado. Você informou ${count} pessoas - deseja cadastrar as outras ${count - 1}?`,
        });
        setGuestsExpanded(true);
        setAddingGuest(true);
      } else if (hasName) {
        // Only 1 person with name
        toast({ 
          title: '✅ Mesa ocupada', 
          description: `${customerName} foi cadastrado. Mesa pronta para receber pedidos.` 
        });
      } else {
        // No name provided
        toast({ 
          title: '✅ Mesa ocupada', 
          description: 'Mesa pronta para receber pedidos.' 
        });
      }
      
      setCustomerName('');
      setSelectedPeopleCount(null);
      setCustomPeopleCount('');
      setShowCustomCount(false);
    },
    onError: (error: any) => {
      toast({
        title: 'Erro ao ocupar mesa',
        description: error.message || 'Não foi possível ocupar a mesa.',
        variant: 'destructive',
      });
    },
  });

  // End session mutation
  const endSessionMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest('POST', `/api/tables/${table?.id}/close-session`, {});
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/tables/with-orders'] });
      toast({ title: 'Mesa encerrada', description: 'Mesa liberada com sucesso.' });
      setShowEndSessionDialog(false);
      onOpenChange(false);
    },
    onError: (error: any) => {
      toast({
        title: 'Erro ao encerrar mesa',
        description: error.message || 'Não foi possível encerrar a mesa.',
        variant: 'destructive',
      });
    },
  });

  // Update status mutation
  const updateStatusMutation = useMutation({
    mutationFn: async (status: string) => {
      const response = await apiRequest('PATCH', `/api/tables/${table?.id}/status`, { status });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/tables/with-orders'] });
      toast({ title: 'Status atualizado' });
    },
    onError: (error: any) => {
      toast({
        title: 'Erro',
        description: error.message || 'Não foi possível atualizar o status.',
        variant: 'destructive',
      });
    },
  });

  if (!table) return null;

  const totalAmount = parseFloat(table.totalAmount || '0');
  const isTableFree = table.status === 'livre';

  // Quick buttons for people count
  const quickCounts = [1, 2, 3, 4, 5, 6];

  // Render mesa livre (simplified)
  const renderFreeTable = () => (
    <DialogContent className="sm:max-w-md">
      <DialogHeader>
        <DialogTitle className="flex items-center justify-between">
          <span>🪑 Ocupar Mesa {table.number}</span>
          {allTables.length > 1 && onNavigate && (
            <div className="flex items-center gap-1">
              <Button variant="ghost" size="icon" onClick={handlePrevious} disabled={!hasPrevious}>
                <ArrowLeft className="h-4 w-4" />
              </Button>
              <span className="text-xs text-muted-foreground px-2">{currentIndex + 1}/{allTables.length}</span>
              <Button variant="ghost" size="icon" onClick={handleNext} disabled={!hasNext}>
                <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
          )}
        </DialogTitle>
      </DialogHeader>

      <div className="space-y-4 pt-4">
        {/* Customer name - always visible */}
        <div className="space-y-2">
          <Label htmlFor="customerName" className="text-sm font-medium">
            👤 Nome do Cliente (opcional)
          </Label>
          <Input
            id="customerName"
            value={customerName}
            onChange={(e) => setCustomerName(e.target.value)}
            placeholder="Ex: João Silva"
            className="h-11"
          />
        </div>

        {/* People count - quick buttons */}
        <div className="space-y-2">
          <Label className="text-sm font-medium">👥 Número de Pessoas</Label>
          <div className="grid grid-cols-6 gap-2">
            {quickCounts.map((count) => (
              <Button
                key={count}
                variant={selectedPeopleCount === count ? 'default' : 'outline'}
                className="h-12 text-lg font-semibold"
                onClick={() => {
                  setSelectedPeopleCount(count);
                  setShowCustomCount(false);
                  setCustomPeopleCount('');
                }}
              >
                {count}
              </Button>
            ))}
          </div>
          
          {/* Preview quando seleciona pessoas */}
          {(selectedPeopleCount || (customPeopleCount && !showCustomCount)) && (
            <div className="mt-3 p-3 bg-muted/50 rounded-lg border border-dashed">
              <p className="text-xs font-medium text-muted-foreground mb-2">
                Pré-visualização:
              </p>
              <div className="space-y-1 text-sm">
                <div className="flex items-center gap-2 text-primary">
                  <div className="h-2 w-2 rounded-full bg-primary" />
                  <span>{customerName || 'Cliente principal'} (assento 1)</span>
                </div>
                {Array.from({ length: (selectedPeopleCount || parseInt(customPeopleCount) || 1) - 1 }).map((_, i) => (
                  <div key={i} className="flex items-center gap-2 text-muted-foreground">
                    <div className="h-2 w-2 rounded-full bg-muted-foreground/30" />
                    <span>Pessoa {i + 2} (adicionar depois)</span>
                  </div>
                ))}
              </div>
            </div>
          )}
          
          {!showCustomCount ? (
            <Button
              variant="outline"
              size="sm"
              className="w-full"
              onClick={() => setShowCustomCount(true)}
            >
              + Outro número
            </Button>
          ) : (
            <div className="flex items-center gap-2">
              <Input
                type="number"
                min="1"
                placeholder="Digite o número"
                value={customPeopleCount}
                onChange={(e) => {
                  setCustomPeopleCount(e.target.value);
                  setSelectedPeopleCount(null);
                }}
                className="h-10"
                autoFocus
              />
              <Button variant="ghost" size="icon" onClick={() => {
                setShowCustomCount(false);
                setCustomPeopleCount('');
              }}>
                <X className="h-4 w-4" />
              </Button>
            </div>
          )}
        </div>

        {/* Action buttons */}
        <div className="flex gap-2 pt-2">
          <Button
            variant="outline"
            className="flex-1"
            onClick={() => onOpenChange(false)}
          >
            Cancelar
          </Button>
          <Button
            className="flex-1"
            onClick={() => startSessionMutation.mutate()}
            disabled={startSessionMutation.isPending || (!selectedPeopleCount && !customPeopleCount)}
          >
            {startSessionMutation.isPending ? (
              <>
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                Ocupando...
              </>
            ) : (
              '✓ Ocupar Mesa'
            )}
          </Button>
        </div>

        {/* Advanced Options - Collapsible */}
        <div className="border-t pt-3 mt-3">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="w-full justify-between h-8"
            onClick={() => setShowAdvancedOptions(!showAdvancedOptions)}
          >
            <span className="text-xs font-medium">⚙️ Opções Avançadas</span>
            <ChevronDown className={`h-4 w-4 transition-transform ${showAdvancedOptions ? 'rotate-180' : ''}`} />
          </Button>
          
          {showAdvancedOptions && (
            <div className="space-y-3 mt-3 animate-in fade-in slide-in-from-top-2">
              {/* Phone */}
              <div className="space-y-1.5">
                <Label htmlFor="customerPhone" className="text-xs font-medium">
                  📞 Telefone
                </Label>
                <Input
                  id="customerPhone"
                  type="tel"
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  placeholder="+244 923 456 789"
                  className="h-9 text-sm"
                />
              </div>

              {/* Special Occasion */}
              <div className="space-y-1.5">
                <Label className="text-xs font-medium">🎂 Ocasião Especial</Label>
                <div className="grid grid-cols-3 gap-1.5">
                  <Button
                    type="button"
                    variant={specialOccasion === 'aniversario' ? 'default' : 'outline'}
                    size="sm"
                    className="h-8 text-xs"
                    onClick={() => setSpecialOccasion(specialOccasion === 'aniversario' ? null : 'aniversario')}
                  >
                    🎂
                  </Button>
                  <Button
                    type="button"
                    variant={specialOccasion === 'comemoracao' ? 'default' : 'outline'}
                    size="sm"
                    className="h-8 text-xs"
                    onClick={() => setSpecialOccasion(specialOccasion === 'comemoracao' ? null : 'comemoracao')}
                  >
                    🎉
                  </Button>
                  <Button
                    type="button"
                    variant={specialOccasion === 'primeira_visita' ? 'default' : 'outline'}
                    size="sm"
                    className="h-8 text-xs"
                    onClick={() => setSpecialOccasion(specialOccasion === 'primeira_visita' ? null : 'primeira_visita')}
                  >
                    ✨
                  </Button>
                </div>
              </div>

              {/* QR Code */}
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="w-full h-8 text-xs"
                onClick={() => setShowQRSelfRegister(true)}
              >
                📱 QR Code Auto-Cadastro
              </Button>
            </div>
          )}
        </div>

        {/* Helper text */}
        <p className="text-xs text-muted-foreground text-center mt-4">
          Após ocupar, você poderá criar pedidos para esta mesa
        </p>
      </div>
    </DialogContent>
  );

  // Render occupied table (dashboard style)
  const renderOccupiedTable = () => (
    <DialogContent className="max-w-2xl max-h-[90vh] flex flex-col p-0">
      {/* Header */}
      <DialogHeader className="px-6 pt-6 pb-4 border-b">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {allTables.length > 1 && onNavigate && (
              <div className="flex items-center gap-1">
                <Button variant="ghost" size="icon" onClick={handlePrevious} disabled={!hasPrevious}>
                  <ArrowLeft className="h-4 w-4" />
                </Button>
                <span className="text-xs text-muted-foreground">{currentIndex + 1}/{allTables.length}</span>
                <Button variant="ghost" size="icon" onClick={handleNext} disabled={!hasNext}>
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </div>
            )}
            <div>
              <DialogTitle className="text-2xl font-bold">Mesa {table.number}</DialogTitle>
              <div className="flex items-center gap-2 mt-1 text-sm text-muted-foreground">
                {table.customerName && (
                  <>
                    <span className="font-medium">{table.customerName}</span>
                    <span>•</span>
                  </>
                )}
                {table.customerCount && (
                  <>
                    <Users className="h-3.5 w-3.5" />
                    <span>{table.customerCount} {table.customerCount === 1 ? 'pessoa' : 'pessoas'}</span>
                  </>
                )}
                {table.lastActivity && (
                  <>
                    <span>•</span>
                    <Clock className="h-3.5 w-3.5" />
                    <span>{format(new Date(table.lastActivity), 'HH:mm', { locale: ptBR })}</span>
                  </>
                )}
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <Badge className={`${getStatusColor(table.status)} border`}>
              {getStatusLabel(table.status)}
            </Badge>
            
            {/* More options menu */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>Mais Opções</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => updateStatusMutation.mutate('ocupada')}>
                  <Users className="h-4 w-4 mr-2" />
                  Marcar como Ocupada
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => updateStatusMutation.mutate('em_andamento')}>
                  <Clock className="h-4 w-4 mr-2" />
                  Em Andamento
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => updateStatusMutation.mutate('aguardando_pagamento')}>
                  <CreditCard className="h-4 w-4 mr-2" />
                  Aguardando Pagamento
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => queryClient.invalidateQueries({ queryKey: ['/api/tables/with-orders'] })}>
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Atualizar Dados
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem 
                  onClick={() => setShowEndSessionDialog(true)}
                  className="text-destructive focus:text-destructive"
                >
                  <X className="h-4 w-4 mr-2" />
                  Encerrar Mesa
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </DialogHeader>

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
        {/* Total amount - prominent */}
        <Card className="bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Total da Conta</p>
                <p className="text-4xl font-bold text-primary">{formatKwanza(totalAmount)}</p>
              </div>
              <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
                <Receipt className="h-8 w-8 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Pessoas na Mesa - Collapsible */}
        <Collapsible open={guestsExpanded} onOpenChange={setGuestsExpanded}>
          <Card>
            <CollapsibleTrigger asChild>
              <CardHeader className="pb-3 cursor-pointer hover:bg-accent/50 transition-colors">
                <div className="flex items-center justify-between w-full">
                  <CardTitle className="text-base flex items-center gap-2">
                    <Users className="h-5 w-5" />
                    Pessoas na Mesa
                    {guests.length > 0 && (
                      <Badge variant="secondary">{guests.length}</Badge>
                    )}
                    {table.customerCount && table.customerCount > guests.length && (
                      <Badge variant="destructive" className="ml-1">
                        {table.customerCount - guests.length} faltam
                      </Badge>
                    )}
                  </CardTitle>
                  <ChevronDown className={`h-5 w-5 transition-transform ${guestsExpanded ? 'rotate-180' : ''}`} />
                </div>
              </CardHeader>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <CardContent className="space-y-3 pt-0">
                {/* Alert if missing guests */}
                {table.customerCount && table.customerCount > guests.length && !addingGuest && (
                  <div className="bg-amber-50 dark:bg-amber-950 border border-amber-200 dark:border-amber-800 rounded-lg p-3 text-sm">
                    <p className="text-amber-800 dark:text-amber-200 font-medium">
                      ⚠️ Você informou {table.customerCount} pessoas, mas só {guests.length} {guests.length === 1 ? 'foi cadastrada' : 'foram cadastradas'}.
                    </p>
                    <p className="text-amber-700 dark:text-amber-300 text-xs mt-1">
                      Cadastre as outras {table.customerCount - guests.length} para facilitar a divisão da conta.
                    </p>
                  </div>
                )}
                
                {/* Add guest form */}
                {addingGuest ? (
                  <div className="flex items-center gap-2 p-3 bg-muted/50 rounded-lg">
                    <Input
                      placeholder="Nome (opcional)"
                      value={newGuestName}
                      onChange={(e) => setNewGuestName(e.target.value)}
                      className="flex-1"
                      autoFocus
                    />
                    <Button
                      size="sm"
                      onClick={() => createGuestMutation.mutate({ tableId: table.id, guestName: newGuestName || undefined })}
                      disabled={createGuestMutation.isPending}
                    >
                      {createGuestMutation.isPending ? (
                        <>
                          <RefreshCw className="h-3 w-3 mr-1 animate-spin" />
                          Adicionando...
                        </>
                      ) : (
                        'Adicionar'
                      )}
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => {
                        setAddingGuest(false);
                        setNewGuestName('');
                      }}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ) : (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setAddingGuest(true)}
                    className="w-full"
                  >
                    <UserPlus className="h-4 w-4 mr-2" />
                    Adicionar Pessoa
                  </Button>
                )}

                {/* Guest list */}
                {guests.length > 0 ? (
                  <div className="space-y-2">
                    <Separator />
                    <div className="flex flex-wrap gap-2">
                      {guests.map((guest) => (
                        <Badge key={guest.id} variant="outline" className="py-1.5 px-3">
                          <Users className="h-3 w-3 mr-1" />
                          {guest.name || `Cliente ${guest.seatNumber || '?'}`}
                        </Badge>
                      ))}
                    </div>
                  </div>
                ) : (
                  !addingGuest && (
                    <p className="text-sm text-muted-foreground text-center py-2">
                      Nenhuma pessoa adicionada ainda
                    </p>
                  )
                )}
              </CardContent>
            </CollapsibleContent>
          </Card>
        </Collapsible>

        {/* Active orders - inline */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base flex items-center gap-2">
                <ShoppingBag className="h-5 w-5" />
                Pedidos
                {table.orders && table.orders.length > 0 && (
                  <Badge variant="secondary">{table.orders.length}</Badge>
                )}
              </CardTitle>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowNewOrderDialog(true)}
                className="text-primary"
              >
                <Plus className="h-4 w-4 mr-1" />
                Novo
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {table.orders && table.orders.length > 0 ? (
              <div className="space-y-2">
                {table.orders.map((order: any) => (
                  <div
                    key={order.id}
                    className="p-4 border rounded-lg hover:bg-accent cursor-pointer transition-colors"
                    onClick={() => {
                      setSelectedOrder(order);
                      setOrderDetailsOpen(true);
                    }}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <Badge variant={
                          order.status === 'pendente' ? 'secondary' :
                          order.status === 'em_preparo' ? 'default' :
                          order.status === 'pronto' ? 'outline' :
                          'secondary'
                        }>
                          {order.status === 'pendente' ? '📝 Pendente' :
                           order.status === 'em_preparo' ? '👨‍🍳 Em Preparo' :
                           order.status === 'pronto' ? '✅ Pronto' :
                           order.status === 'servido' ? '🍽️ Servido' :
                           order.status}
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          {format(new Date(order.createdAt), 'HH:mm', { locale: ptBR })}
                        </span>
                      </div>
                      <span className="font-semibold text-primary">
                        {formatKwanza(parseFloat(order.totalAmount || '0'))}
                      </span>
                    </div>
                    {order.orderItems && order.orderItems.length > 0 && (
                      <div className="text-sm text-muted-foreground">
                        {order.orderItems.slice(0, 2).map((item: any, idx: number) => (
                          <div key={idx}>
                            {item.quantity}x {item.menuItem?.name || 'Item'}
                          </div>
                        ))}
                        {order.orderItems.length > 2 && (
                          <div className="text-xs mt-1">
                            +{order.orderItems.length - 2} item(ns)...
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <ShoppingBag className="h-12 w-12 mx-auto text-muted-foreground/50 mb-3" />
                <p className="text-sm text-muted-foreground mb-4">
                  Nenhum pedido ainda
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowNewOrderDialog(true)}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Criar Primeiro Pedido
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Divisão de Conta - Collapsible */}
        <Collapsible open={splitExpanded} onOpenChange={setSplitExpanded}>
          <Card>
            <CollapsibleTrigger asChild>
              <CardHeader className="pb-3 cursor-pointer hover:bg-accent/50 transition-colors">
                <div className="flex items-center justify-between w-full">
                  <CardTitle className="text-base flex items-center gap-2">
                    <Split className="h-5 w-5" />
                    Divisão de Conta
                  </CardTitle>
                  <ChevronDown className={`h-5 w-5 transition-transform ${splitExpanded ? 'rotate-180' : ''}`} />
                </div>
              </CardHeader>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <CardContent className="pt-0">
                <BillSplitPanel
                  tableId={table.id}
                  sessionId={table.currentSessionId || undefined}
                  totalAmount={totalAmount}
                />
              </CardContent>
            </CollapsibleContent>
          </Card>
        </Collapsible>
      </div>

      {/* Footer - Main actions */}
      <div className="border-t px-6 py-4 bg-muted/30">
        <div className="grid grid-cols-2 gap-3">
          <Button
            size="lg"
            variant="outline"
            onClick={() => setShowNewOrderDialog(true)}
            className="h-14"
          >
            <Plus className="h-5 w-5 mr-2" />
            <div className="text-left">
              <div className="font-semibold">Novo Pedido</div>
              <div className="text-xs text-muted-foreground">Adicionar itens</div>
            </div>
          </Button>
          <Button
            size="lg"
            onClick={() => {
              // Se houver pedidos, redireciona para o primeiro pedido em modo checkout
              if (table.orders && table.orders.length > 0) {
                const firstOrder = table.orders[0];
                setLocation(`/orders/${firstOrder.id}?mode=checkout&from=table&tableId=${table.id}`);
                onOpenChange(false);
              } else {
                // Se não houver pedidos, abre diálogo de checkout tradicional
                setShowCheckoutDialog(true);
              }
            }}
            className="h-14"
          >
            <CreditCard className="h-5 w-5 mr-2" />
            <div className="text-left">
              <div className="font-semibold">Fechar Conta</div>
              <div className="text-xs opacity-90">{formatKwanza(totalAmount)}</div>
            </div>
          </Button>
        </div>
      </div>
    </DialogContent>
  );

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        {isTableFree ? renderFreeTable() : renderOccupiedTable()}
      </Dialog>

      {/* End session confirmation */}
      <AlertDialog open={showEndSessionDialog} onOpenChange={setShowEndSessionDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Encerrar Mesa {table.number}?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta ação irá encerrar a sessão e liberar a mesa. 
              {totalAmount > 0 && (
                <>
                  {' '}A conta total é de <span className="font-bold">{formatKwanza(totalAmount)}</span>.
                  Certifique-se de que o pagamento foi registrado.
                </>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={endSessionMutation.isPending}>
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={() => endSessionMutation.mutate()}
              disabled={endSessionMutation.isPending}
            >
              {endSessionMutation.isPending ? 'Encerrando...' : 'Encerrar Mesa'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Create order dialog */}
      <TableOrderDialog
        table={table}
        open={showNewOrderDialog}
        onOpenChange={setShowNewOrderDialog}
        onOrderCreated={() => {
          setShowNewOrderDialog(false);
          queryClient.invalidateQueries({ queryKey: ['/api/tables/with-orders'] });
          toast({ title: 'Pedido criado', description: `Pedido criado para Mesa ${table.number}.` });
        }}
      />

      {/* Checkout dialog - Only as fallback for tables without orders */}
      {showCheckoutDialog && (
        <TableCheckoutDialog
          open={showCheckoutDialog}
          onOpenChange={setShowCheckoutDialog}
          table={table}
          onCheckoutComplete={() => {
            setShowCheckoutDialog(false);
            onOpenChange(false);
          }}
        />
      )}

      {/* Order details dialog */}
      <OrderDetailsDialog
        order={selectedOrder}
        open={orderDetailsOpen}
        onOpenChange={setOrderDetailsOpen}
      />

      {/* QR Code Self-Register Dialog - Using AlertDialog */}
      <AlertDialog open={showQRSelfRegister} onOpenChange={setShowQRSelfRegister}>
        <AlertDialogContent className="sm:max-w-md">
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              📱 Auto-Cadastro de Clientes
            </AlertDialogTitle>
            <AlertDialogDescription>
              Os clientes podem escanear este QR Code para se cadastrarem na mesa
            </AlertDialogDescription>
          </AlertDialogHeader>
          
          <div className="space-y-4 py-2">
            {qrCodeUrl ? (
              <div className="flex justify-center bg-white p-4 rounded-lg border">
                <img src={qrCodeUrl} alt="QR Code" className="w-[280px] h-[280px]" />
              </div>
            ) : (
              <div className="flex justify-center items-center bg-muted p-4 rounded-lg border h-[312px]">
                <div className="text-center">
                  <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-2 text-primary" />
                  <p className="text-sm text-muted-foreground">Gerando QR Code...</p>
                </div>
              </div>
            )}

            <div className="p-3 bg-muted rounded-lg">
              <p className="text-xs font-medium mb-2">📋 Como funciona:</p>
              <ol className="text-xs space-y-1 text-muted-foreground">
                <li>1. Cliente escaneia o QR Code</li>
                <li>2. Abre página de cadastro no celular</li>
                <li>3. Cliente digita seu nome</li>
                <li>4. Aparece automaticamente na lista</li>
              </ol>
            </div>
          </div>

          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setShowQRSelfRegister(false)}>
              Fechar
            </AlertDialogCancel>
            <AlertDialogAction onClick={() => window.print()}>
              🖨️ Imprimir QR Code
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
