import React, { useContext, useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import ApiService, { type DeckResponse, type DueDeckStats, type FlashcardResponse } from '../../services/apiService';
import { AuthContext } from '../../context/AuthContextValue';

export const FlashcardPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user: firebaseUser, loading: authLoading } = useContext(AuthContext);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [decks, setDecks] = useState<DeckResponse[]>([]);
  const [dueCardsData, setDueCardsData] = useState<{ decks: DueDeckStats[]; total_due: number } | null>(null);
  const [viewingDeckId, setViewingDeckId] = useState<number | null>(null);
  const [deckCards, setDeckCards] = useState<FlashcardResponse[]>([]);
  const [editingCard, setEditingCard] = useState<FlashcardResponse | null>(null);
  const [editFront, setEditFront] = useState('');
  const [editBack, setEditBack] = useState('');
  const [selectionMode, setSelectionMode] = useState(false);
  const [selectedDeckIds, setSelectedDeckIds] = useState<Set<number>>(new Set());
  const [cardSelectionMode, setCardSelectionMode] = useState(false);
  const [selectedCardIds, setSelectedCardIds] = useState<Set<number>>(new Set());
  const [modalMessage, setModalMessage] = useState<{ title: string; message: string; type: 'info' | 'error' | 'success' | 'confirm'; onConfirm?: () => void } | null>(null);

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
        
        // Load due cards data
        try {
          const dueRes = await api.getDueCards();
          setDueCardsData(dueRes);
        } catch (e) {
          console.error('Failed to load due cards:', e);
        }
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

  // Handle returning from EditDeckPage with deck view state
  useEffect(() => {
    const state = location.state as { viewDeckId?: number } | undefined;
    if (state?.viewDeckId && decks.length > 0) {
      const deckId = state.viewDeckId;
      const loadDeckView = async () => {
        try {
          const api = ApiService.getInstance();
          const cardsRes = await api.listFlashcards(deckId);
          setDeckCards(cardsRes.flashcards);
          setViewingDeckId(deckId);
          // Clear the state
          navigate(location.pathname, { replace: true, state: {} });
        } catch (e) {
          console.error('Failed to load deck cards:', e);
        }
      };
      loadDeckView();
    }
  }, [location.state, decks, navigate, location.pathname]);

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
        setModalMessage({ title: 'Import Successful', message: `Successfully imported ${successCount} deck(s)!`, type: 'success' });
      } else if (successCount > 0 && failCount > 0) {
        setModalMessage({ title: 'Partial Import', message: `Imported ${successCount} deck(s) successfully. Failed to import ${failCount} deck(s).`, type: 'info' });
      } else {
        setModalMessage({ title: 'Import Failed', message: `Failed to import all ${failCount} deck(s). Please check the CSV format.`, type: 'error' });
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
    const [isHovered, setIsHovered] = useState(false);
    const [pressTimer, setPressTimer] = useState<number | null>(null);
    
    const isSelected = selectedDeckIds.has(deck.id);
    
    const deckDueData = dueCardsData?.decks.find(d => d.deck_id === deck.id);
    const dueCount = deckDueData?.due_cards ?? 0;
    const progressPercent = deck.flashcard_count === 0 
      ? '-' 
      : dueCount === 0 
        ? '100' 
        : Math.max(0, 100 - Math.round((dueCount * 100) / deck.flashcard_count)).toString();
    
    const handleViewDeck = async (e: React.MouseEvent) => {
      e.stopPropagation();
      try {
        const api = ApiService.getInstance();
        const cardsRes = await api.listFlashcards(deck.id);
        setDeckCards(cardsRes.flashcards);
        setViewingDeckId(deck.id);
      } catch (e) {
        console.error('Failed to load deck cards:', e);
        setModalMessage({ title: 'Message', message: 'Failed to load deck cards', type: 'error' });
      }
    };

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
        setModalMessage({ title: 'Message', message: 'Failed to export deck', type: 'error' });
      }
    };

    const handleDeleteDeck = async () => {
      setModalMessage({
        title: 'Delete Deck',
        message: `Delete deck "${deck.name}"?`,
        type: 'confirm',
        onConfirm: async () => {
          try {
            const api = ApiService.getInstance();
            await api.deleteDeck(deck.id);
            setDecks((prev) => prev.filter(d => d.id !== deck.id));
            setShowMenu(false);
          } catch {
            setModalMessage({ title: 'Message', message: 'Failed to delete deck', type: 'error' });
          }
        }
      });
    };

    const handleMouseDown = () => {
      const timer = setTimeout(() => {
        setSelectionMode(true);
        setSelectedDeckIds(new Set([deck.id]));
      }, 500); // 500ms long press
      setPressTimer(timer);
    };

    const handleMouseUp = () => {
      if (pressTimer) {
        clearTimeout(pressTimer);
        setPressTimer(null);
      }
    };

    const handleClick = (e: React.MouseEvent) => {
      if (selectionMode) {
        e.stopPropagation();
        const newSelected = new Set(selectedDeckIds);
        if (newSelected.has(deck.id)) {
          newSelected.delete(deck.id);
        } else {
          newSelected.add(deck.id);
        }
        setSelectedDeckIds(newSelected);
      }
    };

    return (
      <div 
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => { setIsHovered(false); handleMouseUp(); }}
        onMouseDown={handleMouseDown}
        onMouseUp={handleMouseUp}
        onClick={handleClick}
        style={{
          width: '400px',
          height: '400px',
          borderRadius: '16px',
          background: '#fff',
          boxShadow: isSelected ? '0 8px 24px rgba(188,0,45,0.3)' : isHovered ? '0 12px 32px rgba(0,0,0,0.16)' : '0 4px 16px rgba(0,0,0,0.08)',
          overflow: 'hidden',
          border: isSelected ? '3px solid #BC002D' : '1px solid #eee',
          position: 'relative',
          display: 'flex',
          flexDirection: 'column',
          transform: isHovered || selectionMode ? 'scale(1.05) translateY(-8px)' : 'scale(1) translateY(0)',
          transition: 'all 0.3s ease',
          cursor: 'pointer',
        }}>
        <div style={{ background: '#BC002D', height: '150px', position: 'relative' }}>
          {(isHovered || selectionMode) && (
            <div
              onClick={(e) => {
                e.stopPropagation();
                if (selectionMode) {
                  handleClick(e);
                } else {
                  handleViewDeck(e);
                }
              }}
              style={{
                position: 'absolute',
                top: '10px',
                left: '10px',
                background: 'rgba(255,255,255,0.9)',
                border: isSelected ? '2px solid #BC002D' : 'none',
                cursor: 'pointer',
                padding: '8px',
                borderRadius: selectionMode ? '4px' : '8px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: '28px',
                height: '28px',
              }}
            >
              {selectionMode ? (
                isSelected ? (
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="#BC002D" stroke="#BC002D" strokeWidth="3">
                    <polyline points="20 6 9 17 4 12"></polyline>
                  </svg>
                ) : (
                  <div style={{ width: '16px', height: '16px', border: '2px solid #666', borderRadius: '2px' }} />
                )
              ) : (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#BC002D" strokeWidth="2">
                  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                  <circle cx="12" cy="12" r="3"></circle>
                </svg>
              )}
            </div>
          )}
          <button
            onClick={(e) => { e.stopPropagation(); setShowMenu(!showMenu); }}
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
            flexDirection: 'column',
            gap: '8px',
            alignItems: 'center',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <img src="/src/assets/CardCountIcon.png" alt="Cards" style={{ width: '16px', height: '16px' }} />
              {deck.flashcard_count} cards
              <span style={{ margin: '0 4px', color: '#ccc' }}>|</span>
              <img src="/src/assets/DueCardIcon.png" alt="Due" style={{ width: '16px', height: '16px' }} />
              {dueCount} due
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <img src="/src/assets/ProgressIcon.png" alt="Progress" style={{ width: '16px', height: '16px' }} />
              {progressPercent}{progressPercent !== '-' ? '%' : ''} progress
            </div>
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
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <h2 style={{ margin: 0 }}>Your Decks</h2>
            {dueCardsData && (
              <div style={{ fontSize: '0.95rem', color: '#666', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <img src="/src/assets/DueCardIcon.png" alt="Due" style={{ width: '18px', height: '18px' }} />
                <span style={{ fontWeight: 600 }}>{dueCardsData.total_due}</span> cards due for review
              </div>
            )}
          </div>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            {selectionMode ? (
              <>
                <button
                  onClick={async () => {
                    if (selectedDeckIds.size === 0) {
                      setModalMessage({ title: 'No Selection', message: 'Please select at least one deck', type: 'info' });
                      return;
                    }
                    
                    const api = ApiService.getInstance();
                    for (const deckId of selectedDeckIds) {
                      try {
                        const deck = decks.find(d => d.id === deckId);
                        if (!deck) continue;
                        
                        const blob = await api.exportDeckToCSV(deckId);
                        const url = URL.createObjectURL(blob);
                        const link = document.createElement('a');
                        link.href = url;
                        link.download = `${deck.name}.csv`;
                        document.body.appendChild(link);
                        link.click();
                        document.body.removeChild(link);
                        URL.revokeObjectURL(url);
                      } catch (e) {
                        console.error(`Failed to export deck ${deckId}:`, e);
                      }
                    }
                    setModalMessage({ title: 'Export Successful', message: `Exported ${selectedDeckIds.size} deck(s)`, type: 'success' });
                  }}
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
                  Download All ({selectedDeckIds.size})
                </button>
                <button
                  onClick={async () => {
                    if (selectedDeckIds.size === 0) {
                      setModalMessage({ title: 'No Selection', message: 'Please select at least one deck', type: 'info' });
                      return;
                    }
                    
                    setModalMessage({
                      title: 'Delete Decks',
                      message: `Delete ${selectedDeckIds.size} selected deck(s)?`,
                      type: 'confirm',
                      onConfirm: async () => {
                        const api = ApiService.getInstance();
                        for (const deckId of selectedDeckIds) {
                          try {
                            await api.deleteDeck(deckId);
                          } catch (e) {
                            console.error(`Failed to delete deck ${deckId}:`, e);
                          }
                        }
                        
                        // Reload decks
                        const deckRes = await api.listDecks();
                        setDecks(deckRes.decks ?? []);
                        setSelectedDeckIds(new Set());
                        setSelectionMode(false);
                      }
                    });
                  }}
                  style={{
                    background: '#f44336',
                    color: '#fff',
                    border: 'none',
                    borderRadius: 999,
                    padding: '0.6rem 1rem',
                    cursor: 'pointer',
                    fontWeight: 700,
                  }}
                >
                  Delete All ({selectedDeckIds.size})
                </button>
                <button
                  onClick={() => {
                    if (selectedDeckIds.size === decks.length) {
                      // Deselect all
                      setSelectedDeckIds(new Set());
                    } else {
                      // Select all
                      setSelectedDeckIds(new Set(decks.map(d => d.id)));
                    }
                  }}
                  style={{
                    background: selectedDeckIds.size === decks.length ? '#FF9800' : '#2196F3',
                    color: '#fff',
                    border: 'none',
                    borderRadius: 999,
                    padding: '0.6rem 1rem',
                    cursor: 'pointer',
                    fontWeight: 700,
                  }}
                >
                  {selectedDeckIds.size === decks.length ? 'Deselect All' : 'Select All'}
                </button>
                <button
                  onClick={() => {
                    setSelectionMode(false);
                    setSelectedDeckIds(new Set());
                  }}
                  style={{
                    background: '#757575',
                    color: '#fff',
                    border: 'none',
                    borderRadius: 999,
                    padding: '0.6rem 1rem',
                    cursor: 'pointer',
                    fontWeight: 700,
                  }}
                >
                  Cancel
                </button>
              </>
            ) : (
              <>
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
              onClick={() => {
                setSelectionMode(true);
                setSelectedDeckIds(new Set());
              }}
              style={{
                background: '#9C27B0',
                color: '#fff',
                border: 'none',
                borderRadius: 999,
                padding: '0.6rem 1rem',
                cursor: 'pointer',
                fontWeight: 700,
              }}
            >
              Select Decks
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
              </>
            )}
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

  // Deck detail view with card editing
  const renderDeckDetailView = () => {
    const currentDeck = decks.find(d => d.id === viewingDeckId);
    if (!currentDeck) return null;

    const handleEditCardClick = (card: FlashcardResponse) => {
      setEditingCard(card);
      setEditFront(card.front);
      setEditBack(card.back);
    };

    const handleUpdateCard = async () => {
      if (!editingCard || !editFront.trim() || !editBack.trim()) {
        setModalMessage({ title: 'Missing Fields', message: 'Both Front and Back are required', type: 'info' });
        return;
      }

      try {
        const api = ApiService.getInstance();
        await api.updateFlashcard(viewingDeckId!, editingCard.id, {
          front: editFront.trim(),
          back: editBack.trim(),
        });
        
        // Reload cards
        const cardsRes = await api.listFlashcards(viewingDeckId!);
        setDeckCards(cardsRes.flashcards);
        setEditingCard(null);
        setEditFront('');
        setEditBack('');
      } catch (e) {
        console.error('Failed to update card:', e);
        setModalMessage({ title: 'Message', message: 'Failed to update card', type: 'error' });
      }
    };

    const handleDeleteCard = async (cardId: number) => {
      setModalMessage({
        title: 'Delete Card',
        message: 'Are you sure you want to delete this card?',
        type: 'confirm',
        onConfirm: async () => {
          try {
            const api = ApiService.getInstance();
            await api.deleteFlashcard(viewingDeckId!, cardId);
            
            // Reload cards
            const cardsRes = await api.listFlashcards(viewingDeckId!);
            setDeckCards(cardsRes.flashcards);
            
            // Reload decks to update counts
            const deckRes = await api.listDecks();
            setDecks(deckRes.decks ?? []);
          } catch (e) {
            console.error('Failed to delete card:', e);
            setModalMessage({ title: 'Message', message: 'Failed to delete card', type: 'error' });
          }
        }
      });
    };

    const CardInfoCard: React.FC<{ card: FlashcardResponse }> = ({ card }) => {
      const [isHovered, setIsHovered] = useState(false);
      const [pressTimer, setPressTimer] = useState<number | null>(null);
      
      const isSelected = selectedCardIds.has(card.id);

      // Decode back with example
      const decodeBackWithExample = (encodedBack: string): { back: string; example: string } => {
        const match = encodedBack.match(/^(.*?)\s*\{(.*?)\}$/);
        if (match) {
          return { back: match[1].trim(), example: match[2].trim() };
        }
        return { back: encodedBack, example: '' };
      };

      const { back, example } = decodeBackWithExample(card.back);

      const handleMouseDown = () => {
        const timer = setTimeout(() => {
          setCardSelectionMode(true);
          setSelectedCardIds(new Set([card.id]));
        }, 500); // 500ms long press
        setPressTimer(timer);
      };

      const handleMouseUp = () => {
        if (pressTimer) {
          clearTimeout(pressTimer);
          setPressTimer(null);
        }
      };

      const handleClick = (e: React.MouseEvent) => {
        if (cardSelectionMode) {
          e.stopPropagation();
          const newSelected = new Set(selectedCardIds);
          if (newSelected.has(card.id)) {
            newSelected.delete(card.id);
          } else {
            newSelected.add(card.id);
          }
          setSelectedCardIds(newSelected);
        }
      };

      return (
        <div
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => { setIsHovered(false); handleMouseUp(); }}
          onMouseDown={handleMouseDown}
          onMouseUp={handleMouseUp}
          onClick={handleClick}
          style={{
            background: '#fff',
            borderRadius: '12px',
            padding: '1.5rem',
            boxShadow: isSelected ? '0 4px 16px rgba(188,0,45,0.3)' : '0 2px 8px rgba(0,0,0,0.1)',
            border: isSelected ? '2px solid #BC002D' : '1px solid transparent',
            position: 'relative',
            minHeight: '150px',
            display: 'flex',
            flexDirection: 'column',
            transition: 'all 0.2s ease',
            transform: isHovered || cardSelectionMode ? 'scale(1.02)' : 'scale(1)',
            cursor: cardSelectionMode ? 'pointer' : 'default',
          }}
        >
          {(isHovered || cardSelectionMode) && !cardSelectionMode && (
            <div style={{
              position: 'absolute',
              top: '1rem',
              right: '1rem',
              display: 'flex',
              gap: '0.5rem',
              zIndex: 1,
            }}>
              <button
                onClick={() => handleEditCardClick(card)}
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
                Edit Card
              </button>
              <button
                onClick={() => handleDeleteCard(card.id)}
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
                Delete Card
              </button>
            </div>
          )}
          {cardSelectionMode && (
            <div
              style={{
                position: 'absolute',
                top: '1rem',
                left: '1rem',
                background: 'rgba(255,255,255,0.9)',
                border: isSelected ? '2px solid #BC002D' : 'none',
                padding: '6px',
                borderRadius: '4px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: '20px',
                height: '20px',
              }}
            >
              {isSelected ? (
                <svg width="14" height="14" viewBox="0 0 24 24" fill="#BC002D" stroke="#BC002D" strokeWidth="3">
                  <polyline points="20 6 9 17 4 12"></polyline>
                </svg>
              ) : (
                <div style={{ width: '14px', height: '14px', border: '2px solid #666', borderRadius: '2px' }} />
              )}
            </div>
          )}
          <div style={{ marginBottom: '1rem' }}>
            <div style={{ fontSize: '0.9rem', color: '#666', marginBottom: '0.25rem', fontWeight: 600 }}>
              Front:
            </div>
            <div style={{ fontWeight: 700, fontSize: '1.1rem', color: '#333' }}>
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
    };

    const handleEditDeckFromView = () => {
      navigate(`/flashcard/edit/${viewingDeckId}`, { state: { returnTo: 'deckView', deckId: viewingDeckId } });
    };

    const handleDownloadDeckFromView = async () => {
      try {
        const api = ApiService.getInstance();
        const blob = await api.exportDeckToCSV(viewingDeckId!);
        
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `${currentDeck.name}.csv`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
      } catch (e) {
        console.error('Failed to export deck:', e);
        setModalMessage({ title: 'Message', message: 'Failed to export deck', type: 'error' });
      }
    };

    const handleDeleteDeckFromView = async () => {
      setModalMessage({
        title: 'Delete Deck',
        message: `Delete deck "${currentDeck.name}"?`,
        type: 'confirm',
        onConfirm: async () => {
          try {
            const api = ApiService.getInstance();
            await api.deleteDeck(viewingDeckId!);
            setViewingDeckId(null);
            setDeckCards([]);
            
            // Reload decks
            const deckRes = await api.listDecks();
            setDecks(deckRes.decks ?? []);
          } catch (e) {
            console.error('Failed to delete deck:', e);
            setModalMessage({ title: 'Message', message: 'Failed to delete deck', type: 'error' });
          }
        }
      });
    };

    const handleStudyDeckFromView = () => {
      navigate(`/flashcard/study/${viewingDeckId}`);
    };

    return (
      <div style={{ width: '100%' }}>
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', marginBottom: '2rem', width: '100%' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '1400px', maxWidth: '100%' }}>
            <h1 className="page-title" style={{ margin: 0 }}>{currentDeck.name}</h1>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              {cardSelectionMode ? (
                <>
                  <button
                  onClick={() => {
                    setSelectedCardIds(new Set(deckCards.map(c => c.id)));
                  }}
                  style={{
                    background: '#2196F3',
                    color: '#fff',
                    border: 'none',
                    borderRadius: '999px',
                    padding: '0.6rem 1rem',
                    cursor: 'pointer',
                    fontWeight: 600,
                  }}
                >
                  Select All
                </button>
                <button
                  onClick={async () => {
                    if (selectedCardIds.size === 0) {
                      setModalMessage({ title: 'No Selection', message: 'Please select at least one card', type: 'info' });
                      return;
                    }
                    
                    setModalMessage({
                      title: 'Delete Cards',
                      message: `Delete ${selectedCardIds.size} selected card(s)?`,
                      type: 'confirm',
                      onConfirm: async () => {
                        const api = ApiService.getInstance();
                        for (const cardId of selectedCardIds) {
                          try {
                            await api.deleteFlashcard(viewingDeckId!, cardId);
                          } catch (e) {
                            console.error(`Failed to delete card ${cardId}:`, e);
                          }
                        }
                        
                        // Reload cards
                        const cardsRes = await api.listFlashcards(viewingDeckId!);
                        setDeckCards(cardsRes.flashcards);
                        
                        // Reload decks to update counts
                        const deckRes = await api.listDecks();
                        setDecks(deckRes.decks ?? []);
                        
                        setSelectedCardIds(new Set());
                        setCardSelectionMode(false);
                      }
                    });
                  }}
                  style={{
                    background: '#f44336',
                    color: '#fff',
                    border: 'none',
                    borderRadius: '999px',
                    padding: '0.6rem 1rem',
                    cursor: 'pointer',
                    fontWeight: 600,
                  }}
                >
                  Delete All ({selectedCardIds.size})
                </button>
                <button
                  onClick={() => {
                    setCardSelectionMode(false);
                    setSelectedCardIds(new Set());
                  }}
                  style={{
                    background: '#757575',
                    color: '#fff',
                    border: 'none',
                    borderRadius: '999px',
                    padding: '0.6rem 1rem',
                    cursor: 'pointer',
                    fontWeight: 600,
                  }}
                >
                  Cancel
                </button>
              </>
            ) : (
              <>
            <button
              onClick={handleEditDeckFromView}
              style={{
                background: '#2196F3',
                color: '#fff',
                border: 'none',
                borderRadius: '999px',
                padding: '0.6rem 1rem',
                cursor: 'pointer',
                fontWeight: 600,
              }}
            >
              Edit Deck
            </button>
            <button
              onClick={handleDownloadDeckFromView}
              style={{
                background: '#4CAF50',
                color: '#fff',
                border: 'none',
                borderRadius: '999px',
                padding: '0.6rem 1rem',
                cursor: 'pointer',
                fontWeight: 600,
              }}
            >
              Download Deck
            </button>
            <button
              onClick={handleDeleteDeckFromView}
              style={{
                background: '#f44336',
                color: '#fff',
                border: 'none',
                borderRadius: '999px',
                padding: '0.6rem 1rem',
                cursor: 'pointer',
                fontWeight: 600,
              }}
            >
              Delete Deck
            </button>
            <button
              onClick={handleStudyDeckFromView}
              style={{
                background: '#BC002D',
                color: '#fff',
                border: 'none',
                borderRadius: '999px',
                padding: '0.6rem 1rem',
                cursor: 'pointer',
                fontWeight: 600,
              }}
            >
              Study
            </button>
            <button
              onClick={() => {
                setViewingDeckId(null);
                setDeckCards([]);
                setCardSelectionMode(false);
                setSelectedCardIds(new Set());
              }}
              style={{
                background: '#757575',
                color: '#fff',
                border: 'none',
                borderRadius: '999px',
                padding: '0.6rem 1.5rem',
                cursor: 'pointer',
                fontWeight: 600,
              }}
            >
              ← Back
            </button>
              </>
            )}
            </div>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '2rem', maxWidth: '1600px', margin: '0 auto' }}>
          {deckCards.map(card => (
            <CardInfoCard key={card.id} card={card} />
          ))}
        </div>

        {/* Edit Card Overlay */}
        {editingCard && (
          <div
            onClick={() => {
              setEditingCard(null);
              setEditFront('');
              setEditBack('');
            }}
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: 'rgba(0,0,0,0.5)',
              backdropFilter: 'blur(4px)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 1000,
            }}
          >
            <div
              onClick={(e) => e.stopPropagation()}
              style={{
                background: '#fff',
                borderRadius: '16px',
                padding: '2rem',
                boxShadow: '0 8px 32px rgba(0,0,0,0.2)',
                width: '500px',
                maxWidth: '90vw',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                <h2 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 600 }}>Update This Card</h2>
                <button
                  onClick={() => {
                    setEditingCard(null);
                    setEditFront('');
                    setEditBack('');
                  }}
                  style={{
                    background: 'transparent',
                    border: 'none',
                    cursor: 'pointer',
                    fontSize: '1.5rem',
                    color: '#666',
                  }}
                >
                  ✕
                </button>
              </div>

              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>Front (Question)</label>
                <input
                  type="text"
                  value={editFront}
                  onChange={(e) => setEditFront(e.target.value)}
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
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>Back (Answer)</label>
                <input
                  type="text"
                  value={editBack}
                  onChange={(e) => setEditBack(e.target.value)}
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
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <main className="page page-flashcard">
      <div className="page-content">
        {authLoading || isLoading ? (
          <div style={{ padding: '1rem' }}>Loading...</div>
        ) : error ? (
          <div style={{ padding: '1rem', color: 'red' }}>Error: {error}</div>
        ) : !isLoggedIn ? (
          renderLoggedOut()
        ) : viewingDeckId ? (
          renderDeckDetailView()
        ) : decks.length === 0 ? (
          renderLoggedInEmpty()
        ) : (
          renderLoggedInWithDecks()
        )}
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
                      fontSize: '0.95rem',
                    }}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => {
                      if (modalMessage.onConfirm) {
                        modalMessage.onConfirm();
                      }
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
                      fontSize: '0.95rem',
                    }}
                  >
                    OK
                  </button>
                </>
              ) : (
                <button
                  onClick={() => {
                    if (modalMessage.onConfirm) {
                      modalMessage.onConfirm();
                    }
                    setModalMessage(null);
                  }}
                  style={{
                    padding: '0.75rem 1.5rem',
                    border: 'none',
                    borderRadius: '8px',
                    background: 
                      modalMessage.type === 'success' ? '#4CAF50' :
                      modalMessage.type === 'error' ? '#f44336' : '#2196F3',
                    color: 'white',
                    fontWeight: 600,
                    cursor: 'pointer',
                    fontSize: '0.95rem',
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

export default FlashcardPage;
