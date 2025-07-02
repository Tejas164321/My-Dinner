
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
import { Utensils, Calendar, Sun, Moon, Wallet, Percent } from 'lucide-react';
import { dailyMenus, billHistory } from "@/lib/data";
import { format, startOfDay } from 'date-fns';
import Link from 'next/link';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar as CalendarPicker } from '@/components/ui/calendar';
import { cn } from '@/lib/utils';

const formatDateKey = (date: Date): string => format(date, 'yyyy-MM-dd');

export default function StudentDashboard() {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>();

  useEffect(() => {
    // Set a fixed date to ensure mock data consistency
    setSelectedDate(startOfDay(new Date(2023, 9, 27)));
  }, []);

  const displayedMenu = useMemo(() => {
    if (!selectedDate) return { lunch: ['Loading...'], dinner: ['Loading...'] };
    const dateKey = formatDateKey(selectedDate);
    return dailyMenus.get(dateKey) || { lunch: ['Not set'], dinner: ['Not set'] };
  }, [selectedDate]);
  
  const menuTitle = useMemo(() => {
      if (!selectedDate) return "Today's Menu";
      const isFixedToday = format(selectedDate, 'yyyy-MM-dd') === '2023-10-27';
      return isFixedToday ? "Today's Menu" : `Menu for ${format(selectedDate, 'MMM do')}`;
  }, [selectedDate]);

  const currentMonthBill = useMemo(() => {
    if (!selectedDate) return undefined;
    const currentMonthName = format(selectedDate, 'MMMM');
    return billHistory.find(bill => bill.month === currentMonthName);
  }, [selectedDate]);
  
  const dueAmount = currentMonthBill 
      ? currentMonthBill.totalAmount - currentMonthBill.payments.reduce((sum, p) => sum + p.amount, 0)
      : 0;
  
  const isPaid = dueAmount <= 0;

  return (
    <div className="flex flex-col gap-8 animate-in fade-in-0 slide-in-from-top-5 duration-700">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Welcome back, Alex!</h1>
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
            
            {/* Billing */}
            <Card className="animate-in fade-in-0 zoom-in-95 duration-500 delay-200">
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <CardTitle>Bill for {currentMonthBill?.month || format(selectedDate || new Date(), 'MMMM')}</CardTitle>
                        <Wallet className="h-5 w-5 text-primary" />
                    </div>
                </CardHeader>
                <CardContent className="flex flex-col gap-4">
                   {currentMonthBill ? (
                     <>
                        <div className="flex justify-between items-center p-4 bg-secondary/50 rounded-lg">
                          <div>
                              <p className="text-muted-foreground text-sm">{isPaid ? 'Total Bill' : 'Amount Due'}</p>
                              <p className={cn("text-2xl font-bold", !isPaid && "text-destructive")}>
                                ₹{isPaid ? currentMonthBill.totalAmount.toLocaleString() : dueAmount.toLocaleString()}
                              </p>
                          </div>
                           <Badge variant={isPaid ? 'secondary' : 'destructive'} className={cn(isPaid && "border-transparent bg-green-600 text-primary-foreground hover:bg-green-600/80")}>
                            {isPaid ? 'PAID' : 'DUE'}
                          </Badge>
                        </div>
                        <Button asChild className="w-full" variant={isPaid ? 'outline' : 'default'}>
                            <Link href="/student/bills">{isPaid ? 'View Details' : 'Pay Now'}</Link>
                        </Button>
                     </>
                   ) : (
                      <div className="flex items-center justify-center text-center p-4 bg-secondary/50 rounded-lg h-28">
                        <div>
                          <p className="font-semibold text-foreground">No Bill Yet</p>
                          <p className="text-sm text-muted-foreground">The bill for this month has not been generated.</p>
                        </div>
                      </div>
                   )}
                </CardContent>
            </Card>

            {/* Attendance */}
            <Card className="animate-in fade-in-0 zoom-in-95 duration-500 delay-300">
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
        </div>
      </div>
    </div>
  );
}
