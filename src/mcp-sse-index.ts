/**
 * Entry point para MCP-SSE Server
 * Servidor MCP com protocolo JSON-RPC 2.0 e Server-Sent Events
 */

import MCPSSEServer from './mcp-sse-server.js';

const server = new MCPSSEServer();
server.start();