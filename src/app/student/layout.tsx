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
        if (loading) return;

        const isAuthPage = pathname.startsWith('/student/login') || pathname.startsWith('/student/signup');
        const isJoiningProcessPage = isAuthPage || pathname.startsWith('/student/select-mess') || pathname.startsWith('/student/join-mess');

        if (!user && !isAuthPage) {
            router.replace('/student/login');
        } else if (user) {
            if (isAuthPage) {
                if (user.status === 'unaffiliated') {
                    router.replace('/student/select-mess');
                } else {
                    router.replace('/student/dashboard');
                }
            } else if (user.status === 'unaffiliated' && !isJoiningProcessPage) {
                 router.replace('/student/select-mess');
            }
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

    if (user.status === 'unaffiliated' || pathname.startsWith('/student/select-mess') || pathname.startsWith('/student/join-mess')) {
        return <>{children}</>;
    }
    
    if (user.status === 'pending_approval') {
        return <PendingApprovalScreen onLogout={handleLogout} />;
    }
    
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
}
