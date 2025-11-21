import { useState, useEffect } from 'react';
import { printerService, type ConnectedPrinter, type PrinterType } from '@/lib/printer-service';
import { useToast } from '@/hooks/use-toast';

export function usePrinter() {
  const [printers, setPrinters] = useState<ConnectedPrinter[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    const unsubscribe = printerService.subscribe(setPrinters);
    setPrinters(printerService.getAllPrinters());
    return () => {
      unsubscribe();
    };
  }, []);

  const connectPrinter = async (type: PrinterType) => {
    try {
      const printer = await printerService.connectPrinter(type);
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

  return {
    printers,
    connectPrinter,
    disconnectPrinter,
    testPrint,
    getPrinterByType,
  };
}
