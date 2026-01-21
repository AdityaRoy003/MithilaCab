'use client';

import type { Ride } from '@/lib/data';
import { useFirestore, updateDocumentNonBlocking } from '@/firebase';
import { doc } from 'firebase/firestore';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button, buttonVariants } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { IndianRupee, MapPin, Phone, User, CheckCircle, XCircle, PlayCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";

interface AssignedRideCardProps {
    ride: Ride;
}

export function AssignedRideCard({ ride }: AssignedRideCardProps) {
    const firestore = useFirestore();
    const { toast } = useToast();
    const passenger = ride.passenger;

    const rideRef = doc(firestore, 'rides', ride.id);

    const handleStartTrip = () => {
        updateDocumentNonBlocking(rideRef, { status: 'in-progress' });
        toast({ title: 'Trip Started', description: `On your way to ${ride.destinationLocation}.` });
    };

    const handleEndTrip = () => {
        updateDocumentNonBlocking(rideRef, { status: 'completed', endTime: new Date() });
        toast({ title: 'Trip Completed', description: 'You can now accept new rides.' });
    };

    const handleCancelTrip = () => {
        updateDocumentNonBlocking(rideRef, { status: 'requested', driverId: null });
        toast({ variant: 'destructive', title: 'Ride Cancelled', description: 'The ride has been returned to the available pool.' });
    };

    return (
        <Card className="bg-card shadow-md">
            <CardHeader>
                <CardTitle className="flex justify-between items-center">
                    <span>{ride.status === 'accepted' ? 'Pickup Passenger' : 'En Route'}</span>
                     <div className="text-right">
                        <p className="font-bold text-xl flex items-center">
                            <IndianRupee size={20} />
                            {ride.fareAmount.toFixed(2)}
                        </p>
                        <p className="text-xs text-muted-foreground">Est. Fare</p>
                    </div>
                </CardTitle>
                 <CardDescription className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-primary" />
                    <span><span className='font-medium'>From:</span> {ride.pickupLocation}</span>
                </CardDescription>
                <CardDescription className="flex items-center gap-2">
                     <MapPin className="h-4 w-4 text-accent" />
                     <span><span className='font-medium'>To:</span> {ride.destinationLocation}</span>
                </CardDescription>
            </CardHeader>
            <CardContent>
                 <div className="flex items-center justify-between p-3 rounded-md border bg-muted/20">
                    <div className="flex items-center gap-3">
                        <Avatar>
                            <AvatarImage src={passenger?.photoURL ?? undefined} alt={passenger?.name ?? 'Passenger'} />
                            <AvatarFallback><User /></AvatarFallback>
                        </Avatar>
                        <div>
                            <p className="font-semibold">{passenger?.name ?? 'Passenger'}</p>
                            <p className="text-sm text-muted-foreground">OTP for pickup: <span className="font-bold text-foreground">1234</span></p>
                        </div>
                    </div>
                    <Button asChild size="icon" variant="outline" className="rounded-full h-11 w-11" disabled={!passenger?.phone}>
                        <a href={`tel:${passenger?.phone}`}>
                            <Phone />
                        </a>
                    </Button>
                </div>
            </CardContent>
            <CardFooter className="grid grid-cols-2 gap-2">
                {ride.status === 'accepted' && (
                    <Button onClick={handleStartTrip} className="w-full font-bold">
                        <PlayCircle className="mr-2" /> Start Trip
                    </Button>
                )}
                {ride.status === 'in-progress' && (
                    <Button onClick={handleEndTrip} className="w-full font-bold bg-green-600 hover:bg-green-700">
                        <CheckCircle className="mr-2" /> End Trip
                    </Button>
                )}
                 <AlertDialog>
                    <AlertDialogTrigger asChild>
                        <Button variant="destructive" className="w-full font-bold">
                            <XCircle className="mr-2"/>
                            Cancel
                        </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                        <AlertDialogHeader>
                            <AlertDialogTitle>Are you sure you want to cancel?</AlertDialogTitle>
                            <AlertDialogDescription>
                                This will return the ride to the available pool. Please only cancel if you are unable to complete the ride.
                            </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                            <AlertDialogCancel>Don't Cancel</AlertDialogCancel>
                            <AlertDialogAction onClick={handleCancelTrip} className={buttonVariants({ variant: "destructive" })}>Confirm Cancellation</AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>
            </CardFooter>
        </Card>
    )
}
