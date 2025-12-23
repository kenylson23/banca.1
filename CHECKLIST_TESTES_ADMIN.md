# Checklist de Testes - Painel Administrativo de Restaurantes

## 📋 Visão Geral
Este documento contém uma checklist completa para testar todas as funcionalidades do painel administrativo do sistema Na Bancada.

**Data de Criação:** 23/12/2025  
**Última Atualização:** 23/12/2025

---

## 1. 🔐 Autenticação e Acesso

### 1.1 Login
- [ ] Login com credenciais válidas (admin/gerente/garçom)
- [ ] Login com credenciais inválidas (deve exibir erro)
- [ ] Campos obrigatórios (email e senha)
- [ ] Redirecionamento após login bem-sucedido
- [ ] Mensagem de erro em caso de falha
- [ ] Persistência de sessão após recarregar página
- [ ] Logout funcional

### 1.2 Permissões por Papel
- [ ] **Admin:** Acesso a todas as funcionalidades
- [ ] **Gerente:** Acesso limitado (sem configurações críticas)
- [ ] **Garçom:** Acesso apenas a PDV e pedidos
- [ ] Bloqueio de rotas não autorizadas por papel
- [ ] Redirecionamento ao tentar acessar rota sem permissão

---

## 2. 📊 Dashboard Principal

### 2.1 KPIs e Indicadores
- [ ] Total de vendas do dia exibido corretamente
- [ ] Número de pedidos do dia
- [ ] Ticket médio calculado corretamente
- [ ] Taxa de ocupação de mesas atualizada
- [ ] Comparação com período anterior (%)
- [ ] Gráficos carregam sem erro
- [ ] Atualização em tempo real (WebSocket)

### 2.2 Gráficos e Visualizações
- [ ] Gráfico de vendas por dia funcional
- [ ] Gráfico de pedidos por tipo (mesa/delivery/takeout)
- [ ] Gráfico de status dos pedidos
- [ ] Responsividade em mobile e tablet
- [ ] Tooltips com informações corretas
- [ ] Exportação de dados (se disponível)

### 2.3 Filtros de Período
- [ ] Filtro "Hoje" funcional
- [ ] Filtro "Esta Semana" funcional
- [ ] Filtro "Este Mês" funcional
- [ ] Filtro personalizado com datas específicas
- [ ] Dados atualizados ao alterar filtro

---

## 3. 🍽️ Gestão de Produtos (Menu)

### 3.1 Visualização de Itens
- [ ] Lista de produtos carrega corretamente
- [ ] Imagens dos produtos exibidas
- [ ] Preços formatados corretamente
- [ ] Status (disponível/indisponível) visível
- [ ] Categorias organizadas corretamente
- [ ] Busca por nome funcional
- [ ] Filtro por categoria funcional

### 3.2 Criar Novo Item
- [ ] Formulário de criação abre corretamente
- [ ] Campos obrigatórios validados (nome, preço)
- [ ] Upload de imagem funcional (jpg, png, webp)
- [ ] Pré-visualização da imagem carregada
- [ ] Seleção de categoria
- [ ] Campo descrição aceita texto longo
- [ ] Botão salvar cria item com sucesso
- [ ] Mensagem de sucesso exibida
- [ ] Lista atualiza automaticamente após criação

### 3.3 Editar Item
- [ ] Modal de edição abre com dados preenchidos
- [ ] Alteração de nome salva corretamente
- [ ] Alteração de preço salva corretamente
- [ ] Troca de imagem funcional
- [ ] Alteração de categoria funcional
- [ ] Alteração de disponibilidade (ativo/inativo)
- [ ] Botão cancelar descarta alterações
- [ ] Validação de campos obrigatórios

### 3.4 Excluir Item
- [ ] Modal de confirmação exibido
- [ ] Exclusão bem-sucedida
- [ ] Mensagem de confirmação
- [ ] Item removido da lista imediatamente
- [ ] Não permite excluir item com pedidos ativos

### 3.5 Opções Personalizáveis
- [ ] Criar opção (ex: tamanho, adicionais)
- [ ] Associar opção a produto
- [ ] Definir preço adicional
- [ ] Marcar opção como obrigatória
- [ ] Editar opções existentes
- [ ] Excluir opções
- [ ] Opções aparecem no menu público

