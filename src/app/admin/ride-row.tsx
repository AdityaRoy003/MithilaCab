'use client';

import { useDoc, useFirestore, useMemoFirebase } from '@/firebase';
import { doc, Timestamp } from 'firebase/firestore';
import { TableCell, TableRow } from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { IndianRupee, MoreHorizontal } from 'lucide-react';
import type { Ride, Driver } from '@/lib/data';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';

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
    const { toast } = useToast();

    const driverDocRef = useMemoFirebase(() => ride.driverId ? doc(firestore, 'drivers', ride.driverId) : null, [firestore, ride.driverId]);
    const { data: driver, isLoading: driverLoading } = useDoc<Driver>(driverDocRef);
    
    const handleNotImplemented = () => {
        toast({
            title: "Feature Coming Soon",
            description: "This functionality will be available in a future update.",
        });
    };

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
            <TableCell>
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button aria-haspopup="true" size="icon" variant="ghost">
                            <MoreHorizontal className="h-4 w-4" />
                            <span className="sr-only">Toggle menu</span>
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={handleNotImplemented}>Manually Assign Driver</DropdownMenuItem>
                        <DropdownMenuItem onClick={handleNotImplemented}>View Cancellation Details</DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </TableCell>
        </TableRow>
    );
}
