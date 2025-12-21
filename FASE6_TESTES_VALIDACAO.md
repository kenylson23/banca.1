# ✅ FASE 6: TESTES E VALIDAÇÃO COMPLETA
## Verificação de Todas as Funcionalidades Implementadas

**Data:** 21 de Dezembro de 2025  
**Status:** 🧪 EM EXECUÇÃO

---

## 🎯 OBJETIVO DA FASE 6

Testar e validar **TODAS as funcionalidades** implementadas nas Fases 1-5 para garantir que o sistema está 100% funcional e pronto para produção.

---

## 📋 CHECKLIST DE TESTES

### ✅ FASE 1: IDENTIFICAÇÃO DO CLIENTE

#### Teste 1.1: Detecção Automática de QR Code
```bash
# URL de teste
http://localhost:5000/r/seu-restaurante?tableId=mesa-001

Verificar:
☐ Toast "🎉 Bem-vindo!" aparece
☐ Console log: "[QR CODE] Mesa detectada: mesa-001"
☐ orderType = 'mesa'
☐ tableIdFromUrl armazenado
```

#### Teste 1.2: Campos de Identificação no Carrinho
```bash
Passos:
1. Adicionar produto ao carrinho
2. Abrir carrinho

Verificar:
☐ Card azul "Identificação (Opcional)" visível
☐ Campo de telefone presente
☐ Placeholder correto
☐ Campo nome aparece após telefone preenchido
```

#### Teste 1.3: Lookup Automático - Cliente Existente
```bash
Passos:
1. Digite telefone de cliente existente: "+244 912 345 678"
2. Aguardar 2 segundos

Verificar:
☐ Loading spinner aparece
☐ Card verde aparece: "Bem-vindo, [Nome]! 👋"
☐ Mostra pontos e tier
☐ Nome auto-preenchido
☐ Check verde no campo de telefone
```

#### Teste 1.4: Lookup Automático - Novo Cliente
```bash
Passos:
1. Digite telefone não cadastrado: "+244 923 999 999"
2. Aguardar 2 segundos

Verificar:
☐ Loading spinner aparece
☐ Card amarelo aparece: "Novo cliente! 🎉"
☐ Mensagem: "Você vai começar a acumular pontos"
☐ Campo nome disponível
```

#### Teste 1.5: Pedido Sem Identificação
```bash
Passos:
1. NÃO preencher telefone
2. Finalizar pedido

Verificar:
☐ Pedido é criado normalmente
☐ customerId = NULL
☐ Não há erro
☐ Sistema não bloqueia
```

---

### ✅ FASE 2: SISTEMA DE CUPONS

#### Teste 2.1: Campo de Cupom Visível para Mesa
```bash
Passos:
1. Cliente identificado (telefone preenchido)
2. Olhar no carrinho

Verificar:
☐ Card "Cupom de Desconto" visível
☐ Só aparece se identificado
☐ Card é expansível
```

#### Teste 2.2: Aplicar Cupom Válido
```bash
Passos:
1. Expandir card de cupom
2. Digite: "NATAL2024" (ou cupom válido do seu sistema)
3. Clicar "Aplicar"

Verificar:
☐ Loading spinner durante validação
☐ Card verde aparece
☐ Mensagem: "Desconto de Kz X aplicado!"
☐ Badge "Aplicado" no header do card
☐ Desconto aparece no resumo
☐ Total final atualizado
```

#### Teste 2.3: Aplicar Cupom Inválido
```bash
Passos:
1. Digite: "INVALIDO123"
2. Clicar "Aplicar"

Verificar:
☐ Card vermelho aparece
☐ Mensagem de erro clara
☐ Desconto NÃO é aplicado
☐ Total não muda
```

#### Teste 2.4: Cupom com Valor Mínimo
```bash
Passos:
1. Carrinho com Kz 5.000
2. Aplicar cupom que exige Kz 10.000 mínimo

Verificar:
☐ Mensagem: "Valor mínimo: Kz 10.000"
☐ Cupom não é aplicado
☐ Total não muda
```

