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
  variant?: "default" | "outline" | "ghost";
  size?: "default" | "sm" | "lg" | "icon";
}

export function PrintOrder({ order, restaurantName = "NaBancada", variant = "outline", size = "sm" }: PrintOrderProps) {
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
    items: (order.orderItems || []).map((item: any) => ({
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
      <div className="fixed inset-0 z-50 flex flex-col bg-background/90 backdrop-blur-sm">
        <div className="flex items-center justify-between p-4 border-b">
          <div>
            <div className="font-semibold">Pré-visualização do cupom</div>
            <div className="text-xs text-muted-foreground">Pedido #{order.id.slice(-8).toUpperCase()}</div>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={handlePrintWindow}>
              <Printer className="h-4 w-4 mr-2" />
              Imprimir
            </Button>
            <Button variant="ghost" size="sm" onClick={closePreview}>
              Fechar
            </Button>
          </div>
        </div>
        <div className="flex-1 overflow-auto p-4">
          <iframe title="cupom" className="mx-auto border bg-white shadow" style={{ width: "80mm", minHeight: "100%" }} sandbox="">
            <html><head><meta charSet="utf-8" /></head><body>{previewHtml}</body></html>
          </iframe>
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
      data-testid={order?.id ? `button-print-order-${order.id}` : "button-print-order-disabled"}
    >
      <Printer className="h-4 w-4 mr-2" />
      Imprimir
    </Button>
  );
}
