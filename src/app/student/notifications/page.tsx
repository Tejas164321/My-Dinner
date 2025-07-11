'use client';

import { useMemo, useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Announcement, paymentReminders, PaymentReminder } from '@/lib/data';
import { onAnnouncementsUpdate } from '@/lib/listeners/announcements';
import { Bell, Rss, ShieldAlert, Loader2 } from 'lucide-react';
import { format } from 'date-fns';

type Notification = (Announcement & { type: 'announcement' }) | (PaymentReminder & { type: 'reminder' });

export default function StudentNotificationsPage() {
    const [announcements, setAnnouncements] = useState<Announcement[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        setIsLoading(true);
        const unsubscribe = onAnnouncementsUpdate((updatedAnnouncements) => {
            setAnnouncements(updatedAnnouncements);
            setIsLoading(false);
        });

        return () => unsubscribe();
    }, []);

    const combinedNotifications = useMemo(() => {
        const liveAnnouncements: Notification[] = announcements.map(ann => ({ ...ann, type: 'announcement' }));
        const reminders: Notification[] = paymentReminders.map(rem => ({ ...rem, type: 'reminder' }));

        const allNotifications = [...liveAnnouncements, ...reminders];

        return allNotifications.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    }, [announcements]);

    return (
        <div className="flex flex-col gap-8 animate-in fade-in-0 slide-in-from-top-5 duration-700">
            <div>
                <h1 className="text-2xl font-bold tracking-tight">Notifications</h1>
            </div>

            <Card>
                 <CardHeader>
                     <div className="flex items-center gap-3">
                        <Rss className="h-6 w-6 text-primary"/>
                        <div>
                            <CardTitle>Notifications Feed</CardTitle>
                            <CardDescription>A log of all announcements and reminders from the admin.</CardDescription>
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                     <div className="space-y-6">
                        {isLoading ? (
                            <div className="flex h-full items-center justify-center text-sm text-muted-foreground py-10">
                                <Loader2 className="h-6 w-6 animate-spin" />
                            </div>
                        ) : combinedNotifications.length > 0 ? (
                            combinedNotifications.map((item) => (
                                <div key={`${item.type}-${item.id}`} className={`p-5 bg-secondary/50 rounded-lg relative group border-l-4 ${item.type === 'announcement' ? 'border-primary/50' : 'border-destructive/50'}`}>
                                    <div className="flex items-start gap-4">
                                        {item.type === 'announcement' ? (
                                            <div className="bg-primary/10 p-2.5 rounded-full mt-1">
                                                <Bell className="h-5 w-5 text-primary flex-shrink-0" />
                                            </div>
                                        ) : (
                                            <div className="bg-destructive/10 p-2.5 rounded-full mt-1">
                                                <ShieldAlert className="h-5 w-5 text-destructive flex-shrink-0" />
                                            </div>
                                        )}
                                        <div className="flex-1">
                                            <p className="font-semibold text-base">{item.title}</p>
                                            <p className="text-sm text-muted-foreground mt-1">{item.message}</p>
                                            <p className="text-xs text-muted-foreground/70 mt-3">{format(new Date(item.date), 'MMMM do, yyyy')}</p>
                                        </div>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="flex h-full items-center justify-center text-sm text-muted-foreground py-10">
                                <p>No notifications yet.</p>
                            </div>
                        )}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
