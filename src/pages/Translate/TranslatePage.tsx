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

        <form onSubmit={handleSubmit}>
          <div>
            <label htmlFor="direction" className="label">
              Translation Direction:
            </label>
              <select
                id="direction"
                value={direction}
                onChange={(e) => setDirection(e.target.value as typeof direction)}
                style={{ color: 'var(--text-secondary)' }}
              >
              <option value="auto">Auto-detect</option>
              <option value="en-to-jp">English → Japanese</option>
              <option value="jp-to-en">Japanese → English</option>
            </select>
          </div>

          <div>
            <label htmlFor="input-text" className="label">
              Text to translate:
            </label>
            <textarea
              id="input-text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Enter text to translate..."
              rows={2}
            />
          </div>

          <div className="button-row">
            <button
              type="submit"
              disabled={isLoading || !inputText.trim()}
              className="btn btn-primary"
                style={{ color: 'white' }}
            >
              {isLoading ? 'Translating...' : 'Translate'}
            </button>

            <button
              type="button"
              onClick={handleClear}
              className="btn btn-clear"
                style={{ color: 'white' }}
            >
              Clear
            </button>
          </div>
        </form>

        {error && (
          <div className="error-box">
            <strong>Error:</strong> {error}
          </div>
        )}

        {result && (
          <div className="result-card">
            <h3 className="result-title">Translation Result</h3>

            {result.notification && (
              <div className="result-notice">
                {result.notification}
              </div>
            )}

            <div className="result-grid">
              <div>
                <h4 className="result-subtitle">Original:</h4>
                <div className="result-box">
                  {result.original}
                </div>
              </div>

              <div>
                <h4 className="result-subtitle">Translation:</h4>
                <div className="result-box result-box-strong">
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
