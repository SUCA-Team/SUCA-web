import React, { useRef, useEffect, useState } from 'react';
import { NavLink, Link, useLocation, useNavigate } from 'react-router-dom';
import './Header.css';
import useAuth from '../../hooks/useAuth';
import { signOutUser } from '../../firebase';

export const Header: React.FC = () => {
  const navRef = useRef<HTMLDivElement | null>(null);
  const highlightRef = useRef<HTMLDivElement | null>(null);
  const location = useLocation();
  const [highlightStyle, setHighlightStyle] = useState({ left: 0, width: 0 });
  const [highlightVisible, setHighlightVisible] = useState(false);
  const auth = useAuth();
  const user = auth?.user ?? null;
  const [sucaUser, setSucaUser] = useState<{ user_id: string; username: string; email: string } | null>(null);
  const navigate = useNavigate();

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

  // Load SUCA backend user info if present
  useEffect(() => {
    try {
      const raw = localStorage.getItem('suca_user');
      setSucaUser(raw ? JSON.parse(raw) : null);
    } catch {
      setSucaUser(null);
    }
  }, [user]);

  return (
    <>
      <header className="header">
        <div className="header-inner container">
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
          </nav>

          <div className="right">
            {(user || sucaUser) ? (
              (() => {
                const display = (user?.displayName || user?.email || sucaUser?.username || sucaUser?.email || 'User');
                const photo = user?.photoURL ?? undefined;
                const firstInitial = (sucaUser?.username || sucaUser?.email || 'U').charAt(0).toUpperCase();
                return (
                  <div className="user-chip" title={display}>
                    <div className="chip-left">
                      {photo ? (
                        <img className="avatar" src={photo} alt={display ?? 'User avatar'} />
                      ) : (
                        <div className="avatar avatar-initial" aria-label="User avatar">{firstInitial}</div>
                      )}
                      <span className="gname" title={display}>{(display || '').split(' ')[0]}</span>
                    </div>
                    <button
                      className="signout-btn"
                      onClick={async (e) => {
                        e.stopPropagation();
                        try {
                          await signOutUser();
                          // after signing out, navigate back to homepage
                          // Clear backend token and cached user
                          localStorage.removeItem('suca_access_token');
                          localStorage.removeItem('suca_user');
                          setSucaUser(null);
                          navigate('/');
                        } catch (err) {
                          console.error('Sign out failed', err);
                        }
                      }}
                      aria-label="Sign out"
                    >
                      <img src="src\\assets\\LogoutLogo.png" alt="logout.png"/>
                    </button>
                  </div>
                );
              })()
            ) : (
              <button className="login-btn" onClick={() => navigate('/login')}>LOG IN</button>
            )}
          </div>
        </div>
      </header>
    </>
  );
};