### 3.6 Categorias
- [ ] Criar nova categoria
- [ ] Editar categoria existente
- [ ] Excluir categoria vazia
- [ ] Não permite excluir categoria com produtos
- [ ] Reordenação de categorias (drag-and-drop)
- [ ] Ícone/imagem da categoria (se disponível)

### 3.7 Receitas
- [ ] Criar receita com ingredientes
- [ ] Associar receita a produto
- [ ] Calcular custo baseado em ingredientes
- [ ] Editar receitas existentes
- [ ] Visualizar margem de lucro

### 3.8 Visualizar Menu Público
- [ ] Botão "Visualizar Menu Público" funcional
- [ ] Abre menu público em nova aba/página
- [ ] Menu exibe produtos corretos
- [ ] Preços e imagens aparecem corretamente

---

## 4. 🪑 Controle de Mesas

### 4.1 Visualização de Mesas
- [ ] Lista de todas as mesas exibida
- [ ] Status visual correto (livre/ocupada/reservada)
- [ ] Número de convidados por mesa
- [ ] Tempo de ocupação exibido
- [ ] Layout visual do salão (se disponível)
- [ ] Atualização em tempo real do status

### 4.2 Criar/Editar Mesas
- [ ] Criar nova mesa com número único
- [ ] Definir capacidade da mesa
- [ ] Definir posição no layout
- [ ] Editar informações de mesa existente
- [ ] Excluir mesa sem pedidos ativos
- [ ] Validação de número duplicado

### 4.3 Gerenciar Ocupação
- [ ] Marcar mesa como ocupada
- [ ] Definir número de convidados
- [ ] Transferir convidados entre mesas
- [ ] Dividir conta entre convidados
- [ ] Mesclar mesas
- [ ] Liberar mesa após pagamento

### 4.4 Pedidos na Mesa
- [ ] Visualizar pedidos ativos da mesa
- [ ] Adicionar novo pedido à mesa
- [ ] Editar pedidos pendentes
- [ ] Cancelar pedidos com motivo
- [ ] Visualizar histórico de pedidos
- [ ] Total da conta atualizado automaticamente

---

## 5. 💰 PDV (Ponto de Venda)

### 5.1 Criar Novo Pedido
- [ ] Modal de novo pedido abre corretamente
- [ ] Seleção de tipo (mesa/delivery/takeout)
- [ ] Busca de produtos funcional
- [ ] Adicionar produto ao carrinho
- [ ] Ajustar quantidade de produtos
- [ ] Aplicar opções personalizáveis
- [ ] Adicionar observações ao item
- [ ] Remover item do carrinho

### 5.2 Aplicar Descontos e Cupons
- [ ] Campo de cupom aceita códigos
- [ ] Validação de cupom (existente/válido)
- [ ] Desconto percentual aplicado corretamente
- [ ] Desconto fixo aplicado corretamente
- [ ] Limite de uso respeitado
- [ ] Cupom removido após aplicação
- [ ] Mensagem de erro para cupom inválido

### 5.3 Identificar Cliente
- [ ] Busca de cliente por telefone
- [ ] Criar novo cliente inline
- [ ] Associar pontos de fidelidade
- [ ] Exibir histórico de compras do cliente
- [ ] Aplicar descontos de fidelidade

### 5.4 Finalizar Pedido
- [ ] Revisar itens antes de confirmar
- [ ] Calcular total corretamente
- [ ] Selecionar forma de pagamento
- [ ] Processar pagamento
- [ ] Gerar comprovante
- [ ] Imprimir pedido (cozinha/bar)
- [ ] Enviar pedido para produção

### 5.5 Pedidos Ativos
- [ ] Lista de pedidos em andamento
- [ ] Filtro por status
- [ ] Filtro por tipo
- [ ] Visualizar detalhes do pedido
- [ ] Atualizar status do pedido
- [ ] Cancelar pedido com justificativa

---

## 6. 👨‍🍳 Cozinha

### 6.1 Visualização de Pedidos
- [ ] Pedidos pendentes exibidos
- [ ] Pedidos em preparo destacados
- [ ] Tempo desde criação do pedido
- [ ] Prioridade visual (pedidos mais antigos)
- [ ] Som de notificação para novos pedidos
- [ ] Atualização em tempo real

