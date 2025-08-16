/**
 * Jest Test Setup for Dutch Legal MCP
 * Global test configuration and mocks
 */

// Mock console methods to reduce test noise
const originalConsole = { ...console };

beforeAll(() => {
  // Mock console.error to prevent noise in tests
  console.error = jest.fn();
  console.warn = jest.fn();
});

afterAll(() => {
  // Restore original console
  Object.assign(console, originalConsole);
});

// Global test timeout
jest.setTimeout(10000);

// Mock environment variables
process.env.NODE_ENV = 'test';

// Global test utilities - Jest matcher extensions
interface CustomMatchers<R = unknown> {
  toBeValidECLI(): R;
  toHaveGDPRCompliance(): R;
}

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace jest {
    interface Expect extends CustomMatchers {}
    interface Matchers<R> extends CustomMatchers<R> {}
    interface InverseAsymmetricMatchers extends CustomMatchers {}
  }
}

// Custom Jest matchers
expect.extend({
  toBeValidECLI(received: string) {
    const ecliPattern = /^ECLI:[A-Z]{2}:[A-Z0-9]+:\d{4}:[A-Z0-9]+$/;
    const pass = ecliPattern.test(received);
    
    return {
      message: () => 
        pass
          ? `Expected ${received} not to be a valid ECLI`
          : `Expected ${received} to be a valid ECLI (format: ECLI:NL:HR:2023:123)`,
      pass,
    };
  },
  
  toHaveGDPRCompliance(received: unknown) {
    const obj = received as Record<string, unknown>;
    const hasScore = typeof obj?.score === 'number';
    const hasStatus = typeof obj?.status === 'string';
    const hasViolations = Array.isArray(obj?.violations);
    const pass = hasScore && hasStatus && hasViolations;
    
    return {
      message: () => 
        pass
          ? `Expected object not to have GDPR compliance structure`
          : `Expected object to have GDPR compliance structure (score, status, violations)`,
      pass,
    };
  },
});

export {};