# 🚀 Deploy em Produção - Filazero MCP Server Node.js

Guia completo para deploy do servidor MCP em ambiente de produção com todas as melhores práticas.

## 📋 Índice

1. [Preparação do Ambiente](#-preparação-do-ambiente)
2. [Configuração de Produção](#-configuração-de-produção)
3. [Process Manager (PM2)](#-process-manager-pm2)
4. [Docker Deployment](#-docker-deployment)
5. [Systemd Service](#-systemd-service)
6. [Monitoramento](#-monitoramento)
7. [CI/CD Pipeline](#-cicd-pipeline)
8. [Troubleshooting](#-troubleshooting)

## 🛠️ Preparação do Ambiente

### 1. Servidor de Produção

```bash
# Atualizar sistema (Ubuntu/Debian)
sudo apt update && sudo apt upgrade -y

# Instalar Node.js via NodeSource
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Verificar instalação
node --version  # v18.x.x
npm --version   # 9.x.x

# Instalar PM2 globalmente
sudo npm install -g pm2

# Instalar outras dependências úteis
sudo apt install -y git curl wget htop
```

### 2. Usuário de Sistema

```bash
# Criar usuário dedicado (melhor prática de segurança)
sudo adduser --system --group --home /opt/filazero filazero

# Configurar diretórios
sudo mkdir -p /opt/filazero/{app,logs,config}
sudo chown -R filazero:filazero /opt/filazero
```

## ⚙️ Configuração de Produção

### 1. Variáveis de Ambiente

**`/opt/filazero/config/production.env`**
```bash
# Ambiente
NODE_ENV=production

# API Configuration
FILAZERO_API_URL=https://api.staging.filazero.net/

# Server Configuration
PORT=3000
HOST=0.0.0.0

# Logging
LOG_LEVEL=info
LOG_FILE=/opt/filazero/logs/app.log

# Performance
NODE_OPTIONS="--max-old-space-size=512"

# Security
NODE_TLS_REJECT_UNAUTHORIZED=1

# Monitoring
ENABLE_METRICS=true
HEALTH_CHECK_PORT=3001
```

### 2. Configuração Nginx (Proxy Reverso)

**`/etc/nginx/sites-available/filazero-mcp`**
```nginx
server {
    listen 80;
    server_name mcp.filazero.net;  # Seu domínio
    
    # Redirecionar HTTP para HTTPS
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name mcp.filazero.net;
    
    # SSL Configuration
    ssl_certificate /etc/letsencrypt/live/mcp.filazero.net/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/mcp.filazero.net/privkey.pem;
    
    # Security headers
    add_header X-Frame-Options DENY;
    add_header X-Content-Type-Options nosniff;
    add_header X-XSS-Protection "1; mode=block";
    
    # Proxy para o servidor Node.js
    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        
        # Timeouts
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }
    
    # Health check endpoint
    location /health {
        proxy_pass http://127.0.0.1:3001/health;
        access_log off;
    }
    
    # Logs
    access_log /var/log/nginx/filazero-mcp.access.log;
    error_log /var/log/nginx/filazero-mcp.error.log;
}
```

### 3. Deploy Script

**`scripts/deploy.sh`**
```bash
#!/bin/bash

set -e  # Exit on any error

echo "🚀 Iniciando deploy do Filazero MCP Server..."

# Configurações
APP_DIR="/opt/filazero/app"
BACKUP_DIR="/opt/filazero/backup"
USER="filazero"
REPO_URL="https://github.com/your-org/filazero-mcp-nodejs.git"

# Criar backup da versão atual
if [ -d "$APP_DIR" ]; then
    echo "📦 Criando backup..."
    sudo mkdir -p $BACKUP_DIR
    sudo cp -r $APP_DIR $BACKUP_DIR/$(date +%Y%m%d_%H%M%S)
fi

# Parar aplicação
echo "🛑 Parando aplicação..."
sudo -u $USER pm2 stop filazero-mcp || true

# Atualizar código
echo "📥 Baixando código..."
if [ ! -d "$APP_DIR" ]; then
    sudo -u $USER git clone $REPO_URL $APP_DIR
else
    cd $APP_DIR
    sudo -u $USER git fetch origin
    sudo -u $USER git reset --hard origin/main
fi

cd $APP_DIR

# Instalar dependências
echo "📦 Instalando dependências..."
sudo -u $USER npm ci --only=production

# Build da aplicação
echo "🔨 Compilando aplicação..."
sudo -u $USER npm run build

# Verificar build
if [ ! -f "dist/index.js" ]; then
    echo "❌ Build falhou - arquivo dist/index.js não encontrado"
    exit 1
fi

# Configurar logs
sudo mkdir -p /opt/filazero/logs
sudo chown -R $USER:$USER /opt/filazero/logs

# Iniciar aplicação
echo "🚀 Iniciando aplicação..."
sudo -u $USER pm2 start ecosystem.config.js --env production

# Salvar configuração PM2
sudo -u $USER pm2 save

echo "✅ Deploy concluído com sucesso!"
echo "📊 Status: $(sudo -u $USER pm2 list)"
```

## 🔄 Process Manager (PM2)

### 1. Configuração PM2

**`ecosystem.config.js`**
```javascript
module.exports = {
  apps: [
    {
      name: 'filazero-mcp',
      script: 'dist/index.js',
      cwd: '/opt/filazero/app',
      user: 'filazero',
      
      // Environment
      env: {
        NODE_ENV: 'development',
        PORT: 3000
      },
      env_production: {
        NODE_ENV: 'production',
        PORT: 3000,
        FILAZERO_API_URL: 'https://api.staging.filazero.net/',
        LOG_LEVEL: 'info'
      },
      
      // Process management
      instances: 'max',  // Usar todos os CPUs disponíveis
      exec_mode: 'cluster',
      
      // Auto restart
      autorestart: true,
      watch: false,
      max_memory_restart: '500M',
      
      // Logs
      log_file: '/opt/filazero/logs/combined.log',
      out_file: '/opt/filazero/logs/out.log',
      error_file: '/opt/filazero/logs/error.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      
      // Advanced features
      kill_timeout: 3000,
      listen_timeout: 3000,
      
      // Health monitoring
      health_check_grace_period: 10000,
      health_check_fatal_exceptions: true
    },
    
    // Health check service separado
    {
      name: 'filazero-health',
      script: 'dist/health-check.js',
      cwd: '/opt/filazero/app',
      user: 'filazero',
      instances: 1,
      env_production: {
        NODE_ENV: 'production',
        HEALTH_PORT: 3001
      }
    }
  ]
};
```

### 2. Comandos PM2 Essenciais

```bash
# Iniciar aplicação
pm2 start ecosystem.config.js --env production

# Status
pm2 status
pm2 list

# Logs
pm2 logs filazero-mcp
pm2 logs --lines 100

# Monitoramento
pm2 monit

# Restart
pm2 restart filazero-mcp

# Reload (zero downtime)
pm2 reload filazero-mcp

# Stop
pm2 stop filazero-mcp

# Salvar configuração
pm2 save

# Auto-start no boot
pm2 startup
# Seguir instruções do comando acima
```

## 🐳 Docker Deployment

### 1. Dockerfile Otimizado

**`Dockerfile.production`**
```dockerfile
# Multi-stage build para otimizar tamanho
FROM node:18-alpine AS builder

WORKDIR /app

# Copiar package files
COPY package*.json ./
COPY tsconfig.json ./

# Instalar dependências
RUN npm ci --only=production && npm cache clean --force

# Copiar código fonte
COPY src/ src/

# Build da aplicação
RUN npm run build

# Estágio final - runtime
FROM node:18-alpine AS runtime

# Configurar usuário não-root
RUN addgroup -g 1001 -S nodejs && \
    adduser -S filazero -u 1001

WORKDIR /app

# Copiar dependências do builder
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/package*.json ./

# Configurar permissões
USER filazero

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "http.get('http://localhost:3000/health', (res) => { process.exit(res.statusCode === 200 ? 0 : 1) })"

EXPOSE 3000

CMD ["npm", "start"]
```

### 2. Docker Compose

**`docker-compose.production.yml`**
```yaml
version: '3.8'

services:
  filazero-mcp:
    build:
      context: .
      dockerfile: Dockerfile.production
    image: filazero/mcp-server:latest
    
    container_name: filazero-mcp
    restart: unless-stopped
    
    environment:
      - NODE_ENV=production
      - FILAZERO_API_URL=https://api.staging.filazero.net/
      - LOG_LEVEL=info
      - PORT=3000
    
    ports:
      - "3000:3000"
    
    volumes:
      - /opt/filazero/logs:/app/logs
      - /opt/filazero/config:/app/config:ro
    
    # Resource limits
    deploy:
      resources:
        limits:
          memory: 512M
          cpus: '1.0'
        reservations:
          memory: 256M
          cpus: '0.5'
    
    # Health check
    healthcheck:
      test: ["CMD", "wget", "--quiet", "--tries=1", "--spider", "http://localhost:3000/health"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 40s
    
    # Logging
    logging:
      driver: "json-file"
      options:
        max-size: "10m"
        max-file: "3"
    
    # Networks
    networks:
      - filazero-network

  # Nginx proxy (opcional)
  nginx:
    image: nginx:alpine
    container_name: filazero-nginx
    restart: unless-stopped
    
    ports:
      - "80:80"
      - "443:443"
    
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf:ro
      - /etc/letsencrypt:/etc/letsencrypt:ro
      - /opt/filazero/logs/nginx:/var/log/nginx
    
    depends_on:
      - filazero-mcp
    
    networks:
      - filazero-network

networks:
  filazero-network:
    driver: bridge
```

### 3. Comandos Docker

```bash
# Build da imagem
docker build -f Dockerfile.production -t filazero/mcp-server:latest .

# Executar com docker-compose
docker-compose -f docker-compose.production.yml up -d

# Logs
docker-compose logs -f filazero-mcp

# Status
docker-compose ps

# Atualizar
docker-compose pull
docker-compose up -d --force-recreate

# Backup de dados
docker run --rm -v /opt/filazero:/backup alpine tar czf - /backup
```

## 🔧 Systemd Service

### 1. Service File

**`/etc/systemd/system/filazero-mcp.service`**
```ini
[Unit]
Description=Filazero MCP Server
Documentation=https://github.com/your-org/filazero-mcp-nodejs
After=network.target

[Service]
Type=notify
User=filazero
Group=filazero

WorkingDirectory=/opt/filazero/app
ExecStart=/usr/bin/node dist/index.js

# Environment
Environment=NODE_ENV=production
Environment=FILAZERO_API_URL=https://api.staging.filazero.net/
EnvironmentFile=/opt/filazero/config/production.env

# Process management
Restart=always
RestartSec=10
TimeoutStartSec=60
TimeoutStopSec=20

# Security
NoNewPrivileges=true
PrivateTmp=true
ProtectSystem=strict
ProtectHome=true
ReadWritePaths=/opt/filazero/logs

# Resources
LimitNOFILE=65536
LimitNPROC=4096

# Logging
StandardOutput=journal
StandardError=journal
SyslogIdentifier=filazero-mcp

[Install]
WantedBy=multi-user.target
```

### 2. Comandos Systemd

```bash
# Instalar service
sudo systemctl daemon-reload
sudo systemctl enable filazero-mcp

# Gerenciar service
sudo systemctl start filazero-mcp
sudo systemctl stop filazero-mcp
sudo systemctl restart filazero-mcp
sudo systemctl reload filazero-mcp

# Status e logs
sudo systemctl status filazero-mcp
sudo journalctl -u filazero-mcp -f
sudo journalctl -u filazero-mcp --since today
```

## 📊 Monitoramento

### 1. Health Check Endpoint

**`src/health-check.ts`**
```typescript
import express from 'express';
import { apiService } from './services/api.service';

const app = express();
const port = process.env.HEALTH_PORT || 3001;

interface HealthStatus {
  status: 'healthy' | 'unhealthy';
  timestamp: string;
  uptime: number;
  version: string;
  environment: string;
  checks: {
    api: boolean;
    memory: boolean;
    cpu: boolean;
  };
  metrics: {
    memoryUsage: NodeJS.MemoryUsage;
    cpuUsage: NodeJS.CpuUsage;
  };
}

app.get('/health', async (req, res) => {
  const startTime = process.hrtime();
  
  try {
    // Verificar API externa
    let apiHealth = false;
    try {
      await apiService.get('health');
      apiHealth = true;
    } catch (error) {
      console.warn('API health check failed:', error);
    }
    
    // Verificar recursos do sistema
    const memUsage = process.memoryUsage();
    const cpuUsage = process.cpuUsage();
    
    const memoryOk = memUsage.heapUsed < 400 * 1024 * 1024; // < 400MB
    const cpuOk = true; // Simplificado para este exemplo
    
    const isHealthy = apiHealth && memoryOk && cpuOk;
    
    const health: HealthStatus = {
      status: isHealthy ? 'healthy' : 'unhealthy',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      version: process.env.npm_package_version || '1.0.0',
      environment: process.env.NODE_ENV || 'development',
      checks: {
        api: apiHealth,
        memory: memoryOk,
        cpu: cpuOk
      },
      metrics: {
        memoryUsage: memUsage,
        cpuUsage: cpuUsage
      }
    };
    
    const diff = process.hrtime(startTime);
    const responseTime = diff[0] * 1000 + diff[1] * 1e-6;
    
    res.set('X-Response-Time', `${responseTime.toFixed(2)}ms`);
    res.status(isHealthy ? 200 : 503).json(health);
    
  } catch (error) {
    res.status(503).json({
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

app.listen(port, () => {
  console.log(`Health check server running on port ${port}`);
});
```

### 2. Prometheus Metrics (Opcional)

**`src/metrics.ts`**
```typescript
import express from 'express';
import { register, collectDefaultMetrics, Counter, Histogram, Gauge } from 'prom-client';

// Métricas customizadas
export const mcpRequestsTotal = new Counter({
  name: 'mcp_requests_total',
  help: 'Total number of MCP requests',
  labelNames: ['tool', 'status']
});

export const mcpRequestDuration = new Histogram({
  name: 'mcp_request_duration_seconds',
  help: 'Duration of MCP requests',
  labelNames: ['tool']
});

export const activeConnections = new Gauge({
  name: 'mcp_active_connections',
  help: 'Number of active MCP connections'
});

// Coletar métricas padrão do Node.js
collectDefaultMetrics({ register });

// Endpoint para Prometheus
export function setupMetricsEndpoint(app: express.Application) {
  app.get('/metrics', async (req, res) => {
    try {
      res.set('Content-Type', register.contentType);
      res.end(await register.metrics());
    } catch (error) {
      res.status(500).end(error);
    }
  });
}
```

### 3. Alerting com Prometheus + Grafana

**`prometheus.yml`**
```yaml
global:
  scrape_interval: 15s

scrape_configs:
  - job_name: 'filazero-mcp'
    static_configs:
      - targets: ['localhost:3000']
    metrics_path: '/metrics'
    scrape_interval: 10s

rule_files:
  - "filazero_alerts.yml"

alerting:
  alertmanagers:
    - static_configs:
        - targets:
          - alertmanager:9093
```

## 🔄 CI/CD Pipeline

### 1. GitHub Actions

**`.github/workflows/deploy.yml`**
```yaml
name: Deploy to Production

on:
  push:
    branches: [ main ]
  
  workflow_dispatch:

jobs:
  test:
    runs-on: ubuntu-latest
    
    steps:
    - uses: actions/checkout@v3
    
    - name: Setup Node.js
      uses: actions/setup-node@v3
      with:
        node-version: '18'
        cache: 'npm'
    
    - name: Install dependencies
      run: npm ci
    
    - name: Run tests
      run: npm test
    
    - name: Build
      run: npm run build

  deploy:
    needs: test
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'
    
    steps:
    - name: Deploy to server
      uses: appleboy/ssh-action@v0.1.5
      with:
        host: ${{ secrets.HOST }}
        username: ${{ secrets.USERNAME }}
        key: ${{ secrets.SSH_KEY }}
        script: |
          cd /opt/filazero/app
          git pull origin main
          npm ci --only=production
          npm run build
          pm2 reload filazero-mcp
          
    - name: Health check
      run: |
        sleep 30
        curl -f https://mcp.filazero.net/health || exit 1
```

## 🚨 Troubleshooting

### 1. Logs Centralizados

```bash
# Ver todos os logs
tail -f /opt/filazero/logs/*.log

# PM2 logs
pm2 logs --lines 100

# System logs
journalctl -u filazero-mcp -f

# Nginx logs
tail -f /var/log/nginx/filazero-mcp.*.log
```

### 2. Problemas Comuns

#### Aplicação não inicia:
```bash
# Verificar build
ls -la /opt/filazero/app/dist/

# Verificar permissões
sudo chown -R filazero:filazero /opt/filazero/

# Verificar porta
netstat -tulpn | grep :3000
```

#### Alto uso de memória:
```bash
# Monitorar recursos
pm2 monit

# Ver heap dump
node --inspect dist/index.js
```

#### API externa indisponível:
```bash
# Testar conectividade
curl -v https://api.staging.filazero.net/health

# Verificar DNS
nslookup api.staging.filazero.net
```

### 3. Scripts de Manutenção

**`scripts/maintenance.sh`**
```bash
#!/bin/bash

# Backup automático
backup_app() {
    echo "Creating backup..."
    tar -czf "/opt/filazero/backup/app-$(date +%Y%m%d_%H%M%S).tar.gz" \
        -C /opt/filazero app
}

# Limpeza de logs antigos
cleanup_logs() {
    echo "Cleaning old logs..."
    find /opt/filazero/logs -name "*.log" -mtime +7 -delete
    pm2 flush
}

# Restart seguro
safe_restart() {
    echo "Performing safe restart..."
    pm2 reload filazero-mcp
    sleep 10
    
    # Verificar se aplicação subiu
    if ! curl -f http://localhost:3000/health; then
        echo "Health check failed, rolling back..."
        pm2 restart filazero-mcp
    fi
}

case "$1" in
    backup)
        backup_app
        ;;
    cleanup)
        cleanup_logs
        ;;
    restart)
        safe_restart
        ;;
    *)
        echo "Usage: $0 {backup|cleanup|restart}"
        exit 1
        ;;
esac
```

---

**🎯 Com este guia, você tem todas as ferramentas para executar o servidor MCP Node.js em produção de forma robusta, escalável e monitorada!**
