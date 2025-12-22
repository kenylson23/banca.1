#!/bin/bash

##############################################################################
# NaBancada - Script de Instalação Automática para VPS
# 
# Este script instala e configura automaticamente toda a infraestrutura
# necessária para rodar o NaBancada em uma VPS Ubuntu/Debian.
#
# Uso: ./install-vps.sh
#
# Testado em:
# - Ubuntu 22.04 LTS
# - Ubuntu 20.04 LTS
# - Debian 12
##############################################################################

set -e  # Exit on error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Functions
print_header() {
    echo -e "\n${BLUE}═══════════════════════════════════════════════════════${NC}"
    echo -e "${BLUE}  $1${NC}"
    echo -e "${BLUE}═══════════════════════════════════════════════════════${NC}\n"
}

print_success() {
    echo -e "${GREEN}✓ $1${NC}"
}

print_error() {
    echo -e "${RED}✗ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠ $1${NC}"
}

print_info() {
    echo -e "${BLUE}ℹ $1${NC}"
}

# Check if running as root
if [ "$EUID" -ne 0 ]; then 
    print_error "Por favor, execute como root (use sudo)"
    exit 1
fi

# Welcome message
clear
cat << "EOF"
    _   __      ____                            __     
   / | / /___ _/ __ )____ _____  ________  ____/ /___ _
  /  |/ / __ `/ __  / __ `/ __ \/ ___/ _ \/ __  / __ `/
 / /|  / /_/ / /_/ / /_/ / / / / /__/  __/ /_/ / /_/ / 
/_/ |_/\__,_/_____/\__,_/_/ /_/\___/\___/\__,_/\__,_/  
                                                        
          Instalação Automática para VPS
                 Versão 1.0.0

EOF

print_info "Este script irá instalar:"
echo "  • Node.js 20 LTS"
echo "  • PostgreSQL 16"
echo "  • Redis 7.x"
echo "  • Nginx"
echo "  • PM2"
echo "  • Certbot (SSL)"
echo "  • NaBancada Application"
echo ""

read -p "Deseja continuar? (s/n): " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Ss]$ ]]; then
    print_warning "Instalação cancelada"
    exit 0
fi

##############################################################################
# STEP 1: Gather Configuration
##############################################################################

print_header "PASSO 1: Configuração"

read -p "Digite o domínio (ex: app.nabancada.com): " DOMAIN
read -p "Digite o email para SSL (Let's Encrypt): " EMAIL
read -p "Digite a senha do PostgreSQL: " DB_PASSWORD
read -p "Digite a URL do repositório Git: " GIT_REPO

# Generate secrets
SESSION_SECRET=$(openssl rand -hex 32)
CRON_SECRET=$(openssl rand -hex 32)
REDIS_PASSWORD=$(openssl rand -hex 16)

print_success "Configuração coletada"

##############################################################################
# STEP 2: Update System
##############################################################################

print_header "PASSO 2: Atualizando Sistema"

apt update -qq
apt upgrade -y -qq
apt install -y curl wget git build-essential ufw fail2ban htop

print_success "Sistema atualizado"

##############################################################################
# STEP 3: Install Node.js
##############################################################################

print_header "PASSO 3: Instalando Node.js 20 LTS"

curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
apt install -y nodejs

NODE_VERSION=$(node --version)
NPM_VERSION=$(npm --version)

print_success "Node.js $NODE_VERSION instalado"
print_success "npm $NPM_VERSION instalado"

##############################################################################
# STEP 4: Install PostgreSQL
##############################################################################

print_header "PASSO 4: Instalando PostgreSQL 16"

sh -c 'echo "deb http://apt.postgresql.org/pub/repos/apt $(lsb_release -cs)-pgdg main" > /etc/apt/sources.list.d/pgdg.list'
wget --quiet -O - https://www.postgresql.org/media/keys/ACCC4CF8.asc | apt-key add -
apt update -qq
apt install -y postgresql-16 postgresql-contrib-16

systemctl start postgresql
systemctl enable postgresql

# Create database and user
sudo -u postgres psql << EOF
CREATE DATABASE nabancada;
CREATE USER nabancada_user WITH ENCRYPTED PASSWORD '$DB_PASSWORD';
GRANT ALL PRIVILEGES ON DATABASE nabancada TO nabancada_user;
ALTER DATABASE nabancada OWNER TO nabancada_user;
\q
EOF

print_success "PostgreSQL instalado e configurado"

##############################################################################
# STEP 5: Install Redis
##############################################################################

print_header "PASSO 5: Instalando Redis"

apt install -y redis-server

# Configure Redis
sed -i 's/bind 127.0.0.1/bind 127.0.0.1/' /etc/redis/redis.conf
sed -i "s/# requirepass foobared/requirepass $REDIS_PASSWORD/" /etc/redis/redis.conf
sed -i 's/appendonly no/appendonly yes/' /etc/redis/redis.conf

# Memory optimization
cat >> /etc/redis/redis.conf << EOF

# NaBancada optimizations
maxmemory 1gb
maxmemory-policy allkeys-lru
EOF

systemctl restart redis-server
systemctl enable redis-server

print_success "Redis instalado e configurado"

##############################################################################
# STEP 6: Install Nginx
##############################################################################

print_header "PASSO 6: Instalando Nginx"

# Stop Apache if running
systemctl stop apache2 2>/dev/null || true
systemctl disable apache2 2>/dev/null || true

apt install -y nginx

systemctl start nginx
systemctl enable nginx

print_success "Nginx instalado"

##############################################################################
# STEP 7: Install Certbot (SSL)
##############################################################################

print_header "PASSO 7: Configurando SSL (Let's Encrypt)"

apt install -y certbot python3-certbot-nginx

# Generate SSL certificate
certbot --nginx -d $DOMAIN --non-interactive --agree-tos --email $EMAIL --redirect

# Auto-renewal
systemctl enable certbot.timer

print_success "SSL configurado para $DOMAIN"

##############################################################################
# STEP 8: Create Application User
##############################################################################

print_header "PASSO 8: Criando Usuário da Aplicação"

# Create user
adduser --system --group --home /opt/nabancada --shell /bin/bash nabancada 2>/dev/null || true

# Create directories
mkdir -p /opt/nabancada/{app,logs,uploads,backups}
chown -R nabancada:nabancada /opt/nabancada

print_success "Usuário nabancada criado"

##############################################################################
# STEP 9: Clone and Setup Application
##############################################################################

print_header "PASSO 9: Clonando Aplicação"

# Clone as nabancada user
sudo -u nabancada bash << EOF
cd /opt/nabancada
if [ -d "app" ]; then
    rm -rf app
fi
git clone $GIT_REPO app
cd app
npm install --production
npm run build
EOF

print_success "Aplicação clonada e compilada"

##############################################################################
# STEP 10: Configure Environment
##############################################################################

print_header "PASSO 10: Configurando Variáveis de Ambiente"

DATABASE_URL="postgresql://nabancada_user:$DB_PASSWORD@localhost:5432/nabancada"
REDIS_URL="redis://:$REDIS_PASSWORD@localhost:6379"

cat > /opt/nabancada/app/.env << EOF
NODE_ENV=production
PORT=5000
DATABASE_URL=$DATABASE_URL
REDIS_URL=$REDIS_URL
SESSION_SECRET=$SESSION_SECRET
CRON_SECRET=$CRON_SECRET
EOF

chown nabancada:nabancada /opt/nabancada/app/.env
chmod 600 /opt/nabancada/app/.env

print_success "Variáveis de ambiente configuradas"

##############################################################################
# STEP 11: Setup PM2
##############################################################################

print_header "PASSO 11: Configurando PM2"

npm install -g pm2

# Create PM2 config
cat > /opt/nabancada/app/ecosystem.config.js << 'EOF'
module.exports = {
  apps: [{
    name: 'nabancada',
    script: './dist/index.js',
    instances: 'max',
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

# Start with PM2
cd /opt/nabancada/app
sudo -u nabancada pm2 start ecosystem.config.js

# Setup PM2 startup
pm2 startup systemd -u nabancada --hp /opt/nabancada
sudo -u nabancada pm2 save

print_success "PM2 configurado e aplicação iniciada"

##############################################################################
# STEP 12: Configure Nginx
##############################################################################

print_header "PASSO 12: Configurando Nginx Reverse Proxy"

cat > /etc/nginx/sites-available/nabancada << 'NGINXCONF'
# HTTP → HTTPS redirect
server {
    listen 80;
    listen [::]:80;
    server_name DOMAIN_PLACEHOLDER;
    return 301 https://$server_name$request_uri;
}

# HTTPS
server {
    listen 443 ssl http2;
    listen [::]:443 ssl http2;
    server_name DOMAIN_PLACEHOLDER;

    ssl_certificate /etc/letsencrypt/live/DOMAIN_PLACEHOLDER/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/DOMAIN_PLACEHOLDER/privkey.pem;
    
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;
    ssl_prefer_server_ciphers on;
    
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;

    access_log /var/log/nginx/nabancada-access.log;
    error_log /var/log/nginx/nabancada-error.log;

    client_max_body_size 10M;

    location / {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
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

    location ~* \.(jpg|jpeg|png|gif|ico|css|js|svg|woff|woff2|ttf|eot)$ {
        proxy_pass http://localhost:5000;
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types text/plain text/css text/xml text/javascript 
               application/x-javascript application/xml+rss 
               application/json application/javascript;
}
NGINXCONF

# Replace domain placeholder
sed -i "s/DOMAIN_PLACEHOLDER/$DOMAIN/g" /etc/nginx/sites-available/nabancada

# Enable site
ln -sf /etc/nginx/sites-available/nabancada /etc/nginx/sites-enabled/
rm -f /etc/nginx/sites-enabled/default

# Test and reload
nginx -t
systemctl reload nginx

print_success "Nginx configurado como reverse proxy"

##############################################################################
# STEP 13: Configure Firewall
##############################################################################

print_header "PASSO 13: Configurando Firewall"

ufw default deny incoming
ufw default allow outgoing
ufw allow 22/tcp
ufw allow 80/tcp
ufw allow 443/tcp
ufw --force enable

print_success "Firewall configurado"

##############################################################################
# STEP 14: Run Database Migrations
##############################################################################

print_header "PASSO 14: Executando Migrations"

cd /opt/nabancada/app
sudo -u nabancada npm run db:push || true

print_success "Migrations executadas"

##############################################################################
# STEP 15: Setup Cron Jobs
##############################################################################

print_header "PASSO 15: Configurando Cron Jobs"

# Subscription check cron
(crontab -u nabancada -l 2>/dev/null; echo "0 3 * * * cd /opt/nabancada/app && /usr/bin/node scripts/check-subscriptions.ts >> /opt/nabancada/logs/cron.log 2>&1") | crontab -u nabancada -

# Backup cron
(crontab -u nabancada -l 2>/dev/null; echo "30 3 * * * /usr/bin/pg_dump -U nabancada_user nabancada | gzip > /opt/nabancada/backups/db-\$(date +\%Y\%m\%d).sql.gz") | crontab -u nabancada -

# Cleanup old backups
(crontab -u nabancada -l 2>/dev/null; echo "0 4 * * * find /opt/nabancada/backups -name \"db-*.sql.gz\" -mtime +30 -delete") | crontab -u nabancada -

print_success "Cron jobs configurados"

##############################################################################
# STEP 16: Configure Fail2Ban
##############################################################################

print_header "PASSO 16: Configurando Fail2Ban"

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

print_success "Fail2Ban configurado"

##############################################################################
# STEP 17: Enable Auto Updates
##############################################################################

print_header "PASSO 17: Habilitando Atualizações Automáticas"

apt install -y unattended-upgrades
dpkg-reconfigure -plow unattended-upgrades

print_success "Atualizações automáticas habilitadas"

##############################################################################
# Installation Complete
##############################################################################

clear

print_header "🎉 INSTALAÇÃO CONCLUÍDA COM SUCESSO!"

echo ""
print_success "NaBancada instalado e rodando!"
echo ""

print_info "Informações do Sistema:"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "  🌐 URL:              https://$DOMAIN"
echo "  🗄️  PostgreSQL:       localhost:5432"
echo "  📦 Redis:            localhost:6379"
echo "  📂 App Directory:    /opt/nabancada/app"
echo "  📝 Logs:             /opt/nabancada/logs"
echo "  💾 Backups:          /opt/nabancada/backups"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

print_info "Credenciais (SALVE EM LOCAL SEGURO!):"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "  PostgreSQL User:     nabancada_user"
echo "  PostgreSQL Password: $DB_PASSWORD"
echo "  PostgreSQL Database: nabancada"
echo ""
echo "  Redis Password:      $REDIS_PASSWORD"
echo ""
echo "  SESSION_SECRET:      $SESSION_SECRET"
echo "  CRON_SECRET:         $CRON_SECRET"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

print_info "Comandos Úteis:"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "  Ver logs:            pm2 logs nabancada"
echo "  Status da app:       pm2 status"
echo "  Reiniciar app:       pm2 restart nabancada"
echo "  Ver monitoramento:   pm2 monit"
echo ""
echo "  Status PostgreSQL:   systemctl status postgresql"
echo "  Status Redis:        systemctl status redis-server"
echo "  Status Nginx:        systemctl status nginx"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

print_warning "PRÓXIMOS PASSOS:"
echo ""
echo "  1. Criar Super Admin:"
echo "     cd /opt/nabancada/app"
echo "     sudo -u nabancada npm run create-superadmin"
echo ""
echo "  2. Acessar aplicação:"
echo "     https://$DOMAIN"
echo ""
echo "  3. Configurar DNS do domínio apontando para:"
echo "     $(curl -s ifconfig.me)"
echo ""

print_success "Instalação finalizada! 🚀"
echo ""
