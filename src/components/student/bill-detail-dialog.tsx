
'use client';

import { useMemo, useState, useEffect } from 'react';
import type { DayContentProps } from 'react-day-picker';
import { Badge } from '@/components/ui/badge';
import { Calendar } from '@/components/ui/calendar';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from '@/components/ui/card';
import type { Bill, Holiday, Leave } from '@/lib/data';
import { useAuth } from '@/contexts/auth-context';
import { Utensils, FileDown, Wallet, CalendarCheck2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { format, isSameDay } from 'date-fns';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';

const monthMap: { [key: string]: number } = {
  January: 0, February: 1, March: 2, April: 3, May: 4, June: 5,
  July: 6, August: 7, September: 8, October: 9, November: 10, December: 11,
};

const getPaidAmount = (bill: Bill) => bill.payments.reduce((sum, p) => sum + p.amount, 0);

interface BillDetailDialogProps {
  bill: Bill;
  onPayNow: (bill: Bill) => void;
  holidays: Holiday[];
  leaves: Leave[];
}

export function BillDetailDialog({ bill, onPayNow, holidays, leaves }: BillDetailDialogProps) {
  const { user: student } = useAuth();
  const monthIndex = monthMap[bill.month];
  const monthDate = new Date(bill.year, monthIndex, 1);
  const paidAmount = getPaidAmount(bill);
  const dueAmount = bill.totalAmount - paidAmount;

  const {
    holidayDays,
    fullLeaveDays,
    halfPresentDays,
    fullPresentDays,
    leaveTypeMap,
    holidayTypeMap,
  } = useMemo(() => {
    const year = bill.year;
    const monthIndex = monthMap[bill.month];
    if (monthIndex === undefined || !student) {
      return { holidayDays: [], fullLeaveDays: [], halfPresentDays: [], fullPresentDays: [], leaveTypeMap: new Map(), holidayTypeMap: new Map() };
    }

    const daysInMonth = new Date(year, monthIndex + 1, 0).getDate();
    const allDays = Array.from({ length: daysInMonth }, (_, i) => new Date(year, monthIndex, i + 1));

    const hDays: Date[] = [];
    const flDays: Date[] = [];
    const hpDays: Date[] = [];
    const fpDays: Date[] = [];

    const studentLeaves = leaves.filter(l => l.studentId === student.uid);
    const ltm = new Map(studentLeaves.map(l => [format(l.date, 'yyyy-MM-dd'), l.type]));
    const htm = new Map(holidays.map(h => [format(h.date, 'yyyy-MM-dd'), h.type]));

    allDays.forEach(day => {
      const dateKey = format(day, 'yyyy-MM-dd');
      const holidayType = htm.get(dateKey);
      const leaveType = ltm.get(dateKey);

      if (holidayType) {
        hDays.push(day);
      } else if (leaveType) {
        if (leaveType === 'full_day') {
          flDays.push(day);
        } else {
          hpDays.push(day);
        }
      } else {
        if (student.messPlan === 'full_day') {
          fpDays.push(day);
        } else {
          hpDays.push(day); // Half-day plan users are always 'half_present'
        }
      }
    });

    return { 
        holidayDays: hDays,
        fullLeaveDays: flDays,
        halfPresentDays: hpDays,
        fullPresentDays: fpDays,
        leaveTypeMap: ltm,
        holidayTypeMap: htm,
    };
  }, [bill, student, holidays, leaves]);

  function CustomDayContent({ date }: DayContentProps) {
    if (!student) return <div>{date.getDate()}</div>
    const dateKey = format(date, 'yyyy-MM-dd');
    const leaveType = leaveTypeMap.get(dateKey);
    const holidayType = holidayTypeMap.get(dateKey);

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
  }
    
  const getStatusInfo = (status: 'Paid' | 'Due') => {
    switch (status) {
      case 'Paid':
        return {
          variant: 'secondary',
          className:
            'border-transparent bg-green-600 text-primary-foreground hover:bg-green-600/80',
        };
      case 'Due':
        return { variant: 'destructive', className: '' };
      default:
        return { variant: 'secondary', className: '' };
    }
  };

  const statusInfo = getStatusInfo(dueAmount > 0 ? 'Due' : 'Paid');

  return (
    <Card className="grid grid-cols-1 lg:grid-cols-5 gap-6 p-6 w-full relative bg-card/95 backdrop-blur-xl border-border">
      {/* --- Left Column: Billing Details --- */}
      <div className="lg:col-span-3 flex flex-col gap-6">
        <Card className="flex flex-col h-full">
          <CardHeader>
            <div className="flex justify-between items-start">
              <div>
                <CardTitle>
                  Bill for {bill.month} {bill.year}
                </CardTitle>
                <CardDescription>
                  Generated on: {bill.generationDate}
                </CardDescription>
              </div>
              <Badge
                variant={statusInfo.variant as any}
                className={cn(
                  'capitalize text-sm h-7 w-28 justify-center',
                  statusInfo.className
                )}
              >
                {dueAmount > 0 ? 'Due' : 'Paid'}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-4 flex-grow">
            <div className="space-y-3 rounded-lg border p-4 h-full">
              <h4 className="font-semibold text-foreground">Calculation & Payments</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between items-center">
                  <p className="text-muted-foreground flex items-center gap-2">
                    <Utensils /> Total Meals Taken
                  </p>
                  <p>{bill.details.totalMeals} meals x ₹{bill.details.chargePerMeal.toLocaleString()}</p>
                </div>
                <Separator />
                <div className="flex justify-between items-center font-semibold text-lg">
                  <p>Total Bill Amount</p>
                  <p>₹{bill.totalAmount.toLocaleString()}</p>
                </div>
                 {bill.payments.length > 0 && (
                    <div className="pt-2">
                        <p className="font-medium text-foreground/90 mb-2">Payments Received:</p>
                        <div className="space-y-1.5 pl-2 border-l-2 border-dashed">
                        {bill.payments.map((payment, index) => (
                            <div key={index} className="flex justify-between items-center text-green-400">
                                <p className="text-muted-foreground">
                                    <span className="text-green-400 font-mono text-xs">✔</span> Payment on {format(new Date(payment.date), 'MMM do, yyyy')}
                                </p>
                                <p>- ₹{payment.amount.toLocaleString()}</p>
                            </div>
                        ))}
                        </div>
                    </div>
                )}
                 <div className="flex justify-between items-center pt-1">
                    <p className="text-muted-foreground">Total Paid</p>
                    <p className="text-green-400">- ₹{paidAmount.toLocaleString()}</p>
                </div>
                <Separator />
                <div className="flex justify-between items-center font-semibold text-lg">
                  <p>Final Due Amount</p>
                  <p className={cn(dueAmount > 0 ? 'text-destructive' : 'text-foreground')}>
                    ₹{dueAmount.toLocaleString()}
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
          <CardFooter className="gap-2">
            <Button variant="outline" className="w-full">
              <FileDown /> Download Bill
            </Button>
            {dueAmount > 0 && (
              <Button className="w-full" onClick={() => onPayNow(bill)}>
                  <Wallet /> Pay Now
              </Button>
            )}
          </CardFooter>
        </Card>
      </div>

      {/* --- Right Column: Attendance Details --- */}
      <div className="lg:col-span-2 flex flex-col gap-6 relative">
        <Card className="flex-1 flex flex-col">
            <CardHeader className="p-4">
                <CardTitle className="text-base flex items-center gap-2">
                    <CalendarCheck2 className="h-5 w-5" />
                    Attendance for {bill.month}
                </CardTitle>
                 <CardDescription>
                    {bill.details.totalDaysInMonth} total days in the month.
                </CardDescription>
            </CardHeader>
            <CardContent className="p-4 pt-0 flex flex-col flex-grow">
                {/* Attendance Summary Stats */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center">
                    <div>
                        <p className="text-2xl font-bold text-green-400">{bill.details.fullDays}</p>
                        <p className="text-xs text-muted-foreground">Full Days</p>
                    </div>
                    <div>
                        <p className="text-2xl font-bold text-yellow-400">{bill.details.halfDays}</p>
                        <p className="text-xs text-muted-foreground">Half Days</p>
                    </div>
                    <div>
                        <p className="text-2xl font-bold text-blue-400">{bill.details.holidays}</p>
                        <p className="text-xs text-muted-foreground">Holidays</p>
                    </div>
                    <div>
                        <p className="text-2xl font-bold text-destructive">{bill.details.absentDays}</p>
                        <p className="text-xs text-muted-foreground">Absent</p>
                    </div>
                </div>

                <Separator className="my-4"/>

                {/* Calendar */}
                <div className="flex-grow flex items-center justify-center p-0">
                    <Calendar
                        month={monthDate}
                        modifiers={{
                            holiday: holidayDays,
                            full_leave: fullLeaveDays,
                            half_present: halfPresentDays,
                            full_present: fullPresentDays,
                        }}
                        components={{ DayContent: CustomDayContent }}
                        modifiersClassNames={{
                            holiday: 'bg-primary/40 text-primary-foreground',
                            full_leave: 'bg-destructive text-destructive-foreground',
                            half_present: 'bg-chart-3 text-primary-foreground',
                            full_present: 'bg-chart-2 text-primary-foreground',
                        }}
                        classNames={{
                            months: 'w-full',
                            month: 'w-full space-y-4',
                            head_cell:
                            'text-muted-foreground w-full font-normal text-sm',
                            cell: 'h-9 w-9 text-center text-sm p-0 relative rounded-full flex items-center justify-center',
                            day: 'h-9 w-9 p-0 font-normal aria-selected:opacity-100 rounded-full flex items-center justify-center',
                            day_today: 'bg-accent text-accent-foreground rounded-full',
                            day_selected:
                            'bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground focus:bg-primary focus:text-primary-foreground',
                        }}
                        className="p-0"
                        showOutsideDays={false}
                        disabled
                    />
                </div>
                
                {/* Legend */}
                <div className="p-0 pt-4 mt-auto">
                    <div className="flex w-full items-center justify-center gap-4 text-xs text-muted-foreground flex-wrap">
                        <div className="flex items-center gap-2"><span className="h-2.5 w-2.5 shrink-0 rounded-full bg-chart-2" />Present</div>
                        <div className="flex items-center gap-2"><span className="h-2.5 w-2.5 shrink-0 rounded-full bg-chart-3" />Half Day</div>
                        <div className="flex items-center gap-2"><span className="h-2.5 w-2.5 shrink-0 rounded-full bg-destructive" />Leave</div>
                        <div className="flex items-center gap-2"><span className="h-2.5 w-2.5 shrink-0 rounded-full bg-primary/40" />Holiday</div>
                    </div>
                </div>
            </CardContent>
        </Card>
      </div>
    </Card>
  );
}
