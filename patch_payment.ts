import fs from 'fs';
const file = 'server/routes.ts';
let code = fs.readFileSync(file, 'utf8');

const searchMarker = `      // ✅ CORREÇÃO CRÍTICA: addTablePayment JÁ atualiza session.paidAmount atomicamente`;
const endMarker = `      broadcastToClients({ 
        type: 'table_payment_recorded',`;

const startIdx = code.indexOf(searchMarker);
const endIdx = code.indexOf(endMarker);

if (startIdx !== -1 && endIdx !== -1) {
  const replaceStr = `
      // ✅ Usa o motor de recálculo partilhado (calcula subtotal, ajusta descontos, e soma os pagamentos reais)
      if (table.currentSessionId) {
        const result = await storage.recalculateSessionTotals(table.currentSessionId);
        
        console.log('💰 [TABLE PAYMENT] Sessão atualizada via recálculo:', {
          sessionId: table.currentSessionId,
          totalAmount: result?.totalAmount,
          paidAmount: result?.paidAmount,
          pendingAmount: result?.pendingAmount
        });

        // ✅ DESATIVADO: Não fechar automaticamente após pagamento
        // Cliente pode querer fazer mais pedidos (sobremesa, café, etc)
        // O fechamento deve ser sempre manual através do botão "Fechar Mesa"
        const validation = await storage.validateSessionClosure(table.currentSessionId);
        
        if (validation.canClose) {
          console.log(\`[TablePayment] ✅ Pagamento completo detectado. Mesa pode ser fechada manualmente.\`);
          broadcastToClients({ 
            type: 'table_payment_complete', 
            data: { 
              tableId: table.id, 
              sessionId: table.currentSessionId,
              canClose: true,
              message: 'Pagamento completo. Mesa pronta para fechamento manual.' 
            } 
          });
        }
      }

`;
  code = code.slice(0, startIdx) + replaceStr + code.slice(endIdx);
  fs.writeFileSync(file, code);
  console.log("Success");
} else {
  console.log("Failed to find markers.");
}
