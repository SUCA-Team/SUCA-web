import { useState, useCallback } from 'react';
import ApiService from '../services/apiService';

export interface UseWordSuggestionsResult {
  suggestions: string[];
  isLoading: boolean;
  error: string | null;
  getSuggestions: (query: string) => Promise<void>;
  clearSuggestions: () => void;
}

export const useWordSuggestions = (): UseWordSuggestionsResult => {
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const api = ApiService.getInstance();

  const getSuggestions = useCallback(async (query: string) => {
    if (!query.trim()) {
      setSuggestions([]);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const results = await api.getSearchSuggestions(query);
      setSuggestions(results);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to get suggestions');
      setSuggestions([]);
    } finally {
      setIsLoading(false);
    }
  }, [api]);

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