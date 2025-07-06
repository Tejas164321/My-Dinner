'use client';

import type { ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { DashboardLayout } from '@/components/dashboard/layout';
import { studentNavItems } from '@/lib/data';
import { useAuth } from '@/contexts/auth-context';
import { Skeleton } from '@/components/ui/skeleton';
import { logout } from '@/app/auth/actions';
import { useToast } from '@/hooks/use-toast';

export default function StudentDashboardLayout({ children }: { children: ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const { toast } = useToast();

   useEffect(() => {
    if (!loading) {
      if (!user || user.role !== 'student') {
        router.replace('/login');
      } else if (user.status && user.status !== 'active') {
        // Handle pending or suspended users by logging them out and showing a message
        const message = user.status === 'pending'
          ? 'Your account is pending approval.'
          : 'Your account has been suspended.';
        logout().then(() => {
          toast({ variant: 'destructive', title: 'Access Denied', description: message });
          router.replace('/login');
        });
      }
    }
  }, [user, loading, router, toast]);

  if (loading || !user || user.role !== 'student' || user.status !== 'active') {
     return (
       <div className="flex h-screen w-full items-center justify-center">
            <div className="flex items-center space-x-4">
                <Skeleton className="h-12 w-12 rounded-full" />
                <div className="space-y-2">
                    <Skeleton className="h-4 w-[250px]" />
                    <Skeleton className="h-4 w-[200px]" />
                </div>
            </div>
        </div>
    );
  }

  const dashboardUser = {
    name: user.name || 'Student',
    role: 'Student',
    email: user.email || '',
    avatarUrl: user.avatarUrl,
  };
  
  return (
    <DashboardLayout navItems={studentNavItems} user={dashboardUser} onLogout={logout}>
      {children}
    </DashboardLayout>
  );
}