#### Teste 2.5: Remover Cupom
```bash
Passos:
1. Cupom aplicado
2. Limpar campo de cupom
3. Digitar novo cupom ou deixar vazio

Verificar:
☐ Desconto removido do resumo
☐ Total final atualizado
☐ Badge "Aplicado" removido
```

---

### ✅ FASE 3: PROGRAMA DE FIDELIDADE

#### Teste 3.1: Mostrar Saldo de Pontos
```bash
Passos:
1. Cliente identificado com pontos
2. Abrir carrinho

Verificar:
☐ Card "Usar Pontos" visível
☐ Saldo correto: "250 pontos"
☐ Conversão: "= Kz 2.500"
☐ Só aparece se programa ativo
```

#### Teste 3.2: Resgatar Pontos
```bash
Passos:
1. Expandir card "Usar Pontos"
2. Ativar switch
3. Digite: 200 pontos
4. Ver desconto

Verificar:
☐ Input numérico aparece
☐ Mínimo e máximo funcionam
☐ Desconto calculado: "Kz 2.000"
☐ Badge com pontos no header do card
☐ Desconto no resumo
☐ Total final atualizado
```

#### Teste 3.3: Resgatar Mais Pontos que Tem
```bash
Passos:
1. Cliente tem 250 pontos
2. Tentar resgatar 300 pontos

Verificar:
☐ Input limita ao máximo (250)
☐ Ou mensagem de erro
☐ Sistema não quebra
```

#### Teste 3.4: Pontos Abaixo do Mínimo
```bash
Passos:
1. Cliente tem 50 pontos
2. Mínimo é 100 pontos

Verificar:
☐ Switch desabilitado ou
☐ Mensagem clara de pontos insuficientes
☐ Sistema não permite resgate
```

#### Teste 3.5: Cupom + Pontos Juntos
```bash
Passos:
1. Aplicar cupom: -Kz 5.000
2. Usar 200 pontos: -Kz 2.000
3. Ver resumo

Verificar:
☐ Ambos os descontos aparecem
☐ "Você economizou: Kz 7.000"
☐ Total final correto
☐ Pedido envia ambos ao backend
```

#### Teste 3.6: Pontos a Ganhar
```bash
Passos:
1. Pedido de Kz 23.000 (após descontos)
2. Ver resumo

Verificar:
☐ Mostra: "Você vai ganhar +46 pontos"
☐ Cálculo correto
☐ Ícone de presente
```

---

### ✅ FASE 4: LOGIN DE CLIENTE

#### Teste 4.1: Botão Login no Header
```bash
Passos:
1. Acessar menu via QR Code
2. Ver header

Verificar:
☐ Botão "Entrar" visível (se não logado)
☐ Ou "👤 X pontos" (se logado)
☐ Responsivo (esconde texto em mobile)
```

#### Teste 4.2: Login via OTP
```bash
Passos:
1. Clicar botão "Entrar"
2. Digite telefone
3. Receber OTP
4. Confirmar código

Verificar:
☐ Dialog abre
☐ OTP enviado
☐ Login realizado
☐ Dialog fecha
☐ Header atualiza
```

#### Teste 4.3: Header Após Login
```bash
Passos:
1. Fazer login
2. Ver header

Verificar:
☐ Avatar aparece
☐ "Meus Pontos: 250"
☐ Gradient amarelo destaca
☐ Tooltip mostra tier
```

#### Teste 4.4: Auto-preenchimento
```bash
Passos:
1. Fazer login
2. Adicionar produto ao carrinho
3. Abrir carrinho

Verificar:
☐ Nome preenchido automaticamente
☐ Telefone preenchido automaticamente
☐ Card verde de identificação aparece
☐ Pontos visíveis
```

#### Teste 4.5: Logout e Login Novamente
```bash
Passos:
1. Fazer logout
2. Fazer login novamente

Verificar:
☐ Dados persistem
☐ Pontos atualizados
☐ Sessão mantida
```

---

