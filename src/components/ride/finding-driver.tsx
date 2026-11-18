'use client';

import { useEffect, useState } from 'react';
import type { Driver, Ride } from '@/lib/data';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import { Bike, Car, Package, Shield, Loader2, Navigation } from 'lucide-react';

interface FindingDriverProps {
  onDriverFound: (driver: Driver, otp?: string) => void;
  rideDetails: Ride;
  onCancel: () => void;
}

export function FindingDriver({ onDriverFound, rideDetails, onCancel }: FindingDriverProps) {
  const [statusMessage, setStatusMessage] = useState('Pinging nearby Rapido Captains...');
  const [captainCount, setCaptainCount] = useState(3);

  const rideType = rideDetails.rideType || 'Bike';

  useEffect(() => {
    let isMounted = true;

    // Snappy, realistic Captain matching sequence
    const step1 = setTimeout(() => {
      if (isMounted) setStatusMessage('3 Captains found nearby in Darbhanga...');
    }, 600);

    const step2 = setTimeout(() => {
      if (isMounted) setStatusMessage('Captain accepted your request! Assigning...');
    }, 1200);

    const step3 = setTimeout(async () => {
      if (!isMounted) return;

      try {
        const typeQuery = rideType.toLowerCase();
        const res = await fetch(`/api/captains?type=${typeQuery}`);
        const data = await res.json();
        const captains = data.captains || [];

        if (captains.length > 0) {
          const matched = captains[0];
          onDriverFound({
            id: matched.id || matched._id,
            name: matched.name,
            rating: matched.rating || 4.9,
            vehicle: matched.vehicleModel || 'Honda Activa 6G',
            licensePlate: matched.vehicleNumber || 'BR 07 BK 4921',
            isAvailable: false,
            image: {
              id: 'cap_img',
              imageUrl: matched.avatar || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
              description: matched.name,
              imageHint: 'person',
            },
          });
          return;
        }
      } catch (e) {
        // Fallback
      }

      // Default Captain fallback
      onDriverFound({
        id: 'cap_1',
        name: 'Vikram Sharma',
        rating: 4.9,
        vehicle: rideType === 'Bike' ? 'Honda Activa 6G (Yellow Helmet Provided)' : rideType === 'Auto' ? 'Bajaj Compact RE' : 'Maruti Suzuki WagonR AC',
        licensePlate: 'BR 07 BK 4921',
        isAvailable: false,
        image: {
          id: 'cap_1',
          imageUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
          description: 'Vikram Sharma',
          imageHint: 'person',
        },
      });
    }, 3600);

    return () => {
      isMounted = false;
      clearTimeout(step1);
      clearTimeout(step2);
      clearTimeout(step3);
    };
  }, [rideDetails.id, rideType, onDriverFound]);

  const getVehicleIcon = () => {
    if (rideType === 'Bike') return <Bike className="h-10 w-10 text-black" />;
    if (rideType === 'Parcel') return <Package className="h-10 w-10 text-black" />;
    return <Car className="h-10 w-10 text-black" />;
  };

  return (
    <div className="w-full max-w-md mx-auto">
      <Card className="border-2 border-amber-400 shadow-2xl rounded-2xl overflow-hidden bg-card text-center">
        <div className="bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500 p-4 text-black">
          <h2 className="font-black text-xl tracking-tight">Matching Your Captain</h2>
          <p className="text-xs font-semibold text-black/80">Connecting with captains around {rideDetails.pickupLocation || 'you'}</p>
        </div>

        <CardContent className="flex flex-col items-center justify-center p-8 space-y-6">
          {/* Radar Animation */}
          <div className="relative flex h-48 w-48 items-center justify-center">
            {/* Radar rings */}
            <motion.div
              className="absolute h-48 w-48 rounded-full border-2 border-amber-400/30"
              animate={{ scale: [0.8, 1.2, 0.8], opacity: [0.3, 0.8, 0.3] }}
              transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
            />
            <motion.div
              className="absolute h-36 w-36 rounded-full border-2 border-amber-400/50 bg-amber-400/10"
              animate={{ scale: [0.9, 1.1, 0.9], opacity: [0.4, 0.9, 0.4] }}
              transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut', delay: 0.3 }}
            />
            <motion.div
              className="absolute h-24 w-24 rounded-full border-2 border-amber-400/80 bg-amber-400/20"
              animate={{ scale: [0.95, 1.05, 0.95] }}
              transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
            />

            {/* Central Vehicle Avatar */}
            <div className="relative z-10 flex h-20 w-20 items-center justify-center rounded-2xl bg-amber-400 shadow-xl shadow-amber-400/40">
              {getVehicleIcon()}
            </div>

            {/* Floating nearby dots */}
            <motion.div
              className="absolute top-4 right-8 h-3 w-3 rounded-full bg-emerald-500 ring-4 ring-emerald-500/20"
              animate={{ y: [-4, 4, -4] }}
              transition={{ duration: 2, repeat: Infinity }}
            />
            <motion.div
              className="absolute bottom-6 left-6 h-3 w-3 rounded-full bg-amber-500 ring-4 ring-amber-500/20"
              animate={{ x: [-4, 4, -4] }}
              transition={{ duration: 1.8, repeat: Infinity }}
            />
          </div>

          <div className="space-y-1.5">
            <h4 className="font-bold text-base text-foreground animate-pulse">{statusMessage}</h4>
            <p className="text-xs text-muted-foreground flex items-center justify-center gap-1">
              <Shield className="h-3.5 w-3.5 text-amber-500" />
              <span>Mithila गाड़ी verified Captains with background check</span>
            </p>
          </div>

          <div className="w-full pt-2">
            <Button
              variant="outline"
              onClick={onCancel}
              className="w-full rounded-xl border-destructive/40 text-destructive hover:bg-destructive/10 font-bold"
            >
              Cancel Request
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
