import { useState, useEffect } from 'react';
import { printerService, type ConnectedPrinter, type PrinterType, type PrintJob } from '@/lib/printer-service';
import { useToast } from '@/hooks/use-toast';

export function usePrinter() {
  const [printers, setPrinters] = useState<ConnectedPrinter[]>([]);
  const [printQueue, setPrintQueue] = useState<PrintJob[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    const unsubscribePrinters = printerService.subscribe(setPrinters);
    const unsubscribeQueue = printerService.subscribeToQueue(setPrintQueue);
    setPrinters(printerService.getAllPrinters());
    setPrintQueue(printerService.getQueueStatus().jobs);

    return () => {
      unsubscribePrinters();
      unsubscribeQueue();
    };
  }, []);

  const connectPrinter = async (type: PrinterType, options?: { connectionType?: 'usb' | 'network'; networkHost?: string; networkPort?: number }) => {
    try {
      const printer = await printerService.connectPrinter(type, options);
      toast({
        title: 'Impressora conectada',
        description: `${printer.name} conectada com sucesso`,
      });
      return printer;
    } catch (error) {
      toast({
        title: 'Erro ao conectar impressora',
        description: error instanceof Error ? error.message : 'Erro desconhecido',
        variant: 'destructive',
      });
      throw error;
    }
  };

  const disconnectPrinter = async (printerId: string) => {
    try {
      await printerService.disconnectPrinter(printerId);
      toast({
        title: 'Impressora desconectada',
        description: 'Impressora desconectada com sucesso',
      });
    } catch (error) {
      toast({
        title: 'Erro ao desconectar impressora',
        description: error instanceof Error ? error.message : 'Erro desconhecido',
        variant: 'destructive',
      });
    }
  };

  const testPrint = async (printerId: string) => {
    try {
      await printerService.testPrint(printerId);
      toast({
        title: 'Teste enviado',
        description: 'Página de teste enviada para impressora',
      });
    } catch (error) {
      toast({
        title: 'Erro ao testar impressora',
        description: error instanceof Error ? error.message : 'Erro desconhecido',
        variant: 'destructive',
      });
    }
  };

  const getPrinterByType = (type: PrinterType) => {
    return printerService.getPrinter(type);
  };

  const clearPrintQueue = () => {
    printerService.clearPrintQueue();
    toast({
      title: 'Fila limpa',
      description: 'Fila de impressão limpa com sucesso',
    });
  };

  const retryFailedPrints = () => {
    printerService.processPrintQueue();
    toast({
      title: 'Reprocessando',
      description: 'Tentando reimprimir trabalhos pendentes',
    });
  };

  return {
    printers,
    printQueue,
    connectPrinter,
    disconnectPrinter,
    testPrint,
    getPrinterByType,
    clearPrintQueue,
    retryFailedPrints,
  };
}
