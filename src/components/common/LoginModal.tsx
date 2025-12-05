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
  const [mode, setMode] = useState<string>('login');
  const [viewSwitching, setViewSwitching] = useState<boolean>(false);
  const [isSigningIn, setIsSigningIn] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [signupEmail, setSignupEmail] = useState<string>('');
  const [signupUsername, setSignupUsername] = useState<string>('');
  const [signupPassword, setSignupPassword] = useState<string>('');
  const [loginIdentifier, setLoginIdentifier] = useState<string>('');
  const [loginPassword, setLoginPassword] = useState<string>('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Animation duration (ms) — keep in sync with CSS variables in LoginModal.css
  const ANIM_MS = 260;

  useEffect(() => {
    if (open) {
      setMounted(true);
      // ensure not in closing state
      setIsClosing(false);
      // reset to login by default when opening
      setMode('login');
      // clear any lingering messages and form values when opening fresh
      setErrorMsg(null);
      setSuccessMsg(null);
      setSignupEmail('');
      setSignupUsername('');
      setSignupPassword('');
      setLoginIdentifier('');
      setLoginPassword('');
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

  // Also clear transient messages when switching between views
  useEffect(() => {
    setErrorMsg(null);
    setSuccessMsg(null);
  }, [mode]);

  // Safety wrapper for Google auth to avoid stuck "Signing in…" state
  const handleGoogleAuth = async (context: 'login' | 'signup') => {
    try {
      setIsSigningIn(true);
      // Safety timeout: if popup is closed or hangs, re-enable button
      const safetyTimeout = setTimeout(() => {
        setIsSigningIn(false);
      }, 12000);
      const res = await signInWithGooglePopup();
      clearTimeout(safetyTimeout);
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
                    onClick={() => handleGoogleAuth('login')}
                    disabled={isSigningIn}
                  >
                    {isSigningIn ? 'Signing in…' : 'Continue with Google'}
                  </button>
                  <div className="divider"><span>or email</span></div>
                  {errorMsg && <div className="error-msg" role="alert">{errorMsg}</div>}
                  {successMsg && <div className="success-msg" role="status">{successMsg}</div>}
                  <label>Username</label>
                  <input
                    type="text"
                    placeholder="Enter your username"
                    value={loginIdentifier}
                    onChange={(e) => setLoginIdentifier(e.target.value)}
                  />
                  <label>Password</label>
                  <input
                    type="password"
                    placeholder="Enter your password"
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                  />
                  <button
                    className="primary"
                    disabled={isSubmitting}
                    onClick={async () => {
                      setErrorMsg(null);
                      setSuccessMsg(null);

                      const username = loginIdentifier.trim();
                      const password = loginPassword;

                      if (!username || !password) {
                        setErrorMsg('Please enter username and password.');
                        return;
                      }

                      try {
                        setIsSubmitting(true);
                        const api = ApiService.getInstance();
                        const token = await api.loginUser(username, password);
                        localStorage.setItem('suca_access_token', token.access_token);
                        // Fetch current user info for header display
                        try {
                          const me = await api.getCurrentUser();
                          localStorage.setItem('suca_user', JSON.stringify(me));
                        } catch {}
                        setSuccessMsg('Logged in successfully!');
                        setTimeout(() => {
                          onClose();
                        }, 300);
                      } catch (err: any) {
                        const msg = err?.response?.data?.detail || err?.message || 'Login failed';
                        setErrorMsg(Array.isArray(msg) ? msg.map((m: any) => m?.msg ?? String(m)).join(', ') : String(msg));
                      } finally {
                        setIsSubmitting(false);
                      }
                    }}
                  >
                    {isSubmitting ? 'Logging in…' : 'Log In'}
                  </button>
                </div>
              ) : (
                <div className="view-signup">
                  <h3>Sign up</h3>
                  <button
                    className="social-google"
                    onClick={() => handleGoogleAuth('signup')}
                    disabled={isSigningIn}
                  >
                    {isSigningIn ? 'Signing in…' : 'Continue with Google'}
                  </button>
                  <div className="divider"><span>or email</span></div>
                  {errorMsg && <div className="error-msg" role="alert">{errorMsg}</div>}
                  {successMsg && <div className="success-msg" role="status">{successMsg}</div>}
                  <label>Email</label>
                  <input
                    type="email"
                    placeholder="user@email.com"
                    value={signupEmail}
                    onChange={(e) => setSignupEmail(e.target.value)}
                  />
                  <label>Username</label>
                  <input
                    type="text"
                    placeholder="username"
                    value={signupUsername}
                    onChange={(e) => setSignupUsername(e.target.value)}
                  />
                  <label>Password</label>
                  <input
                    type="password"
                    placeholder="Enter your password"
                    value={signupPassword}
                    onChange={(e) => setSignupPassword(e.target.value)}
                  />
                  <div className="tos">
                    <input type="checkbox" aria-label="Accept terms" />
                    <span>I accept SUCA's Terms of Service and Privacy Policy</span>
                  </div>
                  <button
                    className="primary"
                    disabled={isSubmitting}
                    onClick={async () => {
                      setErrorMsg(null);
                      setSuccessMsg(null);

                      const username = signupUsername.trim();
                      const email = signupEmail.trim();
                      const password = signupPassword;

                      if (!email || !username || !password) {
                        setErrorMsg('Please fill in email, username, and password.');
                        return;
                      }
                      if (username.length < 3) {
                        setErrorMsg('Username must be at least 3 characters.');
                        return;
                      }
                      if (password.length < 8) {
                        setErrorMsg('Password must be at least 8 characters.');
                        return;
                      }

                      try {
                        setIsSubmitting(true);
                        const api = ApiService.getInstance();
                        const token = await api.registerUser(username, email, password);
                        // Store token and fetch current user info
                        localStorage.setItem('suca_access_token', token.access_token);
                        try {
                          const me = await api.getCurrentUser();
                          localStorage.setItem('suca_user', JSON.stringify(me));
                        } catch {}
                        setSuccessMsg('Account created successfully!');
                        // Close the modal shortly after success
                        setTimeout(() => {
                          onClose();
                        }, 400);
                      } catch (err: any) {
                        const msg = err?.response?.data?.detail || err?.message || 'Sign up failed';
                        setErrorMsg(Array.isArray(msg) ? msg.map((m: any) => m?.msg ?? String(m)).join(', ') : String(msg));
                      } finally {
                        setIsSubmitting(false);
                      }
                    }}
                  >
                    {isSubmitting ? 'Creating account…' : 'Sign Up'}
                  </button>
                </div>
              )}
            </div>

            {mode === 'signup' && (
              <button
                className="secondary"
                onClick={() => {
                  setViewSwitching(true);
                  setTimeout(() => { setMode('login'); setViewSwitching(false); }, ANIM_MS);
                }}
              >
                Already have an account? Log In
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginModal;
