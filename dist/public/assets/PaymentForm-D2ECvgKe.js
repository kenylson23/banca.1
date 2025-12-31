import{c as Ge,j as g,B as Ye,u as Pn}from"./index-DANOnzwe.js";import{r as l,a as P,b as Ce}from"./react-vendor-DoqEe0id.js";import{f as k}from"./badge-CXHTIrtO.js";import{P as Se,x as he,q as ve,A as An,D as On,a as Tn,b as $n,e as Lt,d as jn,B as In}from"./usePrinter-sNVHTytJ.js";import{a as Fn}from"./checkbox-IOfqmjJn.js";import{I as st}from"./input-AG7S8jfj.js";import{L as Ee}from"./label-DnKpznUY.js";import{S as Ln,a as Vn,b as zn,c as Bn,d as Yn}from"./select-D7FqBw-E.js";/**
 * @license lucide-react v0.453.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const Eo=Ge("DollarSign",[["line",{x1:"12",x2:"12",y1:"2",y2:"22",key:"7eqyqh"}],["path",{d:"M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6",key:"1b0p4s"}]]);/**
 * @license lucide-react v0.453.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const Co=Ge("GripVertical",[["circle",{cx:"9",cy:"12",r:"1",key:"1vctgf"}],["circle",{cx:"9",cy:"5",r:"1",key:"hp0tcf"}],["circle",{cx:"9",cy:"19",r:"1",key:"fkjjf6"}],["circle",{cx:"15",cy:"12",r:"1",key:"1tmaij"}],["circle",{cx:"15",cy:"5",r:"1",key:"19l28e"}],["circle",{cx:"15",cy:"19",r:"1",key:"f4zoj3"}]]);/**
 * @license lucide-react v0.453.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const So=Ge("MessageSquare",[["path",{d:"M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z",key:"1lielz"}]]);/**
 * @license lucide-react v0.453.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const Ro=Ge("Pen",[["path",{d:"M21.174 6.812a1 1 0 0 0-3.986-3.987L3.842 16.174a2 2 0 0 0-.5.83l-1.321 4.352a.5.5 0 0 0 .623.622l4.353-1.32a2 2 0 0 0 .83-.497z",key:"1a8usu"}]]);function ko({order:e,restaurantName:t="NaBancada",variant:n="outline",size:r="sm"}){l.useRef(null);const o=r==="icon",i=()=>{var f;if(!e||!e.id)return;const a=window.open("","_blank");if(!a)return;const s={pendente:"Pendente",em_preparo:"Em Preparo",pronto:"Pronto",servido:"Servido"},c={mesa:"Mesa",delivery:"Delivery",takeout:"Take-out"},u=`
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Pedido #${e.id.substring(0,8).toUpperCase()}</title>
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
          <div class="restaurant-name">${t}</div>
          <div class="order-id">PEDIDO #${e.id.substring(0,8).toUpperCase()}</div>
        </div>

        <div class="section">
          <div class="info-row">
            <span>Data:</span>
            <span>${he(new Date(e.createdAt),"dd/MM/yyyy 'às' HH:mm",{locale:ve})}</span>
          </div>
          <div class="info-row">
            <span>Tipo:</span>
            <span>${c[e.orderType]||e.orderType}</span>
          </div>
          ${e.table?`
          <div class="info-row">
            <span>Mesa:</span>
            <span>#${e.table.number}</span>
          </div>
          `:""}
          ${e.customerName?`
          <div class="info-row">
            <span>Cliente:</span>
            <span>${e.customerName}</span>
          </div>
          `:""}
          ${e.customerPhone?`
          <div class="info-row">
            <span>Telefone:</span>
            <span>${e.customerPhone}</span>
          </div>
          `:""}
          ${e.deliveryAddress?`
          <div class="info-row">
            <span>Endereço:</span>
            <span>${e.deliveryAddress}</span>
          </div>
          `:""}
          <div class="info-row">
            <span>Status:</span>
            <span>${s[e.status]||e.status}</span>
          </div>
        </div>

        <div class="section">
          <div class="section-title">ITENS DO PEDIDO</div>
          ${(f=e.orderItems)==null?void 0:f.map(d=>{var p;return`
            <div class="item">
              <div class="item-name">
                ${d.quantity}x ${((p=d.menuItem)==null?void 0:p.name)||"Item"}
              </div>
              <div class="item-price">${k(parseFloat(d.price)*d.quantity)}</div>
            </div>
            ${d.orderItemOptions&&d.orderItemOptions.length>0?`
              <div class="options">
                ${d.orderItemOptions.map(m=>`+ ${m.optionName} ${parseFloat(m.priceAdjustment)!==0?`(${k(m.priceAdjustment)})`:""}`).join("<br>")}
              </div>
            `:""}
            ${d.notes?`
              <div class="notes">Obs: ${d.notes}</div>
            `:""}
          `}).join("")}
        </div>

        ${e.orderNotes?`
        <div class="section">
          <div class="section-title">OBSERVAÇÕES</div>
          <div style="margin-top: 5px;">${e.orderNotes}</div>
        </div>
        `:""}

        <div class="total">
          <div class="total-row">
            <span>TOTAL:</span>
            <span>${k(e.totalAmount)}</span>
          </div>
        </div>

        <div class="footer">
          <div>Obrigado pela preferência!</div>
          <div class="print-time">
            Impresso em ${he(new Date,"dd/MM/yyyy 'às' HH:mm",{locale:ve})}
          </div>
        </div>

        <script>
          window.onload = function() {
            window.print();
            setTimeout(function() {
              window.close();
            }, 100);
          };
        <\/script>
      </body>
      </html>
    `;a.document.write(u),a.document.close()};return g.jsxDEV(Ye,{variant:n,size:r,onClick:i,disabled:!e||!e.id,"data-testid":e!=null&&e.id?`button-print-order-${e.id}`:"button-print-order-disabled",children:[g.jsxDEV(Se,{className:o?"h-4 w-4":"h-4 w-4 mr-2"},void 0,!1,{fileName:"/home/runner/workspace/client/src/components/PrintOrder.tsx",lineNumber:258,columnNumber:7},this),!o&&"Imprimir"]},void 0,!0,{fileName:"/home/runner/workspace/client/src/components/PrintOrder.tsx",lineNumber:251,columnNumber:5},this)}function Mo({order:e,restaurantInfo:t={name:"NaBancada"},variant:n="outline",size:r="sm"}){l.useRef(null);const o=r==="icon",{getPrinterByType:i}=An(),{toast:a}=Pn(),[s,c]=l.useState(!1),u=i("invoice"),f=async()=>{var p;if(!(!e||!e.id)){c(!0);try{const m={dinheiro:"Dinheiro",multicaixa:"Multicaixa",transferencia:"Transferência Bancária",cartao:"Cartão"},x=((p=e.orderItems)==null?void 0:p.map(v=>{var y;return{name:((y=v.menuItem)==null?void 0:y.name)||"Item",quantity:v.quantity,price:k(v.price),total:k(parseFloat(v.price)*v.quantity)}}))||[],b=e.payments&&e.payments.length>0?e.payments.map(v=>m[v.paymentMethod]||v.paymentMethod).join(", "):void 0;await In.printInvoice("invoice",{invoiceNumber:e.id.substring(0,8).toUpperCase(),date:e.createdAt?he(new Date(e.createdAt),"dd/MM/yyyy",{locale:ve}):he(new Date,"dd/MM/yyyy",{locale:ve}),customerName:e.customerName||void 0,customerPhone:e.customerPhone||void 0,items:x,subtotal:k(e.subtotal||e.totalAmount),discount:e.discount&&parseFloat(e.discount)>0?k(e.discount):void 0,total:k(e.totalAmount),paymentInfo:b,notes:e.orderNotes||void 0}),a({title:"Fatura impressa",description:"Fatura enviada para impressora térmica"})}catch(m){a({title:"Erro ao imprimir",description:m instanceof Error?m.message:"Erro desconhecido",variant:"destructive"})}finally{c(!1)}}},d=()=>{var v,y;if(!e||!e.id)return;const p=window.open("","_blank");if(!p)return;const m={mesa:"Mesa",delivery:"Delivery",takeout:"Take-out",balcao:"Balcão",pdv:"PDV"},x={dinheiro:"Dinheiro",multicaixa:"Multicaixa",transferencia:"Transferência Bancária",cartao:"Cartão"},b=`
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Fatura #${e.id.substring(0,8).toUpperCase()}</title>
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
            <div class="restaurant-name">${t.name}</div>
            <div class="restaurant-details">
              ${t.address?`<div>${t.address}</div>`:""}
              ${t.phone?`<div>Tel: ${t.phone}</div>`:""}
              ${t.nif?`<div>NIF: ${t.nif}</div>`:""}
            </div>
          </div>
          <div class="invoice-info">
            <div class="doc-type">FATURA</div>
            <div class="invoice-number">Nº ${e.id.substring(0,8).toUpperCase()}</div>
            <div class="invoice-number">${e.createdAt?he(new Date(e.createdAt),"dd/MM/yyyy",{locale:ve}):"-"}</div>
          </div>
        </div>

        <div class="customer-section">
          <div class="section-title">DADOS DO CLIENTE</div>
          <div class="customer-info">
            ${e.customerName?`<div><strong>Nome:</strong> ${e.customerName}</div>`:"<div>Cliente não identificado</div>"}
            ${e.customerPhone?`<div><strong>Telefone:</strong> ${e.customerPhone}</div>`:""}
            ${e.deliveryAddress?`<div><strong>Endereço:</strong> ${e.deliveryAddress}</div>`:""}
            <div><strong>Tipo de Pedido:</strong> ${m[e.orderType]||e.orderType}</div>
            ${(v=e.table)!=null&&v.number?`<div><strong>Mesa:</strong> #${e.table.number}</div>`:""}
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
            ${((y=e.orderItems)==null?void 0:y.map(h=>{var w;return`
              <tr>
                <td class="text-center">${h.quantity}</td>
                <td>
                  <div class="item-name">${((w=h.menuItem)==null?void 0:w.name)||"Item"}</div>
                  ${h.orderItemOptions&&h.orderItemOptions.length>0?`
                    <div class="item-options">
                      ${h.orderItemOptions.map(S=>`• ${S.optionName}${parseFloat(S.priceAdjustment||"0")!==0?` (${k(S.priceAdjustment||"0")})`:""}`).join("<br>")}
                    </div>
                  `:""}
                  ${h.notes?`<div class="item-notes">Obs: ${h.notes}</div>`:""}
                </td>
                <td class="text-right">${k(h.price)}</td>
                <td class="text-right">${k(parseFloat(h.price)*h.quantity)}</td>
              </tr>
            `}).join(""))||""}
          </tbody>
        </table>

        <div class="totals-section">
          <div class="total-row subtotal">
            <span>Subtotal:</span>
            <span>${k(e.subtotal||e.totalAmount)}</span>
          </div>
          ${e.discount&&parseFloat(e.discount)>0?`
            <div class="total-row">
              <span>Desconto:</span>
              <span>- ${k(e.discount)}</span>
            </div>
          `:""}
          ${e.couponDiscount&&parseFloat(e.couponDiscount)>0?`
            <div class="total-row">
              <span>Cupom:</span>
              <span>- ${k(e.couponDiscount)}</span>
            </div>
          `:""}
          ${e.serviceCharge&&parseFloat(e.serviceCharge)>0?`
            <div class="total-row">
              <span>Taxa de Serviço:</span>
              <span>${k(e.serviceCharge)}</span>
            </div>
          `:""}
          ${e.deliveryFee&&parseFloat(e.deliveryFee)>0?`
            <div class="total-row">
              <span>Taxa de Entrega:</span>
              <span>${k(e.deliveryFee)}</span>
            </div>
          `:""}
          <div class="total-row final">
            <span>TOTAL:</span>
            <span>${k(e.totalAmount)}</span>
          </div>
        </div>

        ${e.payments&&e.payments.length>0?`
          <div class="payment-section">
            <div class="section-title">INFORMAÇÕES DE PAGAMENTO</div>
            ${e.payments.map(h=>`
              <div class="payment-info">
                <span>${x[h.paymentMethod]||h.paymentMethod}</span>
                <span>${k(h.amount)}</span>
              </div>
            `).join("")}
            <div style="margin-top: 10px;">
              <span class="payment-status status-${e.paymentStatus.replace("_","-")}">
                ${e.paymentStatus==="pago"?"PAGO":e.paymentStatus==="parcial"?"PARCIALMENTE PAGO":"NÃO PAGO"}
              </span>
            </div>
          </div>
        `:""}

        ${e.orderNotes?`
          <div class="notes-section">
            <div class="section-title">OBSERVAÇÕES</div>
            <div>${e.orderNotes}</div>
          </div>
        `:""}

        <div class="footer">
          <div style="margin-bottom: 10px;">Obrigado pela sua preferência!</div>
          <div>Documento emitido em ${he(new Date,"dd/MM/yyyy 'às' HH:mm",{locale:ve})}</div>
          <div style="margin-top: 5px;">Este documento é uma fatura simplificada sem valor fiscal</div>
        </div>

        <script>
          window.onload = function() {
            window.print();
            setTimeout(function() {
              window.close();
            }, 100);
          };
        <\/script>
      </body>
      </html>
    `;p.document.write(b),p.document.close()};return(u==null?void 0:u.status)==="connected"?g.jsxDEV(On,{children:[g.jsxDEV(Tn,{asChild:!0,children:g.jsxDEV(Ye,{variant:n,size:r,disabled:s||!e||!e.id,"data-testid":e!=null&&e.id?`button-print-invoice-${e.id}`:"button-print-invoice-disabled",className:"gap-1",children:[g.jsxDEV(Se,{className:"h-4 w-4"},void 0,!1,{fileName:"/home/runner/workspace/client/src/components/PrintInvoice.tsx",lineNumber:465,columnNumber:13},this),!o&&"Imprimir",g.jsxDEV(Fn,{className:"h-3 w-3"},void 0,!1,{fileName:"/home/runner/workspace/client/src/components/PrintInvoice.tsx",lineNumber:467,columnNumber:13},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/components/PrintInvoice.tsx",lineNumber:458,columnNumber:11},this)},void 0,!1,{fileName:"/home/runner/workspace/client/src/components/PrintInvoice.tsx",lineNumber:457,columnNumber:9},this),g.jsxDEV($n,{align:"end",children:[g.jsxDEV(Lt,{onClick:f,"data-testid":e!=null&&e.id?`menu-item-print-thermal-invoice-${e.id}`:"menu-item-print-thermal-invoice-disabled",children:[g.jsxDEV(Se,{className:"h-4 w-4 mr-2"},void 0,!1,{fileName:"/home/runner/workspace/client/src/components/PrintInvoice.tsx",lineNumber:475,columnNumber:13},this),"Impressora Térmica"]},void 0,!0,{fileName:"/home/runner/workspace/client/src/components/PrintInvoice.tsx",lineNumber:471,columnNumber:11},this),g.jsxDEV(jn,{},void 0,!1,{fileName:"/home/runner/workspace/client/src/components/PrintInvoice.tsx",lineNumber:478,columnNumber:11},this),g.jsxDEV(Lt,{onClick:d,"data-testid":e!=null&&e.id?`menu-item-print-browser-invoice-${e.id}`:"menu-item-print-browser-invoice-disabled",children:[g.jsxDEV(Se,{className:"h-4 w-4 mr-2"},void 0,!1,{fileName:"/home/runner/workspace/client/src/components/PrintInvoice.tsx",lineNumber:483,columnNumber:13},this),"Impressão do Navegador"]},void 0,!0,{fileName:"/home/runner/workspace/client/src/components/PrintInvoice.tsx",lineNumber:479,columnNumber:11},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/components/PrintInvoice.tsx",lineNumber:470,columnNumber:9},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/components/PrintInvoice.tsx",lineNumber:456,columnNumber:7},this):g.jsxDEV(Ye,{variant:n,size:r,onClick:d,disabled:s||!e||!e.id,"data-testid":e!=null&&e.id?`button-print-invoice-${e.id}`:"button-print-invoice-disabled",children:[g.jsxDEV(Se,{className:o?"h-4 w-4":"h-4 w-4 mr-2"},void 0,!1,{fileName:"/home/runner/workspace/client/src/components/PrintInvoice.tsx",lineNumber:499,columnNumber:7},this),!o&&"Imprimir Fatura"]},void 0,!0,{fileName:"/home/runner/workspace/client/src/components/PrintInvoice.tsx",lineNumber:492,columnNumber:5},this)}function Po(){for(var e=arguments.length,t=new Array(e),n=0;n<e;n++)t[n]=arguments[n];return l.useMemo(()=>r=>{t.forEach(o=>o(r))},t)}const Je=typeof window<"u"&&typeof window.document<"u"&&typeof window.document.createElement<"u";function be(e){const t=Object.prototype.toString.call(e);return t==="[object Window]"||t==="[object global]"}function pt(e){return"nodeType"in e}function F(e){var t,n;return e?be(e)?e:pt(e)&&(t=(n=e.ownerDocument)==null?void 0:n.defaultView)!=null?t:window:window}function ht(e){const{Document:t}=F(e);return e instanceof t}function Te(e){return be(e)?!1:e instanceof F(e).HTMLElement}function Zt(e){return e instanceof F(e).SVGElement}function ye(e){return e?be(e)?e.document:pt(e)?ht(e)?e:Te(e)||Zt(e)?e.ownerDocument:document:document:document}const Q=Je?l.useLayoutEffect:l.useEffect;function _e(e){const t=l.useRef(e);return Q(()=>{t.current=e}),l.useCallback(function(){for(var n=arguments.length,r=new Array(n),o=0;o<n;o++)r[o]=arguments[o];return t.current==null?void 0:t.current(...r)},[])}function Un(){const e=l.useRef(null),t=l.useCallback((r,o)=>{e.current=setInterval(r,o)},[]),n=l.useCallback(()=>{e.current!==null&&(clearInterval(e.current),e.current=null)},[]);return[t,n]}function Pe(e,t){t===void 0&&(t=[e]);const n=l.useRef(e);return Q(()=>{n.current!==e&&(n.current=e)},t),n}function $e(e,t){const n=l.useRef();return l.useMemo(()=>{const r=e(n.current);return n.current=r,r},[...t])}function Ue(e){const t=_e(e),n=l.useRef(null),r=l.useCallback(o=>{o!==n.current&&(t==null||t(o,n.current)),n.current=o},[]);return[n,r]}function Xe(e){const t=l.useRef();return l.useEffect(()=>{t.current=e},[e]),t.current}let at={};function Qe(e,t){return l.useMemo(()=>{if(t)return t;const n=at[e]==null?0:at[e]+1;return at[e]=n,e+"-"+n},[e,t])}function en(e){return function(t){for(var n=arguments.length,r=new Array(n>1?n-1:0),o=1;o<n;o++)r[o-1]=arguments[o];return r.reduce((i,a)=>{const s=Object.entries(a);for(const[c,u]of s){const f=i[c];f!=null&&(i[c]=f+e*u)}return i},{...t})}}const ge=en(1),He=en(-1);function Xn(e){return"clientX"in e&&"clientY"in e}function vt(e){if(!e)return!1;const{KeyboardEvent:t}=F(e.target);return t&&e instanceof t}function Hn(e){if(!e)return!1;const{TouchEvent:t}=F(e.target);return t&&e instanceof t}function qe(e){if(Hn(e)){if(e.touches&&e.touches.length){const{clientX:t,clientY:n}=e.touches[0];return{x:t,y:n}}else if(e.changedTouches&&e.changedTouches.length){const{clientX:t,clientY:n}=e.changedTouches[0];return{x:t,y:n}}}return Xn(e)?{x:e.clientX,y:e.clientY}:null}const Ae=Object.freeze({Translate:{toString(e){if(!e)return;const{x:t,y:n}=e;return"translate3d("+(t?Math.round(t):0)+"px, "+(n?Math.round(n):0)+"px, 0)"}},Scale:{toString(e){if(!e)return;const{scaleX:t,scaleY:n}=e;return"scaleX("+t+") scaleY("+n+")"}},Transform:{toString(e){if(e)return[Ae.Translate.toString(e),Ae.Scale.toString(e)].join(" ")}},Transition:{toString(e){let{property:t,duration:n,easing:r}=e;return t+" "+n+"ms "+r}}}),Vt="a,frame,iframe,input:not([type=hidden]):not(:disabled),select:not(:disabled),textarea:not(:disabled),button:not(:disabled),*[tabindex]";function qn(e){return e.matches(Vt)?e:e.querySelector(Vt)}const Kn={display:"none"};function Wn(e){let{id:t,value:n}=e;return P.createElement("div",{id:t,style:Kn},n)}function Gn(e){let{id:t,announcement:n,ariaLiveType:r="assertive"}=e;const o={position:"fixed",top:0,left:0,width:1,height:1,margin:-1,border:0,padding:0,overflow:"hidden",clip:"rect(0 0 0 0)",clipPath:"inset(100%)",whiteSpace:"nowrap"};return P.createElement("div",{id:t,style:o,role:"status","aria-live":r,"aria-atomic":!0},n)}function Jn(){const[e,t]=l.useState("");return{announce:l.useCallback(r=>{r!=null&&t(r)},[]),announcement:e}}const tn=l.createContext(null);function _n(e){const t=l.useContext(tn);l.useEffect(()=>{if(!t)throw new Error("useDndMonitor must be used within a children of <DndContext>");return t(e)},[e,t])}function Qn(){const[e]=l.useState(()=>new Set),t=l.useCallback(r=>(e.add(r),()=>e.delete(r)),[e]);return[l.useCallback(r=>{let{type:o,event:i}=r;e.forEach(a=>{var s;return(s=a[o])==null?void 0:s.call(a,i)})},[e]),t]}const Zn={draggable:`
    To pick up a draggable item, press the space bar.
    While dragging, use the arrow keys to move the item.
    Press space again to drop the item in its new position, or press escape to cancel.
  `},er={onDragStart(e){let{active:t}=e;return"Picked up draggable item "+t.id+"."},onDragOver(e){let{active:t,over:n}=e;return n?"Draggable item "+t.id+" was moved over droppable area "+n.id+".":"Draggable item "+t.id+" is no longer over a droppable area."},onDragEnd(e){let{active:t,over:n}=e;return n?"Draggable item "+t.id+" was dropped over droppable area "+n.id:"Draggable item "+t.id+" was dropped."},onDragCancel(e){let{active:t}=e;return"Dragging was cancelled. Draggable item "+t.id+" was dropped."}};function tr(e){let{announcements:t=er,container:n,hiddenTextDescribedById:r,screenReaderInstructions:o=Zn}=e;const{announce:i,announcement:a}=Jn(),s=Qe("DndLiveRegion"),[c,u]=l.useState(!1);if(l.useEffect(()=>{u(!0)},[]),_n(l.useMemo(()=>({onDragStart(d){let{active:p}=d;i(t.onDragStart({active:p}))},onDragMove(d){let{active:p,over:m}=d;t.onDragMove&&i(t.onDragMove({active:p,over:m}))},onDragOver(d){let{active:p,over:m}=d;i(t.onDragOver({active:p,over:m}))},onDragEnd(d){let{active:p,over:m}=d;i(t.onDragEnd({active:p,over:m}))},onDragCancel(d){let{active:p,over:m}=d;i(t.onDragCancel({active:p,over:m}))}}),[i,t])),!c)return null;const f=P.createElement(P.Fragment,null,P.createElement(Wn,{id:r,value:o.draggable}),P.createElement(Gn,{id:s,announcement:a}));return n?Ce.createPortal(f,n):f}var O;(function(e){e.DragStart="dragStart",e.DragMove="dragMove",e.DragEnd="dragEnd",e.DragCancel="dragCancel",e.DragOver="dragOver",e.RegisterDroppable="registerDroppable",e.SetDroppableDisabled="setDroppableDisabled",e.UnregisterDroppable="unregisterDroppable"})(O||(O={}));function Ke(){}function Ao(e,t){return l.useMemo(()=>({sensor:e,options:t??{}}),[e,t])}function Oo(){for(var e=arguments.length,t=new Array(e),n=0;n<e;n++)t[n]=arguments[n];return l.useMemo(()=>[...t].filter(r=>r!=null),[...t])}const H=Object.freeze({x:0,y:0});function nn(e,t){return Math.sqrt(Math.pow(e.x-t.x,2)+Math.pow(e.y-t.y,2))}function nr(e,t){const n=qe(e);if(!n)return"0 0";const r={x:(n.x-t.left)/t.width*100,y:(n.y-t.top)/t.height*100};return r.x+"% "+r.y+"%"}function rn(e,t){let{data:{value:n}}=e,{data:{value:r}}=t;return n-r}function rr(e,t){let{data:{value:n}}=e,{data:{value:r}}=t;return r-n}function zt(e){let{left:t,top:n,height:r,width:o}=e;return[{x:t,y:n},{x:t+o,y:n},{x:t,y:n+r},{x:t+o,y:n+r}]}function or(e,t){if(!e||e.length===0)return null;const[n]=e;return n[t]}function Bt(e,t,n){return t===void 0&&(t=e.left),n===void 0&&(n=e.top),{x:t+e.width*.5,y:n+e.height*.5}}const To=e=>{let{collisionRect:t,droppableRects:n,droppableContainers:r}=e;const o=Bt(t,t.left,t.top),i=[];for(const a of r){const{id:s}=a,c=n.get(s);if(c){const u=nn(Bt(c),o);i.push({id:s,data:{droppableContainer:a,value:u}})}}return i.sort(rn)},$o=e=>{let{collisionRect:t,droppableRects:n,droppableContainers:r}=e;const o=zt(t),i=[];for(const a of r){const{id:s}=a,c=n.get(s);if(c){const u=zt(c),f=o.reduce((p,m,x)=>p+nn(u[x],m),0),d=Number((f/4).toFixed(4));i.push({id:s,data:{droppableContainer:a,value:d}})}}return i.sort(rn)};function ir(e,t){const n=Math.max(t.top,e.top),r=Math.max(t.left,e.left),o=Math.min(t.left+t.width,e.left+e.width),i=Math.min(t.top+t.height,e.top+e.height),a=o-r,s=i-n;if(r<o&&n<i){const c=t.width*t.height,u=e.width*e.height,f=a*s,d=f/(c+u-f);return Number(d.toFixed(4))}return 0}const sr=e=>{let{collisionRect:t,droppableRects:n,droppableContainers:r}=e;const o=[];for(const i of r){const{id:a}=i,s=n.get(a);if(s){const c=ir(s,t);c>0&&o.push({id:a,data:{droppableContainer:i,value:c}})}}return o.sort(rr)};function ar(e,t,n){return{...e,scaleX:t&&n?t.width/n.width:1,scaleY:t&&n?t.height/n.height:1}}function on(e,t){return e&&t?{x:e.left-t.left,y:e.top-t.top}:H}function lr(e){return function(n){for(var r=arguments.length,o=new Array(r>1?r-1:0),i=1;i<r;i++)o[i-1]=arguments[i];return o.reduce((a,s)=>({...a,top:a.top+e*s.y,bottom:a.bottom+e*s.y,left:a.left+e*s.x,right:a.right+e*s.x}),{...n})}}const cr=lr(1);function sn(e){if(e.startsWith("matrix3d(")){const t=e.slice(9,-1).split(/, /);return{x:+t[12],y:+t[13],scaleX:+t[0],scaleY:+t[5]}}else if(e.startsWith("matrix(")){const t=e.slice(7,-1).split(/, /);return{x:+t[4],y:+t[5],scaleX:+t[0],scaleY:+t[3]}}return null}function ur(e,t,n){const r=sn(t);if(!r)return e;const{scaleX:o,scaleY:i,x:a,y:s}=r,c=e.left-a-(1-o)*parseFloat(n),u=e.top-s-(1-i)*parseFloat(n.slice(n.indexOf(" ")+1)),f=o?e.width/o:e.width,d=i?e.height/i:e.height;return{width:f,height:d,top:u,right:c+f,bottom:u+d,left:c}}const dr={ignoreTransform:!1};function je(e,t){t===void 0&&(t=dr);let n=e.getBoundingClientRect();if(t.ignoreTransform){const{transform:u,transformOrigin:f}=F(e).getComputedStyle(e);u&&(n=ur(n,u,f))}const{top:r,left:o,width:i,height:a,bottom:s,right:c}=n;return{top:r,left:o,width:i,height:a,bottom:s,right:c}}function Yt(e){return je(e,{ignoreTransform:!0})}function fr(e){const t=e.innerWidth,n=e.innerHeight;return{top:0,left:0,right:t,bottom:n,width:t,height:n}}function mr(e,t){return t===void 0&&(t=F(e).getComputedStyle(e)),t.position==="fixed"}function pr(e,t){t===void 0&&(t=F(e).getComputedStyle(e));const n=/(auto|scroll|overlay)/;return["overflow","overflowX","overflowY"].some(o=>{const i=t[o];return typeof i=="string"?n.test(i):!1})}function gt(e,t){const n=[];function r(o){if(t!=null&&n.length>=t||!o)return n;if(ht(o)&&o.scrollingElement!=null&&!n.includes(o.scrollingElement))return n.push(o.scrollingElement),n;if(!Te(o)||Zt(o)||n.includes(o))return n;const i=F(e).getComputedStyle(o);return o!==e&&pr(o,i)&&n.push(o),mr(o,i)?n:r(o.parentNode)}return e?r(e):n}function an(e){const[t]=gt(e,1);return t??null}function lt(e){return!Je||!e?null:be(e)?e:pt(e)?ht(e)||e===ye(e).scrollingElement?window:Te(e)?e:null:null}function ln(e){return be(e)?e.scrollX:e.scrollLeft}function cn(e){return be(e)?e.scrollY:e.scrollTop}function dt(e){return{x:ln(e),y:cn(e)}}var T;(function(e){e[e.Forward=1]="Forward",e[e.Backward=-1]="Backward"})(T||(T={}));function un(e){return!Je||!e?!1:e===document.scrollingElement}function dn(e){const t={x:0,y:0},n=un(e)?{height:window.innerHeight,width:window.innerWidth}:{height:e.clientHeight,width:e.clientWidth},r={x:e.scrollWidth-n.width,y:e.scrollHeight-n.height},o=e.scrollTop<=t.y,i=e.scrollLeft<=t.x,a=e.scrollTop>=r.y,s=e.scrollLeft>=r.x;return{isTop:o,isLeft:i,isBottom:a,isRight:s,maxScroll:r,minScroll:t}}const hr={x:.2,y:.2};function vr(e,t,n,r,o){let{top:i,left:a,right:s,bottom:c}=n;r===void 0&&(r=10),o===void 0&&(o=hr);const{isTop:u,isBottom:f,isLeft:d,isRight:p}=dn(e),m={x:0,y:0},x={x:0,y:0},b={height:t.height*o.y,width:t.width*o.x};return!u&&i<=t.top+b.height?(m.y=T.Backward,x.y=r*Math.abs((t.top+b.height-i)/b.height)):!f&&c>=t.bottom-b.height&&(m.y=T.Forward,x.y=r*Math.abs((t.bottom-b.height-c)/b.height)),!p&&s>=t.right-b.width?(m.x=T.Forward,x.x=r*Math.abs((t.right-b.width-s)/b.width)):!d&&a<=t.left+b.width&&(m.x=T.Backward,x.x=r*Math.abs((t.left+b.width-a)/b.width)),{direction:m,speed:x}}function gr(e){if(e===document.scrollingElement){const{innerWidth:i,innerHeight:a}=window;return{top:0,left:0,right:i,bottom:a,width:i,height:a}}const{top:t,left:n,right:r,bottom:o}=e.getBoundingClientRect();return{top:t,left:n,right:r,bottom:o,width:e.clientWidth,height:e.clientHeight}}function fn(e){return e.reduce((t,n)=>ge(t,dt(n)),H)}function br(e){return e.reduce((t,n)=>t+ln(n),0)}function yr(e){return e.reduce((t,n)=>t+cn(n),0)}function mn(e,t){if(t===void 0&&(t=je),!e)return;const{top:n,left:r,bottom:o,right:i}=t(e);an(e)&&(o<=0||i<=0||n>=window.innerHeight||r>=window.innerWidth)&&e.scrollIntoView({block:"center",inline:"center"})}const xr=[["x",["left","right"],br],["y",["top","bottom"],yr]];class bt{constructor(t,n){this.rect=void 0,this.width=void 0,this.height=void 0,this.top=void 0,this.bottom=void 0,this.right=void 0,this.left=void 0;const r=gt(n),o=fn(r);this.rect={...t},this.width=t.width,this.height=t.height;for(const[i,a,s]of xr)for(const c of a)Object.defineProperty(this,c,{get:()=>{const u=s(r),f=o[i]-u;return this.rect[c]+f},enumerable:!0});Object.defineProperty(this,"rect",{enumerable:!1})}}class Re{constructor(t){this.target=void 0,this.listeners=[],this.removeAll=()=>{this.listeners.forEach(n=>{var r;return(r=this.target)==null?void 0:r.removeEventListener(...n)})},this.target=t}add(t,n,r){var o;(o=this.target)==null||o.addEventListener(t,n,r),this.listeners.push([t,n,r])}}function wr(e){const{EventTarget:t}=F(e);return e instanceof t?e:ye(e)}function ct(e,t){const n=Math.abs(e.x),r=Math.abs(e.y);return typeof t=="number"?Math.sqrt(n**2+r**2)>t:"x"in t&&"y"in t?n>t.x&&r>t.y:"x"in t?n>t.x:"y"in t?r>t.y:!1}var Y;(function(e){e.Click="click",e.DragStart="dragstart",e.Keydown="keydown",e.ContextMenu="contextmenu",e.Resize="resize",e.SelectionChange="selectionchange",e.VisibilityChange="visibilitychange"})(Y||(Y={}));function Ut(e){e.preventDefault()}function Nr(e){e.stopPropagation()}var E;(function(e){e.Space="Space",e.Down="ArrowDown",e.Right="ArrowRight",e.Left="ArrowLeft",e.Up="ArrowUp",e.Esc="Escape",e.Enter="Enter",e.Tab="Tab"})(E||(E={}));const pn={start:[E.Space,E.Enter],cancel:[E.Esc],end:[E.Space,E.Enter,E.Tab]},Dr=(e,t)=>{let{currentCoordinates:n}=t;switch(e.code){case E.Right:return{...n,x:n.x+25};case E.Left:return{...n,x:n.x-25};case E.Down:return{...n,y:n.y+25};case E.Up:return{...n,y:n.y-25}}};class hn{constructor(t){this.props=void 0,this.autoScrollEnabled=!1,this.referenceCoordinates=void 0,this.listeners=void 0,this.windowListeners=void 0,this.props=t;const{event:{target:n}}=t;this.props=t,this.listeners=new Re(ye(n)),this.windowListeners=new Re(F(n)),this.handleKeyDown=this.handleKeyDown.bind(this),this.handleCancel=this.handleCancel.bind(this),this.attach()}attach(){this.handleStart(),this.windowListeners.add(Y.Resize,this.handleCancel),this.windowListeners.add(Y.VisibilityChange,this.handleCancel),setTimeout(()=>this.listeners.add(Y.Keydown,this.handleKeyDown))}handleStart(){const{activeNode:t,onStart:n}=this.props,r=t.node.current;r&&mn(r),n(H)}handleKeyDown(t){if(vt(t)){const{active:n,context:r,options:o}=this.props,{keyboardCodes:i=pn,coordinateGetter:a=Dr,scrollBehavior:s="smooth"}=o,{code:c}=t;if(i.end.includes(c)){this.handleEnd(t);return}if(i.cancel.includes(c)){this.handleCancel(t);return}const{collisionRect:u}=r.current,f=u?{x:u.left,y:u.top}:H;this.referenceCoordinates||(this.referenceCoordinates=f);const d=a(t,{active:n,context:r.current,currentCoordinates:f});if(d){const p=He(d,f),m={x:0,y:0},{scrollableAncestors:x}=r.current;for(const b of x){const v=t.code,{isTop:y,isRight:h,isLeft:w,isBottom:S,maxScroll:C,minScroll:R}=dn(b),N=gr(b),D={x:Math.min(v===E.Right?N.right-N.width/2:N.right,Math.max(v===E.Right?N.left:N.left+N.width/2,d.x)),y:Math.min(v===E.Down?N.bottom-N.height/2:N.bottom,Math.max(v===E.Down?N.top:N.top+N.height/2,d.y))},M=v===E.Right&&!h||v===E.Left&&!w,$=v===E.Down&&!S||v===E.Up&&!y;if(M&&D.x!==d.x){const A=b.scrollLeft+p.x,W=v===E.Right&&A<=C.x||v===E.Left&&A>=R.x;if(W&&!p.y){b.scrollTo({left:A,behavior:s});return}W?m.x=b.scrollLeft-A:m.x=v===E.Right?b.scrollLeft-C.x:b.scrollLeft-R.x,m.x&&b.scrollBy({left:-m.x,behavior:s});break}else if($&&D.y!==d.y){const A=b.scrollTop+p.y,W=v===E.Down&&A<=C.y||v===E.Up&&A>=R.y;if(W&&!p.x){b.scrollTo({top:A,behavior:s});return}W?m.y=b.scrollTop-A:m.y=v===E.Down?b.scrollTop-C.y:b.scrollTop-R.y,m.y&&b.scrollBy({top:-m.y,behavior:s});break}}this.handleMove(t,ge(He(d,this.referenceCoordinates),m))}}}handleMove(t,n){const{onMove:r}=this.props;t.preventDefault(),r(n)}handleEnd(t){const{onEnd:n}=this.props;t.preventDefault(),this.detach(),n()}handleCancel(t){const{onCancel:n}=this.props;t.preventDefault(),this.detach(),n()}detach(){this.listeners.removeAll(),this.windowListeners.removeAll()}}hn.activators=[{eventName:"onKeyDown",handler:(e,t,n)=>{let{keyboardCodes:r=pn,onActivation:o}=t,{active:i}=n;const{code:a}=e.nativeEvent;if(r.start.includes(a)){const s=i.activatorNode.current;return s&&e.target!==s?!1:(e.preventDefault(),o==null||o({event:e.nativeEvent}),!0)}return!1}}];function Xt(e){return!!(e&&"distance"in e)}function Ht(e){return!!(e&&"delay"in e)}class yt{constructor(t,n,r){var o;r===void 0&&(r=wr(t.event.target)),this.props=void 0,this.events=void 0,this.autoScrollEnabled=!0,this.document=void 0,this.activated=!1,this.initialCoordinates=void 0,this.timeoutId=null,this.listeners=void 0,this.documentListeners=void 0,this.windowListeners=void 0,this.props=t,this.events=n;const{event:i}=t,{target:a}=i;this.props=t,this.events=n,this.document=ye(a),this.documentListeners=new Re(this.document),this.listeners=new Re(r),this.windowListeners=new Re(F(a)),this.initialCoordinates=(o=qe(i))!=null?o:H,this.handleStart=this.handleStart.bind(this),this.handleMove=this.handleMove.bind(this),this.handleEnd=this.handleEnd.bind(this),this.handleCancel=this.handleCancel.bind(this),this.handleKeydown=this.handleKeydown.bind(this),this.removeTextSelection=this.removeTextSelection.bind(this),this.attach()}attach(){const{events:t,props:{options:{activationConstraint:n,bypassActivationConstraint:r}}}=this;if(this.listeners.add(t.move.name,this.handleMove,{passive:!1}),this.listeners.add(t.end.name,this.handleEnd),t.cancel&&this.listeners.add(t.cancel.name,this.handleCancel),this.windowListeners.add(Y.Resize,this.handleCancel),this.windowListeners.add(Y.DragStart,Ut),this.windowListeners.add(Y.VisibilityChange,this.handleCancel),this.windowListeners.add(Y.ContextMenu,Ut),this.documentListeners.add(Y.Keydown,this.handleKeydown),n){if(r!=null&&r({event:this.props.event,activeNode:this.props.activeNode,options:this.props.options}))return this.handleStart();if(Ht(n)){this.timeoutId=setTimeout(this.handleStart,n.delay),this.handlePending(n);return}if(Xt(n)){this.handlePending(n);return}}this.handleStart()}detach(){this.listeners.removeAll(),this.windowListeners.removeAll(),setTimeout(this.documentListeners.removeAll,50),this.timeoutId!==null&&(clearTimeout(this.timeoutId),this.timeoutId=null)}handlePending(t,n){const{active:r,onPending:o}=this.props;o(r,t,this.initialCoordinates,n)}handleStart(){const{initialCoordinates:t}=this,{onStart:n}=this.props;t&&(this.activated=!0,this.documentListeners.add(Y.Click,Nr,{capture:!0}),this.removeTextSelection(),this.documentListeners.add(Y.SelectionChange,this.removeTextSelection),n(t))}handleMove(t){var n;const{activated:r,initialCoordinates:o,props:i}=this,{onMove:a,options:{activationConstraint:s}}=i;if(!o)return;const c=(n=qe(t))!=null?n:H,u=He(o,c);if(!r&&s){if(Xt(s)){if(s.tolerance!=null&&ct(u,s.tolerance))return this.handleCancel();if(ct(u,s.distance))return this.handleStart()}if(Ht(s)&&ct(u,s.tolerance))return this.handleCancel();this.handlePending(s,u);return}t.cancelable&&t.preventDefault(),a(c)}handleEnd(){const{onAbort:t,onEnd:n}=this.props;this.detach(),this.activated||t(this.props.active),n()}handleCancel(){const{onAbort:t,onCancel:n}=this.props;this.detach(),this.activated||t(this.props.active),n()}handleKeydown(t){t.code===E.Esc&&this.handleCancel()}removeTextSelection(){var t;(t=this.document.getSelection())==null||t.removeAllRanges()}}const Er={cancel:{name:"pointercancel"},move:{name:"pointermove"},end:{name:"pointerup"}};class vn extends yt{constructor(t){const{event:n}=t,r=ye(n.target);super(t,Er,r)}}vn.activators=[{eventName:"onPointerDown",handler:(e,t)=>{let{nativeEvent:n}=e,{onActivation:r}=t;return!n.isPrimary||n.button!==0?!1:(r==null||r({event:n}),!0)}}];const Cr={move:{name:"mousemove"},end:{name:"mouseup"}};var ft;(function(e){e[e.RightClick=2]="RightClick"})(ft||(ft={}));class Sr extends yt{constructor(t){super(t,Cr,ye(t.event.target))}}Sr.activators=[{eventName:"onMouseDown",handler:(e,t)=>{let{nativeEvent:n}=e,{onActivation:r}=t;return n.button===ft.RightClick?!1:(r==null||r({event:n}),!0)}}];const ut={cancel:{name:"touchcancel"},move:{name:"touchmove"},end:{name:"touchend"}};class Rr extends yt{constructor(t){super(t,ut)}static setup(){return window.addEventListener(ut.move.name,t,{capture:!1,passive:!1}),function(){window.removeEventListener(ut.move.name,t)};function t(){}}}Rr.activators=[{eventName:"onTouchStart",handler:(e,t)=>{let{nativeEvent:n}=e,{onActivation:r}=t;const{touches:o}=n;return o.length>1?!1:(r==null||r({event:n}),!0)}}];var ke;(function(e){e[e.Pointer=0]="Pointer",e[e.DraggableRect=1]="DraggableRect"})(ke||(ke={}));var We;(function(e){e[e.TreeOrder=0]="TreeOrder",e[e.ReversedTreeOrder=1]="ReversedTreeOrder"})(We||(We={}));function kr(e){let{acceleration:t,activator:n=ke.Pointer,canScroll:r,draggingRect:o,enabled:i,interval:a=5,order:s=We.TreeOrder,pointerCoordinates:c,scrollableAncestors:u,scrollableAncestorRects:f,delta:d,threshold:p}=e;const m=Pr({delta:d,disabled:!i}),[x,b]=Un(),v=l.useRef({x:0,y:0}),y=l.useRef({x:0,y:0}),h=l.useMemo(()=>{switch(n){case ke.Pointer:return c?{top:c.y,bottom:c.y,left:c.x,right:c.x}:null;case ke.DraggableRect:return o}},[n,o,c]),w=l.useRef(null),S=l.useCallback(()=>{const R=w.current;if(!R)return;const N=v.current.x*y.current.x,D=v.current.y*y.current.y;R.scrollBy(N,D)},[]),C=l.useMemo(()=>s===We.TreeOrder?[...u].reverse():u,[s,u]);l.useEffect(()=>{if(!i||!u.length||!h){b();return}for(const R of C){if((r==null?void 0:r(R))===!1)continue;const N=u.indexOf(R),D=f[N];if(!D)continue;const{direction:M,speed:$}=vr(R,D,h,t,p);for(const A of["x","y"])m[A][M[A]]||($[A]=0,M[A]=0);if($.x>0||$.y>0){b(),w.current=R,x(S,a),v.current=$,y.current=M;return}}v.current={x:0,y:0},y.current={x:0,y:0},b()},[t,S,r,b,i,a,JSON.stringify(h),JSON.stringify(m),x,u,C,f,JSON.stringify(p)])}const Mr={x:{[T.Backward]:!1,[T.Forward]:!1},y:{[T.Backward]:!1,[T.Forward]:!1}};function Pr(e){let{delta:t,disabled:n}=e;const r=Xe(t);return $e(o=>{if(n||!r||!o)return Mr;const i={x:Math.sign(t.x-r.x),y:Math.sign(t.y-r.y)};return{x:{[T.Backward]:o.x[T.Backward]||i.x===-1,[T.Forward]:o.x[T.Forward]||i.x===1},y:{[T.Backward]:o.y[T.Backward]||i.y===-1,[T.Forward]:o.y[T.Forward]||i.y===1}}},[n,t,r])}function Ar(e,t){const n=t!=null?e.get(t):void 0,r=n?n.node.current:null;return $e(o=>{var i;return t==null?null:(i=r??o)!=null?i:null},[r,t])}function Or(e,t){return l.useMemo(()=>e.reduce((n,r)=>{const{sensor:o}=r,i=o.activators.map(a=>({eventName:a.eventName,handler:t(a.handler,r)}));return[...n,...i]},[]),[e,t])}var Oe;(function(e){e[e.Always=0]="Always",e[e.BeforeDragging=1]="BeforeDragging",e[e.WhileDragging=2]="WhileDragging"})(Oe||(Oe={}));var mt;(function(e){e.Optimized="optimized"})(mt||(mt={}));const qt=new Map;function Tr(e,t){let{dragging:n,dependencies:r,config:o}=t;const[i,a]=l.useState(null),{frequency:s,measure:c,strategy:u}=o,f=l.useRef(e),d=v(),p=Pe(d),m=l.useCallback(function(y){y===void 0&&(y=[]),!p.current&&a(h=>h===null?y:h.concat(y.filter(w=>!h.includes(w))))},[p]),x=l.useRef(null),b=$e(y=>{if(d&&!n)return qt;if(!y||y===qt||f.current!==e||i!=null){const h=new Map;for(let w of e){if(!w)continue;if(i&&i.length>0&&!i.includes(w.id)&&w.rect.current){h.set(w.id,w.rect.current);continue}const S=w.node.current,C=S?new bt(c(S),S):null;w.rect.current=C,C&&h.set(w.id,C)}return h}return y},[e,i,n,d,c]);return l.useEffect(()=>{f.current=e},[e]),l.useEffect(()=>{d||m()},[n,d]),l.useEffect(()=>{i&&i.length>0&&a(null)},[JSON.stringify(i)]),l.useEffect(()=>{d||typeof s!="number"||x.current!==null||(x.current=setTimeout(()=>{m(),x.current=null},s))},[s,d,m,...r]),{droppableRects:b,measureDroppableContainers:m,measuringScheduled:i!=null};function v(){switch(u){case Oe.Always:return!1;case Oe.BeforeDragging:return n;default:return!n}}}function xt(e,t){return $e(n=>e?n||(typeof t=="function"?t(e):e):null,[t,e])}function $r(e,t){return xt(e,t)}function jr(e){let{callback:t,disabled:n}=e;const r=_e(t),o=l.useMemo(()=>{if(n||typeof window>"u"||typeof window.MutationObserver>"u")return;const{MutationObserver:i}=window;return new i(r)},[r,n]);return l.useEffect(()=>()=>o==null?void 0:o.disconnect(),[o]),o}function Ze(e){let{callback:t,disabled:n}=e;const r=_e(t),o=l.useMemo(()=>{if(n||typeof window>"u"||typeof window.ResizeObserver>"u")return;const{ResizeObserver:i}=window;return new i(r)},[n]);return l.useEffect(()=>()=>o==null?void 0:o.disconnect(),[o]),o}function Ir(e){return new bt(je(e),e)}function Kt(e,t,n){t===void 0&&(t=Ir);const[r,o]=l.useState(null);function i(){o(c=>{if(!e)return null;if(e.isConnected===!1){var u;return(u=c??n)!=null?u:null}const f=t(e);return JSON.stringify(c)===JSON.stringify(f)?c:f})}const a=jr({callback(c){if(e)for(const u of c){const{type:f,target:d}=u;if(f==="childList"&&d instanceof HTMLElement&&d.contains(e)){i();break}}}}),s=Ze({callback:i});return Q(()=>{i(),e?(s==null||s.observe(e),a==null||a.observe(document.body,{childList:!0,subtree:!0})):(s==null||s.disconnect(),a==null||a.disconnect())},[e]),r}function Fr(e){const t=xt(e);return on(e,t)}const Wt=[];function Lr(e){const t=l.useRef(e),n=$e(r=>e?r&&r!==Wt&&e&&t.current&&e.parentNode===t.current.parentNode?r:gt(e):Wt,[e]);return l.useEffect(()=>{t.current=e},[e]),n}function Vr(e){const[t,n]=l.useState(null),r=l.useRef(e),o=l.useCallback(i=>{const a=lt(i.target);a&&n(s=>s?(s.set(a,dt(a)),new Map(s)):null)},[]);return l.useEffect(()=>{const i=r.current;if(e!==i){a(i);const s=e.map(c=>{const u=lt(c);return u?(u.addEventListener("scroll",o,{passive:!0}),[u,dt(u)]):null}).filter(c=>c!=null);n(s.length?new Map(s):null),r.current=e}return()=>{a(e),a(i)};function a(s){s.forEach(c=>{const u=lt(c);u==null||u.removeEventListener("scroll",o)})}},[o,e]),l.useMemo(()=>e.length?t?Array.from(t.values()).reduce((i,a)=>ge(i,a),H):fn(e):H,[e,t])}function Gt(e,t){t===void 0&&(t=[]);const n=l.useRef(null);return l.useEffect(()=>{n.current=null},t),l.useEffect(()=>{const r=e!==H;r&&!n.current&&(n.current=e),!r&&n.current&&(n.current=null)},[e]),n.current?He(e,n.current):H}function zr(e){l.useEffect(()=>{if(!Je)return;const t=e.map(n=>{let{sensor:r}=n;return r.setup==null?void 0:r.setup()});return()=>{for(const n of t)n==null||n()}},e.map(t=>{let{sensor:n}=t;return n}))}function Br(e,t){return l.useMemo(()=>e.reduce((n,r)=>{let{eventName:o,handler:i}=r;return n[o]=a=>{i(a,t)},n},{}),[e,t])}function gn(e){return l.useMemo(()=>e?fr(e):null,[e])}const Jt=[];function Yr(e,t){t===void 0&&(t=je);const[n]=e,r=gn(n?F(n):null),[o,i]=l.useState(Jt);function a(){i(()=>e.length?e.map(c=>un(c)?r:new bt(t(c),c)):Jt)}const s=Ze({callback:a});return Q(()=>{s==null||s.disconnect(),a(),e.forEach(c=>s==null?void 0:s.observe(c))},[e]),o}function bn(e){if(!e)return null;if(e.children.length>1)return e;const t=e.children[0];return Te(t)?t:e}function Ur(e){let{measure:t}=e;const[n,r]=l.useState(null),o=l.useCallback(u=>{for(const{target:f}of u)if(Te(f)){r(d=>{const p=t(f);return d?{...d,width:p.width,height:p.height}:p});break}},[t]),i=Ze({callback:o}),a=l.useCallback(u=>{const f=bn(u);i==null||i.disconnect(),f&&(i==null||i.observe(f)),r(f?t(f):null)},[t,i]),[s,c]=Ue(a);return l.useMemo(()=>({nodeRef:s,rect:n,setRef:c}),[n,s,c])}const Xr=[{sensor:vn,options:{}},{sensor:hn,options:{}}],Hr={current:{}},Be={draggable:{measure:Yt},droppable:{measure:Yt,strategy:Oe.WhileDragging,frequency:mt.Optimized},dragOverlay:{measure:je}};class Me extends Map{get(t){var n;return t!=null&&(n=super.get(t))!=null?n:void 0}toArray(){return Array.from(this.values())}getEnabled(){return this.toArray().filter(t=>{let{disabled:n}=t;return!n})}getNodeFor(t){var n,r;return(n=(r=this.get(t))==null?void 0:r.node.current)!=null?n:void 0}}const qr={activatorEvent:null,active:null,activeNode:null,activeNodeRect:null,collisions:null,containerNodeRect:null,draggableNodes:new Map,droppableRects:new Map,droppableContainers:new Me,over:null,dragOverlay:{nodeRef:{current:null},rect:null,setRef:Ke},scrollableAncestors:[],scrollableAncestorRects:[],measuringConfiguration:Be,measureDroppableContainers:Ke,windowRect:null,measuringScheduled:!1},yn={activatorEvent:null,activators:[],active:null,activeNodeRect:null,ariaDescribedById:{draggable:""},dispatch:Ke,draggableNodes:new Map,over:null,measureDroppableContainers:Ke},Ie=l.createContext(yn),xn=l.createContext(qr);function Kr(){return{draggable:{active:null,initialCoordinates:{x:0,y:0},nodes:new Map,translate:{x:0,y:0}},droppable:{containers:new Me}}}function Wr(e,t){switch(t.type){case O.DragStart:return{...e,draggable:{...e.draggable,initialCoordinates:t.initialCoordinates,active:t.active}};case O.DragMove:return e.draggable.active==null?e:{...e,draggable:{...e.draggable,translate:{x:t.coordinates.x-e.draggable.initialCoordinates.x,y:t.coordinates.y-e.draggable.initialCoordinates.y}}};case O.DragEnd:case O.DragCancel:return{...e,draggable:{...e.draggable,active:null,initialCoordinates:{x:0,y:0},translate:{x:0,y:0}}};case O.RegisterDroppable:{const{element:n}=t,{id:r}=n,o=new Me(e.droppable.containers);return o.set(r,n),{...e,droppable:{...e.droppable,containers:o}}}case O.SetDroppableDisabled:{const{id:n,key:r,disabled:o}=t,i=e.droppable.containers.get(n);if(!i||r!==i.key)return e;const a=new Me(e.droppable.containers);return a.set(n,{...i,disabled:o}),{...e,droppable:{...e.droppable,containers:a}}}case O.UnregisterDroppable:{const{id:n,key:r}=t,o=e.droppable.containers.get(n);if(!o||r!==o.key)return e;const i=new Me(e.droppable.containers);return i.delete(n),{...e,droppable:{...e.droppable,containers:i}}}default:return e}}function Gr(e){let{disabled:t}=e;const{active:n,activatorEvent:r,draggableNodes:o}=l.useContext(Ie),i=Xe(r),a=Xe(n==null?void 0:n.id);return l.useEffect(()=>{if(!t&&!r&&i&&a!=null){if(!vt(i)||document.activeElement===i.target)return;const s=o.get(a);if(!s)return;const{activatorNode:c,node:u}=s;if(!c.current&&!u.current)return;requestAnimationFrame(()=>{for(const f of[c.current,u.current]){if(!f)continue;const d=qn(f);if(d){d.focus();break}}})}},[r,t,o,a,i]),null}function wn(e,t){let{transform:n,...r}=t;return e!=null&&e.length?e.reduce((o,i)=>i({transform:o,...r}),n):n}function Jr(e){return l.useMemo(()=>({draggable:{...Be.draggable,...e==null?void 0:e.draggable},droppable:{...Be.droppable,...e==null?void 0:e.droppable},dragOverlay:{...Be.dragOverlay,...e==null?void 0:e.dragOverlay}}),[e==null?void 0:e.draggable,e==null?void 0:e.droppable,e==null?void 0:e.dragOverlay])}function _r(e){let{activeNode:t,measure:n,initialRect:r,config:o=!0}=e;const i=l.useRef(!1),{x:a,y:s}=typeof o=="boolean"?{x:o,y:o}:o;Q(()=>{if(!a&&!s||!t){i.current=!1;return}if(i.current||!r)return;const u=t==null?void 0:t.node.current;if(!u||u.isConnected===!1)return;const f=n(u),d=on(f,r);if(a||(d.x=0),s||(d.y=0),i.current=!0,Math.abs(d.x)>0||Math.abs(d.y)>0){const p=an(u);p&&p.scrollBy({top:d.y,left:d.x})}},[t,a,s,r,n])}const et=l.createContext({...H,scaleX:1,scaleY:1});var ie;(function(e){e[e.Uninitialized=0]="Uninitialized",e[e.Initializing=1]="Initializing",e[e.Initialized=2]="Initialized"})(ie||(ie={}));const jo=l.memo(function(t){var n,r,o,i;let{id:a,accessibility:s,autoScroll:c=!0,children:u,sensors:f=Xr,collisionDetection:d=sr,measuring:p,modifiers:m,...x}=t;const b=l.useReducer(Wr,void 0,Kr),[v,y]=b,[h,w]=Qn(),[S,C]=l.useState(ie.Uninitialized),R=S===ie.Initialized,{draggable:{active:N,nodes:D,translate:M},droppable:{containers:$}}=v,A=N!=null?D.get(N):null,W=l.useRef({initial:null,translated:null}),G=l.useMemo(()=>{var I;return N!=null?{id:N,data:(I=A==null?void 0:A.data)!=null?I:Hr,rect:W}:null},[N,A]),Z=l.useRef(null),[wt,Nt]=l.useState(null),[J,Dt]=l.useState(null),se=Pe(x,Object.values(x)),tt=Qe("DndDescribedBy",a),Et=l.useMemo(()=>$.getEnabled(),[$]),ae=Jr(p),{droppableRects:ue,measureDroppableContainers:Fe,measuringScheduled:Ct}=Tr(Et,{dragging:R,dependencies:[M.x,M.y],config:ae.droppable}),U=Ar(D,N),St=l.useMemo(()=>J?qe(J):null,[J]),Rt=Mn(),kt=$r(U,ae.draggable.measure);_r({activeNode:N!=null?D.get(N):null,config:Rt.layoutShiftCompensation,initialRect:kt,measure:ae.draggable.measure});const X=Kt(U,ae.draggable.measure,kt),nt=Kt(U?U.parentElement:null),le=l.useRef({activatorEvent:null,active:null,activeNode:U,collisionRect:null,collisions:null,droppableRects:ue,draggableNodes:D,draggingNode:null,draggingNodeRect:null,droppableContainers:$,over:null,scrollableAncestors:[],scrollAdjustedTranslate:null}),Mt=$.getNodeFor((n=le.current.over)==null?void 0:n.id),ce=Ur({measure:ae.dragOverlay.measure}),Le=(r=ce.nodeRef.current)!=null?r:U,de=R?(o=ce.rect)!=null?o:X:null,Pt=!!(ce.nodeRef.current&&ce.rect),At=Fr(Pt?null:X),rt=gn(Le?F(Le):null),ee=Lr(R?Mt??U:null),Ve=Yr(ee),ze=wn(m,{transform:{x:M.x-At.x,y:M.y-At.y,scaleX:1,scaleY:1},activatorEvent:J,active:G,activeNodeRect:X,containerNodeRect:nt,draggingNodeRect:de,over:le.current.over,overlayNodeRect:ce.rect,scrollableAncestors:ee,scrollableAncestorRects:Ve,windowRect:rt}),Ot=St?ge(St,M):null,Tt=Vr(ee),Nn=Gt(Tt),Dn=Gt(Tt,[X]),fe=ge(ze,Nn),me=de?cr(de,ze):null,xe=G&&me?d({active:G,collisionRect:me,droppableRects:ue,droppableContainers:Et,pointerCoordinates:Ot}):null,$t=or(xe,"id"),[te,jt]=l.useState(null),En=Pt?ze:ge(ze,Dn),Cn=ar(En,(i=te==null?void 0:te.rect)!=null?i:null,X),ot=l.useRef(null),It=l.useCallback((I,L)=>{let{sensor:V,options:ne}=L;if(Z.current==null)return;const B=D.get(Z.current);if(!B)return;const z=I.nativeEvent,q=new V({active:Z.current,activeNode:B,event:z,options:ne,context:le,onAbort(j){if(!D.get(j))return;const{onDragAbort:K}=se.current,_={id:j};K==null||K(_),h({type:"onDragAbort",event:_})},onPending(j,re,K,_){if(!D.get(j))return;const{onDragPending:Ne}=se.current,oe={id:j,constraint:re,initialCoordinates:K,offset:_};Ne==null||Ne(oe),h({type:"onDragPending",event:oe})},onStart(j){const re=Z.current;if(re==null)return;const K=D.get(re);if(!K)return;const{onDragStart:_}=se.current,we={activatorEvent:z,active:{id:re,data:K.data,rect:W}};Ce.unstable_batchedUpdates(()=>{_==null||_(we),C(ie.Initializing),y({type:O.DragStart,initialCoordinates:j,active:re}),h({type:"onDragStart",event:we}),Nt(ot.current),Dt(z)})},onMove(j){y({type:O.DragMove,coordinates:j})},onEnd:pe(O.DragEnd),onCancel:pe(O.DragCancel)});ot.current=q;function pe(j){return async function(){const{active:K,collisions:_,over:we,scrollAdjustedTranslate:Ne}=le.current;let oe=null;if(K&&Ne){const{cancelDrop:De}=se.current;oe={activatorEvent:z,active:K,collisions:_,delta:Ne,over:we},j===O.DragEnd&&typeof De=="function"&&await Promise.resolve(De(oe))&&(j=O.DragCancel)}Z.current=null,Ce.unstable_batchedUpdates(()=>{y({type:j}),C(ie.Uninitialized),jt(null),Nt(null),Dt(null),ot.current=null;const De=j===O.DragEnd?"onDragEnd":"onDragCancel";if(oe){const it=se.current[De];it==null||it(oe),h({type:De,event:oe})}})}}},[D]),Sn=l.useCallback((I,L)=>(V,ne)=>{const B=V.nativeEvent,z=D.get(ne);if(Z.current!==null||!z||B.dndKit||B.defaultPrevented)return;const q={active:z};I(V,L.options,q)===!0&&(B.dndKit={capturedBy:L.sensor},Z.current=ne,It(V,L))},[D,It]),Ft=Or(f,Sn);zr(f),Q(()=>{X&&S===ie.Initializing&&C(ie.Initialized)},[X,S]),l.useEffect(()=>{const{onDragMove:I}=se.current,{active:L,activatorEvent:V,collisions:ne,over:B}=le.current;if(!L||!V)return;const z={active:L,activatorEvent:V,collisions:ne,delta:{x:fe.x,y:fe.y},over:B};Ce.unstable_batchedUpdates(()=>{I==null||I(z),h({type:"onDragMove",event:z})})},[fe.x,fe.y]),l.useEffect(()=>{const{active:I,activatorEvent:L,collisions:V,droppableContainers:ne,scrollAdjustedTranslate:B}=le.current;if(!I||Z.current==null||!L||!B)return;const{onDragOver:z}=se.current,q=ne.get($t),pe=q&&q.rect.current?{id:q.id,rect:q.rect.current,data:q.data,disabled:q.disabled}:null,j={active:I,activatorEvent:L,collisions:V,delta:{x:B.x,y:B.y},over:pe};Ce.unstable_batchedUpdates(()=>{jt(pe),z==null||z(j),h({type:"onDragOver",event:j})})},[$t]),Q(()=>{le.current={activatorEvent:J,active:G,activeNode:U,collisionRect:me,collisions:xe,droppableRects:ue,draggableNodes:D,draggingNode:Le,draggingNodeRect:de,droppableContainers:$,over:te,scrollableAncestors:ee,scrollAdjustedTranslate:fe},W.current={initial:de,translated:me}},[G,U,xe,me,D,Le,de,ue,$,te,ee,fe]),kr({...Rt,delta:M,draggingRect:me,pointerCoordinates:Ot,scrollableAncestors:ee,scrollableAncestorRects:Ve});const Rn=l.useMemo(()=>({active:G,activeNode:U,activeNodeRect:X,activatorEvent:J,collisions:xe,containerNodeRect:nt,dragOverlay:ce,draggableNodes:D,droppableContainers:$,droppableRects:ue,over:te,measureDroppableContainers:Fe,scrollableAncestors:ee,scrollableAncestorRects:Ve,measuringConfiguration:ae,measuringScheduled:Ct,windowRect:rt}),[G,U,X,J,xe,nt,ce,D,$,ue,te,Fe,ee,Ve,ae,Ct,rt]),kn=l.useMemo(()=>({activatorEvent:J,activators:Ft,active:G,activeNodeRect:X,ariaDescribedById:{draggable:tt},dispatch:y,draggableNodes:D,over:te,measureDroppableContainers:Fe}),[J,Ft,G,X,y,tt,D,te,Fe]);return P.createElement(tn.Provider,{value:w},P.createElement(Ie.Provider,{value:kn},P.createElement(xn.Provider,{value:Rn},P.createElement(et.Provider,{value:Cn},u)),P.createElement(Gr,{disabled:(s==null?void 0:s.restoreFocus)===!1})),P.createElement(tr,{...s,hiddenTextDescribedById:tt}));function Mn(){const I=(wt==null?void 0:wt.autoScrollEnabled)===!1,L=typeof c=="object"?c.enabled===!1:c===!1,V=R&&!I&&!L;return typeof c=="object"?{...c,enabled:V}:{enabled:V}}}),Qr=l.createContext(null),_t="button",Zr="Draggable";function Io(e){let{id:t,data:n,disabled:r=!1,attributes:o}=e;const i=Qe(Zr),{activators:a,activatorEvent:s,active:c,activeNodeRect:u,ariaDescribedById:f,draggableNodes:d,over:p}=l.useContext(Ie),{role:m=_t,roleDescription:x="draggable",tabIndex:b=0}=o??{},v=(c==null?void 0:c.id)===t,y=l.useContext(v?et:Qr),[h,w]=Ue(),[S,C]=Ue(),R=Br(a,t),N=Pe(n);Q(()=>(d.set(t,{id:t,key:i,node:h,activatorNode:S,data:N}),()=>{const M=d.get(t);M&&M.key===i&&d.delete(t)}),[d,t]);const D=l.useMemo(()=>({role:m,tabIndex:b,"aria-disabled":r,"aria-pressed":v&&m===_t?!0:void 0,"aria-roledescription":x,"aria-describedby":f.draggable}),[r,m,b,v,x,f.draggable]);return{active:c,activatorEvent:s,activeNodeRect:u,attributes:D,isDragging:v,listeners:r?void 0:R,node:h,over:p,setNodeRef:w,setActivatorNodeRef:C,transform:y}}function eo(){return l.useContext(xn)}const to="Droppable",no={timeout:25};function Fo(e){let{data:t,disabled:n=!1,id:r,resizeObserverConfig:o}=e;const i=Qe(to),{active:a,dispatch:s,over:c,measureDroppableContainers:u}=l.useContext(Ie),f=l.useRef({disabled:n}),d=l.useRef(!1),p=l.useRef(null),m=l.useRef(null),{disabled:x,updateMeasurementsFor:b,timeout:v}={...no,...o},y=Pe(b??r),h=l.useCallback(()=>{if(!d.current){d.current=!0;return}m.current!=null&&clearTimeout(m.current),m.current=setTimeout(()=>{u(Array.isArray(y.current)?y.current:[y.current]),m.current=null},v)},[v]),w=Ze({callback:h,disabled:x||!a}),S=l.useCallback((D,M)=>{w&&(M&&(w.unobserve(M),d.current=!1),D&&w.observe(D))},[w]),[C,R]=Ue(S),N=Pe(t);return l.useEffect(()=>{!w||!C.current||(w.disconnect(),d.current=!1,w.observe(C.current))},[C,w]),l.useEffect(()=>(s({type:O.RegisterDroppable,element:{id:r,key:i,disabled:n,node:C,rect:p,data:N}}),()=>s({type:O.UnregisterDroppable,key:i,id:r})),[r]),l.useEffect(()=>{n!==f.current.disabled&&(s({type:O.SetDroppableDisabled,id:r,key:i,disabled:n}),f.current.disabled=n)},[r,i,n,s]),{active:a,rect:p,isOver:(c==null?void 0:c.id)===r,node:C,over:c,setNodeRef:R}}function ro(e){let{animation:t,children:n}=e;const[r,o]=l.useState(null),[i,a]=l.useState(null),s=Xe(n);return!n&&!r&&s&&o(s),Q(()=>{if(!i)return;const c=r==null?void 0:r.key,u=r==null?void 0:r.props.id;if(c==null||u==null){o(null);return}Promise.resolve(t(u,i)).then(()=>{o(null)})},[t,r,i]),P.createElement(P.Fragment,null,n,r?l.cloneElement(r,{ref:a}):null)}const oo={x:0,y:0,scaleX:1,scaleY:1};function io(e){let{children:t}=e;return P.createElement(Ie.Provider,{value:yn},P.createElement(et.Provider,{value:oo},t))}const so={position:"fixed",touchAction:"none"},ao=e=>vt(e)?"transform 250ms ease":void 0,lo=l.forwardRef((e,t)=>{let{as:n,activatorEvent:r,adjustScale:o,children:i,className:a,rect:s,style:c,transform:u,transition:f=ao}=e;if(!s)return null;const d=o?u:{...u,scaleX:1,scaleY:1},p={...so,width:s.width,height:s.height,top:s.top,left:s.left,transform:Ae.Transform.toString(d),transformOrigin:o&&r?nr(r,s):void 0,transition:typeof f=="function"?f(r):f,...c};return P.createElement(n,{className:a,style:p,ref:t},i)}),co=e=>t=>{let{active:n,dragOverlay:r}=t;const o={},{styles:i,className:a}=e;if(i!=null&&i.active)for(const[s,c]of Object.entries(i.active))c!==void 0&&(o[s]=n.node.style.getPropertyValue(s),n.node.style.setProperty(s,c));if(i!=null&&i.dragOverlay)for(const[s,c]of Object.entries(i.dragOverlay))c!==void 0&&r.node.style.setProperty(s,c);return a!=null&&a.active&&n.node.classList.add(a.active),a!=null&&a.dragOverlay&&r.node.classList.add(a.dragOverlay),function(){for(const[c,u]of Object.entries(o))n.node.style.setProperty(c,u);a!=null&&a.active&&n.node.classList.remove(a.active)}},uo=e=>{let{transform:{initial:t,final:n}}=e;return[{transform:Ae.Transform.toString(t)},{transform:Ae.Transform.toString(n)}]},fo={duration:250,easing:"ease",keyframes:uo,sideEffects:co({styles:{active:{opacity:"0"}}})};function mo(e){let{config:t,draggableNodes:n,droppableContainers:r,measuringConfiguration:o}=e;return _e((i,a)=>{if(t===null)return;const s=n.get(i);if(!s)return;const c=s.node.current;if(!c)return;const u=bn(a);if(!u)return;const{transform:f}=F(a).getComputedStyle(a),d=sn(f);if(!d)return;const p=typeof t=="function"?t:po(t);return mn(c,o.draggable.measure),p({active:{id:i,data:s.data,node:c,rect:o.draggable.measure(c)},draggableNodes:n,dragOverlay:{node:a,rect:o.dragOverlay.measure(u)},droppableContainers:r,measuringConfiguration:o,transform:d})})}function po(e){const{duration:t,easing:n,sideEffects:r,keyframes:o}={...fo,...e};return i=>{let{active:a,dragOverlay:s,transform:c,...u}=i;if(!t)return;const f={x:s.rect.left-a.rect.left,y:s.rect.top-a.rect.top},d={scaleX:c.scaleX!==1?a.rect.width*c.scaleX/s.rect.width:1,scaleY:c.scaleY!==1?a.rect.height*c.scaleY/s.rect.height:1},p={x:c.x-f.x,y:c.y-f.y,...d},m=o({...u,active:a,dragOverlay:s,transform:{initial:c,final:p}}),[x]=m,b=m[m.length-1];if(JSON.stringify(x)===JSON.stringify(b))return;const v=r==null?void 0:r({active:a,dragOverlay:s,...u}),y=s.node.animate(m,{duration:t,easing:n,fill:"forwards"});return new Promise(h=>{y.onfinish=()=>{v==null||v(),h()}})}}let Qt=0;function ho(e){return l.useMemo(()=>{if(e!=null)return Qt++,Qt},[e])}const Lo=P.memo(e=>{let{adjustScale:t=!1,children:n,dropAnimation:r,style:o,transition:i,modifiers:a,wrapperElement:s="div",className:c,zIndex:u=999}=e;const{activatorEvent:f,active:d,activeNodeRect:p,containerNodeRect:m,draggableNodes:x,droppableContainers:b,dragOverlay:v,over:y,measuringConfiguration:h,scrollableAncestors:w,scrollableAncestorRects:S,windowRect:C}=eo(),R=l.useContext(et),N=ho(d==null?void 0:d.id),D=wn(a,{activatorEvent:f,active:d,activeNodeRect:p,containerNodeRect:m,draggingNodeRect:v.rect,over:y,overlayNodeRect:v.rect,scrollableAncestors:w,scrollableAncestorRects:S,transform:R,windowRect:C}),M=xt(p),$=mo({config:r,draggableNodes:x,droppableContainers:b,measuringConfiguration:h}),A=M?v.setRef:void 0;return P.createElement(io,null,P.createElement(ro,{animation:$},d&&N?P.createElement(lo,{key:N,id:d.id,ref:A,as:s,activatorEvent:f,adjustScale:t,className:c,transition:i,rect:M,style:{zIndex:u,...o},transform:D},n):null))});function Vo({onSubmit:e,totalAmount:t,paidAmount:n,isPending:r,allowSplit:o=!0}){const i=t-n,[a,s]=l.useState(i.toString()),[c,u]=l.useState("dinheiro"),[f,d]=l.useState(""),[p,m]=l.useState(!1),[x,b]=l.useState("2"),v=p&&Number(x)>1?i/Number(x):0,y=[{value:"dinheiro",label:"Dinheiro"},{value:"multicaixa",label:"Multicaixa"},{value:"transferencia",label:"Transferência"},{value:"cartao",label:"Cartão"}];return g.jsxDEV("div",{className:"space-y-4",children:[g.jsxDEV("div",{className:"p-4 rounded-md bg-muted",children:[g.jsxDEV("div",{className:"flex justify-between text-sm mb-2",children:[g.jsxDEV("span",{children:"Total:"},void 0,!1,{fileName:"/home/runner/workspace/client/src/components/PaymentForm.tsx",lineNumber:39,columnNumber:11},this),g.jsxDEV("span",{className:"font-semibold",children:k(t)},void 0,!1,{fileName:"/home/runner/workspace/client/src/components/PaymentForm.tsx",lineNumber:40,columnNumber:11},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/components/PaymentForm.tsx",lineNumber:38,columnNumber:9},this),g.jsxDEV("div",{className:"flex justify-between text-sm mb-2",children:[g.jsxDEV("span",{children:"Pago:"},void 0,!1,{fileName:"/home/runner/workspace/client/src/components/PaymentForm.tsx",lineNumber:43,columnNumber:11},this),g.jsxDEV("span",{className:"font-semibold",children:k(n)},void 0,!1,{fileName:"/home/runner/workspace/client/src/components/PaymentForm.tsx",lineNumber:44,columnNumber:11},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/components/PaymentForm.tsx",lineNumber:42,columnNumber:9},this),g.jsxDEV("div",{className:"flex justify-between",children:[g.jsxDEV("span",{children:"Restante:"},void 0,!1,{fileName:"/home/runner/workspace/client/src/components/PaymentForm.tsx",lineNumber:47,columnNumber:11},this),g.jsxDEV("span",{className:"font-bold text-lg",children:k(i)},void 0,!1,{fileName:"/home/runner/workspace/client/src/components/PaymentForm.tsx",lineNumber:48,columnNumber:11},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/components/PaymentForm.tsx",lineNumber:46,columnNumber:9},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/components/PaymentForm.tsx",lineNumber:37,columnNumber:7},this),o&&g.jsxDEV("div",{className:"space-y-2",children:[g.jsxDEV("div",{className:"flex items-center gap-2",children:[g.jsxDEV("input",{type:"checkbox",id:"enable-split",checked:p,onChange:h=>{m(h.target.checked),h.target.checked?s(v.toFixed(2)):s(i.toString())},"data-testid":"checkbox-enable-split"},void 0,!1,{fileName:"/home/runner/workspace/client/src/components/PaymentForm.tsx",lineNumber:55,columnNumber:13},this),g.jsxDEV(Ee,{htmlFor:"enable-split",className:"cursor-pointer",children:"Dividir conta igualmente entre pessoas"},void 0,!1,{fileName:"/home/runner/workspace/client/src/components/PaymentForm.tsx",lineNumber:69,columnNumber:13},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/components/PaymentForm.tsx",lineNumber:54,columnNumber:11},this),p&&g.jsxDEV("div",{className:"grid grid-cols-2 gap-4",children:[g.jsxDEV("div",{children:[g.jsxDEV(Ee,{children:"Número de Pessoas"},void 0,!1,{fileName:"/home/runner/workspace/client/src/components/PaymentForm.tsx",lineNumber:77,columnNumber:17},this),g.jsxDEV(st,{type:"number",min:2,value:x,onChange:h=>{const w=h.target.value;b(w);const S=Number(w)||2;s((i/S).toFixed(2))},"data-testid":"input-split-people"},void 0,!1,{fileName:"/home/runner/workspace/client/src/components/PaymentForm.tsx",lineNumber:78,columnNumber:17},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/components/PaymentForm.tsx",lineNumber:76,columnNumber:15},this),g.jsxDEV("div",{className:"flex items-end",children:g.jsxDEV("div",{className:"w-full p-2 rounded-md border bg-muted flex justify-between",children:[g.jsxDEV("span",{children:"Valor por pessoa"},void 0,!1,{fileName:"/home/runner/workspace/client/src/components/PaymentForm.tsx",lineNumber:93,columnNumber:19},this),g.jsxDEV("span",{className:"font-semibold",children:k(v)},void 0,!1,{fileName:"/home/runner/workspace/client/src/components/PaymentForm.tsx",lineNumber:94,columnNumber:19},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/components/PaymentForm.tsx",lineNumber:92,columnNumber:17},this)},void 0,!1,{fileName:"/home/runner/workspace/client/src/components/PaymentForm.tsx",lineNumber:91,columnNumber:15},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/components/PaymentForm.tsx",lineNumber:75,columnNumber:13},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/components/PaymentForm.tsx",lineNumber:53,columnNumber:9},this),g.jsxDEV("div",{className:"space-y-2",children:[g.jsxDEV(Ee,{children:"Método de Pagamento"},void 0,!1,{fileName:"/home/runner/workspace/client/src/components/PaymentForm.tsx",lineNumber:103,columnNumber:9},this),g.jsxDEV(Ln,{value:c,onValueChange:u,children:[g.jsxDEV(Vn,{"data-testid":"select-payment-method",children:g.jsxDEV(zn,{},void 0,!1,{fileName:"/home/runner/workspace/client/src/components/PaymentForm.tsx",lineNumber:106,columnNumber:13},this)},void 0,!1,{fileName:"/home/runner/workspace/client/src/components/PaymentForm.tsx",lineNumber:105,columnNumber:11},this),g.jsxDEV(Bn,{children:y.map(h=>g.jsxDEV(Yn,{value:h.value,children:h.label},h.value,!1,{fileName:"/home/runner/workspace/client/src/components/PaymentForm.tsx",lineNumber:110,columnNumber:15},this))},void 0,!1,{fileName:"/home/runner/workspace/client/src/components/PaymentForm.tsx",lineNumber:108,columnNumber:11},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/components/PaymentForm.tsx",lineNumber:104,columnNumber:9},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/components/PaymentForm.tsx",lineNumber:102,columnNumber:7},this),g.jsxDEV("div",{className:"space-y-2",children:[g.jsxDEV(Ee,{children:["Valor a Pagar ",o&&p&&"(Desta Pessoa)"]},void 0,!0,{fileName:"/home/runner/workspace/client/src/components/PaymentForm.tsx",lineNumber:119,columnNumber:9},this),g.jsxDEV(st,{type:"number",value:a,onChange:h=>s(h.target.value),placeholder:"0.00","data-testid":"input-payment-amount"},void 0,!1,{fileName:"/home/runner/workspace/client/src/components/PaymentForm.tsx",lineNumber:120,columnNumber:9},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/components/PaymentForm.tsx",lineNumber:118,columnNumber:7},this),c==="dinheiro"&&g.jsxDEV("div",{className:"space-y-2",children:[g.jsxDEV(Ee,{children:"Valor Recebido (opcional)"},void 0,!1,{fileName:"/home/runner/workspace/client/src/components/PaymentForm.tsx",lineNumber:131,columnNumber:11},this),g.jsxDEV(st,{type:"number",value:f,onChange:h=>d(h.target.value),placeholder:"0.00","data-testid":"input-received-amount"},void 0,!1,{fileName:"/home/runner/workspace/client/src/components/PaymentForm.tsx",lineNumber:132,columnNumber:11},this),f&&Number(f)>Number(a)&&g.jsxDEV("p",{className:"text-sm text-muted-foreground",children:["Troco: ",k(Number(f)-Number(a))]},void 0,!0,{fileName:"/home/runner/workspace/client/src/components/PaymentForm.tsx",lineNumber:140,columnNumber:13},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/components/PaymentForm.tsx",lineNumber:130,columnNumber:9},this),g.jsxDEV(Ye,{onClick:()=>e({amount:a,paymentMethod:c,receivedAmount:f||void 0}),className:"w-full",disabled:r||Number(a)<=0,"data-testid":"button-confirm-payment",children:r?"Processando...":"Confirmar Pagamento"},void 0,!1,{fileName:"/home/runner/workspace/client/src/components/PaymentForm.tsx",lineNumber:147,columnNumber:7},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/components/PaymentForm.tsx",lineNumber:36,columnNumber:5},this)}export{Ae as C,Eo as D,Co as G,E as K,So as M,Mo as P,ko as a,Qe as b,Q as c,$o as d,gt as e,Fo as f,or as g,Io as h,Po as i,vt as j,je as k,Oo as l,Ao as m,hn as n,vn as o,jo as p,To as q,Lo as r,He as s,Ro as t,eo as u,Vo as v};
