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

    if (isPublicPage) {
      // If on a public page (login/signup) and we are logged in as an admin, redirect to dashboard
      if (user?.role === 'admin') {
        router.replace('/admin');
      }
    } else {
      // If on a protected page and we are NOT logged in as an admin, redirect to login
      if (user?.role !== 'admin') {
        router.replace('/admin/login');
      }
    }
  }, [user, loading, router, isPublicPage, pathname]);

  // While loading auth state, show a skeleton loader.
  if (loading) {
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

  // If on a public page and not yet an authenticated admin, render the public page.
  // The useEffect handles redirecting away if/when we become authenticated.
  if (isPublicPage && user?.role !== 'admin') {
    return <>{children}</>;
  }

  // If on a protected page, but we don't have a valid admin user, show a loader.
  // The useEffect will handle the redirect, this prevents a flash of content.
  if (!isPublicPage && user?.role !== 'admin') {
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
  
  // If all checks pass, we must be on a protected page with a valid admin user.
  if (!user) {
    // This case should ideally not be hit if the logic above is correct, but it's a good safeguard.
    return null;
  }

  const handleLogout = async () => {
    await logout();
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
