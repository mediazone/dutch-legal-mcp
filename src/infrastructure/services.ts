/**
 * Infrastructure Services - Implementation of domain interfaces
 * Concrete implementations with external API integration
 */

import type {
  ComplianceService,
  CaseLawService,
  RiskAnalysisService,
  DPAService,
  DPAUpdate
} from '../domain/services/index.js';
import type {
  LegalRequest,
  ComplianceResult,
  CourtCase,
  RiskAssessment,
  ComplianceViolation
} from '../domain/entities/index.js';
import { ApiClientFactory } from './api-client.js';
import { 
  SENSITIVE_DATA_TYPES,
  HIGH_RISK_DATA_TYPES,
  AI_RISK_DOMAINS,
  RISK_THRESHOLDS
} from '../shared/constants.js';
import { formatDate } from '../shared/utils.js';

// Case Law Service Implementation - USER-CONFIGURABLE ENDPOINTS
// User is responsible for providing legitimate court data endpoints
export class RechtspraakCaseLawService implements CaseLawService {
  private readonly defaultBaseUrl = process.env.DUTCH_LEGAL_API_BASE_URL || 'https://data.rechtspraak.nl/uitspraken';
  private readonly defaultViewUrl = process.env.DUTCH_LEGAL_VIEW_BASE_URL || 'https://uitspraken.rechtspraak.nl';

  async search(request: LegalRequest, baseUrl?: string): Promise<readonly CourtCase[]> {
    const apiBaseUrl = baseUrl || this.defaultBaseUrl;
    const searchClient = ApiClientFactory.getClient(`${apiBaseUrl}/zoeken`);
    // Step 1: Search for ECLIs
    const params = this.buildSearchParams(request.parameters);
    const searchResponse = await searchClient.getXML<string>('', { params });

    if (!searchResponse.success || !searchResponse.data) {
      throw new Error(searchResponse.error || 'Failed to search cases');
    }

    const eclis = this.extractECLIsFromFeed(searchResponse.data);
    
    // Step 2: Get content for each ECLI (limit to prevent timeout)
    const maxResults = Math.min(eclis.length, Number(params.max) || 10);
    const cases: CourtCase[] = [];
    
    for (let i = 0; i < maxResults; i++) {
      try {
        const caseDetail = await this.getDetails(eclis[i], baseUrl);
        cases.push(caseDetail);
      } catch (error) {
        console.error(`Failed to get details for ${eclis[i]}:`, error);
      }
    }

    return cases;
  }

  async getDetails(ecli: string, baseUrl?: string): Promise<CourtCase> {
    const apiBaseUrl = baseUrl || this.defaultBaseUrl;
    const contentClient = ApiClientFactory.getClient(`${apiBaseUrl}/content`);
    
    const response = await contentClient.getXML<string>('', { 
      params: { id: ecli } 
    });

    if (!response.success || !response.data) {
      throw new Error(response.error || 'Failed to get case details');
    }

    return this.parseContentResponse(response.data);
  }

  private extractECLIsFromFeed(feedData: unknown): string[] {
    try {
      const data = feedData as { feed?: { entry?: Record<string, unknown>[] } };
      const entries = data?.feed?.entry || [];
      return entries.map((entry: Record<string, unknown>) => {
        const id = entry.id;
        // Handle case where id might be wrapped in an array
        return Array.isArray(id) ? id[0] : id;
      }).filter(Boolean);
    } catch (error) {
      console.error('Error extracting ECLIs from feed:', error);
      return [];
    }
  }

  private buildSearchParams(parameters: Record<string, unknown>): Record<string, string> {
    const params: Record<string, string> = {};

    if (parameters.query) params.q = String(parameters.query);
    if (parameters.court) params.instantie = String(parameters.court);
    if (parameters.dateFrom) params.from = String(parameters.dateFrom);
    if (parameters.dateTo) params.to = String(parameters.dateTo);
    if (parameters.maxResults) params.max = String(parameters.maxResults);
    if (parameters.subject && Array.isArray(parameters.subject)) {
      params.rechtsgebied = (parameters.subject as string[]).join(',');
    }

    return params;
  }

