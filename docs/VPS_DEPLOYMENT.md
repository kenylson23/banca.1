# 🖥️ DEPLOY EM VPS PRÓPRIA - Guia Completo

---

## 📋 **REQUISITOS MÍNIMOS**

### **Hardware:**
```
CPU:     2 cores (4 cores recomendado)
RAM:     4 GB (8 GB recomendado)
Disco:   40 GB SSD
Rede:    100 Mbps
```

### **Software:**
```
OS:      Ubuntu 22.04 LTS (recomendado)
         ou Debian 12, CentOS 8+
Node.js: 18.x ou 20.x LTS
PostgreSQL: 14+
Redis:   7.x
Nginx:   1.24+
```

### **Capacidade Estimada:**

| VPS | Restaurantes | Usuários Simultâneos | Custo/mês |
|-----|--------------|----------------------|-----------|
| 2 cores, 4GB | 50-100 | 500-1000 | $10-20 |
| 4 cores, 8GB | 200-500 | 2000-5000 | $40-60 |
| 8 cores, 16GB | 500-1000 | 5000-10000 | $80-120 |

---

## 🚀 **OPÇÃO 1: SCRIPT DE INSTALAÇÃO AUTOMÁTICA**

### **Passo 1: Conectar à VPS**
```bash
ssh root@seu-servidor.com
```

### **Passo 2: Baixar e executar script**
```bash
wget https://raw.githubusercontent.com/seu-repo/nabancada/main/scripts/install-vps.sh
chmod +x install-vps.sh
./install-vps.sh
```

### **Passo 3: Configurar variáveis**
```bash
# O script perguntará:
- Domínio (ex: app.nabancada.com)
- Email para SSL (Let's Encrypt)
- Senha do PostgreSQL
- SESSION_SECRET
- CRON_SECRET
```

### **Passo 4: Pronto!**
```
Sistema disponível em: https://app.nabancada.com
```

---

## 🛠️ **OPÇÃO 2: INSTALAÇÃO MANUAL (Controle Total)**

### **PASSO 1: Atualizar Sistema**

```bash
# Atualizar pacotes
apt update && apt upgrade -y

# Instalar utilitários
apt install -y curl wget git build-essential
```

---

### **PASSO 2: Instalar Node.js 20 LTS**

```bash
# Adicionar repositório NodeSource
curl -fsSL https://deb.nodesource.com/setup_20.x | bash -

# Instalar Node.js
apt install -y nodejs

# Verificar
node --version  # v20.x.x
npm --version   # 10.x.x
```

---

### **PASSO 3: Instalar PostgreSQL 16**

```bash
# Adicionar repositório PostgreSQL
sh -c 'echo "deb http://apt.postgresql.org/pub/repos/apt $(lsb_release -cs)-pgdg main" > /etc/apt/sources.list.d/pgdg.list'
wget --quiet -O - https://www.postgresql.org/media/keys/ACCC4CF8.asc | apt-key add -

# Instalar
apt update
apt install -y postgresql-16 postgresql-contrib-16

# Iniciar serviço
systemctl start postgresql
systemctl enable postgresql

# Criar banco de dados
sudo -u postgres psql << EOF
CREATE DATABASE nabancada;
CREATE USER nabancada_user WITH ENCRYPTED PASSWORD 'senha_forte_aqui';
GRANT ALL PRIVILEGES ON DATABASE nabancada TO nabancada_user;
ALTER DATABASE nabancada OWNER TO nabancada_user;
\q
EOF

# Verificar
sudo -u postgres psql -c "SELECT version();"
```

---

### **PASSO 4: Instalar Redis**

```bash
# Instalar Redis
apt install -y redis-server

# Configurar para aceitar conexões locais
sed -i 's/bind 127.0.0.1/bind 0.0.0.0/' /etc/redis/redis.conf
sed -i 's/# requirepass foobared/requirepass senha_redis_forte/' /etc/redis/redis.conf

# Habilitar persistência
sed -i 's/appendonly no/appendonly yes/' /etc/redis/redis.conf

# Reiniciar
systemctl restart redis-server
systemctl enable redis-server

# Verificar
redis-cli ping  # PONG
```

---

### **PASSO 5: Instalar Nginx**

