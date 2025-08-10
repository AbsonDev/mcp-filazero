# 🚂 Guia Completo de Deploy no Railway

## 🎯 **RESUMO EXECUTIVO**
Deploy do Filazero MCP Server no Railway em **3 passos simples**:
1. ✅ Conectar repositório GitHub
2. ✅ Configurar variáveis de ambiente  
3. ✅ Deploy automático!

---

## 🚀 **PASSO-A-PASSO DETALHADO**

### 1️⃣ **Setup Inicial (5 minutos)**

#### 1.1 Criar Conta Railway
- 🌐 Acesse: https://railway.app
- 🔗 Clique "Sign Up with GitHub"
- ✅ Autorize acesso ao GitHub
- 🎁 **Ganhe $5 de crédito grátis!**

#### 1.2 Criar Projeto
- 📂 Dashboard → "New Project"
- 🔗 "Deploy from GitHub repo"
- 📋 Selecione: `filazero-mcp-nodejs`
- 🚀 "Deploy Now"

### 2️⃣ **Configurar Variáveis (3 minutos)**

#### 2.1 Acessar Settings
- ⚙️ Projeto → Aba "Variables"
- ➕ "Add Variable"

#### 2.2 Variáveis Obrigatórias
```bash
NODE_ENV=production
FILAZERO_API_URL=https://api.staging.filazero.net/
PORT=3000
HEALTH_PORT=3001
ENABLE_HEALTH_CHECK=true
RAILWAY_MODE=true
```

#### 2.3 Variáveis Opcionais
```bash
LOG_LEVEL=info
RECAPTCHA_BYPASS_ENABLED=true
USE_PRODUCTION_RECAPTCHA=true
HTTP_TIMEOUT=30000
```

### 3️⃣ **Deploy e Verificação (2 minutos)**

#### 3.1 Deploy Automático
- ✅ Railway detecta `package.json`
- 📦 Executa: `npm install`
- 🔨 Executa: `npm run build`
- 🚀 Executa: `npm start`
- 🌐 Gera URL pública automaticamente

#### 3.2 Verificar Status
```bash
# Logs do deploy (no painel Railway)
📦 Installing dependencies...
✅ Dependencies installed successfully
🔨 Building TypeScript...
✅ Build completed successfully  
🚂 Starting MCP server...
✅ Server started on port 3000
🏥 Health check active on port 3001
💡 MCP Server ready to receive commands!
```

#### 3.3 Testar Funcionamento
```bash
# Health check
curl https://[seu-projeto].railway.app:3001/health

# Resposta esperada
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

---

## 🔧 **CONFIGURAÇÃO CLAUDE DESKTOP**

### 4️⃣ **Configurar Claude (5 minutos)**

#### 4.1 Arquivo de Configuração
**Localização:**
- **Windows**: `%APPDATA%\Claude\claude_desktop_config.json`
- **macOS**: `~/Library/Application Support/Claude/claude_desktop_config.json`
- **Linux**: `~/.config/Claude/claude_desktop_config.json`

#### 4.2 Configuração Local (Recomendada)
```json
{
  "mcpServers": {
    "filazero-railway": {
      "command": "node",
      "args": ["start-railway.js"],
      "cwd": "/caminho/para/seu/projeto/local",
      "env": {
        "NODE_ENV": "production",
        "FILAZERO_API_URL": "https://api.staging.filazero.net/",
        "RAILWAY_MODE": "true"
      }
    }
  }
}
```

#### 4.3 Reiniciar Claude
- ❌ Feche Claude Desktop completamente
- ✅ Abra novamente
- 🔍 Verifique se servidor MCP aparece conectado

---

## 📊 **MONITORAMENTO E LOGS**

### 5️⃣ **Dashboard Railway (Sempre Disponível)**

#### 5.1 Métricas em Tempo Real
- 📈 **CPU**: Uso do processador
- 💾 **Memory**: Consumo de RAM
- 🌐 **Network**: Tráfego I/O
- 📊 **Deployments**: Histórico de deploys

#### 5.2 Logs Estruturados
```bash
# Logs disponíveis no painel
🚂 Iniciando Filazero MCP Server no Railway...
✅ Build concluído com sucesso!
🎯 Iniciando servidor MCP...
🚀 Filazero MCP Server (Node.js) iniciado!
📡 Ambiente: production
🔗 API URL: https://api.staging.filazero.net/
🛠️ Total de tools: 11
💡 Servidor pronto para receber comandos MCP...
```

#### 5.3 Alertas Automáticos
- ❌ **Deploy Failed**: Email automático
- 🔄 **Auto Restart**: Se servidor crashar
- 📧 **Uptime Monitoring**: Notificações

---

## 🧪 **TESTES E VALIDAÇÃO**

### 6️⃣ **Comandos de Teste**

#### 6.1 Teste Básico (Local)
```bash
# No seu projeto local
npm run railway:health

