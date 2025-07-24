
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
            return; // Wait until auth state is confirmed
        }

        const isAuthPage = pathname.startsWith('/admin/login') || pathname.startsWith('/admin/signup');

        // Case 1: User is a logged-in admin
        if (user && user.role === 'admin') {
            // If they are on an auth page, redirect them to the dashboard.
            if (isAuthPage) {
                router.replace('/admin/dashboard');
            }
            // Otherwise, they are on a protected page, so let them stay.
            return;
        }

        // Case 2: User is not an admin (logged out, or a different role)
        // If they are trying to access a protected page, redirect them to the login page.
        if (!isAuthPage) {
            router.replace('/admin/login');
        }
        // Otherwise, they are on an auth page, so let them stay.

    }, [user, loading, router, pathname]);

    // Render logic based on auth state
    if (loading) {
        return <AdminDashboardSkeleton />;
    }

    const isAuthPage = pathname.startsWith('/admin/login') || pathname.startsWith('/admin/signup');

    // If a user is a logged-in admin and on a protected page, render the dashboard.
    if (user && user.role === 'admin' && !isAuthPage) {
        const dashboardUser = {
            name: user?.name || 'Admin',
            role: user.role,
            email: user?.email || '',
            avatarUrl: user?.avatarUrl,
        };
        
        return (
            <DashboardLayout navItems={adminNavItems} user={dashboardUser}>
                {children}
            </DashboardLayout>
        );
    }
    
    // If we are on an auth page, and the logic has reached this point,
    // it means the user is not a logged-in admin, so we should show the auth page.
    if (isAuthPage) {
        return <>{children}</>;
    }
    
    // In all other transient cases (e.g., waiting for a redirect), show a skeleton.
    return <AdminDashboardSkeleton />;
}

    