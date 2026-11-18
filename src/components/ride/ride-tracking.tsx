'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import type { Ride } from '@/lib/data';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Bike, Car, Star, Phone, ShieldAlert, KeyRound, MapPin, CheckCircle2, Navigation } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

interface RideTrackingProps {
  rideDetails: Ride & { otp?: string };
  onComplete: () => void;
  onCancel: () => void;
}

const rideStages = [
  { status: 'Captain is on the way', eta: 3, duration: 4500, progress: 25 },
  { status: 'Captain has arrived at pickup', eta: 0, duration: 3500, progress: 50 },
  { status: 'OTP Verified • Ride in progress', eta: 7, duration: 6000, progress: 85 },
  { status: 'Arriving at destination', eta: 1, duration: 2500, progress: 100 },
];

export function RideTracking({ rideDetails, onComplete, onCancel }: RideTrackingProps) {
  const [stageIndex, setStageIndex] = useState(0);
  const [progress, setProgress] = useState(25);
  const { toast } = useToast();

  const otp = rideDetails.otp || '4821';
  const driver = rideDetails.driver;

  useEffect(() => {
    if (stageIndex < rideStages.length) {
      const timer = setTimeout(() => {
        setStageIndex((prev) => prev + 1);
      }, rideStages[stageIndex].duration);

      return () => clearTimeout(timer);
    } else {
      const completionTimer = setTimeout(onComplete, 1200);
      return () => clearTimeout(completionTimer);
    }
  }, [stageIndex, onComplete]);

  useEffect(() => {
    if (stageIndex < rideStages.length) {
      setProgress(rideStages[stageIndex].progress);
    }
  }, [stageIndex]);

  const handleSOS = () => {
    toast({
      variant: 'destructive',
      title: '🚨 Emergency SOS Triggered',
      description: 'Mithila गाड़ी 24/7 Safety Desk & local emergency helpline alerted to your location.',
    });
  };

  const currentStage = rideStages[stageIndex] || rideStages[rideStages.length - 1];

  return (
    <div className="w-full max-w-lg mx-auto space-y-3">
      <Card className="border-2 border-amber-400 shadow-2xl rounded-2xl overflow-hidden bg-card">
        {/* Rapido Yellow Top Bar */}
        <div className="bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500 p-4 text-black">
          <div className="flex items-center justify-between">
            <div>
              <span className="bg-black text-amber-400 font-black text-[10px] px-2 py-0.5 rounded tracking-wider uppercase">
                Active Ride
              </span>
              <h2 className="font-black text-lg leading-tight mt-1">{currentStage.status}</h2>
            </div>
            <div className="text-right">
              <span className="text-2xl font-black">{currentStage.eta}</span>
              <span className="text-xs font-bold block -mt-1">MINS ETA</span>
            </div>
          </div>
          <div className="mt-3">
            <Progress value={progress} className="h-2 bg-black/20 [&>div]:bg-black" />
          </div>
        </div>

        <CardContent className="p-5 space-y-4">
          {/* Rapido Ride OTP Highlight Banner */}
          <div className="flex items-center justify-between p-3.5 rounded-xl bg-amber-400/15 border-2 border-amber-400 text-foreground">
            <div className="flex items-center gap-2.5">
              <div className="h-10 w-10 rounded-xl bg-amber-400 flex items-center justify-center text-black font-black">
                <KeyRound className="h-5 w-5" />
              </div>
              <div>
                <p className="text-xs font-extrabold uppercase tracking-wide text-amber-600 dark:text-amber-400">
                  Start Ride OTP (PIN)
                </p>
                <p className="text-[11px] text-muted-foreground">Share with Captain when boarding</p>
              </div>
            </div>
            <div className="text-right">
              <span className="font-mono text-2xl font-black tracking-widest text-foreground bg-card px-3 py-1 rounded-lg border border-amber-400 shadow-sm">
                {otp}
              </span>
            </div>
          </div>

          {/* Captain Profile Card */}
          {driver && (
            <div className="flex items-center justify-between p-3.5 rounded-xl bg-muted/40 border border-border">
              <div className="flex items-center gap-3">
                <Avatar className="h-12 w-12 border-2 border-amber-400">
                  <AvatarImage src={driver.image?.imageUrl || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150'} />
                  <AvatarFallback>{driver.name.charAt(0)}</AvatarFallback>
                </Avatar>
                <div>
                  <div className="flex items-center gap-1.5">
                    <h4 className="font-bold text-sm text-foreground">{driver.name}</h4>
                    <span className="flex items-center text-xs font-bold text-amber-500">
                      ★ {driver.rating}
                    </span>
                  </div>
                  <p className="text-xs font-semibold text-muted-foreground">{driver.vehicle}</p>
                  <p className="font-mono text-xs font-bold text-foreground bg-muted px-1.5 py-0.5 rounded inline-block mt-0.5">
                    {driver.licensePlate}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  size="icon"
                  variant="outline"
                  className="rounded-full h-10 w-10 border-emerald-500 text-emerald-600 hover:bg-emerald-500/10"
                  onClick={() => toast({ title: 'Calling Captain...', description: `${driver.name} (+91 98350 11223)` })}
                  title="Call Captain"
                >
                  <Phone className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}

          {/* Route Info */}
          <div className="p-3 rounded-xl bg-muted/20 border border-border space-y-2 text-xs">
            <div className="flex items-start gap-2">
              <div className="mt-1 h-2 w-2 rounded-full bg-emerald-500 shrink-0" />
              <div className="truncate">
                <span className="font-bold text-muted-foreground">Pickup: </span>
                <span className="font-semibold text-foreground">{rideDetails.pickupLocation}</span>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <div className="mt-1 h-2 w-2 rounded-full bg-amber-500 shrink-0" />
              <div className="truncate">
                <span className="font-bold text-muted-foreground">Drop: </span>
                <span className="font-semibold text-foreground">{rideDetails.destinationLocation}</span>
              </div>
            </div>
            <div className="flex justify-between items-center pt-1 border-t border-border font-bold">
              <span>Fare: ₹{rideDetails.fareAmount}</span>
              <span className="text-emerald-600">Payment: Cash / UPI at drop</span>
            </div>
          </div>
        </CardContent>

        <CardFooter className="p-4 pt-0 flex gap-2">
          {/* Emergency SOS */}
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="outline" className="flex-1 rounded-xl h-11 border-destructive text-destructive hover:bg-destructive/10 font-bold">
                <ShieldAlert className="mr-2 h-4 w-4" /> Emergency SOS
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent className="rounded-2xl">
              <AlertDialogHeader>
                <AlertDialogTitle className="text-destructive font-black">Confirm SOS Alert</AlertDialogTitle>
                <AlertDialogDescription>
                  This triggers Mithila गाड़ी 24/7 Safety Command and alerts your emergency contacts with your live GPS location.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel className="rounded-xl">Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={handleSOS} className="bg-destructive hover:bg-destructive/90 text-destructive-foreground rounded-xl font-bold">
                  Activate SOS
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>

          <Button
            variant="ghost"
            onClick={onCancel}
            className="flex-1 rounded-xl h-11 text-muted-foreground hover:text-foreground font-semibold"
          >
            Cancel Trip
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
