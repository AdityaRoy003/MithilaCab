'use client';

import { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { useCollection, useFirestore, useMemoFirebase, addDocumentNonBlocking, useDoc } from '@/firebase';
import { collection, query, where, doc } from 'firebase/firestore';
import { format, subDays, startOfDay, eachDayOfInterval, isSameDay, getDay } from 'date-fns';

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
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { IndianRupee, Clock, Zap, Plus } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Skeleton } from '@/components/ui/skeleton';
import type { Ride, Driver, Incentive } from '@/lib/data';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useToast } from '@/hooks/use-toast';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

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

const incentiveSchema = z.object({
  title: z.string().min(3, { message: 'Title must be at least 3 characters.' }),
  description: z.string().min(10, { message: 'Description must be at least 10 characters.' }),
  bonusAmount: z.coerce.number().positive({ message: 'Bonus must be a positive number.' }),
  bonusType: z.enum(['fixed', 'percentage']),
});

interface PlatformSettings {
    commissionRate: number;
    currency: string;
}

export default function FinancePage() {
  const firestore = useFirestore();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { toast } = useToast();

  const settingsDocRef = useMemoFirebase(() => doc(firestore, 'settings', 'platform'), [firestore]);
  const { data: settings, isLoading: settingsLoading } = useDoc<PlatformSettings>(settingsDocRef);
  const COMMISSION_RATE = settings?.commissionRate ?? 0.20; // Fallback to default

  const ridesQuery = useMemoFirebase(
    () => query(collection(firestore, 'rides'), where('status', '==', 'completed')),
    [firestore]
  );
  const { data: completedRides, isLoading: ridesLoading } = useCollection<Ride>(ridesQuery);

  const driversQuery = useMemoFirebase(() => collection(firestore, 'drivers'), [firestore]);
  const { data: drivers, isLoading: driversLoading } = useCollection<Driver>(driversQuery);
  
  const incentivesQuery = useMemoFirebase(() => query(collection(firestore, 'incentives'), where('isActive', '==', true)), [firestore]);
  const { data: incentives, isLoading: incentivesLoading } = useCollection<Incentive>(incentivesQuery);

  const form = useForm<z.infer<typeof incentiveSchema>>({
    resolver: zodResolver(incentiveSchema),
    defaultValues: {
      title: "",
      description: "",
      bonusAmount: '' as any,
      bonusType: 'fixed',
    },
  });

  async function onIncentiveSubmit(values: z.infer<typeof incentiveSchema>) {
    const newIncentive = {
        ...values,
        isActive: true,
    };
    addDocumentNonBlocking(collection(firestore, 'incentives'), newIncentive);
    toast({ title: 'Incentive Created!', description: `${values.title} has been added.` });
    setIsDialogOpen(false);
    form.reset();
  }

  const driverMap = useMemo(() => {
    if (!drivers) return new Map();
    return new Map(drivers.map(d => [d.id, d]));
  }, [drivers]);

  const financialStats = useMemo(() => {
    if (!completedRides) return {
      todayRevenue: 0,
      thisWeeksEarnings: 0,
      weeklyData: Array(7).fill({ name: '...', revenue: 0, commission: 0 }),
      recentEarnings: []
    };

    const today = new Date();
    const startOfToday = startOfDay(today);

    // Today's Revenue
    const todayRevenue = completedRides
      .filter(ride => {
        const rideDate = ride.startTime?.toDate ? ride.startTime.toDate() : new Date(0);
        return rideDate >= startOfToday;
      })
      .reduce((sum, ride) => sum + ride.fareAmount, 0);

    // Weekly Data for Chart
    const last7Days = eachDayOfInterval({ start: subDays(today, 6), end: today });
    const weeklyData = last7Days.map(day => {
      const dayRides = completedRides.filter(ride => {
        const rideDate = ride.startTime?.toDate ? ride.startTime.toDate() : new Date(0);
        return isSameDay(rideDate, day);
      });
      const revenue = dayRides.reduce((sum, ride) => sum + ride.fareAmount, 0);
      const commission = revenue * COMMISSION_RATE;
      return {
        name: format(day, 'E'),
        revenue,
        commission,
      };
    });

    // Recent Driver Earnings
    const recentEarnings = completedRides
      .sort((a, b) => (b.startTime?.toDate ? b.startTime.toDate().getTime() : 0) - (a.startTime?.toDate ? a.startTime.toDate().getTime() : 0))
      .slice(0, 4)
      .map(ride => ({
        id: ride.id,
        driver: driverMap.get(ride.driverId!)?.name || 'Unknown Driver',
        amount: ride.fareAmount * (1 - COMMISSION_RATE),
        date: ride.startTime?.toDate ? format(ride.startTime.toDate(), 'yyyy-MM-dd') : 'N/A',
        status: 'Paid Out' // Mock status
      }));

    // This Week's Driver Earnings
    const weekStartsOn = 1; // Monday
    const dayOfWeek = getDay(today);
    const daysToSubtract = (dayOfWeek - weekStartsOn + 7) % 7;
    const startOfThisWeek = startOfDay(subDays(today, daysToSubtract));

    const thisWeeksEarnings = completedRides
      .filter(ride => {
        const rideDate = ride.startTime?.toDate ? ride.startTime.toDate() : new Date(0);
        return rideDate >= startOfThisWeek;
      })
      .reduce((sum, ride) => sum + (ride.fareAmount * (1 - COMMISSION_RATE)), 0);

    return {
      todayRevenue,
      thisWeeksEarnings,
      weeklyData,
      recentEarnings
    };
  }, [completedRides, driverMap, COMMISSION_RATE]);

  const isLoading = ridesLoading || driversLoading || incentivesLoading || settingsLoading;

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="font-headline text-3xl font-bold">Finance & Payouts</h1>
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
                Today's Revenue
              </CardTitle>
              <IndianRupee className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              {isLoading ? <Skeleton className="h-8 w-32" /> : (
                <>
                  <div className="text-2xl font-bold">₹{financialStats.todayRevenue.toFixed(2)}</div>
                  <p className="text-xs text-muted-foreground">
                    Based on completed rides today
                  </p>
                </>
              )}
            </CardContent>
          </Card>
        </motion.div>
        <motion.div variants={itemVariants}>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                This Week's Driver Earnings
              </CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
                {isLoading ? <Skeleton className="h-8 w-28" /> : (
                  <>
                    <div className="text-2xl font-bold">₹{financialStats.thisWeeksEarnings.toFixed(2)}</div>
                    <p className="text-xs text-muted-foreground">
                      Total earnings for all drivers this week
                    </p>
                  </>
                )}
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
               {isLoading ? <Skeleton className="h-8 w-20" /> : (
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
              <CardTitle>Weekly Report</CardTitle>
              <CardDescription>Total revenue and platform commission over the last 7 days.</CardDescription>
            </CardHeader>
            <CardContent className="h-[350px] w-full">
               {isLoading ? <Skeleton className="h-full w-full" /> : (
                <ResponsiveContainer>
                      <BarChart data={financialStats.weeklyData}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="name" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                          <YAxis stroke="#888888" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `₹${value / 1000}k`} />
                          <Tooltip
                              contentStyle={{ backgroundColor: 'hsl(var(--background))', border: '1px solid hsl(var(--border))' }}
                              labelStyle={{ color: 'hsl(var(--foreground))' }}
                              itemStyle={{ color: 'hsl(var(--foreground))' }}
                          />
                          <Legend wrapperStyle={{fontSize: "12px"}}/>
                          <Bar dataKey="revenue" fill="hsl(var(--primary))" name="Total Revenue" radius={[4, 4, 0, 0]} />
                          <Bar dataKey="commission" fill="hsl(var(--secondary))" name="Commission" radius={[4, 4, 0, 0]} />
                      </BarChart>
                  </ResponsiveContainer>
               )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Recent Driver Earnings Table */}
        <motion.div variants={itemVariants} className="lg:col-span-2">
            <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                    <div>
                        <CardTitle>Recent Driver Earnings</CardTitle>
                        <CardDescription>A log of recent ride earnings for drivers.</CardDescription>
                    </div>
                    <Button size="sm">View All</Button>
                </CardHeader>
                <CardContent>
                   {isLoading ? <Skeleton className="h-48 w-full" /> : (
                      <Table>
                          <TableHeader>
                              <TableRow>
                                  <TableHead>Driver</TableHead>
                                  <TableHead className="text-right">Earning</TableHead>
                                  <TableHead className="text-right">Status</TableHead>
                              </TableRow>
                          </TableHeader>
                          <TableBody>
                              {financialStats.recentEarnings.map(payout => (
                                  <TableRow key={payout.id}>
                                      <TableCell>
                                          <div className="font-medium">{payout.driver}</div>
                                          <div className="text-xs text-muted-foreground">{payout.date}</div>
                                      </TableCell>
                                      <TableCell className="text-right font-mono">₹{payout.amount.toFixed(2)}</TableCell>
                                      <TableCell className="text-right">
                                          <Badge variant={payout.status === 'Completed' ? 'default' : 'outline'}>{payout.status}</Badge>
                                      </TableCell>
                                  </TableRow>
                              ))}
                               {financialStats.recentEarnings.length === 0 && (
                                <TableRow>
                                    <TableCell colSpan={3} className="h-24 text-center">
                                        No recent earnings to display.
                                    </TableCell>
                                </TableRow>
                            )}
                          </TableBody>
                      </Table>
                   )}
                </CardContent>
            </Card>
        </motion.div>
      </motion.div>
      
      {/* Incentives Section */}
      <motion.div variants={itemVariants}>
        <Card>
            <CardHeader className="flex flex-row items-center justify-between">
                <div>
                    <CardTitle>Incentives & Bonuses</CardTitle>
                    <CardDescription>Manage special earnings programs for drivers.</CardDescription>
                </div>
                 <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                    <DialogTrigger asChild>
                        <Button size="sm"><Plus className="mr-2 h-4 w-4" /> Create Incentive</Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[425px]">
                        <DialogHeader>
                            <DialogTitle>Create New Incentive</DialogTitle>
                            <DialogDescription>
                                Define a new bonus program to motivate your drivers.
                            </DialogDescription>
                        </DialogHeader>
                        <Form {...form}>
                            <form onSubmit={form.handleSubmit(onIncentiveSubmit)} className="space-y-4 py-4">
                                <FormField
                                    control={form.control}
                                    name="title"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Title</FormLabel>
                                            <FormControl>
                                                <Input placeholder="e.g., Weekend Warrior" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="description"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Description</FormLabel>
                                            <FormControl>
                                                <Input placeholder="e.g., Complete 20 rides on Sat/Sun" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <div className="grid grid-cols-2 gap-4">
                                     <FormField
                                        control={form.control}
                                        name="bonusAmount"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Bonus</FormLabel>
                                                <FormControl>
                                                    <Input type="number" placeholder="e.g., 500" {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                     <FormField
                                        control={form.control}
                                        name="bonusType"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Type</FormLabel>
                                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                    <FormControl>
                                                        <SelectTrigger>
                                                            <SelectValue placeholder="Select a type" />
                                                        </SelectTrigger>
                                                    </FormControl>
                                                    <SelectContent>
                                                        <SelectItem value="fixed">Fixed (₹)</SelectItem>
                                                        <SelectItem value="percentage">Percentage (%)</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>
                                <DialogFooter>
                                    <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
                                    <Button type="submit">Create Incentive</Button>
                                </DialogFooter>
                            </form>
                        </Form>
                    </DialogContent>
                 </Dialog>
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
                        </CardContent>
                    </Card>
                 ))}
                 {!incentivesLoading && (!incentives || incentives.length === 0) && (
                    <p className="text-muted-foreground col-span-3 text-center py-8">No incentives created yet.</p>
                 )}
            </CardContent>
        </Card>
      </motion.div>

    </div>
  );
}