### ✅ FASE 5: UX MELHORADA

#### Teste 5.1: Banner de Incentivo
```bash
Passos:
1. Acessar via QR Code SEM login
2. Carrinho vazio

Verificar:
☐ Banner azul/roxo aparece
☐ Mensagem: "Ganhe pontos em cada pedido!"
☐ Botão "Ver benefícios"
☐ Animação suave de entrada
```

#### Teste 5.2: Banner Desaparece
```bash
Passos:
1. Banner visível
2. Adicionar produto ao carrinho

Verificar:
☐ Banner desaparece
☐ Não incomoda durante compra
```

#### Teste 5.3: Botão "Ver Benefícios"
```bash
Passos:
1. Banner visível
2. Clicar "Ver benefícios"

Verificar:
☐ Abre informações de fidelidade ou
☐ Abre carrinho (se implementado assim)
☐ Foco no campo de telefone
```

#### Teste 5.4: Botão "Chamar Garçom" (se implementado)
```bash
Passos:
1. Acessar via QR Code
2. Ver canto inferior esquerdo

Verificar:
☐ Botão amarelo visível
☐ Ícone de sino
☐ Animação pulse
☐ Só aparece em pedidos mesa
```

#### Teste 5.5: Clicar "Chamar Garçom"
```bash
Passos:
1. Clicar botão chamar garçom

Verificar:
☐ Toast: "Garçom chamado! 👋"
☐ Animação para
☐ Feedback visual claro
```

---

### ✅ INTEGRAÇÃO COMPLETA

#### Teste 6.1: Fluxo Completo - Cliente Novo
```bash
Cenário: Cliente nunca usou o sistema

Passos:
1. Escanear QR Code → tableId detectado ✅
2. Ver banner de incentivo ✅
3. Adicionar 3 produtos ✅
4. Abrir carrinho ✅
5. Informar telefone novo ✅
6. Card amarelo: "Novo cliente!" ✅
7. Informar nome ✅
8. Finalizar pedido ✅

Backend deve:
☐ Criar cliente automaticamente
☐ Vincular customerId ao pedido
☐ Vincular tableId ao pedido
☐ Acumular pontos (primeiro pedido!)
☐ Mesa mudar para "ocupada"
```

#### Teste 6.2: Fluxo Completo - Cliente Fiel
```bash
Cenário: Cliente com 250 pontos

Passos:
1. Escanear QR Code ✅
2. Clicar "Entrar" no header ✅
3. Login via OTP ✅
4. Header mostra "250 pontos" ✅
5. Adicionar produtos (Kz 30.000) ✅
6. Abrir carrinho ✅
7. Dados preenchidos automaticamente ✅
8. Card verde: "Bem-vindo, João!" ✅
9. Expandir cupom ✅
10. Aplicar "NATAL2024" → -Kz 5.000 ✅
11. Expandir pontos ✅
12. Usar 200 pontos → -Kz 2.000 ✅
13. Ver resumo:
    Subtotal: Kz 30.000
    Cupom: -Kz 5.000
    Pontos: -Kz 2.000
    Economizou: Kz 7.000
    Total: Kz 23.000
    Vai ganhar: +46 pontos ✅
14. Finalizar pedido ✅

Backend deve:
☐ Validar cupom
☐ Debitar 200 pontos
☐ Aplicar descontos
☐ Creditar +46 novos pontos
☐ Vincular à mesa
☐ Registrar histórico
```

#### Teste 6.3: Fluxo Completo - Sem Identificação
```bash
Cenário: Cliente prefere não se identificar

Passos:
1. Escanear QR Code ✅
2. Adicionar produtos ✅
3. Abrir carrinho ✅
4. IGNORAR campos de identificação ✅
5. Finalizar pedido ✅

Verificar:
☐ Pedido criado normalmente
☐ Sem cupons (não identificado)
☐ Sem pontos (não identificado)
☐ Sistema não bloqueia
☐ UX não frustra
```

---

### ✅ TESTES DE EDGE CASES

