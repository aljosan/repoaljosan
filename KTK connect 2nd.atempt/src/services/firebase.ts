import { getApp, getApps, initializeApp, type FirebaseApp } from 'firebase/app';
import { getAuth, type Auth } from 'firebase/auth';
import { getFirestore, type Firestore } from 'firebase/firestore';

export const requiredFirebaseEnvKeys = [
  'VITE_FIREBASE_API_KEY',
  'VITE_FIREBASE_AUTH_DOMAIN',
  'VITE_FIREBASE_PROJECT_ID',
  'VITE_FIREBASE_STORAGE_BUCKET',
  'VITE_FIREBASE_MESSAGING_SENDER_ID',
  'VITE_FIREBASE_APP_ID',
] as const;

type FirebaseEnvKey = (typeof requiredFirebaseEnvKeys)[number];

const getFirebaseEnv = (key: FirebaseEnvKey) => import.meta.env[key]?.trim();

const placeholderPatterns = [
  /^your[_-]/i,
  /^VITE_FIREBASE_/i,
  /placeholder/i,
  /replace/i,
  /changeme/i,
];

const isPlaceholderValue = (value: string) =>
  placeholderPatterns.some((pattern) => pattern.test(value));

const missingKeys = requiredFirebaseEnvKeys.filter((key) => !getFirebaseEnv(key));
const placeholderKeys = requiredFirebaseEnvKeys.filter((key) => {
  const value = getFirebaseEnv(key);
  return Boolean(value && isPlaceholderValue(value));
});

const firebaseConfig = {
  apiKey: getFirebaseEnv('VITE_FIREBASE_API_KEY'),
  authDomain: getFirebaseEnv('VITE_FIREBASE_AUTH_DOMAIN'),
  projectId: getFirebaseEnv('VITE_FIREBASE_PROJECT_ID'),
  storageBucket: getFirebaseEnv('VITE_FIREBASE_STORAGE_BUCKET'),
  messagingSenderId: getFirebaseEnv('VITE_FIREBASE_MESSAGING_SENDER_ID'),
  appId: getFirebaseEnv('VITE_FIREBASE_APP_ID'),
};

let appInstance: FirebaseApp | null = null;
let authInstance: Auth | null = null;
let dbInstance: Firestore | null = null;
let initializationError: string | null = null;

if (missingKeys.length === 0 && placeholderKeys.length === 0) {
  try {
    appInstance = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
    authInstance = getAuth(appInstance);
    dbInstance = getFirestore(appInstance);
  } catch (error) {
    initializationError = error instanceof Error ? error.message : 'Firebase failed to initialize.';
  }
}

export const firebaseConfigStatus = {
  isConfigured: authInstance !== null && dbInstance !== null,
  requiredKeys: requiredFirebaseEnvKeys,
  missingKeys,
  placeholderKeys,
  initializationError,
};

export const app = appInstance;
export const auth = authInstance;
export const db = dbInstance;
