"use client";

import { useEffect, useState } from 'react';
import type { Ride, RideType } from '@/lib/data';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { ArrowRight, Clock, Map, IndianRupee, Zap, Lightbulb, Leaf } from 'lucide-react';
import { useDoc, useFirestore, useMemoFirebase } from '@/firebase';
import { doc } from 'firebase/firestore';
import { Badge } from '../ui/badge';
import { predictFare } from '@/ai/flows/fare-prediction-flow';

interface PlatformSettings {
    surgeMultiplier?: number;
    rideTypeSettings: {
        Share: { baseFare: number; perKmRate: number };
        Standard: { baseFare: number; perKmRate: number };
        Premium: { baseFare: number; perKmRate: number };
        SUV: { baseFare: number; perKmRate: number };
    };
}

interface FareEstimateProps {
  rideDetails: Partial<Ride>;
  onConfirm: (estimate: { fare: number; distance: number; }) => void;
  onCancel: () => void;
}

export function FareEstimate({ rideDetails, onConfirm, onCancel }: FareEstimateProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [estimate, setEstimate] = useState<{ distance: string; time: number; fare: number, surgeMultiplier: number; } | null>(null);
  const [breakdown, setBreakdown] = useState<{baseFare: number, distanceCharge: number} | null>(null);
  const [aiSuggestion, setAiSuggestion] = useState<string | null>(null);
  const [isSuggestionLoading, setIsSuggestionLoading] = useState(true);
  const [co2Estimate, setCo2Estimate] = useState<number | null>(null);

  const firestore = useFirestore();
  const settingsDocRef = useMemoFirebase(() => doc(firestore, 'settings', 'platform'), [firestore]);
  const { data: settings, isLoading: settingsLoading } = useDoc<PlatformSettings>(settingsDocRef);


  useEffect(() => {
    if (!settings) {
        setIsLoading(true);
        return;
    };
    
    const rideType = rideDetails.rideType || 'Standard';
    const rideSettings = settings.rideTypeSettings[rideType] || settings.rideTypeSettings.Standard;
    const surgeMultiplier = settings.surgeMultiplier ?? 1;
    
    const dist = Math.random() * 20 + 2;
    const baseFare = rideSettings.baseFare;
    const perKmRate = rideSettings.perKmRate;

    const distanceCharge = dist * perKmRate;
    const finalFare = Math.round((baseFare + distanceCharge) * surgeMultiplier);
    const travelTime = Math.round(dist * 2.5);
    
    setBreakdown({ baseFare, distanceCharge });
    setEstimate({
      distance: dist.toFixed(1),
      time: travelTime,
      fare: finalFare,
      surgeMultiplier,
    });
    
    if (rideType === 'Share') {
        setCo2Estimate(dist * 0.12);
    } else {
        setCo2Estimate(null);
    }

    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 500);

    return () => clearTimeout(timer);
  }, [rideDetails.rideType, settings]);

  useEffect(() => {
    const getFarePrediction = async () => {
        if (!rideDetails.pickupLocation || !rideDetails.destinationLocation) return;
        
        setIsSuggestionLoading(true);
        try {
            const prediction = await predictFare({
                pickupLocation: rideDetails.pickupLocation,
                destinationLocation: rideDetails.destinationLocation,
                currentTime: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
            });
            setAiSuggestion(prediction.suggestion);
        } catch (error) {
            console.error("Fare prediction error:", error);
            setAiSuggestion(null);
        } finally {
            setIsSuggestionLoading(false);
        }
    };
    
    getFarePrediction();
  }, [rideDetails.pickupLocation, rideDetails.destinationLocation]);


  const handleConfirm = () => {
    if (estimate) {
      onConfirm({ fare: estimate.fare, distance: parseFloat(estimate.distance) });
    }
  };
  
  const showSkeletons = isLoading || settingsLoading || !estimate || !breakdown;

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
              <Skeleton className="h-20 w-full" />
           ): (
            <div className="text-sm space-y-2 p-4 rounded-lg bg-muted/50">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Base Fare</span>
                <span>₹{breakdown.baseFare.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Distance Charge ({estimate.distance} km)</span>
                <span>₹{breakdown.distanceCharge.toFixed(2)}</span>
              </div>
              {estimate.surgeMultiplier > 1 && (
                <div className="flex justify-between text-destructive">
                  <span className="flex items-center gap-1"><Zap className="h-4 w-4"/> Surge ({estimate.surgeMultiplier}x)</span>
                  <span>+ ₹{((breakdown.baseFare + breakdown.distanceCharge) * (estimate.surgeMultiplier - 1)).toFixed(2)}</span>
                </div>
              )}
            </div>
           )}
          
          <div className="p-3 rounded-lg bg-primary/10 border border-primary/20">
              {isSuggestionLoading ? (
                  <div className="flex items-center gap-2">
                      <Skeleton className="h-5 w-5 rounded-full" />
                      <Skeleton className="h-4 w-4/5" />
                  </div>
              ) : (
                  aiSuggestion && (
                      <div className="flex items-start gap-2 text-primary">
                          <Lightbulb className="h-5 w-5 shrink-0 mt-0.5" />
                          <p className="font-medium text-sm">{aiSuggestion}</p>
                      </div>
                  )
              )}
          </div>
            
            {co2Estimate !== null && (
                <div className="p-3 rounded-lg bg-green-500/10 border border-green-500/20 text-center">
                    <p className="font-bold text-green-600 flex items-center justify-center gap-2"><Leaf /> Estimated ~{co2Estimate.toFixed(2)} kg CO₂ saved</p>
                    <p className="text-xs text-green-700/80">by choosing a shared ride.</p>
                </div>
            )}

           {showSkeletons ? (
              <Skeleton className="h-[76px] w-full" />
           ): (
            <div className="text-center p-4 rounded-lg bg-accent/10 border border-accent">
                <p className="text-sm text-accent-foreground/80">Estimated Total</p>
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
