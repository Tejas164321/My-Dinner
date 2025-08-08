
'use client';

import { useState, useEffect, useMemo } from 'react';
import { useAuth } from '@/contexts/auth-context';
import { onJoinRequestsUpdate, onPlanChangeRequestsUpdate } from '@/lib/listeners/requests';
import type { JoinRequest, PlanChangeRequest } from '@/lib/data';
import { NotificationCard, type NotificationItem } from '@/components/shared/notification-card';
import { Loader2, BellOff, UserPlus, GitCompareArrows } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function AdminNotificationsPage() {
    const { user: adminUser } = useAuth();
    const [joinRequests, setJoinRequests] = useState<JoinRequest[]>([]);
    const [planChangeRequests, setPlanChangeRequests] = useState<PlanChangeRequest[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!adminUser) {
            setLoading(false);
            return;
        }
        setLoading(true);

        const unsubJoin = onJoinRequestsUpdate(adminUser.uid, setJoinRequests);
        const unsubPlan = onPlanChangeRequestsUpdate(adminUser.uid, setPlanChangeRequests);
        
        Promise.all([
             new Promise(res => onJoinRequestsUpdate(adminUser.uid, d => { setJoinRequests(d); res(d); })),
             new Promise(res => onPlanChangeRequestsUpdate(adminUser.uid, d => { setPlanChangeRequests(d); res(d); })),
        ]).then(() => {
             setLoading(false);
        })

        return () => {
            unsubJoin();
            unsubPlan();
        };
    }, [adminUser]);

    const combinedNotifications = useMemo(() => {
        const joinNotifs: NotificationItem[] = joinRequests.map(req => ({
            id: `join-${req.id}`,
            date: req.date,
            title: 'New Join Request',
            message: `${req.name} has requested to join your mess.`,
            type: 'join_request',
            href: '/admin/students?tab=requests'
        }));

        const planNotifs: NotificationItem[] = planChangeRequests.map(req => ({
            id: `plan-${req.id}`,
            date: req.date,
            title: 'Plan Change Request',
            message: `${req.studentName} wants to change from "${req.fromPlan.replace('_', ' ')}" to "${req.toPlan.replace('_', ' ')}".`,
            type: 'plan_request',
            href: '/admin/students?tab=plan_requests'
        }));
        
        const all = [...joinNotifs, ...planNotifs];
        
        return all.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    }, [joinRequests, planChangeRequests]);

    return (
        <div className="flex flex-col gap-8 animate-in fade-in-0 slide-in-from-top-5 duration-700">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <h1 className="text-2xl font-bold tracking-tight">Notifications</h1>
            </div>

            <Alert>
                <UserPlus className="h-4 w-4" />
                <AlertTitle>Your Activity Feed</AlertTitle>
                <AlertDescription>
                   This feed shows you all pending student requests that require your action.
                </AlertDescription>
            </Alert>
            
            <div className="space-y-4">
                 {loading ? (
                    <div className="flex h-40 items-center justify-center text-sm text-muted-foreground">
                        <Loader2 className="h-6 w-6 animate-spin" />
                    </div>
                ) : combinedNotifications.length > 0 ? (
                    combinedNotifications.map((item) => {
                       const Icon = item.type === 'join_request' ? UserPlus : GitCompareArrows;
                       return (
                            <NotificationCard 
                                key={item.id}
                                {...item}
                                icon={<Icon className="h-5 w-5 text-primary" />}
                                actionButton={
                                    <Button asChild size="sm">
                                        <Link href={item.href || '#'}>View</Link>
                                    </Button>
                                }
                            />
                       )
                    })
                ) : (
                    <div className="flex flex-col items-center justify-center text-center text-muted-foreground h-40 border-2 border-dashed rounded-lg">
                        <BellOff className="h-10 w-10 mb-4" />
                        <h3 className="text-lg font-semibold text-foreground">All Caught Up!</h3>
                        <p>You have no pending requests.</p>
                    </div>
                )}
            </div>
        </div>
    )
}
