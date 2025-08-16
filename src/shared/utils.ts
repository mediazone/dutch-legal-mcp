/**
 * Pure Utility Functions
 * Functional programming utilities for data transformation
 */

// Function composition
export const pipe = <T>(...fns: Array<(arg: T) => T>) => 
  (value: T): T => fns.reduce((acc, fn) => fn(acc), value);

// Curried validation
export const validateField = (fieldName: string) => 
  (validator: (value: unknown) => boolean) => 
  (errorMessage: string) => 
  (value: unknown): { valid: boolean; error?: string } => {
    const isValid = validator(value);
    return isValid 
      ? { valid: true }
      : { valid: false, error: `${fieldName}: ${errorMessage}` };
  };

// Safe property access
export const prop = <T, K extends keyof T>(key: K) => 
  (obj: T): T[K] => obj[key];

export const safeProp = <T, K extends keyof T>(key: K) => 
  (obj: T | null | undefined): T[K] | undefined => obj?.[key];

// Array utilities
export const isEmpty = <T>(arr: readonly T[]): boolean => arr.length === 0;

export const head = <T>(arr: readonly T[]): T | undefined => arr[0];

export const tail = <T>(arr: readonly T[]): readonly T[] => arr.slice(1);

export const last = <T>(arr: readonly T[]): T | undefined => arr[arr.length - 1];

export const unique = <T>(arr: readonly T[]): T[] => [...new Set(arr)];

export const groupBy = <T, K extends PropertyKey>(
  keyFn: (item: T) => K
) => (arr: readonly T[]): Record<K, T[]> => {
  return arr.reduce((groups, item) => {
    const key = keyFn(item);
    (groups[key] ??= []).push(item);
    return groups;
  }, {} as Record<K, T[]>);
};

// String utilities
export const capitalize = (str: string): string =>
  str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();

export const truncate = (length: number) => (str: string): string =>
  str.length <= length ? str : `${str.slice(0, length - 3)}...`;

export const slugify = (str: string): string =>
  str.toLowerCase()
     .replace(/[^a-z0-9]+/g, '-')
     .replace(/^-|-$/g, '');

// Date utilities
export const formatDate = (date: Date | string): string => {
  const d = new Date(date);
  return d.toISOString().split('T')[0]; // YYYY-MM-DD
};

export const isValidDate = (date: string): boolean => {
  const regex = /^\d{4}-\d{2}-\d{2}$/;
  return regex.test(date) && !isNaN(Date.parse(date));
};

// Object utilities
export const pick = <T extends Record<string, unknown>, K extends keyof T>(keys: readonly K[]) => 
  (obj: T): Pick<T, K> => {
    const result = {} as Pick<T, K>;
    keys.forEach(key => {
      if (key in obj) {
        result[key] = obj[key];
      }
    });
    return result;
  };

export const omit = <T, K extends keyof T>(keys: readonly K[]) => 
  (obj: T): Omit<T, K> => {
    const result = { ...obj };
    keys.forEach(key => delete result[key]);
    return result;
  };

// Functional predicates
export const isNotEmpty = (str: string): boolean => str.trim().length > 0;

export const isEmailValid = (email: string): boolean => 
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

export const isUrlValid = (url: string): boolean => {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
};

// Async utilities
export const delay = (ms: number): Promise<void> => 
  new Promise(resolve => setTimeout(resolve, ms));

export const timeout = <T>(promise: Promise<T>, ms: number): Promise<T> =>
  Promise.race([
    promise,
    delay(ms).then(() => Promise.reject(new Error(`Operation timed out after ${ms}ms`))),
  ]);

// Safe JSON parsing
export const safeJsonParse = <T>(json: string): T | null => {
  try {
    return JSON.parse(json) as T;
  } catch {
    return null;
  }
};

// Memoization for pure functions
export const memoize = <T extends unknown[], R>(fn: (...args: T) => R): (...args: T) => R => {
  const cache = new Map<string, R>();
  
  return (...args: T): R => {
    const key = JSON.stringify(args);
    
    if (cache.has(key)) {
      return cache.get(key)!;
    }
    
    const result = fn(...args);
    cache.set(key, result);
    return result;
  };
};