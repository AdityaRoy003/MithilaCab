'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { MapPinOff } from 'lucide-react';

export function RealtimeMap() {
    return (
        <Card>
            <CardHeader>
                <CardTitle>Real-time Ride Map</CardTitle>
                <CardDescription>Visualizing driver and passenger locations.</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="h-96 w-full rounded-lg overflow-hidden border flex items-center justify-center bg-muted">
                    <div className="text-center text-muted-foreground">
                        <MapPinOff className="h-12 w-12 mx-auto mb-2" />
                        <p className="font-semibold">Map Disabled</p>
                        <p className="text-sm">Functionality removed as no API key was provided.</p>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
