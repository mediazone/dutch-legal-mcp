#!/usr/bin/env node

/**
 * Dutch Legal MCP Server - Optimized Version
 * 
 * Clean architecture with dependency injection,
 * functional programming, and design patterns.
 * 
 * Author: Mediazone.nl
 * License: MIT
 */

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  CallToolRequest,
} from '@modelcontextprotocol/sdk/types.js';

import { DIContainer, TOKENS } from './shared/container.js';
import { ToolRegistry } from './application/tool-registry.js';
import {
  RechtspraakCaseLawService,
  GDPRComplianceServiceImpl,
  RiskAnalysisServiceImpl,
  DPAServiceImpl
} from './infrastructure/services.js';
import { VERSION } from './version.js';

// Security disclaimer - always shown
function showLegalDisclaimer(): void {
  console.error('⚠️  LEGAL DISCLAIMER: You are fully responsible for:');
  console.error('   • ALL actions performed by this Dutch Legal MCP tool');
  console.error('   • Compliance with API terms of service');
  console.error('   • Verifying data accuracy and legal authority');
  console.error('   • Ensuring legitimate use of data sources');
  console.error('   • All legal implications and consequences of your usage');
  console.error('   • Understanding this tool provides research assistance only - not legal advice');
  console.error('   • Any damages, liabilities, or legal issues arising from usage');
  console.error('');
}

// Dependency Injection Setup
function setupDependencies(): void {
  const container = DIContainer.getInstance();

  // Register services
  container.register(TOKENS.CASE_LAW_SERVICE, RechtspraakCaseLawService);
  container.register(TOKENS.COMPLIANCE_SERVICE, GDPRComplianceServiceImpl);
  container.register(TOKENS.RISK_ANALYSIS_SERVICE, RiskAnalysisServiceImpl);
  container.register(TOKENS.DPA_SERVICE, DPAServiceImpl);

  // Register tool registry
  container.register(TOKENS.TOOL_REGISTRY, () => new ToolRegistry());
}

class DutchLegalMCPServer {
  private server: Server;
  private toolRegistry: ToolRegistry;

  constructor() {
    // Always show legal disclaimer
    showLegalDisclaimer();
    
    setupDependencies();
    
    this.toolRegistry = DIContainer.getInstance().resolve<ToolRegistry>(TOKENS.TOOL_REGISTRY);
    this.server = new Server(
      {
        name: 'dutch-legal-mcp',
        version: VERSION,
      },
      {
        capabilities: {
          tools: {},
        },
      }
    );

    this.setupHandlers();
    this.setupErrorHandling();
  }

  private setupHandlers(): void {
    // List tools handler
    this.server.setRequestHandler(ListToolsRequestSchema, async () => ({
      tools: this.toolRegistry.getTools(),
    }));

    // Execute tool handler
    this.server.setRequestHandler(CallToolRequestSchema, async (request: CallToolRequest) => {
      const { name, arguments: args } = request.params;
      const response = await this.toolRegistry.executeTool(name, args);
      return response as any;
    });
  }

  private setupErrorHandling(): void {
    this.server.onerror = (error) => {
      console.error('[MCP Error]', error);
    };

    process.on('SIGINT', async () => {
      await this.server.close();
      process.exit(0);
    });

    process.on('uncaughtException', (error) => {
      console.error('[Uncaught Exception]', error);
      process.exit(1);
    });

    process.on('unhandledRejection', (reason) => {
      console.error('[Unhandled Rejection]', reason);
      process.exit(1);
    });
  }

  async start(): Promise<void> {
    const transport = new StdioServerTransport();
    await this.server.connect(transport);
    
    console.error(`🇳🇱⚖️ Dutch Legal MCP Server v${VERSION} started`);
    console.error('📚 5 legal tools available');
    console.error('🚀 Clean architecture with DI and design patterns');
    
    // Show which endpoints are being used
    const apiUrl = process.env.DUTCH_LEGAL_API_BASE_URL || 'https://data.rechtspraak.nl/uitspraken';
    const viewUrl = process.env.DUTCH_LEGAL_VIEW_BASE_URL || 'https://uitspraken.rechtspraak.nl';
    const isDefault = !process.env.DUTCH_LEGAL_API_BASE_URL && !process.env.DUTCH_LEGAL_VIEW_BASE_URL;
    
    if (isDefault) {
      console.error('🌐 Using Dutch government APIs (rechtspraak.nl)');
    } else {
      console.error(`🌐 Using configured endpoints: ${new URL(apiUrl).hostname}, ${new URL(viewUrl).hostname}`);
    }
    
    console.error('⚖️  Legal research assistance only - not legal advice');
    console.error('⚡ Ready for legal analysis requests');
  }
}

// CLI argument handling
function handleCliArgs(): boolean {
  const args = process.argv.slice(2);
  
  if (args.includes('--help') || args.includes('-h')) {
    console.log(`
🇳🇱⚖️ Dutch Legal MCP Server v${VERSION}

USAGE:
  npx @mediazone/dutch-legal-mcp              Start MCP server
  npx @mediazone/dutch-legal-mcp --version    Show version
  npx @mediazone/dutch-legal-mcp --help       Show this help

FEATURES:
  📚 Search 800K+ Dutch court cases
  ⚖️  GDPR compliance analysis
  🤖 EU AI Act classification
  🔍 Legal risk assessment
  📋 DPA authority updates

MCP CONFIGURATION:
Add to Claude Desktop settings.json:
{
  "mcpServers": {
    "dutch-legal": {
      "command": "npx",
      "args": ["@mediazone/dutch-legal-mcp"]
    }
  }
}

More info: https://github.com/mediazone/dutch-legal-mcp
`);
    return true;
  }
  
  if (args.includes('--version') || args.includes('-v')) {
    console.log(VERSION);
    return true;
  }
  
  return false;
}

// Application entry point
if (import.meta.url === `file://${process.argv[1]}`) {
  // Handle CLI arguments first
  if (handleCliArgs()) {
    process.exit(0);
  }
  
  // Start MCP server
  const server = new DutchLegalMCPServer();
  server.start().catch((error) => {
    console.error('Failed to start server:', error);
    process.exit(1);
  });
}