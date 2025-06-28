
'use client';

import { useState, useEffect, useMemo } from 'react';
import { format, isFuture, addDays, eachDayOfInterval } from 'date-fns';
import { Calendar as CalendarIcon, Plus, Trash2, Utensils, Sun, Moon } from 'lucide-react';

import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { ScrollArea } from '@/components/ui/scroll-area';
import { holidays as initialHolidays, Holiday } from '@/lib/data';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Badge } from '@/components/ui/badge';

type HolidayType = 'full_day' | 'lunch_only' | 'dinner_only';
type LeaveType = 'one_day' | 'long_leave';

export default function HolidaysPage() {
  const [holidays, setHolidays] = useState<Holiday[]>(initialHolidays.sort((a, b) => a.date.getTime() - b.date.getTime()));
  
  // Form State
  const [leaveType, setLeaveType] = useState<LeaveType>('one_day');
  const [newHolidayName, setNewHolidayName] = useState('');
  const [oneDayDate, setOneDayDate] = useState<Date | undefined>();
  const [oneDayType, setOneDayType] = useState<HolidayType>('full_day');
  const [longLeaveFrom, setLongLeaveFrom] = useState<Date | undefined>();
  const [longLeaveTo, setLongLeaveTo] = useState<Date | undefined>();
  
  // Calendar View State
  const [month, setMonth] = useState<Date | undefined>();
  const [today, setToday] = useState<Date | undefined>();

  useEffect(() => {
    const now = new Date();
    setMonth(now);
    setToday(now);
    setOneDayDate(now);
  }, []);

  const upcomingHolidays = useMemo(() => {
    if (!today) return [];
    return holidays.filter(h => isFuture(h.date) || format(h.date, 'yyyy-MM-dd') === format(today, 'yyyy-MM-dd'));
  }, [holidays, today]);

  const handleAddHoliday = () => {
    if (!newHolidayName) return;

    let newHolidays: Holiday[] = [];

    if (leaveType === 'one_day' && oneDayDate) {
      newHolidays.push({ name: newHolidayName, date: oneDayDate, type: oneDayType });
    } else if (leaveType === 'long_leave' && longLeaveFrom && longLeaveTo) {
      const dates = eachDayOfInterval({ start: longLeaveFrom, end: longLeaveTo });
      newHolidays = dates.map(date => ({ name: newHolidayName, date, type: 'full_day' }));
    } else {
      return;
    }

    // Prevent adding duplicate holidays for the same date
    const existingDates = new Set(holidays.map(h => h.date.getTime()));
    const uniqueNewHolidays = newHolidays.filter(h => !existingDates.has(h.date.getTime()));

    const updatedHolidays = [...holidays, ...uniqueNewHolidays].sort((a, b) => a.date.getTime() - b.date.getTime());
    setHolidays(updatedHolidays);
    
    // Reset form
    setNewHolidayName('');
    setOneDayDate(new Date());
    setOneDayType('full_day');
    setLongLeaveFrom(undefined);
    setLongLeaveTo(undefined);
  };

  const handleDeleteHoliday = (dateToDelete: Date) => {
    setHolidays(holidays.filter(h => h.date.getTime() !== dateToDelete.getTime()));
  };
  
  const getHolidayTypeText = (type: Holiday['type']) => {
    return type.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  return (
    <div className="flex flex-col gap-8 animate-in fade-in-0 duration-500">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Holiday Management</h1>
        <p className="text-muted-foreground">Manage mess holidays and non-billing days.</p>
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-5">
        <div className="lg:col-span-3">
          <Card className="h-full flex flex-col">
            <CardHeader>
              <CardTitle>Holiday Calendar</CardTitle>
              <CardDescription>An overview of all scheduled holidays for the year.</CardDescription>
            </CardHeader>
            <CardContent className="flex-grow flex items-center justify-center">
              {month ? (
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
              ) : (
                <div className="flex h-full items-center justify-center text-sm text-muted-foreground py-10">
                  <p>Loading calendar...</p>
                </div>
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

        <div className="lg:col-span-2 flex flex-col gap-8">
          <Card>
            <CardHeader>
              <CardTitle>Add New Holiday</CardTitle>
              <CardDescription>Schedule holidays for the mess.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label>Leave Type</Label>
                  <RadioGroup value={leaveType} onValueChange={(value) => setLeaveType(value as LeaveType)} className="flex gap-4">
                      <div className="flex items-center space-x-2"><RadioGroupItem value="one_day" id="r_one_day" /><Label htmlFor="r_one_day" className="cursor-pointer">One Day</Label></div>
                      <div className="flex items-center space-x-2"><RadioGroupItem value="long_leave" id="r_long_leave" /><Label htmlFor="r_long_leave" className="cursor-pointer">Long Leave</Label></div>
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
                        <Label>Holiday Type</Label>
                        <RadioGroup value={oneDayType} onValueChange={(value: HolidayType) => setOneDayType(value)} className="flex gap-2 sm:gap-4 flex-wrap">
                          <div className="flex items-center space-x-2"><RadioGroupItem value="full_day" id="full_day" /><Label htmlFor="full_day" className="cursor-pointer">Full Day</Label></div>
                          <div className="flex items-center space-x-2"><RadioGroupItem value="lunch_only" id="lunch_only" /><Label htmlFor="lunch_only" className="cursor-pointer">Lunch Off</Label></div>
                          <div className="flex items-center space-x-2"><RadioGroupItem value="dinner_only" id="dinner_only" /><Label htmlFor="dinner_only" className="cursor-pointer">Dinner Off</Label></div>
                        </RadioGroup>
                    </div>
                  </div>
                )}
                
                {leaveType === 'long_leave' && (
                  <div className="space-y-2 animate-in fade-in-0 duration-300">
                    <Label>Date Range (all considered full day holidays)</Label>
                    <div className="grid grid-cols-2 gap-2">
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button variant={'outline'} className={cn('w-full justify-start text-left font-normal', !longLeaveFrom && 'text-muted-foreground')}>
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {longLeaveFrom ? format(longLeaveFrom, 'PPP') : <span>From</span>}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0">
                          <Calendar 
                            mode="single" 
                            selected={longLeaveFrom} 
                            onSelect={(date) => {
                              setLongLeaveFrom(date);
                              if (date && longLeaveTo && date > longLeaveTo) {
                                setLongLeaveTo(undefined);
                              }
                            }}
                            disabled={{ after: longLeaveTo }}
                            initialFocus 
                            showOutsideDays={false}
                          />
                        </PopoverContent>
                      </Popover>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button variant={'outline'} className={cn('w-full justify-start text-left font-normal', !longLeaveTo && 'text-muted-foreground')}>
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {longLeaveTo ? format(longLeaveTo, 'PPP') : <span>To</span>}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0">
                          <Calendar 
                            mode="single" 
                            selected={longLeaveTo} 
                            onSelect={setLongLeaveTo} 
                            disabled={{ before: longLeaveFrom }}
                            initialFocus 
                            showOutsideDays={false}
                          />
                        </PopoverContent>
                      </Popover>
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
                        <div className="flex items-center gap-2">
                            <Badge variant="outline" className={cn("capitalize border-dashed hidden sm:inline-flex", holiday.type === 'full_day' && 'border-destructive text-destructive', holiday.type !== 'full_day' && 'border-chart-3 text-chart-3')}>{getHolidayTypeText(holiday.type)}</Badge>
                            <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-destructive hover:bg-destructive/10 hover:text-destructive"
                            onClick={() => handleDeleteHoliday(holiday.date)}
                            >
                            <Trash2 className="h-4 w-4" />
                            </Button>
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
      </div>
    </div>
  );
}
