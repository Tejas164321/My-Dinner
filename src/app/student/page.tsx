
'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Skeleton } from '@/components/ui/skeleton';

export default function StudentPage() {
    const router = useRouter();

    useEffect(() => {
        router.replace('/student/dashboard');
    }, [router]);

    return (
        <div className="flex h-screen w-full items-center justify-center">
            <div className="space-y-4 w-full max-w-4xl p-8">
                <Skeleton className="h-12 w-1/4" />
                <div className="grid grid-cols-4 gap-4">
                    <Skeleton className="h-24" />
                    <Skeleton className="h-24" />
                    <Skeleton className="h-24" />
                    <Skeleton className="h-24" />
                </div>
                <div className="grid grid-cols-3 gap-4">
                    <div className="col-span-2 space-y-4">
                        <Skeleton className="h-48" />
                        <Skeleton className="h-48" />
                    </div>
                    <div className="col-span-1 space-y-4">
                        <Skeleton className="h-32" />
                        <Skeleton className="h-64" />
                    </div>
                </div>
            </div>
        </div>
    );
}
