"use client";

import { useUser, useFirestore, useCollection, useMemoFirebase, deleteDocumentNonBlocking } from '@/firebase';
import { collection, query, orderBy, doc } from 'firebase/firestore';
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
    const { user } = useUser();
    const firestore = useFirestore();

    const notificationsQuery = useMemoFirebase(
        () => user ? query(collection(firestore, 'users', user.uid, 'notifications'), orderBy('timestamp', 'desc')) : null,
        [user, firestore]
    );

    const { data: notifications, isLoading } = useCollection<Notification>(notificationsQuery);

    const handleDelete = (notificationId: string) => {
        if (!user) return;
        const notifDocRef = doc(firestore, 'users', user.uid, 'notifications', notificationId);
        deleteDocumentNonBlocking(notifDocRef);
    };

    const handleClearAll = () => {
        if (!user || !notifications) return;
        notifications.forEach(notif => {
            const notifDocRef = doc(firestore, 'users', user.uid, 'notifications', notif.id);
            deleteDocumentNonBlocking(notifDocRef);
        });
    };
    
    const getFormattedTime = (timestamp: any) => {
        if (!timestamp) return '...';
        try {
            return formatDistanceToNow(timestamp.toDate(), { addSuffix: true });
        } catch {
            return 'a while ago';
        }
    }

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
                <div className="flex flex-col items-center justify-center h-full text-center text-muted-foreground">
                    <BellRing className="h-12 w-12 mb-4" />
                    <h3 className="text-lg font-semibold">No New Notifications</h3>
                    <p className="text-sm">We'll let you know when there's something new.</p>
                </div>
            )}
            {!isLoading && notifications && notifications.length > 0 && (
                <div className="flex flex-col gap-4 flex-1">
                    {notifications.map((notification) => (
                        <div key={notification.id}>
                            <div className="flex items-start gap-4">
                               <div className="bg-secondary p-3 rounded-full">
                                 {notificationIcons[notification.icon || notification.type] || notificationIcons['general']}
                               </div>
                               <div className="flex-1">
                                    <p className="font-semibold">{notification.title}</p>
                                    <p className="text-sm text-muted-foreground">{notification.description}</p>
                                    <p className="text-xs text-muted-foreground/70 mt-1">{getFormattedTime(notification.timestamp)}</p>
                               </div>
                               <Button variant="ghost" size="icon" className="h-7 w-7 shrink-0" onClick={() => handleDelete(notification.id)}>
                                    <Trash2 className="h-4 w-4 text-muted-foreground" />
                               </Button>
                            </div>
                            <Separator className="mt-4"/>
                        </div>
                    ))}
                </div>
            )}
             <Button variant="outline" className="mt-auto" onClick={handleClearAll} disabled={!notifications || notifications.length === 0}>
                Clear All
            </Button>
        </div>
    );
}
