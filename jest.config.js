/**
 * Jest Configuration for Dutch Legal MCP
 * TypeScript + ES Modules support
 */
export default {
  // Use ts-jest preset for TypeScript
  preset: 'ts-jest/presets/default-esm',
  
  // Use Node.js test environment
  testEnvironment: 'node',
  
  // Enable ES modules
  extensionsToTreatAsEsm: ['.ts'],
  
  // Module name mapping for ES modules
  moduleNameMapper: {
    '^(\\.{1,2}/.*)\\.js$': '$1',
  },
  
  // Transform configuration
  transform: {
    '^.+\\.ts$': ['ts-jest', {
      useESM: true,
      tsconfig: {
        module: 'ESNext',
        target: 'ES2022'
      }
    }]
  },
  
  // Test file patterns
  testMatch: [
    '**/__tests__/**/*.(test|spec).(ts|js)',
    '**/*.(test|spec).(ts|js)'
  ],
  
  // Ignore patterns
  testPathIgnorePatterns: [
    '/node_modules/',
    '/dist/'
  ],
  
  // Coverage configuration
  collectCoverage: true,
  coverageDirectory: 'coverage',
  coverageReporters: [
    'text',
    'lcov',
    'html'
  ],
  
  // Coverage thresholds - Start conservative for v2.0.0
  coverageThreshold: {
    global: {
      branches: 0,
      functions: 0,
      lines: 1,
      statements: 1
    }
  },
  
  // Files to collect coverage from
  collectCoverageFrom: [
    'src/**/*.ts',
    '!src/**/*.d.ts',
    '!src/**/__tests__/**',
    '!src/**/*.test.ts',
    '!src/**/*.spec.ts'
  ],
  
  // Setup files
  setupFilesAfterEnv: ['<rootDir>/src/__tests__/setup.ts'],
  
  // Module directories
  moduleDirectories: ['node_modules', 'src'],
  
  // Clear mocks between tests
  clearMocks: true,
  
  // Verbose output
  verbose: true
};