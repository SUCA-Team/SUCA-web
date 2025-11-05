import React, { useState, useRef, useEffect } from 'react';
import { NavLink, Link, useLocation } from 'react-router-dom';
import './Header.css';
import LoginModal from '../../components/common/LoginModal';

export const Header: React.FC = () => {
  const [open, setOpen] = useState(false);
  const navRef = useRef<HTMLDivElement | null>(null);
  const highlightRef = useRef<HTMLDivElement | null>(null);
  const location = useLocation();
  const [highlightStyle, setHighlightStyle] = useState({ left: 0, width: 0 });
  const [highlightVisible, setHighlightVisible] = useState(false);

  useEffect(() => {
    let hideTimer: number | undefined;
    const update = () => {
      const nav = navRef.current;
      if (!nav) return;

      const active = nav.querySelector('.nav-link.active') as HTMLElement | null;
      if (active && highlightRef.current) {
        const navRect = nav.getBoundingClientRect();
        const rect = active.getBoundingClientRect();
        const newStyle = { left: rect.left - navRect.left, width: rect.width };

        // If highlight was not visible (coming from homepage/hidden state),
        // set left/width instantly (no left/width transition) then fade in.
        // This prevents the highlight from 'jumping' from its previous position
        // (e.g. near the logo) when appearing.
        const hl = highlightRef.current;
        if (!highlightVisible) {
          // Temporarily disable left/width motion via a helper CSS class.
          hl.classList.add('disable-motion');
          // Apply the target geometry immediately (no transition)
          setHighlightStyle(newStyle);
          // Next frame, remove the helper class so subsequent changes animate normally,
          // and then show the highlight (opacity transition will run).
          window.requestAnimationFrame(() => {
            hl.classList.remove('disable-motion');
            setHighlightVisible(true);
          });
        } else {
          // Normal navigation between internal pages: animate left/width
          setHighlightStyle(newStyle);
          // ensure visible
          setHighlightVisible(true);
        }

        if (hideTimer) { window.clearTimeout(hideTimer); hideTimer = undefined; }
      } else if (highlightVisible) {
        // start fade-out, then collapse highlight after animation
        setHighlightVisible(false);
      }
    };

    // update on location change and resize
    update();
    window.addEventListener('resize', update);
    return () => { window.removeEventListener('resize', update); if (hideTimer) window.clearTimeout(hideTimer); };
  }, [location, highlightVisible]);

  return (
    <>
      <header className="header">
        <div className="header-inner">
          <div className="left">
            <Link to="/" className="logo" onClick={() => {

            }}>
              <span className="logo-text">SUCA</span>
            </Link>
          </div>

          <nav className="center-nav" ref={navRef}>
            <div ref={highlightRef} className={`nav-highlight ${highlightVisible ? 'visible' : ''}`} style={{ left: highlightStyle.left, width: highlightStyle.width }} />
            <NavLink to="/dictionary" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
              <span className="label dark">DICTIONARY</span>
              <span className="label light">DICTIONARY</span>
            </NavLink>
            <NavLink to="/flashcard" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
              <span className="label dark">FLASHCARD</span>
              <span className="label light">FLASHCARD</span>
            </NavLink>
            <NavLink to="/multiplayer" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
              <span className="label dark">MULTIPLAYER</span>
              <span className="label light">MULTIPLAYER</span>
            </NavLink>
          </nav>

          <div className="right">
            <button className="login-btn" onClick={() => setOpen(true)}>LOG IN</button>
          </div>
        </div>
      </header>

      <LoginModal open={open} onClose={() => setOpen(false)} />
    </>
  );
};