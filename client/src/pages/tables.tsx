import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Plus, Download, Trash2, QrCode as QrCodeIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import type { Table } from "@shared/schema";

export default function Tables() {
  const { toast } = useToast();
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [qrDialogTable, setQrDialogTable] = useState<Table | null>(null);
  const [deleteTableId, setDeleteTableId] = useState<string | null>(null);
  const [tableNumber, setTableNumber] = useState("");

  const { data: tables, isLoading } = useQuery<Table[]>({
    queryKey: ["/api/tables"],
  });

  const createMutation = useMutation({
    mutationFn: async (number: number) => {
      await apiRequest("POST", "/api/tables", { number });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/tables"] });
      toast({
        title: "Mesa criada",
        description: "A mesa foi criada com sucesso e o QR code foi gerado.",
      });
      setIsCreateOpen(false);
      setTableNumber("");
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
      queryClient.invalidateQueries({ queryKey: ["/api/tables"] });
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
    createMutation.mutate(number);
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

  return (
    <div className="space-y-6 sm:space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-foreground">Mesas</h1>
          <p className="text-sm sm:text-base text-muted-foreground mt-1 sm:mt-2">
            Gerencie as mesas do restaurante e seus QR codes
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
                  Digite o número da mesa. Um QR code único será gerado automaticamente.
                </DialogDescription>
              </DialogHeader>
              <div className="py-4">
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

      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
          {[...Array(8)].map((_, i) => (
            <Skeleton key={i} className="h-64" />
          ))}
        </div>
      ) : tables && tables.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
          {tables.map((table) => (
            <Card key={table.id} data-testid={`card-table-${table.id}`}>
              <CardHeader className="flex flex-row items-center justify-between gap-2 pb-3">
                <CardTitle className="text-lg">Mesa {table.number}</CardTitle>
                <div className={`h-2 w-2 rounded-full ${table.isOccupied ? 'bg-chart-4' : 'bg-chart-3'}`} />
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="aspect-square bg-muted rounded-md overflow-hidden flex items-center justify-center">
                  <img
                    src={table.qrCode}
                    alt={`QR Code Mesa ${table.number}`}
                    className="w-full h-full object-contain p-4"
                  />
                </div>
                <div className="flex flex-col sm:flex-row items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full sm:flex-1"
                    onClick={() => setQrDialogTable(table)}
                    data-testid={`button-view-qr-${table.id}`}
                  >
                    <QrCodeIcon className="h-4 w-4 mr-2" />
                    Ver QR
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full sm:flex-1"
                    onClick={() => handleDownloadQR(table)}
                    data-testid={`button-download-qr-${table.id}`}
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Baixar
                  </Button>
                </div>
                <Button
                  variant="destructive"
                  size="sm"
                  className="w-full"
                  onClick={() => setDeleteTableId(table.id)}
                  data-testid={`button-delete-table-${table.id}`}
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Excluir Mesa
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <QrCodeIcon className="h-16 w-16 text-muted-foreground mb-4" />
            <p className="text-xl font-semibold text-foreground mb-2">
              Nenhuma mesa cadastrada
            </p>
            <p className="text-muted-foreground mb-6">
              Crie sua primeira mesa para começar a gerar QR codes
            </p>
            <Button onClick={() => setIsCreateOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Criar Primeira Mesa
            </Button>
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
    </div>
  );
}
