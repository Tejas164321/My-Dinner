
'use client';

import { useState, useEffect, useMemo } from 'react';
import { format, isFuture, eachDayOfInterval, startOfDay, isBefore, isSameDay, getHours, getMinutes, parse } from 'date-fns';
import { Calendar as CalendarIcon, Plus, Trash2, Utensils, Sun, Moon, Loader2 } from 'lucide-react';
import { collection, writeBatch, doc, deleteDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Leave, Holiday } from '@/lib/data';
import { onHolidaysUpdate } from '@/lib/listeners/holidays';
import { onLeavesUpdate } from '@/lib/listeners/leaves';
import { useAuth } from '@/contexts/auth-context';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { getMessInfo } from '@/lib/services/mess';


type HolidayType = 'full_day' | 'lunch_only' | 'dinner_only';
type LeaveType = 'one_day' | 'long_leave';

export type LeavePayload = Omit<Leave, 'id'> & { date: Date };

export default function StudentLeavePage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [leaves, setLeaves] = useState<Leave[]>([]);
  const [holidays, setHolidays] = useState<Holiday[]>([]);
  const [leavesLoading, setLeavesLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  
  // Form State
  const [leaveType, setLeaveType] = useState<LeaveType>('one_day');
  const [oneDayDate, setOneDayDate] = useState<Date | undefined>();
  const [oneDayType, setOneDayType] = useState<HolidayType>('full_day');
  const [longLeaveFromDate, setLongLeaveFromDate] = useState<Date | undefined>();
  const [longLeaveToDate, setLongLeaveToDate] = useState<Date | undefined>();
  const [longLeaveFromType, setLongLeaveFromType] = useState<HolidayType>('full_day');
  const [longLeaveToType, setLongLeaveToType] = useState<HolidayType>('lunch_only');
  
  const [today, setToday] = useState<Date>(startOfDay(new Date()));

  // Deadline state
  const [lunchDeadline, setLunchDeadline] = useState('10:00'); 
  const [dinnerDeadline, setDinnerDeadline] = useState('18:00');

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
    setOneDayDate(today);

    if (!user || !user.uid || !user.messId) {
        setLeavesLoading(false);
        return;
    }
    
    setLeavesLoading(true);

    const fetchSettings = async () => {
        const messInfo = await getMessInfo(user.messId!);
        if (messInfo?.lunchDeadline) setLunchDeadline(messInfo.lunchDeadline);
        if (messInfo?.dinnerDeadline) setDinnerDeadline(messInfo.dinnerDeadline);
    };

    fetchSettings();

    const leavesUnsubscribe = onLeavesUpdate(user.uid, (updatedLeaves) => {
        setLeaves(updatedLeaves);
        setLeavesLoading(false);
    });
    
    const holidaysUnsubscribe = onHolidaysUpdate(user.messId, setHolidays);
    
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
  

  const upcomingLeaves = useMemo(() => {
    const rawUpcoming = leaves
      .filter(l => l.name !== 'Plan Activation' && l.date >= today)
      .sort((a, b) => a.date.getTime() - b.date.getTime());

    const leavesByDate = new Map<string, Leave[]>();

    // Group leaves by date
    for (const leave of rawUpcoming) {
        const dateKey = format(leave.date, 'yyyy-MM-dd');
        if (!leavesByDate.has(dateKey)) {
            leavesByDate.set(dateKey, []);
        }
        leavesByDate.get(dateKey)!.push(leave);
    }
    
    const mergedLeaves: Leave[] = [];

    // Process grouped leaves
    for (const [dateKey, dateLeaves] of leavesByDate.entries()) {
        if (dateLeaves.length === 1) {
            mergedLeaves.push(dateLeaves[0]);
            continue;
        }

        const hasFullDay = dateLeaves.some(l => l.type === 'full_day');
        const hasLunch = dateLeaves.some(l => l.type === 'lunch_only');
        const hasDinner = dateLeaves.some(l => l.type === 'dinner_only');

        if (hasFullDay || (hasLunch && hasDinner)) {
            // Create a synthetic full day leave
            const representativeLeave = dateLeaves[0];
            mergedLeaves.push({
                ...representativeLeave,
                id: `${dateKey}-merged`, // Create a stable unique ID
                type: 'full_day'
            });
        } else {
            // Push them individually if they are not a pair (e.g., two lunch leaves, shouldn't happen)
            mergedLeaves.push(...dateLeaves);
        }
    }

    return mergedLeaves.sort((a,b) => a.date.getTime() - b.date.getTime());
  }, [leaves, today]);
  
  const upcomingHolidays = useMemo(() => {
    return holidays
        .filter(h => h.date >= today)
        .slice(0, 5);
  }, [holidays, today]);
  
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

  const handleDeleteLeave = async (leave: Leave) => {
    try {
        if (!isActionAllowedForDate(leave.date, leave.type)) {
            toast({ variant: 'destructive', title: 'Deadline Passed', description: 'You can no longer cancel this leave as the deadline has passed.' });
            return;
        }

        if (leave.id.endsWith('-merged')) {
            const dateKey = format(leave.date, 'yyyy-MM-dd');
            const partialLeavesToDelete = leaves.filter(l => format(l.date, 'yyyy-MM-dd') === dateKey && (l.type === 'lunch_only' || l.type === 'dinner_only'));

            if (partialLeavesToDelete.length > 0) {
                const batch = writeBatch(db);
                partialLeavesToDelete.forEach(l => {
                    batch.delete(doc(db, 'leaves', l.id));
                });
                await batch.commit();
                toast({ title: "Full Day Leave Cancelled" });
            }
        } else {
            const docRef = doc(db, 'leaves', leave.id);
            await deleteDoc(docRef);
            toast({ title: "Leave Cancelled" });
        }
    } catch (error) {
      console.error("Error cancelling leave:", error);
      toast({ variant: "destructive", title: "Error", description: "Failed to cancel leave." });
    }
  };
  
  const getLeaveTypeText = (type: Leave['type']) => {
    return type.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  return (
    <div className="flex flex-col gap-8 animate-in fade-in-0 slide-in-from-top-5 duration-700">
      <div className="hidden md:block">
        <h1 className="text-2xl font-bold tracking-tight">Apply for Leave</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 items-start">
        <div className="lg:col-span-3 flex flex-col gap-8">
           <Tabs defaultValue="apply" className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="apply">Apply</TabsTrigger>
                    <TabsTrigger value="upcoming">
                        Upcoming
                        {upcomingLeaves.length > 0 && <Badge className="ml-2">{upcomingLeaves.length}</Badge>}
                    </TabsTrigger>
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
                    <Card className="flex flex-col h-full">
                        <CardHeader>
                            <CardTitle className="text-xl">Upcoming Leaves</CardTitle>
                        </CardHeader>
                        <CardContent className="flex-grow p-2 pt-0">
                        <ScrollArea className="h-96">
                            <div className="p-4 pt-0 space-y-2">
                            {leavesLoading ? (
                                <div className="flex h-full items-center justify-center text-sm text-muted-foreground py-10"><p>Loading...</p></div>
                            ) : upcomingLeaves.length > 0 ? (
                                upcomingLeaves.map((leave) => (
                                <div key={leave.id} className="flex items-center justify-between rounded-lg p-2.5 bg-secondary/50">
                                    <div className="flex items-center gap-3">
                                        {leave.type === 'full_day' && <Utensils className="h-5 w-5 text-destructive flex-shrink-0" />}
                                        {leave.type === 'lunch_only' && <Sun className="h-5 w-5 text-chart-3 flex-shrink-0" />}
                                        {leave.type === 'dinner_only' && <Moon className="h-5 w-5 text-chart-3 flex-shrink-0" />}
                                        <div>
                                            <p className="font-semibold text-sm">{format(leave.date, 'MMMM do, yyyy')}</p>
                                            <p className="text-xs text-muted-foreground">{getLeaveTypeText(leave.type)}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <AlertDialog>
                                            <AlertDialogTrigger asChild>
                                                <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:bg-destructive/10 hover:text-destructive" disabled={!isActionAllowedForDate(leave.date, leave.type)}>
                                                <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </AlertDialogTrigger>
                                            <AlertDialogContent>
                                                <AlertDialogHeader>
                                                    <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                                                    <AlertDialogDescription>
                                                        This will cancel your leave for {format(leave.date, 'MMMM do, yyyy')}. This action cannot be undone.
                                                    </AlertDialogDescription>
                                                </AlertDialogHeader>
                                                <AlertDialogFooter>
                                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                    <AlertDialogAction onClick={() => handleDeleteLeave(leave)}>
                                                        Confirm Cancellation
                                                    </AlertDialogAction>
                                                </AlertDialogFooter>
                                            </AlertDialogContent>
                                        </AlertDialog>
                                    </div>
                                </div>
                                ))
                            ) : (
                                <div className="flex h-full items-center justify-center text-sm text-muted-foreground py-10">
                                <p>You have no upcoming leaves.</p>
                                </div>
                            )}
                            </div>
                        </ScrollArea>
                        </CardContent>
                    </Card>
                 </TabsContent>
           </Tabs>
        </div>
        <div className="lg:col-span-2 flex flex-col">
           <Card className="flex flex-col flex-grow">
            <CardHeader>
              <CardTitle className="text-xl">Upcoming Holidays</CardTitle>
            </CardHeader>
            <CardContent className="flex-grow p-2 pt-0">
              <ScrollArea className="h-48">
                <div className="p-4 pt-0 space-y-2">
                  {leavesLoading ? (
                    <div className="flex h-full items-center justify-center text-sm text-muted-foreground py-10">
                      <p>Loading...</p>
                    </div>
                  ) : upcomingHolidays.length > 0 ? (
                    upcomingHolidays.map((holiday) => (
                      <div
                        key={holiday.date.toISOString()}
                        className="flex items-center justify-between rounded-lg p-2.5 bg-secondary/50"
                      >
                         <div className="flex items-center gap-3">
                            {holiday.type === 'full_day' && <Utensils className="h-5 w-5 text-orange-500 flex-shrink-0" />}
                            {holiday.type === 'lunch_only' && <Sun className="h-5 w-5 text-orange-500 flex-shrink-0" />}
                            {holiday.type === 'dinner_only' && <Moon className="h-5 w-5 text-orange-500 flex-shrink-0" />}
                            <div>
                                <p className="font-semibold text-sm">{holiday.name}</p>
                                <p className="text-xs text-muted-foreground">{format(holiday.date, 'MMMM do, yyyy')}</p>
                            </div>
                         </div>
                         <Badge variant="outline" className={cn("capitalize border-dashed border-orange-500 text-orange-500")}>{getLeaveTypeText(holiday.type as HolidayType)}</Badge>
                      </div>
                    ))
                  ) : (
                    <div className="flex h-full items-center justify-center text-sm text-muted-foreground py-10">
                      <p>No upcoming holidays.</p>
                    </div>
                  )}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
