

'use client';

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAuth } from '@/contexts/auth-context';
import { onUsersUpdate } from '@/lib/listeners/users';
import { Student } from '@/lib/data';
import { Skeleton } from '../ui/skeleton';
import { Wallet, Users } from 'lucide-react';

const getDummyBillForStudent = (student: Student) => {
    if (!student || !student.uid) return { due: 0 };
    const base = student.messPlan === 'full_day' ? 3500 : 1800;
    const due = student.uid.charCodeAt(0) % 2 === 0 ? base : 0; // consistent dummy due
    return { due };
};

export function PendingPaymentsCard() {
    const { user: adminUser } = useAuth();
    const [students, setStudents] = useState<Student[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        if (!adminUser) return;
        setIsLoading(true);
        const unsubscribe = onUsersUpdate(adminUser.uid, (users) => {
            setStudents(users);
            setIsLoading(false);
        });
        return () => unsubscribe();
    }, [adminUser]);

    const { totalDues, defaulterCount } = useMemo(() => {
        if (isLoading) return { totalDues: 0, defaulterCount: 0 };

        let dues = 0;
        let count = 0;
        students.forEach(student => {
            const bill = getDummyBillForStudent(student);
            if (bill.due > 0) {
                dues += bill.due;
                count++;
            }
        });
        return { totalDues: dues, defaulterCount: count };
    }, [students, isLoading]);

    if (isLoading) {
        return <Skeleton className="h-48 w-full" />;
    }

    return (
        <Card className="animate-in fade-in-0 zoom-in-95 duration-500 delay-300">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Pending Dues</CardTitle>
                <Wallet className="h-5 w-5 text-destructive" />
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold">
                    ₹{totalDues.toLocaleString()}
                </div>
                <p className="text-xs text-muted-foreground">{defaulterCount} students with dues</p>
            </CardContent>
        </Card>
    );
}
