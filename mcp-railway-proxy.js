#!/usr/bin/env node

/**
 * MCP Proxy para conectar Claude Desktop → Railway MCP Server
 * Este proxy recebe comandos MCP via stdio e faz chamadas HTTP para o Railway
 */

const { Server } = require('@modelcontextprotocol/sdk/server/index.js');
const { StdioServerTransport } = require('@modelcontextprotocol/sdk/server/stdio.js');
const axios = require('axios');

// URL do seu servidor no Railway (SUBSTITUA pela sua URL)
const RAILWAY_MCP_URL = process.env.RAILWAY_MCP_URL || 'https://[seu-projeto].railway.app';

console.error('🚂 Iniciando MCP Railway Proxy...');
console.error(`🔗 Conectando ao: ${RAILWAY_MCP_URL}`);

// Criar servidor MCP local
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

// Tools disponíveis (espelhando do Railway)
const tools = [
  {
    name: 'get_terminal',
    description: 'Busca terminal por chave de acesso',
    inputSchema: {
      type: 'object',
      properties: {
        accessKey: { 
          type: 'string', 
          description: 'Chave de acesso do terminal (ex: ABC123)' 
        }
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
        customer: { type: 'object' },
        recaptcha: { type: 'string' },
        priority: { type: 'number', default: 0 },
        metadata: { type: 'array', default: [] },
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
      properties: {
        id: { type: 'number', description: 'ID do ticket' }
      },
      required: ['id']
    }
  },
  {
    name: 'get_queue_position',
    description: 'Consulta posição do ticket na fila',
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
    description: 'Consulta previsão de atendimento do ticket',
    inputSchema: {
      type: 'object',
      properties: {
        ticketId: { type: 'number' }
      },
      required: ['ticketId']
    }
  },
  {
    name: 'cancel_ticket',
    description: 'Cancela um ticket existente',
    inputSchema: {
      type: 'object',
      properties: {
        ticketId: { type: 'number' },
        providerId: { type: 'number' },
        cancellation: { type: 'string', default: 'Cancelado via MCP' }
      },
      required: ['ticketId', 'providerId']
    }
  },
  {
    name: 'checkin_ticket',
    description: 'Faz check-in usando smart code',
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
    description: 'Confirma presença do cliente',
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
    description: 'Atualiza feedback do atendimento',
    inputSchema: {
      type: 'object',
      properties: {
        feedbackId: { type: 'number' },
        guid: { type: 'string' },
        comment: { type: 'string' },
        rate: { type: 'number', minimum: 1, maximum: 5 },
        platform: { type: 'string', enum: ['web', 'mobile', 'mcp'], default: 'mcp' }
      },
      required: ['feedbackId', 'guid', 'rate']
    }
  },
  {
    name: 'get_service',
    description: 'Busca informações de um serviço',
    inputSchema: {
      type: 'object',
      properties: {
        id: { type: 'number' }
      },
      required: ['id']
    }
  },
  {
    name: 'get_company_template',
    description: 'Busca template visual da empresa',
    inputSchema: {
      type: 'object',
      properties: {
        slug: { type: 'string' }
      },
      required: ['slug']
    }
  }
];

// Handler para listar tools
server.setRequestHandler('tools/list', async () => {
  console.error(`📋 Proxy: Listando ${tools.length} tools do Railway`);
  return { tools };
});

// Handler para executar tools (proxy para Railway)
server.setRequestHandler('tools/call', async (request) => {
  const { name, arguments: args } = request.params;
  
  console.error(`🔄 Proxy: Executando ${name} no Railway...`);
  console.error(`📝 Args:`, JSON.stringify(args, null, 2));

  try {
    // Fazer chamada HTTP para o Railway (simulando MCP call)
    const response = await axios.post(`${RAILWAY_MCP_URL}/mcp/tools/call`, {
      method: 'tools/call',
      params: {
        name: name,
        arguments: args
      }
    }, {
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'Claude-MCP-Proxy/1.0'
      }
    });

    console.error(`✅ Proxy: ${name} executado com sucesso`);
    
    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify(response.data, null, 2)
        }
      ]
    };

  } catch (error) {
    console.error(`❌ Proxy: Erro ao executar ${name}:`, error.message);
    
    // Se Railway não responder, tentar health check
    if (error.code === 'ECONNREFUSED' || error.response?.status >= 500) {
      try {
        await axios.get(`${RAILWAY_MCP_URL}/health`);
        console.error('🏥 Railway está online, mas MCP endpoint não responde');
      } catch {
        console.error('💀 Railway parece estar offline');
      }
    }
    
    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify({ 
            error: `Erro de conexão com Railway: ${error.message}`,
            success: false,
            tool: name,
            timestamp: new Date().toISOString(),
            suggestion: 'Verifique se a URL do Railway está correta e o servidor está online'
          }, null, 2)
        }
      ],
      isError: true
    };
  }
});

// Função principal
async function main() {
  try {
    // Verificar se Railway está online
    console.error('🔍 Verificando conexão com Railway...');
    
    try {
      const healthCheck = await axios.get(`${RAILWAY_MCP_URL}/health`, { timeout: 10000 });
      console.error('✅ Railway está online!');
      console.error('📊 Status:', healthCheck.data?.status || 'healthy');
    } catch (error) {
      console.error('⚠️ Railway não responde (mas proxy continuará)');
      console.error('🔗 Verifique: ' + RAILWAY_MCP_URL);
    }

    // Conectar MCP Server
    const transport = new StdioServerTransport();
    await server.connect(transport);
    
    console.error('🚀 MCP Railway Proxy funcionando!');
    console.error('🔗 Railway: ' + RAILWAY_MCP_URL);
    console.error(`🛠️ Tools disponíveis: ${tools.length}`);
    console.error('💡 Proxy pronto para Claude Desktop...');
    
  } catch (error) {
    console.error('❌ Erro fatal no proxy:', error);
    process.exit(1);
  }
}

// Inicializar
main().catch((error) => {
  console.error('❌ Erro fatal na inicialização:', error);
  process.exit(1);
});
