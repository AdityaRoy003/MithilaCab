'use client';

import { useMemo, Suspense, useEffect, useState } from 'react';
import AppLayout from "@/components/app-layout";
import { BookingFlow } from "@/components/ride/booking-flow";
import { useAdmin, useUser, useFirestore, useCollection, useMemoFirebase } from "@/firebase";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from '@/components/ui/button';
import { Shield, ArrowRight, Car } from 'lucide-react';
import Link from 'next/link';
import { collection, query, where, limit, orderBy } from 'firebase/firestore';
import type { Ride } from '@/lib/data';
import { RideHistoryItem } from '@/components/ride/ride-history-item';
import { useSearchParams, useRouter } from 'next/navigation';
import { BookingMap } from '@/components/ride/booking-map';
import { Carousel, CarouselContent, CarouselItem } from '@/components/ui/carousel';

function PassengerDashboard() {
    const { user } = useUser();
    const firestore = useFirestore();
    const searchParams = useSearchParams();
    const initialPickup = searchParams.get('pickup');
    const initialDestination = searchParams.get('destination');
    const [pickupCoords, setPickupCoords] = useState<google.maps.LatLngLiteral | null>(null);
    const [destinationCoords, setDestinationCoords] = useState<google.maps.LatLngLiteral | null>(null);


    const ridesQuery = useMemoFirebase(() => {
        if (!user) return null;
        return query(
            collection(firestore, 'rides'),
            where('userId', '==', user.uid),
            orderBy('startTime', 'desc'),
            limit(3)
        );
    }, [firestore, user]);

    const { data: recentRides, isLoading: areRidesLoading } = useCollection<Ride>(ridesQuery);
    
    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
            <div className="lg:col-span-1 space-y-8">
                <div>
                    <h1 className="font-headline text-3xl font-bold">Welcome, {user?.displayName?.split(' ')[0]}!</h1>
                    <p className="text-muted-foreground">Let's get you where you need to go.</p>
                </div>
                
                <BookingFlow 
                    initialPickup={initialPickup} 
                    initialDestination={initialDestination}
                    onPickupSelect={setPickupCoords}
                    onDestinationSelect={setDestinationCoords}
                />

                <div>
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="font-headline text-2xl font-bold">Recent Rides</h2>
                        <Button variant="ghost" asChild>
                            <Link href="/history">View All <ArrowRight className="ml-2" /></Link>
                        </Button>
                    </div>
                     <Carousel opts={{ align: "start" }} className="w-full">
                        <CarouselContent className="-ml-2">
                            {areRidesLoading && Array.from({ length: 2 }).map((_, index) => (
                                <CarouselItem key={index} className="pl-2 basis-full sm:basis-1/2">
                                    <div className="p-1 h-full">
                                        <Skeleton className="h-48 w-full" />
                                    </div>
                                </CarouselItem>
                            ))}
                            {!areRidesLoading && recentRides && recentRides.length > 0 && (
                                recentRides.map((ride) => (
                                    <CarouselItem key={ride.id} className="pl-2 basis-full sm:basis-1/2">
                                        <div className="p-1 h-full">
                                            <RideHistoryItem ride={ride} variant="compact" />
                                        </div>
                                    </CarouselItem>
                                ))
                            )}
                        </CarouselContent>
                    </Carousel>
                    {!areRidesLoading && (!recentRides || recentRides.length === 0) && (
                        <Card>
                            <CardContent className="p-6 text-center text-muted-foreground">
                                You have no recent rides.
                            </CardContent>
                        </Card>
                    )}
                </div>
            </div>
             <div className="lg:col-span-2 relative lg:sticky lg:top-20">
                <Card>
                    <CardContent className="p-0">
                        <div className="h-[75vh] rounded-lg overflow-hidden">
                            <BookingMap pickup={pickupCoords} destination={destinationCoords} />
                        </div>
                    </CardContent>
                </Card>
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

function PassengerDashboardWrapper() {
    return (
        <Suspense fallback={<HomePageLoadingSkeleton />}>
            <PassengerDashboard />
        </Suspense>
    )
}

export default function HomePage() {
  const { isAdmin, isAdminLoading, role } = useAdmin();
  const router = useRouter();

  useEffect(() => {
    // Only redirect if loading is finished and the role is definitively 'driver'.
    if (!isAdminLoading && role === 'driver') {
      router.replace('/driver');
    }
  }, [isAdminLoading, role, router]);

  // We are loading if the admin/role status is being determined.
  if (isAdminLoading) {
    return (
      <AppLayout>
        <main className="flex-1 flex flex-col p-4 md:p-6 lg:p-8 bg-background">
          <HomePageLoadingSkeleton />
        </main>
      </AppLayout>
    );
  }

  // If loading is done and the user is a driver, we show a loader
  // while the useEffect above performs the redirection. This prevents
  // the passenger dashboard from flashing.
  if (role === 'driver') {
    return (
      <AppLayout>
        <main className="flex-1 flex flex-col p-4 md:p-6 lg:p-8 bg-background">
          <HomePageLoadingSkeleton />
        </main>
      </AppLayout>
    );
  }
  
  // If loading is done and the user is not a driver, render the
  // appropriate dashboard for an admin or passenger.
  return (
    <AppLayout>
      <main className="flex-1 flex flex-col p-4 md:p-6 lg:p-8 bg-background">
        {isAdmin ? (
            <AdminWelcome />
        ) : (
            // This will render if role is 'passenger' or undefined/null.
            // This is the desired fallback for non-drivers.
            <PassengerDashboardWrapper />
        )}
      </main>
    </AppLayout>
  );
}
