import React from 'react';
import { Link } from 'react-router-dom';
import './Footer.css';

export const Footer: React.FC = () => {
  return (
    <footer className="site-footer">
      <div className="footer-top">
        <div className="footer-column">
          <h4>SOCIAL NETWORKS</h4>
          <button className="footer-link">Facebook</button>
        </div>

        <div className="footer-column">
          <h4>DICTIONARY</h4>
          <Link to="/dictionary" className="footer-link">Dictionary search</Link>
          <button className="footer-link">Lists and tags</button>
        </div>

        <div className="footer-column">
          <h4>FLASHCARD</h4>
          <Link to="/flashcard" className="footer-link">Set</Link>
        </div>

        <div className="footer-column">
          <h4>MULTIPLAYER</h4>
          <Link to="/multiplayer" className="footer-link">Elo rating</Link>
        </div>

        <div className="footer-column">
          <h4>OTHER</h4>
          <button className="footer-link">About us</button>
          <button className="footer-link">Settings</button>
          <button className="footer-link">Privacy policy</button>
          <button className="footer-link">Legal terms</button>
          <button className="footer-link">FAQ</button>
          <button className="footer-link">Contact us</button>
        </div>
      </div>

      <div className="footer-bottom">
        <div className="copyright">Copyright © SUCA Team 2025</div>
      </div>
    </footer>
  );
};

export default Footer;
