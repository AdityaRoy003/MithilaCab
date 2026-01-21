'use client';

import { motion } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, CarFront, Activity, IndianRupee, FileBadge, Map, FileDown, TrendingUp, Filter, Repeat } from 'lucide-react';
import { useCollection, useFirestore, useMemoFirebase } from '@/firebase';
import { collection, query, where, Timestamp } from 'firebase/firestore';
import type { Ride, Driver } from '@/lib/data';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

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


export default function AdminDashboardPage() {
    const firestore = useFirestore();

    const ridesQuery = useMemoFirebase(() => collection(firestore, 'rides'), [firestore]);
    const { data: allRides, isLoading: ridesLoading } = useCollection<Ride>(ridesQuery);

    const usersQuery = useMemoFirebase(() => collection(firestore, 'users'), [firestore]);
    const { data: allUsers, isLoading: usersLoading } = useCollection(usersQuery);

    const driversQuery = useMemoFirebase(() => collection(firestore, 'drivers'), [firestore]);
    const { data: allDrivers, isLoading: driversLoading } = useCollection<Driver>(driversQuery);

    const isLoading = ridesLoading || usersLoading || driversLoading;

    const completedRides = allRides?.filter(r => r.status === 'completed');
    const totalRevenue = completedRides?.reduce((sum, ride) => sum + (ride.fareAmount || 0), 0) ?? 0;
    const activeDrivers = allDrivers?.filter(d => d.isAvailable).length ?? 0;
    const unverifiedDrivers = allDrivers?.filter(d => !d.isVerified).length ?? 0;


  return (
    <div className="space-y-8">
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="show"
        className="grid gap-4 md:grid-cols-2 md:gap-8 lg:grid-cols-3"
      >
        <motion.div variants={itemVariants}>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total Revenue
              </CardTitle>
              <IndianRupee className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              {isLoading ? <Skeleton className='h-8 w-24' /> : (
                <div className="text-2xl font-bold">₹{totalRevenue.toFixed(2)}</div>
              )}
              <p className="text-xs text-muted-foreground">
                From {completedRides?.length ?? 0} completed rides
              </p>
            </CardContent>
          </Card>
        </motion.div>
        <motion.div variants={itemVariants}>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total Rides
              </CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              {isLoading ? <Skeleton className='h-8 w-16' /> : (
                <div className="text-2xl font-bold">{allRides?.length ?? 0}</div>
              )}
              <p className="text-xs text-muted-foreground">
                Across all statuses
              </p>
            </CardContent>
          </Card>
        </motion.div>
        <motion.div variants={itemVariants}>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Active Drivers
              </CardTitle>
              <CarFront className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
                {isLoading ? <Skeleton className='h-8 w-12' /> : (
                    <div className="text-2xl font-bold">{activeDrivers} / {allDrivers?.length ?? 0}</div>
                )}
              <p className="text-xs text-muted-foreground">
                Currently available for rides
              </p>
            </CardContent>
          </Card>
        </motion.div>
        <motion.div variants={itemVariants}>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Users</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
               {isLoading ? <Skeleton className='h-8 w-16' /> : (
                 <div className="text-2xl font-bold">{allUsers?.length ?? 0}</div>
               )}
              <p className="text-xs text-muted-foreground">
                Total registered passengers
              </p>
            </CardContent>
          </Card>
        </motion.div>
        <motion.div variants={itemVariants}>
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Verification Queue</CardTitle>
                    <FileBadge className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    {isLoading ? <Skeleton className='h-8 w-12' /> : (
                        <div className="text-2xl font-bold">{unverifiedDrivers}</div>
                    )}
                    <p className="text-xs text-muted-foreground">
                        Drivers pending verification
                    </p>
                </CardContent>
            </Card>
        </motion.div>
      </motion.div>

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="show"
        className="grid gap-4 md:gap-8 lg:grid-cols-2 xl:grid-cols-3"
      >
        <motion.div variants={itemVariants} className="xl:col-span-2">
            <Card>
                <CardHeader className='flex-row items-center justify-between'>
                    <div>
                        <CardTitle>Recent Rides</CardTitle>
                        <CardDescription>A list of the most recent rides across the platform.</CardDescription>
                    </div>
                    <Button asChild variant="outline">
                        <Link href="/admin/rides">View All</Link>
                    </Button>
                </CardHeader>
                <CardContent>
                    <div className="h-96 flex items-center justify-center text-muted-foreground border-2 border-dashed rounded-lg">
                        <p>Recent rides table coming soon.</p>
                    </div>
                </CardContent>
            </Card>
        </motion.div>
        <motion.div variants={itemVariants}>
            <Card>
                <CardHeader>
                    <CardTitle>Real-time Ride Heatmap</CardTitle>
                    <CardDescription>Visualize high-demand zones and driver locations.</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="h-96 flex items-center justify-center text-muted-foreground border-2 border-dashed rounded-lg">
                        <div className="text-center">
                            <Map className="h-12 w-12 mx-auto mb-2" />
                            <p>Ride heatmap feature coming soon.</p>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </motion.div>
      </motion.div>

       <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="show"
      >
        <h2 className="font-headline text-2xl font-bold mb-4">Analytics & Reporting</h2>
        <div className="grid gap-4 md:gap-8 grid-cols-1 lg:grid-cols-2 xl:grid-cols-4">
            <motion.div variants={itemVariants}>
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-base"><FileDown /> Custom Reports</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-sm text-muted-foreground">Export CSV/PDF of rides, users, and earnings data.</p>
                         <Button variant="outline" className="mt-4 w-full">Generate Report</Button>
                    </CardContent>
                </Card>
            </motion.div>
            <motion.div variants={itemVariants}>
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-base"><TrendingUp /> Trend Analysis</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-sm text-muted-foreground">Compare growth metrics over weeks or months.</p>
                        <Button variant="outline" className="mt-4 w-full">View Trends</Button>
                    </CardContent>
                </Card>
            </motion.div>
            <motion.div variants={itemVariants}>
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-base"><Filter /> Driver Onboarding Funnel</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-sm text-muted-foreground">Track conversion from signup to first ride.</p>
                        <Button variant="outline" className="mt-4 w-full">Analyze Funnel</Button>
                    </CardContent>
                </Card>
            </motion.div>
             <motion.div variants={itemVariants}>
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-base"><Repeat /> User Retention</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-sm text-muted-foreground">Monitor repeat ride behavior and user loyalty.</p>
                        <Button variant="outline" className="mt-4 w-full">View Dashboard</Button>
                    </CardContent>
                </Card>
            </motion.div>
        </div>
      </motion.div>
    </div>
  );
}
