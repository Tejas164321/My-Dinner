

'use client';

import { useMemo, useState, useEffect } from "react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import type { Student, Holiday, Leave } from "@/lib/data";
import { onHolidaysUpdate } from "@/lib/listeners/holidays";
import { User, Phone, Home, Calendar as CalendarIcon, Utensils, Sun, Moon, UserCheck, UserX, CalendarDays, Wallet, FileDown, Mail } from "lucide-react";
import { cn } from "@/lib/utils";
import { format, isSameMonth, isSameDay, getDaysInMonth, startOfDay, parseISO, isFuture, isBefore } from 'date-fns';
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { AttendanceCalendar } from "@/components/shared/attendance-calendar";

const planInfo = {
    full_day: { icon: Utensils, text: 'Full Day', color: 'text-primary' },
    lunch_only: { icon: Sun, text: 'Lunch Only', color: 'text-yellow-400' },
    dinner_only: { icon: Moon, text: 'Dinner Only', color: 'text-purple-400' }
};

interface StudentDetailCardProps {
    student: Student;
    leaves: Leave[];
    initialMonth: Date;
    perMealCharge: number;
}

export function StudentDetailCard({ student, leaves, initialMonth, perMealCharge }: StudentDetailCardProps) {
    const [month, setMonth] = useState<Date>(initialMonth);
    const [holidays, setHolidays] = useState<Holiday[]>([]);

    useEffect(() => {
        const unsubscribe = onHolidaysUpdate(student.messId, (data) => {
            setHolidays(data);
        });
        return () => unsubscribe();
    }, [student.messId]);

    useEffect(() => {
        setMonth(initialMonth);
    }, [initialMonth]);

    const planStartDate = useMemo(() => {
        if (!student?.planStartDate) return null;
        const dateValue = student.planStartDate;
        if (typeof dateValue === 'string') {
            return startOfDay(parseISO(dateValue));
        }
        return startOfDay((dateValue as any).toDate());
    }, [student]);

    const monthData = useMemo(() => {
        if (!planStartDate) {
             return {
                presentMeals: 0, absentMeals: 0, holidayMeals: 0, bill: { total: 0, payments: [], paidAmount: 0, remaining: 0, details: { totalMeals: 0, chargePerMeal: 0, totalDaysInMonth: 0, holidays: 0, billableDays: 0, fullDays: 0, halfDays: 0, absentDays: 0 } }, status: 'Paid'
            };
        }

        const year = month.getFullYear();
        const monthIndex = month.getMonth();
        const daysInMonth = getDaysInMonth(month);

        const studentLeaves = leaves.filter(leave => isSameMonth(leave.date, month));
        const monthHolidays = holidays.filter(holiday => isSameMonth(holiday.date, month));

        let presentMeals = 0;
        let absentMeals = 0;
        let holidayMeals = 0;

        for (let i = 1; i <= daysInMonth; i++) {
            const day = new Date(year, monthIndex, i);
            if (isFuture(day) || (planStartDate && day < planStartDate)) continue;

            const holiday = monthHolidays.find(h => isSameDay(h.date, day));
            const leave = studentLeaves.find(l => isSameDay(l.date, day));

            let lunchTaken = false;
            let dinnerTaken = false;

            // Check for Lunch
            if (student.messPlan === 'full_day' || student.messPlan === 'lunch_only') {
                if (!(isSameDay(day, planStartDate) && student.planStartMeal === 'dinner')) {
                    if (!holiday && (!leave || (leave.type !== 'full_day' && leave.type !== 'lunch_only'))) {
                        lunchTaken = true;
                    }
                }
            }
            
            // Check for Dinner
            if (student.messPlan === 'full_day' || student.messPlan === 'dinner_only') {
                 if (!holiday && (!leave || (leave.type !== 'full_day' && leave.type !== 'dinner_only'))) {
                    dinnerTaken = true;
                }
            }

            if(lunchTaken) presentMeals++; else if (!holiday) absentMeals++;
            if(dinnerTaken) presentMeals++; else if (!holiday) absentMeals++;
            
            if (holiday) {
                holidayMeals += student.messPlan === 'full_day' ? 2 : 1;
            }
        }
        
        const totalBill = presentMeals * perMealCharge;
        const payments = [];
        const paidAmount = payments.reduce((sum, p) => sum + p.amount, 0);
        const remainingBill = totalBill - paidAmount;
        const status = remainingBill <= 0 ? 'Paid' : 'Due';

        return {
            presentMeals,
            absentMeals,
            holidayMeals,
            bill: {
                total: totalBill,
                payments,
                paidAmount,
                remaining: remainingBill,
                details: { totalMeals: presentMeals, chargePerMeal, totalDaysInMonth: 0, holidays: 0, billableDays: 0, fullDays: 0, halfDays: 0, absentDays: 0 }
            },
            status
        };
    }, [month, student, holidays, leaves, planStartDate, perMealCharge]);

    const currentPlan = planInfo[student.messPlan];
    const PlanIcon = currentPlan.icon;

    return (
        <Card className="w-full h-full bg-card border-0 overflow-hidden">
            <div className="flex flex-col gap-4 md:gap-6 p-4 md:p-6 h-full overflow-y-auto">
                {/* --- Profile Section --- */}
                 <div className="flex flex-col md:flex-row items-center gap-4">
                     <Avatar className="w-16 h-16 md:w-20 md:h-20 border-4 border-primary/20">
                        <AvatarFallback className="text-xl md:text-2xl">{student.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1 space-y-1 text-center md:text-left">
                        <h2 className="text-xl md:text-2xl font-bold">{student.name}</h2>
                        <p className="text-sm text-muted-foreground">{student.studentId}</p>
                         <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-xs md:text-sm pt-2">
                             <div className="flex items-center gap-2">
                                <Mail className="w-4 h-4 text-muted-foreground flex-shrink-0"/>
                                <span className="text-muted-foreground truncate">{student.email}</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <Phone className="w-4 h-4 text-muted-foreground flex-shrink-0"/>
                                <span className="text-muted-foreground">{student.contact || 'N/A'}</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <Home className="w-4 h-4 text-muted-foreground flex-shrink-0"/>
                                <span className="text-muted-foreground">{student.roomNo || 'N/A'}</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <CalendarIcon className="w-4 h-4 text-muted-foreground flex-shrink-0"/>
                                <span className="text-muted-foreground">Joined: {student.joinDate ? format(new Date(student.joinDate), 'd MMM, yyyy') : 'N/A'}</span>
                            </div>
                         </div>
                    </div>
                </div>

                <Separator />
                 
                {/* --- Meal Summary Section --- */}
                <div className="space-y-3">
                    <div className="flex items-center justify-between">
                        <h3 className="font-semibold text-base">Meal Summary ({format(month, 'MMMM')})</h3>
                        <Badge variant="outline" className="font-semibold text-xs py-1">
                            <PlanIcon className={cn("mr-1.5 h-3 w-3", currentPlan.color)} />
                            {currentPlan.text}
                        </Badge>
                    </div>
                     <div className="grid grid-cols-3 gap-3">
                        <div className="p-3 rounded-lg border bg-secondary/30">
                           <div className="flex items-center justify-between">
                                <p className="text-xs font-medium">Present</p>
                                <UserCheck className="h-4 w-4 text-green-400" />
                           </div>
                            <p className="text-xl md:text-2xl font-bold mt-1">{monthData.presentMeals}</p>
                        </div>
                        <div className="p-3 rounded-lg border bg-secondary/30">
                           <div className="flex items-center justify-between">
                                <p className="text-xs font-medium">Absent</p>
                                <UserX className="h-4 w-4 text-destructive" />
                           </div>
                            <p className="text-xl md:text-2xl font-bold mt-1">{monthData.absentMeals}</p>
                        </div>
                        <div className="p-3 rounded-lg border bg-secondary/30">
                           <div className="flex items-center justify-between">
                                <p className="text-xs font-medium">Holidays</p>
                                <CalendarDays className="h-4 w-4 text-blue-400" />
                           </div>
                            <p className="text-xl md:text-2xl font-bold mt-1">{monthData.holidayMeals}</p>
                        </div>
                    </div>
                </div>

                 <Separator />

                 {/* --- Billing Section --- */}
                 <div className="space-y-3">
                    <h3 className="font-semibold text-base flex items-center gap-2"><Wallet className="h-5 w-5" />Billing</h3>
                    <div className="space-y-3 text-sm p-3 md:p-4 border rounded-lg bg-secondary/30">
                         {monthData.bill.details && (
                            <div className="flex justify-between items-center text-xs md:text-sm">
                                <p className="text-muted-foreground">Billable Meals</p>
                                <p>{monthData.bill.details.totalMeals} meals x ₹{monthData.bill.details.chargePerMeal.toLocaleString()}</p>
                            </div>
                         )}
                        <Separator />
                        <div className="flex justify-between items-center font-semibold text-base">
                            <p>Total Bill</p>
                            <p>₹{monthData.bill.total.toLocaleString()}</p>
                        </div>
                        <Separator/>
                        <div className="flex justify-between items-center font-semibold text-base">
                            <span>Remaining Due:</span>
                            <span className={cn(monthData.bill.remaining > 0 ? 'text-destructive' : 'text-foreground')}>₹{monthData.bill.remaining.toLocaleString()}</span>
                        </div>
                         <Button variant="outline" className="w-full !mt-4 h-9">
                            <FileDown className="h-4 w-4 mr-2" /> Download Bill
                        </Button>
                    </div>
                 </div>
                 
                 <Separator />

                 {/* --- Calendar Section --- */}
                 <div className="space-y-3 flex flex-col flex-1">
                    <h3 className="font-semibold text-base">Attendance for {format(month, 'MMMM yyyy')}</h3>
                     <div className="p-2 border rounded-lg bg-secondary/30 flex flex-col flex-1">
                        <div className="flex flex-grow justify-center items-center">
                            <AttendanceCalendar user={student} leaves={leaves} holidays={holidays} month={month} onMonthChange={setMonth} />
                        </div>
                        <div className="p-2 pt-2 mt-2 border-t">
                            <div className="flex w-full items-center justify-center gap-x-2 md:gap-x-3 gap-y-2 text-xs text-muted-foreground flex-wrap">
                                <div className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 shrink-0 rounded-full bg-green-500" />Present</div>
                                <div className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 shrink-0 rounded-full bg-destructive" />Leave</div>
                                <div className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 shrink-0 rounded-full bg-orange-500" />Holiday</div>
                                <div className="flex items-center gap-1.5"><div className="w-5 h-5 rounded-md ring-2 ring-primary ring-offset-2 ring-offset-background"></div>Today</div>
                            </div>
                        </div>
                    </div>
                 </div>

            </div>
        </Card>
    );
}
