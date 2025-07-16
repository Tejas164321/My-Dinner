
'use client';

import { useState, useMemo, useEffect } from "react";
import type { DayContentProps } from "react-day-picker";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar } from "@/components/ui/calendar";
import { Holiday, Leave } from "@/lib/data";
import { onHolidaysUpdate } from "@/lib/listeners/holidays";
import { onLeavesUpdate } from "@/lib/listeners/leaves";
import { useAuth } from "@/contexts/auth-context";
import { cn } from "@/lib/utils";
import { format, isSameMonth, isSameDay, getDaysInMonth, startOfDay, subMonths } from 'date-fns';
import { Badge } from "@/components/ui/badge";
import { CalendarCheck, Utensils, Percent, UserX, Sun, Moon } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";

export default function StudentAttendancePage() {
    const { user } = useAuth();
    const [month, setMonth] = useState<Date>(startOfDay(new Date()));
    const [holidays, setHolidays] = useState<Holiday[]>([]);
    const [leaves, setLeaves] = useState<Leave[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    
    useEffect(() => {
        if (!user) {
            setIsLoading(false);
            return;
        }
        setIsLoading(true);
        
        const leavesUnsubscribe = onLeavesUpdate(user.uid, setLeaves);

        const holidaysUnsubscribe = onHolidaysUpdate(user.messId, (updatedHolidays) => {
            setHolidays(updatedHolidays);
            if(user) { // Only finish loading once both listeners are active
                setIsLoading(false);
            }
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
            options.push({
                value: format(date, 'yyyy-MM'),
                label: format(date, 'MMMM yyyy'),
            });
        }
        return options;
    }, []);

    const monthlyStats = useMemo(() => {
        if (!user || isLoading) {
            return {
                attendancePercent: '0%',
                totalMeals: 0,
                presentDays: 0,
                absentDays: 0,
            };
        }

        const year = month.getFullYear();
        const monthIndex = month.getMonth();
        const daysInMonth = getDaysInMonth(new Date(year, monthIndex, 1));
        const today = startOfDay(new Date());

        const studentLeaves = leaves.filter(l => isSameMonth(l.date, month));
        const monthHolidays = holidays.filter(h => isSameMonth(h.date, month));

        let presentMealsCount = 0;
        let presentDaysCount = 0;
        let absentDaysCount = 0;
        let totalCountedDays = 0;
        
        const consideredDays = Array.from({ length: daysInMonth }, (_, i) => new Date(year, monthIndex, i + 1)).filter(d => d <= today);

        consideredDays.forEach(day => {
            const isHoliday = monthHolidays.some(h => isSameDay(h.date, day));
            if (isHoliday) return;

            totalCountedDays++;
            const leave = studentLeaves.find(l => isSameDay(l.date, day));

            if (leave) {
                absentDaysCount++;
                if (user.messPlan === 'full_day' && leave.type === 'lunch_only') presentMealsCount++;
                if (user.messPlan === 'full_day' && leave.type === 'dinner_only') presentMealsCount++;
            } else {
                presentDaysCount++;
                if (user.messPlan === 'full_day') {
                    presentMealsCount += 2;
                } else {
                    presentMealsCount += 1;
                }
            }
        });
        
        const attendance = totalCountedDays > 0 ? ((presentDaysCount / totalCountedDays) * 100).toFixed(0) + '%' : 'N/A';
        
        return {
            attendancePercent: attendance,
            totalMeals: presentMealsCount,
            presentDays: presentDaysCount,
            absentDays: absentDaysCount,
        };
    }, [month, user, holidays, leaves, isLoading]);

    const {
        holidayDays,
        fullLeaveDays,
        halfLeaveDays,
        fullPresentDays,
        halfPresentDays,
        dayTypeMap,
    } = useMemo(() => {
        if (!user) return { holidayDays: [], fullLeaveDays: [], halfLeaveDays: [], fullPresentDays: [], halfPresentDays: [], dayTypeMap: new Map() };
        
        const year = month.getFullYear();
        const monthIndex = month.getMonth();
        const daysInMonth = getDaysInMonth(new Date(year, monthIndex, 1));
        const allDaysInMonth = Array.from({ length: daysInMonth }, (_, i) => new Date(year, monthIndex, i + 1));
        
        const hDays: Date[] = [];
        const flDays: Date[] = [];
        const hlDays: Date[] = [];
        const fpDays: Date[] = [];
        const hpDays: Date[] = [];
        const dtMap = new Map();

        const studentLeaves = leaves.filter(l => isSameMonth(l.date, month));
        const monthHolidays = holidays.filter(h => isSameMonth(h.date, month));

        const ltm = new Map(studentLeaves.map(l => [format(l.date, 'yyyy-MM-dd'), l.type]));
        const htm = new Map(monthHolidays.map(h => [format(h.date, 'yyyy-MM-dd'), h.type]));

        allDaysInMonth.forEach(day => {
            const dateKey = format(day, 'yyyy-MM-dd');
            const holidayType = htm.get(dateKey);
            const leaveType = ltm.get(dateKey);

            if (holidayType) {
                hDays.push(day);
                dtMap.set(dateKey, { type: 'holiday', holidayType });
            } else if (leaveType) {
                if (leaveType === 'full_day') {
                    flDays.push(day);
                } else {
                    hlDays.push(day);
                }
                dtMap.set(dateKey, { type: 'leave', leaveType });
            } else {
                 if (user.messPlan === 'full_day') {
                    fpDays.push(day);
                } else {
                    hpDays.push(day);
                }
                dtMap.set(dateKey, { type: 'present' });
            }
        });

        return { 
            holidayDays: hDays,
            fullLeaveDays: flDays,
            halfLeaveDays: hlDays,
            fullPresentDays: fpDays,
            halfPresentDays: hpDays,
            dayTypeMap: dtMap,
        };
    }, [month, user, holidays, leaves]);

    const CustomDayContent = ({ date }: DayContentProps) => {
        if (!user) {
            return <div className="relative h-full w-full flex items-center justify-center">{date.getDate()}</div>;
        }

        const dateKey = format(date, 'yyyy-MM-dd');
        const dayInfo = dayTypeMap.get(dateKey);
        
        const holidayType = dayInfo?.type === 'holiday' ? dayInfo.holidayType : null;
        const leaveType = dayInfo?.type === 'leave' ? dayInfo.leaveType : null;
        
        const isLunchAttended = !(
            (holidayType === 'full_day' || holidayType === 'lunch_only') ||
            (leaveType === 'full_day' || leaveType === 'lunch_only')
        ) && (user.messPlan === 'full_day' || user.messPlan === 'lunch_only');
    
        const isDinnerAttended = !(
            (holidayType === 'full_day' || holidayType === 'dinner_only') ||
            (leaveType === 'full_day' || leaveType === 'dinner_only')
        ) && (user.messPlan === 'full_day' || user.messPlan === 'dinner_only');

        const lunchDot = <div className={cn("h-1 w-1 rounded-full", isLunchAttended ? 'bg-white' : 'bg-white/30')} />;
        const dinnerDot = <div className={cn("h-1 w-1 rounded-full", isDinnerAttended ? 'bg-white' : 'bg-white/30')} />;

        return (
            <div className="relative h-full w-full flex items-center justify-center">
                {date.getDate()}
                <div className="absolute bottom-1 flex items-center justify-center gap-0.5">
                    {lunchDot}
                    {dinnerDot}
                </div>
            </div>
        );
    };

    if (isLoading || !user) {
        return (
            <div className="space-y-8">
                <div className="flex justify-between items-center">
                    <Skeleton className="h-8 w-48" />
                    <Skeleton className="h-10 w-48" />
                </div>
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                    <Skeleton className="h-24 w-full" />
                    <Skeleton className="h-24 w-full" />
                    <Skeleton className="h-24 w-full" />
                    <Skeleton className="h-24 w-full" />
                </div>
                <Skeleton className="h-96 w-full" />
            </div>
        )
    }

    return (
        <div className="flex flex-col gap-8 animate-in fade-in-0 slide-in-from-top-5 duration-700">
            <div className="flex flex-wrap items-center justify-between gap-4">
                <h1 className="text-2xl font-bold tracking-tight">My Attendance</h1>
                 <Select
                    value={format(month, 'yyyy-MM')}
                    onValueChange={(value) => setMonth(startOfDay(new Date(`${value}-01`)))}
                >
                    <SelectTrigger className="w-[200px]">
                        <SelectValue placeholder="Select month" />
                    </SelectTrigger>
                    <SelectContent>
                        {monthOptions.map(option => (
                        <SelectItem key={option.value} value={option.value}>
                            {option.label}
                        </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Attendance ({format(month, 'MMMM')})</CardTitle>
                        <Percent className="h-5 w-5 text-primary" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{monthlyStats.attendancePercent}</div>
                        <p className="text-xs text-muted-foreground">Based on days attended this month</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Meals Taken</CardTitle>
                        <Utensils className="h-5 w-5 text-primary" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{monthlyStats.totalMeals}</div>
                        <p className="text-xs text-muted-foreground">Meals attended this month</p>
                    </CardContent>
                </Card>
                 <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Present</CardTitle>
                        <CalendarCheck className="h-5 w-5 text-green-400" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{monthlyStats.presentDays} Days</div>
                        <p className="text-xs text-muted-foreground">Days you were marked present</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Absent</CardTitle>
                        <UserX className="h-5 w-5 text-destructive" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{monthlyStats.absentDays}</div>
                        <p className="text-xs text-muted-foreground">Days you were on leave</p>
                    </CardContent>
                </Card>
            </div>
            
            <Card>
                <CardHeader>
                    <CardTitle>Attendance Calendar for {format(month, 'MMMM yyyy')}</CardTitle>
                </CardHeader>
                <CardContent className="flex flex-col lg:flex-row lg:items-center lg:justify-center gap-8">
                    <Calendar
                        month={month}
                        onMonthChange={setMonth}
                        modifiers={{
                            holiday: holidayDays,
                            full_leave: fullLeaveDays,
                            half_leave: halfLeaveDays,
                            full_present: fullPresentDays,
                            half_present: halfPresentDays,
                        }}
                        components={{ DayContent: CustomDayContent }}
                        modifiersClassNames={{
                            holiday: 'bg-primary/40 text-primary-foreground',
                            full_leave: 'bg-destructive text-destructive-foreground',
                            half_leave: 'bg-chart-3 text-primary-foreground',
                            full_present: 'bg-chart-2 text-primary-foreground',
                            half_present: 'bg-chart-3 text-primary-foreground',
                        }}
                        classNames={{
                            months: "w-full",
                            month: "w-full space-y-4",
                            head_cell: "text-muted-foreground w-full font-normal text-sm",
                            cell: "h-9 w-9 text-center text-sm p-0 relative rounded-full flex items-center justify-center",
                            day: "h-9 w-9 p-0 font-normal aria-selected:opacity-100 rounded-full flex items-center justify-center",
                            day_today: "bg-accent text-accent-foreground rounded-full",
                            day_selected: "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground focus:bg-primary focus:text-primary-foreground",
                        }}
                        className="p-3"
                        showOutsideDays={false}
                    />
                    <div className="flex flex-wrap lg:flex-col gap-x-6 gap-y-4 text-sm text-muted-foreground">
                        <div className="flex items-center gap-2"><span className="h-4 w-4 shrink-0 rounded-full bg-chart-2" />Full Day Present</div>
                        <div className="flex items-center gap-2"><span className="h-4 w-4 shrink-0 rounded-full bg-chart-3" />Half Day Present / Leave</div>
                        <div className="flex items-center gap-2"><span className="h-4 w-4 shrink-0 rounded-full bg-destructive" />Full Day Leave</div>
                        <div className="flex items-center gap-2"><span className="h-4 w-4 shrink-0 rounded-full bg-primary/40" />Holiday</div>
                        <div className="flex items-center gap-2"><Badge variant="outline" className="border-accent text-accent">Today</Badge><span>Current Date</span></div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
