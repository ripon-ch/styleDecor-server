// src/middleware/auth.middleware.js
const admin = require('../config/firebase'); // may be null
const User = require('../models/User');
const createToken = require('../utils/createToken');
const jwt = require('jsonwebtoken');

async function verifyFirebase(req, res, next) {
  try {
    const authHeader = req.headers.authorization || '';
    const idToken = authHeader.startsWith('Bearer ') ? authHeader.split(' ')[1] : (req.body && req.body.idToken ? req.body.idToken : null);
    if (!idToken) return res.status(401).json({ message: 'No Firebase ID token provided' });
    if (!admin) return res.status(500).json({ message: 'Firebase Admin not initialized on server' });

    const decoded = await admin.auth().verifyIdToken(idToken);
    const firebaseUid = decoded.uid;
    const email = decoded.email;
    const name = decoded.name || decoded.email?.split('@')[0] || 'User';
    const photoURL = decoded.picture || '';

    let user = await User.findOne({ firebaseUid });
    if (!user) user = await User.findOne({ email });

    if (!user) {
      user = await User.create({
        firebaseUid, email, name, displayName: name, photoURL, isVerified: true
      });
    } else {
      let changed = false;
      if (!user.firebaseUid) { user.firebaseUid = firebaseUid; changed = true; }
      if (!user.name && name) { user.name = name; changed = true; }
      if (!user.photoURL && photoURL) { user.photoURL = photoURL; changed = true; }
      if (changed) await user.save();
    }

    const payload = { id: user._id.toString(), email: user.email, role: user.role };
    const serverToken = createToken(payload);

    req.user = user;
    req.serverToken = serverToken;
    res.setHeader('x-server-token', serverToken);

    next();
  } catch (err) {
    console.error('verifyFirebase error:', err && err.message ? err.message : err);
    return res.status(401).json({ message: 'Invalid Firebase ID token' });
  }
}

async function verifyJWT(req, res, next) {
  try {
    const authHeader = req.headers.authorization || '';
    const token = authHeader.startsWith('Bearer ') ? authHeader.split(' ')[1] : (req.headers['x-server-token'] || null);
    if (!token) return res.status(401).json({ message: 'No server token provided' });

    const secret = process.env.JWT_SECRET;
    if (!secret) return res.status(500).json({ message: 'JWT_SECRET not set on server' });

    const decoded = jwt.verify(token, secret);
    const user = await User.findById(decoded.id);
    if (!user) return res.status(401).json({ message: 'User not found' });

    req.user = user;
    next();
  } catch (err) {
    console.error('verifyJWT error:', err && err.message ? err.message : err);
    return res.status(401).json({ message: 'Invalid server token' });
  }
}

module.exports = { verifyFirebase, verifyJWT };
