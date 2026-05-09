import {
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  User,
} from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db, isMockAuthEnabled } from './firebase';
import { UserProfile } from '../types/models';

const mockUser = {
  uid: 'local-mock-admin',
  email: 'mock.admin@ktk.local',
  displayName: 'Local Admin',
  emailVerified: true,
  isAnonymous: false,
  phoneNumber: null,
  photoURL: null,
  providerId: 'mock',
  providerData: [],
  metadata: {},
  refreshToken: 'mock-refresh-token',
  tenantId: null,
  delete: async () => undefined,
  getIdToken: async () => 'mock-id-token',
  getIdTokenResult: async () => ({
    authTime: new Date().toISOString(),
    expirationTime: new Date(Date.now() + 60 * 60 * 1000).toISOString(),
    issuedAtTime: new Date().toISOString(),
    signInProvider: 'mock',
    signInSecondFactor: null,
    token: 'mock-id-token',
    claims: {},
  }),
  reload: async () => undefined,
  toJSON: () => ({ uid: 'local-mock-admin', email: 'mock.admin@ktk.local' }),
} as User;

const mockUserProfile: UserProfile = {
  id: 'local-mock-admin',
  email: 'mock.admin@ktk.local',
  displayName: 'Local Admin',
  role: 'admin',
  coachGroupIds: ['group-1', 'group-2'],
  linkedPlayerIds: [],
  createdAt: new Date(0).toISOString(),
};

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
  if (isMockAuthEnabled) {
    Promise.resolve().then(() => onChange(mockUser));
    return () => undefined;
  }

  if (!auth) {
    Promise.resolve().then(() => onChange(null));
    return () => undefined;
  }

  return onAuthStateChanged(auth, onChange);
};

export const loginWithEmail = async (email: string, password: string) => {
  if (isMockAuthEnabled) {
    return mockUser;
  }

  const result = await signInWithEmailAndPassword(requireAuth(), email, password);
  return result.user;
};

export const logout = async () => {
  if (isMockAuthEnabled) {
    return;
  }

  await signOut(requireAuth());
};

export const fetchUserProfile = async (uid: string) => {
  if (isMockAuthEnabled) {
    return uid === mockUser.uid ? mockUserProfile : null;
  }

  const snapshot = await getDoc(doc(requireDb(), 'users', uid));
  if (!snapshot.exists()) {
    return null;
  }
  return snapshot.data() as UserProfile;
};
