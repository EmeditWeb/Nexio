import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import './InfoPages.css';

/**
 * AuthCallback — handles Supabase email confirmation redirects.
 *
 * When a user clicks a confirmation/magic/reset link in their email,
 * Supabase redirects to /auth/callback with token params in the URL hash.
 * This component exchanges those tokens for a session.
 */
const AuthCallback = () => {
  const navigate = useNavigate();
  const [status, setStatus] = useState('verifying'); // verifying | success | error
  const [errorMessage, setErrorMessage] = useState('');
  const [countdown, setCountdown] = useState(3);

  useEffect(() => {
    const handleCallback = async () => {
      try {
        // Supabase JS client auto-detects the hash params and exchanges them
        const { data, error } = await supabase.auth.getSession();

        if (error) {
          throw error;
        }

        if (data.session) {
          setStatus('success');
        } else {
          // If no session yet, listen for auth state change
          const { data: listener } = supabase.auth.onAuthStateChange(
            (event, session) => {
              if (event === 'SIGNED_IN' && session) {
                setStatus('success');
                listener.subscription.unsubscribe();
              } else if (event === 'TOKEN_REFRESHED') {
                setStatus('success');
                listener.subscription.unsubscribe();
              }
            }
          );

          // Timeout: if nothing happens after 5 seconds, show error
          setTimeout(() => {
            setStatus((prev) => {
              if (prev === 'verifying') {
                listener.subscription.unsubscribe();
                return 'error';
              }
              return prev;
            });
            setErrorMessage(
              'The confirmation link may have expired or already been used. Please try again.'
            );
          }, 5000);
        }
      } catch (err) {
        console.error('Auth callback error:', err);
        setStatus('error');

        // Parse common errors
        if (err.message?.includes('expired')) {
          setErrorMessage(
            'This confirmation link has expired. Please request a new one from the login page.'
          );
        } else if (err.message?.includes('already')) {
          setErrorMessage(
            'This email has already been confirmed. You can log in normally.'
          );
        } else {
          setErrorMessage(
            err.message || 'Something went wrong. Please try again or request a new link.'
          );
        }
      }
    };

    handleCallback();
  }, []);

  // Countdown redirect on success
  useEffect(() => {
    if (status !== 'success') return;

    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          navigate('/');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [status, navigate]);

  return (
    <div className="info-page" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{
        maxWidth: 480,
        width: '100%',
        margin: '0 24px',
        background: '#FFFFFF',
        borderRadius: 16,
        padding: '48px 32px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
        textAlign: 'center',
        animation: 'infoFadeIn 0.4s ease-out',
      }}>
        {/* ── Verifying ──────────────────────────────────── */}
        {status === 'verifying' && (
          <>
            <div style={{
              width: 56,
              height: 56,
              margin: '0 auto 24px',
              border: '4px solid #E4E6EB',
              borderTopColor: '#1877F2',
              borderRadius: '50%',
              animation: 'spin 0.8s linear infinite',
            }} />
            <h2 style={{ fontSize: 22, fontWeight: 700, color: '#1C1E21', margin: '0 0 8px' }}>
              Verifying your email...
            </h2>
            <p style={{ fontSize: 15, color: '#65676B', margin: 0, lineHeight: 1.6 }}>
              Please wait while we confirm your account.
            </p>
          </>
        )}

        {/* ── Success ────────────────────────────────────── */}
        {status === 'success' && (
          <>
            <div style={{
              width: 64,
              height: 64,
              margin: '0 auto 24px',
              background: '#E8F5E9',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}>
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#2E7D32" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20 6L9 17l-5-5" />
              </svg>
            </div>
            <h2 style={{ fontSize: 22, fontWeight: 700, color: '#1C1E21', margin: '0 0 8px' }}>
              Email verified! 🎉
            </h2>
            <p style={{ fontSize: 15, color: '#65676B', margin: '0 0 24px', lineHeight: 1.6 }}>
              Welcome to Nexio! Your account is ready. Redirecting you in <strong style={{ color: '#1877F2' }}>{countdown}</strong> seconds...
            </p>
            <button
              onClick={() => navigate('/')}
              style={{
                padding: '12px 32px',
                background: '#1877F2',
                color: '#FFFFFF',
                border: 'none',
                borderRadius: 10,
                fontSize: 15,
                fontWeight: 700,
                cursor: 'pointer',
                fontFamily: "'Segoe UI', sans-serif",
              }}
            >
              Go to Nexio Now
            </button>
          </>
        )}

        {/* ── Error ──────────────────────────────────────── */}
        {status === 'error' && (
          <>
            <div style={{
              width: 64,
              height: 64,
              margin: '0 auto 24px',
              background: '#FFF3E0',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}>
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#E65100" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="8" x2="12" y2="12" />
                <line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
            </div>
            <h2 style={{ fontSize: 22, fontWeight: 700, color: '#1C1E21', margin: '0 0 8px' }}>
              Verification failed
            </h2>
            <p style={{ fontSize: 15, color: '#65676B', margin: '0 0 24px', lineHeight: 1.6 }}>
              {errorMessage}
            </p>
            <button
              onClick={() => navigate('/login')}
              style={{
                padding: '12px 32px',
                background: '#1877F2',
                color: '#FFFFFF',
                border: 'none',
                borderRadius: 10,
                fontSize: 15,
                fontWeight: 700,
                cursor: 'pointer',
                fontFamily: "'Segoe UI', sans-serif",
              }}
            >
              Back to Login
            </button>
          </>
        )}
      </div>

      {/* Spinner keyframe (inline since it's small) */}
      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default AuthCallback;
