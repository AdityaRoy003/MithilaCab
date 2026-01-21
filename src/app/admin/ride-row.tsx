'use client';

import { useDoc, useFirestore, useMemoFirebase } from '@/firebase';
import { doc, Timestamp } from 'firebase/firestore';
import { TableCell, TableRow } from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { IndianRupee } from 'lucide-react';
import type { Ride, Driver } from '@/lib/data';

interface RideRowProps {
    ride: Ride;
}

const statusVariant: { [key: string]: "default" | "secondary" | "destructive" | "outline" } = {
  completed: 'default',
  cancelled: 'destructive',
  requested: 'outline',
  accepted: 'outline',
  'in-progress': 'outline',
};

export function RideRow({ ride }: RideRowProps) {
    const firestore = useFirestore();

    const driverDocRef = useMemoFirebase(() => ride.driverId ? doc(firestore, 'drivers', ride.driverId) : null, [firestore, ride.driverId]);
    const { data: driver, isLoading: driverLoading } = useDoc<Driver>(driverDocRef);

    const getFormattedDate = (date: any) => {
        if (!date) return 'N/A';
        try {
            if (date instanceof Timestamp) {
                return format(date.toDate(), "PP p");
            }
            const d = new Date(date);
            if (!isNaN(d.getTime())) return format(d, "PP p");
            return 'Invalid Date';
        } catch (e) {
            return 'Invalid Date';
        }
    }

    return (
        <TableRow>
            <TableCell>
                 {ride.status && <Badge variant={statusVariant[ride.status] || 'secondary'}>{ride.status}</Badge>}
            </TableCell>
            <TableCell>
                <div className="flex items-center gap-3">
                    <Avatar className="hidden h-9 w-9 sm:flex">
                        <AvatarImage src={ride.passenger?.photoURL ?? undefined} alt={ride.passenger?.name ?? 'P'} />
                        <AvatarFallback>{ride.passenger?.name?.charAt(0) ?? 'P'}</AvatarFallback>
                    </Avatar>
                    <div className="font-medium">{ride.passenger?.name ?? 'Passenger'}</div>
                </div>
            </TableCell>
            <TableCell>
                 {driverLoading ? <Skeleton className="h-5 w-24" /> : (
                    <div className="font-medium">{driver?.name ?? 'Unassigned'}</div>
                 )}
            </TableCell>
            <TableCell className="hidden md:table-cell">
                <div className="text-sm font-medium">{ride.pickupLocation}</div>
                <div className="text-xs text-muted-foreground">{ride.destinationLocation}</div>
            </TableCell>
            <TableCell className="text-right font-mono flex items-center justify-end">
                <IndianRupee className="h-4 w-4 text-muted-foreground" />
                {ride.fareAmount?.toFixed(2)}
            </TableCell>
             <TableCell className="hidden md:table-cell text-right text-xs text-muted-foreground">
                {getFormattedDate(ride.startTime)}
            </TableCell>
        </TableRow>
    );
}
