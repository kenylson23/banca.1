import { useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Printer } from 'lucide-react';
import { formatKwanza } from '@/lib/formatters';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import type { Order, OrderItem, MenuItem, Table, Customer, PaymentEvent } from '@shared/schema';

type OrderWithDetails = Order & {
  orderItems?: Array<OrderItem & { 
    menuItem?: MenuItem | null;
    orderItemOptions?: Array<{ optionName: string; priceAdjustment: string }>;
  }>;
  table?: Table | null;
  customer?: Customer | null;
  payments?: PaymentEvent[];
};

interface PrintInvoiceProps {
  order: OrderWithDetails;
  restaurantInfo?: {
    name: string;
    address?: string;
    phone?: string;
    nif?: string;
  };
  variant?: 'default' | 'outline' | 'ghost';
  size?: 'default' | 'sm' | 'lg' | 'icon';
}

export function PrintInvoice({ 
  order, 
  restaurantInfo = { name: 'NaBancada' }, 
  variant = 'outline', 
  size = 'sm' 
}: PrintInvoiceProps) {
  const printRef = useRef<HTMLDivElement>(null);
  const isIconOnly = size === 'icon';

  const handlePrint = () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const orderTypeLabel: Record<string, string> = {
      mesa: 'Mesa',
      delivery: 'Delivery',
      takeout: 'Take-out',
      balcao: 'Balcão',
      pdv: 'PDV',
    };

    const paymentMethodLabels: Record<string, string> = {
      dinheiro: 'Dinheiro',
      multicaixa: 'Multicaixa',
      transferencia: 'Transferência Bancária',
      cartao: 'Cartão',
    };

    const printContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Fatura #${order.id.substring(0, 8).toUpperCase()}</title>
        <style>
          @media print {
            @page {
              size: A4;
              margin: 15mm;
            }
            body {
              margin: 0;
              padding: 0;
            }
          }
          body {
            font-family: Arial, sans-serif;
            font-size: 12px;
            line-height: 1.5;
            margin: 0;
            padding: 20px;
          }
          .header {
            display: flex;
            justify-content: space-between;
            margin-bottom: 25px;
            border-bottom: 3px solid #000;
            padding-bottom: 15px;
          }
          .restaurant-info {
            flex: 1;
          }
          .restaurant-name {
            font-size: 24px;
            font-weight: bold;
            margin-bottom: 8px;
          }
          .restaurant-details {
            font-size: 11px;
            color: #666;
            line-height: 1.6;
          }
          .invoice-info {
            text-align: right;
          }
          .doc-type {
            font-size: 20px;
            font-weight: bold;
            margin-bottom: 8px;
          }
          .invoice-number {
            font-size: 13px;
            color: #666;
            margin-bottom: 4px;
          }
          .customer-section {
            margin: 20px 0;
            padding: 15px;
            background: #f9f9f9;
            border-radius: 5px;
          }
          .section-title {
            font-weight: bold;
            font-size: 13px;
            margin-bottom: 10px;
            color: #333;
          }
          .customer-info {
            font-size: 11px;
            line-height: 1.8;
          }
          .items-table {
            width: 100%;
            border-collapse: collapse;
            margin: 25px 0;
          }
          .items-table th {
            background: #333;
            color: white;
            padding: 10px;
            text-align: left;
            font-size: 11px;
            font-weight: bold;
          }
          .items-table td {
            border-bottom: 1px solid #ddd;
            padding: 10px;
            font-size: 11px;
          }
          .items-table tr:last-child td {
            border-bottom: 2px solid #333;
          }
          .item-name {
            font-weight: 500;
          }
          .item-options {
            font-size: 10px;
            color: #666;
            margin-top: 3px;
            padding-left: 15px;
          }
          .item-notes {
            font-size: 10px;
            font-style: italic;
            color: #666;
            margin-top: 3px;
          }
          .totals-section {
            margin-left: auto;
            width: 300px;
            margin-top: 20px;
          }
          .total-row {
            display: flex;
            justify-content: space-between;
            padding: 8px 15px;
            font-size: 12px;
          }
          .total-row.subtotal {
            background: #f9f9f9;
          }
          .total-row.final {
            background: #333;
            color: white;
            font-size: 16px;
            font-weight: bold;
            margin-top: 5px;
          }
          .payment-section {
            margin-top: 25px;
            padding: 15px;
            background: #f0f0f0;
            border-radius: 5px;
          }
          .payment-info {
            display: flex;
            justify-content: space-between;
            margin: 5px 0;
            font-size: 12px;
          }
          .payment-status {
            display: inline-block;
            padding: 4px 12px;
            border-radius: 3px;
            font-size: 11px;
            font-weight: bold;
          }
          .status-pago {
            background: #059669;
            color: white;
          }
          .status-parcial {
            background: #F59E0B;
            color: white;
          }
          .status-nao-pago {
            background: #DC2626;
            color: white;
          }
          .notes-section {
            margin-top: 25px;
            padding: 15px;
            border: 1px solid #ddd;
            border-radius: 5px;
          }
          .footer {
            text-align: center;
            margin-top: 40px;
            padding-top: 20px;
            border-top: 1px solid #ddd;
            font-size: 10px;
            color: #666;
          }
          .text-right {
            text-align: right;
          }
          .text-center {
            text-align: center;
          }
        </style>
      </head>
      <body>
        <div class="header">
          <div class="restaurant-info">
            <div class="restaurant-name">${restaurantInfo.name}</div>
            <div class="restaurant-details">
              ${restaurantInfo.address ? `<div>${restaurantInfo.address}</div>` : ''}
              ${restaurantInfo.phone ? `<div>Tel: ${restaurantInfo.phone}</div>` : ''}
              ${restaurantInfo.nif ? `<div>NIF: ${restaurantInfo.nif}</div>` : ''}
            </div>
          </div>
          <div class="invoice-info">
            <div class="doc-type">FATURA</div>
            <div class="invoice-number">Nº ${order.id.substring(0, 8).toUpperCase()}</div>
            <div class="invoice-number">${order.createdAt ? format(new Date(order.createdAt), "dd/MM/yyyy", { locale: ptBR }) : '-'}</div>
          </div>
        </div>

        <div class="customer-section">
          <div class="section-title">DADOS DO CLIENTE</div>
          <div class="customer-info">
            ${order.customerName ? `<div><strong>Nome:</strong> ${order.customerName}</div>` : '<div>Cliente não identificado</div>'}
            ${order.customerPhone ? `<div><strong>Telefone:</strong> ${order.customerPhone}</div>` : ''}
            ${order.deliveryAddress ? `<div><strong>Endereço:</strong> ${order.deliveryAddress}</div>` : ''}
            <div><strong>Tipo de Pedido:</strong> ${orderTypeLabel[order.orderType] || order.orderType}</div>
            ${order.table?.number ? `<div><strong>Mesa:</strong> #${order.table.number}</div>` : ''}
          </div>
        </div>

        <table class="items-table">
          <thead>
            <tr>
              <th style="width: 10%;">Qtd</th>
              <th style="width: 50%;">Descrição</th>
              <th style="width: 20%; text-align: right;">Preço Unit.</th>
              <th style="width: 20%; text-align: right;">Total</th>
            </tr>
          </thead>
          <tbody>
            ${order.orderItems?.map((item) => `
              <tr>
                <td class="text-center">${item.quantity}</td>
                <td>
                  <div class="item-name">${item.menuItem?.name || 'Item'}</div>
                  ${item.orderItemOptions && item.orderItemOptions.length > 0 ? `
                    <div class="item-options">
                      ${item.orderItemOptions.map((opt) => 
                        `• ${opt.optionName}${parseFloat(opt.priceAdjustment || '0') !== 0 ? ` (${formatKwanza(opt.priceAdjustment || '0')})` : ''}`
                      ).join('<br>')}
                    </div>
                  ` : ''}
                  ${item.notes ? `<div class="item-notes">Obs: ${item.notes}</div>` : ''}
                </td>
                <td class="text-right">${formatKwanza(item.price)}</td>
                <td class="text-right">${formatKwanza(parseFloat(item.price) * item.quantity)}</td>
              </tr>
            `).join('') || ''}
          </tbody>
        </table>

        <div class="totals-section">
          <div class="total-row subtotal">
            <span>Subtotal:</span>
            <span>${formatKwanza(order.subtotal || order.totalAmount)}</span>
          </div>
          ${order.discount && parseFloat(order.discount) > 0 ? `
            <div class="total-row">
              <span>Desconto:</span>
              <span>- ${formatKwanza(order.discount)}</span>
            </div>
          ` : ''}
          ${order.couponDiscount && parseFloat(order.couponDiscount) > 0 ? `
            <div class="total-row">
              <span>Cupom:</span>
              <span>- ${formatKwanza(order.couponDiscount)}</span>
            </div>
          ` : ''}
          ${order.serviceCharge && parseFloat(order.serviceCharge) > 0 ? `
            <div class="total-row">
              <span>Taxa de Serviço:</span>
              <span>${formatKwanza(order.serviceCharge)}</span>
            </div>
          ` : ''}
          ${order.deliveryFee && parseFloat(order.deliveryFee) > 0 ? `
            <div class="total-row">
              <span>Taxa de Entrega:</span>
              <span>${formatKwanza(order.deliveryFee)}</span>
            </div>
          ` : ''}
          <div class="total-row final">
            <span>TOTAL:</span>
            <span>${formatKwanza(order.totalAmount)}</span>
          </div>
        </div>

        ${order.payments && order.payments.length > 0 ? `
          <div class="payment-section">
            <div class="section-title">INFORMAÇÕES DE PAGAMENTO</div>
            ${order.payments.map((payment) => `
              <div class="payment-info">
                <span>${paymentMethodLabels[payment.paymentMethod as keyof typeof paymentMethodLabels] || payment.paymentMethod}</span>
                <span>${formatKwanza(payment.amount)}</span>
              </div>
            `).join('')}
            <div style="margin-top: 10px;">
              <span class="payment-status status-${order.paymentStatus.replace('_', '-')}">
                ${order.paymentStatus === 'pago' ? 'PAGO' : order.paymentStatus === 'parcial' ? 'PARCIALMENTE PAGO' : 'NÃO PAGO'}
              </span>
            </div>
          </div>
        ` : ''}

        ${order.orderNotes ? `
          <div class="notes-section">
            <div class="section-title">OBSERVAÇÕES</div>
            <div>${order.orderNotes}</div>
          </div>
        ` : ''}

        <div class="footer">
          <div style="margin-bottom: 10px;">Obrigado pela sua preferência!</div>
          <div>Documento emitido em ${format(new Date(), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}</div>
          <div style="margin-top: 5px;">Este documento é uma fatura simplificada sem valor fiscal</div>
        </div>

        <script>
          window.onload = function() {
            window.print();
            setTimeout(function() {
              window.close();
            }, 100);
          };
        </script>
      </body>
      </html>
    `;

    printWindow.document.write(printContent);
    printWindow.document.close();
  };

  return (
    <Button
      variant={variant}
      size={size}
      onClick={handlePrint}
      data-testid={`button-print-invoice-${order.id}`}
    >
      <Printer className={isIconOnly ? "h-4 w-4" : "h-4 w-4 mr-2"} />
      {!isIconOnly && "Imprimir Fatura"}
    </Button>
  );
}
