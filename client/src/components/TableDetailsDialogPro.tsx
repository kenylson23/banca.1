import { useState, useEffect } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useLocation } from 'wouter';
import { format, formatDistanceToNow, differenceInMinutes } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Dialog,
  DialogContent,
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
} from 'lucide-react';
import { formatKwanza } from '@/lib/formatters';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { apiRequest, queryClient } from '@/lib/queryClient';
import type { Table } from '@shared/schema';
import QRCode from 'qrcode';
import { CustomerSearchDialog } from './CustomerSearchDialog';

interface TableDetailsDialogProProps {
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
};

export function TableDetailsDialogPro({
  open,
  onOpenChange,
  table,
  allTables = [],
  onNavigate,
}: TableDetailsDialogProProps) {
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

  const { data: tableOrders = [] } = useQuery({
    queryKey: ['table-orders', table?.id],
    queryFn: async () => {
      if (!table?.id) return [];
      const response = await fetch(`/api/orders?tableId=${table.id}&status=pending,confirmed,preparing`);
      if (!response.ok) throw new Error('Erro ao carregar pedidos');
      return response.json();
    },
    enabled: open && !!table?.id,
  });

  // Query guests
  const { data: guests = [] } = useQuery<Array<{ id: string; name: string | null; seatNumber: number; status: string }>>({
    queryKey: [`/api/tables/${table?.id}/guests`],
    enabled: !!table?.id && table?.status !== 'livre',
  });

  // ✅ Mutation: Iniciar Sessão
  const startSessionMutation = useMutation({
    mutationFn: async () => {
      if (!table?.id) throw new Error('Mesa não encontrada');
      const peopleCount = selectedPeopleCount || parseInt(customPeopleCount) || 1;
      
      const response = await apiRequest('POST', `/api/tables/${table.id}/start-session`, {
        peopleCount,
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/tables/with-orders'] });
      queryClient.invalidateQueries({ queryKey: [`/api/tables/${table?.id}/guests`] });
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

  // ✅ Mutation: Encerrar Sessão
  const endSessionMutation = useMutation({
    mutationFn: async () => {
      if (!table?.id) throw new Error('Mesa não encontrada');
      const response = await apiRequest('POST', `/api/tables/${table.id}/end-session`);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/tables/with-orders'] });
      toast({ title: 'Sessão encerrada', description: 'Mesa fechada com sucesso.' });
      setShowEndSessionDialog(false);
      onOpenChange(false);
    },
    onError: (error: any) => {
      toast({
        title: 'Erro ao encerrar sessão',
        description: error.message || 'Não foi possível encerrar a sessão.',
        variant: 'destructive',
      });
    },
  });

  // ✅ Mutation: Adicionar Convidado
  const createGuestMutation = useMutation({
    mutationFn: async (guestName: string) => {
      if (!table?.id) throw new Error('Mesa não encontrada');
      if (!table?.currentSessionId) throw new Error('Mesa não tem sessão ativa');
      
      const response = await apiRequest('POST', `/api/tables/${table.id}/guests`, {
        name: guestName || null,
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/tables/${table?.id}/guests`] });
      queryClient.invalidateQueries({ queryKey: ['/api/tables/with-orders'] });
      toast({ title: 'Convidado adicionado', description: 'Cliente adicionado à mesa com sucesso.' });
      setAddingGuest(false);
      setNewGuestName('');
    },
    onError: (error: any) => {
      toast({
        title: 'Erro ao adicionar convidado',
        description: error.message || 'Não foi possível adicionar o convidado.',
        variant: 'destructive',
      });
    },
  });

  // ✅ Mutation: Remover Convidado
  const removeGuestMutation = useMutation({
    mutationFn: async (guestId: string) => {
      if (!table?.id) throw new Error('Mesa não encontrada');
      const response = await apiRequest('DELETE', `/api/tables/${table.id}/guests/${guestId}`);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/tables/${table?.id}/guests`] });
      queryClient.invalidateQueries({ queryKey: ['/api/tables/with-orders'] });
      toast({ title: 'Convidado removido', description: 'Cliente removido da mesa.' });
    },
    onError: (error: any) => {
      toast({
        title: 'Erro ao remover convidado',
        description: error.message || 'Não foi possível remover o convidado.',
        variant: 'destructive',
      });
    },
  });

  // ✅ Mutation: Atualizar Status da Mesa
  const updateStatusMutation = useMutation({
    mutationFn: async (newStatus: string) => {
      if (!table?.id) throw new Error('Mesa não encontrada');
      const response = await apiRequest('PATCH', `/api/tables/${table.id}`, {
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

  // ✅ Mutation: Vincular Cliente Existente à Mesa
  const linkCustomerMutation = useMutation({
    mutationFn: async (customerId: string) => {
      if (!table?.id) throw new Error('Mesa não encontrada');
      if (!table?.currentSessionId) throw new Error('Mesa não tem sessão ativa');
      
      const response = await apiRequest('POST', `/api/tables/${table.id}/guests`, {
        customerId: customerId,
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/tables/${table?.id}/guests`] });
      queryClient.invalidateQueries({ queryKey: ['/api/tables/with-orders'] });
      toast({ title: 'Cliente vinculado', description: 'Cliente adicionado à mesa com sucesso.' });
      setShowCustomerSearch(false);
      setShowAddPersonModal(false);
      setAddPersonMode(null);
    },
    onError: (error: any) => {
      toast({
        title: 'Erro ao vincular cliente',
        description: error.message || 'Não foi possível vincular o cliente.',
        variant: 'destructive',
      });
    },
  });

  // ✅ Mutation: Criar Cliente Rápido e Vincular
  const createQuickCustomerMutation = useMutation({
    mutationFn: async () => {
      if (!quickCustomerName || !quickCustomerPhone) {
        throw new Error('Nome e telefone são obrigatórios');
      }
      
      // Primeiro criar o cliente
      const customerResponse = await apiRequest('POST', '/api/customers', {
        name: quickCustomerName,
        phone: quickCustomerPhone,
      });
      const customer = await customerResponse.json();
      
      // Depois vincular à mesa
      if (!table?.id || !table?.currentSessionId) {
        throw new Error('Mesa não tem sessão ativa');
      }
      
      const guestResponse = await apiRequest('POST', `/api/tables/${table.id}/guests`, {
        customerId: customer.id,
      });
      return guestResponse.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/tables/${table?.id}/guests`] });
      queryClient.invalidateQueries({ queryKey: ['/api/tables/with-orders'] });
      queryClient.invalidateQueries({ queryKey: ['/api/customers'] });
      toast({ title: 'Cliente criado', description: 'Cliente criado e adicionado à mesa.' });
      setShowAddPersonModal(false);
      setAddPersonMode(null);
      setQuickCustomerName('');
      setQuickCustomerPhone('');
    },
    onError: (error: any) => {
      toast({
        title: 'Erro ao criar cliente',
        description: error.message || 'Não foi possível criar o cliente.',
        variant: 'destructive',
      });
    },
  });

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
      const guestResponse = await apiRequest('PATCH', `/api/tables/${table.id}/guests/${guestId}`, {
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
          console.error('Error generating QR Code:', err);
          toast({
            title: 'Erro ao gerar QR Code',
            description: 'Não foi possível gerar o QR Code.',
            variant: 'destructive',
          });
        });
    }
  }, [showQRCode, table, toast]);

  // ⌨️ Keyboard Shortcuts
  useEffect(() => {
    if (!open) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      // ESC - Close dialog
      if (e.key === 'Escape') {
        onOpenChange(false);
      }
      // Arrow Right - Next table
      else if (e.key === 'ArrowRight') {
        const currentIndex = allTables.findIndex((t) => t.id === table?.id);
        if (currentIndex < allTables.length - 1) {
          onNavigate?.(allTables[currentIndex + 1]);
        }
      }
      // Arrow Left - Previous table
      else if (e.key === 'ArrowLeft') {
        const currentIndex = allTables.findIndex((t) => t.id === table?.id);
        if (currentIndex > 0) {
          onNavigate?.(allTables[currentIndex - 1]);
        }
      }
      // N - New Order
      else if (e.key === 'n' || e.key === 'N') {
        if (!e.ctrlKey && !e.metaKey) {
          onOpenChange(false);
          navigate(`/pdv?tableId=${table?.id}`);
        }
      }
      // P - Checkout (Payment)
      else if (e.key === 'p' || e.key === 'P') {
        if (!e.ctrlKey && !e.metaKey) {
          onOpenChange(false);
          navigate(`/table-checkout-v2/${table?.id}`);
        }
      }
      // S - Split bill
      else if (e.key === 's' || e.key === 'S') {
        if (!e.ctrlKey && !e.metaKey) {
          setShowGuestSplit(!showGuestSplit);
        }
      }
      // G - Add person (guest or customer)
      else if (e.key === 'g' || e.key === 'G') {
        if (!e.ctrlKey && !e.metaKey && table?.status !== 'livre') {
          setShowAddPersonModal(true);
        }
      }
      // Q - Show QR Code
      else if (e.key === 'q' || e.key === 'Q') {
        if (!e.ctrlKey && !e.metaKey && table?.status !== 'livre') {
          setShowQRCode(!showQRCode);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [open, table, allTables, onNavigate, onOpenChange, navigate, showGuestSplit, showQRCode]);

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
  const totalAmount = tableOrders.reduce((sum: number, order: any) => {
    return sum + (order.totalPrice || 0);
  }, 0);

  const activeGuests = table.orders?.[0]?.guests?.length || 0;
  const sessionStart = table.orders?.[0]?.createdAt;
  const duration = sessionStart
    ? Math.floor((Date.now() - new Date(sessionStart).getTime()) / (1000 * 60))
    : 0;

  const status = table.status as keyof typeof statusConfig;
  const config = statusConfig[status] || statusConfig.livre;

  // 📊 Calculate average per guest
  const avgPerGuest = activeGuests > 0 ? totalAmount / activeGuests : 0;

  // ⏱️ Helper function to calculate order wait time and progress
  const getOrderProgress = (orderDate: string) => {
    const minutes = differenceInMinutes(new Date(), new Date(orderDate));
    const maxTime = 30; // 30 minutes expected
    const progress = Math.min((minutes / maxTime) * 100, 100);
    const isDelayed = minutes > maxTime;
    return { minutes, progress, isDelayed };
  };

  // 🎨 Check if order is new (less than 2 minutes)
  const isNewOrder = (orderDate: string) => {
    return differenceInMinutes(new Date(), new Date(orderDate)) < 2;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl h-[90vh] p-0 gap-0 overflow-hidden border-0 shadow-2xl bg-white">
        <div className="flex h-full">
          {/* Main Content - Left Side (2/3) */}
          <div className="flex-1 flex flex-col">
            {/* Header - Premium Gradient */}
            <div className="relative px-8 py-6 bg-gradient-to-br from-[#0F172A] via-[#1E293B] to-[#0F172A] overflow-hidden">
              {/* Animated Background Pattern */}
              <div className="absolute inset-0 opacity-10">
                <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/20 via-violet-500/20 to-cyan-500/20" />
                <motion.div
                  className="absolute inset-0"
                  style={{
                    backgroundImage: 'radial-gradient(circle at 2px 2px, rgba(255,255,255,0.15) 1px, transparent 0)',
                    backgroundSize: '32px 32px'
                  }}
                  animate={{
                    backgroundPosition: ['0px 0px', '32px 32px'],
                  }}
                  transition={{
                    duration: 20,
                    repeat: Infinity,
                    ease: "linear"
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

                    {/* Orders Cards - Toast Style */}
                    <AnimatePresence mode="popLayout">
                      {tableOrders.map((order: any, index: number) => {
                        const orderStatus = order.status as keyof typeof orderStatusConfig;
                        const statusCfg = orderStatusConfig[orderStatus] || orderStatusConfig.pending;
                        const orderProgress = getOrderProgress(order.createdAt);
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
                                      className={cn(
                                        "h-1.5",
                                        orderProgress.isDelayed ? `bg-[${COLORS.danger.bg}]` : `bg-[${COLORS.primary.bg}]`
                                      )}
                                      indicatorClassName={cn(
                                        orderProgress.isDelayed 
                                          ? `bg-gradient-to-r from-[${COLORS.danger.DEFAULT}] to-[${COLORS.danger.dark}]` 
                                          : `bg-gradient-to-r from-[${COLORS.primary.DEFAULT}] to-[${COLORS.primary.dark}]`
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
                                <Button 
                                  variant="ghost" 
                                  size="icon" 
                                  className="h-10 w-10 hover:bg-slate-100 rounded-xl"
                                >
                                  <MoreHorizontal className="h-5 w-5" />
                                </Button>
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
                                          className={cn(
                                            "absolute -top-2 -right-2 h-7 w-7 rounded-full flex items-center justify-center font-bold text-white text-sm shadow-lg border-2 border-white",
                                            `bg-gradient-to-br from-[${COLORS.primary.DEFAULT}] to-[${COLORS.primary.dark}]`
                                          )}
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
                ) : (
                  /* Empty State - Dark Theme */
                  <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex flex-col items-center justify-center py-20"
                  >
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
                  </motion.div>
                )}
              </div>
            </ScrollArea>
          </div>

          {/* Sidebar - Right Side (1/3) - Premium Dark */}
          <div className="w-96 bg-gradient-to-br from-[#0F172A] to-[#1E293B] flex flex-col relative overflow-hidden">
            {/* Ambient Glow */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-indigo-500/10 to-violet-500/10 rounded-full blur-3xl" />
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-gradient-to-tr from-cyan-500/10 to-indigo-500/10 rounded-full blur-3xl" />
            
            {/* Total Section */}
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

            {/* Quick Stats */}
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

            {/* Actions */}
            <div className="flex-1 p-6">
              <div className="space-y-3">
                {/* Primary Actions */}
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="relative"
                >
                  <Button
                    onClick={() => {
                      onOpenChange(false);
                      navigate(`/pdv?tableId=${table.id}`);
                    }}
                    className="w-full h-14 bg-gradient-to-r from-indigo-500 to-indigo-600 hover:from-indigo-600 hover:to-indigo-700 text-white font-bold text-base rounded-xl shadow-xl hover:shadow-2xl transition-all relative overflow-hidden group border-0"
                    size="lg"
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/25 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                    <Plus className="h-5 w-5 mr-2 relative z-10" />
                    <span className="relative z-10">Novo Pedido</span>
                    <kbd className="ml-auto px-2 py-1 text-xs bg-white/20 rounded relative z-10">N</kbd>
                  </Button>
                </motion.div>

                <motion.div
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="relative"
                >
                  <Button
                    onClick={() => {
                      onOpenChange(false);
                      navigate(`/table-checkout-v2/${table.id}`);
                    }}
                    className="w-full h-14 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white font-bold text-base rounded-xl shadow-xl hover:shadow-2xl transition-all relative overflow-hidden group border-0"
                    size="lg"
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/25 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                    <CreditCard className="h-5 w-5 mr-2 relative z-10" />
                    <span className="relative z-10">Checkout</span>
                    <kbd className="ml-auto px-2 py-1 text-xs bg-white/20 rounded relative z-10">P</kbd>
                  </Button>
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
                      onClick={() => setShowAddPersonModal(true)}
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
              disabled={!selectedPeopleCount && !customPeopleCount}
              className="bg-gradient-to-r from-indigo-500 to-indigo-600 hover:from-indigo-600 hover:to-indigo-700"
            >
              Iniciar Sessão
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
              onClick={() => endSessionMutation.mutate()}
              className="bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700"
            >
              Encerrar Sessão
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Diálogo: Adicionar Convidado */}
      <AlertDialog open={addingGuest} onOpenChange={setAddingGuest}>
        <AlertDialogContent className="bg-gradient-to-br from-slate-900 to-slate-800 text-white border-white/10">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-2xl font-bold">Adicionar Convidado</AlertDialogTitle>
            <AlertDialogDescription className="text-white/70">
              Adicione um novo convidado à mesa {table?.number}
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
            </div>
          </div>

          <AlertDialogFooter>
            <AlertDialogCancel className="bg-white/10 border-white/20 text-white hover:bg-white/20">
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={() => createGuestMutation.mutate(newGuestName)}
              className="bg-gradient-to-r from-indigo-500 to-indigo-600 hover:from-indigo-600 hover:to-indigo-700"
            >
              Adicionar
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
              {guests.map((guest, idx) => (
                <div
                  key={guest.id}
                  className="flex items-center justify-between p-3 bg-white/5 rounded-lg hover:bg-white/10 transition-colors border border-white/10"
                >
                  <div className="flex items-center gap-3">
                    <Avatar className="h-8 w-8 border-2 border-white/20">
                      <AvatarFallback className="bg-gradient-to-br from-indigo-500 to-indigo-600 text-white text-xs font-bold">
                        {guest.name ? guest.name.charAt(0).toUpperCase() : `#${idx + 1}`}
                      </AvatarFallback>
                    </Avatar>
                    <span className="text-sm text-white/90">
                      {guest.name || `Convidado ${idx + 1}`}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-white">
                      {formatKwanza(avgPerGuest)}
                    </span>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-red-400 hover:bg-red-500/10 hover:text-red-300"
                      onClick={() => removeGuestMutation.mutate(guest.id)}
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
  );
}
