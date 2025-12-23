# Casos de Teste Detalhados - Módulos Complexos

## 📋 Visão Geral
Este documento contém casos de teste detalhados e estruturados para os módulos mais complexos do sistema Na Bancada: PDV, Controle de Mesas e Módulo Financeiro.

**Data de Criação:** 23/12/2025  
**Última Atualização:** 23/12/2025

---

# 🏪 MÓDULO 1: PDV (Ponto de Venda)

## TC-PDV-001: Criar Pedido Simples para Mesa

### Informações Gerais
- **Prioridade:** Alta
- **Severidade:** Crítica
- **Tipo:** Funcional
- **Automação:** Sim

### Pré-condições
- Usuário autenticado com permissão de PDV
- Restaurante tem produtos cadastrados e disponíveis
- Existe pelo menos uma mesa disponível
- Impressora configurada (opcional)

### Dados de Teste
```json
{
  "mesa": "Mesa 5",
  "produtos": [
    { "nome": "Hambúrguer Clássico", "quantidade": 2, "preco": 1500 },
    { "nome": "Refrigerante Coca-Cola", "quantidade": 2, "preco": 300 }
  ],
  "total_esperado": 3600
}
```

### Passos de Execução

| # | Ação | Resultado Esperado |
|---|------|-------------------|
| 1 | Acessar página `/pdv` | Página PDV carrega com botão "Novo Pedido" visível |
| 2 | Clicar em "Novo Pedido" | Modal de novo pedido abre |
| 3 | Selecionar tipo "Mesa" | Campo de seleção de mesa aparece |
| 4 | Selecionar "Mesa 5" | Mesa 5 selecionada, lista de produtos exibida |
| 5 | Buscar "Hambúrguer" na busca | Lista filtra mostrando hambúrgueres |
| 6 | Clicar em "Hambúrguer Clássico" | Produto adicionado ao carrinho com qtd = 1 |
| 7 | Clicar no botão "+" do produto | Quantidade atualiza para 2 |
| 8 | Buscar "Refrigerante" | Lista filtra mostrando refrigerantes |
| 9 | Clicar em "Refrigerante Coca-Cola" | Produto adicionado ao carrinho |
| 10 | Clicar no botão "+" do refrigerante | Quantidade atualiza para 2 |
| 11 | Verificar total no rodapé | Total exibe "3.600,00 AOA" |
| 12 | Clicar em "Finalizar Pedido" | Modal de confirmação aparece |
| 13 | Clicar em "Confirmar" | Pedido criado, mensagem de sucesso exibida |
| 14 | Verificar lista de pedidos ativos | Novo pedido aparece na lista com status "Pendente" |

### Validações
- [ ] Total calculado corretamente (2×1500 + 2×300 = 3600)
- [ ] Pedido aparece na lista de pedidos ativos
- [ ] Status inicial é "Pendente"
- [ ] Mesa 5 aparece como ocupada no módulo de mesas
- [ ] Pedido enviado para cozinha (se impressora configurada)
- [ ] Notificação WebSocket enviada para cozinha

### Dados de Pós-Teste
- Pedido ID registrado para testes subsequentes
- Mesa 5 deve ser liberada após conclusão dos testes

---

## TC-PDV-002: Aplicar Cupom de Desconto Percentual

### Informações Gerais
- **Prioridade:** Alta
- **Severidade:** Alta
- **Tipo:** Funcional
- **Dependências:** TC-PDV-001

### Pré-condições
- Cupom "DESCONTO20" cadastrado com:
  - Tipo: Percentual
  - Valor: 20%
  - Status: Ativo
  - Limite de uso: 100
  - Valor mínimo do pedido: 2000 AOA

### Dados de Teste
```json
{
  "cupom": "DESCONTO20",
  "subtotal": 5000,
  "desconto_esperado": 1000,
  "total_esperado": 4000
}
```

### Passos de Execução

| # | Ação | Resultado Esperado |
|---|------|-------------------|
| 1 | Criar pedido com subtotal de 5000 AOA | Carrinho mostra subtotal 5.000,00 AOA |
| 2 | Localizar campo "Cupom de Desconto" | Campo de texto visível no carrinho |
| 3 | Digitar "DESCONTO20" | Texto inserido no campo |
| 4 | Clicar em "Aplicar" | Sistema valida o cupom |
| 5 | Aguardar resposta | Mensagem "Cupom aplicado com sucesso!" |
| 6 | Verificar linha de desconto | Nova linha "Desconto (20%): -1.000,00 AOA" |
| 7 | Verificar total | Total atualizado para "4.000,00 AOA" |
| 8 | Tentar aplicar outro cupom | Botão "Aplicar" desabilitado ou mensagem de erro |
| 9 | Clicar em "Remover Cupom" (X) | Desconto removido, total volta para 5.000,00 AOA |
| 10 | Reaplicar cupom "DESCONTO20" | Cupom aplicado novamente |
| 11 | Finalizar pedido | Pedido criado com desconto registrado |
| 12 | Verificar detalhes do pedido | Desconto de 1.000,00 AOA aparece no histórico |

### Validações
- [ ] Cupom válido é aceito
- [ ] Desconto calculado corretamente (20% de 5000 = 1000)
- [ ] Total final correto (5000 - 1000 = 4000)
- [ ] Cupom não pode ser aplicado duas vezes no mesmo pedido
- [ ] Remoção de cupom restaura o valor original
- [ ] Contador de uso do cupom incrementado
- [ ] Desconto registrado no banco de dados

### Casos de Exceção

#### Exceção 1: Cupom Inválido
- **Entrada:** "CUPOMINVALIDO"
- **Resultado:** Mensagem "Cupom inválido ou expirado"
- **Total:** Não alterado

#### Exceção 2: Valor Mínimo Não Atingido
- **Entrada:** Pedido de 1500 AOA + cupom "DESCONTO20"
- **Resultado:** Mensagem "Valor mínimo de 2.000,00 AOA não atingido"
- **Total:** Não alterado

#### Exceção 3: Cupom Expirado
- **Entrada:** Cupom com data de validade passada
- **Resultado:** Mensagem "Cupom expirado"
- **Total:** Não alterado

---

## TC-PDV-003: Identificar Cliente e Aplicar Pontos de Fidelidade

### Informações Gerais
- **Prioridade:** Média
- **Severidade:** Média
- **Tipo:** Funcional

### Pré-condições
- Programa de fidelidade ativo
- Cliente "João Silva" cadastrado com:
  - Telefone: 923456789
  - Pontos acumulados: 500
  - Regra: 100 pontos = 100 AOA de desconto

