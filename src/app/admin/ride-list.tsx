'use client';

import { useCollection, useFirestore, useMemoFirebase } from '@/firebase';
import { collection, query, orderBy } from 'firebase/firestore';
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
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
import { RideRow } from './ride-row';
import type { Ride } from '@/lib/data';

export function RideList() {
  const firestore = useFirestore();
  const ridesQuery = useMemoFirebase(
    () => query(collection(firestore, 'rides'), orderBy('startTime', 'desc')),
    [firestore]
  );
  const { data: rides, isLoading } = useCollection<Ride>(ridesQuery);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Ride Monitoring</CardTitle>
        <CardDescription>A real-time overview of all rides on the platform.</CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading && (
            <div className="space-y-2">
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-12 w-full" />
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
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {rides && rides.map(ride => (
                        <RideRow key={ride.id} ride={ride} />
                    ))}
                    {(!rides || rides.length === 0) && (
                        <TableRow>
                            <TableCell colSpan={6} className="h-24 text-center">No rides found.</TableCell>
                        </TableRow>
                    )}
                </TableBody>
            </Table>
        )}
      </CardContent>
    </Card>
  );
}
