# 🔧 Solução: Mesa Ocupada sem Convidados

## Problema Identificado
Mesa 9 está ocupada com `current_session_id` válido, mas **sem convidados e sem pedidos**.

## Causa
A rota `POST /api/tables/:id/start-session` cria a sessão mas **não cria convidados automaticamente**.

## Soluções Possíveis

### Opção A: Auto-criar convidados ao ocupar mesa (RECOMENDADA)
Modificar `start-session` para criar automaticamente N convidados com base em `customerCount`.

**Vantagens:**
- Fluxo mais intuitivo
- Previne mesas "vazias"
- Facilita o trabalho dos garçons

**Desvantagens:**
- Mudança no comportamento atual

### Opção B: Validação e aviso no frontend
Avisar quando mesa está ocupada mas sem convidados, oferecendo botão para adicionar.

**Vantagens:**
- Não muda comportamento backend
- Flexível

**Desvantagens:**
- Não resolve mesas já problemáticas
- Depende de ação manual

### Opção C: Script de correção para mesas existentes
Criar script que adiciona convidados às mesas ocupadas sem guests.

**Vantagens:**
- Resolve mesas já problemáticas
- Pode rodar uma vez

## Recomendação
**Implementar Opção A + C:**
1. Modificar backend para auto-criar guests
2. Rodar script para corrigir mesa 9 e outras

---

## Implementação Opção A

### Modificar server/routes.ts (linha ~3745)
```typescript
app.post("/api/tables/:id/start-session", isAdmin, async (req, res) => {
  try {
    const currentUser = req.user as User;
    if (!currentUser.restaurantId && currentUser.role !== 'superadmin') {
      return res.status(403).json({ message: "Usuário não associado a um restaurante" });
    }
    
    const restaurantId = currentUser.restaurantId!;
    const { customerName, customerCount } = req.body;
    
    const session = await storage.startTableSession(restaurantId, req.params.id, {
      customerName,
      customerCount,
    });
    
    // ✅ NOVO: Auto-criar convidados com base em customerCount
    const guestsToCreate = customerCount || 1; // Pelo menos 1 convidado
    for (let i = 1; i <= guestsToCreate; i++) {
      await storage.createTableGuest(restaurantId, {
        sessionId: session.id,
        tableId: req.params.id,
        guestNumber: i,
        name: `Convidado ${i}`,
      });
    }
    
    await storage.calculateTableTotal(restaurantId, req.params.id);
    await storage.autoUpdateTableStatusOnSessionStart(req.params.id);
    
    broadcastToClients({ type: 'table_session_started', data: session });
    
    res.json(session);
  } catch (error: any) {
    res.status(500).json({ message: error.message || "Failed to start table session" });
  }
});
```

## Implementação Opção C (Script de Correção)

### Criar script: scripts/fix-empty-occupied-tables.ts
```typescript
import { db } from "../server/db";
import { tables, tableGuests } from "../shared/schema";
import { eq, and, isNotNull } from "drizzle-orm";

async function fixEmptyOccupiedTables() {
  console.log('🔧 Procurando mesas ocupadas sem convidados...\n');
  
  // Buscar todas as mesas ocupadas com sessão ativa
  const occupiedTables = await db.query.tables.findMany({
    where: and(
      isNotNull(tables.currentSessionId),
      eq(tables.status, 'ocupada')
    )
  });
  
  console.log(`Encontradas ${occupiedTables.length} mesas ocupadas\n`);
  
  let fixed = 0;
  
  for (const table of occupiedTables) {
    // Verificar se tem convidados
    const guests = await db.query.tableGuests.findMany({
      where: eq(tableGuests.sessionId, table.currentSessionId!)
    });
    
    if (guests.length === 0) {
      console.log(`❌ Mesa ${table.number} (ID: ${table.id}) está ocupada mas SEM convidados!`);
      console.log(`   SessionId: ${table.currentSessionId}`);
      
      // Adicionar 1 convidado padrão
      await db.insert(tableGuests).values({
        sessionId: table.currentSessionId!,
        tableId: table.id,
        restaurantId: table.restaurantId,
        guestNumber: 1,
        name: 'Convidado 1',
      });
      
      console.log(`   ✅ Convidado adicionado!`);
      fixed++;
    } else {
      console.log(`✅ Mesa ${table.number} OK (${guests.length} convidados)`);
    }
  }
  
  console.log(`\n✅ Corrigidas ${fixed} mesas!`);
}

fixEmptyOccupiedTables();
```

## Rodar o Script
```bash
npx tsx scripts/fix-empty-occupied-tables.ts
```
