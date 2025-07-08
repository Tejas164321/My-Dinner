
'use client';

import type { ReactNode } from 'react';
import { useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { DashboardLayout } from '@/components/dashboard/layout';
import { adminNavItems } from '@/lib/data';
import { useAuth } from '@/contexts/auth-context';
import { logout } from '@/app/auth/actions';
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
            return; // Wait until the auth state is confirmed
        }

        const isAuthPage = pathname.startsWith('/admin/login') || pathname.startsWith('/admin/signup');

        // Case 1: User is not logged in or is not an admin.
        if (!user || user.role !== 'admin') {
            // If they are trying to access a protected page, redirect them to login.
            if (!isAuthPage) {
                router.replace('/admin/login');
            }
            // If they are already on an auth page, let them stay.
            return;
        }

        // Case 2: An admin user is logged in.
        if (user && user.role === 'admin') {
            // If they are on a login/signup page, they shouldn't be. Redirect to the dashboard.
            if (isAuthPage) {
                router.replace('/admin/dashboard');
            }
        }
    }, [user, loading, router, pathname]);
    
    // While loading or routing, show a skeleton to prevent content flicker.
    if (loading) {
        return <AdminDashboardSkeleton />;
    }

    // Determine what to render based on user and page
    const isAuthPage = pathname.startsWith('/admin/login') || pathname.startsWith('/admin/signup');
    
    // If not logged in AND on an auth page, render the auth page (children)
    if (!user && isAuthPage) {
        return <>{children}</>;
    }
    
    // If logged in as admin AND on a protected page, render the dashboard
    if (user && user.role === 'admin' && !isAuthPage) {
        const handleLogout = async () => {
            await logout();
            router.push('/');
        };
        
        const dashboardUser = {
            name: user?.name || 'Admin',
            role: user?.messName || 'Mess Manager',
            email: user?.email || '',
            avatarUrl: user?.avatarUrl,
        };
        
        return (
            <DashboardLayout navItems={adminNavItems} user={dashboardUser} onLogout={handleLogout}>
                {children}
            </DashboardLayout>
        );
    }
    
    // Fallback: show skeleton while routing logic determines the correct view.
    return <AdminDashboardSkeleton />;
}

    