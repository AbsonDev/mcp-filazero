#!/usr/bin/env node

// Cliente de teste para o MCP Server
const { spawn } = require('child_process');
const readline = require('readline');

class MCPTestClient {
  constructor() {
    this.server = null;
    this.requestId = 0;
  }

  async start() {
    console.log('🚀 Iniciando cliente de teste MCP...');
    
    // Inicia o servidor MCP
    this.server = spawn('node', ['dist/index.js'], {
      stdio: ['pipe', 'pipe', 'pipe']
    });

    // Setup para receber dados do servidor
    this.server.stdout.on('data', (data) => {
      try {
        const response = JSON.parse(data.toString());
        console.log('📥 Resposta do servidor:', JSON.stringify(response, null, 2));
      } catch (e) {
        console.log('📥 Dados brutos:', data.toString());
      }
    });

    this.server.stderr.on('data', (data) => {
      console.log('🔍 Log do servidor:', data.toString());
    });

    // Aguarda um pouco para o servidor inicializar
    await new Promise(resolve => setTimeout(resolve, 2000));

    console.log('✅ Cliente MCP pronto!');
  }

  sendRequest(method, params = {}) {
    const request = {
      jsonrpc: '2.0',
      id: ++this.requestId,
      method,
      params
    };

    console.log('📤 Enviando request:', JSON.stringify(request, null, 2));
    this.server.stdin.write(JSON.stringify(request) + '\n');
  }

  // Teste para buscar terminal
  async testGetTerminal() {
    console.log('\n🔍 Testando busca de terminal...');
    this.sendRequest('tools/call', {
      name: 'get_terminal',
      arguments: {
        accessKey: '1d1373dcf045408aa3b13914f2ac1076'
      }
    });
  }

  // Teste para listar ferramentas
  async testListTools() {
    console.log('\n📋 Testando listagem de ferramentas...');
    this.sendRequest('tools/list', {});
  }

  // Teste para criar ticket (será executado após obter dados do terminal)
  async testCreateTicket(terminalData) {
    console.log('\n🎫 Testando criação de ticket...');
    
    // Dados ficcionais para teste
    const ticketRequest = {
      terminalSchedule: {
        id: terminalData.schedules?.[0]?.id || 1,
        publicAccessKey: '1d1373dcf045408aa3b13914f2ac1076',
        sessions: terminalData.schedules?.[0]?.sessions || [
          {
            id: 1,
            start: new Date(Date.now() + 60000).toISOString(),
            end: new Date(Date.now() + 3600000).toISOString(),
            hasSlotsLeft: true
          }
        ]
      },
      pid: 460, // ID do provider de desenvolvimento
      locationId: terminalData.locationId || 1,
      serviceId: terminalData.services?.[0]?.id || 1,
      customer: {
        name: 'João Silva Teste',
        phone: '11999999999',
        email: 'joao.teste@email.com'
      },
      browserUuid: 'f3024fb3-8b10-4d4d-8d93-14c40d98b67d',
      priority: 0,
      metadata: []
    };

    this.sendRequest('tools/call', {
      name: 'create_ticket',
      arguments: ticketRequest
    });
  }

  async runTests() {
    await this.start();
    
    console.log('\n🧪 Executando testes...');
    
    // Teste 1: Listar ferramentas
    await this.testListTools();
    
    // Aguardar resposta
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    // Teste 2: Buscar terminal
    await this.testGetTerminal();
    
    // Aguardar resposta do terminal para usar nos próximos testes
    await new Promise(resolve => setTimeout(resolve, 5000));
    
    // Teste 3: Criar ticket (com dados básicos)
    await this.testCreateTicket({});
    
    // Manter cliente ativo por mais tempo para ver resultados
    await new Promise(resolve => setTimeout(resolve, 10000));
    
    console.log('\n✅ Testes concluídos!');
    this.server.kill();
  }
}

// Executar testes se chamado diretamente
if (require.main === module) {
  const client = new MCPTestClient();
  client.runTests().catch(console.error);
}

module.exports = MCPTestClient;