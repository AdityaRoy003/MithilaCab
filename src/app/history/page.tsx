'use client';

import { useCollection, useFirestore, useMemoFirebase, useUser } from "@/firebase";
import { collection, query, where, orderBy } from "firebase/firestore";
import AppLayout from "@/components/app-layout";
import { RideHistoryItem } from "@/components/ride/ride-history-item";
import type { Ride } from "@/lib/data";
import { Skeleton } from "@/components/ui/skeleton";

export default function HistoryPage() {
  const { user, isUserLoading: isUserLoading } = useUser();
  const firestore = useFirestore();

  // THIS IS THE DEFINITIVE FIX.
  // The query is only created when `user` is available.
  // If `user` is loading or null, `ridesQuery` will be null, and useCollection will wait.
  const ridesQuery = useMemoFirebase(() => {
    if (!user) return null;

    return query(
      collection(firestore, 'rides'),
      where('userId', '==', user.uid),
      orderBy('startTime', 'desc')
    );
  }, [firestore, user]);

  const { data: rides, isLoading: areRidesLoading } = useCollection<Ride>(ridesQuery);

  // The combined loading state is true if the user is loading OR (once the user is loaded) if the rides are loading.
  const isLoading = isUserLoading || (user && areRidesLoading);

  return (
    <AppLayout>
      <main className="flex-1 flex flex-col p-4 md:p-6 lg:p-8">
        <h1 className="font-headline text-3xl font-bold mb-6">Ride History</h1>
        <div className="space-y-4">
          {isLoading && (
            <>
              <Skeleton className="h-32 w-full" />
              <Skeleton className="h-32 w-full" />
              <Skeleton className="h-32 w-full" />
            </>
          )}

          {!isLoading && user && rides && rides.length > 0 && (
            rides.map((ride) => (
              <RideHistoryItem key={ride.id} ride={ride} />
            ))
          )}

          {!isLoading && user && (!rides || rides.length === 0) && (
              <div className="text-center py-10">
              <h3 className="text-xl font-semibold">No rides yet</h3>
              <p className="text-muted-foreground">Your past rides will appear here.</p>
            </div>
          )}

          {!isLoading && !user && (
             <div className="text-center py-10">
              <h3 className="text-xl font-semibold">Please log in</h3>
              <p className="text-muted-foreground">You need to be logged in to see your ride history.</p>
            </div>
          )}
        </div>
      </main>
    </AppLayout>
  );
}
