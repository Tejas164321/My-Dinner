
'use client';

import { useState, useEffect, useMemo } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Users, UserX, TrendingUp, FileText, Settings, Bell, Utensils, CalendarDays, Moon, Sun, UserPlus, GitCompareArrows, Check, X } from 'lucide-react';
import { MenuSchedule } from '@/components/admin/menu-schedule';
import Link from "next/link";
import { joinRequests, planChangeRequests, Holiday, Leave } from '@/lib/data';
import { onHolidaysUpdate } from '@/lib/listeners/holidays';
import { onAllLeavesUpdate } from '@/lib/listeners/leaves';
import { isSameMonth, isToday, startOfDay, format } from 'date-fns';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';

export default function AdminDashboard() {
  const [mealInfo, setMealInfo] = useState({ title: "Today's Lunch Count", count: 112 });
  const [today, setToday] = useState<Date>();
  const [holidays, setHolidays] = useState<Holiday[]>([]);
  const [allLeaves, setAllLeaves] = useState<Leave[]>([]);

  useEffect(() => {
    const now = startOfDay(new Date());
    setToday(now);

    const currentHour = new Date().getHours();
    if (currentHour >= 15) {
      setMealInfo({ title: "Today's Dinner Count", count: 105 });
    }

    const holidaysUnsubscribe = onHolidaysUpdate(setHolidays);
    const leavesUnsubscribe = onAllLeavesUpdate(setAllLeaves);

    return () => {
        holidaysUnsubscribe();
        leavesUnsubscribe();
    };
  }, []);

  const { holidaysThisMonth, mealBreaksThisMonth } = useMemo(() => {
    if (!today) return { holidaysThisMonth: 0, mealBreaksThisMonth: 0 };
    
    const currentMonthHolidays = holidays.filter(h => isSameMonth(h.date, today));
    
    const totalHolidays = currentMonthHolidays.length;
    
    const totalMealBreaks = currentMonthHolidays.reduce((acc, holiday) => {
        if (holiday.type === 'full_day') {
            return acc + 2;
        }
        return acc + 1;
    }, 0);

    return { holidaysThisMonth: totalHolidays, mealBreaksThisMonth: totalMealBreaks };
  }, [today, holidays]);
  
  const onLeaveToday = useMemo(() => {
    if (!today) return { lunch: 0, dinner: 0 };
    
    const leaves = allLeaves.filter(l => today && isToday(l.date));

    let lunchOff = 0;
    let dinnerOff = 0;

    leaves.forEach(leave => {
        if (leave.type === 'full_day' || leave.type === 'lunch_only') {
            lunchOff++;
        }
        if (leave.type === 'full_day' || leave.type === 'dinner_only') {
            dinnerOff++;
        }
    });

    return { lunch: lunchOff, dinner: dinnerOff };
  }, [today, allLeaves]);

  const combinedNotifications = useMemo(() => {
    const jr = joinRequests.map(r => ({ ...r, type: 'join_request', dateObj: new Date(r.date) }));
    const pcr = planChangeRequests.map(r => ({ ...r, type: 'plan_change', dateObj: new Date(r.date) }));
    return [...jr, ...pcr].sort((a, b) => b.dateObj.getTime() - a.dateObj.getTime());
  }, []);

  return (
    <div className="flex flex-col gap-8 animate-in fade-in-0 slide-in-from-top-5 duration-700">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold tracking-tight">Admin Dashboard</h1>
         <Popover>
            <PopoverTrigger asChild>
                <Button variant="outline" size="icon" className="relative">
                    <Bell className="h-5 w-5" />
                     {(joinRequests.length + planChangeRequests.length) > 0 && (
                        <Badge variant="destructive" className="absolute -top-2 -right-2 px-1.5 h-5 flex items-center justify-center rounded-full text-xs">
                           {joinRequests.length + planChangeRequests.length}
                        </Badge>
                    )}
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-96 p-0">
                 <div className="flex flex-col">
                    <div className="p-4 border-b">
                        <h3 className="font-semibold">Notifications</h3>
                        <p className="text-sm text-muted-foreground">You have {combinedNotifications.length} unread notifications.</p>
                    </div>
                    <ScrollArea className="h-96">
                        <div className="p-2 space-y-2">
                            {combinedNotifications.length > 0 ? combinedNotifications.map((notif, index) => (
                                <Link
                                  key={`${notif.type}-${notif.id}`}
                                  href={notif.type === 'join_request' ? '/admin/students?tab=requests' : '/admin/students?tab=plan_requests'}
                                  className="block p-2 rounded-lg hover:bg-secondary/50"
                                >
                                    <div className="flex items-start gap-3">
                                        <div className="bg-secondary p-2 rounded-full mt-1">
                                            {notif.type === 'join_request' ? <UserPlus className="h-4 w-4 text-primary" /> : <GitCompareArrows className="h-4 w-4 text-primary" />}
                                        </div>
                                        <div className="flex-1 space-y-1">
                                            <p className="text-sm text-muted-foreground leading-snug">
                                                <span className="font-semibold text-foreground">{notif.studentName}</span>
                                                {notif.type === 'join_request' ? ` has requested to join your mess.` : ` has requested to change plan from `}
                                                {notif.type === 'plan_change' && <><span className="font-semibold capitalize">{notif.fromPlan.replace('_', ' ')}</span> to <span className="font-semibold capitalize">{notif.toPlan.replace('_', ' ')}</span>.</>}
                                            </p>
                                             <p className="text-xs text-primary">Tap to review request</p>
                                        </div>
                                    </div>
                                    {index < combinedNotifications.length - 1 && <Separator className="mt-3" />}
                                </Link>
                            )) : (
                                <p className="text-sm text-muted-foreground text-center p-8">No new notifications.</p>
                            )}
                        </div>
                    </ScrollArea>
                    <div className="p-2 border-t text-center">
                        <Button asChild variant="link" size="sm" className="w-full">
                           <Link href="/admin/students">View all requests</Link>
                        </Button>
                    </div>
                </div>
            </PopoverContent>
        </Popover>
      </div>
      
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card className="animate-in fade-in-0 zoom-in-95 duration-500 hover:-translate-y-1 hover:border-primary/50 transition-all">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{mealInfo.title}</CardTitle>
            <Utensils className="h-5 w-5 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{mealInfo.count}</div>
            <p className="text-xs text-muted-foreground">Estimated students for the meal</p>
          </CardContent>
        </Card>
        <Card className="animate-in fade-in-0 zoom-in-95 duration-500 delay-100 hover:-translate-y-1 hover:border-primary/50 transition-all">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Students on Leave Today</CardTitle>
            <UserX className="h-5 w-5 text-destructive" />
          </CardHeader>
          <CardContent className="flex items-center justify-around pt-2">
             <div className="text-center">
                 <p className="text-2xl font-bold">{onLeaveToday.lunch}</p>
                 <p className="text-xs text-muted-foreground flex items-center gap-1"><Sun className="h-3 w-3" /> Lunch</p>
             </div>
             <div className="text-center">
                 <p className="text-2xl font-bold">{onLeaveToday.dinner}</p>
                 <p className="text-xs text-muted-foreground flex items-center gap-1"><Moon className="h-3 w-3" /> Dinner</p>
             </div>
          </CardContent>
        </Card>
        <Link href="/admin/students" className="block transition-transform duration-300 hover:-translate-y-1">
            <Card className="animate-in fade-in-0 zoom-in-95 duration-500 delay-200 h-full hover:border-primary/50">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Students</CardTitle>
                <Users className="h-5 w-5 text-primary" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">125</div>
                <p className="text-xs text-muted-foreground">+5 since last month</p>
              </CardContent>
            </Card>
        </Link>
        <Link href="/admin/billing" className="block transition-transform duration-300 hover:-translate-y-1">
            <Card className="animate-in fade-in-0 zoom-in-95 duration-500 delay-300 h-full hover:border-primary/50">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">This Month's Revenue</CardTitle>
                <TrendingUp className="h-5 w-5 text-primary" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">₹2,85,450</div>
                <p className="text-xs text-muted-foreground">+12% from last month</p>
              </CardContent>
            </Card>
        </Link>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
           <MenuSchedule />
        </div>
        
        <div className="lg:col-span-1 flex flex-col gap-6">
            <Card className="animate-in fade-in-0 zoom-in-95 duration-500 delay-600">
                <CardHeader className="flex flex-row items-center justify-between">
                    <div>
                        <CardTitle>Holiday Management</CardTitle>
                        <CardDescription>Stats for this month.</CardDescription>
                    </div>
                    <CalendarDays className="h-6 w-6 text-primary" />
                </CardHeader>
                <CardContent className="grid grid-cols-2 gap-4 text-center">
                    <div>
                        <p className="text-4xl font-bold">{holidaysThisMonth}</p>
                        <p className="text-xs text-muted-foreground">Total Holidays</p>
                    </div>
                     <div>
                        <p className="text-4xl font-bold">{mealBreaksThisMonth}</p>
                        <p className="text-xs text-muted-foreground">Meal Breaks</p>
                    </div>
                </CardContent>
                <CardFooter>
                    <Button asChild className="w-full">
                        <Link href="/admin/holidays">
                            Manage Holidays
                        </Link>
                    </Button>
                </CardFooter>
            </Card>
        </div>
      </div>
    </div>
  );
}