### 6.2 Gerenciar Pedidos
- [ ] Iniciar preparo de pedido
- [ ] Marcar item como pronto
- [ ] Marcar pedido completo como pronto
- [ ] Notificar garçom quando pronto
- [ ] Visualizar observações especiais
- [ ] Filtro por categoria de produto

### 6.3 Impressão
- [ ] Imprimir pedido automaticamente
- [ ] Reimprimir pedido manualmente
- [ ] Configurar impressora da cozinha
- [ ] Testar impressora

---

## 7. 👥 Gestão de Clientes

### 7.1 Lista de Clientes
- [ ] Visualizar todos os clientes
- [ ] Busca por nome funcional
- [ ] Busca por telefone funcional
- [ ] Filtro por cliente ativo/inativo
- [ ] Ordenação por diferentes campos
- [ ] Paginação funcional

### 7.2 Adicionar Cliente
- [ ] Formulário de criação abre
- [ ] Campos obrigatórios validados (nome, telefone)
- [ ] Validação de formato de telefone
- [ ] Validação de email (opcional)
- [ ] Salvar cliente com sucesso
- [ ] Não permite telefone duplicado

### 7.3 Editar Cliente
- [ ] Modal de edição carrega dados
- [ ] Atualizar informações básicas
- [ ] Adicionar endereço de entrega
- [ ] Alterar status (ativo/inativo)
- [ ] Salvar alterações

### 7.4 Histórico do Cliente
- [ ] Visualizar pedidos anteriores
- [ ] Visualizar gastos totais
- [ ] Visualizar pontos de fidelidade
- [ ] Ver cupons utilizados
- [ ] Exportar histórico

### 7.5 Estatísticas
- [ ] Total de clientes cadastrados
- [ ] Clientes ativos no mês
- [ ] Novos clientes no período
- [ ] Top clientes por valor gasto

---

## 8. 🎟️ Cupons de Desconto

### 8.1 Listar Cupons
- [ ] Visualizar todos os cupons
- [ ] Filtro por status (ativo/inativo/expirado)
- [ ] Busca por código
- [ ] Visualizar estatísticas de uso
- [ ] Ordenação por data

### 8.2 Criar Cupom
- [ ] Gerar código automático
- [ ] Inserir código manualmente
- [ ] Definir tipo (percentual/fixo)
- [ ] Definir valor do desconto
- [ ] Definir limite de uso
- [ ] Definir data de validade
- [ ] Definir valor mínimo de pedido
- [ ] Salvar cupom

### 8.3 Editar Cupom
- [ ] Alterar valor do desconto
- [ ] Alterar limite de uso
- [ ] Alterar data de validade
- [ ] Ativar/desativar cupom
- [ ] Não permite editar cupom em uso

### 8.4 Excluir Cupom
- [ ] Excluir cupom sem uso
- [ ] Não permite excluir cupom com histórico
- [ ] Confirmação antes de excluir

### 8.5 Estatísticas
- [ ] Total de cupons ativos
- [ ] Total de usos
- [ ] Desconto total concedido
- [ ] Cupons mais utilizados

---

## 9. 🏆 Programa de Fidelidade

### 9.1 Configurações do Programa
- [ ] Ativar/desativar programa de fidelidade
- [ ] Definir pontos por valor gasto (ex: 1 ponto por AOA)
- [ ] Definir valor de resgate (ex: 100 pontos = 10 AOA)
- [ ] Configurar bônus de cadastro
- [ ] Salvar configurações

### 9.2 Transações de Pontos
- [ ] Visualizar histórico de pontos
- [ ] Filtro por cliente
- [ ] Filtro por período
- [ ] Ver pontos ganhos vs resgatados
- [ ] Adicionar pontos manualmente (bônus)
- [ ] Remover pontos (ajuste)

### 9.3 Estatísticas
- [ ] Total de clientes participantes
- [ ] Total de pontos emitidos
- [ ] Total de pontos resgatados
- [ ] Taxa de engajamento

---

## 10. 👤 Gestão de Usuários

### 10.1 Listar Usuários
- [ ] Visualizar todos os usuários do restaurante
- [ ] Filtro por papel (admin/gerente/garçom)
- [ ] Filtro por status (ativo/inativo)
- [ ] Busca por nome ou email
- [ ] Ver último login

### 10.2 Criar Usuário
- [ ] Formulário de criação abre
- [ ] Campos obrigatórios validados
- [ ] Seleção de papel (role)
- [ ] Definir filial (branch)
- [ ] Gerar senha temporária
- [ ] Enviar credenciais por email (opcional)
- [ ] Salvar usuário