### Dados de Teste
```json
{
  "cliente": {
    "nome": "João Silva",
    "telefone": "923456789",
    "pontos_atuais": 500
  },
  "pedido": {
    "subtotal": 3000,
    "pontos_a_resgatar": 300,
    "desconto_esperado": 300,
    "total_esperado": 2700,
    "pontos_ganhos_esperados": 30
  }
}
```

### Passos de Execução

| # | Ação | Resultado Esperado |
|---|------|-------------------|
| 1 | Criar novo pedido no PDV | Modal de novo pedido aberto |
| 2 | Clicar em "Identificar Cliente" | Campo de telefone aparece |
| 3 | Digitar "923456789" | Telefone inserido |
| 4 | Clicar em "Buscar" ou pressionar Enter | Sistema busca cliente |
| 5 | Aguardar resposta | Cliente "João Silva" encontrado |
| 6 | Verificar informações exibidas | Nome, telefone e 500 pontos exibidos |
| 7 | Adicionar produtos totalizando 3000 AOA | Subtotal 3.000,00 AOA |
| 8 | Verificar seção de pontos | "Você tem 500 pontos disponíveis" |
| 9 | Clicar em "Resgatar Pontos" | Modal de resgate abre |
| 10 | Inserir "300" pontos | Campo aceita valor |
| 11 | Verificar conversão | "300 pontos = 300 AOA de desconto" |
| 12 | Clicar em "Aplicar Desconto" | Desconto aplicado ao pedido |
| 13 | Verificar subtotal e total | Subtotal: 3000, Desconto: -300, Total: 2700 |
| 14 | Finalizar pedido | Pedido criado com sucesso |
| 15 | Verificar pontos do cliente | Saldo: 200 pontos (500 - 300) |
| 16 | Verificar novos pontos ganhos | +30 pontos (3000 AOA × 1% = 30 pontos) |
| 17 | Verificar saldo final | Total: 230 pontos (200 + 30) |

### Validações
- [ ] Cliente identificado corretamente pelo telefone
- [ ] Pontos disponíveis exibidos
- [ ] Resgate de pontos aplicado corretamente
- [ ] Desconto calculado conforme regra de conversão
- [ ] Pontos debitados da conta do cliente
- [ ] Novos pontos creditados após pagamento
- [ ] Histórico de transações atualizado
- [ ] Saldo final correto

### Casos de Exceção

#### Exceção 1: Cliente Não Cadastrado
- **Entrada:** Telefone "999999999"
- **Resultado:** Mensagem "Cliente não encontrado"
- **Ação:** Botão "Cadastrar Novo Cliente" aparece

#### Exceção 2: Pontos Insuficientes
- **Entrada:** Tentar resgatar 600 pontos (cliente tem 500)
- **Resultado:** Mensagem "Pontos insuficientes"
- **Ação:** Campo limitado ao máximo disponível

#### Exceção 3: Resgate Mínimo Não Atingido
- **Entrada:** Tentar resgatar 10 pontos
- **Resultado:** Mensagem "Resgate mínimo: 100 pontos"
- **Ação:** Campo não aceita valor abaixo do mínimo

---

## TC-PDV-004: Adicionar Opções Personalizáveis ao Produto

### Informações Gerais
- **Prioridade:** Alta
- **Severidade:** Alta
- **Tipo:** Funcional

### Pré-condições
- Produto "Pizza Margherita" cadastrado com opções:
  - Tamanho: Pequena (+0 AOA), Média (+500 AOA), Grande (+1000 AOA) [Obrigatória]
  - Borda: Sem Borda (+0 AOA), Borda Recheada (+300 AOA) [Opcional]
  - Extras: Queijo Extra (+200 AOA), Azeitonas (+150 AOA) [Múltipla escolha]

### Dados de Teste
```json
{
  "produto": "Pizza Margherita",
  "preco_base": 2500,
  "opcoes": [
    { "grupo": "Tamanho", "opcao": "Grande", "adicional": 1000, "obrigatorio": true },
    { "grupo": "Borda", "opcao": "Borda Recheada", "adicional": 300, "obrigatorio": false },
    { "grupo": "Extras", "opcao": "Queijo Extra", "adicional": 200, "obrigatorio": false },
    { "grupo": "Extras", "opcao": "Azeitonas", "adicional": 150, "obrigatorio": false }
  ],
  "preco_final_esperado": 4150
}
```

### Passos de Execução

| # | Ação | Resultado Esperado |
|---|------|-------------------|
| 1 | Criar novo pedido | Modal aberto |
| 2 | Buscar "Pizza Margherita" | Produto encontrado |
| 3 | Clicar no produto | Modal de opções abre |
| 4 | Verificar grupo "Tamanho" | 3 opções visíveis, marcadas como obrigatórias |
| 5 | Tentar adicionar sem selecionar tamanho | Botão "Adicionar" desabilitado |
| 6 | Selecionar "Grande" | Opção selecionada, preço atualiza +1000 |
| 7 | Verificar preço parcial | "3.500,00 AOA (Base: 2.500 + 1.000)" |
| 8 | Selecionar "Borda Recheada" | Opção selecionada, preço atualiza +300 |
| 9 | Verificar preço parcial | "3.800,00 AOA" |
| 10 | Marcar "Queijo Extra" em Extras | Checkbox marcado, preço atualiza +200 |
| 11 | Marcar "Azeitonas" em Extras | Checkbox marcado, preço atualiza +150 |
| 12 | Verificar preço final no modal | "4.150,00 AOA" |
| 13 | Adicionar observação "Sem cebola" | Texto inserido no campo observações |
| 14 | Clicar em "Adicionar ao Pedido" | Produto adicionado ao carrinho |
| 15 | Verificar item no carrinho | Pizza com todas as opções listadas |
| 16 | Verificar preço no carrinho | "4.150,00 AOA" |
| 17 | Clicar em editar item | Modal de opções reabre com seleções |
| 18 | Desmarcar "Azeitonas" | Preço atualiza para 4.000,00 AOA |
| 19 | Salvar alteração | Item atualizado no carrinho |
| 20 | Finalizar pedido | Pedido criado com opções corretas |

### Validações
- [ ] Opções obrigatórias bloqueiam adição sem seleção
- [ ] Preço adicional calculado corretamente para cada opção
- [ ] Múltiplas escolhas permitidas em grupos configurados
- [ ] Observações salvas corretamente
- [ ] Edição de item mantém opções selecionadas
- [ ] Opções aparecem no pedido impresso
- [ ] Cozinha recebe as personalizações

### Casos de Exceção

#### Exceção 1: Opção Indisponível
- **Cenário:** Borda Recheada marcada como indisponível
- **Resultado:** Opção exibida em cinza e desabilitada
- **Ação:** Não pode ser selecionada

---

## TC-PDV-005: Cancelar Pedido com Justificativa

