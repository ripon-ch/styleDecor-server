const admin = require('firebase-admin');

// Initialize Firebase Admin SDK
// Note: In production, use service account JSON file
// For now, using environment variables

const firebaseConfig = {
  projectId: process.env.FIREBASE_PROJECT_ID || 'style-decor-bd',
  // For service account authentication, create a service account in Firebase Console
  // Download the JSON and use it, or set these env variables:
  credentials: process.env.FIREBASE_PRIVATE_KEY ? {
    privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL
  } : admin.credential.applicationDefault()
};

// Initialize only if not already initialized
if (!admin.apps.length) {
  try {
    admin.initializeApp({
      credential: firebaseConfig.credentials || admin.credential.cert({
        projectId: firebaseConfig.projectId,
        privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL
      })
    });
    console.log('✅ Firebase Admin SDK initialized');
  } catch (error) {
    console.error('❌ Firebase Admin initialization error:', error.message);
    // For development without service account
    console.warn('⚠️ Running without Firebase Admin credentials - some features may not work');
  }
}

const auth = admin.auth();
const db = admin.firestore();

module.exports = { admin, auth, db };