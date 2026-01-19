'use client';

import { useCollection, useFirestore, useMemoFirebase, useUser } from "@/firebase";
import { collection, query, where, orderBy } from "firebase/firestore";
import AppLayout from "@/components/app-layout";
import { RideHistoryItem } from "@/components/ride/ride-history-item";
import type { Ride } from "@/lib/data";
import { Skeleton } from "@/components/ui/skeleton";
import type { User } from "firebase/auth";


function RideHistoryList({ user }: { user: User }) {
  const firestore = useFirestore();

  const ridesQuery = useMemoFirebase(() => {
    // This component is only rendered when user is guaranteed to exist.
    return query(
      collection(firestore, 'rides'),
      where('userId', '==', user.uid),
      orderBy('startTime', 'desc')
    )
  }, [firestore, user.uid]);

  const { data: rides, isLoading: areRidesLoading } = useCollection<Ride>(ridesQuery);

  return (
    <AppLayout>
      <main className="flex-1 flex flex-col">
        <div className="p-4 md:p-6 lg:p-8">
            <h1 className="font-headline text-3xl font-bold mb-6">Ride History</h1>
            <div className="space-y-4">
              {areRidesLoading && (
                <>
                  <Skeleton className="h-32 w-full" />
                  <Skeleton className="h-32 w-full" />
                  <Skeleton className="h-32 w-full" />
                </>
              )}

              {!areRidesLoading && rides && rides.length > 0 && (
                rides.map((ride) => (
                  <RideHistoryItem key={ride.id} ride={ride} />
                ))
              )}

              {!areRidesLoading && (!rides || rides.length === 0) && (
                 <div className="text-center py-10">
                  <h3 className="text-xl font-semibold">No rides yet</h3>
                  <p className="text-muted-foreground">Your past rides will appear here.</p>
                </div>
              )}
            </div>
        </div>
      </main>
    </AppLayout>
  );
}


export default function HistoryPage() {
  const { user, isUserLoading } = useUser();

  if (isUserLoading) {
    return (
       <AppLayout>
        <main className="flex-1 flex flex-col p-4 md:p-6 lg:p-8">
          <h1 className="font-headline text-3xl font-bold mb-6">Ride History</h1>
          <div className="space-y-4">
            <Skeleton className="h-32 w-full" />
            <Skeleton className="h-32 w-full" />
            <Skeleton className="h-32 w-full" />
          </div>
        </main>
      </AppLayout>
    );
  }

  if (!user) {
    return (
      <AppLayout>
         <main className="flex-1 flex flex-col">
          <div className="p-4 md:p-6 lg:p-8">
              <h1 className="font-headline text-3xl font-bold mb-6">Ride History</h1>
               <div className="text-center py-10">
                <h3 className="text-xl font-semibold">Please log in</h3>
                <p className="text-muted-foreground">You need to be logged in to see your ride history.</p>
              </div>
          </div>
        </main>
      </AppLayout>
    );
  }

  // Only once we have a definite user, we render the component that fetches data.
  return <RideHistoryList user={user} />;
}
