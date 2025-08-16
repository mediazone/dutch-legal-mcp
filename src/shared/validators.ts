/**
 * Shared Validation Logic
 * Zod schemas for type-safe validation
 */

import { z } from 'zod';

// Base request schema
export const LegalRequestSchema = z.object({
  query: z.string().min(1, 'Query is required').trim(),
  parameters: z.record(z.unknown()).optional().default({}),
});

// Case law search schema
export const CaseLawSearchSchema = LegalRequestSchema.extend({
  court: z.string().optional(),
  dateFrom: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date format').optional(),
  dateTo: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date format').optional(),
  maxResults: z.number().min(1).max(50).optional().default(10),
  subject: z.array(z.string()).optional(),
  baseUrl: z.string().url('Invalid URL format').optional(),
});

// GDPR compliance schema
export const GDPRComplianceSchema = z.object({
  dataTypes: z.array(z.string()).min(1, 'At least one data type is required'),
  processingPurpose: z.string().min(1, 'Processing purpose is required'),
  legalBasis: z.string().optional(),
  dataRetention: z.string().optional(),
  thirdPartySharing: z.boolean().optional().default(false),
});

// AI Act classification schema
export const AIActClassificationSchema = z.object({
  systemDescription: z.string().min(10, 'System description too short'),
  applicationDomain: z.string().min(1, 'Application domain is required'),
  userImpact: z.string().optional(),
  dataTypes: z.array(z.string()).optional(),
});

// Risk analysis schema
export const RiskAnalysisSchema = z.object({
  businessDescription: z.string().min(10, 'Business description too short'),
  dataProcessing: z.record(z.unknown()).optional(),
  aiComponents: z.boolean().optional().default(false),
  targetMarket: z.string().optional(),
});

// DPA updates schema
export const DPAUpdatesSchema = z.object({
  category: z.enum(['all', 'guidance', 'fines', 'rulings', 'updates']).optional().default('all'),
  limit: z.number().min(1).max(20).optional().default(10),
});

// Validation helper functions
export const validate = <T>(schema: z.ZodSchema<T>) => 
  (data: unknown): T => schema.parse(data);

export const safeValidate = <T>(schema: z.ZodSchema<T>) => 
  (data: unknown): { success: true; data: T } | { success: false; error: string } => {
    const result = schema.safeParse(data);
    return result.success 
      ? { success: true, data: result.data }
      : { success: false, error: result.error.issues.map(i => i.message).join(', ') };
  };