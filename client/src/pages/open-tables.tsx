import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { formatDistanceToNow, format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { TubelightNavBar } from '@/components/ui/tubelight-navbar';
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
import { TablesIcon } from '@/components/custom-icons';
import { formatKwanza } from '@/lib/formatters';
import { TableCheckoutDialog } from '@/components/tables/TableCheckoutDialog';
import { TableDetailsDialog } from '@/components/TableDetailsDialog';
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
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'all' | 'digital' | 'payment'>('all');

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
    <div className="space-y-6 p-4 sm:p-6 lg:p-8">
      {/* Header com gradiente */}
      <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-blue-500 via-blue-600 to-indigo-700 p-6 sm:p-8 shadow-lg">
        <div className="absolute inset-0 bg-grid-white/10 [mask-image:linear-gradient(0deg,transparent,black)]" />
        <div className="relative flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="space-y-1">
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight text-white" data-testid="text-page-title">
              Mesas Abertas
            </h1>
            <p className="text-blue-100 text-sm sm:text-base">
              Gerencie sessões, pedidos e pagamentos das mesas ocupadas
            </p>
          </div>
          <Button 
            onClick={() => refetch()} 
            variant="secondary" 
            size="sm"
            className="self-start sm:self-auto bg-white/20 hover:bg-white/30 text-white border-white/30 backdrop-blur-sm"
            data-testid="button-refresh"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Atualizar
          </Button>
        </div>
      </div>

      {/* KPI Cards modernos */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="relative overflow-hidden border-l-4 border-l-blue-500 hover:shadow-lg transition-shadow">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-muted-foreground">Mesas Ocupadas</CardTitle>
              <div className="p-2 bg-blue-500/10 rounded-lg">
                <Users className="w-5 h-5 text-blue-500" />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold" data-testid="text-occupied-count">{occupiedTables.length}</div>
            <p className="text-xs text-muted-foreground mt-1">mesas ativas</p>
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden border-l-4 border-l-cyan-500 hover:shadow-lg transition-shadow">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-muted-foreground">Pedidos Digitais</CardTitle>
              <div className="p-2 bg-cyan-500/10 rounded-lg">
                <Smartphone className="w-5 h-5 text-cyan-500" />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="text-3xl font-bold text-cyan-600" data-testid="text-digital-count">{tablesWithDigitalOrders.length}</div>
              {tablesWithDigitalOrders.length > 0 && (
                <Badge variant="destructive" className="animate-pulse">
                  <Bell className="w-3 h-3 mr-1" />
                  Novos
                </Badge>
              )}
            </div>
            <p className="text-xs text-muted-foreground mt-1">via QR Code</p>
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden border-l-4 border-l-orange-500 hover:shadow-lg transition-shadow">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-muted-foreground">Aguardando Pagamento</CardTitle>
              <div className="p-2 bg-orange-500/10 rounded-lg">
                <CreditCard className="w-5 h-5 text-orange-500" />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-orange-600" data-testid="text-awaiting-payment">{tablesAwaitingPayment.length}</div>
            <p className="text-xs text-muted-foreground mt-1">prontas para fechar</p>
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden border-l-4 border-l-green-500 hover:shadow-lg transition-shadow">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total em Aberto</CardTitle>
              <div className="p-2 bg-green-500/10 rounded-lg">
                <Receipt className="w-5 h-5 text-green-500" />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl lg:text-3xl font-bold text-green-600" data-testid="text-total-revenue">
              {totalRevenue.toLocaleString('pt-AO', { style: 'currency', currency: 'AOA' })}
            </div>
            <p className="text-xs text-muted-foreground mt-1">receita pendente</p>
          </CardContent>
        </Card>
      </div>

      {/* Navbar igual ao menu */}
      <div className="flex justify-center">
        <TubelightNavBar
          items={[
            { 
              name: `Todas (${occupiedTables.length})`, 
              url: '#', 
              icon: Users 
            },
            { 
              name: `Pedidos Digitais (${tablesWithDigitalOrders.length})`, 
              url: '#', 
              icon: Smartphone 
            },
            { 
              name: `Aguardando (${tablesAwaitingPayment.length})`, 
              url: '#', 
              icon: CreditCard 
            },
          ]}
          activeItem={
            activeTab === 'all' ? `Todas (${occupiedTables.length})` :
            activeTab === 'digital' ? `Pedidos Digitais (${tablesWithDigitalOrders.length})` :
            `Aguardando (${tablesAwaitingPayment.length})`
          }
          onItemClick={(item) => {
            if (item.name.startsWith('Todas')) setActiveTab('all');
            else if (item.name.startsWith('Pedidos')) setActiveTab('digital');
            else if (item.name.startsWith('Aguardando')) setActiveTab('payment');
          }}
          className="relative"
        />
      </div>

      <div className="mt-6">
          {filteredTables.length === 0 ? (
            <Card className="border-dashed border-2">
              <CardContent className="flex flex-col items-center justify-center py-16">
                <div className="p-4 bg-muted rounded-full mb-4">
                  <Users className="w-12 h-12 text-muted-foreground" />
                </div>
                <h3 className="font-semibold text-lg mb-1">Nenhuma mesa nesta categoria</h3>
                <p className="text-sm text-muted-foreground">As mesas aparecerão aqui quando ocupadas</p>
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
                        {table.lastActivity && (
                          <div className="flex flex-col items-end text-xs text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {format(new Date(table.lastActivity), "HH:mm", { locale: ptBR })}
                            </span>
                            {sessionDuration && (
                              <span className="text-muted-foreground/70">
                                {sessionDuration}
                              </span>
                            )}
                          </div>
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
                          setDetailsDialogOpen(true);
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
      </div>

      {selectedTable && (
        <TableDetailsDialog
          open={detailsDialogOpen}
          onOpenChange={setDetailsDialogOpen}
          table={selectedTable}
        />
      )}

      <TableCheckoutDialog
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
