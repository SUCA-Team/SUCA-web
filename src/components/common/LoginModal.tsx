import React, { useEffect, useState } from 'react';
import './LoginModal.css';
import loginBg from '../../assets/loginpage.jpg';
import { signInWithGooglePopup } from '../../firebase';

interface Props {
  open: boolean;
  onClose: () => void;
}

export const LoginModal: React.FC<Props> = ({ open, onClose }) => {
  const [mounted, setMounted] = useState<boolean>(open);
  const [isClosing, setIsClosing] = useState<boolean>(false);
  const [mode, setMode] = useState<'login'|'signup'>('login');
  const [viewSwitching, setViewSwitching] = useState<boolean>(false);
  const [isSigningIn, setIsSigningIn] = useState<boolean>(false);

  // Animation duration (ms) — keep in sync with CSS variables in LoginModal.css
  const ANIM_MS = 260;

  useEffect(() => {
    if (open) {
      setMounted(true);
      // ensure not in closing state
      setIsClosing(false);
      // reset to login by default when opening
      setMode('login');
    } else if (mounted) {
      // start closing animation
      setIsClosing(true);
      const t = setTimeout(() => {
        setMounted(false);
        setIsClosing(false);
      }, ANIM_MS);
      return () => clearTimeout(t);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  if (!mounted) return null;

  return (
    <div className={`login-modal-overlay ${isClosing ? 'closing' : ''}`} role="dialog" aria-modal="true">
      <div className={`login-modal ${isClosing ? 'closing' : ''}`}>
        <div className="login-left" style={{ backgroundImage: `url(${loginBg})` }}>
          <div className="login-left-brand">
            <h2>Study, Understand,</h2>
            <h2>Compete and Achieve Japanese</h2>
          </div>
        </div>

        <div className="login-right">
          <button className="close-btn" onClick={onClose} aria-label="Close">✕</button>
          <div className="login-panel">
            <div className="tabs">
              <button className={`tab ${mode === 'signup' ? 'active' : ''}`} onClick={() => {
                if (mode !== 'signup') {
                  setViewSwitching(true);
                  setTimeout(() => { setMode('signup'); setViewSwitching(false); }, ANIM_MS);
                }
              }}>Sign up</button>
              <button className={`tab ${mode === 'login' ? 'active' : ''}`} onClick={() => {
                if (mode !== 'login') {
                  setViewSwitching(true);
                  setTimeout(() => { setMode('login'); setViewSwitching(false); }, ANIM_MS);
                }
              }}>Log in</button>
            </div>

            <div className={`view ${viewSwitching ? 'fading' : 'visible'}`}>
              {mode === 'login' ? (
                <div className="view-login">
                  <h3>Log in</h3>
                  <button
                    className="social-google"
                    onClick={async () => {
                      try {
                        setIsSigningIn(true);
                        const res = await signInWithGooglePopup();
                        // res.user contains user info. Close modal and log user for now.
                        console.log('Signed in user:', res.user);
                        onClose();
                      } catch (err) {
                        console.error('Google sign-in failed', err);
                        // Optionally, display UI error here.
                      } finally {
                        setIsSigningIn(false);
                      }
                    }}
                    disabled={isSigningIn}
                  >
                    {isSigningIn ? 'Signing in…' : 'Continue with Google'}
                  </button>
                  <div className="divider"><span>or email</span></div>
                  <label>Email</label>
                  <input type="email" placeholder="Enter your email address or username" />
                  <label>Password</label>
                  <input type="password" placeholder="Enter your password" />
                  <button className="primary">Log In</button>
                </div>
              ) : (
                <div className="view-signup">
                  <h3>Sign up</h3>
                  <button
                    className="social-google"
                    onClick={async () => {
                      try {
                        setIsSigningIn(true);
                        const res = await signInWithGooglePopup();
                        console.log('Signed up user:', res.user);
                        onClose();
                      } catch (err) {
                        console.error('Google sign-up failed', err);
                      } finally {
                        setIsSigningIn(false);
                      }
                    }}
                    disabled={isSigningIn}
                  >
                    {isSigningIn ? 'Signing in…' : 'Continue with Google'}
                  </button>
                  <div className="divider"><span>or email</span></div>
                  <label>Email</label>
                  <input type="email" placeholder="user@email.com" />
                  <label>Username</label>
                  <input type="text" placeholder="username" />
                  <label>Password</label>
                  <input type="password" placeholder="Enter your password" />
                  <div style={{marginTop:8}}>
                    <label style={{fontSize:12}}><input type="checkbox" /> I accept SUCA's Terms of Service and Privacy Policy</label>
                  </div>
                  <button className="primary">Sign Up</button>
                </div>
              )}
            </div>

            <button className="secondary">Already have an account? Log In</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginModal;