#### Teste 7.1: Múltiplos Pedidos na Mesma Mesa
```bash
Passos:
1. Cliente 1 faz pedido via QR Code
2. Cliente 2 faz pedido via QR Code (mesma mesa)
3. Ver em "Mesas Abertas"

Verificar:
☐ Ambos os pedidos vinculados à mesa
☐ Total da mesa correto
☐ PDV pode fechar conta completa
```

#### Teste 7.2: QR Code Sem tableId
```bash
Passos:
1. Acessar: /r/restaurante (sem ?tableId=)

Verificar:
☐ Sistema não quebra
☐ orderType não é "mesa"
☐ Campos de identificação não aparecem
☐ Funciona como menu normal
```

#### Teste 7.3: tableId Inválido
```bash
Passos:
1. Acessar: /r/restaurante?tableId=mesa-999
2. Fazer pedido

Verificar:
☐ Backend valida mesa existe
☐ Erro claro se não existe
☐ Ou pedido sem mesa (fail gracefully)
```

#### Teste 7.4: Cupom Expirado
```bash
Passos:
1. Aplicar cupom expirado

Verificar:
☐ Mensagem: "Cupom expirado"
☐ Não aplica desconto
☐ Sistema não quebra
```

#### Teste 7.5: Pontos Durante Pedido
```bash
Passos:
1. Cliente tem 200 pontos
2. Usar 150 pontos
3. Antes de finalizar, alguém usa pontos do cliente em outro dispositivo

Verificar:
☐ Sistema valida pontos atuais
☐ Erro se insuficientes
☐ Ou bloqueia resgate otimista
```

---

### ✅ TESTES DE PERFORMANCE

#### Teste 8.1: Lookup Rápido
```bash
Métrica: Lookup de cliente deve ser < 500ms

Verificar:
☐ Loading spinner não fica muito tempo
☐ Resposta rápida
☐ UX fluida
```

#### Teste 8.2: Validação de Cupom Rápida
```bash
Métrica: Validação deve ser < 300ms

Verificar:
☐ Feedback imediato
☐ Não trava interface
```

#### Teste 8.3: Carrinho com Muitos Itens
```bash
Passos:
1. Adicionar 20 produtos
2. Abrir carrinho
3. Aplicar cupom e pontos

Verificar:
☐ Interface não trava
☐ Cálculos corretos
☐ Scroll suave
```

---

### ✅ TESTES MOBILE

#### Teste 9.1: Responsividade
```bash
Dispositivos: iPhone, Android, Tablet

Verificar:
☐ Header compacto em mobile
☐ Cards responsivos
☐ Campos de input acessíveis
☐ Botões flutuantes não cobrem conteúdo
☐ Texto legível
```

#### Teste 9.2: Teclado Virtual
```bash
Passos:
1. Abrir campo de telefone em mobile
2. Teclado numérico aparece

Verificar:
☐ Tipo correto de teclado (tel)
☐ Scroll automático para campo
☐ Input não fica coberto
```

#### Teste 9.3: Touch Gestures
```bash
Verificar:
☐ Tap nos cards funciona
☐ Botões têm área mínima (44x44px)
☐ Sem conflitos de touch
```

---

## 🔧 TESTES DE INTEGRAÇÃO BACKEND

### Teste 10.1: Endpoint de Pedidos Públicos
```bash
POST /api/public/orders

Payload:
{
  "restaurantSlug": "restaurante-abc",
  "orderType": "mesa",
  "tableId": "mesa-001",
  "customerId": "uuid-cliente",
  "couponCode": "NATAL2024",
  "redeemPoints": 200,
  "items": [...]
}

Verificar:
☐ 200 OK
☐ Pedido criado
☐ customerId vinculado
☐ tableId vinculado
☐ Cupom validado e aplicado
☐ Pontos debitados
☐ Novos pontos creditados
☐ Mesa atualizada para "ocupada"
```

