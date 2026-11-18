'use client';

import { useEffect, useState } from 'react';
import type { Ride, RideType } from '@/lib/data';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Clock, IndianRupee, ShieldCheck, MapPin, ArrowRight, Zap, CheckCircle2, Bike, Car, Package } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface FareEstimateProps {
  rideDetails: Partial<Ride> & { parcelDetails?: any };
  onConfirm: (estimate: { fare: number; distance: number }) => void;
  onCancel: () => void;
}

export function FareEstimate({ rideDetails, onConfirm, onCancel }: FareEstimateProps) {
  const [distance, setDistance] = useState(4.2);
  const [durationMin, setDurationMin] = useState(12);
  const [fare, setFare] = useState(38);
  const [baseFare, setBaseFare] = useState(20);
  const [perKmCharge, setPerKmCharge] = useState(18);

  const rideType = (rideDetails.rideType as RideType) || 'Bike';

  useEffect(() => {
    // Generate realistic distance based on locations
    const dist = parseFloat((Math.random() * 4 + 2.5).toFixed(1));
    setDistance(dist);

    let base = 20;
    let rate = 8;
    let time = Math.round(dist * 2.8);

    if (rideType === 'Bike') {
      base = 20;
      rate = 8;
    } else if (rideType === 'Auto') {
      base = 30;
      rate = 12;
      time = Math.round(dist * 3.2);
    } else if (rideType === 'Cab') {
      base = 50;
      rate = 16;
      time = Math.round(dist * 3.5);
    } else if (rideType === 'Parcel') {
      base = 35;
      rate = 9;
      time = Math.round(dist * 2.5);
    } else {
      base = 25;
      rate = 10;
    }

    const distCharge = Math.round(dist * rate);
    const total = base + distCharge + 3; // + ₹3 platform fee

    setBaseFare(base);
    setPerKmCharge(distCharge);
    setFare(total);
    setDurationMin(Math.max(5, time));
  }, [rideType]);

  const getIcon = () => {
    if (rideType === 'Bike') return <Bike className="h-6 w-6 text-black" />;
    if (rideType === 'Parcel') return <Package className="h-6 w-6 text-black" />;
    return <Car className="h-6 w-6 text-black" />;
  };

  return (
    <div className="w-full max-w-md mx-auto">
      <Card className="border-2 border-amber-400 shadow-2xl rounded-2xl overflow-hidden bg-card">
        {/* Header */}
        <div className="bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500 p-4 text-black">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="h-9 w-9 rounded-xl bg-black text-amber-400 flex items-center justify-center font-bold">
                {getIcon()}
              </div>
              <div>
                <h3 className="font-black text-lg leading-tight">
                  {rideType === 'Bike'
                    ? 'Bike Taxi'
                    : rideType === 'Auto'
                    ? 'Mithila Auto (गाड़ी)'
                    : rideType === 'Parcel'
                    ? 'Parcel Delivery (पार्सल)'
                    : 'Mithila Cab (गाड़ी)'}
                </h3>
                <p className="text-xs font-semibold text-black/80">Affordable & Fast</p>
              </div>
            </div>
            <div className="text-right">
              <span className="text-2xl font-black">₹{fare}</span>
              <p className="text-[10px] uppercase font-bold text-black/70">Fixed Fare</p>
            </div>
          </div>
        </div>

        <CardContent className="p-5 space-y-4">
          {/* Route Card */}
          <div className="p-3 rounded-xl bg-muted/40 border border-border space-y-2">
            <div className="flex items-start gap-2.5">
              <div className="mt-1 h-2.5 w-2.5 rounded-full bg-emerald-500 shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-[11px] font-bold text-muted-foreground uppercase">Pickup</p>
                <p className="text-xs font-semibold truncate text-foreground">
                  {rideDetails.pickupLocation || 'Darbhanga Tower, Darbhanga'}
                </p>
              </div>
            </div>
            <div className="ml-1 border-l-2 border-dashed border-muted-foreground/30 h-3" />
            <div className="flex items-start gap-2.5">
              <div className="mt-1 h-2.5 w-2.5 rounded-full bg-amber-500 shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-[11px] font-bold text-muted-foreground uppercase">Drop</p>
                <p className="text-xs font-semibold truncate text-foreground">
                  {rideDetails.destinationLocation || 'DMCH Hospital, Darbhanga'}
                </p>
              </div>
            </div>
          </div>

          {/* Quick Metrics */}
          <div className="grid grid-cols-2 gap-2 text-center">
            <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/20">
              <p className="text-xs text-muted-foreground font-medium">Est. Distance</p>
              <p className="text-base font-bold text-foreground mt-0.5">{distance} km</p>
            </div>
            <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
              <p className="text-xs text-muted-foreground font-medium">Est. Travel Time</p>
              <p className="text-base font-bold text-emerald-600 dark:text-emerald-400 mt-0.5">
                ~ {durationMin} mins
              </p>
            </div>
          </div>

          {/* Fare Breakdown */}
          <div className="space-y-1.5 pt-2 border-t border-border text-xs">
            <div className="flex justify-between text-muted-foreground">
              <span>Base Fare</span>
              <span>₹{baseFare}</span>
            </div>
            <div className="flex justify-between text-muted-foreground">
              <span>Distance Charge ({distance} km)</span>
              <span>₹{perKmCharge}</span>
            </div>
            <div className="flex justify-between text-muted-foreground">
              <span>Platform & Safety Fee</span>
              <span>₹3</span>
            </div>
            <div className="flex justify-between font-bold text-sm text-foreground pt-1.5 border-t border-border">
              <span>Total Payable</span>
              <span className="text-amber-500">₹{fare}</span>
            </div>
          </div>

          {/* Safety Check */}
          <div className="flex items-center gap-2 p-2.5 rounded-xl bg-amber-400/10 border border-amber-400/30 text-xs font-medium text-amber-800 dark:text-amber-300">
            <ShieldCheck className="h-4 w-4 shrink-0 text-amber-600 dark:text-amber-400" />
            <span>Clean Helmet Provided • 4-Digit Ride Start OTP • Live GPS</span>
          </div>
        </CardContent>

        <CardFooter className="p-4 pt-0 flex gap-2">
          <Button variant="outline" onClick={onCancel} className="flex-1 rounded-xl h-11 font-semibold">
            Cancel
          </Button>
          <Button
            onClick={() => onConfirm({ fare, distance })}
            className="flex-1 rounded-xl h-11 bg-amber-400 hover:bg-amber-500 text-black font-black uppercase shadow-lg shadow-amber-400/20"
          >
            Confirm & Match
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
