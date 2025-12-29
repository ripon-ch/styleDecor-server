const admin = require('../config/firebase');
const User = require('../models/User');

/**
 * Protect: Blocks request if token is missing/invalid
 */
exports.protect = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ success: false, message: 'No token provided' });
    }

    const token = authHeader.split('Bearer ')[1];
    const decodedToken = await admin.auth().verifyIdToken(token);

    let user = await User.findOne({ firebaseUid: decodedToken.uid });

    // Auto-Sync for Social Login
    if (!user) {
      // Logic: If email is your specific admin email, make them admin
      const isAdmin = decodedToken.email === 'admin@styledecor.com'; 
      
      user = await User.create({
        firebaseUid: decodedToken.uid,
        email: decodedToken.email,
        fullName: decodedToken.name || decodedToken.email.split('@')[0],
        role: isAdmin ? 'admin' : 'customer',
        isActive: true
      });
    }

    if (!user.isActive) {
      return res.status(403).json({ success: false, message: 'Account deactivated' });
    }

    req.user = user;
    next();
  } catch (error) {
    console.error('Protect Middleware Error:', error.message);
    res.status(401).json({ success: false, message: 'Authentication failed' });
  }
};

/**
 * OptionalAuth: Allows request to pass through even without a token
 */
exports.optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.split('Bearer ')[1];
      const decodedToken = await admin.auth().verifyIdToken(token);
      req.user = await User.findOne({ firebaseUid: decodedToken.uid });
    }
    next();
  } catch (error) {
    next(); // Just continue without req.user
  }
};