### Informações Gerais
- **Prioridade:** Alta
- **Severidade:** Alta
- **Tipo:** Funcional

### Pré-condições
- Pedido #1234 criado com status "Pendente"
- Usuário com permissão para cancelar pedidos
- Motivos de cancelamento cadastrados

### Dados de Teste
```json
{
  "pedido_id": 1234,
  "status_atual": "Pendente",
  "motivo_cancelamento": "Cliente desistiu",
  "observacao": "Cliente pediu para cancelar antes de começar o preparo"
}
```

### Passos de Execução

| # | Ação | Resultado Esperado |
|---|------|-------------------|
| 1 | Acessar lista de pedidos ativos | Pedido #1234 visível |
| 2 | Clicar no pedido #1234 | Detalhes do pedido abrem |
| 3 | Localizar botão "Cancelar Pedido" | Botão vermelho visível |
| 4 | Clicar em "Cancelar Pedido" | Modal de confirmação abre |
| 5 | Verificar aviso | "Esta ação não pode ser desfeita" exibido |
| 6 | Verificar campo de motivo | Dropdown com opções de motivo |
| 7 | Selecionar "Cliente desistiu" | Motivo selecionado |
| 8 | Inserir observação adicional | Texto inserido no campo |
| 9 | Clicar em "Cancelar" no modal | Modal fecha sem cancelar |
| 10 | Reabrir modal de cancelamento | Modal abre novamente |
| 11 | Selecionar motivo e inserir observação | Dados preenchidos |
| 12 | Clicar em "Confirmar Cancelamento" | Pedido cancelado |
| 13 | Verificar mensagem de sucesso | "Pedido cancelado com sucesso" |
| 14 | Verificar status do pedido | Status atualizado para "Cancelado" |
| 15 | Verificar cor visual | Pedido exibido em vermelho/cinza |
| 16 | Verificar mesa associada | Mesa liberada automaticamente |
| 17 | Acessar histórico do pedido | Motivo e observação salvos |
| 18 | Verificar relatórios | Pedido aparece em "Pedidos Cancelados" |

### Validações
- [ ] Apenas usuários autorizados podem cancelar
- [ ] Motivo é obrigatório
- [ ] Status atualizado corretamente
- [ ] Mesa liberada automaticamente
- [ ] Histórico preservado com motivo
- [ ] Estoque devolvido (se aplicável)
- [ ] Relatórios atualizados
- [ ] Não é possível "descancelar" um pedido

### Casos de Exceção

#### Exceção 1: Pedido Já em Preparo
- **Cenário:** Pedido com status "Em Preparo"
- **Resultado:** Aviso adicional "Pedido já iniciado na cozinha"
- **Ação:** Requer confirmação extra do gerente

#### Exceção 2: Pedido com Pagamento
- **Cenário:** Pedido já pago
- **Resultado:** Mensagem "Pedidos pagos não podem ser cancelados"
- **Ação:** Deve-se fazer um reembolso ao invés de cancelamento

---

## TC-PDV-006: Dividir Conta entre Convidados

### Informações Gerais
- **Prioridade:** Média
- **Severidade:** Média
- **Tipo:** Funcional

### Pré-condições
- Mesa com pedido fechado (total: 6000 AOA)
- 4 convidados na mesa
- Produtos diversos no pedido

### Dados de Teste
```json
{
  "mesa": "Mesa 8",
  "total": 6000,
  "convidados": 4,
  "divisao": "igual",
  "valor_por_pessoa": 1500
}
```

### Passos de Execução

| # | Ação | Resultado Esperado |
|---|------|-------------------|
| 1 | Acessar detalhes da Mesa 8 | Detalhes carregam |
| 2 | Verificar total da conta | "6.000,00 AOA" |
| 3 | Clicar em "Dividir Conta" | Modal de divisão abre |
| 4 | Verificar número de convidados | "4 convidados" exibido |
| 5 | Selecionar "Dividir Igualmente" | Opção selecionada |
| 6 | Verificar cálculo | "Cada pessoa paga: 1.500,00 AOA" |
| 7 | Clicar em "Gerar Contas Individuais" | 4 contas criadas |
| 8 | Verificar contas geradas | Convidado 1: 1500, Convidado 2: 1500, etc. |
| 9 | Clicar em "Imprimir Todas" | 4 comprovantes impressos |
| 10 | Processar pagamento do Convidado 1 | Pagamento registrado |
| 11 | Verificar saldo restante | "4.500,00 AOA restantes" |
| 12 | Processar demais pagamentos | Todos pagamentos registrados |
| 13 | Verificar status | "Conta totalmente paga" |
| 14 | Verificar mesa | Mesa liberada automaticamente |

### Validações
- [ ] Divisão igual calculada corretamente
- [ ] Cada conta individual criada
- [ ] Pagamentos parciais registrados
- [ ] Saldo restante atualizado em tempo real
- [ ] Mesa liberada após pagamento completo
- [ ] Histórico de pagamentos preservado

---


# 🪑 MÓDULO 2: CONTROLE DE MESAS

## TC-MESA-001: Ocupar Mesa Livre

### Informações Gerais
- **Prioridade:** Alta
- **Severidade:** Crítica
- **Tipo:** Funcional
- **Automação:** Sim

### Pré-condições
- Mesa 3 está livre (status: "Livre")
- Capacidade da mesa: 4 pessoas
- Usuário autenticado

### Dados de Teste
```json
{
  "mesa": "Mesa 3",
  "numero_convidados": 3,
  "status_inicial": "Livre",
  "status_final": "Ocupada"
}
```

### Passos de Execução

| # | Ação | Resultado Esperado |
|---|------|-------------------|
| 1 | Acessar página `/tables` | Lista de mesas carrega |
| 2 | Localizar Mesa 3 | Card da mesa visível com cor verde (livre) |
| 3 | Verificar status visual | Badge "Livre" exibido |
| 4 | Clicar no card da Mesa 3 | Modal de detalhes abre |
| 5 | Clicar em "Ocupar Mesa" | Form de ocupação aparece |
| 6 | Inserir número de convidados: 3 | Valor aceito (dentro da capacidade) |
| 7 | Clicar em "Confirmar" | Mesa marcada como ocupada |
| 8 | Verificar mensagem | "Mesa 3 ocupada com sucesso" |
| 9 | Verificar cor do card | Card muda para laranja/vermelho (ocupada) |
| 10 | Verificar badge de status | Badge exibe "Ocupada" |
| 11 | Verificar contador de convidados | "3 convidados" exibido |
| 12 | Verificar timer | Tempo de ocupação iniciado (00:00) |
| 13 | Atualizar página | Status persiste após refresh |
| 14 | Verificar WebSocket | Outros usuários veem atualização em tempo real |

