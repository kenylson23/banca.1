import { useState } from "react";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { Printer, ChevronDown, Download, Eye } from "lucide-react";
import { invoiceDate, invoiceMoney, formatPaymentMethodLabel } from "@shared/invoice-formatters";
import { printerService } from "@/lib/printer-service";
import { usePrinter } from "@/hooks/usePrinter";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { buildReceiptHtml, type ReceiptDocument, type ReceiptItem } from "@/components/ReceiptPreview";

export interface GuestOrderItem {
  id: string;
  menuItemName: string;
  quantity: number;
  unitPrice: string;
  totalPrice: string;
}

export interface GuestOrder {
  orderId: string;
  orderStatus: string;
  totalAmount: string;
  createdAt: Date;
  items: GuestOrderItem[];
}

export interface TableGuest {
  id: string;
  sessionId: string;
  name: string | null;
  guestNumber: number;
  status: string;
  totalSpent: string;
  joinedAt: Date;
}

interface PrintGuestBillProps {
  guest: TableGuest;
  orders: GuestOrder[];
  totalAmount: number;
  tableName?: string;
  restaurantName?: string;
  restaurantAddress?: string;
  restaurantPhone?: string;
  restaurantNIF?: string;
  restaurantFiscalAddress?: string;
  restaurantVatRegime?: string;
  restaurantVatRate?: string | number;
  restaurantDocumentSeries?: string;
  restaurantInvoicePrefix?: string;
  restaurantEmail?: string;
  restaurantWebsite?: string;
  restaurantWhatsappNumber?: string;
  restaurantLogoUrl?: string;
  legalFooter?: string;
  paymentMethod?: string;
  variant?: "default" | "outline" | "ghost";
  size?: "default" | "sm" | "lg" | "icon";

  discounts?: Array<{
    description: string;
    amount: number;
    type: "percentage" | "fixed";
  }>;
  serviceCharges?: Array<{
    description: string;
    amount: number;
    type: "percentage" | "fixed";
  }>;
  subtotal?: number;

  sharedItems?: Array<{
    itemId: string;
    sharedWith: string[];
    originalQuantity: number;
    sharePortion: number;
  }>;

  itemMovements?: Array<{
    timestamp: Date;
    description: string;
    fromGuest?: string;
    toGuest?: string;
  }>;
}

