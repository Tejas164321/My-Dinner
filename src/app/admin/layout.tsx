
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
        if (!loading) {
            const isAdminPage = pathname.startsWith('/admin');
            const isAuthPage = pathname === '/admin/login' || pathname === '/admin/signup';

            // If not an admin user, redirect to login page.
            if (isAdminPage && !isAuthPage && (!user || user.role !== 'admin')) {
                router.replace('/admin/login');
            }

            // If an admin user is on an auth page, redirect to the dashboard.
            if (isAuthPage && user && user.role === 'admin') {
                router.replace('/admin/dashboard');
            }
        }
    }, [user, loading, router, pathname]);
    
    // While loading, or if the user is not a verified admin yet (and not on an auth page),
    // show a loading state to prevent flickering of content they shouldn't see.
    if ((loading || !user) && !pathname.startsWith('/admin/login') && !pathname.startsWith('/admin/signup')) {
        return <AdminDashboardSkeleton />;
    }

    // On login/signup pages, render the children directly without the full dashboard layout.
    if (pathname.startsWith('/admin/login') || pathname.startsWith('/admin/signup')) {
        return <>{children}</>;
    }

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
