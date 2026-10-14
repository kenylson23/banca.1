import { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
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
  ExternalLink,
} from 'lucide-react';
import { formatKwanza } from '@/lib/formatters';
import { apiFetch } from '@/lib/api-url';
import {
  formatPaymentMethodLabel,
  invoiceDate,
  invoiceMoney,
  invoiceNumberLabel,
  invoiceOrderStatusLabel,
  invoicePaymentStatusLabel,
  invoiceSessionLabel,
} from '@shared/invoice-formatters';
import { getRestaurantFiscalCompleteness, getRestaurantFiscalDetails } from '@shared/invoice-fiscal';
import type { TableInvoiceDocument } from '@shared/table-invoice-document';
import { renderTableInvoiceHtml } from '@/lib/table-invoice-renderer';
import { PrintGuestBill, type TableGuest, type GuestOrder, type GuestOrderItem } from './PrintGuestBill';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import type { OrdersByGuestData } from '@/../../shared/types';
import jsPDF from 'jspdf';
import QRCode from 'qrcode';

function escapeHtml(value: unknown): string {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

interface PaymentData {
  id: string;
  tableId: string;
  sessionId: string;
  amount: string;
  paymentMethod: string;
  receivedAmount?: number;
  notes?: string;
  transactionReference?: string;
  createdAt: string;
  invoiceReference?: string;
}

interface Table {
  id: string;
  number: string;
  capacity: number;
  status: string;
  area?: string;
  restaurantId?: string;
  currentSessionId: string | null;
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
  verifiedInvoiceDocument?: TableInvoiceDocument | null;
  ordersByGuest: OrdersByGuestData['ordersByGuest'];
  calculateTotals: CalculateTotals;
  sessionDuration?: string;
  totalAmount: number;
  onPrintComplete?: () => void;
}

export function PaymentSuccessDialog({
  open,
  onClose,
  table,
  payment,
  verifiedInvoiceDocument,
  ordersByGuest,
  calculateTotals,
  sessionDuration,
  totalAmount,
  onPrintComplete,
}: PaymentSuccessDialogProps) {
  const [expandedGuests, setExpandedGuests] = useState<Set<string>>(new Set());
  const [showCalculations, setShowCalculations] = useState(false);
  const [isPrinting, setIsPrinting] = useState(false);
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState('');
  const { toast } = useToast();
  const invoiceQuery = useQuery<TableInvoiceDocument>({
    queryKey: [`/api/table-sessions/${payment.sessionId}/invoice`],
    enabled: open && Boolean(payment.sessionId) && !verifiedInvoiceDocument,
    queryFn: async () => {
      const response = await apiFetch(
        `/api/table-sessions/${encodeURIComponent(payment.sessionId)}/invoice`,
        { cache: 'no-store', credentials: 'include' },
      );
      if (!response.ok) {
        throw new Error('Não foi possível carregar os dados fiscais da fatura da sessão');
      }
      return response.json();
    },
    staleTime: 0,
    refetchOnMount: 'always',
  });
  const invoiceDocument = verifiedInvoiceDocument ?? invoiceQuery.data;
  useEffect(() => {
    if (!invoiceDocument) {
      setQrCodeDataUrl('');
      return;
    }

    let active = true;
    const verificationUrl = new URL(
      invoiceDocument.validation.verificationUrl,
      window.location.origin,
    ).toString();
    QRCode.toDataURL(verificationUrl, {
      width: 240,
      margin: 1,
      errorCorrectionLevel: 'M',
      color: { dark: '#17202a', light: '#ffffff' },
    }).then((dataUrl) => {
      if (active) setQrCodeDataUrl(dataUrl);
    }).catch(() => {
      if (active) setQrCodeDataUrl('');
    });

    return () => {
      active = false;
    };
  }, [invoiceDocument]);
  const invoiceMatchesPaymentTable = Boolean(
    invoiceDocument &&
    payment.sessionId &&
    invoiceDocument.session.id === payment.sessionId &&
    invoiceDocument.table.id === table.id &&
    invoiceDocument.table.id === payment.tableId &&
    table.restaurantId &&
    invoiceDocument.restaurant.id === table.restaurantId,
  );
  const resolvedRestaurant = invoiceMatchesPaymentTable ? invoiceDocument?.restaurant : undefined;
  const isFiscalDataLoading = !verifiedInvoiceDocument && Boolean(payment.sessionId) && invoiceQuery.isFetching;
  const isFiscalDataReady = Boolean(resolvedRestaurant) &&
    !isFiscalDataLoading &&
    (Boolean(verifiedInvoiceDocument) || !invoiceQuery.isError);
  const fiscalDetails = getRestaurantFiscalDetails(resolvedRestaurant ?? {});
  const fiscalCompleteness = resolvedRestaurant
    ? getRestaurantFiscalCompleteness(resolvedRestaurant)
    : null;

  const safeOrdersByGuest = Array.isArray(ordersByGuest) ? ordersByGuest : [];
  const safeCalculateTotals = calculateTotals || {
    subtotal: 0,
    totalDiscounts: 0,
    totalAdditions: 0,
    finalTotal: totalAmount || 0,
    breakdown: [],
  };

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
    const discountTotal = (safeCalculateTotals.breakdown || [])
      .filter(i => i.type === 'discount')
      .reduce((sum, i) => sum + Math.abs(safeNumber(i.value)), 0);

    const additionsTotal = (safeCalculateTotals.breakdown || [])
      .filter(i => i.type === 'addition')
      .reduce((sum, i) => sum + Math.abs(safeNumber(i.value)), 0);

    return { discountTotal, additionsTotal };
  };

  const getHostGuestId = () => {
    const sorted = [...(safeOrdersByGuest || [])]
      .filter(g => g?.guest?.id && g.guest.id !== 'anonymous')
      .sort((a, b) => (a.guest.guestNumber || 0) - (b.guest.guestNumber || 0));
    return sorted[0]?.guest?.id;
  };

  // Transform OrdersByGuest data to PrintGuestBill format
  // ✅ Fonte de verdade: usar guestTotal do backend quando disponível
  const transformGuestDataForPrint = (og: typeof ordersByGuest[0]) => {
    const guestSubtotal = safeNumber(og.subtotal);
    const guestTotalFromBackend = safeNumber((og.guest as any).guestTotal);
    const guestDiscountRaw = safeNumber((og.guest as any).discount);
    const guestServiceChargeRaw = safeNumber((og.guest as any).serviceCharge);

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

    const hasAdjustments = guestDiscountRaw > 0.009 || guestServiceChargeRaw > 0.009;
    const useBackendTotal = guestTotalFromBackend > 0.009 && hasAdjustments;

    const totalAmount = useBackendTotal
      ? guestTotalFromBackend
      : Math.max(0, guestSubtotal - guestDiscountRaw + guestServiceChargeRaw);

    return {
      guest,
      orders,
      subtotal: guestSubtotal,
      totalAmount,
      discounts:
        guestDiscountRaw > 0.009
          ? [{ description: 'Desconto do Cliente', amount: guestDiscountRaw, type: 'fixed' as const }]
          : [],
      serviceCharges:
        guestServiceChargeRaw > 0.009
          ? [{ description: 'Taxa/Serviço do Cliente', amount: guestServiceChargeRaw, type: 'fixed' as const }]
          : [],
    };
  };
  const handlePrintComplete = async () => {
    if (isFiscalDataLoading) {
      toast({
        title: 'A carregar dados fiscais',
        description: 'Aguarde enquanto confirmamos os dados fiscais da sessão desta mesa.',
      });
      return;
    }
    if (!isFiscalDataReady) {
      toast({
        title: 'Dados fiscais indisponíveis',
        description: 'Não é possível emitir o recibo sem confirmar que a fatura pertence a esta mesa e ao seu restaurante.',
        variant: 'destructive',
      });
      return;
    }
    if (!invoiceDocument) {
      toast({
        title: 'Fatura indisponível',
        description: 'Não foi possível carregar a fatura completa desta sessão.',
        variant: 'destructive',
      });
      return;
    }
    setIsPrinting(true);
    
    try {
      const printWindow = window.open('', '_blank');
      if (!printWindow) {
        throw new Error('Não foi possível abrir a janela de impressão');
      }

      let printStarted = false;
      const startPrint = () => {
        if (printStarted || printWindow.closed) return;
        printStarted = true;
        printWindow.focus();
        printWindow.print();
        setTimeout(() => {
          if (!printWindow.closed) printWindow.close();
          setIsPrinting(false);
          onPrintComplete?.();
        }, 500);
      };
      printWindow.onload = startPrint;
      printWindow.document.open();
      const printContent = generatePrintableInvoice();
      printWindow.document.write(printContent);
      printWindow.document.close();
      window.setTimeout(startPrint, 800);
    } catch (error) {
      console.error('Erro ao imprimir:', error);
      setIsPrinting(false);
    }
  };

  const generatePrintableInvoice = () => {
    if (invoiceDocument) {
      return renderTableInvoiceHtml(invoiceDocument, {
        paper: '80mm',
        qrCodeDataUrl,
        returnUrl: window.location.pathname,
      });
    }

    const restaurantName = resolvedRestaurant?.name || 'Restaurante';
    const fiscalDetailsHtml = fiscalDetails.lines
      .map(({ label, value }) => `<div>${escapeHtml(label)}: ${escapeHtml(value)}</div>`)
      .join('');
    
    // Get current date/time for print
    const printDateTime = new Date().toLocaleString('pt-PT');
    
    // Get user info (operator) from localStorage or auth context
    const operatorName = localStorage.getItem('userName') || 'Sistema';

    return `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Recibo de Pagamento - Mesa ${table.number}</title>
          <meta charset="UTF-8">
          <style>
            @media print {
              @page { margin: 0; }
              body { margin: 1cm; }
              .screen-only { display: none !important; }
            }
            .return-toolbar { width: 100%; max-width: 520px; margin: 12px auto 20px; text-align: center; }
            .return-toolbar a { display: inline-flex; align-items: center; justify-content: center; min-height: 44px; padding: 0 16px; border-radius: 8px; background: #1d4ed8; color: #fff; font: 700 14px Arial, sans-serif; text-decoration: none; }
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
          <div class="screen-only return-toolbar">
            <a href="${escapeHtml(window.location.pathname)}">← Voltar à gestão da mesa</a>
          </div>
          <!-- HEADER -->
          <div class="header">
            <div class="restaurant-name">${restaurantName}</div>
            ${fiscalDetailsHtml ? `
              <div class="restaurant-info">
                ${fiscalDetailsHtml}
              </div>
            ` : ''}
          </div>

          <!-- INVOICE INFO -->
          <div class="invoice-info">
            <div class="info-line">
              <strong>Fatura associada:</strong>
              <span>${payment.invoiceReference || 'Sessão sem referência'}</span>
            </div>
            <div class="info-line">
              <strong>Nº do pagamento:</strong>
              <span>${payment.id}</span>
            </div>
            ${payment.transactionReference ? `
              <div class="info-line">
                <strong>Referência:</strong>
                <span>${payment.transactionReference}</span>
              </div>
            ` : ''}
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
              <span>${safeOrdersByGuest.filter((og) => og.orders.some((o: any) => (o.items || []).length > 0)).length}</span>
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
          ${safeOrdersByGuest.filter((og) => og.orders.some((o: any) => (o.items || []).length > 0)).map((og) => `
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
              <span>${formatKwanza(safeCalculateTotals.subtotal)}</span>
            </div>
            
            ${safeCalculateTotals.breakdown.map(item => `
              <div class="calc-line ${item.type}">
                <span>${item.label}${item.source ? ` (${item.source})` : ''}</span>
                <span>${item.type === 'discount' ? '-' : '+'}${formatKwanza(Math.abs(item.value))}</span>
              </div>
            `).join('')}
            
            <div class="total-line">
              <span>TOTAL A PAGAR</span>
              <span>${formatKwanza(safeCalculateTotals.finalTotal)}</span>
            </div>
          </div>

          <!-- PAYMENT INFO -->
          <div class="payment-info">
            <div class="payment-line">
              <span>Método de Pagamento:</span>
              <span>${formatPaymentMethodLabel(payment.paymentMethod)}</span>
            </div>
            ${payment.receivedAmount ? `
              <div class="payment-line">
                <span>Valor Recebido:</span>
                <span>${formatKwanza(payment.receivedAmount)}</span>
              </div>
              <div class="payment-line highlight">
                <span>Troco:</span>
                <span>${formatKwanza(payment.receivedAmount - safeCalculateTotals.finalTotal)}</span>
              </div>
            ` : ''}
          </div>

          <!-- VALIDATION CODE -->
          <div class="validation-code">
            Fatura associada: ${payment.invoiceReference || 'Sessão sem referência'}<br>
            Nº do pagamento: ${payment.id}
          </div>

          <!-- FOOTER -->
          <div class="footer">
            ${fiscalDetails.legalFooter ? `${escapeHtml(fiscalDetails.legalFooter)}<br><br>` : ''}
            Obrigado pela sua visita!<br>
            Volte sempre!
          </div>
        </body>
      </html>
    `;
  };

  const openInvoiceInBrowser = () => {
    if (!invoiceDocument || !isFiscalDataReady) {
      toast({
        title: 'Fatura indisponível',
        description: 'Os dados fiscais ainda não foram confirmados para esta mesa.',
        variant: 'destructive',
      });
      return;
    }

    const invoiceWindow = window.open('', '_blank');
    if (!invoiceWindow) {
      toast({
        title: 'Abertura bloqueada',
        description: 'Permita janelas pop-up para abrir a fatura completa no navegador.',
        variant: 'destructive',
      });
      return;
    }

    invoiceWindow.document.open();
    invoiceWindow.document.write(generatePrintableInvoice());
    invoiceWindow.document.close();
    invoiceWindow.focus();
  };

  const handleDownloadPDF = async () => {
    if (isFiscalDataLoading) {
      toast({
        title: 'A carregar dados fiscais',
        description: 'Aguarde enquanto confirmamos os dados fiscais da sessão desta mesa.',
      });
      return;
    }
    if (!isFiscalDataReady) {
      toast({
        title: 'Dados fiscais indisponíveis',
        description: 'Não é possível gerar o PDF sem confirmar que a fatura pertence a esta mesa e ao seu restaurante.',
        variant: 'destructive',
      });
      return;
    }
    const fiscalInvoice = invoiceDocument;
    if (!fiscalInvoice) {
      toast({
        title: 'Fatura indisponível',
        description: 'Não foi possível carregar a fatura completa desta sessão.',
        variant: 'destructive',
      });
      return;
    }
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

      const addInvoiceLine = (label: string, value: string, bold = false) => {
        checkPageBreak(12);
        pdf.setFontSize(10);
        pdf.setFont('helvetica', bold ? 'bold' : 'normal');
        pdf.text(label, margin, yPos);
        pdf.text(value, pageWidth - margin, yPos, { align: 'right' });
        yPos += 5;
      };

      // HEADER - Restaurant Info
      addText(fiscalInvoice.restaurant.name, 18, true, 'center');
      yPos += 2;
      for (const line of fiscalDetails.lines) {
        addText(`${line.label}: ${line.value}`, 9, false, 'center');
      }
      
      yPos += 5;
      addLine();

      // INVOICE INFO
      addText('FATURA/RECIBO', 14, true, 'center');
      yPos += 5;

      addInvoiceLine('Nº da fatura', fiscalInvoice.invoiceReference, true);
      addInvoiceLine('Emitida em', invoiceDate(fiscalInvoice.issuedAt));
      addInvoiceLine('Estado', invoicePaymentStatusLabel(fiscalInvoice.totals.paymentStatus), true);
      addInvoiceLine('Filial', fiscalInvoice.branch?.name || 'Unidade principal');
      addInvoiceLine('Morada fiscal', fiscalInvoice.restaurant.fiscalAddress || fiscalInvoice.branch?.address || fiscalInvoice.restaurant.address || '—');
      if (fiscalInvoice.branch?.phone) addInvoiceLine('Telefone da filial', fiscalInvoice.branch.phone);
      addInvoiceLine('Fatura em nome de', fiscalInvoice.invoiceRecipient.label);
      if (fiscalInvoice.customer) {
        addInvoiceLine('Cliente', fiscalInvoice.customer.name);
        if (fiscalInvoice.customer.phone) addInvoiceLine('Telefone do cliente', fiscalInvoice.customer.phone);
        if (fiscalInvoice.customer.nif) addInvoiceLine('NIF do cliente', fiscalInvoice.customer.nif);
        if (fiscalInvoice.customer.address) addInvoiceLine('Morada do cliente', fiscalInvoice.customer.address);
      }
      addInvoiceLine('Sessão', invoiceSessionLabel(fiscalInvoice.session.id));
      addInvoiceLine('Abertura da sessão', invoiceDate(fiscalInvoice.session.startedAt));
      if (fiscalInvoice.session.endedAt) addInvoiceLine('Fecho da sessão', invoiceDate(fiscalInvoice.session.endedAt));
      addInvoiceLine('Mesa', `Mesa ${fiscalInvoice.table.number}${fiscalInvoice.table.area ? ` · ${fiscalInvoice.table.area}` : ''}`);
      if (fiscalInvoice.cashRegisterShift) addInvoiceLine('Caixa / turno', fiscalInvoice.cashRegisterShift.label);
      const operatorNames = fiscalInvoice.paymentOperatorNames.length
        ? fiscalInvoice.paymentOperatorNames.join(', ')
        : fiscalInvoice.session.openedByName;
      if (operatorNames) addInvoiceLine('Atendido por', operatorNames);
      addText(`Nº do pagamento: ${payment.id}`, 10, true);
      if (payment.transactionReference) addText(`Referência: ${payment.transactionReference}`, 10);
      addText(`Data do pagamento: ${invoiceDate(payment.createdAt)}`, 10);
      addText(`Convidados: ${fiscalInvoice.guests.length}`, 10);
      if (sessionDuration) addText(`Duração da sessão: ${sessionDuration}`, 10);
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

      for (const item of fiscalInvoice.items) {
        checkPageBreak(20);
        addInvoiceLine(`${item.quantity}x ${item.name}`, invoiceMoney(item.total), true);
        if (item.guestName) addText(`Convidado: ${item.guestName}`, 8);
        if (item.orderNumber) addText(`Pedido #${item.orderNumber}${item.orderCreatedAt ? ` · ${invoiceDate(item.orderCreatedAt)}` : ''}`, 8);
        if (item.options.length) {
          addText(`Opções: ${item.options.map((option) => `${option.name}${option.quantity > 1 ? ` (${option.quantity}x)` : ''}`).join(', ')}`, 8);
        }
        if (item.notes) addText(`Obs.: ${item.notes}`, 8);
        if (item.orderNotes) addText(`Obs. do pedido: ${item.orderNotes}`, 8);
      }
      if (fiscalInvoice.items.length === 0) {
        addText('Sem itens registados.', 10);
      }
      if (fiscalInvoice.cancelledItems.length > 0) {
        yPos += 3;
        addText('ITENS CANCELADOS (FORA DO TOTAL)', 10, true);
        for (const item of fiscalInvoice.cancelledItems) {
          checkPageBreak(14);
          addInvoiceLine(`${item.quantity}x ${item.name}`, invoiceMoney(item.total));
        }
      }

      checkPageBreak(60);
      addLine();

      // CALCULATIONS
      addText('CÁLCULOS FINAIS', 12, true);
      yPos += 3;

      addInvoiceLine('Subtotal', invoiceMoney(fiscalInvoice.totals.subtotal));
      for (const adjustment of fiscalInvoice.discounts) {
        addInvoiceLine(`Desconto: ${adjustment.label}`, `− ${invoiceMoney(adjustment.amount)}`);
      }
      for (const adjustment of fiscalInvoice.fees) {
        addInvoiceLine(`Taxa: ${adjustment.label}`, `+ ${invoiceMoney(adjustment.amount)}`);
      }
      yPos += 3;
      pdf.setLineWidth(0.5);
      pdf.line(margin, yPos, pageWidth - margin, yPos);
      yPos += 5;

      // TOTAL
      pdf.setFontSize(14);
      pdf.setFont('helvetica', 'bold');
      pdf.text('TOTAL A PAGAR:', margin, yPos);
      pdf.text(invoiceMoney(fiscalInvoice.totals.total), pageWidth - margin, yPos, { align: 'right' });
      yPos += 10;
      addInvoiceLine('Total pago', invoiceMoney(fiscalInvoice.totals.paid));
      addInvoiceLine('Pendente', invoiceMoney(fiscalInvoice.totals.pending));

      addLine();

      // PAYMENT INFO
      addText('PAGAMENTOS REGISTADOS', 12, true);
      yPos += 3;
      for (const recordedPayment of fiscalInvoice.payments) {
        addInvoiceLine(
          `${formatPaymentMethodLabel(recordedPayment.paymentMethod)} · ${invoiceDate(recordedPayment.createdAt)}`,
          invoiceMoney(recordedPayment.amount),
        );
        if (recordedPayment.operatorName) addText(`Operador: ${recordedPayment.operatorName}`, 8);
        if (recordedPayment.notes) addText(`Observações: ${recordedPayment.notes}`, 8);
      }
      addText('Pagamento atual', 10, true);
      addText(`Método: ${formatPaymentMethodLabel(payment.paymentMethod)}`, 10);
      if (payment.receivedAmount) {
        addText(`Valor Recebido: ${formatKwanza(payment.receivedAmount)}`, 10);
        
        const change = payment.receivedAmount - Number(payment.amount);
        if (change > 0) {
          pdf.setTextColor(0, 100, 200);
          addText(`Troco: ${formatKwanza(change)}`, 10, true);
          pdf.setTextColor(0, 0, 0);
        }
      }

      yPos += 5;
      addLine();

      // FOOTER
      addText(`Código de validação: ${fiscalInvoice.validation.code}`, 9, false, 'center');
      addText(fiscalInvoice.validation.verificationUrl, 8, false, 'center');
      addText(`Fatura/Recibo: ${fiscalInvoice.invoiceReference}`, 9, false, 'center');
      addText(`Nº do pagamento: ${payment.id}`, 9, false, 'center');
      yPos += 5;
       if (fiscalDetails.legalFooter) {
         checkPageBreak(15);
         addText(fiscalDetails.legalFooter, 9, false, 'center');
         yPos += 2;
       }
      addText('Obrigado pela sua visita!', 10, true, 'center');
      addText('Volte sempre!', 10, false, 'center');

      // Generate filename
      const filename = `Recibo_Pagamento_Mesa${table.number}_${new Date().toISOString().split('T')[0]}.pdf`;
      
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

  return (
    <Dialog open={open} onOpenChange={(isOpen) => {
      if (!isOpen) {
        onClose();
      }
    }}>
      <DialogContent 
        className="max-w-[95vw] sm:max-w-3xl lg:max-w-5xl h-[calc(100dvh-1rem)] max-h-[calc(100dvh-1rem)] sm:h-auto sm:max-h-[92vh] flex flex-col gap-0 overflow-hidden p-0"
        onPointerDownOutside={(e) => {
          e.preventDefault();
        }}
      >
        <DialogHeader className="shrink-0 border-b px-5 py-4 text-left sm:px-7">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-300">
              <CheckCircle2 className="h-5 w-5" aria-hidden="true" />
            </div>
            <div className="min-w-0">
              <DialogTitle className="text-lg font-semibold tracking-tight">
                Pagamento concluído
              </DialogTitle>
              <DialogDescription className="mt-0.5 truncate text-sm">
                {invoiceDocument
                  ? `Fatura/Recibo Nº ${invoiceNumberLabel(invoiceDocument.invoiceReference)}`
                  : `Pagamento registado · Nº ${payment.id}`}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain touch-pan-y [-webkit-overflow-scrolling:touch]">
          <div className="space-y-5 px-5 py-5 sm:px-7">
            {invoiceDocument && isFiscalDataReady ? (
              <section
                aria-label="Pré-visualização da fatura/recibo"
                className="overflow-hidden rounded-lg border bg-background text-foreground"
              >
                <div className="space-y-5 p-5 sm:p-7">
                  <header className="flex flex-col justify-between gap-5 border-b pb-5 sm:flex-row">
                    <div className="flex min-w-0 items-start gap-3">
                      {invoiceDocument.restaurant.logoUrl ? (
                        <img
                          src={invoiceDocument.restaurant.logoUrl}
                          alt=""
                          className="h-12 w-12 shrink-0 rounded-md border object-contain p-1"
                        />
                      ) : (
                        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-md border text-muted-foreground">
                          <FileText className="h-5 w-5" aria-hidden="true" />
                        </div>
                      )}
                      <div className="min-w-0">
                        <h2 className="text-lg font-semibold tracking-tight">
                          {invoiceDocument.restaurant.name}
                        </h2>
                        <p className="text-sm text-muted-foreground">
                          {invoiceDocument.branch?.name || 'Unidade principal'}
                        </p>
                        <div className="mt-2 grid gap-x-4 gap-y-1 text-xs text-muted-foreground sm:grid-cols-2">
                          {fiscalDetails.lines.map(({ label, value }) => (
                            <p key={label} className="break-words">
                              <span className="font-medium text-foreground">{label}:</span> {value}
                            </p>
                          ))}
                          {(invoiceDocument.restaurant.fiscalAddress || invoiceDocument.restaurant.address) && (
                            <p className="break-words">
                              <span className="font-medium text-foreground">Morada:</span>{' '}
                              {invoiceDocument.restaurant.fiscalAddress || invoiceDocument.restaurant.address}
                            </p>
                          )}
                          {invoiceDocument.branch?.phone && (
                            <p>
                              <span className="font-medium text-foreground">Telefone da filial:</span>{' '}
                              {invoiceDocument.branch.phone}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="shrink-0 sm:text-right">
                      <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                        Fatura/Recibo
                      </p>
                      <p className="mt-1 text-xl font-semibold">
                        Nº {invoiceNumberLabel(invoiceDocument.invoiceReference)}
                      </p>
                      <p className="mt-1 text-sm text-muted-foreground">
                        Emitida em {invoiceDate(invoiceDocument.issuedAt)}
                      </p>
                      <Badge
                        variant="outline"
                        className={cn(
                          'mt-2 font-medium',
                          invoiceDocument.totals.paymentStatus === 'pago'
                            ? 'border-emerald-300 text-emerald-700 dark:border-emerald-800 dark:text-emerald-300'
                            : invoiceDocument.totals.paymentStatus === 'parcial'
                              ? 'border-blue-300 text-blue-700 dark:border-blue-800 dark:text-blue-300'
                              : 'border-amber-300 text-amber-700 dark:border-amber-800 dark:text-amber-300',
                        )}
                      >
                        {invoicePaymentStatusLabel(invoiceDocument.totals.paymentStatus)}
                      </Badge>
                    </div>
                  </header>

                  <section className="grid gap-4 border-b pb-5 sm:grid-cols-2 lg:grid-cols-3">
                    {[
                      ['Mesa', `${invoiceDocument.table.number}${invoiceDocument.table.area ? ` · ${invoiceDocument.table.area}` : ''}`],
                      ['Sessão', invoiceSessionLabel(invoiceDocument.session.id)],
                      ['Moeda', 'AOA · Kwanza'],
                      ['Filial', invoiceDocument.branch?.name || 'Unidade principal'],
                      ['Caixa / turno', invoiceDocument.cashRegisterShift?.label || 'Não identificado'],
                      ['Atendido por', invoiceDocument.paymentOperatorNames.join(', ') || invoiceDocument.session.openedByName || '—'],
                      ['Abertura', invoiceDate(invoiceDocument.session.startedAt)],
                      ['Encerramento', invoiceDate(invoiceDocument.session.endedAt)],
                      ['Duração', invoiceDocument.session.durationLabel || sessionDuration || '—'],
                    ].map(([label, value]) => (
                      <div key={label} className="min-w-0">
                        <p className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">{label}</p>
                        <p className="mt-1 break-words text-sm font-medium">{value}</p>
                      </div>
                    ))}
                  </section>

                  <section className="border-b pb-5">
                    <h3 className="mb-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                      Identificação da fatura
                    </h3>
                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                      <div className="min-w-0">
                        <p className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">Fatura em nome de</p>
                        <p className="mt-1 break-words text-sm font-medium">{invoiceDocument.invoiceRecipient.label}</p>
                      </div>
                      <div className="min-w-0">
                        <p className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">Cliente</p>
                        <p className="mt-1 break-words text-sm font-medium">{invoiceDocument.customer?.name || 'Consumidor final'}</p>
                      </div>
                      {invoiceDocument.customer?.nif && (
                        <div>
                          <p className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">NIF do cliente</p>
                          <p className="mt-1 text-sm font-medium">{invoiceDocument.customer.nif}</p>
                        </div>
                      )}
                      {invoiceDocument.customer?.phone && (
                        <div>
                          <p className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">Telefone</p>
                          <p className="mt-1 text-sm font-medium">{invoiceDocument.customer.phone}</p>
                        </div>
                      )}
                      {invoiceDocument.customer?.email && (
                        <div className="min-w-0">
                          <p className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">Email</p>
                          <p className="mt-1 break-all text-sm font-medium">{invoiceDocument.customer.email}</p>
                        </div>
                      )}
                      {invoiceDocument.customer?.address && (
                        <div className="min-w-0 sm:col-span-2">
                          <p className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">Morada do cliente</p>
                          <p className="mt-1 break-words text-sm font-medium">{invoiceDocument.customer.address}</p>
                        </div>
                      )}
                    </div>
                    {invoiceDocument.guests.length > 0 && (
                      <div className="mt-4 border-t pt-3">
                        <p className="mb-2 text-[11px] font-medium uppercase tracking-wide text-muted-foreground">Convidados</p>
                        <div className="flex flex-wrap gap-x-4 gap-y-1">
                          {invoiceDocument.guests.map((guest) => (
                            <span key={guest.id} className="text-sm">
                              {guest.name}{guest.seatNumber ? ` · Lugar ${guest.seatNumber}` : ''}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </section>

                  <section className="border-b pb-5">
                    <h3 className="mb-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                      Itens faturados
                    </h3>
                    <div className="overflow-x-auto">
                      <table className="w-full min-w-[520px] text-sm">
                        <thead>
                          <tr className="border-b text-left text-xs text-muted-foreground">
                            <th className="w-14 py-2 pr-3 font-medium">Qtd.</th>
                            <th className="py-2 pr-3 font-medium">Descrição</th>
                            <th className="whitespace-nowrap py-2 pr-3 text-right font-medium">Preço unit.</th>
                            <th className="whitespace-nowrap py-2 text-right font-medium">Total</th>
                          </tr>
                        </thead>
                        <tbody>
                          {invoiceDocument.items.map((item, index) => (
                            <tr key={`${item.name}-${index}`} className="border-b last:border-0">
                              <td className="py-3 pr-3 align-top">{item.quantity}</td>
                              <td className="py-3 pr-3">
                                <p className="font-medium">{item.name}</p>
                                <p className="mt-1 text-xs text-muted-foreground">
                                  {item.orderNumber ? `Pedido #${item.orderNumber}` : 'Pedido sem número'}
                                  {item.orderCreatedAt ? ` · ${invoiceDate(item.orderCreatedAt)}` : ''}
                                  {` · ${invoiceOrderStatusLabel(item.orderStatus)}`}
                                </p>
                                {item.guestName && <p className="mt-1 text-xs text-muted-foreground">Convidado: {item.guestName}</p>}
                                {item.options.length > 0 && (
                                  <p className="mt-1 text-xs text-muted-foreground">
                                    Opções: {item.options.map((option) => `${option.name}${option.quantity > 1 ? ` (${option.quantity}x)` : ''}`).join(', ')}
                                  </p>
                                )}
                                {item.notes && <p className="mt-1 text-xs text-muted-foreground">Obs. do item: {item.notes}</p>}
                                {item.orderNotes && <p className="mt-1 text-xs text-muted-foreground">Obs. do pedido: {item.orderNotes}</p>}
                                {item.sharedWithGuestNames.length > 0 && (
                                  <p className="mt-1 text-xs text-muted-foreground">Partilhado com: {item.sharedWithGuestNames.join(', ')}</p>
                                )}
                              </td>
                              <td className="whitespace-nowrap py-3 pr-3 text-right align-top">{invoiceMoney(item.unitPrice)}</td>
                              <td className="whitespace-nowrap py-3 text-right align-top font-medium">{invoiceMoney(item.total)}</td>
                            </tr>
                          ))}
                          {invoiceDocument.items.length === 0 && (
                            <tr><td colSpan={4} className="py-4 text-center text-muted-foreground">Sem itens registados</td></tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                    {invoiceDocument.cancelledItems.length > 0 && (
                      <div className="mt-4 rounded-md border border-dashed p-3">
                        <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                          Itens cancelados · não incluídos no total
                        </p>
                        {invoiceDocument.cancelledItems.map((item, index) => (
                          <div key={`${item.name}-${index}`} className="flex justify-between gap-4 py-1 text-sm text-muted-foreground">
                            <span>{item.quantity} × {item.name}</span>
                            <span className="whitespace-nowrap">{invoiceMoney(item.total)}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </section>

                  <section className="grid gap-6 md:grid-cols-2">
                    <div>
                      <h3 className="mb-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Pagamentos</h3>
                      {invoiceDocument.paymentsByMethod.map((record) => (
                        <div key={record.paymentMethod} className="flex justify-between gap-4 border-b py-2 text-sm last:border-0">
                          <span>{record.paymentMethodLabel} <span className="text-muted-foreground">({record.count})</span></span>
                          <span className="whitespace-nowrap font-medium">{invoiceMoney(record.amount)}</span>
                        </div>
                      ))}
                      {invoiceDocument.payments.map((record) => (
                        <div key={record.id} className="mt-2 text-xs text-muted-foreground">
                          {record.paymentMethodLabel} · {invoiceDate(record.createdAt)}
                          {record.operatorName ? ` · ${record.operatorName}` : ''}
                          {record.notes ? ` · ${record.notes}` : ''}
                        </div>
                      ))}
                      {invoiceDocument.payments.length === 0 && (
                        <p className="text-sm text-muted-foreground">Nenhum pagamento registado</p>
                      )}
                    </div>
                    <div className="space-y-2 md:ml-auto md:w-full md:max-w-sm">
                      <div className="flex justify-between gap-4 text-sm">
                        <span className="text-muted-foreground">Subtotal</span>
                        <span>{invoiceMoney(invoiceDocument.totals.subtotal)}</span>
                      </div>
                      {invoiceDocument.discounts.map((adjustment) => (
                        <div key={adjustment.id} className="flex justify-between gap-4 text-sm">
                          <span className="text-muted-foreground">{adjustment.label}</span>
                          <span>− {invoiceMoney(adjustment.amount)}</span>
                        </div>
                      ))}
                      {invoiceDocument.fees.map((adjustment) => (
                        <div key={adjustment.id} className="flex justify-between gap-4 text-sm">
                          <span className="text-muted-foreground">{adjustment.label}</span>
                          <span>+ {invoiceMoney(adjustment.amount)}</span>
                        </div>
                      ))}
                      <div className="flex justify-between gap-4 border-t pt-3 text-base font-semibold">
                        <span>Total da sessão</span>
                        <span className="whitespace-nowrap">{invoiceMoney(invoiceDocument.totals.total)}</span>
                      </div>
                      <div className="flex justify-between gap-4 text-sm">
                        <span className="text-muted-foreground">Total pago</span>
                        <span>{invoiceMoney(invoiceDocument.totals.paid)}</span>
                      </div>
                      <div className="flex justify-between gap-4 text-sm">
                        <span className="text-muted-foreground">Saldo pendente</span>
                        <span>{invoiceMoney(invoiceDocument.totals.pending)}</span>
                      </div>
                    </div>
                  </section>

                  <footer className="flex flex-col gap-4 border-t pt-4 sm:flex-row sm:items-center sm:justify-between">
                    {qrCodeDataUrl ? (
                      <div className="flex items-center gap-3">
                        <img src={qrCodeDataUrl} alt="QR de validação da fatura" className="h-16 w-16" />
                        <div className="min-w-0">
                          <p className="text-xs font-semibold">Validação digital</p>
                          <p className="mt-1 text-xs text-muted-foreground">Código: {invoiceDocument.validation.code}</p>
                          <p className="break-all text-xs text-muted-foreground">{invoiceDocument.validation.verificationUrl}</p>
                        </div>
                      </div>
                    ) : (
                      <div className="min-w-0">
                        <p className="text-xs font-semibold">Código de validação: {invoiceDocument.validation.code}</p>
                        <p className="break-all text-xs text-muted-foreground">{invoiceDocument.validation.verificationUrl}</p>
                      </div>
                    )}
                    {fiscalDetails.legalFooter && (
                      <p className="text-xs text-muted-foreground sm:max-w-[50%] sm:text-right">
                        {fiscalDetails.legalFooter}
                      </p>
                    )}
                  </footer>
                </div>

                <div className="flex flex-wrap gap-2 border-t bg-muted/20 px-5 py-4 sm:px-7">
                  <Button onClick={openInvoiceInBrowser} disabled={!isFiscalDataReady}>
                    <ExternalLink className="mr-2 h-4 w-4" aria-hidden="true" />
                    Abrir fatura completa
                  </Button>
                  <Button variant="outline" onClick={handlePrintComplete} disabled={!isFiscalDataReady || isPrinting}>
                    <Printer className="mr-2 h-4 w-4" aria-hidden="true" />
                    {isPrinting ? 'A preparar impressão…' : 'Imprimir'}
                  </Button>
                  <Button variant="outline" onClick={handleDownloadPDF} disabled={!isFiscalDataReady || isGeneratingPDF}>
                    <Download className="mr-2 h-4 w-4" aria-hidden="true" />
                    {isGeneratingPDF ? 'A gerar PDF…' : 'Guardar PDF'}
                  </Button>
                </div>
              </section>
            ) : (
              <div
                className={cn(
                  'rounded-lg border p-4 text-sm',
                  isFiscalDataReady ? 'text-muted-foreground' : 'border-amber-300 bg-amber-50/50 text-amber-950 dark:border-amber-800 dark:bg-amber-950/20 dark:text-amber-100',
                )}
                role={isFiscalDataReady ? 'status' : 'alert'}
              >
                {isFiscalDataLoading
                  ? 'A confirmar os dados fiscais da sessão...'
                  : invoiceQuery.isError
                    ? 'Não foi possível carregar a fatura desta sessão.'
                    : 'A fatura não pode ser exibida porque os dados da sessão, mesa e restaurante não correspondem.'}
                {!isFiscalDataLoading && !isFiscalDataReady && payment.sessionId && (
                  <Button className="ml-3" size="sm" variant="outline" onClick={() => invoiceQuery.refetch()}>
                    Tentar novamente
                  </Button>
                )}
              </div>
            )}

            {fiscalCompleteness && !fiscalCompleteness.isComplete && (
              <div role="status" className="rounded-md border border-amber-300 bg-amber-50 p-3 text-sm text-amber-950 dark:border-amber-800 dark:bg-amber-950/30 dark:text-amber-100">
                <p className="font-semibold">Dados fiscais incompletos</p>
                <p>Em falta: {fiscalCompleteness.missingFields.join(', ')}.</p>
              </div>
            )}

            <details className="rounded-lg border px-4 py-3">
              <summary className="cursor-pointer text-sm font-medium">
                Outras opções de pagamento e recibos individuais
              </summary>
              <div className="mt-4 space-y-4">
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
                      {formatPaymentMethodLabel(payment.paymentMethod)}
                    </span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Convidados:</span>
                    <span className="font-semibold">{safeOrdersByGuest.length}</span>
                  </div>
                </div>
                
                <Separator />
                
                <div className="flex items-center justify-between">
                  <span className="text-lg font-bold">Valor Total:</span>
                  <span className="text-3xl font-black bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                    {formatKwanza(safeCalculateTotals.finalTotal)}
                  </span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Receipt className="h-5 w-5" />
                  Dados fiscais
                </CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                <div className="sm:col-span-2"><span className="text-muted-foreground">Nome do emitente:</span><div className="font-medium">{resolvedRestaurant?.name || 'Não informado'}</div></div>
                {fiscalDetails.lines.map(({ label, value }) => (
                  <div key={label}><span className="text-muted-foreground">{label}:</span><div className="font-medium">{value}</div></div>
                ))}
                {!fiscalDetails.lines.some(({ label }) => label === 'NIF') && (
                  <div><span className="text-muted-foreground">NIF:</span><div className="font-medium">Não informado</div></div>
                )}
                {fiscalDetails.legalFooter && (
                  <div className="sm:col-span-2"><span className="text-muted-foreground">Rodapé legal:</span><div className="font-medium">{fiscalDetails.legalFooter}</div></div>
                )}
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
                {safeOrdersByGuest.map((og) => {
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
                              {(() => {
                                const { totalAmount: guestTotal, discounts, serviceCharges } = transformGuestDataForPrint(og);
                                // Aqui os ajustes já vêm como valores finais (type: fixed)
                                const discountTotal = (discounts || []).reduce((s, d) => s + (d.amount || 0), 0);
                                const chargesTotal = (serviceCharges || []).reduce((s, c) => s + (c.amount || 0), 0);
                                return (
                                  <>
                                    <div className="font-bold text-lg">
                                      {formatKwanza(guestTotal)}
                                    </div>
                                    {(discountTotal > 0.009 || chargesTotal > 0.009) && (
                                      <div className="text-xs text-muted-foreground">
                                        {discountTotal > 0.009 ? `- ${formatKwanza(discountTotal)}` : ''}
                                        {discountTotal > 0.009 && chargesTotal > 0.009 ? ' • ' : ''}
                                        {chargesTotal > 0.009 ? `+ ${formatKwanza(chargesTotal)}` : ''}
                                      </div>
                                    )}
                                  </>
                                );
                              })()}
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
                      {safeCalculateTotals.subtotal}
                    </span>
                  </div>

                  {/* Breakdown Items */}
                  {safeCalculateTotals.breakdown.length > 0 && (
                    <>
                      <Separator />
                      {safeCalculateTotals.breakdown.map((item, idx) => (
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
                      {formatKwanza(safeCalculateTotals.finalTotal)}
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
                          {formatKwanza(payment.receivedAmount - safeCalculateTotals.finalTotal)}
                        </span>
                      </div>
                    </div>
                  )}
                </CardContent>
              )}
            </Card>

            {isFiscalDataLoading && (
              <div role="status" className="rounded-md border p-3 text-sm text-muted-foreground">
                A carregar e a confirmar os dados fiscais da sessão desta mesa...
              </div>
            )}
            {!isFiscalDataLoading && !isFiscalDataReady && (
              <div role="alert" className="flex flex-wrap items-center justify-between gap-3 rounded-md border border-destructive/40 bg-destructive/5 p-3 text-sm">
                <span>
                  {invoiceQuery.isError
                    ? 'Não foi possível carregar a fatura da sessão. A emissão está bloqueada para evitar dados fiscais de outro restaurante.'
                    : 'Não foi possível confirmar que esta sessão pertence à mesa e ao restaurante selecionados. A emissão está bloqueada.'}
                </span>
                {payment.sessionId && (
                  <Button size="sm" variant="outline" onClick={() => invoiceQuery.refetch()}>
                    Tentar novamente
                  </Button>
                )}
              </div>
            )}
            {fiscalCompleteness && !fiscalCompleteness.isComplete && (
              <div role="status" className="rounded-md border border-amber-300 bg-amber-50 p-3 text-sm text-amber-950 dark:border-amber-800 dark:bg-amber-950/30 dark:text-amber-100">
                <p className="font-semibold">Dados fiscais incompletos</p>
                <p>Em falta: {fiscalCompleteness.missingFields.join(', ')}.</p>
              </div>
            )}

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
                  "border-blue-200 hover:border-blue-400 dark:border-blue-800 dark:hover:border-blue-600",
                  !isFiscalDataReady && "cursor-wait opacity-60"
                )}
                aria-disabled={!isFiscalDataReady}
                onClick={!isFiscalDataReady ? undefined : handlePrintComplete}
              >
                <CardContent className="p-4">
                  <div className="flex items-center gap-4">
                    <div className="p-3 rounded-xl bg-blue-500/10">
                      <Printer className="h-6 w-6 text-blue-600" />
                    </div>
                    <div className="flex-1">
                      <div className="font-bold text-base">Imprimir Fatura/Recibo final</div>
                      <div className="text-sm text-muted-foreground">
                        {isFiscalDataLoading
                          ? 'A confirmar os dados fiscais da sessão...'
                          : !isFiscalDataReady
                            ? 'Emissão bloqueada até confirmar a mesa e o restaurante.'
                            : 'Documento final com estado e pagamentos realizados'}
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
                  "border-amber-200 hover:border-amber-400 dark:border-amber-800 dark:hover:border-amber-600",
                  !isFiscalDataReady && "cursor-wait opacity-60"
                )}
                aria-disabled={!isFiscalDataReady}
                onClick={!isFiscalDataReady ? undefined : handleDownloadPDF}
              >
                <CardContent className="p-4">
                  <div className="flex items-center gap-4">
                    <div className="p-3 rounded-xl bg-amber-500/10">
                      <Download className="h-6 w-6 text-amber-600" />
                    </div>
                    <div className="flex-1">
                      <div className="font-bold text-base">Baixar PDF</div>
                      <div className="text-sm text-muted-foreground">
                        {isFiscalDataLoading
                          ? 'A confirmar os dados fiscais da sessão...'
                          : !isFiscalDataReady
                            ? 'Geração bloqueada até confirmar a mesa e o restaurante.'
                            : 'Salvar fatura em formato PDF'}
                      </div>
                    </div>
                    {isGeneratingPDF && (
                      <div className="animate-spin h-5 w-5 border-2 border-amber-600 border-t-transparent rounded-full" />
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Print Individual Bills */}
              {safeOrdersByGuest.length > 0 && (
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
                            {safeOrdersByGuest.length === 1 
                              ? 'Conta provisória individual do cliente'
                              : 'Conta provisória individual para cada cliente'}
                          </div>
                        </div>
                      </div>
                      
                        {/* Guest List */}
                        <div className="space-y-2 pl-16">
                          {safeOrdersByGuest.map((og) => {
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
                                     {orders.length === 0 ? 'Sem itens' : formatKwanza(subtotal)}
                                   </div>
                                 </div>
                               </div>
                               
                                {orders.length > 0 && isFiscalDataLoading && (
                                  <span className="text-xs text-muted-foreground">A confirmar os dados fiscais da sessão...</span>
                                )}
                                {orders.length > 0 && isFiscalDataReady && (
                                 <PrintGuestBill
                                   guest={guest}
                                   orders={orders}
                                   subtotal={subtotal}
                                   discounts={discounts}
                                   serviceCharges={serviceCharges}
                                   totalAmount={guestTotal}
                                   tableName={`Mesa ${table.number}`}
                                   restaurantName={resolvedRestaurant?.name}
                                    restaurantAddress={resolvedRestaurant?.address ?? undefined}
                                    restaurantFiscalAddress={resolvedRestaurant?.fiscalAddress ?? undefined}
                                    restaurantPhone={resolvedRestaurant?.phone ?? undefined}
                                    restaurantNIF={resolvedRestaurant?.nif ?? undefined}
                                    restaurantVatRegime={resolvedRestaurant?.vatRegime ?? undefined}
                                    restaurantVatRate={resolvedRestaurant?.vatRate ?? undefined}
                                    restaurantDocumentSeries={resolvedRestaurant?.documentSeries ?? undefined}
                                    restaurantInvoicePrefix={resolvedRestaurant?.invoicePrefix ?? undefined}
                                    restaurantEmail={resolvedRestaurant?.email ?? undefined}
                                    restaurantWebsite={resolvedRestaurant?.website ?? undefined}
                                    restaurantWhatsappNumber={resolvedRestaurant?.whatsappNumber ?? undefined}
                                    restaurantLogoUrl={resolvedRestaurant?.logoUrl ?? undefined}
                                    legalFooter={resolvedRestaurant?.legalFooter ?? undefined}
                                   paymentMethod={payment.paymentMethod}
                                   variant="ghost"
                                   size="sm"
                                 />
                               )}
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
          </details>
          </div>
        </div>

        {/* Close Button */}
        <div className="shrink-0 flex justify-center pt-4 border-t bg-background">
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
