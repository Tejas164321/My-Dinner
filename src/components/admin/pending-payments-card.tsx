
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
        <Card className="animate-in fade-in-0 zoom-in-95 duration-500 delay-500">
            <CardHeader>
                <div className="flex items-center justify-between">
                    <div>
                        <CardTitle>Pending Payments</CardTitle>
                        <CardDescription>A summary of outstanding dues.</CardDescription>
                    </div>
                    <Wallet className="h-6 w-6 text-destructive" />
                </div>
            </CardHeader>
            <CardContent className="grid grid-cols-2 gap-4">
                <div className="flex flex-col items-center justify-center p-4 bg-secondary/50 rounded-lg">
                    <p className="text-2xl font-bold text-destructive">
                        ₹{totalDues.toLocaleString()}
                    </p>
                    <p className="text-sm text-muted-foreground">Total Due</p>
                </div>
                 <div className="flex flex-col items-center justify-center p-4 bg-secondary/50 rounded-lg">
                    <p className="text-2xl font-bold">
                        {defaulterCount}
                    </p>
                    <p className="text-sm text-muted-foreground flex items-center gap-1.5"><Users className="h-4 w-4" /> Students</p>
                </div>
            </CardContent>
             <CardFooter>
                <Button asChild className="w-full" variant="outline">
                    <Link href="/admin/billing">
                        View Billing Details
                    </Link>
                </Button>
            </CardFooter>
        </Card>
    );
}
