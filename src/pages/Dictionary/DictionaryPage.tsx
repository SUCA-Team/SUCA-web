import React, { useEffect, useState } from 'react';
import AudioButtonImg from '../../assets/AudioButton.png';
// Replace flip button with a simple Copy action
import AddButtonImg from '../../assets/AddButton.png';
import { TranslationInput } from '../../components/common/TranslationInput';
import ApiService, { type SearchResponse, SearchPos } from '../../services/apiService';

export const DictionaryPage: React.FC = () => {
  const PAGE_SIZE = 10;
  const [searchResults, setSearchResults] = useState<SearchResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState<string>('');
  const [page, setPage] = useState<number>(1);
  const [pos, setPos] = useState<SearchPos | null>(null);
  const [showMoreExamplesIdx, setShowMoreExamplesIdx] = useState<number | null>(null);
  const [showAddToDeckOverlay, setShowAddToDeckOverlay] = useState(false);
  const [overlayView, setOverlayView] = useState<'deck-select' | 'add-card'>('deck-select');
  const [selectedWord, setSelectedWord] = useState<any>(null);
  const [userDecks, setUserDecks] = useState<any[]>([]);
  const [selectedDeckId, setSelectedDeckId] = useState<number | null>(null);
  const [cardFront, setCardFront] = useState('');
  const [cardBack, setCardBack] = useState('');
  const [cardExample, setCardExample] = useState('');
  const [isLoadingDecks, setIsLoadingDecks] = useState(false);

  const fetchResults = async (text: string, pageNum: number, posFilter: SearchPos | null) => {
    if (!text.trim()) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      const apiService = ApiService.getInstance();
      // Request up to 50 results from API; we'll paginate client-side at 10 per page
      const results = await apiService.searchDictionary(text, 50, pageNum, posFilter);
      
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

  const handleSearch = async (text: string) => {
    setQuery(text);
    setPage(1);
    await fetchResults(text, 1, pos);
  };

  const handlePosChange = async (newPos: SearchPos | null) => {
    setPos(newPos);
    setPage(1);
    setPos(newPos);
  };

  const handlePageChange = async (nextPage: number) => {
    if (nextPage < 1) return;
    setPage(nextPage);
    setShowMoreExamplesIdx(null);
    if (query.trim()) {
      // No need to refetch; results are already loaded (limit=50). Just change page.
      // If you want to refetch for server-side paging, revert to calling fetchResults.
    }
  };

  // Ensure the viewport jumps back to top whenever the page changes or more examples is shown
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    const container = document.querySelector('.page-content') as HTMLElement | null;
    if (container) {
      container.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, [page, showMoreExamplesIdx]);

  const handleAddToDeckClick = async (result: any) => {
    setSelectedWord(result);
    setShowAddToDeckOverlay(true);
    setOverlayView('deck-select');
    
    // Load user decks
    setIsLoadingDecks(true);
    try {
      const api = ApiService.getInstance();
      const decksRes = await api.listDecks();
      setUserDecks(decksRes.decks || []);
    } catch (error) {
      console.error('Failed to load decks:', error);
      alert('Failed to load decks. Please try again.');
    } finally {
      setIsLoadingDecks(false);
    }
  };

  const handleDeckSelect = (deckId: number) => {
    setSelectedDeckId(deckId);
    setOverlayView('add-card');
    
    // Pre-fill card fields
    if (selectedWord) {
      setCardFront(selectedWord.word || '');
      
      // Format back as "meaning - reading"
      const firstMeaning = selectedWord.meanings?.[0]?.definitions?.[0] || '';
      const reading = selectedWord.reading || '';
      setCardBack(reading ? `${firstMeaning} - ${reading}` : firstMeaning);
      
      // Get first example
      const firstExample = selectedWord.meanings?.[0]?.examples?.[0];
      if (firstExample) {
        setCardExample(`${firstExample.japanese} - ${firstExample.english}`);
      } else {
        setCardExample('');
      }
    }
  };

  const handleBackToDeckSelect = () => {
    setOverlayView('deck-select');
  };

  const handleCloseOverlay = () => {
    if (overlayView === 'add-card' && (cardFront.trim() || cardBack.trim() || cardExample.trim())) {
      if (confirm('You have unsaved changes. Do you want to discard them?')) {
        resetOverlayState();
      }
    } else {
      resetOverlayState();
    }
  };

  const resetOverlayState = () => {
    setShowAddToDeckOverlay(false);
    setOverlayView('deck-select');
    setSelectedWord(null);
    setSelectedDeckId(null);
    setCardFront('');
    setCardBack('');
    setCardExample('');
  };

  const handleAddCard = async () => {
    if (!selectedDeckId || !cardFront.trim() || !cardBack.trim()) {
      alert('Please fill in at least the front and back of the card.');
      return;
    }

    try {
      const api = ApiService.getInstance();
      // Encode example into back field if provided
      const encodedBack = cardExample.trim() 
        ? `${cardBack} {${cardExample}}`
        : cardBack;
      
      await api.createFlashcard(selectedDeckId, {
        front: cardFront.trim(),
        back: encodedBack.trim(),
      });
      
      alert('Card added successfully!');
      resetOverlayState();
    } catch (error) {
      console.error('Failed to add card:', error);
      alert('Failed to add card. Please try again.');
    }
  };

  return (
    <main className="page page-dictionary">
      <div className="page-content">
        <h1 className="page-title">Dictionary</h1>
        <p className="page-body">Find any Japanese word in seconds.</p>
      

        <section style={{marginTop: '1.5rem', width: '90vw'}}>
          <TranslationInput onTranslate={handleSearch} initialTab="search" hideTabs={true} />
          {/* POS filter dropdown */}
          <div style={{ marginTop: '0.5rem' }}>
            <label htmlFor="pos-filter" style={{ marginRight: '0.5rem' }}>Part of speech:</label>
            <select
              id="pos-filter"
              value={pos ?? ''}
              onChange={(e) => {
                const v = e.target.value as '' | SearchPos;
                handlePosChange(v === '' ? null : v);
              }}
              style={{ padding: '0.4rem 0.6rem', borderRadius: '6px', border: '1px solid #ddd' }}
            >
              <option value="">--</option>
              <option value={SearchPos.NOUN}>Noun</option>
              <option value={SearchPos.VERB}>Verb</option>
              <option value={SearchPos.ADJECTIVE}>Adjective</option>
            </select>
          </div>
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
              <div style={{ marginBottom: '1rem', padding: '0.5rem', background: '#e8f5e8', borderRadius: '4px', color: '#2e7d32', width: '50%', marginLeft: 'auto', marginRight: 'auto', textAlign: 'center' }}>
                {searchResults.message}
              </div>
              <h3>
                {searchResults.total_count} {searchResults.total_count === 1 ? 'result' : 'results'} found for '{searchResults.query}'
              </h3>
              {/* More examples card rendering */}
              {showMoreExamplesIdx !== null ? (() => {
                const result = searchResults.results[(page - 1) * PAGE_SIZE + showMoreExamplesIdx];
                if (!result) return null;
                // Gather all examples from all meanings
                const allExamples = result.meanings.flatMap(m => m.examples || []);
                return (
                  <div className="more-example-card" style={{
                    position: 'relative',
                    display: 'flex',
                    flexDirection: 'row',
                    width: '80vw',
                    minHeight: '350px',
                    margin: '2rem auto',
                    background: '#fff',
                    border: '2px solid #d32f2f',
                    borderRadius: '18px',
                    boxShadow: '0 2px 12px rgba(0,0,0,0.07)',
                    overflow: 'hidden',
                  }}>
                    {/* X button in top right */}
                    <button
                      style={{
                        position: 'absolute',
                        top: '18px',
                        right: '22px',
                        background: 'none',
                        border: 'none',
                        color: '#d32f2f',
                        fontSize: '2.1em',
                        fontWeight: 700,
                        cursor: 'pointer',
                        zIndex: 2,
                        lineHeight: 1,
                      }}
                      aria-label="Close"
                      title="Close"
                      onClick={() => setShowMoreExamplesIdx(null)}
                    >
                      ×
                    </button>
                    {/* Left: word card (1/4 width) */}
                    <div style={{
                      width: '25%',
                      minWidth: '180px',
                      maxWidth: '350px',
                      background: '#fbe9e7',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      padding: '2.5rem 1.5rem 1.5rem 2rem',
                      borderRight: '2px solid #d32f2f',
                    }}>
                      {/* Word centered */}
                      <div style={{ marginBottom: '1.5rem', fontWeight: 700, fontSize: '2.7em', color: '#d32f2f', textAlign: 'center', width: '100%' }}>
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
                              <ruby style={{ fontSize: '1em', fontWeight: 700 }}>
                                {word}
                                <rt style={{ fontSize: '0.45em', fontWeight: 500 }}>{reading}</rt>
                              </ruby>
                            );
                          }
                          return (<strong style={{ fontSize: '1em', fontWeight: 700 }}>{word}</strong>);
                        })()}
                      </div>
                      {/* Tag centered */}
                      {result.is_common && (
                        <span style={{ background: '#4CAF50', color: 'black', padding: '4px 16px', borderRadius: '12px', fontSize: '1em', fontWeight: 600, marginBottom: '1.2rem', textAlign: 'center', width: '100%', display: 'inline-block' }}>
                          common word
                        </span>
                      )}
                    </div>
                    {/* Right: all examples (3/4 width) */}
                    <div style={{
                      width: '75%',
                      padding: '2.5rem 2.5rem 2rem 2.5rem',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'flex-start',
                    }}>
                      <div style={{ fontWeight: 700, fontSize: '2em', color: '#d32f2f', marginBottom: '1.5rem', letterSpacing: '0.02em', textAlign: 'center', width: '100%' }}>ALL EXAMPLES</div>
                      {allExamples.length === 0 ? (
                        <div style={{ color: '#888', fontSize: '1.2em', fontStyle: 'italic', textAlign: 'center', width: '100%' }}>No examples available.</div>
                      ) : (
                        <ul style={{ listStyle: 'none', padding: 0, margin: 0, width: '100%' }}>
                          {allExamples.map((ex, idx) => (
                            <li key={idx} style={{ marginBottom: '1.2rem', display: 'flex', alignItems: 'center', gap: '2.2rem', fontSize: '1.15em' }}>
                              <div style={{ fontWeight: 500, color: '#222', minWidth: '120px', textAlign: 'left' }}>{ex.japanese}</div>
                              <div style={{ color: '#888', fontStyle: 'italic', textAlign: 'left' }}>{ex.english}</div>
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  </div>
                );
              })() : (
                // ...existing code...
                <ul className="dictionary-results-list" style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                  {(() => {
                    const total = searchResults.results.length;
                    const start = (page - 1) * PAGE_SIZE;
                    const end = Math.min(start + PAGE_SIZE, total);
                    const pageResults = searchResults.results.slice(start, end);
                    return pageResults.map((result, index) => (
                      <li key={index} style={{ margin: '3rem 0' }}>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 2.7fr',gap: '2rem' }}>
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
                              <button 
                                onClick={() => handleAddToDeckClick(result)}
                                style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer' }} 
                                title="Add to Deck"
                              >
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
                                onClick={() => setShowMoreExamplesIdx(index)}
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
                    ));
                  })()}
                </ul>
              )}
            </div>
          )}
          {searchResults && searchResults.success && searchResults.results.length === 0 && (
            <div style={{ marginTop: '1rem', padding: '1rem', textAlign: 'center', color: '#666' }}>
              No results found for '{searchResults.query}'. Try a different search term.
            </div>
          )}
          {/* Pagination controls: numbered page selector based on available results */}
          {searchResults && searchResults.success && (() => {
            const total = searchResults.results.length;
            const totalPages = Math.ceil(total / PAGE_SIZE);
            if (totalPages <= 1) return null;
            const buttons = Array.from({ length: totalPages }, (_, i) => i + 1);
            return (
              <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.5rem', marginTop: '1rem' }}>
                {buttons.map((p) => (
                  <button
                    key={p}
                    onClick={() => handlePageChange(p)}
                    disabled={isLoading}
                    style={{
                      width: '40px',
                      height: '40px',
                      borderRadius: '8px',
                      border: '1px solid #333',
                      background: p === page ? '#8b0000ff' : '#8b0000ff',
                      color: '#fff',
                      cursor: isLoading ? 'not-allowed' : 'pointer',
                      opacity: p === page ? 1 : 0.85,
                    }}
                  >
                    {p}
                  </button>
                ))}
              </div>
            );
          })()}
        </section>
      </div>

      {/* Add to Deck Overlay */}
      {showAddToDeckOverlay && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0, 0, 0, 0.5)',
            backdropFilter: 'blur(4px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
          }}
          onClick={(e) => {
            if (e.target === e.currentTarget) handleCloseOverlay();
          }}
        >
          <div
            style={{
              position: 'relative',
              background: '#fff',
              borderRadius: '16px',
              width: '90vw',
              maxWidth: '900px',
              maxHeight: '85vh',
              overflow: 'auto',
              padding: '2rem',
              boxShadow: '0 8px 32px rgba(0,0,0,0.2)',
            }}
          >
            {/* Close button */}
            <button
              onClick={handleCloseOverlay}
              style={{
                position: 'absolute',
                top: '1rem',
                right: '1rem',
                background: 'none',
                border: 'none',
                fontSize: '2rem',
                cursor: 'pointer',
                color: '#666',
                fontWeight: 700,
                lineHeight: 1,
              }}
            >
              ×
            </button>

            {/* Back button (only in add-card view) */}
            {overlayView === 'add-card' && (
              <button
                onClick={handleBackToDeckSelect}
                style={{
                  position: 'absolute',
                  top: '1rem',
                  left: '1rem',
                  background: 'none',
                  border: 'none',
                  fontSize: '1.5rem',
                  cursor: 'pointer',
                  color: '#666',
                  fontWeight: 700,
                }}
              >
                ←
              </button>
            )}

            {/* Deck Selection View */}
            {overlayView === 'deck-select' && (
              <div>
                <h2 style={{ marginBottom: '1.5rem', marginTop: '0.5rem', textAlign: 'center' }}>
                  Choose the Deck you want to add to
                </h2>
                {isLoadingDecks ? (
                  <p style={{ textAlign: 'center', padding: '2rem' }}>Loading decks...</p>
                ) : userDecks.length === 0 ? (
                  <p style={{ textAlign: 'center', padding: '2rem', color: '#666' }}>
                    No decks available. Please create a deck first.
                  </p>
                ) : (
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '1rem' }}>
                    {userDecks.map((deck) => (
                      <div
                        key={deck.id}
                        onClick={() => handleDeckSelect(deck.id)}
                        style={{
                          padding: '1.5rem',
                          border: '2px solid #ddd',
                          borderRadius: '12px',
                          cursor: 'pointer',
                          transition: 'all 0.2s',
                          background: '#fff',
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.borderColor = '#BC002D';
                          e.currentTarget.style.transform = 'translateY(-2px)';
                          e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.1)';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.borderColor = '#ddd';
                          e.currentTarget.style.transform = 'translateY(0)';
                          e.currentTarget.style.boxShadow = 'none';
                        }}
                      >
                        <h3 style={{ margin: '0 0 0.5rem 0', fontSize: '1.2rem', color: '#BC002D' }}>{deck.name}</h3>
                        <p style={{ margin: 0, color: '#666', fontSize: '0.9rem' }}>
                          {deck.flashcard_count} cards
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Add Card View */}
            {overlayView === 'add-card' && selectedWord && (
              <div>
                <h2 style={{ marginBottom: '1.5rem', marginTop: '0.5rem', textAlign: 'center' }}>
                  Add New Card
                </h2>
                
                {/* Card input form */}
                <div style={{ background: '#f9f9f9', padding: '1.5rem', borderRadius: '12px', marginBottom: '1.5rem' }}>
                  <div style={{ marginBottom: '1rem' }}>
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>Front (Question)</label>
                    <input
                      type="text"
                      value={cardFront}
                      onChange={(e) => setCardFront(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '0.75rem',
                        border: '1px solid #ddd',
                        borderRadius: '8px',
                        fontSize: '1rem',
                        boxSizing: 'border-box',
                      }}
                    />
                  </div>
                  <div style={{ marginBottom: '1rem' }}>
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>Back (Answer)</label>
                    <input
                      type="text"
                      value={cardBack}
                      onChange={(e) => setCardBack(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '0.75rem',
                        border: '1px solid #ddd',
                        borderRadius: '8px',
                        fontSize: '1rem',
                        boxSizing: 'border-box',
                      }}
                    />
                  </div>
                  <div style={{ marginBottom: '1rem' }}>
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>Example (Optional)</label>
                    <input
                      type="text"
                      value={cardExample}
                      onChange={(e) => setCardExample(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '0.75rem',
                        border: '1px solid #ddd',
                        borderRadius: '8px',
                        fontSize: '1rem',
                        boxSizing: 'border-box',
                      }}
                    />
                  </div>
                  <button
                    onClick={handleAddCard}
                    style={{
                      width: '100%',
                      padding: '1rem',
                      background: '#BC002D',
                      color: '#fff',
                      border: 'none',
                      borderRadius: '8px',
                      fontSize: '1rem',
                      fontWeight: 700,
                      cursor: 'pointer',
                    }}
                  >
                    + Add Card
                  </button>
                </div>

                {/* Word information for reference */}
                <div style={{ background: '#fff', border: '1px solid #ddd', borderRadius: '12px', padding: '1.5rem' }}>
                  <h3 style={{ margin: '0 0 1rem 0', color: '#BC002D' }}>Word Information</h3>
                  
                  <div style={{ marginBottom: '1rem' }}>
                    <strong style={{ fontSize: '1.5rem' }}>{selectedWord.word}</strong>
                    {selectedWord.reading && <span style={{ marginLeft: '0.5rem', color: '#666' }}>({selectedWord.reading})</span>}
                  </div>

                  {/* Meanings */}
                  {selectedWord.meanings?.map((meaning: any, idx: number) => (
                    <div key={idx} style={{ marginBottom: '1rem' }}>
                      <div style={{ color: '#666', fontSize: '0.9rem', marginBottom: '0.25rem' }}>
                        <strong>Part of speech:</strong> {meaning.pos?.join(', ') || 'N/A'}
                      </div>
                      <div style={{ marginBottom: '0.5rem' }}>
                        <strong>Definitions:</strong>
                        <ul style={{ margin: '0.25rem 0', paddingLeft: '1.5rem' }}>
                          {meaning.definitions?.map((def: string, defIdx: number) => (
                            <li key={defIdx}>{def}</li>
                          ))}
                        </ul>
                      </div>
                      {meaning.examples?.length > 0 && (
                        <div>
                          <strong>Examples:</strong>
                          <ul style={{ margin: '0.25rem 0', paddingLeft: '1.5rem' }}>
                            {meaning.examples.map((ex: any, exIdx: number) => (
                              <li key={exIdx} style={{ marginBottom: '0.25rem' }}>
                                <div>{ex.japanese}</div>
                                <div style={{ color: '#888', fontSize: '0.9rem', fontStyle: 'italic' }}>{ex.english}</div>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </main>
  );
};

export default DictionaryPage;
