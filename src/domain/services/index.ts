/**
 * Domain Services - Business logic interfaces
 * Pure abstractions, no implementation details
 */

import type { 
  LegalRequest, 
  ComplianceResult, 
  CourtCase, 
  RiskAssessment 
} from '../entities/index.js';

export interface ComplianceService {
  assessGDPR(request: LegalRequest): Promise<ComplianceResult>;
  assessAIAct(request: LegalRequest): Promise<ComplianceResult>;
}

export interface CaseLawService {
  search(request: LegalRequest, baseUrl?: string): Promise<readonly CourtCase[]>;
  getDetails(ecli: string, baseUrl?: string): Promise<CourtCase>;
}

export interface RiskAnalysisService {
  analyze(request: LegalRequest): Promise<RiskAssessment>;
}

export interface DPAService {
  getUpdates(category?: string, limit?: number): Promise<readonly DPAUpdate[]>;
}

export interface DPAUpdate {
  readonly id: string;
  readonly title: string;
  readonly date: string;
  readonly category: 'guidance' | 'fine' | 'ruling' | 'update';
  readonly summary: string;
  readonly impact: 'low' | 'medium' | 'high';
  readonly url: string;
}

// Value objects
export interface SearchCriteria {
  readonly query: string;
  readonly court?: string;
  readonly dateFrom?: string;
  readonly dateTo?: string;
  readonly maxResults?: number;
  readonly baseUrl?: string; // User-provided court data endpoint
}

export interface GDPRCriteria {
  readonly dataTypes: readonly string[];
  readonly processingPurpose: string;
  readonly legalBasis?: string;
  readonly dataRetention?: string;
  readonly thirdPartySharing?: boolean;
}

export interface AISystemCriteria {
  readonly systemDescription: string;
  readonly applicationDomain: string;
  readonly userImpact?: string;
  readonly dataTypes?: readonly string[];
}