import { useState, useEffect } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { queryClient, apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { 
  Users, 
  Clock, 
  DollarSign, 
  CreditCard, 
  Receipt, 
  AlertCircle, 
  ChefHat,
  CheckCircle,
  Timer,
  Bell,
  Banknote,
  Smartphone,
  Building2,
  ArrowRightLeft,
  Split,
  X,
  Plus,
  Minus,
  RefreshCw,
  Printer
} from 'lucide-react';
import { format } from 'date-fns';
import { formatKwanza } from '@/lib/formatters';
import type { Table, Order, TableSession } from '@shared/schema';

interface TableWithDetails extends Table {
  orders?: Order[];
  session?: TableSession;
  pendingOrdersCount?: number;
  hasDigitalOrders?: boolean;
}

const STATUS_CONFIG = {
  livre: { label: 'Livre', color: 'bg-gray-500', textColor: 'text-gray-500' },
  ocupada: { label: 'Ocupada', color: 'bg-blue-500', textColor: 'text-blue-500' },
  em_andamento: { label: 'Em Andamento', color: 'bg-amber-500', textColor: 'text-amber-500' },
  aguardando_pagamento: { label: 'Aguardando Pagamento', color: 'bg-orange-500', textColor: 'text-orange-500' },
  encerrada: { label: 'Encerrada', color: 'bg-green-500', textColor: 'text-green-500' },
};

const PAYMENT_METHODS = [
  { value: 'dinheiro', label: 'Dinheiro', icon: Banknote },
  { value: 'multicaixa', label: 'Multicaixa', icon: Smartphone },
  { value: 'transferencia', label: 'Transferência', icon: Building2 },
  { value: 'cartao', label: 'Cartão', icon: CreditCard },
];

export default function OpenTables() {
  const { toast } = useToast();
  const [selectedTable, setSelectedTable] = useState<TableWithDetails | null>(null);
  const [paymentDialogOpen, setPaymentDialogOpen] = useState(false);
  const [splitPaymentMode, setSplitPaymentMode] = useState(false);
  const [payments, setPayments] = useState<{ method: string; amount: string }[]>([{ method: 'dinheiro', amount: '' }]);
  const [receivedAmount, setReceivedAmount] = useState('');
  const [activeTab, setActiveTab] = useState('all');

  const { data: tables = [], isLoading, refetch } = useQuery<TableWithDetails[]>({
    queryKey: ['/api/tables/open'],
    refetchInterval: 10000,
  });

  const { data: allOrders = [] } = useQuery<Order[]>({
    queryKey: ['/api/orders'],
  });

  const closeSessionMutation = useMutation({
    mutationFn: async (tableId: string) => {
      return apiRequest('POST', `/api/tables/${tableId}/close-session`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/tables'] });
      queryClient.invalidateQueries({ queryKey: ['/api/tables/open'] });
      toast({ title: 'Sessão encerrada', description: 'A mesa foi liberada com sucesso.' });
      setSelectedTable(null);
      setPaymentDialogOpen(false);
    },
    onError: () => {
      toast({ title: 'Erro', description: 'Não foi possível encerrar a sessão.', variant: 'destructive' });
    },
  });

  const recordPaymentMutation = useMutation({
    mutationFn: async ({ tableId, payments }: { tableId: string; payments: { method: string; amount: string }[] }) => {
      const totalPayment = payments.reduce((sum, p) => sum + parseFloat(p.amount || '0'), 0);
      return apiRequest('POST', `/api/tables/${tableId}/payment`, {
        amount: totalPayment.toFixed(2),
        paymentMethod: payments.length === 1 ? payments[0].method : 'dinheiro',
        receivedAmount: receivedAmount || undefined,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/tables'] });
      queryClient.invalidateQueries({ queryKey: ['/api/tables/open'] });
      toast({ title: 'Pagamento registrado', description: 'O pagamento foi registrado com sucesso.' });
      setPayments([{ method: 'dinheiro', amount: '' }]);
      setReceivedAmount('');
      setSplitPaymentMode(false);
      refetch();
    },
    onError: () => {
      toast({ title: 'Erro', description: 'Não foi possível registrar o pagamento.', variant: 'destructive' });
    },
  });

  const occupiedTables = tables.filter(t => t.status !== 'livre');
  const tablesWithDigitalOrders = occupiedTables.filter(t => t.hasDigitalOrders);
  const tablesAwaitingPayment = occupiedTables.filter(t => t.status === 'aguardando_pagamento');

  const filteredTables = activeTab === 'all' 
    ? occupiedTables 
    : activeTab === 'digital' 
      ? tablesWithDigitalOrders 
      : tablesAwaitingPayment;

  const totalRevenue = occupiedTables.reduce((sum, t) => sum + parseFloat(t.totalAmount || '0'), 0);
  const pendingPayments = occupiedTables.filter(t => parseFloat(t.totalAmount || '0') > 0).length;

  const handleAddPayment = () => {
    setPayments([...payments, { method: 'dinheiro', amount: '' }]);
  };

  const handleRemovePayment = (index: number) => {
    if (payments.length > 1) {
      setPayments(payments.filter((_, i) => i !== index));
    }
  };

  const handlePaymentChange = (index: number, field: 'method' | 'amount', value: string) => {
    const newPayments = [...payments];
    newPayments[index][field] = value;
    setPayments(newPayments);
  };

  const handleRecordPayment = () => {
    if (selectedTable) {
      recordPaymentMutation.mutate({ tableId: selectedTable.id, payments });
    }
  };

  const handleCloseSession = () => {
    if (selectedTable) {
      closeSessionMutation.mutate(selectedTable.id);
    }
  };

  const handlePrintBill = () => {
    if (!selectedTable) return;
    
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      toast({ title: 'Erro', description: 'Não foi possível abrir a janela de impressão.', variant: 'destructive' });
      return;
    }

    const tableOrders = allOrders.filter(o => o.tableId === selectedTable.id && o.status !== 'cancelado');
    const totalAmount = parseFloat(selectedTable.totalAmount || '0');
    const now = new Date();

    const printContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Conta - Mesa ${selectedTable.number}</title>
        <style>
          @media print {
            @page {
              size: 80mm auto;
              margin: 5mm;
            }
            body {
              margin: 0;
              padding: 0;
            }
          }
          body {
            font-family: 'Courier New', monospace;
            font-size: 12px;
            line-height: 1.4;
            max-width: 80mm;
            margin: 0 auto;
            padding: 10px;
          }
          .header {
            text-align: center;
            margin-bottom: 15px;
            border-bottom: 2px dashed #000;
            padding-bottom: 10px;
          }
          .restaurant-name {
            font-size: 18px;
            font-weight: bold;
            margin-bottom: 5px;
          }
          .table-info {
            font-size: 16px;
            font-weight: bold;
            margin: 10px 0;
          }
          .info-row {
            display: flex;
            justify-content: space-between;
            margin: 3px 0;
          }
          .section {
            margin: 15px 0;
          }
          .section-title {
            font-weight: bold;
            font-size: 13px;
            margin-bottom: 8px;
            border-bottom: 1px solid #000;
            padding-bottom: 3px;
          }
          .item {
            display: flex;
            justify-content: space-between;
            margin: 5px 0;
          }
          .item-name {
            flex: 1;
          }
          .item-price {
            text-align: right;
            white-space: nowrap;
            margin-left: 10px;
          }
          .total {
            border-top: 2px solid #000;
            margin-top: 10px;
            padding-top: 8px;
          }
          .total-row {
            display: flex;
            justify-content: space-between;
            font-size: 14px;
            font-weight: bold;
            margin: 5px 0;
          }
          .footer {
            text-align: center;
            margin-top: 20px;
            padding-top: 10px;
            border-top: 2px dashed #000;
            font-size: 11px;
          }
          .print-time {
            margin-top: 8px;
            font-size: 10px;
            color: #666;
          }
        </style>
      </head>
      <body>
        <div class="header">
          <div class="restaurant-name">NaBancada</div>
          <div class="table-info">MESA ${selectedTable.number}</div>
        </div>

        <div class="section">
          <div class="info-row">
            <span>Data:</span>
            <span>${format(now, "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}</span>
          </div>
          ${selectedTable.customerName ? `
          <div class="info-row">
            <span>Cliente:</span>
            <span>${selectedTable.customerName}</span>
          </div>
          ` : ''}
          ${selectedTable.customerCount ? `
          <div class="info-row">
            <span>Pessoas:</span>
            <span>${selectedTable.customerCount}</span>
          </div>
          ` : ''}
        </div>

        <div class="section">
          <div class="section-title">RESUMO DO CONSUMO</div>
          ${tableOrders.map(order => `
            <div style="margin-bottom: 10px; padding-bottom: 5px; border-bottom: 1px dashed #ccc;">
              <div class="info-row" style="font-size: 11px; color: #666;">
                <span>Pedido ${order.id.substring(0, 6).toUpperCase()}</span>
                <span>${formatKwanza(order.totalAmount)}</span>
              </div>
            </div>
          `).join('')}
        </div>

        <div class="total">
          <div class="total-row">
            <span>TOTAL:</span>
            <span>${formatKwanza(totalAmount)}</span>
          </div>
        </div>

        <div class="footer">
          <div>Obrigado pela preferência!</div>
          <div class="print-time">
            Impresso em ${format(now, "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
          </div>
        </div>

        <script>
          window.onload = function() {
            window.print();
            setTimeout(function() {
              window.close();
            }, 100);
          };
        <\/script>
      </body>
      </html>
    `;

    printWindow.document.write(printContent);
    printWindow.document.close();
  };

  const totalPaymentAmount = payments.reduce((sum, p) => sum + parseFloat(p.amount || '0'), 0);
  const remainingAmount = selectedTable ? parseFloat(selectedTable.totalAmount || '0') - totalPaymentAmount : 0;
  const changeAmount = receivedAmount ? parseFloat(receivedAmount) - totalPaymentAmount : 0;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight" data-testid="text-page-title">Mesas Abertas</h1>
          <p className="text-muted-foreground">Gerencie sessões, pedidos e pagamentos das mesas ocupadas</p>
        </div>
        <Button onClick={() => refetch()} variant="outline" size="sm" data-testid="button-refresh">
          <RefreshCw className="w-4 h-4 mr-2" />
          Atualizar
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Mesas Ocupadas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" data-testid="text-occupied-count">{occupiedTables.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Pedidos Digitais</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <div className="text-2xl font-bold" data-testid="text-digital-count">{tablesWithDigitalOrders.length}</div>
              {tablesWithDigitalOrders.length > 0 && (
                <Badge variant="secondary" className="animate-pulse">
                  <Bell className="w-3 h-3 mr-1" />
                  Novos
                </Badge>
              )}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Aguardando Pagamento</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-500" data-testid="text-awaiting-payment">{tablesAwaitingPayment.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total em Aberto</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-500" data-testid="text-total-revenue">
              {totalRevenue.toLocaleString('pt-AO', { style: 'currency', currency: 'AOA' })}
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="all" data-testid="tab-all">
            Todas ({occupiedTables.length})
          </TabsTrigger>
          <TabsTrigger value="digital" data-testid="tab-digital">
            Pedidos Digitais ({tablesWithDigitalOrders.length})
          </TabsTrigger>
          <TabsTrigger value="payment" data-testid="tab-payment">
            Aguardando Pagamento ({tablesAwaitingPayment.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="mt-4">
          {filteredTables.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Users className="w-12 h-12 text-muted-foreground mb-4" />
                <p className="text-muted-foreground">Nenhuma mesa nesta categoria</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {filteredTables.map((table) => {
                const status = STATUS_CONFIG[table.status as keyof typeof STATUS_CONFIG] || STATUS_CONFIG.livre;
                const sessionDuration = table.lastActivity 
                  ? formatDistanceToNow(new Date(table.lastActivity), { locale: ptBR, addSuffix: false })
                  : null;
                const totalAmount = parseFloat(table.totalAmount || '0');

                return (
                  <Card 
                    key={table.id} 
                    className={`cursor-pointer transition-all hover-elevate ${selectedTable?.id === table.id ? 'ring-2 ring-primary' : ''}`}
                    onClick={() => setSelectedTable(table)}
                    data-testid={`card-table-${table.number}`}
                  >
                    <CardHeader className="pb-2">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-lg">Mesa {table.number}</CardTitle>
                        <Badge className={status.color}>{status.label}</Badge>
                      </div>
                      {table.customerName && (
                        <CardDescription>{table.customerName}</CardDescription>
                      )}
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="flex items-center justify-between text-sm">
                        <span className="flex items-center gap-1 text-muted-foreground">
                          <Users className="w-4 h-4" />
                          {table.customerCount || 0} pessoas
                        </span>
                        {sessionDuration && (
                          <span className="flex items-center gap-1 text-muted-foreground">
                            <Clock className="w-4 h-4" />
                            {sessionDuration}
                          </span>
                        )}
                      </div>
                      
                      {table.pendingOrdersCount && table.pendingOrdersCount > 0 && (
                        <div className="flex items-center gap-2">
                          <Badge variant="secondary" className="animate-pulse">
                            <ChefHat className="w-3 h-3 mr-1" />
                            {table.pendingOrdersCount} pedidos pendentes
                          </Badge>
                        </div>
                      )}

                      {table.hasDigitalOrders && (
                        <Badge variant="outline" className="border-blue-500 text-blue-500">
                          <Smartphone className="w-3 h-3 mr-1" />
                          Pedido Digital
                        </Badge>
                      )}

                      <Separator />

                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">Total</span>
                        <span className="text-lg font-bold">
                          {totalAmount.toLocaleString('pt-AO', { style: 'currency', currency: 'AOA' })}
                        </span>
                      </div>
                    </CardContent>
                    <CardFooter className="pt-0 gap-2">
                      <Button 
                        size="sm" 
                        variant="outline" 
                        className="flex-1"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedTable(table);
                        }}
                        data-testid={`button-view-table-${table.number}`}
                      >
                        <Receipt className="w-4 h-4 mr-1" />
                        Detalhes
                      </Button>
                      {totalAmount > 0 && (
                        <Button 
                          size="sm" 
                          className="flex-1"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedTable(table);
                            setPaymentDialogOpen(true);
                          }}
                          data-testid={`button-pay-table-${table.number}`}
                        >
                          <CreditCard className="w-4 h-4 mr-1" />
                          Pagar
                        </Button>
                      )}
                    </CardFooter>
                  </Card>
                );
              })}
            </div>
          )}
        </TabsContent>
      </Tabs>

      <Dialog open={paymentDialogOpen} onOpenChange={setPaymentDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Registrar Pagamento - Mesa {selectedTable?.number}</DialogTitle>
            <DialogDescription>
              Total: {parseFloat(selectedTable?.totalAmount || '0').toLocaleString('pt-AO', { style: 'currency', currency: 'AOA' })}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label>Dividir pagamento</Label>
              <Button 
                variant={splitPaymentMode ? 'default' : 'outline'} 
                size="sm"
                onClick={() => setSplitPaymentMode(!splitPaymentMode)}
                data-testid="button-split-payment"
              >
                <Split className="w-4 h-4 mr-1" />
                {splitPaymentMode ? 'Ativado' : 'Desativado'}
              </Button>
            </div>

            <ScrollArea className="max-h-[300px]">
              <div className="space-y-3">
                {payments.map((payment, index) => (
                  <div key={index} className="flex items-end gap-2">
                    <div className="flex-1">
                      <Label>Método</Label>
                      <Select 
                        value={payment.method} 
                        onValueChange={(v) => handlePaymentChange(index, 'method', v)}
                      >
                        <SelectTrigger data-testid={`select-payment-method-${index}`}>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {PAYMENT_METHODS.map(m => (
                            <SelectItem key={m.value} value={m.value}>
                              <div className="flex items-center gap-2">
                                <m.icon className="w-4 h-4" />
                                {m.label}
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="flex-1">
                      <Label>Valor</Label>
                      <Input
                        type="number"
                        placeholder="0.00"
                        value={payment.amount}
                        onChange={(e) => handlePaymentChange(index, 'amount', e.target.value)}
                        data-testid={`input-payment-amount-${index}`}
                      />
                    </div>
                    {splitPaymentMode && payments.length > 1 && (
                      <Button 
                        variant="ghost" 
                        size="icon"
                        onClick={() => handleRemovePayment(index)}
                        data-testid={`button-remove-payment-${index}`}
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            </ScrollArea>

            {splitPaymentMode && (
              <Button variant="outline" size="sm" onClick={handleAddPayment} data-testid="button-add-payment">
                <Plus className="w-4 h-4 mr-1" />
                Adicionar pagamento
              </Button>
            )}

            {payments.some(p => p.method === 'dinheiro') && (
              <div>
                <Label>Valor Recebido (Dinheiro)</Label>
                <Input
                  type="number"
                  placeholder="0.00"
                  value={receivedAmount}
                  onChange={(e) => setReceivedAmount(e.target.value)}
                  data-testid="input-received-amount"
                />
                {changeAmount > 0 && (
                  <p className="text-sm text-green-500 mt-1">
                    Troco: {changeAmount.toLocaleString('pt-AO', { style: 'currency', currency: 'AOA' })}
                  </p>
                )}
              </div>
            )}

            <Separator />

            <div className="flex items-center justify-between text-lg font-bold">
              <span>Total Pagamento:</span>
              <span className={totalPaymentAmount >= parseFloat(selectedTable?.totalAmount || '0') ? 'text-green-500' : 'text-amber-500'}>
                {totalPaymentAmount.toLocaleString('pt-AO', { style: 'currency', currency: 'AOA' })}
              </span>
            </div>

            {remainingAmount > 0 && (
              <div className="flex items-center gap-2 p-2 bg-amber-500/10 rounded-md">
                <AlertCircle className="w-4 h-4 text-amber-500" />
                <span className="text-sm text-amber-500">
                  Restante: {remainingAmount.toLocaleString('pt-AO', { style: 'currency', currency: 'AOA' })}
                </span>
              </div>
            )}
          </div>

          <DialogFooter className="gap-2 flex-wrap">
            <Button variant="outline" onClick={() => setPaymentDialogOpen(false)}>
              Cancelar
            </Button>
            <Button 
              variant="outline"
              onClick={handlePrintBill}
              data-testid="button-print-bill"
            >
              <Printer className="w-4 h-4 mr-1" />
              Imprimir Conta
            </Button>
            <Button 
              onClick={handleRecordPayment}
              disabled={totalPaymentAmount <= 0 || recordPaymentMutation.isPending}
              data-testid="button-confirm-payment"
            >
              {recordPaymentMutation.isPending ? (
                <RefreshCw className="w-4 h-4 mr-1 animate-spin" />
              ) : (
                <CheckCircle className="w-4 h-4 mr-1" />
              )}
              Confirmar Pagamento
            </Button>
            {remainingAmount <= 0 && totalPaymentAmount >= parseFloat(selectedTable?.totalAmount || '0') && (
              <Button 
                variant="secondary"
                onClick={handleCloseSession}
                disabled={closeSessionMutation.isPending}
                data-testid="button-close-session"
              >
                Fechar Mesa
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
