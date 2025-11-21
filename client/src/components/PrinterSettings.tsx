import { useState } from 'react';
import { usePrinter } from '@/hooks/usePrinter';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Printer, Trash2, TestTube, Plus, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import { type PrinterType } from '@/lib/printer-service';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
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

const printerTypeLabels: Record<PrinterType, string> = {
  receipt: 'Recibo (Caixa)',
  kitchen: 'Cozinha',
  invoice: 'Fatura',
};

export function PrinterSettings() {
  const { printers, connectPrinter, disconnectPrinter, testPrint } = usePrinter();
  const [selectedType, setSelectedType] = useState<PrinterType>('receipt');
  const [connecting, setConnecting] = useState(false);
  const [printerToRemove, setPrinterToRemove] = useState<string | null>(null);

  const handleConnect = async () => {
    setConnecting(true);
    try {
      await connectPrinter(selectedType);
    } catch (error) {
      console.error('Failed to connect printer:', error);
    } finally {
      setConnecting(false);
    }
  };

  const handleDisconnect = async (printerId: string) => {
    await disconnectPrinter(printerId);
    setPrinterToRemove(null);
  };

  const handleTest = async (printerId: string) => {
    await testPrint(printerId);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'connected':
        return (
          <Badge className="gap-1" variant="default">
            <CheckCircle className="h-3 w-3" />
            Conectada
          </Badge>
        );
      case 'disconnected':
        return (
          <Badge className="gap-1" variant="destructive">
            <XCircle className="h-3 w-3" />
            Desconectada
          </Badge>
        );
      case 'error':
        return (
          <Badge className="gap-1" variant="destructive">
            <AlertCircle className="h-3 w-3" />
            Erro
          </Badge>
        );
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="gap-1 space-y-0 pb-2">
          <CardTitle>Conectar Nova Impressora</CardTitle>
          <CardDescription>
            Conecte uma impressora térmica USB ao seu dispositivo
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap items-end gap-4">
            <div className="flex-1 min-w-[200px]">
              <label className="text-sm font-medium mb-2 block" htmlFor="printer-type">
                Tipo de Impressora
              </label>
              <Select
                value={selectedType}
                onValueChange={(value) => setSelectedType(value as PrinterType)}
              >
                <SelectTrigger data-testid="select-printer-type" id="printer-type">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="receipt">Recibo (Caixa)</SelectItem>
                  <SelectItem value="kitchen">Cozinha</SelectItem>
                  <SelectItem value="invoice">Fatura</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button
              data-testid="button-connect-printer"
              onClick={handleConnect}
              disabled={connecting}
              className="gap-2"
            >
              <Plus className="h-4 w-4" />
              {connecting ? 'Conectando...' : 'Conectar Impressora'}
            </Button>
          </div>
          
          <div className="mt-4 p-4 bg-muted rounded-md">
            <p className="text-sm text-muted-foreground">
              <strong>Nota:</strong> Esta funcionalidade requer um navegador compatível com WebUSB 
              (Chrome, Edge, ou Opera) e uma impressora térmica USB conectada. Ao clicar em "Conectar", 
              será solicitado que você selecione a impressora.
            </p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="gap-1 space-y-0 pb-2">
          <CardTitle>Impressoras Conectadas</CardTitle>
          <CardDescription>
            {printers.length === 0
              ? 'Nenhuma impressora conectada'
              : `${printers.length} impressora(s) configurada(s)`}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {printers.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <Printer className="h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-muted-foreground">
                Nenhuma impressora conectada ainda
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {printers.map((printer, index) => (
                <div key={printer.id}>
                  {index > 0 && <Separator className="my-4" />}
                  <div className="flex flex-wrap items-center justify-between gap-4">
                    <div className="flex-1 min-w-[200px]">
                      <div className="flex items-center gap-2 mb-1">
                        <Printer className="h-4 w-4 text-muted-foreground" />
                        <h3 className="font-medium" data-testid={`text-printer-name-${printer.id}`}>
                          {printer.name}
                        </h3>
                      </div>
                      <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
                        <Badge variant="outline">
                          {printerTypeLabels[printer.type]}
                        </Badge>
                        {getStatusBadge(printer.status)}
                        {printer.language && (
                          <span className="text-xs">
                            {printer.language.toUpperCase()}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <Button
                        data-testid={`button-test-printer-${printer.id}`}
                        onClick={() => handleTest(printer.id)}
                        disabled={printer.status !== 'connected'}
                        variant="outline"
                        size="sm"
                        className="gap-2"
                      >
                        <TestTube className="h-4 w-4" />
                        Testar
                      </Button>
                      <Button
                        data-testid={`button-remove-printer-${printer.id}`}
                        onClick={() => setPrinterToRemove(printer.id)}
                        variant="outline"
                        size="sm"
                        className="gap-2"
                      >
                        <Trash2 className="h-4 w-4" />
                        Remover
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <AlertDialog open={!!printerToRemove} onOpenChange={(open) => !open && setPrinterToRemove(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remover impressora?</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja remover esta impressora? Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel data-testid="button-cancel-remove">Cancelar</AlertDialogCancel>
            <AlertDialogAction
              data-testid="button-confirm-remove"
              onClick={() => printerToRemove && handleDisconnect(printerToRemove)}
            >
              Remover
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
