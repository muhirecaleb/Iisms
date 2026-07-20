const mysql = require('mysql2/promise');
const env = require('./environment');

const pool = mysql.createPool({
  host: env.db.host,
  port: env.db.port,
  user: env.db.user,
  password: env.db.pass,
  database: env.db.name,
  waitForConnections: true,
  connectionLimit: env.db.poolSize,
  queueLimit: 0,
  charset: 'utf8mb4',
  timezone: '+00:00',
});

// Test connection on startup
pool.getConnection()
  .then((conn) => {
    console.log(`✓ MySQL connected: ${env.db.host}:${env.db.port}/${env.db.name}`);
    conn.release();
  })
  .catch((err) => {
    console.error('✗ MySQL connection failed:', err.message);
  });

module.exports = pool;
