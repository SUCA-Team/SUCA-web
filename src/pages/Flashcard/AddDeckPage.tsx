import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ApiService, { type FlashcardCreate } from '../../services/apiService';

interface CardInProgress {
  id: string;
  front: string;
  back: string;
  example?: string;
}

// Helper functions to encode/decode example into back field
const encodeBackWithExample = (back: string, example?: string): string => {
  if (!example || example.trim() === '') {
    return back;
  }
  return `${back} {${example}}`;
};

// const decodeBackWithExample = (encodedBack: string): { back: string; example?: string } => {
//   const match = encodedBack.match(/^(.*?)\s*\{(.*?)\}$/);
//   if (match) {
//     return {
//       back: match[1].trim(),
//       example: match[2].trim(),
//     };
//   }
//   return { back: encodedBack };
// };

export const AddDeckPage: React.FC = () => {
  const navigate = useNavigate();
  const [deckName, setDeckName] = useState('');
  const [description, setDescription] = useState('');
  const [cardFront, setCardFront] = useState('');
  const [cardBack, setCardBack] = useState('');
  const [cardExample, setCardExample] = useState('');
  const [cardsInDeck, setCardsInDeck] = useState<CardInProgress[]>([]);
  const [isSaving, setIsSaving] = useState(false);

  const hasUnsavedChanges = deckName.trim() !== '' || description.trim() !== '' || cardsInDeck.length > 0 || cardFront.trim() !== '' || cardBack.trim() !== '' || cardExample.trim() !== '';

  const handleBackToHome = () => {
    if (hasUnsavedChanges) {
      const modal = document.createElement('div');
      modal.style.cssText = 'position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.5); display: flex; align-items: center; justify-content: center; z-index: 1000;';
      
      const dialog = document.createElement('div');
      dialog.style.cssText = 'background: white; padding: 2rem; border-radius: 12px; max-width: 400px; text-align: center;';
      
      dialog.innerHTML = `
        <h3 style="margin: 0 0 1rem 0; font-size: 1.25rem;">Unsaved Changes</h3>
        <p style="margin: 0 0 1.5rem 0; color: #666;">You have unsaved changes. What would you like to do?</p>
        <div style="display: flex; gap: 1rem; justify-content: center;">
          <button id="discardBtn" style="padding: 0.75rem 1.5rem; border: none; border-radius: 8px; background: #f44336; color: white; font-weight: 600; cursor: pointer;">Discard Deck</button>
          <button id="saveBtn" style="padding: 0.75rem 1.5rem; border: none; border-radius: 8px; background: #4CAF50; color: white; font-weight: 600; cursor: pointer;">Save Deck</button>
        </div>
      `;
      
      modal.appendChild(dialog);
      document.body.appendChild(modal);
      
      document.getElementById('discardBtn')?.addEventListener('click', () => {
        document.body.removeChild(modal);
        navigate('/flashcard');
      });
      
      document.getElementById('saveBtn')?.addEventListener('click', () => {
        document.body.removeChild(modal);
        handleSaveDeck();
      });
      
      modal.addEventListener('click', (e) => {
        if (e.target === modal) {
          document.body.removeChild(modal);
        }
      });
    } else {
      navigate('/flashcard');
    }
  };

  const handleAddCard = () => {
    if (!cardFront.trim() || !cardBack.trim()) {
      alert('Please enter both Front (Question) and Back (Answer) to add a card.');
      return;
    }

    const newCard: CardInProgress = {
      id: Date.now().toString(),
      front: cardFront.trim(),
      back: cardBack.trim(),
      example: cardExample.trim() || undefined,
    };

    setCardsInDeck((prev) => [...prev, newCard]);
    setCardFront('');
    setCardBack('');
    setCardExample('');
  };

  const handleRemoveCard = (cardId: string) => {
    setCardsInDeck((prev) => prev.filter((card) => card.id !== cardId));
  };

  const handleSaveDeck = async () => {
    if (!deckName.trim()) {
      alert('Please enter a Deck Name to save the deck.');
      return;
    }

    setIsSaving(true);
    try {
      const api = ApiService.getInstance();
      
      // Create the deck first
      const newDeck = await api.createDeck({
        name: deckName.trim(),
        description: description.trim() || null,
      });

      // If there are cards, bulk create them
      if (cardsInDeck.length > 0) {
        const flashcards: FlashcardCreate[] = cardsInDeck.map((card) => ({
          front: card.front,
          back: encodeBackWithExample(card.back, card.example),
        }));

        await api.bulkCreateFlashcards(newDeck.id, { cards: flashcards });
      }

      alert(`Deck "${deckName}" created successfully with ${cardsInDeck.length} cards!`);
      navigate('/flashcard');
    } catch (e) {
      console.error('Failed to save deck:', e);
      alert('Failed to save deck. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <main className="page" style={{ background: '#f5f5f5', minHeight: '100vh', padding: '2rem' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
          <h1 style={{ margin: 0, fontSize: '2rem', fontWeight: 700 }}>Add New Deck</h1>
          <button
            onClick={handleBackToHome}
            style={{
              background: '#c2185b',
              color: '#fff',
              border: 'none',
              borderRadius: 999,
              padding: '0.6rem 1.5rem',
              cursor: 'pointer',
              fontWeight: 600,
              fontSize: '0.95rem',
            }}
          >
            Back to Home
          </button>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
          {/* Left Column - Deck Information */}
          <div>
            <div style={{
              background: '#fff',
              borderRadius: '16px',
              padding: '2rem',
              boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
              marginBottom: '1.5rem',
            }}>
              <h2 style={{ margin: '0 0 1.5rem 0', fontSize: '1.25rem', fontWeight: 600 }}>Deck Information</h2>
              
              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500, fontSize: '0.95rem' }}>
                  Deck Name
                </label>
                <input
                  type="text"
                  placeholder="Eg.SUCA First"
                  value={deckName}
                  onChange={(e) => setDeckName(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    border: '1px solid #ddd',
                    borderRadius: '8px',
                    fontSize: '0.95rem',
                    boxSizing: 'border-box',
                  }}
                />
              </div>

              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500, fontSize: '0.95rem' }}>
                  Description
                </label>
                <input
                  type="text"
                  placeholder="Eg.Kanji N5"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    border: '1px solid #ddd',
                    borderRadius: '8px',
                    fontSize: '0.95rem',
                    boxSizing: 'border-box',
                  }}
                />
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#666', fontSize: '0.9rem' }}>
                <img src="/src/assets/CardCountIcon.png" alt="Total Cards" style={{ width: '20px', height: '20px' }} />
                <span style={{ fontWeight: 500 }}>Total Cards</span>
                <span style={{ marginLeft: 'auto', fontWeight: 700, fontSize: '1.1rem' }}>{cardsInDeck.length}</span>
              </div>
            </div>

            <button
              onClick={handleSaveDeck}
              disabled={!deckName.trim() || isSaving}
              style={{
                width: '100%',
                padding: '1rem',
                border: 'none',
                borderRadius: '12px',
                background: deckName.trim() ? '#4CAF50' : '#ccc',
                color: '#fff',
                fontSize: '1rem',
                fontWeight: 700,
                cursor: deckName.trim() ? 'pointer' : 'not-allowed',
              }}
            >
              {isSaving ? 'Saving...' : 'Save Deck'}
            </button>
          </div>

          {/* Right Column - Add New Card & Cards in Deck */}
          <div>
            <div style={{
              background: '#fff',
              borderRadius: '16px',
              padding: '2rem',
              boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
              marginBottom: '1.5rem',
            }}>
              <h2 style={{ margin: '0 0 1.5rem 0', fontSize: '1.25rem', fontWeight: 600 }}>Add New Card</h2>
              
              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500, fontSize: '0.95rem' }}>
                  Front (Question)
                </label>
                <input
                  type="text"
                  placeholder="Eg.Arigatou"
                  value={cardFront}
                  onChange={(e) => setCardFront(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    border: '1px solid #ddd',
                    borderRadius: '8px',
                    fontSize: '0.95rem',
                    boxSizing: 'border-box',
                  }}
                />
              </div>

              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500, fontSize: '0.95rem' }}>
                  Back (Answer)
                </label>
                <input
                  type="text"
                  placeholder="Eg.Thank you"
                  value={cardBack}
                  onChange={(e) => setCardBack(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    border: '1px solid #ddd',
                    borderRadius: '8px',
                    fontSize: '0.95rem',
                    boxSizing: 'border-box',
                  }}
                />
              </div>

              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500, fontSize: '0.95rem' }}>
                  Example (Optional)
                </label>
                <input
                  type="text"
                  placeholder="Eg.Arigatou Gozaimasu"
                  value={cardExample}
                  onChange={(e) => setCardExample(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    border: '1px solid #ddd',
                    borderRadius: '8px',
                    fontSize: '0.95rem',
                    boxSizing: 'border-box',
                  }}
                />
              </div>

              <button
                onClick={handleAddCard}
                style={{
                  width: '100%',
                  padding: '1rem',
                  border: 'none',
                  borderRadius: '12px',
                  background: '#4CAF50',
                  color: '#fff',
                  fontSize: '1rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.5rem',
                }}
              >
                <span style={{ fontSize: '1.5rem' }}>+</span>
                Add Card
              </button>
            </div>

            {/* Cards in Deck */}
            <div style={{
              background: '#fff',
              borderRadius: '16px',
              padding: '2rem',
              boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
              maxHeight: '400px',
              overflowY: 'auto',
            }}>
              <h2 style={{ margin: '0 0 1rem 0', fontSize: '1.25rem', fontWeight: 600 }}>
                Cards in Deck ({cardsInDeck.length})
              </h2>
              
              {cardsInDeck.length === 0 ? (
                <div style={{ textAlign: 'center', color: '#999', padding: '2rem 0' }}>
                  <p style={{ margin: 0 }}>No cards yet.</p>
                  <p style={{ margin: '0.5rem 0 0 0', fontSize: '0.9rem' }}>Add your first card above!</p>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  {cardsInDeck.map((card) => (
                    <div
                      key={card.id}
                      style={{
                        padding: '1rem',
                        border: '1px solid #e0e0e0',
                        borderRadius: '8px',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                      }}
                    >
                      <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: 600, marginBottom: '0.25rem' }}>{card.front}</div>
                        <div style={{ color: '#666', fontSize: '0.9rem' }}>{card.back}</div>
                        {card.example && (
                          <div style={{ color: '#999', fontSize: '0.85rem', marginTop: '0.25rem', fontStyle: 'italic' }}>
                            Ex: {card.example}
                          </div>
                        )}
                      </div>
                      <button
                        onClick={() => handleRemoveCard(card.id)}
                        style={{
                          background: '#ffebee',
                          border: 'none',
                          borderRadius: '6px',
                          padding: '0.5rem 0.75rem',
                          color: '#d32f2f',
                          cursor: 'pointer',
                          fontSize: '0.85rem',
                          fontWeight: 600,
                        }}
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
};

export default AddDeckPage;
