

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
import { Utensils, Calendar, Sun, Moon, Wallet, Percent, CalendarCheck, UserX, CalendarDays, Hourglass } from 'lucide-react';
import { Leave, Holiday, AppUser } from "@/lib/data";
import { onHolidaysUpdate } from "@/lib/listeners/holidays";
import { onLeavesUpdate } from '@/lib/listeners/leaves';
import { useAuth } from '@/contexts/auth-context';
import { format, startOfDay, isSameDay, getYear, getMonth, formatDistanceToNowStrict, parseISO, isSameMonth } from 'date-fns';
import Link from 'next/link';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar as CalendarPicker } from '@/components/ui/calendar';
import { cn } from '@/lib/utils';
import { getMenuForDateAction, type DailyMenu } from '@/lib/actions/student-dashboard';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { getMessInfo } from '@/lib/services/mess';
import { UpcomingEventsCard } from '@/components/student/upcoming-events-card';

const formatDateKey = (date: Date): string => format(date, 'yyyy-MM-dd');

function ActivationCountdown({ activationDate, startMeal }: { activationDate: Date; startMeal: string }) {
    const [countdown, setCountdown] = useState('');

    useEffect(() => {
        const interval = setInterval(() => {
            const now = new Date();
            if (now > activationDate) {
                setCountdown('Your plan is now active!');
                clearInterval(interval);
                window.location.reload();
            } else {
                setCountdown(formatDistanceToNowStrict(activationDate, { addSuffix: true }));
            }
        }, 1000);

        return () => clearInterval(interval);
    }, [activationDate]);

    return (
        <Alert>
            <Hourglass className="h-4 w-4" />
            <AlertTitle>Plan Activation Pending</AlertTitle>
            <AlertDescription>
                Your plan will start from {startMeal} on {format(activationDate, 'PPP')}.
                <span className="font-bold ml-2">{countdown}</span>
            </AlertDescription>
        </Alert>
    );
}

