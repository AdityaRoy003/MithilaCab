'use client';

import { MapOff } from 'lucide-react';

export function BookingMap() {
    return (
        <div className="h-full w-full flex items-center justify-center bg-muted text-center p-4">
            <div>
                <MapOff className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
                <h3 className="font-bold text-lg">Map Disabled</h3>
                <p className="text-sm text-muted-foreground">Please provide a Google Maps API key to enable this feature.</p>
            </div>
        </div>
    );
}
