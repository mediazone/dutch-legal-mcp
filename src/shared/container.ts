/**
 * Dependency Injection Container
 * Simple, lightweight DI for clean architecture
 */

type Constructor<T = Record<string, never>> = new (...args: unknown[]) => T;
type ServiceFactory<T> = () => T;
type ServiceDefinition<T> = Constructor<T> | ServiceFactory<T> | T;

export class DIContainer {
  private static instance: DIContainer;
  private services = new Map<string | symbol, ServiceDefinition<unknown>>();
  private instances = new Map<string | symbol, unknown>();

  static getInstance(): DIContainer {
    if (!DIContainer.instance) {
      DIContainer.instance = new DIContainer();
    }
    return DIContainer.instance;
  }

  register<T>(token: string | symbol, definition: ServiceDefinition<T>): void {
    this.services.set(token, definition);
  }

  resolve<T>(token: string | symbol): T {
    // Return cached instance if exists
    if (this.instances.has(token)) {
      return this.instances.get(token) as T;
    }

    const definition = this.services.get(token);
    if (!definition) {
      throw new Error(`Service not found: ${String(token)}`);
    }

    let instance: T;

    if (typeof definition === 'function') {
      // Check if it's a constructor or factory
      if (definition.prototype) {
        instance = new (definition as Constructor<T>)();
      } else {
        instance = (definition as ServiceFactory<T>)();
      }
    } else {
      // It's already an instance
      instance = definition as T;
    }

    // Cache the instance (singleton by default)
    this.instances.set(token, instance);
    return instance;
  }

  clear(): void {
    this.services.clear();
    this.instances.clear();
  }
}

// Service tokens (symbols for type safety)
export const TOKENS = {
  COMPLIANCE_SERVICE: Symbol('ComplianceService'),
  CASE_LAW_SERVICE: Symbol('CaseLawService'),
  RISK_ANALYSIS_SERVICE: Symbol('RiskAnalysisService'),
  DPA_SERVICE: Symbol('DPAService'),
  API_CLIENT: Symbol('ApiClient'),
  TOOL_REGISTRY: Symbol('ToolRegistry'),
} as const;