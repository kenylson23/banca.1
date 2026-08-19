/**
 * TableDialogPOSModern - Design Profissional Fullscreen
 * Estilo: POS Moderno Híbrido (Clean SaaS + Velocidade POS)
 * Layout: Sidebar + Content Area
 * 
 * Features:
 * - Fullscreen para máxima área útil
 * - Sidebar de navegação fixa
 * - Quick actions no topo
 * - Atalhos de teclado
 * - Animações suaves
 * - Design responsivo
 */

import { useState, useCallback, useEffect, useMemo } from 'react';
import { useLocation } from 'wouter';
import { motion, AnimatePresence } from 'framer-motion';
import { useQuery, useQueryClient, useMutation } from '@tanstack/react-query';
import { Dialog, DialogPortal, DialogOverlay, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import {
  X,
  Users,
  ShoppingCart,
  CreditCard,
  History,
  Settings,
  QrCode,
  LayoutGrid,
  UserPlus,
  Plus,
  ChevronLeft,
  ChevronRight,
  Clock,
  DollarSign,
  CheckCircle2,
  AlertCircle,
  TrendingUp,
  Package,
  Split,
  Receipt,
  UserCircle,
  XCircle,
  Camera,
  Trash2,
} from 'lucide-react';
import { formatKwanza } from '@/lib/formatters';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent } from '@/components/ui/card';
import { useTableData } from './hooks/useTableData';
import { useTableMutations } from './hooks/useTableMutations';
import { useTableInvalidations } from '@/lib/tableInvalidations';
import { OverviewSection } from './sections/OverviewSection';
import { GuestsSection } from './sections/GuestsSection';
import { OrdersSection } from './sections/OrdersSection';
import { PaymentSection } from './sections/PaymentSection';
import { HistorySection } from './sections/HistorySection';
import { StartSessionDialog } from './dialogs/StartSessionDialog';
import { AddPersonDialog } from './dialogs/AddPersonDialog';
import { QuickOrderDialog } from '@/components/QuickOrderDialog';
import { QRCodeDialog } from './dialogs/QRCodeDialog';
import { ConvertGuestDialog } from '@/components/ConvertGuestDialog';
import { CancelOrderDialog } from './dialogs/CancelOrderDialog';
import { EditOrderDialog } from './dialogs/EditOrderDialog';
import { MoveItemDialog } from '@/components/MoveItemDialog';
import { BillSplitPanel } from '@/components/BillSplitPanel';
import { QrScannerDialog } from '@/components/QrScannerDialog';
import { useAuth } from '@/hooks/useAuth';
import { apiRequest } from '@/lib/queryClient';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import type { Table } from '@shared/schema';

interface TableDialogPOSModernProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  table: Table | null;
  allTables?: Table[];
  onNavigate?: (table: Table) => void;
}

type NavigationSection = 'overview' | 'guests' | 'orders' | 'payment' | 'split' | 'history';

interface NavigationItem {
  id: NavigationSection;
  label: string;
  icon: React.ReactNode;
  badge?: string | number;
  shortcut?: string;
}

