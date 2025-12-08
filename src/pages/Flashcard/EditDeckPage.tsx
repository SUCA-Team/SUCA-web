import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import ApiService, { type FlashcardResponse, type FlashcardCreate } from '../../services/apiService';

interface CardInProgress extends FlashcardResponse {
  isNew?: boolean;
  isModified?: boolean;
  isDeleted?: boolean;
  example?: string;
}

// Helper functions to encode/decode example into back field
const encodeBackWithExample = (back: string, example?: string): string => {
  if (!example || example.trim() === '') {
    return back;
  }
  return `${back} {${example}}`;
};

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

export const EditDeckPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { deckId } = useParams<{ deckId: string }>();
  const returnTo = (location.state as { returnTo?: string })?.returnTo;
  const returnDeckId = (location.state as { deckId?: number })?.deckId;
  const [deckName, setDeckName] = useState('');
  const [description, setDescription] = useState('');
  const [isPublic, setIsPublic] = useState(false);
  const [cardFront, setCardFront] = useState('');
  const [cardBack, setCardBack] = useState('');
  const [cardExample, setCardExample] = useState('');
  const [cardsInDeck, setCardsInDeck] = useState<CardInProgress[]>([]);
  const [originalCards, setOriginalCards] = useState<FlashcardResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [editingCardId, setEditingCardId] = useState<number | null>(null);
  const [originalEditingCard, setOriginalEditingCard] = useState<{ front: string; back: string; example: string } | null>(null);
  const [modalMessage, setModalMessage] = useState<{ title: string; message: string; type: 'info' | 'error' | 'success' | 'confirm'; onConfirm?: () => void } | null>(null);

  const hasUnsavedChanges = () => {
    // Check if deck info changed or cards changed
    const cardsChanged = cardsInDeck.some(c => c.isNew || c.isModified || c.isDeleted) ||
                        cardsInDeck.length !== originalCards.length;
    const inputsChanged = cardFront.trim() !== '' || cardBack.trim() !== '' || cardExample.trim() !== '';
    return cardsChanged || inputsChanged;
  };

  useEffect(() => {
    const loadDeckData = async () => {
      if (!deckId) {
        navigate('/flashcard');
        return;
      }

      setIsLoading(true);
      try {
        const api = ApiService.getInstance();
        const deck = await api.getDeck(Number(deckId));
        setDeckName(deck.name);
        setDescription(deck.description || '');
        setIsPublic(deck.is_public);

        const flashcardsRes = await api.listFlashcards(Number(deckId));
        setOriginalCards(flashcardsRes.flashcards);
        // Decode the back field to extract example if present
        setCardsInDeck(flashcardsRes.flashcards.map(card => {
          const { back, example } = decodeBackWithExample(card.back);
          return { ...card, back, example };
        }));
      } catch (e) {
        console.error('Failed to load deck:', e);
        setModalMessage({ title: 'Message', message: 'Failed to load deck', type: 'error' });
        navigate('/flashcard');
      } finally {
        setIsLoading(false);
      }
    };

    loadDeckData();
  }, [deckId, navigate]);

  const handleBackToHome = () => {
    if (hasUnsavedChanges()) {
      const modal = document.createElement('div');
      modal.style.cssText = 'position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.5); display: flex; align-items: center; justify-content: center; z-index: 1000;';
      
      const dialog = document.createElement('div');
      dialog.style.cssText = 'background: white; padding: 2rem; border-radius: 12px; max-width: 400px; text-align: center;';
      
      dialog.innerHTML = `
        <h3 style="margin: 0 0 1rem 0; font-size: 1.25rem;">Unsaved Changes</h3>
        <p style="margin: 0 0 1.5rem 0; color: #666;">You have unsaved changes. What would you like to do?</p>
        <div style="display: flex; gap: 1rem; justify-content: center;">
          <button id="discardBtn" style="padding: 0.75rem 1.5rem; border: none; border-radius: 8px; background: #f44336; color: white; font-weight: 600; cursor: pointer;">Discard Changes</button>
          <button id="saveBtn" style="padding: 0.75rem 1.5rem; border: none; border-radius: 8px; background: #4CAF50; color: white; font-weight: 600; cursor: pointer;">Update Deck</button>
        </div>
      `;
      
      modal.appendChild(dialog);
      document.body.appendChild(modal);
      
      document.getElementById('discardBtn')?.addEventListener('click', () => {
        document.body.removeChild(modal);
        if (returnTo === 'deckView' && returnDeckId) {
          navigate('/flashcard', { state: { viewDeckId: returnDeckId } });
        } else {
          navigate('/flashcard');
        }
      });
      
      document.getElementById('saveBtn')?.addEventListener('click', () => {
        document.body.removeChild(modal);
        handleUpdateDeck();
      });
      
      modal.addEventListener('click', (e) => {
        if (e.target === modal) {
          document.body.removeChild(modal);
        }
      });
    } else {
      if (returnTo === 'deckView' && returnDeckId) {
        navigate('/flashcard', { state: { viewDeckId: returnDeckId } });
      } else {
        navigate('/flashcard');
      }
    }
  };

  const handleAddCard = () => {
    if (!cardFront.trim() || !cardBack.trim()) {
      setModalMessage({ title: 'Missing Fields', message: 'Please enter both Front (Question) and Back (Answer) to add a card.', type: 'info' });
      return;
    }

    const newCard: CardInProgress = {
      id: Date.now(),
      deck_id: Number(deckId),
      user_id: '',
      front: cardFront.trim(),
      back: cardBack.trim(),
      example: cardExample.trim() || undefined,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      difficulty: 0,
      stability: 0,
      reps: 0,
      state: 0,
      due: new Date().toISOString(),
      isNew: true,
    };

    setCardsInDeck((prev) => [...prev, newCard]);
    setCardFront('');
    setCardBack('');
    setCardExample('');
  };

  const handleEditCard = (cardId: number) => {
    const card = cardsInDeck.find(c => c.id === cardId);
    if (!card) return;

    // Load card data into the form
    setCardFront(card.front);
    setCardBack(card.back);
    setCardExample(card.example || '');
    setEditingCardId(cardId);
    setOriginalEditingCard({
      front: card.front,
      back: card.back,
      example: card.example || '',
    });
  };

  const handleUpdateCard = () => {
    if (!editingCardId) return;

    if (!cardFront.trim() || !cardBack.trim()) {
      setModalMessage({ title: 'Missing Fields', message: 'Both Front and Back are required', type: 'info' });
      return;
    }

    setCardsInDeck((prev) =>
      prev.map((c) =>
        c.id === editingCardId
          ? { ...c, front: cardFront.trim(), back: cardBack.trim(), example: cardExample.trim() || undefined, isModified: !c.isNew }
          : c
      )
    );

    // Clear the form
    setCardFront('');
    setCardBack('');
    setCardExample('');
    setEditingCardId(null);
    setOriginalEditingCard(null);
  };

  const handleCancelEdit = () => {
    if (!originalEditingCard) {
      // No changes, just cancel
      setCardFront('');
      setCardBack('');
      setCardExample('');
      setEditingCardId(null);
      setOriginalEditingCard(null);
      return;
    }

    // Check if there are unsaved changes
    const hasChanges = cardFront !== originalEditingCard.front || 
                       cardBack !== originalEditingCard.back ||
                       cardExample !== originalEditingCard.example;

    if (hasChanges) {
      const modal = document.createElement('div');
      modal.style.cssText = 'position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.5); display: flex; align-items: center; justify-content: center; z-index: 1000;';
      
      const dialog = document.createElement('div');
      dialog.style.cssText = 'background: white; padding: 2rem; border-radius: 12px; max-width: 400px; text-align: center;';
      
      dialog.innerHTML = `
        <h3 style="margin: 0 0 1rem 0; font-size: 1.25rem;">Unsaved Changes</h3>
        <p style="margin: 0 0 1.5rem 0; color: #666;">You have unsaved changes to this card. What would you like to do?</p>
        <div style="display: flex; gap: 1rem; justify-content: center;">
          <button id="discardBtn" style="padding: 0.75rem 1.5rem; border: none; border-radius: 8px; background: #f44336; color: white; font-weight: 600; cursor: pointer;">Discard Changes</button>
          <button id="updateBtn" style="padding: 0.75rem 1.5rem; border: none; border-radius: 8px; background: #4CAF50; color: white; font-weight: 600; cursor: pointer;">Update Card</button>
        </div>
      `;
      
      modal.appendChild(dialog);
      document.body.appendChild(modal);
      
      document.getElementById('discardBtn')?.addEventListener('click', () => {
        document.body.removeChild(modal);
        setCardFront('');
        setCardBack('');
        setCardExample('');
        setEditingCardId(null);
        setOriginalEditingCard(null);
      });
      
      document.getElementById('updateBtn')?.addEventListener('click', () => {
        document.body.removeChild(modal);
        handleUpdateCard();
      });
      
      modal.addEventListener('click', (e) => {
        if (e.target === modal) {
          document.body.removeChild(modal);
        }
      });
    } else {
      // No changes, just cancel
      setCardFront('');
      setCardBack('');
      setCardExample('');
      setEditingCardId(null);
      setOriginalEditingCard(null);
    }
  };

  const handleRemoveCard = (cardId: number) => {
    const card = cardsInDeck.find(c => c.id === cardId);
    if (!card) return;

    if (card.isNew) {
      // If it's a new card, just remove it from the list
      setCardsInDeck((prev) => prev.filter((c) => c.id !== cardId));
    } else {
      // Mark existing card as deleted
      setCardsInDeck((prev) =>
        prev.map((c) => (c.id === cardId ? { ...c, isDeleted: true } : c))
      );
    }
  };

  const handleUpdateDeck = async () => {
    if (!deckName.trim()) {
      setModalMessage({ title: 'Missing Deck Name', message: 'Please enter a Deck Name to update the deck.', type: 'info' });
      return;
    }

    setIsSaving(true);
    try {
      const api = ApiService.getInstance();
      
      // Update deck info
      await api.updateDeck(Number(deckId), {
        name: deckName.trim(),
        description: description.trim() || null,
        is_public: isPublic,
      });

      // Handle new cards
      const newCards = cardsInDeck.filter((c) => c.isNew && !c.isDeleted);
      if (newCards.length > 0) {
        const flashcards: FlashcardCreate[] = newCards.map((card) => ({
          front: card.front,
          back: encodeBackWithExample(card.back, card.example),
        }));
        await api.bulkCreateFlashcards(Number(deckId), { cards: flashcards });
      }

      // Handle modified cards
      const modifiedCards = cardsInDeck.filter((c) => c.isModified && !c.isDeleted);
      if (modifiedCards.length > 0) {
        const updates = modifiedCards.map((card) => ({
          id: card.id,
          front: card.front,
          back: encodeBackWithExample(card.back, card.example),
        }));
        await api.bulkUpdateFlashcards(Number(deckId), { updates });
      }

      // Handle deleted cards
      const deletedCards = cardsInDeck.filter((c) => c.isDeleted);
      if (deletedCards.length > 0) {
        const cardIds = deletedCards.map((c) => c.id);
        await api.bulkDeleteFlashcards(Number(deckId), { card_ids: cardIds });
      }

      setModalMessage({ 
        title: 'Success', 
        message: `Deck "${deckName}" updated successfully!`, 
        type: 'success',
        onConfirm: () => {
          if (returnTo === 'deckView' && returnDeckId) {
            navigate('/flashcard', { state: { viewDeckId: returnDeckId } });
          } else {
            navigate('/flashcard');
          }
        }
      });
    } catch (e) {
      console.error('Failed to update deck:', e);
      setModalMessage({ title: 'Message', message: 'Failed to update deck. Please try again.', type: 'error' });
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <main className="page" style={{ background: '#f5f5f5', minHeight: '100vh', padding: '2rem' }}>
        <div style={{ textAlign: 'center', paddingTop: '4rem' }}>Loading...</div>
      </main>
    );
  }

  const visibleCards = cardsInDeck.filter((c) => !c.isDeleted);

  return (
    <main className="page" style={{ background: '#f5f5f5', minHeight: '100vh', padding: '2rem' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
          <h1 style={{ margin: 0, fontSize: '2rem', fontWeight: 700 }}>Edit {deckName} Deck</h1>
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

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', alignItems: 'start' }}>
          {/* Left Column - Deck Information + Add New Card */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div style={{
              background: '#fff',
              borderRadius: '16px',
              padding: '2rem',
              boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                <h2 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 600 }}>Deck Information</h2>
                <button
                  onClick={handleUpdateDeck}
                  disabled={!deckName.trim() || isSaving}
                  style={{
                    padding: '0.6rem 1.2rem',
                    border: 'none',
                    borderRadius: '8px',
                    background: deckName.trim() ? '#2196F3' : '#ccc',
                    color: '#fff',
                    fontSize: '0.9rem',
                    fontWeight: 700,
                    cursor: deckName.trim() ? 'pointer' : 'not-allowed',
                  }}
                >
                  {isSaving ? 'Updating...' : 'Update Deck'}
                </button>
              </div>
              
              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500, fontSize: '0.95rem' }}>
                  Deck Name
                </label>
                <input
                  type="text"
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

              <div style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <label style={{ fontWeight: 500, fontSize: '0.95rem' }}>Make deck public</label>
                <label style={{ position: 'relative', display: 'inline-block', width: '50px', height: '24px' }}>
                  <input
                    type="checkbox"
                    checked={isPublic}
                    onChange={(e) => setIsPublic(e.target.checked)}
                    style={{ opacity: 0, width: 0, height: 0 }}
                  />
                  <span
                    style={{
                      position: 'absolute',
                      cursor: 'pointer',
                      top: 0,
                      left: 0,
                      right: 0,
                      bottom: 0,
                      backgroundColor: isPublic ? '#2196F3' : '#ccc',
                      transition: '0.4s',
                      borderRadius: '24px',
                    }}
                  >
                    <span
                      style={{
                        position: 'absolute',
                        content: '',
                        height: '18px',
                        width: '18px',
                        left: isPublic ? '28px' : '3px',
                        bottom: '3px',
                        backgroundColor: 'white',
                        transition: '0.4s',
                        borderRadius: '50%',
                      }}
                    />
                  </span>
                </label>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#666', fontSize: '0.9rem' }}>
                <img src="/src/assets/CardCountIcon.png" alt="Total Cards" style={{ width: '20px', height: '20px' }} />
                <span style={{ fontWeight: 500 }}>Total Cards</span>
                <span style={{ marginLeft: 'auto', fontWeight: 700, fontSize: '1.1rem' }}>{visibleCards.length}</span>
              </div>
            </div>

            {/* Add New Card */}
            <div style={{
              background: '#fff',
              borderRadius: '16px',
              padding: '2rem',
              boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
              position: 'relative',
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                <h2 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 600 }}>
                  {editingCardId ? 'Update This Card' : 'Add New Card'}
                </h2>
                {editingCardId ? (
                  <button
                    onClick={handleCancelEdit}
                    style={{
                      background: 'transparent',
                      border: 'none',
                      cursor: 'pointer',
                      fontSize: '1.5rem',
                      color: '#666',
                      padding: '0',
                      width: '32px',
                      height: '32px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      borderRadius: '4px',
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.background = '#f5f5f5'}
                    onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                  >
                    ✕
                  </button>
                ) : (
                  <button
                    onClick={handleAddCard}
                    style={{
                      padding: '0.6rem 1.2rem',
                      border: 'none',
                      borderRadius: '8px',
                      background: '#4CAF50',
                      color: '#fff',
                      fontSize: '0.9rem',
                      fontWeight: 700,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.3rem',
                    }}
                  >
                    <span style={{ fontSize: '1.2rem' }}>+</span>
                    Add Card
                  </button>
                )}
              </div>
              
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

              {editingCardId && (
                <button
                  onClick={handleUpdateCard}
                  style={{
                    width: '100%',
                    padding: '1rem',
                    border: 'none',
                    borderRadius: '12px',
                    background: '#2196F3',
                    color: '#fff',
                    fontSize: '1rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                  }}
                >
                  Update Card
                </button>
              )}
            </div>
          </div>

          {/* Right Column - Cards in Deck (increased height) */}
          <div>
            <div style={{
              background: '#fff',
              borderRadius: '16px',
              padding: '2rem',
              boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
              height: '100%',
              minHeight: '700px',
              maxHeight: '800px',
              overflowY: 'auto',
              display: 'flex',
              flexDirection: 'column',
            }}>
              <h2 style={{ margin: '0 0 1rem 0', fontSize: '1.25rem', fontWeight: 600 }}>
                Cards in Deck ({visibleCards.length})
              </h2>
              
              {visibleCards.length === 0 ? (
                <div style={{ textAlign: 'center', color: '#999', padding: '2rem 0' }}>
                  <p style={{ margin: 0 }}>No cards yet.</p>
                  <p style={{ margin: '0.5rem 0 0 0', fontSize: '0.9rem' }}>Add your first card above!</p>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  {visibleCards.map((card) => (
                    <div
                      key={card.id}
                      style={{
                        padding: '1rem',
                        border: `1px solid ${card.isNew ? '#4CAF50' : card.isModified ? '#2196F3' : '#e0e0e0'}`,
                        borderRadius: '8px',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        backgroundColor: card.isNew ? '#f1f8f4' : card.isModified ? '#e3f2fd' : '#fff',
                      }}
                    >
                      <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: 600, marginBottom: '0.25rem' }}>
                          {card.front}
                          {card.isNew && <span style={{ marginLeft: '0.5rem', fontSize: '0.75rem', color: '#4CAF50', fontWeight: 700 }}>(NEW)</span>}
                          {card.isModified && <span style={{ marginLeft: '0.5rem', fontSize: '0.75rem', color: '#2196F3', fontWeight: 700 }}>(MODIFIED)</span>}
                        </div>
                        <div style={{ color: '#666', fontSize: '0.9rem' }}>{card.back}</div>
                        {card.example && (
                          <div style={{ color: '#999', fontSize: '0.85rem', marginTop: '0.25rem', fontStyle: 'italic' }}>
                            Ex: {card.example}
                          </div>
                        )}
                      </div>
                      <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <button
                          onClick={() => handleEditCard(card.id)}
                          style={{
                            background: '#e3f2fd',
                            border: 'none',
                            borderRadius: '6px',
                            padding: '0.5rem 0.75rem',
                            color: '#1976d2',
                            cursor: 'pointer',
                            fontSize: '0.85rem',
                            fontWeight: 600,
                          }}
                        >
                          Edit
                        </button>
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
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Custom Modal Dialog */}
      {modalMessage && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0,0,0,0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 2000,
          }}
          onClick={(e) => {
            if (e.target === e.currentTarget && modalMessage.type !== 'confirm') {
              setModalMessage(null);
            }
          }}
        >
          <div
            style={{
              background: 'white',
              padding: '2rem',
              borderRadius: '12px',
              maxWidth: '400px',
              textAlign: 'center',
              boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
            }}
          >
            <h3 style={{ margin: '0 0 1rem 0', fontSize: '1.25rem', color: '#333' }}>
              {modalMessage.title}
            </h3>
            <p style={{ margin: '0 0 1.5rem 0', color: '#666', lineHeight: '1.5' }}>
              {modalMessage.message}
            </p>
            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
              {modalMessage.type === 'confirm' ? (
                <>
                  <button
                    onClick={() => setModalMessage(null)}
                    style={{
                      padding: '0.75rem 1.5rem',
                      border: 'none',
                      borderRadius: '8px',
                      background: '#9e9e9e',
                      color: 'white',
                      fontWeight: 600,
                      cursor: 'pointer',
                    }}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => {
                      if (modalMessage.onConfirm) modalMessage.onConfirm();
                      setModalMessage(null);
                    }}
                    style={{
                      padding: '0.75rem 1.5rem',
                      border: 'none',
                      borderRadius: '8px',
                      background: '#2196F3',
                      color: 'white',
                      fontWeight: 600,
                      cursor: 'pointer',
                    }}
                  >
                    OK
                  </button>
                </>
              ) : (
                <button
                  onClick={() => {
                    if (modalMessage.onConfirm) modalMessage.onConfirm();
                    setModalMessage(null);
                  }}
                  style={{
                    padding: '0.75rem 1.5rem',
                    border: 'none',
                    borderRadius: '8px',
                    background: modalMessage.type === 'success' ? '#4CAF50' : modalMessage.type === 'error' ? '#f44336' : '#2196F3',
                    color: 'white',
                    fontWeight: 600,
                    cursor: 'pointer',
                  }}
                >
                  OK
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </main>
  );
};

export default EditDeckPage;
