/**
 * MCP Server com Server-Sent Events (SSE)
 * Compatível com Cursor e outros clientes MCP modernos
 */

import express from 'express';
import cors from 'cors';
import { terminalService } from './services/terminal.service.js';
import { ticketService } from './services/ticket.service.js';
import { feedbackService } from './services/feedback.service.js';
import config from './config/environment.js';

interface MCPRequest {
  jsonrpc: '2.0';
  id: string | number;
  method: string;
  params?: any;
}

interface MCPResponse {
  jsonrpc: '2.0';
  id: string | number;
  result?: any;
  error?: {
    code: number;
    message: string;
    data?: any;
  };
}

interface MCPNotification {
  jsonrpc: '2.0';
  method: string;
  params?: any;
}

class MCPSSEServer {
  private _app: express.Application;
  private PORT: number;
  private clients: Map<string, express.Response> = new Map();

  constructor() {
    this._app = express();
    this.PORT = parseInt(process.env.PORT || '3000');
    this.setupMiddleware();
    this.setupRoutes();
  }

  private setupMiddleware() {
    this._app.use(cors({
      origin: '*',
      methods: ['GET', 'POST', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Accept', 'Cache-Control'],
      credentials: false
    }));
    
    this._app.use(express.json({ limit: '10mb' }));
    this._app.use(express.urlencoded({ extended: true }));

    // Logging middleware
    this._app.use((req, res, next) => {
      console.error(`📡 MCP-SSE: ${req.method} ${req.path} from ${req.ip}`);
      next();
    });
  }

  private setupRoutes() {
    // Health check endpoint
    this._app.get('/health', (req, res) => {
      res.json({
        status: 'healthy',
        protocol: 'MCP-SSE',
        version: '1.0.0',
        timestamp: new Date().toISOString(),
        uptime: process.uptime()
      });
    });

    // SSE connection endpoint para MCP
    this._app.get('/sse', (req, res) => {
      this.handleSSEConnection(req, res);
    });

    // HTTP endpoint para MCP requests
    this._app.post('/mcp', async (req, res) => {
      await this.handleMCPRequest(req, res);
    });

    // Compatibility endpoint
    this._app.get('/', (req, res) => {
      res.json({
        name: 'Filazero MCP Server (SSE)',
        protocol: 'MCP-SSE',
        version: '1.0.0',
        transport: ['http', 'sse'],
        endpoints: {
          'GET /': 'This documentation',
          'GET /health': 'Health check',
          'GET /sse': 'MCP SSE connection',
          'POST /mcp': 'MCP HTTP requests'
        },
        tools: [
          'get_terminal', 'create_ticket', 'get_ticket', 'get_queue_position',
          'get_ticket_prevision', 'cancel_ticket', 'checkin_ticket',
          'confirm_presence', 'update_feedback', 'get_service', 'get_company_template'
        ],
        usage: {
          cursor: 'Use URL: https://your-domain.com with SSE transport',
          claude_code: 'claude mcp add --transport sse filazero https://your-domain.com/sse'
        }
      });
    });
  }

  private handleSSEConnection(req: express.Request, res: express.Response) {
    const clientId = `client_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    // Setup SSE headers
    res.writeHead(200, {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': 'Cache-Control'
    });

    // Add client to map
    this.clients.set(clientId, res);
    
    console.error(`🔗 SSE Client connected: ${clientId}`);

    // Send initial hello message
    this.sendSSEMessage(res, {
      jsonrpc: '2.0',
      method: 'initialized',
      params: {
        protocolVersion: '2025-06-18',
        capabilities: {
          tools: {}
        },
        serverInfo: {
          name: 'filazero-mcp-server',
          version: '1.0.0'
        }
      }
    });

    // Handle client disconnect
    req.on('close', () => {
      console.error(`🔌 SSE Client disconnected: ${clientId}`);
      this.clients.delete(clientId);
    });

    req.on('error', (err) => {
      console.error(`❌ SSE Client error: ${clientId}`, err);
      this.clients.delete(clientId);
    });

    // Keep connection alive
    const keepAlive = setInterval(() => {
      if (this.clients.has(clientId)) {
        res.write('data: {"jsonrpc":"2.0","method":"ping"}\\n\\n');
      } else {
        clearInterval(keepAlive);
      }
    }, 30000);
  }

  private sendSSEMessage(res: express.Response, message: MCPResponse | MCPNotification) {
    const data = JSON.stringify(message);
    res.write(`data: ${data}\\n\\n`);
  }

  private async handleMCPRequest(req: express.Request, res: express.Response) {
    const request: MCPRequest = req.body;
    
    console.error(`🛠️ MCP Request: ${request.method}`, request.params);

    try {
      let response: MCPResponse;

      switch (request.method) {
        case 'initialize':
          response = await this.handleInitialize(request);
          break;
        
        case 'tools/list':
          response = await this.handleListTools(request);
          break;
        
        case 'tools/call':
          response = await this.handleCallTool(request);
          break;
        
        default:
          response = {
            jsonrpc: '2.0',
            id: request.id,
            error: {
              code: -32601,
              message: `Method not found: ${request.method}`
            }
          };
      }

      res.json(response);
    } catch (error: any) {
      console.error(`❌ MCP Error:`, error);
      
      const errorResponse: MCPResponse = {
        jsonrpc: '2.0',
        id: request.id,
        error: {
          code: -32603,
          message: 'Internal error',
          data: error.message
        }
      };

      res.status(500).json(errorResponse);
    }
  }

  private async handleInitialize(request: MCPRequest): Promise<MCPResponse> {
    return {
      jsonrpc: '2.0',
      id: request.id,
      result: {
        protocolVersion: '2025-06-18',
        capabilities: {
          tools: {}
        },
        serverInfo: {
          name: 'filazero-mcp-server',
          version: '1.0.0'
        }
      }
    };
  }

  private async handleListTools(request: MCPRequest): Promise<MCPResponse> {
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
            browserUuid: { type: 'string', description: 'UUID único do browser' },
            recaptcha: { type: 'string', description: 'Token reCAPTCHA (opcional)' },
            priority: { type: 'number', description: 'Prioridade (0-10)', default: 0 }
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

    return {
      jsonrpc: '2.0',
      id: request.id,
      result: { tools }
    };
  }

  private async handleCallTool(request: MCPRequest): Promise<MCPResponse> {
    const { name, arguments: args } = request.params;
    
    try {
      let result: any;

      switch (name) {
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
          throw new Error(`Unknown tool: ${name}`);
      }

      return {
        jsonrpc: '2.0',
        id: request.id,
        result: {
          content: [
            {
              type: 'text',
              text: JSON.stringify(result, null, 2)
            }
          ]
        }
      };

    } catch (error: any) {
      return {
        jsonrpc: '2.0',
        id: request.id,
        error: {
          code: -32603,
          message: `Tool execution failed: ${error.message}`,
          data: { tool: name, arguments: args }
        }
      };
    }
  }

  public get app(): express.Application {
    return this._app;
  }

  public start(): void {
    this._app.listen(this.PORT, '0.0.0.0', () => {
      console.error('🚀 Filazero MCP-SSE Server iniciado!');
      console.error(`📡 Protocolo: MCP com Server-Sent Events`);
      console.error(`🌐 URL: http://0.0.0.0:${this.PORT}`);
      console.error(`🔗 SSE: http://0.0.0.0:${this.PORT}/sse`);
      console.error(`🛠️ Tools: 11 ferramentas MCP disponíveis`);
      console.error('');
      console.error('💡 Compatível com:');
      console.error('  - ✅ Cursor (SSE transport)');
      console.error('  - ✅ Claude Code CLI');
      console.error('  - ✅ Outros clientes MCP modernos');
      
      if (process.env.VERCEL || process.env.RAILWAY_STATIC_URL) {
        console.error(`🌐 Deploy URL: ${process.env.RAILWAY_STATIC_URL || 'Vercel URL'}`);
      }
    });

    // Graceful shutdown
    process.on('SIGTERM', () => {
      console.error('🛑 Encerrando MCP-SSE server...');
      process.exit(0);
    });

    process.on('SIGINT', () => {
      console.error('🛑 Encerrando MCP-SSE server...');
      process.exit(0);
    });
  }
}

export default MCPSSEServer;