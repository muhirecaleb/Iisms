import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';

const OTP_LENGTH = 6;
const RESEND_COOLDOWN = 30;
const OTP_EXPIRY_SECONDS = 600; // 10 minutes

export default function VerifyOTPPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { sendOtpCode, verifyOtpCode, user, isAuthenticated } = useAuth();

  const userId = location.state?.userId;

  const [otp, setOtp] = useState(Array(OTP_LENGTH).fill(''));
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');
  const [initialSending, setInitialSending] = useState(true);
  const [maskedEmail, setMaskedEmail] = useState('');
  const [devCode, setDevCode] = useState('');
  const [cooldown, setCooldown] = useState(0);
  const [expiryCountdown, setExpiryCountdown] = useState(OTP_EXPIRY_SECONDS);
  const inputRefs = useRef([]);
  const otpSentRef = useRef(false);

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/', { replace: true });
    }
  }, [isAuthenticated, navigate]);

  // Redirect if no userId (direct access without login)
  useEffect(() => {
    if (!userId) {
      navigate('/login', { replace: true });
    }
  }, [userId, navigate]);

  // Send OTP on mount (guarded against StrictMode double-invoke)
  useEffect(() => {
    if (!userId) return;
    if (otpSentRef.current) return;
    otpSentRef.current = true;
    handleSendOtp();
  }, [userId]);

  // Cooldown timer for resend button
  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setInterval(() => setCooldown((c) => c - 1), 1000);
    return () => clearInterval(timer);
  }, [cooldown]);

  // Expiry countdown timer
  useEffect(() => {
    if (expiryCountdown <= 0) return;
    const timer = setInterval(() => setExpiryCountdown((c) => c - 1), 1000);
    return () => clearInterval(timer);
  }, [expiryCountdown]);

  // Auto-focus first input on mount
  useEffect(() => {
    inputRefs.current[0]?.focus();
  }, []);

  const handleSendOtp = useCallback(async () => {
    if (!userId) return;
    setSending(true);
    setError('');
    try {
      const data = await sendOtpCode(userId);
      setMaskedEmail(data.maskedEmail || 'your registered email');
      if (data.devMode && data.devCode) {
        setDevCode(data.devCode);
        toast.success(`Dev Mode OTP: ${data.devCode}`, { duration: 8000 });
      }
      setCooldown(RESEND_COOLDOWN);
      setExpiryCountdown(OTP_EXPIRY_SECONDS);
      toast.success('Verification code sent!');
    } catch (err) {
      const msg = err.response?.data?.error?.message || 'Failed to send verification code';
      setError(msg);
      toast.error(msg);
    } finally {
      setSending(false);
      setInitialSending(false);
    }
  }, [userId, sendOtpCode]);

  const handleChange = (index, value) => {
    // Only allow digits
    if (value && !/^\d+$/.test(value)) return;

    const newOtp = [...otp];
    // Handle paste (multiple digits)
    if (value.length > 1) {
      const digits = value.slice(0, OTP_LENGTH).split('');
      for (let i = index; i < OTP_LENGTH && i - index < digits.length; i++) {
        newOtp[i] = digits[i - index];
      }
      setOtp(newOtp);
      // Focus next empty or last filled
      const nextEmpty = newOtp.findIndex((d) => !d);
      const focusIdx = nextEmpty === -1 ? OTP_LENGTH - 1 : nextEmpty;
      inputRefs.current[focusIdx]?.focus();
      return;
    }

    // Single digit
    newOtp[index] = value.slice(-1);
    setOtp(newOtp);

    // Auto-advance to next input
    if (value && index < OTP_LENGTH - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index, e) => {
    // Backspace to go back
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
    // Arrow keys
    if (e.key === 'ArrowLeft' && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
    if (e.key === 'ArrowRight' && index < OTP_LENGTH - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '');
    if (!pasted) return;
    const digits = pasted.slice(0, OTP_LENGTH).split('');
    const newOtp = [...otp];
    for (let i = 0; i < digits.length; i++) {
      newOtp[i] = digits[i];
    }
    setOtp(newOtp);
    const nextEmpty = newOtp.findIndex((d) => !d);
    const focusIdx = nextEmpty === -1 ? OTP_LENGTH - 1 : nextEmpty;
    inputRefs.current[focusIdx]?.focus();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const code = otp.join('');
    if (code.length !== OTP_LENGTH) {
      setError('Please enter the complete 6-digit verification code.');
      return;
    }

    setLoading(true);
    setError('');
    try {
      await verifyOtpCode(userId, code);
      toast.success('Login successful!');
      navigate('/', { replace: true });
    } catch (err) {
      const msg = err.response?.data?.error?.message || 'Invalid or expired verification code';
      setError(msg);
      toast.error(msg);
      // Clear inputs on error
      setOtp(Array(OTP_LENGTH).fill(''));
      inputRefs.current[0]?.focus();
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  if (!userId) return null;

  // Show loading skeleton while initial OTP is being sent
  if (initialSending) {
    return (
      <div style={styles.wrapper}>
        <div style={styles.card}>
          <div style={styles.header}>
            <div style={{
              width: 56,
              height: 56,
              borderRadius: 'var(--radius-md)',
              background: 'var(--color-border)',
              margin: '0 auto 20px',
              animation: 'pulse 1.5s ease-in-out infinite',
            }} />
            <div style={{
              width: 200,
              height: 24,
              background: 'var(--color-border)',
              borderRadius: 4,
              margin: '0 auto 12px',
              animation: 'pulse 1.5s ease-in-out infinite',
            }} />
            <div style={{
              width: 280,
              height: 16,
              background: 'var(--color-border-light)',
              borderRadius: 4,
              margin: '0 auto',
              animation: 'pulse 1.5s ease-in-out infinite',
            }} />
          </div>
          <div style={{
            display: 'flex',
            gap: 10,
            justifyContent: 'center',
            marginBottom: 24,
          }}>
            {Array(6).fill(0).map((_, i) => (
              <div key={i} style={{
                width: 52,
                height: 58,
                borderRadius: 'var(--radius-sm)',
                background: 'var(--color-border)',
                animation: 'pulse 1.5s ease-in-out infinite',
                animationDelay: `${i * 0.1}s`,
              }} />
            ))}
          </div>
          <div style={{
            width: '100%',
            height: 48,
            borderRadius: 'var(--radius-sm)',
            background: 'var(--color-border)',
            animation: 'pulse 1.5s ease-in-out infinite',
          }} />
        </div>
        <style>{`
          @keyframes pulse {
            0%, 100% { opacity: 1; }
            50% { opacity: 0.5; }
          }
        `}</style>
      </div>
    );
  }

  return (
    <div style={styles.wrapper}>
      <div style={styles.card}>
        {/* Header */}
        <div style={styles.header}>
          <div style={styles.iconWrapper}>
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="2" y="2" width="20" height="16" rx="2" ry="2" /><path d="M22 6l-10 7L2 6" />
            </svg>
          </div>
          <h2 style={styles.title}>Check Your Email</h2>
          <p style={styles.subtitle}>
            We sent a verification code to <strong>{maskedEmail}</strong>
          </p>
        </div>

        {/* Dev Mode Badge */}
        {devCode && (
          <div style={styles.devBadge}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
            </svg>
            <span>Dev Mode — Use code: <strong>{devCode}</strong></span>
          </div>
        )}

        {/* Error */}
        {error && (
          <div style={styles.errorBox}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
            <span>{error}</span>
          </div>
        )}

        {/* OTP Input */}
        <form onSubmit={handleSubmit}>
          <div style={styles.otpContainer}>
            {otp.map((digit, index) => (
              <input
                key={index}
                ref={(el) => (inputRefs.current[index] = el)}
                type="text"
                inputMode="numeric"
                autoComplete="one-time-code"
                maxLength={index === 0 ? OTP_LENGTH : 1}
                value={digit}
                onChange={(e) => handleChange(index, e.target.value)}
                onKeyDown={(e) => handleKeyDown(index, e)}
                onPaste={handlePaste}
                style={{
                  ...styles.otpInput,
                  borderColor: digit ? 'var(--color-primary)' : 'var(--color-border)',
                  boxShadow: digit ? '0 0 0 3px rgba(26, 86, 219, 0.15)' : 'none',
                }}
                aria-label={`Digit ${index + 1}`}
              />
            ))}
          </div>

          <button
            type="submit"
            disabled={loading || otp.join('').length !== OTP_LENGTH}
            style={{
              ...styles.submitBtn,
              opacity: loading || otp.join('').length !== OTP_LENGTH ? 0.6 : 1,
            }}
          >
            {loading ? (
              <span style={styles.loadingSpinner}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ animation: 'spin 0.8s linear infinite' }}>
                  <path d="M21 12a9 9 0 1 1-6.219-8.56" />
                </svg>
                Verifying...
              </span>
            ) : (
              'Verify & Sign In'
            )}
          </button>
        </form>

        {/* Resend & Timer */}
        <div style={styles.footer}>
          <button
            type="button"
            onClick={handleSendOtp}
            disabled={sending || cooldown > 0}
            style={{
              ...styles.resendBtn,
              opacity: sending || cooldown > 0 ? 0.5 : 1,
            }}
          >
            {sending ? 'Sending...' : cooldown > 0 ? `Resend in ${cooldown}s` : 'Resend Code'}
          </button>

          <div style={styles.timer}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
            </svg>
            <span>{formatTime(expiryCountdown)}</span>
          </div>
        </div>

        {/* Back to Login */}
        <button
          type="button"
          onClick={() => navigate('/login')}
          style={styles.backBtn}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M19 12H5M12 19l-7-7 7-7" />
          </svg>
          Back to Login
        </button>
      </div>

      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}

const styles = {
  wrapper: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '100vh',
    background: 'linear-gradient(135deg, #F8FAFC 0%, #E2E8F0 100%)',
    padding: 20,
  },
  card: {
    width: '100%',
    maxWidth: 440,
    background: '#fff',
    borderRadius: 'var(--radius-lg)',
    boxShadow: '0 20px 60px rgba(0, 0, 0, 0.08), 0 10px 24px rgba(0, 0, 0, 0.06)',
    padding: '40px 36px',
  },
  header: {
    textAlign: 'center',
    marginBottom: 28,
  },
  iconWrapper: {
    width: 56,
    height: 56,
    borderRadius: 'var(--radius-md)',
    background: 'linear-gradient(135deg, var(--color-primary) 0%, var(--color-primary-light) 100%)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    margin: '0 auto 20px',
    boxShadow: '0 4px 12px rgba(26, 86, 219, 0.25)',
  },
  title: {
    fontSize: '1.5rem',
    fontWeight: 700,
    color: 'var(--color-text-heading)',
    margin: '0 0 8px',
  },
  subtitle: {
    fontSize: '0.9rem',
    color: 'var(--color-text)',
    margin: 0,
    lineHeight: 1.5,
  },
  devBadge: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    padding: '10px 16px',
    background: 'rgba(37, 99, 235, 0.08)',
    border: '1px solid rgba(37, 99, 235, 0.2)',
    borderRadius: 'var(--radius-sm)',
    color: 'var(--color-info)',
    fontSize: '0.85rem',
    fontWeight: 500,
    marginBottom: 16,
  },
  errorBox: {
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
    marginBottom: 16,
  },
  otpContainer: {
    display: 'flex',
    gap: 10,
    justifyContent: 'center',
    marginBottom: 24,
  },
  otpInput: {
    width: 52,
    height: 58,
    textAlign: 'center',
    fontSize: '1.5rem',
    fontWeight: 700,
    fontFamily: 'var(--font-family)',
    border: '1.5px solid var(--color-border)',
    borderRadius: 'var(--radius-sm)',
    background: '#fff',
    color: 'var(--color-text-heading)',
    outline: 'none',
    transition: 'all 0.2s ease',
    caretColor: 'var(--color-primary)',
    padding: 0,
    minHeight: 58,
  },
  submitBtn: {
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
    transition: 'all 0.3s ease',
    boxShadow: '0 4px 14px rgba(26, 86, 219, 0.3)',
  },
  loadingSpinner: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
  },
  footer: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 20,
    paddingTop: 20,
    borderTop: '1px solid var(--color-border-light)',
  },
  resendBtn: {
    background: 'none',
    border: 'none',
    color: 'var(--color-secondary)',
    fontSize: '0.875rem',
    fontWeight: 600,
    cursor: 'pointer',
    padding: '8px 0',
    minHeight: 'auto',
    transition: 'color 0.2s ease',
  },
  timer: {
    display: 'flex',
    alignItems: 'center',
    gap: 6,
    fontSize: '0.85rem',
    color: 'var(--color-text-light)',
    fontWeight: 500,
  },
  backBtn: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    width: '100%',
    marginTop: 16,
    background: 'none',
    border: 'none',
    color: 'var(--color-text-light)',
    fontSize: '0.875rem',
    cursor: 'pointer',
    padding: '8px 0',
    minHeight: 'auto',
    transition: 'color 0.2s ease',
  },
};
