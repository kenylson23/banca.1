import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { formatKwanza } from '@/lib/formatters';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import {
  TrendingUpIcon,
  TrendingDownIcon,
  DollarSignIcon,
  ActivityIcon,
  ReceiptIcon,
} from 'lucide-react';

interface FinancialEvent {
  id: string;
  eventType: string;
  amountChange: string;
  eventDescription: string | null;
  eventMetadata: any;
  createdAt: Date;
}

interface PaymentEvent {
  id: string;
  orderId: string;
  amount: string;
  paymentMethod: string;
  paymentStatus: string;
  transactionId: string | null;
  createdAt: Date;
}

interface OrderAdjustment {
  id: string;
  orderId: string;
  adjustmentType: string;
  amount: string;
  reason: string | null;
  appliedAt: Date;
}

interface FinancialDashboardProps {
  tableId?: string;
  sessionId?: string;
}

export function FinancialDashboard({ tableId, sessionId }: FinancialDashboardProps) {
  const [activeTab, setActiveTab] = useState('events');

  const { data: financialEvents = [] } = useQuery<FinancialEvent[]>({
    queryKey: ['/api/financial-events', { tableId, sessionId }],
    enabled: !!(tableId || sessionId),
  });

  const { data: paymentEvents = [] } = useQuery<PaymentEvent[]>({
    queryKey: ['/api/payment-events', { sessionId }],
    enabled: !!sessionId,
  });

  const getEventTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      ITEM_ADDED: 'Item Adicionado',
      ITEM_REMOVED: 'Item Removido',
      ITEM_QUANTITY_CHANGED: 'Quantidade Alterada',
      PAYMENT_CAPTURED: 'Pagamento Capturado',
      PAYMENT_PARTIAL: 'Pagamento Parcial',
      REFUND_ISSUED: 'Reembolso Emitido',
      REFUND_PARTIAL: 'Reembolso Parcial',
      CANCELLED_ORDER: 'Pedido Cancelado',
      CANCELLED_ITEM: 'Item Cancelado',
      DISCOUNT_APPLIED: 'Desconto Aplicado',
      DISCOUNT_REMOVED: 'Desconto Removido',
      SERVICE_CHARGE_APPLIED: 'Taxa de Serviço',
      SESSION_STARTED: 'Sessão Iniciada',
      SESSION_CLOSED: 'Sessão Encerrada',
      TABLE_MOVED: 'Mesa Movida',
      TABLE_MERGED: 'Mesa Mesclada',
    };
    return labels[type] || type;
  };

  const getEventIcon = (type: string) => {
    if (type.includes('PAYMENT') || type.includes('REFUND')) {
      return <DollarSignIcon className="h-4 w-4" />;
    }
    if (type.includes('ITEM')) {
      return <ReceiptIcon className="h-4 w-4" />;
    }
    return <ActivityIcon className="h-4 w-4" />;
  };

  const getEventColor = (type: string) => {
    if (type.includes('PAYMENT') || type === 'ITEM_ADDED') {
      return 'text-green-600 dark:text-green-400';
    }
    if (type.includes('REFUND') || type.includes('REMOVED') || type.includes('CANCELLED')) {
      return 'text-red-600 dark:text-red-400';
    }
    if (type.includes('DISCOUNT')) {
      return 'text-blue-600 dark:text-blue-400';
    }
    return 'text-muted-foreground';
  };

  const getPaymentMethodLabel = (method: string) => {
    const labels: Record<string, string> = {
      dinheiro: 'Dinheiro',
      multicaixa: 'Multicaixa',
      transferencia: 'Transferência',
      cartao: 'Cartão',
    };
    return labels[method] || method;
  };

  const totalPayments = paymentEvents.reduce(
    (sum, payment) => sum + parseFloat(payment.amount),
    0
  );

  const eventsByType = financialEvents.reduce((acc, event) => {
    acc[event.eventType] = (acc[event.eventType] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Eventos</CardTitle>
            <ActivityIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{financialEvents.length}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Eventos registrados
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Pago</CardTitle>
            <DollarSignIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatKwanza(totalPayments.toFixed(2))}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {paymentEvents.length} pagamento(s)
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tipos de Evento</CardTitle>
            <ReceiptIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{Object.keys(eventsByType).length}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Categorias diferentes
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="events" data-testid="tab-events">
            Eventos Financeiros
          </TabsTrigger>
          <TabsTrigger value="payments" data-testid="tab-payments">
            Histórico de Pagamentos
          </TabsTrigger>
        </TabsList>

        <TabsContent value="events" className="space-y-3 mt-4">
          {financialEvents.length === 0 ? (
            <Card>
              <CardContent className="py-8 text-center text-muted-foreground">
                <ActivityIcon className="h-12 w-12 mx-auto mb-3 opacity-50" />
                <p>Nenhum evento financeiro registrado</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-2">
              {financialEvents.map((event) => (
                <Card key={event.id} data-testid={`event-${event.id}`}>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-start gap-3 flex-1">
                        <div className={`mt-1 ${getEventColor(event.eventType)}`}>
                          {getEventIcon(event.eventType)}
                        </div>
                        <div className="flex-1 space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="font-medium">
                              {getEventTypeLabel(event.eventType)}
                            </span>
                            <Badge variant="outline" className="text-xs">
                              {event.eventType}
                            </Badge>
                          </div>
                          {event.eventDescription && (
                            <p className="text-sm text-muted-foreground">
                              {event.eventDescription}
                            </p>
                          )}
                          <p className="text-xs text-muted-foreground">
                            {format(new Date(event.createdAt), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <div
                          className={`font-medium ${
                            parseFloat(event.amountChange) >= 0
                              ? 'text-green-600 dark:text-green-400'
                              : 'text-red-600 dark:text-red-400'
                          }`}
                        >
                          {parseFloat(event.amountChange) >= 0 ? (
                            <div className="flex items-center gap-1">
                              <TrendingUpIcon className="h-4 w-4" />
                              <span>{formatKwanza(event.amountChange)}</span>
                            </div>
                          ) : (
                            <div className="flex items-center gap-1">
                              <TrendingDownIcon className="h-4 w-4" />
                              <span>{formatKwanza(event.amountChange)}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="payments" className="space-y-3 mt-4">
          {paymentEvents.length === 0 ? (
            <Card>
              <CardContent className="py-8 text-center text-muted-foreground">
                <DollarSignIcon className="h-12 w-12 mx-auto mb-3 opacity-50" />
                <p>Nenhum pagamento registrado</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-2">
              {paymentEvents.map((payment) => (
                <Card key={payment.id} data-testid={`payment-${payment.id}`}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between gap-4">
                      <div className="flex items-center gap-3 flex-1">
                        <DollarSignIcon className="h-4 w-4 text-green-600 dark:text-green-400" />
                        <div className="flex-1 space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="font-medium">
                              {getPaymentMethodLabel(payment.paymentMethod)}
                            </span>
                            <Badge
                              variant={
                                payment.paymentStatus === 'pago'
                                  ? 'default'
                                  : payment.paymentStatus === 'parcial'
                                  ? 'secondary'
                                  : 'outline'
                              }
                              className="text-xs"
                            >
                              {payment.paymentStatus}
                            </Badge>
                          </div>
                          {payment.transactionId && (
                            <p className="text-xs text-muted-foreground">
                              ID: {payment.transactionId}
                            </p>
                          )}
                          <p className="text-xs text-muted-foreground">
                            {format(new Date(payment.createdAt), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
                          </p>
                        </div>
                      </div>
                      <div className="text-right font-medium text-green-600 dark:text-green-400">
                        {formatKwanza(payment.amount)}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
