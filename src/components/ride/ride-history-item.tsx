'use client';
import { useDoc, useFirestore, useMemoFirebase } from '@/firebase';
import { doc } from 'firebase/firestore';
import type { Driver, Ride } from '@/lib/data';
import { RideHistoryCard } from './ride-history-card';
import { Skeleton } from '../ui/skeleton';

interface RideHistoryItemProps {
    ride: Omit<Ride, 'driver'>;
}

export function RideHistoryItem({ ride }: RideHistoryItemProps) {
    const firestore = useFirestore();
    
    const driverRef = useMemoFirebase(() => ride.driverId ? doc(firestore, 'drivers', ride.driverId) : null, [firestore, ride.driverId]);
    
    const { data: driver, isLoading } = useDoc<Driver>(driverRef);

    if (isLoading) {
        return <Skeleton className="h-36 w-full rounded-lg" />;
    }
    
    // If driver isn't found in Firestore (e.g., deleted), or for rides without a driver yet.
    if (!driver) {
        // Create a placeholder to avoid crashing the UI.
        const placeholderDriver: Driver = { 
            id: ride.driverId || 'unknown', 
            name: 'Driver not found', 
            rating: 0, 
            vehicle: 'N/A', 
            licensePlate: 'N/A', 
            isAvailable: false,
            image: { id: 'user-profile', description: 'Default user', imageUrl: '', imageHint: 'person' }
        };
        const rideWithPlaceholderDriver: Ride = { ...ride, driver: placeholderDriver };
        return <RideHistoryCard ride={rideWithPlaceholderDriver} />;
    }
    
    const fullRideData: Ride = { ...ride, driver };

    return <RideHistoryCard ride={fullRideData} />;
}
