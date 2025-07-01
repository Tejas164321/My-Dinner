
'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { pastAnnouncements, Announcement } from '@/lib/data';
import { Bell, Rss } from 'lucide-react';
import { format } from 'date-fns';

export default function StudentNotificationsPage() {

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
                            <CardTitle>Announcements Feed</CardTitle>
                            <CardDescription>A log of all announcements sent by the admin.</CardDescription>
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                     <div className="space-y-6">
                        {pastAnnouncements.length > 0 ? (
                            pastAnnouncements.map((ann) => (
                                <div key={ann.id} className="p-5 bg-secondary/50 rounded-lg relative group border-l-4 border-primary/50">
                                    <div className="flex items-start gap-4">
                                            <div className="bg-primary/10 p-2.5 rounded-full mt-1">
                                            <Bell className="h-5 w-5 text-primary flex-shrink-0" />
                                        </div>
                                        <div className="flex-1">
                                            <p className="font-semibold text-base">{ann.title}</p>
                                            <p className="text-sm text-muted-foreground mt-1">{ann.message}</p>
                                            <p className="text-xs text-muted-foreground/70 mt-3">{format(new Date(ann.date), 'MMMM do, yyyy')}</p>
                                        </div>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="flex h-full items-center justify-center text-sm text-muted-foreground py-10">
                                <p>No announcements yet.</p>
                            </div>
                        )}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
