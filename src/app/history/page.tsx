'use client';

import { useCollection, useFirestore, useMemoFirebase, useUser } from "@/firebase";
import { collection, query, where, orderBy } from "firebase/firestore";
import AppLayout from "@/components/app-layout";
import { RideHistoryItem } from "@/components/ride/ride-history-item";
import type { Ride } from "@/lib/data";
import { Skeleton } from "@/components/ui/skeleton";

export default function HistoryPage() {
  const firestore = useFirestore();
  const { user } = useUser();

  const ridesQuery = useMemoFirebase(() => 
    user 
      ? query(
          collection(firestore, 'rides'), 
          where('userId', '==', user.uid),
          orderBy('startTime', 'desc')
        ) 
      : null, 
    [firestore, user]
  );
  
  const { data: rides, isLoading } = useCollection<Ride>(ridesQuery);

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
            {rides && rides.map((ride) => (
                <RideHistoryItem key={ride.id} ride={ride} />
            ))}
            {!isLoading && rides && rides.length === 0 && (
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