### Validações
- [ ] Status atualizado corretamente no banco
- [ ] Cor visual muda conforme status
- [ ] Timer de ocupação iniciado
- [ ] Número de convidados registrado
- [ ] Não permite ocupar mesa já ocupada
- [ ] Validação de capacidade máxima
- [ ] Atualização em tempo real via WebSocket

### Casos de Exceção

#### Exceção 1: Exceder Capacidade
- **Entrada:** 5 convidados (capacidade: 4)
- **Resultado:** Erro "Capacidade máxima: 4 pessoas"
- **Ação:** Campo não aceita valor acima da capacidade

#### Exceção 2: Mesa Já Ocupada
- **Cenário:** Tentar ocupar mesa já ocupada
- **Resultado:** Botão "Ocupar Mesa" não aparece
- **Ação:** Apenas opções de adicionar pedido ou liberar

---

## TC-MESA-002: Transferir Convidados Entre Mesas

### Informações Gerais
- **Prioridade:** Média
- **Severidade:** Média
- **Tipo:** Funcional

### Pré-condições
- Mesa 5 ocupada com 2 convidados e 1 pedido ativo
- Mesa 7 livre
- Usuário com permissão para gerenciar mesas

### Dados de Teste
```json
{
  "mesa_origem": "Mesa 5",
  "mesa_destino": "Mesa 7",
  "convidados": [
    { "id": 1, "nome": "Convidado 1" },
    { "id": 2, "nome": "Convidado 2" }
  ],
  "pedido_id": 5678
}
```

### Passos de Execução

| # | Ação | Resultado Esperado |
|---|------|-------------------|
| 1 | Acessar Mesa 5 | Detalhes da mesa carregam |
| 2 | Verificar convidados | 2 convidados listados |
| 3 | Clicar em "Transferir" | Modal de transferência abre |
| 4 | Selecionar convidados | Checkboxes para selecionar convidados |
| 5 | Marcar ambos os convidados | Ambos selecionados |
| 6 | Selecionar mesa de destino | Dropdown com mesas livres |
| 7 | Escolher "Mesa 7" | Mesa 7 selecionada |
| 8 | Verificar aviso de pedido | "Pedido será transferido junto" |
| 9 | Clicar em "Confirmar Transferência" | Transferência processada |
| 10 | Verificar Mesa 5 | Agora está livre |
| 11 | Acessar Mesa 7 | Agora ocupada com 2 convidados |
| 12 | Verificar pedido | Pedido #5678 associado à Mesa 7 |
| 13 | Verificar histórico | Transferência registrada no log |

### Validações
- [ ] Convidados transferidos corretamente
- [ ] Pedidos movidos junto com convidados
- [ ] Mesa origem liberada se todos saírem
- [ ] Mesa destino marcada como ocupada
- [ ] Histórico de transferência registrado
- [ ] Timer de ocupação reiniciado na nova mesa

---

## TC-MESA-003: Mesclar Duas Mesas

### Informações Gerais
- **Prioridade:** Baixa
- **Severidade:** Média
- **Tipo:** Funcional

### Pré-condições
- Mesa 10 ocupada com 3 convidados
- Mesa 11 ocupada com 2 convidados
- Mesas adjacentes fisicamente

### Dados de Teste
```json
{
  "mesa1": "Mesa 10",
  "mesa2": "Mesa 11",
  "convidados_mesa1": 3,
  "convidados_mesa2": 2,
  "total_convidados_esperado": 5
}
```

### Passos de Execução

| # | Ação | Resultado Esperado |
|---|------|-------------------|
| 1 | Acessar Mesa 10 | Detalhes carregam |
| 2 | Clicar em "Mesclar Mesa" | Modal de mesclagem abre |
| 3 | Selecionar Mesa 11 | Mesa 11 selecionada |
| 4 | Verificar resumo | "Total: 5 convidados" |
| 5 | Verificar pedidos | Ambos os pedidos listados |
| 6 | Confirmar mesclagem | Mesas mescladas |
| 7 | Verificar resultado | Mesa 10 tem 5 convidados |
| 8 | Verificar Mesa 11 | Agora está livre |
| 9 | Verificar pedidos | Ambos pedidos na Mesa 10 |
| 10 | Verificar conta unificada | Total somado corretamente |

### Validações
- [ ] Convidados somados corretamente
- [ ] Pedidos unificados na mesa destino
- [ ] Mesa origem liberada
- [ ] Conta unificada calculada corretamente

---


## TC-MESA-004: Liberar Mesa Após Pagamento Completo

### Informações Gerais
- **Prioridade:** Alta
- **Severidade:** Crítica
- **Tipo:** Funcional

### Pré-condições
- Mesa 12 ocupada com conta fechada
- Total da conta: 8500 AOA
- Pagamento já processado

### Dados de Teste
```json
{
  "mesa": "Mesa 12",
  "total_conta": 8500,
  "status_pagamento": "Pago",
  "convidados": 4
}
```

### Passos de Execução

| # | Ação | Resultado Esperado |
|---|------|-------------------|
| 1 | Acessar Mesa 12 | Detalhes carregam |
| 2 | Verificar status de pagamento | Badge "Pago" exibido |
| 3 | Verificar total | "8.500,00 AOA - Pago" |
| 4 | Clicar em "Liberar Mesa" | Modal de confirmação abre |
| 5 | Verificar aviso | "Todos os pagamentos foram processados" |
| 6 | Clicar em "Confirmar" | Mesa liberada |
| 7 | Verificar mensagem | "Mesa 12 liberada com sucesso" |
| 8 | Verificar status visual | Card verde (livre) |
| 9 | Verificar contador | "0 convidados" |
| 10 | Verificar timer | Timer zerado |
| 11 | Verificar histórico | Ocupação registrada no histórico |
| 12 | Verificar pedidos | Pedidos arquivados, não mais ativos |

### Validações
- [ ] Mesa só pode ser liberada após pagamento completo
- [ ] Status atualizado para "Livre"
- [ ] Timer zerado
- [ ] Convidados removidos
- [ ] Histórico preservado
- [ ] Pedidos arquivados corretamente

### Casos de Exceção

#### Exceção 1: Pagamento Pendente
- **Cenário:** Tentar liberar mesa com saldo devedor
- **Resultado:** Erro "Existe saldo pendente de 2.000,00 AOA"
- **Ação:** Botão "Liberar Mesa" desabilitado

---

## TC-MESA-005: Adicionar Convidado à Mesa Ocupada

### Informações Gerais
- **Prioridade:** Média
- **Severidade:** Baixa
- **Tipo:** Funcional

### Pré-condições
- Mesa 15 ocupada com 2 convidados
- Capacidade da mesa: 6 pessoas