  private parseContentResponse(xmlData: unknown): CourtCase {
    try {
      // For content response, the data structure is different
      const data = xmlData as { 'open-rechtspraak'?: { 'rdf:RDF'?: { 'rdf:Description'?: Record<string, unknown> } } };
      const rdf = data['open-rechtspraak']?.['rdf:RDF']?.['rdf:Description'];
      if (!rdf) {
        throw new Error('Invalid content response format');
      }
      
      return this.parseRDFEntry(rdf);
    } catch (error) {
      console.error('Error parsing content response:', error);
      throw error;
    }
  }

  private parseRDFEntry(rdf: Record<string, unknown>): CourtCase {
    const getValue = (field: unknown): string => {
      if (Array.isArray(field)) return (field[0] as { _?: string })?._ || String(field[0]) || '';
      return (field as { _?: string })?._ || String(field) || '';
    };

    const getArray = (field: unknown): string[] => {
      if (Array.isArray(field)) {
        return field.map(item => (item as { _?: string })?._ || String(item) || '').filter(Boolean);
      }
      return field ? [getValue(field)] : [];
    };

    const ecli = getValue(rdf['dcterms:identifier']) || '';
    const court = getValue(rdf['dcterms:creator']) || 'Unknown Court';
    const title = `${ecli} - ${court}`;
    const date = formatDate(getValue(rdf['dcterms:date']) || '');
    const subjects = getArray(rdf['dcterms:subject']);
    const caseNumber = getValue(rdf['psi:zaaknummer']) || '';
    
    // Determine precedent value
    const precedentValue = this.determinePrecedentValue(court, subjects);
    const url = `${this.defaultViewUrl}/inziendocument?id=${encodeURIComponent(ecli)}`;

    return {
      ecli,
      title,
      court,
      date,
      subjects,
      precedentValue,
      url,
      caseNumber,
    };
  }

  private determinePrecedentValue(court: string, subjects: readonly string[]): 'low' | 'medium' | 'high' {
    const courtLower = court.toLowerCase();
    
    if (courtLower.includes('hoge raad')) return 'high';
    if (courtLower.includes('gerechtshof')) return 'medium';
    
    // Check for constitutional or landmark cases
    const hasHighValueSubject = subjects.some(s => 
      s.toLowerCase().includes('grondrecht') || 
      s.toLowerCase().includes('europees')
    );
    
    return hasHighValueSubject ? 'medium' : 'low';
  }
}

// GDPR Compliance Service Implementation  
export class GDPRComplianceServiceImpl implements ComplianceService {
  async assessGDPR(request: LegalRequest): Promise<ComplianceResult> {
    const params = request.parameters;
    const dataTypes = params.dataTypes as string[] || [];
    const riskScore = this.calculateGDPRRisk(dataTypes, params);
    const riskLevel = this.getRiskLevel(riskScore);
    const violations = this.identifyViolations(params);
    const recommendations = this.generateRecommendations(riskLevel, violations);

    return {
      requestId: request.id,
      riskLevel,
      score: Math.max(0, 100 - riskScore),
      violations,
      recommendations,
      metadata: {
        dataTypes,
        processingPurpose: params.processingPurpose,
        assessmentType: 'gdpr',
      },
    };
  }

  async assessAIAct(request: LegalRequest): Promise<ComplianceResult> {
    const params = request.parameters;
    const riskCategory = this.classifyAISystem(request.query, params.applicationDomain as string);
    const riskScore = this.calculateAIActRisk(riskCategory);
    const riskLevel = this.getRiskLevel(riskScore);
    const recommendations = this.generateAIActRecommendations(riskCategory);

    return {
      requestId: request.id,
      riskLevel,
      score: Math.max(0, 100 - riskScore),
      violations: [],
      recommendations,
      metadata: {
        riskCategory,
        systemDescription: request.query,
        applicationDomain: params.applicationDomain,
        assessmentType: 'ai-act',
      },
    };
  }

  private calculateGDPRRisk(dataTypes: string[], params: Record<string, unknown>): number {
    let riskScore = 0;

    // Risk from data types
    dataTypes.forEach(type => {
      if (SENSITIVE_DATA_TYPES.some(s => type.toLowerCase().includes(s))) {
        riskScore += 30;
      } else if (HIGH_RISK_DATA_TYPES.some(h => type.toLowerCase().includes(h))) {
        riskScore += 20;
      } else {
        riskScore += 10;
      }
    });

    // Third party sharing adds risk
    if (params.thirdPartySharing) riskScore += 20;
    
    // Missing legal basis adds risk
    if (!params.legalBasis) riskScore += 15;
    
    // Missing retention period adds risk
    if (!params.dataRetention) riskScore += 10;

    return Math.min(riskScore, 100);
  }

