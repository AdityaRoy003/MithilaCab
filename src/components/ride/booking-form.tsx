"use client";

import { useState, useEffect } from 'react';
import { Car, CarFront, MapPin, Truck } from 'lucide-react';
import type { RideType } from '@/lib/data';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { cn } from '@/lib/utils';

interface BookingFormProps {
  onBookingRequest: (pickup: string, destination: string, rideType: RideType) => void;
  initialPickup?: string | null;
  initialDestination?: string | null;
}

export function BookingForm({ onBookingRequest, initialPickup, initialDestination }: BookingFormProps) {
  const [pickup, setPickup] = useState(initialPickup || '');
  const [destination, setDestination] = useState(initialDestination || '');
  const [rideType, setRideType] = useState<RideType>('Standard');
  
  useEffect(() => {
    if (initialPickup) setPickup(initialPickup);
    if (initialDestination) setDestination(initialDestination);
  }, [initialPickup, initialDestination]);


  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (pickup && destination) {
      onBookingRequest(pickup, destination, rideType);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto">
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="font-headline text-2xl text-center">Where to?</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="pickup">Pickup Location</Label>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input
                  id="pickup"
                  placeholder="Enter pickup location"
                  value={pickup}
                  onChange={(e) => setPickup(e.target.value)}
                  required
                  className="pl-10"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="destination">Destination</Label>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input
                  id="destination"
                  placeholder="Enter destination"
                  value={destination}
                  onChange={(e) => setDestination(e.target.value)}
                  required
                  className="pl-10"
                />
              </div>
            </div>

             <div className="space-y-2">
                <Label>Ride Type</Label>
                <RadioGroup value={rideType} onValueChange={(value: any) => setRideType(value)} className="grid grid-cols-3 gap-4">
                    <Label className={cn("flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground", rideType === 'Standard' && 'border-primary')}>
                        <RadioGroupItem value="Standard" id="Standard" className="sr-only" />
                        <Car className="mb-3 h-6 w-6" />
                        Standard
                    </Label>
                    <Label className={cn("flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground", rideType === 'Premium' && 'border-primary')}>
                        <RadioGroupItem value="Premium" id="Premium" className="sr-only" />
                        <CarFront className="mb-3 h-6 w-6" />
                        Premium
                    </Label>
                    <Label className={cn("flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground", rideType === 'SUV' && 'border-primary')}>
                        <RadioGroupItem value="SUV" id="SUV" className="sr-only" />
                        <Truck className="mb-3 h-6 w-6" />
                        SUV
                    </Label>
                </RadioGroup>
             </div>

            <Button type="submit" className="w-full font-bold text-lg" size="lg" disabled={!pickup || !destination}>
              Request Ride
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
