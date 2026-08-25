'use client';
import { getApps, initializeApp, type FirebaseApp } from 'firebase/app';
import { getAuth, onAuthStateChanged, signInAnonymously, type Auth } from 'firebase/auth';
import { initializeFirestore, type Firestore } from 'firebase/firestore';

// Fill these in from the Firebase console (Project settings → General → Your apps → SDK setup).
// Set them as NEXT_PUBLIC_* env vars (in Vercel project settings and .env.local) — cloud sync
// stays silently disabled (the app falls back to localStorage-only, its current behavior)
// until they're present.
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

export const isFirebaseConfigured = Boolean(firebaseConfig.apiKey && firebaseConfig.projectId);

let app: FirebaseApp | null = null;
let authInstance: Auth | null = null;
let dbInstance: Firestore | null = null;

function ensureApp(): FirebaseApp | null {
  if (!isFirebaseConfigured) return null;
  if (!app) app = getApps().length ? getApps()[0]! : initializeApp(firebaseConfig);
  return app;
}

export function getFirebaseAuth(): Auth | null {
  const a = ensureApp();
  if (!a) return null;
  if (!authInstance) authInstance = getAuth(a);
  return authInstance;
}

export function getFirebaseDb(): Firestore | null {
  const a = ensureApp();
  if (!a) return null;
  // Firestore's default WebChannel transport can hang for a long time on some mobile/
  // carrier networks before it detects it needs to fall back — auto-detecting up front
  // avoids that stall.
  if (!dbInstance) dbInstance = initializeFirestore(a, { experimentalAutoDetectLongPolling: true });
  return dbInstance;
}

let uidPromise: Promise<string | null> | null = null;

// Anonymous, device-scoped identity — Firebase Auth persists it in the browser,
// so the same uid (and Firestore doc) comes back on later visits/reloads.
export function getDeviceUserId(): Promise<string | null> {
  if (!isFirebaseConfigured) return Promise.resolve(null);
  if (uidPromise) return uidPromise;
  uidPromise = new Promise((resolve) => {
    const auth = getFirebaseAuth();
    if (!auth) return resolve(null);
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        unsubscribe();
        resolve(user.uid);
      }
    });
    signInAnonymously(auth).catch(() => resolve(null));
  });
  return uidPromise;
}
