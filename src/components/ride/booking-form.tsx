'use client';

import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Bike, Car, Loader2, MapPin, Package, Target, Shield, CheckCircle2, Phone, User as UserIcon } from 'lucide-react';
import type { RideType } from '@/lib/data';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface BookingFormProps {
  onBookingRequest: (
    pickup: string,
    destination: string,
    rideType: RideType,
    parcelDetails?: any
  ) => void;
  initialPickup?: string | null;
  initialDestination?: string | null;
  initialRideType?: RideType | null;
}

// Popular locations in Mithilanchal
const popularLocations = [
  "Darbhanga Tower, Darbhanga",
  "Laheriasarai Station, Laheriasarai",
  "DMCH Hospital, Darbhanga",
  "Mithila University Campus, Darbhanga",
  "V2 Mall, Darbhanga",
  "Donar Chowk, Darbhanga",
  "Allalpatti, Darbhanga",
  "Panda Sarai, Madhubani",
  "Kathalbari, Darbhanga",
  "Bengali Tola, Darbhanga",
  "Sakri Junction, Madhubani",
  "Madhubani Railway Station, Madhubani",
  "Samastipur Junction, Samastipur",
  "Pusa Agricultural University, Samastipur",
];

export function BookingForm({ onBookingRequest, initialPickup, initialDestination, initialRideType }: BookingFormProps) {
  const [activeTab, setActiveTab] = useState<'ride' | 'parcel'>(
    initialRideType === 'Parcel' ? 'parcel' : 'ride'
  );
  const [pickup, setPickup] = useState(initialPickup || 'Darbhanga Tower, Darbhanga');
  const [destination, setDestination] = useState(initialDestination || 'DMCH Hospital, Darbhanga');
  const [rideType, setRideType] = useState<RideType>(initialRideType || 'Bike');

  // Parcel fields
  const [receiverName, setReceiverName] = useState('');
  const [receiverPhone, setReceiverPhone] = useState('');
  const [packageType, setPackageType] = useState('Documents');

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
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handlePickupChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setPickup(value);
    if (value) {
      const filtered = popularLocations.filter(loc => loc.toLowerCase().includes(value.toLowerCase()));
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
      const filtered = popularLocations.filter(loc => loc.toLowerCase().includes(value.toLowerCase()));
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

  const handleDetectLocation = () => {
    setIsDetectingLocation(true);
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        () => {
          setPickup("Current Location (Darbhanga Tower)");
          setIsDetectingLocation(false);
          toast({ title: 'Location Detected', description: 'Pickup set to your current spot.' });
        },
        () => {
          setPickup("Darbhanga Tower, Darbhanga");
          setIsDetectingLocation(false);
          toast({ title: 'Location Set', description: 'Using central Darbhanga as pickup.' });
        }
      );
    } else {
      setPickup("Darbhanga Tower, Darbhanga");
      setIsDetectingLocation(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!pickup || !destination) {
      toast({ variant: 'destructive', title: 'Missing details', description: 'Please enter both pickup and destination.' });
      return;
    }

    if (activeTab === 'parcel' && (!receiverName || !receiverPhone)) {
      toast({ variant: 'destructive', title: 'Receiver Details Needed', description: 'Please enter the receiver name and contact number.' });
      return;
    }

    setIsSubmitting(true);
    const selectedRideType = activeTab === 'parcel' ? 'Parcel' : rideType;
    const parcelDetails = activeTab === 'parcel' ? {
      receiverName,
      receiverPhone,
      packageType,
      senderName: 'Aditya Kumar',
      senderPhone: '+91 98765 43210',
    } : undefined;

    onBookingRequest(pickup, destination, selectedRideType, parcelDetails);
  };

  const SuggestionsBox = ({ suggestions, onSelect, type }: { suggestions: string[], onSelect: (loc: string, type: 'pickup' | 'destination') => void, type: 'pickup' | 'destination' }) => {
    if (suggestions.length === 0) return null;
    return (
      <div className="absolute z-30 w-full mt-1 bg-popover border rounded-xl shadow-2xl max-h-48 overflow-y-auto divide-y divide-border">
        {suggestions.map((suggestion, index) => (
          <div
            key={index}
            onClick={() => onSelect(suggestion, type)}
            className="p-3 hover:bg-amber-500/10 cursor-pointer text-sm font-medium flex items-center gap-2"
          >
            <MapPin className="h-4 w-4 text-amber-500 shrink-0" />
            <span>{suggestion}</span>
          </div>
        ))}
      </div>
    );
  };

  const rideOptions = [
    {
      type: 'Bike',
      title: 'Bike Taxi',
      subtitle: 'Fastest in traffic, 1 seat',
      tag: 'Cheapest',
      icon: Bike,
      fare: '₹35',
      eta: '2 min',
    },
    {
      type: 'Auto',
      title: 'Mithila Auto (गाड़ी)',
      subtitle: 'Doorstep pickup, 3 seats',
      tag: 'Popular',
      icon: Car,
      fare: '₹55',
      eta: '3 min',
    },
    {
      type: 'Cab',
      title: 'Mithila Cab (गाड़ी)',
      subtitle: 'Comfortable AC, 4 seats',
      tag: 'AC Comfort',
      icon: Car,
      fare: '₹95',
      eta: '4 min',
    },
  ];

  return (
    <div className="w-full max-w-lg mx-auto">
      <Card className="border-2 border-amber-400/50 shadow-xl rounded-2xl overflow-hidden bg-card">
        {/* Mithila गाड़ी Yellow Top Bar */}
        <div className="bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500 p-3 sm:p-4 text-black">
          <div className="flex items-center justify-between gap-1">
            <div className="flex items-center gap-1.5">
              <span className="bg-black text-amber-400 font-black text-xs px-2 py-0.5 rounded tracking-wide uppercase">
                Mithila गाड़ी
              </span>
              <span className="font-bold text-sm sm:text-base">Instant Ride</span>
            </div>
            <div className="flex items-center gap-1 text-[11px] font-bold bg-black/10 px-2 py-0.5 rounded-full shrink-0">
              <Shield className="h-3 w-3 text-black shrink-0" />
              <span>OTP & Safe</span>
            </div>
          </div>

          {/* Mode Switcher */}
          <div className="mt-3 flex gap-2 p-1 bg-black/15 rounded-xl">
            <button
              type="button"
              onClick={() => { setActiveTab('ride'); setRideType('Bike'); }}
              className={cn(
                "flex-1 py-1.5 text-sm font-bold rounded-lg transition-all flex items-center justify-center gap-2",
                activeTab === 'ride' ? "bg-black text-amber-400 shadow-md" : "text-black/80 hover:text-black"
              )}
            >
              <Bike className="h-4 w-4" />
              <span>Book Ride</span>
            </button>
            <button
              type="button"
              onClick={() => { setActiveTab('parcel'); setRideType('Parcel'); }}
              className={cn(
                "flex-1 py-1.5 text-sm font-bold rounded-lg transition-all flex items-center justify-center gap-2",
                activeTab === 'parcel' ? "bg-black text-amber-400 shadow-md" : "text-black/80 hover:text-black"
              )}
            >
              <Package className="h-4 w-4" />
              <span>Send Parcel</span>
            </button>
          </div>
        </div>

        <CardContent className="p-5">
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Pickup */}
            <div className="space-y-1.5 relative" ref={pickupRef}>
              <Label htmlFor="pickup" className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                Pickup Location
              </Label>
              <div className="relative">
                <div className="absolute left-3 top-1/2 -translate-y-1/2 h-2.5 w-2.5 rounded-full bg-emerald-500 ring-4 ring-emerald-500/20" />
                <Input
                  id="pickup"
                  placeholder="Enter pickup point"
                  value={pickup}
                  onChange={handlePickupChange}
                  onFocus={() => { if (pickup) setActiveSuggestionBox('pickup'); }}
                  required
                  className="pl-9 pr-10 h-11 bg-muted/30 border-muted-foreground/20 rounded-xl font-medium focus-visible:ring-amber-400"
                  autoComplete="off"
                />
                <Button
                  type="button"
                  size="icon"
                  variant="ghost"
                  className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8 hover:bg-amber-400/20 text-amber-600 dark:text-amber-400"
                  onClick={handleDetectLocation}
                  disabled={isDetectingLocation}
                  title="Detect my location"
                >
                  {isDetectingLocation ? <Loader2 className="h-4 w-4 animate-spin" /> : <Target className="h-4 w-4" />}
                </Button>
              </div>
              {activeSuggestionBox === 'pickup' && (
                <SuggestionsBox suggestions={pickupSuggestions} onSelect={handleSuggestionClick} type="pickup" />
              )}
            </div>

            {/* Destination */}
            <div className="space-y-1.5 relative" ref={destinationRef}>
              <Label htmlFor="destination" className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                {activeTab === 'parcel' ? 'Delivery Destination' : 'Drop Location'}
              </Label>
              <div className="relative">
                <div className="absolute left-3 top-1/2 -translate-y-1/2 h-2.5 w-2.5 rounded-full bg-amber-500 ring-4 ring-amber-500/20" />
                <Input
                  id="destination"
                  placeholder="Where are you going?"
                  value={destination}
                  onChange={handleDestinationChange}
                  onFocus={() => { if (destination) setActiveSuggestionBox('destination'); }}
                  required
                  className="pl-9 h-11 bg-muted/30 border-muted-foreground/20 rounded-xl font-medium focus-visible:ring-amber-400"
                  autoComplete="off"
                />
              </div>
              {activeSuggestionBox === 'destination' && (
                <SuggestionsBox suggestions={destinationSuggestions} onSelect={handleSuggestionClick} type="destination" />
              )}
            </div>

            {/* Parcel Details Inputs */}
            {activeTab === 'parcel' && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="space-y-3 pt-2 border-t border-border"
              >
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <Label className="text-xs font-semibold text-muted-foreground">Receiver Name</Label>
                    <div className="relative">
                      <UserIcon className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                      <Input
                        placeholder="John Doe"
                        value={receiverName}
                        onChange={(e) => setReceiverName(e.target.value)}
                        required
                        className="pl-8 h-9 text-sm"
                      />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs font-semibold text-muted-foreground">Receiver Phone</Label>
                    <div className="relative">
                      <Phone className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                      <Input
                        placeholder="+91 98xxx xxxxx"
                        value={receiverPhone}
                        onChange={(e) => setReceiverPhone(e.target.value)}
                        required
                        className="pl-8 h-9 text-sm"
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-1">
                  <Label className="text-xs font-semibold text-muted-foreground">Package Type</Label>
                  <div className="grid grid-cols-4 gap-1.5">
                    {['Documents', 'Food', 'Clothes', 'Other'].map((cat) => (
                      <button
                        type="button"
                        key={cat}
                        onClick={() => setPackageType(cat)}
                        className={cn(
                          "py-1.5 px-2 text-xs font-medium rounded-lg border text-center transition-all",
                          packageType === cat ? "border-amber-500 bg-amber-500/10 text-amber-600 font-bold" : "border-border hover:bg-muted"
                        )}
                      >
                        {cat}
                      </button>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}

            {/* Ride Type Selection (for normal rides) */}
            {activeTab === 'ride' && (
              <div className="space-y-2 pt-2">
                <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                  Choose Ride
                </Label>
                <div className="space-y-2">
                  {rideOptions.map((opt) => (
                    <motion.div
                      key={opt.type}
                      onClick={() => setRideType(opt.type as RideType)}
                      whileHover={{ scale: 1.01 }}
                      whileTap={{ scale: 0.99 }}
                      className={cn(
                        "relative flex items-center justify-between p-3 rounded-xl border-2 cursor-pointer transition-all",
                        rideType === opt.type
                          ? "border-amber-500 bg-amber-500/10 shadow-md"
                          : "border-border/70 hover:border-amber-400/50 bg-card"
                      )}
                    >
                      <div className="flex items-center gap-3">
                        <div className={cn(
                          "h-11 w-11 rounded-xl flex items-center justify-center font-bold",
                          rideType === opt.type ? "bg-amber-400 text-black shadow" : "bg-muted text-muted-foreground"
                        )}>
                          <opt.icon className="h-6 w-6" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="font-bold text-sm leading-none">{opt.title}</h4>
                            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-amber-400/30 text-amber-800 dark:text-amber-300">
                              {opt.tag}
                            </span>
                          </div>
                          <p className="text-xs text-muted-foreground mt-1">{opt.subtitle}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-black text-base text-foreground">{opt.fare}</p>
                        <p className="text-[11px] text-emerald-600 font-semibold">{opt.eta} away</p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            )}

            {/* Submit Button */}
            <Button
              type="submit"
              className="w-full h-12 rounded-xl font-black text-base uppercase tracking-wide bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500 hover:from-amber-500 hover:to-yellow-500 text-black shadow-lg shadow-amber-400/20 transition-all"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Booking...</>
              ) : activeTab === 'parcel' ? (
                'Book Parcel Delivery (पार्सल)'
              ) : (
                `Book ${rideType === 'Bike' ? 'Bike Taxi' : rideType === 'Auto' ? 'Auto (गाड़ी)' : 'Cab (गाड़ी)'}`
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
