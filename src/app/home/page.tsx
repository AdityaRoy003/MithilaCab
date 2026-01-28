
'use client';

import { useMemo, Suspense, useEffect, useState, useRef } from 'react';
import AppLayout from "@/components/app-layout";
import { BookingFlow } from "@/components/ride/booking-flow";
import { useAdmin, useUser, useFirestore, useCollection, useMemoFirebase } from "@/firebase";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from '@/components/ui/button';
import { Shield, ArrowRight, Wallet, LifeBuoy, Settings, PartyPopper, ShoppingBag, Building, Utensils } from 'lucide-react';
import Link from 'next/link';
import { collection, query, where, limit, orderBy } from 'firebase/firestore';
import type { Ride, Offer } from '@/lib/data';
import { RideHistoryItem } from '@/components/ride/ride-history-item';
import { useSearchParams, useRouter } from 'next/navigation';
import { BookingMap } from '@/components/ride/booking-map';
import { Carousel, CarouselContent, CarouselItem } from '@/components/ui/carousel';
import { Separator } from '@/components/ui/separator';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { useJsApiLoader } from '@react-google-maps/api';
import { API_KEY, LIBRARIES } from '@/app/lib/google-maps';
import PlaceHolderImages from '@/app/lib/placeholder-images.json';
import Autoplay from "embla-carousel-autoplay";
import Image from 'next/image';
import { motion } from 'framer-motion';

