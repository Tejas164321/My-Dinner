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
import { Users, UserX, TrendingUp, FileText, Settings, Bell, Utensils, CalendarDays, Moon, Sun } from 'lucide-react';
import { MenuSchedule } from '@/components/admin/menu-schedule';
import Link from "next/link";
import { holidays, leaveHistory } from '@/lib/data';
import { isSameMonth, isToday, startOfDay, format } from 'date-fns';

export default function AdminDashboard() {
  const [mealInfo, setMealInfo] = useState({ title: "Today's Lunch Count", count: 112 });
  const [today, setToday] = useState<Date>();

  useEffect(() => {
    // Use fixed date for consistent mock data
    const now = startOfDay(new Date(2023, 9, 27));
    setToday(now);

    const currentHour = new Date().getHours();
    // Assuming lunch is over after 3 PM (15:00)
    if (currentHour >= 15) {
      setMealInfo({ title: "Today's Dinner Count", count: 105 });
    }
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
  }, [today]);
  
  const onLeaveToday = useMemo(() => {
    if (!today) return { lunch: 0, dinner: 0 };
    
    const fixedToday = startOfDay(new Date(2023, 9, 27));
    const leaves = leaveHistory.filter(l => format(l.date, 'yyyy-MM-dd') === format(fixedToday, 'yyyy-MM-dd'));

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
  }, [today]);

  return (
    <div className="flex flex-col gap-8 animate-in fade-in-0 slide-in-from-top-5 duration-700">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Admin Dashboard</h1>
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
            <Card className="animate-in fade-in-0 zoom-in-95 duration-500 delay-400">
                <CardHeader className="flex flex-row items-center justify-between">
                    <div>
                        <CardTitle>Notifications</CardTitle>
                        <CardDescription>Recent system activities.</CardDescription>
                    </div>
                    <Button variant="outline" size="sm">View all</Button>
                </CardHeader>
                <CardContent>
                   <ul className="space-y-4 text-sm text-muted-foreground">
                        <li className="flex items-start gap-3">
                            <FileText className="h-4 w-4 mt-1 flex-shrink-0 text-primary"/>
                            <p><span className="font-semibold text-foreground">Alex Doe</span> paid their monthly bill of ₹3,250.</p>
                        </li>
                        <li className="flex items-start gap-3">
                            <Users className="h-4 w-4 mt-1 flex-shrink-0 text-green-400"/>
                            <p>New student <span className="font-semibold text-foreground">Jane Smith</span> was approved.</p>
                        </li>
                        <li className="flex items-start gap-3">
                            <Settings className="h-4 w-4 mt-1 flex-shrink-0"/>
                            <p>You updated the meal menu for next week.</p>
                        </li>
                   </ul>
                </CardContent>
            </Card>

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
