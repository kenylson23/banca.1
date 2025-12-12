import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { 
  Users, 
  Clock, 
  CreditCard, 
  Receipt, 
  ChefHat,
  Bell,
  Smartphone,
  RefreshCw
} from 'lucide-react';
import { formatKwanza } from '@/lib/formatters';
import { CheckoutDialog } from '@/components/CheckoutDialog';
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

export default function OpenTables() {
  const [selectedTable, setSelectedTable] = useState<TableWithDetails | null>(null);
  const [paymentDialogOpen, setPaymentDialogOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('all');

  const { data: tables = [], isLoading, refetch } = useQuery<TableWithDetails[]>({
    queryKey: ['/api/tables/open'],
    refetchInterval: 10000,
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

      <CheckoutDialog
        open={paymentDialogOpen}
        onOpenChange={setPaymentDialogOpen}
        table={selectedTable}
        onCheckoutComplete={() => {
          setPaymentDialogOpen(false);
          setSelectedTable(null);
          refetch();
        }}
      />
    </div>
  );
}