### Dados de Teste
```json
{
  "mesa": "Mesa 15",
  "convidados_atuais": 2,
  "capacidade": 6,
  "novos_convidados": 2
}
```

### Passos de Execução

| # | Ação | Resultado Esperado |
|---|------|-------------------|
| 1 | Acessar Mesa 15 | Detalhes carregam |
| 2 | Verificar contador | "2 convidados" |
| 3 | Clicar em "Adicionar Convidados" | Input numérico aparece |
| 4 | Inserir "2" | Valor aceito |
| 5 | Clicar em "Confirmar" | Convidados adicionados |
| 6 | Verificar contador | "4 convidados" |
| 7 | Verificar atualização | Atualização em tempo real |

### Validações
- [ ] Número de convidados atualizado
- [ ] Não permite exceder capacidade
- [ ] Atualização refletida em tempo real

---

# 💵 MÓDULO 3: FINANCEIRO

## TC-FIN-001: Abrir Turno de Caixa

### Informações Gerais
- **Prioridade:** Crítica
- **Severidade:** Crítica
- **Tipo:** Funcional
- **Automação:** Sim

### Pré-condições
- Caixa "Caixa Principal" cadastrado e ativo
- Nenhum turno aberto para este caixa
- Usuário autenticado com permissão financeira

### Dados de Teste
```json
{
  "caixa": "Caixa Principal",
  "operador": "João Silva",
  "valor_inicial": 10000,
  "data_abertura": "2025-12-23T08:00:00"
}
```

### Passos de Execução

| # | Ação | Resultado Esperado |
|---|------|-------------------|
| 1 | Acessar página `/cash-shifts` | Lista de turnos carrega |
| 2 | Verificar status | Nenhum turno aberto para Caixa Principal |
| 3 | Clicar em "Abrir Turno" | Modal de abertura abre |
| 4 | Selecionar caixa | "Caixa Principal" selecionado |
| 5 | Verificar operador | Nome do usuário logado preenchido |
| 6 | Inserir valor inicial: 10000 | Valor aceito |
| 7 | Verificar formato | "10.000,00 AOA" exibido |
| 8 | Inserir observação | "Fundo de caixa do dia" |
| 9 | Clicar em "Abrir Turno" | Turno criado |
| 10 | Verificar mensagem | "Turno aberto com sucesso" |
| 11 | Verificar lista | Turno aparece como "Aberto" |
| 12 | Verificar detalhes | Valor inicial: 10.000,00 AOA |
| 13 | Verificar timestamp | Data/hora de abertura registrada |
| 14 | Verificar badge | Badge verde "Aberto" visível |
| 15 | Tentar abrir novo turno | Botão desabilitado (já existe turno aberto) |

### Validações
- [ ] Apenas um turno aberto por caixa
- [ ] Valor inicial registrado corretamente
- [ ] Timestamp de abertura salvo
- [ ] Operador associado ao turno
- [ ] Status "Aberto" ativo
- [ ] Não permite abrir múltiplos turnos simultaneamente

### Casos de Exceção

#### Exceção 1: Turno Já Aberto
- **Cenário:** Tentar abrir turno enquanto outro está aberto
- **Resultado:** Erro "Já existe um turno aberto para este caixa"
- **Ação:** Botão "Abrir Turno" desabilitado

#### Exceção 2: Valor Inicial Negativo
- **Entrada:** -1000
- **Resultado:** Erro "Valor inicial deve ser positivo"
- **Ação:** Campo não aceita valores negativos

---

## TC-FIN-002: Registrar Transação de Receita

### Informações Gerais
- **Prioridade:** Alta
- **Severidade:** Crítica
- **Tipo:** Funcional

### Pré-condições
- Turno de caixa aberto
- Categoria "Vendas" cadastrada
- Caixa Principal selecionado

### Dados de Teste
```json
{
  "tipo": "Receita",
  "categoria": "Vendas",
  "valor": 5500,
  "descricao": "Venda de almoço - Mesa 8",
  "forma_pagamento": "Dinheiro",
  "caixa": "Caixa Principal"
}
```

### Passos de Execução

| # | Ação | Resultado Esperado |
|---|------|-------------------|
| 1 | Acessar `/financial-new-transaction` | Formulário carrega |
| 2 | Selecionar tipo "Receita" | Opção selecionada, cor verde |
| 3 | Selecionar categoria "Vendas" | Categoria selecionada |
| 4 | Inserir valor: 5500 | Campo aceita valor |
| 5 | Verificar formato | "5.500,00 AOA" exibido |
| 6 | Inserir descrição | Texto inserido |
| 7 | Selecionar "Dinheiro" | Forma de pagamento selecionada |
| 8 | Verificar caixa | Caixa Principal pré-selecionado |
| 9 | Verificar data | Data atual preenchida |
| 10 | Clicar em "Salvar Transação" | Transação criada |
| 11 | Verificar mensagem | "Receita registrada com sucesso" |
| 12 | Verificar lista de transações | Nova transação aparece no topo |
| 13 | Verificar saldo do caixa | Saldo atualizado (+5500) |
| 14 | Verificar dashboard financeiro | KPIs atualizados |
| 15 | Verificar relatório DRE | Receita contabilizada |

### Validações
- [ ] Transação salva no banco de dados
- [ ] Saldo do caixa atualizado corretamente
- [ ] Timestamp registrado
- [ ] Categoria e forma de pagamento associadas
- [ ] Dashboard atualizado em tempo real
- [ ] Relatórios refletem nova transação

---

## TC-FIN-003: Registrar Transação de Despesa

### Informações Gerais
- **Prioridade:** Alta
- **Severidade:** Crítica
- **Tipo:** Funcional

### Pré-condições
- Turno de caixa aberto
- Categoria "Fornecedores" cadastrada
- Saldo suficiente no caixa

### Dados de Teste
```json
{
  "tipo": "Despesa",
  "categoria": "Fornecedores",
  "valor": 2500,
  "descricao": "Compra de carne - Fornecedor ABC",
  "forma_pagamento": "Transferência Bancária",
  "caixa": "Caixa Principal",
  "comprovante": "comprovante_123.pdf"
}
```

### Passos de Execução

| # | Ação | Resultado Esperado |
|---|------|-------------------|
| 1 | Acessar `/financial-new-transaction` | Formulário carrega |
| 2 | Selecionar tipo "Despesa" | Opção selecionada, cor vermelha |
| 3 | Selecionar categoria "Fornecedores" | Categoria selecionada |
| 4 | Inserir valor: 2500 | Campo aceita valor |
| 5 | Inserir descrição | Texto inserido |
| 6 | Selecionar "Transferência Bancária" | Forma de pagamento selecionada |
| 7 | Fazer upload do comprovante | Arquivo PDF aceito |
| 8 | Verificar preview | Nome do arquivo exibido |
| 9 | Clicar em "Salvar Transação" | Transação criada |
| 10 | Verificar mensagem | "Despesa registrada com sucesso" |
| 11 | Verificar saldo do caixa | Saldo atualizado (-2500) |
| 12 | Verificar lista de transações | Nova despesa aparece |
| 13 | Clicar na transação | Comprovante disponível para download |
| 14 | Verificar relatório | Despesa contabilizada |

