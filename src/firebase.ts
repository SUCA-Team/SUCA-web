import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut, sendEmailVerification, sendPasswordResetEmail } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// Import the functions you need from the SDKs you need
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyCuM1y7ZfbfM6pGyrd5Uu6-rOkcQOnStyg",
  authDomain: "suca-database.firebaseapp.com",
  databaseURL: "https://suca-database-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "suca-database",
  storageBucket: "suca-database.firebasestorage.app",
  messagingSenderId: "842887867822",
  appId: "1:842887867822:web:b65d3ec81379d1eed4ac3f"
};

// Validate that required environment variables are present
const requiredEnvVars = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
};

const missingEnvVars = Object.entries(requiredEnvVars)
  .filter(([, value]) => !value)
  .map(([key]) => `VITE_FIREBASE_${key.toUpperCase()}`);

if (missingEnvVars.length > 0) {
  console.error('Missing required Firebase environment variables:', missingEnvVars.join(', '));
  console.error('Please check your .env file and ensure all required variables are set.');
}

const isConfigured = Boolean(firebaseConfig.apiKey && firebaseConfig.authDomain);

let auth: ReturnType<typeof getAuth> | null = null;
let googleProvider: GoogleAuthProvider | null = null;
let db: ReturnType<typeof getFirestore> | null = null;

if (isConfigured) {
  // Initialize Firebase app
  const app = initializeApp(firebaseConfig);
  // Initialize analytics
  void getAnalytics(app);
  // Initialize auth services
  auth = getAuth(app);
  googleProvider = new GoogleAuthProvider();
  db = getFirestore(app);
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

export async function sendVerificationEmail() {
  if (!auth?.currentUser) {
    throw new Error('No user is currently signed in.');
  }
  await sendEmailVerification(auth.currentUser);
}

export async function sendPasswordReset(email: string) {
  if (!auth) {
    throw new Error('Firebase is not configured.');
  }
  await sendPasswordResetEmail(auth, email);
}

export { auth, db };