# Resultado esperado
✅ Health check funcionando
{
  "status": "healthy",
  "environment": "production"
}
```

#### 6.2 Teste no Claude
```
# Comandos para testar no Claude
- "Listar tools disponíveis do Filazero"
- "Buscar terminal com chave ABC123"
- "Verificar status do servidor MCP"
```

#### 6.3 Teste de Performance
```bash
# Verificar latência
curl -w "%{time_total}" https://[seu-projeto].railway.app:3001/health

# Tempo esperado: < 500ms
```

---

## 🚨 **TROUBLESHOOTING**

### 7️⃣ **Problemas Comuns**

#### 7.1 Deploy Falha
```bash
# Verificar logs no Railway Dashboard
❌ Build failed: TypeScript errors
🔧 Solução: Verificar erros de compilação

❌ Start failed: Port in use
🔧 Solução: Railway gerencia portas automaticamente
```

#### 7.2 Claude Não Conecta
```bash
# Verificar configuração local
✅ Arquivo claude_desktop_config.json válido
✅ Caminho do projeto correto
✅ Dependências instaladas: npm install

# Comandos de debug
npm run build         # Compilar TypeScript
npm run railway       # Testar localmente
```

#### 7.3 APIs Não Respondem
```bash
# Verificar variáveis de ambiente
✅ FILAZERO_API_URL configurada
✅ Conectividade com API externa
✅ Health check ativo

# Teste manual
curl https://api.staging.filazero.net/
```

---

## 💰 **CUSTOS E LIMITES**

### 8️⃣ **Plano Gratuito Railway**

#### 8.1 Recursos Inclusos
- 💵 **$5 de crédito mensal**
- ⏱️ **500 horas de execução**
- 💾 **512MB RAM garantidos**
- 🌐 **100GB transferência**
- 🚀 **Deployment automático**

#### 8.2 Estimativa de Uso
```bash
# MCP Server (sempre ativo)
📊 Consumo estimado: $3-4/mês
⚡ Performance: Excelente
🔄 Uptime: 99.9%
💾 RAM: ~50-100MB
```

#### 8.3 Quando Upgrade
- 📈 **Tráfego alto**: Mais de 100GB/mês
- ⚡ **Performance crítica**: CPU dedicado
- 🏢 **Uso comercial**: Support prioritário

---

## ✅ **CHECKLIST FINAL**

### 9️⃣ **Validação Completa**

#### 9.1 Railway Setup ✅
- [ ] Conta Railway criada
- [ ] Projeto conectado ao GitHub
- [ ] Variáveis de ambiente configuradas
- [ ] Deploy automático funcionando
- [ ] URL pública disponível

#### 9.2 Claude Integration ✅  
- [ ] Configuração MCP adicionada
- [ ] Claude Desktop reiniciado
- [ ] Servidor MCP conectado
- [ ] Tools listadas corretamente
- [ ] Testes básicos passando

#### 9.3 Monitoring ✅
- [ ] Health check respondendo
- [ ] Logs estruturados visíveis
- [ ] Métricas do dashboard ativas
- [ ] Alertas configurados
- [ ] Performance adequada

---

## 🎯 **PRÓXIMOS PASSOS**

### 🔄 **Deploy Contínuo**
- ✅ **Auto-deploy**: Cada commit = novo deploy
- 🔍 **Code Review**: PRs são deployadas em preview
- 🏷️ **Tags**: Releases controladas

### 📈 **Otimizações**
- ⚡ **Performance**: Monitorar métricas
- 🔒 **Segurança**: Variáveis sensíveis no Railway
- 📊 **Logs**: Integração com ferramentas externas

### 🚀 **Produção**
- 🌐 **Domínio customizado**: Configurar DNS
- 📧 **Alertas**: Configurar notificações
- 🔄 **Backup**: Estratégia de redundância

---

**🎉 RESULTADO: Servidor MCP rodando profissionalmente no Railway em menos de 15 minutos!**

---

### 📞 **Suporte**

**Railway Support:**
- 📖 Docs: https://docs.railway.app
- 💬 Discord: Railway Community
- 📧 Email: help@railway.app

**Projeto Support:**
- 📋 Issues: GitHub Issues
- 📖 Docs: README.md
- 💬 Discussões: GitHub Discussions
