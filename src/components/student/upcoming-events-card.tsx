
'use client';

import { useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Leave, Holiday } from "@/lib/data";
import { UserX, Utensils, Sun, Moon, Trash2, CalendarDays } from "lucide-react";
import { format, startOfDay } from 'date-fns';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useToast } from '@/hooks/use-toast';
import { doc, deleteDoc, writeBatch } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import Link from 'next/link';
import { Badge } from '../ui/badge';
import { cn } from '@/lib/utils';
import { onLeavesUpdate } from '@/lib/listeners/leaves';

type UpcomingEvent = 
    | { type: 'leave'; data: Leave }
    | { type: 'holiday'; data: Holiday };

interface UpcomingEventsCardProps {
    leaves: Leave[];
    holidays: Holiday[];
    isLoading: boolean;
    showFooter?: boolean;
}

export function UpcomingEventsCard({ leaves, holidays, isLoading, showFooter = true }: UpcomingEventsCardProps) {
    const { toast } = useToast();
    const today = useMemo(() => startOfDay(new Date()), []);
    
    const upcomingEvents = useMemo(() => {
        const rawUpcomingLeaves = leaves
            .filter(l => l.date >= today && l.name !== 'Plan Activation')
            .sort((a, b) => a.date.getTime() - b.date.getTime());

        const leavesByDate = new Map<string, Leave[]>();
        for (const leave of rawUpcomingLeaves) {
            const dateKey = format(leave.date, 'yyyy-MM-dd');
            if (!leavesByDate.has(dateKey)) {
                leavesByDate.set(dateKey, []);
            }
            leavesByDate.get(dateKey)!.push(leave);
        }
        
        const mergedLeaves: Leave[] = [];
        for (const [dateKey, dateLeaves] of leavesByDate.entries()) {
            if (dateLeaves.length === 1) {
                mergedLeaves.push(dateLeaves[0]);
                continue;
            }
            const hasFullDay = dateLeaves.some(l => l.type === 'full_day');
            const hasLunch = dateLeaves.some(l => l.type === 'lunch_only');
            const hasDinner = dateLeaves.some(l => l.type === 'dinner_only');
            if (hasFullDay || (hasLunch && hasDinner)) {
                const representativeLeave = dateLeaves[0];
                mergedLeaves.push({ ...representativeLeave, id: `${dateKey}-merged`, type: 'full_day' });
            } else {
                mergedLeaves.push(...dateLeaves);
            }
        }

        const leaveEvents: UpcomingEvent[] = mergedLeaves.map(data => ({ type: 'leave', data }));
        
        const holidayEvents: UpcomingEvent[] = holidays
            .filter(h => h.date >= today)
            .map(data => ({ type: 'holiday', data }));

        return [...leaveEvents, ...holidayEvents].sort((a, b) => a.data.date.getTime() - b.data.date.getTime());

    }, [leaves, holidays, today]);

    const handleDeleteLeave = async (leave: Leave) => {
        try {
            if (leave.id.endsWith('-merged')) {
                const dateKey = format(leave.date, 'yyyy-MM-dd');
                const partialLeavesToDelete = leaves.filter(l => format(l.date, 'yyyy-MM-dd') === dateKey && (l.type === 'lunch_only' || l.type === 'dinner_only'));

                if (partialLeavesToDelete.length > 0) {
                    const batch = writeBatch(db);
                    partialLeavesToDelete.forEach(l => batch.delete(doc(db, 'leaves', l.id)));
                    await batch.commit();
                    toast({ title: "Full Day Leave Cancelled" });
                }
            } else {
                const docRef = doc(db, 'leaves', leave.id);
                await deleteDoc(docRef);
                toast({ title: "Leave Cancelled" });
            }
        } catch (error) {
          toast({ variant: "destructive", title: "Error", description: "Failed to cancel leave." });
        }
    };

    return (
        <Card className="animate-in fade-in-0 zoom-in-95 duration-500 delay-400 flex flex-col h-full">
            <CardHeader>
                <div className="flex items-center justify-between">
                    <CardTitle>Upcoming Events</CardTitle>
                    <CalendarDays className="h-5 w-5 text-primary" />
                </div>
                <CardDescription>Your upcoming leaves and mess holidays.</CardDescription>
            </CardHeader>
            <CardContent className="flex-grow p-2 pt-0">
                <ScrollArea className="h-[230px]">
                    <div className="p-4 pt-0 space-y-2">
                        {isLoading ? (
                            <div className="flex h-full items-center justify-center text-sm text-muted-foreground text-center py-4"><p>Loading schedule...</p></div>
                        ) : upcomingEvents.length > 0 ? (
                            upcomingEvents.map((event) => {
                                const isLeave = event.type === 'leave';
                                const data = event.data;
                                const key = `${event.type}-${isLeave ? event.data.id : event.data.date.toISOString()}`;
                                
                                const Icon = isLeave 
                                    ? (data.type === 'full_day' ? Utensils : data.type === 'lunch_only' ? Sun : Moon) 
                                    : (data.type === 'full_day' ? Utensils : data.type === 'lunch_only' ? Sun : Moon);
                                
                                const iconColor = isLeave ? 'text-destructive' : 'text-orange-500';
                                
                                const title = isLeave ? `Leave` : data.name;
                                const description = `${format(data.date, 'EEEE, MMM do')} - ${data.type.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}`;

                                return (
                                    <div key={key} className="flex items-center justify-between rounded-lg p-2.5 bg-secondary/50">
                                        <div className="flex items-center gap-3">
                                            <Icon className={cn("h-5 w-5 flex-shrink-0", iconColor)} />
                                            <div>
                                                <div className="flex items-center gap-2">
                                                    <p className="font-semibold text-sm">{title}</p>
                                                    <Badge variant={isLeave ? 'destructive' : 'secondary'} className={cn('bg-opacity-20 capitalize', isLeave ? 'bg-destructive/20 text-destructive' : 'bg-orange-500/20 text-orange-400')}>{isLeave ? 'Leave' : 'Holiday'}</Badge>
                                                </div>
                                                <p className="text-xs text-muted-foreground">{description}</p>
                                            </div>
                                        </div>
                                        {isLeave && (
                                             <AlertDialog>
                                                <AlertDialogTrigger asChild>
                                                    <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:bg-destructive/10 hover:text-destructive">
                                                        <Trash2 className="h-4 w-4" />
                                                    </Button>
                                                </AlertDialogTrigger>
                                                <AlertDialogContent>
                                                    <AlertDialogHeader>
                                                        <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                                                        <AlertDialogDescription>
                                                            This action will cancel your leave for {format(data.date, 'MMMM do, yyyy')}.
                                                        </AlertDialogDescription>
                                                    </AlertDialogHeader>
                                                    <AlertDialogFooter>
                                                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                        <AlertDialogAction onClick={() => handleDeleteLeave(data as Leave)}>Confirm</AlertDialogAction>
                                                    </AlertDialogFooter>
                                                </AlertDialogContent>
                                            </AlertDialog>
                                        )}
                                    </div>
                                );
                            })
                        ) : (
                            <div className="flex h-full items-center justify-center text-sm text-muted-foreground text-center py-4">
                                <p>No upcoming leaves or holidays.</p>
                            </div>
                        )}
                    </div>
                </ScrollArea>
            </CardContent>
            {showFooter && (
                <CardFooter>
                    <Button asChild className="w-full" variant="outline">
                        <Link href="/student/leave?tab=apply">
                            Apply for Leave
                        </Link>
                    </Button>
                </CardFooter>
            )}
        </Card>
    );
}
