import { Badge } from "@/components/ui/badge";
import { Printer, AlertTriangle, CheckCircle2, XCircle } from "lucide-react";
import { usePrinter } from "@/hooks/usePrinter";
import { cn } from "@/lib/utils";

export function PrinterStatusBadge({ type = "kitchen" }: { type?: "kitchen" | "receipt" | "invoice" }) {
  const { getPrinterByType } = usePrinter();
  const printer = getPrinterByType(type);

  if (!printer) {
    return (
      <Badge variant="outline" className="gap-1.5 border-orange-300 text-orange-700 dark:text-orange-400">
        <AlertTriangle className="h-3.5 w-3.5" />
        Sem impressora
      </Badge>
    );
  }

  if (printer.status === "connected") {
    return (
      <Badge variant="outline" className="gap-1.5 border-green-300 text-green-700 dark:text-green-400">
        <CheckCircle2 className="h-3.5 w-3.5" />
        Impressora OK
      </Badge>
    );
  }

  return (
    <Badge variant="outline" className="gap-1.5 border-red-300 text-red-700 dark:text-red-400">
      <XCircle className="h-3.5 w-3.5" />
      Impressora offline
    </Badge>
  );
}
