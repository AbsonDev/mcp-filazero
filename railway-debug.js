#!/usr/bin/env node

/**
 * Script de diagnóstico para Railway
 * Ajuda a identificar problemas de inicialização
 * 
 * IMPORTANTE: Este arquivo usa CommonJS por compatibilidade
 */

console.log('🔍 RAILWAY DEBUG - Informações do ambiente:');
console.log('=====================================');

// Variáveis de ambiente importantes
console.log('📋 Environment Variables:');
console.log(`   NODE_ENV: ${process.env.NODE_ENV || 'undefined'}`);
console.log(`   PORT: ${process.env.PORT || 'undefined'}`);
console.log(`   HEALTH_PORT: ${process.env.HEALTH_PORT || 'undefined'}`);
console.log(`   RAILWAY_ENVIRONMENT: ${process.env.RAILWAY_ENVIRONMENT || 'undefined'}`);
console.log(`   RAILWAY_STATIC_URL: ${process.env.RAILWAY_STATIC_URL || 'undefined'}`);
console.log(`   FILAZERO_API_URL: ${process.env.FILAZERO_API_URL || 'undefined'}`);

// Informações do processo
console.log('');
console.log('💻 Process Info:');
console.log(`   Node Version: ${process.version}`);
console.log(`   Platform: ${process.platform}`);
console.log(`   Working Directory: ${process.cwd()}`);
console.log(`   PID: ${process.pid}`);

// Verificar arquivos importantes
const fs = require('fs');
const path = require('path');

console.log('');
console.log('📁 File Check:');
const criticalFiles = [
  'package.json',
  'railway.json', 
  'dist/http-index.js',
  'dist/http-server.js',
  'dist/index.js'
];

criticalFiles.forEach(file => {
  const exists = fs.existsSync(path.join(process.cwd(), file));
  console.log(`   ${file}: ${exists ? '✅ Exists' : '❌ Missing'}`);
  
  if (exists && file.includes('dist/')) {
    const stats = fs.statSync(path.join(process.cwd(), file));
    console.log(`      Size: ${stats.size} bytes, Modified: ${stats.mtime.toISOString()}`);
  }
});

// Testar import dos módulos principais
console.log('');
console.log('📦 Module Check:');
try {
  require('./dist/http-server.js');
  console.log('   http-server.js: ✅ Can import');
} catch (error) {
  console.log('   http-server.js: ❌ Import failed:', error.message);
}

// Verificar dependências críticas
console.log('');
console.log('🔗 Dependencies Check:');
const criticalDeps = ['express', 'cors', 'axios'];
criticalDeps.forEach(dep => {
  try {
    require(dep);
    console.log(`   ${dep}: ✅ Available`);
  } catch (error) {
    console.log(`   ${dep}: ❌ Not available`);
  }
});

// Testar binding de porta
console.log('');
console.log('🌐 Network Check:');
const port = process.env.PORT || 3000;
const express = require('express');
const app = express();

app.get('/debug', (req, res) => {
  res.json({ 
    status: 'debug-ok', 
    timestamp: new Date().toISOString(),
    env: process.env.NODE_ENV,
    port: port
  });
});

const server = app.listen(port, '0.0.0.0', () => {
  console.log(`   ✅ Successfully bound to port ${port}`);
  console.log(`   🌐 Server listening on 0.0.0.0:${port}`);
  
  // Encerrar após 5 segundos
  setTimeout(() => {
    console.log('   🛑 Closing debug server...');
    server.close(() => {
      console.log('   ✅ Debug completed successfully');
      process.exit(0);
    });
  }, 5000);
});

server.on('error', (error) => {
  console.log(`   ❌ Failed to bind to port ${port}:`, error.message);
  process.exit(1);
});