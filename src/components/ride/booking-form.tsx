"use client";

import { useState, useEffect, useRef } from 'react';
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

// Mock locations in Mithila region
const mithilaLocations = [
  "Darbhanga Tower, Darbhanga",
  "Laheriasarai Station, Laheriasarai",
  "DMCH Hospital, Darbhanga",
  "Mithila University, Darbhanga",
  "V2 Mall, Darbhanga",
  "Donar Chowk, Darbhanga",
  "Allalpatti, Darbhanga",
  "Panda Sarai, Madhubani",
  "Kathalbari, Darbhanga",
  "Bengali Tola, Darbhanga",
  "Sakri, Madhubani",
  "Madhubani Station, Madhubani",
  "Rajnagar Palace, Madhubani",
  "Saurath, Madhubani",
  "Benipatti, Madhubani",
  "Jhanjharpur, Madhubani",
  "Samastipur Junction, Samastipur",
  "Pusa Road, Samastipur",
  "Rosera, Samastipur",
  "Dalsinghsarai, Samastipur",
];


export function BookingForm({ onBookingRequest, initialPickup, initialDestination }: BookingFormProps) {
  const [pickup, setPickup] = useState(initialPickup || '');
  const [destination, setDestination] = useState(initialDestination || '');
  const [rideType, setRideType] = useState<RideType>('Standard');
  
  const [pickupSuggestions, setPickupSuggestions] = useState<string[]>([]);
  const [destinationSuggestions, setDestinationSuggestions] = useState<string[]>([]);
  const [activeSuggestionBox, setActiveSuggestionBox] = useState<'pickup' | 'destination' | null>(null);

  const pickupRef = useRef<HTMLDivElement>(null);
  const destinationRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (initialPickup) setPickup(initialPickup);
    if (initialDestination) setDestination(initialDestination);
  }, [initialPickup, initialDestination]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
        if (
            pickupRef.current && !pickupRef.current.contains(event.target as Node) &&
            destinationRef.current && !destinationRef.current.contains(event.target as Node)
        ) {
            setActiveSuggestionBox(null);
        }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
        document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handlePickupChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setPickup(value);
    if (value) {
      const filtered = mithilaLocations.filter(loc => loc.toLowerCase().includes(value.toLowerCase()));
      setPickupSuggestions(filtered);
      setActiveSuggestionBox('pickup');
    } else {
      setPickupSuggestions([]);
      setActiveSuggestionBox(null);
    }
  };

  const handleDestinationChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setDestination(value);
    if (value) {
      const filtered = mithilaLocations.filter(loc => loc.toLowerCase().includes(value.toLowerCase()));
      setDestinationSuggestions(filtered);
      setActiveSuggestionBox('destination');
    } else {
      setDestinationSuggestions([]);
      setActiveSuggestionBox(null);
    }
  };

  const handleSuggestionClick = (location: string, type: 'pickup' | 'destination') => {
    if (type === 'pickup') {
      setPickup(location);
    } else {
      setDestination(location);
    }
    setActiveSuggestionBox(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (pickup && destination) {
      onBookingRequest(pickup, destination, rideType);
    }
  };

  const SuggestionsBox = ({ suggestions, onSelect, type }: { suggestions: string[], onSelect: (loc: string, type: 'pickup' | 'destination') => void, type: 'pickup' | 'destination' }) => {
    if (suggestions.length === 0) return null;
    return (
      <div className="absolute z-10 w-full mt-1 bg-card border rounded-md shadow-lg max-h-48 overflow-y-auto">
        {suggestions.map((suggestion, index) => (
          <div
            key={index}
            onClick={() => onSelect(suggestion, type)}
            className="p-2 hover:bg-accent cursor-pointer text-sm"
          >
            {suggestion}
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className="w-full max-w-md mx-auto">
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="font-headline text-2xl text-center">Where to?</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2 relative" ref={pickupRef}>
              <Label htmlFor="pickup">Pickup Location</Label>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input
                  id="pickup"
                  placeholder="Enter pickup location"
                  value={pickup}
                  onChange={handlePickupChange}
                  onFocus={() => { if(pickup) setActiveSuggestionBox('pickup')}}
                  required
                  className="pl-10"
                  autoComplete="off"
                />
              </div>
              {activeSuggestionBox === 'pickup' && (
                <SuggestionsBox suggestions={pickupSuggestions} onSelect={handleSuggestionClick} type="pickup" />
              )}
            </div>
            <div className="space-y-2 relative" ref={destinationRef}>
              <Label htmlFor="destination">Destination</Label>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input
                  id="destination"
                  placeholder="Enter destination"
                  value={destination}
                  onChange={handleDestinationChange}
                  onFocus={() => { if(destination) setActiveSuggestionBox('destination')}}
                  required
                  className="pl-10"
                  autoComplete="off"
                />
              </div>
              {activeSuggestionBox === 'destination' && (
                <SuggestionsBox suggestions={destinationSuggestions} onSelect={handleSuggestionClick} type="destination" />
               )}
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
