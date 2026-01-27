"use client";

import { useState, useEffect, useRef } from 'react';
import { Car, CarFront, Loader2, MapPin, Target, Truck } from 'lucide-react';
import type { RideType } from '@/lib/data';
import { useJsApiLoader } from '@react-google-maps/api';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';

interface BookingFormProps {
  onBookingRequest: (pickup: string, destination: string, rideType: RideType) => void;
  initialPickup?: string | null;
  initialDestination?: string | null;
  onPickupSelect: (coords: google.maps.LatLngLiteral | null) => void;
  onDestinationSelect: (coords: google.maps.LatLngLiteral | null) => void;
}

const API_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || '';
const LIBRARIES = ["geocoding", "directions"] as ("geocoding" | "directions")[];


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


export function BookingForm({ onBookingRequest, initialPickup, initialDestination, onPickupSelect, onDestinationSelect }: BookingFormProps) {
  const [pickup, setPickup] = useState(initialPickup || '');
  const [destination, setDestination] = useState(initialDestination || '');
  const [rideType, setRideType] = useState<RideType>('Standard');
  
  const [pickupSuggestions, setPickupSuggestions] = useState<string[]>([]);
  const [destinationSuggestions, setDestinationSuggestions] = useState<string[]>([]);
  const [activeSuggestionBox, setActiveSuggestionBox] = useState<'pickup' | 'destination' | null>(null);
  const [isDetectingLocation, setIsDetectingLocation] = useState(false);
  
  const { toast } = useToast();
  const { isLoaded } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: API_KEY,
    libraries: LIBRARIES,
  });

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

  const geocodeAddress = (address: string, type: 'pickup' | 'destination') => {
    if (!isLoaded) return;
    const geocoder = new window.google.maps.Geocoder();
    geocoder.geocode({ address }, (results, status) => {
      if (status === 'OK' && results && results[0]) {
        const location = results[0].geometry.location;
        const coords = { lat: location.lat(), lng: location.lng() };
        if (type === 'pickup') {
          onPickupSelect(coords);
        } else {
          onDestinationSelect(coords);
        }
      } else {
        console.error(`Geocode was not successful for the following reason: ${status}`);
        if (type === 'pickup') {
          onPickupSelect(null);
        } else {
          onDestinationSelect(null);
        }
      }
    });
  };

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
      onPickupSelect(null);
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
      onDestinationSelect(null);
    }
  };

  const handleSuggestionClick = (location: string, type: 'pickup' | 'destination') => {
    if (type === 'pickup') {
      setPickup(location);
    } else {
      setDestination(location);
    }
    setActiveSuggestionBox(null);
    geocodeAddress(location, type);
  };
  
  const handleDetectLocation = () => {
    if (!navigator.geolocation) {
      toast({ variant: 'destructive', title: 'Geolocation not supported', description: 'Your browser does not support location services.'});
      return;
    }
    if (!isLoaded) {
      toast({ variant: 'destructive', title: 'Map not ready', description: 'Please wait a moment for the map to load.'});
      return;
    }
    setIsDetectingLocation(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const coords = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        };
        onPickupSelect(coords);

        const geocoder = new window.google.maps.Geocoder();
        geocoder.geocode({ location: coords }, (results, status) => {
          setIsDetectingLocation(false);
          if (status === 'OK' && results && results[0]) {
            setPickup(results[0].formatted_address);
          } else {
            toast({ variant: 'destructive', title: 'Could not get address', description: 'Unable to reverse geocode your location.'});
          }
        });
      },
      () => {
        setIsDetectingLocation(false);
        toast({ variant: 'destructive', title: 'Location Access Denied', description: 'Please enable location permissions in your browser settings.'});
        onPickupSelect(null);
      }
    );
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
      <div className="absolute z-20 w-full mt-1 bg-card border rounded-md shadow-lg max-h-48 overflow-y-auto">
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
                  className="pl-10 pr-10"
                  autoComplete="off"
                />
                 <Button type="button" size="icon" variant="ghost" className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8" onClick={handleDetectLocation} disabled={isDetectingLocation || !isLoaded}>
                    {isDetectingLocation ? <Loader2 className="animate-spin" /> : <Target />}
                 </Button>
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
                  onBlur={() => geocodeAddress(destination, 'destination')}
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
