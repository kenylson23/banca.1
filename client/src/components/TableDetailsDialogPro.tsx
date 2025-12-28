import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useLocation } from 'wouter';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
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
  Package,
  DollarSign,
} from 'lucide-react';
import { formatKwanza } from '@/lib/formatters';
import type { Table } from '@shared/schema';

interface TableDetailsDialogProProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  table: (Table & { orders?: any[] }) | null;
  allTables?: Table[];
  onNavigate?: (table: Table) => void;
}

const getStatusColor = (status: string) => {
  const colors: Record<string, string> = {
    livre: 'bg-slate-100 text-slate-700 border-slate-200',
    ocupada: 'bg-blue-50 text-blue-700 border-blue-200',
    em_andamento: 'bg-amber-50 text-amber-700 border-amber-200',
    aguardando_pagamento: 'bg-orange-50 text-orange-700 border-orange-200',
  };
  return colors[status] || 'bg-slate-100 text-slate-700 border-slate-200';
};

const getStatusLabel = (status: string) => {
  const labels: Record<string, string> = {
    livre: 'Disponível',
    ocupada: 'Ocupada',
    em_andamento: 'Em Andamento',
    aguardando_pagamento: 'Aguardando Pagamento',
  };
  return labels[status] || status;
};

export function TableDetailsDialogPro({
  open,
  onOpenChange,
  table,
  allTables = [],
  onNavigate,
}: TableDetailsDialogProProps) {
  const [, setLocation] = useLocation();

  if (!table) return null;

  const currentIndex = allTables.findIndex(t => t.id === table.id);
  const hasPrevious = currentIndex > 0;
  const hasNext = currentIndex < allTables.length - 1;

  const handlePrevious = () => {
    if (hasPrevious && onNavigate) onNavigate(allTables[currentIndex - 1]);
  };

  const handleNext = () => {
    if (hasNext && onNavigate) onNavigate(allTables[currentIndex + 1]);
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
      <DialogContent className="max-w-[90vw] h-[90vh] p-0 flex flex-col bg-white dark:bg-slate-950">
        <DialogTitle className="sr-only">Mesa {table.number}</DialogTitle>
        
        {/* HEADER - Estilo Stripe */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-4">
            {/* Navigation */}
            {allTables.length > 1 && onNavigate && (
              <div className="flex items-center gap-1 text-sm text-slate-500">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handlePrevious}
                  disabled={!hasPrevious}
                  className="h-7 w-7 p-0"
                >
                  <ArrowLeft className="h-4 w-4" />
                </Button>
                <span className="px-2 tabular-nums">{currentIndex + 1} / {allTables.length}</span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleNext}
                  disabled={!hasNext}
                  className="h-7 w-7 p-0"
                >
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </div>
            )}
            
            {/* Title */}
            <div>
              <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                Mesa {table.number}
              </h2>
              <div className="flex items-center gap-3 mt-1 text-sm text-slate-600 dark:text-slate-400">
                {table.customerName && (
                  <span className="flex items-center gap-1.5">
                    <Users className="h-3.5 w-3.5" />
                    {table.customerName}
                  </span>
                )}
                {table.lastActivity && (
                  <span className="flex items-center gap-1.5">
                    <Clock className="h-3.5 w-3.5" />
                    {format(new Date(table.lastActivity), 'HH:mm', { locale: ptBR })}
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Badge className={`border ${getStatusColor(table.status)}`} variant="outline">
              {getStatusLabel(table.status)}
            </Badge>
            <Button variant="ghost" size="sm" onClick={() => onOpenChange(false)} className="h-8 w-8 p-0">
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* CONTENT - Grid Limpo */}
        <div className="flex-1 overflow-y-auto bg-slate-50 dark:bg-slate-900 p-6">
          <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-12 gap-6">
              
              {/* LEFT: Resumo Financeiro (4 cols) */}
              <div className="col-span-12 lg:col-span-4 space-y-6">
                
                {/* Total Card */}
                <div className="bg-white dark:bg-slate-950 rounded-lg border border-slate-200 dark:border-slate-800 p-6 shadow-sm">
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-sm font-medium text-slate-600 dark:text-slate-400">Total da Conta</span>
                    <Receipt className="h-4 w-4 text-slate-400" />
                  </div>
                  <div className="text-4xl font-bold text-slate-900 dark:text-slate-100 tabular-nums mb-6">
                    {formatKwanza(totalAmount)}
                  </div>
                  
                  {totalAmount > 0 && (
                    <>
                      {/* Progress */}
                      <div className="space-y-2 mb-4">
                        <div className="flex items-center justify-between text-xs text-slate-600 dark:text-slate-400">
                          <span>Progresso do Pagamento</span>
                          <span className="font-medium tabular-nums">{Math.round(paymentPercentage)}%</span>
                        </div>
                        <div className="h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-blue-600 rounded-full transition-all duration-700"
                            style={{ width: `${paymentPercentage}%` }}
                          />
                        </div>
                      </div>

                      <Separator className="my-4" />

                      {/* Stats */}
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <div className="text-xs text-slate-600 dark:text-slate-400 mb-1">Pago</div>
                          <div className="text-lg font-semibold text-green-600 tabular-nums">
                            {formatKwanza(totalPaid)}
                          </div>
                        </div>
                        <div>
                          <div className="text-xs text-slate-600 dark:text-slate-400 mb-1">Pendente</div>
                          <div className="text-lg font-semibold text-amber-600 tabular-nums">
                            {formatKwanza(pending)}
                          </div>
                        </div>
                      </div>
                    </>
                  )}
                </div>

                {/* Payments List */}
                {payments.length > 0 && (
                  <div className="bg-white dark:bg-slate-950 rounded-lg border border-slate-200 dark:border-slate-800 p-4 shadow-sm">
                    <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100 mb-3">
                      Pagamentos ({payments.length})
                    </h3>
                    <div className="space-y-2">
                      {payments.map((payment) => (
                        <div
                          key={payment.id}
                          className="flex items-center justify-between p-3 rounded-md border border-slate-100 dark:border-slate-800 hover:border-slate-200 dark:hover:border-slate-700 transition-colors"
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-md bg-green-50 dark:bg-green-950/30 flex items-center justify-center">
                              <CreditCard className="h-4 w-4 text-green-600" />
                            </div>
                            <div>
                              <div className="text-sm font-medium text-slate-900 dark:text-slate-100">
                                {payment.paymentMethod}
                              </div>
                              <div className="text-xs text-slate-500">
                                {format(new Date(payment.createdAt), "HH:mm", { locale: ptBR })}
                              </div>
                            </div>
                          </div>
                          <div className="text-sm font-semibold text-slate-900 dark:text-slate-100 tabular-nums">
                            {formatKwanza(parseFloat(payment.amount))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* CENTER: Pedidos (6 cols) */}
              <div className="col-span-12 lg:col-span-6">
                <div className="bg-white dark:bg-slate-950 rounded-lg border border-slate-200 dark:border-slate-800 shadow-sm">
                  <div className="flex items-center justify-between px-4 py-3 border-b border-slate-200 dark:border-slate-800">
                    <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                      <Package className="h-4 w-4" />
                      Pedidos
                      {table.orders && table.orders.length > 0 && (
                        <Badge variant="secondary" className="ml-1">{table.orders.length}</Badge>
                      )}
                    </h3>
                    <Button size="sm" variant="outline" className="h-8 gap-1.5">
                      <Plus className="h-3.5 w-3.5" />
                      <span className="text-xs">Novo Pedido</span>
                    </Button>
                  </div>
                  
                  <div className="p-4">
                    {table.orders && table.orders.length > 0 ? (
                      <div className="space-y-2">
                        {table.orders.map((order: any) => (
                          <div
                            key={order.id}
                            className="group p-3 rounded-md border border-slate-200 dark:border-slate-800 hover:border-blue-300 dark:hover:border-blue-700 hover:shadow-sm transition-all cursor-pointer"
                          >
                            <div className="flex items-center justify-between mb-2">
                              <div className="flex items-center gap-2">
                                <Badge variant="secondary" className="font-mono text-xs">
                                  #{order.orderNumber || 'N/A'}
                                </Badge>
                                <span className="text-xs text-slate-500">
                                  {format(new Date(order.createdAt), 'HH:mm', { locale: ptBR })}
                                </span>
                              </div>
                              <span className="text-sm font-semibold text-slate-900 dark:text-slate-100 tabular-nums">
                                {formatKwanza(parseFloat(order.totalAmount || '0'))}
                              </span>
                            </div>
                            {order.orderItems && order.orderItems.length > 0 && (
                              <p className="text-sm text-slate-600 dark:text-slate-400">
                                {order.orderItems.slice(0, 3).map((item: any) => 
                                  `${item.quantity}× ${item.menuItem?.name || 'Item'}`
                                ).join(' • ')}
                                {order.orderItems.length > 3 && ` +${order.orderItems.length - 3}`}
                              </p>
                            )}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="flex flex-col items-center justify-center py-12 text-center">
                        <div className="w-12 h-12 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center mb-3">
                          <Package className="h-6 w-6 text-slate-400" />
                        </div>
                        <p className="text-sm font-medium text-slate-900 dark:text-slate-100 mb-1">
                          Nenhum pedido
                        </p>
                        <p className="text-sm text-slate-500">
                          Adicione o primeiro pedido desta mesa
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* RIGHT: Sidebar (2 cols) */}
              <div className="col-span-12 lg:col-span-2 space-y-4">
                
                {/* Pessoas */}
                <div className="bg-white dark:bg-slate-950 rounded-lg border border-slate-200 dark:border-slate-800 p-4 shadow-sm">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                      Pessoas
                    </h3>
                    <span className="text-xs text-slate-500 font-medium">{guests.length}</span>
                  </div>
                  
                  {guests.length > 0 ? (
                    <div className="space-y-2">
                      {guests.slice(0, 6).map((guest: any, i: number) => (
                        <div key={guest.id} className="flex items-center gap-2">
                          <div className="w-6 h-6 rounded-full bg-blue-100 dark:bg-blue-950/30 flex items-center justify-center text-xs font-medium text-blue-700 dark:text-blue-400">
                            {i + 1}
                          </div>
                          <span className="text-sm text-slate-700 dark:text-slate-300 truncate">
                            {guest.name || `Convidado ${i + 1}`}
                          </span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-slate-500 text-center py-4">
                      Sem convidados
                    </p>
                  )}
                </div>

                {/* Timeline */}
                <div className="bg-white dark:bg-slate-950 rounded-lg border border-slate-200 dark:border-slate-800 p-4 shadow-sm">
                  <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100 mb-3">
                    Atividade
                  </h3>
                  <div className="space-y-3">
                    {table.lastActivity && (
                      <div className="flex gap-2 text-sm">
                        <div className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-1.5 flex-shrink-0" />
                        <div>
                          <div className="text-xs text-slate-500">
                            {format(new Date(table.lastActivity), "HH:mm", { locale: ptBR })}
                          </div>
                          <div className="text-sm text-slate-700 dark:text-slate-300">
                            Sessão iniciada
                          </div>
                        </div>
                      </div>
                    )}
                    {payments.map((payment) => (
                      <div key={payment.id} className="flex gap-2 text-sm">
                        <div className="w-1.5 h-1.5 rounded-full bg-green-500 mt-1.5 flex-shrink-0" />
                        <div>
                          <div className="text-xs text-slate-500">
                            {format(new Date(payment.createdAt), "HH:mm", { locale: ptBR })}
                          </div>
                          <div className="text-sm text-slate-700 dark:text-slate-300">
                            Pagamento {formatKwanza(parseFloat(payment.amount))}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* FOOTER - Ações */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950">
          <div className="text-sm text-slate-600 dark:text-slate-400">
            {pending > 0 ? (
              <span className="font-medium">{formatKwanza(pending)} pendente</span>
            ) : (
              <span>Conta paga</span>
            )}
          </div>
          
          <div className="flex items-center gap-3">
            <Button variant="outline" className="gap-2">
              <Plus className="h-4 w-4" />
              Novo Pedido
            </Button>
            <Button
              onClick={() => {
                setLocation(`/tables/${table.id}/checkout`);
                onOpenChange(false);
              }}
              className="gap-2 bg-blue-600 hover:bg-blue-700"
            >
              <CreditCard className="h-4 w-4" />
              Checkout
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
/* FORCE UPDATE 1766921321 */
