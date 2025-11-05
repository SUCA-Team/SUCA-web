import React from 'react';

export const FeaturesPage: React.FC = () => {
  return (
    <div className="page">
      <div className="container">
        <div className="page-content">
          <h1 className="page-title">Features</h1>
          <div className="page-body">
            <p className="lead">
              Discover all the powerful features that make SUCA the most effective
              Japanese learning platform available today.
            </p>
            
            <div className="features-list">
              <div className="feature-item">
                <h2>📚 Interactive Learning</h2>
                <p>
                  Engage with dynamic lessons that adapt to your learning style.
                  From hiragana basics to advanced kanji, our interactive exercises
                  make learning stick.
                </p>
              </div>
              
              <div className="feature-item">
                <h2>🏆 Competitive System</h2>
                <p>
                  Compete with learners worldwide through daily challenges, leaderboards,
                  and achievement systems. Turn your progress into a game!
                </p>
              </div>
              
              <div className="feature-item">
                <h2>🎯 Personalized Learning</h2>
                <p>
                  AI-powered recommendations create a custom learning path based on
                  your progress, strengths, and areas for improvement.
                </p>
              </div>
              
              <div className="feature-item">
                <h2>💬 Real-time Translation</h2>
                <p>
                  Get instant translations with cultural context and usage examples.
                  Understand not just what words mean, but how to use them naturally.
                </p>
              </div>
              
              <div className="feature-item">
                <h2>📊 Progress Tracking</h2>
                <p>
                  Detailed analytics show your learning patterns, weak points, and
                  achievements. Watch your Japanese skills grow over time.
                </p>
              </div>
              
              <div className="feature-item">
                <h2>🌐 Community Support</h2>
                <p>
                  Connect with fellow learners and native speakers. Practice conversations,
                  get feedback, and make friends on your language journey.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};