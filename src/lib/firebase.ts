import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { getAnalytics, isSupported, Analytics } from 'firebase/analytics';
import { getFirestore, Firestore } from 'firebase/firestore';
import { getAuth, Auth } from 'firebase/auth';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "AIzaSyBU-mUQa536d24ND_yJopk_POLK66DJYm8",
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || "lifeos-07.firebaseapp.com",
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "lifeos-07",
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || "lifeos-07.firebasestorage.app",
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "530150412604",
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || "1:530150412604:web:04fcf16de09b9431b90e39",
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID || "G-FSR6KX9WYE",
};

// Initialize Firebase (singleton pattern safe for Next.js SSR)
const app: FirebaseApp = !getApps().length ? initializeApp(firebaseConfig) : getApp();

// Firestore Database instance
const db: Firestore = getFirestore(app);

// Firebase Auth instance
const auth: Auth = getAuth(app);

// Analytics singleton (only initialized in browser environments where supported)
let analytics: Analytics | null = null;
if (typeof window !== 'undefined') {
  isSupported().then((supported) => {
    if (supported) {
      analytics = getAnalytics(app);
    }
  });
}

export { app, db, auth, analytics, firebaseConfig };
