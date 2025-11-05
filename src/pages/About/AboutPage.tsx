import React from 'react';

export const AboutPage: React.FC = () => {
  return (
    <div className="page">
      <div className="container">
        <div className="page-content">
          <h1 className="page-title">About SUCA</h1>
          <div className="page-body">
            <p className="lead">
              SUCA is the world's first competitive system for Japanese language learning,
              designed to make studying engaging, effective, and fun.
            </p>
            
            <h2>Our Mission</h2>
            <p>
              We believe that learning Japanese should be an exciting journey, not a chore.
              Our platform combines traditional learning methods with modern gamification
              to create an immersive experience that keeps you motivated.
            </p>
            
            <h2>What Makes Us Different</h2>
            <ul>
              <li>Competitive learning environment with global rankings</li>
              <li>Real-time translation with cultural context</li>
              <li>Personalized learning paths based on JLPT levels</li>
              <li>Interactive exercises and immediate feedback</li>
              <li>Community-driven learning with native speakers</li>
            </ul>
            
            <h2>Join Our Community</h2>
            <p>
              With over 500,000 active learners worldwide, SUCA has become the go-to
              platform for serious Japanese language students. Whether you're preparing
              for JLPT exams or just starting your Japanese journey, we're here to help
              you achieve your goals.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};