
'use client';

import { useState, useEffect, useMemo, type FC } from 'react';
import type { DayProps } from 'react-day-picker';
import { format, eachDayOfInterval, startOfDay, isSameMonth, isSameDay, isAfter, isFuture, isBefore, parse, getHours, getMinutes } from 'date-fns';
import { Calendar as CalendarIcon, Plus, Trash2, Utensils, Sun, Moon, Info, Loader2 } from 'lucide-react';
import { doc, getDoc, setDoc, deleteDoc, writeBatch, updateDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { onHolidaysUpdate } from '@/lib/listeners/holidays';
import type { Holiday } from '@/lib/data';
import { useAuth } from '@/contexts/auth-context';
import { getMessInfo } from '@/lib/services/mess';

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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Tooltip, TooltipProvider, TooltipTrigger, TooltipContent } from '@/components/ui/tooltip';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';


type HolidayType = 'full_day' | 'lunch_only' | 'dinner_only';
type LeaveType = 'one_day' | 'long_leave';

const HOLIDAYS_COLLECTION = 'holidays';

const statusColors = {
    Open: 'bg-green-500',
    Holiday: 'bg-orange-500',
    Future: 'bg-muted/50',
};

export default function HolidaysPage() {
  const { user: adminUser } = useAuth();
  const [holidays, setHolidays] = useState<Holiday[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();
  
  // Form State
  const [leaveType, setLeaveType] = useState<LeaveType>('one_day');
  const [newHolidayName, setNewHolidayName] = useState('');
  const [oneDayDate, setOneDayDate] = useState<Date | undefined>();
  const [oneDayType, setOneDayType] = useState<HolidayType>('full_day');
  const [longLeaveFromDate, setLongLeaveFromDate] = useState<Date | undefined>();
  const [longLeaveToDate, setLongLeaveToDate] = useState<Date | undefined>();
  const [longLeaveFromType, setLongLeaveFromType] = useState<HolidayType>('full_day');
  const [longLeaveToType, setLongLeaveToType] = useState<HolidayType>('lunch_only');
  
  // Calendar View State
  const [month, setMonth] = useState<Date | undefined>();
  const [today, setToday] = useState<Date>(startOfDay(new Date()));

  // Deadline state
  const [lunchDeadline, setLunchDeadline] = useState('10:00'); 
  const [dinnerDeadline, setDinnerDeadline] = useState('18:00');

  // For disabling options based on time
  const now = new Date();
  const isTodaySelected = oneDayDate ? isSameDay(oneDayDate, now) : false;
  const currentHour = getHours(now);
  const lunchDeadlineHour = getHours(parse(lunchDeadline, 'HH:mm', new Date()));
  const dinnerDeadlineHour = getHours(parse(dinnerDeadline, 'HH:mm', new Date()));
  const isLunchDisabled = isTodaySelected && currentHour >= lunchDeadlineHour;
  const isDinnerDisabled = isTodaySelected && currentHour >= dinnerDeadlineHour;


  useEffect(() => {
    setMonth(today);
    setOneDayDate(today);

    if (!adminUser) return;
    
    setIsLoading(true);
    
    const fetchSettings = async () => {
        const messInfo = await getMessInfo(adminUser.uid);
        if (messInfo?.lunchDeadline) setLunchDeadline(messInfo.lunchDeadline);
        if (messInfo?.dinnerDeadline) setDinnerDeadline(messInfo.dinnerDeadline);
    };

    fetchSettings();

    const unsubscribe = onHolidaysUpdate(adminUser.uid, (updatedHolidays) => {
        setHolidays(updatedHolidays);
        setIsLoading(false);
    });

    return () => unsubscribe();
  }, [adminUser, today]);

  // Effect to adjust one-day holiday type if deadline passes
    useEffect(() => {
       const isToday = oneDayDate ? isSameDay(oneDayDate, now) : false;
       const isLunchPast = isToday && getHours(now) >= lunchDeadlineHour;
       if (isLunchPast && oneDayType !== 'dinner_only') {
           setOneDayType('dinner_only');
       }
    }, [oneDayDate, lunchDeadlineHour, now, oneDayType]);
    
    // Effect to adjust long-leave 'From' type if deadline passes
    useEffect(() => {
        const isToday = longLeaveFromDate ? isSameDay(longLeaveFromDate, now) : false;
        const isLunchPast = isToday && getHours(now) >= lunchDeadlineHour;
        if (isLunchPast && longLeaveFromType !== 'dinner_only') {
            setLongLeaveFromType('dinner_only');
        }
    }, [longLeaveFromDate, lunchDeadlineHour, now, longLeaveFromType]);


  const upcomingHolidays = useMemo(() => {
      const upcoming = holidays
          .filter(h => h.date >= today)
          .sort((a,b) => a.date.getTime() - b.date.getTime());

      // Merge logic for display
      const mergedHolidays: Holiday[] = [];
      const dateMap = new Map<string, Holiday[]>();

      for (const holiday of upcoming) {
          const dateKey = format(holiday.date, 'yyyy-MM-dd');
          if (!dateMap.has(dateKey)) {
              dateMap.set(dateKey, []);
          }
          dateMap.get(dateKey)!.push(holiday);
      }

      for (const [dateKey, holidayGroup] of dateMap.entries()) {
          if (holidayGroup.length === 1) {
              mergedHolidays.push(holidayGroup[0]);
          } else {
              const hasLunch = holidayGroup.some(h => h.type === 'lunch_only');
              const hasDinner = holidayGroup.some(h => h.type === 'dinner_only');
              if (hasLunch && hasDinner) {
                  mergedHolidays.push({ ...holidayGroup[0], type: 'full_day' });
              } else {
                  mergedHolidays.push(...holidayGroup);
              }
          }
      }
      return mergedHolidays;
  }, [holidays, today]);
  
  const dayTypeMap = useMemo(() => {
    const map = new Map<string, Holiday>();
    holidays.forEach(h => {
        const dateKey = format(h.date, 'yyyy-MM-dd');
        map.set(dateKey, h);
    });
    return map;
  }, [holidays]);

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


  const handleAddHoliday = async () => {
    if (!adminUser) {
        toast({ variant: 'destructive', title: 'Authentication Error' });
        return;
    }
    if (!newHolidayName) {
        toast({ variant: 'destructive', title: 'Missing Information', description: 'Please provide a name or reason.' });
        return;
    }

    setIsSaving(true);
    let holidaysToSubmit: Omit<Holiday, 'date'> & { date: Date }[] = [];

    if (leaveType === 'one_day' && oneDayDate) {
        if (!isActionAllowedForDate(oneDayDate, oneDayType)) {
            let errorDesc = `You can no longer add a holiday for ${format(oneDayDate, 'PPP')}.`;
            if (isTodaySelected && isLunchDisabled) {
                errorDesc = "Lunch deadline has passed. You can only set a 'Dinner Off' holiday for today.";
            }
             if (isTodaySelected && isDinnerDisabled) {
                errorDesc = "All meal deadlines have passed for today.";
            }
            toast({ variant: "destructive", title: "Deadline Passed", description: errorDesc });
            setIsSaving(false);
            return;
        }
        holidaysToSubmit.push({ name: newHolidayName, date: oneDayDate, type: oneDayType, messId: adminUser.uid });
    } else if (leaveType === 'long_leave' && longLeaveFromDate && longLeaveToDate) {
        if (longLeaveToDate < longLeaveFromDate) {
            toast({ variant: "destructive", title: "Invalid Date Range" });
            setIsSaving(false);
            return;
        }
        if (!isActionAllowedForDate(longLeaveFromDate, longLeaveFromType)) {
             toast({ variant: "destructive", title: "Deadline Passed", description: `The start date ${format(longLeaveFromDate, 'PPP')} is in the past or its deadline has passed.` });
             setIsSaving(false);
             return;
        }
      
        const dates = eachDayOfInterval({ start: longLeaveFromDate, end: longLeaveToDate });
      
        if (dates.length === 1) {
            let type: HolidayType = 'full_day';
            if (longLeaveFromType === 'dinner_only' && longLeaveToType === 'lunch_only') type = 'full_day';
            else if (longLeaveFromType === 'dinner_only') type = 'dinner_only';
            else if (longLeaveToType === 'lunch_only') type = 'lunch_only';
            else if (longLeaveFromType === 'full_day') type = 'full_day';
            holidaysToSubmit.push({ name: newHolidayName, date: dates[0], type, messId: adminUser.uid });
        } else {
            holidaysToSubmit = dates.map((date, index) => {
                let type: HolidayType = 'full_day';
                if (index === 0) type = longLeaveFromType;
                if (index === dates.length - 1) type = longLeaveToType;
                return { name: newHolidayName, date: date, type, messId: adminUser.uid };
            });
        }
    } else {
        toast({ variant: "destructive", title: "Missing Information" });
        setIsSaving(false);
        return;
    }

    try {
        const batch = writeBatch(db);
        let setDocs = 0;

        for (const holiday of holidaysToSubmit) {
            const dateKey = `${holiday.messId}_${format(holiday.date, 'yyyy-MM-dd')}`;
            const docRef = doc(db, HOLIDAYS_COLLECTION, dateKey);
            const docSnap = await getDoc(docRef);

            if (docSnap.exists()) {
                 const existingData = docSnap.data() as Holiday;
                 if (existingData.type === 'full_day') {
                     continue; // Skip if full day holiday already exists
                 }
                 // If a partial exists and we want to make it a full day
                 if ((existingData.type === 'lunch_only' && holiday.type === 'dinner_only') || (existingData.type === 'dinner_only' && holiday.type === 'lunch_only') || holiday.type === 'full_day') {
                    batch.update(docRef, { type: 'full_day', name: holiday.name });
                    setDocs++;
                 }
            } else {
                 batch.set(docRef, holiday);
                 setDocs++;
            }
        }
        
        if (setDocs > 0) {
            await batch.commit();
             toast({ title: "Success", description: "Holiday(s) added successfully."});
        } else {
            toast({ title: "Already Set", description: "All selected dates already have full-day holidays." });
        }
        
        setNewHolidayName('');
        setOneDayDate(today);
        setOneDayType('full_day');
        setLongLeaveFromDate(undefined);
        setLongLeaveToDate(undefined);
    } catch (error) {
        toast({ variant: "destructive", title: "Error", description: (error as Error).message });
    } finally {
        setIsSaving(false);
    }
  };

  const handleDeleteHoliday = async (dateToDelete: Date) => {
    if (!adminUser) return;
    try {
      const dateKey = `${adminUser.uid}_${format(dateToDelete, 'yyyy-MM-dd')}`;
      const docRef = doc(db, HOLIDAYS_COLLECTION, dateKey);
      await deleteDoc(docRef);
      toast({ title: "Success", description: "Holiday deleted." });
    } catch (error) {
      toast({ variant: "destructive", title: "Error", description: "Failed to delete holiday." });
    }
  };
  
  const getHolidayTypeText = (type: Holiday['type']) => {
    return type.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase());
  };
  
  const CustomDay: FC<DayProps> = (props) => {
    const { date, displayMonth } = props;
    if (!isSameMonth(date, displayMonth)) {
        return <div />;
    }

    const dateKey = format(date, 'yyyy-MM-dd');
    const holiday = dayTypeMap.get(dateKey);
    const isToday = isSameDay(date, today);
    const isFutureDate = isAfter(date, today);

    let lunchColor, dinnerColor;
    let tooltipLunchStatus = 'Open', tooltipDinnerStatus = 'Open';

    const isLunchHoliday = holiday?.type === 'full_day' || holiday?.type === 'lunch_only';
    const isDinnerHoliday = holiday?.type === 'full_day' || holiday?.type === 'dinner_only';

    // Determine lunch status and color
    if (isLunchHoliday) {
        lunchColor = statusColors.Holiday;
        tooltipLunchStatus = 'Holiday';
    } else {
        lunchColor = isFutureDate ? statusColors.Future : statusColors.Open;
        tooltipLunchStatus = 'Open';
    }

    // Determine dinner status and color
    if (isDinnerHoliday) {
        dinnerColor = statusColors.Holiday;
        tooltipDinnerStatus = 'Holiday';
    } else {
        dinnerColor = isFutureDate ? statusColors.Future : statusColors.Open;
        tooltipDinnerStatus = 'Open';
    }
    
    return (
      <TooltipProvider delayDuration={100}>
        <Tooltip>
          <TooltipTrigger asChild>
            <div className={cn("relative w-full h-full flex flex-col items-center justify-center p-0 font-normal", isToday && "rounded-full ring-2 ring-primary ring-offset-1 ring-offset-background")}>
                <div className="absolute inset-0 flex flex-col overflow-hidden rounded-full">
                    <div className={cn("flex-1", lunchColor)}></div>
                    <div className={cn("flex-1", dinnerColor)}></div>
                </div>
                <span className={cn("relative z-10 font-semibold", isFutureDate && !holiday ? "text-muted-foreground" : "text-white")}>
                    {date.getDate()}
                </span>
            </div>
          </TooltipTrigger>
          <TooltipContent>
            <div className="space-y-1 text-center">
              <p className="font-bold">{format(date, "PPP")}</p>
              <p className="text-sm"><span className="font-semibold">Lunch:</span> {tooltipLunchStatus}</p>
              <p className="text-sm"><span className="font-semibold">Dinner:</span> {tooltipDinnerStatus}</p>
            </div>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  };


  return (
    <div className="flex flex-col gap-8 animate-in fade-in-0 slide-in-from-top-5 duration-700">
      <div className="hidden md:block">
        <h1 className="text-2xl font-bold tracking-tight">Holiday Management</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
        <div className="lg:col-span-3 flex flex-col gap-8">
            <Tabs defaultValue="add" className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="add">Add Holiday</TabsTrigger>
                    <TabsTrigger value="upcoming">
                        Upcoming
                        {upcomingHolidays.length > 0 && <Badge className="ml-2">{upcomingHolidays.length}</Badge>}
                    </TabsTrigger>
                </TabsList>
                <TabsContent value="add" className="mt-4">
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-xl sm:text-2xl">Add New Holiday</CardTitle>
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
                                    <PopoverContent className="w-auto p-0"><Calendar mode="single" selected={oneDayDate} onSelect={setOneDayDate} initialFocus disabled={(date) => isBefore(date, today)} showOutsideDays={false} /></PopoverContent>
                                    </Popover>
                                </div>
                                <div className="space-y-3">
                                    <Label>Holiday For</Label>
                                    <RadioGroup 
                                        value={isLunchDisabled ? 'dinner_only' : oneDayType}
                                        onValueChange={(value: HolidayType) => setOneDayType(value)} 
                                        className="grid grid-cols-3 gap-2 md:gap-4"
                                    >
                                        <Label className={cn("flex flex-col items-center justify-center text-center rounded-md border-2 border-muted bg-popover p-2 md:p-4 font-normal  transition-all", isLunchDisabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary')}>
                                            <RadioGroupItem value="full_day" id="full_day" className="sr-only" disabled={isLunchDisabled} />
                                            <Utensils className="mb-2 h-5 w-5 md:mb-3 md:h-6 md:w-6" />
                                            <span className="text-xs md:text-sm">Full Day</span>
                                        </Label>
                                         <Label className={cn("flex flex-col items-center justify-center text-center rounded-md border-2 border-muted bg-popover p-2 md:p-4 font-normal  transition-all", isLunchDisabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary')}>
                                            <RadioGroupItem value="lunch_only" id="lunch_only" className="sr-only" disabled={isLunchDisabled} />
                                            <Sun className="mb-2 h-5 w-5 md:mb-3 md:h-6 md:w-6" />
                                            <span className="text-xs md:text-sm">Lunch Off</span>
                                        </Label>
                                         <Label className={cn("flex flex-col items-center justify-center text-center rounded-md border-2 border-muted bg-popover p-2 md:p-4 font-normal transition-all", isDinnerDisabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary')}>
                                            <RadioGroupItem value="dinner_only" id="dinner_only" className="sr-only" disabled={isDinnerDisabled} />
                                            <Moon className="mb-2 h-5 w-5 md:mb-3 md:h-6 md:w-6" />
                                            <span className="text-xs md:text-sm">Dinner Off</span>
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
                                        value={
                                            longLeaveFromDate && isSameDay(longLeaveFromDate, now) && currentHour >= lunchDeadlineHour 
                                            ? 'dinner_only' 
                                            : longLeaveFromType
                                        } 
                                        onValueChange={(value: HolidayType) => setLongLeaveFromType(value)} 
                                        className="grid grid-cols-1 gap-4"
                                      >
                                           <Label htmlFor="from_full_day" className={cn("flex flex-col items-center justify-center text-center rounded-md border-2 border-muted bg-popover p-4 font-normal  transition-all", longLeaveFromDate && isSameDay(longLeaveFromDate, now) && currentHour >= lunchDeadlineHour ? 'cursor-not-allowed opacity-50' : 'cursor-pointer hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary')}>
                                                <RadioGroupItem value="full_day" id="from_full_day" className="sr-only" disabled={longLeaveFromDate && isSameDay(longLeaveFromDate, now) && currentHour >= lunchDeadlineHour} />
                                                <Utensils className="mb-3 h-6 w-6" />
                                                Full Day
                                            </Label>
                                            <Label htmlFor="from_dinner_only" className={cn("flex flex-col items-center justify-center text-center rounded-md border-2 border-muted bg-popover p-4 font-normal transition-all", longLeaveFromDate && isSameDay(longLeaveFromDate, now) && currentHour >= dinnerDeadlineHour ? 'cursor-not-allowed opacity-50' : 'cursor-pointer hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary')}>
                                                <RadioGroupItem value="dinner_only" id="from_dinner_only" className="sr-only" disabled={longLeaveFromDate && isSameDay(longLeaveFromDate, now) && currentHour >= dinnerDeadlineHour} />
                                                <Moon className="mb-3 h-6 w-6" />
                                                Dinner Off
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
                                            </Label>
                                            <Label htmlFor="to_lunch_only" className="flex flex-col items-center justify-center text-center rounded-md border-2 border-muted bg-popover p-4 font-normal hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary cursor-pointer transition-all">
                                                <RadioGroupItem value="lunch_only" id="to_lunch_only" className="sr-only" />
                                                <Sun className="mb-3 h-6 w-6" />
                                                Lunch Off
                                            </Label>
                                      </RadioGroup>
                                  </div>
                                </div>
                              </div>
                            )}

                          <Button onClick={handleAddHoliday} className="w-full !mt-8" disabled={isSaving}>
                            {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : <Plus className="mr-2 h-4 w-4" />}
                             {isSaving ? 'Adding...' : 'Add Holiday(s)'}
                          </Button>
                        </CardContent>
                    </Card>
                </TabsContent>
                <TabsContent value="upcoming">
                    <Card className="flex flex-col">
                        <CardHeader>
                            <CardTitle>Upcoming Holidays</CardTitle>
                        </CardHeader>
                        <CardContent className="flex-grow p-2 pt-0">
                          <ScrollArea className="h-[550px]">
                            <div className="p-4 pt-0 space-y-2">
                              {isLoading ? (
                                <div className="flex h-full items-center justify-center text-sm text-muted-foreground py-10">
                                  <Loader2 className="h-5 w-5 animate-spin" />
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
                                    <div className="flex items-center gap-2">
                                        <Badge variant="outline" className={cn("capitalize border-dashed border-orange-500 text-orange-500 hidden sm:inline-flex")}>{getHolidayTypeText(holiday.type)}</Badge>
                                        <AlertDialog>
                                          <AlertDialogTrigger asChild>
                                            <Button
                                              variant="ghost"
                                              size="icon"
                                              className="h-8 w-8 text-destructive hover:bg-destructive/10 hover:text-destructive"
                                              disabled={!isActionAllowedForDate(holiday.date, holiday.type)}
                                            >
                                              <Trash2 className="h-4 w-4" />
                                            </Button>
                                          </AlertDialogTrigger>
                                          <AlertDialogContent>
                                            <AlertDialogHeader>
                                              <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                                              <AlertDialogDescription>
                                                This will permanently delete the "{holiday.name}" holiday on {format(holiday.date, 'MMMM do, yyyy')}.
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
                </TabsContent>
            </Tabs>
        </div>

        <div className="lg:col-span-2 flex flex-col">
          <Card>
            <CardHeader>
              <CardTitle>Holiday Calendar</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col items-center justify-center">
              {isLoading || !month ? (
                <div className="flex h-full items-center justify-center text-sm text-muted-foreground py-10">
                  <Loader2 className="h-5 w-5 animate-spin" />
                </div>
              ) : (
                <Calendar
                  month={month}
                  onMonthChange={setMonth}
                  components={{ Day: CustomDay }}
                  className="p-0"
                  classNames={{
                      months: 'w-full',
                      month: 'w-full space-y-4',
                  }}
                  disabled={(date) => isBefore(date, today)}
                  showOutsideDays={false}
                />
              )}
            </CardContent>
             <CardFooter className="flex flex-col items-start gap-2 p-4 pt-2 border-t mt-4">
                <p className="font-semibold text-foreground text-base mb-1">Legend</p>
                <div className="flex flex-wrap gap-x-6 gap-y-2">
                    <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-green-500" /> Open</div>
                    <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-orange-500" /> Holiday</div>
                    <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-muted/50" /> Future</div>
                </div>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  );
}
