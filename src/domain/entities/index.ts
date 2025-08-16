/**
 * Domain Entities - Core business objects
 * Immutable, pure data structures with business logic
 */

export interface LegalRequest {
  readonly id: string;
  readonly type: 'case-law' | 'gdpr' | 'ai-act' | 'risk-analysis' | 'dpa-updates';
  readonly query: string;
  readonly parameters: Record<string, unknown>;
  readonly timestamp: Date;
}

export interface ComplianceResult {
  readonly requestId: string;
  readonly riskLevel: 'low' | 'medium' | 'high' | 'critical';
  readonly score: number; // 0-100
  readonly violations: readonly ComplianceViolation[];
  readonly recommendations: readonly string[];
  readonly metadata: Record<string, unknown>;
}

export interface ComplianceViolation {
  readonly code: string;
  readonly severity: 'minor' | 'major' | 'critical';
  readonly description: string;
  readonly remedy: string;
}

export interface CourtCase {
  readonly ecli: string;
  readonly title: string;
  readonly court: string;
  readonly date: string;
  readonly subjects: readonly string[];
  readonly precedentValue: 'low' | 'medium' | 'high';
  readonly url: string;
  readonly summary?: string;
  readonly caseNumber?: string;
}

export interface RiskAssessment {
  readonly overallRisk: 'low' | 'medium' | 'high' | 'critical';
  readonly gdprRisk: ComplianceResult;
  readonly aiActRisk?: ComplianceResult;
  readonly contractualRisks: readonly string[];
  readonly urgentActions: readonly string[];
}