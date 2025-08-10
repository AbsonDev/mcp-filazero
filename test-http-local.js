// Teste rápido do servidor HTTP
import express from 'express';

const app = express();
app.use(express.json());

app.get('/', (req, res) => {
  res.json({
    name: 'Filazero MCP Server HTTP',
    status: 'working',
    timestamp: new Date().toISOString()
  });
});

app.get('/health', (req, res) => {
  res.json({ status: 'healthy' });
});

app.get('/tools', (req, res) => {
  res.json({ 
    tools: [
      { name: 'get_terminal', description: 'Busca terminal' },
      { name: 'create_ticket', description: 'Cria ticket' }
    ]
  });
});

app.post('/mcp', (req, res) => {
  const { tool, arguments: args } = req.body;
  res.json({
    success: true,
    tool: tool,
    arguments: args,
    result: 'Mock response - servidor funcionando!'
  });
});

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`🌐 Teste HTTP funcionando em http://localhost:${PORT}`);
  console.log('📋 Endpoints: /, /health, /tools, /mcp');
});
