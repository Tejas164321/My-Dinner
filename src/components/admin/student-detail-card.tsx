'use client';

import { useState } from "react";
import type { DayContentProps } from "react-day-picker";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { Student } from "@/lib/data";
import { User, Phone, Home, Calendar as CalendarIcon, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { format } from 'date-fns';
import { Separator } from "@/components/ui/separator";
import { DialogClose } from "@/components/ui/dialog";

// Demo data for different attendance types for October 2023
const fullDayDays = [new Date(2023, 9, 2), new Date(2023, 9, 3), new Date(2023, 9, 8), new Date(2023, 9, 9), new Date(2023, 9, 12), new Date(2023, 9, 13), new Date(2023, 9, 15), new Date(2023, 9, 16), new Date(2023, 9, 17), new Date(2023, 9, 22), new Date(2023, 9, 23), new Date(2023, 9, 24), new Date(2023, 9, 25)];
const lunchOnlyDays = [new Date(2023, 9, 4), new Date(2023, 9, 20)];
const dinnerOnlyDays = [new Date(2023, 9, 18)];
const absentDays = [new Date(2023, 9, 5), new Date(2023, 9, 10), new Date(2023, 9, 11), new Date(2023, 9, 19)];


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

interface StudentDetailCardProps {
    student: Student;
    initialMonth: Date;
}

export function StudentDetailCard({ student, initialMonth }: StudentDetailCardProps) {
    const [month, setMonth] = useState<Date>(initialMonth);

    const monthName = format(month, 'MMMM').toLowerCase() as keyof typeof student.monthlyDetails;
    const currentData = student.monthlyDetails[monthName] || { attendance: 'N/A', bill: { total: 0, paid: 0 }, status: 'Paid' };
    const remainingBill = currentData.bill.total - currentData.bill.paid;
    
    const showOctoberVisuals = format(month, 'yyyy-MM') === '2023-10';
    
    // New calculations for October
    const fullDaysCount = fullDayDays.length;
    const halfDaysCount = lunchOnlyDays.length + dinnerOnlyDays.length;
    const absentDaysCount = absentDays.length;
    const totalMealsCount = (fullDaysCount * 2) + halfDaysCount;

    return (
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 p-6 w-full bg-background sm:rounded-lg">
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
                        </div>
                        <Badge variant={currentData.status === 'Paid' ? 'secondary' : 'destructive'} className={cn("capitalize text-sm h-7", currentData.status === 'Paid' && "border-transparent bg-green-600 text-primary-foreground hover:bg-green-600/80")}>{currentData.status}</Badge>
                    </CardContent>
                </Card>
                <Card className="flex-grow">
                    <CardHeader>
                        <CardTitle className="text-lg">Attendance Summary</CardTitle>
                    </CardHeader>
                    <CardContent className="flex flex-col justify-center h-full space-y-4 text-sm">
                        {showOctoberVisuals ? (
                            <>
                                <div className="flex justify-between items-center p-3 bg-secondary rounded-lg">
                                    <span className="font-semibold text-foreground">Total Meals Taken</span>
                                    <span className="text-2xl font-bold text-primary">{totalMealsCount}</span>
                                </div>
                                <div className="grid grid-cols-3 gap-2 text-center">
                                    <div>
                                        <p className="text-muted-foreground text-xs">Full Days</p>
                                        <p className="font-semibold text-lg text-green-400">{fullDaysCount}</p>
                                    </div>
                                    <div>
                                        <p className="text-muted-foreground text-xs">Half Days</p>
                                        <p className="font-semibold text-lg text-yellow-400">{halfDaysCount}</p>
                                    </div>
                                    <div>
                                        <p className="text-muted-foreground text-xs">Absent</p>
                                        <p className="font-semibold text-lg text-red-400">{absentDaysCount}</p>
                                    </div>
                                </div>
                            </>
                        ) : (
                            <div className="text-center text-muted-foreground py-8">
                                <p>Detailed attendance summary is only available for October 2023.</p>
                            </div>
                        )}
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader>
                        <CardTitle className="text-lg">Billing</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2 text-sm">
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
                 <DialogClose className="absolute right-0 top-0 z-10 rounded-full border border-border w-7 h-7 flex items-center justify-center opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground">
                    <X className="h-4 w-4" />
                    <span className="sr-only">Close</span>
                 </DialogClose>
                 <Card>
                    <CardHeader>
                        <CardTitle className="text-lg">Personal Details</CardTitle>
                    </CardHeader>
                    <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4 text-sm">
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
                    <CardHeader>
                        <CardTitle>Attendance for {format(month, 'MMMM yyyy')}</CardTitle>
                    </CardHeader>
                    <CardContent className="flex-grow flex items-center justify-center p-0">
                        <Calendar
                            month={month}
                            onMonthChange={setMonth}
                            modifiers={showOctoberVisuals ? {
                                fullDay: fullDayDays,
                                lunchOnly: lunchOnlyDays,
                                dinnerOnly: dinnerOnlyDays,
                                absent: absentDays,
                            } : {}}
                            components={{ DayContent: CustomDayContent }}
                            modifiersClassNames={{
                                fullDay: "bg-chart-2 text-primary-foreground",
                                lunchOnly: "bg-chart-3 text-primary-foreground",
                                dinnerOnly: "bg-chart-3 text-primary-foreground",
                                absent: "bg-destructive text-destructive-foreground",
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
                        <div className={cn(
                            "flex w-full items-center justify-center gap-6 text-xs text-muted-foreground transition-opacity",
                             !showOctoberVisuals && "opacity-0"
                        )}>
                            <div className="flex items-center gap-2">
                                <span className="h-2.5 w-2.5 shrink-0 rounded-full bg-chart-2" />
                                <span>Full Day</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="h-2.5 w-2.5 shrink-0 rounded-full bg-chart-3" />
                                <span>Half Day</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="h-2.5 w-2.5 shrink-0 rounded-full bg-destructive" />
                                <span>Absent</span>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
