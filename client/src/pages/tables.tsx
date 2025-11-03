import { useState, useEffect, useCallback } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Plus, Download, Trash2, QrCode as QrCodeIcon, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
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

export default function Tables() {
  const { toast } = useToast();
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [qrDialogTable, setQrDialogTable] = useState<Table | null>(null);
  const [deleteTableId, setDeleteTableId] = useState<string | null>(null);
  const [tableNumber, setTableNumber] = useState("");
  const [tableCapacity, setTableCapacity] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedTable, setSelectedTable] = useState<(Table & { orders?: any[] }) | null>(null);

  const { data: tables, isLoading } = useQuery<Array<Table & { orders?: any[] }>>({
    queryKey: ["/api/tables/with-orders"],
  });

  // WebSocket handler for real-time updates
  const handleWebSocketMessage = useCallback((message: any) => {
    if (
      message.type === 'table_created' ||
      message.type === 'table_deleted' ||
      message.type === 'table_status_updated' ||
      message.type === 'table_session_started' ||
      message.type === 'table_session_ended' ||
      message.type === 'table_payment_added' ||
      message.type === 'new_order' ||
      message.type === 'order_status_updated'
    ) {
      queryClient.invalidateQueries({ queryKey: ["/api/tables/with-orders"] });
    }
  }, []);

  useWebSocket(handleWebSocketMessage);

  const createMutation = useMutation({
    mutationFn: async (data: { number: number; capacity?: number }) => {
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
    
    createMutation.mutate({ number, capacity });
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
    if (statusFilter === 'all') return true;
    return table.status === statusFilter;
  }) || [];

  const statusCounts = {
    all: tables?.length || 0,
    livre: tables?.filter(t => t.status === 'livre').length || 0,
    ocupada: tables?.filter(t => t.status === 'ocupada').length || 0,
    em_andamento: tables?.filter(t => t.status === 'em_andamento').length || 0,
    aguardando_pagamento: tables?.filter(t => t.status === 'aguardando_pagamento').length || 0,
  };

  return (
    <div className="space-y-6 sm:space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-foreground">Controle de Mesas</h1>
          <p className="text-sm sm:text-base text-muted-foreground mt-1 sm:mt-2">
            Gerencie mesas em tempo real - ocupação, pedidos e pagamentos
          </p>
        </div>
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

      <Tabs value={statusFilter} onValueChange={setStatusFilter} className="w-full">
        <TabsList className="grid w-full grid-cols-5 mb-6">
          <TabsTrigger value="all" data-testid="filter-all">
            Todas
            <Badge variant="outline" className="ml-2">{statusCounts.all}</Badge>
          </TabsTrigger>
          <TabsTrigger value="livre" data-testid="filter-livre">
            Livres
            <Badge variant="outline" className="ml-2">{statusCounts.livre}</Badge>
          </TabsTrigger>
          <TabsTrigger value="ocupada" data-testid="filter-ocupada">
            Ocupadas
            <Badge variant="outline" className="ml-2">{statusCounts.ocupada}</Badge>
          </TabsTrigger>
          <TabsTrigger value="em_andamento" data-testid="filter-em-andamento">
            Em Andamento
            <Badge variant="outline" className="ml-2">{statusCounts.em_andamento}</Badge>
          </TabsTrigger>
          <TabsTrigger value="aguardando_pagamento" data-testid="filter-aguardando">
            Aguardando
            <Badge variant="outline" className="ml-2">{statusCounts.aguardando_pagamento}</Badge>
          </TabsTrigger>
        </TabsList>
      </Tabs>

      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
          {[...Array(8)].map((_, i) => (
            <Skeleton key={i} className="h-64" />
          ))}
        </div>
      ) : filteredTables.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
          {filteredTables.map((table) => (
            <TableCard
              key={table.id}
              table={table}
              onClick={() => setSelectedTable(table)}
              onShowQrCode={setQrDialogTable}
            />
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

      {/* QR Code Preview Dialog */}
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

      {/* Delete Confirmation */}
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

      {/* Table Details Dialog */}
      <TableDetailsDialog
        open={!!selectedTable}
        onOpenChange={(open) => !open && setSelectedTable(null)}
        table={selectedTable}
        onDelete={setDeleteTableId}
      />
    </div>
  );
}
