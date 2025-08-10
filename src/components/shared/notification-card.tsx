
'use client';

import type { ReactNode } from 'react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { Bell, ShieldAlert, GitCompareArrows, UserPlus } from 'lucide-react';
import Link from 'next/link';

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

const typeInfo = {
    announcement: { icon: Bell, color: 'text-primary' },
    billing: { icon: ShieldAlert, color: 'text-destructive' },
    join_request: { icon: UserPlus, color: 'text-primary' },
    plan_request: { icon: GitCompareArrows, color: 'text-primary' },
    request_status: { icon: Bell, color: 'text-primary' },
    general: { icon: Bell, color: 'text-primary' },
};

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
    const info = typeInfo[type] || typeInfo.general;
    const Icon = info.icon;
    const iconColor = info.color;
    
    const isAnnouncement = type === 'announcement';
    const isBilling = type === 'billing';

    const baseClass = 'overflow-hidden transition-all duration-300 rounded-lg';
    const bgClass = isAnnouncement ? 'bg-primary/5 hover:bg-primary/10' : (isBilling ? 'bg-destructive/5 hover:bg-destructive/10' : 'bg-secondary/30 hover:bg-secondary/50');
    const iconBgClass = isAnnouncement ? 'bg-primary/10' : (isBilling ? 'bg-destructive/10' : 'bg-secondary/50');
    
    const renderIcon = icon ? <div className={cn('p-2.5 rounded-full self-start', iconBgClass)}>{icon}</div> 
                            : <div className={cn('p-2 rounded-full mt-1 self-start', iconBgClass)}><Icon className={cn('h-4 w-4 flex-shrink-0', iconColor)} /></div>;

    const Wrapper = href && !actionButton ? Link : 'div';

    return (
        <Wrapper href={href || '#'} className={cn('block', Wrapper === 'div' && 'cursor-default')}>
            <div key={id} className={cn(baseClass, bgClass, 'p-3 flex items-start gap-3')}>
                {renderIcon}
                <div className="flex-1">
                    <h3 className="font-semibold text-sm line-clamp-1">{title}</h3>
                    <p className="text-xs text-muted-foreground line-clamp-2">{message}</p>
                    <p className="text-[10px] text-muted-foreground/80 mt-1.5">{format(new Date(date), 'MMM do, yyyy')}</p>
                </div>
                {actionButton && <div className="self-center">{actionButton}</div>}
            </div>
        </Wrapper>
    );
}
