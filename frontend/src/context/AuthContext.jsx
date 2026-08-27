import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { login as apiLogin, sendOtp, verifyOtp, logout as apiLogout, getMe } from '../services/auth.service';

const AuthContext = createContext(null);

/**
 * AuthProvider wraps the app and provides:
 * - user, loading, error state
 * - login(userId, password) → sends user for OTP verification
 * - sendOtpCode(userId) → triggers OTP email
 * - verifyOtpCode(userId, code) → finalizes auth
 * - logout() → clears session
 * - hasPermission(moduleKey) → checks RBAC
 * - isAuthenticated → boolean
 */
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true); // Initial session check
  const [error, setError] = useState(null);

  // ─── On mount: check for existing session ──────────────────
  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    if (!token) {
      setLoading(false);
      return;
    }

    getMe()
      .then((userData) => {
        setUser(userData);
      })
      .catch(() => {
        // Token invalid or expired — response interceptor handles redirect
        localStorage.removeItem('accessToken');
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  // ─── Step 1: Login ─────────────────────────────────────────
  const login = useCallback(async (username, password) => {
    setError(null);
    try {
      const data = await apiLogin(username, password);
      return data; // { user, requiresOtp }
    } catch (err) {
      const message = err.response?.data?.error?.message || 'Login failed';
      setError(message);
      throw err;
    }
  }, []);

  // ─── Step 2: Send OTP ──────────────────────────────────────
  const sendOtpCode = useCallback(async (userId) => {
    setError(null);
    try {
      const data = await sendOtp(userId);
      return data; // { maskedEmail, expiresIn, devMode, devCode }
    } catch (err) {
      const message = err.response?.data?.error?.message || 'Failed to send OTP';
      setError(message);
      throw err;
    }
  }, []);

  // ─── Step 3: Verify OTP ────────────────────────────────────
  const verifyOtpCode = useCallback(async (userId, code) => {
    setError(null);
    try {
      const data = await verifyOtp(userId, code);
      // Store access token in localStorage
      localStorage.setItem('accessToken', data.accessToken);
      setUser(data.user);
      return data;
    } catch (err) {
      const message = err.response?.data?.error?.message || 'Invalid verification code';
      setError(message);
      throw err;
    }
  }, []);

  // ─── Logout ────────────────────────────────────────────────
  const logout = useCallback(async () => {
    try {
      await apiLogout();
    } catch {
      // Even if server logout fails, clear local state
    } finally {
      localStorage.removeItem('accessToken');
      setUser(null);
      setError(null);
    }
  }, []);

  // ─── Permission check ─────────────────────────────────────
  const hasPermission = useCallback(
    (moduleKey) => {
      if (!user) return false;
      if (user.role === 'Administrator') return true; // Admin has all access
      return user.permissions?.includes(moduleKey) ?? false;
    },
    [user]
  );

  // CRUD-level permission check: canPerform('students', 'create')
  const canPerform = useCallback(
    (moduleKey, action) => {
      if (!user) return false;
      if (user.role === 'Administrator') return true; // Admin can do everything
      const perms = user.modulePermissions?.[moduleKey];
      if (!perms) return false;
      switch (action) {
        case 'view': return perms.canView;
        case 'create': return perms.canCreate;
        case 'edit': return perms.canEdit;
        case 'delete': return perms.canDelete;
        default: return false;
      }
    },
    [user]
  );

  const value = {
    user,
    loading,
    error,
    isAuthenticated: !!user,
    login,
    sendOtpCode,
    verifyOtpCode,
    logout,
    hasPermission,
    canPerform,
    clearError: () => setError(null),
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

/**
 * Hook to access auth context. Must be used within an AuthProvider.
 */
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export default AuthContext;
