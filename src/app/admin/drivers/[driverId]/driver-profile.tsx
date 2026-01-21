'use client';

import { useDoc, useFirestore, useMemoFirebase, useCollection } from '@/firebase';
import { doc, collection, query, where, Timestamp } from 'firebase/firestore';
import type { Ride } from '@/lib/data';
import { useRouter } from 'next/navigation';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { ArrowLeft, Car, Mail, Phone, Star, CheckCircle, ShieldAlert, BarChart } from 'lucide-react';
import { format } from 'date-fns';
import { RideRow } from '@/app/admin/ride-row';
import { Table, TableBody, TableHeader, TableRow, TableHead } from '@/components/ui/table';

interface Driver {
  id: string;
  name: string;
  email: string;
  phone: string;
  isAvailable: boolean;
  rating: number;
  vehicle: string;
  licensePlate: string;
  image?: { imageUrl?: string; imageHint?: string; };
  dateJoined?: Timestamp;
  isSuspended?: boolean;
  suspensionReason?: string;
  isVerified?: boolean;
}

export function DriverProfile({ driverId }: { driverId: string }) {
    const firestore = useFirestore();
    const router = useRouter();

    const driverDocRef = useMemoFirebase(() => doc(firestore, 'drivers', driverId), [firestore, driverId]);
    const { data: driver, isLoading: driverLoading } = useDoc<Driver>(driverDocRef);

    const ridesQuery = useMemoFirebase(() => {
        if (!driverId) return null;
        return query(collection(firestore, 'rides'), where('driverId', '==', driverId));
    }, [firestore, driverId]);

    const { data: rides, isLoading: ridesLoading } = useCollection<Ride>(ridesQuery);

    const isLoading = driverLoading || ridesLoading;
    

    if (isLoading) {
        return (
            <div className="space-y-6">
                <Skeleton className="h-9 w-24" />
                <Card>
                    <CardHeader><Skeleton className="h-8 w-1/2" /></CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex items-center gap-4">
                            <Skeleton className="h-24 w-24 rounded-full" />
                            <div className="space-y-2">
                                <Skeleton className="h-6 w-48" />
                                <Skeleton className="h-4 w-32" />
                            </div>
                        </div>
                        <Skeleton className="h-20 w-full" />
                    </CardContent>
                </Card>
                 <Card>
                    <CardHeader><Skeleton className="h-8 w-1/4" /></CardHeader>
                    <CardContent><Skeleton className="h-48 w-full" /></CardContent>
                </Card>
            </div>
        );
    }

    if (!driver) {
        return (
            <div>
                <Button variant="ghost" onClick={() => router.back()}><ArrowLeft className="mr-2 h-4 w-4" /> Back to list</Button>
                <div className="text-center py-10">Driver not found.</div>
            </div>
        );
    }
    
    const stats = {
        totalRides: rides?.length ?? 0,
        averageRating: driver.rating,
        memberSince: driver.dateJoined ? format((driver.dateJoined as any).toDate(), 'PPP') : 'N/A',
    };

    return (
        <div className="space-y-6">
            <div>
                 <Button variant="ghost" onClick={() => router.back()} className="-ml-4">
                    <ArrowLeft className="mr-2 h-4 w-4" /> Back to driver list
                </Button>
            </div>

            {driver.isSuspended && (
                 <Alert variant="destructive">
                    <ShieldAlert className="h-4 w-4" />
                    <AlertTitle>Account Suspended</AlertTitle>
                    <AlertDescription>
                        <strong>Reason:</strong> {driver.suspensionReason || 'No reason provided.'}
                    </AlertDescription>
                </Alert>
            )}
            
            <Card>
                <CardHeader>
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                        <div className="flex items-center gap-4">
                            <Avatar className="h-24 w-24 border">
                                <AvatarImage src={driver.image?.imageUrl} alt={driver.name} data-ai-hint={driver.image?.imageHint} />
                                <AvatarFallback>{driver.name.charAt(0)}</AvatarFallback>
                            </Avatar>
                            <div>
                                <CardTitle className="text-3xl">{driver.name}</CardTitle>
                                <CardDescription className="flex items-center gap-4 mt-2">
                                    <span className="flex items-center gap-1"><Mail className="h-4 w-4"/> {driver.email}</span>
                                    <span className="flex items-center gap-1"><Phone className="h-4 w-4"/> {driver.phone}</span>
                                </CardDescription>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                             {driver.isVerified && (
                                <Badge variant='secondary' className="border-green-600">
                                    <CheckCircle className="mr-1 h-4 w-4 text-green-600" /> Verified
                                </Badge>
                            )}
                            <Badge variant={driver.isAvailable ? 'default' : 'outline'}>
                                {driver.isAvailable ? 'Available' : 'Offline'}
                            </Badge>
                             {driver.isSuspended && <Badge variant="destructive">Suspended</Badge>}
                             <Button size="sm" variant="outline" onClick={() => router.push(`/admin/drivers/${driver.id}/performance`)}>
                                <BarChart className="mr-2 h-4 w-4" /> Performance
                            </Button>
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 text-center">
                        <div className="p-4 rounded-lg bg-muted/50">
                            <p className="text-sm font-medium text-muted-foreground">Total Rides</p>
                            <p className="text-2xl font-bold">{stats.totalRides}</p>
                        </div>
                         <div className="p-4 rounded-lg bg-muted/50">
                            <p className="text-sm font-medium text-muted-foreground">Rating</p>
                            <p className="text-2xl font-bold flex items-center justify-center gap-1">
                                <Star className="h-5 w-5 text-yellow-400 fill-yellow-400"/>
                                {stats.averageRating.toFixed(1)}
                            </p>
                        </div>
                         <div className="p-4 rounded-lg bg-muted/50">
                            <p className="text-sm font-medium text-muted-foreground">Vehicle</p>
                            <p className="text-lg font-semibold flex items-center justify-center gap-1">
                                <Car className="h-5 w-5" />
                                {driver.vehicle}
                            </p>
                            <p className="text-xs font-mono">{driver.licensePlate}</p>
                        </div>
                        <div className="p-4 rounded-lg bg-muted/50">
                            <p className="text-sm font-medium text-muted-foreground">Member Since</p>
                            <p className="text-2xl font-bold">{stats.memberSince}</p>
                        </div>
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Ride History</CardTitle>
                    <CardDescription>A list of all rides completed by this driver.</CardDescription>
                </CardHeader>
                <CardContent>
                     <Table>
                        <TableHeader>
                            <TableRow>
                            <TableHead>Status</TableHead>
                            <TableHead>Passenger</TableHead>
                            <TableHead className="hidden md:table-cell">Trip</TableHead>
                            <TableHead className="text-right">Fare</TableHead>
                            <TableHead className="hidden md:table-cell text-right">Date</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {rides && rides.map(ride => (
                                <RideRow key={ride.id} ride={ride} />
                            ))}
                            {(!rides || rides.length === 0) && (
                                <TableRow>
                                    <td colSpan={5} className="h-24 text-center">No rides found for this driver.</td>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>

        </div>
    );
}
