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
  /** Indicates whether the search was successful */
  success: boolean;
  /** Human-readable message about the search results (e.g., "Found 12 results for '綺麗'") */
  message: string;
  /** Array of dictionary search results */
  results: SearchResult[];
  /** Total number of results found */
  total_count: number;
  /** The original search query */
  query: string;
}

export interface HealthResponse {
  status: string;
}

class ApiService {
  private static instance: ApiService;
  private client: AxiosInstance;

  private constructor() {
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
    const response = await this.client.get<HealthResponse>(API_CONFIG.ENDPOINTS.HEALTH);
    return response.data;
  }

  // Translation services
  async translateEnglishToJapanese(text: string): Promise<TranslationResponse> {
    const response = await this.client.get<TranslationResponse>(
      API_CONFIG.ENDPOINTS.TRANSLATE_EN_TO_JP,
      {
        params: { q: text, target_lang: 'ja' }
      }
    );
    return response.data;
  }

  async translateJapaneseToEnglish(text: string): Promise<TranslationResponse> {
    const response = await this.client.get<TranslationResponse>(
      API_CONFIG.ENDPOINTS.TRANSLATE_JP_TO_EN,
      {
        params: { q: text, target_lang: 'en' }
      }
    );
    return response.data;
  }

  // Dictionary search
  async searchDictionary(query: string, limit?: number): Promise<SearchResponse> {
    const response = await this.client.get<SearchResponse>(API_CONFIG.ENDPOINTS.SEARCH, {
      params: { 
        q: query,
        ...(limit && { limit })
      }
    });
    return response.data;
  }
}

export default ApiService;
