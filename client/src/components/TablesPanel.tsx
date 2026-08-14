import { useState, useCallback } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Plus, Download, QrCode as QrCodeIcon, LayoutGrid, Check, Clock, DollarSign, Users, Search, List, Map, Camera } from "lucide-react";
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
import { TableDialogWrapper } from '@/components/table-dialog/TableDialogWrapper';
import { QrScannerDialog } from '@/components/QrScannerDialog';
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
  const [isQrScannerOpen, setIsQrScannerOpen] = useState(false);

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
    staleTime: 10000, // 10 seconds
    gcTime: 300000, // 5 minutes cache
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

  const handleQrScan = useCallback((scannedValue: string) => {
    try {
      const url = new URL(scannedValue);
      const tableNumber = url.pathname.split('/').filter(Boolean).pop();
      const restaurantId = url.searchParams.get('r');

      if (!tableNumber) {
        toast({
          title: 'QR Code inválido',
          description: 'Não foi possível identificar o número da mesa.',
          variant: 'destructive',
        });
        return;
      }

      const foundTable = tables?.find(t => {
        if (restaurantId && t.restaurantId !== restaurantId) return false;
        return String(t.number) === tableNumber;
      });

      if (foundTable) {
        setSelectedTable(foundTable);
        toast({
          title: 'Mesa encontrada!',
          description: `Mesa ${foundTable.number} aberta com sucesso.`,
        });
      } else {
        toast({
          title: 'Mesa não encontrada',
          description: `A mesa ${tableNumber} não foi encontrada neste restaurante.`,
          variant: 'destructive',
        });
      }
    } catch {
      toast({
        title: 'QR Code inválido',
        description: 'O código escaneado não é uma URL válida.',
        variant: 'destructive',
      });
    }
  }, [tables, toast]);

  return (
    <div className="space-y-6">
      {/* Botão de criar mesa - sempre visível */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-background">
        <div className="flex flex-col sm:flex-row gap-4 flex-1">
          <Button 
            data-testid="button-scan-qr-table" 
            onClick={() => setIsQrScannerOpen(true)}
            className="w-full sm:w-auto bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white shadow-lg shadow-emerald-500/50 hover:shadow-xl hover:shadow-emerald-500/60 transition-all duration-300 font-semibold"
            size="lg"
          >
            <Camera className="h-5 w-5 mr-2" />
            Escanear QR Code
          </Button>
          <Button
            onClick={() => regenerateQrMutation.mutate()}
            disabled={regenerateQrMutation.isPending}
            variant="outline"
            size="lg"
            className="w-full sm:w-auto border-orange-300 text-orange-700 hover:bg-orange-50 font-semibold"
            title="Corrigir QR Codes com URL errado (use se os QR Codes não estão a abrir corretamente)"
            data-testid="button-regenerate-qr-codes"
          >
            <QrCodeIcon className="h-5 w-5 mr-2" />
            {regenerateQrMutation.isPending ? "A regenerar..." : "Corrigir QR Codes"}
          </Button>
          <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
            <DialogTrigger asChild>
              <Button 
                data-testid="button-create-table" 
                className="w-full sm:w-auto bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white shadow-lg shadow-indigo-500/50 hover:shadow-xl hover:shadow-indigo-500/60 transition-all duration-300 font-semibold" 
                size="lg"
              >
                <Plus className="h-5 w-5 mr-2" />
                Nova Mesa
              </Button>
            </DialogTrigger>
          <DialogContent className="sm:max-w-[600px]">
            <form onSubmit={handleCreate}>
              <DialogHeader>
                <div className="flex items-center gap-3 mb-2">
                  <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-500 flex items-center justify-center">
                    <Plus className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <DialogTitle className="text-2xl">Criar Nova Mesa</DialogTitle>
                    <DialogDescription>
                      Configure os detalhes da mesa para o seu restaurante
                    </DialogDescription>
                  </div>
                </div>
              </DialogHeader>
              
              <div className="py-6 space-y-6">
                {/* Número da Mesa */}
                <div className="space-y-3">
                  <Label htmlFor="tableNumber" className="text-base font-semibold flex items-center gap-2">
                    <div className="h-6 w-6 rounded-full bg-indigo-100 dark:bg-indigo-900 flex items-center justify-center text-xs font-bold text-indigo-600 dark:text-indigo-400">
                      1
                    </div>
                    Número da Mesa
                  </Label>
                  <Input
                    id="tableNumber"
                    type="number"
                    min="1"
                    placeholder="Digite o número da mesa..."
                    value={tableNumber}
                    onChange={(e) => setTableNumber(e.target.value)}
                    data-testid="input-table-number"
                    className="h-12 text-lg"
                  />
                  <p className="text-xs text-muted-foreground">
                    Escolha um número único para identificar a mesa
                  </p>
                </div>

                {/* Capacidade com botões rápidos */}
                <div className="space-y-3">
                  <Label htmlFor="tableCapacity" className="text-base font-semibold flex items-center gap-2">
                    <div className="h-6 w-6 rounded-full bg-violet-100 dark:bg-violet-900 flex items-center justify-center text-xs font-bold text-violet-600 dark:text-violet-400">
                      2
                    </div>
                    Capacidade
                  </Label>
                  <div className="grid grid-cols-4 gap-2 mb-3">
                    {[2, 4, 6, 8].map((capacity) => (
                      <button
                        key={capacity}
                        type="button"
                        onClick={() => setTableCapacity(String(capacity))}
                        className={`h-12 rounded-lg border-2 font-semibold transition-all hover:scale-105 ${
                          tableCapacity === String(capacity)
                            ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-950 text-indigo-600'
                            : 'border-slate-200 dark:border-slate-700 hover:border-indigo-300'
                        }`}
                      >
                        {capacity} pessoas
                      </button>
                    ))}
                  </div>
                  <Input
                    id="tableCapacity"
                    type="number"
                    min="1"
                    placeholder="Ou digite um valor personalizado..."
                    value={tableCapacity}
                    onChange={(e) => setTableCapacity(e.target.value)}
                    data-testid="input-table-capacity"
                    className="h-12"
                  />
                </div>

                {/* Área */}
                <div className="space-y-3">
                  <Label htmlFor="tableArea" className="text-base font-semibold flex items-center gap-2">
                    <div className="h-6 w-6 rounded-full bg-emerald-100 dark:bg-emerald-900 flex items-center justify-center text-xs font-bold text-emerald-600 dark:text-emerald-400">
                      3
                    </div>
                    Área (Opcional)
                  </Label>
                  <Input
                    id="tableArea"
                    type="text"
                    placeholder="Ex: Salão Principal, Terraço, VIP..."
                    value={tableArea}
                    onChange={(e) => setTableArea(e.target.value)}
                    data-testid="input-table-area"
                    className="h-12"
                  />
                </div>

                {/* Info Card */}
                <div className="rounded-lg border border-indigo-200 dark:border-indigo-800 bg-indigo-50 dark:bg-indigo-950 p-4">
                  <div className="flex items-start gap-3">
                    <div className="h-8 w-8 rounded-full bg-indigo-500 flex items-center justify-center flex-shrink-0">
                      <svg className="h-4 w-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <div className="text-sm">
                      <p className="font-medium text-indigo-900 dark:text-indigo-100 mb-1">
                        QR Code Automático
                      </p>
                      <p className="text-indigo-700 dark:text-indigo-300">
                        Um QR code único será gerado automaticamente para esta mesa, permitindo que clientes façam pedidos diretamente.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <DialogFooter className="gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setTableNumber("");
                    setTableCapacity("");
                    setTableArea("");
                  }}
                  disabled={createMutation.isPending}
                >
                  Limpar
                </Button>
                <Button
                  type="submit"
                  disabled={createMutation.isPending || !tableNumber || !tableCapacity}
                  data-testid="button-submit-table"
                  className="bg-gradient-to-r from-indigo-500 to-violet-500 hover:from-indigo-600 hover:to-violet-600"
                >
                  {createMutation.isPending ? (
                    <>
                      <svg className="animate-spin h-4 w-4 mr-2" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      Criando Mesa...
                    </>
                  ) : (
                    <>
                      <Plus className="h-4 w-4 mr-2" />
                      Criar Mesa
                    </>
                  )}
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
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Mesas Livres</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600" data-testid="kpi-free-count">{statusCounts.livre}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Mesas Ocupadas</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600" data-testid="kpi-occupied-count">{occupiedTables.length}</div>
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
              <div className="text-2xl font-bold text-emerald-600" data-testid="kpi-total-revenue">
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
                      onClick={() => {
                        setSelectedTable(table);
                      }}
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

      <QrScannerDialog
        open={isQrScannerOpen}
        onOpenChange={setIsQrScannerOpen}
        onScan={handleQrScan}
      />

      {/* Usando TableDialogWrapper (auto-detecta mobile/desktop) */}
      <TableDialogWrapper
        open={!!selectedTable}
        onOpenChange={(open) => !open && setSelectedTable(null)}
        table={selectedTable}
        allTables={filteredTables}
        onNavigate={setSelectedTable}
      />
    </div>
  );
}
