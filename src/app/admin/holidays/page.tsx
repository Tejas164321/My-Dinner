'use client';

import { useState } from 'react';
import { format, isFuture } from 'date-fns';
import { Calendar as CalendarIcon, Plus, Trash2 } from 'lucide-react';

import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { ScrollArea } from '@/components/ui/scroll-area';
import { holidays as initialHolidays, Holiday } from '@/lib/data';

export default function HolidaysPage() {
  const [holidays, setHolidays] = useState<Holiday[]>(initialHolidays.sort((a, b) => a.date.getTime() - b.date.getTime()));
  const [newHolidayName, setNewHolidayName] = useState('');
  const [newHolidayDate, setNewHolidayDate] = useState<Date | undefined>();
  const [month, setMonth] = useState(new Date());

  const upcomingHolidays = holidays.filter(h => isFuture(h.date) || format(h.date, 'yyyy-MM-dd') === format(new Date(), 'yyyy-MM-dd'));

  const handleAddHoliday = () => {
    if (newHolidayName && newHolidayDate) {
      const newHoliday: Holiday = { name: newHolidayName, date: newHolidayDate };
      const updatedHolidays = [...holidays, newHoliday].sort((a, b) => a.date.getTime() - b.date.getTime());
      setHolidays(updatedHolidays);
      setNewHolidayName('');
      setNewHolidayDate(undefined);
    }
  };

  const handleDeleteHoliday = (dateToDelete: Date) => {
    setHolidays(holidays.filter(h => h.date.getTime() !== dateToDelete.getTime()));
  };

  return (
    <div className="flex flex-col gap-8 animate-in fade-in-0 duration-500">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Holiday Management</h1>
        <p className="text-muted-foreground">Manage mess holidays and non-billing days.</p>
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <Card className="h-full">
            <CardHeader>
              <CardTitle>Holiday Calendar</CardTitle>
              <CardDescription>An overview of all scheduled holidays for the year.</CardDescription>
            </CardHeader>
            <CardContent className="flex items-center justify-center">
              <Calendar
                mode="multiple"
                selected={holidays.map(h => h.date)}
                month={month}
                onMonthChange={setMonth}
                modifiers={{
                  holiday: holidays.map(h => h.date),
                }}
                modifiersClassNames={{
                  holiday: 'bg-primary text-primary-foreground',
                }}
                className="p-0"
                classNames={{
                    months: 'w-full',
                    month: 'w-full space-y-4',
                }}
                showOutsideDays
              />
            </CardContent>
          </Card>
        </div>

        <div className="flex flex-col gap-8">
          <Card>
            <CardHeader>
              <CardTitle>Add New Holiday</CardTitle>
              <CardDescription>Add a new holiday to the calendar.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="holiday-name">Holiday Name</Label>
                <Input
                  id="holiday-name"
                  placeholder="e.g., Diwali"
                  value={newHolidayName}
                  onChange={(e) => setNewHolidayName(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>Date</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant={'outline'}
                      className={cn(
                        'w-full justify-start text-left font-normal',
                        !newHolidayDate && 'text-muted-foreground'
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {newHolidayDate ? format(newHolidayDate, 'PPP') : <span>Pick a date</span>}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={newHolidayDate}
                      onSelect={setNewHolidayDate}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
              <Button onClick={handleAddHoliday} className="w-full">
                <Plus className="mr-2 h-4 w-4" /> Add Holiday
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
                  {upcomingHolidays.length > 0 ? (
                    upcomingHolidays.map((holiday) => (
                      <div
                        key={holiday.date.toISOString()}
                        className="flex items-center justify-between rounded-lg p-2.5 bg-secondary/50"
                      >
                        <div>
                          <p className="font-semibold text-sm">{holiday.name}</p>
                          <p className="text-xs text-muted-foreground">{format(holiday.date, 'MMMM do, yyyy')}</p>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-destructive hover:bg-destructive/10 hover:text-destructive"
                          onClick={() => handleDeleteHoliday(holiday.date)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
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
