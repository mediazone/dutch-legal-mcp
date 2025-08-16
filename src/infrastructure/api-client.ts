/**
 * Generic API Client
 * Consolidates all external API calls with error handling
 */

import axios, { AxiosInstance, AxiosRequestConfig } from 'axios';
import { parseString as parseXML } from 'xml2js';
import { promisify } from 'util';
import { APIError } from '../shared/errors.js';
import { HTTP_CONFIG, API_ENDPOINTS } from '../shared/constants.js';
import { timeout } from '../shared/utils.js';

// Simple cache interface
interface CacheEntry {
  data: any;
  timestamp: number;
  etag?: string;
}

interface RetryOptions {
  maxRetries: number;
  baseDelay: number;
  maxDelay: number;
}

const parseXMLAsync = promisify(parseXML);

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  metadata?: {
    timestamp: string;
    total?: number;
  };
}

export class ApiClient {
  private client: AxiosInstance;
  private cache = new Map<string, CacheEntry>();
  private readonly CACHE_TTL = 5 * 60 * 1000; // 5 minutes
  private readonly retryOptions: RetryOptions = {
    maxRetries: 3,
    baseDelay: 1000,
    maxDelay: 5000
  };

  constructor(baseURL?: string) {
    this.client = axios.create({
      baseURL,
      timeout: HTTP_CONFIG.TIMEOUT,
      headers: {
        ...HTTP_CONFIG.HEADERS,
        'User-Agent': 'Dutch-Legal-MCP/2.0.5 (+https://github.com/mediazone/dutch-legal-mcp)'
      },
    });

    this.setupInterceptors();
  }

  private setupInterceptors(): void {
    // Request interceptor
    this.client.interceptors.request.use(
      (config) => {
        console.log(`API Request: ${config.method?.toUpperCase()} ${config.url}`);
        return config;
      },
      (error) => Promise.reject(error)
    );

    // Response interceptor  
    this.client.interceptors.response.use(
      (response) => response,
      (error) => {
        const message = error.response?.data?.message || error.message || 'API request failed';
        const statusCode = error.response?.status;
        throw new APIError(message, statusCode, error.response?.data);
      }
    );
  }

  private async retryRequest<T>(
    requestFn: () => Promise<T>,
    retryCount = 0
  ): Promise<T> {
    try {
      return await requestFn();
    } catch (error: any) {
      if (retryCount >= this.retryOptions.maxRetries) {
        throw error;
      }

      // Retry on network errors or 5xx status codes
      const shouldRetry = !error.response || 
        (error.response.status >= 500 && error.response.status <= 599) ||
        error.response.status === 429;

      if (!shouldRetry) {
        throw error;
      }

      const delay = Math.min(
        this.retryOptions.baseDelay * Math.pow(2, retryCount),
        this.retryOptions.maxDelay
      );

      console.log(`Retrying request in ${delay}ms (attempt ${retryCount + 1}/${this.retryOptions.maxRetries})`);
      await new Promise(resolve => setTimeout(resolve, delay));

      return this.retryRequest(requestFn, retryCount + 1);
    }
  }

  private getCacheKey(url: string, config?: AxiosRequestConfig): string {
    return `${url}-${JSON.stringify(config?.params || {})}`;
  }

  private getCachedResponse<T>(cacheKey: string): ApiResponse<T> | null {
    const entry = this.cache.get(cacheKey);
    if (!entry) return null;

    const isExpired = Date.now() - entry.timestamp > this.CACHE_TTL;
    if (isExpired) {
      this.cache.delete(cacheKey);
      return null;
    }

    return {
      success: true,
      data: entry.data,
      metadata: {
        timestamp: new Date(entry.timestamp).toISOString(),
      },
    };
  }

  private setCachedResponse<T>(cacheKey: string, data: T, etag?: string): void {
    this.cache.set(cacheKey, {
      data,
      timestamp: Date.now(),
      etag
    });
  }

  async get<T>(url: string, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    try {
      const cacheKey = this.getCacheKey(url, config);
      const cached = this.getCachedResponse<T>(cacheKey);
      
      // Check cache first
      if (cached) {
        return cached;
      }

      const response = await this.retryRequest(() =>
        timeout(this.client.get<T>(url, config), HTTP_CONFIG.TIMEOUT)
      );

      const etag = response.headers.etag;
      this.setCachedResponse(cacheKey, response.data, etag);

      return {
        success: true,
        data: response.data,
        metadata: {
          timestamp: new Date().toISOString(),
        },
      };
    } catch (error) {
      return this.handleError(error as Error);
    }
  }

  async post<T, D = unknown>(url: string, data?: D, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    try {
      const response = await timeout(
        this.client.post<T>(url, data, config),
        HTTP_CONFIG.TIMEOUT
      );

      return {
        success: true,
        data: response.data,
        metadata: {
          timestamp: new Date().toISOString(),
        },
      };
    } catch (error) {
      return this.handleError(error as Error);
    }
  }

  async getXML<T>(url: string, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    try {
      const response = await this.get<string>(url, {
        ...config,
        headers: { ...config?.headers, Accept: 'application/xml' },
      });

      if (!response.success || !response.data) {
        throw new Error('Failed to fetch XML data');
      }

      const parsedData = await parseXMLAsync(response.data) as T;

      return {
        success: true,
        data: parsedData,
        metadata: response.metadata,
      };
    } catch (error) {
      return this.handleError(error as Error);
    }
  }

  private handleError(error: Error): ApiResponse<never> {
    console.error('API Error:', error.message);
    
    return {
      success: false,
      error: error.message,
      metadata: {
        timestamp: new Date().toISOString(),
      },
    };
  }
}

// Singleton factory for API clients
export class ApiClientFactory {
  private static clients = new Map<string, ApiClient>();

  static getClient(baseURL?: string): ApiClient {
    const key = baseURL || 'default';
    
    if (!this.clients.has(key)) {
      this.clients.set(key, new ApiClient(baseURL));
    }

    return this.clients.get(key)!;
  }

  static getRechtspraakClient(): ApiClient {
    return this.getClient(API_ENDPOINTS.RECHTSPRAAK);
  }

  static clear(): void {
    this.clients.clear();
  }
}