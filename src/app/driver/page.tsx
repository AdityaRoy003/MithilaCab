'use client';

import { doc, collection, query, where } from 'firebase/firestore';
import AppLayout from '@/components/app-layout';
import {
  useDriver,
  useFirestore,
  updateDocumentNonBlocking,
  useCollection,
  useMemoFirebase,
} from '@/firebase';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import { AvailableRidesList } from './available-rides-list';
import { AssignedRidesList } from './assigned-rides-list';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import type { Ride } from '@/lib/data';

export default function DriverPage() {
  const { driver, isDriverLoading } = useDriver();
  const firestore = useFirestore();
  const router = useRouter();

  const assignedRidesQuery = useMemoFirebase(() => {
    if (!driver) return null;
    return query(
        collection(firestore, 'rides'),
        where('driverId', '==', driver.id),
        where('status', 'in', ['accepted', 'in-progress'])
    );
  }, [firestore, driver]);

  const { data: assignedRides, isLoading: areAssignedRidesLoading } = useCollection<Ride>(assignedRidesQuery);

  const hasAssignedRide = assignedRides && assignedRides.length > 0;

  useEffect(() => {
    if (!isDriverLoading && !driver) {
      router.replace('/home');
    }
  }, [isDriverLoading, driver, router]);

  const isLoading = isDriverLoading || areAssignedRidesLoading;

  if (isLoading || !driver) {
    return (
      <AppLayout>
        <main className="flex-1 flex flex-col p-4 md:p-6 lg:p-8 space-y-8">
          <Skeleton className="h-10 w-64" />
          <Card>
            <CardHeader>
              <Skeleton className="h-8 w-48" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-10 w-full" />
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <Skeleton className="h-8 w-56" />
            </CardHeader>
            <CardContent className="space-y-4">
              <Skeleton className="h-48 w-full" />
              <Skeleton className="h-24 w-full" />
            </CardContent>
          </Card>
        </main>
      </AppLayout>
    );
  }

  const handleAvailabilityChange = (isAvailable: boolean) => {
    const driverRef = doc(firestore, 'drivers', driver.id);
    updateDocumentNonBlocking(driverRef, { isAvailable });
  };

  return (
    <AppLayout>
      <main className="flex-1 flex flex-col p-4 md:p-6 lg:p-8 space-y-8">
        <h1 className="font-headline text-3xl font-bold">Driver Dashboard</h1>

        <AssignedRidesList />
        
        {/* Only show availability toggle and available rides if not currently on a ride */}
        {!hasAssignedRide && (
          <>
            <Card>
              <CardHeader>
                <CardTitle>Your Status</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center space-x-4 rounded-md border p-4">
                  <div className="flex-1 space-y-1">
                    <p className="text-sm font-medium leading-none">
                      Available for rides
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Toggle to start or stop receiving new ride requests.
                    </p>
                  </div>
                  <Switch
                    checked={driver.isAvailable}
                    onCheckedChange={handleAvailabilityChange}
                    aria-label="Toggle driver availability"
                  />
                </div>
              </CardContent>
            </Card>

            {driver.isAvailable && <AvailableRidesList />}
          </>
        )}
      </main>
    </AppLayout>
  );
}
