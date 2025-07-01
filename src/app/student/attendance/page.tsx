
'use client';

import { useState, useMemo, useEffect } from "react";
import type { DayContentProps } from "react-day-picker";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar } from "@/components/ui/calendar";
import { studentsData, holidays } from "@/lib/data";
import { cn } from "@/lib/utils";
import { format } from 'date-fns';
import { Badge } from "@/components/ui/badge";
import { CalendarCheck, Utensils, Percent, UserX } from "lucide-react";

function CustomDayContent({ date, activeModifiers }: DayContentProps) {
    let dots = null;

    if (activeModifiers.fullDay) {
        dots = <><div className="h-1 w-1 rounded-full bg-white" /><div className="h-1 w-1 rounded-full bg-white" /></>;
    } else if (activeModifiers.lunchOnly) {
        dots = <><div className="h-1 w-1 rounded-full bg-white" /><div className="h-1 w-1 rounded-full bg-white/30" /></>;
    } else if (activeModifiers.dinnerOnly) {
        dots = <><div className="h-1 w-1 rounded-full bg-white/30" /><div className="h-1 w-1 rounded-full bg-white" /></>;
    } else if (activeModifiers.absent) {
        dots = <><div className="h-1 w-1 rounded-full bg-white/30" /><div className="h-1 w-1 rounded-full bg-white/30" /></>;
    }

    return (
        <div className="relative h-full w-full flex items-center justify-center">
            {date.getDate()}
            {dots && (
                <div className="absolute bottom-1 flex items-center justify-center gap-0.5">
                    {dots}
                </div>
            )}
        </div>
    );
}

