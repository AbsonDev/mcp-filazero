# 🚀 Filazero MCP Server - Replit Edition

Deploy rápido e fácil do servidor MCP Filazero no Replit!

## ⚡ Quick Start no Replit

### 1. Criar Projeto
1. Acesse [replit.com](https://replit.com)
2. Clique em "Create Repl"
3. Escolha "Node.js" 
4. Nome: `filazero-mcp-server`
5. Importe este código

### 2. Configuração Automática
O projeto já vem configurado para Replit com:
- ✅ `.replit` - Configurações do ambiente
- ✅ `replit.nix` - Dependências do sistema
- ✅ `start-replit.js` - Script de inicialização
- ✅ Scripts npm específicos

### 3. Executar
```bash
# Instalar dependências e buildar
npm run replit:install

# Executar servidor
npm run replit
```

Ou simplesmente clique no botão "Run" no Replit!

## 🔧 Configuração

### Variáveis de Ambiente
O Replit já configura automaticamente:
- `NODE_ENV=production`
- `FILAZERO_API_URL=https://api.staging.filazero.net/`
- `PORT=3000`
- `HEALTH_PORT=3001`

### Portas Expostas
- **3000**: Servidor MCP principal
- **3001**: Health check endpoint

## 🌐 URLs do Replit

Após executar, seu servidor estará disponível em:
- **MCP Server**: `https://[seu-repl].repl.co`
- **Health Check**: `https://[seu-repl].repl.co:3001/health`

## 🤖 Configurar no Claude Desktop

### Opção 1: Conexão Local (Recomendado)
```json
{
  "mcpServers": {
    "filazero-replit": {
      "command": "node",
      "args": ["start-replit.js"],
      "cwd": "/caminho/para/projeto/local",
      "env": {
        "NODE_ENV": "production",
        "FILAZERO_API_URL": "https://api.staging.filazero.net/"
      }
    }
  }
}
```

### Opção 2: Conexão Remota (Experimental)
⚠️ **Limitação**: MCP funciona melhor com conexões locais. Para uso em produção, considere:
- Fazer git clone local do projeto
- Usar o Replit apenas para desenvolvimento/testes
- Deploy em servidor dedicado para produção

## 📊 Monitoramento

### Health Check
```bash
# Testar saúde do servidor
curl https://[seu-repl].repl.co:3001/health
```

### Logs no Replit
- Console do Replit mostra logs em tempo real
- Use o terminal integrado para debug

### Comandos Úteis
```bash
# Ver status
npm run health

# Rebuild completo
npm run replit:install

# Executar em desenvolvimento
npm run replit:dev
```

## 🔍 Debug no Replit

### Console Logs
Todos os logs aparecem no console do Replit:
```
🚀 Filazero MCP Server (Node.js) iniciado!
📡 Ambiente: production
🔗 API URL: https://api.staging.filazero.net/
🛠️ Total de tools: 11
💡 Servidor pronto para receber comandos MCP...
```

### Testes Rápidos
```bash
# Testar ferramentas MCP (no terminal do Replit)
curl -X POST https://[seu-repl].repl.co/mcp \
  -H "Content-Type: application/json" \
  -d '{"method": "tools/list"}'
```

## 🚨 Troubleshooting

### Servidor não inicia
1. Verificar se build foi feito: `npm run build`
2. Verificar logs no console
3. Reinstalar: `npm run replit:install`

### Portas não respondem
1. Verificar configuração `.replit`
2. Reiniciar o Repl
3. Verificar firewall/proxy do Replit

### Performance lenta
- Replit gratuito tem limitações
- Considere Replit Pro para melhor performance
- Para produção, use servidor dedicado

## 📝 Notas Importantes

### Limitações do Replit
- ⏰ **Sleep mode**: Repl hiberna após inatividade
- 🔄 **Restart**: Reinicia automaticamente
- 📊 **Performance**: Limitada na versão gratuita
- 🌐 **Networking**: Algumas limitações de rede

### Recomendações
- 🧪 **Use para**: Desenvolvimento, testes, demos
- ❌ **Evite para**: Produção crítica
- 💡 **Ideal para**: Prototipagem rápida e aprendizado

### Upgrade para Produção
Quando precisar de produção robusta:
1. Git clone para servidor dedicado
2. Use PM2 ou Docker
3. Configure domínio próprio
4. Implemente monitoramento avançado

## 🎯 Comandos Essenciais

```bash
# Setup inicial
npm run replit:install

# Executar servidor
npm run replit

# Health check
npm run health

# Build manual
npm run build

# Ver logs (via código)
tail -f logs/combined.log  # Se configurado
```

---

**🎉 Em 5 minutos você tem seu servidor MCP rodando no Replit!**

Para produção robusta, veja `DEPLOY_PRODUCAO.md`.
