import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLocation } from 'wouter';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { useTableData } from './hooks/useTableData';
import { useTableMutations } from './hooks/useTableMutations';
import { GuestDetailPanel } from './panels/GuestDetailPanel';
import { PaymentPanel } from './panels/PaymentPanel';
import { CancelOrderDialog } from './dialogs/CancelOrderDialog';
import { EditOrderDialog } from './dialogs/EditOrderDialog';
import { MoveItemDialog } from './dialogs/MoveItemDialog';
import { AddGuestDialog } from '@/components/AddGuestDialog';
import { QuickOrderDialog } from '@/components/QuickOrderDialog';
import { useToast } from '@/hooks/use-toast';
import type { Table } from '@shared/schema';

interface TableDialogSplitPanelProps {
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

export function TableDialogSplitPanel({
  open,
  onOpenChange,
  table,
  allTables = [],
  onNavigate,
}: TableDialogSplitPanelProps) {
  const [, setLocation] = useLocation();
  const [detailView, setDetailView] = useState<DetailView>(null);
  const [showMobileDetail, setShowMobileDetail] = useState(false);
  const { toast } = useToast();
  
  // Dialog states
  const [orderToCancel, setOrderToCancel] = useState<any>(null);
  const [orderToEdit, setOrderToEdit] = useState<any>(null);
  const [itemToMove, setItemToMove] = useState<any>(null);
  const [showAddGuest, setShowAddGuest] = useState(false);
  const [showQuickOrder, setShowQuickOrder] = useState(false);
  const [showStartSession, setShowStartSession] = useState(false);
  const [numberOfGuests, setNumberOfGuests] = useState<string>('1');

  // Hooks
  const {
    tableData,
    ordersByGuestData,
    guests,
    tableOrders,
    totalAmount,
    totalOrders,
    activeGuests,
    isLoading,
  } = useTableData({ tableId: table?.id, isOpen: open });

  const mutations = useTableMutations({ tableId: table?.id });

  if (!table) return null;

  // ✅ Use tableData from useTableData (always fresh) instead of props
  // This ensures UI updates immediately after startSession/endSession
  const currentTable = tableData || table;
  
  // ✅ IMPORTANTE: Se há convidados, DEVE haver sessão ativa
  // (pois agora criamos sessão automaticamente ao adicionar primeiro convidado)
  const hasActiveSession = !!currentTable.currentSessionId || guests.length > 0;
  
  console.log('🔍 [TableDialog] Session check:', {
    propTableSessionId: table.currentSessionId,
    freshTableSessionId: tableData?.currentSessionId,
    guestsCount: guests.length,
    hasActiveSession,
    totalOrders,
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl w-[92vw] h-[80vh] p-0 gap-0 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b bg-gradient-to-r from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
          <div>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
              Mesa {table.number}
            </h2>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              {!hasActiveSession ? 'Sessão não iniciada' : `${activeGuests} pessoas • ${totalOrders} pedidos`}
            </p>
          </div>
          <div className="text-right">
            <p className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-violet-600 bg-clip-text text-transparent">
              {totalAmount.toLocaleString('pt-AO', { style: 'currency', currency: 'AOA' })}
            </p>
            <p className="text-xs text-slate-500">Total da mesa</p>
          </div>
        </div>

        {/* Split Panel Layout */}
        <div className="flex h-[calc(80vh-80px)] overflow-hidden">
          {/* MASTER PANEL (Left) */}
          <motion.div
            initial={{ x: -50, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ type: 'spring', stiffness: 200, damping: 20 }}
            className={`
              w-72 lg:w-80 border-r bg-slate-50 dark:bg-slate-900 flex flex-col
              transition-all duration-300
              ${showMobileDetail ? 'max-lg:hidden' : ''}
            `}
          >
            <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-thin scrollbar-thumb-slate-300 dark:scrollbar-thumb-slate-700">
              {/* Pessoas Section */}
              <div>
                <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3 flex items-center gap-2">
                  👥 Pessoas ({guests.length})
                </h3>
                
                {guests.length > 0 ? (
                  <div className="space-y-2">
                    <AnimatePresence mode="popLayout">
                      {ordersByGuestData?.ordersByGuest?.map(({ guest, orders, subtotal }: any, index: number) => (
                        <motion.button
                          layout
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: -20 }}
                          transition={{ delay: index * 0.05 }}
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                        key={guest.id}
                        onClick={() => {
                          setDetailView({ type: 'guest', guestId: guest.id });
                          setShowMobileDetail(true);
                        }}
                        className={`
                          w-full p-3 rounded-lg text-left transition-all
                          ${detailView?.type === 'guest' && detailView.guestId === guest.id
                            ? 'bg-indigo-100 dark:bg-indigo-900 border-2 border-indigo-500'
                            : 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-indigo-300'
                          }
                        `}
                      >
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-full bg-gradient-to-br from-indigo-500 to-violet-500 flex items-center justify-center text-white font-bold">
                            {guest.name ? guest.name.charAt(0).toUpperCase() : '#'}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-semibold text-slate-900 dark:text-white truncate">
                              {guest.name || `Convidado ${guest.guestNumber || guest.seatNumber}`}
                            </p>
                            <p className="text-xs text-slate-500">
                              {orders.length} {orders.length === 1 ? 'pedido' : 'pedidos'}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="font-bold text-indigo-600 dark:text-indigo-400">
                              {parseFloat(subtotal).toLocaleString('pt-AO', { style: 'currency', currency: 'AOA', minimumFractionDigits: 0 })}
                            </p>
                          </div>
                        </div>
                      </motion.button>
                    ))}
                    </AnimatePresence>
                  </div>
                ) : (
                  <p className="text-sm text-slate-500 text-center py-4">
                    Nenhuma pessoa na mesa
                  </p>
                )}

                <button
                  className="w-full mt-3 p-2 border-2 border-dashed border-slate-300 dark:border-slate-600 rounded-lg text-sm font-medium text-slate-600 dark:text-slate-400 hover:border-indigo-500 hover:text-indigo-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={!hasActiveSession}
                  onClick={() => {
                    // Validar se há sessão ativa
                    if (!hasActiveSession) {
                      toast({
                        title: 'Sessão não iniciada',
                        description: 'Por favor, inicie uma sessão primeiro para adicionar pessoas.',
                        variant: 'destructive',
                      });
                      return;
                    }
                    
                    setShowAddGuest(true);
                  }}
                >
                  + Adicionar Pessoa
                </button>
              </div>

              {/* Resumo */}
              <div className="pt-4 border-t">
                <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3">
                  📊 Resumo
                </h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-slate-600 dark:text-slate-400">Pedidos</span>
                    <span className="font-semibold">{totalOrders}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600 dark:text-slate-400">Pessoas</span>
                    <span className="font-semibold">{activeGuests}</span>
                  </div>
                  <div className="flex justify-between text-base font-bold pt-2 border-t">
                    <span>Total</span>
                    <span className="text-indigo-600 dark:text-indigo-400">
                      {totalAmount.toLocaleString('pt-AO', { style: 'currency', currency: 'AOA', minimumFractionDigits: 0 })}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Actions (Bottom) */}
            <div className="p-4 border-t bg-white dark:bg-slate-800 space-y-2">
              {!hasActiveSession ? (
                // Botão para iniciar sessão quando mesa está livre
                <button 
                  className="w-full p-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg font-semibold hover:from-blue-700 hover:to-blue-800 transition-all"
                  onClick={() => setShowStartSession(true)}
                >
                  🚀 Iniciar Sessão
                </button>
              ) : (
                // Botões quando mesa está ocupada
                <>
                  <button 
                    className="w-full p-3 bg-gradient-to-r from-indigo-600 to-indigo-700 text-white rounded-lg font-semibold hover:from-indigo-700 hover:to-indigo-800 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    disabled={!hasActiveSession}
                    onClick={() => {
                      if (!hasActiveSession) {
                        toast({
                          title: 'Sessão não iniciada',
                          description: 'Por favor, inicie uma sessão primeiro para fazer pedidos.',
                          variant: 'destructive',
                        });
                        return;
                      }
                      setShowQuickOrder(true);
                    }}
                  >
                    + Novo Pedido
                  </button>
                  <button 
                    onClick={() => {
                      onOpenChange(false);
                      setLocation(`/tables/${table.id}/checkout`);
                    }}
                    className="w-full p-3 bg-gradient-to-r from-emerald-600 to-emerald-700 text-white rounded-lg font-semibold hover:from-emerald-700 hover:to-emerald-800 transition-all"
                  >
                    💰 Checkout
                  </button>
                  <button 
                    onClick={() => {
                      if (window.confirm('Tem certeza que deseja encerrar esta sessão? Certifique-se de que todos os pagamentos foram realizados.')) {
                        mutations.endSessionMutation.mutate();
                      }
                    }}
                    disabled={mutations.endSessionMutation.isPending}
                    className="w-full p-3 bg-gradient-to-r from-red-600 to-red-700 text-white rounded-lg font-semibold hover:from-red-700 hover:to-red-800 transition-all disabled:opacity-50"
                  >
                    🔒 Encerrar Sessão
                  </button>
                </>
              )}
            </div>
          </motion.div>

