import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { 
  CallToolRequestSchema,
  ListToolsRequestSchema,
  McpError,
  ErrorCode
} from '@modelcontextprotocol/sdk/types.js';

import { terminalService } from './services/terminal.service.js';
import { ticketService } from './services/ticket.service.js';
import { feedbackService } from './services/feedback.service.js';
import config from './config/environment.js';
import http from 'http';

// Criar servidor MCP
const server = new Server(
  {
    name: 'filazero-mcp-server',
    version: '1.0.0',
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

// Definir tools disponíveis (baseado no projeto .NET)
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
        terminalSchedule: { 
          type: 'object',
          properties: {
            id: { type: 'number', description: 'ID do terminal schedule' },
            publicAccessKey: { type: 'string', description: 'Chave pública do terminal' },
            sessions: {
              type: 'array',
              description: 'Array de sessões disponíveis',
              items: {
                type: 'object',
                properties: {
                  id: { type: 'number', description: 'ID da sessão' },
                  start: { type: 'string', description: 'Data/hora de início (ISO 8601)' },
                  end: { type: 'string', description: 'Data/hora de fim (ISO 8601)' },
                  hasSlotsLeft: { type: 'boolean', description: 'Se ainda há vagas disponíveis' }
                },
                required: ['id', 'start', 'end', 'hasSlotsLeft']
              }
            }
          },
          required: ['id', 'publicAccessKey', 'sessions']
        },
        pid: { type: 'number', description: 'Provider ID' },
        locationId: { type: 'number', description: 'ID da localização' },
        serviceId: { type: 'number', description: 'ID do serviço' },
        customer: {
          type: 'object',
          properties: {
            name: { type: 'string', description: 'Nome do cliente' },
            phone: { type: 'string', description: 'Telefone do cliente' },
            email: { type: 'string', description: 'Email do cliente' }
          },
          required: ['name', 'phone', 'email']
        },
        recaptcha: { 
          type: 'string', 
          description: 'Token do reCAPTCHA v3 (OPCIONAL - servidor gera automaticamente se não fornecido)',
          minLength: 10
        },
        priority: { type: 'number', description: 'Prioridade (0-10)', default: 0 },
        metadata: { type: 'array', description: 'Metadados adicionais', default: [] },
        browserUuid: { type: 'string', description: 'UUID único do browser' }
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
        providerId: { type: 'number', description: 'ID do provider' },
        ticketId: { type: 'number', description: 'ID do ticket' }
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
        ticketId: { type: 'number', description: 'ID do ticket' }
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
        ticketId: { type: 'number', description: 'ID do ticket a cancelar' },
        providerId: { type: 'number', description: 'ID do provider' },
        cancellation: { 
          type: 'string', 
          description: 'Motivo do cancelamento',
          default: 'Cancelado via MCP'
        }
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
        smartCode: { type: 'string', description: 'Código smart do ticket (ex: SC-ABC123)' },
        providerId: { type: 'number', description: 'ID do provider' }
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
        ticketId: { type: 'number', description: 'ID do ticket' },
        providerId: { type: 'number', description: 'ID do provider' }
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
        feedbackId: { type: 'number', description: 'ID do feedback' },
        guid: { type: 'string', description: 'GUID único do feedback' },
        comment: { type: 'string', description: 'Comentário do cliente' },
        rate: { type: 'number', description: 'Nota de 1 a 5', minimum: 1, maximum: 5 },
        platform: { 
          type: 'string', 
          description: 'Plataforma de origem',
          enum: ['web', 'mobile', 'mcp'],
          default: 'mcp'
        }
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
        id: { type: 'number', description: 'ID do serviço' }
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
        slug: { 
          type: 'string', 
          description: 'Slug da empresa (ex: artesano, boticario, nike, noel)' 
        }
      },
      required: ['slug']
    }
  }
];

// Handler para listar tools disponíveis
server.setRequestHandler(ListToolsRequestSchema, async () => {
  console.error(`📋 Listando ${tools.length} tools disponíveis`);
  return { tools };
});

// Handler para executar tools
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;
  
  console.error(`🛠️ Executando tool: ${name}`);
  console.error(`📝 Argumentos:`, JSON.stringify(args, null, 2));

  // Validar se argumentos existem
  if (!args) {
    throw new McpError(ErrorCode.InvalidParams, 'Argumentos são obrigatórios');
  }

  try {
    let result: any;

    switch (name) {
      case 'get_terminal':
        result = await terminalService.getTerminal(args.accessKey as string);
        break;

      case 'create_ticket':
        result = await ticketService.createTicket(args as any);
        break;

      case 'get_ticket':
        result = await ticketService.getTicket(args.id as number);
        break;

      case 'get_queue_position':
        result = await ticketService.getQueuePosition(
          args.providerId as number, 
          args.ticketId as number
        );
        break;

      case 'get_ticket_prevision':
        result = await ticketService.getTicketPrevision(args.ticketId as number);
        break;

      case 'cancel_ticket':
        result = await ticketService.cancelTicket(
          args.ticketId as number, 
          args.providerId as number, 
          args.cancellation as string
        );
        break;

      case 'checkin_ticket':
        result = await ticketService.checkinTicket(
          args.smartCode as string, 
          args.providerId as number
        );
        break;

      case 'confirm_presence':
        result = await ticketService.confirmPresence(
          args.ticketId as number, 
          args.providerId as number
        );
        break;

      case 'update_feedback':
        result = await feedbackService.updateFeedback(
          args.feedbackId as number,
          args.guid as string,
          args as Record<string, any>
        );
        break;

      case 'get_service':
        result = await terminalService.getService(args.id as number);
        break;

      case 'get_company_template':
        result = await terminalService.getCompanyTemplate(args.slug as string);
        break;

      default:
        throw new McpError(
          ErrorCode.MethodNotFound, 
          `Ferramenta não encontrada: ${name}`
        );
    }

    console.error(`✅ Tool ${name} executada com sucesso`);

    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify(result, null, 2)
        }
      ]
    };

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
    
    console.error(`❌ Erro ao executar tool ${name}:`, errorMessage);
    
    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify({ 
            error: errorMessage, 
            success: false,
            tool: name,
            timestamp: new Date().toISOString()
          }, null, 2)
        }
      ],
      isError: true
    };
  }
});

// Health check removido - agora integrado no servidor HTTP principal

// Função principal para inicializar o servidor
async function main() {
  try {
    const transport = new StdioServerTransport();
    await server.connect(transport);
    
    // Logs de inicialização
    console.error('🚀 Filazero MCP Server (Node.js) iniciado!');
    console.error(`📡 Ambiente: ${config.environment}`);
    console.error(`🔗 API URL: ${config.apiUrl}`);
    console.error(`📊 Log Level: ${config.logLevel}`);
    console.error(`🛠️ Total de tools: ${tools.length}`);
    console.error('');
    console.error('💡 Servidor pronto para receber comandos MCP...');
    
  } catch (error) {
    console.error('❌ Erro fatal ao inicializar servidor:', error);
    process.exit(1);
  }
}

// Tratamento de sinais e erros
process.on('SIGINT', () => {
  console.error('🛑 Recebido SIGINT, encerrando servidor...');
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.error('🛑 Recebido SIGTERM, encerrando servidor...');
  process.exit(0);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ Unhandled Rejection at:', promise, 'reason:', reason);
});

process.on('uncaughtException', (error) => {
  console.error('❌ Uncaught Exception:', error);
  process.exit(1);
});

// Inicializar servidor
main().catch((error) => {
  console.error('❌ Erro fatal na inicialização:', error);
  process.exit(1);
});