import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut } from 'firebase/auth';

// Read config from Vite env. Add these to your .env when you connect a real Firebase project.
const firebaseConfig = {
  apiKey: (import.meta as unknown as { env: Record<string, string> }).env.VITE_FIREBASE_API_KEY,
  authDomain: (import.meta as unknown as { env: Record<string, string> }).env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: (import.meta as unknown as { env: Record<string, string> }).env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: (import.meta as unknown as { env: Record<string, string> }).env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: (import.meta as unknown as { env: Record<string, string> }).env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: (import.meta as unknown as { env: Record<string, string> }).env.VITE_FIREBASE_APP_ID,
};

// Minimal validation: ensure at least apiKey and authDomain are present in env when used.
const isConfigured = Boolean(firebaseConfig.apiKey && firebaseConfig.authDomain);

let auth: ReturnType<typeof getAuth> | null = null;
let googleProvider: GoogleAuthProvider | null = null;

if (isConfigured) {
  const app = initializeApp(firebaseConfig);
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
