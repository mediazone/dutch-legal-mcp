/**
 * Centralized Error Handling
 * Custom error types and error handler decorators
 */

// Custom error types
export class ValidationError extends Error {
  constructor(message: string, public field?: string) {
    super(message);
    this.name = 'ValidationError';
  }
}

export class APIError extends Error {
  constructor(message: string, public statusCode?: number, public response?: unknown) {
    super(message);
    this.name = 'APIError';
  }
}

export class ServiceError extends Error {
  constructor(message: string, public service: string) {
    super(message);
    this.name = 'ServiceError';
  }
}

// Error handler decorator
export function withErrorHandling<T extends unknown[], R>(
  fn: (...args: T) => Promise<R>
): (...args: T) => Promise<R> {
  return async (...args: T): Promise<R> => {
    try {
      return await fn(...args);
    } catch (error) {
      if (error instanceof ValidationError || 
          error instanceof APIError || 
          error instanceof ServiceError) {
        throw error; // Re-throw known errors
      }
      
      // Wrap unknown errors
      throw new ServiceError(
        error instanceof Error ? error.message : 'Unknown error occurred',
        'UnknownService'
      );
    }
  };
}

// Result type for safer error handling
export type Result<T, E = Error> = 
  | { success: true; data: T }
  | { success: false; error: E };

// Safe execution helper
export async function safeExecute<T>(
  fn: () => Promise<T>
): Promise<Result<T>> {
  try {
    const data = await fn();
    return { success: true, data };
  } catch (error) {
    return { 
      success: false, 
      error: error instanceof Error ? error : new Error(String(error))
    };
  }
}

// Error to user-friendly message converter
export function errorToMessage(error: Error): string {
  if (error instanceof ValidationError) {
    return `Validation error: ${error.message}`;
  }
  
  if (error instanceof APIError) {
    return `API error: ${error.message}`;
  }
  
  if (error instanceof ServiceError) {
    return `Service error (${error.service}): ${error.message}`;
  }
  
  return `An unexpected error occurred: ${error.message}`;
}