export function PrintGuestBill({
  guest,
  orders,
  totalAmount,
  tableName = "Mesa",
  restaurantName = "NaBancada",
  restaurantAddress,
  restaurantPhone,
  restaurantNIF,
  restaurantFiscalAddress,
  restaurantVatRegime,
  restaurantVatRate,
  restaurantDocumentSeries,
  restaurantInvoicePrefix,
  restaurantEmail,
  restaurantWebsite,
  restaurantWhatsappNumber,
  restaurantLogoUrl,
  legalFooter,
  paymentMethod,
  variant = "ghost",
  size = "sm",
  discounts = [],
  serviceCharges = [],
  subtotal,
  sharedItems = [],
  itemMovements = [],
}: PrintGuestBillProps) {
  const isIconOnly = size === "icon";
  const { getPrinterByType } = usePrinter();
  const { toast } = useToast();
  const [printing, setPrinting] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [previewHtml, setPreviewHtml] = useState("");

  const thermalPrinter = getPrinterByType("receipt");

  const buildBillDoc = (): ReceiptDocument => {
    const allItems: ReceiptItem[] = [];
    orders.forEach(order => {
      order.items.forEach(item => {
        const sharedInfo = sharedItems.find(si => si.itemId === item.id);
        const itemName = sharedInfo
          ? `${item.menuItemName} (${sharedInfo.sharePortion}/${sharedInfo.originalQuantity} - compartilhado com ${sharedInfo.sharedWith.join(", ")})`
          : item.menuItemName;

        allItems.push({
          name: itemName,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          total: item.totalPrice,
          options: [],
          notes: undefined,
        });
      });
    });

    const sumOfItems = orders.flatMap(order => order.items).reduce((sum, item) => {
      const itemTotal = parseFloat(item.totalPrice || '0');
      const fallbackTotal = parseFloat(item.unitPrice || '0') * (item.quantity || 0);
      return sum + (Number.isFinite(itemTotal) && itemTotal > 0 ? itemTotal : fallbackTotal);
    }, 0);
    const calculatedSubtotal = (subtotal && Number(subtotal) > 0) ? Number(subtotal) : sumOfItems;
    const finalTotalAmount = Math.max(totalAmount, calculatedSubtotal, sumOfItems);

    const totalDiscounts = discounts.reduce((sum, d) => {
      const amount = d.type === "percentage" ? (calculatedSubtotal * d.amount) / 100 : d.amount;
      return sum + amount;
    }, 0);

    const totalCharges = serviceCharges.reduce((sum, c) => {
      const amount = c.type === "percentage" ? (calculatedSubtotal * c.amount) / 100 : c.amount;
      return sum + amount;
    }, 0);

    return {
      kind: "bill",
      guestName: guest.name || `Cliente ${guest.guestNumber}`,
      guestNumber: guest.guestNumber,
      tableName,
       entryTime: invoiceDate(guest.joinedAt),
      createdAt: new Date().toISOString(),
      items: allItems,
       subtotal: invoiceMoney(calculatedSubtotal),
       discount: totalDiscounts > 0 ? invoiceMoney(totalDiscounts) : undefined,
       serviceCharge: totalCharges > 0 ? invoiceMoney(totalCharges) : undefined,
       total: invoiceMoney(finalTotalAmount),
       paymentMethod: paymentMethod ? formatPaymentMethodLabel(paymentMethod) : undefined,
      isPaid: guest.status === "pago",
      documentId: guest.id.substring(0, 8).toUpperCase(),
      restaurantName,
      restaurantAddress,
      restaurantPhone,
      restaurantNIF,
       restaurantFiscalAddress,
       restaurantVatRegime,
       restaurantVatRate,
       restaurantDocumentSeries,
       restaurantInvoicePrefix,
       restaurantEmail,
       restaurantWebsite,
       restaurantWhatsappNumber,
        legalFooter,
    };
  };

  const billDoc = buildBillDoc();
  const billHtml = buildReceiptHtml(billDoc, 80);

  const isBill = billDoc.kind === "bill";
  const guestName = isBill ? billDoc.guestName : guest.name || `Cliente ${guest.guestNumber}`;
  const guestNumber = isBill ? billDoc.guestNumber : guest.guestNumber;
  const entryTime = isBill ? billDoc.entryTime || "" : "";
  const subtotalValue = isBill ? billDoc.subtotal : undefined;
  const discountValue = isBill ? billDoc.discount : undefined;
  const serviceChargeValue = isBill ? billDoc.serviceCharge : undefined;
  const totalValue = isBill ? billDoc.total : invoiceMoney(totalAmount);
  const paymentMethodValue = isBill ? billDoc.paymentMethod : paymentMethod ? formatPaymentMethodLabel(paymentMethod) : undefined;
  const isPaidValue = isBill ? billDoc.isPaid || false : guest.status === "pago";
  const documentIdValue = isBill ? billDoc.documentId || guest.id.substring(0, 8).toUpperCase() : guest.id.substring(0, 8).toUpperCase();

  const handlePrintThermal = async () => {
    setPrinting(true);
    try {
      await printerService.printGuestBill("receipt", {
        restaurantName,
        restaurantAddress,
        restaurantPhone,
        restaurantNIF,
        fiscalAddress: restaurantFiscalAddress,
        vatRegime: restaurantVatRegime,
        vatRate: restaurantVatRate != null ? `${restaurantVatRate}%` : undefined,
        documentSeries: restaurantDocumentSeries,
        invoicePrefix: restaurantInvoicePrefix,
        restaurantEmail,
        website: restaurantWebsite,
        whatsappNumber: restaurantWhatsappNumber,
        legalFooter,
        restaurantLogoUrl,
        tableName,
        guestName,
        guestNumber,
        entryTime,
        items: (orders || []).flatMap(order => order.items.map(item => ({
          name: item.menuItemName,
          quantity: item.quantity,
          price: invoiceMoney(item.unitPrice),
          total: invoiceMoney(item.totalPrice),
        }))),
        subtotal: typeof subtotalValue === 'string' ? subtotalValue : undefined,
        discount: typeof discountValue === 'string' ? discountValue : undefined,
        serviceCharge: typeof serviceChargeValue === 'string' ? serviceChargeValue : undefined,
         total: typeof totalValue === 'string' ? totalValue : invoiceMoney(totalAmount),
        paymentMethod: typeof paymentMethodValue === 'string' ? paymentMethodValue : undefined,
        isPaid: typeof isPaidValue === 'boolean' ? isPaidValue : guest.status === 'pago',
        orderCount: orders.length,
        documentId: documentIdValue,
         timestamp: invoiceDate(new Date()),
      });

      toast({
        title: "Conta provisória impressa",
        description: `Conta da Mesa de ${guestName} enviada para impressora térmica`,
      });
    } catch (error) {
      toast({
        title: "Erro ao imprimir",
        description: error instanceof Error ? error.message : "Erro desconhecido",
        variant: "destructive",
      });
    } finally {
      setPrinting(false);
    }
  };

  const handlePrintBrowser = () => {
    const printWindow = window.open("", "_blank");
    if (!printWindow) return;
    printWindow.document.write(billHtml);
    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => printWindow.print(), 150);
  };

  const handleDownloadReceipt = () => {
    const guestDisplayName = guest.name || `Cliente ${guest.guestNumber}`;
    const fileName = `Conta_da_Mesa_${guestDisplayName.replace(/\s+/g, "_")}_${format(new Date(), "yyyyMMdd_HHmm")}.html`;

    try {
      const blob = new Blob([billHtml], { type: "text/html" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      toast({
        title: "Conta provisória baixada",
        description: "A Conta da Mesa foi salva como arquivo HTML",
      });
    } catch (error) {
      toast({
        title: "Erro",
        description: "Não foi possível baixar o recibo",
        variant: "destructive",
      });
    }
  };

  const handlePreview = () => {
    setPreviewHtml(billHtml);
    setShowPreview(true);
  };

  if (!thermalPrinter) {
    return (
      <Button variant={variant} size={size} onClick={handlePrintBrowser} disabled={printing} title="Imprimir conta provisória">
        <Printer className={isIconOnly ? "h-4 w-4" : "h-4 w-4 mr-2"} />
        {!isIconOnly && "Imprimir"}
      </Button>
    );
  }

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
            <Button variant={variant} size={size} disabled={printing} title="Imprimir conta provisória">
            <Printer className={isIconOnly ? "h-4 w-4" : "h-4 w-4 mr-2"} />
            {!isIconOnly && "Imprimir"}
            {!isIconOnly && <ChevronDown className="h-3 w-3 ml-1" />}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          <DropdownMenuLabel>Opções de Impressão</DropdownMenuLabel>
          <DropdownMenuSeparator />

          <DropdownMenuItem onClick={handlePreview} disabled={printing}>
            <Eye className="h-4 w-4 mr-2" />
            <div className="flex flex-col">
              <span>Visualizar Conta da Mesa</span>
              <span className="text-xs text-muted-foreground">Total provisório · Pendente</span>
            </div>
          </DropdownMenuItem>

          <DropdownMenuSeparator />

          <DropdownMenuItem onClick={handlePrintThermal} disabled={printing}>
            <Printer className="h-4 w-4 mr-2" />
            <div className="flex flex-col">
              <span>Impressora Térmica</span>
              <span className="text-xs text-muted-foreground">Recibo 80mm</span>
            </div>
          </DropdownMenuItem>

          <DropdownMenuItem onClick={handlePrintBrowser} disabled={printing}>
            <Printer className="h-4 w-4 mr-2" />
            <div className="flex flex-col">
              <span>Impressão Rápida</span>
              <span className="text-xs text-muted-foreground">Navegador padrão</span>
            </div>
          </DropdownMenuItem>

          <DropdownMenuSeparator />

          <DropdownMenuItem onClick={handleDownloadReceipt}>
            <Download className="h-4 w-4 mr-2" />
            <div className="flex flex-col">
              <span>Baixar Conta Provisória</span>
              <span className="text-xs text-muted-foreground">Salvar arquivo HTML</span>
            </div>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <Dialog open={showPreview} onOpenChange={setShowPreview}>
        <DialogContent className="max-w-4xl max-h-[90vh]">
          <DialogHeader>
            <DialogTitle>Conta da Mesa · {guest.name || `Cliente ${guest.guestNumber}`}</DialogTitle>
          </DialogHeader>
          <div className="overflow-auto max-h-[70vh] border rounded-lg">
            <iframe srcDoc={previewHtml} className="w-full h-[600px] border-0" title="Preview da Conta da Mesa" />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowPreview(false)}>
              Cancelar
            </Button>
            <Button onClick={() => { setShowPreview(false); handlePrintBrowser(); }}>
              <Printer className="h-4 w-4 mr-2" />
              Confirmar e Imprimir
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
