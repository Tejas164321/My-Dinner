
'use client';

import type { ReactNode } from 'react';
import React, { useEffect, useTransition } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { DashboardLayout } from '@/components/dashboard/layout';
import { studentNavItems } from '@/lib/data';
import { useAuth } from '@/contexts/auth-context';
import { logout, cancelJoinRequest } from '@/app/auth/actions';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

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

function PendingApprovalScreen({ onLogout }: { onLogout: () => void }) {
    const { user } = useAuth();
    const { toast } = useToast();
    const [isCancelling, startTransition] = useTransition();

    const handleCancel = () => {
        if (!user) return;
        startTransition(async () => {
            const result = await cancelJoinRequest(user.uid);
            if (result.success) {
                toast({ title: 'Request Cancelled', description: 'You can now join a different mess.' });
            } else {
                toast({ variant: 'destructive', title: 'Error', description: result.error });
            }
        });
    };

    return (
        <main className="flex min-h-screen flex-col items-center justify-center p-4">
            <Card className="max-w-md text-center">
                <CardHeader>
                    <CardTitle>Request Sent!</CardTitle>
                    <CardDescription>Your request to join the mess is pending approval from the admin. Please check back later.</CardDescription>
                </CardHeader>
                <CardContent className="flex flex-col sm:flex-row gap-2 justify-center">
                    <Button onClick={handleCancel} variant="destructive" disabled={isCancelling} className="w-full sm:w-auto">
                        {isCancelling && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        {isCancelling ? 'Cancelling...' : 'Cancel Request'}
                    </Button>
                    <Button onClick={onLogout} variant="outline" className="w-full sm:w-auto">Log Out</Button>
                </CardContent>
            </Card>
        </main>
    );
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
            // If the user is not logged in and not on an auth page, redirect them.
            if (!isAuthPage) {
                router.replace('/student/login');
            }
            return; // Stop further checks for non-logged-in users.
        }

        // --- From this point, we know the user is logged in ---
        
        // Case 2: A logged-in user is on an auth page. They should be redirected.
        if (isAuthPage) {
            if (user.status === 'unaffiliated') {
                router.replace('/student/select-mess');
            } else {
                router.replace('/student/dashboard');
            }
            return;
        }

        // Case 3: An unaffiliated user is on a protected page. They should be in the joining flow.
        if (user.status === 'unaffiliated' && !isJoiningProcessPage) {
            router.replace('/student/select-mess');
            return;
        }

        // Case 4: An affiliated user is on a joining page. They should be on their dashboard.
        if (user.status !== 'unaffiliated' && isJoiningProcessPage) {
            router.replace('/student/dashboard');
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

    // If we're on an auth page, the logic above will handle redirection if needed.
    // For non-logged-in users, we show the auth page itself.
    if (!user) {
        return <>{children}</>;
    }
    
    // User is logged in, decide what to show based on their status
    switch (user.status) {
        case 'unaffiliated':
            // Render the mess selection/joining pages which are handled as children.
            return <>{children}</>;
        
        case 'pending_approval':
            // Show a dedicated pending screen, blocking access to other pages.
            return <PendingApprovalScreen onLogout={handleLogout} />;
            
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

    