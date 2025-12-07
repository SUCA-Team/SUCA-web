import React, { useState } from 'react';
import './HelpPage.css';

export const HelpPage: React.FC = () => {
  const [openQuestion, setOpenQuestion] = useState<number | null>(null);

  const toggleQuestion = (id: number) => {
    setOpenQuestion(openQuestion === id ? null : id);
  };

  const helps = [
    {
      id: 1,
      question: "How do I use the Dictionary feature?",
      answer: "Simply type a Japanese word (in hiragana, katakana, kanji, or romaji) or an English word (quoted) into the search box. The dictionary will show you definitions, readings, and example sentences. You can also add words directly to your flashcard decks from the search results."
    },
    {
      id: 2,
      question: "How do I search for English words in the dictionary?",
      answer: "To search for English words, enclose your search term in quotes. For example, type \"beautiful\" or \"water\" to search for English meanings. Without quotes, your text will be automatically converted to Japanese kana."
    },
    {
      id: 3,
      question: "What are Flashcards and how do I create them?",
      answer: "Flashcards help you memorize Japanese vocabulary using spaced repetition. To create flashcards: (1) Click 'Flashcard' in the navigation, (2) Create a new deck, (3) Add cards manually or import them from the dictionary. You can organize cards into different decks by topic, JLPT level, or any system that works for you."
    },
    {
      id: 4,
      question: "What is FSRS and how does it work?",
      answer: "FSRS (Free Spaced Repetition Scheduler) is an advanced, scientifically-backed algorithm that optimizes your learning schedule. Unlike traditional methods that use fixed intervals, FSRS analyzes your actual performance on each card and predicts the optimal review time. It considers factors like difficulty, stability, and retrievability to show you cards right when you're about to forget them - maximizing long-term retention while minimizing study time."
    },
    {
      id: 5,
      question: "How do I study efficiently with FSRS?",
      answer: "For best results with FSRS: (1) Study consistently - daily reviews are ideal, (2) Be honest with your ratings - don't just click 'Easy' to finish faster, (3) Trust the algorithm - even if review times seem unusual, FSRS adapts to your memory patterns, (4) Review regularly - cards marked 'Again' need more frequent practice, (5) Don't reset cards unless necessary - FSRS learns from your history. See the comprehensive FSRS guide below for more details."
    },
    {
      id: 6,
      question: "What do the FSRS rating buttons mean?",
      answer: "After flipping a card, you'll see 4 rating options: 'Again' (you forgot or struggled), 'Hard' (you remembered but with difficulty), 'Good' (you remembered correctly), 'Easy' (you remembered instantly and effortlessly). Your rating determines when you'll see the card next. Be honest with your self-assessment for best results."
    },
    {
      id: 7,
      question: "Can I share my flashcard decks with others?",
      answer: "Yes! When creating or editing a deck, you can toggle the 'Public' option. Public decks appear in the Browse Public Decks section where other users can view and copy them to their own collection. This is great for sharing curated vocabulary lists with study partners or the community."
    },
    {
      id: 8,
      question: "How do I import/export flashcards?",
      answer: "Currently, you can create flashcards manually or add them directly from dictionary searches. Bulk import/export features are coming soon! For now, you can use the bulk create option when editing a deck to add multiple cards at once."
    },
    {
      id: 9,
      question: "Why am I seeing 'Failed to load deck' errors?",
      answer: "This usually happens if: (1) You're not logged in - make sure to sign in with your Google account, (2) The page loaded before authentication completed - try refreshing the page, (3) You're trying to access someone else's private deck - you can only view public decks from other users. If the problem persists, contact support."
    },
    {
      id: 10,
      question: "How do I report a bug or suggest a feature?",
      answer: "Please visit our Contact page to report bugs or suggest new features. We actively review all feedback from our community and regularly update SUCA based on user suggestions."
    }
  ];

  return (
    <div className="page">
      <div className="container">
        <div className="page-content">
          <h1 className="page-title">Help</h1>
          <div className="page-body">
            <p className="lead">
              Find answers to common questions about using SUCA. Can't find what you're looking for? 
              Visit our <a href="/contact">Contact page</a>.
            </p>

            <div className="help-list">
              {helps.map((help) => (
                <div key={help.id} className="help-item">
                  <button
                    className={`help-question ${openQuestion === help.id ? 'active' : ''}`}
                    onClick={() => toggleQuestion(help.id)}
                  >
                    <span>{help.question}</span>
                    <span className="help-icon">{openQuestion === help.id ? '−' : '+'}</span>
                  </button>
                  {openQuestion === help.id && (
                    <div className="help-answer">
                      <p>{help.answer}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>

            <div className="help-section">
              <h2>Getting Started</h2>
              <ol>
                <li><strong>Sign in</strong> with your Google account to access all features</li>
                <li><strong>Explore the Dictionary</strong> to look up Japanese words and their meanings</li>
                <li><strong>Create Flashcard decks</strong> to organize vocabulary by topic or JLPT level</li>
                <li><strong>Add cards</strong> from dictionary searches or create them manually</li>
                <li><strong>Start studying</strong> using FSRS to optimize your learning</li>
              </ol>
            </div>

            <div className="help-section" style={{ backgroundColor: '#fef2f2', border: '2px solid #fecaca' }}>
              <h2>📚 Comprehensive FSRS Study Guide</h2>
              
              <h3 style={{ color: '#991b1b', marginTop: '1.5rem' }}>What is FSRS?</h3>
              <p>
                FSRS (Free Spaced Repetition Scheduler) is a modern, open-source algorithm that uses spaced 
                repetition to help you remember information long-term. It's more sophisticated than traditional 
                methods like Leitner or SM-2 because it uses real user data and machine learning to optimize 
                review schedules.
              </p>

              <h3 style={{ color: '#991b1b', marginTop: '1.5rem' }}>How FSRS Works</h3>
              <p>
                Every flashcard has hidden parameters that FSRS tracks:
              </p>
              <ul style={{ marginLeft: '1.5rem', lineHeight: '1.8' }}>
                <li><strong>Difficulty:</strong> How hard the card is for you personally</li>
                <li><strong>Stability:</strong> How long you can remember the card</li>
                <li><strong>Retrievability:</strong> Current probability you'll recall it correctly</li>
                <li><strong>State:</strong> New, Learning, Review, or Relearning</li>
              </ul>
              <p>
                Based on these parameters and your ratings, FSRS calculates the optimal time to show you 
                each card - right before you're likely to forget it.
              </p>

              <h3 style={{ color: '#991b1b', marginTop: '1.5rem' }}>Best Practices for Using FSRS</h3>
              
              <h4 style={{ marginTop: '1rem' }}>1. Study Consistently</h4>
              <ul style={{ marginLeft: '1.5rem', lineHeight: '1.8' }}>
                <li>Review daily if possible - consistency beats long cramming sessions</li>
                <li>Set a specific time each day for reviews (e.g., morning coffee, before bed)</li>
                <li>Even 10-15 minutes daily is more effective than 2 hours once a week</li>
              </ul>

              <h4 style={{ marginTop: '1rem' }}>2. Rate Cards Honestly</h4>
              <ul style={{ marginLeft: '1.5rem', lineHeight: '1.8' }}>
                <li><strong>Again:</strong> You couldn't recall or had to think very hard (don't be afraid to use this!)</li>
                <li><strong>Hard:</strong> You eventually recalled but struggled or hesitated significantly</li>
                <li><strong>Good:</strong> You recalled correctly with normal effort - this should be your most common rating</li>
                <li><strong>Easy:</strong> You recalled instantly without any effort - reserve this for truly trivial cards</li>
              </ul>
              <p style={{ marginTop: '0.5rem', fontStyle: 'italic', color: '#666' }}>
                💡 Tip: Don't rush to click "Easy" just to finish faster. The algorithm needs accurate feedback to work properly!
              </p>

              <h4 style={{ marginTop: '1rem' }}>3. Trust the Algorithm</h4>
              <ul style={{ marginLeft: '1.5rem', lineHeight: '1.8' }}>
                <li>Review intervals might seem odd at first - that's normal</li>
                <li>Cards you rate "Again" will appear more frequently until you learn them</li>
                <li>Cards you consistently rate "Good" or "Easy" will gradually space out to weeks or months</li>
                <li>The algorithm adapts to YOUR memory - intervals will be different for different cards</li>
              </ul>

              <h4 style={{ marginTop: '1rem' }}>4. Don't Reset Progress Unnecessarily</h4>
              <ul style={{ marginLeft: '1.5rem', lineHeight: '1.8' }}>
                <li>FSRS learns from your review history - resetting loses this valuable data</li>
                <li>If you struggle with a card, just rate it "Again" - the algorithm will adjust</li>
                <li>Only reset if you've been away for months or the card content has changed significantly</li>
              </ul>

              <h4 style={{ marginTop: '1rem' }}>5. Optimize Your Card Content</h4>
              <ul style={{ marginLeft: '1.5rem', lineHeight: '1.8' }}>
                <li>Keep cards simple - one concept per card works best</li>
                <li>Add example sentences to provide context</li>
                <li>Use the front for Japanese, back for English (or vice versa)</li>
                <li>Include readings (hiragana) for kanji words</li>
              </ul>

              <h3 style={{ color: '#991b1b', marginTop: '1.5rem' }}>Understanding Card States</h3>
              <ul style={{ marginLeft: '1.5rem', lineHeight: '1.8' }}>
                <li><strong>New:</strong> Cards you haven't studied yet</li>
                <li><strong>Learning:</strong> Cards you're actively learning (short intervals)</li>
                <li><strong>Review:</strong> Cards you've learned (longer intervals)</li>
                <li><strong>Relearning:</strong> Previously learned cards you forgot (back to frequent reviews)</li>
              </ul>

              <h3 style={{ color: '#991b1b', marginTop: '1.5rem' }}>Common Mistakes to Avoid</h3>
              <ul style={{ marginLeft: '1.5rem', lineHeight: '1.8' }}>
                <li>❌ Rating everything "Easy" to finish quickly</li>
                <li>❌ Skipping daily reviews and cramming later</li>
                <li>❌ Resetting cards you're struggling with</li>
                <li>❌ Creating too many new cards at once (start with 5-10 per day)</li>
                <li>❌ Not using the "Again" button when you should</li>
              </ul>

              <h3 style={{ color: '#991b1b', marginTop: '1.5rem' }}>Tips for Maximum Efficiency</h3>
              <ul style={{ marginLeft: '1.5rem', lineHeight: '1.8' }}>
                <li>✅ Review all due cards before adding new ones</li>
                <li>✅ Study in a distraction-free environment</li>
                <li>✅ Say answers out loud to engage more of your brain</li>
                <li>✅ Create connections between new words and things you already know</li>
                <li>✅ Take breaks between long study sessions (every 20-30 minutes)</li>
                <li>✅ Track your progress over weeks/months to stay motivated</li>
              </ul>

              <div style={{ 
                marginTop: '1.5rem', 
                padding: '1rem', 
                backgroundColor: '#fff', 
                borderRadius: '8px',
                border: '1px solid #fecaca'
              }}>
                <p style={{ margin: 0, fontWeight: 600, color: '#991b1b' }}>
                  🎯 Remember: FSRS is a marathon, not a sprint. Consistent daily reviews of 10-20 minutes 
                  will teach you more than cramming for hours. Trust the process, be honest with your ratings, 
                  and watch your Japanese skills grow steadily over time!
                </p>
              </div>
            </div>

            <div className="help-section">
              <h2>Need More Help?</h2>
              <p>
                If you have additional questions or need technical support, please visit our 
                <a href="/contact"> Contact page</a> or email us at <strong>sucateam1111@gmail.com</strong>.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HelpPage;
