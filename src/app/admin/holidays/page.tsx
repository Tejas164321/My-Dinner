
'use client';

import { useState, useEffect, useMemo } from 'react';
import { format, isFuture, eachDayOfInterval, startOfDay } from 'date-fns';
import { Calendar as CalendarIcon, Plus, Trash2, Utensils, Sun, Moon } from 'lucide-react';
import { doc, getDoc, setDoc, deleteDoc, writeBatch } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { onHolidaysUpdate } from '@/lib/listeners/holidays';
import type { Holiday } from '@/lib/data';
import { useAuth } from '@/contexts/auth-context';

import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useToast } from '@/hooks/use-toast';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Badge } from '@/components/ui/badge';
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

const HOLIDAYS_COLLECTION = 'holidays';

export default function HolidaysPage() {
  const { user: adminUser } = useAuth();
  const [holidays, setHolidays] = useState<Holiday[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  
  // Form State
  const [leaveType, setLeaveType] = useState<LeaveType>('one_day');
  const [newHolidayName, setNewHolidayName] = useState('');
  const [oneDayDate, setOneDayDate] = useState<Date | undefined>();
  const [oneDayType, setOneDayType] = useState<HolidayType>('full_day');
  const [longLeaveFromDate, setLongLeaveFromDate] = useState<Date | undefined>();
  const [longLeaveToDate, setLongLeaveToDate] = useState<Date | undefined>();
  const [longLeaveFromType, setLongLeaveFromType] = useState<HolidayType>('dinner_only');
  const [longLeaveToType, setLongLeaveToType] = useState<HolidayType>('lunch_only');
  
  // Calendar View State
  const [month, setMonth] = useState<Date | undefined>();
  const [today, setToday] = useState<Date | undefined>();

  useEffect(() => {
    const now = startOfDay(new Date());
    setMonth(now);
    setToday(now);
    setOneDayDate(now);

    if (!adminUser) return;
    
    setIsLoading(true);
    const unsubscribe = onHolidaysUpdate(adminUser.uid, (updatedHolidays) => {
        setHolidays(updatedHolidays);
        setIsLoading(false);
    });

    return () => unsubscribe();
  }, [adminUser]);

  const upcomingHolidays = useMemo(() => {
    if (!today) return [];
    return holidays.filter(h => h.date >= today);
  }, [holidays, today]);

  const handleAddHoliday = async () => {
    if (!adminUser) {
        toast({ variant: 'destructive', title: 'Authentication Error', description: 'You must be logged in to add holidays.' });
        return;
    }
    if (!newHolidayName) {
        toast({
            variant: "destructive",
            title: "Missing Information",
            description: "Please provide a name or reason for the holiday.",
        });
        return;
    }

    let holidaysToSubmit: Omit<Holiday, 'date'> & { date: Date }[] = [];

    if (leaveType === 'one_day' && oneDayDate) {
        holidaysToSubmit.push({ 
            name: newHolidayName, 
            date: oneDayDate, 
            type: oneDayType,
            messId: adminUser.uid,
        });
    } else if (leaveType === 'long_leave' && longLeaveFromDate && longLeaveToDate) {
        if (longLeaveToDate < longLeaveFromDate) {
            toast({
                variant: "destructive",
                title: "Invalid Date Range",
                description: "The 'To Date' cannot be before the 'From Date'.",
            });
            return;
        }
      
        const dates = eachDayOfInterval({ start: longLeaveFromDate, end: longLeaveToDate });
      
        if (dates.length === 1) {
            let type: HolidayType = 'full_day';
            if (longLeaveFromType === 'dinner_only' && longLeaveToType === 'lunch_only') type = 'full_day';
            else if (longLeaveFromType === 'dinner_only') type = 'dinner_only';
            else if (longLeaveToType === 'lunch_only') type = 'lunch_only';
            holidaysToSubmit.push({ name: newHolidayName, date: dates[0], type, messId: adminUser.uid });
        } else {
            holidaysToSubmit = dates.map((date, index) => {
                let type: HolidayType = 'full_day';
                if (index === 0) {
                    type = longLeaveFromType === 'dinner_only' ? 'dinner_only' : 'full_day';
                }
                if (index === dates.length - 1) {
                    type = longLeaveToType === 'lunch_only' ? 'lunch_only' : 'full_day';
                }
                return { name: newHolidayName, date: date, type, messId: adminUser.uid };
            });
        }
    } else {
        toast({
            variant: "destructive",
            title: "Missing Information",
            description: "Please select valid dates for the holiday.",
        });
        return;
    }

    try {
        const batch = writeBatch(db);
        for (const holiday of holidaysToSubmit) {
            const dateKey = `${holiday.messId}_${format(holiday.date, 'yyyy-MM-dd')}`;
            const docRef = doc(db, HOLIDAYS_COLLECTION, dateKey);
            const docSnap = await getDoc(docRef);

            if (docSnap.exists()) {
                toast({ variant: 'destructive', title: 'Holiday Exists', description: `A holiday for ${format(holiday.date, 'yyyy-MM-dd')} already exists.`});
                return; // Stop if any holiday already exists
            }
            batch.set(docRef, holiday);
        }

        await batch.commit();
        toast({
            title: "Success",
            description: "Holiday(s) have been added successfully.",
        });

        // Reset form
        setNewHolidayName('');
        setOneDayDate(today);
        setOneDayType('full_day');
        setLongLeaveFromDate(undefined);
        setLongLeaveToDate(undefined);
        setLongLeaveFromType('dinner_only');
        setLongLeaveToType('lunch_only');

    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : "An unknown error occurred.";
        toast({
            variant: "destructive",
            title: "Error adding holiday",
            description: errorMessage,
        });
    }
  };

  const handleDeleteHoliday = async (dateToDelete: Date) => {
    if (!adminUser) return;
    try {
      const dateKey = `${adminUser.uid}_${format(dateToDelete, 'yyyy-MM-dd')}`;
      const docRef = doc(db, HOLIDAYS_COLLECTION, dateKey);
      await deleteDoc(docRef);
      toast({
        title: "Success",
        description: "Holiday has been deleted.",
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to delete holiday. Please try again.",
      });
    }
  };
  
  const getHolidayTypeText = (type: Holiday['type']) => {
    return type.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  return (
    <div className="flex flex-col gap-8 animate-in fade-in-0 slide-in-from-top-5 duration-700">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Holiday Management</h1>
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-5">
        <div className="lg:col-span-3 flex flex-col gap-8">
          <Card>
            <CardHeader>
              <CardTitle>Add New Holiday</CardTitle>
              <CardDescription>Schedule holidays for the mess.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                <div className="space-y-2">
                    <Label>Holiday Type</Label>
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
                
                <div className="space-y-2">
                  <Label htmlFor="holiday-name">Holiday Name / Reason</Label>
                  <Input id="holiday-name" placeholder="e.g., Diwali / Semester Break" value={newHolidayName} onChange={(e) => setNewHolidayName(e.target.value)} />
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
                        <Label>Holiday For</Label>
                        <RadioGroup value={oneDayType} onValueChange={(value: HolidayType) => setOneDayType(value)} className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                            <Label htmlFor="full_day" className="flex flex-col items-center justify-center text-center rounded-md border-2 border-muted bg-popover p-4 font-normal hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary cursor-pointer transition-all">
                                <RadioGroupItem value="full_day" id="full_day" className="sr-only" />
                                <Utensils className="mb-3 h-6 w-6" />
                                Full Day
                            </Label>
                             <Label htmlFor="lunch_only" className="flex flex-col items-center justify-center text-center rounded-md border-2 border-muted bg-popover p-4 font-normal hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary cursor-pointer transition-all">
                                <RadioGroupItem value="lunch_only" id="lunch_only" className="sr-only" />
                                <Sun className="mb-3 h-6 w-6" />
                                Lunch Off
                            </Label>
                             <Label htmlFor="dinner_only" className="flex flex-col items-center justify-center text-center rounded-md border-2 border-muted bg-popover p-4 font-normal hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary cursor-pointer transition-all">
                                <RadioGroupItem value="dinner_only" id="dinner_only" className="sr-only" />
                                <Moon className="mb-3 h-6 w-6" />
                                Dinner Off
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
                                    <p className="text-xs text-muted-foreground mt-1">(Holiday starts before lunch)</p>
                                </Label>
                                <Label htmlFor="from_dinner_only" className="flex flex-col items-center justify-center text-center rounded-md border-2 border-muted bg-popover p-4 font-normal hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary cursor-pointer transition-all">
                                    <RadioGroupItem value="dinner_only" id="from_dinner_only" className="sr-only" />
                                    <Moon className="mb-3 h-6 w-6" />
                                    Dinner Off
                                    <p className="text-xs text-muted-foreground mt-1">(Attend lunch, holiday for dinner)</p>
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
                                    <p className="text-xs text-muted-foreground mt-1">(Mess reopens after dinner)</p>
                                </Label>
                                <Label htmlFor="to_lunch_only" className="flex flex-col items-center justify-center text-center rounded-md border-2 border-muted bg-popover p-4 font-normal hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary cursor-pointer transition-all">
                                    <RadioGroupItem value="lunch_only" id="to_lunch_only" className="sr-only" />
                                    <Sun className="mb-3 h-6 w-6" />
                                    Lunch Off
                                    <p className="text-xs text-muted-foreground mt-1">(Mess reopens for dinner)</p>
                                </Label>
                          </RadioGroup>
                      </div>
                    </div>
                  </div>
                )}

              <Button onClick={handleAddHoliday} className="w-full !mt-8">
                <Plus className="mr-2 h-4 w-4" /> Add Holiday(s)
              </Button>
            </CardContent>
          </Card>

          <Card className="flex flex-col">
            <CardHeader>
              <CardTitle>Upcoming Holidays</CardTitle>
              <CardDescription>A list of holidays yet to come.</CardDescription>
            </CardHeader>
            <CardContent className="flex-grow p-2 pt-0">
              <ScrollArea className="h-48">
                <div className="p-4 pt-0 space-y-2">
                  {isLoading ? (
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
                        <div className="flex items-center gap-2">
                            <Badge variant="outline" className={cn("capitalize border-dashed hidden sm:inline-flex", holiday.type === 'full_day' && 'border-destructive text-destructive', holiday.type !== 'full_day' && 'border-chart-3 text-chart-3')}>{getHolidayTypeText(holiday.type)}</Badge>
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-8 w-8 text-destructive hover:bg-destructive/10 hover:text-destructive"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    This action cannot be undone. This will permanently delete the "{holiday.name}" holiday on {format(holiday.date, 'MMMM do, yyyy')}.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                                  <AlertDialogAction onClick={() => handleDeleteHoliday(holiday.date)}>
                                    Confirm
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                        </div>
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
          <Card>
            <CardHeader>
              <CardTitle>Holiday Calendar</CardTitle>
              <CardDescription>An overview of all scheduled holidays for the year.</CardDescription>
            </CardHeader>
            <CardContent className="flex items-center justify-center">
              {isLoading || !month ? (
                <div className="flex h-full items-center justify-center text-sm text-muted-foreground py-10">
                  <p>Loading calendar...</p>
                </div>
              ) : (
                <Calendar
                  mode="multiple"
                  month={month}
                  onMonthChange={setMonth}
                  modifiers={{
                    holiday_full: holidays.filter(h => h.type === 'full_day').map(h => h.date),
                    holiday_half: holidays.filter(h => h.type === 'lunch_only' || h.type === 'dinner_only').map(h => h.date),
                  }}
                  modifiersClassNames={{
                    holiday_full: 'bg-destructive text-destructive-foreground',
                    holiday_half: 'bg-chart-3 text-primary-foreground',
                  }}
                  className="p-0"
                  classNames={{
                      months: 'w-full',
                      month: 'w-full space-y-4',
                  }}
                  showOutsideDays={false}
                />
              )}
            </CardContent>
             <CardFooter className="flex flex-col items-start gap-2 p-4 pt-2 border-t mt-4">
                <p className="font-semibold text-foreground text-base mb-1">Legend</p>
                <div className="flex flex-wrap gap-x-6 gap-y-2">
                    <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-destructive" /> Full Day Holiday</div>
                    <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-chart-3" /> Half Day Holiday</div>
                </div>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  );
}
