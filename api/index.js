// Vercel serverless function entry point para MCP-SSE Server
import MCPSSEServer from '../dist/mcp-sse-server.js';

const server = new MCPSSEServer();

// Export the app for Vercel
export default server.app;