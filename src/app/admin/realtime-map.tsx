'use client';

import { useCollection, useFirestore, useMemoFirebase } from '@/firebase';
import { collection, query, where } from 'firebase/firestore';
import Image from 'next/image';
import PlaceHolderImages from '@/app/lib/placeholder-images.json';
import type { Driver, Ride } from '@/lib/data';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';
import { Car, User } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

// Mock positions for drivers. In a real app, these would come from GPS data.
const driverPositions = [
  { top: '35%', left: '40%' },
  { top: '50%', left: '60%' },
  { top: '25%', left: '75%' },
  { top: '60%', left: '25%' },
  { top: '75%', left: '50%' },
  { top: '45%', left: '30%' },
  { top: '65%', left: '70%' },
  { top: '20%', left: '20%' },
  { top: '80%', left: '80%' },
  { top: '30%', left: '55%' },
];

export function RealtimeMap() {
    const firestore = useFirestore();
    const mapImage = PlaceHolderImages.find(img => img.id === 'mithila-map');

    const driversQuery = useMemoFirebase(
        () => query(collection(firestore, 'drivers')),
        [firestore]
    );
    const { data: drivers, isLoading } = useCollection<Driver>(driversQuery);
    
    // Get active rides to show them on map
    const ridesQuery = useMemoFirebase(
        () => query(collection(firestore, 'rides'), where('status', 'in', ['accepted', 'in-progress'])),
        [firestore]
    );
    const { data: activeRides, isLoading: ridesLoading } = useCollection<Ride>(ridesQuery);

    if (isLoading || ridesLoading) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle>Real-time Ride Map</CardTitle>
                    <CardDescription>Visualizing high-demand zones and driver locations.</CardDescription>
                </CardHeader>
                <CardContent>
                    <Skeleton className="h-96 w-full" />
                </CardContent>
            </Card>
        );
    }
    
    return (
        <Card>
            <CardHeader>
                <CardTitle>Real-time Ride Map</CardTitle>
                <CardDescription>Visualizing high-demand zones and driver locations.</CardDescription>
            </CardHeader>
            <CardContent>
                <TooltipProvider>
                    <div className="relative h-96 w-full rounded-lg overflow-hidden border">
                        {mapImage && (
                            <Image
                                src={mapImage.imageUrl}
                                alt={mapImage.description}
                                fill
                                className="object-cover dark:opacity-30"
                                data-ai-hint={mapImage.imageHint}
                            />
                        )}
                        {/* Plot available drivers */}
                        {drivers?.filter(d => d.isAvailable).map((driver, index) => {
                             const position = driverPositions[index % driverPositions.length];
                             return (
                                 <Tooltip key={driver.id}>
                                     <TooltipTrigger asChild>
                                        <div
                                            className="absolute transform -translate-x-1/2 -translate-y-1/2"
                                            style={{ top: position.top, left: position.left }}
                                        >
                                            <div className="relative flex h-6 w-6 items-center justify-center">
                                                <div className={cn("absolute h-full w-full animate-ping rounded-full", driver.isAvailable ? "bg-green-500/70" : "bg-muted-foreground/70" )}></div>
                                                <Car size={20} className={cn("relative text-primary-foreground p-0.5 rounded-full shadow-lg", driver.isAvailable ? "bg-green-600" : "bg-muted-foreground")} />
                                            </div>
                                        </div>
                                     </TooltipTrigger>
                                     <TooltipContent>
                                        <p className="font-bold">{driver.name}</p>
                                        <p>{driver.isAvailable ? 'Available' : 'Offline'}</p>
                                     </TooltipContent>
                                 </Tooltip>
                             )
                        })}
                        {/* Plot passengers with active rides */}
                        {activeRides?.map((ride, index) => {
                            const positionIndex = (drivers?.length ?? 0) + index;
                            const position = driverPositions[(positionIndex + 5) % driverPositions.length]; // Offset passenger positions
                             return (
                                 <Tooltip key={ride.id}>
                                     <TooltipTrigger asChild>
                                        <div
                                            className="absolute transform -translate-x-1/2 -translate-y-1/2"
                                            style={{ top: position.top, left: position.left }}
                                        >
                                            <div className="relative flex h-5 w-5 items-center justify-center">
                                                <User size={16} className="relative text-accent-foreground bg-accent p-0.5 rounded-full shadow-lg" />
                                            </div>
                                        </div>
                                     </TooltipTrigger>
                                     <TooltipContent>
                                        <p className="font-bold">{ride.passenger?.name}</p>
                                        <p>Ride in progress</p>
                                     </TooltipContent>
                                 </Tooltip>
                             )
                        })}
                    </div>
                </TooltipProvider>
            </CardContent>
        </Card>
    );
}
