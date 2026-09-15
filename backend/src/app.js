const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const mongoose = require('mongoose');
const { isRedisAvailable } = require('./config/redis');
const errorHandler = require('./middleware/errorHandler');
const { apiLimiter } = require('./middleware/rateLimiter');

// Import routes
const authRoutes = require('./routes/authRoutes');
const jobRoutes = require('./routes/jobRoutes');
const applicationRoutes = require('./routes/applicationRoutes');
const alertRoutes = require('./routes/alertRoutes');
const companyRoutes = require('./routes/companyRoutes');
const employerRoutes = require('./routes/employerRoutes');
const adminRoutes = require('./routes/adminRoutes');

const app = express();

// Security Middlewares
app.use(helmet());
const allowedOrigins = process.env.CLIENT_URL
  ? process.env.CLIENT_URL.split(',').map((u) => u.trim())
  : ['http://localhost:5173', 'http://localhost:3000', 'http://localhost:80'];

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps, curl, server-to-server)
      if (!origin) return callback(null, true);
      if (
        allowedOrigins.includes('*') ||
        allowedOrigins.includes(origin) ||
        process.env.NODE_ENV !== 'production'
      ) {
        return callback(null, true);
      }
      return callback(null, true); // Allow during deployment
    },
    credentials: true,
  })
);

// Logging & Body parsing
if (process.env.NODE_ENV !== 'test') {
  app.use(morgan('dev'));
}
app.use(express.json({ limit: '5mb' }));
app.use(express.urlencoded({ extended: true }));

// Apply rate limiting to all API requests
app.use('/api/', apiLimiter);

// Health Check Endpoint
app.get('/health', (req, res) => {
  const mongoStatus = mongoose.connection.readyState === 1 ? 'connected' : 'disconnected';
  const redisStatus = isRedisAvailable() ? 'connected' : 'in-memory-fallback';

  res.status(200).json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptimeSeconds: process.uptime(),
    services: {
      database: mongoStatus,
      cache: redisStatus,
    },
    version: '1.0.0',
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/jobs', jobRoutes);
app.use('/api/applications', applicationRoutes);
app.use('/api/alerts', alertRoutes);
app.use('/api/companies', companyRoutes);
app.use('/api/employer', employerRoutes);
app.use('/api/admin', adminRoutes);

// 404 Handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `API Route ${req.originalUrl} not found`,
  });
});

// Centralized Error Handler
app.use(errorHandler);

module.exports = app;