export default function StudentDashboardPage() {
  const { user } = useAuth();
  const [selectedDate, setSelectedDate] = useState<Date | undefined>();
  const [leaves, setLeaves] = useState<Leave[]>([]);
  const [holidays, setHolidays] = useState<Holiday[]>([]);
  const [today, setToday] = useState<Date>(startOfDay(new Date()));
  
  const [displayedMenu, setDisplayedMenu] = useState<Omit<DailyMenu, 'messId'>>({ lunch: [], dinner: [] });
  const [isMenuLoading, setIsMenuLoading] = useState(false);
  
  const [leavesLoading, setLeavesLoading] = useState(true);
  const [holidaysLoading, setHolidaysLoading] = useState(true);
  const [perMealCharge, setPerMealCharge] = useState(65);
  const [messInfoLoading, setMessInfoLoading] = useState(true);
  
  const isDataLoading = leavesLoading || holidaysLoading || messInfoLoading;
  
  const planActivationInfo = useMemo(() => {
    if (!user?.planStartDate || !user?.planStartMeal) return null;
    
    const dateValue = user.planStartDate;
    let activationDate: Date;

    if (typeof dateValue === 'string') {
        activationDate = parseISO(dateValue);
    } else if (dateValue && typeof (dateValue as any).toDate === 'function') {
        activationDate = (dateValue as any).toDate();
    } else {
        activationDate = new Date(dateValue as any);
    }

    return activationDate > new Date() ? { activationDate, startMeal: user.planStartMeal } : null;
  }, [user]);

  const planStartDate = useMemo(() => {
    if (!user?.planStartDate) return null;
    const dateValue = user.planStartDate;
     if (typeof dateValue === 'string') {
        return startOfDay(parseISO(dateValue));
    } else if (dateValue && typeof (dateValue as any).toDate === 'function') {
        return startOfDay((dateValue as any).toDate());
    }
    return startOfDay(new Date(dateValue as any));
  }, [user]);


  useEffect(() => {
    setSelectedDate(today);

    if (!user) {
        setLeavesLoading(false);
        setHolidaysLoading(false);
        setMessInfoLoading(false);
        return;
    };
    
    setLeavesLoading(true);
    setHolidaysLoading(true);
    setMessInfoLoading(true);

    if (user.messId) {
        getMessInfo(user.messId).then(info => {
            if(info?.perMealCharge) {
                setPerMealCharge(info.perMealCharge);
            }
            setMessInfoLoading(false);
        });
    } else {
        setMessInfoLoading(false);
    }
    
    const leavesUnsubscribe = onLeavesUpdate(user.uid, (updatedLeaves) => {
      setLeaves(updatedLeaves);
      setLeavesLoading(false);
    });
    
    const holidaysUnsubscribe = onHolidaysUpdate(user.messId, (updatedHolidays) => {
        setHolidays(updatedHolidays);
        setHolidaysLoading(false);
    });
    
    return () => {
        leavesUnsubscribe();
        holidaysUnsubscribe();
    };
  }, [user, today]);

  useEffect(() => {
      if (!selectedDate || !user?.messId) return;

      const fetchMenu = async () => {
          setIsMenuLoading(true);
          const dateKey = formatDateKey(selectedDate);
          const menu = await getMenuForDateAction(user.messId, dateKey);
          setDisplayedMenu({
              lunch: menu?.lunch || ['Not set'],
              dinner: menu?.dinner || ['Not set'],
          });
          setIsMenuLoading(false);
      };

      fetchMenu();
  }, [selectedDate, user?.messId]);


  const currentMonthStats = useMemo(() => {
    if (isDataLoading || !planStartDate) {
      return { attendance: '0%', totalMeals: 0, presentDays: 0, absentDays: 0, dueAmount: 0 };
    }
    
    const year = getYear(today);
    const monthIndex = getMonth(today);
    
    const studentLeaves = leaves.filter(l => isSameMonth(l.date, today));
    const monthHolidays = holidays.filter(h => isSameMonth(h.date, today));

    let presentDays = 0;
    let absentDays = 0;
    let totalMeals = 0;
    let totalCountedDays = 0;

    const daysSoFar = Array.from({ length: today.getDate() }, (_, i) => new Date(year, monthIndex, i + 1))
      .filter(d => d >= planStartDate);
    
    daysSoFar.forEach(day => {
        const isHoliday = monthHolidays.some(h => isSameDay(h.date, day));
        if (isHoliday) return;

        totalCountedDays++;
        const leave = studentLeaves.find(l => isSameDay(l.date, day));
        
        let lunchTaken = false;
        let dinnerTaken = false;

        if (user.messPlan === 'full_day' || user.messPlan === 'lunch_only') {
            if (!(isSameDay(day, planStartDate) && user.planStartMeal === 'dinner')) {
                if (!leave || (leave.type !== 'full_day' && leave.type !== 'lunch_only')) {
                    lunchTaken = true;
                }
            }
        }
        
        if (user.messPlan === 'full_day' || user.messPlan === 'dinner_only') {
            if (!leave || (leave.type !== 'full_day' && leave.type !== 'dinner_only')) {
                dinnerTaken = true;
            }
        }
        
        if (lunchTaken) totalMeals++;
        if (dinnerTaken) totalMeals++;

        if (lunchTaken || dinnerTaken) presentDays++;
        else absentDays++;
    });

    const attendance = totalCountedDays > 0 ? ((presentDays / totalCountedDays) * 100).toFixed(0) + '%' : 'N/A';

    return {
        attendance, totalMeals, presentDays, absentDays, dueAmount: totalMeals * perMealCharge,
    };
  }, [today, user, leaves, holidays, isDataLoading, planStartDate, perMealCharge]);

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

  const dueAmount = currentMonthStats.dueAmount;
  const isPaid = dueAmount <= 0;

  const isLunchOff = onLeave?.type === 'full_day' || onLeave?.type === 'lunch_only';
  const isDinnerOff = onLeave?.type === 'full_day' || onLeave?.type === 'dinner_only';

  const renderMenuContent = (items: string[]) => {
    if (isMenuLoading) {
      return <Skeleton className="h-5 w-4/5" />;
    }
    return <p className="text-muted-foreground">{items.join(', ')}</p>;
  };

  return (
    <div className="flex flex-col gap-8 animate-in fade-in-0 slide-in-from-top-5 duration-700">
        {planActivationInfo && (
            <ActivationCountdown activationDate={planActivationInfo.activationDate} startMeal={planActivationInfo.startMeal} />
        )}

      <div className="hidden md:block">
        <h1 className="text-2xl font-bold tracking-tight">Welcome back, {user?.name?.split(' ')[0]}!</h1>
      </div>
      
       <div className="grid grid-cols-2 gap-4 md:gap-6 lg:grid-cols-4">
          <Card className="animate-in fade-in-0 zoom-in-95 duration-500">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Attendance</CardTitle>
                  <Percent className="h-5 w-5 text-primary" />
              </CardHeader>
              <CardContent>
                  <div className="text-2xl font-bold">{currentMonthStats.attendance}</div>
                  <p className="text-xs text-muted-foreground truncate">This month</p>
              </CardContent>
          </Card>
          <Card className="animate-in fade-in-0 zoom-in-95 duration-500 delay-100">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Meals</CardTitle>
                  <Utensils className="h-5 w-5 text-primary" />
              </CardHeader>
              <CardContent>
                  <div className="text-2xl font-bold">{currentMonthStats.totalMeals}</div>
                  <p className="text-xs text-muted-foreground truncate">This month</p>
              </CardContent>
          </Card>
          <Card className="animate-in fade-in-0 zoom-in-95 duration-500 delay-200">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Present</CardTitle>
                <CalendarCheck className="h-5 w-5 text-green-400" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{currentMonthStats.presentDays}</div>
                <p className="text-xs text-muted-foreground truncate">Days</p>
              </CardContent>
          </Card>
          <Card className="animate-in fade-in-0 zoom-in-95 duration-500 delay-300">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Absent</CardTitle>
                  <UserX className="h-5 w-5 text-destructive" />
              </CardHeader>
              <CardContent>
                  <div className="text-2xl font-bold">{currentMonthStats.absentDays}</div>
                  <p className="text-xs text-muted-foreground truncate">Days</p>
              </CardContent>
          </Card>
      </div>


      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 flex flex-col gap-6">
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
                            className={cn("w-full sm:w-[240px] justify-start text-left font-normal", !selectedDate && "text-muted-foreground")}
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
                  <CardDescription className="pt-2">Select a date to view the menu for that day.</CardDescription>
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
            <UpcomingEventsCard leaves={leaves} holidays={holidays} isLoading={isDataLoading} />
        </div>

        <div className="lg:col-span-1 flex flex-col gap-6">
            <Card className="animate-in fade-in-0 zoom-in-95 duration-500 delay-200">
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <CardTitle>Bill for {format(today, 'MMMM')}</CardTitle>
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
        </div>
      </div>
    </div>
  );
}
