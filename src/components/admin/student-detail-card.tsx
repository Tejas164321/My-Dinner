
'use client';

import { useMemo, useState, useEffect, type ComponentProps } from "react";
import type { DayContentProps } from "react-day-picker";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import type { Student, Holiday, Leave } from "@/lib/data";
import { onHolidaysUpdate } from "@/lib/listeners/holidays";
import { User, Phone, Home, Calendar as CalendarIcon, X, Utensils, Sun, Moon, Check, UserCheck, UserX, CalendarDays, Wallet, FileDown, Mail } from "lucide-react";
import { cn } from "@/lib/utils";
import { format, isSameMonth, isSameDay, getDaysInMonth } from 'date-fns';
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";

const planInfo = {
    full_day: { icon: Utensils, text: 'Full Day', color: 'text-primary' },
    lunch_only: { icon: Sun, text: 'Lunch Only', color: 'text-yellow-400' },
    dinner_only: { icon: Moon, text: 'Dinner Only', color: 'text-purple-400' }
};

const CHARGE_PER_MEAL = 65; // This could be moved to mess settings later

interface StudentDetailCardProps {
    student: Student;
    leaves: Leave[];
    initialMonth: Date;
}

export function StudentDetailCard({ student, leaves, initialMonth }: StudentDetailCardProps) {
    const [month, setMonth] = useState<Date>(initialMonth);
    const [today, setToday] = useState<Date | undefined>();
    const [holidays, setHolidays] = useState<Holiday[]>([]);

    useEffect(() => {
        const now = new Date();
        now.setHours(0, 0, 0, 0);
        setToday(now);

        const unsubscribe = onHolidaysUpdate(student.messId, (data) => {
            setHolidays(data);
        });

        return () => unsubscribe();
    }, [student.messId]);

    useEffect(() => {
        setMonth(initialMonth);
    }, [initialMonth]);

    const monthData = useMemo(() => {
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
            const holiday = monthHolidays.find(h => isSameDay(h.date, day));
            const leave = studentLeaves.find(l => isSameDay(l.date, day));

            let lunchStatus = 'available';
            let dinnerStatus = 'available';

            if (holiday) {
                if (holiday.type === 'full_day' || holiday.type === 'lunch_only') lunchStatus = 'holiday';
                if (holiday.type === 'full_day' || holiday.type === 'dinner_only') dinnerStatus = 'holiday';
            }

            if (leave) {
                if (lunchStatus === 'available' && (leave.type === 'full_day' || leave.type === 'lunch_only')) lunchStatus = 'leave';
                if (dinnerStatus === 'available' && (leave.type === 'full_day' || leave.type === 'dinner_only')) dinnerStatus = 'leave';
            }

            if (student.messPlan === 'full_day' || student.messPlan === 'lunch_only') {
                if (lunchStatus === 'available') presentMeals++;
                else if (lunchStatus === 'leave') absentMeals++;
                else if (lunchStatus === 'holiday') holidayMeals++;
            }
            if (student.messPlan === 'full_day' || student.messPlan === 'dinner_only') {
                if (dinnerStatus === 'available') presentMeals++;
                else if (dinnerStatus === 'leave') absentMeals++;
                else if (dinnerStatus === 'holiday') holidayMeals++;
            }
        }
        
        const totalBill = presentMeals * CHARGE_PER_MEAL;
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
                details: { totalMeals: presentMeals, chargePerMeal: CHARGE_PER_MEAL }
            },
            status
        };
    }, [month, student, holidays, leaves]);
    
    const {
        holidayDays,
        fullLeaveDays,
        halfLeaveDays,
        fullPresentDays,
        halfPresentDays,
        dayTypeMap
    } = useMemo(() => {
        const year = month.getFullYear();
        const monthIndex = month.getMonth();
        const daysInMonth = getDaysInMonth(new Date(year, monthIndex, 1));
        const allDaysInMonth = Array.from({ length: daysInMonth }, (_, i) => new Date(year, monthIndex, i + 1));
        
        const hDays: Date[] = [];
        const flDays: Date[] = [];
        const hlDays: Date[] = [];
        const fpDays: Date[] = [];
        const hpDays: Date[] = [];
        const dtMap = new Map();

        const studentLeavesForMonth = leaves.filter(l => isSameMonth(l.date, month));
        const monthHolidays = holidays.filter(h => isSameMonth(h.date, month));

        const ltm = new Map(studentLeavesForMonth.map(l => [format(l.date, 'yyyy-MM-dd'), l.type]));
        const htm = new Map(monthHolidays.map(h => [format(h.date, 'yyyy-MM-dd'), h.type]));

        allDaysInMonth.forEach(day => {
            const dateKey = format(day, 'yyyy-MM-dd');
            const holidayType = htm.get(dateKey);
            const leaveType = ltm.get(dateKey);

            dtMap.set(dateKey, { holidayType, leaveType });

            if (holidayType) {
                hDays.push(day);
            } else if (leaveType) {
                if (leaveType === 'full_day') flDays.push(day);
                else hlDays.push(day);
            } else {
                 if (student.messPlan === 'full_day') fpDays.push(day);
                 else hpDays.push(day);
            }
        });

        return { 
            holidayDays: hDays,
            fullLeaveDays: flDays,
            halfLeaveDays: hlDays,
            fullPresentDays: fpDays,
            halfPresentDays: hpDays,
            dayTypeMap: dtMap
        };
    }, [month, student.id, student.messPlan, holidays, leaves]);

    const CustomDayContent = ({ date }: DayContentProps) => {
        if (!today) {
            return <div className="relative h-full w-full flex items-center justify-center">{date.getDate()}</div>;
        }

        const dateKey = format(date, 'yyyy-MM-dd');
        const dayInfo = dayTypeMap.get(dateKey);

        const holidayType = dayInfo?.holidayType;
        const leaveType = dayInfo?.leaveType;
        
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

    const currentPlan = planInfo[student.messPlan];
    const PlanIcon = currentPlan.icon;

    return (
        <Card className="w-full h-full bg-card/95 backdrop-blur-xl border-0 overflow-hidden">
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
                            <Calendar
                                month={month}
                                onMonthChange={setMonth}
                                modifiers={{
                                    holiday: holidayDays,
                                    full_leave: fullLeaveDays,
                                    half_leave: halfLeaveDays,
                                    full_present: fullPresentDays,
                                    half_present: halfPresentDays,
                                }}
                                components={{ DayContent: CustomDayContent }}
                                modifiersClassNames={{
                                    holiday: 'bg-primary/40 text-primary-foreground',
                                    full_leave: 'bg-destructive text-destructive-foreground',
                                    half_leave: 'bg-chart-3 text-primary-foreground',
                                    full_present: 'bg-chart-2 text-primary-foreground',
                                    half_present: 'bg-chart-3 text-primary-foreground',
                                }}
                                classNames={{
                                    months: "w-full",
                                    month: "w-full space-y-2 md:space-y-4",
                                    head_cell: "text-muted-foreground rounded-md w-8 md:w-9 font-normal text-[0.7rem] md:text-[0.8rem]",
                                    cell: "h-8 w-8 md:h-9 md:w-9 text-center text-sm p-0 relative rounded-full flex items-center justify-center",
                                    day: "h-8 w-8 md:h-9 md:w-9 p-0 font-normal aria-selected:opacity-100 rounded-full flex items-center justify-center",
                                    day_today: "bg-accent text-accent-foreground rounded-full",
                                    day_selected: "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground focus:bg-primary focus:text-primary-foreground",
                                }}
                                className="p-1 md:p-2"
                                showOutsideDays={false}
                            />
                        </div>
                        <div className="p-2 pt-2 mt-2 border-t">
                            <div className="flex w-full items-center justify-center gap-x-2 md:gap-x-3 gap-y-2 text-xs text-muted-foreground flex-wrap">
                                <div className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 shrink-0 rounded-full bg-chart-2" />Present</div>
                                <div className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 shrink-0 rounded-full bg-chart-3" />Half Day</div>
                                <div className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 shrink-0 rounded-full bg-destructive" />Leave</div>
                                <div className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 shrink-0 rounded-full bg-primary/40" />Holiday</div>
                            </div>
                        </div>
                    </div>
                 </div>

            </div>
        </Card>
    );
}

    

    