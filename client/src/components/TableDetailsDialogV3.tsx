import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useLocation } from 'wouter';
import { motion, AnimatePresence } from 'framer-motion';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
  Users,
  Clock,
  Receipt,
  CreditCard,
  Plus,
  X,
  ArrowLeft,
  ArrowRight,
  Printer,
  TrendingUp,
  ShoppingBag,
} from 'lucide-react';
import { formatKwanza } from '@/lib/formatters';
import type { Table } from '@shared/schema';
import { AddGuestDialog } from './AddGuestDialog';
import { GuestsList } from './GuestsList';
import { GuestCheckoutDialog } from './GuestCheckoutDialog';

interface TableDetailsDialogV3Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  table: (Table & { orders?: any[] }) | null;
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

export function TableDetailsDialogV3({
  open,
  onOpenChange,
  table,
  allTables = [],
  onNavigate,
}: TableDetailsDialogV3Props) {
  const [, setLocation] = useLocation();
  const queryClient = useQueryClient();
  
  // ✅ Estados para controlar os diálogos
  const [addGuestOpen, setAddGuestOpen] = useState(false);
  const [checkoutGuestId, setCheckoutGuestId] = useState<string | null>(null);

  if (!table) return null;

  const currentIndex = allTables.findIndex(t => t.id === table.id);
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

  // Fetch payments
  const { data: payments = [] } = useQuery<any[]>({
    queryKey: ['/api/tables', table.id, 'payments'],
    enabled: open && !!table.currentSessionId,
  });

  // Fetch guests
  const { data: guests = [] } = useQuery<any[]>({
    queryKey: [`/api/tables/${table.id}/guests`],
    enabled: open && table.status !== 'livre',
  });

  // Calculate totals
  const totalAmount = parseFloat(table.totalAmount || '0');
  const totalPaid = payments.reduce((sum, p) => sum + parseFloat(p.amount || '0'), 0);
  const pending = Math.max(0, totalAmount - totalPaid);
  const paymentPercentage = totalAmount > 0 ? (totalPaid / totalAmount) * 100 : 0;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[95vw] h-[95vh] p-0 flex flex-col overflow-hidden">
        <DialogTitle className="sr-only">Detalhes da Mesa {table.number}</DialogTitle>
        
        {/* HEADER SUPER COMPACTO */}
        <div className="bg-gradient-to-r from-slate-800 to-blue-900 px-3 py-2 border-b flex items-center justify-between">
          <div className="flex items-center gap-3">
            {allTables.length > 1 && onNavigate && (
              <div className="flex items-center gap-1">
                <Button variant="ghost" size="sm" onClick={handlePrevious} disabled={!hasPrevious} className="text-white/70 hover:text-white h-6 w-6 p-0">
                  <ArrowLeft className="h-3 w-3" />
                </Button>
                <span className="text-xs text-white/50">{currentIndex + 1}/{allTables.length}</span>
                <Button variant="ghost" size="sm" onClick={handleNext} disabled={!hasNext} className="text-white/70 hover:text-white h-6 w-6 p-0">
                  <ArrowRight className="h-3 w-3" />
                </Button>
              </div>
            )}
            
            <h1 className="text-xl font-bold text-white flex items-center gap-2">
              MESA {table.number}
              <Badge className="bg-blue-500 text-white border-0 text-xs">{getStatusLabel(table.status)}</Badge>
            </h1>
            
            {table.customerName && (
              <span className="text-sm text-white/60">• {table.customerName}</span>
            )}
            {table.lastActivity && (
              <span className="text-xs text-white/50">• {format(new Date(table.lastActivity), 'HH:mm', { locale: ptBR })}</span>
            )}
          </div>

          <Button variant="ghost" size="sm" onClick={() => onOpenChange(false)} className="text-white/70 hover:text-white h-6 w-6 p-0">
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* DASHBOARD LAYOUT - 3 COLUNAS */}
        <div className="flex-1 overflow-y-auto bg-slate-50 dark:bg-slate-950 p-2">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-2 h-full">
            
            {/* COLUNA 1: FINANCEIRO (4 cols) */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
              className="lg:col-span-4"
            >
              {/* Card Financeiro Principal */}
              <Card className="border border-green-500/30 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20">
                <CardHeader className="pb-2 px-3 pt-3">
                  <CardTitle className="text-xs flex items-center gap-2">
                    <Receipt className="h-3 w-3" />
                    Financeiro
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 px-3 pb-3">
                  {/* Total */}
                  <div>
                    <p className="text-xs text-muted-foreground">Total</p>
                    <p className="text-3xl font-black bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">
                      {formatKwanza(totalAmount)}
                    </p>
                  </div>

                  {/* Progress Bar */}
                  {totalAmount > 0 && (
                    <div className="space-y-2">
                      <div className="relative h-3 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${paymentPercentage}%` }}
                          transition={{ duration: 1 }}
                          className="absolute inset-y-0 left-0 bg-gradient-to-r from-green-500 to-emerald-600 rounded-full"
                        />
                        <div className="absolute inset-0 flex items-center justify-center">
                          <span className="text-xs font-bold text-white drop-shadow">
                            {Math.round(paymentPercentage)}%
                          </span>
                        </div>
                      </div>

                      {/* Stats */}
                      <div className="grid grid-cols-2 gap-2">
                        <div className="p-2 rounded-lg bg-green-100 dark:bg-green-900/30 border border-green-200 dark:border-green-800">
                          <p className="text-xs text-muted-foreground">✅ Pago</p>
                          <p className="text-lg font-bold text-green-600">{formatKwanza(totalPaid)}</p>
                        </div>
                        <div className="p-2 rounded-lg bg-amber-100 dark:bg-amber-900/30 border border-amber-200 dark:border-amber-800">
                          <p className="text-xs text-muted-foreground">⏳ Pendente</p>
                          <p className="text-lg font-bold text-amber-600">{formatKwanza(pending)}</p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Payments List */}
                  {payments.length > 0 && (
                    <>
                      <Separator />
                      <div className="space-y-2">
                        <p className="text-xs font-semibold text-muted-foreground">💳 Pagamentos ({payments.length})</p>
                        <div className="space-y-2 max-h-48 overflow-y-auto">
                          {payments.map((payment) => (
                            <div
                              key={payment.id}
                              className="p-2 rounded-lg bg-white dark:bg-slate-800 border flex items-center justify-between text-sm"
                            >
                              <div>
                                <p className="font-medium">{payment.paymentMethod}</p>
                                <p className="text-xs text-muted-foreground">
                                  {format(new Date(payment.createdAt), "HH:mm", { locale: ptBR })}
                                </p>
                              </div>
                              <p className="font-bold text-green-600">
                                {formatKwanza(parseFloat(payment.amount))}
                              </p>
                            </div>
                          ))}
                        </div>
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>
            </motion.div>

            {/* COLUNA 2: PEDIDOS (5 cols) */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="lg:col-span-5"
            >
              <Card className="border h-full flex flex-col">
                <CardHeader className="pb-2 px-3 pt-3 flex-shrink-0">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-xs flex items-center gap-2">
                      <ShoppingBag className="h-3 w-3" />
                      Pedidos
                      {table.orders && table.orders.length > 0 && (
                        <Badge variant="secondary">{table.orders.length}</Badge>
                      )}
                    </CardTitle>
                    <Button size="sm" variant="outline">
                      <Plus className="h-3 w-3 mr-1" />
                      Novo
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="flex-1 overflow-y-auto px-3 pb-3">
                  {table.orders && table.orders.length > 0 ? (
                    <div className="space-y-1.5">
                      {table.orders.map((order: any) => (
                        <div
                          key={order.id}
                          className="p-2 border rounded-lg hover:border-blue-500 transition-colors cursor-pointer"
                        >
                          <div className="flex items-center justify-between mb-1">
                            <div className="flex items-center gap-2">
                              <Badge variant="secondary" className="text-xs px-1.5 py-0">
                                #{order.orderNumber || 'N/A'}
                              </Badge>
                              <span className="text-xs text-muted-foreground">
                                {format(new Date(order.createdAt), 'HH:mm', { locale: ptBR })}
                              </span>
                            </div>
                            <span className="font-bold text-sm">
                              {formatKwanza(parseFloat(order.totalAmount || '0'))}
                            </span>
                          </div>
                          {order.orderItems && order.orderItems.length > 0 && (
                            <p className="text-sm text-muted-foreground">
                              {order.orderItems.slice(0, 3).map((item: any) => 
                                `${item.quantity}x ${item.menuItem?.name || 'Item'}`
                              ).join(' • ')}
                              {order.orderItems.length > 3 && ` +${order.orderItems.length - 3} mais`}
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center h-full text-center py-12">
                      <ShoppingBag className="h-12 w-12 text-muted-foreground/50 mb-3" />
                      <p className="text-sm text-muted-foreground">Nenhum pedido ainda</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>

            {/* COLUNA 3: CONVIDADOS + TIMELINE (3 cols) */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
              className="lg:col-span-3 space-y-2"
            >
              {/* ✅ NOVO: GuestsList Component */}
              <GuestsList
                guests={guests}
                tableId={table.id}
                onAddGuest={() => setAddGuestOpen(true)}
                onCheckoutGuest={(guestId) => setCheckoutGuestId(guestId)}
              />

              {/* Timeline */}
              <Card className="border">
                <CardHeader className="pb-2 px-3 pt-3">
                  <CardTitle className="text-xs flex items-center gap-2">
                    <Clock className="h-3 w-3" />
                    Timeline
                  </CardTitle>
                </CardHeader>
                <CardContent className="px-3 pb-3">
                  <div className="space-y-2">
                    {/* Session start */}
                    <div className="flex gap-2">
                      <div className="flex flex-col items-center">
                        <div className="w-2 h-2 rounded-full bg-blue-500" />
                        <div className="w-0.5 flex-1 bg-blue-200 dark:bg-blue-800 min-h-[20px]" />
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">
                          {table.lastActivity && format(new Date(table.lastActivity), "HH:mm", { locale: ptBR })}
                        </p>
                        <p className="text-sm font-medium">Sessão iniciada</p>
                      </div>
                    </div>
                    
                    {/* Payments */}
                    {payments.map((payment, i) => (
                      <div key={payment.id} className="flex gap-2">
                        <div className="flex flex-col items-center">
                          <div className="w-2 h-2 rounded-full bg-green-500" />
                          {i < payments.length - 1 && (
                            <div className="w-0.5 flex-1 bg-green-200 dark:bg-green-800 min-h-[20px]" />
                          )}
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">
                            {format(new Date(payment.createdAt), "HH:mm", { locale: ptBR })}
                          </p>
                          <p className="text-sm font-medium">
                            Pgto {formatKwanza(parseFloat(payment.amount))}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>

        {/* FOOTER FIXO - AÇÕES */}
        <div className="border-t bg-white dark:bg-slate-900 p-2 flex-shrink-0">
          <div className="grid grid-cols-2 gap-2">
            <Button
              variant="outline"
              className="h-12 border-2 border-dashed border-blue-500 hover:bg-blue-50 justify-start"
            >
              <Plus className="h-4 w-4 mr-2" />
              <div className="text-left">
                <div className="font-bold text-sm">NOVO PEDIDO</div>
                <div className="text-xs text-muted-foreground">Adicionar itens</div>
              </div>
            </Button>
            <Button
              onClick={() => {
                setLocation(`/tables/${table.id}/checkout`);
                onOpenChange(false);
              }}
              className="h-12 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 justify-start"
            >
              <CreditCard className="h-4 w-4 mr-2" />
              <div className="text-left">
                <div className="font-bold text-sm">CHECKOUT</div>
                <div className="text-xs opacity-90">
                  {pending > 0 ? `${formatKwanza(pending)} pendente` : 'Finalizar'}
                </div>
              </div>
            </Button>
          </div>
        </div>
      </DialogContent>

      {/* ✅ NOVO: Diálogos de Gestão de Guests */}
      <AddGuestDialog
        open={addGuestOpen}
        onOpenChange={setAddGuestOpen}
        tableId={table.id}
        sessionId={table.currentSessionId || ''}
      />

      {checkoutGuestId && (
        <GuestCheckoutDialog
          open={!!checkoutGuestId}
          onOpenChange={(open) => !open && setCheckoutGuestId(null)}
          guest={guests.find((g: any) => g.id === checkoutGuestId)!}
          tableId={table.id}
          sessionId={table.currentSessionId || ''}
        />
      )}
    </Dialog>
  );
}
