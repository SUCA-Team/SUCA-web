import { useState, useCallback } from 'react';
import { TranslationService } from '../services/translationService';
import type { TranslationResponse } from '../services/apiService';

interface UseTranslationResult {
  isLoading: boolean;
  error: string | null;
  result: TranslationResponse | null;
  translate: (text: string, direction?: 'auto' | 'en-to-jp' | 'jp-to-en') => Promise<void>;
  clearResult: () => void;
}

export const useTranslation = (): UseTranslationResult => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<TranslationResponse | null>(null);

  const translate = useCallback(async (text: string, direction: 'auto' | 'en-to-jp' | 'jp-to-en' = 'auto') => {
    if (!text.trim()) return;

    setIsLoading(true);
    setError(null);
    
    try {
      const translationService = TranslationService.getInstance();
      let response: TranslationResponse;

      switch (direction) {
        case 'en-to-jp':
          response = await translationService.translateToJapanese(text);
          break;
        case 'jp-to-en':
          response = await translationService.translateToEnglish(text);
          break;
        case 'auto':
        default:
          response = await translationService.autoTranslate(text);
          break;
      }

      setResult(response);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Translation failed';
      setError(errorMessage);
      console.error('Translation error:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const clearResult = useCallback(() => {
    setResult(null);
    setError(null);
  }, []);

  return {
    isLoading,
    error,
    result,
    translate,
    clearResult
  };
};
