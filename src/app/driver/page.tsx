'use client';

import { doc, collection, query, where } from 'firebase/firestore';
import Link from 'next/link';
import AppLayout from '@/components/app-layout';
import {
  useDriver,
  useFirestore,
  updateDocumentNonBlocking,
  useCollection,
  useMemoFirebase,
} from '@/firebase';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import { AvailableRidesList } from './available-rides-list';
import { AssignedRidesList } from './assigned-rides-list';
import type { Ride } from '@/lib/data';
import { MapPin } from 'lucide-react';

export default function DriverPage() {
  const { driver, isDriverLoading } = useDriver();
  const firestore = useFirestore();

  const assignedRidesQuery = useMemoFirebase(() => {
    if (!driver) return null;
    return query(
        collection(firestore, 'rides'),
        where('driverId', '==', driver.id),
        where('status', 'in', ['accepted', 'in-progress'])
    );
  }, [firestore, driver]);

  const { data: assignedRides } = useCollection<Ride>(assignedRidesQuery);

  const handleAvailabilityChange = (isAvailable: boolean) => {
    if (!driver) return;
    const driverRef = doc(firestore, 'drivers', driver.id);
    updateDocumentNonBlocking(driverRef, { isAvailable });
  };

  // First, handle the primary loading state for the driver's profile itself.
  // This ensures we don't flash the "Access Denied" message for a real driver.
  if (isDriverLoading) {
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
  
  // After we're done loading, if there's still no driver, they can't access this page.
  if (!driver) {
      return (
          <AppLayout>
              <main className="flex-1 flex flex-col items-center justify-center p-4 md:p-6 lg:p-8">
                  <Card className="w-full max-w-md text-center">
                    <CardHeader>
                        <CardTitle className="text-destructive">Access Denied</CardTitle>
                        <CardDescription>
                            You do not have permission to view this page.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <p>This dashboard is for registered drivers only.</p>
                        <Button asChild className="mt-4">
                            <Link href="/home">Return to Home</Link>
                        </Button>
                    </CardContent>
                  </Card>
              </main>
          </AppLayout>
      );
  }

  // If we reach here, we have a valid driver. Render the dashboard.
  const hasAssignedRide = assignedRides && assignedRides.length > 0;

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
              <CardContent className="space-y-4">
                <div className="flex items-center space-x-4 rounded-md border p-4">
                  <div className="flex-1 space-y-1">
                    <p className="text-sm font-medium leading-none">
                      Available for Rides
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Toggle this to go online, offline, or take a break.
                    </p>
                  </div>
                  <Switch
                    checked={driver.isAvailable}
                    onCheckedChange={handleAvailabilityChange}
                    aria-label="Toggle driver availability"
                  />
                </div>
                <div className="flex items-center space-x-4 rounded-md border p-4">
                  <MapPin className="h-5 w-5 text-green-500" />
                  <div className="flex-1 space-y-1">
                    <p className="text-sm font-medium leading-none">
                      Location Tracking
                    </p>
                    <p className="text-sm text-muted-foreground">
                      GPS is active to ensure accurate ride matching.
                    </p>
                  </div>
                  <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
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
