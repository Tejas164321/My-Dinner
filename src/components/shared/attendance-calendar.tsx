
'use client';

import { useMemo, type FC } from 'react';
import type { DayProps } from 'react-day-picker';
import { Calendar } from '@/components/ui/calendar';
import type { Holiday, Leave, AppUser } from '@/lib/data';
import { cn } from '@/lib/utils';
import { format, isSameMonth, isSameDay, startOfDay, parseISO, isBefore, isAfter } from 'date-fns';
import { Tooltip, TooltipProvider, TooltipTrigger, TooltipContent } from '@/components/ui/tooltip';

type MealStatus = 'Present' | 'Leave' | 'Holiday' | 'Not Applicable' | 'Future';

interface DayStatus {
    lunch: MealStatus;
    dinner: MealStatus;
}

const statusColors: { [key in MealStatus]: string } = {
    'Present': 'bg-green-500',
    'Leave': 'bg-destructive',
    'Holiday': 'bg-orange-500',
    'Future': 'bg-muted/50',
    'Not Applicable': 'bg-transparent',
};

interface AttendanceCalendarProps {
    user: AppUser;
    leaves: Leave[];
    holidays: Holiday[];
    month: Date;
    onMonthChange: (date: Date) => void;
}

export const AttendanceCalendar: FC<AttendanceCalendarProps> = ({ user, leaves, holidays, month, onMonthChange }) => {

    const planStartDate = useMemo(() => {
        if (!user?.planStartDate) return null;
        const dateValue = user.planStartDate;
        return typeof dateValue === 'string' ? startOfDay(parseISO(dateValue)) : startOfDay((dateValue as any).toDate());
    }, [user]);

    const dayTypeMap = useMemo(() => {
        const dtMap = new Map<string, DayStatus>();
        if (!user || !planStartDate) return dtMap;

        const today = startOfDay(new Date());

        const leavesByDate = new Map<string, Leave[]>();
        for (const leave of leaves) {
            const dateKey = format(leave.date, 'yyyy-MM-dd');
            if (!leavesByDate.has(dateKey)) {
                leavesByDate.set(dateKey, []);
            }
            leavesByDate.get(dateKey)!.push(leave);
        }

        const messHolidays = new Map(holidays.map(h => [format(h.date, 'yyyy-MM-dd'), h.type]));
        
        const allDaysInMonth = Array.from({ length: new Date(month.getFullYear(), month.getMonth() + 1, 0).getDate() }, (_, i) => new Date(month.getFullYear(), month.getMonth(), i + 1));
        
        allDaysInMonth.forEach(day => {
            const dateKey = format(day, 'yyyy-MM-dd');
            let dayStatus: DayStatus = { lunch: 'Not Applicable', dinner: 'Not Applicable' };
            
            if (isBefore(day, planStartDate)) {
                 dtMap.set(dateKey, dayStatus);
                 return;
            }

            const dayLeaves = leavesByDate.get(dateKey) || [];
            const holidayType = messHolidays.get(dateKey);
            
            const isFutureDate = isAfter(day, today);

            const hasLunchLeave = dayLeaves.some(l => l.type === 'full_day' || l.type === 'lunch_only');
            const hasDinnerLeave = dayLeaves.some(l => l.type === 'full_day' || l.type === 'dinner_only');

            // Lunch Status
            if (user.messPlan === 'full_day' || user.messPlan === 'lunch_only') {
                 if (isSameDay(day, planStartDate) && user.planStartMeal === 'dinner') {
                    dayStatus.lunch = 'Not Applicable';
                 } else {
                     if (holidayType === 'full_day' || holidayType === 'lunch_only') {
                        dayStatus.lunch = 'Holiday';
                     } else if (hasLunchLeave) {
                        dayStatus.lunch = 'Leave';
                     } else if (isFutureDate) {
                        dayStatus.lunch = 'Future';
                     } else {
                        dayStatus.lunch = 'Present';
                     }
                 }
            }

             // Dinner Status
            if (user.messPlan === 'full_day' || user.messPlan === 'dinner_only') {
                if (holidayType === 'full_day' || holidayType === 'dinner_only') {
                    dayStatus.dinner = 'Holiday';
                 } else if (hasDinnerLeave) {
                    dayStatus.dinner = 'Leave';
                 } else if (isFutureDate) {
                    dayStatus.dinner = 'Future';
                 } else {
                    dayStatus.dinner = 'Present';
                 }
            }
            
            dtMap.set(dateKey, dayStatus);
        });
        
        return dtMap;
    }, [month, user, holidays, leaves, planStartDate]);

    const CustomDay: FC<DayProps> = (props) => {
        const { date, displayMonth } = props;
        
        if (!isSameMonth(date, displayMonth)) {
             return <div />;
        }
        
        const dateKey = format(date, 'yyyy-MM-dd');
        const status = dayTypeMap.get(dateKey);
        
        if (!status || (status.lunch === 'Not Applicable' && status.dinner === 'Not Applicable')) {
            return <div className="text-muted-foreground/50 h-full w-full flex items-center justify-center p-0 font-normal">{date.getDate()}</div>
        }
    
        const lunchColor = statusColors[status.lunch];
        const dinnerColor = statusColors[status.dinner];
        const isToday = isSameDay(date, new Date());
    
        const isEvent = status.lunch === 'Holiday' || status.lunch === 'Leave' || status.dinner === 'Holiday' || status.dinner === 'Leave';
        const isFutureDate = status.lunch === 'Future' || status.dinner === 'Future';

        return (
            <TooltipProvider delayDuration={100}>
                <Tooltip>
                    <TooltipTrigger asChild>
                         <div className={cn("relative w-full h-full flex flex-col items-center justify-center p-0 font-normal", isToday && "rounded-full ring-2 ring-primary ring-offset-1 ring-offset-background")}>
                            <div className="absolute inset-0 flex flex-col overflow-hidden rounded-full">
                                <div className={cn("flex-1", lunchColor)}></div>
                                <div className={cn("flex-1", dinnerColor)}></div>
                            </div>
                            <span className={cn("relative z-10 font-semibold", isFutureDate && !isEvent ? "text-muted-foreground" : "text-white")}>
                                {date.getDate()}
                            </span>
                        </div>
                    </TooltipTrigger>
                    <TooltipContent>
                         <div className="space-y-1 text-center">
                            <p className="font-bold">{format(date, "PPP")}</p>
                            <p className="text-sm"><span className="font-semibold">Lunch:</span> {status.lunch === 'Future' ? 'Open' : status.lunch}</p>
                            <p className="text-sm"><span className="font-semibold">Dinner:</span> {status.dinner === 'Future' ? 'Open' : status.dinner}</p>
                        </div>
                    </TooltipContent>
                </Tooltip>
            </TooltipProvider>
        );
    };

    return (
        <Calendar
            month={month}
            onMonthChange={onMonthChange}
            components={{ Day: CustomDay }}
            className="p-0"
            showOutsideDays={false}
        />
    );
};
