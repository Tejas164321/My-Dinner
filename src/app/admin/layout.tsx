
'use client';

import type { ReactNode } from 'react';
import { useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { DashboardLayout } from '@/components/dashboard/layout';
import { adminNavItems } from '@/lib/data';
import { useAuth } from '@/contexts/auth-context';
import { Skeleton } from '@/components/ui/skeleton';

function AdminDashboardSkeleton() {
    return (
        <div className="flex h-screen w-full bg-background">
            <div className="hidden md:flex flex-col border-r w-64">
                <div className="h-16 border-b p-4"><Skeleton className="h-8 w-32" /></div>
                <div className="p-2 border-b"><Skeleton className="h-12 w-full rounded-lg" /></div>
                <div className="p-4 space-y-3">
                    <Skeleton className="h-10 w-full" />
                    <Skeleton className="h-10 w-full" />
                    <Skeleton className="h-10 w-full" />
                    <Skeleton className="h-10 w-full" />
                </div>
            </div>
            <div className="flex-1 p-8">
                 <Skeleton className="h-8 w-64 mb-8" />
                 <Skeleton className="h-96 w-full" />
            </div>
        </div>
    )
}

export default function AdminDashboardLayout({ children }: { children: ReactNode }) {
    const { user, loading } = useAuth();
    const router = useRouter();
    const pathname = usePathname();

    useEffect(() => {
        if (loading) {
            return; // Wait until the auth state is confirmed before making routing decisions.
        }

        const isAuthPage = pathname.startsWith('/admin/login') || pathname.startsWith('/admin/signup');

        // If the user is not logged in or is not an admin...
        if (!user || user.role !== 'admin') {
            // and they are trying to access a protected page...
            if (!isAuthPage) {
                // redirect them to the login page.
                router.replace('/admin/login');
            }
            // Otherwise, they are on the login/signup page, so let them stay.
            return;
        }

        // If the user *is* a logged-in admin...
        if (isAuthPage) {
            // and they are on a login/signup page, they shouldn't be. Redirect to the dashboard.
            router.replace('/admin/dashboard');
        }
    }, [user, loading, router, pathname]);
    
    // While loading, always show a skeleton to prevent any flash of incorrect content.
    if (loading) {
        return <AdminDashboardSkeleton />;
    }

    const isAuthPage = pathname.startsWith('/admin/login') || pathname.startsWith('/admin/signup');

    // If a user is logged in as an admin and on a protected page, render the dashboard.
    if (user && user.role === 'admin' && !isAuthPage) {
        const dashboardUser = {
            name: user?.name || 'Admin',
            role: user?.messName || 'Mess Manager',
            email: user?.email || '',
            avatarUrl: user?.avatarUrl,
        };
        
        return (
            <DashboardLayout navItems={adminNavItems} user={dashboardUser}>
                {children}
            </DashboardLayout>
        );
    }
    
    // If there is no user and we are on an auth page, render the auth page (login/signup).
    if (!user && isAuthPage) {
        return <>{children}</>;
    }
    
    // In all other cases (e.g., a logged-in user on an auth page who is about to be redirected),
    // show a skeleton to prevent flashing the login page.
    return <AdminDashboardSkeleton />;
}
