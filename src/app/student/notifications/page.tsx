
'use client';

import { useMemo, useState, useEffect, useRef } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Announcement, type AppUser, type PersonalNotification } from '@/lib/data';
import { onAnnouncementsUpdate } from '@/lib/listeners/announcements';
import { onNotificationsUpdate } from '@/lib/listeners/notifications';
import { Bell, Rss, ShieldAlert, Loader2 } from 'lucide-react';
import { format } from 'date-fns';
import { useAuth } from '@/contexts/auth-context';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';


type CombinedNotification = (Announcement & { docType: 'announcement' }) | (PersonalNotification & { docType: 'notification' });

export default function StudentNotificationsPage() {
    const { user } = useAuth();
    const [announcements, setAnnouncements] = useState<Announcement[]>([]);
    const [personalNotifications, setPersonalNotifications] = useState<PersonalNotification[]>([]);
    const [announcementsLoading, setAnnouncementsLoading] = useState(true);
    const [personalNotificationsLoading, setPersonalNotificationsLoading] = useState(true);

    const audioRef = useRef<HTMLAudioElement>(null);
    const initialLoadDone = useRef(false);

    useEffect(() => {
        if (!user || !user.messId) {
            setAnnouncementsLoading(false);
            setPersonalNotificationsLoading(false);
            return;
        }

        const unsubAnnouncements = onAnnouncementsUpdate(user.messId, (data) => {
            if (initialLoadDone.current && data.length > announcements.length) {
                audioRef.current?.play().catch(e => console.error("Error playing audio:", e));
            }
            setAnnouncements(data);
            setAnnouncementsLoading(false);
        });
        
        const unsubPersonal = onNotificationsUpdate(user.uid, (data) => {
             if (initialLoadDone.current && data.length > personalNotifications.length) {
                audioRef.current?.play().catch(e => console.error("Error playing audio:", e));
            }
            setPersonalNotifications(data);
            setPersonalNotificationsLoading(false);
        });

        // Set initial load flag after the first data fetch for both listeners
        Promise.all([
             new Promise(res => onAnnouncementsUpdate(user.messId, res)),
             new Promise(res => onNotificationsUpdate(user.uid, res)),
        ]).then(() => {
            if (!initialLoadDone.current) {
                initialLoadDone.current = true;
            }
        });
        
        return () => {
            unsubAnnouncements();
            unsubPersonal();
        };
    }, [user, announcements.length, personalNotifications.length]);

    const combinedNotifications = useMemo(() => {
        const liveAnnouncements: CombinedNotification[] = announcements.map(ann => ({ ...ann, docType: 'announcement' }));
        const livePersonal: CombinedNotification[] = personalNotifications.map(pn => ({ ...pn, docType: 'notification' }));

        const allNotifications = [...liveAnnouncements, ...livePersonal];

        return allNotifications.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    }, [announcements, personalNotifications]);

    const isLoading = announcementsLoading || personalNotificationsLoading;

    return (
        <div className="flex flex-col gap-8 animate-in fade-in-0 slide-in-from-top-5 duration-700">
            <h1 className="text-2xl font-bold tracking-tight">Notifications</h1>
            
            <Alert>
                <Rss className="h-4 w-4" />
                <AlertTitle>Your Notification Feed</AlertTitle>
                <AlertDescription>
                   This feed contains general announcements from the mess and personal alerts just for you.
                </AlertDescription>
            </Alert>
            
            <div className="space-y-4">
                {isLoading ? (
                    <div className="flex h-40 items-center justify-center text-sm text-muted-foreground">
                        <Loader2 className="h-6 w-6 animate-spin" />
                    </div>
                ) : combinedNotifications.length > 0 ? (
                    combinedNotifications.map((item) => {
                       const isAnnouncement = item.docType === 'announcement';
                       const isBilling = !isAnnouncement && item.type === 'billing';
                       
                       const baseClass = 'overflow-hidden transition-all hover:border-primary/50';
                       const borderColor = isAnnouncement ? 'border-primary/20' : (isBilling ? 'border-destructive/20' : 'border-secondary');
                       
                       const bgClass = isAnnouncement ? 'bg-primary/5' : (isBilling ? 'bg-destructive/5' : 'bg-secondary/20');
                       const iconBgClass = isAnnouncement ? 'bg-primary/10' : (isBilling ? 'bg-destructive/10' : 'bg-secondary/50');

                       const Icon = isAnnouncement ? Bell : (isBilling ? ShieldAlert : Bell);
                       const iconColor = isAnnouncement ? 'text-primary' : (isBilling ? 'text-destructive' : 'text-primary');

                       return (
                         <Card key={`${item.docType}-${item.id}`} className={cn(baseClass, borderColor)}>
                           <div className={cn('p-4 flex items-start gap-4', bgClass)}>
                               <div className={cn('p-2 rounded-full mt-1', iconBgClass)}>
                                   <Icon className={cn('h-5 w-5 flex-shrink-0', iconColor)} />
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
                       )
                    })
                ) : (
                    <div className="flex flex-col items-center justify-center text-center text-muted-foreground h-40 border-2 border-dashed rounded-lg">
                        <Bell className="h-10 w-10 mb-4" />
                        <h3 className="text-lg font-semibold text-foreground">No Notifications Yet</h3>
                        <p>Announcements and personal alerts will appear here.</p>
                    </div>
                )}
            </div>

            <audio ref={audioRef} src="https://assets.mixkit.co/sfx/preview/mixkit-software-interface-start-2574.mp3" preload="auto" className="sr-only"></audio>
        </div>
    );
}
