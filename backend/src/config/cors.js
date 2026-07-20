const env = require('./environment');

const corsOptions = {
  origin: env.corsOrigin.split(',').map((o) => o.trim()),
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: [
    'Content-Type',
    'Authorization',
    'X-Academic-Year-Id',
    'X-Requested-With',
  ],
  exposedHeaders: ['Content-Disposition'],
  maxAge: 86400, // 24 hours
};

module.exports = corsOptions;
