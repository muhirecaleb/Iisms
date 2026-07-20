const app = require('./src/app');
const env = require('./src/config/environment');
const logger = require('./src/utils/logger');

const PORT = env.port;

const server = app.listen(PORT, () => {
  console.log('');
  console.log('╔═══════════════════════════════════════════╗');
  console.log(`║  IISMS API Server                          ║`);
  console.log(`║  Port:      ${String(PORT).padEnd(33)}║`);
  console.log(`║  Mode:      `${env.nodeEnv}`                        ║`);
  console.log(`║  API Base:  http://localhost:${PORT}/api/v1     ║`);
  console.log('╚═══════════════════════════════════════════╝');
  console.log('');
});

// Graceful shutdown
process.on('SIGTERM', () => {
  logger.info('SIGTERM received. Shutting down gracefully...');
  server.close(() => process.exit(0));
});

process.on('SIGINT', () => {
  logger.info('SIGINT received. Shutting down gracefully...');
  server.close(() => process.exit(0));
});

process.on('unhandledRejection', (reason) => {
  logger.error('Unhandled Rejection:', reason);
});

process.on('uncaughtException', (error) => {
  logger.error('Uncaught Exception:', error);
  process.exit(1);
});
