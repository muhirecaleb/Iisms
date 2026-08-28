import api from './api';

/**
 * Fetch notifications list for the current user.
 */
export const listNotifications = ({ page = 1, limit = 20, isRead, type } = {}) => {
  const params = { page, limit };
  if (isRead !== undefined) params.isRead = isRead;
  if (type) params.type = type;
  return api.get('/notifications', { params }).then((r) => r.data);
};

/**
 * Get unread notification count.
 */
export const getUnreadCount = (moduleKey) => {
  const params = moduleKey ? { moduleKey } : {};
  return api.get('/notifications/unread-count', { params }).then((r) => r.data.data.count);
};

/**
 * Mark a single notification as read.
 */
export const markAsRead = (notificationId) =>
  api.put(`/notifications/${notificationId}/read`).then((r) => r.data);

/**
 * Mark all notifications as read.
 */
export const markAllAsRead = () =>
  api.put('/notifications/read-all').then((r) => r.data);

/**
 * Delete a single notification.
 */
export const deleteNotification = (notificationId) =>
  api.delete(`/notifications/${notificationId}`).then((r) => r.data);

/**
 * Create an SSE connection for real-time notifications.
 * Returns the EventSource instance and a cleanup function.
 *
 * Callback receives: { type: 'unread_count', count } or { type, title, message, ... }
 */
export const subscribeToNotifications = (onNotification) => {
  // Use the base URL + stream endpoint, with credentials for auth cookie
  const baseUrl = api.defaults.baseURL || '';
  const token = localStorage.getItem('accessToken');

  // SSE doesn't support custom headers natively, so we pass token as query param
  // The backend should accept it. Alternatively, use fetch with ReadableStream.
  const url = `${baseUrl}/notifications/stream?token=${encodeURIComponent(token || '')}`;

  const eventSource = new EventSource(url);

  eventSource.onmessage = (event) => {
    try {
      const data = JSON.parse(event.data);
      if (onNotification) onNotification(data);
    } catch {
      // Ignore parse errors (heartbeat lines etc.)
    }
  };

  eventSource.onerror = () => {
    // Reconnect will happen automatically, but we can log
    console.warn('SSE connection error, will retry...');
  };

  return {
    eventSource,
    unsubscribe: () => {
      eventSource.close();
    },
  };
};
