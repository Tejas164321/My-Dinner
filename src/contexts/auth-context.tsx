
'use client';

import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { onAuthStateChanged, type User as FirebaseUser } from 'firebase/auth';
import { doc, onSnapshot } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';
import type { AppUser } from '@/lib/data';

interface AuthContextType {
  user: AppUser | null;
  authLoading: boolean; // Renamed for clarity
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  authLoading: true,
});

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<AppUser | null>(null);
  const [authLoading, setAuthLoading] = useState(true);

  useEffect(() => {
    let userDocUnsubscribe: (() => void) | undefined;

    const authUnsubscribe = onAuthStateChanged(auth, (firebaseUser: FirebaseUser | null) => {
      // Clean up previous user document listener if it exists
      if (userDocUnsubscribe) {
        userDocUnsubscribe();
      }
      
      setUser(null); // Explicitly set user to null while checking
      setAuthLoading(true); // Always set loading to true when auth state changes

      if (firebaseUser) {
        const userDocRef = doc(db, 'users', firebaseUser.uid);
        userDocUnsubscribe = onSnapshot(userDocRef, (docSnap) => {
          if (docSnap.exists()) {
            setUser({ uid: docSnap.id, ...docSnap.data() } as AppUser);
          } else {
            // User might be in Auth but not Firestore (e.g., deleted from DB but not Auth)
            setUser(null);
          }
          // Only set loading to false after we have user doc info
          setAuthLoading(false);
        }, (error) => {
          console.error("Error with user document snapshot:", error);
          setUser(null);
          setAuthLoading(false);
        });
      } else {
        // User is signed out, no need to fetch from Firestore
        setUser(null);
        setAuthLoading(false);
      }
    });

    // Cleanup function
    return () => {
      authUnsubscribe();
      if (userDocUnsubscribe) {
        userDocUnsubscribe();
      }
    };
  }, []);

  return (
    <AuthContext.Provider value={{ user, authLoading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
