

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
        
        // Redirect logged-in students away from auth pages
        if (isAuthPage) {
            if (user.status === 'active') router.replace('/student/dashboard');
            else router.replace('/student/select-mess');
            return;
        }
        
        // Handle routing based on student status for pages that are NOT auth pages
        switch (user.status) {
            case 'active':
                if (isJoiningProcessPage || isStartMessPage) router.replace('/student/dashboard');
                break;
            case 'pending_start':
                 if (!isStartMessPage) router.replace('/student/start-mess');
                break;
            case 'unaffiliated':
            case 'pending_approval':
            case 'rejected':
            case 'suspended':
            case 'left':
                // If a user in any of these states is not on a joining page, redirect them.
                if (!isJoiningProcessPage) {
                    router.replace('/student/select-mess');
                }
                break;
            default:
                // Fallback for any other state
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
    const isJoiningProcessPage = pathname.startsWith('/student/select-mess') || pathname.startsWith('/student/join-mess');
    const isStartMessPage = pathname.startsWith('/student/start-mess');
    const isDashboardArea = user && user.role === 'student' && user.status === 'active' && !isAuthPage && !isJoiningProcessPage && !isStartMessPage;

    if (isDashboardArea) {
        // User is logged in, active, and on a protected dashboard page.
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
    
    // For all other valid cases (login, signup, select-mess, start-mess), just render the page's content.
    // The useEffect above handles all redirection logic. If we reach here, the user is on a page they are allowed to see.
    if (isAuthPage || isJoiningProcessPage || isStartMessPage) {
        return <>{children}</>;
    }
    
    // This is a transient state (e.g., waiting for useEffect to redirect).
    return <StudentDashboardSkeleton />;
}
