
'use client';

import { useMemo, useState, useEffect, type ComponentProps } from "react";
import type { DayContentProps } from "react-day-picker";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import type { Student, Holiday } from "@/lib/data";
import { holidays, leaveHistory } from "@/lib/data";
import { User, Phone, Home, Calendar as CalendarIcon, X, Utensils, Sun, Moon, Check, UserCheck, UserX, CalendarDays, Wallet } from "lucide-react";
import { cn } from "@/lib/utils";
import { format, isSameMonth } from 'date-fns';
import { Separator } from "@/components/ui/separator";

const planInfo = {
    full_day: { icon: Utensils, text: 'Full Day', color: 'text-primary' },
    lunch_only: { icon: Sun, text: 'Lunch Only', color: 'text-yellow-400' },
    dinner_only: { icon: Moon, text: 'Dinner Only', color: 'text-purple-400' }
};

interface StudentDetailCardProps {
    student: Student;
    initialMonth: Date;
}

export function StudentDetailCard({ student, initialMonth }: StudentDetailCardProps) {
    const [month, setMonth] = useState<Date>(initialMonth);
    const [today, setToday] = useState<Date | undefined>();

    useEffect(() => {
        const now = new Date();
        now.setHours(0, 0, 0, 0);
        setToday(new Date(2023, 9, 27)); // Fixed date for consistency
    }, []);

    const monthName = format(month, 'MMMM').toLowerCase() as keyof typeof student.monthlyDetails;
    const currentData = student.monthlyDetails[monthName] || { 
        attendance: '0%', 
        bill: { total: 0, payments: [], details: { totalMeals: 0, chargePerMeal: 65 } }, 
        status: 'Paid' 
    };
    
    const paidAmount = currentData.bill.payments.reduce((sum, p) => sum + p.amount, 0);
    const remainingBill = currentData.bill.total - paidAmount;

    const { presentMeals, absentMeals, holidayMeals } = useMemo(() => {
        const year = month.getFullYear();
        const monthIndex = month.getMonth();

        const pMeals = currentData.bill.details?.totalMeals || 0;

        const aMeals = leaveHistory
            .filter(leave => 
                leave.studentId === student.id &&
                new Date(leave.date).getFullYear() === year &&
                new Date(leave.date).getMonth() === monthIndex
            )
            .reduce((sum, leave) => sum + (leave.type === 'full_day' ? 2 : 1), 0);

        const hMeals = holidays
            .filter(holiday => 
                new Date(holiday.date).getFullYear() === year &&
                new Date(holiday.date).getMonth() === monthIndex
            )
            .reduce((sum, holiday) => {
                const leaveOnSameDay = leaveHistory.some(l => l.studentId === student.id && format(l.date, 'yyyy-MM-dd') === format(holiday.date, 'yyyy-MM-dd'));
                if (leaveOnSameDay) return sum; // Avoid double counting if student took leave on holiday
                return sum + (holiday.type === 'full_day' ? 2 : 1);
            }, 0);
        
        return {
            presentMeals: pMeals,
            absentMeals: aMeals,
            holidayMeals: hMeals
        };
    }, [month, student.id, currentData.bill.details]);
    
    const studentLeaves = useMemo(() => {
        return leaveHistory.filter(l => l.studentId === student.id);
    }, [student.id]);

    const { calendarModifiers, leaveTypeMap, holidayTypeMap } = useMemo(() => {
        const studentLeavesThisMonth = studentLeaves.filter(l => isSameMonth(l.date, month));
        const holidaysThisMonth = holidays.filter(h => isSameMonth(h.date, month));
        
        const leaveDates = studentLeavesThisMonth.map(l => l.date);
        const leaveDatesSet = new Set(leaveDates.map(d => d.getTime()));

        const fullDayLeaves = studentLeavesThisMonth.filter(l => l.type === 'full_day').map(l => l.date);
        const halfDayLeaves = studentLeavesThisMonth.filter(l => l.type !== 'full_day').map(l => l.date);

        const fullDayHolidays = holidaysThisMonth.filter(h => h.type === 'full_day' && !leaveDatesSet.has(h.date.getTime())).map(h => h.date);
        const halfDayHolidays = holidaysThisMonth.filter(h => h.type !== 'full_day' && !leaveDatesSet.has(h.date.getTime())).map(h => h.date);
        
        const modifiers = {
            leave_full: fullDayLeaves,
            leave_half: halfDayLeaves,
            holiday_full: fullDayHolidays,
            holiday_half: halfDayHolidays,
        };

        const ltm = new Map(studentLeaves.map(l => [format(l.date, 'yyyy-MM-dd'), l.type]));
        const htm = new Map(holidays.map(h => [format(h.date, 'yyyy-MM-dd'), h.type]));

        return { calendarModifiers: modifiers, leaveTypeMap: ltm, holidayTypeMap: htm };
    }, [month, studentLeaves]);

    const CustomDayContent = ({ date }: DayContentProps) => {
        if (!today || date > today) {
            return <div className="relative h-full w-full flex items-center justify-center">{date.getDate()}</div>;
        }

        const dateKey = format(date, 'yyyy-MM-dd');
        const leaveType = leaveTypeMap.get(dateKey);
        const holidayType = holidayTypeMap.get(dateKey);
        const studentPlan = student.messPlan;

        const isLunchOff = (holidayType === 'full_day' || holidayType === 'lunch_only') ||
                           (leaveType === 'full_day' || leaveType === 'lunch_only');
        const isDinnerOff = (holidayType === 'full_day' || holidayType === 'dinner_only') ||
                            (leaveType === 'full_day' || leaveType === 'dinner_only');
        
        let lunchDot = <div className="h-1 w-1 rounded-full bg-primary-foreground/30" />;
        let dinnerDot = <div className="h-1 w-1 rounded-full bg-primary-foreground/30" />;

        if (!isLunchOff && (studentPlan === 'full_day' || studentPlan === 'lunch_only')) {
            lunchDot = <div className="h-1 w-1 rounded-full bg-primary-foreground" />;
        }
        if (!isDinnerOff && (studentPlan === 'full_day' || studentPlan === 'dinner_only')) {
            dinnerDot = <div className="h-1 w-1 rounded-full bg-primary-foreground" />;
        }

        return (
            <div className="relative h-full w-full flex items-center justify-center">
                {date.getDate()}
                {studentPlan === 'full_day' && (
                    <div className="absolute bottom-1 flex items-center justify-center gap-0.5">
                        {lunchDot}
                        {dinnerDot}
                    </div>
                )}
            </div>
        );
    };

    const currentPlan = planInfo[student.messPlan];
    const PlanIcon = currentPlan.icon;
    const status = remainingBill <= 0 ? 'Paid' : 'Due';

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
                        <Badge variant={status === 'Paid' ? 'secondary' : 'destructive'} className={cn("capitalize text-sm h-7", status === 'Paid' && "border-transparent bg-green-600 text-primary-foreground hover:bg-green-600/80")}>{status}</Badge>
                    </CardContent>
                </Card>
                
                 <div className="space-y-3">
                    <h3 className="font-semibold text-lg px-1">Monthly Meal Summary</h3>
                     <div className="grid grid-cols-3 gap-3">
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 p-3 pb-1">
                                <CardTitle className="text-sm font-medium">Present</CardTitle>
                                <UserCheck className="h-4 w-4 text-green-400" />
                            </CardHeader>
                            <CardContent className="p-3 pt-0">
                                <div className="text-2xl font-bold">{presentMeals}</div>
                                <p className="text-xs text-muted-foreground">Meals</p>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 p-3 pb-1">
                                <CardTitle className="text-sm font-medium">Absent</CardTitle>
                                <UserX className="h-4 w-4 text-destructive" />
                            </CardHeader>
                            <CardContent className="p-3 pt-0">
                                <div className="text-2xl font-bold">{absentMeals}</div>
                                <p className="text-xs text-muted-foreground">Meals</p>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 p-3 pb-1">
                                <CardTitle className="text-sm font-medium">Holidays</CardTitle>
                                <CalendarDays className="h-4 w-4 text-blue-400" />
                            </CardHeader>
                            <CardContent className="p-3 pt-0">
                                <div className="text-2xl font-bold">{holidayMeals}</div>
                                <p className="text-xs text-muted-foreground">Meals</p>
                            </CardContent>
                        </Card>
                    </div>
                </div>

                <Card className="flex-grow">
                    <CardHeader className="p-4 pb-2">
                        <CardTitle className="text-lg flex items-center gap-2"><Wallet className="h-5 w-5" />Billing</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3 text-sm p-4 pt-2">
                        <div className="space-y-2">
                             {currentData.bill.details && (
                                <div className="flex justify-between items-center">
                                    <p className="text-muted-foreground flex items-center gap-2">
                                        <Utensils className="h-4 w-4" /> Billable Meals
                                    </p>
                                    <p>{currentData.bill.details.totalMeals} meals x ₹{currentData.bill.details.chargePerMeal.toLocaleString()}</p>
                                </div>
                             )}
                            <Separator />
                            <div className="flex justify-between items-center font-semibold text-base">
                                <p>Total Bill Amount</p>
                                <p>₹{currentData.bill.total.toLocaleString()}</p>
                            </div>
                        </div>
                        
                        {currentData.bill.payments.length > 0 && (
                            <div className="pt-1">
                                <p className="font-medium text-foreground/80 mb-1.5">Payments Received:</p>
                                <div className="space-y-1 pl-2 border-l-2 border-dashed">
                                {currentData.bill.payments.map((payment, index) => (
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
                            <span className={cn(remainingBill > 0 ? 'text-destructive' : 'text-foreground')}>₹{remainingBill.toLocaleString()}</span>
                        </div>
                    </CardContent>
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
                    <CardHeader className="p-4 pb-0">
                        <CardTitle>Attendance for {format(month, 'MMMM yyyy')}</CardTitle>
                    </CardHeader>
                    <CardContent className="flex-grow flex items-center justify-center p-0">
                        <Calendar
                            month={month}
                            onMonthChange={setMonth}
                            modifiers={calendarModifiers}
                            components={{ DayContent: CustomDayContent }}
                            modifiersClassNames={{
                                leave_full: "bg-destructive text-destructive-foreground",
                                leave_half: "bg-destructive/70 text-destructive-foreground",
                                holiday_full: "bg-primary/40 text-primary-foreground",
                                holiday_half: "bg-primary/30 text-primary-foreground",
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
                            <div className="flex items-center gap-2">
                                <div className="flex items-center gap-0.5"><div className="h-2 w-2 rounded-full bg-foreground" /><div className="h-2 w-2 rounded-full bg-foreground/40" /></div>
                                <span>Attended / Skipped</span>
                            </div>
                            <div className="flex items-center gap-2"><span className="h-2.5 w-2.5 shrink-0 rounded-full bg-destructive" />Leave</div>
                            <div className="flex items-center gap-2"><span className="h-2.5 w-2.5 shrink-0 rounded-full bg-primary/40" />Holiday</div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </Card>
    );
}
