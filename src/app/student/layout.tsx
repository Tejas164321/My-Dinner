'use client';

import type { ReactNode } from 'react';
import { DashboardLayout } from '@/components/dashboard/layout';
import { studentNavItems } from '@/lib/data';

export default function StudentDashboardLayout({ children }: { children: ReactNode }) {
    // Since authentication is removed, we'll use a mock user.
  const handleLogout = async () => {
    // In a real app, this would clear the user session.
    // For now, it can just redirect to the home page.
    window.location.href = '/';
  };

  const dashboardUser = {
    name: 'Student User',
    role: 'Student',
    email: 'student@messo.com',
    avatarUrl: `https://avatar.vercel.sh/student.png`,
  };

  return (
    <DashboardLayout navItems={studentNavItems} user={dashboardUser} onLogout={handleLogout}>
      {children}
    </DashboardLayout>
  );
}
