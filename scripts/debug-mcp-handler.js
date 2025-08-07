#!/usr/bin/env node

import { OpenProjectClient } from '../dist/client/openproject-client.js';
import { OpenProjectToolHandlers } from '../dist/handlers/tool-handlers.js';
import dotenv from 'dotenv';

dotenv.config();

async function debugMCPHandler() {
  console.log('🔍 Debug MCP Handler vs Direct Client');
  console.log('=====================================');
  
  const client = new OpenProjectClient({
    baseUrl: process.env.OPENPROJECT_BASE_URL,
    apiKey: process.env.OPENPROJECT_API_KEY
  });
  
  const handlers = new OpenProjectToolHandlers(client);
  
  try {
    // Get current state
    console.log('📋 Getting current work package state...');
    const current = await client.getWorkPackage(183);
    console.log(`Current Progress: ${current.percentageDone}%`);
    console.log(`Current Lock Version: ${current.lockVersion}`);
    
    // Test MCP handler through the tool call mechanism
    console.log('\n🧪 Testing MCP Handler through tool call...');
    const mcpRequest = {
      params: {
        name: 'update_work_package',
        arguments: {
          id: 183,
          percentageDone: 95
        }
      }
    };
    
    console.log('MCP Request:', JSON.stringify(mcpRequest, null, 2));
    
    const mcpResult = await handlers.handleToolCall(mcpRequest);
    console.log('✅ MCP Handler Success!');
    console.log('Result:', JSON.stringify(mcpResult, null, 2));
    
  } catch (error) {
    console.error('❌ MCP Handler Error:', error.message);
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response data:', JSON.stringify(error.response.data, null, 2));
    }
  }
}

debugMCPHandler();