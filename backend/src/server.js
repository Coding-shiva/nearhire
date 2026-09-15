require('dotenv').config();
const http = require('http');
const app = require('./app');
const connectDB = require('./config/db');
const { getRedisClient } = require('./config/redis');
const logger = require('./config/logger');

const PORT = process.env.PORT || 5000;

async function startServer() {
  try {
    // 1. Connect MongoDB
    await connectDB();

    // 2. Connect Redis (or fallback to memory)
    await getRedisClient();

    // 3. Create & start HTTP server
    const server = http.createServer(app);

    server.listen(PORT, () => {
      logger.info(`=================================================`);
      logger.info(`  NearHire Backend API running on port ${PORT}   `);
      logger.info(`  Environment: ${process.env.NODE_ENV || 'development'}`);
      logger.info(`  Health Check: http://localhost:${PORT}/health   `);
      logger.info(`=================================================`);
    });

    // Graceful Shutdown
    const shutdown = async (signal) => {
      logger.info(`Received ${signal}. Shutting down gracefully...`);
      server.close(() => {
        logger.info('HTTP server closed.');
        process.exit(0);
      });
    };

    process.on('SIGTERM', () => shutdown('SIGTERM'));
    process.on('SIGINT', () => shutdown('SIGINT'));
  } catch (error) {
    logger.error(`Fatal Server Startup Error: ${error.message}`);
    process.exit(1);
  }
}

startServer();
