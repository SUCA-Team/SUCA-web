import React, { useEffect, useState } from 'react';
import './LoginModal.css';
import loginBg from '../../assets/loginpage.jpg';
import { signInWithGooglePopup } from '../../firebase';
import ApiService from '../../services/apiService';

interface Props {
  open: boolean;
  onClose: () => void;
}

export const LoginModal: React.FC<Props> = ({ open, onClose }) => {
  const [mounted, setMounted] = useState<boolean>(open);
  const [isClosing, setIsClosing] = useState<boolean>(false);
  const [isSigningIn, setIsSigningIn] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Animation duration (ms) — keep in sync with CSS variables in LoginModal.css
  const ANIM_MS = 260;

  useEffect(() => {
    if (open) {
      setMounted(true);
      setIsClosing(false);
      setErrorMsg(null);
    } else if (mounted) {
      setIsClosing(true);
      const t = setTimeout(() => {
        setMounted(false);
        setIsClosing(false);
      }, ANIM_MS);
      return () => clearTimeout(t);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  // Safety wrapper for Google auth to avoid stuck "Signing in…" state
  const handleGoogleAuth = async (context: 'login' | 'signup') => {
    try {
      setIsSigningIn(true);
      setErrorMsg(null);
      // Safety timeout: if popup is closed or hangs, re-enable button
      const safetyTimeout = setTimeout(() => {
        setIsSigningIn(false);
      }, 12000);
      const res = await signInWithGooglePopup();
      clearTimeout(safetyTimeout);
      
      // Fetch current user info for header display
      try {
        const api = ApiService.getInstance();
        const me = await api.getCurrentUser();
        localStorage.setItem('suca_user', JSON.stringify(me));
      } catch (err) {
        console.error('Failed to fetch user info:', err);
      }
      
      console.log(context === 'login' ? 'Signed in user:' : 'Signed up user:', res.user);
      onClose();
    } catch (err: any) {
      // Common Firebase error when user closes popup: auth/popup-closed-by-user
      const code = err?.code || err?.error?.code;
      if (code === 'auth/popup-closed-by-user') {
        // Silently ignore; user simply cancelled
        console.warn('Google auth popup closed by user');
      } else {
        console.error('Google auth failed', err);
        setErrorMsg('Google authentication was cancelled or failed.');
      }
    } finally {
      setIsSigningIn(false);
    }
  };

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
            <h3 style={{ textAlign: 'center', marginBottom: '2rem', fontSize: '1.8rem', fontWeight: 700 }}>Log in to SUCA</h3>
            {errorMsg && <div className="error-msg" role="alert" style={{ marginBottom: '1rem' }}>{errorMsg}</div>}
            <button
              className="social-google"
              onClick={() => handleGoogleAuth('login')}
              disabled={isSigningIn}
              style={{ width: '100%' }}
            >
              {isSigningIn ? 'Signing in…' : 'Log in with Google'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginModal;
