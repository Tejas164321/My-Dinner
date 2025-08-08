
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
import { Users, TrendingUp, Bell, Utensils, CalendarDays, Megaphone } from 'lucide-react';
import { MenuSchedule } from '@/components/admin/menu-schedule';
import Link from "next/link";
import { Leave, AppUser, Announcement } from '@/lib/data';
import { isSameDay, startOfDay } from 'date-fns';
import { useAuth } from '@/contexts/auth-context';
import { Skeleton } from '@/components/ui/skeleton';
import { onUsersUpdate } from '@/lib/listeners/users';
import { onAllLeavesUpdate } from '@/lib/listeners/leaves';
import { onAnnouncementsUpdate } from '@/lib/listeners/announcements';
import { PendingPaymentsCard } from '@/components/admin/pending-payments-card';

export default function AdminDashboardPage() {
  const { user: adminUser, loading: authLoading } = useAuth();

  const [students, setStudents] = useState<AppUser[]>([]);
  const [leaves, setLeaves] = useState<Leave[]>([]);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  
  const [studentsLoading, setStudentsLoading] = useState(true);
  const [leavesLoading, setLeavesLoading] = useState(true);
  const [announcementsLoading, setAnnouncementsLoading] = useState(true);
  
  const isLoading = authLoading || studentsLoading || leavesLoading || announcementsLoading;

  useEffect(() => {
    if (!adminUser) return;
    
    setStudentsLoading(true);
    setAnnouncementsLoading(true);

    let leavesUnsubscribe: (() => void) | null = null;

    const usersUnsubscribe = onUsersUpdate(adminUser.uid, (updatedUsers) => {
        const activeUsers = updatedUsers.filter(u => u.status === 'active');
        setStudents(activeUsers);
        setStudentsLoading(false);

        // If a leaves listener already exists, unsubscribe from it before creating a new one
        if (leavesUnsubscribe) {
            leavesUnsubscribe();
        }
        
        // Now that we have the correct list of active users, we can listen for their leaves.
        setLeavesLoading(true);
        const studentIds = new Set(activeUsers.map(u => u.uid));

        // Only listen for leaves if there are active students
        if (studentIds.size > 0) {
            leavesUnsubscribe = onAllLeavesUpdate((allLeaves) => {
                setLeaves(allLeaves.filter(l => studentIds.has(l.studentId)));
                setLeavesLoading(false);
            });
        } else {
            setLeaves([]); // No active students, so no leaves to show
            setLeavesLoading(false);
        }
    });

    const announcementsUnsubscribe = onAnnouncementsUpdate(adminUser.uid, (updatedAnnouncements) => {
        setAnnouncements(updatedAnnouncements);
        setAnnouncementsLoading(false);
    });

    return () => {
        usersUnsubscribe();
        if (leavesUnsubscribe) {
            leavesUnsubscribe();
        }
        announcementsUnsubscribe();
    };
  }, [adminUser]);


  const mealInfo = useMemo(() => {
    const now = new Date();
    const currentHour = now.getHours();
    const today = startOfDay(now);
    
    const todaysLeaves = leaves.filter(l => isSameDay(l.date, today));
    
    let title: string;
    let mealType: 'lunch' | 'dinner';

    if (currentHour >= 15) {
      title = "Today's Dinner Count";
      mealType = 'dinner';
    } else {
      title = "Today's Lunch Count";
      mealType = 'lunch';
    }
    
    const leavesForThisMeal = todaysLeaves.filter(l => 
        l.type === 'full_day' || 
        (mealType === 'lunch' && l.type === 'lunch_only') ||
        (mealType === 'dinner' && l.type === 'dinner_only')
    ).length;

    const count = students.length - leavesForThisMeal;

    return { title, count };

  }, [students, leaves]);

  if (isLoading || !adminUser) {
      return (
          <div className="space-y-6">
              <Skeleton className="h-8 w-64" />
              <div className="grid grid-cols-2 gap-6 lg:grid-cols-4">
                  <Skeleton className="h-28 w-full" />
                  <Skeleton className="h-28 w-full" />
                  <Skeleton className="h-28 w-full" />
                  <Skeleton className="h-28 w-full" />
              </div>
              <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                  <div className="lg:col-span-2">
                     <Skeleton className="h-[600px] w-full" />
                  </div>
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
      <div className="flex-wrap justify-between items-center gap-4 hidden md:flex">
        <h1 className="text-2xl font-bold tracking-tight">Admin Dashboard</h1>
        <Button asChild variant="outline">
            <Link href="/admin/notifications">
                <Bell className="mr-2 h-4 w-4"/>
                View Notifications
            </Link>
        </Button>
      </div>
      
       <div className="grid grid-cols-2 gap-4 md:gap-6 lg:grid-cols-4">
        <Card className="animate-in fade-in-0 zoom-in-95 duration-500 hover:-translate-y-1 hover:border-primary/50 transition-all">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{mealInfo.title}</CardTitle>
            <Utensils className="h-5 w-5 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{mealInfo.count}</div>
            <p className="text-xs text-muted-foreground truncate">Estimated students for the meal</p>
          </CardContent>
        </Card>
        <Link href="/admin/announcements" className="block transition-transform duration-300 hover:-translate-y-1">
            <Card className="animate-in fade-in-0 zoom-in-95 duration-500 delay-100 h-full hover:border-primary/50">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Announcements</CardTitle>
                <Megaphone className="h-5 w-5 text-primary" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{announcements.length}</div>
                <p className="text-xs text-muted-foreground truncate">Total announcements sent</p>
              </CardContent>
            </Card>
        </Link>
        <Link href="/admin/students" className="block transition-transform duration-300 hover:-translate-y-1">
            <Card className="animate-in fade-in-0 zoom-in-95 duration-500 delay-200 h-full hover:border-primary/50">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Active Students</CardTitle>
                <Users className="h-5 w-5 text-primary" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{students.length}</div>
                <p className="text-xs text-muted-foreground truncate">Total active students</p>
              </CardContent>
            </Card>
        </Link>
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
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
           <MenuSchedule />
        </div>
        
        <div className="lg:col-span-1 flex flex-col gap-6">
            <PendingPaymentsCard />
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
