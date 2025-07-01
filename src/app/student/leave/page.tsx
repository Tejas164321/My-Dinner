
'use client';

import { useState, useEffect, useMemo } from 'react';
import { format, isFuture, eachDayOfInterval } from 'date-fns';
import { Calendar as CalendarIcon, Plus, Trash2, Utensils, Sun, Moon } from 'lucide-react';

import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { ScrollArea } from '@/components/ui/scroll-area';
import { leaveHistory as initialLeaves, Holiday as Leave } from '@/lib/data';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';

type HolidayType = 'full_day' | 'lunch_only' | 'dinner_only';
type LeaveType = 'one_day' | 'long_leave';

export default function StudentLeavePage() {
  const [leaves, setLeaves] = useState<Leave[]>(initialLeaves.sort((a, b) => a.date.getTime() - b.date.getTime()));
  
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
    const now = new Date();
    setToday(now);
    setOneDayDate(now);
  }, []);

  const upcomingLeaves = useMemo(() => {
    if (!today) return [];
    return leaves.filter(h => isFuture(h.date) || format(h.date, 'yyyy-MM-dd') === format(today, 'yyyy-MM-dd'));
  }, [leaves, today]);

  const handleApplyForLeave = () => {
    let newLeaves: Leave[] = [];
    const reason = "Student Leave";
    
    if (leaveType === 'one_day' && oneDayDate) {
      newLeaves.push({ name: reason, date: oneDayDate, type: oneDayType });
    } else if (leaveType === 'long_leave' && longLeaveFromDate && longLeaveToDate) {
      const dates = eachDayOfInterval({ start: longLeaveFromDate, end: longLeaveToDate });
      
      if (dates.length === 1) {
         if (longLeaveFromType === 'dinner_only' && longLeaveToType === 'lunch_only') {
             newLeaves.push({ name: reason, date: dates[0], type: 'full_day' });
         } else if (longLeaveFromType === 'dinner_only') {
             newLeaves.push({ name: reason, date: dates[0], type: 'dinner_only' });
         } else if (longLeaveToType === 'lunch_only') {
            newLeaves.push({ name: reason, date: dates[0], type: 'lunch_only' });
         } else {
             newLeaves.push({ name: reason, date: dates[0], type: 'full_day' });
         }
      } else {
        newLeaves = dates.map((date, index) => {
          if (index === 0) return { name: reason, date, type: longLeaveFromType === 'dinner_only' ? 'dinner_only' : 'full_day' };
          if (index === dates.length - 1) return { name: reason, date, type: longLeaveToType === 'lunch_only' ? 'lunch_only' : 'full_day' };
          return { name: reason, date, type: 'full_day' };
        });
      }
    } else {
      return;
    }

    const existingDates = new Set(leaves.map(h => h.date.getTime()));
    const uniqueNewLeaves = newLeaves.filter(h => !existingDates.has(h.date.getTime()));

    const updatedLeaves = [...leaves, ...uniqueNewLeaves].sort((a, b) => a.date.getTime() - b.date.getTime());
    setLeaves(updatedLeaves);
    
    setOneDayDate(today);
    setOneDayType('full_day');
    setLongLeaveFromDate(undefined);
    setLongLeaveToDate(undefined);
    setLongLeaveFromType('dinner_only');
    setLongLeaveToType('lunch_only');
  };

  const handleDeleteLeave = (dateToDelete: Date) => {
    setLeaves(leaves.filter(h => h.date.getTime() !== dateToDelete.getTime()));
  };
  
  const getLeaveTypeText = (type: Leave['type']) => {
    return type.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  return (
    <div className="flex flex-col gap-8 animate-in fade-in-0 slide-in-from-top-5 duration-700">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Apply for Leave</h1>
        <p className="text-muted-foreground">Manage your meal leaves and track your applications.</p>
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
                  {!today ? (
                    <div className="flex h-full items-center justify-center text-sm text-muted-foreground py-10"><p>Loading...</p></div>
                  ) : upcomingLeaves.length > 0 ? (
                    upcomingLeaves.map((leave) => (
                      <div key={leave.date.toISOString()} className="flex items-center justify-between rounded-lg p-2.5 bg-secondary/50">
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
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:bg-destructive/10 hover:text-destructive" onClick={() => handleDeleteLeave(leave.date)}>
                              <Trash2 className="h-4 w-4" />
                            </Button>
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
