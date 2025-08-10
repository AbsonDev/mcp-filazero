/**
 * Configurações específicas para ambiente Railway
 */

interface RailwayConfig {
  environment: string;
  apiUrl: string;
  port: number;
  healthPort: number;
  logLevel: string;
  isRailway: boolean;
  railwayUrl?: string;
  railwayEnvironment?: string;
}

const config: RailwayConfig = {
  environment: process.env.NODE_ENV || 'production',
  apiUrl: process.env.FILAZERO_API_URL || 'https://api.staging.filazero.net/',
  port: parseInt(process.env.PORT || '3000'),
  healthPort: parseInt(process.env.HEALTH_PORT || '3001'),
  logLevel: process.env.LOG_LEVEL || 'info',
  isRailway: process.env.RAILWAY_MODE === 'true' || process.env.RAILWAY_ENVIRONMENT !== undefined,
  railwayUrl: process.env.RAILWAY_STATIC_URL || process.env.RAILWAY_PUBLIC_DOMAIN,
  railwayEnvironment: process.env.RAILWAY_ENVIRONMENT
};

// Log das configurações para debug
if (config.isRailway) {
  console.error('🚂 Configurações do Railway:');
  console.error(`   - Ambiente: ${config.environment}`);
  console.error(`   - API URL: ${config.apiUrl}`);
  console.error(`   - Porta: ${config.port}`);
  console.error(`   - Health Port: ${config.healthPort}`);
  console.error(`   - Railway URL: ${config.railwayUrl || 'Não disponível'}`);
  console.error(`   - Railway Environment: ${config.railwayEnvironment || 'Não definido'}`);
  console.error(`   - Log Level: ${config.logLevel}`);
}

export default config;
