/**
 * Unit Tests for Dependency Injection Container
 * Testing the core DI functionality
 */

import { DIContainer, TOKENS } from '../../shared/container.js';

describe('DIContainer', () => {
  let container: DIContainer;

  beforeEach(() => {
    container = DIContainer.getInstance();
    container.clear();
  });

  afterEach(() => {
    container.clear();
  });

  describe('Singleton Pattern', () => {
    it('should return the same instance', () => {
      const container1 = DIContainer.getInstance();
      const container2 = DIContainer.getInstance();
      
      expect(container1).toBe(container2);
    });
  });

  describe('Service Registration', () => {
    it('should register a constructor service', () => {
      class TestService {
        name = 'test';
      }

      container.register('test-service', TestService);
      const service = container.resolve<TestService>('test-service');
      
      expect(service).toBeInstanceOf(TestService);
      expect(service.name).toBe('test');
    });

    it('should register a factory service', () => {
      const factory = () => ({ created: true, timestamp: Date.now() });
      
      container.register('factory-service', factory);
      const service = container.resolve<ReturnType<typeof factory>>('factory-service');
      
      expect(service.created).toBe(true);
      expect(service.timestamp).toBeGreaterThan(0);
    });

    it('should register an instance service', () => {
      const instance = { type: 'instance', id: 123 };
      
      container.register('instance-service', instance);
      const service = container.resolve<typeof instance>('instance-service');
      
      expect(service).toBe(instance);
      expect(service.type).toBe('instance');
      expect(service.id).toBe(123);
    });

    it('should register services with symbol tokens', () => {
      const TEST_TOKEN = Symbol('TestToken');
      class TestService {
        value = 'symbol-test';
      }

      container.register(TEST_TOKEN, TestService);
      const service = container.resolve<TestService>(TEST_TOKEN);
      
      expect(service.value).toBe('symbol-test');
    });
  });

  describe('Service Resolution', () => {
    it('should resolve registered services', () => {
      class MockService {
        getData() {
          return 'mock-data';
        }
      }

      container.register('mock', MockService);
      const service = container.resolve<MockService>('mock');
      
      expect(service.getData()).toBe('mock-data');
    });

    it('should return cached instances (singleton behavior)', () => {
      class CounterService {
        private static instanceCount = 0;
        public instanceId: number;

        constructor() {
          CounterService.instanceCount++;
          this.instanceId = CounterService.instanceCount;
        }

        static getInstanceCount() {
          return CounterService.instanceCount;
        }
      }

      container.register('counter', CounterService);
      
      const service1 = container.resolve<CounterService>('counter');
      const service2 = container.resolve<CounterService>('counter');
      
      expect(service1).toBe(service2);
      expect(service1.instanceId).toBe(service2.instanceId);
      expect(CounterService.getInstanceCount()).toBe(1);
    });

    it('should throw error for unregistered services', () => {
      expect(() => {
        container.resolve('non-existent');
      }).toThrow('Service not found: non-existent');
    });

    it('should throw error for unregistered symbol tokens', () => {
      const UNKNOWN_TOKEN = Symbol('Unknown');
      
      expect(() => {
        container.resolve(UNKNOWN_TOKEN);
      }).toThrow('Service not found: Symbol(Unknown)');
    });
  });

  describe('Service Tokens', () => {
    it('should have all required tokens defined', () => {
      expect(TOKENS.COMPLIANCE_SERVICE).toBeDefined();
      expect(TOKENS.CASE_LAW_SERVICE).toBeDefined();
      expect(TOKENS.RISK_ANALYSIS_SERVICE).toBeDefined();
      expect(TOKENS.DPA_SERVICE).toBeDefined();
      expect(TOKENS.API_CLIENT).toBeDefined();
      expect(TOKENS.TOOL_REGISTRY).toBeDefined();
    });

    it('should use symbols for type safety', () => {
      expect(typeof TOKENS.COMPLIANCE_SERVICE).toBe('symbol');
      expect(typeof TOKENS.CASE_LAW_SERVICE).toBe('symbol');
      expect(typeof TOKENS.RISK_ANALYSIS_SERVICE).toBe('symbol');
    });
  });

  describe('Container Clear', () => {
    it('should clear all services and instances', () => {
      class TestService {
        name = 'test';
      }

      container.register('test', TestService);
      const service1 = container.resolve<TestService>('test');
      
      expect(service1.name).toBe('test');
      
      container.clear();
      
      expect(() => {
        container.resolve('test');
      }).toThrow('Service not found: test');
    });

    it('should allow re-registration after clear', () => {
      class Service1 {
        version = 1;
      }
      
      class Service2 {
        version = 2;
      }

      container.register('service', Service1);
      const s1 = container.resolve<Service1>('service');
      expect(s1.version).toBe(1);

      container.clear();
      container.register('service', Service2);
      const s2 = container.resolve<Service2>('service');
      expect(s2.version).toBe(2);
    });
  });

  describe('Complex Service Dependencies', () => {
    it('should handle services with constructor parameters', () => {
      class DatabaseService {
        public connectionString: string;
        
        constructor() {
          this.connectionString = 'default-connection';
        }
      }

      class ApiService {
        public baseUrl: string;
        
        constructor() {
          this.baseUrl = 'https://api.example.com';
        }
      }

      container.register('database', DatabaseService);
      container.register('api', ApiService);
      
      const db = container.resolve<DatabaseService>('database');
      const api = container.resolve<ApiService>('api');
      
      expect(db.connectionString).toBe('default-connection');
      expect(api.baseUrl).toBe('https://api.example.com');
    });
  });
});