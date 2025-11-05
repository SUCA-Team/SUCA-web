import React from 'react';
import body1 from '../../assets/BodyHomepage1.png';
import body2 from '../../assets/BodyHomepage2.png';
import './HomePage.css';

export const HomePage: React.FC = () => {
  return (
    <div className="home-page">
      <main className="main-content">
        <div className="body-image full-width">
          <img src={body1} alt="Body 1" />
        </div>
        <div className="body-image full-width">
          <img src={body2} alt="Body 2" />
        </div>
      </main>
    </div>
  );
};