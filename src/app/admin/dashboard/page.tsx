
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
import { Users, UserX, TrendingUp, KeyRound, Settings, Bell, Utensils, CalendarDays, Moon, Sun, UserPlus, GitCompareArrows, Check, X, Copy } from 'lucide-react';
import { MenuSchedule } from '@/components/admin/menu-schedule';
import Link from "next/link";
import { Holiday, Leave, JoinRequest, PlanChangeRequest } from '@/lib/data';
import { isSameMonth, isToday, startOfDay, format } from 'date-fns';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { useAuth } from '@/contexts/auth-context';
import { Skeleton } from '@/components/ui/skeleton';

export default function AdminDashboardPage() {
  const { user, loading } = useAuth();

  const [mealInfo, setMealInfo] = useState({ title: "Today's Lunch Count", count: 112 });
  const [today, setToday] = useState<Date>();
  
  useEffect(() => {
    const now = startOfDay(new Date());
    setToday(now);

    const currentHour = new Date().getHours();
    if (currentHour >= 15) {
      setMealInfo({ title: "Today's Dinner Count", count: 105 });
    }
  }, []);


  const handleCopyCode = () => {
    if (!user?.secretCode) return;
    navigator.clipboard.writeText(user.secretCode);
    alert("Secret code copied to clipboard!");
  };

  if (loading || !user) {
      return (
          <div className="space-y-6">
              <Skeleton className="h-8 w-64" />
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                  <Skeleton className="h-28 w-full" />
                  <Skeleton className="h-28 w-full" />
                  <Skeleton className="h-28 w-full" />
                  <Skeleton className="h-28 w-full" />
              </div>
              <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                  <Skeleton className="h-96 w-full lg:col-span-2" />
                  <div className="space-y-6">
                    <Skeleton className="h-48 w-full" />
                    <Skeleton className="h-48 w-full" />
                  </div>
              </div>
          </div>
      )
  }

  return (
    <div className="flex flex-col gap-8 animate-in fade-in-0 slide-in-from-top-5 duration-700">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold tracking-tight">Admin Dashboard</h1>
        <Button asChild variant="outline">
            <Link href="/admin/students?tab=requests">
                <Bell className="mr-2 h-4 w-4"/>
                View Requests
            </Link>
        </Button>
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
        <Link href="/admin/announcements" className="block transition-transform duration-300 hover:-translate-y-1">
            <Card className="animate-in fade-in-0 zoom-in-95 duration-500 delay-100 h-full hover:border-primary/50">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Announcements</CardTitle>
                <Bell className="h-5 w-5 text-primary" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">3</div>
                <p className="text-xs text-muted-foreground">Recent announcements sent</p>
              </CardContent>
            </Card>
        </Link>
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
            <Card className="animate-in fade-in-0 zoom-in-95 duration-500 delay-500">
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <div>
                            <CardTitle>Your Mess Secret Code</CardTitle>
                            <CardDescription>Share this with students to join.</CardDescription>
                        </div>
                        <KeyRound className="h-6 w-6 text-primary" />
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="relative flex items-center justify-center p-4 bg-secondary/50 rounded-lg">
                        <p className="text-4xl font-bold tracking-widest text-center font-mono">
                            {user.secretCode}
                        </p>
                        <Button
                            variant="ghost"
                            size="icon"
                            className="absolute right-2 top-1/2 -translate-y-1/2"
                            onClick={handleCopyCode}
                        >
                            <Copy className="h-5 w-5" />
                        </Button>
                    </div>
                </CardContent>
            </Card>
            <Card className="animate-in fade-in-0 zoom-in-95 duration-500 delay-600 flex flex-col">
                <CardHeader className="flex flex-row items-center justify-between">
                    <div>
                        <CardTitle>Holiday Management</CardTitle>
                        <CardDescription>Schedule mess holidays.</CardDescription>
                    </div>
                    <CalendarDays className="h-6 w-6 text-primary" />
                </CardHeader>
                <CardContent className="flex-grow flex items-center justify-center">
                   <p className="text-sm text-muted-foreground text-center">
                       Add one-day or long leaves for the entire mess.
                   </p>
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