```bash
# Instalar Nginx
apt install -y nginx

# Parar Apache se estiver rodando
systemctl stop apache2 2>/dev/null
systemctl disable apache2 2>/dev/null

# Iniciar Nginx
systemctl start nginx
systemctl enable nginx

# Verificar
systemctl status nginx
```

---

### **PASSO 6: Instalar Certbot (SSL Grátis)**

```bash
# Instalar Certbot
apt install -y certbot python3-certbot-nginx

# Gerar certificado (substitua seu-dominio.com)
certbot --nginx -d app.nabancada.com -d www.nabancada.com

# Renovação automática
systemctl enable certbot.timer
```

---

### **PASSO 7: Criar Usuário para Aplicação**

```bash
# Criar usuário nabancada (mais seguro que rodar como root)
adduser --system --group --home /opt/nabancada nabancada

# Criar diretórios
mkdir -p /opt/nabancada/{app,logs,uploads}
chown -R nabancada:nabancada /opt/nabancada
```

---

### **PASSO 8: Clonar e Configurar Aplicação**

```bash
# Logar como usuário nabancada
su - nabancada

# Clonar repositório
cd /opt/nabancada
git clone https://github.com/seu-usuario/nabancada.git app
cd app

# Instalar dependências
npm install --production

# Build da aplicação
npm run build

# Criar arquivo .env
cat > .env << 'EOF'
NODE_ENV=production
PORT=5000
DATABASE_URL=postgresql://nabancada_user:senha_forte_aqui@localhost:5432/nabancada
REDIS_URL=redis://:senha_redis_forte@localhost:6379
SESSION_SECRET=gere_um_token_aleatorio_64_caracteres_aqui
CRON_SECRET=gere_outro_token_aleatorio_aqui
EOF

# Proteger arquivo .env
chmod 600 .env

# Voltar ao root
exit
```

---

### **PASSO 9: Configurar PM2 (Process Manager)**

```bash
# Instalar PM2 globalmente
npm install -g pm2

# Criar arquivo de configuração
cat > /opt/nabancada/app/ecosystem.config.js << 'EOF'
module.exports = {
  apps: [{
    name: 'nabancada',
    script: './dist/index.js',
    instances: 'max',  // Usa todos os cores disponíveis
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'production',
      PORT: 5000
    },
    error_file: '/opt/nabancada/logs/error.log',
    out_file: '/opt/nabancada/logs/out.log',
    log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
    merge_logs: true,
    max_memory_restart: '1G',
    watch: false,
    autorestart: true
  }]
}
EOF

# Iniciar aplicação com PM2
cd /opt/nabancada/app
sudo -u nabancada pm2 start ecosystem.config.js

# Configurar PM2 para iniciar no boot
pm2 startup systemd -u nabancada --hp /opt/nabancada
sudo -u nabancada pm2 save

# Verificar status
pm2 status
pm2 logs nabancada --lines 50
```

---

### **PASSO 10: Configurar Nginx como Reverse Proxy**

```bash
# Criar configuração do site
cat > /etc/nginx/sites-available/nabancada << 'EOF'
# HTTP → HTTPS redirect
server {
    listen 80;
    listen [::]:80;
    server_name app.nabancada.com www.nabancada.com;
    
    return 301 https://app.nabancada.com$request_uri;
}

# HTTPS
server {
    listen 443 ssl http2;
    listen [::]:443 ssl http2;
    server_name app.nabancada.com www.nabancada.com;

    # SSL (Certbot preenche automaticamente)
    ssl_certificate /etc/letsencrypt/live/app.nabancada.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/app.nabancada.com/privkey.pem;
    
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;
    ssl_prefer_server_ciphers on;
    
    # Security headers
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;

    # Logs
    access_log /var/log/nginx/nabancada-access.log;
    error_log /var/log/nginx/nabancada-error.log;

    # Client upload size
    client_max_body_size 10M;

    # Proxy para Node.js
    location / {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        
        # Headers
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        
        proxy_cache_bypass $http_upgrade;
        proxy_read_timeout 300s;
        proxy_connect_timeout 75s;
    }

    # WebSocket support
    location /ws {
        proxy_pass http://localhost:5000/ws;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_read_timeout 86400;
    }

    # Static files caching
    location ~* \.(jpg|jpeg|png|gif|ico|css|js|svg|woff|woff2|ttf|eot)$ {
        proxy_pass http://localhost:5000;
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types text/plain text/css text/xml text/javascript 
               application/x-javascript application/xml+rss 
               application/json application/javascript;
}
EOF

# Ativar site
ln -s /etc/nginx/sites-available/nabancada /etc/nginx/sites-enabled/

# Remover site default
rm -f /etc/nginx/sites-enabled/default

# Testar configuração
nginx -t

# Recarregar Nginx
systemctl reload nginx
```

