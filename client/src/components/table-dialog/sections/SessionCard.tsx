/**
 * SessionCard - Card para exibir detalhes de uma sessão
 */

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import { 
  Users, 
  Clock, 
  CreditCard,
  ChevronDown,
  ChevronUp,
  ShoppingBag,
  TrendingDown,
  Plus,
  Minus,
} from 'lucide-react';
import { formatKwanza } from '@/lib/formatters';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { cn } from '@/lib/utils';

interface SessionCardProps {
  session: {
    id: string;
    tableId: string;
    startedAt: string;
    endedAt: string | null;
    peopleCount: number;
    totalAmount: string;
    status: string;
  };
  tableId: string;
}

export function SessionCard({ session, tableId }: SessionCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  // Buscar detalhes da sessão quando expandir
  const { data: ordersByGuest, isLoading } = useQuery({
    queryKey: [`/api/tables/${tableId}/orders-by-guest`, session.id],
    enabled: isExpanded,
  });

  // Calcular duração da sessão
  const duration = session.endedAt 
    ? Math.round((new Date(session.endedAt).getTime() - new Date(session.startedAt).getTime()) / 1000 / 60)
    : 0;
  
  const hours = Math.floor(duration / 60);
  const minutes = duration % 60;
  const durationText = hours > 0 ? `${hours}h ${minutes}min` : `${minutes}min`;

  // Status da sessão
  const statusConfig = {
    active: { label: 'Ativa', color: 'bg-blue-500' },
    completed: { label: 'Finalizada', color: 'bg-green-500' },
    cancelled: { label: 'Cancelada', color: 'bg-red-500' },
  };
  
  const statusInfo = statusConfig[session.status as keyof typeof statusConfig] || statusConfig.completed;

  return (
    <Card className={cn(
      "hover:shadow-md transition-all",
      isExpanded && "ring-2 ring-primary/20"
    )}>
      <CardHeader className="pb-3">
        {/* Header - Informações Principais */}
        <div 
          className="flex items-center justify-between cursor-pointer"
          onClick={() => setIsExpanded(!isExpanded)}
        >
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <div className="h-10 w-10 rounded-full bg-indigo-500/10 flex items-center justify-center">
                <Clock className="w-5 h-5 text-indigo-600" />
              </div>
              <div>
                <div className="font-semibold text-lg">
                  {format(new Date(session.startedAt), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
                </div>
                {session.endedAt && (
                  <div className="text-sm text-muted-foreground">
                    Duração: {durationText}
                  </div>
                )}
              </div>
            </div>

            {/* Info Grid */}
            <div className="grid grid-cols-3 gap-4 mt-3">
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm">
                  <span className="font-semibold">{session.peopleCount}</span>
                  <span className="text-muted-foreground ml-1">
                    {session.peopleCount === 1 ? 'pessoa' : 'pessoas'}
                  </span>
                </span>
              </div>
              
              <div className="flex items-center gap-2">
                <CreditCard className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm font-semibold text-green-600">
                  {formatKwanza(parseFloat(session.totalAmount))}
                </span>
              </div>

              <div className="flex items-center justify-end">
                <Badge className={statusInfo.color}>
                  {statusInfo.label}
                </Badge>
              </div>
            </div>
          </div>

          {/* Expand Icon */}
          <Button variant="ghost" size="sm" className="ml-4">
            {isExpanded ? (
              <ChevronUp className="h-5 w-5" />
            ) : (
              <ChevronDown className="h-5 w-5" />
            )}
          </Button>
        </div>
      </CardHeader>

      {/* Detalhes Expandidos */}
      {isExpanded && (
        <CardContent className="pt-0">
          <Separator className="mb-4" />
          
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="h-8 w-8 rounded-full border-4 border-primary border-t-transparent animate-spin" />
            </div>
          ) : ordersByGuest && ordersByGuest.length > 0 ? (
            <div className="space-y-4">
              {/* Seção: Itens Consumidos */}
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <ShoppingBag className="h-4 w-4 text-primary" />
                  <h4 className="font-semibold">Itens Consumidos</h4>
                </div>

                <div className="space-y-3">
                  {ordersByGuest.map((og: any) => (
                    <div 
                      key={og.guest.id}
                      className="p-3 rounded-lg bg-muted/50 space-y-2"
                    >
                      {/* Guest Header */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-full bg-indigo-500/20 flex items-center justify-center text-xs font-bold text-indigo-700">
                            #{og.guest.guestNumber}
                          </div>
                          <span className="font-medium">
                            {og.guest.name || `Cliente ${og.guest.guestNumber}`}
                          </span>
                        </div>
                        <span className="font-semibold text-sm">
                          {formatKwanza(parseFloat(og.subtotal))}
                        </span>
                      </div>

                      {/* Items */}
                      <div className="space-y-1 pl-9">
                        {og.orders.flatMap((order: any) => order.items || []).map((item: any, idx: number) => (
                          <div key={idx} className="flex justify-between text-sm">
                            <span className="text-muted-foreground">
                              <Badge variant="secondary" className="text-xs mr-2">
                                {item.quantity}x
                              </Badge>
                              {item.menuItem?.name || item.name}
                            </span>
                            <span className="font-medium">
                              {formatKwanza(parseFloat(item.price) * item.quantity)}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Seção: Cálculos (se houver descontos/taxas) */}
              {ordersByGuest.some((og: any) => og.discounts || og.additions) && (
                <>
                  <Separator />
                  <div>
                    <div className="flex items-center gap-2 mb-3">
                      <TrendingDown className="h-4 w-4 text-primary" />
                      <h4 className="font-semibold">Ajustes</h4>
                    </div>
                    <div className="space-y-2 text-sm">
                      {ordersByGuest.flatMap((og: any) => [
                        ...(og.discounts || []).map((d: any) => (
                          <div key={d.id} className="flex justify-between text-green-600">
                            <span className="flex items-center gap-1">
                              <Minus className="h-3 w-3" />
                              {d.label}
                            </span>
                            <span>-{formatKwanza(d.value)}</span>
                          </div>
                        )),
                        ...(og.additions || []).map((a: any) => (
                          <div key={a.id} className="flex justify-between text-blue-600">
                            <span className="flex items-center gap-1">
                              <Plus className="h-3 w-3" />
                              {a.label}
                            </span>
                            <span>+{formatKwanza(a.value)}</span>
                          </div>
                        ))
                      ])}
                    </div>
                  </div>
                </>
              )}
            </div>
          ) : (
            <div className="text-center py-6 text-muted-foreground">
              Nenhum detalhe disponível
            </div>
          )}
        </CardContent>
      )}
    </Card>
  );
}
