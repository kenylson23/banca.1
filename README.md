# NaBancada - Sistema de Gestão para Restaurantes

Sistema completo de gestão para restaurantes com funcionalidades de multi-tenant, pedidos, menu digital e administração.

## 🚀 Funcionalidades

### Para Super Administradores
- Gerenciamento de restaurantes cadastrados
- Aprovação/suspensão de estabelecimentos
- Visualização de todos os restaurantes
- Comunicação com restaurantes via mensagens

### Para Administradores de Restaurantes
- Gestão completa do menu (categorias e itens)
- Gerenciamento de mesas com QR codes
- Acompanhamento de pedidos em tempo real
- Gerenciamento de usuários da cozinha
- Perfil e configurações do restaurante

### Para Cozinha
- Visualização de pedidos em tempo real
- Atualização de status dos pedidos
- Notificações via WebSocket

### Para Clientes
- Acesso ao menu digital via QR code
- Realizar pedidos diretamente da mesa
- Acompanhamento do status do pedido

## 📋 Pré-requisitos

- Node.js 18 ou superior
- PostgreSQL 14 ou superior (Render, Neon, ou qualquer PostgreSQL padrão)
- npm ou yarn

**💡 Compatibilidade de Banco de Dados**:
- ✅ Render PostgreSQL (recomendado para deploy)
- ✅ Neon Database (serverless)
- ✅ PostgreSQL local
- ✅ Qualquer serviço PostgreSQL padrão

O sistema detecta automaticamente o tipo de banco pela connection string e usa o driver apropriado!

## 🛠️ Tecnologias Utilizadas

### Backend
- Node.js + Express
- TypeScript
- PostgreSQL (compatível com Render, Neon, e qualquer PostgreSQL padrão)
- Drizzle ORM
- Passport.js (autenticação)
- WebSocket (tempo real)
- Express Session
- Detecção automática de driver de banco de dados

### Frontend
- React 18
- TypeScript
- Vite
- TailwindCSS
- Shadcn/ui
- TanStack Query
- Wouter (roteamento)
- Framer Motion

## 📦 Instalação Local

1. Clone o repositório:
```bash
git clone <seu-repositorio>
cd nabancada
```

2. Instale as dependências:
```bash
npm install
```

3. Configure as variáveis de ambiente:
Crie um arquivo `.env` na raiz do projeto:
```env
DATABASE_URL=postgresql://user:password@localhost:5432/nabancada
NODE_ENV=development
SESSION_SECRET=sua-chave-secreta-aqui  # Gere com: npm run generate:secret
```

4. Execute o setup do banco de dados:
```bash
npm run db:push
```

5. Inicie o servidor de desenvolvimento:
```bash
npm run dev
```

O sistema estará disponível em `http://localhost:5000`

## 🌐 Deploy no Render

Para fazer deploy no Render, siga o guia detalhado em [RENDER_DEPLOY.md](./RENDER_DEPLOY.md)

### 🚀 Deploy Rápido com render.yaml

Este projeto inclui um arquivo `render.yaml` que configura automaticamente o banco de dados e o web service no Render:

1. **Fork/Clone** este repositório
2. No Render Dashboard, clique em **"New +"** → **"Blueprint"**
3. Conecte seu repositório Git
4. O Render criará automaticamente:
   - ✅ Banco de dados PostgreSQL
   - ✅ Web Service com todas as configurações
   - ✅ Variáveis de ambiente necessárias

### 📋 Deploy Manual (Passo a Passo)

1. **Criar banco PostgreSQL no Render**
   - Acesse Render Dashboard
   - Crie um novo PostgreSQL database
   - Copie a Internal Database URL

2. **Criar Web Service no Render**
   - Conecte seu repositório Git
   - Configure:
     - Build Command: `npm install --include=dev && npm run db:push -- --force && npm run build`
     - Start Command: `npm start`
   - ⚠️ **IMPORTANTE**: 
     - Use `--include=dev` no build command para evitar erro 127
     - O `npm run db:push -- --force` aplica automaticamente as migrações do banco a cada deploy

3. **Configurar Variáveis de Ambiente**
   
   **Gerar SESSION_SECRET:**
   ```bash
   npm run generate:secret
   ```
   
   **No Render Dashboard, adicione:**
   ```
   DATABASE_URL=<internal-database-url>
   NODE_ENV=production
   SESSION_SECRET=<copie-o-secret-gerado-acima>
   ```
   
   📖 **Guia completo**: Veja [RENDER_SESSION_SECRET_SETUP.md](./RENDER_SESSION_SECRET_SETUP.md)

4. **Deploy Automático**
   - O Render fará o deploy automaticamente
   - A migração do banco é executada automaticamente
   - A inicialização do banco é automática

