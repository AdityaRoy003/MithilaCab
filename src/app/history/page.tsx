'use client';

import { useState, useMemo } from 'react';
import { useCollection, useFirestore, useMemoFirebase, useUser } from "@/firebase";
import { collection, query, where, orderBy } from "firebase/firestore";
import AppLayout from "@/components/app-layout";
import { RideHistoryItem } from "@/components/ride/ride-history-item";
import type { Ride } from "@/lib/data";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

type RideStatusFilter = 'all' | 'completed' | 'cancelled';

export default function HistoryPage() {
  const { user, isUserLoading: isUserLoading } = useUser();
  const firestore = useFirestore();
  const [filter, setFilter] = useState<RideStatusFilter>('all');

  const ridesQuery = useMemoFirebase(() => {
    if (!user) return null;
    // Simple query for all rides belonging to the user.
    // Filtering by status will be done on the client side to avoid complex queries.
    return query(
        collection(firestore, 'rides'), 
        where('userId', '==', user.uid), 
        orderBy('startTime', 'desc')
    );
  }, [firestore, user]);

  const { data: rides, isLoading: areRidesLoading } = useCollection<Ride>(ridesQuery);
  const isLoading = isUserLoading || (user && areRidesLoading);

  const filteredRides = useMemo(() => {
      if (!rides) return [];
      if (filter === 'all') return rides;
      return rides.filter(ride => ride.status === filter);
  }, [rides, filter]);


  const renderContent = () => {
      if (isLoading) {
        return (
          <>
            <Skeleton className="h-32 w-full" />
            <Skeleton className="h-32 w-full" />
            <Skeleton className="h-32 w-full" />
          </>
        );
      }

      if (user && filteredRides && filteredRides.length > 0) {
        return filteredRides.map((ride) => (
          <RideHistoryItem key={ride.id} ride={ride} />
        ));
      }
      
      if (user && (!filteredRides || filteredRides.length === 0)) {
          return (
              <div className="text-center py-10">
              <h3 className="text-xl font-semibold">No rides found</h3>
              <p className="text-muted-foreground">Your {filter !== 'all' ? filter : ''} rides will appear here.</p>
            </div>
          );
      }

      if (!user && !isLoading) {
         return (
            <div className="text-center py-10">
              <h3 className="text-xl font-semibold">Please log in</h3>
              <p className="text-muted-foreground">You need to be logged in to see your ride history.</p>
            </div>
         );
      }

      return null;
  }

  return (
    <AppLayout>
      <main className="flex-1 flex flex-col p-4 md:p-6 lg:p-8">
        <div className="flex justify-between items-center mb-6">
            <h1 className="font-headline text-3xl font-bold">Ride History</h1>
        </div>
        
        <Tabs value={filter} onValueChange={(value) => setFilter(value as RideStatusFilter)}>
            <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="all">All</TabsTrigger>
                <TabsTrigger value="completed">Completed</TabsTrigger>
                <TabsTrigger value="cancelled">Cancelled</TabsTrigger>
            </TabsList>
            <TabsContent value={filter} className="mt-6">
                <div className="space-y-4">
                    {renderContent()}
                </div>
            </TabsContent>
        </Tabs>
      </main>
    </AppLayout>
  );
}
