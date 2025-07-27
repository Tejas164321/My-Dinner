
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
        const isStartMessPage = pathname.startsWith('/student/start-mess');

        // Case 1: User is NOT logged in
        if (!user) {
            if (!isAuthPage) {
                router.replace('/student/login');
            }
            return;
        }

        // --- From this point, we know the user is logged in ---
        
        // Redirect non-students away from student pages
        if (user.role !== 'student') {
             router.replace('/student/login');
             return;
        }

        // Redirect logged-in students away from auth pages
        if (isAuthPage) {
            if (user.status === 'unaffiliated' || user.status === 'pending_approval') {
                router.replace('/student/select-mess');
            } else if (user.status === 'pending_start') {
                router.replace('/student/start-mess');
            } else {
                router.replace('/student/dashboard');
            }
            return;
        }
        
        // Handle routing based on status
        switch (user.status) {
            case 'active':
            case 'suspended':
                // Affiliated user, should be on dashboard pages
                if (isJoiningProcessPage || isStartMessPage) {
                    router.replace('/student/dashboard');
                }
                break;
            case 'pending_start':
                 // User needs to set their start date
                if (!isStartMessPage) {
                    router.replace('/student/start-mess');
                }
                break;
            case 'pending_approval':
            case 'unaffiliated':
                // User needs to join a mess
                if (!isJoiningProcessPage) {
                    router.replace('/student/select-mess');
                }
                break;
        }
        
    }, [user, loading, router, pathname]);
    
    // Render logic
    if (loading) {
        return <StudentDashboardSkeleton />;
    }

    const isAuthPage = pathname.startsWith('/student/login') || pathname.startsWith('/student/signup');
    const isProtectedDashboard = !isAuthPage && !pathname.startsWith('/student/select-mess') && !pathname.startsWith('/student/join-mess') && !pathname.startsWith('/student/start-mess');

    // If a logged-in student is on a protected dashboard page, show the layout
    if (user && user.role === 'student' && (user.status === 'active' || user.status === 'suspended') && isProtectedDashboard) {
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
    
    // If the user is on an auth page, or in the joining/starting process, just render the page content
    if (isAuthPage || (user && (user.status === 'unaffiliated' || user.status === 'pending_approval' || user.status === 'pending_start'))) {
        return <>{children}</>;
    }

    // In all other transient cases (e.g., waiting for a redirect), show a skeleton.
    return <StudentDashboardSkeleton />;
}
