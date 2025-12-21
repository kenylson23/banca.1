import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Printer, ChevronDown, Download, FileText } from 'lucide-react';
import { formatKwanza } from '@/lib/formatters';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { printerService } from '@/lib/printer-service';
import { usePrinter } from '@/hooks/usePrinter';
import QRCode from 'qrcode';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";
import { useToast } from '@/hooks/use-toast';

interface GuestOrderItem {
  id: string;
  menuItemName: string;
  quantity: number;
  unitPrice: string;
  totalPrice: string;
}

interface GuestOrder {
  orderId: string;
  orderStatus: string;
  totalAmount: string;
  createdAt: Date;
  items: GuestOrderItem[];
}

interface TableGuest {
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
  variant?: 'default' | 'outline' | 'ghost';
  size?: 'default' | 'sm' | 'lg' | 'icon';
}

export function PrintGuestBill({ 
  guest,
  orders,
  totalAmount,
  tableName = 'Mesa',
  restaurantName = 'NaBancada',
  restaurantAddress,
  restaurantPhone,
  restaurantNIF,
  restaurantLogoUrl,
  paymentMethod,
  variant = 'ghost',
  size = 'sm'
}: PrintGuestBillProps) {
  const isIconOnly = size === 'icon';
  const { getPrinterByType } = usePrinter();
  const { toast } = useToast();
  const [printing, setPrinting] = useState(false);

  const thermalPrinter = getPrinterByType('receipt');

  const paymentMethodLabels: Record<string, string> = {
    dinheiro: 'Dinheiro',
    multicaixa: 'Multicaixa',
    transferencia: 'Transferência Bancária',
    cartao: 'Cartão',
  };

  const handlePrintThermal = async () => {
    setPrinting(true);
    try {
      // Consolidar todos os itens de todos os pedidos
      const allItems: Array<{ name: string; quantity: number; price: string; total: string }> = [];
      
      orders.forEach(order => {
        order.items.forEach(item => {
          allItems.push({
            name: item.menuItemName,
            quantity: item.quantity,
            price: formatKwanza(item.unitPrice),
            total: formatKwanza(item.totalPrice),
          });
        });
      });

      const guestDisplayName = guest.name || `Cliente ${guest.guestNumber}`;
      
      // Usar a função especializada printGuestBill com formato térmico detalhado
      await printerService.printGuestBill('receipt', {
        restaurantName: restaurantName,
        restaurantAddress: restaurantAddress,
        restaurantPhone: restaurantPhone,
        restaurantNIF: restaurantNIF,
        restaurantLogoUrl: restaurantLogoUrl,
        tableName: tableName,
        guestName: guestDisplayName,
        guestNumber: guest.guestNumber,
        entryTime: format(new Date(guest.joinedAt), "dd/MM/yyyy HH:mm", { locale: ptBR }),
        items: allItems,
        subtotal: formatKwanza(totalAmount.toFixed(2)),
        serviceCharge: undefined, // Pode ser calculado se aplicável
        discount: undefined, // Pode ser calculado se aplicável
        total: formatKwanza(totalAmount.toFixed(2)),
        paymentMethod: paymentMethod ? paymentMethodLabels[paymentMethod] || paymentMethod : undefined,
        isPaid: guest.status === 'pago',
        orderCount: orders.length,
        documentId: guest.id.substring(0, 8).toUpperCase(),
        timestamp: format(new Date(), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR }),
      });

      toast({
        title: 'Conta impressa',
        description: `Conta de ${guestDisplayName} enviada para impressora térmica`,
      });
    } catch (error) {
      toast({
        title: 'Erro ao imprimir',
        description: error instanceof Error ? error.message : 'Erro desconhecido',
        variant: 'destructive',
      });
    } finally {
      setPrinting(false);
    }
  };

  const generateReceiptHTML = async (forPDF: boolean = false) => {
    const guestDisplayName = guest.name || `Cliente ${guest.guestNumber}`;
    
    // Gerar QR Code
    const trackingUrl = `${window.location.origin}/track-order?id=${guest.id.substring(0, 8).toUpperCase()}`;
    let qrCodeDataUrl = '';
    
    try {
      qrCodeDataUrl = await QRCode.toDataURL(trackingUrl, {
        width: forPDF ? 200 : 150,
        margin: 2,
        errorCorrectionLevel: 'M',
        color: {
          dark: '#000000',
          light: '#FFFFFF'
        }
      });
    } catch (error) {
      console.error('Erro ao gerar QR Code:', error);
    }
    
    return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <title>Conta Individual - ${guestDisplayName}</title>
          <style>
            * {
              margin: 0;
              padding: 0;
              box-sizing: border-box;
            }
            
            @media print {
              @page {
                margin: ${forPDF ? '2cm' : '1cm'};
                size: ${forPDF ? 'A4' : 'auto'};
              }
              
              body {
                print-color-adjust: exact;
                -webkit-print-color-adjust: exact;
              }
            }
            
            body {
              font-family: ${forPDF ? "'Arial', sans-serif" : "'Courier New', monospace"};
              padding: ${forPDF ? '40px' : '20px'};
              max-width: ${forPDF ? '210mm' : '800px'};
              margin: 0 auto;
              background: white;
              ${forPDF ? 'box-shadow: 0 0 10px rgba(0,0,0,0.1);' : ''}
            }
            
            .header {
              text-align: center;
              margin-bottom: 30px;
              padding-bottom: 20px;
              border-bottom: ${forPDF ? '3px solid #2563eb' : '2px dashed #333'};
              ${forPDF ? 'background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%); color: white; padding: 20px; margin: -40px -40px 30px -40px;' : ''}
            }
            
            .restaurant-logo {
              max-width: ${forPDF ? '150px' : '120px'};
              height: auto;
              margin: 0 auto ${forPDF ? '20px' : '15px'} auto;
              display: block;
              ${forPDF ? 'background: white; padding: 10px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);' : ''}
            }
            
            .header h1 {
              font-size: ${forPDF ? '32px' : '24px'};
              margin-bottom: ${forPDF ? '10px' : '5px'};
              ${forPDF ? 'text-transform: uppercase; letter-spacing: 2px;' : ''}
            }
            
            .header h2 {
              font-size: ${forPDF ? '22px' : '18px'};
              font-weight: ${forPDF ? 'bold' : 'normal'};
              margin-bottom: 10px;
              ${forPDF ? 'opacity: 0.95;' : ''}
            }
            
            ${forPDF ? `
            .header-subtitle {
              font-size: 14px;
              opacity: 0.9;
              margin-top: 5px;
            }
            ` : ''}
            
            .info {
              margin: ${forPDF ? '25px 0' : '15px 0'};
              font-size: ${forPDF ? '15px' : '14px'};
              ${forPDF ? 'background: #f8fafc; padding: 20px; border-radius: 8px; border-left: 4px solid #3b82f6;' : ''}
            }
            
            .info-row {
              display: flex;
              justify-content: space-between;
              margin: ${forPDF ? '10px 0' : '5px 0'};
              ${forPDF ? 'padding: 5px 0;' : ''}
            }
            
            ${forPDF ? `
            .info-label {
              font-weight: 600;
              color: #475569;
            }
            
            .info-value {
              color: #1e293b;
              font-weight: 500;
            }
            ` : ''}
            
            .items {
              margin: ${forPDF ? '30px 0' : '20px 0'};
            }
            
            .items-header {
              font-size: ${forPDF ? '18px' : '14px'};
              font-weight: bold;
              margin-bottom: ${forPDF ? '15px' : '10px'};
              ${forPDF ? 'color: #1e293b; text-transform: uppercase; letter-spacing: 1px;' : ''}
            }
            
            .item {
              display: flex;
              justify-content: space-between;
              margin: ${forPDF ? '12px 0' : '8px 0'};
              font-size: ${forPDF ? '15px' : '14px'};
              ${forPDF ? 'padding: 10px; background: #ffffff; border-radius: 4px; transition: background 0.2s;' : ''}
            }
            
            ${forPDF ? `
            .item:hover {
              background: #f1f5f9;
            }
            ` : ''}
            
            .item-name {
              flex: 1;
              ${forPDF ? 'font-weight: 500; color: #334155;' : ''}
            }
            
            .item-qty {
              width: ${forPDF ? '80px' : '60px'};
              text-align: center;
              ${forPDF ? 'color: #64748b; font-weight: 500;' : ''}
            }
            
            .item-price {
              width: ${forPDF ? '120px' : '100px'};
              text-align: right;
              ${forPDF ? 'color: #64748b;' : ''}
            }
            
            .item-total {
              width: ${forPDF ? '140px' : '120px'};
              text-align: right;
              font-weight: bold;
              ${forPDF ? 'color: #1e293b;' : ''}
            }
            
            .separator {
              border-top: ${forPDF ? '2px solid #e2e8f0' : '1px dashed #666'};
              margin: ${forPDF ? '20px 0' : '15px 0'};
            }
            
            .total-section {
              margin-top: ${forPDF ? '30px' : '20px'};
              padding: ${forPDF ? '25px' : '15px 0'};
              border-top: ${forPDF ? '3px solid #2563eb' : '2px solid #333'};
              ${forPDF ? 'background: #f8fafc; margin-left: -40px; margin-right: -40px; padding-left: 40px; padding-right: 40px;' : ''}
            }
            
            .total-row {
              display: flex;
              justify-content: space-between;
              font-size: ${forPDF ? '24px' : '18px'};
              font-weight: bold;
              margin: 10px 0;
              ${forPDF ? 'color: #1e293b;' : ''}
            }
            
            ${forPDF ? `
            .payment-info {
              margin-top: 20px;
              padding: 15px;
              background: white;
              border-radius: 8px;
              border: 2px solid #e2e8f0;
            }
            
            .payment-method {
              font-size: 16px;
              color: #475569;
              margin: 10px 0;
            }
            ` : ''}
            
            .footer {
              margin-top: ${forPDF ? '40px' : '30px'};
              padding-top: ${forPDF ? '25px' : '15px'};
              border-top: ${forPDF ? '2px solid #e2e8f0' : '2px dashed #333'};
              text-align: center;
              font-size: ${forPDF ? '13px' : '12px'};
              color: ${forPDF ? '#64748b' : '#666'};
            }
            
            .footer-info {
              margin: ${forPDF ? '8px 0' : '5px 0'};
            }
            
            .status-paid {
              background-color: ${forPDF ? '#10b981' : '#10b981'};
              color: white;
              padding: ${forPDF ? '8px 16px' : '5px 10px'};
              border-radius: ${forPDF ? '8px' : '5px'};
              display: inline-block;
              margin: ${forPDF ? '15px 0' : '10px 0'};
              ${forPDF ? 'font-size: 16px; font-weight: 600; box-shadow: 0 2px 4px rgba(16, 185, 129, 0.3);' : ''}
            }
            
            .status-pending {
              background-color: #f59e0b;
              color: white;
              padding: ${forPDF ? '8px 16px' : '5px 10px'};
              border-radius: ${forPDF ? '8px' : '5px'};
              display: inline-block;
              margin: ${forPDF ? '15px 0' : '10px 0'};
              ${forPDF ? 'font-size: 16px; font-weight: 600; box-shadow: 0 2px 4px rgba(245, 158, 11, 0.3);' : ''}
            }
            
            ${forPDF ? `
            .qr-code-section {
              margin: 30px 0;
              padding: 20px;
              background: #f8fafc;
              border-radius: 8px;
              text-align: center;
              border: 2px dashed #cbd5e1;
            }
            
            .qr-code-image {
              max-width: 200px;
              height: auto;
              margin: 10px auto;
              display: block;
            }
            
            .qr-code-label {
              font-size: 14px;
              color: #64748b;
              margin-bottom: 10px;
              font-weight: 600;
            }
            
            .tracking-url {
              font-size: 11px;
              color: #94a3b8;
              word-break: break-all;
              margin-top: 10px;
            }
            
            .document-id {
              font-size: 12px;
              color: #94a3b8;
              margin-top: 20px;
              letter-spacing: 1px;
            }
            ` : `
            .qr-code-section {
              margin: 20px 0;
              padding: 15px;
              text-align: center;
              border: 1px solid #ddd;
            }
            
            .qr-code-image {
              max-width: 150px;
              height: auto;
              margin: 10px auto;
              display: block;
            }
            
            .qr-code-label {
              font-size: 13px;
              color: #666;
              margin-bottom: 8px;
            }
            `}
            
            @media print {
              .no-print {
                display: none;
              }
            }
          </style>
        </head>
        <body>
          <div class="header">
            ${restaurantLogoUrl ? `<img src="${restaurantLogoUrl}" alt="${restaurantName} Logo" class="restaurant-logo" />` : ''}
            <h1>${restaurantName}</h1>
            <h2>CONTA INDIVIDUAL</h2>
            ${forPDF ? `<div class="header-subtitle">Documento de Controle Interno</div>` : ''}
          </div>
          
          <div class="info">
            <div class="info-row">
              <span class="${forPDF ? 'info-label' : ''}"><strong>Mesa:</strong> ${tableName}</span>
              <span class="${forPDF ? 'info-value' : ''}"><strong>Data:</strong> ${format(new Date(), "dd/MM/yyyy", { locale: ptBR })}</span>
            </div>
            <div class="info-row">
              <span class="${forPDF ? 'info-label' : ''}"><strong>Cliente:</strong> ${guestDisplayName}</span>
              <span class="${forPDF ? 'info-value' : ''}"><strong>Hora:</strong> ${format(new Date(), "HH:mm", { locale: ptBR })}</span>
            </div>
            <div class="info-row">
              <span class="${forPDF ? 'info-label' : ''}"><strong>Entrada:</strong> ${format(new Date(guest.joinedAt), "HH:mm", { locale: ptBR })}</span>
              ${forPDF ? `<span class="info-value"><strong>Pedidos:</strong> ${orders.length}</span>` : ''}
            </div>
          </div>
          
          <div class="separator"></div>
          
          <div class="items">
            ${forPDF ? '<div class="items-header">Itens Consumidos</div>' : ''}
            <div class="item" style="font-weight: bold; border-bottom: ${forPDF ? '2px' : '1px'} solid #333; padding-bottom: 5px; margin-bottom: 10px;">
              <span class="item-name">ITEM</span>
              <span class="item-qty">QTD</span>
              <span class="item-price">PREÇO</span>
              <span class="item-total">TOTAL</span>
            </div>
            ${orders.flatMap(order => 
              order.items.map(item => `
                <div class="item">
                  <span class="item-name">${item.menuItemName}</span>
                  <span class="item-qty">${item.quantity}</span>
                  <span class="item-price">${formatKwanza(item.unitPrice)}</span>
                  <span class="item-total">${formatKwanza(item.totalPrice)}</span>
                </div>
              `).join('')
            ).join('')}
          </div>
          
          <div class="total-section">
            <div class="total-row">
              <span>TOTAL A PAGAR:</span>
              <span>${formatKwanza(totalAmount.toFixed(2))}</span>
            </div>
            ${forPDF && paymentMethod ? `
            <div class="payment-info">
              <div class="payment-method">
                <strong>Forma de Pagamento:</strong> ${paymentMethodLabels[paymentMethod] || paymentMethod}
              </div>
            </div>
            ` : ''}
          </div>
          
          ${qrCodeDataUrl ? `
          <div class="qr-code-section">
            <div class="qr-code-label">Rastreamento do Pedido</div>
            <img src="${qrCodeDataUrl}" alt="QR Code" class="qr-code-image" />
            <div class="footer-info">Escaneie para acompanhar</div>
            ${forPDF ? `<div class="tracking-url">${trackingUrl}</div>` : ''}
          </div>
          ` : ''}
          
          <div class="footer">
            ${!forPDF && paymentMethod ? `<div class="footer-info"><strong>Forma de Pagamento:</strong> ${paymentMethodLabels[paymentMethod] || paymentMethod}</div>` : ''}
            ${guest.status === 'pago' ? '<div class="status-paid">✓ PAGO</div>' : forPDF ? '<div class="status-pending">⏳ PENDENTE</div>' : ''}
            <div class="footer-info">Documento sem valor fiscal</div>
            <div class="footer-info">${format(new Date(), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}</div>
            ${forPDF ? `<div class="document-id">ID: ${guest.id.substring(0, 8).toUpperCase()}</div>` : ''}
          </div>
          
          <div class="no-print" style="margin-top: 20px; text-align: center;">
            <button onclick="window.print()" style="padding: 10px 20px; font-size: 16px; cursor: pointer; background: #3b82f6; color: white; border: none; border-radius: 5px;">
              🖨️ Imprimir
            </button>
            <button onclick="window.close()" style="padding: 10px 20px; font-size: 16px; cursor: pointer; margin-left: 10px; background: #6b7280; color: white; border: none; border-radius: 5px;">
              ✕ Fechar
            </button>
          </div>
        </body>
      </html>
    `;
  };

  const handlePrintBrowser = async () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      toast({
        title: 'Erro',
        description: 'Não foi possível abrir janela de impressão',
        variant: 'destructive',
      });
      return;
    }

    try {
      const printContent = await generateReceiptHTML(false);
      printWindow.document.write(printContent);
      printWindow.document.close();
      
      // Auto print after a short delay
      setTimeout(() => {
        printWindow.print();
      }, 250);
    } catch (error) {
      printWindow.close();
      toast({
        title: 'Erro',
        description: 'Não foi possível gerar o recibo',
        variant: 'destructive',
      });
    }
  };

  const handlePrintPDF = async () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      toast({
        title: 'Erro',
        description: 'Não foi possível abrir janela de impressão',
        variant: 'destructive',
      });
      return;
    }

    try {
      const printContent = await generateReceiptHTML(true);
      printWindow.document.write(printContent);
      printWindow.document.close();
      
      toast({
        title: 'Recibo aberto',
        description: 'Use Ctrl+P ou Cmd+P para salvar como PDF',
      });
    } catch (error) {
      printWindow.close();
      toast({
        title: 'Erro',
        description: 'Não foi possível gerar o recibo',
        variant: 'destructive',
      });
    }
  };

  const handleDownloadReceipt = async () => {
    const guestDisplayName = guest.name || `Cliente ${guest.guestNumber}`;
    const fileName = `Conta_${guestDisplayName.replace(/\s+/g, '_')}_${format(new Date(), 'yyyyMMdd_HHmm')}.html`;
    
    try {
      const htmlContent = await generateReceiptHTML(true);
      const blob = new Blob([htmlContent], { type: 'text/html' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      toast({
        title: 'Recibo baixado',
        description: 'O arquivo HTML foi salvo com sucesso',
      });
    } catch (error) {
      toast({
        title: 'Erro',
        description: 'Não foi possível baixar o recibo',
        variant: 'destructive',
      });
    }
  };

  if (!thermalPrinter) {
    // Sem impressora térmica configurada, apenas botão simples
    return (
      <Button
        variant={variant}
        size={size}
        onClick={handlePrintBrowser}
        disabled={printing}
        title="Imprimir conta individual"
      >
        <Printer className={isIconOnly ? "h-4 w-4" : "h-4 w-4 mr-2"} />
        {!isIconOnly && "Imprimir"}
      </Button>
    );
  }

  // Com impressora térmica, mostrar dropdown com todas as opções
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant={variant}
          size={size}
          disabled={printing}
          title="Imprimir conta individual"
        >
          <Printer className={isIconOnly ? "h-4 w-4" : "h-4 w-4 mr-2"} />
          {!isIconOnly && "Imprimir"}
          {!isIconOnly && <ChevronDown className="h-3 w-3 ml-1" />}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel>Opções de Impressão</DropdownMenuLabel>
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
        
        <DropdownMenuItem onClick={handlePrintPDF} disabled={printing}>
          <FileText className="h-4 w-4 mr-2" />
          <div className="flex flex-col">
            <span>Formato PDF (A4)</span>
            <span className="text-xs text-muted-foreground">Layout profissional</span>
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
  );
}
