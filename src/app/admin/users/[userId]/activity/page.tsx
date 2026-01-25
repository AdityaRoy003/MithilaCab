'use client';

import { useCollection, useFirestore, useMemoFirebase } from '@/firebase';
import { collection, query, where } from 'firebase/firestore';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
import { RideRow } from '@/app/admin/ride-row';
import type { Ride } from '@/lib/data';
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";


export default function UserActivityPage({ params }: { params: { userId: string } }) {
  const router = useRouter();
  const firestore = useFirestore();
  const ridesQuery = useMemoFirebase(
    () => query(collection(firestore, 'rides'), where('userId', '==', params.userId)),
    [firestore, params.userId]
  );
  const { data: rides, isLoading } = useCollection<Ride>(ridesQuery);
  
  return (
    <div className="space-y-6">
        <Button variant="ghost" onClick={() => router.back()} className="-ml-4">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to User Profile
        </Button>

        <Card>
            <CardHeader>
                <CardTitle>User Activity Log</CardTitle>
                <CardDescription>A list of all rides taken by this user.</CardDescription>
            </CardHeader>
            <CardContent>
                {isLoading && (
                    <div className="space-y-2">
                        <Skeleton className="h-12 w-full" />
                        <Skeleton className="h-12 w-full" />
                        <Skeleton className="h-12 w-full" />
                    </div>
                )}
                {!isLoading && (
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Status</TableHead>
                                <TableHead>Driver</TableHead>
                                <TableHead className="hidden md:table-cell">Trip</TableHead>
                                <TableHead className="text-right">Fare</TableHead>
                                <TableHead className="hidden md:table-cell text-right">Date</TableHead>
                                <TableHead><span className="sr-only">Actions</span></TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {rides && rides.map(ride => (
                                <RideRow key={ride.id} ride={ride} />
                            ))}
                            {(!rides || rides.length === 0) && (
                                <TableRow>
                                    <td colSpan={6} className="h-24 text-center">No ride activity found for this user.</td>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                )}
            </CardContent>
        </Card>
    </div>
  );
}
