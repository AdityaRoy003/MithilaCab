
'use client';

import { useMemo, Suspense, useEffect, useState, useRef } from 'react';
import AppLayout from "@/components/app-layout";
import { BookingFlow } from "@/components/ride/booking-flow";
import { useAdmin, useUser } from "@/firebase";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from '@/components/ui/button';
import { Shield, ArrowRight, Wallet, LifeBuoy, Settings, PartyPopper, ShoppingBag, Building, Utensils, Clock } from 'lucide-react';
import Link from 'next/link';
import type { Ride, Offer } from '@/lib/data';
import { mockRideHistory } from '@/lib/data';
import { RideHistoryItem } from '@/components/ride/ride-history-item';
import { useRouter } from 'next/navigation';
import { Carousel, CarouselContent, CarouselItem } from '@/components/ui/carousel';
import { Separator } from '@/components/ui/separator';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
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

const STATIC_OFFERS: Offer[] = [
  {
    id: 'off_1',
    title: 'Flat 20% OFF at V2 Mall',
    description: 'Ride to V2 Mall Darbhanga and get instant shopping discounts.',
    partnerName: 'V2 Mall Darbhanga',
    location: 'V2 Mall, Darbhanga',
    category: 'Shopping',
    bannerImageUrl: 'https://images.unsplash.com/photo-1519567241046-7f570eee3ce6?w=600',
    isActive: true,
  },
  {
    id: 'off_2',
    title: 'Free Beverage with Ride',
    description: 'Enjoy delicious authentic Maithil cuisine with complimentary chai.',
    partnerName: 'Mithila Rasoi Restaurant',
    location: 'Donar Chowk, Darbhanga',
    category: 'Restaurant',
    bannerImageUrl: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=600',
    isActive: true,
  },
];

