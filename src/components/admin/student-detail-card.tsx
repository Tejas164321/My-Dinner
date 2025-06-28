'use client';

import { useState } from "react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { joinedStudents } from "@/lib/data";
import { DollarSign, Percent } from "lucide-react";
import { cn } from "@/lib/utils";
import { format } from 'date-fns';
import { Separator } from "@/components/ui/separator";

type Student = (typeof joinedStudents)[number];

const fullDayDays = [new Date(2023, 9, 2), new Date(2023, 9, 3), new Date(2023, 9, 8), new Date(2023, 9, 9), new Date(2023, 9, 12), new Date(2023, 9, 13), new Date(2023, 9, 15), new Date(2023, 9, 16), new Date(2023, 9, 17), new Date(2023, 9, 22), new Date(2023, 9, 23), new Date(2023, 9, 24), new Date(2023, 9, 25)];
const halfDayDays = [new Date(2023, 9, 4), new Date(2023, 9, 18), new Date(2023, 9, 20)];
const absentDays = [new Date(2023, 9, 5), new Date(2023, 9, 10), new Date(2023, 9, 11), new Date(2023, 9, 19)];

export function StudentDetailCard({ student }: { student: Student }) {
    const [month, setMonth] = useState<Date>(new Date(2023, 9, 1));

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
    
    const showOctoberVisuals = format(month, 'yyyy-MM') === '2023-10';

    return (
        <Card className="flex flex-col lg:flex-row gap-6 p-6 w-full">
            {/* Left Column: Profile, Info, and Stats */}
            <div className="w-full lg:w-[360px] flex-shrink-0 flex flex-col gap-6">
                <Card className="flex-grow">
                    <CardContent className="p-6 flex flex-col h-full">
                        <div className="flex flex-col items-center text-center gap-4">
                            <Avatar className="w-24 h-24 border-4 border-primary/20">
                                <AvatarFallback className="text-3xl">{student.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                            </Avatar>
                            <div className="space-y-1">
                                <h2 className="text-2xl font-bold">{student.name}</h2>
                                <p className="text-muted-foreground">{student.studentId}</p>
                            </div>
                             <Badge variant={currentData.status === 'Paid' ? 'secondary' : 'destructive'} className="capitalize text-sm">{currentData.status}</Badge>
                        </div>
                        
                        <Separator className="my-6"/>
                        
                        <div className="space-y-4 text-sm flex-grow">
                             <div className="flex justify-between items-center">
                                <span className="font-semibold text-foreground/80">Email:</span>
                                <span className="text-muted-foreground truncate max-w-[200px]">{student.email}</span>
                            </div>
                             <div className="flex justify-between items-center">
                                <span className="font-semibold text-foreground/80">Contact:</span>
                                <span className="text-muted-foreground">{student.contact}</span>
                            </div>
                             <div className="flex justify-between items-center">
                                <span className="font-semibold text-foreground/80">Room No:</span>
                                <span className="text-muted-foreground">{student.roomNo}</span>
                            </div>
                             <div className="flex justify-between items-center">
                                <span className="font-semibold text-foreground/80">Joined:</span>
                                <span className="text-muted-foreground">{student.joinDate}</span>
                            </div>
                        </div>

                        <Separator className="my-6"/>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <Card>
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                    <CardTitle className="text-sm font-medium">Attendance</CardTitle>
                                    <Percent className="h-4 w-4 text-muted-foreground" />
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold">{currentData.attendance}</div>
                                </CardContent>
                            </Card>
                            <Card>
                                <CardHeader className="pb-2">
                                    <CardTitle className="text-sm font-medium">Billing</CardTitle>
                                </CardHeader>
                                <CardContent>
                                   <div className="text-2xl font-bold">₹{currentData.bill.remaining.toLocaleString()}</div>
                                </CardContent>
                            </Card>
                        </div>

                    </CardContent>
                </Card>
            </div>

            {/* Right Column: Calendar */}
            <div className="w-full lg:flex-1">
                <Card className="h-full flex flex-col">
                    <CardHeader>
                        <CardTitle className="text-xl">
                            Attendance for {format(month, 'MMMM yyyy')}
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="flex-1 flex items-center justify-center p-0">
                        <Calendar
                            month={month}
                            onMonthChange={setMonth}
                            showOutsideDays={false}
                            modifiers={showOctoberVisuals ? {
                                fullDay: fullDayDays,
                                halfDay: halfDayDays,
                                absent: absentDays,
                            } : {}}
                            classNames={{
                                months: "w-full",
                                month: "w-full space-y-4",
                                head_cell: "text-foreground/80 w-10 font-normal text-sm",
                                cell: "h-10 w-10 text-center text-sm p-0 relative",
                                day: "h-10 w-10 p-0 font-normal aria-selected:opacity-100 rounded-full",
                                day_today: "bg-accent text-accent-foreground rounded-full",
                            }}
                            modifiersClassNames={{
                                fullDay: "bg-chart-2 text-primary-foreground rounded-full",
                                halfDay: "bg-chart-3 text-primary-foreground rounded-full",
                                absent: "bg-destructive text-destructive-foreground rounded-full",
                            }}
                            className="p-3"
                        />
                    </CardContent>
                    <CardFooter className="p-4 pt-2">
                        <div className={cn(
                            "flex w-full items-center justify-center gap-6 rounded-md border bg-secondary/30 p-2 text-xs text-muted-foreground transition-opacity",
                            !showOctoberVisuals && "invisible"
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
        </Card>
    );
}