### Validações
- [ ] Despesa salva corretamente
- [ ] Saldo deduzido do caixa
- [ ] Comprovante anexado e acessível
- [ ] Categoria e forma de pagamento registradas
- [ ] Relatórios atualizados
- [ ] Não permite despesa maior que saldo disponível

### Casos de Exceção

#### Exceção 1: Saldo Insuficiente
- **Cenário:** Tentar registrar despesa de 15000 com saldo de 10000
- **Resultado:** Aviso "Saldo insuficiente no caixa"
- **Ação:** Permite continuar com confirmação extra

---

## TC-FIN-004: Fechar Turno de Caixa com Conferência

### Informações Gerais
- **Prioridade:** Crítica
- **Severidade:** Crítica
- **Tipo:** Funcional

### Pré-condições
- Turno aberto com valor inicial de 10000 AOA
- Transações registradas durante o turno:
  - Receitas: 35000 AOA
  - Despesas: 5000 AOA
- Saldo esperado: 40000 AOA (10000 + 35000 - 5000)

### Dados de Teste
```json
{
  "valor_inicial": 10000,
  "receitas": 35000,
  "despesas": 5000,
  "saldo_esperado": 40000,
  "valor_contado": 39800,
  "diferenca": -200,
  "motivo_diferenca": "Quebra de caixa"
}
```

### Passos de Execução

| # | Ação | Resultado Esperado |
|---|------|-------------------|
| 1 | Acessar turno aberto | Detalhes do turno carregam |
| 2 | Clicar em "Fechar Turno" | Modal de fechamento abre |
| 3 | Verificar resumo automático | Valor inicial: 10.000,00 AOA |
| 4 | Verificar total de receitas | "+35.000,00 AOA" |
| 5 | Verificar total de despesas | "-5.000,00 AOA" |
| 6 | Verificar saldo esperado | "40.000,00 AOA" em destaque |
| 7 | Inserir valor contado: 39800 | Valor aceito |
| 8 | Verificar cálculo de diferença | "Diferença: -200,00 AOA" em vermelho |
| 9 | Verificar alerta | "Existe diferença no caixa" |
| 10 | Selecionar motivo | "Quebra de caixa" |
| 11 | Inserir observação | "Troco errado dado ao cliente" |
| 12 | Clicar em "Confirmar Fechamento" | Modal de confirmação final |
| 13 | Verificar aviso | "Esta ação não pode ser desfeita" |
| 14 | Clicar em "Fechar Turno" | Turno fechado |
| 15 | Verificar mensagem | "Turno fechado com sucesso" |
| 16 | Verificar status | Badge muda para "Fechado" |
| 17 | Verificar timestamp | Data/hora de fechamento registrada |
| 18 | Clicar em "Imprimir Relatório" | PDF gerado com resumo completo |
| 19 | Verificar relatório | Todas as transações listadas |
| 20 | Verificar diferença no relatório | Diferença de -200 AOA destacada |

### Validações
- [ ] Saldo esperado calculado corretamente
- [ ] Diferença identificada e registrada
- [ ] Motivo da diferença obrigatório quando há diferença
- [ ] Timestamp de fechamento salvo
- [ ] Status atualizado para "Fechado"
- [ ] Relatório gerado com todas as informações
- [ ] Não permite reabrir turno fechado
- [ ] Novo turno pode ser aberto após fechamento

### Casos de Teste Adicionais

#### Cenário 1: Fechamento sem Diferença
- **Valor Contado:** 40000 AOA (igual ao esperado)
- **Resultado:** Fechamento sem aviso, campo de motivo não aparece
- **Validação:** Fechamento simplificado

#### Cenário 2: Diferença Positiva (Sobra)
- **Valor Contado:** 40500 AOA
- **Diferença:** +500 AOA (em verde)
- **Resultado:** Motivo obrigatório (ex: "Cliente esqueceu troco")

---

## TC-FIN-005: Gerar Relatório de Fluxo de Caixa

### Informações Gerais
- **Prioridade:** Média
- **Severidade:** Média
- **Tipo:** Funcional

### Pré-condições
- Período com transações registradas
- Múltiplas categorias e formas de pagamento
- Dados de teste do período 01/12/2025 a 23/12/2025

### Dados de Teste
```json
{
  "periodo": {
    "inicio": "2025-12-01",
    "fim": "2025-12-23"
  },
  "receitas_esperadas": 250000,
  "despesas_esperadas": 80000,
  "saldo_esperado": 170000
}
```

### Passos de Execução

| # | Ação | Resultado Esperado |
|---|------|-------------------|
| 1 | Acessar `/financial-reports` | Página de relatórios carrega |
| 2 | Selecionar "Fluxo de Caixa" | Tipo de relatório selecionado |
| 3 | Definir data início: 01/12/2025 | Data inserida |
| 4 | Definir data fim: 23/12/2025 | Data inserida |
| 5 | Clicar em "Gerar Relatório" | Relatório processado |
| 6 | Verificar loading | Indicador de carregamento exibido |
| 7 | Aguardar conclusão | Relatório exibido na tela |
| 8 | Verificar cabeçalho | Nome do restaurante e período |
| 9 | Verificar total de receitas | "250.000,00 AOA" |
| 10 | Verificar total de despesas | "80.000,00 AOA" |
| 11 | Verificar saldo líquido | "170.000,00 AOA" em verde |
| 12 | Verificar gráfico | Gráfico de barras com receitas vs despesas |
| 13 | Verificar tabela detalhada | Transações listadas por categoria |
| 14 | Verificar breakdown | Receitas por forma de pagamento |
| 15 | Clicar em "Exportar PDF" | Download do PDF iniciado |
| 16 | Abrir PDF | Relatório formatado corretamente |
| 17 | Clicar em "Exportar Excel" | Download do Excel iniciado |
| 18 | Abrir Excel | Dados em formato tabular |

### Validações
- [ ] Período aplicado corretamente
- [ ] Totais calculados sem erro
- [ ] Saldo líquido correto (receitas - despesas)
- [ ] Gráficos exibidos corretamente
- [ ] Exportação PDF funcional
- [ ] Exportação Excel com dados corretos
- [ ] Formatação de valores com 2 casas decimais
- [ ] Categorização correta das transações