export function TableDialogPOSModern({
  open,
  onOpenChange,
  table,
  allTables = [],
  onNavigate,
}: TableDialogPOSModernProps) {
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const { user } = useAuth();
  const [activeSection, setActiveSection] = useState<NavigationSection>('overview');
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const canDeleteTable = user?.role === 'admin' || user?.role === 'manager' || user?.role === 'superadmin';

  // Dialog states
  const [showStartSession, setShowStartSession] = useState(false);
  const [showAddPerson, setShowAddPerson] = useState(false);
  const [showQuickOrder, setShowQuickOrder] = useState(false);
  const [showQRCode, setShowQRCode] = useState(false);
  const [showQrScanner, setShowQrScanner] = useState(false);
  const [convertingGuest, setConvertingGuest] = useState<string | null>(null);
  const [orderToCancel, setOrderToCancel] = useState<any>(null);
  const [orderToEdit, setOrderToEdit] = useState<any>(null);
  const [itemToMove, setItemToMove] = useState<any>(null);
  
  // ✅ SOLUÇÃO 2: Estado para fechamento de mesa
  const [showCloseDialog, setShowCloseDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  // Integrar dados reais
  const { 
    tableData, 
    guests: allSessionGuests, 
    ordersByGuestData,
    sessionPaidAmount, // ✅ FIX: Get paidAmount from session
    isLoading: isLoadingGuests 
  } = useTableData({ tableId: table?.id, isOpen: open });
  
  const ordersByGuest = ordersByGuestData?.ordersByGuest || [];
  const mutations = useTableMutations({ tableId: table?.id });
  const queryClient = useQueryClient();
  const { invalidateAll } = useTableInvalidations(table?.id);

  // Forçar refetch quando o StartSessionDialog fechar
  useEffect(() => {
    if (!showStartSession && open && table?.id) {
      invalidateAll();
    }
  }, [showStartSession, open, table?.id, invalidateAll, queryClient]);

  // 🔧 FIX: Quando o currentSessionId mudar, invalidar guests automaticamente
  useEffect(() => {
    const sessionId = tableData?.currentSessionId || table?.currentSessionId;
    if (sessionId) {
      queryClient.invalidateQueries({ queryKey: [`/api/table-sessions/${sessionId}/guests`] });
    }
  }, [tableData?.currentSessionId, table?.currentSessionId, queryClient]);
  
  // ✅ SOLUÇÃO 3: Mutation para fechar mesa
  const closeTableMutation = useMutation({
    mutationFn: async (forceClose: boolean = false) => {
      if (!table?.id) {
        throw new Error('Mesa não encontrada');
      }
      const res = await fetch(`/api/tables/${table.id}/close-session`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ forceClose }),
        credentials: 'include',
      });
      
      if (!res.ok) {
        const errorData = await res.json();
        const error = new Error(errorData.message || errorData.error || 'Erro ao fechar mesa') as Error & {
          status?: number;
          [key: string]: any;
        };
        Object.assign(error, { status: res.status, ...errorData });
        throw error;
      }
      
      return res.json();
    },
    onSuccess: () => {
      invalidateAll();
      
      toast({
        title: "Mesa fechada com sucesso",
        description: `Mesa ${table?.number} está agora disponível para novos clientes`,
      });
      
      onOpenChange(false);
    },
    onError: (error: any) => {
      // Handle validation errors for pending payments
      if (error.status === 400 && error.pendingAmount) {
        const guestsList = error.unpaidGuests?.length > 0
          ? `\n${error.unpaidGuests.map((g: any) => `• ${g.name}: ${g.pending} Kz`).join('\n')}`
          : '';
        
        toast({
          title: "⚠️ Valores Pendentes",
          description: `Mesa possui ${error.pendingAmount} Kz pendente de pagamento.${guestsList}`,
          variant: "destructive",
        });
        
        // If user can force close, show option (future enhancement)
        if (error.canForceClose) {
        }
      } else {
        toast({
          title: "Erro ao fechar mesa",
          description: error.message || 'Não foi possível fechar a mesa.',
          variant: "destructive",
        });
      }
    },
  });
  
  // Buscar dados do restaurante para o slug
  const { data: restaurant } = useQuery({
    queryKey: ['/api/restaurants/current'],
    enabled: open && !!table,
  });

  // Dados reais da mesa
  const currentTable = tableData || table;
  const ordersCount = useMemo(() => ordersByGuest?.reduce((sum, og) => sum + og.orders.length, 0) || 0, [ordersByGuest]);
  const guestsCount = useMemo(() => allSessionGuests?.length || 0, [allSessionGuests]);
  const hasActiveSession = useMemo(() => !!currentTable?.currentSessionId || guestsCount > 0, [currentTable?.currentSessionId, guestsCount]);
  const subtotalBeforeAdjustments = useMemo(() => ordersByGuest?.reduce((sum: number, og: any) => sum + parseFloat(og.subtotal || '0'), 0) || 0, [ordersByGuest]);
  
  const currentTotalAmount = useMemo(() => {
    const totalFromBackend = ordersByGuestData?.totalAmount ? parseFloat(ordersByGuestData.totalAmount) : subtotalBeforeAdjustments;
    if (ordersByGuestData?.totalAmount) {
      return totalFromBackend;
    }
    let total = totalFromBackend;
    const sessionDiscount = parseFloat(currentTable?.currentSession?.discount || '0');
    const sessionDiscountType = currentTable?.currentSession?.discountType || 'valor';
    const sessionServiceFee = parseFloat(currentTable?.currentSession?.serviceCharge || '0');
    const sessionServiceFeeType = currentTable?.currentSession?.serviceChargeType || 'percentual';
    if (sessionDiscount > 0) {
      if (sessionDiscountType === 'percentual') {
        total = total * (1 - Math.min(sessionDiscount, 100) / 100);
      } else {
        total = Math.max(0, total - sessionDiscount);
      }
    }
    if (sessionServiceFee > 0) {
      if (sessionServiceFeeType === 'percentual') {
        total = total * (1 + sessionServiceFee / 100);
      } else {
        total = total + sessionServiceFee;
      }
    }
    return total;
  }, [ordersByGuestData?.totalAmount, subtotalBeforeAdjustments, currentTable?.currentSession?.discount, currentTable?.currentSession?.discountType, currentTable?.currentSession?.serviceCharge, currentTable?.currentSession?.serviceChargeType]);
  
  const totalPaid = useMemo(() => {
    const paidFromGuests = (ordersByGuest || []).reduce((sum: number, og: any) => sum + parseFloat(og.guest?.paidAmount || '0'), 0);
    return Math.max(sessionPaidAmount || 0, paidFromGuests);
  }, [ordersByGuest, sessionPaidAmount]);
  
  const sessionDuration = useMemo(() => {
    if (!currentTable?.currentSessionId || !currentTable?.currentSession?.startedAt) return '0h 0min';
    
    const start = new Date(currentTable.currentSession.startedAt).getTime();
    const now = new Date().getTime();
    const diffMs = now - start;
    
    // 🔧 FIX: Se diff for negativo ou absurdamente grande (> 24h), retornar 0h 0min
    if (diffMs < 0 || diffMs > 24 * 60 * 60 * 1000) {
      return '0h 0min';
    }

    const diffMins = Math.floor(diffMs / 60000);
    const hours = Math.floor(diffMins / 60);
    const mins = diffMins % 60;
    
    return `${hours}h ${mins}min`;
  }, [currentTable?.currentSessionId, currentTable?.currentSession?.startedAt]);

  const navigationItems = useMemo<NavigationItem[]>(() => [
    {
      id: 'overview',
      label: 'Visão Geral',
      icon: <LayoutGrid className="w-5 h-5" />,
      shortcut: '1',
    },
    {
      id: 'guests',
      label: 'Pessoas',
      icon: <Users className="w-5 h-5" />,
      badge: guestsCount,
      shortcut: '2',
    },
    {
      id: 'orders',
      label: 'Pedidos',
      icon: <ShoppingCart className="w-5 h-5" />,
      badge: ordersCount,
      shortcut: '3',
    },
    {
      id: 'payment',
      label: 'Pagamento',
      icon: <CreditCard className="w-5 h-5" />,
      shortcut: '4',
    },
    {
      id: 'split',
      label: 'Divisão',
      icon: <Split className="w-5 h-5" />,
      badge: guestsCount > 1 ? guestsCount : undefined,
      shortcut: '5',
    },
    {
      id: 'history',
      label: 'Histórico',
      icon: <History className="w-5 h-5" />,
      shortcut: '6',
    },
  ], [guestsCount, ordersCount]);

  const handleClose = useCallback(() => {
    onOpenChange(false);
  }, [onOpenChange]);

  const handleNavigateTable = useCallback((direction: 'prev' | 'next') => {
    if (!table || !onNavigate || allTables.length === 0) return;
    
    const currentIndex = allTables.findIndex(t => t.id === table.id);
    if (currentIndex === -1) return;
    
    const nextIndex = direction === 'next' 
      ? (currentIndex + 1) % allTables.length 
      : (currentIndex - 1 + allTables.length) % allTables.length;
    
    onNavigate(allTables[nextIndex]);
  }, [table, allTables, onNavigate]);

  // Função para imprimir comanda da mesa
  const handlePrintTableBill = useCallback(() => {
    if (!currentTable || ordersCount === 0) return;

    try {
      const printWindow = window.open('', '_blank');
      if (!printWindow) {
        toast({
          title: "Erro ao abrir janela",
          description: "Não foi possível abrir a janela de impressão. Verifique se pop-ups estão bloqueados.",
          variant: "destructive",
        });
        return;
      }

      const restaurantName = typeof restaurant === 'object' && restaurant && 'name' in restaurant ? (restaurant as any).name : 'Restaurante';
      const currentDate = new Date().toLocaleString('pt-PT');

      const printContent = `
        <!DOCTYPE html>
        <html>
          <head>
            <title>Comanda - Mesa ${currentTable.number}</title>
            <meta charset="UTF-8">
            <style>
              @media print {
                @page { margin: 0; }
                body { margin: 1cm; }
              }
              body { 
                font-family: 'Arial', sans-serif; 
                max-width: 80mm; 
                margin: 0 auto;
                font-size: 12px;
                line-height: 1.4;
              }
              .header { 
                text-align: center; 
                border-bottom: 2px solid #000;
                padding-bottom: 10px;
                margin-bottom: 10px;
              }
              .restaurant-name { 
                font-size: 18px; 
                font-weight: bold; 
                margin-bottom: 5px;
              }
              .title {
                font-size: 16px;
                font-weight: bold;
                text-align: center;
                margin: 10px 0;
                text-transform: uppercase;
              }
              .info-line {
                display: flex;
                justify-content: space-between;
                margin: 3px 0;
                font-size: 11px;
              }
              .section-title {
                font-weight: bold;
                margin-top: 15px;
                margin-bottom: 8px;
                font-size: 13px;
                text-transform: uppercase;
                border-bottom: 1px solid #000;
                padding-bottom: 3px;
              }
              .guest-section {
                margin: 10px 0;
                padding: 8px;
                background: #f9f9f9;
                border: 1px solid #ddd;
                border-radius: 4px;
              }
              .guest-header {
                font-weight: bold;
                margin-bottom: 8px;
                display: flex;
                justify-content: space-between;
                border-bottom: 1px dashed #999;
                padding-bottom: 5px;
              }
              .guest-number {
                display: inline-block;
                width: 24px;
                height: 24px;
                border-radius: 50%;
                background: #333;
                color: #fff;
                text-align: center;
                line-height: 24px;
                font-size: 11px;
                margin-right: 8px;
              }
              .item-line {
                display: flex;
                justify-content: space-between;
                padding: 3px 0;
                font-size: 11px;
              }
              .item-qty {
                margin-right: 8px;
                font-weight: bold;
              }
              .item-price {
                text-align: right;
                min-width: 60px;
              }
              .item-options {
                font-size: 9px;
                color: #666;
                margin-left: 10px;
                font-style: italic;
              }
              .subtotal {
                display: flex;
                justify-content: space-between;
                font-weight: bold;
                margin-top: 5px;
                padding-top: 5px;
                border-top: 1px dashed #999;
              }
              .total-section {
                margin-top: 15px;
                padding-top: 10px;
                border-top: 2px solid #000;
              }
              .total-line {
                display: flex;
                justify-content: space-between;
                font-size: 16px;
                font-weight: bold;
                margin-top: 10px;
              }
              .footer {
                margin-top: 20px;
                text-align: center;
                font-size: 10px;
                color: #666;
                border-top: 1px dashed #999;
                padding-top: 10px;
              }
              .status-badge {
                display: inline-block;
                padding: 2px 8px;
                border-radius: 4px;
                font-size: 9px;
                font-weight: bold;
                background: #e0e0e0;
              }
            </style>
          </head>
          <body>
            <!-- HEADER -->
            <div class="header">
              <div class="restaurant-name">${restaurantName}</div>
            </div>

            <div class="title">Comanda da Mesa</div>

            <!-- INFO -->
            <div style="margin-bottom: 10px; padding-bottom: 10px; border-bottom: 1px dashed #999;">
              <div class="info-line">
                <strong>Mesa:</strong>
                <span>${currentTable.number}${currentTable.area ? ` (${currentTable.area})` : ''}</span>
              </div>
              <div class="info-line">
                <strong>Data/Hora:</strong>
                <span>${currentDate}</span>
              </div>
              <div class="info-line">
                <strong>Pessoas:</strong>
                <span>${guestsCount}</span>
              </div>
              <div class="info-line">
                <strong>Duração:</strong>
                <span>${sessionDuration}</span>
              </div>
              <div class="info-line">
                <strong>Status:</strong>
                <span class="status-badge">${currentTable.status === 'occupied' ? 'OCUPADA' : 'DISPONÍVEL'}</span>
              </div>
            </div>

            <!-- PEDIDOS POR CONVIDADO -->
            <div class="section-title">Pedidos por Pessoa</div>
            ${ordersByGuest.map((og) => `
              <div class="guest-section">
                <div class="guest-header">
                  <div>
                    <span class="guest-number">#${og.guest.guestNumber}</span>
                    ${og.guest.name || `Cliente ${og.guest.guestNumber}`}
                  </div>
                </div>
                ${og.orders.flatMap(order => order.items || []).map(item => `
                  <div class="item-line">
                    <span>
                      <span class="item-qty">${item.quantity}x</span>
                      ${item.menuItem?.name || item.name}
                    </span>
                    <span class="item-price">${formatKwanza(parseFloat(item.price) * item.quantity)}</span>
                  </div>
                   ${item.options && item.options.length > 0 ? `
                     <div class="item-options">
                       + ${item.options.map((o: any) => o.value).join(', ')}
                     </div>
                   ` : ''}
                `).join('')}
                <div class="subtotal">
                  <span>Subtotal:</span>
                  <span>${formatKwanza(parseFloat(og.subtotal))}</span>
                </div>
              </div>
            `).join('')}

            <!-- TOTAL -->
            <div class="total-section">
              <div class="total-line">
                <span>TOTAL DA MESA:</span>
                <span>${formatKwanza(currentTotalAmount)}</span>
              </div>
            </div>

            <!-- FOOTER -->
            <div class="footer">
              Documento gerado em ${currentDate}<br>
              Esta é apenas uma comanda para conferência
            </div>
          </body>
        </html>
      `;

      printWindow.document.write(printContent);
      printWindow.document.close();
      
      printWindow.onload = () => {
        printWindow.print();
        setTimeout(() => {
          printWindow.close();
        }, 500);
      };

      toast({
        title: "Comanda enviada para impressão",
        description: `Mesa ${currentTable.number}`,
      });
    } catch (error) {
      console.error('Erro ao imprimir comanda:', error);
      toast({
        title: "Erro ao imprimir",
        description: "Não foi possível imprimir a comanda",
        variant: "destructive",
      });
    }
  }, [currentTable, ordersByGuest, ordersCount, guestsCount, currentTotalAmount, sessionDuration, restaurant, formatKwanza, toast]);

  const handleQrScan = useCallback((scannedValue: string) => {
    try {
      const url = new URL(scannedValue);
      const tableNumber = url.pathname.split('/').filter(Boolean).pop();
      const restaurantId = url.searchParams.get('r');

      if (!tableNumber) {
        toast({
          title: 'QR Code inválido',
          description: 'Não foi possível identificar o número da mesa.',
          variant: 'destructive',
        });
        return;
      }

      const foundTable = allTables?.find(t => {
        if (restaurantId && t.restaurantId !== restaurantId) return false;
        return String(t.number) === tableNumber;
      });

      if (foundTable) {
        onNavigate?.(foundTable);
        toast({
          title: 'Mesa encontrada!',
          description: `Mesa ${foundTable.number} aberta com sucesso.`,
        });
      } else {
        toast({
          title: 'Mesa não encontrada',
          description: `A mesa ${tableNumber} não foi encontrada neste restaurante.`,
          variant: 'destructive',
        });
      }
    } catch {
      toast({
        title: 'QR Code inválido',
        description: 'O código escaneado não é uma URL válida.',
        variant: 'destructive',
      });
    }
  }, [allTables, onNavigate, toast]);

  // Keyboard shortcuts
  useEffect(() => {
    if (!open) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      // Section navigation shortcuts (1-6)
      if (e.key >= '1' && e.key <= '6') {
        const sections: NavigationSection[] = ['overview', 'guests', 'orders', 'payment', 'split', 'history'];
        setActiveSection(sections[parseInt(e.key) - 1]);
        return;
      }

      // ESC - Close (apenas se nenhum sub-diálogo estiver aberto)
      if (e.key === 'Escape') {
        // Verificar se há sub-diálogos abertos (ex: Checkout Rápido)
        // O Radix UI marca diálogos abertos com data-state="open" em data-radix-dialog-content
        const openSubDialogs = document.querySelectorAll('[data-radix-dialog-content][data-state="open"]');
        if (openSubDialogs.length > 1) {
          // Há pelo menos um sub-diálogo aberto além do pai — não fechar o pai
          return;
        }
        onOpenChange(false);
        return;
      }

      // N - Quick Order
      if ((e.key === 'n' || e.key === 'N') && !e.ctrlKey && !e.metaKey && hasActiveSession) {
        setShowQuickOrder(true);
        return;
      }

      // G - Add Person
      if ((e.key === 'g' || e.key === 'G') && !e.ctrlKey && !e.metaKey && hasActiveSession) {
        setShowAddPerson(true);
        return;
      }

      // Q - QR Code
      if ((e.key === 'q' || e.key === 'Q') && !e.ctrlKey && !e.metaKey && hasActiveSession) {
        setShowQRCode(true);
        return;
      }

      // S - Scan QR
      if ((e.key === 's' || e.key === 'S') && !e.ctrlKey && !e.metaKey && !e.altKey) {
        setShowQrScanner(true);
        return;
      }

      // P - Payment
      if ((e.key === 'p' || e.key === 'P') && !e.ctrlKey && !e.metaKey && hasActiveSession) {
        setActiveSection('payment');
        return;
      }

      // Arrow navigation
      if (e.key === 'ArrowLeft') {
        e.preventDefault();
        handleNavigateTable('prev');
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        handleNavigateTable('next');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [open, currentTable, onOpenChange, handleNavigateTable]);

  if (!table) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogPortal>
        <DialogOverlay />
        <DialogPrimitive.Content
          className={cn(
            "fixed inset-0 z-50 flex",
            "data-[state=open]:animate-in data-[state=closed]:animate-out",
            "data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
            "bg-background"
          )}
          aria-describedby="table-dialog-description"
          onEscapeKeyDown={handleClose}
        >
          {/* Hidden description for accessibility */}
          <div id="table-dialog-description" className="sr-only">
            Diálogo de gestão da mesa {table.number}
          </div>

        <div className="flex flex-col lg:flex-row h-full">
          {/* SIDEBAR - Navegação Lateral */}
          <motion.aside
            initial={false}
            animate={{ 
              width: isSidebarCollapsed ? 72 : '100%',
              height: isSidebarCollapsed ? 'auto' : 'auto'
            }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
            className={cn(
              "flex flex-col bg-sidebar border-b lg:border-r border-sidebar-border shadow-xl",
              "lg:w-auto w-full h-full lg:h-auto",
              isSidebarCollapsed ? "hidden lg:flex lg:w-[72px]" : "flex"
            )}
          >
            {/* Header da Sidebar */}
            <div className="p-4 border-b border-sidebar-border">
              <div className="flex items-center justify-between mb-3">
                {!isSidebarCollapsed && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                  >
                    <h2 className="text-lg font-bold text-sidebar-foreground">
                      Mesa {table.number}
                    </h2>
                    <p className="text-xs text-muted-foreground">
                      {table.area || 'Área principal'}
                    </p>
                  </motion.div>
                )}
                <div className="flex items-center gap-1">
                  {canDeleteTable && (
                    <>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setShowDeleteDialog(true)}
                        className="h-8 w-8 text-destructive hover:text-destructive"
                        data-testid={`button-delete-table-${table.id}`}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                      <ConfirmDialog
                        open={showDeleteDialog}
                        onOpenChange={setShowDeleteDialog}
                        title="Excluir mesa"
                        description={`Tem certeza que deseja excluir a mesa ${table.number}? Esta ação não pode ser desfeita.`}
                        confirmText="Excluir"
                        cancelText="Cancelar"
                        onConfirm={() => {
                          apiRequest('DELETE', `/api/tables/${table.id}`).then(() => {
                            toast({ title: 'Mesa excluída', description: `Mesa ${table.number} foi excluída.` });
                            onOpenChange(false);
                          }).catch((error) => {
                            toast({ title: 'Erro', description: error.message || 'Não foi possível excluir a mesa.', variant: 'destructive' });
                          });
                        }}
                        variant="destructive"
                      />
                    </>
                  )}
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
                    className="h-8 w-8"
                  >
                    {isSidebarCollapsed ? (
                      <ChevronRight className="w-4 h-4" />
                    ) : (
                      <ChevronLeft className="w-4 h-4" />
                    )}
                  </Button>
                </div>
              </div>

               {/* Status Badge */}
               {!isSidebarCollapsed && (
                 <Badge
                   variant={table.status === 'ocupada' ? 'default' : 'secondary'}
                   className="w-full justify-center py-1"
                 >
                   {table.status === 'ocupada' ? '🟢 Ocupada' : '⚪ Disponível'}
                 </Badge>
              )}
            </div>

            {/* Quick Stats */}
            {!isSidebarCollapsed && (
              <div className="p-4 border-b border-sidebar-border bg-sidebar-accent">
                <div className="grid grid-cols-2 gap-3">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-foreground">
                      {guestsCount}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      Pessoas
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-success">
                      {formatKwanza(currentTotalAmount)}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      Total
                    </div>
                  </div>
                </div>
                <div className="mt-3 flex items-center justify-center gap-2 text-xs text-muted-foreground">
                  <Clock className="w-3 h-3" />
                  <span>{sessionDuration}</span>
                </div>
              </div>
            )}

            {/* Navigation Items */}
            <ScrollArea className="flex-1 px-2 py-4">
              <nav className="space-y-1">
                {navigationItems.map((item) => (
                  <Button
                    key={item.id}
                    variant={activeSection === item.id ? 'default' : 'ghost'}
                    className={cn(
                      'w-full justify-start gap-3 h-11 transition-all',
                      isSidebarCollapsed && 'justify-center px-0',
                      activeSection === item.id && 'shadow-md'
                    )}
                    onClick={() => setActiveSection(item.id)}
                  >
                    {item.icon}
                    {!isSidebarCollapsed && (
                      <>
                        <span className="flex-1 text-left">{item.label}</span>
                        {item.badge && (
                          <Badge variant="secondary" className="ml-auto">
                            {item.badge}
                          </Badge>
                        )}
                        {item.shortcut && (
                          <kbd className="ml-auto px-2 py-0.5 text-xs font-mono bg-neutral-100 dark:bg-neutral-800 rounded">
                            {item.shortcut}
                          </kbd>
                        )}
                      </>
                    )}
                  </Button>
                ))}
              </nav>
            </ScrollArea>

            {/* Footer Actions */}
            <div className="p-3 border-t border-sidebar-border space-y-2">
              {!isSidebarCollapsed ? (
                <>
                  <Button
                    variant="outline"
                    className="w-full gap-2"
                    size="sm"
                    onClick={() => setShowQrScanner(true)}
                    disabled={false}
                  >
                    <Camera className="w-4 h-4" />
                    Ler QR Code
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full gap-2"
                    size="sm"
                    onClick={() => setShowQRCode(true)}
                    disabled={false}
                  >
                    <QrCode className="w-4 h-4" />
                    QR Code
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full gap-2"
                    size="sm"
                    onClick={handlePrintTableBill}
                    disabled={!hasActiveSession || ordersCount === 0}
                  >
                    <Receipt className="w-4 h-4" />
                    Imprimir Comanda
                  </Button>
                </>
              ) : (
                <>
                  <Button 
                    variant="outline" 
                    size="icon" 
                    className="w-full"
                    onClick={() => setShowQrScanner(true)}
                    disabled={false}
                    title="Ler QR Code"
                  >
                    <Camera className="w-4 h-4" />
                  </Button>
                  <Button 
                    variant="outline" 
                    size="icon" 
                    className="w-full"
                    onClick={() => setShowQRCode(true)}
                    disabled={false}
                    title="QR Code"
                  >
                    <QrCode className="w-4 h-4" />
                  </Button>
                  <Button 
                    variant="outline" 
                    size="icon" 
                    className="w-full"
                    onClick={handlePrintTableBill}
                    disabled={!hasActiveSession || ordersCount === 0}
                    title="Imprimir Comanda"
                  >
                    <Receipt className="w-4 h-4" />
                  </Button>
                </>
              )}
            </div>
          </motion.aside>

          {/* MAIN CONTENT AREA */}
          <div className="flex-1 flex flex-col overflow-hidden">
            {/* Top Bar - Actions & Navigation */}
            <div className="bg-card border-b border-border px-4 py-3">
              <div className="flex flex-col gap-3">
                {/* Top actions row */}
                <div className="flex flex-wrap items-center gap-2">
                  <Button 
                    variant="default" 
                    size="sm" 
                    className="gap-2"
                    onClick={() => {
                      if (!hasActiveSession) {
                        setShowStartSession(true);
                        return;
                      }
                      onOpenChange(false);
                      navigate(`/pdv?tableId=${table?.id}`);
                    }}
                    disabled={!currentTable}
                  >
                    <Plus className="w-4 h-4" />
                    <span className="hidden sm:inline">Novo Pedido</span>
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="gap-2"
                    onClick={() => setShowAddPerson(true)}
                    disabled={false}
                  >
                    <UserPlus className="w-4 h-4" />
                    <span className="hidden sm:inline">Adicionar Pessoa</span>
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="gap-2"
                    onClick={() => setShowQuickOrder(true)}
                    disabled={false}
                  >
                    <Package className="w-4 h-4" />
                    <span className="hidden sm:inline">Pedido Rápido</span>
                  </Button>
                  
                  <div className="flex-1" />
                  
                  {/* Right side */}
                  <div className="flex items-center gap-2">
                    {allTables.length > 1 && (
                      <>
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => handleNavigateTable('prev')}
                          className="h-8 w-8"
                        >
                          <ChevronLeft className="w-4 h-4" />
                        </Button>
                        <span className="text-xs sm:text-sm text-muted-foreground px-1">
                          {allTables.findIndex(t => t.id === table.id) + 1}/{allTables.length}
                        </span>
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => handleNavigateTable('next')}
                          className="h-8 w-8"
                        >
                          <ChevronRight className="w-4 h-4" />
                        </Button>
                      </>
                    )}
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={handleClose}
                      className="h-8 w-8"
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </div>

             {/* Content Area - Dynamic based on active section */}
             <ScrollArea className="flex-1 bg-background">
               <div className="p-3 sm:p-6">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={activeSection}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.2 }}
                  >
                    {activeSection === 'overview' && (
                      <OverviewSection
                        table={currentTable}
                        guestsCount={guestsCount}
                        ordersCount={ordersCount}
                        totalAmount={currentTotalAmount}
                        sessionDuration={sessionDuration}
                        ordersByGuest={ordersByGuest || []}
                        onStartSession={() => setShowStartSession(true)}
                      />
                    )}
                    
                    {activeSection === 'guests' && (
                      <GuestsSection
                        table={currentTable}
                        guests={allSessionGuests || []}
                        ordersByGuest={ordersByGuest || []}
                        isLoading={isLoadingGuests}
                        onAddPerson={() => setShowAddPerson(true)}
                        onConvertGuest={(guestId) => setConvertingGuest(guestId)}
                        onRemoveGuest={(guestId) => {
                          if (confirm('Tem certeza que deseja remover esta pessoa?')) {
                            mutations.removeGuestMutation.mutate(guestId);
                          }
                        }}
                        onShowQRCode={() => setShowQRCode(true)}
                        onStartSession={() => setShowStartSession(true)}
                      />
                    )}
                    
                    {activeSection === 'orders' && (
                      <OrdersSection
                        table={currentTable}
                        ordersByGuest={ordersByGuest || []}
                        isLoading={isLoadingGuests}
                        onQuickOrder={() => setShowQuickOrder(true)}
                        onEditOrder={(order) => setOrderToEdit(order)}
                        onCancelOrder={(order) => setOrderToCancel(order)}
                        onMoveItem={(item) => setItemToMove(item)}
                        onStartSession={() => setShowStartSession(true)}
                      />
                    )}
                    
                    {activeSection === 'payment' && (
                      <PaymentSection
                        table={currentTable}
                        guests={allSessionGuests || []}
                        ordersByGuest={ordersByGuest || []}
                        totalAmount={currentTotalAmount}
                        sessionPaidAmount={totalPaid}
                        onClose={() => onOpenChange(false)}
                        onCloseTable={() => setShowCloseDialog(true)}
                      />
                    )}
                    
                    {activeSection === 'split' && (
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <h2 className="text-2xl font-bold">Divisão de Conta</h2>
                            <p className="text-muted-foreground">
                              Arraste itens entre convidados para reorganizar ou dividir a conta
                            </p>
                          </div>
                          
                          {/* Quick Actions */}
                          {guestsCount >= 2 && (
                            <div className="flex items-center gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                  // Calcular se valores estão equilibrados
                                  const avgAmount = currentTotalAmount / guestsCount;
                                  const threshold = avgAmount * 0.3;
                                  const getOgAmount = (og: any) => {
                                    const raw = og?.subtotal ?? og?.totalAmount ?? 0;
                                    const n = typeof raw === 'number' ? raw : parseFloat(raw);
                                    return Number.isFinite(n) ? n : 0;
                                  };

                                  const isBalanced = ordersByGuest?.every((og: any) =>
                                    Math.abs(getOgAmount(og) - avgAmount) <= threshold
                                  );
                                  
                                  if (isBalanced) {
                                    toast({
                                      title: "💡 Sugestão",
                                      description: "Os valores estão equilibrados! Considere dividir igualmente para mais rapidez.",
                                    });
                                  } else {
                                    toast({
                                      title: "Modo: Cada um paga o seu",
                                      description: "Arraste os itens para os convidados corretos",
                                    });
                                  }
                                }}
                                className="gap-2"
                              >
                                <Receipt className="w-4 h-4" />
                                Cada um paga o seu
                              </Button>
                            </div>
                          )}
                        </div>
                        
                        {/* Preview de Totais - Apenas Visualização */}
                        {guestsCount >= 2 && (() => {
                          // Calcular média e variância para indicadores
                          const avgAmount = currentTotalAmount / guestsCount;
                          const threshold = avgAmount * 0.3; // 30% de variação
                          
                          const getBalanceIndicator = (amount: number) => {
                            const diff = amount - avgAmount;
                            const percentDiff = (diff / avgAmount) * 100;
                            
                            if (diff > threshold) {
                              return {
                                badge: '⬆️ Acima',
                                variant: 'destructive' as const,
                                color: 'text-red-600',
                                bgColor: 'bg-red-50 dark:bg-red-950/20',
                                borderColor: 'border-red-200 dark:border-red-800',
                                tooltip: `${percentDiff.toFixed(0)}% acima da média (${formatKwanza(avgAmount)})`,
                              };
                            } else if (diff < -threshold) {
                              return {
                                badge: '⬇️ Abaixo',
                                variant: 'secondary' as const,
                                color: 'text-blue-600',
                                bgColor: 'bg-blue-50 dark:bg-blue-950/20',
                                borderColor: 'border-blue-200 dark:border-blue-800',
                                tooltip: `${Math.abs(percentDiff).toFixed(0)}% abaixo da média (${formatKwanza(avgAmount)})`,
                              };
                            } else {
                              return {
                                badge: '✓ Equilibrado',
                                variant: 'outline' as const,
                                color: 'text-green-600',
                                bgColor: 'bg-green-50 dark:bg-green-950/20',
                                borderColor: 'border-green-200 dark:border-green-800',
                                tooltip: `Próximo da média (${formatKwanza(avgAmount)})`,
                              };
                            }
                          };
                          
                          const getOgAmount = (og: any) => {
                            const raw = og?.subtotal ?? og?.totalAmount ?? 0;
                            const n = typeof raw === 'number' ? raw : parseFloat(raw);
                            return Number.isFinite(n) ? n : 0;
                          };

                          const orderedForPreview = (() => {
                            // Sempre priorizar mostrar "Mesa Completa" (guest.id === 'anonymous')
                            const anonymous = ordersByGuest?.find((og: any) => og?.guest?.id === 'anonymous');
                            const rest = (ordersByGuest || []).filter((og: any) => og?.guest?.id !== 'anonymous');
                            return anonymous ? [anonymous, ...rest] : rest;
                          })();

                          return (
                            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                              {orderedForPreview.slice(0, 4).map((og: any) => {
                                const ogAmount = getOgAmount(og);
                                const indicator = getBalanceIndicator(ogAmount);

                                return (
                                  <Card
                                    key={og.guest.id}
                                    className={cn(
                                      "border-2 transition-all hover:shadow-md",
                                      indicator.borderColor,
                                      indicator.bgColor
                                    )}
                                  >
                                    <CardContent className="p-4">
                                      <div className="flex items-center justify-between mb-2">
                                        <div className="flex items-center gap-2 flex-1 min-w-0">
                                          <UserCircle className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                                          <p className="text-sm font-medium truncate">
                                            {og.guest.name || `Cliente ${og.guest.guestNumber}`}
                                          </p>
                                        </div>
                                      </div>

                                      <div className="flex items-baseline justify-between mb-2">
                                        <p className={cn("text-2xl font-bold", indicator.color)}>
                                          {formatKwanza(ogAmount)}
                                        </p>
                                      </div>

                                      <div className="flex items-center justify-between">
                                        <p className="text-xs text-muted-foreground">
                                          {og.orders?.reduce(
                                            (sum: number, order: any) => sum + (order.items?.length || 0),
                                            0
                                          )}{' '}
                                          {og.orders?.reduce(
                                            (sum: number, order: any) => sum + (order.items?.length || 0),
                                            0
                                          ) === 1
                                            ? 'item'
                                            : 'itens'}
                                        </p>
                                        <Badge
                                          variant={indicator.variant}
                                          className="text-xs px-2 py-0"
                                          title={indicator.tooltip}
                                        >
                                          {indicator.badge}
                                        </Badge>
                                      </div>
                                    </CardContent>
                                  </Card>
                                );
                              })}

                              {orderedForPreview.length > 4 && (
                                <Card className="border-2 border-dashed">
                                  <CardContent className="p-4 flex items-center justify-center h-full">
                                    <div className="text-center">
                                      <p className="text-sm font-medium text-muted-foreground">
                                        +{orderedForPreview.length - 4} mais
                                      </p>
                                    </div>
                                  </CardContent>
                                </Card>
                              )}
                            </div>
                          );
                        })()}
                        
                        {!hasActiveSession ? (
                          <div className="text-center py-12">
                            <Split className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
                            <h3 className="text-lg font-semibold mb-2">Sessão Não Iniciada</h3>
                            <p className="text-muted-foreground mb-4">
                              Adicione pessoas à mesa para começar
                            </p>
                            <Button onClick={() => setShowAddPerson(true)}>
                              <UserPlus className="w-4 h-4 mr-2" />
                              Adicionar Pessoa
                            </Button>
                          </div>
                        ) : guestsCount === 0 ? (
                          <div className="text-center py-12">
                            <Users className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
                            <h3 className="text-lg font-semibold mb-2">Nenhum Convidado</h3>
                            <p className="text-muted-foreground mb-4">
                              Adicione pessoas à mesa para dividir conta
                            </p>
                            <Button onClick={() => setShowAddPerson(true)}>
                              <UserPlus className="w-4 h-4 mr-2" />
                              Adicionar Pessoa
                            </Button>
                          </div>
                        ) : guestsCount === 1 ? (
                          <div className="text-center py-12">
                            <AlertCircle className="h-16 w-16 mx-auto text-orange-500 mb-4" />
                            <h3 className="text-lg font-semibold mb-2">Apenas 1 Convidado</h3>
                            <p className="text-muted-foreground mb-4">
                              Adicione mais pessoas para ativar a divisão de conta
                            </p>
                            <Button onClick={() => setShowAddPerson(true)}>
                              <UserPlus className="w-4 h-4 mr-2" />
                              Adicionar Pessoa
                            </Button>
                          </div>
                        ) : (
                          <>
                            <div className="mb-4 p-3 bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                              <p className="text-sm text-blue-800 dark:text-blue-200">
                                💡 <strong>Como usar:</strong> Role para baixo para ver a lista completa de convidados. 
                                Clique em um convidado para expandir e arrastar itens entre eles.
                              </p>
                            </div>
                            <BillSplitPanel
                              tableId={table?.id || ''}
                              sessionId={currentTable?.currentSessionId}
                              totalAmount={currentTotalAmount}
                            />
                          </>
                        )}
                      </div>
                    )}
                    
                    {activeSection === 'history' && (
                      <HistorySection table={currentTable} />
                    )}
                  </motion.div>
                </AnimatePresence>
              </div>
            </ScrollArea>

            {/* Bottom Bar - Summary & Main Actions */}
            <div className="bg-card border-t border-border px-3 py-3 sm:px-6 sm:py-4">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                {/* Left - Summary */}
                <div className="flex flex-wrap items-center gap-3 sm:gap-6">
                  <div>
                    <div className="text-xs text-muted-foreground">
                      Total da Mesa
                    </div>
                    <div className="text-xl sm:text-2xl font-bold text-success">
                      {formatKwanza(currentTotalAmount)}
                    </div>
                  </div>
                  <Separator orientation="vertical" className="h-8 sm:h-10 hidden sm:block" />
                  <div className="flex flex-wrap items-center gap-3 sm:gap-4 text-xs sm:text-sm text-foreground">
                    <div className="flex items-center gap-1.5">
                      <Users className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-muted-foreground" />
                      <span>{guestsCount} pessoas</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <ShoppingCart className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-muted-foreground" />
                      <span>{ordersCount} pedidos</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-muted-foreground" />
                      <span>{sessionDuration}</span>
                    </div>
                  </div>
                </div>

                {/* Right - Main Actions */}
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-3">
                  <Button 
                    variant="outline" 
                    size="default"
                    onClick={() => setActiveSection('split')}
                    disabled={!hasActiveSession || ordersCount === 0 || guestsCount < 2}
                    className="gap-2 w-full sm:w-auto"
                  >
                    <Split className="w-4 h-4" />
                    Dividir Conta
                  </Button>
                  <Button 
                    variant="default" 
                    size="default" 
                    className="gap-2 w-full sm:w-auto"
                    onClick={() => setActiveSection('payment')}
                    disabled={!hasActiveSession || ordersCount === 0}
                  >
                    <CreditCard className="w-4 h-4" />
                    Finalizar Pagamento
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
        </DialogPrimitive.Content>
      </DialogPortal>

      {/* Auxiliary Dialogs */}
      {showStartSession && currentTable && (
        <StartSessionDialog
          open={showStartSession}
          onOpenChange={setShowStartSession}
          table={currentTable}
          onSuccess={() => {
            // Após iniciar sessão, pode abrir dialog de adicionar pessoa
            setShowAddPerson(true);
          }}
        />
      )}

      {showAddPerson && (
        <AddPersonDialog
          open={showAddPerson}
          onOpenChange={setShowAddPerson}
          tableId={table?.id || ''}
          sessionId={currentTable?.currentSessionId || ''}
        />
      )}

      {showQuickOrder && (
        <QuickOrderDialog
          open={showQuickOrder}
          onOpenChange={setShowQuickOrder}
          tableId={table?.id || ''}
          tableNumber={currentTable?.number ?? 0}
          sessionId={currentTable?.currentSessionId || ''}
        />
      )}

      {showQRCode && currentTable && (
        <QRCodeDialog
          open={showQRCode}
          onOpenChange={setShowQRCode}
          tableId={currentTable.id}
          tableNumber={currentTable.number?.toString() || ''}
          restaurantId={currentTable.restaurantId}
          sessionPin={currentTable.currentSession?.pin || null}
        />
      )}

      <QrScannerDialog
        open={showQrScanner}
        onOpenChange={setShowQrScanner}
        onScan={handleQrScan}
        title="Ler QR Code da Mesa"
        description="Aponte a câmara para o QR Code para abrir a mesa"
      />

      {convertingGuest && (
        <ConvertGuestDialog
          open={!!convertingGuest}
          onOpenChange={() => setConvertingGuest(null)}
          guestId={convertingGuest}
          tableId={table?.id || ''}
        />
      )}

      {orderToCancel && (
        <CancelOrderDialog
          open={!!orderToCancel}
          onOpenChange={() => setOrderToCancel(null)}
          order={orderToCancel}
          onConfirm={() => {
            mutations.cancelOrderMutation.mutate(orderToCancel.id);
            setOrderToCancel(null);
          }}
        />
      )}

      {orderToEdit && (
        <EditOrderDialog
          open={!!orderToEdit}
          onOpenChange={() => setOrderToEdit(null)}
          order={orderToEdit}
        />
      )}

      {itemToMove && (
        <MoveItemDialog
          open={!!itemToMove}
          onOpenChange={() => setItemToMove(null)}
          item={itemToMove}
          tableId={table?.id || ''}
        />
      )}
      {/* ✅ SOLUÇÃO 4: Diálogo de Confirmação para Fechar Mesa */}
      <Dialog open={showCloseDialog} onOpenChange={setShowCloseDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <XCircle className="w-5 h-5" />
              Fechar Mesa {table?.number}?
            </DialogTitle>
            <DialogDescription>
              Esta ação irá encerrar a sessão atual e liberar a mesa para novos clientes.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {/* Status de Pagamento */}
            {(() => {
              const pending = Math.max(0, currentTotalAmount - totalPaid);

              // Considerar pendências por convidado para evitar falso "Pagamento Completo"
              // (caso sessionPaidAmount/totalPaid esteja inflacionado).
              const guestsWithDebt = (allSessionGuests || []).filter((g: any) => parseFloat(g?.subtotal || '0') > 0);
              const unpaidGuests = guestsWithDebt.filter((g: any) => {
                const paid = parseFloat(g?.paidAmount || '0');
                const subtotal = parseFloat(g?.subtotal || '0');
                return paid < subtotal - 0.01;
              }).length;

              const isPaid =
                currentTotalAmount > 0 &&
                pending <= 1.0 &&
                (unpaidGuests === 0 || totalPaid >= currentTotalAmount - 1.0);

              return (
                <div
                  className={cn(
                    "p-4 rounded-lg border",
                    isPaid
                      ? "bg-green-50 dark:bg-green-950/20 border-green-200 dark:border-green-900"
                      : "bg-orange-50 dark:bg-orange-950/20 border-orange-200 dark:border-orange-900"
                  )}
                >
                  <div
                    className={cn(
                      "flex items-center gap-2 mb-2",
                      isPaid
                        ? "text-green-700 dark:text-green-300"
                        : "text-orange-700 dark:text-orange-300"
                    )}
                  >
                    {isPaid ? (
                      <CheckCircle2 className="w-5 h-5" />
                    ) : (
                      <AlertCircle className="w-5 h-5" />
                    )}
                    <span className="font-semibold">
                      {isPaid ? "Pagamento Completo" : "Pagamento Pendente"}
                    </span>
                  </div>

                  <div className="text-sm text-muted-foreground space-y-1">
                    <div className="flex justify-between">
                      <span>Total da Mesa:</span>
                      <span className="font-medium">{formatKwanza(currentTotalAmount)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Total Pago:</span>
                      <span
                        className={cn(
                          "font-medium",
                          isPaid ? "text-green-600 dark:text-green-400" : "text-orange-600 dark:text-orange-400"
                        )}
                      >
                        {formatKwanza(totalPaid)}
                      </span>
                    </div>
                    {!isPaid && (
                      <div className="flex justify-between">
                        <span>Pendente:</span>
                        <span className="font-medium text-orange-600 dark:text-orange-400">
                          {formatKwanza(pending)}
                        </span>
                      </div>
                    )}
                    <div className="flex justify-between">
                      <span>Convidados:</span>
                      <span className="font-medium">{guestsCount}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Pedidos:</span>
                      <span className="font-medium">{ordersCount}</span>
                    </div>
                  </div>
                </div>
              );
            })()}

            {/* Informação */}
            <div className="text-sm text-muted-foreground">
              <p>Ao fechar esta mesa:</p>
              <ul className="list-disc list-inside mt-2 space-y-1">
                <li>A sessão será encerrada</li>
                <li>A mesa ficará disponível</li>
                <li>O histórico será mantido</li>
              </ul>
            </div>

            {/* Botões */}
            <div className="flex gap-3">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => setShowCloseDialog(false)}
                disabled={closeTableMutation.isPending}
              >
                Cancelar
              </Button>
              <Button
                className="flex-1 bg-green-600 hover:bg-green-700"
                onClick={() => closeTableMutation.mutate(true)}
                disabled={closeTableMutation.isPending}
              >
                {closeTableMutation.isPending ? (
                  <>Fechando...</>
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4 mr-2" />
                    Fechar Mesa
                  </>
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </Dialog>
  );
}
