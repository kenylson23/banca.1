/**
 * OverviewSection - Visão Geral da Mesa
 * Mostra KPIs, resumo e estatísticas principais
 */

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { 
  Users, 
  ShoppingCart, 
  Clock, 
  TrendingUp, 
  DollarSign,
  CheckCircle2,
  AlertCircle,
  Play,
  Utensils
} from 'lucide-react';
import { formatKwanza } from '@/lib/formatters';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import type { Table } from '@shared/schema';

interface OverviewSectionProps {
  table: Table;
  guestsCount: number;
  ordersCount: number;
  totalAmount: number;
  sessionDuration: string;
  ordersByGuest: any[];
  onStartSession?: () => void;
}

const statusConfig = {
  livre: { label: 'Livre', color: 'bg-gray-500', textColor: 'text-gray-500' },
  ocupada: { label: 'Ocupada', color: 'bg-blue-500', textColor: 'text-blue-500' },
  em_andamento: { label: 'Em Andamento', color: 'bg-amber-500', textColor: 'text-amber-500' },
  aguardando_pagamento: { label: 'Aguardando Pagamento', color: 'bg-orange-500', textColor: 'text-orange-500' },
  encerrada: { label: 'Encerrada', color: 'bg-green-500', textColor: 'text-green-500' },
};

