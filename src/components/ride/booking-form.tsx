'use client';

import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Car, CarFront, Loader2, MapPin, Target, Truck, Users } from 'lucide-react';
import type { RideType } from '@/lib/data';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { API_KEY, LIBRARIES } from '@/app/lib/google-maps';

interface BookingFormProps {
  isLoaded: boolean;
  onBookingRequest: (pickup: string, destination: string, rideType: RideType) => void;
  initialPickup?: string | null;
  initialDestination?: string | null;
  onPickupSelect: (coords: google.maps.LatLngLiteral | null) => void;
  onDestinationSelect: (coords: google.maps.LatLngLiteral | null) => void;
}

const JIO_API_KEY = process.env.NEXT_PUBLIC_JIO_API_KEY || '';


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


export function BookingForm({ isLoaded, onBookingRequest, initialPickup, initialDestination, onPickupSelect, onDestinationSelect }: BookingFormProps) {
  const [pickup, setPickup] = useState(initialPickup || '');
  const [destination, setDestination] = useState(initialDestination || '');
  const [rideType, setRideType] = useState<RideType>('Standard');
  
  const [pickupSuggestions, setPickupSuggestions] = useState<string[]>([]);
  const [destinationSuggestions, setDestinationSuggestions] = useState<string[]>([]);
  const [activeSuggestionBox, setActiveSuggestionBox] = useState<'pickup' | 'destination' | null>(null);
  const [isDetectingLocation, setIsDetectingLocation] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const { toast } = useToast();

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

    if (!JIO_API_KEY) {
        toast({
            variant: "destructive",
            title: "Jio API Key Missing",
            description: "Please add your Jio/MapmyIndia API key to a .env.local file as NEXT_PUBLIC_JIO_API_KEY."
        });
        return;
    }

    setIsDetectingLocation(true);
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const coords = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        };
        onPickupSelect(coords);

        try {
            // Using MapmyIndia API, which powers Jio Maps
            const response = await fetch(`https://apis.mapmyindia.com/advancedmaps/v1/${JIO_API_KEY}/rev_geocode?lat=${coords.lat}&lng=${coords.lng}`);
            if (!response.ok) {
                throw new Error(`API request failed with status ${response.status}`);
            }
            const data = await response.json();
            
            if (data.results && data.results.length > 0) {
                setPickup(data.results[0].formatted_address);
                 toast({ title: 'Location Detected', description: 'Your pickup location has been set.' });
            } else {
                throw new Error("No address found for these coordinates.");
            }
        } catch (error) {
             console.error("Jio Reverse Geocoding Error:", error);
             toast({ variant: "destructive", title: "Could not get address", description: "Unable to determine address from your location."});
        } finally {
            setIsDetectingLocation(false);
        }
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
      setIsSubmitting(true);
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
                 <Button type="button" size="icon" variant="ghost" className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8" onClick={handleDetectLocation} disabled={isDetectingLocation}>
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

            <div className="space-y-3">
                <Label>Ride Type</Label>
                <div className="grid grid-cols-4 gap-2">
                    {[
                        { type: 'Share', icon: Users, fare: '~ ₹80', eta: '8 min' },
                        { type: 'Standard', icon: Car, fare: '~ ₹120', eta: '5 min' },
                        { type: 'Premium', icon: CarFront, fare: '~ ₹180', eta: '7 min' },
                        { type: 'SUV', icon: Truck, fare: '~ ₹220', eta: '6 min' },
                    ].map((option) => (
                        <motion.div
                            key={option.type}
                            onClick={() => setRideType(option.type as RideType)}
                            className={cn(
                                "relative cursor-pointer rounded-lg border-2 p-3 text-center transition-all duration-300",
                                rideType === option.type
                                    ? 'border-primary bg-primary/10 shadow-lg scale-105'
                                    : 'border-muted bg-muted/20 hover:border-primary/50'
                            )}
                            whileHover={{ y: -3 }}
                            whileTap={{ scale: 0.98 }}
                        >
                            <option.icon className={cn("mx-auto mb-1 h-6 w-6", rideType === option.type ? 'text-primary' : 'text-muted-foreground')} />
                            <p className="font-semibold text-xs">{option.type}</p>
                            <p className="text-xs font-bold text-foreground mt-1">{option.fare}</p>
                        </motion.div>
                    ))}
                </div>
            </div>


            <Button type="submit" className="w-full font-bold text-lg" size="lg" disabled={!pickup || !destination || isSubmitting}>
              {isSubmitting ? (
                <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Please wait...</>
              ) : (
                'Request Ride'
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

    