/**
 * Entry point para servidor HTTP MCP (compatível com Cursor)
 * Igual ao Context7 - funciona apenas com URL
 */

import { startHttpServer } from './http-server.js';

// Inicializar servidor HTTP
startHttpServer().catch((error) => {
  console.error('❌ Erro fatal no servidor HTTP:', error);
  process.exit(1);
});
