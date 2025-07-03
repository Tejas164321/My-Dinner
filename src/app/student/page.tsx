'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

// This page just redirects to the dashboard, which is the default student view.
export default function StudentPage() {
    const router = useRouter();

    useEffect(() => {
        router.replace('/student/dashboard');
    }, [router]);

    return null;
}
