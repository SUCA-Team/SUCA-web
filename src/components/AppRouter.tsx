import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Header } from '../components/layout/Header';
import { HomePage } from '../pages/Home/HomePage';
import { AboutPage } from '../pages/About/AboutPage';
import { FeaturesPage } from '../pages/Features/FeaturesPage';
import DictionaryPage from '../pages/Dictionary/DictionaryPage';
import FlashcardPage from '../pages/Flashcard/FlashcardPage';
import AddDeckPage from '../pages/Flashcard/AddDeckPage';
import EditDeckPage from '../pages/Flashcard/EditDeckPage';
import StudyPage from '../pages/Flashcard/StudyPage';
import LoginPage from '../pages/Login/LoginPage';
import HelpPage from '../pages/Help/HelpPage';
import PrivacyPage from '../pages/Privacy/PrivacyPage';
import TermsPage from '../pages/Terms/TermsPage';
import ContactPage from '../pages/Contact/ContactPage';
import Footer from '../components/layout/Footer';

export const AppRouter: React.FC = () => {
  return (
    <Router>
      <div className="app">
        <Header />
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/features" element={<FeaturesPage />} />
          <Route path="/dictionary" element={<DictionaryPage />} />
          {/** Translate page removed */}
          <Route path="/flashcard" element={<FlashcardPage />} />
          <Route path="/flashcard/add" element={<AddDeckPage />} />
          <Route path="/flashcard/edit/:deckId" element={<EditDeckPage />} />
          <Route path="/flashcard/study/:deckId" element={<StudyPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/help" element={<HelpPage />} />
          <Route path="/faq" element={<HelpPage />} />
          <Route path="/privacy" element={<PrivacyPage />} />
          <Route path="/terms" element={<TermsPage />} />
          <Route path="/contact" element={<ContactPage />} />
        </Routes>
        <Footer />
      </div>
    </Router>
  );
};