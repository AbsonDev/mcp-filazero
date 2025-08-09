// Teste específico da nova implementação de reCAPTCHA para produção
const { terminalService } = require('./dist/services/terminal.service');
const { ticketService } = require('./dist/services/ticket.service');

async function testProductionRecaptcha() {
  try {
    console.log('🚀 Testando nova implementação reCAPTCHA para produção...\n');

    // Configurar ambiente para usar o serviço de produção
    process.env.USE_PRODUCTION_RECAPTCHA = 'true';
    process.env.NODE_ENV = 'production';

    console.log('🔧 Configurações ativadas:');
    console.log('- USE_PRODUCTION_RECAPTCHA:', process.env.USE_PRODUCTION_RECAPTCHA);
    console.log('- NODE_ENV:', process.env.NODE_ENV);

    // Teste 1: Buscar terminal (confirmação que ainda funciona)
    console.log('\n🔍 Teste 1: Buscando terminal...');
    const terminal = await terminalService.getTerminal('1d1373dcf045408aa3b13914f2ac1076');
    
    if (!terminal) {
      console.log('❌ Terminal não encontrado - abortando testes');
      return;
    }
    
    console.log('✅ Terminal encontrado:', terminal.name, '(Provider:', terminal.provider.name, ')');

    // Aguardar um pouco
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Teste 2: Criar ticket com novo serviço reCAPTCHA
    console.log('\n🎫 Teste 2: Criando ticket com reCAPTCHA PRODUÇÃO...');
    
    const ticketRequest = {
      terminalSchedule: {
        id: terminal.schedules?.[0]?.id || 1,
        publicAccessKey: '1d1373dcf045408aa3b13914f2ac1076',
        sessions: terminal.services[0].sessions || [
          {
            id: 2056331,
            start: new Date(Date.now() + 60000).toISOString(),
            end: new Date(Date.now() + 3600000).toISOString(),
            hasSlotsLeft: true
          }
        ]
      },
      pid: terminal.provider.id, // Usar provider ID correto do terminal
      locationId: terminal.location.id, // Usar location ID correto do terminal
      serviceId: terminal.services[0].id, // Usar primeiro serviço disponível
      customer: {
        name: 'Maria Silva Produção',
        phone: '11888888888',
        email: 'maria.producao@email.com'
      },
      browserUuid: 'f3024fb3-8b10-4d4d-8d93-14c40d98b67d',
      priority: 0,
      metadata: []
    };

    console.log('📋 Request com dados do terminal real:');
    console.log('- Provider ID:', ticketRequest.pid);
    console.log('- Location ID:', ticketRequest.locationId);
    console.log('- Service ID:', ticketRequest.serviceId);
    console.log('- Service Name:', terminal.services[0].name);

    try {
      const ticket = await ticketService.createTicket(ticketRequest);
      console.log('✅ Ticket criado com SUCESSO!');
      console.log('📋 Detalhes do ticket:', JSON.stringify(ticket, null, 2));

      if (ticket && ticket.id) {
        // Teste 3: Operações adicionais
        console.log('\n📊 Teste 3: Consultando posição na fila...');
        
        try {
          const position = await ticketService.getQueuePosition(ticketRequest.pid, ticket.id);
          console.log('✅ Posição consultada:', JSON.stringify(position, null, 2));
        } catch (posError) {
          console.log('⚠️ Erro ao consultar posição (normal se ticket ainda processando):', posError.message);
        }

        console.log('\n⏰ Teste 4: Consultando previsão...');
        try {
          const prevision = await ticketService.getTicketPrevision(ticket.id);
          console.log('✅ Previsão consultada:', JSON.stringify(prevision, null, 2));
        } catch (prevError) {
          console.log('⚠️ Erro ao consultar previsão (normal se ticket ainda processando):', prevError.message);
        }
      }
    } catch (ticketError) {
      console.log('❌ Erro ao criar ticket:', ticketError.message);
      if (ticketError.response) {
        console.log('📋 Detalhes do erro da API:', JSON.stringify(ticketError.response.data, null, 2));
      }
      
      // Analisar se ainda é erro de reCAPTCHA
      const responseData = ticketError.response?.data;
      if (responseData && responseData.messages) {
        const recaptchaError = responseData.messages.find(msg => msg.code === '2155');
        if (recaptchaError) {
          console.log('⚠️ AINDA É ERRO DE RECAPTCHA - O serviço avançado precisa de ajustes');
        } else {
          console.log('✅ NÃO É MAIS ERRO DE RECAPTCHA - Pode ser outro problema da API');
        }
      }
    }

  } catch (error) {
    console.error('❌ Erro geral no teste:', error.message);
    if (error.response) {
      console.error('📋 Detalhes:', JSON.stringify(error.response.data, null, 2));
    }
  }
}

// Teste adicional: verificar token gerado
async function testTokenGeneration() {
  console.log('\n🔧 Teste ISOLADO de geração de token...');
  
  try {
    const { recaptchaHeadlessService } = require('./dist/services/recaptcha-headless.service');
    
    console.log('🎯 Gerando token com serviço avançado...');
    const token = await recaptchaHeadlessService.getProductionToken('create_ticket');
    
    console.log(`✅ Token gerado com sucesso!`);
    console.log(`📊 Estatísticas do token:`);
    console.log(`- Tamanho: ${token.length} caracteres`);
    console.log(`- Prefixo: ${token.slice(0, 10)}...`);
    console.log(`- Sufixo: ...${token.slice(-10)}`);
    console.log(`- Formato válido: ${token.startsWith('03AFcWeA') ? '✅' : '❌'}`);
    
    // Tentar validar com Google (se tiver chaves configuradas)
    try {
      console.log('\n🔍 Tentando validar token com Google...');
      const validation = await recaptchaHeadlessService.validateTokenWithGoogle(token);
      console.log('📋 Resposta do Google:', JSON.stringify(validation, null, 2));
    } catch (validationError) {
      console.log('⚠️ Não foi possível validar com Google (esperado):', validationError.message);
    }
    
  } catch (error) {
    console.error('❌ Erro na geração de token:', error.message);
  }
}

// Executar testes
console.log('🧪 Iniciando bateria de testes reCAPTCHA PRODUÇÃO');
console.log('=' .repeat(60));

testTokenGeneration()
  .then(() => testProductionRecaptcha())
  .then(() => {
    console.log('\n' + '='.repeat(60));
    console.log('✅ Testes concluídos!');
    console.log('');
    console.log('📋 RESUMO:');
    console.log('- Se não houve erro 2155, o reCAPTCHA foi resolvido! 🎉');
    console.log('- Se ainda há erro 2155, o token precisa de mais ajustes');
    console.log('- Outros erros (2208, etc) são problemas diferentes da API');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Erro fatal nos testes:', error);
    process.exit(1);
  });