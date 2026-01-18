"use client";

import { useEffect, useMemo } from 'react';
import type { Driver, Ride } from '@/lib/data';
import { mockDrivers } from '@/lib/data';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface FindingDriverProps {
  onDriverFound: (driver: Driver) => void;
  rideDetails: Ride; // Now receives rideDetails
}

export function FindingDriver({ onDriverFound, rideDetails }: FindingDriverProps) {
  
  const selectedDriver = useMemo(() => {
    return mockDrivers[Math.floor(Math.random() * mockDrivers.length)];
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      onDriverFound(selectedDriver);
    }, 3000); 

    return () => clearTimeout(timer);
  }, [onDriverFound, selectedDriver, rideDetails]);

  return (
    <div className="w-full max-w-md mx-auto">
      <Card className="shadow-lg text-center">
        <CardHeader>
          <CardTitle className="font-headline text-2xl">Finding Your Ride</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col items-center justify-center space-y-6 p-10">
          <div className="relative flex h-32 w-32 items-center justify-center">
            <div className="absolute h-full w-full animate-ping rounded-full bg-primary/50"></div>
            <div className="absolute h-2/3 w-2/3 animate-ping rounded-full bg-primary/70 delay-200"></div>
            <div className="relative flex h-16 w-16 items-center justify-center rounded-full bg-primary text-primary-foreground">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-8 w-8"><path d="M10 2c-1.2 0-2.3.4-3.3 1.1.4 2.3 1 4.5 2.1 6.4.5.9 1.1 1.7 1.8 2.5H14c.4 0 .7.1 1 .4.5.4.8 1 .8 1.6s-.3 1.2-.8 1.6c-.3.3-.6.4-1 .4h-2.3c-2.3 0-4.4-1.2-5.7-3.1C4.5 10.3 4 8.2 4 6c0-1.2.4-2.3 1.1-3.3C2.8 3.6 2 5.2 2 7c0 2.2 1.1 4.2 2.9 5.5.8.5 1.7.9 2.6 1.2V14c0 .8.7 1.5 1.5 1.5h1.5c.3 0 .5-.1.7-.3.2-.2.3-.5.3-.7s-.1-.5-.3-.7c-.2-.2-.4-.3-.7-.3h-1.5c-.3 0-.5.2-.5.5v-1.8c.7-.4 1.3-.9 1.8-1.5.5.2 1.1.3 1.7.3h1.3c.4 0 .7-.1.9-.4.5-.4.8-1 .8-1.6s-.3-1.2-.8-1.6c-.2-.3-.5-.4-.9-.4h-1.3c-.6 0-1.2.1-1.7.3-1.1-1.6-2.1-3.5-2.6-5.5C12.3 2.4 11.2 2 10 2zM7 9c-.6 0-1-.4-1-1s.4-1 1-1 1 .4 1 1-.4 1-1 1z"/></svg>
            </div>
          </div>
          <p className="text-muted-foreground">Contacting nearby drivers...</p>
        </CardContent>
      </Card>
    </div>
  );
}
