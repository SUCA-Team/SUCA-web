import React, { useState } from 'react';
import './HelpPage.css';

export const HelpPage: React.FC = () => {
  const [openQuestion, setOpenQuestion] = useState<number | null>(null);

  const toggleQuestion = (id: number) => {
    setOpenQuestion(openQuestion === id ? null : id);
  };

  const faqs = [
    {
      id: 1,
      question: "How do I use the Dictionary feature?",
      answer: "Simply type a Japanese word (in hiragana, katakana, kanji, or romaji) into the search box. The dictionary will show you definitions, readings, example sentences, and JLPT levels."
    },
    {
      id: 2,
      question: "How do I search for English words in the dictionary?",
      answer: "To search for English words, enclose your search term in quotes. For example, type \"beautiful\" or \"water\" to search for English meanings. Without quotes, your text will be automatically converted to Japanese kana."
    },
    {
      id: 3,
      question: "What are Flashcards and how do I create them?",
      answer: "Flashcards help you memorize Japanese vocabulary. You can create custom flashcard sets from words you've looked up in the dictionary, or use pre-made sets organized by JLPT level."
    },
    {
      id: 4,
      question: "What is FSRS and how does it help me learn?",
      answer: "FSRS (Free Spaced Repetition Scheduler) is an advanced algorithm that optimizes your study schedule. It analyzes your performance on each flashcard and automatically determines the best time for you to review it. Unlike traditional methods, FSRS adapts to your individual learning patterns, showing you cards right when you're about to forget them - maximizing retention while minimizing study time. The more you use it, the smarter it gets at predicting your memory!"
    },
    {
      id: 5,
      question: "What are JLPT levels?",
      answer: "JLPT (Japanese Language Proficiency Test) has 5 levels: N5 (beginner) to N1 (advanced). Words in SUCA are tagged with their JLPT level to help you study at the appropriate difficulty."
    },
    {
      id: 6,
      question: "How do I report a bug or suggest a feature?",
      answer: "Please visit our Contact page to report bugs or suggest new features. We actively review all feedback from our community."
    }
  ];

  return (
    <div className="page">
      <div className="container">
        <div className="page-content">
          <h1 className="page-title">Help & FAQ</h1>
          <div className="page-body">
            <p className="lead">
              Find answers to common questions about using SUCA. Can't find what you're looking for? 
              Visit our <a href="/contact">Contact page</a>.
            </p>

            <div className="faq-list">
              {faqs.map((faq) => (
                <div key={faq.id} className="faq-item">
                  <button
                    className={`faq-question ${openQuestion === faq.id ? 'active' : ''}`}
                    onClick={() => toggleQuestion(faq.id)}
                  >
                    <span>{faq.question}</span>
                    <span className="faq-icon">{openQuestion === faq.id ? '−' : '+'}</span>
                  </button>
                  {openQuestion === faq.id && (
                    <div className="faq-answer">
                      <p>{faq.answer}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>

            <div className="help-section">
              <h2>Getting Started</h2>
              <ol>
                <li>Sign in with your Google account</li>
                <li>Explore the Dictionary to look up Japanese words</li>
                <li>Create Flashcard sets to study vocabulary</li>
              </ol>
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
