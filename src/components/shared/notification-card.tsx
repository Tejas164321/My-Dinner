
'use client';

import type { ReactNode } from 'react';
import { format } from 'date-fns';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { Bell, ShieldAlert } from 'lucide-react';

export interface NotificationItem {
    id: string;
    date: string; // ISO string
    title: string;
    message: string;
    type: 'announcement' | 'billing' | 'request_status' | 'general' | 'join_request' | 'plan_request';
    href?: string;
}

interface NotificationCardProps extends NotificationItem {
    icon?: ReactNode;
    actionButton?: ReactNode;
}

export function NotificationCard({ 
    id, 
    date, 
    title, 
    message, 
    type,
    href, 
    icon,
    actionButton
}: NotificationCardProps) {

    const isAnnouncement = type === 'announcement';
    const isBilling = type === 'billing';

    const baseClass = 'overflow-hidden transition-all hover:border-primary/50';
    const borderColor = isAnnouncement ? 'border-primary/20' : (isBilling ? 'border-destructive/20' : 'border-secondary');
    const bgClass = isAnnouncement ? 'bg-primary/5' : (isBilling ? 'bg-destructive/5' : 'bg-secondary/20');
    const iconBgClass = isAnnouncement ? 'bg-primary/10' : (isBilling ? 'bg-destructive/10' : 'bg-secondary/50');
    
    const DefaultIcon = isBilling ? ShieldAlert : Bell;
    const defaultIconColor = isBilling ? 'text-destructive' : 'text-primary';

    const renderIcon = icon ? <div className={cn('p-2.5 rounded-full mt-1 self-start', iconBgClass)}>{icon}</div> 
                            : <div className={cn('p-2.5 rounded-full mt-1 self-start', iconBgClass)}><DefaultIcon className={cn('h-5 w-5 flex-shrink-0', defaultIconColor)} /></div>;

    return (
        <Card key={id} className={cn(baseClass, borderColor, bgClass)}>
            <div className="p-4 flex items-start gap-4">
                {renderIcon}
                <div className="flex-1">
                    <h3 className="font-semibold text-base">{title}</h3>
                    <p className="text-sm text-muted-foreground mt-1">{message}</p>
                    <p className="text-xs text-muted-foreground/80 mt-3">{format(new Date(date), 'MMMM do, yyyy')}</p>
                </div>
                {actionButton && <div className="self-center">{actionButton}</div>}
            </div>
        </Card>
    );
}
