import React, { useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ApiService, { type DeckResponse } from '../../services/apiService';
import { AuthContext } from '../../context/AuthContext';

export const FlashcardPage: React.FC = () => {
  const navigate = useNavigate();
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
        await firebaseUser.reload();
        // Small delay to ensure the global auth object is in sync
        // await new Promise(resolve => setTimeout(resolve, 1000));
        
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

  const handleCreateDeck = () => {
    if (!isLoggedIn) return;
    navigate('/flashcard/add');
  };

  const handleImportDecks = () => {
    if (!isLoggedIn) return;

    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.csv';
    input.multiple = true;
    
    input.onchange = async (e: Event) => {
      const target = e.target as HTMLInputElement;
      const files = target.files;
      if (!files || files.length === 0) return;

      const api = ApiService.getInstance();
      let successCount = 0;
      let failCount = 0;

      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const deckName = file.name.replace('.csv', '');

        try {
          // Create the deck first
          const newDeck = await api.createDeck({
            name: deckName,
            description: 'Imported from CSV',
          });

          // Import the CSV file
          await api.importFlashcardsFromCSV(newDeck.id, file);
          successCount++;
        } catch (error) {
          console.error(`Failed to import ${file.name}:`, error);
          failCount++;
        }
      }

      // Show result
      if (successCount > 0 && failCount === 0) {
        alert(`Successfully imported ${successCount} deck(s)!`);
      } else if (successCount > 0 && failCount > 0) {
        alert(`Imported ${successCount} deck(s) successfully. Failed to import ${failCount} deck(s).`);
      } else {
        alert(`Failed to import all ${failCount} deck(s). Please check the CSV format.`);
      }

      // Reload decks
      if (successCount > 0) {
        const deckRes = await api.listDecks();
        setDecks(deckRes.decks ?? []);
      }
    };

    input.click();
  };

  const handleBrowseDecks = () => {
    if (!isLoggedIn) return;
    navigate('/flashcard/browse');
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
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button
            onClick={handleBrowseDecks}
            style={{
              background: '#2196F3',
              color: '#fff',
              border: 'none',
              borderRadius: 999,
              padding: '0.6rem 1rem',
              cursor: 'pointer',
              fontWeight: 700,
            }}
          >
            Browse Decks
          </button>
          <button
            onClick={handleImportDecks}
            style={{
              background: '#4CAF50',
              color: '#fff',
              border: 'none',
              borderRadius: 999,
              padding: '0.6rem 1rem',
              cursor: 'pointer',
              fontWeight: 700,
            }}
          >
            Import Deck
          </button>
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

    const handleEditDeck = () => {
      navigate(`/flashcard/edit/${deck.id}`);
    };

    const handleExportDeck = async () => {
      try {
        const api = ApiService.getInstance();
        const blob = await api.exportDeckToCSV(deck.id);
        
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `${deck.name}.csv`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
        
        setShowMenu(false);
      } catch (e) {
        console.error('Failed to export deck:', e);
        alert('Failed to export deck');
      }
    };

    const handleDeleteDeck = async () => {
      if (!confirm(`Delete deck "${deck.name}"?`)) return;
      try {
        const api = ApiService.getInstance();
        await api.deleteDeck(deck.id);
        setDecks((prev) => prev.filter(d => d.id !== deck.id));
        setShowMenu(false);
      } catch {
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
              onClick={handleExportDeck}
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
              <span>Download Deck</span>
              <div style={{ 
                width: '32px', 
                height: '32px', 
                background: '#e8f5e9', 
                borderRadius: '8px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '18px',
              }}>
                ↓
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
            alignItems: 'flex-end',
            gap: '6px',
            justifyContent: 'center',
          }}>
            <img src="/src/assets/CardCountIcon.png" alt="Cards" style={{ width: '16px', height: '16px' }} />
            {deck.flashcard_count} cards
          </div>
        </div>
        <div style={{ width: '340px', height: '50px' , marginBottom: '30px', marginLeft: 'auto', marginRight: 'auto' }}>
          <button
            onClick={() => navigate(`/flashcard/study/${deck.id}`)}
            style={{
              width: '340px',
              height: '50px',
              borderRadius: '15px',
              border: 'none',
              padding: '0.5rem 0.8rem',
              background: '#c2185b',
              color: '#fff',
              fontWeight: 700,
              cursor: 'pointer',
            }}
          >
            Study
          </button>
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
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button
              onClick={handleBrowseDecks}
              style={{
                background: '#2196F3',
                color: '#fff',
                border: 'none',
                borderRadius: 999,
                padding: '0.6rem 1rem',
                cursor: 'pointer',
                fontWeight: 700,
              }}
            >
              Browse Decks
            </button>
            <button
              onClick={handleImportDecks}
              style={{
                background: '#4CAF50',
                color: '#fff',
                border: 'none',
                borderRadius: 999,
                padding: '0.6rem 1rem',
                cursor: 'pointer',
                fontWeight: 700,
              }}
            >
              Import Deck
            </button>
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
