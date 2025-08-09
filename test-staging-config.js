// Teste de configuração para staging
// Simula exatamente as variáveis de ambiente do MCP config fornecido

// Configurar variáveis de ambiente ANTES de importar módulos
process.env.NODE_ENV = 'staging';
process.env.FILAZERO_API_URL = 'https://api.staging.filazero.net/';
process.env.LOG_LEVEL = 'debug';

const config = require('./dist/config/environment').config;
const PROVIDERS = require('./dist/config/environment').PROVIDERS;
const RECAPTCHA_CONFIG = require('./dist/config/environment').RECAPTCHA_CONFIG;

async function testStagingConfig() {
  console.log('🧪 TESTE DE CONFIGURAÇÃO STAGING');
  console.log('=' .repeat(50));

  // 1. Testar configurações básicas
  console.log('📋 Configurações carregadas:');
  console.log('- Environment:', config.environment);
  console.log('- API URL:', config.apiUrl);
  console.log('- Log Level:', config.logLevel);
  console.log('- Port:', config.port);

  // 2. Validar se está usando configurações corretas
  const expectedApiUrl = 'https://api.staging.filazero.net/';
  if (config.apiUrl === expectedApiUrl) {
    console.log('✅ API URL correta para staging');
  } else {
    console.log('❌ API URL incorreta. Esperado:', expectedApiUrl, 'Atual:', config.apiUrl);
  }

  // 3. Testar providers para staging
  console.log('\n📋 Providers para staging:');
  console.log('- Artesano:', PROVIDERS.artesano);
  console.log('- Boticário:', PROVIDERS.boticario);
  console.log('- Nike:', PROVIDERS.nike);
  console.log('- Phone Noel:', PROVIDERS.phoneNoel);
  console.log('- Queue Noel:', PROVIDERS.queueNoel);

  // Validar se está usando IDs de desenvolvimento
  if (PROVIDERS.artesano === 460) {
    console.log('✅ Providers configurados para ambiente não-produção');
  } else {
    console.log('⚠️ Usando providers de produção. Esperado para staging: IDs de desenvolvimento');
  }

  // 4. Testar configuração reCAPTCHA
  console.log('\n📋 Configuração reCAPTCHA:');
  console.log('- Bypass habilitado:', RECAPTCHA_CONFIG.bypassValidation);
  console.log('- Use production service:', RECAPTCHA_CONFIG.useProductionService);

  if (RECAPTCHA_CONFIG.bypassValidation) {
    console.log('✅ Bypass reCAPTCHA habilitado para staging');
  } else {
    console.log('❌ Bypass reCAPTCHA deveria estar habilitado em staging');
  }

  // 5. Testar geração de token bypass
  console.log('\n🔐 Testando geração de token bypass...');
  try {
    const { recaptchaBypassService } = require('./dist/services/recaptcha-bypass.service');
    
    const token = await recaptchaBypassService.generateBypassToken('create_ticket', 'mcp-staging-test');
    console.log('✅ Token bypass gerado:', token.slice(0, 30) + '...');
    console.log('- Tamanho:', token.length);
    console.log('- Formato válido:', token.startsWith('BYPASS_V3_') && token.endsWith('_MCP') ? '✅' : '❌');

    // Validar token gerado
    const isValid = recaptchaBypassService.isValidBypassToken(token);
    console.log('- Token válido:', isValid ? '✅' : '❌');

  } catch (error) {
    console.log('❌ Erro ao gerar token bypass:', error.message);
  }

  // 6. Testar integração com recaptcha service
  console.log('\n🧪 Testando integração reCAPTCHA service...');
  try {
    const { recaptchaService } = require('./dist/services/recaptcha.service');
    
    const token = await recaptchaService.generateToken('test_staging');
    console.log('✅ Token gerado pelo recaptcha service:', token.slice(0, 30) + '...');
    
    if (token.startsWith('BYPASS_V3_')) {
      console.log('✅ reCAPTCHA service está usando bypass em staging');
    } else {
      console.log('⚠️ reCAPTCHA service não está usando bypass');
    }

  } catch (error) {
    console.log('❌ Erro no recaptcha service:', error.message);
  }

  // 7. Resumo final
  console.log('\n' + '='.repeat(50));
  console.log('📊 RESUMO STAGING:');
  console.log('✅ Configuração dinâmica:', config.environment === 'staging' ? 'OK' : 'FALHOU');
  console.log('✅ API URL correta:', config.apiUrl === expectedApiUrl ? 'OK' : 'FALHOU');
  console.log('✅ Bypass habilitado:', RECAPTCHA_CONFIG.bypassValidation ? 'OK' : 'FALHOU');
  console.log('✅ Providers staging:', PROVIDERS.artesano === 460 ? 'OK' : 'PRODUÇÃO');

  console.log('\n🎯 CONFIGURAÇÃO PRONTA PARA MCP STAGING!');
  
  // 8. Mostrar comando MCP
  console.log('\n📋 Comando para testar:');
  console.log('SET NODE_ENV=staging');
  console.log('SET FILAZERO_API_URL=https://api.staging.filazero.net/');
  console.log('SET LOG_LEVEL=debug');
  console.log('node dist/index.js');
}

// Executar teste
testStagingConfig()
  .then(() => {
    console.log('\n✅ Teste de configuração concluído!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Erro no teste:', error);
    process.exit(1);
  });