export function OverviewSection({
  table,
  guestsCount,
  ordersCount,
  totalAmount,
  sessionDuration,
  ordersByGuest,
  onStartSession,
}: OverviewSectionProps) {
  const status = table.status as keyof typeof statusConfig;
  const statusInfo = statusConfig[status] || statusConfig.livre;
  
  const avgPerGuest = guestsCount > 0 ? totalAmount / guestsCount : 0;
  
  // Calcular estatísticas dos pedidos
  const pendingOrders = ordersByGuest?.flatMap(og => og.orders || []).filter((o: any) => o.status === 'pendente').length || 0;
  const preparingOrders = ordersByGuest?.flatMap(og => og.orders || []).filter((o: any) => o.status === 'em_preparo').length || 0;
  const completedOrders = ordersByGuest?.flatMap(og => og.orders || []).filter((o: any) => o.status === 'pronto' || o.status === 'servido').length || 0;

  // Calcular total real somando todos os pedidos (incluindo Mesa Completa)
  const sumOfSubtotals = ordersByGuest?.reduce((sum, og) => sum + parseFloat(og.subtotal || '0'), 0) || 0;
  const realTotalAmount = Math.max(totalAmount || 0, sumOfSubtotals);
  const realPaidAmount = ordersByGuest?.reduce((sum, og) => sum + parseFloat(og.guest?.paidAmount || '0'), 0) || 0;
  const realOrdersCount = ordersByGuest?.reduce((sum, og) => sum + (og.orders?.length || 0), 0) || 0;

  return (
    <div className="w-full min-w-0 space-y-4 sm:space-y-6">
      {/* Header Card - Mesa Info */}
      <Card className="min-w-0 border-2 border-primary/20 bg-gradient-to-br from-primary/5 to-transparent">
        <CardHeader className="p-3 sm:p-6">
          <div className="flex min-w-0 flex-wrap items-start justify-between gap-2 sm:gap-3">
            <div className="min-w-0">
              <CardTitle className="text-xl font-bold sm:text-3xl">
                Mesa {table.number}
              </CardTitle>
              <div className="mt-2 flex flex-wrap items-center gap-2">
                <Badge className={cn("font-semibold", statusInfo.color, "text-white")}>
                  {statusInfo.label}
                </Badge>
                {table.area && (
                  <Badge variant="outline">{table.area}</Badge>
                )}
                {table.capacity && (
                  <Badge variant="outline">
                    <Users className="w-3 h-3 mr-1" />
                    Capacidade: {table.capacity}
                  </Badge>
                )}
              </div>
            </div>
            {table.status !== 'livre' && (
              <div className="text-right">
                <div className="text-sm text-muted-foreground">Pendente</div>
                <div className={cn(
                  "min-w-0 break-words text-xl font-bold flex items-center gap-2 sm:text-2xl",
                  realTotalAmount - realPaidAmount > 0 ? "text-orange-600" : "text-green-600"
                )}>
                  <DollarSign className="h-4 w-4 shrink-0 sm:h-5 sm:w-5" />
                  {formatKwanza(Math.max(0, realTotalAmount - realPaidAmount))}
                </div>
              </div>
            )}
          </div>
        </CardHeader>
      </Card>

      {table.status === 'livre' ? (
        /* Empty State - Mesa Livre */
        <Card className="w-full min-w-0">
          <CardContent className="w-full min-w-0 px-3 py-6 text-center sm:px-6 sm:py-12">
            <div className="flex w-full min-w-0 flex-col items-center gap-3 sm:gap-4">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 sm:h-24 sm:w-24">
                <Play className="h-8 w-8 text-primary sm:h-12 sm:w-12" />
              </div>
              <div className="w-full min-w-0 max-w-md">
                <h3 className="mb-1.5 text-lg font-bold sm:mb-2 sm:text-xl">Mesa Disponível</h3>
                <p className="mx-auto mb-3 w-full max-w-md text-sm text-muted-foreground sm:mb-4 sm:text-base">
                  Esta mesa está livre e pronta para receber clientes. Inicie uma sessão para começar a criar pedidos.
                </p>
                <Button 
                  size="lg" 
                  onClick={onStartSession}
                  className="h-11 w-full gap-2 sm:h-10 sm:w-auto"
                >
                  <Play className="w-5 h-5" />
                  Iniciar Sessão
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      ) : (
        <>
          {/* KPI Cards Grid */}
          <div className="grid min-w-0 grid-cols-2 gap-2 sm:gap-4 lg:grid-cols-4">
            {/* Total da Mesa */}
            <Card className="min-w-0 border-2 border-green-500/20 bg-gradient-to-br from-green-500/5 to-transparent">
              <CardHeader className="p-3 pb-1 sm:p-6 sm:pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-xs font-medium text-muted-foreground sm:text-sm">
                    Total da Mesa
                  </CardTitle>
                  <DollarSign className="w-4 h-4 text-green-600" />
                </div>
              </CardHeader>
              <CardContent className="min-w-0 p-3 pt-0 sm:p-6 sm:pt-0">
                <div className="min-w-0 break-words text-xl font-bold text-green-600 sm:text-3xl">
                  {formatKwanza(realTotalAmount)}
                </div>
                {guestsCount > 0 && (
                  <p className="text-xs text-muted-foreground mt-1">
                    {formatKwanza(realTotalAmount / guestsCount)} por pessoa
                  </p>
                )}
              </CardContent>
            </Card>

            {/* Pessoas */}
            <Card>
              <CardHeader className="p-3 pb-1 sm:p-6 sm:pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-xs font-medium text-muted-foreground sm:text-sm">
                    Pessoas
                  </CardTitle>
                  <Users className="w-4 h-4 text-blue-600" />
                </div>
              </CardHeader>
              <CardContent className="p-3 pt-0 sm:p-6 sm:pt-0">
                <div className="text-2xl font-bold text-blue-600 sm:text-3xl">
                  {guestsCount}
                </div>
                {table.capacity && (
                  <p className="text-xs text-muted-foreground mt-1">
                    de {table.capacity} capacidade
                  </p>
                )}
              </CardContent>
            </Card>

            {/* Pedidos */}
            <Card>
              <CardHeader className="p-3 pb-1 sm:p-6 sm:pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-xs font-medium text-muted-foreground sm:text-sm">
                    Pedidos
                  </CardTitle>
                  <ShoppingCart className="w-4 h-4 text-purple-600" />
                </div>
              </CardHeader>
              <CardContent className="p-3 pt-0 sm:p-6 sm:pt-0">
                <div className="text-2xl font-bold text-purple-600 sm:text-3xl">
                  {realOrdersCount}
                </div>
                {realOrdersCount > 0 && (
                  <p className="text-xs text-muted-foreground mt-1">
                    {completedOrders} concluídos
                  </p>
                )}
              </CardContent>
            </Card>

            {/* Ticket Médio */}
            <Card>
              <CardHeader className="p-3 pb-1 sm:p-6 sm:pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-xs font-medium text-muted-foreground sm:text-sm">
                    Ticket Médio
                  </CardTitle>
                  <TrendingUp className="w-4 h-4 text-amber-600" />
                </div>
              </CardHeader>
              <CardContent className="min-w-0 p-3 pt-0 sm:p-6 sm:pt-0">
                <div className="min-w-0 break-words text-xl font-bold text-amber-600 sm:text-3xl">
                  {formatKwanza(guestsCount > 0 ? realTotalAmount / guestsCount : 0)}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  por pessoa
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Status dos Pedidos */}
          {realOrdersCount > 0 && (
            <Card>
              <CardHeader className="p-3 sm:p-6">
                <CardTitle className="flex items-center gap-2">
                  <Utensils className="w-5 h-5" />
                  Status dos Pedidos
                </CardTitle>
              </CardHeader>
              <CardContent className="p-3 sm:p-6">
                <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 sm:gap-4">
                  {/* Pendentes */}
                  <div className="min-w-0 rounded-lg border border-yellow-500/20 bg-yellow-500/10 p-2 text-center sm:p-4">
                    <div className="mb-1 flex flex-wrap items-center justify-center gap-1 sm:mb-2 sm:gap-2">
                      <AlertCircle className="w-4 h-4 text-yellow-600" />
                      <span className="text-xs font-medium text-muted-foreground sm:text-sm">Pendentes</span>
                    </div>
                    <div className="text-xl font-bold text-yellow-600 sm:text-2xl">
                      {pendingOrders}
                    </div>
                  </div>

                  {/* Em Preparo */}
                  <div className="min-w-0 rounded-lg border border-blue-500/20 bg-blue-500/10 p-2 text-center sm:p-4">
                    <div className="mb-1 flex flex-wrap items-center justify-center gap-1 sm:mb-2 sm:gap-2">
                      <Clock className="w-4 h-4 text-blue-600" />
                      <span className="text-xs font-medium text-muted-foreground sm:text-sm">Em Preparo</span>
                    </div>
                    <div className="text-xl font-bold text-blue-600 sm:text-2xl">
                      {preparingOrders}
                    </div>
                  </div>

                  {/* Concluídos */}
                  <div className="min-w-0 rounded-lg border border-green-500/20 bg-green-500/10 p-2 text-center sm:p-4">
                    <div className="mb-1 flex flex-wrap items-center justify-center gap-1 sm:mb-2 sm:gap-2">
                      <CheckCircle2 className="w-4 h-4 text-green-600" />
                      <span className="text-xs font-medium text-muted-foreground sm:text-sm">Concluídos</span>
                    </div>
                    <div className="text-xl font-bold text-green-600 sm:text-2xl">
                      {completedOrders}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Informações da Sessão */}
          {table.currentSessionId && (
            <Card>
              <CardHeader className="p-3 sm:p-6">
                <CardTitle>Informações da Sessão</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 p-3 sm:space-y-3 sm:p-6">
                <div className="flex flex-wrap items-center justify-between gap-2 py-1.5 sm:py-2">
                  <span className="text-sm text-muted-foreground">ID da Sessão</span>
                  <span className="font-mono text-sm">{table.currentSessionId.slice(0, 8)}</span>
                </div>
                <Separator />
                <div className="flex flex-wrap items-center justify-between gap-2 py-1.5 sm:py-2">
                  <span className="text-sm text-muted-foreground">Início</span>
                  <span className="text-sm">
                    {table.sessionStartTime 
                      ? formatDistanceToNow(new Date(table.sessionStartTime), { 
                          addSuffix: true, 
                          locale: ptBR 
                        })
                      : '-'
                    }
                  </span>
                </div>
                <Separator />
                <div className="flex flex-wrap items-center justify-between gap-2 py-1.5 sm:py-2">
                  <span className="text-sm text-muted-foreground">Duração</span>
                  <span className="text-sm font-semibold">{sessionDuration}</span>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Resumo por Convidado */}
          {ordersByGuest && ordersByGuest.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Resumo por Pessoa</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {ordersByGuest.map((og: any) => {
                    const guestTotal = parseFloat(og.subtotal || '0');
                    const guestOrders = og.orders?.length || 0;
                    
                    return (
                      <div 
                        key={og.guest.id}
                        className="flex items-center justify-between p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                            <Users className="w-5 h-5 text-primary" />
                          </div>
                          <div>
                            <div className="font-semibold">
                              {og.guest.name || `Cliente ${og.guest.guestNumber}`}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              {guestOrders} {guestOrders === 1 ? 'pedido' : 'pedidos'}
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-bold text-lg">
                            {formatKwanza(guestTotal)}
                          </div>
                          {og.guest.status === 'pago' && (
                            <Badge variant="outline" className="text-green-600 border-green-600">
                              <CheckCircle2 className="w-3 h-3 mr-1" />
                              Pago
                            </Badge>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          )}
        </>
      )}
    </div>
  );
}
