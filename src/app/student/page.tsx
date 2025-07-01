
'use client';

import { useState, useEffect, useMemo } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Utensils, Calendar, Sun, Moon, Wallet, Percent, MessageSquare, ShieldAlert } from 'lucide-react';
import { dailyMenus } from "@/lib/data";
import { format, startOfDay, isToday } from 'date-fns';
import Link from 'next/link';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar as CalendarPicker } from '@/components/ui/calendar';
import { cn } from '@/lib/utils';

const formatDateKey = (date: Date): string => format(date, 'yyyy-MM-dd');

export default function StudentDashboard() {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>();

  useEffect(() => {
    setSelectedDate(startOfDay(new Date()));
  }, []);

  const displayedMenu = useMemo(() => {
    if (!selectedDate) return { lunch: ['Loading...'], dinner: ['Loading...'] };
    const dateKey = formatDateKey(selectedDate);
    return dailyMenus.get(dateKey) || { lunch: ['Not set'], dinner: ['Not set'] };
  }, [selectedDate]);
  
  const menuTitle = useMemo(() => {
      if (!selectedDate) return "Today's Menu";
      return isToday(selectedDate) ? "Today's Menu" : `Menu for ${format(selectedDate, 'MMM do')}`;
  }, [selectedDate]);

  return (
    <div className="flex flex-col gap-8 animate-in fade-in-0 slide-in-from-top-5 duration-700">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Welcome back, Alex!</h1>
        <p className="text-muted-foreground">
          {selectedDate
            ? `Here's your dashboard for ${new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}.`
            : 'Loading dashboard...'}
        </p>
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
              <div className="flex items-center gap-4 rounded-lg border bg-secondary/30 p-4">
                  <div className="bg-secondary/50 p-3 rounded-lg">
                      <Sun className="h-6 w-6 text-yellow-400"/>
                  </div>
                  <div>
                      <h3 className="font-semibold text-lg">Lunch</h3>
                      <p className="text-muted-foreground">{displayedMenu.lunch.join(', ')}</p>
                  </div>
              </div>
              <div className="flex items-center gap-4 rounded-lg border bg-secondary/30 p-4">
                  <div className="bg-secondary/50 p-3 rounded-lg">
                      <Moon className="h-6 w-6 text-purple-400"/>
                  </div>
                  <div>
                      <h3 className="font-semibold text-lg">Dinner</h3>
                      <p className="text-muted-foreground">{displayedMenu.dinner.join(', ')}</p>
                  </div>
              </div>
            </CardContent>
          </Card>

        </div>

        {/* Right Column */}
        <div className="lg:col-span-1 flex flex-col gap-6">
            
            {/* Attendance */}
            <Card className="animate-in fade-in-0 zoom-in-95 duration-500 delay-200">
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <CardTitle>My Attendance</CardTitle>
                        <Percent className="h-5 w-5 text-primary" />
                    </div>
                    <CardDescription>Current month's attendance.</CardDescription>
                </CardHeader>
                <CardContent className="flex flex-col gap-3">
                    <div className="flex justify-between items-baseline">
                        <p className="text-3xl font-bold">92%</p>
                        <p className="text-sm text-muted-foreground">25/27 Days</p>
                    </div>
                    <Progress value={92} aria-label="92% attendance" />
                    <p className="text-xs text-muted-foreground">Keep it up! You have great attendance.</p>
                </CardContent>
            </Card>

            {/* Billing */}
            <Card className="animate-in fade-in-0 zoom-in-95 duration-500 delay-300">
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <CardTitle>My Bill</CardTitle>
                        <Wallet className="h-5 w-5 text-primary" />
                    </div>
                    <CardDescription>Status of your monthly mess bill.</CardDescription>
                </CardHeader>
                <CardContent className="flex flex-col gap-4">
                   <div className="flex justify-between items-center p-4 bg-secondary/50 rounded-lg">
                     <div>
                        <p className="text-muted-foreground text-sm">Amount Due</p>
                        <p className="text-2xl font-bold">₹3,250</p>
                     </div>
                     <Badge variant="destructive">DUE</Badge>
                   </div>
                   <Button asChild className="w-full">
                        <Link href="/student/bills">Pay Now</Link>
                   </Button>
                </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card className="animate-in fade-in-0 zoom-in-95 duration-500 delay-400">
                <CardHeader>
                    <CardTitle>Quick Actions</CardTitle>
                </CardHeader>
                <CardContent className="flex flex-col gap-3">
                    <Button asChild variant="outline" className="justify-start">
                        <Link href="/student/leave"><Calendar className="mr-2"/> Apply for Leave</Link>
                    </Button>
                    <Button asChild variant="outline" className="justify-start">
                        <Link href="/student/feedback"><MessageSquare className="mr-2"/> Give Feedback</Link>
                    </Button>
                     <Button asChild variant="outline" className="justify-start">
                        <Link href="/student/feedback"><ShieldAlert className="mr-2"/> Report an Issue</Link>
                    </Button>
                </CardContent>
            </Card>
        </div>
      </div>
    </div>
  );
}
