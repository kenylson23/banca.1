/**
 * HistorySection - Histórico da Mesa (MELHORADO)
 * Mostra sessões anteriores, pagamentos e estatísticas
 */

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  History, 
  CreditCard,
  Clock,
  CheckCircle2,
  Receipt,
  Calendar,
  BarChart3,
  Printer,
} from 'lucide-react';
import { formatKwanza } from '@/lib/formatters';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import type { Table } from '@shared/schema';
import { SessionCard } from './SessionCard';
import { TableStatistics } from './TableStatistics';
import { Button } from '@/components/ui/button';
import { PrintTablePayment } from '@/components/PrintTablePayment';

interface HistorySectionProps {
  table: Table;
}

const paymentMethodLabels: Record<string, string> = {
  dinheiro: 'Dinheiro',
  cartao: 'Cartão',
  multicaixa: 'Multicaixa',
  transferencia: 'Transferência',
  // Manter compatibilidade com valores antigos se existirem
  cash: 'Dinheiro',
  card: 'Cartão',
  mbway: 'MBWay',
  tpa: 'TPA',
  bank_transfer: 'Transferência',
};

export function HistorySection({ table }: HistorySectionProps) {
  const [activeTab, setActiveTab] = useState('statistics');
  const [printingPaymentId, setPrintingPaymentId] = useState<string | null>(null);

  // Buscar sessões da mesa
  const { data: sessions = [], isLoading: loadingSessions } = useQuery<any[]>({
    queryKey: [`/api/tables/${table.id}/sessions`],
    enabled: !!table.id,
  });

  // Buscar pagamentos da mesa
  const { data: payments = [], isLoading: loadingPayments } = useQuery<any[]>({
    queryKey: [`/api/tables/${table.id}/payments`],
    enabled: !!table.id,
  });

  const isLoading = loadingSessions || loadingPayments;

  // Filtrar sessões encerradas (com endedAt preenchido)
  // Status válidos do banco: 'livre', 'ocupada', 'em_andamento', 'aguardando_pagamento', 'encerrada'
  const completedSessions = sessions
    .filter(s => s.endedAt !== null) // Sessões com data de término
    .sort((a, b) => new Date(b.startedAt).getTime() - new Date(a.startedAt).getTime());

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="h-12 w-12 rounded-full border-4 border-primary border-t-transparent animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Carregando histórico...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Histórico da Mesa</h2>
        <p className="text-muted-foreground">
          Estatísticas, sessões anteriores e pagamentos
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="statistics" className="gap-2">
            <BarChart3 className="h-4 w-4" />
            Estatísticas
          </TabsTrigger>
          <TabsTrigger value="sessions" className="gap-2">
            <Calendar className="h-4 w-4" />
            Sessões ({completedSessions.length})
          </TabsTrigger>
          <TabsTrigger value="payments" className="gap-2">
            <CreditCard className="h-4 w-4" />
            Pagamentos ({payments.length})
          </TabsTrigger>
        </TabsList>

        {/* Aba: Estatísticas */}
        <TabsContent value="statistics" className="mt-6">
          <TableStatistics sessions={sessions} payments={payments} />
        </TabsContent>

        {/* Aba: Sessões */}
        <TabsContent value="sessions" className="mt-6">
          {completedSessions.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <div className="flex flex-col items-center gap-4">
                  <div className="h-24 w-24 rounded-full bg-muted flex items-center justify-center">
                    <Calendar className="h-12 w-12 text-muted-foreground" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold mb-2">Nenhuma Sessão Registrada</h3>
                    <p className="text-muted-foreground max-w-md">
                      Ainda não há sessões finalizadas para esta mesa.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {completedSessions.map((session: any) => (
                <SessionCard
                  key={session.id}
                  session={session}
                  tableId={table.id}
                />
              ))}
            </div>
          )}
        </TabsContent>

        {/* Aba: Pagamentos */}
        <TabsContent value="payments" className="mt-6">
          {payments.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <div className="flex flex-col items-center gap-4">
                  <div className="h-24 w-24 rounded-full bg-muted flex items-center justify-center">
                    <History className="h-12 w-12 text-muted-foreground" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold mb-2">Nenhum Pagamento</h3>
                    <p className="text-muted-foreground max-w-md">
                      Ainda não há pagamentos registrados para esta mesa.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {payments.map((payment: any) => (
                <Card key={payment.id} className="hover:shadow-md transition-shadow">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full bg-green-500/10 flex items-center justify-center">
                          <CreditCard className="w-5 h-5 text-green-600" />
                        </div>
                        <div>
                          <CardTitle className="text-lg">
                            Pagamento #{payment.id.slice(0, 8)}
                          </CardTitle>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Clock className="w-3 h-3" />
                            {format(new Date(payment.createdAt), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
                          </div>
                        </div>
                      </div>
                      <Badge className="bg-green-500">
                        <CheckCircle2 className="w-3 h-3 mr-1" />
                        Pago
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <Separator />
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <div className="text-sm text-muted-foreground mb-1">Valor</div>
                        <div className="text-2xl font-bold text-green-600">
                          {formatKwanza(payment.amount)}
                        </div>
                      </div>
                      <div>
                        <div className="text-sm text-muted-foreground mb-1">Método</div>
                        <div className="font-semibold">
                          {paymentMethodLabels[payment.paymentMethod] || payment.paymentMethod}
                        </div>
                        {payment.guestName && (
                          <div className="text-xs text-muted-foreground mt-1">
                            Pago por: {payment.guestName}
                          </div>
                        )}
                      </div>
                    </div>
                    {payment.notes && (
                      <>
                        <Separator />
                        <div>
                          <div className="text-sm text-muted-foreground mb-1">Observações</div>
                          <div className="text-sm">{payment.notes}</div>
                        </div>
                      </>
                    )}
                    
                    <Separator />
                    
                    {/* Botão de Reimprimir */}
                    <div className="flex justify-end">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setPrintingPaymentId(payment.id)}
                        className="gap-2"
                      >
                        <Printer className="h-4 w-4" />
                        Reimprimir Recibo
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
              
              {/* Componente de Impressão (invisível) */}
              {printingPaymentId && (() => {
                const paymentToPrint = payments.find(p => p.id === printingPaymentId);
                if (!paymentToPrint) return null;
                
                return (
                  <PrintTablePayment
                    payment={{
                      id: paymentToPrint.id,
                      amount: paymentToPrint.amount,
                      paymentMethod: paymentToPrint.paymentMethod,
                      createdAt: paymentToPrint.createdAt,
                      notes: paymentToPrint.notes,
                      sessionId: paymentToPrint.sessionId,
                      guestName: paymentToPrint.guestName,
                      items: paymentToPrint.items || [],
                    }}
                    tableName={`Mesa ${table.number}`}
                    onPrintComplete={() => setPrintingPaymentId(null)}
                    autoPrint={true}
                  />
                );
              })()}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
