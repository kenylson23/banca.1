import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  CheckCircle2,
  Printer,
  Download,
  Users,
  FileText,
  X,
  Sparkles,
  Receipt,
  Clock,
  ChevronDown,
  ChevronUp,
  ShoppingBag,
  TrendingDown,
  Plus,
  Minus,
} from 'lucide-react';
import { formatKwanza } from '@/lib/formatters';
import { PrintGuestBill, type TableGuest, type GuestOrder, type GuestOrderItem } from './PrintGuestBill';
import { PrintInvoice } from './PrintInvoice';
import { PrintPayment } from './PrintPayment';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import type { OrdersByGuestData } from '@/../../shared/types';
import jsPDF from 'jspdf';

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

interface Table {
  id: string;
  number: string;
  capacity: number;
  status: string;
  area?: string;
  currentSessionId: string | null;
}

interface RestaurantInfo {
  id: string;
  name: string;
  address?: string;
  nif?: string;
  phone?: string;
}

interface CalculateTotals {
  subtotal: number;
  totalDiscounts: number;
  totalAdditions: number;
  finalTotal: number;
  breakdown: Array<{
    type: 'discount' | 'addition';
    label: string;
    value: number;
    source?: string;
  }>;
}

interface PaymentSuccessDialogProps {
  open: boolean;
  onClose: () => void;
  table: Table;
  payment: PaymentData;
  ordersByGuest: OrdersByGuestData['ordersByGuest'];
  calculateTotals: CalculateTotals;
  restaurant?: RestaurantInfo;
  sessionDuration?: string;
  totalAmount: number;
  onPrintComplete?: () => void;
}

