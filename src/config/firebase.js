// src/config/firebase.js
const fs = require('fs');
const path = require('path');
const admin = require('firebase-admin');

const keyPath = process.env.FIREBASE_SERVICE_ACCOUNT_PATH || './firebase-service-account.json';
let firebaseAdmin = null;

try {
  if (fs.existsSync(path.resolve(keyPath))) {
    const serviceAccount = require(path.resolve(keyPath));
    if (!admin.apps.length) {
      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount)
      });
    }
    firebaseAdmin = admin;
    console.log('Firebase Admin initialized');
  } else {
    console.warn(`Firebase service account file not found at ${keyPath}. Firebase Admin disabled.`);
  }
} catch (err) {
  console.error('Error initializing Firebase Admin:', err && err.message ? err.message : err);
}

module.exports = firebaseAdmin;
