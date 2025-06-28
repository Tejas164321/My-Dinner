'use client';

import { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import Image from 'next/image';
import { Utensils, Calendar, Sun, Moon, Wallet, Percent, MessageSquare, ShieldAlert } from 'lucide-react';
import { dailyMenus } from "@/lib/data";
import { format, addDays, startOfDay } from 'date-fns';

const formatDateKey = (date: Date): string => format(date, 'yyyy-MM-dd');

export default function StudentDashboard() {
  const [currentDate, setCurrentDate] = useState<Date | null>(null);

  useEffect(() => {
    setCurrentDate(startOfDay(new Date()));
  }, []);

  const todayKey = currentDate ? formatDateKey(currentDate) : '';
  const todaysMenu = dailyMenus.get(todayKey) || { lunch: ['Not set'], dinner: ['Not set'] };

  const weekDays = useMemo(() => {
    if (!currentDate) return [];
    return Array.from({ length: 7 }).map((_, i) => addDays(currentDate, i));
  }, [currentDate]);

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Welcome back, Alex!</h1>
        <p className="text-muted-foreground">
          {currentDate
            ? `Here's your dashboard for ${currentDate.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}.`
            : 'Loading dashboard...'}
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column */}
        <div className="lg:col-span-2 flex flex-col gap-6">
          
          {/* Today's Menu */}
          <Card className="animate-in fade-in-0 zoom-in-95 duration-500">
            <CardHeader>
              <div className="flex items-center gap-2">
                <Utensils className="h-5 w-5 text-primary" />
                <CardTitle>Today's Menu</CardTitle>
              </div>
              <CardDescription>What's cooking today in the mess.</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-6 md:grid-cols-2">
              <div className="flex flex-col gap-4">
                <div className="flex items-center gap-4">
                  <div className="bg-secondary/50 p-3 rounded-lg">
                      <Sun className="h-6 w-6 text-yellow-400"/>
                  </div>
                  <div>
                      <h3 className="font-semibold text-lg">Lunch</h3>
                      <p className="text-muted-foreground">{todaysMenu.lunch.join(', ')}</p>
                  </div>
                </div>
                <Image src="https://placehold.co/600x400.png" alt="Lunch meal" width={600} height={400} className="rounded-lg object-cover" data-ai-hint="indian food" />
              </div>
              <div className="flex flex-col gap-4">
                 <div className="flex items-center gap-4">
                   <div className="bg-secondary/50 p-3 rounded-lg">
                      <Moon className="h-6 w-6 text-purple-400"/>
                  </div>
                  <div>
                      <h3 className="font-semibold text-lg">Dinner</h3>
                      <p className="text-muted-foreground">{todaysMenu.dinner.join(', ')}</p>
                  </div>
                </div>
                 <Image src="https://placehold.co/600x400.png" alt="Dinner meal" width={600} height={400} className="rounded-lg object-cover" data-ai-hint="north indian food" />
              </div>
            </CardContent>
          </Card>

          {/* Weekly Menu */}
          <Card className="animate-in fade-in-0 zoom-in-95 duration-500 delay-100">
             <CardHeader>
                <CardTitle>Upcoming Menu</CardTitle>
                <CardDescription>Plan your meals for the week ahead.</CardDescription>
            </CardHeader>
            <CardContent>
              {weekDays.length > 0 && (
                <Tabs defaultValue={formatDateKey(weekDays[0])} className="w-full">
                  <TabsList className="grid w-full grid-cols-4 sm:grid-cols-7">
                    {weekDays.map((day) => (
                      <TabsTrigger key={formatDateKey(day)} value={formatDateKey(day)} className="capitalize">{format(day, 'E')}</TabsTrigger>
                    ))}
                  </TabsList>
                  {weekDays.map((day) => {
                    const menuForDay = dailyMenus.get(formatDateKey(day)) || { lunch: ['Not Set'], dinner: ['Not Set'] };
                    return (
                      <TabsContent key={formatDateKey(day)} value={formatDateKey(day)} className="mt-4">
                        <div className="grid gap-4 sm:grid-cols-2">
                            <div>
                                <h4 className="font-semibold mb-2">Lunch</h4>
                                <p className="text-muted-foreground">{menuForDay.lunch.join(', ')}</p>
                            </div>
                            <div>
                                <h4 className="font-semibold mb-2">Dinner</h4>
                                <p className="text-muted-foreground">{menuForDay.dinner.join(', ')}</p>
                            </div>
                        </div>
                      </TabsContent>
                    )
                  })}
                </Tabs>
              )}
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
                   <Button className="w-full">Pay Now</Button>
                </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card className="animate-in fade-in-0 zoom-in-95 duration-500 delay-400">
                <CardHeader>
                    <CardTitle>Quick Actions</CardTitle>
                </CardHeader>
                <CardContent className="flex flex-col gap-3">
                    <Button variant="outline" className="justify-start">
                        <Calendar className="mr-2"/> Apply for Leave
                    </Button>
                    <Button variant="outline" className="justify-start">
                        <MessageSquare className="mr-2"/> Give Feedback
                    </Button>
                     <Button variant="outline" className="justify-start">
                        <ShieldAlert className="mr-2"/> Report an Issue
                    </Button>
                </CardContent>
            </Card>
        </div>
      </div>
    </div>
  );
}
