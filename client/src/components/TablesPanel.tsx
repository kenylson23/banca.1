import { useState, useCallback } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Plus, Download, QrCode as QrCodeIcon, LayoutGrid, Check, Clock, DollarSign, Users } from "lucide-react";
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
    return matchesStatus && matchesArea;
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

  const statusCounts = {
    all: tables?.length || 0,
    livre: tables?.filter(t => t.status === 'livre').length || 0,
    ocupada: tables?.filter(t => t.status === 'ocupada').length || 0,
    em_andamento: tables?.filter(t => t.status === 'em_andamento').length || 0,
    aguardando_pagamento: tables?.filter(t => t.status === 'aguardando_pagamento').length || 0,
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild>
            <Button data-testid="button-create-table" className="w-full sm:w-auto">
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
      />
    </div>
  );
}
