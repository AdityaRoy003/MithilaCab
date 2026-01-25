'use client';

import { motion } from 'framer-motion';
import AppLayout from '@/components/app-layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { IndianRupee, Zap, ArrowLeft, Calendar, CheckCircle } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { useCollection, useFirestore, useMemoFirebase } from '@/firebase';
import { collection, query, where } from 'firebase/firestore';
import type { Incentive } from '@/lib/data';
import { Skeleton } from '@/components/ui/skeleton';

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

// Mock data for the chart
const weeklyData = [
  { name: 'Mon', earnings: 1200 },
  { name: 'Tue', earnings: 950 },
  { name: 'Wed', earnings: 1500 },
  { name: 'Thu', earnings: 1350 },
  { name: 'Fri', earnings: 2100 },
  { name: 'Sat', earnings: 2800 },
  { name: 'Sun', earnings: 2500 },
];

// Mock data for recent rides
const recentRides = [
    { id: 'r1', destination: 'Mithila University', fare: 120.50, date: '2024-07-28' },
    { id: 'r2', destination: 'DMCH Hospital', fare: 85.00, date: '2024-07-28' },
    { id: 'r3', destination: 'V2 Mall', fare: 150.75, date: '2024-07-27' },
    { id: 'r4', destination: 'Donar Chowk', fare: 95.25, date: '2024-07-27' },
];


export default function DriverEarningsPage() {
  const router = useRouter();
  const firestore = useFirestore();

  const incentivesQuery = useMemoFirebase(() => query(collection(firestore, 'incentives'), where('isActive', '==', true)), [firestore]);
  const { data: incentives, isLoading: incentivesLoading } = useCollection<Incentive>(incentivesQuery);


  return (
    <AppLayout>
        <main className="flex-1 flex flex-col p-4 md:p-6 lg:p-8 space-y-8">
            <div className="flex items-center gap-4">
                <Button variant="ghost" size="icon" onClick={() => router.back()} className="-ml-2">
                    <ArrowLeft />
                </Button>
                <h1 className="font-headline text-3xl font-bold">My Earnings</h1>
            </div>

             {/* Overview Cards */}
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
                        Today's Earnings
                    </CardTitle>
                    <IndianRupee className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                    <div className="text-2xl font-bold">₹875.50</div>
                    <p className="text-xs text-muted-foreground">
                        from 5 completed rides
                    </p>
                    </CardContent>
                </Card>
                </motion.div>
                <motion.div variants={itemVariants}>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                        This Week's Earnings
                    </CardTitle>
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                    <div className="text-2xl font-bold">₹9,950.00</div>
                    <p className="text-xs text-muted-foreground">
                       Next payout on Aug 5th
                    </p>
                    </CardContent>
                </Card>
                </motion.div>
                <motion.div variants={itemVariants}>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Active Incentives</CardTitle>
                    <Zap className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        {incentivesLoading ? <Skeleton className="h-8 w-20" /> : (
                            <>
                                <div className="text-2xl font-bold">{incentives?.length || 0} Programs</div>
                                <p className="text-xs text-muted-foreground">
                                    Live incentive programs for drivers
                                </p>
                            </>
                        )}
                    </CardContent>
                </Card>
                </motion.div>
            </motion.div>

            {/* Main Content Area */}
            <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="show"
                className="grid gap-4 md:gap-8 lg:grid-cols-5"
            >
                {/* Weekly Report Chart */}
                <motion.div variants={itemVariants} className="lg:col-span-3">
                <Card>
                    <CardHeader>
                    <CardTitle>Weekly Earnings</CardTitle>
                    <CardDescription>Your earnings over the last 7 days.</CardDescription>
                    </CardHeader>
                    <CardContent className="h-[350px] w-full">
                    <ResponsiveContainer>
                            <BarChart data={weeklyData}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="name" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                                <YAxis stroke="#888888" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `₹${value / 1000}k`} />
                                <Tooltip
                                    contentStyle={{ backgroundColor: 'hsl(var(--background))', border: '1px solid hsl(var(--border))' }}
                                    labelStyle={{ color: 'hsl(var(--foreground))' }}
                                    itemStyle={{ color: 'hsl(var(--primary))' }}
                                />
                                <Legend wrapperStyle={{fontSize: "12px"}}/>
                                <Bar dataKey="earnings" fill="hsl(var(--primary))" name="Total Earnings" radius={[4, 4, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>
                </motion.div>

                {/* Recent Payouts Table */}
                <motion.div variants={itemVariants} className="lg:col-span-2">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between">
                            <div>
                                <CardTitle>Recent Rides</CardTitle>
                                <CardDescription>Your last few completed rides.</CardDescription>
                            </div>
                            <Button size="sm" variant="outline">View All</Button>
                        </CardHeader>
                        <CardContent>
                        <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Ride</TableHead>
                                        <TableHead className="text-right">Fare</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {recentRides.map(ride => (
                                        <TableRow key={ride.id}>
                                            <TableCell>
                                                <div className="font-medium">To {ride.destination}</div>
                                                <div className="text-xs text-muted-foreground">{ride.date}</div>
                                            </TableCell>
                                            <TableCell className="text-right font-mono">₹{ride.fare.toFixed(2)}</TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                        </Table>
                        </CardContent>
                    </Card>
                </motion.div>
            </motion.div>

             {/* Incentives Section */}
            <motion.div variants={itemVariants}>
                <Card>
                    <CardHeader>
                        <div>
                            <CardTitle>Available Incentives</CardTitle>
                            <CardDescription>Earn more by completing these goals.</CardDescription>
                        </div>
                    </CardHeader>
                    <CardContent className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                        {incentivesLoading && Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-36" />)}
                         {!incentivesLoading && incentives && incentives.map(incentive => (
                            <Card key={incentive.id} className="bg-muted/30">
                                <CardHeader>
                                    <CardTitle className="text-lg">{incentive.title}</CardTitle>
                                    <CardDescription>{incentive.description}</CardDescription>
                                </CardHeader>
                                <CardContent>
                                     <p className="text-xl font-bold text-primary">
                                        Bonus: {incentive.bonusType === 'fixed' ? `₹${incentive.bonusAmount}` : `${incentive.bonusAmount}%`}
                                    </p>
                                    <p className="text-sm text-muted-foreground mt-2">Complete the goal to earn.</p>
                                </CardContent>
                            </Card>
                         ))}
                         {!incentivesLoading && (!incentives || incentives.length === 0) && (
                            <p className="text-muted-foreground col-span-3 text-center py-8">No active incentives right now.</p>
                         )}
                    </CardContent>
                </Card>
            </motion.div>

        </main>
    </AppLayout>
  );
}
