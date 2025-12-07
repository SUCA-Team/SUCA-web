import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContextValue';
import ApiService, { type DeckResponse } from '../../services/apiService';

export const BrowsePublicDecksPage: React.FC = () => {
  const navigate = useNavigate();
  const { user: firebaseUser, loading: authLoading } = useContext(AuthContext);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [publicDecks, setPublicDecks] = useState<DeckResponse[]>([]);

  const isLoggedIn = !!firebaseUser;

  useEffect(() => {
    const loadPublicDecks = async () => {
      if (!firebaseUser) {
        setPublicDecks([]);
        return;
      }

      setIsLoading(true);
      setError(null);
      try {
        await firebaseUser.getIdToken();
        await new Promise(resolve => setTimeout(resolve, 200));
        
        const api = ApiService.getInstance();
        const deckRes = await api.listPublicDecks();
        setPublicDecks(deckRes.decks ?? []);
      } catch (e) {
        console.error('Failed to load public decks:', e);
        setError(e instanceof Error ? e.message : 'Failed to load public decks');
        setPublicDecks([]);
      } finally {
        setIsLoading(false);
      }
    };

    if (!authLoading) {
      loadPublicDecks();
    }
  }, [firebaseUser, authLoading]);

  const PublicDeckCard: React.FC<{ deck: DeckResponse }> = ({ deck }) => {
    const [showMenu, setShowMenu] = useState(false);

    const handleAddToCollection = async () => {
      try {
        const api = ApiService.getInstance();
        await api.copyDeck(deck.id);
        alert(`"${deck.name}" has been added to your collection!`);
        setShowMenu(false);
      } catch (e) {
        console.error('Failed to add deck to collection:', e);
        alert('Failed to add deck to collection');
      }
    };

    const handleViewCards = () => {
      navigate(`/flashcard/public/${deck.id}/cards`);
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
              background: 'rgba(255, 255, 255, 0.9)',
              border: 'none',
              borderRadius: '50%',
              width: '36px',
              height: '36px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '1.2rem',
              fontWeight: 'bold',
              color: '#333',
            }}
          >
            ⋮
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
              onClick={handleAddToCollection}
              style={{
                width: '100%',
                padding: '0.75rem 1rem',
                border: 'none',
                background: '#4CAF50',
                color: '#fff',
                textAlign: 'left',
                cursor: 'pointer',
                fontWeight: 600,
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
              }}
            >
              <span>+</span>
              <span>Add to Collection</span>
            </button>
          </div>
        )}
        <div style={{ padding: '1rem', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'flex-start' }}>
          <h3 style={{ margin: 0, marginBottom: '0.5rem', fontSize: '1.3rem' }}>{deck.name}</h3>
          <p style={{ margin: 0, color: '#666', fontSize: '0.9rem', marginBottom: '1rem' }}>
            {deck.description || 'No description'}
          </p>
          <div style={{ marginTop: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem', color: '#666' }}>
              <span>Total Cards:</span>
              <span style={{ fontWeight: 600 }}>{deck.flashcard_count}</span>
            </div>
          </div>
        </div>
        <div style={{ width: '340px', height: '50px', marginBottom: '30px', marginLeft: 'auto', marginRight: 'auto' }}>
          <button
            onClick={handleViewCards}
            style={{
              width: '100%',
              height: '100%',
              background: '#BC002D',
              color: '#fff',
              border: 'none',
              borderRadius: 999,
              cursor: 'pointer',
              fontWeight: 700,
              fontSize: '1rem',
            }}
          >
            View Cards
          </button>
        </div>
      </div>
    );
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
            <h1 className="page-title">Browse Public Decks</h1>
            <p className="page-body">Sign in to browse public decks.</p>
          </>
        ) : (
          <>
            <h1 className="page-title" style={{ marginBottom: '1rem' }}>Browse Public Decks</h1>
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', marginBottom: '1rem', width: '100%' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '1400px', maxWidth: '100%' }}>
                <h2 style={{ margin: 0 }}>Public Decks</h2>
                <button
                  onClick={() => navigate('/flashcard')}
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
                  Back to My Decks
                </button>
              </div>
            </div>
            {publicDecks.length === 0 ? (
              <p style={{ textAlign: 'center', fontSize: '1.1rem', color: '#666' }}>
                No public decks available at the moment.
              </p>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', maxWidth: '1600px', margin: '0 auto', gap: '6rem' }}>
                {publicDecks.map((d) => (
                  <PublicDeckCard key={d.id} deck={d} />
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </main>
  );
};

export default BrowsePublicDecksPage;
