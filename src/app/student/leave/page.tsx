

'use client';

import { useState, useEffect, useMemo } from 'react';
import { format, isFuture, eachDayOfInterval, startOfDay, isBefore, isSameDay, getHours, getMinutes, parse } from 'date-fns';
import { Calendar as CalendarIcon, Plus, Loader2 } from 'lucide-react';
import { collection, writeBatch, doc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Leave, Holiday } from '@/lib/data';
import { onHolidaysUpdate } from '@/lib/listeners/holidays';
import { onLeavesUpdate } from '@/lib/listeners/leaves';
import { useAuth } from '@/contexts/auth-context';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { getMessInfo } from '@/lib/services/mess';
import { Sun, Moon, Utensils } from 'lucide-react';
import { UpcomingEventsCard } from '@/components/student/upcoming-events-card';
import { AttendanceCalendar } from '@/components/shared/attendance-calendar';


type HolidayType = 'full_day' | 'lunch_only' | 'dinner_only';
type LeaveType = 'one_day' | 'long_leave';

export type LeavePayload = Omit<Leave, 'id'> & { date: Date };

export default function StudentLeavePage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [leaves, setLeaves] = useState<Leave[]>([]);
  const [holidays, setHolidays] = useState<Holiday[]>([]);
  const [dataLoading, setDataLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  
  // Form State
  const [leaveType, setLeaveType] = useState<LeaveType>('one_day');
  const [oneDayDate, setOneDayDate] = useState<Date | undefined>(startOfDay(new Date()));
  const [oneDayType, setOneDayType] = useState<HolidayType>('full_day');
  const [longLeaveFromDate, setLongLeaveFromDate] = useState<Date | undefined>();
  const [longLeaveToDate, setLongLeaveToDate] = useState<Date | undefined>();
  const [longLeaveFromType, setLongLeaveFromType] = useState<HolidayType>('full_day');
  const [longLeaveToType, setLongLeaveToType] = useState<HolidayType>('lunch_only');
  
  const [today, setToday] = useState<Date>(startOfDay(new Date()));

  // Deadline state
  const [lunchDeadline, setLunchDeadline] = useState('10:00'); 
  const [dinnerDeadline, setDinnerDeadline] = useState('18:00');
  
  const [month, setMonth] = useState<Date>(startOfDay(new Date()));

  // --- For disabling options based on time ---
  const now = new Date();
  const currentHour = getHours(now);
  const lunchDeadlineHour = getHours(parse(lunchDeadline, 'HH:mm', new Date()));
  const dinnerDeadlineHour = getHours(parse(dinnerDeadline, 'HH:mm', new Date()));

  // For "One Day" leave
  const isOneDayTodaySelected = oneDayDate ? isSameDay(oneDayDate, now) : false;
  const isOneDayLunchDisabled = isOneDayTodaySelected && currentHour >= lunchDeadlineHour;
  const isOneDayDinnerDisabled = isOneDayTodaySelected && currentHour >= dinnerDeadlineHour;

  // For "Long Leave" start date
  const isLongLeaveTodaySelected = longLeaveFromDate ? isSameDay(longLeaveFromDate, now) : false;
  const isLongLeaveLunchDisabled = isLongLeaveTodaySelected && currentHour >= lunchDeadlineHour;
  const isLongLeaveDinnerDisabled = isLongLeaveTodaySelected && currentHour >= dinnerDeadlineHour;


  useEffect(() => {
    if (!user || !user.uid || !user.messId) {
        setDataLoading(false);
        return;
    }
    
    setDataLoading(true);

    const fetchSettings = async () => {
        const messInfo = await getMessInfo(user.messId!);
        if (messInfo?.lunchDeadline) setLunchDeadline(messInfo.lunchDeadline);
        if (messInfo?.dinnerDeadline) setDinnerDeadline(messInfo.dinnerDeadline);
    };

    const leavesUnsubscribe = onLeavesUpdate(user.uid, setLeaves);
    const holidaysUnsubscribe = onHolidaysUpdate(user.messId, setHolidays);
    
    Promise.all([
        fetchSettings(),
        new Promise(res => onLeavesUpdate(user.uid, (d) => { setLeaves(d); res(d); })),
        new Promise(res => onHolidaysUpdate(user.messId, (d) => { setHolidays(d); res(d); })),
    ]).then(() => setDataLoading(false));
    
    return () => {
        leavesUnsubscribe();
        holidaysUnsubscribe();
    };
  }, [user, today]);

  // Effect to adjust one-day leave type if deadline passes
  useEffect(() => {
    if (isOneDayTodaySelected && isOneDayLunchDisabled && oneDayType !== 'dinner_only') {
        setOneDayType('dinner_only');
    }
  }, [isOneDayTodaySelected, isOneDayLunchDisabled, oneDayType]);

  // Effect to adjust long-leave 'From' type if deadline passes
  useEffect(() => {
      if (isLongLeaveTodaySelected && isLongLeaveLunchDisabled && longLeaveFromType !== 'dinner_only') {
          setLongLeaveFromType('dinner_only');
      }
  }, [isLongLeaveTodaySelected, isLongLeaveLunchDisabled, longLeaveFromType]);
  
  const isActionAllowedForDate = (date: Date, mealType: HolidayType = 'full_day'): boolean => {
    if (isBefore(date, today)) return false; 

    if (isSameDay(date, today)) {
        const timeNow = new Date();
        const [lunchH, lunchM] = lunchDeadline.split(':').map(Number);
        const lunchCutoff = new Date(date);
        lunchCutoff.setHours(lunchH, lunchM, 0, 0);

        const [dinnerH, dinnerM] = dinnerDeadline.split(':').map(Number);
        const dinnerCutoff = new Date(date);
        dinnerCutoff.setHours(dinnerH, dinnerM, 0, 0);

        if (mealType.includes('lunch') || mealType === 'full_day') {
            if (timeNow >= lunchCutoff) return false;
        }
        if (mealType.includes('dinner') || mealType === 'full_day') {
            if (timeNow >= dinnerCutoff) return false;
        }
    }
    return true; 
  };


  const handleApplyForLeave = async () => {
    if (!user) return;
    setIsSaving(true);
    
    const leavesToSubmit: LeavePayload[] = [];
    const reason = "Student Leave";
    const existingLeaveMap = new Map(leaves.map(l => [format(l.date, 'yyyy-MM-dd') + '-' + l.type, true]));
    const holidayMap = new Map(holidays.map(h => [format(h.date, 'yyyy-MM-dd'), h.type]));

    if (leaveType === 'one_day' && oneDayDate) {
        if (!isActionAllowedForDate(oneDayDate, oneDayType)) {
            toast({ variant: "destructive", title: "Deadline Passed", description: "The deadline for applying for this leave has passed." });
            setIsSaving(false);
            return;
        }
        
        const dateKey = format(oneDayDate, 'yyyy-MM-dd');
        const holidayType = holidayMap.get(dateKey);

        if (holidayType === 'full_day' || existingLeaveMap.has(dateKey + '-full_day')) {
             toast({ title: "Already Covered", description: "This day is already a full holiday or leave." });
             setIsSaving(false);
             return;
        }

        if (oneDayType === 'full_day') {
            if (holidayType !== 'lunch_only' && !existingLeaveMap.has(dateKey + '-lunch_only')) {
                leavesToSubmit.push({ studentId: user.uid, name: reason, date: oneDayDate, type: 'lunch_only' });
            }
            if (holidayType !== 'dinner_only' && !existingLeaveMap.has(dateKey + '-dinner_only')) {
                 leavesToSubmit.push({ studentId: user.uid, name: reason, date: oneDayDate, type: 'dinner_only' });
            }
        } else {
             if (holidayType !== oneDayType && !existingLeaveMap.has(dateKey + '-' + oneDayType)) {
                leavesToSubmit.push({ studentId: user.uid, name: reason, date: oneDayDate, type: oneDayType });
             }
        }

    } else if (leaveType === 'long_leave' && longLeaveFromDate && longLeaveToDate) {
        if (longLeaveToDate < longLeaveFromDate) {
            toast({ variant: "destructive", title: "Invalid Date Range" });
            setIsSaving(false);
            return;
        }
        if (!isActionAllowedForDate(longLeaveFromDate, longLeaveFromType)) {
             toast({ variant: "destructive", title: "Deadline Passed", description: `The leave deadline for the start date (${format(longLeaveFromDate, 'PPP')}) has passed.` });
             setIsSaving(false);
             return;
        }
      
        const dates = eachDayOfInterval({ start: longLeaveFromDate, end: longLeaveToDate });
      
        for (const date of dates) {
            const dateKey = format(date, 'yyyy-MM-dd');
            const holidayType = holidayMap.get(dateKey);
            
            if (holidayType === 'full_day' || existingLeaveMap.has(dateKey + '-full_day')) {
                continue; // Skip this day entirely
            }

            let intendedLeaveType: HolidayType = 'full_day';
            if (dates.length === 1) { // Single day "long leave"
                 if(longLeaveFromType === 'full_day' || longLeaveToType === 'full_day' || (longLeaveFromType === 'dinner_only' && longLeaveToType === 'lunch_only')) {
                    intendedLeaveType = 'full_day';
                 } else if (longLeaveFromType === 'dinner_only') {
                    intendedLeaveType = 'dinner_only';
                 } else {
                    intendedLeaveType = 'lunch_only';
                 }
            } else if (isSameDay(date, longLeaveFromDate)) {
                intendedLeaveType = longLeaveFromType;
            } else if (isSameDay(date, longLeaveToDate)) {
                intendedLeaveType = longLeaveToType;
            }
            
            if (intendedLeaveType === 'full_day') {
                if (holidayType !== 'lunch_only' && !existingLeaveMap.has(dateKey + '-lunch_only')) {
                     leavesToSubmit.push({ studentId: user.uid, name: reason, date, type: 'lunch_only' });
                }
                if (holidayType !== 'dinner_only' && !existingLeaveMap.has(dateKey + '-dinner_only')) {
                     leavesToSubmit.push({ studentId: user.uid, name: reason, date, type: 'dinner_only' });
                }
            } else { // Intended leave is partial
                 if (intendedLeaveType === 'lunch_only' && holidayType !== 'lunch_only' && !existingLeaveMap.has(dateKey + '-lunch_only')) {
                     leavesToSubmit.push({ studentId: user.uid, name: reason, date, type: 'lunch_only' });
                 } else if (intendedLeaveType === 'dinner_only' && holidayType !== 'dinner_only' && !existingLeaveMap.has(dateKey + '-dinner_only')) {
                     leavesToSubmit.push({ studentId: user.uid, name: reason, date, type: 'dinner_only' });
                 }
            }
        }
    } else {
      toast({ variant: "destructive", title: "Missing Information" });
      setIsSaving(false);
      return;
    }

    if(leavesToSubmit.length === 0) {
        toast({ title: "No Action Needed", description: "The selected dates are already fully covered by holidays or existing leaves." });
        setIsSaving(false);
        return;
    }

    try {
        const batch = writeBatch(db);
        leavesToSubmit.forEach(leave => {
            const leaveDocRef = doc(collection(db, 'leaves'));
            batch.set(leaveDocRef, leave);
        });
        await batch.commit();

        toast({ title: "Success", description: "Your leave application has been submitted successfully." });
        setOneDayDate(today);
        setOneDayType('full_day');
        setLongLeaveFromDate(undefined);
        setLongLeaveToDate(undefined);
    } catch (error) {
        console.error("Error adding leaves:", error);
        toast({ variant: "destructive", title: "Error", description: "Failed to apply for leave." });
    } finally {
        setIsSaving(false);
    }
  };

  return (
    <div className="flex flex-col gap-8 animate-in fade-in-0 slide-in-from-top-5 duration-700">
      <div className="hidden md:block">
        <h1 className="text-2xl font-bold tracking-tight">Leave & Attendance</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 items-start">
        <div className="lg:col-span-3 flex flex-col gap-8">
           <Tabs defaultValue="apply" className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="apply">Apply for Leave</TabsTrigger>
                    <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
                </TabsList>
                 <TabsContent value="apply" className="mt-4">
                    <Card className="flex flex-col h-full">
                        <CardHeader>
                          <CardTitle className="text-xl">Apply for Leave</CardTitle>
                        </CardHeader>
                        <CardContent className="p-4 md:p-6 pt-0 space-y-6 flex-grow">
                            <div className="space-y-2">
                            <Label>Leave Type</Label>
                                <RadioGroup value={leaveType} onValueChange={(value) => setLeaveType(value as LeaveType)} className="grid grid-cols-2 gap-4">
                                    <Label htmlFor="r_one_day" className="flex items-center justify-center rounded-md border-2 border-muted bg-popover p-4 font-normal hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary cursor-pointer transition-all">
                                        <RadioGroupItem value="one_day" id="r_one_day" className="sr-only" />
                                        One Day
                                    </Label>
                                    <Label htmlFor="r_long_leave" className="flex items-center justify-center rounded-md border-2 border-muted bg-popover p-4 font-normal hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary cursor-pointer transition-all">
                                        <RadioGroupItem value="long_leave" id="r_long_leave" className="sr-only" />
                                        Long Leave
                                    </Label>
                                </RadioGroup>
                            </div>
                            
                            {leaveType === 'one_day' && (
                            <div className="space-y-4 animate-in fade-in-0 duration-300">
                                <div className="space-y-2">
                                    <Label>Date</Label>
                                    <Popover>
                                    <PopoverTrigger asChild>
                                        <Button variant={'outline'} className={cn('w-full justify-start text-left font-normal', !oneDayDate && 'text-muted-foreground')}>
                                        <CalendarIcon className="mr-2 h-4 w-4" />
                                        {oneDayDate ? format(oneDayDate, 'PPP') : <span>Pick a date</span>}
                                        </Button>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-auto p-0"><Calendar mode="single" selected={oneDayDate} onSelect={setOneDayDate} initialFocus disabled={(date) => isBefore(date, today)} showOutsideDays={false} /></PopoverContent>
                                    </Popover>
                                </div>
                                <div className="space-y-3">
                                    <Label>Leave For</Label>
                                    <RadioGroup 
                                      value={isOneDayLunchDisabled ? 'dinner_only' : oneDayType}
                                      onValueChange={(value: HolidayType) => setOneDayType(value)} 
                                      className="grid grid-cols-3 gap-2 md:gap-4"
                                    >
                                        <Label className={cn("flex flex-col items-center justify-center text-center rounded-md border-2 border-muted bg-popover p-2 md:p-4 font-normal transition-all", isOneDayLunchDisabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary')}>
                                            <RadioGroupItem value="full_day" id="full_day" className="sr-only" disabled={isOneDayLunchDisabled} />
                                            <Utensils className="mb-2 h-5 w-5 md:mb-3 md:h-6 md:w-6" />
                                            <span className="text-xs md:text-sm">Full Day</span>
                                        </Label>
                                         <Label className={cn("flex flex-col items-center justify-center text-center rounded-md border-2 border-muted bg-popover p-2 md:p-4 font-normal transition-all", isOneDayLunchDisabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary')}>
                                            <RadioGroupItem value="lunch_only" id="lunch_only" className="sr-only" disabled={isOneDayLunchDisabled} />
                                            <Sun className="mb-2 h-5 w-5 md:mb-3 md:h-6 md:w-6" />
                                            <span className="text-xs md:text-sm">Lunch Only</span>
                                        </Label>
                                         <Label className={cn("flex flex-col items-center justify-center text-center rounded-md border-2 border-muted bg-popover p-2 md:p-4 font-normal transition-all", isOneDayDinnerDisabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary')}>
                                            <RadioGroupItem value="dinner_only" id="dinner_only" className="sr-only" disabled={isOneDayDinnerDisabled} />
                                            <Moon className="mb-2 h-5 w-5 md:mb-3 md:h-6 md:w-6" />
                                            <span className="text-xs md:text-sm">Dinner Only</span>
                                        </Label>
                                    </RadioGroup>
                                </div>
                            </div>
                            )}
                            
                            {leaveType === 'long_leave' && (
                            <div className="space-y-4 animate-in fade-in-0 duration-300">
                                <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>From Date</Label>
                                    <Popover>
                                    <PopoverTrigger asChild>
                                        <Button variant={'outline'} className={cn('w-full justify-start text-left font-normal', !longLeaveFromDate && 'text-muted-foreground')}>
                                        <CalendarIcon className="mr-2 h-4 w-4" />
                                        {longLeaveFromDate ? format(longLeaveFromDate, 'PPP') : <span>Pick a date</span>}
                                        </Button>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-auto p-0"><Calendar mode="single" selected={longLeaveFromDate} onSelect={setLongLeaveFromDate} initialFocus disabled={(date) => isBefore(date, today)} showOutsideDays={false} /></PopoverContent>
                                    </Popover>
                                </div>
                                <div className="space-y-2">
                                    <Label>To Date</Label>
                                    <Popover>
                                    <PopoverTrigger asChild>
                                        <Button variant={'outline'} className={cn('w-full justify-start text-left font-normal', !longLeaveToDate && 'text-muted-foreground')}>
                                        <CalendarIcon className="mr-2 h-4 w-4" />
                                        {longLeaveToDate ? format(longLeaveToDate, 'PPP') : <span>Pick a date</span>}
                                        </Button>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-auto p-0"><Calendar mode="single" selected={longLeaveToDate} onSelect={setLongLeaveToDate} initialFocus disabled={(date) => isBefore(date, today)} showOutsideDays={false} /></PopoverContent>
                                    </Popover>
                                </div>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-3">
                                    <Label>From (First Day)</Label>
                                    <RadioGroup
                                        value={isLongLeaveLunchDisabled ? 'dinner_only' : longLeaveFromType}
                                        onValueChange={(value: HolidayType) => setLongLeaveFromType(value)} 
                                        className="grid grid-cols-1 gap-2"
                                    >
                                        <Label htmlFor="from_full_day" className={cn("flex flex-col items-center justify-center text-center rounded-md border-2 border-muted bg-popover p-2 font-normal transition-all", isLongLeaveLunchDisabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary')}>
                                            <RadioGroupItem value="full_day" id="from_full_day" className="sr-only" disabled={isLongLeaveLunchDisabled}/>
                                            <Utensils className="mb-2 h-5 w-5" />
                                            Full Day
                                        </Label>
                                        <Label htmlFor="from_dinner_only" className={cn("flex flex-col items-center justify-center text-center rounded-md border-2 border-muted bg-popover p-2 font-normal transition-all", isLongLeaveDinnerDisabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary')}>
                                            <RadioGroupItem value="dinner_only" id="from_dinner_only" className="sr-only" disabled={isLongLeaveDinnerDisabled}/>
                                            <Moon className="mb-2 h-5 w-5" />
                                            Dinner Only
                                        </Label>
                                    </RadioGroup>
                                </div>
                                <div className="space-y-3">
                                    <Label>To (Last Day)</Label>
                                    <RadioGroup value={longLeaveToType} onValueChange={(value: HolidayType) => setLongLeaveToType(value)} className="grid grid-cols-1 gap-2">
                                        <Label htmlFor="to_full_day" className="flex flex-col items-center justify-center text-center rounded-md border-2 border-muted bg-popover p-2 font-normal hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary cursor-pointer transition-all">
                                            <RadioGroupItem value="full_day" id="to_full_day" className="sr-only" />
                                            <Utensils className="mb-2 h-5 w-5" />
                                            Full Day
                                        </Label>
                                        <Label htmlFor="to_lunch_only" className="flex flex-col items-center justify-center text-center rounded-md border-2 border-muted bg-popover p-2 font-normal hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary cursor-pointer transition-all">
                                            <RadioGroupItem value="lunch_only" id="to_lunch_only" className="sr-only" />
                                            <Sun className="mb-2 h-5 w-5" />
                                            Lunch Only
                                        </Label>
                                    </RadioGroup>
                                </div>
                                </div>
                            </div>
                            )}
                        </CardContent>
                        <CardFooter className="p-4 pt-0 md:p-6 md:pt-0">
                            <Button onClick={handleApplyForLeave} className="w-full" disabled={isSaving}>
                                {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Plus className="mr-2 h-4 w-4" />}
                                {isSaving ? "Applying..." : "Apply for Leave"}
                            </Button>
                        </CardFooter>
                    </Card>
                 </TabsContent>
                 <TabsContent value="upcoming">
                    <UpcomingEventsCard leaves={leaves} holidays={holidays} isLoading={dataLoading} showFooter={false} />
                 </TabsContent>
           </Tabs>
        </div>

        <div className="lg:col-span-2 flex flex-col gap-8">
            <Card className="flex flex-col h-full">
                <CardHeader>
                  <CardTitle>Attendance Calendar</CardTitle>
                  <CardDescription>View your attendance status for {format(month, 'MMMM yyyy')}.</CardDescription>
                </CardHeader>
                <CardContent className="flex-grow flex flex-col items-center justify-center gap-8">
                    {user && <AttendanceCalendar user={user} leaves={leaves} holidays={holidays} month={month} onMonthChange={setMonth} />}
                </CardContent>
                 <CardFooter className="flex flex-col items-start gap-2 p-4 pt-2 border-t mt-4">
                    <p className="font-semibold text-foreground text-base mb-1">Legend</p>
                    <div className="flex w-full flex-wrap items-center justify-start gap-x-4 gap-y-2 text-sm text-muted-foreground">
                        <div className="flex items-center gap-2"><span className="h-3 w-3 shrink-0 rounded-full bg-green-500" />Present</div>
                        <div className="flex items-center gap-2"><span className="h-3 w-3 shrink-0 rounded-full bg-destructive" />Leave</div>
                        <div className="flex items-center gap-2"><span className="h-3 w-3 shrink-0 rounded-full bg-orange-500" />Holiday</div>
                        <div className="flex items-center gap-2"><div className="w-5 h-5 rounded-full ring-2 ring-primary ring-offset-2 ring-offset-background"></div>Today</div>
                    </div>
                </CardFooter>
            </Card>
        </div>
      </div>
    </div>
  );
}
