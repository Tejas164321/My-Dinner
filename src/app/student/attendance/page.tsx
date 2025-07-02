
'use client';

import { useState, useMemo, useEffect } from "react";
import type { DayContentProps } from "react-day-picker";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar } from "@/components/ui/calendar";
import { studentsData, holidays } from "@/lib/data";
import { cn } from "@/lib/utils";
import { format } from 'date-fns';
import { Badge } from "@/components/ui/badge";
import { CalendarCheck, Utensils, Percent, UserX, CalendarDays } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function StudentAttendancePage() {
    const [month, setMonth] = useState<Date>(new Date(2023, 9, 1));
    const [today, setToday] = useState<Date | undefined>();
    const student = studentsData.find(s => s.id === '8'); // Alex Doe

    useEffect(() => {
        const now = new Date();
        now.setHours(0, 0, 0, 0);
        setToday(now);
    }, []);
    
    const monthOptions = [
        { value: '2023-10', label: 'October 2023' },
        { value: '2023-09', label: 'September 2023' },
        { value: '2023-08', label: 'August 2023' },
        { value: '2023-07', label: 'July 2023' },
    ];

    const monthName = format(month, 'MMMM').toLowerCase() as keyof typeof student.monthlyDetails;
    const currentData = student?.monthlyDetails[monthName] || { attendance: '0%', bill: { total: 0, paid: 0 }, status: 'Paid' };
    
     const { 
        presentDaysCount, absentDaysCount, holidaysCount, totalMealsCount,
        fullDayDays, lunchOnlyDays, dinnerOnlyDays, absentDays, presentDays
    } = useMemo(() => {
        if (!today || !student) {
            return {
                presentDaysCount: 0, absentDaysCount: 0, holidaysCount: 0, totalMealsCount: 0,
                fullDayDays: [], lunchOnlyDays: [], dinnerOnlyDays: [], absentDays: [], presentDays: []
            };
        }

        const year = month.getFullYear();
        const monthIndex = month.getMonth();
        const daysInMonth = new Date(year, monthIndex + 1, 0).getDate();
        
        const allDays = Array.from({ length: daysInMonth }, (_, i) => new Date(year, monthIndex, i + 1));
        
        const pastOrTodayDays = allDays.filter(d => d <= new Date(2023, 9, 27));

        const holidaysThisMonth = allDays.filter(day => 
            holidays.some(h => format(h.date, 'yyyy-MM-dd') === format(day, 'yyyy-MM-dd'))
        );
        
        const workingDays = pastOrTodayDays.filter(day => !holidaysThisMonth.some(h => h.getTime() === day.getTime()));
        
        const totalConsideredDays = workingDays.length;
        const attendancePercent = parseFloat(currentData.attendance) / 100;
        
        const totalPresentDays = totalConsideredDays > 0 ? Math.round(totalConsideredDays * attendancePercent) : 0;
        
        const seededRandom = (seed: number) => {
            let x = Math.sin(seed + student.id.charCodeAt(0)) * 10000;
            return x - Math.floor(x);
        };
        const shuffledWorkingDays = [...workingDays].sort((a, b) => seededRandom(a.getDate()) - seededRandom(b.getDate()));
        
        const presentDaysArr = shuffledWorkingDays.slice(0, totalPresentDays);
        const absentDaysArr = shuffledWorkingDays.slice(totalPresentDays);
        
        let fdd: Date[] = [];
        let lod: Date[] = [];
        let dod: Date[] = [];
        let tMealsCount = 0;

        if (student.messPlan === 'full_day') {
            const fDaysCount = Math.round(presentDaysArr.length * 0.9);
            fdd = presentDaysArr.slice(0, fDaysCount);
            const hdd = presentDaysArr.slice(fDaysCount);
            
            lod = hdd.filter((_, i) => i % 2 === 0);
            dod = hdd.filter((_, i) => i % 2 !== 0);
            
            tMealsCount = (fdd.length * 2) + hdd.length;
        } else {
            tMealsCount = presentDaysArr.length;
        }

        return {
            presentDaysCount: presentDaysArr.length, 
            absentDaysCount: absentDaysArr.length,
            holidaysCount: holidaysThisMonth.length,
            totalMealsCount: tMealsCount,
            fullDayDays: fdd, 
            lunchOnlyDays: lod,
            dinnerOnlyDays: dod, 
            absentDays: absentDaysArr,
            presentDays: student.messPlan !== 'full_day' ? presentDaysArr : []
        };
    }, [month, student, currentData.attendance, today]);

    const CustomDayContentForPlan = ({ date, activeModifiers }: DayContentProps) => {
        if (!student || student.messPlan !== 'full_day') {
            return <div className="relative h-full w-full flex items-center justify-center">{date.getDate()}</div>;
        }

        let dots = null;

        if (activeModifiers.fullDay) {
            dots = <><div className="h-1 w-1 rounded-full bg-white" /><div className="h-1 w-1 rounded-full bg-white" /></>;
        } else if (activeModifiers.lunchOnly || activeModifiers.dinnerOnly) {
            dots = <><div className="h-1 w-1 rounded-full bg-white" /></>;
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
    };

    const calendarModifiers = useMemo(() => {
        if (!student) return {};
        const baseModifiers = {
            absent: absentDays,
            holiday: holidays.map(h => h.date),
        };

        if (student.messPlan === 'full_day') {
            return {
                ...baseModifiers,
                fullDay: fullDayDays,
                lunchOnly: lunchOnlyDays,
                dinnerOnly: dinnerOnlyDays,
            }
        }
        return { ...baseModifiers, present: presentDays };
    }, [student, fullDayDays, lunchOnlyDays, dinnerOnlyDays, absentDays, presentDays]);


    if (!student) {
        return <div>Loading student data...</div>
    }

    return (
        <div className="flex flex-col gap-8 animate-in fade-in-0 slide-in-from-top-5 duration-700">
            <div className="flex flex-wrap items-center justify-between gap-4">
                <h1 className="text-2xl font-bold tracking-tight">My Attendance</h1>
                 <Select
                    value={format(month, 'yyyy-MM')}
                    onValueChange={(value) => setMonth(new Date(value))}
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
                        <p className="text-xs text-muted-foreground">Meals attended this month</p>
                    </CardContent>
                </Card>
                 <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Present</CardTitle>
                        <CalendarCheck className="h-5 w-5 text-green-400" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{presentDaysCount} Days</div>
                        <p className="text-xs text-muted-foreground">Days you were marked present</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Absent</CardTitle>
                        <UserX className="h-5 w-5 text-destructive" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{absentDaysCount}</div>
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
                        modifiers={calendarModifiers}
                        components={{ DayContent: CustomDayContentForPlan }}
                        modifiersClassNames={{
                            fullDay: "bg-chart-2 text-primary-foreground",
                            lunchOnly: "bg-chart-3 text-primary-foreground",
                            dinnerOnly: "bg-chart-3 text-primary-foreground",
                            present: "bg-chart-2 text-primary-foreground",
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
                        {student.messPlan === 'full_day' ? (
                            <>
                                <div className="flex items-center gap-2"><span className="h-4 w-4 shrink-0 rounded-full bg-chart-2" />Full Day (Present)</div>
                                <div className="flex items-center gap-2"><span className="h-4 w-4 shrink-0 rounded-full bg-chart-3" />Half Day (Present)</div>
                            </>
                        ) : (
                            <div className="flex items-center gap-2"><span className="h-4 w-4 shrink-0 rounded-full bg-chart-2" />Present</div>
                        )}
                        <div className="flex items-center gap-2"><span className="h-4 w-4 shrink-0 rounded-full bg-destructive" />Absent / On Leave</div>
                        <div className="flex items-center gap-2"><span className="h-4 w-4 shrink-0 rounded-full bg-primary/40" />Mess Holiday</div>
                        <div className="flex items-center gap-2"><Badge variant="outline" className="border-accent text-accent">Today</Badge><span>Current Date</span></div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