---

### **PASSO 11: Configurar Firewall (UFW)**

```bash
# Instalar e habilitar UFW
apt install -y ufw

# Regras básicas
ufw default deny incoming
ufw default allow outgoing

# Permitir SSH (IMPORTANTE!)
ufw allow 22/tcp

# Permitir HTTP e HTTPS
ufw allow 80/tcp
ufw allow 443/tcp

# Habilitar firewall
ufw --force enable

# Verificar status
ufw status verbose
```

---

### **PASSO 12: Executar Migrations**

```bash
# Logar como nabancada
su - nabancada
cd /opt/nabancada/app

# Executar migrations
npm run db:push

# Criar Super Admin
npm run create-superadmin

# Voltar ao root
exit
```

---

### **PASSO 13: Configurar Cron Jobs**

```bash
# Editar crontab do usuário nabancada
crontab -e -u nabancada

# Adicionar job de verificação de subscrições (diariamente às 3h)
0 3 * * * cd /opt/nabancada/app && /usr/bin/node scripts/check-subscriptions.ts >> /opt/nabancada/logs/cron.log 2>&1

# Adicionar backup diário do banco (3:30 AM)
30 3 * * * /usr/bin/pg_dump -U nabancada_user nabancada | gzip > /opt/nabancada/backups/db-$(date +\%Y\%m\%d).sql.gz

# Limpar backups antigos (manter últimos 30 dias)
0 4 * * * find /opt/nabancada/backups -name "db-*.sql.gz" -mtime +30 -delete
```

---

### **PASSO 14: Configurar Backups Automáticos**

```bash
# Criar diretório de backups
mkdir -p /opt/nabancada/backups
chown nabancada:nabancada /opt/nabancada/backups

# Script de backup
cat > /opt/nabancada/backup.sh << 'EOF'
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="/opt/nabancada/backups"

# Backup PostgreSQL
pg_dump -U nabancada_user nabancada | gzip > $BACKUP_DIR/db-$DATE.sql.gz

# Backup Redis
redis-cli --rdb $BACKUP_DIR/redis-$DATE.rdb

# Backup uploads
tar -czf $BACKUP_DIR/uploads-$DATE.tar.gz /opt/nabancada/uploads

# Backup .env
cp /opt/nabancada/app/.env $BACKUP_DIR/env-$DATE.bak

echo "Backup completed: $DATE"
EOF

chmod +x /opt/nabancada/backup.sh
```

---

### **PASSO 15: Monitoramento e Logs**

```bash
# Ver logs da aplicação
pm2 logs nabancada

# Ver logs do Nginx
tail -f /var/log/nginx/nabancada-access.log
tail -f /var/log/nginx/nabancada-error.log

# Ver logs do PostgreSQL
tail -f /var/log/postgresql/postgresql-16-main.log

# Ver status dos serviços
systemctl status postgresql
systemctl status redis-server
systemctl status nginx
pm2 status

# Monitoramento de recursos
pm2 monit
htop
```

---

## 🔧 **COMANDOS ÚTEIS**

### **Gerenciar Aplicação:**
```bash
# Reiniciar
pm2 restart nabancada

# Parar
pm2 stop nabancada

# Ver logs em tempo real
pm2 logs nabancada

# Ver métricas
pm2 monit

# Atualizar código
cd /opt/nabancada/app
git pull
npm install
npm run build
pm2 restart nabancada
```

### **Gerenciar Banco de Dados:**
```bash
# Conectar ao PostgreSQL
sudo -u postgres psql nabancada

# Backup manual
pg_dump -U nabancada_user nabancada > backup.sql

# Restaurar backup
psql -U nabancada_user nabancada < backup.sql

# Ver tamanho do banco
sudo -u postgres psql -c "SELECT pg_size_pretty(pg_database_size('nabancada'));"
```

