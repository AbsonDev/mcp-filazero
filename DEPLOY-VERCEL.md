# Deploy Filazero MCP Server no Vercel

## Instruções de Deploy

### 1. Fazer Push para GitHub
```bash
git add .
git commit -m "Configurar para Vercel deployment"
git push origin main
```

### 2. Deploy no Vercel
1. Acesse [vercel.com](https://vercel.com)
2. Clique em "New Project"
3. Conecte seu repositório GitHub
4. Vercel irá detectar automaticamente as configurações
5. Clique em "Deploy"

### 3. Configurações Automáticas
- ✅ `vercel.json` configurado
- ✅ Build command: `npm run vercel-build`
- ✅ Entry point: `api/index.js`
- ✅ Node.js runtime

### 4. URL Final
Após deploy: `https://seu-projeto.vercel.app`

## Endpoints Disponíveis

```
GET  /           - Health check + documentação
GET  /health     - Status detalhado
GET  /ping       - Ping/pong
GET  /status     - Status service
GET  /ready      - Readiness check
GET  /healthz    - Health check simples
GET  /tools      - Lista tools MCP
POST /mcp        - Executar tools MCP
```

## Testar Após Deploy

```bash
# Health check
curl https://seu-projeto.vercel.app/health

# Listar tools MCP
curl https://seu-projeto.vercel.app/tools

# Testar MCP tool
curl -X POST https://seu-projeto.vercel.app/mcp \
  -H "Content-Type: application/json" \
  -d '{"tool": "get_terminal", "arguments": {"accessKey": "test123"}}'
```

## Usar no Cursor

Configure no Cursor:
```
URL: https://seu-projeto.vercel.app
```