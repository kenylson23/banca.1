import{u as L,j as i,B as C}from"./index-Bzdgplmk.js";import{r as A}from"./react-vendor-DoqEe0id.js";import{f as c}from"./badge-wtXWRGq6.js";import{A as O,P as h,D as U,a as _,b as S,c as Q,d as G,e as g,z as W,B as K,x as m,q as d,C as Y}from"./usePrinter-D63PJcfH.js";import{a as J}from"./checkbox-OcK63t3C.js";import{F as X}from"./file-text-ZcHD_1rg.js";function te({guest:t,orders:b,totalAmount:v,tableName:k="Mesa",restaurantName:N="NaBancada",restaurantAddress:V,restaurantPhone:I,restaurantNIF:T,restaurantLogoUrl:w,paymentMethod:r,variant:E="ghost",size:f="sm"}){const u=f==="icon",{getPrinterByType:q}=O(),{toast:a}=L(),[x,j]=A.useState(!1),z=q("receipt"),$={dinheiro:"Dinheiro",multicaixa:"Multicaixa",transferencia:"Transferência Bancária",cartao:"Cartão"},M=async()=>{j(!0);try{const e=[];b.forEach(l=>{l.items.forEach(s=>{e.push({name:s.menuItemName,quantity:s.quantity,price:c(s.unitPrice),total:c(s.totalPrice)})})});const n=t.name||`Cliente ${t.guestNumber}`;await K.printGuestBill("receipt",{restaurantName:N,restaurantAddress:V,restaurantPhone:I,restaurantNIF:T,restaurantLogoUrl:w,tableName:k,guestName:n,guestNumber:t.guestNumber,entryTime:m(new Date(t.joinedAt),"dd/MM/yyyy HH:mm",{locale:d}),items:e,subtotal:c(v.toFixed(2)),serviceCharge:void 0,discount:void 0,total:c(v.toFixed(2)),paymentMethod:r?$[r]||r:void 0,isPaid:t.status==="pago",orderCount:b.length,documentId:t.id.substring(0,8).toUpperCase(),timestamp:m(new Date,"dd/MM/yyyy 'às' HH:mm",{locale:d})}),a({title:"Conta impressa",description:`Conta de ${n} enviada para impressora térmica`})}catch(e){a({title:"Erro ao imprimir",description:e instanceof Error?e.message:"Erro desconhecido",variant:"destructive"})}finally{j(!1)}},y=async(e=!1)=>{const n=t.name||`Cliente ${t.guestNumber}`,l=`${window.location.origin}/track-order?id=${t.id.substring(0,8).toUpperCase()}`;let s="";try{s=await Y.toDataURL(l,{width:e?200:150,margin:2,errorCorrectionLevel:"M",color:{dark:"#000000",light:"#FFFFFF"}})}catch(p){console.error("Erro ao gerar QR Code:",p)}return`
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <title>Conta Individual - ${n}</title>
          <style>
            * {
              margin: 0;
              padding: 0;
              box-sizing: border-box;
            }
            
            @media print {
              @page {
                margin: ${e?"2cm":"1cm"};
                size: ${e?"A4":"auto"};
              }
              
              body {
                print-color-adjust: exact;
                -webkit-print-color-adjust: exact;
              }
            }
            
            body {
              font-family: ${e?"'Arial', sans-serif":"'Courier New', monospace"};
              padding: ${e?"40px":"20px"};
              max-width: ${e?"210mm":"800px"};
              margin: 0 auto;
              background: white;
              ${e?"box-shadow: 0 0 10px rgba(0,0,0,0.1);":""}
            }
            
            .header {
              text-align: center;
              margin-bottom: 30px;
              padding-bottom: 20px;
              border-bottom: ${e?"3px solid #2563eb":"2px dashed #333"};
              ${e?"background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%); color: white; padding: 20px; margin: -40px -40px 30px -40px;":""}
            }
            
            .restaurant-logo {
              max-width: ${e?"150px":"120px"};
              height: auto;
              margin: 0 auto ${e?"20px":"15px"} auto;
              display: block;
              ${e?"background: white; padding: 10px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);":""}
            }
            
            .header h1 {
              font-size: ${e?"32px":"24px"};
              margin-bottom: ${e?"10px":"5px"};
              ${e?"text-transform: uppercase; letter-spacing: 2px;":""}
            }
            
            .header h2 {
              font-size: ${e?"22px":"18px"};
              font-weight: ${e?"bold":"normal"};
              margin-bottom: 10px;
              ${e?"opacity: 0.95;":""}
            }
            
            ${e?`
            .header-subtitle {
              font-size: 14px;
              opacity: 0.9;
              margin-top: 5px;
            }
            `:""}
            
            .info {
              margin: ${e?"25px 0":"15px 0"};
              font-size: ${e?"15px":"14px"};
              ${e?"background: #f8fafc; padding: 20px; border-radius: 8px; border-left: 4px solid #3b82f6;":""}
            }
            
            .info-row {
              display: flex;
              justify-content: space-between;
              margin: ${e?"10px 0":"5px 0"};
              ${e?"padding: 5px 0;":""}
            }
            
            ${e?`
            .info-label {
              font-weight: 600;
              color: #475569;
            }
            
            .info-value {
              color: #1e293b;
              font-weight: 500;
            }
            `:""}
            
            .items {
              margin: ${e?"30px 0":"20px 0"};
            }
            
            .items-header {
              font-size: ${e?"18px":"14px"};
              font-weight: bold;
              margin-bottom: ${e?"15px":"10px"};
              ${e?"color: #1e293b; text-transform: uppercase; letter-spacing: 1px;":""}
            }
            
            .item {
              display: flex;
              justify-content: space-between;
              margin: ${e?"12px 0":"8px 0"};
              font-size: ${e?"15px":"14px"};
              ${e?"padding: 10px; background: #ffffff; border-radius: 4px; transition: background 0.2s;":""}
            }
            
            ${e?`
            .item:hover {
              background: #f1f5f9;
            }
            `:""}
            
            .item-name {
              flex: 1;
              ${e?"font-weight: 500; color: #334155;":""}
            }
            
            .item-qty {
              width: ${e?"80px":"60px"};
              text-align: center;
              ${e?"color: #64748b; font-weight: 500;":""}
            }
            
            .item-price {
              width: ${e?"120px":"100px"};
              text-align: right;
              ${e?"color: #64748b;":""}
            }
            
            .item-total {
              width: ${e?"140px":"120px"};
              text-align: right;
              font-weight: bold;
              ${e?"color: #1e293b;":""}
            }
            
            .separator {
              border-top: ${e?"2px solid #e2e8f0":"1px dashed #666"};
              margin: ${e?"20px 0":"15px 0"};
            }
            
            .total-section {
              margin-top: ${e?"30px":"20px"};
              padding: ${e?"25px":"15px 0"};
              border-top: ${e?"3px solid #2563eb":"2px solid #333"};
              ${e?"background: #f8fafc; margin-left: -40px; margin-right: -40px; padding-left: 40px; padding-right: 40px;":""}
            }
            
            .total-row {
              display: flex;
              justify-content: space-between;
              font-size: ${e?"24px":"18px"};
              font-weight: bold;
              margin: 10px 0;
              ${e?"color: #1e293b;":""}
            }
            
            ${e?`
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
            `:""}
            
            .footer {
              margin-top: ${e?"40px":"30px"};
              padding-top: ${e?"25px":"15px"};
              border-top: ${e?"2px solid #e2e8f0":"2px dashed #333"};
              text-align: center;
              font-size: ${e?"13px":"12px"};
              color: ${e?"#64748b":"#666"};
            }
            
            .footer-info {
              margin: ${e?"8px 0":"5px 0"};
            }
            
            .status-paid {
              background-color: #10b981;
              color: white;
              padding: ${e?"8px 16px":"5px 10px"};
              border-radius: ${e?"8px":"5px"};
              display: inline-block;
              margin: ${e?"15px 0":"10px 0"};
              ${e?"font-size: 16px; font-weight: 600; box-shadow: 0 2px 4px rgba(16, 185, 129, 0.3);":""}
            }
            
            .status-pending {
              background-color: #f59e0b;
              color: white;
              padding: ${e?"8px 16px":"5px 10px"};
              border-radius: ${e?"8px":"5px"};
              display: inline-block;
              margin: ${e?"15px 0":"10px 0"};
              ${e?"font-size: 16px; font-weight: 600; box-shadow: 0 2px 4px rgba(245, 158, 11, 0.3);":""}
            }
            
            ${e?`
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
            `:`
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
            ${w?`<img src="${w}" alt="${N} Logo" class="restaurant-logo" />`:""}
            <h1>${N}</h1>
            <h2>CONTA INDIVIDUAL</h2>
            ${e?'<div class="header-subtitle">Documento de Controle Interno</div>':""}
          </div>
          
          <div class="info">
            <div class="info-row">
              <span class="${e?"info-label":""}"><strong>Mesa:</strong> ${k}</span>
              <span class="${e?"info-value":""}"><strong>Data:</strong> ${m(new Date,"dd/MM/yyyy",{locale:d})}</span>
            </div>
            <div class="info-row">
              <span class="${e?"info-label":""}"><strong>Cliente:</strong> ${n}</span>
              <span class="${e?"info-value":""}"><strong>Hora:</strong> ${m(new Date,"HH:mm",{locale:d})}</span>
            </div>
            <div class="info-row">
              <span class="${e?"info-label":""}"><strong>Entrada:</strong> ${m(new Date(t.joinedAt),"HH:mm",{locale:d})}</span>
              ${e?`<span class="info-value"><strong>Pedidos:</strong> ${b.length}</span>`:""}
            </div>
          </div>
          
          <div class="separator"></div>
          
          <div class="items">
            ${e?'<div class="items-header">Itens Consumidos</div>':""}
            <div class="item" style="font-weight: bold; border-bottom: ${e?"2px":"1px"} solid #333; padding-bottom: 5px; margin-bottom: 10px;">
              <span class="item-name">ITEM</span>
              <span class="item-qty">QTD</span>
              <span class="item-price">PREÇO</span>
              <span class="item-total">TOTAL</span>
            </div>
            ${b.flatMap(p=>p.items.map(o=>`
                <div class="item">
                  <span class="item-name">${o.menuItemName}</span>
                  <span class="item-qty">${o.quantity}</span>
                  <span class="item-price">${c(o.unitPrice)}</span>
                  <span class="item-total">${c(o.totalPrice)}</span>
                </div>
              `).join("")).join("")}
          </div>
          
          <div class="total-section">
            <div class="total-row">
              <span>TOTAL A PAGAR:</span>
              <span>${c(v.toFixed(2))}</span>
            </div>
            ${e&&r?`
            <div class="payment-info">
              <div class="payment-method">
                <strong>Forma de Pagamento:</strong> ${$[r]||r}
              </div>
            </div>
            `:""}
          </div>
          
          ${s?`
          <div class="qr-code-section">
            <div class="qr-code-label">Rastreamento do Pedido</div>
            <img src="${s}" alt="QR Code" class="qr-code-image" />
            <div class="footer-info">Escaneie para acompanhar</div>
            ${e?`<div class="tracking-url">${l}</div>`:""}
          </div>
          `:""}
          
          <div class="footer">
            ${!e&&r?`<div class="footer-info"><strong>Forma de Pagamento:</strong> ${$[r]||r}</div>`:""}
            ${t.status==="pago"?'<div class="status-paid">✓ PAGO</div>':e?'<div class="status-pending">⏳ PENDENTE</div>':""}
            <div class="footer-info">Documento sem valor fiscal</div>
            <div class="footer-info">${m(new Date,"dd/MM/yyyy 'às' HH:mm",{locale:d})}</div>
            ${e?`<div class="document-id">ID: ${t.id.substring(0,8).toUpperCase()}</div>`:""}
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
    `},B=async()=>{const e=window.open("","_blank");if(!e){a({title:"Erro",description:"Não foi possível abrir janela de impressão",variant:"destructive"});return}try{const n=await y(!1);e.document.write(n),e.document.close(),setTimeout(()=>{e.print()},250)}catch{e.close(),a({title:"Erro",description:"Não foi possível gerar o recibo",variant:"destructive"})}},R=async()=>{const e=window.open("","_blank");if(!e){a({title:"Erro",description:"Não foi possível abrir janela de impressão",variant:"destructive"});return}try{const n=await y(!0);e.document.write(n),e.document.close(),a({title:"Recibo aberto",description:"Use Ctrl+P ou Cmd+P para salvar como PDF"})}catch{e.close(),a({title:"Erro",description:"Não foi possível gerar o recibo",variant:"destructive"})}},H=async()=>{const n=`Conta_${(t.name||`Cliente ${t.guestNumber}`).replace(/\s+/g,"_")}_${m(new Date,"yyyyMMdd_HHmm")}.html`;try{const l=await y(!0),s=new Blob([l],{type:"text/html"}),p=URL.createObjectURL(s),o=document.createElement("a");o.href=p,o.download=n,document.body.appendChild(o),o.click(),document.body.removeChild(o),URL.revokeObjectURL(p),a({title:"Recibo baixado",description:"O arquivo HTML foi salvo com sucesso"})}catch{a({title:"Erro",description:"Não foi possível baixar o recibo",variant:"destructive"})}};return z?i.jsxDEV(U,{children:[i.jsxDEV(_,{asChild:!0,children:i.jsxDEV(C,{variant:E,size:f,disabled:x,title:"Imprimir conta individual",children:[i.jsxDEV(h,{className:u?"h-4 w-4":"h-4 w-4 mr-2"},void 0,!1,{fileName:"/home/runner/workspace/client/src/components/PrintGuestBill.tsx",lineNumber:652,columnNumber:11},this),!u&&"Imprimir",!u&&i.jsxDEV(J,{className:"h-3 w-3 ml-1"},void 0,!1,{fileName:"/home/runner/workspace/client/src/components/PrintGuestBill.tsx",lineNumber:654,columnNumber:27},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/components/PrintGuestBill.tsx",lineNumber:646,columnNumber:9},this)},void 0,!1,{fileName:"/home/runner/workspace/client/src/components/PrintGuestBill.tsx",lineNumber:645,columnNumber:7},this),i.jsxDEV(S,{align:"end",className:"w-56",children:[i.jsxDEV(Q,{children:"Opções de Impressão"},void 0,!1,{fileName:"/home/runner/workspace/client/src/components/PrintGuestBill.tsx",lineNumber:658,columnNumber:9},this),i.jsxDEV(G,{},void 0,!1,{fileName:"/home/runner/workspace/client/src/components/PrintGuestBill.tsx",lineNumber:659,columnNumber:9},this),i.jsxDEV(g,{onClick:M,disabled:x,children:[i.jsxDEV(h,{className:"h-4 w-4 mr-2"},void 0,!1,{fileName:"/home/runner/workspace/client/src/components/PrintGuestBill.tsx",lineNumber:662,columnNumber:11},this),i.jsxDEV("div",{className:"flex flex-col",children:[i.jsxDEV("span",{children:"Impressora Térmica"},void 0,!1,{fileName:"/home/runner/workspace/client/src/components/PrintGuestBill.tsx",lineNumber:664,columnNumber:13},this),i.jsxDEV("span",{className:"text-xs text-muted-foreground",children:"Recibo 80mm"},void 0,!1,{fileName:"/home/runner/workspace/client/src/components/PrintGuestBill.tsx",lineNumber:665,columnNumber:13},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/components/PrintGuestBill.tsx",lineNumber:663,columnNumber:11},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/components/PrintGuestBill.tsx",lineNumber:661,columnNumber:9},this),i.jsxDEV(g,{onClick:B,disabled:x,children:[i.jsxDEV(h,{className:"h-4 w-4 mr-2"},void 0,!1,{fileName:"/home/runner/workspace/client/src/components/PrintGuestBill.tsx",lineNumber:670,columnNumber:11},this),i.jsxDEV("div",{className:"flex flex-col",children:[i.jsxDEV("span",{children:"Impressão Rápida"},void 0,!1,{fileName:"/home/runner/workspace/client/src/components/PrintGuestBill.tsx",lineNumber:672,columnNumber:13},this),i.jsxDEV("span",{className:"text-xs text-muted-foreground",children:"Navegador padrão"},void 0,!1,{fileName:"/home/runner/workspace/client/src/components/PrintGuestBill.tsx",lineNumber:673,columnNumber:13},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/components/PrintGuestBill.tsx",lineNumber:671,columnNumber:11},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/components/PrintGuestBill.tsx",lineNumber:669,columnNumber:9},this),i.jsxDEV(g,{onClick:R,disabled:x,children:[i.jsxDEV(X,{className:"h-4 w-4 mr-2"},void 0,!1,{fileName:"/home/runner/workspace/client/src/components/PrintGuestBill.tsx",lineNumber:678,columnNumber:11},this),i.jsxDEV("div",{className:"flex flex-col",children:[i.jsxDEV("span",{children:"Formato PDF (A4)"},void 0,!1,{fileName:"/home/runner/workspace/client/src/components/PrintGuestBill.tsx",lineNumber:680,columnNumber:13},this),i.jsxDEV("span",{className:"text-xs text-muted-foreground",children:"Layout profissional"},void 0,!1,{fileName:"/home/runner/workspace/client/src/components/PrintGuestBill.tsx",lineNumber:681,columnNumber:13},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/components/PrintGuestBill.tsx",lineNumber:679,columnNumber:11},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/components/PrintGuestBill.tsx",lineNumber:677,columnNumber:9},this),i.jsxDEV(G,{},void 0,!1,{fileName:"/home/runner/workspace/client/src/components/PrintGuestBill.tsx",lineNumber:685,columnNumber:9},this),i.jsxDEV(g,{onClick:H,children:[i.jsxDEV(W,{className:"h-4 w-4 mr-2"},void 0,!1,{fileName:"/home/runner/workspace/client/src/components/PrintGuestBill.tsx",lineNumber:688,columnNumber:11},this),i.jsxDEV("div",{className:"flex flex-col",children:[i.jsxDEV("span",{children:"Baixar Recibo"},void 0,!1,{fileName:"/home/runner/workspace/client/src/components/PrintGuestBill.tsx",lineNumber:690,columnNumber:13},this),i.jsxDEV("span",{className:"text-xs text-muted-foreground",children:"Salvar arquivo HTML"},void 0,!1,{fileName:"/home/runner/workspace/client/src/components/PrintGuestBill.tsx",lineNumber:691,columnNumber:13},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/components/PrintGuestBill.tsx",lineNumber:689,columnNumber:11},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/components/PrintGuestBill.tsx",lineNumber:687,columnNumber:9},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/components/PrintGuestBill.tsx",lineNumber:657,columnNumber:7},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/components/PrintGuestBill.tsx",lineNumber:644,columnNumber:5},this):i.jsxDEV(C,{variant:E,size:f,onClick:B,disabled:x,title:"Imprimir conta individual",children:[i.jsxDEV(h,{className:u?"h-4 w-4":"h-4 w-4 mr-2"},void 0,!1,{fileName:"/home/runner/workspace/client/src/components/PrintGuestBill.tsx",lineNumber:636,columnNumber:9},this),!u&&"Imprimir"]},void 0,!0,{fileName:"/home/runner/workspace/client/src/components/PrintGuestBill.tsx",lineNumber:629,columnNumber:7},this)}export{te as P};
