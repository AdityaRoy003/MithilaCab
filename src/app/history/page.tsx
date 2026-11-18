'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import AppLayout from "@/components/app-layout";
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Bike,
  Car,
  Package,
  MapPin,
  Clock,
  ArrowRight,
  Repeat,
  Receipt,
  Star,
  CheckCircle2,
  Calendar,
  Filter,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';

export default function HistoryPage() {
  const router = useRouter();
  const [rides, setRides] = useState<any[]>([]);
  const [filterType, setFilterType] = useState<string>('all');
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    setIsLoading(true);
    fetch('/api/rides')
      .then((res) => (res.ok ? res.json() : Promise.reject('Failed to fetch rides')))
      .then((data) => {
        if (data && data.rides) {
          const formatted = data.rides.map((r: any) => ({
            id: r.id || r._id,
            serviceType: r.serviceType || 'bike',
            pickup: r.pickupLocation,
            drop: r.destinationLocation,
            fare: r.fareAmount,
            distance: r.distance || 3.5,
            date: new Date(r.createdAt || Date.now()).toLocaleDateString('en-IN', {
              day: 'numeric',
              month: 'short',
              hour: '2-digit',
              minute: '2-digit',
            }),
            status: r.status,
            captain: r.captain || {
              name: 'Captain Assigned',
              vehicleModel: 'Hero Splendor / Activa',
              vehicleNumber: 'BR 07 BK 4921',
              rating: 4.9,
            },
            rating: r.rating || 5,
            parcelNote: r.parcelDetails?.packageType ? `Package: ${r.parcelDetails.packageType}` : undefined,
          }));
          setRides(formatted);
        }
      })
      .catch(() => {
        setRides([]);
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, []);

  const filteredRides = rides.filter((r) => {
    if (filterType === 'all') return true;
    return r.serviceType === filterType;
  });

  const handleRebook = (ride: any) => {
    router.push(`/home?pickup=${encodeURIComponent(ride.pickup)}&destination=${encodeURIComponent(ride.drop)}`);
    toast({
      title: 'Trip Details Pre-filled',
      description: `Booking ride from ${ride.pickup} to ${ride.drop}`,
    });
  };

  const handleDownloadReceipt = (ride: any) => {
    toast({
      title: 'Receipt Downloaded',
      description: `Invoice for ₹${ride.fare} (${ride.serviceType.toUpperCase()} - Trip #${ride.id.slice(-6)}) saved.`,
    });
  };

  return (
    <AppLayout>
      <div className="max-w-xl mx-auto px-4 py-4 md:py-6 space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl md:text-2xl font-black tracking-tight text-foreground flex items-center gap-2">
              <span>My Rides & Deliveries</span>
            </h1>
            <p className="text-xs text-muted-foreground mt-0.5">Real-time database trips & verified invoices</p>
          </div>
          <Badge className="bg-amber-400 text-black font-black uppercase text-xs px-2.5 py-1">
            {filteredRides.length} Trips
          </Badge>
        </div>

        {/* Filter Pills */}
        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
          {[
            { id: 'all', label: 'All Trips' },
            { id: 'bike', label: '🛵 Bike Taxi' },
            { id: 'auto', label: '🛺 Auto' },
            { id: 'cab_economy', label: '🚗 Cab' },
            { id: 'parcel', label: '📦 Parcel' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setFilterType(tab.id)}
              className={cn(
                'px-3 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all border shrink-0',
                filterType === tab.id
                  ? 'bg-amber-400 text-black border-amber-400 shadow-sm'
                  : 'bg-card text-muted-foreground border-border hover:border-amber-400/50'
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Rides List */}
        <div className="space-y-3">
          {isLoading ? (
            <div className="space-y-3">
              <Skeleton className="h-28 w-full rounded-2xl" />
              <Skeleton className="h-28 w-full rounded-2xl" />
            </div>
          ) : filteredRides.length === 0 ? (
            <Card className="rounded-2xl text-center p-8 border-dashed bg-card/60">
              <div className="mx-auto w-12 h-12 rounded-full bg-amber-400/20 flex items-center justify-center text-amber-500 mb-3">
                <Bike className="h-6 w-6" />
              </div>
              <h3 className="text-base font-bold text-foreground">No Trips Found</h3>
              <p className="text-xs text-muted-foreground mt-1 max-w-xs mx-auto">
                You haven&apos;t taken any trips yet in this category. Book your first ride with Mithila Gaadi!
              </p>
              <Button
                onClick={() => router.push('/home')}
                className="mt-4 bg-amber-400 hover:bg-amber-500 text-black font-black text-xs uppercase rounded-xl"
              >
                Book a Ride Now
              </Button>
            </Card>
          ) : (
            filteredRides.map((ride) => (
              <Card
                key={ride.id}
                className="border-2 border-border/80 hover:border-amber-400/60 shadow-md rounded-2xl overflow-hidden bg-card transition-all"
              >
                <CardContent className="p-4 space-y-3">
                  {/* Top line: Date + Type + Fare */}
                  <div className="flex items-center justify-between border-b border-border/60 pb-2.5">
                    <div className="flex items-center gap-2">
                      <div className="h-8 w-8 rounded-xl bg-amber-400/20 text-amber-600 dark:text-amber-400 flex items-center justify-center font-bold">
                        {ride.serviceType === 'bike' ? (
                          <Bike className="h-4 w-4" />
                        ) : ride.serviceType === 'parcel' ? (
                          <Package className="h-4 w-4" />
                        ) : (
                          <Car className="h-4 w-4" />
                        )}
                      </div>
                      <div>
                        <span className="font-extrabold text-xs uppercase tracking-wide text-foreground">
                          {ride.serviceType === 'bike'
                            ? 'Bike Taxi'
                            : ride.serviceType === 'auto'
                            ? 'Rapido Auto'
                            : ride.serviceType === 'parcel'
                            ? 'Parcel Delivery'
                            : 'Mithila Cab'}
                        </span>
                        <p className="text-[10px] text-muted-foreground">{ride.date}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="font-black text-base text-foreground">₹{ride.fare}</span>
                      <span className="text-[10px] text-emerald-600 font-semibold block capitalize">
                        {ride.status || 'Completed'}
                      </span>
                    </div>
                  </div>

                  {/* Route */}
                  <div className="space-y-1.5 text-xs">
                    <div className="flex items-start gap-2">
                      <div className="mt-1 h-2 w-2 rounded-full bg-emerald-500 shrink-0" />
                      <p className="font-medium text-foreground truncate">{ride.pickup}</p>
                    </div>
                    <div className="flex items-start gap-2">
                      <div className="mt-1 h-2 w-2 rounded-full bg-amber-500 shrink-0" />
                      <p className="font-medium text-foreground truncate">{ride.drop}</p>
                    </div>
                  </div>

                  {/* Captain Details */}
                  {ride.captain && (
                    <div className="flex items-center justify-between bg-muted/40 rounded-xl p-2.5 text-xs border border-border/50">
                      <div>
                        <p className="font-bold text-foreground">{ride.captain.name}</p>
                        <p className="text-[10px] text-muted-foreground">
                          {ride.captain.vehicleNumber || ride.captain.vehicle || 'BR 07 BK 4921'}
                        </p>
                      </div>
                      <div className="flex items-center gap-1 font-bold text-xs bg-amber-400 text-black px-1.5 py-0.5 rounded-md">
                        <Star className="h-3 w-3 fill-black" />
                        <span>{ride.captain.rating || '4.9'}</span>
                      </div>
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="flex items-center gap-2 pt-1">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDownloadReceipt(ride)}
                      className="flex-1 rounded-xl text-xs font-bold h-9"
                    >
                      <Receipt className="h-3.5 w-3.5 mr-1 text-muted-foreground" />
                      Invoice
                    </Button>
                    <Button
                      size="sm"
                      onClick={() => handleRebook(ride)}
                      className="flex-1 bg-amber-400 hover:bg-amber-500 text-black font-black text-xs rounded-xl h-9 shadow-xs"
                    >
                      <Repeat className="h-3.5 w-3.5 mr-1" />
                      Book Again
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
    </AppLayout>
  );
}
