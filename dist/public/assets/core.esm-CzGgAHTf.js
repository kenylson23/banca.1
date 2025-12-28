import{c as Te,j as o,B as O,u as un,X as bt,a as Ht}from"./index-DfRoof1d.js";import{r as c,a as A,b as Se}from"./react-vendor-DoqEe0id.js";import{f as j,B as xe}from"./badge-BYVgSBr4.js";import{P as je,x as be,q as Ne,A as Bn,D as qn,a as Un,b as Xn,e as Kt,d as Yn,B as Hn}from"./usePrinter-DemZ2BQf.js";import{a as Kn,C as Gn}from"./checkbox-vIDr0K5U.js";import{C as Wn,a as Qn}from"./card-NERI1pt7.js";import{I as Xe}from"./input-D-6_1r7r.js";import{e as Nt,M as ct,P as Ye,T as Jn,S as _n,g as Zn,h as er,j as ut,k as tr}from"./tabs-BY6ppo5B.js";import{S as dt}from"./skeleton-D_P-aNGl.js";import{S as mt}from"./separator-BdFyVW6i.js";import{S as nr,R as rr,g as sr}from"./radio-group-iRfUZOFb.js";import{L as J}from"./label-BN6djm0j.js";import{S as Gt}from"./search-B8_h1PYc.js";import{E as or}from"./eye-B-LIP05D.js";import{S as ir,a as ar,b as lr,c as cr,d as ur}from"./select-C0aEDELB.js";/**
 * @license lucide-react v0.453.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const Zs=Te("DollarSign",[["line",{x1:"12",x2:"12",y1:"2",y2:"22",key:"7eqyqh"}],["path",{d:"M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6",key:"1b0p4s"}]]);/**
 * @license lucide-react v0.453.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const eo=Te("GripVertical",[["circle",{cx:"9",cy:"12",r:"1",key:"1vctgf"}],["circle",{cx:"9",cy:"5",r:"1",key:"hp0tcf"}],["circle",{cx:"9",cy:"19",r:"1",key:"fkjjf6"}],["circle",{cx:"15",cy:"12",r:"1",key:"1tmaij"}],["circle",{cx:"15",cy:"5",r:"1",key:"19l28e"}],["circle",{cx:"15",cy:"19",r:"1",key:"f4zoj3"}]]);/**
 * @license lucide-react v0.453.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const to=Te("MessageSquare",[["path",{d:"M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z",key:"1lielz"}]]);/**
 * @license lucide-react v0.453.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const no=Te("Pen",[["path",{d:"M21.174 6.812a1 1 0 0 0-3.986-3.987L3.842 16.174a2 2 0 0 0-.5.83l-1.321 4.352a.5.5 0 0 0 .623.622l4.353-1.32a2 2 0 0 0 .83-.497z",key:"1a8usu"}]]);/**
 * @license lucide-react v0.453.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const ro=Te("Split",[["path",{d:"M16 3h5v5",key:"1806ms"}],["path",{d:"M8 3H3v5",key:"15dfkv"}],["path",{d:"M12 22v-8.3a4 4 0 0 0-1.172-2.872L3 3",key:"1qrqzj"}],["path",{d:"m15 9 6-6",key:"ko1vev"}]]);function so({order:e,restaurantName:t="NaBancada",variant:n="outline",size:r="sm"}){c.useRef(null);const s=r==="icon",i=()=>{var h;if(!e||!e.id){console.error("Cannot print: order or order.id is undefined");return}const a=window.open("","_blank");if(!a)return;const l={pendente:"Pendente",em_preparo:"Em Preparo",pronto:"Pronto",servido:"Servido"},u={mesa:"Mesa",delivery:"Delivery",takeout:"Take-out"},m=`
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
            <span>${be(new Date(e.createdAt),"dd/MM/yyyy 'às' HH:mm",{locale:Ne})}</span>
          </div>
          <div class="info-row">
            <span>Tipo:</span>
            <span>${u[e.orderType]||e.orderType}</span>
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
            <span>${l[e.status]||e.status}</span>
          </div>
        </div>

        <div class="section">
          <div class="section-title">ITENS DO PEDIDO</div>
          ${(h=e.orderItems)==null?void 0:h.map(p=>{var x;return`
            <div class="item">
              <div class="item-name">
                ${p.quantity}x ${((x=p.menuItem)==null?void 0:x.name)||"Item"}
              </div>
              <div class="item-price">${j(parseFloat(p.price)*p.quantity)}</div>
            </div>
            ${p.orderItemOptions&&p.orderItemOptions.length>0?`
              <div class="options">
                ${p.orderItemOptions.map(N=>`+ ${N.optionName} ${parseFloat(N.priceAdjustment)!==0?`(${j(N.priceAdjustment)})`:""}`).join("<br>")}
              </div>
            `:""}
            ${p.notes?`
              <div class="notes">Obs: ${p.notes}</div>
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
            <span>${j(e.totalAmount)}</span>
          </div>
        </div>

        <div class="footer">
          <div>Obrigado pela preferência!</div>
          <div class="print-time">
            Impresso em ${be(new Date,"dd/MM/yyyy 'às' HH:mm",{locale:Ne})}
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
    `;a.document.write(m),a.document.close()};return o.jsxDEV(O,{variant:n,size:r,onClick:i,disabled:!e||!e.id,"data-testid":e!=null&&e.id?`button-print-order-${e.id}`:"button-print-order-disabled",children:[o.jsxDEV(je,{className:s?"h-4 w-4":"h-4 w-4 mr-2"},void 0,!1,{fileName:"/home/runner/workspace/client/src/components/PrintOrder.tsx",lineNumber:259,columnNumber:7},this),!s&&"Imprimir"]},void 0,!0,{fileName:"/home/runner/workspace/client/src/components/PrintOrder.tsx",lineNumber:252,columnNumber:5},this)}function oo({order:e,restaurantInfo:t={name:"NaBancada"},variant:n="outline",size:r="sm"}){c.useRef(null);const s=r==="icon",{getPrinterByType:i}=Bn(),{toast:a}=un(),[l,u]=c.useState(!1),m=i("invoice"),h=async()=>{var x;if(!e||!e.id){console.error("Cannot print invoice: order or order.id is undefined");return}u(!0);try{const N={dinheiro:"Dinheiro",multicaixa:"Multicaixa",transferencia:"Transferência Bancária",cartao:"Cartão"},k=((x=e.orderItems)==null?void 0:x.map(y=>{var D;return{name:((D=y.menuItem)==null?void 0:D.name)||"Item",quantity:y.quantity,price:j(y.price),total:j(parseFloat(y.price)*y.quantity)}}))||[],w=e.payments&&e.payments.length>0?e.payments.map(y=>N[y.paymentMethod]||y.paymentMethod).join(", "):void 0;await Hn.printInvoice("invoice",{invoiceNumber:e.id.substring(0,8).toUpperCase(),date:e.createdAt?be(new Date(e.createdAt),"dd/MM/yyyy",{locale:Ne}):be(new Date,"dd/MM/yyyy",{locale:Ne}),customerName:e.customerName||void 0,customerPhone:e.customerPhone||void 0,items:k,subtotal:j(e.subtotal||e.totalAmount),discount:e.discount&&parseFloat(e.discount)>0?j(e.discount):void 0,total:j(e.totalAmount),paymentInfo:w,notes:e.orderNotes||void 0}),a({title:"Fatura impressa",description:"Fatura enviada para impressora térmica"})}catch(N){a({title:"Erro ao imprimir",description:N instanceof Error?N.message:"Erro desconhecido",variant:"destructive"})}finally{u(!1)}},p=()=>{var y,D;if(!e||!e.id){console.error("Cannot print invoice: order or order.id is undefined");return}const x=window.open("","_blank");if(!x)return;const N={mesa:"Mesa",delivery:"Delivery",takeout:"Take-out",balcao:"Balcão",pdv:"PDV"},k={dinheiro:"Dinheiro",multicaixa:"Multicaixa",transferencia:"Transferência Bancária",cartao:"Cartão"},w=`
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
            <div class="invoice-number">${e.createdAt?be(new Date(e.createdAt),"dd/MM/yyyy",{locale:Ne}):"-"}</div>
          </div>
        </div>

        <div class="customer-section">
          <div class="section-title">DADOS DO CLIENTE</div>
          <div class="customer-info">
            ${e.customerName?`<div><strong>Nome:</strong> ${e.customerName}</div>`:"<div>Cliente não identificado</div>"}
            ${e.customerPhone?`<div><strong>Telefone:</strong> ${e.customerPhone}</div>`:""}
            ${e.deliveryAddress?`<div><strong>Endereço:</strong> ${e.deliveryAddress}</div>`:""}
            <div><strong>Tipo de Pedido:</strong> ${N[e.orderType]||e.orderType}</div>
            ${(y=e.table)!=null&&y.number?`<div><strong>Mesa:</strong> #${e.table.number}</div>`:""}
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
            ${((D=e.orderItems)==null?void 0:D.map(g=>{var v;return`
              <tr>
                <td class="text-center">${g.quantity}</td>
                <td>
                  <div class="item-name">${((v=g.menuItem)==null?void 0:v.name)||"Item"}</div>
                  ${g.orderItemOptions&&g.orderItemOptions.length>0?`
                    <div class="item-options">
                      ${g.orderItemOptions.map(d=>`• ${d.optionName}${parseFloat(d.priceAdjustment||"0")!==0?` (${j(d.priceAdjustment||"0")})`:""}`).join("<br>")}
                    </div>
                  `:""}
                  ${g.notes?`<div class="item-notes">Obs: ${g.notes}</div>`:""}
                </td>
                <td class="text-right">${j(g.price)}</td>
                <td class="text-right">${j(parseFloat(g.price)*g.quantity)}</td>
              </tr>
            `}).join(""))||""}
          </tbody>
        </table>

        <div class="totals-section">
          <div class="total-row subtotal">
            <span>Subtotal:</span>
            <span>${j(e.subtotal||e.totalAmount)}</span>
          </div>
          ${e.discount&&parseFloat(e.discount)>0?`
            <div class="total-row">
              <span>Desconto:</span>
              <span>- ${j(e.discount)}</span>
            </div>
          `:""}
          ${e.couponDiscount&&parseFloat(e.couponDiscount)>0?`
            <div class="total-row">
              <span>Cupom:</span>
              <span>- ${j(e.couponDiscount)}</span>
            </div>
          `:""}
          ${e.serviceCharge&&parseFloat(e.serviceCharge)>0?`
            <div class="total-row">
              <span>Taxa de Serviço:</span>
              <span>${j(e.serviceCharge)}</span>
            </div>
          `:""}
          ${e.deliveryFee&&parseFloat(e.deliveryFee)>0?`
            <div class="total-row">
              <span>Taxa de Entrega:</span>
              <span>${j(e.deliveryFee)}</span>
            </div>
          `:""}
          <div class="total-row final">
            <span>TOTAL:</span>
            <span>${j(e.totalAmount)}</span>
          </div>
        </div>

        ${e.payments&&e.payments.length>0?`
          <div class="payment-section">
            <div class="section-title">INFORMAÇÕES DE PAGAMENTO</div>
            ${e.payments.map(g=>`
              <div class="payment-info">
                <span>${k[g.paymentMethod]||g.paymentMethod}</span>
                <span>${j(g.amount)}</span>
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
          <div>Documento emitido em ${be(new Date,"dd/MM/yyyy 'às' HH:mm",{locale:Ne})}</div>
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
    `;x.document.write(w),x.document.close()};return(m==null?void 0:m.status)==="connected"?o.jsxDEV(qn,{children:[o.jsxDEV(Un,{asChild:!0,children:o.jsxDEV(O,{variant:n,size:r,disabled:l||!e||!e.id,"data-testid":e!=null&&e.id?`button-print-invoice-${e.id}`:"button-print-invoice-disabled",className:"gap-1",children:[o.jsxDEV(je,{className:"h-4 w-4"},void 0,!1,{fileName:"/home/runner/workspace/client/src/components/PrintInvoice.tsx",lineNumber:467,columnNumber:13},this),!s&&"Imprimir",o.jsxDEV(Kn,{className:"h-3 w-3"},void 0,!1,{fileName:"/home/runner/workspace/client/src/components/PrintInvoice.tsx",lineNumber:469,columnNumber:13},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/components/PrintInvoice.tsx",lineNumber:460,columnNumber:11},this)},void 0,!1,{fileName:"/home/runner/workspace/client/src/components/PrintInvoice.tsx",lineNumber:459,columnNumber:9},this),o.jsxDEV(Xn,{align:"end",children:[o.jsxDEV(Kt,{onClick:h,"data-testid":e!=null&&e.id?`menu-item-print-thermal-invoice-${e.id}`:"menu-item-print-thermal-invoice-disabled",children:[o.jsxDEV(je,{className:"h-4 w-4 mr-2"},void 0,!1,{fileName:"/home/runner/workspace/client/src/components/PrintInvoice.tsx",lineNumber:477,columnNumber:13},this),"Impressora Térmica"]},void 0,!0,{fileName:"/home/runner/workspace/client/src/components/PrintInvoice.tsx",lineNumber:473,columnNumber:11},this),o.jsxDEV(Yn,{},void 0,!1,{fileName:"/home/runner/workspace/client/src/components/PrintInvoice.tsx",lineNumber:480,columnNumber:11},this),o.jsxDEV(Kt,{onClick:p,"data-testid":e!=null&&e.id?`menu-item-print-browser-invoice-${e.id}`:"menu-item-print-browser-invoice-disabled",children:[o.jsxDEV(je,{className:"h-4 w-4 mr-2"},void 0,!1,{fileName:"/home/runner/workspace/client/src/components/PrintInvoice.tsx",lineNumber:485,columnNumber:13},this),"Impressão do Navegador"]},void 0,!0,{fileName:"/home/runner/workspace/client/src/components/PrintInvoice.tsx",lineNumber:481,columnNumber:11},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/components/PrintInvoice.tsx",lineNumber:472,columnNumber:9},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/components/PrintInvoice.tsx",lineNumber:458,columnNumber:7},this):o.jsxDEV(O,{variant:n,size:r,onClick:p,disabled:l||!e||!e.id,"data-testid":e!=null&&e.id?`button-print-invoice-${e.id}`:"button-print-invoice-disabled",children:[o.jsxDEV(je,{className:s?"h-4 w-4":"h-4 w-4 mr-2"},void 0,!1,{fileName:"/home/runner/workspace/client/src/components/PrintInvoice.tsx",lineNumber:501,columnNumber:7},this),!s&&"Imprimir Fatura"]},void 0,!0,{fileName:"/home/runner/workspace/client/src/components/PrintInvoice.tsx",lineNumber:494,columnNumber:5},this)}function dr({product:e,isOpen:t,onClose:n,onAddToOrder:r,isFavorite:s=!1,onToggleFavorite:i}){const[a,l]=c.useState(1),[u,m]=c.useState(""),[h,p]=c.useState({}),[x,N]=c.useState({});if(c.useEffect(()=>{t&&e&&(l(1),m(""),p({}),N({}))},[t,e]),!e)return null;const k=(v,d,f)=>{f==="single"?(p(b=>({...b,[v]:d})),N(b=>({...b,[d]:1}))):p(b=>{const P=b[v]||[],E=P.includes(d),C=E?P.filter(S=>S!==d):[...P,d];return N(E?S=>{const V={...S};return delete V[d],V}:S=>({...S,[d]:1})),{...b,[v]:C}})},w=(v,d)=>{N(f=>{const b=f[v]||1,P=Math.max(1,b+d);return{...f,[v]:P}})},y=()=>{var d;let v=Number(e.price);return(d=e.optionGroups)==null||d.forEach(f=>{const b=h[f.id];b&&(Array.isArray(b)?b:[b]).forEach(E=>{const C=f.options.find(S=>S.id===E);if(C){const S=x[E]||1;v+=Number(C.priceAdjustment||0)*S}})}),v*a},D=()=>{const v=[];let d=Number(e.price);Object.entries(h).forEach(([f,b])=>{var C;const P=Array.isArray(b)?b:[b],E=(C=e.optionGroups)==null?void 0:C.find(S=>S.id===f);E&&P.forEach(S=>{const V=E.options.find(Y=>Y.id===S);if(!V)return;const q=x[S]||1;v.push({optionId:S,optionGroupId:f,optionName:V.name,optionGroupName:E.name,priceAdjustment:V.priceAdjustment||"0",quantity:q}),d+=Number(V.priceAdjustment||0)*q})}),r({menuItemId:e.id,quantity:a,price:d.toFixed(2),notes:u,selectedOptions:v,menuItem:e}),n()},g=()=>e.optionGroups?e.optionGroups.every(v=>{if(v.isRequired===0)return!0;const d=h[v.id];if(!d)return!1;const f=Array.isArray(d)?d.length:1;return f>=v.minSelections&&f<=v.maxSelections}):!0;return o.jsxDEV(o.Fragment,{children:[o.jsxDEV("div",{className:`fixed inset-0 bg-black/50 z-50 transition-opacity duration-300 ${t?"opacity-100":"opacity-0 pointer-events-none"}`,onClick:n},void 0,!1,{fileName:"/home/runner/workspace/client/src/components/ProductPreviewPanel.tsx",lineNumber:186,columnNumber:7},this),o.jsxDEV("div",{className:`fixed right-0 top-0 h-full w-full sm:w-[480px] bg-background z-50 shadow-2xl transition-transform duration-300 ${t?"translate-x-0":"translate-x-full"}`,children:o.jsxDEV("div",{className:"flex flex-col h-full",children:[o.jsxDEV("div",{className:"flex items-center justify-between p-4 border-b",children:[o.jsxDEV("h2",{className:"text-lg font-semibold",children:"Detalhes do Produto"},void 0,!1,{fileName:"/home/runner/workspace/client/src/components/ProductPreviewPanel.tsx",lineNumber:200,columnNumber:13},this),o.jsxDEV("div",{className:"flex items-center gap-2",children:[i&&o.jsxDEV(O,{variant:"ghost",size:"icon",onClick:()=>i(e.id),"data-testid":"button-toggle-favorite",children:o.jsxDEV(Nt,{className:`h-5 w-5 ${s?"fill-yellow-400 text-yellow-400":"text-muted-foreground"}`},void 0,!1,{fileName:"/home/runner/workspace/client/src/components/ProductPreviewPanel.tsx",lineNumber:209,columnNumber:19},this)},void 0,!1,{fileName:"/home/runner/workspace/client/src/components/ProductPreviewPanel.tsx",lineNumber:203,columnNumber:17},this),o.jsxDEV(O,{variant:"ghost",size:"icon",onClick:n,"data-testid":"button-close-preview",children:o.jsxDEV(bt,{className:"h-5 w-5"},void 0,!1,{fileName:"/home/runner/workspace/client/src/components/ProductPreviewPanel.tsx",lineNumber:222,columnNumber:17},this)},void 0,!1,{fileName:"/home/runner/workspace/client/src/components/ProductPreviewPanel.tsx",lineNumber:216,columnNumber:15},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/components/ProductPreviewPanel.tsx",lineNumber:201,columnNumber:13},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/components/ProductPreviewPanel.tsx",lineNumber:199,columnNumber:11},this),o.jsxDEV(nr,{className:"flex-1",children:o.jsxDEV("div",{className:"p-0",children:[e.imageUrl&&o.jsxDEV("div",{className:"w-full aspect-video bg-muted overflow-hidden",children:o.jsxDEV("img",{src:e.imageUrl,alt:e.name,className:"w-full h-full object-cover"},void 0,!1,{fileName:"/home/runner/workspace/client/src/components/ProductPreviewPanel.tsx",lineNumber:231,columnNumber:19},this)},void 0,!1,{fileName:"/home/runner/workspace/client/src/components/ProductPreviewPanel.tsx",lineNumber:230,columnNumber:17},this),o.jsxDEV("div",{className:"p-6 space-y-6",children:[o.jsxDEV("div",{children:[o.jsxDEV("div",{className:"flex items-start justify-between gap-4 mb-2",children:[o.jsxDEV("div",{className:"flex-1",children:[o.jsxDEV("h3",{className:"text-2xl font-bold text-foreground",children:e.name},void 0,!1,{fileName:"/home/runner/workspace/client/src/components/ProductPreviewPanel.tsx",lineNumber:243,columnNumber:23},this),e.category&&o.jsxDEV(xe,{variant:"secondary",className:"mt-2",children:e.category.name},void 0,!1,{fileName:"/home/runner/workspace/client/src/components/ProductPreviewPanel.tsx",lineNumber:247,columnNumber:25},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/components/ProductPreviewPanel.tsx",lineNumber:242,columnNumber:21},this),o.jsxDEV("div",{className:"text-right",children:o.jsxDEV("p",{className:"text-2xl font-bold text-primary",children:j(e.price)},void 0,!1,{fileName:"/home/runner/workspace/client/src/components/ProductPreviewPanel.tsx",lineNumber:253,columnNumber:23},this)},void 0,!1,{fileName:"/home/runner/workspace/client/src/components/ProductPreviewPanel.tsx",lineNumber:252,columnNumber:21},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/components/ProductPreviewPanel.tsx",lineNumber:241,columnNumber:19},this),e.description&&o.jsxDEV("p",{className:"text-sm text-muted-foreground mt-3",children:e.description},void 0,!1,{fileName:"/home/runner/workspace/client/src/components/ProductPreviewPanel.tsx",lineNumber:260,columnNumber:21},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/components/ProductPreviewPanel.tsx",lineNumber:240,columnNumber:17},this),e.optionGroups&&e.optionGroups.length>0&&o.jsxDEV(o.Fragment,{children:[o.jsxDEV(mt,{},void 0,!1,{fileName:"/home/runner/workspace/client/src/components/ProductPreviewPanel.tsx",lineNumber:268,columnNumber:21},this),o.jsxDEV("div",{className:"space-y-6",children:e.optionGroups.sort((v,d)=>v.displayOrder-d.displayOrder).map(v=>o.jsxDEV("div",{className:"space-y-3",children:[o.jsxDEV("div",{className:"flex items-center justify-between",children:[o.jsxDEV(J,{className:"text-base font-semibold",children:[v.name,v.isRequired===1&&o.jsxDEV("span",{className:"text-destructive ml-1",children:"*"},void 0,!1,{fileName:"/home/runner/workspace/client/src/components/ProductPreviewPanel.tsx",lineNumber:278,columnNumber:35},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/components/ProductPreviewPanel.tsx",lineNumber:275,columnNumber:31},this),v.type==="multiple"&&o.jsxDEV("span",{className:"text-xs text-muted-foreground",children:v.minSelections===v.maxSelections?`Escolha ${v.maxSelections}`:`Escolha entre ${v.minSelections} e ${v.maxSelections}`},void 0,!1,{fileName:"/home/runner/workspace/client/src/components/ProductPreviewPanel.tsx",lineNumber:282,columnNumber:33},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/components/ProductPreviewPanel.tsx",lineNumber:274,columnNumber:29},this),v.type==="single"?o.jsxDEV(rr,{value:h[v.id],onValueChange:d=>k(v.id,d,"single"),children:v.options.filter(d=>d.isAvailable===1).sort((d,f)=>d.displayOrder-f.displayOrder).map(d=>{const f=h[v.id]===d.id,b=x[d.id]||1;return o.jsxDEV("div",{className:"space-y-2",children:[o.jsxDEV("div",{className:"flex items-center justify-between p-3 rounded-md border hover-elevate",children:[o.jsxDEV("div",{className:"flex items-center gap-3 flex-1",children:[o.jsxDEV(sr,{value:d.id,id:`option-${d.id}`,"data-testid":`radio-option-${d.id}`},void 0,!1,{fileName:"/home/runner/workspace/client/src/components/ProductPreviewPanel.tsx",lineNumber:305,columnNumber:45},this),o.jsxDEV(J,{htmlFor:`option-${d.id}`,className:"flex-1 cursor-pointer font-normal",children:[d.name,d.isRecommended===1&&o.jsxDEV(xe,{variant:"secondary",className:"ml-2 text-xs",children:"Recomendado"},void 0,!1,{fileName:"/home/runner/workspace/client/src/components/ProductPreviewPanel.tsx",lineNumber:316,columnNumber:49},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/components/ProductPreviewPanel.tsx",lineNumber:310,columnNumber:45},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/components/ProductPreviewPanel.tsx",lineNumber:304,columnNumber:43},this),Number(d.priceAdjustment)!==0&&o.jsxDEV("span",{className:"text-sm font-medium",children:[Number(d.priceAdjustment)>0?"+":"",j(d.priceAdjustment)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/components/ProductPreviewPanel.tsx",lineNumber:323,columnNumber:45},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/components/ProductPreviewPanel.tsx",lineNumber:303,columnNumber:41},this),f&&o.jsxDEV("div",{className:"flex items-center gap-2 pl-10",children:[o.jsxDEV("span",{className:"text-xs text-muted-foreground",children:"Quantidade:"},void 0,!1,{fileName:"/home/runner/workspace/client/src/components/ProductPreviewPanel.tsx",lineNumber:331,columnNumber:45},this),o.jsxDEV("div",{className:"flex items-center gap-1",children:[o.jsxDEV(O,{variant:"outline",size:"icon",className:"h-6 w-6",onClick:()=>w(d.id,-1),disabled:b<=1,"data-testid":`button-decrease-option-${d.id}`,children:o.jsxDEV(ct,{className:"h-3 w-3"},void 0,!1,{fileName:"/home/runner/workspace/client/src/components/ProductPreviewPanel.tsx",lineNumber:341,columnNumber:49},this)},void 0,!1,{fileName:"/home/runner/workspace/client/src/components/ProductPreviewPanel.tsx",lineNumber:333,columnNumber:47},this),o.jsxDEV("span",{className:"text-sm font-semibold w-8 text-center","data-testid":`text-option-qty-${d.id}`,children:b},void 0,!1,{fileName:"/home/runner/workspace/client/src/components/ProductPreviewPanel.tsx",lineNumber:343,columnNumber:47},this),o.jsxDEV(O,{variant:"outline",size:"icon",className:"h-6 w-6",onClick:()=>w(d.id,1),"data-testid":`button-increase-option-${d.id}`,children:o.jsxDEV(Ye,{className:"h-3 w-3"},void 0,!1,{fileName:"/home/runner/workspace/client/src/components/ProductPreviewPanel.tsx",lineNumber:353,columnNumber:49},this)},void 0,!1,{fileName:"/home/runner/workspace/client/src/components/ProductPreviewPanel.tsx",lineNumber:346,columnNumber:47},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/components/ProductPreviewPanel.tsx",lineNumber:332,columnNumber:45},this),Number(d.priceAdjustment)!==0&&b>1&&o.jsxDEV("span",{className:"text-xs text-muted-foreground ml-2",children:["= ",j(Number(d.priceAdjustment)*b)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/components/ProductPreviewPanel.tsx",lineNumber:357,columnNumber:47},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/components/ProductPreviewPanel.tsx",lineNumber:330,columnNumber:43},this)]},d.id,!0,{fileName:"/home/runner/workspace/client/src/components/ProductPreviewPanel.tsx",lineNumber:302,columnNumber:39},this)})},void 0,!1,{fileName:"/home/runner/workspace/client/src/components/ProductPreviewPanel.tsx",lineNumber:291,columnNumber:31},this):o.jsxDEV("div",{className:"space-y-2",children:v.options.filter(d=>d.isAvailable===1).sort((d,f)=>d.displayOrder-f.displayOrder).map(d=>{const f=(h[v.id]||[]).includes(d.id),b=x[d.id]||1;return o.jsxDEV("div",{className:"space-y-2",children:[o.jsxDEV("div",{className:"flex items-center justify-between p-3 rounded-md border hover-elevate",children:[o.jsxDEV("div",{className:"flex items-center gap-3 flex-1",children:[o.jsxDEV(Gn,{id:`option-${d.id}`,checked:f,onCheckedChange:()=>k(v.id,d.id,"multiple"),"data-testid":`checkbox-option-${d.id}`},void 0,!1,{fileName:"/home/runner/workspace/client/src/components/ProductPreviewPanel.tsx",lineNumber:379,columnNumber:45},this),o.jsxDEV(J,{htmlFor:`option-${d.id}`,className:"flex-1 cursor-pointer font-normal",children:[d.name,d.isRecommended===1&&o.jsxDEV(xe,{variant:"secondary",className:"ml-2 text-xs",children:"Recomendado"},void 0,!1,{fileName:"/home/runner/workspace/client/src/components/ProductPreviewPanel.tsx",lineNumber:391,columnNumber:49},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/components/ProductPreviewPanel.tsx",lineNumber:385,columnNumber:45},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/components/ProductPreviewPanel.tsx",lineNumber:378,columnNumber:43},this),Number(d.priceAdjustment)!==0&&o.jsxDEV("span",{className:"text-sm font-medium",children:[Number(d.priceAdjustment)>0?"+":"",j(d.priceAdjustment)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/components/ProductPreviewPanel.tsx",lineNumber:398,columnNumber:45},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/components/ProductPreviewPanel.tsx",lineNumber:377,columnNumber:41},this),f&&o.jsxDEV("div",{className:"flex items-center gap-2 pl-10",children:[o.jsxDEV("span",{className:"text-xs text-muted-foreground",children:"Quantidade:"},void 0,!1,{fileName:"/home/runner/workspace/client/src/components/ProductPreviewPanel.tsx",lineNumber:406,columnNumber:45},this),o.jsxDEV("div",{className:"flex items-center gap-1",children:[o.jsxDEV(O,{variant:"outline",size:"icon",className:"h-6 w-6",onClick:()=>w(d.id,-1),disabled:b<=1,"data-testid":`button-decrease-option-${d.id}`,children:o.jsxDEV(ct,{className:"h-3 w-3"},void 0,!1,{fileName:"/home/runner/workspace/client/src/components/ProductPreviewPanel.tsx",lineNumber:416,columnNumber:49},this)},void 0,!1,{fileName:"/home/runner/workspace/client/src/components/ProductPreviewPanel.tsx",lineNumber:408,columnNumber:47},this),o.jsxDEV("span",{className:"text-sm font-semibold w-8 text-center","data-testid":`text-option-qty-${d.id}`,children:b},void 0,!1,{fileName:"/home/runner/workspace/client/src/components/ProductPreviewPanel.tsx",lineNumber:418,columnNumber:47},this),o.jsxDEV(O,{variant:"outline",size:"icon",className:"h-6 w-6",onClick:()=>w(d.id,1),"data-testid":`button-increase-option-${d.id}`,children:o.jsxDEV(Ye,{className:"h-3 w-3"},void 0,!1,{fileName:"/home/runner/workspace/client/src/components/ProductPreviewPanel.tsx",lineNumber:428,columnNumber:49},this)},void 0,!1,{fileName:"/home/runner/workspace/client/src/components/ProductPreviewPanel.tsx",lineNumber:421,columnNumber:47},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/components/ProductPreviewPanel.tsx",lineNumber:407,columnNumber:45},this),Number(d.priceAdjustment)!==0&&b>1&&o.jsxDEV("span",{className:"text-xs text-muted-foreground ml-2",children:["= ",j(Number(d.priceAdjustment)*b)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/components/ProductPreviewPanel.tsx",lineNumber:432,columnNumber:47},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/components/ProductPreviewPanel.tsx",lineNumber:405,columnNumber:43},this)]},d.id,!0,{fileName:"/home/runner/workspace/client/src/components/ProductPreviewPanel.tsx",lineNumber:376,columnNumber:39},this)})},void 0,!1,{fileName:"/home/runner/workspace/client/src/components/ProductPreviewPanel.tsx",lineNumber:368,columnNumber:31},this)]},v.id,!0,{fileName:"/home/runner/workspace/client/src/components/ProductPreviewPanel.tsx",lineNumber:273,columnNumber:27},this))},void 0,!1,{fileName:"/home/runner/workspace/client/src/components/ProductPreviewPanel.tsx",lineNumber:269,columnNumber:21},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/components/ProductPreviewPanel.tsx",lineNumber:267,columnNumber:19},this),o.jsxDEV(mt,{},void 0,!1,{fileName:"/home/runner/workspace/client/src/components/ProductPreviewPanel.tsx",lineNumber:449,columnNumber:17},this),o.jsxDEV("div",{className:"space-y-3",children:[o.jsxDEV(J,{htmlFor:"notes",children:"Observações"},void 0,!1,{fileName:"/home/runner/workspace/client/src/components/ProductPreviewPanel.tsx",lineNumber:452,columnNumber:19},this),o.jsxDEV(Jn,{id:"notes",placeholder:"Alguma observação especial? (Ex: sem cebola, bem passado...)",value:u,onChange:v=>m(v.target.value),rows:3,"data-testid":"textarea-notes"},void 0,!1,{fileName:"/home/runner/workspace/client/src/components/ProductPreviewPanel.tsx",lineNumber:453,columnNumber:19},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/components/ProductPreviewPanel.tsx",lineNumber:451,columnNumber:17},this),o.jsxDEV(mt,{},void 0,!1,{fileName:"/home/runner/workspace/client/src/components/ProductPreviewPanel.tsx",lineNumber:463,columnNumber:17},this),o.jsxDEV("div",{className:"space-y-4",children:[o.jsxDEV(J,{children:"Quantidade"},void 0,!1,{fileName:"/home/runner/workspace/client/src/components/ProductPreviewPanel.tsx",lineNumber:466,columnNumber:19},this),o.jsxDEV("div",{className:"flex items-center justify-between",children:[o.jsxDEV("div",{className:"flex items-center gap-3",children:[o.jsxDEV(O,{variant:"outline",size:"icon",onClick:()=>l(Math.max(1,a-1)),disabled:a<=1,"data-testid":"button-decrease-quantity",children:o.jsxDEV(ct,{className:"h-4 w-4"},void 0,!1,{fileName:"/home/runner/workspace/client/src/components/ProductPreviewPanel.tsx",lineNumber:476,columnNumber:25},this)},void 0,!1,{fileName:"/home/runner/workspace/client/src/components/ProductPreviewPanel.tsx",lineNumber:469,columnNumber:23},this),o.jsxDEV("span",{className:"text-2xl font-semibold w-12 text-center","data-testid":"text-quantity",children:a},void 0,!1,{fileName:"/home/runner/workspace/client/src/components/ProductPreviewPanel.tsx",lineNumber:478,columnNumber:23},this),o.jsxDEV(O,{variant:"outline",size:"icon",onClick:()=>l(a+1),"data-testid":"button-increase-quantity",children:o.jsxDEV(Ye,{className:"h-4 w-4"},void 0,!1,{fileName:"/home/runner/workspace/client/src/components/ProductPreviewPanel.tsx",lineNumber:487,columnNumber:25},this)},void 0,!1,{fileName:"/home/runner/workspace/client/src/components/ProductPreviewPanel.tsx",lineNumber:481,columnNumber:23},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/components/ProductPreviewPanel.tsx",lineNumber:468,columnNumber:21},this),o.jsxDEV("div",{className:"text-right",children:[o.jsxDEV("p",{className:"text-xs text-muted-foreground",children:"Total"},void 0,!1,{fileName:"/home/runner/workspace/client/src/components/ProductPreviewPanel.tsx",lineNumber:491,columnNumber:23},this),o.jsxDEV("p",{className:"text-2xl font-bold text-primary","data-testid":"text-total-price",children:j(y())},void 0,!1,{fileName:"/home/runner/workspace/client/src/components/ProductPreviewPanel.tsx",lineNumber:492,columnNumber:23},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/components/ProductPreviewPanel.tsx",lineNumber:490,columnNumber:21},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/components/ProductPreviewPanel.tsx",lineNumber:467,columnNumber:19},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/components/ProductPreviewPanel.tsx",lineNumber:465,columnNumber:17},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/components/ProductPreviewPanel.tsx",lineNumber:239,columnNumber:15},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/components/ProductPreviewPanel.tsx",lineNumber:228,columnNumber:13},this)},void 0,!1,{fileName:"/home/runner/workspace/client/src/components/ProductPreviewPanel.tsx",lineNumber:227,columnNumber:11},this),o.jsxDEV("div",{className:"p-4 border-t bg-background",children:o.jsxDEV(O,{className:"w-full",size:"lg",onClick:D,disabled:!g(),"data-testid":"button-add-to-order",children:[o.jsxDEV(_n,{className:"h-5 w-5 mr-2"},void 0,!1,{fileName:"/home/runner/workspace/client/src/components/ProductPreviewPanel.tsx",lineNumber:510,columnNumber:15},this),"Adicionar ao Pedido - ",j(y())]},void 0,!0,{fileName:"/home/runner/workspace/client/src/components/ProductPreviewPanel.tsx",lineNumber:503,columnNumber:13},this)},void 0,!1,{fileName:"/home/runner/workspace/client/src/components/ProductPreviewPanel.tsx",lineNumber:502,columnNumber:11},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/components/ProductPreviewPanel.tsx",lineNumber:198,columnNumber:9},this)},void 0,!1,{fileName:"/home/runner/workspace/client/src/components/ProductPreviewPanel.tsx",lineNumber:193,columnNumber:7},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/components/ProductPreviewPanel.tsx",lineNumber:185,columnNumber:5},this)}function io({onAddToOrder:e,onClose:t}){un();const[n,r]=c.useState(""),[s,i]=c.useState("all"),[a,l]=c.useState(null),[u,m]=c.useState(!1),[h,p]=c.useState(new Set),{data:x=[],isLoading:N}=Ht({queryKey:["/api/menu-items"]}),{data:k=[]}=Ht({queryKey:["/api/categories"]}),w=f=>{p(b=>{const P=new Set(b);return P.has(f)?P.delete(f):P.add(f),P})},D=(()=>{let f=x.filter(b=>b.isAvailable===1);return n&&(f=f.filter(b=>{var P;return b.name.toLowerCase().includes(n.toLowerCase())||((P=b.description)==null?void 0:P.toLowerCase().includes(n.toLowerCase()))})),s==="favorites"?f=f.filter(b=>h.has(b.id)):s!=="all"&&(f=f.filter(b=>b.categoryId===s)),f})(),g=f=>f==="all"?x.filter(b=>b.isAvailable===1).length:f==="favorites"?h.size:x.filter(b=>b.categoryId===f&&b.isAvailable===1).length,v=f=>{l(f),m(!0)},d=f=>{l(f),m(!0)};return N?o.jsxDEV("div",{className:"space-y-4",children:[o.jsxDEV(dt,{className:"h-10 w-full"},void 0,!1,{fileName:"/home/runner/workspace/client/src/components/ProductSelector.tsx",lineNumber:117,columnNumber:9},this),o.jsxDEV(dt,{className:"h-12 w-full"},void 0,!1,{fileName:"/home/runner/workspace/client/src/components/ProductSelector.tsx",lineNumber:118,columnNumber:9},this),o.jsxDEV("div",{className:"grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3",children:Array.from({length:8}).map((f,b)=>o.jsxDEV(dt,{className:"h-48"},b,!1,{fileName:"/home/runner/workspace/client/src/components/ProductSelector.tsx",lineNumber:121,columnNumber:13},this))},void 0,!1,{fileName:"/home/runner/workspace/client/src/components/ProductSelector.tsx",lineNumber:119,columnNumber:9},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/components/ProductSelector.tsx",lineNumber:116,columnNumber:7},this):o.jsxDEV("div",{className:"space-y-4",children:[o.jsxDEV("div",{className:"flex items-center justify-between gap-4",children:[o.jsxDEV("div",{className:"relative flex-1",children:[o.jsxDEV(Gt,{className:"absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground"},void 0,!1,{fileName:"/home/runner/workspace/client/src/components/ProductSelector.tsx",lineNumber:132,columnNumber:11},this),o.jsxDEV(Xe,{placeholder:"Buscar produtos...",value:n,onChange:f=>r(f.target.value),className:"pl-9","data-testid":"input-search-products"},void 0,!1,{fileName:"/home/runner/workspace/client/src/components/ProductSelector.tsx",lineNumber:133,columnNumber:11},this),n&&o.jsxDEV(O,{variant:"ghost",size:"icon",className:"absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7",onClick:()=>r(""),children:o.jsxDEV(bt,{className:"h-4 w-4"},void 0,!1,{fileName:"/home/runner/workspace/client/src/components/ProductSelector.tsx",lineNumber:147,columnNumber:15},this)},void 0,!1,{fileName:"/home/runner/workspace/client/src/components/ProductSelector.tsx",lineNumber:141,columnNumber:13},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/components/ProductSelector.tsx",lineNumber:131,columnNumber:9},this),t&&o.jsxDEV(O,{variant:"ghost",size:"icon",onClick:t,"data-testid":"button-close-selector",children:o.jsxDEV(bt,{className:"h-5 w-5"},void 0,!1,{fileName:"/home/runner/workspace/client/src/components/ProductSelector.tsx",lineNumber:153,columnNumber:13},this)},void 0,!1,{fileName:"/home/runner/workspace/client/src/components/ProductSelector.tsx",lineNumber:152,columnNumber:11},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/components/ProductSelector.tsx",lineNumber:130,columnNumber:7},this),o.jsxDEV(Zn,{value:s,onValueChange:i,className:"w-full",children:[o.jsxDEV(er,{className:"w-full justify-start overflow-x-auto flex-nowrap h-auto p-1",children:[o.jsxDEV(ut,{value:"all","data-testid":"category-all",className:"gap-2 flex-shrink-0",children:["Todos",o.jsxDEV(xe,{variant:"secondary",className:"h-5 min-w-5 px-1.5",children:g("all")},void 0,!1,{fileName:"/home/runner/workspace/client/src/components/ProductSelector.tsx",lineNumber:162,columnNumber:13},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/components/ProductSelector.tsx",lineNumber:160,columnNumber:11},this),o.jsxDEV(ut,{value:"favorites","data-testid":"category-favorites",className:"gap-2 flex-shrink-0",children:[o.jsxDEV(Nt,{className:"h-3 w-3"},void 0,!1,{fileName:"/home/runner/workspace/client/src/components/ProductSelector.tsx",lineNumber:167,columnNumber:13},this),"Favoritos",o.jsxDEV(xe,{variant:"secondary",className:"h-5 min-w-5 px-1.5",children:g("favorites")},void 0,!1,{fileName:"/home/runner/workspace/client/src/components/ProductSelector.tsx",lineNumber:169,columnNumber:13},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/components/ProductSelector.tsx",lineNumber:166,columnNumber:11},this),k.filter(f=>f.isVisible===1).sort((f,b)=>(f.displayOrder||0)-(b.displayOrder||0)).map(f=>o.jsxDEV(ut,{value:f.id,"data-testid":`category-${f.id}`,className:"gap-2 flex-shrink-0",children:[f.name,o.jsxDEV(xe,{variant:"secondary",className:"h-5 min-w-5 px-1.5",children:g(f.id)},void 0,!1,{fileName:"/home/runner/workspace/client/src/components/ProductSelector.tsx",lineNumber:184,columnNumber:17},this)]},f.id,!0,{fileName:"/home/runner/workspace/client/src/components/ProductSelector.tsx",lineNumber:177,columnNumber:15},this))]},void 0,!0,{fileName:"/home/runner/workspace/client/src/components/ProductSelector.tsx",lineNumber:159,columnNumber:9},this),o.jsxDEV(tr,{value:s,className:"mt-4",children:D.length===0?o.jsxDEV("div",{className:"flex flex-col items-center justify-center py-16 text-muted-foreground",children:[o.jsxDEV(Gt,{className:"h-16 w-16 mb-4 opacity-40"},void 0,!1,{fileName:"/home/runner/workspace/client/src/components/ProductSelector.tsx",lineNumber:194,columnNumber:15},this),o.jsxDEV("p",{className:"text-lg",children:"Nenhum produto encontrado"},void 0,!1,{fileName:"/home/runner/workspace/client/src/components/ProductSelector.tsx",lineNumber:195,columnNumber:15},this),n&&o.jsxDEV("p",{className:"text-sm mt-1",children:"Tente ajustar sua busca"},void 0,!1,{fileName:"/home/runner/workspace/client/src/components/ProductSelector.tsx",lineNumber:197,columnNumber:17},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/components/ProductSelector.tsx",lineNumber:193,columnNumber:13},this):o.jsxDEV("div",{className:"grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3",children:D.map(f=>o.jsxDEV(Wn,{className:"group hover-elevate cursor-pointer relative overflow-hidden","data-testid":`product-card-${f.id}`,children:[o.jsxDEV("div",{onClick:()=>d(f),children:f.imageUrl?o.jsxDEV("div",{className:"aspect-square w-full overflow-hidden bg-muted",children:o.jsxDEV("img",{src:f.imageUrl,alt:f.name,className:"w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"},void 0,!1,{fileName:"/home/runner/workspace/client/src/components/ProductSelector.tsx",lineNumber:211,columnNumber:25},this)},void 0,!1,{fileName:"/home/runner/workspace/client/src/components/ProductSelector.tsx",lineNumber:210,columnNumber:23},this):o.jsxDEV("div",{className:"aspect-square w-full bg-muted flex items-center justify-center",children:o.jsxDEV("span",{className:"text-4xl text-muted-foreground/40",children:f.name.charAt(0)},void 0,!1,{fileName:"/home/runner/workspace/client/src/components/ProductSelector.tsx",lineNumber:219,columnNumber:25},this)},void 0,!1,{fileName:"/home/runner/workspace/client/src/components/ProductSelector.tsx",lineNumber:218,columnNumber:23},this)},void 0,!1,{fileName:"/home/runner/workspace/client/src/components/ProductSelector.tsx",lineNumber:208,columnNumber:19},this),o.jsxDEV(Qn,{className:"p-3 space-y-2",children:[o.jsxDEV("div",{className:"min-h-[40px]",children:o.jsxDEV("h3",{className:"font-semibold text-sm line-clamp-2 leading-tight cursor-pointer",onClick:()=>d(f),children:f.name},void 0,!1,{fileName:"/home/runner/workspace/client/src/components/ProductSelector.tsx",lineNumber:228,columnNumber:23},this)},void 0,!1,{fileName:"/home/runner/workspace/client/src/components/ProductSelector.tsx",lineNumber:227,columnNumber:21},this),o.jsxDEV("div",{className:"flex items-center justify-between gap-2",children:[o.jsxDEV("span",{className:"text-lg font-bold text-primary",children:j(f.price)},void 0,!1,{fileName:"/home/runner/workspace/client/src/components/ProductSelector.tsx",lineNumber:237,columnNumber:23},this),o.jsxDEV("div",{className:"flex items-center gap-1",children:[o.jsxDEV(O,{variant:"ghost",size:"icon",className:"h-7 w-7",onClick:b=>{b.stopPropagation(),w(f.id)},"data-testid":`button-favorite-${f.id}`,children:o.jsxDEV(Nt,{className:`h-3.5 w-3.5 ${h.has(f.id)?"fill-yellow-400 text-yellow-400":"text-muted-foreground"}`},void 0,!1,{fileName:"/home/runner/workspace/client/src/components/ProductSelector.tsx",lineNumber:251,columnNumber:27},this)},void 0,!1,{fileName:"/home/runner/workspace/client/src/components/ProductSelector.tsx",lineNumber:241,columnNumber:25},this),o.jsxDEV(O,{variant:"ghost",size:"icon",className:"h-7 w-7",onClick:b=>{b.stopPropagation(),d(f)},"data-testid":`button-preview-${f.id}`,children:o.jsxDEV(or,{className:"h-3.5 w-3.5"},void 0,!1,{fileName:"/home/runner/workspace/client/src/components/ProductSelector.tsx",lineNumber:269,columnNumber:27},this)},void 0,!1,{fileName:"/home/runner/workspace/client/src/components/ProductSelector.tsx",lineNumber:259,columnNumber:25},this),o.jsxDEV(O,{variant:"default",size:"icon",className:"h-7 w-7",onClick:b=>{b.stopPropagation(),v(f)},"data-testid":`button-add-${f.id}`,children:o.jsxDEV(Ye,{className:"h-3.5 w-3.5"},void 0,!1,{fileName:"/home/runner/workspace/client/src/components/ProductSelector.tsx",lineNumber:281,columnNumber:27},this)},void 0,!1,{fileName:"/home/runner/workspace/client/src/components/ProductSelector.tsx",lineNumber:271,columnNumber:25},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/components/ProductSelector.tsx",lineNumber:240,columnNumber:23},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/components/ProductSelector.tsx",lineNumber:236,columnNumber:21},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/components/ProductSelector.tsx",lineNumber:226,columnNumber:19},this)]},f.id,!0,{fileName:"/home/runner/workspace/client/src/components/ProductSelector.tsx",lineNumber:203,columnNumber:17},this))},void 0,!1,{fileName:"/home/runner/workspace/client/src/components/ProductSelector.tsx",lineNumber:201,columnNumber:13},this)},void 0,!1,{fileName:"/home/runner/workspace/client/src/components/ProductSelector.tsx",lineNumber:191,columnNumber:9},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/components/ProductSelector.tsx",lineNumber:158,columnNumber:7},this),o.jsxDEV(dr,{product:a,isOpen:u,onClose:()=>{m(!1),l(null)},onAddToOrder:e,isFavorite:a?h.has(a.id):!1,onToggleFavorite:w},void 0,!1,{fileName:"/home/runner/workspace/client/src/components/ProductSelector.tsx",lineNumber:293,columnNumber:7},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/components/ProductSelector.tsx",lineNumber:129,columnNumber:5},this)}function ao({onSubmit:e,totalAmount:t,paidAmount:n,isPending:r,allowSplit:s=!0}){const i=t-n,[a,l]=c.useState(i.toString()),[u,m]=c.useState("dinheiro"),[h,p]=c.useState(""),[x,N]=c.useState(!1),[k,w]=c.useState("2"),y=x&&Number(k)>1?i/Number(k):0,D=[{value:"dinheiro",label:"Dinheiro"},{value:"multicaixa",label:"Multicaixa"},{value:"transferencia",label:"Transferência"},{value:"cartao",label:"Cartão"}];return o.jsxDEV("div",{className:"space-y-4",children:[o.jsxDEV("div",{className:"p-4 rounded-md bg-muted",children:[o.jsxDEV("div",{className:"flex justify-between text-sm mb-2",children:[o.jsxDEV("span",{children:"Total:"},void 0,!1,{fileName:"/home/runner/workspace/client/src/components/PaymentForm.tsx",lineNumber:39,columnNumber:11},this),o.jsxDEV("span",{className:"font-semibold",children:j(t)},void 0,!1,{fileName:"/home/runner/workspace/client/src/components/PaymentForm.tsx",lineNumber:40,columnNumber:11},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/components/PaymentForm.tsx",lineNumber:38,columnNumber:9},this),o.jsxDEV("div",{className:"flex justify-between text-sm mb-2",children:[o.jsxDEV("span",{children:"Pago:"},void 0,!1,{fileName:"/home/runner/workspace/client/src/components/PaymentForm.tsx",lineNumber:43,columnNumber:11},this),o.jsxDEV("span",{className:"font-semibold",children:j(n)},void 0,!1,{fileName:"/home/runner/workspace/client/src/components/PaymentForm.tsx",lineNumber:44,columnNumber:11},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/components/PaymentForm.tsx",lineNumber:42,columnNumber:9},this),o.jsxDEV("div",{className:"flex justify-between",children:[o.jsxDEV("span",{children:"Restante:"},void 0,!1,{fileName:"/home/runner/workspace/client/src/components/PaymentForm.tsx",lineNumber:47,columnNumber:11},this),o.jsxDEV("span",{className:"font-bold text-lg",children:j(i)},void 0,!1,{fileName:"/home/runner/workspace/client/src/components/PaymentForm.tsx",lineNumber:48,columnNumber:11},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/components/PaymentForm.tsx",lineNumber:46,columnNumber:9},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/components/PaymentForm.tsx",lineNumber:37,columnNumber:7},this),s&&o.jsxDEV("div",{className:"space-y-2",children:[o.jsxDEV("div",{className:"flex items-center gap-2",children:[o.jsxDEV("input",{type:"checkbox",id:"enable-split",checked:x,onChange:g=>{N(g.target.checked),g.target.checked?l(y.toFixed(2)):l(i.toString())},"data-testid":"checkbox-enable-split"},void 0,!1,{fileName:"/home/runner/workspace/client/src/components/PaymentForm.tsx",lineNumber:55,columnNumber:13},this),o.jsxDEV(J,{htmlFor:"enable-split",className:"cursor-pointer",children:"Dividir conta igualmente entre pessoas"},void 0,!1,{fileName:"/home/runner/workspace/client/src/components/PaymentForm.tsx",lineNumber:69,columnNumber:13},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/components/PaymentForm.tsx",lineNumber:54,columnNumber:11},this),x&&o.jsxDEV("div",{className:"grid grid-cols-2 gap-4",children:[o.jsxDEV("div",{children:[o.jsxDEV(J,{children:"Número de Pessoas"},void 0,!1,{fileName:"/home/runner/workspace/client/src/components/PaymentForm.tsx",lineNumber:77,columnNumber:17},this),o.jsxDEV(Xe,{type:"number",min:2,value:k,onChange:g=>{const v=g.target.value;w(v);const d=Number(v)||2;l((i/d).toFixed(2))},"data-testid":"input-split-people"},void 0,!1,{fileName:"/home/runner/workspace/client/src/components/PaymentForm.tsx",lineNumber:78,columnNumber:17},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/components/PaymentForm.tsx",lineNumber:76,columnNumber:15},this),o.jsxDEV("div",{className:"flex items-end",children:o.jsxDEV("div",{className:"w-full p-2 rounded-md border bg-muted flex justify-between",children:[o.jsxDEV("span",{children:"Valor por pessoa"},void 0,!1,{fileName:"/home/runner/workspace/client/src/components/PaymentForm.tsx",lineNumber:93,columnNumber:19},this),o.jsxDEV("span",{className:"font-semibold",children:j(y)},void 0,!1,{fileName:"/home/runner/workspace/client/src/components/PaymentForm.tsx",lineNumber:94,columnNumber:19},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/components/PaymentForm.tsx",lineNumber:92,columnNumber:17},this)},void 0,!1,{fileName:"/home/runner/workspace/client/src/components/PaymentForm.tsx",lineNumber:91,columnNumber:15},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/components/PaymentForm.tsx",lineNumber:75,columnNumber:13},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/components/PaymentForm.tsx",lineNumber:53,columnNumber:9},this),o.jsxDEV("div",{className:"space-y-2",children:[o.jsxDEV(J,{children:"Método de Pagamento"},void 0,!1,{fileName:"/home/runner/workspace/client/src/components/PaymentForm.tsx",lineNumber:103,columnNumber:9},this),o.jsxDEV(ir,{value:u,onValueChange:m,children:[o.jsxDEV(ar,{"data-testid":"select-payment-method",children:o.jsxDEV(lr,{},void 0,!1,{fileName:"/home/runner/workspace/client/src/components/PaymentForm.tsx",lineNumber:106,columnNumber:13},this)},void 0,!1,{fileName:"/home/runner/workspace/client/src/components/PaymentForm.tsx",lineNumber:105,columnNumber:11},this),o.jsxDEV(cr,{children:D.map(g=>o.jsxDEV(ur,{value:g.value,children:g.label},g.value,!1,{fileName:"/home/runner/workspace/client/src/components/PaymentForm.tsx",lineNumber:110,columnNumber:15},this))},void 0,!1,{fileName:"/home/runner/workspace/client/src/components/PaymentForm.tsx",lineNumber:108,columnNumber:11},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/components/PaymentForm.tsx",lineNumber:104,columnNumber:9},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/components/PaymentForm.tsx",lineNumber:102,columnNumber:7},this),o.jsxDEV("div",{className:"space-y-2",children:[o.jsxDEV(J,{children:["Valor a Pagar ",s&&x&&"(Desta Pessoa)"]},void 0,!0,{fileName:"/home/runner/workspace/client/src/components/PaymentForm.tsx",lineNumber:119,columnNumber:9},this),o.jsxDEV(Xe,{type:"number",value:a,onChange:g=>l(g.target.value),placeholder:"0.00","data-testid":"input-payment-amount"},void 0,!1,{fileName:"/home/runner/workspace/client/src/components/PaymentForm.tsx",lineNumber:120,columnNumber:9},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/components/PaymentForm.tsx",lineNumber:118,columnNumber:7},this),u==="dinheiro"&&o.jsxDEV("div",{className:"space-y-2",children:[o.jsxDEV(J,{children:"Valor Recebido (opcional)"},void 0,!1,{fileName:"/home/runner/workspace/client/src/components/PaymentForm.tsx",lineNumber:131,columnNumber:11},this),o.jsxDEV(Xe,{type:"number",value:h,onChange:g=>p(g.target.value),placeholder:"0.00","data-testid":"input-received-amount"},void 0,!1,{fileName:"/home/runner/workspace/client/src/components/PaymentForm.tsx",lineNumber:132,columnNumber:11},this),h&&Number(h)>Number(a)&&o.jsxDEV("p",{className:"text-sm text-muted-foreground",children:["Troco: ",j(Number(h)-Number(a))]},void 0,!0,{fileName:"/home/runner/workspace/client/src/components/PaymentForm.tsx",lineNumber:140,columnNumber:13},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/components/PaymentForm.tsx",lineNumber:130,columnNumber:9},this),o.jsxDEV(O,{onClick:()=>e({amount:a,paymentMethod:u,receivedAmount:h||void 0}),className:"w-full",disabled:r||Number(a)<=0,"data-testid":"button-confirm-payment",children:r?"Processando...":"Confirmar Pagamento"},void 0,!1,{fileName:"/home/runner/workspace/client/src/components/PaymentForm.tsx",lineNumber:147,columnNumber:7},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/components/PaymentForm.tsx",lineNumber:36,columnNumber:5},this)}function lo(){for(var e=arguments.length,t=new Array(e),n=0;n<e;n++)t[n]=arguments[n];return c.useMemo(()=>r=>{t.forEach(s=>s(r))},t)}const Ze=typeof window<"u"&&typeof window.document<"u"&&typeof window.document.createElement<"u";function we(e){const t=Object.prototype.toString.call(e);return t==="[object Window]"||t==="[object global]"}function yt(e){return"nodeType"in e}function z(e){var t,n;return e?we(e)?e:yt(e)&&(t=(n=e.ownerDocument)==null?void 0:n.defaultView)!=null?t:window:window}function Pt(e){const{Document:t}=z(e);return e instanceof t}function $e(e){return we(e)?!1:e instanceof z(e).HTMLElement}function dn(e){return e instanceof z(e).SVGElement}function ye(e){return e?we(e)?e.document:yt(e)?Pt(e)?e:$e(e)||dn(e)?e.ownerDocument:document:document:document}const ee=Ze?c.useLayoutEffect:c.useEffect;function et(e){const t=c.useRef(e);return ee(()=>{t.current=e}),c.useCallback(function(){for(var n=arguments.length,r=new Array(n),s=0;s<n;s++)r[s]=arguments[s];return t.current==null?void 0:t.current(...r)},[])}function mr(){const e=c.useRef(null),t=c.useCallback((r,s)=>{e.current=setInterval(r,s)},[]),n=c.useCallback(()=>{e.current!==null&&(clearInterval(e.current),e.current=null)},[]);return[t,n]}function Ae(e,t){t===void 0&&(t=[e]);const n=c.useRef(e);return ee(()=>{n.current!==e&&(n.current=e)},t),n}function Fe(e,t){const n=c.useRef();return c.useMemo(()=>{const r=e(n.current);return n.current=r,r},[...t])}function Ke(e){const t=et(e),n=c.useRef(null),r=c.useCallback(s=>{s!==n.current&&(t==null||t(s,n.current)),n.current=s},[]);return[n,r]}function Ge(e){const t=c.useRef();return c.useEffect(()=>{t.current=e},[e]),t.current}let ft={};function tt(e,t){return c.useMemo(()=>{if(t)return t;const n=ft[e]==null?0:ft[e]+1;return ft[e]=n,e+"-"+n},[e,t])}function mn(e){return function(t){for(var n=arguments.length,r=new Array(n>1?n-1:0),s=1;s<n;s++)r[s-1]=arguments[s];return r.reduce((i,a)=>{const l=Object.entries(a);for(const[u,m]of l){const h=i[u];h!=null&&(i[u]=h+e*m)}return i},{...t})}}const ge=mn(1),We=mn(-1);function fr(e){return"clientX"in e&&"clientY"in e}function Dt(e){if(!e)return!1;const{KeyboardEvent:t}=z(e.target);return t&&e instanceof t}function pr(e){if(!e)return!1;const{TouchEvent:t}=z(e.target);return t&&e instanceof t}function Qe(e){if(pr(e)){if(e.touches&&e.touches.length){const{clientX:t,clientY:n}=e.touches[0];return{x:t,y:n}}else if(e.changedTouches&&e.changedTouches.length){const{clientX:t,clientY:n}=e.changedTouches[0];return{x:t,y:n}}}return fr(e)?{x:e.clientX,y:e.clientY}:null}const Me=Object.freeze({Translate:{toString(e){if(!e)return;const{x:t,y:n}=e;return"translate3d("+(t?Math.round(t):0)+"px, "+(n?Math.round(n):0)+"px, 0)"}},Scale:{toString(e){if(!e)return;const{scaleX:t,scaleY:n}=e;return"scaleX("+t+") scaleY("+n+")"}},Transform:{toString(e){if(e)return[Me.Translate.toString(e),Me.Scale.toString(e)].join(" ")}},Transition:{toString(e){let{property:t,duration:n,easing:r}=e;return t+" "+n+"ms "+r}}}),Wt="a,frame,iframe,input:not([type=hidden]):not(:disabled),select:not(:disabled),textarea:not(:disabled),button:not(:disabled),*[tabindex]";function hr(e){return e.matches(Wt)?e:e.querySelector(Wt)}const vr={display:"none"};function br(e){let{id:t,value:n}=e;return A.createElement("div",{id:t,style:vr},n)}function Nr(e){let{id:t,announcement:n,ariaLiveType:r="assertive"}=e;const s={position:"fixed",top:0,left:0,width:1,height:1,margin:-1,border:0,padding:0,overflow:"hidden",clip:"rect(0 0 0 0)",clipPath:"inset(100%)",whiteSpace:"nowrap"};return A.createElement("div",{id:t,style:s,role:"status","aria-live":r,"aria-atomic":!0},n)}function xr(){const[e,t]=c.useState("");return{announce:c.useCallback(r=>{r!=null&&t(r)},[]),announcement:e}}const fn=c.createContext(null);function gr(e){const t=c.useContext(fn);c.useEffect(()=>{if(!t)throw new Error("useDndMonitor must be used within a children of <DndContext>");return t(e)},[e,t])}function wr(){const[e]=c.useState(()=>new Set),t=c.useCallback(r=>(e.add(r),()=>e.delete(r)),[e]);return[c.useCallback(r=>{let{type:s,event:i}=r;e.forEach(a=>{var l;return(l=a[s])==null?void 0:l.call(a,i)})},[e]),t]}const yr={draggable:`
    To pick up a draggable item, press the space bar.
    While dragging, use the arrow keys to move the item.
    Press space again to drop the item in its new position, or press escape to cancel.
  `},Pr={onDragStart(e){let{active:t}=e;return"Picked up draggable item "+t.id+"."},onDragOver(e){let{active:t,over:n}=e;return n?"Draggable item "+t.id+" was moved over droppable area "+n.id+".":"Draggable item "+t.id+" is no longer over a droppable area."},onDragEnd(e){let{active:t,over:n}=e;return n?"Draggable item "+t.id+" was dropped over droppable area "+n.id:"Draggable item "+t.id+" was dropped."},onDragCancel(e){let{active:t}=e;return"Dragging was cancelled. Draggable item "+t.id+" was dropped."}};function Dr(e){let{announcements:t=Pr,container:n,hiddenTextDescribedById:r,screenReaderInstructions:s=yr}=e;const{announce:i,announcement:a}=xr(),l=tt("DndLiveRegion"),[u,m]=c.useState(!1);if(c.useEffect(()=>{m(!0)},[]),gr(c.useMemo(()=>({onDragStart(p){let{active:x}=p;i(t.onDragStart({active:x}))},onDragMove(p){let{active:x,over:N}=p;t.onDragMove&&i(t.onDragMove({active:x,over:N}))},onDragOver(p){let{active:x,over:N}=p;i(t.onDragOver({active:x,over:N}))},onDragEnd(p){let{active:x,over:N}=p;i(t.onDragEnd({active:x,over:N}))},onDragCancel(p){let{active:x,over:N}=p;i(t.onDragCancel({active:x,over:N}))}}),[i,t])),!u)return null;const h=A.createElement(A.Fragment,null,A.createElement(br,{id:r,value:s.draggable}),A.createElement(Nr,{id:l,announcement:a}));return n?Se.createPortal(h,n):h}var M;(function(e){e.DragStart="dragStart",e.DragMove="dragMove",e.DragEnd="dragEnd",e.DragCancel="dragCancel",e.DragOver="dragOver",e.RegisterDroppable="registerDroppable",e.SetDroppableDisabled="setDroppableDisabled",e.UnregisterDroppable="unregisterDroppable"})(M||(M={}));function Je(){}function co(e,t){return c.useMemo(()=>({sensor:e,options:t??{}}),[e,t])}function uo(){for(var e=arguments.length,t=new Array(e),n=0;n<e;n++)t[n]=arguments[n];return c.useMemo(()=>[...t].filter(r=>r!=null),[...t])}const G=Object.freeze({x:0,y:0});function pn(e,t){return Math.sqrt(Math.pow(e.x-t.x,2)+Math.pow(e.y-t.y,2))}function Er(e,t){const n=Qe(e);if(!n)return"0 0";const r={x:(n.x-t.left)/t.width*100,y:(n.y-t.top)/t.height*100};return r.x+"% "+r.y+"%"}function hn(e,t){let{data:{value:n}}=e,{data:{value:r}}=t;return n-r}function kr(e,t){let{data:{value:n}}=e,{data:{value:r}}=t;return r-n}function Qt(e){let{left:t,top:n,height:r,width:s}=e;return[{x:t,y:n},{x:t+s,y:n},{x:t,y:n+r},{x:t+s,y:n+r}]}function Sr(e,t){if(!e||e.length===0)return null;const[n]=e;return n[t]}function Jt(e,t,n){return t===void 0&&(t=e.left),n===void 0&&(n=e.top),{x:t+e.width*.5,y:n+e.height*.5}}const mo=e=>{let{collisionRect:t,droppableRects:n,droppableContainers:r}=e;const s=Jt(t,t.left,t.top),i=[];for(const a of r){const{id:l}=a,u=n.get(l);if(u){const m=pn(Jt(u),s);i.push({id:l,data:{droppableContainer:a,value:m}})}}return i.sort(hn)},fo=e=>{let{collisionRect:t,droppableRects:n,droppableContainers:r}=e;const s=Qt(t),i=[];for(const a of r){const{id:l}=a,u=n.get(l);if(u){const m=Qt(u),h=s.reduce((x,N,k)=>x+pn(m[k],N),0),p=Number((h/4).toFixed(4));i.push({id:l,data:{droppableContainer:a,value:p}})}}return i.sort(hn)};function jr(e,t){const n=Math.max(t.top,e.top),r=Math.max(t.left,e.left),s=Math.min(t.left+t.width,e.left+e.width),i=Math.min(t.top+t.height,e.top+e.height),a=s-r,l=i-n;if(r<s&&n<i){const u=t.width*t.height,m=e.width*e.height,h=a*l,p=h/(u+m-h);return Number(p.toFixed(4))}return 0}const Cr=e=>{let{collisionRect:t,droppableRects:n,droppableContainers:r}=e;const s=[];for(const i of r){const{id:a}=i,l=n.get(a);if(l){const u=jr(l,t);u>0&&s.push({id:a,data:{droppableContainer:i,value:u}})}}return s.sort(kr)};function Vr(e,t,n){return{...e,scaleX:t&&n?t.width/n.width:1,scaleY:t&&n?t.height/n.height:1}}function vn(e,t){return e&&t?{x:e.left-t.left,y:e.top-t.top}:G}function Rr(e){return function(n){for(var r=arguments.length,s=new Array(r>1?r-1:0),i=1;i<r;i++)s[i-1]=arguments[i];return s.reduce((a,l)=>({...a,top:a.top+e*l.y,bottom:a.bottom+e*l.y,left:a.left+e*l.x,right:a.right+e*l.x}),{...n})}}const Ar=Rr(1);function bn(e){if(e.startsWith("matrix3d(")){const t=e.slice(9,-1).split(/, /);return{x:+t[12],y:+t[13],scaleX:+t[0],scaleY:+t[5]}}else if(e.startsWith("matrix(")){const t=e.slice(7,-1).split(/, /);return{x:+t[4],y:+t[5],scaleX:+t[0],scaleY:+t[3]}}return null}function Mr(e,t,n){const r=bn(t);if(!r)return e;const{scaleX:s,scaleY:i,x:a,y:l}=r,u=e.left-a-(1-s)*parseFloat(n),m=e.top-l-(1-i)*parseFloat(n.slice(n.indexOf(" ")+1)),h=s?e.width/s:e.width,p=i?e.height/i:e.height;return{width:h,height:p,top:m,right:u+h,bottom:m+p,left:u}}const Or={ignoreTransform:!1};function ze(e,t){t===void 0&&(t=Or);let n=e.getBoundingClientRect();if(t.ignoreTransform){const{transform:m,transformOrigin:h}=z(e).getComputedStyle(e);m&&(n=Mr(n,m,h))}const{top:r,left:s,width:i,height:a,bottom:l,right:u}=n;return{top:r,left:s,width:i,height:a,bottom:l,right:u}}function _t(e){return ze(e,{ignoreTransform:!0})}function Tr(e){const t=e.innerWidth,n=e.innerHeight;return{top:0,left:0,right:t,bottom:n,width:t,height:n}}function $r(e,t){return t===void 0&&(t=z(e).getComputedStyle(e)),t.position==="fixed"}function Fr(e,t){t===void 0&&(t=z(e).getComputedStyle(e));const n=/(auto|scroll|overlay)/;return["overflow","overflowX","overflowY"].some(s=>{const i=t[s];return typeof i=="string"?n.test(i):!1})}function Et(e,t){const n=[];function r(s){if(t!=null&&n.length>=t||!s)return n;if(Pt(s)&&s.scrollingElement!=null&&!n.includes(s.scrollingElement))return n.push(s.scrollingElement),n;if(!$e(s)||dn(s)||n.includes(s))return n;const i=z(e).getComputedStyle(s);return s!==e&&Fr(s,i)&&n.push(s),$r(s,i)?n:r(s.parentNode)}return e?r(e):n}function Nn(e){const[t]=Et(e,1);return t??null}function pt(e){return!Ze||!e?null:we(e)?e:yt(e)?Pt(e)||e===ye(e).scrollingElement?window:$e(e)?e:null:null}function xn(e){return we(e)?e.scrollX:e.scrollLeft}function gn(e){return we(e)?e.scrollY:e.scrollTop}function xt(e){return{x:xn(e),y:gn(e)}}var T;(function(e){e[e.Forward=1]="Forward",e[e.Backward=-1]="Backward"})(T||(T={}));function wn(e){return!Ze||!e?!1:e===document.scrollingElement}function yn(e){const t={x:0,y:0},n=wn(e)?{height:window.innerHeight,width:window.innerWidth}:{height:e.clientHeight,width:e.clientWidth},r={x:e.scrollWidth-n.width,y:e.scrollHeight-n.height},s=e.scrollTop<=t.y,i=e.scrollLeft<=t.x,a=e.scrollTop>=r.y,l=e.scrollLeft>=r.x;return{isTop:s,isLeft:i,isBottom:a,isRight:l,maxScroll:r,minScroll:t}}const zr={x:.2,y:.2};function Ir(e,t,n,r,s){let{top:i,left:a,right:l,bottom:u}=n;r===void 0&&(r=10),s===void 0&&(s=zr);const{isTop:m,isBottom:h,isLeft:p,isRight:x}=yn(e),N={x:0,y:0},k={x:0,y:0},w={height:t.height*s.y,width:t.width*s.x};return!m&&i<=t.top+w.height?(N.y=T.Backward,k.y=r*Math.abs((t.top+w.height-i)/w.height)):!h&&u>=t.bottom-w.height&&(N.y=T.Forward,k.y=r*Math.abs((t.bottom-w.height-u)/w.height)),!x&&l>=t.right-w.width?(N.x=T.Forward,k.x=r*Math.abs((t.right-w.width-l)/w.width)):!p&&a<=t.left+w.width&&(N.x=T.Backward,k.x=r*Math.abs((t.left+w.width-a)/w.width)),{direction:N,speed:k}}function Lr(e){if(e===document.scrollingElement){const{innerWidth:i,innerHeight:a}=window;return{top:0,left:0,right:i,bottom:a,width:i,height:a}}const{top:t,left:n,right:r,bottom:s}=e.getBoundingClientRect();return{top:t,left:n,right:r,bottom:s,width:e.clientWidth,height:e.clientHeight}}function Pn(e){return e.reduce((t,n)=>ge(t,xt(n)),G)}function Br(e){return e.reduce((t,n)=>t+xn(n),0)}function qr(e){return e.reduce((t,n)=>t+gn(n),0)}function Dn(e,t){if(t===void 0&&(t=ze),!e)return;const{top:n,left:r,bottom:s,right:i}=t(e);Nn(e)&&(s<=0||i<=0||n>=window.innerHeight||r>=window.innerWidth)&&e.scrollIntoView({block:"center",inline:"center"})}const Ur=[["x",["left","right"],Br],["y",["top","bottom"],qr]];class kt{constructor(t,n){this.rect=void 0,this.width=void 0,this.height=void 0,this.top=void 0,this.bottom=void 0,this.right=void 0,this.left=void 0;const r=Et(n),s=Pn(r);this.rect={...t},this.width=t.width,this.height=t.height;for(const[i,a,l]of Ur)for(const u of a)Object.defineProperty(this,u,{get:()=>{const m=l(r),h=s[i]-m;return this.rect[u]+h},enumerable:!0});Object.defineProperty(this,"rect",{enumerable:!1})}}class Ce{constructor(t){this.target=void 0,this.listeners=[],this.removeAll=()=>{this.listeners.forEach(n=>{var r;return(r=this.target)==null?void 0:r.removeEventListener(...n)})},this.target=t}add(t,n,r){var s;(s=this.target)==null||s.addEventListener(t,n,r),this.listeners.push([t,n,r])}}function Xr(e){const{EventTarget:t}=z(e);return e instanceof t?e:ye(e)}function ht(e,t){const n=Math.abs(e.x),r=Math.abs(e.y);return typeof t=="number"?Math.sqrt(n**2+r**2)>t:"x"in t&&"y"in t?n>t.x&&r>t.y:"x"in t?n>t.x:"y"in t?r>t.y:!1}var X;(function(e){e.Click="click",e.DragStart="dragstart",e.Keydown="keydown",e.ContextMenu="contextmenu",e.Resize="resize",e.SelectionChange="selectionchange",e.VisibilityChange="visibilitychange"})(X||(X={}));function Zt(e){e.preventDefault()}function Yr(e){e.stopPropagation()}var R;(function(e){e.Space="Space",e.Down="ArrowDown",e.Right="ArrowRight",e.Left="ArrowLeft",e.Up="ArrowUp",e.Esc="Escape",e.Enter="Enter",e.Tab="Tab"})(R||(R={}));const En={start:[R.Space,R.Enter],cancel:[R.Esc],end:[R.Space,R.Enter,R.Tab]},Hr=(e,t)=>{let{currentCoordinates:n}=t;switch(e.code){case R.Right:return{...n,x:n.x+25};case R.Left:return{...n,x:n.x-25};case R.Down:return{...n,y:n.y+25};case R.Up:return{...n,y:n.y-25}}};class kn{constructor(t){this.props=void 0,this.autoScrollEnabled=!1,this.referenceCoordinates=void 0,this.listeners=void 0,this.windowListeners=void 0,this.props=t;const{event:{target:n}}=t;this.props=t,this.listeners=new Ce(ye(n)),this.windowListeners=new Ce(z(n)),this.handleKeyDown=this.handleKeyDown.bind(this),this.handleCancel=this.handleCancel.bind(this),this.attach()}attach(){this.handleStart(),this.windowListeners.add(X.Resize,this.handleCancel),this.windowListeners.add(X.VisibilityChange,this.handleCancel),setTimeout(()=>this.listeners.add(X.Keydown,this.handleKeyDown))}handleStart(){const{activeNode:t,onStart:n}=this.props,r=t.node.current;r&&Dn(r),n(G)}handleKeyDown(t){if(Dt(t)){const{active:n,context:r,options:s}=this.props,{keyboardCodes:i=En,coordinateGetter:a=Hr,scrollBehavior:l="smooth"}=s,{code:u}=t;if(i.end.includes(u)){this.handleEnd(t);return}if(i.cancel.includes(u)){this.handleCancel(t);return}const{collisionRect:m}=r.current,h=m?{x:m.left,y:m.top}:G;this.referenceCoordinates||(this.referenceCoordinates=h);const p=a(t,{active:n,context:r.current,currentCoordinates:h});if(p){const x=We(p,h),N={x:0,y:0},{scrollableAncestors:k}=r.current;for(const w of k){const y=t.code,{isTop:D,isRight:g,isLeft:v,isBottom:d,maxScroll:f,minScroll:b}=yn(w),P=Lr(w),E={x:Math.min(y===R.Right?P.right-P.width/2:P.right,Math.max(y===R.Right?P.left:P.left+P.width/2,p.x)),y:Math.min(y===R.Down?P.bottom-P.height/2:P.bottom,Math.max(y===R.Down?P.top:P.top+P.height/2,p.y))},C=y===R.Right&&!g||y===R.Left&&!v,S=y===R.Down&&!d||y===R.Up&&!D;if(C&&E.x!==p.x){const V=w.scrollLeft+x.x,q=y===R.Right&&V<=f.x||y===R.Left&&V>=b.x;if(q&&!x.y){w.scrollTo({left:V,behavior:l});return}q?N.x=w.scrollLeft-V:N.x=y===R.Right?w.scrollLeft-f.x:w.scrollLeft-b.x,N.x&&w.scrollBy({left:-N.x,behavior:l});break}else if(S&&E.y!==p.y){const V=w.scrollTop+x.y,q=y===R.Down&&V<=f.y||y===R.Up&&V>=b.y;if(q&&!x.x){w.scrollTo({top:V,behavior:l});return}q?N.y=w.scrollTop-V:N.y=y===R.Down?w.scrollTop-f.y:w.scrollTop-b.y,N.y&&w.scrollBy({top:-N.y,behavior:l});break}}this.handleMove(t,ge(We(p,this.referenceCoordinates),N))}}}handleMove(t,n){const{onMove:r}=this.props;t.preventDefault(),r(n)}handleEnd(t){const{onEnd:n}=this.props;t.preventDefault(),this.detach(),n()}handleCancel(t){const{onCancel:n}=this.props;t.preventDefault(),this.detach(),n()}detach(){this.listeners.removeAll(),this.windowListeners.removeAll()}}kn.activators=[{eventName:"onKeyDown",handler:(e,t,n)=>{let{keyboardCodes:r=En,onActivation:s}=t,{active:i}=n;const{code:a}=e.nativeEvent;if(r.start.includes(a)){const l=i.activatorNode.current;return l&&e.target!==l?!1:(e.preventDefault(),s==null||s({event:e.nativeEvent}),!0)}return!1}}];function en(e){return!!(e&&"distance"in e)}function tn(e){return!!(e&&"delay"in e)}class St{constructor(t,n,r){var s;r===void 0&&(r=Xr(t.event.target)),this.props=void 0,this.events=void 0,this.autoScrollEnabled=!0,this.document=void 0,this.activated=!1,this.initialCoordinates=void 0,this.timeoutId=null,this.listeners=void 0,this.documentListeners=void 0,this.windowListeners=void 0,this.props=t,this.events=n;const{event:i}=t,{target:a}=i;this.props=t,this.events=n,this.document=ye(a),this.documentListeners=new Ce(this.document),this.listeners=new Ce(r),this.windowListeners=new Ce(z(a)),this.initialCoordinates=(s=Qe(i))!=null?s:G,this.handleStart=this.handleStart.bind(this),this.handleMove=this.handleMove.bind(this),this.handleEnd=this.handleEnd.bind(this),this.handleCancel=this.handleCancel.bind(this),this.handleKeydown=this.handleKeydown.bind(this),this.removeTextSelection=this.removeTextSelection.bind(this),this.attach()}attach(){const{events:t,props:{options:{activationConstraint:n,bypassActivationConstraint:r}}}=this;if(this.listeners.add(t.move.name,this.handleMove,{passive:!1}),this.listeners.add(t.end.name,this.handleEnd),t.cancel&&this.listeners.add(t.cancel.name,this.handleCancel),this.windowListeners.add(X.Resize,this.handleCancel),this.windowListeners.add(X.DragStart,Zt),this.windowListeners.add(X.VisibilityChange,this.handleCancel),this.windowListeners.add(X.ContextMenu,Zt),this.documentListeners.add(X.Keydown,this.handleKeydown),n){if(r!=null&&r({event:this.props.event,activeNode:this.props.activeNode,options:this.props.options}))return this.handleStart();if(tn(n)){this.timeoutId=setTimeout(this.handleStart,n.delay),this.handlePending(n);return}if(en(n)){this.handlePending(n);return}}this.handleStart()}detach(){this.listeners.removeAll(),this.windowListeners.removeAll(),setTimeout(this.documentListeners.removeAll,50),this.timeoutId!==null&&(clearTimeout(this.timeoutId),this.timeoutId=null)}handlePending(t,n){const{active:r,onPending:s}=this.props;s(r,t,this.initialCoordinates,n)}handleStart(){const{initialCoordinates:t}=this,{onStart:n}=this.props;t&&(this.activated=!0,this.documentListeners.add(X.Click,Yr,{capture:!0}),this.removeTextSelection(),this.documentListeners.add(X.SelectionChange,this.removeTextSelection),n(t))}handleMove(t){var n;const{activated:r,initialCoordinates:s,props:i}=this,{onMove:a,options:{activationConstraint:l}}=i;if(!s)return;const u=(n=Qe(t))!=null?n:G,m=We(s,u);if(!r&&l){if(en(l)){if(l.tolerance!=null&&ht(m,l.tolerance))return this.handleCancel();if(ht(m,l.distance))return this.handleStart()}if(tn(l)&&ht(m,l.tolerance))return this.handleCancel();this.handlePending(l,m);return}t.cancelable&&t.preventDefault(),a(u)}handleEnd(){const{onAbort:t,onEnd:n}=this.props;this.detach(),this.activated||t(this.props.active),n()}handleCancel(){const{onAbort:t,onCancel:n}=this.props;this.detach(),this.activated||t(this.props.active),n()}handleKeydown(t){t.code===R.Esc&&this.handleCancel()}removeTextSelection(){var t;(t=this.document.getSelection())==null||t.removeAllRanges()}}const Kr={cancel:{name:"pointercancel"},move:{name:"pointermove"},end:{name:"pointerup"}};class Sn extends St{constructor(t){const{event:n}=t,r=ye(n.target);super(t,Kr,r)}}Sn.activators=[{eventName:"onPointerDown",handler:(e,t)=>{let{nativeEvent:n}=e,{onActivation:r}=t;return!n.isPrimary||n.button!==0?!1:(r==null||r({event:n}),!0)}}];const Gr={move:{name:"mousemove"},end:{name:"mouseup"}};var gt;(function(e){e[e.RightClick=2]="RightClick"})(gt||(gt={}));class Wr extends St{constructor(t){super(t,Gr,ye(t.event.target))}}Wr.activators=[{eventName:"onMouseDown",handler:(e,t)=>{let{nativeEvent:n}=e,{onActivation:r}=t;return n.button===gt.RightClick?!1:(r==null||r({event:n}),!0)}}];const vt={cancel:{name:"touchcancel"},move:{name:"touchmove"},end:{name:"touchend"}};class Qr extends St{constructor(t){super(t,vt)}static setup(){return window.addEventListener(vt.move.name,t,{capture:!1,passive:!1}),function(){window.removeEventListener(vt.move.name,t)};function t(){}}}Qr.activators=[{eventName:"onTouchStart",handler:(e,t)=>{let{nativeEvent:n}=e,{onActivation:r}=t;const{touches:s}=n;return s.length>1?!1:(r==null||r({event:n}),!0)}}];var Ve;(function(e){e[e.Pointer=0]="Pointer",e[e.DraggableRect=1]="DraggableRect"})(Ve||(Ve={}));var _e;(function(e){e[e.TreeOrder=0]="TreeOrder",e[e.ReversedTreeOrder=1]="ReversedTreeOrder"})(_e||(_e={}));function Jr(e){let{acceleration:t,activator:n=Ve.Pointer,canScroll:r,draggingRect:s,enabled:i,interval:a=5,order:l=_e.TreeOrder,pointerCoordinates:u,scrollableAncestors:m,scrollableAncestorRects:h,delta:p,threshold:x}=e;const N=Zr({delta:p,disabled:!i}),[k,w]=mr(),y=c.useRef({x:0,y:0}),D=c.useRef({x:0,y:0}),g=c.useMemo(()=>{switch(n){case Ve.Pointer:return u?{top:u.y,bottom:u.y,left:u.x,right:u.x}:null;case Ve.DraggableRect:return s}},[n,s,u]),v=c.useRef(null),d=c.useCallback(()=>{const b=v.current;if(!b)return;const P=y.current.x*D.current.x,E=y.current.y*D.current.y;b.scrollBy(P,E)},[]),f=c.useMemo(()=>l===_e.TreeOrder?[...m].reverse():m,[l,m]);c.useEffect(()=>{if(!i||!m.length||!g){w();return}for(const b of f){if((r==null?void 0:r(b))===!1)continue;const P=m.indexOf(b),E=h[P];if(!E)continue;const{direction:C,speed:S}=Ir(b,E,g,t,x);for(const V of["x","y"])N[V][C[V]]||(S[V]=0,C[V]=0);if(S.x>0||S.y>0){w(),v.current=b,k(d,a),y.current=S,D.current=C;return}}y.current={x:0,y:0},D.current={x:0,y:0},w()},[t,d,r,w,i,a,JSON.stringify(g),JSON.stringify(N),k,m,f,h,JSON.stringify(x)])}const _r={x:{[T.Backward]:!1,[T.Forward]:!1},y:{[T.Backward]:!1,[T.Forward]:!1}};function Zr(e){let{delta:t,disabled:n}=e;const r=Ge(t);return Fe(s=>{if(n||!r||!s)return _r;const i={x:Math.sign(t.x-r.x),y:Math.sign(t.y-r.y)};return{x:{[T.Backward]:s.x[T.Backward]||i.x===-1,[T.Forward]:s.x[T.Forward]||i.x===1},y:{[T.Backward]:s.y[T.Backward]||i.y===-1,[T.Forward]:s.y[T.Forward]||i.y===1}}},[n,t,r])}function es(e,t){const n=t!=null?e.get(t):void 0,r=n?n.node.current:null;return Fe(s=>{var i;return t==null?null:(i=r??s)!=null?i:null},[r,t])}function ts(e,t){return c.useMemo(()=>e.reduce((n,r)=>{const{sensor:s}=r,i=s.activators.map(a=>({eventName:a.eventName,handler:t(a.handler,r)}));return[...n,...i]},[]),[e,t])}var Oe;(function(e){e[e.Always=0]="Always",e[e.BeforeDragging=1]="BeforeDragging",e[e.WhileDragging=2]="WhileDragging"})(Oe||(Oe={}));var wt;(function(e){e.Optimized="optimized"})(wt||(wt={}));const nn=new Map;function ns(e,t){let{dragging:n,dependencies:r,config:s}=t;const[i,a]=c.useState(null),{frequency:l,measure:u,strategy:m}=s,h=c.useRef(e),p=y(),x=Ae(p),N=c.useCallback(function(D){D===void 0&&(D=[]),!x.current&&a(g=>g===null?D:g.concat(D.filter(v=>!g.includes(v))))},[x]),k=c.useRef(null),w=Fe(D=>{if(p&&!n)return nn;if(!D||D===nn||h.current!==e||i!=null){const g=new Map;for(let v of e){if(!v)continue;if(i&&i.length>0&&!i.includes(v.id)&&v.rect.current){g.set(v.id,v.rect.current);continue}const d=v.node.current,f=d?new kt(u(d),d):null;v.rect.current=f,f&&g.set(v.id,f)}return g}return D},[e,i,n,p,u]);return c.useEffect(()=>{h.current=e},[e]),c.useEffect(()=>{p||N()},[n,p]),c.useEffect(()=>{i&&i.length>0&&a(null)},[JSON.stringify(i)]),c.useEffect(()=>{p||typeof l!="number"||k.current!==null||(k.current=setTimeout(()=>{N(),k.current=null},l))},[l,p,N,...r]),{droppableRects:w,measureDroppableContainers:N,measuringScheduled:i!=null};function y(){switch(m){case Oe.Always:return!1;case Oe.BeforeDragging:return n;default:return!n}}}function jt(e,t){return Fe(n=>e?n||(typeof t=="function"?t(e):e):null,[t,e])}function rs(e,t){return jt(e,t)}function ss(e){let{callback:t,disabled:n}=e;const r=et(t),s=c.useMemo(()=>{if(n||typeof window>"u"||typeof window.MutationObserver>"u")return;const{MutationObserver:i}=window;return new i(r)},[r,n]);return c.useEffect(()=>()=>s==null?void 0:s.disconnect(),[s]),s}function nt(e){let{callback:t,disabled:n}=e;const r=et(t),s=c.useMemo(()=>{if(n||typeof window>"u"||typeof window.ResizeObserver>"u")return;const{ResizeObserver:i}=window;return new i(r)},[n]);return c.useEffect(()=>()=>s==null?void 0:s.disconnect(),[s]),s}function os(e){return new kt(ze(e),e)}function rn(e,t,n){t===void 0&&(t=os);const[r,s]=c.useState(null);function i(){s(u=>{if(!e)return null;if(e.isConnected===!1){var m;return(m=u??n)!=null?m:null}const h=t(e);return JSON.stringify(u)===JSON.stringify(h)?u:h})}const a=ss({callback(u){if(e)for(const m of u){const{type:h,target:p}=m;if(h==="childList"&&p instanceof HTMLElement&&p.contains(e)){i();break}}}}),l=nt({callback:i});return ee(()=>{i(),e?(l==null||l.observe(e),a==null||a.observe(document.body,{childList:!0,subtree:!0})):(l==null||l.disconnect(),a==null||a.disconnect())},[e]),r}function is(e){const t=jt(e);return vn(e,t)}const sn=[];function as(e){const t=c.useRef(e),n=Fe(r=>e?r&&r!==sn&&e&&t.current&&e.parentNode===t.current.parentNode?r:Et(e):sn,[e]);return c.useEffect(()=>{t.current=e},[e]),n}function ls(e){const[t,n]=c.useState(null),r=c.useRef(e),s=c.useCallback(i=>{const a=pt(i.target);a&&n(l=>l?(l.set(a,xt(a)),new Map(l)):null)},[]);return c.useEffect(()=>{const i=r.current;if(e!==i){a(i);const l=e.map(u=>{const m=pt(u);return m?(m.addEventListener("scroll",s,{passive:!0}),[m,xt(m)]):null}).filter(u=>u!=null);n(l.length?new Map(l):null),r.current=e}return()=>{a(e),a(i)};function a(l){l.forEach(u=>{const m=pt(u);m==null||m.removeEventListener("scroll",s)})}},[s,e]),c.useMemo(()=>e.length?t?Array.from(t.values()).reduce((i,a)=>ge(i,a),G):Pn(e):G,[e,t])}function on(e,t){t===void 0&&(t=[]);const n=c.useRef(null);return c.useEffect(()=>{n.current=null},t),c.useEffect(()=>{const r=e!==G;r&&!n.current&&(n.current=e),!r&&n.current&&(n.current=null)},[e]),n.current?We(e,n.current):G}function cs(e){c.useEffect(()=>{if(!Ze)return;const t=e.map(n=>{let{sensor:r}=n;return r.setup==null?void 0:r.setup()});return()=>{for(const n of t)n==null||n()}},e.map(t=>{let{sensor:n}=t;return n}))}function us(e,t){return c.useMemo(()=>e.reduce((n,r)=>{let{eventName:s,handler:i}=r;return n[s]=a=>{i(a,t)},n},{}),[e,t])}function jn(e){return c.useMemo(()=>e?Tr(e):null,[e])}const an=[];function ds(e,t){t===void 0&&(t=ze);const[n]=e,r=jn(n?z(n):null),[s,i]=c.useState(an);function a(){i(()=>e.length?e.map(u=>wn(u)?r:new kt(t(u),u)):an)}const l=nt({callback:a});return ee(()=>{l==null||l.disconnect(),a(),e.forEach(u=>l==null?void 0:l.observe(u))},[e]),s}function Cn(e){if(!e)return null;if(e.children.length>1)return e;const t=e.children[0];return $e(t)?t:e}function ms(e){let{measure:t}=e;const[n,r]=c.useState(null),s=c.useCallback(m=>{for(const{target:h}of m)if($e(h)){r(p=>{const x=t(h);return p?{...p,width:x.width,height:x.height}:x});break}},[t]),i=nt({callback:s}),a=c.useCallback(m=>{const h=Cn(m);i==null||i.disconnect(),h&&(i==null||i.observe(h)),r(h?t(h):null)},[t,i]),[l,u]=Ke(a);return c.useMemo(()=>({nodeRef:l,rect:n,setRef:u}),[n,l,u])}const fs=[{sensor:Sn,options:{}},{sensor:kn,options:{}}],ps={current:{}},He={draggable:{measure:_t},droppable:{measure:_t,strategy:Oe.WhileDragging,frequency:wt.Optimized},dragOverlay:{measure:ze}};class Re extends Map{get(t){var n;return t!=null&&(n=super.get(t))!=null?n:void 0}toArray(){return Array.from(this.values())}getEnabled(){return this.toArray().filter(t=>{let{disabled:n}=t;return!n})}getNodeFor(t){var n,r;return(n=(r=this.get(t))==null?void 0:r.node.current)!=null?n:void 0}}const hs={activatorEvent:null,active:null,activeNode:null,activeNodeRect:null,collisions:null,containerNodeRect:null,draggableNodes:new Map,droppableRects:new Map,droppableContainers:new Re,over:null,dragOverlay:{nodeRef:{current:null},rect:null,setRef:Je},scrollableAncestors:[],scrollableAncestorRects:[],measuringConfiguration:He,measureDroppableContainers:Je,windowRect:null,measuringScheduled:!1},Vn={activatorEvent:null,activators:[],active:null,activeNodeRect:null,ariaDescribedById:{draggable:""},dispatch:Je,draggableNodes:new Map,over:null,measureDroppableContainers:Je},Ie=c.createContext(Vn),Rn=c.createContext(hs);function vs(){return{draggable:{active:null,initialCoordinates:{x:0,y:0},nodes:new Map,translate:{x:0,y:0}},droppable:{containers:new Re}}}function bs(e,t){switch(t.type){case M.DragStart:return{...e,draggable:{...e.draggable,initialCoordinates:t.initialCoordinates,active:t.active}};case M.DragMove:return e.draggable.active==null?e:{...e,draggable:{...e.draggable,translate:{x:t.coordinates.x-e.draggable.initialCoordinates.x,y:t.coordinates.y-e.draggable.initialCoordinates.y}}};case M.DragEnd:case M.DragCancel:return{...e,draggable:{...e.draggable,active:null,initialCoordinates:{x:0,y:0},translate:{x:0,y:0}}};case M.RegisterDroppable:{const{element:n}=t,{id:r}=n,s=new Re(e.droppable.containers);return s.set(r,n),{...e,droppable:{...e.droppable,containers:s}}}case M.SetDroppableDisabled:{const{id:n,key:r,disabled:s}=t,i=e.droppable.containers.get(n);if(!i||r!==i.key)return e;const a=new Re(e.droppable.containers);return a.set(n,{...i,disabled:s}),{...e,droppable:{...e.droppable,containers:a}}}case M.UnregisterDroppable:{const{id:n,key:r}=t,s=e.droppable.containers.get(n);if(!s||r!==s.key)return e;const i=new Re(e.droppable.containers);return i.delete(n),{...e,droppable:{...e.droppable,containers:i}}}default:return e}}function Ns(e){let{disabled:t}=e;const{active:n,activatorEvent:r,draggableNodes:s}=c.useContext(Ie),i=Ge(r),a=Ge(n==null?void 0:n.id);return c.useEffect(()=>{if(!t&&!r&&i&&a!=null){if(!Dt(i)||document.activeElement===i.target)return;const l=s.get(a);if(!l)return;const{activatorNode:u,node:m}=l;if(!u.current&&!m.current)return;requestAnimationFrame(()=>{for(const h of[u.current,m.current]){if(!h)continue;const p=hr(h);if(p){p.focus();break}}})}},[r,t,s,a,i]),null}function An(e,t){let{transform:n,...r}=t;return e!=null&&e.length?e.reduce((s,i)=>i({transform:s,...r}),n):n}function xs(e){return c.useMemo(()=>({draggable:{...He.draggable,...e==null?void 0:e.draggable},droppable:{...He.droppable,...e==null?void 0:e.droppable},dragOverlay:{...He.dragOverlay,...e==null?void 0:e.dragOverlay}}),[e==null?void 0:e.draggable,e==null?void 0:e.droppable,e==null?void 0:e.dragOverlay])}function gs(e){let{activeNode:t,measure:n,initialRect:r,config:s=!0}=e;const i=c.useRef(!1),{x:a,y:l}=typeof s=="boolean"?{x:s,y:s}:s;ee(()=>{if(!a&&!l||!t){i.current=!1;return}if(i.current||!r)return;const m=t==null?void 0:t.node.current;if(!m||m.isConnected===!1)return;const h=n(m),p=vn(h,r);if(a||(p.x=0),l||(p.y=0),i.current=!0,Math.abs(p.x)>0||Math.abs(p.y)>0){const x=Nn(m);x&&x.scrollBy({top:p.y,left:p.x})}},[t,a,l,r,n])}const rt=c.createContext({...G,scaleX:1,scaleY:1});var ae;(function(e){e[e.Uninitialized=0]="Uninitialized",e[e.Initializing=1]="Initializing",e[e.Initialized=2]="Initialized"})(ae||(ae={}));const po=c.memo(function(t){var n,r,s,i;let{id:a,accessibility:l,autoScroll:u=!0,children:m,sensors:h=fs,collisionDetection:p=Cr,measuring:x,modifiers:N,...k}=t;const w=c.useReducer(bs,void 0,vs),[y,D]=w,[g,v]=wr(),[d,f]=c.useState(ae.Uninitialized),b=d===ae.Initialized,{draggable:{active:P,nodes:E,translate:C},droppable:{containers:S}}=y,V=P!=null?E.get(P):null,q=c.useRef({initial:null,translated:null}),Y=c.useMemo(()=>{var F;return P!=null?{id:P,data:(F=V==null?void 0:V.data)!=null?F:ps,rect:q}:null},[P,V]),te=c.useRef(null),[Ct,Vt]=c.useState(null),[_,Rt]=c.useState(null),le=Ae(k,Object.values(k)),st=tt("DndDescribedBy",a),At=c.useMemo(()=>S.getEnabled(),[S]),ce=xs(x),{droppableRects:me,measureDroppableContainers:Le,measuringScheduled:Mt}=ns(At,{dragging:b,dependencies:[C.x,C.y],config:ce.droppable}),H=es(E,P),Ot=c.useMemo(()=>_?Qe(_):null,[_]),Tt=Ln(),$t=rs(H,ce.draggable.measure);gs({activeNode:P!=null?E.get(P):null,config:Tt.layoutShiftCompensation,initialRect:$t,measure:ce.draggable.measure});const K=rn(H,ce.draggable.measure,$t),ot=rn(H?H.parentElement:null),ue=c.useRef({activatorEvent:null,active:null,activeNode:H,collisionRect:null,collisions:null,droppableRects:me,draggableNodes:E,draggingNode:null,draggingNodeRect:null,droppableContainers:S,over:null,scrollableAncestors:[],scrollAdjustedTranslate:null}),Ft=S.getNodeFor((n=ue.current.over)==null?void 0:n.id),de=ms({measure:ce.dragOverlay.measure}),Be=(r=de.nodeRef.current)!=null?r:H,fe=b?(s=de.rect)!=null?s:K:null,zt=!!(de.nodeRef.current&&de.rect),It=is(zt?null:K),it=jn(Be?z(Be):null),ne=as(b?Ft??H:null),qe=ds(ne),Ue=An(N,{transform:{x:C.x-It.x,y:C.y-It.y,scaleX:1,scaleY:1},activatorEvent:_,active:Y,activeNodeRect:K,containerNodeRect:ot,draggingNodeRect:fe,over:ue.current.over,overlayNodeRect:de.rect,scrollableAncestors:ne,scrollableAncestorRects:qe,windowRect:it}),Lt=Ot?ge(Ot,C):null,Bt=ls(ne),Mn=on(Bt),On=on(Bt,[K]),pe=ge(Ue,Mn),he=fe?Ar(fe,Ue):null,Pe=Y&&he?p({active:Y,collisionRect:he,droppableRects:me,droppableContainers:At,pointerCoordinates:Lt}):null,qt=Sr(Pe,"id"),[re,Ut]=c.useState(null),Tn=zt?Ue:ge(Ue,On),$n=Vr(Tn,(i=re==null?void 0:re.rect)!=null?i:null,K),at=c.useRef(null),Xt=c.useCallback((F,I)=>{let{sensor:L,options:se}=I;if(te.current==null)return;const U=E.get(te.current);if(!U)return;const B=F.nativeEvent,W=new L({active:te.current,activeNode:U,event:B,options:se,context:ue,onAbort($){if(!E.get($))return;const{onDragAbort:Q}=le.current,Z={id:$};Q==null||Q(Z),g({type:"onDragAbort",event:Z})},onPending($,oe,Q,Z){if(!E.get($))return;const{onDragPending:Ee}=le.current,ie={id:$,constraint:oe,initialCoordinates:Q,offset:Z};Ee==null||Ee(ie),g({type:"onDragPending",event:ie})},onStart($){const oe=te.current;if(oe==null)return;const Q=E.get(oe);if(!Q)return;const{onDragStart:Z}=le.current,De={activatorEvent:B,active:{id:oe,data:Q.data,rect:q}};Se.unstable_batchedUpdates(()=>{Z==null||Z(De),f(ae.Initializing),D({type:M.DragStart,initialCoordinates:$,active:oe}),g({type:"onDragStart",event:De}),Vt(at.current),Rt(B)})},onMove($){D({type:M.DragMove,coordinates:$})},onEnd:ve(M.DragEnd),onCancel:ve(M.DragCancel)});at.current=W;function ve($){return async function(){const{active:Q,collisions:Z,over:De,scrollAdjustedTranslate:Ee}=ue.current;let ie=null;if(Q&&Ee){const{cancelDrop:ke}=le.current;ie={activatorEvent:B,active:Q,collisions:Z,delta:Ee,over:De},$===M.DragEnd&&typeof ke=="function"&&await Promise.resolve(ke(ie))&&($=M.DragCancel)}te.current=null,Se.unstable_batchedUpdates(()=>{D({type:$}),f(ae.Uninitialized),Ut(null),Vt(null),Rt(null),at.current=null;const ke=$===M.DragEnd?"onDragEnd":"onDragCancel";if(ie){const lt=le.current[ke];lt==null||lt(ie),g({type:ke,event:ie})}})}}},[E]),Fn=c.useCallback((F,I)=>(L,se)=>{const U=L.nativeEvent,B=E.get(se);if(te.current!==null||!B||U.dndKit||U.defaultPrevented)return;const W={active:B};F(L,I.options,W)===!0&&(U.dndKit={capturedBy:I.sensor},te.current=se,Xt(L,I))},[E,Xt]),Yt=ts(h,Fn);cs(h),ee(()=>{K&&d===ae.Initializing&&f(ae.Initialized)},[K,d]),c.useEffect(()=>{const{onDragMove:F}=le.current,{active:I,activatorEvent:L,collisions:se,over:U}=ue.current;if(!I||!L)return;const B={active:I,activatorEvent:L,collisions:se,delta:{x:pe.x,y:pe.y},over:U};Se.unstable_batchedUpdates(()=>{F==null||F(B),g({type:"onDragMove",event:B})})},[pe.x,pe.y]),c.useEffect(()=>{const{active:F,activatorEvent:I,collisions:L,droppableContainers:se,scrollAdjustedTranslate:U}=ue.current;if(!F||te.current==null||!I||!U)return;const{onDragOver:B}=le.current,W=se.get(qt),ve=W&&W.rect.current?{id:W.id,rect:W.rect.current,data:W.data,disabled:W.disabled}:null,$={active:F,activatorEvent:I,collisions:L,delta:{x:U.x,y:U.y},over:ve};Se.unstable_batchedUpdates(()=>{Ut(ve),B==null||B($),g({type:"onDragOver",event:$})})},[qt]),ee(()=>{ue.current={activatorEvent:_,active:Y,activeNode:H,collisionRect:he,collisions:Pe,droppableRects:me,draggableNodes:E,draggingNode:Be,draggingNodeRect:fe,droppableContainers:S,over:re,scrollableAncestors:ne,scrollAdjustedTranslate:pe},q.current={initial:fe,translated:he}},[Y,H,Pe,he,E,Be,fe,me,S,re,ne,pe]),Jr({...Tt,delta:C,draggingRect:he,pointerCoordinates:Lt,scrollableAncestors:ne,scrollableAncestorRects:qe});const zn=c.useMemo(()=>({active:Y,activeNode:H,activeNodeRect:K,activatorEvent:_,collisions:Pe,containerNodeRect:ot,dragOverlay:de,draggableNodes:E,droppableContainers:S,droppableRects:me,over:re,measureDroppableContainers:Le,scrollableAncestors:ne,scrollableAncestorRects:qe,measuringConfiguration:ce,measuringScheduled:Mt,windowRect:it}),[Y,H,K,_,Pe,ot,de,E,S,me,re,Le,ne,qe,ce,Mt,it]),In=c.useMemo(()=>({activatorEvent:_,activators:Yt,active:Y,activeNodeRect:K,ariaDescribedById:{draggable:st},dispatch:D,draggableNodes:E,over:re,measureDroppableContainers:Le}),[_,Yt,Y,K,D,st,E,re,Le]);return A.createElement(fn.Provider,{value:v},A.createElement(Ie.Provider,{value:In},A.createElement(Rn.Provider,{value:zn},A.createElement(rt.Provider,{value:$n},m)),A.createElement(Ns,{disabled:(l==null?void 0:l.restoreFocus)===!1})),A.createElement(Dr,{...l,hiddenTextDescribedById:st}));function Ln(){const F=(Ct==null?void 0:Ct.autoScrollEnabled)===!1,I=typeof u=="object"?u.enabled===!1:u===!1,L=b&&!F&&!I;return typeof u=="object"?{...u,enabled:L}:{enabled:L}}}),ws=c.createContext(null),ln="button",ys="Draggable";function ho(e){let{id:t,data:n,disabled:r=!1,attributes:s}=e;const i=tt(ys),{activators:a,activatorEvent:l,active:u,activeNodeRect:m,ariaDescribedById:h,draggableNodes:p,over:x}=c.useContext(Ie),{role:N=ln,roleDescription:k="draggable",tabIndex:w=0}=s??{},y=(u==null?void 0:u.id)===t,D=c.useContext(y?rt:ws),[g,v]=Ke(),[d,f]=Ke(),b=us(a,t),P=Ae(n);ee(()=>(p.set(t,{id:t,key:i,node:g,activatorNode:d,data:P}),()=>{const C=p.get(t);C&&C.key===i&&p.delete(t)}),[p,t]);const E=c.useMemo(()=>({role:N,tabIndex:w,"aria-disabled":r,"aria-pressed":y&&N===ln?!0:void 0,"aria-roledescription":k,"aria-describedby":h.draggable}),[r,N,w,y,k,h.draggable]);return{active:u,activatorEvent:l,activeNodeRect:m,attributes:E,isDragging:y,listeners:r?void 0:b,node:g,over:x,setNodeRef:v,setActivatorNodeRef:f,transform:D}}function Ps(){return c.useContext(Rn)}const Ds="Droppable",Es={timeout:25};function vo(e){let{data:t,disabled:n=!1,id:r,resizeObserverConfig:s}=e;const i=tt(Ds),{active:a,dispatch:l,over:u,measureDroppableContainers:m}=c.useContext(Ie),h=c.useRef({disabled:n}),p=c.useRef(!1),x=c.useRef(null),N=c.useRef(null),{disabled:k,updateMeasurementsFor:w,timeout:y}={...Es,...s},D=Ae(w??r),g=c.useCallback(()=>{if(!p.current){p.current=!0;return}N.current!=null&&clearTimeout(N.current),N.current=setTimeout(()=>{m(Array.isArray(D.current)?D.current:[D.current]),N.current=null},y)},[y]),v=nt({callback:g,disabled:k||!a}),d=c.useCallback((E,C)=>{v&&(C&&(v.unobserve(C),p.current=!1),E&&v.observe(E))},[v]),[f,b]=Ke(d),P=Ae(t);return c.useEffect(()=>{!v||!f.current||(v.disconnect(),p.current=!1,v.observe(f.current))},[f,v]),c.useEffect(()=>(l({type:M.RegisterDroppable,element:{id:r,key:i,disabled:n,node:f,rect:x,data:P}}),()=>l({type:M.UnregisterDroppable,key:i,id:r})),[r]),c.useEffect(()=>{n!==h.current.disabled&&(l({type:M.SetDroppableDisabled,id:r,key:i,disabled:n}),h.current.disabled=n)},[r,i,n,l]),{active:a,rect:x,isOver:(u==null?void 0:u.id)===r,node:f,over:u,setNodeRef:b}}function ks(e){let{animation:t,children:n}=e;const[r,s]=c.useState(null),[i,a]=c.useState(null),l=Ge(n);return!n&&!r&&l&&s(l),ee(()=>{if(!i)return;const u=r==null?void 0:r.key,m=r==null?void 0:r.props.id;if(u==null||m==null){s(null);return}Promise.resolve(t(m,i)).then(()=>{s(null)})},[t,r,i]),A.createElement(A.Fragment,null,n,r?c.cloneElement(r,{ref:a}):null)}const Ss={x:0,y:0,scaleX:1,scaleY:1};function js(e){let{children:t}=e;return A.createElement(Ie.Provider,{value:Vn},A.createElement(rt.Provider,{value:Ss},t))}const Cs={position:"fixed",touchAction:"none"},Vs=e=>Dt(e)?"transform 250ms ease":void 0,Rs=c.forwardRef((e,t)=>{let{as:n,activatorEvent:r,adjustScale:s,children:i,className:a,rect:l,style:u,transform:m,transition:h=Vs}=e;if(!l)return null;const p=s?m:{...m,scaleX:1,scaleY:1},x={...Cs,width:l.width,height:l.height,top:l.top,left:l.left,transform:Me.Transform.toString(p),transformOrigin:s&&r?Er(r,l):void 0,transition:typeof h=="function"?h(r):h,...u};return A.createElement(n,{className:a,style:x,ref:t},i)}),As=e=>t=>{let{active:n,dragOverlay:r}=t;const s={},{styles:i,className:a}=e;if(i!=null&&i.active)for(const[l,u]of Object.entries(i.active))u!==void 0&&(s[l]=n.node.style.getPropertyValue(l),n.node.style.setProperty(l,u));if(i!=null&&i.dragOverlay)for(const[l,u]of Object.entries(i.dragOverlay))u!==void 0&&r.node.style.setProperty(l,u);return a!=null&&a.active&&n.node.classList.add(a.active),a!=null&&a.dragOverlay&&r.node.classList.add(a.dragOverlay),function(){for(const[u,m]of Object.entries(s))n.node.style.setProperty(u,m);a!=null&&a.active&&n.node.classList.remove(a.active)}},Ms=e=>{let{transform:{initial:t,final:n}}=e;return[{transform:Me.Transform.toString(t)},{transform:Me.Transform.toString(n)}]},Os={duration:250,easing:"ease",keyframes:Ms,sideEffects:As({styles:{active:{opacity:"0"}}})};function Ts(e){let{config:t,draggableNodes:n,droppableContainers:r,measuringConfiguration:s}=e;return et((i,a)=>{if(t===null)return;const l=n.get(i);if(!l)return;const u=l.node.current;if(!u)return;const m=Cn(a);if(!m)return;const{transform:h}=z(a).getComputedStyle(a),p=bn(h);if(!p)return;const x=typeof t=="function"?t:$s(t);return Dn(u,s.draggable.measure),x({active:{id:i,data:l.data,node:u,rect:s.draggable.measure(u)},draggableNodes:n,dragOverlay:{node:a,rect:s.dragOverlay.measure(m)},droppableContainers:r,measuringConfiguration:s,transform:p})})}function $s(e){const{duration:t,easing:n,sideEffects:r,keyframes:s}={...Os,...e};return i=>{let{active:a,dragOverlay:l,transform:u,...m}=i;if(!t)return;const h={x:l.rect.left-a.rect.left,y:l.rect.top-a.rect.top},p={scaleX:u.scaleX!==1?a.rect.width*u.scaleX/l.rect.width:1,scaleY:u.scaleY!==1?a.rect.height*u.scaleY/l.rect.height:1},x={x:u.x-h.x,y:u.y-h.y,...p},N=s({...m,active:a,dragOverlay:l,transform:{initial:u,final:x}}),[k]=N,w=N[N.length-1];if(JSON.stringify(k)===JSON.stringify(w))return;const y=r==null?void 0:r({active:a,dragOverlay:l,...m}),D=l.node.animate(N,{duration:t,easing:n,fill:"forwards"});return new Promise(g=>{D.onfinish=()=>{y==null||y(),g()}})}}let cn=0;function Fs(e){return c.useMemo(()=>{if(e!=null)return cn++,cn},[e])}const bo=A.memo(e=>{let{adjustScale:t=!1,children:n,dropAnimation:r,style:s,transition:i,modifiers:a,wrapperElement:l="div",className:u,zIndex:m=999}=e;const{activatorEvent:h,active:p,activeNodeRect:x,containerNodeRect:N,draggableNodes:k,droppableContainers:w,dragOverlay:y,over:D,measuringConfiguration:g,scrollableAncestors:v,scrollableAncestorRects:d,windowRect:f}=Ps(),b=c.useContext(rt),P=Fs(p==null?void 0:p.id),E=An(a,{activatorEvent:h,active:p,activeNodeRect:x,containerNodeRect:N,draggingNodeRect:y.rect,over:D,overlayNodeRect:y.rect,scrollableAncestors:v,scrollableAncestorRects:d,transform:b,windowRect:f}),C=jt(x),S=Ts({config:r,draggableNodes:k,droppableContainers:w,measuringConfiguration:g}),V=C?y.setRef:void 0;return A.createElement(js,null,A.createElement(ks,{animation:S},p&&P?A.createElement(Rs,{key:P,id:p.id,ref:V,as:l,activatorEvent:h,adjustScale:t,className:u,transition:i,rect:C,style:{zIndex:m,...s},transform:E},n):null))});export{Me as C,Zs as D,eo as G,R as K,to as M,oo as P,ro as S,so as a,io as b,ao as c,tt as d,ee as e,fo as f,Sr as g,Et as h,vo as i,ho as j,lo as k,Dt as l,ze as m,uo as n,co as o,kn as p,Sn as q,po as r,We as s,mo as t,Ps as u,bo as v,no as w};
