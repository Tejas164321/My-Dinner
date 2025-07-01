'use client';

import { useMemo, useState, useEffect } from "react";
import type { DayContentProps } from "react-day-picker";
import { Badge } from "@/components/ui/badge";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import type { Bill, Holiday, Student } from "@/lib/data";
import { holidays, studentUser } from "@/lib/data";
import { Utensils, CalendarDays, FileDown, Wallet, X, Ticket, Sparkles, Sun, Moon } from "lucide-react";
import { cn } from "@/lib/utils";
import { format } from 'date-fns';
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";


function CustomDayContent({ date, activeModifiers }: DayContentProps) {
    // Re-using the same day content logic for consistency
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

interface BillDetailDialogProps {
    bill: Bill;
}

const monthMap: { [key: string]: number } = {
    'January': 0, 'February': 1, 'March': 2, 'April': 3, 'May': 4, 'June': 5,
    'July': 6, 'August': 7, 'September': 8, 'October': 9, 'November': 10, 'December': 11
};

export function BillDetailDialog({ bill }: BillDetailDialogProps) {
    const student = studentUser;
    const monthIndex = monthMap[bill.month];
    const monthDate = new Date(bill.year, monthIndex, 1);
    
    const { fullDayDays, lunchOnlyDays, dinnerOnlyDays, absentDays } = useMemo(() => {
        const year = bill.year;
        const monthIndex = monthMap[bill.month];
        if (monthIndex === undefined) return { fullDayDays: [], lunchOnlyDays: [], dinnerOnlyDays: [], absentDays: [] };
        
        const daysInMonth = new Date(year, monthIndex + 1, 0).getDate();
        const allDays = Array.from({ length: daysInMonth }, (_, i) => new Date(year, monthIndex, i + 1));
        
        const seededRandom = (seed: number) => {
            let x = Math.sin(seed + student.id.charCodeAt(0)) * 10000;
            return x - Math.floor(x);
        };

        const billableDays = allDays.filter(d => !holidays.some(h => format(h.date, 'yyyy-MM-dd') === format(d, 'yyyy-MM-dd')));
        const shuffledDays = [...billableDays].sort((a, b) => seededRandom(a.getDate()) - seededRandom(b.getDate()));
        
        const fDaysCount = bill.details.fullDays;
        const hDaysCount = bill.details.halfDays;
        
        const fdd = shuffledDays.slice(0, fDaysCount);
        const hdd = shuffledDays.slice(fDaysCount, fDaysCount + hDaysCount);
        const add = shuffledDays.slice(fDaysCount + hDaysCount);
        
        const lod = hdd.filter((_, i) => i % 2 === 0);
        const dod = hdd.filter((_, i) => i % 2 !== 0);

        return { fullDayDays: fdd, lunchOnlyDays: lod, dinnerOnlyDays: dod, absentDays: add };
    }, [bill, student.id]);

    return (
        <Card className="grid grid-cols-1 lg:grid-cols-5 gap-6 p-6 w-full relative bg-card/95 backdrop-blur-xl border-border">
            <div className="lg:col-span-3 flex flex-col gap-6">
                <Card>
                    <CardHeader>
                        <div className="flex justify-between items-start">
                            <div>
                                <CardTitle>Bill for {bill.month} {bill.year}</CardTitle>
                                <CardDescription>Generated on: {bill.generationDate}</CardDescription>
                            </div>
                            <Badge variant={bill.status === 'Paid' ? 'secondary' : 'destructive'} className={cn("capitalize text-sm h-7 w-20 justify-center", bill.status === 'Paid' && "border-transparent bg-green-600 text-primary-foreground hover:bg-green-600/80")}>{bill.status}</Badge>
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-3 rounded-lg border p-4">
                            <div className="flex justify-between items-baseline">
                                <h4 className="font-semibold text-foreground">Attendance Summary</h4>
                                <p className="text-sm text-muted-foreground">{bill.month} had {bill.details.totalDaysInMonth} days</p>
                            </div>
                            <div className="grid grid-cols-4 gap-2 text-center pt-2">
                                <div>
                                    <p className="text-2xl font-bold text-blue-400">{bill.details.holidays}</p>
                                    <p className="text-xs text-muted-foreground">Holidays</p>
                                </div>
                                 <div>
                                    <p className="text-2xl font-bold text-green-400">{bill.details.fullDays}</p>
                                    <p className="text-xs text-muted-foreground">Full Days</p>
                                </div>
                                <div>
                                    <p className="text-2xl font-bold text-yellow-400">{bill.details.halfDays}</p>
                                    <p className="text-xs text-muted-foreground">Half Days</p>
                                </div>
                                <div>
                                    <p className="text-2xl font-bold text-destructive">{bill.details.absentDays}</p>
                                    <p className="text-xs text-muted-foreground">Absent</p>
                                </div>
                            </div>
                        </div>

                         <div className="space-y-3 rounded-lg border p-4">
                            <h4 className="font-semibold text-foreground">Calculation</h4>
                            <div className="space-y-2 text-sm">
                                <div className="flex justify-between items-center">
                                    <p className="text-muted-foreground">Total Billable Days</p>
                                    <p className="font-medium">{bill.details.billableDays} days</p>
                                </div>
                                <div className="flex justify-between items-center">
                                    <p className="text-muted-foreground flex items-center gap-2"><Utensils /> Total Meals Taken</p>
                                    <p>{bill.details.totalMeals} meals</p>
                                </div>
                                <div className="flex justify-between items-center">
                                    <p className="text-muted-foreground">Charge per Meal</p>
                                    <p>x ₹{bill.details.chargePerMeal.toLocaleString()}</p>
                                </div>
                                <Separator />
                                <div className="flex justify-between items-center font-semibold text-lg">
                                    <p>Final Bill Amount</p>
                                    <p>₹{bill.totalAmount.toLocaleString()}</p>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                    <CardFooter className="gap-2">
                        <Button variant="outline" className="w-full"><FileDown/> Download Bill</Button>
                        {bill.status === 'Due' && (
                           <AlertDialog>
                                <AlertDialogTrigger asChild>
                                    <Button className="w-full"><Wallet/> Pay Now</Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                    <AlertDialogHeader>
                                        <AlertDialogTitle>Choose Payment Method</AlertDialogTitle>
                                        <AlertDialogDescription>
                                            How would you like to pay your bill of ₹{bill.totalAmount.toLocaleString()}?
                                        </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter className="grid grid-cols-2 gap-4">
                                        <AlertDialogAction>Pay Online</AlertDialogAction>
                                        <AlertDialogCancel>Pay with Cash</AlertDialogCancel>
                                    </AlertDialogFooter>
                                </AlertDialogContent>
                            </AlertDialog>
                        )}
                    </CardFooter>
                </Card>
            </div>
            <div className="lg:col-span-2 flex flex-col gap-6 relative">
                 <Card className="flex-1 flex flex-col">
                    <CardHeader className="p-4 pb-0">
                        <CardTitle className="text-base">Attendance for {bill.month}</CardTitle>
                    </CardHeader>
                    <CardContent className="flex-grow flex items-center justify-center p-0">
                         <Calendar
                            month={monthDate}
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
                            disabled
                        />
                    </CardContent>
                    <CardContent className="p-4 pt-2 mt-auto">
                        <div className="flex w-full items-center justify-center gap-4 text-xs text-muted-foreground">
                            <div className="flex items-center gap-2"><span className="h-2.5 w-2.5 shrink-0 rounded-full bg-chart-2" />Full Day</div>
                            <div className="flex items-center gap-2"><span className="h-2.5 w-2.5 shrink-0 rounded-full bg-chart-3" />Half Day</div>
                            <div className="flex items-center gap-2"><span className="h-2.5 w-2.5 shrink-0 rounded-full bg-destructive" />Absent</div>
                             <div className="flex items-center gap-2"><span className="h-2.5 w-2.5 shrink-0 rounded-full bg-primary/40" />Holiday</div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </Card>
    );
}
