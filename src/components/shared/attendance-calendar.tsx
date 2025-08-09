
'use client';

import { useMemo, type FC } from 'react';
import type { DayProps } from 'react-day-picker';
import { Calendar } from '@/components/ui/calendar';
import type { Holiday, Leave, AppUser } from '@/lib/data';
import { cn } from '@/lib/utils';
import { format, isSameMonth, isSameDay, startOfDay, parseISO, isBefore, isAfter } from 'date-fns';
import { Tooltip, TooltipProvider, TooltipTrigger, TooltipContent } from '@/components/ui/tooltip';

type MealStatus = 'Present' | 'Leave' | 'Holiday' | 'Not Applicable';

interface DayStatus {
    lunch: MealStatus;
    dinner: MealStatus;
}

const statusColors: { [key in MealStatus]: string } = {
    'Present': 'bg-green-500',
    'Leave': 'bg-destructive',
    'Holiday': 'bg-orange-500',
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
        const studentLeaves = new Map(leaves.map(l => [format(l.date, 'yyyy-MM-dd'), l.type]));
        const messHolidays = new Map(holidays.map(h => [format(h.date, 'yyyy-MM-dd'), h.type]));
        
        const allDaysInMonth = Array.from({ length: new Date(month.getFullYear(), month.getMonth() + 1, 0).getDate() }, (_, i) => new Date(month.getFullYear(), month.getMonth(), i + 1));
        
        allDaysInMonth.forEach(day => {
            const dateKey = format(day, 'yyyy-MM-dd');
            let dayStatus: DayStatus = { lunch: 'Not Applicable', dinner: 'Not Applicable' };
            
            if (isBefore(day, planStartDate) || isAfter(day, today)) {
                 dtMap.set(dateKey, dayStatus);
                 return;
            }

            const leaveType = studentLeaves.get(dateKey);
            const holidayType = messHolidays.get(dateKey);

            // Lunch Status
            if (user.messPlan === 'full_day' || user.messPlan === 'lunch_only') {
                 if (isSameDay(day, planStartDate) && user.planStartMeal === 'dinner') {
                    dayStatus.lunch = 'Not Applicable';
                 } else {
                     if (holidayType === 'full_day' || holidayType === 'lunch_only') {
                        dayStatus.lunch = 'Holiday';
                     } else if (leaveType === 'full_day' || leaveType === 'lunch_only') {
                        dayStatus.lunch = 'Leave';
                     } else {
                        dayStatus.lunch = 'Present';
                     }
                 }
            }

             // Dinner Status
            if (user.messPlan === 'full_day' || user.messPlan === 'dinner_only') {
                if (holidayType === 'full_day' || holidayType === 'dinner_only') {
                    dayStatus.dinner = 'Holiday';
                 } else if (leaveType === 'full_day' || leaveType === 'dinner_only') {
                    dayStatus.dinner = 'Leave';
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
    
        return (
            <TooltipProvider delayDuration={100}>
                <Tooltip>
                    <TooltipTrigger asChild>
                         <div className={cn("relative w-full h-full flex flex-col items-center justify-center p-0 font-normal", isToday && "rounded-full ring-2 ring-primary ring-offset-1 ring-offset-background")}>
                            <div className="absolute inset-0 flex flex-col overflow-hidden rounded-full">
                                <div className={cn("flex-1", lunchColor)}></div>
                                <div className={cn("flex-1", dinnerColor)}></div>
                            </div>
                            <span className="relative z-10 text-white font-semibold">
                                {date.getDate()}
                            </span>
                        </div>
                    </TooltipTrigger>
                    <TooltipContent>
                         <div className="space-y-1 text-center">
                            <p className="font-bold">{format(date, "PPP")}</p>
                            <p className="text-sm"><span className="font-semibold">Lunch:</span> {status.lunch}</p>
                            <p className="text-sm"><span className="font-semibold">Dinner:</span> {status.dinner}</p>
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
