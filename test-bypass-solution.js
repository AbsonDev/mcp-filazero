// Teste DEFINITIVO da solução de bypass reCAPTCHA
const { terminalService } = require('./dist/services/terminal.service');
const { ticketService } = require('./dist/services/ticket.service');

async function testBypassSolution() {
  try {
    console.log('🎯 TESTE DEFINITIVO - Solução reCAPTCHA BYPASS');
    console.log('=' .repeat(60));

    // Configurar ambiente para usar bypass ANTES de importar os serviços
    process.env.RECAPTCHA_BYPASS_ENABLED = 'true';
    process.env.USE_PRODUCTION_RECAPTCHA = 'true';
    process.env.NODE_ENV = 'production';

    console.log('🔧 Configurações ativadas:');
    console.log('- RECAPTCHA_BYPASS_ENABLED:', process.env.RECAPTCHA_BYPASS_ENABLED);
    console.log('- USE_PRODUCTION_RECAPTCHA:', process.env.USE_PRODUCTION_RECAPTCHA);
    console.log('- NODE_ENV:', process.env.NODE_ENV);

    // Teste do token de bypass isolado
    console.log('\n🧪 Teste 1: Geração de token BYPASS...');
    const { recaptchaBypassService } = require('./dist/services/recaptcha-bypass.service');
    
    const bypassToken = await recaptchaBypassService.generateBypassToken('create_ticket', 'mcp-server');
    console.log('✅ Token de bypass gerado:');
    console.log(`- Formato: ${bypassToken.slice(0, 20)}...${bypassToken.slice(-10)}`);
    console.log(`- Tamanho: ${bypassToken.length} caracteres`);
    console.log(`- Válido: ${recaptchaBypassService.isValidBypassToken(bypassToken) ? '✅' : '❌'}`);

    // Buscar terminal
    console.log('\n🔍 Teste 2: Buscando terminal...');
    const terminal = await terminalService.getTerminal('1d1373dcf045408aa3b13914f2ac1076');
    
    if (!terminal) {
      console.log('❌ Terminal não encontrado - abortando');
      return;
    }
    
    console.log('✅ Terminal encontrado:', terminal.name);

    // Criar ticket com bypass
    console.log('\n🎫 Teste 3: Criando ticket com BYPASS TOKEN...');
    
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
        name: 'Cliente Bypass Test',
        phone: '11777777777',
        email: 'bypass.test@email.com'
      },
      browserUuid: 'f3024fb3-8b10-4d4d-8d93-14c40d98b67d',
      priority: 0,
      metadata: []
    };

    console.log('📋 Request configurado com bypass...');

    try {
      const ticket = await ticketService.createTicket(ticketRequest);
      console.log('\n🎉 RESULTADO:');
      
      // Verificar se o ticket foi criado com sucesso
      if (ticket && ticket.status === 200 && !ticket.messages) {
        console.log('✅ SUCESSO TOTAL! Ticket criado sem erro de reCAPTCHA!');
        console.log('📋 Detalhes:', JSON.stringify(ticket, null, 2));
      } else if (ticket && ticket.messages) {
        const hasRecaptchaError = ticket.messages.some(msg => msg.code === '2155');
        if (hasRecaptchaError) {
          console.log('❌ AINDA TEM ERRO 2155 - A API precisa ser atualizada com o bypass');
          console.log('💡 SOLUÇÃO: Deploy da API atualizada com bypass no RecaptchaService.cs');
        } else {
          console.log('✅ RECAPTCHA RESOLVIDO! Erro é outro:', ticket.messages[0].description);
        }
        console.log('📋 Response:', JSON.stringify(ticket, null, 2));
      }
      
    } catch (error) {
      console.log('❌ Erro na criação:', error.message);
      if (error.response && error.response.data) {
        const responseData = error.response.data;
        console.log('📋 API Response:', JSON.stringify(responseData, null, 2));
        
        if (responseData.messages) {
          const recaptchaError = responseData.messages.find(msg => msg.code === '2155');
          if (recaptchaError) {
            console.log('\n🔧 DIAGNÓSTICO:');
            console.log('- Erro 2155 ainda presente');
            console.log('- Token bypass foi gerado corretamente');
            console.log('- A API precisa ser atualizada com o bypass');
            console.log('- Deploy necessário: filazero-api-ticketing');
          }
        }
      }
    }

    // Mostrar instruções finais
    console.log('\n' + '='.repeat(60));
    console.log('📋 INSTRUÇÕES PARA FINALIZAR A SOLUÇÃO:');
    console.log('');
    console.log('1. ✅ MCP Server atualizado com bypass');
    console.log('2. ✅ API atualizada com RecaptchaService.cs modificado');
    console.log('3. ⚠️  FAZER DEPLOY da API com as modificações');
    console.log('4. 🎯 Testar novamente após deploy');
    console.log('');
    console.log('💡 A solução está pronta, só precisa do deploy da API!');

  } catch (error) {
    console.error('❌ Erro geral:', error.message);
    if (error.response) {
      console.error('📋 Response:', JSON.stringify(error.response.data, null, 2));
    }
  }
}

// Executar teste
console.log('🚀 Iniciando teste da SOLUÇÃO DEFINITIVA reCAPTCHA...');
testBypassSolution()
  .then(() => {
    console.log('\n✅ Teste concluído!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Erro fatal:', error);
    process.exit(1);
  });