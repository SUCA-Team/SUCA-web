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
  const [showTerms, setShowTerms] = useState<boolean>(false);

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
    } catch (err: unknown) {
      // Common Firebase error when user closes popup: auth/popup-closed-by-user
      const code = (err as { code?: string; error?: { code?: string } })?.code || (err as { error?: { code?: string } })?.error?.code;
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
            <h3 style={{ textAlign: 'center', marginBottom: '2rem', fontSize: '2.5rem', fontWeight: 700 }}>Log in to SUCA</h3>
            {errorMsg && <div className="error-msg" role="alert" style={{ marginBottom: '1rem' }}>{errorMsg}</div>}
            <button
              className="social-google"
              onClick={() => handleGoogleAuth('login')}
              disabled={isSigningIn}
              style={{ width: '100%', backgroundColor: '#BC002D', color: '#ffffffff', border: '1px solid #ddd', padding: '0.6rem', fontSize: '1.3rem', borderRadius: '999px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}
            >
              {isSigningIn ? 'Signing in…' : 'Log in with Google'}
            </button>
            <p style={{ marginTop: '1.5rem', fontSize: '0.85rem', color: '#666', textAlign: 'center', lineHeight: '1.5' }}>
              By logging in, you have accepted SUCA's{' '}
              <button
                onClick={() => setShowTerms(true)}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#BC002D',
                  textDecoration: 'underline',
                  cursor: 'pointer',
                  padding: 0,
                  fontSize: '0.85rem',
                  fontWeight: 600,
                }}
              >
                Terms of Service
              </button>
            </p>
          </div>
        </div>
      </div>

      {/* Terms of Service Overlay */}
      {showTerms && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0,0,0,0.7)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 3000,
          }}
          onClick={() => setShowTerms(false)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              background: 'white',
              borderRadius: '16px',
              maxWidth: '800px',
              maxHeight: '80vh',
              overflow: 'auto',
              padding: '2rem',
              boxShadow: '0 8px 32px rgba(0,0,0,0.2)',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h2 style={{ margin: 0, fontSize: '1.8rem', fontWeight: 700, color: '#BC002D' }}>Terms of Service</h2>
              <button
                onClick={() => setShowTerms(false)}
                style={{
                  background: 'none',
                  border: 'none',
                  fontSize: '1.5rem',
                  cursor: 'pointer',
                  color: '#666',
                  padding: '0.5rem',
                }}
              >
                ✕
              </button>
            </div>
            <div style={{ color: '#333', lineHeight: '1.8', fontSize: '0.95rem' }}>
              <h3 style={{ marginTop: '1.5rem', marginBottom: '0.75rem', fontSize: '1.2rem', fontWeight: 600 }}>1. Acceptance of Terms</h3>
              <p>By accessing and using SUCA (Study, Understand, Compete and Achieve Japanese), you accept and agree to be bound by the terms and provision of this agreement.</p>

              <h3 style={{ marginTop: '1.5rem', marginBottom: '0.75rem', fontSize: '1.2rem', fontWeight: 600 }}>2. Use License</h3>
              <p>Permission is granted to temporarily access the materials on SUCA for personal, non-commercial use only. This is the grant of a license, not a transfer of title.</p>

              <h3 style={{ marginTop: '1.5rem', marginBottom: '0.75rem', fontSize: '1.2rem', fontWeight: 600 }}>3. User Account</h3>
              <p>You are responsible for maintaining the confidentiality of your account and password. You agree to accept responsibility for all activities that occur under your account.</p>

              <h3 style={{ marginTop: '1.5rem', marginBottom: '0.75rem', fontSize: '1.2rem', fontWeight: 600 }}>4. User Content</h3>
              <p>Users may create and share flashcards and study materials. You retain ownership of your content but grant SUCA a license to use, display, and distribute it within the platform.</p>

              <h3 style={{ marginTop: '1.5rem', marginBottom: '0.75rem', fontSize: '1.2rem', fontWeight: 600 }}>5. Prohibited Activities</h3>
              <p>You may not use SUCA to:</p>
              <ul style={{ marginLeft: '1.5rem' }}>
                <li>Share inappropriate, offensive, or illegal content</li>
                <li>Violate any intellectual property rights</li>
                <li>Attempt to gain unauthorized access to the system</li>
                <li>Interfere with other users' experience</li>
              </ul>

              <h3 style={{ marginTop: '1.5rem', marginBottom: '0.75rem', fontSize: '1.2rem', fontWeight: 600 }}>6. Privacy</h3>
              <p>Your use of SUCA is also governed by our Privacy Policy. We collect and use your data as described in our Privacy Policy.</p>

              <h3 style={{ marginTop: '1.5rem', marginBottom: '0.75rem', fontSize: '1.2rem', fontWeight: 600 }}>7. Disclaimer</h3>
              <p>The materials on SUCA are provided on an 'as is' basis. SUCA makes no warranties, expressed or implied, and hereby disclaims and negates all other warranties including, without limitation, implied warranties or conditions of merchantability, fitness for a particular purpose, or non-infringement of intellectual property or other violation of rights.</p>

              <h3 style={{ marginTop: '1.5rem', marginBottom: '0.75rem', fontSize: '1.2rem', fontWeight: 600 }}>8. Limitations</h3>
              <p>In no event shall SUCA or its suppliers be liable for any damages (including, without limitation, damages for loss of data or profit, or due to business interruption) arising out of the use or inability to use SUCA.</p>

              <h3 style={{ marginTop: '1.5rem', marginBottom: '0.75rem', fontSize: '1.2rem', fontWeight: 600 }}>9. Modifications</h3>
              <p>SUCA may revise these terms of service at any time without notice. By using this platform, you are agreeing to be bound by the then current version of these terms of service.</p>

              <h3 style={{ marginTop: '1.5rem', marginBottom: '0.75rem', fontSize: '1.2rem', fontWeight: 600 }}>10. Contact Information</h3>
              <p>If you have any questions about these Terms of Service, please contact us through the platform.</p>
            </div>
            <div style={{ marginTop: '2rem', textAlign: 'center' }}>
              <button
                onClick={() => setShowTerms(false)}
                style={{
                  padding: '0.75rem 2rem',
                  border: 'none',
                  borderRadius: '999px',
                  background: '#BC002D',
                  color: 'white',
                  fontWeight: 600,
                  cursor: 'pointer',
                  fontSize: '1rem',
                }}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LoginModal;
