"use client";

import { useEffect, useState } from 'react';
import type { Ride } from '@/lib/data';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { ArrowRight, Clock, Map, IndianRupee } from 'lucide-react';

interface FareEstimateProps {
  rideDetails: Partial<Ride>;
  onConfirm: (estimate: { fare: number; distance: number; }) => void;
  onCancel: () => void;
}

export function FareEstimate({ rideDetails, onConfirm, onCancel }: FareEstimateProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [estimate, setEstimate] = useState<{ distance: string; time: number; fare: number } | null>(null);

  useEffect(() => {
    // This effect runs only on the client, avoiding hydration mismatches from Math.random().
    const multipliers = { Standard: 1, Premium: 1.5, SUV: 2.0 };
    const multiplier = multipliers[rideDetails.rideType || 'Standard'];
    
    const dist = Math.random() * 20 + 2;
    const baseFare = 40;
    const perKmRate = 12;
    const finalFare = Math.round((baseFare + dist * perKmRate) * multiplier);
    const travelTime = Math.round(dist * 2.5);

    setEstimate({
      distance: dist.toFixed(1),
      time: travelTime,
      fare: finalFare,
    });

    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1500); // Simulate calculation time

    return () => clearTimeout(timer);
  }, [rideDetails.rideType]);

  const handleConfirm = () => {
    if (estimate) {
      onConfirm({ fare: estimate.fare, distance: parseFloat(estimate.distance) });
    }
  };
  
  const showSkeletons = isLoading || !estimate;

  return (
    <div className="w-full max-w-md mx-auto">
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="font-headline text-2xl text-center">
            {showSkeletons ? 'Calculating Fare...' : 'Ride Estimate'}
          </CardTitle>
          <CardDescription className="text-center">
            Review your trip details and confirm.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="p-4 rounded-lg border bg-card">
            <div className="flex items-center space-x-4">
              <MapPinDashed />
              <div className="flex-1 space-y-2">
                <p className="font-semibold text-sm truncate">{rideDetails.pickupLocation}</p>
                <p className="font-semibold text-sm truncate">{rideDetails.destinationLocation}</p>
              </div>
            </div>
             <div className="text-center text-sm font-medium pt-2 text-muted-foreground">{rideDetails.rideType}</div>
          </div>
          
          {showSkeletons ? (
            <div className="grid grid-cols-2 gap-4 text-center">
              <Skeleton className="h-[76px] w-full" />
              <Skeleton className="h-[76px] w-full" />
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-4 text-center">
              <div className="p-3 rounded-lg border bg-card">
                <p className="text-sm text-muted-foreground">Distance</p>
                <p className="font-bold text-lg flex items-center justify-center gap-1"><Map size={16}/> {estimate.distance} km</p>
              </div>
              <div className="p-3 rounded-lg border bg-card">
                <p className="text-sm text-muted-foreground">Est. Time</p>
                <p className="font-bold text-lg flex items-center justify-center gap-1"><Clock size={16}/> {estimate.time} min</p>
              </div>
            </div>
          )}

           {showSkeletons ? (
              <Skeleton className="h-[92px] w-full" />
           ): (
            <div className="text-center p-4 rounded-lg bg-accent/10 border border-accent">
                <p className="text-sm text-accent-foreground/80">Estimated Fare</p>
                <p className="font-headline font-bold text-4xl text-accent flex items-center justify-center">
                    <IndianRupee size={30} className="mt-1" />{estimate.fare.toFixed(2)}
                </p>
            </div>
           )}

        </CardContent>
        <CardFooter className="grid grid-cols-2 gap-4">
          <Button variant="outline" onClick={onCancel} disabled={showSkeletons}>Cancel</Button>
          <Button onClick={handleConfirm} disabled={showSkeletons} className="font-bold">
            Confirm Ride <ArrowRight className="ml-2" />
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}

function MapPinDashed() {
  return (
    <div className="flex flex-col items-center h-full">
      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary"><circle cx="12" cy="10" r="3"/><path d="M12 21.7C17.3 17 20 13 20 10a8 8 0 1 0-16 0c0 3 2.7 6.9 8 11.7z"/></svg>
      <div className="w-px h-6 border-r border-dashed border-muted-foreground my-1"></div>
      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-accent"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>
    </div>
  );
}
