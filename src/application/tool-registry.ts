/**
 * Tool Registry - Strategy Pattern Implementation
 * Manages MCP tools with dependency injection and validation
 */

import type { MCPResponse } from '../shared/formatters.js';
import { 
  safeValidate,
  CaseLawSearchSchema,
  GDPRComplianceSchema,
  AIActClassificationSchema,
  RiskAnalysisSchema,
  DPAUpdatesSchema
} from '../shared/validators.js';
import {
  safeFormat,
  formatError,
  formatCourtCases,
  formatGDPRResult,
  formatAIActResult,
  formatRiskAssessment,
  formatDPAUpdates
} from '../shared/formatters.js';
import {
  CaseLawSearchUseCase,
  GDPRComplianceUseCase,
  AIActClassificationUseCase,
  RiskAnalysisUseCase,
  DPAUpdatesUseCase
} from './use-cases.js';
import { errorToMessage } from '../shared/errors.js';

// Tool strategy interface
interface ToolStrategy {
  readonly name: string;
  readonly description: string;
  readonly inputSchema: object;
  execute(args: unknown): Promise<MCPResponse>;
}

// Case Law Tool Strategy
class CaseLawToolStrategy implements ToolStrategy {
  readonly name = 'search_dutch_case_law';
  readonly description = 'Search Dutch court decisions from Rechtspraak.nl database. Access 800,000+ cases by keywords, ECLI, court, or date range.';
  readonly inputSchema = {
    type: 'object',
    properties: {
      query: {
        type: 'string',
        description: 'Search terms, case name, or legal concepts',
      },
      court: {
        type: 'string',
        description: 'Specific court (e.g., "Hoge Raad", "Rechtbank Amsterdam")',
      },
      dateFrom: {
        type: 'string',
        description: 'Start date (YYYY-MM-DD format)',
      },
      dateTo: {
        type: 'string', 
        description: 'End date (YYYY-MM-DD format)',
      },
      maxResults: {
        type: 'number',
        description: 'Maximum number of results (1-50)',
        default: 10,
      },
    },
    required: ['query'],
  };

  async execute(args: unknown): Promise<MCPResponse> {
    const validation = safeValidate(CaseLawSearchSchema)(args);
    if (!validation.success) {
      return formatError(validation.error);
    }

    try {
      const useCase = new CaseLawSearchUseCase();
      const cases = await useCase.execute(validation.data);
      return safeFormat(formatCourtCases)(cases);
    } catch (error) {
      return formatError(errorToMessage(error as Error));
    }
  }
}

// GDPR Tool Strategy
class GDPRToolStrategy implements ToolStrategy {
  readonly name = 'check_gdpr_compliance';
  readonly description = 'Analyze data processing activities against GDPR requirements. Get compliance score, identify violations, and receive recommendations.';
  readonly inputSchema = {
    type: 'object',
    properties: {
      dataTypes: {
        type: 'array',
        items: { type: 'string' },
        description: 'Types of personal data processed (e.g., "email", "location", "biometric")',
      },
      processingPurpose: {
        type: 'string',
        description: 'Purpose of data processing',
      },
      legalBasis: {
        type: 'string',
        description: 'GDPR legal basis for processing',
      },
      dataRetention: {
        type: 'string',
        description: 'Data retention period',
      },
      thirdPartySharing: {
        type: 'boolean',
        description: 'Whether data is shared with third parties',
      },
    },
    required: ['dataTypes', 'processingPurpose'],
  };

  async execute(args: unknown): Promise<MCPResponse> {
    const validation = safeValidate(GDPRComplianceSchema)(args);
    if (!validation.success) {
      return formatError(validation.error);
    }

    try {
      const useCase = new GDPRComplianceUseCase();
      const result = await useCase.execute(validation.data);
      return safeFormat(formatGDPRResult)(result);
    } catch (error) {
      return formatError(errorToMessage(error as Error));
    }
  }
}

