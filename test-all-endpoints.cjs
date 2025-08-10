#!/usr/bin/env node

// Comprehensive test script for all Filazero MCP endpoints
// Access Key: d6779a60360d455b9af96c1b68e066c5

const https = require('https');
const fs = require('fs');

class FilazeroEndpointTester {
  constructor() {
    this.baseUrl = 'https://mcp-filazero.vercel.app';
    this.accessKey = 'd6779a60360d455b9af96c1b68e066c5';
    this.results = [];
    this.terminalData = null;
    this.ticketId = null;
    this.providerId = null;
    this.requestId = 1;
  }

  // Utility function to make HTTP requests
  async makeRequest(url, options = {}) {
    return new Promise((resolve, reject) => {
      const req = https.request(url, options, (res) => {
        let data = '';
        res.on('data', (chunk) => data += chunk);
        res.on('end', () => {
          try {
            const response = {
              statusCode: res.statusCode,
              headers: res.headers,
              body: data,
              data: data ? JSON.parse(data) : null
            };
            resolve(response);
          } catch (error) {
            resolve({
              statusCode: res.statusCode,
              headers: res.headers,
              body: data,
              data: null,
              parseError: error.message
            });
          }
        });
      });

      req.on('error', reject);
      
      if (options.body) {
        req.write(options.body);
      }
      
      req.end();
    });
  }

