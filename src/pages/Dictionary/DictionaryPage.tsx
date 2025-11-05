import React from 'react';
import { TranslationInput } from '../../components/common/TranslationInput';

export const DictionaryPage: React.FC = () => {
  const handleSearch = (text: string) => {
    console.log('Search for:', text);
    // TODO: Implement dictionary search behavior
  };

  return (
    <main className="page page-dictionary">
      <div className="page-content">
        <h1 className="page-title">Dictionary</h1>
        <p className="page-body">Find any Japanese word in seconds.</p>
        <section style={{marginTop: '1.5rem', width: '600px'}}>
          <TranslationInput onTranslate={handleSearch} initialTab="search" hideTabs={true} />
        </section>
      </div>
    </main>
  );
};

export default DictionaryPage;
