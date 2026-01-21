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
import { ArrowLeft, Mail, Phone } from 'lucide-react';
import { format } from 'date-fns';
import { RideRow } from '@/app/admin/ride-row';
import { Table, TableBody, TableHeader, TableRow, TableHead } from '@/components/ui/table';

interface UserProfileData {
    id: string;
    name: string;
    email: string;
    phone: string;
    photoURL?: string;
    dateJoined?: Timestamp;
    isSuspended?: boolean;
}

export function UserProfile({ userId }: { userId: string }) {
    const firestore = useFirestore();
    const router = useRouter();

    const userDocRef = useMemoFirebase(() => doc(firestore, 'users', userId), [firestore, userId]);
    const { data: user, isLoading: userLoading } = useDoc<UserProfileData>(userDocRef);

    const ridesQuery = useMemoFirebase(() => {
        if (!userId) return null;
        return query(collection(firestore, 'rides'), where('userId', '==', userId));
    }, [firestore, userId]);

    const { data: rides, isLoading: ridesLoading } = useCollection<Ride>(ridesQuery);

    const isLoading = userLoading || ridesLoading;

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

    if (!user) {
        return (
            <div>
                <Button variant="ghost" onClick={() => router.back()}><ArrowLeft className="mr-2 h-4 w-4" /> Back to list</Button>
                <div className="text-center py-10">User not found.</div>
            </div>
        );
    }

    const stats = {
        totalRides: rides?.length ?? 0,
        memberSince: user.dateJoined ? format(user.dateJoined.toDate(), 'PPP') : 'N/A',
    };
    
    return (
        <div className="space-y-6">
            <div>
                 <Button variant="ghost" onClick={() => router.back()} className="-ml-4">
                    <ArrowLeft className="mr-2 h-4 w-4" /> Back to user list
                </Button>
            </div>
            
            <Card>
                <CardHeader>
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                        <div className="flex items-center gap-4">
                            <Avatar className="h-24 w-24 border">
                                <AvatarImage src={user.photoURL} alt={user.name} />
                                <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                            </Avatar>
                            <div>
                                <CardTitle className="text-3xl">{user.name}</CardTitle>
                                <CardDescription className="flex items-center gap-4 mt-2">
                                    <span className="flex items-center gap-1"><Mail className="h-4 w-4"/> {user.email}</span>
                                    <span className="flex items-center gap-1"><Phone className="h-4 w-4"/> {user.phone}</span>
                                </CardDescription>
                            </div>
                        </div>
                        {user.isSuspended && <Badge variant="destructive">Suspended</Badge>}
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-center">
                        <div className="p-4 rounded-lg bg-muted/50">
                            <p className="text-sm font-medium text-muted-foreground">Total Rides</p>
                            <p className="text-2xl font-bold">{stats.totalRides}</p>
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
                    <CardDescription>A list of all rides taken by this user.</CardDescription>
                </CardHeader>
                <CardContent>
                     <Table>
                        <TableHeader>
                            <TableRow>
                            <TableHead>Status</TableHead>
                            <TableHead>Driver</TableHead>
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
                                    <td colSpan={5} className="h-24 text-center">No rides found for this user.</td>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>

        </div>
    );
}
