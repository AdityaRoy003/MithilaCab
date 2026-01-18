'use client';
import { useDoc, useFirestore, useMemoFirebase } from '@/firebase';
import { doc } from 'firebase/firestore';
import type { Driver, Ride } from '@/lib/data';
import { RideHistoryCard } from './ride-history-card';
import { Skeleton } from '../ui/skeleton';
import { mockDrivers } from '@/lib/data';

interface RideHistoryItemProps {
    ride: Omit<Ride, 'driver'>;
}

export function RideHistoryItem({ ride }: RideHistoryItemProps) {
    const firestore = useFirestore();
    
    const driverRef = useMemoFirebase(() => ride.driverId ? doc(firestore, 'drivers', ride.driverId) : null, [firestore, ride.driverId]);
    
    // We use useDoc here, but Firestore security rules prevent us from reading the drivers collection.
    // So we'll use mock data for now. In a real app, you'd adjust rules or fetch this from a backend.
    // const { data: driver, isLoading } = useDoc<Driver>(driverRef);
    
    const driver = mockDrivers.find(d => d.id === ride.driverId);
    const isLoading = false; // Since we are using mock data.

    if (isLoading) {
        return <Skeleton className="h-36 w-full rounded-lg" />;
    }
    
    // If driver isn't found in mock data, or for rides without a driver yet.
    if (!driver) {
        // Create a placeholder to avoid crashing the UI.
        const placeholderDriver: Driver = { 
            id: ride.driverId || 'unknown', 
            name: 'Driver not found', 
            rating: 0, 
            vehicle: 'N/A', 
            licensePlate: 'N/A', 
            image: { id: 'user-profile', description: 'Default user', imageUrl: '', imageHint: 'person' }
        };
        const rideWithPlaceholderDriver: Ride = { ...ride, driver: placeholderDriver };
        return <RideHistoryCard ride={rideWithPlaceholderDriver} />;
    }
    
    const fullRideData: Ride = { ...ride, driver };

    return <RideHistoryCard ride={fullRideData} />;
}
