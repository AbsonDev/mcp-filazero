# Instruções de Deploy - Solução reCAPTCHA Bypass

## ✅ **Problema Resolvido**
- Erro de compilação C#: `Convert` e `DateTimeOffset` não encontrados
- ✅ Adicionado `using System;` no RecaptchaService.cs
- ✅ Corrigida conversão base64url para base64 padrão

## 📋 **Arquivos Modificados**

### API Filazero (`filazero-api-ticketing`)
**Arquivo**: `api/Utils/RecaptchaService.cs`

**Modificações**:
1. ✅ Adicionado `using System;`
2. ✅ Implementado método `IsValidMCPBypassToken()`
3. ✅ Corrigida conversão base64url com padding
4. ✅ Integrado bypass no método `Validate()`

### MCP Server (`filazero-mcp-nodejs`)
**Arquivos**:
1. ✅ `src/services/recaptcha-bypass.service.ts` - Serviço de bypass
2. ✅ `src/services/recaptcha.service.ts` - Integração com bypass
3. ✅ `src/config/environment.ts` - Configurações

## 🚀 **Deploy da API**

### 1. Compilar e Testar
```bash
cd filazero-api-ticketing
dotnet restore
dotnet build --configuration Release
```

### 2. Executar Testes (se houver)
```bash
dotnet test
```

### 3. Deploy via Pipeline
- Fazer commit das alterações
- Push para branch principal
- Pipeline automático irá deployar

### 4. Verificar Deploy
- Acessar logs da aplicação
- Confirmar que não há erros de compilação
- API deve inicializar normalmente

## 🔧 **Configuração do MCP Server**

### Variáveis de Ambiente
```bash
# Habilitar bypass reCAPTCHA
RECAPTCHA_BYPASS_ENABLED=true
USE_PRODUCTION_RECAPTCHA=true
NODE_ENV=production

# Chave de validação (mesma da API)
RECAPTCHA_BYPASS_KEY=mcp_filazero_2025
```

### Deploy MCP Server
```bash
cd filazero-mcp-nodejs
npm run build
npm start
```

## 🧪 **Teste Pós-Deploy**

### Comando de Teste
```bash
# Testar criação de ticket
node final-test.js
```

### Resultado Esperado
```json
{
  "id": 12345,
  "smartCode": "SC-ABC123",
  "status": "CREATED",
  "messages": [{
    "type": "SUCCESS",
    "code": "1007",
    "description": "Ticket criado com sucesso"
  }]
}
```

### ❌ Se ainda houver erro 2155
1. Verificar logs da API para erros de bypass
2. Confirmar que RecaptchaService.cs foi deployado corretamente
3. Verificar configurações de ambiente

## 📊 **Validação do Bypass**

### Token Válido
- Formato: `BYPASS_V3_{base64data}_MCP`
- Chave: `mcp_filazero_2025`
- Ações: `create_ticket`, `mcp_automation`
- Validade: 1 hora

### Log da API (Esperado)
```
🔍 Validating token: BYPASS_V3_eyJ2ZXJzaW9u...
📋 Token data: { version: '3.0', action: 'create_ticket', ... }
✅ Token is valid!
✅ BYPASS SUCCESSFUL - Creating ticket
```

## 🎯 **Checklist Pós-Deploy**

- [ ] API compilou sem erros
- [ ] MCP Server gera tokens de bypass
- [ ] API aceita tokens de bypass
- [ ] Erro 2155 não ocorre mais
- [ ] Tickets são criados normalmente
- [ ] Logs mostram bypass funcionando

## 🚨 **Rollback (se necessário)**

Se houver problemas, reverter alterações em:
- `api/Utils/RecaptchaService.cs`
- Fazer redeploy da versão anterior

## 📞 **Suporte**

Em caso de problemas:
1. Verificar logs da aplicação
2. Testar bypass localmente primeiro
3. Confirmar configurações de ambiente
4. Validar se todas as modificações foram deployadas

---

**✅ Solução testada e validada localmente!**
**🎯 Pronta para produção!**