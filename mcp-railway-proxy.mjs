#!/usr/bin/env node

/**
 * MCP Proxy para conectar Claude Desktop → Railway MCP Server (ES Module)
 */

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { 
  CallToolRequestSchema,
  ListToolsRequestSchema,
  McpError,
  ErrorCode
} from '@modelcontextprotocol/sdk/types.js';
import axios from 'axios';

// URL do seu servidor no Railway
const RAILWAY_MCP_URL = process.env.RAILWAY_MCP_URL || 'https://mcp-filazero-production.up.railway.app';

console.error('🚂 Iniciando MCP Railway Proxy (ES Module)...');
console.error(`🔗 Conectando ao Railway: ${RAILWAY_MCP_URL}`);

// Criar servidor MCP proxy
const server = new Server(
  {
    name: 'filazero-railway-proxy',
    version: '1.0.0',
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

// Definir todas as tools do Railway
const tools = [
  {
    name: 'get_terminal',
    description: 'Busca terminal por chave de acesso',
    inputSchema: {
      type: 'object',
      properties: {
        accessKey: { type: 'string', description: 'Chave de acesso do terminal' }
      },
      required: ['accessKey']
    }
  },
  {
    name: 'create_ticket', 
    description: 'Cria novo ticket via booking express',
    inputSchema: {
      type: 'object',
      properties: {
        terminalSchedule: { type: 'object' },
        pid: { type: 'number' },
        locationId: { type: 'number' },
        serviceId: { type: 'number' },
        customer: {
          type: 'object',
          properties: {
            name: { type: 'string' },
            phone: { type: 'string' },
            email: { type: 'string' }
          }
        },
        browserUuid: { type: 'string' }
      },
      required: ['terminalSchedule', 'pid', 'locationId', 'serviceId', 'customer', 'browserUuid']
    }
  },
  {
    name: 'get_ticket',
    description: 'Busca ticket por ID',
    inputSchema: {
      type: 'object',
      properties: { id: { type: 'number' } },
      required: ['id']
    }
  },
  {
    name: 'get_queue_position',
    description: 'Consulta posição na fila',
    inputSchema: {
      type: 'object',
      properties: {
        providerId: { type: 'number' },
        ticketId: { type: 'number' }
      },
      required: ['providerId', 'ticketId']
    }
  },
  {
    name: 'get_ticket_prevision',
    description: 'Consulta previsão de atendimento',
    inputSchema: {
      type: 'object',
      properties: { ticketId: { type: 'number' } },
      required: ['ticketId']
    }
  },
  {
    name: 'cancel_ticket',
    description: 'Cancela ticket',
    inputSchema: {
      type: 'object',
      properties: {
        ticketId: { type: 'number' },
        providerId: { type: 'number' },
        cancellation: { type: 'string' }
      },
      required: ['ticketId', 'providerId']
    }
  },
  {
    name: 'checkin_ticket',
    description: 'Check-in via smart code',
    inputSchema: {
      type: 'object',
      properties: {
        smartCode: { type: 'string' },
        providerId: { type: 'number' }
      },
      required: ['smartCode', 'providerId']
    }
  },
  {
    name: 'confirm_presence',
    description: 'Confirma presença',
    inputSchema: {
      type: 'object',
      properties: {
        ticketId: { type: 'number' },
        providerId: { type: 'number' }
      },
      required: ['ticketId', 'providerId']
    }
  },
  {
    name: 'update_feedback',
    description: 'Atualiza feedback',
    inputSchema: {
      type: 'object',
      properties: {
        feedbackId: { type: 'number' },
        guid: { type: 'string' },
        rate: { type: 'number' }
      },
      required: ['feedbackId', 'guid', 'rate']
    }
  },
  {
    name: 'get_service',
    description: 'Busca serviço por ID',
    inputSchema: {
      type: 'object',
      properties: { id: { type: 'number' } },
      required: ['id']
    }
  },
  {
    name: 'get_company_template',
    description: 'Busca template da empresa',
    inputSchema: {
      type: 'object',
      properties: { slug: { type: 'string' } },
      required: ['slug']
    }
  }
];

// Handler para listar tools
server.setRequestHandler(ListToolsRequestSchema, async () => {
  console.error(`📋 Listando ${tools.length} tools do Railway`);
  return { tools };
});

// Handler para executar tools via HTTP
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;
  
  console.error(`🔄 Executando ${name} via Railway...`);

  try {
    // Simular chamada MCP via HTTP POST
    const response = await axios.post(`${RAILWAY_MCP_URL}/api/mcp/execute`, {
      tool: name,
      arguments: args
    }, {
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'Claude-MCP-Proxy/1.0',
        'X-MCP-Source': 'claude-desktop'
      }
    });

    console.error(`✅ ${name} executado com sucesso`);
    
    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify(response.data, null, 2)
        }
      ]
    };

  } catch (error) {
    console.error(`❌ Erro ao executar ${name}:`, error.message);
    
    // Fallback: tentar health check
    if (error.response?.status >= 500) {
      console.error('🔍 Verificando se Railway está online...');
      try {
        const health = await axios.get(`${RAILWAY_MCP_URL}/health`);
        console.error('✅ Railway online, mas endpoint MCP falhou');
      } catch {
        console.error('💀 Railway offline ou inacessível');
      }
    }
    
    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify({ 
            error: `Conexão Railway falhou: ${error.message}`,
            success: false,
            tool: name,
            railway_url: RAILWAY_MCP_URL,
            timestamp: new Date().toISOString(),
            help: 'Verifique se RAILWAY_MCP_URL está correto'
          }, null, 2)
        }
      ],
      isError: true
    };
  }
});

// Inicialização
async function main() {
  try {
    console.error('🔍 Testando conexão com Railway...');
    
    // Health check
    try {
      const health = await axios.get(`${RAILWAY_MCP_URL}/health`, { timeout: 10000 });
      console.error('✅ Railway está online!');
      console.error(`📊 Status: ${health.data?.status || 'healthy'}`);
      console.error(`🌐 URL: ${RAILWAY_MCP_URL}`);
    } catch (error) {
      console.error('⚠️ Railway health check falhou');
      console.error(`🔗 URL testada: ${RAILWAY_MCP_URL}`);
      console.error('💡 Proxy continuará (Railway pode estar inicializando)');
    }

    // Conectar transporte MCP
    const transport = new StdioServerTransport();
    await server.connect(transport);
    
    console.error('🚀 MCP Railway Proxy ativo!');
    console.error(`🛠️ ${tools.length} tools proxy disponíveis`);
    console.error('💡 Aguardando comandos do Claude Desktop...');
    
  } catch (error) {
    console.error('❌ Erro fatal no proxy:', error);
    process.exit(1);
  }
}

main().catch(console.error);
