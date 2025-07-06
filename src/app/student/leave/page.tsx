
'use client';

import { useState, useEffect, useMemo } from 'react';
import { format, isFuture, eachDayOfInterval, startOfDay } from 'date-fns';
import { Calendar as CalendarIcon, Plus, Trash2, Utensils, Sun, Moon } from 'lucide-react';

import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Leave, Holiday } from '@/lib/data';
import { onHolidaysUpdate } from '@/lib/listeners/holidays';
import { onLeavesUpdate } from '@/lib/listeners/leaves';
import { addLeaves, deleteLeave, type LeavePayload } from '@/lib/actions/leaves';
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

type HolidayType = 'full_day' | 'lunch_only' | 'dinner_only';
type LeaveType = 'one_day' | 'long_leave';

export default function StudentLeavePage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [leaves, setLeaves] = useState<Leave[]>([]);
  const [holidays, setHolidays] = useState<Holiday[]>([]);
  const [leavesLoading, setLeavesLoading] = useState(true);
  
  // Form State
  const [leaveType, setLeaveType] = useState<LeaveType>('one_day');
  const [oneDayDate, setOneDayDate] = useState<Date | undefined>();
  const [oneDayType, setOneDayType] = useState<HolidayType>('full_day');
  const [longLeaveFromDate, setLongLeaveFromDate] = useState<Date | undefined>();
  const [longLeaveToDate, setLongLeaveToDate] = useState<Date | undefined>();
  const [longLeaveFromType, setLongLeaveFromType] = useState<HolidayType>('dinner_only');
  const [longLeaveToType, setLongLeaveToType] = useState<HolidayType>('lunch_only');
  
  const [today, setToday] = useState<Date | undefined>();

  useEffect(() => {
    const now = startOfDay(new Date());
    setToday(now);
    setOneDayDate(now);

    setLeavesLoading(true);
    let leavesUnsubscribe: (() => void) | null = null;
    if (user) {
        leavesUnsubscribe = onLeavesUpdate(user.uid, (updatedLeaves) => {
            setLeaves(updatedLeaves);
            setLeavesLoading(false);
        });
    } else {
      setLeavesLoading(false);
    }

    const holidaysUnsubscribe = onHolidaysUpdate(setHolidays);
    
    return () => {
        if (leavesUnsubscribe) leavesUnsubscribe();
        holidaysUnsubscribe();
    };
  }, [user]);

  const upcomingLeaves = useMemo(() => {
    if (!today) return [];
    return leaves
      .filter(l => l.date >= today)
      .sort((a, b) => a.date.getTime() - b.date.getTime());
  }, [leaves, today]);
  
  const upcomingHolidays = useMemo(() => {
    if (!today) return [];
    return holidays
        .filter(h => h.date >= today)
        .slice(0, 5);
  }, [holidays, today]);

  const handleApplyForLeave = async () => {
    if (!user) return;
    
    let leavesToSubmit: LeavePayload[] = [];
    const reason = "Student Leave";
    
    if (leaveType === 'one_day' && oneDayDate) {
      leavesToSubmit.push({ 
          studentId: user.uid, 
          name: reason, 
          date: oneDayDate.toISOString(), 
          type: oneDayType 
      });
    } else if (leaveType === 'long_leave' && longLeaveFromDate && longLeaveToDate) {
        if (longLeaveToDate < longLeaveFromDate) {
            toast({ variant: "destructive", title: "Invalid Date Range" });
            return;
        }
      const dates = eachDayOfInterval({ start: longLeaveFromDate, end: longLeaveToDate });
      
      if (dates.length === 1) {
         let type: HolidayType = 'full_day';
         if (longLeaveFromType === 'dinner_only' && longLeaveToType === 'lunch_only') type = 'full_day';
         else if (longLeaveFromType === 'dinner_only') type = 'dinner_only';
         else if (longLeaveToType === 'lunch_only') type = 'lunch_only';
         else type = 'full_day';
         leavesToSubmit.push({ studentId: user.uid, name: reason, date: dates[0].toISOString(), type });
      } else {
        leavesToSubmit = dates.map((date, index) => {
            let type: HolidayType = 'full_day';
            if (index === 0) {
                type = longLeaveFromType === 'dinner_only' ? 'dinner_only' : 'full_day';
            }
            if (index === dates.length - 1) {
                type = longLeaveToType === 'lunch_only' ? 'lunch_only' : 'full_day';
            }
            return { studentId: user.uid, name: reason, date: date.toISOString(), type };
        });
      }
    } else {
      toast({ variant: "destructive", title: "Missing Information" });
      return;
    }

    // Filter out dates that are already on leave
    const existingLeaveDates = new Set(leaves.map(l => format(l.date, 'yyyy-MM-dd')));
    const uniqueNewLeaves = leavesToSubmit.filter(l => !existingLeaveDates.has(format(new Date(l.date), 'yyyy-MM-dd')));

    if(uniqueNewLeaves.length === 0) {
        toast({ title: "Already Applied", description: "You have already applied for leave on the selected date(s)." });
        return;
    }

    try {
        await addLeaves(uniqueNewLeaves);
        toast({ title: "Success", description: "Your leave application has been submitted." });
        // Reset form
        setOneDayDate(today);
        setOneDayType('full_day');
        setLongLeaveFromDate(undefined);
        setLongLeaveToDate(undefined);
    } catch (error) {
        toast({ variant: "destructive", title: "Error", description: "Failed to apply for leave." });
    }
  };

  const handleDeleteLeave = async (leaveId: string) => {
    try {
      await deleteLeave(leaveId);
      toast({ title: "Leave Cancelled", description: "Your leave has been successfully cancelled." });
    } catch (error) {
      toast({ variant: "destructive", title: "Error", description: "Failed to cancel leave." });
    }
  };
  
  const getLeaveTypeText = (type: Leave['type']) => {
    return type.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  return (
    <div className="flex flex-col gap-8 animate-in fade-in-0 slide-in-from-top-5 duration-700">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Apply for Leave</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 items-start">
        <div className="lg:col-span-3 flex flex-col gap-8">
          <Card>
            <CardHeader>
              <CardTitle>New Leave Application</CardTitle>
              <CardDescription>Submit a request to skip meals. Please apply before the deadline.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
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
                        <PopoverContent className="w-auto p-0"><Calendar mode="single" selected={oneDayDate} onSelect={setOneDayDate} initialFocus showOutsideDays={false} /></PopoverContent>
                        </Popover>
                    </div>
                    <div className="space-y-3">
                        <Label>Leave For</Label>
                         <RadioGroup value={oneDayType} onValueChange={(value: HolidayType) => setOneDayType(value)} className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                            <Label htmlFor="full_day" className="flex flex-col items-center justify-center text-center rounded-md border-2 border-muted bg-popover p-4 font-normal hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary cursor-pointer transition-all">
                                <RadioGroupItem value="full_day" id="full_day" className="sr-only" />
                                <Utensils className="mb-3 h-6 w-6" />
                                Full Day
                            </Label>
                             <Label htmlFor="lunch_only" className="flex flex-col items-center justify-center text-center rounded-md border-2 border-muted bg-popover p-4 font-normal hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary cursor-pointer transition-all">
                                <RadioGroupItem value="lunch_only" id="lunch_only" className="sr-only" />
                                <Sun className="mb-3 h-6 w-6" />
                                Lunch Only
                            </Label>
                             <Label htmlFor="dinner_only" className="flex flex-col items-center justify-center text-center rounded-md border-2 border-muted bg-popover p-4 font-normal hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary cursor-pointer transition-all">
                                <RadioGroupItem value="dinner_only" id="dinner_only" className="sr-only" />
                                <Moon className="mb-3 h-6 w-6" />
                                Dinner Only
                            </Label>
                        </RadioGroup>
                    </div>
                  </div>
                )}
                
                {leaveType === 'long_leave' && (
                  <div className="space-y-4 animate-in fade-in-0 duration-300">
                     <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>From Date</Label>
                        <Popover>
                          <PopoverTrigger asChild>
                            <Button variant={'outline'} className={cn('w-full justify-start text-left font-normal', !longLeaveFromDate && 'text-muted-foreground')}>
                              <CalendarIcon className="mr-2 h-4 w-4" />
                              {longLeaveFromDate ? format(longLeaveFromDate, 'PPP') : <span>Pick a date</span>}
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0"><Calendar mode="single" selected={longLeaveFromDate} onSelect={setLongLeaveFromDate} initialFocus showOutsideDays={false} /></PopoverContent>
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
                          <PopoverContent className="w-auto p-0"><Calendar mode="single" selected={longLeaveToDate} onSelect={setLongLeaveToDate} initialFocus showOutsideDays={false} /></PopoverContent>
                        </Popover>
                      </div>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-3">
                          <Label>From (First Day)</Label>
                          <RadioGroup value={longLeaveFromType} onValueChange={(value: HolidayType) => setLongLeaveFromType(value)} className="grid grid-cols-1 gap-4">
                            <Label htmlFor="from_full_day" className="flex flex-col items-center justify-center text-center rounded-md border-2 border-muted bg-popover p-4 font-normal hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary cursor-pointer transition-all">
                                <RadioGroupItem value="full_day" id="from_full_day" className="sr-only" />
                                <Utensils className="mb-3 h-6 w-6" />
                                Full Day
                                <p className="text-xs text-muted-foreground mt-1">(Leave starts before lunch)</p>
                            </Label>
                            <Label htmlFor="from_dinner_only" className="flex flex-col items-center justify-center text-center rounded-md border-2 border-muted bg-popover p-4 font-normal hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary cursor-pointer transition-all">
                                <RadioGroupItem value="dinner_only" id="from_dinner_only" className="sr-only" />
                                <Moon className="mb-3 h-6 w-6" />
                                Dinner Only
                                <p className="text-xs text-muted-foreground mt-1">(Attend lunch, leave for dinner)</p>
                            </Label>
                          </RadioGroup>
                      </div>
                       <div className="space-y-3">
                          <Label>To (Last Day)</Label>
                          <RadioGroup value={longLeaveToType} onValueChange={(value: HolidayType) => setLongLeaveToType(value)} className="grid grid-cols-1 gap-4">
                             <Label htmlFor="to_full_day" className="flex flex-col items-center justify-center text-center rounded-md border-2 border-muted bg-popover p-4 font-normal hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary cursor-pointer transition-all">
                                <RadioGroupItem value="full_day" id="to_full_day" className="sr-only" />
                                <Utensils className="mb-3 h-6 w-6" />
                                Full Day
                                <p className="text-xs text-muted-foreground mt-1">(Return after dinner)</p>
                            </Label>
                             <Label htmlFor="to_lunch_only" className="flex flex-col items-center justify-center text-center rounded-md border-2 border-muted bg-popover p-4 font-normal hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary cursor-pointer transition-all">
                                <RadioGroupItem value="lunch_only" id="to_lunch_only" className="sr-only" />
                                <Sun className="mb-3 h-6 w-6" />
                                Lunch Only
                                 <p className="text-xs text-muted-foreground mt-1">(Return for dinner)</p>
                            </Label>
                          </RadioGroup>
                      </div>
                    </div>
                  </div>
                )}

              <Button onClick={handleApplyForLeave} className="w-full !mt-8">
                <Plus className="mr-2 h-4 w-4" /> Apply for Leave
              </Button>
            </CardContent>
          </Card>
           <Card className="flex flex-col">
            <CardHeader>
              <CardTitle>Upcoming Mess Holidays</CardTitle>
              <CardDescription>The mess will be closed on these days.</CardDescription>
            </CardHeader>
            <CardContent className="flex-grow p-2 pt-0">
              <ScrollArea className="h-48">
                <div className="p-4 pt-0 space-y-2">
                  {!today ? (
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
                            {holiday.type === 'full_day' && <Utensils className="h-5 w-5 text-destructive flex-shrink-0" />}
                            {holiday.type === 'lunch_only' && <Sun className="h-5 w-5 text-chart-3 flex-shrink-0" />}
                            {holiday.type === 'dinner_only' && <Moon className="h-5 w-5 text-chart-3 flex-shrink-0" />}
                            <div>
                                <p className="font-semibold text-sm">{holiday.name}</p>
                                <p className="text-xs text-muted-foreground">{format(holiday.date, 'MMMM do, yyyy')}</p>
                            </div>
                         </div>
                         <Badge variant="outline" className={cn("capitalize border-dashed", holiday.type === 'full_day' && 'border-destructive text-destructive', holiday.type !== 'full_day' && 'border-chart-3 text-chart-3')}>{getLeaveTypeText(holiday.type as HolidayType)}</Badge>
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
        <div className="lg:col-span-2 flex flex-col">
          <Card className="flex flex-col flex-grow">
            <CardHeader>
              <CardTitle>My Upcoming Leaves</CardTitle>
              <CardDescription>A list of your approved upcoming leaves.</CardDescription>
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
                                    <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:bg-destructive/10 hover:text-destructive">
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
                                        <AlertDialogAction onClick={() => handleDeleteLeave(leave.id)}>
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
        </div>
      </div>
    </div>
  );
}
