
'use client';

import { useState, useEffect, useMemo } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Utensils, Calendar, Sun, Moon, Wallet, Percent, CalendarCheck, UserX, CalendarDays, Trash2 } from 'lucide-react';
import { Leave, Holiday } from "@/lib/data";
import { onHolidaysUpdate } from "@/lib/listeners/holidays";
import { onLeavesUpdate } from '@/lib/listeners/leaves';
import { deleteLeave } from '@/lib/actions/leaves';
import { useAuth } from '@/contexts/auth-context';
import { format, startOfDay, getDaysInMonth, isSameMonth, isSameDay, getYear, getMonth } from 'date-fns';
import Link from 'next/link';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar as CalendarPicker } from '@/components/ui/calendar';
import { cn } from '@/lib/utils';
import { ScrollArea } from '@/components/ui/scroll-area';
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
import { getMenuForDate } from '@/lib/actions/menu';
import type { DailyMenu } from '@/lib/actions/menu';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';

const formatDateKey = (date: Date): string => format(date, 'yyyy-MM-dd');

export default function StudentDashboard() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [selectedDate, setSelectedDate] = useState<Date | undefined>();
  const [leaves, setLeaves] = useState<Leave[]>([]);
  const [holidays, setHolidays] = useState<Holiday[]>([]);
  const [today, setToday] = useState<Date | undefined>();
  
  const [displayedMenu, setDisplayedMenu] = useState<DailyMenu>({ lunch: [], dinner: [] });
  const [isMenuLoading, setIsMenuLoading] = useState(false);
  
  const [leavesLoading, setLeavesLoading] = useState(true);
  const [holidaysLoading, setHolidaysLoading] = useState(true);
  const isDataLoading = leavesLoading || holidaysLoading;


  useEffect(() => {
    const now = startOfDay(new Date());
    setSelectedDate(now);
    setToday(now);

    setLeavesLoading(true);
    setHolidaysLoading(true);

    let leavesUnsubscribe: (() => void) | null = null;
    if (user) {
        leavesUnsubscribe = onLeavesUpdate(user.uid, (updatedLeaves) => {
          setLeaves(updatedLeaves);
          setLeavesLoading(false);
        });
    } else {
        setLeavesLoading(false);
    }
    
    const holidaysUnsubscribe = onHolidaysUpdate((updatedHolidays) => {
        setHolidays(updatedHolidays);
        setHolidaysLoading(false);
    });
    
    return () => {
        if(leavesUnsubscribe) leavesUnsubscribe();
        holidaysUnsubscribe();
    };
  }, [user]);

  useEffect(() => {
      if (!selectedDate) return;

      const fetchMenu = async () => {
          setIsMenuLoading(true);
          const dateKey = formatDateKey(selectedDate);
          const menu = await getMenuForDate(dateKey);
          setDisplayedMenu({
              lunch: menu?.lunch || ['Not set'],
              dinner: menu?.dinner || ['Not set'],
          });
          setIsMenuLoading(false);
      };

      fetchMenu();
  }, [selectedDate]);


  const currentMonthStats = useMemo(() => {
    if (!today || !user || isDataLoading) {
      return { attendance: '0%', totalMeals: 0, presentDays: 0, absentDays: 0, fullDays: 0, halfDays: 0 };
    }
    
    const year = getYear(today);
    const monthIndex = getMonth(today);
    
    const studentLeaves = leaves.filter(l => isSameMonth(l.date, today));
    const monthHolidays = holidays.filter(h => isSameMonth(h.date, today));

    let presentDays = 0;
    let absentDays = 0;
    let totalMeals = 0;
    let fullDays = 0;
    let halfDays = 0;
    let totalCountedDays = 0;

    const daysSoFar = Array.from({ length: today.getDate() }, (_, i) => new Date(year, monthIndex, i + 1));
    
    daysSoFar.forEach(day => {
        const isHoliday = monthHolidays.some(h => isSameDay(h.date, day));
        if (isHoliday) return;

        totalCountedDays++;
        const leave = studentLeaves.find(l => isSameDay(l.date, day));
        
        if (leave) {
            absentDays++;
            if (user.messPlan === 'full_day') {
                if (leave.type === 'lunch_only') { halfDays++; totalMeals++; }
                if (leave.type === 'dinner_only') { halfDays++; totalMeals++; }
            }
        } else {
            presentDays++;
            if (user.messPlan === 'full_day') { fullDays++; totalMeals += 2; }
            else { halfDays++; totalMeals++; }
        }
    });

    const attendance = totalCountedDays > 0 ? ((presentDays / totalCountedDays) * 100).toFixed(0) + '%' : 'N/A';

    return {
        attendance, totalMeals, presentDays, absentDays, fullDays, halfDays
    };
  }, [today, user, leaves, holidays, isDataLoading]);

  const { onLeave } = useMemo(() => {
    if (!selectedDate) return { onLeave: null };
    const todaysLeave = leaves.find(l => isSameDay(l.date, selectedDate));
    return { onLeave: todaysLeave };
  }, [selectedDate, leaves]);
  
  const menuTitle = useMemo(() => {
      if (!selectedDate || !today) return "Today's Menu";
      const isToday = format(selectedDate, 'yyyy-MM-dd') === format(today, 'yyyy-MM-dd');
      return isToday ? "Today's Menu" : `Menu for ${format(selectedDate, 'MMM do')}`;
  }, [selectedDate, today]);

  const dueAmount = 1120; // Mocked for now, will be dynamic on bills page
  const isPaid = dueAmount <= 0;

  const isLunchOff = onLeave?.type === 'full_day' || onLeave?.type === 'lunch_only';
  const isDinnerOff = onLeave?.type === 'full_day' || onLeave?.type === 'dinner_only';
  
  const upcomingHolidays = useMemo(() => {
    if (!today) return [];
    return holidays
      .filter(h => h.date >= today)
      .sort((a, b) => a.date.getTime() - b.date.getTime());
  }, [today, holidays]);

  const upcomingLeaves = useMemo(() => {
    if (!today) return [];
    return leaves
      .filter(l => l.date >= today)
      .sort((a, b) => a.date.getTime() - b.date.getTime());
  }, [leaves, today]);

  const handleDeleteLeave = async (leaveId: string) => {
    try {
      await deleteLeave(leaveId);
      toast({ title: 'Leave Cancelled' });
    } catch (error) {
      toast({ variant: 'destructive', title: 'Error', description: 'Failed to cancel leave.' });
    }
  };

  const renderMenuContent = (items: string[]) => {
    if (isMenuLoading) {
      return <Skeleton className="h-5 w-4/5" />;
    }
    return <p className="text-muted-foreground">{items.join(', ')}</p>;
  };

  return (
    <div className="flex flex-col gap-8 animate-in fade-in-0 slide-in-from-top-5 duration-700">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Welcome back, {user?.name?.split(' ')[0]}!</h1>
      </div>
      
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          <Card className="animate-in fade-in-0 zoom-in-95 duration-500">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">This Month's Attendance</CardTitle>
                  <Percent className="h-5 w-5 text-primary" />
              </CardHeader>
              <CardContent>
                  <div className="text-2xl font-bold">{currentMonthStats.attendance}</div>
                  <p className="text-xs text-muted-foreground">Based on attended days</p>
              </CardContent>
          </Card>
          <Card className="animate-in fade-in-0 zoom-in-95 duration-500 delay-100">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Meals Taken</CardTitle>
                  <Utensils className="h-5 w-5 text-primary" />
              </CardHeader>
              <CardContent>
                  <div className="text-2xl font-bold">{currentMonthStats.totalMeals}</div>
                  <p className="text-xs text-muted-foreground">Meals attended this month</p>
              </CardContent>
          </Card>
          <Card className="animate-in fade-in-0 zoom-in-95 duration-500 delay-200">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Present</CardTitle>
                  <CalendarCheck className="h-5 w-5 text-green-400" />
              </CardHeader>
              <CardContent>
                  <div className="text-2xl font-bold">{currentMonthStats.presentDays} Days</div>
                   {user?.messPlan === 'full_day' ? (
                     <p className="text-xs text-muted-foreground">{currentMonthStats.fullDays} full & {currentMonthStats.halfDays} half days</p>
                  ) : (
                      <p className="text-xs text-muted-foreground">Days attended this month</p>
                  )}
              </CardContent>
          </Card>
          <Card className="animate-in fade-in-0 zoom-in-95 duration-500 delay-300">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Absent</CardTitle>
                  <UserX className="h-5 w-5 text-destructive" />
              </CardHeader>
              <CardContent>
                  <div className="text-2xl font-bold">{currentMonthStats.absentDays} Days</div>
                  <p className="text-xs text-muted-foreground">Days on leave or absent</p>
              </CardContent>
          </Card>
      </div>


      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column */}
        <div className="lg:col-span-2 flex flex-col gap-6">
          
          {/* Today's Menu */}
          <Card className="animate-in fade-in-0 zoom-in-95 duration-500">
            <CardHeader>
               <div className="flex flex-wrap items-center justify-between gap-2">
                 <div className="flex items-center gap-2">
                    <Utensils className="h-5 w-5 text-primary" />
                    <CardTitle>{menuTitle}</CardTitle>
                 </div>
                 <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant={"outline"}
                        className={cn("w-[240px] justify-start text-left font-normal", !selectedDate && "text-muted-foreground")}
                      >
                        <Calendar className="mr-2 h-4 w-4" />
                        {selectedDate ? format(selectedDate, "PPP") : <span>Pick a date</span>}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <CalendarPicker
                        mode="single"
                        selected={selectedDate}
                        onSelect={setSelectedDate}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
              </div>
              <CardDescription>Select a date to view the menu for that day.</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-6 md:grid-cols-2">
              <div className="relative flex items-center gap-4 rounded-lg border bg-secondary/30 p-4">
                  {isLunchOff && <Badge variant="destructive" className="absolute top-3 right-3">ON LEAVE</Badge>}
                  <div className="bg-secondary/50 p-3 rounded-lg">
                      <Sun className="h-6 w-6 text-yellow-400"/>
                  </div>
                  <div>
                      <h3 className="font-semibold text-lg">Lunch</h3>
                      {renderMenuContent(displayedMenu.lunch)}
                  </div>
              </div>
              <div className="relative flex items-center gap-4 rounded-lg border bg-secondary/30 p-4">
                  {isDinnerOff && <Badge variant="destructive" className="absolute top-3 right-3">ON LEAVE</Badge>}
                  <div className="bg-secondary/50 p-3 rounded-lg">
                      <Moon className="h-6 w-6 text-purple-400"/>
                  </div>
                  <div>
                      <h3 className="font-semibold text-lg">Dinner</h3>
                      {renderMenuContent(displayedMenu.dinner)}
                  </div>
              </div>
            </CardContent>
          </Card>

          {/* Upcoming Leaves */}
          <Card className="animate-in fade-in-0 zoom-in-95 duration-500 delay-400 flex flex-col">
              <CardHeader>
                  <div className="flex items-center justify-between">
                      <CardTitle>My Upcoming Leaves</CardTitle>
                      <UserX className="h-5 w-5 text-primary" />
                  </div>
                  <CardDescription>Your next scheduled meal skips. You can cancel a leave from here.</CardDescription>
              </CardHeader>
              <CardContent className="flex-grow p-2 pt-0">
                  <ScrollArea className="h-48">
                    <div className="p-4 pt-0 space-y-2">
                        {leavesLoading ? (
                            <div className="flex h-full items-center justify-center text-sm text-muted-foreground text-center py-4"><p>Loading leaves...</p></div>
                        ) : upcomingLeaves.length > 0 ? (
                            upcomingLeaves.map((leave) => (
                                <div key={leave.id} className="flex items-center justify-between rounded-lg p-2.5 bg-secondary/50">
                                    <div className="flex items-center gap-3">
                                        {leave.type === 'full_day' && <Utensils className="h-5 w-5 text-destructive flex-shrink-0" />}
                                        {leave.type === 'lunch_only' && <Sun className="h-5 w-5 text-chart-3 flex-shrink-0" />}
                                        {leave.type === 'dinner_only' && <Moon className="h-5 w-5 text-chart-3 flex-shrink-0" />}
                                        <div>
                                            <p className="font-semibold text-sm capitalize">{leave.type.replace('_', ' ')}</p>
                                            <p className="text-xs text-muted-foreground">
                                                {format(leave.date, 'EEEE, MMM do')}
                                            </p>
                                        </div>
                                    </div>
                                    <AlertDialog>
                                        <AlertDialogTrigger asChild>
                                            <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:bg-destructive/10 hover:text-destructive">
                                              <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </AlertDialogTrigger>
                                        <AlertDialogContent>
                                            <AlertDialogHeader>
                                                <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                                                <AlertDialogDescription>
                                                    This action cannot be undone. This will cancel your leave for {format(leave.date, 'MMMM do, yyyy')}.
                                                </AlertDialogDescription>
                                            </AlertDialogHeader>
                                            <AlertDialogFooter>
                                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                <AlertDialogAction onClick={() => handleDeleteLeave(leave.id)}>
                                                    Confirm
                                                </AlertDialogAction>
                                            </AlertDialogFooter>
                                        </AlertDialogContent>
                                    </AlertDialog>
                                </div>
                            ))
                        ) : (
                            <div className="flex h-full items-center justify-center text-sm text-muted-foreground text-center py-4">
                                <p>You have no upcoming leaves scheduled.</p>
                            </div>
                        )}
                    </div>
                  </ScrollArea>
              </CardContent>
              <CardFooter>
                  <Button asChild className="w-full" variant="outline">
                      <Link href="/student/leave">
                          Apply for More Leaves
                      </Link>
                  </Button>
              </CardFooter>
          </Card>
        </div>

        {/* Right Column */}
        <div className="lg:col-span-1 flex flex-col gap-6">
            
            {/* Billing */}
            <Card className="animate-in fade-in-0 zoom-in-95 duration-500 delay-200">
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <CardTitle>Bill for {format(selectedDate || new Date(), 'MMMM')}</CardTitle>
                        <Wallet className="h-5 w-5 text-primary" />
                    </div>
                </CardHeader>
                <CardContent className="flex flex-col gap-4">
                    <div className="flex justify-between items-center p-4 bg-secondary/50 rounded-lg">
                      <div>
                          <p className="text-muted-foreground text-sm">{isPaid ? 'Total Bill' : 'Amount Due'}</p>
                          <p className={cn("text-2xl font-bold", !isPaid && "text-destructive")}>
                            ₹{dueAmount.toLocaleString()}
                          </p>
                      </div>
                       <Badge variant={isPaid ? 'secondary' : 'destructive'} className={cn(isPaid && "border-transparent bg-green-600 text-primary-foreground hover:bg-green-600/80")}>
                        {isPaid ? 'PAID' : 'DUE'}
                      </Badge>
                    </div>
                    <Button asChild className="w-full" variant={isPaid ? 'outline' : 'default'}>
                        <Link href="/student/bills">{isPaid ? 'View Details' : 'Pay Now'}</Link>
                    </Button>
                </CardContent>
            </Card>

            {/* Upcoming Holidays */}
            <Card className="animate-in fade-in-0 zoom-in-95 duration-500 delay-400 flex flex-col">
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <CardTitle>Upcoming Holidays</CardTitle>
                        <CalendarDays className="h-5 w-5 text-primary" />
                    </div>
                    <CardDescription>The mess will be closed on these days.</CardDescription>
                </CardHeader>
                <CardContent className="flex-grow p-2 pt-0">
                  <ScrollArea className="h-48">
                    <div className="p-4 pt-0 space-y-4">
                      {holidaysLoading ? (
                         <div className="flex h-full items-center justify-center text-sm text-muted-foreground text-center py-4"><p>Loading holidays...</p></div>
                      ) : upcomingHolidays.length > 0 ? (
                          <ul className="space-y-4">
                              {upcomingHolidays.map((holiday) => (
                                  <li key={holiday.date.toISOString()} className="flex items-start gap-3">
                                      {holiday.type === 'full_day' && <Utensils className="h-5 w-5 mt-1 text-destructive flex-shrink-0" />}
                                      {holiday.type === 'lunch_only' && <Sun className="h-5 w-5 mt-1 text-chart-3 flex-shrink-0" />}
                                      {holiday.type === 'dinner_only' && <Moon className="h-5 w-5 mt-1 text-chart-3 flex-shrink-0" />}
                                      <div>
                                          <p className="font-semibold text-sm">{holiday.name}</p>
                                          <p className="text-xs text-muted-foreground">
                                              {format(holiday.date, 'EEEE, MMM do')}
                                          </p>
                                      </div>
                                  </li>
                              ))}
                          </ul>
                      ) : (
                          <div className="flex h-full items-center justify-center text-sm text-muted-foreground text-center py-4">
                            <p>No upcoming holidays scheduled.</p>
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
