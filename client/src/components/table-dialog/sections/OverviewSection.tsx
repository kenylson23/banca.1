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
    <div className="space-y-6">
      {/* Header Card - Mesa Info */}
      <Card className="border-2 border-primary/20 bg-gradient-to-br from-primary/5 to-transparent">
        <CardHeader>
          <div className="flex items-start justify-between">
            <div>
              <CardTitle className="text-3xl font-bold">
                Mesa {table.number}
              </CardTitle>
              <div className="flex items-center gap-2 mt-2">
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
                  "text-2xl font-bold flex items-center gap-2",
                  realTotalAmount - realPaidAmount > 0 ? "text-orange-600" : "text-green-600"
                )}>
                  <DollarSign className="w-5 h-5" />
                  {formatKwanza(Math.max(0, realTotalAmount - realPaidAmount))}
                </div>
              </div>
            )}
          </div>
        </CardHeader>
      </Card>

      {table.status === 'livre' ? (
        /* Empty State - Mesa Livre */
        <Card>
          <CardContent className="py-12 text-center">
            <div className="flex flex-col items-center gap-4">
              <div className="h-24 w-24 rounded-full bg-primary/10 flex items-center justify-center">
                <Play className="h-12 w-12 text-primary" />
              </div>
              <div>
                <h3 className="text-xl font-bold mb-2">Mesa Disponível</h3>
                <p className="text-muted-foreground max-w-md mb-4">
                  Esta mesa está livre e pronta para receber clientes. Inicie uma sessão para começar a criar pedidos.
                </p>
                <Button 
                  size="lg" 
                  onClick={onStartSession}
                  className="gap-2"
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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Total da Mesa */}
            <Card className="border-2 border-green-500/20 bg-gradient-to-br from-green-500/5 to-transparent">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Total da Mesa
                  </CardTitle>
                  <DollarSign className="w-4 h-4 text-green-600" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-green-600">
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
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Pessoas
                  </CardTitle>
                  <Users className="w-4 h-4 text-blue-600" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-blue-600">
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
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Pedidos
                  </CardTitle>
                  <ShoppingCart className="w-4 h-4 text-purple-600" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-purple-600">
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
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Ticket Médio
                  </CardTitle>
                  <TrendingUp className="w-4 h-4 text-amber-600" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-amber-600">
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
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Utensils className="w-5 h-5" />
                  Status dos Pedidos
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-3 gap-4">
                  {/* Pendentes */}
                  <div className="text-center p-4 rounded-lg bg-yellow-500/10 border border-yellow-500/20">
                    <div className="flex items-center justify-center gap-2 mb-2">
                      <AlertCircle className="w-4 h-4 text-yellow-600" />
                      <span className="text-sm font-medium text-muted-foreground">Pendentes</span>
                    </div>
                    <div className="text-2xl font-bold text-yellow-600">
                      {pendingOrders}
                    </div>
                  </div>

                  {/* Em Preparo */}
                  <div className="text-center p-4 rounded-lg bg-blue-500/10 border border-blue-500/20">
                    <div className="flex items-center justify-center gap-2 mb-2">
                      <Clock className="w-4 h-4 text-blue-600" />
                      <span className="text-sm font-medium text-muted-foreground">Em Preparo</span>
                    </div>
                    <div className="text-2xl font-bold text-blue-600">
                      {preparingOrders}
                    </div>
                  </div>

                  {/* Concluídos */}
                  <div className="text-center p-4 rounded-lg bg-green-500/10 border border-green-500/20">
                    <div className="flex items-center justify-center gap-2 mb-2">
                      <CheckCircle2 className="w-4 h-4 text-green-600" />
                      <span className="text-sm font-medium text-muted-foreground">Concluídos</span>
                    </div>
                    <div className="text-2xl font-bold text-green-600">
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
              <CardHeader>
                <CardTitle>Informações da Sessão</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between py-2">
                  <span className="text-sm text-muted-foreground">ID da Sessão</span>
                  <span className="font-mono text-sm">{table.currentSessionId.slice(0, 8)}</span>
                </div>
                <Separator />
                <div className="flex items-center justify-between py-2">
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
                <div className="flex items-center justify-between py-2">
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
