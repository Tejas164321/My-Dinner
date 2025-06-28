// This is a new file

'use client';

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import type { joinedStudents } from "@/lib/data";
import { DollarSign, Percent, Phone, Trash2 } from "lucide-react";

type Student = (typeof joinedStudents)[number];

export function StudentDetailCard({ student }: { student: Student }) {
    // Using a fixed date for consistent display in the prototype
    const today = new Date(2023, 9, 27); // Oct 27, 2023

    // Mock data for calendar
    const attendedDays = [new Date(2023, 9, 2), new Date(2023, 9, 3), new Date(2023, 9, 4), new Date(2023, 9, 8), new Date(2023, 9, 9), new Date(2023, 9, 12), new Date(2023, 9, 13), new Date(2023, 9, 15), new Date(2023, 9, 16), new Date(2023, 9, 17), new Date(2023, 9, 18), new Date(2023, 9, 20), new Date(2023, 9, 22), new Date(2023, 9, 23), new Date(2023, 9, 24), new Date(2023, 9, 25)];
    const absentDays = [new Date(2023, 9, 5), new Date(2023, 9, 19)];
    const onLeaveDays = [new Date(2023, 9, 10), new Date(2023, 9, 11)];

    return (
        <Card className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-in fade-in-0 duration-500">
            <div className="lg:col-span-1 flex flex-col items-center text-center gap-4 p-6 bg-secondary/30 rounded-l-xl">
                <Avatar className="w-24 h-24 border-4 border-primary/20">
                    
                    <AvatarFallback>{student.name.charAt(0)}</AvatarFallback>
                </Avatar>
                <div className="space-y-1">
                    <h2 className="text-2xl font-bold">{student.name}</h2>
                    <p className="text-muted-foreground">{student.studentId}</p>
                </div>
                <Badge variant={student.status === 'Paid' ? 'default' : 'destructive'} className="capitalize">{student.status}</Badge>
                 <div className="flex gap-2 pt-4">
                    <Button variant="outline" size="icon" aria-label="Call"><Phone className="h-4 w-4"/></Button>
                    <Button variant="outline" size="icon" aria-label="Remove" className="text-destructive hover:bg-destructive/10 hover:text-destructive"><Trash2 className="h-4 w-4"/></Button>
                </div>
                <div className="text-left w-full space-y-2 text-sm pt-4 border-t mt-4">
                    <p><strong>Join Date:</strong> {student.joinDate}</p>
                    <p><strong>Contact:</strong> +91 12345 67890</p>
                    <p><strong>Room No:</strong> H-201</p>
                </div>
            </div>
            <div className="lg:col-span-2 grid gap-6 p-6">
                <div className="grid grid-cols-2 gap-6">
                     <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Attendance</CardTitle>
                            <Percent className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{student.attendance}</div>
                            <p className="text-xs text-muted-foreground">in current month</p>
                        </CardContent>
                    </Card>
                     <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Amount Due</CardTitle>
                            <DollarSign className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{student.bill}</div>
                             <p className="text-xs text-muted-foreground">for this month</p>
                        </CardContent>
                    </Card>
                </div>
                 <Card>
                    <CardHeader>
                        <CardTitle>October 2023 Attendance</CardTitle>
                        <CardDescription>A visual log of meals attended this month.</CardDescription>
                    </CardHeader>
                    <CardContent className="flex justify-center">
                        <Calendar
                            mode="multiple"
                            selected={attendedDays}
                            defaultMonth={today}
                            modifiers={{
                                absent: absentDays,
                                onLeave: onLeaveDays,
                            }}
                            modifiersClassNames={{
                                selected: "bg-primary text-primary-foreground",
                                absent: "bg-destructive/80 text-destructive-foreground",
                                onLeave: "bg-yellow-500/80 text-yellow-900",
                            }}
                            className="p-0"
                        />
                    </CardContent>
                 </Card>
            </div>
        </Card>
    );
}
