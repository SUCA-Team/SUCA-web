import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut } from 'firebase/auth';

// Import the functions you need from the SDKs you need
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID
};

// Initialize Firebase safely (allow dev without Firebase env)
let app: ReturnType<typeof initializeApp> | null = null;
try {
  if (firebaseConfig.apiKey && firebaseConfig.authDomain && firebaseConfig.projectId) {
    app = initializeApp(firebaseConfig);
    // Guard analytics for browser-only environments
    if (typeof window !== 'undefined') {
      try {
        getAnalytics(app);
      } catch (e) {
        console.warn('Analytics init skipped:', (e as Error).message);
      }
    }
  } else {
    console.warn('Firebase config incomplete; running without Firebase.');
  }
} catch (e) {
  console.warn('Firebase init failed; continuing without Firebase:', (e as Error).message);
}

// Validate that required environment variables are present
const requiredEnvVars = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
};

const missingEnvVars = Object.entries(requiredEnvVars)
  .filter(([_, value]) => !value)
  .map(([key, _]) => `VITE_FIREBASE_${key.toUpperCase()}`);

if (missingEnvVars.length > 0) {
  console.error('Missing required Firebase environment variables:', missingEnvVars.join(', '));
  console.error('Please check your .env file and ensure all required variables are set.');
}

const isConfigured = Boolean(firebaseConfig.apiKey && firebaseConfig.authDomain && firebaseConfig.projectId);

let auth: ReturnType<typeof getAuth> | null = null;
let googleProvider: GoogleAuthProvider | null = null;

if (isConfigured && app) {
  auth = getAuth(app);
  googleProvider = new GoogleAuthProvider();
}

export async function signInWithGooglePopup() {
  if (!isConfigured || !auth || !googleProvider) {
    throw new Error('Firebase is not configured. Set VITE_FIREBASE_* env vars to enable Google sign-in.');
  }
  const result = await signInWithPopup(auth, googleProvider);
  return result;
}

export async function signOutUser() {
  if (!auth) return;
  await signOut(auth);
}

export { auth };
