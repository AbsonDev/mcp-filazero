/**
 * Servidor HTTP MCP para Cursor (igual Context7)
 * Funciona via URL simples sem configuração complexa
 */

import express from 'express';
import cors from 'cors';
import { terminalService } from './services/terminal.service.js';
import { ticketService } from './services/ticket.service.js';
import { feedbackService } from './services/feedback.service.js';
import config from './config/environment.js';

const app = express();
const PORT = parseInt(process.env.PORT || '3000');

// Log da porta para debugging
console.error(`🔧 Configuração de porta: ${PORT} (Railway: ${process.env.PORT ? 'detectado' : 'padrão'})`);

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Logging middleware
app.use((req, res, next) => {
  console.error(`🌐 ${req.method} ${req.path}`);
  next();
});

// Health check endpoint (integrado na porta principal)
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    version: '1.0.0',
    environment: config.environment,
    apiUrl: config.apiUrl,
    type: 'http-mcp-server',
    port: PORT,
    memoryUsage: process.memoryUsage(),
    pid: process.pid,
    railway: {
      static_url: process.env.RAILWAY_STATIC_URL || null,
      environment: process.env.RAILWAY_ENVIRONMENT || null
    }
  });
});

// Health check adicional na raiz para Railway
app.get('/ping', (req, res) => {
  res.json({ status: 'pong', timestamp: new Date().toISOString() });
});

