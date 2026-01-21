'use client';

import { useCollection, useFirestore, useMemoFirebase } from '@/firebase';
import { collection, query, orderBy, limit } from 'firebase/firestore';
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
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export function RideList() {
  const firestore = useFirestore();
  const ridesQuery = useMemoFirebase(
    () => query(collection(firestore, 'rides'), orderBy('startTime', 'desc'), limit(5)),
    [firestore]
  );
  const { data: rides, isLoading } = useCollection<Ride>(ridesQuery);

  return (
    <Card>
      <CardHeader className='flex-row items-center justify-between'>
          <div>
              <CardTitle>Recent Rides</CardTitle>
              <CardDescription>A list of the most recent rides across the platform.</CardDescription>
          </div>
          <Button asChild variant="outline">
              <Link href="/admin/rides">View All</Link>
          </Button>
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
                    <TableHead className="hidden md:table-cell">Driver</TableHead>
                    <TableHead className="text-right">Fare</TableHead>
                    <TableHead><span className="sr-only">Actions</span></TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {rides && rides.map(ride => (
                        <RideRow key={ride.id} ride={ride} />
                    ))}
                    {(!rides || rides.length === 0) && (
                        <TableRow>
                            <TableCell colSpan={5} className="h-24 text-center">No rides found.</TableCell>
                        </TableRow>
                    )}
                </TableBody>
            </Table>
        )}
      </CardContent>
    </Card>
  );
}
