import React, { useState } from 'react';
import { useTranslation } from '../../hooks/useTranslation';

export const TranslatePage: React.FC = () => {
  const [inputText, setInputText] = useState('');
  const [direction, setDirection] = useState<'auto' | 'en-to-jp' | 'jp-to-en'>('auto');
  const { isLoading, error, result, translate, clearResult } = useTranslation();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputText.trim()) {
      translate(inputText, direction);
    }
  };

  const handleClear = () => {
    setInputText('');
    clearResult();
  };

  return (
    <main className="page page-translate">
      <div className="page-content">
        <h1 className="page-title">Translation</h1>
        <p className="page-body">Translate between English and Japanese.</p>
        
        <form onSubmit={handleSubmit} style={{ marginTop: '2rem', maxWidth: '600px' }}>
          <div style={{ marginBottom: '1rem' }}>
            <label htmlFor="direction" style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
              Translation Direction:
            </label>
            <select
              id="direction"
              value={direction}
              onChange={(e) => setDirection(e.target.value as typeof direction)}
              style={{
                padding: '0.5rem',
                border: '1px solid #ddd',
                borderRadius: '4px',
                fontSize: '1rem'
              }}
            >
              <option value="auto">Auto-detect</option>
              <option value="en-to-jp">English → Japanese</option>
              <option value="jp-to-en">Japanese → English</option>
            </select>
          </div>
          
          <div style={{ marginBottom: '1rem' }}>
            <label htmlFor="input-text" style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
              Text to translate:
            </label>
            <textarea
              id="input-text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Enter text to translate..."
              rows={4}
              style={{
                width: '100%',
                padding: '0.75rem',
                border: '1px solid #ddd',
                borderRadius: '4px',
                fontSize: '1rem',
                resize: 'vertical'
              }}
            />
          </div>
          
          <div style={{ display: 'flex', gap: '1rem' }}>
            <button
              type="submit"
              disabled={isLoading || !inputText.trim()}
              style={{
                padding: '0.75rem 1.5rem',
                backgroundColor: '#2196F3',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                fontSize: '1rem',
                cursor: inputText.trim() && !isLoading ? 'pointer' : 'not-allowed',
                opacity: inputText.trim() && !isLoading ? 1 : 0.6
              }}
            >
              {isLoading ? 'Translating...' : 'Translate'}
            </button>
            
            <button
              type="button"
              onClick={handleClear}
              style={{
                padding: '0.75rem 1.5rem',
                backgroundColor: '#666',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                fontSize: '1rem',
                cursor: 'pointer'
              }}
            >
              Clear
            </button>
          </div>
        </form>
        
        {error && (
          <div style={{
            marginTop: '1.5rem',
            padding: '1rem',
            backgroundColor: '#ffebee',
            color: '#c62828',
            border: '1px solid #ef5350',
            borderRadius: '4px'
          }}>
            <strong>Error:</strong> {error}
          </div>
        )}
        
        {result && (
          <div style={{
            marginTop: '1.5rem',
            padding: '1.5rem',
            backgroundColor: '#f5f5f5',
            border: '1px solid #ddd',
            borderRadius: '8px'
          }}>
            <h3 style={{ margin: '0 0 1rem 0' }}>Translation Result</h3>
            
            {result.notification && (
              <div style={{
                padding: '0.75rem',
                backgroundColor: '#fff3cd',
                color: '#856404',
                border: '1px solid #ffeaa7',
                borderRadius: '4px',
                marginBottom: '1rem'
              }}>
                {result.notification}
              </div>
            )}
            
            <div style={{ display: 'grid', gap: '1rem', gridTemplateColumns: '1fr 1fr' }}>
              <div>
                <h4 style={{ margin: '0 0 0.5rem 0', color: '#666' }}>Original:</h4>
                <div style={{
                  padding: '0.75rem',
                  backgroundColor: 'white',
                  border: '1px solid #ddd',
                  borderRadius: '4px',
                  fontSize: '1.1rem'
                }}>
                  {result.original}
                </div>
              </div>
              
              <div>
                <h4 style={{ margin: '0 0 0.5rem 0', color: '#666' }}>Translation:</h4>
                <div style={{
                  padding: '0.75rem',
                  backgroundColor: 'white',
                  border: '1px solid #ddd',
                  borderRadius: '4px',
                  fontSize: '1.1rem',
                  fontWeight: 'bold'
                }}>
                  {result.translated}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  );
};

export default TranslatePage;
