'use client';

import { useState } from 'react';
import { useDoc, useFirestore, useMemoFirebase, useCollection } from '@/firebase';
import { doc, Timestamp, updateDoc, collection, query, where } from 'firebase/firestore';
import { TableCell, TableRow } from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { IndianRupee, MoreHorizontal, User, Car, Clock, Star, MapPin, ArrowRight, CheckCircle, XCircle } from 'lucide-react';
import type { Ride, Driver } from '@/lib/data';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';

interface RideRowProps {
    ride: Ride;
}

const statusVariant: { [key: string]: "default" | "secondary" | "destructive" | "outline" } = {
  completed: 'default',
  cancelled: 'destructive',
  requested: 'outline',
  accepted: 'outline',
  'in-progress': 'outline',
};

export function RideRow({ ride }: RideRowProps) {
    const firestore = useFirestore();
    const { toast } = useToast();
    const [isAssignDialogOpen, setIsAssignDialogOpen] = useState(false);
    const [isDetailsOpen, setIsDetailsOpen] = useState(false);

    const driverDocRef = useMemoFirebase(() => ride.driverId ? doc(firestore, 'drivers', ride.driverId) : null, [firestore, ride.driverId]);
    const { data: driver, isLoading: driverLoading } = useDoc<Driver>(driverDocRef);

    const availableDriversQuery = useMemoFirebase(
        () => query(collection(firestore, 'drivers'), where('isAvailable', '==', true)),
        [firestore]
    );
    const { data: availableDrivers, isLoading: driversLoading } = useCollection<Driver>(availableDriversQuery);
    
    const handleAssignDriver = async (driverId: string) => {
        const rideRef = doc(firestore, 'rides', ride.id);
        try {
            await updateDoc(rideRef, { driverId: driverId, status: 'accepted' });
            toast({
                title: 'Driver Assigned',
                description: 'The ride has been manually assigned to the driver.',
            });
            setIsAssignDialogOpen(false);
        } catch (error) {
            toast({
                variant: 'destructive',
                title: 'Assignment Failed',
                description: 'Could not assign the driver to the ride.',
            });
        }
    };

    const getFormattedDate = (date: any) => {
        if (!date) return 'N/A';
        try {
            if (date instanceof Timestamp) {
                return format(date.toDate(), "PP p");
            }
            const d = new Date(date);
            if (!isNaN(d.getTime())) return format(d, "PP p");
            return 'Invalid Date';
        } catch (e) {
            return 'Invalid Date';
        }
    }

    return (
        <>
            <TableRow>
                <TableCell>
                    {ride.status && <Badge variant={statusVariant[ride.status] || 'secondary'}>{ride.status}</Badge>}
                </TableCell>
                <TableCell>
                    <div className="flex items-center gap-3">
                        <Avatar className="hidden h-9 w-9 sm:flex">
                            <AvatarImage src={ride.passenger?.photoURL ?? undefined} alt={ride.passenger?.name ?? 'P'} />
                            <AvatarFallback>{ride.passenger?.name?.charAt(0) ?? 'P'}</AvatarFallback>
                        </Avatar>
                        <div className="font-medium">{ride.passenger?.name ?? 'Passenger'}</div>
                    </div>
                </TableCell>
                <TableCell>
                    {driverLoading ? <Skeleton className="h-5 w-24" /> : (
                        <div className="font-medium">{driver?.name ?? 'Unassigned'}</div>
                    )}
                </TableCell>
                <TableCell className="hidden md:table-cell">
                    <div className="text-sm font-medium">{ride.pickupLocation}</div>
                    <div className="text-xs text-muted-foreground">{ride.destinationLocation}</div>
                </TableCell>
                <TableCell className="text-right font-mono flex items-center justify-end">
                    <IndianRupee className="h-4 w-4 text-muted-foreground" />
                    {ride.fareAmount?.toFixed(2)}
                </TableCell>
                <TableCell className="hidden md:table-cell text-right text-xs text-muted-foreground">
                    {getFormattedDate(ride.startTime)}
                </TableCell>
                <TableCell>
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button aria-haspopup="true" size="icon" variant="ghost">
                                <MoreHorizontal className="h-4 w-4" />
                                <span className="sr-only">Toggle menu</span>
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => setIsDetailsOpen(true)}>View Ride Details</DropdownMenuItem>
                            {ride.status === 'requested' && (
                                <DropdownMenuItem onClick={() => setIsAssignDialogOpen(true)}>
                                    Manually Assign Driver
                                </DropdownMenuItem>
                            )}
                        </DropdownMenuContent>
                    </DropdownMenu>
                </TableCell>
            </TableRow>

            {/* Assign Driver Dialog */}
            <Dialog open={isAssignDialogOpen} onOpenChange={setIsAssignDialogOpen}>
                <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                        <DialogTitle>Assign a Driver</DialogTitle>
                        <DialogDescription>
                            Select an available driver to assign to this ride request.
                        </DialogDescription>
                    </DialogHeader>
                    <ScrollArea className="h-72 my-4">
                        <div className="space-y-4 pr-4">
                            {driversLoading && <Skeleton className="h-20 w-full" />}
                            {!driversLoading && availableDrivers && availableDrivers.map(d => (
                                <div key={d.id} className="flex items-center justify-between p-3 border rounded-lg">
                                    <div className="flex items-center gap-3">
                                        <Avatar>
                                            <AvatarImage src={d.image?.imageUrl} alt={d.name} data-ai-hint={d.image?.imageHint}/>
                                            <AvatarFallback>{d.name.charAt(0)}</AvatarFallback>
                                        </Avatar>
                                        <div>
                                            <p className="font-semibold">{d.name}</p>
                                            <p className="text-xs text-muted-foreground">{d.vehicle}</p>
                                            <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                                <Star className="h-3 w-3 text-yellow-500 fill-yellow-500"/> {d.rating.toFixed(1)}
                                            </div>
                                        </div>
                                    </div>
                                    <Button size="sm" onClick={() => handleAssignDriver(d.id)}>Assign</Button>
                                </div>
                            ))}
                            {!driversLoading && (!availableDrivers || availableDrivers.length === 0) && (
                                <p className="text-center text-muted-foreground py-10">No drivers are currently available.</p>
                            )}
                        </div>
                    </ScrollArea>
                </DialogContent>
            </Dialog>
            
            {/* Ride Details Dialog */}
            <Dialog open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Ride Details</DialogTitle>
                        <DialogDescription>ID: {ride.id}</DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                         <div className="flex items-center gap-4">
                            <User className="h-5 w-5 text-muted-foreground"/>
                            <div>
                                <p className="text-sm text-muted-foreground">Passenger</p>
                                <p className="font-semibold">{ride.passenger?.name}</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-4">
                            <Car className="h-5 w-5 text-muted-foreground"/>
                            <div>
                                <p className="text-sm text-muted-foreground">Driver</p>
                                <p className="font-semibold">{driver?.name ?? 'Unassigned'}</p>
                            </div>
                        </div>
                        <Separator />
                        <div className="flex items-center gap-4">
                            <MapPin className="h-5 w-5 text-primary"/>
                            <div>
                                <p className="text-sm text-muted-foreground">From</p>
                                <p className="font-semibold">{ride.pickupLocation}</p>
                            </div>
                        </div>
                         <div className="flex items-center gap-4">
                            <ArrowRight className="h-5 w-5 text-muted-foreground ml-0.5"/>
                            <div>
                                <p className="text-sm text-muted-foreground">To</p>
                                <p className="font-semibold">{ride.destinationLocation}</p>
                            </div>
                        </div>
                        <Separator />
                        <div className="flex justify-between">
                             <div className="flex items-center gap-4">
                                <Clock className="h-5 w-5 text-muted-foreground"/>
                                <div>
                                    <p className="text-sm text-muted-foreground">Date</p>
                                    <p className="font-semibold">{getFormattedDate(ride.startTime)}</p>
                                </div>
                            </div>
                             <div className="flex items-center gap-4 text-right">
                                <div>
                                    <p className="text-sm text-muted-foreground">Fare</p>
                                    <p className="font-semibold flex items-center justify-end"><IndianRupee size={16}/>{ride.fareAmount.toFixed(2)}</p>
                                </div>
                            </div>
                        </div>
                         <div className="flex items-center gap-4">
                            <div className={cn("p-1.5 rounded-full", statusVariant[ride.status || 'secondary'] === 'default' && 'bg-green-100 dark:bg-green-900', statusVariant[ride.status || 'secondary'] === 'destructive' && 'bg-red-100 dark:bg-red-900', statusVariant[ride.status || 'secondary'] === 'outline' && 'bg-yellow-100 dark:bg-yellow-900')}>
                                 {ride.status === 'completed' && <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400"/>}
                                 {ride.status === 'cancelled' && <XCircle className="h-5 w-5 text-red-600 dark:text-red-400"/>}
                                 {ride.status !== 'completed' && ride.status !== 'cancelled' && <Clock className="h-5 w-5 text-yellow-600 dark:text-yellow-400"/>}
                            </div>
                            <div>
                                <p className="text-sm text-muted-foreground">Status</p>
                                <p className="font-semibold capitalize">{ride.status}</p>
                            </div>
                        </div>

                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsDetailsOpen(false)}>Close</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
}
