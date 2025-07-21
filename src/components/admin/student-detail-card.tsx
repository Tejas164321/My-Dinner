
'use client';

import { useMemo, useState, useEffect, type ComponentProps } from "react";
import type { DayContentProps } from "react-day-picker";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import type { Student, Holiday, Leave } from "@/lib/data";
import { onHolidaysUpdate } from "@/lib/listeners/holidays";
import { User, Phone, Home, Calendar as CalendarIcon, X, Utensils, Sun, Moon, Check, UserCheck, UserX, CalendarDays, Wallet, FileDown } from "lucide-react";
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

        const unsubscribe = onHolidaysUpdate(setHolidays);

        return () => unsubscribe();
    }, []);

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
        // Mocking payments for now, as this data isn't stored yet
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

        const ltm = new Map(leaves.map(l => [format(l.date, 'yyyy-MM-dd'), l.type]));
        const htm = new Map(holidays.map(h => [format(h.date, 'yyyy-MM-dd'), h.type]));

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
                        <Badge variant={monthData.status === 'Paid' ? 'secondary' : 'destructive'} className={cn("capitalize text-sm h-7", monthData.status === 'Paid' && "border-transparent bg-green-600 text-primary-foreground hover:bg-green-600/80")}>{monthData.status}</Badge>
                    </CardContent>
                </Card>
                
                 <div className="space-y-3">
                    <h3 className="font-semibold text-lg px-1">Meal Summary for {format(month, 'MMMM')}</h3>
                     <div className="grid grid-cols-3 gap-3">
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 p-3 pb-1">
                                <CardTitle className="text-sm font-medium">Present</CardTitle>
                                <UserCheck className="h-4 w-4 text-green-400" />
                            </CardHeader>
                            <CardContent className="p-3 pt-0">
                                <div className="text-2xl font-bold">{monthData.presentMeals}</div>
                                <p className="text-xs text-muted-foreground">Meals</p>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 p-3 pb-1">
                                <CardTitle className="text-sm font-medium">Absent</CardTitle>
                                <UserX className="h-4 w-4 text-destructive" />
                            </CardHeader>
                            <CardContent className="p-3 pt-0">
                                <div className="text-2xl font-bold">{monthData.absentMeals}</div>
                                <p className="text-xs text-muted-foreground">Meals</p>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 p-3 pb-1">
                                <CardTitle className="text-sm font-medium">Holidays</CardTitle>
                                <CalendarDays className="h-4 w-4 text-blue-400" />
                            </CardHeader>
                            <CardContent className="p-3 pt-0">
                                <div className="text-2xl font-bold">{monthData.holidayMeals}</div>
                                <p className="text-xs text-muted-foreground">Meals</p>
                            </CardContent>
                        </Card>
                    </div>
                </div>

                <Card className="flex-grow flex flex-col">
                    <CardHeader className="p-4 pb-2">
                        <CardTitle className="text-lg flex items-center gap-2"><Wallet className="h-5 w-5" />Billing</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3 text-sm p-4 pt-2 flex-grow">
                        <div className="space-y-2">
                             {monthData.bill.details && (
                                <div className="flex justify-between items-center">
                                    <p className="text-muted-foreground flex items-center gap-2">
                                        <Utensils className="h-4 w-4" /> Billable Meals
                                    </p>
                                    <p>{monthData.bill.details.totalMeals} meals x ₹{monthData.bill.details.chargePerMeal.toLocaleString()}</p>
                                </div>
                             )}
                            <Separator />
                            <div className="flex justify-between items-center font-semibold text-base">
                                <p>Total Bill Amount</p>
                                <p>₹{monthData.bill.total.toLocaleString()}</p>
                            </div>
                        </div>
                        
                        {monthData.bill.payments.length > 0 && (
                            <div className="pt-1">
                                <p className="font-medium text-foreground/80 mb-1.5">Payments Received:</p>
                                <div className="space-y-1 pl-2 border-l-2 border-dashed">
                                {monthData.bill.payments.map((payment, index) => (
                                    <div key={index} className="flex justify-between items-center text-green-400">
                                        <p className="text-muted-foreground text-xs">
                                            ✔ Payment on {format(new Date(payment.date), 'MMM do, yyyy')}
                                        </p>
                                        <p className="font-mono text-sm">- ₹{payment.amount.toLocaleString()}</p>
                                    </div>
                                ))}
                                </div>
                            </div>
                        )}
                        <Separator/>
                        <div className="flex justify-between items-center font-semibold text-base">
                            <span className="text-foreground">Remaining Due:</span>
                            <span className={cn(monthData.bill.remaining > 0 ? 'text-destructive' : 'text-foreground')}>₹{monthData.bill.remaining.toLocaleString()}</span>
                        </div>
                    </CardContent>
                    <CardFooter className="p-4 pt-0">
                         <Button variant="outline" className="w-full">
                            <FileDown className="h-4 w-4 mr-2" /> Download Bill
                        </Button>
                    </CardFooter>
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
                            <span className="text-muted-foreground">{student.roomNo || 'N/A'}</span>
                        </div>
                        <div className="flex items-center gap-3">
                            <Phone className="w-4 h-4 text-muted-foreground flex-shrink-0"/>
                            <span className="text-muted-foreground">{student.contact || 'N/A'}</span>
                        </div>
                        <div className="flex items-center gap-3">
                            <CalendarIcon className="w-4 h-4 text-muted-foreground flex-shrink-0"/>
                            <span className="text-muted-foreground">Joined: {student.joinDate ? format(new Date(student.joinDate), 'PPP') : 'N/A'}</span>
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
                        <div className="flex w-full items-center justify-center gap-x-4 gap-y-2 text-xs text-muted-foreground flex-wrap">
                             <div className="flex items-center gap-2"><span className="h-2.5 w-2.5 shrink-0 rounded-full bg-chart-2" />Present</div>
                             <div className="flex items-center gap-2"><span className="h-2.5 w-2.5 shrink-0 rounded-full bg-chart-3" />Half Day</div>
                             <div className="flex items-center gap-2"><span className="h-2.5 w-2.5 shrink-0 rounded-full bg-destructive" />Leave</div>
                             <div className="flex items-center gap-2"><span className="h-2.5 w-2.5 shrink-0 rounded-full bg-primary/40" />Holiday</div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </Card>
    );
}
