/**
 * TableDialogSplitPanel MELHORADO
 * Integra todas as melhorias implementadas:
 * - Validação de encerramento de sessão
 * - Atalhos de teclado
 * - Navegação entre mesas
 * - Gestão de pessoas (3 modos)
 * - QR Code
 */

import { useState } from 'react';
import { motion } from 'framer-motion';
import { useLocation } from 'wouter';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, QrCode } from 'lucide-react';
import { useTableData } from './hooks/useTableData';
import { useTableMutations } from './hooks/useTableMutations';
import { useTableKeyboardShortcuts, KeyboardShortcutsHint } from './hooks/useTableKeyboardShortcuts';
import { useTableNavigation } from './hooks/useTableNavigation';
import { GuestDetailPanel } from './panels/GuestDetailPanel';
import { PaymentPanel } from './panels/PaymentPanel';
import { CancelOrderDialog } from './dialogs/CancelOrderDialog';
import { EditOrderDialog } from './dialogs/EditOrderDialog';
import { MoveItemDialog } from './dialogs/MoveItemDialog';
import { AddPersonDialog } from './dialogs/AddPersonDialog';
import { EndSessionDialog } from './dialogs/EndSessionDialog';
import { QRCodeDialog } from './dialogs/QRCodeDialog';
import { QuickOrderDialog } from '@/components/QuickOrderDialog';
import { TableCheckoutDialog } from '@/components/tables/TableCheckoutDialog';
import { useToast } from '@/hooks/use-toast';
import type { Table } from '@shared/schema';

interface TableDialogSplitPanelEnhancedProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  table: Table | null;
  allTables?: Table[];
  onNavigate?: (table: Table) => void;
}

type DetailView = 
  | { type: 'guest'; guestId: string }
  | { type: 'order'; orderId: string }
  | { type: 'payment' }
  | { type: 'stats' }
  | null;