  // Make MCP tool call
  async callMCPTool(tool, args = {}) {
    const url = `${this.baseUrl}/mcp`;
    const body = JSON.stringify({
      jsonrpc: "2.0",
      id: this.requestId++,
      method: "tools/call",
      params: {
        name: tool,
        arguments: args
      }
    });

    const options = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(body)
      },
      body: body
    };

    return await this.makeRequest(url, options);
  }

  // Log test results
  logResult(testName, success, response, error = null) {
    const result = {
      test: testName,
      success: success,
      timestamp: new Date().toISOString(),
      response: response,
      error: error
    };

    this.results.push(result);

    console.log(`\n${'='.repeat(60)}`);
    console.log(`🧪 TEST: ${testName}`);
    console.log(`${'='.repeat(60)}`);
    console.log(`Status: ${success ? '✅ SUCCESS' : '❌ FAILED'}`);
    
    if (error) {
      console.log(`Error: ${error}`);
    }
    
    if (response) {
      console.log(`Response Status: ${response.statusCode}`);
      if (response.data) {
        console.log(`Response Data:`, JSON.stringify(response.data, null, 2));
      } else if (response.body) {
        console.log(`Response Body:`, response.body.substring(0, 500));
      }
    }
  }

  // Test 1: Root endpoint
  async testRootEndpoint() {
    try {
      const response = await this.makeRequest(`${this.baseUrl}/`);
      const success = response.statusCode === 200 && response.data;
      this.logResult('Root Endpoint (/)', success, response);
      return success;
    } catch (error) {
      this.logResult('Root Endpoint (/)', false, null, error.message);
      return false;
    }
  }

  // Test 2: Health endpoint
  async testHealthEndpoint() {
    try {
      const response = await this.makeRequest(`${this.baseUrl}/health`);
      const success = response.statusCode === 200 && response.data && response.data.status === 'healthy';
      this.logResult('Health Endpoint (/health)', success, response);
      return success;
    } catch (error) {
      this.logResult('Health Endpoint (/health)', false, null, error.message);
      return false;
    }
  }

  // Test 3: Get Terminal
  async testGetTerminal() {
    try {
      const response = await this.callMCPTool('get_terminal', {
        accessKey: this.accessKey
      });
      
      const success = response.statusCode === 200 && response.data && response.data.result && !response.data.error;
      
      if (success && response.data.result && response.data.result.content) {
        // Parse the terminal data from the MCP response
        const content = response.data.result.content[0];
        if (content && content.type === 'text') {
          this.terminalData = JSON.parse(content.text);
          if (this.terminalData.provider) {
            this.providerId = this.terminalData.provider.id;
          }
        }
      }
      
      this.logResult('Get Terminal', success, response);
      return success;
    } catch (error) {
      this.logResult('Get Terminal', false, null, error.message);
      return false;
    }
  }

  // Test 4: Get Service
  async testGetService() {
    try {
      // Use a service ID from the terminal data if available
      let serviceId = 123; // default
      if (this.terminalData && this.terminalData.services && this.terminalData.services[0]) {
        serviceId = this.terminalData.services[0].id;
      }

      const response = await this.callMCPTool('get_service', {
        id: serviceId
      });
      
      const success = response.statusCode === 200 && response.data && response.data.result && !response.data.error;
      this.logResult('Get Service', success, response);
      return success;
    } catch (error) {
      this.logResult('Get Service', false, null, error.message);
      return false;
    }
  }

  // Test 5: Get Company Template
  async testGetCompanyTemplate() {
    try {
      const response = await this.callMCPTool('get_company_template', {
        slug: 'artesano'
      });
      
      const success = response.statusCode === 200 && response.data;
      this.logResult('Get Company Template', success, response);
      return success;
    } catch (error) {
      this.logResult('Get Company Template', false, null, error.message);
      return false;
    }
  }

  // Test 6: Create Ticket
  async testCreateTicket() {
    try {
      if (!this.terminalData) {
        this.logResult('Create Ticket', false, null, 'No terminal data available');
        return false;
      }

      const ticketData = {
        terminalSchedule: {
          id: 1,
          publicAccessKey: this.accessKey,
          sessions: [{
            id: 2056331,
            start: new Date(Date.now() + 60000).toISOString(),
            end: new Date(Date.now() + 3600000).toISOString(),
            hasSlotsLeft: true
          }]
        },
        pid: this.providerId || 906,
        locationId: this.terminalData.location ? this.terminalData.location.id : 1,
        serviceId: this.terminalData.services && this.terminalData.services[0] ? this.terminalData.services[0].id : 123,
        customer: {
          name: 'Test Endpoint User',
          phone: '11999888777',
          email: 'test.endpoint@filazero.com'
        },
        browserUuid: 'test-uuid-' + Date.now(),
        priority: 0,
        metadata: []
      };

      const response = await this.callMCPTool('create_ticket', ticketData);
      
      const success = response.statusCode === 200 && response.data;
      
      if (success && response.data.data && response.data.data.id) {
        this.ticketId = response.data.data.id;
      }
      
      this.logResult('Create Ticket', success, response);
      return success;
    } catch (error) {
      this.logResult('Create Ticket', false, null, error.message);
      return false;
    }
  }

  // Test 7: Get Ticket
  async testGetTicket() {
    try {
      if (!this.ticketId) {
        // Try with a dummy ticket ID
        this.ticketId = 12345;
      }

      const response = await this.callMCPTool('get_ticket', {
        id: this.ticketId
      });
      
      const success = response.statusCode === 200 && response.data;
      this.logResult('Get Ticket', success, response);
      return success;
    } catch (error) {
      this.logResult('Get Ticket', false, null, error.message);
      return false;
    }
  }

  // Test 8: Get Queue Position
  async testGetQueuePosition() {
    try {
      const response = await this.callMCPTool('get_queue_position', {
        providerId: this.providerId || 906,
        ticketId: this.ticketId || 12345
      });
      
      const success = response.statusCode === 200 && response.data;
      this.logResult('Get Queue Position', success, response);
      return success;
    } catch (error) {
      this.logResult('Get Queue Position', false, null, error.message);
      return false;
    }
  }

  // Test 9: Get Ticket Prevision
  async testGetTicketPrevision() {
    try {
      const response = await this.callMCPTool('get_ticket_prevision', {
        ticketId: this.ticketId || 12345
      });
      
      const success = response.statusCode === 200 && response.data;
      this.logResult('Get Ticket Prevision', success, response);
      return success;
    } catch (error) {
      this.logResult('Get Ticket Prevision', false, null, error.message);
      return false;
    }
  }

  // Test 10: Checkin Ticket
  async testCheckinTicket() {
    try {
      const response = await this.callMCPTool('checkin_ticket', {
        smartCode: 'SC-TEST123',
        providerId: this.providerId || 906
      });
      
      const success = response.statusCode === 200 && response.data;
      this.logResult('Checkin Ticket', success, response);
      return success;
    } catch (error) {
      this.logResult('Checkin Ticket', false, null, error.message);
      return false;
    }
  }

  // Test 11: Confirm Presence
  async testConfirmPresence() {
    try {
      const response = await this.callMCPTool('confirm_presence', {
        ticketId: this.ticketId || 12345,
        providerId: this.providerId || 906
      });
      
      const success = response.statusCode === 200 && response.data;
      this.logResult('Confirm Presence', success, response);
      return success;
    } catch (error) {
      this.logResult('Confirm Presence', false, null, error.message);
      return false;
    }
  }

  // Test 12: Update Feedback
  async testUpdateFeedback() {
    try {
      const response = await this.callMCPTool('update_feedback', {
        feedbackId: 123,
        guid: 'test-guid-' + Date.now(),
        rate: 5,
        comment: 'Excellent service - automated test',
        platform: 'mcp'
      });
      
      const success = response.statusCode === 200 && response.data;
      this.logResult('Update Feedback', success, response);
      return success;
    } catch (error) {
      this.logResult('Update Feedback', false, null, error.message);
      return false;
    }
  }

  // Test 13: Cancel Ticket (if we created one)
  async testCancelTicket() {
    try {
      if (!this.ticketId) {
        this.logResult('Cancel Ticket', false, null, 'No ticket to cancel');
        return false;
      }

      const response = await this.callMCPTool('cancel_ticket', {
        ticketId: this.ticketId,
        providerId: this.providerId || 906,
        cancellation: 'Automated test cancellation'
      });
      
      const success = response.statusCode === 200 && response.data;
      this.logResult('Cancel Ticket', success, response);
      return success;
    } catch (error) {
      this.logResult('Cancel Ticket', false, null, error.message);
      return false;
    }
  }

  // Generate final report
  generateReport() {
    console.log(`\n${'='.repeat(80)}`);
    console.log(`📊 FINAL TEST REPORT`);
    console.log(`${'='.repeat(80)}`);
    console.log(`🕒 Test completed at: ${new Date().toISOString()}`);
    console.log(`🔑 Access Key used: ${this.accessKey}`);
    console.log(`🌐 Base URL: ${this.baseUrl}`);
    
    const totalTests = this.results.length;
    const passedTests = this.results.filter(r => r.success).length;
    const failedTests = totalTests - passedTests;
    
    console.log(`\n📈 SUMMARY:`);
    console.log(`Total Tests: ${totalTests}`);
    console.log(`✅ Passed: ${passedTests}`);
    console.log(`❌ Failed: ${failedTests}`);
    console.log(`📊 Success Rate: ${((passedTests / totalTests) * 100).toFixed(1)}%`);
    
    console.log(`\n📋 DETAILED RESULTS:`);
    this.results.forEach((result, index) => {
      const status = result.success ? '✅' : '❌';
      console.log(`${index + 1}. ${status} ${result.test}`);
      if (!result.success && result.error) {
        console.log(`   Error: ${result.error}`);
      }
    });

    // Save report to file
    const reportData = {
      timestamp: new Date().toISOString(),
      accessKey: this.accessKey,
      baseUrl: this.baseUrl,
      summary: {
        total: totalTests,
        passed: passedTests,
        failed: failedTests,
        successRate: ((passedTests / totalTests) * 100).toFixed(1) + '%'
      },
      terminalData: this.terminalData,
      results: this.results
    };

    const reportFile = `test-report-${Date.now()}.json`;
    fs.writeFileSync(reportFile, JSON.stringify(reportData, null, 2));
    console.log(`\n💾 Report saved to: ${reportFile}`);
  }

  // Run all tests
  async runAllTests() {
    console.log(`🚀 Starting comprehensive Filazero MCP endpoint tests`);
    console.log(`🔑 Access Key: ${this.accessKey}`);
    console.log(`🌐 Base URL: ${this.baseUrl}`);
    console.log(`🕒 Started at: ${new Date().toISOString()}`);

    // Run tests in sequence to maintain dependencies
    await this.testRootEndpoint();
    await this.testHealthEndpoint();
    await this.testGetTerminal();
    await this.testGetService();
    await this.testGetCompanyTemplate();
    await this.testCreateTicket();
    await this.testGetTicket();
    await this.testGetQueuePosition();
    await this.testGetTicketPrevision();
    await this.testCheckinTicket();
    await this.testConfirmPresence();
    await this.testUpdateFeedback();
    await this.testCancelTicket();

    this.generateReport();
  }
}

// Run tests if script is executed directly
if (require.main === module) {
  const tester = new FilazeroEndpointTester();
  tester.runAllTests().catch(console.error);
}

module.exports = FilazeroEndpointTester;