/**
 * Unit Tests for Response Formatters
 * Testing output formatting functions with correct entity types
 */

import {
  formatError,
  formatCourtCases,
  formatGDPRResult,
  formatAIActResult
} from '../../shared/formatters.js';

import type { CourtCase, ComplianceResult } from '../../domain/entities/index.js';

describe('Response Formatters', () => {
  describe('formatError', () => {
    it('should format error messages correctly', () => {
      const result = formatError('Test error message');
      
      expect(result).toEqual({
        content: [{
          type: 'text',
          text: 'Error: Test error message'
        }]
      });
    });

    it('should handle empty error message', () => {
      const result = formatError('');
      
      expect(result.content[0].text).toBe('Error: ');
    });

    it('should handle special characters in error message', () => {
      const result = formatError('Error with "quotes" and [brackets]');
      
      expect(result.content[0].text).toBe('Error: Error with "quotes" and [brackets]');
    });
  });

  describe('formatCourtCases', () => {
    const mockCase: CourtCase = {
      ecli: 'ECLI:NL:HR:2023:123',
      title: 'Privacy Law Decision',
      court: 'Hoge Raad',
      date: '2023-03-15',
      url: 'https://uitspraken.rechtspraak.nl/details/ECLI:NL:HR:2023:123',
      subjects: ['Privacy', 'GDPR'],
      summary: 'Important decision on data processing rights',
      precedentValue: 'high'
    };

    it('should format single court case correctly', () => {
      const result = formatCourtCases([mockCase]);
      
      expect(result).toContain('# Dutch Case Law Results');
      expect(result).toContain('**Found:** 1 decisions');
      expect(result).toContain('## 1. Privacy Law Decision');
      expect(result).toContain('**ECLI:** ECLI:NL:HR:2023:123');
      expect(result).toContain('**Court:** Hoge Raad');
      expect(result).toContain('**Date:** 2023-03-15');
      expect(result).toContain('**Precedent Value:** HIGH');
      expect(result).toContain('**Legal Domains:** Privacy, GDPR');
      expect(result).toContain('**Summary:** Important decision on data processing rights');
      expect(result).toContain('[View Decision](https://uitspraken.rechtspraak.nl/details/ECLI:NL:HR:2023:123)');
    });

    it('should format multiple court cases', () => {
      const cases: CourtCase[] = [
        mockCase,
        {
          ecli: 'ECLI:NL:RBAMS:2023:456',
          title: 'Contract Law Decision',
          court: 'Rechtbank Amsterdam',
          date: '2023-02-10',
          url: 'https://uitspraken.rechtspraak.nl/details/ECLI:NL:RBAMS:2023:456',
          subjects: ['Contract Law'],
          summary: 'Contract dispute resolution',
          precedentValue: 'medium'
        }
      ];

      const result = formatCourtCases(cases);
      
      expect(result).toContain('**Found:** 2 decisions');
      expect(result).toContain('## 1. Privacy Law Decision');
      expect(result).toContain('## 2. Contract Law Decision');
      expect(result).toContain('**Court:** Hoge Raad');
      expect(result).toContain('**Court:** Rechtbank Amsterdam');
    });

    it('should handle empty results', () => {
      const result = formatCourtCases([]);
      
      expect(result).toBe('No court decisions found. Try broader search terms or different keywords.');
    });

    it('should handle case with no subjects', () => {
      const caseNoSubjects: CourtCase = { 
        ...mockCase, 
        subjects: [] 
      };
      const result = formatCourtCases([caseNoSubjects]);
      
      expect(result).toContain('**ECLI:**');
      expect(result).not.toContain('**Legal Domains:**');
    });

    it('should handle case with no summary', () => {
      const caseNoSummary: CourtCase = { 
        ...mockCase, 
        summary: undefined 
      };
      const result = formatCourtCases([caseNoSummary]);
      
      expect(result).toContain('**ECLI:**');
      expect(result).not.toContain('**Summary:**');
    });
  });

  describe('formatGDPRResult', () => {
    const mockCompliance: ComplianceResult = {
      requestId: 'test-123',
      riskLevel: 'medium',
      score: 85,
      violations: [
        {
          code: 'GDPR-001',
          severity: 'major',
          description: 'Missing privacy policy link',
          remedy: 'Add privacy policy link to footer'
        }
      ],
      recommendations: [
        'Consider implementing cookie consent banner',
        'Review data retention policies annually'
      ],
      metadata: {
        assessmentDate: '2023-03-15',
        version: '1.0'
      }
    };

    it('should format GDPR compliance correctly', () => {
      const result = formatGDPRResult(mockCompliance);
      
      expect(result).toContain('# GDPR Compliance Assessment');
      expect(result).toContain('**Risk Level:** MEDIUM');
      expect(result).toContain('**Compliance Score:** 85/100');
      expect(result).toContain('## ⚠️ Violations Found');
      expect(result).toContain('**GDPR-001** (major)');
      expect(result).toContain('Missing privacy policy link');
      expect(result).toContain('Add privacy policy link to footer');
      expect(result).toContain('## 🔧 Recommendations');
      expect(result).toContain('Consider implementing cookie consent banner');
    });

    it('should handle perfect compliance score', () => {
      const perfectCompliance: ComplianceResult = {
        ...mockCompliance,
        riskLevel: 'low',
        score: 100,
        violations: []
      };

      const result = formatGDPRResult(perfectCompliance);
      
      expect(result).toContain('**Compliance Score:** 100/100');
      expect(result).toContain('**Risk Level:** LOW');
      expect(result).not.toContain('## ⚠️ Violations Found');
    });

    it('should handle high-risk compliance', () => {
      const highRiskCompliance: ComplianceResult = {
        ...mockCompliance,
        riskLevel: 'critical',
        score: 30,
        violations: [
          {
            code: 'GDPR-013',
            severity: 'critical',
            description: 'No privacy policy',
            remedy: 'Create comprehensive privacy policy'
          }
        ]
      };

      const result = formatGDPRResult(highRiskCompliance);
      
      expect(result).toContain('**Compliance Score:** 30/100');
      expect(result).toContain('**Risk Level:** CRITICAL');
      expect(result).toContain('**GDPR-013** (critical)');
    });

    it('should handle empty recommendations', () => {
      const noRecommendations: ComplianceResult = { 
        ...mockCompliance, 
        recommendations: [] 
      };
      const result = formatGDPRResult(noRecommendations);
      
      expect(result).toContain('# GDPR Compliance Assessment');
      expect(result).not.toContain('## 🔧 Recommendations');
    });
  });

  describe('formatAIActResult', () => {
    it('should format AI Act classification correctly', () => {
      const classification: ComplianceResult = {
        requestId: 'ai-test-123',
        riskLevel: 'high',
        score: 65,
        violations: [],
        recommendations: [
          'Conformity assessment required',
          'Risk management system mandatory',
          'Human oversight required'
        ],
        metadata: {
          riskCategory: 'high',
          systemType: 'recruitment'
        }
      };

      const result = formatAIActResult(classification);
      
      expect(result).toContain('# EU AI Act Classification');
      expect(result).toContain('**Risk Category:** HIGH');
      expect(result).toContain('**Compliance Score:** 65/100');
      expect(result).toContain('⚠️ **HIGH RISK**');
    });

    it('should handle prohibited AI systems', () => {
      const prohibited: ComplianceResult = {
        requestId: 'prohibited-123',
        riskLevel: 'critical',
        score: 0,
        violations: [],
        recommendations: [],
        metadata: {
          riskCategory: 'unacceptable'
        }
      };

      const result = formatAIActResult(prohibited);
      
      expect(result).toContain('**Risk Category:** UNACCEPTABLE');
      expect(result).toContain('🚫 **PROHIBITED**');
    });

    it('should handle minimal risk AI systems', () => {
      const minimal: ComplianceResult = {
        requestId: 'minimal-123',
        riskLevel: 'low',
        score: 90,
        violations: [],
        recommendations: ['Transparency obligations'],
        metadata: {
          riskCategory: 'limited'
        }
      };

      const result = formatAIActResult(minimal);
      
      expect(result).toContain('**Risk Category:** LIMITED');
      expect(result).toContain('**Compliance Score:** 90/100');
    });
  });

  describe('Edge Cases and Error Handling', () => {
    it('should handle undefined values gracefully', () => {
      const caseWithUndefined: CourtCase = {
        ecli: 'ECLI:NL:HR:2023:123',
        title: 'Test Case',
        court: 'Hoge Raad',
        date: '2023-01-01',
        url: 'https://example.com',
        subjects: ['Test'],
        summary: undefined,
        precedentValue: 'high'
      };

      const result = formatCourtCases([caseWithUndefined]);
      expect(result).toContain('**ECLI:**');
      expect(result).not.toContain('**Summary:** undefined');
    });

    it('should handle very long text content', () => {
      const longTitle = 'A'.repeat(1000);
      const longCase: CourtCase = {
        ecli: 'ECLI:NL:HR:2023:123',
        title: longTitle,
        court: 'Hoge Raad',
        date: '2023-01-01',
        url: 'https://example.com',
        subjects: [],
        summary: 'Test',
        precedentValue: 'high'
      };

      const result = formatCourtCases([longCase]);
      expect(result).toContain(longTitle);
    });

    it('should handle special characters in text', () => {
      const specialCase: CourtCase = {
        ecli: 'ECLI:NL:HR:2023:123',
        title: 'Case with "quotes" & <html> [brackets]',
        court: 'Hoge Raad',
        date: '2023-01-01',
        url: 'https://example.com',
        subjects: ['Special & Characters'],
        summary: 'Summary with émojis 🎉 and symbols #%&',
        precedentValue: 'high'
      };

      const result = formatCourtCases([specialCase]);
      expect(result).toContain('Case with "quotes" & <html> [brackets]');
      expect(result).toContain('Special & Characters');
      expect(result).toContain('Summary with émojis 🎉 and symbols #%&');
    });
  });

  describe('Type Safety', () => {
    it('should enforce valid precedent values', () => {
      const validCase: CourtCase = {
        ecli: 'ECLI:NL:HR:2023:123',
        title: 'Test Case',
        court: 'Hoge Raad',
        date: '2023-01-01',
        url: 'https://example.com',
        subjects: ['Test'],
        precedentValue: 'high' // Valid: 'low' | 'medium' | 'high'
      };

      const result = formatCourtCases([validCase]);
      expect(result).toContain('**Precedent Value:** HIGH');
    });

    it('should enforce valid risk levels', () => {
      const validResult: ComplianceResult = {
        requestId: 'test-123',
        riskLevel: 'medium', // Valid: 'low' | 'medium' | 'high' | 'critical'
        score: 75,
        violations: [],
        recommendations: [],
        metadata: {}
      };

      const result = formatGDPRResult(validResult);
      expect(result).toContain('**Risk Level:** MEDIUM');
    });

    it('should enforce valid severity levels', () => {
      const validViolation: ComplianceResult = {
        requestId: 'test-123',
        riskLevel: 'high',
        score: 60,
        violations: [
          {
            code: 'TEST-001',
            severity: 'critical', // Valid: 'minor' | 'major' | 'critical'
            description: 'Test violation',
            remedy: 'Test remedy'
          }
        ],
        recommendations: [],
        metadata: {}
      };

      const result = formatGDPRResult(validViolation);
      expect(result).toContain('**TEST-001** (critical)');
    });
  });
});