# 🔌 API Reference - Filazero MCP Server

## 🌐 Base URL
```
https://mcp-filazero.vercel.app
```

---

## 📋 **Endpoints Informativos**

### **GET /** 
**Descrição:** Endpoint raiz com status e documentação básica

**Response:**
```json
{
  "status": "healthy",
  "ready": true,  
  "service": "filazero-mcp-server",
  "timestamp": "2025-08-10T00:45:19.577Z",
  "uptime": 129.623724486
}
```

### **GET /health**
**Descrição:** Status detalhado do servidor

**Response:**
```json
{
  "status": "healthy",
  "timestamp": "2025-08-10T00:45:25.472Z", 
  "uptime": 135.518230351,
  "version": "1.0.0",
  "environment": "production",
  "apiUrl": "https://api.filazero.net/",
  "type": "http-mcp-server",
  "port": 3000,
  "memoryUsage": {
    "rss": 78508032,
    "heapTotal": 15519744,
    "heapUsed": 13158784
  }
}
```

### **GET /tools**
**Descrição:** Lista todas as ferramentas MCP disponíveis

**Response:**
```json
{
  "tools": [
    {
      "name": "get_terminal",
      "description": "Busca terminal por chave de acesso",
      "parameters": {
        "type": "object", 
        "properties": {
          "accessKey": {
            "type": "string",
            "description": "Chave de acesso do terminal"
          }
        },
        "required": ["accessKey"]
      }
    }
    // ... mais 10 ferramentas
  ]
}
```

---

## 🛠️ **Endpoint Principal MCP**

### **POST /mcp**
**Descrição:** Executa ferramentas MCP

**Headers:**
```
Content-Type: application/json
```

**Body Format:**
```json
{
  "tool": "nome_da_ferramenta",
  "arguments": {
    "param1": "valor1",
    "param2": "valor2"
  }
}
```

**Response Format (Success):**
```json
{
  "success": true,
  "tool": "get_terminal",
  "timestamp": "2025-08-10T00:46:07.282Z",
  "data": {
    // Dados da resposta da API Filazero
  }
}
```

**Response Format (Error):**
```json
{
  "success": false,
  "error": "Mensagem de erro",
  "tool": "get_terminal", 
  "timestamp": "2025-08-10T00:46:07.282Z",
  "details": "Detalhes do erro"
}
```

---

## 🎯 **Ferramentas MCP Disponíveis**

### **1. get_terminal**
**Descrição:** Busca terminal por chave de acesso

**Parâmetros:**
- `accessKey` (string, required) - Chave de acesso do terminal

**Exemplo:**
```bash
curl -X POST https://mcp-filazero.vercel.app/mcp \
  -H "Content-Type: application/json" \
  -d '{
    "tool": "get_terminal", 
    "arguments": {
      "accessKey": "1d1373dcf045408aa3b13914f2ac1076"
    }
  }'
```

### **2. create_ticket** 
**Descrição:** Cria novo ticket via booking express

**Parâmetros:**
- `terminalSchedule` (object, required) - Schedule do terminal
- `pid` (number, required) - Provider ID  
- `locationId` (number, required) - ID da localização
- `serviceId` (number, required) - ID do serviço
- `customer` (object, required) - Dados do cliente
  - `name` (string) - Nome
  - `phone` (string) - Telefone  
  - `email` (string) - Email
- `browserUuid` (string, required) - UUID único
- `recaptcha` (string, optional) - Token reCAPTCHA
- `priority` (number, optional) - Prioridade 0-10
- `metadata` (array, optional) - Metadados

**Exemplo:**
```bash
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
      "browserUuid": "uuid-123-456",
      "terminalSchedule": {
        "id": 1,
        "publicAccessKey": "ABC123",
        "sessions": []
      }
    }
  }'
```

### **3. get_ticket**
**Descrição:** Busca ticket por ID

**Parâmetros:**
- `id` (number, required) - ID do ticket

**Exemplo:**
```bash
curl -X POST https://mcp-filazero.vercel.app/mcp \
  -H "Content-Type: application/json" \
  -d '{
    "tool": "get_ticket",
    "arguments": {
      "id": 12345
    }
  }'
```

### **4. get_queue_position**
**Descrição:** Consulta posição na fila

**Parâmetros:**
- `providerId` (number, required) - ID do provider
- `ticketId` (number, required) - ID do ticket

**Exemplo:**
```bash
curl -X POST https://mcp-filazero.vercel.app/mcp \
  -H "Content-Type: application/json" \
  -d '{
    "tool": "get_queue_position", 
    "arguments": {
      "providerId": 906,
      "ticketId": 12345
    }
  }'
```

