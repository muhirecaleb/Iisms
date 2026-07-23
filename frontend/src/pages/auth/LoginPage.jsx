import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';
import loginBgImg from '../../assets/login-img.jpg';

export default function LoginPage() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showBrand, setShowBrand] = useState(window.innerWidth >= 900);

  useEffect(() => {
    const mq = window.matchMedia('(min-width: 900px)');
    const handler = (e) => setShowBrand(e.matches);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!username.trim() || !password.trim()) {
      setError('Please enter both username and password.');
      return;
    }

    setLoading(true);
    try {
      const data = await login(username.trim(), password);
      navigate('/verify-otp', { state: { userId: data.user.userId } });
    } catch (err) {
      const msg = err.response?.data?.error?.message || 'Invalid username or password. Please try again.';
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      display: 'flex',
      minHeight: '100vh',
      background: 'var(--color-bg)',
    }}>
      {/* Branding Sidebar — full-bleed login image */}
      {showBrand && (
        <div style={{
          display: 'flex',
          position: 'relative',
          overflow: 'hidden',
          flex: '1 1 45%',
          backgroundImage: `url(${loginBgImg})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
        }}>
          {/* Semi-transparent overlay for readability */}
          <div style={{
            position: 'absolute',
            inset: 0,
            background: 'linear-gradient(135deg, rgba(10, 12, 27, 0.5) 0%, rgba(26, 86, 219, 0.25) 100%)',
          }} />

        </div>
      )}

      {/* Form Side */}
      <div style={{
        flex: '1 1 55%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 40,
      }}>
        <div style={{ width: '100%', maxWidth: 400 }}>
          <div style={{ marginBottom: 32, textAlign: 'center' }}>
            <h2 style={{
              fontSize: '1.75rem',
              fontWeight: 700,
              color: 'var(--color-text-heading)',
              margin: '0 0 8px',
            }}>Welcome Back</h2>
            <p style={{
              fontSize: '0.95rem',
              color: 'var(--color-text)',
              margin: 0,
            }}>Sign in to your account to continue</p>
          </div>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            {error && (
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                padding: '12px 16px',
                background: 'rgba(220, 38, 38, 0.08)',
                border: '1px solid rgba(220, 38, 38, 0.2)',
                borderRadius: 'var(--radius-sm)',
                color: 'var(--color-error)',
                fontSize: '0.875rem',
                fontWeight: 500,
              }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10" /><line x1="15" y1="9" x2="9" y2="15" /><line x1="9" y1="9" x2="15" y2="15" />
                </svg>
                <span>{error}</span>
              </div>
            )}

            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              <label htmlFor="username" style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--color-text-heading)' }}>Username</label>
              <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                <svg style={{ position: 'absolute', left: 14, color: 'var(--color-text-light)', pointerEvents: 'none' }} width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" />
                </svg>
                <input
                  id="username"
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Enter your username"
                  autoComplete="username"
                  autoFocus
                  style={{
                    width: '100%',
                    minHeight: 48,
                    padding: '10px 14px 10px 44px',
                    fontSize: '0.95rem',
                    border: '1.5px solid var(--color-border)',
                    borderRadius: 'var(--radius-sm)',
                    background: 'var(--color-bg-white)',
                    color: 'var(--color-text-heading)',
                    outline: 'none',
                  }}
                  onFocus={(e) => e.target.style.borderColor = 'var(--color-primary)'}
                  onBlur={(e) => e.target.style.borderColor = 'var(--color-border)'}
                />
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              <label htmlFor="password" style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--color-text-heading)' }}>Password</label>
              <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                <svg style={{ position: 'absolute', left: 14, color: 'var(--color-text-light)', pointerEvents: 'none' }} width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" />
                </svg>
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  autoComplete="current-password"
                  style={{
                    width: '100%',
                    minHeight: 48,
                    padding: '10px 44px 10px 44px',
                    fontSize: '0.95rem',
                    border: '1.5px solid var(--color-border)',
                    borderRadius: 'var(--radius-sm)',
                    background: 'var(--color-bg-white)',
                    color: 'var(--color-text-heading)',
                    outline: 'none',
                  }}
                  onFocus={(e) => e.target.style.borderColor = 'var(--color-primary)'}
                  onBlur={(e) => e.target.style.borderColor = 'var(--color-border)'}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{
                    position: 'absolute',
                    right: 10,
                    background: 'none',
                    border: 'none',
                    color: 'var(--color-text-light)',
                    cursor: 'pointer',
                    padding: 8,
                    display: 'flex',
                    minHeight: 'auto',
                  }}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? (
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" /><path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" /><line x1="1" y1="1" x2="23" y2="23" />
                    </svg>
                  ) : (
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              style={{
                width: '100%',
                minHeight: 48,
                padding: '12px 24px',
                fontSize: '1rem',
                fontWeight: 600,
                color: '#fff',
                background: 'linear-gradient(135deg, var(--color-primary) 0%, var(--color-primary-light) 100%)',
                border: 'none',
                borderRadius: 'var(--radius-sm)',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8,
                opacity: loading ? 0.7 : 1,
                boxShadow: '0 4px 14px rgba(26, 86, 219, 0.3)',
              }}
            >
              {loading ? (
                <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ animation: 'spin 0.8s linear infinite' }}>
                    <path d="M21 12a9 9 0 1 1-6.219-8.56" />
                  </svg>
                  Signing in...
                </span>
              ) : (
                <>
                  Sign In
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M5 12h14M12 5l7 7-7 7" />
                  </svg>
                </>
              )}
            </button>
          </form>

          <p style={{
            textAlign: 'center',
            marginTop: 40,
            fontSize: '0.8rem',
            color: 'var(--color-text-light)',
          }}>
            INTANGO Technical Secondary School &copy; {new Date().getFullYear()}
          </p>
        </div>
      </div>

      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
