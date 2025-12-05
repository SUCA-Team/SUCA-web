import React from 'react';
import { Link } from 'react-router-dom';
import './Footer.css';

export const Footer: React.FC = () => {
  return (
    <footer className="site-footer">
      <div className="footer-top">

        <div className="footer-column">
          <h4>DICTIONARY</h4>
          <Link to="/dictionary" className="footer-link">Dictionary search</Link>
        </div>

        <div className="footer-column">
          <h4>FLASHCARD</h4>
          <Link to="/flashcard" className="footer-link">Set</Link>
        </div>

        <div className="footer-column">
          <h4>OTHER</h4>
          <Link to="/about" className="footer-link">About us</Link>
          <Link to="/privacy" className="footer-link">Privacy policy</Link>
          <Link to="/terms" className="footer-link">Legal terms</Link>
          <Link to="/faq" className="footer-link">FAQ</Link>
          <Link to="/contact" className="footer-link">Contact us</Link>
        </div>
      </div>

      <div className="footer-bottom">
        <div className="copyright">Made by SUCA Team 2025</div>
      </div>
    </footer>
  );
};

export default Footer;
