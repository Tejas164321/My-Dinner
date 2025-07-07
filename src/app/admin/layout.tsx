'use client';

import type { ReactNode } from 'react';
import { DashboardLayout } from '@/components/dashboard/layout';
import { adminNavItems } from '@/lib/data';

export default function AdminDashboardLayout({ children }: { children: ReactNode }) {
  // Since authentication is removed, we'll use a mock user.
  const handleLogout = async () => {
    // In a real app, this would clear the user session.
    // For now, it can just redirect to the home page.
    window.location.href = '/';
  };

  const dashboardUser = {
    name: 'Admin User',
    role: 'Mess Manager',
    email: 'admin@messo.com',
    avatarUrl: `https://avatar.vercel.sh/admin.png`,
  };

  return (
    <DashboardLayout navItems={adminNavItems} user={dashboardUser} onLogout={handleLogout}>
      {children}
    </DashboardLayout>
  );
}
