import ApiService from './apiService';
import type { TranslationResponse } from './apiService';

/**
 * Translation service for handling text translation between English and Japanese
 */
export class TranslationService {
  private static instance: TranslationService;

  private constructor() {
    // Private constructor for singleton pattern
  }

  public static getInstance(): TranslationService {
    if (!TranslationService.instance) {
      TranslationService.instance = new TranslationService();
    }
    return TranslationService.instance;
  }

  /**
   * Translate text to Japanese
   */
  async translateToJapanese(text: string): Promise<TranslationResponse> {
    const apiService = ApiService.getInstance();
    return await apiService.translateEnglishToJapanese(text);
  }

  /**
   * Translate text to English
   */
  async translateToEnglish(text: string): Promise<TranslationResponse> {
    const apiService = ApiService.getInstance();
    return await apiService.translateJapaneseToEnglish(text);
  }

  /**
   * Auto-detect language and translate
   */
  async autoTranslate(text: string): Promise<TranslationResponse> {
    // Simple detection: if contains Japanese characters, translate to English
    const hasJapanese = /[\u3040-\u309F\u30A0-\u30FF\u4E00-\u9FAF]/.test(text);
    
    if (hasJapanese) {
      return this.translateToEnglish(text);
    } else {
      return this.translateToJapanese(text);
    }
  }
}

export default TranslationService;
