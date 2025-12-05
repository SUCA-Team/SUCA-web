import React, { useState } from 'react';
import AudioButtonImg from '../../assets/AudioButton.png';
// Replace flip button with a simple Copy action
import AddButtonImg from '../../assets/AddButton.png';
import { TranslationInput } from '../../components/common/TranslationInput';
import ApiService, { type SearchResponse } from '../../services/apiService';

export const DictionaryPage: React.FC = () => {
  const [searchResults, setSearchResults] = useState<SearchResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSearch = async (text: string) => {
    if (!text.trim()) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      const apiService = ApiService.getInstance();
      const results = await apiService.searchDictionary(text);
      
      // Handle the new API response structure
      if (!results.success) {
        setError(results.message || 'Search failed');
        setSearchResults(null);
        return;
      }
      
      setSearchResults(results);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Search failed');
      console.error('Dictionary search error:', err);
      setSearchResults(null);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="page page-dictionary">
      <div className="page-content">
        <h1 className="page-title">Dictionary</h1>
        <p className="page-body">Find any Japanese word in seconds.</p>
        <section style={{marginTop: '1.5rem', width: '90vw'}}>
          <TranslationInput onTranslate={handleSearch} initialTab="search" hideTabs={true} />
          
          {isLoading && (
            <div style={{ marginTop: '1rem', padding: '1rem', textAlign: 'center' }}>
              Searching...
            </div>
          )}
          
          {error && (
            <div style={{ marginTop: '1rem', padding: '1rem', color: 'red', background: '#ffebee', borderRadius: '4px' }}>
              Error: {error}
            </div>
          )}
          
          {searchResults && searchResults.success && (
            <div style={{ marginTop: '1.5rem' }}>
              <div style={{ marginBottom: '1rem', padding: '0.5rem', background: '#e8f5e8', borderRadius: '4px', color: '#2e7d32' }}>
                {searchResults.message}
              </div>
              <h3>
                {searchResults.total_count} {searchResults.total_count === 1 ? 'result' : 'results'} found for '{searchResults.query}'
              </h3>
              <ul className="dictionary-results-list" style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                {searchResults.results.map((result, index) => (
                  <li key={index} style={{ margin: '1rem 0' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '1rem' }}>
                      {/* Left card: word and tags */}
                      <div
                        className="dictionary-word-card"
                        style={{
                          width: '23vw',
                          height: '23vw',
                          minWidth: '180px',
                          minHeight: '180px',
                          maxWidth: '450px',
                          maxHeight: '450px',
                          boxSizing: 'border-box',
                          padding: '1.5rem 1rem 1rem 1rem',
                          border: '1px solid #ddd',
                          borderRadius: '16px',
                          backgroundColor: '#fff',
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'center',
                          justifyContent: 'flex-start',
                          position: 'relative',
                        }}
                      >
                        {/* Kanji at top */}
                        <div style={{ width: '100%', textAlign: 'center', marginBottom: '0.5rem' }}>
                          {(() => {
                            const HIRAGANA_RANGE = /[\u3040-\u309F]/;
                            const KATAKANA_RANGE = /[\u30A0-\u30FF]/;
                            const isKanaOnly = (s: string) => {
                              if (!s) return false;
                              for (const ch of s) {
                                if (!(HIRAGANA_RANGE.test(ch) || KATAKANA_RANGE.test(ch))) {
                                  return false;
                                }
                              }
                              return true;
                            };
                            const word = result.word;
                            const reading = result.reading;
                            if (word && reading && !isKanaOnly(word)) {
                              return (
                                <ruby style={{ fontSize: '60px', fontWeight: 700 }}>
                                  {word}
                                  <rt style={{ fontSize: '18px', fontWeight: 500 }}>{reading}</rt>
                                </ruby>
                              );
                            }
                            return (<strong style={{ fontSize: '60px', fontWeight: 700 }}>{word}</strong>);
                          })()}
                        </div>
                        {/* Icon buttons row */}
                        <div style={{ display: 'flex', justifyContent: 'center', gap: '1.2rem', marginBottom: '0.5rem' }}>
                          <button style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer' }} title="Play audio">
                            <img src={AudioButtonImg} alt="Audio" style={{ width: 28, height: 28 }} />
                          </button>
                          <button
                            style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer' }}
                            title="Copy"
                            onClick={() => {
                              const textToCopy = result.word || '';
                              if (navigator.clipboard) {
                                void navigator.clipboard.writeText(textToCopy);
                              }
                            }}
                          >
                            {/* Simple copy glyph */}
                            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#333" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                              <rect x="3" y="3" width="13" height="13" rx="2" ry="2"></rect>
                            </svg>
                          </button>
                          <button style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer' }} title="Add to list">
                            <img src={AddButtonImg} alt="Add" style={{ width: 28, height: 28 }} />
                          </button>
                        </div>
                        {/* First example (if available, else empty block for spacing) */}
                        <div style={{ minHeight: '2.5em', margin: '0.5rem 0 0.5rem 0', textAlign: 'center', width: '100%' }}>
                          {result.meanings?.length > 0 && result.meanings[0].examples?.length > 0 ? (
                            <>
                              <div style={{ fontWeight: 500, fontSize: '1.05em', color: '#222' }}>{result.meanings[0].examples[0].japanese}</div>
                              <div style={{ color: '#888', fontSize: '0.95em', fontStyle: 'italic' }}>{result.meanings[0].examples[0].english}</div>
                            </>
                          ) : null}
                        </div>
                        {/* Line break */}
                        <hr style={{ width: '90%', margin: '0.5rem 0 0.75rem 0', border: 'none', borderTop: '1px solid #eee' }} />
                        {/* Tags */}
                        <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.2rem', flexWrap: 'wrap', justifyContent: 'center', width: '100%' }}>
                          {result.is_common && (
                            <span style={{ background: '#4CAF50', color: 'black', padding: '4px 16px', borderRadius: '12px', fontSize: '0.95em', fontWeight: 600 }}>
                              common word
                            </span>
                          )}
                        </div>
                        {/* More examples button: show only if total examples > 1 across meanings */}
                        {result.meanings.reduce((sum, m) => sum + (m.examples ? m.examples.length : 0), 0) > 1 && (
                          <button
                            style={{
                              marginTop: 'auto',
                              alignSelf: 'center',
                              border: '1.5px solid #ffb3b3',
                              background: 'none',
                              color: '#d32f2f',
                              borderRadius: '8px',
                              padding: '6px 18px',
                              fontWeight: 600,
                              fontSize: '1em',
                              cursor: 'pointer',
                              marginBottom: '0.5rem',
                            }}
                          >
                            More examples
                          </button>
                        )}
                      </div>

                      {/* Right card: type, meanings, examples */}
                      <div
                        className="dictionary-info-card"
                        style={{
                          padding: '2rem',
                          border: '1px solid #ddd',
                          borderRadius: '16px',
                          backgroundColor: '#fff',
                          maxHeight: '450px',
                          overflowY: 'auto',
                          display: 'flex',
                          flexDirection: 'column',
                          justifyContent: 'flex-start',
                          alignItems: 'flex-start',
                          fontSize: '1.15em',
                        }}
                      >
                        {result.meanings.map((meaning, mIndex) => (
                          <div key={mIndex} style={{ width: '100%' }}>
                            {/* POS header */}
                            <div style={{ color: '#333', fontWeight: 700, fontSize: '1.2em', marginBottom: '0.5rem', letterSpacing: '0.02em', textAlign: 'left' }}>
                              {meaning.pos.join(', ').toUpperCase()}
                            </div>
                            {/* Definitions */}
                            <ol style={{ margin: '0 0 1rem 0', paddingLeft: '1.9rem', color: '#222', fontSize: '1.15em', fontWeight: 500, textAlign: 'left' }}>
                              {meaning.definitions.map((def, dIndex) => (
                                <li key={dIndex} style={{ marginBottom: '0.5rem', textAlign: 'left', fontSize: '1.15em' }}>{def}</li>
                              ))}
                            </ol>
                            {/* Examples section */}
                            {meaning.examples.length > 0 && (
                              <div style={{ marginTop: '0.5rem', width: '100%' }}>
                                <div style={{ fontWeight: 700, fontSize: '1.15em', color: '#333', marginBottom: '0.5rem', letterSpacing: '0.02em', textAlign: 'left' }}>EXAMPLES</div>
                                {meaning.examples.slice(0, 2).map((example, eIndex) => (
                                  <div key={eIndex} style={{ marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '1.2rem', textAlign: 'left' }}>
                                    <div style={{ fontWeight: 500, fontSize: '1.15em', color: '#222', minWidth: '90px', textAlign: 'left' }}>{example.japanese}</div>
                                    <div style={{ color: '#888', fontSize: '1.1em', fontStyle: 'italic', textAlign: 'left' }}>{example.english}</div>
                                  </div>
                                ))}
                              </div>
                            )}
                            {/* Separator between entries */}
                            {mIndex < result.meanings.length - 1 && (
                              <hr style={{ width: '100%', border: 'none', borderTop: '1.5px solid #ddd', margin: '1rem 0' }} />
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          )}
          
          {searchResults && searchResults.success && searchResults.results.length === 0 && (
            <div style={{ marginTop: '1rem', padding: '1rem', textAlign: 'center', color: '#666' }}>
              No results found for '{searchResults.query}'. Try a different search term.
            </div>
          )}
        </section>
      </div>
    </main>
  );
};

export default DictionaryPage;
