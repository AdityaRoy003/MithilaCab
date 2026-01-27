'use client';

import React, { useState, useEffect, useRef } from 'react';
import { GoogleMap, useJsApiLoader, MarkerF, DirectionsRenderer } from '@react-google-maps/api';
import { motion } from 'framer-motion';
import { Skeleton } from '../ui/skeleton';

const API_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || '';
const LIBRARIES = ["geocoding", "directions"] as ("geocoding" | "directions")[];

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
        },
        {
            "featureType": "road",
            "elementType": "labels.icon",
            "stylers": [{ "visibility": "off" }]
        }
    ]
};

interface BookingMapProps {
    pickup: google.maps.LatLngLiteral | null;
    destination: google.maps.LatLngLiteral | null;
}

export function BookingMap({ pickup, destination }: BookingMapProps) {
    const { isLoaded, loadError } = useJsApiLoader({
        id: 'google-map-script',
        googleMapsApiKey: API_KEY,
        libraries: LIBRARIES,
    });

    const [directions, setDirections] = useState<google.maps.DirectionsResult | null>(null);
    const mapRef = useRef<google.maps.Map | null>(null);

    useEffect(() => {
        if (pickup && destination && window.google) {
            const directionsService = new window.google.maps.DirectionsService();
            directionsService.route(
                {
                    origin: pickup,
                    destination: destination,
                    travelMode: window.google.maps.TravelMode.DRIVING,
                },
                (result, status) => {
                    if (status === window.google.maps.DirectionsStatus.OK) {
                        setDirections(result);
                        if (mapRef.current && result) {
                            const bounds = new google.maps.LatLngBounds();
                            result.routes[0].legs.forEach(leg => {
                                leg.steps.forEach(step => {
                                    step.path.forEach(path => bounds.extend(path));
                                });
                            });
                            mapRef.current.fitBounds(bounds);
                        }
                    } else {
                        console.error(`Error fetching directions: ${status}`);
                    }
                }
            );
        } else {
            setDirections(null);
            if(mapRef.current) {
                if (pickup) {
                    mapRef.current.panTo(pickup);
                    mapRef.current.setZoom(14);
                } else {
                    mapRef.current.panTo(center);
                    mapRef.current.setZoom(12);
                }
            }
        }
    }, [pickup, destination]);
    
    const onLoad = (map: google.maps.Map) => {
        mapRef.current = map;
    }

    if (loadError) {
        return <div className="p-4 text-center text-destructive">Error loading maps. Please check your API key.</div>;
    }

    if (!isLoaded || !API_KEY) {
        return (
            <div className="h-full w-full flex items-center justify-center bg-muted text-center p-4">
                 {API_KEY ? (
                     <Skeleton className="h-full w-full" />
                 ) : (
                    <div>
                        <h3 className="font-bold text-lg">Google Maps API Key is Missing</h3>
                        <p className="text-sm text-muted-foreground">Add your API key in `.env.local` to see the map.</p>
                    </div>
                 )}
            </div>
        );
    }
    
    return (
        <GoogleMap
            mapContainerStyle={containerStyle}
            center={center}
            zoom={12}
            options={mapOptions}
            onLoad={onLoad}
        >
            {pickup && (
                <MarkerF 
                    position={pickup}
                    options={{ icon: { path: google.maps.SymbolPath.CIRCLE, scale: 8, fillColor: 'hsl(var(--primary))', fillOpacity: 1, strokeColor: 'white', strokeWeight: 2 } }}
                />
            )}
            {destination && (
                <MarkerF 
                    position={destination}
                     options={{ icon: { path: google.maps.SymbolPath.CIRCLE, scale: 8, fillColor: 'hsl(var(--accent))', fillOpacity: 1, strokeColor: 'white', strokeWeight: 2 } }}
                />
            )}

            {directions && (
                <DirectionsRenderer
                    directions={directions}
                    options={{
                        suppressMarkers: true,
                        polylineOptions: {
                            strokeColor: 'hsl(var(--primary))',
                            strokeOpacity: 0.8,
                            strokeWeight: 6,
                        },
                    }}
                />
            )}
        </GoogleMap>
    );
}
