
'use client';

import type { NotificationItem } from '@/components/shared/notification-card';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Bell, Rss } from "lucide-react";
import { ScrollArea } from '@/components/ui/scroll-area';
import Link from 'next/link';
import { Skeleton } from '../ui/skeleton';
import { NotificationCard } from '../shared/notification-card';

interface RecentNotificationsCardProps {
    notifications: NotificationItem[];
    isLoading: boolean;
}

export function RecentNotificationsCard({ notifications, isLoading }: RecentNotificationsCardProps) {
    const recentNotifications = notifications.slice(0, 3);

    return (
        <Card className="animate-in fade-in-0 zoom-in-95 duration-500 delay-600 flex flex-col">
            <CardHeader>
                <div className="flex items-center justify-between">
                    <CardTitle>Recent Notifications</CardTitle>
                    <Rss className="h-5 w-5 text-primary" />
                </div>
                <CardDescription>Latest alerts and announcements.</CardDescription>
            </CardHeader>
            <CardContent className="flex-grow p-2 pt-0">
                <ScrollArea className="h-[210px]">
                    <div className="p-2 pt-0 space-y-2">
                        {isLoading ? (
                             Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-20 w-full rounded-lg" />)
                        ) : recentNotifications.length > 0 ? (
                            recentNotifications.map((item) => (
                                <NotificationCard key={item.id} {...item} />
                            ))
                        ) : (
                            <div className="flex h-full flex-col items-center justify-center text-sm text-muted-foreground text-center py-4">
                                <Bell className="h-6 w-6 mb-2" />
                                <p>No recent notifications.</p>
                            </div>
                        )}
                    </div>
                </ScrollArea>
            </CardContent>
            <CardFooter>
                <Button asChild className="w-full" variant="outline">
                    <Link href="/student/notifications">
                        View All Notifications
                    </Link>
                </Button>
            </CardFooter>
        </Card>
    );
}