### Teste 10.2: Lookup de Cliente
```bash
GET /api/public/customers/lookup?restaurantId=X&phone=+244912345678

Verificar:
☐ 200 OK
☐ Retorna cliente se existe
☐ Retorna {found: false} se não existe
☐ Inclui dados de fidelidade
☐ Resposta < 500ms
```

### Teste 10.3: Validação de Cupom
```bash
POST /api/public/coupons/validate

Payload:
{
  "restaurantId": "uuid",
  "code": "NATAL2024",
  "orderValue": 30000,
  "orderType": "mesa",
  "customerId": "uuid"
}

Verificar:
☐ 200 OK
☐ {valid: true/false}
☐ discountAmount calculado
☐ Mensagem clara se inválido
```

---

## 📊 MATRIZ DE TESTES

| Categoria | Testes | Passados | Falhados | Status |
|-----------|--------|----------|----------|--------|
| Identificação | 5 | - | - | ⏳ |
| Cupons | 5 | - | - | ⏳ |
| Fidelidade | 6 | - | - | ⏳ |
| Login | 5 | - | - | ⏳ |
| UX | 5 | - | - | ⏳ |
| Integração | 3 | - | - | ⏳ |
| Edge Cases | 5 | - | - | ⏳ |
| Performance | 3 | - | - | ⏳ |
| Mobile | 3 | - | - | ⏳ |
| Backend | 3 | - | - | ⏳ |
| **TOTAL** | **43** | **-** | **-** | ⏳ |

---

## 🐛 BUGS ENCONTRADOS

### Nenhum bug identificado ainda
Após execução dos testes, listaremos aqui qualquer problema encontrado.

---

## ✅ CHECKLIST PRÉ-PRODUÇÃO

Antes de ir para produção, verificar:

### Código
- [ ] Todos os console.log removidos ou em modo debug
- [ ] Tratamento de erros em todas as chamadas API
- [ ] Loading states em todos os lugares necessários
- [ ] Validações client-side e server-side
- [ ] TypeScript sem erros

### Banco de Dados
- [ ] Migration executada em produção
- [ ] Índices criados
- [ ] Backup configurado
- [ ] Teste de rollback

### Performance
- [ ] Imagens otimizadas
- [ ] Lazy loading implementado
- [ ] API responses < 500ms
- [ ] Bundle size aceitável

### Segurança
- [ ] Validação server-side de cupons
- [ ] Anti-fraude em pontos
- [ ] Rate limiting em APIs públicas
- [ ] CORS configurado
- [ ] SQL injection prevenido

### UX
- [ ] Mensagens de erro claras
- [ ] Loading states visíveis
- [ ] Feedback visual em todas as ações
- [ ] Responsivo em todos os dispositivos
- [ ] Acessibilidade (ARIA labels)

### Monitoramento
- [ ] Logs configurados
- [ ] Alertas de erro
- [ ] Analytics de uso
- [ ] Rastreamento de conversão

---

## 📝 RELATÓRIO FINAL

Após executar todos os testes, preencher:

### Resumo
- Total de testes: 43
- Passados: __
- Falhados: __
- Taxa de sucesso: __%

### Problemas Críticos
Lista de bugs que impedem produção:
1. (nenhum esperado)

### Problemas Menores
Lista de melhorias sugeridas:
1. (a definir após testes)

### Recomendação
- [ ] ✅ APROVADO PARA PRODUÇÃO
- [ ] ⚠️ APROVADO COM RESSALVAS
- [ ] ❌ NÃO APROVADO (requer correções)

---

## 🎯 PRÓXIMOS PASSOS

1. **Executar todos os testes** listados acima
2. **Documentar resultados** neste arquivo
3. **Corrigir bugs** encontrados (se houver)
4. **Re-testar** após correções
5. **Deploy em staging** para testes finais
6. **Deploy em produção** com monitoramento

---

**Status da Fase 6:** 🧪 PRONTO PARA INICIAR TESTES

Você quer que eu:
1. **Execute os testes** e documente os resultados?
2. **Crie scripts de teste automatizados**?
3. **Passe para deploy/produção** (assumindo que tudo funciona)?
4. **Outra ação**?
