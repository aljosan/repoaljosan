import React, { createContext, useCallback, useEffect, useMemo, useState } from 'react';
import { User } from 'firebase/auth';
import { UserProfile } from '../types/models';
import { fetchUserProfile, listenForAuthChanges, loginWithEmail, logout } from '../services/auth';
import { firebaseConfigStatus, isMockAuthEnabled } from '../services/firebase';

interface AuthContextValue {
  user: User | null;
  profile: UserProfile | null;
  isLoading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextValue | undefined>(undefined);

const FirebaseConfigScreen = () => (
  <main className="min-h-screen bg-slate-950 px-6 py-12 text-slate-100">
    <section className="mx-auto max-w-2xl rounded border border-slate-700 bg-slate-900 p-6 shadow-xl">
      <p className="text-sm font-semibold uppercase tracking-wide text-emerald-300">KTK Connect</p>
      <h1 className="mt-3 text-2xl font-bold">Firebase configuration required</h1>
      <p className="mt-3 text-slate-300">
        The app is running, but Firebase was not initialized because the local environment variables
        are missing, placeholders, or invalid.
      </p>

      <div className="mt-6 space-y-4 text-sm text-slate-300">
        <p>
          Create <code className="rounded bg-slate-800 px-1 py-0.5">.env.local</code> from{' '}
          <code className="rounded bg-slate-800 px-1 py-0.5">.env.example</code>, add the real
          Firebase web app values, and restart the Vite dev server. For local UI inspection without
          Firebase, set <code className="rounded bg-slate-800 px-1 py-0.5">VITE_USE_MOCK_AUTH=true</code>.
        </p>

        {firebaseConfigStatus.missingKeys.length > 0 && (
          <div>
            <p className="font-semibold text-slate-100">Missing variables</p>
            <p className="mt-1 font-mono text-xs text-amber-200">
              {firebaseConfigStatus.missingKeys.join(', ')}
            </p>
          </div>
        )}

        {firebaseConfigStatus.placeholderKeys.length > 0 && (
          <div>
            <p className="font-semibold text-slate-100">Placeholder variables</p>
            <p className="mt-1 font-mono text-xs text-amber-200">
              {firebaseConfigStatus.placeholderKeys.join(', ')}
            </p>
          </div>
        )}

        {firebaseConfigStatus.initializationError && (
          <div>
            <p className="font-semibold text-slate-100">Firebase error</p>
            <p className="mt-1 font-mono text-xs text-rose-200">
              {firebaseConfigStatus.initializationError}
            </p>
          </div>
        )}
      </div>
    </section>
  </main>
);

// Auth context isolates Firebase concerns from the rest of the UI layer.
export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const isAuthAvailable = firebaseConfigStatus.isConfigured || isMockAuthEnabled;

  const handleAuthChange = useCallback(async (nextUser: User | null) => {
    setUser(nextUser);
    if (nextUser) {
      const nextProfile = await fetchUserProfile(nextUser.uid);
      setProfile(nextProfile);
    } else {
      setProfile(null);
    }
    setIsLoading(false);
  }, []);

  useEffect(() => {
    if (!isAuthAvailable) {
      setIsLoading(false);
      return undefined;
    }

    const unsubscribe = listenForAuthChanges(handleAuthChange);
    return () => unsubscribe();
  }, [handleAuthChange, isAuthAvailable]);

  const signIn = useCallback(async (email: string, password: string) => {
    setIsLoading(true);
    const nextUser = await loginWithEmail(email, password);
    if (isMockAuthEnabled) {
      await handleAuthChange(nextUser);
    }
  }, [handleAuthChange]);

  const signOut = useCallback(async () => {
    setIsLoading(true);
    await logout();
    if (isMockAuthEnabled) {
      await handleAuthChange(null);
    }
  }, [handleAuthChange]);

  const value = useMemo(
    () => ({
      user,
      profile,
      isLoading,
      signIn,
      signOut,
    }),
    [user, profile, isLoading, signIn, signOut]
  );

  if (!isAuthAvailable) {
    return <FirebaseConfigScreen />;
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
