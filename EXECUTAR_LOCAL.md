# 🏠 Executar Localmente - Filazero MCP Server

Guia simples para executar o servidor MCP no seu computador conectando nas APIs Filazero.

## 🚀 Execução Rápida

### 1. **Local + API Produção** (Recomendado)
```powershell
# Opção 1: Script automático
.\start-local-prod.ps1

# Opção 2: Manual
$env:NODE_ENV='development'
$env:FILAZERO_API_URL='https://api.staging.filazero.net/'
npm start
```

### 2. **Local + API Desenvolvimento**
```powershell
# Opção 1: Script automático  
.\start-local-dev.ps1

# Opção 2: Manual
$env:NODE_ENV='development'
$env:FILAZERO_API_URL='https://api.dev.filazero.net/'
npm start
```

## 🔧 Configuração no Claude

### Para API de Produção
Use esta configuração no seu `claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "filazero-local-prod": {
      "command": "node",
      "args": ["dist/index.js"],
      "cwd": "C:\\Users\\ovg19\\Downloads\\FilazeroMcpServer\\filazero-mcp-nodejs",
      "env": {
        "NODE_ENV": "development",
        "FILAZERO_API_URL": "https://api.staging.filazero.net/",
        "LOG_LEVEL": "debug"
      }
    }
  }
}
```

### Para API de Desenvolvimento
```json
{
  "mcpServers": {
    "filazero-local-dev": {
      "command": "node",
      "args": ["dist/index.js"],
      "cwd": "C:\\Users\\ovg19\\Downloads\\FilazeroMcpServer\\filazero-mcp-nodejs",
      "env": {
        "NODE_ENV": "development", 
        "FILAZERO_API_URL": "https://api.dev.filazero.net/",
        "LOG_LEVEL": "debug"
      }
    }
  }
}
```

## 🎯 Providers por Ambiente

### API Produção (`api.staging.filazero.net`)
- **Artesano**: 906
- **O Boticário**: 730
- **Nike**: 769
- **Noel**: 777

### API Desenvolvimento (`api.dev.filazero.net`)
- **Artesano**: 460
- **O Boticário**: 358
- **Nike**: 356
- **Noel**: 357

## 🧪 Testando

### 1. Verificar se servidor está rodando
```powershell
# Verificar processo
Get-Process | Where-Object {$_.ProcessName -eq "node"}

# Testar conectividade (se você tiver curl)
curl http://localhost:3001/health
```

### 2. Testar no Claude
```
User: "Buscar terminal com chave ABC123"
User: "Listar tools disponíveis"
User: "Criar ticket para teste"
```

### 3. Logs em tempo real
Os logs aparecerão diretamente no terminal onde você executou o servidor.

## 🔍 Troubleshooting

### Erro "Cannot find module"
```powershell
# Recompilar
npm run build
```

### Erro de conexão com API
```powershell
# Testar conectividade manual
Invoke-RestMethod https://api.staging.filazero.net/
```

### Porta em uso
```powershell
# Verificar o que está usando a porta
netstat -ano | findstr :3000

# Matar processo se necessário
taskkill /PID [NUMBER] /F
```

### Reiniciar limpo
```powershell
# Parar tudo
Ctrl+C

# Limpar e reconstruir
Remove-Item dist -Recurse -Force -ErrorAction SilentlyContinue
npm run build

# Executar novamente
.\start-local-prod.ps1
```

## 💡 Dicas

### 1. **Logs Detalhados**
O servidor roda em modo `debug` localmente, então você verá todos os logs detalhados das chamadas à API.

### 2. **Restart Rápido**
- `Ctrl+C` para parar
- `⬆️` (seta para cima) + `Enter` para executar o último comando

### 3. **Múltiplas Instâncias**
Você pode rodar vários servidores simultaneamente mudando a porta:
```powershell
$env:PORT='3002'
npm start
```

### 4. **Debug de API**
Para ver exatamente o que está sendo enviado/recebido:
```powershell
$env:LOG_LEVEL='debug'
npm start
```

---

**🎯 Pronto! Agora você pode desenvolver e testar localmente conectando nas APIs de produção ou desenvolvimento!**
