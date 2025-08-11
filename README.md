# 🚀 Filazero MCP Server

Servidor MCP (Model Context Protocol) para integração com as APIs do sistema Filazero Express. Desenvolvido em Node.js/TypeScript para máxima performance e simplicidade.

## ✨ Características

- ✅ **Alto Performance**: Servidor otimizado com resposta rápida
- ✅ **TypeScript**: Tipagem forte e desenvolvimento seguro
- ✅ **SDK Oficial MCP**: Integração nativa da Anthropic
- ✅ **Multi-ambiente**: Development, Staging e Production
- ✅ **Flexível**: Suporte a HTTP e MCP SSE

## 🛠️ Tecnologias

- **Node.js 18+**: Runtime JavaScript
- **TypeScript**: Linguagem principal  
- **@modelcontextprotocol/sdk**: SDK oficial MCP
- **Axios**: Cliente HTTP
- **Express**: Servidor HTTP (modo alternativo)

## 📦 Instalação e Setup

### Pré-requisitos

```bash
# Node.js 18 ou superior
node --version  # v18.0.0+

# npm atualizado  
npm --version   # 9.0.0+
```

### Instalação

```bash
# Instalar dependências
npm install

# Compilar TypeScript
npm run build

# Executar servidor MCP
npm start

# Executar em desenvolvimento
npm run dev
```

## 🔧 Configuração

### Ambientes Disponíveis

Configure via `NODE_ENV`:

```bash
NODE_ENV=development  # Padrão
NODE_ENV=staging     
NODE_ENV=production   
```

### URLs por Ambiente

- **Development**: `https://api.dev.filazero.net/`
- **Staging**: `https://api.staging.filazero.net/`
- **Production**: `https://api.staging.filazero.net/`

### Providers por Ambiente

#### Development/Staging
- **Artesano**: 460
- **O Boticário**: 358  
- **Nike**: 356
- **Noel**: 357

#### Production
- **Artesano**: 906
- **O Boticário**: 730
- **Nike**: 769
- **Noel**: 777

## 🎯 Tools MCP Disponíveis

### Terminal Operations
- `get_terminal` - Buscar terminal por chave de acesso
- `get_service` - Obter informações de serviço
- `get_company_template` - Template visual da empresa

### Ticket Operations  
- `create_ticket` - Criar novo ticket via booking express
- `get_ticket` - Buscar ticket por ID
- `get_queue_position` - Consultar posição na fila
- `get_ticket_prevision` - Previsão de atendimento
- `cancel_ticket` - Cancelar ticket existente
- `checkin_ticket` - Check-in usando smart code
- `confirm_presence` - Confirmar presença do cliente

### Feedback Operations
- `update_feedback` - Atualizar feedback do atendimento

## 🤖 Configuração MCP para Claude

Adicione ao seu `claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "filazero": {
      "command": "node",
      "args": ["dist/mcp-sse-index.js"],
      "cwd": "/caminho/para/mcp-filazero",
      "env": {
        "NODE_ENV": "development"
      }
    }
  }
}
```

### Para Desenvolvimento

```json
{
  "mcpServers": {
    "filazero-dev": {
      "command": "npm",
      "args": ["run", "dev"],
      "cwd": "/caminho/para/mcp-filazero",
      "env": {
        "NODE_ENV": "development"
      }
    }
  }
}
```

## 🚀 Scripts Disponíveis

### MCP (Principal)
```bash
npm start                # Executar servidor MCP
npm run dev              # Desenvolvimento com reload
npm run dev:mcp          # Build + servidor MCP
```

### HTTP (Alternativo)
```bash
npm run start:http       # Servidor HTTP
npm run dev:http         # Desenvolvimento HTTP
```

### Desenvolvimento
```bash
npm run build            # Compilar TypeScript
npm run watch            # Watch mode
npm run lint             # Lint do código
npm run format           # Formatar código
```

### Plataformas
```bash
npm run replit           # Deploy Replit
npm run railway          # Deploy Railway  
npm run vercel-build     # Build Vercel
```

## 📁 Estrutura do Projeto

```
mcp-filazero/
├── src/
│   ├── config/              # Configurações por ambiente
│   │   ├── environment.ts   # Config principal
│   │   ├── providers.ts     # Provider IDs
│   │   └── *.ts            # Configs específicas
│   ├── models/             # Tipos TypeScript
│   │   ├── filazero.types.ts
│   │   └── mcp.types.ts
│   ├── services/           # Serviços da aplicação
│   │   ├── api.service.ts
│   │   ├── terminal.service.ts
│   │   ├── ticket.service.ts
│   │   ├── feedback.service.ts
│   │   └── recaptcha*.ts
│   ├── index.ts            # Servidor MCP básico
│   ├── mcp-sse-index.ts    # Servidor MCP SSE (principal)
│   ├── mcp-sse-server.ts   # Implementação MCP SSE
│   ├── http-index.ts       # Servidor HTTP
│   └── http-server.ts      # Implementação HTTP
├── config/                 # Configurações de ambiente
├── scripts/               # Scripts de deploy
├── dist/                  # Código compilado
├── package.json
├── tsconfig.json
└── README.md
```

## 🧪 Testando o Servidor

### 1. Teste Local

```bash
npm start
```

Deve exibir:
```
🚀 Filazero MCP Server iniciado!
📡 Ambiente: development  
🔗 API URL: https://api.dev.filazero.net/
🛠️ Tools disponíveis: 11
💡 Aguardando comandos MCP...
```

### 2. Teste com Claude

Exemplos de comandos:
- "Buscar terminal com chave ABC123"
- "Criar ticket para João Silva no terminal ABC123"  
- "Consultar posição do ticket 12345"
- "Cancelar ticket 12345"

## 🚢 Deploy

### Railway
```bash
npm run railway
```

### Replit  
```bash
npm run replit
```

### Vercel
```bash
npm run vercel-build
```

## 🔐 Segurança e Monitoramento

- ✅ **Validação TypeScript**: Tipagem forte
- ✅ **Error Handling**: Tratamento robusto de erros
- ✅ **Logging**: Logs estruturados para debug
- ✅ **Timeouts**: Timeout de 30s nas requisições
- ✅ **Health Checks**: Endpoint de saúde disponível

## 📜 Licença

MIT License - veja arquivo LICENSE para detalhes.

---

**🎯 Servidor MCP otimizado para integração perfeita com Claude Desktop e APIs Filazero!**