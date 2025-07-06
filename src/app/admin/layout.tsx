'use client';

import type { ReactNode } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useEffect } from 'react';
import { DashboardLayout } from '@/components/dashboard/layout';
import { adminNavItems } from '@/lib/data';
import { useAuth } from '@/contexts/auth-context';
import { Skeleton } from '@/components/ui/skeleton';
import { logout } from '@/app/auth/actions';

export default function AdminDashboardLayout({ children }: { children: ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  const isPublicPage = pathname === '/admin/login' || pathname === '/admin/signup';

  useEffect(() => {
    if (loading) {
      return; // Wait for the auth state to be determined
    }

    // This is the layout's primary job: if we are on a protected page
    // and the user is not an admin, redirect them to the login page.
    if (!isPublicPage && (!user || user.role !== 'admin')) {
      router.replace('/admin/login');
    }
  }, [user, loading, router, isPublicPage, pathname]);

  // Show a loader while auth is initializing or if we're on a protected page
  // without a valid user. This covers the brief moment before a redirect occurs.
  if (loading || (!isPublicPage && (!user || user.role !== 'admin'))) {
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
  
  // If we are on a public page (login/signup), render it.
  // The page itself is now responsible for redirecting if the user is already logged in.
  if (isPublicPage) {
    return <>{children}</>;
  }

  // If all checks pass, we are on a protected page with a valid admin user.
  // Render the protected dashboard layout.
  const handleLogout = async () => {
    await logout();
    router.push('/');
  }

  const dashboardUser = {
    name: user.name || 'Admin',
    role: 'Mess Manager',
    email: user.email || '',
    avatarUrl: user.avatarUrl,
  };

  return (
    <DashboardLayout navItems={adminNavItems} user={dashboardUser} onLogout={handleLogout}>
      {children}
    </DashboardLayout>
  );
}
