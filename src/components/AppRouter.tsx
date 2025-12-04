import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Header } from '../components/layout/Header';
import { HomePage } from '../pages/Home/HomePage';
import { AboutPage } from '../pages/About/AboutPage';
import { FeaturesPage } from '../pages/Features/FeaturesPage';
import DictionaryPage from '../pages/Dictionary/DictionaryPage';
import FlashcardPage from '../pages/Flashcard/FlashcardPage';
import MultiplayerPage from '../pages/Multiplayer/MultiplayerPage';
import LoginPage from '../pages/Login/LoginPage';
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
          <Route path="/multiplayer" element={<MultiplayerPage />} />
          <Route path="/login" element={<LoginPage />} />
        </Routes>
        <Footer />
      </div>
    </Router>
  );
};