### 10.3 Editar Usuário
- [ ] Alterar nome
- [ ] Alterar email
- [ ] Alterar papel
- [ ] Alterar filial
- [ ] Redefinir senha
- [ ] Ativar/desativar usuário
- [ ] Salvar alterações

### 10.4 Permissões
- [ ] Admin vê todos os usuários
- [ ] Gerente vê apenas usuários da filial
- [ ] Garçom não tem acesso à gestão de usuários
- [ ] Não permite auto-exclusão
- [ ] Não permite rebaixar último admin

### 10.5 Excluir Usuário
- [ ] Confirmação antes de excluir
- [ ] Verificar se tem pedidos ativos
- [ ] Exclusão bem-sucedida
- [ ] Usuário removido da lista

---

## 11. 🏢 Gestão de Filiais

### 11.1 Listar Filiais
- [ ] Visualizar todas as filiais
- [ ] Filial principal destacada
- [ ] Ver status (ativa/inativa)
- [ ] Ver endereço e telefone
- [ ] Estatísticas por filial (vendas, pedidos)

### 11.2 Criar Filial
- [ ] Formulário de criação
- [ ] Nome obrigatório
- [ ] Endereço completo
- [ ] Telefone de contato
- [ ] Definir como filial principal (apenas uma)
- [ ] Status inicial (ativa/inativa)
- [ ] Salvar filial

### 11.3 Editar Filial
- [ ] Alterar nome
- [ ] Alterar endereço
- [ ] Alterar telefone
- [ ] Alterar status
- [ ] Promover a filial principal
- [ ] Salvar alterações

### 11.4 Excluir Filial
- [ ] Não permite excluir filial principal
- [ ] Não permite excluir filial com dados ativos
- [ ] Confirmação antes de excluir
- [ ] Exclusão bem-sucedida

### 11.5 Seletor de Filial
- [ ] Dropdown de seleção no cabeçalho
- [ ] Filtrar dados por filial selecionada
- [ ] Dashboard atualiza ao trocar filial
- [ ] Persistir seleção na sessão

---

## 12. 💵 Módulo Financeiro

### 12.1 Dashboard Financeiro
- [ ] Total de receitas exibido
- [ ] Total de despesas exibido
- [ ] Saldo líquido calculado
- [ ] Gráfico de receitas vs despesas
- [ ] Gráfico de evolução mensal
- [ ] Filtros por período funcionais

### 12.2 Caixas (Registradoras)
- [ ] Listar todos os caixas
- [ ] Criar novo caixa
- [ ] Editar caixa existente
- [ ] Ativar/desativar caixa
- [ ] Ver saldo atual do caixa
- [ ] Excluir caixa sem transações

### 12.3 Turnos de Caixa
- [ ] Abrir turno de caixa
- [ ] Definir valor inicial (fundo de caixa)
- [ ] Registrar vendas no turno
- [ ] Visualizar transações do turno
- [ ] Fechar turno de caixa
- [ ] Conferir valor esperado vs real
- [ ] Registrar diferença (sangria/suprimento)
- [ ] Imprimir relatório de fechamento

### 12.4 Categorias Financeiras
- [ ] Listar categorias de receita
- [ ] Listar categorias de despesa
- [ ] Criar nova categoria
- [ ] Editar categoria existente
- [ ] Excluir categoria sem transações
- [ ] Não permite excluir categoria em uso

### 12.5 Transações
- [ ] Visualizar todas as transações
- [ ] Filtro por tipo (receita/despesa)
- [ ] Filtro por categoria
- [ ] Filtro por período
- [ ] Filtro por forma de pagamento
- [ ] Busca por descrição
- [ ] Ordenação por data/valor

### 12.6 Nova Transação
- [ ] Formulário de criação
- [ ] Selecionar tipo (receita/despesa)
- [ ] Selecionar categoria
- [ ] Inserir valor
- [ ] Inserir descrição
- [ ] Selecionar forma de pagamento
- [ ] Selecionar caixa/conta
- [ ] Definir data da transação
- [ ] Anexar comprovante (opcional)
- [ ] Salvar transação

### 12.7 Editar Transação
- [ ] Modal de edição carrega dados
- [ ] Alterar informações
- [ ] Salvar alterações
- [ ] Validações aplicadas

