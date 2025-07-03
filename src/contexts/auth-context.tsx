'use client';

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { onAuthStateChanged, User as FirebaseUser } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';
import { AppUser } from '@/lib/data';
import { usePathname } from 'next/navigation';

interface AuthContextType {
  user: AppUser | null;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType>({ user: null, loading: true });

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<AppUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // This effect can be commented out to fully disable Firebase auth,
    // and rely solely on the mock data in the useAuth hook below.
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser: FirebaseUser | null) => {
      if (firebaseUser) {
        // User is signed in, see docs for a list of available properties
        // https://firebase.google.com/docs/reference/js/firebase.User
        const userDocRef = doc(db, 'users', firebaseUser.uid);
        const userDocSnap = await getDoc(userDocRef);
        if (userDocSnap.exists()) {
            const userData = userDocSnap.data() as Omit<AppUser, 'uid' | 'email'>;
            setUser({ 
                uid: firebaseUser.uid, 
                email: firebaseUser.email!, 
                ...userData 
            });
        } else {
            // This case might happen if user document creation fails after signup
            console.error("No such user document!");
            setUser(null);
        }
      } else {
        // User is signed out
        setUser(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading }}>
      {children}
    </AuthContext.Provider>
  );
};


// --- Temporary Mocking for Testing ---
const mockStudentUser: AppUser = {
    uid: '8',
    email: 'alex.doe@example.com',
    name: 'Alex Doe',
    role: 'student',
    studentId: 'A56789',
    contact: '+91 9876543214',
    joinDate: '2023-09-11',
    messPlan: 'full_day',
    avatarUrl: `https://i.pravatar.cc/150?u=8`,
};

const mockAdminUser: AppUser = {
    uid: 'admin01',
    email: 'admin@messo.com',
    name: 'Admin User',
    role: 'admin',
    avatarUrl: 'https://i.pravatar.cc/150?u=admin01',
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  const pathname = usePathname();

  // TEMPORARY OVERRIDE: For easy testing without logging in.
  // If not loading and no user is found, provide a mock user based on the current path.
  if (!context.loading && !context.user) {
    if (pathname.startsWith('/admin')) {
      return { user: mockAdminUser, loading: false };
    }
    if (pathname.startsWith('/student')) {
      return { user: mockStudentUser, loading: false };
    }
  }

  return context;
};
