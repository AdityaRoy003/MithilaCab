'use client';

import React, { useMemo } from 'react';
import { useCollection, useFirestore, useMemoFirebase } from '@/firebase';
import { collection, query, where } from 'firebase/firestore';
import { GoogleMap, useJsApiLoader, MarkerF } from '@react-google-maps/api';
import type { Driver, Ride } from '@/lib/data';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Skeleton } from '@/components/ui/skeleton';
import { API_KEY, LIBRARIES } from '@/app/lib/google-maps';


const containerStyle = {
  width: '100%',
  height: '100%'
};

// Center of Mithila region (Darbhanga)
const center = {
  lat: 26.170,
  lng: 85.900
};

const mapOptions = {
    disableDefaultUI: true,
    zoomControl: true,
    styles: [
        {
            "featureType": "poi",
            "stylers": [{ "visibility": "off" }]
        },
        {
            "featureType": "transit",
            "stylers": [{ "visibility": "off" }]
        }
    ]
};


// Function to create a stable but random position for a given ID
const generateRandomPosition = (id: string) => {
    // Simple hash function to get a number from a string
    let hash = 0;
    for (let i = 0; i < id.length; i++) {
        const char = id.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash; // Convert to 32bit integer
    }
    const randomSeed = (hash + 2147483647) + 1; // Make it positive
    
    const randomLat = Math.sin(randomSeed) * 0.05; // Spread within ~5km
    const randomLng = Math.cos(randomSeed) * 0.05;

    return {
        lat: center.lat + randomLat,
        lng: center.lng + randomLng,
    };
};

const driverIconSvg = (isAvailable: boolean) => `data:image/svg+xml,${encodeURIComponent(`
  <svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 24 24">
    <circle cx="12" cy="12" r="11" fill="${isAvailable ? '#16A34A' : '#6B7280'}" stroke="rgba(255,255,255,0.5)" stroke-width="1"/>
    <g stroke="white" stroke-width="1.5" fill="none" stroke-linecap="round" stroke-linejoin="round">
        <path d="M14 16.94V18a2 2 0 0 1-2 2h-4a2 2 0 0 1-2-2v-1.06"/>
        <path d="m10 13 2-2.5 2 2.5"/>
        <path d="M14 5.275V5a2 2 0 0 0-2-2H8a2 2 0 0 0-2 2v.275"/>
        <rect width="18" height="8" x="3" y="5" rx="2"/>
    </g>
  </svg>
`)}`;

const userIconSvg = `data:image/svg+xml,${encodeURIComponent(`
    <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24">
        <circle cx="12" cy="12" r="10" fill="#F472B6" stroke="rgba(255,255,255,0.5)" stroke-width="1"/>
        <g stroke="white" stroke-width="1.5" fill="none" stroke-linecap="round" stroke-linejoin="round">
            <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/>
            <circle cx="12" cy="7" r="4"/>
        </g>
    </svg>
`)}`;

export function RealtimeMap() {
    const firestore = useFirestore();
    const { isLoaded, loadError } = useJsApiLoader({
        id: 'google-map-script-admin',
        googleMapsApiKey: API_KEY,
        libraries: LIBRARIES,
    });

    const driversQuery = useMemoFirebase(
        () => query(collection(firestore, 'drivers')),
        [firestore]
    );
    const { data: drivers, isLoading } = useCollection<Driver>(driversQuery);
    
    const ridesQuery = useMemoFirebase(
        () => query(collection(firestore, 'rides'), where('status', 'in', ['accepted', 'in-progress'])),
        [firestore]
    );
    const { data: activeRides, isLoading: ridesLoading } = useCollection<Ride>(ridesQuery);

    const driverPositions = useMemo(() => {
        return drivers?.reduce((acc, driver) => {
            acc[driver.id] = generateRandomPosition(driver.id);
            return acc;
        }, {} as Record<string, { lat: number; lng: number }>) || {};
    }, [drivers]);

    const passengerPositions = useMemo(() => {
        return activeRides?.reduce((acc, ride) => {
            if (!ride.userId) return acc;
            acc[ride.id] = generateRandomPosition(ride.userId + 'passenger');
            return acc;
        }, {} as Record<string, { lat: number; lng: number }>) || {};
    }, [activeRides]);

    let mapContent;

    if (!API_KEY) {
        mapContent = (
            <div className="h-full w-full flex items-center justify-center bg-muted text-center p-4">
                <div>
                    <h3 className="font-bold text-lg">Google Maps API Key is Missing</h3>
                    <p className="text-sm text-muted-foreground">Please provide your API key in a `.env.local` file to display the map.</p>
                </div>
            </div>
        );
    } else if (loadError) {
        mapContent = <div className="p-4 h-full w-full flex items-center justify-center text-center text-destructive">Error loading maps. Please check your API key and network connection.</div>;
    } else if (!isLoaded || isLoading || ridesLoading) {
        mapContent = <Skeleton className="h-full w-full" />;
    } else {
        mapContent = (
            <GoogleMap
                mapContainerStyle={containerStyle}
                center={center}
                zoom={12}
                options={mapOptions}
            >
                <TooltipProvider>
                    {/* Plot drivers */}
                    {drivers?.map((driver) => (
                        <Tooltip key={driver.id}>
                            <TooltipTrigger asChild>
                                <div>
                                    <MarkerF
                                        position={driverPositions[driver.id]}
                                        icon={{
                                            url: driverIconSvg(driver.isAvailable),
                                            scaledSize: new window.google.maps.Size(36, 36),
                                            anchor: new window.google.maps.Point(18, 18),
                                        }}
                                    />
                                </div>
                            </TooltipTrigger>
                            <TooltipContent>
                                <p className="font-bold">{driver.name}</p>
                                <p>{driver.isAvailable ? 'Available' : 'Offline'}</p>
                            </TooltipContent>
                        </Tooltip>
                    ))}
                    {/* Plot passengers */}
                    {activeRides?.map((ride) => (
                        <Tooltip key={ride.id}>
                            <TooltipTrigger asChild>
                                 <div>
                                    <MarkerF
                                        position={passengerPositions[ride.id]}
                                        icon={{
                                            url: userIconSvg,
                                            scaledSize: new window.google.maps.Size(32, 32),
                                            anchor: new window.google.maps.Point(16, 16),
                                        }}
                                    />
                                </div>
                            </TooltipTrigger>
                            <TooltipContent>
                                <p className="font-bold">{ride.passenger?.name}</p>
                                <p>Ride in progress</p>
                            </TooltipContent>
                        </Tooltip>
                    ))}
                </TooltipProvider>
            </GoogleMap>
        );
    }


    return (
        <Card>
            <CardHeader>
                <CardTitle>Real-time Ride Map</CardTitle>
                <CardDescription>Visualizing driver and passenger locations.</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="h-96 w-full rounded-lg overflow-hidden border">
                    {mapContent}
                </div>
            </CardContent>
        </Card>
    );
}
