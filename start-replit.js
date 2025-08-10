#!/usr/bin/env node

/**
 * Script de inicialização específico para Replit
 * Configura o ambiente e inicia o servidor MCP
 */

const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 Iniciando Filazero MCP Server no Replit...');

// Configurar variáveis de ambiente específicas do Replit
process.env.NODE_ENV = process.env.NODE_ENV || 'production';
process.env.FILAZERO_API_URL = process.env.FILAZERO_API_URL || 'https://api.staging.filazero.net/';
process.env.PORT = process.env.PORT || '3000';
process.env.HEALTH_PORT = process.env.HEALTH_PORT || '3001';
process.env.ENABLE_HEALTH_CHECK = 'true';
process.env.REPLIT_MODE = 'true';

// Verificar se o build existe
const distPath = path.join(__dirname, 'dist');
const indexPath = path.join(distPath, 'index.js');

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
      startServer();
    } else {
      console.error('❌ Erro no build:', code);
      process.exit(1);
    }
  });
} else {
  console.log('✅ Build encontrado, iniciando servidor...');
  startServer();
}

function startServer() {
  console.log('🎯 Iniciando servidor MCP...');
  console.log(`📡 Ambiente: ${process.env.NODE_ENV}`);
  console.log(`🔗 API URL: ${process.env.FILAZERO_API_URL}`);
  console.log(`🌐 Porta: ${process.env.PORT}`);
  console.log(`🏥 Health Check: ${process.env.HEALTH_PORT}`);
  
  // Executar o servidor
  const serverProcess = spawn('node', ['dist/index.js'], {
    stdio: 'inherit',
    shell: true,
    env: process.env
  });
  
  serverProcess.on('close', (code) => {
    console.log(`🛑 Servidor encerrado com código: ${code}`);
  });
  
  serverProcess.on('error', (error) => {
    console.error('❌ Erro ao iniciar servidor:', error);
  });
  
  // Graceful shutdown
  process.on('SIGINT', () => {
    console.log('🛑 Encerrando servidor...');
    serverProcess.kill('SIGINT');
  });
  
  process.on('SIGTERM', () => {
    console.log('🛑 Encerrando servidor...');
    serverProcess.kill('SIGTERM');
  });
}
