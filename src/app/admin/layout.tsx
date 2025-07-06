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
      return; // Wait for auth state to load
    }
    
    // Scenario 1: User IS an admin, but is on a public page (login/signup)
    // Action: Redirect them to the main admin dashboard.
    if (user?.role === 'admin' && isPublicPage) {
      router.replace('/admin');
      return;
    }
    
    // Scenario 2: User is NOT an admin (or not logged in), and is trying to access a protected page
    // Action: Redirect them to the login page.
    if (user?.role !== 'admin' && !isPublicPage) {
      router.replace('/admin/login');
      return;
    }

  }, [user, loading, router, isPublicPage, pathname]);


  // While loading, or if a redirect is in progress, show a skeleton UI.
  // This prevents flashing content.
  if (loading || (!isPublicPage && user?.role !== 'admin')) {
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

  // If on a public page (and not an admin, which is handled by the redirect above), render it directly.
  if (isPublicPage) {
    return <>{children}</>;
  }
  
  // If all checks pass, we have a valid admin on a protected page.
  const handleLogout = async () => {
    await logout();
    // After logout, onAuthStateChanged will trigger in the AuthContext,
    // which will cause this layout's useEffect to run and redirect to the login page.
    router.push('/');
  };

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
