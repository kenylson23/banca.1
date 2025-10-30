# Sistema de Cache Busting Automático

Este documento explica como o sistema de atualização automática funciona e como garantir que os usuários sempre vejam a versão mais recente após um deploy.

## Como Funciona

O sistema implementa as seguintes funcionalidades:

### 1. Versionamento Automático do Service Worker
- Cada build gera uma versão única baseada em timestamp
- O Service Worker usa essa versão para nomear os caches
- Quando uma nova versão é detectada, os caches antigos são automaticamente deletados

### 2. Verificação Periódica de Atualizações
- O frontend verifica automaticamente a cada 60 segundos se há uma nova versão
- Quando detecta atualização, mostra uma notificação toast elegante
- O usuário pode clicar em "Atualizar" para aplicar imediatamente

### 3. Headers HTTP Anti-Cache
- Os arquivos `sw.js` e `version.json` são servidos com headers que impedem cache
- Isso garante que o navegador sempre busque a versão mais recente desses arquivos

### 4. Notificação de Atualização
- Toast não-intrusivo aparece quando há nova versão
- Botão "Atualizar" aplica a atualização instantaneamente
- Nenhuma necessidade de Ctrl+Shift+R manual

## Como Usar

### Workflow Completo para Deploy

O processo de deploy requer três passos para garantir que tudo funcione corretamente:

```bash
# 1. Atualizar a versão no Service Worker
./scripts/update-version.sh

# 2. Fazer o build
npm run build

# 3. Restaurar o placeholder para o próximo deploy
./scripts/restore-version-placeholder.sh
```

**OU** em uma única linha:

```bash
./scripts/update-version.sh && npm run build && ./scripts/restore-version-placeholder.sh
```

### Configuração no Render (Recomendado)

Configure o Render para executar automaticamente o workflow completo:

**Build Command:**
```bash
./scripts/update-version.sh && npm run build && ./scripts/restore-version-placeholder.sh
```

**IMPORTANTE:** A restauração do placeholder é essencial para que o próximo deploy funcione corretamente.

### Por que Restaurar o Placeholder?

O arquivo `sw.js` contém um placeholder `__VERSION__` que é substituído pelo timestamp durante o build. Após o build, precisamos restaurar esse placeholder para que o próximo deploy possa substituí-lo novamente. Sem isso, todos os deploys usariam a mesma versão antiga.

## Arquivos Modificados

- `client/public/sw.js` - Service Worker com versionamento dinâmico
- `client/src/registerServiceWorker.ts` - Verificação periódica e detecção de atualizações
- `client/src/components/UpdateNotification.tsx` - Toast de notificação
- `server/index.ts` - Headers HTTP anti-cache
- `scripts/update-version.sh` - Script de versionamento

## Testando Localmente

1. Faça uma alteração no código
2. Execute: `./scripts/update-version.sh && npm run build`
3. Faça deploy ou reinicie o servidor de produção
4. Abra o app em outro navegador/aba
5. Aguarde até 60 segundos - você verá a notificação de atualização

## Solução de Problemas

### Usuários ainda veem versão antiga após deploy

1. Verifique se o script `update-version.sh` foi executado antes do build
2. Confirme que o arquivo `sw.js` contém uma versão real (não `__VERSION__`)
3. Force um hard reload uma vez: Ctrl+Shift+R
4. Após isso, todas as atualizações futuras serão automáticas

### Notificação de atualização não aparece

1. Abra o DevTools Console e procure por mensagens do Service Worker
2. Verifique se o Service Worker está registrado: `chrome://serviceworker-internals`
3. Confirme que a verificação periódica está funcionando (logs no console)

## Benefícios

✅ **Fim dos problemas de cache** - Usuários sempre veem a versão mais recente
✅ **Experiência profissional** - Notificações elegantes em vez de páginas quebradas  
✅ **Atualização automática** - Nenhuma intervenção manual necessária
✅ **Deploy confiável** - Cada deploy gera uma nova versão única
✅ **Compatível com PWA** - Funciona perfeitamente com Progressive Web Apps