  private calculateAIActRisk(riskCategory: string): number {
    switch (riskCategory) {
      case 'unacceptable': return 100;
      case 'high': return 80;
      case 'limited': return 40;
      case 'minimal': return 20;
      default: return 50;
    }
  }

  private getRiskLevel(score: number): 'low' | 'medium' | 'high' | 'critical' {
    if (score >= RISK_THRESHOLDS.GDPR.HIGH) return 'critical';
    if (score >= RISK_THRESHOLDS.GDPR.MEDIUM) return 'high';
    if (score >= RISK_THRESHOLDS.GDPR.LOW) return 'medium';
    return 'low';
  }

  private identifyViolations(params: Record<string, unknown>): readonly ComplianceViolation[] {
    const violations: ComplianceViolation[] = [];

    if (!params.legalBasis) {
      violations.push({
        code: 'GDPR-Art6',
        severity: 'major',
        description: 'No legal basis specified for data processing',
        remedy: 'Define lawful basis under GDPR Article 6',
      });
    }

    if (!params.dataRetention) {
      violations.push({
        code: 'GDPR-Art5',
        severity: 'minor',
        description: 'Data retention period not specified',
        remedy: 'Implement clear retention and deletion policies',
      });
    }

    return violations;
  }

  private generateRecommendations(riskLevel: string, violations: readonly ComplianceViolation[]): readonly string[] {
    const recommendations: string[] = [];

    if (riskLevel === 'critical' || riskLevel === 'high') {
      recommendations.push('Conduct Data Protection Impact Assessment (DPIA)');
      recommendations.push('Consult with Data Protection Officer (DPO)');
    }

    recommendations.push('Implement privacy by design principles');
    recommendations.push('Document all processing activities (Article 30)');
    recommendations.push('Establish data subject rights procedures');

    if (violations.length > 0) {
      recommendations.push('Address identified compliance violations immediately');
    }

    return recommendations;
  }

  private classifyAISystem(description: string, domain: string): string {
    const desc = description.toLowerCase();
    const dom = domain?.toLowerCase() || '';

    // Check for prohibited practices
    if (AI_RISK_DOMAINS.PROHIBITED.some(p => desc.includes(p))) {
      return 'unacceptable';
    }

    // Check for high-risk domains
    if (AI_RISK_DOMAINS.HIGH.some(h => dom.includes(h) || desc.includes(h))) {
      return 'high';
    }

    // Check for limited risk
    if (AI_RISK_DOMAINS.LIMITED.some(l => desc.includes(l))) {
      return 'limited';
    }

    return 'minimal';
  }

  private generateAIActRecommendations(riskCategory: string): readonly string[] {
    switch (riskCategory) {
      case 'unacceptable':
        return ['System is prohibited under EU AI Act - discontinue development'];
      case 'high':
        return [
          'Conduct conformity assessment',
          'Implement risk management system',
          'Ensure human oversight measures',
          'Prepare technical documentation',
          'CE marking required',
        ];
      case 'limited':
        return [
          'Implement transparency measures',
          'Inform users about AI interaction',
          'Document system capabilities and limitations',
        ];
      default:
        return [
          'Monitor regulatory developments',
          'Consider voluntary compliance measures',
        ];
    }
  }
}

// Risk Analysis Service Implementation
export class RiskAnalysisServiceImpl implements RiskAnalysisService {
  private gdprService = new GDPRComplianceServiceImpl();

