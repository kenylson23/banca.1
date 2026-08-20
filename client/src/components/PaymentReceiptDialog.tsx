import { useState, useMemo } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import {
  CheckCircle2,
  Printer,
  Download,
  Users,
  Receipt,
  Clock,
  ChevronDown,
  ChevronUp,
  X,
} from "lucide-react";
import { formatKwanza } from "@/lib/formatters";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import type { OrdersByGuestData } from "@shared/types";
import jsPDF from "jspdf";
import { PrintGuestBill, type TableGuest, type GuestOrder, type GuestOrderItem } from "./PrintGuestBill";

interface PaymentData {
  id: string;
  tableId: string;
  sessionId: string;
  amount: string;
  paymentMethod: string;
  receivedAmount?: number;
  notes?: string;
  createdAt: string;
}

interface CalculateTotals {
  subtotal: number;
  totalDiscounts: number;
  totalAdditions: number;
  finalTotal: number;
  breakdown: Array<{
    type: "discount" | "addition";
    label: string;
    value: number;
    source?: string;
  }>;
}

interface PaymentReceiptDialogProps {
  open: boolean;
  onClose: () => void;
  table: {
    id: string;
    number: string;
    area?: string;
    currentSessionId: string | null;
  };
  payment: PaymentData;
  ordersByGuest: OrdersByGuestData["ordersByGuest"];
  calculateTotals: CalculateTotals;
  restaurant?: {
    name?: string;
    address?: string;
    nif?: string;
    phone?: string;
  };
  sessionDuration?: string;
  totalAmount: number;
  onPrintComplete?: () => void;
}

const safeNumber = (v: any) => {
  const n = typeof v === "number" ? v : parseFloat(String(v ?? "0"));
  return Number.isFinite(n) ? n : 0;
};