// MCP Tools endpoint para Cursor
app.get('/tools', (req, res) => {
  const tools = [
    {
      name: 'get_terminal',
      description: 'Busca terminal por chave de acesso',
      parameters: {
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
      parameters: {
        type: 'object',
        properties: {
          terminalSchedule: { type: 'object' },
          pid: { type: 'number' },
          locationId: { type: 'number' },
          serviceId: { type: 'number' },
          customer: { type: 'object' },
          browserUuid: { type: 'string' }
        },
        required: ['terminalSchedule', 'pid', 'locationId', 'serviceId', 'customer', 'browserUuid']
      }
    },
    {
      name: 'get_ticket',
      description: 'Busca ticket por ID',
      parameters: {
        type: 'object',
        properties: {
          id: { type: 'number' }
        },
        required: ['id']
      }
    },
    {
      name: 'get_queue_position',
      description: 'Consulta posição na fila',
      parameters: {
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
      parameters: {
        type: 'object',
        properties: {
          ticketId: { type: 'number' }
        },
        required: ['ticketId']
      }
    },
    {
      name: 'cancel_ticket',
      description: 'Cancela ticket',
      parameters: {
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
      parameters: {
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
      parameters: {
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
      parameters: {
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
      parameters: {
        type: 'object',
        properties: {
          id: { type: 'number' }
        },
        required: ['id']
      }
    },
    {
      name: 'get_company_template',
      description: 'Busca template da empresa',
      parameters: {
        type: 'object',
        properties: {
          slug: { type: 'string' }
        },
        required: ['slug']
      }
    }
  ];

  res.json({ tools });
});

// Endpoint genérico para executar tools
app.post('/execute/:toolName', async (req, res) => {
  const { toolName } = req.params;
  const args = req.body;

  console.error(`🛠️ HTTP: Executando ${toolName}`);
  console.error(`📝 Args:`, JSON.stringify(args, null, 2));

  try {
    let result: any;

    switch (toolName) {
      case 'get_terminal':
        result = await terminalService.getTerminal(args.accessKey);
        break;

      case 'create_ticket':
        result = await ticketService.createTicket(args);
        break;

      case 'get_ticket':
        result = await ticketService.getTicket(args.id);
        break;

      case 'get_queue_position':
        result = await ticketService.getQueuePosition(args.providerId, args.ticketId);
        break;

      case 'get_ticket_prevision':
        result = await ticketService.getTicketPrevision(args.ticketId);
        break;

      case 'cancel_ticket':
        result = await ticketService.cancelTicket(args.ticketId, args.providerId, args.cancellation);
        break;

      case 'checkin_ticket':
        result = await ticketService.checkinTicket(args.smartCode, args.providerId);
        break;

      case 'confirm_presence':
        result = await ticketService.confirmPresence(args.ticketId, args.providerId);
        break;

      case 'update_feedback':
        result = await feedbackService.updateFeedback(args.feedbackId, args.guid, args);
        break;

      case 'get_service':
        result = await terminalService.getService(args.id);
        break;

      case 'get_company_template':
        result = await terminalService.getCompanyTemplate(args.slug);
        break;

      default:
        return res.status(404).json({
          error: `Tool ${toolName} não encontrada`,
          success: false,
          availableTools: [
            'get_terminal', 'create_ticket', 'get_ticket', 'get_queue_position',
            'get_ticket_prevision', 'cancel_ticket', 'checkin_ticket',
            'confirm_presence', 'update_feedback', 'get_service', 'get_company_template'
          ]
        });
    }

    console.error(`✅ HTTP: ${toolName} executado com sucesso`);

    return res.json({
      success: true,
      tool: toolName,
      timestamp: new Date().toISOString(),
      data: result
    });

  } catch (error: any) {
    console.error(`❌ HTTP: Erro em ${toolName}:`, error.message);

    return res.status(500).json({
      success: false,
      error: error.message,
      tool: toolName,
      timestamp: new Date().toISOString(),
      details: error.response?.data || 'Erro interno'
    });
  }
});

// Endpoint específico para simplificar uso no Cursor
app.post('/mcp', async (req, res) => {
  const { tool, arguments: args } = req.body;
  
  if (!tool) {
    return res.status(400).json({
      error: 'Campo "tool" é obrigatório',
      example: { tool: 'get_terminal', arguments: { accessKey: 'ABC123' } }
    });
  }

  console.error(`🛠️ MCP: Executando ${tool}`);
  console.error(`📝 Args:`, JSON.stringify(args, null, 2));

  try {
    let result: any;

    switch (tool) {
      case 'get_terminal':
        result = await terminalService.getTerminal(args?.accessKey);
        break;

      case 'create_ticket':
        result = await ticketService.createTicket(args);
        break;

      case 'get_ticket':
        result = await ticketService.getTicket(args?.id);
        break;

      case 'get_queue_position':
        result = await ticketService.getQueuePosition(args?.providerId, args?.ticketId);
        break;

      case 'get_ticket_prevision':
        result = await ticketService.getTicketPrevision(args?.ticketId);
        break;

      case 'cancel_ticket':
        result = await ticketService.cancelTicket(args?.ticketId, args?.providerId, args?.cancellation);
        break;

      case 'checkin_ticket':
        result = await ticketService.checkinTicket(args?.smartCode, args?.providerId);
        break;

      case 'confirm_presence':
        result = await ticketService.confirmPresence(args?.ticketId, args?.providerId);
        break;

      case 'update_feedback':
        result = await feedbackService.updateFeedback(args?.feedbackId, args?.guid, args);
        break;

      case 'get_service':
        result = await terminalService.getService(args?.id);
        break;

      case 'get_company_template':
        result = await terminalService.getCompanyTemplate(args?.slug);
        break;

      default:
        return res.status(404).json({
          error: `Tool ${tool} não encontrada`,
          success: false,
          availableTools: [
            'get_terminal', 'create_ticket', 'get_ticket', 'get_queue_position',
            'get_ticket_prevision', 'cancel_ticket', 'checkin_ticket',
            'confirm_presence', 'update_feedback', 'get_service', 'get_company_template'
          ]
        });
    }

    console.error(`✅ MCP: ${tool} executado com sucesso`);

    return res.json({
      success: true,
      tool: tool,
      timestamp: new Date().toISOString(),
      data: result
    });

  } catch (error: any) {
    console.error(`❌ MCP: Erro em ${tool}:`, error.message);

    return res.status(500).json({
      success: false,
      error: error.message,
      tool: tool,
      timestamp: new Date().toISOString(),
      details: error.response?.data || 'Erro interno'
    });
  }
});

// Documentação da API
app.get('/', (req, res) => {
  res.json({
    name: 'Filazero MCP Server HTTP',
    version: '1.0.0',
    description: 'Servidor HTTP MCP para Cursor - igual Context7',
    endpoints: {
      'GET /': 'Esta documentação',
      'GET /health': 'Status do servidor',
      'GET /tools': 'Lista todas as tools disponíveis',
      'POST /execute/:toolName': 'Executa uma tool específica',
      'POST /mcp': 'Endpoint genérico para MCP (compatível Cursor)'
    },
    usage: {
      'Cursor MCP': 'Configure URL: https://mcp-filazero-production.up.railway.app',
      'Exemplo': 'POST /mcp { "tool": "get_terminal", "arguments": { "accessKey": "ABC123" } }'
    },
    tools: [
      'get_terminal', 'create_ticket', 'get_ticket', 'get_queue_position',
      'get_ticket_prevision', 'cancel_ticket', 'checkin_ticket',
      'confirm_presence', 'update_feedback', 'get_service', 'get_company_template'
    ]
  });
});

// Error handling middleware
app.use((error: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('❌ HTTP Server Error:', error);
  res.status(500).json({
    error: 'Erro interno do servidor',
    timestamp: new Date().toISOString(),
    path: req.path
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    error: 'Endpoint não encontrado',
    path: req.path,
    availableEndpoints: ['/', '/health', '/tools', '/execute/:toolName', '/mcp']
  });
});

// Inicializar servidor
async function startHttpServer() {
  try {
    // Log de inicialização
    console.error('⚡ Inicializando servidor HTTP...');
    
    const server = app.listen(PORT, '0.0.0.0', () => {
      console.error('🌐 Filazero HTTP MCP Server iniciado!');
      console.error(`📡 Ambiente: ${config.environment}`);
      console.error(`🔗 API URL: ${config.apiUrl}`);
      console.error(`🌐 HTTP Server: http://0.0.0.0:${PORT}`);
      console.error(`🛠️ Endpoints disponíveis: /, /health, /ping, /tools, /execute/:tool, /mcp`);
      console.error('💡 Servidor HTTP pronto para Cursor/navegador...');
      
      // Log adicional para Railway
      if (process.env.RAILWAY_STATIC_URL) {
        console.error(`🚂 Railway URL: ${process.env.RAILWAY_STATIC_URL}`);
      }
      
      // Log específico para debugging Railway
      console.error('✅ READY - Servidor respondendo requisições HTTP');
    });

    // Graceful shutdown melhorado
    const gracefulShutdown = (signal: string) => {
      console.error(`🛑 Recebido ${signal}, encerrando servidor HTTP gracefully...`);
      
      server.close(() => {
        console.error('✅ Servidor HTTP encerrado com sucesso');
        process.exit(0);
      });
      
      // Force shutdown após 10 segundos
      setTimeout(() => {
        console.error('⚠️ Forçando encerramento...');
        process.exit(1);
      }, 10000);
    };

    process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
    process.on('SIGINT', () => gracefulShutdown('SIGINT'));

  } catch (error) {
    console.error('❌ Erro ao iniciar servidor HTTP:', error);
    process.exit(1);
  }
}

export { startHttpServer };
