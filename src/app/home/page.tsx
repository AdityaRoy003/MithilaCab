'use client';

import { useMemo } from 'react';
import AppLayout from "@/components/app-layout";
import { BookingFlow } from "@/components/ride/booking-flow";
import { useAdmin, useUser, useFirestore, useCollection, useMemoFirebase } from "@/firebase";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from '@/components/ui/button';
import { Shield, ArrowRight, Car } from 'lucide-react';
import Link from 'next/link';
import { collection, query, where, limit } from 'firebase/firestore';
import type { Ride } from '@/lib/data';
import { RideHistoryItem } from '@/components/ride/ride-history-item';

function PassengerDashboard() {
    const { user } = useUser();
    const firestore = useFirestore();

    const ridesQuery = useMemoFirebase(() => {
        if (!user) return null;
        return query(
            collection(firestore, 'rides'),
            where('userId', '==', user.uid),
            limit(3)
        );
    }, [firestore, user]);

    const { data: recentRides, isLoading: areRidesLoading } = useCollection<Ride>(ridesQuery);

    const sortedRecentRides = useMemo(() => {
        if (!recentRides) return [];
        return [...recentRides].sort((a, b) => {
            const timeA = a.startTime?.toDate ? a.startTime.toDate().getTime() : 0;
            const timeB = b.startTime?.toDate ? b.startTime.toDate().getTime() : 0;
            return timeB - timeA;
        });
    }, [recentRides]);
    
    return (
        <div className="space-y-8">
            <div>
                <h1 className="font-headline text-3xl font-bold">Welcome, {user?.displayName?.split(' ')[0]}!</h1>
                <p className="text-muted-foreground">Let's get you where you need to go.</p>
            </div>
            
            <BookingFlow />

            <div>
                <div className="flex justify-between items-center mb-4">
                    <h2 className="font-headline text-2xl font-bold">Recent Rides</h2>
                    <Button variant="ghost" asChild>
                        <Link href="/history">View All <ArrowRight className="ml-2" /></Link>
                    </Button>
                </div>
                 <div className="space-y-4">
                    {areRidesLoading && (
                        <>
                            <Skeleton className="h-24 w-full" />
                            <Skeleton className="h-24 w-full" />
                        </>
                    )}
                    {!areRidesLoading && sortedRecentRides && sortedRecentRides.length > 0 && (
                        sortedRecentRides.map((ride) => (
                            <RideHistoryItem key={ride.id} ride={ride} />
                        ))
                    )}
                    {!areRidesLoading && (!sortedRecentRides || sortedRecentRides.length === 0) && (
                        <Card>
                            <CardContent className="p-6 text-center text-muted-foreground">
                                You have no recent rides.
                            </CardContent>
                        </Card>
                    )}
                </div>
            </div>
        </div>
    )
}

function HomePageLoadingSkeleton() {
    return (
        <div className="flex h-full w-full items-center justify-center">
            <Card className="w-full max-w-md">
                <CardHeader className="items-center text-center">
                    <Skeleton className="h-8 w-48 mb-2" />
                    <Skeleton className="h-4 w-64" />
                </CardHeader>
                <CardContent className="space-y-6 pt-6">
                    <div className="space-y-2">
                        <Skeleton className="h-4 w-24" />
                        <Skeleton className="h-10 w-full" />
                    </div>
                    <div className="space-y-2">
                        <Skeleton className="h-4 w-24" />
                        <Skeleton className="h-10 w-full" />
                    </div>
                    <Skeleton className="h-12 w-full" />
                </CardContent>
            </Card>
        </div>
    );
}

function AdminWelcome() {
    return (
        <div className="flex h-full w-full items-center justify-center">
            <Card className="w-full max-w-md text-center">
                <CardHeader>
                    <CardTitle>Welcome, Admin!</CardTitle>
                    <CardDescription>You have administrative privileges.</CardDescription>
                </CardHeader>
                <CardContent>
                    <Button asChild size="lg" className="font-bold">
                        <Link href="/admin">
                            <Shield className="mr-2" />
                            Go to Admin Dashboard
                        </Link>
                    </Button>
                </CardContent>
            </Card>
        </div>
    )
}

function DriverWelcome() {
    return (
        <div className="w-full">
            <Card className="w-full text-center bg-secondary border-primary/50">
                <CardHeader>
                    <CardTitle>Welcome, Driver!</CardTitle>
                    <CardDescription>You are in passenger mode. Head to your dashboard to start accepting rides.</CardDescription>
                </CardHeader>
                <CardContent>
                    <Button asChild size="lg" className="font-bold">
                        <Link href="/driver">
                            <Car className="mr-2" />
                            Go to Driver Dashboard
                        </Link>
                    </Button>
                </CardContent>
            </Card>
        </div>
    )
}


export default function HomePage() {
  const { isAdmin, isAdminLoading, role } = useAdmin();

  if (isAdminLoading) {
    return (
      <AppLayout>
        <main className="flex-1 flex flex-col p-4 md:p-6 lg:p-8 bg-background">
          <HomePageLoadingSkeleton />
        </main>
      </AppLayout>
    );
  }
  
  const isDriver = role === 'driver' && !isAdmin;

  return (
    <AppLayout>
      <main className="flex-1 flex flex-col p-4 md:p-6 lg:p-8 bg-background">
        {isAdmin ? (
            <AdminWelcome />
        ) : (
            <div className="space-y-8">
                {isDriver && <DriverWelcome />}
                <PassengerDashboard />
            </div>
        )}
      </main>
    </AppLayout>
  );
}
