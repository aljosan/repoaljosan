import {
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  User,
} from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from './firebase';
import { UserProfile } from '../types/models';

const requireAuth = () => {
  if (!auth) {
    throw new Error('Firebase Auth is not configured. Check VITE_FIREBASE_* environment variables.');
  }
  return auth;
};

const requireDb = () => {
  if (!db) {
    throw new Error('Firestore is not configured. Check VITE_FIREBASE_* environment variables.');
  }
  return db;
};

export const listenForAuthChanges = (onChange: (user: User | null) => void) => {
  if (!auth) {
    Promise.resolve().then(() => onChange(null));
    return () => undefined;
  }

  return onAuthStateChanged(auth, onChange);
};

export const loginWithEmail = async (email: string, password: string) => {
  const result = await signInWithEmailAndPassword(requireAuth(), email, password);
  return result.user;
};

export const logout = async () => {
  await signOut(requireAuth());
};

export const fetchUserProfile = async (uid: string) => {
  const snapshot = await getDoc(doc(requireDb(), 'users', uid));
  if (!snapshot.exists()) {
    return null;
  }
  return snapshot.data() as UserProfile;
};
