#!/usr/bin/env node

/**
 * Script de teste para o servidor MCP Filazero
 * Testa as principais funcionalidades via protocol MCP
 */

const { spawn } = require('child_process');

// Test data
const TEST_ACCESS_KEY = '1d1373dcf045408aa3b13914f2ac1076'; // From .NET project

// Helper function to test MCP call
function testMCPCall(toolName, args, description) {
  return new Promise((resolve, reject) => {
    console.log(`\n🧪 ${description}`);
    console.log(`📞 Calling: ${toolName}`);
    
    const request = {
      jsonrpc: '2.0',
      id: Date.now(),
      method: 'tools/call',
      params: {
        name: toolName,
        arguments: args
      }
    };

    const child = spawn('npm', ['run', 'dev'], { 
      stdio: ['pipe', 'pipe', 'pipe'],
      cwd: process.cwd()
    });

    let output = '';
    let errorOutput = '';

    child.stdout.on('data', (data) => {
      output += data.toString();
    });

    child.stderr.on('data', (data) => {
      errorOutput += data.toString();
    });

    // Send request to MCP server
    child.stdin.write(JSON.stringify(request) + '\n');

    setTimeout(() => {
      try {
        child.kill();
        
        // Try to parse response
        const lines = output.split('\n').filter(line => line.trim());
        const responseLine = lines.find(line => {
          try {
            const parsed = JSON.parse(line);
            return parsed.id === request.id;
          } catch {
            return false;
          }
        });

        if (responseLine) {
          const response = JSON.parse(responseLine);
          console.log(`✅ Response received:`, JSON.stringify(response, null, 2));
          resolve(response);
        } else {
          console.log(`❌ No valid response found`);
          console.log(`📝 Output:`, output);
          console.log(`🚨 Error:`, errorOutput);
          resolve(null);
        }
      } catch (error) {
        console.log(`❌ Test failed:`, error.message);
        resolve(null);
      }
    }, 5000);

    child.on('error', (error) => {
      console.log(`❌ Process error:`, error.message);
      resolve(null);
    });
  });
}

// Test listing tools
function testListTools() {
  return new Promise((resolve, reject) => {
    console.log(`\n🧪 Testing tool listing`);
    
    const request = {
      jsonrpc: '2.0',
      id: Date.now(),
      method: 'tools/list',
      params: {}
    };

    const child = spawn('npm', ['run', 'dev'], { 
      stdio: ['pipe', 'pipe', 'pipe'],
      cwd: process.cwd()
    });

    let output = '';

    child.stdout.on('data', (data) => {
      output += data.toString();
    });

    // Send request to MCP server
    child.stdin.write(JSON.stringify(request) + '\n');

    setTimeout(() => {
      try {
        child.kill();
        
        const lines = output.split('\n').filter(line => line.trim());
        const responseLine = lines.find(line => {
          try {
            const parsed = JSON.parse(line);
            return parsed.id === request.id && parsed.result?.tools;
          } catch {
            return false;
          }
        });

        if (responseLine) {
          const response = JSON.parse(responseLine);
          console.log(`✅ Found ${response.result.tools.length} tools:`);
          response.result.tools.forEach(tool => {
            console.log(`   - ${tool.name}: ${tool.description}`);
          });
          resolve(response.result.tools.length);
        } else {
          console.log(`❌ No tools response found`);
          resolve(0);
        }
      } catch (error) {
        console.log(`❌ Test failed:`, error.message);
        resolve(0);
      }
    }, 5000);
  });
}

// Main test runner
async function runTests() {
  console.log('🚀 Iniciando testes do Filazero MCP Server (Node.js)');
  console.log('================================================');

  try {
    // Test 1: List available tools
    const toolCount = await testListTools();
    if (toolCount < 11) {
      console.log(`⚠️ Expected 11 tools, found ${toolCount}`);
    }

    // Test 2: Get terminal
    await testMCPCall('get_terminal', {
      accessKey: TEST_ACCESS_KEY
    }, 'Testing terminal lookup');

    // Test 3: Get service (using common service ID)
    await testMCPCall('get_service', {
      id: 1
    }, 'Testing service lookup');

    // Test 4: Get company template
    await testMCPCall('get_company_template', {
      slug: 'artesano'
    }, 'Testing company template');

    console.log('\n🎉 Testes concluídos!');
    console.log('\n📋 Para testar criação de tickets, use:');
    console.log('   - Terminal access key:', TEST_ACCESS_KEY);
    console.log('   - Provider IDs: 460 (dev), 906 (prod)');
    
  } catch (error) {
    console.error('❌ Erro nos testes:', error);
    process.exit(1);
  }
}

// Command line interface
const command = process.argv[2];

if (command === 'list') {
  testListTools().then(() => process.exit(0));
} else if (command === 'terminal') {
  testMCPCall('get_terminal', { accessKey: TEST_ACCESS_KEY }, 'Testing terminal')
    .then(() => process.exit(0));
} else {
  runTests().then(() => process.exit(0));
}