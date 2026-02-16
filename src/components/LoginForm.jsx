import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../supabaseClient';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import './LoginForm.css';

const LoginForm = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [isLogin, setIsLogin] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [pendingConfirmation, setPendingConfirmation] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);
  const { currentUser, profile } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (currentUser) {
      navigate(profile ? '/' : '/profile-setup');
    }
  }, [currentUser, profile, navigate]);

  // ── Real-time validation ──────────────────────────────────
  const validateEmail = (val) => {
    if (!val) { setEmailError(''); return; }
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    setEmailError(re.test(val) ? '' : 'Please enter a valid email');
  };

  const validatePassword = (val) => {
    if (!val) { setPasswordError(''); return; }
    setPasswordError(val.length < 6 ? 'Password must be at least 6 characters' : '');
  };

  // ── OAuth Login ───────────────────────────────────────────
  const handleOAuthLogin = async (provider) => {
    try {
      setLoading(true);
      setError('');
      const { error } = await supabase.auth.signInWithOAuth({
        provider,
        options: { redirectTo: window.location.origin },
      });
      if (error) throw error;
    } catch (err) {
      console.error(err);
      setError('Failed to sign in with ' + provider + '. ' + err.message);
      setLoading(false);
    }
  };

  // ── Email/Password Auth ───────────────────────────────────
  const handleEmailAuth = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    if (!email || !password) {
      setError('Please fill in all required fields.');
      setLoading(false);
      return;
    }

    if (emailError || passwordError) {
      setError('Please fix the errors above.');
      setLoading(false);
      return;
    }

    if (!isLogin && password !== confirmPassword) {
      setError('Passwords do not match.');
      setLoading(false);
      return;
    }

    try {
      if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
      } else {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: { full_name: displayName },
            emailRedirectTo: window.location.origin + '/auth/callback',
          },
        });
        if (error) throw error;
        if (data.user && !data.session) {
          setPendingConfirmation(true);
          setResendCooldown(60);
          setLoading(false);
          return;
        }
      }
    } catch (err) {
      console.error(err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // ── Resend confirmation email ──────────────────────────────
  const handleResendConfirmation = useCallback(async () => {
    if (resendCooldown > 0) return;
    try {
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email,
        options: { emailRedirectTo: window.location.origin + '/auth/callback' },
      });
      if (error) throw error;
      setResendCooldown(60);
      setSuccess('Confirmation email resent!');
    } catch (err) {
      setError(err.message);
    }
  }, [email, resendCooldown]);

  // ── Resend cooldown timer ─────────────────────────────────
  useEffect(() => {
    if (resendCooldown <= 0) return;
    const t = setTimeout(() => setResendCooldown((c) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [resendCooldown]);

  // ── Toggle login/signup ───────────────────────────────────
  const toggleForm = () => {
    setIsLogin(!isLogin);
    setError('');
    setSuccess('');
    setEmail('');
    setPassword('');
    setConfirmPassword('');
    setDisplayName('');
    setEmailError('');
    setPasswordError('');
    setShowPassword(false);
    setShowConfirmPassword(false);
    setPendingConfirmation(false);
    setResendCooldown(0);
  };

  // ── Chat bubble illustration ──────────────────────────────
  const ChatIllustration = () => (
    <div className="login-illustration">
      <div className="illustration-bubbles">
        <div className="illus-bubble illus-bubble-1">
          <div className="illus-bubble-dot"></div>
          <div className="illus-bubble-dot"></div>
          <div className="illus-bubble-dot"></div>
        </div>
        <div className="illus-bubble illus-bubble-2">Hey! 👋</div>
        <div className="illus-bubble illus-bubble-3">
          <div className="illus-bubble-dot"></div>
          <div className="illus-bubble-dot"></div>
          <div className="illus-bubble-dot"></div>
        </div>
        <div className="illus-bubble illus-bubble-4">What's up? 🎉</div>
        <div className="illus-bubble illus-bubble-5">Let's chat on Nexio! 💬</div>
      </div>
    </div>
  );

  return (
    <div className="login-page">
      {/* ── Left Panel ────────────────────────────────────────── */}
      <div className="login-left-panel">
        <div className="login-left-content">
          {/* Logo */}
          <div className="login-logo">
            <div className="login-logo-icon">
              <svg width="42" height="42" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
                <circle cx="9" cy="10" r="1" fill="white" stroke="none"/>
                <circle cx="12" cy="10" r="1" fill="white" stroke="none"/>
                <circle cx="15" cy="10" r="1" fill="white" stroke="none"/>
              </svg>
            </div>
            <span className="login-logo-text">nexio</span>
          </div>

          <h1 className="login-headline">Connect with friends<br />and the world around you.</h1>
          <p className="login-subtext">
            Nexio makes it easy and fun to stay close to everything that matters — fast, free, and beautifully simple.
          </p>

          <ChatIllustration />
        </div>
      </div>

      {/* ── Right Panel ───────────────────────────────────────── */}
      <div className="login-right-panel">
        <div className={`login-card ${isLogin ? 'login-mode' : 'signup-mode'}`}>

          {/* ── Email Confirmation Card ──────────────────────── */}
          {pendingConfirmation ? (
            <>
              <div style={{ textAlign: 'center', padding: '16px 0' }}>
                <div style={{
                  width: 64, height: 64, margin: '0 auto 20px',
                  background: 'rgba(24,119,242,0.08)', borderRadius: '50%',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#1877F2" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="2" y="4" width="20" height="16" rx="2" />
                    <path d="M22 7l-10 7L2 7" />
                  </svg>
                </div>

                <h2 className="login-card-title" style={{ marginBottom: 8 }}>Check your email!</h2>
                <p className="login-card-subtitle" style={{ marginBottom: 16 }}>
                  We sent a confirmation link to:<br />
                  <strong style={{ color: '#1877F2', fontSize: 16 }}>{email}</strong>
                </p>
                <p style={{ fontSize: 14, color: '#65676B', lineHeight: 1.6, margin: '0 0 24px' }}>
                  Click the link in the email to activate your account.<br />
                  It may take a moment to arrive — check your spam folder too.
                </p>

                {/* Status Messages */}
                {error && (
                  <div className="login-alert login-alert-error" style={{ marginBottom: 16 }}>
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor"><path d="M8 1a7 7 0 100 14A7 7 0 008 1zm-.75 3.75a.75.75 0 011.5 0v3.5a.75.75 0 01-1.5 0v-3.5zM8 11a1 1 0 100 2 1 1 0 000-2z"/></svg>
                    {error}
                  </div>
                )}
                {success && (
                  <div className="login-alert login-alert-success" style={{ marginBottom: 16 }}>
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor"><path d="M8 1a7 7 0 100 14A7 7 0 008 1zm3.22 5.28a.75.75 0 00-1.06-1.06L7 8.38 5.84 7.22a.75.75 0 00-1.06 1.06l1.75 1.75a.75.75 0 001.06 0l3.63-3.75z"/></svg>
                    {success}
                  </div>
                )}

                <button
                  type="button"
                  onClick={handleResendConfirmation}
                  disabled={resendCooldown > 0}
                  className="login-btn-primary"
                  style={{
                    width: '100%', marginBottom: 12,
                    opacity: resendCooldown > 0 ? 0.6 : 1,
                    cursor: resendCooldown > 0 ? 'not-allowed' : 'pointer',
                  }}
                >
                  {resendCooldown > 0
                    ? `Resend in ${resendCooldown}s`
                    : 'Resend Confirmation Email'}
                </button>

                <button
                  type="button"
                  onClick={toggleForm}
                  style={{
                    background: 'none', border: 'none', color: '#1877F2',
                    fontSize: 14, fontWeight: 600, cursor: 'pointer',
                    fontFamily: "'Segoe UI', sans-serif",
                  }}
                >
                  ← Back to Sign In
                </button>
              </div>
            </>
          ) : (
          <>
          <h2 className="login-card-title">
            {isLogin ? 'Log in to Nexio' : 'Create your account'}
          </h2>
          <p className="login-card-subtitle">
            {isLogin ? 'Welcome back! Enter your details.' : 'Join millions of people on Nexio.'}
          </p>

          {/* Error / Success messages */}
          {error && (
            <div className="login-alert login-alert-error">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor"><path d="M8 1a7 7 0 100 14A7 7 0 008 1zm-.75 3.75a.75.75 0 011.5 0v3.5a.75.75 0 01-1.5 0v-3.5zM8 11a1 1 0 100 2 1 1 0 000-2z"/></svg>
              {error}
            </div>
          )}
          {success && (
            <div className="login-alert login-alert-success">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor"><path d="M8 1a7 7 0 100 14A7 7 0 008 1zm3.22 5.28a.75.75 0 00-1.06-1.06L7 8.38 5.84 7.22a.75.75 0 00-1.06 1.06l1.75 1.75a.75.75 0 001.06 0l3.63-3.75z"/></svg>
              {success}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleEmailAuth} autoComplete="on">
            {/* Signup: Display Name */}
            {!isLogin && (
              <div className="login-field">
                <input
                  id="displayName"
                  type="text"
                  className="login-input"
                  placeholder=" "
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  maxLength={50}
                />
                <label htmlFor="displayName" className="login-input-label">Display Name</label>
              </div>
            )}

            {/* Email */}
            <div className="login-field">
              <input
                id="email"
                type="email"
                className={`login-input ${emailError ? 'input-error' : ''}`}
                placeholder=" "
                value={email}
                onChange={(e) => { setEmail(e.target.value); validateEmail(e.target.value); }}
                required
                autoComplete="email"
              />
              <label htmlFor="email" className="login-input-label">Email address</label>
              {emailError && <span className="login-field-error">{emailError}</span>}
            </div>

            {/* Password */}
            <div className="login-field">
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                className={`login-input ${passwordError ? 'input-error' : ''}`}
                placeholder=" "
                value={password}
                onChange={(e) => { setPassword(e.target.value); validatePassword(e.target.value); }}
                required
                autoComplete={isLogin ? 'current-password' : 'new-password'}
              />
              <label htmlFor="password" className="login-input-label">Password</label>
              <button
                type="button"
                className="login-eye-btn"
                onClick={() => setShowPassword(!showPassword)}
                tabIndex={-1}
                aria-label="Toggle password visibility"
              >
                {showPassword ? (
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
                ) : (
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                )}
              </button>
              {passwordError && <span className="login-field-error">{passwordError}</span>}
            </div>

            {/* Signup: Confirm Password */}
            {!isLogin && (
              <div className="login-field">
                <input
                  id="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  className="login-input"
                  placeholder=" "
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  autoComplete="new-password"
                />
                <label htmlFor="confirmPassword" className="login-input-label">Confirm Password</label>
                <button
                  type="button"
                  className="login-eye-btn"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  tabIndex={-1}
                  aria-label="Toggle confirm password visibility"
                >
                  {showConfirmPassword ? (
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
                  ) : (
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                  )}
                </button>
              </div>
            )}

            {/* Forgot password (login only) */}
            {isLogin && (
              <div className="login-forgot">
                <a href="#forgot" onClick={(e) => e.preventDefault()}>Forgot password?</a>
              </div>
            )}

            {/* Submit button */}
            <button type="submit" className="login-submit-btn" disabled={loading}>
              {loading ? (
                <span className="login-spinner" />
              ) : (
                isLogin ? 'Log In' : 'Create Account'
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="login-divider">
            <div className="login-divider-line" />
            <span>OR</span>
            <div className="login-divider-line" />
          </div>

          {/* GitHub OAuth */}
          <button
            onClick={() => handleOAuthLogin('github')}
            className="login-github-btn"
            disabled={loading}
          >
            <svg width="20" height="20" viewBox="0 0 16 16" fill="currentColor">
              <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z"/>
            </svg>
            Continue with GitHub
          </button>

          {/* Toggle */}
          <div className="login-toggle">
            {isLogin ? "Don't have an account?" : 'Already have an account?'}
            <span className="login-toggle-link" onClick={toggleForm}>
              {isLogin ? ' Sign Up' : ' Log In'}
            </span>
          </div>
          </>
          )}
        </div>

        {/* Footer */}
        <div className="login-footer">
          <Link to="/privacy">Privacy Policy</Link>
          <span>·</span>
          <Link to="/terms">Terms of Service</Link>
          <span>·</span>
          <Link to="/help">Help</Link>
        </div>
      </div>
    </div>
  );
};

export default LoginForm;
