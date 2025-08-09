#!/usr/bin/env node

/**
 * Script de inicialização específico para Railway
 * Otimizado para deploy em produção
 */

const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');
const http = require('http');

console.log('🚂 Iniciando Filazero MCP Server no Railway...');

// Configurar variáveis de ambiente específicas do Railway
process.env.NODE_ENV = process.env.NODE_ENV || 'production';
process.env.FILAZERO_API_URL = process.env.FILAZERO_API_URL || 'https://api.staging.filazero.net/';
process.env.PORT = process.env.PORT || '3000';
process.env.HEALTH_PORT = process.env.HEALTH_PORT || '3001';
process.env.ENABLE_HEALTH_CHECK = 'true';
process.env.RAILWAY_MODE = 'true';

// Log das configurações do Railway
console.log('🔧 Configurações do Railway:');
console.log(`   - Ambiente: ${process.env.NODE_ENV}`);
console.log(`   - API URL: ${process.env.FILAZERO_API_URL}`);
console.log(`   - Porta: ${process.env.PORT}`);
console.log(`   - Health Port: ${process.env.HEALTH_PORT}`);
console.log(`   - Railway URL: ${process.env.RAILWAY_STATIC_URL || 'Será gerada'}`);

// Verificar se o build existe
const distPath = path.join(__dirname, 'dist');
const indexPath = path.join(distPath, 'http-index.js');

if (!fs.existsSync(indexPath)) {
  console.log('📦 Build não encontrado, compilando TypeScript...');
  
  // Executar build
  const buildProcess = spawn('npm', ['run', 'build'], {
    stdio: 'inherit',
    shell: true
  });
  
  buildProcess.on('close', (code) => {
    if (code === 0) {
      console.log('✅ Build concluído com sucesso!');
      startHttpServer();
    } else {
      console.error('❌ Erro no build:', code);
      process.exit(1);
    }
  });
} else {
  console.log('✅ Build encontrado, iniciando servidor HTTP...');
  startHttpServer();
}

function startHttpServer() {
  console.log('🌐 Iniciando servidor HTTP MCP para Railway...');
  
  // Executar o servidor HTTP
  const serverProcess = spawn('node', ['dist/http-index.js'], {
    stdio: 'inherit',
    shell: true,
    env: process.env
  });
  
  serverProcess.on('close', (code) => {
    console.log(`🛑 Servidor HTTP encerrado com código: ${code}`);
    // Em produção, tentar restart automático apenas se não foi encerramento graceful
    if (process.env.NODE_ENV === 'production' && code !== 0) {
      console.log('🔄 Tentando restart automático em 5 segundos...');
      setTimeout(() => startHttpServer(), 5000);
    }
  });
  
  serverProcess.on('error', (error) => {
    console.error('❌ Erro ao iniciar servidor HTTP:', error);
    process.exit(1);
  });
  
  // Health check adicional para Railway
  setTimeout(() => {
    setupRailwayHealthCheck();
  }, 5000);
  
  // Graceful shutdown melhorado para Railway
  const gracefulShutdown = (signal) => {
    console.log(`🛑 Recebido ${signal}, encerrando servidor HTTP gracefully...`);
    
    if (serverProcess) {
      serverProcess.kill('SIGTERM');
      
      // Force kill após 10 segundos se não encerrar gracefully
      setTimeout(() => {
        console.log('⚠️ Forçando encerramento do servidor...');
        serverProcess.kill('SIGKILL');
        process.exit(0);
      }, 10000);
    } else {
      process.exit(0);
    }
  };
  
  process.on('SIGINT', () => gracefulShutdown('SIGINT'));
  process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
}

function setupRailwayHealthCheck() {
  const healthPort = parseInt(process.env.HEALTH_PORT || '3001');
  
  // Verificar se health check está respondendo
  const checkHealth = () => {
    const req = http.get(`http://localhost:${healthPort}/health`, (res) => {
      if (res.statusCode === 200) {
        console.log('✅ Health check do Railway funcionando!');
      }
    });
    
    req.on('error', (error) => {
      console.log('⏳ Aguardando health check...');
    });
    
    req.setTimeout(5000);
  };
  
  // Verificar a cada 30 segundos
  setInterval(checkHealth, 30000);
  
  // Primeira verificação
  setTimeout(checkHealth, 2000);
}

// Log de inicialização específico do Railway
if (process.env.RAILWAY_ENVIRONMENT) {
  console.log(`🚂 Rodando no Railway - Ambiente: ${process.env.RAILWAY_ENVIRONMENT}`);
}

if (process.env.RAILWAY_STATIC_URL) {
  console.log(`🌐 URL do Railway: ${process.env.RAILWAY_STATIC_URL}`);
}
