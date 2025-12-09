// src/middleware/error.middleware.js
const logger = require('../utils/logger');

function errorHandler(err, req, res, next) {
  logger.error(err.stack || err.message || err);
  const status = err.status || 500;
  const message = err.message || 'Server error';
  res.status(status).json({ error: message });
}

module.exports = { errorHandler };
