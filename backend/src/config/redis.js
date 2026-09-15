const { createClient } = require('redis');
const logger = require('./logger');

let redisClient = null;
let isRedisConnected = false;

// In-memory fallback cache if Redis server is offline
const memoryCache = new Map();

const getRedisClient = async () => {
  if (redisClient && isRedisConnected) return redisClient;

  const redisHost = process.env.REDIS_HOST || '127.0.0.1';
  const redisPort = process.env.REDIS_PORT || 6379;
  const redisPassword = process.env.REDIS_PASSWORD || undefined;

  try {
    redisClient = createClient({
      url: `redis://${redisPassword ? `:${redisPassword}@` : ''}${redisHost}:${redisPort}`,
      socket: {
        connectTimeout: 4000,
        reconnectStrategy: (retries) => {
          if (retries > 3) {
            logger.warn('Redis reconnection failed after 3 attempts. Using fallback in-memory cache.');
            return false;
          }
          return Math.min(retries * 500, 2000);
        },
      },
    });

    redisClient.on('error', (err) => {
      logger.warn(`Redis Client Warning: ${err.message}. Fallback cache active.`);
      isRedisConnected = false;
    });

    redisClient.on('connect', () => {
      logger.info('Connected to Redis server successfully.');
      isRedisConnected = true;
    });

    await redisClient.connect();
    return redisClient;
  } catch (err) {
    logger.warn(`Could not connect to Redis: ${err.message}. NearHire is continuing with in-memory caching.`);
    isRedisConnected = false;
    return null;
  }
};

const cacheGet = async (key) => {
  try {
    if (isRedisConnected && redisClient) {
      const data = await redisClient.get(key);
      return data ? JSON.parse(data) : null;
    }
  } catch (e) {
    logger.debug(`Redis get failed: ${e.message}`);
  }
  const item = memoryCache.get(key);
  if (item && item.expiry > Date.now()) {
    return item.data;
  }
  memoryCache.delete(key);
  return null;
};

const cacheSet = async (key, value, ttlSeconds = 300) => {
  try {
    if (isRedisConnected && redisClient) {
      await redisClient.set(key, JSON.stringify(value), { EX: ttlSeconds });
      return;
    }
  } catch (e) {
    logger.debug(`Redis set failed: ${e.message}`);
  }
  memoryCache.set(key, {
    data: value,
    expiry: Date.now() + ttlSeconds * 1000,
  });
};

const cacheDelete = async (pattern) => {
  try {
    if (isRedisConnected && redisClient) {
      const keys = await redisClient.keys(pattern);
      if (keys.length > 0) {
        await redisClient.del(keys);
      }
    }
  } catch (e) {
    logger.debug(`Redis delete failed: ${e.message}`);
  }
  // Clear matching in-memory cache keys
  for (const key of memoryCache.keys()) {
    if (key.includes(pattern.replace('*', ''))) {
      memoryCache.delete(key);
    }
  }
};

module.exports = {
  getRedisClient,
  cacheGet,
  cacheSet,
  cacheDelete,
  isRedisAvailable: () => isRedisConnected,
};