export default function StudentAttendancePage() {
    const [month, setMonth] = useState<Date>(new Date());
    const [today, setToday] = useState<Date | undefined>();
    const student = studentsData.find(s => s.id === '8'); // Alex Doe

    useEffect(() => {
        const now = new Date();
        now.setHours(0, 0, 0, 0);
        setToday(now);
    }, []);

    const monthName = format(month, 'MMMM').toLowerCase() as keyof typeof student.monthlyDetails;
    const currentData = student?.monthlyDetails[monthName] || { attendance: '0%', bill: { total: 0, paid: 0 }, status: 'Paid' };
    
    const { fullDaysCount, halfDaysCount, absentDaysCount, totalMealsCount, fullDayDays, lunchOnlyDays, dinnerOnlyDays, absentDays } = useMemo(() => {
        if (!today || !student) {
            return {
                fullDaysCount: 0, halfDaysCount: 0, absentDaysCount: 0, totalMealsCount: 0,
                fullDayDays: [], lunchOnlyDays: [], dinnerOnlyDays: [], absentDays: [],
            };
        }

        const year = month.getFullYear();
        const monthIndex = month.getMonth();
        const daysInMonth = new Date(year, monthIndex + 1, 0).getDate();
        const allDays = Array.from({ length: daysInMonth }, (_, i) => new Date(year, monthIndex, i + 1));
        const pastOrTodayDays = allDays.filter(d => d <= today);
        
        const totalConsideredDays = pastOrTodayDays.length;
        const attendancePercent = parseFloat(currentData.attendance) / 100;
        const totalPresentDays = totalConsideredDays > 0 ? Math.round(totalConsideredDays * attendancePercent) : 0;
        const aDaysCount = totalConsideredDays > 0 ? totalConsideredDays - totalPresentDays : 0;
        const fDaysCount = Math.round(totalPresentDays * 0.9);
        const hDaysCount = totalPresentDays - fDaysCount;
        const tMealsCount = (fDaysCount * 2) + hDaysCount;

        const seededRandom = (seed: number) => {
            let x = Math.sin(seed + student.id.charCodeAt(0)) * 10000;
            return x - Math.floor(x);
        };
        const shuffledPastDays = [...pastOrTodayDays].sort((a, b) => seededRandom(a.getDate()) - seededRandom(b.getDate()));
        
        const fdd = shuffledPastDays.slice(0, fDaysCount);
        const hdd = shuffledPastDays.slice(fDaysCount, fDaysCount + hDaysCount);
        const add = shuffledPastDays.slice(fDaysCount + hDaysCount);
        const lod = hdd.filter((_, i) => i % 2 === 0);
        const dod = hdd.filter((_, i) => i % 2 !== 0);

        return {
            fullDaysCount: fdd.length, halfDaysCount: hdd.length, absentDaysCount: add.length,
            totalMealsCount: tMealsCount, fullDayDays: fdd, lunchOnlyDays: lod,
            dinnerOnlyDays: dod, absentDays: add,
        };
    }, [month, student, currentData.attendance, today]);

    if (!student) {
        return <div>Loading student data...</div>
    }

    return (
        <div className="flex flex-col gap-8 animate-in fade-in-0 slide-in-from-top-5 duration-700">
            <div>
                <h1 className="text-2xl font-bold tracking-tight">My Attendance</h1>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Attendance ({format(month, 'MMMM')})</CardTitle>
                        <Percent className="h-5 w-5 text-primary" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{currentData.attendance}</div>
                        <p className="text-xs text-muted-foreground">Based on days attended this month</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Meals Taken</CardTitle>
                        <Utensils className="h-5 w-5 text-primary" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{totalMealsCount}</div>
                        <p className="text-xs text-muted-foreground">Lunch & Dinner combined</p>
                    </CardContent>
                </Card>
                 <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Present</CardTitle>
                        <CalendarCheck className="h-5 w-5 text-green-400" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{fullDaysCount + halfDaysCount} Days</div>
                        <p className="text-xs text-muted-foreground">Full days and half days</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Absent</CardTitle>
                        <UserX className="h-5 w-5 text-destructive" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{absentDaysCount} Days</div>
                        <p className="text-xs text-muted-foreground">Days you were marked absent</p>
                    </CardContent>
                </Card>
            </div>
            
            <Card>
                <CardHeader>
                    <CardTitle>Attendance Calendar for {format(month, 'MMMM yyyy')}</CardTitle>
                    <CardDescription>Visual representation of your monthly attendance.</CardDescription>
                </CardHeader>
                <CardContent className="flex flex-col lg:flex-row lg:items-center lg:justify-center gap-8">
                    <Calendar
                        month={month}
                        onMonthChange={setMonth}
                        modifiers={{
                            fullDay: fullDayDays,
                            lunchOnly: lunchOnlyDays,
                            dinnerOnly: dinnerOnlyDays,
                            absent: absentDays,
                            holiday: holidays.map(h => h.date),
                        }}
                        components={{ DayContent: CustomDayContent }}
                        modifiersClassNames={{
                            fullDay: "bg-chart-2 text-primary-foreground",
                            lunchOnly: "bg-chart-3 text-primary-foreground",
                            dinnerOnly: "bg-chart-3 text-primary-foreground",
                            absent: "bg-destructive text-destructive-foreground",
                            holiday: "bg-primary/40 text-primary-foreground",
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
                     <div className="flex flex-wrap lg:flex-col gap-4 text-sm text-muted-foreground">
                        <div className="flex items-center gap-2">
                            <span className="h-4 w-4 shrink-0 rounded-full bg-chart-2" />
                            <span>Full Day (Present)</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="h-4 w-4 shrink-0 rounded-full bg-chart-3" />
                            <span>Half Day (Present)</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="h-4 w-4 shrink-0 rounded-full bg-destructive" />
                            <span>Absent / On Leave</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="h-4 w-4 shrink-0 rounded-full bg-primary/40" />
                            <span>Mess Holiday</span>
                        </div>
                        <div className="flex items-center gap-2">
                             <Badge variant="outline" className="border-accent text-accent">Today</Badge>
                             <span>Current Date</span>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
