import React, { useContext, useEffect, useState } from 'react';
import ApiService, { type DeckResponse, type DeckCreate } from '../../services/apiService';
import { AuthContext } from '../../context/AuthContext';

export const FlashcardPage: React.FC = () => {
  const { user: firebaseUser, loading: authLoading } = useContext(AuthContext);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [decks, setDecks] = useState<DeckResponse[]>([]);

  const isLoggedIn = !!firebaseUser;

  useEffect(() => {
    const loadDecks = async () => {
      if (!firebaseUser) {
        setDecks([]);
        return;
      }

      setIsLoading(true);
      setError(null);
      try {
        // Ensure Firebase token is available before making API calls
        await firebaseUser.getIdToken();
        
        // Small delay to ensure the global auth object is in sync
        await new Promise(resolve => setTimeout(resolve, 200));
        
        const api = ApiService.getInstance();
        const deckRes = await api.listDecks();
        setDecks(deckRes.decks ?? []);
      } catch (e) {
        console.error('Failed to load decks:', e);
        setError(e instanceof Error ? e.message : 'Failed to load decks');
        setDecks([]);
      } finally {
        setIsLoading(false);
      }
    };

    // Only load decks after auth has finished loading
    if (!authLoading) {
      loadDecks();
    }
  }, [firebaseUser, authLoading]);

  const handleCreateDeck = async () => {
    if (!isLoggedIn) return;
    const name = prompt('Name your new deck');
    if (!name) return;
    const description = prompt('Add a description for your deck (optional)') || '';
    try {
      const api = ApiService.getInstance();
      const deckData: DeckCreate = { name, description };
      const newDeck = await api.createDeck(deckData);
      setDecks((prev) => [newDeck, ...prev]);
    } catch (e) {
      alert('Failed to create deck');
    }
  };

  const renderLoggedOut = () => (
    <>
      <h1 className="page-title">Flashcard</h1>
      <p className="page-body">Sign up to create your own flashcards.</p>
    </>
  );

  const renderLoggedInEmpty = () => (
    <>
      <h1 className="page-title" style={{ marginBottom: '1rem' }}>Flashcard</h1>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
        <h2 style={{ margin: 0 }}>Your Decks</h2>
        <button
          onClick={handleCreateDeck}
          style={{
            background: '#c2185b',
            color: '#fff',
            border: 'none',
            borderRadius: 999,
            padding: '0.6rem 1rem',
            cursor: 'pointer',
            fontWeight: 700,
          }}
        >
          Create
        </button>
      </div>
      <p style={{ fontSize: '1.05rem' }}>
        Wanna SUCA? Create your first deck{' '}
        <button
          onClick={handleCreateDeck}
          style={{
            background: 'none',
            border: 'none',
            color: '#c2185b',
            textDecoration: 'underline',
            cursor: 'pointer',
            padding: 0,
            fontSize: '1.05rem',
          }}
        >
          here
        </button>
        .
      </p>
    </>
  );

  const DeckCard: React.FC<{ deck: DeckResponse }> = ({ deck }) => {
    const [showMenu, setShowMenu] = useState(false);

    const handleEditDeck = async () => {
      const newName = prompt('Edit deck name', deck.name);
      if (!newName || newName === deck.name) return;
      try {
        const api = ApiService.getInstance();
        await api.updateDeck(deck.id, { name: newName });
        setDecks((prev) => prev.map(d => d.id === deck.id ? { ...d, name: newName } : d));
        setShowMenu(false);
      } catch (e) {
        alert('Failed to update deck');
      }
    };

    const handleDeleteDeck = async () => {
      if (!confirm(`Delete deck "${deck.name}"?`)) return;
      try {
        const api = ApiService.getInstance();
        await api.deleteDeck(deck.id);
        setDecks((prev) => prev.filter(d => d.id !== deck.id));
        setShowMenu(false);
      } catch (e) {
        alert('Failed to delete deck');
      }
    };

    return (
      <div style={{
        width: '400px',
        height: '400px',
        borderRadius: '16px',
        background: '#fff',
        boxShadow: '0 4px 16px rgba(0,0,0,0.08)',
        overflow: 'hidden',
        border: '1px solid #eee',
        position: 'relative',
        display: 'flex',
        flexDirection: 'column',
      }}>
        <div style={{ background: '#BC002D', height: '150px', position: 'relative' }}>
          <button
            onClick={() => setShowMenu(!showMenu)}
            style={{
              position: 'absolute',
              top: '10px',
              right: '10px',
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
              padding: '4px',
            }}
          >
            <img src="/src/assets/DeckSettingIcon.png" alt="Settings" style={{ width: '36px', height: '8px' }} />
          </button>
        </div>
        {showMenu && (
          <div style={{
            position: 'absolute',
            top: '50px',
            right: '10px',
            background: '#fff',
            borderRadius: '12px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
            zIndex: 10,
            overflow: 'hidden',
            minWidth: '160px',
          }}>
            <button
              onClick={handleEditDeck}
              style={{
                width: '100%',
                padding: '12px 16px',
                border: 'none',
                background: 'transparent',
                textAlign: 'left',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                fontSize: '14px',
                fontWeight: 600,
                color: '#000',
              }}
            >
              <span>Edit Deck</span>
              <div style={{ 
                width: '32px', 
                height: '32px', 
                background: '#e3f2fd', 
                borderRadius: '8px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}>
                <img src="/src/assets/EditDeckIcon.png" alt="Edit" style={{ width: '18px', height: '18px' }} />
              </div>
            </button>
            <button
              onClick={handleDeleteDeck}
              style={{
                width: '100%',
                padding: '12px 16px',
                border: 'none',
                background: '#ffe0e0',
                textAlign: 'left',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                fontSize: '14px',
                fontWeight: 600,
                color: '#000',
              }}
            >
              <span>Delete Deck</span>
              <div style={{ 
                width: '32px', 
                height: '32px', 
                background: '#ffcdd2', 
                borderRadius: '8px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}>
                <img src="/src/assets/DeleteDeckIcon.png" alt="Delete" style={{ width: '18px', height: '18px' }} />
              </div>
            </button>
          </div>
        )}
        <div style={{ padding: '1rem', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'flex-start' }}>
          <div style={{ fontWeight: 700, marginBottom: '0.25rem', color: '#8b0000', fontSize: '1.25rem', textAlign: 'center' }}>{deck.name}</div>
          {deck.description && (
            <div style={{ color: '#444', fontSize: '1rem', marginBottom: '0.75rem', textAlign: 'center' }}>{deck.description}</div>
          )}
          <div style={{ 
            color: '#666', 
            fontSize: '0.9rem', 
            marginBottom: '0.75rem',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            justifyContent: 'center',
          }}>
            <img src="/src/assets/CardCountIcon.png" alt="Cards" style={{ width: '16px', height: '16px' }} />
            {deck.flashcard_count} cards
          </div>
        </div>
        <div style={{ width: '340px', height: '50px' , marginBottom: '30px', marginLeft: 'auto', marginRight: 'auto' }}>
          <button style={{
            width: '340px',
            height: '50px',
            borderRadius: '15px',
            border: 'none',
            padding: '0.5rem 0.8rem',
            background: '#c2185b',
            color: '#fff',
            fontWeight: 700,
            cursor: 'pointer',
            
          }}>Study</button>
        </div>
      </div>
    );
  };

  const renderLoggedInWithDecks = () => (
    <>
      <h1 className="page-title" style={{ marginBottom: '1rem' }}>Flashcard</h1>
      {/* Top cards (metrics) intentionally omitted as per request */}
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', marginBottom: '1rem', width: '100%' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '1400px', maxWidth: '100%' }}>
          <h2 style={{ margin: 0 }}>Your Decks</h2>
          <button
            onClick={handleCreateDeck}
            style={{
              background: '#c2185b',
              color: '#fff',
              border: 'none',
              borderRadius: 999,
              padding: '0.6rem 1rem',
              cursor: 'pointer',
              fontWeight: 700,
            }}
          >
            + Create
          </button>
        </div>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', maxWidth: '1600px', margin: '0 auto', gap: '6rem' }}>
        {decks.map((d) => (
          <DeckCard key={d.id} deck={d} />
        ))}
      </div>
    </>
  );

  return (
    <main className="page page-flashcard">
      <div className="page-content">
        {authLoading || isLoading ? (
          <div style={{ padding: '1rem' }}>Loading...</div>
        ) : error ? (
          <div style={{ padding: '1rem', color: 'red' }}>Error: {error}</div>
        ) : !isLoggedIn ? (
          renderLoggedOut()
        ) : decks.length === 0 ? (
          renderLoggedInEmpty()
        ) : (
          renderLoggedInWithDecks()
        )}
      </div>
    </main>
  );
};

export default FlashcardPage;
