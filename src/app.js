// src/app.js
require('dotenv').config();
const express = require('express');
const morgan = require('morgan');
const helmet = require('helmet');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const connectDB = require('./config/database');
const logger = require('./utils/logger');

// connect DB
connectDB();

const app = express();

// middlewares
app.use(morgan('dev'));
app.use(helmet());
app.use(cors({ origin: process.env.FRONTEND_URL || true, credentials: true }));
app.use(express.json({ limit: '10mb' }));
app.use(cookieParser());

// routes
app.use('/api/auth', require('./routes/auth.routes'));
app.use('/api/services', require('./routes/service.routes'));
app.use('/api/bookings', require('./routes/booking.routes'));
app.use('/api/payments', require('./routes/payment.routes'));
app.use('/api/admin', require('./routes/admin.routes'));
app.use('/api/advanced', require('./routes/advanced.routes'));

// stripe webhook (raw body)
const paymentController = require('./controllers/payment.controller');
app.post('/api/payments/webhook', express.raw({ type: 'application/json' }), paymentController.handleWebhook);

// health
app.get('/', (req, res) => res.json({ message: 'StyleDecor API is running' }));

// error handler
const { errorHandler } = require('./middleware/error.middleware');
app.use(errorHandler);

module.exports = app;
