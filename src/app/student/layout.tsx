

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

        // If no user is logged in, they must be on an auth page. If not, redirect them.
        if (!user) {
            if (!isAuthPage) {
                router.replace('/student/login');
            }
            return;
        }

        // At this point, the user is logged in.

        // If a logged-in user is on an auth page, redirect them away.
        if (isAuthPage) {
            if (user.status === 'active') {
                router.replace('/student/dashboard');
            } else {
                router.replace('/student/select-mess');
            }
            return;
        }

        // Handle routing for logged-in users who are NOT on an auth page.
        switch (user.status) {
            case 'active':
                // If an active user lands on a joining page, redirect them to their dashboard.
                if (isJoiningProcessPage) {
                    router.replace('/student/dashboard');
                }
                break;
            case 'unaffiliated':
            case 'pending_approval':
            case 'rejected':
                // If a non-active user lands anywhere OTHER than the joining pages, redirect them there.
                if (!isJoiningProcessPage) {
                    router.replace('/student/select-mess');
                }
                break;
            default:
                // Fallback for any other state is to go to the selection page.
                if (!isJoiningProcessPage) {
                    router.replace('/student/select-mess');
                }
                break;
        }
        
    }, [user, authLoading, router, pathname]);
    
    // --- Render Logic ---
    if (authLoading) {
        return <StudentDashboardSkeleton />;
    }

    const isAuthPage = pathname.startsWith('/student/login') || pathname.startsWith('/student/signup');
    const isDashboardArea = user && user.status === 'active' && !isAuthPage;

    if (isDashboardArea) {
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
    }
    
    // For all other cases (e.g., on login page, on select-mess page), just render the page's content.
    // The useEffect above handles the redirection logic, so we don't need complex conditions here.
    return <>{children}</>;
}
