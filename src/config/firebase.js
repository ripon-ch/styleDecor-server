const admin = require('firebase-admin');

// Initialize Firebase Admin SDK
const initializeFirebase = () => {
  try {
    // Check if already initialized
    if (admin.apps.length > 0) {
      console.log('✅ Firebase Admin SDK already initialized');
      return admin;
    }

    // Check if Firebase credentials are provided
    if (!process.env.FIREBASE_PROJECT_ID) {
      console.log('⚠️  Firebase credentials not provided. Firebase authentication disabled.');
      return null;
    }

    const serviceAccount = {
      type: "service_account",
      project_id: process.env.FIREBASE_PROJECT_ID,
      private_key: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
      client_email: process.env.FIREBASE_CLIENT_EMAIL
    };

    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount)
    });

    console.log('✅ Firebase Admin SDK initialized successfully');
    return admin;
  } catch (error) {
    console.error('❌ Error initializing Firebase:', error.message);
    console.log('⚠️  Continuing without Firebase authentication');
    return null;
  }
};

module.exports = initializeFirebase();
