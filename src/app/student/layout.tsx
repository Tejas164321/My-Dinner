

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
    const { user, authLoading } = useAuth();
    const router = useRouter();
    const pathname = usePathname();

    useEffect(() => {
        if (authLoading) return; // Wait until auth state and user doc are fully loaded

        const isAuthPage = pathname.startsWith('/student/login') || pathname.startsWith('/student/signup');
        const isJoiningProcessPage = pathname.startsWith('/student/select-mess') || pathname.startsWith('/student/join-mess');
        const isStartMessPage = pathname.startsWith('/student/start-mess');

        // If no user is logged in, they must be on an auth page. If not, redirect them.
        if (!user) {
            if (!isAuthPage) {
                router.replace('/student/login');
            }
            return;
        }

        // --- From this point, we know the user is logged in ---
        
        // Redirect non-students away from student pages
        if (user.role !== 'student') {
             router.replace('/student/login'); // Or a more appropriate page
             return;
        }

        const isAffiliated = !!user.messId && (user.status === 'active' || user.status === 'suspended');
        const isPendingOrUnaffiliated = !user.messId || user.status === 'unaffiliated' || user.status === 'pending_approval';
        
        // Redirect logged-in students away from auth pages
        if (isAuthPage) {
            if (isAffiliated) router.replace('/student/dashboard');
            else router.replace('/student/select-mess');
            return;
        }
        
        // Redirect affiliated users away from joining pages
        if (isAffiliated && isJoiningProcessPage) {
            router.replace('/student/dashboard');
            return;
        }

        // Redirect pending/unaffiliated users away from protected dashboard pages
        if (isPendingOrUnaffiliated && !isJoiningProcessPage) {
            router.replace('/student/select-mess');
            return;
        }
        
    }, [user, authLoading, router, pathname]);
    
    // --- Render Logic ---
    if (authLoading) {
        return <StudentDashboardSkeleton />;
    }

    const isAuthPage = pathname.startsWith('/student/login') || pathname.startsWith('/student/signup');
    const isJoiningProcessPage = pathname.startsWith('/student/select-mess') || pathname.startsWith('/student/join-mess');
    const isAffiliated = user && user.role === 'student' && !!user.messId && !isAuthPage && !isJoiningProcessPage;

    if (isAffiliated) {
        // User is logged in, has a mess, and is on a protected dashboard page.
        const dashboardUser = {
            name: user.name || 'Student',
            role: 'student',
            email: user.email || '',
            avatarUrl: user.avatarUrl,
        };
        return (
            <DashboardLayout navItems={studentNavItems} user={dashboardUser}>
                {children}
            </DashboardLayout>
        );
    } else if (isAuthPage || isJoiningProcessPage) {
        // User is on a public page (login, signup) or a semi-protected page (select-mess).
        // Let these pages render themselves.
        return <>{children}</>;
    } else {
        // This is a transient state (e.g., waiting for useEffect to redirect).
        // Show a skeleton to prevent layout shifts or flashing content.
        return <StudentDashboardSkeleton />;
    }
}
