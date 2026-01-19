'use client';

import { useCollection, useFirestore, useMemoFirebase, useUser } from "@/firebase";
import { collection, query, where, orderBy } from "firebase/firestore";
import AppLayout from "@/components/app-layout";
import { RideHistoryItem } from "@/components/ride/ride-history-item";
import type { Ride } from "@/lib/data";
import { Skeleton } from "@/components/ui/skeleton";


export default function HistoryPage() {
  const { user, isUserLoading } = useUser();
  const firestore = useFirestore();

  const ridesQuery = useMemoFirebase(() => {
    // This now directly depends on the user from the hook.
    // The query will not be created until both firestore and user.uid are available.
    if (!firestore || !user?.uid) {
        return null;
    }
    return query(
      collection(firestore, 'rides'),
      where('userId', '==', user.uid),
      orderBy('startTime', 'desc')
    )
  }, [firestore, user?.uid]); // Dependency is now only on stable firestore instance and user.uid

  const { data: rides, isLoading: areRidesLoading } = useCollection<Ride>(ridesQuery);

  // A unified loading state is more robust.
  // We are loading if the user is still loading, or if we have a user but their rides aren't loaded yet.
  const isLoading = isUserLoading || (!!user && areRidesLoading);

  return (
    <AppLayout>
      <main className="flex-1 flex flex-col">
        <div className="p-4 md:p-6 lg:p-8">
            <h1 className="font-headline text-3xl font-bold mb-6">Ride History</h1>
            <div className="space-y-4">
              {isLoading && (
                <>
                  <Skeleton className="h-32 w-full" />
                  <Skeleton className="h-32 w-full" />
                  <Skeleton className="h-32 w-full" />
                </>
              )}

              {/* Only show rides when not loading and rides exist */}
              {!isLoading && rides && rides.length > 0 && (
                rides.map((ride) => (
                  <RideHistoryItem key={ride.id} ride={ride} />
                ))
              )}

              {/* Show "No rides" message only when not loading, we have a user, but no rides */}
              {!isLoading && user && (!rides || rides.length === 0) && (
                 <div className="text-center py-10">
                  <h3 className="text-xl font-semibold">No rides yet</h3>
                  <p className="text-muted-foreground">Your past rides will appear here.</p>
                </div>
              )}

              {/* Show "Please log in" only when we have confirmed the user is not logged in */}
              {!isUserLoading && !user && (
                  <div className="text-center py-10">
                      <h3 className="text-xl font-semibold">Please log in</h3>
                      <p className="text-muted-foreground">You need to be logged in to see your ride history.</p>
                  </div>
              )}
            </div>
        </div>
      </main>
    </AppLayout>
  );
}
