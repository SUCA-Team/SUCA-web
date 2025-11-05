import ApiService, { type TranslationResponse } from './apiService';

export class TranslationService {
  private static instance: TranslationService;
  private apiService: ApiService;

  private constructor() {
    this.apiService = ApiService.getInstance();
  }

  public static getInstance(): TranslationService {
    if (!TranslationService.instance) {
      TranslationService.instance = new TranslationService();
    }
    return TranslationService.instance;
  }

  /**
   * Translate text from English to Japanese
   */
  async translateToJapanese(text: string): Promise<TranslationResponse> {
    return this.apiService.translateEnglishToJapanese(text);
  }

  /**
   * Translate text from Japanese to English
   */
  async translateToEnglish(text: string): Promise<TranslationResponse> {
    return this.apiService.translateJapaneseToEnglish(text);
  }

  /**
   * Auto-detect language and translate accordingly
   */
  async autoTranslate(text: string): Promise<TranslationResponse> {
    // Simple heuristic: if text contains Japanese characters, translate to English
    const hasJapanese = /[\u3040-\u309F\u30A0-\u30FF\u4E00-\u9FAF]/.test(text);
    
    if (hasJapanese) {
      return this.translateToEnglish(text);
    } else {
      return this.translateToJapanese(text);
    }
  }

  /**
   * Check if the API is available
   */
  async checkHealth(): Promise<boolean> {
    try {
      const health = await this.apiService.checkHealth();
      return health.status === 'ok';
    } catch {
      return false;
    }
  }
}

export default TranslationService;
