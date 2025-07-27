
'use client';

import { useMemo, useState, useEffect, useRef } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Announcement, paymentReminders, PaymentReminder } from '@/lib/data';
import { onAnnouncementsUpdate } from '@/lib/listeners/announcements';
import { Bell, ShieldAlert, Loader2 } from 'lucide-react';
import { format } from 'date-fns';
import { useAuth } from '@/contexts/auth-context';

type Notification = (Announcement & { type: 'announcement' }) | (PaymentReminder & { type: 'reminder' });

export default function StudentNotificationsPage() {
    const { user } = useAuth();
    const [announcements, setAnnouncements] = useState<Announcement[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const audioRef = useRef<HTMLAudioElement>(null);
    const initialLoadDone = useRef(false);

    useEffect(() => {
        if (!user || !user.messId) {
            setIsLoading(false);
            return;
        }

        setIsLoading(true);
        const unsubscribe = onAnnouncementsUpdate(user.messId, (updatedAnnouncements) => {
            if (initialLoadDone.current && updatedAnnouncements.length > announcements.length) {
                audioRef.current?.play().catch(e => console.error("Error playing audio:", e));
            }
            setAnnouncements(updatedAnnouncements);
            setIsLoading(false);
            
            if (!initialLoadDone.current) {
                initialLoadDone.current = true;
            }
        });

        return () => unsubscribe();
    }, [user, announcements]);

    const combinedNotifications = useMemo(() => {
        const liveAnnouncements: Notification[] = announcements.map(ann => ({ ...ann, type: 'announcement' }));
        // In a real app, reminders might come from a different source or be generated based on bill status
        const reminders: Notification[] = []; 

        const allNotifications = [...liveAnnouncements, ...reminders];

        return allNotifications.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    }, [announcements]);

    return (
        <div className="flex flex-col gap-6 animate-in fade-in-0 slide-in-from-top-5 duration-700">
            <h1 className="text-2xl font-bold tracking-tight">Notifications</h1>
            {isLoading ? (
                <div className="flex h-40 items-center justify-center text-sm text-muted-foreground">
                    <Loader2 className="h-6 w-6 animate-spin" />
                </div>
            ) : combinedNotifications.length > 0 ? (
                <div className="space-y-4">
                    {combinedNotifications.map((item) => (
                       <Card key={`${item.type}-${item.id}`} className={`overflow-hidden ${item.type === 'announcement' ? 'border-primary/20' : 'border-destructive/20'}`}>
                           <div className={`p-4 flex items-start gap-4 ${item.type === 'announcement' ? 'bg-primary/5' : 'bg-destructive/5'}`}>
                               <div className={`p-2 rounded-full mt-1 ${item.type === 'announcement' ? 'bg-primary/10' : 'bg-destructive/10'}`}>
                                    {item.type === 'announcement' ? (
                                        <Bell className="h-5 w-5 text-primary flex-shrink-0" />
                                    ) : (
                                        <ShieldAlert className="h-5 w-5 text-destructive flex-shrink-0" />
                                    )}
                               </div>
                               <div className="flex-1">
                                    <h3 className="font-semibold text-base">{item.title}</h3>
                                     <p className="text-xs text-muted-foreground/90">{format(new Date(item.date), 'MMMM do, yyyy')}</p>
                               </div>
                           </div>
                           <CardContent className="p-4 pt-2">
                               <p className="text-sm text-muted-foreground">{item.message}</p>
                           </CardContent>
                       </Card>
                    ))}
                </div>
            ) : (
                <div className="flex h-40 items-center justify-center text-sm text-muted-foreground text-center">
                    <p>You have no notifications yet.</p>
                </div>
            )}
            <audio ref={audioRef} src="https://assets.mixkit.co/sfx/preview/mixkit-software-interface-start-2574.mp3" preload="auto" className="sr-only"></audio>
        </div>
    );
}
