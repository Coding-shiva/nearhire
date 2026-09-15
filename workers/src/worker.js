require('dotenv').config({ path: __dirname + '/../../backend/.env' });
const mongoose = require('mongoose');
const cron = require('node-cron');
const { runIngestionPipeline } = require('./processors/ingestionProcessor');
const { runExpirySweeper } = require('./processors/expiryProcessor');
const { connection } = require('./queues');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/nearhire';

async function startWorkers() {
  try {
    console.log('Connecting workers to MongoDB:', MONGO_URI);
    await mongoose.connect(MONGO_URI);
    console.log('Workers connected to MongoDB successfully.');

    // 1. Run initial check on startup
    console.log('[Worker Engine] Running initial startup ingestion check...');
    await runIngestionPipeline();
    await runExpirySweeper();

    // 2. Schedule regular recurring jobs
    // Ingestion: Every 30 minutes (*/30 * * * *)
    cron.schedule('*/30 * * * *', async () => {
      console.log('[Cron Job] Running scheduled 30-minute job ingestion...');
      await runIngestionPipeline();
    });

    // Expiry Sweeper: Every midnight (0 0 * * *)
    cron.schedule('0 0 * * *', async () => {
      console.log('[Cron Job] Running nightly job expiry sweep...');
      await runExpirySweeper();
    });

    console.log('====================================================');
    console.log('  NearHire Background Worker Daemon Active          ');
    console.log('  - Ingestion: Scheduled every 30 minutes           ');
    console.log('  - Expiry Sweeper: Scheduled every midnight        ');
    console.log('====================================================');

    // Graceful exit
    const shutdown = async (signal) => {
      console.log(`Received ${signal}. Shutting down worker...`);
      if (connection) await connection.quit();
      await mongoose.disconnect();
      process.exit(0);
    };

    process.on('SIGTERM', () => shutdown('SIGTERM'));
    process.on('SIGINT', () => shutdown('SIGINT'));
  } catch (err) {
    console.error('Worker startup failure:', err);
    process.exit(1);
  }
}

startWorkers();
