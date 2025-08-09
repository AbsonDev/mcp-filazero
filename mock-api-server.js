// Servidor mock da API Filazero para testar bypass reCAPTCHA localmente
const express = require('express');
const app = express();
const PORT = 5000;

app.use(express.json());

// Função que implementa a lógica de bypass (igual ao RecaptchaService.cs)
function isValidMCPBypassToken(token) {
  console.log('🔍 Validating token:', token ? token.slice(0, 30) + '...' : 'null');
  
  // Verificar se é um token de bypass válido do MCP
  if (!token || !token.startsWith('BYPASS_V3_') || !token.endsWith('_MCP')) {
    console.log('❌ Token format invalid');
    return false;
  }

  try {
    // Extrair dados do token
    const encodedData = token.replace('BYPASS_V3_', '').replace('_MCP', '');
    const jsonData = Buffer.from(encodedData, 'base64url').toString();
    const bypassData = JSON.parse(jsonData);
    
    console.log('📋 Token data:', bypassData);
    
    // Verificar chave de validação
    const expectedKey = 'mcp_filazero_2025';
    if (bypassData.key !== expectedKey) {
      console.log('❌ Invalid key');
      return false;
    }

    // Verificar se não expirou (1 hora)
    const currentTime = Date.now();
    if (currentTime - bypassData.timestamp > 3600000) {
      console.log('❌ Token expired');
      return false;
    }

    // Verificar ação permitida
    const action = bypassData.action;
    if (action !== 'create_ticket' && action !== 'mcp_automation') {
      console.log('❌ Invalid action:', action);
      return false;
    }

    console.log('✅ Token is valid!');
    return true;
  } catch (error) {
    console.log('❌ Token parsing error:', error.message);
    return false;
  }
}

// Endpoint para buscar terminal (mock)
app.get('/api/terminals/:accessKey', (req, res) => {
  console.log('🔍 GET terminal:', req.params.accessKey);
  
  if (req.params.accessKey === '1d1373dcf045408aa3b13914f2ac1076') {
    res.json({
      id: 837,
      name: "01-TOTEM-LOCAL",
      location: { id: 11, name: "LOCAL TEST LOCATION" },
      provider: { id: 11, name: "Filazero Local" },
      services: [{
        id: 21,
        name: "TESTE BYPASS",
        sessions: [{
          id: 2056331,
          start: new Date(Date.now() + 60000).toISOString(),
          end: new Date(Date.now() + 3600000).toISOString(),
          hasSlotsLeft: true
        }]
      }]
    });
  } else {
    res.status(404).json({ error: 'Terminal não encontrado' });
  }
});

// Endpoint para criação de tickets (mock com bypass)
app.post('/v2/ticketing/tickets/booking-express', (req, res) => {
  console.log('🎫 POST booking-express');
  console.log('📋 Request body:', JSON.stringify(req.body, null, 2));
  
  const { recaptcha } = req.body;
  
  // Testar bypass reCAPTCHA
  if (isValidMCPBypassToken(recaptcha)) {
    console.log('✅ BYPASS SUCCESSFUL - Creating ticket');
    
    // Simular criação de ticket bem-sucedida
    res.json({
      id: 12345,
      smartCode: 'SC-TEST001',
      status: 'CREATED',
      position: 1,
      estimatedTime: 15,
      customer: req.body.customer,
      service: 'TESTE BYPASS',
      messages: [{
        type: 'SUCCESS',
        code: '1007',
        description: 'Ticket criado com sucesso via BYPASS'
      }]
    });
  } else {
    console.log('❌ BYPASS FAILED - Invalid reCAPTCHA');
    
    // Simular erro de reCAPTCHA
    res.json({
      status: 200,
      messages: [{
        type: 'ERROR',
        code: '2155',
        description: 'Recaptcha inválido.'
      }]
    });
  }
});

// Endpoint para posição na fila (mock)
app.get('/api/tickets/:id/queue-position', (req, res) => {
  console.log('📊 GET queue position for ticket:', req.params.id);
  
  res.json({
    position: 1,
    estimatedTime: 10,
    ticketId: req.params.id
  });
});

// Endpoint para previsão (mock)
app.get('/api/tickets/:id/prevision', (req, res) => {
  console.log('⏰ GET prevision for ticket:', req.params.id);
  
  res.json({
    position: 1,
    estimatedTime: 8,
    ticketId: req.params.id
  });
});

// Iniciar servidor
app.listen(PORT, () => {
  console.log('🚀 Mock API Filazero rodando!');
  console.log(`📡 URL: http://localhost:${PORT}`);
  console.log('🔧 Endpoints disponíveis:');
  console.log('- GET /api/terminals/:accessKey');
  console.log('- POST /v2/ticketing/tickets/booking-express');
  console.log('- GET /api/tickets/:id/queue-position');
  console.log('- GET /api/tickets/:id/prevision');
  console.log('');
  console.log('✅ Bypass reCAPTCHA implementado!');
  console.log('🧪 Pronto para testes...');
});

// Tratar encerramento graceful
process.on('SIGINT', () => {
  console.log('\n🛑 Encerrando mock API...');
  process.exit(0);
});