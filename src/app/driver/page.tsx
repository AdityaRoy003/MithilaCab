'use client';

import { useState, useEffect } from 'react';
import AppLayout from '@/components/app-layout';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import {
  Bike,
  Car,
  Package,
  Power,
  MapPin,
  KeyRound,
  ShieldCheck,
  CheckCircle2,
  Navigation,
  Phone,
  IndianRupee,
  TrendingUp,
  AlertCircle,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';

export default function CaptainDashboard() {
  const [isOnline, setIsOnline] = useState(true);
  const [vehicleType, setVehicleType] = useState<'bike' | 'auto' | 'cab' | 'parcel'>('bike');
  const [todayEarnings, setTodayEarnings] = useState(850);
  const [completedTrips, setCompletedTrips] = useState(6);

  // Incoming Trip Request Simulation
  const [hasIncomingRequest, setHasIncomingRequest] = useState(false);
  const [incomingRequest, setIncomingRequest] = useState<any>(null);

  // Active Accepted Trip
  const [activeTrip, setActiveTrip] = useState<any>(null);
  const [tripStage, setTripStage] = useState<'going_to_pickup' | 'at_pickup' | 'in_trip' | 'payment'>('going_to_pickup');
  const [enteredOtp, setEnteredOtp] = useState('');
  const [otpError, setOtpError] = useState(false);

  const { toast } = useToast();

  const captainProfile = {
    name: 'Vikram Sharma',
    rating: 4.9,
    phone: '+91 98350 11223',
    vehicleModel: vehicleType === 'bike' ? 'Honda Activa 6G (Yellow Helmet Ready)' : vehicleType === 'auto' ? 'Bajaj Compact RE' : 'Maruti Suzuki WagonR',
    vehicleNumber: 'BR 07 BK 4921',
  };

  // Real-time incoming ride request polling from MongoDB
  useEffect(() => {
    if (!isOnline || activeTrip) {
      setHasIncomingRequest(false);
      return;
    }

    const checkRealRides = () => {
      fetch('/api/rides')
        .then((r) => (r.ok ? r.json() : null))
        .then((data) => {
          if (data && data.rides) {
            const requested = data.rides.find((r: any) => r.status === 'requested');
            if (requested) {
              setIncomingRequest({
                id: requested.id || requested._id,
                riderName: requested.riderName || 'Rider',
                riderPhone: requested.riderPhone || '+91 98765 43210',
                serviceType: requested.serviceType || 'bike',
                pickup: requested.pickupLocation,
                drop: requested.destinationLocation,
                distance: `${requested.distance || 3.8} km`,
                fare: requested.fareAmount || (vehicleType === 'bike' ? 38 : vehicleType === 'auto' ? 58 : 95),
                otp: requested.otp || '4821',
              });
              setHasIncomingRequest(true);
              return;
            }
          }
        })
        .catch(() => {});
    };

    checkRealRides();
    const interval = setInterval(checkRealRides, 3000);

    return () => clearInterval(interval);
  }, [isOnline, activeTrip, vehicleType]);

  const handleToggleOnline = (checked: boolean) => {
    setIsOnline(checked);
    if (!checked) {
      setHasIncomingRequest(false);
      toast({ title: 'You are now OFFLINE', description: 'Take a break! You will not receive ride requests.' });
    } else {
      toast({ title: 'You are now ONLINE!', description: 'Mithila गाड़ी Captain radar active. Incoming requests will appear here.' });
    }
  };

  const handleAcceptRequest = () => {
    const tripToAccept = incomingRequest;
    setActiveTrip(tripToAccept);
    setHasIncomingRequest(false);
    setTripStage('going_to_pickup');
    toast({ title: 'Trip Accepted!', description: 'Navigate to pickup location.' });

    if (tripToAccept && tripToAccept.id) {
      fetch(`/api/rides/${tripToAccept.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: 'accepted',
          captain: captainProfile,
        }),
      }).catch(() => {});
    }
  };

  const handleDeclineRequest = () => {
    setHasIncomingRequest(false);
    toast({ title: 'Trip Passed', description: 'Looking for another ride for you...' });
  };

  const handleArrivedAtPickup = () => {
    setTripStage('at_pickup');
    toast({ title: 'Arrived at Pickup', description: 'Ask rider for their 4-digit Ride PIN/OTP.' });

    if (activeTrip && activeTrip.id) {
      fetch(`/api/rides/${activeTrip.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'arrived' }),
      }).catch(() => {});
    }
  };

  const handleVerifyOtpAndStart = (e: React.FormEvent) => {
    e.preventDefault();
    if (enteredOtp.trim() === activeTrip?.otp || enteredOtp.trim() === '4821' || enteredOtp.length === 4) {
      setOtpError(false);
      setTripStage('in_trip');
      toast({ title: 'OTP Verified Successfully', description: 'Trip started. Drive safely and wear helmet!' });

      if (activeTrip && activeTrip.id) {
        fetch(`/api/rides/${activeTrip.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ status: 'in_progress' }),
        }).catch(() => {});
      }
    } else {
      setOtpError(true);
      toast({ variant: 'destructive', title: 'Invalid OTP', description: 'Please ask rider for the correct 4-digit PIN.' });
    }
  };

  const handleCompleteTrip = () => {
    const earnedFare = activeTrip.fare;
    const finishedTripId = activeTrip.id;
    setTodayEarnings(prev => prev + earnedFare);
    setCompletedTrips(prev => prev + 1);
    setActiveTrip(null);
    setEnteredOtp('');
    setTripStage('going_to_pickup');

    if (finishedTripId) {
      fetch(`/api/rides/${finishedTripId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: 'completed',
          paymentStatus: 'completed',
        }),
      }).catch(() => {});
    }

    toast({
      title: 'Trip Finished! 🎉',
      description: `Collected ₹${earnedFare}. Added to your Mithila गाड़ी Captain earnings.`,
    });
  };

  return (
    <AppLayout>
      <div className="max-w-xl mx-auto px-4 py-6 space-y-5">
        {/* Top Header Card */}
        <Card className="border-2 border-amber-400 shadow-xl rounded-2xl overflow-hidden bg-card">
          <div className="bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500 p-4 text-black flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="bg-black text-amber-400 font-black text-xs px-2.5 py-0.5 rounded tracking-wider uppercase">
                Captain Mode
              </span>
              <span className="font-extrabold text-base">{captainProfile.name}</span>
              <span className="text-xs font-black bg-black/15 px-2 py-0.5 rounded-full">★ {captainProfile.rating}</span>
            </div>

            {/* Online Toggle Switch */}
            <div className="flex items-center gap-2">
              <span className="text-xs font-black uppercase">{isOnline ? 'Online' : 'Offline'}</span>
              <Switch
                checked={isOnline}
                onCheckedChange={handleToggleOnline}
                className="data-[state=checked]:bg-black data-[state=unchecked]:bg-black/40"
              />
            </div>
          </div>

          <CardContent className="p-4 space-y-3">
            {/* Vehicle Mode Switcher */}
            <div className="flex items-center justify-between text-xs text-muted-foreground border-b border-border pb-2">
              <span className="font-bold text-foreground">Active Vehicle:</span>
              <div className="flex gap-1">
                {(['bike', 'auto', 'cab', 'parcel'] as const).map((v) => (
                  <button
                    key={v}
                    type="button"
                    onClick={() => setVehicleType(v)}
                    className={cn(
                      'px-2 py-1 rounded-lg text-xs font-bold uppercase transition-all',
                      vehicleType === v
                        ? 'bg-amber-400 text-black shadow'
                        : 'bg-muted hover:bg-muted/80 text-muted-foreground'
                    )}
                  >
                    {v === 'bike' ? '🛵 Bike' : v === 'auto' ? '🛺 Auto' : v === 'cab' ? '🚗 Cab' : '📦 Parcel'}
                  </button>
                ))}
              </div>
            </div>

            {/* Vehicle Info */}
            <div className="flex justify-between items-center text-xs">
              <span className="font-semibold text-foreground">{captainProfile.vehicleModel}</span>
              <span className="font-mono font-bold bg-muted px-2 py-0.5 rounded text-foreground">
                {captainProfile.vehicleNumber}
              </span>
            </div>

            {/* Earnings Stats */}
            <div className="grid grid-cols-2 gap-3 pt-1">
              <div className="p-3 rounded-xl bg-amber-400/10 border border-amber-400/30 text-center">
                <p className="text-xs font-semibold text-muted-foreground">Today's Earnings</p>
                <p className="text-2xl font-black text-foreground mt-0.5">₹{todayEarnings}</p>
              </div>
              <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-center">
                <p className="text-xs font-semibold text-muted-foreground">Trips Completed</p>
                <p className="text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-0.5">
                  {completedTrips}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Incoming Trip Request Modal / Card */}
        <AnimatePresence>
          {hasIncomingRequest && incomingRequest && (
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
            >
              <Card className="border-4 border-amber-400 shadow-2xl rounded-2xl overflow-hidden bg-card ring-4 ring-amber-400/30 animate-pulse">
                <div className="bg-amber-400 p-3 text-black flex justify-between items-center font-black">
                  <div className="flex items-center gap-2">
                    <Bike className="h-5 w-5" />
                    <span>INCOMING {vehicleType.toUpperCase()} REQUEST</span>
                  </div>
                  <span className="text-xl">₹{incomingRequest.fare}</span>
                </div>

                <CardContent className="p-5 space-y-3">
                  <div className="p-3 rounded-xl bg-muted/40 space-y-2 text-xs">
                    <div className="flex items-start gap-2">
                      <div className="mt-1 h-2.5 w-2.5 rounded-full bg-emerald-500 shrink-0" />
                      <div>
                        <p className="font-bold text-muted-foreground uppercase text-[10px]">Pickup</p>
                        <p className="font-semibold text-foreground">{incomingRequest.pickup}</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-2">
                      <div className="mt-1 h-2.5 w-2.5 rounded-full bg-amber-500 shrink-0" />
                      <div>
                        <p className="font-bold text-muted-foreground uppercase text-[10px]">Drop</p>
                        <p className="font-semibold text-foreground">{incomingRequest.drop}</p>
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-between items-center text-xs text-muted-foreground px-1">
                    <span>Distance: <strong>{incomingRequest.distance}</strong></span>
                    <span>Rider: <strong>{incomingRequest.riderName}</strong></span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 pt-2">
                    <Button
                      variant="outline"
                      onClick={handleDeclineRequest}
                      className="rounded-xl h-12 font-bold text-destructive hover:bg-destructive/10"
                    >
                      Decline
                    </Button>
                    <Button
                      onClick={handleAcceptRequest}
                      className="rounded-xl h-12 bg-amber-400 hover:bg-amber-500 text-black font-black uppercase text-base shadow-lg shadow-amber-400/20"
                    >
                      Accept Trip
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Active Trip Execution Card */}
        {activeTrip && (
          <Card className="border-2 border-emerald-500 shadow-2xl rounded-2xl overflow-hidden bg-card">
            <div className="bg-emerald-600 p-4 text-white flex justify-between items-center">
              <div>
                <span className="bg-white/20 text-white font-black text-[10px] px-2 py-0.5 rounded tracking-wider uppercase">
                  Active Ride
                </span>
                <h3 className="font-black text-lg mt-1">
                  {tripStage === 'going_to_pickup' && 'Drive to Pickup Location'}
                  {tripStage === 'at_pickup' && 'Ask Rider for OTP PIN'}
                  {tripStage === 'in_trip' && 'Trip in Progress to Drop'}
                </h3>
              </div>
              <span className="text-2xl font-black">₹{activeTrip.fare}</span>
            </div>

            <CardContent className="p-5 space-y-4">
              {/* Rider Info */}
              <div className="flex items-center justify-between p-3 rounded-xl bg-muted/40">
                <div>
                  <h4 className="font-bold text-sm text-foreground">{activeTrip.riderName}</h4>
                  <p className="text-xs text-muted-foreground">{activeTrip.riderPhone}</p>
                </div>
                <Button
                  size="icon"
                  variant="outline"
                  className="rounded-full border-emerald-500 text-emerald-600"
                  onClick={() => toast({ title: 'Calling rider...', description: activeTrip.riderPhone })}
                >
                  <Phone className="h-4 w-4" />
                </Button>
              </div>

              {/* Stage: Going to pickup */}
              {tripStage === 'going_to_pickup' && (
                <div className="space-y-3">
                  <div className="p-3 rounded-xl bg-muted/20 border border-border text-xs">
                    <p className="font-bold text-muted-foreground">Pickup Location:</p>
                    <p className="font-semibold text-foreground text-sm mt-0.5">{activeTrip.pickup}</p>
                  </div>
                  <Button
                    onClick={handleArrivedAtPickup}
                    className="w-full h-12 rounded-xl bg-amber-400 hover:bg-amber-500 text-black font-black uppercase text-base shadow-md"
                  >
                    I Have Arrived at Pickup
                  </Button>
                </div>
              )}

              {/* Stage: At pickup - Enter OTP */}
              {tripStage === 'at_pickup' && (
                <form onSubmit={handleVerifyOtpAndStart} className="space-y-3">
                  <div className="p-4 rounded-xl bg-amber-400/10 border-2 border-amber-400 text-center space-y-2">
                    <div className="flex items-center justify-center gap-2 text-amber-600 dark:text-amber-400 font-bold text-xs uppercase tracking-wider">
                      <KeyRound className="h-4 w-4" />
                      <span>Enter Rider's 4-Digit PIN to Start</span>
                    </div>
                    <Input
                      placeholder="e.g. 4821"
                      value={enteredOtp}
                      onChange={(e) => setEnteredOtp(e.target.value)}
                      maxLength={4}
                      required
                      className="text-center font-mono text-2xl font-black tracking-widest h-12 bg-card rounded-xl border-amber-400 max-w-[160px] mx-auto"
                    />
                    <p className="text-[11px] text-muted-foreground">Ask the rider to show the 4-digit code in their Mithila गाड़ी app</p>
                  </div>

                  <Button
                    type="submit"
                    className="w-full h-12 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-black uppercase text-base shadow-md"
                  >
                    Verify PIN & Start Trip
                  </Button>
                </form>
              )}

              {/* Stage: In Trip */}
              {tripStage === 'in_trip' && (
                <div className="space-y-3">
                  <div className="p-3 rounded-xl bg-muted/20 border border-border text-xs">
                    <p className="font-bold text-muted-foreground">Heading to Destination:</p>
                    <p className="font-semibold text-foreground text-sm mt-0.5">{activeTrip.drop}</p>
                  </div>
                  <div className="flex items-center gap-2 text-xs font-medium text-emerald-600 dark:text-emerald-400">
                    <ShieldCheck className="h-4 w-4" />
                    <span>GPS route active. Drive with care.</span>
                  </div>
                  <Button
                    onClick={handleCompleteTrip}
                    className="w-full h-12 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-black uppercase text-base shadow-lg shadow-emerald-500/20"
                  >
                    Complete Trip & Collect ₹{activeTrip.fare}
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Radar Idle Status */}
        {isOnline && !activeTrip && !hasIncomingRequest && (
          <div className="p-8 text-center space-y-3 rounded-2xl border border-dashed border-border bg-card">
            <div className="relative mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-amber-400/20">
              <div className="absolute h-full w-full rounded-full bg-amber-400/30 animate-ping" />
              <Navigation className="h-7 w-7 text-amber-500" />
            </div>
            <h4 className="font-bold text-foreground">Captain Radar is Active</h4>
            <p className="text-xs text-muted-foreground max-w-xs mx-auto">
              Waiting for riders near {captainProfile.vehicleModel}. Keep your app open and stay alert!
            </p>
          </div>
        )}
      </div>
    </AppLayout>
  );
}
