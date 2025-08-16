/**
 * Unit Tests for Validation Schemas
 * Testing Zod schema validation logic
 */

import {
  LegalRequestSchema,
  CaseLawSearchSchema,
  GDPRComplianceSchema,
  AIActClassificationSchema,
  RiskAnalysisSchema,
  DPAUpdatesSchema
} from '../../shared/validators.js';

describe('Validation Schemas', () => {
  describe('LegalRequestSchema', () => {
    it('should validate valid basic request', () => {
      const validRequest = {
        query: 'privacy law cases'
      };

      const result = LegalRequestSchema.safeParse(validRequest);
      expect(result.success).toBe(true);
      
      if (result.success) {
        expect(result.data.query).toBe('privacy law cases');
        expect(result.data.parameters).toEqual({});
      }
    });

    it('should validate request with parameters', () => {
      const validRequest = {
        query: 'GDPR violations',
        parameters: {
          court: 'Hoge Raad',
          importance: 'high'
        }
      };

      const result = LegalRequestSchema.safeParse(validRequest);
      expect(result.success).toBe(true);
      
      if (result.success) {
        expect(result.data.query).toBe('GDPR violations');
        expect(result.data.parameters).toEqual({
          court: 'Hoge Raad',
          importance: 'high'
        });
      }
    });

    it('should reject empty query', () => {
      const invalidRequest = { query: '' };
      
      const result = LegalRequestSchema.safeParse(invalidRequest);
      expect(result.success).toBe(false);
      
      if (!result.success) {
        expect(result.error.issues[0].message).toBe('Query is required');
      }
    });

    it('should trim whitespace from query', () => {
      const request = { query: '  privacy law  ' };
      
      const result = LegalRequestSchema.safeParse(request);
      expect(result.success).toBe(true);
      
      if (result.success) {
        expect(result.data.query).toBe('privacy law');
      }
    });
  });

  describe('CaseLawSearchSchema', () => {
    it('should validate complete search request', () => {
      const validSearch = {
        query: 'privacy violations',
        court: 'Hoge Raad',
        dateFrom: '2023-01-01',
        dateTo: '2023-12-31',
        maxResults: 25,
        subject: ['privacy', 'GDPR']
      };

      const result = CaseLawSearchSchema.safeParse(validSearch);
      expect(result.success).toBe(true);
      
      if (result.success) {
        expect(result.data.court).toBe('Hoge Raad');
        expect(result.data.maxResults).toBe(25);
        expect(result.data.subject).toEqual(['privacy', 'GDPR']);
      }
    });

    it('should validate with default maxResults', () => {
      const search = { query: 'contract law' };
      
      const result = CaseLawSearchSchema.safeParse(search);
      expect(result.success).toBe(true);
      
      if (result.success) {
        expect(result.data.maxResults).toBe(10);
      }
    });

    it('should reject invalid date format', () => {
      const invalidSearch = {
        query: 'test',
        dateFrom: '2023/01/01'  // Invalid format
      };
      
      const result = CaseLawSearchSchema.safeParse(invalidSearch);
      expect(result.success).toBe(false);
      
      if (!result.success) {
        expect(result.error.issues[0].message).toBe('Invalid date format');
      }
    });

    it('should reject maxResults out of bounds', () => {
      const invalidSearch = {
        query: 'test',
        maxResults: 100  // Too high
      };
      
      const result = CaseLawSearchSchema.safeParse(invalidSearch);
      expect(result.success).toBe(false);
    });
  });

  describe('GDPRComplianceSchema', () => {
    it('should validate complete GDPR request', () => {
      const validGDPR = {
        dataTypes: ['email', 'name', 'ip-address'],
        processingPurpose: 'Customer communication and support',
        legalBasis: 'legitimate-interest',
        dataRetention: '24 months',
        thirdPartySharing: true
      };

      const result = GDPRComplianceSchema.safeParse(validGDPR);
      expect(result.success).toBe(true);
      
      if (result.success) {
        expect(result.data.dataTypes).toHaveLength(3);
        expect(result.data.thirdPartySharing).toBe(true);
      }
    });

    it('should validate with defaults', () => {
      const minimalGDPR = {
        dataTypes: ['email'],
        processingPurpose: 'Newsletter'
      };

      const result = GDPRComplianceSchema.safeParse(minimalGDPR);
      expect(result.success).toBe(true);
      
      if (result.success) {
        expect(result.data.thirdPartySharing).toBe(false);
      }
    });

    it('should reject empty dataTypes array', () => {
      const invalidGDPR = {
        dataTypes: [],
        processingPurpose: 'Test'
      };

      const result = GDPRComplianceSchema.safeParse(invalidGDPR);
      expect(result.success).toBe(false);
      
      if (!result.success) {
        expect(result.error.issues[0].message).toBe('At least one data type is required');
      }
    });

    it('should reject empty processing purpose', () => {
      const invalidGDPR = {
        dataTypes: ['email'],
        processingPurpose: ''
      };

      const result = GDPRComplianceSchema.safeParse(invalidGDPR);
      expect(result.success).toBe(false);
      
      if (!result.success) {
        expect(result.error.issues[0].message).toBe('Processing purpose is required');
      }
    });
  });

  describe('AIActClassificationSchema', () => {
    it('should validate complete AI system description', () => {
      const validAI = {
        systemDescription: 'AI-powered recruitment tool that analyzes CVs and ranks candidates',
        applicationDomain: 'recruitment',
        userImpact: 'High - affects hiring decisions',
        dataTypes: ['cv-text', 'personal-data', 'work-history']
      };

      const result = AIActClassificationSchema.safeParse(validAI);
      expect(result.success).toBe(true);
      
      if (result.success) {
        expect(result.data.systemDescription).toContain('recruitment tool');
        expect(result.data.applicationDomain).toBe('recruitment');
        expect(result.data.dataTypes).toHaveLength(3);
      }
    });

    it('should validate minimal AI system', () => {
      const minimalAI = {
        systemDescription: 'Simple chatbot for customer support',
        applicationDomain: 'customer-service'
      };

      const result = AIActClassificationSchema.safeParse(minimalAI);
      expect(result.success).toBe(true);
    });

    it('should reject short system description', () => {
      const invalidAI = {
        systemDescription: 'AI tool',  // Too short
        applicationDomain: 'finance'
      };

      const result = AIActClassificationSchema.safeParse(invalidAI);
      expect(result.success).toBe(false);
      
      if (!result.success) {
        expect(result.error.issues[0].message).toBe('System description too short');
      }
    });

    it('should reject empty application domain', () => {
      const invalidAI = {
        systemDescription: 'Advanced AI system for data analysis',
        applicationDomain: ''
      };

      const result = AIActClassificationSchema.safeParse(invalidAI);
      expect(result.success).toBe(false);
      
      if (!result.success) {
        expect(result.error.issues[0].message).toBe('Application domain is required');
      }
    });
  });

  describe('RiskAnalysisSchema', () => {
    it('should validate complete risk analysis', () => {
      const validRisk = {
        businessDescription: 'E-commerce platform with AI recommendations',
        dataProcessing: {
          userProfiles: true,
          paymentData: true,
          behaviorTracking: true
        },
        aiComponents: true,
        targetMarket: 'EU'
      };

      const result = RiskAnalysisSchema.safeParse(validRisk);
      expect(result.success).toBe(true);
      
      if (result.success) {
        expect(result.data.aiComponents).toBe(true);
        expect(result.data.targetMarket).toBe('EU');
      }
    });

    it('should validate with defaults', () => {
      const minimalRisk = {
        businessDescription: 'Simple static website for local business'
      };

      const result = RiskAnalysisSchema.safeParse(minimalRisk);
      expect(result.success).toBe(true);
      
      if (result.success) {
        expect(result.data.aiComponents).toBe(false);
      }
    });

    it('should reject short business description', () => {
      const invalidRisk = {
        businessDescription: 'Website'  // Too short
      };

      const result = RiskAnalysisSchema.safeParse(invalidRisk);
      expect(result.success).toBe(false);
      
      if (!result.success) {
        expect(result.error.issues[0].message).toBe('Business description too short');
      }
    });
  });

  describe('DPAUpdatesSchema', () => {
    it('should validate with specific category', () => {
      const validDPA = {
        category: 'fines' as const,
        limit: 5
      };

      const result = DPAUpdatesSchema.safeParse(validDPA);
      expect(result.success).toBe(true);
      
      if (result.success) {
        expect(result.data.category).toBe('fines');
      }
    });

    it('should validate with default category', () => {
      const minimalDPA = {};

      const result = DPAUpdatesSchema.safeParse(minimalDPA);
      expect(result.success).toBe(true);
      
      if (result.success) {
        expect(result.data.category).toBe('all');
      }
    });

    it('should reject invalid category', () => {
      const invalidDPA = {
        category: 'invalid-category'
      };

      const result = DPAUpdatesSchema.safeParse(invalidDPA);
      expect(result.success).toBe(false);
    });
  });

  describe('Edge Cases', () => {
    it('should handle null and undefined values gracefully', () => {
      const result1 = LegalRequestSchema.safeParse(null);
      const result2 = LegalRequestSchema.safeParse(undefined);
      
      expect(result1.success).toBe(false);
      expect(result2.success).toBe(false);
    });

    it('should handle non-object values', () => {
      const result1 = GDPRComplianceSchema.safeParse('not an object');
      const result2 = GDPRComplianceSchema.safeParse(123);
      
      expect(result1.success).toBe(false);
      expect(result2.success).toBe(false);
    });

    it('should preserve unknown fields in parameters', () => {
      const request = {
        query: 'test',
        parameters: {
          customField: 'custom value',
          nestedObject: { a: 1, b: 2 }
        }
      };

      const result = LegalRequestSchema.safeParse(request);
      expect(result.success).toBe(true);
      
      if (result.success) {
        expect(result.data.parameters.customField).toBe('custom value');
        expect(result.data.parameters.nestedObject).toEqual({ a: 1, b: 2 });
      }
    });
  });
});