import fs from 'fs';
const file = 'server/routes.ts';
let code = fs.readFileSync(file, 'utf8');

const searchMarker = `      // ✅ FIX: Update session paidAmount from actual payments, not guest.paidAmount`;
const endMarker = `      // ✅ CORREÇÃO CONFLITO #12: Verificar auto-fechamento após pagamento individual`;

const startIdx = code.indexOf(searchMarker);
const endIdx = code.indexOf(endMarker);

if (startIdx !== -1 && endIdx !== -1) {
  const replaceStr = `
      // ✅ Usa o motor de recálculo partilhado para atualizar totais da sessão 
      // usando todos os pagamentos da mesa e ajustes
      if (guest.sessionId) {
        const result = await storage.recalculateSessionTotals(guest.sessionId);
        
        console.log('💰 [GUEST PAYMENT] Sessão atualizada via recálculo:', {
          sessionId: guest.sessionId,
          totalAmount: result?.totalAmount,
          paidAmount: result?.paidAmount,
          pendingAmount: result?.pendingAmount
        });
      }

`;
  code = code.slice(0, startIdx) + replaceStr + code.slice(endIdx);
  fs.writeFileSync(file, code);
  console.log("Success");
} else {
  console.log("Failed to find markers.");
}