### **Gerenciar Redis:**
```bash
# Conectar ao Redis
redis-cli

# Ver info
redis-cli info

# Limpar cache
redis-cli FLUSHDB

# Ver chaves
redis-cli KEYS '*'
```

---

## 📊 **OTIMIZAÇÕES DE PERFORMANCE**

### **PostgreSQL (`/etc/postgresql/16/main/postgresql.conf`):**
```ini
# Memória (para VPS com 8GB RAM)
shared_buffers = 2GB
effective_cache_size = 6GB
maintenance_work_mem = 512MB
work_mem = 32MB

# Conexões
max_connections = 200

# Checkpoints
checkpoint_completion_target = 0.9
wal_buffers = 16MB
```

### **Redis (`/etc/redis/redis.conf`):**
```ini
# Memória máxima
maxmemory 1gb
maxmemory-policy allkeys-lru

# Persistência
save 900 1
save 300 10
save 60 10000
```

### **Nginx (`/etc/nginx/nginx.conf`):**
```nginx
worker_processes auto;
worker_connections 4096;

keepalive_timeout 65;
keepalive_requests 100;

client_max_body_size 10M;
```

---

## 🔒 **SEGURANÇA**

### **1. Fail2Ban (proteção contra brute force):**
```bash
apt install -y fail2ban

cat > /etc/fail2ban/jail.local << 'EOF'
[sshd]
enabled = true
maxretry = 3
bantime = 3600

[nginx-http-auth]
enabled = true
maxretry = 5
EOF

systemctl restart fail2ban
```

### **2. Atualizações Automáticas:**
```bash
apt install -y unattended-upgrades
dpkg-reconfigure -plow unattended-upgrades
```

### **3. Trocar Porta SSH:**
```bash
# Editar
nano /etc/ssh/sshd_config

# Mudar linha:
Port 2222  # em vez de 22

# Reiniciar
systemctl restart sshd

# Atualizar firewall
ufw allow 2222/tcp
ufw delete allow 22/tcp
```

---

## 📈 **MONITORAMENTO (Opcional)**

### **Instalar Netdata (Dashboard de Monitoramento):**
```bash
bash <(curl -Ss https://my-netdata.io/kickstart.sh)

# Acessar: http://seu-ip:19999
```

---

## 🚨 **TROUBLESHOOTING**

### **Aplicação não inicia:**
```bash
pm2 logs nabancada --err
# Verificar .env
# Verificar permissões
```

### **502 Bad Gateway:**
```bash
# Verificar se app está rodando
pm2 status

# Verificar logs do Nginx
tail -f /var/log/nginx/nabancada-error.log
```

### **Banco de dados não conecta:**
```bash
# Testar conexão
psql -U nabancada_user -d nabancada -h localhost

# Ver logs
tail -f /var/log/postgresql/postgresql-16-main.log
```

---

## 💰 **CUSTOS ESTIMADOS**

| Provedor | Especificações | Custo/mês | Capacidade |
|----------|----------------|-----------|------------|
| **DigitalOcean** | 2 cores, 4GB | $24 | 50-100 rest |
| **Hetzner** | 4 cores, 8GB | $10 | 200-500 rest |
| **Contabo** | 8 cores, 16GB | $13 | 500-1000 rest |
| **OVH** | 4 cores, 8GB | $20 | 200-500 rest |

---

## ✅ **CHECKLIST DE DEPLOY**

- [ ] VPS provisionada
- [ ] Node.js 20 instalado
- [ ] PostgreSQL configurado
- [ ] Redis configurado
- [ ] Nginx instalado
- [ ] SSL configurado (Certbot)
- [ ] Aplicação clonada
- [ ] .env configurado
- [ ] Build executado
- [ ] PM2 configurado
- [ ] Nginx reverse proxy configurado
- [ ] Firewall configurado
- [ ] Migrations executadas
- [ ] Super admin criado
- [ ] Cron jobs configurados
- [ ] Backups automatizados
- [ ] Monitoramento ativo

---

**Tempo estimado de instalação:** 2-3 horas (primeira vez)

**Dificuldade:** Intermediária

**Requer:** Conhecimentos básicos de Linux e terminal

Quer que eu crie o script de instalação automática (`install-vps.sh`)? 🚀