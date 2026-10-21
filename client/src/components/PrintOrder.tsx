import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Printer } from "lucide-react";
import { formatKwanza } from "@/lib/formatters";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { buildReceiptHtml, type ReceiptDocument } from "@/components/ReceiptPreview";

export interface PrintOrderProps {
  order: any;
  restaurantName?: string;
  label?: string;
  variant?: "default" | "outline" | "ghost";
  size?: "default" | "sm" | "lg" | "icon";
}

export function PrintOrder({ order, restaurantName = "NaBancada", label = "Imprimir", variant = "outline", size = "sm" }: PrintOrderProps) {
  const [previewHtml, setPreviewHtml] = useState<string | null>(null);

  if (!order || !order.id) {
    return null;
  }

  const doc: ReceiptDocument = {
    kind: "order",
    orderNumber: order.orderNumber || order.id.slice(-6),
    createdAt: order.createdAt || new Date().toISOString(),
    orderType: order.orderType || "balcao",
    status: order.status,
    customerName: order.customerName,
    customerPhone: order.customerPhone,
    tableNumber: order.table?.number,
    deliveryAddress: order.deliveryAddress,
    items: (order.orderItems || order.items || []).map((item: any) => ({
      name: item.menuItem?.name || item.name || "Item",
      quantity: item.quantity,
      unitPrice: parseFloat(item.price),
      total: parseFloat(item.price) * item.quantity,
      options: (item.orderItemOptions || []).map((opt: any) => ({
        optionName: opt.optionName,
        quantity: opt.quantity,
        priceAdjustment: parseFloat(opt.priceAdjustment || "0"),
      })),
      notes: item.notes || undefined,
    })),
    notes: order.orderNotes || order.notes,
    totalAmount: order.totalAmount || 0,
    restaurantName,
  };

  const html = buildReceiptHtml(doc, 80);

  const handlePreview = () => {
    setPreviewHtml(html);
  };

  const handlePrintWindow = () => {
    const printWindow = window.open("", "_blank");
    if (!printWindow) return;
    printWindow.document.write(html);
    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => printWindow.print(), 150);
  };

  const closePreview = () => setPreviewHtml(null);

  if (previewHtml) {
    return (
      <div className="fixed inset-0 z-50 flex flex-col bg-background/95 backdrop-blur-sm">
        <div className="flex shrink-0 flex-col gap-3 border-b border-border/70 px-3 pb-3 pt-[calc(env(safe-area-inset-top,0px)+0.75rem)] sm:flex-row sm:items-center sm:justify-between sm:p-4">
          <div className="min-w-0">
            <div className="text-sm font-semibold leading-5 sm:text-base">Pré-visualização do cupom</div>
            <div className="truncate text-xs text-muted-foreground">Pedido #{order.id.slice(-8).toUpperCase()}</div>
          </div>
          <div className="flex w-full gap-2 sm:w-auto">
            <Button variant="outline" size="sm" className="min-w-0 flex-1 sm:flex-none" onClick={handlePrintWindow}>
              <Printer className="mr-2 h-4 w-4 shrink-0" />
              Imprimir
            </Button>
            <Button variant="ghost" size="sm" className="min-w-0 flex-1 sm:flex-none" onClick={closePreview}>
              Fechar
            </Button>
          </div>
        </div>
        <div className="min-h-0 flex-1 overflow-auto overscroll-contain p-2 pb-[calc(env(safe-area-inset-bottom,0px)+0.75rem)] sm:p-4">
          <iframe
            title="Cupom do pedido"
            className="mx-auto block max-w-full border bg-white shadow-sm"
            style={{ width: "min(80mm, calc(100vw - 1rem))", minHeight: "100%" }}
            srcDoc={previewHtml}
            sandbox=""
          />
        </div>
      </div>
    );
  }

  return (
    <Button
      variant={variant}
      size={size}
      onClick={handlePreview}
      disabled={!order || !order.id}
      aria-label="Imprimir pedido"
      title="Imprimir pedido"
      data-testid={order?.id ? `button-print-order-${order.id}` : "button-print-order-disabled"}
    >
      <Printer className={size === "icon" ? "h-4 w-4" : "mr-2 h-4 w-4"} />
      {size === "icon" ? <span className="sr-only">{label}</span> : label}
    </Button>
  );
}
