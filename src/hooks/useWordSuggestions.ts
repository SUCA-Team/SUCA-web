import { useState, useCallback } from 'react';
import type { WordSuggestion } from '../types/translation';
import { WordRecommendationService } from '../services/wordRecommendationService';

export interface UseWordSuggestionsResult {
  suggestions: WordSuggestion[];
  isLoading: boolean;
  error: string | null;
  getSuggestions: (query: string) => Promise<void>;
  clearSuggestions: () => void;
}

export const useWordSuggestions = (): UseWordSuggestionsResult => {
  const [suggestions, setSuggestions] = useState<WordSuggestion[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const wordService = WordRecommendationService.getInstance();

  const getSuggestions = useCallback(async (query: string) => {
    if (!query.trim()) {
      setSuggestions([]);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const results = await wordService.getSuggestions(query);
      setSuggestions(results);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to get suggestions');
      setSuggestions([]);
    } finally {
      setIsLoading(false);
    }
  }, [wordService]);

  const clearSuggestions = useCallback(() => {
    setSuggestions([]);
    setError(null);
  }, []);

  return {
    suggestions,
    isLoading,
    error,
    getSuggestions,
    clearSuggestions,
  };
};