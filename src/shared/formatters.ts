/**
 * Shared Response Formatters
 * Pure functions for consistent response formatting
 */

import type { CourtCase, ComplianceResult, RiskAssessment } from '../domain/entities/index.js';
import type { DPAUpdate } from '../domain/services/index.js';

// Generic MCP response wrapper
export interface MCPResponse {
  content: Array<{
    type: 'text';
    text: string;
  }>;
}

// Format error response
export const formatError = (message: string): MCPResponse => ({
  content: [{
    type: 'text',
    text: `Error: ${message}`,
  }],
});

// Format court cases for display
export const formatCourtCases = (cases: readonly CourtCase[]): string => {
  if (cases.length === 0) {
    return 'No court decisions found. Try broader search terms or different keywords.';
  }

  let result = `# Court Case Law Results\n\n`;
  result += `⚖️ **Disclaimer:** User is responsible for compliance with court data API terms of service.\n\n`;
  result += `**Found:** ${cases.length} decisions\n\n`;

  cases.forEach((case_, index) => {
    result += `## ${index + 1}. ${case_.title}\n\n`;
    result += `**ECLI:** ${case_.ecli}\n`;
    result += `**Court:** ${case_.court}\n`;
    result += `**Date:** ${case_.date}\n`;
    result += `**Precedent Value:** ${case_.precedentValue.toUpperCase()}\n`;
    
    if (case_.subjects.length > 0) {
      result += `**Legal Domains:** ${case_.subjects.join(', ')}\n`;
    }
    
    if (case_.summary) {
      result += `**Summary:** ${case_.summary}\n`;
    }
    
    result += `**URL:** [View Decision](${case_.url})\n\n`;
    
    if (index < cases.length - 1) {
      result += `---\n\n`;
    }
  });

  return result;
};

// Format GDPR compliance result
export const formatGDPRResult = (result: ComplianceResult): string => {
  let output = `# GDPR Compliance Assessment\n\n`;
  output += `**Risk Level:** ${result.riskLevel.toUpperCase()}\n`;
  output += `**Compliance Score:** ${result.score}/100\n\n`;

  if (result.violations.length > 0) {
    output += `## ⚠️ Violations Found\n\n`;
    result.violations.forEach((violation, index) => {
      output += `${index + 1}. **${violation.code}** (${violation.severity})\n`;
      output += `   ${violation.description}\n`;
      output += `   *Remedy:* ${violation.remedy}\n\n`;
    });
  }

  if (result.recommendations.length > 0) {
    output += `## 🔧 Recommendations\n\n`;
    result.recommendations.forEach(rec => {
      output += `- ${rec}\n`;
    });
    output += `\n`;
  }

  return output;
};

// Format AI Act classification
export const formatAIActResult = (result: ComplianceResult): string => {
  const riskCategory = result.metadata.riskCategory as string || 'unknown';
  
  let output = `# EU AI Act Classification\n\n`;
  output += `**Risk Category:** ${riskCategory.toUpperCase()}\n`;
  output += `**Compliance Score:** ${result.score}/100\n\n`;

  switch (riskCategory) {
    case 'unacceptable':
      output += `🚫 **PROHIBITED** - This AI system is banned under the EU AI Act.\n\n`;
      break;
    case 'high':
      output += `⚠️ **HIGH RISK** - Strict requirements apply before market placement.\n\n`;
      break;
    case 'limited':
      output += `⚡ **LIMITED RISK** - Transparency obligations apply.\n\n`;
      break;
    case 'minimal':
      output += `✅ **MINIMAL RISK** - Few regulatory requirements.\n\n`;
      break;
  }

  if (result.recommendations.length > 0) {
    output += `## 📋 Compliance Requirements\n\n`;
    result.recommendations.forEach(req => {
      output += `- ${req}\n`;
    });
  }

  return output;
};

// Format risk assessment
export const formatRiskAssessment = (assessment: RiskAssessment): string => {
  let output = `# Legal Risk Analysis\n\n`;
  output += `**Overall Risk:** ${assessment.overallRisk.toUpperCase()}\n\n`;

  output += `## 🔒 GDPR Risk\n`;
  output += `- **Level:** ${assessment.gdprRisk.riskLevel}\n`;
  output += `- **Score:** ${assessment.gdprRisk.score}/100\n\n`;

  if (assessment.aiActRisk) {
    output += `## 🤖 AI Act Risk\n`;
    output += `- **Level:** ${assessment.aiActRisk.riskLevel}\n`;
    output += `- **Score:** ${assessment.aiActRisk.score}/100\n\n`;
  }

  if (assessment.urgentActions.length > 0) {
    output += `## ⚡ Urgent Actions\n\n`;
    assessment.urgentActions.forEach(action => {
      output += `- ${action}\n`;
    });
  }

  return output;
};

// Format DPA updates - PLACEHOLDER/ROADMAP FEATURE
export const formatDPAUpdates = (updates: readonly DPAUpdate[]): string => {
  let output = `# Dutch DPA Updates (SAMPLE DATA)\n\n`;
  output += `⚠️ **Note:** This feature currently returns mock data for development purposes.\n\n`;
  output += `**Sample Updates Found:** ${updates.length}\n\n`;

  updates.forEach((update, index) => {
    const impactIcon = update.impact === 'high' ? '🔥' : 
                      update.impact === 'medium' ? '⚠️' : 'ℹ️';
    
    output += `## ${index + 1}. ${update.title}\n\n`;
    output += `**Date:** ${update.date}\n`;
    output += `**Category:** ${update.category}\n`;
    output += `**Impact:** ${impactIcon} ${update.impact.toUpperCase()}\n\n`;
    output += `${update.summary}\n\n`;
    output += `[Read more](${update.url})\n\n`;
    
    if (index < updates.length - 1) {
      output += `---\n\n`;
    }
  });

  return output;
};

// Compose formatters with error handling
export const safeFormat = <T>(formatter: (data: T) => string) => 
  (data: T): MCPResponse => {
    try {
      return {
        content: [{
          type: 'text',
          text: formatter(data),
        }],
      };
    } catch (error) {
      return formatError(error instanceof Error ? error.message : 'Unknown formatting error');
    }
  };