### 12.8 Excluir Transação
- [ ] Confirmação antes de excluir
- [ ] Exclusão bem-sucedida
- [ ] Saldo atualizado automaticamente

### 12.9 Relatórios Financeiros
- [ ] Relatório de fluxo de caixa
- [ ] Relatório DRE (Demonstração de Resultados)
- [ ] Relatório por categoria
- [ ] Relatório por forma de pagamento
- [ ] Exportar PDF
- [ ] Exportar Excel/CSV
- [ ] Filtros de período aplicados

---

## 13. 📈 Relatórios e Análises

### 13.1 Relatório de Vendas
- [ ] Visualizar vendas totais
- [ ] Vendas por período
- [ ] Vendas por tipo de pedido
- [ ] Vendas por produto
- [ ] Vendas por categoria
- [ ] Vendas por garçom/atendente
- [ ] Ticket médio
- [ ] Exportar relatório

### 13.2 Relatório de Produtos
- [ ] Produtos mais vendidos
- [ ] Produtos menos vendidos
- [ ] Receita por produto
- [ ] Margem de lucro por produto
- [ ] Análise ABC de produtos
- [ ] Gráfico de desempenho

### 13.3 Relatório de Clientes
- [ ] Clientes mais frequentes
- [ ] Clientes com maior gasto
- [ ] Taxa de retenção
- [ ] Novos clientes no período
- [ ] Ticket médio por cliente

### 13.4 Relatório de Desempenho
- [ ] Tempo médio de preparo
- [ ] Tempo médio de entrega
- [ ] Taxa de cancelamento
- [ ] Pedidos por hora do dia
- [ ] Dias/horários de pico

### 13.5 Exportação
- [ ] Exportar para PDF
- [ ] Exportar para Excel
- [ ] Exportar para CSV
- [ ] Enviar por email

---

## 14. ⚙️ Configurações

### 14.1 Informações do Restaurante
- [ ] Editar nome do restaurante
- [ ] Editar endereço
- [ ] Editar telefone
- [ ] Editar email de contato
- [ ] Upload de logo
- [ ] Upload de imagem hero/banner
- [ ] Salvar alterações

### 14.2 Link Público e QR Code
- [ ] Definir slug único (URL amigável)
- [ ] Validação de slug disponível
- [ ] Gerar QR Code automaticamente
- [ ] Baixar QR Code em PNG
- [ ] Baixar QR Code em SVG
- [ ] Copiar link público
- [ ] Testar link público

### 14.3 Horário de Funcionamento
- [ ] Definir horários por dia da semana
- [ ] Adicionar múltiplos turnos por dia
- [ ] Marcar dias fechados
- [ ] Definir horário de delivery
- [ ] Salvar horários
- [ ] Validação de intervalos

### 14.4 Aparência do Menu Público
- [ ] Escolher cor primária
- [ ] Escolher cor secundária
- [ ] Pré-visualizar cores
- [ ] Escolher tema (claro/escuro)
- [ ] Upload de logo personalizado
- [ ] Salvar preferências

### 14.5 Notificações
- [ ] Configurar notificações de pedidos
- [ ] Configurar notificações por email
- [ ] Configurar notificações por WhatsApp (se disponível)
- [ ] Ativar/desativar sons
- [ ] Salvar preferências

### 14.6 Impressoras
- [ ] Adicionar nova impressora
- [ ] Configurar IP da impressora
- [ ] Testar conexão
- [ ] Definir impressora padrão
- [ ] Configurar impressoras por setor (cozinha/bar/caixa)
- [ ] Excluir impressora

### 14.7 Formas de Pagamento
- [ ] Ativar/desativar dinheiro
- [ ] Ativar/desativar cartão de crédito
- [ ] Ativar/desativar cartão de débito
- [ ] Ativar/desativar PIX
- [ ] Configurar taxa de cartão
- [ ] Adicionar forma de pagamento personalizada

---

## 15. 📊 Assinatura e Plano

### 15.1 Visualizar Plano Atual
- [ ] Nome do plano exibido
- [ ] Recursos incluídos listados
- [ ] Data de renovação
- [ ] Valor da mensalidade
- [ ] Status da assinatura (ativa/expirada)

