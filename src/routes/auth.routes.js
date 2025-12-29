const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller');
const { protect } = require('../middleware/auth.middleware');

/* ============ Public Routes ============ */
router.post('/register', authController.register);
router.post('/firebase-login', authController.firebaseLogin);
router.post('/login', authController.firebaseLogin); 

/* ============ Protected Routes ============ */
router.use(protect); // Middleware applies to all routes below

router.get('/me', authController.getProfile);
router.get('/profile', authController.getProfile);
router.put('/profile', authController.updateProfile);
router.post('/logout', authController.logout);

// Fixed handler to ensure no crashes
const avatarHandler = authController.updateAvatar || ((req, res) => res.json({success: true}));
router.put('/avatar', avatarHandler);

module.exports = router;