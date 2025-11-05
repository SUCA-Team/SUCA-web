import React, { useState, useRef, useEffect } from 'react';
import { useWordSuggestions } from '../../hooks/useWordSuggestions';
import { WordRecommendationService } from '../../services/wordRecommendationService';
import type { WordSuggestion } from '../../types/translation';
import './TranslationInput.css';

interface TranslationInputProps {
  onTranslate?: (text: string) => void;
  /** optional initial tab to show: 'translate' or 'search' */
  initialTab?: 'translate' | 'search';
  /** hide the tab controls (useful for embedding as search-only) */
  hideTabs?: boolean;
}

export const TranslationInput: React.FC<TranslationInputProps> = ({ onTranslate, initialTab = 'translate', hideTabs = false }) => {
  const [inputValue, setInputValue] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [activeTab, setActiveTab] = useState<'translate' | 'search'>(initialTab);
  const inputRef = useRef<HTMLInputElement>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);

  const { suggestions, isLoading, getSuggestions, clearSuggestions } = useWordSuggestions();
  const suggestionsTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        suggestionsRef.current &&
        !suggestionsRef.current.contains(event.target as Node) &&
        !inputRef.current?.contains(event.target as Node)
      ) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      if (suggestionsTimerRef.current) {
        clearTimeout(suggestionsTimerRef.current);
        suggestionsTimerRef.current = null;
      }
    };
  }, []);

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    setInputValue(value);

    if (activeTab === 'search' && value.trim()) {
      // debounce calls so we don't request on every keystroke
      if (suggestionsTimerRef.current) clearTimeout(suggestionsTimerRef.current);
      suggestionsTimerRef.current = setTimeout(() => {
        // call the suggestion fetcher (hook handles loading state)
        void getSuggestions(value);
        setShowSuggestions(true);
      }, 300);
    } else {
      if (suggestionsTimerRef.current) {
        clearTimeout(suggestionsTimerRef.current);
        suggestionsTimerRef.current = null;
      }
      clearSuggestions();
      setShowSuggestions(false);
    }
  };

  const handleInputFocus = () => {
    if (activeTab === 'search' && inputValue.trim()) {
      setShowSuggestions(true);
    }
  };

  const handleSuggestionClick = (suggestion: WordSuggestion) => {
    setInputValue(suggestion.word);
    setShowSuggestions(false);
    inputRef.current?.focus();
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!inputValue.trim()) return;

    // Hide suggestions and clear local list
    setShowSuggestions(false);
    clearSuggestions();

    // Send final query to backend (if configured). We don't require a response yet,
    // but we call it now so the app is ready when your backend is connected.
    try {
      const svc = WordRecommendationService.getInstance();
      const resp = await svc.searchBackend(inputValue);
      // For now just log the response. Parent can still handle the raw input via onTranslate.
      if (resp !== null) {
        console.log('Backend search response:', resp);
      }
    } catch (err) {
      console.warn('Error calling backend search:', err);
    }

    // Keep existing callback behavior (pass original text to parent)
    onTranslate?.(inputValue);
  };

  const handleTabChange = (tab: 'translate' | 'search') => {
    setActiveTab(tab);
    setInputValue('');
    clearSuggestions();
    setShowSuggestions(false);
  };

  return (
    <div className="translation-input-container">
      {!hideTabs && (
        <div className="input-tabs">
          <button
            className={`tab ${activeTab === 'translate' ? 'active' : ''}`}
            onClick={() => handleTabChange('translate')}
          >
            Translate
          </button>
          <button
            className={`tab ${activeTab === 'search' ? 'active' : ''}`}
            onClick={() => handleTabChange('search')}
          >
            Search
          </button>
        </div>
      )}

      <form onSubmit={handleSubmit} className="translation-form">
        <div className="input-wrapper">
          <input
            ref={inputRef}
            type="text"
            value={inputValue}
            onChange={handleInputChange}
            onFocus={handleInputFocus}
            placeholder={
              activeTab === 'translate' 
                ? 'Translate a phrase...' 
                : 'Search for Japanese words...'
            }
            className="input translation-input"
          />
          
          <button
            type="submit"
            className="search-button"
            disabled={!inputValue.trim()}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <circle cx="11" cy="11" r="8" strokeWidth="2" />
              <path d="m21 21-4.35-4.35" strokeWidth="2" />
            </svg>
          </button>
        </div>

        {showSuggestions && activeTab === 'search' && (
          <div ref={suggestionsRef} className="suggestions-dropdown">
            {isLoading ? (
              <div className="suggestion-item loading">
                <div className="loading-spinner"></div>
                <span>Loading suggestions...</span>
              </div>
            ) : suggestions.length > 0 ? (
              <>
                <div className="suggestions-header">Suggestions</div>
                {suggestions.map((suggestion, index) => (
                  <div
                    key={`${suggestion.word}-${index}`}
                    className="suggestion-item"
                    onClick={() => handleSuggestionClick(suggestion)}
                  >
                    <div className="suggestion-word">
                      <span className="word">{suggestion.word}</span>
                      {suggestion.reading && (
                        <span className="reading">({suggestion.reading})</span>
                      )}
                    </div>
                    <div className="suggestion-meaning">{suggestion.meaning}</div>
                    <div className="suggestion-meta">
                      <span className={`type type-${suggestion.type}`}>
                        {suggestion.type}
                      </span>
                      {suggestion.level && (
                        <span className={`level level-${suggestion.level.toLowerCase()}`}>
                          {suggestion.level}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </>
            ) : inputValue.trim() ? (
              <div className="suggestion-item no-results">
                No suggestions found for "{inputValue}"
              </div>
            ) : null}
          </div>
        )}
      </form>
    </div>
  );
};