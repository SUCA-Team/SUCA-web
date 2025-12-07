import React from 'react';

export const DataSourcePage: React.FC = () => {
  return (
    <div className="page">
      <div className="container">
        <div className="page-content">
          <h1 className="page-title">Data Attribution</h1>
          <div className="page-body">
            <section style={{ marginBottom: '2.5rem' }}>
              <h2>Dictionary Data Source</h2>
              <p className="lead">
                SUCA's Japanese-English dictionary is powered by the JMdict project, a comprehensive 
                multilingual Japanese dictionary maintained by the Electronic Dictionary Research and 
                Development Group (EDRDG).
              </p>
            </section>

            <section style={{ marginBottom: '2.5rem' }}>
              <h2>About JMdict</h2>
              <p>
                JMdict is a Japanese-multilingual dictionary database that has been compiled from multiple 
                sources and is freely available for use. The project is led by Professor Jim Breen at 
                Monash University.
              </p>
              <p>
                The dictionary contains over 180,000 entries and covers a wide range of vocabulary, including:
              </p>
              <ul style={{ marginLeft: '1.5rem', marginTop: '0.5rem', lineHeight: '1.8' }}>
                <p>Common and uncommon Japanese words</p>
                <p>Technical and specialized terminology</p>
                <p>Multiple word forms and readings</p>
                <p>Part-of-speech information</p>
                <p>Usage examples and notes</p>
              </ul>
            </section>

            <section style={{ marginBottom: '2.5rem' }}>
              <h2>License & Usage</h2>
              <p>
                The JMdict/EDICT files are the property of the{' '}
                <a 
                  href="http://www.edrdg.org/" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  style={{ color: '#c8102e', textDecoration: 'underline' }}
                >
                  Electronic Dictionary Research and Development Group
                </a>, and are used in conformance with the Group's{' '}
                <a 
                  href="http://www.edrdg.org/edrdg/licence.html" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  style={{ color: '#c8102e', textDecoration: 'underline' }}
                >
                  licence
                </a>.
              </p>
              <p>
                We are deeply grateful to Professor Jim Breen and the EDRDG for making this invaluable 
                resource freely available to developers and learners worldwide.
              </p>
            </section>

            <section style={{ marginBottom: '2.5rem' }}>
              <h2>Additional Resources</h2>
              <p>
                To learn more about the JMdict project and related resources:
              </p>
              <ul style={{ marginLeft: '1.5rem', marginTop: '0.5rem', lineHeight: '1.8' }}>
                <p>
                  <a 
                    href="http://www.edrdg.org/jmdict/j_jmdict.html" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    style={{ color: '#c8102e', textDecoration: 'underline' }}
                  >
                    JMdict Project Page
                  </a>
                </p>
                <p>
                  <a 
                    href="http://www.edrdg.org/" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    style={{ color: '#c8102e', textDecoration: 'underline' }}
                  >
                    EDRDG Homepage
                  </a>
                </p>
                <p>
                  <a 
                    href="http://www.edrdg.org/wiki/index.php/JMdict-EDICT_Dictionary_Project" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    style={{ color: '#c8102e', textDecoration: 'underline' }}
                  >
                    JMdict Documentation
                  </a>
                </p>
              </ul>
            </section>

            <section style={{ 
              backgroundColor: '#f5f5f5', 
              padding: '1.5rem', 
              borderRadius: '8px',
              borderLeft: '4px solid #c8102e'
            }}>
              <h3 style={{ marginTop: 0 }}>Acknowledgment</h3>
              <p style={{ marginBottom: 0, fontStyle: 'italic' }}>
                This project uses the JMdict/EDICT dictionary files. These files are the property of the 
                Electronic Dictionary Research and Development Group, and are used in conformance with 
                the Group's licence.
              </p>
            </section>

            <section style={{ marginTop: '2.5rem', textAlign: 'center' }}>
              <p style={{ color: '#666' }}>
                Have questions about our data sources?{' '}
                <a href="/contact" style={{ color: '#c8102e', textDecoration: 'underline' }}>
                  Contact us
                </a>
              </p>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DataSourcePage;