### 15.2 Limites do Plano
- [ ] Ver limite de usuários
- [ ] Ver limite de pedidos/mês
- [ ] Ver limite de produtos
- [ ] Ver limite de filiais
- [ ] Ver uso atual vs limite

### 15.3 Upgrade/Downgrade
- [ ] Visualizar planos disponíveis
- [ ] Comparar recursos entre planos
- [ ] Solicitar upgrade
- [ ] Solicitar downgrade (se aplicável)
- [ ] Cálculo proporcional

### 15.4 Pagamento
- [ ] Visualizar histórico de pagamentos
- [ ] Baixar faturas
- [ ] Atualizar forma de pagamento
- [ ] Ver próxima cobrança

### 15.5 Alertas
- [ ] Alerta de plano próximo ao vencimento
- [ ] Alerta de limite de recursos atingido
- [ ] Bloqueio por falta de pagamento

---

## 16. 🔔 Notificações

### 16.1 Central de Notificações
- [ ] Ícone de notificação no cabeçalho
- [ ] Badge com quantidade de não lidas
- [ ] Dropdown com lista de notificações
- [ ] Marcar como lida
- [ ] Marcar todas como lidas
- [ ] Excluir notificação

### 16.2 Tipos de Notificações
- [ ] Novo pedido recebido
- [ ] Pedido pronto para servir
- [ ] Pagamento recebido
- [ ] Mesa liberada
- [ ] Cliente identificado
- [ ] Cupom aplicado
- [ ] Limite de plano atingido

### 16.3 Som e Alertas
- [ ] Som para novo pedido
- [ ] Som para pedido pronto
- [ ] Vibração em dispositivos móveis (se aplicável)
- [ ] Notificação desktop (se habilitada)

---

## 17. 📱 Responsividade e UX

### 17.1 Desktop (1920x1080)
- [ ] Layout otimizado para telas grandes
- [ ] Sidebar visível
- [ ] Tabelas com todas as colunas
- [ ] Gráficos em tamanho completo
- [ ] Sem scroll horizontal

### 17.2 Tablet (768x1024)
- [ ] Layout adaptado para tablet
- [ ] Sidebar colapsável
- [ ] Tabelas responsivas
- [ ] Botões de ação acessíveis
- [ ] Navegação fluida

### 17.3 Mobile (375x667)
- [ ] Menu hambúrguer funcional
- [ ] Navegação inferior (bottom nav)
- [ ] Tabelas em cards/lista
- [ ] Formulários otimizados
- [ ] Botões de ação flutuantes (FAB)
- [ ] Sem elementos cortados
- [ ] Touch gestures funcionais

### 17.4 Acessibilidade
- [ ] Navegação por teclado
- [ ] Foco visível em elementos
- [ ] Labels em formulários
- [ ] Contraste adequado
- [ ] Textos alternativos em imagens
- [ ] ARIA labels quando necessário

---

## 18. 🌐 Integração e Tempo Real

### 18.1 WebSocket
- [ ] Conexão WebSocket estabelecida
- [ ] Indicador de conexão online/offline
- [ ] Reconexão automática
- [ ] Atualização de pedidos em tempo real
- [ ] Atualização de mesas em tempo real
- [ ] Atualização de status em tempo real

### 18.2 Sincronização Multi-Usuário
- [ ] Alterações de um usuário refletem para outros
- [ ] Pedidos criados aparecem em todos os dispositivos
- [ ] Status de mesa atualiza para todos
- [ ] Conflitos de edição tratados

### 18.3 Modo Offline (se aplicável)
- [ ] Detectar perda de conexão
- [ ] Salvar dados localmente
- [ ] Sincronizar ao reconectar
- [ ] Indicador de modo offline

---

## 19. 🖨️ Impressão

### 19.1 Impressão de Pedidos
- [ ] Imprimir pedido na cozinha
- [ ] Imprimir pedido no bar
- [ ] Imprimir comprovante para cliente
- [ ] Layout de impressão formatado
- [ ] Logo do restaurante na impressão
- [ ] Informações completas do pedido

### 19.2 Impressão de Relatórios
- [ ] Imprimir fechamento de caixa
- [ ] Imprimir relatório de vendas
- [ ] Imprimir relatório financeiro
- [ ] Formatação adequada
- [ ] Cabeçalho e rodapé

### 19.3 Configuração de Impressoras
- [ ] Testar impressora
- [ ] Ver status da impressora
- [ ] Reimprimir último documento
- [ ] Configurar largura do papel

