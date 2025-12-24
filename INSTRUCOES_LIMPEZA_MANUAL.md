# 🔴 Instruções para Limpeza Manual do IndexedDB

## ⚠️ PROBLEMA

O IndexedDB está travado na versão antiga (v1 ou v2) e não consegue migrar para v3.

**Erro:**
```
Failed to execute 'bound' on 'IDBKeyRange': The parameter is not a valid key.
```

---

## ✅ SOLUÇÃO DEFINITIVA (Passo a Passo)

### 1️⃣ FECHE TUDO

- Feche **TODAS** as abas do Na Bancada
- Feche **TODAS** as abas que possam estar usando o sistema
- Se possível, feche o navegador inteiro

### 2️⃣ REABRA APENAS UMA ABA

- Abra o navegador
- Abra **APENAS UMA** aba com o Na Bancada

### 3️⃣ ABRA O DEVTOOLS

- Pressione **F12**
- Ou clique com botão direito → "Inspecionar"

### 4️⃣ VÁ PARA APPLICATION

- Clique na aba **"Application"** no topo do DevTools
- (Em português pode ser "Aplicativo")

### 5️⃣ NAVEGUE PARA INDEXEDDB

No menu lateral esquerdo:
```
Storage
  └─ IndexedDB
      └─ nabancada_offline
```

### 6️⃣ DELETE O BANCO

- Clique com **botão direito** em `nabancada_offline`
- Selecione **"Delete database"**
- Confirme se aparecer alguma mensagem

### 7️⃣ RECARREGUE A PÁGINA

- Pressione **F5**
- Ou Ctrl+R (Cmd+R no Mac)

---

## 🎯 RESULTADO ESPERADO

Após recarregar, você deve ver no console:

```
🔄 Initializing offline database...
✅ Offline database initialized (v3)
📊 Offline DB: 0 records
```

**SEM ERROS!**

---

## ❌ SE AINDA DER ERRO

### Opção A: Limpar Site Data Completo

1. DevTools → Application
2. No menu lateral: **"Storage"**
3. Clique em **"Clear site data"**
4. Marque tudo
5. Clique em **"Clear site data"**
6. Recarregue (F5)

### Opção B: Modo Anônimo/Privado

1. Abra uma janela anônima (Ctrl+Shift+N)
2. Acesse o sistema
3. Faça login
4. Teste se funciona

Se funcionar no modo anônimo:
→ O problema é cache/dados do navegador
→ Use Opção A para limpar

---

## 🆘 AINDA NÃO FUNCIONOU?

### Verificar Versão do Banco

No console, execute:
```javascript
const request = indexedDB.open('nabancada_offline');
request.onsuccess = () => {
  console.log('Versão atual:', request.result.version);
  request.result.close();
};
```

**Deve mostrar:** `Versão atual: 3`

Se mostrar 1 ou 2:
→ O banco NÃO foi deletado corretamente
→ Repita os passos 1-7

---

## 💡 DICA IMPORTANTE

**SEMPRE que atualizar o schema do IndexedDB:**
1. Feche todas as abas
2. Delete o banco manualmente
3. Reabra o sistema

Isso evita problemas de migração bloqueada.

---

## 📞 PRECISA DE AJUDA?

Se seguiu TODOS os passos e ainda não funciona:

1. Tire um screenshot do console mostrando o erro
2. Execute no console:
   ```javascript
   await indexedDB.databases()
   ```
3. Tire screenshot do resultado
4. Me mostre ambos

---

**Data:** 24/12/2025  
**Versão Alvo:** IndexedDB v3  
**Status:** Instruções para limpeza manual