          {/* DETAIL PANEL (Right) */}
          <div 
            className={`
              flex-1 bg-white dark:bg-slate-800 overflow-y-auto scrollbar-thin scrollbar-thumb-slate-300 dark:scrollbar-thumb-slate-700
              ${!showMobileDetail ? 'max-lg:hidden' : ''}
            `}
          >
            {detailView ? (
              <div className="p-6">
                {/* Mobile back button */}
                <button
                  onClick={() => setShowMobileDetail(false)}
                  className="lg:hidden mb-4 text-sm text-slate-600 hover:text-slate-900"
                >
                  ← Voltar
                </button>

                {/* Detail Content */}
                {detailView.type === 'guest' && (() => {
                  const guestData = ordersByGuestData?.ordersByGuest?.find(
                    (og: any) => og.guest.id === detailView.guestId
                  );
                  
                  if (!guestData) return <p>Guest não encontrado</p>;
                  
                  return (
                    <GuestDetailPanel
                      guest={guestData.guest}
                      orders={guestData.orders}
                      subtotal={guestData.subtotal}
                      onEditOrder={(order) => setOrderToEdit(order)}
                      onCancelOrder={(order) => setOrderToCancel(order)}
                      onNewOrder={() => setShowQuickOrder(true)}
                    />
                  );
                })()}

                {detailView.type === 'payment' && ordersByGuestData?.ordersByGuest && (
                  <PaymentPanel
                    ordersByGuest={ordersByGuestData.ordersByGuest}
                    totalAmount={totalAmount}
                    onCheckout={() => {
                      onOpenChange(false);
                      setLocation(`/tables/${table.id}/checkout`);
                    }}
                  />
                )}
              </div>
            ) : (
              <div className="h-full flex items-center justify-center text-slate-400">
                <div className="text-center">
                  <p className="text-lg font-semibold mb-2">Selecione uma pessoa</p>
                  <p className="text-sm">ou clique em Checkout para pagar</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </DialogContent>

      {/* Dialogs */}
      <CancelOrderDialog
        open={!!orderToCancel}
        onOpenChange={(open) => !open && setOrderToCancel(null)}
        order={orderToCancel}
        onConfirm={() => {
          if (orderToCancel) {
            mutations.cancelOrderMutation.mutate(orderToCancel.id);
            setOrderToCancel(null);
          }
        }}
        isPending={mutations.cancelOrderMutation.isPending}
      />

      <EditOrderDialog
        open={!!orderToEdit}
        onOpenChange={(open) => !open && setOrderToEdit(null)}
        order={orderToEdit}
        guests={guests}
        onUpdateQuantity={(itemId, quantity) => {
          mutations.updateOrderItemMutation.mutate({ itemId, quantity });
        }}
        onRemoveItem={(itemId) => {
          mutations.removeOrderItemMutation.mutate(itemId);
        }}
        onMoveItem={(item) => setItemToMove(item)}
        isPending={mutations.updateOrderItemMutation.isPending || mutations.removeOrderItemMutation.isPending}
      />

      <MoveItemDialog
        open={!!itemToMove}
        onOpenChange={(open) => !open && setItemToMove(null)}
        item={itemToMove}
        guests={guests}
        onMove={(targetGuestId) => {
          if (itemToMove) {
            mutations.moveItemMutation.mutate({
              itemId: itemToMove.id,
              targetGuestId,
            });
            setItemToMove(null);
          }
        }}
        isPending={mutations.moveItemMutation.isPending}
      />

      {/* Add Guest Dialog */}
      <AddGuestDialog
        open={showAddGuest}
        onOpenChange={setShowAddGuest}
        tableId={table?.id || ''}
        sessionId={currentTable?.currentSessionId || ''}
      />

      {/* Quick Order Dialog */}
      <QuickOrderDialog
        open={showQuickOrder}
        onOpenChange={setShowQuickOrder}
        tableId={table?.id || ''}
        tableNumber={table?.number ?? 0}
      />

      {/* Start Session Dialog */}
      <Dialog open={showStartSession} onOpenChange={setShowStartSession}>
        <DialogContent className="sm:max-w-md">
          <div className="space-y-4">
            <div>
              <h2 className="text-xl font-bold">Iniciar Sessão</h2>
              <p className="text-sm text-slate-500 mt-1">
                Quantas pessoas vão usar a mesa {table?.number}?
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">
                Número de Pessoas
              </label>
              <input
                type="number"
                min="1"
                value={numberOfGuests}
                onChange={(e) => setNumberOfGuests(e.target.value)}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
                placeholder="Digite o número de pessoas"
              />
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setShowStartSession(false)}
                className="flex-1 px-4 py-2 border rounded-lg hover:bg-slate-50"
              >
                Cancelar
              </button>
              <button
                onClick={() => {
                  const guests = parseInt(numberOfGuests);
                  if (guests > 0) {
                    mutations.startSessionMutation.mutate(guests);
                    setShowStartSession(false);
                    setNumberOfGuests('1');
                  }
                }}
                disabled={mutations.startSessionMutation.isPending || parseInt(numberOfGuests) < 1}
                className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50"
              >
                {mutations.startSessionMutation.isPending ? 'Iniciando...' : 'Iniciar'}
              </button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </Dialog>
  );
}
