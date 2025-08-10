# 🧪 Como Testar o Servidor MCP

Guia para testar o servidor MCP Filazero de diferentes formas.

## ❌ Por que não funciona no Postman?

O servidor MCP usa **JSON-RPC sobre stdio** (entrada/saída padrão), não HTTP REST. É um protocolo diferente que o Claude usa para se comunicar com servidores MCP.

## ✅ Formas de Testar

### 1. 🤖 **Teste via Claude Desktop (Recomendado)**

Esta é a forma **real** de usar o MCP:

#### Configurar no Claude:
```json
{
  "mcpServers": {
    "filazero-test": {
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

#### Comandos de teste no Claude:
```
User: "Quais tools estão disponíveis?"
User: "Buscar terminal com chave ABC123"
User: "Criar um ticket para Maria Silva no terminal ABC123"
User: "Consultar posição do ticket 12345"
```

### 2. 💻 **Teste Manual via Terminal**

Você pode simular as chamadas JSON-RPC:

#### Executar servidor:
```powershell
cd C:\Users\ovg19\Downloads\FilazeroMcpServer\filazero-mcp-nodejs
$env:NODE_ENV='development'
$env:FILAZERO_API_URL='https://api.staging.filazero.net/'
node dist/index.js
```

#### Em outro terminal, enviar comandos:
```powershell
# Listar tools
echo '{"jsonrpc": "2.0", "id": 1, "method": "tools/list", "params": {}}' | node dist/index.js

# Chamar tool (exemplo get_terminal)
echo '{"jsonrpc": "2.0", "id": 2, "method": "tools/call", "params": {"name": "get_terminal", "arguments": {"accessKey": "ABC123"}}}' | node dist/index.js
```

### 3. 🔧 **Teste com Script Node.js**

Criei um script de teste que simula as chamadas:
