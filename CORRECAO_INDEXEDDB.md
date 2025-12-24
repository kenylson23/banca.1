# Correção do Erro IndexedDB

## 🐛 Erro Encontrado

```
❌ Failed to initialize offline database: TypeError: this.tables.count is not a function
```

## 🔍 Causa

O banco de dados IndexedDB precisa ser deletado e recriado porque:
1. O schema foi atualizado (versão 3)
2. As tabelas antigas não têm os novos índices
3. O Dexie precisa reabrir o banco com o novo schema

## ✅ Solução Implementada

### 1. Código Corrigido

**Arquivo:** `client/src/lib/offline-db.ts`

- Adicionado check `isOpen()` antes de usar o banco
- Tratamento de erro melhorado
- Tentativa de obter tamanho do DB em try/catch separado

### 2. Ferramenta de Correção

**Criado:** `client/public/fix-indexeddb.html`

Uma página web simples para deletar o banco manualmente.

## 🔧 Como Corrigir

### Opção 1: Console do Navegador (Rápida)

1. Abra DevTools (F12)
2. Vá para a aba **Console**
3. Cole e execute:

```javascript
indexedDB.deleteDatabase('nabancada_offline').onsuccess = () => {
  console.log('✅ Database deletado!');
  location.reload();
};
```

4. A página será recarregada e o banco recriado automaticamente

### Opção 2: Página de Correção

1. Acesse: `http://localhost:5000/fix-indexeddb.html`
2. Clique em "🗑️ Deletar IndexedDB"
3. Aguarde a confirmação
4. Clique em "🏠 Ir para Na Bancada"

### Opção 3: Application Tab

1. Abra DevTools (F12)
2. Vá para **Application** → **Storage** → **IndexedDB**
3. Clique com botão direito em `nabancada_offline`
4. Selecione **Delete database**
5. Recarregue a página (F5)

## 🧪 Verificação

Após aplicar a correção, você deve ver no console:

```
✅ Offline database initialized
📊 Offline DB: 0 records (0 orders, 0 pending sync)
```

**Sem mais erros!**

## 📝 Prevenção Futura

O código agora:
- Verifica se o banco está aberto antes de usar
- Trata erros de forma mais robusta
- Não falha se não conseguir obter o tamanho
- Tenta recriar automaticamente se houver erro

## 🎯 Status

✅ **Problema Resolvido**
- Código corrigido
- Ferramenta de correção criada
- Documentação atualizada

---

**Data:** 24/12/2025
**Arquivo:** CORRECAO_INDEXEDDB.md
