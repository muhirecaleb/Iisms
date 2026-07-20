import api from './api';

/**
 * Authentication service.
 * All functions return the parsed `data` field from the API response
 * (i.e., `response.data.data`) or throw the error object.
 */

/**
 * Step 1: Authenticate with username and password.
 * @param {string} username
 * @param {string} password
 * @returns {Promise<{ user: Object, requiresOtp: boolean }>}
 */
export const login = async (username, password) => {
  const response = await api.post('/auth/login', { username, password });
  return response.data.data;
};

/**
 * Step 2: Request OTP code be sent to user's email.
 * @param {number} userId
 * @returns {Promise<{ maskedEmail: string, expiresIn: number, devMode: boolean, devCode?: string }>}
 */
export const sendOtp = async (userId) => {
  const response = await api.post('/auth/send-otp', { userId });
  return response.data.data;
};

/**
 * Step 3: Verify OTP code and receive JWT tokens.
 * @param {number} userId
 * @param {string} otpCode - 6-digit code
 * @returns {Promise<{ user: Object, accessToken: string, expiresIn: number }>}
 */
export const verifyOtp = async (userId, otpCode) => {
  const response = await api.post('/auth/verify-otp', { userId, otpCode });
  return response.data.data;
};

/**
 * Refresh the access token using the httpOnly cookie.
 * @returns {Promise<{ accessToken: string, expiresIn: number }>}
 */
export const refreshToken = async () => {
  const response = await api.post('/auth/refresh');
  return response.data.data;
};

/**
 * Logout — revoke the refresh token on the server.
 * @returns {Promise<void>}
 */
export const logout = async () => {
  await api.post('/auth/logout');
};

/**
 * Get the currently authenticated user's profile and permissions.
 * @returns {Promise<{ userId: number, username: string, fullName: string, email: string, role: string, permissions: string[], lastLogin: string }>}
 */
export const getMe = async () => {
  const response = await api.get('/auth/me');
  return response.data.data;
};

/**
 * Change the current user's password.
 * @param {string} currentPassword
 * @param {string} newPassword
 * @param {string} confirmPassword
 * @returns {Promise<{ message: string }>}
 */
export const changePassword = async (currentPassword, newPassword, confirmPassword) => {
  const response = await api.put('/auth/change-password', {
    currentPassword,
    newPassword,
    confirmPassword,
  });
  // Note: This endpoint returns { success, message } without a `data` wrapper
  return response.data;
};