## 🔑 Credenciais Padrão

Após a primeira execução, um super administrador é criado automaticamente:

```
Email: superadmin@nabancada.com
Senha: SuperAdmin123!
```

**⚠️ IMPORTANTE**: Altere esta senha imediatamente após o primeiro login!

## 📊 Estrutura do Banco de Dados

O sistema utiliza as seguintes tabelas principais:

- **restaurants** - Dados dos restaurantes
- **users** - Usuários (superadmin, admin, kitchen)
- **tables** - Mesas dos restaurantes
- **categories** - Categorias do menu
- **menu_items** - Itens do menu
- **orders** - Pedidos
- **order_items** - Itens dos pedidos
- **messages** - Mensagens entre superadmin e restaurantes
- **sessions** - Gerenciamento de sessões

## 🔐 Autenticação

O sistema utiliza:
- Passport.js com estratégia local
- Express Session para gerenciamento de sessões
- Bcrypt para hash de senhas
- Sessões armazenadas no PostgreSQL

## 🌐 WebSocket

O sistema utiliza WebSocket para:
- Notificações em tempo real de novos pedidos
- Atualização automática de status de pedidos
- Comunicação bidirecional entre cliente e servidor

## 📱 QR Codes

Cada mesa possui um QR code único que:
- Direciona clientes para o menu digital
- Associa automaticamente pedidos à mesa
- É gerado automaticamente ao criar uma mesa

## 🛡️ Segurança

- Senhas criptografadas com bcrypt
- Sessões seguras com cookies HTTP-only
- Autenticação em todas as rotas protegidas
- Validação de dados com Zod
- Prevenção de SQL injection via Drizzle ORM
- Proteção CSRF

## 📝 Scripts Disponíveis

```bash
npm run dev          # Inicia servidor de desenvolvimento
npm run build        # Build para produção
npm start            # Inicia servidor de produção
npm run check        # Verifica tipos TypeScript
npm run db:push      # Sincroniza schema com banco de dados
```

## 🗂️ Estrutura do Projeto

```
nabancada/
├── client/              # Frontend React
│   ├── src/
│   │   ├── components/  # Componentes React
│   │   ├── contexts/    # Contextos React
│   │   ├── hooks/       # Hooks customizados
│   │   ├── lib/         # Utilitários
│   │   └── pages/       # Páginas da aplicação
│   └── index.html
├── server/              # Backend Express
│   ├── auth.ts          # Configuração de autenticação
│   ├── db.ts            # Conexão com banco de dados
│   ├── index.ts         # Servidor principal
│   ├── initDb.ts        # Inicialização do banco
│   ├── routes.ts        # Rotas da API
│   └── storage.ts       # Interface de storage
├── shared/              # Código compartilhado
│   └── schema.ts        # Schema do banco (Drizzle)
├── scripts/             # Scripts utilitários
└── package.json
```

## 🔧 Configuração de Desenvolvimento

### Variáveis de Ambiente

```env
# Banco de Dados
DATABASE_URL=postgresql://...

# Ambiente
NODE_ENV=development

# Sessão
SESSION_SECRET=chave-secreta-minimo-32-caracteres  # Gere com: npm run generate:secret

# Porta (opcional, padrão: 5000)
PORT=5000
```

## 🐛 Troubleshooting

### Erro de conexão com banco de dados
- Verifique se o PostgreSQL está rodando
- Confirme que a `DATABASE_URL` está correta
- Teste a conexão com um cliente PostgreSQL

### Erro ao criar tabelas
- Execute `npm run db:push` novamente
- Verifique as permissões do usuário do banco
- Confira os logs para erros específicos

### Problemas de autenticação
- Limpe os cookies do navegador
- Verifique se o `SESSION_SECRET` está configurado
- Confirme que as sessões estão sendo salvas no banco

### WebSocket não conecta
- Verifique se está usando HTTPS em produção
- Confirme que o firewall permite conexões WebSocket
- Teste a conexão em diferentes navegadores

## 📄 Licença

Este projeto está sob a licença MIT.

## 👥 Suporte

Para suporte e dúvidas:
- Consulte a documentação em [RENDER_DEPLOY.md](./RENDER_DEPLOY.md)
- Verifique os logs da aplicação
- Abra uma issue no repositório

## 🎯 Próximos Passos

Após o deploy:

1. ✅ Faça login com as credenciais do super admin
2. ✅ Altere a senha padrão
3. ✅ Cadastre seu primeiro restaurante
4. ✅ Aprove o restaurante como super admin
5. ✅ Configure o menu e mesas
6. ✅ Teste os pedidos via QR code
7. ✅ Configure notificações em tempo real

---

Desenvolvido com ❤️ para modernizar a gestão de restaurantes
