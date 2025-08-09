// API mock simples usando apenas módulos built-in do Node.js
const http = require('http');
const url = require('url');

const PORT = 5000;

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

// Função para ler body das requests
function readRequestBody(req) {
  return new Promise((resolve, reject) => {
    let body = '';
    req.on('data', chunk => {
      body += chunk.toString();
    });
    req.on('end', () => {
      try {
        resolve(body ? JSON.parse(body) : {});
      } catch (error) {
        reject(error);
      }
    });
    req.on('error', reject);
  });
}

// Criar servidor HTTP
const server = http.createServer(async (req, res) => {
  const parsedUrl = url.parse(req.url, true);
  const path = parsedUrl.pathname;
  const method = req.method;

  // Headers CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.setHeader('Content-Type', 'application/json');

  if (method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }

  try {
    // GET /api/terminals/:accessKey
    if (method === 'GET' && path.match(/^\/api\/terminals\/(.+)$/)) {
      const accessKey = path.match(/^\/api\/terminals\/(.+)$/)[1];
      console.log('🔍 GET terminal:', accessKey);
      
      if (accessKey === '1d1373dcf045408aa3b13914f2ac1076') {
        const response = {
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
        };
        
        res.writeHead(200);
        res.end(JSON.stringify(response));
      } else {
        res.writeHead(404);
        res.end(JSON.stringify({ error: 'Terminal não encontrado' }));
      }
    }
    
    // POST /v2/ticketing/tickets/booking-express
    else if (method === 'POST' && path === '/v2/ticketing/tickets/booking-express') {
      console.log('🎫 POST booking-express');
      
      const body = await readRequestBody(req);
      console.log('📋 Request body:', JSON.stringify(body, null, 2));
      
      const { recaptcha } = body;
      
      // Testar bypass reCAPTCHA
      if (isValidMCPBypassToken(recaptcha)) {
        console.log('✅ BYPASS SUCCESSFUL - Creating ticket');
        
        // Simular criação de ticket bem-sucedida
        const response = {
          id: 12345,
          smartCode: 'SC-TEST001',
          status: 'CREATED',
          position: 1,
          estimatedTime: 15,
          customer: body.customer,
          service: 'TESTE BYPASS',
          messages: [{
            type: 'SUCCESS',
            code: '1007',
            description: 'Ticket criado com sucesso via BYPASS'
          }]
        };
        
        res.writeHead(200);
        res.end(JSON.stringify(response));
      } else {
        console.log('❌ BYPASS FAILED - Invalid reCAPTCHA');
        
        // Simular erro de reCAPTCHA
        const response = {
          status: 200,
          messages: [{
            type: 'ERROR',
            code: '2155',
            description: 'Recaptcha inválido.'
          }]
        };
        
        res.writeHead(200);
        res.end(JSON.stringify(response));
      }
    }
    
    // GET /api/tickets/:id/queue-position
    else if (method === 'GET' && path.match(/^\/api\/tickets\/(.+)\/queue-position$/)) {
      const ticketId = path.match(/^\/api\/tickets\/(.+)\/queue-position$/)[1];
      console.log('📊 GET queue position for ticket:', ticketId);
      
      const response = {
        position: 1,
        estimatedTime: 10,
        ticketId: ticketId
      };
      
      res.writeHead(200);
      res.end(JSON.stringify(response));
    }
    
    // 404 para outras rotas
    else {
      console.log('❌ 404:', method, path);
      res.writeHead(404);
      res.end(JSON.stringify({ error: 'Endpoint não encontrado' }));
    }

  } catch (error) {
    console.error('💥 Server error:', error);
    res.writeHead(500);
    res.end(JSON.stringify({ error: 'Erro interno do servidor' }));
  }
});

// Iniciar servidor
server.listen(PORT, () => {
  console.log('🚀 Simple Mock API Filazero rodando!');
  console.log(`📡 URL: http://localhost:${PORT}`);
  console.log('🔧 Endpoints disponíveis:');
  console.log('- GET /api/terminals/:accessKey');
  console.log('- POST /v2/ticketing/tickets/booking-express');
  console.log('- GET /api/tickets/:id/queue-position');
  console.log('');
  console.log('✅ Bypass reCAPTCHA implementado!');
  console.log('🧪 Pronto para testes...');
});

// Tratar encerramento graceful
process.on('SIGINT', () => {
  console.log('\n🛑 Encerrando mock API...');
  server.close(() => {
    process.exit(0);
  });
});