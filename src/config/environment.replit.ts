/**
 * Configurações específicas para ambiente Replit
 */

interface ReplitConfig {
  environment: string;
  apiUrl: string;
  port: number;
  healthPort: number;
  logLevel: string;
  isReplit: boolean;
  replitUrl?: string;
}

const config: ReplitConfig = {
  environment: process.env.NODE_ENV || 'production',
  apiUrl: process.env.FILAZERO_API_URL || 'https://api.filazero.net/',
  port: parseInt(process.env.PORT || '3000'),
  healthPort: parseInt(process.env.HEALTH_PORT || '3001'),
  logLevel: process.env.LOG_LEVEL || 'info',
  isReplit: process.env.REPLIT_MODE === 'true' || process.env.REPLIT_CLUSTER !== undefined,
  replitUrl: process.env.REPL_SLUG ? `https://${process.env.REPL_SLUG}.${process.env.REPL_OWNER}.repl.co` : undefined
};

// Log das configurações para debug
if (config.isReplit) {
  console.error('🔧 Configurações do Replit:');
  console.error(`   - Ambiente: ${config.environment}`);
  console.error(`   - API URL: ${config.apiUrl}`);
  console.error(`   - Porta: ${config.port}`);
  console.error(`   - Health Port: ${config.healthPort}`);
  console.error(`   - Replit URL: ${config.replitUrl || 'Não disponível'}`);
  console.error(`   - Log Level: ${config.logLevel}`);
}

export default config;
