/**
 * Application Use Cases
 * Business logic orchestration with dependency injection
 */

import type { 
  ComplianceService, 
  CaseLawService, 
  RiskAnalysisService, 
  DPAService,
  SearchCriteria,
  GDPRCriteria,
  AISystemCriteria
} from '../domain/services/index.js';
import type { 
  LegalRequest, 
  ComplianceResult, 
  CourtCase, 
  RiskAssessment 
} from '../domain/entities/index.js';
import type { DPAUpdate } from '../domain/services/index.js';
import { DIContainer, TOKENS } from '../shared/container.js';
import { withErrorHandling } from '../shared/errors.js';

// Base use case with DI
abstract class BaseUseCase {
  protected container = DIContainer.getInstance();
}

// Case Law Search Use Case - USER-CONFIGURABLE ENDPOINTS
// User is responsible for providing legitimate court data API endpoints
export class CaseLawSearchUseCase extends BaseUseCase {
  @withErrorHandling
  async execute(criteria: SearchCriteria): Promise<readonly CourtCase[]> {
    const service = this.container.resolve<CaseLawService>(TOKENS.CASE_LAW_SERVICE);
    
    const request: LegalRequest = {
      id: this.generateId(),
      type: 'case-law',
      query: criteria.query,
      parameters: { ...criteria },
      timestamp: new Date(),
    };

    return service.search(request, criteria.baseUrl);
  }

  private generateId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }
}

// GDPR Compliance Use Case
export class GDPRComplianceUseCase extends BaseUseCase {
  @withErrorHandling
  async execute(criteria: GDPRCriteria): Promise<ComplianceResult> {
    const service = this.container.resolve<ComplianceService>(TOKENS.COMPLIANCE_SERVICE);
    
    const request: LegalRequest = {
      id: this.generateId(),
      type: 'gdpr',
      query: criteria.processingPurpose,
      parameters: { ...criteria },
      timestamp: new Date(),
    };

    return service.assessGDPR(request);
  }

  private generateId(): string {
    return `gdpr-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }
}

// AI Act Classification Use Case
export class AIActClassificationUseCase extends BaseUseCase {
  @withErrorHandling
  async execute(criteria: AISystemCriteria): Promise<ComplianceResult> {
    const service = this.container.resolve<ComplianceService>(TOKENS.COMPLIANCE_SERVICE);
    
    const request: LegalRequest = {
      id: this.generateId(),
      type: 'ai-act',
      query: criteria.systemDescription,
      parameters: { ...criteria },
      timestamp: new Date(),
    };

    return service.assessAIAct(request);
  }

  private generateId(): string {
    return `ai-act-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }
}

// Risk Analysis Use Case
export class RiskAnalysisUseCase extends BaseUseCase {
  @withErrorHandling
  async execute(businessDescription: string, parameters: Record<string, unknown>): Promise<RiskAssessment> {
    const service = this.container.resolve<RiskAnalysisService>(TOKENS.RISK_ANALYSIS_SERVICE);
    
    const request: LegalRequest = {
      id: this.generateId(),
      type: 'risk-analysis',
      query: businessDescription,
      parameters,
      timestamp: new Date(),
    };

    return service.analyze(request);
  }

  private generateId(): string {
    return `risk-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }
}

// DPA Updates Use Case - PLACEHOLDER/ROADMAP FEATURE
// Returns mock data for development/testing until real API integration is available
export class DPAUpdatesUseCase extends BaseUseCase {
  @withErrorHandling
  async execute(category?: string, limit?: number): Promise<readonly DPAUpdate[]> {
    const service = this.container.resolve<DPAService>(TOKENS.DPA_SERVICE);
    // Note: Current implementation returns sample data - not real DPA updates
    return service.getUpdates(category, limit);
  }
}