const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const path = require('path');

const env = require('./config/env');
const routes = require('./routes/index');
const { errorHandler, notFoundHandler } = require('./middleware/error.middleware');
const logger = require('./utils/logger');

const app = express();

// ─── Security Middleware ───────────────────────────────────────────────────
app.use(helmet());

// ─── CORS ─────────────────────────────────────────────────────────────────
app.use(cors({
  origin: env.NODE_ENV === 'production'
    ? [env.CLIENT_URL]
    : ['http://localhost:3000', 'http://localhost:8081', 'exp://localhost:8081'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

// ─── Rate Limiting ─────────────────────────────────────────────────────────
const globalLimiter = rateLimit({
  windowMs: env.RATE_LIMIT_WINDOW_MS,
  max: env.RATE_LIMIT_MAX_REQUESTS,
  message: { success: false, message: 'Too many requests. Please try again later.' },
  standardHeaders: true,
  legacyHeaders: false,
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10,
  message: { success: false, message: 'Too many auth attempts. Please try again in 15 minutes.' },
});

app.use('/api/', globalLimiter);
app.use('/api/auth/login', authLimiter);
app.use('/api/auth/register', authLimiter);
app.use('/api/auth/google', authLimiter);

// ─── Request Parsing ───────────────────────────────────────────────────────
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// ─── Request Logging ───────────────────────────────────────────────────────
if (env.NODE_ENV !== 'test') {
  app.use(morgan(env.NODE_ENV === 'production' ? 'combined' : 'dev', {
    stream: { write: (msg) => logger.http(msg.trim()) },
  }));
}

// ─── Static Files ──────────────────────────────────────────────────────────
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// ─── API Routes ────────────────────────────────────────────────────────────
app.use('/api', routes);

// ─── Root Route ────────────────────────────────────────────────────────────
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: '🌌 Welcome to ZYVO API',
    documentation: '/api/health',
    version: '1.0.0',
  });
});

// ─── 404 Handler ───────────────────────────────────────────────────────────
app.use(notFoundHandler);

// ─── Global Error Handler ──────────────────────────────────────────────────
app.use(errorHandler);

module.exports = app;
