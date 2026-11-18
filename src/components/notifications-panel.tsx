"use client";

import { useState, useEffect } from "react";
import { BellRing, CheckCheck, XCircle, ShoppingBag, AlertTriangle, Trash2 } from "lucide-react";
import { Button } from "./ui/button";
import { Skeleton } from './ui/skeleton';
import { formatDistanceToNow } from 'date-fns';
import type { Notification } from '@/lib/data';
import { Separator } from './ui/separator';

const notificationIcons: { [key: string]: React.ReactNode } = {
    'ride_update': <BellRing className="h-6 w-6 text-primary" />,
    'promotion': <ShoppingBag className="h-6 w-6 text-accent" />,
    'account_alert': <AlertTriangle className="h-6 w-6 text-destructive" />,
    'general': <BellRing className="h-6 w-6 text-muted-foreground" />,
    'ride_completed': <CheckCheck className="h-6 w-6 text-green-500" />,
    'ride_cancelled': <XCircle className="h-6 w-6 text-destructive" />,
};

export function NotificationsPanel() {
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        fetch('/api/notifications')
            .then((r) => (r.ok ? r.json() : null))
            .then((d) => {
                if (d && d.notifications) {
                    setNotifications(d.notifications);
                }
            })
            .catch(() => { })
            .finally(() => setIsLoading(false));
    }, []);

    const handleDelete = (notificationId: string) => {
        setNotifications((prev) => prev.filter((n) => n.id !== notificationId));
    };

    const handleClearAll = () => {
        setNotifications([]);
    };

    const getFormattedTime = (timestamp: any) => {
        if (!timestamp) return 'Just now';
        try {
            const date = typeof timestamp === 'string' ? new Date(timestamp) : timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
            return formatDistanceToNow(date, { addSuffix: true });
        } catch {
            return 'a while ago';
        }
    };

    return (
        <div className="py-4 flex flex-col h-full">
            {isLoading && (
                <div className="flex flex-col gap-4">
                    <div className="flex items-start gap-4">
                        <Skeleton className="h-12 w-12 rounded-full" />
                        <div className="flex-1 space-y-2">
                            <Skeleton className="h-4 w-1/2" />
                            <Skeleton className="h-4 w-full" />
                            <Skeleton className="h-3 w-1/4" />
                        </div>
                    </div>
                    <div className="flex items-start gap-4">
                        <Skeleton className="h-12 w-12 rounded-full" />
                        <div className="flex-1 space-y-2">
                            <Skeleton className="h-4 w-1/2" />
                            <Skeleton className="h-4 w-full" />
                            <Skeleton className="h-3 w-1/4" />
                        </div>
                    </div>
                </div>
            )}

            {!isLoading && (!notifications || notifications.length === 0) && (
                <div className="flex flex-col items-center justify-center h-full text-center text-muted-foreground py-12">
                    <BellRing className="h-12 w-12 mb-4 text-muted-foreground/60" />
                    <h3 className="text-lg font-semibold text-foreground">No New Notifications</h3>
                    <p className="text-sm text-muted-foreground">We&apos;ll notify you when there are updates on your rides.</p>
                </div>
            )}

            {!isLoading && notifications && notifications.length > 0 && (
                <div className="flex flex-col gap-4 flex-1 overflow-y-auto">
                    {notifications.map((notification) => (
                        <div key={notification.id}>
                            <div className="flex items-start gap-3.5">
                                <div className="bg-secondary p-2.5 rounded-full shrink-0">
                                    {notificationIcons[notification.icon || notification.type] || notificationIcons['general']}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="font-semibold text-sm text-foreground">{notification.title}</p>
                                    <p className="text-xs text-muted-foreground leading-relaxed mt-0.5">{notification.description}</p>
                                    <p className="text-[10px] text-muted-foreground/70 mt-1">{getFormattedTime(notification.timestamp)}</p>
                                </div>
                                <Button variant="ghost" size="icon" className="h-7 w-7 shrink-0 text-muted-foreground hover:text-destructive" onClick={() => handleDelete(notification.id)}>
                                    <Trash2 className="h-4 w-4" />
                                    <span className="sr-only">Delete</span>
                                </Button>
                            </div>
                            <Separator className="mt-3.5" />
                        </div>
                    ))}
                </div>
            )}

            <Button
                variant="outline"
                className="mt-auto font-bold rounded-xl"
                onClick={handleClearAll}
                disabled={!notifications || notifications.length === 0}
            >
                Clear All
            </Button>
        </div>
    );
}
