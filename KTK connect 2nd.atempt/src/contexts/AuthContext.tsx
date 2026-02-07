import React, { createContext, useCallback, useEffect, useMemo, useState } from 'react';
import { User } from 'firebase/auth';
import { UserProfile } from '../types/models';
import { fetchUserProfile, listenForAuthChanges, loginWithEmail, logout } from '../services/auth';

interface AuthContextValue {
  user: User | null;
  profile: UserProfile | null;
  isLoading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextValue | undefined>(undefined);

// Auth context isolates Firebase concerns from the rest of the UI layer.
export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

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
    const unsubscribe = listenForAuthChanges(handleAuthChange);
    return () => unsubscribe();
  }, [handleAuthChange]);

  const signIn = useCallback(async (email: string, password: string) => {
    setIsLoading(true);
    await loginWithEmail(email, password);
  }, []);

  const signOut = useCallback(async () => {
    setIsLoading(true);
    await logout();
  }, []);

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

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