export function PaymentSuccessDialog({
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
}: PaymentSuccessDialogProps) {
  const [expandedGuests, setExpandedGuests] = useState<Set<string>>(new Set());
  const [showCalculations, setShowCalculations] = useState(false);
  const [isPrinting, setIsPrinting] = useState(false);
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
  const { toast } = useToast();

  const toggleGuestExpanded = (guestId: string) => {
    setExpandedGuests((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(guestId)) {
        newSet.delete(guestId);
      } else {
        newSet.add(guestId);
      }
      return newSet;
    });
  };

  const safeNumber = (v: any) => {
    const n = typeof v === 'number' ? v : parseFloat(String(v ?? '0'));
    return Number.isFinite(n) ? n : 0;
  };

  // Total de ajustes de sessão (para ratear por convidado)
  const getSessionAdjustments = () => {
    const discountTotal = (calculateTotals.breakdown || [])
      .filter(i => i.type === 'discount')
      .reduce((sum, i) => sum + Math.abs(safeNumber(i.value)), 0);

    const additionsTotal = (calculateTotals.breakdown || [])
      .filter(i => i.type === 'addition')
      .reduce((sum, i) => sum + Math.abs(safeNumber(i.value)), 0);

    return { discountTotal, additionsTotal };
  };

  const getHostGuestId = () => {
    const sorted = [...(ordersByGuest || [])]
      .filter(g => g?.guest?.id && g.guest.id !== 'anonymous')
      .sort((a, b) => (a.guest.guestNumber || 0) - (b.guest.guestNumber || 0));
    return sorted[0]?.guest?.id;
  };

  // Transform OrdersByGuest data to PrintGuestBill format
  // ✅ Desconto: proporcional ao consumo
  // ✅ Taxa/Serviço: 100% atribuída ao anfitrião (Cliente #1)
  const transformGuestDataForPrint = (og: typeof ordersByGuest[0]) => {
    const guestSubtotal = safeNumber(og.subtotal);
    // ✅ Ajustes INDIVIDUAIS (por convidado) — não afetam os outros
    const guestDiscountRaw = safeNumber((og.guest as any).discount);
    const guestDiscountType = ((og.guest as any).discountType || 'valor') as 'valor' | 'percentual';

    const discountValue = guestDiscountRaw > 0
      ? (guestDiscountType === 'percentual'
          ? Math.min(guestSubtotal, guestSubtotal * (Math.min(guestDiscountRaw, 100) / 100))
          : Math.min(guestSubtotal, guestDiscountRaw))
      : 0;

    const afterDiscount = Math.max(0, guestSubtotal - discountValue);

    const guestServiceChargeRaw = safeNumber((og.guest as any).serviceCharge);
    const guestServiceChargeType = ((og.guest as any).serviceChargeType || 'valor') as 'valor' | 'percentual';

    const serviceChargeValue = guestServiceChargeRaw > 0
      ? (guestServiceChargeType === 'percentual'
          ? afterDiscount * (guestServiceChargeRaw / 100)
          : guestServiceChargeRaw)
      : 0;

    const guestDiscount = discountValue;
    const guestAdditions = serviceChargeValue;

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

    const totalAmount = Math.max(0, guestSubtotal - guestDiscount + guestAdditions);

    return {
      guest,
      orders,
      subtotal: guestSubtotal,
      totalAmount,
      discounts:
        guestDiscount > 0.009
          ? [{ description: 'Desconto do Cliente', amount: guestDiscount, type: 'fixed' as const }]
          : [],
      serviceCharges:
        guestAdditions > 0.009
          ? [{ description: 'Taxa/Serviço do Cliente', amount: guestAdditions, type: 'fixed' as const }]
          : [],
    };
  };

  const handlePrintComplete = async () => {
    setIsPrinting(true);
    
    try {
      const printWindow = window.open('', '_blank');
      if (!printWindow) {
        throw new Error('Não foi possível abrir a janela de impressão');
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
      console.error('Erro ao imprimir:', error);
      setIsPrinting(false);
    }
  };

  const generatePrintableInvoice = () => {
    const restaurantName = restaurant?.name || 'Restaurante';
    const restaurantAddress = restaurant?.address || '';
    const restaurantNIF = restaurant?.nif || '';
    const restaurantPhone = restaurant?.phone || '';
    
    // Get current date/time for print
    const printDateTime = new Date().toLocaleString('pt-PT');
    
    // Get user info (operator) from localStorage or auth context
    const operatorName = localStorage.getItem('userName') || 'Sistema';

    return `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Fatura - Mesa ${table.number}</title>
          <meta charset="UTF-8">
          <style>
            @media print {
              @page { margin: 0; }
              body { margin: 1cm; }
            }
            body { 
              font-family: 'Arial', sans-serif; 
              max-width: 80mm; 
              margin: 0 auto;
              font-size: 12px;
              line-height: 1.4;
            }
            .header { 
              text-align: center; 
              border-bottom: 2px solid #000;
              padding-bottom: 10px;
              margin-bottom: 10px;
            }
            .restaurant-name { 
              font-size: 18px; 
              font-weight: bold; 
              margin-bottom: 5px;
            }
            .restaurant-info { 
              font-size: 10px; 
              color: #666;
            }
            .invoice-info {
              margin: 10px 0;
              font-size: 11px;
              border-bottom: 1px dashed #999;
              padding-bottom: 10px;
            }
            .info-line {
              display: flex;
              justify-content: space-between;
              margin: 2px 0;
            }
            .section-title {
              font-weight: bold;
              margin-top: 15px;
              margin-bottom: 8px;
              font-size: 13px;
              text-transform: uppercase;
              border-bottom: 1px solid #000;
              padding-bottom: 3px;
            }
            .guest-section {
              margin: 10px 0;
              padding: 8px;
              background: #f9f9f9;
              border: 1px solid #ddd;
              border-radius: 4px;
            }
            .guest-header {
              font-weight: bold;
              margin-bottom: 8px;
              display: flex;
              justify-content: space-between;
              align-items: center;
              border-bottom: 1px dashed #999;
              padding-bottom: 5px;
            }
            .guest-number {
              display: inline-block;
              width: 24px;
              height: 24px;
              border-radius: 50%;
              background: #333;
              color: #fff;
              text-align: center;
              line-height: 24px;
              font-size: 11px;
              margin-right: 8px;
            }
            .item-line {
              display: flex;
              justify-content: space-between;
              padding: 3px 0;
              font-size: 11px;
            }
            .item-name {
              flex: 1;
            }
            .item-qty {
              margin-right: 8px;
              font-weight: bold;
            }
            .item-price {
              text-align: right;
              min-width: 60px;
            }
            .item-options {
              font-size: 9px;
              color: #666;
              margin-left: 10px;
              font-style: italic;
            }
            .subtotal {
              display: flex;
              justify-content: space-between;
              font-weight: bold;
              margin-top: 5px;
              padding-top: 5px;
              border-top: 1px dashed #999;
            }
            .calculations {
              margin-top: 15px;
              padding-top: 10px;
              border-top: 2px solid #000;
            }
            .calc-line {
              display: flex;
              justify-content: space-between;
              padding: 3px 0;
              font-size: 11px;
            }
            .calc-line.discount {
              color: #28a745;
            }
            .calc-line.addition {
              color: #007bff;
            }
            .calc-line.subtotal-line {
              font-size: 12px;
              padding-top: 5px;
            }
            .total-line {
              display: flex;
              justify-content: space-between;
              font-size: 16px;
              font-weight: bold;
              margin-top: 10px;
              padding-top: 10px;
              border-top: 2px solid #000;
            }
            .payment-info {
              margin-top: 15px;
              padding: 10px;
              background: #f0f0f0;
              border-radius: 4px;
            }
            .payment-line {
              display: flex;
              justify-content: space-between;
              margin: 3px 0;
              font-size: 11px;
            }
            .payment-line.highlight {
              font-weight: bold;
              font-size: 13px;
              margin-top: 5px;
              padding-top: 5px;
              border-top: 1px dashed #999;
            }
            .footer {
              margin-top: 20px;
              text-align: center;
              font-size: 10px;
              color: #666;
              border-top: 1px dashed #999;
              padding-top: 10px;
            }
            .validation-code {
              text-align: center;
              margin: 10px 0;
              font-size: 9px;
              color: #999;
            }
          </style>
        </head>
        <body>
          <!-- HEADER -->
          <div class="header">
            <div class="restaurant-name">${restaurantName}</div>
            ${restaurantAddress || restaurantNIF || restaurantPhone ? `
              <div class="restaurant-info">
                ${restaurantAddress ? `${restaurantAddress}<br>` : ''}
                ${restaurantNIF ? `NIF: ${restaurantNIF}<br>` : ''}
                ${restaurantPhone ? `Tel: ${restaurantPhone}` : ''}
              </div>
            ` : ''}
          </div>

          <!-- INVOICE INFO -->
          <div class="invoice-info">
            <div class="info-line">
              <strong>Fatura Nº:</strong>
              <span>${payment.id.substring(0, 8).toUpperCase()}</span>
            </div>
            <div class="info-line">
              <strong>Data:</strong>
              <span>${new Date(payment.createdAt).toLocaleString('pt-PT')}</span>
            </div>
            <div class="info-line">
              <strong>Mesa:</strong>
              <span>${table.number}${table.area ? ` (${table.area})` : ''}</span>
            </div>
            <div class="info-line">
              <strong>Convidados:</strong>
              <span>${ordersByGuest.length}</span>
            </div>
            ${sessionDuration ? `
              <div class="info-line">
                <strong>Duração:</strong>
                <span>${sessionDuration}</span>
              </div>
            ` : ''}
            ${payment.notes ? `
              <div class="info-line">
                <strong>Observações:</strong>
                <span>${payment.notes}</span>
              </div>
            ` : ''}
            <div class="info-line">
              <strong>Operador:</strong>
              <span>${operatorName}</span>
            </div>
            <div class="info-line">
              <strong>Impresso em:</strong>
              <span>${printDateTime}</span>
            </div>
          </div>

          <!-- ITEMS BY GUEST -->
          <div class="section-title">Itens Consumidos</div>
          ${ordersByGuest.map((og) => `
            <div class="guest-section">
              <div class="guest-header">
                <div>
                  <span class="guest-number">#${og.guest.guestNumber}</span>
                  ${og.guest.name || `Cliente ${og.guest.guestNumber}`}
                </div>
              </div>
              ${og.orders.flatMap(order => order.items || []).map(item => `
                <div class="item-line">
                  <span class="item-qty">${item.quantity}x</span>
                  <span class="item-name">${item.menuItem?.name || item.name}</span>
                  <span class="item-price">${formatKwanza(parseFloat(item.price) * item.quantity)}</span>
                </div>
                ${item.options && item.options.length > 0 ? `
                  <div class="item-options">
                    + ${item.options.map(o => o.value).join(', ')}
                  </div>
                ` : ''}
              `).join('')}
              <div class="subtotal">
                <span>Subtotal:</span>
                <span>${formatKwanza(parseFloat(og.subtotal))}</span>
              </div>
            </div>
          `).join('')}

          <!-- CALCULATIONS -->
          <div class="calculations">
            <div class="calc-line subtotal-line">
              <span>Subtotal</span>
              <span>${formatKwanza(calculateTotals.subtotal)}</span>
            </div>
            
            ${calculateTotals.breakdown.map(item => `
              <div class="calc-line ${item.type}">
                <span>${item.label}${item.source ? ` (${item.source})` : ''}</span>
                <span>${item.type === 'discount' ? '-' : '+'}${formatKwanza(Math.abs(item.value))}</span>
              </div>
            `).join('')}
            
            <div class="total-line">
              <span>TOTAL A PAGAR</span>
              <span>${formatKwanza(calculateTotals.finalTotal)}</span>
            </div>
          </div>

          <!-- PAYMENT INFO -->
          <div class="payment-info">
            <div class="payment-line">
              <span>Método de Pagamento:</span>
              <span>${getPaymentMethodLabel(payment.paymentMethod)}</span>
            </div>
            ${payment.receivedAmount ? `
              <div class="payment-line">
                <span>Valor Recebido:</span>
                <span>${formatKwanza(payment.receivedAmount)}</span>
              </div>
              <div class="payment-line highlight">
                <span>Troco:</span>
                <span>${formatKwanza(payment.receivedAmount - calculateTotals.finalTotal)}</span>
              </div>
            ` : ''}
          </div>

          <!-- VALIDATION CODE -->
          <div class="validation-code">
            Código de Validação: ${payment.id.substring(0, 8).toUpperCase()}
          </div>

          <!-- FOOTER -->
          <div class="footer">
            Obrigado pela sua visita!<br>
            Volte sempre!
          </div>
        </body>
      </html>
    `;
  };

  const handleDownloadPDF = async () => {
    setIsGeneratingPDF(true);
    
    try {
      // Create PDF instance (A4 size)
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
      });

      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const margin = 15;
      const contentWidth = pageWidth - (margin * 2);
      let yPos = margin;

      // Helper function to add text and update position
      const addText = (text: string, fontSize: number = 10, isBold: boolean = false, align: 'left' | 'center' | 'right' = 'left') => {
        pdf.setFontSize(fontSize);
        pdf.setFont('helvetica', isBold ? 'bold' : 'normal');
        
        if (align === 'center') {
          pdf.text(text, pageWidth / 2, yPos, { align: 'center' });
        } else if (align === 'right') {
          pdf.text(text, pageWidth - margin, yPos, { align: 'right' });
        } else {
          pdf.text(text, margin, yPos);
        }
        
        yPos += fontSize * 0.5; // Line spacing
      };

      const addLine = () => {
        pdf.line(margin, yPos, pageWidth - margin, yPos);
        yPos += 5;
      };

      const checkPageBreak = (neededSpace: number = 20) => {
        if (yPos + neededSpace > pageHeight - margin) {
          pdf.addPage();
          yPos = margin;
        }
      };

      // HEADER - Restaurant Info
      addText(restaurant?.name || 'Restaurante', 18, true, 'center');
      yPos += 2;
      
      if (restaurant?.address) {
        addText(restaurant.address, 9, false, 'center');
      }
      if (restaurant?.nif) {
        addText(`NIF: ${restaurant.nif}`, 9, false, 'center');
      }
      if (restaurant?.phone) {
        addText(`Tel: ${restaurant.phone}`, 9, false, 'center');
      }
      
      yPos += 5;
      addLine();

      // INVOICE INFO
      addText('FATURA DE PAGAMENTO', 14, true, 'center');
      yPos += 5;

      addText(`Fatura Nº: ${payment.id.substring(0, 8).toUpperCase()}`, 10, true);
      addText(`Data: ${new Date(payment.createdAt).toLocaleString('pt-PT')}`, 10);
      addText(`Mesa: ${table.number}${table.area ? ` (${table.area})` : ''}`, 10);
      addText(`Convidados: ${ordersByGuest.length}`, 10);
      
      if (sessionDuration) {
        addText(`Duração da Sessão: ${sessionDuration}`, 10);
      }
      
      if (payment.notes) {
        addText(`Observações: ${payment.notes}`, 10);
      }
      
      const operatorName = localStorage.getItem('userName') || 'Sistema';
      addText(`Operador: ${operatorName}`, 10);
      
      yPos += 5;
      addLine();

      // ITEMS BY GUEST
      addText('ITENS CONSUMIDOS', 12, true);
      yPos += 3;

      for (const og of ordersByGuest) {
        checkPageBreak(40);

        // Guest header
        const guestName = og.guest.name || `Cliente ${og.guest.guestNumber}`;
        pdf.setFillColor(240, 240, 240);
        pdf.rect(margin, yPos - 4, contentWidth, 8, 'F');
        
        addText(`#${og.guest.guestNumber} - ${guestName}`, 11, true);
        yPos += 2;

        // Guest items
        const allItems = og.orders.flatMap(order => order.items || []);
        for (const item of allItems) {
          checkPageBreak(15);
          
          const itemName = item.menuItem?.name || item.name;
          const itemPrice = formatKwanza(parseFloat(item.price) * item.quantity);
          
          pdf.setFont('helvetica', 'normal');
          pdf.setFontSize(10);
          pdf.text(`  ${item.quantity}x ${itemName}`, margin, yPos);
          pdf.text(itemPrice, pageWidth - margin, yPos, { align: 'right' });
          yPos += 5;

          // Options
          if (item.options && item.options.length > 0) {
            pdf.setFontSize(8);
            pdf.setTextColor(100, 100, 100);
            pdf.text(`     + ${item.options.map(o => o.value).join(', ')}`, margin, yPos);
            pdf.setTextColor(0, 0, 0);
            yPos += 4;
          }
        }

        // Guest subtotal
        pdf.setFont('helvetica', 'bold');
        pdf.setFontSize(10);
        pdf.text('Subtotal:', margin + 10, yPos);
        pdf.text(formatKwanza(parseFloat(og.subtotal)), pageWidth - margin, yPos, { align: 'right' });
        yPos += 8;
      }

      checkPageBreak(60);
      addLine();

      // CALCULATIONS
      addText('CÁLCULOS FINAIS', 12, true);
      yPos += 3;

      addText('Subtotal:', 10, false);
      pdf.text(formatKwanza(calculateTotals.subtotal), pageWidth - margin, yPos - 5, { align: 'right' });

      // Breakdown
      for (const item of calculateTotals.breakdown) {
        checkPageBreak();
        
        const label = `${item.label}${item.source ? ` (${item.source})` : ''}`;
        const value = `${item.type === 'discount' ? '-' : '+'}${formatKwanza(Math.abs(item.value))}`;
        
        if (item.type === 'discount') {
          pdf.setTextColor(0, 150, 0);
        } else {
          pdf.setTextColor(0, 100, 200);
        }
        
        addText(label, 10, false);
        pdf.text(value, pageWidth - margin, yPos - 5, { align: 'right' });
        pdf.setTextColor(0, 0, 0);
      }

      yPos += 3;
      pdf.setLineWidth(0.5);
      pdf.line(margin, yPos, pageWidth - margin, yPos);
      yPos += 5;

      // TOTAL
      pdf.setFontSize(14);
      pdf.setFont('helvetica', 'bold');
      pdf.text('TOTAL A PAGAR:', margin, yPos);
      pdf.text(formatKwanza(calculateTotals.finalTotal), pageWidth - margin, yPos, { align: 'right' });
      yPos += 10;

      addLine();

      // PAYMENT INFO
      addText('INFORMAÇÕES DE PAGAMENTO', 12, true);
      yPos += 3;

      addText(`Método: ${getPaymentMethodLabel(payment.paymentMethod)}`, 10);
      
      if (payment.receivedAmount) {
        addText(`Valor Recebido: ${formatKwanza(payment.receivedAmount)}`, 10);
        
        const change = payment.receivedAmount - calculateTotals.finalTotal;
        if (change > 0) {
          pdf.setTextColor(0, 100, 200);
          addText(`Troco: ${formatKwanza(change)}`, 10, true);
          pdf.setTextColor(0, 0, 0);
        }
      }

      yPos += 5;
      addLine();

      // FOOTER
      addText(`Código de Validação: ${payment.id.substring(0, 8).toUpperCase()}`, 9, false, 'center');
      yPos += 5;
      addText('Obrigado pela sua visita!', 10, true, 'center');
      addText('Volte sempre!', 10, false, 'center');

      // Generate filename
      const filename = `Fatura_Mesa${table.number}_${new Date().toISOString().split('T')[0]}.pdf`;
      
      // Save PDF
      pdf.save(filename);
      
      toast({
        title: "PDF gerado com sucesso!",
        description: `Arquivo ${filename} foi baixado`,
      });
      
    } catch (error) {
      console.error('Erro ao gerar PDF:', error);
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
      dinheiro: 'Dinheiro',
      multicaixa: 'Multicaixa',
      transferencia: 'Transferência',
      cartao: 'Cartão',
    };
    return methods[method] || method;
  };

  return (
    <Dialog open={open} onOpenChange={(isOpen) => {
      if (!isOpen) {
        onClose();
      }
    }}>
      <DialogContent 
        className="max-w-[95vw] sm:max-w-2xl md:max-w-3xl lg:max-w-4xl max-h-[90vh] flex flex-col"
        onPointerDownOutside={(e) => {
          e.preventDefault();
        }}
      >
        <DialogHeader>
          <div className="flex items-center justify-center mb-4">
            <div className="relative">
              <div className="absolute inset-0 bg-green-500/20 rounded-full blur-xl animate-pulse" />
              <div className="relative bg-gradient-to-br from-green-500 to-emerald-500 p-4 rounded-full">
                <CheckCircle2 className="h-12 w-12 text-white" />
              </div>
            </div>
          </div>
          <DialogTitle className="text-2xl font-bold text-center">
            Pagamento Processado com Sucesso!
          </DialogTitle>
          <DialogDescription className="text-center text-base">
            O pagamento foi registrado e a sessão foi finalizada
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="flex-1 pr-4 max-h-[calc(90vh-220px)] overflow-auto">
          <div className="space-y-4">
            {/* Payment Summary Header */}
            <Card className="border-2 border-green-500/30 bg-gradient-to-br from-green-50/50 to-emerald-50/50 dark:from-green-950/20 dark:to-emerald-950/20">
              <CardContent className="p-6 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Mesa:</span>
                    <Badge variant="outline" className="text-base font-bold">
                      Mesa {table.number}
                    </Badge>
                  </div>
                  
                  {sessionDuration && (
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        Duração:
                      </span>
                      <span className="font-semibold">{sessionDuration}</span>
                    </div>
                  )}
                </div>
                
                <Separator />
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Método de Pagamento:</span>
                    <span className="font-semibold">
                      {getPaymentMethodLabel(payment.paymentMethod)}
                    </span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Convidados:</span>
                    <span className="font-semibold">{ordersByGuest.length}</span>
                  </div>
                </div>
                
                <Separator />
                
                <div className="flex items-center justify-between">
                  <span className="text-lg font-bold">Valor Total:</span>
                  <span className="text-3xl font-black bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                    {formatKwanza(calculateTotals.finalTotal)}
                  </span>
                </div>
              </CardContent>
            </Card>

            {/* Detailed Invoice Section */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <ShoppingBag className="h-5 w-5" />
                  Itens Consumidos
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {ordersByGuest.map((og) => {
                  const isExpanded = expandedGuests.has(og.guest.id);
                  const allItems = og.orders.flatMap(order => order.items || []);
                  const totalItems = allItems.reduce((sum, item) => sum + item.quantity, 0);

                  return (
                    <Card 
                      key={og.guest.id}
                      className="border-2 hover:border-primary/30 transition-colors"
                    >
                      <CardContent className="p-4">
                        {/* Guest Header */}
                        <div
                          className="flex items-center justify-between cursor-pointer"
                          onClick={() => toggleGuestExpanded(og.guest.id)}
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white font-bold">
                              #{og.guest.guestNumber}
                            </div>
                            <div>
                              <div className="font-semibold">
                                {og.guest.name || `Cliente ${og.guest.guestNumber}`}
                              </div>
                              <div className="text-xs text-muted-foreground">
                                {totalItems} {totalItems === 1 ? 'item' : 'itens'}
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            <div className="text-right">
                              <div className="font-bold text-lg">
                                {formatKwanza(parseFloat(og.subtotal))}
                              </div>
                            </div>
                            {isExpanded ? (
                              <ChevronUp className="h-5 w-5 text-muted-foreground" />
                            ) : (
                              <ChevronDown className="h-5 w-5 text-muted-foreground" />
                            )}
                          </div>
                        </div>

                        {/* Expanded Items */}
                        {isExpanded && allItems.length > 0 && (
                          <div className="mt-4 pt-4 border-t space-y-2">
                            {allItems.map((item, idx) => (
                              <div key={idx} className="space-y-1">
                                <div className="flex items-start justify-between text-sm">
                                  <div className="flex items-start gap-2 flex-1">
                                    <Badge variant="secondary" className="text-xs font-bold shrink-0">
                                      {item.quantity}x
                                    </Badge>
                                    <div className="flex-1">
                                      <div className="font-medium">
                                        {item.menuItem?.name || item.name}
                                      </div>
                                      {item.options && item.options.length > 0 && (
                                        <div className="text-xs text-muted-foreground italic mt-1">
                                          + {item.options.map(o => o.value).join(', ')}
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                  <div className="font-semibold text-right ml-4">
                                    {formatKwanza(parseFloat(item.price) * item.quantity)}
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  );
                })}
              </CardContent>
            </Card>

            {/* Calculations Breakdown */}
            <Card>
              <CardHeader
                className="pb-3 cursor-pointer hover:bg-muted/50 transition-colors"
                onClick={() => setShowCalculations(!showCalculations)}
              >
                <CardTitle className="flex items-center justify-between text-lg">
                  <div className="flex items-center gap-2">
                    <Receipt className="h-5 w-5" />
                    Cálculos e Ajustes
                  </div>
                  {showCalculations ? (
                    <ChevronUp className="h-5 w-5 text-muted-foreground" />
                  ) : (
                    <ChevronDown className="h-5 w-5 text-muted-foreground" />
                  )}
                </CardTitle>
              </CardHeader>
              {showCalculations && (
                <CardContent className="space-y-3">
                  {/* Subtotal */}
                  <div className="flex items-center justify-between text-base">
                    <span className="font-medium">Subtotal</span>
                    <span className="font-semibold">
                      {formatKwanza(calculateTotals.subtotal)}
                    </span>
                  </div>

                  {/* Breakdown Items */}
                  {calculateTotals.breakdown.length > 0 && (
                    <>
                      <Separator />
                      {calculateTotals.breakdown.map((item, idx) => (
                        <div
                          key={idx}
                          className={cn(
                            "flex items-center justify-between text-sm",
                            item.type === 'discount' && "text-green-600 dark:text-green-400",
                            item.type === 'addition' && "text-blue-600 dark:text-blue-400"
                          )}
                        >
                          <div className="flex items-center gap-2">
                            {item.type === 'discount' ? (
                              <Minus className="h-4 w-4" />
                            ) : (
                              <Plus className="h-4 w-4" />
                            )}
                            <span>
                              {item.label}
                              {item.source && (
                                <span className="text-xs ml-1">({item.source})</span>
                              )}
                            </span>
                          </div>
                          <span className="font-semibold">
                            {item.type === 'discount' ? '-' : '+'}
                            {formatKwanza(Math.abs(item.value))}
                          </span>
                        </div>
                      ))}
                    </>
                  )}

                  <Separator className="my-3" />

                  {/* Final Total */}
                  <div className="flex items-center justify-between text-lg font-bold bg-gradient-to-r from-green-500/10 to-emerald-500/10 p-3 rounded-lg">
                    <span>Total Final</span>
                    <span className="text-2xl bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                      {formatKwanza(calculateTotals.finalTotal)}
                    </span>
                  </div>

                  {/* Payment Details */}
                  {payment.receivedAmount && (
                    <div className="mt-4 pt-4 border-t space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span>Valor Recebido</span>
                        <span className="font-semibold">
                          {formatKwanza(payment.receivedAmount)}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-base font-bold text-blue-600 dark:text-blue-400">
                        <span>Troco</span>
                        <span>
                          {formatKwanza(payment.receivedAmount - calculateTotals.finalTotal)}
                        </span>
                      </div>
                    </div>
                  )}
                </CardContent>
              )}
            </Card>

            {/* Action Cards */}
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                <Sparkles className="h-4 w-4" />
                <span>O que deseja fazer agora?</span>
              </div>

              {/* Print Complete Invoice */}
              <Card 
                className={cn(
                  "cursor-pointer transition-all hover:shadow-lg hover:scale-[1.02] border-2",
                  "border-blue-200 hover:border-blue-400 dark:border-blue-800 dark:hover:border-blue-600"
                )}
                onClick={handlePrintComplete}
              >
                <CardContent className="p-4">
                  <div className="flex items-center gap-4">
                    <div className="p-3 rounded-xl bg-blue-500/10">
                      <Printer className="h-6 w-6 text-blue-600" />
                    </div>
                    <div className="flex-1">
                      <div className="font-bold text-base">Imprimir Fatura Completa</div>
                      <div className="text-sm text-muted-foreground">
                        Fatura detalhada com todos os itens
                      </div>
                    </div>
                    {isPrinting && (
                      <div className="animate-spin h-5 w-5 border-2 border-blue-600 border-t-transparent rounded-full" />
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Download PDF */}
              <Card 
                className={cn(
                  "cursor-pointer transition-all hover:shadow-lg hover:scale-[1.02] border-2",
                  "border-amber-200 hover:border-amber-400 dark:border-amber-800 dark:hover:border-amber-600"
                )}
                onClick={handleDownloadPDF}
              >
                <CardContent className="p-4">
                  <div className="flex items-center gap-4">
                    <div className="p-3 rounded-xl bg-amber-500/10">
                      <Download className="h-6 w-6 text-amber-600" />
                    </div>
                    <div className="flex-1">
                      <div className="font-bold text-base">Baixar PDF</div>
                      <div className="text-sm text-muted-foreground">
                        Salvar fatura em formato PDF
                      </div>
                    </div>
                    {isGeneratingPDF && (
                      <div className="animate-spin h-5 w-5 border-2 border-amber-600 border-t-transparent rounded-full" />
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Print Individual Bills */}
              {ordersByGuest.length > 0 && (
                <Card className={cn(
                  "border-2 border-purple-200 hover:border-purple-300",
                  "dark:border-purple-800 dark:hover:border-purple-700"
                )}>
                  <CardContent className="p-4">
                    <div className="space-y-3">
                      {/* Header */}
                      <div className="flex items-center gap-4">
                        <div className="p-3 rounded-xl bg-purple-500/10">
                          <Users className="h-6 w-6 text-purple-600" />
                        </div>
                        <div className="flex-1">
                          <div className="font-bold text-base">Imprimir por Convidado</div>
                          <div className="text-sm text-muted-foreground">
                            {ordersByGuest.length === 1 
                              ? 'Fatura individual do cliente' 
                              : 'Fatura individual para cada cliente'}
                          </div>
                        </div>
                      </div>
                      
                      {/* Guest List */}
                      <div className="space-y-2 pl-16">
                        {ordersByGuest.map((og) => {
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
                              className="flex items-center justify-between p-2 rounded-lg bg-purple-50 dark:bg-purple-950/20 hover:bg-purple-100 dark:hover:bg-purple-950/30 transition-colors"
                            >
                              <div className="flex items-center gap-2">
                                <div className="w-8 h-8 rounded-full bg-purple-500/20 flex items-center justify-center text-xs font-bold text-purple-700 dark:text-purple-300">
                                  #{og.guest.guestNumber}
                                </div>
                                <div>
                                  <div className="text-sm font-medium">
                                    {og.guest.name || `Cliente ${og.guest.guestNumber}`}
                                  </div>
                                  <div className="text-xs text-muted-foreground">
                                    {formatKwanza(parseFloat(og.subtotal))}
                                  </div>
                                </div>
                              </div>
                              
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
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </ScrollArea>

        {/* Close Button */}
        <div className="flex justify-center pt-4 border-t bg-background">
          <Button
            variant="outline"
            size="lg"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onClose();
            }}
            className="min-w-[200px] relative z-50"
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
