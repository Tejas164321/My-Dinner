
'use client';

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAuth } from '@/contexts/auth-context';
import { onUsersUpdate } from '@/lib/listeners/users';
import { onAllLeavesUpdate } from '@/lib/listeners/leaves';
import { onHolidaysUpdate } from '@/lib/listeners/holidays';
import { Student, Leave, Holiday } from '@/lib/data';
import { Skeleton } from '../ui/skeleton';
import { Wallet, Users, Receipt } from 'lucide-react';
import { getMonth, getYear, getDaysInMonth, isSameDay, isFuture, startOfMonth, parseISO, startOfDay } from 'date-fns';

const CHARGE_PER_MEAL = 65;

const calculateBillForStudent = (student: Student, month: Date, leaves: Leave[], holidays: Holiday[]) => {
    if (!student || !student.uid || !student.messPlan || !student.joinDate) return { due: 0 };

    const studentLeaves = leaves.filter(l => l.studentId === student.uid && getMonth(l.date) === getMonth(month));
    const messHolidays = holidays.filter(h => h.messId === student.messId && getMonth(h.date) === getMonth(month));

    const monthIndex = getMonth(month);
    const year = getYear(month);
    const daysInMonth = getDaysInMonth(month);
    const joinDate = student.joinDate ? startOfDay(parseISO(student.joinDate)) : new Date(0);
    
    let totalMeals = 0;

    for (let i = 1; i <= daysInMonth; i++) {
        const day = new Date(year, monthIndex, i);
        if (isFuture(day) || day < joinDate) continue;

        const holiday = messHolidays.find(h => isSameDay(h.date, day));
        if (holiday) continue;
        
        const leave = studentLeaves.find(l => isSameDay(l.date, day));
        if (leave) {
            if (student.messPlan === 'full_day') {
                if (leave.type === 'lunch_only') totalMeals++;
                if (leave.type === 'dinner_only') totalMeals++;
            }
        } else {
            if (student.messPlan === 'full_day') totalMeals += 2;
            else totalMeals++;
        }
    }
    
    return { due: totalMeals * CHARGE_PER_MEAL };
};


export function PendingPaymentsCard() {
    const { user: adminUser } = useAuth();
    const [students, setStudents] = useState<Student[]>([]);
    const [leaves, setLeaves] = useState<Leave[]>([]);
    const [holidays, setHolidays] = useState<Holiday[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        if (!adminUser) return;
        setIsLoading(true);
        const unsubUsers = onUsersUpdate(adminUser.uid, setStudents);
        const unsubLeaves = onAllLeavesUpdate(setLeaves);
        const unsubHolidays = onHolidaysUpdate(adminUser.uid, setHolidays);

        // A simple way to wait for all listeners to fire once
        Promise.all([
            new Promise(res => onUsersUpdate(adminUser.uid, d => res(d))),
            new Promise(res => onAllLeavesUpdate(d => res(d))),
            new Promise(res => onHolidaysUpdate(adminUser.uid, d => res(d))),
        ]).then(() => setIsLoading(false));

        return () => {
            unsubUsers();
            unsubLeaves();
            unsubHolidays();
        };
    }, [adminUser]);

    const { totalDues, defaulterCount } = useMemo(() => {
        if (isLoading) return { totalDues: 0, defaulterCount: 0 };
        
        const currentMonth = startOfMonth(new Date());
        let dues = 0;
        let count = 0;
        
        students.forEach(student => {
            // Simplified: Not accounting for payments here, just total generated bill
            const bill = calculateBillForStudent(student, currentMonth, leaves, holidays);
            if (bill.due > 0) {
                dues += bill.due;
                count++;
            }
        });
        return { totalDues: dues, defaulterCount: count };
    }, [students, leaves, holidays, isLoading]);

    if (isLoading) {
        return <Skeleton className="h-48 w-full" />;
    }

    return (
        <Card className="animate-in fade-in-0 zoom-in-95 duration-500 delay-500 flex flex-col">
            <CardHeader className="flex flex-row items-center justify-between">
                <div>
                    <CardTitle>Pending Payments</CardTitle>
                    <CardDescription>A summary of outstanding dues.</CardDescription>
                </div>
                <Receipt className="h-6 w-6 text-primary" />
            </CardHeader>
            <CardContent className="flex-grow space-y-4">
                 <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 rounded-lg border bg-secondary/30 text-center">
                        <Wallet className="h-6 w-6 mx-auto mb-2 text-destructive" />
                        <p className="text-xl font-bold">₹{totalDues.toLocaleString()}</p>
                        <p className="text-xs text-muted-foreground">Total Due</p>
                    </div>
                     <div className="p-4 rounded-lg border bg-secondary/30 text-center">
                        <Users className="h-6 w-6 mx-auto mb-2 text-destructive" />
                        <p className="text-xl font-bold">{defaulterCount}</p>
                        <p className="text-xs text-muted-foreground">Students</p>
                    </div>
                </div>
            </CardContent>
            <CardFooter>
                 <Button asChild className="w-full">
                    <Link href="/admin/billing">
                        View Billing Details
                    </Link>
                </Button>
            </CardFooter>
        </Card>
    );
}
