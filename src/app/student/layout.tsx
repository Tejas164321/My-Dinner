
'use client';

import type { ReactNode } from 'react';
import React, { useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { DashboardLayout } from '@/components/dashboard/layout';
import { studentNavItems } from '@/lib/data';
import { useAuth } from '@/contexts/auth-context';
import { logout } from '@/app/auth/actions';
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
        
        // Case 2: A logged-in user is on an auth page.
        if (isAuthPage) {
            if (user.status === 'unaffiliated' || user.status === 'pending_approval') {
                router.replace('/student/select-mess');
            } else {
                router.replace('/student/dashboard');
            }
            return;
        }
        
        // Case 3: An affiliated (active/suspended) user is on a joining page.
        if ((user.status === 'active' || user.status === 'suspended') && isJoiningProcessPage) {
            router.replace('/student/dashboard');
            return;
        }

        // Case 4: An unaffiliated or pending user is on a protected page.
        if ((user.status === 'unaffiliated' || user.status === 'pending_approval') && !isJoiningProcessPage) {
            router.replace('/student/select-mess');
            return;
        }
        
    }, [user, loading, router, pathname]);
    
    const handleLogout = async () => {
        await logout();
        router.push('/');
    };

    if (loading) {
        return <StudentDashboardSkeleton />;
    }

    if (!user) {
        return <>{children}</>;
    }
    
    // User is logged in, decide what to show based on their status
    switch (user.status) {
        case 'unaffiliated':
        case 'pending_approval':
            // These users should be interacting with the joining pages.
            // The useEffect above ensures they are on the correct pages.
            return <>{children}</>;
        
        case 'active':
        case 'suspended':
            // Show the full dashboard for active and suspended users.
            const dashboardUser = {
                name: user?.name || 'Student',
                role: user?.messName || 'Student',
                email: user?.email || '',
                avatarUrl: user?.avatarUrl,
            };
            return (
                <DashboardLayout navItems={studentNavItems} user={dashboardUser} onLogout={handleLogout}>
                    {children}
                </DashboardLayout>
            );

        default:
             // Fallback for any unexpected status.
            return <StudentDashboardSkeleton />;
    }
}
