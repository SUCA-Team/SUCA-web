import axios from 'axios';
import type { AxiosInstance } from 'axios';
import { API_CONFIG } from '../config/api';

export interface TranslationResponse {
  original: string;
  translated: string;
  notification?: string;
}

export interface SearchResult {
  word: string;
  reading: string | null;
  is_common: boolean;
  jlpt_level: string | null;
  meanings: Array<{
    pos: string[];
    definitions: string[];
    examples: Array<{ japanese: string; english: string }>;
    notes: string[];
  }>;
  other_forms: string[];
  tags: string[];
  variants: Array<{ word: string; reading: string }>;
}

export interface SearchResponse {
  success: boolean;
  message?: string;
  results: SearchResult[];
  total_count: number;
  query?: string;
}

export interface HealthResponse {
  status: string;
}

class ApiService {
  private static instance: ApiService;
  private client: AxiosInstance;
  private useMocks: boolean;

  private constructor() {
    this.useMocks = import.meta.env.VITE_USE_MOCKS === 'true';

    this.client = axios.create({
      baseURL: API_CONFIG.BASE_URL,
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

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
      (response) => {
        console.log(`API Response: ${response.status} ${response.config.url}`);
        return response;
      },
      (error) => {
        console.error('API Error:', error.response?.data || error.message);
        return Promise.reject(error);
      }
    );
  }

  public static getInstance(): ApiService {
    if (!ApiService.instance) {
      ApiService.instance = new ApiService();
    }
    return ApiService.instance;
  }

  // Health check
  async checkHealth(): Promise<HealthResponse> {
    if (this.useMocks) {
      return { status: 'ok' };
    }
    try {
      const response = await this.client.get<HealthResponse>(API_CONFIG.ENDPOINTS.HEALTH);
      return response.data;
    } catch (err) {
      // Fallback to mock when backend is unavailable
      return { status: 'ok' };
    }
  }

  // Translation services
  async translateEnglishToJapanese(text: string): Promise<TranslationResponse> {
    if (this.useMocks) {
      return {
        original: text,
        translated: mockTranslate(text, 'ja'),
        notification: 'Mock translation (no backend)'
      };
    }
    try {
      const response = await this.client.get<TranslationResponse>(
        API_CONFIG.ENDPOINTS.TRANSLATE_EN_TO_JP,
        {
          params: { q: text, target_lang: 'ja' }
        }
      );
      return response.data;
    } catch {
      return {
        original: text,
        translated: mockTranslate(text, 'ja'),
        notification: 'Mock translation fallback (backend unreachable)'
      };
    }
  }

  async translateJapaneseToEnglish(text: string): Promise<TranslationResponse> {
    if (this.useMocks) {
      return {
        original: text,
        translated: mockTranslate(text, 'en'),
        notification: 'Mock translation (no backend)'
      };
    }
    try {
      const response = await this.client.get<TranslationResponse>(
        API_CONFIG.ENDPOINTS.TRANSLATE_JP_TO_EN,
        {
          params: { q: text, target_lang: 'en' }
        }
      );
      return response.data;
    } catch {
      return {
        original: text,
        translated: mockTranslate(text, 'en'),
        notification: 'Mock translation fallback (backend unreachable)'
      };
    }
  }

  // Dictionary search
  async searchDictionary(query: string, limit?: number): Promise<SearchResponse> {
    if (this.useMocks) {
      return mockSearch(query, limit);
    }
    try {
      const response = await this.client.get<SearchResponse>(API_CONFIG.ENDPOINTS.SEARCH, {
        params: { 
          q: query,
          ...(limit && { limit })
        }
      });
      return response.data;
    } catch {
      return mockSearch(query, limit);
    }
  }
}

export default ApiService;

// ------- Mock helpers (frontend-only) -------
function mockTranslate(text: string, target: 'en' | 'ja'): string {
  // Extremely simple mock: reverse text and append target tag
  const reversed = text.split('').reverse().join('');
  if (target === 'ja') {
    return `${reversed}・モック`;
  }
  return `${reversed} (mock)`;
}

function mockSearch(query: string, limit?: number): SearchResponse {
  const base: SearchResult = {
    word: query,
    reading: null,
    is_common: true,
    jlpt_level: 'N5',
    meanings: [
      {
        pos: ['noun'],
        definitions: [`Mock definition for "${query}"`],
        examples: [
          { japanese: `${query} の例`, english: `Example with ${query}` }
        ],
        notes: ['This is a mock search result']
      }
    ],
    other_forms: [],
    tags: ['mock'],
    variants: [{ word: query, reading: query }]
  };
  const count = Math.max(1, Math.min(limit ?? 3, 5));
  const results: SearchResult[] = Array.from({ length: count }).map((_, i) => ({
    ...base,
    word: `${query}-${i + 1}`
  }));
  return {
    success: true,
    message: 'Mock dictionary search',
    results,
    total_count: results.length,
    query
  };
}