---

## TC-FIN-006: Sangria de Caixa

### Informações Gerais
- **Prioridade:** Média
- **Severidade:** Alta
- **Tipo:** Funcional

### Pré-condições
- Turno de caixa aberto
- Saldo atual: 50000 AOA
- Necessidade de retirar excesso de dinheiro

### Dados de Teste
```json
{
  "tipo": "Sangria",
  "valor": 30000,
  "motivo": "Depósito bancário",
  "responsavel": "João Silva",
  "saldo_anterior": 50000,
  "saldo_posterior": 20000
}
```

### Passos de Execução

| # | Ação | Resultado Esperado |
|---|------|-------------------|
| 1 | Acessar turno aberto | Detalhes carregam |
| 2 | Verificar saldo atual | "50.000,00 AOA" |
| 3 | Clicar em "Sangria" | Modal de sangria abre |
| 4 | Inserir valor: 30000 | Valor aceito |
| 5 | Inserir motivo | "Depósito bancário" |
| 6 | Verificar responsável | Nome do usuário preenchido |
| 7 | Verificar cálculo | "Saldo após sangria: 20.000,00 AOA" |
| 8 | Clicar em "Confirmar Sangria" | Sangria registrada |
| 9 | Verificar mensagem | "Sangria registrada com sucesso" |
| 10 | Verificar saldo atualizado | Novo saldo: 20.000,00 AOA |
| 11 | Verificar histórico | Sangria listada nas transações |
| 12 | Imprimir comprovante | Comprovante de sangria gerado |

### Validações
- [ ] Valor debitado do saldo do caixa
- [ ] Sangria registrada no histórico
- [ ] Motivo obrigatório
- [ ] Responsável registrado
- [ ] Comprovante gerado
- [ ] Aparece no fechamento do turno

---

## TC-FIN-007: Suprimento de Caixa

### Informações Gerais
- **Prioridade:** Média
- **Severidade:** Alta
- **Tipo:** Funcional

### Pré-condições
- Turno de caixa aberto
- Saldo atual: 5000 AOA (baixo)
- Necessidade de adicionar dinheiro para troco

### Dados de Teste
```json
{
  "tipo": "Suprimento",
  "valor": 15000,
  "motivo": "Reforço para troco",
  "responsavel": "Maria Santos",
  "saldo_anterior": 5000,
  "saldo_posterior": 20000
}
```

### Passos de Execução

| # | Ação | Resultado Esperado |
|---|------|-------------------|
| 1 | Acessar turno aberto | Detalhes carregam |
| 2 | Verificar saldo baixo | Alerta "Saldo baixo" pode aparecer |
| 3 | Clicar em "Suprimento" | Modal de suprimento abre |
| 4 | Inserir valor: 15000 | Valor aceito |
| 5 | Inserir motivo | "Reforço para troco" |
| 6 | Verificar cálculo | "Saldo após suprimento: 20.000,00 AOA" |
| 7 | Clicar em "Confirmar Suprimento" | Suprimento registrado |
| 8 | Verificar saldo atualizado | Novo saldo: 20.000,00 AOA |
| 9 | Verificar histórico | Suprimento listado |
| 10 | Imprimir comprovante | Comprovante gerado |

### Validações
- [ ] Valor creditado no saldo do caixa
- [ ] Suprimento registrado no histórico
- [ ] Aparece no fechamento do turno
- [ ] Comprovante gerado

---


## TC-FIN-008: Criar Categoria Financeira

### Informações Gerais
- **Prioridade:** Baixa
- **Severidade:** Baixa
- **Tipo:** Funcional

### Pré-condições
- Usuário com permissão de administração financeira
- Acesso ao módulo de categorias

### Dados de Teste
```json
{
  "nome": "Marketing e Publicidade",
  "tipo": "Despesa",
  "cor": "#FF6B6B",
  "icone": "megaphone"
}
```

### Passos de Execução

| # | Ação | Resultado Esperado |
|---|------|-------------------|
| 1 | Acessar `/financial-categories` | Lista de categorias carrega |
| 2 | Clicar em "Nova Categoria" | Modal de criação abre |
| 3 | Inserir nome | "Marketing e Publicidade" |
| 4 | Selecionar tipo | "Despesa" |
| 5 | Escolher cor | Seletor de cor com #FF6B6B |
| 6 | Selecionar ícone | Ícone "megaphone" selecionado |
| 7 | Clicar em "Salvar" | Categoria criada |
| 8 | Verificar mensagem | "Categoria criada com sucesso" |
| 9 | Verificar lista | Nova categoria aparece |
| 10 | Verificar visual | Cor e ícone exibidos corretamente |

### Validações
- [ ] Nome único (não permite duplicatas)
- [ ] Tipo obrigatório (Receita ou Despesa)
- [ ] Cor personalizada aplicada
- [ ] Ícone exibido na lista e em transações
- [ ] Categoria disponível para uso imediato

---

# 📊 MATRIZ DE RASTREABILIDADE

## Cobertura de Testes por Módulo

| Módulo | Casos de Teste | Prioridade Alta | Prioridade Média | Prioridade Baixa |
|--------|----------------|-----------------|------------------|------------------|
| PDV | 6 | 5 | 1 | 0 |
| Mesas | 5 | 3 | 2 | 0 |
| Financeiro | 8 | 4 | 3 | 1 |
| **TOTAL** | **19** | **12** | **6** | **1** |

---

# 🎯 PLANO DE EXECUÇÃO SUGERIDO

## Fase 1: Testes Críticos (Prioridade Alta)
**Duração Estimada:** 2-3 horas

1. **TC-PDV-001** - Criar Pedido Simples ⏱️ 15 min
2. **TC-PDV-002** - Aplicar Cupom de Desconto ⏱️ 10 min
3. **TC-PDV-004** - Opções Personalizáveis ⏱️ 15 min
4. **TC-PDV-005** - Cancelar Pedido ⏱️ 10 min
5. **TC-MESA-001** - Ocupar Mesa Livre ⏱️ 10 min
6. **TC-MESA-004** - Liberar Mesa ⏱️ 10 min
7. **TC-FIN-001** - Abrir Turno de Caixa ⏱️ 10 min
8. **TC-FIN-002** - Registrar Receita ⏱️ 10 min
9. **TC-FIN-003** - Registrar Despesa ⏱️ 10 min
10. **TC-FIN-004** - Fechar Turno de Caixa ⏱️ 20 min

**✅ Critério de Aprovação:** 100% dos testes críticos devem passar

---

## Fase 2: Testes Importantes (Prioridade Média)
**Duração Estimada:** 1-2 horas

