

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
import { getMessInfo } from '@/lib/services/mess';

const calculateBillForStudent = (student: Student, month: Date, leaves: Leave[], holidays: Holiday[], perMealCharge: number) => {
    const dateValue = student.planStartDate;
    if (!student || !student.uid || !student.messPlan || !dateValue) {
        return { due: 0 };
    }

    const planStartDate = typeof dateValue === 'string'
        ? startOfDay(parseISO(dateValue))
        : startOfDay((dateValue as any).toDate());

    const studentLeaves = leaves.filter(l => l.studentId === student.uid && getMonth(l.date) === getMonth(month));
    const messHolidays = holidays.filter(h => h.messId === student.messId && getMonth(h.date) === getMonth(month));

    const monthIndex = getMonth(month);
    const year = getYear(month);
    const daysInMonth = getDaysInMonth(month);
    
    let totalMeals = 0;

    for (let i = 1; i <= daysInMonth; i++) {
        const day = new Date(year, monthIndex, i);
        if (isFuture(day) || day < planStartDate) continue;

        const holiday = messHolidays.find(h => isSameDay(h.date, day));
        if (holiday) {
             if (holiday.type === 'full_day') continue;
             if (student.messPlan !== 'full_day' && holiday.type === student.messPlan) continue;
        }
        
        const leave = studentLeaves.find(l => isSameDay(l.date, day));
        
        let lunchTaken = false;
        let dinnerTaken = false;

        // Check for Lunch
        if (student.messPlan === 'full_day' || student.messPlan === 'lunch_only') {
            if (!(isSameDay(day, planStartDate) && student.planStartMeal === 'dinner')) {
                 if (!holiday || (holiday.type !== 'full_day' && holiday.type !== 'lunch_only')) {
                    if (!leave || (leave.type !== 'full_day' && leave.type !== 'lunch_only')) {
                        lunchTaken = true;
                    }
                 }
            }
        }
        
        // Check for Dinner
        if (student.messPlan === 'full_day' || student.messPlan === 'dinner_only') {
             if (!holiday || (holiday.type !== 'full_day' && holiday.type !== 'dinner_only')) {
                 if (!leave || (leave.type !== 'full_day' && leave.type !== 'dinner_only')) {
                    dinnerTaken = true;
                }
             }
        }
        
        if(lunchTaken) totalMeals++;
        if(dinnerTaken) totalMeals++;
    }
    
    return { due: totalMeals * perMealCharge };
};


export function PendingPaymentsCard() {
    const { user: adminUser } = useAuth();
    const [students, setStudents] = useState<Student[]>([]);
    const [leaves, setLeaves] = useState<Leave[]>([]);
    const [holidays, setHolidays] = useState<Holiday[]>([]);
    const [perMealCharge, setPerMealCharge] = useState(65);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        if (!adminUser) return;
        setIsLoading(true);

        const fetchMessSettings = async () => {
            const messInfo = await getMessInfo(adminUser.uid);
            if (messInfo?.perMealCharge) {
                setPerMealCharge(messInfo.perMealCharge);
            }
        };

        const unsubUsers = onUsersUpdate(adminUser.uid, setStudents);
        const unsubLeaves = onAllLeavesUpdate(setLeaves);
        const unsubHolidays = onHolidaysUpdate(adminUser.uid, setHolidays);

        // A simple way to wait for all listeners to fire once
        Promise.all([
            fetchMessSettings(),
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
            const bill = calculateBillForStudent(student, currentMonth, leaves, holidays, perMealCharge);
            if (bill.due > 0) {
                dues += bill.due;
                count++;
            }
        });
        return { totalDues: dues, defaulterCount: count };
    }, [students, leaves, holidays, isLoading, perMealCharge]);

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
