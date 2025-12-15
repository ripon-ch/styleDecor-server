const express = require('express');
const router = express.Router();
const {
  register,
  login,
  firebaseLogin,
  getProfile,
  updateProfile,
  updateAvatar,
  changePassword,
  deleteAccount,
  logout
} = require('../controllers/auth.controller');
const { authenticateJWT } = require('../middleware/auth.middleware');
const { validateRegister, validateLogin, validate } = require('../middleware/validation.middleware');

// Public routes
router.post('/register', validateRegister, validate, register);
router.post('/login', validateLogin, validate, login);
router.post('/firebase-login', firebaseLogin);

// Protected routes
router.use(authenticateJWT); // All routes below require authentication

router.get('/profile', getProfile);
router.put('/profile', updateProfile);
router.put('/avatar', updateAvatar);
router.put('/change-password', changePassword);
router.delete('/account', deleteAccount);
router.post('/logout', logout);

module.exports = router;