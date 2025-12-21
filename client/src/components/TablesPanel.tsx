import { useState, useCallback } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Plus, Download, QrCode as QrCodeIcon, LayoutGrid, Check, Clock, DollarSign, Users, Search, List, Map } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { TubelightNavBar } from "@/components/ui/tubelight-navbar";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { isUnauthorizedError } from "@/lib/authUtils";
import { useWebSocket } from "@/hooks/useWebSocket";
import { TableCard } from "@/components/TableCard";
import { TableDetailsDialog } from "@/components/TableDetailsDialog";
import type { Table } from "@shared/schema";

export function TablesPanel() {
  const { toast } = useToast();
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [qrDialogTable, setQrDialogTable] = useState<Table | null>(null);
  const [deleteTableId, setDeleteTableId] = useState<string | null>(null);
  const [tableNumber, setTableNumber] = useState("");
  const [tableCapacity, setTableCapacity] = useState("");
  const [tableArea, setTableArea] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [areaFilter, setAreaFilter] = useState<string>('all');
  const [selectedTable, setSelectedTable] = useState<(Table & { orders?: any[] }) | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [showFreeTables, setShowFreeTables] = useState(true);
  const [viewMode, setViewMode] = useState<'grid' | 'list' | 'map'>('grid');

  const navItems = [
    { name: 'Todas', url: '#', icon: LayoutGrid },
    { name: 'Livres', url: '#', icon: Check },
    { name: 'Ocupadas', url: '#', icon: Users },
    { name: 'Em Andamento', url: '#', icon: Clock },
    { name: 'Aguardando', url: '#', icon: DollarSign },
  ];

  const handleNavClick = (item: typeof navItems[0]) => {
    const filterMap: Record<string, string> = {
      'Todas': 'all',
      'Livres': 'livre',
      'Ocupadas': 'ocupada',
      'Em Andamento': 'em_andamento',
      'Aguardando': 'aguardando_pagamento',
    };
    setStatusFilter(filterMap[item.name] || 'all');
  };

  const { data: tables, isLoading } = useQuery<Array<Table & { orders?: any[]; guestsAwaitingBill?: number; guestCount?: number }>>({
    queryKey: ["/api/tables/with-orders"],
  });

  const handleWebSocketMessage = useCallback((message: any) => {
    if (
      message.type === 'table_created' ||
      message.type === 'table_deleted' ||
      message.type === 'table_status_updated' ||
      message.type === 'table_session_started' ||
      message.type === 'table_session_ended' ||
      message.type === 'table_payment_added' ||
      message.type === 'new_order' ||
      message.type === 'order_status_updated' ||
      message.type === 'guest_requested_bill' ||
      message.type === 'guest_status_updated'
    ) {
      queryClient.invalidateQueries({ queryKey: ["/api/tables/with-orders"] });
    }
  }, []);

  useWebSocket(handleWebSocketMessage);

  const createMutation = useMutation({
    mutationFn: async (data: { number: number; capacity?: number; area?: string }) => {
      await apiRequest("POST", "/api/tables", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/tables/with-orders"] });
      toast({
        title: "Mesa criada",
        description: "A mesa foi criada com sucesso e o QR code foi gerado.",
      });
      setIsCreateOpen(false);
      setTableNumber("");
      setTableCapacity("");
      setTableArea("");
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Não autorizado",
          description: "Você foi desconectado. Fazendo login novamente...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
        return;
      }
      toast({
        title: "Erro",
        description: error.message || "Não foi possível criar a mesa.",
        variant: "destructive",
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiRequest("DELETE", `/api/tables/${id}`, undefined);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/tables/with-orders"] });
      toast({
        title: "Mesa excluída",
        description: "A mesa foi excluída com sucesso.",
      });
      setDeleteTableId(null);
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Não autorizado",
          description: "Você foi desconectado. Fazendo login novamente...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
        return;
      }
      toast({
        title: "Erro",
        description: error.message || "Não foi possível excluir a mesa.",
        variant: "destructive",
      });
    },
  });

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    const number = parseInt(tableNumber);
    if (isNaN(number) || number <= 0) {
      toast({
        title: "Número inválido",
        description: "Por favor, insira um número de mesa válido.",
        variant: "destructive",
      });
      return;
    }
    
    const capacity = tableCapacity ? parseInt(tableCapacity) : undefined;
    if (capacity !== undefined && (isNaN(capacity) || capacity <= 0)) {
      toast({
        title: "Capacidade inválida",
        description: "Por favor, insira uma capacidade válida.",
        variant: "destructive",
      });
      return;
    }

    const area = tableArea.trim() || undefined;
    
    createMutation.mutate({ number, capacity, area });
  };

  const handleDownloadQR = (table: Table) => {
    const link = document.createElement("a");
    link.href = table.qrCode;
    link.download = `mesa-${table.number}-qrcode.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast({
      title: "QR Code baixado",
      description: `QR Code da mesa ${table.number} foi baixado com sucesso.`,
    });
  };

  const filteredTables = tables?.filter((table) => {
    const matchesStatus = statusFilter === 'all' || table.status === statusFilter;
    const matchesArea = areaFilter === 'all' || (areaFilter === 'sem_area' ? !table.area : table.area === areaFilter);
    
    // Filtro para ocultar mesas livres
    const matchesFreeTables = showFreeTables || table.status !== 'livre';
    
    // Busca por número da mesa, nome do cliente ou área
    const matchesSearch = !searchQuery || 
      table.number.toString().includes(searchQuery) ||
      table.customerName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      table.area?.toLowerCase().includes(searchQuery.toLowerCase());
    
    return matchesStatus && matchesArea && matchesSearch && matchesFreeTables;
  }) || [];

  const areas = Array.from(new Set(tables?.map(t => t.area).filter((a): a is string => Boolean(a)) || [])).sort();
  
  const groupedTables = filteredTables.reduce((acc, table) => {
    const areaKey = table.area || 'Sem Área';
    if (!acc[areaKey]) {
      acc[areaKey] = [];
    }
    acc[areaKey].push(table);
    return acc;
  }, {} as Record<string, typeof filteredTables>);

  // KPIs
  const occupiedTables = tables?.filter(t => t.status !== 'livre') || [];
  const tablesWithDigitalOrders = occupiedTables.filter(t => t.orders && t.orders.length > 0);
  const tablesAwaitingPayment = occupiedTables.filter(t => t.status === 'aguardando_pagamento');
  const totalRevenue = occupiedTables.reduce((sum, t) => sum + parseFloat(t.totalAmount || '0'), 0);

  // Analytics Avançados
  const averageTableValue = occupiedTables.length > 0 
    ? totalRevenue / occupiedTables.length 
    : 0;
  
  const occupancyRate = tables && tables.length > 0 
    ? (occupiedTables.length / tables.length) * 100 
    : 0;

  const averageSessionDuration = occupiedTables.length > 0
    ? occupiedTables.reduce((sum, t) => {
        if (!t.lastActivity) return sum;
        const duration = Date.now() - new Date(t.lastActivity).getTime();
        return sum + duration;
      }, 0) / occupiedTables.length
    : 0;

  const formatDuration = (ms: number) => {
    const minutes = Math.floor(ms / (1000 * 60));
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    
    if (hours > 0) {
      return `${hours}h ${remainingMinutes}min`;
    }
    return `${minutes}min`;
  };

  const statusCounts = {
    all: tables?.length || 0,
    livre: tables?.filter(t => t.status === 'livre').length || 0,
    ocupada: tables?.filter(t => t.status === 'ocupada').length || 0,
    em_andamento: tables?.filter(t => t.status === 'em_andamento').length || 0,
    aguardando_pagamento: tables?.filter(t => t.status === 'aguardando_pagamento').length || 0,
  };

  return (
    <div className="space-y-6">
      {/* Botão de criar mesa - sempre visível */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-background">
        <div className="flex flex-col sm:flex-row gap-4 flex-1">
          <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
            <DialogTrigger asChild>
              <Button 
                data-testid="button-create-table" 
                className="w-full sm:w-auto shadow-md" 
                variant="default" 
                size="lg"
              >
                <Plus className="h-4 w-4 mr-2" />
                Nova Mesa
              </Button>
            </DialogTrigger>
          <DialogContent>
            <form onSubmit={handleCreate}>
              <DialogHeader>
                <DialogTitle>Criar Nova Mesa</DialogTitle>
                <DialogDescription>
                  Digite o número da mesa e a capacidade. Um QR code único será gerado automaticamente.
                </DialogDescription>
              </DialogHeader>
              <div className="py-4 space-y-4">
                <div>
                  <Label htmlFor="tableNumber">Número da Mesa</Label>
                  <Input
                    id="tableNumber"
                    type="number"
                    min="1"
                    placeholder="Ex: 1"
                    value={tableNumber}
                    onChange={(e) => setTableNumber(e.target.value)}
                    data-testid="input-table-number"
                    className="mt-2"
                  />
                </div>
                <div>
                  <Label htmlFor="tableCapacity">Capacidade (Pessoas)</Label>
                  <Input
                    id="tableCapacity"
                    type="number"
                    min="1"
                    placeholder="Ex: 4"
                    value={tableCapacity}
                    onChange={(e) => setTableCapacity(e.target.value)}
                    data-testid="input-table-capacity"
                    className="mt-2"
                  />
                </div>
                <div>
                  <Label htmlFor="tableArea">Área (Opcional)</Label>
                  <Input
                    id="tableArea"
                    type="text"
                    placeholder="Ex: Salão Principal, Terraço, VIP"
                    value={tableArea}
                    onChange={(e) => setTableArea(e.target.value)}
                    data-testid="input-table-area"
                    className="mt-2"
                  />
                </div>
              </div>
              <DialogFooter>
                <Button
                  type="submit"
                  disabled={createMutation.isPending}
                  data-testid="button-submit-table"
                >
                  {createMutation.isPending ? "Criando..." : "Criar Mesa"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
        
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por mesa, cliente ou área..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
            data-testid="input-search-tables"
          />
        </div>
        
        <div className="flex items-center gap-2">
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="showFreeTables"
              checked={showFreeTables}
              onChange={(e) => setShowFreeTables(e.target.checked)}
              className="h-4 w-4 rounded border-gray-300"
              data-testid="checkbox-show-free-tables"
            />
            <Label htmlFor="showFreeTables" className="cursor-pointer text-sm font-normal">
              Mostrar livres
            </Label>
          </div>
          
          <div className="flex items-center border rounded-md">
            <Button
              variant={viewMode === 'grid' ? 'secondary' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('grid')}
              data-testid="button-view-grid"
              className="rounded-r-none border-r"
            >
              <LayoutGrid className="h-4 w-4" />
            </Button>
            <Button
              variant={viewMode === 'list' ? 'secondary' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('list')}
              data-testid="button-view-list"
              className="rounded-none border-r"
            >
              <List className="h-4 w-4" />
            </Button>
            <Button
              variant={viewMode === 'map' ? 'secondary' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('map')}
              data-testid="button-view-map"
              className="rounded-l-none"
            >
              <Map className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
      </div>

      {/* KPIs Dashboard */}
      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Mesas Ocupadas</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold" data-testid="kpi-occupied-count">{occupiedTables.length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Com Pedidos</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-500" data-testid="kpi-with-orders">{tablesWithDigitalOrders.length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Aguardando Pagamento</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-500" data-testid="kpi-awaiting-payment">{tablesAwaitingPayment.length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total em Aberto</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-500" data-testid="kpi-total-revenue">
                {totalRevenue.toLocaleString('pt-AO', { style: 'currency', currency: 'AOA' })}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Analytics Avançados */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Ticket Médio</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-xl font-bold text-purple-600" data-testid="kpi-average-value">
                {averageTableValue.toLocaleString('pt-AO', { style: 'currency', currency: 'AOA' })}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Taxa de Ocupação</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-xl font-bold text-indigo-600" data-testid="kpi-occupancy-rate">
                {occupancyRate.toFixed(1)}%
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Tempo Médio</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-xl font-bold text-cyan-600" data-testid="kpi-average-duration">
                {formatDuration(averageSessionDuration)}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <div className="flex justify-center mb-6">
        <TubelightNavBar
          items={navItems}
          activeItem={
            statusFilter === 'all' ? 'Todas' :
            statusFilter === 'livre' ? 'Livres' :
            statusFilter === 'ocupada' ? 'Ocupadas' :
            statusFilter === 'em_andamento' ? 'Em Andamento' :
            'Aguardando'
          }
          onItemClick={handleNavClick}
          className="relative"
        />
      </div>

      <div className="space-y-4">
        {areas.length > 0 && (
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-muted-foreground">Filtrar por área:</span>
            <Select value={areaFilter} onValueChange={setAreaFilter}>
              <SelectTrigger className="w-[200px]" data-testid="select-area-filter">
                <SelectValue placeholder="Todas as áreas" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all" data-testid="area-filter-all">Todas as áreas</SelectItem>
                {areas.map((area) => (
                  <SelectItem key={area} value={area} data-testid={`area-filter-${area}`}>
                    {area}
                  </SelectItem>
                ))}
                <SelectItem value="sem_area" data-testid="area-filter-sem-area">Sem área definida</SelectItem>
              </SelectContent>
            </Select>
          </div>
        )}
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
          {[...Array(8)].map((_, i) => (
            <Skeleton key={i} className="h-64" />
          ))}
        </div>
      ) : filteredTables.length > 0 ? (
        <div className="space-y-8">
          {Object.entries(groupedTables).sort(([areaA], [areaB]) => {
            if (areaA === 'Sem Área') return 1;
            if (areaB === 'Sem Área') return -1;
            return areaA.localeCompare(areaB);
          }).map(([area, areaTables]) => (
            <div key={area} className="space-y-4">
              <div className="flex items-center gap-3">
                <h3 className="text-lg font-semibold text-foreground" data-testid={`area-title-${area}`}>
                  {area}
                </h3>
                <Badge variant="outline" data-testid={`area-count-${area}`}>
                  {areaTables.length} {areaTables.length === 1 ? 'mesa' : 'mesas'}
                </Badge>
              </div>
              {viewMode === 'grid' ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
                  {areaTables.map((table) => (
                    <TableCard
                      key={table.id}
                      table={table}
                      onClick={() => setSelectedTable(table)}
                      onShowQrCode={setQrDialogTable}
                    />
                  ))}
                </div>
              ) : viewMode === 'list' ? (
                <div className="space-y-2">
                  {areaTables.map((table) => (
                    <Card 
                      key={table.id} 
                      className="cursor-pointer hover:bg-accent transition-colors"
                      onClick={() => setSelectedTable(table)}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4 flex-1">
                            <div className="font-semibold text-lg">Mesa {table.number}</div>
                            <Badge variant={
                              table.status === 'livre' ? 'secondary' :
                              table.status === 'ocupada' ? 'default' :
                              table.status === 'em_andamento' ? 'default' :
                              'destructive'
                            }>
                              {table.status === 'livre' ? 'Livre' :
                               table.status === 'ocupada' ? 'Ocupada' :
                               table.status === 'em_andamento' ? 'Em Andamento' :
                               'Aguardando Pagamento'}
                            </Badge>
                            {table.customerName && (
                              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                <Users className="h-4 w-4" />
                                <span>{table.customerName}</span>
                              </div>
                            )}
                            {table.customerCount && (
                              <span className="text-sm text-muted-foreground">
                                {table.customerCount} {table.customerCount === 1 ? 'pessoa' : 'pessoas'}
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-4">
                            {table.totalAmount && parseFloat(table.totalAmount) > 0 && (
                              <div className="text-lg font-bold text-green-600">
                                {parseFloat(table.totalAmount).toLocaleString('pt-AO', { style: 'currency', currency: 'AOA' })}
                              </div>
                            )}
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                setQrDialogTable(table);
                              }}
                            >
                              <QrCodeIcon className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                // Map View
                <div className="relative bg-muted/30 rounded-lg p-8 min-h-[600px] border-2 border-dashed">
                  <div className="absolute top-4 left-4 text-sm text-muted-foreground bg-background px-3 py-1 rounded-md shadow">
                    Vista do Layout
                  </div>
                  <div className="grid grid-cols-8 gap-4 h-full">
                    {areaTables.map((table) => {
                      const getStatusColor = () => {
                        if (table.status === 'livre') return 'bg-green-100 border-green-400 hover:bg-green-200';
                        if (table.status === 'ocupada') return 'bg-orange-100 border-orange-400 hover:bg-orange-200';
                        if (table.status === 'em_andamento') return 'bg-blue-100 border-blue-400 hover:bg-blue-200';
                        return 'bg-red-100 border-red-400 hover:bg-red-200';
                      };
                      
                      return (
                        <div
                          key={table.id}
                          className={`relative cursor-pointer border-2 rounded-lg p-4 transition-all hover:shadow-lg ${getStatusColor()}`}
                          onClick={() => setSelectedTable(table)}
                          style={{
                            gridColumn: `span ${Math.min(2, Math.max(1, Math.ceil((table.capacity || 4) / 2)))}`,
                          }}
                          data-testid={`map-table-${table.number}`}
                        >
                          <div className="flex flex-col items-center justify-center h-full">
                            <div className="text-2xl font-bold mb-1">
                              {table.number}
                            </div>
                            {table.customerName && (
                              <div className="text-xs text-center truncate max-w-full">
                                {table.customerName}
                              </div>
                            )}
                            {table.customerCount && (
                              <div className="flex items-center gap-1 text-xs mt-1">
                                <Users className="h-3 w-3" />
                                <span>{table.customerCount}</span>
                              </div>
                            )}
                            {table.totalAmount && parseFloat(table.totalAmount) > 0 && (
                              <div className="text-xs font-semibold mt-1 text-green-700">
                                {parseFloat(table.totalAmount).toLocaleString('pt-AO', { 
                                  style: 'currency', 
                                  currency: 'AOA',
                                  minimumFractionDigits: 0,
                                  maximumFractionDigits: 0
                                })}
                              </div>
                            )}
                          </div>
                          {table.status === 'aguardando_pagamento' && (
                            <div className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold">
                              !
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <QrCodeIcon className="h-16 w-16 text-muted-foreground mb-4" />
            <p className="text-xl font-semibold text-foreground mb-2">
              {statusFilter === 'all' ? 'Nenhuma mesa cadastrada' : 'Nenhuma mesa neste status'}
            </p>
            <p className="text-muted-foreground mb-6">
              {statusFilter === 'all' 
                ? 'Crie sua primeira mesa para começar a gerar QR codes'
                : 'Não há mesas com este status no momento'
              }
            </p>
            {statusFilter === 'all' && (
              <Button onClick={() => setIsCreateOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Criar Primeira Mesa
              </Button>
            )}
          </CardContent>
        </Card>
      )}

      <Dialog open={!!qrDialogTable} onOpenChange={() => setQrDialogTable(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>QR Code - Mesa {qrDialogTable?.number}</DialogTitle>
            <DialogDescription>
              Escaneie este QR code para acessar o menu da mesa
            </DialogDescription>
          </DialogHeader>
          <div className="flex items-center justify-center p-6">
            <img
              src={qrDialogTable?.qrCode}
              alt={`QR Code Mesa ${qrDialogTable?.number}`}
              className="w-full max-w-sm"
            />
          </div>
          <DialogFooter>
            <Button onClick={() => qrDialogTable && handleDownloadQR(qrDialogTable)}>
              <Download className="h-4 w-4 mr-2" />
              Baixar QR Code
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!deleteTableId} onOpenChange={() => setDeleteTableId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir esta mesa? Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteTableId && deleteMutation.mutate(deleteTableId)}
              disabled={deleteMutation.isPending}
            >
              {deleteMutation.isPending ? "Excluindo..." : "Excluir"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <TableDetailsDialog
        open={!!selectedTable}
        onOpenChange={(open) => !open && setSelectedTable(null)}
        table={selectedTable}
        onDelete={setDeleteTableId}
        allTables={filteredTables}
        onNavigate={setSelectedTable}
      />
    </div>
  );
}
