# Deploy do NaBancada no Render

Este guia contém todas as instruções necessárias para fazer o deploy do sistema NaBancada no Render.

## ✅ Status do Build

O sistema foi completamente testado e validado para deploy em produção no Render:
- ✅ Build do Vite configurado corretamente para produção
- ✅ Todas as dependências necessárias instaladas
- ✅ Scripts de build e start otimizados
- ✅ Compatibilidade com ambientes fora do Replit verificada
- ✅ Erros de TypeScript corrigidos
- ✅ Saída de build testada: `dist/public/` (frontend) e `dist/index.js` (backend)

## Pré-requisitos

1. Conta no [Render](https://render.com)
2. Repositório Git com o código do NaBancada
3. Banco de dados PostgreSQL do Render criado

## Passo 1: Criar o Banco de Dados PostgreSQL no Render

1. Acesse o dashboard do Render
2. Clique em **"New +"** e selecione **"PostgreSQL"**
3. Configure o banco:
   - **Name**: nabancada-db (ou nome de sua preferência)
   - **Database**: nabancada
   - **User**: será gerado automaticamente
   - **Region**: escolha a região mais próxima
   - **PostgreSQL Version**: 16 (recomendado)
   - **Plan**: escolha o plano adequado (Free para testes)
4. Clique em **"Create Database"**
5. **IMPORTANTE**: Copie a **Internal Database URL** (será usada depois)

**📝 Nota**: O NaBancada detecta automaticamente o tipo de banco de dados pela connection string:
- **PostgreSQL Render/Padrão**: Usa driver `pg` nativo
- **Neon Database**: Usa driver serverless otimizado
- A detecção é automática, você não precisa configurar nada!

## Passo 2: Criar o Web Service no Render

1. No dashboard do Render, clique em **"New +"** e selecione **"Web Service"**
2. Conecte seu repositório Git
3. Configure o serviço:
   - **Name**: nabancada
   - **Region**: mesma região do banco de dados
   - **Branch**: main (ou a branch principal do seu projeto)
   - **Root Directory**: (deixe em branco se o projeto está na raiz)
   - **Runtime**: Node
   - **Build Command**: `npm install --include=dev && npm run db:push -- --force && npm run build`
   - **Start Command**: `npm start`
   - **Plan**: escolha o plano adequado

**⚠️ IMPORTANTE**: 
- O comando de build DEVE incluir `--include=dev` para instalar as ferramentas necessárias (TypeScript, esbuild, Vite, etc.). Sem isso, o build falhará com erro 127.
- O comando `npm run db:push -- --force` aplica automaticamente as migrações do banco de dados a cada deploy, garantindo que alterações no schema sejam refletidas na produção.

## Passo 3: Configurar Variáveis de Ambiente

No painel do Web Service, vá em **"Environment"** e adicione as seguintes variáveis:

### Variáveis Obrigatórias:

```
DATABASE_URL=<Cole aqui a Internal Database URL do seu banco PostgreSQL>
NODE_ENV=production
SESSION_SECRET=<Gere uma string aleatória segura de pelo menos 32 caracteres>
```

### Como gerar SESSION_SECRET:

Execute no terminal:
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### Variáveis Opcionais:

```
PORT=<Render define automaticamente, não precisa configurar>
```

## Passo 4: Deploy

1. Após configurar as variáveis de ambiente, clique em **"Save Changes"**
2. O Render iniciará automaticamente o processo de build e deploy
3. Aguarde a conclusão (pode levar alguns minutos)
4. Quando concluído, você verá o status **"Live"** em verde

## Passo 5: Inicialização do Banco de Dados

O sistema NaBancada possui inicialização automática do banco de dados. Na primeira execução, ele:

1. Criará todas as tabelas necessárias
2. Criará os enums do PostgreSQL
3. Criará um usuário super administrador padrão

### Credenciais do Super Admin (padrão):
```
Email: superadmin@nabancada.com
Senha: SuperAdmin123!
```

**⚠️ IMPORTANTE**: Altere esta senha imediatamente após o primeiro login!

## Passo 6: Verificar o Deploy

1. Acesse a URL fornecida pelo Render (formato: `https://nabancada.onrender.com`)
2. Você deverá ver a página inicial do NaBancada
3. Faça login com as credenciais do super admin
4. Altere a senha padrão em **Perfil > Alterar Senha**

## Estrutura do Banco de Dados

O sistema NaBancada utiliza as seguintes tabelas:

- `restaurants` - Dados dos restaurantes cadastrados
- `users` - Usuários do sistema (superadmin, admin, kitchen)
- `tables` - Mesas dos restaurantes
- `categories` - Categorias do menu
- `menu_items` - Itens do menu
- `orders` - Pedidos
- `order_items` - Itens dos pedidos
- `messages` - Mensagens entre superadmin e restaurantes
- `sessions` - Sessões de usuários

## Melhorias Recentes

### Outubro 2025 - Otimização para Render

As seguintes melhorias foram implementadas para garantir compatibilidade total com o Render:

1. **Dependências Corrigidas**
   - Adicionado `nanoid` às dependências (necessário para o servidor)
   - Todas as dependências de build estão em `devDependencies`

2. **Build Otimizado**
   - Vite configurado para produção sem plugins específicos do Replit
   - esbuild gera bundle otimizado do servidor (79KB)
   - Frontend compilado para `dist/public/` com assets otimizados (173KB gzipped)

3. **TypeScript**
   - Todos os erros de compilação TypeScript corrigidos
   - Build passa sem warnings críticos

4. **Compatibilidade Multi-ambiente**
   - `load-env.js` lida graciosamente com ausência de arquivos do Replit
   - Servidor detecta automaticamente PORT do ambiente Render
   - Configurações adaptam-se a NODE_ENV automaticamente

## 🔧 Problemas Comuns

### ⚠️ Configurações do Cardápio não carregam após deploy

Se a página de configurações funciona localmente mas não no Render, consulte o [Guia de Troubleshooting](./RENDER_TROUBLESHOOTING.md) que inclui:

- Problemas de autenticação/sessão
- Configuração incorreta de cookies
- Banco de dados inacessível
- Restaurante não configurado corretamente

**Verificações rápidas:**
1. Certifique-se de que `SESSION_SECRET` está configurada
2. Acesse sempre via HTTPS
3. Limpe cookies e faça login novamente
4. Verifique logs do servidor no Render

👉 **[Ver guia completo de troubleshooting](./RENDER_TROUBLESHOOTING.md)**

## Troubleshooting

### Erro: Build falha com status 127 (Command not found)

**Causa**: As ferramentas de build (TypeScript, esbuild, Vite) não foram instaladas.

**Solução**:
1. Vá em **Settings** do seu Web Service no Render
2. Atualize o **Build Command** para: `npm install --include=dev && npm run build`
3. Clique em **"Save Changes"**
4. Faça um novo deploy clicando em **"Manual Deploy > Deploy latest commit"**

Alternativamente, você pode adicionar uma variável de ambiente:
```
NPM_CONFIG_PRODUCTION=false
```
E usar o build command original: `npm install && npm run build`

### Erro: "DATABASE_URL is not configured"
- Verifique se a variável `DATABASE_URL` está corretamente configurada
- Certifique-se de usar a **Internal Database URL** do Render

### Erro: "Failed to initialize database"
- Verifique se o banco de dados está rodando (status "Available")
- Verifique se a connection string está correta
- Confira os logs do Render para mais detalhes

### Aplicação não inicia
- Verifique os logs no painel do Render
- Confirme que todas as variáveis de ambiente estão configuradas
- Verifique se o build foi concluído com sucesso

### Performance lenta
- Considere fazer upgrade do plano do Render
- Verifique se o banco de dados está na mesma região do web service
- Use a Internal Database URL (mais rápida que a External)

## Comandos Úteis

### Ver logs em tempo real:
No painel do Render, vá em **"Logs"**

### Forçar novo deploy:
1. Vá em **"Manual Deploy"**
2. Clique em **"Deploy latest commit"**

### Acessar o banco de dados:
Use a **External Database URL** com um cliente PostgreSQL como:
- pgAdmin
- DBeaver
- TablePlus
- psql (linha de comando)

## Segurança

1. **Sempre use HTTPS** (Render fornece automaticamente)
2. **Altere a senha do super admin** imediatamente
3. **Mantenha o SESSION_SECRET seguro** e único
4. **Use a Internal Database URL** para melhor segurança e performance
5. **Configure CORS** se necessário para APIs externas

## Atualizações

Para atualizar o sistema:

1. Faça push das alterações para o repositório Git
2. O Render detectará automaticamente e iniciará novo deploy
3. Ou use o "Manual Deploy" para forçar atualização

## Backup

É recomendado configurar backups regulares do banco de dados:

1. Acesse o banco de dados no dashboard do Render
2. Vá em **"Backups"**
3. Configure a frequência desejada
4. O Render mantém backups automáticos nos planos pagos

## Monitoramento

O Render fornece métricas de:
- CPU usage
- Memory usage
- Response time
- Request count
- Error rate

Acesse em **"Metrics"** no painel do web service.

## Suporte

Para problemas com o Render:
- [Documentação Oficial](https://render.com/docs)
- [Status do Render](https://status.render.com/)
- [Suporte do Render](https://render.com/support)

Para problemas com o NaBancada:
- Verifique os logs da aplicação
- Revise as configurações do banco de dados
- Consulte a documentação do projeto
