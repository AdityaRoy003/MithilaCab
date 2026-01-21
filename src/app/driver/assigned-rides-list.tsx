'use client';

import { collection, query, where } from 'firebase/firestore';
import { useFirestore, useDriver, useCollection, useMemoFirebase } from '@/firebase';
import type { Ride } from '@/lib/data';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { AssignedRideCard } from './assigned-ride-card';

export function AssignedRidesList() {
    const firestore = useFirestore();
    const { driver } = useDriver();

    const assignedRidesQuery = useMemoFirebase(() => {
        if (!driver) return null;
        return query(
            collection(firestore, 'rides'),
            where('driverId', '==', driver.id),
            where('status', 'in', ['accepted', 'in-progress'])
        );
    }, [firestore, driver]);

    const { data: rides, isLoading } = useCollection<Ride>(assignedRidesQuery);

    if (isLoading) {
         return (
             <Card>
                <CardHeader>
                    <CardTitle>Current Ride</CardTitle>
                    <CardDescription>Your currently active or assigned ride.</CardDescription>
                </CardHeader>
                <CardContent>
                    <Skeleton className="h-48 w-full" />
                </CardContent>
            </Card>
         )
    }

    if (!rides || rides.length === 0) {
        // If there are no assigned rides, don't render anything.
        // The driver page will then just show the available rides.
        return null;
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle>Current Ride</CardTitle>
                <CardDescription>Your currently active or assigned ride.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                {rides.map(ride => (
                    <AssignedRideCard key={ride.id} ride={ride} />
                ))}
            </CardContent>
        </Card>
    );
}
