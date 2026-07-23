const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');

const corsOptions = require('./config/cors');
const errorHandler = require('./middleware/errorHandler');
const routes = require('./routes');
const logger = require('./utils/logger');

const app = express();

// ─── Global Middleware ──────────────────────────────────
app.use(cors(corsOptions));
app.use(helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' },
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// HTTP request logging
app.use(morgan('short', {
  stream: { write: (msg) => logger.info(msg.trim()) },
}));

// Global rate limiting
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 1000,                 // 1000 requests per window
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    error: { code: 'RATE_LIMIT', message: 'Too many requests, please try again later' },
  },
});
app.use('/api/', globalLimiter);

// ─── Static Files ───────────────────────────────────────
app.use('/uploads', express.static('uploads'));

// ─── API Routes ─────────────────────────────────────────
app.use('/api/v1', routes);

// ─── 404 Handler ────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: { code: 'NOT_FOUND', message: `Route ${req.method} ${req.path} not found` },
  });
});

// ─── Global Error Handler ─────────────────────────────
app.use(errorHandler);

module.exports = app;
