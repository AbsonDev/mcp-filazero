// Script para testar o servidor MCP simulando chamadas JSON-RPC
// Execução: node test-mcp.js

const { spawn } = require('child_process');
const path = require('path');

class MCPTester {
  constructor() {
    this.requestId = 1;
  }

  // Simular chamada MCP
  async callMCP(method, params = {}) {
    return new Promise((resolve, reject) => {
      const request = {
        jsonrpc: '2.0',
        id: this.requestId++,
        method: method,
        params: params
      };

      console.log(`📤 Enviando: ${method}`);
      console.log(JSON.stringify(request, null, 2));
      console.log('---');

      // Configurar ambiente
      const env = {
        ...process.env,
        NODE_ENV: 'development',
        FILAZERO_API_URL: 'https://api.staging.filazero.net/',
        LOG_LEVEL: 'debug'
      };

      // Executar servidor MCP
      const mcpProcess = spawn('node', ['dist/index.js'], {
        cwd: __dirname,
        env: env,
        stdio: ['pipe', 'pipe', 'pipe']
      });

      let responseData = '';
      let errorData = '';

      mcpProcess.stdout.on('data', (data) => {
        responseData += data.toString();
      });

      mcpProcess.stderr.on('data', (data) => {
        errorData += data.toString();
      });

      mcpProcess.on('close', (code) => {
        if (code === 0) {
          try {
            console.log(`📥 Resposta:`);
            console.log(responseData);
            
            if (errorData) {
              console.log(`📊 Logs do servidor:`);
              console.log(errorData);
            }
            
            resolve(responseData);
          } catch (error) {
            reject(error);
          }
        } else {
          reject(new Error(`Processo encerrado com código ${code}\n${errorData}`));
        }
      });

      mcpProcess.on('error', (error) => {
        reject(error);
      });

      // Enviar request
      mcpProcess.stdin.write(JSON.stringify(request) + '\n');
      mcpProcess.stdin.end();
    });
  }

  // Testes específicos
  async testListTools() {
    console.log('🧪 TESTE 1: Listar Tools Disponíveis');
    console.log('=====================================');
    
    try {
      await this.callMCP('tools/list');
    } catch (error) {
      console.error('❌ Erro:', error.message);
    }
    
    console.log('\n');
  }

  async testGetTerminal() {
    console.log('🧪 TESTE 2: Buscar Terminal');
    console.log('============================');
    
    try {
      await this.callMCP('tools/call', {
        name: 'get_terminal',
        arguments: {
          accessKey: 'ABC123'
        }
      });
    } catch (error) {
      console.error('❌ Erro:', error.message);
    }
    
    console.log('\n');
  }

  async testGetService() {
    console.log('🧪 TESTE 3: Buscar Serviço');
    console.log('===========================');
    
    try {
      await this.callMCP('tools/call', {
        name: 'get_service',
        arguments: {
          id: 123
        }
      });
    } catch (error) {
      console.error('❌ Erro:', error.message);
    }
    
    console.log('\n');
  }

  async testGetCompanyTemplate() {
    console.log('🧪 TESTE 4: Buscar Template da Empresa');
    console.log('======================================');
    
    try {
      await this.callMCP('tools/call', {
        name: 'get_company_template',
        arguments: {
          slug: 'artesano'
        }
      });
    } catch (error) {
      console.error('❌ Erro:', error.message);
    }
    
    console.log('\n');
  }

  async testCreateTicket() {
    console.log('🧪 TESTE 5: Criar Ticket (Simulado)');
    console.log('====================================');
    
    try {
      await this.callMCP('tools/call', {
        name: 'create_ticket',
        arguments: {
          terminalSchedule: {
            id: 123,
            publicAccessKey: 'ABC123'
          },
          pid: 906, // Artesano produção
          locationId: 789,
          serviceId: 456,
          customer: {
            name: 'João Silva Teste',
            phone: '11999887766',
            email: 'joao.teste@email.com'
          },
          recaptcha: 'test-recaptcha-token',
          priority: 0,
          metadata: [],
          browserUuid: 'test-uuid-12345'
        }
      });
    } catch (error) {
      console.error('❌ Erro:', error.message);
    }
    
    console.log('\n');
  }

  // Executar todos os testes
  async runAllTests() {
    console.log('🚀 INICIANDO TESTES DO SERVIDOR MCP FILAZERO');
    console.log('===========================================');
    console.log('📡 API: https://api.staging.filazero.net/');
    console.log('🛠️ Ambiente: development (local)');
    console.log('📊 Log Level: debug');
    console.log('\n');

    // Verificar se build existe
    const fs = require('fs');
    if (!fs.existsSync('dist/index.js')) {
      console.error('❌ Build não encontrado! Execute "npm run build" primeiro.');
      return;
    }

    try {
      await this.testListTools();
      await this.testGetTerminal();
      await this.testGetService();
      await this.testGetCompanyTemplate();
      // await this.testCreateTicket(); // Comentado para não criar tickets reais

      console.log('✅ TODOS OS TESTES CONCLUÍDOS!');
      console.log('\n');
      console.log('💡 Dicas:');
      console.log('- Para testes reais, use o Claude Desktop');
      console.log('- Logs detalhados aparecem durante os testes');
      console.log('- Descomente testCreateTicket() para testar criação de tickets');
      
    } catch (error) {
      console.error('❌ Erro geral nos testes:', error);
    }
  }
}

// Executar testes se o script for chamado diretamente
if (require.main === module) {
  const tester = new MCPTester();
  tester.runAllTests();
}

module.exports = MCPTester;
