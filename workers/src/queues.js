const { Queue } = require('bullmq');
const IORedis = require('ioredis');

const redisConfig = {
  host: process.env.REDIS_HOST || '127.0.0.1',
  port: parseInt(process.env.REDIS_PORT || '6379'),
  password: process.env.REDIS_PASSWORD || undefined,
  maxRetriesPerRequest: null,
};

let connection;
let isRedisReady = false;

try {
  connection = new IORedis(redisConfig);
  connection.on('connect', () => {
    isRedisReady = true;
    console.log('[Workers Queue] Connected to Redis for BullMQ.');
  });
  connection.on('error', (err) => {
    isRedisReady = false;
    console.warn(`[Workers Queue] Redis connection warning: ${err.message}. Direct execution enabled.`);
  });
} catch (e) {
  console.warn(`[Workers Queue] Could not initialize Redis client: ${e.message}`);
}

const ingestionQueue = connection ? new Queue('job-ingestion', { connection }) : null;
const expiryQueue = connection ? new Queue('job-expiry', { connection }) : null;
const alertQueue = connection ? new Queue('job-alerts', { connection }) : null;

module.exports = {
  connection,
  ingestionQueue,
  expiryQueue,
  alertQueue,
  isRedisReady: () => isRedisReady,
};
