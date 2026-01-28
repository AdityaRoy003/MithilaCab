'use client';

import { useState } from 'react';
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
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import { AvailableRidesList } from './available-rides-list';
import { AssignedRidesList } from './assigned-rides-list';
import type { Ride } from '@/lib/data';
import { MapPin, ShieldAlert } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { WellnessCheckDialog } from './wellness-check-dialog';

export default function DriverPage() {
  const { driver, isDriverLoading } = useDriver();
  const firestore = useFirestore();
  const [isWellnessCheckOpen, setIsWellnessCheckOpen] = useState(false);

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
    
    if (isAvailable) {
        // Instead of going online directly, open the wellness check
        setIsWellnessCheckOpen(true);
    } else {
        // Go offline immediately
        const driverRef = doc(firestore, 'drivers', driver.id);
        updateDocumentNonBlocking(driverRef, { isAvailable: false });
    }
  };

  // New function to handle the result of the wellness check
  const handleWellnessCheckComplete = (isWell: boolean) => {
      setIsWellnessCheckOpen(false); // Close the dialog
      if (isWell && driver) {
          // If wellness check passed, set driver online
          const driverRef = doc(firestore, 'drivers', driver.id);
          updateDocumentNonBlocking(driverRef, { isAvailable: true });
      }
      // If not well, a toast is shown inside the dialog, and the driver remains offline.
      // The switch will automatically revert to its 'off' state because the driver's `isAvailable` status in Firestore won't change.
  };


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

  // Force driver offline if they are not verified but somehow are marked as available
  if (!driver.isVerified && driver.isAvailable) {
    const driverRef = doc(firestore, 'drivers', driver.id);
    updateDocumentNonBlocking(driverRef, { isAvailable: false });
  }

  const hasAssignedRide = assignedRides && assignedRides.length > 0;

  return (
    <AppLayout>
       <WellnessCheckDialog 
          isOpen={isWellnessCheckOpen}
          onOpenChange={setIsWellnessCheckOpen}
          onComplete={handleWellnessCheckComplete}
      />
      <main className="flex-1 flex flex-col p-4 md:p-6 lg:p-8 space-y-8">
        <h1 className="font-headline text-3xl font-bold">Driver Dashboard</h1>

        {!driver.isVerified && (
            <Alert variant="destructive">
                <ShieldAlert className="h-4 w-4" />
                <AlertTitle>Verification Pending</AlertTitle>
                <AlertDescription>
                    Your account is under review. You can upload or update your documents in your <Link href="/profile/driver" className="underline font-bold">profile</Link>. You cannot accept rides until your account is verified by an admin.
                </AlertDescription>
            </Alert>
        )}

        <AssignedRidesList />
        
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
                      Toggle this to go online and receive ride requests.
                    </p>
                  </div>
                  <Switch
                    checked={driver.isAvailable}
                    onCheckedChange={handleAvailabilityChange}
                    aria-label="Toggle driver availability"
                    disabled={!driver.isVerified}
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

            {driver.isAvailable && driver.isVerified && <AvailableRidesList />}
          </>
        )}
      </main>
    </AppLayout>
  );
}
