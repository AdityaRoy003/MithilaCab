'use client';

import {
  collection,
  query,
  where,
  doc,
} from 'firebase/firestore';
import {
  useFirestore,
  useUser,
  useCollection,
  useMemoFirebase,
  updateDocumentNonBlocking,
} from '@/firebase';
import type { Ride } from '@/lib/data';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { IndianRupee, MapPin } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

export function AvailableRidesList() {
  const firestore = useFirestore();
  const { user } = useUser();

  const ridesQuery = useMemoFirebase(
    () =>
      query(collection(firestore, 'rides'), where('driverId', '==', null)),
    [firestore]
  );

  const { data: rides, isLoading } = useCollection<Ride>(ridesQuery);

  const handleAcceptRide = (rideId: string) => {
    if (!user) return;
    const rideRef = doc(firestore, 'rides', rideId);
    updateDocumentNonBlocking(rideRef, {
      driverId: user.uid,
      status: 'accepted',
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Available Rides</CardTitle>
        <CardDescription>
          These are rides requested by nearby passengers.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {isLoading && (
          <>
            <Skeleton className="h-28 w-full" />
            <Skeleton className="h-28 w-full" />
          </>
        )}
        {!isLoading && (!rides || rides.length === 0) && (
          <div className="text-center py-10 text-muted-foreground">
            <p>No available rides right now.</p>
            <p>You'll be notified when a new request comes in.</p>
          </div>
        )}
        {!isLoading &&
          rides &&
          rides.filter(ride => ride.status === 'requested').map((ride) => (
            <Card key={ride.id} className="p-4">
              <div className="flex justify-between items-start">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-primary" />
                    <p className="font-medium">{ride.pickupLocation}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-accent" />
                    <p className="font-medium">{ride.destinationLocation}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-bold text-xl flex items-center">
                    <IndianRupee size={20} />
                    {ride.fareAmount.toFixed(2)}
                  </p>
                  <p className="text-xs text-muted-foreground">Est. Fare</p>
                </div>
              </div>
              <CardFooter className="p-0 pt-4">
                <Button
                  className="w-full font-bold"
                  onClick={() => handleAcceptRide(ride.id)}
                >
                  Accept Ride
                </Button>
              </CardFooter>
            </Card>
          ))}
      </CardContent>
    </Card>
  );
}
