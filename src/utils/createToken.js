const jwt = require('jsonwebtoken');

const createToken = (userId, expiresIn = process.env.JWT_EXPIRE || '7d') => {
  return jwt.sign({ userId }, process.env.JWT_SECRET, {
    expiresIn
  });
};

const verifyToken = (token) => {
  try {
    return jwt.verify(token, process.env.JWT_SECRET);
  } catch (error) {
    throw new Error('Invalid token');
  }
};

module.exports = { createToken, verifyToken };