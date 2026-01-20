'use client';

import { doc } from 'firebase/firestore';
import AppLayout from '@/components/app-layout';
import {
  useDriver,
  useFirestore,
  updateDocumentNonBlocking,
} from '@/firebase';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import { AvailableRidesList } from './available-rides-list';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function DriverPage() {
  const { driver, isDriverLoading } = useDriver();
  const firestore = useFirestore();
  const router = useRouter();

  useEffect(() => {
    if (!isDriverLoading && !driver) {
      // This case should ideally not be hit if the user manually navigates here
      // as the Driver Mode switch wouldn't be visible.
      // We redirect them to the passenger homepage as a fallback.
      router.replace('/home');
    }
  }, [isDriverLoading, driver, router]);

  if (isDriverLoading || !driver) {
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
              <Skeleton className="h-24 w-full" />
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

        <AvailableRidesList />
      </main>
    </AppLayout>
  );
}
