"use client";

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import type { Ride } from '@/lib/data';
import { PlaceHolderImages } from '@/lib/placeholder-images';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Car, Star, Phone } from 'lucide-react';

interface RideTrackingProps {
  rideDetails: Ride;
  onComplete: () => void;
}

const rideStages = [
  { status: 'Driver is on the way', duration: 5000, progress: 30 },
  { status: 'Driver has arrived', duration: 2000, progress: 40 },
  { status: 'Trip in progress', duration: 8000, progress: 90 },
  { status: 'You are arriving at your destination', duration: 2000, progress: 100 },
];

export function RideTracking({ rideDetails, onComplete }: RideTrackingProps) {
  const [stageIndex, setStageIndex] = useState(0);
  const [progress, setProgress] = useState(0);
  const mapImage = PlaceHolderImages.find(img => img.id === 'map-background');

  useEffect(() => {
    if (stageIndex < rideStages.length) {
      const timer = setTimeout(() => {
        setStageIndex(prev => prev + 1);
      }, rideStages[stageIndex].duration);
      return () => clearTimeout(timer);
    } else {
       const completionTimer = setTimeout(onComplete, 1000);
       return () => clearTimeout(completionTimer);
    }
  }, [stageIndex, onComplete]);

  useEffect(() => {
    if (stageIndex < rideStages.length) {
      setProgress(rideStages[stageIndex].progress);
    }
  }, [stageIndex]);

  const { driver } = rideDetails;

  return (
    <div className="w-full h-full flex flex-col">
      <div className="relative flex-1 rounded-lg overflow-hidden shadow-inner">
        {mapImage && (
          <Image
            src={mapImage.imageUrl}
            alt={mapImage.description}
            layout="fill"
            objectFit="cover"
            className="dark:opacity-50"
            data-ai-hint={mapImage.imageHint}
          />
        )}
        <motion.div
          className="absolute text-primary"
          initial={{ top: '80%', left: '20%' }}
          animate={{
            top: progress > 40 ? '20%' : '80%',
            left: progress > 40 ? '80%' : '20%',
          }}
          transition={{ duration: stageIndex >=2 ? 8 : 5, ease: 'easeInOut' }}
        >
          <Car size={32} />
        </motion.div>
      </div>

      <Card className="shadow-lg rounded-t-none -mt-2">
        <CardHeader>
           <AnimatePresence mode="wait">
            <motion.div
              key={stageIndex}
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              transition={{ duration: 0.3 }}
              className="text-center"
            >
              <CardTitle className="font-headline text-2xl">
                {rideStages[stageIndex]?.status || 'Ride Completed'}
              </CardTitle>
            </motion.div>
          </AnimatePresence>
          <Progress value={progress} className="mt-2" />
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between p-4 rounded-lg border bg-card">
            <div className="flex items-center gap-4">
              <Avatar className="h-16 w-16">
                <AvatarImage src={driver.image.imageUrl} alt={driver.name} data-ai-hint={driver.image.imageHint} />
                <AvatarFallback>{driver.name.charAt(0)}</AvatarFallback>
              </Avatar>
              <div>
                <p className="font-bold text-lg">{driver.name}</p>
                <div className="flex items-center gap-1 text-sm text-muted-foreground">
                  <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                  <span>{driver.rating}</span>
                </div>
                <p className="text-sm text-muted-foreground">{driver.vehicle}</p>
                 <p className="font-mono text-sm bg-secondary px-2 py-1 rounded-md inline-block mt-1">{driver.licensePlate}</p>
              </div>
            </div>
            <Button size="icon" variant="outline" className="h-12 w-12 rounded-full">
              <Phone />
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
