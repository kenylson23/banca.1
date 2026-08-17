import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Printer, ChevronDown, Download, Eye } from "lucide-react";
import { formatKwanza } from "@/lib/formatters";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
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
  restaurantLogoUrl?: string;
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
  restaurantLogoUrl,
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

  const paymentMethodLabels: Record<string, string> = {
    dinheiro: "Dinheiro",
    multicaixa: "Multicaixa",
    transferencia: "Transferência Bancária",
    cartao: "Cartão",
  };

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

    const sumOfItems = orders.flatMap(order => order.items).reduce((sum, item) => sum + parseFloat(item.totalPrice), 0);
    const calculatedSubtotal = subtotal || sumOfItems;
    const finalTotalAmount = Math.max(totalAmount, sumOfItems);

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
      entryTime: format(new Date(guest.joinedAt), "dd/MM/yyyy HH:mm", { locale: ptBR }),
      createdAt: new Date().toISOString(),
      items: allItems,
      subtotal: formatKwanza(calculatedSubtotal.toFixed(2)),
      discount: totalDiscounts > 0 ? formatKwanza(totalDiscounts.toFixed(2)) : undefined,
      serviceCharge: totalCharges > 0 ? formatKwanza(totalCharges.toFixed(2)) : undefined,
      total: formatKwanza(finalTotalAmount.toFixed(2)),
      paymentMethod: paymentMethod ? paymentMethodLabels[paymentMethod] || paymentMethod : undefined,
      isPaid: guest.status === "pago",
      documentId: guest.id.substring(0, 8).toUpperCase(),
      restaurantName,
      restaurantAddress,
      restaurantPhone,
      restaurantNIF,
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
  const totalValue = isBill ? billDoc.total : formatKwanza(totalAmount.toFixed(2));
  const paymentMethodValue = isBill ? billDoc.paymentMethod : paymentMethod ? paymentMethodLabels[paymentMethod] || paymentMethod : undefined;
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
        restaurantLogoUrl,
        tableName,
        guestName,
        guestNumber,
        entryTime,
        items: (orders || []).flatMap(order => order.items.map(item => ({
          name: item.menuItemName,
          quantity: item.quantity,
          price: formatKwanza(parseFloat(item.unitPrice)),
          total: formatKwanza(parseFloat(item.totalPrice)),
        }))),
        subtotal: typeof subtotalValue === 'string' ? subtotalValue : undefined,
        discount: typeof discountValue === 'string' ? discountValue : undefined,
        serviceCharge: typeof serviceChargeValue === 'string' ? serviceChargeValue : undefined,
        total: typeof totalValue === 'string' ? totalValue : formatKwanza(totalAmount.toFixed(2)),
        paymentMethod: typeof paymentMethodValue === 'string' ? paymentMethodValue : undefined,
        isPaid: typeof isPaidValue === 'boolean' ? isPaidValue : guest.status === 'pago',
        orderCount: orders.length,
        documentId: documentIdValue,
        timestamp: format(new Date(), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR }),
      });

      toast({
        title: "Conta impressa",
        description: `Conta de ${guestName} enviada para impressora térmica`,
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
    const fileName = `Conta_${guestDisplayName.replace(/\s+/g, "_")}_${format(new Date(), "yyyyMMdd_HHmm")}.html`;

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
        title: "Recibo baixado",
        description: "O arquivo HTML foi salvo com sucesso",
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
      <Button variant={variant} size={size} onClick={handlePrintBrowser} disabled={printing} title="Imprimir conta individual">
        <Printer className={isIconOnly ? "h-4 w-4" : "h-4 w-4 mr-2"} />
        {!isIconOnly && "Imprimir"}
      </Button>
    );
  }

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant={variant} size={size} disabled={printing} title="Imprimir conta individual">
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
              <span>Visualizar Antes</span>
              <span className="text-xs text-muted-foreground">Preview da conta</span>
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
              <span>Baixar Recibo</span>
              <span className="text-xs text-muted-foreground">Salvar arquivo HTML</span>
            </div>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <Dialog open={showPreview} onOpenChange={setShowPreview}>
        <DialogContent className="max-w-4xl max-h-[90vh]">
          <DialogHeader>
            <DialogTitle>Preview da Conta - {guest.name || `Cliente ${guest.guestNumber}`}</DialogTitle>
          </DialogHeader>
          <div className="overflow-auto max-h-[70vh] border rounded-lg">
            <iframe srcDoc={previewHtml} className="w-full h-[600px] border-0" title="Preview da Conta" />
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
