import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';

/**
 * LoginForm — Split-layout login: left branding panel + right form card.
 */
const LoginForm = () => {
  const navigate = useNavigate();

  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleEmailAuth = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!email || !password) {
      setError('Please fill in all fields');
      return;
    }

    if (isSignUp && password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setLoading(true);

    try {
      if (isSignUp) {
        const { data, error: signUpError } = await supabase.auth.signUp({
          email,
          password,
          options: { emailRedirectTo: `${window.location.origin}/auth/callback` },
        });

        if (signUpError) throw signUpError;
        if (data.user && !data.user.email_confirmed_at) {
          setSuccess('Check your email for a confirmation link!');
        } else {
          navigate('/profile-setup');
        }
      } else {
        const { error: signInError } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (signInError) throw signInError;
      }
    } catch (err) {
      setError(err.message || 'Authentication failed');
    }
    setLoading(false);
  };

  const handleGithubLogin = async () => {
    setError('');
    setLoading(true);
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'github',
        options: { redirectTo: `${window.location.origin}/auth/callback` },
      });
      if (error) throw error;
    } catch (err) {
      setError(err.message || 'GitHub login failed');
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      {/* ── Left: Branding Panel ── */}
      <div className="login-branding">
        <div className="login-branding-content">
          <div className="login-brand-logo">
            <div className="login-brand-icon">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
                <rect x="2" y="4" width="20" height="14" rx="4" stroke="currentColor" strokeWidth="2"/>
                <path d="M8 11h2M14 11h2M10 11h4" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                <path d="M6 18l-2 3v-3" stroke="currentColor" strokeWidth="2" strokeLinejoin="round"/>
              </svg>
            </div>
            <span className="login-brand-name">nexio</span>
          </div>

          <h1 className="login-brand-headline">
            Connect with friends<br />
            and the world around you.
          </h1>

          <p className="login-brand-desc">
            Nexio makes it easy and fun to stay close to everything
            that matters — fast, free, and beautifully simple.
          </p>

          {/* Animated chat bubbles */}
          <div className="login-chat-bubbles">
            <div className="login-bubble login-bubble-left login-bubble-1">
              <span className="login-bubble-dots">
                <span /><span /><span />
              </span>
            </div>
            <div className="login-bubble login-bubble-right login-bubble-2">
              Hey! 👋
            </div>
            <div className="login-bubble login-bubble-left login-bubble-3">
              <span className="login-bubble-dots">
                <span /><span /><span />
              </span>
            </div>
            <div className="login-bubble login-bubble-right login-bubble-4">
              What's up? 🎉
            </div>
            <div className="login-bubble login-bubble-left login-bubble-5">
              Let's chat on Nexio 😊
            </div>
          </div>
        </div>
      </div>

      {/* ── Right: Form Card ── */}
      <div className="login-form-side">
        <div className="login-card">
          <h2 className="login-card-title">
            {isSignUp ? 'Create your account' : 'Log in to Nexio'}
          </h2>
          <p className="login-card-subtitle">
            {isSignUp ? 'Get started with your free account.' : 'Welcome back! Enter your details.'}
          </p>

          {error && <div className="login-error">{error}</div>}
          {success && (
            <div className="login-error login-success">
              {success}
            </div>
          )}

          <form onSubmit={handleEmailAuth}>
            <div className="login-field">
              <input
                className="login-input"
                type="email"
                placeholder="Email address"
                value={email}
                onChange={e => setEmail(e.target.value)}
                autoComplete="email"
                aria-label="Email address"
              />
            </div>

            <div className="login-field login-field-password">
              <input
                className="login-input"
                type={showPassword ? 'text' : 'password'}
                placeholder="Password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                autoComplete={isSignUp ? 'new-password' : 'current-password'}
                aria-label="Password"
              />
              <button
                type="button"
                className="login-eye-btn"
                onClick={() => setShowPassword(!showPassword)}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
                tabIndex={-1}
              >
                {showPassword ? (
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94"/>
                    <path d="M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19"/>
                    <line x1="1" y1="1" x2="23" y2="23"/>
                  </svg>
                ) : (
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                    <circle cx="12" cy="12" r="3"/>
                  </svg>
                )}
              </button>
            </div>

            {isSignUp && (
              <div className="login-field">
                <input
                  className="login-input"
                  type="password"
                  placeholder="Confirm password"
                  value={confirmPassword}
                  onChange={e => setConfirmPassword(e.target.value)}
                  autoComplete="new-password"
                  aria-label="Confirm password"
                />
              </div>
            )}

            {!isSignUp && (
              <div className="login-forgot-row">
                <span className="login-forgot-link">Forgot password?</span>
              </div>
            )}

            <button
              className="login-btn login-btn-primary"
              type="submit"
              disabled={loading}
            >
              {loading ? <div className="btn-spinner" /> : isSignUp ? 'Create Account' : 'Log In'}
            </button>
          </form>

          <div className="login-divider"><span>OR</span></div>

          <button
            className="login-btn login-btn-social"
            onClick={handleGithubLogin}
            disabled={loading}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/>
            </svg>
            Continue with GitHub
          </button>

          <p className="login-footer">
            {isSignUp ? (
              <>Already have an account? <span onClick={() => { setIsSignUp(false); setError(''); setSuccess(''); }}>Sign In</span></>
            ) : (
              <>Don't have an account? <span onClick={() => { setIsSignUp(true); setError(''); setSuccess(''); }}>Sign Up</span></>
            )}
          </p>

          <div className="login-legal">
            <Link to="/privacy">Privacy Policy</Link>
            <Link to="/terms">Terms of Service</Link>
            <Link to="/help">Help</Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginForm;
