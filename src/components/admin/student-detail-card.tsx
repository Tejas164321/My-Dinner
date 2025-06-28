'use client';

import { useState } from "react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { joinedStudents } from "@/lib/data";
import { DollarSign, Percent, User, Phone, Home, Calendar as CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { format } from 'date-fns';
import { Separator } from "@/components/ui/separator";

type Student = (typeof joinedStudents)[number];

// Demo data for different months
const fullDayDays = [new Date(2023, 9, 2), new Date(2023, 9, 3), new Date(2023, 9, 8), new Date(2023, 9, 9), new Date(2023, 9, 12), new Date(2023, 9, 13), new Date(2023, 9, 15), new Date(2023, 9, 16), new Date(2023, 9, 17), new Date(2023, 9, 22), new Date(2023, 9, 23), new Date(2023, 9, 24), new Date(2023, 9, 25)];
const halfDayDays = [new Date(2023, 9, 4), new Date(2023, 9, 18), new Date(2023, 9, 20)];
const absentDays = [new Date(2023, 9, 5), new Date(2023, 9, 10), new Date(2023, 9, 11), new Date(2023, 9, 19)];

export function StudentDetailCard({ student }: { student: Student }) {
    const [month, setMonth] = useState<Date>(new Date(2023, 9, 1));

    // Demo data for different months
    const historicalData: { [key: string]: { attendance: string; bill: { total: number; paid: number; remaining: number; }; status: 'Paid' | 'Due' } } = {
        '2023-07': { attendance: '90%', bill: { total: 3200, paid: 3200, remaining: 0 }, status: 'Paid' },
        '2023-08': { attendance: '88%', bill: { total: 3150, paid: 3150, remaining: 0 }, status: 'Paid' },
        '2023-09': { attendance: '95%', bill: { total: 3250, paid: 3250, remaining: 0 }, status: 'Paid' },
        '2023-10': student.status === 'Due'
            ? { attendance: student.attendance, bill: { total: 3250, paid: 0, remaining: 3250 }, status: 'Due' }
            : { attendance: student.attendance, bill: { total: 3250, paid: 3250, remaining: 0 }, status: 'Paid' },
    };

    const monthKey = format(month, 'yyyy-MM');
    const currentData = historicalData[monthKey] || { attendance: 'N/A', bill: { total: 0, paid: 0, remaining: 0 }, status: 'Paid' };
    
    // Only show colored days for October for this demo
    const showOctoberVisuals = format(month, 'yyyy-MM') === '2023-10';

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 w-full max-w-7xl mx-auto">
            {/* Left Column: Profile, Attendance, Billing */}
            <div className="lg:col-span-1 flex flex-col gap-6">
                <Card>
                    <CardContent className="p-6 flex flex-col items-center text-center gap-4">
                        <Avatar className="w-24 h-24 border-4 border-primary/20">
                            <AvatarFallback className="text-3xl">{student.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                        </Avatar>
                        <div className="space-y-1">
                            <h2 className="text-2xl font-bold">{student.name}</h2>
                            <p className="text-muted-foreground">{student.studentId}</p>
                        </div>
                        <Badge variant={currentData.status === 'Paid' ? 'secondary' : 'destructive'} className={cn("capitalize text-sm", currentData.status === 'Paid' && "border-transparent bg-green-600 text-primary-foreground hover:bg-green-600/80")}>{currentData.status}</Badge>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader>
                        <CardTitle>Attendance</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-4xl font-bold text-center">{currentData.attendance}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader>
                        <CardTitle>Billing</CardTitle>
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
                        <Separator />
                        <div className="flex justify-between font-semibold">
                            <span className="text-foreground">Remaining:</span>
                            <span className={cn(currentData.bill.remaining > 0 ? 'text-destructive' : 'text-foreground')}>₹{currentData.bill.remaining.toLocaleString()}</span>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Right Column: Personal Details & Calendar */}
            <div className="lg:col-span-2 flex flex-col gap-6">
                <Card>
                    <CardHeader>
                        <CardTitle>Personal Details</CardTitle>
                    </CardHeader>
                    <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                        <div className="flex items-center gap-3">
                            <User className="w-4 h-4 text-muted-foreground"/>
                            <span className="text-muted-foreground truncate">{student.email}</span>
                        </div>
                        <div className="flex items-center gap-3">
                            <Phone className="w-4 h-4 text-muted-foreground"/>
                            <span className="text-muted-foreground">{student.contact}</span>
                        </div>
                        <div className="flex items-center gap-3">
                            <Home className="w-4 h-4 text-muted-foreground"/>
                            <span className="text-muted-foreground">{student.roomNo}</span>
                        </div>
                        <div className="flex items-center gap-3">
                            <CalendarIcon className="w-4 h-4 text-muted-foreground"/>
                            <span className="text-muted-foreground">{student.joinDate}</span>
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
                                halfDay: halfDayDays,
                                absent: absentDays,
                            } : {}}
                            modifiersClassNames={{
                                fullDay: "bg-chart-2 text-primary-foreground rounded-full",
                                halfDay: "bg-chart-3 text-primary-foreground rounded-full",
                                absent: "bg-destructive text-destructive-foreground rounded-full",
                            }}
                            classNames={{
                                months: "w-full",
                                month: "w-full space-y-4",
                                head_cell: "text-muted-foreground w-9 font-normal text-sm",
                                cell: "h-9 w-9 text-center text-sm p-0 relative",
                                day: "h-9 w-9 p-0 font-normal aria-selected:opacity-100 rounded-full",
                                day_today: "bg-accent text-accent-foreground rounded-full",
                            }}
                            className="p-3"
                            showOutsideDays={false}
                        />
                    </CardContent>
                    <CardFooter className="p-4 pt-2 border-t mt-auto">
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
                    </CardFooter>
                </Card>
            </div>
        </div>
    );
}
