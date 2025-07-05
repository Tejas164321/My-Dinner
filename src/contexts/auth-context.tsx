'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { AppUser } from '@/lib/data';

interface AuthContextType {
  user: AppUser | null;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType>({ user: null, loading: true });

// A mock user for the student dashboard
const mockStudentUser: AppUser = {
  uid: '8', // Matches Alex Doe from studentData
  email: 'alex.doe@example.com',
  name: 'Alex Doe',
  role: 'student',
  studentId: 'A56789',
  contact: '+91 9876543214',
  joinDate: '2023-09-11',
  messPlan: 'full_day',
  avatarUrl: `https://i.pravatar.cc/150?u=8`,
};

// A mock user for the admin dashboard
const mockAdminUser: AppUser = {
    uid: 'admin-user-uid',
    email: 'admin@messo.com',
    name: 'Admin User',
    role: 'admin',
    avatarUrl: `https://i.pravatar.cc/150?u=admin`,
};


export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<AppUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // This check ensures we're on the client side before accessing window
    if (typeof window !== 'undefined') {
      if (window.location.pathname.startsWith('/admin')) {
        setUser(mockAdminUser);
      } else {
        setUser(mockStudentUser);
      }
      setLoading(false);
    }
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  return useContext(AuthContext);
};
