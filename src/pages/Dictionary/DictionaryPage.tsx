import React, { useState } from 'react';
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
      setSearchResults(results);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Search failed');
      console.error('Dictionary search error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="page page-dictionary">
      <div className="page-content">
        <h1 className="page-title">Dictionary</h1>
        <p className="page-body">Find any Japanese word in seconds.</p>
        <section style={{marginTop: '1.5rem', width: '600px'}}>
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
          
          {searchResults && searchResults.results.length > 0 && (
            <div style={{ marginTop: '1.5rem' }}>
              <h3>Search Results ({searchResults.total_count} found)</h3>
              {searchResults.results.map((result, index) => (
                <div key={index} style={{ 
                  margin: '1rem 0', 
                  padding: '1rem', 
                  border: '1px solid #ddd', 
                  borderRadius: '8px',
                  backgroundColor: '#f9f9f9' 
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                    <strong style={{ fontSize: '1.2em' }}>{result.word}</strong>
                    {result.reading && <span style={{ color: '#666' }}>【{result.reading}】</span>}
                    {result.jlpt_level && (
                      <span style={{ 
                        background: '#2196F3', 
                        color: 'white', 
                        padding: '2px 6px', 
                        borderRadius: '4px', 
                        fontSize: '0.8em' 
                      }}>
                        {result.jlpt_level}
                      </span>
                    )}
                    {result.is_common && (
                      <span style={{ 
                        background: '#4CAF50', 
                        color: 'white', 
                        padding: '2px 6px', 
                        borderRadius: '4px', 
                        fontSize: '0.8em' 
                      }}>
                        Common
                      </span>
                    )}
                  </div>
                  
                  {result.meanings.map((meaning, mIndex) => (
                    <div key={mIndex} style={{ marginBottom: '0.5rem' }}>
                      <div style={{ color: '#666', fontSize: '0.9em' }}>
                        {meaning.pos.join(', ')}
                      </div>
                      <ul style={{ margin: '0.25rem 0 0.5rem 1rem' }}>
                        {meaning.definitions.map((def, dIndex) => (
                          <li key={dIndex}>{def}</li>
                        ))}
                      </ul>
                      {meaning.examples.length > 0 && (
                        <div style={{ fontSize: '0.9em', color: '#555' }}>
                          <strong>Examples:</strong>
                          {meaning.examples.slice(0, 2).map((example, eIndex) => (
                            <div key={eIndex} style={{ marginLeft: '1rem', marginTop: '0.25rem' }}>
                              <div style={{ fontWeight: '500' }}>{example.japanese}</div>
                              <div style={{ color: '#888', fontSize: '0.9em', fontStyle: 'italic' }}>{example.english}</div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                  
                  {result.other_forms.length > 0 && (
                    <div style={{ fontSize: '0.9em', color: '#666', marginTop: '0.5rem' }}>
                      <strong>Other forms:</strong> {result.other_forms.join(', ')}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
          
          {searchResults && searchResults.results.length === 0 && (
            <div style={{ marginTop: '1rem', padding: '1rem', textAlign: 'center', color: '#666' }}>
              No results found. Try a different search term.
            </div>
          )}
        </section>
      </div>
    </main>
  );
};

export default DictionaryPage;
