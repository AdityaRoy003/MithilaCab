'use client';

import { useDoc, useFirestore, useMemoFirebase, useCollection } from '@/firebase';
import { doc, collection, query, where, Timestamp } from 'firebase/firestore';
import type { Ride } from '@/lib/data';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { format } from 'date-fns';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { ArrowLeft, Star, CheckCircle, XCircle, MessageSquare } from 'lucide-react';
import { Progress } from '@/components/ui/progress';

interface Driver {
  id: string;
  name: string;
  rating: number;
  image?: { imageUrl?: string; imageHint?: string; };
}

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  show: { y: 0, opacity: 1, transition: { ease: 'easeOut', duration: 0.3 } },
};

export function DriverPerformance({ driverId }: { driverId: string }) {
    const firestore = useFirestore();
    const router = useRouter();

    const driverDocRef = useMemoFirebase(() => doc(firestore, 'drivers', driverId), [firestore, driverId]);
    const { data: driver, isLoading: driverLoading } = useDoc<Driver>(driverDocRef);

    const ridesQuery = useMemoFirebase(() => {
        if (!driverId) return null;
        return query(collection(firestore, 'rides'), where('driverId', '==', driverId), where('status', '==', 'completed'));
    }, [firestore, driverId]);
    const { data: rides, isLoading: ridesLoading } = useCollection<Ride>(ridesQuery);
    
    const isLoading = driverLoading || ridesLoading;

    const recentFeedback = rides?.filter(r => r.comment).slice(0, 5) ?? [];

    if (isLoading) {
        return (
            <div className="space-y-6">
                <Skeleton className="h-9 w-24" />
                <Skeleton className="h-40 w-full" />
                <div className="grid gap-4 md:grid-cols-2">
                    <Skeleton className="h-32 w-full" />
                    <Skeleton className="h-32 w-full" />
                </div>
                <Skeleton className="h-64 w-full" />
            </div>
        );
    }

    if (!driver) {
        return (
            <div>
                <Button variant="ghost" onClick={() => router.back()}><ArrowLeft className="mr-2 h-4 w-4" /> Back</Button>
                <div className="text-center py-10">Driver not found.</div>
            </div>
        );
    }
    
    return (
        <div className="space-y-6">
            <div className="flex items-center gap-4">
                <Button variant="ghost" size="icon" onClick={() => router.back()} className="-ml-2">
                    <ArrowLeft />
                </Button>
                <div>
                    <h1 className="font-headline text-2xl font-bold">Performance: {driver.name}</h1>
                    <p className="text-muted-foreground text-sm">An overview of driver ratings and feedback.</p>
                </div>
            </div>

            <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="show"
                className="grid gap-4 md:grid-cols-2 md:gap-8 lg:grid-cols-3"
            >
                <motion.div variants={itemVariants} className="md:col-span-2 lg:col-span-1">
                    <Card className="h-full flex flex-col">
                        <CardHeader>
                            <CardTitle>Overall Rating</CardTitle>
                             <CardDescription>Based on {rides?.length ?? 0} completed rides.</CardDescription>
                        </CardHeader>
                        <CardContent className="flex-1 flex flex-col items-center justify-center">
                            <div className="flex items-center gap-2">
                                <Star className="h-10 w-10 text-yellow-400 fill-yellow-400" />
                                <span className="text-5xl font-bold">{driver.rating.toFixed(1)}</span>
                            </div>
                            <p className="text-sm text-muted-foreground mt-2">Excellent</p>
                        </CardContent>
                    </Card>
                </motion.div>
                <motion.div variants={itemVariants}>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">
                            Acceptance Rate
                        </CardTitle>
                        <CheckCircle className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">92%</div>
                            <p className="text-xs text-muted-foreground">
                                46 of the last 50 ride requests accepted.
                            </p>
                            <Progress value={92} className="mt-2 h-2" />
                        </CardContent>
                    </Card>
                </motion.div>
                <motion.div variants={itemVariants}>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Cancellation Rate</CardTitle>
                            <XCircle className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">4%</div>
                            <p className="text-xs text-muted-foreground">
                                2 cancellations in the last 50 rides.
                            </p>
                            <Progress value={4} className="mt-2 h-2" />
                        </CardContent>
                    </Card>
                </motion.div>
            </motion.div>
            
            <motion.div variants={itemVariants}>
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2"><MessageSquare /> Recent Passenger Feedback</CardTitle>
                        <CardDescription>Here's what passengers are saying about their rides.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        {recentFeedback.map(feedback => (
                             <div key={feedback.id} className="flex gap-4">
                                <div className="flex items-center gap-1">
                                    <span className="font-bold text-lg">{feedback.rating}</span>
                                    <Star className="h-5 w-5 text-yellow-400 fill-yellow-400" />
                                </div>
                                <div className="flex-1 border-l pl-4">
                                    <p className="text-sm text-foreground">{feedback.comment}</p>
                                    <p className="text-xs text-muted-foreground mt-1">{format(feedback.startTime.toDate(), 'PPP')}</p>
                                </div>
                            </div>
                        ))}
                         {recentFeedback.length === 0 && (
                            <p className="text-muted-foreground text-center py-4">No written feedback yet.</p>
                         )}
                    </CardContent>
                </Card>
            </motion.div>
        </div>
    );
}
