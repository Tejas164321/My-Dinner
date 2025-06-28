'use client';

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { joinedStudents } from "@/lib/data";
import { DollarSign, Percent } from "lucide-react";
import { cn } from "@/lib/utils";

type Student = (typeof joinedStudents)[number];

export function StudentDetailCard({ student }: { student: Student }) {
    // Using a fixed date for consistent display in the prototype
    const today = new Date(2023, 9, 27); // Oct 27, 2023

    // Mock data for calendar
    const bothMealsDays = [new Date(2023, 9, 2), new Date(2023, 9, 3), new Date(2023, 9, 8), new Date(2023, 9, 9), new Date(2023, 9, 12), new Date(2023, 9, 13), new Date(2023, 9, 15), new Date(2023, 9, 16), new Date(2023, 9, 17), new Date(2023, 9, 22), new Date(2023, 9, 23), new Date(2023, 9, 24), new Date(2023, 9, 25)];
    const oneMealDays = [new Date(2023, 9, 4), new Date(2023, 9, 18), new Date(2023, 9, 20)];
    const absentDays = [new Date(2023, 9, 5), new Date(2023, 9, 10), new Date(2023, 9, 11), new Date(2023, 9, 19)];

    return (
        <Card className="grid grid-cols-1 lg:grid-cols-3 gap-0 lg:gap-6 animate-in fade-in-0 duration-500 overflow-hidden">
            <div className="lg:col-span-1 flex flex-col items-center text-center gap-4 p-6 bg-secondary/30">
                <Avatar className="w-24 h-24 border-4 border-primary/20">
                    <AvatarFallback>{student.name.charAt(0)}</AvatarFallback>
                </Avatar>
                <div className="space-y-1">
                    <h2 className="text-2xl font-bold">{student.name}</h2>
                    <p className="text-muted-foreground">{student.studentId}</p>
                </div>
                <Badge variant={student.status === 'Paid' ? 'secondary' : 'destructive'} className="capitalize">{student.status}</Badge>
                <div className="text-left w-full space-y-2 text-sm pt-4 border-t mt-4">
                    <p><strong>Email:</strong> {student.email}</p>
                    <p><strong>Contact:</strong> {student.contact}</p>
                    <p><strong>Room No:</strong> {student.roomNo}</p>
                    <p><strong>Joined:</strong> {student.joinDate}</p>
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
                     <Card className={cn(student.status === 'Due' && 'border-destructive/50')}>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Amount Due</CardTitle>
                            <DollarSign className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className={cn("text-2xl font-bold", student.status === 'Due' && "text-destructive")}>{student.bill}</div>
                             <p className="text-xs text-muted-foreground">for this month</p>
                        </CardContent>
                    </Card>
                </div>
                 <Card>
                    <CardHeader>
                        <CardTitle>October 2023 Attendance</CardTitle>
                        <CardDescription>A visual log of meals attended this month.</CardDescription>
                    </CardHeader>
                    <CardContent className="grid gap-6 md:grid-cols-3">
                        <Calendar
                            mode="multiple"
                            disabled
                            defaultMonth={today}
                            modifiers={{
                                bothMeals: bothMealsDays,
                                oneMeal: oneMealDays,
                                absent: absentDays,
                            }}
                            modifiersClassNames={{
                                bothMeals: "bg-chart-2 text-primary-foreground rounded-full",
                                oneMeal: "bg-chart-3 text-primary-foreground rounded-full",
                                absent: "bg-destructive text-destructive-foreground rounded-full",
                            }}
                            className="rounded-md border p-3 md:col-span-2"
                        />
                        <div className="flex flex-col gap-4 rounded-lg border bg-secondary/30 p-4 md:col-span-1">
                            <h4 className="font-semibold text-center md:text-left">Legend</h4>
                            <div className="flex flex-col gap-3 text-sm text-muted-foreground">
                                <div className="flex items-center gap-3">
                                    <span className="h-3 w-3 shrink-0 rounded-full bg-chart-2" />
                                    <span>Both Meals</span>
                                </div>
                                <div className="flex items-center gap-3">
                                    <span className="h-3 w-3 shrink-0 rounded-full bg-chart-3" />
                                    <span>One Meal</span>
                                </div>
                                <div className="flex items-center gap-3">
                                    <span className="h-3 w-3 shrink-0 rounded-full bg-destructive" />
                                    <span>Absent</span>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                 </Card>
            </div>
        </Card>
    );
}