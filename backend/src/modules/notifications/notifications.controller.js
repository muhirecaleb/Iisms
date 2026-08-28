const notificationService = require('./notifications.service');

exports.list = async (req, res, next) => {
  try {
    const result = await notificationService.list({ userId: req.user.id, ...req.query });
    res.json({ success: true, ...result });
  } catch (error) {
    next(error);
  }
};

exports.getUnreadCount = async (req, res, next) => {
  try {
    const count = await notificationService.getUnreadCount(req.user.id, req.query.moduleKey);
    res.json({ success: true, data: { count } });
  } catch (error) {
    next(error);
  }
};

exports.markAsRead = async (req, res, next) => {
  try {
    const success = await notificationService.markAsRead(req.params.id, req.user.id);
    if (!success) {
      return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Notification not found' } });
    }
    res.json({ success: true, message: 'Notification marked as read' });
  } catch (error) {
    next(error);
  }
};

exports.markAllAsRead = async (req, res, next) => {
  try {
    const count = await notificationService.markAllAsRead(req.user.id);
    res.json({ success: true, data: { updated: count } });
  } catch (error) {
    next(error);
  }
};

exports.delete = async (req, res, next) => {
  try {
    const success = await notificationService.delete(req.params.id, req.user.id);
    if (!success) {
      return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Notification not found' } });
    }
    res.json({ success: true, message: 'Notification deleted' });
  } catch (error) {
    next(error);
  }
};

exports.getStream = async (req, res) => {
  // SSE endpoint: client connects, gets real-time notifications
  // req.user is set by authMiddleware; if SSE is accessed without auth middleware
  // (because EventSource can't send headers), we parse the token from query.
  let userId = req.user?.id;

  if (!userId) {
    // Try to authenticate from query param (for EventSource which can't send headers)
    const jwt = require('jsonwebtoken');
    const env = require('../../config/environment');
    const token = req.query?.token;
    if (token) {
      try {
        const decoded = jwt.verify(token, env.jwt.accessSecret);
        userId = decoded.sub;
      } catch {
        // Invalid token - still allow connection but user won't get anything
        userId = null;
      }
    }
  }

  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    Connection: 'keep-alive',
    'X-Accel-Buffering': 'no',
  });

  res.write('data: {"type":"connected"}\n\n');

  if (!userId) {
    // Send error and close
    res.write('data: {"type":"error","message":"Not authenticated"}\n\n');
    res.end();
    return;
  }

  // Store the connection
  const clientId = userId;
  if (!global._sseClients) global._sseClients = {};
  if (!global._sseClients[clientId]) global._sseClients[clientId] = new Set();
  global._sseClients[clientId].add(res);

  // Send unread count on connect
  const count = await notificationService.getUnreadCount(clientId);
  res.write(`data: ${JSON.stringify({ type: 'unread_count', count })}\n\n`);

  // Heartbeat to keep connection alive
  const heartbeat = setInterval(() => {
    res.write(': heartbeat\n\n');
  }, 30000);

  req.on('close', () => {
    clearInterval(heartbeat);
    if (global._sseClients[clientId]) {
      global._sseClients[clientId].delete(res);
      if (global._sseClients[clientId].size === 0) {
        delete global._sseClients[clientId];
      }
    }
  });
};

/**
 * Helper: push a notification event to a connected SSE client.
 * Called internally by the NotificationService helper.
 */
exports.pushToUser = async (userId, notification) => {
  const clients = global._sseClients?.[userId];
  if (clients && clients.size > 0) {
    const payload = JSON.stringify(notification);
    for (const client of clients) {
      try {
        client.write(`data: ${payload}\n\n`);
      } catch {
        // Dead connection, will be cleaned up on close
      }
    }
  }
};

/**
 * Helper: push unread count update to a user's SSE connections.
 */
exports.pushUnreadCount = async (userId) => {
  const clients = global._sseClients?.[userId];
  if (clients && clients.size > 0) {
    const count = await notificationService.getUnreadCount(userId);
    const payload = JSON.stringify({ type: 'unread_count', count });
    for (const client of clients) {
      try {
        client.write(`data: ${payload}\n\n`);
      } catch {
        // Dead connection
      }
    }
  }
};
