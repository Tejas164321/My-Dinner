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
import { Users, UserCheck, TrendingUp, FileText, Settings, Bell, Utensils } from 'lucide-react';
import { AttendanceChart } from '@/components/admin/analytics-charts';
import { MenuSchedule } from '@/components/admin/menu-schedule';
import Link from "next/link";

export default function AdminDashboard() {
  const [mealInfo, setMealInfo] = useState({ title: "Today's Lunch Count", count: 112 });

  useEffect(() => {
    const currentHour = new Date().getHours();
    // Assuming lunch is over after 3 PM (15:00)
    if (currentHour >= 15) {
      setMealInfo({ title: "Today's Dinner Count", count: 105 });
    }
  }, []);

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Admin Dashboard</h1>
        <p className="text-muted-foreground">An overview of mess activities and student management.</p>
      </div>
      
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card className="animate-in fade-in-0 zoom-in-95 duration-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{mealInfo.title}</CardTitle>
            <Utensils className="h-5 w-5 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{mealInfo.count}</div>
            <p className="text-xs text-muted-foreground">Estimated students for the meal</p>
          </CardContent>
        </Card>
        <Card className="animate-in fade-in-0 zoom-in-95 duration-500 delay-100">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Attendance Today</CardTitle>
            <UserCheck className="h-5 w-5 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">92%</div>
            <p className="text-xs text-muted-foreground">Up from 88% yesterday</p>
          </CardContent>
        </Card>
        <Card className="animate-in fade-in-0 zoom-in-95 duration-500 delay-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Students</CardTitle>
            <Users className="h-5 w-5 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">125</div>
            <p className="text-xs text-muted-foreground">+5 since last month</p>
          </CardContent>
        </Card>
        <Card className="animate-in fade-in-0 zoom-in-95 duration-500 delay-300">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">This Month's Revenue</CardTitle>
            <TrendingUp className="h-5 w-5 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₹2,85,450</div>
            <p className="text-xs text-muted-foreground">+12% from last month</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
           <Tabs defaultValue="menu">
            <div className="flex flex-wrap items-center justify-between gap-4">
                <TabsList>
                    <TabsTrigger value="menu">Menu</TabsTrigger>
                    <TabsTrigger value="analytics">Analytics</TabsTrigger>
                </TabsList>
                <div className="flex items-center gap-2">
                    <Button asChild variant="outline">
                        <Link href="/admin/students">
                            <Users className="mr-2 h-4 w-4"/> Manage Students
                        </Link>
                    </Button>
                    <Button><Bell className="mr-2 h-4 w-4"/> Announce</Button>
                </div>
            </div>
            <TabsContent value="menu" className="mt-4 animate-in fade-in-0 duration-500">
              <MenuSchedule />
            </TabsContent>
             <TabsContent value="analytics" className="mt-4 animate-in fade-in-0 duration-500">
                <Card>
                    <CardHeader>
                        <CardTitle>Attendance Trends</CardTitle>
                        <CardDescription>Monthly attendance summary for all students.</CardDescription>
                    </CardHeader>
                    <CardContent className="h-[350px] p-2">
                        <AttendanceChart />
                    </CardContent>
                </Card>
            </TabsContent>
          </Tabs>
        </div>
        
        <div className="lg:col-span-1 flex flex-col gap-6">
            <Card className="animate-in fade-in-0 zoom-in-95 duration-500 delay-400">
                <CardHeader>
                    <CardTitle>Recent Activity</CardTitle>
                </CardHeader>
                <CardContent>
                   <ul className="space-y-4 text-sm text-muted-foreground">
                        <li className="flex items-start gap-3">
                            <FileText className="h-4 w-4 mt-1 flex-shrink-0 text-primary"/>
                            <p><span className="font-semibold text-foreground">Alex Doe</span> paid their monthly bill of ₹3,250.</p>
                        </li>
                        <li className="flex items-start gap-3">
                            <UserCheck className="h-4 w-4 mt-1 flex-shrink-0 text-green-400"/>
                            <p>New student <span className="font-semibold text-foreground">Jane Smith</span> was approved.</p>
                        </li>
                        <li className="flex items-start gap-3">
                            <Settings className="h-4 w-4 mt-1 flex-shrink-0"/>
                            <p>You updated the meal menu for next week.</p>
                        </li>
                   </ul>
                </CardContent>
            </Card>

             <Card className="animate-in fade-in-0 zoom-in-95 duration-500 delay-500">
                <CardHeader>
                    <CardTitle>Mess Join Code</CardTitle>
                    <CardDescription>Share this code with new students to allow them to join the mess system.</CardDescription>
                </CardHeader>
                <CardContent className="flex items-center justify-between rounded-lg bg-secondary p-4">
                    <div className="text-2xl font-mono tracking-widest text-primary">XF4G8K</div>
                    <Button size="sm" variant="default">Regenerate</Button>
                </CardContent>
            </Card>
        </div>
      </div>
    </div>
  );
}