function LocalOffers() {
  const router = useRouter();

  const handleBookToOffer = (destination: string) => {
    router.push(`/home?destination=${encodeURIComponent(destination)}`);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const getIconForCategory = (category?: string) => {
    switch (category) {
      case 'Hotel': return Building;
      case 'Restaurant': return Utensils;
      case 'Shopping': return ShoppingBag;
      default: return ShoppingBag;
    }
  };

  return (
    <div className="space-y-4">
      <h2 className="font-headline text-2xl font-bold flex items-center gap-2">
        <ShoppingBag className="text-primary" />
        Local Offers & Deals
      </h2>
      <div className="grid md:grid-cols-2 gap-4">
        {STATIC_OFFERS.map((offer) => {
          const Icon = getIconForCategory(offer.category);
          return (
            <motion.div
              key={offer.id}
              whileHover={{ scale: 1.02, y: -3 }}
              transition={{ type: 'spring', stiffness: 300 }}
            >
              <Card className="overflow-hidden h-full flex flex-col rounded-2xl border shadow-xs">
                {offer.bannerImageUrl && (
                  <Image
                    src={offer.bannerImageUrl}
                    alt={offer.description}
                    width={400}
                    height={200}
                    className="w-full h-32 object-cover"
                  />
                )}
                <CardHeader className="flex-row items-start gap-3 p-4">
                  <div className="p-2 bg-muted rounded-xl shrink-0">
                    <Icon className="h-5 w-5 text-amber-500" />
                  </div>
                  <div>
                    <CardTitle className="text-base font-bold">{offer.partnerName}</CardTitle>
                    <CardDescription className="text-xs">{offer.description}</CardDescription>
                  </div>
                </CardHeader>
                <CardFooter className="p-4 pt-0 mt-auto">
                  <Button
                    className="w-full font-bold h-9 text-xs rounded-xl bg-amber-400 hover:bg-amber-500 text-black"
                    onClick={() => handleBookToOffer(offer.location)}
                  >
                    Book Ride & Redeem
                  </Button>
                </CardFooter>
              </Card>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}


function PassengerDashboard() {
    const { user } = useUser();
    const [initialParams, setInitialParams] = useState<{
      pickup: string | null;
      destination: string | null;
      type: RideType | null;
    }>({ pickup: null, destination: null, type: null });

    const initialPickup = initialParams.pickup;
    const initialDestination = initialParams.destination;
    const initialType = initialParams.type;

    const [recentRides, setRecentRides] = useState<any[]>([]);
    const [rideStats, setRideStats] = useState({ thisMonth: 0, total: 0 });

    useEffect(() => {
      if (typeof window !== 'undefined') {
        const params = new URLSearchParams(window.location.search);
        setInitialParams({
          pickup: params.get('pickup'),
          destination: params.get('destination'),
          type: (params.get('type') as RideType) || null,
        });
      }

      fetch('/api/rides')
        .then((r) => r.json())
        .then((data) => {
          if (data.rides) {
            setRecentRides(data.rides.slice(0, 3));
            setRideStats({ thisMonth: data.rides.length, total: data.rides.length });
          }
        })
        .catch(() => {});
    }, []);
    
    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-8 items-start max-w-full">
            <div className="lg:col-span-1 space-y-3.5 lg:space-y-6">
                {/* Greeting on mobile is sleek & compact */}
                <div className="flex items-center justify-between px-0.5">
                    <div>
                        <h1 className="font-headline text-lg sm:text-2xl font-black text-foreground tracking-tight">
                            Hi, {user?.displayName?.split(' ')[0] || 'Rider'}! 👋
                        </h1>
                        <p className="text-xs text-muted-foreground">Where would you like to go today?</p>
                    </div>
                    {/* Quick Wallet pill */}
                    <Link
                      href="/profile/payment"
                      className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-400/15 border border-amber-400/40 text-xs font-bold text-foreground hover:bg-amber-400/25 transition-all"
                    >
                      <Wallet className="h-3.5 w-3.5 text-amber-500" />
                      <span>Wallet</span>
                    </Link>
                </div>

                <BookingFlow 
                    initialPickup={initialPickup} 
                    initialDestination={initialDestination}
                    initialRideType={initialType}
                />

                {/* Quick stats underneath the booking flow */}
                <Card className="rounded-2xl border shadow-xs overflow-hidden bg-card">
                    <CardContent className="p-3 flex justify-around items-center">
                        <div className="text-center">
                            <p className="text-lg font-black text-foreground">{rideStats.thisMonth}</p>
                            <p className="text-[10px] text-muted-foreground uppercase font-semibold">Rides this month</p>
                        </div>
                        <Separator orientation="vertical" className="h-8"/>
                        <div className="text-center">
                            <p className="text-lg font-black text-foreground">{rideStats.total}</p>
                            <p className="text-[10px] text-muted-foreground uppercase font-semibold">Total rides</p>
                        </div>
                        <Separator orientation="vertical" className="h-8"/>
                        <div className="flex items-center gap-1">
                            <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full" asChild>
                              <Link href="/history" title="History"><Clock className="h-4 w-4" /></Link>
                            </Button>
                            <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full" asChild>
                              <Link href="/profile/safety" title="Support"><LifeBuoy className="h-4 w-4" /></Link>
                            </Button>
                        </div>
                    </CardContent>
                </Card>

                <div>
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="font-headline text-2xl font-bold">Recent Rides</h2>
                        <Button variant="ghost" asChild>
                            <Link href="/history">View All <ArrowRight className="ml-2" /></Link>
                        </Button>
                    </div>
                     <Carousel opts={{ align: "start" }} className="w-full">
                        <CarouselContent className="-ml-2">
                            {recentRides && recentRides.length > 0 ? (
                                recentRides.map((ride) => (
                                    <CarouselItem key={ride.id} className="pl-2 basis-full sm:basis-1/2">
                                        <div className="p-1 h-full">
                                            <RideHistoryItem ride={ride} variant="compact" />
                                        </div>
                                    </CarouselItem>
                                ))
                            ) : (
                                <CarouselItem className="pl-2 basis-full">
                                    <Card className="rounded-xl p-4 text-center text-xs text-muted-foreground">
                                        No recent rides yet. Book your first ride above!
                                    </Card>
                                </CarouselItem>
                            )}
                        </CarouselContent>
                    </Carousel>
                </div>
            </div>
             <div className="lg:col-span-1 space-y-8 lg:sticky lg:top-20">
                <EventPooling />
                <Separator />
                <LocalOffers />
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
        <main className="flex-1 flex flex-col p-3 sm:p-5 lg:p-8 bg-background max-w-full overflow-x-hidden">
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
        <main className="flex-1 flex flex-col p-3 sm:p-5 lg:p-8 bg-background max-w-full overflow-x-hidden">
          <HomePageLoadingSkeleton />
        </main>
      </AppLayout>
    );
  }
  
  // If loading is done and the user is not a driver, render the
  // appropriate dashboard for an admin or passenger.
  return (
    <AppLayout>
      <main className="flex-1 flex flex-col p-3 sm:p-5 lg:p-8 bg-background max-w-full overflow-x-hidden">
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
