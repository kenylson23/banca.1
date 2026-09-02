import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import type { OrdersByGuestData } from '@shared/types';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useLocation } from 'wouter';
import { QUERY_KEYS } from '@/lib/queryKeys';
import { format, formatDistanceToNow, differenceInMinutes } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Progress } from '@/components/ui/progress';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Users,
  Clock,
  ChevronLeft,
  ChevronRight,
  AlertTriangle,
  UserPlus,
  X,
  Plus,
  CreditCard,
  ShoppingBag,
  Circle,
  Utensils,
  Timer,
  DollarSign,
  Receipt,
  Split,
  UserPlus,
  Send,
  Printer,
  MoreHorizontal,
  Sparkles,
  TrendingUp,
  AlertCircle,
  Trash2,
  QrCode,
  RefreshCw,
  Play,
  StopCircle,
  Settings,
  Pencil,
  Eye,
} from 'lucide-react';
import { formatKwanza } from '@/lib/formatters';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { apiFetch } from '@/lib/api-url';
import type { Table } from '@shared/schema';
import QRCode from 'qrcode';
import { CustomerSearchDialog } from './CustomerSearchDialog';
import { QuickOrderDialog } from './QuickOrderDialog';
import { SpeedDialMenu } from './SpeedDialMenu';
import { PrintGuestBill } from './PrintGuestBill';

interface TableDetailsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  table: (Table & { orders?: any[] }) | null;
  allTables?: Table[];
  onNavigate?: (table: Table) => void;
}

// 🎨 PALETA CUSTOM HÍBRIDA PREMIUM
const COLORS = {
  // Core Brand - Indigo sofisticado
  primary: {
    DEFAULT: '#6366F1', // Indigo-500
    dark: '#4F46E5',    // Indigo-600
    light: '#818CF8',   // Indigo-400
    bg: '#EEF2FF',      // Indigo-50
  },
  // Success - Emerald natural
  success: {
    DEFAULT: '#10B981', // Emerald-500
    dark: '#059669',    // Emerald-600
    light: '#34D399',   // Emerald-400
    bg: '#ECFDF5',      // Emerald-50
  },
  // Warning - Amber quente
  warning: {
    DEFAULT: '#F59E0B', // Amber-500
    dark: '#D97706',    // Amber-600
    light: '#FBBF24',   // Amber-400
    bg: '#FFFBEB',      // Amber-50
  },
  // Danger - Rose vibrante
  danger: {
    DEFAULT: '#EF4444', // Red-500
    dark: '#DC2626',    // Red-600
    light: '#F87171',   // Red-400
    bg: '#FEF2F2',      // Red-50
  },
  // Accent - Violet luxo
  accent: {
    DEFAULT: '#8B5CF6', // Violet-500
    dark: '#7C3AED',    // Violet-600
    light: '#A78BFA',   // Violet-400
    bg: '#F5F3FF',      // Violet-50
  },
  // Neutral - Slate moderno
  neutral: {
    darkest: '#0F172A', // Slate-900
    dark: '#1E293B',    // Slate-800
    medium: '#475569',  // Slate-600
    light: '#94A3B8',   // Slate-400
    lighter: '#E2E8F0', // Slate-200
    bg: '#F8FAFC',      // Slate-50
  },
  // Special - Cyan tech
  tech: {
    DEFAULT: '#06B6D4', // Cyan-500
    dark: '#0891B2',    // Cyan-600
    light: '#22D3EE',   // Cyan-400
    bg: '#ECFEFF',      // Cyan-50
  },
};

const statusConfig = {
  livre: {
    label: 'Disponível',
    bgColor: `bg-[${COLORS.neutral.medium}]`,
    gradient: 'from-slate-500 to-slate-600',
    textColor: `text-[${COLORS.neutral.medium}]`,
    lightBg: `bg-[${COLORS.neutral.bg}]`,
    borderColor: `border-[${COLORS.neutral.lighter}]`,
  },
  ocupada: {
    label: 'Ocupada',
    bgColor: `bg-[${COLORS.primary.DEFAULT}]`,
    gradient: 'from-indigo-500 to-indigo-600',
    textColor: `text-[${COLORS.primary.DEFAULT}]`,
    lightBg: `bg-[${COLORS.primary.bg}]`,
    borderColor: `border-indigo-200`,
  },
  em_andamento: {
    label: 'Servindo',
    bgColor: `bg-[${COLORS.tech.DEFAULT}]`,
    gradient: 'from-cyan-500 to-cyan-600',
    textColor: `text-[${COLORS.tech.DEFAULT}]`,
    lightBg: `bg-[${COLORS.tech.bg}]`,
    borderColor: `border-cyan-200`,
  },
  aguardando_pagamento: {
    label: 'Pronto para Pagar',
    bgColor: `bg-[${COLORS.warning.DEFAULT}]`,
    gradient: 'from-amber-500 to-amber-600',
    textColor: `text-[${COLORS.warning.dark}]`,
    lightBg: `bg-[${COLORS.warning.bg}]`,
    borderColor: `border-amber-200`,
  },
};

// ✅ Validação de transições de status válidas
const VALID_STATUS_TRANSITIONS: Record<string, string[]> = {
  livre: ['ocupada'],
  ocupada: ['em_andamento', 'livre'],
  em_andamento: ['aguardando_pagamento', 'ocupada'],
  aguardando_pagamento: ['livre'],
};

// Helper: Validar se transição de status é permitida
const isValidStatusTransition = (currentStatus: string, newStatus: string): boolean => {
  const allowedTransitions = VALID_STATUS_TRANSITIONS[currentStatus];
  return allowedTransitions ? allowedTransitions.includes(newStatus) : false;
};

const orderStatusConfig = {
  pending: { 
    label: 'Novo', 
    color: `bg-[${COLORS.primary.DEFAULT}]`,
    gradient: 'from-indigo-500 to-indigo-600',
    lightColor: `bg-[${COLORS.primary.bg}]`,
    textColor: `text-[${COLORS.primary.dark}]`,
  },
  confirmed: { 
    label: 'Confirmado', 
    color: `bg-[${COLORS.accent.DEFAULT}]`,
    gradient: 'from-violet-500 to-violet-600',
    lightColor: `bg-[${COLORS.accent.bg}]`,
    textColor: `text-[${COLORS.accent.dark}]`,
  },
  preparing: { 
    label: 'Preparando', 
    color: `bg-[${COLORS.warning.DEFAULT}]`,
    gradient: 'from-amber-500 to-amber-600',
    lightColor: `bg-[${COLORS.warning.bg}]`,
    textColor: `text-[${COLORS.warning.dark}]`,
  },
  ready: { 
    label: 'Pronto', 
    color: `bg-[${COLORS.success.DEFAULT}]`,
    gradient: 'from-emerald-500 to-emerald-600',
    lightColor: `bg-[${COLORS.success.bg}]`,
    textColor: `text-[${COLORS.success.dark}]`,
  },
  completed: {
    label: 'Completo',
    color: `bg-[${COLORS.success.DEFAULT}]`,
    gradient: 'from-emerald-600 to-emerald-700',
    lightColor: `bg-[${COLORS.success.bg}]`,
    textColor: `text-[${COLORS.success.dark}]`,
  },
  cancelled: {
    label: 'Cancelado',
    color: `bg-[${COLORS.neutral.medium}]`,
    gradient: 'from-gray-500 to-gray-600',
    lightColor: `bg-[${COLORS.neutral.bg}]`,
    textColor: `text-[${COLORS.neutral.medium}]`,
  },
};

