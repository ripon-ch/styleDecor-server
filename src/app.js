const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');

// Import routes
const authRoutes = require('./routes/auth.routes');
const userRoutes = require('./routes/user.routes');
const serviceRoutes = require('./routes/service.routes');
const bookingRoutes = require('./routes/booking.routes');
const paymentRoutes = require('./routes/payment.routes');
const decoratorRoutes = require('./routes/decorator.routes');
const adminRoutes = require('./routes/admin.routes');

const app = express();

// ==================== SECURITY MIDDLEWARE ====================

// Security headers
app.use(helmet({
  contentSecurityPolicy: false,
  crossOriginEmbedderPolicy: false
}));

// CORS configuration
const corsOptions = {
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  optionsSuccessStatus: 200
};
app.use(cors(corsOptions));

// Handle preflight requests
app.options('*', cors(corsOptions));

// ==================== RATE LIMITING ====================

// General API rate limit
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Max 100 requests per windowMs
  message: { message: 'Too many requests, please try again later.' },
  standardHeaders: true,
  legacyHeaders: false
});

// Auth endpoints rate limit (stricter)
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // Max 5 attempts per 15 minutes
  message: { message: 'Too many authentication attempts, please try again later.' },
  standardHeaders: true,
  legacyHeaders: false
});

// ==================== BODY PARSER ====================

// Stripe webhook needs raw body
app.use('/api/payments/webhook', express.raw({ type: 'application/json' }));

// JSON body parser for all other routes
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// ==================== APPLY RATE LIMITING ====================

app.use('/api/', generalLimiter);
app.use('/api/auth/register', authLimiter);
app.use('/api/auth/login', authLimiter);

// ==================== HEALTH CHECK ====================

app.get('/health', (req, res) => {
  res.status(200).json({ 
    status: 'OK', 
    message: 'StyleDecor API is running',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

app.get('/', (req, res) => {
  res.status(200).json({
    message: 'Welcome to StyleDecor API',
    version: '1.0.0',
    documentation: '/api-docs',
    health: '/health'
  });
});

// ==================== API ROUTES ====================

app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/services', serviceRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/decorators', decoratorRoutes);
app.use('/api/admin', adminRoutes);

// ==================== 404 HANDLER ====================

app.use((req, res, next) => {
  res.status(404).json({
    message: `Route not found: ${req.method} ${req.originalUrl}`,
    availableRoutes: {
      auth: '/api/auth',
      users: '/api/users',
      services: '/api/services',
      bookings: '/api/bookings',
      payments: '/api/payments',
      decorators: '/api/decorators',
      admin: '/api/admin'
    }
  });
});

// ==================== ERROR HANDLER ====================

app.use((err, req, res, next) => {
  console.error('Error:', err);
  
  // Mongoose validation error
  if (err.name === 'ValidationError') {
    const errors = Object.values(err.errors).map(e => ({
      field: e.path,
      message: e.message
    }));
    return res.status(400).json({
      message: 'Validation failed',
      errors
    });
  }
  
  // Mongoose duplicate key error
  if (err.code === 11000) {
    const field = Object.keys(err.keyPattern)[0];
    return res.status(400).json({
      message: `${field} already exists`
    });
  }
  
  // Mongoose cast error (invalid ObjectId)
  if (err.name === 'CastError') {
    return res.status(400).json({
      message: `Invalid ${err.path}: ${err.value}`
    });
  }
  
  // Firebase errors
  if (err.code && err.code.startsWith('auth/')) {
    return res.status(401).json({
      message: 'Authentication error',
      error: err.message
    });
  }
  
  // Stripe errors
  if (err.type && err.type.startsWith('Stripe')) {
    return res.status(400).json({
      message: 'Payment error',
      error: err.message
    });
  }
  
  // Default server error
  res.status(err.statusCode || 500).json({
    message: err.message || 'Internal server error',
    ...(process.env.NODE_ENV === 'development' && { 
      stack: err.stack,
      error: err 
    })
  });
});

module.exports = app;