export function TableDialogSplitPanelEnhanced({
  open,
  onOpenChange,
  table,
  allTables = [],
  onNavigate,
}: TableDialogSplitPanelEnhancedProps) {
  const [, setLocation] = useLocation();
  const [detailView, setDetailView] = useState<DetailView>(null);
  const { toast } = useToast();
  
  // Dialog states
  const [orderToCancel, setOrderToCancel] = useState<any>(null);
  const [orderToEdit, setOrderToEdit] = useState<any>(null);
  const [itemToMove, setItemToMove] = useState<any>(null);
  const [showAddPerson, setShowAddPerson] = useState(false);
  const [showQuickOrder, setShowQuickOrder] = useState(false);
  const [showStartSession, setShowStartSession] = useState(false);
  const [showEndSession, setShowEndSession] = useState(false);
  const [showQRCode, setShowQRCode] = useState(false);
  const [numberOfGuests, setNumberOfGuests] = useState<string>('1');
  const [showCheckout, setShowCheckout] = useState(false);

  // Hooks
  const {
    ordersByGuestData,
    guests,
    tableOrders,
    totalAmount,
    totalOrders,
    activeGuests,
    isLoading,
  } = useTableData({ tableId: table?.id, isOpen: open });

  const mutations = useTableMutations({ tableId: table?.id });
  
  const navigation = useTableNavigation({
    currentTable: table,
    allTables,
    onNavigate,
  });

  // Atalhos de teclado
  useTableKeyboardShortcuts({
    enabled: open,
    handlers: {
      onNewOrder: () => {
        if (table?.currentSessionId) {
          setShowQuickOrder(true);
        }
      },
      onCheckout: () => {
        if (table?.id) {
          setShowCheckout(true);
        }
      },
      onAddGuest: () => {
        // ✅ Check capacity before allowing to add guest
        const tableCapacity = table?.capacity || 4;
        const currentGuestsCount = guests?.length || 0;
        
        if (currentGuestsCount >= tableCapacity) {
          toast({
            title: "❌ Capacidade máxima atingida",
            description: `Esta mesa tem capacidade para ${tableCapacity} ${tableCapacity === 1 ? 'pessoa' : 'pessoas'} e já está completa.`,
            variant: "destructive",
          });
          return;
        }
        
        setShowAddPerson(true);
      },
      onShowQR: () => setShowQRCode(true),
      onEndSession: () => {
        if (table?.status === 'ocupada') {
          setShowEndSession(true);
        }
      },
      onPrevTable: navigation.goToPrevTable,
      onNextTable: navigation.goToNextTable,
      onClose: () => onOpenChange(false),
    },
  });

  if (!table) return null;

  const handleAddPerson = (data: any) => {
    // Unificado para usar addGuestMutation do hook
    // API aceita { name?, customerId? } e deduz tipo (anônimo vs cliente)
    if (data.type === 'search' && data.customerId) {
      mutations.addGuestMutation.mutate({
        type: 'customer',
        name: data.name,
        customerId: data.customerId,
      });
    } else if (data.type === 'quick') {
      // Cria convidado com nome rápido (sem customerId)
      mutations.addGuestMutation.mutate({
        type: 'anonymous',
        name: data.name,
      });
    } else if (data.type === 'anonymous') {
      mutations.addGuestMutation.mutate({
        type: 'anonymous',
        name: data.name || '',
      });
    }
  };

  const handleEndSession = () => {
    mutations.endSessionMutation.mutate();
    setShowEndSession(false);
    onOpenChange(false);
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-6xl w-[92vw] h-[85vh] p-0 gap-0 overflow-hidden">
          {/* Keyboard Shortcuts Hint */}
          <KeyboardShortcutsHint />

          {/* Header com Navegação */}
          <div className="flex items-center justify-between px-6 py-4 border-b bg-gradient-to-r from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
            <div className="flex items-center gap-4">
              {/* Navegação entre mesas */}
              {navigation.canNavigate && (
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={navigation.goToPrevTable}
                    disabled={!navigation.prevTable}
                    className="h-8 w-8"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <span className="text-xs text-slate-600 dark:text-slate-400 min-w-[60px] text-center">
                    {navigation.currentPosition}/{navigation.totalTables}
                  </span>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={navigation.goToNextTable}
                    disabled={!navigation.nextTable}
                    className="h-8 w-8"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              )}
              
              <div>
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
                  Mesa {table.number}
                </h2>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  {table.status === 'livre' ? 'Livre' : `${activeGuests} pessoas • ${totalOrders} pedidos`}
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              {/* QR Code Button */}
              {table.status === 'ocupada' && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowQRCode(true)}
                  className="flex items-center gap-2"
                >
                  <QrCode className="h-4 w-4" />
                  <span className="hidden sm:inline">QR Code</span>
                </Button>
              )}
              
              <div className="text-right">
                <p className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-violet-600 bg-clip-text text-transparent">
                  {totalAmount.toLocaleString('pt-AO', { style: 'currency', currency: 'AOA' })}
                </p>
                <p className="text-xs text-slate-500">Total da mesa</p>
              </div>
            </div>
          </div>

          {/* Split Panel Layout */}
          <div className="flex h-[calc(85vh-88px)] overflow-hidden">
            {/* MASTER PANEL (Left) - Lista de convidados */}
            <motion.div
              initial={{ x: -50, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ type: 'spring', stiffness: 200, damping: 20 }}
              className="w-72 lg:w-80 border-r bg-slate-50 dark:bg-slate-900 flex flex-col"
            >
              {/* Capacity Indicator */}
              <div className="p-4 border-b bg-white dark:bg-slate-800">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-slate-600 dark:text-slate-400">
                    Ocupação da Mesa
                  </span>
                  <span className={`text-sm font-bold ${guests.length >= (table?.capacity || 4) ? 'text-red-600' : 'text-green-600'}`}>
                    {guests.length} / {table?.capacity || 4}
                  </span>
                </div>
                <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2">
                  <div 
                    className={`h-2 rounded-full transition-all duration-300 ${
                      guests.length >= (table?.capacity || 4) 
                        ? 'bg-red-500' 
                        : guests.length >= (table?.capacity || 4) * 0.8
                        ? 'bg-yellow-500'
                        : 'bg-green-500'
                    }`}
                    style={{ width: `${Math.min((guests.length / (table?.capacity || 4)) * 100, 100)}%` }}
                  />
                </div>
              </div>

              {/* Guest List */}
              <div className="flex-1 overflow-y-auto p-4 space-y-2">
                {guests.length > 0 ? (
                  guests.map((guest: any) => {
                    const guestOrders = ordersByGuestData?.ordersByGuest?.find(
                      (og: any) => og.guest.id === guest.id
                    );
                    
                    return (
                      <button
                        key={guest.id}
                        onClick={() => setDetailView({ type: 'guest', guestId: guest.id })}
                        className={`w-full p-3 rounded-lg text-left transition-all ${
                          detailView?.type === 'guest' && detailView.guestId === guest.id
                            ? 'bg-indigo-100 dark:bg-indigo-900 border-2 border-indigo-500'
                            : 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-indigo-300'
                        }`}
                      >
                        <div className="flex items-center gap-2 mb-1">
                          <div className="h-8 w-8 rounded-full bg-gradient-to-br from-indigo-500 to-violet-500 flex items-center justify-center text-white text-sm font-bold">
                            {guest.name ? guest.name.charAt(0).toUpperCase() : '#'}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-semibold text-sm truncate">
                              {guest.name || `Convidado ${guest.guestNumber || guest.seatNumber}`}
                            </p>
                            <p className="text-xs text-slate-500">
                              {guestOrders?.orders?.length || 0} pedidos
                            </p>
                          </div>
                        </div>
                        {guestOrders && (
                          <p className="text-xs font-semibold text-indigo-600 dark:text-indigo-400">
                            {parseFloat(guestOrders.subtotal).toLocaleString('pt-AO', { 
                              style: 'currency', 
                              currency: 'AOA',
                              minimumFractionDigits: 0 
                            })}
                          </p>
                        )}
                      </button>
                    );
                  })
                ) : (
                  <div className="text-center py-8 text-slate-500">
                    <p className="text-sm">Nenhuma pessoa na mesa</p>
                  </div>
                )}
              </div>

              {/* Quick Actions */}
              <div className="p-4 border-t bg-white dark:bg-slate-800 space-y-2">
                {table.status === 'livre' ? (
                  <Button 
                    className="w-full bg-gradient-to-r from-blue-600 to-blue-700"
                    onClick={() => setShowStartSession(true)}
                  >
                    🚀 Iniciar Sessão
                  </Button>
                ) : (
                  <>
                    <Button 
                      className="w-full bg-gradient-to-r from-indigo-600 to-indigo-700"
                      disabled={!table.currentSessionId}
                      onClick={() => setShowQuickOrder(true)}
                    >
                      + Novo Pedido <kbd className="ml-2 text-xs opacity-75">N</kbd>
                    </Button>
                    <Button 
                      onClick={() => {
                        onOpenChange(false);
                        setLocation(`/tables/${table.id}/checkout`);
                      }}
                      className="w-full bg-gradient-to-r from-emerald-600 to-emerald-700"
                    >
                      💰 Checkout <kbd className="ml-2 text-xs opacity-75">P</kbd>
                    </Button>
                    <Button
                      onClick={() => setShowAddPerson(true)}
                      variant="outline"
                      className="w-full"
                    >
                      👤 Adicionar Pessoa <kbd className="ml-2 text-xs opacity-75">G</kbd>
                    </Button>
                    <Button 
                      onClick={() => setShowEndSession(true)}
                      variant="destructive"
                      className="w-full"
                    >
                      ⏹ Encerrar Sessão <kbd className="ml-2 text-xs opacity-75">E</kbd>
                    </Button>
                  </>
                )}
              </div>
            </motion.div>

            {/* DETAIL PANEL (Right) */}
            <motion.div
              initial={{ x: 50, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ type: 'spring', stiffness: 200, damping: 20, delay: 0.1 }}
              className="flex-1 overflow-y-auto p-6"
            >
              {detailView?.type === 'guest' && ordersByGuestData && (
                <GuestDetailPanel
                  guest={guests.find((g: any) => g.id === detailView.guestId)}
                  orders={ordersByGuestData.ordersByGuest?.find(
                    (og: any) => og.guest.id === detailView.guestId
                  )?.orders || []}
                  subtotal={ordersByGuestData.ordersByGuest?.find(
                    (og: any) => og.guest.id === detailView.guestId
                  )?.subtotal || '0'}
                  onEditOrder={(order) => setOrderToEdit(order)}
                  onCancelOrder={(order) => setOrderToCancel(order)}
                  onNewOrder={() => setShowQuickOrder(true)}
                />
              )}
              
              {!detailView && (
                <div className="h-full flex items-center justify-center text-slate-400">
                  <div className="text-center">
                    <p className="text-lg">Selecione um convidado</p>
                    <p className="text-sm">para ver os detalhes</p>
                  </div>
                </div>
              )}
            </motion.div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Dialogs */}
      <Dialog open={showStartSession} onOpenChange={setShowStartSession}>
        <DialogContent className="sm:max-w-md">
          <div className="space-y-4">
            <h2 className="text-xl font-bold">Iniciar Sessão</h2>
            <div>
              <label className="block text-sm font-medium mb-2">Número de Pessoas</label>
              <input
                type="number"
                min="1"
                value={numberOfGuests}
                onChange={(e) => setNumberOfGuests(e.target.value)}
                className="w-full px-4 py-2 border rounded-lg"
              />
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setShowStartSession(false)} className="flex-1">
                Cancelar
              </Button>
              <Button
                onClick={() => {
                  mutations.startSessionMutation.mutate(parseInt(numberOfGuests));
                  setShowStartSession(false);
                }}
                className="flex-1"
              >
                Iniciar
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <AddPersonDialog
        open={showAddPerson}
        onOpenChange={setShowAddPerson}
        onAddPerson={handleAddPerson}
        isLoading={mutations.addGuestMutation.isPending}
      />

      <EndSessionDialog
        open={showEndSession}
        onOpenChange={setShowEndSession}
        tableId={table?.id || ''}
        tableNumber={table?.number?.toString() || ''}
        onConfirm={handleEndSession}
        onPayNow={() => {
          setShowEndSession(false);
          setLocation(`/tables/${table.id}/checkout`);
        }}
        isLoading={mutations.endSessionMutation.isPending}
      />

      <QRCodeDialog
        open={showQRCode}
        onOpenChange={setShowQRCode}
        tableId={table?.id || ''}
        tableNumber={table?.number?.toString() || ''}
        restaurantId={table?.restaurantId}
        sessionPin={table?.currentSession?.pin || null}
      />

      {showQuickOrder && (
        <QuickOrderDialog
          open={showQuickOrder}
          onOpenChange={setShowQuickOrder}
          tableId={table.id}
        />
      )}

      {showCheckout && (
        <TableCheckoutDialog
          open={showCheckout}
          onOpenChange={setShowCheckout}
          table={table}
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
    </>
  );
}