### **5. get_ticket_prevision**
**Descrição:** Consulta previsão de atendimento

**Parâmetros:**
- `ticketId` (number, required) - ID do ticket

**Exemplo:**
```bash
curl -X POST https://mcp-filazero.vercel.app/mcp \
  -H "Content-Type: application/json" \
  -d '{
    "tool": "get_ticket_prevision",
    "arguments": {
      "ticketId": 12345  
    }
  }'
```

### **6. cancel_ticket**
**Descrição:** Cancela ticket

**Parâmetros:**
- `ticketId` (number, required) - ID do ticket
- `providerId` (number, required) - ID do provider  
- `cancellation` (string, optional) - Motivo do cancelamento

**Exemplo:**
```bash
curl -X POST https://mcp-filazero.vercel.app/mcp \
  -H "Content-Type: application/json" \
  -d '{
    "tool": "cancel_ticket",
    "arguments": {
      "ticketId": 12345,
      "providerId": 906,
      "cancellation": "Cliente desistiu"
    }
  }'
```

### **7. checkin_ticket** 
**Descrição:** Check-in via smart code

**Parâmetros:**
- `smartCode` (string, required) - Código smart do ticket
- `providerId` (number, required) - ID do provider

**Exemplo:**
```bash
curl -X POST https://mcp-filazero.vercel.app/mcp \
  -H "Content-Type: application/json" \
  -d '{
    "tool": "checkin_ticket",
    "arguments": {
      "smartCode": "SC-ABC123", 
      "providerId": 906
    }
  }'
```

### **8. confirm_presence**
**Descrição:** Confirma presença do cliente

**Parâmetros:**
- `ticketId` (number, required) - ID do ticket
- `providerId` (number, required) - ID do provider

**Exemplo:**
```bash
curl -X POST https://mcp-filazero.vercel.app/mcp \
  -H "Content-Type: application/json" \
  -d '{
    "tool": "confirm_presence",
    "arguments": {
      "ticketId": 12345,
      "providerId": 906
    }
  }'
```

### **9. update_feedback**
**Descrição:** Atualiza feedback do atendimento

**Parâmetros:**
- `feedbackId` (number, required) - ID do feedback
- `guid` (string, required) - GUID único
- `rate` (number, required) - Nota de 1 a 5
- `comment` (string, optional) - Comentário
- `platform` (string, optional) - Plataforma (web/mobile/mcp)

**Exemplo:**
```bash
curl -X POST https://mcp-filazero.vercel.app/mcp \
  -H "Content-Type: application/json" \
  -d '{
    "tool": "update_feedback",
    "arguments": {
      "feedbackId": 123,
      "guid": "uuid-feedback-456", 
      "rate": 5,
      "comment": "Excelente atendimento"
    }
  }'
```

### **10. get_service**
**Descrição:** Busca informações de um serviço

**Parâmetros:**
- `id` (number, required) - ID do serviço

**Exemplo:**
```bash
curl -X POST https://mcp-filazero.vercel.app/mcp \
  -H "Content-Type: application/json" \
  -d '{
    "tool": "get_service",
    "arguments": {
      "id": 123
    }
  }'
```

### **11. get_company_template**
**Descrição:** Busca template visual da empresa

**Parâmetros:** 
- `slug` (string, required) - Slug da empresa (artesano, boticario, nike, noel)

**Exemplo:**
```bash
curl -X POST https://mcp-filazero.vercel.app/mcp \
  -H "Content-Type: application/json" \
  -d '{
    "tool": "get_company_template",
    "arguments": {
      "slug": "artesano"
    }
  }'
```

---

## 🔑 **Provider IDs (Produção)**
- **Artesano**: 906
- **O Boticário**: 730
- **Nike**: 769
- **Noel**: 777

## 🧪 **Chave de Teste**
- **Access Key**: `1d1373dcf045408aa3b13914f2ac1076`

---

## ⚡ **Rate Limits & Performance**
- **Response Time**: ~0.6 segundos
- **Uptime**: 99.9%+ (Vercel)
- **CORS**: Habilitado para todas as origens
- **HTTPS**: SSL/TLS habilitado

## 🛡️ **Códigos de Erro Comuns**
- **2150**: Terminal não encontrado
- **2155**: reCAPTCHA inválido  
- **400**: Parâmetros inválidos
- **404**: Tool não encontrada
- **500**: Erro interno do servidor