#!/usr/bin/env node

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';
import { OpenProjectClient } from './client/openproject-client.js';
import { OpenProjectToolHandlers } from './handlers/tool-handlers.js';
import { createOpenProjectTools } from './tools/index.js';
import { OpenProjectConfigSchema } from './types/openproject.js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

class OpenProjectMCPServer {
  private server: Server;
  private client: OpenProjectClient;
  private toolHandlers: OpenProjectToolHandlers;
  private tools: any[];

  constructor() {
    // Validate configuration
    const config = OpenProjectConfigSchema.parse({
      baseUrl: process.env['OPENPROJECT_BASE_URL'],
      apiKey: process.env['OPENPROJECT_API_KEY'],
      username: process.env['OPENPROJECT_USERNAME'],
      password: process.env['OPENPROJECT_PASSWORD'],
    });

    // Initialize OpenProject client
    this.client = new OpenProjectClient(config);
    this.toolHandlers = new OpenProjectToolHandlers(this.client);
    this.tools = createOpenProjectTools();
    // Initialize MCP server
    this.server = new Server(
      {
        name: process.env['MCP_SERVER_NAME'] || 'openproject-mcp-server',
        version: process.env['MCP_SERVER_VERSION'] || '1.0.0',
      }
    );

    this.setupHandlers();
  }

  private setupHandlers(): void {
    // List tools handler
    this.server.setRequestHandler(ListToolsRequestSchema, async () => {
      return {
        tools: this.tools,
      };
    });

    // Call tool handler
    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      try {
        const result = await this.toolHandlers.handleToolCall(request);
        return result;
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        return {
          content: [
            {
              type: 'text',
              text: `Error: ${errorMessage}`,
            },
          ],
          isError: true,
        };
      }
    });

    // Error handler
    this.server.onerror = (error) => {
      console.error('[MCP Error]', error);
    };

    process.on('SIGINT', async () => {
      await this.server.close();
      process.exit(0);
    });
  }

  async start(): Promise<void> {
    try {
      // Test connection to OpenProject
      const isConnected = await this.client.testConnection();
      if (!isConnected) {
        console.error('Failed to connect to OpenProject API. Please check your configuration.');
        process.exit(1);
      }

      console.error('OpenProject MCP Server starting...');
      console.error(`Connected to OpenProject at: ${process.env['OPENPROJECT_BASE_URL']}`);
      
      const transport = new StdioServerTransport();
      await this.server.connect(transport);
      
      console.error('OpenProject MCP Server started successfully!');
    } catch (error) {
      console.error('Failed to start OpenProject MCP Server:', error);
      process.exit(1);
    }
  }
}

// Start the server
if (import.meta.url === `file://${process.argv[1]}`) {
  const server = new OpenProjectMCPServer();
  server.start().catch((error) => {
    console.error('Server startup failed:', error);
    process.exit(1);
  });
}

export { OpenProjectMCPServer };