export function PaymentReceiptDialog({
  open,
  onClose,
  table,
  payment,
  ordersByGuest,
  calculateTotals,
  restaurant,
  sessionDuration,
  totalAmount,
  onPrintComplete,
}: PaymentReceiptDialogProps) {
  const [showCalculations, setShowCalculations] = useState(false);
  const [isPrinting, setIsPrinting] = useState(false);
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
  const { toast } = useToast();

  const safeOrdersByGuest = Array.isArray(ordersByGuest) ? ordersByGuest : [];
  const safeCalculateTotals = calculateTotals || {
    subtotal: 0,
    totalDiscounts: 0,
    totalAdditions: 0,
    finalTotal: totalAmount || 0,
    breakdown: [],
  };

  const guestsWithItems = useMemo(
    () => safeOrdersByGuest.filter((og) => og.orders.some((o: any) => (o.items || []).length > 0)),
    [safeOrdersByGuest]
  );

  const guestsWithoutItems = useMemo(
    () => safeOrdersByGuest.filter((og) => !og.orders.some((o: any) => (o.items || []).length > 0)),
    [safeOrdersByGuest]
  );

  const stats = useMemo(() => {
    const totalItems = guestsWithItems.reduce((sum, og) => {
      return sum + og.orders.reduce((s, o) => s + (o.items || []).length, 0);
    }, 0);

    const guestsSubtotal = guestsWithItems.reduce((sum, og) => sum + safeNumber(og.subtotal), 0);

    return {
      totalGuests: safeOrdersByGuest.length,
      guestsWithItems: guestsWithItems.length,
      guestsWithoutItems: guestsWithoutItems.length,
      totalItems,
      guestsSubtotal,
    };
  }, [safeOrdersByGuest, guestsWithItems, guestsWithoutItems]);

  const transformGuestDataForPrint = (og: (typeof safeOrdersByGuest)[0]) => {
    const guestSubtotal = safeNumber(og.subtotal);
    const guestTotalFromBackend = safeNumber((og.guest as any).guestTotal);
    const guestDiscountRaw = safeNumber((og.guest as any).discount);
    const guestServiceChargeRaw = safeNumber((og.guest as any).serviceCharge);
    const hasBackendGuestTotal = guestTotalFromBackend > 0.009;

    const guest: TableGuest = {
      id: og.guest.id,
      sessionId: og.guest.sessionId,
      name: og.guest.name,
      guestNumber: og.guest.guestNumber,
      status: og.guest.status,
      totalSpent: og.subtotal,
      joinedAt: og.guest.joinedAt,
    };

    const orders: GuestOrder[] = og.orders.map((order: any) => ({
      orderId: order.id,
      orderStatus: order.status,
      totalAmount: order.totalPrice,
      createdAt: order.createdAt,
      items: (order.items || []).map((item: any) => ({
        id: item.id,
        menuItemName: item.menuItem?.name || item.name,
        quantity: item.quantity,
        unitPrice: item.price,
        totalPrice: (safeNumber(item.price) * safeNumber(item.quantity)).toFixed(2),
      })),
    }));

    const totalAmount = hasBackendGuestTotal
      ? guestTotalFromBackend
      : Math.max(0, guestSubtotal - guestDiscountRaw + guestServiceChargeRaw);

    return {
      guest,
      orders,
      subtotal: guestSubtotal,
      totalAmount,
      hasBackendGuestTotal,
      discounts:
        guestDiscountRaw > 0.009
          ? [{ description: "Desconto do Cliente", amount: guestDiscountRaw, type: "fixed" as const }]
          : [],
      serviceCharges:
        guestServiceChargeRaw > 0.009
          ? [{ description: "Taxa/Serviço do Cliente", amount: guestServiceChargeRaw, type: "fixed" as const }]
          : [],
    };
  };

  const hasAnyGuestTotalMissing = useMemo(
    () => safeOrdersByGuest.some((og) => !(safeNumber((og.guest as any).guestTotal) > 0.009)),
    [safeOrdersByGuest]
  );

  const handlePrintComplete = async () => {
    setIsPrinting(true);
    try {
      const printWindow = window.open("", "_blank");
      if (!printWindow) {
        throw new Error("Não foi possível abrir a janela de impressão");
      }

      const printContent = generatePrintableInvoice();
      printWindow.document.write(printContent);
      printWindow.document.close();

      printWindow.onload = () => {
        printWindow.print();
        setTimeout(() => {
          printWindow.close();
          setIsPrinting(false);
          onPrintComplete?.();
        }, 500);
      };
    } catch (error) {
      console.error("Erro ao imprimir:", error);
      setIsPrinting(false);
      toast({
        title: "Erro ao imprimir",
        description: error instanceof Error ? error.message : "Não foi possível abrir a impressão",
        variant: "destructive",
      });
    }
  };

  const generatePrintableInvoice = () => {
    const restaurantName = restaurant?.name || "Restaurante";
    const restaurantAddress = restaurant?.address || "";
    const restaurantNIF = restaurant?.nif || "";
    const restaurantPhone = restaurant?.phone || "";
    const printDateTime = new Date().toLocaleString("pt-PT");
    const operatorName = localStorage.getItem("userName") || "Sistema";

    return `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Fatura - Mesa ${table.number}</title>
          <meta charset="UTF-8">
          <style>
            @media print { @page { margin: 0; } body { margin: 1cm; } }
            body { font-family: Arial, sans-serif; max-width: 80mm; margin: 0 auto; font-size: 12px; line-height: 1.4; }
            .header { text-align: center; border-bottom: 2px solid #000; padding-bottom: 10px; margin-bottom: 10px; }
            .restaurant-name { font-size: 18px; font-weight: bold; margin-bottom: 5px; }
            .restaurant-info { font-size: 10px; color: #666; }
            .invoice-info { margin: 10px 0; font-size: 11px; border-bottom: 1px dashed #999; padding-bottom: 10px; }
            .info-line { display: flex; justify-content: space-between; margin: 2px 0; }
            .section-title { font-weight: bold; margin-top: 15px; margin-bottom: 8px; font-size: 13px; text-transform: uppercase; border-bottom: 1px solid #000; padding-bottom: 3px; }
            .guest-section { margin: 10px 0; padding: 8px; background: #f9f9f9; border: 1px solid #ddd; border-radius: 4px; }
            .guest-header { font-weight: bold; margin-bottom: 8px; display: flex; justify-content: space-between; align-items: center; border-bottom: 1px dashed #999; padding-bottom: 5px; }
            .guest-number { display: inline-block; width: 24px; height: 24px; border-radius: 50%; background: #333; color: #fff; text-align: center; line-height: 24px; font-size: 11px; margin-right: 8px; }
            .item-line { display: flex; justify-content: space-between; padding: 3px 0; font-size: 11px; }
            .item-name { flex: 1; }
            .item-qty { margin-right: 8px; font-weight: bold; }
            .item-price { text-align: right; min-width: 60px; }
            .item-options { font-size: 9px; color: #666; margin-left: 10px; font-style: italic; }
            .subtotal { display: flex; justify-content: space-between; font-weight: bold; margin-top: 5px; padding-top: 5px; border-top: 1px dashed #999; }
            .calculations { margin-top: 15px; padding-top: 10px; border-top: 2px solid #000; }
            .calc-line { display: flex; justify-content: space-between; padding: 3px 0; font-size: 11px; }
            .calc-line.discount { color: #28a745; }
            .calc-line.addition { color: #007bff; }
            .calc-line.subtotal-line { font-size: 12px; padding-top: 5px; }
            .total-line { display: flex; justify-content: space-between; font-size: 16px; font-weight: bold; margin-top: 10px; padding-top: 10px; border-top: 2px solid #000; }
            .payment-info { margin-top: 15px; padding: 10px; background: #f0f0f0; border-radius: 4px; }
            .payment-line { display: flex; justify-content: space-between; margin: 3px 0; font-size: 11px; }
            .payment-line.highlight { font-weight: bold; font-size: 13px; margin-top: 5px; padding-top: 5px; border-top: 1px dashed #999; }
            .footer { margin-top: 20px; text-align: center; font-size: 10px; color: #666; border-top: 1px dashed #999; padding-top: 10px; }
            .validation-code { text-align: center; margin: 10px 0; font-size: 9px; color: #999; }
          </style>
        </head>
        <body>
          <div class="header">
            <div class="restaurant-name">${restaurantName}</div>
            ${restaurantAddress || restaurantNIF || restaurantPhone ? `
              <div class="restaurant-info">
                ${restaurantAddress ? `${restaurantAddress}<br>` : ""}
                ${restaurantNIF ? `NIF: ${restaurantNIF}<br>` : ""}
                ${restaurantPhone ? `Tel: ${restaurantPhone}` : ""}
              </div>
            ` : ""}
          </div>

          <div class="invoice-info">
            <div class="info-line"><strong>Fatura Nº:</strong><span>${payment.id.substring(0, 8).toUpperCase()}</span></div>
            <div class="info-line"><strong>Data:</strong><span>${new Date(payment.createdAt).toLocaleString("pt-PT")}</span></div>
            <div class="info-line"><strong>Mesa:</strong><span>${table.number}${table.area ? ` (${table.area})` : ""}</span></div>
            <div class="info-line"><strong>Convidados:</strong><span>${guestsWithItems.length}</span></div>
            ${sessionDuration ? `<div class="info-line"><strong>Duração:</strong><span>${sessionDuration}</span></div>` : ""}
            ${payment.notes ? `<div class="info-line"><strong>Observações:</strong><span>${payment.notes}</span></div>` : ""}
            <div class="info-line"><strong>Operador:</strong><span>${operatorName}</span></div>
            <div class="info-line"><strong>Impresso em:</strong><span>${printDateTime}</span></div>
          </div>

          <div class="section-title">Itens Consumidos</div>
          ${guestsWithItems.map((og) => {
            const { guest, orders, subtotal, totalAmount: guestTotal, discounts, serviceCharges } = transformGuestDataForPrint(og);
            const discountTotal = (discounts || []).reduce((s, d) => s + (d.amount || 0), 0);
            const chargesTotal = (serviceCharges || []).reduce((s, c) => s + (c.amount || 0), 0);
            return `
              <div class="guest-section">
                <div class="guest-header">
                  <div><span class="guest-number">#${guest.guestNumber}</span>${guest.name || `Cliente ${guest.guestNumber}`}</div>
                </div>
                ${orders.flatMap(order => order.items || []).map(item => `
                  <div class="item-line">
                    <span class="item-qty">${item.quantity}x</span>
                    <span class="item-name">${item.menuItemName}</span>
                    <span class="item-price">${formatKwanza(parseFloat(item.unitPrice || "0") * item.quantity)}</span>
                  </div>
                `).join("")}
                <div class="subtotal"><span>Subtotal:</span><span>${formatKwanza(subtotal)}</span></div>
                ${discountTotal > 0.009 ? `<div class="subtotal"><span>Desconto:</span><span>- ${formatKwanza(discountTotal)}</span></div>` : ""}
                ${chargesTotal > 0.009 ? `<div class="subtotal"><span>Taxa/Serviço:</span><span>+ ${formatKwanza(chargesTotal)}</span></div>` : ""}
                <div class="subtotal"><span>Total do Cliente:</span><span>${formatKwanza(guestTotal)}</span></div>
              </div>
            `;
          }).join("")}

          <div class="calculations">
            <div class="calc-line subtotal-line"><span>Subtotal</span><span>${formatKwanza(safeCalculateTotals.subtotal)}</span></div>
            ${safeCalculateTotals.breakdown.map(item => `
              <div class="calc-line ${item.type}">
                <span>${item.label}${item.source ? ` (${item.source})` : ""}</span>
                <span>${item.type === "discount" ? "-" : "+"}${formatKwanza(Math.abs(item.value))}</span>
              </div>
            `).join("")}
            <div class="total-line"><span>TOTAL A PAGAR</span><span>${formatKwanza(safeCalculateTotals.finalTotal)}</span></div>
          </div>

          <div class="payment-info">
            <div class="payment-line"><span>Método de Pagamento:</span><span>${payment.paymentMethod}</span></div>
            ${payment.receivedAmount ? `
              <div class="payment-line"><span>Valor Recebido:</span><span>${formatKwanza(payment.receivedAmount)}</span></div>
              <div class="payment-line highlight"><span>Troco:</span><span>${formatKwanza(payment.receivedAmount - safeCalculateTotals.finalTotal)}</span></div>
            ` : ""}
          </div>

          <div class="validation-code">Código de Validação: ${payment.id.substring(0, 8).toUpperCase()}</div>
          <div class="footer">Obrigado pela sua visita!<br>Volte sempre!</div>
        </body>
      </html>
    `;
  };

  const handleDownloadPDF = async () => {
    setIsGeneratingPDF(true);
    try {
      const pdf = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const margin = 15;
      const contentWidth = pageWidth - margin * 2;
      let yPos = margin;

      const addText = (text: string, fontSize = 10, isBold = false, align: "left" | "center" | "right" = "left") => {
        pdf.setFontSize(fontSize);
        pdf.setFont("helvetica", isBold ? "bold" : "normal");
        if (align === "center") pdf.text(text, pageWidth / 2, yPos, { align: "center" });
        else if (align === "right") pdf.text(text, pageWidth - margin, yPos, { align: "right" });
        else pdf.text(text, margin, yPos);
        yPos += fontSize * 0.6;
      };

      const addLine = () => {
        pdf.line(margin, yPos, pageWidth - margin, yPos);
        yPos += 5;
      };

      const checkPageBreak = (neededSpace = 20) => {
        if (yPos + neededSpace > pageHeight - margin) {
          pdf.addPage();
          yPos = margin;
        }
      };

      addText(restaurant?.name || "Restaurante", 18, true, "center");
      yPos += 2;
      if (restaurant?.address) addText(restaurant.address, 9, false, "center");
      if (restaurant?.nif) addText(`NIF: ${restaurant.nif}`, 9, false, "center");
      if (restaurant?.phone) addText(`Tel: ${restaurant.phone}`, 9, false, "center");
      yPos += 5;
      addLine();

      addText("FATURA DE PAGAMENTO", 14, true, "center");
      yPos += 5;
      addText(`Fatura Nº: ${payment.id.substring(0, 8).toUpperCase()}`, 10, true);
      addText(`Data: ${new Date(payment.createdAt).toLocaleString("pt-PT")}`, 10);
      addText(`Mesa: ${table.number}${table.area ? ` (${table.area})` : ""}`, 10);
      addText(`Convidados: ${guestsWithItems.length}`, 10);
      if (sessionDuration) addText(`Duração da Sessão: ${sessionDuration}`, 10);
      if (payment.notes) addText(`Observações: ${payment.notes}`, 10);
      const operatorName = localStorage.getItem("userName") || "Sistema";
      addText(`Operador: ${operatorName}`, 10);

      yPos += 5;
      addLine();

      addText("ITENS CONSUMIDOS", 12, true);
      yPos += 3;

      for (const og of guestsWithItems) {
        checkPageBreak(40);
        const guestName = og.guest.name || `Cliente ${og.guest.guestNumber}`;
        pdf.setFillColor(240, 240, 240);
        pdf.rect(margin, yPos - 4, contentWidth, 8, "F");
        addText(`#${og.guest.guestNumber} - ${guestName}`, 11, true);
        yPos += 2;

        const allItems = og.orders.flatMap(order => order.items || []);
        for (const item of allItems) {
          checkPageBreak(15);
          const itemName = item.menuItem?.name || item.name;
          const itemPrice = formatKwanza(safeNumber(item.price) * item.quantity);
          pdf.setFont("helvetica", "normal");
          pdf.setFontSize(10);
          pdf.text(`  ${item.quantity}x ${itemName}`, margin, yPos);
          pdf.text(itemPrice, pageWidth - margin, yPos, { align: "right" });
          yPos += 5;
          if (item.options && item.options.length > 0) {
            pdf.setFontSize(8);
            pdf.setTextColor(100, 100, 100);
            pdf.text(`     + ${item.options.map((o: any) => o.value || o.name || "").join(", ")}`, margin, yPos);
            pdf.setTextColor(0, 0, 0);
            yPos += 4;
          }
        }

        const { subtotal, totalAmount: guestTotal, discounts, serviceCharges } = transformGuestDataForPrint(og);
        const discountTotal = (discounts || []).reduce((s, d) => s + (d.amount || 0), 0);
        const chargesTotal = (serviceCharges || []).reduce((s, c) => s + (c.amount || 0), 0);

        pdf.setFont("helvetica", "bold");
        pdf.setFontSize(10);
        pdf.text(`Subtotal:`, margin + 10, yPos);
        pdf.text(formatKwanza(subtotal), pageWidth - margin, yPos, { align: "right" });
        yPos += 6;
        if (discountTotal > 0.009) {
          pdf.text(`Desconto:`, margin + 10, yPos);
          pdf.text(`- ${formatKwanza(discountTotal)}`, pageWidth - margin, yPos, { align: "right" });
          yPos += 6;
        }
        if (chargesTotal > 0.009) {
          pdf.text(`Taxa/Serviço:`, margin + 10, yPos);
          pdf.text(`+ ${formatKwanza(chargesTotal)}`, pageWidth - margin, yPos, { align: "right" });
          yPos += 6;
        }
        pdf.text(`Total do Cliente:`, margin + 10, yPos);
        pdf.text(formatKwanza(guestTotal), pageWidth - margin, yPos, { align: "right" });
        yPos += 8;
      }

      checkPageBreak(60);
      addLine();

      addText("CÁLCULOS FINAIS", 12, true);
      yPos += 3;

      addText("Subtotal:", 10, false);
      pdf.text(formatKwanza(safeCalculateTotals.subtotal), pageWidth - margin, yPos - 5, { align: "right" });

      for (const item of safeCalculateTotals.breakdown) {
        checkPageBreak();
        const label = `${item.label}${item.source ? ` (${item.source})` : ""}`;
        const value = `${item.type === "discount" ? "-" : "+"}${formatKwanza(Math.abs(item.value))}`;
        if (item.type === "discount") pdf.setTextColor(0, 150, 0);
        else pdf.setTextColor(0, 100, 200);
        addText(label, 10, false);
        pdf.text(value, pageWidth - margin, yPos - 5, { align: "right" });
        pdf.setTextColor(0, 0, 0);
      }

      yPos += 3;
      pdf.setLineWidth(0.5);
      pdf.line(margin, yPos, pageWidth - margin, yPos);
      yPos += 5;

      pdf.setFontSize(14);
      pdf.setFont("helvetica", "bold");
      pdf.text("TOTAL A PAGAR:", margin, yPos);
      pdf.text(formatKwanza(safeCalculateTotals.finalTotal), pageWidth - margin, yPos, { align: "right" });
      yPos += 10;

      addLine();

      addText("INFORMAÇÕES DE PAGAMENTO", 12, true);
      yPos += 3;
      addText(`Método: ${payment.paymentMethod}`, 10);
      if (payment.receivedAmount) {
        addText(`Valor Recebido: ${formatKwanza(payment.receivedAmount)}`, 10);
        const change = payment.receivedAmount - safeCalculateTotals.finalTotal;
        if (change > 0) {
          pdf.setTextColor(0, 100, 200);
          addText(`Troco: ${formatKwanza(change)}`, 10, true);
          pdf.setTextColor(0, 0, 0);
        }
      }

      yPos += 5;
      addLine();

      addText(`Código de Validação: ${payment.id.substring(0, 8).toUpperCase()}`, 9, false, "center");
      yPos += 5;
      addText("Obrigado pela sua visita!", 10, true, "center");
      addText("Volte sempre!", 10, false, "center");

      const filename = `Fatura_Mesa${table.number}_${new Date().toISOString().split("T")[0]}.pdf`;
      pdf.save(filename);

      toast({
        title: "PDF gerado com sucesso!",
        description: `Arquivo ${filename} foi baixado`,
      });
    } catch (error) {
      console.error("Erro ao gerar PDF:", error);
      toast({
        title: "Erro ao gerar PDF",
        description: error instanceof Error ? error.message : "Não foi possível gerar o arquivo PDF",
        variant: "destructive",
      });
    } finally {
      setIsGeneratingPDF(false);
    }
  };

  const getPaymentMethodLabel = (method: string) => {
    const methods: Record<string, string> = {
      dinheiro: "Dinheiro",
      multicaixa: "Multicaixa",
      transferencia: "Transferência",
      cartao: "Cartão",
    };
    return methods[method] || method;
  };

  return (
    <Dialog open={open} onOpenChange={(isOpen) => { if (!isOpen) onClose(); }}>
      <DialogContent
        className="max-w-[95vw] sm:max-w-2xl md:max-w-3xl lg:max-w-4xl max-h-[90vh] flex flex-col"
        onPointerDownOutside={(e) => { e.preventDefault(); }}
      >
        <DialogHeader>
          <div className="flex items-center justify-center mb-4">
            <div className="relative">
              <div className="absolute inset-0 bg-green-500/20 rounded-full blur-xl animate-pulse" />
              <div className="relative bg-slate-900 text-white p-4 rounded-full">
                <CheckCircle2 className="h-12 w-12" />
              </div>
            </div>
          </div>
          <DialogTitle className="text-xl font-bold text-center">
            Pagamento Processado com Sucesso!
          </DialogTitle>
          <DialogDescription className="text-center text-sm">
            O pagamento foi registrado e a sessão foi finalizada
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="flex-1 pr-4 max-h-[calc(90vh-220px)] overflow-auto">
          <div className="space-y-4">
            <Card className="border border-slate-200 dark:border-slate-800">
              <CardContent className="p-5 space-y-3">
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-slate-500">Mesa:</span>
                    <Badge variant="outline" className="font-bold">Mesa {table.number}</Badge>
                  </div>
                  {sessionDuration && (
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-slate-500">Duração:</span>
                      <span className="font-semibold">{sessionDuration}</span>
                    </div>
                  )}
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-slate-500">Método:</span>
                    <span className="font-semibold">{getPaymentMethodLabel(payment.paymentMethod)}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-slate-500">Convidados:</span>
                    <span className="font-semibold">{stats.totalGuests}</span>
                  </div>
                </div>

                <Separator />

                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-600">Com itens</span>
                    <span className="font-semibold">{stats.guestsWithItems}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-600">Sem itens</span>
                    <span className="font-semibold">{stats.guestsWithoutItems}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-600">Itens</span>
                    <span className="font-semibold">{stats.totalItems}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-600">Subtotal</span>
                    <span className="font-semibold">{formatKwanza(stats.guestsSubtotal)}</span>
                  </div>
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <span className="text-base font-bold">Valor Total:</span>
                  <span className="text-xl font-black text-slate-900 dark:text-slate-100">
                    {formatKwanza(safeCalculateTotals.finalTotal)}
                  </span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-base">
                  <Receipt className="h-4 w-4" />
                  Cálculos e Ajustes
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {hasAnyGuestTotalMissing && (
                  <div className="rounded-lg border border-amber-300 bg-amber-50 p-3 text-xs text-amber-800">
                    Alguns totais por convidado não foram encontrados no backend. Os valores exibidos podem não refletir os ajustes finais da sessão.
                  </div>
                )}
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-600">Subtotal</span>
                  <span className="font-semibold">{formatKwanza(safeCalculateTotals.subtotal)}</span>
                </div>

                {safeCalculateTotals.breakdown.length > 0 && (
                  <>
                    <Separator />
                    {safeCalculateTotals.breakdown.map((item, idx) => (
                      <div
                        key={idx}
                        className={cn(
                          "flex items-center justify-between text-sm",
                          item.type === "discount" && "text-green-600",
                          item.type === "addition" && "text-blue-600"
                        )}
                      >
                        <span>{item.label}</span>
                        <span className="font-semibold">
                          {item.type === "discount" ? "-" : "+"}
                          {formatKwanza(Math.abs(item.value))}
                        </span>
                      </div>
                    ))}
                  </>
                )}

                <Separator className="my-3" />

                <div className="flex items-center justify-between text-base font-bold">
                  <span>Total Final</span>
                  <span className="text-xl">{formatKwanza(safeCalculateTotals.finalTotal)}</span>
                </div>

                {payment.receivedAmount && (
                  <div className="mt-3 pt-3 border-t space-y-2 text-sm">
                    <div className="flex items-center justify-between">
                      <span>Valor Recebido</span>
                      <span className="font-semibold">{formatKwanza(payment.receivedAmount)}</span>
                    </div>
                    <div className="flex items-center justify-between font-bold text-blue-600">
                      <span>Troco</span>
                      <span>{formatKwanza(payment.receivedAmount - safeCalculateTotals.finalTotal)}</span>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-base">
                  <Users className="h-4 w-4" />
                  Itens por Convidado
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {hasAnyGuestTotalMissing && (
                  <div className="rounded-lg border border-amber-300 bg-amber-50 p-3 text-xs text-amber-800">
                    Alguns totais por convidado não foram encontrados no backend. Os valores exibidos podem não refletir os ajustes finais da sessão.
                  </div>
                )}
                {guestsWithItems.length === 0 && (
                  <div className="text-sm text-slate-500">Nenhum item consumido.</div>
                )}
                {guestsWithItems.map((og) => {
                  const {
                    guest,
                    orders,
                    subtotal,
                    totalAmount: guestTotal,
                    discounts,
                    serviceCharges,
                  } = transformGuestDataForPrint(og);
                  const discountTotal = (discounts || []).reduce((s, d) => s + (d.amount || 0), 0);
                  const chargesTotal = (serviceCharges || []).reduce((s, c) => s + (c.amount || 0), 0);

                  return (
                    <div key={og.guest.id} className="rounded-lg border border-slate-200 dark:border-slate-700 p-3 space-y-2">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="font-semibold text-sm">{guest.name || `Cliente ${guest.guestNumber}`}</div>
                          <div className="text-xs text-slate-500">
                            {orders.length === 0 ? "Sem itens" : `${orders.reduce((s, o) => s + (o.items || []).length, 0)} itens`}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-sm font-semibold">{formatKwanza(subtotal)}</div>
                          {(discountTotal > 0.009 || chargesTotal > 0.009) && (
                            <div className="text-xs text-slate-500">
                              {discountTotal > 0.009 ? `- ${formatKwanza(discountTotal)}` : ""}
                              {discountTotal > 0.009 && chargesTotal > 0.009 ? " • " : ""}
                              {chargesTotal > 0.009 ? `+ ${formatKwanza(chargesTotal)}` : ""}
                            </div>
                          )}
                          <div className="text-sm font-bold">{formatKwanza(guestTotal)}</div>
                        </div>
                      </div>

                      <div className="space-y-1">
                        {orders.flatMap(order => order.items || []).map((item, idx) => (
                          <div key={idx} className="flex items-center justify-between text-xs">
                            <div className="flex items-center gap-2 flex-1">
                              <span className="font-semibold">{item.quantity}x</span>
                              <span className="truncate">{item.menuItemName}</span>
                            </div>
                            <span className="font-semibold ml-2">
                              {formatKwanza(safeNumber(item.unitPrice) * item.quantity)}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </CardContent>
            </Card>

            <div className="space-y-3">
              <div className="flex items-center gap-2 text-sm text-slate-500">
                <Users className="h-4 w-4" />
                <span>O que deseja fazer agora?</span>
              </div>

              <Card className="cursor-pointer transition-all hover:shadow-md border border-slate-200 dark:border-slate-800" onClick={handlePrintComplete}>
                <CardContent className="p-4">
                  <div className="flex items-center gap-4">
                    <div className="p-3 rounded-lg bg-slate-900 text-white">
                      <Printer className="h-5 w-5" />
                    </div>
                    <div className="flex-1">
                      <div className="font-bold text-sm">Imprimir Fatura Completa</div>
                      <div className="text-xs text-slate-500">Fatura detalhada com todos os itens</div>
                    </div>
                    {isPrinting && <div className="animate-spin h-4 w-4 border-2 border-slate-900 border-t-transparent rounded-full" />}
                  </div>
                </CardContent>
              </Card>

              <Card className="cursor-pointer transition-all hover:shadow-md border border-slate-200 dark:border-slate-800" onClick={handleDownloadPDF}>
                <CardContent className="p-4">
                  <div className="flex items-center gap-4">
                    <div className="p-3 rounded-lg bg-slate-900 text-white">
                      <Download className="h-5 w-5" />
                    </div>
                    <div className="flex-1">
                      <div className="font-bold text-sm">Baixar PDF</div>
                      <div className="text-xs text-slate-500">Salvar fatura em formato PDF</div>
                    </div>
                    {isGeneratingPDF && <div className="animate-spin h-4 w-4 border-2 border-slate-900 border-t-transparent rounded-full" />}
                  </div>
                </CardContent>
              </Card>

              {guestsWithItems.length > 0 && (
                <Card className="border border-slate-200 dark:border-slate-800">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-4 mb-3">
                      <div className="p-3 rounded-lg bg-slate-900 text-white">
                        <Users className="h-5 w-5" />
                      </div>
                      <div>
                        <div className="font-bold text-sm">Imprimir por Convidado</div>
                        <div className="text-xs text-slate-500">
                          {guestsWithItems.length === 1 ? "Fatura individual do cliente" : "Fatura individual para cada cliente"}
                        </div>
                      </div>
                    </div>

                    <div className="space-y-2">
                      {guestsWithItems.map((og) => {
                        const {
                          guest,
                          orders,
                          subtotal,
                          totalAmount: guestTotal,
                          discounts,
                          serviceCharges,
                        } = transformGuestDataForPrint(og);

                        return (
                          <div
                            key={og.guest.id}
                            className="flex items-center justify-between p-2 rounded-lg bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800"
                          >
                            <div>
                              <div className="text-sm font-medium">{guest.name || `Cliente ${guest.guestNumber}`}</div>
                              <div className="text-xs text-slate-500">
                                {orders.length === 0 ? "Sem itens" : formatKwanza(subtotal)}
                              </div>
                            </div>

                            {orders.length > 0 && (
                              <PrintGuestBill
                                guest={guest}
                                orders={orders}
                                subtotal={subtotal}
                                discounts={discounts}
                                serviceCharges={serviceCharges}
                                totalAmount={guestTotal}
                                tableName={`Mesa ${table.number}`}
                                restaurantName={restaurant?.name}
                                restaurantAddress={restaurant?.address}
                                restaurantPhone={restaurant?.phone}
                                restaurantNIF={restaurant?.nif}
                                paymentMethod={payment.paymentMethod}
                                variant="ghost"
                                size="sm"
                              />
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </ScrollArea>

        <div className="flex justify-center pt-4 border-t bg-background">
          <Button
            variant="outline"
            size="lg"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onClose();
            }}
            className="min-w-[200px]"
            type="button"
          >
            <X className="h-4 w-4 mr-2" />
            Fechar
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
