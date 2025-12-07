import React, { useState, useEffect, useContext } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContextValue';
import ApiService, { type FlashcardResponse, type DeckResponse } from '../../services/apiService';

export const ViewPublicDeckCardsPage: React.FC = () => {
  const navigate = useNavigate();
  const { deckId } = useParams<{ deckId: string }>();
  const { user: firebaseUser, loading: authLoading } = useContext(AuthContext);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [deck, setDeck] = useState<DeckResponse | null>(null);
  const [cards, setCards] = useState<FlashcardResponse[]>([]);

  const isLoggedIn = !!firebaseUser;

  useEffect(() => {
    const loadDeckAndCards = async () => {
      if (!firebaseUser || !deckId) {
        return;
      }

      setIsLoading(true);
      setError(null);
      try {
        await firebaseUser.getIdToken();
        await new Promise(resolve => setTimeout(resolve, 200));
        
        const api = ApiService.getInstance();
        const deckIdNum = parseInt(deckId, 10);
        
        const [deckRes, cardsRes] = await Promise.all([
          api.getPublicDeck(deckIdNum),
          api.listPublicDeckCards(deckIdNum)
        ]);
        
        setDeck(deckRes);
        setCards(cardsRes.flashcards ?? []);
      } catch (e) {
        console.error('Failed to load public deck cards:', e);
        setError(e instanceof Error ? e.message : 'Failed to load public deck cards');
      } finally {
        setIsLoading(false);
      }
    };

    if (!authLoading) {
      loadDeckAndCards();
    }
  }, [firebaseUser, authLoading, deckId]);

  // Helper function to decode back with example
  const decodeBackWithExample = (encodedBack: string): { back: string; example: string } => {
    const match = encodedBack.match(/^(.*?)\s*\{(.*?)\}$/);
    if (match) {
      return { back: match[1].trim(), example: match[2].trim() };
    }
    return { back: encodedBack, example: '' };
  };

  return (
    <main className="page page-flashcard">
      <div className="page-content">
        {authLoading || isLoading ? (
          <p>Loading...</p>
        ) : error ? (
          <p style={{ color: 'red' }}>Error: {error}</p>
        ) : !isLoggedIn ? (
          <>
            <h1 className="page-title">View Deck Cards</h1>
            <p className="page-body">Sign in to view deck cards.</p>
          </>
        ) : (
          <>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
              <h1 className="page-title" style={{ margin: 0 }}>
                {deck ? deck.name : 'Public Deck Cards'}
              </h1>
              <button
                onClick={() => navigate('/flashcard/browse')}
                style={{
                  background: '#666',
                  color: '#fff',
                  border: 'none',
                  borderRadius: 999,
                  padding: '0.6rem 1rem',
                  cursor: 'pointer',
                  fontWeight: 700,
                }}
              >
                Back
              </button>
            </div>
            
            {deck && (
              <div style={{ marginBottom: '2rem' }}>
                <p style={{ fontSize: '1.1rem', color: '#666' }}>
                  {deck.description || 'No description'}
                </p>
                <p style={{ fontSize: '0.95rem', color: '#999' }}>
                  Total Cards: {deck.flashcard_count}
                </p>
              </div>
            )}

            {cards.length === 0 ? (
              <p style={{ textAlign: 'center', fontSize: '1.1rem', color: '#666' }}>
                No cards in this deck.
              </p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', maxWidth: '800px', margin: '0 auto' }}>
                {cards.map((card, index) => {
                  const { back, example } = decodeBackWithExample(card.back);
                  return (
                    <div
                      key={card.id}
                      style={{
                        background: '#fff',
                        borderRadius: '12px',
                        padding: '1.5rem',
                        boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                        border: '1px solid #eee',
                      }}
                    >
                      <div style={{ marginBottom: '1rem' }}>
                        <span style={{ 
                          fontSize: '0.85rem', 
                          color: '#999', 
                          fontWeight: 600 
                        }}>
                          Card {index + 1}
                        </span>
                      </div>
                      <div style={{ marginBottom: '1rem' }}>
                        <div style={{ fontSize: '0.9rem', color: '#666', marginBottom: '0.25rem', fontWeight: 600 }}>
                          Front:
                        </div>
                        <div style={{ fontSize: '1.1rem', color: '#333' }}>
                          {card.front}
                        </div>
                      </div>
                      <div style={{ marginBottom: example ? '1rem' : 0 }}>
                        <div style={{ fontSize: '0.9rem', color: '#666', marginBottom: '0.25rem', fontWeight: 600 }}>
                          Back:
                        </div>
                        <div style={{ fontSize: '1.1rem', color: '#333' }}>
                          {back}
                        </div>
                      </div>
                      {example && (
                        <div>
                          <div style={{ fontSize: '0.9rem', color: '#666', marginBottom: '0.25rem', fontWeight: 600 }}>
                            Example:
                          </div>
                          <div style={{ fontSize: '1rem', color: '#555', fontStyle: 'italic' }}>
                            {example}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </>
        )}
      </div>
    </main>
  );
};

export default ViewPublicDeckCardsPage;
