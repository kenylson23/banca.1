# 🔐 Configuração do SESSION_SECRET no Render

Este guia explica como configurar corretamente o `SESSION_SECRET` no Render para evitar erros de deploy.

## 🎯 Problema

Durante o deploy no Render, você pode encontrar o erro:
```
Error: SESSION_SECRET must be set
```

Isso ocorre porque o `SESSION_SECRET` é obrigatório para o funcionamento das sessões de usuário.

## ✅ Solução Rápida

### Passo 1: Gerar o SESSION_SECRET

Execute o script helper que criamos:

```bash
node scripts/generate-session-secret.js
```

Ou gere manualmente com:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

Você receberá algo como:
```
a3f5e8d2c1b9a7e6f4d3c2b1a0e9d8c7b6a5f4e3d2c1b0a9f8e7d6c5b4a3f2e1
```

### Passo 2: Configurar no Render

1. **Acesse o Render Dashboard**
   - Vá para: https://dashboard.render.com
   - Selecione seu serviço `nabancada`

2. **Vá para Environment**
   - Na barra lateral, clique em **Environment**
   - Ou vá para: `Settings` > `Environment`

3. **Adicione a variável**
   - Clique em **Add Environment Variable**
   - **Key**: `SESSION_SECRET`
   - **Value**: Cole o secret gerado no Passo 1
   - Clique em **Save Changes**

4. **Deploy automático**
   - O Render iniciará um novo deploy automaticamente
   - Aguarde a conclusão (2-5 minutos)

### Passo 3: Verificar

Após o deploy, verifique os logs:

```bash
# Você NÃO deve ver o erro "SESSION_SECRET must be set"
# Deve ver: "NaBancada server running on port 10000"
```

## 🔒 Segurança

### ⚠️ Importante

- **NUNCA** commite o `SESSION_SECRET` no código
- **NUNCA** compartilhe o secret publicamente
- Use um secret diferente para cada ambiente (dev, staging, prod)
- O secret deve ter pelo menos **32 caracteres**

### 🔄 Rotação do Secret

Se você precisar trocar o secret:

1. Gere um novo secret
2. Atualize no Render Dashboard
3. **Aviso**: Todos os usuários serão deslogados automaticamente

## 📋 Checklist de Deploy

Antes de fazer deploy, verifique:

- [ ] `DATABASE_URL` está configurada (PostgreSQL)
- [ ] `SESSION_SECRET` está configurada (32+ caracteres)
- [ ] `NODE_ENV` está como `production`
- [ ] Build command: `npm install --include=dev && npm run build`
- [ ] Start command: `npm start`

## 🛠️ Troubleshooting

### Erro persiste após configurar

1. **Verifique se salvou as mudanças**
   ```
   Render Dashboard > Environment > Save Changes
   ```

2. **Force um novo deploy**
   ```
   Render Dashboard > Manual Deploy > Deploy latest commit
   ```

3. **Verifique os logs**
   ```
   Render Dashboard > Logs (tab)
   Procure por: "SESSION_SECRET is not set"
   ```

### Secret muito curto

Se você ver o aviso:
```
⚠️  SESSION_SECRET is too short (minimum 32 characters recommended)
```

Gere um novo secret com 32+ caracteres usando o script do Passo 1.

## 📚 Configuração Local

Para desenvolvimento local, adicione ao seu `.env`:

```env
# Gere com: node scripts/generate-session-secret.js
SESSION_SECRET=seu-secret-gerado-aqui-com-32-ou-mais-caracteres
```

**Lembre-se**: O arquivo `.env` está no `.gitignore` e não será commitado.

## ✨ Configuração Automática vs Manual

### ❌ Por que NÃO usar `generateValue: true`?

O `render.yaml` anteriormente tinha:
```yaml
- key: SESSION_SECRET
  generateValue: true  # ❌ Pode causar problemas
```

**Problemas**:
- Gera um novo secret a cada deploy
- Desloga todos os usuários
- Pode não ser gerado corretamente em alguns casos

### ✅ Configuração Manual (Recomendado)

```yaml
- key: SESSION_SECRET
  sync: false  # ✅ Configure manualmente
```

**Vantagens**:
- Controle total sobre o secret
- Secret permanente entre deploys
- Sessões dos usuários são mantidas
- Mais seguro e previsível

## 🎓 Referências

- [Render Environment Variables](https://render.com/docs/environment-variables)
- [Express Session Security](https://expressjs.com/en/advanced/best-practice-security.html)
- [Node.js Crypto Module](https://nodejs.org/api/crypto.html)
