
'use client';

import { useMemo, useState, useEffect, type ComponentProps } from "react";
import type { DayContentProps } from "react-day-picker";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import type { Student, Holiday } from "@/lib/data";
import { holidays } from "@/lib/data";
import { User, Phone, Home, Calendar as CalendarIcon, X, Utensils, Sun, Moon, Check, UserCheck, UserX, CalendarDays } from "lucide-react";
import { cn } from "@/lib/utils";
import { format } from 'date-fns';
import { Separator } from "@/components/ui/separator";

const planInfo = {
    full_day: { icon: Utensils, text: 'Full Day', color: 'text-primary' },
    lunch_only: { icon: Sun, text: 'Lunch Only', color: 'text-yellow-400' },
    dinner_only: { icon: Moon, text: 'Dinner Only', color: 'text-purple-400' }
};

interface StudentDetailCardProps {
    student: Student;
    initialMonth: Date;
}

export function StudentDetailCard({ student, initialMonth }: StudentDetailCardProps) {
    const [month, setMonth] = useState<Date>(initialMonth);
    const [today, setToday] = useState<Date | undefined>();

    useEffect(() => {
        const now = new Date();
        now.setHours(0, 0, 0, 0);
        setToday(now);
    }, []);

    const monthName = format(month, 'MMMM').toLowerCase() as keyof typeof student.monthlyDetails;
    const currentData = student.monthlyDetails[monthName] || { attendance: '0%', bill: { total: 0, paid: 0 }, status: 'Paid' };
    const remainingBill = currentData.bill.total - currentData.bill.paid;
    
    const { 
        presentDaysCount, absentDaysCount, holidaysCount, totalMealsCount,
        fullDayDays, lunchOnlyDays, dinnerOnlyDays, absentDays, presentDays
    } = useMemo(() => {
        if (!today) {
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
    }, [month, student.id, student.messPlan, currentData.attendance, today]);

    const CustomDayContentForPlan = ({ date, activeModifiers }: DayContentProps) => {
        if (student.messPlan !== 'full_day') {
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
    }, [student.messPlan, fullDayDays, lunchOnlyDays, dinnerOnlyDays, absentDays, presentDays]);

    const currentPlan = planInfo[student.messPlan];
    const PlanIcon = currentPlan.icon;

    return (
        <Card className="grid grid-cols-1 lg:grid-cols-5 gap-6 p-6 w-full relative">
            {/* Left Column */}
            <div className="lg:col-span-2 flex flex-col gap-6">
                <Card>
                    <CardContent className="p-4 flex items-center gap-4">
                        <Avatar className="w-14 h-14 border-4 border-primary/20">
                            <AvatarFallback className="text-xl">{student.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1 space-y-0.5">
                            <h2 className="text-xl font-bold">{student.name}</h2>
                            <p className="text-sm text-muted-foreground">{student.studentId}</p>
                            <Badge variant="outline" className="font-semibold mt-2">
                                <PlanIcon className={cn("mr-1.5 h-4 w-4", currentPlan.color)} />
                                {currentPlan.text}
                            </Badge>
                        </div>
                        <Badge variant={currentData.status === 'Paid' ? 'secondary' : 'destructive'} className={cn("capitalize text-sm h-7", currentData.status === 'Paid' && "border-transparent bg-green-600 text-primary-foreground hover:bg-green-600/80")}>{currentData.status}</Badge>
                    </CardContent>
                </Card>
                
                <Card className="flex-grow flex flex-col">
                    <CardHeader className="p-4 pb-2">
                        <CardTitle className="text-lg">Attendance Summary</CardTitle>
                        <CardDescription>for {format(month, 'MMMM yyyy')}</CardDescription>
                    </CardHeader>
                    <CardContent className="flex-grow p-4 pt-2">
                        <div className="space-y-3">
                            <div className="flex justify-between items-center">
                                <p className="text-muted-foreground">Monthly Attendance</p>
                                <p className="font-bold text-2xl text-primary">{currentData.attendance}</p>
                            </div>
                            <div className="flex justify-between items-center">
                                <p className="text-muted-foreground">Total Meals Taken</p>
                                <p className="font-bold text-2xl text-primary">{totalMealsCount}</p>
                            </div>
                            <Separator />
                            <div className="flex justify-around text-center">
                                <div>
                                    <p className="font-bold text-lg text-green-400">{presentDaysCount}</p>
                                    <p className="text-xs text-muted-foreground">Present</p>
                                </div>
                                <div>
                                    <p className="font-bold text-lg text-destructive">{absentDaysCount}</p>
                                    <p className="text-xs text-muted-foreground">Absent</p>
                                </div>
                                <div>
                                    <p className="font-bold text-lg text-blue-400">{holidaysCount}</p>
                                    <p className="text-xs text-muted-foreground">Holidays</p>
                                </div>
                            </div>
                            {student.messPlan === 'full_day' && (
                            <p className="text-center text-xs text-muted-foreground">
                                ({fullDayDays.length} full days & {lunchOnlyDays.length + dinnerOnlyDays.length} half days)
                            </p>
                            )}
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="p-4 pb-2">
                        <CardTitle className="text-lg">Billing</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2 text-sm p-4 pt-2">
                        <div className="flex justify-between">
                            <span className="text-muted-foreground">Total:</span>
                            <span>₹{currentData.bill.total.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-muted-foreground">Paid:</span>
                            <span className="text-green-400">₹{currentData.bill.paid.toLocaleString()}</span>
                        </div>
                        <Separator/>
                        <div className="flex justify-between font-semibold">
                            <span className="text-foreground">Remaining:</span>
                            <span className={cn(remainingBill > 0 ? 'text-destructive' : 'text-foreground')}>₹{remainingBill.toLocaleString()}</span>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Right Column */}
            <div className="lg:col-span-3 flex flex-col gap-6 relative">
                 <Card>
                    <CardHeader className="p-4 pb-2">
                        <CardTitle className="text-lg">Personal Details</CardTitle>
                    </CardHeader>
                    <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3 p-4 pt-2 text-sm">
                        <div className="flex items-center gap-3">
                            <User className="w-4 h-4 text-muted-foreground flex-shrink-0"/>
                            <span className="text-muted-foreground truncate">{student.email}</span>
                        </div>
                         <div className="flex items-center gap-3">
                            <Home className="w-4 h-4 text-muted-foreground flex-shrink-0"/>
                            <span className="text-muted-foreground">{student.roomNo}</span>
                        </div>
                        <div className="flex items-center gap-3">
                            <Phone className="w-4 h-4 text-muted-foreground flex-shrink-0"/>
                            <span className="text-muted-foreground">{student.contact}</span>
                        </div>
                        <div className="flex items-center gap-3">
                            <CalendarIcon className="w-4 h-4 text-muted-foreground flex-shrink-0"/>
                            <span className="text-muted-foreground">Joined: {student.joinDate}</span>
                        </div>
                    </CardContent>
                </Card>
                <Card className="flex-1 flex flex-col">
                    <CardHeader className="p-4 pb-0">
                        <CardTitle>Attendance for {format(month, 'MMMM yyyy')}</CardTitle>
                    </CardHeader>
                    <CardContent className="flex-grow flex items-center justify-center p-0">
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
                            disabled
                        />
                    </CardContent>
                    <CardContent className="p-4 pt-2 mt-auto">
                        <div className="flex w-full items-center justify-center gap-4 text-xs text-muted-foreground">
                             {student.messPlan === 'full_day' ? (
                                <>
                                    <div className="flex items-center gap-2"><span className="h-2.5 w-2.5 shrink-0 rounded-full bg-chart-2" />Full Day</div>
                                    <div className="flex items-center gap-2"><span className="h-2.5 w-2.5 shrink-0 rounded-full bg-chart-3" />Half Day</div>
                                </>
                            ) : (
                                <div className="flex items-center gap-2"><span className="h-2.5 w-2.5 shrink-0 rounded-full bg-chart-2" />Present</div>
                            )}
                            <div className="flex items-center gap-2"><span className="h-2.5 w-2.5 shrink-0 rounded-full bg-destructive" />Absent</div>
                            <div className="flex items-center gap-2"><span className="h-2.5 w-2.5 shrink-0 rounded-full bg-primary/40" />Holiday</div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </Card>
    );
}
