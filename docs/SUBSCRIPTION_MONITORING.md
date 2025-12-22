# 📊 Monitoramento de Subscrições

Sistema automatizado para verificar e gerenciar subscrições expiradas e próximas do vencimento.

---

## 🎯 Funcionalidades

### 1. **Verificação de Subscrições Expiradas**
- Detecta subscrições com `currentPeriodEnd` no passado
- Auto-atualiza status de `trial` ou `ativa` para `expirada`
- Registra logs detalhados de cada atualização

### 2. **Alertas de Subscrições Expirando**
- Lista subscrições que expiram nos próximos 7 dias
- Categoriza por prioridade:
  - 🚨 **Alta** (≤1 dia)
  - ⚠️ **Média** (2-3 dias)
  - 📢 **Baixa** (4-7 dias)

### 3. **Relatório de Status**
- Contagem de subscrições por status
- Contagem de subscrições por plano
- Resumo visual com emojis

---

## 🚀 Como Usar

### **Opção 1: Execução Manual**

```bash
# Executar localmente
npm run check-subscriptions

# Ou com tsx diretamente
tsx scripts/check-subscriptions.ts
```

### **Opção 2: Webhook/Cron (Produção)**

#### **A. Configurar Secret Token**

Adicione ao `.env` ou variáveis de ambiente do Render:

```bash
CRON_SECRET=seu-token-secreto-aqui-aleatorio-123456
```

#### **B. Chamar via HTTP POST**

**Com header (recomendado):**
```bash
curl -X POST https://seu-app.onrender.com/api/cron/check-subscriptions \
  -H "x-cron-secret: seu-token-secreto-aqui-aleatorio-123456"
```

**Com query parameter:**
```bash
curl -X POST "https://seu-app.onrender.com/api/cron/check-subscriptions?token=seu-token-secreto-aqui-aleatorio-123456"
```

#### **C. Configurar Cron Job Externo**

**Render Cron Jobs (Recomendado):**
```yaml
# render.yaml
services:
  - type: cron
    name: subscription-monitor
    schedule: "0 3 * * *"  # Diariamente às 3h UTC
    dockerCommand: npm run check-subscriptions
```

**Alternativas:**
- **cron-job.org** (gratuito)
- **EasyCron** (gratuito/pago)
- **GitHub Actions** (workflow agendado)

Exemplo de configuração no cron-job.org:
- URL: `https://seu-app.onrender.com/api/cron/check-subscriptions`
- Method: POST
- Custom Header: `x-cron-secret: seu-token`
- Schedule: `0 3 * * *` (diariamente às 3h)

---

## 📋 Resposta da API

### **Sucesso (200 OK):**
```json
{
  "success": true,
  "timestamp": "2024-12-22T03:00:00.000Z",
  "results": {
    "expired": {
      "expired": 3,
      "updated": 3
    },
    "expiring": {
      "total": 5,
      "alerts": [
        {
          "restaurant": "Restaurante ABC",
          "plan": "Profissional",
          "daysLeft": 1,
          "priority": "high"
        }
      ]
    }
  }
}
```

### **Erro de Autenticação (401):**
```json
{
  "message": "Unauthorized. Invalid cron secret."
}
```

### **Erro Interno (500):**
```json
{
  "success": false,
  "message": "Error checking subscriptions",
  "error": "Database connection failed"
}
```

---

## 🔍 Logs Gerados

### **Console Output Exemplo:**

```
🚀 INICIANDO VERIFICAÇÃO DE SUBSCRIÇÕES
📅 Data/Hora: 22/12/2024, 03:00:00

════════════════════════════════════════════════════════════

🔍 Checking for expired subscriptions...
⚠️  Found 2 expired subscription(s)
  ✅ Updated Restaurante ABC (Profissional) - expired 3 days ago
  ✅ Updated Restaurante XYZ (Básico) - expired 1 days ago

📊 Summary: 2/2 subscriptions updated to 'expirada'

🔍 Checking for expiring subscriptions...
⚠️  Found 5 subscription(s) expiring soon:

  🚨 Restaurante 123 (Empresarial)
     Status: ativa | Expira em: 1 dia(s)
     Email: contato@restaurante123.com
     Auto-renovar: Não

  ⚠️  Restaurante 456 (Profissional)
     Status: trial | Expira em: 3 dia(s)
     Email: contato@restaurante456.com
     Auto-renovar: Não

📊 Summary: 5 subscription(s) expiring soon
   🚨 High priority (≤1 day): 1
   ⚠️  Medium priority (2-3 days): 2
   📢 Low priority (4-7 days): 2

📊 RELATÓRIO DE SUBSCRIÇÕES

════════════════════════════════════════════════════════════

📈 Status das Subscrições:
  ✅ ativa       : 45
  🎁 trial       : 12
  ❌ expirada    : 3
  ⏸️  suspensa    : 2
  🚫 cancelada   : 1

💳 Subscrições por Plano:
  • Básico              : 20
  • Profissional        : 28
  • Empresarial         : 12
  • Enterprise          : 3

════════════════════════════════════════════════════════════

✅ VERIFICAÇÃO CONCLUÍDA COM SUCESSO
```

---

## ⚙️ Configuração Recomendada

### **Frequência de Execução:**
- **Produção:** Diariamente às 3h UTC (horário de baixo tráfego)
- **Desenvolvimento:** Manual quando necessário

### **Notificações (Futuras):**
O sistema prepara dados para enviar emails:
- 7 dias antes: "Seu plano está acabando"
- 3 dias antes: "Renove sua subscrição"
- 1 dia antes: "Sua subscrição expira amanhã"
- No vencimento: "Sua subscrição expirou"

### **Integração com Email:**
Descomentar no código:
```typescript
// if (daysUntilExpiration === 7) sendEmail7DaysWarning(sub);
// if (daysUntilExpiration === 3) sendEmail3DaysWarning(sub);
// if (daysUntilExpiration === 1) sendEmail1DayWarning(sub);
```

---

## 🔒 Segurança

1. **Token Secreto:** Sempre use `CRON_SECRET` forte em produção
2. **HTTPS:** Sempre use HTTPS em produção
3. **Rate Limiting:** Considere adicionar rate limit na rota
4. **IP Whitelist:** (Opcional) Restringir IPs permitidos

---

## 📊 Métricas e Monitoramento

O job pode ser monitorado via:
- Logs do Render Dashboard
- Resposta HTTP 200/500
- Tempo de execução
- Número de subscrições processadas

---

## 🛠️ Troubleshooting

### **Erro: "Database connection failed"**
- Verificar DATABASE_URL
- Verificar conectividade com banco

### **Erro: "Unauthorized"**
- Verificar CRON_SECRET configurado
- Verificar token enviado no request

### **Job não executa automaticamente**
- Verificar configuração do cron job externo
- Verificar logs do serviço de cron
- Testar endpoint manualmente

---

## 📝 TODO / Melhorias Futuras

- [ ] Integração com serviço de email (SendGrid, AWS SES)
- [ ] Dashboard de métricas de subscrições
- [ ] Notificações via SMS (Twilio)
- [ ] Slack/Discord webhooks para alertas
- [ ] Auto-renovação com gateway de pagamento
- [ ] Histórico de execuções do job
