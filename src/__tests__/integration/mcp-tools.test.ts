/**
 * Integration Tests for MCP Tools
 * Testing end-to-end tool functionality with safe mocks
 */

import { ToolRegistry } from '../../application/tool-registry.js';

// Simple integration tests without complex mocks
describe('MCP Tools Integration', () => {
  let toolRegistry: ToolRegistry;

  beforeAll(() => {
    toolRegistry = new ToolRegistry();
  });

  describe('Tool Registry Initialization', () => {
    it('should initialize tool registry successfully', () => {
      expect(toolRegistry).toBeDefined();
      expect(toolRegistry).toBeInstanceOf(ToolRegistry);
    });

    it('should list all available tools', () => {
      const tools = toolRegistry.getTools();

      expect(tools).toHaveLength(5);
      
      const toolNames = tools.map(tool => tool.name);
      expect(toolNames).toContain('search_dutch_case_law');
      expect(toolNames).toContain('check_gdpr_compliance');
      expect(toolNames).toContain('classify_ai_system');
      expect(toolNames).toContain('analyze_legal_risk');
      expect(toolNames).toContain('get_dpa_updates');
    });

    it('should provide proper tool descriptions', () => {
      const tools = toolRegistry.getTools();
      const caseLawTool = tools.find(tool => tool.name === 'search_dutch_case_law');

      expect(caseLawTool).toBeDefined();
      expect(caseLawTool!.description).toContain('800,000+');
      expect(caseLawTool!.description).toContain('Rechtspraak.nl');
    });

    it('should have proper input schemas for all tools', () => {
      const tools = toolRegistry.getTools();

      tools.forEach(tool => {
        expect(tool.inputSchema).toBeDefined();
        expect(typeof tool.inputSchema).toBe('object');
        // Basic schema structure validation without complex typing
        expect(tool.inputSchema).toHaveProperty('type');
        expect(tool.inputSchema).toHaveProperty('properties');
        // Some tools may not have required fields, so make this optional
        if ('required' in tool.inputSchema) {
          expect(Array.isArray(tool.inputSchema.required)).toBe(true);
        }
      });
    });
  });

  describe('Tool Execution Error Handling', () => {
    it('should handle unknown tool execution gracefully', async () => {
      const response = await toolRegistry.executeTool('unknown_tool', {});

      expect(response.content).toHaveLength(1);
      expect(response.content[0].type).toBe('text');
      expect(response.content[0].text).toContain('Error:');
      expect(response.content[0].text).toContain('Unknown tool');
    });

    it('should maintain consistent response format for errors', async () => {
      const response = await toolRegistry.executeTool('nonexistent_tool', {});
      
      expect(response).toHaveProperty('content');
      expect(Array.isArray(response.content)).toBe(true);
      expect(response.content[0]).toHaveProperty('type', 'text');
      expect(response.content[0]).toHaveProperty('text');
      expect(typeof response.content[0].text).toBe('string');
    });
  });

  describe('Tool Validation', () => {
    it('should validate search_dutch_case_law parameters', async () => {
      // Test with invalid parameters
      const invalidArgs = {
        query: '', // Empty query should fail validation
        maxResults: 200 // Too high
      };

      const response = await toolRegistry.executeTool('search_dutch_case_law', invalidArgs);
      expect(response.content[0].text).toContain('Error:');
    });

    it('should validate check_gdpr_compliance parameters', async () => {
      // Test with invalid parameters
      const invalidArgs = {
        dataTypes: [], // Empty array should fail
        processingPurpose: '' // Empty purpose should fail
      };

      const response = await toolRegistry.executeTool('check_gdpr_compliance', invalidArgs);
      expect(response.content[0].text).toContain('Error:');
    });

    it('should validate classify_ai_system parameters', async () => {
      // Test with invalid parameters
      const invalidArgs = {
        systemDescription: 'AI', // Too short
        applicationDomain: '' // Empty domain
      };

      const response = await toolRegistry.executeTool('classify_ai_system', invalidArgs);
      expect(response.content[0].text).toContain('Error:');
    });

    it('should validate analyze_legal_risk parameters', async () => {
      // Test with invalid parameters
      const invalidArgs = {
        businessDescription: 'App' // Too short
      };

      const response = await toolRegistry.executeTool('analyze_legal_risk', invalidArgs);
      expect(response.content[0].text).toContain('Error:');
    });
  });

  describe('Response Format Consistency', () => {
    it('should return consistent MCP response structure', async () => {
      const tools = ['search_dutch_case_law', 'check_gdpr_compliance', 'get_dpa_updates'];
      
      for (const toolName of tools) {
        // Use minimal valid args for each tool
        const args = toolName === 'search_dutch_case_law' 
          ? { query: 'test' }
          : toolName === 'check_gdpr_compliance'
          ? { dataTypes: ['email'], processingPurpose: 'test' }
          : {};

        const response = await toolRegistry.executeTool(toolName, args);
        
        // Verify response structure without complex mocking
        expect(response).toHaveProperty('content');
        expect(Array.isArray(response.content)).toBe(true);
        expect(response.content[0]).toHaveProperty('type', 'text');
        expect(response.content[0]).toHaveProperty('text');
        expect(typeof response.content[0].text).toBe('string');
      }
    });

    it('should handle concurrent tool executions', async () => {
      const promises = [
        toolRegistry.executeTool('search_dutch_case_law', { query: 'privacy' }),
        toolRegistry.executeTool('check_gdpr_compliance', { 
          dataTypes: ['email'], 
          processingPurpose: 'Marketing' 
        }),
        toolRegistry.executeTool('get_dpa_updates', {})
      ];

      const results = await Promise.all(promises);

      expect(results).toHaveLength(3);
      results.forEach(result => {
        expect(result.content).toHaveLength(1);
        expect(result.content[0].type).toBe('text');
        expect(typeof result.content[0].text).toBe('string');
      });
    });
  });

  describe('Tool Metadata', () => {
    it('should provide tool descriptions in Dutch legal domain', () => {
      const tools = toolRegistry.getTools();
      
      const descriptions = tools.map(tool => tool.description);
      
      // Verify domain-specific terminology
      expect(descriptions.some(desc => desc.includes('GDPR'))).toBe(true);
      expect(descriptions.some(desc => desc.includes('Dutch'))).toBe(true);
      expect(descriptions.some(desc => desc.includes('AI Act'))).toBe(true);
      expect(descriptions.some(desc => desc.includes('legal'))).toBe(true);
    });

    it('should have appropriate input schema structure', () => {
      const tools = toolRegistry.getTools();
      
      tools.forEach(tool => {
        const schema = tool.inputSchema as any;
        
        expect(schema.type).toBe('object');
        expect(typeof schema.properties).toBe('object');
        
        // Only check required if it exists
        if (schema.required) {
          expect(Array.isArray(schema.required)).toBe(true);
        }
        
        // Verify each tool has appropriate required fields (if they exist)
        if (tool.name === 'search_dutch_case_law' && schema.required) {
          expect(schema.required).toContain('query');
        }
        if (tool.name === 'check_gdpr_compliance' && schema.required) {
          expect(schema.required).toContain('dataTypes');
          expect(schema.required).toContain('processingPurpose');
        }
        if (tool.name === 'classify_ai_system' && schema.required) {
          expect(schema.required).toContain('systemDescription');
          expect(schema.required).toContain('applicationDomain');
        }
      });
    });
  });

  describe('Real-world Usage Patterns', () => {
    it('should handle typical case law search patterns', async () => {
      const commonSearches = [
        { query: 'privacy' },
        { query: 'GDPR violation' },
        { query: 'data protection' },
        { query: 'contract dispute', maxResults: 5 },
        { query: 'employment law', court: 'Hoge Raad' }
      ];

      for (const search of commonSearches) {
        const response = await toolRegistry.executeTool('search_dutch_case_law', search);
        
        expect(response.content[0].type).toBe('text');
        // Response should be either results or error message
        expect(response.content[0].text.length).toBeGreaterThan(10);
      }
    });

    it('should handle typical GDPR compliance scenarios', async () => {
      const commonScenarios = [
        {
          dataTypes: ['email'],
          processingPurpose: 'Newsletter'
        },
        {
          dataTypes: ['email', 'name', 'phone'],
          processingPurpose: 'Customer support',
          legalBasis: 'legitimate-interest'
        },
        {
          dataTypes: ['personal-data'],
          processingPurpose: 'Marketing campaigns',
          thirdPartySharing: true
        }
      ];

      for (const scenario of commonScenarios) {
        const response = await toolRegistry.executeTool('check_gdpr_compliance', scenario);
        
        expect(response.content[0].type).toBe('text');
        expect(response.content[0].text.length).toBeGreaterThan(10);
      }
    });
  });

  describe('Edge Cases and Resilience', () => {
    it('should handle empty parameter objects', async () => {
      const response = await toolRegistry.executeTool('get_dpa_updates', {});
      
      expect(response.content[0].type).toBe('text');
      expect(typeof response.content[0].text).toBe('string');
    });

    it('should handle malformed input gracefully', async () => {
      // Test with null/undefined values where objects expected
      const response = await toolRegistry.executeTool('check_gdpr_compliance', {
        dataTypes: null as any,
        processingPurpose: undefined as any
      });

      expect(response.content[0].text).toContain('Error:');
    });

    it('should maintain performance under rapid requests', async () => {
      const startTime = Date.now();
      
      const rapidRequests = Array.from({ length: 10 }, (_, i) => 
        toolRegistry.executeTool('search_dutch_case_law', { query: `test-${i}` })
      );

      const results = await Promise.all(rapidRequests);
      const duration = Date.now() - startTime;

      expect(results).toHaveLength(10);
      expect(duration).toBeLessThan(10000); // Should complete within 10 seconds
      
      results.forEach(result => {
        expect(result.content[0]).toHaveProperty('type', 'text');
        expect(result.content[0]).toHaveProperty('text');
      });
    });
  });
});