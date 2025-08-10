# 🚀 Setup Completo no Replit

Guia passo-a-passo para configurar o Filazero MCP Server no Replit.

## 📋 Pré-requisitos
- ✅ Conta no [Replit.com](https://replit.com)
- ✅ Claude Desktop instalado
- ✅ Conhecimento básico de Node.js

## 🎯 Passo 1: Criar Projeto no Replit

### 1.1 Novo Repl
1. Acesse https://replit.com
2. Clique em "Create Repl"
3. **Template**: Node.js
4. **Nome**: `filazero-mcp-server`
5. **Público/Privado**: Conforme preferência
6. Clique "Create Repl"

### 1.2 Importar Código
**Opção A - Via Git (Recomendado):**
```bash
# No terminal do Replit
git clone https://github.com/seu-usuario/filazero-mcp-nodejs .
```

**Opção B - Upload Manual:**
- Faça upload dos arquivos do projeto
- Ou copie/cole o código

## 🔧 Passo 2: Configuração Automática

Os arquivos de configuração já estão incluídos:
- ✅ `.replit` - Configurações do Replit
- ✅ `replit.nix` - Dependências do sistema  
- ✅ `start-replit.js` - Script de boot
- ✅ `package.json` - Scripts específicos

## ⚙️ Passo 3: Variáveis de Ambiente

### 3.1 Configuração Automática
O projeto já configura automaticamente:
```bash
NODE_ENV=production
FILAZERO_API_URL=https://api.staging.filazero.net/
PORT=3000
HEALTH_PORT=3001
ENABLE_HEALTH_CHECK=true
```

### 3.2 Customizar (Opcional)
No painel "Secrets" do Replit, adicione:
- `FILAZERO_API_URL`: URL da API (desenvolvimento/produção)
- `LOG_LEVEL`: debug, info, warn, error
- `ENVIRONMENT_OVERRIDE`: development, staging, production

## 🏃‍♂️ Passo 4: Executar

### 4.1 Primeiro Uso
```bash
# Instalar dependências e buildar
npm run replit:install
```

### 4.2 Iniciar Servidor
```bash
# Executar servidor MCP
npm run replit
```

**Ou simplesmente clique no botão verde "Run"!**

### 4.3 Verificar Status
```bash
# Health check
npm run health

# Ver logs no console do Replit
```

## 🌐 Passo 5: URLs Disponíveis

Após executar, você terá:
- **Servidor MCP**: `https://[nome-do-repl].[seu-usuario].repl.co`
- **Health Check**: `https://[nome-do-repl].[seu-usuario].repl.co:3001/health`

## 🤖 Passo 6: Configurar Claude Desktop

### 6.1 Arquivo de Configuração
Localize o arquivo `claude_desktop_config.json`:
- **Windows**: `%APPDATA%\Claude\claude_desktop_config.json`
- **macOS**: `~/Library/Application Support/Claude/claude_desktop_config.json`
- **Linux**: `~/.config/Claude/claude_desktop_config.json`

### 6.2 Configuração Local (Recomendado)
```json
{
  "mcpServers": {
    "filazero-replit": {
      "command": "node",
      "args": ["start-replit.js"],
      "cwd": "/caminho/para/seu/projeto/local",
      "env": {
        "NODE_ENV": "production",
        "FILAZERO_API_URL": "https://api.staging.filazero.net/",
        "REPLIT_MODE": "true"
      }
    }
  }
}
```

### 6.3 Reiniciar Claude
- Feche completamente o Claude Desktop
- Abra novamente
- Verifique se o servidor MCP aparece conectado

## 🧪 Passo 7: Testar Funcionalidade

### 7.1 Comandos de Teste no Claude
Experimente estes comandos:
- "Buscar terminal com chave ABC123"
- "Listar tools disponíveis no Filazero"
- "Criar ticket para João Silva"

### 7.2 Health Check Manual
```bash
# No terminal do Replit ou localmente
curl https://[seu-repl].repl.co:3001/health
```

### 7.3 Verificar Logs
- Console do Replit mostra logs em tempo real
- Procure por mensagens de sucesso/erro

## 🔧 Passo 8: Troubleshooting

### 8.1 Servidor não inicia
```bash
# Reinstalar dependências
rm -rf node_modules package-lock.json
npm install

# Rebuild
npm run build

# Executar com debug
npm run replit:dev
```

### 8.2 Claude não conecta
1. Verificar se o caminho no config está correto
2. Verificar se o arquivo `start-replit.js` existe
3. Testar execução manual: `node start-replit.js`
4. Verificar logs do Claude: Console/Terminal

### 8.3 APIs não respondem
```bash
# Testar conectividade
curl https://api.staging.filazero.net/

# Verificar variáveis de ambiente
env | grep FILAZERO
```

### 8.4 Performance lenta
- **Replit Free**: Limitações de CPU/RAM
- **Solução**: Upgrade para Replit Pro
- **Alternativa**: Deploy em servidor dedicado

## 📊 Monitoramento

### Console Logs
```
🚀 Filazero MCP Server (Node.js) iniciado!
📡 Ambiente: production
🔗 API URL: https://api.staging.filazero.net/
🛠️ Total de tools: 11
💡 Servidor pronto para receber comandos MCP...
```

### Health Check Response
```json
{
  "status": "healthy",
  "timestamp": "2024-01-15T10:30:00.000Z",
  "uptime": 3600,
  "version": "1.0.0",
  "environment": "production",
  "apiUrl": "https://api.staging.filazero.net/",
  "memoryUsage": {...},
  "pid": 12345
}
```

## 🎯 Comandos Úteis

```bash
# Setup inicial completo
npm run replit:install

# Executar servidor
npm run replit

# Desenvolvimento com rebuild
npm run replit:dev

# Health check
npm run health

# Limpar e reinstalar
rm -rf node_modules dist && npm install && npm run build

# Ver logs detalhados (se configurado)
tail -f logs/combined.log
```

## ⚡ Quick Commands

```bash
# All-in-one setup
npm run replit:install && npm run replit

# Restart rápido
pkill node && npm run replit

# Debug conexão
curl -v https://[seu-repl].repl.co:3001/health
```

## 🚨 Limitações Importantes

### Replit Free
- ⏰ **Sleep**: Hiberna após 1h inativo
- 🔄 **Restart**: Reinicia automaticamente  
- 📊 **Performance**: CPU/RAM limitados
- 🌐 **Network**: Algumas limitações

### Para Produção
- 💰 Considere Replit Pro
- 🏢 Ou migre para servidor dedicado
- 📈 Use para desenvolvimento/demos

---

**🎉 Pronto! Seu servidor MCP está rodando no Replit em menos de 10 minutos!**
