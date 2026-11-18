'use client';

import { useState, useEffect } from 'react';
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
import { RideRow } from './ride-row';
import type { Ride } from '@/lib/data';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export function RideList() {
  const [rides, setRides] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetch('/api/rides')
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data && data.rides) {
          const formatted = data.rides.map((r: any) => ({
            id: r.id || r._id,
            status: r.status === 'requested' ? 'Pending' : r.status === 'completed' ? 'Completed' : r.status === 'in_progress' ? 'In Progress' : 'Confirmed',
            passengerName: r.riderName || 'Rider',
            driverName: r.captain?.name || (r.status === 'requested' ? 'Unassigned' : 'Assigned'),
            fare: r.fareAmount || 0,
            pickupLocation: r.pickupLocation,
            destinationLocation: r.destinationLocation,
            startTime: r.createdAt || new Date(),
          }));
          setRides(formatted);
        }
      })
      .catch(() => {})
      .finally(() => setIsLoading(false));
  }, []);

  return (
    <Card className="rounded-2xl shadow-sm border">
      <CardHeader className="flex-row items-center justify-between">
        <div>
          <CardTitle>Recent Rides</CardTitle>
          <CardDescription>A live list of recent trip requests in Mithilanchal.</CardDescription>
        </div>
        <Button asChild size="sm" variant="outline" className="rounded-xl font-bold">
          <Link href="/admin/rides">View All</Link>
        </Button>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-2">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
          </div>
        ) : (
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
              {rides && rides.map((ride) => (
                <RideRow key={ride.id} ride={ride} />
              ))}
              {(!rides || rides.length === 0) && (
                <TableRow>
                  <TableCell colSpan={5} className="h-24 text-center text-muted-foreground">
                    No rides found in database.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}