---

## 20. 🔍 Busca e Filtros

### 20.1 Busca Global
- [ ] Campo de busca no cabeçalho
- [ ] Buscar produtos
- [ ] Buscar clientes
- [ ] Buscar pedidos
- [ ] Resultados instantâneos
- [ ] Navegação para resultado

### 20.2 Filtros Avançados
- [ ] Múltiplos filtros simultâneos
- [ ] Filtros salvos (favoritos)
- [ ] Limpar todos os filtros
- [ ] Contador de resultados
- [ ] Exportar resultados filtrados

---

## 21. 🔒 Segurança

### 21.1 Proteção de Dados
- [ ] Senhas criptografadas
- [ ] Sessões expiram após inatividade
- [ ] Dados sensíveis mascarados
- [ ] Logs de auditoria (quem fez o quê)

### 21.2 Validações
- [ ] Proteção contra SQL injection
- [ ] Proteção contra XSS
- [ ] Validação de entrada em todos os campos
- [ ] Rate limiting em APIs
- [ ] CSRF tokens

---

## 22. ⚡ Performance

### 22.1 Carregamento
- [ ] Página inicial carrega em < 3 segundos
- [ ] Imagens otimizadas (lazy loading)
- [ ] Cache de dados estáticos
- [ ] Skeleton loaders enquanto carrega
- [ ] Paginação em listas grandes

### 22.2 Otimização
- [ ] Sem memory leaks
- [ ] Debounce em buscas
- [ ] Throttle em scroll events
- [ ] Bundle size otimizado
- [ ] Code splitting aplicado

---

## 23. 🐛 Tratamento de Erros

### 23.1 Erros de Formulário
- [ ] Mensagens de erro claras
- [ ] Campos inválidos destacados
- [ ] Validação em tempo real
- [ ] Mensagem de sucesso após salvar

### 23.2 Erros de Rede
- [ ] Mensagem quando servidor indisponível
- [ ] Retry automático
- [ ] Botão de tentar novamente
- [ ] Indicador de carregamento

### 23.3 Erros de Permissão
- [ ] Mensagem de acesso negado
- [ ] Redirecionamento para página adequada
- [ ] Não expor funcionalidades sem permissão

---

## 24. 📊 Analytics e Rastreamento

### 24.1 Analytics do Menu Público
- [ ] Visualizações de produtos
- [ ] Cliques em produtos
- [ ] Taxa de conversão (visualização → pedido)
- [ ] Origem dos acessos (QR Code, link direto)
- [ ] Horários de maior acesso

### 24.2 Métricas Internas
- [ ] Tempo médio de atendimento
- [ ] Pedidos por usuário
- [ ] Taxa de cancelamento por motivo
- [ ] Produtos mais/menos vendidos

---

## ✅ Checklist de Aprovação Final

### Antes de Ir para Produção
- [ ] Todos os testes críticos passaram
- [ ] Sem erros de console
- [ ] Sem warnings de segurança
- [ ] Responsividade testada em todos os dispositivos
- [ ] Performance aceitável
- [ ] Backup de dados realizado
- [ ] Documentação atualizada
- [ ] Treinamento da equipe realizado

---

## 📝 Observações e Bugs Encontrados

### Template para Reportar Bugs

**ID:** [Número sequencial]  
**Data:** [Data da descoberta]  
**Módulo:** [Ex: PDV, Menu, Cozinha]  
**Severidade:** [Crítica / Alta / Média / Baixa]  
**Descrição:** [Descrição detalhada do problema]  
**Passos para Reproduzir:**
1. [Passo 1]
2. [Passo 2]
3. [Passo 3]

**Comportamento Esperado:** [O que deveria acontecer]  
**Comportamento Atual:** [O que está acontecendo]  
**Screenshot/Vídeo:** [Se aplicável]  
**Navegador/Dispositivo:** [Ex: Chrome 120 / iPhone 14]  
**Status:** [Pendente / Em análise / Corrigido / Não é bug]  

---

## 📞 Contatos e Suporte

**Desenvolvedor Responsável:** [Nome]  
**Email:** [email@exemplo.com]  
**Telefone:** [+244 XXX XXX XXX]  

---

**Última Atualização:** 23/12/2025  
**Versão do Documento:** 1.0  
**Versão do Sistema:** [Inserir versão]

