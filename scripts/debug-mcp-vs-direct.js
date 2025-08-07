#!/usr/bin/env node

/**
 * Debug script to compare MCP handler vs direct client calls
 * This will help us see exactly what data is being passed
 */

import { OpenProjectClient } from '../dist/client/openproject-client.js';
import { UpdateWorkPackageArgsSchema } from '../dist/tools/index.js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const config = {
  baseUrl: process.env.OPENPROJECT_BASE_URL,
  apiKey: process.env.OPENPROJECT_API_KEY
};

if (!config.baseUrl || !config.apiKey) {
  console.error('❌ Missing OpenProject configuration in .env file');
  process.exit(1);
}

async function debugMCPvsDirectCall() {
  try {
    console.log('🔍 Debug: MCP Handler vs Direct Client Call');
    console.log('=' .repeat(60));
    
    const client = new OpenProjectClient(config);
    
    // Simulate MCP handler transformation
    console.log('\n📋 Step 1: Simulating MCP Handler Transformation');
    const mcpArgs = { id: 183, percentageDone: 60 };
    console.log('MCP Input Args:', JSON.stringify(mcpArgs, null, 2));
    
    // Validate like MCP handler does
    const validatedArgs = UpdateWorkPackageArgsSchema.parse(mcpArgs);
    const { id, ...updateData } = validatedArgs;
    
    // Transform like the FIXED MCP handler
    const mcpWorkPackageData = {};
    if (updateData.subject !== undefined) mcpWorkPackageData.subject = updateData.subject;
    if (updateData.description !== undefined) mcpWorkPackageData.description = updateData.description;
    if (updateData.startDate !== undefined) mcpWorkPackageData.startDate = updateData.startDate;
    if (updateData.dueDate !== undefined) mcpWorkPackageData.dueDate = updateData.dueDate;
    if (updateData.estimatedTime !== undefined) mcpWorkPackageData.estimatedTime = updateData.estimatedTime;
    if (updateData.percentageDone !== undefined) mcpWorkPackageData.percentageDone = updateData.percentageDone;
    
    if (updateData.statusId) {
      mcpWorkPackageData.status = { id: updateData.statusId };
    }
    if (updateData.priorityId) {
      mcpWorkPackageData.priority = { id: updateData.priorityId };
    }
    if (updateData.assigneeId) {
      mcpWorkPackageData.assignee = { id: updateData.assigneeId };
    }
    
    console.log('MCP Transformed Data:', JSON.stringify(mcpWorkPackageData, null, 2));
    
    // Direct client call (like our working test)
    console.log('\n📋 Step 2: Direct Client Call (Working Method)');
    const directWorkPackageData = {
      percentageDone: 60
    };
    console.log('Direct Client Data:', JSON.stringify(directWorkPackageData, null, 2));
    
    // Test both approaches
    console.log('\n🧪 Step 3: Testing MCP Handler Approach');
    try {
      const mcpResult = await client.updateWorkPackage(id, mcpWorkPackageData);
      console.log('✅ MCP Handler approach SUCCESS!');
      console.log(`  - New Progress: ${mcpResult.percentageDone}%`);
      console.log(`  - New Lock Version: ${mcpResult.lockVersion}`);
    } catch (error) {
      console.log('❌ MCP Handler approach FAILED:');
      console.log(`  - Error: ${error.message}`);
      if (error.response) {
        console.log(`  - Status: ${error.response.status}`);
        console.log(`  - Data: ${JSON.stringify(error.response.data, null, 2)}`);
      }
    }
    
    console.log('\n🧪 Step 4: Testing Direct Client Approach');
    try {
      const directResult = await client.updateWorkPackage(id, directWorkPackageData);
      console.log('✅ Direct Client approach SUCCESS!');
      console.log(`  - New Progress: ${directResult.percentageDone}%`);
      console.log(`  - New Lock Version: ${directResult.lockVersion}`);
    } catch (error) {
      console.log('❌ Direct Client approach FAILED:');
      console.log(`  - Error: ${error.message}`);
      if (error.response) {
        console.log(`  - Status: ${error.response.status}`);
        console.log(`  - Data: ${JSON.stringify(error.response.data, null, 2)}`);
      }
    }
    
  } catch (error) {
    console.error('\n💥 Debug script failed:', error.message);
    process.exit(1);
  }
}

console.log('🚀 Starting MCP vs Direct debug comparison...');
debugMCPvsDirectCall().catch(error => {
  console.error('❌ Unhandled error:', error);
  process.exit(1);
});