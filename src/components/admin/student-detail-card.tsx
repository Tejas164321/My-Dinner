'use client';

import { useState } from "react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { joinedStudents } from "@/lib/data";
import { DollarSign, Percent } from "lucide-react";
import { cn } from "@/lib/utils";
import { format } from 'date-fns';

type Student = (typeof joinedStudents)[number];

const fullDayDays = [new Date(2023, 9, 2), new Date(2023, 9, 3), new Date(2023, 9, 8), new Date(2023, 9, 9), new Date(2023, 9, 12), new Date(2023, 9, 13), new Date(2023, 9, 15), new Date(2023, 9, 16), new Date(2023, 9, 17), new Date(2023, 9, 22), new Date(2023, 9, 23), new Date(2023, 9, 24), new Date(2023, 9, 25)];
const halfDayDays = [new Date(2023, 9, 4), new Date(2023, 9, 18), new Date(2023, 9, 20)];
const absentDays = [new Date(2023, 9, 5), new Date(2023, 9, 10), new Date(2023, 9, 11), new Date(2023, 9, 19)];

export function StudentDetailCard({ student }: { student: Student }) {
    const [month, setMonth] = useState<Date>(new Date(2023, 9, 1));

    const historicalData: { [key: string]: { attendance: string; bill: string; status: 'Paid' | 'Due' } } = {
        '2023-07': { attendance: '90%', bill: '₹3,200', status: 'Paid' },
        '2023-08': { attendance: '88%', bill: '₹3,150', status: 'Paid' },
        '2023-09': { attendance: '95%', bill: '₹0', status: 'Paid' },
        '2023-10': { attendance: student.attendance, bill: student.bill, status: student.status as 'Paid' | 'Due' },
    };

    const monthKey = format(month, 'yyyy-MM');
    const currentData = historicalData[monthKey] || { attendance: 'N/A', bill: '₹0', status: 'Paid' };
    
    const showOctoberVisuals = format(month, 'yyyy-MM') === '2023-10';

    return (
        <Card className="grid grid-cols-1 lg:grid-cols-5 gap-6 p-6 animate-in fade-in-0 duration-500">
            {/* Right Column (Info & Stats) */}
            <div className="lg:col-span-2 flex flex-col gap-6">
                <div className="flex flex-col items-center text-center gap-4 p-6 bg-secondary/30 rounded-lg">
                    <Avatar className="w-20 h-20 border-4 border-primary/20">
                        <AvatarFallback>{student.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div className="space-y-1">
                        <h2 className="text-2xl font-bold">{student.name}</h2>
                        <p className="text-muted-foreground">{student.studentId}</p>
                    </div>
                    <Badge variant={currentData.status === 'Paid' ? 'secondary' : 'destructive'} className="capitalize">{currentData.status}</Badge>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                     <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Attendance</CardTitle>
                            <Percent className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{currentData.attendance}</div>
                            <p className="text-xs text-muted-foreground">in {format(month, 'MMMM')}</p>
                        </CardContent>
                    </Card>
                     <Card className={cn(currentData.status === 'Due' && 'border-destructive/50')}>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Amount Due</CardTitle>
                            <DollarSign className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className={cn("text-2xl font-bold", currentData.status === 'Due' && "text-destructive")}>{currentData.bill}</div>
                             <p className="text-xs text-muted-foreground">for {format(month, 'MMMM')}</p>
                        </CardContent>
                    </Card>
                </div>

                <Card>
                    <CardHeader className="pb-4">
                        <CardTitle className="text-base">Personal Information</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-3 text-sm">
                            <p><strong>Email:</strong> <span className="text-muted-foreground">{student.email}</span></p>
                            <p><strong>Contact:</strong> <span className="text-muted-foreground">{student.contact}</span></p>
                            <p><strong>Room No:</strong> <span className="text-muted-foreground">{student.roomNo}</span></p>
                            <p><strong>Joined:</strong> <span className="text-muted-foreground">{student.joinDate}</span></p>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Left Column (Calendar) */}
            <div className="lg:col-span-3">
                <Card className="h-full">
                    <CardHeader>
                        <CardTitle>{format(month, 'MMMM yyyy')} Attendance</CardTitle>
                    </CardHeader>
                    <CardContent className="flex flex-col items-center justify-center gap-4 p-4">
                        <Calendar
                            month={month}
                            onMonthChange={setMonth}
                            selected={[]}
                            onSelect={() => {}} 
                            showOutsideDays={false}
                            modifiers={showOctoberVisuals ? {
                                fullDay: fullDayDays,
                                halfDay: halfDayDays,
                                absent: absentDays,
                            } : {}}
                            classNames={{
                                months: "w-full",
                                month: "w-full space-y-4",
                                head_cell: "text-foreground/80 w-12 font-normal text-sm",
                                cell: "h-12 w-12 text-center text-base p-0 relative",
                                day: "h-12 w-12 p-0 font-normal aria-selected:opacity-100 rounded-full",
                                day_today: "bg-accent text-accent-foreground rounded-full",
                            }}
                            modifiersClassNames={{
                                fullDay: "bg-chart-2 text-primary-foreground",
                                halfDay: "bg-chart-3 text-primary-foreground",
                                absent: "bg-destructive text-destructive-foreground",
                            }}
                            className="rounded-md border border-border/50 p-3"
                        />
                        <div className={cn(
                            "flex w-full items-center justify-center gap-6 rounded-md border bg-secondary/30 p-2 text-xs text-muted-foreground transition-opacity",
                            !showOctoberVisuals && "invisible h-9"
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
        </Card>
    );
}
