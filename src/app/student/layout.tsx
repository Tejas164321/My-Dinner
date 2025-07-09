
'use client';

import type { ReactNode } from 'react';
import React, { useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { DashboardLayout } from '@/components/dashboard/layout';
import { studentNavItems } from '@/lib/data';
import { useAuth } from '@/contexts/auth-context';
import { Skeleton } from '@/components/ui/skeleton';

function StudentDashboardSkeleton() {
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

export default function StudentDashboardLayout({ children }: { children: ReactNode }) {
    const { user, loading } = useAuth();
    const router = useRouter();
    const pathname = usePathname();

    useEffect(() => {
        if (loading) {
            return; // Wait until auth state is confirmed
        }

        const isAuthPage = pathname.startsWith('/student/login') || pathname.startsWith('/student/signup');
        const isJoiningProcessPage = pathname.startsWith('/student/select-mess') || pathname.startsWith('/student/join-mess');

        // Case 1: User is NOT logged in
        if (!user) {
            if (!isAuthPage) {
                router.replace('/student/login');
            }
            return;
        }

        // --- From this point, we know the user is logged in ---
        
        // Case 2: A logged-in user is on an auth page (login/signup). Redirect them away.
        if (isAuthPage) {
            if (user.status === 'unaffiliated' || user.status === 'pending_approval') {
                router.replace('/student/select-mess');
            } else {
                router.replace('/student/dashboard');
            }
            return;
        }
        
        // Case 3: An affiliated (active/suspended) user tries to access a joining page.
        if ((user.status === 'active' || user.status === 'suspended') && isJoiningProcessPage) {
            router.replace('/student/dashboard');
            return;
        }

        // Case 4: An unaffiliated or pending user tries to access a protected dashboard page.
        if ((user.status === 'unaffiliated' || user.status === 'pending_approval') && !isJoiningProcessPage) {
            router.replace('/student/select-mess');
            return;
        }
        
    }, [user, loading, router, pathname]);
    
    // While loading, always show a skeleton to prevent any flash of incorrect content.
    if (loading) {
        return <StudentDashboardSkeleton />;
    }

    const isAuthPage = pathname.startsWith('/student/login') || pathname.startsWith('/student/signup');
    const isJoiningProcessPage = pathname.startsWith('/student/select-mess') || pathname.startsWith('/student/join-mess');

    // If there is no user and we are on an auth page, render the auth page.
    if (!user && isAuthPage) {
        return <>{children}</>;
    }
    
    // If the user is in the joining process and on a joining page, render it.
    if (user && (user.status === 'unaffiliated' || user.status === 'pending_approval') && isJoiningProcessPage) {
        return <>{children}</>;
    }
    
    // If the user is fully active/suspended and on a protected dashboard page, render the full layout.
    if (user && (user.status === 'active' || user.status === 'suspended') && !isAuthPage && !isJoiningProcessPage) {
        const dashboardUser = {
            name: user?.name || 'Student',
            role: user?.messName || 'Student',
            email: user?.email || '',
            avatarUrl: user?.avatarUrl,
        };
        return (
            <DashboardLayout navItems={studentNavItems} user={dashboardUser}>
                {children}
            </DashboardLayout>
        );
    }

    // In all other cases (e.g., a logged-in user on an auth page who is about to be redirected),
    // show a skeleton to prevent flashing the login page.
    return <StudentDashboardSkeleton />;
}
