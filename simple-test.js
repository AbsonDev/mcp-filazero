// Teste simples direto dos serviços sem MCP protocol
const { terminalService } = require('./dist/services/terminal.service');
const { ticketService } = require('./dist/services/ticket.service');

async function runTests() {
  try {
    console.log('🧪 Iniciando testes diretos dos serviços...\n');

    // Teste 1: Buscar terminal
    console.log('🔍 Teste 1: Buscando terminal...');
    const terminal = await terminalService.getTerminal('1d1373dcf045408aa3b13914f2ac1076');
    console.log('✅ Terminal encontrado:', JSON.stringify(terminal, null, 2));

    if (!terminal) {
      console.log('❌ Terminal não encontrado - não é possível continuar os testes');
      return;
    }

    // Aguardar um pouco entre chamadas
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Teste 2: Tentar criar um ticket
    console.log('\n🎫 Teste 2: Criando ticket...');
    
    // Usar dados reais do terminal ou valores padrão se não disponíveis
    const ticketRequest = {
      terminalSchedule: {
        id: terminal.schedules?.[0]?.id || 1,
        publicAccessKey: '1d1373dcf045408aa3b13914f2ac1076',
        sessions: terminal.schedules?.[0]?.sessions || [
          {
            id: 1,
            start: new Date(Date.now() + 60000).toISOString(),
            end: new Date(Date.now() + 3600000).toISOString(),
            hasSlotsLeft: true
          }
        ]
      },
      pid: 460, // Provider de desenvolvimento
      locationId: terminal.locationId || 1,
      serviceId: terminal.services?.[0]?.id || 1,
      customer: {
        name: 'João Silva Teste',
        phone: '11999999999',
        email: 'joao.teste@email.com'
      },
      browserUuid: 'f3024fb3-8b10-4d4d-8d93-14c40d98b67d',
      priority: 0,
      metadata: []
    };

    console.log('📋 Request para criação:', JSON.stringify(ticketRequest, null, 2));

    try {
      const ticket = await ticketService.createTicket(ticketRequest);
      console.log('✅ Ticket criado com sucesso:', JSON.stringify(ticket, null, 2));

      if (ticket && ticket.id) {
        // Teste 3: Buscar posição na fila
        console.log('\n📊 Teste 3: Consultando posição na fila...');
        const position = await ticketService.getQueuePosition(ticketRequest.pid, ticket.id);
        console.log('✅ Posição na fila:', JSON.stringify(position, null, 2));

        // Teste 4: Consultar previsão
        console.log('\n⏰ Teste 4: Consultando previsão...');
        const prevision = await ticketService.getTicketPrevision(ticket.id);
        console.log('✅ Previsão:', JSON.stringify(prevision, null, 2));
      }
    } catch (ticketError) {
      console.log('❌ Erro ao criar ticket:', ticketError.message);
      if (ticketError.response) {
        console.log('📋 Detalhes do erro:', JSON.stringify(ticketError.response.data, null, 2));
      }
    }

  } catch (error) {
    console.error('❌ Erro geral nos testes:', error.message);
    if (error.response) {
      console.error('📋 Detalhes da resposta:', JSON.stringify(error.response.data, null, 2));
    }
  }
}

// Executar testes
console.log('🚀 Iniciando testes do Filazero MCP Server...');
runTests()
  .then(() => {
    console.log('\n✅ Testes concluídos!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Erro fatal:', error);
    process.exit(1);
  });