export function TableDetailsDialog({
  open,
  onOpenChange,
  table,
  allTables = [],
  onNavigate,
}: TableDetailsDialogProps) {
  const [, navigate] = useLocation();
  
  const { toast } = useToast();
  
  
  // Estados de UI
  const [showGuestSplit, setShowGuestSplit] = useState(false);
  const [addingGuest, setAddingGuest] = useState(false);
  const [newGuestName, setNewGuestName] = useState('');
  const [showEndSessionDialog, setShowEndSessionDialog] = useState(false);
  const [showStartSessionDialog, setShowStartSessionDialog] = useState(false);
  const [selectedPeopleCount, setSelectedPeopleCount] = useState<number | null>(null);
  const [customPeopleCount, setCustomPeopleCount] = useState('');
  const [showQRCode, setShowQRCode] = useState(false);
  const [qrCodeUrl, setQrCodeUrl] = useState<string>('');
  const [showStatusMenu, setShowStatusMenu] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  
  // Estados para gestão híbrida de clientes
  const [showAddPersonModal, setShowAddPersonModal] = useState(false);
  const [addPersonMode, setAddPersonMode] = useState<'search' | 'quick' | 'anonymous' | null>(null);
  const [showCustomerSearch, setShowCustomerSearch] = useState(false);
  const [quickCustomerName, setQuickCustomerName] = useState('');
  const [quickCustomerPhone, setQuickCustomerPhone] = useState('');
  const [convertingGuest, setConvertingGuest] = useState<string | null>(null);
  const [showForceCloseDialog, setShowForceCloseDialog] = useState(false);
  const [validationError, setValidationError] = useState<any>(null);
  const [guestToRemove, setGuestToRemove] = useState<string | null>(null);
  const [orderToCancel, setOrderToCancel] = useState<any>(null);
  const [orderToEdit, setOrderToEdit] = useState<any>(null);
  const [itemToMove, setItemToMove] = useState<any>(null);
  const [selectedOrderMenu, setSelectedOrderMenu] = useState<string | null>(null);
  const [showQuickOrder, setShowQuickOrder] = useState(false);
  const [showPrintBill, setShowPrintBill] = useState(false);
  const [printBillGuestId, setPrintBillGuestId] = useState<string | null>(null);

  // 🔧 FIX: Acumular invalidations em vez de cancelar
  const pendingInvalidationsRef = useRef<Set<string>>(new Set());
  const invalidationTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  const debouncedInvalidateQueries = useCallback((queryKeys: string[][]) => {
    // Adicionar todas as keys ao set (evita duplicatas)
    queryKeys.forEach(key => {
      pendingInvalidationsRef.current.add(JSON.stringify(key));
    });
    
    // Resetar timeout anterior
    if (invalidationTimeoutRef.current) {
      clearTimeout(invalidationTimeoutRef.current);
    }
    
    // Executar todas as invalidations acumuladas após 300ms
    invalidationTimeoutRef.current = setTimeout(() => {
      const keysToInvalidate = Array.from(pendingInvalidationsRef.current).map(k => JSON.parse(k));
      keysToInvalidate.forEach(key => {
        queryClient.invalidateQueries({ queryKey: key });
      });
      pendingInvalidationsRef.current.clear();
    }, 300); // 300ms debounce
  }, []);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (invalidationTimeoutRef.current) {
        clearTimeout(invalidationTimeoutRef.current);
      }
      // Executar invalidations pendentes antes de desmontar
      if (pendingInvalidationsRef.current.size > 0) {
        const keysToInvalidate = Array.from(pendingInvalidationsRef.current).map(k => JSON.parse(k));
        keysToInvalidate.forEach(key => {
          queryClient.invalidateQueries({ queryKey: key });
        });
        pendingInvalidationsRef.current.clear();
      }
    };
  }, []);

  // 🔧 FIX: Query independente para buscar dados atualizados da mesa
  const { data: tableData } = useQuery<any>({
    queryKey: [`/api/tables/${table?.id}`],
    enabled: open && !!table?.id,
    refetchOnMount: true,
    refetchOnWindowFocus: true,
  });
  
   // Usar tableData atualizado ou fallback para prop table
   const currentTable = tableData || table;
   
   // Usar a mesma query do checkout que retorna orders-by-guest com items
   const { data: ordersByGuestData } = useQuery<OrdersByGuestData>({
     queryKey: [`/api/tables/${currentTable?.id}/orders-by-guest`],
     enabled: open && !!currentTable?.id && currentTable?.status !== 'livre',
     refetchOnMount: true,
     refetchOnWindowFocus: false,
     staleTime: 30000,
   });
   
   // 🔧 FIX: Buscar TODOS os guests da sessão atual, independente de terem pedidos
   const { data: allSessionGuests = [], isLoading: isLoadingGuests } = useQuery<any[]>({
     queryKey: [`/api/tables/${currentTable?.id}/guests`],
     enabled: open && !!currentTable?.id && !!currentTable?.currentSessionId,
     refetchOnMount: true,
     refetchOnWindowFocus: false,
     queryFn: async () => {
       if (!currentTable?.currentSessionId) {
         return [];
       }
       const response = await apiRequest('GET', `/api/table-sessions/${currentTable.currentSessionId}/guests`);
       return await response.json();
     },
   });
  
  // ✅ OTIMIZAÇÃO: Pré-carregar bundle e dados do checkout para abertura instantânea
  useEffect(() => {
    if (open && currentTable?.id) {
      import('@/pages/table-checkout-v2');
      queryClient.prefetchQuery({
        queryKey: QUERY_KEYS.tables.sessions(currentTable.id),
        queryFn: async () => {
          const res = await apiFetch(`/api/tables/${currentTable.id}/sessions`);
          return res.json();
        },
        staleTime: 30000,
      });
    }
  }, [open, currentTable?.id, queryClient]);

  // Flatten orders from ordersByGuest structure
  const tableOrders = useMemo(() => {
    if (!ordersByGuestData) return [];
    
    const ordersFromGuests = (ordersByGuestData.ordersByGuest || [])
      .flatMap((og: any) => og.orders || []);
    
    const anonymousOrders = ordersByGuestData.anonymousOrders || [];
    
    const allOrders = [...ordersFromGuests, ...anonymousOrders];
    
    return allOrders;
  }, [ordersByGuestData]);

  // 🔧 FIX: Usar allSessionGuests para ter TODOS os convidados, não apenas os com pedidos
  // Fallback para guests do ordersByGuestData se a query de guests falhar
  const guests = useMemo(() => {
    // Priorizar guests da sessão (todos os guests)
    if (allSessionGuests && allSessionGuests.length > 0) {
      return allSessionGuests;
    }
    // Fallback: guests do ordersByGuest (apenas com pedidos)
    if (!ordersByGuestData?.ordersByGuest) {
      return [];
    }
    return ordersByGuestData.ordersByGuest.map((og: any) => og.guest);
  }, [allSessionGuests, ordersByGuestData]);

  // ✅ Mutation: Iniciar Sessão
  const startSessionMutation = useMutation({
    mutationFn: async () => {
      if (!table?.id) throw new Error('Mesa não encontrada');
      const peopleCount = selectedPeopleCount || parseInt(customPeopleCount) || 1;
      
      const response = await apiRequest('POST', `/api/tables/${currentTable.id}/start-session`, {
        customerCount: peopleCount,
        customerName: null, // Opcional: pode ser adicionado no futuro
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/tables/with-orders'] });
      queryClient.invalidateQueries({ queryKey: [`/api/tables/${table?.id}/guests`] });
      // 🔧 FIX: Invalidar orders-by-guest após iniciar sessão
      queryClient.invalidateQueries({ queryKey: [`/api/tables/${table?.id}/orders-by-guest`] });
      toast({ title: 'Sessão iniciada', description: 'Mesa aberta com sucesso.' });
      setShowStartSessionDialog(false);
      setSelectedPeopleCount(null);
      setCustomPeopleCount('');
    },
    onError: (error: any) => {
      toast({
        title: 'Erro ao iniciar sessão',
        description: error.message || 'Não foi possível iniciar a sessão.',
        variant: 'destructive',
      });
    },
  });

  // ✅ Mutation: Encerrar Sessão (com validação de pagamento)
  const endSessionMutation = useMutation({
    mutationFn: async (forceClose: boolean = false) => {
      if (!table?.id) throw new Error('Mesa não encontrada');
      const response = await apiRequest('POST', `/api/tables/${currentTable.id}/close-session`, {
        forceClose,
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/tables/with-orders'] });
      queryClient.invalidateQueries({ queryKey: [`/api/tables/${table?.id}/orders-by-guest`] });
      toast({ title: 'Sessão encerrada', description: 'Mesa fechada com sucesso.' });
      setShowEndSessionDialog(false);
      onOpenChange(false);
    },
    onError: (error: any) => {
      // Handle validation errors
      if (error.status === 400 && error.pendingAmount) {
        toast({
          title: 'Atenção: Valores Pendentes',
          description: `Mesa possui ${error.pendingAmount} Kz pendente de pagamento.`,
          variant: 'destructive',
        });
        // Show force close option for admin
        if (error.canForceClose) {
          setShowForceCloseDialog(true);
          setValidationError(error);
        }
      } else {
        toast({
          title: 'Erro ao encerrar sessão',
          description: error.message || 'Não foi possível encerrar a sessão.',
          variant: 'destructive',
        });
      }
    },
  });

  // ✅ Mutation Unificada: Adicionar Pessoa à Mesa (convidado anônimo, cliente existente, ou novo)
  const addPersonToTableMutation = useMutation({
    mutationFn: async ({ 
      type, 
      name, 
      customerId, 
      phone 
    }: { 
      type: 'anonymous' | 'existing' | 'quick';
      name?: string;
      customerId?: string;
      phone?: string;
    }) => {
      if (!table?.id) throw new Error('Mesa não encontrada');
      if (!table?.currentSessionId) throw new Error('Mesa não tem sessão ativa');
      
      // Validate input based on type
      if (type === 'existing' && !customerId) {
        throw new Error('ID do cliente é obrigatório para vincular cliente existente');
      }
      if (type === 'quick' && (!name || !phone)) {
        throw new Error('Nome e telefone são obrigatórios para cadastro rápido');
      }
      
      let finalCustomerId = customerId;
      
      // If quick registration, create customer first
      if (type === 'quick' && name && phone) {
        const customerResponse = await apiRequest('POST', '/api/customers', { name, phone });
        const customer = await customerResponse.json();
        finalCustomerId = customer.id;
      }
      
      // Add guest to table
      const response = await apiRequest('POST', `/api/tables/${currentTable.id}/guests`, {
        name: type === 'anonymous' ? (name || null) : undefined,
        customerId: finalCustomerId,
      });
      return response.json();
    },
    onMutate: async (variables) => {
      // Cancel any outgoing queries
      await queryClient.cancelQueries({ queryKey: [`/api/tables/${table?.id}/guests`] });
      
      // Snapshot current guests
      const previousGuests = queryClient.getQueryData([`/api/tables/${table?.id}/guests`]);
      
      // Optimistically update to new value
      queryClient.setQueryData([`/api/tables/${table?.id}/guests`], (old: any[] = []) => {
        const newGuest = {
          id: `temp-${Date.now()}`,
          name: variables.name || `Convidado ${old.length + 1}`,
          customerId: variables.customerId,
          seatNumber: old.length + 1,
          status: 'active',
          _optimistic: true,
        };
        return [...old, newGuest];
      });
      
      return { previousGuests };
    },
    onSuccess: () => {
      // Use debounced invalidation
      debouncedInvalidateQueries([
        [`/api/tables/${table?.id}/guests`],
        [`/api/tables/${table?.id}/orders-by-guest`],
        ['/api/tables/with-orders']
      ]);
      toast({ title: 'Pessoa adicionada', description: 'Cliente adicionado à mesa com sucesso.' });
      
      // Reset all modal states
      setAddingGuest(false);
      setNewGuestName('');
      setShowCustomerSearch(false);
      setShowAddPersonModal(false);
      setAddPersonMode(null);
      setQuickCustomerName('');
      setQuickCustomerPhone('');
    },
    onError: (error: any, variables, context) => {
      // Rollback optimistic update
      if (context?.previousGuests) {
        queryClient.setQueryData([`/api/tables/${table?.id}/guests`], context.previousGuests);
      }
      
      toast({
        title: 'Erro ao adicionar pessoa',
        description: error.message || 'Não foi possível adicionar a pessoa.',
        variant: 'destructive',
      });
    },
  });

  // Legacy wrapper for backward compatibility
  const createGuestMutation = {
    mutate: (guestName: string) => addPersonToTableMutation.mutate({ 
      type: 'anonymous', 
      name: guestName 
    }),
    isPending: addPersonToTableMutation.isPending,
  };

  // ✅ Mutation: Cancelar Pedido
  const cancelOrderMutation = useMutation({
    mutationFn: async (orderId: string) => {
      const response = await apiRequest('PATCH', `/api/orders/${orderId}`, {
        status: 'cancelled',
      });
      return response.json();
    },
    onSuccess: () => {
      debouncedInvalidateQueries([
        [`/api/tables/${table?.id}/orders-by-guest`],
        ['/api/tables'],
        ['/api/orders'],
      ]);
      toast({ 
        title: 'Pedido cancelado', 
        description: 'O pedido foi cancelado com sucesso.' 
      });
      setOrderToCancel(null);
    },
    onError: (error: any) => {
      toast({
        title: 'Erro ao cancelar pedido',
        description: error.message || 'Não foi possível cancelar o pedido.',
        variant: 'destructive',
      });
    },
  });

  // ✅ Mutation: Editar Item do Pedido
  const updateOrderItemMutation = useMutation({
    mutationFn: async ({ itemId, quantity }: { itemId: string; quantity: number }) => {
      const response = await apiRequest('PATCH', `/api/order-items/${itemId}`, {
        quantity,
      });
      return response.json();
    },
    onSuccess: () => {
      debouncedInvalidateQueries([
        [`/api/tables/${table?.id}/orders-by-guest`],
        ['/api/orders'],
      ]);
      toast({ 
        title: 'Item atualizado', 
        description: 'A quantidade foi alterada com sucesso.' 
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Erro ao atualizar item',
        description: error.message || 'Não foi possível atualizar o item.',
        variant: 'destructive',
      });
    },
  });

  // ✅ Mutation: Remover Item do Pedido
  const removeOrderItemMutation = useMutation({
    mutationFn: async (itemId: string) => {
      const response = await apiRequest('DELETE', `/api/order-items/${itemId}`);
      return response.json();
    },
    onSuccess: () => {
      debouncedInvalidateQueries([
        [`/api/tables/${table?.id}/orders-by-guest`],
        ['/api/orders'],
      ]);
      toast({ 
        title: 'Item removido', 
        description: 'O item foi removido do pedido.' 
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Erro ao remover item',
        description: error.message || 'Não foi possível remover o item.',
        variant: 'destructive',
      });
    },
  });

  // ✅ Mutation: Mover Item entre Guests
  const moveItemMutation = useMutation({
    mutationFn: async ({ itemId, targetGuestId }: { itemId: string; targetGuestId: string | null }) => {
      const response = await apiRequest('PATCH', `/api/order-items/${itemId}/move`, {
        guestId: targetGuestId,
      });
      return response.json();
    },
    onSuccess: () => {
      debouncedInvalidateQueries([
        [`/api/tables/${table?.id}/orders-by-guest`],
        [`/api/tables/${table?.id}/guests`],
        ['/api/orders'],
      ]);
      toast({ 
        title: 'Item movido', 
        description: 'O item foi movido para outro convidado.' 
      });
      setItemToMove(null);
    },
    onError: (error: any) => {
      toast({
        title: 'Erro ao mover item',
        description: error.message || 'Não foi possível mover o item.',
        variant: 'destructive',
      });
    },
  });

  // ✅ Mutation: Remover Convidado (com optimistic update)
  const removeGuestMutation = useMutation({
    mutationFn: async (guestId: string) => {
      if (!table?.id) throw new Error('Mesa não encontrada');
      const response = await apiRequest('DELETE', `/api/tables/${currentTable.id}/guests/${guestId}`);
      return response.json();
    },
    onMutate: async (guestId) => {
      // Cancel queries
      await queryClient.cancelQueries({ queryKey: [`/api/tables/${table?.id}/guests`] });
      
      // Snapshot
      const previousGuests = queryClient.getQueryData([`/api/tables/${table?.id}/guests`]);
      
      // Optimistically remove
      queryClient.setQueryData([`/api/tables/${table?.id}/guests`], (old: any[] = []) => {
        return old.filter(g => g.id !== guestId);
      });
      
      return { previousGuests };
    },
    onSuccess: () => {
      // Use debounced invalidation
      debouncedInvalidateQueries([
        [`/api/tables/${table?.id}/guests`],
        ['/api/tables/with-orders']
      ]);
      toast({ title: 'Convidado removido', description: 'Cliente removido da mesa.' });
    },
    onError: (error: any, guestId, context) => {
      // Rollback
      if (context?.previousGuests) {
        queryClient.setQueryData([`/api/tables/${table?.id}/guests`], context.previousGuests);
      }
      
      toast({
        title: 'Erro ao remover convidado',
        description: error.message || 'Não foi possível remover o convidado.',
        variant: 'destructive',
      });
    },
  });

  // ✅ Mutation: Atualizar Status da Mesa (com validação de transição)
  const updateStatusMutation = useMutation({
    mutationFn: async (newStatus: string) => {
      if (!table?.id) throw new Error('Mesa não encontrada');
      
      // Validate status transition
      const currentStatus = table.status;
      if (!isValidStatusTransition(currentStatus, newStatus)) {
        throw new Error(
          `Transição inválida: ${currentStatus} → ${newStatus}. ` +
          `Transições permitidas: ${VALID_STATUS_TRANSITIONS[currentStatus]?.join(', ') || 'nenhuma'}`
        );
      }
      
      // Additional validation: don't allow transition to 'livre' if there are unpaid orders
      if (newStatus === 'livre' && totalOrders > 0 && totalAmount > 0) {
        throw new Error(
          'Não é possível marcar a mesa como livre. Existem pedidos não pagos. ' +
          'Primeiro encerre a sessão ou cancele os pedidos.'
        );
      }
      
      // Additional validation: don't allow transition to 'livre' if there's an active session
      if (newStatus === 'livre' && currentTable.currentSessionId) {
        throw new Error(
          'Não é possível marcar a mesa como livre. Existe uma sessão ativa. ' +
          'Primeiro encerre a sessão.'
        );
      }
      
      const response = await apiRequest('PATCH', `/api/tables/${currentTable.id}`, {
        status: newStatus,
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/tables/with-orders'] });
      toast({ title: 'Status atualizado', description: 'Status da mesa alterado com sucesso.' });
      setShowStatusMenu(false);
    },
    onError: (error: any) => {
      toast({
        title: 'Erro ao atualizar status',
        description: error.message || 'Não foi possível atualizar o status.',
        variant: 'destructive',
      });
    },
  });

  // Legacy wrapper: Vincular Cliente Existente
  const linkCustomerMutation = {
    mutate: (customerId: string) => addPersonToTableMutation.mutate({ 
      type: 'existing', 
      customerId 
    }),
    isPending: addPersonToTableMutation.isPending,
  };

  // Legacy wrapper: Criar Cliente Rápido
  const createQuickCustomerMutation = {
    mutate: () => addPersonToTableMutation.mutate({ 
      type: 'quick', 
      name: quickCustomerName,
      phone: quickCustomerPhone
    }),
    isPending: addPersonToTableMutation.isPending,
  };

  // ✅ Mutation: Converter Convidado em Cliente
  const convertGuestMutation = useMutation({
    mutationFn: async ({ guestId, name, phone }: { guestId: string; name: string; phone: string }) => {
      // Criar cliente
      const customerResponse = await apiRequest('POST', '/api/customers', {
        name,
        phone,
      });
      const customer = await customerResponse.json();
      
      // Atualizar guest com customerId
      if (!table?.id) throw new Error('Mesa não encontrada');
      const guestResponse = await apiRequest('PATCH', `/api/tables/${currentTable.id}/guests/${guestId}`, {
        customerId: customer.id,
      });
      return guestResponse.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/tables/${table?.id}/guests`] });
      queryClient.invalidateQueries({ queryKey: ['/api/customers'] });
      toast({ title: 'Convertido!', description: 'Convidado convertido em cliente com sucesso.' });
      setConvertingGuest(null);
      setQuickCustomerName('');
      setQuickCustomerPhone('');
    },
    onError: (error: any) => {
      toast({
        title: 'Erro ao converter',
        description: error.message || 'Não foi possível converter o convidado.',
        variant: 'destructive',
      });
    },
  });

  // 🔄 Generate QR Code
  useEffect(() => {
    if (showQRCode && table) {
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
          toast({
            title: 'Erro ao gerar QR Code',
            description: 'Não foi possível gerar o QR Code.',
            variant: 'destructive',
          });
        });
    }
  }, [showQRCode, table]);

  // ⌨️ Keyboard Shortcuts (melhorados com proteção contra diálogos abertos)
  useEffect(() => {
    if (!open) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      // 🛡️ Ignorar atalhos se o foco estiver num campo de input ou elemento editável (verifica target e activeElement)
      const target = e.target as HTMLElement;
      const activeEl = document.activeElement as HTMLElement;

      const isInput = (el: HTMLElement | null) => {
        if (!el) return false;
        const tag = el.tagName?.toUpperCase();
        return (
          ['INPUT', 'TEXTAREA', 'SELECT'].includes(tag) ||
          Boolean(el.isContentEditable) ||
          el.closest?.('input, textarea, select, [contenteditable="true"]') !== null
        );
      };

      const activeEl = (typeof document !== 'undefined' ? document.activeElement : null) as HTMLElement | null;

      if (isInput(target) || isInput(activeEl)) return;

      // 🛡️ Bloquear shortcuts se houver modais/diálogos abertos
      const hasModalOpen = showEndSessionDialog || showStartSessionDialog || 
                          addingGuest || showQRCode || showAddPersonModal || 
                          showCustomerSearch || showForceCloseDialog ||
                          addPersonMode !== null;
      
      // ESC - Close dialog (sempre permitido)
      if (e.key === 'Escape') {
        // Fechar modal aberto primeiro, se houver
        if (addPersonMode !== null) {
          setAddPersonMode(null);
          return;
        }
        if (showForceCloseDialog) {
          setShowForceCloseDialog(false);
          return;
        }
        if (showEndSessionDialog) {
          setShowEndSessionDialog(false);
          return;
        }
        if (showStartSessionDialog) {
          setShowStartSessionDialog(false);
          return;
        }
        if (addingGuest) {
          setAddingGuest(false);
          return;
        }
        if (showQRCode) {
          setShowQRCode(false);
          return;
        }
        if (showAddPersonModal) {
          setShowAddPersonModal(false);
          return;
        }
        if (showCustomerSearch) {
          setShowCustomerSearch(false);
          return;
        }
        // Fechar diálogo principal
        onOpenChange(false);
        return;
      }
      
      // 🛡️ Bloquear outros shortcuts se modal estiver aberto
      if (hasModalOpen) return;

      // Arrow Right - Next table
      if (e.key === 'ArrowRight') {
        e.preventDefault();
        const currentIndex = allTables.findIndex((t) => t.id === table?.id);
        if (currentIndex < allTables.length - 1) {
          onNavigate?.(allTables[currentIndex + 1]);
        }
      }
      // Arrow Left - Previous table
      else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        const currentIndex = allTables.findIndex((t) => t.id === table?.id);
        if (currentIndex > 0) {
          onNavigate?.(allTables[currentIndex - 1]);
        }
      }
      // N - New Order (só para mesa ocupada)
      else if ((e.key === 'n' || e.key === 'N') && !e.ctrlKey && !e.metaKey && table?.status !== 'livre') {
        e.preventDefault();
        onOpenChange(false);
        navigate(`/pdv?tableId=${table?.id}`);
      }
      // P - Checkout (Payment) (só para mesa ocupada com pedidos)
      else if ((e.key === 'p' || e.key === 'P') && !e.ctrlKey && !e.metaKey && table?.status !== 'livre' && totalOrders > 0) {
        e.preventDefault();
        onOpenChange(false);
        navigate(`/tables/${table?.id}/checkout?step=1`);
      }
      // G - Add person (guest or customer)
      else if ((e.key === 'g' || e.key === 'G') && !e.ctrlKey && !e.metaKey && table?.status !== 'livre') {
        e.preventDefault();
        setShowAddPersonModal(true);
      }
      // Q - Show QR Code
      else if ((e.key === 'q' || e.key === 'Q') && !e.ctrlKey && !e.metaKey && table?.status !== 'livre') {
        e.preventDefault();
        setShowQRCode(!showQRCode);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [open, table, allTables, onNavigate, onOpenChange, navigate, showGuestSplit, showQRCode, 
      showEndSessionDialog, showStartSessionDialog, addingGuest, showAddPersonModal, 
      showCustomerSearch, showForceCloseDialog, addPersonMode, tableOrders]);

  // Reset states when navigating between tables
  useEffect(() => {
    if (table?.id) {
      setShowGuestSplit(false);
      setAddingGuest(false);
      setSelectedOrder(null);
      setShowQRCode(false);
      setShowStartSessionDialog(false);
      setShowEndSessionDialog(false);
      setShowAddPersonModal(false);
      setShowCustomerSearch(false);
      setGuestToRemove(null);
    }
  }, [table?.id]);

  if (!table) return null;

  const currentIndex = allTables.findIndex((t) => t.id === table.id);
  const canNavigatePrev = currentIndex > 0;
  const canNavigateNext = currentIndex < allTables.length - 1;

  const handleNavigate = (direction: 'prev' | 'next') => {
    if (direction === 'prev' && canNavigatePrev) {
      onNavigate?.(allTables[currentIndex - 1]);
    } else if (direction === 'next' && canNavigateNext) {
      onNavigate?.(allTables[currentIndex + 1]);
    }
  };

  const totalOrders = tableOrders.length;
  
  // 🔧 FIX: Garantir que o totalAmount nunca seja menor que o valor já pago
  const totalAmount = useMemo(() => {
    let calculatedTotal = 0;
    if (ordersByGuestData?.totalAmount) {
      calculatedTotal = parseFloat(ordersByGuestData.totalAmount);
    } else {
      calculatedTotal = tableOrders.reduce((sum: number, order: any) => {
        return sum + parseFloat(order.totalPrice || '0');
      }, 0);
    }
    
    // O total da mesa deve ser no mínimo a soma de todos os subtotais dos convidados
    const sumOfGuestSubtotals = (ordersByGuestData?.ordersByGuest || []).reduce(
      (sum: number, og: any) => sum + parseFloat(og.subtotal || '0'), 
      0
    ) + (ordersByGuestData?.anonymousOrders || []).reduce(
      (sum: number, o: any) => sum + parseFloat(o.totalPrice || '0'),
      0
    );

    return Math.max(calculatedTotal, sumOfGuestSubtotals);
  }, [ordersByGuestData, tableOrders]);

  // 🔧 FIX: Get paid amount from ordersByGuestData
  const paidAmount = useMemo(() => {
    if (ordersByGuestData?.paidAmount) {
      const paid = parseFloat(ordersByGuestData.paidAmount);
      console.log('[DEBUG TableDetailsDialog] Calculated paidAmount:', paid);
      return paid;
    }
    console.log('[DEBUG TableDetailsDialog] No paidAmount in data, returning 0');
    return 0;
  }, [ordersByGuestData]);

  // Usar a query de guests ao invés de table.orders
  const activeGuests = guests.length;
  
  // 🔧 FIX: Usar startedAt da sessão atual, não createdAt da mesa
  const sessionStart = table.currentSession?.startedAt || null;
  const duration = sessionStart
    ? Math.floor((Date.now() - new Date(sessionStart).getTime()) / (1000 * 60))
    : 0;

  const status = table.status as keyof typeof statusConfig;
  const config = statusConfig[status] || statusConfig.livre;

  // 📊 Calculate average per guest
  const avgPerGuest = activeGuests > 0 ? totalAmount / activeGuests : 0;

  // ⏱️ Helper function to calculate order wait time and progress (dynamic based on items)
  const getOrderProgress = (orderDate: string, orderItems?: any[]) => {
    const minutes = differenceInMinutes(new Date(), new Date(orderDate));
    
    // Calculate expected time based on item categories
    let maxTime = 20; // Default
    if (orderItems && orderItems.length > 0) {
      const hasHotFood = orderItems.some((item: any) => {
        const category = typeof item.category === 'object' ? item.category?.name : item.category;
        return category?.toLowerCase().includes('prato') || 
               category?.toLowerCase().includes('grill') ||
               category?.toLowerCase().includes('cozinha');
      });
      const hasDrinks = orderItems.some((item: any) => {
        const category = typeof item.category === 'object' ? item.category?.name : item.category;
        return category?.toLowerCase().includes('bebida') || 
               category?.toLowerCase().includes('drink');
      });
      
      if (hasHotFood) {
        maxTime = 30; // Hot food takes longer
      } else if (hasDrinks && !hasHotFood) {
        maxTime = 10; // Drinks are quicker
      }
    }
    
    const progress = Math.min((minutes / maxTime) * 100, 100);
    const isDelayed = minutes > maxTime;
    return { minutes, progress, isDelayed, maxTime };
  };

  // 🎨 Check if order is new (less than 2 minutes)
  const isNewOrder = (orderDate: string) => {
    return differenceInMinutes(new Date(), new Date(orderDate)) < 2;
  };

  return (
    <>
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl w-[92vw] sm:w-full max-h-[90vh] p-0 gap-0 border-0 shadow-2xl bg-white dark:bg-slate-900 overflow-hidden">
        {/* Keyboard Shortcuts Help */}
        <div className="absolute top-2 left-1/2 transform -translate-x-1/2 z-50">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <button className="px-3 py-1 text-xs bg-slate-800/90 text-white rounded-full hover:bg-slate-700 transition-colors">
                  ⌨️ Atalhos
                </button>
              </TooltipTrigger>
              <TooltipContent className="max-w-xs">
                <div className="space-y-1 text-xs">
                  <div className="flex items-center gap-2">
                    <kbd className="px-1.5 py-0.5 bg-slate-800 rounded">N</kbd>
                    <span>Novo Pedido</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <kbd className="px-1.5 py-0.5 bg-slate-800 rounded">P</kbd>
                    <span>Checkout/Pagamento</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <kbd className="px-1.5 py-0.5 bg-slate-800 rounded">S</kbd>
                    <span>Dividir Conta</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <kbd className="px-1.5 py-0.5 bg-slate-800 rounded">G</kbd>
                    <span>Adicionar Pessoa</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <kbd className="px-1.5 py-0.5 bg-slate-800 rounded">Q</kbd>
                    <span>Mostrar QR Code</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <kbd className="px-1.5 py-0.5 bg-slate-800 rounded">←</kbd>
                    <kbd className="px-1.5 py-0.5 bg-slate-800 rounded">→</kbd>
                    <span>Navegar entre mesas</span>
                  </div>
                </div>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
        <div className="flex flex-col lg:flex-row h-full">
          {/* Main Content - Left Side */}
          <div className="flex-1 flex flex-col overflow-y-auto scrollbar-thin scrollbar-thumb-slate-300 dark:scrollbar-thumb-slate-700 min-w-0">
            {/* Header - Premium Gradient */}
            <div className="relative px-4 sm:px-6 lg:px-8 py-4 sm:py-6 bg-gradient-to-br from-[#0F172A] via-[#1E293B] to-[#0F172A] overflow-hidden">
              {/* Animated Background Pattern */}
              <div className="absolute inset-0 opacity-10">
                <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/20 via-violet-500/20 to-cyan-500/20" />
                <div
                  className="absolute inset-0 animate-[slide_20s_linear_infinite]"
                  style={{
                    backgroundImage: 'radial-gradient(circle at 2px 2px, rgba(255,255,255,0.15) 1px, transparent 0)',
                    backgroundSize: '32px 32px',
                    willChange: 'background-position'
                  }}
                />
              </div>
              {/* Close button */}
              <Button
                variant="ghost"
                size="icon"
                onClick={() => onOpenChange(false)}
                className="absolute top-4 right-4 h-10 w-10 rounded-full text-white hover:bg-white/10"
              >
                <X className="h-5 w-5" />
              </Button>

              {/* Navigation */}
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleNavigate('prev')}
                    disabled={!canNavigatePrev}
                    className="h-8 px-3 text-white hover:bg-white/10 disabled:opacity-30 rounded-lg"
                  >
                    <ChevronLeft className="h-4 w-4 mr-1" />
                    Anterior
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleNavigate('next')}
                    disabled={!canNavigateNext}
                    className="h-8 px-3 text-white hover:bg-white/10 disabled:opacity-30 rounded-lg"
                  >
                    Próxima
                    <ChevronRight className="h-4 w-4 ml-1" />
                  </Button>
                </div>

                {/* Keyboard Shortcuts Hint */}
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="flex items-center gap-2 text-xs text-white/40"
                >
                  <kbd className="px-2 py-1 bg-white/5 border border-white/10 rounded">←</kbd>
                  <kbd className="px-2 py-1 bg-white/5 border border-white/10 rounded">→</kbd>
                  <span>Navegar</span>
                  <span className="mx-2">•</span>
                  <kbd className="px-2 py-1 bg-white/5 border border-white/10 rounded">ESC</kbd>
                  <span>Fechar</span>
                </motion.div>
              </div>

              {/* Table Number - HUGE */}
              <div className="flex items-end gap-6">
                <div>
                  <p className="text-sm text-white/60 font-medium mb-1 uppercase tracking-wide">
                    Mesa
                  </p>
                  <h1 className="text-7xl font-black text-white leading-none">
                    {table.number}
                  </h1>
                </div>

                {/* Status Badge - Large with Gradient */}
                <div className="mb-2">
                  <div className={cn(
                    "inline-flex items-center gap-2 px-4 py-2 rounded-xl font-bold text-white shadow-lg",
                    `bg-gradient-to-r ${config.gradient}`
                  )}>
                    <motion.div
                      animate={{ scale: [1, 1.2, 1] }}
                      transition={{ duration: 2, repeat: Infinity }}
                    >
                      <Circle className="h-3 w-3 fill-current" />
                    </motion.div>
                    {config.label}
                  </div>
                  {table.capacity && (
                    <p className="text-sm text-white/60 mt-2">
                      Capacidade: {table.capacity} pessoas
                    </p>
                  )}
                </div>
              </div>

              {/* Session Bar */}
              {sessionStart && (
                <div className="mt-6 flex items-center gap-6 text-white/80 text-sm">
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    <span>
                      Aberta há {formatDistanceToNow(new Date(sessionStart), { 
                        locale: ptBR,
                        addSuffix: false
                      })}
                    </span>
                  </div>
                  {activeGuests > 0 && (
                    <>
                      <div className="h-4 w-px bg-white/20" />
                      <div className="flex items-center gap-2">
                        <Users className="h-4 w-4" />
                        <span>{activeGuests} {activeGuests === 1 ? 'convidado' : 'convidados'}</span>
                      </div>
                    </>
                  )}
                </div>
              )}
            </div>

            {/* Orders List - Dark Theme */}
            <ScrollArea className="flex-1 bg-gradient-to-b from-[#1E293B] via-[#1E293B] to-[#0F172A] relative">
              {/* Ambient Glow Effects */}
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-gradient-to-b from-indigo-500/5 to-transparent rounded-full blur-3xl" />
              <div className="absolute bottom-0 right-0 w-[400px] h-[400px] bg-gradient-to-tl from-violet-500/5 to-transparent rounded-full blur-3xl" />
              
              {/* Subtle Pattern */}
              <div className="absolute inset-0 opacity-[0.03]" style={{
                backgroundImage: 'radial-gradient(circle at 2px 2px, rgba(255,255,255,0.1) 1px, transparent 0)',
                backgroundSize: '32px 32px'
              }} />
              
              <div className="p-6 relative z-10">
                {/* ⚠️ Aviso: Mesa sem convidados */}
                {currentTable?.status === 'ocupada' && guests.length === 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-4 p-4 bg-amber-500/10 border-2 border-amber-500/30 rounded-xl backdrop-blur-sm"
                  >
                    <div className="flex items-start gap-3">
                      <AlertTriangle className="h-5 w-5 text-amber-400 flex-shrink-0 mt-0.5" />
                      <div className="flex-1">
                        <h3 className="text-sm font-semibold text-amber-300">
                          Mesa Ocupada sem Convidados
                        </h3>
                        <p className="text-xs text-amber-200/80 mt-1">
                          Esta mesa está marcada como ocupada mas não tem nenhum convidado. 
                          Adicione pelo menos uma pessoa para poder fazer pedidos.
                        </p>
                        <Button
                          onClick={() => setShowAddPersonModal(true)}
                          size="sm"
                          className="mt-3 bg-amber-500 hover:bg-amber-600 text-white"
                        >
                          <UserPlus className="h-4 w-4 mr-2" />
                          Adicionar Pessoa Agora
                        </Button>
                      </div>
                    </div>
                  </motion.div>
                )}
                
                {totalOrders > 0 ? (
                  <div className="space-y-4">
                    {/* Orders Header */}
                    <div className="flex items-center justify-between mb-6 p-4 bg-white/5 backdrop-blur-sm rounded-xl border border-white/10">
                      <div>
                        <h2 className="text-xl font-bold text-white">
                          Pedidos Ativos
                        </h2>
                        <p className="text-sm text-white/60 mt-0.5">
                          {totalOrders} {totalOrders === 1 ? 'pedido' : 'pedidos'} • {formatKwanza(totalAmount)}
                        </p>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        className="gap-2 border-white/20 text-white hover:bg-white/10"
                      >
                        <Printer className="h-4 w-4" />
                        Imprimir
                      </Button>
                    </div>

                    {/* Orders by Guest */}
                    {ordersByGuestData?.ordersByGuest && ordersByGuestData.ordersByGuest.length > 0 && (
                      <>
                        {ordersByGuestData.ordersByGuest.map(({ guest, orders, subtotal }: any) => (
                          <div key={guest.id} className="mb-6">
                            {/* Guest Header */}
                            <div className="flex items-center justify-between p-3 mb-3 bg-gradient-to-r from-indigo-500/20 to-violet-500/20 rounded-lg border border-indigo-500/30">
                              <div className="flex items-center gap-3">
                                <Avatar className="h-10 w-10 border-2 border-indigo-400">
                                  <AvatarFallback className="bg-gradient-to-br from-indigo-500 to-indigo-600 text-white font-bold">
                                    {guest.name ? guest.name.charAt(0).toUpperCase() : '#'}
                                  </AvatarFallback>
                                </Avatar>
                                <div>
                                  <h4 className="font-bold text-white">
                                    {guest.name || `Convidado ${guest.guestNumber || guest.seatNumber}`}
                                  </h4>
                                  <p className="text-xs text-white/60">
                                    {orders.length} {orders.length === 1 ? 'pedido' : 'pedidos'}
                                  </p>
                                </div>
                              </div>
                              <div className="text-right">
                                <p className="text-sm text-white/60">Subtotal</p>
                                <p className="text-xl font-bold bg-gradient-to-r from-indigo-400 to-violet-400 bg-clip-text text-transparent">
                                  {formatKwanza(parseFloat(subtotal))}
                                </p>
                              </div>
                            </div>
                            
                            {/* Guest's Orders */}
                            <div className="space-y-3 ml-4">
                              <AnimatePresence mode="popLayout">
                                {orders.map((order: any, index: number) => {
                        const orderStatus = order.status as keyof typeof orderStatusConfig;
                        const statusCfg = orderStatusConfig[orderStatus] || orderStatusConfig.pending;
                        const orderProgress = getOrderProgress(order.createdAt, order.items);
                        const isNew = isNewOrder(order.createdAt);
                        
                        return (
                          <motion.div
                            key={order.id}
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ 
                              opacity: 1, 
                              scale: 1, 
                              y: 0,
                              ...(isNew && {
                                boxShadow: [
                                  "0 0 0 0 rgba(59, 130, 246, 0.7)",
                                  "0 0 0 10px rgba(59, 130, 246, 0)",
                                  "0 0 0 0 rgba(59, 130, 246, 0)"
                                ]
                              })
                            }}
                            exit={{ opacity: 0, scale: 0.95, y: -20 }}
                            transition={{ 
                              delay: index * 0.05,
                              ...(isNew && {
                                boxShadow: {
                                  duration: 2,
                                  repeat: 3,
                                  ease: "easeOut"
                                }
                              })
                            }}
                            className={cn(
                              "bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl rounded-2xl border overflow-hidden hover:shadow-2xl transition-all relative",
                              isNew 
                                ? "border-indigo-400/50 shadow-xl shadow-indigo-500/20 hover:shadow-indigo-500/30" 
                                : "border-white/10 hover:border-white/20 hover:shadow-lg hover:shadow-black/20"
                            )}
                          >
                            {/* NEW Badge */}
                            {isNew && (
                              <motion.div
                                initial={{ scale: 0, rotate: -12 }}
                                animate={{ scale: 1, rotate: 0 }}
                                className="absolute top-3 right-3 z-10"
                              >
                                <Badge className={cn(
                                  "bg-gradient-to-r from-indigo-500 via-violet-500 to-indigo-500 text-white font-bold px-3 py-1 shadow-lg border-2 border-white",
                                  "animate-pulse"
                                )}>
                                  <Sparkles className="h-3 w-3 mr-1" />
                                  NOVO
                                </Badge>
                              </motion.div>
                            )}

                            {/* Order Header */}
                            <div className="flex items-center justify-between p-5 border-b border-white/10 bg-gradient-to-r from-white/5 to-transparent">
                              <div className="flex items-center gap-4">
                                <motion.div 
                                  className={cn(
                                    "h-14 w-14 rounded-xl flex items-center justify-center relative",
                                    statusCfg.lightColor
                                  )}
                                  whileHover={{ scale: 1.05, rotate: 5 }}
                                  transition={{ type: "spring", stiffness: 400 }}
                                >
                                  <Receipt className={cn("h-7 w-7", statusCfg.textColor)} />
                                </motion.div>
                                <div>
                                  <h3 className="text-lg font-bold text-white">
                                    Pedido #{order.orderNumber || order.id.slice(0, 8).toUpperCase()}
                                  </h3>
                                  <div className="flex items-center gap-2 mt-0.5">
                                    <p className="text-sm text-white/60 flex items-center gap-1">
                                      <Clock className="h-3.5 w-3.5" />
                                      {format(new Date(order.createdAt), "HH:mm", { locale: ptBR })}
                                    </p>
                                    <span className="text-white/30">•</span>
                                    <p className={cn(
                                      "text-sm font-medium flex items-center",
                                      orderProgress.isDelayed ? "text-red-400" : "text-white/60"
                                    )}>
                                      {orderProgress.isDelayed && <AlertCircle className="h-3.5 w-3.5 inline mr-1" />}
                                      {orderProgress.minutes}min
                                    </p>
                                  </div>
                                  
                                  {/* Progress Bar */}
                                  <div className="mt-2 w-48">
                                    <Progress 
                                      value={orderProgress.progress} 
                                      className="h-1.5"
                                      style={{
                                        backgroundColor: orderProgress.isDelayed ? COLORS.danger.bg : COLORS.primary.bg
                                      }}
                                      indicatorClassName={cn(
                                        orderProgress.isDelayed ? "bg-red-500" : "bg-indigo-500"
                                      )}
                                    />
                                  </div>
                                </div>
                              </div>

                              <div className="flex items-center gap-3">
                                <Badge
                                  className={cn(
                                    "px-3 py-1.5 font-bold text-white border-0 shadow-md",
                                    `bg-gradient-to-r ${statusCfg.gradient}`
                                  )}
                                >
                                  {statusCfg.label}
                                </Badge>
                                <DropdownMenu 
                                  open={selectedOrderMenu === order.id} 
                                  onOpenChange={(open) => setSelectedOrderMenu(open ? order.id : null)}
                                >
                                  <DropdownMenuTrigger asChild>
                                    <Button 
                                      variant="ghost" 
                                      size="icon" 
                                      className="h-10 w-10 hover:bg-white/20 rounded-xl text-white"
                                    >
                                      <MoreHorizontal className="h-5 w-5" />
                                    </Button>
                                  </DropdownMenuTrigger>
                                  <DropdownMenuContent align="end" className="w-56">
                                    <DropdownMenuLabel>Ações do Pedido</DropdownMenuLabel>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem 
                                      onClick={() => setOrderToEdit(order)}
                                      disabled={order.status === 'cancelled' || order.status === 'completed'}
                                    >
                                      <Pencil className="h-4 w-4 mr-2" />
                                      Editar Pedido
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => navigate(`/orders/${order.id}`)}>
                                      <Eye className="h-4 w-4 mr-2" />
                                      Ver Detalhes
                                    </DropdownMenuItem>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem 
                                      className="text-red-600 focus:text-red-600"
                                      onClick={() => setOrderToCancel(order)}
                                      disabled={order.status === 'cancelled' || order.status === 'completed'}
                                    >
                                      <X className="h-4 w-4 mr-2" />
                                      Cancelar Pedido
                                    </DropdownMenuItem>
                                  </DropdownMenuContent>
                                </DropdownMenu>
                              </div>
                            </div>

                            {/* Order Items */}
                            {order.items && order.items.length > 0 && (
                              <div className="p-5 bg-gradient-to-b from-white/5 to-transparent">
                                <div className="space-y-3">
                                  {order.items.map((item: any, itemIdx: number) => (
                                    <motion.div
                                      key={item.id}
                                      initial={{ opacity: 0, x: -20 }}
                                      animate={{ opacity: 1, x: 0 }}
                                      transition={{ delay: itemIdx * 0.05 }}
                                      whileHover={{ x: 4 }}
                                      className="flex items-center gap-4 group hover:bg-white/10 hover:shadow-lg p-3 rounded-xl transition-all cursor-pointer border border-transparent hover:border-white/20"
                                    >
                                      {/* Item Image or Icon */}
                                      <div className="relative flex-shrink-0">
                                        {item.imageUrl ? (
                                          <motion.div
                                            whileHover={{ scale: 1.05 }}
                                            className="h-16 w-16 rounded-xl overflow-hidden border-2 border-slate-200"
                                          >
                                            <img
                                              src={item.imageUrl}
                                              alt={item.name}
                                              className="h-full w-full object-cover"
                                            />
                                          </motion.div>
                                        ) : (
                                          <div className="h-16 w-16 rounded-xl bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center">
                                            <Utensils className="h-7 w-7 text-slate-400" />
                                          </div>
                                        )}
                                        {/* Quantity Badge */}
                                        <motion.div 
                                          className="absolute -top-2 -right-2 h-7 w-7 rounded-full flex items-center justify-center font-bold text-white text-sm shadow-lg border-2 border-white bg-gradient-to-br from-indigo-500 to-indigo-600"
                                          whileHover={{ scale: 1.1, rotate: 10 }}
                                          transition={{ type: "spring", stiffness: 400 }}
                                        >
                                          {item.quantity}
                                        </motion.div>
                                      </div>

                                      {/* Item Details */}
                                      <div className="flex-1 min-w-0">
                                        <p className="font-semibold text-white truncate">
                                          {item.name}
                                        </p>
                                        <div className="flex items-center gap-2 mt-1">
                                          <p className="text-sm text-white/60">
                                            {formatKwanza(item.price)} cada
                                          </p>
                                          {item.options && item.options.length > 0 && (
                                            <>
                                              <span className="text-white/30">•</span>
                                              <p className="text-xs text-white/50 truncate">
                                                {item.options.map((opt: any) => opt.name).join(', ')}
                                              </p>
                                            </>
                                          )}
                                        </div>
                                      </div>

                                      {/* Item Price */}
                                      <div className="text-right flex-shrink-0">
                                        <p className="text-lg font-bold text-white">
                                          {formatKwanza(item.price * item.quantity)}
                                        </p>
                                      </div>
                                    </motion.div>
                                  ))}
                                </div>

                                {/* Order Total */}
                                <Separator className="my-4 bg-white/10" />
                                <div className="flex items-center justify-between">
                                  <span className="text-base font-bold text-white">
                                    Total do Pedido
                                  </span>
                                  <span className="text-2xl font-black bg-gradient-to-r from-indigo-400 to-violet-400 bg-clip-text text-transparent">
                                    {formatKwanza(order.totalPrice)}
                                  </span>
                                </div>
                              </div>
                            )}
                          </motion.div>
                                  );
                                })}
                              </AnimatePresence>
                            </div>
                          </div>
                        ))}
                      </>
                    )}
                    
                    {/* Anonymous Orders (without guest) */}
                    {ordersByGuestData?.anonymousOrders && ordersByGuestData.anonymousOrders.length > 0 && (
                      <div className="mt-6">
                        <div className="flex items-center gap-2 mb-3 p-2 bg-gray-500/10 rounded-lg border border-gray-500/20">
                          <Users className="h-5 w-5 text-gray-400" />
                          <span className="font-semibold text-white/80">Pedidos Sem Convidado</span>
                          <Badge variant="outline" className="ml-auto">
                            {ordersByGuestData.anonymousOrders.length}
                          </Badge>
                        </div>
                        <div className="space-y-3 ml-4">
                          <AnimatePresence mode="popLayout">
                            {ordersByGuestData.anonymousOrders.map((order: any, index: number) => {
                              const orderStatus = order.status as keyof typeof orderStatusConfig;
                              const statusCfg = orderStatusConfig[orderStatus] || orderStatusConfig.pending;
                              const orderProgress = getOrderProgress(order.createdAt, order.items);
                              const isNew = isNewOrder(order.createdAt);
                              
                              return (
                                <motion.div
                                  key={order.id}
                                  initial={{ opacity: 0, scale: 0.95, y: 20 }}
                                  animate={{ opacity: 1, scale: 1, y: 0 }}
                                  exit={{ opacity: 0, scale: 0.95, y: -20 }}
                                  transition={{ delay: index * 0.05 }}
                                  className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl rounded-2xl border border-white/10 overflow-hidden hover:shadow-2xl transition-all relative p-4"
                                >
                                  <div className="flex items-center justify-between">
                                    <div className="flex-1">
                                      <p className="font-bold text-white">
                                        Pedido #{order.orderNumber || order.id.slice(0, 8).toUpperCase()}
                                      </p>
                                      <p className="text-sm text-white/60">
                                        {order.items?.length || 0} {order.items?.length === 1 ? 'item' : 'itens'}
                                      </p>
                                    </div>
                                    <Badge className={cn("px-3 py-1.5 font-bold text-white border-0", `bg-gradient-to-r ${statusCfg.gradient}`)}>
                                      {statusCfg.label}
                                    </Badge>
                                  </div>
                                </motion.div>
                              );
                            })}
                          </AnimatePresence>
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  /* Empty State - Dark Theme */
                  <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex flex-col items-center justify-center py-20"
                  >
                    {table.status === 'livre' ? (
                      /* Empty State - Mesa Livre */
                      <>
                        <motion.div 
                          className="h-32 w-32 rounded-3xl bg-gradient-to-br from-indigo-500/10 to-violet-500/10 border-2 border-indigo-500/30 flex items-center justify-center mb-6 relative backdrop-blur-xl"
                          animate={{ 
                            y: [0, -10, 0],
                          }}
                          transition={{
                            duration: 2,
                            repeat: Infinity,
                            ease: "easeInOut"
                          }}
                        >
                          <Play className="h-16 w-16 text-indigo-400" />
                        </motion.div>
                        <h3 className="text-2xl font-bold text-white mb-2">
                          Mesa Disponível
                        </h3>
                        <p className="text-white/60 text-center max-w-sm mb-8">
                          Esta mesa está disponível para receber clientes.<br/>
                          <strong className="text-white">Inicie uma sessão</strong> primeiro para poder criar pedidos.
                        </p>
                        <Button
                          onClick={() => setShowStartSessionDialog(true)}
                          className="bg-gradient-to-r from-indigo-500 to-indigo-600 hover:from-indigo-600 hover:to-indigo-700 text-white font-bold shadow-xl hover:shadow-2xl"
                          size="lg"
                        >
                          <Play className="h-5 w-5 mr-2" />
                          Iniciar Sessão
                        </Button>
                      </>
                    ) : (
                      /* Empty State - Mesa Ocupada sem Pedidos */
                      <>
                        <motion.div 
                          className="h-32 w-32 rounded-3xl bg-white/5 border border-white/10 flex items-center justify-center mb-6 relative backdrop-blur-xl"
                          animate={{ 
                            y: [0, -10, 0],
                          }}
                          transition={{
                            duration: 2,
                            repeat: Infinity,
                            ease: "easeInOut"
                          }}
                        >
                          <ShoppingBag className="h-16 w-16 text-white/30" />
                          <motion.div
                            className="absolute -top-2 -right-2 h-8 w-8 bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-full flex items-center justify-center shadow-lg shadow-indigo-500/50"
                            animate={{ scale: [1, 1.2, 1] }}
                            transition={{ duration: 2, repeat: Infinity }}
                          >
                            <Plus className="h-5 w-5 text-white" />
                          </motion.div>
                        </motion.div>
                        <h3 className="text-2xl font-bold text-white mb-2">
                          Nenhum pedido ainda
                        </h3>
                        <p className="text-white/60 text-center max-w-sm mb-8">
                          Comece a criar pedidos para esta mesa usando o botão abaixo ou pressione <kbd className="px-2 py-1 text-xs bg-white/10 border border-white/20 rounded text-white/80">N</kbd>
                        </p>
                      </>
                    )}
                  </motion.div>
                )}
              </div>
            </ScrollArea>
          </div>

          {/* Sidebar - Right Side - Premium Dark */}
          <div className="w-full lg:w-96 bg-gradient-to-br from-[#0F172A] to-[#1E293B] flex flex-col relative overflow-y-auto scrollbar-thin scrollbar-thumb-slate-700 shrink-0">
            {/* Ambient Glow */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-indigo-500/10 to-violet-500/10 rounded-full blur-3xl" />
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-gradient-to-tr from-cyan-500/10 to-indigo-500/10 rounded-full blur-3xl" />
            
            {/* Total Section - Only for occupied tables */}
            {table.status !== 'livre' && (
              <div className="p-6 bg-gradient-to-br from-[#1E293B]/80 to-[#0F172A]/80 backdrop-blur-sm relative z-10">
                <p className="text-sm text-white/60 font-medium uppercase tracking-wide mb-2">
                  Total da Mesa
                </p>
                <motion.p 
                  className="text-5xl font-black text-white mb-1"
                  key={totalAmount}
                  initial={{ scale: 1.2, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  {formatKwanza(totalAmount)}
                </motion.p>
                
                {/* 🔧 FIX: Show paid amount and remaining */}
                {(() => {
                  console.log('[DEBUG TableDetailsDialog] Rendering payment section. paidAmount:', paidAmount, 'totalAmount:', totalAmount);
                  return paidAmount > 0 && (
                    <div className="mt-3 space-y-2 p-3 bg-white/5 backdrop-blur-sm rounded-lg border border-white/10">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-white/60">Pago</span>
                        <span className="text-green-400 font-semibold">{formatKwanza(paidAmount)}</span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-white/80 font-medium">Restante</span>
                        <span className={cn(
                          "font-bold",
                          totalAmount - paidAmount > 0 ? "text-orange-400" : "text-green-400"
                        )}>
                          {formatKwanza(totalAmount - paidAmount)}
                        </span>
                      </div>
                    </div>
                  );
                })()}
                
                <div className="flex items-center justify-between mt-2">
                  {totalOrders > 0 && (
                    <p className="text-sm text-white/60">
                      {totalOrders} {totalOrders === 1 ? 'pedido' : 'pedidos'}
                    </p>
                  )}
                  {activeGuests > 0 && (
                    <div className="flex items-center gap-1.5 text-sm">
                      <TrendingUp className="h-3.5 w-3.5 text-emerald-400" />
                      <span className="text-white/80 font-medium">
                        {formatKwanza(avgPerGuest)}/pessoa
                      </span>
                    </div>
                  )}
                </div>
              </div>
            )}
            
            {/* Empty State for Available Table */}
            {table.status === 'livre' && (
              <div className="p-6 bg-gradient-to-br from-[#1E293B]/80 to-[#0F172A]/80 backdrop-blur-sm relative z-10">
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-center py-8"
                >
                  <div className="h-20 w-20 rounded-full bg-gradient-to-br from-indigo-500/20 to-violet-500/20 border-2 border-indigo-500/30 flex items-center justify-center mx-auto mb-4">
                    <Play className="h-10 w-10 text-indigo-400" />
                  </div>
                  <h3 className="text-lg font-bold text-white mb-2">Mesa Disponível</h3>
                  <p className="text-sm text-white/60">
                    Inicie uma sessão para começar a atender
                  </p>
                </motion.div>
              </div>
            )}

            {/* Quick Stats - Only for occupied tables */}
            {table.status !== 'livre' && (
              <div className="p-6 border-t border-white/10 relative z-10">
                <div className="grid grid-cols-2 gap-3">
                  <motion.div 
                    className="bg-gradient-to-br from-indigo-500/10 to-indigo-600/10 backdrop-blur-sm rounded-xl p-4 border border-indigo-500/20"
                    whileHover={{ scale: 1.05 }}
                    transition={{ type: "spring", stiffness: 300 }}
                  >
                    <Users className="h-6 w-6 text-indigo-400 mb-2" />
                    <p className="text-2xl font-bold text-white">{activeGuests}</p>
                    <p className="text-xs text-white/60">Convidados</p>
                  </motion.div>
                  <motion.div 
                    className="bg-gradient-to-br from-amber-500/10 to-amber-600/10 backdrop-blur-sm rounded-xl p-4 border border-amber-500/20"
                    whileHover={{ scale: 1.05 }}
                    transition={{ type: "spring", stiffness: 300 }}
                  >
                    <Timer className="h-6 w-6 text-amber-400 mb-2" />
                    <p className="text-2xl font-bold text-white">{duration}</p>
                    <p className="text-xs text-white/60">Minutos</p>
                  </motion.div>
                </div>
              </div>
            )}

            {/* Convidados na Mesa - SEMPRE VISÍVEL */}
            {guests.length > 0 && (
              <div className="px-6 pb-4">
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-4 bg-gradient-to-br from-violet-500/10 to-violet-600/10 border border-violet-500/20 rounded-2xl"
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <Users className="h-5 w-5 text-violet-400" />
                      <span className="text-sm font-bold text-white">Convidados</span>
                    </div>
                    <Badge className="bg-violet-500/20 text-violet-300 border-violet-500/30">
                      {guests.length}
                    </Badge>
                  </div>

                  <ScrollArea className="max-h-40">
                    <div className="space-y-2 pr-2">
                      {guests.map((guest: any, idx: number) => (
                        <motion.div
                          key={guest.id}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: idx * 0.05 }}
                          className="flex items-center justify-between p-2 bg-white/5 rounded-lg hover:bg-white/10 transition-colors group"
                        >
                          <div className="flex items-center gap-2 flex-1 min-w-0">
                            <Avatar className="h-7 w-7 border-2 border-violet-400/30 flex-shrink-0">
                              <AvatarFallback className="bg-gradient-to-br from-violet-500 to-violet-600 text-white text-xs font-bold">
                                {guest.name ? guest.name.charAt(0).toUpperCase() : `${idx + 1}`}
                              </AvatarFallback>
                            </Avatar>
                            <div className="flex flex-col flex-1 min-w-0">
                              <span className="text-xs text-white font-medium truncate">
                                {guest.name || `Convidado ${idx + 1}`}
                              </span>
                              {guest.customerId && (
                                <Badge variant="outline" className="w-fit text-[9px] px-1 py-0 h-3.5 mt-0.5 bg-green-500/10 text-green-400 border-green-500/30">
                                  Cliente
                                </Badge>
                              )}
                            </div>
                          </div>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity text-red-400 hover:bg-red-500/10 hover:text-red-300"
                            onClick={() => setGuestToRemove(guest.id)}
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </motion.div>
                      ))}
                    </div>
                  </ScrollArea>

                  {totalAmount > 0 && (
                    <div className="mt-3 pt-3 border-t border-violet-500/20">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-white/60">Média por pessoa:</span>
                        <span className="text-violet-300 font-bold">
                          {formatKwanza(totalAmount / guests.length)}
                        </span>
                      </div>
                    </div>
                  )}
                </motion.div>
              </div>
            )}

            {/* Actions */}
            <div className="flex-1 p-6 pb-8">
              <div className="space-y-3">
                {/* Primary Actions */}
                <motion.div
                  whileHover={table.status !== 'livre' ? { scale: 1.02 } : {}}
                  whileTap={table.status !== 'livre' ? { scale: 0.98 } : {}}
                  className="relative"
                >
                  <Button
                    onClick={(e) => {
                      if (table.status === 'livre') {
                        return;
                      }
                      e.preventDefault();
                      e.stopPropagation();
                      setShowQuickOrder(true);
                    }}
                    disabled={table.status === 'livre'}
                    className={cn(
                      "w-full h-14 font-bold text-base rounded-xl shadow-xl transition-all relative overflow-hidden group border-0",
                      table.status === 'livre'
                        ? "bg-gradient-to-r from-slate-500 to-slate-600 text-white/50 cursor-not-allowed"
                        : "bg-gradient-to-r from-indigo-500 to-indigo-600 hover:from-indigo-600 hover:to-indigo-700 text-white hover:shadow-2xl"
                    )}
                    size="lg"
                  >
                    {table.status !== 'livre' && (
                      <>
                        <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/25 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                      </>
                    )}
                    <Plus className="h-5 w-5 mr-2 relative z-10" />
                    <span className="relative z-10">Novo Pedido</span>
                    {table.status !== 'livre' && (
                      <kbd className="ml-auto px-2 py-1 text-xs bg-white/20 rounded relative z-10">N</kbd>
                    )}
                  </Button>
                  {table.status === 'livre' && (
                    <p className="text-xs text-white/50 text-center mt-1">Inicie uma sessão primeiro</p>
                  )}
                </motion.div>

                <motion.div
                  whileHover={table.status !== 'livre' && totalOrders > 0 ? { scale: 1.02 } : {}}
                  whileTap={table.status !== 'livre' && totalOrders > 0 ? { scale: 0.98 } : {}}
                  className="relative"
                >
                  <Button
                    onClick={() => {
                      onOpenChange(false);
                      navigate(`/tables/${table.id}/checkout?step=1`);
                    }}
                    disabled={table.status === 'livre' || totalOrders === 0}
                    className={cn(
                      "w-full h-14 font-bold text-base rounded-xl shadow-xl transition-all relative overflow-hidden group border-0",
                      table.status === 'livre' || totalOrders === 0
                        ? "bg-gradient-to-r from-slate-500 to-slate-600 text-white/50 cursor-not-allowed"
                        : "bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white hover:shadow-2xl"
                    )}
                    size="lg"
                  >
                    {table.status !== 'livre' && totalOrders > 0 && (
                      <>
                        <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/25 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                      </>
                    )}
                    <CreditCard className="h-5 w-5 mr-2 relative z-10" />
                    <span className="relative z-10">Checkout</span>
                    {table.status !== 'livre' && totalOrders > 0 && (
                      <kbd className="ml-auto px-2 py-1 text-xs bg-white/20 rounded relative z-10">P</kbd>
                    )}
                  </Button>
                  {table.status === 'livre' && (
                    <p className="text-xs text-white/50 text-center mt-1">Inicie uma sessão primeiro</p>
                  )}
                  {table.status !== 'livre' && totalOrders === 0 && (
                    <p className="text-xs text-white/50 text-center mt-1">Adicione pedidos primeiro</p>
                  )}
                </motion.div>

                <Separator className="my-4 bg-white/10" />

                {/* Secondary Actions */}
                {table.status === 'livre' ? (
                  <Button
                    variant="ghost"
                    className="w-full justify-start text-white hover:bg-white/10 h-12 rounded-xl"
                    onClick={() => setShowStartSessionDialog(true)}
                  >
                    <Play className="h-5 w-5 mr-3" />
                    Iniciar Sessão
                  </Button>
                ) : (
                  <>
                    <Button
                      variant="ghost"
                      className="w-full justify-start text-white hover:bg-white/10 h-12 rounded-xl"
                      disabled={!table?.currentSessionId}
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        
                        // Validar se há sessão ativa
                        if (!table?.currentSessionId) {
                          toast({
                            title: 'Sessão não iniciada',
                            description: 'Por favor, inicie uma sessão primeiro para adicionar pessoas.',
                            variant: 'destructive',
                          });
                          return;
                        }
                        
                        setShowAddPersonModal(true);
                      }}
                    >
                      <UserPlus className="h-5 w-5 mr-3" />
                      Adicionar Pessoa
                      <kbd className="ml-auto px-2 py-1 text-xs bg-white/10 rounded">G</kbd>
                    </Button>

                    <Button
                      variant="ghost"
                      className="w-full justify-start text-white hover:bg-white/10 h-12 rounded-xl"
                      onClick={() => setShowGuestSplit(!showGuestSplit)}
                    >
                      <Split className="h-5 w-5 mr-3" />
                      Dividir Conta
                      <kbd className="ml-auto px-2 py-1 text-xs bg-white/10 rounded">S</kbd>
                    </Button>
                  </>
                )}

                {/* Guest Split View */}
                <AnimatePresence>
                  {showGuestSplit && activeGuests > 0 && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      className="overflow-hidden"
                    >
                      <div className="mt-3 p-4 bg-white/5 rounded-xl space-y-2">
                        <p className="text-sm text-white/80 font-medium mb-3">
                          Divisão por Convidado:
                        </p>
                        {Array.from({ length: activeGuests }).map((_, idx) => (
                          <div 
                            key={idx}
                            className="flex items-center justify-between p-3 bg-white/5 rounded-lg hover:bg-white/10 transition-colors"
                          >
                            <div className="flex items-center gap-3">
                              <Avatar className="h-8 w-8 border-2 border-white/20">
                                <AvatarFallback className="bg-gradient-to-br from-blue-500 to-blue-600 text-white text-xs font-bold">
                                  #{idx + 1}
                                </AvatarFallback>
                              </Avatar>
                              <span className="text-sm text-white/90">
                                Convidado {idx + 1}
                              </span>
                            </div>
                            <span className="text-sm font-bold text-white">
                              {formatKwanza(avgPerGuest)}
                            </span>
                          </div>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {table.status !== 'livre' && (
                  <>
                    <Button
                      variant="ghost"
                      className="w-full justify-start text-white hover:bg-white/10 h-12 rounded-xl"
                      onClick={() => setShowQRCode(!showQRCode)}
                    >
                      <QrCode className="h-5 w-5 mr-3" />
                      QR Code Auto-Registro
                      <kbd className="ml-auto px-2 py-1 text-xs bg-white/10 rounded">Q</kbd>
                    </Button>

                    <Button
                      variant="ghost"
                      className="w-full justify-start text-white hover:bg-white/10 h-12 rounded-xl"
                      onClick={() => setShowPrintBill(true)}
                    >
                      <Printer className="h-5 w-5 mr-3" />
                      Imprimir Conta
                    </Button>

                    <Separator className="my-2 bg-white/10" />

                    <DropdownMenu open={showStatusMenu} onOpenChange={setShowStatusMenu}>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          className="w-full justify-start text-white hover:bg-white/10 h-12 rounded-xl"
                        >
                          <Settings className="h-5 w-5 mr-3" />
                          Mudar Status
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent className="w-56" align="end">
                        <DropdownMenuLabel>Status da Mesa</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={() => updateStatusMutation.mutate('livre')}>
                          <Circle className="h-4 w-4 mr-2 fill-slate-500" />
                          Disponível
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => updateStatusMutation.mutate('ocupada')}>
                          <Circle className="h-4 w-4 mr-2 fill-indigo-500" />
                          Ocupada
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => updateStatusMutation.mutate('em_andamento')}>
                          <Circle className="h-4 w-4 mr-2 fill-cyan-500" />
                          Servindo
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => updateStatusMutation.mutate('aguardando_pagamento')}>
                          <Circle className="h-4 w-4 mr-2 fill-amber-500" />
                          Aguardando Pagamento
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>

                    <Button
                      variant="ghost"
                      className="w-full justify-start text-red-400 hover:bg-red-500/10 hover:text-red-300 h-12 rounded-xl"
                      onClick={() => setShowEndSessionDialog(true)}
                    >
                      <StopCircle className="h-5 w-5 mr-3" />
                      Encerrar Sessão
                    </Button>
                  </>
                )}
              </div>
            </div>

            {/* Session Info at Bottom */}
            {sessionStart && (
              <div className="p-6 border-t border-white/10">
                <div className="flex items-center gap-3 text-white/60 text-sm">
                  <Clock className="h-4 w-4" />
                  <div>
                    <p className="text-white/80 font-medium">Aberta em</p>
                    <p>{format(new Date(sessionStart), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </DialogContent>

      {/* Diálogo: Iniciar Sessão */}
      <AlertDialog open={showStartSessionDialog} onOpenChange={setShowStartSessionDialog}>
        <AlertDialogContent className="bg-gradient-to-br from-slate-900 to-slate-800 text-white border-white/10">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-2xl font-bold">Iniciar Sessão</AlertDialogTitle>
            <AlertDialogDescription className="text-white/70">
              Quantas pessoas vão usar a mesa {table?.number}?
            </AlertDialogDescription>
          </AlertDialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="grid grid-cols-4 gap-2">
              {[1, 2, 3, 4].map((num) => (
                <Button
                  key={num}
                  variant={selectedPeopleCount === num ? 'default' : 'outline'}
                  onClick={() => {
                    setSelectedPeopleCount(num);
                    setCustomPeopleCount('');
                  }}
                  className={cn(
                    "h-16 text-lg font-bold",
                    selectedPeopleCount === num 
                      ? "bg-gradient-to-br from-indigo-500 to-indigo-600 text-white" 
                      : "border-white/20 text-white hover:bg-white/10"
                  )}
                >
                  {num}
                </Button>
              ))}
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="custom-count" className="text-white/80">Outro número:</Label>
              <Input
                id="custom-count"
                type="number"
                placeholder="Digite o número de pessoas"
                value={customPeopleCount}
                onChange={(e) => {
                  setCustomPeopleCount(e.target.value);
                  setSelectedPeopleCount(null);
                }}
                className="bg-white/10 border-white/20 text-white placeholder:text-white/40"
              />
            </div>
          </div>

          <AlertDialogFooter>
            <AlertDialogCancel className="bg-white/10 border-white/20 text-white hover:bg-white/20">
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={() => startSessionMutation.mutate()}
              disabled={!selectedPeopleCount && !customPeopleCount || startSessionMutation.isPending}
              className="bg-gradient-to-r from-indigo-500 to-indigo-600 hover:from-indigo-600 hover:to-indigo-700"
            >
              {startSessionMutation.isPending ? 'Iniciando...' : 'Iniciar Sessão'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Diálogo: Encerrar Sessão */}
      <AlertDialog open={showEndSessionDialog} onOpenChange={setShowEndSessionDialog}>
        <AlertDialogContent className="bg-gradient-to-br from-slate-900 to-slate-800 text-white border-white/10">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-2xl font-bold text-red-400">Encerrar Sessão?</AlertDialogTitle>
            <AlertDialogDescription className="text-white/70">
              Tem certeza que deseja encerrar a sessão da mesa {table?.number}? Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="bg-white/10 border-white/20 text-white hover:bg-white/20">
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={() => endSessionMutation.mutate(false)}
              disabled={endSessionMutation.isPending}
              className="bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700"
            >
              {endSessionMutation.isPending ? 'Encerrando...' : 'Encerrar Sessão'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Diálogo: Forçar Encerramento (Admin Only) */}
      <AlertDialog open={showForceCloseDialog} onOpenChange={setShowForceCloseDialog}>
        <AlertDialogContent className="bg-gradient-to-br from-red-900 to-red-800 text-white border-red-500/20">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-2xl font-bold flex items-center gap-2">
              <AlertCircle className="h-6 w-6" />
              Mesa com Valores Pendentes
            </AlertDialogTitle>
            <AlertDialogDescription className="text-white/90">
              Atenção! Esta mesa possui valores que ainda não foram pagos.
            </AlertDialogDescription>
          </AlertDialogHeader>
          
          {validationError && (
            <div className="space-y-4 py-4">
              <div className="p-4 bg-red-950/50 rounded-lg border border-red-500/30">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm font-medium text-white/80">Total Pendente:</span>
                  <span className="text-2xl font-black text-red-300">
                    {validationError.pendingAmount}
                  </span>
                </div>
                
                {validationError.unpaidGuests && validationError.unpaidGuests.length > 0 && (
                  <div className="mt-3 pt-3 border-t border-red-500/20">
                    <p className="text-xs text-white/70 mb-2">Convidados com valores pendentes:</p>
                    <ul className="space-y-1">
                      {validationError.unpaidGuests.map((guest: any) => (
                        <li key={guest.id} className="text-sm text-white/90 flex items-center justify-between">
                          <span>{guest.name || `Convidado ${guest.guestNumber}`}</span>
                          <span className="font-bold">{formatKwanza(parseFloat(guest.pending))}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                
                {validationError.warnings && validationError.warnings.length > 0 && (
                  <div className="mt-3 space-y-1">
                    {validationError.warnings.map((warning: string, idx: number) => (
                      <p key={idx} className="text-xs text-yellow-300">⚠️ {warning}</p>
                    ))}
                  </div>
                )}
              </div>
              
              <div className="p-3 bg-yellow-950/30 rounded-lg border border-yellow-500/30">
                <p className="text-sm text-yellow-200">
                  <strong>Apenas administradores</strong> podem forçar o encerramento de uma mesa com valores pendentes.
                  Esta ação deve ser registrada e justificada.
                </p>
              </div>
            </div>
          )}

          <AlertDialogFooter>
            <AlertDialogCancel className="bg-white/10 border-white/20 text-white hover:bg-white/20">
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                endSessionMutation.mutate(true); // forceClose = true
                setShowForceCloseDialog(false);
              }}
              disabled={endSessionMutation.isPending}
              className="bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800"
            >
              {endSessionMutation.isPending ? 'Encerrando...' : 'Forçar Encerramento'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Diálogo: Confirmar Remoção de Guest */}
      <AlertDialog open={!!guestToRemove} onOpenChange={(open) => !open && setGuestToRemove(null)}>
        <AlertDialogContent className="bg-gradient-to-br from-red-900 to-red-800 text-white border-red-500/20">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-2xl font-bold flex items-center gap-2">
              <AlertCircle className="h-6 w-6" />
              Remover Pessoa da Mesa?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-white/90">
              Tem certeza que deseja remover esta pessoa da mesa? Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          
          <div className="p-4 bg-red-950/50 rounded-lg border border-red-500/30">
            <p className="text-sm text-white/80">
              <strong>Atenção:</strong> Se esta pessoa tiver pedidos associados, eles permanecerão na mesa mas sem vínculo.
            </p>
          </div>

          <AlertDialogFooter>
            <AlertDialogCancel className="bg-white/10 border-white/20 text-white hover:bg-white/20">
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (guestToRemove) {
                  removeGuestMutation.mutate(guestToRemove);
                  setGuestToRemove(null);
                }
              }}
              disabled={removeGuestMutation.isPending}
              className="bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800"
            >
              {removeGuestMutation.isPending ? 'Removendo...' : 'Sim, Remover'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Diálogo: Cancelar Pedido */}
      <AlertDialog open={!!orderToCancel} onOpenChange={(open) => !open && setOrderToCancel(null)}>
        <AlertDialogContent className="bg-gradient-to-br from-red-900 to-red-800 text-white border-red-500/20">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-2xl font-bold flex items-center gap-2">
              <AlertCircle className="h-6 w-6" />
              Cancelar Pedido?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-white/90">
              Tem certeza que deseja cancelar o pedido #{orderToCancel?.orderNumber || orderToCancel?.id?.slice(0, 8)}?
              Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          
          {orderToCancel?.items && (
            <div className="p-4 bg-red-950/50 rounded-lg border border-red-500/30">
              <p className="text-sm font-semibold text-white mb-2">Itens do pedido:</p>
              <ul className="space-y-1 text-sm text-white/80">
                {orderToCancel.items.map((item: any) => (
                  <li key={item.id}>
                    • {item.quantity}x {item.name} - {formatKwanza(item.price * item.quantity)}
                  </li>
                ))}
              </ul>
              <div className="mt-3 pt-3 border-t border-red-500/30">
                <p className="text-sm font-bold text-white">
                  Total: {formatKwanza(orderToCancel.totalPrice)}
                </p>
              </div>
            </div>
          )}

          <AlertDialogFooter>
            <AlertDialogCancel className="bg-white/10 border-white/20 text-white hover:bg-white/20">
              Não, manter pedido
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (orderToCancel) {
                  cancelOrderMutation.mutate(orderToCancel.id);
                }
              }}
              disabled={cancelOrderMutation.isPending}
              className="bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800"
            >
              {cancelOrderMutation.isPending ? 'Cancelando...' : 'Sim, Cancelar Pedido'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Diálogo: Editar Pedido */}
      <Dialog open={!!orderToEdit} onOpenChange={(open) => !open && setOrderToEdit(null)}>
        <DialogContent className="max-w-2xl bg-gradient-to-br from-slate-900 to-slate-800 text-white border-white/10">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold flex items-center gap-2">
              <Pencil className="h-6 w-6 text-indigo-400" />
              Editar Pedido #{orderToEdit?.orderNumber || orderToEdit?.id?.slice(0, 8)}
            </DialogTitle>
          </DialogHeader>
          
          {orderToEdit?.items && (
            <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2">
              {orderToEdit.items.map((item: any) => (
                <div 
                  key={item.id} 
                  className="flex items-center gap-4 p-4 bg-white/5 rounded-lg border border-white/10"
                >
                  <div className="flex-1">
                    <p className="font-semibold text-white">{item.name}</p>
                    <p className="text-sm text-white/60">{formatKwanza(item.price)} cada</p>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-8 w-8 bg-white/10 border-white/20 text-white"
                      onClick={() => {
                        if (item.quantity > 1) {
                          updateOrderItemMutation.mutate({ 
                            itemId: item.id, 
                            quantity: item.quantity - 1 
                          });
                        }
                      }}
                      disabled={item.quantity <= 1 || updateOrderItemMutation.isPending}
                    >
                      <Minus className="h-4 w-4" />
                    </Button>
                    
                    <span className="w-12 text-center font-bold text-white">
                      {item.quantity}
                    </span>
                    
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-8 w-8 bg-white/10 border-white/20 text-white"
                      onClick={() => {
                        updateOrderItemMutation.mutate({ 
                          itemId: item.id, 
                          quantity: item.quantity + 1 
                        });
                      }}
                      disabled={updateOrderItemMutation.isPending}
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                  
                  <div className="text-right min-w-[100px]">
                    <p className="font-bold text-white">
                      {formatKwanza(item.price * item.quantity)}
                    </p>
                  </div>
                  
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-red-400 hover:bg-red-500/10 hover:text-red-300"
                    onClick={() => {
                      if (orderToEdit.items.length > 1) {
                        removeOrderItemMutation.mutate(item.id);
                      } else {
                        toast({
                          title: 'Não é possível remover',
                          description: 'O pedido precisa ter pelo menos 1 item. Use "Cancelar Pedido" para cancelar completamente.',
                          variant: 'destructive',
                        });
                      }
                    }}
                    disabled={removeOrderItemMutation.isPending}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                  
                  {guests.length > 1 && (
                    <Button
                      variant="outline"
                      size="sm"
                      className="bg-white/10 border-white/20 text-white hover:bg-white/20"
                      onClick={() => setItemToMove({ ...item, orderId: orderToEdit.id })}
                    >
                      Mover
                    </Button>
                  )}
                </div>
              ))}
            </div>
          )}
          
          <div className="flex items-center justify-between pt-4 border-t border-white/10">
            <span className="text-lg font-bold text-white">Total do Pedido:</span>
            <span className="text-2xl font-black bg-gradient-to-r from-indigo-400 to-violet-400 bg-clip-text text-transparent">
              {formatKwanza(orderToEdit?.totalPrice || 0)}
            </span>
          </div>
          
          <div className="flex gap-2">
            <Button
              variant="outline"
              className="flex-1 bg-white/10 border-white/20 text-white hover:bg-white/20"
              onClick={() => setOrderToEdit(null)}
            >
              Fechar
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Diálogo: Mover Item entre Guests */}
      <Dialog open={!!itemToMove} onOpenChange={(open) => !open && setItemToMove(null)}>
        <DialogContent className="max-w-md bg-gradient-to-br from-indigo-900 to-indigo-800 text-white border-indigo-500/20">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold flex items-center gap-2">
              <Users className="h-6 w-6 text-indigo-400" />
              Mover Item
            </DialogTitle>
          </DialogHeader>
          
          {itemToMove && (
            <>
              <div className="p-4 bg-white/10 rounded-lg border border-white/20">
                <p className="font-semibold text-white mb-1">{itemToMove.name}</p>
                <p className="text-sm text-white/60">
                  {itemToMove.quantity}x {formatKwanza(itemToMove.price)} = {formatKwanza(itemToMove.price * itemToMove.quantity)}
                </p>
              </div>
              
              <div className="space-y-2">
                <p className="text-sm text-white/70 font-medium">Selecione o convidado de destino:</p>
                
                {guests.map((guest: any) => (
                  <button
                    key={guest.id}
                    onClick={() => {
                      moveItemMutation.mutate({
                        itemId: itemToMove.id,
                        targetGuestId: guest.id,
                      });
                    }}
                    disabled={moveItemMutation.isPending}
                    className="w-full p-3 bg-white/10 hover:bg-white/20 rounded-lg border border-white/20 hover:border-indigo-400 transition-all text-left disabled:opacity-50"
                  >
                    <div className="flex items-center gap-3">
                      <Avatar className="h-10 w-10 border-2 border-indigo-400/30">
                        <AvatarFallback className="bg-gradient-to-br from-indigo-500 to-indigo-600 text-white text-sm font-bold">
                          {guest.name ? guest.name.charAt(0).toUpperCase() : '#'}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-semibold text-white">
                          {guest.name || `Convidado ${guest.guestNumber || guest.seatNumber}`}
                        </p>
                        {guest.customerId && (
                          <p className="text-xs text-indigo-300">Cliente cadastrado</p>
                        )}
                      </div>
                    </div>
                  </button>
                ))}
                
                {/* Opção para sem guest (anônimo) */}
                <button
                  onClick={() => {
                    moveItemMutation.mutate({
                      itemId: itemToMove.id,
                      targetGuestId: null,
                    });
                  }}
                  disabled={moveItemMutation.isPending}
                  className="w-full p-3 bg-white/10 hover:bg-white/20 rounded-lg border border-white/20 hover:border-indigo-400 transition-all text-left disabled:opacity-50"
                >
                  <div className="flex items-center gap-3">
                    <Avatar className="h-10 w-10 border-2 border-gray-400/30">
                      <AvatarFallback className="bg-gradient-to-br from-gray-500 to-gray-600 text-white text-sm font-bold">
                        ?
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-semibold text-white">Sem Convidado</p>
                      <p className="text-xs text-white/60">Item anônimo</p>
                    </div>
                  </div>
                </button>
              </div>
              
              <Button
                variant="outline"
                className="w-full bg-white/10 border-white/20 text-white hover:bg-white/20"
                onClick={() => setItemToMove(null)}
              >
                Cancelar
              </Button>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Diálogo: Escolher Tipo de Pessoa */}
      <AlertDialog open={showAddPersonModal} onOpenChange={setShowAddPersonModal}>
        <AlertDialogContent className="bg-gradient-to-br from-slate-900 to-slate-800 text-white border-white/10 max-w-2xl">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-2xl font-bold">Adicionar Pessoa à Mesa</AlertDialogTitle>
            <AlertDialogDescription className="text-white/70">
              Escolha como deseja adicionar uma pessoa à mesa {table?.number}
            </AlertDialogDescription>
          </AlertDialogHeader>
          
          <div className="space-y-3 py-4">
            {/* Opção 1: Cliente Existente */}
            <button
              onClick={() => {
                setShowAddPersonModal(false);
                setShowCustomerSearch(true);
              }}
              className="w-full p-4 rounded-xl border-2 border-white/20 hover:border-indigo-500 hover:bg-indigo-500/10 transition-all text-left group"
              type="button"
            >
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-lg bg-indigo-500/20 group-hover:bg-indigo-500/30 transition-colors">
                  <Users className="h-6 w-6 text-indigo-400" />
                </div>
                <div>
                  <div className="font-bold text-lg">Cliente Existente</div>
                  <div className="text-sm text-white/60">Vincular um cliente já cadastrado</div>
                </div>
              </div>
            </button>

            {/* Opção 2: Cadastro Rápido */}
            <button
              onClick={() => {
                setShowAddPersonModal(false);
                setAddPersonMode('quick');
              }}
              className="w-full p-4 rounded-xl border-2 border-white/20 hover:border-green-500 hover:bg-green-500/10 transition-all text-left group"
            >
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-lg bg-green-500/20 group-hover:bg-green-500/30 transition-colors">
                  <UserPlus className="h-6 w-6 text-green-400" />
                </div>
                <div>
                  <div className="font-bold text-lg">Cadastro Rápido</div>
                  <div className="text-sm text-white/60">Criar novo cliente com nome e telefone</div>
                </div>
              </div>
            </button>

            {/* Opção 3: Convidado Anônimo */}
            <button
              onClick={() => {
                setShowAddPersonModal(false);
                setAddingGuest(true);
              }}
              className="w-full p-4 rounded-xl border-2 border-white/20 hover:border-amber-500 hover:bg-amber-500/10 transition-all text-left group"
            >
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-lg bg-amber-500/20 group-hover:bg-amber-500/30 transition-colors">
                  <Users className="h-6 w-6 text-amber-400" />
                </div>
                <div>
                  <div className="font-bold text-lg">Convidado Anônimo</div>
                  <div className="text-sm text-white/60">Adicionar sem vincular a cliente (opcional nome)</div>
                </div>
              </div>
            </button>
          </div>

          <AlertDialogFooter>
            <AlertDialogCancel className="bg-white/10 border-white/20 text-white hover:bg-white/20">
              Cancelar
            </AlertDialogCancel>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Diálogo: Adicionar Convidado Anônimo */}
      <AlertDialog open={addingGuest} onOpenChange={setAddingGuest}>
        <AlertDialogContent className="bg-gradient-to-br from-slate-900 to-slate-800 text-white border-white/10">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-2xl font-bold">Adicionar Convidado Anônimo</AlertDialogTitle>
            <AlertDialogDescription className="text-white/70">
              Adicione um convidado sem vincular a um cliente cadastrado
            </AlertDialogDescription>
          </AlertDialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="guest-name" className="text-white/80">Nome do Convidado (Opcional)</Label>
              <Input
                id="guest-name"
                placeholder="Ex: João Silva"
                value={newGuestName}
                onChange={(e) => setNewGuestName(e.target.value)}
                className="bg-white/10 border-white/20 text-white placeholder:text-white/40"
                autoFocus
              />
              <p className="text-xs text-white/50">Deixe em branco para criar como "Convidado #"</p>
            </div>
          </div>

          <AlertDialogFooter>
            <AlertDialogCancel className="bg-white/10 border-white/20 text-white hover:bg-white/20">
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={() => createGuestMutation.mutate(newGuestName)}
              disabled={createGuestMutation.isPending}
              className="bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700"
            >
              {createGuestMutation.isPending ? 'Adicionando...' : 'Adicionar'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Diálogo: Buscar Cliente */}
      <CustomerSearchDialog
        open={showCustomerSearch}
        onOpenChange={setShowCustomerSearch}
        onSelectCustomer={(customerId) => {
          linkCustomerMutation.mutate(customerId);
        }}
      />

      {/* Diálogo: Cadastro Rápido */}
      <AlertDialog open={addPersonMode === 'quick'} onOpenChange={(open) => !open && setAddPersonMode(null)}>
        <AlertDialogContent className="bg-gradient-to-br from-slate-900 to-slate-800 text-white border-white/10">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-2xl font-bold">Cadastro Rápido</AlertDialogTitle>
            <AlertDialogDescription className="text-white/70">
              Cadastre um novo cliente rapidamente
            </AlertDialogDescription>
          </AlertDialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="quick-name" className="text-white/80">Nome Completo *</Label>
              <Input
                id="quick-name"
                placeholder="Ex: João Silva"
                value={quickCustomerName}
                onChange={(e) => setQuickCustomerName(e.target.value)}
                className="bg-white/10 border-white/20 text-white placeholder:text-white/40"
                autoFocus
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="quick-phone" className="text-white/80">Telefone *</Label>
              <Input
                id="quick-phone"
                placeholder="Ex: 923456789"
                value={quickCustomerPhone}
                onChange={(e) => setQuickCustomerPhone(e.target.value)}
                className="bg-white/10 border-white/20 text-white placeholder:text-white/40"
              />
            </div>
          </div>

          <AlertDialogFooter>
            <AlertDialogCancel 
              className="bg-white/10 border-white/20 text-white hover:bg-white/20"
              onClick={() => {
                setQuickCustomerName('');
                setQuickCustomerPhone('');
              }}
            >
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={() => createQuickCustomerMutation.mutate()}
              disabled={!quickCustomerName || !quickCustomerPhone || createQuickCustomerMutation.isPending}
              className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700"
            >
              {createQuickCustomerMutation.isPending ? 'Cadastrando...' : 'Cadastrar e Adicionar'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Diálogo: QR Code */}
      <AlertDialog open={showQRCode} onOpenChange={setShowQRCode}>
        <AlertDialogContent className="bg-gradient-to-br from-slate-900 to-slate-800 text-white border-white/10">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-2xl font-bold">QR Code Auto-Registro</AlertDialogTitle>
            <AlertDialogDescription className="text-white/70">
              Clientes podem escanear este QR Code para se registrar na mesa automaticamente
            </AlertDialogDescription>
          </AlertDialogHeader>
          
          {qrCodeUrl && (
            <div className="flex flex-col items-center py-6 space-y-4">
              <div className="p-4 bg-white rounded-2xl">
                <img src={qrCodeUrl} alt="QR Code" className="w-64 h-64" />
              </div>
              <p className="text-sm text-white/60 text-center">
                Mesa {table?.number}
              </p>
            </div>
          )}

          <AlertDialogFooter>
            <AlertDialogAction
              onClick={() => setShowQRCode(false)}
              className="bg-gradient-to-r from-indigo-500 to-indigo-600 hover:from-indigo-600 hover:to-indigo-700"
            >
              Fechar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Lista de Convidados Expansível */}
      <AnimatePresence>
        {showGuestSplit && guests.length > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="mt-3"
          >
            <div className="space-y-2">
              {ordersByGuestData?.ordersByGuest?.map(({ guest, subtotal }: any) => (
                <div
                  key={guest.id}
                  className="flex items-center justify-between p-3 bg-white/5 rounded-lg hover:bg-white/10 transition-colors border border-white/10"
                >
                  <div className="flex items-center gap-3">
                    <Avatar className="h-8 w-8 border-2 border-white/20">
                      <AvatarFallback className="bg-gradient-to-br from-indigo-500 to-indigo-600 text-white text-xs font-bold">
                        {guest.name ? guest.name.charAt(0).toUpperCase() : `#`}
                      </AvatarFallback>
                    </Avatar>
                    <span className="text-sm text-white/90">
                      {guest.name || `Convidado ${guest.guestNumber || guest.seatNumber}`}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-white">
                      {formatKwanza(parseFloat(subtotal))}
                    </span>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-red-400 hover:bg-red-500/10 hover:text-red-300"
                      onClick={() => setGuestToRemove(guest.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </Dialog>

    {/* Quick Order Dialog */}
    {table && (
      <>
        <QuickOrderDialog
          open={showQuickOrder}
          onOpenChange={setShowQuickOrder}
          tableId={table.id}
          tableNumber={table.number}
        />
        
        {/* Print Bill Dialog */}
        {showPrintBill && (() => {
          const selectedGuest = printBillGuestId
            ? guests.find(g => g.id === printBillGuestId)
            : guests[0];

          if (!selectedGuest) return null;

          const guestOrders = ordersByGuestData?.ordersByGuest?.find(og => og.guest.id === selectedGuest.id)?.orders || [];
          const guestTotal = guestOrders.reduce((sum, o) => sum + parseFloat(o.totalAmount || "0"), 0);

          return (
            <PrintGuestBill
              guest={{
                id: selectedGuest.id,
                sessionId: selectedGuest.sessionId,
                name: selectedGuest.name || `Convidado ${selectedGuest.guestNumber || selectedGuest.seatNumber}`,
                guestNumber: selectedGuest.guestNumber || selectedGuest.seatNumber,
                status: selectedGuest.status,
                totalSpent: selectedGuest.totalSpent,
                joinedAt: selectedGuest.joinedAt,
              }}
              orders={guestOrders.map(o => ({
                orderId: o.id,
                orderStatus: o.status,
                totalAmount: o.totalAmount,
                createdAt: o.createdAt,
                items: (o.orderItems || []).map((item: any) => ({
                  id: item.id,
                  menuItemName: item.menuItem?.name || item.name,
                  quantity: item.quantity,
                  unitPrice: item.price,
                  totalPrice: (parseFloat(item.price) * item.quantity).toFixed(2),
                })),
              }))}
              totalAmount={guestTotal}
              tableName={`Mesa ${table.number}`}
              restaurantName={restaurant?.name}
            />
          );
        })()}
        
        {/* Speed Dial Menu - Only show when dialog is open and table is occupied */}
        {open && table.status !== 'livre' && (
          <SpeedDialMenu
            tableId={table.id}
            tableNumber={table.number}
            onOrderCreated={() => {
              queryClient.invalidateQueries({ queryKey: [`/api/tables/${currentTable.id}/orders-by-guest`] });
              queryClient.invalidateQueries({ queryKey: ['tables'] });
            }}
          />
        )}
      </>
    )}
    </>
  );
}
