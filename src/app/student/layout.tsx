'use client';

import type { ReactNode } from 'react';
import { DashboardLayout } from '@/components/dashboard/layout';
import { studentNavItems } from '@/lib/data';
import { useAuth } from '@/contexts/auth-context';
import { Skeleton } from '@/components/ui/skeleton';

export default function StudentDashboardLayout({ children }: { children: ReactNode }) {
  const { user, loading } = useAuth();

  if (loading || !user) {
     return (
       <div className="flex h-screen w-full items-center justify-center">
            <div className="flex items-center space-x-4">
                <Skeleton className="h-12 w-12 rounded-full" />
                <div className="space-y-2">
                    <Skeleton className="h-4 w-[250px]" />
                    <Skeleton className="h-4 w-[200px]" />
                </div>
            </div>
        </div>
    );
  }

  // If we reach here, user is a valid student.
  const dashboardUser = {
    name: user.name || 'Student',
    role: 'Student',
    email: user.email || '',
    avatarUrl: user.avatarUrl,
  };
  
  return (
    <DashboardLayout navItems={studentNavItems} user={dashboardUser}>
      {children}
    </DashboardLayout>
  );
}
