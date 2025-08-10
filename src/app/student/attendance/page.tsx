

'use client';

import { useState, useMemo, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Holiday, Leave, AppUser } from "@/lib/data";
import { onHolidaysUpdate } from "@/lib/listeners/holidays";
import { onLeavesUpdate } from "@/lib/listeners/leaves";
import { useAuth } from "@/contexts/auth-context";
import { format, isSameMonth, isSameDay, getDaysInMonth, startOfDay, subMonths, parseISO, isFuture, isBefore, isAfter } from 'date-fns';
import { Percent, UserX, Utensils, CalendarCheck, CalendarOff } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { AttendanceCalendar } from "@/components/shared/attendance-calendar";

export default function StudentAttendancePage() {
    const { user } = useAuth();
    const [month, setMonth] = useState<Date>(startOfDay(new Date()));
    const [holidays, setHolidays] = useState<Holiday[]>([]);
    const [leaves, setLeaves] = useState<Leave[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    
    useEffect(() => {
        if (!user || !user.uid || !user.messId) {
            setIsLoading(false);
            return;
        }
        setIsLoading(true);
        
        const leavesUnsubscribe = onLeavesUpdate(user.uid, setLeaves);
        const holidaysUnsubscribe = onHolidaysUpdate(user.messId, (updatedHolidays) => {
            setHolidays(updatedHolidays);
            if(user) { setIsLoading(false); }
        });
        
        return () => {
            leavesUnsubscribe();
            holidaysUnsubscribe();
        };
    }, [user]);
    
    const monthOptions = useMemo(() => {
        const options = [];
        const today = new Date();
        for (let i = 0; i < 6; i++) {
            const date = subMonths(today, i);
            options.push({ value: format(date, 'yyyy-MM'), label: format(date, 'MMMM yyyy') });
        }
        return options;
    }, []);

    const planStartDate = useMemo(() => {
        if (!user?.planStartDate) return null;
        const dateValue = user.planStartDate;
        return typeof dateValue === 'string' ? startOfDay(parseISO(dateValue)) : startOfDay((dateValue as any).toDate());
    }, [user]);

    const monthlyStats = useMemo(() => {
        if (!user || isLoading || !planStartDate) {
            return { attendancePercent: '0%', totalMeals: 0, presentDays: 0, absentDays: 0, totalHolidays: 0 };
        }

        const today = startOfDay(new Date());
        let presentDays = 0;
        let absentDays = 0;
        let totalMeals = 0;
        let totalHolidays = 0;
        
        const studentLeaves = leaves.filter(l => isSameMonth(l.date, month));
        const monthHolidays = holidays.filter(h => isSameMonth(h.date, month));
        
        const allDaysInMonth = Array.from({ length: getDaysInMonth(month) }, (_, i) => new Date(month.getFullYear(), month.getMonth(), i + 1));
        
        allDaysInMonth.forEach(day => {
            if (isBefore(day, planStartDate) || isAfter(day, today)) return;

            const holiday = monthHolidays.find(h => isSameDay(h.date, day));
            if (holiday) {
                totalHolidays++;
                return;
            }

            const leave = studentLeaves.find(l => isSameDay(l.date, day));
            let isPresentToday = false;

            // Lunch Status
            if (user.messPlan === 'full_day' || user.messPlan === 'lunch_only') {
                 if (!(isSameDay(day, planStartDate) && user.planStartMeal === 'dinner')) {
                     if (!leave || (leave.type !== 'full_day' && leave.type !== 'lunch_only')) {
                        totalMeals++;
                        isPresentToday = true;
                     }
                 }
            }
             // Dinner Status
            if (user.messPlan === 'full_day' || user.messPlan === 'dinner_only') {
                 if (!leave || (leave.type !== 'full_day' && leave.type !== 'dinner_only')) {
                    totalMeals++;
                    isPresentToday = true;
                 }
            }
            
            if (isPresentToday) {
                presentDays++;
            } else if (leave) {
                absentDays++;
            }
        });
        
        const totalWorkableDays = presentDays + absentDays;
        const attendance = totalWorkableDays > 0 ? ((presentDays / totalWorkableDays) * 100).toFixed(0) + '%' : 'N/A';
        
        return { attendancePercent: attendance, totalMeals: totalMeals, presentDays: presentDays, absentDays: absentDays, totalHolidays };
    }, [month, user, holidays, leaves, isLoading, planStartDate]);


    if (isLoading || !user) {
        return (
            <div className="space-y-8">
                <div className="flex justify-between items-center"><Skeleton className="h-8 w-48" /><Skeleton className="h-10 w-48" /></div>
                <div className="grid grid-cols-2 gap-6 md:grid-cols-2 lg:grid-cols-4"><Skeleton className="h-24 w-full" /><Skeleton className="h-24 w-full" /><Skeleton className="h-24 w-full" /><Skeleton className="h-24 w-full" /></div>
                <Skeleton className="h-96 w-full" />
            </div>
        )
    }

    return (
        <div className="flex flex-col gap-8 animate-in fade-in-0 slide-in-from-top-5 duration-700">
            <div className="flex flex-wrap items-center justify-between gap-4">
                <h1 className="text-2xl font-bold tracking-tight hidden md:block">My Attendance</h1>
                 <Select value={format(month, 'yyyy-MM')} onValueChange={(value) => setMonth(startOfDay(new Date(`${value}-01`)))}>
                    <SelectTrigger className="w-full md:w-[200px]"><SelectValue placeholder="Select month" /></SelectTrigger>
                    <SelectContent>{monthOptions.map(option => (<SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>))}</SelectContent>
                </Select>
            </div>

            <div className="grid grid-cols-2 gap-6 md:grid-cols-2 lg:grid-cols-4">
                <Card><CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2"><CardTitle className="text-sm font-medium">Attendance ({format(month, 'MMMM')})</CardTitle><Percent className="h-5 w-5 text-primary" /></CardHeader><CardContent><div className="text-2xl font-bold">{monthlyStats.attendancePercent}</div><p className="text-xs text-muted-foreground">This month's attendance</p></CardContent></Card>
                <Card><CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2"><CardTitle className="text-sm font-medium">Total Meals Taken</CardTitle><Utensils className="h-5 w-5 text-primary" /></CardHeader><CardContent><div className="text-2xl font-bold">{monthlyStats.totalMeals}</div><p className="text-xs text-muted-foreground">Meals this month</p></CardContent></Card>
                 <Card><CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2"><CardTitle className="text-sm font-medium">Total Present</CardTitle><CalendarCheck className="h-5 w-5 text-green-400" /></CardHeader><CardContent><div className="text-2xl font-bold">{monthlyStats.presentDays} Days</div><p className="text-xs text-muted-foreground">Days present this month</p></CardContent></Card>
                <Card><CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2"><CardTitle className="text-sm font-medium">Days Off</CardTitle><CalendarOff className="h-5 w-5 text-orange-400" /></CardHeader><CardContent><div className="flex items-baseline justify-center gap-4"><div className="text-center"><p className="text-2xl font-bold">{monthlyStats.absentDays}</p><p className="text-xs text-muted-foreground">Absent</p></div><div className="text-center"><p className="text-2xl font-bold">{monthlyStats.totalHolidays}</p><p className="text-xs text-muted-foreground">Holidays</p></div></div></CardContent></Card>
            </div>
            
            <Card>
                <CardHeader><CardTitle>Attendance Calendar for {format(month, 'MMMM yyyy')}</CardTitle></CardHeader>
                <CardContent className="flex flex-col items-center justify-center gap-8 lg:flex-row">
                    <AttendanceCalendar user={user} leaves={leaves} holidays={holidays} month={month} onMonthChange={setMonth} />
                    <div className="flex w-full flex-wrap items-center justify-center gap-x-4 gap-y-2 text-sm text-muted-foreground lg:w-auto lg:flex-col lg:items-start lg:justify-start lg:gap-y-4">
                        <div className="flex items-center gap-2"><span className="h-3 w-3 shrink-0 rounded-full bg-green-500" />Present</div>
                        <div className="flex items-center gap-2"><span className="h-3 w-3 shrink-0 rounded-full bg-destructive" />Leave</div>
                        <div className="flex items-center gap-2"><span className="h-3 w-3 shrink-0 rounded-full bg-orange-500" />Holiday</div>
                        <div className="flex items-center gap-2"><div className="w-5 h-5 rounded-md ring-2 ring-primary ring-offset-2 ring-offset-background"></div>Today</div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
