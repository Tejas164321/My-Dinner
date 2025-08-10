

'use client';

import { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Student, Leave, Holiday } from "@/lib/data";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Bell, Loader2 } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { getMonth, getYear, getDaysInMonth, isSameDay, isFuture, parseISO, startOfDay } from 'date-fns';

interface BillingTableProps {
    filterMonth: Date;
    students: Student[];
    leaves: Leave[];
    holidays: Holiday[];
    isLoading: boolean;
    perMealCharge: number;
}

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


const BillRow = ({ student, bill }: { student: Student, bill: { due: number } }) => {
    if (bill.due <= 0) return null;

    return (
        <div className="flex items-center gap-4 p-3 hover:bg-secondary/50 rounded-lg transition-colors">
            <Avatar className="w-10 h-10 border">
                <AvatarFallback>{student.name.charAt(0)}</AvatarFallback>
            </Avatar>
            <div className="flex-1">
                <p className="font-semibold text-sm md:text-base">{student.name}</p>
                <p className="text-xs text-muted-foreground">{student.studentId}</p>
            </div>
             <div className="text-right">
                <p className="font-medium text-destructive text-sm md:text-base">₹{bill.due.toLocaleString()}</p>
                <p className="text-xs text-muted-foreground">Due</p>
            </div>
            <Button size="sm" variant="outline"><Bell className="h-4 w-4 md:mr-1.5" /> <span className="hidden md:inline">Remind</span></Button>
        </div>
    )
};

export function BillingTable({ filterMonth, students, leaves, holidays, isLoading, perMealCharge }: BillingTableProps) {
    const dueStudents = useMemo(() => {
        return students
            .map(student => ({
                student,
                bill: calculateBillForStudent(student, filterMonth, leaves, holidays, perMealCharge)
            }))
            .filter(({ bill }) => bill.due > 0);
    }, [students, filterMonth, leaves, holidays, perMealCharge]);

    return (
        <Card className="h-full flex flex-col">
            <CardHeader>
                <div className="flex justify-between items-start">
                    <div>
                        <CardTitle>Pending Payments</CardTitle>
                        <CardDescription>Students with outstanding dues.</CardDescription>
                    </div>
                    {dueStudents.length > 0 && (
                        <Button variant="outline" size="sm">
                            <Bell className="h-4 w-4 mr-1.5" /> Remind All
                        </Button>
                    )}
                </div>
            </CardHeader>
            <CardContent className="flex-grow p-2 pt-0 relative">
                <ScrollArea className="h-[350px] absolute inset-0 p-4 pt-0">
                    <div className="flex flex-col gap-2">
                        {isLoading ? (
                            <div className="flex h-full items-center justify-center text-sm text-muted-foreground py-10">
                                <Loader2 className="h-6 w-6 animate-spin" />
                            </div>
                        ) : dueStudents.length > 0 ? (
                            dueStudents.map(({ student, bill }) => (
                               <BillRow key={student.uid} student={student} bill={bill} />
                            ))
                        ) : (
                            <div className="flex items-center justify-center h-full text-muted-foreground py-10">
                                <p>No pending payments for this month.</p>
                            </div>
                        )}
                    </div>
                </ScrollArea>
            </CardContent>
        </Card>
    );
}
