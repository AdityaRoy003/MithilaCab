'use client';

import { useMemo } from 'react';
import { useCollection, useFirestore, useMemoFirebase } from '@/firebase';
import { collection, query, where, Timestamp } from 'firebase/firestore';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
import { RideRow } from '../ride-row';
import type { Ride } from '@/lib/data';
import { Flag } from 'lucide-react';

export function EmergencyFlagsList() {
  const firestore = useFirestore();

  // Remove orderBy from the query to avoid needing a composite index
  const ridesQuery = useMemoFirebase(
    () => query(collection(firestore, 'rides'), where('isFlagged', '==', true)),
    [firestore]
  );
  const { data: unsortedRides, isLoading } = useCollection<Ride>(ridesQuery);

  // Sort the rides on the client-side
  const rides = useMemo(() => {
    if (!unsortedRides) return null;
    return [...unsortedRides].sort((a, b) => {
        const timeA = a.startTime instanceof Timestamp ? a.startTime.toDate().getTime() : 0;
        const timeB = b.startTime instanceof Timestamp ? b.startTime.toDate().getTime() : 0;
        return timeB - timeA; // Descending order
    });
  }, [unsortedRides]);


  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2"><Flag /> Emergency Ride Flags</CardTitle>
        <CardDescription>Review rides that were flagged for safety emergencies.</CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading && (
            <div className="space-y-2">
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-12 w-full" />
            </div>
        )}
        {!isLoading && (
            <Table>
                <TableHeader>
                    <TableRow>
                    <TableHead>Status</TableHead>
                    <TableHead>Passenger</TableHead>
                    <TableHead>Driver</TableHead>
                    <TableHead className="hidden md:table-cell">Trip</TableHead>
                    <TableHead className="text-right">Fare</TableHead>
                    <TableHead className="hidden md:table-cell text-right">Date</TableHead>
                    <TableHead><span className="sr-only">Actions</span></TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {rides && rides.map(ride => (
                        <RideRow key={ride.id} ride={ride} />
                    ))}
                    {(!rides || rides.length === 0) && (
                        <TableRow>
                            <TableCell colSpan={7} className="h-24 text-center">No emergency flags to show.</TableCell>
                        </TableRow>
                    )}
                </TableBody>
            </Table>
        )}
      </CardContent>
    </Card>
  );
}
