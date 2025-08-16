/**
 * Application Constants
 * Centralized configuration and magic numbers
 */

export const API_ENDPOINTS = {
  RECHTSPRAAK: 'https://data.rechtspraak.nl/uitspraken',
  RECHTSPRAAK_SEARCH: 'https://data.rechtspraak.nl/uitspraken/zoeken',
  RECHTSPRAAK_CONTENT: 'https://data.rechtspraak.nl/uitspraken/content',
  DPA: 'https://autoriteitpersoonsgegevens.nl',
} as const;

export const LIMITS = {
  MAX_SEARCH_RESULTS: 50,
  DEFAULT_SEARCH_RESULTS: 10,
  MAX_DPA_UPDATES: 20,
  DEFAULT_DPA_UPDATES: 10,
  MIN_QUERY_LENGTH: 1,
  MIN_DESCRIPTION_LENGTH: 10,
} as const;

export const RISK_THRESHOLDS = {
  GDPR: {
    LOW: 30,
    MEDIUM: 60,
    HIGH: 80,
  },
  AI_ACT: {
    MINIMAL: 25,
    LIMITED: 50,
    HIGH: 75,
  },
} as const;

export const LEGAL_DOMAINS = [
  'Bestuursrecht',
  'Burgerlijk recht', 
  'Strafrecht',
  'Arbeidsrecht',
  'Belastingrecht',
  'Europees recht',
  'Intellectueel eigendomsrecht',
  'Milieurecht',
  'Personen- en familierecht',
  'Procesrecht',
  'Socialezekerheidsrecht',
  'Vreemdelingenrecht',
] as const;

export const DUTCH_COURTS = [
  'Hoge Raad',
  'Raad van State',
  'Centrale Raad van Beroep',
  'College van Beroep voor het bedrijfsleven',
  'Gerechtshof Amsterdam',
  'Gerechtshof Arnhem-Leeuwarden',
  'Gerechtshof Den Haag',
  'Gerechtshof s-Hertogenbosch',
  'Rechtbank Amsterdam',
  'Rechtbank Den Haag',
  'Rechtbank Rotterdam',
  'Rechtbank Utrecht',
] as const;

export const SENSITIVE_DATA_TYPES = [
  'biometric',
  'health', 
  'genetic',
  'political',
  'religious',
  'ethnic',
  'sexual',
] as const;

export const HIGH_RISK_DATA_TYPES = [
  'location',
  'children',
  'behavioral',
  'financial',
] as const;

export const AI_RISK_DOMAINS = {
  HIGH: [
    'biometric',
    'critical infrastructure',
    'education',
    'employment',
    'recruitment',
    'essential services',
    'law enforcement',
    'migration',
    'justice',
    'democratic',
    'healthcare',
    'safety',
    'transport',
    'energy',
    'water',
    'finance',
    'credit',
  ],
  PROHIBITED: [
    'subliminal',
    'social scoring',
    'exploit vulnerabilities',
    'real-time biometric identification',
  ],
  LIMITED: [
    'chatbot',
    'deepfake',
    'emotion recognition',
    'interact with humans',
  ],
} as const;

export const HTTP_CONFIG = {
  TIMEOUT: 10000,
  HEADERS: {
    'Accept': 'application/xml',
    'User-Agent': 'DutchLegalMCP/1.0.0',
  },
} as const;

export const ERROR_MESSAGES = {
  VALIDATION: {
    QUERY_REQUIRED: 'Search query is required',
    DATA_TYPES_REQUIRED: 'At least one data type is required',
    SYSTEM_DESCRIPTION_REQUIRED: 'System description is required',
    BUSINESS_DESCRIPTION_REQUIRED: 'Business description is required',
  },
  API: {
    REQUEST_FAILED: 'API request failed',
    INVALID_RESPONSE: 'Invalid API response',
    NETWORK_ERROR: 'Network error occurred',
  },
  GENERAL: {
    UNKNOWN_ERROR: 'An unknown error occurred',
    SERVICE_UNAVAILABLE: 'Service temporarily unavailable',
  },
} as const;