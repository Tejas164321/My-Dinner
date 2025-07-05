'use client';

import type { ReactNode } from 'react';
import { useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { DashboardLayout } from '@/components/dashboard/layout';
import { adminNavItems } from '@/lib/data';
import { useAuth } from '@/contexts/auth-context';
import { Skeleton } from '@/components/ui/skeleton';

export default function AdminDashboardLayout({ children }: { children: ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  // Public-facing pages that shouldn't have the dashboard layout
  if (pathname === '/admin/login' || pathname === '/admin/signup') {
    return <>{children}</>;
  }

  // Use useEffect to handle redirection based on auth state
  useEffect(() => {
    // Only redirect once loading is complete and we have a definitive user state
    if (!loading && (!user || user.role !== 'admin')) {
      router.replace('/admin/login');
    }
  }, [user, loading, router]);


  // While loading or if the user is not a valid admin, show a loading screen.
  // The useEffect hook will handle the actual redirection.
  if (loading || !user || user.role !== 'admin') {
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

  // If we reach here, the user is authenticated and is an admin.
  const dashboardUser = {
    name: user.name || 'Admin',
    role: 'Mess Manager',
    email: user.email || '',
    avatarUrl: user.avatarUrl,
  };

  return (
    <DashboardLayout navItems={adminNavItems} user={dashboardUser}>
      {children}
    </DashboardLayout>
  );
}
