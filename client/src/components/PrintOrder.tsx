import { useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Printer } from 'lucide-react';
import { formatKwanza } from '@/lib/formatters';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface PrintOrderProps {
  order: any;
  restaurantName?: string;
  variant?: 'default' | 'outline' | 'ghost';
  size?: 'default' | 'sm' | 'lg' | 'icon';
}

export function PrintOrder({ order, restaurantName = 'NaBancada', variant = 'outline', size = 'sm' }: PrintOrderProps) {
  const printRef = useRef<HTMLDivElement>(null);
  const isIconOnly = size === 'icon';

  const handlePrint = () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const orderStatusLabel: Record<string, string> = {
      pendente: 'Pendente',
      em_preparo: 'Em Preparo',
      pronto: 'Pronto',
      servido: 'Servido',
    };

    const orderTypeLabel: Record<string, string> = {
      mesa: 'Mesa',
      delivery: 'Delivery',
      takeout: 'Take-out',
    };

    const printContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Pedido #${order.id.substring(0, 8).toUpperCase()}</title>
        <style>
          @media print {
            @page {
              size: 80mm auto;
              margin: 5mm;
            }
            body {
              margin: 0;
              padding: 0;
            }
          }
          body {
            font-family: 'Courier New', monospace;
            font-size: 12px;
            line-height: 1.4;
            max-width: 80mm;
            margin: 0 auto;
            padding: 10px;
          }
          .header {
            text-align: center;
            margin-bottom: 15px;
            border-bottom: 2px dashed #000;
            padding-bottom: 10px;
          }
          .restaurant-name {
            font-size: 18px;
            font-weight: bold;
            margin-bottom: 5px;
          }
          .order-id {
            font-size: 14px;
            font-weight: bold;
            margin: 10px 0;
          }
          .info-row {
            display: flex;
            justify-content: space-between;
            margin: 3px 0;
          }
          .section {
            margin: 15px 0;
          }
          .section-title {
            font-weight: bold;
            font-size: 13px;
            margin-bottom: 8px;
            border-bottom: 1px solid #000;
            padding-bottom: 3px;
          }
          .item {
            display: flex;
            justify-content: space-between;
            margin: 5px 0;
          }
          .item-name {
            flex: 1;
          }
          .item-price {
            text-align: right;
            white-space: nowrap;
            margin-left: 10px;
          }
          .options {
            font-size: 10px;
            margin-left: 15px;
            color: #666;
          }
          .notes {
            font-size: 10px;
            font-style: italic;
            margin-left: 15px;
            color: #666;
          }
          .total {
            border-top: 2px solid #000;
            margin-top: 10px;
            padding-top: 8px;
          }
          .total-row {
            display: flex;
            justify-content: space-between;
            font-size: 14px;
            font-weight: bold;
            margin: 5px 0;
          }
          .footer {
            text-align: center;
            margin-top: 20px;
            padding-top: 10px;
            border-top: 2px dashed #000;
            font-size: 11px;
          }
          .print-time {
            margin-top: 8px;
            font-size: 10px;
            color: #666;
          }
        </style>
      </head>
      <body>
        <div class="header">
          <div class="restaurant-name">${restaurantName}</div>
          <div class="order-id">PEDIDO #${order.id.substring(0, 8).toUpperCase()}</div>
        </div>

        <div class="section">
          <div class="info-row">
            <span>Data:</span>
            <span>${format(new Date(order.createdAt), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}</span>
          </div>
          <div class="info-row">
            <span>Tipo:</span>
            <span>${orderTypeLabel[order.orderType] || order.orderType}</span>
          </div>
          ${order.table ? `
          <div class="info-row">
            <span>Mesa:</span>
            <span>#${order.table.number}</span>
          </div>
          ` : ''}
          ${order.customerName ? `
          <div class="info-row">
            <span>Cliente:</span>
            <span>${order.customerName}</span>
          </div>
          ` : ''}
          ${order.customerPhone ? `
          <div class="info-row">
            <span>Telefone:</span>
            <span>${order.customerPhone}</span>
          </div>
          ` : ''}
          ${order.deliveryAddress ? `
          <div class="info-row">
            <span>Endereço:</span>
            <span>${order.deliveryAddress}</span>
          </div>
          ` : ''}
          <div class="info-row">
            <span>Status:</span>
            <span>${orderStatusLabel[order.status] || order.status}</span>
          </div>
        </div>

        <div class="section">
          <div class="section-title">ITENS DO PEDIDO</div>
          ${order.orderItems?.map((item: any) => `
            <div class="item">
              <div class="item-name">
                ${item.quantity}x ${item.menuItem?.name || 'Item'}
              </div>
              <div class="item-price">${formatKwanza(parseFloat(item.price) * item.quantity)}</div>
            </div>
            ${item.orderItemOptions && item.orderItemOptions.length > 0 ? `
              <div class="options">
                ${item.orderItemOptions.map((opt: any) => 
                  `+ ${opt.optionName} ${parseFloat(opt.priceAdjustment) !== 0 ? `(${formatKwanza(opt.priceAdjustment)})` : ''}`
                ).join('<br>')}
              </div>
            ` : ''}
            ${item.notes ? `
              <div class="notes">Obs: ${item.notes}</div>
            ` : ''}
          `).join('')}
        </div>

        ${order.orderNotes ? `
        <div class="section">
          <div class="section-title">OBSERVAÇÕES</div>
          <div style="margin-top: 5px;">${order.orderNotes}</div>
        </div>
        ` : ''}

        <div class="total">
          <div class="total-row">
            <span>TOTAL:</span>
            <span>${formatKwanza(order.totalAmount)}</span>
          </div>
        </div>

        <div class="footer">
          <div>Obrigado pela preferência!</div>
          <div class="print-time">
            Impresso em ${format(new Date(), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
          </div>
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
      data-testid={`button-print-order-${order.id}`}
    >
      <Printer className={isIconOnly ? "h-4 w-4" : "h-4 w-4 mr-2"} />
      {!isIconOnly && "Imprimir"}
    </Button>
  );
}
