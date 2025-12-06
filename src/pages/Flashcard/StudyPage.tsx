import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import ApiService, { type FlashcardResponse } from '../../services/apiService';
import useAuth from '../../hooks/useAuth';

// Helper function to decode example from back field
const decodeBackWithExample = (encodedBack: string): { back: string; example?: string } => {
  const match = encodedBack.match(/^(.*?)\s*\{(.*?)\}$/);
  if (match) {
    return {
      back: match[1].trim(),
      example: match[2].trim(),
    };
  }
  return { back: encodedBack };
};

type StudyMode = 'selection' | 'manual' | 'session' | 'complete';

export const StudyPage: React.FC = () => {
  const navigate = useNavigate();
  const { deckId } = useParams<{ deckId: string }>();
  const auth = useAuth();
  const [mode, setMode] = useState<StudyMode>('selection');
  const [deckName, setDeckName] = useState('');
  const [allCards, setAllCards] = useState<FlashcardResponse[]>([]);
  const [selectedCardIds, setSelectedCardIds] = useState<Set<number>>(new Set());
  const [studyCards, setStudyCards] = useState<FlashcardResponse[]>([]);
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [cardsStudied, setCardsStudied] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const loadDeck = async () => {
      if (!deckId) {
        navigate('/flashcard');
        return;
      }

      // Wait for auth to finish loading
      if (auth?.loading) {
        return;
      }

      try {
        const api = ApiService.getInstance();
        const deck = await api.getDeck(Number(deckId));
        setDeckName(deck.name);
      } catch (e) {
        console.error('Failed to load deck:', e);
        alert('Failed to load deck');
        navigate('/flashcard');
      }
    };

    loadDeck();
  }, [deckId, navigate, auth?.loading]);

  useEffect(() => {
    const loadCards = async () => {
      if (mode !== 'manual' || !deckId) return;

      // Wait for auth to finish loading
      if (auth?.loading) {
        return;
      }

      setIsLoading(true);
      try {
        const api = ApiService.getInstance();
        const flashcardsRes = await api.listFlashcards(Number(deckId));
        setAllCards(flashcardsRes.flashcards);
      } catch (e) {
        console.error('Failed to load cards:', e);
        alert('Failed to load cards');
      } finally {
        setIsLoading(false);
      }
    };

    loadCards();
  }, [mode, deckId, auth?.loading]);

  const handleModeSelect = (selectedMode: 'manual' | 'fsrs') => {
    if (selectedMode === 'manual') {
      setMode('manual');
    } else {
      alert('FSRS SUCA mode coming soon!');
    }
  };

  const handleSelectAll = () => {
    if (selectedCardIds.size === allCards.length) {
      setSelectedCardIds(new Set());
    } else {
      setSelectedCardIds(new Set(allCards.map(c => c.id)));
    }
  };

  const handleToggleCard = (cardId: number) => {
    const newSet = new Set(selectedCardIds);
    if (newSet.has(cardId)) {
      newSet.delete(cardId);
    } else {
      newSet.add(cardId);
    }
    setSelectedCardIds(newSet);
  };

  const handleResetCards = async () => {
    if (selectedCardIds.size === 0) {
      alert('Please select at least one card to reset.');
      return;
    }

    const modal = document.createElement('div');
    modal.style.cssText = 'position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.5); display: flex; align-items: center; justify-content: center; z-index: 1000;';
    
    const dialog = document.createElement('div');
    dialog.style.cssText = 'background: white; padding: 2rem; border-radius: 12px; max-width: 400px; text-align: center;';
    
    dialog.innerHTML = `
      <h3 style="margin: 0 0 1rem 0; font-size: 1.25rem;">Reset Cards?</h3>
      <p style="margin: 0 0 1.5rem 0; color: #666;">Do you want to reset the FSRS state of the selected cards? This will reset their learning progress.</p>
      <div style="display: flex; gap: 1rem; justify-content: center;">
        <button id="noBtn" style="padding: 0.75rem 1.5rem; border: none; border-radius: 8px; background: #9e9e9e; color: white; font-weight: 600; cursor: pointer;">No</button>
        <button id="yesBtn" style="padding: 0.75rem 1.5rem; border: none; border-radius: 8px; background: #f44336; color: white; font-weight: 600; cursor: pointer;">Yes</button>
      </div>
    `;
    
    modal.appendChild(dialog);
    document.body.appendChild(modal);
    
    document.getElementById('noBtn')?.addEventListener('click', () => {
      document.body.removeChild(modal);
    });
    
    document.getElementById('yesBtn')?.addEventListener('click', async () => {
      document.body.removeChild(modal);
      try {
        const api = ApiService.getInstance();
        await api.bulkResetFlashcards(Number(deckId), {
          card_ids: Array.from(selectedCardIds),
        });
        alert('Selected cards have been reset successfully!');
        // Reload cards to reflect changes
        const flashcardsRes = await api.listFlashcards(Number(deckId));
        setAllCards(flashcardsRes.flashcards);
      } catch (e) {
        console.error('Failed to reset cards:', e);
        alert('Failed to reset cards. Please try again.');
      }
    });
    
    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        document.body.removeChild(modal);
      }
    });
  };

  const handleStartStudy = () => {
    if (selectedCardIds.size === 0) {
      alert('Please select at least one card to study.');
      return;
    }

    const selected = allCards.filter(c => selectedCardIds.has(c.id));
    setStudyCards(selected);
    setCurrentCardIndex(0);
    setIsFlipped(false);
    setCardsStudied(0);
    setMode('session');
  };

  const handleCardClick = () => {
    setIsFlipped(!isFlipped);
  };

  const handleRating = async (rating: number) => {
    if (!deckId || currentCardIndex >= studyCards.length) return;

    const currentCard = studyCards[currentCardIndex];
    
    try {
      const api = ApiService.getInstance();
      await api.reviewFlashcard(Number(deckId), currentCard.id, { rating });
      
      setCardsStudied(prev => prev + 1);
      
      // Check if this was the last card
      if (currentCardIndex === studyCards.length - 1) {
        setMode('complete');
      } else {
        setCurrentCardIndex(prev => prev + 1);
        setIsFlipped(false);
      }
    } catch (e) {
      console.error('Failed to submit review:', e);
      alert('Failed to submit review. Please try again.');
    }
  };

  const handleCompleteStudy = () => {
    setMode('complete');
  };

  const handleBackToHome = () => {
    navigate('/flashcard');
  };

  const handleBackToSelection = () => {
    setMode('selection');
    setSelectedCardIds(new Set());
  };

  // Selection Mode View
  if (mode === 'selection') {
    return (
      <main className="page" style={{ background: '#f5f5f5', minHeight: '100vh', padding: '2rem' }}>
        <div style={{ maxWidth: '800px', margin: '0 auto', textAlign: 'center' }}>
          <h1 style={{ fontSize: '2.5rem', fontWeight: 700, marginBottom: '1rem' }}>
            Study: {deckName}
          </h1>
          <p style={{ fontSize: '1.2rem', color: '#666', marginBottom: '3rem' }}>
            Are you ready to SUCA? Choose your option below.
          </p>
          <div style={{ display: 'flex', gap: '2rem', justifyContent: 'center' }}>
            <button
              onClick={() => handleModeSelect('manual')}
              style={{
                padding: '1.5rem 3rem',
                border: 'none',
                borderRadius: '12px',
                background: '#2196F3',
                color: '#fff',
                fontSize: '1.25rem',
                fontWeight: 700,
                cursor: 'pointer',
                boxShadow: '0 4px 12px rgba(33, 150, 243, 0.3)',
              }}
            >
              Manual SUCA
            </button>
            <button
              onClick={() => handleModeSelect('fsrs')}
              style={{
                padding: '1.5rem 3rem',
                border: 'none',
                borderRadius: '12px',
                background: '#4CAF50',
                color: '#fff',
                fontSize: '1.25rem',
                fontWeight: 700,
                cursor: 'pointer',
                boxShadow: '0 4px 12px rgba(76, 175, 80, 0.3)',
              }}
            >
              FSRS SUCA
            </button>
          </div>
        </div>
      </main>
    );
  }

  // Manual Card Selection View
  if (mode === 'manual') {
    return (
      <main className="page" style={{ background: '#f5f5f5', minHeight: '100vh', padding: '2rem' }}>
        <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
          <div style={{ display: 'flex', alignItems: 'center', marginBottom: '2rem' }}>
            <button
              onClick={handleBackToSelection}
              style={{
                background: '#9e9e9e',
                color: '#fff',
                border: 'none',
                borderRadius: '8px',
                padding: '0.5rem 1rem',
                cursor: 'pointer',
                fontWeight: 600,
                marginRight: '1rem',
              }}
            >
              ← Back
            </button>
            <h1 style={{ margin: 0, fontSize: '2rem', fontWeight: 700 }}>
              Select Cards to Study
            </h1>
          </div>

          <div style={{ background: '#fff', borderRadius: '12px', padding: '1.5rem', marginBottom: '1.5rem', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'space-between' }}>
              <button
                onClick={handleSelectAll}
                style={{
                  flex: 1,
                  padding: '1rem',
                  border: '2px solid #2196F3',
                  borderRadius: '8px',
                  background: selectedCardIds.size === allCards.length ? '#2196F3' : '#fff',
                  color: selectedCardIds.size === allCards.length ? '#fff' : '#2196F3',
                  fontSize: '1rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                {selectedCardIds.size === allCards.length ? '✓ All Selected' : 'Select All Cards'}
              </button>
              <button
                onClick={handleResetCards}
                style={{
                  flex: 1,
                  padding: '1rem',
                  border: 'none',
                  borderRadius: '8px',
                  background: '#ff9800',
                  color: '#fff',
                  fontSize: '1rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                Reset Cards
              </button>
              <button
                onClick={handleStartStudy}
                style={{
                  flex: 1,
                  padding: '1rem',
                  border: 'none',
                  borderRadius: '8px',
                  background: '#4CAF50',
                  color: '#fff',
                  fontSize: '1rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                Start SUCA ({selectedCardIds.size})
              </button>
            </div>
          </div>

          {isLoading ? (
            <div style={{ textAlign: 'center', padding: '2rem' }}>Loading cards...</div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {allCards.map((card) => {
                const { back, example } = decodeBackWithExample(card.back);
                const isSelected = selectedCardIds.has(card.id);
                
                return (
                  <div
                    key={card.id}
                    onClick={() => handleToggleCard(card.id)}
                    style={{
                      background: '#fff',
                      borderRadius: '12px',
                      padding: '1.5rem',
                      boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                      cursor: 'pointer',
                      border: `2px solid ${isSelected ? '#4CAF50' : '#e0e0e0'}`,
                      display: 'flex',
                      alignItems: 'center',
                      gap: '1rem',
                    }}
                  >
                    <div
                      style={{
                        width: '24px',
                        height: '24px',
                        borderRadius: '4px',
                        border: `2px solid ${isSelected ? '#4CAF50' : '#9e9e9e'}`,
                        background: isSelected ? '#4CAF50' : '#fff',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: '#fff',
                        fontWeight: 700,
                        flexShrink: 0,
                      }}
                    >
                      {isSelected && '✓'}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 600, fontSize: '1.1rem', marginBottom: '0.5rem' }}>
                        {card.front}
                      </div>
                      <div style={{ color: '#666', fontSize: '0.95rem' }}>{back}</div>
                      {example && (
                        <div style={{ color: '#999', fontSize: '0.85rem', marginTop: '0.25rem', fontStyle: 'italic' }}>
                          Ex: {example}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </main>
    );
  }

  // Study Session View
  if (mode === 'session') {
    const currentCard = studyCards[currentCardIndex];
    const { back, example } = decodeBackWithExample(currentCard.back);
    const progress = ((currentCardIndex) / studyCards.length) * 100;

    return (
      <main className="page" style={{ background: '#f5f5f5', minHeight: '100vh', padding: '2rem' }}>
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
          {/* Progress Bar */}
          <div style={{
            background: '#fff',
            borderRadius: '12px',
            padding: '1.5rem',
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
            marginBottom: '2rem',
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
              <span style={{ fontWeight: 600, color: '#666' }}>Progress</span>
              <span style={{ fontWeight: 700 }}>{currentCardIndex + 1} of {studyCards.length} cards</span>
            </div>
            <div style={{
              width: '100%',
              height: '12px',
              background: '#e0e0e0',
              borderRadius: '999px',
              overflow: 'hidden',
            }}>
              <div style={{
                width: `${progress}%`,
                height: '100%',
                background: '#4CAF50',
                transition: 'width 0.3s ease',
              }} />
            </div>
          </div>

          {/* Flashcard */}
          <div
            onClick={handleCardClick}
            style={{
              background: isFlipped ? '#2196F3' : '#BC002D',
              borderRadius: '16px',
              padding: '4rem 2rem',
              boxShadow: '0 8px 24px rgba(0,0,0,0.15)',
              marginBottom: '2rem',
              minHeight: '300px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              color: '#fff',
              textAlign: 'center',
            }}
          >
            {!isFlipped ? (
              <div style={{ fontSize: '2.5rem', fontWeight: 700 }}>{currentCard.front}</div>
            ) : (
              <div style={{ width: '100%' }}>
                <div style={{ fontSize: '2rem', fontWeight: 700, marginBottom: example ? '2rem' : 0 }}>
                  {back}
                </div>
                {example && (
                  <>
                    <div style={{
                      width: '60%',
                      height: '2px',
                      background: 'rgba(255,255,255,0.5)',
                      margin: '0 auto 1.5rem',
                    }} />
                    <div style={{ fontSize: '1.2rem', fontWeight: 600 }}>
                      Example
                    </div>
                    <div style={{ fontSize: '1.5rem', marginTop: '0.5rem' }}>
                      {example}
                    </div>
                  </>
                )}
              </div>
            )}
          </div>

          {/* Rating Buttons */}
          {isFlipped && (
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(4, 1fr)',
              gap: '1rem',
              marginBottom: '2rem',
            }}>
              <button
                onClick={() => handleRating(1)}
                style={{
                  padding: '1rem',
                  border: 'none',
                  borderRadius: '8px',
                  background: '#8B0000',
                  color: '#fff',
                  fontSize: '1rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                }}
              >
                Again
              </button>
              <button
                onClick={() => handleRating(2)}
                style={{
                  padding: '1rem',
                  border: 'none',
                  borderRadius: '8px',
                  background: '#f44336',
                  color: '#fff',
                  fontSize: '1rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                }}
              >
                Bad
              </button>
              <button
                onClick={() => handleRating(3)}
                style={{
                  padding: '1rem',
                  border: 'none',
                  borderRadius: '8px',
                  background: '#4CAF50',
                  color: '#fff',
                  fontSize: '1rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                }}
              >
                Good
              </button>
              <button
                onClick={() => handleRating(4)}
                style={{
                  padding: '1rem',
                  border: 'none',
                  borderRadius: '8px',
                  background: '#00C853',
                  color: '#fff',
                  fontSize: '1rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                }}
              >
                Very Good
              </button>
            </div>
          )}

          {/* Complete Study Button */}
          <button
            onClick={handleCompleteStudy}
            style={{
              width: '100%',
              padding: '1rem',
              border: 'none',
              borderRadius: '12px',
              background: '#c2185b',
              color: '#fff',
              fontSize: '1rem',
              fontWeight: 700,
              cursor: 'pointer',
            }}
          >
            Complete Study
          </button>
        </div>
      </main>
    );
  }

  // Complete View
  return (
    <main className="page" style={{ background: '#f5f5f5', minHeight: '100vh', padding: '2rem' }}>
      <div style={{ maxWidth: '600px', margin: '0 auto', textAlign: 'center' }}>
        <h1 style={{ fontSize: '3rem', fontWeight: 700, marginBottom: '1rem' }}>
          Session Complete!
        </h1>
        <p style={{ fontSize: '1.2rem', color: '#666', marginBottom: '3rem' }}>
          Great work! Keep practicing to improve your skills!
        </p>

        <div style={{
          background: '#fff',
          borderRadius: '16px',
          padding: '2rem',
          boxShadow: '0 4px 16px rgba(0,0,0,0.1)',
          marginBottom: '2rem',
          display: 'flex',
          alignItems: 'center',
          gap: '1rem',
        }}>
          <div style={{
            width: '60px',
            height: '60px',
            background: '#e3f2fd',
            borderRadius: '12px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '2rem',
          }}>
            🎓
          </div>
          <div style={{ flex: 1, textAlign: 'left' }}>
            <div style={{ fontSize: '0.9rem', color: '#666', marginBottom: '0.25rem' }}>
              Cards Studied
            </div>
            <div style={{ fontSize: '2rem', fontWeight: 700 }}>
              {cardsStudied}
            </div>
            <div style={{ fontSize: '0.85rem', color: '#999' }}>
              out of {studyCards.length} selected
            </div>
          </div>
        </div>

        <button
          onClick={handleBackToHome}
          style={{
            width: '100%',
            maxWidth: '300px',
            padding: '1rem 2rem',
            border: 'none',
            borderRadius: '12px',
            background: '#c2185b',
            color: '#fff',
            fontSize: '1rem',
            fontWeight: 700,
            cursor: 'pointer',
          }}
        >
          Back to Home
        </button>
      </div>
    </main>
  );
};

export default StudyPage;
