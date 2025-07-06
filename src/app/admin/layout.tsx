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
    // Don't do anything while auth state is loading
    if (loading) {
      return;
    }

    const isUserAdmin = user?.role === 'admin';

    // If user is on a public page (login/signup)
    if (isPublicPage) {
      // and they are already logged in as an admin, redirect to dashboard
      if (isUserAdmin) {
        router.replace('/admin');
      }
    } 
    // If user is on a protected page
    else {
      // and they are not an admin, redirect to login
      if (!isUserAdmin) {
        router.replace('/admin/login');
      }
    }
  }, [user, loading, router, isPublicPage, pathname]);

  // While loading auth state, show a skeleton loader for all admin pages.
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

  // If we are on a public page AND not yet authenticated as an admin, render the public page.
  // The useEffect handles redirecting away if we become authenticated.
  if (isPublicPage && user?.role !== 'admin') {
    return <>{children}</>;
  }

  // If we are on a protected page, but the user is not an admin, we show a loader
  // while the useEffect redirects them. This prevents a flash of unstyled content.
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
  
  // If all checks pass, we are on a protected page with a valid admin user.
  // Render the protected dashboard layout.
  const handleLogout = async () => {
    await logout();
    router.push('/');
  };

  // This check is needed because user can be null here briefly during redirect.
  if (!user) {
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
