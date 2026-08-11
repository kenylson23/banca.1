import fs from 'fs';
const file = 'server/routes.ts';
let code = fs.readFileSync(file, 'utf8');

const searchMarker = `      // Buscar sessão atualizada`;
const endMarker = `        // Auto-update table status`;

const startIdx = code.indexOf(searchMarker);
const endIdx = code.indexOf(endMarker);

if (startIdx !== -1 && endIdx !== -1) {
  const replaceStr = `
      // ✅ Usa o motor de recálculo partilhado
      if (targetSessionId) {
        await storage.recalculateSessionTotals(targetSessionId);
        
`;
  code = code.slice(0, startIdx) + replaceStr + code.slice(endIdx);
  fs.writeFileSync(file, code);
  console.log("Success");
} else {
  console.log("Failed to find markers.");
}
