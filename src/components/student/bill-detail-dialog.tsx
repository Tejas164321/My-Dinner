

'use client';

import { useMemo } from 'react';
import type { DayContentProps } from 'react-day-picker';
import { Badge } from '@/components/ui/badge';
import { Calendar } from '@/components/ui/calendar';
import { Card, CardContent } from '@/components/ui/card';
import type { Bill, Holiday, Leave } from '@/lib/data';
import { useAuth } from '@/contexts/auth-context';
import { Utensils, FileDown, Wallet, X, Sun, Moon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { format, isSameDay, getDaysInMonth, isFuture, parseISO, startOfDay, getMonth, getYear, isBefore, isAfter } from 'date-fns';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import { DialogClose, DialogHeader, DialogTitle } from '@/components/ui/dialog';

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

   const planStartDate = useMemo(() => {
        if (!student?.planStartDate) return null;
        const dateValue = typeof student.planStartDate === 'string' 
            ? parseISO(student.planStartDate) 
            : (student.planStartDate as any).toDate ? (student.planStartDate as any).toDate() : new Date(student.planStartDate);

        return startOfDay(dateValue);
    }, [student]);


   const {
        holidayDays,
        fullLeaveDays,
        halfLeaveDays,
        fullPresentDays,
        halfPresentDays,
        beforePlanDays,
        futureDays,
        dayTypeMap,
    } = useMemo(() => {
        if (!student || !planStartDate) return { holidayDays: [], fullLeaveDays: [], halfLeaveDays: [], fullPresentDays: [], halfPresentDays: [], beforePlanDays: [], futureDays: [], dayTypeMap: new Map() };
        
        const year = monthDate.getFullYear();
        const monthIndex = monthDate.getMonth();
        const daysInMonth = getDaysInMonth(new Date(year, monthIndex, 1));
        const allDaysInMonth = Array.from({ length: daysInMonth }, (_, i) => new Date(year, monthIndex, i + 1));
        const today = startOfDay(new Date());

        const hDays: Date[] = [];
        const flDays: Date[] = [];
        const hlDays: Date[] = [];
        const fpDays: Date[] = [];
        const hpDays: Date[] = [];
        const bpDays: Date[] = [];
        const ftDays: Date[] = [];
        const dtMap = new Map();

        const studentLeaves = leaves.filter(l => getMonth(l.date) === monthIndex && getYear(l.date) === year);
        const monthHolidays = holidays.filter(h => getMonth(h.date) === monthIndex && getYear(h.date) === year);

        const ltm = new Map(studentLeaves.map(l => [format(l.date, 'yyyy-MM-dd'), l.type]));
        const htm = new Map(monthHolidays.map(h => [format(h.date, 'yyyy-MM-dd'), h.type]));

        allDaysInMonth.forEach(day => {
            const dateKey = format(day, 'yyyy-MM-dd');
            
            if (isBefore(day, planStartDate)) {
                bpDays.push(day);
                dtMap.set(dateKey, { type: 'before_plan' });
                return;
            }
            if (isAfter(day, today)) {
                ftDays.push(day);
                dtMap.set(dateKey, { type: 'future' });
                return;
            }

            const holidayType = htm.get(dateKey);
            const leaveType = ltm.get(dateKey);

            if (holidayType) {
                hDays.push(day);
                dtMap.set(dateKey, { type: 'holiday', holidayType });
            } else if (leaveType) {
                if (leaveType === 'full_day') {
                    flDays.push(day);
                } else {
                    hlDays.push(day);
                }
                dtMap.set(dateKey, { type: 'leave', leaveType });
            } else {
                 if (student.messPlan === 'full_day') {
                    fpDays.push(day);
                } else {
                    hpDays.push(day);
                }
                dtMap.set(dateKey, { type: 'present' });
            }
        });

        return { 
            holidayDays: hDays,
            fullLeaveDays: flDays,
            halfLeaveDays: hlDays,
            fullPresentDays: fpDays,
            halfPresentDays: hpDays,
            beforePlanDays: bpDays,
            futureDays: ftDays,
            dayTypeMap: dtMap,
        };
  }, [monthDate, student, holidays, leaves, planStartDate]);

  function CustomDayContent({ date }: DayContentProps) {
    if (!student) return <div>{date.getDate()}</div>
    
    const dateKey = format(date, 'yyyy-MM-dd');
    const dayInfo = dayTypeMap.get(dateKey);
    
    if (dayInfo?.type === 'before_plan' || dayInfo?.type === 'future') {
         return <div className="relative h-full w-full flex items-center justify-center">{date.getDate()}</div>;
    }
    
    const holidayType = dayInfo?.type === 'holiday' ? dayInfo.holidayType : null;
    const leaveType = dayInfo?.type === 'leave' ? dayInfo.leaveType : null;
    
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
        <div className="relative z-10">{date.getDate()}</div>
        <div className="absolute bottom-1 flex items-center justify-center gap-0.5 z-10">
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
          className: 'border-transparent bg-green-600 text-primary-foreground hover:bg-green-600/80',
        };
      case 'Due':
        return { variant: 'destructive', className: '' };
      default:
        return { variant: 'secondary', className: '' };
    }
  };

  const statusInfo = getStatusInfo(dueAmount > 0 ? 'Due' : 'Paid');

  return (
    <>
      <DialogHeader className="p-4 md:p-6 pb-0">
        <DialogTitle className="text-xl">Bill for {bill.month} {bill.year}</DialogTitle>
      </DialogHeader>
      <div className="bg-background grid grid-cols-1 lg:grid-cols-5 gap-6 p-4 md:p-6">
          {/* --- Left Column: Billing & Attendance Summary --- */}
          <div className="lg:col-span-2 flex flex-col gap-6">
              {/* Billing Details */}
              <div className="space-y-3">
                  <h3 className="font-semibold text-base">Billing Summary</h3>
                  <div className="space-y-3 text-sm p-3 md:p-4 border rounded-lg bg-secondary/30">
                      <div className="flex justify-between items-center">
                          <p className="text-muted-foreground">Billable Meals</p>
                          <p>{bill.details.totalMeals} meals x ₹{bill.details.chargePerMeal.toLocaleString()}</p>
                      </div>
                      <Separator />
                      <div className="flex justify-between items-center font-semibold text-lg">
                          <p>Total Bill</p>
                          <p>₹{bill.totalAmount.toLocaleString()}</p>
                      </div>
                      {bill.payments.length > 0 && (
                          <div className="pt-2">
                              <p className="font-medium text-foreground/90 mb-2">Payments:</p>
                              <div className="space-y-1.5 pl-2 border-l-2 border-dashed">
                              {bill.payments.map((payment, index) => (
                                  <div key={index} className="flex justify-between items-center text-green-400">
                                      <p className="text-muted-foreground">
                                          <span className="text-green-400 font-mono text-xs">✔</span> on {format(new Date(payment.date), 'MMM do')}
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
                          <div className="flex items-center gap-2">
                              <p>Final Due</p>
                              <Badge variant={statusInfo.variant as any} className={cn('capitalize', statusInfo.className)}>
                                  {dueAmount > 0 ? 'Due' : 'Paid'}
                              </Badge>
                          </div>
                          <p className={cn(dueAmount > 0 ? 'text-destructive' : 'text-foreground')}>
                              ₹{dueAmount.toLocaleString()}
                          </p>
                      </div>
                  </div>
              </div>

               {/* Action Buttons */}
              <div className="grid grid-cols-2 gap-4 mt-auto">
                  <Button variant="outline" className="w-full">
                      <FileDown /> Download Bill
                  </Button>
                  {dueAmount > 0 && (
                      <Button className="w-full" onClick={() => onPayNow(bill)}>
                          <Wallet /> Pay Now
                      </Button>
                  )}
              </div>
          </div>
          
          {/* --- Right Column: Calendar --- */}
          <div className="lg:col-span-3 flex flex-col gap-4">
               <h3 className="font-semibold text-base">Attendance Details</h3>
               <div className="p-3 border rounded-lg bg-secondary/30 flex flex-col flex-1">
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
                  
                  <Separator className="my-3"/>
                  
                  {/* Calendar */}
                  <div className="flex-grow flex items-center justify-center p-0">
                       <Calendar
                          month={monthDate}
                          modifiers={{
                              today: new Date(),
                              holiday: holidayDays,
                              full_leave: fullLeaveDays,
                              half_leave: halfLeaveDays,
                              half_present: halfPresentDays,
                              full_present: fullPresentDays,
                              before_plan: beforePlanDays,
                              future: futureDays,
                          }}
                          components={{ DayContent: CustomDayContent }}
                          modifiersClassNames={{
                                today: 'day-today-highlight',
                                holiday: 'bg-primary/40 text-primary-foreground',
                                full_leave: 'bg-destructive text-destructive-foreground',
                                half_leave: 'bg-chart-3 text-primary-foreground',
                                full_present: 'bg-chart-2 text-primary-foreground',
                                half_present: 'bg-chart-3 text-primary-foreground',
                                before_plan: 'opacity-50 !bg-transparent text-muted-foreground/50 cursor-not-allowed',
                                future: '!bg-transparent',
                          }}
                          classNames={{
                              months: 'w-full',
                              month: 'w-full space-y-4',
                              head_cell: 'text-muted-foreground w-full font-normal text-[0.8rem]',
                              cell: 'h-9 w-9 text-center text-sm p-0 relative rounded-full flex items-center justify-center',
                              day: 'h-9 w-9 p-0 font-normal aria-selected:opacity-100 rounded-full flex items-center justify-center',
                              day_selected: 'bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground focus:bg-primary focus:text-primary-foreground',
                          }}
                          className="p-0"
                          showOutsideDays={false}
                          disabled
                      />
                  </div>
                  {/* Legend */}
                  <div className="p-0 pt-3 mt-auto">
                      <div className="flex w-full items-center justify-center gap-x-3 gap-y-2 text-xs text-muted-foreground flex-wrap">
                          <div className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 shrink-0 rounded-full bg-chart-2" />Present</div>
                          <div className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 shrink-0 rounded-full bg-chart-3" />Half Day</div>
                          <div className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 shrink-0 rounded-full bg-destructive" />Leave</div>
                          <div className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 shrink-0 rounded-full bg-primary/40" />Holiday</div>
                          <div className="flex items-center gap-2"><div className="w-5 h-5 rounded-full bg-accent/30 border border-accent"></div>Today</div>
                      </div>
                  </div>
               </div>
          </div>
      </div>
    </>
  );
}
