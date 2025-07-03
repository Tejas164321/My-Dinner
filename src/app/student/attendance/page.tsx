
'use client';

import { useState, useMemo, useEffect } from "react";
import type { DayContentProps } from "react-day-picker";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar } from "@/components/ui/calendar";
import { studentsData, holidays, leaveHistory } from "@/lib/data";
import { cn } from "@/lib/utils";
import { format, isSameMonth, isSameDay } from 'date-fns';
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
        setToday(new Date(2023, 9, 27)); // Fixed date for consistency
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
    } = useMemo(() => {
        if (!today || !student) {
            return {
                presentDaysCount: 0, absentDaysCount: 0, holidaysCount: 0, totalMealsCount: 0,
            };
        }

        const year = month.getFullYear();
        const monthIndex = month.getMonth();
        const daysInMonth = new Date(year, monthIndex + 1, 0).getDate();
        
        const allDays = Array.from({ length: daysInMonth }, (_, i) => new Date(year, monthIndex, i + 1));
        
        const pastOrTodayDays = allDays.filter(d => d <= today);

        const holidaysThisMonth = allDays.filter(day => 
            holidays.some(h => format(h.date, 'yyyy-MM-dd') === format(day, 'yyyy-MM-dd'))
        );
        
        const workingDays = pastOrTodayDays.filter(day => !holidaysThisMonth.some(h => h.getTime() === day.getTime()));
        
        const totalConsideredDays = workingDays.length;
        const attendancePercent = parseFloat(currentData.attendance) / 100;
        
        const totalPresentDays = totalConsideredDays > 0 ? Math.round(totalConsideredDays * attendancePercent) : 0;
        const totalAbsentDays = totalConsideredDays - totalPresentDays;
        
        let tMealsCount = 0;
        if (student.messPlan === 'full_day') {
            const fDaysCount = Math.round(totalPresentDays * 0.9);
            const hdd = totalPresentDays - fDaysCount;
            tMealsCount = (fDaysCount * 2) + hdd;
        } else {
            tMealsCount = totalPresentDays;
        }

        return {
            presentDaysCount: totalPresentDays, 
            absentDaysCount: totalAbsentDays,
            holidaysCount: holidaysThisMonth.length,
            totalMealsCount: tMealsCount,
        };
    }, [month, student, currentData.attendance, today]);

    const {
        holidayDays,
        fullLeaveDays,
        halfPresentDays,
        fullPresentDays,
        leaveTypeMap,
        holidayTypeMap,
    } = useMemo(() => {
        if (!student) return { holidayDays: [], fullLeaveDays: [], halfPresentDays: [], fullPresentDays: [], leaveTypeMap: new Map(), holidayTypeMap: new Map() };
        
        const year = month.getFullYear();
        const monthIndex = month.getMonth();
        const daysInMonth = new Date(year, monthIndex + 1, 0).getDate();
        const allDaysInMonth = Array.from({ length: daysInMonth }, (_, i) => new Date(year, monthIndex, i + 1));
        
        const hDays: Date[] = [];
        const flDays: Date[] = [];
        const hpDays: Date[] = [];
        const fpDays: Date[] = [];

        const studentLeaves = leaveHistory.filter(l => l.studentId === student.id);
        const ltm = new Map(studentLeaves.map(l => [format(l.date, 'yyyy-MM-dd'), l.type]));
        const htm = new Map(holidays.map(h => [format(h.date, 'yyyy-MM-dd'), h.type]));

        allDaysInMonth.forEach(day => {
            const dateKey = format(day, 'yyyy-MM-dd');
            const holidayType = htm.get(dateKey);
            const leaveType = ltm.get(dateKey);

            if (holidayType) {
                hDays.push(day);
            } else if (leaveType) {
                if (leaveType === 'full_day') {
                    flDays.push(day);
                } else {
                    hpDays.push(day);
                }
            } else {
                 if (student.messPlan === 'full_day') {
                    fpDays.push(day);
                } else {
                    hpDays.push(day);
                }
            }
        });

        return { 
            holidayDays: hDays,
            fullLeaveDays: flDays,
            halfPresentDays: hpDays,
            fullPresentDays: fpDays,
            leaveTypeMap: ltm,
            holidayTypeMap: htm,
        };
    }, [month, student]);

    const CustomDayContent = ({ date }: DayContentProps) => {
        if (!student || !today || date > today) {
            return <div className="relative h-full w-full flex items-center justify-center">{date.getDate()}</div>;
        }

        const dateKey = format(date, 'yyyy-MM-dd');
        const leaveType = leaveTypeMap.get(dateKey);
        const holidayType = holidayTypeMap.get(dateKey);
        
        const isLunchAttended = !(
            (holidayType === 'full_day' || holidayType === 'lunch_only') ||
            (leaveType === 'full_day' || leaveType === 'lunch_only')
        ) && (student.messPlan === 'full_day' || student.messPlan === 'lunch_only');
    
        const isDinnerAttended = !(
            (holidayType === 'full_day' || holidayType === 'dinner_only') ||
            (leaveType === 'full_day' || leaveType === 'dinner_only')
        ) && (student.messPlan === 'full_day' || student.messPlan === 'dinner_only');

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
                        modifiers={{
                            holiday: holidayDays,
                            full_leave: fullLeaveDays,
                            half_present: halfPresentDays,
                            full_present: fullPresentDays,
                        }}
                        components={{ DayContent: CustomDayContent }}
                        modifiersClassNames={{
                            holiday: 'bg-primary/40 text-primary-foreground',
                            full_leave: 'bg-destructive text-destructive-foreground',
                            half_present: 'bg-chart-3 text-primary-foreground',
                            full_present: 'bg-chart-2 text-primary-foreground',
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
                        <div className="flex items-center gap-2"><span className="h-4 w-4 shrink-0 rounded-full bg-chart-3" />Half Day Present</div>
                        <div className="flex items-center gap-2"><span className="h-4 w-4 shrink-0 rounded-full bg-destructive" />Full Day Leave</div>
                        <div className="flex items-center gap-2"><span className="h-4 w-4 shrink-0 rounded-full bg-primary/40" />Holiday</div>
                        <div className="flex items-center gap-2"><Badge variant="outline" className="border-accent text-accent">Today</Badge><span>Current Date</span></div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
