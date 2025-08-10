# 🖥️ Claude Desktop + MCP HTTP: Proxy Solution

## ⚠️ **Limitação Atual**

**Claude Desktop** não suporta **MCP via HTTP** nativamente. Apenas suporta:
- ✅ **stdio** (processo local)
- ✅ **SSH** (conexão remota)
- ❌ **HTTP** (não suportado)

## 🔧 **Solução: Proxy HTTP → stdio**

Para usar seu MCP HTTP no Claude Desktop, você precisa de um **proxy local** que converte HTTP em stdio.

### **Opção 1: Proxy Simples (Node.js)**

**Criar arquivo: `mcp-http-proxy.js`**
```javascript
#!/usr/bin/env node

const http = require('http');

class HttpToStdioProxy {
  constructor(httpUrl) {
    this.httpUrl = httpUrl;
  }

  async listTools() {
    try {
      const response = await fetch(`${this.httpUrl}/tools`);
      const data = await response.json();
      return { tools: data.tools };
    } catch (error) {
      return { error: error.message };
    }
  }

  async callTool(name, arguments) {
    try {
      const response = await fetch(`${this.httpUrl}/mcp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tool: name, arguments })
      });
      
      const data = await response.json();
      return {
        content: [{
          type: 'text',
          text: JSON.stringify(data.data, null, 2)
        }]
      };
    } catch (error) {
      return { 
        content: [{
          type: 'text', 
          text: `Erro: ${error.message}`
        }],
        isError: true 
      };
    }
  }

  start() {
    process.stdin.setEncoding('utf8');
    
    process.stdin.on('data', async (data) => {
      try {
        const request = JSON.parse(data.trim());
        let response;

        switch (request.method) {
          case 'tools/list':
            response = await this.listTools();
            break;
            
          case 'tools/call':
            const { name, arguments: args } = request.params;
            response = await this.callTool(name, args);
            break;
            
          default:
            response = { error: `Método não suportado: ${request.method}` };
        }

        process.stdout.write(JSON.stringify(response) + '\n');
      } catch (error) {
        process.stdout.write(JSON.stringify({ 
          error: `Erro no proxy: ${error.message}` 
        }) + '\n');
      }
    });
  }
}

// Iniciar proxy
const httpUrl = process.argv[2] || 'https://mcp-filazero.vercel.app';
console.error(`🔄 Proxy HTTP→stdio iniciado: ${httpUrl}`);

const proxy = new HttpToStdioProxy(httpUrl);
proxy.start();
```

### **Configurar Claude Desktop:**

**Editar `claude_desktop_config.json`:**
```json
{
  "mcpServers": {
    "filazero-http": {
      "command": "node",
      "args": ["/caminho/para/mcp-http-proxy.js", "https://mcp-filazero.vercel.app"],
      "env": {
        "NODE_ENV": "production"
      }
    }
  }
}
```

### **Como Usar:**
1. Salvar `mcp-http-proxy.js` 
2. Tornar executável: `chmod +x mcp-http-proxy.js`
3. Configurar `claude_desktop_config.json`
4. Reiniciar Claude Desktop
5. Ferramentas MCP aparecerão no Claude Desktop

---

## 🎯 **Alternativa Mais Simples: Use o Cursor**

### **Por que Cursor é melhor:**
- ✅ **Suporte HTTP nativo** - zero configuração
- ✅ **Interface melhor** para MCP
- ✅ **Sem proxy necessário** 
- ✅ **Mais estável**
- ✅ **Melhor performance**

### **Como configurar no Cursor:**
```json
{
  "mcp": {
    "servers": {
      "filazero": {
        "url": "https://mcp-filazero.vercel.app",
        "name": "Filazero Queue Management"
      }
    }
  }
}
```

---

## 📊 **Comparação: Claude Desktop vs Cursor**

| Recurso | Claude Desktop + Proxy | Cursor Nativo |
|---------|----------------------|---------------|
| **Configuração** | ❌ Complexa | ✅ Simples |
| **Performance** | ⚠️ Proxy overhead | ✅ Direto |
| **Estabilidade** | ⚠️ Dependente do proxy | ✅ Estável |
| **Manutenção** | ❌ Precisa manter proxy | ✅ Zero manutenção |
| **Suporte HTTP** | ❌ Via workaround | ✅ Nativo |

---

## 🚀 **Recomendação Final**

### **Para usar MCP HTTP:**
1. **🥇 Cursor** - Experiência ideal
2. **🥈 API Direta** - Flexibilidade máxima  
3. **🥉 Claude Desktop + Proxy** - Apenas se necessário

### **Se mesmo assim quiser usar Claude Desktop:**
- Use o proxy acima
- Teste bem antes de usar em produção
- Considere migrar para Cursor no futuro

**URL do seu MCP:** `https://mcp-filazero.vercel.app`