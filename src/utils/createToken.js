// src/utils/createToken.js
const jwt = require('jsonwebtoken');

function createToken(payload) {
  const secret = process.env.JWT_SECRET;
  if (!secret) throw new Error('JWT_SECRET not set in .env');
  const expiresIn = process.env.JWT_EXPIRES || '7d';
  return jwt.sign(payload, secret, { expiresIn });
}

module.exports = createToken;
