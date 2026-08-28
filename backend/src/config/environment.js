const path = require('path');

// Load .env from backend root
require('dotenv').config({ path: path.join(__dirname, '../../.env') });

const env = {
  nodeEnv: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.PORT, 10) || 3001,

  // Database
  db: {
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT, 10) || 3306,
    name: process.env.DB_NAME || 'iisms',
    user: process.env.DB_USER || 'root',
    pass: process.env.DB_PASS || '',
    poolSize: 10,
  },

  // JWT
  jwt: {
    accessSecret: process.env.JWT_ACCESS_SECRET || 'dev-access-secret',
    refreshSecret: process.env.JWT_REFRESH_SECRET || 'dev-refresh-secret',
    accessExpiry: process.env.JWT_ACCESS_EXPIRY || '30d',
    refreshExpiry: process.env.JWT_REFRESH_EXPIRY || '7d',
  },

  // OTP / Mail
  otp: {
    devMode: process.env.OTP_DEV_MODE === 'true',
    mailHost: process.env.MAIL_HOST || 'smtp.gmail.com',
    mailPort: parseInt(process.env.MAIL_PORT, 10) || 587,
    mailUser: process.env.MAIL_USER || '',
    mailPass: process.env.MAIL_PASS || '',
  },

  // CORS
  corsOrigin: process.env.CORS_ORIGIN || 'http://localhost:5173',

  // Uploads
  uploadDir: process.env.UPLOAD_DIR || 'uploads',
  maxFileSize: parseInt(process.env.MAX_FILE_SIZE, 10) || 2 * 1024 * 1024, // 2MB

  // Logging
  logLevel: process.env.LOG_LEVEL || 'debug',
};

// Validate required env vars in production
if (env.nodeEnv === 'production') {
  const required = ['JWT_ACCESS_SECRET', 'JWT_REFRESH_SECRET'];
  for (const key of required) {
    if (!process.env[key] || process.env[key].startsWith('change-this')) {
      console.error(`FATAL: ${key} environment variable must be set in production`);
      process.exit(1);
    }
  }
}

module.exports = env;
