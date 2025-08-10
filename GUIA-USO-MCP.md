# 📚 Guia Completo: Como Usar o MCP Server Filazero

## 🌐 URL do Servidor
```
https://mcp-filazero.vercel.app
```

---

## 1. 🎯 **CURSOR (Recomendado - ✅ Suporte Nativo)**

### **Como Configurar:**

1. **Abrir Cursor**
2. **Ir para Settings** (Ctrl+,)
3. **Procurar por "MCP" ou "Model Context Protocol"**
4. **Adicionar novo servidor:**
   ```json
   {
     "name": "Filazero Queue Management",
     "url": "https://mcp-filazero.vercel.app"
   }
   ```

### **Ferramentas Disponíveis no Cursor:**
- ✅ `get_terminal` - Buscar terminal por chave
- ✅ `create_ticket` - Criar ticket na fila
- ✅ `get_ticket` - Consultar ticket
- ✅ `get_queue_position` - Posição na fila
- ✅ `cancel_ticket` - Cancelar ticket
- ✅ `checkin_ticket` - Check-in via smart code
- ✅ **+ 5 outras ferramentas**

### **Exemplo de Uso no Cursor:**
```
"Use a ferramenta get_terminal para buscar o terminal com chave ABC123"
"Crie um ticket para o cliente João na fila do Artesano"
"Consulte a posição do ticket 12345 na fila"
```

---

## 2. 🖥️ **CLAUDE DESKTOP (⚠️ Limitado)**

### **Status Atual:**
- ❌ **Claude Desktop NÃO suporta HTTP MCP** nativamente
- ✅ **Apenas stdio/SSH** são suportados
- ⚠️ **Workaround necessário**

### **Opção 1: Proxy Local (Avançado)**
Se quiser usar no Claude Desktop, precisa criar um proxy:

1. **Instalar proxy MCP HTTP→stdio**
2. **Configurar claude_desktop_config.json:**
   ```json
   {
     "mcpServers": {
       "filazero": {
         "command": "node",
         "args": ["mcp-http-proxy.js", "https://mcp-filazero.vercel.app"]
       }
     }
   }
   ```

### **Opção 2: Usar Cursor (Mais Fácil)**
**Recomendação:** Use o Cursor em vez do Claude Desktop para MCP HTTP.

---

## 3. 🔌 **USO DIRETO VIA API**

### **Endpoints Disponíveis:**

```bash
# Listar todas as ferramentas
GET https://mcp-filazero.vercel.app/tools

# Executar ferramenta MCP
POST https://mcp-filazero.vercel.app/mcp
Content-Type: application/json
{
  "tool": "get_terminal",
  "arguments": {
    "accessKey": "1d1373dcf045408aa3b13914f2ac1076"
  }
}

# Health check
GET https://mcp-filazero.vercel.app/health
```

### **Exemplo JavaScript:**
```javascript
// Buscar terminal
async function getTerminal(accessKey) {
  const response = await fetch('https://mcp-filazero.vercel.app/mcp', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      tool: 'get_terminal',
      arguments: { accessKey }
    })
  });
  
  return await response.json();
}

// Uso
getTerminal('ABC123').then(result => {
  console.log(result.data);
});
```

### **Exemplo Python:**
```python
import requests

def call_mcp_tool(tool_name, arguments):
    url = 'https://mcp-filazero.vercel.app/mcp'
    payload = {
        'tool': tool_name,
        'arguments': arguments
    }
    
    response = requests.post(url, json=payload)
    return response.json()

# Exemplo de uso
result = call_mcp_tool('get_terminal', {'accessKey': 'ABC123'})
print(result['data'])
```

### **Exemplo cURL:**
```bash
# Buscar terminal
curl -X POST https://mcp-filazero.vercel.app/mcp \
  -H "Content-Type: application/json" \
  -d '{
    "tool": "get_terminal",
    "arguments": {
      "accessKey": "1d1373dcf045408aa3b13914f2ac1076"
    }
  }'

# Criar ticket
curl -X POST https://mcp-filazero.vercel.app/mcp \
  -H "Content-Type: application/json" \
  -d '{
    "tool": "create_ticket",
    "arguments": {
      "pid": 906,
      "locationId": 1,
      "serviceId": 123,
      "customer": {
        "name": "João Silva",
        "phone": "(11) 99999-9999",
        "email": "joao@email.com"
      },
      "browserUuid": "uuid-123-456"
    }
  }'
```

---

## 4. 🛠️ **OUTRAS PLATAFORMAS**

### **VS Code**
- Use extensões que suportam MCP HTTP
- Configure via settings.json

### **Postman/Insomnia**
- Importe endpoints para testes
- Use para desenvolvimento/debug

### **Aplicações Web**
- Integre via fetch/axios
- Funciona em qualquer framework JS

---

## 5. 🎯 **RECOMENDAÇÃO FINAL**

### **Para Uso Geral:**
1. **🥇 Cursor** - Melhor experiência MCP
2. **🥈 API Direta** - Para desenvolvedores
3. **🥉 Claude Desktop** - Apenas com proxy

### **Para Diferentes Casos:**

| Caso de Uso | Plataforma Recomendada |
|-------------|----------------------|
| **Chat com IA + MCP** | Cursor |
| **Desenvolvimento** | API Direta |
| **Testes/Debug** | Postman + cURL |
| **Integração em App** | JavaScript/Python |

---

## 🚀 **Começar Agora**

**Mais Fácil:** Use o **Cursor** com URL: `https://mcp-filazero.vercel.app`

**Todas as 11 ferramentas de gestão de filas do Filazero estarão disponíveis instantaneamente!**