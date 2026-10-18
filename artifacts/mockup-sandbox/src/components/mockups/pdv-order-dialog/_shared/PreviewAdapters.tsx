import { AlertTriangle, FileText, Printer } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import type { PDVOrder } from './types';

export function formatKwanza(value: number | string) {
  return `${new Intl.NumberFormat('pt-AO', { maximumFractionDigits: 0 }).format(Number(value) || 0)} Kz`;
}

export function PrinterStatusBadge({ type: _type }: { type?: 'kitchen' | 'receipt' | 'invoice' }) {
  return (
    <Badge variant="outline" className="gap-1.5 border-orange-300 text-orange-700 dark:text-orange-400">
      <AlertTriangle className="h-3.5 w-3.5" />
      Sem impressora
    </Badge>
  );
}

type PrintButtonProps = {
  order: PDVOrder;
  variant?: 'default' | 'outline' | 'ghost';
  size?: 'default' | 'sm' | 'lg' | 'icon';
};

export function PrintInvoice({ variant = 'outline', size = 'sm' }: PrintButtonProps) {
  return (
    <Button variant={variant} size={size} className="gap-1.5">
      <FileText className="h-4 w-4" />
      Imprimir Fatura
    </Button>
  );
}

export function PrintOrder({ variant = 'outline', size = 'sm' }: PrintButtonProps) {
  return (
    <Button variant={variant} size={size} className="gap-1.5">
      <Printer className="h-4 w-4" />
      Visualizar
    </Button>
  );
}

export const printerService = {
  async printKitchenOrder(_type: string, _order: unknown) {},
};

export function usePrinter() {
  return { getPrinterByType: (_type: string) => null };
}

export function useToast() {
  return { toast: (_message?: unknown) => undefined };
}