1. **TC-PDV-003** - Identificar Cliente e Pontos ⏱️ 15 min
2. **TC-PDV-006** - Dividir Conta ⏱️ 15 min
3. **TC-MESA-002** - Transferir Convidados ⏱️ 10 min
4. **TC-MESA-003** - Mesclar Mesas ⏱️ 10 min
5. **TC-FIN-005** - Relatório de Fluxo de Caixa ⏱️ 15 min
6. **TC-FIN-006** - Sangria de Caixa ⏱️ 10 min
7. **TC-FIN-007** - Suprimento de Caixa ⏱️ 10 min

**✅ Critério de Aprovação:** Mínimo 90% dos testes devem passar

---

## Fase 3: Testes Complementares (Prioridade Baixa)
**Duração Estimada:** 30 min

1. **TC-MESA-005** - Adicionar Convidado ⏱️ 5 min
2. **TC-FIN-008** - Criar Categoria ⏱️ 5 min

**✅ Critério de Aprovação:** Mínimo 80% dos testes devem passar

---

# 📝 TEMPLATE DE REGISTRO DE TESTE

Use este template para documentar a execução de cada caso de teste:

```markdown
## Execução de Teste

**ID do Caso:** TC-XXX-000
**Data/Hora:** DD/MM/YYYY HH:MM
**Testador:** [Nome]
**Ambiente:** [Desenvolvimento / Homologação / Produção]
**Navegador/Dispositivo:** [Chrome 120 / iPhone 14 / etc]

### Resultado
- [ ] ✅ PASSOU
- [ ] ❌ FALHOU
- [ ] ⚠️ PASSOU COM RESSALVAS

### Observações
[Descreva qualquer comportamento inesperado, bugs encontrados, ou sugestões]

### Screenshots/Evidências
[Anexar prints ou vídeos se necessário]

### Bugs Identificados
- **Bug #001:** [Descrição do bug]
  - **Severidade:** [Crítica/Alta/Média/Baixa]
  - **Status:** [Aberto/Em análise/Resolvido]
```

---

# 🐛 BUGS COMUNS E SOLUÇÕES

## PDV

### Bug Comum 1: Total do Pedido Não Atualiza
**Sintoma:** Ao adicionar produtos, o total não atualiza automaticamente  
**Causa Provável:** Problema de reatividade no estado do carrinho  
**Solução:** Verificar se o `useState` está sendo atualizado corretamente  
**Teste:** TC-PDV-001

### Bug Comum 2: Cupom Aplicado Múltiplas Vezes
**Sintoma:** Desconto aplicado mais de uma vez no mesmo pedido  
**Causa Provável:** Falta de validação no backend  
**Solução:** Adicionar check se cupom já foi aplicado  
**Teste:** TC-PDV-002

### Bug Comum 3: Opções Obrigatórias Permitem Adicionar Sem Seleção
**Sintoma:** Produto com opção obrigatória adicionado sem seleção  
**Causa Provável:** Validação client-side bypassada  
**Solução:** Validar também no backend  
**Teste:** TC-PDV-004

---

## Mesas

### Bug Comum 1: Mesa Não Atualiza Status em Tempo Real
**Sintoma:** Um usuário ocupa mesa mas outro não vê atualização  
**Causa Provável:** WebSocket não conectado ou evento não emitido  
**Solução:** Verificar conexão WS e emissão de eventos  
**Teste:** TC-MESA-001

### Bug Comum 2: Transferência de Mesa Perde Pedidos
**Sintoma:** Ao transferir convidados, pedidos não vão junto  
**Causa Provável:** Query SQL não inclui pedidos na transferência  
**Solução:** Atualizar `restaurantId` e `tableId` dos pedidos  
**Teste:** TC-MESA-002

### Bug Comum 3: Mesa Liberada com Saldo Pendente
**Sintoma:** Sistema permite liberar mesa sem pagamento completo  
**Causa Provável:** Falta de validação antes de liberar  
**Solução:** Adicionar check de saldo antes de permitir liberação  
**Teste:** TC-MESA-004

---

## Financeiro

### Bug Comum 1: Saldo do Caixa Negativo
**Sintoma:** Caixa fica com saldo negativo após despesa  
**Causa Provável:** Permite despesa maior que saldo sem validação  
**Solução:** Adicionar validação ou permitir com confirmação  
**Teste:** TC-FIN-003

### Bug Comum 2: Fechamento de Turno Não Calcula Diferença
**Sintoma:** Diferença sempre mostra 0.00  
**Causa Provável:** Erro no cálculo ou conversão de tipos  
**Solução:** Verificar aritmética: `valorContado - (inicial + receitas - despesas)`  
**Teste:** TC-FIN-004

### Bug Comum 3: Sangria/Suprimento Não Aparece no Relatório
**Sintoma:** Movimentações de sangria/suprimento não listadas  
**Causa Provável:** Query não inclui esses tipos de transação  
**Solução:** Adicionar filtro para incluir todos os tipos  
**Teste:** TC-FIN-006, TC-FIN-007

---

# ✅ CHECKLIST DE VALIDAÇÃO FINAL

Antes de considerar os testes concluídos, verifique:

## Funcionalidade
- [ ] Todos os casos de teste críticos passaram
- [ ] Bugs críticos foram corrigidos
- [ ] Funcionalidades básicas operacionais

## Performance
- [ ] Páginas carregam em menos de 3 segundos
- [ ] WebSocket conecta e mantém conexão
- [ ] Sem memory leaks após uso prolongado

## Usabilidade
- [ ] Interface responsiva em mobile
- [ ] Mensagens de erro são claras
- [ ] Feedback visual para ações do usuário

## Segurança
- [ ] Validações no backend implementadas
- [ ] Permissões de usuário funcionam
- [ ] Dados sensíveis não expostos

## Dados
- [ ] Transações registradas corretamente
- [ ] Relatórios com dados precisos
- [ ] Histórico preservado

---

# 📞 CONTATOS PARA REPORTE DE BUGS

**Desenvolvedor Backend:** [Nome]  
**Email:** backend@exemplo.com  
**Telefone:** +244 XXX XXX XXX

**Desenvolvedor Frontend:** [Nome]  
**Email:** frontend@exemplo.com  
**Telefone:** +244 XXX XXX XXX

**Gerente de Projeto:** [Nome]  
**Email:** pm@exemplo.com  
**Telefone:** +244 XXX XXX XXX

---

# 📚 REFERÊNCIAS

- [Documentação da API](../server/routes.ts)
- [Schema do Banco de Dados](../shared/schema.ts)
- [Checklist Completa de Funcionalidades](./CHECKLIST_TESTES_ADMIN.md)

---

**Última Atualização:** 23/12/2025  
**Versão do Documento:** 1.0  
**Próxima Revisão:** Após correção de bugs identificados

