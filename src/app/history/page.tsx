'use client';

import type { User } from 'firebase/auth';
import { useCollection, useFirestore, useMemoFirebase, useUser } from "@/firebase";
import { collection, query, where, orderBy } from "firebase/firestore";
import AppLayout from "@/components/app-layout";
import { RideHistoryItem } from "@/components/ride/ride-history-item";
import type { Ride } from "@/lib/data";
import { Skeleton } from "@/components/ui/skeleton";

/**
 * A dedicated component to render the list of rides.
 * This component is only rendered after the user is confirmed to be loaded and authenticated,
 * ensuring that the Firestore query is always correctly constrained.
 * It receives the user object as a prop to avoid race conditions.
 */
function RideHistoryList({ user }: { user: User }) {
    const firestore = useFirestore();

    const ridesQuery = useMemoFirebase(() => 
        // user is guaranteed non-null here because it's passed as a prop from the parent
        // which has already checked for its existence.
        query(
          collection(firestore, 'rides'), 
          where('userId', '==', user.uid),
          orderBy('startTime', 'desc')
        ), 
      [firestore, user]
    );
  
    const { data: rides, isLoading: areRidesLoading } = useCollection<Ride>(ridesQuery);

    if (areRidesLoading) {
        return (
             <>
                <Skeleton className="h-32 w-full" />
                <Skeleton className="h-32 w-full" />
                <Skeleton className="h-32 w-full" />
              </>
        )
    }

    return (
        <>
            {rides && rides.map((ride) => (
                <RideHistoryItem key={ride.id} ride={ride} />
            ))}
            {rides && rides.length === 0 && (
              <div className="text-center py-10">
                <h3 className="text-xl font-semibold">No rides yet</h3>
                <p className="text-muted-foreground">Your past rides will appear here.</p>
              </div>
            )}
        </>
    )
}

export default function HistoryPage() {
  const { user, isUserLoading } = useUser();

  return (
    <AppLayout>
      <main className="flex-1 flex flex-col">
        <div className="p-4 md:p-6 lg:p-8">
            <h1 className="font-headline text-3xl font-bold mb-6">Ride History</h1>
            <div className="space-y-4">
            {isUserLoading && (
              <>
                <Skeleton className="h-32 w-full" />
                <Skeleton className="h-32 w-full" />
                <Skeleton className="h-32 w-full" />
              </>
            )}
            {/* The RideHistoryList component is now only rendered when we have a user, and we pass that user as a prop. */}
            {!isUserLoading && user && <RideHistoryList user={user} />}
            </div>
        </div>
      </main>
    </AppLayout>
  );
}
