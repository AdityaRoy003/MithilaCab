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

    // The query is memoized and will only be created when both firestore and user.uid are available.
    // The dependency array now uses user.uid for better stability, ensuring the query is not
    // re-created unless the actual user ID changes.
    const ridesQuery = useMemoFirebase(() => {
        if (!firestore || !user?.uid) {
            return null;
        }
        return query(
          collection(firestore, 'rides'), 
          where('userId', '==', user.uid),
          orderBy('startTime', 'desc')
        )
      }, 
      [firestore, user?.uid] // Using user.uid for stable dependency
    );
  
    const { data: rides, isLoading: areRidesLoading } = useCollection<Ride>(ridesQuery);

    // This loading state now correctly reflects the query being prepared OR running.
    if (areRidesLoading || !ridesQuery) {
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
             {/* Added a state for when user is loaded but is null (logged out) */}
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
