# Correção: "unexpected token doctype invalid json"

## Problema
Ao fazer pagamento individual, aparece erro:
```
unexpected token doctype invalid json
```

## Causa
O erro "doctype" significa que o servidor retornou HTML em vez de JSON, geralmente por:
1. Erro 500 não tratado
2. Imports faltando (já corrigido)
3. Método duplicado no storage.ts

## Correções Aplicadas

### 1. Verificar Imports
✅ `db` e `eq` já estavam importados de `./storage`

### 2. Melhor Log de Erros
Adicionado log detalhado no catch:
```typescript
console.error('❌ [GUEST PAYMENT] Erro ao processar pagamento:', error);
console.error('❌ [GUEST PAYMENT] Stack:', error.stack);
```

## Como Testar Agora

### 1. Reiniciar Servidor
```bash
# Parar (Ctrl+C)
npm run dev
```

### 2. Tentar Pagamento Novamente
- Abrir console (`F12`)
- Fazer pagamento individual
- **Verificar terminal do servidor**

### 3. Ler o Erro Real
No terminal do servidor, você verá:
```
❌ [GUEST PAYMENT] Erro ao processar pagamento: [erro real aqui]
❌ [GUEST PAYMENT] Stack: [stack trace completo]
```

## Possíveis Erros e Soluções

### Erro: "getTableGuestById is not a function"
**Solução**: Verificar se método existe em storage.ts

### Erro: "createGuestPayment is not a function"  
**Solução**: Verificar se método existe em storage.ts

### Erro: "Cannot read property 'subtotal' of undefined"
**Solução**: Guest não encontrado - verificar ID do guest

### Erro: Relacionado a database/query
**Solução**: Verificar conexão com banco de dados

---

## Próximos Passos

1. Reiniciar servidor
2. Fazer pagamento novamente
3. **Copiar e colar aqui o erro COMPLETO** que aparece no terminal
4. Com o erro real, posso corrigir especificamente

---

**IMPORTANTE**: Não faça mais nada até reiniciar o servidor e ver o erro REAL no terminal!