  async analyze(request: LegalRequest): Promise<RiskAssessment> {
    const params = request.parameters;
    
    // Assess GDPR risk
    const gdprRequest: LegalRequest = {
      ...request,
      type: 'gdpr',
      parameters: {
        dataTypes: ['email', 'user data'], // Default assumption
        processingPurpose: request.query,
        ...params.dataProcessing as Record<string, unknown>,
      },
    };
    const gdprRisk = await this.gdprService.assessGDPR(gdprRequest);

    // Assess AI Act risk if applicable
    let aiActRisk: ComplianceResult | undefined;
    if (params.aiComponents) {
      const aiRequest: LegalRequest = {
        ...request,
        type: 'ai-act',
        parameters: {
          systemDescription: request.query,
          applicationDomain: params.targetMarket as string || 'business',
        },
      };
      aiActRisk = await this.gdprService.assessAIAct(aiRequest);
    }

    const overallRisk = this.calculateOverallRisk(gdprRisk, aiActRisk);
    const contractualRisks = this.assessContractualRisks(request.query, params.targetMarket as string);
    const urgentActions = this.generateUrgentActions(overallRisk, gdprRisk, aiActRisk);

    return {
      overallRisk,
      gdprRisk,
      aiActRisk,
      contractualRisks,
      urgentActions,
    };
  }

  private calculateOverallRisk(
    gdprRisk: ComplianceResult, 
    aiActRisk?: ComplianceResult
  ): 'low' | 'medium' | 'high' | 'critical' {
    const risks = [gdprRisk.riskLevel, aiActRisk?.riskLevel].filter(Boolean);
    
    if (risks.includes('critical')) return 'critical';
    if (risks.filter(r => r === 'high').length >= 1) return 'high';
    if (risks.filter(r => r === 'medium').length >= 1) return 'medium';
    return 'low';
  }

  private assessContractualRisks(businessDescription: string, targetMarket?: string): readonly string[] {
    const risks: string[] = [];
    const desc = businessDescription.toLowerCase();

    if (desc.includes('consumer') || desc.includes('b2c')) {
      risks.push('Consumer protection law compliance required');
    }

    if (targetMarket?.includes('eu') || targetMarket?.includes('international')) {
      risks.push('Cross-border regulatory compliance');
    }

    if (desc.includes('finance') || desc.includes('payment')) {
      risks.push('Financial services regulation (AFM)');
    }

    return risks;
  }

  private generateUrgentActions(
    overallRisk: string,
    gdprRisk: ComplianceResult,
    aiActRisk?: ComplianceResult
  ): readonly string[] {
    const actions: string[] = [];

    if (overallRisk === 'critical') {
      actions.push('Immediate legal counsel consultation required');
      actions.push('Consider suspending operations until compliance verified');
    }

    if (gdprRisk.riskLevel === 'high' || gdprRisk.riskLevel === 'critical') {
      actions.push('GDPR compliance audit within 30 days');
    }

    if (aiActRisk?.riskLevel === 'high') {
      actions.push('EU AI Act conformity assessment required');
    }

    if (actions.length === 0) {
      actions.push('Regular compliance monitoring recommended');
    }

    return actions;
  }
}

// DPA Service Implementation - PLACEHOLDER/ROADMAP FEATURE
// TODO: Replace with real API integration when Autoriteit Persoonsgegevens provides public API
// Currently returns mock data for development and testing purposes
export class DPAServiceImpl implements DPAService {
  async getUpdates(category = 'all', limit = 10): Promise<readonly DPAUpdate[]> {
    // MOCK IMPLEMENTATION - Returns static test data
    // Real implementation would require web scraping or official API from autoriteitpersoonsgegevens.nl
    // WARNING: These are sample/test updates - NOT real DPA data
    const mockUpdates: DPAUpdate[] = [
      {
        id: 'dpa-mock-001',
        title: '[SAMPLE] New Guidelines on AI System Data Processing',
        date: '2025-01-15',
        category: 'guidance',
        summary: '[MOCK DATA] Comprehensive guidelines on how GDPR applies to AI systems, including requirements for algorithmic transparency.',
        impact: 'high',
        url: 'https://autoriteitpersoonsgegevens.nl/nl/onderwerpen/artificial-intelligence-ai',
      },
      {
        id: 'dpa-mock-002', 
        title: '[SAMPLE] Record €4.75M Fine for Discriminatory Algorithm Use',
        date: '2025-01-10',
        category: 'fine',
        summary: '[MOCK DATA] Major penalty imposed on government agency for using discriminatory algorithms in benefit fraud detection.',
        impact: 'high',
        url: 'https://autoriteitpersoonsgegevens.nl/nl/nieuws/boete-fraudedetectie',
      },
    ];

    const filtered = category === 'all' 
      ? mockUpdates 
      : mockUpdates.filter(u => u.category === category);

    return filtered.slice(0, limit);
  }
}