function EventPooling() {
  const router = useRouter();
  const plugin = useRef(
    Autoplay({ delay: 5000, stopOnInteraction: false })
  )

  const mockEvents = [
    {
      id: "evt1",
      title: "Mithila Vivah Season",
      description: "Heading to a wedding? Share a ride with others and save.",
      destination: "Vivah Bhawan, Darbhanga",
      image: PlaceHolderImages.find(img => img.id === 'event-banner-1')
    },
    {
      id: "evt2",
      title: "Saurath Sabha Mela",
      description: "Travel to the historic Saurath Sabha with ease. Join a pool.",
      destination: "Saurath, Madhubani",
      image: { ...PlaceHolderImages.find(img => img.id === 'event-banner-1'), imageUrl: 'https://picsum.photos/seed/eventbanner2/800/400.jpg', imageHint: 'festival' }
    }
  ];

  const handleFindPool = (destination: string) => {
    // This will reload the page with the destination pre-filled
    router.push(`/home?destination=${encodeURIComponent(destination)}`);
    // Scroll to top to make booking form visible
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  return (
    <div className="space-y-4">
      <h2 className="font-headline text-2xl font-bold flex items-center gap-2">
        <PartyPopper className="text-primary"/>
        Event Pooling
      </h2>
      <Carousel
        plugins={[plugin.current]}
        className="w-full"
        onMouseEnter={plugin.current.stop}
        onMouseLeave={plugin.current.play}
      >
        <CarouselContent>
          {mockEvents.map((event) => (
            <CarouselItem key={event.id}>
                {event.image && (
                    <Card className="overflow-hidden relative text-white">
                        <Image
                            src={event.image.imageUrl}
                            alt={event.description}
                            width={800}
                            height={400}
                            className="w-full h-48 object-cover brightness-50"
                            data-ai-hint={event.image.imageHint}
                        />
                        <div className="absolute inset-0 p-6 flex flex-col justify-end bg-gradient-to-t from-black/70 to-transparent">
                        <h3 className="font-bold text-xl">{event.title}</h3>
                        <p className="text-sm text-white/80">{event.description}</p>
                        <Button
                            size="sm"
                            className="mt-2 w-fit bg-white text-primary hover:bg-white/90"
                            onClick={() => handleFindPool(event.destination)}
                        >
                            Find a Pool
                        </Button>
                        </div>
                    </Card>
                )}
            </CarouselItem>
          ))}
        </CarouselContent>
      </Carousel>
    </div>
  );
}

function LocalOffers() {
  const router = useRouter();
  const firestore = useFirestore();

  const offersQuery = useMemoFirebase(() => query(collection(firestore, 'offers'), where('isActive', '==', true)), [firestore]);
  const { data: offers, isLoading } = useCollection<Offer>(offersQuery);

  const handleBookToOffer = (destination: string) => {
    router.push(`/home?destination=${encodeURIComponent(destination)}`);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };
  
  const getIconForCategory = (category?: string) => {
    switch(category) {
        case 'Hotel': return Building;
        case 'Restaurant': return Utensils;
        case 'Shopping': return ShoppingBag;
        default: return ShoppingBag;
    }
  }

  return (
    <div className="space-y-4">
      <h2 className="font-headline text-2xl font-bold flex items-center gap-2">
        <ShoppingBag className="text-primary"/>
        Local Offers & Deals
      </h2>
      <div className="grid md:grid-cols-2 gap-4">
        {isLoading && Array.from({length: 2}).map((_, i) => <Skeleton key={i} className="h-56 w-full" />)}
        {offers && offers.map((offer) => {
            const Icon = getIconForCategory(offer.category);
            return (
              <motion.div
                key={offer.id}
                whileHover={{ scale: 1.03, y: -5 }}
                transition={{ type: 'spring', stiffness: 300 }}
              >
                <Card className="overflow-hidden h-full flex flex-col">
                  {offer.bannerImageUrl && (
                    <Image
                      src={offer.bannerImageUrl}
                      alt={offer.description}
                      width={400}
                      height={200}
                      className="w-full h-32 object-cover"
                    />
                  )}
                  <CardHeader className="flex-row items-start gap-4 p-4">
                    <div className="p-2 bg-muted rounded-full">
                        <Icon className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">{offer.partnerName}</CardTitle>
                      <CardDescription>{offer.description}</CardDescription>
                    </div>
                  </CardHeader>
                  <CardFooter className="p-4 pt-0 mt-auto">
                    <Button
                      className="w-full font-bold"
                      variant="secondary"
                      onClick={() => handleBookToOffer(offer.location)}
                    >
                      Book Ride & Redeem
                    </Button>
                  </CardFooter>
                </Card>
              </motion.div>
            )
        })}
         {!isLoading && (!offers || offers.length === 0) && (
            <p className="text-muted-foreground text-sm md:col-span-2">No local offers available right now. Check back soon!</p>
         )}
      </div>
    </div>
  );
}


function PassengerDashboard() {
    const { user } = useUser();
    const firestore = useFirestore();
    const searchParams = useSearchParams();
    const initialPickup = searchParams.get('pickup');
    const initialDestination = searchParams.get('destination');
    const [pickupCoords, setPickupCoords] = useState<google.maps.LatLngLiteral | null>(null);
    const [destinationCoords, setDestinationCoords] = useState<google.maps.LatLngLiteral | null>(null);

    const { isLoaded, loadError } = useJsApiLoader({
        id: 'google-map-script',
        googleMapsApiKey: API_KEY,
        libraries: LIBRARIES,
    });

    // Query for ALL rides for this user for stats
    const allRidesQuery = useMemoFirebase(() => {
        if (!user) return null;
        return query(
            collection(firestore, 'rides'),
            where('userId', '==', user.uid)
        );
    }, [firestore, user]);
    const { data: allRides, isLoading: areAllRidesLoading } = useCollection<Ride>(allRidesQuery);

    // Calculate ride stats
    const rideStats = useMemo(() => {
        if (!allRides) return { thisMonth: 0, total: 0 };
        const now = new Date();
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

        const thisMonthRides = allRides.filter(ride => {
            if (!ride.startTime) return false;
            // Ensure startTime is a Date object
            const rideDate = ride.startTime.toDate ? ride.startTime.toDate() : new Date(ride.startTime);
            return rideDate >= startOfMonth;
        });

        return {
            thisMonth: thisMonthRides.length,
            total: allRides.length
        };
    }, [allRides]);

    // Query for only RECENT rides for the list
    const recentRidesQuery = useMemoFirebase(() => {
        if (!user) return null;
        return query(
            collection(firestore, 'rides'),
            where('userId', '==', user.uid),
            orderBy('startTime', 'desc'),
            limit(3)
        );
    }, [firestore, user]);

    const { data: recentRides, isLoading: areRecentRidesLoading } = useCollection<Ride>(recentRidesQuery);
    
    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
            <div className="lg:col-span-1 space-y-8">
                <div>
                    <h1 className="font-headline text-3xl font-bold">Welcome back, {user?.displayName?.split(' ')[0]}!</h1>
                    <p className="text-muted-foreground">Ready for your next journey?</p>
                </div>
                
                 <Card>
                    <CardContent className="p-4 flex justify-around items-center">
                        {areAllRidesLoading ? (
                            <>
                                <Skeleton className="h-10 w-20" />
                                <Skeleton className="h-10 w-20" />
                            </>
                        ) : (
                            <>
                                <div className="text-center">
                                    <p className="text-2xl font-bold">{rideStats.thisMonth}</p>
                                    <p className="text-xs text-muted-foreground">Rides this month</p>
                                </div>
                                <div className="text-center">
                                    <p className="text-2xl font-bold">{rideStats.total}</p>
                                    <p className="text-xs text-muted-foreground">Total rides</p>
                                </div>
                            </>
                        )}
                        <Separator orientation="vertical" className="h-10"/>
                         <TooltipProvider>
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <Button variant="ghost" size="icon" asChild><Link href="/profile/payment"><Wallet/></Link></Button>
                                </TooltipTrigger>
                                <TooltipContent><p>Wallet</p></TooltipContent>
                            </Tooltip>
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <Button variant="ghost" size="icon" asChild><Link href="/profile/safety"><LifeBuoy/></Link></Button>
                                </TooltipTrigger>
                                <TooltipContent><p>Support</p></TooltipContent>
                            </Tooltip>
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <Button variant="ghost" size="icon" asChild><Link href="/profile"><Settings/></Link></Button>
                                </TooltipTrigger>
                                <TooltipContent><p>Profile</p></TooltipContent>
                            </Tooltip>
                         </TooltipProvider>
                    </CardContent>
                </Card>

                <EventPooling />
                
                <Separator />
                
                <LocalOffers />

                <Separator />

                <BookingFlow 
                    isLoaded={isLoaded}
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
                            {areRecentRidesLoading && Array.from({ length: 2 }).map((_, index) => (
                                <CarouselItem key={index} className="pl-2 basis-full sm:basis-1/2">
                                    <div className="p-1 h-full">
                                        <Skeleton className="h-48 w-full" />
                                    </div>
                                </CarouselItem>
                            ))}
                            {!areRecentRidesLoading && recentRides && recentRides.length > 0 && (
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
                    {!areRecentRidesLoading && (!recentRides || recentRides.length === 0) && (
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
                            <BookingMap 
                                isLoaded={isLoaded}
                                loadError={loadError}
                                pickup={pickupCoords} 
                                destination={destinationCoords}
                            />
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
