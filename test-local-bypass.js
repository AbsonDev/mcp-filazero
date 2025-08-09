// Teste local com API mock para validar bypass reCAPTCHA

// Configurar variáveis de ambiente para teste local
process.env.NODE_ENV = 'production';
process.env.USE_PRODUCTION_RECAPTCHA = 'true';
process.env.RECAPTCHA_BYPASS_ENABLED = 'true';

const { spawn } = require('child_process');
const axios = require('axios');

let mockApiProcess = null;
const MOCK_API_URL = 'http://localhost:5000';

// Função para aguardar API estar disponível
async function waitForAPI(maxAttempts = 5) {
  for (let i = 0; i < maxAttempts; i++) {
    try {
      // Usar um endpoint que sempre retorna algo
      const response = await axios.get(`${MOCK_API_URL}/api/terminals/1d1373dcf045408aa3b13914f2ac1076`);
      if (response.status === 200) {
        return true;
      }
    } catch (error) {
      if (error.code === 'ECONNREFUSED') {
        console.log(`⏳ Aguardando API... (tentativa ${i + 1}/${maxAttempts})`);
        await new Promise(resolve => setTimeout(resolve, 2000));
      } else {
        // Se chegou aqui, a API está respondendo
        return true;
      }
    }
  }
  return false;
}

// Substituir temporariamente o módulo de configuração
function createLocalServices() {
  // Não conseguimos substituir módulos em runtime de forma limpa
  // Vamos testar diretamente com axios
  
  return {
    async getTerminal(accessKey) {
      console.log('🔍 Buscando terminal via API mock...');
      try {
        const response = await axios.get(`${MOCK_API_URL}/api/terminals/${accessKey}`);
        return response.data;
      } catch (error) {
        console.error('❌ Erro ao buscar terminal:', error.message);
        return null;
      }
    },

    async createTicket(request) {
      console.log('🎫 Criando ticket via API mock...');
      try {
        // Gerar token de bypass
        const { recaptchaBypassService } = require('./dist/services/recaptcha-bypass.service');
        const bypassToken = await recaptchaBypassService.generateBypassToken('create_ticket', 'mcp-server');
        
        // Adicionar token ao request
        const requestWithBypass = {
          ...request,
          recaptcha: bypassToken
        };

        console.log('📋 Token de bypass:', bypassToken.slice(0, 30) + '...');
        
        const response = await axios.post(`${MOCK_API_URL}/v2/ticketing/tickets/booking-express`, requestWithBypass);
        return response.data;
      } catch (error) {
        console.error('❌ Erro ao criar ticket:', error.message);
        if (error.response) {
          return error.response.data;
        }
        throw error;
      }
    }
  };
}

async function runLocalTest() {
  console.log('🧪 TESTE LOCAL - Bypass reCAPTCHA com API Mock');
  console.log('=' .repeat(55));

  try {
    // 1. Iniciar API mock
    console.log('🚀 Iniciando API mock...');
    mockApiProcess = spawn('node', ['simple-mock-api.js'], {
      stdio: 'pipe'
    });

    mockApiProcess.stdout.on('data', (data) => {
      console.log('📡 [API Mock]:', data.toString().trim());
    });

    mockApiProcess.stderr.on('data', (data) => {
      console.error('🔴 [API Mock Error]:', data.toString().trim());
    });

    // 2. Aguardar API estar disponível
    console.log('⏳ Aguardando API mock inicializar...');
    await new Promise(resolve => setTimeout(resolve, 3000));

    const apiReady = await waitForAPI();
    if (!apiReady) {
      throw new Error('API mock não ficou disponível');
    }

    console.log('✅ API mock está rodando!');

    // 3. Criar serviços locais
    const localServices = createLocalServices();

    // 4. Testar busca de terminal
    console.log('\n🔍 Teste 1: Buscar terminal...');
    const terminal = await localServices.getTerminal('1d1373dcf045408aa3b13914f2ac1076');
    
    if (!terminal) {
      throw new Error('Terminal não encontrado na API mock');
    }

    console.log('✅ Terminal encontrado:', terminal.name);

    // 5. Testar criação de ticket com bypass
    console.log('\n🎫 Teste 2: Criar ticket com bypass...');
    
    const ticketRequest = {
      terminalSchedule: {
        id: 1,
        publicAccessKey: '1d1373dcf045408aa3b13914f2ac1076',
        sessions: terminal.services[0].sessions
      },
      pid: terminal.provider.id,
      locationId: terminal.location.id,
      serviceId: terminal.services[0].id,
      customer: {
        name: 'Teste Local Bypass',
        phone: '11555555555',
        email: 'teste.local@bypass.com'
      },
      browserUuid: 'f3024fb3-8b10-4d4d-8d93-14c40d98b67d',
      priority: 0,
      metadata: []
    };

    const result = await localServices.createTicket(ticketRequest);

    console.log('\n📋 RESULTADO DO TESTE:');
    console.log(JSON.stringify(result, null, 2));

    // 6. Analisar resultado
    if (result.id && result.smartCode) {
      console.log('\n🎉 TESTE PASSOU! Ticket criado com sucesso!');
      console.log('✅ ID:', result.id);
      console.log('✅ Smart Code:', result.smartCode);
      console.log('✅ Bypass reCAPTCHA funcionando perfeitamente!');
    } else if (result.messages && result.messages.some(m => m.code === '2155')) {
      console.log('\n❌ TESTE FALHOU: Erro 2155 ainda presente');
      console.log('💡 Possível problema na implementação do bypass');
    } else if (result.messages && result.messages[0].type === 'SUCCESS') {
      console.log('\n✅ TESTE PASSOU! Ticket criado via bypass!');
      console.log('🎯 Bypass funcionando corretamente!');
    } else {
      console.log('\n⚠️ RESULTADO INESPERADO');
      console.log('📋 Verificar resposta acima');
    }

  } catch (error) {
    console.error('\n❌ Erro no teste:', error.message);
  } finally {
    // Limpar processo da API mock
    if (mockApiProcess) {
      console.log('\n🛑 Encerrando API mock...');
      mockApiProcess.kill();
    }
  }

  console.log('\n' + '='.repeat(55));
  console.log('✅ Teste local concluído!');
}

// Executar teste
runLocalTest()
  .then(() => {
    console.log('\n🏁 Todos os testes finalizados!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n💥 Erro fatal:', error);
    process.exit(1);
  });