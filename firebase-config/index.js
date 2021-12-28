import local from "./local";

export default {
  apiKey: process.env.FIREBASE_API_KEY || local.apiKey,
  authDomain: process.env.FIREBASE_AUTH_DOMAIN || local.authDomain,
  projectId: process.env.FIREBASE_PROJECT_ID || local.projectId,
  storageBucket: process.env.FIREBASE_STORAGE_BUCKET || local.storageBucket,
  messagingSenderId:
    process.env.FIREBASE_MESSAGING_SENDER_ID || local.messagingSenderId,
  appId: process.env.FIREBASE_APP_ID || local.appId,
};
