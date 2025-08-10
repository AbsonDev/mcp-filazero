# ⚡ Quick Start - Produção

Guia rápido para colocar o servidor MCP em produção **AGORA**.

## 🚀 Opção 1: Execução Simples (Windows)

```powershell
# 1. Compilar projeto
npm run build

# 2. Executar em produção
$env:NODE_ENV='production'
$env:FILAZERO_API_URL='https://api.staging.filazero.net/'
npm start
```

## 🔄 Opção 2: PM2 (Recomendado)

### Instalar PM2
```bash
npm install -g pm2
```

### Executar
```bash
# Desenvolvimento
pm2 start ecosystem.config.js

# Produção
pm2 start ecosystem.config.js --env production

# Status
pm2 status
pm2 logs
pm2 monit
```

## 🐳 Opção 3: Docker

```bash
# Build da imagem
docker build -t filazero-mcp .

# Executar
docker run -d \
  --name filazero-mcp \
  -p 3000:3000 \
  -e NODE_ENV=production \
  -e FILAZERO_API_URL=https://api.staging.filazero.net/ \
  filazero-mcp

# Ou com docker-compose
docker-compose up -d
```

## 🔧 Configuração MCP

Após iniciar, configure no Claude:

```json
{
  "mcpServers": {
    "filazero-nodejs": {
      "command": "node",
      "args": ["dist/index.js"],
      "cwd": "C:\\Users\\ovg19\\Downloads\\FilazeroMcpServer\\filazero-mcp-nodejs",
      "env": {
        "NODE_ENV": "production",
        "FILAZERO_API_URL": "https://api.staging.filazero.net/"
      }
    }
  }
}
```

## 📊 Verificar Status

### Health Check
```bash
# Se health check estiver habilitado
curl http://localhost:3001/health

# Ou no Windows
Invoke-RestMethod http://localhost:3001/health
```

### Logs
```bash
# PM2
pm2 logs filazero-mcp

# Docker
docker logs filazero-mcp

# Direto
tail -f logs/combined.log
```

## 🔧 Troubleshooting Rápido

### Servidor não inicia
```bash
# Verificar build
ls dist/

# Verificar porta
netstat -ano | findstr :3000

# Testar diretamente
node dist/index.js
```

### API não responde
```bash
# Testar conectividade
curl https://api.staging.filazero.net/

# Verificar logs
pm2 logs --lines 50
```

### Performance
```bash
# Monitorar recursos
pm2 monit

# Verificar memória
tasklist | findstr node
```

---

**🎯 Em 5 minutos seu servidor MCP estará rodando em produção!**