// AI Act Tool Strategy
class AIActToolStrategy implements ToolStrategy {
  readonly name = 'classify_ai_system';
  readonly description = 'Classify AI system according to EU AI Act risk categories and get compliance requirements.';
  readonly inputSchema = {
    type: 'object',
    properties: {
      systemDescription: {
        type: 'string',
        description: 'Description of the AI system and its functionality',
      },
      applicationDomain: {
        type: 'string',
        description: 'Domain of application (e.g., "healthcare", "finance", "recruitment")',
      },
      userImpact: {
        type: 'string',
        description: 'How the system impacts users or decision-making',
      },
      dataTypes: {
        type: 'array',
        items: { type: 'string' },
        description: 'Types of data the AI system processes',
      },
    },
    required: ['systemDescription', 'applicationDomain'],
  };

  async execute(args: unknown): Promise<MCPResponse> {
    const validation = safeValidate(AIActClassificationSchema)(args);
    if (!validation.success) {
      return formatError(validation.error);
    }

    try {
      const useCase = new AIActClassificationUseCase();
      const result = await useCase.execute(validation.data);
      return safeFormat(formatAIActResult)(result);
    } catch (error) {
      return formatError(errorToMessage(error as Error));
    }
  }
}

// Risk Analysis Tool Strategy
class RiskAnalysisToolStrategy implements ToolStrategy {
  readonly name = 'analyze_legal_risk';
  readonly description = 'Comprehensive legal risk assessment covering GDPR, AI Act, and Dutch contract law.';
  readonly inputSchema = {
    type: 'object',
    properties: {
      businessDescription: {
        type: 'string',
        description: 'Description of business or application',
      },
      dataProcessing: {
        type: 'object',
        description: 'Data processing details',
      },
      aiComponents: {
        type: 'boolean',
        description: 'Whether the system includes AI components',
      },
      targetMarket: {
        type: 'string',
        description: 'Target market or jurisdiction',
      },
    },
    required: ['businessDescription'],
  };

  async execute(args: unknown): Promise<MCPResponse> {
    const validation = safeValidate(RiskAnalysisSchema)(args);
    if (!validation.success) {
      return formatError(validation.error);
    }

    try {
      const useCase = new RiskAnalysisUseCase();
      const result = await useCase.execute(validation.data.businessDescription, {
        dataProcessing: validation.data.dataProcessing,
        aiComponents: validation.data.aiComponents,
        targetMarket: validation.data.targetMarket,
      });
      return safeFormat(formatRiskAssessment)(result);
    } catch (error) {
      return formatError(errorToMessage(error as Error));
    }
  }
}

// DPA Updates Tool Strategy
class DPAUpdatesToolStrategy implements ToolStrategy {
  readonly name = 'get_dpa_updates';
  readonly description = 'Get latest updates from Dutch Data Protection Authority (Autoriteit Persoonsgegevens).';
  readonly inputSchema = {
    type: 'object',
    properties: {
      category: {
        type: 'string',
        enum: ['all', 'guidance', 'fines', 'rulings', 'updates'],
        description: 'Type of updates to retrieve',
        default: 'all',
      },
      limit: {
        type: 'number',
        description: 'Maximum number of updates to return',
        default: 10,
      },
    },
  };

  async execute(args: unknown): Promise<MCPResponse> {
    const validation = safeValidate(DPAUpdatesSchema)(args);
    if (!validation.success) {
      return formatError(validation.error);
    }

    try {
      const useCase = new DPAUpdatesUseCase();
      const updates = await useCase.execute(validation.data.category, validation.data.limit);
      return safeFormat(formatDPAUpdates)(updates);
    } catch (error) {
      return formatError(errorToMessage(error as Error));
    }
  }
}

// Tool Registry - Factory Pattern
export class ToolRegistry {
  private strategies = new Map<string, ToolStrategy>([
    ['search_dutch_case_law', new CaseLawToolStrategy()],
    ['check_gdpr_compliance', new GDPRToolStrategy()],
    ['classify_ai_system', new AIActToolStrategy()],
    ['analyze_legal_risk', new RiskAnalysisToolStrategy()],
    ['get_dpa_updates', new DPAUpdatesToolStrategy()],
  ]);

  getTools() {
    return Array.from(this.strategies.values()).map(strategy => ({
      name: strategy.name,
      description: strategy.description,
      inputSchema: strategy.inputSchema,
    }));
  }

  async executeTool(name: string, args: unknown): Promise<MCPResponse> {
    const strategy = this.strategies.get(name);
    if (!strategy) {
      return formatError(`Unknown tool: ${name}`);
    }

    return strategy.execute(args);
  }
}